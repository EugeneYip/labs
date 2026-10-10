import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  convert,
  cues as allCues,
  exampleDishes,
  formatDuration,
  lateBy,
  LIMITS,
  newId,
  ovenClashes,
  parseDuration,
  schedule,
  serveAtToFit,
  serveTime,
  validTemp,
  type Dish,
  type Plan,
  type Step,
  type Unit,
} from './model.ts'
import { Timeline } from './Timeline.tsx'
import { clockLabel, cueText, degrees, field, inline, outline, primary, quiet, timeLabel, whenLabel } from './ui.ts'

const DAY = 24 * 60 * 60_000
const startOfDay = (t: number) => new Date(new Date(t).toDateString()).getTime()
const pad = (n: number) => String(n).padStart(2, '0')
const blankStep = (): Step => ({ id: newId(), what: '', minutes: 0, oven: null })

export function Planner({ plan, onChange, onCook }: { plan: Plan; onChange: (plan: Plan) => void; onCook: () => void }) {
  const now = useNow(30_000)
  const slots = useMemo(() => schedule(plan), [plan])
  const list = useMemo(() => allCues(plan, slots), [plan, slots])
  const clashes = useMemo(() => ovenClashes(slots, plan.ovens, plan.unit), [slots, plan.ovens, plan.unit])
  const serve = serveTime(plan)
  const late = lateBy(list, now)
  const missing = plan.dishes.reduce((n, d) => n + d.steps.filter((s) => !(s.minutes > 0)).length, 0)
  const [removed, setRemoved] = useState<{ dish: Dish; index: number } | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)

  const update = (dishes: Dish[]) => {
    setRemoved(null)
    onChange({ ...plan, dishes })
  }
  const updateDish = (id: string, patch: Partial<Dish>) => update(plan.dishes.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  const updateStep = (dish: Dish, id: string, patch: Partial<Step>) => updateDish(dish.id, { steps: dish.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) })
  const addDish = () => {
    const dish = { id: newId(), name: '', steps: [blankStep()] }
    setFocusId(dish.id)
    update([...plan.dishes, dish])
  }
  const removeDish = (dish: Dish) => {
    const index = plan.dishes.indexOf(dish)
    onChange({ ...plan, dishes: plan.dishes.filter((d) => d !== dish) })
    setRemoved({ dish, index })
  }
  const undoRemove = () => {
    if (!removed) return
    const dishes = [...plan.dishes]
    dishes.splice(removed.index, 0, removed.dish)
    update(dishes)
  }
  const setUnit = (unit: Unit) => {
    if (unit === plan.unit) return
    onChange({ ...plan, unit, dishes: plan.dishes.map((d) => ({ ...d, steps: d.steps.map((s) => ({ ...s, oven: s.oven === null ? null : convert(s.oven, unit) })) })) })
  }

  // Serving time: a time of day plus which of the next few days.
  const serveDate = new Date(plan.serveAt)
  const dayOffset = Math.round((startOfDay(plan.serveAt) - startOfDay(now)) / DAY)
  const offsets = [...new Set([...Array.from({ length: 7 }, (_, i) => i), dayOffset])].sort((a, b) => a - b)
  const setServe = (offset: number, time: string) => {
    const [h, m] = time.split(':').map(Number)
    if (!Number.isInteger(h) || !Number.isInteger(m)) return
    const day = new Date(startOfDay(now) + offset * DAY + DAY / 2) // midday, so daylight-saving changes can't shift the date
    onChange({ ...plan, serveAt: new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).getTime(), delays: [] })
  }
  const dayName = (offset: number) => {
    if (offset === 0) return 'Today'
    if (offset === 1) return 'Tomorrow'
    if (offset === -1) return 'Yesterday'
    return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(startOfDay(now) + offset * DAY + DAY / 2)
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-start lg:gap-12">
      <section aria-labelledby="plan-heading" className="print:hidden">
        <h2 id="plan-heading" className="sr-only">
          Plan
        </h2>
        <p className="max-w-prose text-pretty text-dim">
          Plan a meal so every dish is ready at once. List each dish’s steps and how long they take. Serve Time works out
          when to start each one, reminds you to heat the oven, warns when dishes need it at different temperatures, and
          counts down while you cook.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
          <fieldset className="flex flex-wrap items-end gap-2">
            <legend className="mb-1.5 text-sm font-medium">Serve at</legend>
            <input
              type="time"
              aria-label="Serving time"
              value={`${pad(serveDate.getHours())}:${pad(serveDate.getMinutes())}`}
              onChange={(e) => e.target.value && setServe(dayOffset, e.target.value)}
              className={`${inline} tabular-nums`}
            />
            <select aria-label="Serving day" value={dayOffset} onChange={(e) => setServe(Number(e.target.value), `${serveDate.getHours()}:${serveDate.getMinutes()}`)} className={inline}>
              {offsets.map((o) => (
                <option key={o} value={o}>
                  {dayName(o)}
                </option>
              ))}
            </select>
          </fieldset>
          <Choices legend="Oven in" value={plan.unit} options={[['C', '°C'], ['F', '°F']]} onChange={setUnit} />
          <Choices legend="Ovens" value={String(plan.ovens)} options={[['1', '1'], ['2', '2']]} onChange={(v) => onChange({ ...plan, ovens: v === '2' ? 2 : 1 })} />
        </div>

        {plan.dishes.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-rule p-6 text-center">
            <p className="text-dim">Add the dishes you’re making, with their steps in order.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={addDish} className={primary}>
                Add a dish
              </button>
              <button type="button" onClick={() => update(exampleDishes(plan.unit))} className={outline}>
                Show an example dinner
              </button>
            </div>
          </div>
        ) : (
          <ol className="mt-8 grid gap-4">
            {plan.dishes.map((dish, index) => (
              <DishCard
                key={dish.id}
                dish={dish}
                index={index}
                plan={plan}
                start={slots.find((s) => s.dish === dish)?.start}
                serve={serve}
                autoFocus={focusId === dish.id}
                onName={(name) => updateDish(dish.id, { name })}
                onStep={(id, patch) => updateStep(dish, id, patch)}
                onSteps={(steps) => updateDish(dish.id, { steps })}
                onRemove={() => removeDish(dish)}
              />
            ))}
          </ol>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {plan.dishes.length > 0 && (
            <button type="button" onClick={addDish} disabled={plan.dishes.length >= LIMITS.dishes} className={`${outline} disabled:opacity-40`}>
              Add a dish
            </button>
          )}
          {removed && (
            <p role="status" className="flex items-center gap-1 text-sm text-dim">
              Removed {removed.dish.name.trim() || 'a dish'}.
              <button type="button" onClick={undoRemove} className={`${quiet} -ml-2 text-ink underline underline-offset-4`}>
                Undo
              </button>
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="schedule-heading" className="mt-12 lg:sticky lg:top-6 lg:mt-0">
        <h2 id="schedule-heading" className="text-lg font-semibold tracking-tight">
          Schedule
        </h2>
        {slots.length === 0 ? (
          <p className="mt-2 text-sm text-dim">Steps appear here once they have a time, like “20 min” or “1 h 15”.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-dim">
              Start at <span className="font-medium text-ink tabular-nums">{timeLabel(list[0].at, serve)}</span> to serve at{' '}
              <span className="font-medium text-ink tabular-nums">{timeLabel(serve, serve)}</span>
              {Math.abs(dayOffset) === 1 ? ` ${dayName(dayOffset).toLowerCase()}` : dayOffset !== 0 && ` on ${dayName(dayOffset)}`}.
            </p>

            <div className="mt-4 grid gap-2 print:hidden">
              {late > 0 && (
                <Warning>
                  This plan should have started {late < 60 * 60_000 ? formatDuration(Math.ceil(late / 60_000)) : 'over an hour'} ago.{' '}
                  <button type="button" onClick={() => onChange({ ...plan, serveAt: serveAtToFit(plan, list, now), delays: [] })} className="cursor-pointer font-medium underline underline-offset-4">
                    Serve at {whenLabel(serveAtToFit(plan, list, now), now)} instead
                  </button>
                </Warning>
              )}
              {clashes.map((c) => (
                <Warning key={c.from}>
                  The oven is needed at different temperatures from {clockLabel(c.from)} to {clockLabel(c.to)}:{' '}
                  {c.slots.map((s) => `${s.dish.name.trim() || 'untitled dish'} at ${degrees(s.step.oven!, plan)}`).join(', ')}.{' '}
                  {plan.ovens === 1 ? 'Cook one of them earlier and reheat it, or set Ovens to 2.' : 'Cook one of them earlier and reheat it.'}
                </Warning>
              ))}
              {missing > 0 && (
                <Warning>
                  {missing === 1 ? 'One step has' : `${missing} steps have`} no time yet, so {missing === 1 ? 'it isn’t' : 'they aren’t'} in the schedule.
                </Warning>
              )}
            </div>

            <Timeline plan={plan} slots={slots} cues={list} serve={serve} now={now} />

            <ol className="mt-6 divide-y divide-rule border-y border-rule">
              {list.map((c) => (
                <li key={c.key} className={`flex gap-3 py-2 text-sm ${c.kind === 'serve' ? 'font-medium' : ''}`}>
                  <span className="w-[5.5rem] shrink-0 text-dim tabular-nums">{timeLabel(c.at, serve)}</span>
                  <span dir="auto" className="min-w-0 break-words">
                    {cueText(c, plan)}
                    {c.slot && <span className="text-dim"> · {formatDuration(c.slot.step.minutes)}</span>}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap gap-2 print:hidden">
              <button type="button" onClick={onCook} className={primary}>
                Start cooking
              </button>
              <button type="button" onClick={() => window.print()} className={outline}>
                Print
              </button>
            </div>
            <p className="mt-3 max-w-prose text-sm text-pretty text-dim print:hidden">Cooking mode counts down to each step and chimes when it’s time. The times are a plan, not a test of doneness: check meat and poultry with a food thermometer before serving.</p>
          </>
        )}
      </section>
    </div>
  )
}

function DishCard(props: {
  dish: Dish
  index: number
  plan: Plan
  start: number | undefined
  serve: number
  autoFocus: boolean
  onName: (name: string) => void
  onStep: (id: string, patch: Partial<Step>) => void
  onSteps: (steps: Step[]) => void
  onRemove: () => void
}) {
  const { dish, plan } = props
  const name = dish.name.trim() || `Dish ${props.index + 1}`
  const total = dish.steps.reduce((n, s) => n + (s.minutes > 0 ? s.minutes : 0), 0)
  const move = (i: number) => {
    const steps = [...dish.steps]
    ;[steps[i - 1], steps[i]] = [steps[i], steps[i - 1]]
    props.onSteps(steps)
  }
  return (
    <li className="rounded-xl border border-rule p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <input
          value={dish.name}
          onChange={(e) => props.onName(e.target.value)}
          maxLength={LIMITS.text}
          placeholder="Dish, like Roast potatoes"
          aria-label={`Name of dish ${props.index + 1}`}
          autoFocus={props.autoFocus}
          dir="auto"
          className={`${field} font-medium`}
        />
        <button type="button" onClick={props.onRemove} className={quiet} aria-label={`Remove ${name}`}>
          Remove
        </button>
      </div>

      <ol className="mt-3 grid gap-3 sm:gap-2">
        {dish.steps.map((step, i) => (
          <li key={step.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:grid-cols-[minmax(0,1fr)_7.5rem_6rem_auto]">
            <input
              value={step.what}
              onChange={(e) => props.onStep(step.id, { what: e.target.value })}
              maxLength={LIMITS.text}
              placeholder={i === 0 ? 'Step, like Peel and parboil' : 'Next step'}
              aria-label={`${name}, step ${i + 1}`}
              dir="auto"
              className={`${field} col-span-3 sm:col-span-1`}
            />
            <DurationInput minutes={step.minutes} label={`${name}, step ${i + 1}: how long`} onChange={(minutes) => props.onStep(step.id, { minutes })} />
            <TempInput temp={step.oven} unit={plan.unit} label={`${name}, step ${i + 1}: oven temperature, if it uses the oven`} onChange={(oven) => props.onStep(step.id, { oven })} />
            <div className="flex">
              <button
                type="button"
                onClick={() => move(i)}
                disabled={i === 0}
                className={`${quiet} px-2.5 disabled:invisible`}
                aria-label={`Move ${name}, step ${i + 1} earlier`}
                title="Move earlier"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => props.onSteps(dish.steps.filter((s) => s.id !== step.id))}
                className={`${quiet} px-2.5`}
                aria-label={`Remove ${name}, step ${i + 1}`}
                title="Remove step"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => props.onSteps([...dish.steps, blankStep()])} disabled={dish.steps.length >= LIMITS.steps} className={`${quiet} -ml-2 disabled:opacity-40`}>
          + Add step
        </button>
        {props.start !== undefined && (
          <p className="text-sm text-dim">
            Start at <span className="text-ink tabular-nums">{timeLabel(props.start, props.serve)}</span> · {formatDuration(total)}
          </p>
        )}
      </div>
    </li>
  )
}

/** Free-form durations like "1 h 20" or "45 min", tidied when you leave the box. */
function DurationInput({ minutes, label, onChange }: { minutes: number; label: string; onChange: (minutes: number) => void }) {
  const [text, setText] = useState(minutes > 0 ? formatDuration(minutes) : '')
  const invalid = text.trim() !== '' && parseDuration(text) === null
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        onChange(parseDuration(e.target.value) ?? 0)
      }}
      onBlur={() => minutes > 0 && setText(formatDuration(minutes))}
      placeholder="20 min"
      aria-label={label}
      aria-invalid={invalid || undefined}
      autoComplete="off"
      className={`${field} tabular-nums`}
    />
  )
}

function TempInput({ temp, unit, label, onChange }: { temp: number | null; unit: Unit; label: string; onChange: (temp: number | null) => void }) {
  const [text, setText] = useState(temp === null ? '' : String(temp))
  // A unit switch converts the number, so show the new one.
  useEffect(() => setText(temp === null ? '' : String(temp)), [unit])
  const value = Number(text.replace(/[^\d.]/g, ''))
  const invalid = text.trim() !== '' && !validTemp(value, unit)
  return (
    <input
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const n = Number(e.target.value.replace(/[^\d.]/g, ''))
        onChange(e.target.value.trim() && validTemp(n, unit) ? Math.round(n) : null)
      }}
      inputMode="numeric"
      placeholder={`Oven °${unit}`}
      aria-label={label}
      aria-invalid={invalid || undefined}
      autoComplete="off"
      className={`${field} tabular-nums`}
    />
  )
}

function Choices<T extends string>({ legend, value, options, onChange }: { legend: string; value: T; options: [T, string][]; onChange: (value: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="flex rounded-lg border border-rule p-0.5">
        {options.map(([v, label]) => (
          <label key={v} className="cursor-pointer">
            <input type="radio" name={legend} checked={value === v} onChange={() => onChange(v)} className="peer sr-only" />
            <span className="inline-flex h-10 min-w-11 items-center justify-center rounded-md px-3 text-sm transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:h-9">
              {label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Warning({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-sm text-pretty text-amber-950 dark:border-amber-400/40 dark:text-amber-100">{children}</p>
}

/** The current time, refreshed every `ms`. */
export function useNow(ms: number): number {
  const [now, setNow] = useState(() => Date.now())
  const timer = useRef(0)
  useEffect(() => {
    timer.current = window.setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(timer.current)
  }, [ms])
  return now
}
