/**
 * A streaming CSV parser in the RFC 4180 style: quoted fields, doubled quotes,
 * delimiters and line breaks inside quotes, and \n, \r\n, or \r line endings.
 * Feed it text in chunks of any size; it calls back with each finished row.
 */

const FIELD_START = 0
const UNQUOTED = 1
const QUOTED = 2
const QUOTE_IN_QUOTED = 3
const AFTER_CR = 4

export class CsvParser {
  private state = FIELD_START
  private field = ''
  private row: string[] = []
  /** True if the file ended inside a quoted field. */
  unclosedQuote = false

  private readonly delimiter: string
  private readonly onRow: (row: string[]) => void

  constructor(delimiter: string, onRow: (row: string[]) => void) {
    this.delimiter = delimiter
    this.onRow = onRow
  }

  push(text: string) {
    let start = 0
    const take = (end: number) => {
      if (end > start) this.field += text.slice(start, end)
    }
    for (let i = 0; i < text.length; i++) {
      const c = text[i]
      if (this.state === QUOTED) {
        if (c === '"') {
          take(i)
          this.state = QUOTE_IN_QUOTED
          start = i + 1
        }
        continue
      }
      if (this.state === QUOTE_IN_QUOTED) {
        if (c === '"') {
          this.field += '"' // a doubled quote is a literal quote
          this.state = QUOTED
          start = i + 1
          continue
        }
        this.state = UNQUOTED // the quote closed the field; anything up to the delimiter is kept
        start = i
      }
      if (this.state === AFTER_CR) {
        this.state = FIELD_START
        if (c === '\n') {
          start = i + 1
          continue
        }
      }
      if (c === this.delimiter) {
        take(i)
        this.endField()
        start = i + 1
      } else if (c === '\n' || c === '\r') {
        take(i)
        this.endField()
        this.endRow()
        if (c === '\r') this.state = AFTER_CR
        start = i + 1
      } else if (c === '"' && this.state === FIELD_START) {
        this.state = QUOTED
        start = i + 1
      } else if (this.state === FIELD_START) {
        this.state = UNQUOTED
      }
    }
    take(text.length)
  }

  end() {
    if (this.state === QUOTED) this.unclosedQuote = true
    if (this.field !== '' || this.row.length > 0 || this.state === QUOTED) {
      this.endField()
      this.endRow()
    }
  }

  private endField() {
    this.row.push(this.field)
    this.field = ''
    this.state = FIELD_START
  }

  private endRow() {
    this.onRow(this.row)
    this.row = []
  }
}

const CANDIDATES = [',', ';', '\t', '|']

/** Guesses the delimiter from the first lines: the one that appears the same number of times on most lines. */
export function detectDelimiter(sample: string): string {
  const lines = sample
    .split(/\r\n|\n|\r/)
    .slice(0, 50)
    .filter((line) => line.trim())
    .map((line) => line.replace(/"(?:[^"]|"")*"/g, '')) // ignore delimiters inside quotes
  let best = ','
  let bestScore = 0
  for (const delimiter of CANDIDATES) {
    const counts = lines.map((line) => line.split(delimiter).length - 1)
    const frequency = new Map<number, number>()
    for (const count of counts) if (count > 0) frequency.set(count, (frequency.get(count) ?? 0) + 1)
    const [mode, agreeing] = [...frequency].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0] ?? [0, 0]
    const score = mode > 0 ? (agreeing / lines.length) * 10 + Math.min(mode, 10) / 10 : 0
    if (score > bestScore) {
      best = delimiter
      bestScore = score
    }
  }
  return best
}

export const DELIMITER_NAMES: Record<string, string> = { ',': 'comma', ';': 'semicolon', '\t': 'tab', '|': 'pipe' }
