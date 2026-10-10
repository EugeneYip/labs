/**
 * Fair Share's data and math: a group of people, expenses and payments in
 * whole minor units (such as cents) so totals always add up, balances, the
 * fewest payments to settle up, and the compact link format that carries a
 * whole group. No React and no storage here.
 */

export interface Group {
  id: string
  name: string
  /** ISO 4217 code, such as "USD". */
  currency: string
  people: string[]
  entries: Entry[]
}

export interface Entry {
  id: string
  kind: 'expense' | 'payment'
  /** What an expense was for. Payments have none. */
  description: string
  /** In the currency's smallest unit, such as cents. */
  amount: number
  /** Who paid, as an index into `people`. */
  payer: number
  /** Who shares an expense equally, or who received a payment, as indexes into `people`. */
  split: number[]
}

export interface Transfer {
  from: number
  to: number
  amount: number
}

export const LIMITS = { name: 80, person: 40, people: 30, description: 120, entries: 1000, amount: 1e12 }

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'JPY', 'CNY', 'HKD', 'TWD', 'KRW', 'SGD', 'INR', 'THB', 'MXN', 'BRL', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'ZAR', 'AED', 'ILS', 'TRY']

export function newGroup(name: string, people: string[], currency: string): Group {
  return { id: randomId(), name, currency, people, entries: [] }
}

export function randomId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => (b % 36).toString(36)).join('')
}

/** "Alex, Sam\nPriya" → ["Alex", "Sam", "Priya"]: trimmed, shortened, without repeats. */
export function parsePeople(text: string): string[] {
  const seen = new Set<string>()
  return text
    .split(/[,\n;]/)
    .map((name) => name.trim().replace(/\s+/g, ' ').slice(0, LIMITS.person))
    .filter((name) => name && !seen.has(name.toLowerCase()) && seen.add(name.toLowerCase()))
    .slice(0, LIMITS.people)
}

// Money

export function minorDigits(currency: string): number {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}

export function formatMoney(amount: number, currency: string, signed = false): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, signDisplay: signed ? 'exceptZero' : 'auto' }).format(amount / 10 ** minorDigits(currency))
}

/**
 * Reads typed amounts such as "12.50", "12,50", "1,234.56", "1.234,56", or "$8"
 * into minor units. A lone separator before exactly three digits is read as a
 * thousands separator ("1,234"). Null when it isn't a positive amount the
 * currency can represent.
 */
export function parseAmount(text: string, currency: string): number | null {
  if (text.includes('-')) return null
  const cleaned = text.replace(/[^\d.,]/g, '')
  if (!/\d/.test(cleaned)) return null
  const digits = minorDigits(currency)
  const lastDot = cleaned.lastIndexOf('.')
  const lastComma = cleaned.lastIndexOf(',')
  let point = Math.max(lastDot, lastComma)
  if (point >= 0 && (lastDot < 0 || lastComma < 0)) {
    // Only one kind of separator: decide whether it groups thousands or marks the decimals.
    const groups = cleaned.split(cleaned[point])
    if (groups.length > 2 || (groups[1].length === 3 && digits !== 3)) {
      if (groups.at(-1)!.length !== 3) return null // like "10.50.3"
      point = -1
    }
  }
  const whole = (point >= 0 ? cleaned.slice(0, point) : cleaned).replace(/[.,]/g, '')
  const fraction = point >= 0 ? cleaned.slice(point + 1) : ''
  if (/[.,]/.test(fraction)) return null
  if (/[1-9]/.test(fraction.slice(digits))) return null
  const value = Number(whole || '0') * 10 ** digits + Number(fraction.padEnd(digits, '0').slice(0, digits) || '0')
  return Number.isSafeInteger(value) && value > 0 && value <= LIMITS.amount ? value : null
}

/** Minor units back into a plain editable number, such as "12.50". */
export function amountToText(amount: number, currency: string): string {
  const digits = minorDigits(currency)
  return digits ? (amount / 10 ** digits).toFixed(digits) : String(amount)
}

// Math

/** Equal shares of an amount. Leftover cents go to the first people, so shares always add up exactly. */
export function shares(amount: number, count: number): number[] {
  const base = Math.floor(amount / count)
  const extra = amount - base * count
  return Array.from({ length: count }, (_, k) => base + (k < extra ? 1 : 0))
}

/** What each person has paid minus what they've used. Positive: they're owed money. The total is always zero. */
export function balances(group: Group): number[] {
  const result = group.people.map(() => 0)
  for (const entry of group.entries) {
    result[entry.payer] += entry.amount
    shares(entry.amount, entry.split.length).forEach((share, k) => (result[entry.split[k]] -= share))
  }
  return result
}

/** Up to this many people with something to settle, the fewest payments are found exactly. */
const EXACT = 16

/**
 * The fewest payments that settle every balance. People whose balances cancel
 * out among themselves settle within their own circle, which saves a payment
 * per extra circle, and within each circle whoever owes most pays whoever is
 * owed most. Finding the circles is a search, so past 16 people with something
 * to settle, everyone settles as one circle, which can take a payment more.
 */
export function settle(balanceList: number[]): Transfer[] {
  const open = balanceList.map((b, i) => ({ i, b })).filter((x) => x.b !== 0)
  const circles = open.length <= EXACT ? zeroSumGroups(open.map((x) => x.b)).map((g) => g.map((k) => open[k])) : [open]
  return circles.flatMap(settleCircle).sort((x, y) => y.amount - x.amount || x.from - y.from || x.to - y.to)
}

/**
 * Splits values that sum to zero into as many zero-sum groups as possible.
 * The most groups for a set is the most for the set minus one member, plus one
 * when the set itself sums to zero; walking that back gives an order whose
 * running total touches zero at each group's end.
 */
export function zeroSumGroups(values: number[]): number[][] {
  const n = values.length
  const full = (1 << n) - 1
  const sum = new Float64Array(full + 1)
  const most = new Int8Array(full + 1)
  const bitIndex = (bit: number) => 31 - Math.clz32(bit)
  for (let m = 1; m <= full; m++) {
    const low = m & -m
    sum[m] = sum[m ^ low] + values[bitIndex(low)]
    let best = 0
    for (let rest = m; rest; rest &= rest - 1) best = Math.max(best, most[m ^ (rest & -rest)])
    most[m] = best + (sum[m] === 0 ? 1 : 0)
  }
  const order: number[] = []
  for (let m = full; m; ) {
    const target = most[m] - (sum[m] === 0 ? 1 : 0)
    let rest = m
    while (most[m ^ (rest & -rest)] !== target) rest &= rest - 1
    const bit = rest & -rest
    order.push(bitIndex(bit))
    m ^= bit
  }
  const groups: number[][] = []
  let current: number[] = []
  let running = 0
  for (const k of order.reverse()) {
    current.push(k)
    running += values[k]
    if (running === 0) {
      groups.push(current)
      current = []
    }
  }
  return groups
}

/** Within one circle: whoever owes most pays whoever is owed most, until nothing is left. */
function settleCircle(circle: { i: number; b: number }[]): Transfer[] {
  const owes = circle.filter((x) => x.b < 0).map((x) => ({ ...x })).sort((a, b) => a.b - b.b || a.i - b.i)
  const owed = circle.filter((x) => x.b > 0).map((x) => ({ ...x })).sort((a, b) => b.b - a.b || a.i - b.i)
  const transfers: Transfer[] = []
  let d = 0
  let c = 0
  while (d < owes.length && c < owed.length) {
    const amount = Math.min(-owes[d].b, owed[c].b)
    transfers.push({ from: owes[d].i, to: owed[c].i, amount })
    owes[d].b += amount
    owed[c].b -= amount
    if (owes[d].b === 0) d++
    if (owed[c].b === 0) c++
  }
  return transfers
}

export function totalSpent(group: Group): number {
  return group.entries.reduce((sum, e) => sum + (e.kind === 'expense' ? e.amount : 0), 0)
}

/** True when a person appears in any expense or payment, so they can't be removed. */
export function isInvolved(group: Group, person: number): boolean {
  return group.entries.some((e) => e.payer === person || e.split.includes(person))
}

/** Removes an uninvolved person and shifts everyone after them down one place. */
export function removePerson(group: Group, person: number): Group {
  const shift = (i: number) => (i > person ? i - 1 : i)
  return {
    ...group,
    people: group.people.filter((_, i) => i !== person),
    entries: group.entries.map((e) => ({ ...e, payer: shift(e.payer), split: e.split.map(shift) })),
  }
}

// Links: the whole group, compressed into the part of the address after "#".
// Browsers never send that part to the server.

const VERSION = 1
const MAX_DECODED = 1_000_000

export async function encodeGroup(group: Group): Promise<string> {
  const compact = [VERSION, group.id, group.name, group.currency, group.people, group.entries.map((e) => [e.kind === 'payment' ? 1 : 0, e.description, e.amount, e.payer, e.split])]
  const packed = await pipe(new TextEncoder().encode(JSON.stringify(compact)), new CompressionStream('deflate-raw'))
  return `v1.${toBase64Url(packed)}`
}

/** Reads a link's group, checking every field. Null for anything damaged, edited by hand, or too large. */
export async function decodeGroup(text: string): Promise<Group | null> {
  try {
    if (!text.startsWith('v1.')) return null
    const json = await pipe(fromBase64Url(text.slice(3)), new DecompressionStream('deflate-raw'), MAX_DECODED)
    return readCompact(JSON.parse(new TextDecoder().decode(json)))
  } catch {
    return null
  }
}

function readCompact(data: unknown): Group | null {
  if (!Array.isArray(data) || data.length !== 6 || data[0] !== VERSION) return null
  const [, id, name, currency, people, entries] = data
  if (typeof id !== 'string' || !/^[a-z0-9]{1,20}$/.test(id)) return null
  if (typeof name !== 'string' || name.length > LIMITS.name) return null
  if (typeof currency !== 'string' || !/^[A-Z]{3}$/.test(currency) || !isCurrency(currency)) return null
  if (!Array.isArray(people) || people.length < 1 || people.length > LIMITS.people) return null
  if (!people.every((p) => typeof p === 'string' && p.trim() !== '' && p.length <= LIMITS.person)) return null
  if (new Set(people.map((p: string) => p.toLowerCase())).size !== people.length) return null
  if (!Array.isArray(entries) || entries.length > LIMITS.entries) return null
  const index = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0 && (n as number) < people.length
  const parsed: Entry[] = []
  for (const raw of entries) {
    if (!Array.isArray(raw) || raw.length !== 5) return null
    const [kind, description, amount, payer, split] = raw
    if (kind !== 0 && kind !== 1) return null
    if (typeof description !== 'string' || description.length > LIMITS.description) return null
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > LIMITS.amount) return null
    if (!index(payer) || !Array.isArray(split) || split.length < 1 || !split.every(index) || new Set(split).size !== split.length) return null
    if (kind === 1 && (split.length !== 1 || split[0] === payer)) return null
    parsed.push({ id: randomId(), kind: kind === 1 ? 'payment' : 'expense', description, amount, payer, split })
  }
  return { id, name, currency, people, entries: parsed }
}

function isCurrency(code: string): boolean {
  try {
    // Intl formats any three letters, so check against the currencies it actually knows.
    return typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency').includes(code) : CURRENCIES.includes(code)
  } catch {
    return false
  }
}

async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream, limit = Infinity): Promise<Uint8Array<ArrayBuffer>> {
  const reader = new Blob([data as Uint8Array<ArrayBuffer>]).stream().pipeThrough(stream).getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > limit) {
      await reader.cancel()
      throw new Error('Too large')
    }
    chunks.push(value)
  }
  const out = new Uint8Array(size)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.length
  }
  return out
}

function toBase64Url(data: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < data.length; i += 0x8000) binary += String.fromCharCode(...data.subarray(i, i + 0x8000))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new Error('Not base64url')
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}
