import { useEffect, useMemo, useRef, useState } from 'react'
import { currency, CURRENCIES, decimals, floatToKeep, localCurrency, money, moneyExact, parseMoney, quickTenders } from './money.ts'

// Items, the day's sales, and the cash count, kept on this device only.
const STORAGE_KEY = 'labs:stall-till'
/** Sample items with prices in whole currency units (dollars, euros), so yen and the like get sensible numbers too. */
const SAMPLE: [string, number][] = [
  ['Brownie', 2.5],
  ['Cookie', 1],
  ['Cupcake', 3],
  ['Lemonade', 1.5],
  ['Banana bread', 2],
  ['Bag of fudge', 4],
]

interface Item {
  id: string
  name: string
  price: number
}
interface Line {
  name: string
  price: number
  qty: number
}
type Method = 'cash' | 'card' | 'other'
interface Sale {
  id: string
  at: number
  lines: Line[]
  total: number
  method: Method
  tendered: number | null
}
interface Saved {
  currency: string
  items: Item[]
  float: number
  sales: Sale[]
  counts: Record<number, number>
  counted: number | null
  keep: number
  tab: 'sell' | 'today' | 'items'
}

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 aria-invalid:border-red-600 sm:text-sm'
const field = `${control} h-11 w-full sm:h-10`
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const toggle = (on: boolean) => `${button} border ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`
const METHODS: Record<Method, string> = { cash: 'Cash', card: 'Card', other: 'Other' }
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

/** Experiment #025: a till for a market stall, bake sale, or craft fair, with cash-up at the end of the day. */
export default function StallTill() {
  const [saved, setSaved] = useState(load)
  const change = (patch: Partial<Saved>) => setSaved((s) => ({ ...s, ...patch }))
  const code = saved.currency
  const fmt = (m: number) => money(m, code)
  const exact = (m: number) => moneyExact(m, code)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      // Private browsing or full storage: sales won't survive a reload, so the page says so on the Today tab.
    }
  }, [saved])

  const tabs = (
    <div className="flex gap-2" role="tablist" aria-label="Till">
      {(
        [
          ['sell', 'Sell'],
          ['today', `Today${saved.sales.length ? ` (${saved.sales.length})` : ''}`],
          ['items', 'Items'],
        ] as const
      ).map(([tab, label]) => (
        <button key={tab} type="button" role="tab" aria-selected={saved.tab === tab} onClick={() => change({ tab })} className={toggle(saved.tab === tab)}>
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 sm:px-6 sm:pt-8 print:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          {tabs}
          <p className="text-sm text-dim tabular-nums">Taken today: <span className="font-semibold text-ink">{exact(saved.sales.reduce((n, s) => n + s.total, 0))}</span></p>
        </div>
        {saved.tab === 'sell' && <Sell saved={saved} fmt={fmt} exact={exact} onSale={(sale) => change({ sales: [...saved.sales, sale] })} onSetUp={() => change({ tab: 'items' })} />}
        {saved.tab === 'today' && <Today saved={saved} fmt={fmt} exact={exact} change={change} />}
        {saved.tab === 'items' && <Items saved={saved} fmt={fmt} change={change} />}
      </div>
    </div>
  )
}

function Sell({ saved, fmt, exact, onSale, onSetUp }: { saved: Saved; fmt: (m: number) => string; exact: (m: number) => string; onSale: (s: Sale) => void; onSetUp: () => void }) {
  const [lines, setLines] = useState<Line[]>([])
  const [paying, setPaying] = useState(false)
  const [tendered, setTendered] = useState<number | null>(null)
  const [otherText, setOtherText] = useState('')
  const [customText, setCustomText] = useState('')
  const [done, setDone] = useState<Sale | null>(null)
  const panel = useRef<HTMLElement>(null)
  const total = lines.reduce((n, l) => n + l.price * l.qty, 0)

  const add = (name: string, price: number) => {
    setDone(null)
    setLines((ls) => {
      const i = ls.findIndex((l) => l.name === name && l.price === price)
      return i >= 0 ? ls.map((l, k) => (k === i ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { name, price, qty: 1 }]
    })
  }
  const bump = (i: number, by: number) => setLines((ls) => ls.map((l, k) => (k === i ? { ...l, qty: l.qty + by } : l)).filter((l) => l.qty > 0))
  const finish = (method: Method, paid: number | null) => {
    const sale: Sale = { id: newId(), at: Date.now(), lines, total, method, tendered: paid }
    onSale(sale)
    setDone(sale)
    setLines([])
    setPaying(false)
    setTendered(null)
    setOtherText('')
  }
  const other = parseMoney(otherText, saved.currency)
  const custom = parseMoney(customText, saved.currency)

  if (!saved.items.length)
    return (
      <div className="mt-8 max-w-prose">
        <p className="text-pretty text-dim">A simple till for a market stall, a bake sale, or a craft fair: tap what you sell, see the change to give, and count up the cash box at the end of the day. Everything stays on this phone.</p>
        <button type="button" onClick={onSetUp} className={`${primary} mt-5`}>
          Add what you sell
        </button>
      </div>
    )

  return (
    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section aria-label="Items" className="grid content-start gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {saved.items.map((item) => {
            const qty = lines.filter((l) => l.name === item.name && l.price === item.price).reduce((n, l) => n + l.qty, 0)
            return (
              <button key={item.id} type="button" onClick={() => add(item.name, item.price)} className={`relative flex min-h-20 cursor-pointer flex-col items-start justify-between rounded-xl border p-3 text-left transition-colors active:scale-[0.98] ${qty ? 'border-ink bg-ink/5' : 'border-rule hover:bg-ink/5'}`}>
                <span className="font-medium text-pretty" dir="auto">
                  {item.name}
                </span>
                <span className="text-sm text-dim tabular-nums">{fmt(item.price)}</span>
                {qty > 0 && <span className="absolute top-2 right-2 inline-flex min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-semibold text-paper tabular-nums">{qty}</span>}
              </button>
            )
          })}
        </div>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (custom === null || custom <= 0) return
            add('Other item', custom)
            setCustomText('')
          }}
        >
          <label className="grid gap-1.5">
            <span className="text-sm text-dim">Something else</span>
            <input value={customText} onChange={(e) => setCustomText(e.target.value)} inputMode="decimal" placeholder="Price" className={`${control} h-11 w-28 sm:h-10`} aria-invalid={(customText.trim() !== '' && custom === null) || undefined} />
          </label>
          <button type="submit" disabled={custom === null || custom <= 0} className={outline}>
            Add it
          </button>
        </form>
      </section>

      {lines.length > 0 && !paying && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur lg:hidden print:hidden">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{exact(total)}</span>
          <button type="button" onClick={() => panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={primary}>
            Take payment
          </button>
        </div>
      )}
      <section ref={panel} aria-labelledby="sale-heading" className="scroll-mt-4 rounded-2xl border border-rule p-4 sm:p-5 lg:sticky lg:top-4 lg:self-start">
        <h2 id="sale-heading" className="sr-only">
          This sale
        </h2>
        {lines.length === 0 ? (
          done ? (
            <div aria-live="polite">
              <p className="text-sm text-dim">Sale saved, {METHODS[done.method].toLowerCase()}.</p>
              {done.tendered !== null && done.tendered > done.total && (
                <p className="mt-1">
                  <span className="block text-sm text-dim">Change given</span>
                  <span className="text-4xl font-semibold tracking-tight tabular-nums">{exact(done.tendered - done.total)}</span>
                </p>
              )}
              <p className="mt-3 text-sm text-dim">Tap an item to start the next sale.</p>
            </div>
          ) : (
            <p className="text-sm text-dim">Tap items to add them to the sale.</p>
          )
        ) : (
          <>
            <ul className="grid gap-2">
              {lines.map((l, i) => (
                <li key={`${l.name}-${l.price}`} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate" dir="auto">
                    {l.name}
                  </span>
                  <button type="button" onClick={() => bump(i, -1)} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-rule hover:bg-ink/5" aria-label={`One less ${l.name}`}>
                    −
                  </button>
                  <span className="w-6 text-center tabular-nums">{l.qty}</span>
                  <button type="button" onClick={() => bump(i, 1)} className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-rule hover:bg-ink/5" aria-label={`One more ${l.name}`}>
                    +
                  </button>
                  <span className="w-20 text-right tabular-nums">{fmt(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-baseline justify-between border-t border-rule pt-3">
              <span className="text-sm text-dim">Total</span>
              <span className="text-4xl font-semibold tracking-tight tabular-nums">{exact(total)}</span>
            </p>
            {!paying ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setPaying(true)} className={`${primary} h-12`}>
                  Cash
                </button>
                <button type="button" onClick={() => finish('card', null)} className={`${outline} h-12`}>
                  Card
                </button>
                <button type="button" onClick={() => finish('other', null)} className={`${outline} h-12`}>
                  Other
                </button>
              </div>
            ) : (
              <div className="mt-4 grid gap-3" aria-live="polite">
                <p className="text-sm font-medium">They paid with</p>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setTendered(total)} className={toggle(tendered === total)}>
                    Exact
                  </button>
                  {quickTenders(total, saved.currency).map((t) => (
                    <button key={t} type="button" onClick={() => setTendered(t)} className={`${toggle(tendered === t)} tabular-nums`}>
                      {fmt(t)}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-dim">Other amount</span>
                  <input
                    value={otherText}
                    onChange={(e) => {
                      setOtherText(e.target.value)
                      const v = parseMoney(e.target.value, saved.currency)
                      setTendered(v !== null && v >= total ? v : null)
                    }}
                    inputMode="decimal"
                    className={`${control} h-10 w-28`}
                    aria-invalid={(otherText.trim() !== '' && (other === null || other < total)) || undefined}
                  />
                </label>
                {tendered !== null && (
                  <p className="rounded-xl bg-ink p-4 text-paper">
                    <span className="block text-sm opacity-80">Change</span>
                    <span className="text-4xl font-semibold tracking-tight tabular-nums">{exact(tendered - total)}</span>
                  </p>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => finish('cash', tendered ?? total)} disabled={tendered === null} className={`${primary} flex-1`}>
                    Sale done
                  </button>
                  <button type="button" onClick={() => (setPaying(false), setTendered(null))} className={quiet}>
                    Back
                  </button>
                </div>
              </div>
            )}
            {!paying && (
              <button type="button" onClick={() => setLines([])} className={`${quiet} mt-2 -ml-3`}>
                Clear this sale
              </button>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function Today({ saved, fmt, exact, change }: { saved: Saved; fmt: (m: number) => string; exact: (m: number) => string; change: (p: Partial<Saved>) => void }) {
  const [confirm, setConfirm] = useState(false)
  const [removed, setRemoved] = useState<Sale | null>(null)
  const [keepText, setKeepText] = useState(() => (saved.keep ? String(saved.keep / 10 ** decimals(saved.currency)) : ''))
  const sales = saved.sales
  const byMethod = (m: Method) => sales.filter((s) => s.method === m).reduce((n, s) => n + s.total, 0)
  const taken = sales.reduce((n, s) => n + s.total, 0)
  const items = useMemo(() => {
    const map = new Map<string, { qty: number; total: number }>()
    for (const s of sales) for (const l of s.lines) {
      const e = map.get(l.name) ?? { qty: 0, total: 0 }
      map.set(l.name, { qty: e.qty + l.qty, total: e.total + l.qty * l.price })
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total)
  }, [sales])
  const pieces = currency(saved.currency).pieces
  const expected = saved.float + byMethod('cash')
  const counted = pieces.length ? pieces.reduce((n, p) => n + p * (saved.counts[p] ?? 0), 0) : (saved.counted ?? 0)
  const anyCount = pieces.length ? Object.values(saved.counts).some((c) => c > 0) : saved.counted !== null
  const diff = counted - expected
  const keep = parseMoney(keepText, saved.currency) ?? 0
  const plan = pieces.length && keep > 0 && anyCount ? floatToKeep(saved.counts, keep) : null

  const csv = () => {
    const rows = [['Time', 'Items', 'Total', 'Payment', 'Paid with', 'Change']]
    for (const s of sales) rows.push([timeFormat.format(s.at), s.lines.map((l) => `${l.qty} × ${l.name}`).join('; '), exact(s.total), METHODS[s.method], s.tendered === null ? '' : exact(s.tendered), s.tendered === null ? '' : exact(s.tendered - s.total)])
    return rows.map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : /^[=+\-@]/.test(v) ? `'${v}` : v)).join(',')).join('\r\n') + '\r\n'
  }

  return (
    <div className="mt-6 grid gap-10">
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="text-lg font-semibold tracking-tight">
          Today
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Taken', exact(taken)],
            ['Cash', exact(byMethod('cash'))],
            ['Card', exact(byMethod('card'))],
            ['Other', exact(byMethod('other'))],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-rule p-3">
              <dt className="text-sm text-dim">{label}</dt>
              <dd className="text-2xl font-semibold tracking-tight tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-sm text-dim">{sales.length === 1 ? '1 sale' : `${sales.length} sales`}.</p>
        {items.length > 0 && (
          <table className="mt-4 w-full max-w-lg text-left text-sm">
            <thead className="border-b border-rule text-dim">
              <tr>
                <th scope="col" className="py-2 font-normal">
                  Item
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Sold
                </th>
                <th scope="col" className="py-2 text-right font-normal">
                  Taken
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule tabular-nums">
              {items.map(([name, v]) => (
                <tr key={name}>
                  <th scope="row" className="py-1.5 font-normal" dir="auto">
                    {name}
                  </th>
                  <td className="py-1.5 text-right">{v.qty}</td>
                  <td className="py-1.5 text-right">{fmt(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section aria-labelledby="cash-heading">
        <h2 id="cash-heading" className="text-lg font-semibold tracking-tight">
          Cash up
        </h2>
        <p className="mt-1 text-sm text-pretty text-dim">
          Count the cash box. It should hold the starting float ({exact(saved.float)}) plus today’s cash sales ({exact(byMethod('cash'))}): <span className="font-medium text-ink">{exact(expected)}</span>.
        </p>
        {pieces.length ? (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {pieces.map((p) => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <span className="w-16 shrink-0 text-right tabular-nums">{fmt(p)}</span>
                <span className="text-dim">×</span>
                <input
                  value={saved.counts[p] ? String(saved.counts[p]) : ''}
                  onChange={(e) => {
                    const n = Math.max(0, Math.min(100_000, Math.floor(Number(e.target.value.replace(/\D/g, '')) || 0)))
                    change({ counts: { ...saved.counts, [p]: n } })
                  }}
                  inputMode="numeric"
                  placeholder="0"
                  aria-label={`Number of ${fmt(p)}`}
                  className={`${control} h-10 w-16 text-right tabular-nums`}
                />
              </label>
            ))}
          </div>
        ) : (
          <label className="mt-4 flex items-center gap-2 text-sm">
            <span>Cash counted</span>
            <input value={saved.counted === null ? '' : String(saved.counted / 10 ** decimals(saved.currency))} onChange={(e) => change({ counted: parseMoney(e.target.value, saved.currency) })} inputMode="decimal" className={`${control} h-10 w-32`} />
          </label>
        )}
        {anyCount && (
          <p className="mt-4 text-pretty" aria-live="polite">
            Counted <span className="font-semibold tabular-nums">{exact(counted)}</span>:{' '}
            {diff === 0 ? <span className="font-medium">exactly right.</span> : <span className="font-medium">{exact(Math.abs(diff))} {diff > 0 ? 'over' : 'short'}.</span>}
          </p>
        )}
        {pieces.length > 0 && (
          <div className="mt-5 grid gap-2">
            <label className="flex flex-wrap items-center gap-2 text-sm">
              <span>Keep a float for next time of</span>
              <input
                value={keepText}
                onChange={(e) => {
                  setKeepText(e.target.value)
                  const v = parseMoney(e.target.value, saved.currency)
                  if (v !== null) change({ keep: v })
                }}
                inputMode="decimal"
                placeholder={String(saved.float / 10 ** decimals(saved.currency))}
                className={`${control} h-10 w-24`}
              />
            </label>
            {plan && (
              <p className="text-sm text-pretty">
                {plan.total === keep ? 'Keep' : `You can keep ${exact(plan.total)}, the closest under that:`}{' '}
                {Object.entries(plan.keep)
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .map(([p, n]) => `${n} × ${fmt(Number(p))}`)
                  .join(', ') || 'nothing'}
                . Take out <span className="font-semibold tabular-nums">{exact(counted - plan.total)}</span> to bank.
              </p>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="sales-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="sales-heading" className="text-lg font-semibold tracking-tight">
            Sales
          </h2>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={() => download(new Blob(['\uFEFF', csv()], { type: 'text/csv;charset=utf-8' }), `sales-${new Date().toISOString().slice(0, 10)}.csv`)} disabled={!sales.length} className={outline}>
              Download CSV
            </button>
            <button type="button" onClick={() => window.print()} className={quiet}>
              Print
            </button>
          </div>
        </div>
        {removed && (
          <p className="mt-2 flex items-center gap-3 text-sm" role="status">
            Sale deleted.
            <button type="button" onClick={() => (change({ sales: [...sales, removed].sort((a, b) => a.at - b.at) }), setRemoved(null))} className="cursor-pointer underline underline-offset-4">
              Undo
            </button>
          </p>
        )}
        {sales.length ? (
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {[...sales].reverse().map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
                <span className="w-16 text-dim tabular-nums">{timeFormat.format(s.at)}</span>
                <span className="min-w-0 flex-1" dir="auto">
                  {s.lines.map((l) => `${l.qty} × ${l.name}`).join(', ')}
                </span>
                <span className="text-dim">{METHODS[s.method]}</span>
                <span className="w-20 text-right font-medium tabular-nums">{exact(s.total)}</span>
                <button type="button" onClick={() => (change({ sales: sales.filter((x) => x.id !== s.id) }), setRemoved(s))} className={`${quiet} h-8 px-2 print:hidden`} aria-label={`Delete the sale at ${timeFormat.format(s.at)}`}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-dim">No sales yet.</p>
        )}
      </section>

      <section className="print:hidden">
        {confirm ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            Clear today’s sales and cash count? Download the CSV first to keep a record.
            <button type="button" onClick={() => (change({ sales: [], counts: {}, counted: null }), setConfirm(false))} className={`${outline} border-red-600 text-red-700 dark:border-red-400 dark:text-red-300`}>
              Start a new day
            </button>
            <button type="button" onClick={() => setConfirm(false)} className={quiet}>
              Not yet
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} disabled={!sales.length && !Object.keys(saved.counts).length} className={outline}>
            Start a new day…
          </button>
        )}
      </section>
    </div>
  )
}

function Items({ saved, fmt, change }: { saved: Saved; fmt: (m: number) => string; change: (p: Partial<Saved>) => void }) {
  const names = useMemo(() => {
    try {
      return new Intl.DisplayNames(undefined, { type: 'currency' })
    } catch {
      return null
    }
  }, [])
  const setItem = (id: string, patch: Partial<Item>) => change({ items: saved.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  const move = (i: number, by: number) => {
    const list = [...saved.items]
    const [it] = list.splice(i, 1)
    list.splice(i + by, 0, it)
    change({ items: list })
  }
  return (
    <div className="mt-6 grid max-w-2xl gap-8">
      <section className="flex flex-wrap items-end gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Currency</span>
          <select value={saved.currency} onChange={(e) => change({ currency: e.target.value, counts: {} })} className={`${control} h-11 cursor-pointer sm:h-10`}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c} · {names?.of(c) ?? c}
              </option>
            ))}
          </select>
        </label>
        <MoneyField label="Starting float (cash in the box)" value={saved.float} code={saved.currency} onChange={(float) => change({ float })} />
      </section>

      <section aria-labelledby="items-heading">
        <h2 id="items-heading" className="text-lg font-semibold tracking-tight">
          What you sell
        </h2>
        {saved.items.length === 0 && (
          <button type="button" onClick={() => change({ items: SAMPLE.map(([name, major]) => ({ id: newId(), name, price: decimals(saved.currency) === 0 ? major * 100 : Math.round(major * 10 ** decimals(saved.currency)) })) })} className={`${outline} mt-3`}>
            Try sample bake-sale items
          </button>
        )}
        <ul className="mt-3 grid gap-2">
          {saved.items.map((item, i) => (
            <li key={item.id} className="flex flex-wrap items-center gap-2">
              <input value={item.name} maxLength={40} onChange={(e) => setItem(item.id, { name: e.target.value })} placeholder="Item" className={`${field} min-w-0 flex-1 basis-40`} dir="auto" aria-label="Item name" />
              <MoneyField label="Price" hideLabel value={item.price} code={saved.currency} onChange={(price) => setItem(item.id, { price })} />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={`${quiet} px-3`} aria-label={`Move ${item.name} up`}>
                ↑
              </button>
              <button type="button" onClick={() => change({ items: saved.items.filter((x) => x.id !== item.id) })} className={`${quiet} px-3`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => change({ items: [...saved.items, { id: newId(), name: '', price: 0 }] })} disabled={saved.items.length >= 40} className={`${primary} mt-3`}>
          Add an item
        </button>
        {saved.items.length > 0 && <p className="mt-3 text-sm text-dim">Shown on the Sell tab in this order, as {saved.items.slice(0, 2).map((i) => `${i.name || 'Item'} ${fmt(i.price)}`).join(', ')}{saved.items.length > 2 ? '…' : ''}</p>}
      </section>

      <p className="max-w-prose text-sm text-pretty text-dim">
        Open this page once with a connection before the market. After that it opens and works without a signal, and sales are saved on this phone as you go. Nothing is sent anywhere.
      </p>
    </div>
  )
}

function MoneyField({ label, hideLabel, value, code, onChange }: { label: string; hideLabel?: boolean; value: number; code: string; onChange: (v: number) => void }) {
  const d = decimals(code)
  const [text, setText] = useState(() => (value ? (value / 10 ** d).toFixed(d) : ''))
  const parsed = parseMoney(text, code)
  return (
    <label className="grid gap-1.5">
      <span className={hideLabel ? 'sr-only' : 'text-sm font-medium'}>{label}</span>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          const v = parseMoney(e.target.value, code)
          if (v !== null) onChange(v)
          else if (!e.target.value.trim()) onChange(0)
        }}
        onBlur={() => parsed !== null && setText(parsed ? (parsed / 10 ** d).toFixed(d) : '')}
        inputMode="decimal"
        placeholder="0"
        aria-invalid={(text.trim() !== '' && parsed === null) || undefined}
        className={`${control} h-11 w-28 tabular-nums sm:h-10`}
      />
    </label>
  )
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
  const fallback: Saved = { currency: localCurrency(navigator.language), items: [], float: 0, sales: [], counts: {}, counted: null, keep: 0, tab: 'sell' }
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!d || typeof d !== 'object') return fallback
    const int = (v: unknown, max = 1e9) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max ? (v as number) : 0)
    const items: Item[] = Array.isArray(d.items) ? d.items.filter((i: Item) => i && typeof i.id === 'string' && typeof i.name === 'string').slice(0, 40).map((i: Item) => ({ id: i.id, name: i.name.slice(0, 40), price: int(i.price) })) : []
    const sales: Sale[] = Array.isArray(d.sales)
      ? d.sales.filter((s: Sale) => s && typeof s.id === 'string' && Number.isFinite(s.at) && Array.isArray(s.lines) && Number.isInteger(s.total) && ['cash', 'card', 'other'].includes(s.method)).slice(0, 20_000)
      : []
    const counts: Record<number, number> = {}
    if (d.counts && typeof d.counts === 'object') for (const [k, v] of Object.entries(d.counts)) if (/^\d+$/.test(k)) counts[Number(k)] = int(v, 100_000)
    return {
      currency: CURRENCIES.includes(d.currency) ? d.currency : fallback.currency,
      items,
      float: int(d.float),
      sales,
      counts,
      counted: Number.isInteger(d.counted) ? d.counted : null,
      keep: int(d.keep),
      tab: d.tab === 'today' || d.tab === 'items' ? d.tab : 'sell',
    }
  } catch {
    return fallback
  }
}
