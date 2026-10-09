import { useEffect, useRef, useState, type Dispatch, type KeyboardEvent, type ReactNode, type SetStateAction } from 'react'
import { clock, MINUTE, nextMark, type Marks, type Mode, type Passage } from './model.ts'
import { beep, outline, primary, quiet, useNow, useWakeLock } from './ui.ts'

/**
 * A check in progress. While reading, taps mark words; once time is up (or
 * the check is stopped), the next tap sets the last word read; after that,
 * taps fix marks up to that word.
 */
export type Phase = 'running' | 'paused' | 'last' | 'done'

export interface Run {
  phase: Phase
  /** When the current stretch of reading started. */
  startedAt: number
  /** Reading time before the current stretch, or all of it once stopped. */
  banked: number
  marks: Marks
  /** Index of the last word read, once set. */
  last: number
}

export const startRun = (): Run => ({ phase: 'running', startedAt: Date.now(), banked: 0, marks: {}, last: -1 })

const elapsed = (run: Run, now: number) => run.banked + (run.phase === 'running' ? now - run.startedAt : 0)

export function CheckView({ passage, mode, run, setRun, onCancel, results }: { passage: Passage; mode: Mode; run: Run; setRun: Dispatch<SetStateAction<Run>>; onCancel: () => void; results: ReactNode }) {
  const reading = run.phase === 'running' || run.phase === 'paused'
  useWakeLock(reading)
  const cap = (ms: number) => (mode === 'minute' ? Math.min(ms, MINUTE) : ms)
  const end = passage.words.length - 1

  // The minute ends on its own timer rather than the clock display, so it ends on time.
  const { phase, startedAt, banked } = run
  useEffect(() => {
    if (mode !== 'minute' || phase !== 'running') return
    const id = setTimeout(
      () => {
        beep()
        // Phones refuse to buzz before the page has been tapped; Start is a tap, but be safe.
        if (navigator.userActivation?.hasBeenActive ?? true) navigator.vibrate?.(200)
        setRun((r) => (r.phase === 'running' ? { ...r, phase: 'last', banked: MINUTE } : r))
      },
      Math.max(0, MINUTE - banked - (Date.now() - startedAt)),
    )
    return () => clearTimeout(id)
  }, [mode, phase, startedAt, banked, setRun])

  const pause = () => setRun((r) => (r.phase === 'running' ? { ...r, phase: 'paused', banked: cap(elapsed(r, Date.now())) } : r))
  const resume = () => setRun((r) => (r.phase === 'paused' ? { ...r, phase: 'running', startedAt: Date.now() } : r))
  const stop = () => setRun((r) => ({ ...r, phase: 'last', banked: cap(elapsed(r, Date.now())) }))
  const finished = () => setRun((r) => ({ ...r, phase: 'done', banked: cap(elapsed(r, Date.now())), last: end }))
  const tap = (i: number) =>
    setRun((r) => {
      if (r.phase === 'last') return { ...r, phase: 'done', last: i }
      if (r.phase === 'done' && i > r.last) return r
      return { ...r, marks: { ...r.marks, [i]: nextMark(r.marks[i]) } }
    })

  const errors = Object.values(run.marks).filter((m) => m === 'error').length

  return (
    <div className="flex-1">
      <div className="sticky top-0 z-10 border-b border-rule bg-paper/95 backdrop-blur print:hidden">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <Timer run={run} mode={mode} />
          <p className="min-w-56 flex-1 text-sm text-pretty" aria-live="assertive">
            {run.phase === 'running' && (
              <>
                Tap each word read incorrectly. <span className="text-dim tabular-nums">{errors === 1 ? '1 error' : `${errors} errors`}</span>
              </>
            )}
            {run.phase === 'paused' && 'Paused. The clock is stopped.'}
            {run.phase === 'last' && <strong className="font-semibold">{mode === 'minute' && run.banked >= MINUTE ? 'Time! ' : 'Stopped. '}Tap the last word the student read.</strong>}
            {run.phase === 'done' && 'Tap a word to fix its mark.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {run.phase === 'running' && (
              <>
                <button type="button" onClick={finished} className={primary}>
                  Read to the end
                </button>
                <button type="button" onClick={pause} className={outline}>
                  Pause
                </button>
                <button type="button" onClick={stop} className={outline}>
                  Stop
                </button>
              </>
            )}
            {run.phase === 'paused' && (
              <>
                <button type="button" onClick={resume} className={primary}>
                  Resume
                </button>
                <button type="button" onClick={stop} className={outline}>
                  Stop
                </button>
              </>
            )}
            {run.phase === 'last' && (
              <button type="button" onClick={() => tap(end)} className={outline}>
                They read to the end
              </button>
            )}
            {run.phase === 'done' && (
              <button type="button" onClick={() => setRun((r) => ({ ...r, phase: 'last' }))} className={outline}>
                Move the end mark
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 pt-5 pb-24 sm:px-6 sm:pt-8 print:hidden">
        {run.phase === 'done' && <div className="mb-8">{results}</div>}
        <Words passage={passage} run={run} onTap={tap} />
        {run.phase !== 'done' && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
            <p className="text-sm text-dim">One tap marks an error, a second tap marks it self-corrected, and a third clears it.</p>
            <button type="button" onClick={onCancel} className={`${quiet} -mr-3`}>
              Cancel this check
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function Timer({ run, mode }: { run: Run; mode: Mode }) {
  const now = useNow(run.phase === 'running')
  const ms = Math.min(elapsed(run, now), mode === 'minute' ? MINUTE : Infinity)
  return (
    <div className="flex items-center gap-3">
      <p className="text-4xl font-semibold tracking-tight tabular-nums" aria-label={mode === 'minute' ? `${clock(MINUTE - ms, true)} left` : `${clock(ms)} so far`}>
        {mode === 'minute' ? clock(MINUTE - ms, true) : clock(ms)}
      </p>
      {mode === 'minute' && (
        <div className="h-2 w-20 overflow-hidden rounded-full bg-ink/10 sm:w-28" aria-hidden="true">
          <div className="h-full rounded-full bg-ink" style={{ width: `${(ms / MINUTE) * 100}%` }} />
        </div>
      )}
    </div>
  )
}

const MARKED = {
  error: 'bg-red-100 text-red-950 line-through decoration-red-700 decoration-2 dark:bg-red-950 dark:text-red-50 dark:decoration-red-300',
  sc: 'bg-amber-100 text-amber-950 dark:bg-amber-900/60 dark:text-amber-50',
}

/** The passage as a grid of tappable words, with arrow keys moving between them. */
function Words({ passage, run, onTap }: { passage: Passage; run: Run; onTap: (i: number) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [focus, setFocus] = useState(0)
  const count = passage.words.length

  const move = (to: number) => {
    const i = Math.max(0, Math.min(count - 1, to))
    setFocus(i)
    refs.current[i]?.focus()
  }

  // Up and down go to the nearest word on the line above or below.
  const vertical = (from: number, dir: 1 | -1) => {
    const here = refs.current[from]?.getBoundingClientRect()
    if (!here) return from
    let line: number | null = null
    let best = from
    let bestDistance = Infinity
    for (let i = from + dir; i >= 0 && i < count; i += dir) {
      const r = refs.current[i]?.getBoundingClientRect()
      if (!r) continue
      const top = Math.round(r.top)
      if (line === null) {
        if (dir === 1 ? r.top < here.bottom - 2 : r.bottom > here.top + 2) continue
        line = top
      } else if (top !== line) break
      const distance = Math.abs(r.left + r.width / 2 - (here.left + here.width / 2))
      if (distance < bestDistance) {
        bestDistance = distance
        best = i
      }
    }
    return best
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, () => number> = {
      ArrowRight: () => focus + 1,
      ArrowLeft: () => focus - 1,
      ArrowDown: () => vertical(focus, 1),
      ArrowUp: () => vertical(focus, -1),
      Home: () => 0,
      End: () => count - 1,
    }
    if (!keys[e.key]) return
    e.preventDefault()
    move(keys[e.key]())
  }

  const choosing = run.phase === 'last'
  const done = run.phase === 'done'
  let i = 0
  const paragraphs = passage.starts.map((start, p) => passage.words.slice(start, passage.starts[p + 1] ?? count))

  return (
    <div role="group" aria-label="Passage" onKeyDown={onKeyDown} className="grid gap-5 text-[1.375rem] leading-[2.5rem] sm:text-2xl sm:leading-[2.9rem]" dir="auto">
      {paragraphs.map((words, p) => (
        <p key={p}>
          {words.map((word) => {
            const index = i++
            const mark = run.marks[index]
            const after = done && index > run.last
            const counted = !after
            return (
              <span key={index}>
                <button
                  ref={(el) => {
                    refs.current[index] = el
                  }}
                  type="button"
                  tabIndex={index === focus ? 0 : -1}
                  onFocus={() => setFocus(index)}
                  onClick={() => onTap(index)}
                  aria-disabled={after || undefined}
                  className={`-mx-0.5 rounded-md px-1 transition-colors ${after ? 'cursor-default text-dim/70' : 'cursor-pointer'} ${counted && mark ? MARKED[mark] : ''} ${choosing ? 'hover:bg-ink hover:text-paper' : after ? '' : 'hover:bg-ink/10'}`}
                >
                  {word}
                  {counted && mark === 'sc' && <sup className="ml-0.5 text-[0.55em] font-semibold no-underline">SC</sup>}
                  <span className="sr-only">{counted && mark === 'error' ? ', error' : counted && mark === 'sc' ? ', self-corrected' : ''}{index === run.last && done ? ', last word read' : ''}</span>
                </button>
                {done && index === run.last && (
                  <span aria-hidden="true" className="ml-0.5 font-bold text-ink">
                    ]
                  </span>
                )}{' '}
              </span>
            )
          })}
        </p>
      ))}
    </div>
  )
}
