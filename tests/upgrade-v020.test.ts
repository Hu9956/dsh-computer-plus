import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { chmod, mkdtemp, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  APP_ACCESS_QUESTION_ID,
  APPROVE_ALWAYS,
  APPROVE_SESSION,
  REJECT_ACCESS,
  appIdOf,
  createAppAccess,
} from '../src/access.js'
import { selectAppApproval } from '../src/client/AppApproval.tsx'
import { createForegroundHud } from '../src/hud.js'
import { apply, resolvePrebuiltHelper } from '../src/index.js'
import { createSetupManager, enclosingAppBundle } from '../src/setup.js'
import { registerComputerTools } from '../src/tools.js'

function collectTools(opts: {
  reply?: (tool: string, args: any, meta: any) => any
  withAppAccess?: any
  runForeground?: any
} = {}) {
  const registered: Record<string, any> = {}
  const calls: Array<[string, any]> = []
  const ctx = {
    inject: (_k: unknown, fn: (scope: any) => void) => fn({
      tools: { register: (def: any) => { registered[def.name] = def } },
    }),
    get: () => undefined,
  }
  const driver = {
    call: async (tool: string, args: any, meta: any) => {
      calls.push([tool, args])
      return opts.reply ? opts.reply(tool, args, meta) : { summary: 'ok', effect: 'verified' }
    },
  }
  registerComputerTools(ctx, {
    driver: driver as any,
    labelOf: (s: string) => `dsh-${s}`,
    ...(opts.withAppAccess ? { withAppAccess: opts.withAppAccess } : {}),
    ...(opts.runForeground ? { runForeground: opts.runForeground } : {}),
  })
  return { tools: registered, calls, exec: { agent: { session: { id: 'sess-1' } } } }
}

test('v0.2.1 精简预算：7 个工具保持不变，加入 foreground 逃生口后总 schema 仍极度克制（≤ 7,800 字符）', () => {
  const { tools } = collectTools()
  const names = Object.keys(tools)
  assert.equal(names.length, 7)
  const serialized = JSON.stringify(names.map(n => ({
    name: tools[n].name,
    description: tools[n].description,
    parameters: tools[n].parameters,
  })))
  assert.ok(serialized.length <= 7800, `schema grew unexpectedly to ${serialized.length} chars`)
})

test('computer_click：按元素编号传 count=2 自动转调 double_click；坐标点击继续走 click；不支持的组合报清楚错', async () => {
  const { tools, calls, exec } = collectTools()

  await tools.computer_click.execute({ pid: 10, window_id: 20, element_index: 5, snapshot_id: 's1', count: 2 }, exec)
  assert.deepEqual(calls.at(-1), ['double_click', { pid: 10, window_id: 20, element_index: 5, snapshot_id: 's1' }])

  await tools.computer_click.execute({ pid: 10, window_id: 20, element_index: 5, snapshot_id: 's1', count: 1 }, exec)
  assert.deepEqual(calls.at(-1), ['click', { pid: 10, window_id: 20, element_index: 5, snapshot_id: 's1' }])

  await tools.computer_click.execute({ pid: 10, window_id: 20, x: 100, y: 200, count: 2 }, exec)
  assert.deepEqual(calls.at(-1), ['click', { pid: 10, window_id: 20, x: 100, y: 200, count: 2 }])

  await assert.rejects(
    tools.computer_click.execute({ pid: 10, window_id: 20, element_index: 5, snapshot_id: 's1', count: 2, button: 'right' }, exec),
    /double-click on element_index supports only the left button/,
  )
  await assert.rejects(
    tools.computer_click.execute({ pid: 10, window_id: 20, element_index: 5, snapshot_id: 's1', count: 3 }, exec),
    /triple-click requires x and y coordinates/,
  )
})

test('预编译取流组件：assets/computer-stream 随包就绪，无需 swiftc；丢失执行位时可自动恢复', async () => {
  const bundled = await resolvePrebuiltHelper()
  if (process.platform === 'darwin') {
    assert.ok(bundled && bundled.endsWith('assets/computer-stream'), `expected prebuilt helper, got ${String(bundled)}`)
    const dir = await mkdtemp(join(tmpdir(), 'cp-helper-'))
    const copy = join(dir, 'helper')
    await writeFile(copy, '#!/bin/sh\nexit 0\n')
    await chmod(copy, 0o644)
    const fixed = await resolvePrebuiltHelper(copy)
    assert.equal(fixed, copy)
    const mode = (await stat(copy)).mode & 0o111
    assert.notEqual(mode, 0)
  } else {
    assert.equal(bundled, undefined)
  }
})

test('逐应用授权：并发调用只问一次、拒绝时在 launch_app 之前拦下、始终允许跨实例持久化、撤销立即打断进行中操作、允许再次询问可重新弹窗', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'cp-access-'))
  const filePath = join(dir, 'permissions.json')
  const calcId = appIdOf('bundle:com.apple.calculator')
  let prompts = 0
  let nextChoice = APPROVE_SESSION

  const makeCtx = () => ({
    get(service: string) {
      if (service !== 'userQuestions') return undefined
      return {
        async ask(req: any) {
          prompts++
          assert.equal(req.questions[0].id, APP_ACCESS_QUESTION_ID)
          assert.equal(req.questions[0].intent.kind, 'approval')
          await new Promise(r => setTimeout(r, 25))
          return { answers: [{ id: APP_ACCESS_QUESTION_ID, selected: [nextChoice] }] }
        },
      }
    },
  })

  const resolveCalc = async () => ({
    id: calcId,
    name: '计算器',
    bundleId: 'com.apple.calculator',
    bundlePath: '/System/Applications/Calculator.app',
    persistable: true,
    icon: 'data:image/png;base64,AA==',
  })

  const access1 = createAppAccess(makeCtx(), {
    driver: { call: async () => ({ apps: [] }) } as any,
    helper: async () => undefined,
    filePath,
    resolveTarget: resolveCalc,
  })

  // 1) 同一会话并发两次操控同一应用：只弹一次授权框
  const [r1, r2] = await Promise.all([
    access1.withAppAccess({ pid: 55 }, { agent: { session: { id: 's-concurrent' } } }, async () => 'one'),
    access1.withAppAccess({ pid: 55 }, { agent: { session: { id: 's-concurrent' } } }, async () => 'two'),
  ])
  assert.deepEqual([r1, r2], ['one', 'two'])
  assert.equal(prompts, 1)

  // 2) 用户点「拒绝」时：computer_launch_app 在调 cua-driver launch_app 之前就被拦住
  nextChoice = REJECT_ACCESS
  const { tools, calls } = collectTools({ withAppAccess: access1.withAppAccess })
  await assert.rejects(
    tools.computer_launch_app.execute({ bundle_id: 'com.apple.calculator' }, { agent: { session: { id: 's-deny' } } }),
    /APP_ACCESS_DENIED/,
  )
  assert.equal(calls.length, 0, '未获授权绝不启动目标应用')
  assert.equal((await access1.status()).blockedApps.length, 1)

  // 同一会话再次尝试不再骚扰用户弹窗，直接拒绝
  const promptsBeforeRepeat = prompts
  await assert.rejects(
    tools.computer_launch_app.execute({ bundle_id: 'com.apple.calculator' }, { agent: { session: { id: 's-deny' } } }),
    /APP_ACCESS_DENIED/,
  )
  assert.equal(prompts, promptsBeforeRepeat)

  // 点「允许再次询问」后，拒绝记录清空，下次再访问重新弹窗
  await access1.retryApproval(calcId)
  assert.equal((await access1.status()).blockedApps.length, 0)

  // 3) 用户选「始终允许」：落盘 0600，新建实例在新会话里也无需再问
  nextChoice = APPROVE_ALWAYS
  await tools.computer_launch_app.execute({ bundle_id: 'com.apple.calculator' }, { agent: { session: { id: 's-deny' } } })
  assert.equal(calls.length, 1)
  assert.equal(((await stat(filePath)).mode & 0o777), 0o600)

  const access2 = createAppAccess(makeCtx(), {
    driver: { call: async () => ({ apps: [] }) } as any,
    helper: async () => undefined,
    filePath,
    resolveTarget: resolveCalc,
  })
  const promptsBeforeAlways = prompts
  await access2.withAppAccess({ pid: 55 }, { agent: { session: { id: 'brand-new-session' } } }, async () => 'ok')
  assert.equal(prompts, promptsBeforeAlways, '始终允许跨会话、跨重启生效')
  assert.equal((await access2.status()).allowedApps[0]?.bundleId, 'com.apple.calculator')

  // 4) 撤销授权：正在进行中的工具调用收到 signal abort 并立即以 APP_ACCESS_REVOKED 失败
  let startedOp!: () => void
  const opReady = new Promise<void>(r => { startedOp = r })
  const inFlight = access2.withAppAccess({ pid: 55 }, { agent: { session: { id: 'brand-new-session' } } }, async (signal: AbortSignal) => {
    startedOp()
    await new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason ?? new Error('aborted')), { once: true })
    })
  })
  const expectRevoked = assert.rejects(inFlight, /APP_ACCESS_REVOKED/)
  await opReady
  await access2.revoke(calcId)
  await expectRevoked
  assert.equal((await access2.status()).allowedApps.length, 0)
})

test('环境检测与 /computer-plus/setup、/computer-plus/permissions 路由：仅本机 owner 可读写，POST 校验 JSON Content-Type', async () => {
  assert.equal(
    enclosingAppBundle('/Applications/DeepSeek Harness.app/Contents/Frameworks/DeepSeek Harness Helper.app/Contents/MacOS/DeepSeek Harness Helper'),
    '/Applications/DeepSeek Harness.app',
  )

  const opened: string[] = []
  const setupMgr = createSetupManager({
    platform: 'darwin',
    driver: {
      path: async () => '/Applications/CuaDriver.app/Contents/MacOS/cua-driver',
      call: async (tool: string) => tool === 'check_permissions' ? { accessibility: true, screen_recording: false } : {},
      endSession: async () => {},
      read: async () => ({}),
      available: async () => true,
    },
    helper: async () => undefined,
    openUrl: async (url: string) => { opened.push(url) },
  })
  const st = await setupMgr.status()
  assert.equal(st.supported, true)
  assert.equal(st.driver.installed, true)
  assert.equal(st.driver.accessibility, true)
  assert.equal(st.driver.screenRecording, false)
  await setupMgr.openSettings('screenRecording')
  assert.match(opened[0] ?? '', /Privacy_ScreenCapture/)

  // 验证 index.js 注册的 HTTP 路由鉴权与 JSON 保护
  let routeHandler: ((req: any, res: any) => Promise<void>) | undefined
  let principalKind: 'owner' | 'guest' | 'none' = 'none'
  const ctx = {
    sessionProjections: { async register() {}, onChanged: () => () => {} },
    events: { on: () => () => {} },
    effect: () => {},
    get(name: string) {
      if (name !== 'connection') return undefined
      return {
        admit() {
          if (principalKind === 'none') return { rejection: 401 }
          return { peer: { principal: { kind: principalKind } } }
        },
      }
    },
    inject(deps: string[], fn: (scope: any) => void) {
      if (deps[0] === 'webServer') {
        fn({
          get: () => undefined,
          effect: (cb: () => void) => cb(),
          webServer: { register: (entry: any) => { routeHandler = entry.handler; return () => {} } },
        })
      }
    },
    logger: {},
  }
  await apply(ctx)
  assert.ok(routeHandler, 'webServer route registered')

  const callRoute = async (method: string, url: string, body?: string, contentType = 'application/json') => {
    const req = new EventEmitter() as any
    req.method = method
    req.url = url
    req.headers = body !== undefined ? { 'content-type': contentType } : {}
    let status = 200
    const chunks: Buffer[] = []
    const res = new EventEmitter() as any
    res.writeHead = (code: number) => { status = code }
    res.write = (c: any) => { chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c))) }
    res.end = (c?: any) => {
      if (c !== undefined) chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(String(c)))
      res.writableEnded = true
    }
    const p = routeHandler!(req, res)
    queueMicrotask(() => {
      if (body !== undefined) req.emit('data', Buffer.from(body))
      req.emit('end')
    })
    await p
    return { status, text: Buffer.concat(chunks).toString('utf8') }
  }

  principalKind = 'none'
  assert.equal((await callRoute('GET', '/computer-plus/setup')).status, 401)
  principalKind = 'guest'
  assert.equal((await callRoute('GET', '/computer-plus/setup')).status, 403)

  principalKind = 'owner'
  const okSetup = await callRoute('GET', '/computer-plus/setup')
  assert.equal(okSetup.status, 200)
  assert.equal(typeof JSON.parse(okSetup.text).supported, 'boolean')

  const badCsrf = await callRoute('POST', '/computer-plus/permissions', JSON.stringify({ action: 'revoke', id: 'x' }), 'text/plain')
  assert.equal(badCsrf.status, 400)

  const okPerms = await callRoute('GET', '/computer-plus/permissions')
  assert.equal(okPerms.status, 200)
  assert.ok(Array.isArray(JSON.parse(okPerms.text).allowedApps))
})

test('客户端 selectAppApproval：只接管 computer-plus-app-access 审批问题，其余问题交还宿主', () => {
  const answer = async () => {}
  const matched = selectAppApproval({
    kind: 'question',
    key: 'k1',
    questions: [{
      id: APP_ACCESS_QUESTION_ID,
      question: 'Allow?',
      intent: { kind: 'approval', approve: APPROVE_SESSION, reject: REJECT_ACCESS, always: APPROVE_ALWAYS },
    }],
    answer,
  })
  assert.ok(matched !== null)
  assert.equal(matched.intent.approve, APPROVE_SESSION)

  assert.equal(selectAppApproval(null), null)
  assert.equal(selectAppApproval({
    kind: 'question',
    key: 'k2',
    questions: [{ id: 'cua-app-access', question: 'Official CUA?', intent: { kind: 'approval', approve: 'a', reject: 'r' } }],
    answer,
  }), null, '绝不抢官方 CUA 或普通提问的卡片')
})

test('前台状态胶囊 HUD：后台操作绝不弹窗；首次前台缓冲、连续前台不重复等、回合结束立即切为 done、缓冲期取消不执行动作', async () => {
  const spawns: Array<{ messages: any[], closed: boolean, killed: boolean }> = []
  const hud = createForegroundHud({
    helper: async () => '/fake/computer-stream',
    prepDelayMs: 60,
    idleHoldMs: 5000,
    doneHoldMs: 300,
    spawnHud: () => {
      const rec = { messages: [] as any[], closed: false, killed: false }
      spawns.push(rec)
      return {
        write: msg => { rec.messages.push(msg) },
        close: () => { rec.closed = true },
        kill: () => { rec.killed = true },
        onExit: () => {},
      }
    },
  })

  const { tools, calls, exec } = collectTools({ runForeground: hud.runForeground })

  // 1) 普通后台调用：绝不启动 HUD，也不传 delivery_mode
  await tools.computer_click.execute({ pid: 77, window_id: 88, x: 10, y: 20 }, exec)
  assert.equal(spawns.length, 0)
  assert.equal(calls.at(-1)?.[1].delivery_mode, undefined)

  // 2) 第一次 foreground: true：启动 HUD → preparing → 等 60ms → active → 传 delivery_mode:"foreground"
  const t0 = Date.now()
  await tools.computer_click.execute({ pid: 77, window_id: 88, x: 10, y: 20, foreground: true }, exec)
  const firstElapsed = Date.now() - t0
  assert.equal(spawns.length, 1)
  assert.ok(firstElapsed >= 50, `expected initial buffer delay, got ${firstElapsed}ms`)
  assert.deepEqual(spawns[0].messages.map(m => m.state), ['preparing', 'active'])
  assert.equal(calls.at(-1)?.[1].delivery_mode, 'foreground')

  // 3) 胶囊亮着期间紧接着第 2、第 3 步前台操作：不重启进程、不重发 preparing、0 延迟直接执行
  const t1 = Date.now()
  await tools.computer_type_text.execute({ pid: 77, window_id: 88, text: '周报', x: 10, y: 20, foreground: true }, exec)
  await tools.computer_press_key.execute({ pid: 77, window_id: 88, key: 'return', foreground: true }, exec)
  const nextElapsed = Date.now() - t1
  assert.equal(spawns.length, 1, '连续前台操作复用同一个胶囊进程')
  assert.ok(nextElapsed < 40, `consecutive foreground calls should not re-wait (${nextElapsed}ms)`)
  assert.deepEqual(spawns[0].messages.map(m => m.state), ['preparing', 'active', 'active', 'active'])
  assert.equal(calls.at(-2)?.[1].delivery_mode, 'foreground')
  assert.equal(calls.at(-1)?.[1].delivery_mode, 'foreground')

  // 4) 回合结束：立即发送 done 并关闭 stdin（不等 5s 空闲计时器）
  hud.finishSession('sess-1', 'completed')
  assert.equal(spawns[0].messages.at(-1)?.state, 'done')
  assert.equal(spawns[0].closed, true)

  // 5) 在首次 60ms 缓冲期间用户点停止：立即 aborted 收尾，且绝不调底层 cua-driver
  const callsBeforeAbort = calls.length
  const ac = new AbortController()
  setTimeout(() => ac.abort(new Error('user stopped')), 15)
  await assert.rejects(
    tools.computer_scroll.execute(
      { pid: 77, window_id: 88, direction: 'down', foreground: true },
      { agent: { session: { id: 'sess-2' } }, signal: ac.signal },
    ),
    /user stopped/,
  )
  assert.equal(calls.length, callsBeforeAbort, '缓冲期间取消不会触发切窗口动作')
  assert.equal(spawns[1]?.messages.at(-1)?.state, 'aborted')

  hud.dispose()
})

