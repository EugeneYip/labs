// Deputyship Accounts: reading the bank's own downloads of an account's payments.
//
// Four kinds of file: CSV (or tab- or semicolon-separated) from online banking, with any lines of account details
// before the column names, or with no column names at all; Quicken's QIF; Microsoft Money's OFX; and Santander's
// labelled text ("Date: …", "Description: …", "Amount: …"). Text is read as UTF-8, or as Windows-1252 when it isn't
// valid UTF-8 (older exports write £ as a single byte). Dates are day first, as UK banks write them, unless the
// file shows otherwise; amounts become whole pennies, money in positive and money out negative. When a CSV has a
// running balance, it settles which way round the amounts are: a balance should move by each payment.

export interface RawRow {
  /** yyyy-mm-dd */
  date: string
  description: string
  /** Pennies: money in positive, money out negative. */
  amount: number
  /** The account's balance after this payment, in pennies, when the file gives it. */
  balance: number | null
  /** The bank's own identifier for the payment (OFX's FITID, Monzo's transaction ID), when the file has one. */
  bankId?: string
  /** Where it is in the file: a line number for CSV, QIF, and Santander's text; a payment number for OFX. */
  line: number
}

export type Role = 'date' | 'description' | 'amount' | 'in' | 'out' | 'balance' | 'id' | 'ignore'

export interface Table {
  rows: string[][]
  /** The line each row starts on (1-based). */
  lines: number[]
}

export interface Layout {
  /** The index in `table.rows` of the row of column names, or null when the file has none. */
  header: number | null
  roles: Role[]
  dayFirst: boolean
  /** A single amount column that shows money out as positive (found from the running balance). */
  flip: boolean
}

export interface Problem {
  line: number
  text: string
  why: string
}

export type Format = 'csv' | 'qif' | 'ofx' | 'santander'

export interface ReadResult {
  format: Format
  rows: RawRow[]
  problems: Problem[]
  notes: string[]
  /** CSV only: the table and the layout used, so the columns can be shown and changed. */
  table?: Table
  layout?: Layout
  /** A balance the file itself states (OFX's ledger balance), with its date. */
  stated?: { balance: number; date: string }
  cut?: boolean
}

export const READ_LIMITS = { characters: 20_000_000, rows: 50_000 }

// --- Text

export function decode(bytes: Uint8Array): { text: string; encoding: string } {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)
    return { text: new TextDecoder('utf-8').decode(bytes.subarray(3)), encoding: 'UTF-8' }
  if (bytes[0] === 0xff && bytes[1] === 0xfe)
    return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: 'UTF-16' }
  if (bytes[0] === 0xfe && bytes[1] === 0xff)
    return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: 'UTF-16' }
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), encoding: 'UTF-8' }
  } catch {
    return { text: new TextDecoder('windows-1252').decode(bytes), encoding: 'Windows-1252' }
  }
}

/** Spaces of every kind made plain, runs collapsed, ends trimmed. */
export function tidy(s: string): string {
  return s.replace(/[\s\u00a0\u2000-\u200b\u202f\u205f\u3000]+/g, ' ').trim()
}

// --- Money and dates

const MINUS = /^[-\u2212\u2012\u2013]/

/** Pennies from an amount as banks write it: null for a blank, NaN when it isn't an amount. */
export function parseMoney(text: string): number | null {
  let t = text.replace(/[\s\u00a0\u202f]/g, '')
  if (t === '' || t === '-' || t === '\u2013') return null
  let negative = false
  if (/^\(.*\)$/.test(t)) {
    negative = true
    t = t.slice(1, -1)
  }
  const tail = /(CR|DR)$/i.exec(t)
  if (tail && /\d/.test(t.slice(0, -2))) {
    if (/^D/i.test(tail[1])) negative = !negative
    t = t.slice(0, -2)
  }
  t = t.replace(/GBP$/i, '').replace(/^GBP/i, '')
  if (MINUS.test(t)) {
    negative = !negative
    t = t.slice(1)
  } else if (t.startsWith('+')) t = t.slice(1)
  t = t.replace(/^\u00a3/, '')
  if (MINUS.test(t)) {
    negative = !negative
    t = t.slice(1)
  }
  if (t.endsWith('-')) {
    negative = !negative
    t = t.slice(0, -1)
  }
  if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(t)) t = t.replace(/,/g, '')
  else if (/^\d+,\d{1,2}$/.test(t)) t = t.replace(',', '.')
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(t)
  if (!m || m[1].length > 13) return NaN
  const pennies = Number(m[1]) * 100 + (m[2] ? Number(m[2].padEnd(2, '0')) : 0)
  return negative && pennies !== 0 ? -pennies : pennies
}

/** A readable amount: neither blank nor unreadable. */
export function isAmount(n: number | null): n is number {
  return n !== null && !Number.isNaN(n)
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6, july: 7, august: 8, september: 9, october: 10,
  november: 11, december: 12,
}

export interface DateParts {
  /** Either day or month, as written first; numeric forms only. */
  a: number
  b: number
  year: number
  /** Set when the month is written as a word or the form is year first, so the order is certain. */
  iso?: string
}

function fullYear(y: string): number {
  if (y.length === 4) return Number(y)
  const n = Number(y)
  return n >= 80 ? 1900 + n : 2000 + n
}

function daysIn(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function isoOf(year: number, month: number, day: number): string | null {
  if (!(year >= 1900 && year <= 2200) || month < 1 || month > 12 || day < 1 || day > daysIn(year, month)) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** The parts of a date as written, or null when the text isn't one. Times after the date are ignored. */
export function dateParts(text: string): DateParts | null {
  const t = tidy(text).replace(/^'/, '')
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T].*)?$/.exec(t) ?? /^(\d{4})(\d{2})(\d{2})(?:\d{6}.*)?$/.exec(t)
  if (m) {
    const iso = isoOf(Number(m[1]), Number(m[2]), Number(m[3]))
    return iso ? { a: Number(m[3]), b: Number(m[2]), year: Number(m[1]), iso } : null
  }
  m = /^(\d{1,2})[/.\-' ]\s*(\d{1,2})[/.\-' ]\s*(\d{2}|\d{4})(?:[ T,].*)?$/.exec(t)
  if (m) return { a: Number(m[1]), b: Number(m[2]), year: fullYear(m[3]) }
  m = /^(\d{1,2})(?:st|nd|rd|th)?[ \-/.]?([A-Za-z]{3,9})\.?[ \-/.,]*(\d{2}|\d{4})(?:[ T,].*)?$/.exec(t)
  if (m) {
    const month = MONTHS[m[2].toLowerCase()]
    if (!month) return null
    const iso = isoOf(fullYear(m[3]), month, Number(m[1]))
    return iso ? { a: Number(m[1]), b: month, year: fullYear(m[3]), iso } : null
  }
  m = /^([A-Za-z]{3,9})\.? (\d{1,2}),? (\d{4})$/.exec(t)
  if (m) {
    const month = MONTHS[m[1].toLowerCase()]
    if (!month) return null
    const iso = isoOf(Number(m[3]), month, Number(m[2]))
    return iso ? { a: Number(m[2]), b: month, year: Number(m[3]), iso } : null
  }
  return null
}

export function isoFromParts(p: DateParts, dayFirst: boolean): string | null {
  if (p.iso) return p.iso
  return dayFirst ? isoOf(p.year, p.b, p.a) : isoOf(p.year, p.a, p.b)
}

/**
 * Whether a set of written dates is day first. UK banks write day first; a file proves month first only when a
 * second number goes above 12 and no first number does.
 */
export function dayFirstOf(parts: (DateParts | null)[]): { dayFirst: boolean; sure: boolean } {
  let firstOver = 0
  let secondOver = 0
  for (const p of parts) {
    if (!p || p.iso) continue
    if (p.a > 12) firstOver++
    if (p.b > 12) secondOver++
  }
  if (secondOver > 0 && firstOver === 0) return { dayFirst: false, sure: true }
  return { dayFirst: true, sure: firstOver > 0 || parts.every((p) => !p || !!p.iso) }
}

// --- CSV tables

function splitRows(text: string, sep: string, limit: number): Table & { cut: boolean } {
  const rows: string[][] = []
  const lines: number[] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  let line = 1
  let rowLine = 1
  let cut = false
  const endRow = () => {
    row.push(field)
    field = ''
    if (row.some((f) => f.trim() !== '')) {
      rows.push(row)
      lines.push(rowLine)
    }
    row = []
  }
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else {
        if (ch === '\n') line++
        field += ch
      }
    } else if (ch === '"' && field.trim() === '') {
      field = ''
      quoted = true
    } else if (ch === sep) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      endRow()
      line++
      rowLine = line
      if (rows.length >= limit) {
        cut = i < text.length - 1 && text.slice(i + 1).trim() !== ''
        break
      }
    } else field += ch
  }
  if (!cut && (field !== '' || row.length)) endRow()
  return { rows, lines, cut }
}

/** The separator that gives the most lines with the same number of fields (commas when nothing else wins). */
export function separatorOf(text: string): string {
  const sample = text.slice(0, 20_000)
  let best = ','
  let bestScore = -1
  for (const sep of [',', '\t', ';', '|']) {
    const { rows } = splitRows(sample, sep, 40)
    const counts = new Map<number, number>()
    for (const r of rows) if (r.length > 1) counts.set(r.length, (counts.get(r.length) ?? 0) + 1)
    let score = 0
    for (const [width, n] of counts) score = Math.max(score, n * Math.min(width, 8))
    if (score > bestScore) {
      bestScore = score
      best = sep
    }
  }
  return best
}

export function parseTable(text: string, limit = READ_LIMITS.rows + 30): Table & { cut: boolean } {
  return splitRows(text, separatorOf(text), limit)
}

// --- Columns

const NAMES: readonly [RegExp, Role][] = [
  [/^(transaction |posting |posted |completed |booking )?date( posted| of transaction)?$/, 'date'],
  [/^(transaction id|fitid|unique id|transaction reference id)$/, 'id'],
  [/^(paid in|money in|credit|credits|credit amount|credit amount \(gbp\)|amount in|in|receipts|deposits?|paid in \(£\)|money in \(£\)|credit \(£\))$/, 'in'],
  [/^(paid out|money out|debit|debits|debit amount|debit amount \(gbp\)|amount out|out|payments|withdrawals?|paid out \(£\)|money out \(£\)|debit \(£\))$/, 'out'],
  [/^(amount|value|transaction amount|amount \(gbp\)|amount gbp|amount \(£\)|amount £|net amount|amount \(£\))$/, 'amount'],
  [/^(balance|running balance|balance \(gbp\)|balance \(£\)|balance £|account balance|ledger balance)$/, 'balance'],
  [/^(description|transaction description|details|transaction details|narrative|memo|name|payee|counter ?party|merchant|reference|payment reference|particulars|transaction|transaction narrative|payee name)$/, 'description'],
]

function roleOfName(name: string): Role {
  const n = tidy(name).toLowerCase().replace(/[:*]+$/, '')
  for (const [re, role] of NAMES) if (re.test(n)) return role
  return 'ignore'
}

/** Roles from a row of column names; at most one date, amount, in, out, balance, and id column each. */
function rolesFromHeader(header: string[]): Role[] {
  const seen = new Set<Role>()
  return header.map((h) => {
    const role = roleOfName(h)
    if (role === 'ignore' || role === 'description') return role
    if (seen.has(role)) return 'ignore'
    seen.add(role)
    return role
  })
}

function looksLikeHeader(roles: Role[]): boolean {
  return roles.includes('date') && (roles.includes('amount') || roles.includes('in') || roles.includes('out'))
}

/** The row of column names among the first rows (any lines above it are account details), or null when none. */
export function headerOf(table: Table): number | null {
  const n = Math.min(table.rows.length, 30)
  for (let i = 0; i < n; i++) if (looksLikeHeader(rolesFromHeader(table.rows[i]))) return i
  return null
}

function share<T>(xs: T[], test: (x: T) => boolean): number {
  if (!xs.length) return 0
  let n = 0
  for (const x of xs) if (test(x)) n++
  return n / xs.length
}

/** Roles for a file without column names, from what the cells hold. */
function rolesFromCells(rows: string[][]): Role[] {
  const width = Math.max(0, ...rows.map((r) => r.length))
  const sample = rows.slice(0, 300)
  const roles: Role[] = new Array(width).fill('ignore')
  const cells = (c: number) => sample.map((r) => r[c] ?? '').filter((s) => s.trim() !== '')
  let dateCol = -1
  for (let c = 0; c < width && dateCol < 0; c++) {
    const xs = cells(c)
    if (xs.length && share(xs, (s) => dateParts(s) !== null) >= 0.8) dateCol = c
  }
  if (dateCol >= 0) roles[dateCol] = 'date'
  const numeric: number[] = []
  for (let c = 0; c < width; c++) {
    if (c === dateCol) continue
    const xs = cells(c)
    if (xs.length && share(xs, (s) => isAmount(parseMoney(s))) >= 0.9) numeric.push(c)
  }
  if (numeric.length === 1) roles[numeric[0]] = 'amount'
  else if (numeric.length === 2) {
    roles[numeric[0]] = 'amount'
    roles[numeric[1]] = 'balance'
  } else if (numeric.length >= 3) {
    roles[numeric[0]] = 'out'
    roles[numeric[1]] = 'in'
    roles[numeric[2]] = 'balance'
  }
  let textCol = -1
  let longest = 0
  for (let c = 0; c < width; c++) {
    if (roles[c] !== 'ignore') continue
    const xs = cells(c)
    const avg = xs.reduce((s, x) => s + x.length, 0) / Math.max(1, sample.length)
    if (avg > longest) {
      longest = avg
      textCol = c
    }
  }
  if (textCol >= 0) roles[textCol] = 'description'
  return roles
}

/** A row's money from the columns marked: the amount column, or paid in less paid out. NaN when unreadable. */
function moneyOf(row: string[], roles: Role[]): { amount: number; empty: boolean } {
  let amount = 0
  let found = false
  let bad = false
  roles.forEach((role, c) => {
    if (role !== 'amount' && role !== 'in' && role !== 'out') return
    const v = parseMoney(row[c] ?? '')
    if (v === null) return
    if (Number.isNaN(v)) {
      bad = true
      return
    }
    found = true
    if (role === 'amount') amount += v
    else if (role === 'in') amount += Math.abs(v)
    else amount -= Math.abs(v)
  })
  return { amount: bad ? NaN : amount, empty: !found && !bad }
}

function descriptionOf(row: string[], roles: Role[]): string {
  const parts: string[] = []
  roles.forEach((role, c) => {
    if (role !== 'description') return
    const v = tidy(row[c] ?? '').replace(/^'(?=\S)/, '')
    if (v && !parts.some((p) => p.toUpperCase() === v.toUpperCase())) parts.push(v)
  })
  return parts.join(' · ')
}

/**
 * How well a running balance follows the amounts, for each way the file could run: oldest first or newest first,
 * and with the amounts as written or the other way round. Counts consecutive rows that agree.
 */
export function chainFit(amounts: number[], balances: (number | null)[]): {
  oldestFirst: number
  oldestFirstFlipped: number
  newestFirst: number
  newestFirstFlipped: number
  pairs: number
} {
  const r = { oldestFirst: 0, oldestFirstFlipped: 0, newestFirst: 0, newestFirstFlipped: 0, pairs: 0 }
  for (let i = 1; i < amounts.length; i++) {
    const b0 = balances[i - 1]
    const b1 = balances[i]
    if (b0 === null || b1 === null) continue
    r.pairs++
    if (b0 + amounts[i] === b1) r.oldestFirst++
    if (b0 - amounts[i] === b1) r.oldestFirstFlipped++
    if (b1 + amounts[i - 1] === b0) r.newestFirst++
    if (b1 - amounts[i - 1] === b0) r.newestFirstFlipped++
  }
  return r
}

/** The layout the file most likely has: its column names if it has them, its cells if not, and its balances. */
export function guessLayout(table: Table): Layout {
  const header = headerOf(table)
  const data = table.rows.slice(header === null ? 0 : header + 1)
  let roles = header === null ? rolesFromCells(data) : rolesFromHeader(table.rows[header])
  if (header !== null && !roles.includes('description')) {
    // A file whose text column has an unexpected name: the widest unnamed text column.
    const guessed = rolesFromCells(data)
    const c = guessed.indexOf('description')
    if (c >= 0 && roles[c] === 'ignore') roles = roles.map((r, i) => (i === c ? 'description' : r))
  }
  // A file with paid in and paid out columns and also a signed amount column (Monzo): the amount column alone.
  if (roles.includes('amount') && (roles.includes('in') || roles.includes('out')))
    roles = roles.map((r) => (r === 'in' || r === 'out' ? 'ignore' : r))
  const dateCol = roles.indexOf('date')
  const parts = dateCol < 0 ? [] : data.map((r) => dateParts(r[dateCol] ?? ''))
  const { dayFirst } = dayFirstOf(parts)
  const layout: Layout = { header, roles, dayFirst, flip: false }
  // Headerless files with two or three number columns: the balance decides which is which.
  if (header === null) {
    const nums = roles.map((r, c) => (r === 'amount' || r === 'in' || r === 'out' || r === 'balance' ? c : -1)).filter((c) => c >= 0)
    if (nums.length === 2 || nums.length === 3) {
      const options: Role[][] =
        nums.length === 2
          ? [['amount', 'balance'], ['balance', 'amount']]
          : [['out', 'in', 'balance'], ['in', 'out', 'balance']]
      let best = layout.roles
      let bestFit = -1
      for (const option of options) {
        const trial = roles.slice()
        nums.forEach((c, k) => (trial[c] = option[k]))
        const fit = fitOf(data, trial)
        if (fit > bestFit) {
          bestFit = fit
          best = trial
        }
      }
      layout.roles = best
    }
  }
  // A single amount column whose signs run against the balance.
  if (layout.roles.includes('amount') && layout.roles.includes('balance')) {
    const { amounts, balances } = columnsOf(data, layout.roles)
    const f = chainFit(amounts, balances)
    const asWritten = Math.max(f.oldestFirst, f.newestFirst)
    const flipped = Math.max(f.oldestFirstFlipped, f.newestFirstFlipped)
    if (f.pairs >= 3 && flipped > asWritten && flipped >= f.pairs / 2) layout.flip = true
  }
  return layout
}

function columnsOf(data: string[][], roles: Role[]): { amounts: number[]; balances: (number | null)[] } {
  const amounts: number[] = []
  const balances: (number | null)[] = []
  const b = roles.indexOf('balance')
  for (const row of data) {
    const { amount, empty } = moneyOf(row, roles)
    if (empty || Number.isNaN(amount)) continue
    amounts.push(amount)
    const v = b < 0 ? null : parseMoney(row[b] ?? '')
    balances.push(isAmount(v) ? v : null)
  }
  return { amounts, balances }
}

function fitOf(data: string[][], roles: Role[]): number {
  const { amounts, balances } = columnsOf(data, roles)
  const f = chainFit(amounts, balances)
  return Math.max(f.oldestFirst, f.newestFirst, f.oldestFirstFlipped, f.newestFirstFlipped)
}

/** The rows of a CSV table under a layout. */
export function rowsOf(table: Table, layout: Layout): { rows: RawRow[]; problems: Problem[] } {
  const rows: RawRow[] = []
  const problems: Problem[] = []
  const start = layout.header === null ? 0 : layout.header + 1
  const dateCol = layout.roles.indexOf('date')
  const balCol = layout.roles.indexOf('balance')
  const idCol = layout.roles.indexOf('id')
  for (let i = start; i < table.rows.length; i++) {
    const row = table.rows[i]
    const line = table.lines[i]
    const text = row.join(', ').slice(0, 160)
    // A repeated row of column names (some exports start each page with one).
    if (layout.header !== null && row.join('\u0000') === table.rows[layout.header].join('\u0000')) continue
    const { amount, empty } = moneyOf(row, layout.roles)
    const dateText = dateCol < 0 ? '' : (row[dateCol] ?? '')
    if (empty && (!dateText.trim() || dateParts(dateText) === null)) continue
    if (dateCol < 0) {
      problems.push({ line, text, why: 'no column is marked as the date' })
      continue
    }
    const parts = dateParts(dateText)
    const iso = parts ? isoFromParts(parts, layout.dayFirst) : null
    if (!iso) {
      problems.push({ line, text, why: dateText.trim() ? `the date “${tidy(dateText)}” wasn’t read` : 'no date' })
      continue
    }
    if (empty) {
      // "Balance brought forward" and similar lines carry a balance but no payment.
      if (!/balance|brought forward|carried forward|\bb\/f\b|\bc\/f\b/i.test(descriptionOf(row, layout.roles) + ' ' + text))
        problems.push({ line, text, why: 'no amount' })
      continue
    }
    if (Number.isNaN(amount)) {
      problems.push({ line, text, why: 'the amount wasn’t read' })
      continue
    }
    let balance: number | null = null
    if (balCol >= 0) {
      const v = parseMoney(row[balCol] ?? '')
      if (isAmount(v)) balance = v
    }
    const out: RawRow = {
      date: iso,
      description: descriptionOf(row, layout.roles),
      amount: layout.flip ? -amount : amount,
      balance,
      line,
    }
    const id = idCol >= 0 ? tidy(row[idCol] ?? '') : ''
    if (id) out.bankId = id
    rows.push(out)
  }
  return { rows, problems }
}

// --- QIF, OFX, and Santander's text

function readQif(text: string): ReadResult {
  const records: { fields: Record<string, string>; line: number }[] = []
  let current: Record<string, string> = {}
  let startLine = 0
  const lines = text.split(/\r\n|\r|\n/)
  lines.forEach((raw, i) => {
    const line = raw.trimEnd()
    if (!line.trim()) return
    if (line.startsWith('!')) return
    if (line.startsWith('^')) {
      if (Object.keys(current).length) records.push({ fields: current, line: startLine })
      current = {}
      return
    }
    if (!Object.keys(current).length) startLine = i + 1
    const code = line[0]
    const value = line.slice(1)
    if (code === 'U' && current.T !== undefined) return
    current[code] = current[code] ? `${current[code]} ${value}` : value
  })
  if (Object.keys(current).length) records.push({ fields: current, line: startLine })
  const parts = records.map((r) => dateParts((r.fields.D ?? '').replace(/'/g, '/')))
  const { dayFirst, sure } = dayFirstOf(parts)
  const rows: RawRow[] = []
  const problems: Problem[] = []
  records.forEach((r, k) => {
    const f = r.fields
    const text = Object.entries(f)
      .map(([c, v]) => c + v)
      .join(' ')
      .slice(0, 160)
    const p = parts[k]
    const iso = p ? isoFromParts(p, dayFirst) : null
    const amount = parseMoney(f.T ?? f.U ?? '')
    if (!iso) return void problems.push({ line: r.line, text, why: 'the date wasn’t read' })
    if (!isAmount(amount)) return void problems.push({ line: r.line, text, why: 'the amount wasn’t read' })
    const payee = tidy(f.P ?? '')
    const memo = tidy(f.M ?? '')
    rows.push({
      date: iso,
      description: [payee, memo].filter((s, i, a) => s && a.findIndex((x) => x.toUpperCase() === s.toUpperCase()) === i).join(' · '),
      amount,
      balance: null,
      line: r.line,
    })
  })
  const notes = sure ? [] : ['Dates such as 03/04 were read day first (3 April), as UK banks write them.']
  return { format: 'qif', rows, problems, notes }
}

function unescapeSgml(s: string): string {
  return s
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
}

function tag(block: string, name: string): string {
  const m = new RegExp(`<${name}>([^<\\r\\n]*)`, 'i').exec(block)
  return m ? unescapeSgml(m[1]).trim() : ''
}

function readOfx(text: string): ReadResult {
  const rows: RawRow[] = []
  const problems: Problem[] = []
  const re = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>)|(?=<\/BANKTRANLIST>))/gi
  let m: RegExpExecArray | null
  let n = 0
  while ((m = re.exec(text))) {
    n++
    const block = m[1]
    const posted = tag(block, 'DTPOSTED')
    const d = /^(\d{4})(\d{2})(\d{2})/.exec(posted)
    const iso = d ? isoOf(Number(d[1]), Number(d[2]), Number(d[3])) : null
    const amount = parseMoney(tag(block, 'TRNAMT'))
    const name = tidy(tag(block, 'NAME'))
    const memo = tidy(tag(block, 'MEMO'))
    const fitid = tag(block, 'FITID')
    const text = `${posted} ${tag(block, 'TRNAMT')} ${name} ${memo}`.slice(0, 160)
    if (!iso) {
      problems.push({ line: n, text, why: 'the date wasn’t read' })
      continue
    }
    if (!isAmount(amount)) {
      problems.push({ line: n, text, why: 'the amount wasn’t read' })
      continue
    }
    const row: RawRow = {
      date: iso,
      description: [name, memo].filter((s, i, a) => s && a.findIndex((x) => x.toUpperCase() === s.toUpperCase()) === i).join(' · '),
      amount,
      balance: null,
      line: n,
    }
    if (fitid) row.bankId = fitid
    rows.push(row)
  }
  const result: ReadResult = { format: 'ofx', rows, problems, notes: [] }
  const ledger = /<LEDGERBAL>([\s\S]*?)(?:<\/LEDGERBAL>|$)/i.exec(text)
  if (ledger) {
    const bal = parseMoney(tag(ledger[1], 'BALAMT'))
    const asOf = /^(\d{4})(\d{2})(\d{2})/.exec(tag(ledger[1], 'DTASOF'))
    const iso = asOf ? isoOf(Number(asOf[1]), Number(asOf[2]), Number(asOf[3])) : null
    if (iso && isAmount(bal)) result.stated = { balance: bal, date: iso }
  }
  return result
}

function readSantander(text: string): ReadResult {
  const rows: RawRow[] = []
  const problems: Problem[] = []
  const lines = text.split(/\r\n|\r|\n/)
  let rec: { date?: string; description?: string; amount?: string; balance?: string; line: number } | null = null
  const flush = () => {
    if (!rec) return
    const r = rec
    rec = null
    const text = `${r.date ?? ''} ${r.description ?? ''} ${r.amount ?? ''}`.slice(0, 160)
    const p = dateParts(r.date ?? '')
    const iso = p ? isoFromParts(p, true) : null
    const amount = parseMoney(r.amount ?? '')
    if (!iso) return void problems.push({ line: r.line, text, why: 'the date wasn’t read' })
    if (!isAmount(amount)) return void problems.push({ line: r.line, text, why: 'the amount wasn’t read' })
    const b = parseMoney(r.balance ?? '')
    rows.push({
      date: iso,
      description: tidy(r.description ?? ''),
      amount,
      balance: isAmount(b) ? b : null,
      line: r.line,
    })
  }
  lines.forEach((raw, i) => {
    const m = /^\s*(Date|Description|Amount|Balance)\s*:(.*)$/i.exec(raw)
    if (!m) return
    const key = m[1].toLowerCase() as 'date' | 'description' | 'amount' | 'balance'
    const value = m[2].replace(/\u00a0/g, ' ').trim()
    if (key === 'date') {
      flush()
      rec = { date: value, line: i + 1 }
    } else if (rec) rec[key] = value
  })
  flush()
  return { format: 'santander', rows, problems, notes: [] }
}

// --- Any file

/** What a file that isn't a download of payments seems to be, from its first bytes, or null. */
export function notADownload(bytes: Uint8Array): string | null {
  const b = bytes
  if (b[0] === 0x50 && b[1] === 0x4b) return 'This is an Excel workbook (or another zipped file). Save it as CSV in a spreadsheet program, or download CSV from online banking.'
  if (b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0) return 'This is an older Excel workbook (.xls). Save it as CSV in a spreadsheet program, or download CSV from online banking.'
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) return 'This is a PDF statement, which this page can’t read. Download the payments as CSV from online banking, or type them in.'
  const head = new TextDecoder('latin1').decode(b.subarray(0, 512)).trimStart().toLowerCase()
  if (head.startsWith('<!doctype html') || head.startsWith('<html') || head.startsWith('<table')) return 'This is a web page saved as a file (some banks’ “Excel” downloads are). Open it in a spreadsheet program and save it as CSV.'
  return null
}

export function formatOf(text: string): Format {
  const head = text.slice(0, 5000)
  if (/<OFX>|OFXHEADER/i.test(head)) return 'ofx'
  if (/^\s*!(Type|Account|Option)/im.test(head)) return 'qif'
  if (/^\s*Date\s*:/im.test(head) && /^\s*Amount\s*:/im.test(text.slice(0, 50_000))) return 'santander'
  return 'csv'
}

/** Reads a download's text; for CSV, with the layout given, or the likeliest one. */
export function readText(input: string, layout?: Layout): ReadResult {
  let text = input.replace(/^\ufeff/, '')
  let cut = false
  if (text.length > READ_LIMITS.characters) {
    text = text.slice(0, READ_LIMITS.characters)
    cut = true
  }
  const format = formatOf(text)
  let result: ReadResult
  if (format === 'ofx') result = readOfx(text)
  else if (format === 'qif') result = readQif(text)
  else if (format === 'santander') result = readSantander(text)
  else {
    const table = parseTable(text)
    if (table.cut) cut = true
    const used = layout && layout.roles.length ? layout : guessLayout(table)
    const { rows, problems } = rowsOf(table, used)
    const notes: string[] = []
    const dateCol = used.roles.indexOf('date')
    if (dateCol >= 0) {
      const data = table.rows.slice(used.header === null ? 0 : used.header + 1)
      const sure = dayFirstOf(data.map((r) => dateParts(r[dateCol] ?? ''))).sure
      if (!sure && used.dayFirst) notes.push('Dates such as 03/04 were read day first (3 April), as UK banks write them.')
      if (!used.dayFirst) notes.push('Dates were read month first (04/13 is 13 April), as this file writes them.')
    }
    if (used.flip) notes.push('Money out is shown as a positive amount in this file; the running balance shows which way each payment went.')
    result = { format, rows, problems, notes, table: { rows: table.rows, lines: table.lines }, layout: used }
  }
  if (result.rows.length > READ_LIMITS.rows) {
    result.rows = result.rows.slice(0, READ_LIMITS.rows)
    cut = true
  }
  if (cut) result.cut = true
  return result
}
