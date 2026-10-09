import { useEffect, useMemo, useRef, useState } from 'react'
import { cues as allCues, formatDuration, schedule, serveTime, type Cue, type Plan, type Slot } from './model.ts'
import { useNow } from './Planner.tsx'
import { chime, clockLabel, cueText, fromNow, outline, primary, quiet, soundUnlocked, unlockSound } from './ui.ts'

/** Cooking mode: the clock, what's under way, what's next, and a chime when each step is due. */
export function Cook({ plan, onChange, onExit }: { plan: Plan; onChange: (plan: Plan) => void; onExit: () => void }) {
  const now = useNow(1000)
  const slots = useMemo(() => schedule(plan), [plan])
  const list = useMemo(() => allCues(plan, slots), [plan, slots])
  const serve = serveTime(plan)
  const [sound, setSound] = useState(soundUnlocked)
  const [alert, setAlert] = useState<Cue | null>(null)
  // Cues already due when cooking mode opens don't chime; only new ones do.
  const fired = useRef<Set<string> | null>(null)
  fired.current ??= new Set(list.filter((c) => c.at <= Date.now()).map((c) => c.key))
  const awake = useWakeLock()

  useEffect(() => {
    const due = list.filter((c) => c.at <= now && !fired.current!.has(c.key))
    if (!due.length) return
    for (const c of due) fired.current!.add(c.key)
    setAlert(due[due.length - 1])
    if (sound) chime()
    // Phones refuse to buzz before the page has been tapped, as after a reload mid-cooking.
    if (navigator.userActivation?.hasBeenActive ?? true) navigator.vibrate?.([200, 100, 200])
  }, [now, list, sound])

  const running = slots.filter((s) => s.start <= now && now < s.end)
  const waiting = waitingDishes(slots, now)
  const upcoming = list.filter((c) => c.at > now).slice(0, 5)
  const done = slots.filter((s) => s.end <= now).length
  const delayed = plan.delays.reduce((n, d) => n + d.minutes, 0)
  const pushBack = (minutes: number) => onChange({ ...plan, delays: [...plan.delays, { at: now, minutes }] })

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 pb-24 sm:px-6 sm:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onExit} className={`${quiet} -ml-3`}>
          ← Back to the plan
        </button>
        {sound ? (
          <button type="button" onClick={() => setSound(false)} className={quiet} aria-pressed="true">
            Sound on
          </button>
        ) : (
          <button type="button" onClick={() => setSound(unlockSound())} className={outline} aria-pressed="false">
            Turn on sound
          </button>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-6xl font-semibold tracking-tight tabular-nums sm:text-7xl">{clockLabel(now)}</p>
        <p className="mt-2 text-dim">
          {now < serve ? (
            <>
              Serving at <span className="text-ink tabular-nums">{clockLabel(serve)}</span>, {fromNow(serve, now)}
              {delayed > 0 && ` (pushed back ${formatDuration(delayed)})`}
            </>
          ) : (
            'Time to serve. Enjoy!'
          )}
        </p>
      </div>

      <div aria-live="assertive">
        {alert && (
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-ink p-4 text-paper sm:p-5">
            <p className="min-w-0 flex-1 text-lg font-medium text-pretty" dir="auto">
              <span className="block text-sm font-normal opacity-75">{alert.kind === 'serve' ? 'It’s time' : `Now, ${clockLabel(alert.at)}`}</span>
              {cueText(alert, plan)}
            </p>
            <button type="button" onClick={() => setAlert(null)} className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-lg bg-paper/15 px-4 text-sm font-medium hover:bg-paper/25">
              OK
            </button>
          </div>
        )}
      </div>

      {(running.length > 0 || waiting.length > 0) && (
        <section aria-labelledby="now-heading" className="mt-8">
          <h2 id="now-heading" className="font-mono text-xs tracking-widest text-dim uppercase">
            Under way
          </h2>
          <ul className="mt-3 grid gap-3">
            {running.map((s) => (
              <li key={s.key} className="rounded-xl border border-rule p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="font-medium" dir="auto">
                    {cueText({ key: s.key, at: s.start, kind: 'start', slot: s }, plan)}
                  </p>
                  <p className="text-sm text-dim tabular-nums">{left(s.end, now)}</p>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rule" role="progressbar" aria-label={`${s.dish.name || 'Dish'} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress(s, now))}>
                  <div className="h-full rounded-full bg-ink transition-[width] duration-1000" style={{ width: `${progress(s, now)}%` }} />
                </div>
              </li>
            ))}
            {waiting.map(({ dish, next }) => (
              <li key={`wait:${next.key}`} className="rounded-xl border border-dashed border-rule p-4 text-sm">
                <span className="font-medium" dir="auto">
                  {dish}
                </span>{' '}
                <span className="text-dim">waits until {clockLabel(next.start)}, then: {next.step.what.trim() || `step ${next.stepIndex + 1}`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-labelledby="next-heading" className="mt-8">
          <h2 id="next-heading" className="font-mono text-xs tracking-widest text-dim uppercase">
            Coming up
          </h2>
          <ol className="mt-2 divide-y divide-rule border-y border-rule">
            {upcoming.map((c, i) => (
              <li key={c.key} className={`flex gap-4 py-3 ${i === 0 ? 'text-lg' : ''}`}>
                <span className="w-24 shrink-0 tabular-nums">
                  <span className="block font-medium">{fromNow(c.at, now)}</span>
                  <span className="block text-sm text-dim">{clockLabel(c.at)}</span>
                </span>
                <span className={`min-w-0 break-words ${c.kind === 'serve' ? 'font-medium' : ''}`} dir="auto">
                  {cueText(c, plan)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {now < serve ? (
        <section aria-labelledby="late-heading" className="mt-8">
          <h2 id="late-heading" className="text-sm font-medium">
            Running late?
          </h2>
          <p className="mt-1 text-sm text-dim">Push dinner back. Steps already under way keep their times, and everything else moves.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[5, 10, 15, 30].map((m) => (
              <button key={m} type="button" onClick={() => pushBack(m)} className={outline}>
                +{m} min
              </button>
            ))}
            {plan.delays.length > 0 && (
              <button type="button" onClick={() => onChange({ ...plan, delays: plan.delays.slice(0, -1) })} className={quiet}>
                Undo
              </button>
            )}
          </div>
        </section>
      ) : (
        <div className="mt-8 text-center">
          <button type="button" onClick={onExit} className={primary}>
            Done cooking
          </button>
        </div>
      )}

      <p className="mt-10 text-sm text-dim">
        {done} of {slots.length} steps done.{' '}
        {awake === true
          ? 'The screen stays on while this page is open.'
          : awake === null
            ? 'This browser can’t keep the screen on, so set your phone not to lock while you cook.'
            : 'The screen may turn off; tap the page to keep it awake.'}{' '}
        Chimes only play while this page is open.
      </p>
    </div>
  )
}

function left(end: number, now: number): string {
  const seconds = Math.ceil((end - now) / 1000)
  return seconds < 60 ? 'under a minute left' : `${formatDuration(Math.ceil(seconds / 60))} left`
}

function progress(s: Slot, now: number): number {
  return Math.min(100, Math.max(0, ((now - s.start) / (s.end - s.start)) * 100))
}

/** Dishes between steps because dinner was pushed back: the last step ended, the next hasn't started. */
function waitingDishes(slots: Slot[], now: number): { dish: string; next: Slot }[] {
  const result: { dish: string; next: Slot }[] = []
  const byDish = new Map<string, Slot[]>()
  for (const s of slots) byDish.set(s.dish.id, [...(byDish.get(s.dish.id) ?? []), s])
  for (const list of byDish.values()) {
    list.sort((a, b) => a.stepIndex - b.stepIndex)
    for (let i = 1; i < list.length; i++)
      if (list[i - 1].end <= now && list[i].start > now) result.push({ dish: list[i].dish.name.trim() || 'Untitled dish', next: list[i] })
  }
  return result
}

/** Keeps the screen on while cooking. Null when the browser can't. */
function useWakeLock(): boolean | null {
  const supported = 'wakeLock' in navigator
  const [awake, setAwake] = useState(false)
  useEffect(() => {
    if (!supported) return
    let lock: WakeLockSentinel | null = null
    let closed = false
    const request = async () => {
      if (document.visibilityState !== 'visible' || (lock && !lock.released)) return
      try {
        lock = await navigator.wakeLock.request('screen')
        if (closed) return void lock.release()
        setAwake(true)
        lock.addEventListener('release', () => setAwake(false))
      } catch {
        setAwake(false)
      }
    }
    void request()
    document.addEventListener('visibilitychange', request)
    return () => {
      closed = true
      document.removeEventListener('visibilitychange', request)
      void lock?.release()
    }
  }, [supported])
  return supported ? awake : null
}
