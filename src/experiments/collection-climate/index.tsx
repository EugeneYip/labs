import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { exampleData } from './example.ts'
import {
  BIZOT_2023,
  bucketsOf,
  cToF,
  DAY,
  fmt,
  gapsOf,
  guidelineText,
  intervalOf,
  merge,
  reportOf,
  restoreSettings,
  saveSettings,
  share,
  STORAGE_KEY,
  toCsv,
  type Guideline,
  type Report,
  type Settings,
} from './model.ts'
import { decode, readText, type Layout, type ReadResult, type Reading, type Role } from './read.ts'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 sm:h-10`
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const small = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-rule px-3 text-sm hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9'
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'
const card = 'rounded-xl border border-rule p-4'
const radio = 'mt-0.5 size-4 shrink-0'

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayText = (t: number) => {
  const d = new Date(t * 1000)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
const timeText = (t: number) => {
  const d = new Date(t * 1000)
  return `${dayText(t)} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}
const clockText = (t: number) => {
  const d = new Date(t * 1000)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}
/** From one time to another, the date said once when they're on the same day. */
const spanText = (from: number, to: number) => (from === to ? timeText(from) : isoDay(from) === isoDay(to) ? `${timeText(from)} to ${clockText(to)}` : `${timeText(from)} to ${timeText(to)}`)
const monthText = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
const isoDay = (t: number) => new Date(t * 1000).toISOString().slice(0, 10)
const dayStart = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / 1000
const durationText = (secs: number) => {
  if (secs < 3600) return plural(Math.round(secs / 60), 'minute')
  if (secs < 2 * DAY) return plural(Math.round(secs / 3600), 'hour')
  return plural(Math.round(secs / DAY), 'day')
}

/** The lowest and highest of the values there are, without spreading a long list into arguments. */
function extent(values: (number | null)[]): [number, number] | null {
  let lo = Infinity
  let hi = -Infinity
  for (const v of values) {
    if (v === null) continue
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  return lo <= hi ? [lo, hi] : null
}

function stored(): string | null | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return undefined
  }
}

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

let counter = 0
const newId = () => `p${Date.now().toString(36)}${(counter++).toString(36)}`

interface Part {
  name: string
  readings: Reading[]
  /** The offset from GMT, in minutes, the file states its times in (after any move to match its place). */
  offset?: number
  /** Minutes its times were moved to match its place's first file. */
  moved?: number
}

interface Place {
  id: string
  name: string
  /** The offset from GMT its files' times are in, from the first that states one. */
  offset?: number
  /** Each file's own readings, kept so a file can be taken out again. */
  parts: Part[]
  /** The readings of every file, merged in time order, each repeated reading once. */
  readings: Reading[]
  repeats: number
  clashes: number
}

interface Pending {
  key: string
  name: string
  text: string
  result: ReadResult
}

const nameFromFile = (file: string) => file.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 60) || 'A place'

function placeFrom(id: string, name: string, parts: Part[]): Place {
  const m = merge(parts.map((p) => p.readings))
  return { id, name, offset: parts.find((p) => p.offset !== undefined)?.offset, parts, readings: m.readings, repeats: m.repeats, clashes: m.clashes }
}

/** The name a place is shown by: its own, or "Place 2" while its name is empty. */
const shownName = (p: Place, i: number) => p.name.trim() || `Place ${i + 1}`
const gmtText = (minutes: number) => `GMT${minutes < 0 ? '-' : '+'}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, '0')}:${String(Math.abs(minutes) % 60).padStart(2, '0')}`
const movedText = (minutes: number) => `${plural(Math.abs(minutes) / 60, 'hour')} ${minutes > 0 ? 'later' : 'earlier'}`

/** A file's text read, or why it couldn't be (so one file's failure loses nothing else). */
function safeRead(text: string, layout?: Layout): { result: ReadResult } | { why: string } {
  try {
    return { result: readText(text, layout) }
  } catch (e) {
    return { why: e instanceof Error ? e.message : String(e) }
  }
}

// A place's report is worked out again only when its readings, the guideline, or the period change, not when the
// place is renamed.
const reportCache = new WeakMap<Reading[], { key: string; report: Report }>()
function reportFor(readings: Reading[], g: Guideline, from: number | null, to: number | null): Report {
  const key = JSON.stringify([g, from, to])
  const hit = reportCache.get(readings)
  if (hit && hit.key === key) return hit.report
  const report = reportOf(readings, g, from, to)
  reportCache.set(readings, { key, report })
  return report
}

/** Bytes that say what a file is, when it isn't text the page can read. */
function notText(name: string, bytes: Uint8Array): string | null {
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) return `${name} is an Excel workbook (or another zipped file): save it as CSV, or export CSV or text from the logger’s software.`
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf) return `${name} is an older Excel workbook (.xls): save it as CSV, or export CSV or text from the logger’s software.`
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return `${name} is a PDF, which this page can’t read: export the readings as CSV or text from the logger’s software.`
  return null
}

function looksBinary(text: string): boolean {
  const head = text.slice(0, 4000)
  let odd = 0
  for (let i = 0; i < head.length; i++) {
    const c = head.charCodeAt(i)
    if (c < 9 || (c > 13 && c < 32) || c === 0xfffd) odd++
  }
  return head.length > 0 && odd / head.length > 0.02
}

/** Experiment #035: a climate report from temperature and humidity loggers' files, against a stated guideline. */
export default function CollectionClimate() {
  const [settings, setSettings] = useState<Settings>(() => restoreSettings(stored()) ?? { guideline: BIZOT_2023, unit: 'C' })
  const [saved, setSaved] = useState(true)
  const [places, setPlaces] = useState<Place[]>([])
  const [pending, setPending] = useState<Pending[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [said, setSaid] = useState('')
  const say = (m: string) => setSaid((s) => (s === m ? `${m}\u00a0` : m))
  const reportHeading = useRef<HTMLHeadingElement>(null)
  const focusOn = (id: string) => requestAnimationFrame(() => document.getElementById(id)?.focus())

  const save = useOtherTabs(STORAGE_KEY, () => {
    const next = restoreSettings(stored())
    if (next) setSettings(next)
  })
  useEffect(() => {
    try {
      save(saveSettings(settings))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [settings, save])

  // The readings aren't saved: leaving with files open asks first.
  const open = places.length > 0 || pending.length > 0
  useEffect(() => {
    if (!open) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [open])

  const g = settings.guideline
  const fromT = from && Number.isFinite(dayStart(from)) ? dayStart(from) : null
  const toT = to && Number.isFinite(dayStart(to)) ? dayStart(to) + DAY - 0.001 : null
  const inverted = fromT !== null && toT !== null && fromT > toT
  // The report follows the guideline and the period once typing lets it: a year of minute readings takes a moment.
  const gr = useDeferredValue(g)
  const fromR = useDeferredValue(fromT)
  const toR = useDeferredValue(toT)
  const invalid = gr.rhLow > gr.rhHigh || gr.tempLow > gr.tempHigh
  const reports = useMemo(() => (invalid ? [] : places.map((p, i) => ({ place: p, name: shownName(p, i), report: reportFor(p.readings, gr, fromR, toR) }))), [places, gr, fromR, toR, invalid])

  // A printed report shows every list, closed or not.
  useEffect(() => {
    let opened: HTMLDetailsElement[] = []
    const before = () => {
      opened = [...document.querySelectorAll<HTMLDetailsElement>('#report details:not([open])')]
      for (const d of opened) d.open = true
    }
    const after = () => {
      for (const d of opened) d.open = false
      opened = []
    }
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])

  const readFiles = async (files: FileList) => {
    const list: Pending[] = []
    const bad: string[] = []
    for (const f of [...files]) {
      if (f.size > 60_000_000) {
        bad.push(`${f.name} is larger than 60 MB: export a shorter period, or one logger a file.`)
        continue
      }
      let bytes: Uint8Array
      try {
        bytes = new Uint8Array(await f.arrayBuffer())
      } catch {
        bad.push(`${f.name} couldn’t be opened: it may have been moved or still be downloading. Open it again.`)
        continue
      }
      const why = notText(f.name, bytes)
      if (why) {
        bad.push(why)
        continue
      }
      const { text } = decode(bytes)
      if (looksBinary(text)) {
        bad.push(`${f.name} doesn’t look like text: it may be the logger’s own file. Export the readings as CSV or text from the logger’s software.`)
        continue
      }
      const read = safeRead(text)
      if ('why' in read) bad.push(`${f.name} couldn’t be read (${read.why}). Export it again as CSV, or paste its rows.`)
      else list.push({ key: newId(), name: f.name, text, result: read.result })
    }
    setNotes(bad)
    setPending((p) => [...p, ...list])
    if (list.length) say(`${plural(list.length, 'file')} read: check how each was read, then add it.`)
    else if (bad.length) say(bad[0])
  }

  const addPending = (p: Pending, target: string | null, name: string) => {
    const into = target ? places.find((x) => x.id === target) : undefined
    const stated = p.result.offset
    const moved = into && into.offset !== undefined && stated !== undefined ? into.offset - stated : 0
    const readings = moved ? p.result.readings.map((r) => ({ ...r, t: r.t + moved * 60 })) : p.result.readings
    const part: Part = { name: p.name, readings, ...(stated !== undefined ? { offset: stated + moved } : {}), ...(moved ? { moved } : {}) }
    const newName = name.trim() || nameFromFile(p.name)
    setPlaces((ps) => (into ? ps.map((x) => (x.id === into.id ? placeFrom(x.id, x.name, [...x.parts, part]) : x)) : [...ps, placeFrom(newId(), newName, [part])]))
    setPending((list) => list.filter((x) => x.key !== p.key))
    say(`${p.name}: ${plural(readings.length, 'reading')} added ${into ? `to ${into.name}` : `as ${newName}`}.${moved && into ? ` Its times, at ${gmtText(stated!)}, were moved ${movedText(moved)} to match the place’s ${gmtText(into.offset!)}.` : ''}`)
    focusOn('places-heading')
  }

  const takeOut = (place: Place, k: number) => {
    const part = place.parts[k]
    setPlaces((ps) => ps.map((x) => (x.id === place.id ? placeFrom(x.id, x.name, x.parts.filter((_, i) => i !== k)) : x)))
    say(`${part.name} taken out of ${place.name}.`)
    focusOn('places-heading')
  }

  const loadExample = () => {
    const ex = exampleData()
    setPlaces(ex.map((e) => placeFrom(newId(), e.name, [{ name: e.file, readings: e.readings }])))
    setNotes([])
    say('The example: two loggers, three summer months.')
    requestAnimationFrame(() => reportHeading.current?.focus())
  }

  const firstT = places.reduce((m, p) => (p.readings.length ? Math.min(m, p.readings[0].t) : m), Infinity)
  const lastT = places.reduce((m, p) => (p.readings.length ? Math.max(m, p.readings[p.readings.length - 1].t) : m), -Infinity)
  const hasReadings = Number.isFinite(firstT)

  return (
    <div className="flex-1">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
        <section aria-labelledby="intro-heading" className="grid grid-cols-1 gap-3 print:hidden">
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            For whoever looks after a collection and downloads its temperature and humidity loggers. Open the files the loggers’ software exports, choose the guideline you follow, and see what
            share of the readings each place had inside it, when the humidity changed more than the 24-hour limit allows, and how each month went, with a graph and a page to print.
          </p>
          <details className="max-w-prose text-sm text-dim">
            <summary className={summaryStyle}>About this page: privacy, and what it does and doesn’t do</summary>
            <ul className="grid grid-cols-1 list-disc gap-1.5 pt-3 pl-5 text-pretty">
              <li>The files are read on this device; nothing is uploaded, and the readings aren’t saved (only the guideline you choose is). Open the files again next time.</li>
              <li>
                It counts readings against the band you choose. It doesn’t say whether a place suits a collection: the Bizot guideline itself says more sensitive objects need tighter
                control, and that a conservator’s evaluation is essential for works requested for loan.
              </li>
              <li>It reads CSV and text exports. Excel workbooks need saving as CSV first; loggers’ own files and live monitoring systems aren’t read.</li>
              <li>Times are taken as the logger’s clock wrote them. Where that clock follows summer time, a file across a clock change has an hour missing in spring and two readings at the same times in autumn; both are kept.</li>
            </ul>
          </details>
        </section>

        <GuidelinePanel settings={settings} onChange={setSettings} invalid={g.rhLow > g.rhHigh || g.tempLow > g.tempHigh} />
        {!saved && <NotSaving>This browser isn’t saving the guideline you chose, so it will be back to Bizot’s next time.</NotSaving>}

        <section aria-labelledby="files-heading" className="grid grid-cols-1 gap-3 print:hidden">
          <h2 id="files-heading" tabIndex={-1} className="text-lg font-semibold tracking-tight">
            The loggers’ files
          </h2>
          <p className="max-w-prose text-sm text-pretty text-dim">
            Export the readings from each logger’s software as CSV or text. Each file becomes a place (a room, a case, a store); add later downloads from the same logger to its place, and
            readings the downloads share are counted once.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className={`${primary} focus-within:outline-2 focus-within:outline-offset-2`}>
              Open logger files…
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = e.target.files
                  if (files?.length) void readFiles(files)
                  e.target.value = ''
                }}
              />
            </label>
            <PasteButton
              onRead={(text) => {
                const read = safeRead(text)
                if ('why' in read) {
                  setNotes([`The pasted rows couldn’t be read (${read.why}).`])
                  return
                }
                const key = newId()
                setNotes([])
                setPending((p) => [...p, { key, name: 'Pasted readings', text, result: read.result }])
                say('Readings pasted: check how they were read, then add them.')
                focusOn(`pending-${key}`)
              }}
            />
            {!places.length && (
              <button type="button" className={outline} onClick={loadExample}>
                Try an example
              </button>
            )}
          </div>
          {notes.map((n, i) => (
            <p key={i} className="max-w-prose text-sm text-pretty" role="status">
              {n}
            </p>
          ))}
          {pending.map((p) => (
            <Preview
              key={p.key}
              pending={p}
              places={places}
              unit={settings.unit}
              onLayout={(layout) => {
                const read = safeRead(p.text, layout)
                if ('result' in read) setPending((list) => list.map((x) => (x.key === p.key ? { ...x, result: read.result } : x)))
              }}
              onGuess={() => {
                const read = safeRead(p.text)
                if ('result' in read) setPending((list) => list.map((x) => (x.key === p.key ? { ...x, result: read.result } : x)))
              }}
              onAdd={(target, name) => addPending(p, target, name)}
              onCancel={() => {
                setPending((list) => list.filter((x) => x.key !== p.key))
                say(`${p.name} left out.`)
                focusOn('files-heading')
              }}
            />
          ))}
          {places.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              <h3 id="places-heading" tabIndex={-1} className="font-medium">
                Places
              </h3>
              <ul className="grid grid-cols-1 gap-2">
                {places.map((p, i) => (
                  <li key={p.id} className="grid grid-cols-1 gap-2 border-t border-rule pt-2 text-sm">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <label className="min-w-0">
                        <span className="sr-only">Name of the place from {p.parts.map((f) => f.name).join(', ')}</span>
                        <input
                          className={`${field} w-56 max-w-full`}
                          value={p.name}
                          maxLength={60}
                          onChange={(e) => setPlaces((ps) => ps.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)))}
                          onBlur={() => {
                            if (!p.name.trim()) setPlaces((ps) => ps.map((x) => (x.id === p.id ? { ...x, name: nameFromFile(p.parts[0]?.name ?? '') || shownName(p, i) } : x)))
                          }}
                        />
                      </label>
                      <span className="min-w-0 text-pretty text-dim">
                        {plural(p.readings.length, 'reading')} from {plural(p.parts.length, 'file')}
                        {p.readings.length ? `, ${dayText(p.readings[0].t)} to ${dayText(p.readings[p.readings.length - 1].t)}` : ''}
                        {p.repeats ? `; ${plural(p.repeats, 'reading')} in more than one file counted once` : ''}
                        {p.clashes ? `; ${plural(p.clashes, 'time')} with two different readings (a clock going back, or two loggers’ files?)` : ''}
                        {p.offset !== undefined ? `; times at ${gmtText(p.offset)}` : ''}
                      </span>
                      <button
                        type="button"
                        className={`${small} ml-auto`}
                        aria-label={`Remove ${shownName(p, i)}`}
                        onClick={() => {
                          setPlaces((ps) => ps.filter((x) => x.id !== p.id))
                          say(`${shownName(p, i)} removed.`)
                          focusOn('files-heading')
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    {p.parts.length > 1 && (
                      <details>
                        <summary className={summaryStyle}>Its files ({p.parts.length})</summary>
                        <ul className="grid grid-cols-1 gap-1 pt-2">
                          {p.parts.map((f, k) => (
                            <li key={k} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="min-w-0 break-words">
                                {f.name}: {plural(f.readings.length, 'reading')}
                                {f.moved ? ` (moved ${movedText(f.moved)}, to ${gmtText(f.offset!)})` : ''}
                              </span>
                              <button type="button" className={small} aria-label={`Take ${f.name} out of ${shownName(p, i)}`} onClick={() => takeOut(p, k)}>
                                Take out
                              </button>
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {places.length > 0 && hasReadings && (
          <>
            <section aria-labelledby="period-heading" className="grid grid-cols-1 gap-3 print:hidden">
              <h2 id="period-heading" className="text-lg font-semibold tracking-tight">
                The period
              </h2>
              <div className="grid grid-cols-1 items-end gap-3 sm:flex sm:flex-wrap">
                <label className="grid grid-cols-1 gap-1 text-sm">
                  <span>From</span>
                  <input id="period-from" type="date" className={`${field} w-full sm:w-48`} value={from} min={isoDay(firstT)} max={isoDay(lastT)} onChange={(e) => setFrom(e.target.value)} />
                </label>
                <label className="grid grid-cols-1 gap-1 text-sm">
                  <span>To</span>
                  <input type="date" className={`${field} w-full sm:w-48`} value={to} min={from || isoDay(firstT)} max={isoDay(lastT)} onChange={(e) => setTo(e.target.value)} />
                </label>
                {(from || to) && (
                  <button
                    type="button"
                    className={small}
                    onClick={() => {
                      setFrom('')
                      setTo('')
                      say('Every reading.')
                      focusOn('period-from')
                    }}
                  >
                    Every reading
                  </button>
                )}
              </div>
              {inverted ? (
                <p className="text-sm text-red-700 dark:text-red-300" role="alert">
                  The period ends before it starts.
                </p>
              ) : (
                <p className="max-w-prose text-sm text-pretty text-dim">
                  {fromT !== null || toT !== null ? `${dayText(fromT ?? firstT)} to ${dayText(toT ?? lastT)}, both days included.` : `Every reading: ${dayText(firstT)} to ${dayText(lastT)}.`} The 24-hour
                  limit looks back before the period where the files go back further.
                </p>
              )}
            </section>

            <section id="report" aria-labelledby="report-heading" className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 gap-1">
                <h2 id="report-heading" ref={reportHeading} tabIndex={-1} className="text-lg font-semibold tracking-tight">
                  The report
                </h2>
                {!invalid && (
                  <p className="max-w-prose text-sm text-pretty text-dim print:text-ink">
                    {dayText(fromR ?? firstT)} to {dayText(toR ?? lastT)}, against {gr.kind === 'bizot2023' ? 'the Bizot Green Protocol’s guideline (2023)' : 'your own band'}: {guidelineText(gr, settings.unit)}.
                    Shares count readings, and readings on a band’s edge count as inside it. Made with Labs’ Collection Climate from the loggers’ files.
                  </p>
                )}
              </div>
              {invalid ? (
                <p className="text-sm">The guideline has a band whose lower end is above its upper end: change it above to see the report.</p>
              ) : (
                <>
                  <Summary reports={reports} unit={settings.unit} g={gr} />
                  {reports.map(({ place, name, report }) => (
                    <PlaceReport key={place.id} place={place} name={name} report={report} g={gr} unit={settings.unit} from={fromR} to={toR} newPage={reports.length > 1} />
                  ))}
                  <div className="flex flex-wrap gap-2 print:hidden">
                    <button type="button" className={outline} onClick={() => window.print()}>
                      Print the report
                    </button>
                    <button
                      type="button"
                      className={outline}
                      onClick={() => {
                        download(toCsv(reports.map((r) => ({ name: r.name, report: r.report })), gr, { from: fromR, to: toR }), 'collection-climate.csv', 'text/csv;charset=utf-8')
                        say('The figures downloaded as a spreadsheet (CSV).')
                      }}
                    >
                      Download the figures (CSV)
                    </button>
                  </div>
                </>
              )}
              <div className="print:hidden">
                <button
                  type="button"
                  className={quiet}
                  onClick={() => {
                    if (!window.confirm('Close every place? The files stay on your device; open them again to carry on.')) return
                    setPlaces([])
                    setPending([])
                    setNotes([])
                    setFrom('')
                    setTo('')
                    say('Every place closed.')
                    focusOn('files-heading')
                  }}
                >
                  Close every place
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

// --- The guideline

function NumberField({ id, label, value, step, onCommit, fits }: { id: string; label: string; value: number; step: number; onCommit: (v: number) => void; fits: (v: number) => boolean }) {
  // What's being typed, until the field is left: a half-typed number ("-", or empty) isn't put back while typing, and
  // one that would turn the band upside down (the 6 of 65) waits until the field is left.
  const [draft, setDraft] = useState<string | null>(null)
  const parsed = (text: string) => (text.trim() === '' ? null : Number(text))
  return (
    <label className="grid grid-cols-1 content-end gap-1 text-sm" htmlFor={id}>
      <span className="text-pretty">{label}</span>
      <input
        id={id}
        type="number"
        step={step}
        className={`${field} w-full font-mono sm:w-28`}
        value={draft ?? String(Math.round(value * 10) / 10)}
        onChange={(e) => {
          setDraft(e.target.value)
          const v = parsed(e.target.value)
          if (v !== null && Number.isFinite(v) && fits(v)) onCommit(v)
        }}
        onBlur={() => {
          const v = draft === null ? null : parsed(draft)
          if (v !== null && Number.isFinite(v)) onCommit(v)
          setDraft(null)
        }}
      />
    </label>
  )
}

function GuidelinePanel({ settings, onChange, invalid }: { settings: Settings; onChange: (s: Settings) => void; invalid: boolean }) {
  const g = settings.guideline
  const unit = settings.unit
  const show = (c: number) => (unit === 'C' ? c : cToF(c))
  const back = (v: number) => Math.max(-50, Math.min(60, unit === 'C' ? v : Math.round(((v - 32) * 5 * 1e6) / 9) / 1e6))
  const pct = (v: number) => Math.max(0, Math.min(100, v))
  const set = (patch: Partial<Guideline>) => onChange({ ...settings, guideline: { ...g, ...patch, kind: 'own' } })
  return (
    <section aria-labelledby="guideline-heading" className="grid grid-cols-1 gap-4 print:hidden">
      <h2 id="guideline-heading" className="text-lg font-semibold tracking-tight">
        The guideline
      </h2>
      <fieldset className="grid grid-cols-1 gap-2 text-sm">
        <legend className="sr-only">The guideline to report against</legend>
        <label className="flex items-start gap-2">
          <input type="radio" name="guideline" className={radio} checked={g.kind === 'bizot2023'} onChange={() => onChange({ ...settings, guideline: { ...BIZOT_2023, rule: g.rule } })} />
          <span className="text-pretty">
            <span className="font-medium">The Bizot Green Protocol (2023)</span>: for many kinds of object containing hygroscopic material, a stable RH of 40–60% and a stable temperature of
            16–25 °C, with “fluctuations of no more than ±10% RH per 24 hours within this range” (the Bizot Group, refreshed September 2023)
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="radio" name="guideline" className={radio} checked={g.kind === 'own'} onChange={() => onChange({ ...settings, guideline: { ...g, kind: 'own' } })} />
          <span className="text-pretty">
            <span className="font-medium">Your own band</span>: change any of the figures below
          </span>
        </label>
      </fieldset>
      <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
        <NumberField id="g-rhlo" label="RH from (%)" value={g.rhLow} step={1} onCommit={(v) => set({ rhLow: pct(v) })} fits={(v) => pct(v) <= g.rhHigh} />
        <NumberField id="g-rhhi" label="RH to (%)" value={g.rhHigh} step={1} onCommit={(v) => set({ rhHigh: pct(v) })} fits={(v) => pct(v) >= g.rhLow} />
        <NumberField id="g-tlo" label={`Temperature from (°${unit})`} value={show(g.tempLow)} step={0.5} onCommit={(v) => set({ tempLow: back(v) })} fits={(v) => back(v) <= g.tempHigh} />
        <NumberField id="g-thi" label={`Temperature to (°${unit})`} value={show(g.tempHigh)} step={0.5} onCommit={(v) => set({ tempHigh: back(v) })} fits={(v) => back(v) >= g.tempLow} />
        <NumberField id="g-swing" label="24-hour RH limit (points; 0 for none)" value={g.swing} step={1} onCommit={(v) => set({ swing: pct(v) })} fits={() => true} />
      </div>
      {invalid && (
        <p className="text-sm text-red-700 dark:text-red-300" role="alert">
          A band’s lower end is above its upper end.
        </p>
      )}
      {g.swing > 0 && (
        <fieldset className="grid grid-cols-1 gap-2 text-sm">
          <legend className="pb-1 font-medium">How the 24-hour limit is read (the wording allows either, so the report says which it used)</legend>
          <label className="flex items-start gap-2">
            <input type="radio" name="rule" className={radio} checked={g.rule === 'mean'} onChange={() => onChange({ ...settings, guideline: { ...g, rule: 'mean' } })} />
            <span className="text-pretty">No reading more than {fmt(g.swing)} points from the average of the 24 hours up to it (±{fmt(g.swing)} around the day’s average)</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="radio" name="rule" className={radio} checked={g.rule === 'range'} onChange={() => onChange({ ...settings, guideline: { ...g, rule: 'range' } })} />
            <span className="text-pretty">No more than {fmt(g.swing)} points between the highest and lowest readings of any 24 hours (stricter)</span>
          </label>
        </fieldset>
      )}
      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <legend className="sr-only">Temperatures in</legend>
        <span aria-hidden="true" className="text-dim">
          Temperatures in
        </span>
        {(['C', 'F'] as const).map((u) => (
          <label key={u} className="flex min-h-11 items-center gap-2 sm:min-h-0">
            <input type="radio" name="unit" className="size-4" checked={unit === u} onChange={() => onChange({ ...settings, unit: u })} />°{u}
          </label>
        ))}
      </fieldset>
    </section>
  )
}

// --- Files

function PasteButton({ onRead }: { onRead: (text: string) => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  if (!open)
    return (
      <button type="button" className={outline} onClick={() => setOpen(true)}>
        Paste readings
      </button>
    )
  return (
    <div className="grid w-full grid-cols-1 gap-2">
      <label className="grid grid-cols-1 gap-1 text-sm">
        <span>Readings copied from a spreadsheet or the logger’s software, with the column names if there are any</span>
        <textarea className={`${control} min-h-32 py-2 font-mono`} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={primary}
          disabled={!text.trim()}
          onClick={() => {
            onRead(text)
            setText('')
            setOpen(false)
          }}
        >
          Read them
        </button>
        <button type="button" className={quiet} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  )
}

const ROLE_NAMES: [Role, string][] = [
  ['ignore', 'Not used'],
  ['datetime', 'Date and time'],
  ['date', 'Date'],
  ['time', 'Time'],
  ['temp', 'Temperature'],
  ['rh', 'Relative humidity'],
]

function Preview({
  pending,
  places,
  unit,
  onLayout,
  onGuess,
  onAdd,
  onCancel,
}: {
  pending: Pending
  places: Place[]
  unit: 'C' | 'F'
  onLayout: (l: Layout) => void
  onGuess: () => void
  onAdd: (target: string | null, name: string) => void
  onCancel: () => void
}) {
  const { result } = pending
  const layout = result.layout
  const rs = result.readings
  const [name, setName] = useState(result.title ?? nameFromFile(pending.name))
  const [target, setTarget] = useState('')
  const sorted = useMemo(() => [...rs].sort((a, b) => a.t - b.t), [rs])
  const interval = useMemo(() => intervalOf(sorted), [sorted])
  const gaps = useMemo(() => gapsOf(sorted, interval).length, [sorted, interval])
  const temps = useMemo(() => extent(rs.map((r) => r.temp)), [rs])
  const rhs = useMemo(() => extent(rs.map((r) => r.rh)), [rs])
  const t = (c: number) => (unit === 'C' ? `${fmt(c)} °C` : `${fmt(cToF(c))} °F`)
  const header = layout.header !== null ? result.table.rows[layout.header] : null
  const width = Math.max(0, ...result.table.rows.slice(0, 40).map((r) => r.length))
  const into = places.some((p) => p.id === target) ? target : ''
  const id = `pending-${pending.key}`
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-dim/50 p-4" role="group" aria-labelledby={id}>
      <p id={id} tabIndex={-1} className="text-sm text-pretty">
        <span className="font-medium break-words">{pending.name}</span>: {plural(rs.length, 'reading')}
        {sorted.length ? `, ${timeText(sorted[0].t)} to ${timeText(sorted[sorted.length - 1].t)}` : ''}
        {interval ? `, every ${durationText(interval)}` : ''}
        {temps ? `; temperature ${t(temps[0])} to ${t(temps[1])}` : '; no temperatures'}
        {rhs ? `; RH ${fmt(rhs[0])}% to ${fmt(rhs[1])}%` : '; no humidity'}
        {gaps ? `; ${plural(gaps, 'gap')} in the record` : ''}
        {result.offset !== undefined ? `; times at ${gmtText(result.offset)}` : ''}.
      </p>
      {result.notes.map((n, i) => (
        <p key={i} className="text-sm text-pretty text-dim">
          {n}
        </p>
      ))}
      {result.cut && <p className="text-sm text-red-700 dark:text-red-300">The file is longer than this page reads: only its start was read. Export a shorter period.</p>}
      {result.problems.length > 0 && (
        <details className="text-sm">
          <summary className={summaryStyle}>{plural(result.problems.length, 'line')} not read, or read in part</summary>
          <ul className="grid grid-cols-1 gap-1 pt-2 text-dim">
            {result.problems.slice(0, 50).map((p, i) => (
              <li key={i} className="break-words">
                Line {p.line}: {p.why}. <span className="font-mono text-xs">{p.text}</span>
              </li>
            ))}
            {result.problems.length > 50 && <li>And {(result.problems.length - 50).toLocaleString('en-GB')} more.</li>}
          </ul>
        </details>
      )}
      <details className="text-sm" open={rs.length === 0 || !!result.noTimes || layout.header === null}>
        <summary className={summaryStyle}>The columns{rs.length === 0 ? ' (nothing was read: say which column is which)' : ''}</summary>
        <div className="grid grid-cols-1 gap-3 pt-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Array.from({ length: width }, (_, c) => (
              <label key={c} className="grid grid-cols-1 gap-1">
                <span className="break-words text-dim">
                  Column {c + 1}
                  {header?.[c]?.trim() ? `: ${header[c].trim()}` : ''}
                </span>
                <select
                  className={field}
                  value={layout.roles[c] ?? 'ignore'}
                  onChange={(e) => {
                    const roles = Array.from({ length: width }, (_, k) => layout.roles[k] ?? 'ignore')
                    roles[c] = e.target.value as Role
                    onLayout({ ...layout, roles })
                  }}
                >
                  {ROLE_NAMES.map(([role, label]) => (
                    <option key={role} value={role}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex min-h-11 items-center gap-2 sm:min-h-0">
              <input type="checkbox" className="size-4" checked={!layout.dayFirst} onChange={(e) => onLayout({ ...layout, dayFirst: !e.target.checked })} />
              Dates are month first (04/13/2026)
            </label>
            <label className="flex min-h-11 items-center gap-2 sm:min-h-0">
              <input type="checkbox" className="size-4" checked={layout.fahrenheit} onChange={(e) => onLayout({ ...layout, fahrenheit: e.target.checked })} />
              Temperatures are in °F
            </label>
            <button type="button" className={small} onClick={onGuess}>
              Guess again
            </button>
          </div>
        </div>
      </details>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-end">
        {places.length > 0 && (
          <label className="grid grid-cols-1 gap-1 text-sm">
            <span>Add to</span>
            <select className={field} value={into} onChange={(e) => setTarget(e.target.value)}>
              <option value="">A new place</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (a later download)
                </option>
              ))}
            </select>
          </label>
        )}
        {!into && (
          <label className="grid grid-cols-1 gap-1 text-sm">
            <span>The place’s name</span>
            <input className={`${field} w-full sm:w-64`} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </label>
        )}
        <button type="button" className={primary} disabled={!rs.length} onClick={() => onAdd(into || null, name)}>
          Add {plural(rs.length, 'reading')}
        </button>
        <button type="button" className={quiet} onClick={onCancel}>
          Leave it out
        </button>
      </div>
    </div>
  )
}

// --- The report

/** Why no reading could be checked against the 24-hour limit. */
const notChecked = (r: Report) => (r.rh.n === 0 ? 'no humidity readings' : 'no full 24 hours of readings')

function Summary({ reports, unit, g }: { reports: { place: Place; name: string; report: Report }[]; unit: 'C' | 'F'; g: Guideline }) {
  const t = (c: number | null) => (c === null ? '—' : unit === 'C' ? fmt(c) : fmt(cToF(c)))
  if (reports.length < 2) return null
  return (
    <div className="grid grid-cols-1 gap-2 break-inside-avoid">
      <h3 className="font-medium">Every place</h3>
      <ul className="grid grid-cols-1 gap-2 text-sm">
        {reports.map(({ place, name, report: r }) => (
          <li key={place.id} className="grid grid-cols-1 gap-0.5 border-t border-rule pt-2">
            <span className="font-medium break-words">{name}</span>
            {r.readings ? (
              <span className="text-pretty">
                RH in band {share(r.rh.inBand, r.rh.n)} ({r.rh.min === null ? '—' : `${fmt(r.rh.min)}–${fmt(r.rh.max!)}%`}); temperature in band {share(r.temp.inBand, r.temp.n)} (
                {r.temp.min === null ? '—' : `${t(r.temp.min)}–${t(r.temp.max)} °${unit}`}); both {share(r.both.inBand, r.both.n)}
                {g.swing > 0 ? (r.swing.checked ? `; 24-hour limit broken on ${plural(r.swing.days.length, 'day')}` : `; 24-hour limit not checked (${notChecked(r)})`) : ''}
                {r.gaps.length ? `; ${plural(r.gaps.length, 'gap')} in the record` : ''}
              </span>
            ) : (
              <span className="text-dim">No readings in this period.</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="grid grid-cols-1 content-start gap-0.5 rounded-lg border border-rule p-3">
      <dt className="text-xs text-dim">{label}</dt>
      <dd className="text-2xl font-semibold tracking-tight tabular-nums">{value}</dd>
      {note && <dd className="text-xs text-pretty text-dim">{note}</dd>}
    </div>
  )
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 border-t border-rule py-1">
      <dt className="text-dim">{label}</dt>
      <dd className="ml-auto text-right tabular-nums">{value}</dd>
    </div>
  )
}

function PlaceReport({ place, name, report: r, g, unit, from, to, newPage }: { place: Place; name: string; report: Report; g: Guideline; unit: 'C' | 'F'; from: number | null; to: number | null; newPage: boolean }) {
  const t = (c: number | null) => (c === null ? '—' : unit === 'C' ? `${fmt(c)} °C` : `${fmt(cToF(c))} °F`)
  const id = `place-${place.id}`
  const page = newPage ? 'print:break-before-page' : ''
  if (!r.readings)
    return (
      <article aria-labelledby={id} className={`${card} grid grid-cols-1 gap-2 ${page}`}>
        <h3 id={id} className="font-semibold break-words">
          {name}
        </h3>
        <p className="text-sm text-dim">No readings in this period.</p>
      </article>
    )
  const about = (n: number) => (n && r.interval ? ` (about ${durationText(n * r.interval)})` : '')
  const spells = r.swing.spells
  // A chosen period this place's readings don't reach the ends of.
  const slack = 2 * (r.interval ?? 0)
  const edges = [
    from !== null && r.first! - from > slack ? `No readings from the period’s start, ${dayText(from)}, until ${timeText(r.first!)}.` : '',
    to !== null && to - r.last! > slack ? `No readings after ${timeText(r.last!)}, to the period’s end, ${dayText(to)}.` : '',
  ].filter(Boolean)
  return (
    <article aria-labelledby={id} className={`${card} grid grid-cols-1 gap-4 ${page}`}>
      <div className="grid grid-cols-1 gap-1">
        <h3 id={id} className="text-base font-semibold break-words">
          {name}
        </h3>
        <p className="text-sm text-pretty text-dim">
          {plural(r.readings, 'reading')}, {timeText(r.first!)} to {timeText(r.last!)}
          {r.interval ? `, usually every ${durationText(r.interval)}` : ''}.
        </p>
        {edges.map((e) => (
          <p key={e} className="text-sm text-pretty">
            {e}
          </p>
        ))}
      </div>
      <dl className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 lg:grid-cols-4">
        <Figure label="RH in band" value={share(r.rh.inBand, r.rh.n)} note={`${fmt(g.rhLow)}–${fmt(g.rhHigh)}%; ${share(r.rh.above, r.rh.n)} above, ${share(r.rh.below, r.rh.n)} below`} />
        <Figure label="Temperature in band" value={share(r.temp.inBand, r.temp.n)} note={`${t(g.tempLow)} to ${t(g.tempHigh)}; ${share(r.temp.above, r.temp.n)} above, ${share(r.temp.below, r.temp.n)} below`} />
        <Figure label="Both in band" value={share(r.both.inBand, r.both.n)} note="of the readings with both a temperature and an RH" />
        {g.swing === 0 ? (
          <Figure label="RH above 65%" value={share(r.rh.over65, r.rh.n)} note={`${plural(r.rh.over65, 'reading')}${about(r.rh.over65)}`} />
        ) : r.swing.checked ? (
          <Figure label="24-hour limit broken" value={plural(r.swing.days.length, 'day')} note={`${plural(spells.length, 'spell')}; ${plural(r.swing.breaches, 'reading')} of ${r.swing.checked.toLocaleString('en-GB')} checked`} />
        ) : (
          <Figure label="24-hour limit" value="—" note={`not checked: ${notChecked(r)}`} />
        )}
      </dl>
      <ClimateChart
        readings={place.readings}
        g={g}
        unit={unit}
        from={from ?? r.first!}
        to={to ?? r.last!}
        label={`${name}: relative humidity and temperature from ${dayText(from ?? r.first!)} to ${dayText(to ?? r.last!)}. RH ${r.rh.min === null ? 'not recorded' : `from ${fmt(r.rh.min)}% to ${fmt(r.rh.max!)}%`}; temperature ${r.temp.min === null ? 'not recorded' : `from ${t(r.temp.min)} to ${t(r.temp.max)}`}. The figures are written out below.`}
      />
      <dl className="grid grid-cols-1 text-sm">
        <Line label="RH lowest, average, highest" value={r.rh.mean === null ? '—' : `${fmt(r.rh.min!)}%, ${fmt(r.rh.mean)}%, ${fmt(r.rh.max!)}%`} />
        <Line label="Temperature lowest, average, highest" value={r.temp.mean === null ? '—' : `${t(r.temp.min)}, ${t(r.temp.mean)}, ${t(r.temp.max)}`} />
        <Line label="RH above 65%" value={`${share(r.rh.over65, r.rh.n)}${about(r.rh.over65)}`} />
        <Line label="RH above 70%" value={`${share(r.rh.over70, r.rh.n)}${about(r.rh.over70)}`} />
        {g.swing > 0 && (
          <Line
            label={g.rule === 'mean' ? 'Largest difference from the 24-hour average' : 'Largest change within any 24 hours'}
            value={r.swing.worst === null ? `not checked: ${notChecked(r)}` : `${fmt(r.swing.worst)} points`}
          />
        )}
      </dl>
      {g.swing > 0 && spells.length > 0 && (
        <details className="text-sm" open={spells.length <= 6}>
          <summary className={summaryStyle}>When the 24-hour limit was broken ({plural(spells.length, 'spell')})</summary>
          <ul className="grid grid-cols-1 gap-1 pt-2">
            {spells.slice(0, 50).map((s, i) => (
              <li key={i} className="text-pretty">
                {spanText(s.from, s.to)}: {s.readings === 1 ? `${fmt(s.worst)} points` : `${plural(s.readings, 'reading')}, at most ${fmt(s.worst)} points (${isoDay(s.at) === isoDay(s.from) ? clockText(s.at) : timeText(s.at)})`}
              </li>
            ))}
            {spells.length > 50 && <li className="text-dim">And {(spells.length - 50).toLocaleString('en-GB')} more.</li>}
          </ul>
        </details>
      )}
      {r.gaps.length > 0 && (
        <details className="text-sm" open={r.gaps.length <= 4}>
          <summary className={summaryStyle}>Gaps in the record ({r.gaps.length.toLocaleString('en-GB')})</summary>
          <ul className="grid grid-cols-1 gap-1 pt-2">
            {r.gaps.slice(0, 50).map((gp, i) => (
              <li key={i} className="text-pretty">
                {durationText(gp.to - gp.from)} without readings, from {timeText(gp.from)} to {isoDay(gp.from) === isoDay(gp.to) ? clockText(gp.to) : timeText(gp.to)}
              </li>
            ))}
            {r.gaps.length > 50 && <li className="text-dim">And {(r.gaps.length - 50).toLocaleString('en-GB')} more.</li>}
          </ul>
          <p className="pt-1 text-dim">The shares count only the readings there are.</p>
        </details>
      )}
      <div className="grid grid-cols-1 gap-1">
        <h4 className="text-sm font-medium">Month by month</h4>
        <ul className="grid grid-cols-1 text-sm">
          {r.months.map((m) => (
            <li key={m.month} className="grid grid-cols-1 gap-0.5 border-t border-rule py-1 sm:grid-cols-[6rem_1fr]">
              <span className="font-medium">{monthText(m.month)}</span>
              <span className="text-pretty">
                {plural(m.readings, 'reading')}; RH in band {share(m.rh.inBand, m.rh.n)} ({m.rh.min === null ? '—' : `${fmt(m.rh.min)}–${fmt(m.rh.max!)}%`}); temperature in band{' '}
                {share(m.temp.inBand, m.temp.n)} ({m.temp.min === null ? '—' : `${t(m.temp.min)} to ${t(m.temp.max)}`}); both {share(m.both.inBand, m.both.n)}
                {g.swing > 0 && m.checked ? `; 24-hour limit broken on ${plural(m.swingDays, 'day')}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

// --- The graph

function ClimateChart({ readings, g, unit, from, to, label }: { readings: Reading[]; g: Guideline; unit: 'C' | 'F'; from: number; to: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(720)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(Math.max(260, Math.floor(el.clientWidth))))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const left = 34
  const right = 6
  const plot = Math.max(100, width - left - right)
  const buckets = useMemo(() => bucketsOf(readings, g, from, to, Math.max(50, Math.min(1200, Math.floor(plot)))), [readings, g, from, to, plot])
  const panelH = width < 480 ? 110 : 140
  const top = 22
  const gap = 34
  const axis = top + panelH * 2 + gap
  const height = axis + 22
  const x = (t: number) => left + ((t - from) / Math.max(1, to - from)) * plot
  const show = (c: number) => (unit === 'C' ? c : cToF(c))
  const rhExtent = extent(buckets.flatMap((b) => [b.rhMin, b.rhMax]))
  const tExtent = extent(buckets.flatMap((b) => [b.tempMin === null ? null : show(b.tempMin), b.tempMax === null ? null : show(b.tempMax)]))
  const range = (ext: [number, number] | null, lo: number, hi: number, pad: number, clamp?: [number, number]): [number, number] => {
    let a = Math.min(lo, ext ? ext[0] : lo) - pad
    let b = Math.max(hi, ext ? ext[1] : hi) + pad
    if (clamp) {
      a = Math.max(clamp[0], a)
      b = Math.min(clamp[1], b)
    }
    return [Math.floor(a), Math.ceil(b)]
  }
  const [rh0, rh1] = range(rhExtent, g.rhLow, g.rhHigh, 3, [0, 100])
  const [t0, t1] = range(tExtent, show(g.tempLow), show(g.tempHigh), 1)
  const yRH = (v: number) => top + panelH - ((v - rh0) / Math.max(1, rh1 - rh0)) * panelH
  const yT = (v: number) => top + panelH + gap + panelH - ((v - t0) / Math.max(1, t1 - t0)) * panelH
  const bw = plot / buckets.length
  const days = Math.max(1, Math.round((to - from) / DAY))
  const every = days <= 14 ? 1 : days <= 62 ? 7 : days <= 400 ? 30 : 90
  const ticks: number[] = []
  for (let tt = Math.ceil(from / DAY) * DAY, k = 0; tt <= to; tt += DAY, k++) {
    const d = new Date(tt * 1000)
    if (every >= 30 ? d.getUTCDate() === 1 && (every === 30 || d.getUTCMonth() % 3 === 0) : k % every === 0) ticks.push(tt)
  }
  // Labels thinned so they don't run into each other on a narrow screen.
  const most = Math.max(2, Math.floor(plot / 52))
  const step = Math.ceil(ticks.length / most)
  const tickText = (tt: number) => {
    const d = new Date(tt * 1000)
    return every >= 30 ? (d.getUTCMonth() === 0 || tt === ticks[0] ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : MONTHS[d.getUTCMonth()]) : `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
  }
  const anchor = (px: number) => (px > left + plot - 24 ? 'end' : px < left + 24 ? 'start' : 'middle')
  const yTicks = (a: number, b: number) => {
    const s = b - a > 40 ? 10 : b - a > 16 ? 5 : b - a > 8 ? 2 : 1
    const out: number[] = []
    for (let v = Math.ceil(a / s) * s; v <= b; v += s) out.push(v)
    return out
  }
  const rhTop = yRH(Math.min(rh1, g.rhHigh))
  const tTop = yT(Math.min(t1, show(g.tempHigh)))
  return (
    <figure className="grid grid-cols-1 gap-2 break-inside-avoid">
      <div ref={ref} className="w-full">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block h-auto max-w-full" role="img" aria-label={label}>
          <text x={left} y={12} className="fill-ink text-[11px]">
            RH (%)
          </text>
          <rect x={left} y={rhTop} width={plot} height={Math.max(0, yRH(Math.max(rh0, g.rhLow)) - rhTop)} className="fill-signal/15" />
          {yTicks(rh0, rh1).map((v) => (
            <g key={`rh${v}`}>
              <line x1={left} x2={left + plot} y1={yRH(v)} y2={yRH(v)} className="stroke-rule" strokeWidth={1} />
              <text x={left - 4} y={yRH(v)} dy="0.35em" textAnchor="end" className="fill-dim text-[10px] tabular-nums">
                {v}
              </text>
            </g>
          ))}
          {buckets.map((b, i) =>
            b.rhMin === null ? null : <rect key={`r${i}`} x={left + i * bw} y={yRH(b.rhMax!)} width={Math.max(1, bw)} height={Math.max(1, yRH(b.rhMin) - yRH(b.rhMax!))} className="fill-sky-700 dark:fill-sky-400" />,
          )}
          {buckets.map((b, i) => (b.breach ? <rect key={`b${i}`} x={left + i * bw} y={top - 6} width={Math.max(1.5, bw)} height={4} className="fill-red-700 dark:fill-red-400" /> : null))}
          <text x={left} y={top + panelH + gap - 8} className="fill-ink text-[11px]">
            Temperature (°{unit})
          </text>
          <rect x={left} y={tTop} width={plot} height={Math.max(0, yT(Math.max(t0, show(g.tempLow))) - tTop)} className="fill-signal/15" />
          {yTicks(t0, t1).map((v) => (
            <g key={`t${v}`}>
              <line x1={left} x2={left + plot} y1={yT(v)} y2={yT(v)} className="stroke-rule" strokeWidth={1} />
              <text x={left - 4} y={yT(v)} dy="0.35em" textAnchor="end" className="fill-dim text-[10px] tabular-nums">
                {v}
              </text>
            </g>
          ))}
          {buckets.map((b, i) =>
            b.tempMin === null ? null : (
              <rect key={`t${i}`} x={left + i * bw} y={yT(show(b.tempMax!))} width={Math.max(1, bw)} height={Math.max(1, yT(show(b.tempMin)) - yT(show(b.tempMax!)))} className="fill-orange-700 dark:fill-orange-400" />
            ),
          )}
          {ticks.map((tt, i) => (
            <g key={`x${tt}`}>
              <line x1={x(tt)} x2={x(tt)} y1={axis} y2={axis + 4} className="stroke-dim" strokeWidth={1} />
              {i % step === 0 && (
                <text x={x(tt)} y={axis + 16} textAnchor={anchor(x(tt))} className="fill-dim text-[10px]">
                  {tickText(tt)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="text-xs text-pretty text-dim">
        Each bar runs from the lowest to the highest reading in its stretch of time; the shaded band is the guideline’s
        {g.swing > 0 ? '; red marks above the humidity show where the 24-hour limit was broken' : ''}. Blank stretches have no readings.
      </figcaption>
    </figure>
  )
}
