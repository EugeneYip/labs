/**
 * Serve Time's planning: every dish's steps are laid out backward from the
 * moment the meal is served, so all dishes finish together. Also works out
 * oven preheats and clashes, and what "push dinner back" moves.
 */

export interface Step {
  id: string
  what: string
  minutes: number
  /** Oven temperature in the plan's unit, or null when the step doesn't use the oven. */
  oven: number | null
}

export interface Dish {
  id: string
  name: string
  steps: Step[]
}

/** Pushing dinner back while cooking: steps not yet started at `at` move `minutes` later. */
export interface Delay {
  at: number
  minutes: number
}

export type Unit = 'C' | 'F'

export interface Plan {
  /** When the meal is served, in milliseconds since 1970. */
  serveAt: number
  unit: Unit
  ovens: 1 | 2
  dishes: Dish[]
  delays: Delay[]
}

export interface Slot {
  key: string
  dish: Dish
  dishIndex: number
  step: Step
  stepIndex: number
  start: number
  end: number
}

export interface Cue {
  key: string
  at: number
  kind: 'start' | 'preheat' | 'serve'
  slot?: Slot
  temp?: number
}

export interface Clash {
  from: number
  to: number
  /** The steps fighting over the oven. */
  slots: Slot[]
}

export const MINUTE = 60_000
export const LIMITS = { dishes: 20, steps: 15, minutes: 7 * 24 * 60, text: 80 }
/** How long an oven takes to heat up, for the preheat reminder. */
export const PREHEAT_MINUTES = 15

const tolerance = (unit: Unit) => (unit === 'C' ? 10 : 20)

/** Where a planned moment lands after the delays: anything still ahead when dinner was pushed back moves. */
export function shifted(time: number, delays: Delay[]): number {
  let t = time
  for (const d of delays) if (t > d.at) t += d.minutes * MINUTE
  return t
}

export function serveTime(plan: Plan): number {
  return shifted(plan.serveAt, plan.delays)
}

/** Every step with a duration, in the order they start. */
export function schedule(plan: Plan): Slot[] {
  const slots: Slot[] = []
  plan.dishes.forEach((dish, dishIndex) => {
    let end = plan.serveAt
    for (let stepIndex = dish.steps.length - 1; stepIndex >= 0; stepIndex--) {
      const step = dish.steps[stepIndex]
      if (!(step.minutes > 0)) continue
      const plannedStart = end - step.minutes * MINUTE
      const start = shifted(plannedStart, plan.delays)
      slots.push({ key: `${dish.id}:${step.id}`, dish, dishIndex, step, stepIndex, start, end: start + step.minutes * MINUTE })
      end = plannedStart
    }
  })
  return slots.sort((a, b) => a.start - b.start || a.dishIndex - b.dishIndex || a.stepIndex - b.stepIndex)
}

/**
 * A reminder before each oven step that finds the oven cold or at another
 * temperature: nothing at about that heat runs right up to its start.
 */
export function preheats(slots: Slot[], unit: Unit): Cue[] {
  const oven = slots.filter((s) => s.step.oven !== null)
  const cues: Cue[] = []
  for (const s of oven) {
    const temp = s.step.oven!
    const warm = oven.some((t) => t !== s && Math.abs(t.step.oven! - temp) <= tolerance(unit) && t.start < s.start && t.end >= s.start - 5 * MINUTE)
    const queued = cues.some((c) => Math.abs(c.temp! - temp) <= tolerance(unit) && c.at + PREHEAT_MINUTES * MINUTE <= s.start && s.start - c.at <= 2 * PREHEAT_MINUTES * MINUTE)
    if (!warm && !queued) cues.push({ key: `preheat:${s.key}`, at: s.start - PREHEAT_MINUTES * MINUTE, kind: 'preheat', temp })
  }
  return cues
}

/** Everything to announce while cooking, in order: step starts, preheats, and serving. */
export function cues(plan: Plan, slots = schedule(plan)): Cue[] {
  const starts: Cue[] = slots.map((slot) => ({ key: `start:${slot.key}`, at: slot.start, kind: 'start', slot }))
  const all = [...starts, ...preheats(slots, plan.unit)]
  if (slots.length) all.push({ key: 'serve', at: serveTime(plan), kind: 'serve' })
  return all.sort((a, b) => a.at - b.at || (a.kind === 'preheat' ? -1 : b.kind === 'preheat' ? 1 : 0))
}

/** Times when more oven temperatures are needed at once than there are ovens. */
export function ovenClashes(slots: Slot[], ovens: number, unit: Unit): Clash[] {
  const oven = slots.filter((s) => s.step.oven !== null)
  const times = [...new Set(oven.flatMap((s) => [s.start, s.end]))].sort((a, b) => a - b)
  const clashes: Clash[] = []
  for (let i = 0; i + 1 < times.length; i++) {
    const [from, to] = [times[i], times[i + 1]]
    const active = oven.filter((s) => s.start < to && s.end > from)
    // Group temperatures that one oven can serve together, like 200° and 210°.
    const temps = active.map((s) => s.step.oven!).sort((a, b) => a - b)
    let groups = 0
    for (let k = 0; k < temps.length; k++) if (k === 0 || temps[k] - temps[k - 1] > tolerance(unit)) groups++
    if (groups <= ovens) continue
    // Back-to-back stretches read as one clash, even when the dishes involved change partway.
    const last = clashes[clashes.length - 1]
    if (last && last.to === from) {
      last.to = to
      for (const s of active) if (!last.slots.includes(s)) last.slots.push(s)
    } else clashes.push({ from, to, slots: active })
  }
  return clashes
}

/** How late the plan already is: its first cue should have happened this long ago (0 if not). */
export function lateBy(list: Cue[], now: number): number {
  return list.length ? Math.max(0, now - Math.min(...list.map((c) => c.at))) : 0
}

/** A serving time that gives the plan room to start a few minutes from now, on a 5-minute mark. */
export function serveAtToFit(plan: Plan, list: Cue[], now: number): number {
  const late = lateBy(list, now)
  const step = 5 * MINUTE
  return plan.serveAt + Math.ceil((late + step) / step) * step
}

// Durations: "90", "1:30", "1h30", "1 hr 30 min", "1.5 h", "45m", "2 days".

export function parseDuration(text: string): number | null {
  const t = text.trim().toLowerCase().replace(',', '.')
  if (!t) return null
  let minutes: number | null = null
  const clock = /^(\d+):([0-5]\d)$/.exec(t)
  if (clock) minutes = Number(clock[1]) * 60 + Number(clock[2])
  else if (/^\d+(\.\d+)?$/.test(t)) minutes = Number(t)
  else {
    const units: [RegExp, number][] = [
      [/(\d+(?:\.\d+)?)\s*(?:days?|d)\b/, 24 * 60],
      [/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)/, 60],
      [/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/, 1],
    ]
    let rest = t
    let total = 0
    let found = false
    for (const [pattern, size] of units) {
      const match = pattern.exec(rest)
      if (!match) continue
      total += Number(match[1]) * size
      rest = rest.slice(0, match.index) + ' ' + rest.slice(match.index + match[0].length)
      found = true
    }
    // "1h30" or "1 hr 30": a bare number after hours is minutes.
    const trailing = /^\s*(\d+)\s*$/.exec(rest)
    if (found && trailing && /h/.test(t)) {
      total += Number(trailing[1])
      rest = ''
    }
    if (found && !rest.replace(/\band\b|[\s,]/g, '')) minutes = total
  }
  if (minutes === null || !Number.isFinite(minutes)) return null
  const rounded = Math.round(minutes)
  return rounded >= 1 && rounded <= LIMITS.minutes ? rounded : null
}

export function formatDuration(minutes: number): string {
  const days = Math.floor(minutes / (24 * 60))
  const hours = Math.floor((minutes % (24 * 60)) / 60)
  const mins = minutes % 60
  return [days && `${days} d`, hours && `${hours} h`, mins && `${mins} min`].filter(Boolean).join(' ') || '0 min'
}

// Temperatures.

/**
 * Converts an oven temperature to the nearest usual dial setting: 25° steps
 * for Fahrenheit and 10° steps for Celsius at baking heat, so 180°C becomes
 * 350°F and back, and 5° steps for gentle heat.
 */
export function convert(temp: number, to: Unit): number {
  const value = to === 'F' ? (temp * 9) / 5 + 32 : ((temp - 32) * 5) / 9
  const step = to === 'F' ? (value >= 300 ? 25 : 5) : value >= 150 ? 10 : 5
  return Math.round(value / step) * step
}

export function validTemp(temp: number, unit: Unit): boolean {
  return Number.isFinite(temp) && (unit === 'C' ? temp >= 30 && temp <= 320 : temp >= 85 && temp <= 610)
}

/** Fahrenheit where ovens are marked in it: the United States and a few others. */
export function defaultUnit(locale: string): Unit {
  try {
    const region = new Intl.Locale(locale).maximize().region
    return region && ['US', 'BS', 'BZ', 'KY', 'PW', 'LR', 'FM', 'MH', 'PR', 'GU', 'VI', 'AS', 'MP'].includes(region) ? 'F' : 'C'
  } catch {
    return 'C'
  }
}

/** 7 PM today, or two hours from now rounded up to the half hour if it's already past 5 PM. */
export function defaultServeAt(now: number): number {
  const date = new Date(now)
  const seven = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 19).getTime()
  if (now <= seven - 2 * 60 * MINUTE) return seven
  const soon = new Date(now + 2 * 60 * MINUTE)
  const halfHours = Math.ceil((soon.getHours() * 60 + soon.getMinutes() + (soon.getSeconds() || soon.getMilliseconds() ? 1 : 0)) / 30)
  return new Date(soon.getFullYear(), soon.getMonth(), soon.getDate(), 0, halfHours * 30).getTime()
}

/** Keeps an old plan useful: a serving time long past moves to the same time on the next day ahead. */
export function freshServeAt(serveAt: number, now: number): number {
  if (serveAt > now - 6 * 60 * MINUTE) return serveAt
  const then = new Date(serveAt)
  const today = new Date(now)
  let next = new Date(today.getFullYear(), today.getMonth(), today.getDate(), then.getHours(), then.getMinutes()).getTime()
  if (next <= now) next = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, then.getHours(), then.getMinutes()).getTime()
  return next
}

export const newId = () => crypto.randomUUID().slice(0, 8)

/** A Sunday roast, to show how a plan works. Temperatures are in the given unit. */
export function exampleDishes(unit: Unit): Dish[] {
  const t = (celsius: number) => (unit === 'C' ? celsius : convert(celsius, 'F'))
  const dish = (name: string, steps: [string, number, number | null][]): Dish => ({
    id: newId(),
    name,
    steps: steps.map(([what, minutes, oven]) => ({ id: newId(), what, minutes, oven: oven === null ? null : t(oven) })),
  })
  return [
    dish('Roast chicken', [['Season and stuff', 15, null], ['Roast', 80, 220], ['Rest under foil', 15, null]]),
    dish('Roast potatoes', [['Peel and parboil', 20, null], ['Roast', 45, 220]]),
    dish('Green beans', [['Trim', 10, null], ['Boil', 6, null]]),
    dish('Gravy', [['Make from the pan juices', 10, null]]),
  ]
}
