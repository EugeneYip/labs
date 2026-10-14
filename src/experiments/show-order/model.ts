// Show Order: a show's numbers in an order where nobody is in back-to-back routines and quick changes are fewest.
//
// A change is a dancer going from one of their routines to their next one in the same part of the show; a change
// across an intermission is never quick. It's quick when fewer than `need` routines come between. Orders are compared
// by this rule, each step only when the ones before it are equal:
//   1. the fewest back-to-back changes (no routine between);
//   2. then the fewest with one routine between, then two, and so on up to need - 1;
//   3. then the closest to the planner's own order: the smallest total distance the routines moved.
// The search is simulated annealing over swaps and moves of the routines that aren't pinned, each staying in the part
// of the show it's kept in. It starts from the planner's order and keeps the best order it sees, so it never returns
// a worse one. Its random choices come from a number, so the same number gives the same order again.

export interface Show {
  /** Routine names, by routine index. */
  names: string[]
  /** For each routine, its dancers' indexes, each once. */
  dancers: number[][]
  /** Dancer names, by dancer index. */
  people: string[]
}

export interface Rules {
  /** Fewer routines than this between a dancer's two numbers makes the change quick (1 means only back to back). */
  need: number
  /** Intermissions: after how many numbers each comes, ascending, each between 1 and the number of routines - 1. */
  breaks: number[]
}

export interface Keep {
  /** Routines that stay at their position. */
  pinned: boolean[]
  /** For each routine, the part of the show it's kept in (0 before the first intermission), or -1 for any. */
  part: number[]
}

/** A dancer's quick change, by positions in the order (0 for the first number). */
export interface Change {
  dancer: number
  from: number
  to: number
  /** Routines between the two. */
  between: number
}

export const NEED = { min: 1, max: 5, standard: 3 }
export const LIMITS = { routines: 400, people: 5_000, appearances: 20_000 }

/** The part of the show (0 before the first intermission) each position is in. */
export function partsOf(n: number, breaks: number[]): Int32Array {
  const part = new Int32Array(n)
  let k = 0
  for (let p = 0; p < n; p++) {
    while (k < breaks.length && breaks[k] <= p) k++
    part[p] = k
  }
  return part
}

/** How many numbers each part of the show has. */
export function partLengths(n: number, breaks: number[]): number[] {
  const edges = [0, ...breaks.filter((b) => b > 0 && b < n), n]
  return edges.slice(1).map((e, i) => e - edges[i])
}

/** Changes counted by how many routines come between (index 0: back to back), for 0 to need - 1, and every quick one. */
export function tally(show: Show, order: readonly number[], rules: Rules): { levels: number[]; quick: Change[] } {
  const part = partsOf(order.length, rules.breaks)
  const last = new Int32Array(show.people.length).fill(-1)
  const levels = new Array<number>(rules.need).fill(0)
  const quick: Change[] = []
  for (let p = 0; p < order.length; p++)
    for (const d of show.dancers[order[p]]) {
      const q = last[d]
      if (q >= 0 && part[q] === part[p] && p - q - 1 < rules.need) {
        levels[p - q - 1]++
        quick.push({ dancer: d, from: q, to: p, between: p - q - 1 })
      }
      last[d] = p
    }
  return { levels, quick }
}

/** Below 0 when `a` is the better order by the rule's first two steps, above 0 when `b` is, 0 when they're level. */
export function compareLevels(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

/** The total distance routines moved from a reference order (0 when it's the same order). */
export function distance(order: readonly number[], reference: readonly number[]): number {
  const at = new Int32Array(reference.length)
  reference.forEach((r, p) => (at[r] = p))
  let sum = 0
  order.forEach((r, p) => (sum += Math.abs(p - at[r])))
  return sum
}

/** Routines that changed place from the reference: those outside a longest run kept in the reference's order. */
export function movedFrom(order: readonly number[], reference: readonly number[]): Set<number> {
  const at = new Int32Array(reference.length)
  reference.forEach((r, p) => (at[r] = p))
  // Longest increasing subsequence of reference positions, with the routines on it.
  const tails: number[] = []
  const tailAt: number[] = []
  const before = new Int32Array(order.length).fill(-1)
  order.forEach((r, i) => {
    const v = at[r]
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < v) lo = mid + 1
      else hi = mid
    }
    tails[lo] = v
    tailAt[lo] = i
    before[i] = lo > 0 ? tailAt[lo - 1] : -1
  })
  const kept = new Set<number>()
  for (let i = tails.length ? tailAt[tails.length - 1] : -1; i >= 0; i = before[i]) kept.add(order[i])
  return new Set(order.filter((r) => !kept.has(r)))
}

/** The order with the routine at `from` moved to `to`, the routines between shifting round any that are pinned. */
export function moveAround(order: readonly number[], pinned: readonly boolean[], from: number, to: number): number[] {
  const r = order[from]
  const free = order.map((_, p) => p).filter((p) => p === from || !pinned[order[p]])
  const routines = free.map((p) => order[p])
  const i = free.indexOf(from)
  // The free place at `to`, or past it if a pinned routine is there: the next free place in the direction of the move.
  let j = to > from ? free.findIndex((p) => p >= to) : free.length - 1 - [...free].reverse().findIndex((p) => p <= to)
  if (to > from && j < 0) j = free.length - 1
  if (to < from && j > free.length - 1) j = 0
  routines.splice(i, 1)
  routines.splice(j, 0, r)
  const out = [...order]
  free.forEach((p, k) => (out[p] = routines[k]))
  return out
}

/**
 * The fewest quick changes a dancer in `count` routines could have, whatever the order, in parts of these lengths:
 * with a routines in a part of L numbers, at most (L - a) / need of the a - 1 gaps can be wide enough. Other dancers
 * and pins are ignored, so it's a floor, never more than the true fewest.
 */
export function fewestFor(count: number, lengths: readonly number[], need: number): number {
  const inPart = (a: number, L: number) => (a <= 1 ? 0 : Math.max(0, a - 1 - Math.floor((L - a) / need)))
  let best = [0, ...new Array<number>(count).fill(Infinity)]
  for (const L of lengths) {
    const next = new Array<number>(count + 1).fill(Infinity)
    for (let used = 0; used <= count; used++) {
      if (best[used] === Infinity) continue
      for (let a = 0; used + a <= count && a <= L; a++) next[used + a] = Math.min(next[used + a], best[used] + inPart(a, L))
    }
    best = next
  }
  return best[count]
}

/** The floor for every dancer, and their total: no order can have fewer quick changes than the total. */
export function floor(show: Show, rules: Rules): { total: number; byDancer: number[] } {
  const lengths = partLengths(show.names.length, rules.breaks)
  const counts = new Array<number>(show.people.length).fill(0)
  for (const ds of show.dancers) for (const d of ds) counts[d]++
  const memo = new Map<number, number>()
  const byDancer = counts.map((c) => {
    if (!memo.has(c)) memo.set(c, fewestFor(c, lengths, rules.need))
    return memo.get(c)!
  })
  return { total: byDancer.reduce((a, b) => a + b, 0), byDancer }
}

/**
 * Puts routines kept in a part into that part, if they aren't there, keeping pinned routines where they are and
 * everything else in its order. Null when a part has fewer free places than routines kept in it.
 */
export function settle(order: readonly number[], rules: Rules, keep: Keep): number[] | null {
  const n = order.length
  const part = partsOf(n, rules.breaks)
  const parts = rules.breaks.length + 1
  const fine = order.every((r, p) => keep.pinned[r] || keep.part[r] < 0 || keep.part[r] === part[p])
  if (fine) return [...order]
  const free: number[][] = Array.from({ length: parts }, () => [])
  order.forEach((r, p) => !keep.pinned[r] && free[part[p]].push(p))
  const kept: number[][] = Array.from({ length: parts }, () => [])
  const loose: number[] = []
  for (const r of order) {
    if (keep.pinned[r]) continue
    const k = keep.part[r]
    if (k >= 0 && k < parts) kept[k].push(r)
    else loose.push(r)
  }
  const out = [...order]
  let next = 0
  for (let k = 0; k < parts; k++) {
    if (kept[k].length > free[k].length) return null
    // Kept routines first, in their order, then loose ones in theirs: loose ones fill the rest, part by part.
    const fill = [...kept[k]]
    while (fill.length < free[k].length) fill.push(loose[next++])
    free[k].forEach((p, i) => (out[p] = fill[i]))
  }
  return out
}

export interface Progress {
  /** Called now and then with the share of the search done (0 to 1). */
  onProgress?: (done: number) => void
  signal?: AbortSignal
}

export interface Suggestion {
  order: number[]
  levels: number[]
  /** Total distance the routines moved from the start. */
  distance: number
  /** True when every allowed order was compared, so no order is better by the rule. */
  exact: boolean
  /** True if Stop ended the search early (the order is still the best found so far). */
  stopped: boolean
}

/** Up to this many routines free to move, every allowed order is compared (8! = 40,320 orders). */
export const EXACT_UP_TO = 8

/** Steps of the search for a show of n routines (fixed, not timed, so the same number replays the same search). */
export function stepsFor(n: number, appearances: number): number {
  const base = Math.min(3_000_000, Math.max(150_000, 6_000 * n))
  // Dancers in many routines make each step dearer; keep the work for the largest shows to a few seconds.
  return Math.round(base * Math.min(1, 40_000 / Math.max(1, appearances * 20)))
}

/**
 * Suggests an order by the rule above, starting from `start` (already settled: pinned routines in place, kept ones in
 * their parts). Gives the page a chance to respond every few thousand steps. Stop keeps the best found so far.
 */
export async function suggest(show: Show, start: readonly number[], rules: Rules, keep: Keep, seed: number, progress: Progress = {}): Promise<Suggestion> {
  const search = new Search(show, start, rules, keep, seed)
  let stopped = false
  while (!search.done()) {
    // Slices of about 12 ms, whatever a step costs, so the page keeps answering. The steps are the same either way,
    // so the same number still gives the same order.
    const until = performance.now() + 12
    while (!search.done() && performance.now() < until) search.run(32)
    progress.onProgress?.(search.share())
    if (search.done()) break
    await pause()
    if (progress.signal?.aborted) {
      stopped = true
      break
    }
  }
  return { ...search.best(), stopped }
}

/** The same search without pauses, for checks. */
export function suggestNow(show: Show, start: readonly number[], rules: Rules, keep: Keep, seed: number, steps?: number): Suggestion {
  const search = new Search(show, start, rules, keep, seed, steps)
  while (!search.done()) search.run(1_000_000)
  return { ...search.best(), stopped: false }
}

/** A small, fast random number source that a seed fixes (Mulberry32). */
export function randomFrom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

class Search {
  readonly total: number
  steps = 0
  private readonly n: number
  private readonly need: number
  private readonly dancers: number[][]
  private readonly part: Int32Array
  private readonly keepPart: number[]
  private readonly free: number[]
  private readonly at: Int32Array // the start position of each routine, for the distance
  private readonly weight: number[]
  private readonly tiny: number
  private readonly random: () => number
  private readonly exact: boolean
  private readonly floorTotal: number
  private order: Int32Array
  private seats: number[][] // each dancer's positions, ascending
  private levels: number[]
  private dist: number
  private score: number
  private bestOrder: Int32Array
  private bestLevels: number[]
  private bestDist: number
  private bestAt = 0 // the step the best was last improved
  private temperature = 0
  private cooling = 1
  private readonly runs = 3
  private readonly runSteps: number
  private run_ = 0
  private finished = false
  // The polish at the end of each run, done a few pairs at a time: where it is, and whether this pass improved anything.
  private polishing = false
  private px = 0
  private py = 1
  private pass = 0
  private improved = false
  private readonly start: Int32Array
  private readonly mark: Int32Array
  private stamp = 0
  private readonly delta: Int32Array
  private readonly scratch: number[] = []
  private readonly lastPos: Int32Array
  private readonly seen: Int32Array
  private seenStamp = 0
  private readonly trial: number[]

  constructor(show: Show, start: readonly number[], rules: Rules, keep: Keep, seed: number, steps?: number) {
    const n = start.length
    this.n = n
    this.need = rules.need
    this.dancers = show.dancers
    this.part = partsOf(n, rules.breaks)
    this.keepPart = keep.part
    this.free = []
    start.forEach((r, p) => !keep.pinned[r] && this.free.push(p))
    this.at = new Int32Array(n)
    start.forEach((r, p) => (this.at[r] = p))
    // The steps are steered by a score: each level of quick change weighs 32 times the next milder one, and the whole
    // distance less than one quick change. The best order is still chosen by the exact rule (keepIfBest).
    this.weight = Array.from({ length: rules.need }, (_, k) => 32 ** (rules.need - 1 - k))
    this.tiny = 1 / (n * n + 1)
    this.random = randomFrom(seed)
    this.start = Int32Array.from(start)
    this.order = Int32Array.from(start)
    this.seats = []
    this.levels = []
    this.dist = 0
    this.score = 0
    this.mark = new Int32Array(show.people.length)
    this.lastPos = new Int32Array(show.people.length)
    this.seen = new Int32Array(show.people.length)
    this.trial = new Array<number>(rules.need).fill(0)
    this.delta = new Int32Array(rules.need)
    this.floorTotal = floor(show, rules).total
    this.reset()
    this.bestOrder = Int32Array.from(this.order)
    this.bestLevels = [...this.levels]
    this.bestDist = this.dist
    let appearances = 0
    for (const ds of show.dancers) appearances += ds.length
    this.exact = this.free.length <= EXACT_UP_TO
    if (this.free.length < 2 || appearances === 0) {
      this.total = 0
      this.finished = true
    } else if (this.exact) {
      this.total = 1
      this.everyOrder()
      this.finished = true
    } else this.total = steps ?? stepsFor(n, appearances)
    this.runSteps = Math.ceil(this.total / this.runs)
    if (!this.finished) this.beginRun()
  }

  done(): boolean {
    if (this.finished) return true
    if (this.polishing) return false
    if (this.steps >= this.total) return true
    if (this.bestDist === 0 && this.bestLevels.every((x) => x === 0)) return true
    // Proved (as few quick changes as the floor allows) and the distance hasn't improved for a while: stop.
    const total = this.bestLevels.reduce((a, b) => a + b, 0)
    return total === this.floorTotal && this.steps - this.bestAt > Math.max(60_000, this.total / 5)
  }

  share(): number {
    return this.finished || !this.total ? 1 : Math.min(0.99, this.steps / this.total)
  }

  best(): Omit<Suggestion, 'stopped'> {
    return { order: Array.from(this.bestOrder), levels: [...this.bestLevels], distance: this.bestDist, exact: this.exact }
  }

  /** Does about `count` steps of work: steps of the annealing, or pairs of the polish (eight pairs to a step). */
  run(count: number) {
    if (this.finished) return
    let budget = count
    while (budget > 0 && !this.done()) {
      if (this.polishing) {
        budget -= Math.max(1, this.polishSome(budget * 8) / 8)
        if (!this.polishing && this.steps < this.total) {
          // Start the next run from the start order.
          this.run_++
          this.order = Int32Array.from(this.start)
          this.reset()
          this.beginRun()
        }
        continue
      }
      this.step()
      this.steps++
      budget--
      this.temperature *= this.cooling
      // End of a run: settle into the nearest order no single swap improves.
      if (this.steps % this.runSteps === 0 || this.steps === this.total) this.startPolish()
    }
  }

  private startPolish() {
    this.polishing = true
    this.px = 0
    this.py = 1
    this.pass = 0
    this.improved = false
  }

  /** Up to `pairs` swaps tried that improve the order by the exact rule; a pass with none improving ends the polish
   * (as do 40 passes). Returns the pairs tried. */
  private polishSome(pairs: number): number {
    const free = this.free
    let tried = 0
    while (tried < pairs) {
      if (this.py >= free.length) {
        this.px++
        this.py = this.px + 1
      }
      if (this.px >= free.length - 1) {
        this.pass++
        if (!this.improved || this.pass >= 40) {
          this.polishing = false
          return tried
        }
        this.px = 0
        this.py = 1
        this.improved = false
        continue
      }
      const p = free[this.px]
      const q = free[this.py]
      this.py++
      tried++
      if (!this.allowed(this.order[p], q) || !this.allowed(this.order[q], p)) continue
      this.swapDelta(p, q)
      let better = 0
      for (let k = 0; k < this.need && better === 0; k++) better = this.delta[k]
      if (better === 0) better = this.distDelta(p, q)
      if (better < 0) {
        this.applySwap(p, q)
        this.improved = true
      }
    }
    return tried
  }

  /** Compares every allowed order of the free routines (Heap's algorithm over their places), counting without
   * allocating: each dancer's last position, marked by a stamp so nothing needs clearing between orders. */
  private everyOrder() {
    const { free, n, need } = this
    const items = free.map((p) => this.start[p])
    const m = items.length
    const order = Int32Array.from(this.start)
    const last = new Int32Array(this.mark.length)
    const seen = new Int32Array(this.mark.length)
    const levels = new Array<number>(need).fill(0)
    let stamp = 0
    const tryIt = () => {
      for (let i = 0; i < m; i++) if (!this.allowed(items[i], free[i])) return
      for (let i = 0; i < m; i++) order[free[i]] = items[i]
      stamp++
      levels.fill(0)
      let dist = 0
      for (let p = 0; p < n; p++) {
        const r = order[p]
        dist += Math.abs(p - this.at[r])
        for (const d of this.dancers[r]) {
          if (seen[d] === stamp) {
            const q = last[d]
            if (p - q - 1 < need && this.part[q] === this.part[p]) levels[p - q - 1]++
          }
          seen[d] = stamp
          last[d] = p
        }
      }
      const c = compareLevels(levels, this.bestLevels)
      if (c < 0 || (c === 0 && dist < this.bestDist)) {
        this.bestOrder.set(order)
        this.bestLevels = [...levels]
        this.bestDist = dist
      }
    }
    tryIt()
    const c = new Array<number>(m).fill(0)
    let i = 0
    while (i < m) {
      if (c[i] < i) {
        const j = i % 2 === 0 ? 0 : c[i]
        ;[items[j], items[i]] = [items[i], items[j]]
        tryIt()
        c[i]++
        i = 0
      } else {
        c[i] = 0
        i++
      }
    }
  }

  /** Recounts everything from `order`. */
  private reset() {
    const { n, order } = this
    if (this.seats.length !== this.mark.length) {
      this.seats = []
      for (let d = 0; d < this.mark.length; d++) this.seats.push([])
    } else for (const list of this.seats) list.length = 0
    for (let p = 0; p < n; p++) for (const d of this.dancers[order[p]]) this.seats[d].push(p)
    this.levels = new Array<number>(this.need).fill(0)
    for (const list of this.seats) this.count(list, this.levels, 1)
    this.dist = 0
    for (let p = 0; p < n; p++) this.dist += Math.abs(p - this.at[order[p]])
    this.score = this.scoreOf(this.levels, this.dist)
  }

  private scoreOf(levels: ArrayLike<number>, dist: number): number {
    let s = dist * this.tiny
    for (let k = 0; k < this.need; k++) s += levels[k] * this.weight[k]
    return s
  }

  /** Adds (sign 1) or takes away (sign -1) a dancer's quick changes, from their ascending positions. */
  private count(list: ArrayLike<number>, into: { [k: number]: number }, sign: number) {
    for (let i = 1; i < list.length; i++) {
      const a = list[i - 1]
      const b = list[i]
      const between = b - a - 1
      if (between < this.need && this.part[a] === this.part[b]) into[between] += sign
    }
  }

  /** Starts a run from the start order with a temperature fitted to its typical step. */
  private beginRun() {
    const ups: number[] = []
    for (let i = 0; i < 64; i++) {
      const p = this.free[Math.floor(this.random() * this.free.length)]
      const q = this.free[Math.floor(this.random() * this.free.length)]
      if (p === q || !this.allowed(this.order[p], q) || !this.allowed(this.order[q], p)) continue
      const d = this.swapDelta(p, q)
      if (d > 0) ups.push(d)
    }
    ups.sort((a, b) => a - b)
    this.temperature = Math.max(1, ups.length ? ups[Math.floor(ups.length / 2)] : 1)
    // Down to well below the mildest quick change's weight (1) by the end of the run.
    this.cooling = Math.pow(0.02 / this.temperature, 1 / Math.max(1, this.runSteps))
  }

  private allowed(routine: number, position: number): boolean {
    const k = this.keepPart[routine]
    return k < 0 || k === this.part[position]
  }

  private step() {
    const free = this.free
    const i = Math.floor(this.random() * free.length)
    let j = Math.floor(this.random() * (free.length - 1))
    if (j >= i) j++
    if (this.random() < 0.85) {
      const p = free[i]
      const q = free[j]
      if (!this.allowed(this.order[p], q) || !this.allowed(this.order[q], p)) return
      const d = this.swapDelta(p, q)
      if (d <= 0 || this.random() < Math.exp(-d / this.temperature)) this.applySwap(p, q)
    } else this.tryMove(i, j)
  }

  private distDelta(p: number, q: number): number {
    const a = this.order[p]
    const b = this.order[q]
    const at = this.at
    return Math.abs(q - at[a]) + Math.abs(p - at[b]) - Math.abs(p - at[a]) - Math.abs(q - at[b])
  }

  /** The change in score if the routines at positions p and q swapped; leaves the level changes in `delta`. */
  private swapDelta(p: number, q: number): number {
    const { order, need, delta } = this
    const a = order[p]
    const b = order[q]
    delta.fill(0)
    const stamp = ++this.stamp
    for (const d of this.dancers[b]) this.mark[d] = stamp
    for (const d of this.dancers[a]) if (this.mark[d] !== stamp) this.shift(d, p, q)
    const stamp2 = ++this.stamp
    for (const d of this.dancers[a]) this.mark[d] = stamp2
    for (const d of this.dancers[b]) if (this.mark[d] !== stamp2) this.shift(d, q, p)
    let s = 0
    for (let k = 0; k < need; k++) s += delta[k] * this.weight[k]
    return s + this.distDelta(p, q) * this.tiny
  }

  /** Adds to `delta` what moving one of dancer d's numbers from position `from` to `to` changes. */
  private shift(d: number, from: number, to: number) {
    const list = this.seats[d]
    this.count(list, this.delta, -1)
    const moved = this.scratch
    moved.length = 0
    for (const x of list) if (x !== from) moved.push(x)
    let i = moved.length
    moved.push(to)
    while (i > 0 && moved[i - 1] > to) {
      moved[i] = moved[i - 1]
      i--
    }
    moved[i] = to
    this.count(moved, this.delta, 1)
  }

  /** Swaps the routines at p and q, with `delta` already holding the level changes. */
  private applySwap(p: number, q: number) {
    const { order } = this
    const a = order[p]
    const b = order[q]
    this.dist += this.distDelta(p, q)
    const stamp = ++this.stamp
    for (const d of this.dancers[b]) this.mark[d] = stamp
    for (const d of this.dancers[a]) if (this.mark[d] !== stamp) this.reseat(d, p, q)
    const stamp2 = ++this.stamp
    for (const d of this.dancers[a]) this.mark[d] = stamp2
    for (const d of this.dancers[b]) if (this.mark[d] !== stamp2) this.reseat(d, q, p)
    for (let k = 0; k < this.need; k++) this.levels[k] += this.delta[k]
    order[p] = b
    order[q] = a
    this.score = this.scoreOf(this.levels, this.dist)
    this.keepIfBest()
  }

  private reseat(d: number, from: number, to: number) {
    const list = this.seats[d]
    list.splice(list.indexOf(from), 1)
    let j = 0
    while (j < list.length && list[j] < to) j++
    list.splice(j, 0, to)
  }

  /** Moves the routine at free place i to free place j, the ones between moving up or down one free place. */
  private tryMove(i: number, j: number) {
    const { free, order } = this
    const next = Int32Array.from(order)
    const r = order[free[i]]
    if (i < j) for (let k = i; k < j; k++) next[free[k]] = order[free[k + 1]]
    else for (let k = i; k > j; k--) next[free[k]] = order[free[k - 1]]
    next[free[j]] = r
    for (let k = Math.min(i, j); k <= Math.max(i, j); k++) if (!this.allowed(next[free[k]], free[k])) return
    const dist = this.measure(next)
    const score = this.scoreOf(this.trial, dist)
    const d = score - this.score
    if (d <= 0 || this.random() < Math.exp(-d / this.temperature)) {
      this.order = next
      this.reset()
      this.keepIfBest()
    }
  }

  /** Counts an order's quick changes into `trial` and returns its distance, without allocating: each dancer's last
   * position, marked by a stamp so nothing needs clearing between counts. */
  private measure(order: Int32Array): number {
    const { n, need, part, lastPos, seen, trial } = this
    trial.fill(0)
    const stamp = ++this.seenStamp
    let dist = 0
    for (let p = 0; p < n; p++) {
      const r = order[p]
      dist += Math.abs(p - this.at[r])
      for (const d of this.dancers[r]) {
        if (seen[d] === stamp) {
          const q = lastPos[d]
          if (p - q - 1 < need && part[q] === part[p]) trial[p - q - 1]++
        }
        seen[d] = stamp
        lastPos[d] = p
      }
    }
    return dist
  }

  private keepIfBest() {
    const c = compareLevels(this.levels, this.bestLevels)
    if (c < 0 || (c === 0 && this.dist < this.bestDist)) {
      this.bestOrder.set(this.order)
      this.bestLevels = [...this.levels]
      this.bestDist = this.dist
      this.bestAt = this.steps
    }
  }
}

/** Lets the page respond between steps (a message, not a timer, which background tabs slow to once a second). */
function pause(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => {
      channel.port1.close()
      resolve()
    }
    channel.port2.postMessage(null)
  })
}

/** A cell safe to open in a spreadsheet: quoted when needed, and never read as a formula. */
export function csvCell(value: string): string {
  const v = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}
