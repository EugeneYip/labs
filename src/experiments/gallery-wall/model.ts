/**
 * Gallery Wall's geometry: where each frame goes in a row or grid, and where
 * its nails go. Lengths are in the plan's unit (inches or centimeters).
 * Heights are measured up from the floor; across is measured from the wall's
 * left edge, or left and right of a center mark.
 */

export type Unit = 'in' | 'cm'
/** One nail under a taut wire or a single sawtooth hook, or two nails for two hooks or D-rings. */
export type Hanger = 'wire' | 'hook' | 'two'

export interface Frame {
  id: string
  width: number
  height: number
  hanger: Hanger
  /** How far below the top edge the frame hangs from: the taut wire's peak, or the hook. */
  drop: number
  /** Distance between the two hooks, for `two`. */
  spread: number
}

export interface Plan {
  unit: Unit
  frames: Frame[]
  arrangement: 'row' | 'grid'
  columns: number
  gap: number
  /** How frames of different heights line up: in a row, along their centers, tops, or bottoms. */
  align: 'center' | 'top' | 'bottom'
  heightBy: 'center' | 'bottom'
  /** Height of the group's center, or of its bottom edge, above the floor. */
  height: number
  /** Center the group on the wall (needs its width) or on a mark made on the wall, such as the middle of a sofa. */
  centerOn: 'wall' | 'mark'
  wallWidth: number
}

export interface Placed {
  frame: Frame
  number: number
  /** Left edge across, and bottom edge up from the floor. */
  x: number
  y: number
  nails: { x: number; y: number }[]
}

export interface Layout {
  placed: Placed[]
  /** The whole group's box. */
  left: number
  right: number
  bottom: number
  top: number
}

export const LIMITS = { frames: 24, columns: 6 }

export function layout(plan: Plan): Layout {
  const { frames, gap } = plan
  if (!frames.length) return { placed: [], left: 0, right: 0, bottom: 0, top: 0 }

  // Lay frames out with the group's top-left corner at (0, 0), measuring downward first.
  const boxes: { frame: Frame; x: number; down: number }[] = []
  let width = 0
  let height = 0
  if (plan.arrangement === 'row') {
    const tallest = Math.max(...frames.map((f) => f.height))
    let x = 0
    for (const frame of frames) {
      const down = plan.align === 'top' ? 0 : plan.align === 'bottom' ? tallest - frame.height : (tallest - frame.height) / 2
      boxes.push({ frame, x, down })
      x += frame.width + gap
    }
    width = x - gap
    height = tallest
  } else {
    const columns = Math.max(1, Math.min(plan.columns, frames.length))
    const rows: Frame[][] = []
    for (let i = 0; i < frames.length; i += columns) rows.push(frames.slice(i, i + columns))
    const columnWidths = Array.from({ length: columns }, (_, c) => Math.max(...rows.map((r) => r[c]?.width ?? 0)))
    width = columnWidths.reduce((a, b) => a + b, 0) + gap * (columns - 1)
    let top = 0
    for (const row of rows) {
      const rowHeight = Math.max(...row.map((f) => f.height))
      // A full row follows the columns; a shorter last row is centered under them.
      const full = row.length === columns
      const rowWidth = full ? width : row.reduce((a, f) => a + f.width, 0) + gap * (row.length - 1)
      let x = full ? 0 : (width - rowWidth) / 2
      row.forEach((frame, c) => {
        const cell = full ? columnWidths[c] : frame.width
        const down = plan.align === 'top' ? 0 : plan.align === 'bottom' ? rowHeight - frame.height : (rowHeight - frame.height) / 2
        boxes.push({ frame, x: x + (cell - frame.width) / 2, down: top + down })
        x += cell + gap
      })
      top += rowHeight + gap
    }
    height = top - gap
  }

  const center = plan.centerOn === 'wall' ? plan.wallWidth / 2 : 0
  const left = center - width / 2
  const bottom = plan.heightBy === 'center' ? plan.height - height / 2 : plan.height
  const top = bottom + height
  const placed = boxes.map(({ frame, x, down }, i) => {
    const frameTop = top - down
    const nailY = frameTop - frame.drop
    const middle = left + x + frame.width / 2
    const nails = frame.hanger === 'two' ? [{ x: middle - frame.spread / 2, y: nailY }, { x: middle + frame.spread / 2, y: nailY }] : [{ x: middle, y: nailY }]
    return { frame, number: i + 1, x: left + x, y: frameTop - frame.height, nails }
  })
  return { placed, left, right: left + width, bottom, top }
}

/** Problems worth flagging before anyone picks up a hammer. */
export function problems(plan: Plan, result: Layout): string[] {
  const list: string[] = []
  const u = plan.unit
  plan.frames.forEach((f, i) => {
    if (f.drop >= f.height) list.push(`Frame ${i + 1} hangs from below its own bottom edge: check its drop.`)
    if (f.hanger === 'two' && f.spread >= f.width) list.push(`Frame ${i + 1}'s two hooks are farther apart than the frame is wide.`)
  })
  if (result.placed.length && result.bottom < 0) list.push('The frames would reach below the floor. Raise the height.')
  if (plan.centerOn === 'wall' && result.placed.length && result.right - result.left > plan.wallWidth)
    list.push(`The group is ${format(result.right - result.left, u)} wide, wider than the ${format(plan.wallWidth, u)} wall.`)
  return list
}

// Measurements.

/** 34 3/8 in, or 87.5 cm: inches to the nearest sixteenth, centimeters to the millimeter. */
export function format(value: number, unit: Unit): string {
  if (unit === 'cm') return `${trimZero((Math.round(value * 10) / 10).toFixed(1))} cm`
  const sixteenths = Math.round(Math.abs(value) * 16)
  const whole = Math.floor(sixteenths / 16)
  let n = sixteenths % 16
  let d = 16
  while (n && n % 2 === 0) {
    n /= 2
    d /= 2
  }
  const sign = value < 0 && sixteenths ? '−' : ''
  const text = n ? (whole ? `${whole} ${n}/${d}` : `${n}/${d}`) : String(whole)
  return `${sign}${text} in`
}

const trimZero = (text: string) => text.replace(/\.0$/, '')

/** How far across a nail is, said the way you'd measure it. */
export function across(x: number, plan: Plan): string {
  if (plan.centerOn === 'wall') return `${format(x, plan.unit)} from the left edge`
  const tiny = plan.unit === 'in' ? 1 / 32 : 0.05
  if (Math.abs(x) < tiny) return 'on the center mark'
  return `${format(Math.abs(x), plan.unit)} ${x < 0 ? 'left' : 'right'} of the mark`
}

/** Reads "16", "16.5", "16,5", "16 1/2", "1/2", or "16½". Null for anything else or for negatives. */
export function parseLength(text: string): number | null {
  const t = text.trim().replace(',', '.').replace(/½/g, ' 1/2').replace(/¼/g, ' 1/4').replace(/¾/g, ' 3/4').replace(/⅛/g, ' 1/8').replace(/\s+/g, ' ').trim()
  const mixed = /^(\d+(?:\.\d+)?)?(?:\s*(\d+)\/(\d+))?$/.exec(t)
  if (!t || !mixed || (!mixed[1] && !mixed[2])) return null
  const whole = mixed[1] ? Number(mixed[1]) : 0
  const fraction = mixed[2] ? Number(mixed[2]) / Number(mixed[3]) : 0
  if (mixed[2] && (!Number(mixed[3]) || fraction >= 1)) return null
  const value = whole + fraction
  return Number.isFinite(value) ? value : null
}

/** Converts a length between units, rounded to a sixteenth of an inch or a millimeter. */
export function convert(value: number, to: Unit): number {
  return to === 'cm' ? Math.round(value * 2.54 * 10) / 10 : Math.round((value / 2.54) * 16) / 16
}

export function convertPlan(plan: Plan, to: Unit): Plan {
  if (plan.unit === to) return plan
  const c = (v: number) => convert(v, to)
  return {
    ...plan,
    unit: to,
    gap: c(plan.gap),
    height: to === 'cm' ? Math.round(plan.height * 2.54) : Math.round(plan.height / 2.54),
    wallWidth: c(plan.wallWidth),
    frames: plan.frames.map((f) => ({ ...f, width: c(f.width), height: c(f.height), drop: c(f.drop), spread: c(f.spread) })),
  }
}

/** Inches in the United States, Liberia, and Myanmar; centimeters everywhere else. */
export function defaultUnit(locale: string): Unit {
  try {
    const region = new Intl.Locale(locale).maximize().region
    return region && ['US', 'LR', 'MM'].includes(region) ? 'in' : 'cm'
  } catch {
    return 'cm'
  }
}

export const newId = () => crypto.randomUUID().slice(0, 8)

/** Three 16 × 20 frames on wires, 3 inches apart, centered at eye level: a common start. */
export function startingPlan(unit: Unit): Plan {
  const inches: Plan = {
    unit: 'in',
    frames: [0, 1, 2].map(() => ({ id: newId(), width: 16, height: 20, hanger: 'wire' as const, drop: 3, spread: 10 })),
    arrangement: 'row',
    columns: 3,
    gap: 3,
    align: 'center',
    heightBy: 'center',
    height: 57,
    centerOn: 'wall',
    wallWidth: 120,
  }
  if (unit === 'in') return inches
  return { ...convertPlan(inches, 'cm'), height: 145, gap: 7.5, wallWidth: 300, frames: inches.frames.map((f) => ({ ...f, width: 40, height: 50, drop: 7.5, spread: 25 })) }
}
