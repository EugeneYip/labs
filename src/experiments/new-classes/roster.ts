// New Classes: reading a year group from a table (a CSV file, or cells copied from a spreadsheet): one row per child,
// with a name (or first and last names), the friends each named (in one cell or several columns), children to keep
// apart or together, and columns to balance. Friends are matched to the roster by full name, then by first name and
// surname initial, then by first name alone when only one child has it.

import type { YearGroup } from './model.ts'

export interface Table {
  header: string[]
  rows: string[][]
  cut?: boolean
}

export type Role = 'name' | 'first' | 'last' | 'friend' | 'apart' | 'with' | 'balance' | 'start' | 'ignore'

export interface Read {
  group: YearGroup
  /** For each child, the table row they came from. */
  rows: number[]
  /** For each child, the class named in a "New class" column (the page's own download), or ''. */
  start: string[]
  notes: string[]
  /** Names written for friends, apart, or with that matched nobody, with who wrote them. */
  unmatched: { name: string; by: string; role: 'friend' | 'apart' | 'with' }[]
  /** Names that appear more than once in the roster. */
  repeated: string[]
}

export const READ_LIMITS = { characters: 5_000_000, rows: 5_000 }

export function tidy(s: string): string {
  return s.normalize('NFC').replace(/\s+/g, ' ').trim()
}

/** What matches two spellings of a name: case, accents, spacing, and punctuation ignored. */
export function keyOf(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[-\u2010-\u2015_/]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]+/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Rows and columns from CSV or pasted cells (comma, semicolon, or tab: whichever the first line uses most). */
export function parseTable(text: string): Table {
  const s = text.replace(/^\uFEFF/, '')
  const end = s.search(/\r?\n/)
  const firstLine = end < 0 ? s : s.slice(0, end)
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 }
  let quoted = false
  for (const ch of firstLine) {
    if (ch === '"') quoted = !quoted
    else if (!quoted && ch in counts) counts[ch]++
  }
  const [most, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
  const sep = n > 0 ? most : ','
  const out: string[][] = []
  let cut = false
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const endRow = () => {
    row.push(field)
    field = ''
    if (row.some((f) => f.trim() !== '')) out.push(row)
    row = []
  }
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
      endRow()
      if (out.length > READ_LIMITS.rows) {
        cut = true
        break
      }
    } else field += ch
  }
  if (!cut && (field !== '' || row.length)) endRow()
  if (out.length > READ_LIMITS.rows + 1) {
    out.length = READ_LIMITS.rows + 1
    cut = true
  }
  const width = Math.max(0, ...out.map((r) => r.length))
  const [header = [], ...rows] = out.map((r) => [...r, ...new Array<string>(width - r.length).fill('')])
  return { header: header.map(tidy), rows, ...(cut ? { cut } : {}) }
}

const HEADS: [RegExp, Role][] = [
  [/^new class$/i, 'start'],
  [/(not with|apart|separate|avoid|keep away|split from|do not place)/i, 'apart'],
  [/(keep with|together|place with|same class as)/i, 'with'],
  [/(friend|buddy|pal|choice|nominat|would like to be with|wants to be with)/i, 'friend'],
  [/^((legal|preferred|known as) )?(first|forename|given)( ?names?)?$|^first ?name|^forename/i, 'first'],
  [/^((legal|preferred) )?(last|surname|family)( ?name)?$|^last ?name|^surname/i, 'last'],
  [/^((legal|preferred|full) )?name$|^(pupil|child|student)( name)?$/i, 'name'],
]

/** The likeliest role of each column, from its header and cells. */
export function guessRoles(table: Table): Role[] {
  const roles: Role[] = table.header.map((h) => {
    for (const [re, role] of HEADS) if (re.test(h)) return role
    return 'balance'
  })
  // A name column is needed: the first text column if nothing said "name".
  if (!roles.includes('name') && !roles.includes('first')) {
    const i = table.header.findIndex((_, c) => roles[c] === 'balance' && table.rows.some((r) => /\p{L}{2}/u.test(r[c] ?? '')))
    if (i >= 0) roles[i] = 'name'
  }
  // Columns that are identifiers or free text aren't balanced by default.
  table.header.forEach((h, c) => {
    if (roles[c] !== 'balance') return
    const values = new Set(table.rows.map((r) => keyOf(r[c] ?? '')).filter(Boolean))
    if (/^(upn|id|adno|admission|dob|date of birth|notes?|comments?|email|address|postcode|phone)/i.test(h) || values.size > Math.max(12, table.rows.length * 0.5) && !isNumeric(table, c)) roles[c] = 'ignore'
  })
  return roles
}

function isNumeric(table: Table, c: number): boolean {
  const v = table.rows.map((r) => tidy(r[c] ?? '')).filter(Boolean)
  return v.length > 0 && v.filter((x) => /^-?\d+(\.\d+)?%?$/.test(x)).length >= v.length * 0.8
}

const YES = /^(y|yes|true|1|x|✓|✔|☑)$/i

/**
 * Reads the year group with the given column roles. `aliases` maps a written name (by its key) to the roster name it
 * means, for names that didn't match.
 */
export function readYearGroup(table: Table, roles: Role[], aliases: ReadonlyMap<string, string> = new Map()): Read {
  const notes: string[] = []
  const col = (role: Role) => roles.map((r, i) => (r === role ? i : -1)).filter((i) => i >= 0)
  const nameCols = col('name')
  const firstCols = col('first')
  const lastCols = col('last')
  const rows = table.rows
    .map((r, row) => {
      const name = nameCols.length
        ? tidy(nameCols.map((c) => r[c] ?? '').join(' '))
        : tidy([...firstCols.map((c) => r[c] ?? ''), ...lastCols.map((c) => r[c] ?? '')].join(' '))
      return { r, row, name: turnRound(name) }
    })
    .filter((x) => x.name !== '')
  const names = rows.map((x) => x.name)

  // Indexes for matching what children wrote.
  const byKey = new Map<string, number[]>()
  names.forEach((nm, i) => byKey.set(keyOf(nm), [...(byKey.get(keyOf(nm)) ?? []), i]))
  const repeated = [...byKey.values()].filter((v) => v.length > 1).map((v) => names[v[0]])
  const byFirst = new Map<string, number[]>()
  const byFirstInitial = new Map<string, number[]>()
  names.forEach((nm, i) => {
    const t = keyOf(nm).split(' ')
    byFirst.set(t[0], [...(byFirst.get(t[0]) ?? []), i])
    if (t.length > 1) {
      const k = `${t[0]} ${t[t.length - 1][0]}`
      byFirstInitial.set(k, [...(byFirstInitial.get(k) ?? []), i])
    }
  })
  const match = (written: string): number => {
    const alias = aliases.get(keyOf(written))
    const k = keyOf(alias ?? written)
    if (!k) return -1
    const full = byKey.get(k)
    if (full) return full.length === 1 ? full[0] : -1
    const t = k.split(' ')
    if (t.length === 2 && t[1].length === 1) {
      const m = byFirstInitial.get(k)
      if (m?.length === 1) return m[0]
    }
    if (t.length === 1) {
      const m = byFirst.get(t[0])
      if (m?.length === 1) return m[0]
    }
    return -1
  }

  // The names in a cell: the whole cell when it's one name ("Smith, Ava" too); otherwise split at semicolons, slashes,
  // and line breaks, then at commas and "and" in pieces that aren't a name themselves.
  const isName = (t: string) => match(t) >= 0 || match(turnRound(t)) >= 0
  const namesIn = (cell: string): string[] => {
    const whole = tidy(cell)
    if (!whole) return []
    if (isName(whole)) return [whole]
    return whole
      .split(/[;/\n]/)
      .map(tidy)
      .filter(Boolean)
      .flatMap((piece) => (isName(piece) ? [piece] : piece.split(/,| and | & /i).map(tidy).filter(Boolean)))
  }
  const unmatched: Read['unmatched'] = []
  const listOf = (r: string[], role: 'friend' | 'apart' | 'with', by: number): number[] => {
    const out: number[] = []
    for (const c of col(role))
      for (const written of namesIn(r[c] ?? '')) {
        let m = match(written)
        if (m < 0) m = match(turnRound(written))
        if (m < 0) unmatched.push({ name: written, by: names[by], role })
        else if (m !== by && !out.includes(m)) out.push(m)
      }
    return out
  }
  const friends = rows.map((x, i) => listOf(x.r, 'friend', i).slice(0, 10))
  const apartSet = new Set<string>()
  const apart: [number, number][] = []
  const together: number[][] = []
  rows.forEach((x, i) => {
    for (const j of listOf(x.r, 'apart', i)) {
      const key = i < j ? `${i},${j}` : `${j},${i}`
      if (!apartSet.has(key)) {
        apartSet.add(key)
        apart.push([Math.min(i, j), Math.max(i, j)])
      }
    }
    const w = listOf(x.r, 'with', i)
    if (w.length) together.push([i, ...w])
  })
  // A friend who must be kept apart isn't counted as a friend.
  let dropped = 0
  friends.forEach((fs, i) => {
    const keep = fs.filter((f) => !apartSet.has(i < f ? `${i},${f}` : `${f},${i}`))
    dropped += fs.length - keep.length
    friends[i] = keep
  })
  if (dropped) notes.push(`${plural(dropped, 'friend')} named but also kept apart ${dropped === 1 ? 'isn’t' : 'aren’t'} counted as ${dropped === 1 ? 'a friend' : 'friends'}.`)

  // Balanced columns: values compared ignoring case and spacing; numbers in thirds; yes-like marks as yes.
  const columns: YearGroup['columns'] = []
  roles.forEach((role, c) => {
    if (role !== 'balance') return
    const raw = rows.map((x) => tidy(x.r[c] ?? ''))
    const numeric = raw.filter(Boolean).length > 0 && raw.filter(Boolean).every((v) => /^-?\d+(\.\d+)?%?$/.test(v)) && new Set(raw.filter(Boolean)).size > 4
    if (numeric) {
      const nums = raw.map((v) => (v ? parseFloat(v) : NaN))
      const sorted = nums.filter((v) => !Number.isNaN(v)).sort((a, b) => a - b)
      const lowCut = sorted[Math.floor(sorted.length / 3)]
      const highCut = sorted[Math.floor((2 * sorted.length) / 3)]
      const labels = [`lower (below ${lowCut})`, `middle (${lowCut} to below ${highCut})`, `higher (${highCut} or more)`, '(blank)']
      columns.push({
        name: table.header[c] || `Column ${c + 1}`,
        labels,
        values: nums.map((v) => (Number.isNaN(v) ? 3 : v < lowCut ? 0 : v < highCut ? 1 : 2)),
      })
      notes.push(`${table.header[c] || `Column ${c + 1}`} holds numbers, so it’s balanced in thirds.`)
      return
    }
    const flag = raw.every((v) => !v || YES.test(v) || /^(n|no|false|0)$/i.test(v))
    const labels: string[] = []
    const index = new Map<string, number>()
    const values = raw.map((v) => {
      const shown = flag ? (YES.test(v) ? 'yes' : 'no') : v || '(blank)'
      const k = keyOf(shown) || shown
      if (!index.has(k)) {
        index.set(k, labels.length)
        labels.push(shown)
      }
      return index.get(k)!
    })
    columns.push({ name: table.header[c] || `Column ${c + 1}`, labels, values })
  })

  const startCol = col('start')[0]
  const start = rows.map((x) => (startCol === undefined ? '' : tidy(x.r[startCol] ?? '')))
  if (repeated.length) notes.push(`${plural(repeated.length, 'name')} ${repeated.length === 1 ? 'appears' : 'appear'} more than once (${repeated.slice(0, 3).join(', ')}): friends naming ${repeated.length === 1 ? 'it' : 'them'} can’t be matched.`)
  if (table.cut) notes.push(`Only the first ${READ_LIMITS.rows.toLocaleString('en')} rows were read.`)
  const withFriends = friends.filter((f) => f.length).length
  if (col('friend').length && withFriends < rows.length) notes.push(`${plural(rows.length - withFriends, 'child', 'children')} named no friend who was found.`)
  return { group: { names, friends, apart, together, columns }, rows: rows.map((x) => x.row), start, notes, unmatched, repeated }
}

/** Roster names a written name might mean: one or two letters different, or the same first name and surname initial. */
export function maybeFor(written: string, names: string[]): string[] {
  const k = keyOf(written)
  if (!k) return []
  const t = k.split(' ')
  const out: string[] = []
  for (const name of names) {
    const n = keyOf(name)
    const nt = n.split(' ')
    const close = Math.abs(n.length - k.length) <= 2 && within(n, k, 2)
    const firstClose = t.length === 1 && within(nt[0], t[0], 1)
    const initial = t.length === 2 && nt.length > 1 && within(nt[0], t[0], 1) && nt[nt.length - 1].startsWith(t[1])
    if (close || firstClose || initial) out.push(name)
    if (out.length > 3) break
  }
  return out
}

/** Whether a and b are at most `limit` single-letter edits apart. */
function within(a: string, b: string, limit: number): boolean {
  if (Math.abs(a.length - b.length) > limit) return false
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const row = [i]
    let low = i
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      low = Math.min(low, row[j])
    }
    if (low > limit) return false
    prev = row
  }
  return prev[b.length] <= limit
}

/** "Last, First" in one name cell becomes "First Last". */
function turnRound(name: string): string {
  const m = /^\s*([^,]+?)\s*,\s*([^,]+?)\s*$/.exec(name)
  return m ? tidy(`${m[2]} ${m[1]}`) : name
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`
