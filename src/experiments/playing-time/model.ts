/**
 * Playing Time's planner: splits a game into shifts and picks who plays each
 * one so everyone's minutes come out as even as the format allows, without
 * anyone sitting longer than they must. An optional goalkeeper plays whole
 * periods, and the job rotates.
 */

export interface Format {
  /** Players on the field (or court) at once, including any goalkeeper. */
  onField: number
  periods: number
  periodMinutes: number
  /** Minutes between changes within a period. */
  changeEvery: number
  keeper: boolean
}

export interface Shift {
  period: number
  /** Minutes from the start of the game. */
  start: number
  end: number
}

export interface Plan {
  shifts: Shift[]
  /** Player indexes on the field in each shift, keeper included. */
  lineups: number[][]
  /** The goalkeeper for each period, or null without one. */
  keepers: (number | null)[]
  /** Minutes played by each player. */
  minutes: number[]
}

export const LIMITS = { players: 30, onField: 15, periods: 6, periodMinutes: 90 }

export function shifts(format: Format): Shift[] {
  const list: Shift[] = []
  const every = Math.max(1, format.changeEvery)
  for (let p = 0; p < format.periods; p++) {
    let t = 0
    while (t < format.periodMinutes) {
      let length = Math.min(every, format.periodMinutes - t)
      // Fold a sliver at the end of a period into the shift before it.
      if (format.periodMinutes - (t + length) > 0 && format.periodMinutes - (t + length) < every / 3) length = format.periodMinutes - t
      list.push({ period: p, start: p * format.periodMinutes + t, end: p * format.periodMinutes + t + length })
      t += length
    }
  }
  return list
}

/** mulberry32, so a given shuffle number always gives the same plan. */
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

export function makePlan(players: number, format: Format, rand: () => number = Math.random): Plan {
  const list = shifts(format)
  const minutes = new Array<number>(players).fill(0)
  const benched = new Array<number>(players).fill(0)
  // A fixed random order breaks ties, so equal players don't always favor the top of the roster.
  const tiebreak = Array.from({ length: players }, () => rand())

  // Keepers are chosen up front, rotating, so their future time in goal can be counted from the start.
  const keepers: (number | null)[] = []
  const stints = new Array<number>(players).fill(0)
  for (let p = 0; p < format.periods; p++) {
    if (!format.keeper || players === 0) {
      keepers.push(null)
      continue
    }
    const keeper = [...Array(players).keys()].sort((a, b) => stints[a] - stints[b] || tiebreak[a] - tiebreak[b])[0]
    stints[keeper]++
    keepers.push(keeper)
  }
  const keeperAhead = new Array<number>(players).fill(0)
  keepers.forEach((k) => k !== null && (keeperAhead[k] += format.periodMinutes))

  // Everyone's fair share of the minutes there are to play.
  const share = players ? (Math.min(format.onField, players) * format.periods * format.periodMinutes) / players : 0
  const lineups: number[][] = []
  list.forEach((shift, k) => {
    const length = shift.end - shift.start
    const keeper = keepers[shift.period]
    if (keeper !== null) keeperAhead[keeper] -= length
    const need = Math.min(format.onField, players) - (keeper === null ? 0 : 1)
    const pool = [...Array(players).keys()].filter((i) => i !== keeper)
    // Whoever is furthest behind their share, for the outfield time they have left, goes on first. A player
    // due in goal later has less outfield time left, so they get theirs before their turn in goal.
    const left = (i: number) => list.slice(k).reduce((sum, s) => (keepers[s.period] === i ? sum : sum + s.end - s.start), 0)
    const urgency = (i: number) => (share - minutes[i] - keeperAhead[i]) / Math.max(left(i), 1e-9)
    const score = new Map(pool.map((i) => [i, urgency(i)]))
    pool.sort((a, b) => score.get(b)! - score.get(a)! || benched[b] - benched[a] || tiebreak[a] - tiebreak[b])
    const chosen = new Set(pool.slice(0, Math.max(0, need)))
    if (keeper !== null) chosen.add(keeper)
    for (let i = 0; i < players; i++) {
      if (chosen.has(i)) {
        minutes[i] += length
        benched[i] = 0
      } else benched[i]++
    }
    lineups.push([...chosen].sort((a, b) => a - b))
  })
  return { shifts: list, lineups, keepers, minutes }
}

export interface Change {
  at: number
  off: number[]
  on: number[]
  /** A new goalkeeper at the start of a period. */
  keeper?: number | null
}

/** Who comes off and goes on at each break, for calling out from the sideline. */
export function changes(plan: Plan): Change[] {
  const list: Change[] = []
  for (let s = 1; s < plan.shifts.length; s++) {
    const before = new Set(plan.lineups[s - 1])
    const after = new Set(plan.lineups[s])
    const off = plan.lineups[s - 1].filter((i) => !after.has(i))
    const on = plan.lineups[s].filter((i) => !before.has(i))
    const newPeriod = plan.shifts[s].period !== plan.shifts[s - 1].period
    const keeper = newPeriod ? plan.keepers[plan.shifts[s].period] : undefined
    if (off.length || on.length || (keeper !== undefined && keeper !== plan.keepers[plan.shifts[s - 1].period])) list.push({ at: plan.shifts[s].start, off, on, keeper })
  }
  return list
}

/** "12:00" from minutes; whole minutes only, since changes happen at breaks. */
export const clock = (minutes: number) => `${Math.floor(minutes)}:${String(Math.round((minutes % 1) * 60)).padStart(2, '0')}`

/** Names, one per line or separated by commas, trimmed, without repeats. */
export function parseRoster(text: string): string[] {
  const seen = new Set<string>()
  return text
    .split(/[\n,;]/)
    .map((n) => n.trim().replace(/\s+/g, ' ').slice(0, 40))
    .filter((n) => n && !seen.has(n.toLowerCase()) && seen.add(n.toLowerCase()))
    .slice(0, LIMITS.players)
}
