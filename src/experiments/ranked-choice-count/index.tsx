import { useEffect, useMemo, useRef, useState } from 'react'
import { count, firstChoiceWinners, type Result, type Round } from './count.ts'
import { parseBallots, type Parsed } from './parse.ts'

// Candidates, ballots, and seats, kept on this device only.
const STORAGE_KEY = 'labs:ranked-choice-count'
const LIMITS = { candidates: 40, ballots: 100_000 }

interface Saved {
  candidates: string[]
  ballots: string[][]
  seats: number
  mode: 'tap' | 'paste'
}

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const toggle = (on: boolean) => `${button} border ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`
const ORD = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`

/** Experiment #024: count ranked ballots by instant runoff or STV, round by round. */
export default function RankedChoiceCount() {
  const [saved, setSaved] = useState(load)
  const [names, setNames] = useState(() => saved.candidates.join('\n'))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      // Private browsing or full storage: ballots just won't be remembered.
    }
  }, [saved])

  const change = (patch: Partial<Saved>) => setSaved((s) => ({ ...s, ...patch }))
  const setCandidates = (text: string) => {
    setNames(text)
    const list = unique(text.split(/\n|,/))
    change({ candidates: list.slice(0, LIMITS.candidates) })
  }
  const candidates = saved.candidates
  const seats = Math.max(1, Math.min(saved.seats, Math.max(1, candidates.length - 1)))
  const result = useMemo(() => (candidates.length >= 2 && saved.ballots.length ? count(candidates, saved.ballots, seats) : null), [candidates, saved.ballots, seats])

  const addBallots = (incoming: string[][], replace: boolean, found: string[]) =>
    setSaved((s) => {
      const merged = unique([...s.candidates, ...found]).slice(0, LIMITS.candidates)
      setNames(merged.join('\n'))
      return { ...s, candidates: merged, ballots: [...(replace ? [] : s.ballots), ...incoming].slice(0, LIMITS.ballots) }
    })

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10 print:p-0">
        <div className="print:hidden">
          <p className="max-w-prose text-pretty text-dim">
            Count a ranked-choice vote for a club, a union, a school council, or an award. Tap in paper ballots or paste the results from Google Forms or Microsoft Forms, and see every round of the count explained. One seat is counted by instant runoff, more by the single transferable vote. The ballots stay on this device.
          </p>

          <section aria-labelledby="candidates-heading" className="mt-8">
            <h2 id="candidates-heading" className="text-lg font-semibold tracking-tight">
              Candidates
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
              <label className="grid gap-1.5">
                <span className="text-sm text-dim">One per line. Pasted ballots add any names that are missing.</span>
                <textarea value={names} onChange={(e) => setCandidates(e.target.value)} rows={4} placeholder={'Ava\nBen\nCleo'} className={`${control} w-full py-2`} dir="auto" />
              </label>
              <label className="grid content-start gap-1.5">
                <span className="text-sm font-medium">Seats to fill</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, candidates.length - 1)}
                  value={seats}
                  onChange={(e) => change({ seats: Math.max(1, Math.round(Number(e.target.value) || 1)) })}
                  className={`${control} h-11 w-24 sm:h-10`}
                />
                <span className="text-sm text-dim">{seats === 1 ? 'Instant runoff: one winner.' : `Single transferable vote: ${seats} winners.`}</span>
              </label>
            </div>
          </section>

          <section aria-labelledby="ballots-heading" className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="ballots-heading" className="text-lg font-semibold tracking-tight">
                Ballots <span className="font-normal text-dim tabular-nums">({saved.ballots.length.toLocaleString()})</span>
              </h2>
              <div className="flex gap-2" role="group" aria-label="How to enter ballots">
                <button type="button" aria-pressed={saved.mode === 'tap'} onClick={() => change({ mode: 'tap' })} className={toggle(saved.mode === 'tap')}>
                  Tap in paper ballots
                </button>
                <button type="button" aria-pressed={saved.mode === 'paste'} onClick={() => change({ mode: 'paste' })} className={toggle(saved.mode === 'paste')}>
                  Paste or open a file
                </button>
              </div>
            </div>
            {saved.mode === 'tap' ? (
              <TapEntry candidates={candidates} ballots={saved.ballots} onSave={(b) => change({ ballots: [...saved.ballots, b].slice(0, LIMITS.ballots) })} onDelete={(i) => change({ ballots: saved.ballots.filter((_, k) => k !== i) })} />
            ) : (
              <PasteEntry candidates={candidates} existing={saved.ballots.length} onUse={(p, replace) => addBallots(p.ballots, replace, p.candidates)} />
            )}
            {saved.ballots.length > 0 && <ClearAll count={saved.ballots.length} onClear={() => change({ ballots: [] })} />}
          </section>
        </div>

        {result ? <Results result={result} candidates={candidates} ballots={saved.ballots} /> : <p className="mt-10 text-sm text-dim print:hidden">{candidates.length < 2 ? 'Add at least two candidates.' : 'Add ballots to see the count.'}</p>}
      </div>
    </div>
  )
}

function TapEntry({ candidates, ballots, onSave, onDelete }: { candidates: string[]; ballots: string[][]; onSave: (b: string[]) => void; onDelete: (i: number) => void }) {
  const [current, setCurrent] = useState<string[]>([])
  const [flash, setFlash] = useState('')
  const pick = (c: string) => setCurrent((b) => (b.includes(c) ? b.filter((x) => x !== c) : [...b, c]))
  const save = () => {
    if (!current.length) return
    onSave(current)
    setFlash(`Ballot ${ballots.length + 1} saved.`)
    setCurrent([])
  }
  const saveRef = useRef(save)
  saveRef.current = save

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : document.body
      if (target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
      const n = Number(e.key)
      if (Number.isInteger(n) && n >= 1 && n <= Math.min(9, candidates.length)) {
        e.preventDefault()
        pick(candidates[n - 1])
      } else if (e.key === 'Enter' && !(target instanceof HTMLButtonElement)) {
        e.preventDefault()
        saveRef.current()
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        setCurrent((b) => b.slice(0, -1))
      } else if (e.key === 'Escape') setCurrent([])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [candidates])

  if (candidates.length < 2) return <p className="mt-3 text-sm text-dim">Add the candidates above, then tap each paper ballot in.</p>
  return (
    <div className="mt-4 rounded-2xl border border-rule p-4 sm:p-5">
      <p className="text-sm text-dim">Tap the candidates in the order this ballot ranks them, then save it. Tap a name again to take it off.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {candidates.map((c, i) => {
          const rank = current.indexOf(c)
          return (
            <button key={c} type="button" onClick={() => pick(c)} aria-pressed={rank >= 0} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${rank >= 0 ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`}>
              <span className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md text-sm font-semibold tabular-nums ${rank >= 0 ? 'bg-paper text-ink' : 'bg-ink/10'}`}>{rank >= 0 ? rank + 1 : i < 9 ? <span className="text-xs text-dim">{i + 1}</span> : ''}</span>
              <span className="min-w-0 truncate font-medium" dir="auto">
                {c}
              </span>
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} disabled={!current.length} className={primary}>
          Save ballot {ballots.length + 1}
        </button>
        <button type="button" onClick={() => setCurrent((b) => b.slice(0, -1))} disabled={!current.length} className={outline}>
          Undo last pick
        </button>
        <span className="text-sm text-dim" role="status">
          {current.length ? current.map((c, i) => `${ORD(i + 1)} ${c}`).join(', ') : flash}
        </span>
      </div>
      <p className="mt-3 hidden text-xs text-dim sm:block">Keys: the number by each name picks it, Enter saves, Backspace undoes the last pick, Esc clears the ballot.</p>
      {ballots.length > 0 && (
        <div className="mt-5 border-t border-rule pt-4">
          <p className="text-sm font-medium">Last ballots entered</p>
          <ul className="mt-2 grid gap-1 text-sm">
            {ballots
              .map((b, i) => ({ b, i }))
              .slice(-5)
              .reverse()
              .map(({ b, i }) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate" dir="auto">
                    <span className="text-dim tabular-nums">{i + 1}.</span> {b.join(' > ')}
                  </span>
                  <button type="button" onClick={() => onDelete(i)} className={`${quiet} h-8 px-2`}>
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function PasteEntry({ candidates, existing, onUse }: { candidates: string[]; existing: number; onUse: (p: Parsed, replace: boolean) => void }) {
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const parsed = useMemo(() => (text.trim() ? parseBallots(text, candidates) : null), [text, candidates])
  const formats: Record<Parsed['format'], string> = { grid: 'a Google Forms grid', columns: 'choice columns', semicolons: 'a Microsoft Forms ranking', lines: 'one ballot per line', empty: '' }

  const open = async (f: File | undefined) => {
    if (!f) return
    if (f.size > 20_000_000) return setNote('That file is too big. Save just the ballot columns as a CSV.')
    setNote('')
    setText(await f.text())
  }

  return (
    <div className="mt-4 grid gap-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder={'Paste a CSV export, or one ballot per line:\nAva > Ben > Cleo\nBen > Ava\n12: Cleo > Ava   (twelve ballots like this)'} className={`${control} w-full py-2 font-mono text-sm`} spellCheck={false} dir="auto" aria-label="Ballots to read" />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => file.current?.click()} className={outline}>
          Open a CSV file
        </button>
        <input ref={file} type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" className="hidden" onChange={(e) => void open(e.target.files?.[0])} />
        <span className="text-sm text-dim">From Google Forms: Responses, then Download responses (.csv). From Microsoft Forms: Open results in Excel, then save as CSV.</span>
      </div>
      {note && <p className="text-sm text-red-700 dark:text-red-400">{note}</p>}
      {parsed && (
        <div className="rounded-xl border border-rule p-4 text-sm" role="status">
          {parsed.ballots.length ? (
            <>
              <p>
                Read <span className="font-semibold tabular-nums">{parsed.ballots.length.toLocaleString()}</span> {parsed.ballots.length === 1 ? 'ballot' : 'ballots'} from {formats[parsed.format]}, ranking {parsed.candidates.length} candidates: <span dir="auto">{parsed.candidates.join(', ')}</span>.
              </p>
              {(parsed.skipped > 0 || parsed.overvotes > 0) && (
                <p className="mt-1 text-dim">
                  {parsed.skipped > 0 && `${parsed.skipped} ${parsed.skipped === 1 ? 'row had' : 'rows had'} no usable ranking and ${parsed.skipped === 1 ? 'was' : 'were'} left out. `}
                  {parsed.overvotes > 0 && `${parsed.overvotes} ${parsed.overvotes === 1 ? 'ballot gave' : 'ballots gave'} two candidates the same rank partway down, so ${parsed.overvotes === 1 ? 'it counts' : 'they count'} only up to there.`}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => (onUse(parsed, true), setText(''))} className={primary}>
                  Use these {parsed.ballots.length.toLocaleString()} ballots
                </button>
                {existing > 0 && (
                  <button type="button" onClick={() => (onUse(parsed, false), setText(''))} className={outline}>
                    Add them to the {existing.toLocaleString()} already here
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>No ballots found yet. Each ballot needs at least one candidate ranked.</p>
          )}
        </div>
      )}
    </div>
  )
}

function ClearAll({ count: n, onClear }: { count: number; onClear: () => void }) {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
      {confirm ? (
        <>
          <span>Remove all {n.toLocaleString()} ballots?</span>
          <button type="button" onClick={() => (onClear(), setConfirm(false))} className={`${outline} border-red-600 text-red-700 dark:border-red-400 dark:text-red-300`}>
            Remove them
          </button>
          <button type="button" onClick={() => setConfirm(false)} className={quiet}>
            Keep them
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setConfirm(true)} className={`${quiet} -ml-3`}>
          Remove all ballots…
        </button>
      )}
    </div>
  )
}

const fmt = (v: number, stv: boolean) => (stv ? (Math.round(v * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: Number.isInteger(Math.round(v * 100) / 100) ? 0 : 2, maximumFractionDigits: 2 }) : Math.round(v).toLocaleString())

function Results({ result, candidates, ballots }: { result: Result; candidates: string[]; ballots: string[][] }) {
  const stv = result.method === 'stv'
  const [copied, setCopied] = useState<'yes' | 'no' | null>(null)
  const plurality = firstChoiceWinners(candidates, ballots, result.seats)
  const same = plurality.length === result.winners.length && plurality.every((c) => result.winners.includes(c))
  const last = result.rounds[result.rounds.length - 1]
  const summary = result.winners.length
    ? stv
      ? `Elected: ${result.winners.join(', ')}.`
      : `${result.winners[0]} wins with ${fmt(last.votes[result.winners[0]], false)} of ${fmt(Object.values(last.votes).reduce((n, v) => n + v, 0), false)} votes in round ${result.rounds.length}.`
    : 'No one could be elected.'

  const text = () => [summary, `${result.valid} valid ballots. ${stv ? `Quota: ${result.quota}.` : 'Instant runoff.'}`, '', ...result.rounds.map((r, i) => `Round ${i + 1}: ${Object.entries(r.votes).sort((a, b) => b[1] - a[1]).map(([c, v]) => `${c} ${fmt(v, stv)}`).join(', ')}. ${describe(r, stv)}`)].join('\n')
  const csv = () => {
    const header = ['Candidate', ...result.rounds.map((_, i) => `Round ${i + 1}`)]
    const rows = candidates.map((c) => [c, ...result.rounds.map((r) => (c in r.votes ? fmt(r.votes[c], stv) : ''))])
    rows.push(['No choices left', ...result.rounds.map((r) => fmt(r.exhausted, stv))])
    return [header, ...rows].map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : /^[=+\-@]/.test(v) ? `'${v}` : v)).join(',')).join('\r\n') + '\r\n'
  }

  return (
    <section aria-labelledby="results-heading" className="mt-12 print:mt-0">
      <h2 id="results-heading" className="text-2xl font-semibold tracking-tight text-pretty" dir="auto">
        {summary}
      </h2>
      <p className="mt-1 text-sm text-dim">
        {result.valid.toLocaleString()} valid ballots · {stv ? `quota ${result.quota} (the Droop quota)` : 'more than half of the ballots still in play wins'}
        {!same && result.winners.length > 0 && <span className="text-ink"> · On first choices alone, {plurality.join(', ')} would have {plurality.length === 1 ? 'won' : 'been elected'}.</span>}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() =>
            navigator.clipboard?.writeText(text()).then(
              () => (setCopied('yes'), setTimeout(() => setCopied(null), 2500)),
              () => setCopied('no'),
            )
          }
          className={outline}
        >
          {copied === 'yes' ? 'Copied' : copied === 'no' ? 'Couldn’t copy' : 'Copy the results'}
        </button>
        <button type="button" onClick={() => download(new Blob(['\uFEFF', csv()], { type: 'text/csv;charset=utf-8' }), 'ranked-choice-rounds.csv')} className={outline}>
          Download rounds (CSV)
        </button>
        <button type="button" onClick={() => window.print()} className={quiet}>
          Print
        </button>
      </div>

      <ol className="mt-8 grid gap-6">
        {result.rounds.map((r, i) => (
          <RoundCard key={i} round={r} index={i} stv={stv} before={new Set(result.rounds.slice(0, i).flatMap((x) => x.elected))} />
        ))}
      </ol>
      <p className="mt-8 max-w-prose text-sm text-pretty text-dim print:hidden">Rules for ties, transfers, and incomplete ballots differ between organizations, so check your bylaws before announcing a result. This isn’t meant for public elections, which follow their own laws.</p>
      <style>{`@media print { .print-exact { print-color-adjust: exact; -webkit-print-color-adjust: exact; } li { break-inside: avoid; } }`}</style>
    </section>
  )
}

function RoundCard({ round, index, stv, before }: { round: Round; index: number; stv: boolean; before: Set<string> }) {
  const entries = Object.entries(round.votes).sort((a, b) => b[1] - a[1])
  // A little headroom, so the line marking what's needed to win stays visible at the top of the scale.
  const max = Math.max(round.threshold, ...entries.map(([, v]) => v), 1) * 1.08
  return (
    <li className="rounded-2xl border border-rule p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">Round {index + 1}</h3>
        <p className="text-sm text-dim tabular-nums">
          {stv ? 'Quota' : 'To win'}: {stv ? fmt(round.threshold, true) : `more than ${fmt(round.threshold, true)}`}
          {round.exhausted > 0 && ` · no choices left: ${fmt(round.exhausted, stv)}`}
        </p>
      </div>
      <ul className="mt-3 grid gap-2">
        {entries.map(([c, v]) => {
          const out = round.eliminated === c
          return (
            <li key={c} className="grid grid-cols-[minmax(4.5rem,9rem)_minmax(0,1fr)_7.25rem] items-center gap-3 text-sm">
              <span className={`truncate ${out ? 'text-dim line-through' : 'font-medium'}`} dir="auto">
                {c}
              </span>
              <span className="relative h-5 overflow-hidden rounded bg-ink/[0.06]" aria-hidden="true">
                <span className={`absolute inset-y-0 left-0 rounded print-exact ${round.elected.includes(c) ? 'bg-signal' : out ? 'bg-dim/50' : 'bg-ink/75'}`} style={{ width: `${(v / max) * 100}%` }} />
                <span className="absolute inset-y-[-2px] w-0.5 bg-red-600 print-exact dark:bg-red-400" style={{ left: `${(round.threshold / max) * 100}%` }} />
              </span>
              <span className="text-right tabular-nums">
                {fmt(v, stv)}
                {round.elected.includes(c) && <span className="ml-2 rounded bg-signal/15 px-1.5 py-0.5 text-xs font-medium text-ink">Elected</span>}
                {before.has(c) && <span className="ml-2 text-xs text-dim">elected</span>}
                {out && <span className="ml-2 rounded bg-ink/10 px-1.5 py-0.5 text-xs">Out</span>}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 text-sm text-pretty" dir="auto">
        {describe(round, stv)}
      </p>
    </li>
  )
}

function describe(r: Round, stv: boolean): string {
  const parts: string[] = []
  if (r.elected.length) parts.push(`${r.elected.join(' and ')} ${r.elected.length === 1 ? 'is' : 'are'} elected.`)
  if (r.eliminated) parts.push(`${r.eliminated} has the fewest votes and is out${r.tie ? ` (tied with ${r.tie.among.filter((c) => c !== r.eliminated).join(', ')}; ${r.tie.by === 'lot' ? 'broken by lot' : 'broken by the earlier rounds'})` : ''}.`)
  if (r.transfer) {
    const moves = Object.entries(r.transfer.to).sort((a, b) => b[1] - a[1]).map(([c, v]) => `${fmt(v, stv)} to ${c}`)
    const lost = r.transfer.exhausted > 0 ? `${fmt(r.transfer.exhausted, stv)} had no further choice` : ''
    const all = [...moves, lost].filter(Boolean)
    if (all.length) parts.push(`${r.transfer.kind === 'surplus' ? `${r.transfer.from}’s surplus moves on` : `${r.transfer.from}’s votes move on`}: ${all.join(', ')}.`)
  }
  return parts.join(' ') || 'No change.'
}

const unique = (list: string[]) => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of list) {
    const n = raw.trim().replace(/\s+/g, ' ')
    const k = n.toLocaleLowerCase()
    if (!n || seen.has(k)) continue
    seen.add(k)
    out.push(n.slice(0, 60))
  }
  return out
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function load(): Saved {
  const fallback: Saved = { candidates: [], ballots: [], seats: 1, mode: 'tap' }
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!d || typeof d !== 'object') return fallback
    const candidates = Array.isArray(d.candidates) ? unique(d.candidates.filter((c: unknown) => typeof c === 'string')).slice(0, LIMITS.candidates) : []
    const ballots = Array.isArray(d.ballots) ? d.ballots.filter((b: unknown) => Array.isArray(b) && b.every((c) => typeof c === 'string') && b.length).slice(0, LIMITS.ballots) : []
    return { candidates, ballots, seats: Number.isInteger(d.seats) && d.seats >= 1 ? d.seats : 1, mode: d.mode === 'paste' ? 'paste' : 'tap' }
  } catch {
    return fallback
  }
}
