/**
 * Custody Calendar's schedule math. A schedule is a repeating run of nights,
 * one parent per night, starting from the first day of week 1, plus any
 * single nights swapped by hand (holidays, trips). A day belongs to whoever
 * has the child that night, a common way to count custody time.
 */

export type Parent = 0 | 1

export interface Schedule {
  names: [string, string]
  /** One entry per night of the cycle (7, 14, 21, or 28 nights). */
  nights: Parent[]
  /** First day of week 1, as YYYY-MM-DD. */
  anchor: string
  /** Nights swapped from the pattern, by date. */
  overrides: Record<string, Parent>
}

const DAY = 86_400_000
export const dayNumber = (iso: string) => Math.round(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY)
export const isoDate = (day: number) => new Date(day * DAY).toISOString().slice(0, 10)
export const validISO = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && isoDate(dayNumber(s)) === s
/** 0 for Monday through 6 for Sunday. */
export const weekday = (day: number) => (((day + 3) % 7) + 7) % 7

/** The first day of the week containing `iso`, for weeks that start on Sunday or Monday. */
export function startOfWeek(iso: string, sundayFirst: boolean): string {
  const day = dayNumber(iso)
  const back = sundayFirst ? (weekday(day) + 1) % 7 : weekday(day)
  return isoDate(day - back)
}

export interface Preset {
  id: string
  label: string
  hint: string
  /** Nights from a Monday, for parent A (0) and B (1). */
  monday: string
}

// Written Monday to Sunday, A and B, a week per group.
export const PRESETS: Preset[] = [
  { id: 'weeks', label: 'Alternating weeks', hint: 'A week with each parent.', monday: 'AAAAAAA BBBBBBB' },
  { id: '2-2-3', label: '2-2-3', hint: 'Two nights, two nights, then three, swapping each week.', monday: 'AABBAAA BBAABBB' },
  { id: '2-2-5-5', label: '2-2-5-5', hint: 'Each parent keeps the same two weeknights; weekends alternate.', monday: 'AABBAAA AABBBBB' },
  { id: '3-4-4-3', label: '3-4-4-3', hint: 'Three nights and four, then four and three.', monday: 'AAABBBB AAAABBB' },
  { id: 'weekends', label: 'Every other weekend', hint: 'Friday and Saturday nights every other week.', monday: 'AAAABBA AAAAAAA' },
  { id: 'weekends-wed', label: 'Every other weekend and Wednesdays', hint: 'Every other weekend, plus Wednesday night every week.', monday: 'AABABBA AABAAAA' },
]

const parse = (s: string): Parent[] => [...s.replace(/\s/g, '')].map((c) => (c === 'B' ? 1 : 0))

/** A preset's nights for a calendar whose weeks start on Sunday or Monday. */
export function presetNights(id: string, sundayFirst: boolean): Parent[] {
  const nights = parse((PRESETS.find((p) => p.id === id) ?? PRESETS[0]).monday)
  // A Sunday-first week 1 opens with the Sunday before the Monday the preset starts on.
  return sundayFirst ? nights.map((_, i) => nights[(i - 1 + nights.length) % nights.length]) : nights
}

/** Which preset a run of nights is, if any. */
export function matchPreset(nights: readonly Parent[], sundayFirst: boolean): string | null {
  for (const p of PRESETS) {
    const n = presetNights(p.id, sundayFirst)
    if (n.length === nights.length && n.every((v, i) => v === nights[i])) return p.id
  }
  return null
}

export function patternNight(s: Schedule, day: number): Parent {
  const len = s.nights.length
  return s.nights[(((day - dayNumber(s.anchor)) % len) + len) % len]
}

export function nightOf(s: Schedule, day: number): Parent {
  return s.overrides[isoDate(day)] ?? patternNight(s, day)
}

/** Swaps one night, or puts it back to the pattern when swapped twice. */
export function swapNight(s: Schedule, day: number): Schedule {
  const iso = isoDate(day)
  const overrides = { ...s.overrides }
  const next: Parent = nightOf(s, day) === 0 ? 1 : 0
  if (next === patternNight(s, day)) delete overrides[iso]
  else overrides[iso] = next
  return { ...s, overrides }
}

/** Nights with each parent in a calendar year. */
export function totals(s: Schedule, year: number): [number, number] {
  const from = dayNumber(`${year}-01-01`)
  const to = dayNumber(`${year + 1}-01-01`)
  const count: [number, number] = [0, 0]
  for (let d = from; d < to; d++) count[nightOf(s, d)]++
  return count
}

/** Days on which the child moves: the night's parent differs from the night before. */
export function exchanges(s: Schedule, from: number, count: number, limit = 400): { day: number; to: Parent }[] {
  const out: { day: number; to: Parent }[] = []
  for (let d = from; out.length < count && d < from + limit; d++) {
    const to = nightOf(s, d)
    if (to !== nightOf(s, d - 1)) out.push({ day: d, to })
  }
  return out
}

/** Runs of nights with one parent between two days, the end not included. */
export function stays(s: Schedule, from: number, to: number): { parent: Parent; from: number; to: number }[] {
  const out: { parent: Parent; from: number; to: number }[] = []
  for (let d = from; d < to; d++) {
    const p = nightOf(s, d)
    const last = out[out.length - 1]
    if (last && last.parent === p && last.to === d) last.to = d + 1
    else out.push({ parent: p, from: d, to: d + 1 })
  }
  return out
}

const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
const icsDate = (day: number) => isoDate(day).replace(/-/g, '')

/** Widens a range of days to whole stays, so a stay crossing either end isn't cut in two. */
export function wholeStays(s: Schedule, from: number, to: number, limit = 366): [number, number] {
  let start = from
  let end = to
  while (start > from - limit && nightOf(s, start - 1) === nightOf(s, start)) start--
  while (end < to + limit && nightOf(s, end) === nightOf(s, end - 1)) end++
  return [start, end]
}

/**
 * An iCalendar file with one all-day event per stay, which calendar apps can
 * import. Stays at the ends are kept whole, so files for neighboring years
 * share those events, and each event's ID includes the names, so two
 * families' schedules in one calendar don't overwrite each other.
 */
export function toICS(s: Schedule, from: number, to: number, stamp: Date): string {
  const dtstamp = stamp.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const family = hash(s.names.map((n) => n.trim().toLocaleLowerCase()).join('\n'))
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Labs//Custody Calendar//EN', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${icsText(`${s.names[0]} and ${s.names[1]}`)}`]
  for (const stay of stays(s, ...wholeStays(s, from, to))) {
    const nights = stay.to - stay.from
    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsDate(stay.from)}-${stay.parent}-${family}-custody@labs.eugeneyip.net`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${icsDate(stay.from)}`,
      `DTEND;VALUE=DATE:${icsDate(stay.to)}`,
      `SUMMARY:${icsText(`With ${s.names[stay.parent]}`)}`,
      `DESCRIPTION:${icsText(`${nights} ${nights === 1 ? 'night' : 'nights'} with ${s.names[stay.parent]}`)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

function hash(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193)
  return (h >>> 0).toString(36)
}

/** Lines longer than 75 bytes are folded, as the format requires. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const parts: string[] = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length
    if (size + n > (parts.length ? 74 : 75)) {
      parts.push(current)
      current = ''
      size = 0
    }
    current += ch
    size += n
  }
  parts.push(current)
  return parts.join('\r\n ')
}

// The share link: the whole schedule, compact, in the part of the address after #.

export const LIMITS = { name: 40, overrides: 1000 }

export function encode(s: Schedule): string {
  const data = { v: 1, n: s.names, p: s.nights.join(''), a: s.anchor, o: Object.entries(s.overrides).map(([d, p]) => `${d.replace(/-/g, '')}${p}`).join('.') }
  const bytes = new TextEncoder().encode(JSON.stringify(data))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decode(code: string): Schedule | null {
  try {
    if (code.length > 20_000) return null
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
    if (data?.v !== 1 || !Array.isArray(data.n) || data.n.length !== 2 || !data.n.every((x: unknown) => typeof x === 'string')) return null
    if (typeof data.p !== 'string' || !/^[01]+$/.test(data.p) || data.p.length % 7 || data.p.length < 7 || data.p.length > 28) return null
    if (!validISO(data.a)) return null
    const overrides: Record<string, Parent> = {}
    const parts = typeof data.o === 'string' && data.o ? data.o.split('.') : []
    if (parts.length > LIMITS.overrides) return null
    for (const part of parts) {
      const m = /^(\d{4})(\d{2})(\d{2})([01])$/.exec(part)
      if (!m) return null
      const iso = `${m[1]}-${m[2]}-${m[3]}`
      if (!validISO(iso)) return null
      overrides[iso] = Number(m[4]) as Parent
    }
    return { names: [data.n[0].slice(0, LIMITS.name), data.n[1].slice(0, LIMITS.name)], nights: [...data.p].map((c) => Number(c) as Parent), anchor: data.a, overrides }
  } catch {
    return null
  }
}

/** Whether calendars here start weeks on Sunday, from the browser's region. */
export function sundayFirst(locale: string): boolean {
  try {
    const l = new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } }
    const info = l.getWeekInfo?.() ?? l.weekInfo
    if (info) return info.firstDay === 7
    const region = l.maximize().region
    return !!region && ['US', 'CA', 'MX', 'BR', 'JP', 'KR', 'TW', 'HK', 'IL', 'PH', 'ZA', 'IN', 'SA', 'AR', 'CO', 'PE', 'VE'].includes(region)
  } catch {
    return false
  }
}
