import { useRef, type PointerEvent } from 'react'

const DEFAULT_WIDTH = 384
const MIN = 240
const MAX = 720

export function ResizeHandle({
  value,
  onChange,
  invert = false,
  label,
}: {
  value: number
  onChange: (width: number) => void
  invert?: boolean
  label: string
}) {
  const drag = useRef({ x: 0, w: 0 })

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    e.preventDefault()
    drag.current = { x: e.clientX, w: value }
    e.currentTarget.setPointerCapture(e.pointerId)
    document.body.classList.add('is-resizing')
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    const dx = e.clientX - drag.current.x
    const next = drag.current.w + (invert ? -dx : dx)
    onChange(Math.round(Math.min(MAX, Math.max(MIN, next))))
  }

  function endDrag(e: PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    document.body.classList.remove('is-resizing')
  }

  return (
    <div
      className="resize-handle"
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={() => onChange(DEFAULT_WIDTH)}
    />
  )
}

export { DEFAULT_WIDTH as PANEL_DEFAULT_WIDTH }
