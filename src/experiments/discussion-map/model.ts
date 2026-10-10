/**
 * Discussion Map's bookkeeping. A discussion is a list of turns: who started
 * speaking and when, in milliseconds from the start. A turn runs until the
 * next one begins; a turn by nobody is a pause. Seats are points in a
 * 1000 × 700 map.
 */

export interface Person {
  id: string
  name: string
  x: number
  y: number
}

export interface Turn {
  /** The speaker, or null for a pause (silence, or the clock stopped). */
  who: string | null
  at: number
}

export const MAP = { w: 1000, h: 700 }

/** Names from a pasted list: one per line or separated by commas, trimmed, without repeats. */
export function parseNames(text: string): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of text.split(/[\n,;\t]+/)) {
    const name = raw.trim().replace(/\s+/g, ' ').slice(0, 40)
    const key = name.toLocaleLowerCase()
    if (!name || seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out.slice(0, 40)
}

/** Seats evenly around an oval table, starting at the top and going clockwise. */
export function circle(n: number): { x: number; y: number }[] {
  const cx = MAP.w / 2
  const cy = MAP.h / 2
  const rx = MAP.w * 0.4
  const ry = MAP.h * 0.38
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i / Math.max(1, n)) * 2 * Math.PI
    return { x: Math.round(cx + rx * Math.cos(a)), y: Math.round(cy + ry * Math.sin(a)) }
  })
}

/**
 * The people after the names are edited. A name still on the list keeps its
 * seat and its turns. A name changed on the same line of the list, like a
 * corrected spelling, is the same person renamed. A whole new list is a new
 * group, seated evenly around the table.
 */
export function reseat(people: readonly Person[], names: readonly string[], newId: () => string): Person[] {
  const key = (name: string) => name.toLocaleLowerCase()
  const byName = new Map(people.map((p) => [key(p.name), p]))
  const staying = new Set(names.map(key).filter((k) => byName.has(k)))
  if (!staying.size) return names.map((name, i) => ({ id: newId(), name, ...circle(names.length)[i] }))
  const seats = circle(names.length)
  return names.map((name, i) => {
    const same = byName.get(key(name))
    if (same) return { ...same, name }
    const before = people[i]
    if (before && !staying.has(key(before.name))) return { ...before, name }
    return { id: newId(), name, ...seats[i] }
  })
}

export interface Stat {
  turns: number
  ms: number
}

/** Turns and talk time for each person, counting the turn under way up to `now`. */
export function stats(turns: readonly Turn[], now: number): Map<string, Stat> {
  const out = new Map<string, Stat>()
  turns.forEach((t, i) => {
    if (t.who === null) return
    const end = i + 1 < turns.length ? turns[i + 1].at : now
    const s = out.get(t.who) ?? { turns: 0, ms: 0 }
    // Tapping the person already speaking doesn't start a new turn.
    const continues = i > 0 && turns[i - 1].who === t.who
    out.set(t.who, { turns: s.turns + (continues ? 0 : 1), ms: s.ms + Math.max(0, end - t.at) })
  })
  return out
}

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/** How often the floor passed between each pair of people, in either direction. Pauses in between don't break the chain. */
export function exchanges(turns: readonly Turn[]): Map<string, { a: string; b: string; count: number }> {
  const out = new Map<string, { a: string; b: string; count: number }>()
  let last: string | null = null
  for (const t of turns) {
    if (t.who === null) continue
    if (last !== null && last !== t.who) {
      const key = pairKey(last, t.who)
      const e = out.get(key) ?? { a: last, b: t.who, count: 0 }
      e.count++
      out.set(key, e)
    }
    last = t.who
  }
  return out
}

/** Adds a turn, unless that person is already speaking. */
export function addTurn(turns: readonly Turn[], who: string | null, at: number): Turn[] {
  const current = turns[turns.length - 1]
  if (current && current.who === who) return [...turns]
  if (!current && who === null) return [...turns]
  return [...turns, { who, at }]
}

/** "4:05" or "1:02:03". */
export function clock(ms: number): string {
  const s = Math.floor(Math.max(0, ms) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

const cell = (value: string | number) => {
  const s = String(value)
  const safe = typeof value === 'string' && /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** Each turn as a row: number, start, speaker, and length in seconds. */
export function turnsCSV(turns: readonly Turn[], people: readonly Person[], now: number): string {
  const names = new Map(people.map((p) => [p.id, p.name]))
  const rows: (string | number)[][] = [['Turn', 'Start', 'Speaker', 'Seconds']]
  let n = 0
  turns.forEach((t, i) => {
    const end = i + 1 < turns.length ? turns[i + 1].at : now
    rows.push([t.who === null ? '' : ++n, clock(t.at), t.who === null ? '(pause)' : (names.get(t.who) ?? 'Someone removed'), Math.round((end - t.at) / 100) / 10])
  })
  return rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'
}
