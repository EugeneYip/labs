import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { exampleReport } from './example.ts'
import {
  accountName,
  addRule,
  addSource,
  defaultEnd,
  emptyReport,
  FILE_TAG,
  inPeriod,
  isIso,
  LIMITS,
  money,
  newId,
  nextYear,
  noteOn,
  pair,
  pairOffers,
  removeAccount,
  removeRule,
  removeSource,
  restore,
  resultsOf,
  ruleTextFor,
  serialize,
  sortBy,
  sortLabel,
  STORAGE_KEY,
  storedRows,
  toCsv,
  norm,
  type Account,
  type Payment,
  type Report,
  type Results,
} from './model.ts'
import { decode, guessLayout, notADownload, parseMoney, readText, type Layout, type RawRow, type ReadResult, type Role } from './read.ts'
import { DEPUTY_EXPENSE, GIFT, GROUPS, hintFor, named as namedLabel, PAPER_BY_KEY, TRANSFER, TYPE_BY_KEY, TYPES, type Direction } from './types.ts'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 sm:h-10`
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const small = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-rule px-3 text-sm hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9'
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'
const card = 'rounded-xl border border-rule p-4'

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dateText = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}
const monthText = (ym: string) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

type Tab = 'report' | 'payments' | 'sort' | 'figures'
const TABS: { id: Tab; label: string }[] = [
  { id: 'report', label: '1. The report' },
  { id: 'payments', label: '2. Payments' },
  { id: 'sort', label: '3. Sort' },
  { id: 'figures', label: '4. Figures' },
]

function stored(): string | null | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return undefined
  }
}

function readSaved(raw: string | null | undefined): Report | null {
  if (!raw) return null
  const r = restore(raw)
  return 'report' in r ? r.report : null
}

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Experiment #034: the money section of a Court of Protection deputy's yearly report, from the bank's downloads. */
export default function DeputyshipAccounts() {
  const [report, setReport] = useState<Report | null>(() => readSaved(stored()))
  const [damaged] = useState(() => {
    const raw = stored()
    return !!raw && readSaved(raw) === null
  })
  const [saved, setSaved] = useState(true)
  const [tab, setTab] = useState<Tab>(() => (report ? 'figures' : 'report'))
  const [said, setSaid] = useState('')
  const [focusPanel, setFocusPanel] = useState(0)
  const panelHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focusPanel) panelHeading.current?.focus()
  }, [focusPanel])

  const say = (message: string) => setSaid((s) => (s === message ? `${message}\u00a0` : message))

  const save = useOtherTabs(STORAGE_KEY, () => {
    const next = readSaved(stored())
    if (next) setReport(next)
  })
  useEffect(() => {
    if (!report) return
    try {
      save(serialize(report))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [report, save])

  /** Every change goes through the latest report, so quick changes never undo each other. */
  const change = (f: (r: Report) => Report) => setReport((r) => (r ? f(r) : r))

  const results = useMemo(() => (report ? resultsOf(report) : null), [report])

  const go = (t: Tab) => {
    setTab(t)
    setFocusPanel((n) => n + 1)
  }

  const begin = (next: Report, message: string, t: Tab) => {
    setReport(next)
    say(message)
    go(t)
  }

  const clearAll = () => {
    if (!window.confirm('Remove this report from this browser? Download a backup first to keep it.')) return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage that can't be reached has nothing to remove.
    }
    setReport(null)
    say('The report was removed from this browser.')
    setTab('report')
    requestAnimationFrame(() => document.getElementById('start-heading')?.focus())
  }

  const openBackup = async (file: File) => {
    if (file.size > 20_000_000) return say(`${file.name} is larger than any backup from this page.`)
    const text = (await file.text()).replace(/^\ufeff/, '')
    const r = restore(text)
    if ('error' in r) return say(`${file.name} can’t be opened: ${r.error}`)
    if (report && !window.confirm(`Replace this report with the one in ${file.name}?`)) return
    begin(r.report, `${file.name} opened: the report for ${dateText(r.report.start)} to ${dateText(r.report.end)}.`, 'figures')
  }

  const notesList = (
    <ul className="grid max-w-prose grid-cols-1 list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
      <li>
        Everything stays in this browser: the files are read here, nothing is uploaded, and the report is saved on this device only. On a shared computer, remove it when you’ve finished (on
        the first step).
      </li>
      <li>
        The page adds up what you’ve sorted and checks it against the statements, as the report does. Which type each payment belongs to is your decision. It doesn’t tell you whether a
        report is right, and it isn’t connected with the Office of the Public Guardian.
      </li>
      <li>The types are the online report’s own and the paper form’s (OPG102, July 2025). If the report you’re filling in shows something different, follow the report.</li>
    </ul>
  )


  return (
    <div className="flex-1">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
        <section aria-labelledby="intro-heading" className="grid grid-cols-1 gap-3 print:hidden">
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            For a property and affairs deputy’s yearly report to the Office of the Public Guardian (England and Wales). Bring in the bank’s downloads of the client’s accounts, sort each payment
            into the report’s types, and get the figures to type into the online report or copy onto the paper form, with the balance checked against the statements and, when it doesn’t
            agree, where it stops adding up.
          </p>
          {report ? (
            <details className="max-w-prose text-sm text-dim">
              <summary className={summaryStyle}>About this page: privacy, and what it does and doesn’t do</summary>
              <div className="pt-3">{notesList}</div>
            </details>
          ) : (
            notesList
          )}
          {damaged && !report && (
            <p className="max-w-prose rounded-xl border border-rule px-4 py-3 text-sm text-pretty" role="status">
              A report saved in this browser couldn’t be read, so the page started empty. It stays saved until you start a report here.
            </p>
          )}
        </section>

        {!report ? (
          <Start
            onStart={(start) => begin({ ...emptyReport(start), accounts: [newAccount(1)] }, 'A new report: add the client’s accounts and their balances.', 'report')}
            onExample={() => begin(exampleReport(), 'An example report opened: a year of a current account, with a savings account.', 'figures')}
            onOpenBackup={openBackup}
          />
        ) : (
          results && (
            <>
              {!saved && <NotSaving>This browser isn’t saving the report, so it will be gone when the page closes. Download a backup (on the first step) to keep it.</NotSaving>}
              <Tabs tab={tab} onChange={setTab} results={results} />
              <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="grid grid-cols-1 gap-6">
                {tab === 'report' && <ReportTab report={report} results={results} change={change} heading={panelHeading} say={say} onClear={clearAll} onOpenBackup={openBackup} onNextYear={(next) => begin(next, `Next year’s report: ${dateText(next.start)} to ${dateText(next.end)}, opening at this year’s closing balances.`, 'report')} />}
                {tab === 'payments' && <PaymentsTab report={report} results={results} change={change} heading={panelHeading} say={say} onGo={go} />}
                {tab === 'sort' && <SortTab report={report} results={results} change={change} heading={panelHeading} say={say} />}
                {tab === 'figures' && <FiguresTab report={report} results={results} heading={panelHeading} onGo={go} />}
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

function newAccount(n: number): Account {
  return { id: newId('a'), name: n === 1 ? 'Current account' : `Account ${n}`, last4: '', main: true, opening: null, closing: null }
}

function Start({ onStart, onExample, onOpenBackup }: { onStart: (start: string) => void; onExample: () => void; onOpenBackup: (f: File) => void }) {
  const [start, setStart] = useState('')
  const valid = isIso(start)
  return (
    <section aria-labelledby="start-heading" className="grid max-w-prose grid-cols-1 gap-4">
      <h2 id="start-heading" tabIndex={-1} className="text-lg font-semibold tracking-tight">
        Start a report
      </h2>
      <form
        className="grid grid-cols-1 gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) onStart(start)
        }}
      >
        <label className="grid grid-cols-1 gap-1 text-sm">
          <span className="font-medium">The first day of the reporting period</span>
          <span className="text-dim">On the OPG’s letter: usually the date of your court order, a year after the last report. Not the tax year.</span>
          <input type="date" className={`${field} w-full sm:w-56`} value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={primary} disabled={!valid}>
            Start the report
          </button>
          <button type="button" className={outline} onClick={onExample}>
            Try an example
          </button>
          <label className={`${outline} focus-within:outline-2 focus-within:outline-offset-2`}>
            Open a backup
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) onOpenBackup(f)
              }}
            />
          </label>
        </div>
      </form>
    </section>
  )
}

function Tabs({ tab, onChange, results }: { tab: Tab; onChange: (t: Tab) => void; results: Results }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const unsorted = results.online.unsorted.count
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = TABS.length
    let k = -1
    if (e.key === 'ArrowRight') k = (i + 1) % n
    else if (e.key === 'ArrowLeft') k = (i - 1 + n) % n
    else if (e.key === 'Home') k = 0
    else if (e.key === 'End') k = n - 1
    if (k < 0) return
    e.preventDefault()
    refs.current[k]?.focus()
    onChange(TABS[k].id)
  }
  return (
    <div role="tablist" aria-label="Steps" className="flex flex-wrap gap-1 border-b border-rule print:hidden">
      {TABS.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => {
            refs.current[i] = el
          }}
          id={`tab-${t.id}`}
          type="button"
          role="tab"
          aria-selected={tab === t.id}
          aria-controls={`panel-${t.id}`}
          tabIndex={tab === t.id ? 0 : -1}
          onKeyDown={(e) => onKey(e, i)}
          onClick={() => onChange(t.id)}
          className={`-mb-px min-h-11 cursor-pointer rounded-t-lg border-b-2 px-3 py-2 text-sm sm:min-h-10 ${tab === t.id ? 'border-ink font-medium text-ink' : 'border-transparent text-dim hover:text-ink'}`}
        >
          {t.label}
          {t.id === 'sort' && unsorted > 0 && <span className="ml-1.5 font-mono text-xs text-dim">({unsorted.toLocaleString('en-GB')} to sort)</span>}
        </button>
      ))}
    </div>
  )
}

function PanelHeading({ heading, children }: { heading: React.RefObject<HTMLHeadingElement | null>; children: ReactNode }) {
  return (
    <h2 ref={heading} tabIndex={-1} className="text-lg font-semibold tracking-tight">
      {children}
    </h2>
  )
}

// --- Money typed in

function MoneyInput({ value, onCommit, label, id }: { value: number | null; onCommit: (v: number | null) => void; label: string; id: string }) {
  const shown = value === null ? '' : (value / 100).toFixed(2)
  const [text, setText] = useState(shown)
  const [bad, setBad] = useState(false)
  useEffect(() => setText(shown), [shown])
  const commit = () => {
    const v = parseMoney(text)
    if (v === null) {
      setBad(false)
      onCommit(null)
    } else if (Number.isNaN(v)) setBad(true)
    else {
      setBad(false)
      onCommit(v)
      setText((v / 100).toFixed(2))
    }
  }
  return (
    <span className="grid grid-cols-1 gap-1">
      <input
        id={id}
        inputMode="decimal"
        aria-label={label}
        aria-invalid={bad || undefined}
        aria-describedby={bad ? `${id}-bad` : undefined}
        className={`${field} w-full font-mono tabular-nums`}
        value={text}
        placeholder="0.00"
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
      />
      {bad && (
        <span id={`${id}-bad`} className="text-xs text-red-700 dark:text-red-300">
          Not an amount: write it like 1234.56 (a minus for an overdrawn account).
        </span>
      )}
    </span>
  )
}

// --- 1. The report

function ReportTab({
  report,
  results,
  change,
  heading,
  say,
  onClear,
  onOpenBackup,
  onNextYear,
}: {
  report: Report
  results: Results
  change: (f: (r: Report) => Report) => void
  heading: React.RefObject<HTMLHeadingElement | null>
  say: (m: string) => void
  onClear: () => void
  onOpenBackup: (f: File) => void
  onNextYear: (next: Report) => void
}) {
  const setAccount = (id: string, patch: Partial<Account>) => change((r) => ({ ...r, accounts: r.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))
  const counts = new Map<string, number>()
  for (const p of results.payments) counts.set(p.account, (counts.get(p.account) ?? 0) + 1)
  const backup = () => {
    const text = JSON.stringify({ app: FILE_TAG, saved: new Date().toISOString(), ...JSON.parse(serialize(report)) })
    download(text, `deputyship-accounts-${report.start}-to-${report.end}.json`, 'application/json')
    say('Backup downloaded.')
  }
  return (
    <>
      <PanelHeading heading={heading}>The report</PanelHeading>
      <section aria-labelledby="period-heading" className="grid grid-cols-1 gap-3">
        <h3 id="period-heading" className="font-medium">
          The reporting period
        </h3>
        <p className="max-w-prose text-sm text-pretty text-dim">From the OPG’s letter. It’s usually 12 months from the date of the court order, “not the tax year”. Both days are included.</p>
        <div className="grid grid-cols-1 items-end gap-3 sm:flex sm:flex-wrap">
          <label className="grid grid-cols-1 gap-1 text-sm">
            <span>From</span>
            <input
              type="date"
              className={`${field} w-full sm:w-48`}
              value={report.start}
              onChange={(e) => {
                const v = e.target.value
                if (isIso(v)) change((r) => ({ ...r, start: v, end: r.end < v ? defaultEnd(v) : r.end }))
              }}
            />
          </label>
          <label className="grid grid-cols-1 gap-1 text-sm">
            <span>To</span>
            <input
              type="date"
              className={`${field} w-full sm:w-48`}
              value={report.end}
              min={report.start}
              onChange={(e) => {
                const v = e.target.value
                if (isIso(v) && v >= report.start) change((r) => ({ ...r, end: v }))
              }}
            />
          </label>
          {report.end !== defaultEnd(report.start) && (
            <button type="button" className={small} onClick={() => change((r) => ({ ...r, end: defaultEnd(r.start) }))}>
              A year from the start ({dateText(defaultEnd(report.start))})
            </button>
          )}
        </div>
        <label className="grid max-w-md grid-cols-1 gap-1 text-sm">
          <span>How to name the client in this page’s labels (optional)</span>
          <span className="text-dim">A first name or “Mum” is enough; it’s only used here, as the online report uses the client’s name.</span>
          <input className={field} value={report.client} maxLength={40} onChange={(e) => change((r) => ({ ...r, client: e.target.value }))} placeholder="the client" />
        </label>
      </section>

      <section aria-labelledby="accounts-heading" className="grid grid-cols-1 gap-3">
        <h3 id="accounts-heading" tabIndex={-1} className="font-medium">
          The client’s accounts
        </h3>
        <p className="max-w-prose text-sm text-pretty text-dim">
          Each account the report covers, with the balances on its statements at the start and the end of the period. Add a savings account too if money moved between it and another account:
          the transfers are then shown apart, as the report asks. An account can have balances only, with no download, if its only movements are transfers.
        </p>
        <ul className="grid grid-cols-1 gap-3">
          {report.accounts.map((a, i) => (
            <li key={a.id} className={`${card} grid grid-cols-1 gap-3`}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
                <label className="grid grid-cols-1 gap-1 text-sm">
                  <span>Name</span>
                  <input className={field} value={a.name} maxLength={60} onChange={(e) => setAccount(a.id, { name: e.target.value })} />
                </label>
                <label className="grid grid-cols-1 gap-1 text-sm">
                  <span>Last four digits of the account number</span>
                  <input className={`${field} font-mono`} inputMode="numeric" value={a.last4} maxLength={4} onChange={(e) => setAccount(a.id, { last4: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="grid grid-cols-1 gap-1 text-sm" htmlFor={`open-${a.id}`}>
                  <span>Opening balance on the statement (£), at {dateText(report.start)}</span>
                  <MoneyInput id={`open-${a.id}`} label={`Opening balance of ${accountName(a)}`} value={a.opening} onCommit={(v) => setAccount(a.id, { opening: v })} />
                </label>
                <label className="grid grid-cols-1 gap-1 text-sm" htmlFor={`close-${a.id}`}>
                  <span>Closing balance on the statement (£), at {dateText(report.end)}</span>
                  <MoneyInput id={`close-${a.id}`} label={`Closing balance of ${accountName(a)}`} value={a.closing} onCommit={(v) => setAccount(a.id, { closing: v })} />
                </label>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-1 size-4" checked={a.main} onChange={(e) => setAccount(a.id, { main: e.target.checked })} />
                <span>
                  Used for everyday money (on the paper form, a section 5 of its own). Savings accounts used only for saving go in section 6 instead.
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-2 text-sm text-dim">
                <span>{plural(counts.get(a.id) ?? 0, 'payment')}</span>
                {report.accounts.length > 1 && (
                  <button
                    type="button"
                    className={small}
                    onClick={() => {
                      if ((counts.get(a.id) ?? 0) && !window.confirm(`Remove ${accountName(a)} and its ${plural(counts.get(a.id) ?? 0, 'payment')}?`)) return
                      change((r) => removeAccount(r, a.id))
                      say(`${accountName(a)} removed.`)
                      requestAnimationFrame(() => document.getElementById('accounts-heading')?.focus())
                    }}
                  >
                    Remove this account
                  </button>
                )}
                <span className="sr-only">Account {i + 1}</span>
              </div>
            </li>
          ))}
        </ul>
        <div>
          <button
            type="button"
            className={outline}
            disabled={report.accounts.length >= LIMITS.accounts}
            onClick={() => {
              change((r) => ({ ...r, accounts: [...r.accounts, newAccount(r.accounts.length + 1)] }))
              say('An account added.')
            }}
          >
            Add an account
          </button>
        </div>
      </section>

      <section aria-labelledby="keep-heading" className="grid grid-cols-1 gap-3">
        <h3 id="keep-heading" className="font-medium">
          Keeping the report
        </h3>
        <p className="max-w-prose text-sm text-pretty text-dim">
          It’s saved in this browser after every change. A browser can clear what it saves (Safari after about a week without a visit), so download a backup to keep it, or to carry on on
          another computer. The backup holds the client’s payments: keep it as safely as the statements.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={outline} onClick={backup}>
            Download a backup
          </button>
          <label className={`${outline} focus-within:outline-2 focus-within:outline-offset-2`}>
            Open a backup
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) onOpenBackup(f)
              }}
            />
          </label>
          <button
            type="button"
            className={outline}
            onClick={() => {
              if (!window.confirm('Start next year’s report? It opens at this year’s closing balances with the same rules; this report is replaced in this browser, so download a backup first to keep it.')) return
              onNextYear(nextYear(report))
            }}
          >
            Start next year’s report
          </button>
          <button type="button" className={quiet} onClick={onClear}>
            Remove the report from this browser
          </button>
        </div>
      </section>
    </>
  )
}

// --- 2. Payments

const ROLE_NAMES: [Role, string][] = [
  ['ignore', 'Not used'],
  ['date', 'Date'],
  ['description', 'Description'],
  ['amount', 'Amount (in and out)'],
  ['in', 'Paid in'],
  ['out', 'Paid out'],
  ['balance', 'Balance'],
  ['id', 'Bank’s reference'],
]

interface Pending {
  key: string
  account: string
  name: string
  text: string
  result: ReadResult
  layout?: Layout
}

function PaymentsTab({
  report,
  results,
  change,
  heading,
  say,
  onGo,
}: {
  report: Report
  results: Results
  change: (f: (r: Report) => Report) => void
  heading: React.RefObject<HTMLHeadingElement | null>
  say: (m: string) => void
  onGo: (t: Tab) => void
}) {
  const [pending, setPending] = useState<Pending[]>([])
  const [notes, setNotes] = useState<{ account: string; text: string }[]>([])
  const [paste, setPaste] = useState<{ account: string; text: string } | null>(null)

  const readFiles = async (account: string, files: FileList) => {
    const list: Pending[] = []
    for (const f of [...files]) {
      if (f.size > 10_000_000) {
        setNotes((n) => [...n, { account, text: `${f.name} is larger than 10 MB: a bank download for a year is far smaller. Was it the right file?` }])
        continue
      }
      const bytes = new Uint8Array(await f.arrayBuffer())
      const wrong = notADownload(bytes)
      if (wrong) {
        setNotes((n) => [...n, { account, text: `${f.name}: ${wrong}` }])
        continue
      }
      const { text } = decode(bytes)
      const result = readText(text)
      list.push({ key: newId('p'), account, name: f.name, text, result, layout: result.layout })
    }
    setPending((p) => [...p, ...list])
    if (list.length) say(`${plural(list.length, 'file')} read: check how each was read, then add it.`)
  }

  const add = (p: Pending, rows: RawRow[]) => {
    let summary = ''
    change((r) => {
      if (storedRows(r) + rows.length > LIMITS.rows) {
        summary = `Not added: this page keeps at most ${LIMITS.rows.toLocaleString('en-GB')} rows.`
        return r
      }
      const a = addSource(r, p.account, p.name, rows)
      const parts = [`${plural(a.added, 'new payment')}`]
      if (a.already) parts.push(`${plural(a.already, 'payment')} already here from another download`)
      if (a.outside) parts.push(`${plural(a.outside, 'payment')} outside the period (kept, not counted)`)
      summary = `${p.name}: ${parts.join(', ')}.`
      if (a.newInOverlap.length) summary += ` ${plural(a.newInOverlap.length, 'payment')} on days another download already covers didn’t match its payments: if it’s the same account in another format, remove one of the two.`
      return a.report
    })
    setPending((list) => list.filter((x) => x.key !== p.key))
    setTimeout(() => {
      if (summary) {
        setNotes((n) => [...n, { account: p.account, text: summary }])
        say(summary)
      }
      focusAccount(p.account)
    }, 0)
  }
  /** After the control that had focus goes (a preview added or cancelled, a download removed): the account's heading. */
  const focusAccount = (id: string) => requestAnimationFrame(() => document.getElementById(`acc-${id}`)?.focus())

  return (
    <>
      <PanelHeading heading={heading}>Payments</PanelHeading>
      <details className="max-w-prose text-sm text-dim">
        <summary className={summaryStyle}>Getting a download from online banking</summary>
        <div className="grid grid-cols-1 gap-2 pt-3 text-pretty">
          <p>
            Most banks offer the account’s transactions as a file: look for “Export”, “Download transactions”, or “Download statement” on the account’s page, and choose CSV (a spreadsheet file),
            or Quicken (QIF) or Microsoft Money (OFX) if CSV isn’t offered. Some banks give only a few months, or a few hundred payments, at a time: download the year in pieces. Overlapping
            pieces are fine; payments in two downloads are counted once.
          </p>
          <p>For months you have only on paper, type the payments in below.</p>
        </div>
      </details>
      {report.accounts.map((a) => {
        const check = results.accounts.find((c) => c.account.id === a.id)!
        const sources = report.sources.filter((s) => s.account === a.id)
        const typed = sources.find((s) => s.typed)
        return (
          <section key={a.id} aria-labelledby={`acc-${a.id}`} className={`${card} grid grid-cols-1 gap-3`}>
            <h3 id={`acc-${a.id}`} tabIndex={-1} className="font-medium">
              {accountName(a)}
            </h3>
            <p className="text-sm text-dim">
              {plural(check.inPeriod.count, 'payment')} in the period: {money(check.inPeriod.moneyIn)} in, {money(check.inPeriod.moneyOut)} out.
              {check.before + check.after > 0 && ` ${plural(check.before + check.after, 'payment')} outside it, not counted.`}
            </p>
            {sources.filter((s) => !s.typed).length > 0 && (
              <ul className="grid grid-cols-1 gap-1 text-sm">
                {sources
                  .filter((s) => !s.typed)
                  .map((s) => {
                    const dates = s.rows.map((r) => r.date).sort()
                    return (
                      <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="min-w-0 break-words">{s.name}</span>
                        <span className="text-dim">
                          {plural(s.rows.length, 'row')}
                          {dates.length ? `, ${dateText(dates[0])} to ${dateText(dates[dates.length - 1])}` : ''}
                        </span>
                        <button
                          type="button"
                          className={small}
                          onClick={() => {
                            change((r) => removeSource(r, s.id))
                            say(`${s.name} removed.`)
                            focusAccount(a.id)
                          }}
                        >
                          Remove
                        </button>
                      </li>
                    )
                  })}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <label className={`${outline} focus-within:outline-2 focus-within:outline-offset-2`}>
                Add downloads…
                <input
                  type="file"
                  multiple
                  accept=".csv,.txt,.tsv,.qif,.ofx,.qfx,text/csv,text/plain"
                  className="sr-only"
                  onChange={(e) => {
                    const files = e.target.files
                    if (files?.length) void readFiles(a.id, files)
                    e.target.value = ''
                  }}
                />
              </label>
              <button type="button" className={outline} onClick={() => setPaste({ account: a.id, text: '' })}>
                Paste rows
              </button>
            </div>
            {paste?.account === a.id && (
              <div className="grid grid-cols-1 gap-2">
                <label className="grid grid-cols-1 gap-1 text-sm">
                  <span>Rows copied from online banking or a spreadsheet, with the column names if there are any</span>
                  <textarea className={`${control} min-h-32 py-2 font-mono`} value={paste.text} onChange={(e) => setPaste({ account: a.id, text: e.target.value })} />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={primary}
                    disabled={!paste.text.trim()}
                    onClick={() => {
                      const result = readText(paste.text)
                      setPending((p) => [...p, { key: newId('p'), account: a.id, name: 'Pasted rows', text: paste.text, result, layout: result.layout }])
                      setPaste(null)
                    }}
                  >
                    Read them
                  </button>
                  <button type="button" className={quiet} onClick={() => setPaste(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {pending
              .filter((p) => p.account === a.id)
              .map((p) => (
                <Preview
                  key={p.key}
                  pending={p}
                  report={report}
                  onLayout={(layout) => setPending((list) => list.map((x) => (x.key === p.key ? { ...x, layout, result: readText(x.text, layout) } : x)))}
                  onAdd={(rows) => add(p, rows)}
                  onCancel={() => {
                    setPending((list) => list.filter((x) => x.key !== p.key))
                    focusAccount(a.id)
                  }}
                />
              ))}
            {notes
              .filter((n) => n.account === a.id)
              .map((n, i) => (
                <p key={i} className="max-w-prose text-sm text-pretty" role="status">
                  {n.text}
                </p>
              ))}
            <TypeIn account={a} typed={typed} report={report} change={change} say={say} />
          </section>
        )
      })}
      <div>
        <button type="button" className={primary} onClick={() => onGo('sort')}>
          Next: sort the payments
        </button>
      </div>
    </>
  )
}

function Preview({ pending, report, onLayout, onAdd, onCancel }: { pending: Pending; report: Report; onLayout: (l: Layout) => void; onAdd: (rows: RawRow[]) => void; onCancel: () => void }) {
  const { result } = pending
  const rows = result.rows
  const moneyIn = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0)
  const moneyOut = rows.filter((r) => r.amount < 0).reduce((s, r) => s - r.amount, 0)
  const dates = rows.map((r) => r.date).sort()
  const inside = rows.filter((r) => r.date >= report.start && r.date <= report.end).length
  const kind = { csv: 'a spreadsheet file (CSV)', qif: 'a Quicken file (QIF)', ofx: 'a Microsoft Money file (OFX)', santander: 'Santander’s text download' }[result.format]
  const layout = pending.layout
  const header = result.table && layout && layout.header !== null ? result.table.rows[layout.header] : null
  const width = result.table ? Math.max(0, ...result.table.rows.slice(0, 40).map((r) => r.length)) : 0
  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-dim/50 p-4" role="group" aria-label={`How ${pending.name} was read`}>
      <p className="text-sm text-pretty">
        <span className="font-medium">{pending.name}</span>, read as {kind}: {plural(rows.length, 'payment')}
        {dates.length ? `, ${dateText(dates[0])} to ${dateText(dates[dates.length - 1])}` : ''}; {money(moneyIn)} in, {money(moneyOut)} out.
        {inside < rows.length && ` ${plural(rows.length - inside, 'payment')} outside the reporting period (kept, not counted).`}
      </p>
      {result.notes.map((n, i) => (
        <p key={i} className="text-sm text-dim">
          {n}
        </p>
      ))}
      {result.cut && <p className="text-sm text-red-700 dark:text-red-300">The file is longer than this page reads ({'50,000'} rows): only the start was read.</p>}
      {rows.length > 0 && (
        <div className="grid grid-cols-1 gap-1">
          <p className="text-sm text-dim">The first payments, as read:</p>
          <ul className="grid grid-cols-1 gap-1 text-sm">
            {rows.slice(0, 5).map((r, i) => (
              <li key={i} className="grid grid-cols-1 border-t border-rule pt-1">
                <span className="flex flex-wrap gap-x-3">
                  <span className="whitespace-nowrap">{dateText(r.date)}</span>
                  <span className="font-mono whitespace-nowrap tabular-nums">
                    {r.amount > 0 ? `${money(r.amount)} in` : `${money(-r.amount)} out`}
                  </span>
                  {r.balance !== null && <span className="whitespace-nowrap text-dim">balance {money(r.balance)}</span>}
                </span>
                <span className="break-words">{r.description || '(no description)'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.problems.length > 0 && (
        <details className="text-sm">
          <summary className={summaryStyle}>{plural(result.problems.length, 'row')} not read</summary>
          <ul className="grid grid-cols-1 gap-1 pt-2 text-dim">
            {result.problems.slice(0, 50).map((p, i) => (
              <li key={i} className="break-words">
                Line {p.line}: {p.why}. <span className="font-mono text-xs">{p.text}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      {result.table && layout && (
        <details className="text-sm" open={rows.length === 0}>
          <summary className={summaryStyle}>The columns {rows.length === 0 ? '(nothing was read: say which column is which)' : ''}</summary>
          <div className="grid grid-cols-1 gap-3 pt-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: width }, (_, c) => (
                <label key={c} className="grid grid-cols-1 gap-1">
                  <span className="text-dim">
                    Column {c + 1}
                    {header?.[c]?.trim() ? `: ${header[c].trim()}` : ''}
                  </span>
                  <select
                    className={field}
                    value={layout.roles[c] ?? 'ignore'}
                    onChange={(e) => {
                      const roles = Array.from({ length: width }, (_, k) => layout.roles[k] ?? 'ignore')
                      roles[c] = e.target.value as Role
                      onLayout({ ...layout, roles })
                    }}
                  >
                    {ROLE_NAMES.map(([role, label]) => (
                      <option key={role} value={role}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4" checked={!layout.dayFirst} onChange={(e) => onLayout({ ...layout, dayFirst: !e.target.checked })} />
                Dates are month first (04/13/2026)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="size-4" checked={layout.flip} onChange={(e) => onLayout({ ...layout, flip: e.target.checked })} />
                Money out is shown as a positive amount
              </label>
              <button type="button" className={small} onClick={() => onLayout(guessLayout(result.table!))}>
                Guess again
              </button>
            </div>
          </div>
        </details>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={primary} disabled={!rows.length} onClick={() => onAdd(rows)}>
          Add {plural(rows.length, 'payment')}
        </button>
        <button type="button" className={quiet} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function TypeIn({ account, typed, report, change, say }: { account: Account; typed: Report['sources'][number] | undefined; report: Report; change: (f: (r: Report) => Report) => void; say: (m: string) => void }) {
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [why, setWhy] = useState('')
  const dateRef = useRef<HTMLInputElement>(null)
  const submit = () => {
    const i = parseMoney(amountIn)
    const o = parseMoney(amountOut)
    if (!isIso(date)) return setWhy('Give the date.')
    if ((i === null) === (o === null)) return setWhy('Give an amount paid in or paid out (one of the two).')
    const v = i === null ? o! : i
    if (Number.isNaN(v) || v === 0) return setWhy('Write the amount like 12.34.')
    const amount = i === null ? -Math.abs(v) : Math.abs(v)
    const row: RawRow = { date, description: description.trim().slice(0, LIMITS.text) || '(typed in)', amount, balance: null, line: (typed?.rows.length ?? 0) + 1, bankId: `typed:${newId('t')}` }
    change((r) => {
      const existing = r.sources.find((s) => s.account === account.id && s.typed)
      if (existing) return { ...r, sources: r.sources.map((s) => (s.id === existing.id ? { ...s, rows: [...s.rows, row] } : s)) }
      return addSource(r, account.id, 'Typed in', [row], true).report
    })
    setWhy('')
    setDescription('')
    setAmountIn('')
    setAmountOut('')
    say(`Added: ${dateText(date)}, ${money(amount)}${inPeriod(report, date) ? '' : ' (outside the period, so not counted)'}.`)
    dateRef.current?.focus()
  }
  return (
    <details className="text-sm" open={!!typed?.rows.length}>
      <summary className={summaryStyle}>Type in payments from a paper statement{typed?.rows.length ? ` (${typed.rows.length} typed in)` : ''}</summary>
      <div className="grid grid-cols-1 gap-3 pt-3">
        <form
          className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_8rem_8rem_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label className="grid grid-cols-1 gap-1">
            <span>Date</span>
            <input ref={dateRef} type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="grid grid-cols-1 gap-1">
            <span>Description</span>
            <input className={field} value={description} maxLength={LIMITS.text} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label className="grid grid-cols-1 gap-1">
            <span>Paid in (£)</span>
            <input className={`${field} font-mono`} inputMode="decimal" value={amountIn} onChange={(e) => setAmountIn(e.target.value)} />
          </label>
          <label className="grid grid-cols-1 gap-1">
            <span>Paid out (£)</span>
            <input className={`${field} font-mono`} inputMode="decimal" value={amountOut} onChange={(e) => setAmountOut(e.target.value)} />
          </label>
          <button type="submit" className={outline}>
            Add
          </button>
        </form>
        {why && (
          <p className="text-red-700 dark:text-red-300" role="alert">
            {why}
          </p>
        )}
        {typed && typed.rows.length > 0 && (
          <ul className="grid grid-cols-1 gap-1">
            {typed.rows.map((r) => (
              <li key={r.bankId} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="whitespace-nowrap">{dateText(r.date)}</span>
                <span className="min-w-0 break-words">{r.description}</span>
                <span className="font-mono tabular-nums">{money(r.amount)}</span>
                <button
                  type="button"
                  className={small}
                  aria-label={`Remove the typed payment of ${money(r.amount)} on ${dateText(r.date)}`}
                  onClick={() => {
                    change((rep) => ({ ...rep, sources: rep.sources.map((s) => (s.id === typed.id ? { ...s, rows: s.rows.filter((x) => x.bankId !== r.bankId) } : s)).filter((s) => !s.typed || s.rows.length) }))
                    say('Typed payment removed.')
                    dateRef.current?.focus()
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}

// --- 3. Sorting

function encode(c: string | undefined, o: string | undefined): string {
  if (!c) return ''
  return c === TRANSFER ? `transfer:${o ?? ''}` : c
}

function decodeChoice(v: string): { c: string; o?: string } | null {
  if (!v) return null
  if (v.startsWith('transfer:')) return { c: TRANSFER, o: v.slice(9) }
  return { c: v }
}

function TypeSelect({ dir, value, onChange, report, account, label, id }: { dir: Direction; value: string; onChange: (v: string) => void; report: Report; account: string | null; label: string; id?: string }) {
  const named = (l: string) => namedLabel(l, report.client)
  const others = report.accounts.filter((a) => a.id !== account)
  return (
    <select id={id} aria-label={label} className={`${field} w-full`} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Not sorted yet</option>
      {GROUPS.filter((g) => g.dir === dir).map((g) => (
        <optgroup key={g.key} label={`${dir === 'in' ? 'Money in' : 'Money out'}: ${named(g.label)}`}>
          {TYPES.filter((t) => t.group === g.key).map((t) => (
            <option key={t.key} value={t.key}>
              {named(t.label)}
            </option>
          ))}
        </optgroup>
      ))}
      {dir === 'out' && (
        <optgroup label="Sections of their own in the report">
          <option value={GIFT}>Gift</option>
          <option value={DEPUTY_EXPENSE}>Deputy expense</option>
        </optgroup>
      )}
      {others.length > 0 && (
        <optgroup label={dir === 'out' ? 'Moved to another of the client’s accounts in this report' : 'Moved in from another of the client’s accounts in this report'}>
          {others.map((a) => (
            <option key={a.id} value={`transfer:${a.id}`}>
              {dir === 'out' ? 'To' : 'From'} {accountName(a)}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  )
}

interface Group {
  key: string
  dir: Direction
  text: string
  sample: string
  payments: Payment[]
  total: number
}

function SortTab({ report, results, change, heading, say }: { report: Report; results: Results; change: (f: (r: Report) => Report) => void; heading: React.RefObject<HTMLHeadingElement | null>; say: (m: string) => void }) {
  const [view, setView] = useState<'groups' | 'all'>('groups')
  const [shownGroups, setShownGroups] = useState(30)
  const named = (l: string) => namedLabel(l, report.client)
  const inside = results.payments.filter((p) => inPeriod(report, p.date) && p.amount !== 0)
  const unsorted = inside.filter((p) => !results.sorts.get(p.id))
  const groups = useMemo(() => {
    const map = new Map<string, Group>()
    for (const p of unsorted) {
      const dir: Direction = p.amount > 0 ? 'in' : 'out'
      const text = ruleTextFor(p.description) || norm(p.description) || '(no description)'
      const key = `${dir}|${text}`
      const g = map.get(key) ?? { key, dir, text, sample: p.description, payments: [], total: 0 }
      g.payments.push(p)
      g.total += Math.abs(p.amount)
      map.set(key, g)
    }
    return [...map.values()].sort((a, b) => b.payments.length - a.payments.length || b.total - a.total)
  }, [unsorted])
  const offers = useMemo(() => pairOffers(report, results.payments, results.sorts), [report, results])
  const likely = offers.filter((o) => o.likely)
  const listRef = useRef<HTMLUListElement>(null)
  const pairsRef = useRef<HTMLHeadingElement>(null)
  const statusRef = useRef<HTMLParagraphElement>(null)
  const [refocus, setRefocus] = useState<{ n: number; where: 'groups' | 'pairs' } | null>(null)
  // A sort that removes the focused control (the payee's card, a payment, a pair) moves focus on: to the first payee
  // still to sort, or the pairs' heading, or the count at the top when nothing is left there.
  useEffect(() => {
    if (!refocus) return
    if (refocus.where === 'pairs') {
      const next = document.querySelector<HTMLButtonElement>('[data-pair-button]')
      ;(next ?? pairsRef.current ?? statusRef.current)?.focus()
      return
    }
    const first = listRef.current?.querySelector<HTMLInputElement>('input[data-rule-text]')
    ;(first ?? statusRef.current)?.focus()
  }, [refocus])
  const after = (where: 'groups' | 'pairs') => setRefocus((r) => ({ n: (r?.n ?? 0) + 1, where }))

  return (
    <>
      <PanelHeading heading={heading}>Sort the payments</PanelHeading>
      <p ref={statusRef} tabIndex={-1} className="max-w-prose text-sm text-pretty text-dim">
        {unsorted.length
          ? `${plural(unsorted.length, 'payment')} in the period still to sort, of ${inside.length.toLocaleString('en-GB')}.`
          : `All ${plural(inside.length, 'payment')} in the period are sorted.`}{' '}
        Sorting a payee sorts every payment with those words in its description, money in or out as it is, in later downloads too; each payment can still be changed by hand.
      </p>
      {offers.length > 0 && (
        <section aria-labelledby="pairs-heading" className={`${card} grid grid-cols-1 gap-3`}>
          <h3 id="pairs-heading" ref={pairsRef} tabIndex={-1} className="font-medium">
            Transfers between the client’s accounts
          </h3>
          <p className="max-w-prose text-sm text-pretty text-dim">
            The same amount out of one account and into another within a week. Paired, they’re shown apart from money in and out, as the report asks, and counted once.
          </p>
          {likely.length > 1 && (
            <div>
              <button
                type="button"
                className={outline}
                onClick={() => {
                  change((r) => likely.reduce((acc, o) => pair(acc, o.out, o.into, results.byId), r))
                  say(`${plural(likely.length, 'transfer')} paired.`)
                  after('pairs')
                }}
              >
                Pair the {plural(likely.length, 'likely one')}
              </button>
            </div>
          )}
          <ul className="grid grid-cols-1 gap-2">
            {offers.slice(0, 50).map((o) => {
              const a = results.byId.get(o.out)!
              const b = results.byId.get(o.into)!
              const from = report.accounts.find((x) => x.id === a.account)!
              const to = report.accounts.find((x) => x.id === b.account)!
              return (
                <li key={o.out} className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                  <span className="text-pretty">
                    <span className="font-mono tabular-nums">{money(-a.amount)}</span> out of {accountName(from)} on {dateText(a.date)} ({a.description || 'no description'}), into {accountName(to)} on{' '}
                    {dateText(b.date)} ({b.description || 'no description'}){o.likely ? '' : ': check it’s a transfer'}
                  </span>
                  <button
                    type="button"
                    className={small}
                    data-pair-button
                    onClick={() => {
                      change((r) => pair(r, o.out, o.into, results.byId))
                      say(`Paired: ${money(-a.amount)} from ${accountName(from)} to ${accountName(to)}.`)
                      after('pairs')
                    }}
                  >
                    Pair them
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
      <div role="group" aria-label="Show" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={view === 'groups'} className={view === 'groups' ? primary : outline} onClick={() => setView('groups')}>
          Still to sort, by payee
        </button>
        <button type="button" aria-pressed={view === 'all'} className={view === 'all' ? primary : outline} onClick={() => setView('all')}>
          Every payment
        </button>
      </div>
      {view === 'groups' ? (
        groups.length ? (
          <ul ref={listRef} className="grid grid-cols-1 gap-3">
            {groups.slice(0, shownGroups).map((g) => (
              <GroupCard key={g.key} group={g} report={report} results={results} change={change} say={say} named={named} onSorted={() => after('groups')} />
            ))}
            {groups.length > shownGroups && (
              <li>
                <button type="button" className={outline} onClick={() => setShownGroups((n) => n + 30)}>
                  Show more payees ({groups.length - shownGroups} more)
                </button>
              </li>
            )}
          </ul>
        ) : (
          <p className="text-sm">Nothing left to sort.</p>
        )
      ) : (
        <PaymentList report={report} results={results} change={change} say={say} named={named} onGone={() => statusRef.current?.focus()} />
      )}
      {report.rules.length > 0 && <Rules report={report} results={results} change={change} say={say} named={named} />}
    </>
  )
}

function GroupCard({ group, report, results, change, say, named, onSorted }: { group: Group; report: Report; results: Results; change: (f: (r: Report) => Report) => void; say: (m: string) => void; named: (l: string) => string; onSorted: () => void }) {
  const hint = hintFor(group.sample, group.dir)
  const [choice, setChoice] = useState('')
  const [text, setText] = useState(group.text)
  const t = norm(text)
  const matching = t ? results.payments.filter((p) => inPeriod(report, p.date) && (p.amount > 0 ? 'in' : 'out') === group.dir && !results.sorts.get(p.id) && norm(p.description).includes(t)).length : 0
  const dates = group.payments.map((p) => p.date).sort()
  const id = `g-${group.key.replace(/[^a-z0-9]/gi, '').slice(0, 30)}-${group.payments[0].id.slice(-6)}`
  const apply = () => {
    const d = decodeChoice(choice)
    if (!d || !t) return
    change((r) => addRule(r, { text, dir: group.dir, c: d.c, ...(d.o ? { o: d.o } : {}) }))
    say(`${plural(matching, 'payment')} sorted as ${sortLabel(d.c, d.o, report, named)}.`)
    onSorted()
  }
  return (
    <li className={`${card} grid grid-cols-1 gap-3`}>
      <div className="grid grid-cols-1 gap-1">
        <h3 className="font-medium break-words">{group.sample}</h3>
        <p className="text-sm text-dim">
          {plural(group.payments.length, 'payment')} {group.dir === 'in' ? 'in' : 'out'}, {money(group.total)}
          {dates.length > 1 ? `, ${dateText(dates[0])} to ${dateText(dates[dates.length - 1])}` : `, ${dateText(dates[0])}`}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="grid grid-cols-1 gap-1 text-sm" htmlFor={`${id}-text`}>
          <span>Every payment {group.dir === 'in' ? 'in' : 'out'} whose description has</span>
          <input id={`${id}-text`} data-rule-text className={`${field} font-mono`} value={text} onChange={(e) => setText(e.target.value)} />
          <span className="text-dim">{t ? `${plural(matching, 'payment')} still to sort match` : 'Give some words to match'}</span>
        </label>
        <label className="grid grid-cols-1 gap-1 text-sm" htmlFor={`${id}-type`}>
          <span>Is</span>
          <TypeSelect id={`${id}-type`} dir={group.dir} value={choice} onChange={setChoice} report={report} account={group.payments.every((p) => p.account === group.payments[0].account) ? group.payments[0].account : null} label={`Type for ${group.sample}`} />
          {hint && !choice && (
            <span className="flex flex-wrap items-center gap-2 text-dim">
              The description says: {named(TYPE_BY_KEY.get(hint)!.label)}.
              <button type="button" className={small} onClick={() => setChoice(hint)}>
                Choose it
              </button>
            </span>
          )}
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={primary} disabled={!choice || !matching} onClick={apply}>
          Sort {matching ? plural(matching, 'payment') : 'them'}
        </button>
      </div>
      <details className="text-sm">
        <summary className={summaryStyle}>One at a time</summary>
        <ul className="grid grid-cols-1 gap-2 pt-3">
          {group.payments.slice(0, 100).map((p) => (
            <PaymentRow key={p.id} p={p} report={report} results={results} change={change} say={say} named={named} onGone={onSorted} />
          ))}
        </ul>
      </details>
    </li>
  )
}

function PaymentRow({ p, report, results, change, say, named, onGone }: { p: Payment; report: Report; results: Results; change: (f: (r: Report) => Report) => void; say: (m: string) => void; named: (l: string) => string; onGone?: () => void }) {
  const s = results.sorts.get(p.id) ?? null
  const dir: Direction = p.amount > 0 ? 'in' : 'out'
  const account = report.accounts.find((a) => a.id === p.account)!
  const [noting, setNoting] = useState(false)
  const note = report.sorted[p.id]?.n ?? ''
  const [noteText, setNoteText] = useState(note)
  return (
    <li className="grid grid-cols-1 gap-2 border-t border-rule pt-2 sm:grid-cols-[1fr_16rem] sm:items-start">
      <div className="grid min-w-0 grid-cols-1 gap-0.5">
        <p className="flex flex-wrap gap-x-3 text-sm">
          <span className="whitespace-nowrap">{dateText(p.date)}</span>
          <span className="font-mono tabular-nums">
            {dir === 'in' ? '+' : '−'}
            {money(Math.abs(p.amount))}
          </span>
          {report.accounts.length > 1 && <span className="text-dim">{accountName(account)}</span>}
        </p>
        <p className="text-sm break-words">{p.description || '(no description)'}</p>
        {s && s.by !== 'hand' && <p className="text-xs text-dim">{s.by === 'pair' ? 'Paired transfer' : 'Sorted by a rule'}</p>}
        {note && !noting && <p className="text-xs text-dim">Note: {note}</p>}
      </div>
      <div className="grid grid-cols-1 gap-2">
        <TypeSelect
          dir={dir}
          value={encode(s?.c, s?.o)}
          report={report}
          account={p.account}
          label={`Type for ${p.description || 'the payment'} on ${dateText(p.date)}, ${money(Math.abs(p.amount))}`}
          onChange={(v) => {
            const d = decodeChoice(v)
            change((r) => sortBy(r, [p.id], d))
            say(d ? `Sorted as ${sortLabel(d.c, d.o, report, named)}.` : 'Not sorted by hand: a rule may still apply.')
            if (d) onGone?.()
          }}
        />
        {noting ? (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              change((r) => noteOn(r, p.id, noteText))
              setNoting(false)
              say('Note saved.')
            }}
          >
            <input aria-label="Note" className={`${field} w-full`} value={noteText} maxLength={LIMITS.text} onChange={(e) => setNoteText(e.target.value)} placeholder="Who or what it was for" />
            <button type="submit" className={small}>
              Save
            </button>
          </form>
        ) : (
          <button type="button" className={small} onClick={() => setNoting(true)}>
            {note ? 'Change the note' : 'Add a note'}
          </button>
        )}
      </div>
    </li>
  )
}

function PaymentList({ report, results, change, say, named, onGone }: { report: Report; results: Results; change: (f: (r: Report) => Report) => void; say: (m: string) => void; named: (l: string) => string; onGone: () => void }) {
  const [account, setAccount] = useState('')
  const [only, setOnly] = useState<'all' | 'unsorted' | 'outside'>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const per = 100
  const q = norm(search)
  const list = results.payments.filter(
    (p) =>
      (!account || p.account === account) &&
      (only === 'outside' ? !inPeriod(report, p.date) : inPeriod(report, p.date)) &&
      (only !== 'unsorted' || !results.sorts.get(p.id)) &&
      (!q || norm(p.description).includes(q)),
  )
  const pages = Math.max(1, Math.ceil(list.length / per))
  const shown = list.slice(page * per, page * per + per)
  return (
    <section aria-labelledby="all-heading" className="grid grid-cols-1 gap-3">
      <h3 id="all-heading" className="font-medium">
        Every payment
      </h3>
      <div className="flex flex-wrap gap-3">
        {report.accounts.length > 1 && (
          <label className="grid grid-cols-1 gap-1 text-sm">
            <span>Account</span>
            <select className={field} value={account} onChange={(e) => (setAccount(e.target.value), setPage(0))}>
              <option value="">All accounts</option>
              {report.accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {accountName(a)}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="grid grid-cols-1 gap-1 text-sm">
          <span>Show</span>
          <select className={field} value={only} onChange={(e) => (setOnly(e.target.value as typeof only), setPage(0))}>
            <option value="all">In the period</option>
            <option value="unsorted">In the period, not sorted</option>
            <option value="outside">Outside the period</option>
          </select>
        </label>
        <label className="grid grid-cols-1 gap-1 text-sm">
          <span>Description has</span>
          <input type="search" className={field} value={search} onChange={(e) => (setSearch(e.target.value), setPage(0))} />
        </label>
      </div>
      <p className="text-sm text-dim" aria-live="polite">
        {plural(list.length, 'payment')}
        {pages > 1 ? `, page ${page + 1} of ${pages}` : ''}
      </p>
      <ul className="grid grid-cols-1 gap-2">
        {shown.map((p) => (
          <PaymentRow key={p.id} p={p} report={report} results={results} change={change} say={say} named={named} onGone={only === 'unsorted' ? onGone : undefined} />
        ))}
      </ul>
      {pages > 1 && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={small} disabled={page === 0} onClick={() => setPage((n) => n - 1)}>
            Previous page
          </button>
          <button type="button" className={small} disabled={page >= pages - 1} onClick={() => setPage((n) => n + 1)}>
            Next page
          </button>
        </div>
      )}
    </section>
  )
}

function Rules({ report, results, change, say, named }: { report: Report; results: Results; change: (f: (r: Report) => Report) => void; say: (m: string) => void; named: (l: string) => string }) {
  const counts = new Map<string, number>()
  for (const s of results.sorts.values()) if (s?.rule) counts.set(s.rule, (counts.get(s.rule) ?? 0) + 1)
  return (
    <section aria-labelledby="rules-heading" className="grid grid-cols-1 gap-3">
      <h3 id="rules-heading" tabIndex={-1} className="font-medium">
        Rules
      </h3>
      <p className="max-w-prose text-sm text-pretty text-dim">The longest matching words win when two rules fit a payment. A payment sorted by hand isn’t changed by a rule.</p>
      <ul className="grid grid-cols-1 gap-2">
        {report.rules.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="min-w-0 font-mono break-words">“{r.text}”</span>
            <span>
              money {r.dir}: {sortLabel(r.c, r.o, report, named)}
            </span>
            <span className="text-dim">{plural(counts.get(r.id) ?? 0, 'payment')}</span>
            <button
              type="button"
              className={small}
              aria-label={`Remove the rule for “${r.text}”`}
              onClick={() => {
                change((rep) => removeRule(rep, r.id))
                say(`Rule removed: payments it sorted are unsorted again.`)
                requestAnimationFrame(() => document.getElementById('rules-heading')?.focus())
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

// --- 4. Figures

function FiguresTab({ report, results, heading, onGo }: { report: Report; results: Results; heading: React.RefObject<HTMLHeadingElement | null>; onGo: (t: Tab) => void }) {
  const named = (l: string) => namedLabel(l, report.client)
  const [show, setShow] = useState<'online' | 'paper'>('online')
  const u = results.online.unsorted
  return (
    <>
      <PanelHeading heading={heading}>Figures</PanelHeading>
      <p className="text-sm text-dim print:text-ink">
        {report.client.trim() ? `${report.client.trim()}: ` : ''}
        {dateText(report.start)} to {dateText(report.end)}. Prepared with Labs’ Deputyship Accounts from the payments sorted on this device.
      </p>
      {u.count > 0 && (
        <p className="max-w-prose rounded-xl border border-rule px-4 py-3 text-sm text-pretty" role="status">
          {plural(u.count, 'payment')} aren’t sorted yet ({money(u.moneyIn)} in, {money(u.moneyOut)} out). They count in the totals and the balance below, but in no type yet.{' '}
          <button type="button" className="cursor-pointer underline underline-offset-4 print:hidden" onClick={() => onGo('sort')}>
            Sort them
          </button>
        </p>
      )}
      <AccountChecks report={report} results={results} onGo={onGo} />
      <div role="group" aria-label="Figures for" className="flex flex-wrap gap-2 print:hidden">
        <button type="button" aria-pressed={show === 'online'} className={show === 'online' ? primary : outline} onClick={() => setShow('online')}>
          The online report
        </button>
        <button type="button" aria-pressed={show === 'paper'} className={show === 'paper' ? primary : outline} onClick={() => setShow('paper')}>
          The paper form (OPG102)
        </button>
      </div>
      {show === 'online' ? <OnlineFigures report={report} results={results} named={named} /> : <PaperFigures report={report} results={results} named={named} />}
      <div className="flex flex-wrap gap-2 print:hidden">
        <button type="button" className={outline} onClick={() => window.print()}>
          Print these figures
        </button>
        <button type="button" className={outline} onClick={() => download(toCsv(report, results, named), `deputyship-accounts-${report.start}-to-${report.end}.csv`, 'text/csv;charset=utf-8')}>
          Download the spreadsheet (CSV)
        </button>
      </div>
      <p className="max-w-prose text-sm text-pretty text-dim print:hidden">
        The spreadsheet lists every payment with its type, and the OPG invites deputies to send such a list with the report (it can’t replace the report). It holds the client’s payments: keep
        it as safely as the statements.
      </p>
    </>
  )
}

function AccountChecks({ report, results, onGo }: { report: Report; results: Results; onGo: (t: Tab) => void }) {
  return (
    <section aria-labelledby="checks-heading" className="grid grid-cols-1 gap-3">
      <h3 id="checks-heading" className="font-medium">
        Does each account balance?
      </h3>
      <ul className="grid grid-cols-1 gap-3">
        {results.accounts.map((c) => {
          const a = c.account
          const moneyIn = c.inPeriod.moneyIn + c.oneSided.moneyIn
          const moneyOut = c.inPeriod.moneyOut + c.oneSided.moneyOut
          const status =
            c.worked === null || a.closing === null
              ? 'missing'
              : c.difference === 0
                ? 'balanced'
                : 'out'
          return (
            <li key={a.id} className={`${card} grid grid-cols-1 gap-2 break-inside-avoid`}>
              <p className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{accountName(a)}</span>
                <span className={status === 'balanced' ? 'text-sm' : 'text-sm font-medium'}>
                  {status === 'balanced' ? 'Balances' : status === 'missing' ? 'Balances needed' : `Out by ${money(Math.abs(c.difference!))}`}
                </span>
              </p>
              <dl className="grid max-w-md grid-cols-1 gap-y-0.5 text-sm">
                <Sum label="Opening balance (statement)" value={a.opening} />
                <Sum label="Money in" value={moneyIn} sign="+" />
                <Sum label="Money out" value={moneyOut} sign={'\u2212'} />
                <Sum label="Closing balance, worked out" value={c.worked} />
                <Sum label="Closing balance (statement)" value={a.closing} />
              </dl>
              {c.oneSided.count > 0 && <p className="text-sm text-dim">Its money in and out is the {plural(c.oneSided.count, 'transfer')} recorded in the other accounts’ downloads.</p>}
              {status === 'missing' && (
                <p className="text-sm">
                  Give the opening and closing balances from the statements on{' '}
                  <button type="button" className="cursor-pointer underline underline-offset-4" onClick={() => onGo('report')}>
                    the first step
                  </button>
                  {c.download.opening !== null && c.download.closing !== null && ` (the download shows ${money(c.download.opening)} at the start and ${money(c.download.closing)} at the end)`}.
                </p>
              )}
              <WhereToLook c={c} report={report} results={results} />
            </li>
          )
        })}
      </ul>
      {results.accounts.length > 1 && <p className="max-w-prose text-sm text-pretty text-dim">Money moved between the client’s accounts counts in each account here: out of one, into the other.</p>}
    </section>
  )
}

function WhereToLook({ c, report, results }: { c: Results['accounts'][number]; report: Report; results: Results }) {
  const a = c.account
  const items: ReactNode[] = []
  const p = (id: string) => results.byId.get(id)!
  const sourceOf = (id: string) => {
    const src = report.sources.find((x) => x.id === p(id).source)
    return src?.typed ? 'you typed in' : `from ${src?.name ?? 'another download'}, which has no running balance,`
  }
  if (c.download.opening !== null && a.opening !== null && c.download.opening !== a.opening)
    items.push(`The download’s running balance shows ${money(c.download.opening)} before the period’s first payment; the opening balance given is ${money(a.opening)}.`)
  if (c.download.closing !== null && a.closing !== null && c.download.closing !== a.closing)
    items.push(`The download shows ${money(c.download.closing)} after the period’s last payment; the closing balance given is ${money(a.closing)}.`)
  for (const t of c.troubles.slice(0, 10)) {
    const before = p(t.after)
    const next = p(t.next)
    const gap = t.shown - t.expected
    items.push(
      t.filledBy.length ? (
        <>
          Between {dateText(before.date)} and {dateText(next.date)}, {money(Math.abs(gap))} {gap < 0 ? 'went out' : 'came in'} that the download’s own payments don’t show: the payment of{' '}
          {money(Math.abs(p(t.filledBy[0]).amount))} on {dateText(p(t.filledBy[0]).date)} {sourceOf(t.filledBy[0])} accounts for it.
        </>
      ) : (
        <>
          Between {dateText(before.date)} ({before.description || 'no description'}) and {dateText(next.date)} ({next.description || 'no description'}), the balance should have gone to{' '}
          {money(t.expected)} but the download shows {money(t.shown)}: {money(Math.abs(gap))} {gap < 0 ? 'went out' : 'came in'} that no payment here shows. A payment may be missing from the
          downloads (type it in from the statement), or one may be here twice.
        </>
      ),
    )
  }
  if (c.troubles.length > 10) items.push(`And ${plural(c.troubles.length - 10, 'more place')} like these.`)
  for (const ids of c.lookAlikes.slice(0, 5)) {
    const first = p(ids[0])
    items.push(`${ids.length} payments of ${money(Math.abs(first.amount))} “${first.description}” on ${dateText(first.date)} in one download: both are kept, as real repeats are common (two cash withdrawals); check the statement shows ${ids.length}.`)
  }
  for (const id of c.unmatched.slice(0, 5)) {
    const x = p(id)
    const from = report.accounts.find((y) => y.id === x.account)!
    items.push(`A transfer of ${money(Math.abs(x.amount))} on ${dateText(x.date)} recorded in ${accountName(from)}’s payments has no matching payment in this account’s.`)
  }
  if (c.before || c.after) items.push(`${plural(c.before + c.after, 'payment')} in the downloads fall outside the period and aren’t counted.`)
  const own = c.inPeriod.count + c.before + c.after
  if (!items.length && c.difference) {
    items.push(
      !own
        ? c.oneSided.count
          ? 'This account has no payments of its own here: its money in and out is the transfers sorted in the other accounts. Check the transfers, and anything else on its statement (interest, for example), which would need adding.'
          : 'This account has no payments of its own here, and no transfer in the other accounts is sorted as going to or from it. Sort the transfers (on the third step), or add its payments.'
        : c.hasBalances
          ? 'The download’s running balance adds up throughout, so check the balances given against the statements, and any payments typed in.'
          : 'These downloads have no running balance to follow, so compare the money in and out each month with the statements (below).',
    )
  }
  return (
    <>
      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-1 text-sm">
          <p className="font-medium">{c.difference ? 'Where to look' : 'To check'}</p>
          <ul className="grid grid-cols-1 list-disc gap-1 pl-5 text-pretty">
            {items.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      {c.months.length > 0 && (
        <details className="text-sm print:hidden">
          <summary className={summaryStyle}>Money in and out by month, to compare with the statements</summary>
          <ul className="grid max-w-md grid-cols-1 pt-2">
            {c.months.map((m) => (
              <li key={m.month} className="flex flex-wrap justify-between gap-x-4 border-t border-rule py-0.5">
                <span>{monthText(m.month)}</span>
                <span className="font-mono tabular-nums">
                  {money(m.moneyIn)} in, {money(m.moneyOut)} out
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}

function Lines({ lines, results, label }: { lines: { key: string; total: number; payments: string[] }[]; results: Results; label: (key: string) => string }) {
  return (
    <ul className="grid grid-cols-1 gap-1">
      {lines.map((l) => (
        <li key={l.key} className="grid grid-cols-1 text-sm">
          <details className="group">
            <summary className="flex cursor-pointer flex-wrap justify-between gap-x-4 rounded px-1 py-1 hover:bg-ink/5">
              <span className="min-w-0 text-pretty">
                {label(l.key)} <span className="text-dim">({plural(l.payments.length, 'payment')})</span>
              </span>
              <span className="font-mono tabular-nums">{money(l.total)}</span>
            </summary>
            <PaymentsTable ids={l.payments} results={results} />
          </details>
        </li>
      ))}
    </ul>
  )
}

function PaymentsTable({ ids, results, notes }: { ids: string[]; results: Results; notes?: Record<string, { n?: string }> }) {
  return (
    <div className="pb-2">
      <ul className="grid grid-cols-1 text-sm">
        {ids.slice(0, 400).map((id) => {
          const p = results.byId.get(id)!
          const n = notes?.[id]?.n
          return (
            <li key={id} className="flex flex-wrap justify-between gap-x-3 border-t border-rule py-0.5 text-dim">
              <span className="min-w-0 text-pretty">
                <span className="whitespace-nowrap">{dateText(p.date)}</span> <span className="break-words">{p.description}</span>
                {n ? <span> · {n}</span> : null}
              </span>
              <span className="font-mono whitespace-nowrap tabular-nums">{money(Math.abs(p.amount))}</span>
            </li>
          )
        })}
      </ul>
      {ids.length > 400 && <p className="pt-1 text-xs text-dim">The first 400 are shown; the spreadsheet has them all.</p>}
    </div>
  )
}

/** A label and an amount on one line, or the amount on its own line below when there isn't room. */
function Sum({ label, value, strong, sign = '' }: { label: string; value: number | null; strong?: boolean; sign?: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4">
      <dt className={strong ? 'font-medium' : 'text-dim'}>{label}</dt>
      <dd className={`ml-auto text-right font-mono tabular-nums ${strong ? 'font-medium' : ''}`}>{value === null ? '—' : `${sign}${money(value)}`}</dd>
    </div>
  )
}

function OnlineFigures({ report, results, named }: { report: Report; results: Results; named: (l: string) => string }) {
  const o = results.online
  const typeLabel = (k: string) => named(TYPE_BY_KEY.get(k)!.label)
  const accountById = new Map(report.accounts.map((a) => [a.id, a]))
  return (
    <section aria-labelledby="online-heading" className="grid grid-cols-1 gap-5">
      <h3 id="online-heading" className="font-medium">
        For the online report (“Complete the deputy report”)
      </h3>
      <p className="max-w-prose text-sm text-pretty text-dim">
        The report lets you give a total for each type or each payment, and asks you to enter each payment in one place only. Gifts and deputy expenses go in their own sections, not in money
        out.
      </p>
      {(['in', 'out'] as const).map((dir) => {
        const groups = dir === 'in' ? o.moneyIn : o.moneyOut
        const total = groups.reduce((s, g) => s + g.total, 0)
        return (
          <div key={dir} className="grid grid-cols-1 gap-2">
            <h4 className="flex flex-wrap justify-between gap-2 text-sm font-medium">
              <span>Money {dir}</span>
              <span className="font-mono tabular-nums">{money(total)}</span>
            </h4>
            {groups.length ? (
              groups.map((g) => (
                <div key={g.group} className="grid grid-cols-1 gap-1 break-inside-avoid">
                  <p className="text-sm text-dim">{named(GROUPS.find((x) => x.key === g.group)!.label)}</p>
                  <Lines lines={g.lines} results={results} label={typeLabel} />
                </div>
              ))
            ) : (
              <p className="text-sm text-dim">Nothing sorted here yet.</p>
            )}
          </div>
        )
      })}
      {(
        [
          ['Gifts', o.gifts],
          ['Deputy expenses', o.expenses],
        ] as const
      ).map(([title, line]) => (
        <div key={title} className="grid grid-cols-1 gap-1 break-inside-avoid">
          <h4 className="flex flex-wrap justify-between gap-2 text-sm font-medium">
            <span>{title}</span>
            <span className="font-mono tabular-nums">{money(line.total)}</span>
          </h4>
          {line.payments.length ? (
            <PaymentsTable ids={line.payments} results={results} notes={report.sorted} />
          ) : (
            <p className="text-sm text-dim">None.</p>
          )}
        </div>
      ))}
      <div className="grid grid-cols-1 gap-1 break-inside-avoid">
        <h4 className="text-sm font-medium">Money transfers between the client’s accounts</h4>
        {o.transfers.length ? (
          <ul className="grid grid-cols-1 gap-1 text-sm">
            {o.transfers.map((t) => (
              <li key={`${t.from}>${t.to}`} className="flex flex-wrap justify-between gap-x-4">
                <span>
                  From {accountName(accountById.get(t.from)!)} to {accountName(accountById.get(t.to)!)} <span className="text-dim">({plural(t.payments.length, 'transfer')})</span>
                </span>
                <span className="font-mono tabular-nums">{money(t.total)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-dim">None.</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 break-inside-avoid">
        <h4 className="text-sm font-medium">Balancing the accounts, as the online report works it out</h4>
        <dl className="grid max-w-md grid-cols-1 gap-y-0.5 text-sm">
          <Sum label="Opening balances, all accounts" value={o.opening} />
          <Sum label="+ Money in" value={o.moneyInTotal} />
          <Sum label="− Money out" value={o.moneyOutTotal} />
          <Sum label="− Gifts" value={o.gifts.total} />
          <Sum label="− Deputy expenses" value={o.expenses.total} />
          <Sum label="= Closing balance, worked out" value={o.worked} strong />
          <Sum label="Closing balances, all accounts" value={o.closing} />
          <Sum label="Difference" value={o.offset} strong />
        </dl>
        <p className="max-w-prose text-sm text-pretty text-dim">
          {o.offset === null
            ? 'Give every account’s opening and closing balances to see the difference.'
            : o.offset === 0
              ? 'No difference.'
              : `Out by ${money(Math.abs(o.offset))}. The online report counts a difference under 20p as balanced; otherwise it asks why, and lets you send the report with your reason.`}
        </p>
      </div>
    </section>
  )
}

function PaperFigures({ report, results, named }: { report: Report; results: Results; named: (l: string) => string }) {
  const partLabel = (k: string) => (k === GIFT ? 'Gifts' : k === DEPUTY_EXPENSE ? 'Deputy expenses' : k === TRANSFER ? 'Transfers' : named(TYPE_BY_KEY.get(k)!.label))
  if (!results.paper.length)
    return (
      <section aria-labelledby="paper-heading" className="grid grid-cols-1 gap-2">
        <h3 id="paper-heading" className="font-medium">
          For the paper form (OPG102)
        </h3>
        <p className="text-sm text-dim">No account is marked as used for everyday money, so there’s no section 5 (on the first step).</p>
      </section>
    )
  return (
    <section aria-labelledby="paper-heading" className="grid grid-cols-1 gap-5">
      <h3 id="paper-heading" className="font-medium">
        For the paper form (OPG102, July 2025)
      </h3>
      <p className="max-w-prose text-sm text-pretty text-dim">
        A section 5 for each account used for everyday money. Each row takes the types that name it; types the form doesn’t list (food, clothes, bank charges) go in its “not listed above” row.
      </p>
      {results.paper.map((pp) => (
        <article key={pp.account.id} aria-labelledby={`paper-${pp.account.id}`} className={`${card} grid grid-cols-1 gap-4 break-inside-avoid`}>
          <h4 id={`paper-${pp.account.id}`} className="font-medium">
            Section 5: {accountName(pp.account)}
          </h4>
          {(
            [
              ['in', 'Summary of money paid in (page 7)', pp.rowsIn, pp.totalIn],
              ['out', 'Summary of money paid out (page 9)', pp.rowsOut, pp.totalOut],
            ] as const
          ).map(([dir, title, rows, total]) => (
            <div key={dir} className="grid grid-cols-1 gap-1">
              <h5 className="text-sm font-medium">{title}</h5>
              <dl className="grid grid-cols-1 text-sm">
                {rows.map((r) => (
                  <div key={r.key} className="flex flex-wrap justify-between gap-x-4 border-t border-rule py-1">
                    <dt className="min-w-0 text-pretty">
                      {PAPER_BY_KEY.get(r.key)!.label}
                      {PAPER_BY_KEY.get(r.key)!.details && r.total > 0 ? <span className="text-dim"> (more detail below)</span> : null}
                      {r.parts.length > 1 && <span className="block text-xs text-dim">{r.parts.map((x) => `${partLabel(x.key)} ${money(x.total)}`).join('; ')}</span>}
                    </dt>
                    <dd className="ml-auto text-right font-mono whitespace-nowrap tabular-nums">{r.total ? money(r.total) : '—'}</dd>
                  </div>
                ))}
                <div className="flex flex-wrap justify-between gap-x-4 border-t border-ink py-1">
                  <dt className="font-medium">Total</dt>
                  <dd className="ml-auto text-right font-mono font-medium tabular-nums">{money(total)}</dd>
                </div>
              </dl>
              {(dir === 'in' ? pp.unsorted.moneyIn : pp.unsorted.moneyOut) > 0 && (
                <p className="text-sm">Not sorted yet: {money(dir === 'in' ? pp.unsorted.moneyIn : pp.unsorted.moneyOut)} (not in any row above, but in the boxes below).</p>
              )}
              {rows
                .filter((r) => PAPER_BY_KEY.get(r.key)!.details && r.payments.length)
                .map((r) => (
                  <details key={r.key} className="text-sm" open>
                    <summary className={summaryStyle}>More detail: {PAPER_BY_KEY.get(r.key)!.label}</summary>
                    <PaymentsTable ids={r.payments} results={results} notes={report.sorted} />
                  </details>
                ))}
            </div>
          ))}
          <div className="grid grid-cols-1 gap-1">
            <h5 className="text-sm font-medium">Balancing the account (page 12)</h5>
            <dl className="grid max-w-md grid-cols-1 gap-y-0.5 text-sm">
              <Sum label="Box 1: opening balance (statement)" value={pp.boxes.b1} />
              <Sum label="Box 2: total money paid in" value={pp.boxes.b2} />
              <Sum label="Box 3: box 1 plus box 2" value={pp.boxes.b3} />
              <Sum label="Box 4: total money paid out" value={pp.boxes.b4} />
              <Sum label="Box 5: box 3 minus box 4" value={pp.boxes.b5} strong />
              <Sum label="Box 6: closing balance (statement)" value={pp.boxes.b6} strong />
            </dl>
            {pp.boxes.b5 !== null && pp.boxes.b6 !== null && pp.boxes.b5 !== pp.boxes.b6 && (
              <p className="text-sm">Boxes 5 and 6 differ by {money(Math.abs(pp.boxes.b5 - pp.boxes.b6))}: the form asks why. See “Where to look” above.</p>
            )}
          </div>
        </article>
      ))}
      {report.accounts.some((a) => !a.main) && (
        <p className="max-w-prose text-sm text-pretty text-dim">
          {report.accounts
            .filter((a) => !a.main)
            .map((a) => accountName(a))
            .join(', ')}
          : savings, for section 6 (its closing balance), not section 5.
        </p>
      )}
    </section>
  )
}
