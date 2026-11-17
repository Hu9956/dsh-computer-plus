// 2026-11-04 用户截图：面板里窗口画面的四个角是白的。截到的窗口圆角外是透明的，JPEG 没有透明，编码器填成了白色。
// 现在辅助程序把角铺成窗口边缘的颜色，并在 JPEG 后面接 12 字节「角」；host 拆下来交给面板按真实圆角裁掉。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mountDshUiStyles } from '@kewen/dsh-ui'

import { splitCorners } from '../src/index.js'
import {
  cornerClip,
  getCursorOverlay,
  parseCorners,
  setCursorOverlay,
  statusDotState,
} from '../src/client/computer.ts'
import { computerCss } from '../src/client/computer.css.ts'
import { PLUGIN_ID, injectStyles } from '../src/client/index.ts'
import { APP_ACCESS_QUESTION_ID, selectAppApproval } from '../src/client/AppApproval.tsx'

const localRequire = createRequire(import.meta.url)

const JPEG = Buffer.from([0xff, 0xd8, 0x01, 0x02, 0x03, 0xff, 0xd9])
const trailer = (radii: number[]) => {
  const b = Buffer.alloc(12)
  radii.forEach((r, i) => b.writeUInt16BE(r, i * 2))
  b.write('CPR1', 8, 'latin1')
  return b
}

test('host 拆下 JPEG 后面的圆角：交给浏览器的是干净的 JPEG', () => {
  const { jpeg, corners } = splitCorners(Buffer.concat([JPEG, trailer([759, 759, 854, 854])]))
  assert.deepEqual([...jpeg], [...JPEG])
  assert.deepEqual(corners, [759, 759, 854, 854])
})

test('没有圆角段（旧版辅助程序、显示器画面）、或全是 0、或数值不对：原样当 JPEG，不裁', () => {
  assert.deepEqual(splitCorners(JPEG), { jpeg: JPEG })
  const square = splitCorners(Buffer.concat([JPEG, trailer([0, 0, 0, 0])]))
  assert.deepEqual([...square.jpeg], [...JPEG])
  assert.equal(square.corners, undefined)
  const bad = splitCorners(Buffer.concat([JPEG, trailer([759, 20_000, 854, 854])]))
  assert.equal(bad.corners, undefined)
})

test('面板读圆角：/status 的数组和 /frame 的响应头都认，形状不对就不裁', () => {
  assert.deepEqual(parseCorners([759, 759, 854, 854]), [759, 759, 854, 854])
  assert.deepEqual(parseCorners('759,759,854,854'), [759, 759, 854, 854])
  for (const bad of [undefined, null, '', '1,2,3', [1, 2, 3, -1], [1, 2, 3, 'x'], '1,2,3,99999']) {
    assert.equal(parseCorners(bad), undefined, JSON.stringify(bad))
  }
})

test('按图片实际所在的区域裁圆角：竖窗口两边的留白不受影响，半径按显示宽度换算', () => {
  // 框 320×200，计算器画面 360×640 contain 进去：宽 112.5、左右各留 103.75
  const box = { w: 320, h: 200 }
  const area = { left: 103.75, top: 0, width: 112.5, height: 200 }
  assert.equal(
    cornerClip(box, area, [759, 759, 854, 854]),
    'inset(0px 103.75px 0px 103.75px round 8.54px 8.54px 9.61px 9.61px)',
  )
  assert.equal(cornerClip(box, undefined, [759, 759, 854, 854]), undefined, '图还没加载：不裁')
  assert.equal(cornerClip(box, area, undefined), undefined, '没有圆角：不裁')
})

test('辅助程序把透明的角铺成窗口边缘的颜色再编码，JPEG 后面接圆角', () => {
  const swift = readFileSync(new URL('../assets/computer-stream.swift', import.meta.url), 'utf8')
  assert.match(swift, /func measureCorners\(/)
  assert.match(swift, /ctx\.setFillColor\(CGColor\(srgbRed: fill\.0/)
  assert.match(swift, /"CPR1"/)
})

test('设计系统曲率双轨联动：圆角矩形统一配对 --dsh-corner-shape，正圆与胶囊永久锁定 round，零篡改 :root', () => {
  assert.doesNotMatch(computerCss, /:root\s*\{[^}]*--dsw-corner-shape/, '严禁篡改宿主 :root --dsw-corner-shape')
  assert.ok(!computerCss.includes('`'), 'CSS 模板内部不含反引号')

  // 8px / 12px / 16px 圆角矩形（画面框、放大视口、命令槽、应用图标、兜底授权卡片）均配对 --dsh-corner-shape
  for (const selector of [
    /\.cp-screen\s*\{[^}]*border-radius:\s*var\(--dsw-radius-sm,\s*8px\);[^}]*corner-shape:\s*var\(--dsh-corner-shape,\s*var\(--dsw-corner-shape,\s*round\)\);/s,
    /\.cp-zoom-frame\s*\{[^}]*border-radius:\s*var\(--dsw-radius-lg,\s*16px\);[^}]*corner-shape:\s*var\(--dsh-corner-shape,\s*var\(--dsw-corner-shape,\s*round\)\);/s,
    /\.cp-cfg-cmd\s*\{[^}]*border-radius:\s*var\(--dsw-radius-sm,\s*8px\);[^}]*corner-shape:\s*var\(--dsh-corner-shape,\s*var\(--dsw-corner-shape,\s*round\)\);/s,
    /\.cp-approval-card\s*\{[^}]*border-radius:\s*var\(--dsw-radius-md,\s*12px\);[^}]*corner-shape:\s*var\(--dsh-corner-shape,\s*var\(--dsw-corner-shape,\s*round\)\);/s,
  ]) {
    assert.match(computerCss, selector)
  }

  // 50% 正圆与 999px 胶囊（涟漪、完成徽标、关闭圆钮、行内徽章、骨架槽）永久锁死 round
  for (const selector of [
    /\.cp-ripple\s*\{[^}]*border-radius:\s*50%;[^}]*corner-shape:\s*round;/s,
    /\.cp-done\s*\{[^}]*border-radius:\s*50%;[^}]*corner-shape:\s*round;/s,
    /\.cp-zoom-close\s*\{[^}]*border-radius:\s*50%;[^}]*corner-shape:\s*round;/s,
    /\.cp-cfg-badge\s*\{[^}]*border-radius:\s*999px;[^}]*corner-shape:\s*round;/s,
    /\.cp-cfg-skeleton\s*\{[^}]*border-radius:\s*999px;[^}]*corner-shape:\s*round;/s,
  ]) {
    assert.match(computerCss, selector)
  }

  // 合成器防抖：零无限 opacity/scale 呼吸动画，且不把 overflow: hidden 放在超椭圆 .cp-screen 上
  assert.doesNotMatch(computerCss, /\bcp-pulse\b/)
  assert.doesNotMatch(computerCss, /animation:[^;]*\binfinite\b/)
  assert.doesNotMatch(computerCss, /will-change:\s*(?:opacity|transform)/)
  assert.doesNotMatch(computerCss, /\.cp-screen\[data-has-frame\]\s*\{[^}]*overflow:\s*(?:hidden|clip)/s)
  assert.match(computerCss, /\.cp-screen-clip\s*\{[^}]*corner-shape:\s*round;\s*overflow:\s*clip;/s)
})

test('客户端源码零字符/emoji 勾选叉号图标，产物 lib/client.js 零外部 @kewen/dsh-ui 依赖', () => {
  const clientDir = new URL('../src/client/', import.meta.url)
  for (const name of readdirSync(clientDir)) {
    if (!name.endsWith('.ts') && !name.endsWith('.tsx')) continue
    const text = readFileSync(new URL(name, clientDir), 'utf8')
    assert.doesNotMatch(text, /[✓✕✗✔✖]/u, `${name} 严禁使用字符勾选/叉号替代 SVG 图标`)
  }

  const bundle = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.doesNotMatch(bundle, /\brequire\s*\(\s*['"]@kewen\/dsh-ui/)
  assert.doesNotMatch(bundle, /\bfrom\s+['"]@kewen\/dsh-ui/)
})

test('样式挂载仲裁与幂等卸载：mountDshUiStyles 引用计数不误删共享块，卸载完整清理插件样式', () => {
  type FakeStyle = {
    tagName: string
    textContent: string
    dataset: Record<string, string>
    attrs: Map<string, string>
    setAttribute(k: string, v: string): void
    getAttribute(k: string): string | null
    remove(): void
  }
  const children: FakeStyle[] = []
  const makeStyle = (): FakeStyle => {
    const attrs = new Map<string, string>()
    const node: FakeStyle = {
      tagName: 'STYLE',
      textContent: '',
      dataset: {},
      attrs,
      setAttribute(k, v) { attrs.set(k, v) },
      getAttribute(k) { return attrs.get(k) ?? null },
      remove() {
        const idx = children.indexOf(node)
        if (idx >= 0) children.splice(idx, 1)
      },
    }
    return node
  }

  const prevDoc = (globalThis as { document?: unknown }).document
  ;(globalThis as { document?: unknown }).document = {
    head: {
      children,
      appendChild(node: FakeStyle) { children.push(node); return node },
    },
    createElement() { return makeStyle() },
  }

  try {
    const disposePeer = mountDshUiStyles()
    const disposeComputer = injectStyles()

    const tokensBlock = children.find(n => n.getAttribute('data-dsh-ui') === 'tokens')
    const pluginBlock = children.find(n => n.getAttribute('data-plugin-css') === PLUGIN_ID)
    assert.ok(tokensBlock, '共享 tokens 块已挂载')
    assert.ok(pluginBlock, '插件专属样式块已挂载')
    assert.equal(tokensBlock.getAttribute('data-refs'), '2', '两个插件共享同一原语块引用计数为 2')
    assert.ok(children.indexOf(tokensBlock) < children.indexOf(pluginBlock), '共享原语块排在插件私有覆盖之前')

    // 幂等卸载电脑操控 Plus：私有块立即移除，共享原语块因 peer 仍在而保留（refs=1）
    disposeComputer()
    disposeComputer()
    assert.equal(children.find(n => n.getAttribute('data-plugin-css') === PLUGIN_ID), undefined)
    assert.equal(tokensBlock.getAttribute('data-refs'), '1')
    assert.ok(children.includes(tokensBlock))

    // peer 也卸载后，共享块归零彻底移除
    disposePeer()
    assert.equal(children.length, 0)
  } finally {
    if (prevDoc === undefined) delete (globalThis as { document?: unknown }).document
    else (globalThis as { document?: unknown }).document = prevDoc
  }
})

test('@kewen/dsh-ui v0.2.0 原语接入与独立打包验证：StateDot、Card、CardRow、StandaloneSwitch、Button、Modal 全量就位', () => {
  assert.equal(statusDotState(undefined), 'idle')
  assert.equal(statusDotState({ pid: 1, windowId: 2, tool: 'computer_click', active: true, at: 1 }), 'busy')
  assert.equal(statusDotState({ pid: 1, windowId: 2, tool: 'computer_click', active: false, ended: 'completed', at: 1 }), 'ok')
  assert.equal(statusDotState({ pid: 1, windowId: 2, tool: 'computer_click', active: false, ended: 'aborted', at: 1 }), 'warn')
  assert.equal(statusDotState({ pid: 1, windowId: 2, tool: 'computer_click', active: false, ended: 'error', at: 1 }), 'error')

  assert.equal(getCursorOverlay(), true)
  setCursorOverlay(false)
  assert.equal(getCursorOverlay(), false)
  setCursorOverlay(true)
  assert.equal(getCursorOverlay(), true)

  // 直接加载真实打包产物 lib/client.js，校验零外部 @kewen/dsh-ui 依赖下完整渲染三处 UI 插槽
  const bundleCode = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  const requestedDeps: string[] = []
  let loadedModule: { apply: (ctx: unknown) => void } | undefined

  runInNewContext(bundleCode, {
    window: {
      __ModuleLoader__: {
        load(entry: { id: string, factory: (req: (id: string) => unknown) => { apply: (ctx: unknown) => void } }) {
          assert.equal(entry.id, PLUGIN_ID)
          loadedModule = entry.factory((specifier: string) => {
            requestedDeps.push(specifier)
            if (
              specifier === 'react'
              || specifier === 'react/jsx-runtime'
              || specifier === 'react-dom'
            ) {
              return localRequire(specifier)
            }
            throw new Error(`Unexpected runtime require: ${specifier}`)
          })
        },
      },
      addEventListener() {},
      removeEventListener() {},
    },
    URL,
    encodeURIComponent,
    setTimeout,
    clearTimeout,
  })

  assert.ok(loadedModule, 'lib/client.js 成功注册模块')
  assert.ok(!requestedDeps.some(d => d.startsWith('@kewen/dsh-ui')), '零运行时 @kewen/dsh-ui 请求')

  const registeredSlots = new Map<string, ComponentType<any>>()
  let disposeEffect: (() => void) | undefined
  loadedModule.apply({
    effect(fn: () => () => void) { disposeEffect = fn() },
    get(service: string) {
      if (service === 'locale') {
        return { subscribe: () => () => {}, getSnapshot: () => ({ active: 'zh-CN' }) }
      }
      if (service === 'slots') {
        return {
          inject(_key: string, cb: () => () => void) { cb() },
          register(entry: { name: string }, component: ComponentType<any>) {
            registeredSlots.set(entry.name, component)
            return () => {}
          },
        }
      }
      return undefined
    },
  })

  const ComputerGroupComp = registeredSlots.get('harness.session-info.computer')
  const BoundSettingsComp = registeredSlots.get('plugins.bundle.config')
  const BoundApprovalComp = registeredSlots.get('conversation.composer')
  assert.ok(ComputerGroupComp && BoundSettingsComp && BoundApprovalComp, '三处客户端 UI 插槽全部注册')

  const groupHtml = renderToStaticMarkup(createElement(ComputerGroupComp, {
    sessionId: 's-ui',
    enabled: false,
    useProjection: () => ({ pid: 7, windowId: 9, appName: '计算器', tool: 'computer_click', active: true, at: 10 }),
  }))
  assert.match(groupHtml, /dsh-sdot-spin/, '操控中渲染旋转 StateDot')
  assert.match(groupHtml, /计算器/)
  assert.match(groupHtml, /操控中/)
  assert.match(groupHtml, /cp-screen/)

  const matched = selectAppApproval({
    kind: 'question',
    key: 'req-1',
    questions: [{
      id: APP_ACCESS_QUESTION_ID,
      question: '允许操控计算器吗？',
      detail: '可在详情页随时撤销',
      intent: {
        kind: 'approval',
        approve: 'Allow for this session',
        reject: 'Deny',
        always: 'Always allow',
        subject: { name: '计算器', icon: 'data:image/png;base64,AA==' },
      },
    }],
    answer: async () => {},
  })
  assert.ok(matched !== null)
  const approvalHtml = renderToStaticMarkup(createElement(BoundApprovalComp, { matched }))
  assert.match(approvalHtml, /dsh-card cp-approval-card/, '兜底授权卡片采用 @kewen/dsh-ui Card')
  assert.match(approvalHtml, /hs-btn-danger-ghost/, '拒绝按钮采用胶囊 danger-ghost')
  assert.match(approvalHtml, /hs-btn-toolbar/, '单次允许采用胶囊 toolbar')
  assert.match(approvalHtml, /hs-btn-primary/, '始终允许采用胶囊 primary')
  assert.match(approvalHtml, /风险提示/, '支持查看电脑操控风险提示 Modal 入口')

  const settingsHtml = renderToStaticMarkup(createElement(BoundSettingsComp, { view: 'page' }))
  assert.match(settingsHtml, /dsh-card/, '设置页采用 Card 承载')
  assert.match(settingsHtml, /dsh-card-row/, '设置行采用 CardRow 承载')
  assert.match(settingsHtml, /hs-fb-switch/, '光标涟漪开关采用 StandaloneSwitch')
  assert.match(settingsHtml, /dsh-loading/, '应用授权加载态采用 LoadingState')
  assert.doesNotMatch(settingsHtml, /[✓✕✗✔✖]/u, '零字符勾选或叉号')

  disposeEffect?.()
})
