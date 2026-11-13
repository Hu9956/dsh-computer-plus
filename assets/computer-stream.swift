// 电脑操控画面取流与本机查询（dsh-computer-plus 的 macOS 辅助程序，随包附带预编译通用二进制，缺失时才用 swiftc 编译）。
//
// 用法：
//   computer-stream window <windowId> <pid> [fps] [edge]   持续取流
//   computer-stream snap <windowId> <pid> [edge]           只拍一张（单张截图，不开流），写一帧后退出
//   computer-stream display [fps] [edge]
//   computer-stream icon <pid>                             把这个进程所属应用的图标画成 64×64 PNG 写到 stdout，然后退出
//   computer-stream icon-path <bundlePath>                 把指定应用包路径的图标画成 64×64 PNG 写到 stdout，然后退出
//   computer-stream app-info pid|bundle|name <value>       不启动、不激活应用，查询其身份与图标 JSON
//   computer-stream screen-access                          只读查询宿主屏幕录制权限（不弹窗）
//   computer-stream request-screen                         申请宿主屏幕录制权限（未授权时触发系统引导）
//   computer-stream hud                                    屏幕顶部非抢焦胶囊浮窗（读 stdin JSON 行：preparing / active / done / aborted）
//
// 用 ScreenCaptureKit 取一个窗口（或主显示器）的画面，长边缩到 edge（默认 640），最高 fps 帧/秒（默认 10）。
// 每帧编码成 JPEG（质量 0.7）写到 stdout：4 字节大端长度 + JPEG 数据。和上一帧字节完全相同就不写
// （实测静止的窗口系统也每帧都报「画面变了」，不能靠它判断）。编码还没完时来的帧直接丢，不排队。
//
// 退出码：0 正常结束（stdin 关闭、收到 SIGTERM、拍完一张）；3 窗口不存在或已关闭；4 取不到画面（多半是没有屏幕录制权限）；
// 5 取流中途出错；2 参数错。
// 窗口身份用 windowId + pid 双重校验：窗口关掉后 id 可能被别的应用复用，只认 id 会截到不该看的窗口。
//
// 停止一定先 stopCapture 再退出（2026-11-02 真机）：开流请求还在系统 replayd 里排着时进程就死了，
// replayd 会在进程死后照样把流建起来，这条流没人收、也没人停，窗口标题栏的紫色录屏标一直亮着，
// 直到 replayd 重启。所以 SIGTERM 和 stdin 关闭都走同一个收尾：开流中就等它开完再停，已经在流就先停再退。

import AppKit
import CoreImage
import Foundation
import ImageIO
import QuartzCore
import ScreenCaptureKit
import UniformTypeIdentifiers

func fail(_ code: Int32, _ message: String) -> Never {
  FileHandle.standardError.write("\(message)\n".data(using: .utf8)!)
  exit(code)
}

enum Target {
  case window(CGWindowID, pid_t)
  case display
}

let argv = CommandLine.arguments

func pngIcon(_ icon: NSImage) -> Data? {
  guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 64, pixelsHigh: 64, bitsPerSample: 8, samplesPerPixel: 4,
                                   hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else { return nil }
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  icon.draw(in: NSRect(x: 0, y: 0, width: 64, height: 64))
  NSGraphicsContext.restoreGraphicsState()
  return rep.representation(using: .png, properties: [:])
}

func writeJson(_ object: [String: Any?]) -> Never {
  var clean: [String: Any] = [:]
  for (k, v) in object {
    if let v { clean[k] = v }
  }
  guard let data = try? JSONSerialization.data(withJSONObject: clean) else { fail(5, "json encode failed") }
  FileHandle.standardOutput.write(data)
  FileHandle.standardOutput.write(Data([0x0a]))
  exit(0)
}

func loctableNames(_ url: URL) -> (preferred: String?, all: [String]) {
  let res = url.appendingPathComponent("Contents/Resources")
  var byLocale: [String: String] = [:]
  if let table = NSDictionary(contentsOf: res.appendingPathComponent("InfoPlist.loctable")) as? [String: Any] {
    for (loc, entry) in table {
      guard let dict = entry as? [String: Any] else { continue }
      if let name = (dict["CFBundleDisplayName"] as? String) ?? (dict["CFBundleName"] as? String), !name.isEmpty {
        byLocale[loc] = name
      }
    }
  }
  for loc in ["zh-Hans", "zh_CN", "zh_TW", "en"] where byLocale[loc] == nil {
    let stringsUrl = res.appendingPathComponent("\(loc).lproj/InfoPlist.strings")
    if let dict = NSDictionary(contentsOf: stringsUrl) as? [String: Any],
       let name = (dict["CFBundleDisplayName"] as? String) ?? (dict["CFBundleName"] as? String), !name.isEmpty {
      byLocale[loc] = name
    }
  }
  for pref in Locale.preferredLanguages {
    let norm = pref.replacingOccurrences(of: "-", with: "_")
    if let exact = byLocale[pref] ?? byLocale[norm] { return (exact, Array(byLocale.values)) }
    if norm.hasPrefix("zh_Hans") || norm == "zh_CN", let zh = byLocale["zh_CN"] ?? byLocale["zh-Hans"] ?? byLocale["zh"] {
      return (zh, Array(byLocale.values))
    }
    if norm.hasPrefix("zh_Hant") || norm == "zh_TW" || norm == "zh_HK", let zh = byLocale["zh_TW"] ?? byLocale["zh_HK"] ?? byLocale["zh-Hant"] {
      return (zh, Array(byLocale.values))
    }
    let prefix = String(norm.split(separator: "_").first ?? "")
    if !prefix.isEmpty, let hit = byLocale[prefix] { return (hit, Array(byLocale.values)) }
  }
  return (nil, Array(byLocale.values))
}

func bundleDisplayName(_ url: URL) -> String {
  if let localized = loctableNames(url).preferred, !localized.isEmpty { return localized }
  let raw = FileManager.default.displayName(atPath: url.path)
  let display = raw.lowercased().hasSuffix(".app") ? String(raw.dropLast(4)) : raw
  let stem = url.deletingPathExtension().lastPathComponent
  if !display.isEmpty && display != stem { return display }
  let bundle = Bundle(url: url)
  if let s = bundle?.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String, !s.isEmpty { return s }
  if let s = bundle?.object(forInfoDictionaryKey: "CFBundleName") as? String, !s.isEmpty { return s }
  return display.isEmpty ? stem : display
}

func emitBundleInfo(_ url: URL, fallbackBundleId: String? = nil) -> Never {
  let resolved = url.resolvingSymlinksInPath()
  let bundle = Bundle(url: resolved)
  let bundleId = bundle?.bundleIdentifier ?? fallbackBundleId
  let execPath = bundle?.executableURL?.resolvingSymlinksInPath().path
  let iconData = pngIcon(NSWorkspace.shared.icon(forFile: resolved.path))
  writeJson([
    "bundleId": bundleId,
    "name": bundleDisplayName(resolved),
    "bundlePath": resolved.path,
    "executablePath": execPath,
    "icon": iconData.map { "data:image/png;base64,\($0.base64EncodedString())" },
  ])
}

func emitRunningInfo(_ app: NSRunningApplication) -> Never {
  let bundleUrl = app.bundleURL?.resolvingSymlinksInPath()
  let execPath = app.executableURL?.resolvingSymlinksInPath().path
  let name = app.localizedName
    ?? bundleUrl.map(bundleDisplayName)
    ?? app.executableURL?.lastPathComponent
    ?? "PID \(app.processIdentifier)"
  let iconImage = app.icon ?? bundleUrl.map { NSWorkspace.shared.icon(forFile: $0.path) }
  let iconData = iconImage.flatMap(pngIcon)
  writeJson([
    "pid": Int(app.processIdentifier),
    "bundleId": app.bundleIdentifier,
    "name": name,
    "bundlePath": bundleUrl?.path,
    "executablePath": execPath,
    "icon": iconData.map { "data:image/png;base64,\($0.base64EncodedString())" },
  ])
}

// 屏幕录制权限查询 / 申请（算在父进程 DeepSeek Harness 名下）
if argv.count == 2, argv[1] == "screen-access" {
  writeJson(["screenRecording": CGPreflightScreenCaptureAccess()])
}
if argv.count == 2, argv[1] == "request-screen" {
  writeJson(["screenRecording": CGRequestScreenCaptureAccess()])
}

// 应用图标：按 pid 找运行中的应用（不收外部传来的路径），取系统给的图标画成 64×64 PNG
if argv.count == 3, argv[1] == "icon", let pid = Int32(argv[2]) {
  guard let app = NSRunningApplication(processIdentifier: pid), let icon = app.icon else { fail(3, "app gone") }
  guard let png = pngIcon(icon) else { fail(5, "encode failed") }
  FileHandle.standardOutput.write(png)
  exit(0)
}

// 离线应用图标：按本机已存在的应用包或可执行文件路径画成 64×64 PNG（设置页展示已存授权时用）
if argv.count == 3, argv[1] == "icon-path" {
  let path = argv[2]
  guard path.hasPrefix("/"), FileManager.default.fileExists(atPath: path) else { fail(3, "path missing") }
  guard let png = pngIcon(NSWorkspace.shared.icon(forFile: path)) else { fail(5, "encode failed") }
  FileHandle.standardOutput.write(png)
  exit(0)
}

// 应用身份查询：在启动或操控前认清目标应用，不激活、不启动任何进程
if argv.count == 4, argv[1] == "app-info" {
  let kind = argv[2]
  let value = argv[3].trimmingCharacters(in: .whitespacesAndNewlines)
  if value.isEmpty { fail(2, "empty selector") }
  if kind == "pid", let pid = Int32(value) {
    guard let app = NSRunningApplication(processIdentifier: pid) else { fail(3, "app gone") }
    emitRunningInfo(app)
  } else if kind == "bundle" {
    if let running = NSRunningApplication.runningApplications(withBundleIdentifier: value).first {
      emitRunningInfo(running)
    }
    guard let url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: value) else { fail(3, "app not found") }
    emitBundleInfo(url, fallbackBundleId: value)
  } else if kind == "name" {
    let needle = (value.lowercased().hasSuffix(".app") ? String(value.dropLast(4)) : value).lowercased()
    for app in NSWorkspace.shared.runningApplications where app.activationPolicy == .regular {
      let candidates = [
        app.localizedName,
        app.bundleURL?.deletingPathExtension().lastPathComponent,
        app.bundleURL.map(bundleDisplayName),
      ].compactMap { $0?.lowercased() }
      if candidates.contains(needle) { emitRunningInfo(app) }
    }
    if value.hasPrefix("/"), FileManager.default.fileExists(atPath: value) {
      emitBundleInfo(URL(fileURLWithPath: value))
    }
    let roots = [
      "/Applications",
      "/Applications/Utilities",
      (NSHomeDirectory() as NSString).appendingPathComponent("Applications"),
      "/System/Applications",
      "/System/Applications/Utilities",
      "/System/Cryptexes/App/System/Applications",
    ]
    for root in roots {
      guard let items = try? FileManager.default.contentsOfDirectory(atPath: root) else { continue }
      for item in items where item.lowercased().hasSuffix(".app") {
        let url = URL(fileURLWithPath: (root as NSString).appendingPathComponent(item))
        let stem = url.deletingPathExtension().lastPathComponent.lowercased()
        let display = bundleDisplayName(url).lowercased()
        let bundle = Bundle(url: url)
        let cfDisplay = (bundle?.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String)?.lowercased()
        let cfName = (bundle?.object(forInfoDictionaryKey: "CFBundleName") as? String)?.lowercased()
        let allLocalized = loctableNames(url).all.map { $0.lowercased() }
        if stem == needle || display == needle || cfDisplay == needle || cfName == needle || allLocalized.contains(needle) {
          emitBundleInfo(url)
        }
      }
    }
    fail(3, "app not found")
  } else {
    fail(2, "usage: computer-stream app-info pid|bundle|name <value>")
  }
}

// ─── 前台借用状态胶囊浮窗（NSPanel nonactivatingPanel，点击穿透、不占 Dock、结束后自动归还原前台窗口） ───
final class HudBannerController {
  private let panel: NSPanel
  private let root = NSView()
  private let dotLayer = CALayer()
  private let iconView = NSImageView()
  private let primaryLabel = NSTextField(labelWithString: "")
  private let sepLabel = NSTextField(labelWithString: "·")
  private let secondaryLabel = NSTextField(labelWithString: "")
  private let initialFrontApp: NSRunningApplication?
  private var operatedPids = Set<pid_t>()
  private var lastAppName = ""
  private var lastIcon: NSImage?
  private var shown = false
  private var closing = false
  private let isEnglish: Bool

  init() {
    let firstLang = Locale.preferredLanguages.first?.lowercased() ?? "zh"
    self.isEnglish = firstLang.hasPrefix("en")
    let front = NSWorkspace.shared.frontmostApplication
    if let f = front, f.bundleIdentifier != "com.trycua.driver", f.processIdentifier != ProcessInfo.processInfo.processIdentifier {
      self.initialFrontApp = f
    } else {
      self.initialFrontApp = nil
    }

    let p = NSPanel(
      contentRect: NSRect(x: 0, y: 0, width: 320, height: 40),
      styleMask: [.borderless, .nonactivatingPanel],
      backing: .buffered,
      defer: false
    )
    p.level = .statusBar
    p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
    p.isFloatingPanel = true
    p.hidesOnDeactivate = false
    p.isOpaque = false
    p.backgroundColor = .clear
    p.hasShadow = true
    p.ignoresMouseEvents = true
    p.alphaValue = 0
    self.panel = p

    root.wantsLayer = true
    if let layer = root.layer {
      layer.cornerRadius = 20
      layer.masksToBounds = true
      layer.backgroundColor = NSColor(calibratedRed: 0.08, green: 0.09, blue: 0.11, alpha: 0.90).cgColor
      layer.borderWidth = 1
      layer.borderColor = NSColor(calibratedWhite: 1.0, alpha: 0.15).cgColor
    }

    dotLayer.bounds = CGRect(x: 0, y: 0, width: 9, height: 9)
    dotLayer.cornerRadius = 4.5
    root.layer?.addSublayer(dotLayer)

    iconView.imageScaling = .scaleProportionallyUpOrDown
    root.addSubview(iconView)

    primaryLabel.font = NSFont.systemFont(ofSize: 13, weight: .semibold)
    primaryLabel.textColor = NSColor(calibratedWhite: 0.98, alpha: 1.0)
    primaryLabel.lineBreakMode = .byTruncatingTail
    root.addSubview(primaryLabel)

    sepLabel.font = NSFont.systemFont(ofSize: 13, weight: .regular)
    sepLabel.textColor = NSColor(calibratedWhite: 1.0, alpha: 0.35)
    root.addSubview(sepLabel)

    secondaryLabel.font = NSFont.systemFont(ofSize: 12.5, weight: .regular)
    secondaryLabel.textColor = NSColor(calibratedWhite: 0.88, alpha: 0.76)
    secondaryLabel.lineBreakMode = .byTruncatingTail
    root.addSubview(secondaryLabel)

    p.contentView = root
  }

  private func resolveApp(pid: pid_t?, explicitName: String?) -> (String, NSImage?) {
    if let pid, pid > 0 {
      operatedPids.insert(pid)
      if let running = NSRunningApplication(processIdentifier: pid) {
        let name = explicitName?.isEmpty == false
          ? explicitName!
          : (running.bundleURL.map(bundleDisplayName) ?? running.localizedName ?? "App")
        let icon = running.icon ?? running.bundleURL.map { NSWorkspace.shared.icon(forFile: $0.path) }
        lastAppName = name
        if let icon { lastIcon = icon }
        return (name, icon ?? lastIcon)
      }
    }
    if let explicitName, !explicitName.isEmpty { lastAppName = explicitName }
    let fallback = lastAppName.isEmpty ? (isEnglish ? "Application" : "应用") : lastAppName
    return (fallback, lastIcon)
  }

  private func setDot(color: NSColor, pulse: Bool) {
    dotLayer.removeAllAnimations()
    dotLayer.backgroundColor = color.cgColor
    dotLayer.shadowColor = color.cgColor
    dotLayer.shadowOpacity = 0.75
    dotLayer.shadowRadius = 4
    dotLayer.shadowOffset = .zero
    if pulse {
      let anim = CABasicAnimation(keyPath: "opacity")
      anim.fromValue = 1.0
      anim.toValue = 0.35
      anim.duration = 0.75
      anim.autoreverses = true
      anim.repeatCount = .infinity
      dotLayer.add(anim, forKey: "pulse")
    }
  }

  private func layoutAndPlace() {
    let height: CGFloat = 40
    let padX: CGFloat = 16
    var x = padX

    CATransaction.begin()
    CATransaction.setDisableActions(true)
    dotLayer.position = CGPoint(x: x + 4.5, y: height / 2)
    CATransaction.commit()
    x += 9 + 9

    if iconView.image != nil {
      iconView.isHidden = false
      iconView.frame = NSRect(x: x, y: (height - 20) / 2, width: 20, height: 20)
      x += 20 + 7
    } else {
      iconView.isHidden = true
    }

    primaryLabel.sizeToFit()
    let pSize = primaryLabel.frame.size
    let pWidth = min(pSize.width, 280)
    primaryLabel.frame = NSRect(x: x, y: (height - pSize.height) / 2, width: pWidth, height: pSize.height)
    x += pWidth + 7

    sepLabel.sizeToFit()
    let sepSize = sepLabel.frame.size
    sepLabel.frame = NSRect(x: x, y: (height - sepSize.height) / 2, width: sepSize.width, height: sepSize.height)
    x += sepSize.width + 7

    secondaryLabel.sizeToFit()
    let sSize = secondaryLabel.frame.size
    let sWidth = min(sSize.width, 210)
    secondaryLabel.frame = NSRect(x: x, y: (height - sSize.height) / 2, width: sWidth, height: sSize.height)
    x += sWidth + padX

    let width = max(240, ceil(x))
    root.frame = NSRect(x: 0, y: 0, width: width, height: height)

    let screen = NSScreen.main ?? NSScreen.screens.first
    let visible = screen?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
    let originX = round(visible.midX - width / 2)
    let originY = round(visible.maxY - height - 10)
    let finalFrame = NSRect(x: originX, y: originY, width: width, height: height)

    if !shown {
      shown = true
      panel.setFrame(NSRect(x: originX, y: originY + 6, width: width, height: height), display: true)
      panel.orderFrontRegardless()
      NSAnimationContext.runAnimationGroup { ctx in
        ctx.duration = 0.18
        panel.animator().alphaValue = 1.0
        panel.animator().setFrame(finalFrame, display: true)
      }
    } else {
      NSAnimationContext.runAnimationGroup { ctx in
        ctx.duration = 0.14
        panel.animator().setFrame(finalFrame, display: true)
      }
    }
  }

  func restoreFocusIfNeeded() {
    guard let saved = initialFrontApp, !saved.isTerminated else { return }
    if operatedPids.contains(saved.processIdentifier) { return }
    let now = NSWorkspace.shared.frontmostApplication
    let shouldRestore = now == nil
      || operatedPids.contains(now!.processIdentifier)
      || now?.bundleIdentifier == "com.trycua.driver"
    if shouldRestore && now?.processIdentifier != saved.processIdentifier {
      _ = saved.activate(options: NSApplication.ActivationOptions(rawValue: 1 << 1))
    }
  }

  func applyCommand(_ json: [String: Any]) {
    if closing { return }
    let state = (json["state"] as? String) ?? "active"
    let pid = (json["pid"] as? NSNumber)?.int32Value
    let rawApp = json["app"] as? String
    let (appName, icon) = resolveApp(pid: pid, explicitName: rawApp)
    iconView.image = icon

    switch state {
    case "preparing":
      primaryLabel.stringValue = isEnglish ? "Switching to “\(appName)”" : "即将切换到「\(appName)」"
      secondaryLabel.stringValue = isEnglish ? "Hands off briefly" : "请暂松键鼠"
      setDot(color: NSColor(calibratedRed: 0.96, green: 0.62, blue: 0.04, alpha: 1.0), pulse: true)
      layoutAndPlace()

    case "active":
      primaryLabel.stringValue = isEnglish ? "Agent operating “\(appName)”" : "Agent 正在操作「\(appName)」"
      secondaryLabel.stringValue = isEnglish ? "Please wait — hands off" : "请稍候，勿动键鼠"
      setDot(color: NSColor(calibratedRed: 0.23, green: 0.51, blue: 0.96, alpha: 1.0), pulse: true)
      layoutAndPlace()

    case "done", "aborted":
      closing = true
      restoreFocusIfNeeded()
      let isDone = state == "done"
      if isDone {
        primaryLabel.stringValue = isEnglish ? "Finished on “\(appName)”" : "「\(appName)」操作完成"
        secondaryLabel.stringValue = isEnglish ? "You can continue" : "可以继续使用了"
        setDot(color: NSColor(calibratedRed: 0.13, green: 0.77, blue: 0.37, alpha: 1.0), pulse: false)
      } else {
        primaryLabel.stringValue = isEnglish ? "Stopped on “\(appName)”" : "已停止操作「\(appName)」"
        secondaryLabel.stringValue = isEnglish ? "You can continue" : "可以继续使用了"
        setDot(color: NSColor(calibratedRed: 0.58, green: 0.64, blue: 0.72, alpha: 1.0), pulse: false)
      }
      layoutAndPlace()
      let holdMs = (json["holdMs"] as? NSNumber)?.intValue ?? (isDone ? 1800 : 1400)
      let holdSec = max(0.2, min(5.0, Double(holdMs) / 1000.0))
      DispatchQueue.main.asyncAfter(deadline: .now() + holdSec) { [panel] in
        NSAnimationContext.runAnimationGroup({ ctx in
          ctx.duration = 0.22
          panel.animator().alphaValue = 0.0
        }, completionHandler: {
          exit(0)
        })
      }

    default:
      break
    }
  }

  func handleStdinClosed() {
    if closing { return }
    emergencyExit()
  }

  func emergencyExit() -> Never {
    restoreFocusIfNeeded()
    exit(0)
  }
}

if argv.count == 2, argv[1] == "hud" {
  let app = NSApplication.shared
  app.setActivationPolicy(.accessory)
  let controller = HudBannerController()

  signal(SIGTERM, SIG_IGN)
  let term = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
  term.setEventHandler { controller.emergencyExit() }
  term.resume()

  DispatchQueue(label: "computer-stream.hud.stdin").async {
    while let line = readLine(strippingNewline: true) {
      let trimmed = line.trimmingCharacters(in: .whitespacesAndNewlines)
      if trimmed.isEmpty { continue }
      guard let data = trimmed.data(using: .utf8),
            let obj = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] else { continue }
      DispatchQueue.main.async {
        controller.applyCommand(obj)
      }
    }
    // 父进程关闭 stdin 时：若已进入 done/aborted 展示倒计时则让它播完淡出，否则立即恢复焦点退出
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
      controller.handleStdinClosed()
    }
  }

  app.run()
  exit(0)
}

var target: Target
var single = false
var fps: Int32 = 10
var edge: Double = 640
if argv.count >= 4, argv[1] == "window", let wid = UInt32(argv[2]), let pid = Int32(argv[3]) {
  target = .window(wid, pid)
  let rest = argv.dropFirst(4)
  fps = Int32(rest.first ?? "") ?? 10
  edge = Double(rest.dropFirst().first ?? "") ?? 640
} else if argv.count >= 4, argv[1] == "snap", let wid = UInt32(argv[2]), let pid = Int32(argv[3]) {
  target = .window(wid, pid)
  single = true
  edge = Double(argv.dropFirst(4).first ?? "") ?? 640
} else if argv.count >= 2, argv[1] == "display" {
  target = .display
  let rest = argv.dropFirst(2)
  fps = Int32(rest.first ?? "") ?? 10
  edge = Double(rest.dropFirst().first ?? "") ?? 640
} else {
  fail(2, "usage: computer-stream window <windowId> <pid> [fps] [edge] | snap <windowId> <pid> [edge] | display [fps] [edge]")
}

/// 按长边 edge 等比缩放（size 是点；小窗口最多放到 2 倍，即 Retina 原生像素），宽高取偶数
func fit(_ size: CGSize) -> (Int, Int) {
  let scale = min(2, edge / max(1, max(size.width, size.height)))
  let w = max(2, Int(size.width * scale) / 2 * 2)
  let h = max(2, Int(size.height * scale) / 2 * 2)
  return (w, h)
}

let ciContext = CIContext()
let output = FileHandle.standardOutput

/// 窗口四角：圆角半径（占图宽的万分之几，顺序 左上 右上 右下 左下）和边缘颜色。
/// 截到的窗口圆角外是透明的，JPEG 没有透明，编码器会把它填成白色，面板上就是四个白角（2026-11-04 用户截图）。
/// 半径每个窗口不一样（实测计算器约 27px、终端 17～20px，长边 640 时），所以每帧量：
/// 沿对角线从角往里走，碰到不透明的点停下，圆弧和对角线交在 (1-√2/2)·r 处，反推 r
struct Corners {
  var radii: [UInt16] = [0, 0, 0, 0]
  var fill: (CGFloat, CGFloat, CGFloat)?
}

func measureCorners(_ cg: CGImage) -> Corners? {
  let w = cg.width, h = cg.height
  guard w >= 8, h >= 8, let space = CGColorSpace(name: CGColorSpace.sRGB) else { return nil }
  var buf = [UInt8](repeating: 0, count: w * h * 4)
  let ok: Bool = buf.withUnsafeMutableBytes { raw in
    guard let ctx = CGContext(data: raw.baseAddress, width: w, height: h, bitsPerComponent: 8, bytesPerRow: w * 4,
                              space: space, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { return false }
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: w, height: h))
    return true
  }
  guard ok else { return nil }
  // 位图的第 0 行是图的最上面一行
  var corners = Corners()
  var sum = (0.0, 0.0, 0.0), n = 0.0
  let limit = min(w, h) / 3
  for (i, (ox, oy, dx, dy)) in [(0, 0, 1, 1), (w - 1, 0, -1, 1), (w - 1, h - 1, -1, -1), (0, h - 1, 1, -1)].enumerated() {
    var d = 0
    while d < limit {
      let p = ((oy + dy * d) * w + (ox + dx * d)) * 4
      if buf[p + 3] >= 250 {
        sum.0 += Double(buf[p]); sum.1 += Double(buf[p + 1]); sum.2 += Double(buf[p + 2]); n += 1
        break
      }
      d += 1
    }
    if d == 0 || d >= limit { continue }
    let r = Double(d) / (1 - 0.5.squareRoot())
    corners.radii[i] = UInt16(min(10_000, (r / Double(w) * 10_000).rounded()))
  }
  if corners.radii.contains(where: { $0 > 0 }) && n > 0 {
    corners.fill = (CGFloat(sum.0 / n / 255), CGFloat(sum.1 / n / 255), CGFloat(sum.2 / n / 255))
  }
  return corners
}

/// 编码一帧：透明的角先铺成窗口边缘的颜色（不是白色），再 JPEG；JPEG 后面接 12 字节「角」：
/// 4 个 UInt16 大端（半径，占宽的万分之几）+ "CPR1"。浏览器解 JPEG 读到结束标记就停，后面这几个字节不影响显示；
/// 插件 host 端把它拆下来，交给面板按真实圆角裁掉角
func jpeg(_ source: CGImage) -> Data? {
  var cg = source
  var radii: [UInt16] = [0, 0, 0, 0]
  let w = source.width, h = source.height
  if let corners = measureCorners(source), let fill = corners.fill,
     let space = CGColorSpace(name: CGColorSpace.sRGB),
     let ctx = CGContext(data: nil, width: w, height: h, bitsPerComponent: 8, bytesPerRow: 0,
                         space: space, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) {
    ctx.setFillColor(CGColor(srgbRed: fill.0, green: fill.1, blue: fill.2, alpha: 1))
    ctx.fill(CGRect(x: 0, y: 0, width: w, height: h))
    ctx.draw(source, in: CGRect(x: 0, y: 0, width: w, height: h))
    if let flat = ctx.makeImage() { cg = flat; radii = corners.radii }
  }
  let data = NSMutableData()
  guard let dest = CGImageDestinationCreateWithData(data, UTType.jpeg.identifier as CFString, 1, nil) else { return nil }
  CGImageDestinationAddImage(dest, cg, [kCGImageDestinationLossyCompressionQuality: 0.7] as CFDictionary)
  guard CGImageDestinationFinalize(dest) else { return nil }
  var out = data as Data
  for r in radii { out.append(UInt8(r >> 8)); out.append(UInt8(r & 0xff)) }
  out.append(contentsOf: Array("CPR1".utf8))
  return out
}

func writeFrame(_ frame: Data) {
  var length = UInt32(frame.count).bigEndian
  output.write(Data(bytes: &length, count: 4) + frame)
}

final class Sink: NSObject, SCStreamOutput, SCStreamDelegate {
  private let encoder = DispatchQueue(label: "computer-stream.encode")
  private var busy = false
  private var last = Data()

  func stream(_ stream: SCStream, didOutputSampleBuffer buffer: CMSampleBuffer, of type: SCStreamOutputType) {
    guard type == .screen else { return }
    if let attachments = CMSampleBufferGetSampleAttachmentsArray(buffer, createIfNecessary: false) as? [[SCStreamFrameInfo: Any]],
       let raw = attachments.first?[.status] as? Int, let status = SCFrameStatus(rawValue: raw), status != .complete {
      return
    }
    guard !busy, let pixels = buffer.imageBuffer else { return }
    busy = true
    let image = CIImage(cvPixelBuffer: pixels)
    encoder.async {
      defer { self.busy = false }
      guard let cg = ciContext.createCGImage(image, from: image.extent), let frame = jpeg(cg) else { return }
      if frame == self.last { return }
      self.last = frame
      writeFrame(frame)
    }
  }

  func stream(_ stream: SCStream, didStopWithError error: Error) {
    fail(5, "stream stopped: \(error.localizedDescription)")
  }
}

/// 收尾：保证系统里的流先停掉，进程再退出
final class Lifecycle {
  private let lock = NSLock()
  private var stream: SCStream?
  private var starting = false
  private var stopping = false

  /// 要开流了。已经在收尾就不开（返回 false），请求根本不发给系统
  func willStart(_ s: SCStream) -> Bool {
    lock.lock(); defer { lock.unlock() }
    if stopping { return false }
    stream = s
    starting = true
    return true
  }

  /// 开流返回了（成功或失败）。这期间要求过收尾：返回 true，调用方停流后退出
  func didStart() -> Bool {
    lock.lock(); defer { lock.unlock() }
    starting = false
    return stopping
  }

  /// SIGTERM、stdin 关闭都走这里
  func shutdown() {
    lock.lock()
    if stopping { lock.unlock(); return }
    stopping = true
    let running = stream
    let pending = starting
    lock.unlock()
    // 兜底：系统一直不回也不能永远不退（父进程 6 秒后会 SIGKILL）
    DispatchQueue.global().asyncAfter(deadline: .now() + 4) { exit(0) }
    // 开流中：等 didStart 看到 stopping 再停（这时退出，replayd 会在我们死后把流建起来，没人停）
    if pending { return }
    guard let running else { exit(0) }
    Task {
      try? await running.stopCapture()
      exit(0)
    }
  }
}

let lifecycle = Lifecycle()

// 父进程没了（stdin 关闭）就收尾退出，不留孤儿进程
FileHandle.standardInput.readabilityHandler = { handle in
  if handle.availableData.isEmpty {
    handle.readabilityHandler = nil
    lifecycle.shutdown()
  }
}
// SIGTERM 也先停流再退（默认处理是直接死，正好撞上开流就会留下没人管的流）
signal(SIGTERM, SIG_IGN)
let termSource = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
termSource.setEventHandler { lifecycle.shutdown() }
termSource.resume()

/// 找目标：窗口要 id 和 pid 都对上
func resolve(_ content: SCShareableContent) -> (SCContentFilter, CGSize)? {
  switch target {
  case let .window(wid, pid):
    guard let window = content.windows.first(where: { $0.windowID == wid && $0.owningApplication?.processID == pid }) else { return nil }
    return (SCContentFilter(desktopIndependentWindow: window), window.frame.size)
  case .display:
    let main = CGMainDisplayID()
    guard let display = content.displays.first(where: { $0.displayID == main }) ?? content.displays.first else { return nil }
    return (SCContentFilter(display: display, excludingWindows: []), CGSize(width: display.width, height: display.height))
  }
}

let sink = Sink()
Task {
  let content: SCShareableContent
  do {
    content = try await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false)
  } catch {
    fail(4, "no screen capture access: \(error.localizedDescription)")
  }
  guard let (filter, size) = resolve(content) else { fail(3, "window gone") }
  let config = SCStreamConfiguration()
  var current = fit(size)
  config.width = current.0
  config.height = current.1
  config.showsCursor = false

  // 只拍一张：单张截图 API，系统里不建流，进程什么时候退都不会留下没人管的流
  if single {
    let image: CGImage
    do {
      image = try await SCScreenshotManager.captureImage(contentFilter: filter, configuration: config)
    } catch {
      fail(4, "capture failed: \(error.localizedDescription)")
    }
    guard let frame = jpeg(image) else { fail(5, "encode failed") }
    writeFrame(frame)
    exit(0)
  }

  config.minimumFrameInterval = CMTime(value: 1, timescale: max(1, fps))
  config.queueDepth = 3
  config.pixelFormat = kCVPixelFormatType_32BGRA
  let stream = SCStream(filter: filter, configuration: config, delegate: sink)
  do {
    try stream.addStreamOutput(sink, type: .screen, sampleHandlerQueue: DispatchQueue(label: "computer-stream.capture"))
  } catch {
    fail(4, "start capture failed: \(error.localizedDescription)")
  }
  guard lifecycle.willStart(stream) else { exit(0) }
  var started = true
  do {
    try await stream.startCapture()
  } catch {
    started = false
    if !lifecycle.didStart() { fail(4, "start capture failed: \(error.localizedDescription)") }
    exit(0)
  }
  if started && lifecycle.didStart() {
    try? await stream.stopCapture()
    exit(0)
  }
  // 每秒看一次：窗口关了就停流退出；大小变了就跟着改输出尺寸（不然画面会被拉伸）
  while true {
    try? await Task.sleep(nanoseconds: 1_000_000_000)
    guard let latest = try? await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false) else { continue }
    guard let (_, size) = resolve(latest) else {
      try? await stream.stopCapture()
      fail(3, "window gone")
    }
    let next = fit(size)
    if next != current {
      current = next
      config.width = next.0
      config.height = next.1
      try? await stream.updateConfiguration(config)
    }
  }
}
dispatchMain()
