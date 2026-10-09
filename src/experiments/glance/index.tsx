import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { daily, HEIGHT, NAMES, practice, PROMPTS, puzzleNumber, score, shareText, square, streak, today, type Round } from './model.ts'

// Each day's guesses, so results and streaks survive a reload. Nothing else is kept.
const STORAGE_KEY = 'labs:glance'

type Phase = 'ready' | 'steady' | 'showing' | 'guessing' | 'revealed'

const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-5 text-sm transition-colors sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`

/** Experiment #012: a daily game of estimating how many dots you saw in a glance. */
export default function Glance() {
  const date = useMemo(() => today(), [])
  const rounds = useMemo(() => daily(date), [date])
  const [history, setHistory] = useState(load)
  const [mode, setMode] = useState<'daily' | 'practice'>('daily')
  const guesses = history[date] ?? []
  // The round on screen. It moves on only when asked, so a guess is saved (and can't be redone) while its answer shows.
  const [current, setCurrent] = useState(() => guesses.length)
  const finished = current >= rounds.length

  const record = (index: number, guess: number) => {
    if (index !== guesses.length) return
    const next = { ...history, [date]: [...guesses, guess] }
    setHistory(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, days: next }))
    } catch {
      // Private browsing or full storage: today's result just won't be remembered.
    }
  }

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        {mode === 'practice' ? (
          <Practice onBack={() => setMode('daily')} />
        ) : finished ? (
          <Results date={date} rounds={rounds} guesses={guesses} history={history} onPractice={() => setMode('practice')} />
        ) : (
          <>
            <p className="text-pretty text-dim">
              {current === 0
                ? 'Five fields of dots, each shown for about a second. Guess how many you saw. Everyone gets the same five each day.'
                : `Round ${current + 1} of ${rounds.length}. Your earlier guesses are saved.`}
            </p>
            <Game
              key={current}
              round={rounds[current]}
              label={`Round ${current + 1} of ${rounds.length}`}
              onGuess={(guess) => record(current, guess)}
              onNext={() => setCurrent((c) => c + 1)}
              last={current === rounds.length - 1}
            />
          </>
        )}
      </div>
    </div>
  )
}

/** One round: get ready, see the field, guess, see how close you were. */
function Game({ round, label, onGuess, onNext, last, practiceMode }: { round: Round; label: string; onGuess: (guess: number) => void; onNext: () => void; last?: boolean; practiceMode?: boolean }) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [text, setText] = useState('')
  const [guess, setGuess] = useState<number | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const next = useRef<HTMLButtonElement>(null)

  // A beat to focus, then the field for its moment. (A timer rather than animation frames,
  // which stop altogether in background tabs and would leave the dots up.)
  useEffect(() => {
    if (phase !== 'steady' && phase !== 'showing') return
    const t = window.setTimeout(() => setPhase(phase === 'steady' ? 'showing' : 'guessing'), phase === 'steady' ? 700 : round.showMs)
    return () => clearTimeout(t)
  }, [phase, round.showMs])

  useEffect(() => {
    if (phase === 'guessing') input.current?.focus()
    if (phase === 'revealed') next.current?.focus()
  }, [phase])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const n = Number(text.replace(/[^\d]/g, ''))
    if (!(n > 0)) return
    setGuess(n)
    setPhase('revealed')
    onGuess(n)
  }

  const points = guess === null ? 0 : score(guess, round.answer)
  const status =
    phase === 'ready' ? `${label}. ${PROMPTS[round.kind]}` : phase === 'steady' ? 'Get ready…' : phase === 'showing' ? 'Look!' : phase === 'guessing' ? PROMPTS[round.kind] : `There were ${round.answer}.`

  return (
    <section aria-labelledby="round-heading" className="mt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="round-heading" className="font-mono text-xs tracking-widest text-dim uppercase">
          {label}
        </h2>
        <p className="text-sm text-dim">{round.kind === 'squares' ? 'Squares only' : ''}</p>
      </div>
      <p aria-live="polite" className="mt-2 text-lg font-medium text-balance">
        {status}
      </p>

      <Board round={round} visible={phase === 'showing' || phase === 'revealed'} steady={phase === 'steady'} />

      <div className="mt-5 min-h-24">
        {phase === 'ready' && (
          <button type="button" onClick={() => setPhase('steady')} className={primary} autoFocus>
            Show the {round.kind === 'squares' ? 'shapes' : 'dots'}
          </button>
        )}
        {phase === 'guessing' && (
          <form onSubmit={submit} className="flex max-w-xs gap-2">
            <label htmlFor="guess" className="sr-only">
              Your guess
            </label>
            <input
              id="guess"
              ref={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Your guess"
              maxLength={5}
              className="h-12 w-full min-w-0 flex-1 rounded-lg border border-rule bg-paper px-3 text-center text-xl text-ink tabular-nums placeholder:text-base placeholder:text-dim hover:border-dim/60"
            />
            <button type="submit" className={`${primary} h-12 sm:h-12`}>
              Guess
            </button>
          </form>
        )}
        {phase === 'revealed' && guess !== null && (
          <div>
            <p className="text-pretty">
              You guessed <span className="font-semibold tabular-nums">{guess}</span>: <span className="font-semibold tabular-nums">{points} points</span>{' '}
              <span aria-hidden="true">{square(points)}</span>
              <span className="text-dim"> · {verdict(guess, round.answer)}</span>
            </p>
            <button ref={next} type="button" onClick={onNext} className={`${primary} mt-4`}>
              {practiceMode ? 'Another one' : last ? 'See your score' : 'Next round'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function verdict(guess: number, answer: number): string {
  if (guess === answer) return 'exactly right'
  const pct = Math.round((Math.abs(guess - answer) / answer) * 100)
  return `${pct || '<1'}% too ${guess > answer ? 'high' : 'low'}`
}

/** The field of marks, or a blank board between looks. */
function Board({ round, visible, steady }: { round: Round; visible: boolean; steady: boolean }) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-rule bg-paper">
      <svg viewBox={`0 0 1 ${HEIGHT}`} className="block w-full" role="img" aria-label={visible ? `A field of ${round.marks.length} shapes` : 'An empty board'}>
        {visible &&
          round.marks.map((m, i) =>
            m.square ? (
              // Same area as a circle of the same radius, so squares don't stand out by size.
              <rect key={i} x={m.x - m.r * 0.886} y={m.y - m.r * 0.886} width={m.r * 1.772} height={m.r * 1.772} className="fill-ink" />
            ) : (
              <circle key={i} cx={m.x} cy={m.y} r={m.r} className="fill-ink" />
            ),
          )}
        {steady && <path d={`M0.48 ${HEIGHT / 2}h0.04M0.5 ${HEIGHT / 2 - 0.02}v0.04`} className="stroke-dim" strokeWidth={0.004} strokeLinecap="round" />}
      </svg>
    </div>
  )
}

function Results({ date, rounds, guesses, history, onPractice }: { date: string; rounds: Round[]; guesses: number[]; history: Record<string, number[]>; onPractice: () => void }) {
  const points = rounds.map((r, i) => score(guesses[i], r.answer))
  const total = points.reduce((a, b) => a + b, 0)
  const text = shareText(date, points)
  const [shared, setShared] = useState('')
  const days = Object.entries(history).filter(([d, g]) => g.length >= 5 && /^\d{4}-\d{2}-\d{2}$/.test(d))
  const totals = days.map(([d, g]) => daily(d).reduce((sum, r, i) => sum + score(g[i], r.answer), 0))
  const best = Math.max(...totals)
  const average = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length)
  const run = streak(new Set(days.map(([d]) => d)), date)

  const share = async () => {
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ text })
        return
      }
      await navigator.clipboard.writeText(text)
      setShared('Copied. Paste it anywhere.')
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setShared('Couldn’t copy. Select the text above instead.')
    }
  }

  return (
    <section aria-labelledby="results-heading">
      <h2 id="results-heading" className="font-mono text-xs tracking-widest text-dim uppercase">
        Glance #{puzzleNumber(date)}
      </h2>
      <p className="mt-2 text-5xl font-semibold tracking-tight tabular-nums">
        {total}
        <span className="text-2xl text-dim">/{rounds.length * 100}</span>
      </p>
      <ol className="mt-6 divide-y divide-rule border-y border-rule">
        {rounds.map((r, i) => (
          <li key={i} className="flex items-baseline gap-3 py-2.5 text-sm">
            <span aria-hidden="true">{square(points[i])}</span>
            <span className="min-w-0 flex-1">{NAMES[r.kind]}</span>
            <span className="text-dim tabular-nums">
              {guesses[i]} for {r.answer}
            </span>
            <span className="w-14 text-right font-medium tabular-nums">{points[i]}</span>
          </li>
        ))}
      </ol>

      <pre className="mt-6 rounded-lg border border-rule bg-ink/[0.03] p-3 font-sans text-sm whitespace-pre-wrap select-all">{text}</pre>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => void share()} className={primary}>
          Share your score
        </button>
        <button type="button" onClick={onPractice} className={outline}>
          Practice
        </button>
        <span role="status" className="text-sm text-dim">
          {shared}
        </span>
      </div>

      <p className="mt-8 text-sm text-dim">
        {days.length > 1 ? `${days.length} days played · best ${best} · average ${average}` : 'Your first day.'}
        {run > 1 && ` · ${run} days in a row`}. A new set of dots arrives at midnight.
      </p>
    </section>
  )
}

function Practice({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(() => practice())
  const [played, setPlayed] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onBack} className={`${outline} -ml-1`}>
          ← Today’s score
        </button>
        <p className="text-sm text-dim tabular-nums">{average !== null ? `${scores.length} played · average ${average}` : 'Practice rounds aren’t saved.'}</p>
      </div>
      <Game
        key={played}
        round={round}
        label="Practice"
        practiceMode
        onGuess={(guess) => setScores((s) => [...s, score(guess, round.answer)])}
        onNext={() => {
          setRound(practice())
          setPlayed((n) => n + 1)
        }}
      />
    </>
  )
}

function load(): Record<string, number[]> {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    const days: Record<string, number[]> = {}
    if (data?.days && typeof data.days === 'object')
      for (const [d, g] of Object.entries(data.days))
        if (/^\d{4}-\d{2}-\d{2}$/.test(d) && Array.isArray(g)) days[d] = g.filter((n): n is number => Number.isInteger(n) && n > 0 && n < 100_000).slice(0, 5)
    return days
  } catch {
    return {}
  }
}
