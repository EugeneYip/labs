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
  const raw = 1 / median
  const near = RATES.reduce((best, r) => (Math.abs(r - raw) < Math.abs(best - raw) ? r : best), RATES[0])
  return Math.abs(near - raw) / raw <= 0.03 ? near : Math.round(raw)
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
