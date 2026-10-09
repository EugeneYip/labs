/**
 * Glance's puzzles. Each day has five rounds, the same for everyone because
 * they're generated from the date. A round is a field of dots shown for a
 * moment; the guess is scored by how close it is in ratio, so 50 for 40
 * scores the same as 40 for 50.
 */

export type Kind = 'scatter' | 'sizes' | 'clusters' | 'dense' | 'squares'

export interface Mark {
  x: number
  y: number
  r: number
  /** Squares are the ones to count in a `squares` round; circles are decoys there. */
  square: boolean
}

export interface Round {
  kind: Kind
  /** How many to count: all marks, or just the squares. */
  answer: number
  marks: Mark[]
  /** How long the field stays up, in milliseconds. */
  showMs: number
}

/** The board is 4:3; coordinates run 0–1 across and 0–0.75 down. */
export const HEIGHT = 0.75

export const PROMPTS: Record<Kind, string> = {
  scatter: 'How many dots?',
  sizes: 'How many dots, big and small?',
  clusters: 'How many dots in all the groups?',
  dense: 'How many dots?',
  squares: 'How many squares? Ignore the circles.',
}

/** Short names for the results list. */
export const NAMES: Record<Kind, string> = {
  scatter: 'A few dots',
  sizes: 'Big and small',
  clusters: 'In groups',
  dense: 'A crowd',
  squares: 'Squares among circles',
}

/** mulberry32: small, fast, and the same everywhere for the same seed. */
export function random(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

const between = (rand: () => number, min: number, max: number) => Math.floor(min + rand() * (max - min + 1))

/**
 * Places `count` marks without overlaps, nudging the size down if the board
 * gets crowded. `place` proposes a position; it's retried until it fits.
 */
function scatter(count: number, radius: (i: number) => number, place: () => [number, number], square: (i: number) => boolean): Mark[] {
  for (let shrink = 1; shrink > 0.3; shrink *= 0.85) {
    const marks: Mark[] = []
    let ok = true
    for (let i = 0; i < count && ok; i++) {
      const r = radius(i) * shrink
      let placed = false
      for (let tries = 0; tries < 400 && !placed; tries++) {
        const [x, y] = place()
        if (x < r || x > 1 - r || y < r || y > HEIGHT - r) continue
        if (marks.every((m) => Math.hypot(m.x - x, m.y - y) > m.r + r + 0.004)) {
          marks.push({ x, y, r, square: square(i) })
          placed = true
        }
      }
      ok = placed
    }
    if (ok) return marks
  }
  throw new Error('Could not place marks')
}

export function makeRound(kind: Kind, rand: () => number): Round {
  const anywhere = (): [number, number] => [rand(), rand() * HEIGHT]
  switch (kind) {
    case 'scatter': {
      const n = between(rand, 8, 14)
      return { kind, answer: n, showMs: 900, marks: scatter(n, () => 0.024, anywhere, () => false) }
    }
    case 'sizes': {
      const n = between(rand, 18, 34)
      const sizes = Array.from({ length: n }, () => 0.012 + rand() * rand() * 0.04)
      return { kind, answer: n, showMs: 1100, marks: scatter(n, (i) => sizes[i], anywhere, () => false) }
    }
    case 'clusters': {
      const n = between(rand, 30, 55)
      const groups = between(rand, 3, 5)
      const centers = Array.from({ length: groups }, () => [0.15 + rand() * 0.7, 0.12 + rand() * (HEIGHT - 0.24)])
      let g = 0
      const near = (): [number, number] => {
        const [cx, cy] = centers[g++ % groups]
        const angle = rand() * Math.PI * 2
        const dist = Math.sqrt(rand()) * 0.12
        return [cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist]
      }
      return { kind, answer: n, showMs: 1300, marks: scatter(n, () => 0.011, near, () => false) }
    }
    case 'dense': {
      const n = between(rand, 70, 140)
      return { kind, answer: n, showMs: 1500, marks: scatter(n, () => 0.008, anywhere, () => false) }
    }
    case 'squares': {
      const squares = between(rand, 12, 26)
      const circles = between(rand, 14, 30)
      const total = squares + circles
      // Mix the two kinds through the field rather than placing all squares first.
      const order = Array.from({ length: total }, (_, i) => i < squares)
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        ;[order[i], order[j]] = [order[j], order[i]]
      }
      return { kind, answer: squares, showMs: 1500, marks: scatter(total, () => 0.016, anywhere, (i) => order[i]) }
    }
  }
}

export const DAILY: Kind[] = ['scatter', 'sizes', 'clusters', 'squares', 'dense']

/** The day's five rounds. `date` is the visitor's local date, like 2026-10-10. */
export function daily(date: string): Round[] {
  const rand = random(hash(`glance:${date}`))
  return DAILY.map((kind) => makeRound(kind, rand))
}

export function practice(rand = Math.random): Round {
  const kinds: Kind[] = ['scatter', 'sizes', 'clusters', 'squares', 'dense']
  return makeRound(kinds[Math.floor(rand() * kinds.length)], rand)
}

/** 100 for the exact number, falling to 0 at half or double. */
export function score(guess: number, answer: number): number {
  if (!(guess > 0) || !(answer > 0)) return 0
  const off = Math.abs(Math.log(guess / answer)) / Math.LN2
  return Math.round(Math.max(0, 1 - off) * 100)
}

export const square = (points: number) => (points >= 80 ? '🟩' : points >= 50 ? '🟨' : '🟥')

/** Day 1 is the launch day. */
export function puzzleNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2026, 9, 9)) / 86_400_000) + 1
}

export function shareText(date: string, points: number[]): string {
  const total = points.reduce((a, b) => a + b, 0)
  return `Glance #${puzzleNumber(date)} · ${total}/${points.length * 100}\n${points.map(square).join('')}\nlabs.eugeneyip.net/glance`
}

/** The visitor's local date, which decides the day's puzzle. */
export function today(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** Days in a row with a finished puzzle, counting back from today (or yesterday, before today's is played). */
export function streak(finished: Set<string>, date: string): number {
  const back = (d: string) => {
    const [y, m, day] = d.split('-').map(Number)
    return today(new Date(y, m - 1, day - 1))
  }
  let d = finished.has(date) ? date : back(date)
  let n = 0
  while (finished.has(d)) {
    n++
    d = back(d)
  }
  return n
}
