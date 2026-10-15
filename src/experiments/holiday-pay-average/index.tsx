import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { exampleWorking } from './example.ts'
import {
  calculate,
  dayName,
  emptyWorking,
  HAPPENED,
  hoursText,
  longDate,
  pounds,
  poundsExact,
  pruned,
  readPaste,
  realign,
  restoreWorking,
  roundHalfUp,
  saveWorking,
  shortDate,
  STORAGE_KEY,
  toCsv,
  WEEKS_BACK,
  WEEKS_USED,
  weekEndsFrom,
  type Happened,
  type Method,
  type Result,
  type Row,
  type WeekEntry,
  type Working,
} from './model.ts'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 sm:h-10`
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'
const card = 'rounded-xl border border-rule p-4'
const choice = 'mt-0.5 size-4 shrink-0'

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`

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

/** 4 to 10 Oct 2026; 27 Sep to 3 Oct 2026; 28 Dec 2025 to 3 Jan 2026. */
function spanText(start: string, end: string): string {
  const [sy, sm] = start.split('-')
  const [ey, em] = end.split('-')
  const s = shortDate(start).split(' ')
  if (sy !== ey) return `${shortDate(start)} to ${shortDate(end)}`
  if (sm !== em) return `${s[0]} ${s[1]} to ${shortDate(end)}`
  return `${s[0]} to ${shortDate(end)}`
}

const METHODS: { id: Method; label: string; hint: string }[] = [
  { id: 'none', label: 'No normal working hours', hint: 'Zero-hours, casual, and most irregular-hours workers. A week’s pay is the average pay of the weeks used, and weeks of paid holiday count.' },
  { id: 'varies', label: 'Normal working hours, but pay varies with the work', hint: 'Piece rates, pay that depends on output, or hours set by a rota. An average hourly rate from the weeks used, times their normal weekly hours. For a set basic wage plus regular overtime, use the next way.' },
  { id: 'basic', label: 'Normal working hours and set basic pay, plus extras', hint: 'Regular overtime, commission, shift or status payments on top of basic pay. Basic pay plus the average weekly extras of the weeks used.' },
]

const FATE_TEXT: Record<Row['fate'], string> = { used: 'Counted', skipped: 'Skipped', waiting: 'Needed', unused: '', before: 'Not employed' }

export default function HolidayPayAverage() {
  const [w, setW] = useState<Working>(() => restoreWorking(stored()) ?? emptyWorking())
  const [saved, setSaved] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [said, setSaid] = useState('')
  const [notice, setNotice] = useState<string[]>([])
  const [confirmClear, setConfirmClear] = useState(false)
  const say = (m: string) => setSaid((s) => (s === m ? `${m} ` : m))

  const save = useOtherTabs(STORAGE_KEY, () => {
    const next = restoreWorking(stored())
    if (next) setW(next)
  })
  useEffect(() => {
    try {
      save(saveWorking(pruned(w)))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [w, save])

  const r = useMemo(() => calculate(w), [w])

  // The result is announced a moment after typing stops, so each keystroke isn't read out.
  const summary = resultSentence(w, r)
  const [announced, setAnnounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setAnnounced(summary), 900)
    return () => clearTimeout(t)
  }, [summary])

  const setWeek = (end: string, patch: Partial<WeekEntry>) =>
    setW((x) => {
      const prev = x.weeks[end] ?? { happened: 'worked' as Happened, pay: '', hours: '' }
      return { ...x, weeks: { ...x.weeks, [end]: { ...prev, ...patch } } }
    })

  // How many weeks to show: through the week where the count stopped, any filled in further back, and one more, so
  // Enter always has a next row to go to.
  const visible = useMemo(() => {
    if (showAll || !r.rows.length) return r.rows.length
    let decisive = 0
    let lastData = -1
    r.rows.forEach((row, i) => {
      if (row.fate === 'used' || row.fate === 'waiting' || row.fate === 'skipped') decisive = i
      const e = w.weeks[row.end]
      if (e && (e.pay || e.hours || e.happened !== 'worked')) lastData = i
    })
    const firstBefore = r.rows.findIndex((row) => row.fate === 'before')
    if (firstBefore >= 0) decisive = Math.max(decisive, firstBefore)
    return Math.min(r.rows.length, Math.max(decisive + (r.status === 'final' ? 1 : 4), lastData + 2, 8))
  }, [r, w.weeks, showAll])

  // Hours are asked for only where a figure uses them: the hourly rate of 'varies', and the hour of leave.
  const hoursWanted = w.method === 'varies' || w.inHours
  const payLabel = w.method === 'basic' ? 'Extras' : w.method === 'varies' ? 'Pay for work' : 'Pay'
  const columns = hoursWanted ? 'sm:grid-cols-[8.5rem_9.5rem_minmax(0,1fr)_minmax(0,1fr)_8rem]' : 'sm:grid-cols-[8.5rem_9.5rem_minmax(0,1fr)_10rem]'

  function move(e: KeyboardEvent<HTMLInputElement>, col: string, i: number) {
    let to = -1
    if (e.key === 'ArrowDown' || (e.key === 'Enter' && !e.shiftKey)) to = i + 1
    else if (e.key === 'ArrowUp' || (e.key === 'Enter' && e.shiftKey)) to = i - 1
    if (to < 0) return
    const next = document.querySelector<HTMLInputElement>(`[data-col="${col}"][data-row="${to}"]`)
    if (next) {
      e.preventDefault()
      next.focus()
      next.select()
    } else if (e.key === 'Enter') e.preventDefault()
  }

  function clearAll() {
    setW(emptyWorking())
    setConfirmClear(false)
    setNotice([])
    setShowAll(false)
    say('Cleared: everything on this page is gone from this browser.')
    // Focus moves now, not on a later frame: a delayed move can land after the next keystrokes (or in a tab that was
    // in the background) and take them somewhere else. The leave field is always on the page.
    document.getElementById('leave')?.focus()
  }

  return (
    <div className="flex-1">
      <style>{`@media print { :root { --color-paper: #fff; --color-ink: #000; --color-dim: #444; --color-rule: #bbb; --color-signal: #000; } @page { margin: 14mm; } .print-row { break-inside: avoid; } }`}</style>
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 pt-6 pb-24 sm:px-6 sm:pt-10 print:hidden">
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
        <p className="sr-only" aria-live="polite">
          {announced}
        </p>
        <section aria-labelledby="intro-heading" className="grid grid-cols-1 gap-3">
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            For employers, bookkeepers, and workers in Great Britain working out holiday pay when pay or hours vary. Give the first day of the leave and each week’s pay, and it picks the
            weeks the rules say to use (the last 52 with pay that counts, never more than 104 weeks back), shows every week it used or skipped and why, and gives a week’s pay, with a
            page to keep as the record.
          </p>
          <details className="max-w-prose text-sm text-dim">
            <summary className={summaryStyle}>About this page: what it decides, what it doesn’t, and privacy</summary>
            <ul className="grid grid-cols-1 list-disc gap-1.5 pt-3 pl-5 text-pretty">
              <li>
                It follows the Working Time Regulations 1998 (regulation 16, which applies sections 221 to 224 of the Employment Rights Act 1996) as GOV.UK’s and Acas’s guidance explain
                them, for leave from 1 January 2024 in England, Scotland, and Wales. Northern Ireland has its own regulations.
              </li>
              <li>
                It picks the weeks and does the arithmetic. Which payments count (whether overtime is regular, whether a bonus or commission is linked to the job) is yours to decide;
                Acas’s guidance and helpline can help. It isn’t legal advice.
              </li>
              <li>
                Where GOV.UK’s or Acas’s guidance is specific it follows it (a week with any sick leave is left out, for example). Where the regulations leave a choice, the page says
                which reading it took, and for weeks of paid holiday in the extras’ average it shows both figures. Paying more than the minimum is always allowed.
              </li>
              <li>
                Paid monthly? GOV.UK’s guidance spreads each month’s pay over its weeks by the hours worked (the month’s pay divided by its hours, times each week’s hours). Enter the weekly
                figures that gives.
              </li>
              <li>
                Since 6 April 2026 employers must keep records adequate to show holiday pay was right, for six years (regulation 16B). The printed working shows every week and why.
              </li>
              <li>
                What you enter stays on this device. It’s kept in this browser so a reload doesn’t lose it, until you clear it; nothing is sent anywhere. Anyone using this browser can
                see it.
              </li>
            </ul>
          </details>
          {!Object.keys(w.weeks).length && !w.leave && (
            <div>
              <button
                type="button"
                className={outline}
                onClick={() => {
                  setW(exampleWorking(new Date()))
                  say('An example worker loaded: change anything, or clear it to start your own.')
                  // The button goes once the example is in, so focus moves to the weeks (now, not on a later frame).
                  document.getElementById('weeks-heading')?.focus()
                }}
              >
                Try an example
              </button>
            </div>
          )}
        </section>

        <section aria-labelledby="leave-heading" className="grid grid-cols-1 gap-4">
          <h2 id="leave-heading" className="text-lg font-semibold tracking-tight">
            The leave
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="grid grid-cols-1 gap-1.5 text-sm">
              <span className="font-medium">First day of the leave</span>
              <input id="leave" type="date" className={field} value={w.leave} min="2024-01-01" onChange={(e) => setW((x) => ({ ...x, leave: e.target.value }))} />
            </label>
            <label className="grid grid-cols-1 gap-1.5 text-sm">
              <span className="font-medium">
                Worker <span className="font-normal text-dim">(a name or reference, only printed; optional)</span>
              </span>
              <input className={field} value={w.worker} maxLength={80} autoComplete="off" onChange={(e) => setW((x) => ({ ...x, worker: e.target.value }))} />
            </label>
            <label className="grid grid-cols-1 gap-1.5 text-sm">
              <span className="font-medium">Their pay week ends on</span>
              <select
                className={field}
                value={w.weekEnd}
                onChange={(e) => {
                  const day = Number(e.target.value)
                  const had = Object.keys(w.weeks).length > 0
                  setW((x) => realign(x, day))
                  if (had) setNotice([`Weeks now end on ${dayName(day)}: the figures you entered were moved to the new weeks in the same order. Check them against the dates.`])
                }}
              >
                {[6, 0, 1, 2, 3, 4, 5].map((d) => (
                  <option key={d} value={d}>
                    {d === 6 ? 'Saturday (the usual rule)' : `${dayName(d)} (paid weekly by weeks ending ${dayName(d)})`}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid grid-cols-1 gap-1.5 text-sm">
              <span className="font-medium">
                First day of employment <span className="font-normal text-dim">(if in the last two years; optional)</span>
              </span>
              <input type="date" className={field} value={w.employedFrom} onChange={(e) => setW((x) => ({ ...x, employedFrom: e.target.value }))} />
            </label>
          </div>
        </section>

        <fieldset className="grid grid-cols-1 gap-3">
          <legend className="mb-3 text-lg font-semibold tracking-tight">How their week’s pay is worked out</legend>
          {METHODS.map((m) => (
            <label key={m.id} className={`flex gap-3 ${card} ${w.method === m.id ? 'border-ink' : ''}`}>
              <input
                type="radio"
                name="method"
                className={choice}
                checked={w.method === m.id}
                onChange={() => {
                  const had = Object.values(w.weeks).some((e) => e.pay !== '')
                  setW((x) => ({ ...x, method: m.id }))
                  if (had && w.method !== m.id)
                    setNotice([
                      `The weeks’ figures are now read as ${m.id === 'basic' ? 'each week’s extras (everything above basic pay)' : m.id === 'varies' ? 'each week’s pay for the work done (no holiday pay)' : 'each week’s whole pay'}, not as ${w.method === 'basic' ? 'extras' : w.method === 'varies' ? 'pay for the work done' : 'whole pay'}. Check them before using the result.`,
                    ])
                }}
              />
              <span className="grid grid-cols-1 gap-1">
                <span className="font-medium">{m.label}</span>
                <span className="text-sm text-pretty text-dim">{m.hint}</span>
              </span>
            </label>
          ))}
          {w.method === 'varies' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid grid-cols-1 gap-1.5 text-sm">
                <span className="font-medium">Their normal weekly hours</span>
                <input className={field} inputMode="decimal" value={w.normalHours} disabled={w.rota} placeholder="37.5" onChange={(e) => setW((x) => ({ ...x, normalHours: e.target.value }))} />
              </label>
              <label className="flex items-start gap-3 text-sm sm:pt-7">
                <input type="checkbox" className={choice} checked={w.rota} onChange={(e) => setW((x) => ({ ...x, rota: e.target.checked }))} />
                <span className="text-pretty">Their normal hours change from week to week (a rota), so use the average hours of the weeks used</span>
              </label>
            </div>
          )}
          {w.method === 'basic' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="grid grid-cols-1 gap-1.5 text-sm">
                <span className="font-medium">Their basic pay for a normal week, at the start of the leave (£)</span>
                <input className={field} inputMode="decimal" value={w.basic} placeholder="412.50" onChange={(e) => setW((x) => ({ ...x, basic: e.target.value }))} />
              </label>
              <label className="flex items-start gap-3 text-sm sm:pt-7">
                <input type="checkbox" className={choice} checked={w.countHoliday} onChange={(e) => setW((x) => ({ ...x, countHoliday: e.target.checked }))} />
                <span className="text-pretty">
                  Count weeks of paid holiday in the extras’ average{' '}
                  <span className="text-dim">(with no extras earned in a week of holiday, counting it lowers the average; the regulations don’t name annual leave among the weeks to leave out)</span>
                </span>
              </label>
            </div>
          )}
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className={choice} checked={w.inHours} onChange={(e) => setW((x) => ({ ...x, inHours: e.target.checked }))} />
            <span className="text-pretty">
              They’re an irregular-hours or part-year worker, building up holiday in hours{' '}
              <span className="text-dim">(for leave years that began on or after 1 April 2024: their week’s pay is the same for all their leave, and the rate for an hour of leave is given)</span>
            </span>
          </label>
        </fieldset>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <section aria-labelledby="weeks-heading" className="grid grid-cols-1 gap-3">
            <h2 id="weeks-heading" tabIndex={-1} className="text-lg font-semibold tracking-tight">
              Their weeks
            </h2>
            {r.end ? (
              <p className="max-w-prose text-sm text-pretty text-dim">
                Week 1 is the week ending {longDate(r.end)}, the {r.end === w.leave ? 'week the leave starts on its last day' : 'last complete week before the leave'}. Fill in back from
                there until 52 weeks count; a week that doesn’t count is skipped and an earlier one used. Nothing before {longDate(r.limit)} counts.
                {w.method === 'varies' ? ' For a week with some paid holiday in it, enter only the pay and hours for the work.' : ''}
                {w.method === 'basic' ? ' Enter each week’s extras as paid for that week’s work (0 if there were none, as in a week of holiday); basic pay is above.' : ''}{' '}
                <a href="#result" className="underline underline-offset-4 hover:text-ink">
                  Jump to the result
                </a>
              </p>
            ) : (
              <p className="max-w-prose text-sm text-pretty text-dim">Enter the first day of the leave, and the weeks to fill in appear here.</p>
            )}
            {notice.map((n, i) => (
              <p key={i} className="max-w-prose text-sm text-pretty" role="status">
                {n}
              </p>
            ))}
            {r.end && <PasteBox ends={weekEndsFrom(r.end)} payLabel={payLabel} hoursWanted={hoursWanted} onFill={(weeks, message) => {
              setW((x) => {
                const next = { ...x.weeks }
                for (const [end, v] of weeks) next[end] = { happened: next[end]?.happened ?? 'worked', pay: v.pay !== '' ? v.pay : (next[end]?.pay ?? ''), hours: v.hours !== '' ? v.hours : (next[end]?.hours ?? '') }
                return { ...x, weeks: next }
              })
              setNotice([message])
              document.getElementById('weeks-heading')?.focus()
            }} onProblem={(message) => setNotice([message])} />}
            {r.end && (
              <>
                <div aria-hidden="true" className={`hidden gap-3 border-b border-rule pb-2 text-xs font-medium text-dim sm:grid ${columns}`}>
                  <span>Week</span>
                  <span>What happened</span>
                  <span>{payLabel} (£)</span>
                  {hoursWanted && <span>Hours worked</span>}
                  <span>Counted?</span>
                </div>
                <ol className="grid grid-cols-1">
                  {r.rows.slice(0, visible).map((row, i) => (
                    <WeekLine
                      key={row.end}
                      row={row}
                      i={i}
                      entry={w.weeks[row.end]}
                      payLabel={payLabel}
                      hoursWanted={hoursWanted}
                      columns={columns}
                      onChange={(patch) => setWeek(row.end, patch)}
                      onKey={move}
                    />
                  ))}
                </ol>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-dim">
                    Showing {plural(visible, 'week')} of {WEEKS_BACK}.
                  </span>
                  <button type="button" className={quiet} onClick={() => setShowAll((s) => !s)}>
                    {showAll ? 'Show only the weeks needed' : 'Show all 104 weeks'}
                  </button>
                </div>
              </>
            )}
          </section>

          <section id="result" aria-labelledby="result-heading" className={`grid grid-cols-1 gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto ${card}`}>
            <h2 id="result-heading" className="text-lg font-semibold tracking-tight">
              The result
            </h2>
            <ResultView w={w} r={r} />
            {!saved && <NotSaving>This browser isn’t saving what you’ve entered, so it will be gone if the page reloads or closes. Print or download the working to keep it.</NotSaving>}
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" className={primary} disabled={r.status !== 'final'} onClick={() => window.print()}>
                Print the working
              </button>
              <button
                type="button"
                className={outline}
                disabled={r.status !== 'final'}
                onClick={() => download(toCsv(w, r), `holiday-pay${w.worker.trim() ? `-${w.worker.trim().replace(/[^\w.-]+/g, '-').slice(0, 40)}` : ''}-${w.leave}.csv`, 'text/csv;charset=utf-8')}
              >
                Download the weeks (CSV)
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-rule pt-3 text-sm">
              {confirmClear ? (
                <>
                  <span className="text-pretty">Clear everything from this browser?</span>
                  <button type="button" className={outline} onClick={clearAll}>
                    Yes, clear it
                  </button>
                  <button
                    id="keep-it"
                    type="button"
                    className={quiet}
                    onClick={() => {
                      flushSync(() => setConfirmClear(false))
                      document.getElementById('clear-all')?.focus()
                    }}
                  >
                    Keep it
                  </button>
                </>
              ) : (
                <button
                  id="clear-all"
                  type="button"
                  className={quiet}
                  onClick={() => {
                    // The question replaces this button, so focus goes to its safe answer at once.
                    flushSync(() => setConfirmClear(true))
                    document.getElementById('keep-it')?.focus()
                  }}
                >
                  Clear everything
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
      <PrintRecord w={w} r={r} />
    </div>
  )
}

function WeekLine({ row, i, entry, payLabel, hoursWanted, columns, onChange, onKey }: {
  row: Row
  i: number
  entry: WeekEntry | undefined
  payLabel: string
  hoursWanted: boolean
  columns: string
  onChange: (patch: Partial<WeekEntry>) => void
  onKey: (e: KeyboardEvent<HTMLInputElement>, col: string, i: number) => void
}) {
  const e = entry ?? { happened: 'worked' as Happened, pay: '', hours: '' }
  const span = spanText(row.start, row.end)
  const before = row.fate === 'before'
  const payBad = row.pay && !row.pay.ok
  const hoursBad = row.hours && !row.hours.ok
  const status =
    row.fate === 'used' ? 'text-green-700 dark:text-green-400' : row.fate === 'waiting' ? 'text-red-700 dark:text-red-400' : 'text-dim'
  const fate = row.fate === 'unused' ? (row.reason === 'not reached' ? 'Not reached yet' : 'Not needed') : row.fate === 'used' ? 'Counted' : `${FATE_TEXT[row.fate]}: ${row.reason}`
  return (
    <li className={`grid grid-cols-2 items-center gap-x-3 gap-y-2 border-b border-rule py-2.5 ${columns}`}>
      <span className="grid grid-cols-1 text-sm">
        <span className="font-medium">Week {row.n}</span>
        <span className="text-dim">{span}</span>
      </span>
      <label className={hoursWanted ? 'col-span-2 sm:col-span-1' : ''}>
        <span className="sr-only">What happened, week {row.n}, {span}</span>
        <select
          className={`${field} w-full`}
          value={before && e.happened !== 'before' ? 'before' : e.happened}
          disabled={before && e.happened !== 'before'}
          onChange={(ev) => onChange({ happened: ev.target.value as Happened })}
        >
          {HAPPENED.map((h) => (
            <option key={h.id} value={h.id}>
              {h.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid grid-cols-1 gap-1">
        <span className="text-xs text-dim sm:sr-only">
          {payLabel} (£)<span className="sr-only">, week {row.n}, {span}</span>
        </span>
        <input
          className={`${field} w-full ${payBad ? 'border-red-600 dark:border-red-400' : ''}`}
          inputMode="decimal"
          autoComplete="off"
          value={e.pay}
          disabled={before}
          data-col="pay"
          data-row={i}
          aria-invalid={payBad ? true : undefined}
          onChange={(ev) => onChange({ pay: ev.target.value })}
          onKeyDown={(ev) => onKey(ev, 'pay', i)}
        />
      </label>
      {hoursWanted && (
        <label className="grid grid-cols-1 gap-1">
          <span className="text-xs text-dim sm:sr-only">
            Hours worked<span className="sr-only">, week {row.n}, {span}</span>
          </span>
          <input
            className={`${field} w-full ${hoursBad ? 'border-red-600 dark:border-red-400' : ''}`}
            inputMode="decimal"
            autoComplete="off"
            value={e.happened === 'holiday' ? '' : e.hours}
            disabled={before || e.happened === 'holiday'}
            placeholder={e.happened === 'holiday' ? 'none' : undefined}
            data-col="hours"
            data-row={i}
            aria-invalid={hoursBad ? true : undefined}
            onChange={(ev) => onChange({ hours: ev.target.value })}
            onKeyDown={(ev) => onKey(ev, 'hours', i)}
          />
        </label>
      )}
      <span className={`col-start-2 row-start-1 text-right text-sm text-pretty sm:col-auto sm:row-auto sm:text-left ${status}`}>{fate || ' '}</span>
    </li>
  )
}

function PasteBox({ ends, payLabel, hoursWanted, onFill, onProblem }: {
  ends: string[]
  payLabel: string
  hoursWanted: boolean
  onFill: (weeks: Map<string, { pay: string; hours: string }>, message: string) => void
  onProblem: (message: string) => void
}) {
  const [text, setText] = useState('')
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest')
  const ref = useRef<HTMLDetailsElement>(null)
  return (
    <details ref={ref} className="text-sm">
      <summary className={summaryStyle}>Paste the weeks from a spreadsheet or a payroll report</summary>
      <div className="grid grid-cols-1 gap-3 pt-3">
        <p className="max-w-prose text-pretty text-dim">
          Copy the cells, one week to a line: the week’s date (any date in the week), the {payLabel.toLowerCase()}
          {hoursWanted ? ', and the hours worked' : ', and the hours if you have them'}. Without dates, lines fill the weeks in order. What happened each week stays as it is in the list
          below; change it there.
        </p>
        <label className="grid grid-cols-1 gap-1.5">
          <span className="font-medium">Lines to paste</span>
          <textarea className={`${control} min-h-32 py-2 font-mono`} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </label>
        <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
          <legend className="mb-1.5 font-medium">Lines without dates start with</legend>
          {(['newest', 'oldest'] as const).map((o) => (
            <label key={o} className="flex items-center gap-2">
              <input type="radio" name="paste-order" checked={order === o} onChange={() => setOrder(o)} className="size-4" />
              {o === 'newest' ? 'the most recent week' : 'the oldest week'}
            </label>
          ))}
        </fieldset>
        <div>
          <button
            type="button"
            className={outline}
            disabled={!text.trim()}
            onClick={() => {
              const read = readPaste(text, ends, order, payLabel === 'Extras' ? 'extras' : 'pay')
              if (read.problems.length) {
                onProblem(read.problems.join(' '))
                return
              }
              const parts = [`Filled in ${plural(read.weeks.size, 'week')} from ${plural(read.lines, 'line')}${read.columns ? ` (${read.columns})` : ''}.`]
              if (read.outside) parts.push(`${plural(read.outside, 'line')} fell outside the 104 weeks and ${read.outside === 1 ? 'was' : 'were'} left out.`)
              if (read.empty) parts.push(`${plural(read.empty, 'line')} had no figures, so ${read.empty === 1 ? 'its week was' : 'their weeks were'} left as ${read.empty === 1 ? 'it was' : 'they were'}.`)
              onFill(read.weeks, parts.join(' '))
              setText('')
              if (ref.current) ref.current.open = false
            }}
          >
            Fill in the weeks
          </button>
        </div>
      </div>
    </details>
  )
}

/** One plain sentence of where things stand, for the live announcement. */
function resultSentence(w: Working, r: Result): string {
  if (r.status === 'invalid') return r.problems[0] ?? ''
  if (r.status === 'waiting' && r.waitingFor) return `${r.used} of ${WEEKS_USED} weeks so far. Week ${r.waitingFor.n} is needed: ${r.waitingFor.reason}.`
  if (r.status === 'none') return 'No week to work from.'
  if (r.weekPayPence === null) return ''
  return `${plural(r.used, 'week')} used. A week’s holiday pay: ${pounds(r.weekPayPence)}${w.method === 'basic' && !w.inHours && r.basicPence !== null ? ` for the 4 weeks; at least ${pounds(r.basicPence)} for the other 1.6` : ''}.`
}

function ResultView({ w, r }: { w: Working; r: Result }) {
  if (r.status === 'invalid')
    return (
      <ul className="grid grid-cols-1 gap-1.5 text-sm text-pretty">
        {r.problems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    )
  const skipped = r.rows.filter((x) => x.fate === 'skipped')
  const reasons = new Map<string, number>()
  for (const s of skipped) reasons.set(s.reason, (reasons.get(s.reason) ?? 0) + 1)
  const counts = (
    <p className="text-sm text-pretty text-dim">
      {plural(r.used, 'week')} used{skipped.length ? `; ${plural(skipped.length, 'week')} skipped (${[...reasons].map(([k, n]) => `${k}: ${n}`).join('; ')})` : ''}.
    </p>
  )
  if (r.status === 'waiting' && r.waitingFor) {
    const f = r.waitingFor
    return (
      <div className="grid grid-cols-1 gap-2">
        <p className="text-pretty">
          <span className="font-medium">
            {r.used} of {WEEKS_USED} weeks so far.
          </span>{' '}
          Week {f.n} ({spanText(f.start, f.end)}) is needed: {f.reason}. Enter it, or choose what happened that week.
        </p>
        {counts}
      </div>
    )
  }
  if (r.status === 'none')
    return (
      <div className="grid grid-cols-1 gap-2 text-sm text-pretty">
        {r.notes.map((n) => (
          <p key={n}>{n}</p>
        ))}
      </div>
    )
  const weekPay = r.weekPayPence!
  return (
    <div className="grid grid-cols-1 gap-3">
      <div>
        <p className="text-sm text-dim">{w.method === 'basic' && !w.inHours ? 'A week’s holiday pay, for the 4 weeks of regulation 13' : 'A week’s holiday pay'}</p>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{pounds(weekPay)}</p>
        <p className="text-xs text-dim tabular-nums">{poundsExact(r.weekPay!)} before rounding to the penny</p>
      </div>
      {w.method === 'basic' && r.basicPence !== null && r.extras && (
        <p className="text-sm text-pretty">
          Basic pay {pounds(r.basicPence)} plus average extras {pounds(roundHalfUp(r.extras))} a week ({poundsExact(r.extras)}).{' '}
          {w.inHours
            ? 'As an irregular-hours or part-year worker, all their leave is paid at this rate (regulation 15B).'
            : `For the other 1.6 weeks (regulation 13A), basic pay of ${pounds(r.basicPence)} is the minimum; paying ${pounds(weekPay)} for all 5.6 weeks is allowed.`}
        </p>
      )}
      {w.method === 'varies' && r.averageRate && r.weeklyHours && (
        <p className="text-sm text-pretty">
          An average of {pounds(roundHalfUp(r.averageRate))} an hour ({poundsExact(r.averageRate)}) over {hoursText(r.totalHours)} hours worked, times{' '}
          {w.rota ? `their average of ${(Number(r.weeklyHours.num) / Number(r.weeklyHours.den)).toFixed(2)} hours a week` : `${hoursText(Number(r.weeklyHours.num))} normal hours a week`}.
          {!w.rota && ' Regular overtime worked beyond their normal hours isn’t in this figure: for the 4 weeks of regulation 13 (and all the leave of irregular-hours and part-year workers) its weekly average has to be added (regulation 16(3ZB)). For a set basic wage plus regular overtime, choose “set basic pay, plus extras”.'}
          {!w.inHours && ' For the other 1.6 weeks (regulation 13A) the minimum can be a little lower where overtime is paid at a premium; paying this figure for all 5.6 weeks is allowed.'}
        </p>
      )}
      {w.method === 'none' && (
        <p className="text-sm text-pretty">
          {pounds(r.totalPay)} over {plural(r.used, 'week')}.
        </p>
      )}
      {w.inHours && (
        <p className="text-sm text-pretty">
          {r.hourlyRate ? (
            <>
              An hour of leave: <span className="font-medium tabular-nums">{pounds(roundHalfUp(r.hourlyRate))}</span> ({poundsExact(r.hourlyRate)}), the week’s pay divided by the{' '}
              {(r.totalHours / 3600 / r.used).toFixed(2)} hours a week worked on average in the weeks used (regulation 16(1A)). Weeks of paid holiday count their holiday pay but no hours
              worked, so this can be more than their usual hourly pay.
            </>
          ) : (
            'For the rate for an hour of leave, enter the hours worked in every week used.'
          )}
        </p>
      )}
      {r.from && r.to && (
        <p className="text-sm text-pretty text-dim">
          From the weeks {shortDate(r.from)} to {shortDate(r.to)}.
        </p>
      )}
      {counts}
      {r.notes.map((n) => (
        <p key={n} className="text-sm text-pretty">
          {n}
        </p>
      ))}
      {w.method === 'basic' && !w.countHoliday && r.rows.some((x) => x.fate === 'skipped' && x.reason.startsWith('holiday')) && <OtherReading w={w} r={r} />}
    </div>
  )
}

/** Basic pay with extras, holiday weeks left out: what counting them would give, so the choice is made on the figures. */
function OtherReading({ w, r }: { w: Working; r: Result }) {
  const other = calculate({ ...w, countHoliday: true })
  const text =
    other.status === 'final' && other.weekPayPence !== null
      ? other.weekPayPence === r.weekPayPence
        ? 'Counting them would give the same figure.'
        : `Counting them would give ${pounds(other.weekPayPence)}${other.weekPayPence < r.weekPayPence! ? ', so leaving them out is the higher figure here' : ', so counting them is the higher figure here'}.`
      : 'Counting them needs their extras entered.'
  return <p className="text-sm text-pretty text-dim">Weeks of paid holiday were left out of the extras’ average. {text}</p>
}

function PrintRecord({ w, r }: { w: Working; r: Result }) {
  if (r.status !== 'final') return null
  let lastShown = 0
  r.rows.forEach((x, i) => {
    if (x.fate === 'used' || x.fate === 'skipped') lastShown = i
  })
  const rows = r.rows.slice(0, lastShown + 1)
  const method = METHODS.find((m) => m.id === w.method)!
  const today = new Date()
  const made = `${today.getDate()} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][today.getMonth()]} ${today.getFullYear()}`
  return (
    <div className="hidden text-sm print:block">
      <h2 className="text-xl font-semibold">Holiday pay working{w.worker.trim() ? `: ${w.worker.trim()}` : ''}</h2>
      <dl className="mt-3 grid grid-cols-[12rem_1fr] gap-x-4 gap-y-1">
        <dt className="text-dim">First day of the leave</dt>
        <dd>{longDate(w.leave)}</dd>
        <dt className="text-dim">How the week’s pay is worked out</dt>
        <dd>
          {method.label}
          {w.method === 'varies' ? (w.rota ? ', hours by rota (their average)' : `, ${w.normalHours.trim()} normal hours a week`) : ''}
          {w.method === 'basic' && r.basicPence !== null ? `, basic pay ${pounds(r.basicPence)} a week${w.countHoliday ? ', paid holiday weeks counted in the extras’ average' : ', paid holiday weeks left out of the extras’ average'}` : ''}
          {w.inHours ? '; an irregular-hours or part-year worker (regulation 15B)' : ''}
        </dd>
        <dt className="text-dim">Weeks</dt>
        <dd>
          ending on {dayName(w.weekEnd)}; week 1 ends {longDate(r.end)}; nothing before {longDate(r.limit)}
          {w.employedFrom ? `; employed from ${longDate(w.employedFrom)}` : ''}
        </dd>
        <dt className="text-dim">A week’s holiday pay</dt>
        <dd className="font-semibold">
          {pounds(r.weekPayPence!)} ({poundsExact(r.weekPay!)} before rounding)
          {w.method === 'basic' && r.basicPence !== null ? (w.inHours ? ', for all their leave (an irregular-hours or part-year worker, regulation 15B)' : `, for the 4 weeks of regulation 13; at least ${pounds(r.basicPence)} (basic pay) for the other 1.6 weeks`) : ''}
        </dd>
        {w.inHours && r.hourlyRate && (
          <>
            <dt className="text-dim">An hour of leave</dt>
            <dd>{pounds(roundHalfUp(r.hourlyRate))} (regulation 16(1A): the week’s pay divided by the average weekly hours worked in the weeks used)</dd>
          </>
        )}
        <dt className="text-dim">From</dt>
        <dd>
          {plural(r.used, 'week')}, {pounds(r.totalPay)}
          {w.method === 'basic' ? ' of extras' : ''}
          {w.method !== 'basic' && r.totalHours ? `, ${hoursText(r.totalHours)} hours worked` : ''}
        </dd>
        {w.method === 'varies' && r.averageRate && r.weeklyHours && (
          <>
            <dt className="text-dim">Worked out as</dt>
            <dd>
              an average of {pounds(roundHalfUp(r.averageRate))} an hour ({poundsExact(r.averageRate)}), times{' '}
              {w.rota ? `their average of ${(Number(r.weeklyHours.num) / Number(r.weeklyHours.den)).toFixed(2)} hours a week` : `${hoursText(Number(r.weeklyHours.num))} normal hours a week`}; regular
              overtime beyond the normal hours isn’t included and is added separately for the 4 weeks
            </dd>
          </>
        )}
        {w.method === 'basic' && r.extras && r.basicPence !== null && (
          <>
            <dt className="text-dim">Worked out as</dt>
            <dd>
              basic pay {pounds(r.basicPence)} plus average extras {pounds(roundHalfUp(r.extras))} a week ({poundsExact(r.extras)})
            </dd>
          </>
        )}
      </dl>
      {r.notes.map((n) => (
        <p key={n} className="mt-2">
          {n}
        </p>
      ))}
      <table className="mt-4 w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-rule">
            <th className="py-1 pr-2 font-medium">Week</th>
            <th className="py-1 pr-2 font-medium">Dates</th>
            <th className="py-1 pr-2 font-medium">What happened</th>
            <th className="py-1 pr-2 text-right font-medium">{w.method === 'basic' ? 'Extras' : 'Pay'}</th>
            <th className="py-1 pr-2 text-right font-medium">Hours</th>
            <th className="py-1 font-medium">Counted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => (
            <tr key={x.end} className="print-row border-b border-rule">
              <td className="py-0.5 pr-2">{x.n}</td>
              <td className="py-0.5 pr-2">{spanText(x.start, x.end)}</td>
              <td className="py-0.5 pr-2">{HAPPENED.find((h) => h.id === x.happened)?.label}</td>
              <td className="py-0.5 pr-2 text-right tabular-nums">{x.pay?.ok ? pounds(x.pay.value) : ''}</td>
              <td className="py-0.5 pr-2 text-right tabular-nums">{x.hours?.ok && x.happened !== 'holiday' ? hoursText(x.hours.value) : ''}</td>
              <td className="py-0.5">{x.fate === 'used' ? 'yes' : `no: ${x.reason}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-dim">
        Worked out on {made} by the 52-week rule of the Working Time Regulations 1998, regulation 16 (applying the Employment Rights Act 1996, sections 221 to 224), as GOV.UK and Acas
        explain it. Which payments count is the employer’s decision. Made with Holiday Pay Average,
        labs.eugeneyip.net/holiday-pay-average/.
      </p>
    </div>
  )
}

