import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { changes, clock, LIMITS, makePlan, parseRoster, random, type Format, type Plan } from './model.ts'

// The roster, today's absences, and the game format, kept on this device.
const STORAGE_KEY = 'labs:playing-time'

interface Saved {
  roster: string
  absent: string[]
  format: Format
  shuffle: number
}

const PRESETS: { label: string; format: Format }[] = [
  { label: 'Soccer 7v7', format: { onField: 7, periods: 2, periodMinutes: 25, changeEvery: 5, keeper: true } },
  { label: 'Soccer 9v9', format: { onField: 9, periods: 2, periodMinutes: 30, changeEvery: 10, keeper: true } },
  { label: 'Basketball', format: { onField: 5, periods: 4, periodMinutes: 8, changeEvery: 4, keeper: false } },
  { label: 'Hockey', format: { onField: 6, periods: 3, periodMinutes: 15, changeEvery: 5, keeper: true } },
]

const EXAMPLE = 'Ava\nBen\nCleo\nDev\nEli\nFinn\nGus\nHana\nIsla\nJay'

const field = 'h-11 min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:h-10 sm:text-sm'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** Experiment #014: fair substitution plans for youth sports. */
export default function PlayingTime() {
  const [saved, setSaved] = useState(load)
  const roster = useMemo(() => parseRoster(saved.roster), [saved.roster])
  const here = roster.filter((name) => !saved.absent.includes(name))
  const format = saved.format
  const plan = useMemo(() => makePlan(here.length, format, random(saved.shuffle)), [here.length, format, saved.shuffle])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      // Private browsing or full storage: the roster just won't be remembered.
    }
  }, [saved])

  const change = (patch: Partial<Saved>) => setSaved((s) => ({ ...s, ...patch }))
  const setFormat = (patch: Partial<Format>) => change({ format: { ...format, ...patch } })
  const toggleAbsent = (name: string) => change({ absent: saved.absent.includes(name) ? saved.absent.filter((n) => n !== name) : [...saved.absent, name] })

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10 print:p-0">
        <section aria-labelledby="setup-heading" className="grid gap-6 print:hidden">
          <h2 id="setup-heading" className="sr-only">
            Team and game
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            Give every player a fair share of the game. Enter your roster and the game format to get a substitution plan with
            minutes as even as the format allows, who comes off and goes on at each break, and a grid to print for the sideline.
          </p>

          <div className="grid gap-6 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <div className="grid content-start gap-2">
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">Roster</span>
                <textarea
                  value={saved.roster}
                  onChange={(e) => change({ roster: e.target.value })}
                  rows={8}
                  placeholder={'One name per line\nAva\nBen\nCleo'}
                  dir="auto"
                  className="w-full min-w-0 rounded-lg border border-rule bg-paper px-3 py-2 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm"
                />
              </label>
              <p className="text-sm text-dim">
                {roster.length === 0 ? (
                  <button type="button" onClick={() => change({ roster: EXAMPLE })} className="cursor-pointer underline underline-offset-4 hover:text-ink">
                    Try an example team
                  </button>
                ) : (
                  `${roster.length} ${roster.length === 1 ? 'player' : 'players'}, up to ${LIMITS.players}`
                )}
              </p>
            </div>

            <div className="grid content-start gap-5">
              <div>
                <p className="mb-1.5 text-sm font-medium">Start from</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <button key={p.label} type="button" onClick={() => change({ format: p.format })} className={outline}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                <NumberField label="On the field at once" value={format.onField} min={1} max={LIMITS.onField} onChange={(onField) => setFormat({ onField })} />
                <NumberField label="Periods" value={format.periods} min={1} max={LIMITS.periods} onChange={(periods) => setFormat({ periods })} />
                <NumberField label="Minutes each" value={format.periodMinutes} min={1} max={LIMITS.periodMinutes} onChange={(periodMinutes) => setFormat({ periodMinutes })} />
                <NumberField label="Change every (min)" value={format.changeEvery} min={1} max={format.periodMinutes} onChange={(changeEvery) => setFormat({ changeEvery })} />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" checked={format.keeper} onChange={(e) => setFormat({ keeper: e.target.checked })} className="size-4 cursor-pointer accent-current" />
                A goalkeeper plays each whole period, and the job rotates
              </label>
            </div>
          </div>

          {roster.length > 0 && (
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Here today</legend>
              <div className="flex flex-wrap gap-2">
                {roster.map((name) => {
                  const present = !saved.absent.includes(name)
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={present}
                      onClick={() => toggleAbsent(name)}
                      dir="auto"
                      className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-3.5 text-sm transition-colors ${present ? 'border-ink bg-ink text-paper' : 'border-dashed border-rule text-dim line-through hover:border-dim/60'}`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
              <p className="mt-2 text-sm text-dim">Tap anyone who isn’t here; the plan adjusts.</p>
            </fieldset>
          )}
        </section>

        {here.length > 0 && <Result names={here} plan={plan} format={format} onShuffle={() => change({ shuffle: saved.shuffle + 1 })} />}
      </div>
    </div>
  )
}

function periodName(p: number, periods: number): string {
  if (periods === 2) return p === 0 ? '1st half' : '2nd half'
  if (periods === 4) return `Q${p + 1}`
  const ordinal = ['1st', '2nd', '3rd'][p] ?? `${p + 1}th`
  return `${ordinal} period`
}

function Result({ names, plan, format, onShuffle }: { names: string[]; plan: Plan; format: Format; onShuffle: () => void }) {
  const total = format.periods * format.periodMinutes
  const low = Math.min(...plan.minutes)
  const high = Math.max(...plan.minutes)
  const calls = changes(plan)
  const short = names.length < format.onField
  const within = (minute: number) => {
    const p = Math.min(format.periods - 1, Math.floor(minute / format.periodMinutes))
    return { p, t: minute - p * format.periodMinutes }
  }
  const pct = (m: number) => Math.round((m / total) * 100)

  return (
    <section aria-labelledby="plan-heading" className="mt-12 print:mt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="plan-heading" className="text-lg font-semibold tracking-tight">
          The plan
        </h2>
        <div className="flex gap-2 print:hidden">
          <button type="button" onClick={onShuffle} className={quiet} title="Another fair plan, with players in different shifts">
            Shuffle
          </button>
          <button type="button" onClick={() => window.print()} className={outline}>
            Print
          </button>
        </div>
      </div>
      <p className="mt-1 text-pretty text-dim">
        {short
          ? `Only ${names.length} here for ${format.onField} places, so everyone plays the whole game.`
          : low === total
            ? 'Everyone plays the whole game.'
            : low === high
              ? `Everyone plays ${low} of ${total} minutes (${pct(low)}%).`
              : `Everyone plays ${low}–${high} of ${total} minutes (${pct(low)}–${pct(high)}%).`}
        {!short && format.keeper && ' Keepers play a whole period in goal.'}
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-rule [print-color-adjust:exact]">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Who plays each shift. Times are minutes into each period.</caption>
          <thead>
            <tr className="border-b border-rule">
              <th scope="col" className="sticky left-0 bg-paper px-3 py-2 text-left font-medium">
                Player
              </th>
              {plan.shifts.map((s, k) => {
                const { p, t } = within(s.start)
                const first = k === 0 || plan.shifts[k - 1].period !== s.period
                return (
                  <th key={k} scope="col" className={`px-1.5 py-2 text-center font-normal whitespace-nowrap text-dim tabular-nums ${first && k > 0 ? 'border-l border-rule' : ''}`}>
                    {first && <span className="block text-[11px] font-medium text-ink">{periodName(p, format.periods)}</span>}
                    {t}′
                  </th>
                )
              })}
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Minutes
              </th>
            </tr>
          </thead>
          <tbody>
            {names.map((name, i) => (
              <tr key={name} className="border-b border-rule last:border-0">
                <th scope="row" dir="auto" className="sticky left-0 max-w-40 truncate bg-paper px-3 py-1.5 text-left font-medium print:py-0.5">
                  {name}
                </th>
                {plan.lineups.map((lineup, k) => {
                  const s = plan.shifts[k]
                  const keeper = plan.keepers[s.period] === i
                  const on = lineup.includes(i)
                  const first = k > 0 && plan.shifts[k - 1].period !== s.period
                  return (
                    <td key={k} className={`px-1.5 py-1.5 text-center print:py-0.5 ${first ? 'border-l border-rule' : ''}`}>
                      {keeper ? (
                        <span className="inline-flex size-6 items-center justify-center rounded-md bg-ink text-[11px] font-semibold text-paper print:size-4 print:text-[9px]" title="Goalkeeper">
                          G<span className="sr-only">oalkeeper</span>
                        </span>
                      ) : on ? (
                        <span className="inline-block size-6 rounded-md bg-ink/80 print:size-4" title="On">
                          <span className="sr-only">On</span>
                        </span>
                      ) : (
                        <span className="inline-block size-6 rounded-md border border-dashed border-rule print:size-4 print:border-stone-400" title="On the bench">
                          <span className="sr-only">Bench</span>
                        </span>
                      )}
                    </td>
                  )
                })}
                <td className="px-3 py-1.5 text-right tabular-nums">{plan.minutes[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim [print-color-adjust:exact]">
        <Key swatch={<span className="inline-block size-3 rounded-sm bg-ink/80" />}>On</Key>
        {format.keeper && <Key swatch={<span className="inline-flex size-3 items-center justify-center rounded-sm bg-ink text-[8px] font-bold text-paper">G</span>}>Goalkeeper</Key>}
        <Key swatch={<span className="inline-block size-3 rounded-sm border border-dashed border-dim" />}>On the bench</Key>
      </p>

      <h3 className="mt-8 font-mono text-xs tracking-widest text-dim uppercase">From the sideline</h3>
      <ol className="mt-2 divide-y divide-rule border-y border-rule text-sm print:text-xs">
        <li className="flex gap-4 py-2.5 print:py-1">
          <span className="w-28 shrink-0 text-dim">Start</span>
          <span dir="auto">
            {plan.lineups[0]?.map((i) => names[i]).join(', ')}
            {plan.keepers[0] !== null && plan.keepers[0] !== undefined && <span className="text-dim"> · {names[plan.keepers[0]]} in goal</span>}
          </span>
        </li>
        {calls.map((c) => {
          const { p, t } = within(c.at)
          return (
            <li key={c.at} className="flex gap-4 py-2.5 print:py-1">
              <span className="w-28 shrink-0 text-dim tabular-nums">{t === 0 ? periodName(p, format.periods) : `${periodName(p, format.periods)}, ${clock(t)}`}</span>
              <span dir="auto" className="min-w-0">
                {c.off.length > 0 && (
                  <>
                    <span className="text-dim">Off:</span> {c.off.map((i) => names[i]).join(', ')}
                    <span className="text-dim"> · On:</span> {c.on.map((i) => names[i]).join(', ')}
                  </>
                )}
                {c.keeper !== undefined && c.keeper !== null && (
                  <span className={c.off.length ? 'text-dim' : ''}>
                    {c.off.length > 0 && ' · '}
                    {names[c.keeper]} in goal
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-sm text-dim print:hidden">Minutes are planned, not timed. Injuries and tired legs will change things, so treat it as a guide.</p>
    </section>
  )
}

function Key({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch}
      {children}
    </span>
  )
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  const [text, setText] = useState(String(value))
  const [last, setLast] = useState(value)
  // A preset changes the number from outside, so show the new one.
  if (value !== last) {
    setLast(value)
    setText(String(value))
  }
  const n = Number(text)
  const invalid = !Number.isInteger(n) || n < min || n > max
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          const v = Number(e.target.value)
          if (Number.isInteger(v) && v >= min && v <= max) {
            setLast(v)
            onChange(v)
          }
        }}
        onBlur={() => setText(String(value))}
        inputMode="numeric"
        aria-invalid={invalid || undefined}
        className={`${field} w-24 tabular-nums aria-invalid:border-red-600 dark:aria-invalid:border-red-400`}
      />
    </label>
  )
}

function load(): Saved {
  const fallback: Saved = { roster: '', absent: [], format: PRESETS[0].format, shuffle: 1 }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data || typeof data !== 'object') return fallback
    const f = data.format ?? {}
    const int = (v: unknown, min: number, max: number, otherwise: number) => (Number.isInteger(v) && (v as number) >= min && (v as number) <= max ? (v as number) : otherwise)
    const periodMinutes = int(f.periodMinutes, 1, LIMITS.periodMinutes, fallback.format.periodMinutes)
    return {
      roster: typeof data.roster === 'string' ? data.roster.slice(0, 2000) : '',
      absent: Array.isArray(data.absent) ? data.absent.filter((n: unknown) => typeof n === 'string').slice(0, LIMITS.players) : [],
      format: {
        onField: int(f.onField, 1, LIMITS.onField, fallback.format.onField),
        periods: int(f.periods, 1, LIMITS.periods, fallback.format.periods),
        periodMinutes,
        changeEvery: int(f.changeEvery, 1, periodMinutes, Math.min(5, periodMinutes)),
        keeper: f.keeper === true,
      },
      shuffle: int(data.shuffle, 0, 1e9, 1),
    }
  } catch {
    return fallback
  }
}
