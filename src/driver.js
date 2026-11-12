import { execFile } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * 调 cua-driver（命令行 `cua-driver call <工具> <JSON>`，和 Agent 在 bash 里调的是同一个守护进程、同一套权限）。
 *
 * - 不经 shell：参数原样传给 execFile，没有注入面
 * - 出错时 cua-driver 退出码 1，错误 JSON 在 stdout（实测 2026-11-01：`{"code":"px_window_not_found",...}`），
 *   被拒绝的原因在 stderr（`session has ended; ...`）。两种都原样交给 Agent
 * - session 名由插件代填（每个 DSH 对话一个），回合结束时插件 end_session；
 *   下一次再用这个名字前先 start_session（实测结束后的名字会被拒绝，要先 start_session 才能再用）
 * - 守护进程没在跑：按 cua-driver 文档的方式启动一次（`open -n -g -a CuaDriver --args serve`），再试一次
 */

/** cua-driver 的位置：GUI 应用的 PATH 往往不含 ~/.local/bin，按官方安装位置挨个找 */
export async function findCuaDriver() {
  const home = process.env.HOME ?? ''
  const candidates = [
    join(home, '.local/bin/cua-driver'),
    '/opt/homebrew/bin/cua-driver',
    '/usr/local/bin/cua-driver',
    '/Applications/CuaDriver.app/Contents/MacOS/cua-driver',
    join(home, 'Applications/CuaDriver.app/Contents/MacOS/cua-driver'),
  ]
  for (const file of candidates) {
    if (await stat(file).then(info => info.isFile(), () => false)) return file
  }
  return undefined
}

/** cua-driver 报的错（给 Agent 看的原文） */
export class DriverError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message)
    this.name = 'DriverError'
  }
}

/** 一次调用最多带回多少输出（大应用的界面树 + 截图 base64 可能有几十 MB） */
const MAX_OUTPUT = 64 * 1024 * 1024
/** 错误原文最多给 Agent 多少字 */
const MAX_ERROR_TEXT = 4000

/**
 * @typedef {{ code: number, stdout: string, stderr: string }} RunResult
 * @typedef {{ signal?: AbortSignal, timeout?: number, label?: string }} CallOptions
 */

/**
 * 跑一次命令。退出码非 0 不算异常（cua-driver 的错误在输出里），只有起不来、超时、被取消才抛
 * @param {string} file
 * @param {string[]} args
 * @param {AbortSignal | undefined} signal
 * @param {number} timeout
 * @param {NodeJS.ProcessEnv} [env] 不给就用本进程的
 * @returns {Promise<RunResult>}
 */
export function runFile(file, args, signal, timeout, env) {
  return new Promise((done, fail) => {
    execFile(file, args, { timeout, maxBuffer: MAX_OUTPUT, encoding: 'utf8', ...(signal === undefined ? {} : { signal }), ...(env === undefined ? {} : { env }) }, (error, stdout, stderr) => {
      const err = /** @type {any} */ (error)
      if (err === null || err === undefined) return done({ code: 0, stdout: String(stdout ?? ''), stderr: String(stderr ?? '') })
      if (err.name === 'AbortError' || err.code === 'ABORT_ERR') return fail(err)
      if (err.killed === true) return fail(new DriverError(`cua-driver did not answer within ${Math.round(timeout / 1000)} s`))
      if (typeof err.code !== 'number') return fail(err)
      done({ code: err.code, stdout: String(stdout ?? ''), stderr: String(stderr ?? '') })
    })
  })
}

// 只看失败时的 stderr（实测 0.30.4：守护进程不在时退出码 1、stdout 为空、stderr「Cua Driver daemon is not running on …」）。
// 不能看 stdout：成功的结果里可能带这句话（窗口里正显示着这行字），误判会把已经做成的点击再做一次（2026-11-02 审查）
const needsDaemon = (/** @type {RunResult} */ r) => r.code !== 0 && /daemon is not running/i.test(r.stderr)
const sessionEnded = (/** @type {RunResult} */ r) => r.code !== 0 && /session has ended/i.test(`${r.stdout}\n${r.stderr}`)

/**
 * 结果转成对象；不是 JSON 对象、或退出码非 0，都按 cua-driver 的原文报错
 * @param {string} tool
 * @param {RunResult} result
 * @returns {Record<string, any>}
 */
export function parseResult(tool, result) {
  const text = result.stdout.trim()
  /** @type {unknown} */
  let json
  try { json = JSON.parse(text) } catch { json = undefined }
  if (result.code === 0 && json !== null && typeof json === 'object' && !Array.isArray(json)) return /** @type {Record<string, any>} */ (json)
  const detail = [text, result.stderr.trim()].filter(Boolean).join('\n') || `exit code ${result.code}`
  throw new DriverError(`cua-driver ${tool} failed: ${detail.slice(0, MAX_ERROR_TEXT)}`)
}

/**
 * @param {{
 *   path?: () => Promise<string | undefined>,
 *   startDaemon?: (cua: string) => Promise<void>,
 *   logger?: any,
 * }} [options]
 */
export function createDriver(options = {}) {
  /** @type {Promise<string | undefined> | undefined} */
  let found
  const path = options.path ?? (() => {
    found ??= findCuaDriver().then((res) => {
      if (res === undefined) found = undefined
      return res
    }, () => {
      found = undefined
      return undefined
    })
    return found
  })
  /** 本进程里结束过的 session 名：下次用之前先 start_session */
  const ended = new Set()
  /** 本进程里用过、还没结束的 session 名（回合结束时只结束这些） */
  const live = new Set()
  /** @type {Promise<void> | undefined} */
  let starting

  /** @param {string} cua */
  const startDaemon = (cua) => (starting ??= (options.startDaemon ?? defaultStartDaemon)(cua).finally(() => { starting = undefined }))

  /**
   * 等守护进程启动，但用户按停止就不再等（启动本身继续，下一次调用会用上）
   * @param {string} cua
   * @param {AbortSignal | undefined} signal
   */
  const awaitDaemon = (cua, signal) => {
    const started = startDaemon(cua)
    if (signal === undefined) return started
    signal.throwIfAborted()
    return new Promise((done, fail) => {
      const onAbort = () => fail(signal.reason)
      signal.addEventListener('abort', onAbort, { once: true })
      started.then(done, fail).finally(() => signal.removeEventListener('abort', onAbort))
    })
  }

  /**
   * @param {string} tool
   * @param {Record<string, unknown>} args
   * @param {AbortSignal | undefined} signal
   * @param {number} timeout
   */
  const once = async (tool, args, signal, timeout) => {
    const cua = await path()
    if (cua === undefined) throw new DriverError('cua-driver is not installed (looked in ~/.local/bin, /opt/homebrew/bin and /usr/local/bin)')
    let result = await runFile(cua, ['call', tool, JSON.stringify(args)], signal, timeout)
    if (needsDaemon(result)) {
      options.logger?.info?.('computer-plus: cua-driver daemon not running, starting it')
      await awaitDaemon(cua, signal)
      result = await runFile(cua, ['call', tool, JSON.stringify(args)], signal, timeout)
    }
    return result
  }

  /**
   * @param {string} label
   * @param {AbortSignal | undefined} signal
   */
  const revive = async (label, signal) => {
    await once('start_session', { session: label }, signal, 10_000)
    ended.delete(label)
  }

  return {
    /**
     * 调一个 cua-driver 工具。label 有值就代填 session（工具本身要支持 session 参数）
     * @param {string} tool
     * @param {Record<string, unknown>} args
     * @param {CallOptions} [opts]
     */
    async call(tool, args, opts = {}) {
      const { signal, timeout = 30_000, label } = opts
      const full = label === undefined ? args : { ...args, session: label }
      if (label !== undefined && ended.has(label)) await revive(label, signal)
      // 先记下：调用被中断或超时，守护进程那边可能已经建了 session、亮了光标，回合结束时也要结束它
      if (label !== undefined) live.add(label)
      let result = await once(tool, full, signal, timeout)
      // 名字被结束过（DSH 重启前结束的，这个进程不知道）：被拒绝的调用没有执行，start_session 后重试一次是安全的
      if (label !== undefined && sessionEnded(result)) {
        await revive(label, signal)
        result = await once(tool, full, signal, timeout)
      }
      return parseResult(tool, result)
    },
    /**
     * 回合结束：结束这个对话的 cua-driver session（光标叠加层随之消失）。只结束本进程用过的；失败不管。
     * 守护进程不在就算了，不去启动它：用户可能是特意退出 CuaDriver 收回控制权（2026-11-02 审查）
     * @param {string} label
     */
    async endSession(label) {
      if (!live.has(label)) return
      live.delete(label)
      ended.add(label)
      const cua = await path()
      if (cua === undefined) return
      await runFile(cua, ['call', 'end_session', JSON.stringify({ session: label })], undefined, 10_000).catch(() => {})
    },
    /**
     * 只读调用（面板用：list_windows、get_agent_cursor_state）。不代填、不启动守护进程以外的任何东西
     * @param {string} tool
     * @param {Record<string, unknown>} args
     * @param {number} [timeout]
     */
    async read(tool, args, timeout = 4000) {
      const cua = await path()
      if (cua === undefined) throw new DriverError('cua-driver is not installed')
      return parseResult(tool, await runFile(cua, ['call', tool, JSON.stringify(args)], undefined, timeout))
    },
    /** 有没有 cua-driver（面板据此提示「没有找到 cua-driver」） */
    available: async () => (await path()) !== undefined,
    /** 解析出的 cua-driver 路径（设置页体检用） */
    path,
  }
}

/** @typedef {ReturnType<typeof createDriver>} Driver */

/**
 * 启动守护进程时不带的环境变量。DSH 自己是 Electron 应用，给子进程设了 ELECTRON_RUN_AS_NODE=1；
 * `open` 会把调用方的环境原样交给 CuaDriver，守护进程再交给它启动的每个应用，
 * Cursor、Slack 这类 Electron 应用带着它会当成纯 Node 启动、两秒就退出
 * （2026-11-02 真机：launch_app 打开 Cursor 两次都秒退；用探针应用确认守护进程启动的应用带着这个变量）
 */
const DAEMON_ENV_DROP = ['ELECTRON_RUN_AS_NODE', 'ELECTRON_NO_ATTACH_CONSOLE', 'NODE_OPTIONS']

/** 给守护进程用的环境：去掉上面那几个 @param {NodeJS.ProcessEnv} [env] */
export function daemonEnv(env = process.env) {
  const out = { ...env }
  for (const key of DAEMON_ENV_DROP) delete out[key]
  return out
}

/**
 * 按 cua-driver 文档启动守护进程：经 LaunchServices 打开 CuaDriver.app（权限算在 CuaDriver 名下），等它就绪
 * @param {string} cua
 */
async function defaultStartDaemon(cua) {
  await runFile('/usr/bin/open', ['-n', '-g', '-a', 'CuaDriver', '--args', 'serve'], undefined, 10_000, daemonEnv())
  for (let i = 0; i < 16; i++) {
    await new Promise(r => setTimeout(r, 500))
    const status = await runFile(cua, ['status'], undefined, 4000).catch(() => undefined)
    if (status !== undefined && /daemon is running/i.test(status.stdout)) return
  }
}
