/**
 * Frost Dates' climate math. The input is a run of daily minimum temperatures
 * (°C, local days) from a weather archive. The year is split at its warmest
 * point, so each "season" holds one whole frost season: an autumn, a winter,
 * and the spring after it, in either hemisphere. From the 30 most recent whole
 * seasons come the odds of a frost after a spring date or before an autumn
 * one, the frost-free season, and every frost night for the chart.
 */

export interface Series {
  /** Day number (days since 1970-01-01) of the first value. */
  start: number
  /** Daily minimum temperature in °C, or null where missing. */
  values: (number | null)[]
}

const DAY = 86_400_000
export const dayNumber = (y: number, m: number, d: number) => Math.round(Date.UTC(y, m - 1, d) / DAY)
export const fromISO = (iso: string) => dayNumber(+iso.slice(0, 4), +iso.slice(5, 7), +iso.slice(8, 10))
export const toISO = (day: number) => new Date(day * DAY).toISOString().slice(0, 10)
const parts = (day: number) => {
  const d = new Date(day * DAY)
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }
}
const leap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

/** Day of the year on a 365-day calendar (1–365): February 29 counts as the 28th. */
export function dayOfYear(day: number): number {
  const { y, m, d } = parts(day)
  const n = day - dayNumber(y, 1, 1) + 1
  return leap(y) && (m > 2 || (m === 2 && d === 29)) ? n - 1 : n
}

/**
 * Days from a season's start to a day on a 365-day calendar: February 29
 * counts as the 28th, so dates in leap years line up with the rest when
 * they're compared and shown as calendar dates.
 */
export function calendarOffset(start: number, day: number): number {
  let offset = day - start
  for (let y = parts(start).y; y <= parts(day).y; y++) {
    const feb29 = dayNumber(y, 2, 29)
    if (leap(y) && feb29 > start && feb29 <= day) offset--
  }
  return offset
}

/** Reads an Open-Meteo archive answer, dropping missing days at the end (the most recent days aren't in yet). */
export function readArchive(json: unknown): Series | null {
  const daily = (json as { daily?: { time?: unknown; temperature_2m_min?: unknown } } | null)?.daily
  if (!daily || !Array.isArray(daily.time) || !Array.isArray(daily.temperature_2m_min) || daily.time.length !== daily.temperature_2m_min.length || !daily.time.length) return null
  if (typeof daily.time[0] !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(daily.time[0])) return null
  const values = daily.temperature_2m_min.map((v) => (typeof v === 'number' && Number.isFinite(v) ? v : null))
  while (values.length && values[values.length - 1] === null) values.pop()
  return values.length ? { start: fromISO(daily.time[0]), values } : null
}

/**
 * The month the frost season starts: the first of the month nearest the
 * warmest point of the year, found from the average daily low smoothed over
 * a month.
 */
export function splitMonth(series: Series): number {
  const sum = new Array<number>(366).fill(0)
  const count = new Array<number>(366).fill(0)
  series.values.forEach((v, i) => {
    if (v === null) return
    const doy = dayOfYear(series.start + i)
    sum[doy] += v
    count[doy]++
  })
  let best = 1
  let bestMean = -Infinity
  for (let doy = 1; doy <= 365; doy++) {
    let s = 0
    let c = 0
    for (let k = -15; k <= 15; k++) {
      const j = ((doy - 1 + k + 365) % 365) + 1
      s += sum[j]
      c += count[j]
    }
    if (c && s / c > bestMean) {
      bestMean = s / c
      best = doy
    }
  }
  // Nearest first of the month, on a non-leap calendar.
  const date = parts(dayNumber(2001, 1, 1) + best - 1)
  const shift = date.d > 15 ? 1 : 0
  return ((date.m - 1 + shift) % 12) + 1
}

export interface Season {
  /** "2024–25" when the frost season spans two calendar years, otherwise "2025". */
  label: string
  start: number
  /** The day after the season's last day. */
  end: number
  /** Runs of consecutive frost nights, as [first day, last day], each coldest value included. */
  runs: { from: number; to: number; coldest: number }[]
  first: number | null
  last: number | null
  /** False for the season still under way. */
  complete: boolean
}

export interface Analysis {
  month: number
  seasons: Season[]
  current: Season | null
  frostSeasons: number
  /** Offsets in days from the season start, for the dates at each risk level; null when frost is too rare to say. */
  lastSpring: { typical: number | null; cautious: number | null }
  firstAutumn: { typical: number | null; cautious: number | null }
  /** Median length of the frost-free stretch around midsummer, in days (365 or more means frost-free in most years). */
  frostFree: number | null
  nightsPerSeason: number
  coldest: { value: number; day: number } | null
  /** The last day with data. */
  dataEnd: number
}

export const YEARS = 30

/** Splits the record into frost seasons and works out the odds, with frost at or below `threshold` °C. */
export function analyze(series: Series, threshold: number): Analysis | null {
  const month = splitMonth(series)
  const dataEnd = series.start + series.values.length - 1
  const at = (day: number) => series.values[day - series.start] ?? null
  const first = parts(series.start)
  const seasons: Season[] = []
  let current: Season | null = null
  let coldest: Analysis['coldest'] = null
  // Season starts from the first one fully inside the data.
  let y = first.y + (dayNumber(first.y, month, 1) < series.start ? 1 : 0)
  for (; ; y++) {
    const start = dayNumber(y, month, 1)
    if (start > dataEnd) break
    const end = dayNumber(y + 1, month, 1)
    const runs: Season['runs'] = []
    for (let day = start; day < end && day <= dataEnd; day++) {
      const v = at(day)
      if (v === null || v > threshold) continue
      const run = runs[runs.length - 1]
      if (run && run.to === day - 1) {
        run.to = day
        run.coldest = Math.min(run.coldest, v)
      } else runs.push({ from: day, to: day, coldest: v })
    }
    const complete = end - 1 <= dataEnd
    // A season starting by April (southern hemisphere) has its frost within one calendar year.
    const label = month <= 4 ? String(y) : `${y}–${String((y + 1) % 100).padStart(2, '0')}`
    const season: Season = { label, start, end, runs, first: runs[0]?.from ?? null, last: runs[runs.length - 1]?.to ?? null, complete }
    if (complete) seasons.push(season)
    else current = season
  }
  const recent = seasons.slice(-YEARS)
  if (recent.length < 10) return null
  for (const s of recent.concat(current ?? [])) {
    for (let day = s.start; day < s.end && day <= dataEnd; day++) {
      const v = at(day)
      if (v !== null && (!coldest || v < coldest.value)) coldest = { value: v, day }
    }
  }

  const n = recent.length
  const frostSeasons = recent.filter((s) => s.first !== null).length
  // Seasons without frost count as a last frost before any date and a first frost after any date.
  const lasts = recent.map((s) => (s.last === null ? -1 : calendarOffset(s.start, s.last))).sort((a, b) => a - b)
  const firsts = recent.map((s) => (s.first === null ? Infinity : calendarOffset(s.start, s.first))).sort((a, b) => a - b)
  /** The spring date by which the last frost has passed in a share `p` of seasons. */
  const springBy = (p: number) => {
    const v = lasts[Math.ceil(p * n) - 1]
    return v < 0 ? null : v
  }
  /** The autumn date by which the first frost has come in a share `p` of seasons. */
  const autumnBy = (p: number) => {
    const v = firsts[Math.ceil(p * n) - 1]
    return Number.isFinite(v) ? v : null
  }

  // The frost-free stretch around each midsummer: from the last frost before a season start to the first frost after it.
  const stretches: number[] = []
  for (let i = 0; i + 1 < recent.length; i++) {
    const before = recent[i].last
    const after = recent[i + 1].first
    stretches.push(before === null || after === null ? 366 : after - before - 1)
  }
  stretches.sort((a, b) => a - b)
  const frostFree = stretches.length ? stretches[Math.floor((stretches.length - 1) / 2)] : null
  const nights = recent.reduce((sum, s) => sum + s.runs.reduce((k, r) => k + r.to - r.from + 1, 0), 0)

  return {
    month,
    seasons: recent,
    current,
    frostSeasons,
    lastSpring: { typical: springBy(0.5), cautious: springBy(0.9) },
    firstAutumn: { typical: autumnBy(0.5), cautious: autumnBy(0.1) },
    frostFree,
    nightsPerSeason: nights / n,
    coldest,
    dataEnd,
  }
}

/** A season offset as a calendar date in a non-leap year, for formatting as "Apr 9". */
export const offsetDate = (month: number, offset: number) => new Date((dayNumber(2001, month, 1) + offset) * DAY)

export type Threshold = 'frost' | 'freeze' | 'light'

/** Frost at 0°C (32°F); a hard freeze at 28°F; and 36°F, when frost can still form on plants on a clear, still night. */
export const THRESHOLDS: Record<Threshold, { c: number; f: number; label: string; hint: string }> = {
  frost: { c: 0, f: 32, label: 'Frost', hint: 'Damages tender plants like tomatoes, peppers, and basil.' },
  light: { c: (36 - 32) / 1.8, f: 36, label: 'Light frost', hint: 'On clear, still nights frost can form on leaves even at this air temperature.' },
  freeze: { c: (28 - 32) / 1.8, f: 28, label: 'Hard freeze', hint: 'Damages most hardier plants too.' },
}

export type Units = 'C' | 'F'
export function defaultUnits(locale: string): Units {
  try {
    const region = new Intl.Locale(locale).maximize().region
    return region && ['US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW'].includes(region) ? 'F' : 'C'
  } catch {
    return 'C'
  }
}
export const degrees = (c: number, units: Units) => (units === 'C' ? `${Math.round(c)}°C` : `${Math.round(c * 1.8 + 32)}°F`)

/** Planting rules of thumb in weeks from the last spring frost: negative is before it. */
export interface Crop {
  name: string
  /** Start indoors, as a window of weeks. */
  indoors?: [number, number]
  /** Sow outdoors. */
  sow?: [number, number]
  /** Plant out seedlings or sets. */
  plant?: [number, number]
}

export const CROPS: Crop[] = [
  { name: 'Peas', sow: [-6, -4] },
  { name: 'Spinach', sow: [-6, -4] },
  { name: 'Onion sets', plant: [-4, -2] },
  { name: 'Lettuce', sow: [-4, -2] },
  { name: 'Potatoes', plant: [-3, -1] },
  { name: 'Carrots', sow: [-3, -1] },
  { name: 'Broccoli and cabbage', indoors: [-9, -7], plant: [-3, -1] },
  { name: 'Tomatoes', indoors: [-8, -6], plant: [1, 2] },
  { name: 'Peppers', indoors: [-10, -8], plant: [2, 3] },
  { name: 'Basil', indoors: [-6, -4], plant: [1, 2] },
  { name: 'Beans', sow: [1, 2] },
  { name: 'Squash and cucumbers', sow: [1, 2] },
  { name: 'Sweet corn', sow: [1, 2] },
]
