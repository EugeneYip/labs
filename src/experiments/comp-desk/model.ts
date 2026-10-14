// Comp Desk: scoring a one-day climbing competition from paper scorecards.
//
// Each climber's card holds, for each problem, the attempt they first reached the zone and the attempt they topped
// (a top counts as reaching the zone, on the same attempt unless the zone came earlier). Four formats rank cards:
//   tops and zones: most tops, then most zones, then fewest attempts to the tops, then fewest attempts to the zones;
//   points less attempts: a top scores its points, a zone without a top its own, less a little for each attempt
//     before (World Climbing's 2025 values are 25, 10, and 0.1); never below 0 for a problem;
//   points by attempt: a top scores by the attempt it came on (10, 7, 4, then 2 in the Irish Bouldering League),
//     and the zone without a top scores its own (1), or also with a top if chosen;
//   problem values, best N: each top scores the problem's value (plus a percentage for a flash, if chosen), and the
//     best N tops count (USA Climbing's classic redpoint counts five).
// Scores are whole numbers of tenths or hundredths, so nothing is rounded. Equal results share a place (1, 2, 2, 4).

export interface Result {
  /** The attempt the zone was first reached, or null. */
  zone: number | null
  /** The attempt the problem was topped, 0 when topped but the attempt wasn't recorded, or null. */
  top: number | null
}

export type Rule =
  | { kind: 'topsZones' }
  | { kind: 'pointsLessAttempts'; top: number; zone: number; less: number }
  | { kind: 'pointsByAttempt'; tops: number[]; zone: number; topEarnsZone: boolean }
  | { kind: 'bestN'; count: number; flash: number }

export interface Problem {
  name: string
  /** Points for a top, for "problem values, best N". */
  value: number
}

export interface Climber {
  name: string
  category: number
  bib: string
  /** Their card, a result for each problem, or null when no card has been entered. */
  card: (Result | null)[] | null
}

export interface Comp {
  name: string
  rule: Rule
  problems: Problem[]
  categories: string[]
  climbers: Climber[]
  /** The most attempts a card may show on a problem, or 0 for no limit. */
  maxAttempts: number
}

export const LIMITS = { climbers: 1_000, problems: 100, categories: 30, attempts: 999 }

export const PRESETS: Record<Rule['kind'], Rule> = {
  topsZones: { kind: 'topsZones' },
  pointsLessAttempts: { kind: 'pointsLessAttempts', top: 25, zone: 10, less: 0.1 },
  pointsByAttempt: { kind: 'pointsByAttempt', tops: [10, 7, 4, 2], zone: 1, topEarnsZone: false },
  bestN: { kind: 'bestN', count: 5, flash: 0 },
}

/** Whether the format needs the attempt a top came on. */
export function needsAttempts(rule: Rule): boolean {
  return rule.kind !== 'bestN' || rule.flash > 0
}

/** Whether the format uses zones. */
export function usesZones(rule: Rule): boolean {
  return rule.kind !== 'bestN'
}

// --- Reading and writing a card's cells

/**
 * One cell of a card: "" nothing; "3" topped on the 3rd attempt (the zone with it); "1/3" zone on the 1st, top on
 * the 3rd; "z2" the zone on the 2nd and no top; "t" topped, attempt not recorded. Spaces and case don't matter.
 */
export function parseCell(text: string): { ok: true; result: Result | null } | { ok: false; why: string } {
  const t = text.trim().toLowerCase().replace(/\s+/g, '')
  if (!t || t === '-') return { ok: true, result: null }
  let m: RegExpExecArray | null
  if (t === 't') return { ok: true, result: { zone: null, top: 0 } }
  if ((m = /^(\d{1,3})$/.exec(t))) {
    const n = Number(m[1])
    if (n < 1) return { ok: false, why: 'Attempts start at 1.' }
    return { ok: true, result: { zone: n, top: n } }
  }
  if ((m = /^(\d{1,3})\/(\d{1,3})$/.exec(t)) || (m = /^z(\d{1,3})t(\d{1,3})$/.exec(t))) {
    const z = Number(m[1])
    const top = Number(m[2])
    if (z < 1 || top < 1) return { ok: false, why: 'Attempts start at 1.' }
    if (z > top) return { ok: false, why: `The zone (attempt ${z}) can’t come after the top (attempt ${top}).` }
    return { ok: true, result: { zone: z, top } }
  }
  if ((m = /^z(\d{1,3})$/.exec(t))) {
    const z = Number(m[1])
    if (z < 1) return { ok: false, why: 'Attempts start at 1.' }
    return { ok: true, result: { zone: z, top: null } }
  }
  if ((m = /^t(\d{1,3})$/.exec(t))) {
    const n = Number(m[1])
    if (n < 1) return { ok: false, why: 'Attempts start at 1.' }
    return { ok: true, result: { zone: n, top: n } }
  }
  return { ok: false, why: 'Type the attempt of the top (3), zone/top (1/3), z and the zone’s attempt (z2), or t for a top.' }
}

/** A cell as it's typed back: the shortest form parseCell reads as the same result. */
export function cellText(r: Result | null): string {
  if (!r) return ''
  if (r.top === 0) return 't'
  if (r.top !== null) return r.zone === null || r.zone === r.top ? String(r.top) : `${r.zone}/${r.top}`
  return r.zone !== null ? `z${r.zone}` : ''
}

/** A result in words, for showing what a cell was read as. */
export function resultWords(r: Result | null, rule: Rule): string {
  if (!r) return 'nothing'
  if (r.top === 0) return 'top'
  if (r.top !== null) {
    if (!usesZones(rule)) return r.top === 1 ? 'flash' : `top, attempt ${r.top}`
    const zone = r.zone === null || r.zone === r.top ? '' : `zone ${r.zone}, `
    return r.top === 1 ? 'flash' : `${zone}top ${r.top}`
  }
  return usesZones(rule) && r.zone !== null ? `zone ${r.zone}` : 'nothing'
}

/** Why a card can't be scored by this format, or null if it can. */
export function cardProblem(card: (Result | null)[], rule: Rule, maxAttempts: number): string | null {
  for (let p = 0; p < card.length; p++) {
    const r = card[p]
    if (!r) continue
    if (r.top === 0 && needsAttempts(rule)) return `Problem ${p + 1} is a top without its attempt, which this format needs.`
    const most = Math.max(r.zone ?? 0, r.top ?? 0)
    if (maxAttempts > 0 && most > maxAttempts) return `Problem ${p + 1} shows attempt ${most}, more than the ${maxAttempts} allowed.`
    if (r.zone !== null && r.top !== null && r.top > 0 && r.zone > r.top) return `Problem ${p + 1} has its zone after its top.`
  }
  return null
}

// --- Scores

export interface Score {
  /** For sorting: compared element by element, higher is better. */
  key: number[]
  /** In words, as the format writes it. */
  text: string
}

/** The zone's attempt, counting a top as the zone. */
const zoneOf = (r: Result) => (r.zone !== null ? r.zone : r.top !== null && r.top > 0 ? r.top : null)

/** Whole tenths of a number given in points (25 → 250, 0.1 → 1); the page only takes points in tenths. */
const tenths = (x: number) => Math.round(x * 10)

/** Whether points are whole tenths (25, 9.8, 0.1), so they're counted without rounding. */
export const inTenths = (x: number) => Number.isFinite(x) && x >= 0 && Math.abs(x * 10 - Math.round(x * 10)) < 1e-9

export function scoreCard(card: (Result | null)[], rule: Rule, problems: Problem[]): Score {
  switch (rule.kind) {
    case 'topsZones': {
      let tops = 0
      let zones = 0
      let topAttempts = 0
      let zoneAttempts = 0
      for (const r of card) {
        if (!r) continue
        if (r.top !== null && r.top > 0) {
          tops++
          topAttempts += r.top
        }
        const z = zoneOf(r)
        if (z !== null) {
          zones++
          zoneAttempts += z
        }
      }
      return { key: [tops, zones, -topAttempts, -zoneAttempts], text: `${tops}T ${zones}z ${topAttempts} ${zoneAttempts}` }
    }
    case 'pointsLessAttempts': {
      const top = tenths(rule.top)
      const zone = tenths(rule.zone)
      const less = tenths(rule.less)
      let total = 0
      for (const r of card) {
        if (!r) continue
        if (r.top !== null && r.top > 0) total += Math.max(0, top - less * (r.top - 1))
        else {
          const z = zoneOf(r)
          if (z !== null) total += Math.max(0, zone - less * (z - 1))
        }
      }
      return { key: [total], text: points(total, 10) }
    }
    case 'pointsByAttempt': {
      const tops = rule.tops.map(tenths)
      const zone = tenths(rule.zone)
      let total = 0
      for (const r of card) {
        if (!r) continue
        const topped = r.top !== null && r.top > 0
        if (topped) total += tops[Math.min(r.top! - 1, tops.length - 1)] ?? 0
        if (zoneOf(r) !== null && (!topped || rule.topEarnsZone)) total += zone
      }
      return { key: [total], text: points(total, 10) }
    }
    case 'bestN': {
      // In hundredths: a value of 300 with a 10% flash bonus is 300 × 110 = 33,000 hundredths (330 points).
      const scores: number[] = []
      card.forEach((r, p) => {
        if (!r || r.top === null) return
        const value = Math.round((problems[p]?.value ?? 0) * 100)
        scores.push(r.top === 1 && rule.flash > 0 ? Math.round((value * (100 + rule.flash)) / 100) : value)
      })
      scores.sort((a, b) => b - a)
      const counted = rule.count > 0 ? scores.slice(0, rule.count) : scores
      const total = counted.reduce((a, b) => a + b, 0)
      return { key: [total], text: `${points(total, 100)}${rule.count > 0 && scores.length > rule.count ? ` (best ${rule.count} of ${scores.length})` : ''}` }
    }
  }
}

function points(units: number, per: number): string {
  const whole = Math.floor(units / per)
  const rest = units - whole * per
  if (!rest) return whole.toLocaleString('en')
  const digits = per === 10 ? 1 : 2
  return `${whole.toLocaleString('en')}.${String(rest).padStart(digits, '0').replace(/0+$/, '')}`
}

/** Below 0 when a ranks above b, above 0 when b ranks above a, 0 when tied. */
export function compareKeys(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (b[i] ?? 0) - (a[i] ?? 0)
    if (d) return d
  }
  return 0
}

export interface Standing {
  climber: number
  place: number
  tied: boolean
  score: Score
}

export interface Standings {
  /** Ranked climbers in this category, best first; equal results share a place. */
  ranked: Standing[]
  /** Climbers with no card yet. */
  waiting: number[]
  /** Climbers whose card this format can't score, with why. */
  unscored: { climber: number; why: string }[]
}

/** A category's standings: standard competition ranking (1, 2, 2, 4), by the format's rule. */
export function standings(comp: Comp, category: number): Standings {
  const ranked: Standing[] = []
  const waiting: number[] = []
  const unscored: { climber: number; why: string }[] = []
  comp.climbers.forEach((c, i) => {
    if (c.category !== category) return
    if (!c.card) return void waiting.push(i)
    const why = cardProblem(c.card, comp.rule, comp.maxAttempts)
    if (why) return void unscored.push({ climber: i, why })
    ranked.push({ climber: i, place: 0, tied: false, score: scoreCard(c.card, comp.rule, comp.problems) })
  })
  ranked.sort((a, b) => compareKeys(a.score.key, b.score.key) || comp.climbers[a.climber].name.localeCompare(comp.climbers[b.climber].name, 'en', { sensitivity: 'base' }) || a.climber - b.climber)
  ranked.forEach((s, i) => {
    s.place = i > 0 && compareKeys(ranked[i - 1].score.key, s.score.key) === 0 ? ranked[i - 1].place : i + 1
  })
  ranked.forEach((s, i) => {
    s.tied = (i > 0 && ranked[i - 1].place === s.place) || (i + 1 < ranked.length && ranked[i + 1].place === s.place)
  })
  return { ranked, waiting, unscored }
}

/** The rule in a sentence, as the page states it. */
export function ruleText(rule: Rule): string {
  switch (rule.kind) {
    case 'topsZones':
      return 'Most tops, then most zones, then fewest attempts to the tops, then fewest attempts to the zones. Results equal on all four share a place.'
    case 'pointsLessAttempts':
      return `A top scores ${pointsOf(rule.top)} and a zone without a top ${pointsOf(rule.zone)}, less ${pointsOf(rule.less)} for each attempt before it (never below 0). Equal totals share a place.`
    case 'pointsByAttempt': {
      const tops = rule.tops.map(pointsOf)
      const list = tops.length === 1 ? `${tops[0]} on any attempt` : tops.length === 2 ? `${tops[0]} on the first attempt, then ${tops[1]} on any later attempt` : `${tops.slice(0, -1).join(', ')} on attempts 1–${tops.length - 1}, then ${tops.at(-1)} on any later attempt`
      return `A top scores ${list}; the zone scores ${pointsOf(rule.zone)}${rule.topEarnsZone ? ', with a top or without' : ' when there’s no top'}. Equal totals share a place.`
    }
    case 'bestN':
      return `Each top scores the problem’s value${rule.flash > 0 ? `, plus ${rule.flash}% for a flash (topped on the first attempt)` : ''}; ${rule.count > 0 ? `the best ${rule.count} count` : 'every top counts'}. Equal totals share a place.`
  }
}

const pointsOf = (x: number) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100))

// --- Climber lists

/**
 * Climbers from pasted lines or a CSV: a name, then optionally a category and a bib number, separated by commas or
 * tabs; a header row naming "name" is skipped and its columns followed. Categories are matched to the comp's
 * (ignoring case) or added.
 */
export function readClimbers(text: string, categories: string[]): { climbers: { name: string; category: string; bib: string }[]; notes: string[] } {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim())
  const sep = lines.some((l) => l.includes('\t')) ? '\t' : ','
  const cells = lines.map((l) => splitLine(l, sep))
  let nameAt = 0
  let categoryAt = 1
  let bibAt = 2
  const header = cells[0]?.map((c) => c.trim().toLowerCase())
  if (header && header.some((h) => /^(name|climber|competitor|full name)$/.test(h))) {
    nameAt = header.findIndex((h) => /^(name|climber|competitor|full name)$/.test(h))
    categoryAt = header.findIndex((h) => /^(category|cat|class|division|group|age group)$/.test(h))
    bibAt = header.findIndex((h) => /^(bib|number|no\.?|#|id|bib number)$/.test(h))
    cells.shift()
  }
  const notes: string[] = []
  const climbers = cells
    .map((row) => ({ name: tidy(row[nameAt] ?? ''), category: tidy(categoryAt >= 0 ? (row[categoryAt] ?? '') : ''), bib: tidy(bibAt >= 0 ? (row[bibAt] ?? '') : '') }))
    .filter((c) => c.name)
  const bibs = new Map<string, number>()
  for (const c of climbers) if (c.bib) bibs.set(c.bib.toLowerCase(), (bibs.get(c.bib.toLowerCase()) ?? 0) + 1)
  const repeated = [...bibs.entries()].filter(([, n]) => n > 1).map(([b]) => b)
  if (repeated.length) notes.push(`Bib ${repeated.slice(0, 3).join(', ')}${repeated.length > 3 ? ' and others' : ''} ${repeated.length === 1 ? 'is' : 'are'} on more than one climber.`)
  const known = new Set(categories.map((c) => c.toLowerCase()))
  const added = [...new Set(climbers.map((c) => c.category).filter((c) => c && !known.has(c.toLowerCase())))]
  if (added.length) notes.push(`New ${added.length === 1 ? 'category' : 'categories'}: ${added.slice(0, 6).join(', ')}${added.length > 6 ? ' and more' : ''}.`)
  return { climbers, notes }
}

function splitLine(line: string, sep: string): string[] {
  const out: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"' && field === '') quoted = true
    else if (ch === sep) {
      out.push(field)
      field = ''
    } else field += ch
  }
  out.push(field)
  return out
}

const tidy = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim()

// --- Files

/** A cell safe to open in a spreadsheet: quoted when needed, and never read as a formula (a plain number stays). */
export function csvCell(value: string): string {
  const v = /^[=+\-@\t\r]/.test(value) && !/^[+-]?\d+(\.\d+)?%?$/.test(value) ? `'${value}` : value
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

/** Every category's standings as CSV: category, place, whether it's shared, name, bib, score, and each problem's cell. */
export function resultsCsv(comp: Comp): string {
  const header = ['Category', 'Place', 'Tied', 'Name', 'Bib', 'Score', ...comp.problems.map((p, i) => p.name || `Problem ${i + 1}`)]
  const rows: string[][] = [header]
  comp.categories.forEach((cat, k) => {
    const s = standings(comp, k)
    for (const st of s.ranked) {
      const c = comp.climbers[st.climber]
      rows.push([cat, String(st.place), st.tied ? 'yes' : '', c.name, c.bib, st.score.text, ...comp.problems.map((_, p) => cellText(c.card?.[p] ?? null))])
    }
    for (const u of s.unscored) {
      const c = comp.climbers[u.climber]
      rows.push([cat, '', '', c.name, c.bib, `Not scored: ${u.why}`, ...comp.problems.map((_, p) => cellText(c.card?.[p] ?? null))])
    }
    for (const w of s.waiting) {
      const c = comp.climbers[w]
      rows.push([cat, '', '', c.name, c.bib, 'No card yet', ...comp.problems.map(() => '')])
    }
  })
  return `\uFEFF${rows.map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`
}

/** A comp from a backup file (or saved data), checked field by field; null if anything is wrong. */
export function readComp(raw: unknown): Comp | null {
  try {
    const v = raw as Record<string, unknown>
    if (!v || typeof v !== 'object') return null
    const rule = readRule(v.rule)
    if (!rule) return null
    const problems = v.problems
    if (!Array.isArray(problems) || problems.length < 1 || problems.length > LIMITS.problems) return null
    const ps: Problem[] = []
    for (const p of problems) {
      if (!p || typeof p.name !== 'string' || p.name.length > 80 || !Number.isInteger(p.value) || p.value < 0 || p.value > 1_000_000) return null
      ps.push({ name: p.name, value: p.value })
    }
    const categories = v.categories
    if (!Array.isArray(categories) || categories.length < 1 || categories.length > LIMITS.categories || !categories.every((c) => typeof c === 'string' && c.length <= 80)) return null
    const climbers = v.climbers
    if (!Array.isArray(climbers) || climbers.length > LIMITS.climbers) return null
    const cs: Climber[] = []
    for (const c of climbers) {
      if (!c || typeof c.name !== 'string' || c.name.length > 200 || typeof c.bib !== 'string' || c.bib.length > 40) return null
      if (!Number.isInteger(c.category) || c.category < 0 || c.category >= categories.length) return null
      let card: (Result | null)[] | null = null
      if (c.card !== null) {
        if (!Array.isArray(c.card) || c.card.length !== ps.length) return null
        card = []
        for (const r of c.card) {
          if (r === null) card.push(null)
          else if (r && isAttempt(r.zone, false) && isAttempt(r.top, true) && (r.zone !== null || r.top !== null)) card.push({ zone: r.zone, top: r.top })
          else return null
        }
      }
      cs.push({ name: c.name, bib: c.bib, category: c.category, card })
    }
    const maxAttempts = v.maxAttempts
    if (!Number.isInteger(maxAttempts) || (maxAttempts as number) < 0 || (maxAttempts as number) > LIMITS.attempts) return null
    const name = typeof v.name === 'string' ? v.name.slice(0, 120) : ''
    return { name, rule, problems: ps, categories: [...categories], climbers: cs, maxAttempts: maxAttempts as number }
  } catch {
    return null
  }
}

function isAttempt(x: unknown, allowZero: boolean): x is number | null {
  return x === null || (Number.isInteger(x) && (x as number) >= (allowZero ? 0 : 1) && (x as number) <= LIMITS.attempts)
}

function readRule(r: unknown): Rule | null {
  const v = r as Record<string, unknown>
  if (!v || typeof v !== 'object') return null
  const num = (x: unknown, max: number) => typeof x === 'number' && inTenths(x) && x <= max
  switch (v.kind) {
    case 'topsZones':
      return { kind: 'topsZones' }
    case 'pointsLessAttempts':
      return num(v.top, 10_000) && num(v.zone, 10_000) && num(v.less, 1_000) ? { kind: 'pointsLessAttempts', top: v.top as number, zone: v.zone as number, less: v.less as number } : null
    case 'pointsByAttempt':
      return Array.isArray(v.tops) && v.tops.length >= 1 && v.tops.length <= 20 && v.tops.every((t) => num(t, 10_000)) && num(v.zone, 10_000) && typeof v.topEarnsZone === 'boolean'
        ? { kind: 'pointsByAttempt', tops: [...(v.tops as number[])], zone: v.zone as number, topEarnsZone: v.topEarnsZone }
        : null
    case 'bestN':
      return Number.isInteger(v.count) && (v.count as number) >= 0 && (v.count as number) <= LIMITS.problems && Number.isInteger(v.flash) && (v.flash as number) >= 0 && (v.flash as number) <= 100
        ? { kind: 'bestN', count: v.count as number, flash: v.flash as number }
        : null
    default:
      return null
  }
}

/**
 * The comp as saved (in the browser and in backup files): JSON with each card written compactly as its cells joined
 * by commas ("1/3,z2,,3"), so a large comp stays small. `unpackComp` reads it back through the same checks.
 */
export function packComp(comp: Comp): string {
  return JSON.stringify({ ...comp, climbers: comp.climbers.map((c) => ({ ...c, card: c.card ? c.card.map(cellText).join(',') : null })) })
}

export function unpackComp(text: string): Comp | null {
  try {
    const v = JSON.parse(text)
    if (!v || typeof v !== 'object' || !Array.isArray(v.climbers) || !Array.isArray(v.problems)) return null
    const climbers = []
    for (const c of v.climbers) {
      if (!c || typeof c !== 'object') return null
      if (c.card === null) {
        climbers.push({ ...c, card: null })
        continue
      }
      if (typeof c.card !== 'string' || c.card.length > 10_000) return null
      const cells = c.card.split(',')
      if (cells.length !== v.problems.length) return null
      const card: (Result | null)[] = []
      for (const t of cells) {
        const r = parseCell(t)
        if (!r.ok) return null
        card.push(r.result)
      }
      climbers.push({ ...c, card })
    }
    return readComp({ ...v, climbers })
  } catch {
    return null
  }
}
