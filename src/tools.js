import { DriverError } from './driver.js'

/**
 * Agent 用的电脑操控工具：每个工具就是一层转发，参数和 cua-driver 的同名工具一致（少了 session，由插件代填）。
 *
 * 为什么不让 Agent 直接在 bash 里调 cua-driver：bash 命令是一段文本，面板只能猜它在操作哪个窗口
 * （变量、脚本、循环里挑窗口都猜不准，2026-11-01 两轮审查）。工具参数是结构化的，pid 和 window_id 直接就在调用里。
 *
 * 只走后台投递（cua-driver 默认的 background）：不抢前台、不动用户的鼠标。需要前台的操作这里不提供。
 * 截图：get_window_state 的 PNG 存成附件随结果交给模型（和 read_image 一样），不写临时文件、不进投影。
 */

/** 截图长边上限（cua-driver 默认 1568，和多数模型的图片上限一致） */
const SHOT_EDGE = 1568
/** 界面树给模型的最多字数（Electron 应用的树能有几十万字） */
const MAX_TREE_CHARS = 40_000

const PID = { type: 'integer', description: 'Target process id, from computer_list_windows or computer_launch_app.' }
const WINDOW_ID = { type: 'integer', description: 'Target window id, from computer_list_windows.' }
const ELEMENT_INDEX = { type: 'integer', description: 'element_index from the latest computer_get_window_state of this window (the [N] in its tree).' }
const SNAPSHOT_ID = { type: 'string', description: 'snapshot_id the element_index came from. Defaults to the latest snapshot of this window in this conversation.' }
const PX = (axis) => ({ type: 'number', description: `${axis} in pixels of the latest screenshot of this window (top-left origin). Use only when no element fits.` })
/** type_text / press_key 的坐标：cua-driver 先在这一点点一下聚焦，再输入（网页、Electron 的输入框后台按元素输入会被拒绝，它会让改用坐标）。y 只写「见 x」，每次请求都要发，不重复一遍 */
const FOCUS_X = { type: 'number', description: 'X in screenshot pixels of the field to click first, instead of element_index. Use it for web or Electron fields when typing by element is refused. Pass with y.' }
const FOCUS_Y = { type: 'number', description: 'Y in screenshot pixels (see x).' }
const FOREGROUND = { type: 'boolean', description: 'Only if background failed: shows a banner, briefly fronts the window, then restores focus.' }
const FOREGROUND_REF = { type: 'boolean', description: 'See computer_click.' }

/** cua-driver 的提示里让用 delivery_mode:"foreground" 时补的一句：这组工具没有 delivery_mode 参数名，改用 x/y 或 foreground:true */
const NO_FOREGROUND = 'Note: these tools have no delivery_mode. For a web or Electron field pass its x/y first; set foreground: true only if background still fails.'
// 报错原文是 JSON，引号是转义过的（delivery_mode:\"foreground\"），反斜杠也要认
const mentionsForeground = (/** @type {string} */ text) => /delivery_mode\s*:\s*\\?"?foreground/i.test(text)

const RESULT_OUTPUT = {
  schema: { type: 'object' },
  render: (/** @type {unknown} */ _args, /** @type {any} */ value) => [{ type: 'text', text: actionText(value) }],
}

/**
 * 按参数 schema 查一遍（DSH 只替 defineTool 包装的工具查参数，tools.register 直接交给 execute，2026-11-02 审查）。
 * 不查的话错的值会被悄悄丢掉、照常执行：button:"middle" 成了左键，字符串的 element_index 被丢掉、字打进了当前焦点。
 * 只支持这组工具用到的写法：object / string / integer / number / boolean / array、enum、required、additionalProperties:false。
 * 可选参数传 null 当没传（有的模型会这样写，当没传不会做错事）
 * @param {any} schema
 * @param {unknown} value
 * @param {string} [path]
 * @returns {string[]}
 */
export function argViolations(schema, value, path = '') {
  const at = path === '' ? 'arguments' : `"${path}"`
  switch (schema.type) {
    case 'object': {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) return [`${at} must be an object`]
      const object = /** @type {Record<string, unknown>} */ (value)
      const required = Array.isArray(schema.required) ? schema.required : []
      /** @type {string[]} */
      const out = []
      for (const key of required) if (object[key] === undefined || object[key] === null) out.push(`missing required "${path === '' ? key : `${path}.${key}`}"`)
      for (const [key, v] of Object.entries(object)) {
        const sub = schema.properties?.[key]
        const name = path === '' ? key : `${path}.${key}`
        if (sub === undefined) {
          if (schema.additionalProperties === false) out.push(`unknown parameter "${name}"`)
          continue
        }
        if (v === undefined || (v === null && !required.includes(key))) continue
        out.push(...argViolations(sub, v, name))
      }
      return out
    }
    case 'array': {
      if (!Array.isArray(value)) return [`${at} must be an array`]
      return schema.items === undefined ? [] : value.flatMap((v, i) => argViolations(schema.items, v, `${path}[${i}]`))
    }
    case 'string':
    case 'integer':
    case 'number':
    case 'boolean': {
      const ok = schema.type === 'integer' ? Number.isSafeInteger(value)
        : schema.type === 'number' ? typeof value === 'number' && Number.isFinite(value)
          : typeof value === schema.type
      if (!ok) return [`${at} must be ${schema.type === 'integer' ? 'an integer' : `a ${schema.type}`}`]
      if (Array.isArray(schema.enum) && !schema.enum.includes(value)) return [`${at} must be one of ${schema.enum.map((/** @type {unknown} */ e) => JSON.stringify(e)).join(', ')}`]
      return []
    }
    default:
      return []
  }
}

/**
 * 动作结果给模型看的文字：一行摘要。cua-driver 成功时的 JSON 只有投递方式、路径和一句 summary，
 * 原样给是每次约 270 字，会留在对话历史里一直重发。失败不走这里（原文当错误给）。
 * 动作发出去不等于做成了：没法确认时提醒一句，但不要求每次点击后都去读窗口（一串点完再读一次就行）。
 *
 * summary 里 cua-driver 会建议「没成功就用 delivery_mode:"foreground" 重试」（2026-11-02 真机 type_text），
 * 这组工具没有这个参数，Agent 照做只会报错白走一步，所以把那半句去掉
 * @param {Record<string, unknown>} value
 */
export function actionText(value) {
  const raw = typeof value.summary === 'string' && value.summary !== '' ? value.summary : 'Done.'
  const summary = raw.replace(/[,;]?\s*(and\s+)?re-?call with delivery_mode\s*:\s*"?foreground"?[^.;—]*/gi, '').replace(/\s+([.;])/g, '$1').trim()
  const verify = value.effect === 'unverifiable' || value.effect === undefined ? ' (not verified; check the window when the sequence is done)' : ''
  // 别的说法（「Retry this action with delivery_mode:"foreground"」等）删不干净：不硬删，补一句这组工具里该怎么办
  const note = mentionsForeground(summary) ? ` ${NO_FOREGROUND}` : ''
  return `${summary}${verify}${note}`
}

/**
 * cua-driver 报错给 Agent 的文字：原文照给；里面让用前台投递的，补一句这组工具里该怎么办
 * @param {string} message
 */
export function errorText(message) {
  return mentionsForeground(message) ? `${message}\n${NO_FOREGROUND}` : message
}

/**
 * 窗口列表只留模型用得上的：普通层、在屏幕上（或指定了 pid）、不是菜单栏那种细条
 * @param {any} listed
 * @param {boolean} all
 */
export function compactWindows(listed, all) {
  const windows = Array.isArray(listed?.windows) ? listed.windows : []
  return windows
    .filter((/** @type {any} */ w) => (w?.layer === 0 || w?.layer === undefined) && typeof w.pid === 'number' && typeof w.window_id === 'number'
      && (all || w.is_on_screen === true) && (w.bounds?.width ?? 0) >= 80 && (w.bounds?.height ?? 0) >= 80
      && !/^(Cua Driver|CursorUIViewService)$/.test(String(w.app_name ?? '')))
    .map((/** @type {any} */ w) => ({
      pid: w.pid,
      window_id: w.window_id,
      app_name: String(w.app_name ?? ''),
      title: String(w.title ?? ''),
      on_screen: w.is_on_screen === true,
      bounds: { x: w.bounds.x, y: w.bounds.y, width: w.bounds.width, height: w.bounds.height },
    }))
}

/**
 * 去掉界面树里的应用菜单栏（顶层的 `- [N] AXMenuBar ...` 和它下面缩进的整段）。
 * 计算器的树 86% 是菜单栏，DSH 窗口 29%（2026-11-02 实测）；点按钮、输入用不到，却会留在对话历史里，后面每一步都要重发。
 * 元素编号不重排：去掉的只是这几行，其余 [N] 照旧能用。
 *
 * 只认顶格的那个：缩进的 AXMenuBar 是窗口里的菜单（比如网页里 role=menubar），是要点的内容，不去掉。
 * 不以「- 」开头的行是上一行属性的折行（计算器工具栏的 actions 就折了四行），跟着上一行走，不当成菜单栏结束（2026-11-02 审查）
 * @param {string} tree cua-driver 的 tree_markdown
 * @returns {{ tree: string, removed: number }} removed = 去掉了多少个可操作的菜单项
 */
export function withoutMenuBar(tree) {
  const lines = tree.split('\n')
  const out = []
  let removed = 0
  let skipping = false
  for (const line of lines) {
    const row = /^\s*- /.test(line)
    if (skipping) {
      if (!row && line.trim() !== '') continue
      if (row && /^\s/.test(line)) {
        if (/^\s*- \[\d+\]/.test(line)) removed++
        continue
      }
      skipping = false
    }
    if (/^- \[\d+\] AXMenuBar\b/.test(line)) {
      skipping = true
      removed++
      continue
    }
    out.push(line)
  }
  return { tree: out.join('\n'), removed }
}

/**
 * get_window_state 给模型看的文字（截图另外作为图片块）
 * @param {any} value
 */
export function stateText(value) {
  const lines = [
    `app: ${value.app_name ?? ''}  window: "${value.window_title ?? ''}"  pid=${value.pid} window_id=${value.window_id}`,
    `snapshot_id: ${value.snapshot_id}`,
  ]
  if (value.screenshot !== undefined) {
    const s = value.screenshot
    lines.push(`screenshot: ${s.width}x${s.height} px (pass x/y in these pixels)`)
  } else if (value.screenshot_note !== undefined) {
    lines.push(`screenshot: ${value.screenshot_note}`)
  }
  if (value.truncated === true) {
    // 超时截断时 query 没用（实测 DSH 窗口 timeout_ms 100 加了 query 也照样截断），要给更长的 timeout_ms
    lines.push(value.truncation_reason === 'timeout'
      ? 'note: the tree is partial because the walk timed out; call again with a larger timeout_ms (for example 5000) if the element you need is missing.'
      : 'note: the tree is partial; narrow it with `query` if the element you need is missing.')
  }
  if (typeof value.menu_items_hidden === 'number' && value.menu_items_hidden > 0) {
    // 后台应用的菜单项不该点（可能是灰的），cua-driver 的说明要用 invoke_menu 按路径执行
    lines.push(`note: the app menu bar (${value.menu_items_hidden} items) is hidden. To run a menu command, use \`cua-driver call invoke_menu\` in bash with its menu path rather than clicking menu items; include_menu_bar: true shows the item names.`)
  }
  lines.push('', 'Act on an element by passing its [N] as element_index. Text without [N] is read-only.', '', value.tree)
  return lines.join('\n')
}

/**
 * @param {any} ctx
 * @param {{
 *   driver: import('./driver.js').Driver,
 *   labelOf: (sessionId: string) => string,
 *   onClick?: (sessionId: string) => void,
 *   withAppAccess?: <T>(target: { pid?: number, bundleId?: string, name?: string }, exec: any, fn: (signal?: AbortSignal) => Promise<T>) => Promise<T>,
 *   runForeground?: <T>(sessionId: string, pid: number, signal: AbortSignal | undefined, fn: () => Promise<T>) => Promise<T>,
 * }} deps
 */
export function registerComputerTools(ctx, deps) {
  const { driver, labelOf, onClick, withAppAccess, runForeground } = deps
  /** @type {<T>(target: { pid?: number, bundleId?: string, name?: string }, exec: any, fn: (signal?: AbortSignal) => Promise<T>) => Promise<T>} */
  const guard = withAppAccess ?? ((_target, exec, fn) => fn(exec?.signal))
  /** @type {<T>(sessionId: string, pid: number, signal: AbortSignal | undefined, fn: () => Promise<T>) => Promise<T>} */
  const withFg = runForeground ?? ((_s, _p, _sig, fn) => fn())
  /** 每个对话、每个窗口最近一次的 snapshot_id（element_index 默认用它） */
  const snapshots = new Map()
  const snapKey = (/** @type {string} */ s, /** @type {number} */ pid, /** @type {number} */ wid) => `${s}\u0000${pid}\u0000${wid}`

  /** @param {any} exec */
  const sessionOf = (exec) => {
    const id = exec?.agent?.session?.id
    if (typeof id !== 'string' || id === '') throw new Error('computer tools need a conversation')
    return id
  }

  /**
   * element_index 补上 snapshot_id；坐标和元素都没给就报错
   * @param {any} args
   * @param {string} session
   * @param {boolean} needTarget
   */
  const targetArgs = (args, session, needTarget) => {
    /** @type {Record<string, unknown>} */
    const out = { pid: args.pid, window_id: args.window_id }
    if ((typeof args.x === 'number') !== (typeof args.y === 'number')) throw new Error('Pass both x and y, or neither.')
    if (typeof args.element_index === 'number') {
      const snapshot = typeof args.snapshot_id === 'string' && args.snapshot_id !== ''
        ? args.snapshot_id
        : snapshots.get(snapKey(session, args.pid, args.window_id))
      if (snapshot === undefined) throw new Error('No snapshot of this window yet. Call computer_get_window_state for it first, then use an element_index from that result.')
      out.element_index = args.element_index
      out.snapshot_id = snapshot
    } else if (typeof args.x === 'number' && typeof args.y === 'number') {
      out.x = args.x
      out.y = args.y
    } else if (needTarget) {
      throw new Error('Pass element_index (preferred) or both x and y.')
    }
    return out
  }

  /**
   * 转发一次，cua-driver 的错误原样当工具错误给模型
   * @param {string} tool
   * @param {Record<string, unknown>} args
   * @param {any} exec
   * @param {number} [timeout]
   * @param {AbortSignal} [signal]
   */
  const forward = async (tool, args, exec, timeout, signal) => {
    const session = sessionOf(exec)
    try {
      return await driver.call(tool, args, { signal: signal ?? exec?.signal, label: labelOf(session), ...(timeout === undefined ? {} : { timeout }) })
    } catch (error) {
      if (error instanceof DriverError) throw new Error(errorText(error.message))
      throw error
    }
  }

  ctx.inject(['tools'], (/** @type {any} */ scope) => {
    /** 注册前包一层参数校验：不合 schema 直接报错给 Agent，不带着错的值去点 */
    const tools = {
      register: (/** @type {any} */ definition) => scope.tools.register({
        ...definition,
        async execute(/** @type {any} */ args, /** @type {any} */ exec) {
          const problems = argViolations(definition.parameters, args)
          if (problems.length > 0) throw new Error(`Invalid arguments for ${definition.name}: ${problems.join('; ')}.`)
          return definition.execute(args, exec)
        },
      }),
    }

    tools.register({
      name: 'computer_list_windows',
      description: 'List top-level windows of running macOS apps with their pid and window_id. Start here to find the window to operate. By default only windows on the current screen are listed.',
      parameters: {
        type: 'object',
        properties: {
          pid: { type: 'integer', description: 'Only this process. Also lists its off-screen windows.' },
        },
        additionalProperties: false,
      },
      output: {
        schema: { type: 'object', properties: { windows: { type: 'array' } }, required: ['windows'] },
        // 紧凑 JSON：缩进版多约 35% 字数，而且留在历史里每一步都重发
        render: (/** @type {unknown} */ _a, /** @type {any} */ v) => [{ type: 'text', text: v.windows.length === 0 ? 'No matching windows.' : JSON.stringify(v.windows) }],
      },
      isConcurrencySafe: () => true,
      async execute(/** @type {any} */ args, /** @type {any} */ exec) {
        const listed = await forward('list_windows', typeof args.pid === 'number' ? { pid: args.pid } : { on_screen_only: true }, exec)
        return { windows: compactWindows(listed, typeof args.pid === 'number') }
      },
    })

    tools.register({
      name: 'computer_launch_app',
      description: 'Launch (or find the running instance of) a macOS app in the background without bringing it to the front. Returns its pid and, when ready, its windows with window_id; call computer_list_windows only if no window is listed.',
      parameters: {
        type: 'object',
        properties: {
          bundle_id: { type: 'string', description: 'App bundle id, for example com.apple.calculator. Preferred.' },
          name: { type: 'string', description: 'App display name, used only when bundle_id is absent.' },
        },
        additionalProperties: false,
      },
      output: RESULT_OUTPUT_LAUNCH(),
      async execute(/** @type {any} */ args, /** @type {any} */ exec) {
        if (typeof args.bundle_id !== 'string' && typeof args.name !== 'string') throw new Error('Pass bundle_id or name.')
        const selector = typeof args.bundle_id === 'string' ? { bundleId: args.bundle_id } : { name: args.name }
        const launched = await guard(selector, exec, signal =>
          forward('launch_app', typeof args.bundle_id === 'string' ? { bundle_id: args.bundle_id } : { name: args.name }, exec, 60_000, signal),
        )
        return {
          pid: typeof launched.pid === 'number' ? launched.pid : null,
          name: String(launched.name ?? ''),
          bundle_id: String(launched.bundle_id ?? args.bundle_id ?? ''),
          // 和 computer_list_windows 同样的筛法、同样的形状：有窗口就直接给，Agent 不用再列一次
          windows: compactWindows(launched, true),
        }
      },
    })

    tools.register({
      name: 'computer_get_window_state',
      description: 'Observe one window: its accessibility tree (actionable elements numbered [N]) and a screenshot. Element numbers stay valid until you call this again for the same window, so read once, then act with as many calls as you need, and read again only to verify the result or after the window changed. The app menu bar is left out unless include_menu_bar is true.',
      parameters: {
        type: 'object',
        properties: {
          pid: PID,
          window_id: WINDOW_ID,
          query: { type: 'string', description: 'Only rows containing this text (case-insensitive), plus their parents. Element numbers stay the same.' },
          include_screenshot: { type: 'boolean', description: 'Default true. Set false when you only need fresh element numbers or the text of the tree.' },
          include_menu_bar: { type: 'boolean', description: 'Default false: the app menu bar is left out of the tree. Set true only to see the menu item names.' },
          timeout_ms: { type: 'integer', description: 'Time budget for reading the tree, 100 to 120000 ms (default 1000). Raise it only when a result says the walk timed out.' },
        },
        required: ['pid', 'window_id'],
        additionalProperties: false,
      },
      output: {
        schema: {
          type: 'object',
          properties: {
            pid: { type: 'integer' },
            window_id: { type: 'integer' },
            app_name: { type: 'string' },
            window_title: { type: 'string' },
            snapshot_id: { type: 'string' },
            tree: { type: 'string' },
            truncated: { type: 'boolean' },
            truncation_reason: { type: 'string' },
            menu_items_hidden: { type: 'integer' },
            screenshot: { type: 'object' },
            screenshot_note: { type: 'string' },
          },
          required: ['pid', 'window_id', 'snapshot_id', 'tree'],
        },
        render: (/** @type {unknown} */ _a, /** @type {any} */ v) => {
          const blocks = [{ type: 'text', text: stateText(v) }]
          if (v.screenshot !== undefined) blocks.push({ type: 'image', attachment: v.screenshot.attachment })
          return blocks
        },
        presentationMeta: (/** @type {unknown} */ _a, /** @type {any} */ v) => ({ pid: v.pid, windowId: v.window_id, appName: v.app_name ?? '' }),
      },
      async execute(/** @type {any} */ args, /** @type {any} */ exec) {
        const session = sessionOf(exec)
        return guard({ pid: args.pid }, exec, async (signal) => {
          const wantShot = args.include_screenshot !== false
          const attachments = wantShot ? ctx.get?.('attachments') : undefined
          const shotOk = wantShot && attachments !== undefined && await modelTakesImages(ctx, { ...exec, signal })
          /** @type {Record<string, unknown>} */
          const request = { pid: args.pid, window_id: args.window_id, include_screenshot: shotOk }
          if (shotOk) request.max_image_dimension = SHOT_EDGE
          const query = typeof args.query === 'string' && args.query !== '' ? args.query : undefined
          if (query !== undefined) request.query = query
          // cua-driver 收 100～120000；超出范围先夹住，不让一次读树卡太久或报参数错
          if (typeof args.timeout_ms === 'number') request.timeout_ms = Math.min(120_000, Math.max(100, args.timeout_ms))
          // 树读得越久，命令行那边也要等得越久
          const state = await forward('get_window_state', request, exec, 60_000 + (typeof request.timeout_ms === 'number' ? request.timeout_ms : 0), signal)
          const snapshot = String(state.snapshot_id ?? '')
          if (snapshot !== '') snapshots.set(snapKey(session, args.pid, args.window_id), snapshot)
          let tree = String(state.tree_markdown ?? '')
          let menuHidden = 0
          // 用了 query 时树已经只剩匹配的行，菜单栏里的匹配项说明 Agent 正在找它，不去掉（空的 query 不算用了）
          if (args.include_menu_bar !== true && query === undefined) {
            const trimmed = withoutMenuBar(tree)
            tree = trimmed.tree
            menuHidden = trimmed.removed
          }
          if (tree.length > MAX_TREE_CHARS) tree = `${tree.slice(0, MAX_TREE_CHARS)}\n… (tree cut at ${MAX_TREE_CHARS} characters; use query to narrow it)`
          /** @type {Record<string, unknown>} */
          const value = {
            pid: args.pid,
            window_id: args.window_id,
            app_name: String(state.app_name ?? ''),
            window_title: String(state.window_title ?? ''),
            snapshot_id: snapshot,
            tree,
            truncated: state.truncated === true,
            ...(state.truncated === true && typeof state.truncation_reason === 'string' ? { truncation_reason: state.truncation_reason } : {}),
            ...(menuHidden > 0 ? { menu_items_hidden: menuHidden } : {}),
          }
          const b64 = typeof state.screenshot_png_b64 === 'string' ? state.screenshot_png_b64 : undefined
          if (shotOk && b64 !== undefined && b64 !== '') {
            const ref = await attachments.saveImage({ data: Buffer.from(b64, 'base64'), mediaType: 'image/png', name: `window-${args.window_id}.png` })
            const width = Number(state.screenshot_width ?? ref.width)
            const height = Number(state.screenshot_height ?? ref.height)
            value.screenshot = {
              width,
              height,
              attachment: {
                attachmentId: ref.attachmentId,
                mediaType: ref.mediaType,
                bytes: ref.bytes,
                width: ref.width,
                height: ref.height,
                ...(ref.name === undefined ? {} : { name: ref.name }),
                ...(ref.originalDimensions === undefined ? {} : { originalDimensions: { ...ref.originalDimensions } }),
              },
            }
          } else if (wantShot) {
            value.screenshot_note = shotOk ? 'not available for this window (use the tree)' : 'skipped: the current model does not take images, or image storage is unavailable'
          }
          return value
        })
      },
    })

    tools.register({
      name: 'computer_click',
      description: 'Click in a window without bringing it to the front. Prefer element_index from the latest computer_get_window_state; use x/y screenshot pixels only when no element fits. When you already know a sequence (for example several buttons), send all the clicks in one step; they run in order.',
      parameters: {
        type: 'object',
        properties: {
          pid: PID,
          window_id: WINDOW_ID,
          element_index: ELEMENT_INDEX,
          snapshot_id: SNAPSHOT_ID,
          x: PX('X'),
          y: PX('Y'),
          button: { type: 'string', enum: ['left', 'right'], description: 'Default left.' },
          count: { type: 'integer', description: 'Click count, 2 for a double-click. Default 1.' },
          foreground: FOREGROUND,
        },
        required: ['pid', 'window_id'],
        additionalProperties: false,
      },
      output: RESULT_OUTPUT,
      async execute(/** @type {any} */ args, /** @type {any} */ exec) {
        const session = sessionOf(exec)
        const request = targetArgs(args, session, true)
        const count = typeof args.count === 'number' ? args.count : 1
        if (count < 1 || count > 3) throw new Error('Invalid arguments for computer_click: "count" must be 1, 2, or 3.')
        // 按元素双击：cua-driver 的 click 会忽略 element_index 上的 count，改走 double_click（优先 AXOpen，没有就点元素中心两次）
        const useDoubleClick = request.element_index !== undefined && count > 1
        if (useDoubleClick) {
          if (count !== 2) throw new Error('computer_click: triple-click requires x and y coordinates.')
          if (args.button === 'right') throw new Error('computer_click: double-click on element_index supports only the left button.')
        } else {
          if (args.button === 'right') request.button = 'right'
          if (typeof args.count === 'number' && request.x !== undefined) request.count = args.count
        }
        const fg = args.foreground === true
        if (fg) request.delivery_mode = 'foreground'
        const toolName = useDoubleClick ? 'double_click' : 'click'
        const result = await guard({ pid: args.pid }, exec, signal =>
          fg
            ? withFg(session, args.pid, signal, () => forward(toolName, request, exec, undefined, signal))
            : forward(toolName, request, exec, undefined, signal),
        )
        // 面板据此出一圈点击涟漪（比轮询光标动画状态猜准）
        onClick?.(session)
        return result
      },
    })

    tools.register({
      name: 'computer_type_text',
      description: 'Insert text into a window without bringing it to the front: into the given element, at the given x/y field, or at the current focus. Does not press Return; use computer_press_key for that.',
      parameters: {
        type: 'object',
        properties: {
          pid: PID,
          window_id: WINDOW_ID,
          text: { type: 'string', description: 'Text to insert.' },
          element_index: ELEMENT_INDEX,
          snapshot_id: SNAPSHOT_ID,
          x: FOCUS_X,
          y: FOCUS_Y,
          foreground: FOREGROUND_REF,
        },
        required: ['pid', 'window_id', 'text'],
        additionalProperties: false,
      },
      output: RESULT_OUTPUT,
      async execute(/** @type {any} */ args, /** @type {any} */ exec) {
        const session = sessionOf(exec)
        // x/y：cua-driver 先在这一点点一下聚焦再输入（网页、Electron 输入框按元素后台输入会被拒）
        const request = targetArgs(args, session, false)
        const fg = args.foreground === true
        const payload = { ...request, text: args.text, ...(fg ? { delivery_mode: 'foreground' } : {}) }
        return guard({ pid: args.pid }, exec, signal =>
          fg
            ? withFg(session, args.pid, signal, () => forward('type_text', payload, exec, undefined, signal))
            : forward('type_text', payload, exec, undefined, signal),
        )
      },
    })

    tools.register({
      name: 'computer_press_key',
      description: 'Press one key, optionally with modifiers (a shortcut such as cmd+a), in a window without bringing it to the front: to the given element, the given x/y field, or the current focus.',
      parameters: {
        type: 'object',
        properties: {
          pid: PID,
          window_id: WINDOW_ID,
          key: { type: 'string', description: 'Key name: return, tab, escape, delete, up, down, left, right, space, a letter, a digit, f1…' },
          modifiers: { type: 'array', items: { type: 'string', enum: ['cmd', 'shift', 'option', 'ctrl', 'fn'] }, description: 'Modifier keys held during the press.' },
          element_index: ELEMENT_INDEX,
          snapshot_id: SNAPSHOT_ID,
          x: FOCUS_X,
          y: FOCUS_Y,
          foreground: FOREGROUND_REF,
        },
        required: ['pid', 'window_id', 'key'],
        additionalProperties: false,
      },
      output: RESULT_OUTPUT,
      async execute(/** @type {any} */ args, /** @type {any} */ exec) {
        const session = sessionOf(exec)
        const request = targetArgs(args, session, false)
        const fg = args.foreground === true
        const payload = {
          ...request,
          key: args.key,
          ...(Array.isArray(args.modifiers) && args.modifiers.length > 0 ? { modifiers: args.modifiers } : {}),
          ...(fg ? { delivery_mode: 'foreground' } : {}),
        }
        return guard({ pid: args.pid }, exec, signal =>
          fg
            ? withFg(session, args.pid, signal, () => forward('press_key', payload, exec, undefined, signal))
            : forward('press_key', payload, exec, undefined, signal),
        )
      },
    })

    tools.register({
      name: 'computer_scroll',
      description: 'Scroll a window, or the element / point under it, without bringing it to the front.',
      parameters: {
        type: 'object',
        properties: {
          pid: PID,
          window_id: WINDOW_ID,
          direction: { type: 'string', enum: ['up', 'down', 'left', 'right'] },
          amount: { type: 'integer', description: 'Number of wheel notches. Default 3.' },
          element_index: ELEMENT_INDEX,
          snapshot_id: SNAPSHOT_ID,
          x: PX('X'),
          y: PX('Y'),
          foreground: FOREGROUND_REF,
        },
        required: ['pid', 'window_id', 'direction'],
        additionalProperties: false,
      },
      output: RESULT_OUTPUT,
      async execute(/** @type {any} */ args, /** @type {any} */ exec) {
        const session = sessionOf(exec)
        const request = targetArgs(args, session, false)
        const fg = args.foreground === true
        const payload = {
          ...request,
          direction: args.direction,
          amount: typeof args.amount === 'number' ? args.amount : 3,
          ...(fg ? { delivery_mode: 'foreground' } : {}),
        }
        return guard({ pid: args.pid }, exec, signal =>
          fg
            ? withFg(session, args.pid, signal, () => forward('scroll', payload, exec, undefined, signal))
            : forward('scroll', payload, exec, undefined, signal),
        )
      },
    })
  })

  return {
    /** 对话被删、插件卸载：忘掉这个对话的 snapshot */
    forget(/** @type {string} */ session) {
      for (const key of snapshots.keys()) if (key.startsWith(`${session}\u0000`)) snapshots.delete(key)
    },
  }
}

function RESULT_OUTPUT_LAUNCH() {
  return {
    schema: {
      type: 'object',
      properties: { pid: { oneOf: [{ type: 'integer' }, { type: 'null' }] }, name: { type: 'string' }, bundle_id: { type: 'string' }, windows: { type: 'array' } },
      required: ['pid', 'name', 'bundle_id', 'windows'],
    },
    render: (/** @type {unknown} */ _a, /** @type {any} */ v) => [{ type: 'text', text: launchText(v) }],
  }
}

/**
 * 启动结果给模型的文字：cua-driver 已经带回窗口就直接列出来（省一次 computer_list_windows）
 * @param {{ pid: number | null, name: string, bundle_id: string, windows: any[] }} v
 */
export function launchText(v) {
  const app = v.name || v.bundle_id
  if (v.pid === null) return `Launched ${app}, but the driver reported no pid. Find it with computer_list_windows.`
  if (v.windows.length === 0) return `${app} is running as pid ${v.pid}. Its window is not ready yet: call computer_list_windows with pid ${v.pid} to get the window_id.`
  return `${app} is running as pid ${v.pid}. Windows: ${JSON.stringify(v.windows)}`
}

/**
 * 当前模型收不收图片：和 read_image 同一套判断，模型声明了收图才给（给不收图的模型发图片，请求会被服务商拒掉）。
 * 判断不了也当不收，只给界面树
 * @param {any} ctx
 * @param {any} exec
 */
export async function modelTakesImages(ctx, exec) {
  try {
    const routed = exec?.agent?.session?.requestHeader?.()?.config
    const provider = routed?.provider ?? exec?.agent?.options?.provider
    const model = routed?.model ?? exec?.agent?.options?.model
    const llm = ctx.get?.('llm')
    if (provider === undefined || model === undefined || llm === undefined) return false
    const info = await llm.resolveModelInfo(provider, model, exec.signal)
    return Array.isArray(info?.inputModalities) && info.inputModalities.includes('image')
  } catch {
    return false
  }
}
