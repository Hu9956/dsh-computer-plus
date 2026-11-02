import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

/**
 * 电脑操控画面的数据（客户端）。目标来自 host 端投影 computerPlusTarget（src/projection.js），
 * 只在 Agent 调 computer_* 工具、参数里明确写了 pid 和 window_id 时才有，不猜。
 *
 * - 回合进行中、面板开着、这一组没收起、页面在前台：<img> 直接播 /computer-plus/stream（MJPEG，10fps）
 * - 回合结束：取一次 /frame 冻结的最后一帧
 * - 看不见就卸掉 <img>，连接一断 host 3 秒后停止取流，菜单栏的录屏图标随之消失
 * - 看着时每 250ms 问一次 /status：虚拟光标位置（窗口内 0～1）、点击计数（出涟漪）、是否在首次编译
 */

export const COMPUTER_PROJECTION = 'computerPlusTarget'
export const BASE = '/computer-plus'
/** 取流断了多久后重连 */
const RETRY_MS = 2000
/** 光标轮询间隔（host 端也是 250ms 读一次 cua-driver） */
const STATUS_POLL_MS = 250

export interface ComputerTarget {
  pid: number
  windowId: number
  appName?: string
  /** 最近一次调用的工具名 */
  tool: string
  active: boolean
  /** 这一轮怎么结束的（active=false 时才有） */
  ended?: 'completed' | 'aborted' | 'error'
  at: number
  callId?: string
}

export type ComputerError = 'window-gone' | 'capture-failed' | 'capture-stopped' | 'unsupported' | 'unauthorized'

export interface ComputerFrame {
  /** 进行中是 MJPEG 流的 URL，结束后是最后一帧的 object URL */
  url?: string
  error?: ComputerError
}

export interface ComputerStatus {
  /** 窗口内比例位置 0～1；null = 不画 */
  point: { x: number, y: number } | null
  /** 涟漪序号：host 每记一次点击加一，客户端按它重放动画 */
  ripple: number
  /** 辅助程序在第一次编译 */
  preparing: boolean
}

/** 投影值规整成 ComputerTarget；形状不对就当没有 */
export function asComputerTarget(value: unknown): ComputerTarget | undefined {
  if (value === null || typeof value !== 'object') return undefined
  const v = value as Partial<ComputerTarget>
  if (typeof v.pid !== 'number' || typeof v.windowId !== 'number' || typeof v.active !== 'boolean' || typeof v.at !== 'number') return undefined
  return v as ComputerTarget
}

const ERRORS: readonly ComputerError[] = ['window-gone', 'capture-failed', 'capture-stopped', 'unsupported', 'unauthorized']
const asError = (value: unknown): ComputerError | undefined => ERRORS.includes(value as ComputerError) ? value as ComputerError : undefined
/** 登录失效（401）、不让看（403）：再请求也一样，停下来 */
const refused = (status: number) => status === 401 || status === 403

/** 占位区的文字：有画面时不显示 */
export function screenNote(target: ComputerTarget | undefined, frame: ComputerFrame, preparing = false): string {
  if (frame.error === 'unauthorized') return '登录已失效，刷新页面后再看画面'
  if (frame.error === 'window-gone') return '窗口已关闭'
  if (frame.error === 'unsupported') return '当前系统不支持显示画面'
  if (frame.error === 'capture-stopped') return '画面中断了（可能是锁屏或停止了录屏），Agent 下一步时再试'
  if (frame.error === 'capture-failed') return '截不到画面，请在系统设置里给 DeepSeek Harness 打开屏幕录制权限'
  if (target === undefined) return 'Agent 操控电脑时，画面显示在这里'
  if (!target.active) return '本轮没有留下画面'
  if (preparing) return '首次使用，正在准备画面（约 10 秒）'
  return '正在获取画面…'
}

/** 应用名；没有操控时是「应用」 */
export function appName(target: ComputerTarget | undefined): string {
  if (target === undefined) return '应用'
  return target.appName ?? '未知应用'
}

/** 状态：暂无 / 操控中 / 已完成 / 已停止 / 出错了 */
export function appStatus(target: ComputerTarget | undefined): string {
  if (target === undefined) return '暂无'
  if (target.active) return '操控中'
  if (target.ended === 'aborted') return '已停止'
  if (target.ended === 'error') return '出错了'
  return '已完成'
}

/** 应用图标地址：pid 进 URL，换应用就是新图（host 只给当前目标的图标，pid 对不上回 204、不缓存） */
export const appIconUrl = (sessionId: string, target: ComputerTarget | undefined) =>
  target === undefined ? undefined : `${BASE}/icon?${query(sessionId)}&pid=${target.pid}`

/** 画面上要不要叠完成徽标：只有这一轮明确正常完成才叠 */
export const showDoneBadge = (target: ComputerTarget | undefined) => target?.active === false && target.ended === 'completed'

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => !document.hidden)
  useEffect(() => {
    const sync = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])
  return visible
}

const query = (sessionId: string) => `session=${encodeURIComponent(sessionId)}`
const surfaceOf = (target: ComputerTarget | undefined) => target === undefined ? '' : `${target.pid}:${target.windowId}`

/** 这一轮的标记：每次从「已结束」变回「操控中」加一（不用 at：它每一步都变，放进 URL 会让每一步都断流重连） */
function useTurnKey(active: boolean): number {
  const [turn, setTurn] = useState(0)
  const was = useRef(active)
  useEffect(() => {
    if (active && !was.current) setTurn(n => n + 1)
    was.current = active
  }, [active])
  return turn
}

/**
 * @param enabled 面板开着且这一组没收起（看不见就不取，不占取流）
 * @returns frame 和 onError（交给 <img>：流断了先问清原因，再过 2 秒重连）
 */
export function useComputerFrame(sessionId: string, target: ComputerTarget | undefined, enabled: boolean, zoom = false): ComputerFrame & { onError: () => void } {
  const [frame, setFrame] = useState<ComputerFrame>({})
  const [attempt, setAttempt] = useState(0)
  const blobUrl = useRef<string | undefined>(undefined)
  const visible = usePageVisible()
  const surface = surfaceOf(target)
  const active = target?.active === true

  // 换对话、换窗口、目标清空、卸载：旧画面作废并释放
  useEffect(() => () => {
    if (blobUrl.current !== undefined) URL.revokeObjectURL(blobUrl.current)
    blobUrl.current = undefined
    setFrame({})
    setAttempt(0)
  }, [sessionId, surface])

  const streaming = enabled && visible && active && target !== undefined
  const turn = useTurnKey(active)
  // 这一轮必须进 URL：上一轮的流是正常结束的，同一个地址浏览器会直接拿缓存里的最后一帧、不再请求
  const streamUrl = streaming ? `${BASE}/stream?${query(sessionId)}&s=${encodeURIComponent(surface)}&t=${turn}&n=${attempt}${zoom ? '&edge=zoom' : ''}` : undefined

  // 结束后：取一次冻结的最后一帧
  useEffect(() => {
    if (!enabled || target === undefined || active) return
    const controller = new AbortController()
    fetch(`${BASE}/frame?${query(sessionId)}`, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
      .then(async (res) => {
        if (res.status === 200) {
          const next = URL.createObjectURL(await res.blob())
          if (controller.signal.aborted) { URL.revokeObjectURL(next); return }
          if (blobUrl.current !== undefined) URL.revokeObjectURL(blobUrl.current)
          blobUrl.current = next
          setFrame({ url: next })
        } else if (res.status === 503) {
          const body = await res.json().catch(() => ({})) as { error?: unknown }
          setFrame(current => ({ ...current, error: asError(body.error) ?? 'capture-failed' }))
        } else if (refused(res.status)) {
          setFrame(current => ({ ...current, error: 'unauthorized' }))
        }
      })
      .catch(() => { /* 断网、被中止：没有冻结帧就显示文字 */ })
    return () => controller.abort()
  }, [sessionId, surface, enabled, active])

  // Agent 又做了一步：之前停在错误提示上的，清掉原因再连一次（登录失效除外：要刷新页面）
  const retry = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(retry.current), [sessionId, surface])
  const hasError = useRef(false)
  hasError.current = frame.error !== undefined && frame.error !== 'unauthorized'
  const at = target?.at
  useEffect(() => {
    if (!hasError.current) return
    setFrame(current => ({ ...current, error: undefined }))
    setAttempt(n => n + 1)
  }, [at])

  const onError = () => {
    if (!streaming) return
    fetch(`${BASE}/frame?${query(sessionId)}`, { credentials: 'same-origin', cache: 'no-store' })
      .then(async (res): Promise<ComputerError | undefined> => {
        if (refused(res.status)) return 'unauthorized'
        if (res.status !== 503) return undefined
        const body = await res.json().catch(() => ({})) as { error?: unknown }
        return asError(body.error) ?? 'capture-failed'
      })
      .catch(() => undefined)
      .then((error) => {
        if (error !== undefined) setFrame(current => ({ ...current, error }))
        // 窗口关了、截不到、中途停了、登录失效：再连也一样，停在提示上，等 Agent 下一步（登录失效要刷新页面）
        if (error !== undefined) return
        clearTimeout(retry.current)
        retry.current = setTimeout(() => {
          setFrame(current => current.error === undefined ? current : { ...current, error: undefined })
          setAttempt(n => n + 1)
        }, RETRY_MS)
      })
  }

  if (streamUrl !== undefined) return { url: streamUrl, ...(frame.error === undefined ? {} : { error: frame.error }), onError }
  return { ...frame, url: active ? undefined : frame.url, onError }
}

/**
 * 光标、点击、首次编译：看着而且这一轮还在进行时，每 250ms 问一次 host（host 只读内存，自己在后台读 cua-driver）。
 * 涟漪按 host 给的点击计数：数字变大一次出一圈（第一次读到的只当基准，不补放旧涟漪）
 */
export function useComputerStatus(sessionId: string, target: ComputerTarget | undefined, enabled: boolean): ComputerStatus {
  const [point, setPoint] = useState<ComputerStatus['point']>(null)
  const [ripple, setRipple] = useState(0)
  const [preparing, setPreparing] = useState(false)
  const visible = usePageVisible()
  const surface = surfaceOf(target)
  const active = target?.active === true

  useEffect(() => { setPoint(null); setPreparing(false) }, [sessionId, surface, active])

  const clicks = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!enabled || !visible || !active) return
    clicks.current = undefined
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    const tick = () => {
      fetch(`${BASE}/status?${query(sessionId)}`, { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
        .then((res) => {
          // 登录失效、不让看：不再每 250ms 问一次（刷新页面或下一轮再来）
          if (refused(res.status)) stopped = true
          return res.status === 200 ? res.json() as Promise<{ point?: unknown, clicks?: unknown, preparing?: unknown }> : undefined
        })
        .then((body) => {
          if (stopped || body === undefined) return
          setPreparing(body.preparing === true)
          const p = body.point as { x?: unknown, y?: unknown } | null | undefined
          if (p !== null && typeof p === 'object' && typeof p.x === 'number' && typeof p.y === 'number') {
            const x = p.x
            const y = p.y
            setPoint(current => current?.x === x && current.y === y ? current : { x, y })
          } else {
            setPoint(null)
          }
          if (typeof body.clicks === 'number') {
            if (clicks.current !== undefined && body.clicks > clicks.current) setRipple(n => n + 1)
            clicks.current = body.clicks
          }
        })
        .catch(() => {})
        .finally(() => { if (!stopped) timer = setTimeout(tick, STATUS_POLL_MS) })
    }
    tick()
    return () => {
      stopped = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [sessionId, surface, enabled, visible, active])

  return { point, ripple, preparing }
}

/** 图片在框里按 object-fit: contain 摆放后的实际区域（光标要按它摆，不是按外框） */
export function contentRect(box: { w: number, h: number }, natural: { w: number, h: number } | undefined) {
  if (natural === undefined || natural.w <= 0 || natural.h <= 0 || box.w <= 0 || box.h <= 0) return undefined
  const scale = Math.min(box.w / natural.w, box.h / natural.h)
  const w = natural.w * scale
  const h = natural.h * scale
  return { left: (box.w - w) / 2, top: (box.h - h) / 2, width: w, height: h }
}

export function useBoxSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const node = ref.current
    if (node === null) return
    const measure = () => {
      const w = node.clientWidth
      const h = node.clientHeight
      setSize(current => current.w === w && current.h === h ? current : { w, h })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
  return size
}
