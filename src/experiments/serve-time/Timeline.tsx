import { formatDuration, type Cue, type Plan, type Slot } from './model.ts'
import { clockLabel, degrees, OTHER, OVEN, timeLabel } from './ui.ts'

/** Plans longer than this show only the final stretch, where the cooking happens; a 12-hour brine would squeeze everything else. */
const LONG = 8 * 60 * 60_000
const WINDOW = 5 * 60 * 60_000

/**
 * One row per dish, its steps as bars between the first start and serving,
 * so overlaps and idle stretches are visible at a glance. The list beside it
 * carries the same information as text.
 */
export function Timeline({ plan, slots, cues, serve, now }: { plan: Plan; slots: Slot[]; cues: Cue[]; serve: number; now: number }) {
  if (!slots.length) return null
  const first = Math.min(...slots.map((s) => s.start), ...cues.map((c) => c.at))
  const clipped = serve - first > LONG
  const from = clipped ? serve - WINDOW : first
  const span = Math.max(serve - from, 1)
  const at = (t: number) => ((t - from) / span) * 100
  const rows = plan.dishes.map((dish) => ({ dish, slots: slots.filter((s) => s.dish === dish && s.end > from) })).filter((r) => r.slots.length)
  const hasOven = slots.some((s) => s.step.oven !== null)

  return (
    <figure className="mt-4">
      <div role="img" aria-label={`Timeline of ${rows.length} ${rows.length === 1 ? 'dish' : 'dishes'} from ${timeLabel(from, serve)} to serving at ${clockLabel(serve)}${clipped ? ', the last 5 hours of the plan' : ''}. Every step is also listed below.`}>
        <div className="relative grid gap-3">
          {rows.map(({ dish, slots: steps }) => (
            <div key={dish.id}>
              <p className="truncate text-xs text-dim" dir="auto">
                {dish.name.trim() || 'Untitled dish'}
              </p>
              <div className="relative mt-1 h-5">
                {steps.map((s) => (
                  <div
                    key={s.key}
                    title={`${s.step.what.trim() || `Step ${s.stepIndex + 1}`} · ${formatDuration(s.step.minutes)}${s.step.oven !== null ? ` · ${degrees(s.step.oven, plan)}` : ''} · ${timeLabel(s.start, serve)}–${clockLabel(s.end)}`}
                    className="absolute inset-y-0 px-px"
                    style={{ left: `${at(Math.max(s.start, from))}%`, width: `${at(s.end) - at(Math.max(s.start, from))}%` }}
                  >
                    <div
                      // A step that began before the window fades in from the left edge.
                      className={`h-full rounded-[4px] [print-color-adjust:exact] ${s.start < from ? 'rounded-l-none [mask-image:linear-gradient(to_right,transparent,black_1.5rem)]' : ''}`}
                      style={{ background: s.step.oven !== null ? OVEN : OTHER }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          {now > from && now < serve && (
            <div className="pointer-events-none absolute -inset-y-1 w-0.5 rounded-full bg-ink print:hidden" style={{ left: `${at(now)}%` }}>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-medium">Now</span>
            </div>
          )}
        </div>
        <div className="relative mt-2 h-5 border-t border-rule text-[11px] text-dim tabular-nums">
          {tickTimes(from, serve).map((t) => (
            <span key={t} className={`absolute top-1 whitespace-nowrap ${at(t) < 8 ? '' : '-translate-x-1/2'}`} style={{ left: `${at(t)}%` }}>
              {clockLabel(t)}
            </span>
          ))}
          <span className="absolute top-1 right-0 font-medium whitespace-nowrap text-ink">Serve {clockLabel(serve)}</span>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim">
        {clipped && <span className="basis-full">Showing the last 5 hours. Earlier steps are in the list.</span>}
        {hasOven && (
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm [print-color-adjust:exact]" style={{ background: OVEN }} /> Oven
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm [print-color-adjust:exact]" style={{ background: OTHER }} /> Other steps
        </span>
      </figcaption>
    </figure>
  )
}

/** Round times between the start and serving, at most three, kept clear of the serving label. */
function tickTimes(from: number, to: number): number[] {
  const minutes = (to - from) / 60_000
  const step = [15, 30, 60, 120, 180, 360, 720, 1440].find((m) => minutes / m <= 3.5) ?? 2880
  const first = new Date(from)
  first.setSeconds(0, 0)
  const offset = (first.getHours() * 60 + first.getMinutes()) % step
  const ticks: number[] = []
  for (let t = first.getTime() + (offset ? step - offset : 0) * 60_000; t < to - minutes * 60_000 * 0.3; t += step * 60_000) ticks.push(t)
  return ticks
}
