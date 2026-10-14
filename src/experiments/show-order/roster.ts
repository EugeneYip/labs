// Show Order: reading the routines and who is in each, from what a planner has. Lines typed or pasted (a routine and
// its dancers on a line, "Jazz 5-7: Ava Smith, Leo Park", or the dancers on the next line, as printed programs set
// them), or a table (a CSV file, or cells copied from a spreadsheet) in the shapes rosters come in: a routine per row
// with its dancers in one cell, a dancer per row with the routine beside it (as studio software exports), or dancers
// down and routines across with a mark in each cell.

export interface Read {
  /** Routines in the order given, with their dancers' names as written, each dancer once. */
  routines: { name: string; dancers: string[] }[]
  /** Intermissions: after how many routines each comes. */
  breaks: number[]
  /** What's worth saying about the reading. */
  notes: string[]
}

export interface Table {
  header: string[]
  rows: string[][]
  /** Set if the text had more rows than the page reads. */
  cut?: boolean
}

export type Shape =
  | { kind: 'list'; routine: number; dancers: number }
  | { kind: 'long'; routine: number; dancers: number[] }
  | { kind: 'grid'; names: number[]; routines: number[] }

export const READ_LIMITS = { characters: 2_000_000, rows: 20_000 }

/** A name as shown: spaces tidied. */
export function tidy(name: string): string {
  return name.normalize('NFC').replace(/[\s\u00a0\u200b]+/g, ' ').trim()
}

/** What matches two spellings of one name: case, accents, spacing, and punctuation ignored (hyphens count as spaces). */
export function keyOf(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[-‐-―_/]+/g, ' ')
    .replace(/[^\p{L}\p{N}()\s]+/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const BREAK_LINE = /^[\s\W_]*(intermission|interval|break|half[ -]?time|pause|entr'?acte)[\s\W_]*$/i
const NUMBERING = /^\s*(?:#\s*\d{1,3}|\d{1,3}\s*[.)])\s+/

/** Splits a list of dancers: commas, semicolons, and line breaks, then "and", "&", or "+" between two names. */
export function splitNames(list: string): string[] {
  return list
    .split(/[,;\n\r]+/)
    .flatMap((part) => part.split(/\s+(?:&|and|\+)\s+/i))
    .map(tidy)
    .filter((s) => s !== '')
}

/** Where a line's routine name ends and its dancers begin: the last " | ", else the last colon, tab, or spaced dash. */
function separate(line: string): { name: string; list: string } | null {
  for (const sep of [' | ', ':', '\t', ' — ', ' – ', ' - ']) {
    const at = line.lastIndexOf(sep)
    if (at > 0) return { name: line.slice(0, at), list: line.slice(at + sep.length) }
  }
  return null
}

/** Reads lines: "Routine: dancer, dancer" (or | , a tab, or a spaced dash), "Intermission" on a line of its own. */
export function readLines(text: string): Read {
  const routines: Read['routines'] = []
  const breaks: number[] = []
  let continued = 0
  let bare = 0
  for (const raw of text.replace(/^\uFEFF/, '').split(/\r\n|\r|\n/)) {
    const line = raw.trim()
    if (!line) continue
    if (BREAK_LINE.test(line)) {
      if (routines.length > 0 && !breaks.includes(routines.length)) breaks.push(routines.length)
      continue
    }
    const parts = separate(line)
    if (parts) {
      routines.push({ name: tidy(parts.name.replace(NUMBERING, '')), dancers: [] })
      addNames(routines[routines.length - 1], splitNames(parts.list))
      continue
    }
    const last = routines[routines.length - 1]
    // A list of names straight after a routine that has none: that routine's dancers, set out on the next line.
    if (last && last.dancers.length === 0 && /[,;]/.test(line)) {
      addNames(last, splitNames(line))
      continued++
      continue
    }
    routines.push({ name: tidy(line.replace(NUMBERING, '')), dancers: [] })
    bare++
  }
  const notes: string[] = []
  if (continued) notes.push(`${plural(continued, 'routine')} had ${continued === 1 ? 'its' : 'their'} dancers on the next line.`)
  const empty = routines.filter((r) => r.dancers.length === 0).length
  if (empty && bare) notes.push(`${plural(empty, 'routine')} ${empty === 1 ? 'has' : 'have'} no dancers: put a colon between a routine’s name and its dancers.`)
  while (breaks.length && breaks[breaks.length - 1] >= routines.length) breaks.pop()
  return { routines, breaks, notes: [...notes, ...nameNotes(routines)] }
}

function addNames(routine: { dancers: string[] }, names: string[]) {
  const seen = new Set(routine.dancers.map(keyOf))
  for (const n of names) {
    const k = keyOf(n)
    if (!k || seen.has(k)) continue
    seen.add(k)
    routine.dancers.push(n)
  }
}

/** Notes about the names themselves: lists that look like "Last, First" split in two. */
function nameNotes(routines: Read['routines']): string[] {
  const all = routines.flatMap((r) => r.dancers)
  const single = all.filter((n) => !/\s/.test(n)).length
  if (all.length >= 6 && single / all.length > 0.6)
    return ['Most names are a single word. If your list is written “Last, First”, the commas have split each name in two: write “First Last”, or open it as a table with a column for each part.']
  return []
}

const plural = (n: number, word: string) => `${n.toLocaleString('en')} ${word}${n === 1 ? '' : 's'}`

/** Whether pasted text is better read as a table than as lines: tabs from a spreadsheet, or a header naming columns. */
export function looksLikeTable(text: string): boolean {
  const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\r|\n/).filter((l) => l.trim() !== '').slice(0, 20)
  if (lines.length < 2) return false
  if (lines.filter((l) => l.includes('\t')).length >= Math.ceil(lines.length * 0.6)) return true
  const head = lines[0].toLowerCase()
  return /(^|[,;])\s*"?(routine|dance|dancers?|students?|names?|performers?|class|first name|last name|surname)"?\s*([,;]|$)/.test(head) && !/:/.test(head)
}

/** Rows and columns from CSV or pasted cells. The separator is the one (comma, semicolon, or tab) the first line uses
 * most outside quotes. Quotes follow RFC 4180; a byte-order mark and blank lines are dropped. */
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
  const pad = (r: string[]) => [...r, ...new Array<string>(width - r.length).fill('')]
  const [header = [], ...rows] = out.map(pad)
  return { header: header.map(tidy), rows, ...(cut ? { cut } : {}) }
}

const ROUTINE_HEAD = /\b(routines?|dances?|numbers?|pieces?|acts?|class(es)?|items?|titles?|performances?|songs?|groups?)\b/i
const NAME_HEAD = /\b(dancers?|students?|performers?|names?|cast|members?|first|last|surname|given|family|child(ren)?|pupils?)\b/i
const MARK = /^(x|✓|✔|☑|✗|•|●|\*|1|y|yes|true|in)$/i
const UNMARK = /^(0|n|no|false|-|–|—|out)?$/i

/** The likeliest shape and columns, from the header's words and the cells; null if nothing fits. */
export function guessShape(table: Table): Shape | null {
  const { header, rows } = table
  const width = header.length
  if (width < 2 || rows.length === 0) return null
  const sample = rows.slice(0, 200)
  const cells = (c: number) => sample.map((r) => tidy(r[c] ?? '')).filter((v) => v !== '')
  // Grid: several columns whose cells are all marks.
  const markColumns = header.map((_, c) => c).filter((c) => {
    const v = cells(c)
    return v.length > 0 && v.every((x) => MARK.test(x) || UNMARK.test(x)) && v.some((x) => MARK.test(x))
  })
  if (markColumns.length >= 2) {
    const names = header.map((_, c) => c).filter((c) => !markColumns.includes(c) && cells(c).length > 0)
    const nameCols = names.filter((c) => NAME_HEAD.test(header[c]))
    return { kind: 'grid', names: (nameCols.length ? nameCols : names).slice(0, 2), routines: markColumns }
  }
  const listy = (c: number) => {
    const v = cells(c)
    return v.length > 0 && v.filter((x) => /[,;\n]/.test(x)).length >= Math.max(1, v.length * 0.3)
  }
  let routine = header.findIndex((h) => ROUTINE_HEAD.test(h) && !NAME_HEAD.test(h))
  const nameCols = header.map((_, c) => c).filter((c) => c !== routine && NAME_HEAD.test(header[c]))
  if (routine < 0) routine = nameCols.includes(0) ? (nameCols.includes(1) ? 2 : 1) : 0
  if (routine >= width) return null
  const others = header.map((_, c) => c).filter((c) => c !== routine && cells(c).length > 0)
  // Routine names repeated down the rows mean a dancer per row, where a comma is "Last, First", not a list.
  const routineCells = cells(routine)
  const repeated = new Set(routineCells.map(keyOf)).size < routineCells.length
  const lastFirst = (c: number) => cells(c).every((x) => (x.match(/,/g) ?? []).length <= 1)
  const listCol = [...nameCols, ...others].find((c) => c !== routine && listy(c) && !(repeated && lastFirst(c)))
  if (listCol !== undefined) return { kind: 'list', routine, dancers: listCol }
  const dancers = (nameCols.length ? nameCols : others.slice(0, 1)).slice(0, 2)
  if (!dancers.length) return null
  return { kind: 'long', routine, dancers }
}

/** A name from one table cell, with "Last, First" turned round to "First Last". */
function cellName(value: string): { name: string; turned: boolean } {
  const m = /^\s*([^,]+?)\s*,\s*([^,]+?)\s*$/.exec(value)
  return m ? { name: tidy(`${m[2]} ${m[1]}`), turned: true } : { name: tidy(value), turned: false }
}

/** Reads routines from a table in the given shape. */
export function readTable(table: Table, shape: Shape): Read {
  const routines: Read['routines'] = []
  const notes: string[] = []
  let turned = 0
  const nameFrom = (value: string) => {
    const c = cellName(value)
    if (c.turned) turned++
    return c.name
  }
  const byKey = new Map<string, number>()
  // An intermission row is a break after the routines read so far.
  const breaks: number[] = []
  let carried = 0
  if (shape.kind === 'grid') {
    for (const c of shape.routines) routines.push({ name: tidy(table.header[c] ?? '') || `Column ${c + 1}`, dancers: [] })
    for (const row of table.rows) {
      const name = shape.names.length === 1 ? nameFrom(row[shape.names[0]] ?? '') : tidy(shape.names.map((c) => row[c] ?? '').join(' '))
      if (!name) continue
      shape.routines.forEach((c, i) => {
        if (MARK.test(tidy(row[c] ?? ''))) addNames(routines[i], [name])
      })
    }
  } else {
    let current = -1
    for (const row of table.rows) {
      const routineName = tidy(row[shape.routine] ?? '')
      const cell = shape.kind === 'list' ? row[shape.dancers] ?? '' : shape.dancers.length === 1 ? nameFrom(row[shape.dancers[0]] ?? '') : tidy(shape.dancers.map((c) => row[c] ?? '').join(' '))
      if (routineName) {
        if (BREAK_LINE.test(routineName)) {
          current = -1
          if (routines.length && !breaks.includes(routines.length)) breaks.push(routines.length)
          continue
        }
        const key = keyOf(routineName)
        if (shape.kind === 'long' && byKey.has(key)) current = byKey.get(key)!
        else {
          routines.push({ name: routineName, dancers: [] })
          current = routines.length - 1
          byKey.set(key, current)
        }
      } else if (current < 0) continue
      else carried++
      addNames(routines[current], shape.kind === 'list' ? splitNames(cell) : cell ? [cell] : [])
    }
  }
  while (breaks.length && breaks[breaks.length - 1] >= routines.length) breaks.pop()
  if (carried) notes.push(`${plural(carried, 'row')} without a routine name ${carried === 1 ? 'was' : 'were'} added to the routine above (as merged cells copy).`)
  if (turned) notes.push(`${plural(turned, 'name')} written “Last, First” ${turned === 1 ? 'was' : 'were'} turned round to “First Last”.`)
  if (table.cut) notes.push(`Only the first ${READ_LIMITS.rows.toLocaleString('en')} rows were read.`)
  return { routines, breaks, notes: [...notes, ...nameNotes(routines)] }
}

/** Pairs of names that may be one dancer written two ways, with why. */
export function likelyDuplicates(names: readonly string[]): { a: number; b: number; why: string }[] {
  const tokens = names.map((n) => keyOf(n).replace(/[()]/g, ' ').split(' ').filter(Boolean))
  const out: { a: number; b: number; why: string }[] = []
  const seen = new Set<string>()
  const add = (a: number, b: number, why: string) => {
    const k = a < b ? `${a},${b}` : `${b},${a}`
    if (a === b || seen.has(k)) return
    seen.add(k)
    out.push({ a: Math.min(a, b), b: Math.max(a, b), why })
  }
  const byLast = new Map<string, number[]>()
  const byFirst = new Map<string, number[]>()
  tokens.forEach((t, i) => {
    if (t.length < 2) return
    byLast.set(t[t.length - 1], [...(byLast.get(t[t.length - 1]) ?? []), i])
    byFirst.set(t[0], [...(byFirst.get(t[0]) ?? []), i])
  })
  const nick = names.map((n) => {
    const m = /^(.*?)\(([^)]+)\)(.*)$/.exec(n)
    return m ? [keyOf(`${m[1]} ${m[3]}`), keyOf(`${m[2]} ${m[3]}`)] : []
  })
  const index = new Map<string, number>()
  tokens.forEach((t, i) => index.set(t.join(' '), i))
  nick.forEach((aliases, i) => aliases.forEach((al) => index.has(al) && add(i, index.get(al)!, 'a nickname in brackets')))
  for (const group of byLast.values()) {
    if (group.length > 40) continue
    for (let x = 0; x < group.length; x++)
      for (let y = x + 1; y < group.length; y++) {
        const a = tokens[group[x]]
        const b = tokens[group[y]]
        if ((a[0].length === 1 && b[0].startsWith(a[0])) || (b[0].length === 1 && a[0].startsWith(b[0]))) add(group[x], group[y], 'an initial for the first name')
        else if (a[0] === b[0] && a.length !== b.length) add(group[x], group[y], 'one has a middle name')
      }
  }
  for (const group of byFirst.values()) {
    if (group.length > 40) continue
    for (let x = 0; x < group.length; x++)
      for (let y = x + 1; y < group.length; y++) {
        const a = tokens[group[x]]
        const b = tokens[group[y]]
        const la = a[a.length - 1]
        const lb = b[b.length - 1]
        if (la !== lb && ((la.length === 1 && lb.startsWith(la)) || (lb.length === 1 && la.startsWith(lb)))) add(group[x], group[y], 'an initial for the surname')
      }
  }
  const swapped = new Map<string, number>()
  tokens.forEach((t, i) => {
    if (t.length !== 2) return
    const k = [...t].sort().join(' ')
    if (swapped.has(k) && tokens[swapped.get(k)!].join(' ') !== t.join(' ')) add(swapped.get(k)!, i, 'the same words in another order')
    else swapped.set(k, i)
  })
  return out
}
