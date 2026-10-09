/**
 * Reading ballots from what people paste or export: a Google Forms grid
 * (a column per candidate, holding a rank), choice columns (1st choice, 2nd
 * choice… holding names), a Microsoft Forms ranking (names joined by
 * semicolons), or plain lines like "Ava > Ben > Cleo", optionally with a
 * count in front ("12: Ava > Ben").
 *
 * Each ballot is cleaned the usual way: skipped ranks are skipped, a repeated
 * candidate counts only at their highest rank, and two candidates at the same
 * rank (an overvote) end the ballot there.
 */

export interface Parsed {
  format: 'grid' | 'columns' | 'semicolons' | 'lines' | 'empty'
  candidates: string[]
  ballots: string[][]
  /** Rows that had no usable rankings. */
  skipped: number
  /** Ballots cut short by two candidates at the same rank (a ballot with two first choices is skipped instead). */
  overvotes: number
}

/** A small CSV reader: commas or tabs, quoted fields, and quotes doubled inside them. */
export function parseCSV(text: string): string[][] {
  const t = text.replace(/^\uFEFF/, '')
  const sep = (t.split('\n')[0].match(/\t/g)?.length ?? 0) > (t.split('\n')[0].match(/,/g)?.length ?? 0) ? '\t' : ','
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]
    if (quoted) {
      if (ch === '"' && t[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"' && cell === '') quoted = true
    else if (ch === sep) {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && t[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim()))
}

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth']

/** A rank from a cell or a header: "1", "1st", "1st choice", "Rank 2", "Second choice". */
export function rankOf(text: string): number | null {
  const t = text.trim().toLowerCase()
  if (!t) return null
  const n = /(\d+)/.exec(t)
  if (n) {
    const v = Number(n[1])
    return v >= 1 && v <= 100 ? v : null
  }
  const word = ORDINALS.findIndex((w) => new RegExp(`\\b${w}\\b`).test(t))
  return word >= 0 ? word + 1 : null
}

const CHOICE_HEADER = /\b(choice|choices|rank|ranking|preference|pref|pick|place|vote)\b/i

const key = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()

/** Orders a ballot's rank marks into choices, applying the cleaning rules. */
export function clean(marks: { candidate: string; rank: number }[]): { prefs: string[]; overvote: boolean } {
  const byRank = new Map<number, string[]>()
  for (const m of marks) byRank.set(m.rank, [...(byRank.get(m.rank) ?? []), m.candidate])
  const prefs: string[] = []
  for (const rank of [...byRank.keys()].sort((a, b) => a - b)) {
    const names = [...new Set(byRank.get(rank)!)].filter((c) => !prefs.includes(c))
    if (names.length > 1) return { prefs, overvote: true }
    if (names.length === 1) prefs.push(names[0])
  }
  return { prefs, overvote: false }
}

export function parseBallots(text: string, known: readonly string[] = []): Parsed {
  const names = new Map<string, string>(known.map((n) => [key(n), n.trim()]))
  const name = (raw: string) => {
    const k = key(raw)
    if (!k) return null
    if (!names.has(k)) names.set(k, raw.trim().replace(/\s+/g, ' '))
    return names.get(k)!
  }
  const result = (format: Parsed['format'], rows: { prefs: string[]; overvote: boolean }[], skipped: number): Parsed => {
    const ballots = rows.filter((r) => r.prefs.length).map((r) => r.prefs)
    return { format, candidates: [...names.values()], ballots, skipped: skipped + rows.filter((r) => !r.prefs.length).length, overvotes: rows.filter((r) => r.overvote && r.prefs.length).length }
  }

  const trimmed = text.trim()
  if (!trimmed) return { format: 'empty', candidates: [...names.values()], ballots: [], skipped: 0, overvotes: 0 }
  const rows = parseCSV(trimmed)
  const header = rows[0] ?? []

  // Google Forms grid: "Rank the candidates [Ava]", one column per candidate.
  const grid = header.map((h, i) => ({ i, m: /\[([^\]]+)\]\s*$/.exec(h) })).filter((x) => x.m)
  if (grid.length >= 2 && rows.length > 1) {
    const cols = grid.map((g) => ({ i: g.i, candidate: name(g.m![1])! }))
    return result(
      'grid',
      rows.slice(1).map((r) => clean(cols.flatMap((c) => {
        const rank = rankOf(r[c.i] ?? '')
        return rank === null ? [] : [{ candidate: c.candidate, rank }]
      }))),
      0,
    )
  }

  // Choice columns: "1st choice", "Choice 2", "Rank 3", each holding a name.
  const choiceCols = header.map((h, i) => ({ i, rank: CHOICE_HEADER.test(h) ? rankOf(h) : null })).filter((x) => x.rank !== null)
  if (choiceCols.length >= 2 && rows.length > 1) {
    return result(
      'columns',
      rows.slice(1).map((r) => clean(choiceCols.flatMap((c) => {
        const n = name(r[c.i] ?? '')
        return n ? [{ candidate: n, rank: c.rank! }] : []
      }))),
      0,
    )
  }

  // Microsoft Forms ranking: one column of names joined by semicolons.
  const semi = header.findIndex((_, i) => {
    const cells = rows.slice(1).map((r) => r[i] ?? '').filter((c) => c.trim())
    return cells.length > 0 && cells.filter((c) => c.split(';').filter((x) => x.trim()).length >= 2).length >= cells.length * 0.6
  })
  if (semi >= 0 && rows.length > 1) {
    return result(
      'semicolons',
      rows.slice(1).map((r) => clean((r[semi] ?? '').split(';').flatMap((part, k) => {
        const n = name(part)
        return n ? [{ candidate: n, rank: k + 1 }] : []
      }))),
      0,
    )
  }

  // Plain lines: "Ava > Ben > Cleo", "Ava, Ben", or "12: Ava > Ben" for twelve identical ballots.
  const out: { prefs: string[]; overvote: boolean }[] = []
  let skipped = 0
  for (const line of trimmed.split(/\r?\n/)) {
    if (!line.trim()) continue
    const m = /^\s*(\d+)\s*(?:[:x×*]|\s)\s*(.*)$/i.exec(line)
    const times = m && m[2].trim() && !/^\d+$/.test(m[2].trim()) ? Math.min(100_000, Number(m[1])) : 1
    const body = m && times > 1 ? m[2] : line
    const parts = body.split(/\s*(?:>|,|;|\t|\|)\s*/).filter((p) => p.trim())
    const ballot = clean(parts.flatMap((p, k) => {
      const n = name(p)
      return n ? [{ candidate: n, rank: k + 1 }] : []
    }))
    if (!ballot.prefs.length) {
      skipped++
      continue
    }
    for (let k = 0; k < times; k++) out.push(ballot)
  }
  return result('lines', out, skipped)
}
