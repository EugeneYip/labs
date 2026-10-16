import { useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type PointerEvent, type Ref } from 'react'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import { radiusFor, numberSize } from './exportPdf.ts'
import { drawPage, drawScale } from './pdf.ts'
import type { BalloonSize, Zones } from './model.ts'

export interface ShownBalloon {
  id: string
  number: number
  x: number
  y: number
  failed: boolean
}

export interface ViewerHandle {
  focus: () => void
}

interface Props {
  doc: PDFDocumentProxy
  sheet: number
  zoom: number
  balloons: ShownBalloon[]
  selected: string | null
  size: BalloonSize
  zones: Zones | null
  /** Waiting for the zone frame's corners: the next two clicks set it instead of placing balloons. */
  framing: boolean
  /** Moving the selected balloon: the next click or tap puts it there (on a phone, where dragging scrolls). */
  moving: boolean
  label: string
  onPlace: (x: number, y: number, page: PDFPageProxy) => void
  onSelect: (id: string | null) => void
  onMove: (id: string, x: number, y: number) => void
  onFrameCorner: (fx: number, fy: number) => void
  onKey: (event: KeyboardEvent<HTMLDivElement>) => boolean
  onRendered: (page: PDFPageProxy) => void
  onError: (message: string) => void
  ref?: Ref<ViewerHandle>
}

/** A tap or click that moves less than this (in CSS pixels) places a balloon; more is a drag. */
const SLOP = 6

export function Viewer({ doc, sheet, zoom, balloons, selected, size, zones, framing, moving, label, onPlace, onSelect, onMove, onFrameCorner, onKey, onRendered, onError, ref }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [page, setPage] = useState<PDFPageProxy | null>(null)
  const [cross, setCross] = useState<{ x: number; y: number } | null>(null)
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null)
  // Where a press started: on the screen (to tell a tap from a drag, and to pan) and on the sheet.
  const press = useRef<{ cx: number; cy: number; sx: number; sy: number; id: string | null; moved: boolean; pointer: number } | null>(null)
  const latest = useRef({ onPlace, onSelect, onMove, onFrameCorner, onRendered, onError })
  useEffect(() => {
    latest.current = { onPlace, onSelect, onMove, onFrameCorner, onRendered, onError }
  })

  useImperativeHandle(ref, () => ({ focus: () => scroller.current?.focus() }), [])

  // The page for this sheet; a late answer for a sheet no longer shown is ignored.
  useEffect(() => {
    let live = true
    doc.getPage(sheet).then(
      (p) => {
        if (live) setPage(p)
      },
      (e) => {
        if (live) latest.current.onError(`Sheet ${sheet} couldn’t be read: ${e instanceof Error ? e.message : String(e)}`)
      },
    )
    return () => {
      live = false
    }
  }, [doc, sheet])

  const base = page?.getViewport({ scale: 1 }) ?? null
  const view: PageViewport | null = page ? page.getViewport({ scale: zoom }) : null
  const width = view ? view.width : 0
  const height = view ? view.height : 0

  // Drawn at the zoom times the screen's pixel ratio, within the pixel limits; a newer draw cancels an older one.
  useEffect(() => {
    if (!page || !canvas.current || !base) return
    const scale = drawScale(base.width, base.height, zoom, window.devicePixelRatio || 1)
    const task = drawPage(page, canvas.current, scale)
    let live = true
    task.promise.then(
      () => {
        if (live) latest.current.onRendered(page)
      },
      (e: unknown) => {
        if (live && !(e instanceof Error && e.name === 'RenderingCancelledException')) latest.current.onError(`Sheet ${sheet} couldn’t be drawn: ${e instanceof Error ? e.message : String(e)}`)
      },
    )
    return () => {
      live = false
      task.cancel()
    }
  }, [page, zoom, base?.width, base?.height, sheet])

  const toShown = (x: number, y: number) => {
    const [vx, vy] = view!.convertToViewportPoint(x, y)
    return { x: vx, y: vy }
  }
  const toPdf = (vx: number, vy: number) => {
    const [x, y] = view!.convertToPdfPoint(vx, vy)
    return { x, y }
  }
  const local = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    return { x: Math.max(0, Math.min(width, e.clientX - box.left)), y: Math.max(0, Math.min(height, e.clientY - box.top)) }
  }

  const r = base ? Math.max(9, radiusFor(base.width, base.height, size) * zoom) : 10

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (!view || e.button > 0) return
    const target = (e.target as Element).closest('[data-balloon]')
    const id = framing || moving ? null : target?.getAttribute('data-balloon') ?? null
    press.current = { cx: e.clientX, cy: e.clientY, sx: scroller.current!.scrollLeft, sy: scroller.current!.scrollTop, id, moved: false, pointer: e.pointerId }
    if (id) latest.current.onSelect(id)
    // A mouse keeps the pointer while it drags a balloon or pans the sheet; touch leaves panning to the browser.
    if (e.pointerType === 'mouse') e.currentTarget.setPointerCapture(e.pointerId)
  }
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const p0 = press.current
    if (!p0 || p0.pointer !== e.pointerId || !view) return
    if (!p0.moved && Math.hypot(e.clientX - p0.cx, e.clientY - p0.cy) > SLOP) p0.moved = true
    if (!p0.moved) return
    if (p0.id) setDrag({ id: p0.id, ...local(e) })
    else if (e.pointerType === 'mouse') {
      scroller.current!.scrollLeft = p0.sx - (e.clientX - p0.cx)
      scroller.current!.scrollTop = p0.sy - (e.clientY - p0.cy)
    }
  }
  const up = (e: PointerEvent<SVGSVGElement>) => {
    const p0 = press.current
    press.current = null
    if (!p0 || p0.pointer !== e.pointerId || !view) return
    const p = local(e)
    if (p0.id) {
      if (p0.moved) {
        const q = toPdf(p.x, p.y)
        latest.current.onMove(p0.id, q.x, q.y)
      }
      setDrag(null)
      return
    }
    if (p0.moved) return
    if (framing) latest.current.onFrameCorner(p.x / width, p.y / height)
    else if (moving && selected) {
      const q = toPdf(p.x, p.y)
      latest.current.onMove(selected, q.x, q.y)
    } else {
      const q = toPdf(p.x, p.y)
      if (page) latest.current.onPlace(q.x, q.y, page)
    }
  }
  const cancel = () => {
    press.current = null
    setDrag(null)
  }

  // The keyboard's crosshair: arrow keys move it, Enter places a balloon there (the page handles the rest).
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!view) return
    const step = e.shiftKey ? 50 : e.altKey ? 2 : 10
    const at = cross ?? centre()
    let next: { x: number; y: number } | null = null
    if (e.key === 'ArrowLeft') next = { x: at.x - step, y: at.y }
    else if (e.key === 'ArrowRight') next = { x: at.x + step, y: at.y }
    else if (e.key === 'ArrowUp') next = { x: at.x, y: at.y - step }
    else if (e.key === 'ArrowDown') next = { x: at.x, y: at.y + step }
    if (next) {
      e.preventDefault()
      const c = { x: Math.max(0, Math.min(width, next.x)), y: Math.max(0, Math.min(height, next.y)) }
      setCross(c)
      keepInView(c)
      return
    }
    if ((e.key === 'Enter' || e.key === ' ') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      const q = toPdf(at.x, at.y)
      if (!cross) setCross(at)
      if (framing) onFrameCorner(at.x / width, at.y / height)
      else if ((e.shiftKey || moving) && selected) onMove(selected, q.x, q.y)
      else if (page) onPlace(q.x, q.y, page)
      return
    }
    if (onKey(e)) e.preventDefault()
  }
  const centre = () => {
    const s = scroller.current!
    return { x: Math.max(0, Math.min(width, s.scrollLeft + s.clientWidth / 2)), y: Math.max(0, Math.min(height, s.scrollTop + s.clientHeight / 2)) }
  }
  const keepInView = (c: { x: number; y: number }) => {
    const s = scroller.current!
    const m = 40
    if (c.x < s.scrollLeft + m) s.scrollLeft = c.x - m
    else if (c.x > s.scrollLeft + s.clientWidth - m) s.scrollLeft = c.x - s.clientWidth + m
    if (c.y < s.scrollTop + m) s.scrollTop = c.y - m
    else if (c.y > s.scrollTop + s.clientHeight - m) s.scrollTop = c.y - s.clientHeight + m
  }

  // A new sheet or zoom starts the crosshair afresh where the user is looking.
  useEffect(() => {
    setCross(null)
  }, [sheet, zoom])

  const zonesRect = zones && view ? { x: zones.left * width, y: zones.top * height, w: (zones.right - zones.left) * width, h: (zones.bottom - zones.top) * height } : null

  return (
    <div
      ref={scroller}
      role="application"
      aria-roledescription="drawing"
      aria-label={label}
      tabIndex={0}
      onKeyDown={key}
      onFocus={(e) => {
        // The crosshair is for the keyboard: a click focuses the drawing too, without one appearing.
        if (!cross && view && e.currentTarget.matches(':focus-visible')) setCross(centre())
      }}
      className="relative h-full min-h-0 overflow-auto bg-ink/5 focus-visible:outline-offset-[-2px]"
      style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
    >
      <div className="relative m-3 inline-block shadow-sm" style={{ width, height }}>
        <canvas ref={canvas} className="absolute inset-0 block bg-white" style={{ width, height }} aria-hidden="true" />
        {view && (
          <svg
            className="absolute inset-0 block select-none"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={cancel}
            onLostPointerCapture={cancel}
            aria-hidden="true"
            style={{ cursor: framing || moving ? 'crosshair' : 'copy' }}
          >
            {zonesRect && <rect x={zonesRect.x} y={zonesRect.y} width={zonesRect.w} height={zonesRect.h} fill="none" stroke="#2563eb" strokeWidth={1} strokeDasharray="6 4" opacity={0.7} />}
            {balloons.map((b) => {
              const at = drag?.id === b.id ? { x: drag.x, y: drag.y } : toShown(b.x, b.y)
              const isSelected = b.id === selected
              const fs = Math.max(8, numberSize(r, b.number))
              return (
                <g key={b.id} data-balloon={b.id} style={{ cursor: 'grab' }}>
                  {isSelected && <circle cx={at.x} cy={at.y} r={r + 5} fill="none" stroke="#2563eb" strokeWidth={3} />}
                  <circle cx={at.x} cy={at.y} r={r} fill={b.failed ? '#c71212' : '#fff'} stroke="#c71212" strokeWidth={Math.max(1.5, r * 0.12)} />
                  <text x={at.x} y={at.y} textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight={700} fontFamily="Helvetica, Arial, sans-serif" fill={b.failed ? '#fff' : '#c71212'}>
                    {b.number}
                  </text>
                </g>
              )
            })}
            {cross && (
              <g pointerEvents="none" className="crosshair">
                <line x1={cross.x - 14} y1={cross.y} x2={cross.x + 14} y2={cross.y} stroke="#2563eb" strokeWidth={2} />
                <line x1={cross.x} y1={cross.y - 14} x2={cross.x} y2={cross.y + 14} stroke="#2563eb" strokeWidth={2} />
              </g>
            )}
          </svg>
        )}
      </div>
    </div>
  )
}
