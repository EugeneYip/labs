// Collection Climate: reading the files temperature and humidity loggers' software exports.
//
// CSV or text (comma, tab, or semicolon separated), in UTF-8, UTF-16 (Excel's "Unicode text"), or Windows-1252. Lines
// above the column names (a title, the logger's details) are skipped. The date and time may be one column or two,
// day first or month first (decided from the values, day first when they don't say), with or without seconds or
// AM/PM, ISO, or as a spreadsheet's day number; temperature in °C or °F (from the column's name, its values, or how
// warm the readings are); humidity in %. Rows with neither a temperature nor a humidity (a logger's event rows, such
// as HOBOware's "Logged" lines) are left out. Times are kept as the clock reads them, in seconds, with no time zone.

export interface Reading {
  /** Seconds since 1970-01-01 00:00, as the clock read (no time zone). */
  t: number
  /** °C, or null. */
  temp: number | null
  /** % RH, or null. */
  rh: number | null
}

export type Role = 'datetime' | 'date' | 'time' | 'temp' | 'rh' | 'ignore'

export interface Table {
  rows: string[][]
  lines: number[]
}

export interface Layout {
  /** The row of column names in `table.rows`, or null when the file has none. */
  header: number | null
  roles: Role[]
  dayFirst: boolean
  fahrenheit: boolean
}

export interface Problem {
  line: number
  text: string
  why: string
}

export interface ReadResult {
  readings: Reading[]
  problems: Problem[]
  notes: string[]
  table: Table
  layout: Layout
  /** A name the file gives itself (a plot title or the logger's serial number), if any. */
  title?: string
  cut?: boolean
  /** The offset from GMT, in minutes, that the file says its times are in (HOBOware's "Date Time, GMT+01:00"). */
  offset?: number
  /** Several readings share each date and none has a time of day: the time column hasn't been found. */
  noTimes?: boolean
}

export const READ_LIMITS = { characters: 60_000_000, rows: 600_000 }

// --- Text

export function decode(bytes: Uint8Array): { text: string; encoding: string } {
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return { text: new TextDecoder('utf-8').decode(bytes.subarray(3)), encoding: 'UTF-8' }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return { text: new TextDecoder('utf-16le').decode(bytes.subarray(2)), encoding: 'UTF-16' }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return { text: new TextDecoder('utf-16be').decode(bytes.subarray(2)), encoding: 'UTF-16' }
  // UTF-16 without a mark: every other byte zero in the first few hundred.
  const n = Math.min(bytes.length, 400)
  let zeroOdd = 0
  let zeroEven = 0
  for (let i = 0; i < n; i++) if (bytes[i] === 0) (i % 2 ? zeroOdd++ : zeroEven++)
  if (n >= 8 && zeroOdd > n / 4 && zeroEven < n / 20) return { text: new TextDecoder('utf-16le').decode(bytes), encoding: 'UTF-16' }
  if (n >= 8 && zeroEven > n / 4 && zeroOdd < n / 20) return { text: new TextDecoder('utf-16be').decode(bytes), encoding: 'UTF-16' }
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), encoding: 'UTF-8' }
  } catch {
    return { text: new TextDecoder('windows-1252').decode(bytes), encoding: 'Windows-1252' }
  }
}

export function tidy(s: string): string {
  return s.replace(/[\s\u00a0\u2000-\u200b\u202f\u205f\u3000]+/g, ' ').trim()
}

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
        cut = text.slice(i + 1).trim() !== ''
        break
      }
    } else field += ch
  }
  if (!cut && (field !== '' || row.length)) endRow()
  return { rows, lines, cut }
}

export function separatorOf(text: string): string {
  const sample = text.slice(0, 30_000)
  let best = ','
  let bestScore = -1
  for (const sep of [',', '\t', ';']) {
    const { rows } = splitRows(sample, sep, 60)
    const counts = new Map<number, number>()
    for (const r of rows) if (r.length > 1) counts.set(r.length, (counts.get(r.length) ?? 0) + 1)
    let score = 0
    for (const [width, n] of counts) score = Math.max(score, n * Math.min(width, 6))
    if (score > bestScore) {
      bestScore = score
      best = sep
    }
  }
  return best
}

export function parseTable(text: string, limit = READ_LIMITS.rows + 40): Table & { cut: boolean; sep: string } {
  const sep = separatorOf(text)
  return { ...splitRows(text, sep, limit), sep }
}

// --- Values

/** A reading's number from a cell ("21.5", "21,5", "21.5 °C", "45 %RH"), null for a blank, or NaN. */
export function parseNumber(text: string, commaDecimal: boolean): number | null {
  let t = tidy(text).replace(/^'/, '')
  if (!t || t === '-' || /^(n\/?a|null|none|---?)$/i.test(t)) return null
  t = t.replace(/\s*(°\s*[CF]|\u2103|\u2109|°|deg\s*[CF]|[CF]|%\s*(?:RH|RF|HR|r\.F\.?)|%|RH|RF|HR)$/i, '').trim()
  t = t.replace(/^\u2212/, '-')
  if (commaDecimal && /^-?\d+,\d+$/.test(t)) t = t.replace(',', '.')
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(t)) return NaN
  return Number(t)
}

// Month names and their short forms in English, German, French, Spanish, Italian, Dutch, and the Scandinavian
// languages, written without accents (looked up the same way).
const MONTHS: Record<string, number> = Object.fromEntries(
  (
    [
      [1, 'jan january januar janv janvier enero ene gennaio gen januari'],
      [2, 'feb february februar fev fevr fevrier febrero febbraio februari'],
      [3, 'mar march marz mrz mars marzo maart mrt'],
      [4, 'apr april avr avril abril abr aprile'],
      [5, 'may mai mayo maggio mag mei maj'],
      [6, 'jun june juni juin junio giugno giu'],
      [7, 'jul july juli juil juillet julio luglio lug'],
      [8, 'aug august aout agosto ago augustus augusti'],
      [9, 'sep sept september septembre septiembre setiembre set settembre'],
      [10, 'oct october oktober okt octobre octubre ottobre ott'],
      [11, 'nov november novembre noviembre'],
      [12, 'dec december dezember dez decembre diciembre dic dicembre desember des'],
    ] as [number, string][]
  ).flatMap(([m, names]) => names.split(' ').map((n) => [n, m])),
)
const monthOf = (name: string): number | undefined => MONTHS[name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\.$/, '')]

/** A date as written: two numbers (day and month, in an order to be decided) and a year, or a certain one. */
export interface DatePart {
  a: number
  b: number
  year: number
  /** Year, month, and day when the order is certain (ISO, a month name, a day number). */
  sure?: [number, number, number]
}

function fullYear(y: string): number {
  if (y.length === 4) return Number(y)
  const n = Number(y)
  return n >= 70 ? 1900 + n : 2000 + n
}

function validYmd(y: number, m: number, d: number): boolean {
  return y >= 1970 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/** Seconds since midnight from a time as written ("11:10", "11:10:00 AM", "23.05", "1110"?), or null. */
export function parseTime(text: string): number | null {
  const t = tidy(text).toUpperCase()
  if (!t) return 0
  const m = /^(\d{1,2})[:.](\d{2})(?:[:.](\d{2})(?:[.,]\d+)?)?\s*(AM|PM|A\.M\.|P\.M\.)?(?:\s*(?:Z|UTC|GMT|[+-]\d{2}:?\d{2}))?$/.exec(t)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2])
  const s = m[3] ? Number(m[3]) : 0
  const ampm = m[4]?.replace(/\./g, '')
  if (ampm) {
    if (h < 1 || h > 12) return null
    if (ampm === 'AM') h = h === 12 ? 0 : h
    else h = h === 12 ? 12 : h + 12
  }
  if (h > 23 || min > 59 || s > 59) return null
  return h * 3600 + min * 60 + s
}

/** A date and the rest of the text (a time, if the cell holds both), or null. */
export function parseDatePart(text: string): { date: DatePart; rest: string } | null {
  const t = tidy(text).replace(/^'/, '')
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s,]+(.*))?$/.exec(t)
  if (m) {
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3])
    return validYmd(y, mo, d) ? { date: { a: d, b: mo, year: y, sure: [y, mo, d] }, rest: m[4] ?? '' } : null
  }
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})(?:[T\s,]+(.*))?$/.exec(t)
  if (m) return { date: { a: Number(m[1]), b: Number(m[2]), year: fullYear(m[3]) }, rest: m[4] ?? '' }
  m = /^(\d{1,2})[-\s/.]+([A-Za-z\u00c0-\u017f]{3,10})\.?[-\s/.,]+(\d{2}|\d{4})(?:[T\s,]+(.*))?$/.exec(t)
  if (m) {
    const mo = monthOf(m[2])
    const y = fullYear(m[3]), d = Number(m[1])
    return mo && validYmd(y, mo, d) ? { date: { a: d, b: mo, year: y, sure: [y, mo, d] }, rest: m[4] ?? '' } : null
  }
  m = /^([A-Za-z\u00c0-\u017f]{3,10})\.?\s+(\d{1,2}),?\s+(\d{4})(?:[T\s,]+(.*))?$/.exec(t)
  if (m) {
    const mo = monthOf(m[1])
    const y = Number(m[3]), d = Number(m[2])
    return mo && validYmd(y, mo, d) ? { date: { a: d, b: mo, year: y, sure: [y, mo, d] }, rest: m[4] ?? '' } : null
  }
  // A spreadsheet's day number (days since 30 December 1899), with the time as its fraction.
  m = /^(\d{5})(\.\d+)?$/.exec(t)
  if (m) {
    const days = Number(m[1])
    if (days > 25_000 && days < 120_000) {
      const ms = Date.UTC(1899, 11, 30) + days * 86_400_000
      const d = new Date(ms)
      const frac = m[2] ? Number(m[2]) : 0
      const secs = Math.round(frac * 86400)
      return { date: { a: d.getUTCDate(), b: d.getUTCMonth() + 1, year: d.getUTCFullYear(), sure: [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()] }, rest: secs ? `@${secs}` : '' }
    }
  }
  return null
}

function ymdOf(p: DatePart, dayFirst: boolean): [number, number, number] | null {
  if (p.sure) return p.sure
  const [d, m] = dayFirst ? [p.a, p.b] : [p.b, p.a]
  return validYmd(p.year, m, d) ? [p.year, m, d] : null
}

export function secondsOf(ymd: [number, number, number], time: number): number {
  return Date.UTC(ymd[0], ymd[1] - 1, ymd[2]) / 1000 + time
}

/**
 * Whether written dates are day first. A first number over 12 proves day first, and a second number over 12 month
 * first. When no number decides (a file of the 1st to the 12th of a month), the reading that keeps the rows' dates in
 * order decides, as loggers write their readings in order; when that doesn't either, day first.
 */
export function dayFirstOf(parts: (DatePart | null)[]): { dayFirst: boolean; sure: boolean; byOrder?: boolean } {
  let first = 0
  let second = 0
  let open = 0
  for (const p of parts) {
    if (!p || p.sure) continue
    open++
    if (p.a > 12) first++
    if (p.b > 12) second++
  }
  if (second > 0 && first === 0) return { dayFirst: false, sure: true }
  if (first > 0 || open === 0) return { dayFirst: true, sure: true }
  // How far the dates jump from row to row, read each way: the true reading moves steadily forward.
  const jumps = (dayFirst: boolean) => {
    let total = 0
    let prev: number | null = null
    for (const p of parts) {
      const ymd = p ? ymdOf(p, dayFirst) : null
      if (!ymd) continue
      const day = Date.UTC(ymd[0], ymd[1] - 1, ymd[2]) / 86_400_000
      if (prev !== null) total += Math.abs(day - prev)
      prev = day
    }
    return total
  }
  const d = jumps(true)
  const m = jumps(false)
  if (m < d) return { dayFirst: false, sure: false, byOrder: true }
  return { dayFirst: true, sure: false, byOrder: d < m }
}

// --- Columns

function roleOfName(name: string): Role {
  const n = tidy(name.replace(/_+/g, ' ')).toLowerCase()
  if (!n) return 'ignore'
  if (/dew ?point|dewpoint|\bdp\b|frost point|absolute humidity|\bah\b|g\/m|taupunkt|dauwpunt|daggpunkt|dugpunkt|point de ros|punto de roc|punto di rugiada/.test(n)) return 'ignore'
  if (/^(date ?\/? ?time|date and time|date & time|datetime|timestamp|time ?stamp|observed|recorded|logged at|reading time|datum ?(\/|und|en|och|og)? ?(uhr)?(zeit|tijd|tid)|zeitstempel|zeitpunkt|tijdstip|tidpunkt|tidsst[a\u00e4]mpel|date ?(\/|et)? ?heure|horodatage|fecha ?(\/|y)? ?hora|data ?(\/|e)? ?ora)\b/.test(n) || /^date[ _-]?time/.test(n)) return 'datetime'
  if (/^(date|datum|fecha|data|dato)\b/.test(n)) return 'date'
  if (/^(time|local time|zeit|uhrzeit|heure|hora|ora|tijd|tid|klockslag|aika|czas|godzina)\b/.test(n)) return 'time'
  if (/\b(rh|r\.h\.|humidity|relative humidity|hum|feuchte|luftfeuchte|luftfeuchtigkeit|feuchtigkeit|humedad|hr|rv|rf|vochtigheid|luchtvochtigheid|luftfuktighet|fuktighet|fugtighed|luftfugtighed|kosteus|wilgotno\u015b\u0107|wilgotnosc)\b|%\s*rh|%rh|%\s*r\.?f\.?|%rf|humidit\u00e9|umidit\u00e0/.test(n)) return 'rh'
  if (/\b(temp|temperature|temperatur|temp\u00e9rature|temperatura|temperatuur|l\u00e4mp\u00f6tila|celsius|fahrenheit|air temp)\b|°\s*[cf]\b|\u2103|\u2109|\bdeg ?[cf]\b|\(\s*[cf]\s*\)/.test(n)) return 'temp'
  return 'ignore'
}

function rolesFromHeader(header: string[]): Role[] {
  const seen = new Set<Role>()
  const roles = header.map((h) => {
    const r = roleOfName(h)
    if (r === 'ignore' || seen.has(r)) return 'ignore'
    seen.add(r)
    return r
  })
  // A lone "Time" column holding whole dates and times is the date-time.
  if (!roles.includes('datetime') && !roles.includes('date') && roles.includes('time')) roles[roles.indexOf('time')] = 'datetime'
  return roles
}

function looksLikeHeader(roles: Role[]): boolean {
  return (roles.includes('datetime') || roles.includes('date')) && (roles.includes('temp') || roles.includes('rh'))
}

export function headerOf(table: Table): number | null {
  const n = Math.min(table.rows.length, 40)
  for (let i = 0; i < n; i++) if (looksLikeHeader(rolesFromHeader(table.rows[i]))) return i
  // Names for the readings but not for the date (a "Local time", or a language not known here): the row above
  // rows whose cells hold dates.
  for (let i = 0; i < n; i++) {
    const roles = rolesFromHeader(table.rows[i])
    if (!roles.includes('temp') && !roles.includes('rh')) continue
    const below = table.rows.slice(i + 1, i + 6)
    if (below.length && table.rows[i].some((_, c) => roles[c] !== 'temp' && roles[c] !== 'rh' && below.every((r) => parseDatePart(r[c] ?? '')))) return i
  }
  return null
}

const mostly = (cells: string[], test: (s: string) => boolean) => {
  const xs = cells.filter((s) => s.trim())
  return xs.length > 0 && xs.filter(test).length >= xs.length * 0.8
}
const isDate = (s: string) => parseDatePart(s) !== null
const hasClock = (s: string) => {
  const p = parseDatePart(s)
  return !!p && (p.rest.startsWith('@') || (p.rest.trim() !== '' && parseTime(p.rest) !== null))
}
const isClock = (s: string) => /\d[:.]\d\d/.test(s) && parseTime(s) !== null && parseDatePart(s) === null

/** Roles from the column names, checked against the cells: a date column found by its values when its name isn't
 * known, a date that holds its time read as a date-time, and a time column found by its values. */
function rolesChecked(names: string[], sample: string[][]): Role[] {
  const roles = rolesFromHeader(names)
  const col = (c: number) => sample.map((r) => r[c] ?? '')
  if (!roles.includes('datetime') && !roles.includes('date')) {
    for (let c = 0; c < roles.length; c++) {
      if (roles[c] !== 'ignore' && roles[c] !== 'time') continue
      if (!mostly(col(c), isDate)) continue
      roles[c] = mostly(col(c), hasClock) ? 'datetime' : 'date'
      break
    }
  }
  // A "date-time" (or a lone "time") column holding dates alone, with the clock in another column.
  const dt = roles.indexOf('datetime')
  if (dt >= 0 && !mostly(col(dt), hasClock) && mostly(col(dt), isDate)) roles[dt] = 'date'
  if (dt >= 0 && !mostly(col(dt), isDate) && mostly(col(dt), isClock)) {
    const d = roles.findIndex((r, c) => r === 'ignore' && mostly(col(c), isDate))
    if (d >= 0) {
      roles[d] = 'date'
      roles[dt] = 'time'
    }
  }
  const dc = roles.indexOf('date')
  if (dc >= 0 && !roles.includes('time')) {
    if (mostly(col(dc), hasClock)) roles[dc] = 'datetime'
    else {
      const tc = roles.findIndex((r, c) => r === 'ignore' && mostly(col(c), isClock))
      if (tc >= 0) roles[tc] = 'time'
    }
  }
  return roles
}

/** Roles from the cells, for a file without column names: a date-time column, then numbers (temperature, then RH). */
function rolesFromCells(rows: string[][], commaDecimal: boolean): Role[] {
  const sample = rows.slice(0, 300)
  let width = 0
  for (const r of sample) if (r.length > width) width = r.length
  const roles: Role[] = new Array(width).fill('ignore')
  let dateCol = -1
  for (let c = 0; c < width && dateCol < 0; c++) {
    const xs = sample.map((r) => r[c] ?? '').filter((s) => s.trim())
    if (xs.length && xs.filter((s) => parseDatePart(s)).length >= xs.length * 0.8) dateCol = c
  }
  if (dateCol < 0) return roles
  roles[dateCol] = 'datetime'
  // A separate time column next to a date-only column.
  const next = sample.map((r) => r[dateCol + 1] ?? '').filter((s) => s.trim())
  if (next.length && next.every((s) => parseTime(s) !== null) && sample.every((r) => !parseDatePart(r[dateCol] ?? '')?.rest)) {
    roles[dateCol] = 'date'
    roles[dateCol + 1] = 'time'
  }
  const numeric: number[] = []
  for (let c = 0; c < width; c++) {
    if (roles[c] !== 'ignore') continue
    const xs = sample.map((r) => r[c] ?? '').filter((s) => s.trim())
    if (!xs.length) continue
    const vals = xs.map((s) => parseNumber(s, commaDecimal))
    if (vals.filter((v) => v !== null && !Number.isNaN(v)).length >= xs.length * 0.9) {
      // A running count (#, 1, 2, 3 …) isn't a reading.
      const ints = vals.every((v, i) => v === null || (Number.isInteger(v) && (i === 0 || v === (vals[i - 1] ?? 0) + 1)))
      if (!ints) numeric.push(c)
    }
  }
  if (numeric[0] !== undefined) roles[numeric[0]] = 'temp'
  if (numeric[1] !== undefined) roles[numeric[1]] = 'rh'
  return roles
}

function median(xs: number[]): number {
  if (!xs.length) return NaN
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** The likeliest layout: the column names if there are any, else the cells; °F from names, values, or warmth. */
export function guessLayout(table: Table, commaDecimal: boolean): Layout {
  const header = headerOf(table)
  const data = table.rows.slice(header === null ? 0 : header + 1)
  const roles = header === null ? rolesFromCells(data, commaDecimal) : rolesChecked(table.rows[header], data.slice(0, 300))
  const dateCol = roles.includes('datetime') ? roles.indexOf('datetime') : roles.indexOf('date')
  const parts = dateCol < 0 ? [] : data.slice(0, 5000).map((r) => parseDatePart(r[dateCol] ?? '')?.date ?? null)
  const { dayFirst } = dayFirstOf(parts)
  let fahrenheit = false
  const tc = roles.indexOf('temp')
  if (tc >= 0) {
    const name = header === null ? '' : table.rows[header][tc] ?? ''
    const cells = data.slice(0, 200).map((r) => r[tc] ?? '')
    if (/°\s*f\b|\bdeg ?f\b|fahrenheit|\(\s*f\s*\)|\bf\)/i.test(name) || cells.some((c) => /°\s*F\s*$|\bF\s*$/.test(c.trim()))) fahrenheit = true
    else if (!/°\s*c\b|\bdeg ?c\b|celsius|\(\s*c\s*\)/i.test(name) && !cells.some((c) => /°\s*C\s*$/i.test(c.trim()))) {
      const vals = cells.map((c) => parseNumber(c, commaDecimal)).filter((v): v is number => v !== null && !Number.isNaN(v))
      // Rooms are rarely above 45 °C; in °F they are rarely below 45.
      if (vals.length >= 3 && median(vals) > 45) fahrenheit = true
    }
  }
  return { header, roles, dayFirst, fahrenheit }
}

/** Readings from a table under a layout. */
export function readingsOf(table: Table, layout: Layout, commaDecimal: boolean): { readings: Reading[]; problems: Problem[] } {
  const readings: Reading[] = []
  const problems: Problem[] = []
  const start = layout.header === null ? 0 : layout.header + 1
  const r = layout.roles
  const dt = r.indexOf('datetime')
  const dc = r.indexOf('date')
  const tc = r.indexOf('time')
  const tempC = r.indexOf('temp')
  const rhC = r.indexOf('rh')
  for (let i = start; i < table.rows.length; i++) {
    const row = table.rows[i]
    const line = table.lines[i]
    const text = row.join(', ').slice(0, 160)
    if (layout.header !== null && row.join('\u0000') === table.rows[layout.header].join('\u0000')) continue
    let temp = tempC < 0 ? null : parseNumber(row[tempC] ?? '', commaDecimal)
    let rh = rhC < 0 ? null : parseNumber(row[rhC] ?? '', commaDecimal)
    const dateText = dt >= 0 ? row[dt] ?? '' : dc >= 0 ? row[dc] ?? '' : ''
    if ((temp === null || Number.isNaN(temp)) && (rh === null || Number.isNaN(rh))) {
      // Event rows and footers carry no reading; a row with a date but unreadable readings is a problem.
      if (dateText.trim() && parseDatePart(dateText) && (Number.isNaN(temp ?? 0) || Number.isNaN(rh ?? 0))) problems.push({ line, text, why: 'the readings weren’t read' })
      continue
    }
    const dp = parseDatePart(dateText)
    if (!dp) {
      problems.push({ line, text, why: dateText.trim() ? `the date “${tidy(dateText)}” wasn’t read` : 'no date' })
      continue
    }
    const ymd = ymdOf(dp.date, layout.dayFirst)
    if (!ymd) {
      problems.push({ line, text, why: `the date “${tidy(dateText)}” isn’t a real day read ${layout.dayFirst ? 'day first' : 'month first'}` })
      continue
    }
    let secs: number | null
    if (dp.rest.startsWith('@')) secs = Number(dp.rest.slice(1))
    else if (dt >= 0) secs = parseTime(dp.rest)
    else if (tc >= 0 && !(row[tc] ?? '').trim()) secs = null
    else secs = parseTime(tc >= 0 ? row[tc] ?? '' : dp.rest)
    if (secs === null) {
      problems.push({ line, text, why: tc >= 0 && !(row[tc] ?? '').trim() ? 'no time' : 'the time wasn’t read' })
      continue
    }
    if (Number.isNaN(temp ?? 0) || Number.isNaN(rh ?? 0)) {
      problems.push({ line, text, why: Number.isNaN(temp ?? 0) ? 'the temperature wasn’t read' : 'the humidity wasn’t read' })
      if (Number.isNaN(temp ?? 0)) temp = null
      if (Number.isNaN(rh ?? 0)) rh = null
      if (temp === null && rh === null) continue
    }
    // Rounded to a millionth, so 64.4 °F is 18 °C exactly and a band's edge stays inside it.
    if (temp !== null && layout.fahrenheit) temp = Math.round(((temp - 32) * 5 * 1e6) / 9) / 1e6
    if (rh !== null && (rh < 0 || rh > 100.5)) {
      problems.push({ line, text, why: `a humidity of ${rh}% isn’t possible` })
      rh = null
      if (temp === null) continue
    }
    if (temp !== null && (temp < -60 || temp > 80)) {
      problems.push({ line, text, why: `a temperature of ${Math.round(temp * 10) / 10} °C is outside what a logger in a building records` })
      temp = null
      if (rh === null) continue
    }
    readings.push({ t: secondsOf(ymd, secs), temp, rh })
  }
  return { readings, problems }
}

/** A name the file gives itself: HOBOware's plot title, or a serial number in the column names. */
function titleOf(table: Table, header: number | null): string | undefined {
  for (const row of table.rows.slice(0, header ?? 0)) {
    const cells = row.map((s) => tidy(s))
    for (let k = 0; k < cells.length; k++) {
      // "Plot Title: Store room" in one cell, or "Description:" and its value in the next.
      const m = /^(plot title|title|logger( name)?|location|description|name)\s*:\s*(.*)$/i.exec(cells[k])
      const value = m ? (m[3].trim() || cells[k + 1]?.trim() || '') : ''
      if (value) return value.slice(0, 60)
    }
  }
  if (header !== null) {
    for (const s of table.rows[header]) {
      const m = /LGR S\/N:\s*([\w-]+)/i.exec(s)
      if (m) return `Logger ${m[1]}`
    }
  }
  return undefined
}

export function readText(input: string, layout?: Layout): ReadResult {
  let text = input.replace(/^\ufeff/, '')
  let cut = false
  if (text.length > READ_LIMITS.characters) {
    text = text.slice(0, READ_LIMITS.characters)
    cut = true
  }
  const table = parseTable(text)
  if (table.cut) cut = true
  const commaDecimal = table.sep !== ','
  const used = layout && layout.roles.length ? layout : guessLayout(table, commaDecimal)
  const { readings, problems } = readingsOf(table, used, commaDecimal)
  const notes: string[] = []
  const dc = used.roles.includes('datetime') ? used.roles.indexOf('datetime') : used.roles.indexOf('date')
  if (dc >= 0) {
    const data = table.rows.slice(used.header === null ? 0 : used.header + 1, (used.header ?? 0) + 5000)
    const { sure, byOrder, dayFirst } = dayFirstOf(data.map((r) => parseDatePart(r[dc] ?? '')?.date ?? null))
    const chosen = used.dayFirst === dayFirst
    if (!sure && byOrder && chosen) notes.push(`Dates such as 06/01 could be read either way: they were read ${used.dayFirst ? 'day first (6 January)' : 'month first (1 June)'}, which keeps the readings in date order. Switch it if that's wrong.`)
    else if (!sure && used.dayFirst) notes.push('Dates such as 03/04 were read day first (3 April); switch it if this logger writes them month first.')
    else if (!used.dayFirst) notes.push('Dates were read month first (04/13 is 13 April).')
  }
  if (used.fahrenheit) notes.push('Temperatures were read as °F.')
  if (used.header === null && used.roles.includes('temp') && used.roles.includes('rh')) notes.push('The file has no column names: the first column of numbers was read as temperature and the next as humidity. Check them under “The columns”.')
  // Several readings on each date, all at midnight: a time column that wasn't found.
  let midnight = readings.length > 1
  for (const r of readings) if (r.t % 86_400 !== 0) midnight = false
  const noTimes = midnight && new Set(readings.map((r) => r.t)).size < readings.length
  if (noTimes) notes.push('Several readings share each date and none has a time of day: say which column holds the time, under “The columns”.')
  let offset: number | undefined
  if (used.header !== null) {
    for (const [c, role] of used.roles.entries()) {
      if (role !== 'datetime' && role !== 'time') continue
      const m = /\b(?:GMT|UTC)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?/i.exec(table.rows[used.header][c] ?? '')
      if (m) offset = (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0))
    }
  }
  return { readings, problems, notes, table: { rows: table.rows, lines: table.lines }, layout: used, title: titleOf(table, used.header), ...(cut ? { cut } : {}), ...(offset !== undefined ? { offset } : {}), ...(noTimes ? { noTimes } : {}) }
}
