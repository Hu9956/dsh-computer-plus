import type { Context } from '@deepseek-ai/cordis'
import { COMPUTER_SLOT, ComputerGroup } from './ComputerGroup'
import { computerCss } from './computer.css'

/**
 * 电脑操控 Plus（客户端）：把「电脑操控」组的内容注册进对话信息面板的插槽。
 * 插槽由面板（dsh-harness-plus）声明；没装 harness-plus、或它还没声明这个插槽时，slots.inject 一直等着，不报错。
 */

type SlotsApi = {
  inject(key: string, callback: () => () => void): void
  register(entry: { name: string, id?: string, order?: number }, component: unknown): () => void
}

export const inject = ['slots']

const STYLE_ID = '@kewen/dsh-computer-plus'

function injectStyles(): () => void {
  if (typeof document === 'undefined') return () => {}
  let style = document.querySelector<HTMLStyleElement>(`style[data-plugin-css="${STYLE_ID}"]`)
  if (style === null) {
    style = document.createElement('style')
    style.dataset.pluginCss = STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = computerCss
  const owned = style
  return () => owned.remove()
}

export function apply(ctx: Context): void {
  ctx.effect(() => injectStyles(), 'computer-plus: styles')
  const slots = ctx.get('slots') as SlotsApi
  slots.inject(COMPUTER_SLOT, () => slots.register({ name: COMPUTER_SLOT, id: 'computer-plus' }, ComputerGroup))
}
