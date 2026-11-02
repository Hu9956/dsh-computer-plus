// 电脑操控画面取流（dsh-harness-plus 的 macOS 辅助程序，插件首次用到时在本机用 swiftc 编译）。
//
// 用法：
//   computer-stream window <windowId> <pid> [fps] [edge]
//   computer-stream display [fps] [edge]
//   computer-stream icon <pid>        把这个进程所属应用的图标画成 64×64 PNG 写到 stdout，然后退出
//
// 用 ScreenCaptureKit 取一个窗口（或主显示器）的画面，长边缩到 edge（默认 640），最高 fps 帧/秒（默认 10）。
// 每帧编码成 JPEG（质量 0.7）写到 stdout：4 字节大端长度 + JPEG 数据。和上一帧字节完全相同就不写
// （实测静止的窗口系统也每帧都报「画面变了」，不能靠它判断）。编码还没完时来的帧直接丢，不排队。
//
// 退出码：0 stdin 关闭（父进程没了）；3 窗口不存在或已关闭；4 取不到画面（多半是没有屏幕录制权限）；5 取流中途出错；2 参数错。
// 窗口身份用 windowId + pid 双重校验：窗口关掉后 id 可能被别的应用复用，只认 id 会截到不该看的窗口。

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
var rest: ArraySlice<String>
if argv.count >= 4, argv[1] == "window", let wid = UInt32(argv[2]), let pid = Int32(argv[3]) {
  target = .window(wid, pid)
  rest = argv.dropFirst(4)
} else if argv.count >= 2, argv[1] == "display" {
  target = .display
  rest = argv.dropFirst(2)
} else {
  fail(2, "usage: computer-stream window <windowId> <pid> [fps] [edge] | display [fps] [edge]")
}
let fps = Int32(rest.first ?? "") ?? 10
let edge = Double(rest.dropFirst().first ?? "") ?? 640

/// 按长边 edge 等比缩放（size 是点；小窗口最多放到 2 倍，即 Retina 原生像素），宽高取偶数
func fit(_ size: CGSize) -> (Int, Int) {
  let scale = min(2, edge / max(1, max(size.width, size.height)))
  let w = max(2, Int(size.width * scale) / 2 * 2)
  let h = max(2, Int(size.height * scale) / 2 * 2)
  return (w, h)
}

final class Sink: NSObject, SCStreamOutput, SCStreamDelegate {
  private let context = CIContext()
  private let encoder = DispatchQueue(label: "computer-stream.encode")
  private let out = FileHandle.standardOutput
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
      guard let cg = self.context.createCGImage(image, from: image.extent) else { return }
      let data = NSMutableData()
      guard let dest = CGImageDestinationCreateWithData(data, UTType.jpeg.identifier as CFString, 1, nil) else { return }
      CGImageDestinationAddImage(dest, cg, [kCGImageDestinationLossyCompressionQuality: 0.7] as CFDictionary)
      guard CGImageDestinationFinalize(dest) else { return }
      let jpeg = data as Data
      if jpeg == self.last { return }
      self.last = jpeg
      var length = UInt32(jpeg.count).bigEndian
      self.out.write(Data(bytes: &length, count: 4) + jpeg)
    }
  }

  func stream(_ stream: SCStream, didStopWithError error: Error) {
    fail(5, "stream stopped: \(error.localizedDescription)")
  }
}

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

// 父进程没了（stdin 关闭）就退出，不留孤儿进程
FileHandle.standardInput.readabilityHandler = { handle in
  if handle.availableData.isEmpty { exit(0) }
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
  config.minimumFrameInterval = CMTime(value: 1, timescale: max(1, fps))
  config.showsCursor = false
  config.queueDepth = 3
  config.pixelFormat = kCVPixelFormatType_32BGRA
  let stream = SCStream(filter: filter, configuration: config, delegate: sink)
  do {
    try stream.addStreamOutput(sink, type: .screen, sampleHandlerQueue: DispatchQueue(label: "computer-stream.capture"))
    try await stream.startCapture()
  } catch {
    fail(4, "start capture failed: \(error.localizedDescription)")
  }
  // 每秒看一次：窗口关了就退出；大小变了就跟着改输出尺寸（不然画面会被拉伸）
  while true {
    try? await Task.sleep(nanoseconds: 1_000_000_000)
    guard let latest = try? await SCShareableContent.excludingDesktopWindows(false, onScreenWindowsOnly: false) else { continue }
    guard let (_, size) = resolve(latest) else { fail(3, "window gone") }
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
