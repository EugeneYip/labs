import { useEffect, useRef, useState } from 'react'
import { Engine } from './audio.ts'
import { centsOff, hzToMidi, makeExercise, median, noteName, prompt, RANGES, SHORT, type Direction, type Exercise, type Range } from './model.ts'

// Practice settings only. The microphone is analyzed live and never recorded.
const STORAGE_KEY = 'labs:in-tune'

interface Settings {
  range: Range
  intervals: number[]
  direction: Direction
  /** How close counts as in tune, in cents (hundredths of a semitone). */
  tolerance: number
}

const DEFAULTS: Settings = { range: 'middle', intervals: [0, 2, 4, 5, 7, 12], direction: 'up', tolerance: 30 }
const HOLD_MS = 1000

const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** Experiment #013: singing intervals with live pitch from the microphone. */
export default function InTune() {
  const [settings, setSettings] = useState(load)
  const [engine, setEngine] = useState<Engine | null>(null)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [starting, setStarting] = useState(false)

  const change = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...next }))
    } catch {
      // Private browsing or full storage: settings just won't be remembered.
    }
  }

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === 'undefined') return setProblem('unsupported')
    setStarting(true)
    setProblem(null)
    try {
      setEngine(await Engine.start())
    } catch (error) {
      const name = (error as { name?: string }).name
      setProblem(name === 'NotFoundError' || name === 'OverconstrainedError' ? 'missing' : name === 'NotReadableError' || name === 'AbortError' ? 'busy' : 'denied')
    } finally {
      setStarting(false)
    }
  }

  // Release the microphone when leaving the page.
  useEffect(() => () => engine?.stop(), [engine])

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        {engine ? (
          <Practice
            engine={engine}
            settings={settings}
            onStop={() => {
              engine.stop()
              setEngine(null)
            }}
          />
        ) : (
          <Setup settings={settings} change={change} onStart={() => void start()} starting={starting} problem={problem} />
        )}
      </div>
    </div>
  )
}

type Problem = 'denied' | 'missing' | 'busy' | 'unsupported'

const PROBLEMS: Record<Problem, string> = {
  denied: 'The microphone is blocked for this site. Allow it in your browser’s settings, then try again.',
  missing: 'No microphone was found. Connect one, then try again.',
  busy: 'The microphone couldn’t start. Close other apps or tabs that might be using it, then try again.',
  unsupported: 'This browser can’t use the microphone here. Try a recent Chrome, Safari, Edge, or Firefox.',
}

function Setup({ settings, change, onStart, starting, problem }: { settings: Settings; change: (patch: Partial<Settings>) => void; onStart: () => void; starting: boolean; problem: Problem | null }) {
  const toggle = (semitones: number) => {
    const has = settings.intervals.includes(semitones)
    const intervals = has ? settings.intervals.filter((s) => s !== semitones) : [...settings.intervals, semitones].sort((a, b) => a - b)
    if (intervals.length) change({ intervals })
  }
  return (
    <>
      <p className="text-pretty text-dim">
        Practice singing intervals. In Tune plays a note, asks for an interval up or down from it, and shows your pitch as you sing.
        Hold it in tune for a second to count it. Use headphones if you can, so it hears only you.
      </p>

      <Segmented
        label="Your voice"
        value={settings.range}
        options={(Object.keys(RANGES) as Range[]).map((r) => [r, `${RANGES[r].label.replace(' voice', '')} (${noteName(RANGES[r].notes[0])}–${noteName(RANGES[r].notes[1])})`])}
        onChange={(range) => change({ range })}
      />

      <fieldset className="mt-6">
        <legend className="mb-1.5 text-sm font-medium">Intervals to practice</legend>
        <div className="flex flex-wrap gap-2">
          {SHORT.map((label, semitones) => {
            const on = settings.intervals.includes(semitones)
            return (
              <button
                key={label}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(semitones)}
                className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-3.5 text-sm transition-colors ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-dim/60'}`}
              >
                {label}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-sm text-dim">m is minor, M is major, P is perfect. At least one stays on.</p>
      </fieldset>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-4">
        <Segmented label="Direction" value={settings.direction} options={[['up', 'Up'], ['down', 'Down'], ['both', 'Both']]} onChange={(direction) => change({ direction })} />
        <Segmented
          label="How close counts"
          value={String(settings.tolerance)}
          options={[['50', 'Relaxed'], ['30', 'Normal'], ['15', 'Strict']]}
          onChange={(t) => change({ tolerance: Number(t) })}
        />
      </div>

      <div className="mt-8">
        <button type="button" onClick={onStart} disabled={starting} className={`${primary} h-12 px-6 text-base disabled:opacity-60 sm:h-12`}>
          {starting ? 'Asking for the microphone…' : 'Start practicing'}
        </button>
        {problem && (
          <p role="alert" className="mt-3 text-sm text-pretty text-red-700 dark:text-red-400">
            {PROBLEMS[problem]}
          </p>
        )}
        <p className="mt-3 text-sm text-dim">Your voice is analyzed on this device as you sing. Nothing is recorded or sent anywhere.</p>
      </div>
    </>
  )
}

interface Reading {
  midi: number
  cents: number
}

function Practice({ engine, settings, onStop }: { engine: Engine; settings: Settings; onStop: () => void }) {
  const [exercise, setExercise] = useState<Exercise>(() => makeExercise(settings.range, settings.intervals, settings.direction))
  const [reading, setReading] = useState<Reading | null>(null)
  const [held, setHeld] = useState(0)
  const [matched, setMatched] = useState(false)
  const [score, setScore] = useState({ matched: 0, skipped: 0 })
  const [paused, setPaused] = useState(false)
  const [lost, setLost] = useState(false)
  const recent = useRef<number[]>([])
  const next = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    engine.onLost = () => setLost(true)
    return () => {
      engine.onLost = undefined
    }
  }, [engine])

  // Each new exercise starts by playing its reference note.
  useEffect(() => {
    engine.play(exercise.reference)
    recent.current = []
    setReading(null)
    setHeld(0)
    setMatched(false)
  }, [engine, exercise])

  // Listen about 30 times a second. A timer, not animation frames, so it keeps going if the screen is busy.
  useEffect(() => {
    if (matched) return
    let hold = 0
    let last = performance.now()
    const timer = window.setInterval(() => {
      const now = performance.now()
      const dt = now - last
      last = now
      setPaused(!engine.running)
      const found = engine.read()
      if (!found || found.clarity < 0.75) {
        recent.current = []
        hold = Math.max(0, hold - dt * 2)
        setHeld(hold)
        if (!engine.playing) setReading(null)
        return
      }
      recent.current = [...recent.current.slice(-4), found.hz]
      const hz = median(recent.current)
      const cents = centsOff(hz, exercise.target)
      setReading({ midi: hzToMidi(hz), cents })
      hold = Math.abs(cents) <= settings.tolerance ? hold + dt : Math.max(0, hold - dt * 2)
      setHeld(hold)
      if (hold >= HOLD_MS) {
        setMatched(true)
        setScore((s) => ({ ...s, matched: s.matched + 1 }))
      }
    }, 33)
    return () => clearInterval(timer)
  }, [engine, exercise, matched, settings.tolerance])

  useEffect(() => {
    if (matched) next.current?.focus()
  }, [matched])

  const advance = () => setExercise(makeExercise(settings.range, settings.intervals, settings.direction))

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onStop} className={`${quiet} -ml-3`}>
          ← Settings
        </button>
        <p className="text-sm text-dim tabular-nums">
          {score.matched} matched{score.skipped > 0 && ` · ${score.skipped} skipped`}
        </p>
      </div>

      <section aria-labelledby="exercise-heading" className="mt-4">
        <h2 id="exercise-heading" className="text-3xl font-semibold tracking-tight text-balance">
          {prompt(exercise)}
        </h2>
        <p className="mt-2 text-dim">
          {exercise.semitones === 0 ? (
            <>
              Match <span className="font-medium text-ink">{noteName(exercise.reference)}</span>
            </>
          ) : (
            <>
              From <span className="font-medium text-ink">{noteName(exercise.reference)}</span> to <span className="font-medium text-ink">{noteName(exercise.target)}</span>
            </>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => engine.play(exercise.reference)} className={outline}>
            Play {noteName(exercise.reference)} again
          </button>
          <button type="button" onClick={() => engine.play(exercise.target)} className={quiet}>
            Hear the answer
          </button>
        </div>

        <Meter reading={reading} tolerance={settings.tolerance} held={held} matched={matched} />
        {lost ? (
          <p role="alert" className="mt-3 text-sm text-pretty text-red-700 dark:text-red-400">
            The microphone stopped, perhaps unplugged or taken by another app. Go back to Settings and start again.
          </p>
        ) : (
          paused && (
            <p role="status" className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-pretty text-dim">
              The browser paused listening, as phones do during a call.
              <button type="button" onClick={() => void engine.resume()} className={outline}>
                Resume listening
              </button>
            </p>
          )
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {matched ? (
            <button ref={next} type="button" onClick={advance} className={primary}>
              Next interval
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setScore((s) => ({ ...s, skipped: s.skipped + 1 }))
                advance()
              }}
              className={quiet}
            >
              Skip
            </button>
          )}
        </div>
      </section>

      <p className="mt-10 text-sm text-pretty text-dim">
        Without headphones, wait for the note to finish before you sing; listening pauses while it plays. A quiet room helps.
      </p>
    </>
  )
}

/**
 * Where your voice is against the target: a marker on a track one semitone
 * either side, with the in-tune zone in the middle. Words carry the same news.
 */
function Meter({ reading, tolerance, held, matched }: { reading: Reading | null; tolerance: number; held: number; matched: boolean }) {
  const cents = reading?.cents ?? 0
  const inTune = reading !== null && Math.abs(cents) <= tolerance
  const position = Math.max(-100, Math.min(100, cents))
  const semitones = Math.round(Math.abs(cents) / 100)
  const words = matched
    ? 'In tune. Nicely done!'
    : !reading
      ? 'Sing when you’re ready…'
      : inTune
        ? `${noteName(reading.midi)}, in tune. Hold it…`
        : Math.abs(cents) >= 100
          ? `${noteName(reading.midi)}: about ${semitones} semitone${semitones === 1 ? '' : 's'} too ${cents < 0 ? 'low' : 'high'}`
          : // Within a semitone, the nearest note's name can be the next note over, which only confuses; the distance says it all.
            `${Math.round(Math.abs(cents))} cents ${cents < 0 ? 'flat: go a little higher' : 'sharp: go a little lower'}`

  return (
    <div className="mt-8 rounded-2xl border border-rule p-4 sm:p-6">
      <p aria-live="polite" className={`min-h-7 text-lg font-medium ${matched ? 'text-green-800 dark:text-green-300' : ''}`}>
        {words}
      </p>
      <div className="relative mt-5 h-12" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-rule" />
        <div className="absolute inset-y-1 rounded-md bg-green-600/20 dark:bg-green-400/20" style={{ left: `${50 - tolerance / 2}%`, width: `${tolerance}%` }} />
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-ink/40" />
        {reading && (
          <div
            className={`absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper transition-[left] duration-75 ${inTune || matched ? 'bg-green-600 dark:bg-green-400' : 'bg-ink'}`}
            style={{ left: `${50 + position / 2}%` }}
          />
        )}
      </div>
      <div className="mt-1 flex justify-between text-xs text-dim">
        <span>Low</span>
        <span>Target</span>
        <span>High</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-rule" role="progressbar" aria-label="Holding in tune" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, held / HOLD_MS) * 100)}>
        <div className="h-full rounded-full bg-green-600 transition-[width] duration-100 dark:bg-green-400" style={{ width: `${matched ? 100 : Math.min(100, (held / HOLD_MS) * 100)}%` }} />
      </div>
    </div>
  )
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (value: T) => void }) {
  return (
    <fieldset className="mt-6">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex w-fit max-w-full flex-wrap rounded-lg border border-rule p-0.5">
        {options.map(([v, text]) => (
          <label key={v} className="cursor-pointer">
            <input type="radio" name={label} checked={value === v} onChange={() => onChange(v)} className="peer sr-only" />
            <span className="inline-flex h-10 items-center rounded-md px-3 text-sm whitespace-nowrap transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:h-9">
              {text}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function load(): Settings {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data) return DEFAULTS
    const intervals = Array.isArray(data.intervals) ? [...new Set(data.intervals.filter((n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 12))] as number[] : []
    return {
      range: data.range in RANGES ? data.range : DEFAULTS.range,
      intervals: intervals.length ? intervals.sort((a, b) => a - b) : DEFAULTS.intervals,
      direction: ['up', 'down', 'both'].includes(data.direction) ? data.direction : DEFAULTS.direction,
      tolerance: [15, 30, 50].includes(data.tolerance) ? data.tolerance : DEFAULTS.tolerance,
    }
  } catch {
    return DEFAULTS
  }
}
