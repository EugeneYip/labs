/**
 * The count. One seat is instant runoff: a candidate wins with more than half
 * of the ballots still in play, and otherwise the last-place candidate is
 * eliminated and their ballots move to each voter's next choice. More seats
 * is the single transferable vote: a candidate is elected on reaching the
 * Droop quota, and the votes beyond the quota move on at a reduced value
 * (every ballot they hold passes on the same fraction), so no vote is wasted.
 *
 * Ties for last place are broken by the earlier rounds (whoever had fewer
 * votes most recently goes), and failing that by lot, from a seed made from
 * the ballots so the same ballots always give the same result.
 */

export interface Round {
  /** Votes for each candidate still standing or already elected, at the start of the round. */
  votes: Record<string, number>
  /** Ballots (or parts of ballots) with no choices left, so far. */
  exhausted: number
  /** Votes needed to win in this round. */
  threshold: number
  elected: string[]
  eliminated: string | null
  /** Where votes went at the end of the round. */
  transfer: { from: string; kind: 'surplus' | 'elimination'; to: Record<string, number>; exhausted: number } | null
  tie: { among: string[]; by: 'earlier rounds' | 'lot' } | null
}

export interface Result {
  method: 'irv' | 'stv'
  seats: number
  valid: number
  quota: number | null
  winners: string[]
  rounds: Round[]
}

const EPS = 1e-9
const round5 = (n: number) => Math.floor(n * 1e5 + 1e-7) / 1e5

/** A small seeded random, for breaking ties by lot the same way every time. */
function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

export function count(candidates: readonly string[], ballots: readonly (readonly string[])[], seats: number): Result {
  const method = seats > 1 ? 'stv' : 'irv'
  const known = new Set(candidates)
  const prefs = ballots.map((b) => b.filter((c) => known.has(c))).filter((b) => b.length)
  const valid = prefs.length
  const quota = method === 'stv' ? Math.floor(valid / (seats + 1)) + 1 : null
  const random = seeded(prefs.map((b) => b.join('>')).join('|') + `#${seats}`)

  const status = new Map<string, 'in' | 'elected' | 'out'>(candidates.map((c) => [c, 'in']))
  const piles = new Map<string, { ballot: number; weight: number }[]>(candidates.map((c) => [c, []]))
  const at = prefs.map(() => 0)
  const electedVotes = new Map<string, number>()
  let exhausted = 0
  const rounds: Round[] = []
  const winners: string[] = []

  /** Hands a ballot to its next choice still standing; returns who got it, or null if it has none left. */
  const pass = (ballot: number, weight: number): string | null => {
    const list = prefs[ballot]
    while (at[ballot] < list.length && status.get(list[at[ballot]]) !== 'in') at[ballot]++
    const next = list[at[ballot]]
    if (next === undefined) {
      exhausted += weight
      return null
    }
    piles.get(next)!.push({ ballot, weight })
    return next
  }
  prefs.forEach((_, i) => pass(i, 1))
  // With no ballots there is nothing to count, and no one wins.
  if (!valid) return { method, seats, valid, quota, winners, rounds }

  const total = (c: string) => (status.get(c) === 'elected' ? electedVotes.get(c)! : round5(piles.get(c)!.reduce((n, p) => n + p.weight, 0)))
  const standing = () => candidates.filter((c) => status.get(c) === 'in')

  for (let guard = 0; guard < 500; guard++) {
    const inRace = standing()
    const votes: Record<string, number> = {}
    for (const c of candidates) if (status.get(c) !== 'out') votes[c] = total(c)
    const active = inRace.reduce((n, c) => n + votes[c], 0)
    const threshold = method === 'irv' ? active / 2 : quota!
    const round: Round = { votes, exhausted: round5(exhausted), threshold, elected: [], eliminated: null, transfer: null, tie: null }
    rounds.push(round)
    if (!inRace.length) break

    // Everyone left can fill the remaining seats.
    if (winners.length + inRace.length <= seats) {
      const order = [...inRace].sort((a, b) => votes[b] - votes[a])
      for (const c of order) {
        status.set(c, 'elected')
        electedVotes.set(c, votes[c])
        winners.push(c)
        round.elected.push(c)
      }
      break
    }

    const leader = [...inRace].sort((a, b) => votes[b] - votes[a])[0]
    const wins = method === 'irv' ? votes[leader] > threshold + EPS : votes[leader] >= threshold - EPS
    if (wins) {
      status.set(leader, 'elected')
      winners.push(leader)
      round.elected.push(leader)
      if (method === 'irv' || winners.length === seats) {
        electedVotes.set(leader, votes[leader])
        break
      }
      // Pass on the surplus: every ballot the winner holds moves on at the same reduced value.
      const surplus = votes[leader] - quota!
      electedVotes.set(leader, quota!)
      const factor = votes[leader] > 0 ? surplus / votes[leader] : 0
      const moving = piles.get(leader)!
      piles.set(leader, [])
      round.transfer = record(leader, 'surplus', moving, factor)
      continue
    }

    // Eliminate the last-place candidate.
    const low = Math.min(...inRace.map((c) => votes[c]))
    let tied = inRace.filter((c) => votes[c] <= low + EPS)
    let out = tied[0]
    if (tied.length > 1) {
      const among = [...tied]
      for (let r = rounds.length - 2; r >= 0 && tied.length > 1; r--) {
        const v = rounds[r].votes
        const fewest = Math.min(...tied.map((c) => v[c] ?? 0))
        tied = tied.filter((c) => (v[c] ?? 0) <= fewest + EPS)
      }
      if (tied.length > 1) {
        out = tied[Math.floor(random() * tied.length)]
        round.tie = { among, by: 'lot' }
      } else {
        out = tied[0]
        round.tie = { among, by: 'earlier rounds' }
      }
    }
    status.set(out, 'out')
    round.eliminated = out
    const moving = piles.get(out)!
    piles.set(out, [])
    round.transfer = record(out, 'elimination', moving, 1)
  }

  function record(from: string, kind: 'surplus' | 'elimination', moving: { ballot: number; weight: number }[], factor: number): Round['transfer'] {
    const to: Record<string, number> = {}
    const before = exhausted
    for (const p of moving) {
      const weight = round5(p.weight * factor)
      if (weight <= 0) continue
      at[p.ballot]++
      const next = pass(p.ballot, weight)
      if (next) to[next] = round5((to[next] ?? 0) + weight)
    }
    return { from, kind, to, exhausted: round5(exhausted - before) }
  }

  return { method, seats, valid, quota, winners, rounds }
}

/** Who would win on first choices alone, for comparison: the most first choices (or the top few for several seats). */
export function firstChoiceWinners(candidates: readonly string[], ballots: readonly (readonly string[])[], seats: number): string[] {
  const known = new Set(candidates)
  const tally = new Map(candidates.map((c) => [c, 0]))
  for (const b of ballots) {
    const first = b.find((c) => known.has(c))
    if (first) tally.set(first, tally.get(first)! + 1)
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, seats).map(([c]) => c)
}
