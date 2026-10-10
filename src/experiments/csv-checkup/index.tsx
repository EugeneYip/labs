import { useRef, useState, type DragEvent } from 'react'
import { checkFile, type Checkup } from './check.ts'
import { DELIMITER_NAMES } from './csv.ts'
import { formatCount, KIND_NAMES, percent, type Column } from './profile.ts'
import { columnSummary, distinctText, formatNumber, quote, toMarkdown } from './report.ts'

/** Whether this device writes dates day first (2 March as 02/03), for slash dates in a file that could be read either way. */
const DAY_FIRST = (() => {
  try {
    const parts = new Intl.DateTimeFormat(navigator.language, { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date(2026, 0, 2))
    return parts.findIndex((p) => p.type === 'day') < parts.findIndex((p) => p.type === 'month')
  } catch {
    return false
  }
})()

// One data hue (validated against both page backgrounds), with a quieter step of it for tracks.
const BAR = 'bg-[#2a78d6] dark:bg-[#3987e5]'
const TRACK = 'bg-[#cde2fb] dark:bg-[#104281]'
const button = 'inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg px-4 text-sm transition-colors'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** Experiment #005: a local health check for CSV files. */
export default function CsvCheckup() {
  const [file, setFile] = useState<File | null>(null)
  const [checkup, setCheckup] = useState<Checkup | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const run = useRef(0)

  async function open(next: File, hasHeader?: boolean) {
    const id = ++run.current
    setFile(next)
    setCheckup(null)
    setError('')
    setCopied(false)
    setProgress(0)
    try {
      const head = new Uint8Array(await next.slice(0, 4).arrayBuffer())
      if (head[0] === 0x50 && head[1] === 0x4b) throw new Error('This looks like an Excel or zip file. Save it as CSV first, then check that.')
      if (next.size === 0) throw new Error('This file is empty.')
      const result = await checkFile(next, (fraction) => id === run.current && setProgress(fraction), hasHeader, DAY_FIRST)
      if (id !== run.current) return
      if (!result.profile.columns.length) throw new Error('No rows were found in this file.')
      setCheckup(result)
    } catch (e) {
      if (id === run.current) setError(e instanceof Error && !(e instanceof TypeError) ? e.message : 'This file couldn’t be read as text.')
    } finally {
      if (id === run.current) setProgress(null)
    }
  }

  function onDrag(event: DragEvent, kind: 'over' | 'leave' | 'drop') {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDragging(kind === 'over')
    const dropped = kind === 'drop' ? event.dataTransfer.files[0] : undefined
    if (dropped) void open(dropped)
  }

  async function copyReport() {
    if (!file || !checkup) return
    try {
      await navigator.clipboard.writeText(toMarkdown(file.name, size(file.size), checkup))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex-1" onDragOver={(e) => onDrag(e, 'over')} onDragLeave={(e) => onDrag(e, 'leave')} onDrop={(e) => onDrag(e, 'drop')}>
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="max-w-2xl text-pretty text-dim">
          Drop in a CSV export to see what’s in it before you use it: the columns and the kind of data each holds, empty
          values, repeated rows, the most common values, and the problems spreadsheets tend to cause.
        </p>

        <div className={`mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border-2 border-dashed px-5 ${checkup || progress !== null ? 'py-4' : 'py-8 sm:py-10'} ${dragging ? 'border-ink bg-ink/5' : 'border-rule'}`}>
          <button type="button" onClick={() => input.current?.click()} className={primary}>
            {file ? 'Check another file' : 'Choose a CSV file'}
          </button>
          <p className="text-sm text-dim">
            or drop it here. Comma, semicolon, tab, or pipe separated.{' '}
            <button type="button" onClick={() => void open(sampleFile())} className="cursor-pointer text-ink underline underline-offset-4 hover:text-dim">
              Try a sample file
            </button>
          </p>
          <input
            ref={input}
            type="file"
            accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
            onChange={(e) => {
              const chosen = e.target.files?.[0]
              e.target.value = ''
              if (chosen) void open(chosen)
            }}
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />
        </div>
        <p className="mt-3 text-sm text-dim">The file never leaves this device. It’s read inside this page, and nothing is uploaded or saved.</p>

        <div aria-live="polite">
          {progress !== null && file && (
            <div className="mt-8">
              <p className="text-sm">
                Reading {file.name}… {Math.round(progress * 100)}%
              </p>
              <div className={`mt-2 h-2 w-full max-w-md overflow-hidden rounded-full ${TRACK}`}>
                <div className={`h-full rounded-full ${BAR}`} style={{ width: `${Math.max(2, progress * 100)}%` }} />
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className="mt-8 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-300">
              {error}
            </p>
          )}
        </div>

        {checkup && file && (
          <Results
            file={file}
            checkup={checkup}
            copied={copied}
            onCopy={() => void copyReport()}
            onHeaderChange={(hasHeader) => void open(file, hasHeader)}
          />
        )}
      </div>
    </div>
  )
}

function Results({ file, checkup, copied, onCopy, onHeaderChange }: { file: File; checkup: Checkup; copied: boolean; onCopy: () => void; onHeaderChange: (hasHeader: boolean) => void }) {
  const p = checkup.profile
  const empty = p.columns.reduce((sum, c) => sum + c.missing, 0)
  const cells = p.rows * p.columns.length

  return (
    <>
      <section aria-labelledby="file-heading" className="mt-10">
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
          <div className="mr-auto min-w-0">
            <h2 id="file-heading" className="truncate text-xl font-semibold tracking-tight">
              {file.name}
            </h2>
            <p className="mt-1 text-sm text-dim">
              {size(file.size)} · {DELIMITER_NAMES[checkup.delimiter]}-separated · {checkup.encoding}
              {checkup.unclosedQuote && ' · ends inside an unclosed quote'}
            </p>
          </div>
          <div className="-ml-4 flex items-center gap-1 sm:ml-0">
            <p role="status" className="px-2 text-sm text-green-800 empty:px-0 dark:text-green-300">
              {copied ? 'Copied' : ''}
            </p>
            <button type="button" onClick={onCopy} className={quiet}>
              Copy report
            </button>
          </div>
        </div>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={checkup.hasHeader} onChange={(e) => onHeaderChange(e.target.checked)} className="size-4 cursor-pointer accent-current" />
          The first row holds column names
        </label>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-4">
          <Tile label="Rows" value={formatCount(p.rows)} />
          <Tile label="Columns" value={formatCount(p.columns.length)} />
          <Tile label="Empty values" value={cells ? percent(empty, cells) : '0%'} note={`${formatCount(empty)} of ${formatCount(cells)}`} />
          <Tile label="Issues" value={formatCount(p.issues.length)} />
        </dl>
      </section>

      <section aria-labelledby="issues-heading" className="mt-10">
        <h2 id="issues-heading" className="border-b border-rule pb-2 font-mono text-xs tracking-widest text-dim uppercase">
          Issues
        </h2>
        {p.issues.length === 0 ? (
          <p className="py-4 text-green-800 dark:text-green-300">✓ No problems found.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {p.issues.map((issue, k) => (
              <li key={k} className="flex gap-3 py-3 text-sm/relaxed">
                <span aria-hidden="true" className="mt-0.5 text-amber-700 dark:text-amber-400">
                  ▲
                </span>
                <span className="min-w-0 break-words">{issue}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="columns-heading" className="mt-10">
        <h2 id="columns-heading" className="border-b border-rule pb-2 font-mono text-xs tracking-widest text-dim uppercase">
          Columns
        </h2>
        <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1fr)_8rem_9rem_6rem_minmax(0,1.4fr)] gap-4 border-b border-rule px-2 py-2 text-xs text-dim md:grid">
          <span>Column</span>
          <span>Type</span>
          <span>Filled</span>
          <span>Distinct</span>
          <span>Values</span>
        </div>
        {p.columns.map((column, i) => (
          <ColumnRow key={i} column={column} rows={p.rows} />
        ))}
      </section>

      <section aria-labelledby="preview-heading" className="mt-10">
        <h2 id="preview-heading" className="border-b border-rule pb-2 font-mono text-xs tracking-widest text-dim uppercase">
          First {Math.min(p.preview.length, 50)} rows
        </h2>
        <div className="mt-3 max-h-[28rem] overflow-auto rounded-lg border border-rule">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-paper">
              <tr>
                <th scope="col" className="border-b border-rule px-3 py-2 font-mono text-xs font-normal text-dim">
                  #
                </th>
                {p.columns.map((c, i) => (
                  <th key={i} scope="col" className="max-w-56 truncate border-b border-rule px-3 py-2 font-medium whitespace-nowrap" title={c.name}>
                    {c.name || '(no name)'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.preview.map((row, r) => (
                <tr key={r} className="odd:bg-ink/[0.02]">
                  <td className="px-3 py-1.5 font-mono text-xs text-dim tabular-nums">{r + 1}</td>
                  {p.columns.map((_, i) => (
                    <td key={i} dir="auto" className="max-w-56 truncate px-3 py-1.5 whitespace-nowrap" title={row[i]}>
                      {row[i] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function Tile({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-paper px-4 py-3">
      <dt className="text-sm text-dim">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight">{value}</dd>
      {note && <dd className="text-xs text-dim">{note}</dd>}
    </div>
  )
}

function ColumnRow({ column: c, rows }: { column: Column; rows: number }) {
  const filledShare = rows ? c.filled / rows : 0
  const repeats = c.top.length > 0 && c.top[0].count > 1
  return (
    <details className="group border-b border-rule">
      <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-2 py-3 hover:bg-ink/[0.03] md:grid-cols-[minmax(0,1fr)_8rem_9rem_6rem_minmax(0,1.4fr)] md:items-center [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <span aria-hidden="true" className="text-xs text-dim transition-transform group-open:rotate-90">
            ▶
          </span>
          <span className="truncate" title={c.name}>
            {c.name || '(no name)'}
          </span>
          {c.issues.length > 0 && (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-normal text-amber-800 dark:text-amber-300">
              {c.issues.length} {c.issues.length === 1 ? 'issue' : 'issues'}
            </span>
          )}
        </span>
        <span className="text-sm text-dim md:text-ink">{KIND_NAMES[c.type]}</span>
        <span className="col-span-2 flex items-center gap-2 text-sm md:col-span-1">
          <span className={`h-1.5 w-16 overflow-hidden rounded-full ${TRACK}`} aria-hidden="true">
            <span className={`block h-full rounded-full ${BAR}`} style={{ width: `${filledShare * 100}%` }} />
          </span>
          <span className="tabular-nums">{percent(c.filled, rows)}</span>
          <span className="text-dim md:hidden">filled · {distinctText(c)} distinct</span>
        </span>
        <span className="hidden text-sm tabular-nums md:block">{distinctText(c)}</span>
        <span dir="auto" className="col-span-2 truncate text-sm text-dim md:col-span-1">
          {columnSummary(c)}
        </span>
      </summary>

      <div className="grid gap-6 px-2 pt-1 pb-5 md:grid-cols-2 md:pl-7">
        <div>
          {c.issues.length > 0 && (
            <ul className="mb-4 space-y-2 text-sm/relaxed">
              {c.issues.map((issue, k) => (
                <li key={k} className="flex gap-2">
                  <span aria-hidden="true" className="text-amber-700 dark:text-amber-400">
                    ▲
                  </span>
                  {issue}
                </li>
              ))}
            </ul>
          )}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-dim">Filled</dt>
            <dd className="tabular-nums">
              {formatCount(c.filled)} of {formatCount(rows)}
            </dd>
            <dt className="text-dim">Distinct values</dt>
            <dd className="tabular-nums">{distinctText(c)}</dd>
            {c.min !== undefined && (
              <>
                <dt className="text-dim">Smallest · largest</dt>
                <dd className="tabular-nums">
                  {formatNumber(c.min)} · {formatNumber(c.max!)}
                </dd>
                <dt className="text-dim">Average</dt>
                <dd className="tabular-nums">{formatNumber(c.mean!)}</dd>
              </>
            )}
            {c.earliest && (
              <>
                <dt className="text-dim">Earliest · latest</dt>
                <dd>
                  {c.earliest} · {c.latest}
                </dd>
              </>
            )}
            <dt className="text-dim">Longest value</dt>
            <dd className="tabular-nums">{formatCount(c.longest)} characters</dd>
          </dl>
        </div>
        {repeats && (
          <div>
            <p className="text-sm text-dim">Most common values{c.distinctCapped ? ' (approximate)' : ''}</p>
            <ul className="mt-2 space-y-1.5">
              {c.top.map(({ value, count }) => (
                <li key={value} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm" title={`${value}: ${formatCount(count)} (${percent(count, c.filled)})`}>
                  <span dir="auto" className="truncate">
                    {value.length > 40 ? quote(value) : value}
                  </span>
                  <span className="h-2" aria-hidden="true">
                    <span className={`block h-full rounded-r ${BAR}`} style={{ width: `${(count / c.top[0].count) * 100}%` }} />
                  </span>
                  <span className="text-dim tabular-nums">{formatCount(count)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  )
}

function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** A small customer export with typical problems built in, for trying the tool. */
function sampleFile(): File {
  const plans = ['Pro', 'Free', 'Free', 'Team', 'Pro', 'Free']
  const cities = ['Boston', 'Chicago', 'Austin', 'Denver', 'Seattle', 'Boston ']
  const rows = ['customer_id,name,email,zip,signup_date,plan,monthly_spend,city']
  for (let i = 1; i <= 240; i++) {
    const zip = i % 9 === 0 ? `0${2100 + i}` : String(10000 + i * 37)
    const date = i % 25 === 0 ? `${((i % 12) + 1).toString().padStart(2, '0')}/0${(i % 9) + 1}/2026` : `2026-${((i % 12) + 1).toString().padStart(2, '0')}-${((i % 27) + 1).toString().padStart(2, '0')}`
    const spend = i % 31 === 0 ? 'TBD' : i % 17 === 0 ? '' : ((i * 7.3) % 200).toFixed(2)
    const email = i % 40 === 0 ? '' : `user${i}@example.com`
    rows.push([i, `Customer ${i}`, email, zip, date, plans[i % 6], spend, cities[i % 6]].join(','))
  }
  rows.push(rows[12], rows[57])
  return new File([rows.join('\n')], 'sample-customers.csv', { type: 'text/csv' })
}
