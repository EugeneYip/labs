import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { exampleText } from './example.ts'
import { classStats, csvCell, evenSizes, EXACT_UP_TO, firstPlacement, fitSizes, keepsRules, LIMITS, problems, scoreOf, suggest, units, type Score, type Setup, type YearGroup } from './model.ts'
import { guessRoles, keyOf, maybeFor, parseTable, READ_LIMITS, readYearGroup, type Read, type Role, type Table } from './roster.ts'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const select = `${control} h-11 sm:h-10`
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const small = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-rule px-3 text-sm hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9'
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'
const BOM = String.fromCharCode(0xfeff)

const ROLE_LABELS: [Role, string][] = [
  ['name', 'Child’s name'],
  ['first', 'First name'],
  ['last', 'Last name'],
  ['friend', 'A friend they named'],
  ['apart', 'Keep apart from'],
  ['with', 'Keep in the same class as'],
  ['balance', 'Balance across the classes'],
  ['start', 'New class (from this page’s download)'],
  ['ignore', 'Not used'],
]

interface Plan {
  table: Table
  roles: Role[]
  read: Read
  classes: string[]
  /** The size each class should be. */
  sizes: number[]
  /** Each child's class. */
  placement: number[]
  /** The class each child is fixed to, or -1. */
  fixed: number[]
  /** The classes before the last suggestion or change of class count, to go back to. */
  undo: Undo | null
}

interface Undo {
  label: string
  classes: string[]
  sizes: number[]
  placement: number[]
  fixed: number[]
}

interface Outcome {
  before: Score
  after: Score
  moved: number
  fitted: number
  exact: boolean
  stopped: boolean
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`
const spreadText = (s: number) => (s < 5e-10 ? '0' : s.toFixed(3))
const shortLabel = (label: string) => label.replace(/\s*\(.*\)$/, '') || label
const byName = new Intl.Collator('en', { sensitivity: 'base', numeric: true })
const surname = (name: string) => name.split(' ').at(-1) ?? name
/** Class-list order: by surname (the last word), then the whole name. */
const listOrder = (a: string, b: string) => byName.compare(surname(a), surname(b)) || byName.compare(a, b)

/** Each child's name as shown: a name that appears more than once has its spreadsheet row added. */
function shownNames(read: Read): string[] {
  const repeated = new Set(read.repeated.map(keyOf))
  return read.group.names.map((name, c) => (repeated.has(keyOf(name)) ? `${name} (row ${read.rows[c] + 2})` : name))
}

function download(content: string, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

function defaultNames(k: number, from: string[] = []): string[] {
  return Array.from({ length: k }, (_, c) => from[c] ?? `Class ${c + 1}`)
}

/** Children kept together all go to the class of the first of them (or the one any is fixed to). */
function keepGroups(group: YearGroup, placement: number[], fixed: number[]): number[] {
  const p = [...placement]
  for (const u of units(group)) {
    if (u.length < 2) continue
    const f = u.map((c) => fixed[c]).find((x) => x >= 0)
    const to = f ?? p[u[0]]
    for (const c of u) p[c] = to
  }
  return p
}

/** Experiment #031: next year's classes from a year group, balanced, with friends and keep-apart pairs. */
export default function NewClasses() {
  const [text, setText] = useState('')
  const [chosenRoles, setChosenRoles] = useState<{ table: Table; roles: Role[] } | null>(null)
  const [aliases, setAliases] = useState<Map<string, string>>(new Map())
  const [plan, setPlan] = useState<Plan | null>(null)
  const [editing, setEditing] = useState(false)
  const [downloaded, setDownloaded] = useState(true)
  const [running, setRunning] = useState(false)
  const progressTo = useRef<(done: number) => void>(() => {})
  const stop = useRef<AbortController | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [said, setSaid] = useState('')
  const [fileNote, setFileNote] = useState('')
  const focusAfter = useRef<{ child: number } | null>(null)
  const classesHeading = useRef<HTMLHeadingElement>(null)
  const suggestButton = useRef<HTMLButtonElement>(null)
  const textBox = useRef<HTMLTextAreaElement>(null)

  const say = (message: string) => setSaid((s) => (s === message ? `${message} ` : message))

  // Nothing is saved, so leaving with classes not downloaded asks first.
  useEffect(() => {
    if (downloaded || !plan) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [downloaded, plan])

  // When a search ends, focus goes back to its button (the Stop button it replaced is gone).
  const wasRunning = useRef(false)
  useEffect(() => {
    if (wasRunning.current && !running) suggestButton.current?.focus()
    wasRunning.current = running
  }, [running])

  useEffect(() => {
    if (!focusAfter.current) return
    const { child } = focusAfter.current
    focusAfter.current = null
    document.querySelector<HTMLElement>(`[data-child="${child}"]`)?.focus()
  })

  // --- Reading
  const tooLong = text.length > READ_LIMITS.characters
  const table = useMemo(() => (text.trim() && !tooLong ? parseTable(text) : null), [text, tooLong])
  const roles = table ? (chosenRoles && chosenRoles.table === table ? chosenRoles.roles : guessRoles(table)) : null
  const read: Read | null = useMemo(() => (table && roles && table.rows.length ? readYearGroup(table, roles, aliases) : null), [table, roles, aliases])
  const readProblem = useMemo(() => {
    if (!read || !roles) return ''
    const n = read.group.names.length
    const balanced = roles.filter((r) => r === 'balance').length
    if (!roles.includes('name') && !roles.includes('first') && !roles.includes('last')) return 'Choose the column with the children’s names.'
    if (n < 2) return n === 0 ? 'No children were read: choose the column with their names.' : 'One child was read; classes need at least two.'
    if (n > LIMITS.children) return `That’s ${plural(n, 'child', 'children')}; this page makes classes from up to ${LIMITS.children.toLocaleString('en')}.`
    if (balanced > LIMITS.columns) return `That’s ${balanced} columns to balance; this page balances up to ${LIMITS.columns}. Set the others to “Not used”.`
    return ''
  }, [read, roles])
  const unmatched = useMemo(() => {
    if (!read) return []
    const by = new Map<string, { name: string; by: string[] }>()
    for (const u of read.unmatched) {
      const k = keyOf(u.name)
      const entry = by.get(k) ?? { name: u.name, by: [] }
      if (!entry.by.includes(u.by)) entry.by.push(u.by)
      by.set(k, entry)
    }
    return [...by.values()].map((u) => ({ ...u, maybe: maybeFor(u.name, read.group.names) }))
  }, [read])

  const setRole = (column: number, role: Role) => {
    if (!table || !roles) return
    const next = [...roles]
    next[column] = role
    // One "New class" column at most.
    if (role === 'start') next.forEach((r, i) => i !== column && r === 'start' && (next[i] = 'ignore'))
    setChosenRoles({ table, roles: next })
  }

  const openFile = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer())
    if ((bytes[0] === 0x50 && bytes[1] === 0x4b) || bytes.slice(0, 4096).includes(0)) {
      setFileNote(`${file.name} isn’t a text file (a workbook, perhaps). Save it as CSV, or copy the cells and paste them here.`)
      say(`${file.name} isn’t a text file.`)
      return
    }
    let content: string
    try {
      content = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch {
      // Not UTF-8: a CSV saved by Excel on Windows is usually Windows-1252.
      content = new TextDecoder('windows-1252').decode(bytes)
    }
    setFileNote('')
    setText(content.replace(/^\uFEFF/, ''))
    setChosenRoles(null)
    setAliases(new Map())
    say(`${file.name} opened.`)
  }

  const makeClasses = () => {
    if (!read || !table || !roles || readProblem) return
    const group = read.group
    const n = group.names.length
    const noneFixed = group.names.map(() => -1)
    let classes: string[]
    let sizes: number[]
    let placement: number[] | null = null
    let fixed = noneFixed
    const started = read.start.filter(Boolean)
    const distinct = [...new Set(started.map((v) => v.trim()))].sort(byName.compare)
    const old = plan && editing ? plan : null
    if (distinct.length >= 2 && distinct.length <= LIMITS.classes && started.length > n / 2) {
      // Carry on from the page's own download: its classes, as they were.
      classes = distinct
      const count = new Array<number>(classes.length).fill(0)
      const p = read.start.map((v) => (v ? classes.indexOf(v.trim()) : -1))
      p.forEach((c) => c >= 0 && count[c]++)
      placement = p.map((c) => {
        if (c >= 0) return c
        const least = count.indexOf(Math.min(...count))
        count[least]++
        return least
      })
      placement = keepGroups(group, placement, fixed)
      sizes = new Array<number>(classes.length).fill(0)
      placement.forEach((c) => sizes[c]++)
    } else if (old) {
      // The year group edited: children keep their classes and fixes by name.
      classes = old.classes
      const k = classes.length
      const before = new Map<string, { cls: number; fixed: number }>()
      old.read.group.names.forEach((name, c) => before.set(keyOf(name), { cls: old.placement[c], fixed: old.fixed[c] }))
      sizes = old.read.group.names.length === n ? old.sizes : evenSizes(n, k)
      fixed = group.names.map((name) => before.get(keyOf(name))?.fixed ?? -1)
      const count = new Array<number>(k).fill(0)
      const p = group.names.map((name) => before.get(keyOf(name))?.cls ?? -1)
      p.forEach((c) => c >= 0 && count[c]++)
      const filled = p.map((c) => {
        if (c >= 0) return c
        const least = count.indexOf(Math.min(...count))
        count[least]++
        return least
      })
      const setup: Setup = { classes, min: sizes, max: sizes, fixed }
      const kept = keepGroups(group, filled, fixed)
      placement = keepsRules(group, setup, kept) ? kept : (() => {
        const f = fitSizes(group, setup, kept)
        return f ? Array.from(f) : kept
      })()
    } else {
      const k = Math.max(2, Math.min(LIMITS.classes, n, Math.round(n / 30)))
      classes = defaultNames(k)
      sizes = evenSizes(n, k)
    }
    if (!placement) {
      const first = firstPlacement(group, { classes, min: sizes, max: sizes, fixed })
      placement = first ? Array.from(first) : group.names.map((_, c) => c % classes.length)
    }
    setPlan({ table, roles, read, classes, sizes, placement, fixed, undo: null })
    setEditing(false)
    setOutcome(null)
    setDownloaded(true)
    say(`${plural(n, 'child', 'children')} in ${plural(classes.length, 'class', 'classes')}.`)
    requestAnimationFrame(() => classesHeading.current?.focus())
  }

  const startOver = () => {
    if (plan && !downloaded && !window.confirm('Start again? The classes aren’t saved anywhere, and they haven’t been downloaded.')) return
    setPlan(null)
    setEditing(false)
    setText('')
    setChosenRoles(null)
    setAliases(new Map())
    setOutcome(null)
    setDownloaded(true)
    say('Started again.')
    requestAnimationFrame(() => textBox.current?.focus())
  }

  // --- The classes
  const group = plan?.read.group ?? null
  const k = plan?.classes.length ?? 0
  const setup: Setup | null = plan ? { classes: plan.classes, min: plan.sizes, max: plan.sizes, fixed: plan.fixed } : null
  const stats = useMemo(() => (plan ? classStats(plan.read.group, plan.placement, plan.classes.length) : null), [plan])
  const score = useMemo(() => (plan ? scoreOf(plan.read.group, plan.placement, plan.classes.length) : null), [plan])
  const issues = useMemo(() => {
    if (!plan) return []
    const n = plan.read.group.names.length
    const total = plan.sizes.reduce((a, b) => a + b, 0)
    if (plan.sizes.some((z) => !Number.isInteger(z) || z < 1)) return ['Every class needs a size of at least 1.']
    if (total !== n) return [`The sizes add up to ${total.toLocaleString('en')}; there are ${plural(n, 'child', 'children')}.`]
    return problems(plan.read.group, { classes: plan.classes, min: plan.sizes, max: plan.sizes, fixed: plan.fixed })
  }, [plan])
  const named = useMemo(() => (group ? group.friends.reduce((a, f) => a + f.length, 0) : 0), [group])
  const naming = useMemo(() => (group ? group.friends.filter((f) => f.length).length : 0), [group])
  const names = useMemo(() => (plan ? shownNames(plan.read) : []), [plan])
  const unitOf = useMemo(() => {
    const m = new Map<number, number[]>()
    if (group) for (const u of units(group)) for (const c of u) m.set(c, u)
    return m
  }, [group])

  const change = (next: Plan) => {
    setPlan(next)
    setDownloaded(false)
  }

  const snapshot = (label: string): Undo | null => (plan ? { label, classes: plan.classes, sizes: plan.sizes, placement: plan.placement, fixed: plan.fixed } : null)

  const setCount = (count: number) => {
    if (!plan || !group) return
    const n = group.names.length
    const classes = defaultNames(count, plan.classes)
    const sizes = evenSizes(n, count)
    const fixed = plan.fixed.map((f) => (f < count ? f : -1))
    const s: Setup = { classes, min: sizes, max: sizes, fixed }
    const first = firstPlacement(group, s)
    const placement = first ? Array.from(first) : group.names.map((_, c) => c % count)
    change({ ...plan, classes, sizes, fixed, placement, undo: snapshot(`Undo the change to ${plural(count, 'class', 'classes')}`) })
    setOutcome(null)
    say(`${plural(count, 'class', 'classes')}; the children were shared out again in list order.`)
  }

  const setSize = (cls: number, value: string) => {
    if (!plan) return
    const z = Math.max(0, Math.min(LIMITS.children, Math.round(Number(value) || 0)))
    change({ ...plan, sizes: plan.sizes.map((x, c) => (c === cls ? z : x)) })
    setOutcome(null)
  }

  const setName = (cls: number, value: string) => {
    if (!plan) return
    change({ ...plan, classes: plan.classes.map((x, c) => (c === cls ? value.slice(0, 60) : x)) })
  }

  const moveChild = (child: number, to: number) => {
    if (!plan || !group || plan.placement[child] === to) return
    const unit = unitOf.get(child) ?? [child]
    const placement = [...plan.placement]
    const fixed = [...plan.fixed]
    for (const c of unit) {
      placement[c] = to
      fixed[c] = to
    }
    focusAfter.current = { child }
    change({ ...plan, placement, fixed, undo: null })
    setOutcome(null)
    const others = unit.length > 1 ? ` with ${unit.filter((c) => c !== child).map((c) => names[c]).join(', ')}` : ''
    say(`${names[child]}${others} moved to ${plan.classes[to] || `Class ${to + 1}`}, and fixed there.`)
  }

  const toggleFix = (child: number) => {
    if (!plan || !group) return
    const unit = unitOf.get(child) ?? [child]
    const fixing = plan.fixed[child] < 0
    const fixed = [...plan.fixed]
    for (const c of unit) fixed[c] = fixing ? plan.placement[c] : -1
    change({ ...plan, fixed, undo: null })
    say(`${names[child]} ${fixing ? `fixed to ${plan.classes[plan.placement[child]] || `Class ${plan.placement[child] + 1}`}: suggestions won’t move them` : 'no longer fixed'}.`)
  }

  const unfixAll = () => {
    if (!plan) return
    change({ ...plan, fixed: plan.fixed.map(() => -1), undo: null })
    say('No child is fixed now.')
  }

  const runSuggest = async () => {
    if (!plan || !group || !setup || !score || issues.length) return
    // Fixed children (and anyone kept with them) start in their classes.
    let start: number[] | null = keepGroups(group, plan.placement.map((c, i) => (plan.fixed[i] >= 0 ? plan.fixed[i] : c)), plan.fixed)
    let fitted = 0
    if (!keepsRules(group, setup, start)) {
      const f = fitSizes(group, setup, start) ?? firstPlacement(group, setup)
      start = f ? Array.from(f) : null
    }
    if (start) fitted = start.filter((c, i) => c !== plan.placement[i]).length
    if (!start) {
      say('The classes can’t be filled to these sizes with these children fixed and kept together.')
      return
    }
    const controller = new AbortController()
    stop.current = controller
    setRunning(true)
    setOutcome(null)
    const seedBox = new Uint32Array(1)
    crypto.getRandomValues(seedBox)
    try {
      const result = await suggest(group, setup, start, seedBox[0], { signal: controller.signal, onProgress: (d) => progressTo.current(d) })
      const moved = result.placement.filter((c, i) => c !== plan.placement[i]).length
      setPlan({ ...plan, placement: result.placement, undo: snapshot('Undo the suggestion') })
      setDownloaded(false)
      const o: Outcome = { before: score, after: result.score, moved, fitted, exact: result.exact, stopped: result.stopped }
      setOutcome(o)
      say(outcomeText(o))
    } finally {
      setRunning(false)
      stop.current = null
    }
  }

  const undo = () => {
    if (!plan?.undo) return
    const { label, classes, sizes, placement, fixed } = plan.undo
    change({ ...plan, classes, sizes, placement, fixed, undo: null })
    setOutcome(null)
    say(label === 'Undo the suggestion' ? 'Back to the classes before the suggestion.' : 'Back to the classes before the change.')
  }

  const showInput = !plan || editing
  const busy = running

  return (
    <div className="flex-1">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
        <section aria-labelledby="intro-heading" className="grid grid-cols-1 gap-4 print:hidden">
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            Mix a year group into next year’s classes: each the size you set, with what you choose (gender, attainment, needs, the class they’re in now) spread as evenly as the page can find,
            children kept apart from those they must be, and each child with a friend they named, wherever it finds a way. Paste or open the spreadsheet, have classes suggested, then move
            children yourself.
          </p>
          <ul className="grid max-w-prose grid-cols-1 list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
            <li>
              What you paste or open is read here, in this browser. Nothing is uploaded, and nothing is saved, not even in this browser: download the classes as a CSV file to keep them (it opens
              again here).
            </li>
            <li>For primary-school class mixing, and anywhere a group is split into balanced classes, forms, or teams with friendship choices.</li>
            <li>It mixes one year group at a time. Mixed-age classes, teachers, sets, and rooms aren’t handled here.</li>
          </ul>
          <details className="max-w-prose text-sm text-dim">
            <summary className={summaryStyle}>How it decides</summary>
            <div className="grid grid-cols-1 gap-2 pt-3 text-pretty">
              <p>
                Children fixed to a class stay there, children kept in the same class stay together, and each class is the size you set. Within those, classes are compared by these, each only
                when the ones before are level:
              </p>
              <ol className="grid grid-cols-1 list-decimal gap-1 pl-5">
                <li>no children kept apart in the same class (when that can’t be done, the fewest such pairs);</li>
                <li>the fewest children without at least one friend they named (among children who named a friend who was found);</li>
                <li>
                  the most even spread: for each balanced column, each class’s count of each value is compared with its fair share (the value’s total, shared by class size), the differences
                  squared and added up, then divided by the number of children; the columns are added together, and 0 means every class has exactly its share;
                </li>
                <li>the most friendships named that are in the same class.</li>
              </ol>
              <p>
                When there are no more than {EXACT_UP_TO.toLocaleString('en')} possible placements, every one is compared, and the page says so. Otherwise it searches, keeping the best it
                finds; it never returns classes worse by these rules than the ones it started from.
              </p>
              <p>A column of numbers (a score) is balanced in thirds: lower, middle, and higher. Names are matched ignoring case, accents, spacing, and punctuation.</p>
            </div>
          </details>
        </section>

        {showInput && (
          <section aria-labelledby="group-heading" className="grid grid-cols-1 gap-3 print:hidden">
            <h2 id="group-heading" className="text-lg font-semibold tracking-tight">
              {editing ? 'Edit the year group' : 'Year group'}
            </h2>
            <p className="max-w-prose text-sm text-pretty text-dim">
              A row for each child, with a header row: copy the cells from a spreadsheet and paste them here, or open a CSV file. Columns can hold a name (or first and last names), friends
              they named (in one cell or several columns), children to keep them apart from, children to keep them with, and anything to balance.
            </p>
            <label className="grid grid-cols-1 gap-1.5">
              <span className="sr-only">The year group, a row for each child</span>
              <textarea
                ref={textBox}
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setChosenRoles(null)
                }}
                rows={10}
                spellCheck={false}
                placeholder={'Name,Gender,Reading,Friend 1,Friend 2,Not with\nAva Smith,F,EXS,Mia Chen,Leo Park,Zoe Ray\nLeo Park,M,GDS,Ava Smith,,'}
                className={`${control} min-h-48 w-full py-2 font-mono text-sm`}
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={primary} disabled={!read || !!readProblem || busy} onClick={makeClasses}>
                {editing ? 'Use this year group' : 'Make classes'}
              </button>
              <FileButton label="Open a file" onFile={openFile} />
              {!editing && (
                <button
                  type="button"
                  className={quiet}
                  onClick={() => {
                    setText(exampleText())
                    setChosenRoles(null)
                    setAliases(new Map())
                    say('An example year group is in the box: 60 children.')
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
            {fileNote && <p className="text-sm text-red-800 dark:text-red-300">{fileNote}</p>}
            {table && !table.rows.length && <p className="text-sm text-dim">Only a header row so far: a row for each child goes below it.</p>}
            {tooLong && <p className="text-sm text-red-800 dark:text-red-300">That’s more text than this page reads ({READ_LIMITS.characters.toLocaleString('en')} characters).</p>}
            {table && roles && <RolePicker table={table} roles={roles} onChange={setRole} />}
            {read && (
              <div className="grid max-w-prose grid-cols-1 gap-1 text-sm text-pretty" role="status">
                {readProblem ? <p className="text-red-800 dark:text-red-300">{readProblem}</p> : <p>{readSummary(read)}</p>}
                {read.notes.map((n) => (
                  <p key={n} className="text-dim">
                    {n}
                  </p>
                ))}
              </div>
            )}
            {read && unmatched.length > 0 && (
              <div className="grid max-w-3xl grid-cols-1 gap-2 rounded-xl border border-rule p-4 text-sm">
                <p className="text-pretty">
                  {plural(unmatched.length, 'name')} written in the friends or keep columns {unmatched.length === 1 ? 'isn’t' : 'aren’t'} on the list. Where one means a child on the list,
                  count it as them:
                </p>
                <ul className="grid grid-cols-1 gap-2">
                  {unmatched.slice(0, 40).map((u) => (
                    <li key={u.name} className="flex flex-wrap items-center gap-2">
                      <span className="min-w-0 break-words">
                        “{u.name}” <span className="text-dim">(written by {u.by.slice(0, 3).join(', ')}{u.by.length > 3 ? ` and ${u.by.length - 3} more` : ''})</span>
                      </span>
                      {u.maybe.length ? (
                        u.maybe.map((m) => (
                          <button
                            key={m}
                            type="button"
                            className={small}
                            onClick={() => {
                              setAliases(new Map(aliases).set(keyOf(u.name), m))
                              say(`“${u.name}” is now counted as ${m}.`)
                            }}
                          >
                            Count as {m}
                          </button>
                        ))
                      ) : (
                        <span className="text-dim">no close name on the list</span>
                      )}
                    </li>
                  ))}
                </ul>
                {unmatched.length > 40 && <p className="text-dim">And {plural(unmatched.length - 40, 'more name')}.</p>}
              </div>
            )}
          </section>
        )}

        {plan && group && setup && stats && score && (
          <>
            <section aria-labelledby="classes-heading" className="grid grid-cols-1 gap-4 print:hidden">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="classes-heading" ref={classesHeading} tabIndex={-1} className="text-lg font-semibold tracking-tight">
                  Classes
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={quiet}
                    disabled={busy}
                    onClick={() => {
                      setEditing(true)
                      requestAnimationFrame(() => textBox.current?.focus())
                    }}
                  >
                    Edit the year group
                  </button>
                  <button type="button" className={quiet} disabled={busy} onClick={startOver}>
                    Start again
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-rule p-4">
                <label className="flex flex-wrap items-center gap-2 text-sm">
                  <span>Classes:</span>
                  <select className={select} value={k} disabled={busy} onChange={(e) => setCount(Number(e.target.value))}>
                    {Array.from({ length: Math.min(LIMITS.classes, group.names.length) - 1 }, (_, i) => i + 2).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset className="grid grid-cols-1 gap-2">
                  <legend className="pb-2 text-sm">Each class’s name and size</legend>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {plan.classes.map((name, c) => (
                      <div key={c} className="flex min-w-0 flex-wrap items-center gap-2">
                        <input aria-label={`Name of class ${c + 1}`} value={name} disabled={busy} onChange={(e) => setName(c, e.target.value)} className={`${select} w-36 min-w-0 flex-1`} />
                        <input
                          aria-label={`Size of ${name || `class ${c + 1}`}`}
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={LIMITS.children}
                          value={plan.sizes[c]}
                          disabled={busy}
                          onChange={(e) => setSize(c, e.target.value)}
                          className={`${select} w-20`}
                        />
                        <span className="text-sm text-dim tabular-nums">{stats.size[c] === plan.sizes[c] ? '' : `${stats.size[c]} now`}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className={small}
                      disabled={busy}
                      onClick={() => {
                        change({ ...plan, sizes: evenSizes(group.names.length, k) })
                        say('The sizes are as even as they can be.')
                      }}
                    >
                      Even sizes
                    </button>
                    {plan.fixed.some((f) => f >= 0) && (
                      <button type="button" className={small} disabled={busy} onClick={unfixAll}>
                        Unfix every child ({plan.fixed.filter((f) => f >= 0).length})
                      </button>
                    )}
                  </div>
                </fieldset>

                {new Set(plan.classes.map((c) => keyOf(c))).size < plan.classes.length && (
                  <p className="max-w-prose text-sm text-pretty text-dim">Two classes have the same name, so the CSV can’t tell them apart: give each its own name.</p>
                )}
                {issues.length > 0 && (
                  <div role="status">
                    <ul className="grid max-w-prose grid-cols-1 gap-1 text-sm text-pretty text-red-800 dark:text-red-300">
                      {issues.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <ScoreLine score={score} naming={naming} named={named} />

                <div className="flex flex-wrap items-center gap-2">
                  {busy ? (
                    <>
                      <button type="button" className={outline} onClick={() => stop.current?.abort()}>
                        Stop
                      </button>
                      <Progress setter={progressTo} />
                    </>
                  ) : (
                    <button ref={suggestButton} type="button" className={primary} disabled={issues.length > 0} onClick={runSuggest}>
                      Suggest classes
                    </button>
                  )}
                  {plan.undo && !busy && (
                    <button type="button" className={outline} onClick={undo}>
                      {plan.undo.label}
                    </button>
                  )}
                </div>
                {outcome && (
                  <p className="max-w-prose text-sm text-pretty" role="status">
                    {outcomeText(outcome)}
                  </p>
                )}
                {plan.read.unmatched.length > 0 && (
                  <p className="max-w-prose text-sm text-pretty text-dim">
                    {plural(new Set(plan.read.unmatched.map((u) => keyOf(u.name))).size, 'name')} written for friends or keeping apart {plan.read.unmatched.length === 1 ? 'wasn’t' : 'weren’t'} found on the list, so{' '}
                    {plan.read.unmatched.length === 1 ? 'it doesn’t' : 'they don’t'} count: Edit the year group to match them.
                  </p>
                )}
              </div>

              {group.columns.length > 0 && <SpreadTables group={group} stats={stats} classes={plan.classes} />}
            </section>

            <section aria-labelledby="lists-heading" className="grid grid-cols-1 gap-3">
              <h2 id="lists-heading" className="text-lg font-semibold tracking-tight print:hidden">
                Class lists
              </h2>
              <p className="max-w-prose text-sm text-pretty text-dim print:hidden">
                Move a child to another class, and they’re fixed there: a suggestion won’t move them back. Children kept in the same class move together.
              </p>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 print:block">
                {plan.classes.map((name, cls) => (
                  <ClassCard key={cls} cls={cls} name={name} names={names} plan={plan} stats={stats} busy={busy} last={cls === plan.classes.length - 1} onMove={moveChild} onFix={toggleFix} />
                ))}
              </ul>
            </section>

            <section aria-labelledby="keep-heading" className="grid grid-cols-1 gap-3 print:hidden">
              <h2 id="keep-heading" className="text-lg font-semibold tracking-tight">
                Print and download
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={outline} onClick={() => window.print()}>
                  Print the class lists
                </button>
                <button
                  type="button"
                  className={outline}
                  onClick={() => {
                    download(classesCsv(plan), 'new-classes.csv')
                    setDownloaded(true)
                    say('The classes were downloaded.')
                  }}
                >
                  Download the classes (CSV)
                </button>
              </div>
              <p className="max-w-prose text-sm text-pretty text-dim">
                The CSV is your spreadsheet with a “New class” column added, so it opens again here (Open a file) to carry on; which children are fixed isn’t kept in it. The print has a class
                a page.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function readSummary(read: Read): string {
  const g = read.group
  const named = g.friends.reduce((a, f) => a + f.length, 0)
  const parts = [plural(g.names.length, 'child', 'children'), `${plural(named, 'friendship')} named`]
  if (g.apart.length) parts.push(`${plural(g.apart.length, 'pair')} kept apart`)
  if (g.together.length) parts.push(`${plural(g.together.length, 'group')} kept in the same class`)
  const cols = g.columns.map((c) => `${c.name} (${c.labels.length})`)
  return `${parts.join(', ')}. ${cols.length ? `Balanced: ${cols.join(', ')}.` : 'Nothing to balance.'}`
}

function outcomeText(o: Outcome): string {
  const out: string[] = []
  if (o.stopped) out.push('Stopped: these are the best classes found before stopping.')
  if (o.fitted) out.push(`${plural(o.fitted, 'child was', 'children were')} moved first to fit the sizes.`)
  out.push(
    `Kept apart, but in the same class: ${o.before.apart} before, ${o.after.apart} now. Without a friend they named: ${o.before.friendless} before, ${o.after.friendless} now. Spread: ${spreadText(o.before.spread)} before, ${spreadText(o.after.spread)} now. Friendships together: ${o.before.together} before, ${o.after.together} now.`,
  )
  out.push(o.moved ? `${plural(o.moved, 'child', 'children')} in a different class.` : 'No child is in a different class.')
  if (!o.stopped)
    out.push(
      o.exact
        ? 'Every possible placement was compared: none is better by the rules in “How it decides”.'
        : 'There are too many possible placements to compare every one, so these are the best the search found; suggesting again searches on from here.',
    )
  return out.join(' ')
}

function ScoreLine({ score, naming, named }: { score: Score; naming: number; named: number }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
      <div className="grid grid-cols-1 gap-0.5">
        <dt className="text-dim">Kept apart, but in the same class</dt>
        <dd className={`tabular-nums ${score.apart ? 'font-semibold text-red-800 dark:text-red-300' : ''}`}>{plural(score.apart, 'pair')}</dd>
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        <dt className="text-dim">Without a friend they named</dt>
        <dd className={`tabular-nums ${score.friendless ? 'font-semibold' : ''}`}>
          {score.friendless.toLocaleString('en')} of {plural(naming, 'child', 'children')}
        </dd>
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        <dt className="text-dim">Spread (0 is even)</dt>
        <dd className="tabular-nums">{spreadText(score.spread)}</dd>
      </div>
      <div className="grid grid-cols-1 gap-0.5">
        <dt className="text-dim">Friendships together</dt>
        <dd className="tabular-nums">
          {score.together.toLocaleString('en')} of {named.toLocaleString('en')}
        </dd>
      </div>
    </dl>
  )
}

function SpreadTables({ group, stats, classes }: { group: YearGroup; stats: ReturnType<typeof classStats>; classes: string[] }) {
  const n = group.names.length
  return (
    <details className="grid grid-cols-1 gap-3" open>
      <summary className={summaryStyle}>Spread in each class</summary>
      <p className="max-w-prose pt-2 text-sm text-pretty text-dim">Bold: one or more away from the class’s fair share (the value’s total shared by class size).</p>
      <div className="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-2">
        {group.columns.map((col, j) => (
          <div key={j} className="max-w-full overflow-x-auto">
            <table className="text-sm tabular-nums">
              <caption className="pb-1 text-left font-medium">{col.name}</caption>
              <thead>
                <tr className="border-b border-rule text-dim">
                  <th scope="col" className="py-1 pr-3 text-left font-normal">
                    <span className="sr-only">Value</span>
                  </th>
                  {classes.map((c, i) => (
                    <th key={i} scope="col" className="px-2 py-1 text-right font-normal">
                      {c || `Class ${i + 1}`}
                    </th>
                  ))}
                  <th scope="col" className="py-1 pl-3 text-right font-normal">
                    All
                  </th>
                </tr>
              </thead>
              <tbody>
                {col.labels.map((label, v) => {
                  const total = stats.counts[j][v].reduce((a, b) => a + b, 0)
                  return (
                    <tr key={v} className="border-b border-rule/60">
                      <th scope="row" className="max-w-48 py-1 pr-3 text-left font-normal break-words">
                        {label}
                      </th>
                      {classes.map((_, c) => {
                        const have = stats.counts[j][v][c]
                        const off = Math.abs(have - (total * stats.size[c]) / n) >= 1 - 1e-9
                        return (
                          <td key={c} className={`px-2 py-1 text-right ${off ? 'font-semibold' : ''}`}>
                            {have}
                          </td>
                        )
                      })}
                      <td className="py-1 pl-3 text-right text-dim">{total}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </details>
  )
}

function ClassCard(props: {
  cls: number
  name: string
  names: string[]
  plan: Plan
  stats: ReturnType<typeof classStats>
  busy: boolean
  last: boolean
  onMove: (child: number, to: number) => void
  onFix: (child: number) => void
}) {
  const { cls, name, names, plan, stats, busy, last, onMove, onFix } = props
  const group = plan.read.group
  const kids = useMemo(
    () =>
      names
        .map((_, c) => c)
        .filter((c) => plan.placement[c] === cls)
        .sort((a, b) => listOrder(names[a], names[b])),
    [names, plan.placement, cls],
  )
  const naming = kids.filter((c) => group.friends[c].length).length
  const withFriend = kids.filter((c) => group.friends[c].length && stats.friendsIn[c] > 0).length
  const brokenWith = new Map<number, number[]>()
  for (const [a, b] of stats.broken) {
    brokenWith.set(a, [...(brokenWith.get(a) ?? []), b])
    brokenWith.set(b, [...(brokenWith.get(b) ?? []), a])
  }
  const shown = name || `Class ${cls + 1}`
  return (
    <li className={`grid min-w-0 grid-cols-1 content-start gap-2 rounded-xl border border-rule p-4 print:mb-0 print:rounded-none print:border-0 print:p-0 ${last ? '' : 'print:break-after-page'}`}>
      <h3 className="font-medium break-words print:text-xl">
        {shown} <span className="font-normal text-dim tabular-nums">({plural(kids.length, 'child', 'children')}{kids.length !== plan.sizes[cls] ? `; size ${plan.sizes[cls]}` : ''})</span>
      </h3>
      {group.columns.length > 0 && (
        <p className="text-sm text-pretty text-dim">
          {group.columns.map((col, j) => `${col.name}: ${col.labels.map((l, v) => `${shortLabel(l)} ${stats.counts[j][v][cls]}`).join(', ')}`).join(' · ')}
        </p>
      )}
      {naming > 0 && (
        <p className="text-sm text-dim print:hidden">
          {withFriend} of {plural(naming, 'child', 'children')} with a friend they named
        </p>
      )}
      <ul className="grid grid-cols-1 gap-1 text-sm print:block print:columns-2 print:gap-x-8">
        {kids.map((c) => {
          const here = group.friends[c].filter((f) => plan.placement[f] === cls)
          const alone = group.friends[c].length > 0 && here.length === 0
          const broken = brokenWith.get(c) ?? []
          const fixed = plan.fixed[c] >= 0
          return (
            <li key={c} className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1 border-b border-rule py-1.5 break-inside-avoid print:border-0 print:py-0.5">
              <div className="min-w-0 flex-1 break-words">
                <span className="font-medium print:font-normal">{names[c]}</span>
                {fixed && <span className="text-dim print:hidden"> · fixed</span>}
                {alone && <span className="font-semibold print:hidden"> · no friend they named</span>}
                {broken.length > 0 && <span className="font-semibold text-red-800 dark:text-red-300 print:hidden"> · kept apart from {broken.map((b) => names[b]).join(', ')}</span>}
                {here.length > 0 && <span className="block text-xs text-dim print:hidden">with {here.map((f) => names[f]).join(', ')}</span>}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1 print:hidden">
                <select
                  data-child={c}
                  aria-label={`Move ${names[c]} to`}
                  className={`${select} max-w-36`}
                  value={cls}
                  disabled={busy}
                  onChange={(e) => onMove(c, Number(e.target.value))}
                >
                  {plan.classes.map((n, i) => (
                    <option key={i} value={i}>
                      {n || `Class ${i + 1}`}
                    </option>
                  ))}
                </select>
                <button type="button" className={small} aria-pressed={fixed} disabled={busy} onClick={() => onFix(c)} aria-label={`Fix ${names[c]} to ${shown}`}>
                  {fixed ? 'Fixed' : 'Fix'}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </li>
  )
}

function RolePicker({ table, roles, onChange }: { table: Table; roles: Role[]; onChange: (column: number, role: Role) => void }) {
  const samples = (c: number) => {
    const seen: string[] = []
    for (const r of table.rows) {
      const v = (r[c] ?? '').trim()
      if (v && !seen.includes(v)) seen.push(v)
      if (seen.length === 3) break
    }
    return seen.join(', ')
  }
  return (
    <fieldset className="grid grid-cols-1 gap-2">
      <legend className="pb-2 text-sm">What each column holds</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {table.header.map((h, c) => (
          <label key={c} className="grid min-w-0 grid-cols-1 gap-1 text-sm">
            <span className="min-w-0 truncate font-medium" title={h}>
              {h || `Column ${c + 1}`}
              <span id={`column-${c}-samples`} className="font-normal text-dim">
                {samples(c) ? `: ${samples(c)}` : ''}
              </span>
            </span>
            <select className={select} aria-label={h || `Column ${c + 1}`} aria-describedby={`column-${c}-samples`} value={roles[c]} onChange={(e) => onChange(c, e.target.value as Role)}>
              {ROLE_LABELS.map(([role, label]) => (
                <option key={role} value={role}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </fieldset>
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
  return <progress className="h-2 w-40 accent-ink" max={1} value={done} aria-label="Searching for classes" />
}

function classesCsv(plan: Plan): string {
  const { table, read, roles } = plan
  const startCol = roles.indexOf('start')
  const header = startCol >= 0 ? table.header : [...table.header, 'New class']
  const classOfRow = new Map(read.rows.map((row, c) => [row, plan.classes[plan.placement[c]] || `Class ${plan.placement[c] + 1}`]))
  const lines = [header, ...table.rows.map((r, i) => {
    const cls = classOfRow.get(i) ?? ''
    const cells = [...r]
    if (startCol >= 0) cells[startCol] = cls
    else cells.push(cls)
    return cells
  })]
  return `${BOM}${lines.map((cells) => cells.map((v) => csvCell(v)).join(',')).join('\r\n')}\r\n`
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
