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
  /** Words in the whole passage. */
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
