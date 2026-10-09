import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { addTurn, circle, clock, exchanges, MAP, parseNames, stats, turnsCSV, type Person, type Turn } from './model.ts'

// The people, their seats, and the discussion under way, kept on this device.
const STORAGE_KEY = 'labs:discussion-map'
const SAMPLE = 'Ava\nBen\nCleo\nDev\nEli\nFinn\nGus\nHana\nIsla\nJay'

interface Saved {
  people: Person[]
  turns: Turn[]
  /** When the first turn was tapped, as a timestamp. */
  startedAt: number | null
  /** How long the discussion ran, once ended. */
  endedAt: number | null
}

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const toggle = (on: boolean) => `${button} border ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`

/** Experiment #023: who speaks, for how long, and to whom, in a live discussion. */
export default function DiscussionMap() {
  const [saved, setSaved] = useState(load)
  const [editing, setEditing] = useState(() => !saved.people.length)
  const [arranging, setArranging] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const running = saved.startedAt !== null && saved.endedAt === null
  const now = useNow(running)
  const elapsed = saved.startedAt === null ? 0 : (saved.endedAt ?? now - saved.startedAt)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      // Private browsing or full storage: the discussion just won't be remembered.
    }
  }, [saved])

  const change = (patch: Partial<Saved>) => setSaved((s) => ({ ...s, ...patch }))
  const tap = (who: string | null) =>
    setSaved((s) => {
      if (s.endedAt !== null) return s
      const startedAt = s.startedAt ?? Date.now()
      return { ...s, startedAt, turns: addTurn(s.turns, who, s.startedAt === null ? 0 : Date.now() - startedAt) }
    })

  const perPerson = useMemo(() => stats(saved.turns, elapsed), [saved.turns, elapsed])
  const pairs = useMemo(() => [...exchanges(saved.turns).values()], [saved.turns])
  const current = running ? (saved.turns[saved.turns.length - 1]?.who ?? null) : null

  if (editing)
    return (
      <Names
        people={saved.people}
        hasTurns={saved.turns.length > 0}
        onCancel={saved.people.length ? () => setEditing(false) : undefined}
        onSave={(names) => {
          setSaved((s) => ({ ...s, people: reseat(s.people, names) }))
          setEditing(false)
        }}
      />
    )

  const spoken = saved.people.filter((p) => perPerson.has(p.id))
  const silent = saved.people.filter((p) => !perPerson.has(p.id))
  const talk = [...perPerson.values()].reduce((n, s) => n + s.ms, 0)
  const ranked = [...saved.people].sort((a, b) => (perPerson.get(b.id)?.ms ?? 0) - (perPerson.get(a.id)?.ms ?? 0))
  const top3 = ranked.slice(0, 3).reduce((n, p) => n + (perPerson.get(p.id)?.ms ?? 0), 0)
  const maxPair = Math.max(1, ...pairs.map((p) => p.count))

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-5 pb-24 sm:px-6 sm:pt-8 print:p-0">
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <p className="mr-2 text-3xl font-semibold tracking-tight tabular-nums" aria-label={`Discussion time ${clock(elapsed)}`}>
            {clock(elapsed)}
          </p>
          {saved.endedAt === null ? (
            <>
              <button type="button" onClick={() => tap(null)} disabled={!running || current === null} className={outline}>
                Pause
              </button>
              <button type="button" onClick={() => change({ turns: saved.turns.slice(0, -1), ...(saved.turns.length === 1 ? { startedAt: null } : {}) })} disabled={!saved.turns.length} className={outline}>
                Undo
              </button>
              <button type="button" onClick={() => change({ endedAt: elapsed })} disabled={!running} className={outline}>
                End
              </button>
            </>
          ) : (
            <span className="text-sm text-dim">Ended</span>
          )}
          <span className="mx-1 hidden h-6 w-px bg-rule sm:block" aria-hidden="true" />
          <button type="button" aria-pressed={arranging} onClick={() => setArranging(!arranging)} className={toggle(arranging)}>
            {arranging ? 'Done arranging' : 'Arrange seats'}
          </button>
          <button type="button" onClick={() => setEditing(true)} className={quiet}>
            Edit names
          </button>
          {confirmNew ? (
            <span className="flex items-center gap-2 text-sm">
              Clear this discussion?
              <button
                type="button"
                onClick={() => {
                  change({ turns: [], startedAt: null, endedAt: null })
                  setConfirmNew(false)
                }}
                className={outline}
              >
                Clear it
              </button>
              <button type="button" onClick={() => setConfirmNew(false)} className={quiet}>
                Keep it
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => (saved.turns.length ? setConfirmNew(true) : undefined)} disabled={!saved.turns.length} className={quiet}>
              New discussion
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-dim print:hidden" aria-live="polite">
          {arranging
            ? 'Drag each name to where that person sits. Tap Done arranging to go back to logging.'
            : saved.endedAt !== null
              ? 'The discussion has ended. Start a new one to log again.'
              : current
                ? `${saved.people.find((p) => p.id === current)?.name ?? 'Someone'} is speaking. Tap the next person to speak.`
                : saved.turns.length
                  ? 'Paused. Tap whoever speaks next.'
                  : 'Tap a name when that person starts speaking. The clock starts with the first tap.'}
        </p>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] print:block">
          <SeatMap people={saved.people} pairs={pairs} maxPair={maxPair} perPerson={perPerson} current={current} arranging={arranging} onTap={(id) => tap(id)} onMove={(id, x, y) => change({ people: saved.people.map((p) => (p.id === id ? { ...p, x, y } : p)) })} />

          <section aria-labelledby="stats-heading" className="min-w-0 print:mt-6">
            <h2 id="stats-heading" className="text-lg font-semibold tracking-tight">
              Who spoke
            </h2>
            <p className="mt-1 text-sm text-pretty text-dim">
              {saved.turns.length === 0
                ? 'Nothing logged yet.'
                : `${[...perPerson.values()].reduce((n, s) => n + s.turns, 0)} turns from ${spoken.length} of ${saved.people.length} people.${spoken.length >= 4 && talk > 0 ? ` The three who spoke most had ${Math.round((top3 / talk) * 100)}% of the talk time.` : ''}`}
            </p>
            <ul className="mt-3 grid gap-2">
              {ranked.map((p) => {
                const s = perPerson.get(p.id)
                const share = s && talk ? s.ms / talk : 0
                return (
                  <li key={p.id} className="text-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`min-w-0 truncate ${s ? 'font-medium' : 'text-dim'}`} dir="auto">
                        {p.name}
                      </span>
                      <span className="shrink-0 text-dim tabular-nums">{s ? `${s.turns} ${s.turns === 1 ? 'turn' : 'turns'} · ${clock(s.ms)}` : 'not yet'}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                      <div className="h-full rounded-full bg-ink print-exact" style={{ width: `${share * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
            {silent.length > 0 && saved.turns.length > 0 && (
              <p className="mt-4 text-sm text-pretty" dir="auto">
                <span className="font-medium">Not heard from yet:</span> {silent.map((p) => p.name).join(', ')}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2 print:hidden">
              <button type="button" onClick={() => void saveImage(saved.people, pairs, maxPair, perPerson, elapsed)} disabled={!saved.people.length} className={outline}>
                Save map as image
              </button>
              <button type="button" onClick={() => download(new Blob(['\uFEFF', turnsCSV(saved.turns, saved.people, elapsed)], { type: 'text/csv;charset=utf-8' }), 'discussion-turns.csv')} disabled={!saved.turns.length} className={outline}>
                Download turns (CSV)
              </button>
              <button type="button" onClick={() => window.print()} className={quiet}>
                Print
              </button>
            </div>
          </section>
        </div>
        <p className="mt-10 max-w-prose text-sm text-pretty text-dim print:hidden">Lines join people who spoke one after the other, and thicker lines mean the floor passed between them more often. Everything stays on this device.</p>
      </div>
      <style>{`@media print { .print-exact { print-color-adjust: exact; -webkit-print-color-adjust: exact; } @page { margin: 0.5in; } }`}</style>
    </div>
  )
}

function SeatMap({ people, pairs, maxPair, perPerson, current, arranging, onTap, onMove }: { people: Person[]; pairs: { a: string; b: string; count: number }[]; maxPair: number; perPerson: Map<string, { turns: number; ms: number }>; current: string | null; arranging: boolean; onTap: (id: string) => void; onMove: (id: string, x: number, y: number) => void }) {
  const box = useRef<HTMLDivElement>(null)
  // A ref, so a move right after the press already knows who is being dragged.
  const drag = useRef<string | null>(null)
  const at = new Map(people.map((p) => [p.id, p]))
  const place = (e: ReactPointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    const x = Math.round(Math.min(MAP.w - 40, Math.max(40, ((e.clientX - r.left) / r.width) * MAP.w)))
    const y = Math.round(Math.min(MAP.h - 30, Math.max(30, ((e.clientY - r.top) / r.height) * MAP.h)))
    return { x, y }
  }
  return (
    <div ref={box} className={`relative w-full touch-none overflow-hidden rounded-2xl border border-rule bg-ink/[0.02] select-none aspect-[3/4] sm:aspect-[10/7] print:aspect-[10/7] ${arranging ? 'outline-2 outline-ink outline-dashed' : ''}`}>
      <svg viewBox={`0 0 ${MAP.w} ${MAP.h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <ellipse cx={MAP.w / 2} cy={MAP.h / 2} rx={MAP.w * 0.26} ry={MAP.h * 0.22} className="fill-ink/[0.04] stroke-rule" vectorEffect="non-scaling-stroke" strokeWidth={1} />
        {pairs.map((p) => {
          const a = at.get(p.a)
          const b = at.get(p.b)
          if (!a || !b) return null
          return <line key={`${p.a}|${p.b}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-ink" strokeOpacity={0.25 + 0.55 * (p.count / maxPair)} strokeWidth={1.5 + 5 * (p.count / maxPair)} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        })}
      </svg>
      {people.map((p) => {
        const s = perPerson.get(p.id)
        const speaking = p.id === current
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => !arranging && onTap(p.id)}
            onPointerDown={(e) => {
              if (!arranging) return
              e.currentTarget.setPointerCapture?.(e.pointerId)
              drag.current = p.id
            }}
            onPointerMove={(e) => {
              if (drag.current !== p.id) return
              const { x, y } = place(e)
              onMove(p.id, x, y)
            }}
            onPointerUp={() => {
              drag.current = null
            }}
            className={`absolute flex max-w-[42%] min-w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl border-2 px-2.5 py-1.5 text-center leading-tight shadow-sm transition-colors sm:max-w-[24%] sm:px-3 ${arranging ? 'cursor-grab' : 'cursor-pointer'} ${speaking ? 'border-ink bg-ink text-paper' : s ? 'border-ink/60 bg-paper hover:bg-ink/5' : 'border-dashed border-dim/60 bg-paper hover:bg-ink/5'} print:shadow-none`}
            style={{ left: `${(p.x / MAP.w) * 100}%`, top: `${(p.y / MAP.h) * 100}%` }}
            aria-pressed={speaking}
            aria-label={`${p.name}${s ? `, ${s.turns} ${s.turns === 1 ? 'turn' : 'turns'}, ${clock(s.ms)}` : ', not yet spoken'}${arranging ? '. Drag to move.' : '. Tap when they start speaking.'}`}
          >
            <span className="max-w-full truncate text-sm font-semibold sm:text-base" dir="auto">
              {p.name}
            </span>
            <span className={`text-xs whitespace-nowrap tabular-nums ${speaking ? 'opacity-80' : 'text-dim'}`}>{s ? `${s.turns} · ${clock(s.ms)}` : 'not yet'}</span>
          </button>
        )
      })}
    </div>
  )
}

function Names({ people, hasTurns, onSave, onCancel }: { people: Person[]; hasTurns: boolean; onSave: (names: string[]) => void; onCancel?: () => void }) {
  const [text, setText] = useState(() => people.map((p) => p.name).join('\n'))
  const names = parseNames(text)
  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="max-w-prose text-pretty text-dim">
          See who speaks in a discussion, and to whom. Put in the names of the people in a seminar, a meeting, or a circle, arrange them as they’re sitting, then tap whoever starts speaking. Discussion Map draws a line between each speaker and the next, the way teachers sketch a Harkness discussion on paper, and counts each person’s turns and talk time.
        </p>
        <label className="mt-8 grid gap-1.5">
          <span className="font-medium">Who’s taking part?</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder={'One name per line\nAva\nBen\nCleo'} className={`${control} w-full py-2 leading-relaxed`} dir="auto" />
        </label>
        <p className="mt-2 text-sm text-dim">
          {names.length ? `${names.length} ${names.length === 1 ? 'person' : 'people'}, up to 40.` : 'Type or paste names, one per line or separated by commas.'}
          {hasTurns && ' Removing someone keeps their turns in the record.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => onSave(names)} disabled={!names.length} className={primary}>
            {people.length ? 'Save names' : 'Seat them around the table'}
          </button>
          {!people.length && (
            <button type="button" onClick={() => setText(SAMPLE)} className={outline}>
              Try a sample group
            </button>
          )}
          {onCancel && (
            <button type="button" onClick={onCancel} className={quiet}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/** Keeps the seats of people still in the list, and seats newcomers around the table. */
function reseat(people: Person[], names: string[]): Person[] {
  const byName = new Map(people.map((p) => [p.name.toLocaleLowerCase(), p]))
  const kept = names.map((n) => byName.get(n.toLocaleLowerCase())).filter((p): p is Person => !!p)
  // A fresh table, or only renames: seat everyone evenly.
  if (!kept.length) return names.map((name, i) => ({ id: newId(), name, ...circle(names.length)[i] }))
  const seats = circle(names.length)
  return names.map((name, i) => byName.get(name.toLocaleLowerCase()) ?? { id: newId(), name, ...seats[i] })
}

function useNow(active: boolean): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [active])
  return now
}

/** The map drawn as a picture: table, lines, and names with their counts. */
async function saveImage(people: Person[], pairs: { a: string; b: string; count: number }[], maxPair: number, perPerson: Map<string, { turns: number; ms: number }>, elapsed: number) {
  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = MAP.w * scale
  canvas.height = (MAP.h + 60) * scale
  const g = canvas.getContext('2d')!
  g.scale(scale, scale)
  g.fillStyle = '#ffffff'
  g.fillRect(0, 0, MAP.w, MAP.h + 60)
  g.fillStyle = '#1c1917'
  g.font = '600 22px system-ui, sans-serif'
  g.fillText(`Discussion map · ${clock(elapsed)}`, 24, 40)
  g.save()
  g.translate(0, 60)
  g.beginPath()
  g.ellipse(MAP.w / 2, MAP.h / 2, MAP.w * 0.26, MAP.h * 0.22, 0, 0, Math.PI * 2)
  g.fillStyle = '#f5f5f4'
  g.fill()
  const at = new Map(people.map((p) => [p.id, p]))
  g.lineCap = 'round'
  for (const p of pairs) {
    const a = at.get(p.a)
    const b = at.get(p.b)
    if (!a || !b) continue
    g.strokeStyle = `rgba(28,25,23,${0.25 + 0.55 * (p.count / maxPair)})`
    g.lineWidth = 1.5 + 5 * (p.count / maxPair)
    g.beginPath()
    g.moveTo(a.x, a.y)
    g.lineTo(b.x, b.y)
    g.stroke()
  }
  for (const p of people) {
    const s = perPerson.get(p.id)
    g.font = '600 18px system-ui, sans-serif'
    const sub = s ? `${s.turns} · ${clock(s.ms)}` : 'not yet'
    const w = Math.max(g.measureText(p.name).width, 60) + 28
    g.fillStyle = '#ffffff'
    g.strokeStyle = s ? '#57534e' : '#a8a29e'
    g.lineWidth = 2
    g.setLineDash(s ? [] : [6, 4])
    g.beginPath()
    g.roundRect(p.x - w / 2, p.y - 28, w, 56, 12)
    g.fill()
    g.stroke()
    g.setLineDash([])
    g.fillStyle = '#1c1917'
    g.textAlign = 'center'
    g.fillText(p.name, p.x, p.y - 2)
    g.font = '14px system-ui, sans-serif'
    g.fillStyle = '#57534e'
    g.fillText(sub, p.x, p.y + 18)
    g.textAlign = 'start'
  }
  g.restore()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (blob) download(blob, 'discussion-map.png')
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

function load(): Saved {
  const fallback: Saved = { people: [], turns: [], startedAt: null, endedAt: null }
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!d || !Array.isArray(d.people)) return fallback
    const people: Person[] = d.people
      .filter((p: Person) => p && typeof p.id === 'string' && typeof p.name === 'string' && Number.isFinite(p.x) && Number.isFinite(p.y))
      .slice(0, 40)
      .map((p: Person) => ({ id: p.id, name: p.name.slice(0, 40), x: Math.min(MAP.w, Math.max(0, p.x)), y: Math.min(MAP.h, Math.max(0, p.y)) }))
    const turns: Turn[] = Array.isArray(d.turns) ? d.turns.filter((t: Turn) => t && (t.who === null || typeof t.who === 'string') && Number.isFinite(t.at) && t.at >= 0).slice(0, 5000) : []
    return { people, turns, startedAt: Number.isFinite(d.startedAt) ? d.startedAt : null, endedAt: Number.isFinite(d.endedAt) ? d.endedAt : null }
  } catch {
    return fallback
  }
}
