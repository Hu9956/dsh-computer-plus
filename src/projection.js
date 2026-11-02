/**
 * 会话投影：这个对话里 Agent 正在操控（或最后操控过）的窗口。面板只读它，不猜。
 *
 * 目标完全来自 Agent 调 computer_* 工具时传的 pid 和 window_id（结构化参数，不解析命令文本）；
 * 工具结果的 presentationMeta 补上应用名。截图本身不进投影、不进会话日志。
 *
 * 事件：
 * - tool/call（computer_* 里操作窗口的工具）→ 目标换成这一次的窗口，标为操控中
 * - tool/result（同一个 callId）→ 补应用名
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

/**
 * @typedef {{
 *   pid: number,
 *   windowId: number,
 *   appName?: string,
 *   tool: string,
 *   ended?: 'completed' | 'aborted' | 'error',
 *   active: boolean,
 *   at: number,
 *   callId?: string,
 * }} ComputerTarget
 * @typedef {{ type: string, seq: number, time: number, data?: unknown }} SessionEvent
 */

const isId = (/** @type {unknown} */ v) => typeof v === 'number' && Number.isSafeInteger(v) && v > 0
const ENDINGS = new Set(['completed', 'aborted', 'error'])

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
  if (!ok) throw new Error('invalid computer target')
  return /** @type {ComputerTarget} */ (v)
}

const schema = { parse: parseTarget }

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
 * 回合怎么结束的
 * @param {unknown} data
 * @returns {'completed' | 'aborted' | 'error'}
 */
export function endedOf(data) {
  const kind = /** @type {any} */ (data)?.reason?.kind
  if (kind === 'completed') return 'completed'
  if (kind === 'aborted' || kind === 'interrupted') return 'aborted'
  return 'error'
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
      // 同一个应用沿用应用名（只有 get_window_state 的结果带名字，点击、输入不带）
      const appName = state !== null && state.pid === call.pid ? state.appName : undefined
      return {
        ...call,
        ...(appName === undefined ? {} : { appName }),
        active: true,
        at: event.time,
        ...(typeof data.callId === 'string' ? { callId: data.callId } : {}),
      }
    }
    if (event.type === 'tool/result') {
      if (state === null || state.callId === undefined) return state
      const data = /** @type {{ message?: { toolCallId?: unknown }, meta?: any }} */ (event.data ?? {})
      if (data.message?.toolCallId !== state.callId) return state
      const { callId: _done, ...rest } = state
      const meta = data.meta
      // meta 是我们工具自己的 presentationMeta：pid 和窗口都对得上才认
      const mine = meta !== null && typeof meta === 'object' && meta.pid === state.pid && meta.windowId === state.windowId
      const appName = mine && typeof meta.appName === 'string' && meta.appName !== '' ? meta.appName : undefined
      return { ...rest, ...(appName === undefined ? {} : { appName }), at: event.time }
    }
    if (event.type === 'turn/end') {
      if (state === null || !state.active) return state
      const { callId: _done, ...rest } = state
      return { ...rest, active: false, ended: endedOf(event.data) }
    }
    if (event.type === 'session/end-seed') return state === null ? state : null
    return state
  },
  wire: {
    viewSchema: schema,
    /** @param {ComputerTarget | null} state */
    view(state) {
      return state
    },
  },
}
