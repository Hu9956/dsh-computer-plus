import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

import { computerProjection, parseTarget, windowOfCall } from '../src/projection.js'
import { actionText, compactWindows, stateText, withoutMenuBar } from '../src/tools.js'
import { createDriver, parseResult } from '../src/driver.js'
import { COMPUTER_PROMPT, frameReader, labelOf } from '../src/index.js'

const call = (name: string, args: object, time = 10, callId = 'c1') => ({ type: 'tool/call', seq: 1, time, data: { turn: 1, step: 1, callId, name, arguments: JSON.stringify(args) } })
const result = (callId: string, meta?: object, time = 20) => ({
  type: 'tool/result', seq: 2, time,
  data: { turn: 1, step: 1, message: { role: 'tool', toolCallId: callId, content: [{ type: 'text', text: 'ok' }] }, ...(meta === undefined ? {} : { meta }) },
})
const turnEnd = (kind = 'completed', time = 30) => ({ type: 'turn/end', seq: 3, time, data: { turn: 1, reason: { kind } } })
const fold = (events: object[]): any => events.reduce((state: any, event: any) => step(state, event), computerProjection.init())
const step = (state: any, event: object): any => computerProjection.apply(state, event as any)

test('只认 computer_* 窗口工具里写明的 pid 和 window_id', () => {
  assert.deepEqual(windowOfCall({ name: 'computer_click', arguments: JSON.stringify({ pid: 844, window_id: 10725, element_index: 3 }) }), { pid: 844, windowId: 10725, tool: 'computer_click' })
  assert.equal(windowOfCall({ name: 'computer_list_windows', arguments: JSON.stringify({ pid: 844 }) }), undefined, '列窗口不是操控')
  assert.equal(windowOfCall({ name: 'computer_launch_app', arguments: JSON.stringify({ bundle_id: 'com.apple.calculator' }) }), undefined)
  assert.equal(windowOfCall({ name: 'computer_click', arguments: JSON.stringify({ pid: 844 }) }), undefined, '没有窗口就不算')
  assert.equal(windowOfCall({ name: 'computer_click', arguments: JSON.stringify({ pid: '844', window_id: 1 }) }), undefined, '不是整数不认')
  assert.equal(windowOfCall({ name: 'computer_click', arguments: '{bad json' }), undefined)
})

test('bash 里的 cua-driver 一律不认（不再猜命令文本）', () => {
  const bash = { name: 'bash', arguments: JSON.stringify({ command: `cua-driver click '{"pid":844,"window_id":10725,"element_index":3}'` }) }
  assert.equal(windowOfCall(bash), undefined)
  assert.equal(fold([call('bash', { command: `cua-driver click '{"pid":844,"window_id":10725}'` })]), null)
})

test('投影：调用 → 结果补应用名 → 回合结束冻结并记下怎么结束的', () => {
  const s1 = fold([call('computer_get_window_state', { pid: 5, window_id: 7 })])
  assert.deepEqual(s1, { pid: 5, windowId: 7, tool: 'computer_get_window_state', active: true, at: 10, callId: 'c1' })
  const s2 = step(s1, result('c1', { pid: 5, windowId: 7, appName: '计算器' }))
  assert.deepEqual(s2, { pid: 5, windowId: 7, tool: 'computer_get_window_state', appName: '计算器', active: true, at: 20 })
  const s3 = step(s2, turnEnd())
  assert.deepEqual(s3, { pid: 5, windowId: 7, tool: 'computer_get_window_state', appName: '计算器', active: false, ended: 'completed', at: 20 })
  assert.equal(step(s3, turnEnd('aborted', 40)), s3, '已结束的不再改')
  assert.equal(fold([call('computer_click', { pid: 5, window_id: 7 }), turnEnd('aborted')]).ended, 'aborted')
  assert.equal(fold([call('computer_click', { pid: 5, window_id: 7 }), turnEnd('interrupted')]).ended, 'aborted')
  assert.equal(fold([call('computer_click', { pid: 5, window_id: 7 }), turnEnd('error')]).ended, 'error')
})

test('投影：结果里的应用名必须是同一个窗口的', () => {
  const s1 = fold([call('computer_get_window_state', { pid: 5, window_id: 7 })])
  const s2 = step(s1, result('c1', { pid: 6, windowId: 7, appName: '备忘录' }))
  assert.equal(s2.appName, undefined)
  const other = step(s1, result('other', { pid: 5, windowId: 7, appName: '计算器' }))
  assert.equal(other, s1, '别的调用的结果不动')
})

test('投影：同一个应用沿用应用名，换了应用就清掉；新一轮重新标为操控中', () => {
  const named = fold([call('computer_get_window_state', { pid: 5, window_id: 7 }), result('c1', { pid: 5, windowId: 7, appName: '计算器' })])
  const sameApp = step(named, call('computer_click', { pid: 5, window_id: 8 }, 30, 'c2'))
  assert.equal(sameApp.appName, '计算器')
  const otherApp = step(named, call('computer_click', { pid: 9, window_id: 3 }, 30, 'c2'))
  assert.equal(otherApp.appName, undefined)
  const ended = step(named, turnEnd())
  const next = step(ended, call('computer_click', { pid: 5, window_id: 7 }, 50, 'c3'))
  assert.equal(next.active, true)
  assert.equal(next.ended, undefined)
})

test('投影：无关事件同引用；session/end-seed 清空', () => {
  const s = fold([call('computer_click', { pid: 5, window_id: 7 })])
  assert.equal(step(s, { type: 'user/message', seq: 9, time: 1 }), s)
  assert.equal(step(s, call('read', { file_path: '/x' }, 11, 'c9')), s)
  assert.equal(step(s, { type: 'session/end-seed', seq: 9, time: 1 }), null)
})

test('投影状态校验：好的原样过，坏的抛（DSH 会丢掉重算）', () => {
  const good = { pid: 5, windowId: 7, tool: 'computer_click', active: false, ended: 'completed', at: 1 }
  assert.equal(parseTarget(good), good)
  assert.equal(parseTarget(null), null)
  assert.throws(() => parseTarget({ kind: 'cursor', active: true, at: 1 }), '旧插件的形状不认')
  assert.throws(() => parseTarget({ ...good, ended: 'weird' }))
})

test('列窗口只留普通的、在屏幕上的窗口，去掉菜单栏细条和 cua-driver 自己', () => {
  const listed = {
    windows: [
      { pid: 1, window_id: 10, layer: 0, is_on_screen: true, app_name: '计算器', title: '计算器', bounds: { x: 0, y: 0, width: 230, height: 408 } },
      { pid: 1, window_id: 11, layer: 0, is_on_screen: false, app_name: '计算器', title: '', bounds: { x: 0, y: 0, width: 1728, height: 33 } },
      { pid: 2, window_id: 20, layer: 0, is_on_screen: true, app_name: 'Cua Driver', title: '', bounds: { x: 0, y: 0, width: 1728, height: 1117 } },
      { pid: 3, window_id: 30, layer: 0, is_on_screen: false, app_name: '备忘录', title: '笔记', bounds: { x: 0, y: 0, width: 800, height: 600 } },
      { pid: 4, window_id: 40, layer: 25, is_on_screen: true, app_name: '程序坞', title: '', bounds: { x: 0, y: 0, width: 800, height: 600 } },
    ],
  }
  assert.deepEqual(compactWindows(listed, false).map((w: any) => w.window_id), [10])
  assert.deepEqual(compactWindows(listed, true).map((w: any) => w.window_id), [10, 30], '指定 pid 时也列不在屏幕上的')
  assert.deepEqual(compactWindows({}, false), [])
})

test('窗口状态给模型的文字带 snapshot、截图尺寸和用法', () => {
  const text = stateText({ app_name: '计算器', window_title: '计算器', pid: 5, window_id: 7, snapshot_id: 's1', tree: '- [0] AXWindow', screenshot: { width: 460, height: 816 } })
  assert.match(text, /pid=5 window_id=7/)
  assert.match(text, /snapshot_id: s1/)
  assert.match(text, /460x816/)
  assert.match(text, /\[0\] AXWindow/)
  assert.match(stateText({ pid: 5, window_id: 7, snapshot_id: 's1', tree: '', screenshot_note: 'skipped' }), /screenshot: skipped/)
})

test('cua-driver 的结果：成功是 JSON 对象；失败原文给 Agent', () => {
  assert.deepEqual(parseResult('click', { code: 0, stdout: '{"effect":"unverifiable"}', stderr: '' }), { effect: 'unverifiable' })
  assert.throws(() => parseResult('click', { code: 1, stdout: '{"code":"px_window_not_found"}', stderr: '' }), /px_window_not_found/)
  assert.throws(() => parseResult('get_window_state', { code: 1, stdout: '', stderr: 'session has ended; tool call rejected' }), /session has ended/)
  assert.throws(() => parseResult('x', { code: 0, stdout: 'not json', stderr: '' }), /not json/)
})

test('每个对话一个固定的 cua-driver session 名', () => {
  assert.equal(labelOf('abc'), labelOf('abc'))
  assert.notEqual(labelOf('abc'), labelOf('abd'))
  assert.match(labelOf('abc'), /^dsh-[0-9a-f]{10}$/)
})

test('driver：代填 session；结束过的名字下次用之前先 start_session', async () => {
  const calls: string[][] = []
  const script = `#!/bin/sh\necho "$2 $3" >> "$LOG"\nif [ "$2" = "start_session" ] || [ "$2" = "end_session" ]; then echo '{"active":true}'; exit 0; fi\necho '{"ok":true}'\n`
  const { mkdtemp, writeFile, chmod, readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  const { tmpdir } = await import('node:os')
  const dir = await mkdtemp(join(tmpdir(), 'cp-test-'))
  const bin = join(dir, 'cua-driver')
  const log = join(dir, 'log')
  await writeFile(bin, script)
  await chmod(bin, 0o755)
  process.env.LOG = log
  const driver = createDriver({ path: async () => bin })
  await driver.call('click', { pid: 1, window_id: 2 }, { label: 'dsh-x' })
  await driver.endSession('dsh-x')
  await driver.endSession('dsh-x')
  await driver.call('click', { pid: 1, window_id: 2 }, { label: 'dsh-x' })
  for (const line of (await readFile(log, 'utf8')).trim().split('\n')) calls.push(line.split(' '))
  assert.deepEqual(calls.map(c => c[0]), ['click', 'end_session', 'start_session', 'click'], '只结束一次；再用前先 start_session')
  assert.deepEqual(JSON.parse(calls[0].slice(1).join(' ')), { pid: 1, window_id: 2, session: 'dsh-x' })
})

test('driver：没装 cua-driver 时报清楚的错', async () => {
  const driver = createDriver({ path: async () => undefined })
  await assert.rejects(driver.call('click', {}, {}), /not installed/)
})

test('frameReader：按长度前缀拆帧，跨块拼接，坏长度报错并清空', () => {
  const frames: string[] = []
  let corrupt = 0
  const read = frameReader(b => frames.push(b.toString()), () => corrupt++)
  const frame = (s: string) => { const b = Buffer.alloc(4 + s.length); b.writeUInt32BE(s.length, 0); b.write(s, 4); return b }
  const both = Buffer.concat([frame('ab'), frame('cde')])
  read(both.subarray(0, 5))
  read(both.subarray(5))
  assert.deepEqual(frames, ['ab', 'cde'])
  read(Buffer.from([0, 0, 0, 0]))
  assert.equal(corrupt, 1)
})

test('界面树默认去掉菜单栏（计算器的树 86% 是菜单），元素编号不重排', () => {
  const tree = [
    '- [0] AXWindow "计算器" [id=main actions=[raise]]',
    '    - AXStaticText = "0" (编辑字段)',
    '    - [1] AXButton (删除) [actions=[press]]',
    '  - [2] AXToolbar [actions=[showmenu]]',
    '- [3] AXMenuBar [actions=[cancel]]',
    '  - [4] AXMenuBarItem "Apple" [actions=[cancel,press,pick]]',
    '    - [5] AXMenu [actions=[cancel]]',
    '      - [6] AXMenuItem "关于本机" [actions=[press]]',
    '      - AXMenuItem "（分隔线）"',
    '- [7] AXButton [actions=[press]]',
  ].join('\n')
  const out = withoutMenuBar(tree)
  assert.equal(out.removed, 4)
  assert.deepEqual(out.tree.split('\n'), [
    '- [0] AXWindow "计算器" [id=main actions=[raise]]',
    '    - AXStaticText = "0" (编辑字段)',
    '    - [1] AXButton (删除) [actions=[press]]',
    '  - [2] AXToolbar [actions=[showmenu]]',
    '- [7] AXButton [actions=[press]]',
  ], '菜单栏后面同级的元素保留，编号还是 7')
  assert.deepEqual(withoutMenuBar('- [0] AXWindow "x"'), { tree: '- [0] AXWindow "x"', removed: 0 }, '没有菜单栏原样返回')
})

test('去掉菜单栏时告诉模型怎么要回来', () => {
  const text = stateText({ pid: 5, window_id: 7, snapshot_id: 's1', tree: '- [0] AXWindow', menu_items_hidden: 123 })
  assert.match(text, /menu bar \(123 items\) is hidden/)
  assert.match(text, /include_menu_bar: true/)
  assert.doesNotMatch(stateText({ pid: 5, window_id: 7, snapshot_id: 's1', tree: '' }), /menu bar/)
})

test('动作结果只回一行摘要（原来约 270 字的 JSON 会留在历史里一直重发）', () => {
  const value = { delivery: { mode: 'background' }, effect: 'unverifiable', route: 'accessibility', summary: '✅ Performed AXPress on [13] AXButton "".' }
  const text = actionText(value)
  assert.equal(text, '✅ Performed AXPress on [13] AXButton "". (not verified; check the window when the sequence is done)')
  assert.ok(text.length < 120)
  assert.equal(actionText({ effect: 'verified', summary: 'Typed 3 characters.' }), 'Typed 3 characters.')
  assert.equal(actionText({}), 'Done. (not verified; check the window when the sequence is done)')
})

test('提示：默认用工具，但长的固定流程允许写脚本；教模型少读、连着发', () => {
  assert.match(COMPUTER_PROMPT, /send every action you already know in the same step/)
  assert.match(COMPUTER_PROMPT, /read it again only to check the result/)
  assert.match(COMPUTER_PROMPT, /script in bash is fine when it is clearly cheaper/)
  assert.doesNotMatch(COMPUTER_PROMPT, /even where the cua-driver skill recommends/, '不再一律压着不让用 bash')
})

test('动作结果去掉 cua-driver 让 Agent 用 delivery_mode 重试的建议（这组工具没有这个参数）', () => {
  const real = '📨 Sent (unverified) 6 char(s) via CGEvent (30ms delay). — driver could not confirm the text landed; verify via screenshot, and re-call with delivery_mode:"foreground" if it didn\'t.'
  const text = actionText({ effect: 'unverifiable', summary: real })
  assert.doesNotMatch(text, /delivery_mode|foreground/)
  assert.match(text, /^📨 Sent \(unverified\) 6 char\(s\) via CGEvent \(30ms delay\)\. — driver could not confirm the text landed; verify via screenshot\./)
})

test('回合结束时补拍一帧：面板没开着也留下冻结画面（2026-11-02 真机「本轮没有留下画面」）', () => {
  const src = readFileSync(new URL('../src/index.js', import.meta.url), 'utf8')
  assert.match(src, /if \(!target\.active && wasActive\) snapshot\(id, entry\)/, '只在这一轮结束时拍，不每步拍')
  assert.match(src, /entry\.capturing !== undefined\) await entry\.capturing/, '取冻结帧时等补拍完成')
})
