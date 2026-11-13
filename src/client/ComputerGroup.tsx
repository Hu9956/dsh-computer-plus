import { useState } from 'react'
import { StateDot } from '@kewen/dsh-ui'
import { ComputerScreen } from './ComputerScreen'
import { COMPUTER_PROJECTION, appIconUrl, appName, appStatus, asComputerTarget, statusDotState } from './computer'

/**
 * 对话信息面板「电脑操控」组的内容：应用行（图标 + 名字 + 状态圆点）和画面。
 * 组的外框（组名、收起箭头）归面板所有（dsh-harness-plus 的 SessionInfo），它声明插槽 COMPUTER_SLOT、
 * 渲染时传进 sessionId、enabled（面板开着且这一组没收起）和 useProjection。
 */
export const COMPUTER_SLOT = 'harness.session-info.computer'

export interface ComputerGroupProps {
  sessionId: string
  /** 面板开着、这一组没收起：这时才取画面 */
  enabled: boolean
  useProjection?: <T>(key: string) => T | undefined
}

export function ComputerGroup({ sessionId, enabled, useProjection }: ComputerGroupProps) {
  const target = asComputerTarget(useProjection?.(COMPUTER_PROJECTION))
  const icon = appIconUrl(sessionId, target)
  const [broken, setBroken] = useState<string | undefined>(undefined)
  const name = appName(target)
  return (
    <>
      <div className="hs-info-row hs-info-own cp-app">
        <span className="hs-info-ico" aria-hidden="true">
          {icon !== undefined && icon !== broken
            ? <img className="cp-app-icon" src={icon} alt="" width={16} height={16} onError={() => setBroken(icon)} />
            : <MonitorIcon />}
        </span>
        <span className="hs-info-text cp-app-name" title={name}>{name}</span>
        <StateDot
          state={statusDotState(target)}
          label={appStatus(target)}
          className="hs-info-note cp-app-status"
          data-active={target?.active === true || undefined}
        />
      </div>
      <ComputerScreen sessionId={sessionId} target={target} enabled={enabled} />
    </>
  )
}

function MonitorIcon() {
  return (
    <svg className="cp-ic" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="2" y="2.75" width="12" height="8.5" rx="1.75" />
      <path d="M5.75 13.5h4.5M8 11.25v2.25" />
    </svg>
  )
}
