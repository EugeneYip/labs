import { memo, useCallback, useEffect, useState } from 'react'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { Board } from './Board.tsx'
import {
  allowed,
  atClock,
  candidateTiming,
  DEFAULT_SETTINGS,
  EMPTY_EXAM,
  labelKey,
  lengthFrom,
  lengthText,
  LIMITS,
  minutesText,
  paperTiming,
  parseExtra,
  percentText,
  repeatedLabels,
  roomPaused,
  sanitizeExam,
  sanitizeSettings,
  shownFinish,
  shownStart,
  type Candidate,
  type Exam,
  type Paper,
  type Settings,
} from './model.ts'
import { clockText, dateText, exactText, field, fieldTime, onBreak, outline, primary, quiet, timeField, useNow, useWakeLock } from './ui.ts'

// The exam in progress and the board's settings, kept on this device, so a reload mid-exam comes back to it.
const STORAGE_KEY = 'labs:exam-timekeeper'
const BOARD = '#board'
/** A break or stop ended sooner than this was started by mistake. */
const MISTAKE_MS = 3000

interface Saved {
  exam: Exam
  settings: Settings
}

const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

/** Experiment #026: the exam room's clock and board, keeping each candidate's own finish time through extra time and rest breaks. */
export default function ExamTimekeeper() {
  const [{ saved, unreadable }, setLoaded] = useState(load)
  const setSaved = (f: (s: Saved) => Saved) => setLoaded((l) => ({ saved: f(l.saved), unreadable: l.unreadable }))
  const [view, setView] = useState<'controls' | 'board'>(() => (location.hash === BOARD ? 'board' : 'controls'))
  const now = useNow()
  const [said, setSaid] = useState('')

  const [notSaving, setNotSaving] = useState(false)
  // An exam changed in another open window (the board's, or a second tab) is taken up here, so this one can't save
  // an older exam over it. The fields start again from it, as some hold their own copies.
  const [synced, setSynced] = useState(0)
  const save = useOtherTabs(STORAGE_KEY, () => {
    setLoaded((l) => ({ saved: load().saved, unreadable: l.unreadable }))
    setSynced((n) => n + 1)
  })

  useEffect(() => {
    try {
      save(JSON.stringify({ version: 1, ...saved }))
      setNotSaving(false)
    } catch {
      // Full or blocked storage: a reload would lose the times, so the page says so.
      setNotSaving(true)
    }
  }, [saved, save])

  useEffect(() => {
    const onHash = () => setView(location.hash === BOARD ? 'board' : 'controls')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const show = (next: 'controls' | 'board') => {
    if (next === 'controls' && document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    history.replaceState(null, '', next === 'board' ? BOARD : location.pathname + location.search)
    setView(next)
    window.scrollTo({ top: 0 })
  }

  const { exam, settings } = saved
  const started = exam.papers.some((p) => p.start !== null)
  const awake = useWakeLock(view === 'board' || started)
  // Kept the same from one second to the next, so parts drawn from it only once a minute stay put.
  const setExam = useCallback((f: (e: Exam) => Exam) => setLoaded((l) => ({ saved: { ...l.saved, exam: f(l.saved.exam) }, unreadable: l.unreadable })), [])
  const setSettings = (patch: Partial<Settings>) => setSaved((s) => ({ ...s, settings: { ...s.settings, ...patch } }))

  if (view === 'board') return <Board exam={exam} settings={settings} now={now} onControls={() => show('controls')} />

  const stopped = roomPaused(exam)
  const openPause = exam.roomPauses.find((p) => p.to === null)
  const firstStart = Math.min(...exam.papers.map((p) => p.start ?? Infinity))
  const fromAnotherDay = Number.isFinite(firstStart) && new Date(firstStart).toDateString() !== new Date(now).toDateString()

  const stopEveryone = () => {
    const at = Date.now()
    setExam((e) => (roomPaused(e) ? e : { ...e, roomPauses: [...e.roomPauses, { from: at, to: null }] }))
    setSaid(`Everyone’s time stopped at ${exactText(at, settings)}.`)
  }
  const startEveryone = () => {
    const at = Date.now()
    const mistake = openPause !== undefined && at - openPause.from < MISTAKE_MS
    setExam((e) => ({ ...e, roomPauses: mistake ? e.roomPauses.filter((p) => p.to !== null) : e.roomPauses.map((p) => (p.to === null ? { ...p, to: Math.max(p.from, at) } : p)) }))
    setSaid(mistake ? 'The stop was cancelled.' : `Everyone’s time started again at ${exactText(at, settings)}.`)
  }

  const away = exam.candidates.filter((c) => c.breaks.some((b) => b.to === null)).map((c) => c.label)

  return (
    <div className="flex-1">
      {/* The invigilator's own view of the time, kept in sight while scrolling. */}
      <div className="sticky top-0 z-10 border-b border-rule bg-paper/95 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-2 text-sm sm:px-6">
          <p className="text-lg font-semibold tabular-nums">{exactText(now, settings)}</p>
          {stopped && <p className="font-medium text-amber-800 dark:text-amber-300">Everyone’s time is stopped</p>}
          {away.length > 0 && (
            <p className="min-w-0 font-medium text-amber-800 dark:text-amber-300" dir="auto">
              On a break: {away.join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-10 print:block print:p-0">
        <section aria-labelledby="exam-heading" className="grid gap-4 print:hidden">
          <h2 id="exam-heading" className="sr-only">
            The exam
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            A clock and board for the exam room. Project it to show the actual time, the date, and each paper’s start and finish, with a finish for each extra-time group. List the candidates
            who take supervised rest breaks or start late, and it keeps each one’s own finish time: their time stops for a break and starts again when they’re back.
          </p>
          <ul className="grid max-w-prose list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
            <li>
              For exams under JCQ’s rules, such as GCSEs and A levels, JCQ’s instructions say the clock must show the actual time, and countdown and count-up clocks aren’t allowed, so the
              board shows the time of day. Labs isn’t connected with JCQ: your SENCo’s and your centre’s instructions decide every arrangement.
            </li>
            <li>The clock is this device’s own, so check it matches the room’s other clocks before the exam. Times are counted to the second, and finishes are shown rounded up to the minute.</li>
            <li>What you enter stays in this browser on this device, and nothing is sent anywhere. Use candidate numbers or initials, not names, and start a new exam once its record is printed.</li>
          </ul>
          {notSaving && (
            <NotSaving>
              This browser isn’t saving the exam (its storage is full or blocked), so a reload or a closed window would lose its times. Keep this page open, and write the finish times down.
            </NotSaving>
          )}
          {unreadable && <p className="rounded-xl border border-rule px-4 py-3 text-sm text-pretty">The exam saved in this browser couldn’t be read, so this is a new one.</p>}
          {fromAnotherDay && (
            <p className="rounded-xl border border-rule px-4 py-3 text-sm text-pretty">
              This exam started on {dateText(firstStart)}. Print its record if you need it, then start a new exam at the bottom of the page.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={primary}
              onClick={() => {
                const opened = window.open(location.pathname + BOARD, 'labs-exam-board')
                setSaid(opened ? 'The board opened in a new window.' : 'The browser didn’t open a new window. Use Show the board here instead.')
              }}
            >
              Open the board in a new window
            </button>
            <button type="button" className={outline} onClick={() => show('board')}>
              Show the board here
            </button>
          </div>
          <p className="max-w-prose text-sm text-pretty text-dim">
            With a projector as a second screen, drag the new window onto it and press Full screen there; the board and these controls stay in step. With one screen, show the board here, and
            press Controls on it to come back.
            {awake === null && ' This browser can’t keep the screen on, so set the device not to sleep during the exam.'}
          </p>
        </section>

        <Papers key={`papers-${synced}`} exam={exam} settings={settings} now={now} setExam={setExam} say={setSaid} />

        {started && (
          <section aria-labelledby="room-heading" className="grid gap-3 print:hidden">
            <h2 id="room-heading" className="text-lg font-semibold tracking-tight">
              Everyone’s time
            </h2>
            {stopped && openPause ? (
              <>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Everyone’s time has been stopped since {exactText(openPause.from, settings)} ({lengthText(now - openPause.from)}).
                </p>
                <div>
                  <button type="button" className={primary} onClick={startEveryone}>
                    Start everyone’s time again
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="max-w-prose text-sm text-pretty text-dim">For an evacuation or an emergency: every paper and every candidate stops until you start it again.</p>
                <div>
                  <button type="button" className={outline} onClick={stopEveryone}>
                    Stop everyone’s time
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        <Candidates key={`candidates-${synced}`} exam={exam} settings={settings} now={now} setExam={setExam} say={setSaid} />

        <section aria-labelledby="board-heading" className="grid gap-3 print:hidden">
          <h2 id="board-heading" className="text-lg font-semibold tracking-tight">
            Board
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Centre number (optional)</span>
              <input value={exam.centre} maxLength={LIMITS.centre} onChange={(e) => setExam((x) => ({ ...x, centre: e.target.value }))} className={field} inputMode="numeric" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Room (optional, for the record)</span>
              <input value={exam.room} maxLength={LIMITS.room} onChange={(e) => setExam((x) => ({ ...x, room: e.target.value }))} className={field} dir="auto" />
            </label>
          </div>
          <label className="grid max-w-xs gap-1.5">
            <span className="text-sm font-medium">Clock</span>
            <select
              value={settings.hour12 === null ? 'device' : settings.hour12 ? '12' : '24'}
              onChange={(e) => setSettings({ hour12: e.target.value === 'device' ? null : e.target.value === '12' })}
              className={`${field} cursor-pointer`}
            >
              <option value="device">As this device shows it</option>
              <option value="24">24-hour</option>
              <option value="12">12-hour</option>
            </select>
          </label>
          <Check checked={settings.seconds} onChange={(seconds) => setSettings({ seconds })}>
            Show seconds on the clock
          </Check>
          <Check checked={settings.dark} onChange={(dark) => setSettings({ dark })}>
            Light text on black, which glares less on a projector
          </Check>
          <Check checked={settings.showCandidates} onChange={(showCandidates) => setSettings({ showCandidates })}>
            Show each listed candidate’s own finish time on the board, by what you typed for them
          </Check>
        </section>

        {exam.papers.length > 0 && <Record exam={exam} settings={settings} now={stopped || exam.candidates.some(onBreakNow) ? now : minuteOf(now)} />}

        <section aria-labelledby="new-heading" className="grid gap-2 print:hidden">
          <h2 id="new-heading" className="sr-only">
            New exam
          </h2>
          <div>
            <button
              type="button"
              className={quiet}
              onClick={() => {
                if (exam.papers.length + exam.candidates.length > 0 && !window.confirm('Clear this exam from this browser? Print its record first if you need it.')) return
                setExam(() => EMPTY_EXAM)
                setSaid('A new exam: the old one is cleared from this browser.')
              }}
            >
              Start a new exam
            </button>
          </div>
        </section>
        <p role="status" className="sr-only">
          {said}
        </p>
      </div>
    </div>
  )
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (checked: boolean) => void; children: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 cursor-pointer accent-current" />
      <span className="text-pretty">{children}</span>
    </label>
  )
}

interface Part {
  exam: Exam
  settings: Settings
  now: number
  setExam: (f: (e: Exam) => Exam) => void
  say: (message: string) => void
}

function Papers({ exam, settings, now, setExam, say }: Part) {
  const update = (id: string, patch: Partial<Paper>) => setExam((e) => ({ ...e, papers: e.papers.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  return (
    <section aria-labelledby="papers-heading" className="grid gap-4 print:hidden">
      <h2 id="papers-heading" className="text-lg font-semibold tracking-tight">
        Papers
      </h2>
      {exam.papers.length === 0 && <p className="text-sm text-dim">Add each paper sat in this room.</p>}
      {exam.papers.map((paper, i) => (
        <PaperCard
          key={paper.id}
          paper={paper}
          index={i}
          exam={exam}
          settings={settings}
          now={now}
          onChange={(patch) => update(paper.id, patch)}
          onRemove={() => {
            const theirs = exam.candidates.filter((c) => c.paperId === paper.id).length
            if ((paper.start !== null || theirs > 0) && !window.confirm(`Remove ${paper.title.trim() || 'this paper'}${theirs ? ` and its ${theirs} listed ${theirs === 1 ? 'candidate' : 'candidates'}` : ''}?`)) return
            setExam((e) => ({ ...e, papers: e.papers.filter((p) => p.id !== paper.id), candidates: e.candidates.filter((c) => c.paperId !== paper.id) }))
            say('Paper removed.')
          }}
          say={say}
        />
      ))}
      {exam.papers.length < LIMITS.papers && (
        <div>
          <button type="button" className={outline} onClick={() => setExam((e) => ({ ...e, papers: [...e.papers, { id: newId(), title: '', minutes: 60, extra: [], start: null }] }))}>
            Add a paper
          </button>
        </div>
      )}
    </section>
  )
}

function PaperCard({ paper, index, exam, settings, now, onChange, onRemove, say }: { paper: Paper; index: number; exam: Exam; settings: Settings; now: number; onChange: (patch: Partial<Paper>) => void; onRemove: () => void; say: (message: string) => void }) {
  const name = paper.title.trim() || `Paper ${index + 1}`
  const start = () => {
    const at = Date.now()
    onChange({ start: at })
    say(`${name} started at ${exactText(at, settings)}.`)
  }
  return (
    <fieldset className="grid min-w-0 gap-4 rounded-2xl border border-rule p-4 sm:p-5">
      <legend className="px-1 font-mono text-xs text-dim">Paper {index + 1}</legend>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Subject and paper</span>
          <input value={paper.title} maxLength={LIMITS.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Such as GCSE Mathematics Paper 1 (8300/1H)" className={field} dir="auto" />
        </label>
        <LengthFields minutes={paper.minutes} onChange={(minutes) => onChange({ minutes })} />
      </div>
      <ExtraGroups extra={paper.extra} onChange={(extra) => onChange({ extra })} />
      {paper.start === null ? (
        <div className="flex flex-wrap items-end gap-3">
          <button type="button" className={primary} onClick={start}>
            Start {name} now
          </button>
          <label className="grid gap-1.5">
            <span className="text-sm text-dim">Or it started at</span>
            <input
              type="time"
              value=""
              onChange={(e) => {
                const at = atClock(e.target.value, Date.now())
                if (at !== null) onChange({ start: at })
              }}
              className={`${timeField} w-36`}
            />
          </label>
        </div>
      ) : (
        <PaperTimes paper={paper} exam={exam} settings={settings} now={now} onChange={onChange} name={name} />
      )}
      <div className="-mx-2 -mb-2">
        <button type="button" className={quiet} onClick={onRemove}>
          Remove this paper
        </button>
      </div>
    </fieldset>
  )
}

function PaperTimes({ paper, exam, settings, now, onChange, name }: { paper: Paper; exam: Exam; settings: Settings; now: number; onChange: (patch: Partial<Paper>) => void; name: string }) {
  const groups = [0, ...paper.extra].map((extra) => ({ extra, t: paperTiming(exam, paper, extra, now)! }))
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Started at</span>
          <input
            type="time"
            value={fieldTime(paper.start!)}
            onChange={(e) => {
              const at = atClock(e.target.value, paper.start!)
              if (at !== null) onChange({ start: at })
            }}
            className={`${timeField} w-36`}
          />
        </label>
        <p className="pb-2.5 text-sm text-dim tabular-nums">{exactText(paper.start!, settings)}</p>
        <button
          type="button"
          className={`${quiet} -ml-2`}
          onClick={() => {
            if (window.confirm(`Clear the start of ${name}? Its finish times go until it’s started again.`)) onChange({ start: null })
          }}
        >
          Clear the start
        </button>
      </div>
      {paper.start! % 60_000 !== 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <p className="text-pretty text-dim">Started part way through a minute, so its finishes count from {exactText(paper.start!, settings)} and are rounded up.</p>
          <button type="button" className="cursor-pointer underline underline-offset-4 hover:text-dim" onClick={() => onChange({ start: shownStart(paper.start!) })}>
            Count from {exactText(shownStart(paper.start!), settings)}
          </button>
        </div>
      )}
      <ul className="grid gap-1 text-sm tabular-nums">
        {groups.map(({ extra, t }) => (
          <li key={extra}>
            <span className="font-medium">{extra === 0 ? 'Finish' : `${percentText(extra)} extra time`}: </span>
            {t.finish === null ? (
              <span className="text-amber-800 dark:text-amber-300">stopped, {lengthText(t.remaining)} to go</span>
            ) : (
              <>
                {clockText(shownFinish(t.finish), settings)} <span className="text-dim">({exactText(t.finish, settings)}{t.stopped > 0 && `, after ${lengthText(t.stopped)} stopped`})</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LengthFields({ minutes, onChange }: { minutes: number; onChange: (minutes: number) => void }) {
  const [hours, setHours] = useState(String(Math.floor(minutes / 60)))
  const [mins, setMins] = useState(String(minutes % 60))
  const [last, setLast] = useState(minutes)
  // Changed from outside (another window), so show the new length.
  if (minutes !== last) {
    setLast(minutes)
    setHours(String(Math.floor(minutes / 60)))
    setMins(String(minutes % 60))
  }
  const value = lengthFrom(hours, mins)
  const commit = (h: string, m: string) => {
    const v = lengthFrom(h, m)
    if (v !== null) {
      setLast(v)
      onChange(v)
    }
  }
  return (
    <fieldset className="grid gap-1.5">
      <legend className="mb-1.5 text-sm font-medium">Length</legend>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1.5">
          <input
            value={hours}
            onChange={(e) => {
              setHours(e.target.value)
              commit(e.target.value, mins)
            }}
            inputMode="numeric"
            aria-label="Hours"
            aria-invalid={value === null || undefined}
            className={`${field} w-16 tabular-nums`}
          />
          <span className="text-sm text-dim" aria-hidden="true">
            h
          </span>
        </label>
        <label className="flex items-center gap-1.5">
          <input
            value={mins}
            onChange={(e) => {
              setMins(e.target.value)
              commit(hours, e.target.value)
            }}
            inputMode="numeric"
            aria-label="Minutes"
            aria-invalid={value === null || undefined}
            className={`${field} w-16 tabular-nums`}
          />
          <span className="text-sm text-dim" aria-hidden="true">
            min
          </span>
        </label>
      </div>
      {value === null && <p className="text-sm text-red-700 dark:text-red-400">Hours and minutes (0–59), from 1 minute to {LIMITS.minutes / 60} hours. Still {minutesText(minutes)}.</p>}
    </fieldset>
  )
}

function ExtraGroups({ extra, onChange }: { extra: number[]; onChange: (extra: number[]) => void }) {
  const [other, setOther] = useState('')
  const add = (value: number) => onChange([...new Set([...extra, value])].sort((a, b) => a - b))
  const parsed = parseExtra(other)
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium">Extra-time finishes on the board</legend>
      <div className="flex flex-wrap items-center gap-2">
        {extra.length === 0 && <span className="text-sm text-dim">None yet.</span>}
        {extra.map((x) => (
          <button key={x} type="button" onClick={() => onChange(extra.filter((y) => y !== x))} className={`${outline} rounded-full`} aria-label={`Remove the ${percentText(x)} extra-time finish`}>
            {percentText(x)} <span aria-hidden="true">×</span>
          </button>
        ))}
      </div>
      {extra.length < 6 && (
        <div className="flex flex-wrap items-center gap-2">
          {[25, 50]
            .filter((x) => !extra.includes(x))
            .map((x) => (
              <button key={x} type="button" className={quiet} onClick={() => add(x)}>
                Add {x}%
              </button>
            ))}
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (parsed === null) return
              add(parsed)
              setOther('')
            }}
          >
            <label className="flex items-center gap-1.5">
              <span className="sr-only">Other extra time, as a percentage</span>
              <input value={other} onChange={(e) => setOther(e.target.value)} placeholder="Other %" inputMode="decimal" aria-invalid={(other.trim() !== '' && parsed === null) || undefined} className={`${field} w-24`} />
            </label>
            <button type="submit" className={quiet} disabled={parsed === null}>
              Add
            </button>
          </form>
        </div>
      )}
    </fieldset>
  )
}

function Candidates({ exam, settings, now, setExam, say }: Part) {
  const [label, setLabel] = useState('')
  const [paperId, setPaperId] = useState(exam.papers[0]?.id ?? '')
  const [extra, setExtra] = useState<number | null>(0)
  const [note, setNote] = useState('')
  const [tried, setTried] = useState(false)
  const paper = exam.papers.find((p) => p.id === paperId) ?? exam.papers[0]
  const repeated = repeatedLabels(exam.candidates)
  const full = exam.candidates.length >= LIMITS.candidates

  const update = useCallback((id: string, f: (c: Candidate) => Candidate) => setExam((e) => ({ ...e, candidates: e.candidates.map((c) => (c.id === id ? f(c) : c)) })), [setExam])
  const remove = useCallback(
    (c: Candidate) => {
      if ((c.breaks.length > 0 || c.start !== null) && !window.confirm(`Remove ${c.label} and their recorded times?`)) return
      setExam((x) => ({ ...x, candidates: x.candidates.filter((y) => y.id !== c.id) }))
      say(`${c.label} removed.`)
    },
    [setExam, say],
  )
  const stopped = roomPaused(exam)

  return (
    <section aria-labelledby="candidates-heading" className="grid gap-4 print:hidden">
      <h2 id="candidates-heading" className="text-lg font-semibold tracking-tight">
        Candidates with their own finish time
      </h2>
      <p className="max-w-prose text-sm text-pretty text-dim">
        List anyone whose time isn’t on the board: supervised rest breaks, a late start, or extra time other than the board’s groups. Their time stops while they’re on a break.
      </p>
      {exam.papers.length === 0 ? (
        <p className="text-sm text-dim">Add a paper first.</p>
      ) : (
        <form
          className="grid gap-3 rounded-2xl border border-rule p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault()
            setTried(true)
            if (!label.trim() || extra === null || !paper || full) return
            const candidate: Candidate = { id: newId(), label: label.trim().slice(0, LIMITS.label), paperId: paper.id, extra, start: null, breaks: [], note: note.trim().slice(0, LIMITS.note) }
            setExam((x) => ({ ...x, candidates: [...x.candidates, candidate] }))
            say(`${candidate.label} added.`)
            setLabel('')
            setNote('')
            setTried(false)
          }}
        >
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Candidate number or initials</span>
            <input value={label} maxLength={LIMITS.label} onChange={(e) => setLabel(e.target.value)} aria-invalid={(tried && !label.trim()) || undefined} className={field} dir="auto" />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Paper</span>
            <select value={paper?.id ?? ''} onChange={(e) => setPaperId(e.target.value)} className={`${field} cursor-pointer`}>
              {exam.papers.map((p, i) => (
                <option key={p.id} value={p.id}>
                  {p.title.trim() || `Paper ${i + 1}`}
                </option>
              ))}
            </select>
          </label>
          <ExtraField value={extra} choices={choicesFor(paper)} onChange={setExtra} invalid={tried && extra === null} />
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Note (optional)</span>
            <input value={note} maxLength={LIMITS.note} onChange={(e) => setNote(e.target.value)} placeholder="Such as: up to 3 breaks of 10 min" className={field} dir="auto" />
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
            <button type="submit" className={outline} disabled={full}>
              Add candidate
            </button>
            {tried && !label.trim() && <p className="text-sm text-red-700 dark:text-red-400">Type a candidate number or initials.</p>}
            {full && <p className="text-sm text-dim">That’s the most this page lists ({LIMITS.candidates}).</p>}
          </div>
        </form>
      )}
      {repeated.size > 0 && <p className="text-sm text-pretty text-dim">Two listed candidates have the same number or initials, so add something to tell them apart.</p>}
      {exam.candidates.length > 0 && (
        <ul className="grid gap-3">
          {exam.candidates.map((c) => (
            // A row changes by the second only while its time is stopped; otherwise it's drawn again once a minute.
            <CandidateRow key={c.id} candidate={c} exam={exam} settings={settings} now={stopped || onBreakNow(c) ? now : minuteOf(now)} repeated={repeated.has(labelKey(c.label))} onChange={update} onRemove={remove} say={say} />
          ))}
        </ul>
      )}
    </section>
  )
}

const minuteOf = (t: number) => Math.floor(t / 60_000) * 60_000
const onBreakNow = (c: Candidate) => c.breaks.some((b) => b.to === null)

const CandidateRow = memo(function CandidateRow({ candidate: c, exam, settings, now, repeated, onChange: change, onRemove, say }: { candidate: Candidate; exam: Exam; settings: Settings; now: number; repeated: boolean; onChange: (id: string, f: (c: Candidate) => Candidate) => void; onRemove: (c: Candidate) => void; say: (message: string) => void }) {
  const onChange = (f: (c: Candidate) => Candidate) => change(c.id, f)
  const paperIndex = exam.papers.findIndex((p) => p.id === c.paperId)
  const paper = exam.papers[paperIndex]
  const t = candidateTiming(exam, c, now)
  const open = c.breaks.find((b) => b.to === null)
  const finished = t?.finish != null && t.finish <= now
  const [editing, setEditing] = useState(false)
  const stoppedTotal = c.breaks.reduce((sum, b) => sum + ((b.to ?? now) - b.from), 0)

  const startBreak = () => {
    const at = Date.now()
    onChange((x) => (x.breaks.some((b) => b.to === null) ? x : { ...x, breaks: [...x.breaks, { from: at, to: null }] }))
    say(`${c.label} on a rest break from ${exactText(at, settings)}.`)
  }
  const endBreak = () => {
    const at = Date.now()
    // Back within a few seconds can only be a tap by mistake, so that break is dropped rather than kept.
    const mistake = open !== undefined && at - open.from < MISTAKE_MS
    const next: Candidate = { ...c, breaks: mistake ? c.breaks.filter((b) => b.to !== null) : c.breaks.map((b) => (b.to === null ? { ...b, to: Math.max(b.from, at) } : b)) }
    onChange(() => next)
    const after = candidateTiming(exam, next, at)
    const finish = after?.finish != null ? `: finishes ${clockText(shownFinish(after.finish), settings)}` : ''
    say(mistake ? `${c.label}’s break was cancelled${finish}.` : `${c.label} back at ${exactText(at, settings)}${finish}.`)
  }

  return (
    <li className={`grid gap-3 rounded-2xl border p-4 sm:p-5 ${open ? 'border-amber-600 dark:border-amber-400' : 'border-rule'}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="font-semibold" dir="auto">
          {c.label}
        </p>
        <p className="text-sm text-dim" dir="auto">
          {paper?.title.trim() || `Paper ${paperIndex + 1}`} · {c.extra > 0 ? `${percentText(c.extra)} extra time` : 'no extra time'}
          {c.note && ` · ${c.note}`}
        </p>
        {repeated && <p className="text-sm text-red-700 dark:text-red-400">Same as another candidate</p>}
      </div>
      <p className="text-sm tabular-nums">
        {!t ? (
          <span className="text-dim">Their time starts with the paper.</span>
        ) : open ? (
          <span className="font-medium text-amber-800 dark:text-amber-300">
            On a rest break since {exactText(open.from, settings)} ({lengthText(now - open.from)}); {lengthText(t.remaining)} of working time left
          </span>
        ) : t.finish === null ? (
          <span className="text-amber-800 dark:text-amber-300">Time stopped; {lengthText(t.remaining)} of working time left</span>
        ) : (
          <>
            <span className="font-medium">
              {finished ? 'Finished' : 'Finishes'} {clockText(shownFinish(t.finish), settings)}
            </span>{' '}
            <span className="text-dim">({exactText(t.finish, settings)})</span>
          </>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {open ? (
          <button type="button" className={onBreak} onClick={endBreak} aria-label={`${c.label} is back from the break`}>
            Back from the break
          </button>
        ) : (
          <button type="button" className={outline} onClick={startBreak} disabled={!t || finished} aria-label={`Start a rest break for ${c.label}`}>
            Rest break
          </button>
        )}
        <button type="button" className={quiet} onClick={() => setEditing(!editing)} aria-expanded={editing} aria-label={`Change ${c.label}’s details or late start`}>
          Change
        </button>
        <button type="button" className={quiet} onClick={() => onRemove(c)} aria-label={`Remove ${c.label}`}>
          Remove
        </button>
      </div>
      {editing && (
        <div className="grid gap-3 rounded-xl bg-ink/[0.03] p-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="grid content-start gap-1.5">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Started late at</span>
              <input
                type="time"
                value={c.start === null ? '' : fieldTime(c.start)}
                onChange={(e) => {
                  const at = atClock(e.target.value, c.start ?? paper?.start ?? Date.now())
                  if (at !== null) onChange((x) => ({ ...x, start: at }))
                }}
                className={`${timeField} w-full`}
              />
            </label>
            <div className="-mx-2 flex flex-wrap">
              <button type="button" className={quiet} onClick={() => onChange((x) => ({ ...x, start: Date.now() }))}>
                Now
              </button>
              {c.start !== null && (
                <button type="button" className={quiet} onClick={() => onChange((x) => ({ ...x, start: null }))}>
                  With the paper
                </button>
              )}
            </div>
          </div>
          <ExtraField value={c.extra} choices={choicesFor(paper)} onChange={(extra) => extra !== null && onChange((x) => ({ ...x, extra }))} />
          <label className="grid content-start gap-1.5">
            <span className="text-sm font-medium">Candidate number or initials</span>
            <input value={c.label} maxLength={LIMITS.label} onChange={(e) => onChange((x) => ({ ...x, label: e.target.value }))} aria-invalid={!c.label.trim() || undefined} className={field} dir="auto" />
          </label>
          <label className="grid content-start gap-1.5">
            <span className="text-sm font-medium">Note</span>
            <input value={c.note} maxLength={LIMITS.note} onChange={(e) => onChange((x) => ({ ...x, note: e.target.value }))} className={field} dir="auto" />
          </label>
        </div>
      )}
      {c.breaks.length > 0 && (
        <div className="grid gap-1 text-sm">
          <p className="text-dim">
            {c.breaks.length} {c.breaks.length === 1 ? 'break' : 'breaks'}, {lengthText(stoppedTotal)} in all
          </p>
          <ul className="grid gap-1 tabular-nums">
            {c.breaks.map((b, i) => (
              <li key={`${b.from}-${i}`} className="flex flex-wrap items-center gap-x-2">
                <span>
                  {exactText(b.from, settings)}–{b.to === null ? 'now' : exactText(b.to, settings)} ({lengthText((b.to ?? now) - b.from)})
                </span>
                {b.to !== null && (
                  <button
                    type="button"
                    className="cursor-pointer text-dim underline underline-offset-4 hover:text-ink"
                    onClick={() => {
                      if (window.confirm(`Remove the break from ${exactText(b.from, settings)}? Only for a break recorded by mistake.`)) onChange((x) => ({ ...x, breaks: x.breaks.filter((_, j) => j !== i) }))
                    }}
                    aria-label={`Remove the break from ${exactText(b.from, settings)}`}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  )
})

/** Extra-time choices for a paper: 25% and 50%, and any other group the paper shows. */
const choicesFor = (paper: Paper | undefined) => [...new Set([25, 50, ...(paper?.extra ?? [])])].sort((a, b) => a - b)

/** None, one of the usual percentages, or another typed in. Null while what's typed isn't a percentage. */
function ExtraField({ value, choices, onChange, invalid }: { value: number | null; choices: number[]; onChange: (extra: number | null) => void; invalid?: boolean }) {
  const [other, setOther] = useState(value !== null && value !== 0 && !choices.includes(value) ? String(value) : '')
  const [typing, setTyping] = useState(value !== null && value !== 0 && !choices.includes(value))
  const picked = typing ? 'other' : String(value ?? 0)
  return (
    <div className="grid content-start gap-1.5">
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Extra time</span>
        <select
          value={picked}
          onChange={(e) => {
            if (e.target.value === 'other') {
              setTyping(true)
              onChange(parseExtra(other))
            } else {
              setTyping(false)
              onChange(Number(e.target.value))
            }
          }}
          className={`${field} cursor-pointer`}
        >
          <option value="0">None</option>
          {choices.map((x) => (
            <option key={x} value={String(x)}>
              {percentText(x)}
            </option>
          ))}
          <option value="other">Other…</option>
        </select>
      </label>
      {typing && (
        <label className="grid gap-1.5">
          <span className="sr-only">Extra time, as a percentage</span>
          <input
            value={other}
            onChange={(e) => {
              setOther(e.target.value)
              onChange(parseExtra(e.target.value))
            }}
            placeholder="%"
            inputMode="decimal"
            aria-invalid={((invalid || other.trim() !== '') && parseExtra(other) === null) || undefined}
            className={field}
          />
        </label>
      )}
    </div>
  )
}

/** What happened, for the exam file: printed on its own. */
const Record = memo(function Record({ exam, settings, now }: { exam: Exam; settings: Settings; now: number }) {
  const stops = exam.roomPauses
  const cell = 'border-b border-rule px-2 py-1.5 align-top'
  return (
    <section aria-labelledby="record-heading" className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h2 id="record-heading" className="text-lg font-semibold tracking-tight">
          Record
        </h2>
        <button type="button" className={outline} onClick={() => window.print()}>
          Print the record
        </button>
      </div>
      <p className="hidden text-sm print:block">
        Exam record{exam.centre.trim() && `, centre ${exam.centre.trim()}`}
        {exam.room.trim() && `, ${exam.room.trim()}`}, printed {dateText(now)} at {exactText(now, settings)}. Times to the second; finishes shown as on the board, rounded up to the minute.
      </p>
      {/* Scrolls sideways on a phone, so it can be scrolled from the keyboard too. */}
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Record of times">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm tabular-nums">
          <thead>
            <tr className="text-dim">
              <th scope="col" className={cell}>
                Paper or candidate
              </th>
              <th scope="col" className={cell}>
                Time allowed
              </th>
              <th scope="col" className={cell}>
                Started
              </th>
              <th scope="col" className={cell}>
                Time stopped
              </th>
              <th scope="col" className={cell}>
                Finish
              </th>
            </tr>
          </thead>
          <tbody>
            {exam.papers.map((paper, i) => {
              const name = paper.title.trim() || `Paper ${i + 1}`
              const groups = [0, ...paper.extra]
              const candidates = exam.candidates.filter((c) => c.paperId === paper.id)
              return [
                ...groups.map((extra) => {
                  const t = paperTiming(exam, paper, extra, now)
                  return (
                    <tr key={`${paper.id}-${extra}`}>
                      <th scope="row" className={`${cell} font-medium`} dir="auto">
                        {name}
                        {extra > 0 && <span className="font-normal text-dim"> · {percentText(extra)} extra time</span>}
                      </th>
                      <td className={cell}>{lengthText(allowed(paper.minutes, extra))}</td>
                      <td className={cell}>{paper.start === null ? 'Not started' : exactText(paper.start, settings)}</td>
                      <td className={cell}>{t && t.stopped > 0 ? lengthText(t.stopped) : '–'}</td>
                      <td className={cell}>{finishCell(t, settings)}</td>
                    </tr>
                  )
                }),
                ...candidates.map((c) => {
                  const t = candidateTiming(exam, c, now)
                  return (
                    <tr key={c.id}>
                      <th scope="row" className={`${cell} pl-6 font-normal`} dir="auto">
                        {c.label}
                        <span className="text-dim"> · {c.extra > 0 ? `${percentText(c.extra)} extra time` : 'no extra time'}</span>
                        {c.breaks.length > 0 && (
                          <span className="block text-dim">
                            Breaks: {c.breaks.map((b) => `${exactText(b.from, settings)}–${b.to === null ? 'now' : exactText(b.to, settings)}`).join(', ')}
                          </span>
                        )}
                        {c.note && <span className="block text-dim">{c.note}</span>}
                      </th>
                      <td className={cell}>{lengthText(allowed(paper.minutes, c.extra))}</td>
                      <td className={cell}>{c.start !== null ? `${exactText(c.start, settings)} (late)` : paper.start === null ? 'Not started' : exactText(paper.start, settings)}</td>
                      <td className={cell}>{t && t.stopped > 0 ? lengthText(t.stopped) : '–'}</td>
                      <td className={cell}>{finishCell(t, settings)}</td>
                    </tr>
                  )
                }),
              ]
            })}
          </tbody>
        </table>
      </div>
      {stops.length > 0 && (
        <p className="text-sm">
          Everyone’s time stopped: {stops.map((p) => `${exactText(p.from, settings)}–${p.to === null ? 'now' : exactText(p.to, settings)} (${lengthText((p.to ?? now) - p.from)})`).join(', ')}.
        </p>
      )}
    </section>
  )
})

function finishCell(t: ReturnType<typeof paperTiming>, settings: Settings) {
  if (!t) return '–'
  if (t.finish === null) return `Stopped (${lengthText(t.remaining)} left)`
  return `${clockText(shownFinish(t.finish), settings)} (${exactText(t.finish, settings)})`
}

function load(): { saved: Saved; unreadable: boolean } {
  const fresh: Saved = { exam: EMPTY_EXAM, settings: DEFAULT_SETTINGS }
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { saved: fresh, unreadable: false }
  }
  if (raw === null) return { saved: fresh, unreadable: false }
  try {
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object') return { saved: fresh, unreadable: true }
    return { saved: { exam: sanitizeExam(data.exam, newId), settings: sanitizeSettings(data.settings) }, unreadable: false }
  } catch {
    return { saved: fresh, unreadable: true }
  }
}
