/**
 * CSV Checkup's profiler: counts what's in each column and what looks wrong,
 * one row at a time, in bounded memory, so large files work too.
 */

export type Kind = 'integer' | 'decimal' | 'date' | 'boolean' | 'email' | 'url' | 'text'

export interface Column {
  name: string
  filled: number
  missing: number
  kinds: Record<Kind, number>
  /** A few values that don't match the column's main kind. */
  oddExamples: string[]
  distinct: number
  /** True when there were too many different values to count exactly. */
  distinctCapped: boolean
  top: { value: string; count: number }[]
  min?: number
  max?: number
  mean?: number
  earliest?: string
  latest?: string
  dateFormats: string[]
  leadingZeros: number
  leadingZeroExample?: string
  strayWhitespace: number
  longest: number
  type: Kind | 'mixed' | 'empty'
  issues: string[]
}

export interface Profile {
  rows: number
  columns: Column[]
  hasHeader: boolean
  blankRows: number
  /** Data rows with more or fewer fields than there are columns. */
  raggedRows: number
  raggedExamples: number[]
  duplicateRows: number
  /** True when only the first rows could be checked for duplicates. */
  duplicatesCapped: boolean
  duplicateNames: string[]
  emptyNames: number
  preview: string[][]
  issues: string[]
}

const MISSING = new Set(['', 'na', 'n/a', 'null', 'none', 'nan', '#n/a', 'nil', 'undefined'])
const DISTINCT_CAP = 20_000
const DUPLICATE_CAP = 2_000_000
const PREVIEW_ROWS = 50
const KINDS: Kind[] = ['integer', 'decimal', 'date', 'boolean', 'email', 'url', 'text']

interface Tally {
  filled: number
  missing: number
  kinds: Record<Kind, number>
  values: Map<string, number>
  capped: boolean
  min: number
  max: number
  sum: number
  numbers: number
  earliest: number
  latest: number
  earliestText: string
  latestText: string
  dateFormats: Map<string, string>
  leadingZeros: number
  leadingZeroExample?: string
  strayWhitespace: number
  longest: number
  examples: Map<Kind, string[]>
}

export class Profiler {
  private names: string[] | null = null
  private tallies: Tally[] = []
  private rows = 0
  private blankRows = 0
  private raggedRows = 0
  private raggedExamples: number[] = []
  private duplicateRows = 0
  private seen = new Set<number>()
  private preview: string[][] = []

  private readonly hasHeader: boolean
  private readonly decimalComma: boolean

  constructor(hasHeader: boolean, decimalComma = false) {
    this.hasHeader = hasHeader
    this.decimalComma = decimalComma
  }

  add(row: string[]) {
    if (row.length === 1 && row[0].trim() === '') {
      this.blankRows++
      return
    }
    if (!this.names) {
      this.names = this.hasHeader ? row.map((name) => name.trim()) : row.map((_, i) => `Column ${i + 1}`)
      this.tallies = this.names.map(newTally)
      if (this.hasHeader) return
    }
    this.rows++
    if (row.length !== this.names.length) {
      this.raggedRows++
      if (this.raggedExamples.length < 5) this.raggedExamples.push(this.rows)
      // A row with extra fields widens the table, so nothing it holds goes unchecked.
      while (row.length > this.names.length) {
        this.names.push(`Column ${this.names.length + 1}`)
        const tally = newTally()
        tally.missing = this.rows - 1
        this.tallies.push(tally)
      }
    }
    if (this.preview.length < PREVIEW_ROWS) this.preview.push(row)
    if (this.seen.size < DUPLICATE_CAP) {
      const hash = cyrb53(row.join('\u0001'))
      if (this.seen.has(hash)) this.duplicateRows++
      else this.seen.add(hash)
    }
    for (let i = 0; i < this.tallies.length; i++) this.count(this.tallies[i], row[i] ?? '')
  }

  private count(t: Tally, raw: string) {
    const value = raw.trim()
    if (MISSING.has(value.toLowerCase())) {
      t.missing++
      return
    }
    t.filled++
    if (value !== raw) t.strayWhitespace++
    if (raw.length > t.longest) t.longest = raw.length
    if (t.values.size < DISTINCT_CAP || t.values.has(value)) t.values.set(value, (t.values.get(value) ?? 0) + 1)
    else t.capped = true

    const { kind, number, date, format } = classify(value, this.decimalComma)
    t.kinds[kind]++
    const examples = t.examples.get(kind) ?? []
    if (examples.length < 3 && !examples.includes(value)) t.examples.set(kind, [...examples, value])
    if (number !== undefined) {
      t.numbers++
      t.sum += number
      if (number < t.min) t.min = number
      if (number > t.max) t.max = number
      if (kind === 'integer' && /^[+-]?0\d/.test(value)) {
        t.leadingZeros++
        t.leadingZeroExample ??= value
      }
    }
    if (date !== undefined && format) {
      if (!t.dateFormats.has(format)) t.dateFormats.set(format, value)
      if (date < t.earliest) [t.earliest, t.earliestText] = [date, value]
      if (date > t.latest) [t.latest, t.latestText] = [date, value]
    }
  }

  result(): Profile {
    const names = this.names ?? []
    const columns = names.map((name, i) => finishColumn(name, this.tallies[i], this.rows))
    const seen = new Map<string, number>()
    for (const name of names) seen.set(name.toLowerCase(), (seen.get(name.toLowerCase()) ?? 0) + 1)
    const duplicateNames = [...new Set(names.filter((n) => n && (seen.get(n.toLowerCase()) ?? 0) > 1))]
    const emptyNames = this.hasHeader ? names.filter((n) => !n).length : 0
    const profile: Profile = {
      rows: this.rows,
      columns,
      hasHeader: this.hasHeader,
      blankRows: this.blankRows,
      raggedRows: this.raggedRows,
      raggedExamples: this.raggedExamples,
      duplicateRows: this.duplicateRows,
      duplicatesCapped: this.seen.size >= DUPLICATE_CAP,
      duplicateNames,
      emptyNames,
      preview: this.preview,
      issues: [],
    }
    profile.issues = fileIssues(profile)
    return profile
  }
}

function newTally(): Tally {
  return {
    filled: 0,
    missing: 0,
    kinds: Object.fromEntries(KINDS.map((k) => [k, 0])) as Record<Kind, number>,
    values: new Map(),
    capped: false,
    min: Infinity,
    max: -Infinity,
    sum: 0,
    numbers: 0,
    earliest: Infinity,
    latest: -Infinity,
    earliestText: '',
    latestText: '',
    dateFormats: new Map(),
    leadingZeros: 0,
    strayWhitespace: 0,
    longest: 0,
    examples: new Map(),
  }
}

/** What a single value looks like, with its number or date when it is one. */
export function classify(value: string, decimalComma = false): { kind: Kind; number?: number; date?: number; format?: string } {
  const first = value.charCodeAt(0)
  const digitish = (first >= 48 && first <= 57) || value[0] === '-' || value[0] === '+' || value[0] === '.' || /^[$€£¥]/.test(value)
  if (digitish) {
    if (/^[+-]?\d+$/.test(value)) return { kind: 'integer', number: Number(value) }
    if (/^[+-]?\d{1,3}(,\d{3})+$/.test(value) && !decimalComma) return { kind: 'integer', number: Number(value.replace(/,/g, '')) }
    if (/^[+-]?(?:\d+\.\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value) || /^[+-]?\d+[eE][+-]?\d+$/.test(value)) return { kind: 'decimal', number: Number(value) }
    if (decimalComma && /^[+-]?\d+,\d+$/.test(value)) return { kind: 'decimal', number: Number(value.replace(',', '.')) }
    const money = /^([+-]?)[$€£¥]\s?(\d{1,3}(?:,\d{3})*|\d+)(\.\d+)?$/.exec(value)
    if (money) return { kind: 'decimal', number: Number(`${money[1]}${money[2].replace(/,/g, '')}${money[3] ?? ''}`) }
    const percent = /^([+-]?\d+(?:\.\d+)?)\s?%$/.exec(value)
    if (percent) return { kind: 'decimal', number: Number(percent[1]) }
    const date = readDate(value)
    if (date) return { kind: 'date', ...date }
    return { kind: 'text' }
  }
  if (/^(true|false|yes|no)$/i.test(value)) return { kind: 'boolean' }
  if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) return { kind: 'email' }
  if (/^https?:\/\/\S+$/i.test(value)) return { kind: 'url' }
  return { kind: 'text' }
}

/** Recognizes 2026-10-08 (with optional time), 10/08/2026, and 08.10.2026, each as its own format. */
function readDate(value: string): { date: number; format: string } | undefined {
  let match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.exec(value)
  if (match) return dateFrom(+match[1], +match[2], +match[3], match[4] ? 'YYYY-MM-DD hh:mm' : 'YYYY-MM-DD')
  match = /^(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})(?:,?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)?$/i.exec(value)
  if (match) {
    const year = match[3].length === 2 ? 2000 + +match[3] : +match[3]
    // Month first unless the first number can't be a month.
    const [month, day] = +match[1] > 12 ? [+match[2], +match[1]] : [+match[1], +match[2]]
    return dateFrom(year, month, day, 'slashes (10/08/2026)')
  }
  match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value)
  if (match) return dateFrom(+match[3], +match[2], +match[1], 'dots (08.10.2026)')
  return undefined
}

function dateFrom(year: number, month: number, day: number, format: string): { date: number; format: string } | undefined {
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined
  return { date: Date.UTC(year, month - 1, day), format }
}

function finishColumn(name: string, t: Tally, rows: number): Column {
  const present = t.filled
  const numeric = t.kinds.integer + t.kinds.decimal
  const main = (Object.entries(t.kinds) as [Kind, number][]).sort((a, b) => b[1] - a[1])[0]
  // Whole numbers and decimals together count as one numeric column.
  const [mainKind, mainCount] = numeric >= main[1] && numeric > 0 ? [t.kinds.decimal > 0 ? 'decimal' : 'integer', numeric] as [Kind, number] : main
  const type: Column['type'] = present === 0 ? 'empty' : mainCount / present >= 0.95 ? mainKind : 'mixed'
  const isNumeric = mainKind === 'integer' || mainKind === 'decimal'
  const oddExamples = [...t.examples]
    .filter(([kind]) => kind !== mainKind && !(isNumeric && (kind === 'integer' || kind === 'decimal')))
    .flatMap(([, values]) => values)
    .slice(0, 3)
  const top = [...t.values].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([value, count]) => ({ value, count }))

  const column: Column = {
    name,
    filled: present,
    missing: t.missing,
    kinds: t.kinds,
    oddExamples,
    distinct: t.values.size,
    distinctCapped: t.capped,
    top,
    dateFormats: [...t.dateFormats.values()],
    leadingZeros: t.leadingZeros,
    leadingZeroExample: t.leadingZeroExample,
    strayWhitespace: t.strayWhitespace,
    longest: t.longest,
    type,
    issues: [],
    ...(t.numbers && isNumeric && !t.leadingZeros && { min: t.min, max: t.max, mean: t.sum / t.numbers }),
    ...(t.kinds.date && { earliest: t.earliestText, latest: t.latestText }),
  }
  column.issues = columnIssues(column, rows, mainKind)
  return column
}

function columnIssues(c: Column, rows: number, mainKind: Kind): string[] {
  const issues: string[] = []
  const share = (n: number) => (rows ? n / rows : 0)
  if (c.type === 'empty') issues.push('Every value is empty.')
  else if (share(c.missing) >= 0.5) issues.push(`${percent(c.missing, rows)} of values are empty.`)
  const numeric = mainKind === 'integer' || mainKind === 'decimal'
  const fitting = numeric ? c.kinds.integer + c.kinds.decimal : c.kinds[mainKind]
  const odd = c.filled - fitting
  // Stray text in a number or date column breaks sums and sorting, so flag it however rare. In text columns, mixed content is normal.
  if (odd > 0 && c.oddExamples.length && (c.type === 'mixed' || numeric || mainKind === 'date')) {
    const kindName = numeric ? 'numbers' : KIND_NAMES[mainKind]
    issues.push(`${c.type === 'mixed' ? `Mostly ${kindName}, but` : `Holds ${kindName}, except`} ${formatCount(odd)} ${odd === 1 ? 'value' : 'values'}, such as ${c.oddExamples.map((v) => `“${v}”`).join(', ')}.`)
  }
  if (c.leadingZeros > 0) {
    issues.push(`${formatCount(c.leadingZeros)} ${c.leadingZeros === 1 ? 'number starts' : 'numbers start'} with 0, like “${c.leadingZeroExample}”. Spreadsheets often drop leading zeros, so open this column as text.`)
  }
  if (c.dateFormats.length > 1) issues.push(`Dates are written in ${c.dateFormats.length} different ways, such as ${c.dateFormats.map((v) => `“${v}”`).join(' and ')}.`)
  if (c.strayWhitespace > 0) issues.push(`${formatCount(c.strayWhitespace)} ${c.strayWhitespace === 1 ? 'value has' : 'values have'} extra spaces at the start or end.`)
  if (c.filled > 1 && c.distinct === 1 && !c.distinctCapped && c.missing === 0) issues.push('Every row has the same value.')
  return issues
}

function fileIssues(p: Profile): string[] {
  const issues: string[] = []
  if (p.duplicateRows) issues.push(`${formatCount(p.duplicateRows)} ${p.duplicateRows === 1 ? 'row is an exact repeat' : 'rows are exact repeats'} of an earlier row${p.duplicatesCapped ? ' (among the first 2,000,000 rows)' : ''}.`)
  if (p.raggedRows) {
    issues.push(`${formatCount(p.raggedRows)} ${p.raggedRows === 1 ? 'row has' : 'rows have'} a different number of fields than the header, starting with row ${p.raggedExamples.join(', ')}.`)
  }
  if (p.blankRows) issues.push(`${formatCount(p.blankRows)} blank ${p.blankRows === 1 ? 'line' : 'lines'}.`)
  if (p.duplicateNames.length) issues.push(`More than one column is named ${p.duplicateNames.map((n) => `“${n}”`).join(', ')}.`)
  if (p.emptyNames) issues.push(`${p.emptyNames} ${p.emptyNames === 1 ? 'column has' : 'columns have'} no name.`)
  for (const c of p.columns) for (const issue of c.issues) issues.push(`${c.name || 'Unnamed column'}: ${issue}`)
  return issues
}

export const KIND_NAMES: Record<Kind | 'mixed' | 'empty', string> = {
  integer: 'whole numbers',
  decimal: 'numbers',
  date: 'dates',
  boolean: 'yes/no',
  email: 'email addresses',
  url: 'web addresses',
  text: 'text',
  mixed: 'mixed',
  empty: 'empty',
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-US')
}

export function percent(part: number, whole: number): string {
  if (!whole) return '0%'
  const value = (part / whole) * 100
  return `${value > 0 && value < 1 ? '<1' : value > 99 && value < 100 ? '>99' : Math.round(value)}%`
}

/** A fast 53-bit string hash (cyrb53), for spotting repeated rows without keeping them in memory. */
function cyrb53(text: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed
  let h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}
