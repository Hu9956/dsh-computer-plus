import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckIcon, CloseIcon, IconButton, isImeComposing } from '@kewen/dsh-ui'
import {
  appName,
  contentRect,
  cornerClip,
  screenNote,
  showDoneBadge,
  useBoxSize,
  useComputerFrame,
  useComputerStatus,
  useCursorOverlay,
  type ComputerStatus,
  type ComputerTarget,
  type Corners,
} from './computer'

/**
 * 「电脑操控」组里的画面：实时画面 + 虚拟光标 + 点击涟漪。
 * 光标在页面里画（不画进截图）：位置按图片在框里 contain 后的实际区域摆，竖窗口两边留白时也对得上。
 * 点画面放大查看：在 DSH 窗口里铺开（不是可拖动的浮窗），Esc 或点空白处关闭；放大时同一条流换成 1600 长边。
 */
export function ComputerScreen({ sessionId, target, enabled }: {
  sessionId: string
  target: ComputerTarget | undefined
  enabled: boolean
}) {
  const [zoomed, setZoomed] = useState(false)
  const showCursor = useCursorOverlay()
  const status = useComputerStatus(sessionId, target, enabled)
  const frame = useComputerFrame(sessionId, target, enabled, zoomed)
  const showing = frame.url !== undefined && frame.error === undefined

  // 画面没了（换窗口、出错、面板收起）就收起放大
  useEffect(() => { if (!showing) setZoomed(false) }, [showing])

  if (!showing) return <div className="cp-screen">{screenNote(target, frame, status.preparing)}</div>
  const label = `${appName(target)} 的画面`
  const active = target?.active === true
  const done = showDoneBadge(target)
  // 窗口圆角：进行中跟着 /status 走，结束后用冻结帧自己带的（没有就沿用最后一次 /status 的）
  const corners = active ? status.corners : frame.corners ?? status.corners
  return (
    <>
      <Frame
        className="cp-screen"
        url={frame.url!}
        label={label}
        active={active}
        done={done}
        showCursor={showCursor}
        status={status}
        corners={corners}
        onError={frame.onError}
        onOpen={() => setZoomed(true)}
      />
      {zoomed && createPortal(
        <ZoomView label={label} onClose={() => setZoomed(false)}>
          <Frame
            className="cp-zoom-frame"
            url={frame.url!}
            label={label}
            active={active}
            done={done}
            showCursor={showCursor}
            status={status}
            corners={corners}
            onError={frame.onError}
          />
        </ZoomView>,
        document.body,
      )}
    </>
  )
}

/** 一块画面：图片 + 按实际区域摆的光标。onOpen 有值时整块可点（面板里那块），放大里那块不可点 */
function Frame({ className, url, label, active, done, showCursor, status, corners, onError, onOpen }: {
  className: string
  url: string
  label: string
  active: boolean
  done: boolean
  showCursor: boolean
  status: ComputerStatus
  corners: Corners | undefined
  onError: () => void
  onOpen?: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const [natural, setNatural] = useState<{ w: number, h: number } | undefined>(undefined)
  const size = useBoxSize(box)
  // 卸载时先清掉 src：只把 <img> 从页面上拿掉，Chrome 要等垃圾回收才断开 MJPEG 连接，这期间 host 一直当有人在看
  useLayoutEffect(() => {
    const node = img.current
    return () => { node?.removeAttribute('src') }
  }, [])
  const area = contentRect(size, natural)
  // 按窗口真实的圆角裁掉四角（裁的是图片实际所在的区域，竖窗口两边的留白不受影响）
  const clip = cornerClip(size, area, corners)
  const open = onOpen === undefined
    ? {}
    : {
        'data-zoomable': '',
        role: 'button',
        tabIndex: 0,
        'aria-label': `放大查看${label}`,
        title: '点击放大查看',
        onClick: onOpen,
        onKeyDown: (event: ReactKeyboardEvent) => {
          if (isImeComposing(event)) return
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          onOpen()
        },
      }
  const media = (
    <>
      <img
        ref={img}
        src={url}
        alt={label}
        draggable={false}
        style={clip === undefined ? undefined : { clipPath: clip }}
        onLoad={(event) => {
          const node = event.currentTarget
          setNatural(current => current?.w === node.naturalWidth && current.h === node.naturalHeight ? current : { w: node.naturalWidth, h: node.naturalHeight })
        }}
        onError={onError}
      />
      {/* 完成徽标贴外框右下角：竖窗口（计算器）两边有留白，徽标落在留白里，不盖住应用的按钮 */}
      {done && (
        <span className="cp-done" role="img" aria-label="已完成">
          <CheckIcon size={13} inline={false} />
        </span>
      )}
      {showCursor && area !== undefined && status.point !== null && active && (
        <span
          className="cp-cursor"
          aria-hidden="true"
          style={{ transform: `translate(${area.left + status.point.x * area.width}px, ${area.top + status.point.y * area.height}px)` }}
        >
          {/* 涟漪：key 换了就重新挂载，动画重放一遍 */}
          {status.ripple > 0 && <span key={status.ripple} className="cp-ripple" />}
          <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M2.5 1.5v11.2l3-2.9 2 4.6 2.1-.9-2-4.5h4.2z" />
          </svg>
        </span>
      )}
    </>
  )
  return (
    <div ref={box} className={className} data-has-frame="" data-frozen={active ? undefined : ''} {...open}>
      {onOpen !== undefined ? <div className="cp-screen-clip">{media}</div> : media}
    </div>
  )
}

/**
 * 放大层：铺满 DSH 窗口、背景压暗，画面居中按比例放到最大。
 * Esc 在捕获阶段先拦下（并 preventDefault），对话信息面板「按 Esc 收起」看到 defaultPrevented 就不动，只关放大。
 * 挂在 body 下：面板「点外面关」只认主界面里的点击，点放大层不会把面板一起关掉。
 */
function ZoomView({ label, onClose, children }: { label: string, onClose: () => void, children: ReactNode }) {
  const close = useRef<HTMLButtonElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    close.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || isImeComposing(event)) return
      event.preventDefault()
      event.stopPropagation()
      closeRef.current()
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      previous?.focus?.()
    }
  }, [])
  return (
    <div
      className="cp-zoom"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(event) => { if (event.target === event.currentTarget) onClose() }}
    >
      {children}
      <IconButton ref={close} size="md" className="cp-zoom-close" aria-label="关闭放大" onClick={onClose}>
        <CloseIcon size={16} inline={false} />
      </IconButton>
    </div>
  )
}
