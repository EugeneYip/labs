import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { EXAMPLE_PLACES, exampleCsv } from './example.ts'
import { allocate, cost, LIMITS, type Activity, type Person, type Placement } from './model.ts'
import { guessName, guessShape, keyOf, parseTable, READ_LIMITS, readResponses, tidy, type Shape, type Table } from './responses.ts'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 aria-invalid:border-red-600 sm:text-sm dark:aria-invalid:border-red-400'
const field = `${control} h-11 w-full sm:h-10`
const number = `${control} h-11 w-16 tabular-nums sm:h-10 sm:w-24`
// A label can wrap (text enlarged on a phone), so the height is a minimum, not fixed.
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'

/** Rows shown at first in the table of everyone; the download always has all of them. */
const SHOWN = 300

const SHAPES: { kind: Shape['kind']; label: string }[] = [
  { kind: 'columns', label: 'One column for each choice (first, second, …)' },
  { kind: 'list', label: 'One column holding a ranked list (A;B;C)' },
  { kind: 'grid', label: 'One column for each activity, holding its rank' },
]

const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'}`

type Settings = { places: string; min: string; name: string }

/** Experiment #029: give out places in activities from ranked choices, as high on everyone's list as the places allow. */
export default function PlacesByChoice() {
  const [text, setText] = useState('')
  const [fileNote, setFileNote] = useState('')
  // Column choices belong to the table they were made for; a new table starts from its own guesses.
  const [chosen, setChosen] = useState<{ table: Table; shape: Shape | null; name: number } | null>(null)
  const [lastOnly, setLastOnly] = useState(false)
  // Each activity's places, minimum, and name, by the key its responses' spelling matches.
  const [settings, setSettings] = useState<Record<string, Settings>>({})
  const [bulk, setBulk] = useState('')
  const [fill, setFill] = useState(false)
  const [result, setResult] = useState<{ placement: Placement; people: Person[]; activities: Activity[]; stamp: string } | null>(null)
  const [running, setRunning] = useState<{ placed: number; of: number } | null>(null)
  const [drawInput, setDrawInput] = useState('')
  const [said, setSaid] = useState('')
  const [saved, setSaved] = useState(true)
  const stop = useRef<AbortController | null>(null)
  const resultHeading = useRef<HTMLHeadingElement>(null)

  const tooLong = text.length > READ_LIMITS.characters
  const table: Table | null = useMemo(() => (text.trim() && !tooLong ? parseTable(text) : null), [text, tooLong])
  const guessed = useMemo(() => {
    if (!table) return { shape: null, name: -1 }
    const s = guessShape(table)
    return { shape: s, name: guessName(table, new Set(s ? (s.kind === 'list' ? [s.column] : s.columns) : [])) }
  }, [table])
  const mine = chosen !== null && chosen.table === table
  const shape = mine ? chosen.shape : guessed.shape
  const nameColumn = mine ? chosen.name : guessed.name
  const setShape = (next: Shape | null) => table && setChosen({ table, shape: next, name: nameColumn })
  const setNameColumn = (next: number) => table && setChosen({ table, shape, name: next })

  const responses = useMemo(() => {
    if (!table || !shape || nameColumn < 0) return []
    const all = readResponses(table, nameColumn, shape)
    if (!lastOnly) return all
    const last = new Map<string, number>()
    all.forEach((r, i) => last.set(r.name.toLowerCase(), i))
    return all.filter((r, i) => last.get(r.name.toLowerCase()) === i)
  }, [table, shape, nameColumn, lastOnly])

  // Activities as the responses spell them (the first spelling seen), with how many chose each first and at all.
  const found = useMemo(() => {
    const byKey = new Map<string, { name: string; first: number; any: number }>()
    for (const r of responses)
      r.choices.forEach((c, i) => {
        const key = keyOf(c)
        const a = byKey.get(key) ?? { name: c, first: 0, any: 0 }
        a.any++
        if (i === 0) a.first++
        byKey.set(key, a)
      })
    return [...byKey.entries()].map(([key, a]) => ({ key, ...a })).sort((x, y) => y.any - x.any || x.name.localeCompare(y.name))
  }, [responses])

  const setting = (key: string, name: string): Settings => settings[key] ?? { places: '', min: '', name }
  // Renaming an activity to another's name merges them: activities are grouped by their (possibly new) name.
  const groups = useMemo(() => {
    const out = new Map<string, { name: string; keys: string[]; places: string; min: string; first: number; any: number }>()
    for (const a of found) {
      const s = setting(a.key, a.name)
      const name = tidy(s.name) || a.name
      const k = keyOf(name)
      const g = out.get(k)
      if (g) {
        g.keys.push(a.key)
        g.first += a.first
        g.any += a.any
      } else out.set(k, { name, keys: [a.key], places: s.places, min: s.min, first: a.first, any: a.any })
    }
    return [...out.values()]
  }, [found, settings])
  // The activity a merged spelling went into: the first of its group, whose places count.
  const mergedInto = useMemo(() => new Map(groups.flatMap((g) => g.keys.slice(1).map((k) => [k, g.name] as const))), [groups])

  const duplicates = useMemo(() => {
    const seen = new Map<string, number>()
    for (const r of table && shape && nameColumn >= 0 ? readResponses(table, nameColumn, shape) : []) if (r.name) seen.set(r.name.toLowerCase(), (seen.get(r.name.toLowerCase()) ?? 0) + 1)
    return [...seen.values()].filter((n) => n > 1).length
  }, [table, shape, nameColumn])

  const people = responses.length
  const totalPlaces = groups.reduce((n, g) => n + (Number(g.places) || 0), 0)
  const missingPlaces = groups.filter((g) => g.places.trim() === '' || !Number.isFinite(Number(g.places)) || Number(g.places) < 0).length
  const noChoices = responses.filter((r) => r.choices.length === 0).length
  const noName = responses.filter((r) => !r.name).length
  const tooMany = people > LIMITS.people || groups.length > LIMITS.activities

  // Nothing is saved, so leaving with a result not downloaded asks first.
  useEffect(() => {
    if (saved) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [saved])

  const stale = result !== null && result.stamp !== stampOf(responses, groups, fill)

  // Focus moves to the result when places are given out from the activities; a draw changed from the result's own
  // controls keeps focus where it is, and the new result is announced.
  const run = async (draw: number, focus = false) => {
    stop.current?.abort()
    const controller = new AbortController()
    stop.current = controller
    const index = new Map<string, number>()
    const activities: Activity[] = groups.map((g, i) => {
      for (const k of g.keys) index.set(k, i)
      return { name: g.name, places: Math.floor(Number(g.places) || 0), min: Math.floor(Number(g.min) || 0) }
    })
    const list: Person[] = responses.map((r) => ({ name: r.name || `(row ${r.row}, no name)`, choices: [...new Set(r.choices.map((c) => index.get(keyOf(c))!))].slice(0, LIMITS.choices) }))
    setRunning({ placed: 0, of: list.length })
    setSaid('Placing…')
    try {
      const placement = await allocate(list, activities, draw, fill, { signal: controller.signal, onProgress: (placed, of) => setRunning({ placed, of }) })
      setResult({ placement, people: list, activities, stamp: stampOf(responses, groups, fill) })
      setSaved(false)
      setDrawInput(String(draw))
      const placed = list.length - placement.unplaced
      setSaid(`Draw ${draw}: placed ${placed.toLocaleString()} of ${list.length.toLocaleString()}; ${placement.profile[0]?.toLocaleString() ?? 0} got their first choice.`)
      if (focus) requestAnimationFrame(() => resultHeading.current?.focus())
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') setSaid('Stopped.')
      else throw e
    } finally {
      if (stop.current === controller) {
        stop.current = null
        setRunning(null)
      }
    }
  }
  const newDraw = () => {
    const b = new Uint32Array(1)
    crypto.getRandomValues(b)
    return 1000 + (b[0] % 9000)
  }

  return (
    <div className="flex-1">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <section aria-labelledby="intro-heading" className="grid grid-cols-1 gap-4 print:hidden">
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            Give out places in activities, projects, or workshops from everyone’s ranked choices, as high on each person’s list as the places allow. Paste or open the responses from a form,
            set each activity’s places, and get everyone’s place and each activity’s list.
          </p>
          <ul className="grid max-w-prose grid-cols-1 list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
            <li>The responses stay on this device: they’re read here, in this browser. Nothing is uploaded, and nothing is saved.</li>
            <li>It reads a CSV file or a table pasted from a spreadsheet: Microsoft Forms’ ranking question, Google Forms’ grid, or one question for each choice.</li>
            <li>Each person gets one place. Sessions at different times, and keeping people together or apart, aren’t handled here.</li>
          </ul>
          <details className="max-w-prose text-sm text-dim">
            <summary className={summaryStyle}>How it decides</summary>
            <div className="grid grid-cols-1 gap-2 pt-3 text-pretty">
              <p>It places as many people as the places allow. Among the ways of doing that, it takes the one with the lowest total, where each place counts its choice number squared: a first choice 1, a second 4, a third 9, a fourth 16.</p>
              <p>So nobody is moved down their list unless it does more good elsewhere: one person’s fourth choice (16) outweighs three people each getting their first choice instead of their second (3 each, 9 in all). Choosing in rounds (everyone’s first choice, then second choices) can do worse: it fills an activity with whoever comes first and leaves out someone who listed only that one.</p>
              <p>When several ways have the same total, a draw settles it. Its number is shown with the result: the same responses, places, and number give the same places again.</p>
              <p>An activity with a minimum that ends up below it doesn’t run: the smallest such one is dropped, and everyone is placed again.</p>
            </div>
          </details>
        </section>

        <section aria-labelledby="responses-heading" className="grid grid-cols-1 gap-3 print:hidden">
          <h2 id="responses-heading" className="text-lg font-semibold tracking-tight">
            Responses
          </h2>
          <label className="grid grid-cols-1 gap-1.5">
            <span className="sr-only">Responses, as CSV or a pasted table</span>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setFileNote('')
                setResult(null)
              }}
              rows={8}
              placeholder="Paste the responses (copy the table from a spreadsheet, or a CSV), or open a file below"
              spellCheck={false}
              autoComplete="off"
              aria-invalid={tooLong || undefined}
              className={`${control} w-full py-2 font-mono text-sm leading-relaxed`}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <FileButton
              label="Open a file"
              onFile={async (file) => {
                if (file.size > READ_LIMITS.characters) {
                  setFileNote('That file is too big to read here.')
                  return
                }
                if (/\.(xlsx|xls|xlsm|ods|numbers)$/i.test(file.name)) {
                  setFileNote('This page reads CSV or text. In your spreadsheet app, save or export the responses as CSV and open that, or copy the table and paste it above.')
                  return
                }
                const bytes = new Uint8Array(await file.arrayBuffer())
                const textOf = bytes[0] === 0xff && bytes[1] === 0xfe ? new TextDecoder('utf-16le').decode(bytes.subarray(2)) : bytes[0] === 0xfe && bytes[1] === 0xff ? new TextDecoder('utf-16be').decode(bytes.subarray(2)) : new TextDecoder('utf-8').decode(bytes)
                if (textOf.includes('\u0000')) {
                  setFileNote('This doesn’t look like a CSV or text file. Export the responses as CSV and open that.')
                  return
                }
                setText(textOf)
                setFileNote('')
                setResult(null)
                setSaid(`Opened ${file.name}.`)
              }}
            />
            {!text && (
              <button
                type="button"
                className={quiet}
                onClick={() => {
                  setText(exampleCsv())
                  setSettings(Object.fromEntries(Object.entries(EXAMPLE_PLACES).map(([name, places]) => [keyOf(name), { places: String(places), min: name === 'Photography' ? '4' : '', name }])))
                  setSaid('Opened the example: 96 made-up students choosing three of eight activities.')
                }}
              >
                Try an example
              </button>
            )}
            {text && (
              <button
                type="button"
                className={quiet}
                onClick={() => {
                  if (!saved && !window.confirm('Clear the responses and the result? Nothing is saved.')) return
                  setText('')
                  setResult(null)
                  setSettings({})
                  setSaved(true)
                }}
              >
                Clear
              </button>
            )}
          </div>
          {fileNote && <p className="max-w-prose text-sm text-pretty text-amber-800 dark:text-amber-300">{fileNote}</p>}
          {tooLong && <p className="text-sm text-red-700 dark:text-red-400">That’s more than this page reads ({READ_LIMITS.characters.toLocaleString()} characters).</p>}
          {table && (
            <div className="grid grid-cols-1 gap-3">
              <p className="text-sm">
                {table.rows.length.toLocaleString()} {table.rows.length === 1 ? 'row' : 'rows'}, {table.header.length} {table.header.length === 1 ? 'column' : 'columns'}.
                {!shape && ' Which columns hold the choices? Choose below.'}
              </p>
              {table.cut && <p className="text-sm text-amber-800 dark:text-amber-300">Only the first {READ_LIMITS.rows.toLocaleString()} rows were read; the rest were left out.</p>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="grid grid-cols-1 gap-1">
                  <span className="text-sm font-medium">Names are in</span>
                  <select value={nameColumn} onChange={(e) => setNameColumn(Number(e.target.value))} className={field}>
                    <option value={-1}>Choose a column</option>
                    {table.header.map((h, i) => (
                      <option key={i} value={i}>
                        {h || `Column ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid grid-cols-1 gap-1">
                  <span className="text-sm font-medium">Choices are in</span>
                  <select
                    value={shape?.kind ?? ''}
                    onChange={(e) => {
                      const kind = e.target.value as Shape['kind'] | ''
                      setShape(kind === '' ? null : kind === 'list' ? { kind, column: shape?.kind === 'list' ? shape.column : table.header.findIndex((_, i) => i !== nameColumn) } : { kind, columns: [] })
                    }}
                    className={field}
                  >
                    <option value="">Choose how</option>
                    {SHAPES.map((s) => (
                      <option key={s.kind} value={s.kind}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {shape?.kind === 'list' && (
                <label className="grid grid-cols-1 gap-1 sm:max-w-sm">
                  <span className="text-sm font-medium">The ranked list is in</span>
                  <select value={shape.column} onChange={(e) => setShape({ kind: 'list', column: Number(e.target.value) })} className={field}>
                    {table.header.map((h, i) => (
                      <option key={i} value={i}>
                        {h || `Column ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {(shape?.kind === 'columns' || shape?.kind === 'grid') && (
                <fieldset className="grid grid-cols-1 gap-1">
                  <legend className="text-sm font-medium">{shape.kind === 'columns' ? 'The choices, first to last (in column order)' : 'The activities’ columns'}</legend>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {table.header.map((h, i) =>
                      i === nameColumn ? null : (
                        <label key={i} className="flex cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={shape.columns.includes(i)}
                            onChange={(e) => setShape({ kind: shape.kind, columns: e.target.checked ? [...shape.columns, i].sort((a, b) => a - b) : shape.columns.filter((c) => c !== i) })}
                            className="size-4 cursor-pointer accent-current"
                          />
                          <span className="break-words">{h || `Column ${i + 1}`}</span>
                        </label>
                      ),
                    )}
                  </div>
                </fieldset>
              )}
              {responses.length > 0 && (
                <details className="min-w-0">
                  <summary className={summaryStyle}>Check the first few as read</summary>
                  <ul className="grid grid-cols-1 gap-1 pt-2 text-sm">
                    {responses.slice(0, 6).map((r) => (
                      <li key={r.row} className="break-words">
                        <span className="font-medium">{r.name || `(row ${r.row}, no name)`}</span>: {r.choices.length ? r.choices.map((c, i) => `${ordinal(i + 1)} ${c}`).join(', ') : 'no choices'}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <ul className="grid max-w-prose grid-cols-1 gap-1 text-sm text-pretty text-amber-800 dark:text-amber-300">
                {duplicates > 0 && (
                  <li>
                    {duplicates} {duplicates === 1 ? 'name appears' : 'names appear'} more than once (a second response, or two people with the same name).{' '}
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-ink">
                      <input type="checkbox" checked={lastOnly} onChange={(e) => setLastOnly(e.target.checked)} className="size-4 cursor-pointer accent-current" />
                      Use only each name’s last response
                    </label>
                  </li>
                )}
                {noChoices > 0 && <li>{noChoices} {noChoices === 1 ? 'response has' : 'responses have'} no choices: they can’t be placed unless places are filled where there’s room.</li>}
                {noName > 0 && <li>{noName} {noName === 1 ? 'response has' : 'responses have'} no name: they’re listed by row.</li>}
              </ul>
            </div>
          )}
        </section>

        {groups.length > 0 && (
          <section aria-labelledby="activities-heading" className="grid grid-cols-1 gap-3 print:hidden">
            <h2 id="activities-heading" className="text-lg font-semibold tracking-tight">
              Activities
            </h2>
            <p className="max-w-prose text-sm text-pretty text-dim">
              Set each one’s places. A minimum is optional: below it, the activity doesn’t run. To merge two spellings of the same activity, give them the same name.
            </p>
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                const v = bulk.trim()
                if (!v || !(Number(v) >= 0)) return
                setSettings(Object.fromEntries(found.map((a) => [a.key, { ...setting(a.key, a.name), places: String(Math.floor(Number(v))) }])))
                setSaid(`Every activity now has ${Math.floor(Number(v))} places.`)
              }}
            >
              <label className="grid grid-cols-1 gap-1">
                <span className="text-sm font-medium">Places for every activity</span>
                <input value={bulk} onChange={(e) => setBulk(e.target.value)} inputMode="numeric" className={`${field} sm:w-32`} />
              </label>
              <button type="submit" className={outline}>
                Set all
              </button>
            </form>
            <Scroll label="Table of activities">
              <table className="w-full text-left text-sm sm:w-auto">
                <thead className="text-xs text-dim">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Activity
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">
                      Chosen by
                    </th>
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Places
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      Minimum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {found.map((a) => {
                    const s = setting(a.key, a.name)
                    const update = (patch: Partial<Settings>) => setSettings((all) => ({ ...all, [a.key]: { ...s, ...patch } }))
                    const merged = mergedInto.has(a.key)
                    return (
                      <tr key={a.key} className="border-t border-rule align-middle">
                        <td className="py-1.5 pr-3">
                          <input value={s.name} onChange={(e) => update({ name: e.target.value })} aria-label={`Name of ${a.name}`} className={`${field} min-w-28 sm:min-w-72`} spellCheck={false} />
                          {merged && <span className="block pt-1 text-xs text-dim">Merged: the places set for {mergedInto.get(a.key)} count</span>}
                        </td>
                        <td className="py-1.5 pr-3 text-right whitespace-nowrap tabular-nums">
                          {a.any.toLocaleString()}
                          <span className="block text-xs text-dim">{a.first.toLocaleString()} first</span>
                        </td>
                        <td className="py-1.5 pr-3">
                          <input
                            value={merged ? '' : s.places}
                            disabled={merged}
                            onChange={(e) => update({ places: e.target.value })}
                            inputMode="numeric"
                            aria-label={`Places in ${a.name}`}
                            aria-invalid={(!merged && s.places.trim() !== '' && !(Number(s.places) >= 0)) || undefined}
                            className={number}
                          />
                        </td>
                        <td className="py-1.5">
                          <input value={merged ? '' : s.min} disabled={merged} onChange={(e) => update({ min: e.target.value })} inputMode="numeric" aria-label={`Minimum for ${a.name}`} className={number} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Scroll>
            <p className="text-sm" aria-live="polite">
              {people.toLocaleString()} {people === 1 ? 'person' : 'people'} and {totalPlaces.toLocaleString()} {totalPlaces === 1 ? 'place' : 'places'}
              {missingPlaces ? `; ${missingPlaces} ${missingPlaces === 1 ? 'activity has' : 'activities have'} no places set yet` : totalPlaces < people ? `: ${(people - totalPlaces).toLocaleString()} short, so some can’t be placed` : '.'}
            </p>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={fill} onChange={(e) => setFill(e.target.checked)} className="size-4 cursor-pointer accent-current" />
              If someone can’t have any of their choices, place them wherever there’s room
            </label>
            {tooMany && <p className="text-sm text-red-700 dark:text-red-400">This page places up to {LIMITS.people.toLocaleString()} people in up to {LIMITS.activities} activities.</p>}
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={primary} disabled={missingPlaces > 0 || people === 0 || tooMany || running !== null || (result !== null && !stale)} onClick={() => void run(result ? result.placement.draw : newDraw(), true)}>
                {result && stale ? `Place again (draw ${result.placement.draw})` : 'Give out places'}
              </button>
              {running && (
                <>
                  <span className="text-sm text-dim tabular-nums" role="status">
                    Placed {running.placed.toLocaleString()} of {running.of.toLocaleString()}…
                  </span>
                  <button type="button" className={outline} onClick={() => stop.current?.abort()}>
                    Stop
                  </button>
                </>
              )}
            </div>
            {result && stale && !running && <p className="text-sm text-amber-800 dark:text-amber-300">The responses or places have changed since these places were given out.</p>}
          </section>
        )}

        {result && (
          <Result
            result={result}
            heading={resultHeading}
            drawInput={drawInput}
            setDrawInput={setDrawInput}
            onDraw={(d) => void run(d)}
            onNewDraw={() => void run(newDraw())}
            onSaved={() => setSaved(true)}
            say={setSaid}
          />
        )}
        <p role="status" className="sr-only">
          {said}
        </p>
      </div>
    </div>
  )
}

/** What a result depends on, to tell when it's out of date. */
function stampOf(responses: { name: string; choices: string[] }[], groups: { name: string; keys: string[]; places: string; min: string }[], fill: boolean): string {
  return JSON.stringify([responses.map((r) => [r.name, r.choices]), groups.map((g) => [g.name, g.keys, g.places, g.min]), fill])
}

function Result({
  result,
  heading,
  drawInput,
  setDrawInput,
  onDraw,
  onNewDraw,
  onSaved,
  say,
}: {
  result: { placement: Placement; people: Person[]; activities: Activity[] }
  heading: RefObject<HTMLHeadingElement | null>
  drawInput: string
  setDrawInput: (v: string) => void
  onDraw: (d: number) => void
  onNewDraw: () => void
  onSaved: () => void
  say: (s: string) => void
}) {
  const { placement: r, people, activities } = result
  const [find, setFind] = useState('')
  const [all, setAll] = useState(false)
  const placed = people.length - r.unplaced
  const lists = useMemo(() => {
    const out = activities.map(() => [] as number[])
    people.forEach((_, p) => r.place[p] >= 0 && out[r.place[p]].push(p))
    for (const l of out) l.sort((x, y) => r.choice[x] - r.choice[y] || people[x].name.localeCompare(people[y].name))
    return out
  }, [r, people, activities])
  const dropped = new Set(r.dropped.map((d) => d.activity))
  const left = people.map((_, p) => p).filter((p) => r.place[p] < 0)
  const total = people.reduce((n, _, p) => n + (r.choice[p] > 0 ? cost(r.choice[p]) : 0), 0)
  const rows = people.map((_, p) => p).filter((p) => !find.trim() || people[p].name.toLowerCase().includes(find.trim().toLowerCase()))
  const choiceText = (p: number) => (r.place[p] < 0 ? '—' : r.filled.has(p) ? 'not one of their choices' : ordinal(r.choice[p]))

  return (
    <div className="grid grid-cols-1 gap-10">
      <section aria-labelledby="result-heading" className="grid grid-cols-1 gap-4">
        <h2 id="result-heading" ref={heading} tabIndex={-1} className="text-2xl font-semibold tracking-tight outline-none">
          Places
        </h2>
        <div className="grid max-w-prose grid-cols-1 gap-2 rounded-xl border border-rule p-4">
          <p className="text-lg font-medium text-pretty">
            Placed {placed.toLocaleString()} of {people.length.toLocaleString()}.
          </p>
          <p className="text-sm text-pretty">
            {r.profile
              .map((n, i) => (n ? `${n.toLocaleString()} got their ${ordinal(i + 1)} choice` : ''))
              .filter(Boolean)
              .join(', ')}
            {r.filled.size ? `, and ${r.filled.size.toLocaleString()} ${r.filled.size === 1 ? 'was' : 'were'} placed where there was room` : ''}.
          </p>
          {left.length > 0 && <p className="text-sm text-pretty text-amber-800 dark:text-amber-300">{left.length.toLocaleString()} couldn’t be placed: they’re listed below with the reason.</p>}
          {r.dropped.map((d) => (
            <p key={d.activity} className="text-sm text-pretty text-amber-800 dark:text-amber-300">
              {activities[d.activity].name} doesn’t run:{' '}
              {d.chosenBy !== undefined ? `only ${d.chosenBy} chose it, under its minimum of ${activities[d.activity].min}` : `it had ${d.had}, under its minimum of ${activities[d.activity].min}, so everyone was placed again without it`}.
            </p>
          ))}
          <p className="text-sm text-dim">
            Draw {r.draw}: the same responses, places, and draw give the same places. Total by the rule: {total.toLocaleString()}.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2 print:hidden">
          <button
            type="button"
            className={primary}
            onClick={() => {
              download(everyoneCsv(result), 'places.csv')
              onSaved()
              say('The places were downloaded.')
            }}
          >
            Download the places
          </button>
          <button
            type="button"
            className={outline}
            onClick={() => {
              download(listsCsv(result), 'lists-by-activity.csv')
              onSaved()
              say('The lists were downloaded.')
            }}
          >
            Download the lists
          </button>
          <button type="button" className={outline} onClick={() => window.print()}>
            Print the lists
          </button>
        </div>
        <form
          className="flex flex-wrap items-end gap-2 print:hidden"
          onSubmit={(e) => {
            e.preventDefault()
            // The field's own value: a draw typed and submitted at once is never read from the render before.
            const d = Number(String(new FormData(e.currentTarget).get('draw') ?? '').trim())
            if (Number.isInteger(d) && d >= 0 && d < 1e9) onDraw(d)
          }}
        >
          <label className="grid grid-cols-1 gap-1">
            <span className="text-sm font-medium">Draw number</span>
            <input name="draw" value={drawInput} onChange={(e) => setDrawInput(e.target.value)} inputMode="numeric" className={`${field} sm:w-32`} />
          </label>
          {/* Usable while placing: a new draw replaces the one under way. */}
          <button type="submit" className={outline}>
            Use this draw
          </button>
          <button type="button" className={quiet} onClick={onNewDraw}>
            New draw
          </button>
        </form>
      </section>

      {left.length > 0 && (
        <section aria-labelledby="left-heading" className="grid grid-cols-1 gap-3 print:hidden">
          <h2 id="left-heading" className="text-lg font-semibold tracking-tight">
            Not placed ({left.length.toLocaleString()})
          </h2>
          <ul className="grid grid-cols-1 gap-1 text-sm">
            {left.map((p) => (
              <li key={p} className="break-words">
                <span className="font-medium">{people[p].name}</span>:{' '}
                {r.why.get(p) === 'no-choices' ? 'no choices given' : r.why.get(p) === 'not-running' ? 'none of their choices runs' : `every choice was full (${people[p].choices.map((a) => activities[a].name).join(', ')})`}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="lists-heading" className="grid grid-cols-1 gap-3">
        <h2 id="lists-heading" className="text-lg font-semibold tracking-tight">
          Each activity’s list
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a, i) => (
            <li key={i} className="grid min-w-0 grid-cols-1 content-start gap-2 rounded-xl border border-rule p-4 break-inside-avoid print:break-after-page">
              <h3 className="font-medium break-words">
                {a.name}{' '}
                <span className="font-normal text-dim tabular-nums">
                  {dropped.has(i) ? '(doesn’t run)' : `(${lists[i].length} of ${a.places})`}
                </span>
              </h3>
              {lists[i].length > 0 && (
                <ol className="grid grid-cols-1 gap-0.5 text-sm">
                  {lists[i].map((p) => (
                    <li key={p} className="flex justify-between gap-3 break-words">
                      <span>{people[p].name}</span>
                      <span className="shrink-0 text-dim">{choiceText(p)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="everyone-heading" className="grid grid-cols-1 gap-3 print:hidden">
        <h2 id="everyone-heading" className="text-lg font-semibold tracking-tight">
          Everyone
        </h2>
        <label className="grid grid-cols-1 gap-1 sm:max-w-sm">
          <span className="text-sm font-medium">Find a name</span>
          <input value={find} onChange={(e) => setFind(e.target.value)} type="search" className={field} spellCheck={false} autoComplete="off" />
        </label>
        <Scroll label="Table of everyone’s places">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-dim">
              <tr>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Name
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Place
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  Which choice
                </th>
                <th scope="col" className="py-2 font-medium">
                  Their choices
                </th>
              </tr>
            </thead>
            <tbody>
              {(all ? rows : rows.slice(0, SHOWN)).map((p) => (
                <tr key={p} className="border-t border-rule align-top">
                  <td className="py-1.5 pr-3 break-words">{people[p].name}</td>
                  <td className="py-1.5 pr-3 break-words">{r.place[p] >= 0 ? activities[r.place[p]].name : '—'}</td>
                  <td className="py-1.5 pr-3">{choiceText(p)}</td>
                  <td className="py-1.5 break-words text-dim">{people[p].choices.map((a) => activities[a].name).join(', ') || 'none'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>
        {rows.length > SHOWN && !all && (
          <div>
            <button type="button" className={quiet} onClick={() => setAll(true)}>
              Show all {rows.length.toLocaleString()}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

/** Everyone, in their responses' order: name, place, which choice it was, and their choices. Spreadsheet formulas in
 * names are defused. */
function everyoneCsv({ placement: r, people, activities }: { placement: Placement; people: Person[]; activities: Activity[] }): string {
  const lines = [['Name', 'Place', 'Which choice', 'Their choices'].map(csvField).join(',')]
  people.forEach((person, p) => {
    const which = r.place[p] < 0 ? '' : r.filled.has(p) ? 'not one of their choices' : String(r.choice[p])
    lines.push([person.name, r.place[p] >= 0 ? activities[r.place[p]].name : '', which, person.choices.map((a) => activities[a].name).join('; ')].map(csvField).join(','))
  })
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

/** Each activity's list: activity, name, which choice. */
function listsCsv({ placement: r, people, activities }: { placement: Placement; people: Person[]; activities: Activity[] }): string {
  const lines = [['Activity', 'Name', 'Which choice'].map(csvField).join(',')]
  activities.forEach((a, i) => {
    people
      .map((_, p) => p)
      .filter((p) => r.place[p] === i)
      .sort((x, y) => r.choice[x] - r.choice[y] || people[x].name.localeCompare(people[y].name))
      .forEach((p) => lines.push([a.name, people[p].name, r.filled.has(p) ? 'not one of their choices' : String(r.choice[p])].map(csvField).join(',')))
  })
  return `\uFEFF${lines.join('\r\n')}\r\n`
}

function csvField(v: string): string {
  // A leading =, +, -, or @ would make a spreadsheet run it as a formula.
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

function download(content: string, name: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** A wide table that scrolls sideways on its own on a phone, reachable and scrollable from the keyboard. */
function Scroll({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} tabIndex={0} className="max-w-full overflow-x-auto rounded-lg">
      {children}
    </div>
  )
}

function FileButton({ label, onFile }: { label: string; onFile: (file: File) => void | Promise<void> }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={outline} onClick={() => input.current?.click()}>
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept=".csv,.tsv,.txt,text/csv,text/plain,text/tab-separated-values"
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
