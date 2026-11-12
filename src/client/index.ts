import { createElement, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import { COMPUTER_SLOT, ComputerGroup } from './ComputerGroup'
import { AppApproval, selectAppApproval, type MatchedAppApproval } from './AppApproval'
import { SettingsPanel } from './SettingsPanel'
import { computerCss } from './computer.css'

/**
 * 电脑操控 Plus（客户端）：
 * 1. 对话信息面板「电脑操控」组（插槽由 dsh-harness-plus 声明，没装也不报错）
 * 2. 插件详情页「环境与系统权限 / 管理可访问的应用」（plugins.bundle.config）
 * 3. 对话输入框上方「应用访问授权卡片」（conversation.composer → conversation.approval.card）
 */

type SlotEntry = {
  name: string
  id?: string
  key?: string
  order?: number
  priority?: number
  select?: (props: Record<string, unknown>) => unknown
}

type SlotsApi = {
  inject(key: string, callback: () => () => void): void
  register(entry: SlotEntry, component: unknown): () => void
}

type LocaleApi = {
  subscribe?: (cb: () => void) => () => void
  getSnapshot?: () => { active?: string }
}

export const inject = ['slots']

const PLUGIN_ID = '@kewen/dsh-computer-plus'
const noopSubscribe = () => () => {}

function useHostLang(ctx: Context): 'zh' | 'en' | undefined {
  const locale = (ctx as { get?: (name: string) => unknown }).get?.('locale') as LocaleApi | undefined
  const active = useSyncExternalStore(
    typeof locale?.subscribe === 'function' ? cb => locale.subscribe!(cb) : noopSubscribe,
    () => (typeof locale?.getSnapshot === 'function' ? locale.getSnapshot()?.active : undefined),
    () => undefined,
  )
  if (typeof active !== 'string') return undefined
  if (active.toLowerCase().startsWith('en')) return 'en'
  if (active.toLowerCase().startsWith('zh')) return 'zh'
  return undefined
}

function injectStyles(): () => void {
  if (typeof document === 'undefined') return () => {}
  let style = document.querySelector<HTMLStyleElement>(`style[data-plugin-css="${PLUGIN_ID}"]`)
  if (style === null) {
    style = document.createElement('style')
    style.dataset.pluginCss = PLUGIN_ID
    document.head.appendChild(style)
  }
  style.textContent = computerCss
  const owned = style
  return () => owned.remove()
}

export function apply(ctx: Context): void {
  ctx.effect(() => injectStyles(), 'computer-plus: styles')
  const slots = ctx.get('slots') as SlotsApi

  const BoundSettings = (props: { view?: 'summary' | 'page' }) =>
    createElement(SettingsPanel, { ...props, lang: useHostLang(ctx) })

  const BoundApproval = (props: {
    matched: MatchedAppApproval
    renderFactorySlot?: (name: string, slotProps: Record<string, unknown>) => ReturnType<typeof createElement>
  }) => createElement(AppApproval, { ...props, lang: useHostLang(ctx) })

  slots.inject(COMPUTER_SLOT, () => slots.register({ name: COMPUTER_SLOT, id: 'computer-plus' }, ComputerGroup))
  slots.inject('plugins.bundle.config', () => slots.register({ name: 'plugins.bundle.config', key: PLUGIN_ID }, BoundSettings))
  slots.inject('conversation.composer', () => slots.register({
    name: 'conversation.composer',
    id: `${PLUGIN_ID}:app-approval`,
    priority: -1,
    select: ({ pendingInteraction }) => selectAppApproval(pendingInteraction),
  }, BoundApproval))
}
