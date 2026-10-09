import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dateText, offsetText, SeasonChart, SeasonTable } from './Chart.tsx'
import { analyze, CROPS, defaultUnits, degrees, readArchive, THRESHOLDS, toISO, YEARS, type Analysis, type Crop, type Series, type Threshold, type Units } from './model.ts'

// The chosen place and settings, plus the last place's records so a return visit is instant.
const STORAGE_KEY = 'labs:frost-dates'
const DATA_KEY = 'labs:frost-dates:data'
/** Records are fetched again after this long, to keep "this season so far" current. */
const STALE_DAYS = 3
const DAY = 86_400_000
const FIRST_YEAR = 1995

interface Place {
  name: string
  detail: string
  lat: number
  lon: number
}

interface Saved {
  place: Place | null
  threshold: Threshold
  units: Units
  anchor: 'typical' | 'cautious'
}

interface Records {
  key: string
  /** The UTC day the records were fetched. */
  fetched: number
  elevation: number | null
  series: Series
}

const field = 'h-11 w-full min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:h-10 sm:text-sm'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const outline = `${button} border border-rule hover:bg-ink/5`

const placeKey = (p: Place) => `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`
const today = () => Math.floor(Date.now() / DAY)

/** Experiment #017: frost dates for any place, from 30 years of weather records. */
export default function FrostDates() {
  const [saved, setSaved] = useState(load)
  const [records, setRecords] = useState<Records | null>(() => loadRecords(saved.place))
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'busy'>('idle')
  const request = useRef(0)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      // Private browsing or full storage: settings just won't be remembered.
    }
  }, [saved])

  const fetchRecords = useCallback(async (place: Place) => {
    const id = ++request.current
    setStatus('loading')
    try {
      const params = new URLSearchParams({
        latitude: place.lat.toFixed(2),
        longitude: place.lon.toFixed(2),
        start_date: `${FIRST_YEAR}-01-01`,
        // The newest day or two may not be in the archive yet.
        end_date: toISO(today() - 2),
        daily: 'temperature_2m_min',
        timezone: 'auto',
      })
      const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`)
      if (id !== request.current) return
      if (response.status === 429) return setStatus('busy')
      if (!response.ok) throw new Error(String(response.status))
      const json = await response.json()
      const series = readArchive(json)
      if (!series) throw new Error('No records')
      const next: Records = { key: placeKey(place), fetched: today(), elevation: typeof json.elevation === 'number' ? json.elevation : null, series }
      if (id !== request.current) return
      setRecords(next)
      setStatus('idle')
      saveRecords(next)
    } catch {
      if (id === request.current) setStatus('error')
    }
  }, [])

  // Fetch when the place changes, or when the saved records are a few days old.
  const place = saved.place
  const current = records && place && records.key === placeKey(place) ? records : null
  useEffect(() => {
    if (!place) return
    if (current && today() - current.fetched < STALE_DAYS) return
    void fetchRecords(place)
    // Only a change of place (or stale records on load) starts a fetch.
  }, [place?.lat, place?.lon, fetchRecords])

  const analysis = useMemo(() => (current ? analyze(current.series, THRESHOLDS[saved.threshold].c) : null), [current, saved.threshold])
  const change = (patch: Partial<Saved>) => setSaved((s) => ({ ...s, ...patch }))

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="max-w-prose text-pretty text-dim">
          When is it safe to plant out, and when does frost come back? Frost Dates looks at the last {YEARS} years of overnight lows for any place in the world and shows the odds of frost in spring and autumn, with a planting calendar built around them.
        </p>

        <PlacePicker place={place} onChoose={(p) => change({ place: p })} />

        <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-4">
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Count as frost</legend>
            <div className="flex flex-wrap gap-2">
              {(['light', 'frost', 'freeze'] as const).map((t) => (
                <button key={t} type="button" aria-pressed={saved.threshold === t} onClick={() => change({ threshold: t })} className={`${button} border ${saved.threshold === t ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`}>
                  {THRESHOLDS[t].label} <span className={saved.threshold === t ? 'opacity-75' : 'text-dim'}>{degrees(THRESHOLDS[t].c, saved.units)}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Units</legend>
            <div className="flex gap-2">
              {(['C', 'F'] as const).map((u) => (
                <button key={u} type="button" aria-pressed={saved.units === u} onClick={() => change({ units: u })} className={`${button} w-14 border ${saved.units === u ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`}>
                  °{u}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <p className="mt-2 text-sm text-dim">{THRESHOLDS[saved.threshold].hint}</p>

        <div className="mt-10" aria-live="polite">
          {!place ? null : status === 'loading' && !analysis ? (
            <p className="text-sm text-dim">Reading {YEARS} years of weather records for {place.name}…</p>
          ) : (status === 'error' || status === 'busy') && !analysis ? (
            <div className="rounded-xl border border-rule p-5">
              <p className="font-medium">{status === 'busy' ? 'The weather archive is busy' : 'Couldn’t get the weather records'}</p>
              <p className="mt-1 text-sm text-dim">{status === 'busy' ? 'It limits how many requests it answers. Try again in a while.' : 'Check your connection and try again.'}</p>
              <button type="button" onClick={() => void fetchRecords(place)} className={`${outline} mt-3`}>
                Try again
              </button>
            </div>
          ) : current && !analysis ? (
            <p className="text-sm text-dim">There aren’t enough records for this place to work out frost dates.</p>
          ) : analysis && current ? (
            <Results analysis={analysis} records={current} saved={saved} onAnchor={(anchor) => change({ anchor })} />
          ) : null}
        </div>

        <p className="mt-14 max-w-prose text-sm text-pretty text-dim">
          Frost here means a night when the air two meters above the ground fell to the chosen temperature, in a weather archive that covers the world in squares about 10 km across. Hollows, valleys, and open country often get frost earlier and later than this; city gardens and sheltered walls less often. The place you pick is sent to Open-Meteo, rounded to about a kilometer. Weather records by{' '}
          <a href="https://open-meteo.com/" className="underline underline-offset-4 hover:text-ink" rel="noreferrer">
            Open-Meteo.com
          </a>{' '}
          (
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-4 hover:text-ink" rel="noreferrer">
            CC BY 4.0
          </a>
          ), from the ERA5 and ERA5-Land reanalyses and ECMWF IFS; contains modified Copernicus Climate Change Service information. Dates are worked out on this page from the daily lows.
        </p>
      </div>
    </div>
  )
}

function Results({ analysis, records, saved, onAnchor }: { analysis: Analysis; records: Records; saved: Saved; onAnchor: (anchor: Saved['anchor']) => void }) {
  const { month, lastSpring, firstAutumn, frostSeasons, seasons } = analysis
  const n = seasons.length
  const threshold = THRESHOLDS[saved.threshold]
  const span = `${seasons[0].label.slice(0, 4)}–${toISO(analysis.dataEnd).slice(0, 4)}`
  const word = threshold.label.toLowerCase()

  return (
    <>
      {frostSeasons === 0 ? (
        <section aria-labelledby="summary-heading" className="rounded-2xl border border-rule p-5 sm:p-6">
          <h2 id="summary-heading" className="text-2xl font-semibold tracking-tight">
            No {word} in the last {n} years
          </h2>
          <p className="mt-2 text-dim">
            The lowest overnight temperature was {analysis.coldest ? `${degrees(analysis.coldest.value, saved.units)} on ${dateText(analysis.coldest.day)}, ${toISO(analysis.coldest.day).slice(0, 4)}` : 'not recorded'}. Planting times here depend on heat and rain more than frost.
          </p>
        </section>
      ) : (
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">
            Frost dates
          </h2>
          {frostSeasons < n / 2 && (
            <p className="mb-4 text-pretty">
              <span className="font-medium">{threshold.label} doesn’t come every year here:</span> {frostSeasons === 1 ? 'only 1' : frostSeasons} of the last {n} winters had any.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <Card title="Last frost in spring" typical={lastSpring.typical === null ? null : offsetText(month, lastSpring.typical)} typicalNote="in a typical year: half of springs have a later frost" cautious={lastSpring.cautious === null ? null : `By ${offsetText(month, lastSpring.cautious)} in 9 springs out of 10`} />
            <Card title="First frost in autumn" typical={firstAutumn.typical === null ? null : offsetText(month, firstAutumn.typical)} typicalNote="in a typical year: half of autumns have an earlier frost" cautious={firstAutumn.cautious === null ? null : `Not before ${offsetText(month, firstAutumn.cautious)} in 9 autumns out of 10`} />
            <Card
              title="Frost-free season"
              typical={analysis.frostFree === null ? null : analysis.frostFree >= 365 ? 'All year' : `${analysis.frostFree} days`}
              typicalNote={analysis.frostFree !== null && analysis.frostFree >= 365 ? 'in a typical year' : 'between last and first frost in a typical year'}
              cautious={nightsText(analysis.nightsPerSeason, word)}
            />
          </div>
          <SoFar analysis={analysis} units={saved.units} word={word} />
        </section>
      )}

      {frostSeasons > 0 && (
        <section aria-labelledby="chart-heading" className="mt-12">
          <h2 id="chart-heading" className="text-lg font-semibold tracking-tight">
            Every {word} night, {span}
          </h2>
          <p className="mt-1 mb-4 text-sm text-dim">
            Each row is one frost season, from the warmest part of the year to the next. Nights at or below {degrees(threshold.c, saved.units)} are marked.
          </p>
          <SeasonChart analysis={analysis} units={saved.units} />
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium">First and last frost in each season</summary>
            <div className="mt-3">
              <SeasonTable analysis={analysis} units={saved.units} />
            </div>
          </details>
        </section>
      )}

      <Planting analysis={analysis} anchor={saved.anchor} onAnchor={onAnchor} />

      <p className="mt-10 text-sm text-dim">
        Records to {dateText(analysis.dataEnd)}, {toISO(analysis.dataEnd).slice(0, 4)}
        {records.elevation !== null && `, for an elevation of ${saved.units === 'C' ? `${Math.round(records.elevation)} m` : `${Math.round(records.elevation / 0.3048)} ft`}`}.
      </p>
    </>
  )
}

function Card({ title, typical, typicalNote, cautious }: { title: string; typical: string | null; typicalNote: string; cautious: string | null }) {
  return (
    <div className="rounded-2xl border border-rule p-4 sm:p-5">
      <h3 className="text-sm font-medium text-dim">{title}</h3>
      {typical ? (
        <>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{typical}</p>
          <p className="text-sm text-dim">{typicalNote}</p>
        </>
      ) : (
        <p className="mt-1 text-lg font-medium">Not in most years</p>
      )}
      {cautious && <p className="mt-3 border-t border-rule pt-3 text-sm">{cautious}</p>}
    </div>
  )
}

/** The season under way: frost so far, or none yet. */
function SoFar({ analysis, units, word }: { analysis: Analysis; units: Units; word: string }) {
  const s = analysis.current
  if (!s) return null
  const runs = s.runs
  const coldest = runs.length ? Math.min(...runs.map((r) => r.coldest)) : null
  return (
    <p className="mt-4 text-sm text-pretty">
      <span className="font-medium">This season so far ({s.label}):</span>{' '}
      {runs.length === 0
        ? `no ${word} yet, to ${dateText(analysis.dataEnd)}.`
        : runs.length === 1 && runs[0].from === runs[0].to
          ? `one ${word} night, on ${dateText(runs[0].from)} (${degrees(coldest!, units)}).`
          : `first ${word} on ${dateText(s.first!)}, most recent on ${dateText(s.last!)}, coldest ${degrees(coldest!, units)}.`}
    </p>
  )
}

/** "About 93 frost nights a year", or for rare frost "About 4 frost nights in 10 years". */
function nightsText(perSeason: number, word: string): string {
  if (perSeason >= 0.95) {
    const n = Math.round(perSeason)
    return `About ${n} ${word} ${n === 1 ? 'night' : 'nights'} a year`
  }
  const tens = Math.max(1, Math.round(perSeason * 10))
  return `About ${tens} ${word} ${tens === 1 ? 'night' : 'nights'} in 10 years`
}

const WEEK = 7
function Planting({ analysis, anchor, onAnchor }: { analysis: Analysis; anchor: Saved['anchor']; onAnchor: (anchor: Saved['anchor']) => void }) {
  const { month, lastSpring } = analysis
  const base = anchor === 'cautious' ? lastSpring.cautious : lastSpring.typical
  if (lastSpring.typical === null || base === null) return null
  const range = ([a, b]: [number, number]) => `${offsetText(month, base + a * WEEK)} – ${offsetText(month, base + b * WEEK)}`
  const cell = (crop: Crop, key: 'indoors' | 'sow' | 'plant') => (crop[key] ? range(crop[key]) : <span className="text-dim">–</span>)

  return (
    <section aria-labelledby="planting-heading" className="mt-12">
      <h2 id="planting-heading" className="text-lg font-semibold tracking-tight">
        Planting calendar
      </h2>
      <p className="mt-1 text-sm text-pretty text-dim">Rules of thumb from seed packets and garden guides, counted in weeks from the last spring frost. Seed packets for your varieties have the final word.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Count from">
        {(
          [
            ['typical', `Typical last frost, ${offsetText(month, lastSpring.typical)}`],
            ['cautious', `9 years in 10, ${offsetText(month, lastSpring.cautious ?? lastSpring.typical)}`],
          ] as const
        ).map(([value, text]) => (
          <button key={value} type="button" aria-pressed={anchor === value} onClick={() => onAnchor(value)} className={`${button} border ${anchor === value ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`}>
            {text}
          </button>
        ))}
      </div>
      <ul className="mt-4 divide-y divide-rule border-y border-rule sm:hidden">
        {CROPS.map((crop) => (
          <li key={crop.name} className="py-2.5">
            <p className="text-sm font-medium">{crop.name}</p>
            <dl className="mt-0.5 grid grid-cols-[auto_1fr] gap-x-3 text-sm tabular-nums">
              {(
                [
                  ['indoors', 'Start indoors'],
                  ['sow', 'Sow outside'],
                  ['plant', 'Plant out'],
                ] as const
              )
                .filter(([key]) => crop[key])
                .map(([key, label]) => (
                  <div key={key} className="contents">
                    <dt className="text-dim">{label}</dt>
                    <dd>{range(crop[key]!)}</dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
      <div className="mt-4 hidden sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-rule text-dim">
            <tr>
              <th scope="col" className="py-2 pr-4 font-normal">
                Crop
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                Start indoors
              </th>
              <th scope="col" className="py-2 pr-4 font-normal">
                Sow outside
              </th>
              <th scope="col" className="py-2 font-normal">
                Plant out
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule tabular-nums">
            {CROPS.map((crop) => (
              <tr key={crop.name}>
                <th scope="row" className="py-2 pr-4 font-medium">
                  {crop.name}
                </th>
                <td className="py-2 pr-4 whitespace-nowrap">{cell(crop, 'indoors')}</td>
                <td className="py-2 pr-4 whitespace-nowrap">{cell(crop, 'sow')}</td>
                <td className="py-2 whitespace-nowrap">{cell(crop, 'plant')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {analysis.frostFree !== null && analysis.frostFree < 100 && <p className="mt-3 text-sm text-pretty">The frost-free season here is short, so warm-season crops like tomatoes, peppers, and squash may need a greenhouse, cloches, or fleece.</p>}
    </section>
  )
}

function PlacePicker({ place, onChoose }: { place: Place | null; onChoose: (place: Place) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[] | null>(null)
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
        const data = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`).then((r) => r.json())
        if (cancelled) return
        const list: Place[] = (Array.isArray(data?.results) ? data.results : [])
          .filter((r: Record<string, unknown>) => typeof r.latitude === 'number' && typeof r.longitude === 'number' && typeof r.name === 'string')
          .map((r: Record<string, string | number>) => ({ name: String(r.name), detail: [r.admin1, r.country].filter(Boolean).join(', '), lat: Number(r.latitude), lon: Number(r.longitude) }))
        setResults(list)
      } catch {
        if (!cancelled) setResults([])
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
          <span className="text-sm font-medium">{place ? 'Change place' : 'Where’s your garden?'}</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a town or city" autoComplete="off" className={field} aria-describedby={place ? 'current-place' : undefined} />
        </label>
        <button type="button" onClick={locate} disabled={locating} className={`${outline} disabled:opacity-60`}>
          {locating ? 'Finding you…' : 'Use my location'}
        </button>
      </div>
      {results && (
        <ul className="mt-2 divide-y divide-rule rounded-lg border border-rule" aria-label="Places">
          {results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-dim">No places found.</li>
          ) : (
            results.map((r) => (
              <li key={`${r.lat},${r.lon}`}>
                <button type="button" onClick={() => pick(r)} className="flex w-full cursor-pointer flex-col items-start px-3 py-2.5 text-left hover:bg-ink/5">
                  <span className="text-sm font-medium" dir="auto">
                    {r.name}
                  </span>
                  <span className="text-xs text-dim" dir="auto">
                    {r.detail}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {note && <p className="mt-2 text-sm text-dim">{note}</p>}
      {place && !results && (
        <p id="current-place" className="mt-2 text-sm text-dim">
          Showing{' '}
          <span className="font-medium text-ink" dir="auto">
            {place.name}
          </span>
          {place.detail && `, ${place.detail}`}
        </p>
      )}
    </div>
  )
}

function load(): Saved {
  const fallback: Saved = { place: null, threshold: 'frost', units: defaultUnits(navigator.language), anchor: 'typical' }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data || typeof data !== 'object') return fallback
    const p = data.place
    const place = p && typeof p.name === 'string' && typeof p.detail === 'string' && Number.isFinite(p.lat) && Number.isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180 ? { name: p.name.slice(0, 100), detail: p.detail.slice(0, 200), lat: p.lat, lon: p.lon } : null
    return {
      place,
      threshold: data.threshold in THRESHOLDS ? data.threshold : 'frost',
      units: data.units === 'F' || data.units === 'C' ? data.units : fallback.units,
      anchor: data.anchor === 'cautious' ? 'cautious' : 'typical',
    }
  } catch {
    return fallback
  }
}

// Records are kept compactly: lows in tenths of a degree, with an empty slot for a missing day.
function saveRecords(r: Records) {
  try {
    const values = r.series.values.map((v) => (v === null ? '' : String(Math.round(v * 10)))).join(',')
    localStorage.setItem(DATA_KEY, JSON.stringify({ version: 1, key: r.key, fetched: r.fetched, elevation: r.elevation, start: r.series.start, values }))
  } catch {
    // Full storage: records are fetched again next time.
  }
}

function loadRecords(place: Place | null): Records | null {
  if (!place) return null
  try {
    const data = JSON.parse(localStorage.getItem(DATA_KEY) ?? 'null')
    if (!data || data.key !== placeKey(place) || !Number.isInteger(data.start) || !Number.isInteger(data.fetched) || typeof data.values !== 'string') return null
    const values = data.values.split(',').map((v: string) => (v === '' ? null : Number(v) / 10))
    if (values.some((v: number | null) => v !== null && !Number.isFinite(v))) return null
    return { key: data.key, fetched: data.fetched, elevation: Number.isFinite(data.elevation) ? data.elevation : null, series: { start: data.start, values } }
  } catch {
    return null
  }
}
