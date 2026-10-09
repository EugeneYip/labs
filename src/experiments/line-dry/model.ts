/**
 * Line Dry's forecast reading. Drying power is the FAO reference
 * evapotranspiration (ET0): how many millimeters of water an hour of this
 * weather would evaporate. It already combines sun, warmth, dry air, and
 * wind, which are what dry washing. A load is dry once enough has
 * evaporated; rain, or a likely shower, stops it.
 */

export interface Hour {
  /** Local time at the place, like 2026-10-09T14:00. */
  time: string
  temp: number
  humidity: number
  rainChance: number
  rain: number
  wind: number
  et0: number
  isDay: boolean
}

export interface Day {
  date: string
  sunrise: string | null
  sunset: string | null
  hours: Hour[]
}

export type Load = 'light' | 'heavy'

/** Millimeters of evaporation a load needs: shirts and sheets, or towels and jeans. */
export const NEED: Record<Load, number> = { light: 0.8, heavy: 1.6 }

/** Rain that counts as a stop: measurable rain, or an even chance of it. */
export const wet = (h: Hour) => h.rain >= 0.1 || h.rainChance >= 50
/** A shower possible but less likely: worth a warning, and it slows drying odds. */
export const risky = (h: Hour) => !wet(h) && h.rainChance >= 30

/** Hours as numbers: minutes since midnight of the first day, so times can be compared and added. */
export function minutes(time: string, firstDate: string): number {
  const day = (Date.UTC(+time.slice(0, 4), +time.slice(5, 7) - 1, +time.slice(8, 10)) - Date.UTC(+firstDate.slice(0, 4), +firstDate.slice(5, 7) - 1, +firstDate.slice(8, 10))) / 86_400_000
  return day * 1440 + +time.slice(11, 13) * 60 + +time.slice(14, 16)
}

export interface Plan {
  /** When to hang it out and when it should be dry, in minutes since midnight of the day. */
  start: number
  end: number
  /** Shower chances along the way worth mentioning. */
  showers: Hour[]
}

export type Verdict = 'great' | 'good' | 'slow' | 'no'

export interface DayResult {
  day: Day
  plan: Plan | null
  verdict: Verdict
  /** Why there's no plan, when there isn't one. */
  reason?: 'rain' | 'slow' | 'past'
  /** First wet hour during daylight, if any. */
  firstRain?: Hour
}

/**
 * When to hang it out so it's dry soonest, starting no earlier than an hour
 * before sunrise (or now, for today). Of starts that finish within 20 minutes
 * of the soonest, the latest wins: no point leaving washing out longer than
 * needed. Drying counts until an hour after sunset; a wet hour before the
 * load is dry rules a start out.
 */
export function bestPlan(day: Day, need: number, earliest = 0): Plan | null {
  const sunrise = day.sunrise ? minutes(day.sunrise, day.date) : 6 * 60
  const sunset = day.sunset ? minutes(day.sunset, day.date) : 20 * 60
  const until = sunset + 60
  const hours = day.hours.map((h) => ({ h, at: minutes(h.time, day.date) }))
  const plans: Plan[] = []
  for (const { at: hourStart } of hours) {
    const start = Math.max(hourStart, earliest, sunrise - 60)
    if (start >= hourStart + 60 || start > sunset - 60) continue
    let left = need
    let end: number | null = null
    const showers: Hour[] = []
    for (const { h, at } of hours) {
      if (at + 60 <= start) continue
      if (at >= until) break
      if (wet(h)) break
      if (risky(h)) showers.push(h)
      const from = Math.max(at, start)
      const usable = (Math.min(at + 60, until) - from) / 60
      const power = Math.max(0, h.et0)
      const done = power * usable
      // A little slack, so sums like 0.2 + 0.2 + 0.2 + 0.2 still reach 0.8.
      if (done >= left - 1e-9) {
        end = from + Math.min(usable * 60, (left / power) * 60)
        break
      }
      left -= done
    }
    if (end !== null) plans.push({ start, end, showers })
  }
  if (!plans.length) return null
  const soonest = Math.min(...plans.map((p) => p.end))
  return plans.filter((p) => p.end <= soonest + 20).reduce((a, b) => (b.start > a.start ? b : a))
}

const LIMITS: Record<Load, [great: number, good: number, slow: number]> = { light: [3, 5, 8], heavy: [4, 7, 10] }

export function judge(day: Day, load: Load, earliest = 0): DayResult {
  const plan = bestPlan(day, NEED[load], earliest)
  const sunrise = day.sunrise ? minutes(day.sunrise, day.date) : 6 * 60
  const sunset = day.sunset ? minutes(day.sunset, day.date) : 20 * 60
  const firstRain = day.hours.find((h) => {
    const at = minutes(h.time, day.date)
    return wet(h) && at + 60 > Math.max(sunrise, earliest) && at < sunset
  })
  if (!plan) {
    const past = earliest > sunset - 60
    return { day, plan, verdict: 'no', reason: past ? 'past' : firstRain ? 'rain' : 'slow', firstRain }
  }
  const hours = Math.round(plan.end - plan.start) / 60
  const [great, good, slow] = LIMITS[load]
  const verdict: Verdict = hours <= great ? 'great' : hours <= good ? 'good' : hours <= slow ? 'slow' : 'no'
  return verdict === 'no' ? { day, plan: null, verdict, reason: 'slow', firstRain } : { day, plan, verdict, firstRain }
}

// Reading Open-Meteo's answer.

interface Forecast {
  utc_offset_seconds: number
  hourly: Record<'time' | 'temperature_2m' | 'relative_humidity_2m' | 'precipitation_probability' | 'precipitation' | 'wind_speed_10m' | 'et0_fao_evapotranspiration' | 'is_day', unknown[]>
  daily: { time: string[]; sunrise: (string | null)[]; sunset: (string | null)[] }
}

export const HOURLY = 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,et0_fao_evapotranspiration,is_day'

/** Days of hourly weather, or null when the answer isn't shaped as expected. */
export function readForecast(data: unknown): { days: Day[]; offset: number } | null {
  const f = data as Forecast
  if (!f || !f.hourly || !f.daily || !Array.isArray(f.hourly.time) || !Array.isArray(f.daily.time)) return null
  const n = (list: unknown[] | undefined, i: number) => (typeof list?.[i] === 'number' ? (list[i] as number) : 0)
  const days: Day[] = f.daily.time.map((date, i) => ({ date, sunrise: f.daily.sunrise?.[i] ?? null, sunset: f.daily.sunset?.[i] ?? null, hours: [] }))
  const byDate = new Map(days.map((d) => [d.date, d]))
  f.hourly.time.forEach((time, i) => {
    if (typeof time !== 'string') return
    byDate.get(time.slice(0, 10))?.hours.push({
      time,
      temp: n(f.hourly.temperature_2m, i),
      humidity: n(f.hourly.relative_humidity_2m, i),
      rainChance: n(f.hourly.precipitation_probability, i),
      rain: n(f.hourly.precipitation, i),
      wind: n(f.hourly.wind_speed_10m, i),
      et0: n(f.hourly.et0_fao_evapotranspiration, i),
      isDay: f.hourly.is_day?.[i] === 1,
    })
  })
  return { days: days.filter((d) => d.hours.length), offset: typeof f.utc_offset_seconds === 'number' ? f.utc_offset_seconds : 0 }
}

/** The place's own date and time now, in the forecast's format, from its offset from UTC. */
export function localNow(offsetSeconds: number, now = Date.now()): { date: string; minutes: number } {
  const t = new Date(now + offsetSeconds * 1000)
  const date = t.toISOString().slice(0, 10)
  return { date, minutes: t.getUTCHours() * 60 + t.getUTCMinutes() }
}

/** Fahrenheit and miles per hour where those are the everyday units. */
export function defaultUnits(locale: string): 'metric' | 'us' {
  try {
    const region = new Intl.Locale(locale).maximize().region
    return region && ['US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW', 'PR', 'GU'].includes(region) ? 'us' : 'metric'
  } catch {
    return 'metric'
  }
}
