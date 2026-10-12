/**
 * Form Check's geometry and frame timing. Drawings live in the video's own
 * pixel coordinates, so they stay on the body part they were drawn on at any
 * screen size.
 */

export interface Point {
  x: number
  y: number
}

export type Drawing = { id: number; kind: 'line'; a: Point; b: Point } | { id: number; kind: 'angle'; a: Point; b: Point; c: Point }

/** The angle at `b` between the arms to `a` and `c`, in degrees (0–180). */
export function angleAt(a: Point, b: Point, c: Point): number {
  const v1 = { x: a.x - b.x, y: a.y - b.y }
  const v2 = { x: c.x - b.x, y: c.y - b.y }
  const len = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y)
  if (!len) return 0
  const cos = Math.min(1, Math.max(-1, (v1.x * v2.x + v1.y * v2.y) / len))
  return (Math.acos(cos) * 180) / Math.PI
}

/**
 * How far a line leans: from level when it's closer to level, otherwise from
 * vertical, as people judge a back, a shin, or a club shaft.
 */
export function lean(a: Point, b: Point): { degrees: number; from: 'level' | 'vertical' } {
  const dx = Math.abs(b.x - a.x)
  const dy = Math.abs(b.y - a.y)
  if (!dx && !dy) return { degrees: 0, from: 'level' }
  const fromLevel = (Math.atan2(dy, dx) * 180) / Math.PI
  return fromLevel <= 45 ? { degrees: fromLevel, from: 'level' } : { degrees: 90 - fromLevel, from: 'vertical' }
}

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

/** Where to write an angle's size: just inside the angle, along the line that splits it. */
export function labelSpot(a: Point, b: Point, c: Point, offset: number): Point {
  const u1 = unit({ x: a.x - b.x, y: a.y - b.y })
  const u2 = unit({ x: c.x - b.x, y: c.y - b.y })
  let mid = { x: u1.x + u2.x, y: u1.y + u2.y }
  // A straight angle has no inside; put the label beside the vertex.
  if (Math.hypot(mid.x, mid.y) < 1e-6) mid = { x: -u1.y, y: u1.x }
  const u = unit(mid)
  return { x: b.x + u.x * offset, y: b.y + u.y * offset }
}

const unit = (v: Point) => {
  const l = Math.hypot(v.x, v.y) || 1
  return { x: v.x / l, y: v.y / l }
}

const RATES = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 90, 100, 119.88, 120, 240]

/**
 * The frame rate from the times between frames seen while playing: the most
 * common gap, snapped to a standard rate when one is within 3%.
 */
export function frameRate(gaps: readonly number[]): number | null {
  const good = gaps.filter((g) => g > 1 / 400 && g < 1 / 8)
  if (good.length < 3) return null
  const sorted = [...good].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  return snap(1 / median)
}

/** A frame rate snapped to a standard one when that's within 3%. */
function snap(raw: number): number {
  const near = RATES.reduce((best, r) => (Math.abs(r - raw) < Math.abs(best - raw) ? r : best), RATES[0])
  return Math.abs(near - raw) / raw <= 0.03 ? near : Math.round(raw)
}

/**
 * The frame rate an MP4 or MOV file records for its video, from the frame durations in the track's sample table
 * ('stts'), in its own time scale. Playback can't learn a rate higher than the screen's, such as a phone's
 * 240 fps slow motion on a 60 Hz screen, as only every fourth frame is shown. Null for anything else, or a damaged file.
 */
export async function fileFrameRate(file: Blob): Promise<number | null> {
  try {
    // 'moov', the index, comes before or after the media data; walk the top-level boxes to it.
    for (let offset = 0; offset + 8 <= file.size; ) {
      const head = new DataView(await file.slice(offset, offset + 16).arrayBuffer())
      let size = head.getUint32(0)
      let header = 8
      if (size === 1 && head.byteLength >= 16) {
        size = Number(head.getBigUint64(8))
        header = 16
      } else if (size === 0) size = file.size - offset
      if (size < header) return null
      if (boxType(head, 4) === 'moov') return size <= 64_000_000 ? videoFrameRate(new DataView(await file.slice(offset + header, offset + size).arrayBuffer())) : null
      offset += size
    }
  } catch {
    // Not a file this can read: playback learns the rate instead.
  }
  return null
}

const boxType = (view: DataView, at: number) => String.fromCharCode(view.getUint8(at), view.getUint8(at + 1), view.getUint8(at + 2), view.getUint8(at + 3))

/** The boxes directly inside [start, end) of a view, each with where its content starts and ends. */
function children(view: DataView, start: number, end: number): { type: string; start: number; end: number }[] {
  const out = []
  for (let at = start; at + 8 <= end; ) {
    const size = view.getUint32(at)
    if (size < 8 || at + size > end) break
    out.push({ type: boxType(view, at + 4), start: at + 8, end: at + size })
    at += size
  }
  return out
}

function videoFrameRate(moov: DataView): number | null {
  const find = (box: { start: number; end: number }, type: string) => children(moov, box.start, box.end).find((b) => b.type === type)
  for (const trak of children(moov, 0, moov.byteLength).filter((b) => b.type === 'trak')) {
    const mdia = find(trak, 'mdia')
    const hdlr = mdia && find(mdia, 'hdlr')
    if (!mdia || !hdlr || hdlr.end - hdlr.start < 12 || boxType(moov, hdlr.start + 8) !== 'vide') continue
    const mdhd = find(mdia, 'mdhd')
    const minf = find(mdia, 'minf')
    const stbl = minf && find(minf, 'stbl')
    const stts = stbl && find(stbl, 'stts')
    if (!mdhd || !stts || mdhd.end - mdhd.start < 24 || stts.end - stts.start < 8) return null
    const timescale = moov.getUint32(mdhd.start + (moov.getUint8(mdhd.start) === 1 ? 20 : 12))
    // Entries are (frames, duration) pairs. The frame length is the mean duration of the middle 80% of frames: a
    // phone's frame rate varies, a long last frame or a dropped one shouldn't count, and 240 fps in a time scale of
    // 600 is written as durations of 2 and 3 in turn.
    const count = Math.min(moov.getUint32(stts.start + 4), Math.floor((stts.end - stts.start - 8) / 8))
    const runs: [number, number][] = []
    let total = 0
    for (let i = 0; i < count; i++) {
      const frames = moov.getUint32(stts.start + 8 + i * 8)
      runs.push([moov.getUint32(stts.start + 12 + i * 8), frames])
      total += frames
    }
    runs.sort((a, b) => a[0] - b[0])
    const [from, to] = [total * 0.1, total * 0.9]
    let sum = 0
    let kept = 0
    for (let i = 0, seen = 0; i < runs.length; seen += runs[i][1], i++) {
      const inside = Math.min(seen + runs[i][1], to) - Math.max(seen, from)
      if (inside > 0) [sum, kept] = [sum + runs[i][0] * inside, kept + inside]
    }
    if (!timescale || !kept || !sum) return null
    const raw = (timescale * kept) / sum
    return raw > 8 && raw < 400 ? snap(raw) : null
  }
  return null
}

/** "1.23 s", with the frame number at the given rate. */
export function timeLabel(seconds: number, fps: number): string {
  const frame = Math.floor(seconds * fps + 1e-6) + 1
  return `${seconds.toFixed(2)} s · frame ${frame}`
}

/** The time to seek to for the frame `steps` away, landing a little inside the frame so rounding can't skip it. */
export function stepTime(current: number, steps: number, fps: number, duration: number): number {
  const frame = Math.floor(current * fps + 1e-6) + steps
  const t = (frame + 0.5) / fps
  return Math.min(Math.max(0, t), Math.max(0, duration - 0.5 / fps))
}
