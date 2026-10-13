import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { exampleWorkbook } from './example.ts'
import { inspect, NotChecked, size, type Finding, type Grid, type Part, type Picture, type Report, type Tier } from './inspect.ts'

const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'

/** The ICO's guidance, 31 July 2025: "How do we avoid an accidental breach when personal information is hidden in spreadsheets?" */
const ICO = 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/disclosing-documents-to-the-public-securely/avoid-an-accidental-breach-when-personal-information-is-hidden-in-spreadsheets/'

const ACCEPT = '.xlsx,.xlsm,.xltx,.xltm,.xlam,.xls,.xlsb,.ods,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12,application/vnd.ms-excel'

const SECTIONS: { tier: Tier; heading: string; none: string }[] = [
  { tier: 'data', heading: 'Data that isn’t on screen', none: 'None found in the places this page reads.' },
  { tier: 'people', heading: 'About people, and where the file has been', none: 'None found.' },
  { tier: 'note', heading: 'Worth knowing', none: 'Nothing else to note.' },
]

const STATES: Record<Report['sheets'][number]['state'], string> = { visible: 'Shown', hidden: 'Hidden', veryHidden: 'Very hidden' }
const KINDS: Record<Report['sheets'][number]['kind'], string> = { worksheet: '', chart: 'chart sheet', dialog: 'dialog sheet', macro: 'macro sheet' }
const ROLES: Record<Part['role'], string> = { read: 'Read', shown: 'Shown', structure: 'Structure', 'not-read': 'Not read' }

type Checked = { report: Report; at: Date }

/** Experiment #028: everything in a workbook that isn't on screen, read on this device. Nothing is stored. */
export default function HiddenDataCheck() {
  const [checked, setChecked] = useState<Checked[]>([])
  const [reading, setReading] = useState<{ name: string; label: string; fraction: number } | null>(null)
  const [error, setError] = useState('')
  const [said, setSaid] = useState('')
  const [dragging, setDragging] = useState(false)
  const stop = useRef<AbortController | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const current = checked[checked.length - 1]

  // Each new result gets keyboard and screen-reader focus.
  useEffect(() => {
    if (current) heading.current?.focus()
  }, [current])

  const check = async (file: Blob, name: string, nested = false) => {
    stop.current?.abort()
    const controller = new AbortController()
    stop.current = controller
    setError('')
    setReading({ name, label: 'Opening the file', fraction: 0 })
    setSaid(`Checking ${name}.`)
    try {
      const report = await inspect(file, name, {
        signal: controller.signal,
        progress: (label, fraction) => setReading({ name, label, fraction }),
      })
      if (controller.signal.aborted) return
      setChecked((list) => [...(nested ? list : []), { report, at: new Date() }])
      const data = report.findings.filter((f) => f.tier === 'data').length
      setSaid(`Checked ${name}: ${data ? `${data} ${data === 1 ? 'place holds' : 'places hold'} data that isn’t on screen` : 'no hidden data found in the places this page reads'}.`)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setSaid('Stopped.')
        return
      }
      if (!nested) setChecked([])
      setError(e instanceof NotChecked ? e.message : `This file couldn’t be read: it may be damaged. (${(e as Error)?.name ?? 'Error'})`)
      setSaid(e instanceof NotChecked ? e.message : 'This file couldn’t be read.')
    } finally {
      if (stop.current === controller) {
        stop.current = null
        setReading(null)
      }
    }
  }

  const choose = (file: File | undefined) => {
    if (file) void check(file, file.name)
  }

  return (
    <div className="flex-1">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <section
          aria-labelledby="intro-heading"
          className={`grid grid-cols-1 gap-4 print:hidden ${dragging ? 'rounded-xl outline-2 outline-offset-8 outline-dashed outline-ink' : ''}`}
          onDragOver={(e) => {
            if (!e.dataTransfer.types.includes('Files')) return
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            choose(e.dataTransfer.files[0])
          }}
        >
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            Before a spreadsheet is sent or published, see what’s in it that isn’t on screen: hidden sheets, rows, and columns, data placed far from the rest, pivot-table caches, other files’
            cached copies, comments, names, properties, and more. For each one, it shows what it holds and how to remove it in Excel.
          </p>
          <ul className="grid max-w-prose grid-cols-1 list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
            <li>The workbook stays on this device: it’s read here, in this browser. Nothing is uploaded, and nothing is saved.</li>
            <li>It reads Excel workbooks (.xlsx and .xlsm). No check can prove a file holds nothing it shouldn’t, so the result also says what it couldn’t look inside.</li>
            <li>
              Where a spreadsheet doesn’t need to stay one,{' '}
              <a href={ICO} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
                the ICO’s guidance
              </a>{' '}
              is to convert it to a simpler format such as CSV, which keeps only the cells’ values: no hidden sheets, caches, or comments.
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-2">
            <FileButton label="Choose a workbook" onFile={choose} disabled={reading !== null} />
            <button type="button" className={quiet} disabled={reading !== null} onClick={() => void check(exampleWorkbook(), 'Example - library visits.xlsx')}>
              Try an example
            </button>
            <span className="hidden text-sm text-dim sm:inline">or drop a file here</span>
          </div>
          <details className="max-w-prose text-sm text-dim">
            <summary className={summaryStyle}>What it looks for</summary>
            <div className="grid grid-cols-1 gap-2 pt-3 text-pretty">
              <p>
                <strong className="font-medium text-ink">Everything on the ICO’s list:</strong> hidden sheets, rows, and columns; data in remote rows or columns; active filters; pivot tables,
                charts, and slicers that keep a copy of their data, and cube formulas; links to other files that keep a copy of them; and data models.
              </p>
              <p>
                <strong className="font-medium text-ink">And:</strong> values hidden by a format such as ;;; or by text coloured like its background; drop-down lists; names that hold values;
                comments and notes; headers and footers; Power Query queries and tables typed into them; change history; embedded files; shapes and pictures; text no cell uses; sheets the
                workbook doesn’t list; document properties, printer names, and the folder it was saved in.
              </p>
              <p>The example is a made-up library’s workbook; its people, emails, and phone numbers are invented.</p>
            </div>
          </details>
        </section>

        {reading && (
          <section aria-labelledby="reading-heading" className="grid max-w-prose grid-cols-1 gap-3 print:hidden">
            <h2 id="reading-heading" className="text-lg font-semibold tracking-tight break-words">
              Checking {reading.name}
            </h2>
            <p className="text-sm text-dim">{reading.label}…</p>
            <div className="flex items-center gap-3">
              <progress className="h-2 w-full accent-current" max={1} value={reading.fraction} aria-label="How much of the file has been read" />
              <span className="w-12 text-right text-sm text-dim tabular-nums">{Math.round(reading.fraction * 100)}%</span>
            </div>
            <div>
              <button type="button" className={outline} onClick={() => stop.current?.abort()}>
                Stop
              </button>
            </div>
          </section>
        )}

        {error && !reading && (
          <section aria-labelledby="error-heading" className="grid max-w-prose grid-cols-1 gap-2 rounded-xl border border-amber-700/40 bg-amber-50 p-4 text-amber-950 dark:border-amber-300/30 dark:bg-amber-950/40 dark:text-amber-50">
            <h2 id="error-heading" className="font-semibold">
              Not checked
            </h2>
            <p className="text-sm text-pretty break-words">{error}</p>
          </section>
        )}

        {current && !reading && (
          <ReportView
            key={`${checked.length}:${current.report.name}`}
            report={current.report}
            at={current.at}
            heading={heading}
            outer={checked.length > 1 ? checked[checked.length - 2].report.name : null}
            onBack={() => setChecked((list) => list.slice(0, -1))}
            onEmbedded={(e) => void check(new Blob([e.bytes as BlobPart]), e.name, true)}
            onAnother={() => {
              setChecked([])
              setSaid('Cleared. Choose another workbook.')
            }}
          />
        )}
        <p role="status" className="sr-only">
          {said}
        </p>
      </div>
    </div>
  )
}

function ReportView({
  report,
  at,
  heading,
  outer,
  onBack,
  onEmbedded,
  onAnother,
}: {
  report: Report
  at: Date
  heading: RefObject<HTMLHeadingElement | null>
  outer: string | null
  onBack: () => void
  onEmbedded: (e: NonNullable<Finding['embedded']>) => void
  onAnother: () => void
}) {
  const [withSamples, setWithSamples] = useState(false)
  const article = useRef<HTMLDivElement>(null)
  const byTier = useMemo(() => Object.fromEntries(SECTIONS.map((s) => [s.tier, report.findings.filter((f) => f.tier === s.tier)])) as Record<Tier, Finding[]>, [report])
  const hiddenSheets = report.sheets.filter((s) => s.state !== 'visible').length
  const data = byTier.data.length
  const limits = report.incomplete.length + report.notRead.length

  const print = () => {
    // Folded samples print only when asked for; they're opened for the printout and put back afterwards.
    const folds = [...(article.current?.querySelectorAll<HTMLDetailsElement>('details[data-sample]') ?? [])]
    const before = folds.map((d) => d.open)
    folds.forEach((d) => (d.open = withSamples))
    const restore = () => {
      folds.forEach((d, i) => (d.open = before[i]))
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    window.print()
  }

  return (
    <div ref={article} className="grid grid-cols-1 gap-10">
      <section aria-labelledby="result-heading" className="grid grid-cols-1 gap-4">
        {outer && (
          <div className="print:hidden">
            <button type="button" className={`${quiet} -ml-2`} onClick={onBack}>
              ← Back to {outer}
            </button>
          </div>
        )}
        <p className="hidden text-sm print:block">
          Hidden Data Check record (labs.eugeneyip.net/hidden-data-check), {at.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
        </p>
        <h2 id="result-heading" ref={heading} tabIndex={-1} className="text-2xl font-semibold tracking-tight break-words text-balance outline-none">
          {outer ? 'Embedded workbook: ' : ''}
          {report.name}
        </h2>
        <p className="text-sm text-dim">
          {report.format}, {size(report.size)}, {report.sheets.length} {report.sheets.length === 1 ? 'sheet' : 'sheets'}
          {hiddenSheets ? ` (${hiddenSheets} hidden)` : ''}
        </p>
        <div className="grid max-w-prose grid-cols-1 gap-2 rounded-xl border border-rule p-4">
          <p className="text-lg font-medium text-pretty">
            {data ? `${data} ${data === 1 ? 'place holds' : 'places hold'} data that isn’t on screen.` : 'No hidden data was found in the places this page reads.'}
          </p>
          <p className="text-sm text-pretty text-dim">
            {data ? 'Each is listed below with what it holds and how to remove it. ' : ''}
            {limits ? 'No check can prove a file holds nothing it shouldn’t, and this one couldn’t look everywhere: see “What this check couldn’t do”, below.' : 'No check can prove a file holds nothing it shouldn’t: see “What this check couldn’t do”, below.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 print:hidden">
          <button type="button" className={outline} onClick={print}>
            Print a record
          </button>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={withSamples} onChange={(e) => setWithSamples(e.target.checked)} className="size-4 cursor-pointer accent-current" />
            Include what each place holds
          </label>
          <button type="button" className={quiet} onClick={onAnother}>
            Check another file
          </button>
        </div>
      </section>

      {SECTIONS.map(({ tier, heading: title, none }) => (
        <section key={tier} aria-labelledby={`${tier}-heading`} className="grid grid-cols-1 gap-3">
          <h2 id={`${tier}-heading`} className="text-lg font-semibold tracking-tight">
            {title} <span className="font-normal text-dim tabular-nums">({byTier[tier].length})</span>
          </h2>
          {byTier[tier].length === 0 ? (
            <p className="text-sm text-dim">{none}</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3">
              {byTier[tier].map((f, i) => (
                <li key={`${f.title}:${i}`}>
                  <FindingCard finding={f} withSamples={withSamples} onEmbedded={onEmbedded} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section aria-labelledby="limits-heading" className="grid grid-cols-1 gap-3">
        <h2 id="limits-heading" className="text-lg font-semibold tracking-tight">
          What this check couldn’t do
        </h2>
        <ul className="grid max-w-prose grid-cols-1 list-disc gap-1.5 pl-5 text-sm text-pretty break-words">
          {report.incomplete.map((t, i) => (
            <li key={`i${i}`} className="text-amber-800 dark:text-amber-300">
              {t}
            </li>
          ))}
          {report.notRead.map((t, i) => (
            <li key={`n${i}`}>Not looked inside: {t.charAt(0).toLowerCase() + t.slice(1)}</li>
          ))}
          <li className="text-dim">Formulas aren’t recalculated: values are as the file last saved them.</li>
          <li className="text-dim">Cells under a conditional format or a table style aren’t judged by their colour, which those can change.</li>
        </ul>
      </section>

      <section aria-labelledby="sheets-heading" className="grid grid-cols-1 gap-3">
        <h2 id="sheets-heading" className="text-lg font-semibold tracking-tight">
          The sheets
        </h2>
        <Scroll label="Table of the sheets">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-dim">
              <tr>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Sheet
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Shown?
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-medium">
                  Cells with data
                </th>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Range
                </th>
                <th scope="col" className="py-2 font-medium">
                  Read
                </th>
              </tr>
            </thead>
            <tbody>
              {report.sheets.map((s, i) => (
                <tr key={`${s.name}:${i}`} className="border-t border-rule">
                  <td className="py-2 pr-4 break-words">
                    {s.name}
                    {KINDS[s.kind] && <span className="text-dim"> ({KINDS[s.kind]})</span>}
                  </td>
                  <td className="py-2 pr-4">{STATES[s.state]}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{s.kind === 'chart' ? '' : s.cells.toLocaleString()}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{s.range}</td>
                  <td className="py-2">{s.read === 'all' ? 'All' : s.read === 'part' ? 'In part' : 'Not read'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>
      </section>

      <details className="min-w-0">
        <summary className={summaryStyle}>Every part of the file ({report.parts.length})</summary>
        <div className="pt-3">
          <Scroll label="Table of the file’s parts">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-dim">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Part
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    What it is
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Here
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Size
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.parts.map((p) => (
                  <tr key={p.name} className="border-t border-rule">
                    <td className="py-1.5 pr-4 font-mono text-xs break-all">{p.name}</td>
                    <td className="py-1.5 pr-4">{p.what}</td>
                    <td className="py-1.5 pr-4">{ROLES[p.role]}</td>
                    <td className="py-1.5 text-right whitespace-nowrap tabular-nums">{size(p.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Scroll>
        </div>
      </details>
    </div>
  )
}

function FindingCard({ finding: f, withSamples, onEmbedded }: { finding: Finding; withSamples: boolean; onEmbedded: (e: NonNullable<Finding['embedded']>) => void }) {
  const hasSample = Boolean((f.grid && f.grid.rows.length) || f.list?.length || f.pictures?.length)
  const count = f.grid?.rows.length || f.list?.length || f.pictures?.length || 0
  return (
    <article className="grid grid-cols-1 gap-2 rounded-xl border border-rule p-4 break-inside-avoid">
      <h3 className="font-medium break-words text-pretty">{f.title}</h3>
      <p className="max-w-prose text-sm text-pretty break-words">{f.detail}</p>
      {hasSample && (
        <details data-sample className={withSamples ? '' : 'print:hidden'}>
          <summary className={summaryStyle}>{f.pictures?.length && !f.list?.length && !f.grid ? `Show ${f.pictures.length === 1 ? 'the picture' : `the ${f.pictures.length} pictures`}` : `Show what it holds (${count === 1 ? 'one item' : `${count} items`})`}</summary>
          <div className="grid grid-cols-1 gap-3 pt-3">
            {f.grid && f.grid.rows.length > 0 && <GridTable grid={f.grid} label={`What ${f.title.charAt(0).toLowerCase()}${f.title.slice(1)} holds`} />}
            {f.list && f.list.length > 0 && (
              <ul className="grid grid-cols-1 gap-1 font-mono text-xs break-words">
                {f.list.map((item, i) => (
                  <li key={i} dir="auto">
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {f.pictures && f.pictures.length > 0 && <Pictures pictures={f.pictures} />}
          </div>
        </details>
      )}
      {f.fix && (
        <p className="max-w-prose text-sm text-pretty text-dim">
          <span className="font-medium text-ink">To remove it in Excel: </span>
          {f.fix}
        </p>
      )}
      {f.embedded && (
        <div className="print:hidden">
          <button type="button" className={outline} onClick={() => onEmbedded(f.embedded!)}>
            Check this embedded workbook
          </button>
        </div>
      )}
    </article>
  )
}

function GridTable({ grid, label }: { grid: Grid; label: string }) {
  const rowNumbers = grid.head[0] === ''
  return (
    <Scroll label={label}>
      <table className="text-left font-mono text-xs">
        <thead className="text-dim">
          <tr>
            {grid.head.map((h, i) => (
              <th key={i} scope="col" className="border-b border-rule px-2 py-1 font-medium">
                {h || <span className="sr-only">Row</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.rows.map((r, i) => (
            <tr key={i}>
              {r.map((v, j) =>
                j === 0 && rowNumbers ? (
                  <th key={j} scope="row" className="px-2 py-1 text-right font-normal text-dim">
                    {v}
                  </th>
                ) : (
                  <td key={j} className="max-w-64 px-2 py-1 break-words" dir="auto">
                    {v}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Scroll>
  )
}

function Pictures({ pictures }: { pictures: Picture[] }) {
  // Object URLs only while the pictures are open, released when they close.
  const urls = useMemo(() => pictures.map((p) => URL.createObjectURL(new Blob([p.bytes as BlobPart], { type: p.type }))), [pictures])
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls])
  return (
    <ul className="flex flex-wrap gap-3">
      {pictures.map((p, i) => (
        <li key={i} className="grid min-w-0 grid-cols-1 gap-1">
          <img src={urls[i]} alt={`A picture from the workbook (${p.name})`} className="max-h-48 max-w-full rounded border border-rule bg-white object-contain" />
          <span className="font-mono text-xs text-dim">{p.name}</span>
        </li>
      ))}
    </ul>
  )
}

/** A wide table that scrolls sideways on its own on a phone, reachable and scrollable from the keyboard. A group, not
 * a landmark: there can be one per finding, and landmarks are for finding the page's main parts. */
function Scroll({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} tabIndex={0} className="max-w-full overflow-x-auto rounded-lg">
      {children}
    </div>
  )
}

function FileButton({ label, onFile, disabled }: { label: string; onFile: (file: File | undefined) => void; disabled: boolean }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={primary} disabled={disabled} onClick={() => input.current?.click()}>
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          onFile(file)
        }}
      />
    </>
  )
}
