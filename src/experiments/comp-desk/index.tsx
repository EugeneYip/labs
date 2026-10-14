import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { exampleComp } from './example.ts'
import { cardProblem, cellText, inTenths, LIMITS, packComp, parseCell, PRESETS, readClimbers, resultsCsv, resultWords, ruleText, scoreCard, standings, unpackComp, usesZones, type Climber, type Comp, type Result, type Rule, type Standings } from './model.ts'

const KEY = 'labs:comp-desk'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 sm:h-10`
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const small = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-rule px-3 text-sm hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9'
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'

const FORMATS: { kind: Rule['kind']; name: string; about: string }[] = [
  { kind: 'topsZones', name: 'Tops and zones', about: 'Most tops, then most zones, then fewest attempts.' },
  { kind: 'pointsLessAttempts', name: 'Points less attempts', about: 'A top 25, a zone 10, less 0.1 an attempt (World Climbing’s 2025 values).' },
  { kind: 'pointsByAttempt', name: 'Points by attempt', about: 'A top 10, 7, 4, then 2 by its attempt; the zone 1.' },
  { kind: 'bestN', name: 'Problem values, best N', about: 'Each top scores its problem’s value; the best few count.' },
]

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`
const norm = (s: string) => s.normalize('NFKD').replace(/\p{M}+/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()
const placeText = (s: { place: number; tied: boolean }) => `${s.tied ? '=' : ''}${s.place}`

function readSaved(raw: string | null | undefined): Comp | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw)
    return v?.v === 1 && typeof v.comp === 'string' ? unpackComp(v.comp) : null
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

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

const fileName = (comp: Comp) => (comp.name.trim() ? comp.name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40) : '') || 'comp'

/** Experiment #032: scoring a one-day climbing competition from paper scorecards, at one desk. */
export default function CompDesk() {
  const [comp, setComp] = useState<Comp | null>(() => readSaved(stored()))
  const [damaged] = useState(() => {
    const raw = stored()
    return !!raw && readSaved(raw) === null
  })
  const [screen, setScreen] = useState(() => window.location.hash === '#leaderboard')
  const [saved, setSaved] = useState(true)
  const [updated, setUpdated] = useState(() => new Date())
  const [settingUp, setSettingUp] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [last, setLast] = useState<{ climber: number; before: (Result | null)[] | null } | null>(null)
  const [printing, setPrinting] = useState<'podiums' | 'results' | null>(null)
  const [said, setSaid] = useState('')
  const [note, setNote] = useState('')
  // A new comp, the example, or a backup opened: focus goes to the desk's heading once it's drawn.
  const [focusDesk, setFocusDesk] = useState(0)
  useEffect(() => {
    if (focusDesk) deskHeading.current?.focus()
  }, [focusDesk])
  const searchBox = useRef<HTMLInputElement>(null)
  const deskHeading = useRef<HTMLHeadingElement>(null)

  const say = (message: string) => setSaid((s) => (s === message ? `${message} ` : message))

  // Another tab's save (or the desk's, seen from the leaderboard window) is taken up here.
  const save = useOtherTabs(KEY, () => {
    setComp(readSaved(stored()))
    setUpdated(new Date())
  })
  useEffect(() => {
    // The leaderboard window only reads: the desk is the one writer.
    if (!comp || screen) return
    try {
      save(JSON.stringify({ v: 1, comp: packComp(comp) }))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [comp, save, screen])

  useEffect(() => {
    const onHash = () => setScreen(window.location.hash === '#leaderboard')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

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

  const all = useMemo(() => (comp ? comp.categories.map((_, k) => standings(comp, k)) : []), [comp])

  if (screen) return <Leaderboard comp={comp} all={all} updated={updated} />

  const change = (next: Comp) => {
    setComp(next)
    setUpdated(new Date())
  }

  /** A change made to the latest comp, so quick edits (typing in the climber list) never undo each other. */
  const changeWith = (f: (c: Comp) => Comp) => {
    setComp((c) => (c ? f(c) : c))
    setUpdated(new Date())
  }

  const startFrom = (next: Comp, message: string) => {
    change(next)
    setSettingUp(false)
    setSelected(null)
    setLast(null)
    say(message)
    setFocusDesk((n) => n + 1)
  }

  const newComp = () => {
    if (comp && !window.confirm('Start a new comp? This one will be removed from this browser. Download a backup first to keep it.')) return
    try {
      localStorage.removeItem(KEY)
    } catch {
      // Storage that can't be reached has nothing to remove.
    }
    setComp(null)
    setSettingUp(false)
    setSelected(null)
    setLast(null)
    say('Started a new comp.')
  }

  const saveCard = (climber: number, card: (Result | null)[] | null) => {
    if (!comp) return
    const before = comp.climbers[climber].card
    const climbers = comp.climbers.map((c, i) => (i === climber ? { ...c, card } : c))
    const next = { ...comp, climbers }
    change(next)
    setLast({ climber, before })
    setSelected(null)
    const c = comp.climbers[climber]
    const st = standings(next, c.category)
    const mine = st.ranked.find((s) => s.climber === climber)
    const why = st.unscored.find((u) => u.climber === climber)?.why
    say(
      card === null
        ? `Card removed for ${c.name}.`
        : mine
          ? `Saved for ${c.name}: ${mine.score.text}, ${placeText(mine)} in ${comp.categories[c.category]}.`
          : `Saved for ${c.name}, but not scored: ${why ?? ''}`,
    )
  }

  const undoLast = () => {
    if (!comp || !last) return
    const climbers = comp.climbers.map((c, i) => (i === last.climber ? { ...c, card: last.before } : c))
    change({ ...comp, climbers })
    say(`The last card for ${comp.climbers[last.climber].name} is back as it was.`)
    setLast(null)
  }

  const openBackup = async (file: File) => {
    if (file.size > 5_000_000) {
      setNote(`${file.name} is larger than any Comp Desk backup (5 MB).`)
      return
    }
    const text = await file.text()
    const next = unpackComp(text.replace(/^\uFEFF/, ''))
    if (!next) {
      setNote(`${file.name} isn’t a Comp Desk backup this page can read.`)
      return
    }
    if (comp && !window.confirm(`Replace this comp with the one in ${file.name}?`)) return
    setNote('')
    startFrom(next, `${file.name} opened: ${plural(next.climbers.length, 'climber')}.`)
  }

  const showSetup = !comp || settingUp

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
            Score a bouldering competition from paper scorecards at the desk: type each card as it comes in, and every category’s standings follow, by the format you choose, ready for prizes
            when the last card is in. A leaderboard can go on a second screen.
          </p>
          <ul className="grid max-w-prose grid-cols-1 list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
            <li>
              The comp is saved in this browser after every change, so a reload loses nothing; nothing is uploaded. A browser can clear what it saves (Safari after about a week without a
              visit): download a backup to keep the comp, or to carry on on another computer.
            </li>
            <li>For one-day comps at climbing walls, university clubs, and youth rounds, scored on paper and typed in at one computer.</li>
            <li>One round at a time. Leagues over several weeks, handicaps, teams, and scoring on climbers’ phones aren’t handled here.</li>
          </ul>
          <details className="max-w-prose text-sm text-dim">
            <summary className={summaryStyle}>How it scores</summary>
            <div className="grid grid-cols-1 gap-2 pt-3 text-pretty">
              <p>A card has, for each problem, the attempt the climber first reached the zone and the attempt they topped. A top counts as reaching the zone.</p>
              <ul className="grid grid-cols-1 list-disc gap-1 pl-5">
                <li>
                  <span className="text-ink">Tops and zones:</span> {ruleText(PRESETS.topsZones)} Shown as “3T 4z 7 9”: tops, zones, attempts to the tops, attempts to the zones.
                </li>
                <li>
                  <span className="text-ink">Points less attempts:</span> {ruleText(PRESETS.pointsLessAttempts)} These are the values World Climbing adopted in 2025; its own tie-breaks, which look
                  back to earlier rounds, aren’t used here.
                </li>
                <li>
                  <span className="text-ink">Points by attempt:</span> {ruleText(PRESETS.pointsByAttempt)} These are the Irish Bouldering League’s values.
                </li>
                <li>
                  <span className="text-ink">Problem values, best N:</span> {ruleText(PRESETS.bestN)} USA Climbing’s classic redpoint counts the best five.
                </li>
              </ul>
              <p>Every value can be changed. Results are counted in tenths or hundredths, so nothing is rounded.</p>
            </div>
          </details>
          {damaged && !comp && (
            <p className="max-w-prose rounded-xl border border-rule px-4 py-3 text-sm text-pretty" role="status">
              A comp saved in this browser couldn’t be read, so the page started empty. It stays saved until you start a comp here.
            </p>
          )}
        </section>

        {showSetup && (
          <Settings
            comp={comp}
            onCancel={comp ? () => setSettingUp(false) : undefined}
            onDone={(next) => startFrom(next, comp ? 'Settings saved.' : `Comp ready: ${plural(next.climbers.length, 'climber')}.`)}
            onExample={
              comp
                ? undefined
                : () => {
                    startFrom(exampleComp(), 'An example comp: 30 climbers, 24 cards entered.')
                  }
            }
            onOpenBackup={openBackup}
            note={note}
          />
        )}

        {comp && !settingUp && (
          <>
            <section aria-labelledby="desk-heading" className={`grid grid-cols-1 gap-4 ${printing ? 'print:hidden' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="desk-heading" ref={deskHeading} tabIndex={-1} className="text-lg font-semibold tracking-tight">
                  {comp.name.trim() || 'The desk'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={quiet} onClick={() => setSettingUp(true)}>
                    Comp settings
                  </button>
                  <button type="button" className={quiet} onClick={newComp}>
                    Start a new comp
                  </button>
                </div>
              </div>
              {!saved && <NotSaving>This browser isn’t saving the comp, so it will be gone when the page closes. Download a backup to keep it.</NotSaving>}
              <p className="max-w-prose text-sm text-pretty text-dim">
                {FORMATS.find((f) => f.kind === comp.rule.kind)?.name}: {ruleText(comp.rule)} {plural(comp.problems.length, 'problem')}
                {comp.maxAttempts ? `, at most ${plural(comp.maxAttempts, 'attempt')} on each` : ''}.
              </p>
              <CardDesk comp={comp} selected={selected} onSelect={setSelected} onSave={saveCard} searchBox={searchBox} />
              {last && (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-dim">Last card: {comp.climbers[last.climber].name}.</span>
                  <button type="button" className={small} onClick={undoLast}>
                    Undo it
                  </button>
                </div>
              )}
            </section>

            <section aria-labelledby="standings-heading" className={`grid grid-cols-1 gap-4 ${printing && printing !== 'results' ? 'print:hidden' : ''}`}>
              <h2 id="standings-heading" className="text-lg font-semibold tracking-tight print:hidden">
                Standings
              </h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 print:block">
                {comp.categories.map((cat, k) => (
                  <CategoryTable
                    key={k}
                    comp={comp}
                    name={cat}
                    st={all[k]}
                    lastCategory={k === comp.categories.length - 1}
                    onOpen={(i) => {
                      setSelected(i)
                      document.getElementById('desk-heading')?.scrollIntoView({ block: 'start' })
                    }}
                  />
                ))}
              </div>
            </section>

            {printing === 'podiums' && <Podiums comp={comp} all={all} />}

            <section aria-labelledby="climbers-heading" className="grid grid-cols-1 gap-3 print:hidden">
              <h2 id="climbers-heading" className="text-lg font-semibold tracking-tight">
                Climbers
              </h2>
              <Climbers comp={comp} onChange={changeWith} say={say} />
            </section>

            <section aria-labelledby="share-heading" className="grid grid-cols-1 gap-3 print:hidden">
              <h2 id="share-heading" className="text-lg font-semibold tracking-tight">
                Leaderboard, print, and files
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={outline} onClick={() => window.open(`${window.location.pathname}#leaderboard`, 'comp-desk-leaderboard')}>
                  Open the leaderboard in a new window
                </button>
                <button type="button" className={outline} onClick={() => setPrinting('podiums')}>
                  Print the podiums
                </button>
                <button type="button" className={outline} onClick={() => setPrinting('results')}>
                  Print the results
                </button>
                <button
                  type="button"
                  className={outline}
                  onClick={() => {
                    download(resultsCsv(comp), `${fileName(comp)}-results.csv`, 'text/csv;charset=utf-8')
                    say('The results were downloaded.')
                  }}
                >
                  Download the results (CSV)
                </button>
                <button
                  type="button"
                  className={outline}
                  onClick={() => {
                    download(packComp(comp), `${fileName(comp)}-backup.json`, 'application/json')
                    say('A backup was downloaded.')
                  }}
                >
                  Download a backup
                </button>
                <FileButton label="Open a backup" accept=".json,application/json" onFile={openBackup} />
              </div>
              {note && <p className="text-sm text-red-800 dark:text-red-300">{note}</p>}
              <p className="max-w-prose text-sm text-pretty text-dim">
                The leaderboard window shows every category and follows the desk as cards are saved, in this browser on this computer: put it on a projector or a second screen. The results print a
                category a page; the podiums print on one page.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

// --- Settings

interface Draft {
  name: string
  kind: Rule['kind']
  top: string
  zone: string
  less: string
  tops: string
  zonePoints: string
  topEarnsZone: boolean
  count: string
  flash: string
  problems: string
  values: string[]
  maxAttempts: string
  categories: { name: string; from: number }[]
  climbers: string
}

function draftOf(comp: Comp | null): Draft {
  const rule = comp?.rule ?? PRESETS.topsZones
  const p = (k: Rule['kind']) => PRESETS[k]
  const less = rule.kind === 'pointsLessAttempts' ? rule : (p('pointsLessAttempts') as Extract<Rule, { kind: 'pointsLessAttempts' }>)
  const by = rule.kind === 'pointsByAttempt' ? rule : (p('pointsByAttempt') as Extract<Rule, { kind: 'pointsByAttempt' }>)
  const best = rule.kind === 'bestN' ? rule : (p('bestN') as Extract<Rule, { kind: 'bestN' }>)
  const problems = comp?.problems.length ?? 20
  return {
    name: comp?.name ?? '',
    kind: rule.kind,
    top: String(less.top),
    zone: String(less.zone),
    less: String(less.less),
    tops: by.tops.join(', '),
    zonePoints: String(by.zone),
    topEarnsZone: by.topEarnsZone,
    count: String(best.count),
    flash: String(best.flash),
    problems: String(problems),
    values: Array.from({ length: LIMITS.problems }, (_, i) => String(comp?.problems[i]?.value ?? (i + 1) * 100)),
    maxAttempts: String(comp?.maxAttempts ?? 0),
    categories: comp?.categories ? comp.categories.map((name, from) => ({ name, from })) : [{ name: 'Open', from: -1 }],
    climbers: '',
  }
}

/** The draft as a comp, or what's wrong with it. */
function compOf(d: Draft, before: Comp | null): { comp: Comp } | { why: string } {
  const num = (s: string) => (s.trim() === '' ? NaN : Number(s))
  const problems = num(d.problems)
  if (!Number.isInteger(problems) || problems < 1 || problems > LIMITS.problems) return { why: `The number of problems is a whole number from 1 to ${LIMITS.problems}.` }
  let rule: Rule
  if (d.kind === 'topsZones') rule = { kind: 'topsZones' }
  else if (d.kind === 'pointsLessAttempts') {
    const [top, zone, less] = [num(d.top), num(d.zone), num(d.less)]
    if (![top, zone, less].every((x) => inTenths(x) && x <= 10_000)) return { why: 'The points for a top and a zone, and the amount less an attempt, are numbers of 0 or more, in tenths at most (such as 25, 10, and 0.1).' }
    rule = { kind: 'pointsLessAttempts', top, zone, less }
  } else if (d.kind === 'pointsByAttempt') {
    const tops = d.tops.split(/[,;\s]+/).filter(Boolean).map(Number)
    const zone = num(d.zonePoints)
    if (!tops.length || tops.length > 20 || !tops.every((x) => inTenths(x) && x <= 10_000)) return { why: 'The points for a top by attempt are numbers separated by commas, such as 10, 7, 4, 2 (in tenths at most).' }
    if (!inTenths(zone) || zone > 10_000) return { why: 'The zone’s points are a number of 0 or more, in tenths at most.' }
    rule = { kind: 'pointsByAttempt', tops, zone, topEarnsZone: d.topEarnsZone }
  } else {
    const count = num(d.count)
    const flash = num(d.flash)
    if (!Number.isInteger(count) || count < 0 || count > LIMITS.problems) return { why: 'How many tops count is a whole number (0 counts every top).' }
    if (!Number.isInteger(flash) || flash < 0 || flash > 100) return { why: 'The flash bonus is a whole percentage from 0 to 100.' }
    rule = { kind: 'bestN', count, flash }
  }
  const values = d.values.slice(0, problems).map(num)
  if (rule.kind === 'bestN' && !values.every((v) => Number.isInteger(v) && v >= 0 && v <= 1_000_000)) return { why: 'Each problem’s value is a whole number of 0 or more.' }
  const maxAttempts = num(d.maxAttempts)
  if (!Number.isInteger(maxAttempts) || maxAttempts < 0 || maxAttempts > LIMITS.attempts) return { why: 'The attempt limit is a whole number (0 for no limit).' }
  const categories = d.categories.map((c) => c.name.replace(/\s+/g, ' ').trim())
  if (!categories.length || categories.some((c) => !c)) return { why: 'Every category needs a name.' }
  if (categories.length > LIMITS.categories) return { why: `Up to ${LIMITS.categories} categories.` }
  if (new Set(categories.map((c) => c.toLowerCase())).size < categories.length) return { why: 'Two categories have the same name.' }
  let climbers: Climber[] = before ? before.climbers : []
  if (before) {
    // Fewer problems than results already entered would lose them.
    let highest = 0
    for (const c of before.climbers) c.card?.forEach((r, p) => r && (highest = Math.max(highest, p + 1)))
    if (problems < highest) return { why: `Problem ${highest} has results on a card, so the comp needs at least ${highest} problems. Clear those results first to have fewer.` }
    // Climbers follow their category to its new place in the list.
    const to = new Map(d.categories.map((c, k) => [c.from, k]))
    if (before.climbers.some((c) => !to.has(c.category))) return { why: 'A category with climbers in it can’t be removed.' }
    climbers = climbers.map((c) => ({ ...c, category: to.get(c.category)!, card: c.card ? Array.from({ length: problems }, (_, p) => c.card![p] ?? null) : null }))
  }
  if (!before && d.climbers.trim()) {
    const read = readClimbers(d.climbers, categories)
    for (const c of read.climbers) {
      let k = categories.findIndex((x) => x.toLowerCase() === c.category.toLowerCase())
      if (k < 0 && c.category) {
        if (categories.length >= LIMITS.categories) return { why: `Up to ${LIMITS.categories} categories.` }
        categories.push(c.category)
        k = categories.length - 1
      }
      climbers.push({ name: c.name.slice(0, 200), bib: c.bib.slice(0, 40), category: Math.max(0, k), card: null })
    }
    if (climbers.length > LIMITS.climbers) return { why: `Up to ${LIMITS.climbers.toLocaleString('en')} climbers.` }
  }
  const problemList = Array.from({ length: problems }, (_, i) => ({ name: before?.problems[i]?.name ?? '', value: Number.isInteger(values[i]) && values[i] >= 0 ? values[i] : (before?.problems[i]?.value ?? (i + 1) * 100) }))
  return { comp: { name: d.name.trim().slice(0, 120), rule, problems: problemList, categories, climbers, maxAttempts } }
}

function Settings(props: { comp: Comp | null; onCancel?: () => void; onDone: (comp: Comp) => void; onExample?: () => void; onOpenBackup: (file: File) => void; note: string }) {
  const { comp, onCancel, onDone, onExample, onOpenBackup, note } = props
  const [d, setD] = useState<Draft>(() => draftOf(comp))
  const [why, setWhy] = useState('')
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }))
  /** For lists: the change is made to the latest draft, so quick edits don't undo each other. */
  const edit = (f: (x: Draft) => Partial<Draft>) => setD((x) => ({ ...x, ...f(x) }))
  const inUse = (k: number) => (comp && d.categories[k].from >= 0 ? comp.climbers.filter((c) => c.category === d.categories[k].from).length : 0)
  const problemCount = Math.max(0, Math.min(LIMITS.problems, Math.floor(Number(d.problems) || 0)))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const r = compOf(d, comp)
    if ('why' in r) {
      setWhy(r.why)
      return
    }
    setWhy('')
    onDone(r.comp)
  }

  return (
    <section aria-labelledby="settings-heading" className="grid grid-cols-1 gap-4 print:hidden">
      <h2 id="settings-heading" className="text-lg font-semibold tracking-tight">
        {comp ? 'Comp settings' : 'Set up a comp'}
      </h2>
      <form onSubmit={submit} className="grid grid-cols-1 gap-5" noValidate>
        <label className="grid max-w-md grid-cols-1 gap-1.5 text-sm">
          <span className="font-medium">Name of the comp (optional)</span>
          <input className={field} value={d.name} onChange={(e) => set({ name: e.target.value })} maxLength={120} />
        </label>

        <fieldset className="grid grid-cols-1 gap-2">
          <legend className="pb-2 text-sm font-medium">Format</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FORMATS.map((f) => (
              <label key={f.kind} className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${d.kind === f.kind ? 'border-ink' : 'border-rule'}`}>
                <input type="radio" name="format" className="mt-1" checked={d.kind === f.kind} onChange={() => set({ kind: f.kind })} />
                <span className="grid min-w-0 grid-cols-1 gap-0.5">
                  <span className="font-medium">{f.name}</span>
                  <span className="text-pretty text-dim">{f.about}</span>
                </span>
              </label>
            ))}
          </div>
          {d.kind === 'pointsLessAttempts' && (
            <div className="flex flex-wrap items-end gap-3 pt-1">
              <NumberField label="Points for a top" value={d.top} onChange={(v) => set({ top: v })} step="0.1" />
              <NumberField label="For a zone without a top" value={d.zone} onChange={(v) => set({ zone: v })} step="0.1" />
              <NumberField label="Less for each attempt before" value={d.less} onChange={(v) => set({ less: v })} step="0.1" />
            </div>
          )}
          {d.kind === 'pointsByAttempt' && (
            <div className="flex flex-wrap items-end gap-3 pt-1">
              <label className="grid grid-cols-1 gap-1 text-sm">
                <span>A top’s points on attempt 1, 2, 3…</span>
                <input className={`${field} w-48`} value={d.tops} onChange={(e) => set({ tops: e.target.value })} />
              </label>
              <NumberField label="The zone’s points" value={d.zonePoints} onChange={(v) => set({ zonePoints: v })} step="0.1" />
              <label className="inline-flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={d.topEarnsZone} onChange={(e) => set({ topEarnsZone: e.target.checked })} />A top also earns the zone’s points
              </label>
            </div>
          )}
          {d.kind === 'bestN' && (
            <div className="flex flex-wrap items-end gap-3 pt-1">
              <NumberField label="Tops that count (0 for all)" value={d.count} onChange={(v) => set({ count: v })} />
              <NumberField label="Flash bonus (%)" value={d.flash} onChange={(v) => set({ flash: v })} />
            </div>
          )}
        </fieldset>

        <div className="flex flex-wrap items-end gap-3">
          <NumberField label="Problems" value={d.problems} onChange={(v) => set({ problems: v })} />
          <NumberField label="Most attempts on a problem (0 for no limit)" value={d.maxAttempts} onChange={(v) => set({ maxAttempts: v })} />
        </div>

        {d.kind === 'bestN' && problemCount > 0 && (
          <fieldset className="grid grid-cols-1 gap-2">
            <legend className="pb-2 text-sm font-medium">Each problem’s value</legend>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={small} onClick={() => edit((x) => ({ values: x.values.map((_, i) => String((i + 1) * 100)) }))}>
                100, 200, 300…
              </button>
              <button type="button" className={small} onClick={() => edit((x) => ({ values: x.values.map((_, i) => String((i + 1) * 10)) }))}>
                10, 20, 30…
              </button>
              <button type="button" className={small} onClick={() => edit((x) => ({ values: x.values.map(() => '100') }))}>
                100 each
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
              {Array.from({ length: problemCount }, (_, i) => (
                <label key={i} className="grid min-w-0 grid-cols-1 gap-1 text-sm">
                  <span className="text-dim">{i + 1}</span>
                  <input aria-label={`Value of problem ${i + 1}`} className={`${field} w-full`} inputMode="numeric" value={d.values[i]} onChange={(e) => {
                      const value = e.target.value
                      edit((x) => ({ values: x.values.map((v, j) => (j === i ? value : v)) }))
                    }} />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="grid max-w-md grid-cols-1 gap-2">
          <legend className="pb-2 text-sm font-medium">Categories</legend>
          {d.categories.map((c, k) => (
            <div key={k} className="flex flex-wrap items-center gap-2">
              <input aria-label={`Category ${k + 1}`} className={`${field} min-w-0 flex-1`} value={c.name} maxLength={80} onChange={(e) => {
                  const name = e.target.value
                  edit((x) => ({ categories: x.categories.map((c, j) => (j === k ? { ...c, name } : c)) }))
                }} />
              <button
                type="button"
                className={small}
                disabled={d.categories.length < 2 || inUse(k) > 0}
                title={inUse(k) ? `${plural(inUse(k), 'climber')} in it` : undefined}
                onClick={() => edit((x) => ({ categories: x.categories.filter((_, j) => j !== k) }))}
              >
                Remove{inUse(k) ? ` (${inUse(k)} in it)` : ''}
              </button>
            </div>
          ))}
          <div>
            <button type="button" className={small} disabled={d.categories.length >= LIMITS.categories} onClick={() => edit((x) => ({ categories: [...x.categories, { name: '', from: -1 }] }))}>
              Add a category
            </button>
          </div>
          {comp && <p className="text-sm text-dim">A category with climbers in it can be renamed but not removed.</p>}
        </fieldset>

        {!comp && (
          <label className="grid max-w-2xl grid-cols-1 gap-1.5 text-sm">
            <span className="font-medium">Climbers (optional; more can be added later)</span>
            <span className="text-dim">A climber per line: name, category, bib number (separated by commas or tabs), or paste from a spreadsheet with a header row.</span>
            <textarea className={`${control} min-h-32 py-2 font-mono text-sm`} value={d.climbers} onChange={(e) => set({ climbers: e.target.value })} spellCheck={false} placeholder={'Ava Okafor, Open, 101\nLeo Silva, Youth, 102'} />
          </label>
        )}

        {why && (
          <p className="max-w-prose text-sm text-red-800 dark:text-red-300" role="alert">
            {why}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className={primary}>
            {comp ? 'Save the settings' : 'Start scoring'}
          </button>
          {onCancel && (
            <button type="button" className={quiet} onClick={onCancel}>
              Cancel
            </button>
          )}
          {onExample && (
            <button type="button" className={quiet} onClick={onExample}>
              Try an example
            </button>
          )}
          {!comp && <FileButton label="Open a backup" accept=".json,application/json" onFile={onOpenBackup} />}
        </div>
        {note && <p className="text-sm text-red-800 dark:text-red-300">{note}</p>}
      </form>
    </section>
  )
}

function NumberField({ label, value, onChange, step = '1' }: { label: string; value: string; onChange: (v: string) => void; step?: string }) {
  return (
    <label className="grid grid-cols-1 gap-1 text-sm">
      <span>{label}</span>
      <input className={`${field} w-28`} type="number" inputMode="decimal" min={0} step={step} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

// --- Entering cards

function CardDesk(props: { comp: Comp; selected: number | null; onSelect: (i: number | null) => void; onSave: (climber: number, card: (Result | null)[] | null) => void; searchBox: { current: HTMLInputElement | null } }) {
  const { comp, selected, onSelect, onSave, searchBox } = props
  const [query, setQuery] = useState('')
  const matchesFor = (text: string) => {
    const q = norm(text)
    if (!q) return []
    const exact = comp.climbers.map((c, i) => ({ c, i })).filter(({ c }) => c.bib && norm(c.bib) === q)
    const named = comp.climbers.map((c, i) => ({ c, i })).filter(({ c }) => norm(c.name).includes(q) || (c.bib && norm(c.bib).startsWith(q)))
    const seen = new Set<number>()
    return [...exact, ...named].filter(({ i }) => (seen.has(i) ? false : (seen.add(i), true))).slice(0, 8)
  }
  const matches = matchesFor(query)

  const pick = (i: number) => {
    onSelect(i)
    setQuery('')
  }

  // When a card closes (saved or cancelled), focus goes back to the search, at once: nothing waits to move it later,
  // when someone may already be typing the next card.
  const wasOpen = useRef(selected !== null)
  useEffect(() => {
    if (wasOpen.current && selected === null) searchBox.current?.focus()
    wasOpen.current = selected !== null
  }, [selected, searchBox])

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-rule p-4">
      <h3 className="font-medium">Enter a card</h3>
      {comp.climbers.length === 0 ? (
        <p className="text-sm text-dim">Add climbers below first.</p>
      ) : (
        <div className="grid max-w-xl grid-cols-1 gap-2">
          <label className="grid grid-cols-1 gap-1.5 text-sm">
            <span>Climber: bib number or name</span>
            <input
              ref={searchBox}
              className={field}
              value={query}
              autoComplete="off"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  // What's in the box now (a bib typed and entered quickly, by hand or a scanner, may not be drawn yet).
                  // Only one climber: a bib that matches exactly, or the only match. Two with one bib are chosen from the list.
                  const now = e.currentTarget.value
                  const found = matchesFor(now)
                  const exact = found.filter(({ c }) => c.bib && norm(c.bib) === norm(now))
                  if (exact.length === 1) pick(exact[0].i)
                  else if (!exact.length && found.length === 1) pick(found[0].i)
                }
                if (e.key === 'ArrowDown' && matches.length) {
                  e.preventDefault()
                  document.querySelector<HTMLButtonElement>('[data-match="0"]')?.focus()
                }
              }}
            />
          </label>
          {query.trim() !== '' && (
            <ul className="grid grid-cols-1 gap-1" aria-label="Matching climbers">
              {matches.length === 0 && <li className="text-sm text-dim">No climber matches.</li>}
              {matches.map(({ c, i }, n) => (
                <li key={i}>
                  <button
                    type="button"
                    data-match={n}
                    className={`${small} w-full justify-start text-left`}
                    onClick={() => pick(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') document.querySelector<HTMLButtonElement>(`[data-match="${n + 1}"]`)?.focus()
                      if (e.key === 'ArrowUp') (n === 0 ? searchBox.current : document.querySelector<HTMLButtonElement>(`[data-match="${n - 1}"]`))?.focus()
                    }}
                  >
                    {c.bib ? `#${c.bib} ` : ''}
                    {c.name} · {comp.categories[c.category]}
                    {c.card ? ' · card saved' : ''}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-pretty text-dim">Enter picks the climber when only one matches (or one bib matches exactly); the arrow keys move through the list.</p>
        </div>
      )}
      {selected !== null && comp.climbers[selected] && <CardForm key={`${selected}-${comp.problems.length}`} comp={comp} climber={selected} onSave={onSave} onCancel={() => onSelect(null)} />}
    </div>
  )
}

function CardForm({ comp, climber, onSave, onCancel }: { comp: Comp; climber: number; onSave: (climber: number, card: (Result | null)[] | null) => void; onCancel: () => void }) {
  const c = comp.climbers[climber]
  const [cells, setCells] = useState<string[]>(() => comp.problems.map((_, p) => cellText(c.card?.[p] ?? null)))
  // The cells as last typed, which saving reads: a quick Enter can come before the page has drawn the last change.
  const latest = useRef(cells)
  const setCell = (p: number, value: string) => {
    latest.current = latest.current.map((x, i) => (i === p ? value : x))
    setCells(latest.current)
  }
  const [tried, setTried] = useState(false)
  const first = useRef<HTMLInputElement>(null)
  useEffect(() => {
    first.current?.focus()
  }, [])
  const read = (texts: string[]) => {
    const parsed = texts.map(parseCell)
    const card = parsed.map((r) => (r.ok ? r.result : null))
    const errors = parsed.map((r) => {
    if (!r.ok) return r.why
    const res = r.result
    if (!res) return ''
    if (res.top === 0 && comp.rule.kind !== 'bestN') return 'This format needs the attempt of the top.'
    if (res.top === 0 && comp.rule.kind === 'bestN' && comp.rule.flash > 0) return 'With a flash bonus, the attempt of the top is needed.'
    const most = Math.max(res.zone ?? 0, res.top ?? 0)
    if (comp.maxAttempts && most > comp.maxAttempts) return `More than the ${comp.maxAttempts} attempts allowed.`
    return ''
    })
    return { parsed, card, errors, bad: errors.findIndex(Boolean) }
  }
  const { parsed, card, errors, bad } = read(cells)
  const problem = bad < 0 ? cardProblem(card, comp.rule, comp.maxAttempts) : null
  const score = bad < 0 && !problem ? scoreCard(card, comp.rule, comp.problems) : null
  const zones = usesZones(comp.rule)

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    setTried(true)
    const now = read(latest.current)
    if (now.bad >= 0) {
      document.querySelector<HTMLInputElement>(`[data-cell="${now.bad}"]`)?.focus()
      return
    }
    onSave(climber, now.card)
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3" onKeyDown={(e) => e.key === 'Escape' && onCancel()} aria-labelledby="card-heading">
      <h4 id="card-heading" className="text-sm font-medium">
        Card for {c.name}
        {c.bib ? ` (#${c.bib})` : ''}, {comp.categories[c.category]}
        {c.card ? <span className="font-normal text-dim"> · editing the saved card</span> : ''}
      </h4>
      <p className="max-w-prose text-xs text-pretty text-dim">
        {zones
          ? 'For each problem: the attempt of the top (3); the zone’s attempt and the top’s (1/3); z and the zone’s attempt for a zone without a top (z2); blank for nothing. Tab moves on; Enter saves.'
          : 'For each problem: the attempt of the top (1 is a flash), or t for a top; blank for nothing. Tab moves on; Enter saves.'}
      </p>
      <div className="grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-5 lg:grid-cols-8">
        {comp.problems.map((pr, p) => {
          const err = errors[p]
          const id = `cell-${p}`
          return (
            <div key={p} className="grid min-w-0 grid-cols-1 content-start gap-1">
              <label htmlFor={id} className="text-xs text-dim">
                {pr.name || p + 1}
                {comp.rule.kind === 'bestN' ? ` · ${pr.value.toLocaleString('en')}` : ''}
              </label>
              <input
                id={id}
                ref={p === 0 ? first : undefined}
                data-cell={p}
                aria-label={`Problem ${pr.name || p + 1} for ${c.name}`}
                aria-invalid={!!err && (tried || cells[p] !== '')}
                aria-describedby={`${id}-read`}
                className={`${field} w-full font-mono ${err && (tried || cells[p] !== '') ? 'border-red-600 dark:border-red-400' : ''}`}
                value={cells[p]}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setCell(p, e.target.value)}
              />
              <span id={`${id}-read`} className={`min-h-4 text-xs break-words ${err ? 'text-red-800 dark:text-red-300' : 'text-dim'}`}>
                {err ? err : cells[p].trim() ? resultWords(parsed[p].ok ? (parsed[p] as { result: Result | null }).result : null, comp.rule) : ''}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-sm">
        {score ? (
          <>
            This card: <span className="font-medium">{score.text}</span>
          </>
        ) : bad >= 0 ? (
          `Problem ${comp.problems[bad].name || bad + 1}: ${errors[bad]}`
        ) : (
          problem
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className={primary}>
          Save the card
        </button>
        <button type="button" className={quiet} onClick={onCancel}>
          Cancel
        </button>
        {c.card && (
          <button type="button" className={quiet} onClick={() => window.confirm(`Remove ${c.name}’s card? They’ll be waiting for a card again.`) && onSave(climber, null)}>
            Remove the card
          </button>
        )}
      </div>
    </form>
  )
}

// --- Standings, podiums, leaderboard

function CategoryTable({ comp, name, st, lastCategory, onOpen }: { comp: Comp; name: string; st: Standings; lastCategory: boolean; onOpen: (climber: number) => void }) {
  return (
    <div className={`grid min-w-0 grid-cols-1 content-start gap-2 ${lastCategory ? '' : 'print:break-after-page'}`}>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <caption className="pb-2 text-left">
            <span className="font-medium print:text-xl">{name}</span>{' '}
            <span className="text-dim">
              ({plural(st.ranked.length, 'card')}
              {st.waiting.length ? `, ${st.waiting.length} to come` : ''})
            </span>
          </caption>
          <thead>
            <tr className="border-b border-rule text-dim">
              <th scope="col" className="py-1 pr-3 text-left font-normal">
                Place
              </th>
              <th scope="col" className="py-1 pr-3 text-left font-normal">
                Climber
              </th>
              <th scope="col" className="py-1 text-right font-normal">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {st.ranked.map((s) => {
              const c = comp.climbers[s.climber]
              return (
                <tr key={s.climber} className="border-b border-rule/60">
                  <td className="py-1.5 pr-3 align-top">{placeText(s)}</td>
                  <td className="py-1.5 pr-3 align-top break-words">
                    <button type="button" className="cursor-pointer text-left underline-offset-4 hover:underline print:no-underline" onClick={() => onOpen(s.climber)} aria-label={`Edit ${c.name}’s card`}>
                      {c.name}
                    </button>
                    {c.bib && <span className="text-dim"> #{c.bib}</span>}
                  </td>
                  <td className="py-1.5 text-right align-top whitespace-nowrap">{s.score.text}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {st.ranked.length === 0 && <p className="text-sm text-dim">No cards yet.</p>}
      {st.unscored.length > 0 && (
        <ul className="grid grid-cols-1 gap-1 text-sm text-red-800 dark:text-red-300">
          {st.unscored.map((u) => (
            <li key={u.climber}>
              Not scored: {comp.climbers[u.climber].name}. {u.why}
            </li>
          ))}
        </ul>
      )}
      {st.waiting.length > 0 && (
        <details className="text-sm text-dim print:hidden">
          <summary className={summaryStyle}>Cards to come ({st.waiting.length})</summary>
          <p className="pt-2 text-pretty">{st.waiting.map((i) => `${comp.climbers[i].name}${comp.climbers[i].bib ? ` #${comp.climbers[i].bib}` : ''}`).join(', ')}</p>
        </details>
      )}
    </div>
  )
}

function Podiums({ comp, all }: { comp: Comp; all: Standings[] }) {
  return (
    <section aria-label="Podiums" className="hidden grid-cols-1 gap-6 print:grid">
      <h2 className="text-xl font-semibold">{comp.name.trim() || 'Podiums'}</h2>
      {comp.categories.map((cat, k) => (
        <div key={k} className="grid grid-cols-1 gap-1 break-inside-avoid">
          <h3 className="font-medium">{cat}</h3>
          {all[k].ranked.filter((s) => s.place <= 3).length === 0 ? (
            <p className="text-sm">No cards.</p>
          ) : (
            <ol className="grid grid-cols-1 gap-0.5 text-sm">
              {all[k].ranked
                .filter((s) => s.place <= 3)
                .map((s) => (
                  <li key={s.climber}>
                    {placeText(s)}. {comp.climbers[s.climber].name} · {s.score.text}
                  </li>
                ))}
            </ol>
          )}
        </div>
      ))}
    </section>
  )
}

function Leaderboard({ comp, all, updated }: { comp: Comp | null; all: Standings[]; updated: Date }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((x) => x + 1), 30_000)
    return () => clearInterval(t)
  }, [])
  if (!comp)
    return (
      <div className="flex-1 px-4 py-10 sm:px-6">
        <p className="text-lg">No comp is set up in this browser yet. Set one up at the desk, and this window will follow it.</p>
      </div>
    )
  return (
    <div className="flex-1 px-4 py-6 sm:px-8">
      <div className="mx-auto grid w-full max-w-[110rem] grid-cols-1 gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">{comp.name.trim() || 'Leaderboard'}</h2>
          <p className="text-sm text-dim" aria-live="polite">
            Updated {updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className={`grid grid-cols-1 gap-8 ${comp.categories.length > 1 ? 'md:grid-cols-2' : ''} ${comp.categories.length > 2 ? 'xl:grid-cols-3' : ''}`}>
          {comp.categories.map((cat, k) => (
            <section key={k} aria-label={cat} className="grid min-w-0 grid-cols-1 content-start gap-2">
              <h3 className="text-xl font-semibold sm:text-2xl">{cat}</h3>
              {all[k].ranked.length === 0 ? (
                <p className="text-lg text-dim">No cards yet.</p>
              ) : (
                <ol className="grid grid-cols-1 gap-1 text-lg tabular-nums sm:text-xl">
                  {all[k].ranked.slice(0, 12).map((s) => (
                    <li key={s.climber} className="flex min-w-0 items-baseline justify-between gap-4 border-b border-rule py-1">
                      <span className="min-w-0 break-words">
                        <span className="inline-block w-10 text-dim">{placeText(s)}</span>
                        {comp.climbers[s.climber].name}
                      </span>
                      <span className="shrink-0 font-medium">{s.score.text}</span>
                    </li>
                  ))}
                </ol>
              )}
              {all[k].ranked.length > 12 && <p className="text-dim">And {plural(all[k].ranked.length - 12, 'more')}.</p>}
            </section>
          ))}
        </div>
        <p className="text-sm text-dim print:hidden">
          This window follows the desk in this browser. <a className="underline underline-offset-4" href={window.location.pathname}>Back to the desk</a>
        </p>
      </div>
    </div>
  )
}

// --- Climbers

function Climbers({ comp, onChange, say }: { comp: Comp; onChange: (f: (c: Comp) => Comp) => void; say: (m: string) => void }) {
  const [name, setName] = useState('')
  const [bib, setBib] = useState('')
  const [category, setCategory] = useState(0)
  const [paste, setPaste] = useState('')
  const [why, setWhy] = useState('')
  const nameBox = useRef<HTMLInputElement>(null)
  const full = comp.climbers.length >= LIMITS.climbers
  const repeatedBibs = useMemo(() => {
    const seen = new Map<string, number>()
    for (const c of comp.climbers) if (c.bib.trim()) seen.set(norm(c.bib), (seen.get(norm(c.bib)) ?? 0) + 1)
    return [...seen.entries()].filter(([, n]) => n > 1).map(([b]) => b)
  }, [comp.climbers])

  const add = (e: FormEvent) => {
    e.preventDefault()
    const n = name.replace(/\s+/g, ' ').trim()
    if (!n) {
      setWhy('A climber needs a name.')
      return
    }
    if (full) return
    onChange((c) => ({ ...c, climbers: [...c.climbers, { name: n.slice(0, 200), bib: bib.trim().slice(0, 40), category: Math.min(category, c.categories.length - 1), card: null }] }))
    setWhy('')
    setName('')
    setBib((b) => (/^\d+$/.test(b.trim()) ? String(Number(b.trim()) + 1) : ''))
    say(`${n} added.`)
    nameBox.current?.focus()
  }

  const addPasted = () => {
    const read = readClimbers(paste, comp.categories)
    const categories = [...comp.categories]
    const climbers = [...comp.climbers]
    for (const c of read.climbers) {
      let k = categories.findIndex((x) => x.toLowerCase() === c.category.toLowerCase())
      if (k < 0 && c.category) {
        if (categories.length >= LIMITS.categories) {
          setWhy(`Up to ${LIMITS.categories} categories.`)
          return
        }
        categories.push(c.category)
        k = categories.length - 1
      }
      climbers.push({ name: c.name.slice(0, 200), bib: c.bib.slice(0, 40), category: Math.max(0, k), card: null })
    }
    if (climbers.length > LIMITS.climbers) {
      setWhy(`Up to ${LIMITS.climbers.toLocaleString('en')} climbers.`)
      return
    }
    onChange((c) => ({ ...c, categories, climbers }))
    setPaste('')
    setWhy(read.notes.join(' '))
    say(`${plural(read.climbers.length, 'climber')} added.`)
  }

  const update = (i: number, patch: Partial<Climber>) => onChange((now) => ({ ...now, climbers: now.climbers.map((c, j) => (j === i ? { ...c, ...patch } : c)) }))
  const remove = (i: number) => {
    const c = comp.climbers[i]
    if (c.card && !window.confirm(`Remove ${c.name}? Their card goes too.`)) return
    onChange((now) => ({ ...now, climbers: now.climbers.filter((_, j) => j !== i) }))
    say(`${c.name} removed.`)
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <form onSubmit={add} className="flex flex-wrap items-end gap-2">
        <label className="grid min-w-0 grid-cols-1 gap-1 text-sm">
          <span>Name</span>
          <input ref={nameBox} className={`${field} w-56 max-w-full`} value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
        </label>
        <label className="grid grid-cols-1 gap-1 text-sm">
          <span>Category</span>
          <select className={`${field} max-w-48`} value={Math.min(category, comp.categories.length - 1)} onChange={(e) => setCategory(Number(e.target.value))}>
            {comp.categories.map((c, k) => (
              <option key={k} value={k}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="grid grid-cols-1 gap-1 text-sm">
          <span>Bib (optional)</span>
          <input className={`${field} w-24`} value={bib} onChange={(e) => setBib(e.target.value)} maxLength={40} />
        </label>
        <button type="submit" className={outline} disabled={full}>
          Add the climber
        </button>
      </form>
      <details className="grid grid-cols-1 gap-2">
        <summary className={summaryStyle}>Paste a list of climbers</summary>
        <div className="grid max-w-2xl grid-cols-1 gap-2 pt-2">
          <label className="grid grid-cols-1 gap-1.5 text-sm">
            <span className="text-dim">A climber per line: name, category, bib (commas or tabs), or cells from a spreadsheet with a header row. New categories are added.</span>
            <textarea className={`${control} min-h-28 py-2 font-mono text-sm`} value={paste} onChange={(e) => setPaste(e.target.value)} spellCheck={false} />
          </label>
          <div>
            <button type="button" className={outline} disabled={!paste.trim()} onClick={addPasted}>
              Add these climbers
            </button>
          </div>
        </div>
      </details>
      {why && <p className="max-w-prose text-sm text-dim" role="status">{why}</p>}
      {repeatedBibs.length > 0 && (
        <p className="max-w-prose text-sm text-pretty text-red-800 dark:text-red-300">
          Bib {repeatedBibs.slice(0, 5).join(', ')}
          {repeatedBibs.length > 5 ? ' and others' : ''} {repeatedBibs.length === 1 ? 'is' : 'are'} on more than one climber: cards are found by name for {repeatedBibs.length === 1 ? 'it' : 'them'}.
        </p>
      )}
      {comp.climbers.length > 0 && (
        <details className="grid grid-cols-1 gap-2">
          <summary className={summaryStyle}>All climbers ({comp.climbers.length})</summary>
          <ul className="grid grid-cols-1 gap-2 pt-2">
            {comp.climbers.map((c, i) => (
              <li key={i} className="flex min-w-0 flex-wrap items-center gap-2 border-b border-rule pb-2">
                <input aria-label={`Name of climber ${i + 1}`} className={`${field} w-56 max-w-full`} value={c.name} maxLength={200} onChange={(e) => update(i, { name: e.target.value })} />
                <select aria-label={`Category of ${c.name || `climber ${i + 1}`}`} className={`${field} max-w-48`} value={c.category} onChange={(e) => update(i, { category: Number(e.target.value) })}>
                  {comp.categories.map((cat, k) => (
                    <option key={k} value={k}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input aria-label={`Bib of ${c.name || `climber ${i + 1}`}`} className={`${field} w-24`} value={c.bib} maxLength={40} onChange={(e) => update(i, { bib: e.target.value })} />
                <span className="text-sm text-dim">{c.card ? 'card saved' : 'no card yet'}</span>
                <button type="button" className={small} onClick={() => remove(i)} aria-label={`Remove ${c.name || `climber ${i + 1}`}`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function FileButton({ label, accept, onFile }: { label: string; accept: string; onFile: (file: File) => void | Promise<void> }): ReactNode {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={outline} onClick={() => input.current?.click()}>
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
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
