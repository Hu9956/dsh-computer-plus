import { execFile, spawn } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, stat, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createDriver } from './driver.js'
import { COMPUTER_PROJECTION, computerProjection } from './projection.js'
import { registerComputerTools } from './tools.js'

/**
 * 电脑操控 Plus（host 端）：
 * 1. 给 Agent 一组 computer_* 工具，底下转发给 cua-driver（src/tools.js）
 * 2. 会话投影记下 Agent 正在操控的窗口：直接取工具参数里的 pid / window_id，不解析命令（src/projection.js）
 * 3. 面板路由 /computer-plus/*：实时画面（MJPEG）、冻结的最后一帧、虚拟光标、应用图标
 *
 * 画面：只在有人看时用 ScreenCaptureKit 取流（assets/computer-stream.swift，首次用到时本机编译），10fps，长边 640（放大时 1600）。
 * 内存：每个对话只留最新一帧，最多 32 个对话；结束的 10 分钟没人看就清掉；截图不落盘、不进会话日志，重启即无。
 * 只支持 macOS。
 */

export const name = 'dsh-computer-plus'
export const inject = ['sessionProjections']

export const COMPUTER_PATH = '/computer-plus'

const MAX_SESSIONS = 32
const FROZEN_TTL_MS = 10 * 60_000
const FRAME_EDGE = 640
const ZOOM_EDGE = 1600
const STREAM_FPS = 10
const LINGER_MS = 3000
/** 补拍一帧最多等多久（起辅助程序到拿到第一帧，实测一般不到半秒） */
const SNAPSHOT_TIMEOUT_MS = 4000
const MAX_FRAME_BYTES = 4 * 1024 * 1024
const MJPEG_BOUNDARY = 'dsh-computer-frame'
const MJPEG_MAX_BUFFERED = 1024 * 1024
/** 光标：客户端多久没来问就停止轮询 cua-driver */
const CURSOR_IDLE_MS = 2000
const CURSOR_POLL_MS = 250
const STREAM_SOURCE = new URL('../assets/computer-stream.swift', import.meta.url)
/** 辅助程序退出码 → 面板上的原因。4 = 取不到画面（多半没有屏幕录制权限）；5 = 取流中途停了（锁屏、在系统的录屏指示里点了停止），不是权限问题 */
const STREAM_EXIT = /** @type {Record<number, string>} */ ({ 3: 'window-gone', 4: 'capture-failed', 5: 'capture-stopped' })
/** 冻结帧多久清一次过期的 */
const EVICT_EVERY_MS = 60_000
/** 发了 SIGTERM 多久还没退就 SIGKILL。辅助程序收到 SIGTERM 会先等系统把流停掉再退（自己最多等 4 秒），这里要比它长 */
const KILL_GRACE_MS = 6000

/**
 * 停掉一个辅助程序：先关 stdin、再 SIGTERM，两条路它都会先 stopCapture 再退出；6 秒还在就 SIGKILL。
 * 不能一上来就硬杀：开流请求还在系统 replayd 里时进程死了，replayd 会照样把流建起来、没人停，
 * 窗口标题栏的紫色录屏标一直亮着、那个应用也退不掉（2026-11-02 真机：Kiro Manager Lite）
 * @param {import('node:child_process').ChildProcess} proc
 */
function killHelper(proc) {
  proc.stdout?.removeAllListeners('data')
  proc.removeAllListeners('exit')
  if (proc.exitCode !== null || proc.signalCode !== null) return
  proc.stdin?.end()
  proc.kill('SIGTERM')
  setTimeout(() => { if (proc.exitCode === null && proc.signalCode === null) proc.kill('SIGKILL') }, KILL_GRACE_MS).unref()
}

/**
 * 给 Agent 的提示。用户 2026-11-02 定的优先级：先把电脑操控好、花得少，面板画面排第二。
 * 所以日常操作用工具（面板看得见、不用写脚本），步骤多的固定流程允许写 cua-driver 脚本（省步数），只是面板看不到。
 * 省 token 的两个要点写进来：读一次窗口后连着发动作（少走步数），不要每点一下就读一次。
 */
export const COMPUTER_PROMPT = [
  '## Computer use',
  'To operate a macOS app, use the computer_* tools: computer_launch_app or computer_list_windows to find the pid and window_id, computer_get_window_state to observe, then computer_click / computer_type_text / computer_press_key / computer_scroll. They drive cua-driver in the background and show the window live in the conversation panel.',
  'Keep it cheap: read a window once, send every action you already know in the same step (they run in order), and read it again only to check the result or when the window changed. Every tool result stays in the conversation and is resent on each later step, so avoid extra reads and extra steps.',
  'Use these tools by default. Writing a cua-driver script in bash is fine when it is clearly cheaper, such as a long fixed sequence or a loop over many items, or for what these tools do not cover (drag, native menu commands via invoke_menu, browser pages, steps that need the window in front). Tell the user that the panel will not show those steps.',
].join('\n')

/**
 * 这个对话在 cua-driver 里用的 session 名（每个 DSH 对话一个，名字固定，光标颜色也固定）
 * @param {string} sessionId
 */
export function labelOf(sessionId) {
  return `dsh-${createHash('sha1').update(sessionId).digest('hex').slice(0, 10)}`
}

/**
 * 把辅助程序 stdout 的「4 字节大端长度 + JPEG」拆成一帧帧
 * @param {(frame: Buffer) => void} onFrame
 * @param {() => void} onCorrupt
 */
export function frameReader(onFrame, onCorrupt) {
  let pending = Buffer.alloc(0)
  return (/** @type {Buffer} */ chunk) => {
    pending = pending.length === 0 ? chunk : Buffer.concat([pending, chunk])
    while (pending.length >= 4) {
      const size = pending.readUInt32BE(0)
      if (size === 0 || size > MAX_FRAME_BYTES) {
        pending = Buffer.alloc(0)
        onCorrupt()
        return
      }
      if (pending.length < 4 + size) return
      onFrame(Buffer.from(pending.subarray(4, 4 + size)))
      pending = pending.subarray(4 + size)
    }
  }
}

/**
 * 往一个 MJPEG 观看者写一帧；读不动（网络卡、设备休眠）就丢帧，不往发送缓冲里一直堆
 * @param {import('node:http').ServerResponse} res
 * @param {Buffer} bytes
 */
export function writeMjpeg(res, bytes) {
  if (res.destroyed || res.writableEnded || res.writableLength > MJPEG_MAX_BUFFERED) return
  res.write(`--${MJPEG_BOUNDARY}\r\nContent-Type: image/jpeg\r\nContent-Length: ${bytes.length}\r\n\r\n`)
  res.write(bytes)
  res.write('\r\n')
}

const CORNER_MAGIC = Buffer.from('CPR1')

/**
 * 拆下辅助程序接在 JPEG 后面的「角」：4 个 UInt16 大端（左上、右上、右下、左下的圆角半径，占图宽的万分之几）+ "CPR1"。
 * 窗口圆角外是透明的，JPEG 没有透明，面板按这个半径把角裁掉（2026-11-04 用户截图：四个白角）。
 * 没有这段（旧版辅助程序、显示器画面）就原样返回、corners 为 undefined
 * @param {Buffer} frame
 * @returns {{ jpeg: Buffer, corners?: number[] }}
 */
export function splitCorners(frame) {
  if (frame.length < 12 + 2 || !frame.subarray(frame.length - 4).equals(CORNER_MAGIC)) return { jpeg: frame }
  const at = frame.length - 12
  const corners = [0, 1, 2, 3].map(i => frame.readUInt16BE(at + i * 2))
  const jpeg = frame.subarray(0, at)
  if (corners.some(r => r > 10_000)) return { jpeg }
  return corners.some(r => r > 0) ? { jpeg, corners } : { jpeg }
}

/**
 * 编译取流辅助程序（只在 macOS、只编一次，产物按源码哈希命名）。没有 swiftc 或编译失败返回 undefined
 * @param {any} logger
 */
async function buildHelper(logger) {
  if (process.platform !== 'darwin') return undefined
  /** @type {string | undefined} */
  let partial
  try {
    const source = await readFile(STREAM_SOURCE)
    const hash = createHash('sha256').update(source).digest('hex').slice(0, 16)
    const dir = join(process.env.HOME ?? tmpdir(), 'Library/Caches/dsh-computer-plus')
    const binary = join(dir, `computer-stream-${hash}`)
    if (await stat(binary).then(info => info.isFile(), () => false)) return binary
    // 没装命令行工具时 /usr/bin/xcrun 会弹系统的「安装开发者工具」对话框：先用 xcode-select 问一声（不弹窗），没有就不编
    const tools = await new Promise(done => execFile('/usr/bin/xcode-select', ['-p'], { timeout: 10_000 }, error => done(error === null)))
    if (!tools) {
      logger?.warn?.('computer-plus: no Xcode command line tools, live picture unavailable (install with xcode-select --install)')
      return undefined
    }
    await mkdir(dir, { recursive: true })
    partial = `${binary}.${randomUUID()}.partial`
    const out = partial
    await new Promise((done, fail) => {
      execFile('/usr/bin/xcrun', ['swiftc', '-O', fileURLToPath(STREAM_SOURCE), '-o', out], { timeout: 180_000 }, error => error ? fail(error) : done(undefined))
    })
    await rename(partial, binary)
    partial = undefined
    logger?.info?.(`computer-plus: built stream helper ${binary}`)
    return binary
  } catch (error) {
    logger?.warn?.(`computer-plus: stream helper unavailable: ${String(error)}`)
    return undefined
  } finally {
    if (partial !== undefined) await unlink(partial).catch(() => {})
  }
}

/**
 * 和官方 /api 用同一套登录校验；没有 connection 服务一律拒绝。
 * 只给本机主人看（和官方 fetch 路由一样认 principal.kind === 'owner'）：以后 DSH 有了别的访问者，也看不到屏幕
 * @param {any} scope
 * @param {any} ctx
 * @param {import('node:http').IncomingMessage} req
 * @returns {number} 0 = 放行，否则是要回的状态码
 */
function admission(scope, ctx, req) {
  const connection = scope.get?.('connection') ?? ctx.get?.('connection')
  if (typeof connection?.admit !== 'function') return 401
  const admitted = connection.admit(req)
  if ('rejection' in admitted) return Number(admitted.rejection) || 401
  return admitted.peer?.principal?.kind === 'owner' ? 0 : 403
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {unknown} data
 */
function sendJson(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(data))
}

/**
 * @typedef {import('./projection.js').ComputerTarget} ComputerTarget
 * @typedef {{
 *   proc: import('node:child_process').ChildProcess,
 *   edge: number,
 *   viewers: Map<import('node:http').ServerResponse, number>,
 *   linger?: ReturnType<typeof setTimeout>,
 * }} Stream
 * @typedef {{
 *   target: ComputerTarget,
 *   frame?: { bytes: Buffer, etag: string, corners?: number[] },
 *   frameAt?: number,
 *   capturing?: Promise<void>,
 *   error?: string,
 *   touchedAt: number,
 *   stream?: Stream,
 *   captureDenied?: boolean,
 *   blockedAt?: number,
 *   clicks: number,
 *   cursor?: { point?: { x: number, y: number }, askedAt: number, running: boolean, timer?: ReturnType<typeof setTimeout> },
 * }} Entry
 */

/** 编不出辅助程序后多久再试一次（每个请求都重编太慢，永远不重试又会让一次失败一直生效） */
const HELPER_RETRY_MS = 60_000

/** @param {any} ctx */
export function apply(ctx) {
  const driver = createDriver({ logger: ctx.logger })
  /** @type {Map<string, Entry>} */
  const entries = new Map()
  /** 补拍用的辅助程序：卸载时也要停掉 */
  /** @type {Set<import('node:child_process').ChildProcess>} */
  const snapshotProcs = new Set()
  let disposed = false

  /** @type {Promise<string | undefined> | undefined} */
  let helperPath
  let helperFailedAt = 0
  let helperBuilding = false
  const helper = () => {
    if (helperPath === undefined && Date.now() - helperFailedAt < HELPER_RETRY_MS) return Promise.resolve(undefined)
    return (helperPath ??= (async () => {
      const slow = setTimeout(() => { helperBuilding = true }, 300)
      try {
        const built = await buildHelper(ctx.logger)
        if (built === undefined) {
          helperPath = undefined
          helperFailedAt = Date.now()
        }
        return built
      } finally {
        clearTimeout(slow)
        helperBuilding = false
      }
    })())
  }
  /** 起不来（缓存里的程序被删了、没有执行权限）：下次重新找、重新编 */
  const forgetHelper = () => { helperPath = undefined }

  /**
   * 辅助程序退出码记到这一条上。3（窗口没了）、5（中途停了）：这一步不再起，Agent 下一步再试；
   * 4（没有屏幕录制权限）：这一轮不再起，免得每次重连都起一个进程、甚至反复弹权限窗口（下一轮再试一次）
   * @param {Entry} entry
   * @param {number | null} code
   */
  const noteExit = (entry, code) => {
    if (code === 3 || code === 4 || code === 5) entry.blockedAt = entry.target.at
    if (code === 4) entry.captureDenied = true
  }
  const blocked = (/** @type {Entry} */ entry) => entry.captureDenied === true || entry.blockedAt === entry.target.at

  const sameWindow = (/** @type {ComputerTarget} */ a, /** @type {ComputerTarget} */ b) => a.pid === b.pid && a.windowId === b.windowId

  /** @param {Entry} entry */
  const stopCursor = (entry) => {
    if (entry.cursor?.timer !== undefined) {
      clearTimeout(entry.cursor.timer)
      entry.cursor.timer = undefined
      entry.cursor.running = false
    }
  }

  /** @param {Entry} entry */
  const stopStream = (entry) => {
    stopCursor(entry)
    const stream = entry.stream
    if (stream === undefined) return
    entry.stream = undefined
    clearTimeout(stream.linger)
    killHelper(stream.proc)
    for (const res of stream.viewers.keys()) res.end()
    stream.viewers.clear()
  }

  /**
   * @param {Entry} entry
   * @param {Buffer} raw 辅助程序给的一帧（JPEG + 可能接着的「角」）
   */
  const publish = (entry, raw) => {
    const { jpeg: bytes, corners } = splitCorners(raw)
    const etag = `"${createHash('sha1').update(bytes).digest('base64url')}"`
    if (entry.frame?.etag === etag) return
    entry.frame = { bytes, etag, ...(corners === undefined ? {} : { corners }) }
    entry.frameAt = Date.now()
    delete entry.error
    for (const res of entry.stream?.viewers.keys() ?? []) writeMjpeg(res, bytes)
  }

  const evict = (/** @type {number} */ now) => {
    for (const [id, entry] of entries) {
      if (!entry.target.active && entry.stream === undefined && now - entry.touchedAt > FROZEN_TTL_MS) entries.delete(id)
    }
    while (entries.size > MAX_SESSIONS) {
      let oldest
      for (const [id, entry] of entries) if (oldest === undefined || entry.touchedAt < oldest[1]) oldest = [id, entry.touchedAt]
      if (oldest === undefined) break
      const victim = entries.get(/** @type {string} */ (oldest[0]))
      if (victim !== undefined) stopStream(victim)
      entries.delete(/** @type {string} */ (oldest[0]))
    }
  }

  const tools = registerComputerTools(ctx, {
    driver,
    labelOf,
    onClick: (sessionId) => {
      const entry = entries.get(sessionId)
      if (entry !== undefined) entry.clicks++
    },
  })

  ctx.sessionProjections.register(computerProjection)

  // 投影一变就记下新目标（只有本进程启动后发生的操控才有画面；重启后最后一帧不保留）
  ctx.sessionProjections.onChanged((/** @type {any} */ session, /** @type {string} */ key, /** @type {unknown} */ value) => {
    if (key !== COMPUTER_PROJECTION) return
    const id = String(session?.id ?? '')
    if (id === '') return
    const target = /** @type {ComputerTarget | null} */ (value)
    const current = entries.get(id)
    if (target === null) {
      if (current !== undefined) stopStream(current)
      entries.delete(id)
      tools.forget(id)
      return
    }
    const now = Date.now()
    const wasActive = current?.target.active === true
    /** 结束前面板正开着在取流：流已经推了最新的画面，不用再补拍（再拍一次菜单栏的录屏图标会多闪一下） */
    const wasStreaming = current?.stream !== undefined
    /** 这个对话现在的记录（换窗口时是新建的那条） */
    let entry
    if (current !== undefined && sameWindow(current.target, target)) {
      // 新的一轮：上一轮没权限的记号清掉，再试一次（用户可能刚在系统设置里打开了权限）
      if (target.active && !wasActive) current.captureDenied = false
      current.target = target
      current.touchedAt = now
      if (!target.active) stopStream(current)
      entry = current
    } else {
      // 换了窗口：旧流停掉、旧帧作废（点击计数保留，客户端不会重放旧涟漪）
      if (current !== undefined) stopStream(current)
      entry = { target, touchedAt: now, clicks: current?.clicks ?? 0 }
      entries.set(id, entry)
    }
    // 回合结束：结束这个对话的 cua-driver session（虚拟光标随之消失）。下一轮第一次调用时插件会重新 start_session
    if (!target.active && wasActive) driver.endSession(labelOf(id)).catch(() => {})
    // 这一轮结束、而且没人在看：补拍一帧当冻结画面，面板之后打开也有东西可看。
    // 2026-11-02 真机：一轮只有 4 秒，面板没开着，取流从没启动，结束后显示「本轮没有留下画面」。
    // 只在结束时拍一次，不每步都拍：每次拍菜单栏都会闪一下录屏图标；面板开着时取流本来就在更新画面
    if (!target.active && wasActive && !(wasStreaming && entry === current && entry.frame !== undefined)) snapshot(id, entry)
    evict(now)
  })

  /**
   * 补拍一帧：起一次辅助程序的单张截图模式（snap，系统里不建流），拿到那一帧就结束。同一对话同时只拍一次；正在取流时不拍（流本身就在更新画面）。
   * 原来是开 2fps 的流、拿到第一帧就杀：开流还没完成时进程死了，replayd 会留下一条没人停的流，
   * 被拍的应用标题栏一直挂着紫色录屏标、退不掉（2026-11-02 真机：Kiro Manager Lite）。
   * 只拍当前目标窗口，拍的期间换了窗口就丢掉。截图只在内存里，和流的帧一样。
   * @param {string} id
   * @param {Entry} entry
   */
  const snapshot = (id, entry) => {
    if (disposed || entry.capturing !== undefined || entry.captureDenied === true || process.platform !== 'darwin') return
    const target = entry.target
    entry.capturing = (async () => {
      const binary = await helper()
      if (binary === undefined || disposed || entries.get(id) !== entry || !sameWindow(entry.target, target) || entry.stream !== undefined) return
      await new Promise((done) => {
        const proc = spawn(binary, ['snap', String(target.windowId), String(target.pid), String(FRAME_EDGE)], { stdio: ['pipe', 'pipe', 'ignore'] })
        snapshotProcs.add(proc)
        const finish = () => {
          clearTimeout(timer)
          snapshotProcs.delete(proc)
          killHelper(proc)
          done(undefined)
        }
        const timer = setTimeout(finish, SNAPSHOT_TIMEOUT_MS)
        proc.stdout?.on('data', frameReader(
          (bytes) => {
            // 拍的期间换了窗口、或开始取流了：这一帧不要（取流会推更新的画面）
            if (entries.get(id) === entry && sameWindow(entry.target, target) && entry.stream === undefined) publish(entry, bytes)
            finish()
          },
          finish,
        ))
        // 起不来（缓存里的程序没了）：下次重新编，不记成没权限
        proc.on('error', () => { forgetHelper(); finish() })
        proc.on('exit', (code) => {
          const current = entries.get(id) === entry && sameWindow(entry.target, target)
          if (current) {
            noteExit(entry, code)
            const reason = STREAM_EXIT[code ?? -1]
            // 已经有一帧就留着它当冻结画面；没有才说明原因
            if (reason !== undefined && (code === 3 || entry.frame === undefined)) entry.error = reason
          }
          finish()
        })
      })
    })().catch(() => {}).finally(() => { entry.capturing = undefined })
  }

  /**
   * @param {Entry} entry
   * @param {Stream} stream
   * @param {string} binary
   * @param {number} edge
   */
  const spawnHelper = (entry, stream, binary, edge) => {
    const target = entry.target
    const proc = spawn(binary, ['window', String(target.windowId), String(target.pid), String(STREAM_FPS), String(edge)], { stdio: ['pipe', 'pipe', 'ignore'] })
    stream.proc = proc
    stream.edge = edge
    const mine = () => entry.stream === stream && stream.proc === proc
    proc.stdout?.on('data', frameReader(
      bytes => { if (mine()) publish(entry, bytes) },
      () => { if (mine()) { entry.error = 'capture-failed'; entry.blockedAt = entry.target.at; stopStream(entry) } },
    ))
    proc.on('error', () => { if (mine()) { forgetHelper(); entry.error = 'capture-failed'; entry.blockedAt = entry.target.at; stopStream(entry) } })
    proc.on('exit', (code) => {
      if (!mine()) return
      entry.error = STREAM_EXIT[code ?? -1] ?? 'capture-failed'
      // 窗口没了、中途停了、没权限：这一步不再起辅助程序，免得客户端每 2 秒重连就起一个新进程（2026-11-02 审查）
      noteExit(entry, code)
      stopStream(entry)
    })
  }

  /** 按还在看的人里要的最大分辨率取流 @param {Entry} entry */
  const retune = async (entry) => {
    const stream = entry.stream
    if (stream === undefined || stream.viewers.size === 0) return
    const want = Math.max(...stream.viewers.values())
    if (want === stream.edge) return
    const binary = await helper()
    if (binary === undefined || entry.stream !== stream) return
    killHelper(stream.proc)
    spawnHelper(entry, stream, binary, want)
  }

  /**
   * @param {string} id
   * @param {Entry} entry
   * @param {number} edge
   * @returns {Promise<boolean>} 有没有在取流
   */
  const startStream = async (id, entry, edge) => {
    if (entry.stream !== undefined) return true
    if (blocked(entry)) return false
    const binary = await helper()
    if (binary === undefined) {
      entry.error = 'capture-failed'
      return false
    }
    if (disposed || !entry.target.active || entries.get(id) !== entry || blocked(entry)) return false
    if (entry.stream !== undefined) return true
    delete entry.error
    /** @type {Stream} */
    const stream = { proc: /** @type {any} */ (undefined), edge, viewers: new Map() }
    entry.stream = stream
    spawnHelper(entry, stream, binary, edge)
    return true
  }

  /**
   * 虚拟光标：客户端在看的时候每 250ms 读一次 cua-driver 的 get_agent_cursor_state（只读，不影响 Agent 的元素编号），
   * 换算成窗口里的 0～1 比例。session 名是插件代填的，所以一定读得到（不像 bash 写法常用随机的隐式 session）
   * @param {string} id
   * @param {Entry} entry
   */
  const ensureCursor = (id, entry) => {
    const poll = (entry.cursor ??= { askedAt: 0, running: false })
    poll.askedAt = Date.now()
    if (poll.running || !entry.target.active) return
    poll.running = true
    const label = labelOf(id)
    /** @type {{ x: number, y: number, width: number, height: number } | undefined} */
    let bounds
    let boundsAt = 0
    const stop = () => {
      poll.timer = undefined
      poll.running = false
    }
    const tick = async () => {
      poll.timer = undefined
      if (disposed || !entry.target.active || entry.cursor !== poll || entries.get(id) !== entry) return stop()
      if (Date.now() - poll.askedAt > CURSOR_IDLE_MS) return stop()
      const target = entry.target
      try {
        if (bounds === undefined || Date.now() - boundsAt > 1000) {
          const listed = await driver.read('list_windows', { pid: target.pid })
          const window = (Array.isArray(listed?.windows) ? listed.windows : []).find((/** @type {any} */ w) => w?.window_id === target.windowId && w?.pid === target.pid)
          const b = window?.bounds
          if (b?.width > 0 && b?.height > 0) { bounds = b; boundsAt = Date.now() }
        }
        const state = await driver.read('get_agent_cursor_state', { session: label })
        const at = state?.position
        if (typeof at?.x === 'number' && typeof at?.y === 'number' && bounds !== undefined) {
          const x = (at.x - bounds.x) / bounds.width
          const y = (at.y - bounds.y) / bounds.height
          // 光标在窗口外（Agent 在操作别的窗口）就不画
          poll.point = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : undefined
        }
      } catch {
        // 这个对话的 session 还没开始或已结束：不画，过一会儿再试
        poll.point = undefined
      }
      if (entry.cursor !== poll) return stop()
      poll.timer = setTimeout(tick, CURSOR_POLL_MS)
    }
    poll.timer = setTimeout(tick, 0)
  }

  /**
   * 应用图标（64×64 PNG）按 pid 缓存，最多 16 个，取不到记 null
   * @type {Map<number, Promise<Buffer | null>>}
   */
  const icons = new Map()
  const iconOf = (/** @type {number} */ pid) => {
    let found = icons.get(pid)
    if (found === undefined) {
      found = (async () => {
        const binary = await helper()
        if (binary === undefined) return null
        return /** @type {Buffer | null} */ (await new Promise((done) => {
          execFile(binary, ['icon', String(pid)], { encoding: 'buffer', timeout: 4000, maxBuffer: 1024 * 1024 }, (error, stdout) => done(error || stdout.length === 0 ? null : stdout))
        }))
      })()
      icons.set(pid, found)
      while (icons.size > 16) icons.delete(/** @type {number} */ (icons.keys().next().value))
    }
    return found
  }

  // 冻结帧按时清：原来只在投影变化时顺手清，没有新的操控就一直留着（2026-11-02 审查）
  const sweeper = setInterval(() => evict(Date.now()), EVICT_EVERY_MS)
  sweeper.unref?.()

  ctx.effect(() => () => {
    disposed = true
    clearInterval(sweeper)
    for (const entry of entries.values()) stopStream(entry)
    entries.clear()
    // 补拍中的辅助程序也停掉（原来要等 4 秒超时才停）
    for (const proc of snapshotProcs) killHelper(proc)
    snapshotProcs.clear()
  }, 'computer-plus: frames')

  ctx.inject(['systemPrompt'], (/** @type {any} */ scope) => {
    const order = Number(scope.systemPrompt.getSectionOrder?.('TOOL_COMPUTER_USE') ?? 3000) + 1
    scope.systemPrompt.section({ name: 'computer-plus:tools', order, text: COMPUTER_PROMPT, interpolate: false })
  })

  /**
   * GET /computer-plus/stream?session=<id>  → MJPEG 实时画面；回合已结束就推一帧冻结的最后画面后结束
   * GET /computer-plus/frame?session=<id>   → 最新一帧（image/jpeg，ETag）
   * GET /computer-plus/status?session=<id>  → { point, clicks, preparing }（客户端看着时每 250ms 问一次）
   * GET /computer-plus/icon?session=<id>    → 当前操控应用的图标
   * 页面只能给 sessionId，不能指定窗口：目标完全由 Agent 的工具调用决定。没有目标 → 204
   */
  ctx.inject(['webServer'], (/** @type {any} */ scope) => {
    scope.effect(() => scope.webServer.register({
      kind: 'prefix',
      path: COMPUTER_PATH,
      handler: async (/** @type {import('node:http').IncomingMessage} */ req, /** @type {import('node:http').ServerResponse} */ res) => {
        const refused = admission(scope, ctx, req)
        if (refused !== 0) {
          res.writeHead(refused)
          res.end(refused === 401 ? 'unauthorized' : 'forbidden')
          return
        }
        const url = new URL(req.url ?? '/', 'http://x')
        const route = url.pathname.slice(COMPUTER_PATH.length)
        if (!['/frame', '/stream', '/status', '/icon'].includes(route) || req.method !== 'GET') {
          sendJson(res, 404, { error: 'not found' })
          return
        }
        const id = url.searchParams.get('session') ?? ''
        // 先清过期的：别让一次请求把早该清掉的冻结帧续上命
        evict(Date.now())
        const entry = entries.get(id)
        if (entry === undefined) {
          res.writeHead(204, { 'cache-control': 'no-store' })
          res.end()
          return
        }
        entry.touchedAt = Date.now()
        if (process.platform !== 'darwin') {
          sendJson(res, 503, { error: 'unsupported' })
          return
        }
        let gone = res.destroyed
        res.on('close', () => { gone = true })

        if (route === '/status') {
          if (entry.target.active) ensureCursor(id, entry)
          sendJson(res, 200, {
            point: entry.target.active ? entry.cursor?.point ?? null : null,
            clicks: entry.clicks,
            preparing: helperBuilding,
            ...(entry.frame?.corners === undefined ? {} : { corners: entry.frame.corners }),
            ...(entry.error === undefined ? {} : { error: entry.error }),
          })
          return
        }

        if (route === '/icon') {
          // 地址里的 pid 是客户端当时的目标：对不上（请求晚到、已经换了应用）就不给，免得别的应用的图标按这个地址缓存一小时
          const png = url.searchParams.get('pid') === String(entry.target.pid) ? await iconOf(entry.target.pid) : null
          if (png === null) {
            res.writeHead(204, { 'cache-control': 'no-store' })
            res.end()
            return
          }
          res.writeHead(200, { 'content-type': 'image/png', 'cache-control': 'private, max-age=3600', 'content-length': String(png.length) })
          res.end(png)
          return
        }

        if (route === '/stream' && entry.target.active) {
          const edge = url.searchParams.get('edge') === 'zoom' ? ZOOM_EDGE : FRAME_EDGE
          const streaming = await startStream(id, entry, edge)
          const stream = entry.stream
          const lingerIfIdle = () => {
            if (stream === undefined || entry.stream !== stream || stream.viewers.size > 0) return
            clearTimeout(stream.linger)
            stream.linger = setTimeout(() => { if (entry.stream === stream && stream.viewers.size === 0) stopStream(entry) }, LINGER_MS)
          }
          if (gone) {
            lingerIfIdle()
            return
          }
          if (streaming && stream !== undefined) {
            res.writeHead(200, { 'cache-control': 'no-store', 'content-type': `multipart/x-mixed-replace; boundary=${MJPEG_BOUNDARY}`, connection: 'keep-alive' })
            if (entry.frame !== undefined) writeMjpeg(res, entry.frame.bytes)
            clearTimeout(stream.linger)
            stream.viewers.set(res, edge)
            retune(entry).catch(() => {})
            res.on('close', () => {
              stream.viewers.delete(res)
              if (entry.stream !== stream) return
              if (stream.viewers.size > 0) {
                retune(entry).catch(() => {})
                return
              }
              lingerIfIdle()
            })
            return
          }
          // 起不来（没有 swiftc、没有权限、窗口没了）：落到下面按错误回
        }

        // 回合刚结束、补拍还没拍完（面板正开着就会碰上）：等它拍完再回，不先回「没有画面」
        if (entry.frame === undefined && entry.capturing !== undefined) await entry.capturing
        const frame = entry.frame
        // 进行中但这一步起不了流（窗口关了、中途停了、没权限）：说明原因，客户端就停在提示上，不再每 2 秒重连
        const halted = entry.target.active && entry.error !== undefined && blocked(entry)
        if (frame === undefined || halted) {
          if (entry.error !== undefined) sendJson(res, 503, { error: entry.error })
          else {
            res.writeHead(204, { 'cache-control': 'no-store' })
            res.end()
          }
          return
        }
        if (route === '/stream') {
          res.writeHead(200, { 'cache-control': 'no-store', 'content-type': `multipart/x-mixed-replace; boundary=${MJPEG_BOUNDARY}` })
          writeMjpeg(res, frame.bytes)
          res.end()
          return
        }
        if (req.headers['if-none-match'] === frame.etag) {
          res.writeHead(304, { 'cache-control': 'no-store', etag: frame.etag })
          res.end()
          return
        }
        res.writeHead(200, {
          'cache-control': 'no-store',
          'content-type': 'image/jpeg',
          etag: frame.etag,
          'content-length': String(frame.bytes.length),
          ...(frame.corners === undefined ? {} : { 'x-computer-corners': frame.corners.join(',') }),
        })
        res.end(frame.bytes)
      },
    }), 'computer-plus: panel routes')
  })
}
