// 电脑操控画面取流（dsh-computer-plus 的 macOS 辅助程序，插件首次用到时在本机用 swiftc 编译）。
//
// 用法：
//   computer-stream window <windowId> <pid> [fps] [edge]   持续取流
//   computer-stream snap <windowId> <pid> [edge]           只拍一张（单张截图，不开流），写一帧后退出
//   computer-stream display [fps] [edge]
//   computer-stream icon <pid>        把这个进程所属应用的图标画成 64×64 PNG 写到 stdout，然后退出
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

// 应用图标：按 pid 找运行中的应用（不收外部传来的路径），取系统给的图标画成 64×64 PNG
if argv.count == 3, argv[1] == "icon", let pid = Int32(argv[2]) {
  guard let app = NSRunningApplication(processIdentifier: pid), let icon = app.icon else { fail(3, "app gone") }
  guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: 64, pixelsHigh: 64, bitsPerSample: 8, samplesPerPixel: 4,
                                   hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0) else { fail(5, "no bitmap") }
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  icon.draw(in: NSRect(x: 0, y: 0, width: 64, height: 64))
  NSGraphicsContext.restoreGraphicsState()
  guard let png = rep.representation(using: .png, properties: [:]) else { fail(5, "encode failed") }
  FileHandle.standardOutput.write(png)
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

func jpeg(_ cg: CGImage) -> Data? {
  let data = NSMutableData()
  guard let dest = CGImageDestinationCreateWithData(data, UTType.jpeg.identifier as CFString, 1, nil) else { return nil }
  CGImageDestinationAddImage(dest, cg, [kCGImageDestinationLossyCompressionQuality: 0.7] as CFDictionary)
  guard CGImageDestinationFinalize(dest) else { return nil }
  return data as Data
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
