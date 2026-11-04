// 2026-11-04 用户截图：面板里窗口画面的四个角是白的。截到的窗口圆角外是透明的，JPEG 没有透明，编码器填成了白色。
// 现在辅助程序把角铺成窗口边缘的颜色，并在 JPEG 后面接 12 字节「角」；host 拆下来交给面板按真实圆角裁掉。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import { splitCorners } from '../src/index.js'
import { cornerClip, parseCorners } from '../src/client/computer.ts'

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
