// Collection Climate: what a place's temperature and humidity readings say against a guideline.
//
// For the period chosen: the share of readings inside the RH band, the temperature band, and both (the bands'
// edges included); the readings above and below; time above 65% and 70% RH; and the 24-hour limit, read one of two
// ways and said which: "mean", no reading further than the limit from the average of the 24 hours up to and
// including it; or "range", no more than the limit between the highest and lowest readings of those 24 hours. A
// reading is checked against the 24-hour limit when the record covers the 24 hours before it: the logger has been
// recording for 24 hours, and the first reading of those 24 hours comes within twice the usual interval of their
// start (so not in the day after a gap, when the window holds only the readings since). Breaking
// readings close together (no more than twice the logger's usual interval apart) make one spell. Gaps in the record
// (more than twice the usual interval between readings) are listed, and shares count only the readings there are.
// Monthly figures follow the calendar month of each reading's clock time.

import type { Reading } from './read.ts'

export type SwingRule = 'mean' | 'range'

export interface Guideline {
  /** 'bizot2023' or 'own'. */
  kind: 'bizot2023' | 'own'
  rhLow: number
  rhHigh: number
  tempLow: number
  tempHigh: number
  /** The 24-hour RH limit in percentage points, or 0 for none. */
  swing: number
  rule: SwingRule
}

/** The Bizot Green Protocol's 2023 guideline: stable RH 40–60%, temperature 16–25 °C, at most ±10% RH in 24 hours. */
export const BIZOT_2023: Guideline = { kind: 'bizot2023', rhLow: 40, rhHigh: 60, tempLow: 16, tempHigh: 25, swing: 10, rule: 'mean' }

export const DAY = 86_400

export interface Gap {
  /** The last reading before the gap, and the first after it (seconds). */
  from: number
  to: number
}

export interface Spell {
  from: number
  to: number
  readings: number
  /** The largest departure from the 24-hour average, or the largest 24-hour range, in the spell. */
  worst: number
  at: number
}

export interface Band {
  n: number
  inBand: number
  above: number
  below: number
  min: number | null
  max: number | null
  mean: number | null
}

export interface MonthRow {
  /** yyyy-mm */
  month: string
  readings: number
  first: number
  last: number
  rh: Band & { over65: number; over70: number }
  temp: Band
  both: { n: number; inBand: number }
  /** Readings checked against the 24-hour limit, and those that broke it. */
  checked: number
  breaches: number
  /** Days in the month with a reading that broke the 24-hour limit. */
  swingDays: number
}

export interface Report {
  readings: number
  first: number | null
  last: number | null
  /** The usual time between readings, in seconds. */
  interval: number | null
  gaps: Gap[]
  rh: Band & { over65: number; over70: number }
  temp: Band
  both: { n: number; inBand: number }
  swing: { checked: number; breaches: number; spells: Spell[]; days: string[]; worst: number | null }
  months: MonthRow[]
}

// --- Readings

/**
 * One place's readings from several files (each month's download, say), in time order. A reading an earlier file
 * already has is kept once: the same time, and the same values to within rounding (0.1 °C and 0.5 points of RH, as
 * exports rounded differently, in °F, or with whole-number RH can differ), a value one of them lacks taken from the
 * other. A row repeated exactly within a file is kept once too. Other readings at the same time (the clock going
 * back an hour, or two loggers' files mixed) are all kept, and counted.
 */
export function merge(lists: Reading[][]): { readings: Reading[]; repeats: number; clashes: number } {
  // How far apart two readings of the same moment are, or Infinity when they can't be the same reading.
  const apart = (x: Reading, r: Reading) => {
    const dt = x.temp === null || r.temp === null ? 0 : Math.abs(x.temp - r.temp)
    const dh = x.rh === null || r.rh === null ? 0 : Math.abs(x.rh - r.rh)
    return dt <= 0.1 + 1e-9 && dh <= 0.5 + 1e-9 ? dt + dh / 5 : Infinity
  }
  const kept: Reading[] = []
  const at = new Map<number, number[]>()
  let repeats = 0
  for (const list of lists) {
    const before = kept.length
    // An earlier file's reading stands for one reading of this file, not several.
    const used = new Set<number>()
    for (const r of list) {
      const same = at.get(r.t)
      let k: number | undefined
      if (same) {
        let best = Infinity
        for (const i of same) {
          if (i >= before || used.has(i)) continue
          const d = apart(kept[i], r)
          if (d < best) {
            best = d
            k = i
          }
        }
        if (k === undefined) k = same.find((i) => i >= before && kept[i].temp === r.temp && kept[i].rh === r.rh)
      }
      if (k !== undefined) {
        repeats++
        if (k < before) {
          used.add(k)
          const x = kept[k]
          if ((x.temp === null && r.temp !== null) || (x.rh === null && r.rh !== null)) kept[k] = { t: x.t, temp: x.temp ?? r.temp, rh: x.rh ?? r.rh }
        }
        continue
      }
      const i = kept.push(r) - 1
      if (same) same.push(i)
      else at.set(r.t, [i])
    }
  }
  let clashes = 0
  for (const same of at.values()) clashes += same.length - 1
  const order = kept.map((_, i) => i).sort((a, b) => kept[a].t - kept[b].t || a - b)
  return { readings: order.map((i) => kept[i]), repeats, clashes }
}

export function intervalOf(readings: Reading[]): number | null {
  const d: number[] = []
  for (let i = 1; i < readings.length; i++) if (readings[i].t > readings[i - 1].t) d.push(readings[i].t - readings[i - 1].t)
  if (!d.length) return null
  d.sort((a, b) => a - b)
  return d[d.length >> 1]
}

export function gapsOf(readings: Reading[], interval: number | null): Gap[] {
  if (interval === null) return []
  const gaps: Gap[] = []
  for (let i = 1; i < readings.length; i++) if (readings[i].t - readings[i - 1].t > 2 * interval) gaps.push({ from: readings[i - 1].t, to: readings[i].t })
  return gaps
}

// --- The 24-hour limit

/**
 * For each reading with an RH, its 24-hour figure: the departure from the average of the 24 hours up to and
 * including it ("mean"), or the range of those 24 hours ("range"); null when the record doesn't cover those 24 hours
 * (the logger not yet recording for 24 hours, or a gap at their start). One pass: running sums for the average,
 * monotone queues for the highest and lowest.
 */
export function swingFigures(readings: Reading[], rule: SwingRule): (number | null)[] {
  const rhIdx: number[] = []
  readings.forEach((r, i) => {
    if (r.rh !== null) rhIdx.push(i)
  })
  const out: (number | null)[] = new Array(readings.length).fill(null)
  if (!rhIdx.length) return out
  const firstT = readings[rhIdx[0]].t
  // The usual time between RH readings: a window's first reading within twice that of its start covers it.
  const steps: number[] = []
  for (let k = 1; k < rhIdx.length; k++) {
    const d = readings[rhIdx[k]].t - readings[rhIdx[k - 1]].t
    if (d > 0) steps.push(d)
  }
  steps.sort((a, b) => a - b)
  const slack = steps.length ? 2 * steps[steps.length >> 1] : DAY
  const rhAt = (k: number) => readings[rhIdx[k]].rh!
  let start = 0
  let sum = 0
  const maxQ: number[] = []
  const minQ: number[] = []
  let k = 0
  while (k < rhIdx.length) {
    // Readings at the same time share one window: add them all before working out any of their figures.
    const t = readings[rhIdx[k]].t
    let end = k
    while (end < rhIdx.length && readings[rhIdx[end]].t === t) {
      const v = rhAt(end)
      sum += v
      while (maxQ.length && rhAt(maxQ[maxQ.length - 1]) <= v) maxQ.pop()
      maxQ.push(end)
      while (minQ.length && rhAt(minQ[minQ.length - 1]) >= v) minQ.pop()
      minQ.push(end)
      end++
    }
    // The window: readings later than 24 hours before this time.
    while (readings[rhIdx[start]].t <= t - DAY) {
      sum -= rhAt(start)
      start++
    }
    while (maxQ[0] < start) maxQ.shift()
    while (minQ[0] < start) minQ.shift()
    if (t - firstT >= DAY && readings[rhIdx[start]].t - (t - DAY) <= slack) {
      const count = end - start
      const range = rhAt(maxQ[0]) - rhAt(minQ[0])
      for (let j = k; j < end; j++) out[rhIdx[j]] = rule === 'mean' ? Math.abs(rhAt(j) - sum / count) : range
    }
    k = end
  }
  return out
}

// The figures for a list of readings, worked out once: the report and the graph both need them, and a list of
// readings is never changed once made.
const figureCache = new WeakMap<Reading[], Partial<Record<SwingRule, (number | null)[]>>>()
function figuresOf(readings: Reading[], rule: SwingRule): (number | null)[] {
  let byRule = figureCache.get(readings)
  if (!byRule) figureCache.set(readings, (byRule = {}))
  return (byRule[rule] ??= swingFigures(readings, rule))
}

// --- The report

function band(values: number[], low: number, high: number): Band {
  let inBand = 0
  let above = 0
  let below = 0
  let sum = 0
  let min = Infinity
  let max = -Infinity
  for (const v of values) {
    if (v < low) below++
    else if (v > high) above++
    else inBand++
    sum += v
    if (v < min) min = v
    if (v > max) max = v
  }
  const n = values.length
  return { n, inBand, above, below, min: n ? min : null, max: n ? max : null, mean: n ? sum / n : null }
}

export function dayOf(t: number): string {
  return new Date(t * 1000).toISOString().slice(0, 10)
}

export function monthOf(t: number): string {
  return new Date(t * 1000).toISOString().slice(0, 7)
}

/** A place's report for the period from `from` to `to` (seconds, both included; null for the whole record). */
export function reportOf(all: Reading[], g: Guideline, from: number | null = null, to: number | null = null): Report {
  const figures = g.swing > 0 ? figuresOf(all, g.rule) : new Array<number | null>(all.length).fill(null)
  const idx: number[] = []
  for (let i = 0; i < all.length; i++) {
    const t = all[i].t
    if ((from === null || t >= from) && (to === null || t <= to)) idx.push(i)
  }
  const rs = idx.map((i) => all[i])
  const interval = intervalOf(rs)
  const rhValues = rs.filter((r) => r.rh !== null).map((r) => r.rh!)
  const tempValues = rs.filter((r) => r.temp !== null).map((r) => r.temp!)
  const rh = band(rhValues, g.rhLow, g.rhHigh)
  const temp = band(tempValues, g.tempLow, g.tempHigh)
  let bothN = 0
  let bothIn = 0
  for (const r of rs) {
    if (r.rh === null || r.temp === null) continue
    bothN++
    if (r.rh >= g.rhLow && r.rh <= g.rhHigh && r.temp >= g.tempLow && r.temp <= g.tempHigh) bothIn++
  }
  // The 24-hour limit.
  let checked = 0
  let breaches = 0
  let worst: number | null = null
  const spells: Spell[] = []
  const days = new Set<string>()
  const allowed = interval === null ? DAY : 2 * interval
  for (const i of idx) {
    const f = figures[i]
    if (f === null) continue
    checked++
    if (worst === null || f > worst) worst = f
    if (f <= g.swing + 1e-9) continue
    breaches++
    const t = all[i].t
    days.add(dayOf(t))
    const last = spells[spells.length - 1]
    if (last && t - last.to <= allowed) {
      last.to = t
      last.readings++
      if (f > last.worst) {
        last.worst = f
        last.at = t
      }
    } else spells.push({ from: t, to: t, readings: 1, worst: f, at: t })
  }
  // Months.
  const byMonth = new Map<string, number[]>()
  for (const i of idx) {
    const m = monthOf(all[i].t)
    const list = byMonth.get(m)
    if (list) list.push(i)
    else byMonth.set(m, [i])
  }
  const months: MonthRow[] = [...byMonth.keys()].sort().map((m) => {
    const list = byMonth.get(m)!.map((i) => all[i])
    const rhs = list.filter((r) => r.rh !== null).map((r) => r.rh!)
    let n = 0
    let inBoth = 0
    for (const r of list) {
      if (r.rh === null || r.temp === null) continue
      n++
      if (r.rh >= g.rhLow && r.rh <= g.rhHigh && r.temp >= g.tempLow && r.temp <= g.tempHigh) inBoth++
    }
    let mChecked = 0
    let mBreaches = 0
    for (const i of byMonth.get(m)!) {
      const f = figures[i]
      if (f === null) continue
      mChecked++
      if (f > g.swing + 1e-9) mBreaches++
    }
    return {
      month: m,
      readings: list.length,
      first: list[0].t,
      last: list[list.length - 1].t,
      rh: { ...band(rhs, g.rhLow, g.rhHigh), over65: rhs.filter((v) => v > 65).length, over70: rhs.filter((v) => v > 70).length },
      temp: band(list.filter((r) => r.temp !== null).map((r) => r.temp!), g.tempLow, g.tempHigh),
      both: { n, inBand: inBoth },
      checked: mChecked,
      breaches: mBreaches,
      swingDays: new Set([...days].filter((d) => d.startsWith(m))).size,
    }
  })
  return {
    readings: rs.length,
    first: rs.length ? rs[0].t : null,
    last: rs.length ? rs[rs.length - 1].t : null,
    interval,
    gaps: gapsOf(rs, interval),
    rh: { ...rh, over65: rhValues.filter((v) => v > 65).length, over70: rhValues.filter((v) => v > 70).length },
    temp,
    both: { n: bothN, inBand: bothIn },
    swing: { checked, breaches, spells, days: [...days].sort(), worst },
    months,
  }
}

// --- The graph

export interface Bucket {
  from: number
  to: number
  tempMin: number | null
  tempMax: number | null
  rhMin: number | null
  rhMax: number | null
  breach: boolean
}

/** Readings gathered into equal stretches of time for drawing: each stretch's lowest and highest, and any breach. */
export function bucketsOf(all: Reading[], g: Guideline, from: number, to: number, count: number): Bucket[] {
  const figures = g.swing > 0 ? figuresOf(all, g.rule) : []
  const span = Math.max(1, to - from)
  const out: Bucket[] = Array.from({ length: count }, (_, k) => ({
    from: from + (span * k) / count,
    to: from + (span * (k + 1)) / count,
    tempMin: null,
    tempMax: null,
    rhMin: null,
    rhMax: null,
    breach: false,
  }))
  all.forEach((r, i) => {
    if (r.t < from || r.t > to) return
    const k = Math.min(count - 1, Math.floor(((r.t - from) / span) * count))
    const b = out[k]
    if (r.temp !== null) {
      b.tempMin = b.tempMin === null ? r.temp : Math.min(b.tempMin, r.temp)
      b.tempMax = b.tempMax === null ? r.temp : Math.max(b.tempMax, r.temp)
    }
    if (r.rh !== null) {
      b.rhMin = b.rhMin === null ? r.rh : Math.min(b.rhMin, r.rh)
      b.rhMax = b.rhMax === null ? r.rh : Math.max(b.rhMax, r.rh)
    }
    const f = figures[i]
    if (f !== null && f !== undefined && f > g.swing + 1e-9) b.breach = true
  })
  return out
}

// --- Words and numbers

export function share(part: number, whole: number): string {
  if (!whole) return '—'
  const p = (100 * part) / whole
  if (part === whole) return '100%'
  if (part === 0) return '0%'
  // Never rounded up to 100% or down to 0% when it isn't.
  const r = Math.round(p * 10) / 10
  if (r >= 100) return '99.9%'
  if (r <= 0) return '0.1%'
  return `${r.toLocaleString('en-GB', { maximumFractionDigits: 1 })}%`
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32
}

export function guidelineText(g: Guideline, unit: 'C' | 'F'): string {
  const t = (c: number) => (unit === 'C' ? `${fmt(c)} °C` : `${fmt(cToF(c))} °F`)
  const swing =
    g.swing > 0
      ? g.rule === 'mean'
        ? `; no reading more than ${fmt(g.swing)} points from the average of the 24 hours up to it`
        : `; no more than ${fmt(g.swing)} points between the highest and lowest RH of any 24 hours`
      : ''
  return `RH ${fmt(g.rhLow)}–${fmt(g.rhHigh)}%, temperature ${t(g.tempLow)} to ${t(g.tempHigh)}${swing}`
}

export function fmt(n: number, digits = 1): string {
  return (Math.round(n * 10 ** digits) / 10 ** digits).toLocaleString('en-GB', { maximumFractionDigits: digits })
}

// --- Settings, saved

export const STORAGE_KEY = 'labs:collection-climate'

export interface Settings {
  guideline: Guideline
  unit: 'C' | 'F'
}

export function validGuideline(x: unknown): x is Guideline {
  if (!x || typeof x !== 'object') return false
  const g = x as Record<string, unknown>
  const num = (v: unknown, lo: number, hi: number) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi
  return (
    (g.kind === 'bizot2023' || g.kind === 'own') &&
    num(g.rhLow, 0, 100) &&
    num(g.rhHigh, 0, 100) &&
    (g.rhLow as number) <= (g.rhHigh as number) &&
    num(g.tempLow, -50, 60) &&
    num(g.tempHigh, -50, 60) &&
    (g.tempLow as number) <= (g.tempHigh as number) &&
    num(g.swing, 0, 100) &&
    (g.rule === 'mean' || g.rule === 'range')
  )
}

export function restoreSettings(text: string | null | undefined): Settings | null {
  if (!text) return null
  try {
    const v = JSON.parse(text)
    if (v?.v !== 1 || !validGuideline(v.guideline) || (v.unit !== 'C' && v.unit !== 'F')) return null
    return { guideline: v.guideline, unit: v.unit }
  } catch {
    return null
  }
}

export function saveSettings(s: Settings): string {
  return JSON.stringify({ v: 1, guideline: s.guideline, unit: s.unit })
}

// --- Tables to download

function cell(s: string): string {
  const v = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

const num = (v: number | null, d = 1) => (v === null ? '' : String(Math.round(v * 10 ** d) / 10 ** d))
// As on the page, a share is 100 or 0 only when it is exactly.
const pct = (a: number, b: number) => (b ? String(a === b ? 100 : a === 0 ? 0 : Math.min(99.9, Math.max(0.1, Math.round((1000 * a) / b) / 10))) : '')

const stamp = (t: number) => new Date(t * 1000).toISOString().slice(0, 16).replace('T', ' ')
const day = (t: number) => new Date(t * 1000).toISOString().slice(0, 10)

/**
 * Every place's figures, and each month's, as a spreadsheet, temperatures in °C: the guideline and the period on
 * the first lines, each row's first and last readings, and the 24-hour limit's figures blank where no reading could
 * be checked (no RH, or under 24 hours of readings), as the page says "not checked".
 */
export function toCsv(places: { name: string; report: Report }[], g: Guideline, period: { from: number | null; to: number | null } = { from: null, to: null }): string {
  const head = ['Place', 'Month', 'Readings', 'First reading', 'Last reading', 'RH in band %', 'RH above %', 'RH below %', 'RH lowest', 'RH highest', 'RH average', 'Temperature in band %', 'Temperature lowest °C', 'Temperature highest °C', 'Temperature average °C', 'Both in band %', 'RH above 65% (readings)', 'RH above 70% (readings)', 'Readings checked against the 24-hour limit', '24-hour limit broken (readings)', 'Days the 24-hour limit was broken', 'Gaps in the record']
  const said = period.from === null && period.to === null ? 'every reading in the files' : `${period.from === null ? 'the first reading' : day(period.from)} to ${period.to === null ? 'the last reading' : day(period.to)}`
  const lines = [cell(`Guideline: ${guidelineText(g, 'C')}`), cell(`Period: ${said}`), head.map(cell).join(',')]
  const limit = (checked: number, broken: number, days: number) => (g.swing > 0 && checked ? [String(checked), String(broken), String(days)] : [String(checked), '', ''])
  for (const { name, report: r } of places) {
    lines.push(
      [name, 'All', String(r.readings), r.first === null ? '' : stamp(r.first), r.last === null ? '' : stamp(r.last), pct(r.rh.inBand, r.rh.n), pct(r.rh.above, r.rh.n), pct(r.rh.below, r.rh.n), num(r.rh.min), num(r.rh.max), num(r.rh.mean), pct(r.temp.inBand, r.temp.n), num(r.temp.min), num(r.temp.max), num(r.temp.mean), pct(r.both.inBand, r.both.n), String(r.rh.over65), String(r.rh.over70), ...limit(r.swing.checked, r.swing.breaches, r.swing.days.length), String(r.gaps.length)]
        .map((v, i) => (i === 0 ? cell(v) : v))
        .join(','),
    )
    for (const m of r.months) {
      lines.push(
        [name, m.month, String(m.readings), stamp(m.first), stamp(m.last), pct(m.rh.inBand, m.rh.n), pct(m.rh.above, m.rh.n), pct(m.rh.below, m.rh.n), num(m.rh.min), num(m.rh.max), num(m.rh.mean), pct(m.temp.inBand, m.temp.n), num(m.temp.min), num(m.temp.max), num(m.temp.mean), pct(m.both.inBand, m.both.n), String(m.rh.over65), String(m.rh.over70), ...limit(m.checked, m.breaches, m.swingDays), '']
          .map((v, i) => (i === 0 ? cell(v) : v))
          .join(','),
      )
    }
  }
  return `\ufeff${lines.join('\r\n')}\r\n`
}
