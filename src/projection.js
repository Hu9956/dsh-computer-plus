/**
 * 会话投影：这个对话里 Agent 正在操控（或最后操控过）的窗口。面板只读它，不猜。
 *
 * 目标完全来自 Agent 调 computer_* 工具时传的 pid 和 window_id（结构化参数，不解析命令文本）；
 * 工具结果的 presentationMeta 补上应用名。截图本身不进投影、不进会话日志。
 *
 * 事件：
 * - tool/call（computer_* 里操作窗口的工具）→ 目标换成这一次的窗口，标为操控中（调用一开始就切，面板不慢一步）
 * - tool/result（同一个 callId）→ 补应用名；调用失败而且换过窗口 → 退回上一个窗口
 *   （传错的 pid、按停止后没执行的调用，都不该把面板留在一个没操控过的窗口上，2026-11-02 审查）
 * - turn/end → 标为已结束，记下怎么结束的（面板冻结最后一帧）
 */

export const COMPUTER_PROJECTION = 'computerPlusTarget'

/** 指向某个窗口的工具：调用时一定带 pid 和 window_id */
export const WINDOW_TOOLS = new Set([
  'computer_get_window_state',
  'computer_click',
  'computer_type_text',
  'computer_press_key',
  'computer_scroll',
])

/** 记几个应用的名字（从 A 换到 B 再回到 A 时还能显示 A 的名字） */
const MAX_NAMES = 8

/**
 * @typedef {{ pid: number, windowId: number, appName?: string, tool: string, at: number }} PreviousTarget
 * @typedef {{
 *   pid: number,
 *   windowId: number,
 *   appName?: string,
 *   tool: string,
 *   ended?: 'completed' | 'aborted' | 'error',
 *   active: boolean,
 *   at: number,
 *   callId?: string,
 *   previous?: PreviousTarget,
 *   names?: Record<string, string>,
 * }} ComputerTarget
 * @typedef {{ type: string, seq: number, time: number, data?: unknown }} SessionEvent
 */

const isId = (/** @type {unknown} */ v) => typeof v === 'number' && Number.isSafeInteger(v) && v > 0
const ENDINGS = new Set(['completed', 'aborted', 'error'])

/** @param {any} v */
const isPrevious = (v) => v !== null && typeof v === 'object' && isId(v.pid) && isId(v.windowId) && typeof v.tool === 'string'
  && typeof v.at === 'number' && Number.isFinite(v.at) && (v.appName === undefined || typeof v.appName === 'string')

/** @param {any} v */
const isNames = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every(name => typeof name === 'string')

/**
 * 投影状态的校验（DSH 只调 parse，用不着引 zod）。形状不对就抛，DSH 丢掉这条旧状态重新算
 * @param {unknown} value
 * @returns {ComputerTarget | null}
 */
export function parseTarget(value) {
  if (value === null) return null
  const v = /** @type {any} */ (value)
  const ok = v !== null && typeof v === 'object'
    && isId(v.pid) && isId(v.windowId) && typeof v.tool === 'string'
    && typeof v.active === 'boolean' && typeof v.at === 'number' && Number.isFinite(v.at)
    && (v.appName === undefined || typeof v.appName === 'string')
    && (v.ended === undefined || ENDINGS.has(v.ended))
    && (v.callId === undefined || typeof v.callId === 'string')
    && (v.previous === undefined || isPrevious(v.previous))
    && (v.names === undefined || isNames(v.names))
  if (!ok) throw new Error('invalid computer target')
  return /** @type {ComputerTarget} */ (v)
}

const schema = { parse: parseTarget }

/**
 * 记下一个应用名（按 pid），最多 MAX_NAMES 个，新的放最后
 * @param {Record<string, string> | undefined} names
 * @param {number} pid
 * @param {string} name
 * @returns {Record<string, string>}
 */
function remember(names, pid, name) {
  const key = String(pid)
  if (names?.[key] === name) return names
  const entries = Object.entries(names ?? {}).filter(([k]) => k !== key)
  entries.push([key, name])
  return Object.fromEntries(entries.slice(-MAX_NAMES))
}

/**
 * 一次 tool/call 指向的窗口；不是窗口工具、参数不对就是 undefined
 * @param {{ name?: unknown, arguments?: unknown }} data
 * @returns {{ pid: number, windowId: number, tool: string } | undefined}
 */
export function windowOfCall(data) {
  if (typeof data.name !== 'string' || !WINDOW_TOOLS.has(data.name) || typeof data.arguments !== 'string') return undefined
  /** @type {any} */
  let args
  try { args = JSON.parse(data.arguments) } catch { return undefined }
  if (args === null || typeof args !== 'object' || !isId(args.pid) || !isId(args.window_id)) return undefined
  return { pid: args.pid, windowId: args.window_id, tool: data.name }
}

/**
 * 回合怎么结束的。只有明确出错才算「出错了」，只有正常完成才打勾：
 * 输出到上限（max-tokens）、被拦下（blocked）、被销毁等，任务不一定做完，也不是出错，都算「已停止」（2026-11-02 审查）
 * @param {unknown} data
 * @returns {'completed' | 'aborted' | 'error'}
 */
export function endedOf(data) {
  const kind = /** @type {any} */ (data)?.reason?.kind
  if (kind === 'completed') return 'completed'
  if (kind === 'error') return 'error'
  return 'aborted'
}

export const computerProjection = {
  key: COMPUTER_PROJECTION,
  stateSchema: schema,
  stateVersion: 1,
  /** @returns {ComputerTarget | null} */
  init() {
    return null
  },
  /**
   * @param {ComputerTarget | null} state
   * @param {SessionEvent} event
   * @returns {ComputerTarget | null}
   */
  apply(state, event) {
    if (event.type === 'tool/call') {
      const data = /** @type {{ name?: unknown, arguments?: unknown, callId?: unknown }} */ (event.data ?? {})
      const call = windowOfCall(data)
      if (call === undefined) return state
      const names = state?.names
      // 应用名：同一个应用沿用；回到之前操控过的应用用记下的名字（只有 get_window_state 的结果带名字，点击、输入不带）
      const appName = state !== null && state.pid === call.pid ? state.appName ?? names?.[String(call.pid)] : names?.[String(call.pid)]
      const moved = state === null || state.pid !== call.pid || state.windowId !== call.windowId
      /** @type {PreviousTarget | undefined} */
      const previous = moved && state !== null
        ? { pid: state.pid, windowId: state.windowId, tool: state.tool, at: state.at, ...(state.appName === undefined ? {} : { appName: state.appName }) }
        : undefined
      return {
        ...call,
        ...(appName === undefined ? {} : { appName }),
        active: true,
        at: event.time,
        ...(typeof data.callId === 'string' ? { callId: data.callId } : {}),
        ...(previous === undefined ? {} : { previous }),
        ...(names === undefined ? {} : { names }),
      }
    }
    if (event.type === 'tool/result') {
      if (state === null || state.callId === undefined) return state
      const data = /** @type {{ message?: { toolCallId?: unknown, isError?: unknown }, meta?: any }} */ (event.data ?? {})
      if (data.message?.toolCallId !== state.callId) return state
      const { callId: _done, previous, ...rest } = state
      // 换到新窗口的这次调用失败了（pid 传错、窗口不存在、按停止后没执行）：退回上一个窗口
      if (data.message?.isError === true && previous !== undefined) {
        const appName = previous.appName ?? rest.names?.[String(previous.pid)]
        return {
          pid: previous.pid,
          windowId: previous.windowId,
          tool: previous.tool,
          ...(appName === undefined ? {} : { appName }),
          active: rest.active,
          at: event.time,
          ...(rest.names === undefined ? {} : { names: rest.names }),
        }
      }
      const meta = data.meta
      // meta 是我们工具自己的 presentationMeta：pid 和窗口都对得上才认
      const mine = meta !== null && typeof meta === 'object' && meta.pid === state.pid && meta.windowId === state.windowId
      const appName = mine && typeof meta.appName === 'string' && meta.appName !== '' ? meta.appName : undefined
      if (appName === undefined) return { ...rest, at: event.time }
      return { ...rest, appName, names: remember(rest.names, rest.pid, appName), at: event.time }
    }
    if (event.type === 'turn/end') {
      if (state === null || !state.active) return state
      const { callId: _done, previous: _previous, ...rest } = state
      return { ...rest, active: false, ended: endedOf(event.data) }
    }
    if (event.type === 'session/end-seed') return state === null ? state : null
    return state
  },
  wire: {
    viewSchema: schema,
    /** 给客户端的只要显示用的字段（previous、names 是投影自己记账用的） @param {ComputerTarget | null} state */
    view(state) {
      if (state === null) return null
      const { previous: _previous, names: _names, ...view } = state
      return view
    },
  },
}
