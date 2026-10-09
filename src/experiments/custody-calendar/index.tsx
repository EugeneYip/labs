import { useEffect, useMemo, useState } from 'react'
import { dayNumber, decode, encode, exchanges, isoDate, LIMITS, matchPreset, nightOf, patternNight, presetNights, PRESETS, startOfWeek, sundayFirst, swapNight, toICS, totals, validISO, weekday, type Parent, type Schedule } from './model.ts'

// The schedule, kept on this device. A share link carries it in the part after #, which never reaches the server.
const STORAGE_KEY = 'labs:custody-calendar'
const DAY = 86_400_000

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 w-full sm:h-10`
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const toggle = (on: boolean) => `${button} border ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`

/** Fills for each parent's nights: blue and orange stay apart for color-blind eyes; the second also gets stripes for gray printers. */
const FILL = ['bg-sky-200 dark:bg-sky-800', 'bg-amber-200 dark:bg-amber-700 stripes'] as const
const CHIP = ['bg-sky-400 dark:bg-sky-500', 'bg-amber-400 dark:bg-amber-500'] as const

const SUNDAY_FIRST = sundayFirst(navigator.language)
const todayDay = () => {
  const now = new Date()
  return dayNumber(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`)
}
const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(undefined, { ...opts, timeZone: 'UTC' })
const longDate = fmt({ weekday: 'short', month: 'short', day: 'numeric' })
const fullDate = fmt({ month: 'long', day: 'numeric', year: 'numeric' })
const monthName = fmt({ month: 'long' })
const dayLetter = fmt({ weekday: 'narrow' })
const dayShort = fmt({ weekday: 'short' })
const atDay = (day: number) => day * DAY

/** Experiment #020: a co-parenting calendar from a repeating pattern of nights. */
export default function CustodyCalendar() {
  const [loaded] = useState(start)
  const [schedule, setSchedule] = useState<Schedule>(loaded.schedule)
  const [replaced, setReplaced] = useState<Schedule | null>(loaded.replaced)
  const [broken, setBroken] = useState(loaded.broken)
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [copied, setCopied] = useState<'yes' | 'no' | null>(null)
  const [note, setNote] = useState<string | null>(null)

  // The shared schedule is now saved here, so the link's copy comes off the address.
  useEffect(() => {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...schedule }))
    } catch {
      // Private browsing or full storage: the schedule just won't be remembered.
    }
  }, [schedule])

  const change = (patch: Partial<Schedule>) => setSchedule((s) => ({ ...s, ...patch }))
  const names = schedule.names.map((n, i) => n.trim() || (i ? 'Parent B' : 'Parent A')) as [string, string]
  const named = { ...schedule, names }
  const preset = matchPreset(schedule.nights, SUNDAY_FIRST)
  const weeks = schedule.nights.length / 7
  const today = todayDay()
  const [a, b] = useMemo(() => totals(schedule, year), [schedule, year])
  const next = useMemo(() => exchanges(schedule, today, 6), [schedule, today])
  const swaps = Object.keys(schedule.overrides).length
  // Share links have room for this many swaps, so the schedule stops taking more.
  const full = swaps >= LIMITS.overrides

  const setWeeks = (n: number) => {
    const nights = Array.from({ length: n * 7 }, (_, i) => schedule.nights[i % schedule.nights.length])
    change({ nights })
  }
  const flipPattern = (i: number) => change({ nights: schedule.nights.map((p, k) => (k === i ? ((1 - p) as Parent) : p)) })

  const download = () => {
    const from = dayNumber(`${year}-01-01`)
    const to = dayNumber(`${year + 1}-01-01`)
    const blob = new Blob([toICS(named, from, to, new Date())], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `custody-calendar-${year}.ics`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNote(`Downloaded ${link.download}. Open it to add the stays to a calendar app, ideally to a calendar of their own, so they’re easy to replace after changes. In Google Calendar, import it on a computer, from Settings.`)
  }
  const share = () => {
    const url = `${location.origin}${location.pathname}#${encode(schedule)}`
    const done = (r: 'yes' | 'no') => {
      setCopied(r)
      setTimeout(() => setCopied(null), 2500)
    }
    if (!navigator.clipboard) return done('no')
    navigator.clipboard.writeText(url).then(
      () => {
        done('yes')
        setNote('Link copied. It holds the schedule as it is now: changes made later don’t reach it, so send a new link after any change.')
      },
      () => done('no'),
    )
  }

  const pct = (n: number) => `${((n / (a + b)) * 100).toFixed(1)}%`

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10 print:p-0">
        <div className="print:hidden">
          <p className="max-w-prose text-pretty text-dim">
            A calendar for two homes. Choose the repeating pattern of nights, and see the whole year by who has the children each night, with each parent’s share of overnights and the next handovers. Swap nights for holidays, then add it to your calendar or share it with the other parent. Nothing is sent anywhere.
          </p>

          {broken && (
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-rule p-4 text-sm" role="status">
              <span>This share link couldn’t be read, so nothing was changed. It may have been cut short when it was sent: ask for the link again.</span>
              <button type="button" onClick={() => setBroken(false)} className="cursor-pointer text-dim underline underline-offset-4 hover:text-ink">
                OK
              </button>
            </div>
          )}

          {replaced && (
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-rule p-4 text-sm" role="status">
              <span>This shared schedule replaced the one saved on this device.</span>
              <button
                type="button"
                onClick={() => {
                  setSchedule(replaced)
                  setReplaced(null)
                }}
                className="cursor-pointer underline underline-offset-4 hover:text-dim"
              >
                Keep mine instead
              </button>
              <button type="button" onClick={() => setReplaced(null)} className="cursor-pointer text-dim underline underline-offset-4 hover:text-ink">
                OK
              </button>
            </div>
          )}

          <section aria-labelledby="pattern-heading" className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
            <div className="grid content-start gap-5">
              <h2 id="pattern-heading" className="text-lg font-semibold tracking-tight">
                The pattern
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {([0, 1] as const).map((p) => (
                  <label key={p} className="grid gap-1.5">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <span className={`inline-block size-3 rounded-sm ${CHIP[p]}`} aria-hidden="true" />
                      {p === 0 ? 'First parent' : 'Second parent'}
                    </span>
                    <input value={schedule.names[p]} maxLength={LIMITS.name} onChange={(e) => change({ names: (p === 0 ? [e.target.value, schedule.names[1]] : [schedule.names[0], e.target.value]) as [string, string] })} placeholder={p === 0 ? 'Parent A' : 'Parent B'} className={field} dir="auto" autoComplete="off" />
                  </label>
                ))}
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium">Start from</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button key={p.id} type="button" aria-pressed={preset === p.id} onClick={() => change({ nights: presetNights(p.id, SUNDAY_FIRST) })} className={toggle(preset === p.id)} title={p.hint}>
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-dim">{preset ? PRESETS.find((p) => p.id === preset)!.hint : 'Your own pattern. Tap the nights below to change them.'}</p>
              </div>
              <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium">Week 1 begins</span>
                  <input
                    type="date"
                    value={schedule.anchor}
                    onChange={(e) => validISO(e.target.value) && change({ anchor: startOfWeek(e.target.value, SUNDAY_FIRST) })}
                    className={`${control} h-11 cursor-pointer sm:h-10`}
                  />
                </label>
                <fieldset>
                  <legend className="mb-1.5 text-sm font-medium">Repeats every</legend>
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <button key={n} type="button" aria-pressed={weeks === n} onClick={() => setWeeks(n)} className={`${toggle(weeks === n)} px-3`}>
                        {n} {n === 1 ? 'week' : 'weeks'}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="grid content-start gap-2">
              <p className="text-sm font-medium">Nights in the pattern</p>
              <PatternGrid schedule={named} onFlip={flipPattern} />
              <p className="text-sm text-dim">Tap a night to give it to the other parent. Each square is the night of that day.</p>
            </div>
          </section>
        </div>

        <section aria-labelledby="year-heading" className="mt-12 print:mt-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setYear(year - 1)} className={`${quiet} px-3 print:hidden`} aria-label="Previous year">
                ←
              </button>
              <h2 id="year-heading" className="text-2xl font-semibold tracking-tight tabular-nums">
                {year}
              </h2>
              <button type="button" onClick={() => setYear(year + 1)} className={`${quiet} px-3 print:hidden`} aria-label="Next year">
                →
              </button>
            </div>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button type="button" onClick={download} className={outline}>
                Add {year} to a calendar
              </button>
              <button type="button" onClick={share} className={outline}>
                {copied === 'yes' ? 'Link copied' : copied === 'no' ? 'Couldn’t copy' : 'Copy a share link'}
              </button>
              <button type="button" onClick={() => window.print()} className={outline}>
                Print
              </button>
            </div>
          </div>
          {note && (
            <p className="mt-3 max-w-prose text-sm text-pretty text-dim print:hidden" role="status">
              {note}
            </p>
          )}

          <div className="mt-4 grid gap-2">
            <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {([0, 1] as const).map((p) => (
                <span key={p} className="flex items-center gap-2">
                  <span className={`inline-block size-3 rounded-sm print-exact ${CHIP[p]}`} aria-hidden="true" />
                  <span dir="auto" className="font-medium">
                    {names[p]}
                  </span>
                  <span className="tabular-nums">
                    {p === 0 ? a : b} nights ({pct(p === 0 ? a : b)})
                  </span>
                </span>
              ))}
            </p>
            <div className="flex h-2 overflow-hidden rounded-full print-exact" aria-hidden="true">
              <div className={CHIP[0]} style={{ width: `${(a / (a + b)) * 100}%` }} />
              <div className={CHIP[1]} style={{ width: `${(b / (a + b)) * 100}%` }} />
            </div>
          </div>

          {next.length > 0 && (
            <div className="mt-5 print:hidden">
              <h3 className="text-sm font-medium">Next handovers</h3>
              <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                {next.map((e) => (
                  <li key={e.day} className="tabular-nums">
                    <span className="text-dim">{e.day === today ? 'Today' : longDate.format(atDay(e.day))}:</span> to <span dir="auto">{names[e.to]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-dim print:mt-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3.5 w-3.5 rounded-sm border-l-[3px] border-ink bg-ink/10" aria-hidden="true" />
              Handover day
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3.5 w-3.5 rounded-sm outline-[1.5px] outline-ink outline-dashed" aria-hidden="true" />
              Swapped night
            </span>
            <span className="print:hidden">{full ? `That’s ${LIMITS.overrides} swapped nights, the most a schedule can hold. Undo some to swap more.` : 'Tap any day to swap that night, for holidays or trips.'}</span>
            {swaps > 0 && (
              <button type="button" onClick={() => change({ overrides: {} })} className="cursor-pointer underline underline-offset-4 hover:text-ink print:hidden">
                Undo all {swaps} {swaps === 1 ? 'swap' : 'swaps'}
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-3 print:gap-x-4 print:gap-y-3">
            {Array.from({ length: 12 }, (_, m) => (
              <Month key={m} year={year} month={m} schedule={named} today={today} onSwap={(day) => setSchedule((s) => (Object.keys(s.overrides).length >= LIMITS.overrides && !(isoDate(day) in s.overrides) ? s : swapNight(s, day)))} />
            ))}
          </div>
        </section>

        <p className="mt-12 max-w-prose text-sm text-pretty text-dim print:mt-4 print:text-[8pt]">
          Each day counts toward whoever has the children that night, a common way to count custody time. Courts and child-support formulas can count differently, so check how yours does. A share link holds the names and a copy of the schedule: anyone with it can see them, and later changes don’t reach it.
        </p>
      </div>
      <style>{`.stripes { background-image: repeating-linear-gradient(135deg, transparent 0 4px, rgb(0 0 0 / 0.07) 4px 6px); }
@media print { .print-exact, .stripes, [data-night] { print-color-adjust: exact; -webkit-print-color-adjust: exact; } @page { margin: 0.5in; } }`}</style>
    </div>
  )
}

/** The repeating pattern as weeks of tappable nights. */
function PatternGrid({ schedule, onFlip }: { schedule: Schedule; onFlip: (i: number) => void }) {
  const anchor = dayNumber(schedule.anchor)
  const weeks = schedule.nights.length / 7
  return (
    <div className="grid gap-1.5">
      <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1.5 text-center text-xs text-dim">
        <span />
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i}>{dayShort.format(atDay(anchor + i))}</span>
        ))}
      </div>
      {Array.from({ length: weeks }, (_, w) => (
        <div key={w} className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))] gap-1.5">
          <span className="self-center text-xs text-dim">Week {w + 1}</span>
          {Array.from({ length: 7 }, (_, i) => {
            const k = w * 7 + i
            const p = schedule.nights[k]
            return (
              <button key={i} type="button" onClick={() => onFlip(k)} className={`h-10 cursor-pointer rounded-md text-xs font-semibold text-ink ${FILL[p]}`} aria-label={`Week ${w + 1}, ${dayShort.format(atDay(anchor + k))}: ${schedule.names[p]}. Tap to give this night to ${schedule.names[1 - p]}.`} dir="auto">
                {initial(schedule.names[p])}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

const initial = (name: string) => [...name.trim()][0]?.toLocaleUpperCase() ?? '?'

function Month({ year, month, schedule, today, onSwap }: { year: number; month: number; schedule: Schedule; today: number; onSwap: (day: number) => void }) {
  const first = dayNumber(`${year}-${String(month + 1).padStart(2, '0')}-01`)
  const days = dayNumber(month === 11 ? `${year + 1}-01-01` : `${year}-${String(month + 2).padStart(2, '0')}-01`) - first
  const lead = SUNDAY_FIRST ? (weekday(first) + 1) % 7 : weekday(first)
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => first + i)]
  const weekStart = first - lead
  return (
    <div className="break-inside-avoid">
      <h3 className="text-sm font-semibold print:text-[9pt]">{monthName.format(atDay(first))}</h3>
      <div className="mt-1.5 grid grid-cols-7 gap-0.5 text-center text-[11px] print:text-[7pt]" role="group" aria-label={`${monthName.format(atDay(first))} ${year}`}>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className="pb-0.5 text-dim" aria-hidden="true">
            {dayLetter.format(atDay(weekStart + i))}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`x${i}`} />
          const p = nightOf(schedule, day)
          const handover = p !== nightOf(schedule, day - 1)
          const swapped = p !== patternNight(schedule, day)
          return (
            <button
              key={day}
              type="button"
              data-night={p}
              onClick={() => onSwap(day)}
              className={`relative h-8 cursor-pointer rounded-[4px] tabular-nums text-ink print:h-[0.22in] ${FILL[p]} ${handover ? 'border-l-[3px] border-ink' : ''} ${swapped ? 'outline-[1.5px] outline-offset-[-2px] outline-ink outline-dashed' : ''} ${day === today ? 'font-bold underline underline-offset-2' : ''}`}
              aria-current={day === today ? 'date' : undefined}
              aria-label={`${fullDate.format(atDay(day))}: night with ${schedule.names[p]}${handover ? ', handover day' : ''}${swapped ? ', swapped' : ''}. Tap to swap.`}
            >
              {new Date(atDay(day)).getUTCDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function start(): { schedule: Schedule; replaced: Schedule | null; broken: boolean } {
  const saved = loadSaved()
  const fresh: Schedule = { names: ['', ''], nights: presetNights('2-2-5-5', SUNDAY_FIRST), anchor: startOfWeek(isoDate(todayDay()), SUNDAY_FIRST), overrides: {} }
  const hash = location.hash.slice(1)
  const shared = hash ? decode(hash) : null
  if (shared) return { schedule: shared, replaced: saved && encode(saved) !== encode(shared) ? saved : null, broken: false }
  // A link that fails to read, such as one cut short in a message, says so rather than quietly showing another schedule.
  return { schedule: saved ?? fresh, replaced: null, broken: hash !== '' }
}

function loadSaved(): Schedule | null {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data) return null
    // Saved schedules go through the same checks as shared ones.
    return decode(encode({ names: data.names, nights: data.nights, anchor: data.anchor, overrides: data.overrides ?? {} }))
  } catch {
    return null
  }
}
