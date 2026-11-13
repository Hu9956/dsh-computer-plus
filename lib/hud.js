import { spawn } from 'node:child_process'
import { daemonEnv } from './driver.js'

/**
 * 前台借用状态胶囊协调器（host 端）：
 * - 日常后台投递（95% 场景）绝不弹出任何浮窗；
 * - 仅在 Agent 显式请求 `foreground: true` 时启动顶部非抢焦胶囊（`computer-stream hud`）：
 *   1. 胶囊从无到有亮起时：先显示「即将切换到…」并缓冲 0.8s，防惊吓、防敲字串窗；
 *   2. 胶囊已亮着期间的连续前台动作：0 延迟直接执行，不重复缓冲；
 *   3. 回合结束（或前台动作空闲收尾）时：自动把焦点切回用户原前台应用，胶囊变绿显示「操作完成 · 可以继续使用了」1.8s 后淡出退出。
 */

const DEFAULT_PREP_MS = 800
const DEFAULT_IDLE_MS = 3500
const DEFAULT_DONE_HOLD_MS = 1800

/**
 * @typedef {{
 *   write: (msg: Record<string, unknown>) => void,
 *   close: () => void,
 *   kill: () => void,
 *   onExit: (cb: () => void) => void,
 * }} HudProcess
 */

/**
 * @param {string} binary
 * @returns {HudProcess}
 */
function defaultSpawnHud(binary) {
  const proc = spawn(binary, ['hud'], {
    stdio: ['pipe', 'ignore', 'ignore'],
    env: daemonEnv(),
  })
  proc.stdin?.on('error', () => {})
  proc.on('error', () => {})
  return {
    write(msg) {
      if (proc.exitCode === null && proc.signalCode === null && proc.stdin && !proc.stdin.destroyed) {
        try { proc.stdin.write(`${JSON.stringify(msg)}\n`) } catch {}
      }
    },
    close() {
      if (proc.stdin && !proc.stdin.destroyed) {
        try { proc.stdin.end() } catch {}
      }
    },
    kill() {
      if (proc.exitCode !== null || proc.signalCode !== null) return
      try { proc.kill('SIGTERM') } catch {}
      setTimeout(() => {
        if (proc.exitCode === null && proc.signalCode === null) {
          try { proc.kill('SIGKILL') } catch {}
        }
      }, 1500).unref()
    },
    onExit(cb) {
      proc.once('exit', () => cb())
      proc.once('error', () => cb())
    },
  }
}

/**
 * @param {number} ms
 * @param {AbortSignal} signal
 */
function waitAbortable(ms, signal) {
  if (ms <= 0) return Promise.resolve()
  if (signal.aborted) return Promise.reject(signal.reason ?? new Error('Aborted'))
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal.reason ?? new Error('Aborted'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve(undefined)
    }, ms)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * @param {{
 *   helper: () => Promise<string | undefined>,
 *   spawnHud?: (binary: string) => HudProcess,
 *   prepDelayMs?: number,
 *   idleHoldMs?: number,
 *   doneHoldMs?: number,
 * }} deps
 */
export function createForegroundHud(deps) {
  const spawnHud = deps.spawnHud ?? defaultSpawnHud
  const prepDelayMs = deps.prepDelayMs ?? DEFAULT_PREP_MS
  const idleHoldMs = deps.idleHoldMs ?? DEFAULT_IDLE_MS
  const doneHoldMs = deps.doneHoldMs ?? DEFAULT_DONE_HOLD_MS

  /**
   * @type {{
   *   sessionId: string,
   *   lastPid: number,
   *   proc: HudProcess,
   *   phase: 'preparing' | 'active',
   *   prepAbort: AbortController,
   *   prepReady: Promise<void>,
   *   inFlight: number,
   *   waiters: number,
   *   idleTimer?: ReturnType<typeof setTimeout>,
   * } | undefined}
   */
  let current
  /** @type {Set<HudProcess>} */
  const fadingOut = new Set()
  let disposed = false

  /**
   * @param {'done' | 'aborted'} kind
   */
  const finish = (kind) => {
    const active = current
    if (active === undefined) return
    current = undefined
    clearTimeout(active.idleTimer)
    active.prepAbort.abort()
    const holdMs = kind === 'done' ? doneHoldMs : Math.min(doneHoldMs, 1400)
    fadingOut.add(active.proc)
    active.proc.onExit(() => fadingOut.delete(active.proc))
    active.proc.write({ state: kind, pid: active.lastPid, holdMs })
    active.proc.close()
    setTimeout(() => {
      if (fadingOut.has(active.proc)) {
        fadingOut.delete(active.proc)
        active.proc.kill()
      }
    }, holdMs + 1500).unref()
  }

  /**
   * 包裹一次 `foreground: true` 工具动作
   * @template T
   * @param {string} sessionId
   * @param {number} pid
   * @param {AbortSignal | undefined} signal
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
  const runForeground = async (sessionId, pid, signal, fn) => {
    if (disposed) throw new Error('Computer Plus disposed')
    signal?.throwIfAborted?.()

    if (current !== undefined) {
      clearTimeout(current.idleTimer)
      current.idleTimer = undefined
      current.sessionId = sessionId
      current.lastPid = pid
    } else {
      const binary = await deps.helper()
      signal?.throwIfAborted?.()
      if (binary === undefined) return fn()
      // 可能并发的另一个调用在 await helper() 期间已经建好了 current
      if (current === undefined) {
        const proc = spawnHud(binary)
        const prepAbort = new AbortController()
        const prepReady = waitAbortable(prepDelayMs, prepAbort.signal)
        prepReady.catch(() => {})
        const entry = {
          sessionId,
          lastPid: pid,
          proc,
          phase: /** @type {'preparing' | 'active'} */ ('preparing'),
          prepAbort,
          prepReady,
          inFlight: 0,
          waiters: 0,
          idleTimer: undefined,
        }
        current = entry
        proc.onExit(() => {
          if (current === entry) {
            clearTimeout(entry.idleTimer)
            current = undefined
          }
        })
        proc.write({ state: 'preparing', pid })
      }
    }

    const entry = current
    if (entry === undefined) return fn()

    if (entry.phase === 'preparing') {
      entry.waiters++
      try {
        if (signal !== undefined) {
          await Promise.race([
            entry.prepReady,
            waitAbortable(prepDelayMs + 60_000, signal),
          ])
        } else {
          await entry.prepReady
        }
      } catch (error) {
        entry.waiters = Math.max(0, entry.waiters - 1)
        if (current === entry && entry.waiters === 0 && entry.inFlight === 0) finish('aborted')
        throw error
      }
      entry.waiters = Math.max(0, entry.waiters - 1)
    }

    signal?.throwIfAborted?.()
    entry.phase = 'active'
    entry.sessionId = sessionId
    entry.lastPid = pid
    entry.inFlight++
    entry.proc.write({ state: 'active', pid })

    try {
      return await fn()
    } finally {
      entry.inFlight = Math.max(0, entry.inFlight - 1)
      if (current === entry && entry.inFlight === 0 && entry.waiters === 0) {
        if (signal?.aborted) {
          finish('aborted')
        } else {
          clearTimeout(entry.idleTimer)
          entry.idleTimer = setTimeout(() => {
            if (current === entry && entry.inFlight === 0 && entry.waiters === 0) finish('done')
          }, idleHoldMs)
        }
      }
    }
  }

  /**
   * 对话回合结束时立即触发「使用完毕 / 已停止」收尾，不等空闲计时器
   * @param {string} sessionId
   * @param {'completed' | 'aborted' | 'error' | undefined} ended
   */
  const finishSession = (sessionId, ended) => {
    if (current === undefined || current.sessionId !== sessionId) return
    if (current.inFlight > 0 || current.waiters > 0) return
    finish(ended === 'aborted' ? 'aborted' : 'done')
  }

  const dispose = () => {
    disposed = true
    if (current !== undefined) {
      clearTimeout(current.idleTimer)
      current.prepAbort.abort()
      current.proc.kill()
      current = undefined
    }
    for (const proc of fadingOut) proc.kill()
    fadingOut.clear()
  }

  return { runForeground, finishSession, dispose }
}
