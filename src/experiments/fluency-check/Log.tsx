import { useEffect, useMemo, useRef, useState } from 'react'
import { checkKey, fromCSV, localStamp, newId, percent, toCSV, type Check } from './model.ts'
import { control, dateText, outline, quiet, shortDate, whenText } from './ui.ts'

const ALL = ''

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** Checks saved on this device: a table, a progress chart for one student, CSV export and loading, and deleting. */
export function Log({ log, onChange }: { log: Check[]; onChange: (log: Check[]) => void }) {
  const [student, setStudent] = useState(ALL)
  const [deleted, setDeleted] = useState<Check[] | null>(null)
  const [loaded, setLoaded] = useState<{ text: string; ids: string[] } | null>(null)
  const [confirming, setConfirming] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const students = useMemo(() => {
    const names = new Map<string, string>()
    for (const c of log) names.set(c.student.trim().toLocaleLowerCase(), c.student.trim())
    return [...names.values()].sort((a, b) => a.localeCompare(b))
  }, [log])
  const chosen = student !== ALL && students.some((s) => s.toLocaleLowerCase() === student.toLocaleLowerCase()) ? student : ALL
  const shown = log.filter((c) => chosen === ALL || c.student.trim().toLocaleLowerCase() === chosen.toLocaleLowerCase()).sort((a, b) => b.at - a.at)

  const remove = (gone: Check[]) => {
    const ids = new Set(gone.map((c) => c.id))
    onChange(log.filter((c) => !ids.has(c.id)))
    setDeleted(gone)
    setLoaded(null)
    setConfirming(false)
  }

  // A CSV downloaded here brings checks back after the browser's data is cleared, or onto another device.
  const loadFile = async (file: File) => {
    setDeleted(null)
    const result = await file.text().then((text) => fromCSV(text, newId), () => null)
    if (!result) return setLoaded({ text: `${file.name} isn’t a CSV downloaded from Fluency Check, so nothing was added.`, ids: [] })
    const known = new Set(log.map(checkKey))
    const added = result.checks.filter((c) => {
      const key = checkKey(c)
      if (known.has(key)) return false
      known.add(key)
      return true
    })
    const already = result.checks.length - added.length
    const parts = [added.length ? `Added ${plural(added.length, 'check')} from ${file.name}.` : `Nothing new in ${file.name}.`]
    if (already) parts.push(`${plural(already, 'check')} ${already === 1 ? 'was' : 'were'} already here.`)
    if (result.unreadable) parts.push(`${plural(result.unreadable, 'row')} couldn’t be read.`)
    if (added.length) onChange([...log, ...added].sort((a, b) => a.at - b.at))
    setLoaded({ text: parts.join(' '), ids: added.map((c) => c.id) })
  }
  const loadButton = (className: string, label: string) => (
    <>
      <button type="button" onClick={() => fileInput.current?.click()} className={className}>
        {label}
      </button>
      <input
        ref={fileInput}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void loadFile(file)
        }}
      />
    </>
  )

  const download = () => {
    const blob = new Blob(['\uFEFF', toCSV([...shown].reverse())], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const who = chosen === ALL ? '' : `-${chosen.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase()}`
    a.href = url
    a.download = `fluency-checks${who}-${localStamp(Date.now()).date}.csv`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (!log.length && !deleted && !loaded)
    return (
      <p className="mt-14 max-w-prose text-sm text-pretty text-dim">
        Saved checks will appear here. To bring back checks from another browser, {loadButton('cursor-pointer underline underline-offset-4 hover:text-ink', 'load a CSV')} downloaded from Fluency Check.
      </p>
    )

  return (
    <section aria-labelledby="log-heading" className="mt-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="log-heading" className="text-lg font-semibold tracking-tight">
            Saved on this device
          </h2>
          <p className="mt-1 max-w-prose text-sm text-pretty text-dim">Only in this browser, and nothing is sent anywhere. Browsers can clear saved data, so download a CSV now and then: you can load it back here or on another device.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {students.length > 1 && (
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Student</span>
              <select value={chosen} onChange={(e) => setStudent(e.target.value)} className={`${control} h-11 cursor-pointer sm:h-10`}>
                <option value={ALL}>All students</option>
                {students.map((s) => (
                  <option key={s} value={s}>
                    {s || 'Unnamed'}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" onClick={download} disabled={!shown.length} className={outline}>
            Download CSV
          </button>
          {loadButton(outline, 'Load a CSV')}
        </div>
      </div>

      {deleted && (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 text-sm" role="status">
          {deleted.length === 1 ? 'Deleted 1 check.' : `Deleted ${deleted.length} checks.`}
          <button
            type="button"
            onClick={() => {
              onChange([...log, ...deleted])
              setDeleted(null)
            }}
            className="cursor-pointer underline underline-offset-4 hover:text-dim"
          >
            Undo
          </button>
        </p>
      )}

      {loaded && (
        <p className="mt-4 flex flex-wrap items-center gap-x-3 text-sm text-pretty" role="status" dir="auto">
          {loaded.text}
          {loaded.ids.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const ids = new Set(loaded.ids)
                onChange(log.filter((c) => !ids.has(c.id)))
                setLoaded(null)
              }}
              className="cursor-pointer underline underline-offset-4 hover:text-dim"
            >
              Undo
            </button>
          )}
        </p>
      )}

      {chosen !== ALL && shown.length >= 2 && <Progress checks={[...shown].reverse()} name={chosen} />}

      {shown.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-rule text-dim">
              <tr>
                <th scope="col" className="py-2 pr-3 font-normal">
                  Date
                </th>
                {chosen === ALL && (
                  <th scope="col" className="py-2 pr-3 font-normal">
                    Student
                  </th>
                )}
                <th scope="col" className="hidden py-2 pr-3 font-normal sm:table-cell">
                  Passage
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-normal">
                  WCPM
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-normal">
                  Accuracy
                </th>
                <th scope="col" className="hidden py-2 pr-3 text-right font-normal min-[420px]:table-cell">
                  Errors
                </th>
                <th scope="col" className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule">
              {shown.map((c) => (
                <tr key={c.id}>
                  <td className="py-2 pr-3 whitespace-nowrap" title={whenText(c.at)}>
                    {shortDate(c.at)}
                  </td>
                  {chosen === ALL && (
                    <td className="max-w-40 truncate py-2 pr-3" dir="auto">
                      {c.student || <span className="text-dim">Unnamed</span>}
                    </td>
                  )}
                  <td className="hidden max-w-56 truncate py-2 pr-3 text-dim sm:table-cell" dir="auto">
                    {c.passage}
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold tabular-nums">
                    {c.wcpm}
                    {c.goal !== null && <span className={`ml-1 text-xs font-normal ${c.wcpm >= c.goal ? 'text-signal' : 'text-dim'}`}>/{c.goal}</span>}
                  </td>
                  <td className="py-2 pr-3 text-right tabular-nums">{c.accuracy === null ? '–' : `${percent(c.accuracy)}%`}</td>
                  <td className="hidden py-2 pr-3 text-right tabular-nums min-[420px]:table-cell">{c.errors}</td>
                  <td className="py-1 text-right">
                    <button type="button" onClick={() => remove([c])} className={`${quiet} h-9 px-2 sm:h-8`} aria-label={`Delete the check from ${whenText(c.at)}${c.student ? ` for ${c.student}` : ''}`}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shown.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          {confirming ? (
            <>
              <span>Delete {chosen === ALL ? `all ${shown.length} checks` : `all ${shown.length} checks for ${chosen || 'Unnamed'}`}?</span>
              <button type="button" onClick={() => remove(shown)} className={`${outline} border-red-600 text-red-700 dark:border-red-400 dark:text-red-300`}>
                Delete them
              </button>
              <button type="button" onClick={() => setConfirming(false)} className={quiet}>
                Keep them
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className={`${quiet} -ml-3`}>
              Delete {chosen === ALL ? 'all' : 'these'}…
            </button>
          )}
        </div>
      )}
    </section>
  )
}

/** Words correct per minute over time for one student, oldest to newest. */
function Progress({ checks, name }: { checks: Check[]; name: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(640)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(() => setW(Math.max(240, el.clientWidth)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const H = 170
  const pad = { left: 34, right: 12, top: 18, bottom: 26 }
  const goal = checks[checks.length - 1].goal
  const top = Math.max(...checks.map((c) => c.wcpm), goal ?? 0)
  const max = Math.max(20, Math.ceil((top * 1.15) / 20) * 20)
  const x = (i: number) => pad.left + (checks.length === 1 ? 0 : (i / (checks.length - 1)) * (W - pad.left - pad.right))
  const y = (v: number) => pad.top + (1 - v / max) * (H - pad.top - pad.bottom)
  const ticks = [0, max / 2, max]
  const first = checks[0]
  const latest = checks[checks.length - 1]
  const change = latest.wcpm - first.wcpm

  return (
    <figure className="mt-5 max-w-2xl">
      <figcaption className="text-sm text-pretty">
        <span className="font-medium" dir="auto">
          {name || 'Unnamed'}
        </span>
        <span className="text-dim">
          : {latest.wcpm} words correct per minute on {dateText(latest.at)}, {change === 0 ? 'the same as' : `${Math.abs(change)} ${change > 0 ? 'more than' : 'fewer than'}`} the first saved check ({dateText(first.at)}).
        </span>
      </figcaption>
      <div ref={ref} className="mt-2">
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block max-w-full" role="img" aria-label={`Chart of ${checks.length} checks from ${dateText(first.at)} to ${dateText(latest.at)}`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} className="stroke-rule" strokeWidth={1} />
              <text x={pad.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-dim text-xs tabular-nums">
                {t}
              </text>
            </g>
          ))}
          {goal !== null && (
            <g>
              <line x1={pad.left} x2={W - pad.right} y1={y(goal)} y2={y(goal)} className="stroke-dim" strokeWidth={1.5} strokeDasharray="5 4" />
              <text x={pad.left + 4} y={y(goal) - 6} className="fill-dim text-xs">
                Goal {goal}
              </text>
            </g>
          )}
          <polyline points={checks.map((c, i) => `${x(i)},${y(c.wcpm)}`).join(' ')} fill="none" className="stroke-ink" strokeWidth={2} strokeLinejoin="round" />
          {checks.map((c, i) => (
            <circle key={c.id} cx={x(i)} cy={y(c.wcpm)} r={4.5} className="fill-ink stroke-paper" strokeWidth={2}>
              <title>{`${dateText(c.at)}: ${c.wcpm} WCPM${c.accuracy === null ? '' : `, ${percent(c.accuracy)}% accuracy`}`}</title>
            </circle>
          ))}
          <text x={x(0)} y={H - 6} textAnchor="start" className="fill-dim text-xs">
            {shortDate(first.at)}
          </text>
          <text x={x(checks.length - 1)} y={H - 6} textAnchor="end" className="fill-dim text-xs">
            {shortDate(latest.at)}
          </text>
        </svg>
      </div>
    </figure>
  )
}
