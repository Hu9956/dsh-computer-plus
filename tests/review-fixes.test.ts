// 2026-11-02 两份审查查出的问题，每条一个回归测试
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chmod, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { argViolations, actionText, errorText, launchText, registerComputerTools, stateText, withoutMenuBar } from '../src/tools.js'
import { createDriver } from '../src/driver.js'

/** 一个假的 cua-driver：每次调用把工具名记到 log，按 reply 回 stdout / stderr / 退出码 */
async function fakeCua(body: string) {
  const dir = await mkdtemp(join(tmpdir(), 'cp-review-'))
  const bin = join(dir, 'cua-driver')
  const log = join(dir, 'log')
  await writeFile(bin, `#!/bin/sh\necho "$2" >> "${log}"\n${body}\n`)
  await chmod(bin, 0o755)
  return { bin, calls: async () => (await readFile(log, 'utf8').catch(() => '')).trim().split('\n').filter(Boolean) }
}

/** 收下注册的工具，driver 只记调用 */
function fakeTools(reply: (tool: string, args: any) => any = () => ({ summary: 'ok', effect: 'verified' })) {
  const registered: Record<string, any> = {}
  const calls: [string, any][] = []
  const ctx = { inject: (_k: unknown, fn: (scope: any) => void) => fn({ tools: { register: (d: any) => { registered[d.name] = d } } }), get: () => undefined }
  const driver = { call: async (tool: string, args: any) => { calls.push([tool, args]); return reply(tool, args) } }
  registerComputerTools(ctx, { driver: driver as any, labelOf: (s: string) => s })
  return { tools: registered, calls, exec: { agent: { session: { id: 'S' } } } }
}

test('driver：成功的结果里碰巧有「daemon is not running」也不重做（原来会把点击做两次）', async () => {
  const cua = await fakeCua(`echo '{"effect":"unverifiable","summary":"Performed AXPress on [3] AXButton \\"daemon is not running\\"."}'; exit 0`)
  let starts = 0
  const driver = createDriver({ path: async () => cua.bin, startDaemon: async () => { starts++ } })
  await driver.call('click', { pid: 1, window_id: 2 }, {})
  assert.deepEqual(await cua.calls(), ['click'])
  assert.equal(starts, 0)
})

test('driver：守护进程真没开（退出码 1、stderr 报）才启动它，然后重试一次', async () => {
  const cua = await fakeCua(`if [ -f "$0.up" ]; then echo '{"ok":true}'; exit 0; fi\necho "Cua Driver daemon is not running on /tmp/x.sock." >&2; exit 1`)
  let starts = 0
  const driver = createDriver({ path: async () => cua.bin, startDaemon: async () => { starts++; await writeFile(`${cua.bin}.up`, '') } })
  assert.deepEqual(await driver.call('list_windows', {}, {}), { ok: true })
  assert.equal(starts, 1)
  assert.deepEqual(await cua.calls(), ['list_windows', 'list_windows'])
})

test('driver：回合结束时守护进程不在就算了，不把 CuaDriver 拉起来（用户可能是特意退出的）', async () => {
  const cua = await fakeCua(`if [ "$2" = "end_session" ]; then echo "Cua Driver daemon is not running." >&2; exit 1; fi\necho '{"ok":true}'`)
  let starts = 0
  const driver = createDriver({ path: async () => cua.bin, startDaemon: async () => { starts++ } })
  await driver.call('click', { pid: 1, window_id: 2 }, { label: 'dsh-x' })
  await driver.endSession('dsh-x')
  assert.deepEqual(await cua.calls(), ['click', 'end_session'])
  assert.equal(starts, 0)
})

test('driver：唯一一次调用被中断，回合结束时也结束 session（不留光标）', async () => {
  const cua = await fakeCua(`if [ "$2" = "click" ]; then sleep 2; fi\necho '{"ok":true}'`)
  const driver = createDriver({ path: async () => cua.bin })
  const controller = new AbortController()
  const pending = driver.call('click', { pid: 1, window_id: 2 }, { label: 'dsh-y', signal: controller.signal })
  // 等 click 真的发出去了再中断
  while (!(await cua.calls()).includes('click')) await new Promise(r => setTimeout(r, 20))
  controller.abort()
  await assert.rejects(pending)
  await driver.endSession('dsh-y')
  assert.deepEqual(await cua.calls(), ['click', 'end_session'])
})

test('driver：等守护进程启动时按停止，马上停（不等它启动完）', async () => {
  const cua = await fakeCua(`echo "Cua Driver daemon is not running." >&2; exit 1`)
  const driver = createDriver({ path: async () => cua.bin, startDaemon: () => new Promise(r => setTimeout(r, 3000)) })
  const controller = new AbortController()
  const started = Date.now()
  setTimeout(() => controller.abort(), 100)
  await assert.rejects(driver.call('click', {}, { signal: controller.signal }))
  assert.ok(Date.now() - started < 1500, `took ${Date.now() - started} ms`)
})

test('参数校验：错的值报错，不悄悄丢掉照常执行', async () => {
  const { tools, calls, exec } = fakeTools()
  await assert.rejects(tools.computer_click.execute({ pid: 1, window_id: 2, x: 1, y: 2, button: 'middle' }, exec), /"button" must be one of "left", "right"/)
  await assert.rejects(tools.computer_click.execute({ pid: 1, window_id: 2, x: 1, y: 2, delivery_mode: 'foreground' }, exec), /unknown parameter "delivery_mode"/)
  await assert.rejects(tools.computer_type_text.execute({ pid: 1, window_id: 2, text: 'hi', element_index: '3' }, exec), /"element_index" must be an integer/)
  await assert.rejects(tools.computer_click.execute({ pid: 1.5, window_id: 2, x: 1, y: 2 }, exec), /"pid" must be an integer/)
  await assert.rejects(tools.computer_press_key.execute({ pid: 1, window_id: 2, key: 'a', modifiers: ['super'] }, exec), /"modifiers\[0\]" must be one of/)
  await assert.rejects(tools.computer_type_text.execute({ pid: 1, window_id: 2 }, exec), /missing required "text"/)
  assert.equal(calls.length, 0, '一个都没发给 cua-driver')
  // 可选参数写成 null 当没传
  await tools.computer_click.execute({ pid: 1, window_id: 2, x: 1, y: 2, button: null }, exec)
  assert.deepEqual(calls.at(-1), ['click', { pid: 1, window_id: 2, x: 1, y: 2 }])
})

test('参数校验覆盖每个工具的 schema 写法（只用到这几种，校验器都认得）', () => {
  const { tools } = fakeTools()
  const seen = new Set<string>()
  const walk = (s: any) => {
    seen.add(s.type)
    for (const key of Object.keys(s)) assert.ok(['type', 'properties', 'required', 'additionalProperties', 'items', 'enum', 'description'].includes(key), `不认得的 schema 写法 ${key}`)
    for (const sub of Object.values(s.properties ?? {})) walk(sub)
    if (s.items !== undefined) walk(s.items)
  }
  for (const tool of Object.values(tools)) walk(tool.parameters)
  for (const type of seen) assert.ok(['object', 'string', 'integer', 'number', 'boolean', 'array'].includes(type), type)
  assert.deepEqual(argViolations({ type: 'object', properties: {}, additionalProperties: false }, []), ['arguments must be an object'])
})

test('type_text、press_key 收 x/y：网页、Electron 的输入框先在这一点聚焦再输入', async () => {
  const { tools, calls, exec } = fakeTools()
  await tools.computer_type_text.execute({ pid: 1, window_id: 2, text: 'hi', x: 5, y: 6 }, exec)
  assert.deepEqual(calls.at(-1), ['type_text', { pid: 1, window_id: 2, x: 5, y: 6, text: 'hi' }])
  await tools.computer_press_key.execute({ pid: 1, window_id: 2, key: 'return', x: 5, y: 6 }, exec)
  assert.deepEqual(calls.at(-1), ['press_key', { pid: 1, window_id: 2, x: 5, y: 6, key: 'return' }])
  await assert.rejects(tools.computer_type_text.execute({ pid: 1, window_id: 2, text: 'hi', x: 5 }, exec), /both x and y/)
})

test('query 是空字符串时当没传：照样去掉菜单栏（原来会返回整棵树）', async () => {
  const tree = '- [0] AXWindow "w"\n  - [1] AXButton\n- [2] AXMenuBar\n  - [3] AXMenuBarItem "File"'
  const { tools, calls, exec } = fakeTools(() => ({ snapshot_id: 's00000001', tree_markdown: tree }))
  const value = await tools.computer_get_window_state.execute({ pid: 1, window_id: 2, query: '', include_screenshot: false }, exec)
  assert.equal(calls.at(-1)?.[1].query, undefined)
  assert.doesNotMatch(value.tree, /AXMenuBar/)
  assert.equal(value.menu_items_hidden, 2)
})

test('读树超时：提示加大 timeout_ms（query 帮不上），并把 timeout_ms 传给 cua-driver', async () => {
  const { tools, calls, exec } = fakeTools(() => ({ snapshot_id: 's00000001', tree_markdown: '- [0] AXWindow', truncated: true, truncation_reason: 'timeout' }))
  const value = await tools.computer_get_window_state.execute({ pid: 1, window_id: 2, include_screenshot: false, timeout_ms: 999_999 }, exec)
  assert.equal(calls.at(-1)?.[1].timeout_ms, 120_000, '夹在 cua-driver 收的范围里')
  assert.match(stateText(value), /timed out; call again with a larger timeout_ms/)
  assert.match(stateText({ pid: 1, window_id: 2, snapshot_id: 's', tree: '', truncated: true }), /narrow it with `query`/, '别的原因截断还是提示 query')
})

test('启动应用：cua-driver 已经带回窗口就直接列出来，省一次 computer_list_windows', async () => {
  const { tools, exec } = fakeTools(() => ({
    pid: 42, name: '计算器', bundle_id: 'com.apple.calculator',
    windows: [{ pid: 42, window_id: 7, app_name: '计算器', title: '计算器', is_on_screen: true, layer: 0, bounds: { x: 0, y: 0, width: 230, height: 408 }, z_index: 3 }],
  }))
  const value = await tools.computer_launch_app.execute({ bundle_id: 'com.apple.calculator' }, exec)
  const text = launchText(value)
  assert.match(text, /"window_id":7/)
  assert.doesNotMatch(text, /computer_list_windows/)
  assert.doesNotMatch(text, /z_index/, '和 computer_list_windows 一样只留用得上的字段')
  assert.match(launchText({ pid: 42, name: '计算器', bundle_id: '', windows: [] }), /computer_list_windows with pid 42/)
})

test('列窗口用紧凑 JSON（缩进版多约 35% 字数）', () => {
  const { tools } = fakeTools()
  const text = tools.computer_list_windows.output.render({}, { windows: [{ pid: 1, window_id: 2 }] })[0].text
  assert.equal(text, '[{"pid":1,"window_id":2}]')
})

test('菜单栏：只去掉顶格的应用菜单栏，窗口里的菜单（网页 role=menubar）保留', () => {
  const tree = [
    '- [0] AXWindow "Docs"',
    '  - [1] AXWebArea "Doc"',
    '    - [2] AXMenuBar "Menu bar"',
    '      - [3] AXMenuBarItem "File" [actions=[press]]',
    '    - [4] AXTextArea "body"',
    '- [5] AXMenuBar [actions=[cancel]]',
    '  - [6] AXMenuBarItem "Apple"',
  ].join('\n')
  const out = withoutMenuBar(tree)
  assert.deepEqual(out.tree.split('\n'), tree.split('\n').slice(0, 5))
  assert.equal(out.removed, 2)
})

test('菜单栏：属性折行（顶格的续行）不会让去菜单栏提前停下（计算器工具栏的 actions 就折了四行）', () => {
  const tree = [
    '- [0] AXWindow "w"',
    '    - [1] AXButton (模式) [actions=[press,name:移到上一项',
    'target:0x0',
    'selector:(null)]]',
    '- [2] AXMenuBar [actions=[cancel]]',
    '  - [3] AXMenuBarItem "File" [actions=[press]]',
    '    - [4] AXMenuItem "Custom" [actions=[press,name:Do thing',
    'target:0x0',
    'selector:(null)]]',
    '    - [5] AXMenuItem "Quit" [actions=[press]]',
    '  - [6] AXMenuBarItem "Edit" [actions=[press]]',
    '- [7] AXButton [actions=[press]]',
  ].join('\n')
  const out = withoutMenuBar(tree)
  assert.deepEqual(out.tree.split('\n'), [...tree.split('\n').slice(0, 4), '- [7] AXButton [actions=[press]]'], '窗口里的折行保留，菜单里的折行一起去掉')
  assert.equal(out.removed, 5)
})

test('cua-driver 让用前台投递时补一句这组工具里该怎么办（不同说法都认）', () => {
  for (const summary of [
    'Delivered. Retry this action with delivery_mode:"foreground" if nothing changed.',
    'Refused: use the pixel-targeted type_text form (x,y) or delivery_mode:"foreground".',
  ]) assert.match(actionText({ effect: 'unverifiable', summary }), /these tools have no delivery_mode\. For a web or Electron field pass its x\/y/)
  assert.doesNotMatch(actionText({ effect: 'verified', summary: 'Typed 3 characters.' }), /delivery_mode/)
  assert.match(errorText('cua-driver type_text failed: {"code":"refused","hint":"use delivery_mode:\\"foreground\\""}'), /these tools have no delivery_mode/)
  assert.equal(errorText('cua-driver click failed: window gone'), 'cua-driver click failed: window gone')
})

test('启动守护进程不带 DSH 的 ELECTRON_RUN_AS_NODE（否则它打开的 Cursor 等 Electron 应用两秒就退出）', async () => {
  const { daemonEnv } = await import('../src/driver.js')
  const env = daemonEnv({ HOME: '/Users/x', PATH: '/usr/bin', ELECTRON_RUN_AS_NODE: '1', NODE_OPTIONS: '--inspect' })
  assert.deepEqual(env, { HOME: '/Users/x', PATH: '/usr/bin' })
})

test('回合结束补拍用单张截图（snap），不开流；停辅助程序先给它时间停流（2026-11-02 真机：Kiro 标题栏的录屏标一直不灭）', async () => {
  const { readFileSync } = await import('node:fs')
  const src = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
  assert.match(src, /spawn\(binary, \['snap', String\(target\.windowId\), String\(target\.pid\), String\(FRAME_EDGE\)\]/)
  assert.doesNotMatch(src, /'window', String\(target\.windowId\), String\(target\.pid\), '2'/, '不再用 2fps 的流补拍')
  const grace = Number(/const KILL_GRACE_MS = (\d+)/.exec(src)?.[1])
  assert.ok(grace > 4000, `SIGKILL 要晚于辅助程序自己的 4 秒兜底，现在是 ${grace}`)
  const swift = readFileSync(new URL('../assets/computer-stream.swift', import.meta.url), 'utf8')
  assert.match(swift, /SCScreenshotManager\.captureImage/, 'snap 走单张截图 API')
  assert.match(swift, /DispatchSource\.makeSignalSource\(signal: SIGTERM/, 'SIGTERM 先停流再退')
  assert.match(swift, /try\? await running\.stopCapture\(\)/)
})
