import { execFile } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'

import { daemonEnv, runFile } from './driver.js'

/**
 * 环境与系统权限自检及引导（host 端）：
 * 1. 检查 cua-driver 是否已安装（支持一键运行官方安装脚本），以及 CuaDriver.app 的「辅助功能」和「屏幕录制」权限；
 * 2. 检查 DeepSeek Harness 自身的「屏幕录制」权限（对话信息面板 10fps 实时画面取流用）与内置取流程序状态；
 * 3. 提供「申请权限」与「打开系统设置」动作。
 */

const SETTINGS_URLS = {
  accessibility: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility',
  screenRecording: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
}

const CUA_INSTALL_CMD = 'curl -fsSL https://cua.ai/driver/install.sh | /bin/bash'

/**
 * 从可执行文件路径反推最外层的 macOS .app 包路径（比如 Electron Helper 在 Contents/Frameworks/... 里面）
 * @param {string} execPath
 * @returns {string | undefined}
 */
export function enclosingAppBundle(execPath) {
  const match = /^(\/[^]+?\.app)(?:\/|$)/.exec(execPath)
  return match ? match[1] : undefined
}

/**
 * @param {string} binary
 * @param {string[]} args
 * @param {boolean} [buffer]
 * @returns {Promise<Buffer | string | null>}
 */
function execHelper(binary, args, buffer = false) {
  return new Promise((done) => {
    execFile(binary, args, { encoding: buffer ? 'buffer' : 'utf8', timeout: 6000, maxBuffer: 2 * 1024 * 1024 }, (error, stdout) => {
      if (error) return done(null)
      if (buffer) return done(Buffer.isBuffer(stdout) && stdout.length > 0 ? stdout : null)
      const text = String(stdout ?? '').trim()
      done(text === '' ? null : text)
    })
  })
}

/**
 * @param {{
 *   driver: import('./driver.js').Driver,
 *   helper: () => Promise<string | undefined>,
 *   runInstall?: () => Promise<void>,
 *   openUrl?: (url: string) => Promise<void>,
 *   platform?: NodeJS.Platform,
 * }} deps
 */
export function createSetupManager(deps) {
  const platform = deps.platform ?? process.platform
  /** @type {Promise<void> | undefined} */
  let installing
  /** @type {string | undefined} */
  let cachedVersion
  /** @type {string | undefined} */
  let cachedVersionFor
  /** @type {Map<string, string>} */
  const bundleIcons = new Map()

  const iconForBundle = async (/** @type {string | undefined} */ bundlePath) => {
    if (bundlePath === undefined) return undefined
    const hit = bundleIcons.get(bundlePath)
    if (hit !== undefined) return hit
    const binary = await deps.helper()
    if (binary === undefined) return undefined
    const png = /** @type {Buffer | null} */ (await execHelper(binary, ['icon-path', bundlePath], true))
    if (png === null) return undefined
    const dataUrl = `data:image/png;base64,${png.toString('base64')}`
    bundleIcons.set(bundlePath, dataUrl)
    return dataUrl
  }

  const openSystemSettings = deps.openUrl ?? (async (url) => {
    await runFile('/usr/bin/open', [url], undefined, 8000, daemonEnv())
  })

  const defaultInstall = async () => {
    const home = process.env.HOME ?? homedir()
    const baseEnv = daemonEnv()
    const pathParts = [
      join(home, '.local/bin'),
      '/opt/homebrew/bin',
      '/usr/local/bin',
      baseEnv.PATH ?? '/usr/bin:/bin:/usr/sbin:/sbin',
    ]
    const res = await runFile('/bin/bash', ['-c', CUA_INSTALL_CMD], undefined, 180_000, {
      ...baseEnv,
      NONINTERACTIVE: '1',
      PATH: pathParts.join(':'),
    })
    if (res.code !== 0) {
      const detail = [res.stderr.trim(), res.stdout.trim()].filter(Boolean).join('\n').slice(-800)
      throw new Error(detail || `installer exited with code ${res.code}`)
    }
  }

  const status = async () => {
    if (platform !== 'darwin') {
      return {
        platform,
        supported: false,
        driver: { installed: false, installing: false, accessibility: null, screenRecording: null, error: null },
        host: { helperReady: false, name: 'DeepSeek Harness', screenRecording: null },
      }
    }

    const [cuaPath, helperBinary] = await Promise.all([deps.driver.path(), deps.helper()])

    const hostBundle = enclosingAppBundle(process.execPath)
    const hostName = hostBundle ? basename(hostBundle, '.app') : 'DeepSeek Harness'
    /** @type {boolean | null} */
    let hostScreen = null
    if (helperBinary !== undefined) {
      const raw = /** @type {string | null} */ (await execHelper(helperBinary, ['screen-access'], false))
      if (raw !== null) {
        try {
          const parsed = JSON.parse(raw)
          if (typeof parsed?.screenRecording === 'boolean') hostScreen = parsed.screenRecording
        } catch { /* keep null */ }
      }
    }
    const hostIcon = await iconForBundle(hostBundle)

    if (cuaPath === undefined) {
      return {
        platform,
        supported: true,
        driver: {
          installed: false,
          installing: installing !== undefined,
          name: 'CuaDriver',
          accessibility: null,
          screenRecording: null,
          error: null,
        },
        host: {
          helperReady: helperBinary !== undefined,
          name: hostName,
          ...(hostIcon ? { icon: hostIcon } : {}),
          screenRecording: hostScreen,
        },
      }
    }

    if (cachedVersionFor !== cuaPath) {
      const ver = await runFile(cuaPath, ['--version'], undefined, 4000).catch(() => undefined)
      const m = ver?.code === 0 ? /(\d+\.\d+\.\d+\S*)/.exec(ver.stdout) : null
      cachedVersion = m ? m[1] : undefined
      cachedVersionFor = cuaPath
    }

    const home = process.env.HOME ?? homedir()
    let driverBundle = enclosingAppBundle(cuaPath)
    if (driverBundle === undefined) {
      for (const candidate of ['/Applications/CuaDriver.app', join(home, 'Applications/CuaDriver.app')]) {
        if (await stat(candidate).then(s => s.isDirectory(), () => false)) {
          driverBundle = candidate
          break
        }
      }
    }
    const driverIcon = await iconForBundle(driverBundle)

    /** @type {boolean | null} */
    let accessibility = null
    /** @type {boolean | null} */
    let screenRecording = null
    /** @type {string | null} */
    let driverError = null
    try {
      const perms = await deps.driver.call('check_permissions', { prompt: false }, { timeout: 10_000 })
      if (typeof perms?.accessibility === 'boolean') accessibility = perms.accessibility
      if (typeof perms?.screen_recording === 'boolean') screenRecording = perms.screen_recording
    } catch (error) {
      driverError = error instanceof Error ? error.message : String(error)
    }

    return {
      platform,
      supported: true,
      driver: {
        installed: true,
        installing: installing !== undefined,
        ...(cachedVersion ? { version: cachedVersion } : {}),
        name: driverBundle ? basename(driverBundle, '.app') : 'CuaDriver',
        ...(driverIcon ? { icon: driverIcon } : {}),
        accessibility,
        screenRecording,
        error: driverError,
      },
      host: {
        helperReady: helperBinary !== undefined,
        name: hostName,
        ...(hostIcon ? { icon: hostIcon } : {}),
        screenRecording: hostScreen,
      },
    }
  }

  const installDriver = async () => {
    if (platform !== 'darwin') throw new Error('Only macOS is supported')
    installing ??= (deps.runInstall ?? defaultInstall)().finally(() => { installing = undefined })
    await installing
    return status()
  }

  /**
   * @param {'driver-accessibility' | 'driver-screen' | 'host-screen'} target
   */
  const requestPermission = async (target) => {
    if (platform !== 'darwin') throw new Error('Only macOS is supported')
    if (target === 'driver-accessibility' || target === 'driver-screen') {
      const perms = await deps.driver.call('check_permissions', { prompt: true, probe_direct_capture: false }, { timeout: 15_000 })
      const granted = target === 'driver-accessibility' ? perms?.accessibility === true : perms?.screen_recording === true
      if (!granted) {
        await openSystemSettings(target === 'driver-accessibility' ? SETTINGS_URLS.accessibility : SETTINGS_URLS.screenRecording).catch(() => {})
      }
      return status()
    }
    if (target === 'host-screen') {
      const binary = await deps.helper()
      if (binary === undefined) throw new Error('Stream helper binary is unavailable')
      const raw = /** @type {string | null} */ (await execHelper(binary, ['request-screen'], false))
      let granted = false
      if (raw !== null) {
        try { granted = JSON.parse(raw)?.screenRecording === true } catch { /* ignore */ }
      }
      if (!granted) await openSystemSettings(SETTINGS_URLS.screenRecording).catch(() => {})
      return status()
    }
    throw new Error(`Unknown permission target: ${String(target)}`)
  }

  /**
   * @param {'accessibility' | 'screenRecording'} pane
   */
  const openSettings = async (pane) => {
    if (platform !== 'darwin') throw new Error('Only macOS is supported')
    const url = SETTINGS_URLS[pane]
    if (url === undefined) throw new Error(`Unknown settings pane: ${String(pane)}`)
    await openSystemSettings(url)
  }

  return { status, installDriver, requestPermission, openSettings }
}
