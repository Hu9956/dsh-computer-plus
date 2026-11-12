import { execFile } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

/**
 * 逐应用访问授权（host 端）：
 * - Agent 首次对某个应用调用 computer_launch_app 或任何窗口读取/点击/输入工具前，先认清目标应用身份并询问用户；
 * - 支持「仅本次会话允许」「始终允许」「拒绝」，与官方审批卡片（conversation.approval.card）打通；
 * - 「始终允许」与「拒绝」持久化在 ~/.dsh/computer-plus/permissions.json，可在插件详情页随时「撤销」或「允许再次询问」；
 * - 撤销授权时立即中止正在操控该应用的工具调用。
 */

export const APP_ACCESS_QUESTION_ID = 'computer-plus-app-access'
export const APPROVE_SESSION = 'Allow for this session'
export const APPROVE_ALWAYS = 'Always allow'
export const REJECT_ACCESS = 'Deny'

export const ACCESS_DISPLAY = {
  question: {
    en: 'Allow Computer Plus to read, capture, and control this application in the background?',
    zh: '允许「电脑操控 Plus」在后台读取、截图并操控此应用吗？',
  },
  detail: {
    en: 'You can revoke saved permissions or allow asking again anytime on the Computer Plus plugin page.',
    zh: '你可以随时在「电脑操控 Plus」插件详情页查看或撤销应用权限。',
  },
  approve: {
    en: APPROVE_SESSION,
    zh: '仅本次会话允许',
  },
}

const MAX_SESSIONS_PER_APP = 64

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   bundleId?: string,
 *   bundlePath?: string,
 *   executablePath?: string,
 * }} AppGrant
 *
 * @typedef {AppGrant & {
 *   persistable: boolean,
 *   icon?: string,
 * }} ResolvedApp
 *
 * @typedef {{
 *   identity: AppGrant,
 *   decision: 'allow' | 'deny' | 'ask',
 *   revision: number,
 * }} SessionDecision
 *
 * @typedef {{
 *   revoked: number,
 *   always?: AppGrant,
 *   sessions: Record<string, SessionDecision>,
 * }} AppRecord
 *
 * @typedef {{
 *   version: 1,
 *   applications: Record<string, AppRecord>,
 * }} PermissionFile
 */

/** @param {string} raw */
export function appIdOf(raw) {
  return createHash('sha256').update(raw).digest('hex')
}

/** @param {string} name */
function deniedError(name) {
  return new Error(`APP_ACCESS_DENIED: The user denied access to "${name}". Stop operating this application and do not use bash or other tools to bypass this decision unless the user explicitly asks again.`)
}

/** @param {string} name */
function revokedError(name) {
  return new Error(`APP_ACCESS_REVOKED: Access to "${name}" was revoked by the user. Stop operating this application immediately.`)
}

/**
 * @param {string} binary
 * @param {string[]} args
 * @param {boolean} [buffer]
 * @returns {Promise<Buffer | string | null>}
 */
function runHelper(binary, args, buffer = false) {
  return new Promise((done) => {
    execFile(binary, args, { encoding: buffer ? 'buffer' : 'utf8', timeout: 5000, maxBuffer: 2 * 1024 * 1024 }, (error, stdout) => {
      if (error) return done(null)
      if (buffer) return done(Buffer.isBuffer(stdout) && stdout.length > 0 ? stdout : null)
      const text = String(stdout ?? '').trim()
      done(text === '' ? null : text)
    })
  })
}

/**
 * 规整磁盘读出的权限结构，坏字段直接跳过，不让损坏文件把整个插件卡死
 * @param {unknown} raw
 * @returns {PermissionFile}
 */
function normalizeState(raw) {
  /** @type {Record<string, AppRecord>} */
  const applications = {}
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    const apps = /** @type {any} */ (raw).applications
    if (apps !== null && typeof apps === 'object' && !Array.isArray(apps)) {
      for (const [id, entry] of Object.entries(apps)) {
        if (!/^[a-f0-9]{64}$/.test(id) || entry === null || typeof entry !== 'object') continue
        const rec = /** @type {any} */ (entry)
        const revoked = Number.isSafeInteger(rec.revoked) && rec.revoked >= 0 ? rec.revoked : 0
        const always = cleanGrant(id, rec.always)
        /** @type {Record<string, SessionDecision>} */
        const sessions = {}
        if (rec.sessions !== null && typeof rec.sessions === 'object' && !Array.isArray(rec.sessions)) {
          for (const [sid, s] of Object.entries(rec.sessions)) {
            if (sid === '' || s === null || typeof s !== 'object') continue
            const sd = /** @type {any} */ (s)
            const grant = cleanGrant(id, sd.identity)
            if (grant === undefined) continue
            if (sd.decision !== 'allow' && sd.decision !== 'deny' && sd.decision !== 'ask') continue
            const revision = Number.isSafeInteger(sd.revision) && sd.revision >= 0 ? sd.revision : 0
            sessions[sid] = { identity: grant, decision: sd.decision, revision }
          }
        }
        applications[id] = { revoked, ...(always === undefined ? {} : { always }), sessions }
      }
    }
  }
  return { version: 1, applications }
}

/**
 * @param {string} expectedId
 * @param {unknown} value
 * @returns {AppGrant | undefined}
 */
function cleanGrant(expectedId, value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined
  const v = /** @type {any} */ (value)
  if (v.id !== expectedId || typeof v.name !== 'string' || v.name.trim() === '') return undefined
  return {
    id: expectedId,
    name: v.name,
    ...(typeof v.bundleId === 'string' && v.bundleId !== '' ? { bundleId: v.bundleId } : {}),
    ...(typeof v.bundlePath === 'string' && v.bundlePath !== '' ? { bundlePath: v.bundlePath } : {}),
    ...(typeof v.executablePath === 'string' && v.executablePath !== '' ? { executablePath: v.executablePath } : {}),
  }
}

/**
 * @param {AppGrant} grant
 * @returns {AppGrant}
 */
function stripGrant(grant) {
  return {
    id: grant.id,
    name: grant.name,
    ...(grant.bundleId ? { bundleId: grant.bundleId } : {}),
    ...(grant.bundlePath ? { bundlePath: grant.bundlePath } : {}),
    ...(grant.executablePath ? { executablePath: grant.executablePath } : {}),
  }
}

/**
 * @param {Record<string, SessionDecision>} sessions
 */
function trimSessions(sessions) {
  const keys = Object.keys(sessions)
  if (keys.length <= MAX_SESSIONS_PER_APP) return sessions
  return Object.fromEntries(keys.slice(keys.length - MAX_SESSIONS_PER_APP).map(k => [k, sessions[k]]))
}

/**
 * @param {any} ctx
 * @param {{
 *   helper: () => Promise<string | undefined>,
 *   driver: import('./driver.js').Driver,
 *   filePath?: string,
 *   resolveTarget?: (target: { pid?: number, bundleId?: string, name?: string }) => Promise<ResolvedApp>,
 * }} deps
 */
export function createAppAccess(ctx, deps) {
  const file = deps.filePath ?? join(process.env.HOME ?? homedir(), '.dsh', 'computer-plus', 'permissions.json')
  const lifetime = new AbortController()
  /** @type {Promise<void>} */
  let storeTail = Promise.resolve()
  /** @type {PermissionFile | undefined} */
  let cached
  /** @type {Map<string, Map<string, Promise<void>>>} */
  const selections = new Map()
  /** @type {Set<{ appId: string, name: string, controller: AbortController, done: Promise<void> }>} */
  const active = new Set()
  /** @type {Map<string, string>} */
  const iconCache = new Map()

  const rememberIcon = (/** @type {string} */ id, /** @type {string | undefined} */ icon) => {
    if (typeof icon !== 'string' || !icon.startsWith('data:image/png;base64,')) return
    iconCache.set(id, icon)
    while (iconCache.size > 48) iconCache.delete(/** @type {string} */ (iconCache.keys().next().value))
  }

  /**
   * 串行读写权限文件（原子替换，权限 0600）
   * @template T
   * @param {(state: PermissionFile, save: (next: PermissionFile) => Promise<void>) => Promise<T> | T} fn
   * @returns {Promise<T>}
   */
  const withState = (fn) => {
    const run = async () => {
      if (cached === undefined) {
        try {
          cached = normalizeState(JSON.parse(await readFile(file, 'utf8')))
        } catch (error) {
          if (/** @type {NodeJS.ErrnoException} */ (error).code !== 'ENOENT') {
            ctx.logger?.warn?.(`computer-plus: could not read permissions file, starting fresh: ${String(error)}`)
          }
          cached = { version: 1, applications: {} }
        }
      }
      const save = async (/** @type {PermissionFile} */ next) => {
        await mkdir(dirname(file), { recursive: true, mode: 0o700 })
        const tmp = `${file}.${randomUUID()}.tmp`
        try {
          await writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 })
          await rename(tmp, file)
          cached = next
        } catch (error) {
          await unlink(tmp).catch(() => {})
          throw error
        }
      }
      return fn(cached, save)
    }
    const task = storeTail.then(run, run)
    storeTail = task.then(() => {}, () => {})
    return task
  }

  /**
   * 在不启动、不激活目标应用的前提下认清它的身份与图标
   * @param {{ pid?: number, bundleId?: string, name?: string }} target
   * @returns {Promise<ResolvedApp>}
   */
  const defaultResolve = async (target) => {
    const binary = await deps.helper()
    if (binary !== undefined) {
      const args = typeof target.pid === 'number'
        ? ['app-info', 'pid', String(target.pid)]
        : typeof target.bundleId === 'string' && target.bundleId.trim() !== ''
          ? ['app-info', 'bundle', target.bundleId.trim()]
          : typeof target.name === 'string' && target.name.trim() !== ''
            ? ['app-info', 'name', target.name.trim()]
            : undefined
      if (args !== undefined) {
        const out = /** @type {string | null} */ (await runHelper(binary, args, false))
        if (out !== null) {
          try {
            const info = JSON.parse(out)
            const bundleId = typeof info.bundleId === 'string' && info.bundleId !== '' ? info.bundleId : undefined
            const bundlePath = typeof info.bundlePath === 'string' && info.bundlePath !== '' ? info.bundlePath : undefined
            const executablePath = typeof info.executablePath === 'string' && info.executablePath !== '' ? info.executablePath : undefined
            const key = bundleId !== undefined
              ? `bundle:${bundleId}`
              : (bundlePath ?? executablePath) !== undefined
                ? `path:${bundlePath ?? executablePath}`
                : `pid:${target.pid ?? info.pid ?? 'unknown'}`
            const id = appIdOf(key)
            const icon = typeof info.icon === 'string' ? info.icon : undefined
            rememberIcon(id, icon)
            return {
              id,
              name: typeof info.name === 'string' && info.name !== '' ? info.name : (bundleId ?? String(target.name ?? target.pid ?? 'Application')),
              ...(bundleId ? { bundleId } : {}),
              ...(bundlePath ? { bundlePath } : {}),
              ...(executablePath ? { executablePath } : {}),
              persistable: bundleId !== undefined || bundlePath !== undefined || executablePath !== undefined,
              ...(icon ? { icon } : {}),
            }
          } catch { /* fall through to list_apps */ }
        }
      }
    }

    // 兜底：通过 cua-driver 的只读 list_apps 查询（不启动目标应用）
    const listed = await deps.driver.call('list_apps', {}, { timeout: 10_000 })
    const apps = Array.isArray(listed?.apps) ? listed.apps : []
    const needleName = typeof target.name === 'string' ? target.name.trim().replace(/\.app$/i, '').toLowerCase() : undefined
    const matched = apps.find((/** @type {any} */ app) => {
      if (typeof target.pid === 'number') return app?.running === true && app?.pid === target.pid
      if (typeof target.bundleId === 'string' && target.bundleId !== '') return app?.bundle_id === target.bundleId
      if (needleName !== undefined && needleName !== '') return String(app?.name ?? '').toLowerCase() === needleName
      return false
    })
    if (matched !== undefined) {
      const bundleId = typeof matched.bundle_id === 'string' && matched.bundle_id !== '' ? matched.bundle_id : undefined
      const bundlePath = typeof matched.launch_path === 'string' && matched.launch_path !== '' ? matched.launch_path : undefined
      const key = bundleId !== undefined ? `bundle:${bundleId}` : bundlePath !== undefined ? `path:${bundlePath}` : `pid:${matched.pid}`
      return {
        id: appIdOf(key),
        name: typeof matched.name === 'string' && matched.name !== '' ? matched.name : (bundleId ?? 'Application'),
        ...(bundleId ? { bundleId } : {}),
        ...(bundlePath ? { bundlePath } : {}),
        persistable: bundleId !== undefined || bundlePath !== undefined,
      }
    }
    if (typeof target.pid === 'number') throw new Error(`Target application process (pid ${target.pid}) is not running.`)
    throw new Error(`Application not found: ${target.bundleId ?? target.name ?? 'unknown'}.`)
  }

  const resolve = deps.resolveTarget ?? defaultResolve

  /**
   * 同一对话对同一应用的并发工具调用只弹一次框，后面的排在同一个承诺后面复用结果
   * @param {string} sessionId
   * @param {string} appId
   * @param {() => Promise<void>} fn
   */
  const selectInOrder = async (sessionId, appId, fn) => {
    let byApp = selections.get(sessionId)
    if (byApp === undefined) {
      byApp = new Map()
      selections.set(sessionId, byApp)
    }
    const next = (byApp.get(appId) ?? Promise.resolve()).then(fn, fn)
    byApp.set(appId, next)
    try {
      await next
    } finally {
      if (byApp.get(appId) === next) byApp.delete(appId)
      if (byApp.size === 0) selections.delete(sessionId)
    }
  }

  /**
   * @param {string} sessionId
   * @param {ResolvedApp} app
   * @param {'allow' | 'deny'} decision
   * @param {boolean} [always]
   */
  const recordDecision = (sessionId, app, decision, always = false) => withState(async (state, save) => {
    const prev = state.applications[app.id] ?? { revoked: 0, sessions: {} }
    const grant = stripGrant(app)
    const revision = (prev.sessions[sessionId]?.revision ?? 0) + 1
    const nextRecord = {
      revoked: prev.revoked,
      ...(always ? { always: grant } : prev.always ? { always: prev.always } : {}),
      sessions: trimSessions({
        ...prev.sessions,
        [sessionId]: { identity: grant, decision, revision },
      }),
    }
    await save({ ...state, applications: { ...state.applications, [app.id]: nextRecord } })
    return { revoked: nextRecord.revoked, revision }
  })

  /**
   * 工具调用入口：先取得或验证应用授权，再在可撤销的生命周期里执行原生操作
   * @template T
   * @param {{ pid?: number, bundleId?: string, name?: string }} target
   * @param {any} exec
   * @param {(signal: AbortSignal) => Promise<T>} fn
   * @returns {Promise<T>}
   */
  const withAppAccess = async (target, exec, fn) => {
    const sessionId = exec?.agent?.session?.id
    if (typeof sessionId !== 'string' || sessionId === '') throw new Error('computer tools need a conversation')
    const baseSignal = exec?.signal ? AbortSignal.any([exec.signal, lifetime.signal]) : lifetime.signal
    baseSignal.throwIfAborted()

    const identity = await resolve(target)
    baseSignal.throwIfAborted()

    /** @type {{ scope: 'persistent' | 'session', revoked: number, revision: number } | undefined} */
    let ticket
    await selectInOrder(sessionId, identity.id, async () => {
      baseSignal.throwIfAborted()
      const current = await withState(state => state.applications[identity.id] ?? { revoked: 0, sessions: {} })
      const saved = identity.persistable && current.always !== undefined
      const session = current.sessions[sessionId]
      if (saved) {
        ticket = { scope: 'persistent', revoked: current.revoked, revision: session?.revision ?? 0 }
        return
      }
      if (session?.decision === 'allow') {
        ticket = { scope: 'session', revoked: current.revoked, revision: session.revision }
        return
      }
      if (session?.decision === 'deny') throw deniedError(identity.name)

      if (exec?.agent?.session?.header?.origin === 'subagent') {
        throw new Error(`APP_APPROVAL_UNAVAILABLE: Application approval for "${identity.name}" is unavailable in delegated subagents; ask the main conversation to authorize or operate this application.`)
      }
      const questions = ctx.get?.('userQuestions')
      if (typeof questions?.ask !== 'function') {
        throw new Error(`APP_APPROVAL_UNAVAILABLE: No human approval channel is available to authorize "${identity.name}".`)
      }
      const options = [{ label: APPROVE_SESSION }, { label: REJECT_ACCESS }]
      if (identity.persistable) options.push({ label: APPROVE_ALWAYS })

      /** @type {any} */
      let reply
      try {
        reply = await questions.ask({
          agent: exec.agent,
          signal: baseSignal,
          questions: [{
            id: APP_ACCESS_QUESTION_ID,
            question: `Allow Computer Plus to read, capture, and control ${identity.name}?`,
            detail: ACCESS_DISPLAY.detail.en,
            options,
            intent: {
              kind: 'approval',
              approve: APPROVE_SESSION,
              reject: REJECT_ACCESS,
              ...(identity.persistable ? { always: APPROVE_ALWAYS } : {}),
              subject: {
                name: identity.name,
                ...(identity.icon === undefined ? {} : { icon: identity.icon }),
              },
              display: ACCESS_DISPLAY,
            },
          }],
        })
      } catch (error) {
        const code = /** @type {any} */ (error)?.code
        if (code === 'ASK_CANCELLED') {
          if (!lifetime.signal.aborted && !exec?.signal?.aborted) await recordDecision(sessionId, identity, 'deny')
          throw deniedError(identity.name)
        }
        if (code === 'DELEGATED_CALLER') {
          throw new Error(`APP_APPROVAL_UNAVAILABLE: Application approval for "${identity.name}" is unavailable in delegated subagents; ask the main conversation to perform this operation.`)
        }
        throw error
      }

      baseSignal.throwIfAborted()
      const answer = Array.isArray(reply?.answers) ? reply.answers.find((/** @type {any} */ a) => a?.id === APP_ACCESS_QUESTION_ID) : undefined
      const chosen = answer && !String(answer.custom ?? '').trim() && Array.isArray(answer.selected) && answer.selected.length === 1
        ? answer.selected[0]
        : undefined

      if (chosen !== APPROVE_SESSION && !(chosen === APPROVE_ALWAYS && identity.persistable)) {
        await recordDecision(sessionId, identity, 'deny')
        throw deniedError(identity.name)
      }

      const wantAlways = chosen === APPROVE_ALWAYS && identity.persistable
      ticket = await withState(async (state, save) => {
        const latest = state.applications[identity.id] ?? { revoked: 0, sessions: {} }
        if (latest.revoked !== current.revoked || latest.sessions[sessionId]?.revision !== current.sessions[sessionId]?.revision) {
          throw revokedError(identity.name)
        }
        const grant = stripGrant(identity)
        const revision = (latest.sessions[sessionId]?.revision ?? 0) + 1
        const nextRecord = {
          revoked: latest.revoked,
          ...(wantAlways ? { always: grant } : latest.always ? { always: latest.always } : {}),
          sessions: trimSessions({
            ...latest.sessions,
            [sessionId]: { identity: grant, decision: 'allow', revision },
          }),
        }
        await save({ ...state, applications: { ...state.applications, [identity.id]: nextRecord } })
        return { scope: wantAlways ? /** @type {const} */ ('persistent') : /** @type {const} */ ('session'), revoked: nextRecord.revoked, revision }
      })
    })

    const admitted = ticket
    if (admitted === undefined) throw deniedError(identity.name)

    const controller = new AbortController()
    /** @type {() => void} */
    let finish = () => {}
    const done = new Promise(r => { finish = () => r(undefined) })
    const op = { appId: identity.id, name: identity.name, controller, done }
    active.add(op)
    const opSignal = AbortSignal.any([baseSignal, controller.signal])

    try {
      const stillPermitted = await withState((state) => {
        const rec = state.applications[identity.id]
        if (rec === undefined || rec.revoked !== admitted.revoked) return false
        if (admitted.scope === 'persistent') return rec.always !== undefined
        const s = rec.sessions[sessionId]
        return s?.decision === 'allow' && s.revision === admitted.revision
      })
      if (!stillPermitted) throw revokedError(identity.name)
      opSignal.throwIfAborted()
      const out = await fn(opSignal)
      if (controller.signal.aborted) throw controller.signal.reason
      return out
    } catch (error) {
      if (controller.signal.aborted) throw controller.signal.reason
      throw error
    } finally {
      active.delete(op)
      finish()
    }
  }

  /**
   * 供插件设置页展示当前「始终允许」和「已拒绝」的应用及图标
   */
  const status = async () => {
    const snapshot = await withState((state) => {
      /** @type {AppGrant[]} */
      const allowedApps = []
      /** @type {AppGrant[]} */
      const blockedApps = []
      for (const rec of Object.values(state.applications)) {
        if (rec.always !== undefined) {
          allowedApps.push(rec.always)
        } else {
          const denied = Object.values(rec.sessions).find(s => s.decision === 'deny')
          if (denied !== undefined) blockedApps.push(denied.identity)
        }
      }
      return { allowedApps, blockedApps }
    })

    /** @type {Record<string, string>} */
    const icons = {}
    const binary = await deps.helper()
    for (const app of [...snapshot.allowedApps, ...snapshot.blockedApps]) {
      const hit = iconCache.get(app.id)
      if (hit !== undefined) {
        icons[app.id] = hit
        continue
      }
      const iconPath = app.bundlePath ?? app.executablePath
      if (binary !== undefined && typeof iconPath === 'string' && iconPath !== '') {
        const png = /** @type {Buffer | null} */ (await runHelper(binary, ['icon-path', iconPath], true))
        if (png !== null) {
          const dataUrl = `data:image/png;base64,${png.toString('base64')}`
          rememberIcon(app.id, dataUrl)
          icons[app.id] = dataUrl
        }
      }
    }
    return { ...snapshot, icons }
  }

  /**
   * 撤销某个应用的授权：清除「始终允许」、把现有会话改为拒绝，并立即打断正在操控它的工具调用
   * @param {string} id
   */
  const revoke = async (id) => {
    if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) throw new Error('Invalid application id')
    /** @type {Promise<void>[]} */
    const running = []
    for (const op of active) {
      if (op.appId === id) {
        op.controller.abort(revokedError(op.name))
        running.push(op.done)
      }
    }
    await withState(async (state, save) => {
      const prev = state.applications[id] ?? { revoked: 0, sessions: {} }
      const nextSessions = Object.fromEntries(
        Object.entries(prev.sessions).map(([sid, s]) => [sid, { ...s, decision: /** @type {const} */ ('deny'), revision: s.revision + 1 }]),
      )
      await save({
        ...state,
        applications: {
          ...state.applications,
          [id]: { revoked: prev.revoked + 1, sessions: nextSessions },
        },
      })
    })
    await Promise.allSettled(running)
  }

  /**
   * 允许再次询问：清除该应用的拒绝记录（不直接授予权限，下次 Agent 访问时会重新弹窗询问）
   * @param {string} id
   */
  const retryApproval = async (id) => {
    if (typeof id !== 'string' || !/^[a-f0-9]{64}$/.test(id)) throw new Error('Invalid application id')
    await withState(async (state, save) => {
      const prev = state.applications[id]
      if (prev === undefined) return
      const nextSessions = Object.fromEntries(
        Object.entries(prev.sessions).map(([sid, s]) => [sid, s.decision === 'deny' ? { ...s, decision: /** @type {const} */ ('ask'), revision: s.revision + 1 } : s]),
      )
      const hasUseful = prev.always !== undefined || Object.values(nextSessions).some(s => s.decision === 'allow')
      const nextApps = { ...state.applications }
      if (hasUseful) nextApps[id] = { ...prev, sessions: nextSessions }
      else delete nextApps[id]
      await save({ ...state, applications: nextApps })
    })
  }

  const dispose = async () => {
    lifetime.abort()
    for (const op of active) op.controller.abort(new Error('Computer Plus disposed'))
    await Promise.allSettled([...[...active].map(o => o.done), storeTail])
  }

  return { withAppAccess, status, revoke, retryApproval, dispose }
}
