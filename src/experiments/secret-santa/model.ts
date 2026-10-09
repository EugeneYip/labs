/**
 * Secret Santa's draw and links. The draw gives everyone someone else to buy
 * for while honoring "can't draw" rules. Each person's link carries only their
 * own match, scrambled so it can't be read from the link text by accident.
 * The scrambling is a courtesy against peeking, not encryption.
 */

export interface Exchange {
  name: string
  budget: string
  date: string
  note: string
  people: string[]
  rules: Rule[]
}

/** `giver` can't draw `receiver`, as indexes into `people`. */
export interface Rule {
  giver: number
  receiver: number
}

export interface Match {
  exchange: string
  giver: string
  receiver: string
  budget: string
  date: string
  note: string
}

export const LIMITS = { people: 100, name: 40, text: 200 }

export const EMPTY_EXCHANGE: Exchange = { name: '', budget: '', date: '', note: '', people: [], rules: [] }

/**
 * Who each person buys for: `result[giver] = receiver`. Picks evenly among all
 * valid draws by shuffling until one fits; if the rules make that slow, a
 * search finds one. Null when the rules leave no valid draw.
 */
export function draw(count: number, rules: Rule[], random = Math.random): number[] | null {
  if (count < 2) return null
  const blocked = new Set(rules.map((r) => r.giver * LIMITS.people + r.receiver))
  const allowed = (giver: number, receiver: number) => giver !== receiver && !blocked.has(giver * LIMITS.people + receiver)
  const everyone = Array.from({ length: count }, (_, i) => i)

  for (let attempt = 0; attempt < 3000; attempt++) {
    const order = shuffle(everyone, random)
    if (order.every((receiver, giver) => allowed(giver, receiver))) return order
  }

  // Randomized backtracking, with a step budget so impossible rules give up quickly.
  const taken = new Array<boolean>(count).fill(false)
  const result = new Array<number>(count).fill(-1)
  const givers = shuffle(everyone, random)
  let steps = 0
  const place = (k: number): boolean => {
    if (k === count) return true
    if (++steps > 200_000) return false
    const giver = givers[k]
    for (const receiver of shuffle(everyone, random)) {
      if (taken[receiver] || !allowed(giver, receiver)) continue
      taken[receiver] = true
      result[giver] = receiver
      if (place(k + 1)) return true
      taken[receiver] = false
    }
    return false
  }
  return place(0) ? result : null
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Names typed one per line or separated by commas: trimmed, shortened, and without repeats. */
export function parseNames(text: string): string[] {
  const seen = new Set<string>()
  return text
    .split(/[,\n;]/)
    .map((name) => name.trim().replace(/\s+/g, ' ').slice(0, LIMITS.name))
    .filter((name) => name && !seen.has(name.toLowerCase()) && seen.add(name.toLowerCase()))
}

// Links

export function encodeMatch(match: Match): string {
  const json = JSON.stringify([1, match.exchange, match.giver, match.receiver, match.budget, match.date, match.note])
  const salt = crypto.getRandomValues(new Uint8Array(6))
  const body = scramble(new TextEncoder().encode(json), salt)
  return toBase64Url(new Uint8Array([...salt, ...body]))
}

/** Reads a person's link. Null for anything incomplete, edited, or not made here. */
export function decodeMatch(token: string): Match | null {
  try {
    // Long enough for every field at its limit, even in scripts that take three bytes a character.
    if (!/^[A-Za-z0-9_-]{12,8000}$/.test(token)) return null
    const bytes = fromBase64Url(token)
    const json = new TextDecoder('utf-8', { fatal: true }).decode(scramble(bytes.subarray(6), bytes.subarray(0, 6)))
    const data: unknown = JSON.parse(json)
    if (!Array.isArray(data) || data.length !== 7 || data[0] !== 1) return null
    const [, exchange, giver, receiver, budget, date, note] = data
    const text = (value: unknown, max: number) => typeof value === 'string' && value.length <= max
    if (![exchange, budget, date, note].every((v) => text(v, LIMITS.text))) return null
    if (!text(giver, LIMITS.name) || !text(receiver, LIMITS.name) || !giver || !receiver || giver === receiver) return null
    return { exchange, giver, receiver, budget, date, note }
  } catch {
    return null
  }
}

/** XOR with a keystream seeded by the salt (mulberry32). The same call scrambles and unscrambles. */
function scramble(data: Uint8Array, salt: Uint8Array): Uint8Array {
  let seed = salt.reduce((h, b) => Math.imul(h ^ b, 2654435761) >>> 0, 0x9e3779b9)
  const next = () => {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) & 0xff
  }
  return data.map((byte) => byte ^ next())
}

function toBase64Url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array {
  return Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
}
