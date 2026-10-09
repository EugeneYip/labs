import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { CheckView, startRun, type Run } from './Check.tsx'
import { Log } from './Log.tsx'
import { band, clock, MINUTE, parsePassage, passageName, percent, score, type Band, type Check, type Mode, type Result } from './model.ts'
import { PrintRecord, printStyles, StudentCopy } from './Print.tsx'
import { SAMPLES } from './samples.ts'
import { area, control, field, outline, primary, quiet, unlockSound, whenText } from './ui.ts'

// The passage, settings, and saved checks, kept on this device only.
const STORAGE_KEY = 'labs:fluency-check'
const LIMITS = { text: 20_000, log: 2000, name: 80, goal: 400 }

interface Saved {
  title: string
  text: string
  student: string
  mode: Mode
  goal: number | null
  log: Check[]
}

const NORMS = 'https://brtprojects.org/an-update-to-compiled-orf-norms-technical-report-no-1702/'

/** Experiment #016: a one-minute oral reading fluency check. */
export default function FluencyCheck() {
  const [saved, setSaved] = useState(load)
  const passage = useMemo(() => parsePassage(saved.text), [saved.text])
  const [run, setRun] = useState<Run | null>(null)
  const [at, setAt] = useState(0)
  const [savedAs, setSavedAs] = useState<{ id: string; sig: string } | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      // Private browsing or full storage: nothing is remembered, but checks still work.
    }
  }, [saved])

  const change = (patch: Partial<Saved>) => setSaved((s) => ({ ...s, ...patch }))
  // The check view only ever updates a run in progress.
  const updateRun: Dispatch<SetStateAction<Run>> = useCallback((update) => setRun((r) => (r ? (typeof update === 'function' ? update(r) : update) : r)), [])

  const start = () => {
    unlockSound()
    setRun(startRun())
    setAt(Date.now())
    setSavedAs(null)
    window.scrollTo(0, 0)
  }
  const backToSetup = (nextReader: boolean) => {
    setRun(null)
    if (nextReader) change({ student: '' })
    window.scrollTo(0, 0)
  }

  const result = run?.phase === 'done' ? score(passage, run.marks, run.last, run.banked) : null
  const name = passageName(saved.title, passage)

  if (run) {
    return (
      <>
        {result && (
          <>
            <style>{printStyles}</style>
            <PrintRecord passage={passage} marks={run.marks} last={run.last} result={result} student={saved.student} passageTitle={name} mode={saved.mode} goal={saved.goal} at={at} />
          </>
        )}
        <CheckView
          passage={passage}
          mode={saved.mode}
          run={run}
          setRun={updateRun}
          onCancel={() => backToSetup(false)}
          results={
            result && (
              <Results
                result={result}
                mode={saved.mode}
                goal={saved.goal}
                student={saved.student}
                onStudent={(student) => change({ student })}
                savedAs={savedAs}
                onSave={(sig) => {
                  const id = savedAs?.id ?? newId()
                  const check: Check = { id, at, student: saved.student.trim(), passage: name, length: passage.words.length, mode: saved.mode, read: result.read, errors: result.errors, selfCorrections: result.selfCorrections, ms: result.ms, wcpm: result.wcpm, accuracy: result.accuracy, goal: saved.goal, missed: result.missed }
                  setSaved((s) => ({ ...s, log: [...s.log.filter((c) => c.id !== id), check].slice(-LIMITS.log) }))
                  setSavedAs({ id, sig })
                }}
                summary={() => summaryText(result, saved.student, name, at)}
                onNext={() => backToSetup(true)}
                onEdit={() => backToSetup(false)}
              />
            )
          }
        />
      </>
    )
  }

  return (
    <div className="flex-1">
      {passage.words.length > 0 && (
        <>
          <style>{printStyles}</style>
          <StudentCopy passage={passage} title={saved.title} />
        </>
      )}
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="max-w-prose text-pretty text-dim">
          Time a reading and tap the words a student misreads as they read aloud. Fluency Check works out words correct per minute and accuracy, gives you a marked record to print, and keeps results on this device only.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <section aria-labelledby="passage-heading" className="grid min-w-0 content-start gap-3">
            <h2 id="passage-heading" className="text-lg font-semibold tracking-tight">
              Passage
            </h2>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Title (optional)</span>
              <input value={saved.title} maxLength={LIMITS.name} onChange={(e) => change({ title: e.target.value })} className={field} dir="auto" placeholder="Shown in the record and the log" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Text</span>
              <textarea
                value={saved.text}
                maxLength={LIMITS.text}
                onChange={(e) => change({ text: e.target.value })}
                rows={12}
                className={area}
                dir="auto"
                placeholder="Paste or type the passage the student will read. Leave a blank line between paragraphs."
              />
            </label>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-dim">
              <span className="tabular-nums">{passage.words.length === 1 ? '1 word' : `${passage.words.length} words`}</span>
              <span aria-hidden="true">·</span>
              <span>Try a sample:</span>
              {SAMPLES.map((s) => (
                <button key={s.title} type="button" onClick={() => change({ title: s.title, text: s.text })} className="cursor-pointer underline underline-offset-4 hover:text-ink">
                  {s.label}
                </button>
              ))}
            </p>
          </section>

          <section aria-labelledby="check-heading" className="grid min-w-0 content-start gap-5">
            <h2 id="check-heading" className="text-lg font-semibold tracking-tight">
              Check
            </h2>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Student (optional)</span>
              <input value={saved.student} maxLength={LIMITS.name} onChange={(e) => change({ student: e.target.value })} className={field} dir="auto" placeholder="Name or initials" autoComplete="off" />
            </label>
            <fieldset className="grid gap-2">
              <legend className="mb-1.5 text-sm font-medium">Timing</legend>
              {(
                [
                  ['minute', 'One minute', 'The usual check. A tone sounds when time is up.'],
                  ['whole', 'Whole passage', 'Times the whole reading, scaled to a minute.'],
                ] as const
              ).map(([mode, label, hint]) => (
                <label key={mode} className="flex cursor-pointer items-start gap-2.5">
                  <input type="radio" name="timing" checked={saved.mode === mode} onChange={() => change({ mode })} className="mt-1 size-4 cursor-pointer accent-current" />
                  <span className="text-sm">
                    <span className="font-medium">{label}</span>
                    <span className="block text-dim">{hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <GoalField goal={saved.goal} onChange={(goal) => change({ goal })} />
            <div className="grid gap-2">
              <button type="button" onClick={start} disabled={!passage.words.length} className={primary}>
                Start the clock
              </button>
              <button type="button" onClick={() => window.print()} disabled={!passage.words.length} className={outline}>
                Print a student copy
              </button>
              {!passage.words.length && <p className="text-sm text-dim">Add a passage to start.</p>}
            </div>
          </section>
        </div>

        <details className="group mt-12 max-w-prose rounded-xl border border-rule px-4 py-3 sm:px-5">
          <summary className="cursor-pointer font-medium">How to give and score the check</summary>
          <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm text-pretty text-dim">
            <li>Give the student a copy of the passage (print one above) and start the clock as they read the first word.</li>
            <li>Tap each word read incorrectly: a wrong word, a skipped word, or one you had to say after about three seconds. If the student fixes it on their own, tap it again to mark a self-correction, which counts as correct.</li>
            <li>Added words, repeated words, and differences of accent or dialect aren&rsquo;t errors.</li>
            <li>When the minute is up, a tone sounds: tap the last word the student read. If they finish early, tap &ldquo;Read to the end&rdquo; and the score is scaled to a minute.</li>
            <li>Words correct per minute is the words read minus errors. Accuracy of 95% or more is generally comfortable, 90 to 94% is challenging, and below 90% the passage is probably too hard for now.</li>
            <li>
              For grade-level expectations, use your program&rsquo;s benchmarks or the{' '}
              <a href={NORMS} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
                Hasbrouck &amp; Tindal reading fluency norms
              </a>
              .
            </li>
          </ul>
        </details>

        <Log log={saved.log} onChange={(log) => change({ log })} />
      </div>
    </div>
  )
}

const BAND_TEXT: Record<Band, string> = {
  comfortable: 'At 95% or more, this passage is at a comfortable level for this reader.',
  challenging: 'At 90 to 94%, this passage is challenging for this reader.',
  hard: 'Below 90%, this passage is probably too hard for now, so the score may understate their fluency on easier text.',
}

function Results({
  result,
  mode,
  goal,
  student,
  onStudent,
  savedAs,
  onSave,
  summary,
  onNext,
  onEdit,
}: {
  result: Result
  mode: Mode
  goal: number | null
  student: string
  onStudent: (student: string) => void
  savedAs: { id: string; sig: string } | null
  onSave: (sig: string) => void
  summary: () => string
  onNext: () => void
  onEdit: () => void
}) {
  const [copied, setCopied] = useState<'yes' | 'no' | null>(null)
  const sig = JSON.stringify([student.trim(), result.read, result.errors, result.selfCorrections, result.ms, goal])
  const upToDate = savedAs?.sig === sig
  const copy = () => {
    const done = (result: 'yes' | 'no') => {
      setCopied(result)
      setTimeout(() => setCopied(null), 2500)
    }
    if (!navigator.clipboard) return done('no')
    navigator.clipboard.writeText(summary()).then(
      () => done('yes'),
      () => done('no'),
    )
  }

  return (
    <section aria-labelledby="results-heading" className="rounded-xl border border-rule p-4 sm:p-6">
      <h2 id="results-heading" className="sr-only">
        Results
      </h2>
      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <p>
          <span className="block text-5xl font-semibold tracking-tight tabular-nums">{result.wcpm}</span>
          <span className="text-sm text-dim">words correct per minute</span>
        </p>
        <p>
          <span className="block text-5xl font-semibold tracking-tight tabular-nums">{result.accuracy === null ? '–' : `${percent(result.accuracy)}%`}</span>
          <span className="text-sm text-dim">accuracy</span>
        </p>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
          {[
            ['Words read', result.read],
            ['Errors', result.errors],
            ['Self-corrections', result.selfCorrections],
            ['Time', clock(result.ms)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-dim">{label}</dt>
              <dd className="font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 grid gap-1 text-sm text-pretty">
        {goal !== null && <p>{result.wcpm >= goal ? `Met the goal of ${goal}${result.wcpm > goal ? `, by ${result.wcpm - goal}` : ''}.` : `${goal - result.wcpm} below the goal of ${goal}.`}</p>}
        {result.accuracy !== null && <p>{BAND_TEXT[band(result.accuracy)]}</p>}
        {result.read === 0 && <p>No words were marked as read. Use &ldquo;Move the end mark&rdquo; to choose the last word read.</p>}
        {mode === 'minute' && result.ms < MINUTE && result.read > 0 && <p className="text-dim">Read in {clock(result.ms)}, so the score is scaled to a minute.</p>}
        {result.missed.length > 0 && (
          <p className="text-dim" dir="auto">
            Missed: {result.missed.join(', ')}
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-2 border-t border-rule pt-5">
        <label className="grid min-w-0 flex-1 basis-48 gap-1.5">
          <span className="text-sm font-medium">Student</span>
          <input value={student} maxLength={LIMITS.name} onChange={(e) => onStudent(e.target.value)} className={field} dir="auto" placeholder="Name or initials" autoComplete="off" />
        </label>
        <button type="button" onClick={() => onSave(sig)} disabled={upToDate} className={primary}>
          {upToDate ? 'Saved on this device' : savedAs ? 'Save changes' : 'Save to this device'}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => window.print()} className={outline}>
          Print the record
        </button>
        <button type="button" onClick={copy} className={outline}>
          {copied === 'yes' ? 'Copied' : copied === 'no' ? 'Couldn’t copy' : 'Copy result'}
        </button>
        <button type="button" onClick={onNext} className={outline}>
          Next reader
        </button>
        <button type="button" onClick={onEdit} className={quiet}>
          Change the passage
        </button>
      </div>
    </section>
  )
}

function GoalField({ goal, onChange }: { goal: number | null; onChange: (goal: number | null) => void }) {
  const [text, setText] = useState(goal === null ? '' : String(goal))
  const n = Number(text)
  const invalid = text.trim() !== '' && (!Number.isInteger(n) || n < 1 || n > LIMITS.goal)
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">Goal (optional)</span>
      <span className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            const v = Number(e.target.value)
            if (e.target.value.trim() === '') onChange(null)
            else if (Number.isInteger(v) && v >= 1 && v <= LIMITS.goal) onChange(v)
          }}
          inputMode="numeric"
          aria-invalid={invalid || undefined}
          className={`${control} h-11 w-24 sm:h-10`}
        />
        <span className="text-sm text-dim">words correct per minute</span>
      </span>
      {invalid && <span className="text-sm text-red-700 dark:text-red-400">Use a whole number from 1 to {LIMITS.goal}.</span>}
    </label>
  )
}

function summaryText(result: Result, student: string, passage: string, at: number): string {
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
  const accuracy = result.accuracy === null ? '' : `, ${percent(result.accuracy)}% accuracy (${result.correct} of ${result.read} words correct)`
  const missed = result.missed.length ? ` Missed: ${result.missed.join(', ')}.` : ''
  return `${student.trim() || 'Reader'}, ${whenText(at)}, ${passage}: ${result.wcpm} words correct per minute${accuracy}, ${plural(result.errors, 'error')}, ${plural(result.selfCorrections, 'self-correction')}, time ${clock(result.ms)}.${missed}`
}

const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

function load(): Saved {
  const fallback: Saved = { title: '', text: '', student: '', mode: 'minute', goal: null, log: [] }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data || typeof data !== 'object') return fallback
    const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
    const goal = Number.isInteger(data.goal) && data.goal >= 1 && data.goal <= LIMITS.goal ? data.goal : null
    return {
      title: text(data.title, LIMITS.name),
      text: text(data.text, LIMITS.text),
      student: text(data.student, LIMITS.name),
      mode: data.mode === 'whole' ? 'whole' : 'minute',
      goal,
      log: Array.isArray(data.log) ? data.log.filter(validCheck).slice(-LIMITS.log) : [],
    }
  } catch {
    return fallback
  }
}

function validCheck(c: unknown): c is Check {
  if (!c || typeof c !== 'object') return false
  const x = c as Record<string, unknown>
  const count = (v: unknown) => Number.isInteger(v) && (v as number) >= 0
  return (
    typeof x.id === 'string' &&
    Number.isFinite(x.at) &&
    typeof x.student === 'string' &&
    typeof x.passage === 'string' &&
    count(x.length) &&
    (x.mode === 'minute' || x.mode === 'whole') &&
    count(x.read) &&
    count(x.errors) &&
    count(x.selfCorrections) &&
    Number.isFinite(x.ms) &&
    count(x.wcpm) &&
    (x.accuracy === null || Number.isFinite(x.accuracy)) &&
    (x.goal === null || count(x.goal)) &&
    Array.isArray(x.missed) &&
    x.missed.every((w) => typeof w === 'string')
  )
}
