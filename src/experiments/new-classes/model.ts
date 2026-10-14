// New Classes: next year's classes from a year group, with the friends each child named, children kept apart or
// together, and an even spread of whatever the school balances.
//
// Placements are compared by this rule, each step only when the ones before are level:
//   1. the fewest pairs kept apart who are in the same class (children kept together, children fixed to a class,
//      and class sizes are never broken: the search only makes moves that keep them);
//   2. the fewest children without at least one friend they named (counting children whose named friends were found);
//   3. the most even spread: for each balanced column, each class's count of each value against its fair share
//      (the value's total times the class's size over the year group), squared, summed, and divided by how many
//      children that column has, then summed over the columns;
//   4. the most named friendships together (a child with a friend they named, counted for each child).
// With few enough placements every one is compared. Otherwise the search moves and swaps children (or groups kept
// together) between classes: simulated annealing, half its proposals aimed at the class of someone a child named;
// a polish after each run (every move and swap tried, kept when the rule says it's better); then kicks (a few swaps
// of children alike in every column, then a polish, kept when no worse). It keeps the best placement it sees,
// starting from the one it's given, so it never returns a worse one, and its random choices come from a number, so
// they can be replayed.

export interface YearGroup {
  names: string[]
  /** For each child, the children they named as friends (indexes), each once, never themselves. */
  friends: number[][]
  /** Pairs of children who must not share a class. */
  apart: [number, number][]
  /** Groups of children who must share a class (each at least two). */
  together: number[][]
  /** Columns to balance: for each child, the index of their value in `labels`. */
  columns: { name: string; labels: string[]; values: number[] }[]
}

export interface Setup {
  /** Class names; their count is the number of classes. */
  classes: string[]
  /** The fewest and most children each class may have. */
  min: number[]
  max: number[]
  /** For each child, the class they're fixed to, or -1. */
  fixed: number[]
}

export interface Score {
  /** Pairs kept apart who share a class. */
  apart: number
  /** Children without a friend they named (among those whose friends were found). */
  friendless: number
  /** The spread measure (0 when every class has exactly its fair share of everything). */
  spread: number
  /** Children's named friends in their class, counted for each child. */
  together: number
}

export const LIMITS = { children: 600, classes: 12, columns: 12, friends: 10 }
const EPS = 1e-9

/** Below 0 when `a` is the better placement by the rule, above 0 when `b` is, 0 when level. */
export function compareScores(a: Score, b: Score): number {
  if (a.apart !== b.apart) return a.apart - b.apart
  if (a.friendless !== b.friendless) return a.friendless - b.friendless
  if (Math.abs(a.spread - b.spread) > EPS) return a.spread - b.spread
  return b.together - a.together
}

/** The score of a placement (each child's class index), counted directly from the rule. */
export function scoreOf(group: YearGroup, placement: ArrayLike<number>, classCount: number): Score {
  const n = group.names.length
  let apart = 0
  for (const [a, b] of group.apart) if (placement[a] === placement[b]) apart++
  let friendless = 0
  let together = 0
  for (let c = 0; c < n; c++) {
    const fs = group.friends[c]
    if (!fs.length) continue
    let k = 0
    for (const f of fs) if (placement[f] === placement[c]) k++
    together += k
    if (k === 0) friendless++
  }
  return { apart, friendless, spread: spreadOf(group, placement, classCount), together }
}

/** The spread measure, with each class's fair share taken from its actual size. */
export function spreadOf(group: YearGroup, placement: ArrayLike<number>, classCount: number): number {
  const n = group.names.length
  const size = new Array<number>(classCount).fill(0)
  for (let c = 0; c < n; c++) size[placement[c]]++
  let total = 0
  for (const col of group.columns) {
    const counts = col.labels.map(() => new Array<number>(classCount).fill(0))
    const totals = col.labels.map(() => 0)
    let counted = 0
    col.values.forEach((v, c) => {
      if (v < 0) return
      counts[v][placement[c]]++
      totals[v]++
      counted++
    })
    if (!counted) continue
    let sum = 0
    for (let v = 0; v < col.labels.length; v++)
      for (let k = 0; k < classCount; k++) {
        const d = counts[v][k] - (totals[v] * size[k]) / n
        sum += d * d
      }
    total += sum / counted
  }
  return total
}

/** Groups kept together, merged where they share a child (children named in two groups make one group). */
export function units(group: YearGroup): number[][] {
  const n = group.names.length
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const g of group.together) for (let i = 1; i < g.length; i++) parent[find(g[i])] = find(g[0])
  const by = new Map<number, number[]>()
  for (let c = 0; c < n; c++) by.set(find(c), [...(by.get(find(c)) ?? []), c])
  return [...by.values()]
}

/** Why the rules can't all hold, before any search: each problem in words. Empty when they might. */
export function problems(group: YearGroup, setup: Setup): string[] {
  const out: string[] = []
  const n = group.names.length
  const k = setup.classes.length
  const sumMin = setup.min.reduce((a, b) => a + b, 0)
  const sumMax = setup.max.reduce((a, b) => a + b, 0)
  if (sumMin > n) out.push(`The classes’ smallest sizes add up to ${sumMin}, more than the ${n} children.`)
  if (sumMax < n) out.push(`The classes’ largest sizes add up to ${sumMax}, fewer than the ${n} children.`)
  const biggest = Math.max(...setup.max)
  const fixedIn = new Array<number>(k).fill(0)
  for (const u of units(group)) {
    if (u.length > biggest) out.push(`${listNames(group, u)} are kept together, but that’s ${u.length} children, more than any class takes.`)
    const fixes = [...new Set(u.map((c) => setup.fixed[c]).filter((f) => f >= 0))]
    if (fixes.length > 1) out.push(`${listNames(group, u)} are kept together, but some are fixed to ${setup.classes[fixes[0]]} and some to ${setup.classes[fixes[1]]}.`)
    if (fixes.length === 1) fixedIn[fixes[0]] += u.length
    const inU = new Set(u)
    for (const [a, b] of group.apart) if (inU.has(a) && inU.has(b)) out.push(`${group.names[a]} and ${group.names[b]} are kept apart, but also kept together.`)
  }
  fixedIn.forEach((f, c) => f > setup.max[c] && out.push(`${f} children are fixed to ${setup.classes[c]}, more than its largest size (${setup.max[c]}).`))
  for (const [a, b] of group.apart)
    if (setup.fixed[a] >= 0 && setup.fixed[a] === setup.fixed[b]) out.push(`${group.names[a]} and ${group.names[b]} are kept apart, but both are fixed to ${setup.classes[setup.fixed[a]]}.`)
  return out
}

function listNames(group: YearGroup, kids: number[]): string {
  const names = kids.map((c) => group.names[c])
  return names.length <= 3 ? names.join(', ') : `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`
}

/**
 * A first placement that keeps the hard rules it can by construction: fixed children in their classes, groups kept
 * together, sizes within limits (largest groups placed first, each into the class with most room below its fair size).
 * Null when sizes can't be met this way.
 */
export function firstPlacement(group: YearGroup, setup: Setup): Int32Array | null {
  const n = group.names.length
  const k = setup.classes.length
  const placement = new Int32Array(n).fill(-1)
  const size = new Array<number>(k).fill(0)
  const all = units(group)
  const fixedOf = (u: number[]) => u.map((c) => setup.fixed[c]).find((f) => f >= 0) ?? -1
  for (const u of all) {
    const f = fixedOf(u)
    if (f < 0) continue
    if (size[f] + u.length > setup.max[f]) return null
    for (const c of u) placement[c] = f
    size[f] += u.length
  }
  const fair = setup.max.map((m, c) => (setup.min[c] + m) / 2)
  const rest = all.filter((u) => fixedOf(u) < 0).sort((a, b) => b.length - a.length)
  for (const u of rest) {
    let best = -1
    let room = -Infinity
    for (let c = 0; c < k; c++) {
      if (size[c] + u.length > setup.max[c]) continue
      const r = fair[c] - size[c]
      if (r > room) {
        room = r
        best = c
      }
    }
    if (best < 0) return null
    for (const c of u) placement[c] = best
    size[best] += u.length
  }
  if (size.some((s, c) => s < setup.min[c])) return null
  return placement
}

/** Whether a placement keeps the rules that are never broken: fixed children, groups together, sizes. */
export function keepsRules(group: YearGroup, setup: Setup, placement: ArrayLike<number>): boolean {
  const k = setup.classes.length
  const size = new Array<number>(k).fill(0)
  for (let c = 0; c < placement.length; c++) {
    const p = placement[c]
    if (p < 0 || p >= k) return false
    if (setup.fixed[c] >= 0 && setup.fixed[c] !== p) return false
    size[p]++
  }
  if (size.some((s, c) => s < setup.min[c] || s > setup.max[c])) return false
  return units(group).every((u) => u.every((c) => placement[c] === placement[u[0]]))
}

export interface Progress {
  onProgress?: (done: number) => void
  signal?: AbortSignal
}

export interface Options {
  /** Steps of the search (by default from the year group's size). */
  steps?: number
  /** Compare every placement when there are at most this many (EXACT_UP_TO by default; 0 always searches). */
  exactUpTo?: number
  /** For checks: annealing runs (4), the share of proposals aimed at a named friend's class (0.5), and the work
   *  given to kicking and polishing the best placement, as a share of the annealing's (1). */
  runs?: number
  aimed?: number
  kicks?: number
}

export interface Suggestion {
  placement: number[]
  score: Score
  /** True when every placement keeping the rules was compared. */
  exact: boolean
  stopped: boolean
}

/** Up to this many placements, every one is compared. */
export const EXACT_UP_TO = 250_000
/** Counting placements stops after this much work, and the search is used instead. */
const COUNT_BUDGET = 1_000_000

/** Steps of the search (fixed, so the same number replays the same search). */
export function stepsFor(children: number): number {
  return Math.min(3_000_000, Math.max(200_000, 12_000 * children))
}

export async function suggest(group: YearGroup, setup: Setup, start: ArrayLike<number>, seed: number, progress: Progress = {}, options: Options = {}): Promise<Suggestion> {
  const search = new Search(group, setup, start, seed, options)
  let stopped = false
  while (!search.done()) {
    const until = performance.now() + 12
    while (!search.done() && performance.now() < until) search.run(64)
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

/** The same without pauses, for checks. */
export function suggestNow(group: YearGroup, setup: Setup, start: ArrayLike<number>, seed: number, options: Options = {}): Suggestion {
  const search = new Search(group, setup, start, seed, options)
  while (!search.done()) search.run(1_000_000)
  return { ...search.best(), stopped: false }
}

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

/**
 * The search, in phases that each do a little at a time (so the page stays responsive): every placement when there
 * are few enough; otherwise three runs of annealing from the start, each followed by a polish (every single move and
 * every swap tried, kept when the rule says it's better, until none is), and a last polish of the best.
 */
class Search {
  private readonly group: YearGroup
  private readonly setup: Setup
  private readonly n: number
  private readonly k: number
  private readonly units: number[][]
  private readonly free: number[] // units that can move
  private readonly unitOf: Int32Array
  private readonly namedBy: number[][] // for each child, the children who named them
  private readonly apartOf: number[][] // for each child, who they're kept apart from
  private readonly hasFriends: Uint8Array
  private readonly related: number[][] // for each child, the children they named and who named them
  private readonly profile: Int32Array // for each unit, a number shared by units with the same values in every column
  private readonly aimed: number
  private readonly named: number // friendships named in all
  private readonly random: () => number
  private readonly start: Int32Array
  private readonly exact: boolean
  private phase: 'exact' | 'anneal' | 'polish' | 'done' = 'done'
  private placement: Int32Array
  private size: number[]
  private friendsIn: Int32Array // each child's named friends in their class
  private counts: number[][][] // [column][value][class]
  private totals: number[][] // [column][value]
  private counted: number[] // [column]
  private score: Score
  private bestPlacement: Int32Array
  private bestScore: Score
  private sinceRecount = 0
  // Every placement.
  private readonly work: number // nodes the count visited, for progress
  private nodes = 0
  private depth = 0
  private tryClass: Int32Array = new Int32Array(0)
  private assigned: number[] = []
  private after: number[] = []
  // Annealing.
  private readonly runs: number
  private readonly runSteps: number
  private readonly total: number
  private steps = 0
  private runsDone = 0
  private temperature = 1
  private cooling = 1
  // Polishing.
  private polishMode = 0 // 0: moves, 1: swaps
  private pi = 0
  private pj = 0
  private improved = false
  private current: Score = { apart: 0, friendless: 0, spread: 0, together: 0 }
  private lastPolish = false
  // Kicks: a few swaps that keep every column's counts, then a polish, kept when no worse.
  private readonly kickBudget: number
  private kickWork = 0
  private kicking = false
  private kept: Int32Array = new Int32Array(0)
  private keptScore: Score = { apart: 0, friendless: 0, spread: 0, together: 0 }

  constructor(group: YearGroup, setup: Setup, start: ArrayLike<number>, seed: number, options: Options = {}) {
    this.group = group
    this.setup = setup
    this.n = group.names.length
    this.k = setup.classes.length
    this.units = units(group)
    this.unitOf = new Int32Array(this.n)
    this.units.forEach((u, i) => u.forEach((c) => (this.unitOf[c] = i)))
    this.free = this.units.map((_, i) => i).filter((i) => this.units[i].every((c) => setup.fixed[c] < 0))
    this.namedBy = group.names.map(() => [])
    group.friends.forEach((fs, c) => fs.forEach((f) => this.namedBy[f].push(c)))
    this.apartOf = group.names.map(() => [])
    for (const [a, b] of group.apart) {
      this.apartOf[a].push(b)
      this.apartOf[b].push(a)
    }
    this.hasFriends = Uint8Array.from(group.friends, (fs) => (fs.length ? 1 : 0))
    this.related = group.names.map((_, c) => [...new Set([...group.friends[c], ...this.namedBy[c]])])
    const profiles = new Map<string, number>()
    this.profile = Int32Array.from(this.units, (u, i) => {
      const key = u.length === 1 ? group.columns.map((col) => col.values[u[0]]).join(',') : `unit ${i}`
      if (!profiles.has(key)) profiles.set(key, profiles.size)
      return profiles.get(key)!
    })
    this.aimed = options.aimed ?? 0.5
    this.named = group.friends.reduce((sum, fs) => sum + fs.length, 0)
    this.random = randomFrom(seed)
    this.start = Int32Array.from(start)
    this.placement = Int32Array.from(start)
    this.size = []
    this.friendsIn = new Int32Array(this.n)
    this.counts = []
    this.totals = []
    this.counted = []
    this.score = { apart: 0, friendless: 0, spread: 0, together: 0 }
    this.reset()
    this.bestPlacement = Int32Array.from(this.placement)
    this.bestScore = { ...this.score }
    const limit = options.exactUpTo ?? EXACT_UP_TO
    const count = limit > 0 ? this.countPlacements(limit) : { placements: Infinity, nodes: 0 }
    this.exact = count.placements <= limit
    this.work = count.nodes
    this.runs = options.runs ?? 4
    this.total = this.exact ? 0 : (options.steps ?? stepsFor(this.n))
    this.runSteps = Math.ceil(Math.max(1, this.total) / this.runs)
    this.kickBudget = Math.round(this.total * (options.kicks ?? 1))
    if (this.free.length === 0 || this.k < 2) this.phase = 'done'
    else if (this.exact) this.beginExact()
    else {
      this.phase = 'anneal'
      this.beginRun()
    }
  }

  done(): boolean {
    return this.phase === 'done' || (this.bestScore.apart === 0 && this.bestScore.friendless === 0 && this.bestScore.spread < EPS && this.bestScore.together === this.named)
  }

  share(): number {
    if (this.done()) return 1
    if (this.phase === 'exact') return Math.min(0.99, this.nodes / Math.max(1, this.work))
    return Math.min(0.99, (this.steps + this.kickWork) / Math.max(1, this.total + this.kickBudget))
  }

  best(): Omit<Suggestion, 'stopped'> {
    return { placement: Array.from(this.bestPlacement), score: { ...this.bestScore }, exact: this.exact }
  }

  run(count: number) {
    for (let i = 0; i < count && !this.done(); i++) {
      if (this.phase === 'exact') this.exactStep()
      else if (this.phase === 'anneal') this.annealStep()
      else this.polishStep()
    }
  }

  /** Recounts everything from `placement`. */
  private reset() {
    const { n, k, group } = this
    this.size = new Array<number>(k).fill(0)
    for (let c = 0; c < n; c++) this.size[this.placement[c]]++
    for (let c = 0; c < n; c++) {
      let f = 0
      for (const x of group.friends[c]) if (this.placement[x] === this.placement[c]) f++
      this.friendsIn[c] = f
    }
    this.counts = group.columns.map((col) => col.labels.map(() => new Array<number>(k).fill(0)))
    this.totals = group.columns.map((col) => col.labels.map(() => 0))
    this.counted = group.columns.map(() => 0)
    group.columns.forEach((col, j) =>
      col.values.forEach((v, c) => {
        if (v < 0) return
        this.counts[j][v][this.placement[c]]++
        this.totals[j][v]++
        this.counted[j]++
      }),
    )
    let apart = 0
    for (const [a, b] of group.apart) if (this.placement[a] === this.placement[b]) apart++
    let friendless = 0
    let together = 0
    for (let c = 0; c < n; c++) {
      if (!this.hasFriends[c]) continue
      together += this.friendsIn[c]
      if (this.friendsIn[c] === 0) friendless++
    }
    this.score = { apart, friendless, spread: this.spreadNow(), together }
  }

  private spreadNow(): number {
    let total = 0
    for (let j = 0; j < this.counts.length; j++) {
      if (!this.counted[j]) continue
      let sum = 0
      for (let v = 0; v < this.counts[j].length; v++)
        for (let c = 0; c < this.k; c++) {
          const d = this.counts[j][v][c] - (this.totals[j][v] * this.size[c]) / this.n
          sum += d * d
        }
      total += sum / this.counted[j]
    }
    return total
  }

  /** The spread's part for classes a and b only, for a change touching just those two. */
  private spreadOfClasses(a: number, b: number): number {
    let total = 0
    for (let j = 0; j < this.counts.length; j++) {
      if (!this.counted[j]) continue
      let sum = 0
      const counts = this.counts[j]
      const totals = this.totals[j]
      const fa = this.size[a] / this.n
      const fb = this.size[b] / this.n
      for (let v = 0; v < counts.length; v++) {
        const da = counts[v][a] - totals[v] * fa
        const db = counts[v][b] - totals[v] * fb
        sum += da * da + db * db
      }
      total += sum / this.counted[j]
    }
    return total
  }

  /** Moves a unit's children to class `to`, updating every count incrementally. */
  private moveUnit(u: number, to: number) {
    const from = this.placement[this.units[u][0]]
    if (from === to) return
    const spreadBefore = this.spreadOfClasses(from, to)
    for (const c of this.units[u]) {
      // Apart pairs.
      for (const p of this.apartOf[c]) {
        if (this.unitOf[p] === u) continue
        if (this.placement[p] === from) this.score.apart--
        if (this.placement[p] === to) this.score.apart++
      }
      // Children who named c.
      for (const x of this.namedBy[c]) {
        if (this.unitOf[x] === u) continue
        if (this.placement[x] === from) this.changeFriends(x, -1)
        if (this.placement[x] === to) this.changeFriends(x, 1)
      }
      for (let j = 0; j < this.counts.length; j++) {
        const v = this.group.columns[j].values[c]
        if (v < 0) continue
        this.counts[j][v][from]--
        this.counts[j][v][to]++
      }
    }
    this.size[from] -= this.units[u].length
    this.size[to] += this.units[u].length
    for (const c of this.units[u]) this.placement[c] = to
    // c's own named friends: those in its unit came along; the rest are counted afresh.
    for (const c of this.units[u]) {
      let f = 0
      for (const x of this.group.friends[c]) if (this.placement[x] === to) f++
      if (this.hasFriends[c]) {
        this.score.together += f - this.friendsIn[c]
        if (this.friendsIn[c] === 0 && f > 0) this.score.friendless--
        if (this.friendsIn[c] > 0 && f === 0) this.score.friendless++
      }
      this.friendsIn[c] = f
    }
    this.score.spread += this.spreadOfClasses(from, to) - spreadBefore
  }

  private changeFriends(x: number, by: number) {
    const before = this.friendsIn[x]
    this.friendsIn[x] += by
    this.score.together += by
    if (before === 0 && this.friendsIn[x] > 0) this.score.friendless--
    if (before > 0 && this.friendsIn[x] === 0) this.score.friendless++
  }

  /** Whether the current placement beats `than` by the rule, with the spread counted afresh when it decides. */
  private beats(than: Score): boolean {
    const s = this.score
    if (s.apart !== than.apart) return s.apart < than.apart
    if (s.friendless !== than.friendless) return s.friendless < than.friendless
    if (Math.abs(s.spread - than.spread) < 1e-6) s.spread = this.spreadNow()
    return compareScores(s, than) < 0
  }

  private keepIfBest() {
    // Drift in the running spread is removed now and then by a fresh count.
    if (++this.sinceRecount >= 4096) {
      this.sinceRecount = 0
      this.score.spread = this.spreadNow()
    }
    if (compareScores(this.score, this.bestScore) < 0 || this.beats(this.bestScore)) {
      this.score.spread = this.spreadNow()
      if (compareScores(this.score, this.bestScore) < 0) {
        this.bestPlacement.set(this.placement)
        this.bestScore = { ...this.score }
      }
    }
  }

  /** Makes a move or swap of these units if the sizes allow it; returns false (changing nothing) if not. */
  private tryMove(u: number, target: number): boolean {
    const from = this.placement[this.units[u][0]]
    const len = this.units[u].length
    if (from === target || this.size[target] + len > this.setup.max[target] || this.size[from] - len < this.setup.min[from]) return false
    this.moveUnit(u, target)
    return true
  }

  private trySwap(u: number, w: number): boolean {
    const a = this.placement[this.units[u][0]]
    const b = this.placement[this.units[w][0]]
    if (a === b) return false
    const du = this.units[u].length
    const dw = this.units[w].length
    if (this.size[a] - du + dw > this.setup.max[a] || this.size[a] - du + dw < this.setup.min[a]) return false
    if (this.size[b] - dw + du > this.setup.max[b] || this.size[b] - dw + du < this.setup.min[b]) return false
    this.moveUnit(u, b)
    this.moveUnit(w, a)
    return true
  }

  // --- Every placement: a depth-first walk over the movable units' classes, a node at a time.

  private feasible(i: number): boolean {
    let short = 0
    for (let c = 0; c < this.k; c++) if (this.assigned[c] < this.setup.min[c]) short += this.setup.min[c] - this.assigned[c]
    return short <= this.after[i]
  }

  private fixedSizes(): number[] {
    const sizes = new Array<number>(this.k).fill(0)
    const movable = new Set(this.free)
    this.units.forEach((u, i) => {
      if (!movable.has(i)) sizes[this.start[u[0]]] += u.length
    })
    return sizes
  }

  private suffix(): number[] {
    const F = this.free.length
    const after = new Array<number>(F).fill(0)
    for (let i = F - 2; i >= 0; i--) after[i] = after[i + 1] + this.units[this.free[i + 1]].length
    return after
  }

  /** How many placements keep the sizes (stopping past `limit`), and the walk's size. */
  private countPlacements(limit: number): { placements: number; nodes: number } {
    const F = this.free.length
    if (F === 0) return { placements: 1, nodes: 0 }
    this.assigned = this.fixedSizes()
    this.after = this.suffix()
    let placements = 0
    let nodes = 0
    const visit = (i: number): boolean => {
      if (++nodes > COUNT_BUDGET || placements > limit) return false
      if (i === F) {
        if (this.assigned.every((s, c) => s >= this.setup.min[c])) placements++
        return true
      }
      const len = this.units[this.free[i]].length
      for (let c = 0; c < this.k; c++) {
        if (this.assigned[c] + len > this.setup.max[c]) continue
        this.assigned[c] += len
        const ok = !this.feasible(i) || visit(i + 1)
        this.assigned[c] -= len
        if (!ok) return false
      }
      return true
    }
    const complete = visit(0)
    return { placements: complete && placements <= limit ? placements : Infinity, nodes }
  }

  private beginExact() {
    this.phase = 'exact'
    this.assigned = this.fixedSizes()
    this.after = this.suffix()
    this.tryClass = new Int32Array(this.free.length).fill(-1)
    this.depth = 0
    this.nodes = 0
  }

  private exactStep() {
    const F = this.free.length
    this.nodes++
    if (this.depth === F) {
      if (this.assigned.every((s, c) => s >= this.setup.min[c])) this.keepIfBest()
      this.depth--
      return
    }
    const i = this.depth
    const u = this.free[i]
    const len = this.units[u].length
    let c = this.tryClass[i]
    if (c >= 0) this.assigned[c] -= len
    for (c = c + 1; c < this.k; c++) {
      if (this.assigned[c] + len > this.setup.max[c]) continue
      this.assigned[c] += len
      if (this.feasible(i)) break
      this.assigned[c] -= len
    }
    if (c < this.k) {
      this.tryClass[i] = c
      this.moveUnit(u, c)
      this.depth++
      if (this.depth < F) this.tryClass[this.depth] = -1
    } else {
      this.tryClass[i] = -1
      this.depth--
      if (this.depth < 0) this.phase = 'done'
    }
  }

  // --- Annealing.

  /** Steering for the annealing: one number that heads the way the rule does (the best is still kept by the rule). */
  private steer(s: Score): number {
    return s.apart * 1e6 + s.friendless * 1e3 + s.spread * 10 - s.together * 0.01
  }

  /** A random allowed move or swap; returns how to undo it, or null if the one drawn wasn't allowed. */
  private tryRandom(): (() => void) | null {
    const u = this.free[Math.floor(this.random() * this.free.length)]
    const from = this.placement[this.units[u][0]]
    let target = -1
    if (this.aimed > 0 && this.random() < this.aimed) {
      // Towards the class of someone this child named, or who named them.
      const kid = this.units[u][Math.floor(this.random() * this.units[u].length)]
      const rel = this.related[kid]
      if (rel.length) {
        const t = this.placement[rel[Math.floor(this.random() * rel.length)]]
        if (t !== from) target = t
      }
      if (target >= 0) {
        if (this.random() < 0.5 && this.tryMove(u, target)) return () => this.moveUnit(u, from)
        // A swap with a child there, one with the same values in every column if a few draws find one.
        let w = -1
        for (let tries = 0; tries < 8; tries++) {
          const x = this.free[Math.floor(this.random() * this.free.length)]
          if (this.placement[this.units[x][0]] !== target) continue
          w = x
          if (this.profile[x] === this.profile[u]) break
        }
        if (w < 0 || !this.trySwap(u, w)) return null
        return () => {
          this.moveUnit(w, target)
          this.moveUnit(u, from)
        }
      }
    }
    if (this.random() < 0.5) {
      const to = Math.floor(this.random() * (this.k - 1))
      target = to >= from ? to + 1 : to
      if (!this.tryMove(u, target)) return null
      return () => this.moveUnit(u, from)
    }
    const w = this.free[Math.floor(this.random() * this.free.length)]
    const other = this.placement[this.units[w][0]]
    if (!this.trySwap(u, w)) return null
    return () => {
      this.moveUnit(w, other)
      this.moveUnit(u, from)
    }
  }

  private beginRun() {
    this.placement = Int32Array.from(this.start)
    this.reset()
    const ups: number[] = []
    for (let i = 0; i < 64; i++) {
      const before = this.steer(this.score)
      const undo = this.tryRandom()
      if (undo) {
        const d = this.steer(this.score) - before
        undo()
        if (d > 0) ups.push(d)
      }
    }
    this.reset()
    ups.sort((a, b) => a - b)
    this.temperature = Math.max(1, ups.length ? ups[Math.floor(ups.length / 2)] : 1)
    this.cooling = Math.pow(0.001 / this.temperature, 1 / Math.max(1, this.runSteps))
  }

  private annealStep() {
    const { apart, friendless, spread, together } = this.score
    const before = this.steer(this.score)
    const undo = this.tryRandom()
    if (undo) {
      const d = this.steer(this.score) - before
      if (d <= 0 || this.random() < Math.exp(-d / this.temperature)) this.keepIfBest()
      else {
        undo()
        this.score = { apart, friendless, spread, together }
      }
    }
    this.steps++
    this.temperature *= this.cooling
    if (this.steps >= (this.runsDone + 1) * this.runSteps || this.steps >= this.total) {
      this.runsDone++
      this.beginPolish(false)
    }
  }

  // --- Polishing.

  private beginPolish(last: boolean) {
    this.phase = 'polish'
    this.lastPolish = last
    if (last) {
      this.placement = Int32Array.from(this.bestPlacement)
      this.reset()
    }
    this.score.spread = this.spreadNow()
    this.current = { ...this.score }
    this.polishMode = 0
    this.pi = 0
    this.pj = 0
    this.improved = false
  }

  private polishStep() {
    const F = this.free.length
    if (this.kicking) this.kickWork++
    const u = this.free[this.pi]
    const w = this.polishMode === 1 ? this.free[this.pj] : -1
    const from = this.placement[this.units[u][0]]
    const other = w >= 0 ? this.placement[this.units[w][0]] : -1
    const changed = w >= 0 ? this.trySwap(u, w) : this.tryMove(u, this.pj)
    if (changed) {
      if (this.beats(this.current)) {
        this.score.spread = this.spreadNow()
        this.current = { ...this.score }
        this.improved = true
        this.keepIfBest()
      } else {
        // Undone, the counts come back exactly, and so does the score.
        if (w >= 0) this.moveUnit(w, other)
        this.moveUnit(u, from)
        this.score = { ...this.current }
      }
    }
    // The next trial: every unit to every class, then every pair of units.
    this.pj++
    if (this.polishMode === 0) {
      if (this.pj >= this.k) {
        this.pj = 0
        this.pi++
        if (this.pi >= F) {
          this.polishMode = 1
          this.pi = 0
          this.pj = 1
        }
      }
    } else if (this.pj >= F) {
      this.pi++
      this.pj = this.pi + 1
    }
    if (this.polishMode === 1 && this.pi >= F - 1) {
      if (this.improved) {
        this.polishMode = 0
        this.pi = 0
        this.pj = 0
        this.improved = false
      } else this.endPolish()
    }
  }

  private endPolish() {
    if (this.kicking) {
      // Keep the kicked and polished placement when it's no worse; otherwise go back.
      if (compareScores(this.current, this.keptScore) <= 0) {
        this.kept.set(this.placement)
        this.keptScore = { ...this.current }
      } else {
        this.placement = Int32Array.from(this.kept)
        this.reset()
      }
      if (this.kickWork >= this.kickBudget) this.phase = 'done'
      else this.kick()
      return
    }
    if (this.lastPolish || this.runsDone >= this.runs) {
      if (!this.lastPolish) this.beginPolish(true)
      else if (this.kickBudget > 0) {
        this.kicking = true
        this.kept = Int32Array.from(this.placement)
        this.keptScore = { ...this.current }
        this.kick()
      } else this.phase = 'done'
      return
    }
    this.phase = 'anneal'
    this.beginRun()
  }

  /** A few random swaps of children with the same values in every column (so the spread stays), then a polish. */
  private kick() {
    for (let swaps = 0; swaps < 3; swaps++) {
      for (let tries = 0; tries < 50; tries++) {
        this.kickWork++
        const u = this.free[Math.floor(this.random() * this.free.length)]
        const w = this.free[Math.floor(this.random() * this.free.length)]
        if (this.profile[u] !== this.profile[w] && tries < 40) continue
        if (this.trySwap(u, w)) break
      }
    }
    this.beginPolish(false)
  }
}

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

/**
 * The placement moved to fit the sizes, moving as few children as it can (none fixed, groups kept together): from a
 * class over its largest size, or with the most to spare, each move takes the child with the fewest named friends
 * there. Null when that doesn't reach the sizes.
 */
export function fitSizes(group: YearGroup, setup: Setup, placement: ArrayLike<number>): Int32Array | null {
  const k = setup.classes.length
  const p = Int32Array.from(placement)
  const free = units(group).filter((u) => u.every((c) => setup.fixed[c] < 0))
  const size = new Array<number>(k).fill(0)
  for (const c of p) size[c]++
  const friendsThere = (u: number[], cls: number) => u.reduce((sum, c) => sum + group.friends[c].filter((f) => p[f] === cls).length, 0)
  for (let guard = 0; guard <= group.names.length; guard++) {
    const over = size.findIndex((z, c) => z > setup.max[c])
    const under = size.findIndex((z, c) => z < setup.min[c])
    if (over < 0 && under < 0) return p
    let from = over
    if (from < 0) {
      let spare = 0
      size.forEach((z, c) => {
        if (c !== under && z - setup.min[c] > spare) {
          spare = z - setup.min[c]
          from = c
        }
      })
    }
    let to = under
    if (to < 0) {
      let room = 0
      size.forEach((z, c) => {
        if (c !== from && setup.max[c] - z > room) {
          room = setup.max[c] - z
          to = c
        }
      })
    }
    if (from < 0 || to < 0) return null
    let best: number[] | null = null
    let cost = Infinity
    for (const u of free) {
      if (p[u[0]] !== from || size[to] + u.length > setup.max[to]) continue
      if (over < 0 && size[from] - u.length < setup.min[from]) continue
      const c = u.length * 1000 + friendsThere(u, from)
      if (c < cost) {
        cost = c
        best = u
      }
    }
    if (!best) return null
    for (const c of best) p[c] = to
    size[from] -= best.length
    size[to] += best.length
  }
  return null
}

export interface ClassStats {
  size: number[]
  /** [column][value][class] */
  counts: number[][][]
  /** For each child, how many of the friends they named are in their class. */
  friendsIn: number[]
  /** Pairs kept apart who share a class. */
  broken: [number, number][]
}

export function classStats(group: YearGroup, placement: ArrayLike<number>, classCount: number): ClassStats {
  const size = new Array<number>(classCount).fill(0)
  for (let c = 0; c < group.names.length; c++) size[placement[c]]++
  const counts = group.columns.map((col) => {
    const out = col.labels.map(() => new Array<number>(classCount).fill(0))
    col.values.forEach((v, c) => v >= 0 && out[v][placement[c]]++)
    return out
  })
  const friendsIn = group.friends.map((fs, c) => fs.filter((f) => placement[f] === placement[c]).length)
  const broken = group.apart.filter(([a, b]) => placement[a] === placement[b])
  return { size, counts, friendsIn, broken }
}

/** Even sizes for n children in k classes: the first n mod k classes one larger. */
export function evenSizes(n: number, k: number): number[] {
  return Array.from({ length: k }, (_, c) => Math.floor(n / k) + (c < n % k ? 1 : 0))
}

/** A cell safe to open in a spreadsheet: quoted when needed, and never read as a formula (a plain number stays). */
export function csvCell(value: string): string {
  const v = /^[=+\-@\t\r]/.test(value) && !/^[+-]?\d+(\.\d+)?%?$/.test(value) ? `'${value}` : value
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}
