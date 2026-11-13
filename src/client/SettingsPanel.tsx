import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Badge,
  Banner,
  Button,
  Card,
  CardRow,
  CheckIcon,
  EmptyState,
  LoadingState,
  Modal,
  StandaloneSwitch,
  StateDot,
} from '@kewen/dsh-ui'
import { BASE, setCursorOverlay, useCursorOverlay } from './computer'

export interface SetupState {
  platform: string
  supported: boolean
  driver: {
    installed: boolean
    installing: boolean
    version?: string
    name?: string
    icon?: string
    accessibility: boolean | null
    screenRecording: boolean | null
    error: string | null
  }
  host: {
    helperReady: boolean
    name: string
    icon?: string
    screenRecording: boolean | null
  }
}

export interface AppGrantItem {
  id: string
  name: string
  bundleId?: string
  bundlePath?: string
  executablePath?: string
}

export interface PermissionsState {
  allowedApps: AppGrantItem[]
  blockedApps: AppGrantItem[]
  icons: Record<string, string>
}

const INSTALL_SNIPPET = 'curl -fsSL https://cua.ai/driver/install.sh | /bin/bash'

const COPY = {
  zh: {
    envTitle: '环境与系统权限',
    envHint: '日常操作在后台静默完成，仅借用前台时亮起屏幕顶部状态胶囊。建议与官方实验性「Computer Use」二选一开启，避免双倍消耗 Token 与通道混淆。',
    unsupported: '电脑操控 Plus 目前仅支持 macOS。',
    driverTitle: '底层驱动 cua-driver',
    driverReadyDesc: '负责后台读取无障碍控件树、窗口截图与注入点击输入。',
    driverMissingDesc: '未检测到 cua-driver。点击右侧按钮自动安装至 /Applications/CuaDriver.app 与 ~/.local/bin，或在终端运行下方命令：',
    installBtn: '一键安装',
    installingBtn: '正在安装…',
    installedBadge: '已安装',
    copyCmd: '复制命令',
    copiedCmd: '已复制',
    a11yTitle: '辅助功能',
    a11yBefore: '在系统设置中允许 ',
    a11yAfter: ' 在后台读取界面控件、点击和输入文字。',
    driverScreenTitle: '屏幕录制（窗口观察）',
    driverScreenBefore: '在系统设置中允许 ',
    driverScreenAfter: ' 截取目标应用窗口供智能体识别。',
    hostScreenTitle: '屏幕录制（面板实时画面 · 可选）',
    hostScreenBefore: '配合 Harness Plus 信息面板时，允许 ',
    hostScreenAfter: ' 实时显示操控画面；未安装该面板可跳过，不影响电脑操控。',
    cursorTitle: '实时画面光标与点击涟漪',
    cursorDesc: '在对话信息面板的实时画面上叠画后台虚拟光标位置与点击涟漪动画。',
    requestBtn: '申请权限',
    grantedBtn: '已允许',
    unknownBtn: '打开系统设置',
    waitDriverBtn: '需先安装驱动',
    appsTitle: '管理可访问的应用',
    appsHint: '智能体首次启动或操控某个应用前会向你询问授权；撤销后立即中止对该应用的操控。',
    loadingApps: '正在读取应用授权列表…',
    noApps: '暂无「始终允许」或「不允许访问」的应用',
    allowedGroup: '始终允许的应用',
    blockedGroup: '不允许访问的应用',
    allowedBadge: '始终允许',
    blockedBadge: '已拒绝',
    revokeBtn: '撤销',
    revokeModalTitle: '撤销应用访问权限？',
    revokeModalDesc: (name: string) => `撤销后将立即中止正在对「${name}」执行的后台操控，下次访问时需重新向你询问授权。`,
    cancelBtn: '取消',
    closeBtn: '关闭',
    retryApprovalBtn: '允许再次询问',
    refreshBtn: '重新检测',
    noticeRevoked: '已撤销该应用的访问权限',
    noticeRetryAllowed: '已清除拒绝记录，下次访问该应用时将重新询问',
    noticeRequested: '若未弹出系统授权框，请在刚打开的「系统设置」列表中打开对应开关',
    noticeInstalled: 'cua-driver 安装完成，请继续授予下方系统权限',
  },
  en: {
    envTitle: 'Environment & System Permissions',
    envHint: 'Runs silently in the background by default and shows a top status capsule only when borrowing the foreground. Enable either this plugin or experimental Computer Use—not both—to avoid duplicate token usage.',
    unsupported: 'Computer Plus is currently supported on macOS only.',
    driverTitle: 'cua-driver Runtime',
    driverReadyDesc: 'Provides background accessibility inspection, window screenshots, and input delivery.',
    driverMissingDesc: 'cua-driver was not found. Click Install to run the official installer, or run this command in Terminal:',
    installBtn: 'Install cua-driver',
    installingBtn: 'Installing…',
    installedBadge: 'Installed',
    copyCmd: 'Copy',
    copiedCmd: 'Copied',
    a11yTitle: 'Accessibility',
    a11yBefore: 'In System Settings, allow ',
    a11yAfter: ' to read controls, click, and type in the background.',
    driverScreenTitle: 'Screen Recording (Agent Observation)',
    driverScreenBefore: 'In System Settings, allow ',
    driverScreenAfter: ' to capture target application windows.',
    hostScreenTitle: 'Screen Recording (Panel Preview · Optional)',
    hostScreenBefore: 'When paired with the Harness Plus info panel, allow ',
    hostScreenAfter: ' to stream live previews. Safe to skip if not installed.',
    cursorTitle: 'Live cursor & click ripples',
    cursorDesc: 'Overlay the virtual cursor position and click ripples on live panel previews.',
    requestBtn: 'Request permission',
    grantedBtn: 'Allowed',
    unknownBtn: 'System Settings',
    waitDriverBtn: 'Install driver first',
    appsTitle: 'Application Access',
    appsHint: 'Computer Plus asks before launching or controlling each application. Revoking access immediately stops active operations on that app.',
    loadingApps: 'Loading application permissions…',
    noApps: 'No always-allowed or blocked applications yet',
    allowedGroup: 'Always-allowed applications',
    blockedGroup: 'Blocked applications',
    allowedBadge: 'Allowed',
    blockedBadge: 'Blocked',
    revokeBtn: 'Revoke',
    revokeModalTitle: 'Revoke application access?',
    revokeModalDesc: (name: string) => `Active background operations on "${name}" will stop immediately, and Computer Plus will ask again next time.`,
    cancelBtn: 'Cancel',
    closeBtn: 'Close',
    retryApprovalBtn: 'Allow asking again',
    refreshBtn: 'Check again',
    noticeRevoked: 'Application access revoked',
    noticeRetryAllowed: 'The next attempt on this application will ask again',
    noticeRequested: 'Follow the toggle in System Settings to finish granting access',
    noticeInstalled: 'cua-driver installed; grant Accessibility and Screen Recording below',
  },
}

function detectLang(explicit?: 'zh' | 'en'): 'zh' | 'en' {
  if (explicit) return explicit
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.lang.toLowerCase()
    if (htmlLang.startsWith('en')) return 'en'
    if (htmlLang.startsWith('zh')) return 'zh'
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')) return 'en'
  return 'zh'
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({})) as T & { error?: string }
  if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
  return data
}

function permStateDot(granted: boolean | null | undefined, ready = true): 'ok' | 'warn' | 'idle' {
  if (!ready || granted === null || granted === undefined) return 'idle'
  return granted ? 'ok' : 'warn'
}

function AppBadge({ name, icon, version }: { name: string, icon?: string, version?: string }) {
  return (
    <span className="cp-cfg-badge">
      {icon && <img src={icon} alt="" width={16} height={16} draggable={false} />}
      <span>{name}</span>
      {version && <span className="cp-cfg-ver">v{version}</span>}
    </span>
  )
}

function GearIcon() {
  return (
    <svg className="cp-cfg-gear" viewBox="0 0 16 16" width={13} height={13} aria-hidden="true">
      <path d="M8 10.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
      <path d="M13.2 8a5.2 5.2 0 0 0-.08-.88l1.28-1-.95-1.64-1.52.5a5.3 5.3 0 0 0-1.52-.88l-.28-1.6h-1.9l-.28 1.6c-.55.2-1.06.5-1.52.88l-1.52-.5-.95 1.64 1.28 1a5.3 5.3 0 0 0 0 1.76l-1.28 1 .95 1.64 1.52-.5c.46.38.97.68 1.52.88l.28 1.6h1.9l.28-1.6c.55-.2 1.06-.5 1.52-.88l1.52.5.95-1.64-1.28-1c.05-.29.08-.58.08-.88Z" />
    </svg>
  )
}

export function SettingsPanel({ view = 'page', lang: propLang }: { view?: 'summary' | 'page', lang?: 'zh' | 'en' }) {
  const lang = detectLang(propLang)
  const t = COPY[lang]
  const cursorOverlay = useCursorOverlay()
  const [setup, setSetup] = useState<SetupState | null>(null)
  const [perms, setPerms] = useState<PermissionsState | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<AppGrantItem | null>(null)
  const mounted = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const [sRes, pRes] = await Promise.all([
        fetch(`${BASE}/setup`, { credentials: 'same-origin', cache: 'no-store' }),
        fetch(`${BASE}/permissions`, { credentials: 'same-origin', cache: 'no-store' }),
      ])
      if (!mounted.current) return
      if (sRes.ok) setSetup(await sRes.json() as SetupState)
      if (pRes.ok) setPerms(await pRes.json() as PermissionsState)
      if (sRes.ok && pRes.ok) setError(null)
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : String(err))
    }
  }, [])

  useEffect(() => {
    mounted.current = true
    if (view !== 'page') return () => { mounted.current = false }
    void refresh()
    const onFocus = () => { void refresh() }
    window.addEventListener('focus', onFocus)
    return () => {
      mounted.current = false
      window.removeEventListener('focus', onFocus)
    }
  }, [view, refresh])

  if (view === 'summary') return null

  const runAction = async (key: string, work: () => Promise<void>, okNote?: string) => {
    if (busyKey !== null) return
    setBusyKey(key)
    setError(null)
    setNotice(null)
    try {
      await work()
      if (mounted.current && okNote) setNotice(okNote)
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (mounted.current) setBusyKey(null)
    }
  }

  const copyCommand = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(INSTALL_SNIPPET).then(() => {
        setCopied(true)
        setTimeout(() => { if (mounted.current) setCopied(false) }, 1800)
      }).catch(() => {})
    }
  }

  if (setup !== null && !setup.supported) {
    return (
      <div className="cp-cfg" data-computer-plus-settings="">
        <Banner tone="warn">{t.unsupported}</Banner>
      </div>
    )
  }

  const driverInstalled = setup?.driver.installed === true
  const installing = setup?.driver.installing === true || busyKey === 'install'
  const driverName = setup?.driver.name ?? 'CuaDriver'
  const hostName = setup?.host.name ?? 'DeepSeek Harness'

  const renderPermButton = (
    key: string,
    granted: boolean | null | undefined,
    needDriver: boolean,
    target: 'driver-accessibility' | 'driver-screen' | 'host-screen',
    pane: 'accessibility' | 'screenRecording',
  ) => {
    if (setup === null) return <span className="cp-cfg-skeleton" aria-hidden="true" />
    if (needDriver && !driverInstalled) {
      return (
        <Button size="sm" variant="toolbar" className="cp-cfg-action" disabled>
          {t.waitDriverBtn}
        </Button>
      )
    }
    if (granted === false) {
      return (
        <Button
          size="sm"
          variant="primary"
          className="cp-cfg-action"
          loading={busyKey === key}
          disabled={busyKey !== null}
          onClick={() => void runAction(key, async () => {
            setSetup(await postJson<SetupState>('/setup', { action: 'request-permission', target }))
          }, t.noticeRequested)}
        >
          {t.requestBtn}
        </Button>
      )
    }
    return (
      <Button
        size="sm"
        variant="toolbar"
        className="cp-cfg-action"
        data-granted={granted === true ? '' : undefined}
        loading={busyKey === key}
        disabled={busyKey !== null}
        icon={granted === true ? <CheckIcon size={13} inline={false} /> : undefined}
        trailingIcon={<GearIcon />}
        onClick={() => void runAction(key, async () => {
          setSetup(await postJson<SetupState>('/setup', { action: 'open-settings', pane }))
        })}
      >
        {granted === true ? t.grantedBtn : t.unknownBtn}
      </Button>
    )
  }

  const confirmRevoke = () => {
    if (revokeTarget === null) return
    const targetApp = revokeTarget
    void runAction(`revoke:${targetApp.id}`, async () => {
      setPerms(await postJson<PermissionsState>('/permissions', { action: 'revoke', id: targetApp.id }))
      if (mounted.current) setRevokeTarget(null)
    }, t.noticeRevoked)
  }

  return (
    <div className="cp-cfg" data-computer-plus-settings="" aria-busy={busyKey !== null || setup === null}>
      <section className="cp-cfg-section" aria-label={t.envTitle}>
        <div className="cp-cfg-head">
          <h3>{t.envTitle}</h3>
          <Button
            size="sm"
            variant="toolbar"
            disabled={busyKey !== null}
            onClick={() => void refresh()}
          >
            {t.refreshBtn}
          </Button>
        </div>
        <Card>
          <CardRow
            title={(
              <span className="cp-cfg-row-title">
                <StateDot state={setup === null ? 'idle' : driverInstalled ? 'ok' : 'warn'} />
                <span>{t.driverTitle}</span>
                {driverInstalled && <AppBadge name={driverName} icon={setup?.driver.icon} version={setup?.driver.version} />}
              </span>
            )}
            description={driverInstalled ? t.driverReadyDesc : t.driverMissingDesc}
            action={
              setup === null ? (
                <span className="cp-cfg-skeleton" aria-hidden="true" />
              ) : driverInstalled ? (
                <Badge variant="ok">
                  <CheckIcon size={12} inline={false} />
                  <span>{t.installedBadge}</span>
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  className="cp-cfg-action"
                  loading={installing}
                  disabled={busyKey !== null}
                  onClick={() => void runAction('install', async () => {
                    setSetup(await postJson<SetupState>('/setup', { action: 'install-driver' }))
                  }, t.noticeInstalled)}
                >
                  {installing ? t.installingBtn : t.installBtn}
                </Button>
              )
            }
          >
            {setup !== null && !driverInstalled && (
              <div className="cp-cfg-cmd">
                <code>{INSTALL_SNIPPET}</code>
                <Button size="sm" variant="toolbar" onClick={copyCommand}>
                  {copied ? t.copiedCmd : t.copyCmd}
                </Button>
              </div>
            )}
            {setup?.driver.error && <p className="cp-cfg-err">{setup.driver.error}</p>}
          </CardRow>

          <CardRow
            title={(
              <span className="cp-cfg-row-title">
                <StateDot state={permStateDot(setup?.driver.accessibility, driverInstalled)} />
                <span>{t.a11yTitle}</span>
              </span>
            )}
            description={(
              <>
                {t.a11yBefore}
                <AppBadge name={driverName} icon={setup?.driver.icon} />
                {t.a11yAfter}
              </>
            )}
            action={renderPermButton('a11y', setup?.driver.accessibility, true, 'driver-accessibility', 'accessibility')}
          />

          <CardRow
            title={(
              <span className="cp-cfg-row-title">
                <StateDot state={permStateDot(setup?.driver.screenRecording, driverInstalled)} />
                <span>{t.driverScreenTitle}</span>
              </span>
            )}
            description={(
              <>
                {t.driverScreenBefore}
                <AppBadge name={driverName} icon={setup?.driver.icon} />
                {t.driverScreenAfter}
              </>
            )}
            action={renderPermButton('driver-screen', setup?.driver.screenRecording, true, 'driver-screen', 'screenRecording')}
          />

          <CardRow
            title={(
              <span className="cp-cfg-row-title">
                <StateDot state={permStateDot(setup?.host.screenRecording)} />
                <span>{t.hostScreenTitle}</span>
              </span>
            )}
            description={(
              <>
                {t.hostScreenBefore}
                <AppBadge name={hostName} icon={setup?.host.icon} />
                {t.hostScreenAfter}
              </>
            )}
            action={renderPermButton('host-screen', setup?.host.screenRecording, false, 'host-screen', 'screenRecording')}
          />

          <CardRow
            title={t.cursorTitle}
            description={t.cursorDesc}
            action={(
              <StandaloneSwitch
                checked={cursorOverlay}
                onChange={setCursorOverlay}
                label={t.cursorTitle}
              />
            )}
          />
        </Card>
        <p className="cp-cfg-hint">{t.envHint}</p>
      </section>

      <section className="cp-cfg-section" aria-label={t.appsTitle}>
        <h3>{t.appsTitle}</h3>
        {perms === null ? (
          <LoadingState title={t.loadingApps} />
        ) : perms.allowedApps.length === 0 && perms.blockedApps.length === 0 ? (
          <EmptyState title={t.noApps} description={t.appsHint} />
        ) : (
          <div className="cp-cfg-groups">
            {perms.allowedApps.length > 0 && (
              <AppListGroup
                title={t.allowedGroup}
                badgeText={t.allowedBadge}
                badgeVariant="ok"
                apps={perms.allowedApps}
                icons={perms.icons}
                actionLabel={t.revokeBtn}
                actionVariant="danger-ghost"
                busyKey={busyKey}
                actionPrefix="revoke"
                onAction={app => setRevokeTarget(app)}
              />
            )}
            {perms.blockedApps.length > 0 && (
              <AppListGroup
                title={t.blockedGroup}
                badgeText={t.blockedBadge}
                badgeVariant="subtle"
                apps={perms.blockedApps}
                icons={perms.icons}
                actionLabel={t.retryApprovalBtn}
                actionVariant="toolbar"
                busyKey={busyKey}
                actionPrefix="retry"
                onAction={app => void runAction(`retry:${app.id}`, async () => {
                  setPerms(await postJson<PermissionsState>('/permissions', { action: 'retry', id: app.id }))
                }, t.noticeRetryAllowed)}
              />
            )}
            <p className="cp-cfg-hint">{t.appsHint}</p>
          </div>
        )}
      </section>

      {notice && <Banner tone="info">{notice}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      <Modal
        open={revokeTarget !== null}
        onClose={() => { if (busyKey === null) setRevokeTarget(null) }}
        title={t.revokeModalTitle}
        description={revokeTarget ? t.revokeModalDesc(revokeTarget.name) : undefined}
        closeLabel={t.closeBtn}
        cancelLabel={t.cancelBtn}
        confirmLabel={t.revokeBtn}
        confirmTone="danger"
        confirmLoading={busyKey?.startsWith('revoke:') === true}
        confirmDisabled={busyKey !== null}
        onConfirm={confirmRevoke}
      />
    </div>
  )
}

function AppListGroup({
  title,
  badgeText,
  badgeVariant,
  apps,
  icons,
  actionLabel,
  actionVariant,
  busyKey,
  actionPrefix,
  onAction,
}: {
  title: string
  badgeText: string
  badgeVariant: 'ok' | 'subtle'
  apps: AppGrantItem[]
  icons: Record<string, string>
  actionLabel: string
  actionVariant: 'danger-ghost' | 'toolbar'
  busyKey: string | null
  actionPrefix: string
  onAction: (app: AppGrantItem) => void
}) {
  return (
    <div className="cp-cfg-group">
      <h4 className="cp-cfg-subhead">{title}</h4>
      <Card>
        {apps.map(app => {
          const subtitle = app.bundleId ?? app.bundlePath ?? app.executablePath
          const rowBusy = busyKey === `${actionPrefix}:${app.id}`
          return (
            <CardRow
              key={app.id}
              title={(
                <span className="cp-cfg-app" title={app.bundlePath ?? app.bundleId ?? app.executablePath}>
                  {icons[app.id] ? (
                    <img className="cp-cfg-app-icon" src={icons[app.id]} alt="" width={28} height={28} draggable={false} />
                  ) : (
                    <span className="cp-cfg-app-ph" aria-hidden="true" />
                  )}
                  <span className="cp-cfg-app-meta">
                    <span className="cp-cfg-app-name-row">
                      <strong>{app.name}</strong>
                      <Badge variant={badgeVariant}>{badgeText}</Badge>
                    </span>
                    {subtitle && <span className="cp-cfg-app-id">{subtitle}</span>}
                  </span>
                </span>
              )}
              action={(
                <Button
                  size="sm"
                  variant={actionVariant}
                  loading={rowBusy}
                  disabled={busyKey !== null}
                  onClick={() => onAction(app)}
                >
                  {actionLabel}
                </Button>
              )}
            />
          )
        })}
      </Card>
    </div>
  )
}
