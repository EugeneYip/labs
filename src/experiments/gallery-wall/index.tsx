import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  across,
  convertPlan,
  defaultUnit,
  format,
  layout,
  LIMITS,
  newId,
  parseLength,
  problems,
  startingPlan,
  type Frame,
  type Hanger,
  type Layout,
  type Plan,
  type Unit,
} from './model.ts'

// The frames and layout settings, kept on this device.
const STORAGE_KEY = 'labs:gallery-wall'

const control = 'h-11 min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 aria-invalid:border-red-600 sm:h-10 sm:text-sm dark:aria-invalid:border-red-400'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

const HANGERS: [Hanger, string][] = [
  ['wire', 'Wire'],
  ['hook', 'One hook'],
  ['two', 'Two hooks'],
]

/** Experiment #010: nail positions for a row or grid of picture frames, with a drawing of the wall. */
export default function GalleryWall() {
  const [plan, setPlan] = useState(load)
  const result = useMemo(() => layout(plan), [plan])
  const issues = problems(plan, result)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...plan }))
    } catch {
      // Private browsing or full storage: the plan just won't be remembered.
    }
  }, [plan])

  const change = (patch: Partial<Plan>) => setPlan((p) => ({ ...p, ...patch }))
  const setFrames = (frames: Frame[]) => change({ frames })
  const updateFrame = (id: string, patch: Partial<Frame>) => setFrames(plan.frames.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const addFrame = () => {
    const last = plan.frames[plan.frames.length - 1] ?? startingPlan(plan.unit).frames[0]
    setFrames([...plan.frames, { ...last, id: newId() }])
  }
  const u = plan.unit

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10 print:p-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
        <section aria-labelledby="setup-heading" className="grid gap-6 print:hidden">
          <h2 id="setup-heading" className="sr-only">
            Frames and layout
          </h2>
          <p className="text-pretty text-dim">
            Plan a gallery wall without extra holes. Enter your frames and how you want them arranged, and get a drawing of the
            wall and exactly where each nail goes, measured from the floor and across.
          </p>

          <Segmented label="Measure in" value={u} options={[['in', 'Inches'], ['cm', 'Centimeters']]} onChange={(unit: Unit) => setPlan((p) => convertPlan(p, unit))} />

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">Frames, left to right{plan.arrangement === 'grid' ? ', row by row' : ''}</legend>
            <ol className="grid gap-3">
              {plan.frames.map((f, i) => (
                <li key={f.id} className="rounded-xl border border-rule p-3">
                  <div className="flex items-center gap-2">
                    <Badge number={i + 1} />
                    <span className="text-sm font-medium">Frame {i + 1}</span>
                    <div className="-my-1 ml-auto flex">
                      <button type="button" onClick={() => setFrames(swap(plan.frames, i))} disabled={i === 0} className={`${quiet} px-2.5 disabled:invisible`} aria-label={`Move frame ${i + 1} earlier`} title="Move earlier">
                        ↑
                      </button>
                      <button type="button" onClick={() => setFrames(plan.frames.filter((x) => x.id !== f.id))} className={`${quiet} -mr-1 px-2.5`} aria-label={`Remove frame ${i + 1}`} title="Remove">
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <LengthInput label="Width" unit={u} value={f.width} min={1} onChange={(width) => updateFrame(f.id, { width })} ariaLabel={`Frame ${i + 1} width`} />
                    <span className="mb-2.5 text-dim sm:mb-2" aria-hidden="true">
                      ×
                    </span>
                    <LengthInput label="Height" unit={u} value={f.height} min={1} onChange={(height) => updateFrame(f.id, { height })} ariaLabel={`Frame ${i + 1} height`} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    <label className="grid gap-1">
                      <span className="text-xs text-dim">Hangs from</span>
                      <select value={f.hanger} onChange={(e) => updateFrame(f.id, { hanger: e.target.value as Hanger })} aria-label={`Frame ${i + 1} hangs from`} className={`${control} cursor-pointer`}>
                        {HANGERS.map(([v, text]) => (
                          <option key={v} value={v}>
                            {text}
                          </option>
                        ))}
                      </select>
                    </label>
                    <LengthInput label={f.hanger === 'wire' ? 'Wire drop' : 'Hook drop'} unit={u} value={f.drop} min={0} onChange={(drop) => updateFrame(f.id, { drop })} ariaLabel={`Frame ${i + 1} drop from the top`} />
                    {f.hanger === 'two' && <LengthInput label="Hooks apart" unit={u} value={f.spread} min={0} onChange={(spread) => updateFrame(f.id, { spread })} ariaLabel={`Frame ${i + 1} distance between hooks`} />}
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={addFrame} disabled={plan.frames.length >= LIMITS.frames} className={`${outline} disabled:opacity-40`}>
                Add a frame
              </button>
              <p className="text-sm text-dim">New frames copy the last one.</p>
            </div>
            <p className="text-sm text-pretty text-dim">
              <span className="font-medium text-ink">Drop</span> is how far below the frame’s top edge it hangs from. For a wire,
              pull it up tight at the middle, as a nail would, and measure from there to the top. For hooks, measure to the hook.
            </p>
          </fieldset>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <Segmented label="Arrange in" value={plan.arrangement} options={[['row', 'A row'], ['grid', 'A grid']]} onChange={(arrangement) => change({ arrangement })} />
            {plan.arrangement === 'grid' && (
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">Columns</span>
                <select value={plan.columns} onChange={(e) => change({ columns: Number(e.target.value) })} className={`${control} cursor-pointer`}>
                  {Array.from({ length: LIMITS.columns - 1 }, (_, i) => i + 2).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <LengthInput label="Gap between frames" unit={u} value={plan.gap} min={0} onChange={(gap) => change({ gap })} large />
            <Segmented label={plan.arrangement === 'grid' ? 'In each row, line up' : 'Line up'} value={plan.align} options={[['center', 'Middles'], ['top', 'Tops'], ['bottom', 'Bottoms']]} onChange={(align) => change({ align })} />
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <Segmented label="Height from the floor to the group’s" value={plan.heightBy} options={[['center', 'Middle'], ['bottom', 'Bottom edge']]} onChange={(heightBy) => change({ heightBy })} />
              <LengthInput label="Height" unit={u} value={plan.height} min={0} onChange={(height) => change({ height })} large />
            </div>
            <p className="text-sm text-pretty text-dim">
              Galleries hang art with its middle at {u === 'in' ? '57 in' : '145 cm'}, about eye level. Over a sofa or bed, set the
              bottom edge {u === 'in' ? '8 to 10 in' : '20 to 25 cm'} above the furniture instead.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <Segmented label="Center the group on" value={plan.centerOn} options={[['wall', 'The wall'], ['mark', 'A mark']]} onChange={(centerOn) => change({ centerOn })} />
            {plan.centerOn === 'wall' ? (
              <LengthInput label="Wall width" unit={u} value={plan.wallWidth} min={1} onChange={(wallWidth) => change({ wallWidth })} large />
            ) : (
              <p className="max-w-xs pb-1 text-sm text-pretty text-dim">Pencil a small mark on the wall where the group’s middle should be, such as above the middle of a sofa.</p>
            )}
          </div>
        </section>

        <section aria-labelledby="result-heading" className="mt-12 lg:sticky lg:top-6 lg:mt-0">
          <h2 id="result-heading" className="text-lg font-semibold tracking-tight">
            Where the nails go
          </h2>
          {plan.frames.length === 0 ? (
            <p className="mt-2 text-sm text-dim">Add a frame to see the wall.</p>
          ) : (
            <>
              {issues.length > 0 && (
                <ul className="mt-3 grid gap-2">
                  {issues.map((issue) => (
                    <li key={issue} className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:border-amber-400/40 dark:text-amber-100">
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
              <Drawing plan={plan} result={result} />
              <p className="mt-3 text-sm text-dim">
                The group is {format(result.right - result.left, u)} wide and {format(result.top - result.bottom, u)} tall, from{' '}
                {format(result.bottom, u)} to {format(result.top, u)} above the floor. Mark every nail with a pencil and check the
                marks with a level before you hammer.
              </p>
              <ol className="mt-4 divide-y divide-rule border-y border-rule">
                {result.placed.map((p) => (
                  <li key={p.frame.id} className="flex gap-3 py-3 text-sm">
                    <Badge number={p.number} />
                    <div className="min-w-0">
                      <p className="text-dim">
                        {format(p.frame.width, u).replace(/ (in|cm)$/, '')} × {format(p.frame.height, u)}
                      </p>
                      {p.nails.map((n, k) => (
                        <p key={k} className="mt-0.5">
                          {p.nails.length === 2 && <span className="text-dim">{k === 0 ? 'Left nail: ' : 'Right nail: '}</span>}
                          <span className="font-medium tabular-nums">{format(n.y, u)}</span> up from the floor,{' '}
                          <span className="font-medium tabular-nums">{across(n.x, plan)}</span>
                        </p>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 print:hidden">
                <button type="button" onClick={() => window.print()} className={outline}>
                  Print
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

/** The wall to scale: floor, frames, nails, and the line everything is centered on. */
function Drawing({ plan, result }: { plan: Plan; result: Layout }) {
  const u = plan.unit
  const width = result.right - result.left
  const rough = Math.max(plan.centerOn === 'wall' ? Math.max(plan.wallWidth, width) : width, result.top) / 38
  // Room on the left for the height dimension, which frames can't cover.
  const pad = Math.max(width * 0.12, u === 'in' ? 6 : 15, rough * 3.2)
  const x0 = plan.centerOn === 'wall' ? Math.min(0, result.left - pad) : result.left - pad
  const x1 = plan.centerOn === 'wall' ? Math.max(plan.wallWidth, result.right + pad * 0.5) : result.right + pad
  const y1 = result.top + pad * 0.6
  const spanX = x1 - x0
  const spanY = y1
  const fontSize = Math.max(spanX, spanY) / 38
  const r = Math.max(spanX, spanY) / 140
  const dimX = Math.min(x0 + fontSize * 1.4, result.left - fontSize * 1.2)
  // SVG y grows downward; the wall's grows up from the floor.
  const Y = (y: number) => y1 - y
  const reference = plan.heightBy === 'center' ? (result.top + result.bottom) / 2 : result.bottom
  const label = `Drawing of a ${format(spanX, u)} wide stretch of wall with ${result.placed.length} frames and their nails. The nail list below gives every measurement.`

  return (
    <figure className="mt-4 overflow-hidden rounded-xl border border-rule bg-white p-2 [print-color-adjust:exact]">
      <svg viewBox={`${x0} ${-fontSize * 0.5} ${spanX} ${spanY + fontSize * 2}`} role="img" aria-label={label} className="block h-auto max-h-[70vh] w-full print:max-h-[4.6in]">
        {plan.centerOn === 'wall' && <rect x={0} y={Y(y1)} width={plan.wallWidth} height={y1} fill="#f5f5f4" />}
        {plan.centerOn === 'wall' && (
          <>
            <line x1={0} x2={0} y1={Y(0)} y2={Y(y1)} stroke="#a8a29e" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <line x1={plan.wallWidth} x2={plan.wallWidth} y1={Y(0)} y2={Y(y1)} stroke="#a8a29e" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          </>
        )}
        {plan.centerOn === 'mark' && <line x1={0} x2={0} y1={Y(0)} y2={Y(y1)} stroke="#78716c" strokeDasharray="4 4" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
        <line x1={x0} x2={x1} y1={Y(reference)} y2={Y(reference)} stroke="#78716c" strokeDasharray="2 4" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <g stroke="#57534e" strokeWidth={1} vectorEffect="non-scaling-stroke">
          <line x1={dimX} x2={dimX} y1={Y(0)} y2={Y(reference)} vectorEffect="non-scaling-stroke" />
          <line x1={dimX - fontSize * 0.4} x2={dimX + fontSize * 0.4} y1={Y(reference)} y2={Y(reference)} vectorEffect="non-scaling-stroke" />
        </g>
        <text transform={`translate(${dimX - fontSize * 0.35} ${Y(reference / 2)}) rotate(-90)`} fontSize={fontSize * 0.8} textAnchor="middle" fill="#44403c">
          {format(reference, u)}
        </text>

        {result.placed.map((p) => (
          <g key={p.frame.id}>
            <rect x={p.x} y={Y(p.y + p.frame.height)} width={p.frame.width} height={p.frame.height} fill="#ffffff" stroke="#1c1917" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
            <rect x={p.x + p.frame.width * 0.12} y={Y(p.y + p.frame.height * 0.88)} width={p.frame.width * 0.76} height={p.frame.height * 0.76} fill="none" stroke="#d6d3d1" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <text x={p.x + p.frame.width / 2} y={Y(p.y + p.frame.height / 2) + fontSize * 0.35} fontSize={fontSize} textAnchor="middle" fontWeight={600} fill="#1c1917">
              {p.number}
            </text>
            {p.nails.map((n, k) => (
              <g key={k}>
                <circle cx={n.x} cy={Y(n.y)} r={r * 1.6} fill="#ffffff" />
                <circle cx={n.x} cy={Y(n.y)} r={r} fill="#dc2626" />
              </g>
            ))}
          </g>
        ))}

        <line x1={x0} x2={x1} y1={Y(0)} y2={Y(0)} stroke="#1c1917" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        <text x={x0 + fontSize * 0.4} y={Y(0) + fontSize * 1.2} fontSize={fontSize * 0.8} fill="#57534e">
          Floor
        </text>
        {plan.centerOn === 'mark' && (
          <text x={fontSize * 0.3} y={Y(y1) + fontSize} fontSize={fontSize * 0.8} fill="#57534e">
            Mark
          </text>
        )}
      </svg>
      <figcaption className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-stone-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-600" /> Nail
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-4 border-t border-dashed border-stone-500" /> The group’s {plan.heightBy === 'center' ? 'middle' : 'bottom edge'}, {format(reference, u)} up
        </span>
      </figcaption>
    </figure>
  )
}

/** A length typed freely, like "16 1/2" or "40,5", tidied when you leave the box. */
function LengthInput({ label, unit, value, min, onChange, ariaLabel, large }: { label: string; unit: Unit; value: number; min: number; onChange: (value: number) => void; ariaLabel?: string; large?: boolean }) {
  const shown = (v: number) => format(v, unit).replace(/ (in|cm)$/, '').replace('−', '-')
  const [text, setText] = useState(() => shown(value))
  const [lastUnit, setLastUnit] = useState(unit)
  // A unit switch converts the number, so show the new one.
  if (lastUnit !== unit) {
    setLastUnit(unit)
    setText(shown(value))
  }
  const parsed = parseLength(text)
  const invalid = parsed === null || parsed < min
  return (
    <label className="grid gap-1">
      <span className={large ? 'text-sm font-medium' : 'text-xs text-dim'}>{label}</span>
      <span className="relative">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            const v = parseLength(e.target.value)
            if (v !== null && v >= min) onChange(v)
          }}
          onBlur={() => !invalid && setText(shown(value))}
          inputMode="decimal"
          autoComplete="off"
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          className={`${control} pr-9 tabular-nums ${large ? 'w-32' : 'w-24 sm:w-28'}`}
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-dim" aria-hidden="true">
          {unit}
        </span>
      </span>
    </label>
  )
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (value: T) => void }): ReactNode {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex w-fit rounded-lg border border-rule p-0.5">
        {options.map(([v, text]) => (
          <label key={v} className="cursor-pointer">
            <input type="radio" name={label} checked={value === v} onChange={() => onChange(v)} className="peer sr-only" />
            <span className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm whitespace-nowrap transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:h-9">
              {text}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Badge({ number }: { number: number }) {
  return (
    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper tabular-nums [print-color-adjust:exact]" aria-hidden="true">
      {number}
    </span>
  )
}

function swap<T>(list: T[], i: number): T[] {
  const next = [...list]
  ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
  return next
}

function load(): Plan {
  const fallback = startingPlan(defaultUnit(navigator.language))
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data || typeof data !== 'object' || !Array.isArray(data.frames)) return fallback
    const n = (v: unknown, min: number, max: number, otherwise: number) => (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : otherwise)
    const unit: Unit = data.unit === 'in' ? 'in' : 'cm'
    const big = unit === 'in' ? 1000 : 2500
    const frames: Frame[] = data.frames.slice(0, LIMITS.frames).map((f: Record<string, unknown>) => ({
      id: typeof f?.id === 'string' && /^[\w-]{1,40}$/.test(f.id) ? f.id : newId(),
      width: n(f?.width, 1, big, 16),
      height: n(f?.height, 1, big, 20),
      hanger: f?.hanger === 'hook' || f?.hanger === 'two' ? f.hanger : 'wire',
      drop: n(f?.drop, 0, big, 0),
      spread: n(f?.spread, 0, big, 0),
    }))
    return {
      unit,
      frames,
      arrangement: data.arrangement === 'grid' ? 'grid' : 'row',
      columns: Math.round(n(data.columns, 2, LIMITS.columns, 3)),
      gap: n(data.gap, 0, big, fallback.gap),
      align: data.align === 'top' || data.align === 'bottom' ? data.align : 'center',
      heightBy: data.heightBy === 'bottom' ? 'bottom' : 'center',
      height: n(data.height, 0, big, fallback.height),
      centerOn: data.centerOn === 'mark' ? 'mark' : 'wall',
      wallWidth: n(data.wallWidth, 1, big * 4, fallback.wallWidth),
    }
  } catch {
    return fallback
  }
}
