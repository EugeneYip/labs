import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { exampleText } from './example.ts'
import { csvCell, floor, LIMITS, moveAround, movedFrom, NEED, partsOf, settle, suggest, tally, type Change, type Show } from './model.ts'
import { guessShape, keyOf, likelyDuplicates, looksLikeTable, parseTable, READ_LIMITS, readLines, readTable, type Read, type Shape, type Table } from './roster.ts'

const KEY = 'labs:show-order'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const select = `${control} h-11 sm:h-10`
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const small = 'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-rule px-2 text-sm hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9 sm:min-w-9'
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'

interface Routine {
  name: string
  dancers: string[]
  pinned: boolean
  /** The part of the show it's kept in (0 before the first intermission), or -1 for any. */
  part: number
}

interface Plan {
  routines: Routine[]
  /** Routine indexes in show order. */
  order: number[]
  /** After how many numbers each intermission comes. */
  breaks: number[]
  need: number
  /** The order before the last suggestion, to go back to. */
  undo: number[] | null
}

interface Outcome {
  before: number[]
  after: number[]
  moved: number
  exact: boolean
  proven: boolean
  stopped: boolean
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`
const isPermutation = (a: unknown, n: number): a is number[] =>
  Array.isArray(a) && a.length === n && new Set(a).size === n && a.every((x) => Number.isInteger(x) && x >= 0 && x < n)

/** A saved plan, checked from top to bottom, or null if anything about it is wrong. */
function readPlan(raw: string | null | undefined): Plan | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw)
    const p = v?.v === 1 ? v.plan : null
    if (!p || !Array.isArray(p.routines) || p.routines.length < 1 || p.routines.length > LIMITS.routines) return null
    const routines: Routine[] = []
    for (const r of p.routines) {
      if (typeof r?.name !== 'string' || r.name.length > 500 || !Array.isArray(r.dancers) || r.dancers.length > 2_000) return null
      if (!r.dancers.every((d: unknown) => typeof d === 'string' && d.length <= 300)) return null
      if (typeof r.pinned !== 'boolean' || !Number.isInteger(r.part) || r.part < -1 || r.part > 9) return null
      routines.push({ name: r.name, dancers: [...r.dancers], pinned: r.pinned, part: r.part })
    }
    const n = routines.length
    if (!isPermutation(p.order, n)) return null
    const breaks = p.breaks
    if (!Array.isArray(breaks) || breaks.length > 9 || !breaks.every((b: unknown, i: number) => Number.isInteger(b) && (b as number) >= 1 && (b as number) < n && (i === 0 || (b as number) > breaks[i - 1]))) return null
    if (!Number.isInteger(p.need) || p.need < NEED.min || p.need > NEED.max) return null
    if (p.undo !== null && !isPermutation(p.undo, n)) return null
    return { routines, order: [...p.order], breaks: [...breaks], need: p.need, undo: p.undo ? [...p.undo] : null }
  } catch {
    return null
  }
}

function stored(): string | null | undefined {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return undefined
  }
}

/** The dancers by name (case, accents, spacing, and punctuation ignored), the first spelling shown. */
function showOf(plan: Plan): Show {
  const people: string[] = []
  const index = new Map<string, number>()
  const dancers = plan.routines.map((r) =>
    r.dancers.map((name) => {
      const k = keyOf(name)
      let i = index.get(k)
      if (i === undefined) {
        i = people.length
        index.set(k, i)
        people.push(name)
      }
      return i
    }),
  )
  return { names: plan.routines.map((r) => r.name), dancers: dancers.map((ds) => [...new Set(ds)]), people }
}

/** The plan as lines to edit: in its order, with the intermissions. */
function planText(plan: Plan): string {
  const lines: string[] = []
  plan.order.forEach((r, p) => {
    if (plan.breaks.includes(p)) lines.push('Intermission')
    const routine = plan.routines[r]
    lines.push(`${routine.name}: ${routine.dancers.join(', ')}`)
  })
  return lines.join('\n')
}

function download(content: string, name: string, type = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

const betweenText = (b: number) => (b === 0 ? 'back to back' : `${b} between`)

/** Routines a show almost always keeps in place, by name: pinned when a plan is made, with a note saying so. */
const FIXED = /\b(open(ing|er)|finale|closing|curtain call|bows)\b/i

/** Experiment #030: a show's running order where nobody has back-to-back numbers and quick changes are fewest. */
export default function ShowOrder() {
  const [plan, setPlan] = useState<Plan | null>(() => readPlan(stored()))
  const [damaged] = useState(() => {
    const raw = stored()
    return !!raw && readPlan(raw) === null
  })
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'auto' | 'lines' | 'table'>('auto')
  // A mode set because a file was a CSV lasts until the text is edited.
  const [modeFromFile, setModeFromFile] = useState(false)
  const [chosen, setChosen] = useState<{ table: Table; shape: Shape } | null>(null)
  const [saved, setSaved] = useState(true)
  const [running, setRunning] = useState(false)
  // The search's progress goes straight to the bar, so the running order isn't drawn again at every step.
  const progressTo = useRef<(done: number) => void>(() => {})
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [moved, setMoved] = useState<Set<number>>(new Set())
  const [said, setSaid] = useState('')
  const [printing, setPrinting] = useState<'order' | 'changes' | 'dancers' | null>(null)
  const [dragging, setDragging] = useState<{ from: number; to: number } | null>(null)
  const [autoPinned, setAutoPinned] = useState<string[]>([])
  const stop = useRef<AbortController | null>(null)
  const focusAfter = useRef<{ routine: number; control: string } | null>(null)
  const orderHeading = useRef<HTMLHeadingElement>(null)
  const textBox = useRef<HTMLTextAreaElement>(null)

  const say = (message: string) => setSaid((s) => (s === message ? `${message} ` : message))

  // Another tab's save is taken up here, so neither erases the other's plan.
  const save = useOtherTabs(KEY, () => {
    const next = readPlan(stored())
    setPlan(next)
    setOutcome(null)
    setMoved(new Set())
  })
  useEffect(() => {
    if (!plan) return
    try {
      save(JSON.stringify({ v: 1, plan }))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [plan, save])

  useEffect(() => {
    if (!focusAfter.current) return
    const { routine, control: which } = focusAfter.current
    focusAfter.current = null
    document.querySelector<HTMLElement>(`[data-routine="${routine}"][data-control="${which}"]`)?.focus()
  })

  useEffect(() => {
    if (!printing) return
    const done = () => setPrinting(null)
    window.addEventListener('afterprint', done, { once: true })
    window.print()
    // Some browsers return from print() without an afterprint event.
    const t = setTimeout(done, 1500)
    return () => {
      clearTimeout(t)
      window.removeEventListener('afterprint', done)
    }
  }, [printing])

  // --- Reading
  const tooLong = text.length > READ_LIMITS.characters
  const asTable = mode === 'table' || (mode === 'auto' && looksLikeTable(text))
  const table = useMemo(() => (asTable && text.trim() && !tooLong ? parseTable(text) : null), [asTable, text, tooLong])
  const shape = table ? (chosen && chosen.table === table ? chosen.shape : guessShape(table)) : null
  const read: Read | null = useMemo(() => {
    if (!text.trim() || tooLong) return null
    if (asTable) return table && shape ? readTable(table, shape) : null
    return readLines(text)
  }, [text, tooLong, asTable, table, shape])
  const readStats = useMemo(() => {
    if (!read) return null
    const people = new Map<string, number>()
    let appearances = 0
    for (const r of read.routines)
      for (const d of r.dancers) {
        people.set(keyOf(d), (people.get(keyOf(d)) ?? 0) + 1)
        appearances++
      }
    const several = [...people.values()].filter((c) => c > 1).length
    const problem =
      read.routines.length === 0
        ? 'No routines were read.'
        : read.routines.length > LIMITS.routines
          ? `That’s ${plural(read.routines.length, 'routine')}; this page plans up to ${LIMITS.routines}.`
          : people.size > LIMITS.people
            ? `That’s ${plural(people.size, 'dancer')}; this page plans up to ${LIMITS.people.toLocaleString('en')}.`
            : appearances > LIMITS.appearances
              ? `That’s ${appearances.toLocaleString('en')} places in routines; this page plans up to ${LIMITS.appearances.toLocaleString('en')}.`
              : people.size === 0
                ? 'No dancers were read: put a colon between each routine’s name and its dancers.'
                : ''
    return { people: people.size, several, problem }
  }, [read])

  const usePlan = () => {
    if (!read || !readStats || readStats.problem) return
    // Pins and parts carry over to routines of the same name when a plan is edited.
    const before = new Map<string, Routine>()
    if (plan && editing) for (const r of plan.routines) before.set(keyOf(r.name), r)
    const routines: Routine[] = read.routines.map((r) => {
      const old = before.get(keyOf(r.name))
      return { name: r.name, dancers: r.dancers, pinned: old ? old.pinned : FIXED.test(r.name), part: old && old.part <= read.breaks.length ? old.part : -1 }
    })
    setAutoPinned(plan && editing ? [] : routines.filter((x) => x.pinned).map((x) => x.name))
    const identity = routines.map((_, i) => i)
    const need = plan?.need ?? NEED.standard
    const settled = settle(identity, { need, breaks: read.breaks }, { pinned: routines.map((x) => x.pinned), part: routines.map((x) => x.part) })
    if (!settled) routines.forEach((x) => (x.part = -1))
    const next: Plan = { routines, order: settled ?? identity, breaks: read.breaks, need, undo: null }
    setPlan(next)
    setEditing(false)
    setOutcome(null)
    setMoved(new Set())
    say(`${plural(routines.length, 'routine')} in the running order.`)
    requestAnimationFrame(() => orderHeading.current?.focus())
  }

  const startOver = () => {
    if (plan && !window.confirm('Start again? The running order saved in this browser will be removed.')) return
    try {
      localStorage.removeItem(KEY)
    } catch {
      // Storage that can't be reached has nothing to remove.
    }
    setPlan(null)
    setEditing(false)
    setText('')
    setAutoPinned([])
    setOutcome(null)
    setMoved(new Set())
    say('Started again.')
    requestAnimationFrame(() => textBox.current?.focus())
  }

  // --- The plan
  const show = useMemo(() => (plan ? showOf(plan) : null), [plan])
  const rules = useMemo(() => (plan ? { need: plan.need, breaks: plan.breaks } : null), [plan])
  const counted = useMemo(() => (plan && show && rules ? tally(show, plan.order, rules) : null), [plan, show, rules])
  const floors = useMemo(() => (show && rules ? floor(show, rules) : null), [show, rules])
  const dupes = useMemo(() => (show ? likelyDuplicates(show.people) : []), [show])
  const arrivals = useMemo(() => {
    const by = new Map<number, Change[]>()
    for (const c of counted?.quick ?? []) by.set(c.to, [...(by.get(c.to) ?? []), c])
    return by
  }, [counted])
  const schedules = useMemo(() => {
    if (!plan || !show || !rules) return []
    const part = partsOf(plan.order.length, plan.breaks)
    const at: number[][] = show.people.map(() => [])
    plan.order.forEach((r, p) => show.dancers[r].forEach((d) => at[d].push(p)))
    return show.people
      .map((name, d) => {
        let tightest = Infinity
        for (let i = 1; i < at[d].length; i++) if (part[at[d][i]] === part[at[d][i - 1]]) tightest = Math.min(tightest, at[d][i] - at[d][i - 1] - 1)
        return { d, name, at: at[d], tightest }
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  }, [plan, show, rules])

  const change = (next: Plan) => {
    setPlan(next)
  }

  const moveTo = (from: number, to: number, focus?: string) => {
    if (!plan || from === to || to < 0 || to >= plan.order.length) return
    const r = plan.order[from]
    const order = moveAround(plan.order, plan.routines.map((x) => x.pinned), from, to)
    const now = order.indexOf(r)
    if (now === from) return
    const routines = [...plan.routines]
    // Moving a routine by hand across an intermission keeps it where it was put.
    const part = partsOf(order.length, plan.breaks)
    if (routines[r].part >= 0 && routines[r].part !== part[now]) routines[r] = { ...routines[r], part: part[now] }
    if (focus) focusAfter.current = { routine: r, control: focus }
    change({ ...plan, routines, order })
    setMoved(new Set())
    setOutcome(null)
    say(`${routines[r].name} is now number ${now + 1}.`)
  }

  const togglePin = (r: number) => {
    if (!plan) return
    setAutoPinned([])
    const routines = plan.routines.map((x, i) => (i === r ? { ...x, pinned: !x.pinned } : x))
    change({ ...plan, routines })
    say(`${plan.routines[r].name} ${routines[r].pinned ? 'pinned: it stays at its number' : 'no longer pinned'}.`)
  }

  const keepIn = (r: number, part: number) => {
    if (!plan) return
    const routines = plan.routines.map((x, i) => (i === r ? { ...x, part } : x))
    // Put it in that part now, so what's shown is what the suggestion starts from.
    const settled = settle(plan.order, { need: plan.need, breaks: plan.breaks }, { pinned: routines.map((x) => x.pinned), part: routines.map((x) => x.part) })
    if (!settled) {
      say('There isn’t room in that part for every routine kept there: unpin one there, or keep fewer there.')
      return
    }
    change({ ...plan, routines, order: settled })
  }

  const setBreaks = (breaks: number[]) => {
    if (!plan) return
    const clean = [...new Set(breaks.filter((b) => b >= 1 && b < plan.order.length))].sort((a, b) => a - b).slice(0, 3)
    let routines = plan.routines.map((x) => (x.part > clean.length ? { ...x, part: -1 } : x))
    const keep = () => ({ pinned: routines.map((x) => x.pinned), part: routines.map((x) => x.part) })
    let order = settle(plan.order, { need: plan.need, breaks: clean }, keep())
    if (!order) {
      routines = routines.map((x) => ({ ...x, part: -1 }))
      order = [...plan.order]
      say('The routines kept before or after the intermission no longer fit, so they can go anywhere now.')
    }
    change({ ...plan, routines, order, breaks: clean })
    setOutcome(null)
  }

  const merge = (keep: string, drop: string) => {
    if (!plan) return
    const k = keyOf(drop)
    const routines = plan.routines.map((r) => {
      const names = r.dancers.map((n) => (keyOf(n) === k ? keep : n))
      return { ...r, dancers: names.filter((n, i) => names.findIndex((m) => keyOf(m) === keyOf(n)) === i) }
    })
    change({ ...plan, routines })
    say(`${drop} is now counted as ${keep}.`)
  }

  const runSuggest = async () => {
    if (!plan || !show || !rules || !counted) return
    const keep = { pinned: plan.routines.map((r) => r.pinned), part: plan.routines.map((r) => r.part) }
    const start = settle(plan.order, rules, keep)
    if (!start) {
      say('A part of the show has more routines kept in it than places.')
      return
    }
    const controller = new AbortController()
    stop.current = controller
    setRunning(true)
    setOutcome(null)
    const seedBox = new Uint32Array(1)
    crypto.getRandomValues(seedBox)
    try {
      const result = await suggest(show, start, rules, keep, seedBox[0], { signal: controller.signal, onProgress: (d) => progressTo.current(d) })
      const total = result.levels.reduce((a, b) => a + b, 0)
      const movedSet = movedFrom(result.order, plan.order)
      setPlan({ ...plan, order: result.order, undo: [...plan.order] })
      setMoved(movedSet)
      const o: Outcome = { before: counted.levels, after: result.levels, moved: movedSet.size, exact: result.exact, proven: floors !== null && total === floors.total, stopped: result.stopped }
      setOutcome(o)
      say(outcomeText(o, plan.need))
    } finally {
      setRunning(false)
      stop.current = null
    }
  }

  const undo = () => {
    if (!plan?.undo) return
    change({ ...plan, order: plan.undo, undo: null })
    setOutcome(null)
    setMoved(new Set())
    say('Back to the order before the suggestion.')
  }

  const openFile = async (file: File) => {
    const content = await file.text()
    setText(content)
    const csv = /\.(csv|tsv)$/i.test(file.name)
    setMode(csv ? 'table' : 'auto')
    setModeFromFile(csv)
    setChosen(null)
    say(`${file.name} opened.`)
  }

  const showInput = !plan || editing
  const busy = running
  const total = counted ? counted.levels.reduce((a, b) => a + b, 0) : 0

  return (
    <div className="flex-1">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="sr-only" aria-live="polite">
          {said}
        </p>

        <section aria-labelledby="intro-heading" className="grid grid-cols-1 gap-4 print:hidden">
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            Plan a show’s running order so dancers aren’t in back-to-back numbers and have as few quick changes as the page can find. Paste your routines and who is in each, then reorder
            them yourself or have an order suggested around the numbers you pin.
          </p>
          <ul className="grid max-w-prose grid-cols-1 list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
            <li>
              What you paste or open is read here, in this browser; nothing is uploaded. The running order is saved in this browser so it’s here when you come back, until you start again, though a
              browser can clear it (Safari after about a week without a visit): download the CSV to keep a copy.
            </li>
            <li>For dance recitals and showcases, school concerts, and variety shows: anywhere performers are in more than one number.</li>
            <li>It plans one show at a time. Costumes, music, and timings aren’t handled here.</li>
          </ul>
          <details className="max-w-prose text-sm text-dim">
            <summary className={summaryStyle}>How it decides</summary>
            <div className="grid grid-cols-1 gap-2 pt-3 text-pretty">
              <p>A change is a dancer going from one of their numbers to their next. It’s quick when fewer numbers than you choose come between (three, unless you change it). A change across an intermission never counts.</p>
              <p>A suggested order has, first, as few back-to-back changes as possible; then as few with one number between; then two; and so on. Among orders that are just as good, it keeps closest to yours. Pinned routines don’t move, and a routine kept before or after an intermission stays there.</p>
              <p>With eight or fewer routines free to move, every possible order is compared. With more, it searches, and says when it can prove nothing does better: when some dancers are in so many numbers that their quick changes can’t be avoided, and the order has no more than those.</p>
            </div>
          </details>
          {damaged && !plan && (
            <p className="max-w-prose rounded-xl border border-rule px-4 py-3 text-sm text-pretty" role="status">
              A running order saved in this browser couldn’t be read, so the page started empty. It stays saved until you plan a show here.
            </p>
          )}
        </section>

        {showInput && (
          <section aria-labelledby="routines-heading" className="grid grid-cols-1 gap-3 print:hidden">
            <h2 id="routines-heading" className="text-lg font-semibold tracking-tight">
              {editing ? 'Edit the routines' : 'Routines'}
            </h2>
            <p className="max-w-prose text-sm text-pretty text-dim">
              One routine per line: its name, a colon, then its dancers separated by commas. Put <span className="text-ink">Intermission</span> on a line of its own where it goes. A CSV
              file, or cells copied from a spreadsheet, work too: a routine per row with its dancers in one cell, a dancer per row beside their routine, or a grid with a mark for each.
            </p>
            <label className="grid grid-cols-1 gap-1.5">
              <span className="sr-only">Routines and their dancers</span>
              <textarea
                ref={textBox}
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setChosen(null)
                  if (modeFromFile) {
                    setMode('auto')
                    setModeFromFile(false)
                  }
                }}
                rows={10}
                spellCheck={false}
                placeholder={'Opening: Ava Smith, Leo Park, Mia Chen\nTap 5–7: Leo Park, Zoe Ray\nIntermission\nFinale: Ava Smith, Leo Park, Mia Chen, Zoe Ray'}
                className={`${control} min-h-48 w-full py-2 font-mono text-sm`}
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={primary} disabled={!read || !readStats || !!readStats.problem || busy} onClick={usePlan}>
                {editing ? 'Use these routines' : 'Plan this show'}
              </button>
              <FileButton label="Open a file" onFile={openFile} />
              {!editing && (
                <button
                  type="button"
                  className={quiet}
                  onClick={() => {
                    setText(exampleText())
                    setMode('auto')
                    say('An example recital is in the box: 22 routines.')
                  }}
                >
                  Try an example
                </button>
              )}
              {editing && (
                <button type="button" className={quiet} onClick={() => setEditing(false)}>
                  Cancel
                </button>
              )}
            </div>
            {text.trim() !== '' && (
              <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <legend className="sr-only">Read as</legend>
                <span className="text-dim">Read as:</span>
                {(['lines', 'table'] as const).map((m) => (
                  <label key={m} className="inline-flex min-h-11 cursor-pointer items-center gap-2 sm:min-h-9">
                    <input
                      type="radio"
                      name="read-as"
                      checked={(m === 'table') === asTable}
                      onChange={() => {
                        setMode(m)
                        setModeFromFile(false)
                      }}
                    />
                    {m === 'lines' ? 'lines (Routine: dancers)' : 'a table'}
                  </label>
                ))}
              </fieldset>
            )}
            {table && <ShapePicker table={table} shape={shape} onChange={(s) => setChosen({ table, shape: s })} />}
            {tooLong && <p className="text-sm text-red-800 dark:text-red-300">That’s more text than this page reads ({READ_LIMITS.characters.toLocaleString('en')} characters).</p>}
            {read && readStats && (
              <div className="grid max-w-prose grid-cols-1 gap-1 text-sm text-pretty" role="status">
                {readStats.problem ? (
                  <p className="text-red-800 dark:text-red-300">{readStats.problem}</p>
                ) : (
                  <p>
                    {plural(read.routines.length, 'routine')}, {plural(readStats.people, 'dancer')} ({readStats.several.toLocaleString('en')} in more than one)
                    {read.breaks.length ? `, ${plural(read.breaks.length, 'intermission')}` : ''}.
                  </p>
                )}
                {read.notes.map((n) => (
                  <p key={n} className="text-dim">
                    {n}
                  </p>
                ))}
              </div>
            )}
          </section>
        )}

        {plan && show && rules && counted && floors && (
          <>
            <section aria-labelledby="order-heading" className={`grid grid-cols-1 gap-4 ${printing && printing !== 'order' ? 'print:hidden' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="order-heading" ref={orderHeading} tabIndex={-1} className="text-lg font-semibold tracking-tight">
                  Running order
                </h2>
                <div className="flex flex-wrap gap-2 print:hidden">
                  <button
                    type="button"
                    className={quiet}
                    disabled={busy}
                    onClick={() => {
                      setText(planText(plan))
                      setMode('lines')
                      setEditing(true)
                      requestAnimationFrame(() => textBox.current?.focus())
                    }}
                  >
                    Edit routines
                  </button>
                  <button type="button" className={quiet} disabled={busy} onClick={startOver}>
                    Start again
                  </button>
                </div>
              </div>

              {!saved && <NotSaving>This browser isn’t saving the running order, so it will be gone when the page closes. Download it as a CSV file to keep it.</NotSaving>}

              <div className="grid grid-cols-1 gap-3 rounded-xl border border-rule p-4 print:hidden">
                <label className="flex flex-wrap items-center gap-2 text-sm">
                  <span>A change is quick with fewer than</span>
                  <select
                    className={select}
                    value={plan.need}
                    disabled={busy}
                    onChange={(e) => {
                      change({ ...plan, need: Number(e.target.value) })
                      setOutcome(null)
                    }}
                  >
                    {Array.from({ length: NEED.max - NEED.min + 1 }, (_, i) => NEED.min + i).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span>{plan.need === 1 ? 'number between (only back to back counts)' : 'numbers between'}</span>
                </label>
                <Summary levels={counted.levels} need={plan.need} />
                {autoPinned.length > 0 && (
                  <p className="max-w-prose text-sm text-pretty text-dim">
                    Pinned because of {autoPinned.length === 1 ? 'its name' : 'their names'}: {autoPinned.join(', ')}. A suggestion won’t move pinned numbers; unpin any that can move.
                  </p>
                )}
                {floors.total > 0 && <Unavoidable show={show} byDancer={floors.byDancer} total={floors.total} need={plan.need} />}
                <div className="flex flex-wrap items-center gap-2">
                  {busy ? (
                    <>
                      <button type="button" className={outline} onClick={() => stop.current?.abort()}>
                        Stop
                      </button>
                      <Progress setter={progressTo} />
                    </>
                  ) : (
                    <button type="button" className={primary} disabled={total === 0} onClick={runSuggest}>
                      Suggest an order
                    </button>
                  )}
                  {plan.undo && !busy && (
                    <button type="button" className={outline} onClick={undo}>
                      Undo the suggestion
                    </button>
                  )}
                </div>
                {outcome && (
                  <p className="max-w-prose text-sm text-pretty" role="status">
                    {outcomeText(outcome, plan.need)}
                  </p>
                )}
              </div>

              <OrderList
                plan={plan}
                show={show}
                arrivals={arrivals}
                moved={moved}
                busy={busy}
                dragging={dragging}
                setDragging={setDragging}
                onMove={moveTo}
                onPin={togglePin}
                onKeep={keepIn}
                onBreaks={setBreaks}
              />
            </section>

            <section aria-labelledby="changes-heading" className={`grid grid-cols-1 gap-3 ${printing && printing !== 'changes' ? 'print:hidden' : ''}`}>
              <h2 id="changes-heading" tabIndex={-1} className="text-lg font-semibold tracking-tight">
                Quick changes
              </h2>
              {counted.quick.length === 0 ? (
                <p className="text-sm text-dim">{plan.need === 1 ? 'Nobody is in back-to-back numbers.' : `None: everyone has at least ${plan.need} numbers between their routines.`}</p>
              ) : (
                <ol className="grid max-w-3xl grid-cols-1 gap-2 text-sm">
                  {[...arrivals.entries()]
                    .sort((a, b) => a[0] - b[0])
                    .map(([to, list]) => (
                      <li key={to} className="grid grid-cols-1 gap-0.5 break-inside-avoid">
                        <span className="font-medium">
                          Into {to + 1}. {plan.routines[plan.order[to]].name}
                        </span>
                        <span className="text-pretty text-dim">
                          {list
                            .sort((a, b) => a.between - b.between || show.people[a.dancer].localeCompare(show.people[b.dancer]))
                            .map((c) => `${show.people[c.dancer]} from ${c.from + 1} (${betweenText(c.between)})`)
                            .join('; ')}
                        </span>
                      </li>
                    ))}
                </ol>
              )}
            </section>

            <section aria-labelledby="dancers-heading" className={`grid grid-cols-1 gap-3 ${printing && printing !== 'dancers' ? 'print:hidden' : ''}`}>
              <h2 id="dancers-heading" className="text-lg font-semibold tracking-tight">
                Dancers
              </h2>
              {dupes.length > 0 && (
                <div className="grid max-w-3xl grid-cols-1 gap-2 rounded-xl border border-rule p-4 text-sm print:hidden">
                  <p className="text-pretty">These may be one dancer written two ways. If so, count them as one:</p>
                  <ul className="grid grid-cols-1 gap-2">
                    {dupes.slice(0, 20).map(({ a, b, why }) => (
                      <li key={`${a}-${b}`} className="flex flex-wrap items-center gap-2">
                        <span>
                          {show.people[a]} and {show.people[b]} <span className="text-dim">({why})</span>
                        </span>
                        <button type="button" className={small} disabled={busy} onClick={() => merge(show.people[a].length >= show.people[b].length ? show.people[a] : show.people[b], show.people[a].length >= show.people[b].length ? show.people[b] : show.people[a])}>
                          Count as one
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-dim">
                {plural(show.people.length, 'dancer')}: each one’s numbers, and the fewest numbers between any two of them (an intermission counts as plenty).
              </p>
              <ul className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {schedules.map((s) => (
                  <li key={s.d} className="flex min-w-0 flex-wrap justify-between gap-x-3 border-b border-rule py-1.5 break-inside-avoid">
                    <span className="min-w-0 break-words">{s.name}</span>
                    <span className={`min-w-0 tabular-nums ${s.tightest < plan.need ? 'font-semibold' : 'text-dim'}`}>
                      {s.at.map((p) => p + 1).join(', ')}
                      {s.tightest < Infinity ? ` · ${betweenText(s.tightest)}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="keep-heading" className="grid grid-cols-1 gap-3 print:hidden">
              <h2 id="keep-heading" className="text-lg font-semibold tracking-tight">
                Print and download
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={outline} onClick={() => setPrinting('order')}>
                  Print the running order
                </button>
                <button type="button" className={outline} onClick={() => setPrinting('changes')}>
                  Print the quick changes
                </button>
                <button type="button" className={outline} onClick={() => setPrinting('dancers')}>
                  Print the dancers
                </button>
                <button
                  type="button"
                  className={outline}
                  onClick={() => {
                    download(orderCsv(plan), 'running-order.csv')
                    say('The running order was downloaded.')
                  }}
                >
                  Download the running order (CSV)
                </button>
                <button
                  type="button"
                  className={outline}
                  onClick={() => {
                    download(dancersCsv(schedules, plan.need), 'dancers.csv')
                    say('The dancers were downloaded.')
                  }}
                >
                  Download the dancers (CSV)
                </button>
              </div>
              <p className="max-w-prose text-sm text-pretty text-dim">The running order’s CSV opens again here (Open a file), with the intermissions; pins aren’t kept in it.</p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

/** The search's progress bar, updated through `setter` without drawing the rest of the page again. */
function Progress({ setter }: { setter: { current: (done: number) => void } }) {
  const [done, setDone] = useState(0)
  useEffect(() => {
    setter.current = setDone
    return () => {
      setter.current = () => {}
    }
  }, [setter])
  return <progress className="h-2 w-40 accent-ink" max={1} value={done} aria-label="Searching for an order" />
}

function outcomeText(o: Outcome, need: number): string {
  const sum = (l: number[]) => l.reduce((a, b) => a + b, 0)
  const parts: string[] = []
  if (o.stopped) parts.push('Stopped early: this is the best order found so far.')
  parts.push(
    need === 1
      ? `Back to back: ${o.before[0]} before, ${o.after[0]} now.`
      : `Quick changes: ${sum(o.before)} before, ${sum(o.after)} now${o.after[0] ? `, ${o.after[0]} of them back to back` : ''}.`,
  )
  parts.push(o.moved === 0 ? 'Nothing needed to move.' : `${plural(o.moved, 'routine')} moved (marked below).`)
  if (o.exact) parts.push('Every possible order was compared: none is better.')
  else if (o.proven) parts.push(sum(o.after) === 0 ? '' : 'That’s the fewest possible: the dancers above can’t avoid them.')
  else if (!o.stopped) parts.push('That’s the fewest this search found; it can’t prove none is better.')
  return parts.filter(Boolean).join(' ')
}

function Summary({ levels, need }: { levels: number[]; need: number }) {
  const total = levels.reduce((a, b) => a + b, 0)
  return (
    <p className="text-sm text-pretty">
      {levels[0] === 0 ? 'Nobody is in back-to-back numbers.' : <strong>{plural(levels[0], 'change is', 'changes are')} back to back.</strong>}{' '}
      {need > 1 &&
        (total === 0
          ? 'No quick changes.'
          : `${plural(total, 'quick change')}: ${levels.map((n, b) => (n ? (b === 0 ? `${n} back to back` : `${n} with ${b} between`) : '')).filter(Boolean).join(', ')}.`)}
    </p>
  )
}

function Unavoidable({ show, byDancer, total, need }: { show: Show; byDancer: number[]; total: number; need: number }) {
  const who = byDancer
    .map((n, d) => ({ n, d }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
  const names = who.slice(0, 6).map((x) => show.people[x.d])
  return (
    <p className="max-w-prose text-sm text-pretty text-dim">
      At least {plural(total, 'quick change')} can’t be avoided with {need} between: {names.join(', ')}
      {who.length > names.length ? `, and ${plural(who.length - names.length, 'other')}` : ''} {who.length === 1 ? 'is' : 'are'} in too many numbers for that.
    </p>
  )
}

function OrderList(props: {
  plan: Plan
  show: Show
  arrivals: Map<number, Change[]>
  moved: Set<number>
  busy: boolean
  dragging: { from: number; to: number } | null
  setDragging: (d: { from: number; to: number } | null) => void
  onMove: (from: number, to: number, focus?: string) => void
  onPin: (r: number) => void
  onKeep: (r: number, part: number) => void
  onBreaks: (breaks: number[]) => void
}) {
  const { plan, show, arrivals, moved, busy, dragging, setDragging, onMove, onPin, onKeep, onBreaks } = props
  const n = plan.order.length
  const edges = [0, ...plan.breaks, n]
  const rows = useRef<(HTMLLIElement | null)[]>([])
  const [addAt, setAddAt] = useState('')

  const startDrag = (e: ReactPointerEvent, from: number) => {
    if (busy || plan.routines[plan.order[from]].pinned) return
    e.preventDefault()
    const handle = e.currentTarget as HTMLElement
    handle.setPointerCapture(e.pointerId)
    const mids = rows.current.map((el) => {
      const r = el?.getBoundingClientRect()
      return r ? r.top + r.height / 2 : 0
    })
    const targetAt = (y: number) => {
      let to = 0
      for (let p = 0; p < n; p++) if (y > mids[p]) to = p
      return y < mids[0] ? 0 : to
    }
    let to = from
    setDragging({ from, to })
    const move = (ev: PointerEvent) => {
      to = targetAt(ev.clientY)
      setDragging({ from, to })
    }
    const end = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', cancel)
      setDragging(null)
      onMove(from, to)
    }
    const cancel = () => {
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', cancel)
      setDragging(null)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', cancel)
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      <a href="#changes-heading" className="w-fit rounded-lg text-sm text-dim underline-offset-4 hover:underline focus-visible:text-ink print:hidden">
        Skip past the running order
      </a>
      {edges.slice(1).map((end, k) => {
        const start = edges[k]
        return (
          <div key={k} className="grid grid-cols-1 gap-2">
            {k > 0 && (
              <div className="flex flex-wrap items-center gap-3 border-y border-dashed border-dim/60 py-2 text-sm">
                <span className="font-medium">Intermission</span>
                <button type="button" className={`${small} print:hidden`} disabled={busy} onClick={() => onBreaks(plan.breaks.filter((b) => b !== start))}>
                  Remove
                </button>
              </div>
            )}
            {plan.breaks.length > 0 && <h3 className="sr-only">{k === 0 ? 'Before the intermission' : `After intermission ${k}`}</h3>}
            <ol start={start + 1} className="grid grid-cols-1 gap-2">
              {plan.order.slice(start, end).map((r, i) => {
                const p = start + i
                const routine = plan.routines[r]
                const into = arrivals.get(p) ?? []
                const worst = into.length ? Math.min(...into.map((c) => c.between)) : null
                const target = dragging && dragging.to === p && dragging.from !== p
                return (
                  <li
                    key={r}
                    ref={(el) => {
                      rows.current[p] = el
                    }}
                    className={`grid min-w-0 grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl border p-3 break-inside-avoid ${
                      worst === 0 ? 'border-red-600 dark:border-red-400' : 'border-rule'
                    } ${dragging?.from === p ? 'opacity-50' : ''} ${target ? (dragging!.to > dragging!.from ? 'shadow-[0_3px_0_0_var(--color-ink)]' : 'shadow-[0_-3px_0_0_var(--color-ink)]') : ''}`}
                  >
                    <span
                      aria-hidden="true"
                      onPointerDown={(e) => startDrag(e, p)}
                      className={`row-span-2 flex w-8 touch-none items-start justify-center pt-1 font-mono text-sm tabular-nums select-none ${routine.pinned || busy ? 'text-dim' : 'cursor-grab text-dim hover:text-ink'} print:cursor-auto`}
                      title={routine.pinned ? undefined : 'Drag to move'}
                    >
                      {p + 1}
                    </span>
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-medium break-words">{routine.name}</span>
                        <span className="text-sm text-dim">
                          {' '}
                          · {plural(routine.dancers.length, 'dancer')}
                          <span className="print:hidden">
                            {routine.pinned ? ' · pinned' : ''}
                            {routine.part >= 0 && plan.breaks.length ? ` · kept ${routine.part === 0 ? 'before the intermission' : `after intermission ${routine.part}`}` : ''}
                            {moved.has(r) ? ` · moved from ${plan.undo ? plan.undo.indexOf(r) + 1 : ''}` : ''}
                          </span>
                        </span>
                        <span className="hidden text-sm text-pretty print:block">{routine.dancers.join(', ')}</span>
                      </div>
                      <div className="flex min-w-0 flex-wrap gap-1 print:hidden">
                        <button
                          type="button"
                          className={small}
                          aria-pressed={routine.pinned}
                          data-routine={r}
                          data-control="pin"
                          disabled={busy}
                          onClick={() => onPin(r)}
                          aria-label={`Pin ${routine.name}`}
                          title={routine.pinned ? 'Pinned: stays at its number' : 'Pin to its number'}
                        >
                          {routine.pinned ? 'Pinned' : 'Pin'}
                        </button>
                        <button type="button" className={small} data-routine={r} data-control="up" disabled={busy || p === 0} onClick={() => onMove(p, p - 1, 'up')} aria-label={`Move ${routine.name} up`}>
                          ↑
                        </button>
                        <button type="button" className={small} data-routine={r} data-control="down" disabled={busy || p === n - 1} onClick={() => onMove(p, p + 1, 'down')} aria-label={`Move ${routine.name} down`}>
                          ↓
                        </button>
                      </div>
                    </div>
                    <div className="col-start-2 grid min-w-0 grid-cols-1 gap-1 text-sm">
                      {into.length > 0 && (
                        <p className="text-pretty">
                          {[...new Set(into.map((c) => c.between))]
                            .sort((a, b) => a - b)
                            .map((b) => (
                              <span key={b} className={b === 0 ? 'font-semibold text-red-800 dark:text-red-300' : ''}>
                                {b === 0 ? 'Back to back' : `${b} between`}:{' '}
                                {into
                                  .filter((c) => c.between === b)
                                  .map((c) => show.people[c.dancer])
                                  .join(', ')}
                                .{' '}
                              </span>
                            ))}
                        </p>
                      )}
                      <details className="text-dim print:hidden">
                        <summary className="cursor-pointer underline-offset-4 hover:underline">Dancers and more</summary>
                        <div className="grid grid-cols-1 gap-2 pt-2">
                          <p className="text-pretty break-words">{routine.dancers.length ? routine.dancers.join(', ') : 'No dancers listed.'}</p>
                          <MoveTo key={`${r}-${p}`} routine={routine.name} position={p} count={n} disabled={busy} onMove={(to) => onMove(p, to)} />
                          {plan.breaks.length > 0 && !routine.pinned && (
                            <label className="flex flex-wrap items-center gap-2">
                              <span>Keep it</span>
                              <select className={select} value={routine.part} disabled={busy} onChange={(e) => onKeep(r, Number(e.target.value))}>
                                <option value={-1}>anywhere</option>
                                {edges.slice(1).map((_, j) => (
                                  <option key={j} value={j}>
                                    {j === 0 ? 'before the intermission' : `after intermission ${j}`}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                        </div>
                      </details>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )
      })}
      {plan.breaks.length < 3 && n > 1 && (
        <form
          className="flex flex-wrap items-center gap-2 text-sm print:hidden"
          onSubmit={(e) => {
            e.preventDefault()
            const at = Number(addAt)
            if (Number.isInteger(at) && at >= 1 && at < n) {
              onBreaks([...plan.breaks, at])
              setAddAt('')
            }
          }}
        >
          <label className="flex flex-wrap items-center gap-2">
            <span>Add an intermission after number</span>
            <input className={`${control} h-11 w-20 tabular-nums sm:h-10`} inputMode="numeric" value={addAt} onChange={(e) => setAddAt(e.target.value.replace(/\D/g, ''))} disabled={busy} />
          </label>
          <button type="submit" className={outline} disabled={busy || !(Number(addAt) >= 1 && Number(addAt) < n)}>
            Add
          </button>
        </form>
      )}
    </div>
  )
}

function MoveTo({ routine, position, count, disabled, onMove }: { routine: string; position: number; count: number; disabled: boolean; onMove: (to: number) => void }) {
  const [value, setValue] = useState('')
  const to = Number(value) - 1
  const ok = Number.isInteger(to) && to >= 0 && to < count && to !== position
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (ok) onMove(to)
      }}
    >
      <label className="flex flex-wrap items-center gap-2">
        <span>Move to number</span>
        <input className={`${control} h-11 w-20 tabular-nums sm:h-10`} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))} disabled={disabled} aria-label={`Move ${routine} to number`} />
      </label>
      <button type="submit" className={small} disabled={disabled || !ok}>
        Move
      </button>
    </form>
  )
}

function ShapePicker({ table, shape, onChange }: { table: Table; shape: Shape | null; onChange: (s: Shape) => void }) {
  const columns = table.header.map((h, i) => ({ i, label: h || `Column ${i + 1}` }))
  const pick = (k: Shape['kind']) => {
    if (k === 'list') onChange({ kind: 'list', routine: 0, dancers: Math.min(1, columns.length - 1) })
    else if (k === 'long') onChange({ kind: 'long', routine: Math.min(1, columns.length - 1), dancers: [0] })
    else onChange({ kind: 'grid', names: [0], routines: columns.slice(1).map((c) => c.i) })
  }
  const col = (value: number, set: (v: number) => void, label: string) => (
    <label className="flex flex-wrap items-center gap-2">
      <span>{label}</span>
      <select className={select} value={value} onChange={(e) => set(Number(e.target.value))}>
        {columns.map((c) => (
          <option key={c.i} value={c.i}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  )
  return (
    <div className="grid max-w-3xl grid-cols-1 gap-2 rounded-xl border border-rule p-4 text-sm">
      <fieldset className="grid grid-cols-1 gap-1">
        <legend className="mb-1 font-medium">Each row of the table is</legend>
        {(
          [
            ['list', 'a routine, with its dancers in one cell'],
            ['long', 'one dancer, with the routine beside them'],
            ['grid', 'one dancer, with a mark under each of their routines'],
          ] as const
        ).map(([k, label]) => (
          <label key={k} className="inline-flex min-h-11 cursor-pointer items-center gap-2 sm:min-h-9">
            <input type="radio" name="shape" checked={shape?.kind === k} onChange={() => pick(k)} />
            {label}
          </label>
        ))}
      </fieldset>
      {shape?.kind === 'list' && (
        <div className="flex flex-wrap gap-3">
          {col(shape.routine, (v) => onChange({ ...shape, routine: v }), 'Routine')}
          {col(shape.dancers, (v) => onChange({ ...shape, dancers: v }), 'Dancers')}
        </div>
      )}
      {shape?.kind === 'long' && (
        <div className="flex flex-wrap gap-3">
          {col(shape.routine, (v) => onChange({ ...shape, routine: v }), 'Routine')}
          {col(shape.dancers[0], (v) => onChange({ ...shape, dancers: [v, ...shape.dancers.slice(1)] }), 'Dancer')}
          <label className="flex flex-wrap items-center gap-2">
            <span>Surname column</span>
            <select
              className={select}
              value={shape.dancers[1] ?? -1}
              onChange={(e) => {
                const v = Number(e.target.value)
                onChange({ ...shape, dancers: v < 0 ? [shape.dancers[0]] : [shape.dancers[0], v] })
              }}
            >
              <option value={-1}>none</option>
              {columns.map((c) => (
                <option key={c.i} value={c.i}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {shape?.kind === 'grid' && (
        <div className="flex flex-wrap gap-3">
          {col(shape.names[0], (v) => onChange({ ...shape, names: [v], routines: columns.map((c) => c.i).filter((i) => i !== v) }), 'Dancer')}
          <span className="self-center text-dim">Routines: every other column, in order.</span>
        </div>
      )}
    </div>
  )
}

function orderCsv(plan: Plan): string {
  const lines = ['No.,Routine,Dancers']
  plan.order.forEach((r, p) => {
    if (plan.breaks.includes(p)) lines.push(',Intermission,')
    const routine = plan.routines[r]
    lines.push([String(p + 1), csvCell(routine.name), csvCell(routine.dancers.join(', '))].join(','))
  })
  return lines.join('\r\n') + '\r\n'
}

function dancersCsv(schedules: { name: string; at: number[]; tightest: number }[], need: number): string {
  const lines = ['Dancer,Numbers,Fewest numbers between,Quick change']
  for (const s of schedules)
    lines.push([csvCell(s.name), csvCell(s.at.map((p) => p + 1).join(' ')), s.tightest === Infinity ? '' : String(s.tightest), s.tightest < need ? 'yes' : ''].join(','))
  return lines.join('\r\n') + '\r\n'
}

function FileButton({ label, onFile }: { label: string; onFile: (file: File) => void | Promise<void> }): ReactNode {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={outline} onClick={() => input.current?.click()}>
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept=".csv,.tsv,.txt,text/csv,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void onFile(file)
        }}
      />
    </>
  )
}
