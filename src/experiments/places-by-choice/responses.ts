// Reading the choices from a form's responses (a CSV export, or a table pasted from a spreadsheet), in the shapes
// forms write them: a column for each choice, one column holding a ranked list (Microsoft Forms' ranking question),
// or a column for each activity holding its rank (Google Forms' grid).

export type Shape = { kind: 'columns'; columns: number[] } | { kind: 'list'; column: number } | { kind: 'grid'; columns: number[] }

export interface Table {
  header: string[]
  rows: string[][]
  /** Set if the text had more rows than the page reads; the rest were left out. */
  cut?: boolean
}

export interface Response {
  /** The row in the file (1 for the first after the header). */
  row: number
  name: string
  /** Activity names as written, best first. */
  choices: string[]
}

/** The most text the page reads, and the most rows. */
export const READ_LIMITS = { characters: 20_000_000, rows: 20_000 }

/** Rows and columns from CSV or pasted text. The separator is the one (comma, semicolon, or tab) the first line uses
 * most outside quotes. Quotes follow RFC 4180; a byte-order mark and blank lines are dropped. */
export function parseTable(text: string): Table {
  const s = text.replace(/^\uFEFF/, '')
  const firstLine = s.slice(0, s.search(/\r?\n/) < 0 ? s.length : s.search(/\r?\n/))
  const counts = { ',': 0, ';': 0, '\t': 0 }
  let quoted = false
  for (const ch of firstLine) {
    if (ch === '"') quoted = !quoted
    else if (!quoted && ch in counts) counts[ch as keyof typeof counts]++
  }
  const [most, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const sep = n > 0 ? most : ','
  const out: string[][] = []
  let cut = false
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += ch
    } else if (ch === '"' && field === '') inQuotes = true
    else if (ch === sep) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((f) => f.trim() !== '')) out.push(row)
      row = []
      if (out.length > READ_LIMITS.rows) {
        cut = s.slice(i + 1).trim() !== ''
        break
      }
    } else field += ch
  }
  if (!cut) {
    row.push(field)
    if (row.some((f) => f.trim() !== '')) out.push(row)
  }
  const width = Math.max(0, ...out.map((r) => r.length))
  const padded = out.map((r) => (r.length < width ? [...r, ...new Array<string>(width - r.length).fill('')] : r))
  return { header: (padded[0] ?? []).map((h) => h.trim()), rows: padded.slice(1), cut }
}

const ORDINALS: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 }

/** A choice's number from a header or a grid cell: "2nd choice", "Choice 2", "Second preference", "2", "#2". */
export function rankOf(text: string): number | null {
  const t = text.trim().toLowerCase()
  const word = /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b/.exec(t)
  if (word) return ORDINALS[word[1]]
  const number = /(?:^|[^\d])(\d{1,2})(?:st|nd|rd|th)?(?:[^\d]|$)/.exec(t)
  if (number) {
    const n = Number(number[1])
    return n >= 1 && n <= 50 ? n : null
  }
  return null
}

const CHOICE_WORDS = /choice|preference|option|pick|rank|selection|priority|activity|project|workshop|session|elective/i

/** The likeliest name column: one called Name (not a first or last name alone), else the first mostly-unique text
 * column that isn't a time, an ID, or a choice. */
export function guessName(table: Table, used: Set<number>): number {
  const h = table.header.map((x) => x.toLowerCase())
  const exact = h.findIndex((x, i) => !used.has(i) && /^(full\s*)?name$|^(student|pupil|participant|attendee|delegate|person)(\s*name)?$|^your\s*(full\s*)?name/.test(x))
  if (exact >= 0) return exact
  const named = h.findIndex((x, i) => !used.has(i) && /name/.test(x) && !/(first|last|sur|given|family|user)\s*name/.test(x))
  if (named >= 0) return named
  const email = h.findIndex((x, i) => !used.has(i) && /e-?mail/.test(x))
  if (email >= 0) return email
  for (let i = 0; i < h.length; i++) {
    if (used.has(i) || /time|date|^id$|start|completion/.test(h[i])) continue
    const values = table.rows.map((r) => r[i].trim()).filter(Boolean)
    if (values.length && new Set(values).size >= values.length * 0.8) return i
  }
  return -1
}

/** The shape the choices are in, and which columns hold them; null if none is recognized. */
export function guessShape(table: Table): Shape | null {
  const h = table.header
  // A column per activity, holding its rank: Google Forms' grid writes "Question [Activity]".
  const grid = h.map((x, i) => ({ i, m: /^(.*)\[([^\]]+)\]\s*$/.exec(x) })).filter((x) => x.m)
  if (grid.length >= 2) {
    const prefix = grid[0].m![1].trim()
    const same = grid.filter((x) => x.m![1].trim() === prefix)
    const ranked = same.filter((x) => share(table, x.i, (v) => rankOf(v) !== null) >= 0.6)
    if (ranked.length >= 2) return { kind: 'grid', columns: ranked.map((x) => x.i) }
  }
  // A column for each choice, numbered in its header.
  const numbered = h
    .map((x, i) => ({ i, r: CHOICE_WORDS.test(x) ? rankOf(x) : null }))
    .filter((x): x is { i: number; r: number } => x.r !== null)
    .sort((a, b) => a.r - b.r)
  const columns: number[] = []
  for (const x of numbered) if (x.r === columns.length + 1) columns.push(x.i)
  if (columns.length >= 2) return { kind: 'columns', columns }
  // One column holding a ranked list, as Microsoft Forms writes a ranking question: "A;B;C;".
  let best = -1
  let bestShare = 0
  for (let i = 0; i < h.length; i++) {
    const share_ = share(table, i, (v) => v.split(';').filter((x) => x.trim()).length >= 2)
    if (share_ > bestShare) {
      best = i
      bestShare = share_
    }
  }
  if (best >= 0 && bestShare >= 0.5) return { kind: 'list', column: best }
  return null
}

/** The share of the non-empty values in a column that pass a test. */
function share(table: Table, column: number, test: (v: string) => boolean): number {
  let n = 0
  let yes = 0
  for (const r of table.rows) {
    const v = r[column]?.trim()
    if (!v) continue
    n++
    if (test(v)) yes++
  }
  return n ? yes / n : 0
}

/** Each row's name and choices, in the given shape. A choice repeated in one row counts once, where it first appears. */
export function readResponses(table: Table, nameColumn: number, shape: Shape): Response[] {
  const out: Response[] = []
  // Only columns the table has (a shape chosen for another table could name others).
  const width = table.header.length
  if (shape.kind === 'list' ? shape.column >= width : shape.columns.some((c) => c >= width)) return out
  table.rows.forEach((r, index) => {
    let choices: string[] = []
    if (shape.kind === 'columns') choices = shape.columns.map((c) => r[c] ?? '')
    else if (shape.kind === 'list') choices = (r[shape.column] ?? '').split(';')
    else {
      const ranked = shape.columns
        .map((c) => ({ name: gridItem(table.header[c] ?? ''), rank: rankOf(r[c] ?? '') }))
        .filter((x): x is { name: string; rank: number } => x.rank !== null)
        .sort((a, b) => a.rank - b.rank)
      choices = ranked.map((x) => x.name)
    }
    const seen = new Set<string>()
    const clean: string[] = []
    for (const c of choices) {
      const t = tidy(c)
      const key = keyOf(t)
      if (!t || seen.has(key)) continue
      seen.add(key)
      clean.push(t)
    }
    out.push({ row: index + 1, name: tidy(r[nameColumn] ?? ''), choices: clean })
  })
  return out
}

/** The activity in a grid column's header: "Rank the activities [Archery]" gives "Archery". */
export function gridItem(header: string): string {
  return tidy(/\[([^\]]+)\]\s*$/.exec(header)?.[1] ?? header)
}

/** Text with its spaces tidied. */
export function tidy(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/** How activity names are matched: ignoring case, spacing, and a trailing full stop. */
export function keyOf(s: string): string {
  return tidy(s).replace(/\.$/, '').toLowerCase()
}
