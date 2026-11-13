import { useState, type ReactNode } from 'react'
import { Button, Card, Modal, WarnIcon } from '@kewen/dsh-ui'

export const APP_ACCESS_QUESTION_ID = 'computer-plus-app-access'

export interface ApprovalIntent {
  kind: 'approval'
  approve: string
  reject: string
  always?: string
  subject?: { name: string, icon?: string }
  display?: {
    question?: Record<string, string>
    detail?: Record<string, string>
    approve?: Record<string, string>
  }
}

export interface PendingQuestionItem {
  id: string
  question: string
  detail?: string
  intent?: ApprovalIntent
}

export interface PendingQuestionInteraction {
  kind: 'question'
  key: string
  questions: readonly PendingQuestionItem[]
  answer: (payload: { answers: Array<{ id: string, selected: string[] }> }) => Promise<void>
  snapshot?: () => { channel?: string, closed?: boolean }
}

export interface MatchedAppApproval {
  pending: PendingQuestionInteraction
  item: PendingQuestionItem
  intent: ApprovalIntent
}

/**
 * 只认电脑操控 Plus 自己的应用访问授权问题；别的提问与审批原样交给宿主默认渲染器。
 */
export function selectAppApproval(pending: unknown): MatchedAppApproval | null {
  if (pending === null || typeof pending !== 'object') return null
  const p = pending as Partial<PendingQuestionInteraction>
  if (p.kind !== 'question' || !Array.isArray(p.questions) || p.questions.length !== 1) return null
  const item = p.questions[0] as PendingQuestionItem | undefined
  if (item?.id !== APP_ACCESS_QUESTION_ID || item.intent?.kind !== 'approval') return null
  return { pending: p as PendingQuestionInteraction, item, intent: item.intent }
}

const RISK_COPY = {
  zh: {
    label: '风险提示',
    title: '电脑操控风险提示',
    detail: '智能体只能访问你授权的应用，并在后台读取界面、截图和执行点击输入，不会抢占前台或移动真实鼠标。\n\n即时通讯、网游或金融类应用可能限制自动化操作，请自行评估风险；需要随时中止时，点击对话输入框旁的停止按钮即可。',
    reject: '拒绝',
    always: '始终允许',
    close: '关闭',
    gotIt: '知道了',
  },
  en: {
    label: 'Risks',
    title: 'Computer control risks',
    detail: 'The agent can access only applications you approve, reading and controlling them in the background without stealing focus or moving your cursor.\n\nMessaging, gaming, or financial apps may restrict automation. Proceed at your own risk, or press Stop anytime in DeepSeek Harness.',
    reject: 'Deny',
    always: 'Always allow',
    close: 'Close',
    gotIt: 'Got it',
  },
}

function pickLang(): 'zh' | 'en' {
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.lang.toLowerCase()
    if (htmlLang.startsWith('en')) return 'en'
    if (htmlLang.startsWith('zh')) return 'zh'
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')) return 'en'
  return 'zh'
}

function pickLocalized(map: Record<string, string> | undefined, fallback: string, lang: 'zh' | 'en'): string {
  if (map === undefined) return fallback
  return map[lang] ?? map.zh ?? map.en ?? fallback
}

export function AppApproval(props: {
  matched: MatchedAppApproval
  lang?: 'zh' | 'en'
  renderFactorySlot?: (name: string, slotProps: Record<string, unknown>) => ReactNode
}): ReactNode {
  const { matched: { pending, item, intent }, renderFactorySlot } = props
  const lang = props.lang ?? pickLang()
  const risk = RISK_COPY[lang]
  const title = pickLocalized(intent.display?.question, item.question, lang)
  const description = item.detail === undefined && intent.display?.detail === undefined
    ? undefined
    : pickLocalized(intent.display?.detail, item.detail ?? '', lang)
  const allowLabel = pickLocalized(intent.display?.approve, intent.approve, lang)
  const canAnswer = () => {
    if (typeof pending.snapshot !== 'function') return true
    const snap = pending.snapshot()
    return snap.channel !== 'none' && !snap.closed
  }
  const send = (choice: string) => pending.answer({ answers: [{ id: item.id, selected: [choice] }] })

  if (typeof renderFactorySlot === 'function') {
    return renderFactorySlot('conversation.approval.card', {
      requestKey: pending.key,
      warning: { label: risk.label, title: risk.title, detail: risk.detail },
      title,
      ...(description === undefined ? {} : { description }),
      ...(intent.subject === undefined ? {} : { subject: intent.subject }),
      allowLabel,
      canAnswer,
      onAllow: () => send(intent.approve),
      onReject: () => send(intent.reject),
      ...(intent.always === undefined ? {} : { onAlways: () => send(intent.always!) }),
    })
  }

  return (
    <FallbackApprovalCard
      subject={intent.subject}
      title={title}
      description={description}
      allowLabel={allowLabel}
      rejectLabel={risk.reject}
      alwaysLabel={intent.always === undefined ? undefined : risk.always}
      risk={risk}
      canAnswer={canAnswer}
      onAllow={() => send(intent.approve)}
      onReject={() => send(intent.reject)}
      onAlways={intent.always === undefined ? undefined : () => send(intent.always!)}
    />
  )
}

function FallbackApprovalCard(props: {
  subject?: { name: string, icon?: string }
  title: string
  description?: string
  allowLabel: string
  rejectLabel: string
  alwaysLabel?: string
  risk: { label: string, title: string, detail: string, close: string, gotIt: string }
  canAnswer: () => boolean
  onAllow: () => Promise<void>
  onReject: () => Promise<void>
  onAlways?: () => Promise<void>
}) {
  const [busyChoice, setBusyChoice] = useState<'reject' | 'allow' | 'always' | null>(null)
  const [riskOpen, setRiskOpen] = useState(false)
  const busy = busyChoice !== null

  const choose = (choice: 'reject' | 'allow' | 'always', fn: () => Promise<void>) => {
    if (busy || !props.canAnswer()) return
    setBusyChoice(choice)
    void fn().catch(() => setBusyChoice(null))
  }

  return (
    <div className="cp-approval-fallback" role="region" aria-label={props.title}>
      <Card className="cp-approval-card">
        <div className="cp-approval-head">
          {props.subject ? (
            <div className="cp-approval-subject">
              {props.subject.icon && (
                <img
                  className="cp-approval-icon"
                  src={props.subject.icon}
                  alt=""
                  width={32}
                  height={32}
                  draggable={false}
                />
              )}
              <strong>{props.subject.name}</strong>
            </div>
          ) : <span />}
          <Button
            size="sm"
            variant="ghost"
            className="cp-approval-risk-btn"
            icon={<WarnIcon size={14} inline={false} />}
            onClick={() => setRiskOpen(true)}
          >
            {props.risk.label}
          </Button>
        </div>
        <div className="cp-approval-title">{props.title}</div>
        {props.description && <p className="cp-approval-desc">{props.description}</p>}
        <div className="cp-approval-actions">
          <Button
            size="sm"
            variant="danger-ghost"
            loading={busyChoice === 'reject'}
            disabled={busy}
            onClick={() => choose('reject', props.onReject)}
          >
            {props.rejectLabel}
          </Button>
          <Button
            size="sm"
            variant={props.onAlways ? 'toolbar' : 'primary'}
            loading={busyChoice === 'allow'}
            disabled={busy}
            onClick={() => choose('allow', props.onAllow)}
          >
            {props.allowLabel}
          </Button>
          {props.onAlways && props.alwaysLabel && (
            <Button
              size="sm"
              variant="primary"
              loading={busyChoice === 'always'}
              disabled={busy}
              onClick={() => choose('always', props.onAlways!)}
            >
              {props.alwaysLabel}
            </Button>
          )}
        </div>
      </Card>

      <Modal
        open={riskOpen}
        onClose={() => setRiskOpen(false)}
        title={props.risk.title}
        closeLabel={props.risk.close}
        confirmLabel={props.risk.gotIt}
        onConfirm={() => setRiskOpen(false)}
      >
        <p className="cp-approval-risk-copy">{props.risk.detail}</p>
      </Modal>
    </div>
  )
}
