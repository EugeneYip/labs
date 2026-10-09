/**
 * Fluency Check's scoring. A check is a passage, the words marked as errors
 * or self-corrections, the last word the student read, and the reading time.
 * Words correct per minute (WCPM) is the words read minus errors, scaled to a
 * minute; accuracy is the share of words read correctly.
 */

export interface Passage {
  /** Each word as shown, with its punctuation attached. */
  words: string[]
  /** Indexes of the words that start a new paragraph (always includes 0 when there are words). */
  starts: number[]
}

const INVISIBLE = /[\u00AD\u200B-\u200D\u2060\uFEFF]/g
const SPACES = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g
const HAS_LETTER_OR_DIGIT = /[\p{L}\p{N}]/u

/**
 * Splits pasted text into words. Blank lines separate paragraphs; single line
 * breaks, as in text copied from a PDF, are just spaces, and a word hyphenated
 * across a line break stays one word. A dash between two words splits them.
 * Punctuation on its own, like a spaced dash, isn't a word: it's shown with
 * the word before it.
 */
export function parsePassage(text: string): Passage {
  const clean = text.normalize('NFC').replace(INVISIBLE, '').replace(SPACES, ' ').replace(/\r\n?/g, '\n')
  const words: string[] = []
  const starts: number[] = []
  for (const paragraph of clean.split(/\n\s*\n/)) {
    const joined = paragraph.replace(/(\p{L})-\n\s*(\p{L})/gu, '$1-$2')
    const tokens = joined
      .split(/\s+/)
      .flatMap((token) => token.split(/(?<=\p{L}[\u2013\u2014])(?=\p{L})/u))
      .filter(Boolean)
    const first = words.length
    for (const token of tokens) {
      if (HAS_LETTER_OR_DIGIT.test(token)) words.push(token)
      else if (words.length > first) words[words.length - 1] += ` ${token}`
      // Punctuation before the first word of a paragraph (a lone dash or bullet) is dropped.
    }
    if (words.length > first) starts.push(first)
  }
  return { words, starts }
}

export type Mark = 'error' | 'sc'
export type Marks = Partial<Record<number, Mark>>

/** One tap marks an error, a second marks it self-corrected, a third clears it. */
export function nextMark(mark: Mark | undefined): Mark | undefined {
  return mark === undefined ? 'error' : mark === 'error' ? 'sc' : undefined
}

export interface Result {
  /** Words from the start up to and including the last word read. */
  read: number
  errors: number
  selfCorrections: number
  correct: number
  ms: number
  wcpm: number
  /** Percent of words read correctly, or null when nothing was read. */
  accuracy: number | null
  /** The words read incorrectly, without their punctuation, in order. */
  missed: string[]
}

/** Scores a check. Marks after the last word read don't count. */
export function score(passage: Passage, marks: Marks, last: number, ms: number): Result {
  const end = Math.min(last, passage.words.length - 1)
  const read = Math.max(0, end + 1)
  let errors = 0
  let selfCorrections = 0
  const missed: string[] = []
  for (let i = 0; i < read; i++) {
    if (marks[i] === 'error') {
      errors++
      missed.push(bareWord(passage.words[i]))
    } else if (marks[i] === 'sc') selfCorrections++
  }
  const correct = read - errors
  // A check stopped within a second can't be scaled to a minute meaningfully.
  const minutes = Math.max(ms, 1000) / 60_000
  return {
    read,
    errors,
    selfCorrections,
    correct,
    ms,
    wcpm: Math.round(correct / minutes),
    accuracy: read ? (correct / read) * 100 : null,
    missed,
  }
}

/**
 * Accuracy as a whole percent, rounded down so a reading with errors never
 * shows as 100% and one just under a guideline never shows as meeting it.
 */
export const percent = (accuracy: number) => Math.floor(accuracy + 1e-9)

export type Band = 'comfortable' | 'challenging' | 'hard'

/** Common guidelines: 95% or more is comfortable, 90 to 94% challenging, below 90% too hard for now. */
export function band(accuracy: number): Band {
  return accuracy >= 95 ? 'comfortable' : accuracy >= 90 ? 'challenging' : 'hard'
}

/** A word without the punctuation around it: "“Hello," becomes Hello. */
export function bareWord(word: string): string {
  return word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '') || word
}

/** 0:47, or 1:05. Rounds up, so a countdown shows 0:01 until time is really up. */
export function clock(ms: number, up = false): string {
  const total = up ? Math.ceil(Math.max(0, ms) / 1000) : Math.floor(Math.max(0, ms) / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** A short name for a passage: its title, or its first few words. */
export function passageName(title: string, passage: Passage): string {
  const t = title.trim()
  if (t) return t
  const first = passage.words.slice(0, 5).join(' ')
  return passage.words.length > 5 ? `${first}…` : first || 'Untitled passage'
}

/** A saved check, kept on this device. */
export interface Check {
  id: string
  /** When the check was done, as a timestamp. */
  at: number
  student: string
  passage: string
  /** Words in the whole passage, or 0 for a check loaded from a CSV, which doesn't record it. */
  length: number
  mode: Mode
  read: number
  errors: number
  selfCorrections: number
  ms: number
  wcpm: number
  accuracy: number | null
  goal: number | null
  missed: string[]
}

export type Mode = 'minute' | 'whole'

export const MINUTE = 60_000

const csvCell = (value: string | number | null) => {
  if (value === null) return ''
  if (typeof value === 'number') return String(value)
  // Defuse text a spreadsheet would run as a formula, and quote anything with separators.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

const pad = (n: number) => String(n).padStart(2, '0')
/** Local date and time as 2026-10-09 and 14:05. */
export function localStamp(at: number): { date: string; time: string } {
  const d = new Date(at)
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }
}

export function toCSV(checks: readonly Check[]): string {
  const header = ['Date', 'Time', 'Student', 'Passage', 'Timing', 'Seconds', 'Words read', 'Errors', 'Self-corrections', 'Words correct', 'WCPM', 'Accuracy %', 'Goal WCPM', 'Missed words']
  const rows = checks.map((c) => {
    const { date, time } = localStamp(c.at)
    return [
      date,
      time,
      c.student,
      c.passage,
      c.mode === 'minute' ? 'One minute' : 'Whole passage',
      Math.round(c.ms / 100) / 10,
      c.read,
      c.errors,
      c.selfCorrections,
      c.read - c.errors,
      c.wcpm,
      c.accuracy === null ? null : Math.round(c.accuracy * 10) / 10,
      c.goal,
      c.missed.join(' '),
    ]
  })
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

/** The same check in the log and in a CSV, which keeps times only to the minute. */
export function checkKey(c: Check): string {
  const { date, time } = localStamp(c.at)
  return [date, time, c.student.trim().toLocaleLowerCase(), c.passage, c.read, c.errors, c.wcpm].join('|')
}

const COLUMNS = ['date', 'time', 'student', 'passage', 'timing', 'seconds', 'words read', 'errors', 'self-corrections', 'wcpm', 'goal wcpm', 'missed words']
const REQUIRED = ['date', 'student', 'passage', 'words read', 'errors', 'wcpm']

/**
 * Reads checks back from a CSV made by toCSV, including one a spreadsheet has
 * re-saved with semicolons or tabs. Returns null for any other kind of file,
 * and counts the rows that couldn't be read.
 */
export function fromCSV(text: string, newId: () => string): { checks: Check[]; unreadable: number } | null {
  const clean = text.replace(/^\uFEFF/, '')
  const firstLine = clean.slice(0, clean.search(/[\r\n]|$/))
  let sep = ','
  let found = 0
  for (const candidate of [',', ';', '\t']) {
    const n = (csvRows(firstLine, candidate)[0] ?? []).filter((h) => COLUMNS.includes(h.trim().toLowerCase())).length
    if (n > found) [sep, found] = [candidate, n]
  }
  const rows = csvRows(clean, sep)
  const header = (rows.shift() ?? []).map((h) => h.trim().toLowerCase())
  if (!REQUIRED.every((name) => header.includes(name))) return null
  // Undo the quote mark toCSV adds to text a spreadsheet would run as a formula.
  const cell = (row: string[], name: string) => (row[header.indexOf(name)] ?? '').replace(/^'(?=[=+\-@\t\r])/, '').trim()
  const count = (v: string) => (/^\d{1,6}$/.test(v) ? Number(v) : null)

  const checks: Check[] = []
  let unreadable = 0
  for (const row of rows) {
    const at = csvTime(cell(row, 'date'), cell(row, 'time'))
    const read = count(cell(row, 'words read'))
    const errors = count(cell(row, 'errors'))
    const selfCorrections = cell(row, 'self-corrections') === '' ? 0 : count(cell(row, 'self-corrections'))
    const wcpm = count(cell(row, 'wcpm'))
    if (at === null || read === null || errors === null || selfCorrections === null || wcpm === null || errors + selfCorrections > read) {
      unreadable++
      continue
    }
    const seconds = cell(row, 'seconds').replace(',', '.')
    const goal = count(cell(row, 'goal wcpm'))
    checks.push({
      id: newId(),
      at,
      student: cell(row, 'student').slice(0, 200),
      passage: cell(row, 'passage').slice(0, 200),
      length: 0,
      mode: /whole/i.test(cell(row, 'timing')) ? 'whole' : 'minute',
      read,
      errors,
      selfCorrections,
      ms: /^\d+(\.\d+)?$/.test(seconds) ? Math.round(Number(seconds) * 1000) : MINUTE,
      wcpm,
      accuracy: read ? ((read - errors) / read) * 100 : null,
      goal: goal ? goal : null,
      missed: cell(row, 'missed words').split(/\s+/).filter(Boolean),
    })
  }
  return { checks, unreadable }
}

/** Rows of cells, with quoted cells holding separators, quotes, and line breaks. Blank rows are dropped. */
function csvRows(text: string, sep: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch !== '"') cell += ch
      else if (text[i + 1] === '"') cell += text[i++]
      else quoted = false
    } else if (ch === '"' && cell === '') quoted = true
    else if (ch === sep) {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  row.push(cell)
  rows.push(row)
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

/** A local date like 2026-10-09 and a time like 14:05 or 2:05 PM, as a timestamp. */
function csvTime(date: string, time: string): number | null {
  const d = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(date)
  const t = time === '' ? ['', '0', '0', undefined] : /^(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?\s*([ap])?\.?\s*(?:m\.?)?$/i.exec(time)
  if (!d || !t) return null
  const [year, month, day, minute] = [Number(d[1]), Number(d[2]) - 1, Number(d[3]), Number(t[2])]
  let hour = Number(t[1])
  if (t[3]) {
    if (hour < 1 || hour > 12) return null
    hour = (hour % 12) + (t[3].toLowerCase() === 'p' ? 12 : 0)
  }
  const at = new Date(year, month, day, hour, minute)
  return hour < 24 && minute < 60 && at.getFullYear() === year && at.getMonth() === month && at.getDate() === day ? at.getTime() : null
}

export const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)
