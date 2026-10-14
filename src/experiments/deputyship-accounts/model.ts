// Deputyship Accounts: a deputy's yearly report to the Office of the Public Guardian, its money part.
//
// The report holds the client's accounts (each with the balances on its statements at the start and end of the
// reporting period), the downloads and typed-in rows each account's payments came from, how the deputy has sorted
// them (by hand, by rules made from a payee, and transfers paired across accounts), and works out what the report
// asks: the money in and out under its types, gifts and deputy expenses apart, transfers between the client's
// accounts, and the balance check, for the online report and for the paper form.
//
// An account's payments are the union of its downloads: a payment that appears in two overlapping downloads (the
// same date, amount, description, and running balance, or the same bank identifier) is one payment. The union keeps,
// for each such payment, the largest number of times any one download holds it, never the sum: two real £10
// withdrawals on a day stay two, and the same day downloaded twice doesn't become four. Amounts are whole pennies.

import type { RawRow } from './read.ts'
import { DEPUTY_EXPENSE, GIFT, GROUPS, PAPER_ROWS, TRANSFER, TYPES, TYPE_BY_KEY, type Direction } from './types.ts'

export interface Account {
  id: string
  name: string
  /** The last four digits of the account number, or ''. */
  last4: string
  /** Used for everyday money: a section 5 of its own on the paper form. */
  main: boolean
  /** The balances on the statements at the start and the end of the reporting period, in pennies. */
  opening: number | null
  closing: number | null
}

export interface Source {
  id: string
  account: string
  /** The file's name, or "Typed in". */
  name: string
  typed: boolean
  rows: RawRow[]
  /** When it was added, as a time in milliseconds. */
  added: number
}

export interface Assignment {
  /** A money type's key, GIFT, DEPUTY_EXPENSE, or TRANSFER. */
  c: string
  /** For a transfer: the other account's id. */
  o?: string
  /** For a transfer paired with the other account's own record of it: that payment's id. */
  p?: string
  /** A note: what it was for, who a gift went to. */
  n?: string
}

export interface Rule {
  id: string
  /** Found in a payment's description, whatever the case or spacing. */
  text: string
  dir: Direction
  c: string
  o?: string
}

export interface Report {
  /** How the client is named in the page's labels; '' for "the client". */
  client: string
  /** The reporting period, yyyy-mm-dd, both days included. */
  start: string
  end: string
  accounts: Account[]
  sources: Source[]
  /** Payments sorted by hand (or paired), by payment id. */
  sorted: Record<string, Assignment>
  rules: Rule[]
}

export const LIMITS = { accounts: 20, sources: 300, rows: 60_000, rules: 500, text: 300 }

// --- Dates

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + n))
  return t.toISOString().slice(0, 10)
}

/** A year after the start, less a day: 10 June to 9 June; a start on 29 February ends on 28 February. */
export function defaultEnd(start: string): string {
  const [y, m, d] = start.split('-').map(Number)
  const t = new Date(Date.UTC(y + 1, m - 1, d))
  return addDays(t.toISOString().slice(0, 10), -1)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000)
}

export function isIso(s: unknown): s is string {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const t = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === s
}

export function inPeriod(report: Report, date: string): boolean {
  return date >= report.start && date <= report.end
}

// --- Money

export function money(pennies: number): string {
  const sign = pennies < 0 ? '−' : ''
  const p = Math.abs(pennies)
  const pounds = Math.floor(p / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}£${pounds}.${String(p % 100).padStart(2, '0')}`
}

/** Pennies as a plain number with two decimals, for spreadsheets ("-12.30"). */
export function plain(pennies: number): string {
  const sign = pennies < 0 ? '-' : ''
  const p = Math.abs(pennies)
  return `${sign}${Math.floor(p / 100)}.${String(p % 100).padStart(2, '0')}`
}

// --- Payments

export interface Payment {
  id: string
  account: string
  date: string
  description: string
  amount: number
  balance: number | null
  bankId?: string
  /** The source it was taken from, and its line there. */
  source: string
  line: number
  /** Its position among its source's rows, in the file's own order. */
  index: number
  /** Other downloads that held it too. */
  alsoIn: string[]
}

/** Descriptions compared without case or spacing differences. */
export function norm(s: string): string {
  return s.normalize('NFKC').toUpperCase().replace(/\s+/g, ' ').trim()
}

function contentKey(r: RawRow): string {
  return r.bankId ? `#${r.bankId}` : `${r.date}|${r.amount}|${norm(r.description)}|${r.balance ?? ''}`
}

/** A short, stable code for a text (cyrb53). */
export function hash(text: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

/** An account's payments: the union of its downloads (see the top of this file) and its typed-in rows. */
export function paymentsOf(report: Report, accountId: string): Payment[] {
  const sources = report.sources.filter((s) => s.account === accountId)
  type Slot = { source: Source; rows: { row: RawRow; index: number }[] }
  const best = new Map<string, Slot>()
  const holders = new Map<string, Map<string, number>>()
  for (const source of sources) {
    const byKey = new Map<string, { row: RawRow; index: number }[]>()
    source.rows.forEach((row, index) => {
      const k = source.typed ? `typed|${source.id}|${row.bankId ?? index}` : contentKey(row)
      const list = byKey.get(k)
      if (list) list.push({ row, index })
      else byKey.set(k, [{ row, index }])
    })
    for (const [k, rows] of byKey) {
      const held = holders.get(k) ?? new Map<string, number>()
      held.set(source.id, rows.length)
      holders.set(k, held)
      const current = best.get(k)
      if (!current || rows.length > current.rows.length) best.set(k, { source, rows })
    }
  }
  const out: Payment[] = []
  const used = new Set<string>()
  for (const [k, slot] of best) {
    const code = `${accountId}:${hash(k)}`
    const held = holders.get(k)!
    slot.rows.forEach(({ row, index }, n) => {
      let id = `${code}:${n + 1}`
      // A clash between two different payments' codes is next to impossible; keep ids unique if it ever happens.
      while (used.has(id)) id += '+'
      used.add(id)
      const alsoIn: string[] = []
      for (const [sid, count] of held) if (sid !== slot.source.id && count > n) alsoIn.push(sid)
      const p: Payment = {
        id,
        account: accountId,
        date: row.date,
        description: row.description,
        amount: row.amount,
        balance: row.balance,
        source: slot.source.id,
        line: row.line,
        index,
        alsoIn,
      }
      if (row.bankId && !slot.source.typed) p.bankId = row.bankId
      out.push(p)
    })
  }
  const order = new Map(sources.map((s, i) => [s.id, i]))
  out.sort(
    (a, b) =>
      (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) ||
      (order.get(a.source)! - order.get(b.source)!) ||
      a.index - b.index,
  )
  return out
}

export function allPayments(report: Report): Payment[] {
  return report.accounts.flatMap((a) => paymentsOf(report, a.id))
}

export function directionOf(amount: number): Direction | null {
  return amount > 0 ? 'in' : amount < 0 ? 'out' : null
}

// --- Sorting

export interface Sort {
  c: string
  o?: string
  p?: string
  n?: string
  by: 'hand' | 'rule' | 'pair'
  rule?: string
}

/** Whether a sort fits a payment: its direction, and a transfer's other account. */
export function fits(report: Report, payment: Payment, c: string, o?: string): boolean {
  const dir = directionOf(payment.amount)
  if (!dir) return false
  if (c === TRANSFER) return !!o && o !== payment.account && report.accounts.some((a) => a.id === o)
  if (c === GIFT || c === DEPUTY_EXPENSE) return dir === 'out'
  const t = TYPE_BY_KEY.get(c)
  return !!t && t.dir === dir
}

/** Rules in the order they're tried: the longest text first, so the most particular wins. */
export function ruleOrder(rules: Rule[]): Rule[] {
  return rules
    .map((r, i) => ({ r, i }))
    .sort((a, b) => b.r.text.length - a.r.text.length || a.i - b.i)
    .map(({ r }) => r)
}

export function ruleMatches(rule: Rule, payment: Payment): boolean {
  const t = norm(rule.text)
  return !!t && directionOf(payment.amount) === rule.dir && norm(payment.description).includes(t)
}

/**
 * Each payment's sort: the deputy's own choice, else the first rule that matches, else none. A choice that no
 * longer fits (a typed row's amount changed sign, an account removed) counts as none.
 */
export function sortsOf(report: Report, payments: Payment[]): Map<string, Sort | null> {
  const rules = ruleOrder(report.rules).map((r) => ({ r, t: norm(r.text) })).filter((x) => x.t)
  const ids = new Set(payments.map((p) => p.id))
  const out = new Map<string, Sort | null>()
  for (const p of payments) {
    const a = report.sorted[p.id]
    if (a && a.c && fits(report, p, a.c, a.o)) {
      const paired = a.c === TRANSFER && !!a.p && ids.has(a.p) && report.sorted[a.p]?.p === p.id
      const s: Sort = { c: a.c, by: paired ? 'pair' : 'hand' }
      if (a.o) s.o = a.o
      if (paired) s.p = a.p
      if (a.n) s.n = a.n
      out.set(p.id, s)
      continue
    }
    let found: Sort | null = null
    const dir = directionOf(p.amount)
    if (dir) {
      const d = norm(p.description)
      for (const { r, t } of rules) {
        if (r.dir === dir && d.includes(t) && fits(report, p, r.c, r.o)) {
          found = { c: r.c, by: 'rule', rule: r.id }
          if (r.o) found.o = r.o
          if (a?.n) found.n = a.n
          break
        }
      }
    }
    out.set(p.id, found)
  }
  return out
}

/** The text a rule starts from: the payee's words, up to the first word with a digit in it (a reference or date). */
export function ruleTextFor(description: string): string {
  const first = norm(description.split(' · ')[0] ?? '')
  const words = first.split(' ').filter(Boolean)
  const keep: string[] = []
  for (const w of words) {
    if (/\d/.test(w) && keep.length) break
    keep.push(w)
    if (keep.length >= 5) break
  }
  return keep.join(' ').replace(/[\s,.;:*/-]+$/, '')
}

// --- Transfers between the client's accounts

export interface PairOffer {
  out: string
  into: string
  days: number
  /** A description says it's a transfer, or names the other account's last four digits. */
  likely: boolean
}

const TRANSFER_WORDS = /\bTRANSFER|\bTFR\b|\bTRF\b|\bFT\b|\bTO A\/?C\b|\bFROM A\/?C\b|\bSAVINGS?\b|\bISA\b|\bINTERNAL\b|\bOWN ACCOUNT\b/

/**
 * Transfers to offer as pairs: a payment out of one account and a payment of the same amount into another, at most
 * 7 days apart, neither sorted yet as anything but a transfer that isn't paired. Payments out are taken in date order,
 * each with the nearest such payment in (the earlier one on a tie). The result is maximal: no payment out and payment
 * in that could still pair are both left over.
 */
export function pairOffers(report: Report, payments: Payment[], sorts: Map<string, Sort | null>): PairOffer[] {
  const free = (p: Payment) => {
    const s = sorts.get(p.id)
    return inPeriodOrNear(report, p.date) && (!s || (s.c === TRANSFER && s.by !== 'pair'))
  }
  const outs = payments.filter((p) => p.amount < 0 && free(p))
  const ins = payments.filter((p) => p.amount > 0 && free(p))
  const insByAmount = new Map<number, Payment[]>()
  for (const p of ins) {
    const list = insByAmount.get(p.amount)
    if (list) list.push(p)
    else insByAmount.set(p.amount, [p])
  }
  const accountOrder = new Map(report.accounts.map((a, i) => [a.id, i]))
  const last4 = new Map(report.accounts.map((a) => [a.id, a.last4]))
  outs.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) || (accountOrder.get(a.account)! - accountOrder.get(b.account)!) || (a.id < b.id ? -1 : 1))
  const taken = new Set<string>()
  const offers: PairOffer[] = []
  for (const o of outs) {
    const so = sorts.get(o.id)
    const candidates = (insByAmount.get(-o.amount) ?? []).filter((i) => {
      if (taken.has(i.id) || i.account === o.account) return false
      if (Math.abs(daysBetween(o.date, i.date)) > 7) return false
      if (so?.o && so.o !== i.account) return false
      const si = sorts.get(i.id)
      if (si?.o && si.o !== o.account) return false
      return true
    })
    if (!candidates.length) continue
    candidates.sort(
      (a, b) =>
        Math.abs(daysBetween(o.date, a.date)) - Math.abs(daysBetween(o.date, b.date)) ||
        (a.date < b.date ? -1 : a.date > b.date ? 1 : 0) ||
        (accountOrder.get(a.account)! - accountOrder.get(b.account)!) ||
        (a.id < b.id ? -1 : 1),
    )
    const i = candidates[0]
    taken.add(i.id)
    const d = `${norm(o.description)} ${norm(i.description)}`
    const l4o = last4.get(o.account) ?? ''
    const l4i = last4.get(i.account) ?? ''
    const likely =
      TRANSFER_WORDS.test(d) ||
      (l4i.length === 4 && norm(o.description).includes(l4i)) ||
      (l4o.length === 4 && norm(i.description).includes(l4o))
    offers.push({ out: o.id, into: i.id, days: daysBetween(o.date, i.date), likely })
  }
  return offers
}

/** Payments in the period, or within a week of it (a transfer's other half can fall just outside). */
function inPeriodOrNear(report: Report, date: string): boolean {
  return date >= addDays(report.start, -7) && date <= addDays(report.end, 7)
}

// --- What the report asks

export interface Line {
  key: string
  total: number
  payments: string[]
}

export interface Totals {
  moneyIn: number
  moneyOut: number
  count: number
}

export interface Trouble {
  /** The payment after which the download's running balance stops adding up, and the next one. */
  after: string
  next: string
  /** The balance the next payment should leave, and the one the download shows. */
  expected: number
  shown: number
  /** A payment typed in, or from a download with no balance, that accounts for the gap. */
  filledBy: string[]
}

export interface AccountCheck {
  account: Account
  /** Payments in the period, and their money in and out. */
  inPeriod: Totals
  /** Money moved in or out of this account recorded only in the other account's download (a balances-only account). */
  oneSided: Totals
  unsorted: Totals
  /** Payments before and after the period: kept, not counted. */
  before: number
  after: number
  /** Opening plus money in less money out, when the opening balance is known. */
  worked: number | null
  /** The worked closing balance less the statement's, when both are known. */
  difference: number | null
  /** The balances the download's running balance implies at the start and the end of the period. */
  download: { opening: number | null; closing: number | null }
  hasBalances: boolean
  troubles: Trouble[]
  /** Payments that look the same (date, amount, description) in one download, to check. */
  lookAlikes: string[][]
  /** Transfers to or from this account that its own download doesn't show. */
  unmatched: string[]
  /** Money in and out of the account by month, for comparing with paper statements. */
  months: { month: string; moneyIn: number; moneyOut: number }[]
}

export interface Results {
  payments: Payment[]
  byId: Map<string, Payment>
  sorts: Map<string, Sort | null>
  accounts: AccountCheck[]
  online: {
    moneyIn: { group: string; lines: Line[]; total: number }[]
    moneyOut: { group: string; lines: Line[]; total: number }[]
    gifts: Line
    expenses: Line
    transfers: { from: string; to: string; total: number; payments: string[] }[]
    unsorted: Totals
    opening: number | null
    closing: number | null
    moneyInTotal: number
    moneyOutTotal: number
    /** Opening plus money in, less money out, gifts, and deputy expenses: the report's own sum. */
    worked: number | null
    /** The worked balance less the closing balances; the online report treats under 20p as balanced. */
    offset: number | null
  }
  paper: {
    account: Account
    rowsIn: (Line & { parts: Line[] })[]
    rowsOut: (Line & { parts: Line[] })[]
    totalIn: number
    totalOut: number
    unsorted: Totals
    boxes: { b1: number | null; b2: number; b3: number | null; b4: number; b5: number | null; b6: number | null }
  }[]
}

function addTo(map: Map<string, Line>, key: string, p: Payment, amount: number) {
  const line = map.get(key) ?? { key, total: 0, payments: [] }
  line.total += amount
  line.payments.push(p.id)
  map.set(key, line)
}

/**
 * The running balance's story, from the account's downloads: where it stops adding up (each balance should be the
 * one before plus the payments since), and the balances it shows at the start and the end of the period. A download
 * may give a balance on every payment or only on some (the day's last, say); payments without one move the balance
 * on unchecked. Within a day they go first, then those with a balance, in the order their balances follow from each
 * other (files list a day's payments either way round). Payments typed in, or from a download with no balance at all,
 * can't be placed in the running balance: one whose amount is a gap's, dated from the day before the gap to its day,
 * is said to account for it.
 */
function trailOf(report: Report, payments: Payment[], fillerSources: Set<string>): {
  troubles: Trouble[]
  opening: number | null
  closing: number | null
  hasBalances: boolean
} {
  const own = payments.filter((p) => !fillerSources.has(p.source))
  const typed = payments.filter((p) => fillerSources.has(p.source))
  if (!own.some((p) => p.balance !== null)) return { troubles: [], opening: null, closing: null, hasBalances: false }
  const byDate = new Map<string, Payment[]>()
  for (const p of own) {
    const list = byDate.get(p.date)
    if (list) list.push(p)
    else byDate.set(p.date, [p])
  }
  const sequence: Payment[] = []
  let running: number | null = null
  for (const date of [...byDate.keys()].sort()) {
    const day = byDate.get(date)!
    const plain = day.filter((p) => p.balance === null)
    let left = day.filter((p) => p.balance !== null)
    sequence.push(...plain)
    let from: number | null = running === null ? null : running + plain.reduce((s, p) => s + p.amount, 0)
    while (left.length) {
      const at: number | null = from
      let k: number = at === null ? -1 : left.findIndex((p) => p.balance === at + p.amount)
      if (k < 0) k = left.findIndex((p) => !left.some((q) => q !== p && q.balance === p.balance! - p.amount))
      if (k < 0) k = 0
      const next: Payment = left[k]
      sequence.push(next)
      from = next.balance
      left = left.filter((_, i) => i !== k)
    }
    running = from
  }
  // The balance before the first payment: the first balance shown, less the payments up to it.
  const first = sequence.findIndex((p) => p.balance !== null)
  let prev = sequence[first].balance! - sequence.slice(0, first + 1).reduce((s, p) => s + p.amount, 0)
  const used = new Set<string>()
  const troubles: Trouble[] = []
  let opening: number | null = null
  let closing: number | null = null
  let started = false
  for (let i = 0; i < sequence.length; i++) {
    const p = sequence[i]
    const expected = prev + p.amount
    if (inPeriod(report, p.date) && !started) {
      opening = prev
      started = true
    }
    if (p.balance !== null && p.balance !== expected) {
      const before = sequence[i - 1] ?? p
      const gap = p.balance - expected
      const from = addDays(before.date, -1)
      const fill = typed.find((t) => !used.has(t.id) && t.amount === gap && t.date >= from && t.date <= p.date)
      if (fill) used.add(fill.id)
      troubles.push({ after: before.id, next: p.id, expected, shown: p.balance, filledBy: fill ? [fill.id] : [] })
      prev = p.balance
    } else prev = p.balance ?? expected
    if (inPeriod(report, p.date)) closing = prev
  }
  if (!started) {
    // Every payment is before the period (or after it): the balance after the last one before it is the opening.
    const lastBefore = [...sequence].reverse().findIndex((p) => p.date < report.start)
    opening = lastBefore < 0 ? null : prev
    closing = null
  }
  return { troubles, opening, closing, hasBalances: true }
}

/** Halves of transfers sorted on both sides but not paired: matched up (same amount, at most 7 days apart). */
function matchHalves(report: Report, payments: Payment[], sorts: Map<string, Sort | null>): Set<string> {
  const matched = new Set<string>()
  const halves = payments.filter((p) => {
    const s = sorts.get(p.id)
    return s?.c === TRANSFER && s.by !== 'pair'
  })
  const outs = halves.filter((p) => p.amount < 0).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1))
  const ins = halves.filter((p) => p.amount > 0)
  for (const o of outs) {
    const so = sorts.get(o.id)!
    let best: Payment | null = null
    for (const i of ins) {
      if (matched.has(i.id) || i.amount !== -o.amount || i.account !== so.o || sorts.get(i.id)!.o !== o.account) continue
      const d = Math.abs(daysBetween(o.date, i.date))
      if (d > 7) continue
      if (!best || d < Math.abs(daysBetween(o.date, best.date)) || (d === Math.abs(daysBetween(o.date, best.date)) && i.date < best.date)) best = i
    }
    if (best) {
      matched.add(o.id)
      matched.add(best.id)
    }
  }
  void report
  return matched
}

/** Everything the report needs, worked out from the report's state. */
export function resultsOf(report: Report): Results {
  const payments = allPayments(report)
  const byId = new Map(payments.map((p) => [p.id, p]))
  const sorts = sortsOf(report, payments)
  const accountsWithRows = new Set(payments.map((p) => p.account))
  // Sources that can't place a payment in the running balance: rows typed in, and downloads with no balance at all.
  const fillerSources = new Set(report.sources.filter((s) => s.typed || s.rows.every((r) => r.balance === null)).map((s) => s.id))

  const onlineIn = new Map<string, Line>()
  const onlineOut = new Map<string, Line>()
  const gifts: Line = { key: GIFT, total: 0, payments: [] }
  const expenses: Line = { key: DEPUTY_EXPENSE, total: 0, payments: [] }
  const transfers = new Map<string, { from: string; to: string; total: number; payments: string[] }>()
  const unsortedAll: Totals = { moneyIn: 0, moneyOut: 0, count: 0 }
  let moneyInTotal = 0
  let moneyOutTotal = 0

  const checks: AccountCheck[] = []
  const paper: Results['paper'] = []
  const oneSided = new Map<string, Totals>(report.accounts.map((a) => [a.id, { moneyIn: 0, moneyOut: 0, count: 0 }]))
  const unmatched = new Map<string, string[]>(report.accounts.map((a) => [a.id, []]))

  // Transfers recorded on one side only.
  const halves = matchHalves(report, payments, sorts)
  for (const p of payments) {
    if (!inPeriod(report, p.date)) continue
    const s = sorts.get(p.id)
    if (!s || s.c !== TRANSFER || !s.o || s.by === 'pair' || halves.has(p.id)) continue
    if (accountsWithRows.has(s.o)) {
      unmatched.get(s.o)?.push(p.id)
    } else {
      const t = oneSided.get(s.o)
      if (!t) continue
      if (p.amount < 0) t.moneyIn += -p.amount
      else t.moneyOut += p.amount
      t.count++
    }
  }

  for (const account of report.accounts) {
    const mine = payments.filter((p) => p.account === account.id)
    const inside = mine.filter((p) => inPeriod(report, p.date))
    const totals: Totals = { moneyIn: 0, moneyOut: 0, count: inside.length }
    const unsorted: Totals = { moneyIn: 0, moneyOut: 0, count: 0 }
    const paperIn = new Map<string, Line>()
    const paperOut = new Map<string, Line>()
    const partsIn = new Map<string, Map<string, Line>>()
    const partsOut = new Map<string, Map<string, Line>>()
    const months = new Map<string, { month: string; moneyIn: number; moneyOut: number }>()
    const part = (store: Map<string, Map<string, Line>>, row: string, key: string, p: Payment, amount: number) => {
      const m = store.get(row) ?? new Map<string, Line>()
      addTo(m, key, p, amount)
      store.set(row, m)
    }
    for (const p of inside) {
      const amount = Math.abs(p.amount)
      const month = p.date.slice(0, 7)
      const mo = months.get(month) ?? { month, moneyIn: 0, moneyOut: 0 }
      if (p.amount > 0) {
        totals.moneyIn += amount
        mo.moneyIn += amount
      } else {
        totals.moneyOut += amount
        mo.moneyOut += amount
      }
      months.set(month, mo)
      const s = sorts.get(p.id)
      if (!s) {
        if (p.amount > 0) unsorted.moneyIn += amount
        else if (p.amount < 0) unsorted.moneyOut += amount
        if (p.amount !== 0) unsorted.count++
        continue
      }
      if (s.c === TRANSFER) {
        // Each transfer is counted once in "Money transfers": from the account the money left, or from the account
        // it reached when the other has no payments of its own here.
        const fromHere = p.amount < 0
        if (fromHere || !accountsWithRows.has(s.o!)) {
          const from = fromHere ? account.id : s.o!
          const to = fromHere ? s.o! : account.id
          const k = `${from}>${to}`
          const t = transfers.get(k) ?? { from, to, total: 0, payments: [] }
          t.total += amount
          t.payments.push(p.id)
          transfers.set(k, t)
        }
        if (fromHere) {
          addTo(paperOut, 'transfers-out', p, amount)
          part(partsOut, 'transfers-out', TRANSFER, p, amount)
        } else {
          addTo(paperIn, 'transfers-in', p, amount)
          part(partsIn, 'transfers-in', TRANSFER, p, amount)
        }
        continue
      }
      if (s.c === GIFT) {
        gifts.total += amount
        gifts.payments.push(p.id)
        addTo(paperOut, 'gifts', p, amount)
        part(partsOut, 'gifts', GIFT, p, amount)
        continue
      }
      if (s.c === DEPUTY_EXPENSE) {
        expenses.total += amount
        expenses.payments.push(p.id)
        addTo(paperOut, 'deputy-expenses', p, amount)
        part(partsOut, 'deputy-expenses', DEPUTY_EXPENSE, p, amount)
        continue
      }
      const t = TYPE_BY_KEY.get(s.c)!
      if (t.dir === 'in') {
        addTo(onlineIn, t.key, p, amount)
        addTo(paperIn, t.paper, p, amount)
        part(partsIn, t.paper, t.key, p, amount)
      } else {
        addTo(onlineOut, t.key, p, amount)
        addTo(paperOut, t.paper, p, amount)
        part(partsOut, t.paper, t.key, p, amount)
      }
    }
    // Unsorted payments are real money in or out: they count in the report's totals, and are shown apart.
    unsortedAll.moneyIn += unsorted.moneyIn
    unsortedAll.moneyOut += unsorted.moneyOut
    unsortedAll.count += unsorted.count

    const side = oneSided.get(account.id)!
    if (!accountsWithRows.has(account.id) && side.count) {
      // A balances-only account: its money moved by transfers recorded in the other accounts' downloads.
      for (const p of payments) {
        const s = sorts.get(p.id)
        if (!inPeriod(report, p.date) || !s || s.c !== TRANSFER || s.o !== account.id) continue
        const amount = Math.abs(p.amount)
        if (p.amount < 0) addTo(paperIn, 'transfers-in', p, amount)
        else addTo(paperOut, 'transfers-out', p, amount)
        part(p.amount < 0 ? partsIn : partsOut, p.amount < 0 ? 'transfers-in' : 'transfers-out', TRANSFER, p, amount)
      }
    }
    const moneyIn = totals.moneyIn + side.moneyIn
    const moneyOut = totals.moneyOut + side.moneyOut
    const worked = account.opening === null ? null : account.opening + moneyIn - moneyOut
    const trail = trailOf(report, mine, fillerSources)
    const lookAlikes: string[][] = []
    const groups = new Map<string, string[]>()
    for (const p of inside) {
      const k = `${p.source}|${p.date}|${p.amount}|${norm(p.description)}`
      const list = groups.get(k)
      if (list) list.push(p.id)
      else groups.set(k, [p.id])
    }
    for (const ids of groups.values()) if (ids.length > 1) lookAlikes.push(ids)
    checks.push({
      account,
      inPeriod: totals,
      oneSided: side,
      unsorted,
      before: mine.filter((p) => p.date < report.start).length,
      after: mine.filter((p) => p.date > report.end).length,
      worked,
      difference: worked === null || account.closing === null ? null : worked - account.closing,
      download: { opening: trail.opening, closing: trail.closing },
      hasBalances: trail.hasBalances,
      troubles: trail.troubles,
      lookAlikes,
      unmatched: unmatched.get(account.id) ?? [],
      months: [...months.values()].sort((a, b) => (a.month < b.month ? -1 : 1)),
    })
    if (account.main) {
      const rows = (dir: Direction, totalsByRow: Map<string, Line>, parts: Map<string, Map<string, Line>>) =>
        PAPER_ROWS.filter((r) => r.dir === dir).map((r) => {
          const line = totalsByRow.get(r.key) ?? { key: r.key, total: 0, payments: [] }
          return { ...line, parts: [...(parts.get(r.key)?.values() ?? [])] }
        })
      const rowsIn = rows('in', paperIn, partsIn)
      const rowsOut = rows('out', paperOut, partsOut)
      const totalIn = rowsIn.reduce((s, r) => s + r.total, 0)
      const totalOut = rowsOut.reduce((s, r) => s + r.total, 0)
      // Boxes 2 and 4 are the page totals once every payment is sorted: the account's own money in and out.
      const b2 = moneyIn
      const b4 = moneyOut
      const b1 = account.opening
      const b3 = b1 === null ? null : b1 + b2
      const b5 = b3 === null ? null : b3 - b4
      paper.push({ account, rowsIn, rowsOut, totalIn, totalOut, unsorted, boxes: { b1, b2, b3, b4, b5, b6: account.closing } })
    }
    for (const p of inside) {
      const s = sorts.get(p.id)
      if (s?.c === TRANSFER) continue
      if (p.amount > 0) moneyInTotal += p.amount
      else if (!s || (s.c !== GIFT && s.c !== DEPUTY_EXPENSE)) moneyOutTotal += -p.amount
    }
  }

  const grouped = (dir: Direction, map: Map<string, Line>) =>
    GROUPS.filter((g) => g.dir === dir)
      .map((g) => {
        const lines = TYPES.filter((t) => t.group === g.key && map.has(t.key)).map((t) => map.get(t.key)!)
        return { group: g.key, lines, total: lines.reduce((s, l) => s + l.total, 0) }
      })
      .filter((g) => g.lines.length)

  const knownOpening = report.accounts.length > 0 && report.accounts.every((a) => a.opening !== null)
  const knownClosing = report.accounts.length > 0 && report.accounts.every((a) => a.closing !== null)
  const opening = knownOpening ? report.accounts.reduce((s, a) => s + a.opening!, 0) : null
  const closing = knownClosing ? report.accounts.reduce((s, a) => s + a.closing!, 0) : null
  const worked = opening === null ? null : opening + moneyInTotal - moneyOutTotal - gifts.total - expenses.total
  return {
    payments,
    byId,
    sorts,
    accounts: checks,
    online: {
      moneyIn: grouped('in', onlineIn),
      moneyOut: grouped('out', onlineOut),
      gifts,
      expenses,
      transfers: [...transfers.values()],
      unsorted: unsortedAll,
      opening,
      closing,
      moneyInTotal,
      moneyOutTotal,
      worked,
      offset: worked === null || closing === null ? null : worked - closing,
    },
    paper,
  }
}

// --- Changes

export function newId(prefix: string): string {
  const r = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
  return `${prefix}${hash(r)}`
}

export function emptyReport(start: string): Report {
  return { client: '', start, end: defaultEnd(start), accounts: [], sources: [], sorted: {}, rules: [] }
}

/** Next year's report: the day after this one ends, the same accounts opening at this year's closing balances. */
export function nextYear(report: Report): Report {
  const start = addDays(report.end, 1)
  return {
    client: report.client,
    start,
    end: defaultEnd(start),
    accounts: report.accounts.map((a) => ({ ...a, opening: a.closing, closing: null })),
    sources: [],
    sorted: {},
    rules: report.rules.map((r) => ({ ...r })),
  }
}

export interface Added {
  report: Report
  /** Rows read, payments new to the account, and payments it already had (from overlapping downloads). */
  rows: number
  added: number
  already: number
  /** Rows dated within days the account's other downloads already cover, that matched none of their payments. */
  newInOverlap: string[]
  outside: number
  from: string | null
  to: string | null
}

/** Adds a download's rows to an account, and says what it added. */
export function addSource(report: Report, accountId: string, name: string, rows: RawRow[], typed = false): Added {
  const before = paymentsOf(report, accountId)
  const beforeIds = new Set(before.map((p) => p.id))
  const covered = new Set<string>()
  for (const s of report.sources) if (s.account === accountId && !s.typed) for (const r of s.rows) covered.add(r.date)
  const source: Source = {
    id: newId('s'),
    account: accountId,
    name: name.slice(0, LIMITS.text),
    typed,
    rows: rows.map((r) => ({ ...r, description: r.description.slice(0, LIMITS.text) })),
    added: Date.now(),
  }
  const next: Report = { ...report, sources: [...report.sources, source] }
  const after = paymentsOf(next, accountId)
  const fresh = after.filter((p) => !beforeIds.has(p.id))
  const dates = rows.map((r) => r.date).sort()
  return {
    report: next,
    rows: rows.length,
    added: fresh.length,
    already: rows.length - fresh.filter((p) => p.source === source.id).length,
    newInOverlap: fresh.filter((p) => p.source === source.id && covered.has(p.date)).map((p) => p.id),
    outside: rows.filter((r) => !inPeriod(report, r.date)).length,
    from: dates[0] ?? null,
    to: dates[dates.length - 1] ?? null,
  }
}

export function removeSource(report: Report, sourceId: string): Report {
  return { ...report, sources: report.sources.filter((s) => s.id !== sourceId) }
}

export function storedRows(report: Report): number {
  return report.sources.reduce((n, s) => n + s.rows.length, 0)
}

/** Sorts payments by hand (or clears them with null); a paired transfer's other half is unpaired too. */
export function sortBy(report: Report, ids: string[], a: Assignment | null): Report {
  const sorted = { ...report.sorted }
  for (const id of ids) {
    const old = sorted[id]
    if (old?.p && sorted[old.p]?.p === id) {
      const other = { ...sorted[old.p] }
      delete other.p
      sorted[old.p] = other
    }
    if (a) {
      const keep: Assignment = { c: a.c }
      if (a.o) keep.o = a.o
      if (a.n ?? old?.n) keep.n = (a.n ?? old?.n)!.slice(0, LIMITS.text)
      sorted[id] = keep
    } else if (old?.n) sorted[id] = { c: '', n: old.n }
    else delete sorted[id]
  }
  return { ...report, sorted: clean(sorted) }
}

/** A note on a payment, kept whatever it's sorted as. */
export function noteOn(report: Report, id: string, note: string): Report {
  const sorted = { ...report.sorted }
  const n = note.trim().slice(0, LIMITS.text)
  const old = sorted[id] ?? { c: '' }
  const next: Assignment = { ...old }
  if (n) next.n = n
  else delete next.n
  sorted[id] = next
  return { ...report, sorted: clean(sorted) }
}

/** Entries with neither a sort nor a note go; an empty sort means "not sorted by hand" (a rule may still apply). */
function clean(sorted: Record<string, Assignment>): Record<string, Assignment> {
  const out: Record<string, Assignment> = {}
  for (const [id, a] of Object.entries(sorted)) if (a.c || a.n) out[id] = a
  return out
}

export function pair(report: Report, outId: string, intoId: string, payments: Map<string, Payment>): Report {
  const o = payments.get(outId)
  const i = payments.get(intoId)
  if (!o || !i || o.account === i.account || o.amount !== -i.amount) return report
  let next = sortBy(report, [outId, intoId], null)
  const sorted = { ...next.sorted }
  sorted[outId] = { ...(sorted[outId]?.n ? { n: sorted[outId].n } : {}), c: TRANSFER, o: i.account, p: intoId }
  sorted[intoId] = { ...(sorted[intoId]?.n ? { n: sorted[intoId].n } : {}), c: TRANSFER, o: o.account, p: outId }
  next = { ...next, sorted }
  return next
}

export function addRule(report: Report, rule: Omit<Rule, 'id'>): Report {
  const text = rule.text.trim().slice(0, 100)
  if (!text || report.rules.length >= LIMITS.rules) return report
  return { ...report, rules: [...report.rules, { ...rule, text, id: newId('r') }] }
}

export function removeRule(report: Report, id: string): Report {
  return { ...report, rules: report.rules.filter((r) => r.id !== id) }
}

export function removeAccount(report: Report, id: string): Report {
  const gone = new Set(report.sources.filter((s) => s.account === id).map((s) => s.id))
  const sorted: Record<string, Assignment> = {}
  for (const [pid, a] of Object.entries(report.sorted)) if (!pid.startsWith(`${id}:`)) sorted[pid] = a
  return {
    ...report,
    accounts: report.accounts.filter((a) => a.id !== id),
    sources: report.sources.filter((s) => !gone.has(s.id)),
    sorted,
    rules: report.rules.filter((r) => r.o !== id),
  }
}

// --- What a sort is called

export function sortLabel(c: string, o: string | undefined, report: Report, named: (label: string) => string): string {
  if (c === GIFT) return 'Gift'
  if (c === DEPUTY_EXPENSE) return 'Deputy expense'
  if (c === TRANSFER) {
    const a = report.accounts.find((x) => x.id === o)
    return a ? `Moved to or from ${accountName(a)}` : 'Moved between accounts'
  }
  const t = TYPE_BY_KEY.get(c)
  return t ? named(t.label) : c
}

export function accountName(a: Account): string {
  return a.last4 ? `${a.name || 'Account'} (…${a.last4})` : a.name || 'Account'
}

// --- Saving

export const STORAGE_KEY = 'labs:deputyship-accounts'
export const FILE_TAG = 'labs:deputyship-accounts'

export function serialize(report: Report): string {
  return JSON.stringify({ v: 1, report })
}

function isPennies(n: unknown): n is number {
  return typeof n === 'number' && Number.isSafeInteger(n) && Math.abs(n) < 1e15
}

function validRow(r: unknown): r is RawRow {
  if (!r || typeof r !== 'object') return false
  const x = r as Record<string, unknown>
  return (
    isIso(x.date) &&
    typeof x.description === 'string' &&
    isPennies(x.amount) &&
    (x.balance === null || isPennies(x.balance)) &&
    (x.bankId === undefined || typeof x.bankId === 'string') &&
    typeof x.line === 'number'
  )
}

/** A report from saved text: every part checked, so damaged data is refused rather than half used. */
export function restore(text: string): { report: Report } | { error: string } {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { error: 'It isn’t a saved report (it can’t be read).' }
  }
  const d = data as { v?: unknown; report?: unknown; app?: unknown }
  if (!d || typeof d !== 'object' || d.v !== 1 || !d.report || typeof d.report !== 'object')
    return { error: 'It isn’t a saved report from this page.' }
  const r = d.report as Record<string, unknown>
  if (typeof r.client !== 'string' || !isIso(r.start) || !isIso(r.end) || r.end < r.start)
    return { error: 'The report’s period is damaged.' }
  if (!Array.isArray(r.accounts) || r.accounts.length > LIMITS.accounts) return { error: 'The accounts are damaged.' }
  const accounts: Account[] = []
  for (const a of r.accounts as Record<string, unknown>[]) {
    if (
      !a ||
      typeof a.id !== 'string' ||
      typeof a.name !== 'string' ||
      typeof a.last4 !== 'string' ||
      typeof a.main !== 'boolean' ||
      !(a.opening === null || isPennies(a.opening)) ||
      !(a.closing === null || isPennies(a.closing))
    )
      return { error: 'An account is damaged.' }
    accounts.push({ id: a.id, name: a.name, last4: a.last4, main: a.main, opening: a.opening as number | null, closing: a.closing as number | null })
  }
  const ids = new Set(accounts.map((a) => a.id))
  if (ids.size !== accounts.length) return { error: 'Two accounts share an id.' }
  if (!Array.isArray(r.sources) || r.sources.length > LIMITS.sources) return { error: 'The downloads are damaged.' }
  const sources: Source[] = []
  let rows = 0
  for (const s of r.sources as Record<string, unknown>[]) {
    if (
      !s ||
      typeof s.id !== 'string' ||
      typeof s.account !== 'string' ||
      !ids.has(s.account) ||
      typeof s.name !== 'string' ||
      typeof s.typed !== 'boolean' ||
      typeof s.added !== 'number' ||
      !Array.isArray(s.rows) ||
      !s.rows.every(validRow)
    )
      return { error: 'A download is damaged.' }
    rows += s.rows.length
    sources.push({ id: s.id, account: s.account, name: s.name, typed: s.typed, added: s.added, rows: s.rows as RawRow[] })
  }
  if (rows > LIMITS.rows) return { error: 'There are more payments than this page keeps.' }
  if (!r.sorted || typeof r.sorted !== 'object' || Array.isArray(r.sorted)) return { error: 'The sorting is damaged.' }
  const sorted: Record<string, Assignment> = {}
  for (const [id, v] of Object.entries(r.sorted as Record<string, unknown>)) {
    const a = v as Record<string, unknown>
    if (!a || typeof a.c !== 'string' || (a.o !== undefined && typeof a.o !== 'string') || (a.p !== undefined && typeof a.p !== 'string') || (a.n !== undefined && typeof a.n !== 'string'))
      return { error: 'The sorting is damaged.' }
    if (a.c && a.c !== GIFT && a.c !== DEPUTY_EXPENSE && a.c !== TRANSFER && !TYPE_BY_KEY.has(a.c)) continue
    const keep: Assignment = { c: a.c }
    if (a.o) keep.o = a.o as string
    if (a.p) keep.p = a.p as string
    if (a.n) keep.n = a.n as string
    sorted[id] = keep
  }
  if (!Array.isArray(r.rules) || r.rules.length > LIMITS.rules) return { error: 'The rules are damaged.' }
  const rules: Rule[] = []
  for (const x of r.rules as Record<string, unknown>[]) {
    if (!x || typeof x.id !== 'string' || typeof x.text !== 'string' || (x.dir !== 'in' && x.dir !== 'out') || typeof x.c !== 'string' || (x.o !== undefined && typeof x.o !== 'string'))
      return { error: 'A rule is damaged.' }
    if (x.c !== GIFT && x.c !== DEPUTY_EXPENSE && x.c !== TRANSFER && !TYPE_BY_KEY.has(x.c)) continue
    const rule: Rule = { id: x.id, text: x.text, dir: x.dir, c: x.c }
    if (x.o) rule.o = x.o as string
    rules.push(rule)
  }
  return { report: { client: r.client, start: r.start, end: r.end, accounts, sources, sorted, rules } }
}

// --- The spreadsheet

function cell(s: string): string {
  const v = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

/** Every payment and how it's sorted, for the deputy's records or to send with the report. */
export function toCsv(report: Report, results: Results, named: (label: string) => string): string {
  const accountsById = new Map(report.accounts.map((a) => [a.id, a]))
  const head = ['Date', 'Account', 'Description', 'Money in', 'Money out', 'Sorted as', 'Online report', 'Paper form row', 'Note', 'In the reporting period']
  const lines = [head.map(cell).join(',')]
  for (const p of results.payments) {
    const s = results.sorts.get(p.id)
    const a = accountsById.get(p.account)!
    let online = ''
    let paperRow = ''
    if (s) {
      if (s.c === GIFT) [online, paperRow] = ['Gifts', 'Gifts']
      else if (s.c === DEPUTY_EXPENSE) [online, paperRow] = ['Deputy expenses', 'Deputy’s expenses']
      else if (s.c === TRANSFER) {
        online = 'Money transfers'
        paperRow = p.amount < 0 ? 'Transfers out to client’s other accounts' : 'Transfers in from client’s other accounts'
      } else {
        const t = TYPE_BY_KEY.get(s.c)!
        const g = GROUPS.find((x) => x.key === t.group)!
        online = `${t.dir === 'in' ? 'Money in' : 'Money out'}: ${named(g.label)}`
        paperRow = PAPER_ROWS.find((r) => r.key === t.paper)!.label
      }
    }
    const note = report.sorted[p.id]?.n ?? ''
    lines.push(
      [
        p.date,
        accountName(a),
        p.description,
        p.amount > 0 ? plain(p.amount) : '',
        p.amount < 0 ? plain(-p.amount) : '',
        s ? sortLabel(s.c, s.o, report, named) : 'Not sorted yet',
        online,
        paperRow,
        note,
        inPeriod(report, p.date) ? 'Yes' : 'No',
      ]
        .map((v, i) => (i === 3 || i === 4 ? v : cell(v)))
        .join(','),
    )
  }
  // A byte-order mark first, so Excel reads £ and apostrophes as UTF-8.
  return `\ufeff${lines.join('\r\n')}\r\n`
}
