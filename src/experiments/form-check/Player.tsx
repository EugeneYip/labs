import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { angleAt, distance, frameRate, labelSpot, lean, stepTime, timeLabel, type Drawing, type Point } from './model.ts'

export type Tool = 'move' | 'line' | 'angle'
export type Command = { kind: 'toggle' } | { kind: 'pause' } | { kind: 'step'; n: number } | { kind: 'rate'; rate: number }

export const RATES = [1, 0.5, 0.25, 0.125] as const
const FALLBACK_FPS = 30
const COLOR = '#facc15'

const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

let nextId = 1

/**
 * One video: playback with frame steps and slow motion, and drawings in the
 * video's own pixels so they stay put at any size. Commands come through
 * `send`, which reaches this player alone or both players when linked.
 */
export function Player({ file, tool, send, listen, active, onActivate, onRemove, maxHeight }: { file: File; tool: Tool; send: (c: Command) => void; listen: (handler: (c: Command) => void) => () => void; active: boolean; onActivate: () => void; onRemove: () => void; maxHeight: number }) {
  const video = useRef<HTMLVideoElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const [url, setUrl] = useState('')
  const [meta, setMeta] = useState<{ w: number; h: number; duration: number } | null>(null)
  const [error, setError] = useState('')
  const [time, setTime] = useState(0)
  const timeRef = useRef(0)
  // Where frame steps have taken us: steps add up even before the video catches up, and a long frame
  // (common in phone videos, whose frame rate varies) can't swallow a step. Playing or scrubbing resets it.
  const position = useRef<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState<number>(1)
  const [fps, setFps] = useState<number | null>(null)
  const gaps = useRef<number[]>([])
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [pending, setPendingState] = useState<Point[]>([])
  // Kept in a ref too, so quick taps each see the points before them.
  const pendingRef = useRef<Point[]>([])
  const setPending = (points: Point[]) => {
    pendingRef.current = points
    setPendingState(points)
  }
  const [hover, setHover] = useState<Point | null>(null)
  const [drag, setDrag] = useState<{ id: number; key: 'a' | 'b' | 'c' } | null>(null)
  const [width, setWidth] = useState(0)
  const [saving, setSaving] = useState(false)
  // Safari on iPhones and iPads loads only a picked video's details, not its picture, until it plays: the frame
  // stays black and steps do nothing. A muted play that stops on the first frame loads it. Where even that's
  // blocked, as in Low Power Mode, a tap does it.
  const nudge = useRef(0)
  const [needsTap, setNeedsTap] = useState(false)
  const showFirstFrame = (v: HTMLVideoElement) =>
    v.play().then(() => {
      v.pause()
      if (Number.isFinite(v.duration)) v.currentTime = 0
    })

  useEffect(() => {
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => {
      URL.revokeObjectURL(u)
      clearTimeout(nudge.current)
    }
  }, [file])

  // The frame on screen and, while playing at normal speed, the gaps between frames, to learn the frame rate.
  useEffect(() => {
    const v = video.current
    if (!v || !url) return
    if (typeof v.requestVideoFrameCallback !== 'function') {
      const update = () => {
        timeRef.current = v.currentTime
        setTime(v.currentTime)
      }
      v.addEventListener('timeupdate', update)
      v.addEventListener('seeked', update)
      return () => {
        v.removeEventListener('timeupdate', update)
        v.removeEventListener('seeked', update)
      }
    }
    let last: VideoFrameCallbackMetadata | null = null
    let id = 0
    const tick: VideoFrameRequestCallback = (_, m) => {
      timeRef.current = m.mediaTime
      setTime(m.mediaTime)
      if (last && !v.paused && v.playbackRate === 1 && m.presentedFrames === last.presentedFrames + 1) {
        gaps.current.push(m.mediaTime - last.mediaTime)
        if (gaps.current.length > 120) gaps.current.shift()
        const detected = frameRate(gaps.current)
        if (detected) setFps((f) => (f === detected ? f : detected))
      }
      last = m
      id = v.requestVideoFrameCallback(tick)
    }
    id = v.requestVideoFrameCallback(tick)
    return () => v.cancelVideoFrameCallback(id)
  }, [url])

  // The display size: as wide as there's room for, and no taller than `maxHeight`.
  useEffect(() => {
    const el = frame.current?.parentElement
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const display = meta ? (() => {
    const w = Math.min(width, (maxHeight * meta.w) / meta.h)
    return { w, h: (w * meta.h) / meta.w }
  })() : null
  const scale = meta && display ? meta.w / Math.max(1, display.w) : 1

  const run = useCallback(
    (c: Command) => {
      const v = video.current
      if (!v || !meta) return
      if (c.kind === 'toggle') {
        if (v.paused) void v.play().catch(() => {})
        else v.pause()
      } else if (c.kind === 'pause') v.pause()
      else if (c.kind === 'rate') {
        v.playbackRate = c.rate
        setRate(c.rate)
      } else {
        v.pause()
        const next = stepTime(position.current ?? timeRef.current, c.n, fps ?? FALLBACK_FPS, meta.duration)
        position.current = next
        v.currentTime = next
      }
    },
    [meta, fps],
  )
  useEffect(() => listen(run), [listen, run])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, button, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === ' ') send({ kind: 'toggle' })
      else if (e.key === 'ArrowRight' || e.key === '.') send({ kind: 'step', n: e.shiftKey ? 10 : 1 })
      else if (e.key === 'ArrowLeft' || e.key === ',') send({ kind: 'step', n: e.shiftKey ? -10 : -1 })
      else if (e.key === 'Escape') setPending([])
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, send])

  // A new tool starts a fresh drawing.
  useEffect(() => {
    pendingRef.current = []
    setPendingState([])
  }, [tool])

  const toVideo = (e: { clientX: number; clientY: number }): Point | null => {
    const svg = frame.current?.querySelector('svg')
    if (!svg || !meta) return null
    const r = svg.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * meta.w, y: ((e.clientY - r.top) / r.height) * meta.h }
  }
  const grab = 22 * scale

  const onDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    onActivate()
    const p = toVideo(e)
    if (!p) return
    // Handles can be dragged with any tool when no drawing is half made.
    if (!pendingRef.current.length) {
      for (const d of [...drawings].reverse()) {
        const points: [('a' | 'b' | 'c'), Point][] = d.kind === 'angle' ? [['a', d.a], ['b', d.b], ['c', d.c]] : [['a', d.a], ['b', d.b]]
        const key = points.find(([, q]) => distance(q, p) < grab)?.[0]
        if (key) {
          setDrag({ id: d.id, key })
          ;(e.target as Element).setPointerCapture?.(e.pointerId)
          return
        }
      }
    }
    if (tool === 'move') return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    addPoint(p)
  }
  const onMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const p = toVideo(e)
    if (!p) return
    if (drag) {
      setDrawings((ds) => ds.map((d) => (d.id === drag.id ? { ...d, [drag.key]: clamp(p) } : d)))
      return
    }
    setHover(pendingRef.current.length ? p : null)
  }
  const onUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (drag) return setDrag(null)
    const p = toVideo(e)
    // A line can also be dragged out in one stroke.
    const points = pendingRef.current
    if (p && tool === 'line' && points.length === 1 && distance(points[0], p) > 12 * scale) addPoint(p)
  }

  const clamp = (p: Point): Point => (meta ? { x: Math.min(meta.w, Math.max(0, p.x)), y: Math.min(meta.h, Math.max(0, p.y)) } : p)
  const addPoint = (raw: Point) => {
    const p = clamp(raw)
    const points = [...pendingRef.current, p]
    if (tool === 'line' && points.length === 2) {
      setDrawings((ds) => [...ds, { id: nextId++, kind: 'line', a: points[0], b: points[1] }])
      setPending([])
    } else if (tool === 'angle' && points.length === 3) {
      setDrawings((ds) => [...ds, { id: nextId++, kind: 'angle', a: points[0], b: points[1], c: points[2] }])
      setPending([])
    } else setPending(points)
  }

  const snapshot = async () => {
    const v = video.current
    if (!v || !meta) return
    setSaving(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = meta.w
      canvas.height = meta.h
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(v, 0, 0, meta.w, meta.h)
      paint(ctx, drawings, scale)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return
      const name = `${file.name.replace(/\.[^.]+$/, '') || 'video'}-${time.toFixed(2)}s.png`
      const shared = new File([blob], name, { type: 'image/png' })
      if (navigator.canShare?.({ files: [shared] }) && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ files: [shared] }).catch(() => {})
      } else {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = name
        a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 1000)
      }
    } finally {
      setSaving(false)
    }
  }

  const steps = fps ?? FALLBACK_FPS
  const preview = pending.length && hover ? [...pending, hover] : pending

  return (
    <div className="min-w-0" onFocusCapture={onActivate}>
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-medium" title={file.name} dir="auto">
          {file.name}
        </p>
        <button type="button" onClick={onRemove} className={`${quiet} -mr-2 h-9 sm:h-8`}>
          Close
        </button>
      </div>
      <div ref={frame} className={`relative mt-2 overflow-hidden rounded-lg bg-black ${active ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''}`} style={display ? { width: display.w, height: display.h } : { aspectRatio: '16 / 9', width: '100%' }}>
        <video
          ref={video}
          src={url || undefined}
          muted
          playsInline
          loop
          preload="auto"
          className="absolute inset-0 h-full w-full"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            clearTimeout(nudge.current)
            nudge.current = window.setTimeout(() => {
              if (v.readyState >= v.HAVE_CURRENT_DATA) return
              showFirstFrame(v).catch((err: unknown) => {
                if (err instanceof DOMException && err.name === 'NotAllowedError') setNeedsTap(true)
              })
            }, 500)
            const ready = () => setMeta({ w: v.videoWidth || 640, h: v.videoHeight || 360, duration: v.duration })
            if (Number.isFinite(v.duration)) return ready()
            // Recordings from some apps (and browsers' own recorders) don't state their length; seeking to the end finds it.
            const found = () => {
              if (!Number.isFinite(v.duration)) return
              v.removeEventListener('durationchange', found)
              v.currentTime = 0
              ready()
            }
            v.addEventListener('durationchange', found)
            v.currentTime = 1e9
          }}
          onPlay={() => {
            position.current = null
            setPlaying(true)
          }}
          onPause={() => setPlaying(false)}
          onLoadedData={() => setNeedsTap(false)}
          onError={() => setError('This browser can’t play this video. Try Safari or Chrome, or save the video as an MP4 (H.264) first.')}
        />
        {meta && (
          <svg
            viewBox={`0 0 ${meta.w} ${meta.h}`}
            className={`absolute inset-0 h-full w-full touch-none select-none ${tool === 'move' ? 'cursor-default' : 'cursor-crosshair'}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={() => setHover(null)}
            role="img"
            aria-label={drawings.length ? `${drawings.length} drawing${drawings.length === 1 ? '' : 's'} on the video` : 'Video frame'}
          >
            {drawings.map((d) => (
              <Shape key={d.id} d={d} scale={scale} />
            ))}
            {preview.length > 0 && <Partial points={preview} tool={tool} scale={scale} />}
          </svg>
        )}
        {needsTap && !error && (
          <button
            type="button"
            onClick={() => {
              setNeedsTap(false)
              if (video.current) showFirstFrame(video.current).catch(() => {})
            }}
            className="absolute inset-0 flex cursor-pointer items-center justify-center p-6 text-sm text-white"
          >
            <span className="rounded-full bg-black/70 px-4 py-2 font-medium ring-1 ring-white/40">Tap to show the video</span>
          </button>
        )}
        {error && <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white">{error}</p>}
      </div>

      <div className="mt-3 grid gap-3" aria-label="Playback">
        <input
          type="range"
          min={0}
          max={meta?.duration || 0}
          step={0.001}
          value={time}
          disabled={!meta}
          onChange={(e) => {
            const v = video.current
            if (!v) return
            v.pause()
            position.current = null
            v.currentTime = Number(e.target.value)
          }}
          aria-label="Position in the video"
          aria-valuetext={timeLabel(time, steps)}
          className="w-full cursor-pointer accent-current"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => send({ kind: 'step', n: -1 })} disabled={!meta} className={outline} aria-label="Back one frame" title="Back one frame (←)">
            ← Frame
          </button>
          <button type="button" onClick={() => send({ kind: 'toggle' })} disabled={!meta} className={`${button} min-w-20 bg-ink font-medium text-paper hover:bg-ink/80`} title="Play or pause (Space)">
            {playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" onClick={() => send({ kind: 'step', n: 1 })} disabled={!meta} className={outline} aria-label="Forward one frame" title="Forward one frame (→)">
            Frame →
          </button>
          <div className="flex rounded-lg border border-rule p-0.5" role="group" aria-label="Speed">
            {RATES.map((r) => (
              <button key={r} type="button" aria-pressed={rate === r} onClick={() => send({ kind: 'rate', rate: r })} className={`inline-flex h-9 min-w-10 cursor-pointer items-center justify-center rounded-md px-2 text-sm tabular-nums sm:h-8 ${rate === r ? 'bg-ink text-paper' : 'hover:bg-ink/5'}`}>
                {r === 1 ? '1×' : r === 0.5 ? '½×' : r === 0.25 ? '¼×' : '⅛×'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="text-dim tabular-nums">
            {timeLabel(time, steps)}
            {meta && ` of ${meta.duration.toFixed(2)} s`}
            <span className="hidden sm:inline"> · {fps ? `${fps} fps` : `${FALLBACK_FPS} fps assumed until it plays`}</span>
          </p>
          <div className="flex gap-1">
            <button type="button" onClick={() => setDrawings((ds) => ds.slice(0, -1))} disabled={!drawings.length} className={`${quiet} h-9 sm:h-8`}>
              Undo
            </button>
            <button type="button" onClick={() => setDrawings([])} disabled={!drawings.length} className={`${quiet} h-9 sm:h-8`}>
              Clear
            </button>
            <button type="button" onClick={() => void snapshot()} disabled={!meta || saving} className={`${outline} h-9 sm:h-8`}>
              Save frame
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** A label with a dark outline, readable over any video. */
function Label({ at, text, scale }: { at: Point; text: string; scale: number }) {
  return (
    <text x={at.x} y={at.y} fontSize={15 * scale} fontWeight={600} fill={COLOR} stroke="#000" strokeWidth={3.5 * scale} paintOrder="stroke" strokeLinejoin="round" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {text}
    </text>
  )
}

function Segment({ a, b, scale }: { a: Point; b: Point; scale: number }) {
  return (
    <>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#000" strokeOpacity={0.55} strokeWidth={5 * scale} strokeLinecap="round" />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={COLOR} strokeWidth={2.5 * scale} strokeLinecap="round" />
    </>
  )
}

function Handle({ p, scale }: { p: Point; scale: number }) {
  return <circle cx={p.x} cy={p.y} r={6 * scale} fill={COLOR} stroke="#000" strokeWidth={1.5 * scale} />
}

const leanText = (a: Point, b: Point) => {
  const l = lean(a, b)
  return `${Math.round(l.degrees)}° from ${l.from}`
}

function Shape({ d, scale }: { d: Drawing; scale: number }) {
  if (d.kind === 'line') {
    const mid = { x: (d.a.x + d.b.x) / 2, y: (d.a.y + d.b.y) / 2 - 16 * scale }
    return (
      <g>
        <Segment a={d.a} b={d.b} scale={scale} />
        <Handle p={d.a} scale={scale} />
        <Handle p={d.b} scale={scale} />
        <Label at={mid} text={leanText(d.a, d.b)} scale={scale} />
      </g>
    )
  }
  return (
    <g>
      <Segment a={d.b} b={d.a} scale={scale} />
      <Segment a={d.b} b={d.c} scale={scale} />
      <Handle p={d.a} scale={scale} />
      <Handle p={d.c} scale={scale} />
      <Handle p={d.b} scale={scale} />
      <Label at={labelSpot(d.a, d.b, d.c, 34 * scale)} text={`${Math.round(angleAt(d.a, d.b, d.c))}°`} scale={scale} />
    </g>
  )
}

/** A drawing being made: the points so far and a line to the pointer. */
function Partial({ points, tool, scale }: { points: Point[]; tool: Tool; scale: number }) {
  return (
    <g opacity={0.85}>
      {points.slice(1).map((p, i) => (
        <Segment key={i} a={points[i]} b={p} scale={scale} />
      ))}
      {points.map((p, i) => (
        <Handle key={i} p={p} scale={scale} />
      ))}
      {tool === 'angle' && points.length === 3 && <Label at={labelSpot(points[0], points[1], points[2], 34 * scale)} text={`${Math.round(angleAt(points[0], points[1], points[2]))}°`} scale={scale} />}
    </g>
  )
}

/** The drawings painted onto a frame for "Save frame", matching the screen. */
function paint(ctx: CanvasRenderingContext2D, drawings: Drawing[], scale: number) {
  const segment = (a: Point, b: Point) => {
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'
    ctx.lineWidth = 5 * scale
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
    ctx.strokeStyle = COLOR
    ctx.lineWidth = 2.5 * scale
    ctx.stroke()
  }
  const handle = (p: Point) => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 6 * scale, 0, Math.PI * 2)
    ctx.fillStyle = COLOR
    ctx.fill()
    ctx.lineWidth = 1.5 * scale
    ctx.strokeStyle = '#000'
    ctx.stroke()
  }
  const label = (at: Point, text: string) => {
    ctx.font = `600 ${15 * scale}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3.5 * scale
    ctx.strokeStyle = '#000'
    ctx.strokeText(text, at.x, at.y)
    ctx.fillStyle = COLOR
    ctx.fillText(text, at.x, at.y)
  }
  for (const d of drawings) {
    if (d.kind === 'line') {
      segment(d.a, d.b)
      handle(d.a)
      handle(d.b)
      label({ x: (d.a.x + d.b.x) / 2, y: (d.a.y + d.b.y) / 2 - 16 * scale }, leanText(d.a, d.b))
    } else {
      segment(d.b, d.a)
      segment(d.b, d.c)
      handle(d.a)
      handle(d.c)
      handle(d.b)
      label(labelSpot(d.a, d.b, d.c, 34 * scale), `${Math.round(angleAt(d.a, d.b, d.c))}°`)
    }
  }
}
