import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { defaultUnits, dryBy, HOURLY, judge, localNow, minutes, readForecast, risky, wet, type Day, type DayResult, type Hour, type Load } from './model.ts'

// The chosen place and load type. The forecast itself is fetched fresh.
const STORAGE_KEY = 'labs:line-dry'
/** A request that stalls (a weak signal, a captive Wi-Fi page) gives up after this long, so Try again appears. */
const timeout = (ms: number) => (typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(ms) : undefined)

interface Place {
  name: string
  detail: string
  lat: number
  lon: number
}

interface Forecast {
  days: Day[]
  offset: number
  fetchedAt: number
}

const field = 'h-11 w-full min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:h-10 sm:text-sm'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const outline = `${button} border border-rule hover:bg-ink/5`

const VERDICTS = {
  great: { label: 'Great drying', dot: 'bg-emerald-600 dark:bg-emerald-400' },
  good: { label: 'Good drying', dot: 'bg-emerald-600/60 dark:bg-emerald-400/60' },
  slow: { label: 'Slow drying', dot: 'bg-amber-500' },
  no: { label: 'Dry it indoors', dot: 'bg-stone-400' },
} as const

/** Experiment #011: the best hours in the week ahead to dry washing outside. */
export default function LineDry() {
  const [saved, setSaved] = useState(load)
  const units = useMemo(() => defaultUnits(navigator.language), [])
  const [forecast, setForecast] = useState<Forecast | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const request = useRef(0)
  const fetchedAt = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      // Private browsing or full storage: the place just won't be remembered.
    }
  }, [saved])

  const fetchForecast = useCallback(
    async (place: Place) => {
      const id = ++request.current
      setStatus('loading')
      try {
        const params = new URLSearchParams({ latitude: place.lat.toFixed(2), longitude: place.lon.toFixed(2), hourly: HOURLY, daily: 'sunrise,sunset', timezone: 'auto', forecast_days: '7' })
        if (units === 'us') {
          params.set('temperature_unit', 'fahrenheit')
          params.set('wind_speed_unit', 'mph')
        }
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: timeout(20_000) })
        if (!response.ok) throw new Error(String(response.status))
        const read = readForecast(await response.json())
        if (!read || !read.days.length) throw new Error('Unexpected forecast')
        if (id !== request.current) return
        fetchedAt.current = Date.now()
        setForecast({ ...read, fetchedAt: fetchedAt.current })
        setStatus('idle')
      } catch {
        if (id === request.current) setStatus('error')
      }
    },
    [units],
  )

  // Fetch for the saved place, and again when the page comes back after an hour or more.
  useEffect(() => {
    if (!saved.place) return
    const place = saved.place
    void fetchForecast(place)
    const onVisible = () => {
      if (document.visibilityState === 'visible' && fetchedAt.current && Date.now() - fetchedAt.current > 3_600_000) void fetchForecast(place)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [saved.place, fetchForecast])

  const choose = (place: Place) => {
    setForecast(null)
    setSaved((s) => ({ ...s, place }))
  }

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="text-pretty text-dim">
          Find the best time this week to dry washing outside. Line Dry reads the forecast for sun, warmth, dry air, wind, and rain, and
          tells you when to hang it out so it’s dry soonest, before the rain comes or the day ends.
        </p>

        <PlacePicker place={saved.place} onChoose={choose} />

        <fieldset className="mt-5">
          <legend className="mb-1.5 text-sm font-medium">What’s in the wash</legend>
          <div className="flex w-fit rounded-lg border border-rule p-0.5">
            {(
              [
                ['light', 'Shirts and sheets'],
                ['heavy', 'Towels and jeans'],
              ] as [Load, string][]
            ).map(([v, text]) => (
              <label key={v} className="cursor-pointer">
                <input type="radio" name="load" checked={saved.load === v} onChange={() => setSaved((s) => ({ ...s, load: v }))} className="peer sr-only" />
                <span className="inline-flex h-10 items-center rounded-md px-3 text-sm whitespace-nowrap transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:h-9">
                  {text}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div aria-live="polite" className="mt-8">
          {!saved.place ? null : status === 'error' ? (
            <div className="rounded-xl border border-rule p-5">
              <p className="font-medium">Couldn’t get the forecast</p>
              <p className="mt-1 text-sm text-dim">Check your connection and try again.</p>
              <button type="button" onClick={() => void fetchForecast(saved.place!)} className={`${outline} mt-3`}>
                Try again
              </button>
            </div>
          ) : !forecast ? (
            <p className="text-sm text-dim">Getting the forecast for {saved.place.name}…</p>
          ) : (
            <Week forecast={forecast} load={saved.load} units={units} />
          )}
        </div>

        <p className="mt-12 text-sm text-pretty text-dim">
          Drying times are rough guides from the forecast’s evaporation, rain, and daylight. They assume washing hung in the sun and
          the breeze; thick fabric, a crowded line, or shade make it slower. Check the sky too. The place you pick is sent to
          Open-Meteo for the forecast, rounded to about a kilometer. Weather data by{' '}
          <a href="https://open-meteo.com/" className="underline underline-offset-4 hover:text-ink" rel="noreferrer">
            Open-Meteo.com
          </a>{' '}
          (
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-4 hover:text-ink" rel="noreferrer">
            CC BY 4.0
          </a>
          ).
        </p>
      </div>
    </div>
  )
}

function PlacePicker({ place, onChoose }: { place: Place | null; onChoose: (place: Place) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[] | 'failed' | null>(null)
  const [note, setNote] = useState('')
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults(null)
      return
    }
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ name: q, count: '6', language: 'en', format: 'json' })
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal: timeout(15_000) })
        if (!response.ok) throw new Error(String(response.status))
        const data = await response.json()
        if (cancelled) return
        const list: Place[] = (Array.isArray(data?.results) ? data.results : [])
          .filter((r: Record<string, unknown>) => typeof r.latitude === 'number' && typeof r.longitude === 'number' && typeof r.name === 'string')
          .map((r: Record<string, string | number>) => ({ name: String(r.name), detail: [r.admin1, r.country].filter(Boolean).join(', '), lat: Number(r.latitude), lon: Number(r.longitude) }))
        setResults(list)
      } catch {
        if (!cancelled) setResults('failed')
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  const pick = (p: Place) => {
    setQuery('')
    setResults(null)
    setNote('')
    onChoose(p)
  }

  const locate = () => {
    if (!navigator.geolocation) return setNote('This browser can’t share its location. Search for a town instead.')
    setLocating(true)
    setNote('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        pick({ name: 'Your location', detail: 'From this device, rounded to about a kilometer', lat: Math.round(pos.coords.latitude * 100) / 100, lon: Math.round(pos.coords.longitude * 100) / 100 })
      },
      () => {
        setLocating(false)
        setNote('Location wasn’t shared. Search for a town instead.')
      },
      { maximumAge: 600_000, timeout: 15_000 },
    )
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid min-w-0 flex-1 basis-56 gap-1.5">
          <span className="text-sm font-medium">{place ? 'Change place' : 'Where’s your washing line?'}</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a town or city" autoComplete="off" className={field} aria-describedby={place ? 'current-place' : undefined} />
        </label>
        <button type="button" onClick={locate} disabled={locating} className={`${outline} disabled:opacity-60`}>
          {locating ? 'Finding you…' : 'Use my location'}
        </button>
      </div>
      {results && (
        <ul className="mt-2 divide-y divide-rule rounded-lg border border-rule" aria-label="Places">
          {results === 'failed' ? (
            <li className="px-3 py-2.5 text-sm text-dim">Couldn’t search for places. Check your connection, or use your location.</li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-dim">No places found.</li>
          ) : (
            results.map((r) => (
              <li key={`${r.lat},${r.lon}`}>
                <button type="button" onClick={() => pick(r)} className="flex w-full cursor-pointer flex-col items-start px-3 py-2.5 text-left hover:bg-ink/5">
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-dim">{r.detail}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {note && <p className="mt-2 text-sm text-dim">{note}</p>}
      {place && !results && (
        <p id="current-place" className="mt-2 text-sm text-dim">
          Showing <span className="font-medium text-ink">{place.name}</span>
          {place.detail && `, ${place.detail}`}
        </p>
      )}
    </div>
  )
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })
const hourFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', timeZone: 'UTC' })
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'long', timeZone: 'UTC' })
const at = (date: string, mins: number) => Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10), 0, Math.round(mins))
const twelveHour = hourFormat.resolvedOptions().hourCycle?.startsWith('h1') ?? false
/** Times on the place's own clock, which may differ from this device's: "4 PM" or "4:15 PM", or "16:00" on a 24-hour clock. */
const clock = (date: string, mins: number) => (twelveHour && Math.round(mins) % 60 === 0 ? hourFormat : timeFormat).format(at(date, mins))

function Week({ forecast, load, units }: { forecast: Forecast; load: Load; units: 'metric' | 'us' }) {
  const now = localNow(forecast.offset)
  const days = forecast.days.filter((d) => d.date >= now.date)
  const results = days.map((d) => judge(d, load, d.date === now.date ? Math.ceil(now.minutes / 5) * 5 : 0))
  const scale = Math.max(0.3, ...days.flatMap((d) => d.hours.map((h) => h.et0)))
  const [today, ...rest] = results
  if (!today) return <p className="text-sm text-dim">No forecast for the days ahead.</p>
  return (
    <>
      <section aria-labelledby="today-heading" className="rounded-2xl border border-rule p-4 sm:p-6">
        <h2 id="today-heading" className="font-mono text-xs tracking-widest text-dim uppercase">
          Today
        </h2>
        <Summary result={today} isToday nowMinutes={now.minutes} large />
        <HourChart result={today} scale={scale} units={units} nowMinutes={now.minutes} />
      </section>
      {rest.length > 0 && (
        <section aria-labelledby="week-heading" className="mt-8">
          <h2 id="week-heading" className="font-mono text-xs tracking-widest text-dim uppercase">
            The week ahead
          </h2>
          <ul className="mt-2 divide-y divide-rule border-y border-rule">
            {rest.map((r) => (
              <li key={r.day.date} className="py-4">
                <p className="text-sm font-medium">{dayFormat.format(at(r.day.date, 0))}</p>
                <Summary result={r} />
                <HourChart result={r} scale={scale} units={units} compact />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function Summary({ result, isToday, nowMinutes, large }: { result: DayResult; isToday?: boolean; nowMinutes?: number; large?: boolean }) {
  const { day, plan, verdict, reason, firstRain } = result
  const v = VERDICTS[verdict]
  let text: string
  if (plan) {
    const startsNow = isToday && nowMinutes !== undefined && plan.start - nowMinutes < 15
    // "By" because going out earlier is fine; it just won't dry much sooner. Rounded down to the half hour, as the estimate isn't finer.
    text = `${startsNow ? 'Hang it out now' : `Hang it out by ${clock(day.date, Math.floor(plan.start / 30) * 30)}`} and it should be dry ${dryBy(plan.end)}.`
    const shower = plan.showers[0]
    if (shower) text += ` There’s a ${shower.rainChance}% chance of a shower around ${clock(day.date, minutes(shower.time, day.date))}.`
  } else if (reason === 'past') text = 'There isn’t enough daylight left to dry a load today.'
  else if (reason === 'rain' && firstRain) text = `Rain is likely from ${clock(day.date, minutes(firstRain.time, day.date))}, with too few dry hours around it.`
  else text = 'Too damp or dull for washing to dry before dark.'
  return (
    <div className={large ? 'mt-2' : 'mt-1'}>
      <p className={`flex items-center gap-2 font-semibold tracking-tight ${large ? 'text-2xl' : 'text-base'}`}>
        <span className={`size-2.5 shrink-0 rounded-full ${v.dot}`} aria-hidden="true" />
        {v.label}
      </p>
      <p className={`mt-1 text-pretty ${large ? '' : 'text-sm'} text-dim`}>{text}</p>
    </div>
  )
}

/**
 * Drying power hour by hour across the daylight: taller bars dry faster, and
 * rain hours show as striped. The suggested time out is shaded behind.
 */
function HourChart({ result, scale, units, nowMinutes, compact }: { result: DayResult; scale: number; units: 'metric' | 'us'; nowMinutes?: number; compact?: boolean }) {
  const { day, plan } = result
  const [picked, setPicked] = useState<Hour | null>(null)
  const sunrise = day.sunrise ? minutes(day.sunrise, day.date) : 6 * 60
  const sunset = day.sunset ? minutes(day.sunset, day.date) : 20 * 60
  const first = Math.max(0, Math.floor(sunrise / 60) - 1)
  const last = Math.min(23, Math.ceil(sunset / 60))
  const hours = day.hours.filter((h) => {
    const hour = +h.time.slice(11, 13)
    return hour >= first && hour <= last
  })
  if (!hours.length) return null
  const span = (last - first + 1) * 60
  const x = (mins: number) => `${((mins - first * 60) / span) * 100}%`
  const tempUnit = units === 'us' ? '°F' : '°C'
  const windUnit = units === 'us' ? 'mph' : 'km/h'
  const describe = (h: Hour) =>
    `${hourFormat.format(at(day.date, minutes(h.time, day.date)))}: ${Math.round(h.temp)}${tempUnit}, ${Math.round(h.humidity)}% humidity, wind ${Math.round(h.wind)} ${windUnit}, ${h.rainChance}% chance of rain${wet(h) ? ', rain likely' : ''}`

  return (
    <div className={compact ? 'mt-3' : 'mt-5'}>
      <div className={`relative ${compact ? 'h-12' : 'h-28'}`}>
        {plan && <div className="absolute inset-y-0 rounded-md bg-ink/[0.07]" style={{ left: x(plan.start), width: `calc(${x(plan.end)} - ${x(plan.start)})` }} aria-hidden="true" />}
        {nowMinutes !== undefined && nowMinutes >= first * 60 && nowMinutes <= (last + 1) * 60 && (
          <div className="absolute inset-y-0 w-px bg-ink/50" style={{ left: x(nowMinutes) }} aria-hidden="true" />
        )}
        <div className="absolute inset-0 flex items-end">
          {hours.map((h) => {
            const isWet = wet(h)
            const height = isWet ? 100 : Math.max(3, Math.min(100, (h.et0 / scale) * 100))
            return (
              <button
                key={h.time}
                type="button"
                onClick={() => setPicked((p) => (p === h ? null : h))}
                onMouseEnter={() => !compact && setPicked(h)}
                aria-label={describe(h)}
                aria-pressed={picked === h}
                className="group flex h-full min-w-0 flex-1 cursor-pointer items-end px-px"
              >
                <span
                  className={`block w-full rounded-t-[3px] ${isWet ? 'bg-[repeating-linear-gradient(135deg,var(--color-dim)_0_2px,transparent_2px_5px)] opacity-60' : risky(h) ? 'bg-[#2a78d6]/55 dark:bg-[#3987e5]/55' : 'bg-[#2a78d6] dark:bg-[#3987e5]'} ${picked === h ? 'ring-2 ring-ink ring-offset-1 ring-offset-paper' : ''}`}
                  style={{ height: `${height}%` }}
                />
              </button>
            )
          })}
        </div>
      </div>
      <div className="relative mt-1 h-4 text-[11px] text-dim tabular-nums">
        {hours
          .filter((h) => +h.time.slice(11, 13) % 3 === 0)
          .map((h) => (
            <span key={h.time} className="absolute -translate-x-1/2 whitespace-nowrap first:translate-x-0" style={{ left: x(minutes(h.time, day.date) + 30) }}>
              {hourFormat.format(at(day.date, minutes(h.time, day.date)))}
            </span>
          ))}
      </div>
      {(!compact || picked) && (
        <p className={`text-sm text-dim ${compact ? 'mt-2' : 'mt-3 min-h-10'}`}>
          {picked ? describe(picked) : <>Taller bars dry faster; striped hours are rainy.{plan && ' The shaded stretch is the time to have it out.'}</>}
        </p>
      )}
    </div>
  )
}

function load(): { place: Place | null; load: Load } {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    const p = data?.place
    const place =
      p && typeof p.name === 'string' && Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180
        ? { name: p.name.slice(0, 80), detail: typeof p.detail === 'string' ? p.detail.slice(0, 120) : '', lat: p.lat, lon: p.lon }
        : null
    return { place, load: data?.load === 'heavy' ? 'heavy' : 'light' }
  } catch {
    return { place: null, load: 'light' }
  }
}
