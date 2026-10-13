// Places by Choice: give out places from ranked choices, as high on everyone's list as the places allow.
//
// The rule: place as many people as the places allow; among the ways of doing that, take the one with the lowest
// total, where each place costs its choice number squared (a first choice 1, a second 4, a third 9); settle equal
// totals by a draw. Solved exactly, as a minimum-cost flow: successive shortest paths, searched over the activities
// (a person moving from one activity to another is an edge between them), with potentials so the searches never
// meet a negative cost.

export interface Activity {
  name: string
  places: number
  /** The fewest it runs with (0 for no minimum). */
  min: number
}

export interface Person {
  name: string
  /** Activity indexes, best first, each at most once. */
  choices: number[]
}

export interface Placement {
  /** For each person, the activity they're placed in, or -1. */
  place: Int32Array
  /** For each person, the choice number they got (1 for a first choice), or 0 if not one of their choices. */
  choice: Int32Array
  /** People placed where there was room, not in one of their choices (only when asked). */
  filled: Set<number>
  /** How many got each choice: index 0 is first choices. */
  profile: number[]
  unplaced: number
  /** Activities dropped for having fewer than their minimum, in the order they were dropped, with how many they had
   * (or, if fewer people chose it than its minimum, how many chose it). */
  dropped: { activity: number; had: number; chosenBy?: number }[]
  /** Why each person left without a place is left out: none of their choices runs, or every one of them is full. */
  why: Map<number, 'no-choices' | 'not-running' | 'full'>
  draw: number
}

export interface Progress {
  /** Called now and then with how many have been placed, of how many could be. */
  onProgress?: (placed: number, of: number) => void
  signal?: AbortSignal
}

/** The most people and activities one allocation takes; past these it would be slow on a phone. */
export const LIMITS = { people: 10_000, activities: 500, choices: 20 }

/** What a choice costs: its number, squared. */
export const cost = (choice: number) => choice * choice

/**
 * Places everyone it can. `draw` settles ties: the same people, activities, and draw give the same placement. With
 * `fill`, people left without one of their choices go where there's room afterwards. It pauses now and then so the
 * page stays responsive, and stops with an AbortError if the signal fires.
 */
export async function allocate(people: Person[], activities: Activity[], draw: number, fill = false, progress: Progress = {}): Promise<Placement> {
  const places = activities.map((a) => Math.max(0, Math.floor(a.places)))
  const dropped: Placement['dropped'] = []
  // An activity fewer people chose than its minimum can never run: dropped before anything is placed.
  const chosenBy = new Int32Array(activities.length)
  for (const p of people) for (const a of p.choices) chosenBy[a]++
  for (let a = 0; a < activities.length; a++) {
    if (places[a] > 0 && activities[a].min > 0 && chosenBy[a] < activities[a].min) {
      dropped.push({ activity: a, had: 0, chosenBy: chosenBy[a] })
      places[a] = 0
    }
  }
  let place = await solve(people, places, draw, progress)
  // An activity below its minimum doesn't run: the smallest such one is dropped, and everyone is placed again.
  for (;;) {
    const counts = count(place, activities.length)
    let worst = -1
    for (let a = 0; a < activities.length; a++) {
      if (places[a] === 0 || counts[a] === 0 || counts[a] >= activities[a].min) continue
      if (worst < 0 || counts[a] < counts[worst] || (counts[a] === counts[worst] && tie(draw, -1, a) < tie(draw, -1, worst))) worst = a
    }
    if (worst < 0) break
    dropped.push({ activity: worst, had: counts[worst] })
    places[worst] = 0
    place = await solve(people, places, draw, progress)
  }
  const choice = new Int32Array(people.length)
  const profile = new Array<number>(Math.max(0, ...people.map((p) => p.choices.length))).fill(0)
  let unplaced = 0
  for (let p = 0; p < people.length; p++) {
    if (place[p] < 0) {
      unplaced++
      continue
    }
    const r = people[p].choices.indexOf(place[p])
    choice[p] = r + 1
    profile[r]++
  }
  const why: Placement['why'] = new Map()
  for (let p = 0; p < people.length; p++) {
    if (place[p] >= 0) continue
    const choices = people[p].choices
    why.set(p, choices.length === 0 ? 'no-choices' : choices.every((a) => places[a] === 0) ? 'not-running' : 'full')
  }
  const filled = new Set<number>()
  if (fill && unplaced) {
    const counts = count(place, activities.length)
    const order = people.map((_, p) => p).filter((p) => place[p] < 0)
    order.sort((x, y) => tie(draw, x, -2) - tie(draw, y, -2))
    for (const p of order) {
      // The running activity with the most room left takes them.
      let best = -1
      for (let a = 0; a < activities.length; a++) if (places[a] - counts[a] > 0 && (best < 0 || places[a] - counts[a] > places[best] - counts[best])) best = a
      if (best < 0) break
      place[p] = best
      counts[best]++
      filled.add(p)
      unplaced--
    }
  }
  return { place, choice, filled, profile, unplaced, dropped, why, draw }
}

function count(place: Int32Array, activities: number): Int32Array {
  const counts = new Int32Array(activities)
  for (const a of place) if (a >= 0) counts[a]++
  return counts
}

/** A draw's tie-break for a person and an activity: a small number from a hash, the same every time. */
export function tie(draw: number, person: number, activity: number): number {
  let h = (Math.imul(draw ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(person + 0x632be5ab, 0xc2b2ae35) ^ Math.imul(activity + 0x27d4eb2f, 0x165667b1)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0
  return (h ^ (h >>> 16)) % TIE
}

const TIE = 1024

/** The minimum-cost placement for the given places: the person-by-person activity, or -1. */
export async function solve(people: Person[], places: number[], draw: number, progress: Progress = {}): Promise<Int32Array> {
  const n = people.length
  const A = places.length
  // Costs: the choice number squared, scaled so the draw's tie-breaks, summed over everyone, can never outweigh one
  // step in anyone's choice. Totals stay well inside the integers a double holds exactly.
  const scale = n * TIE + 1
  const offsets = new Int32Array(n + 1)
  for (let p = 0; p < n; p++) offsets[p + 1] = offsets[p] + people[p].choices.length
  const target = new Int32Array(offsets[n])
  const weight = new Float64Array(offsets[n])
  for (let p = 0; p < n; p++) {
    people[p].choices.forEach((a, r) => {
      target[offsets[p] + r] = a
      weight[offsets[p] + r] = cost(r + 1) * scale + tie(draw, p, a)
    })
  }
  const place = new Int32Array(n).fill(-1)
  const where = new Int32Array(n).fill(-1)
  // Each activity's members, kept as a list with each person's position in it, for removal in constant time.
  const members: number[][] = Array.from({ length: A }, () => [])
  const pi = new Float64Array(A)
  let piT = 0
  const dist = new Float64Array(A + 1)
  const fromPerson = new Int32Array(A)
  const fromActivity = new Int32Array(A)
  const done = new Uint8Array(A + 1)
  const heap = new Heap(A + 1)
  // The cost of the edge for person p into activity a, by p's choice list.
  const costOf = (p: number, a: number) => {
    for (let i = offsets[p]; i < offsets[p + 1]; i++) if (target[i] === a) return weight[i]
    return Infinity
  }
  // At most as many can be placed as there are people with a choice that runs, or as there are places.
  const couldBe = Math.min(
    places.reduce((n, x) => n + x, 0),
    people.reduce((n, p) => n + (p.choices.some((a) => places[a] > 0) ? 1 : 0), 0),
  )
  let placed = 0
  let last = Date.now()
  for (;;) {
    if (Date.now() - last > 40) {
      if (progress.signal?.aborted) throw new DOMException('Stopped', 'AbortError')
      progress.onProgress?.(placed, couldBe)
      await pause()
      last = Date.now()
    }
    dist.fill(Infinity)
    done.fill(0)
    heap.clear()
    let unplacedLeft = false
    // From the source, through any person not yet placed, to each of their choices.
    for (let p = 0; p < n; p++) {
      if (place[p] >= 0) continue
      for (let i = offsets[p]; i < offsets[p + 1]; i++) {
        const a = target[i]
        if (places[a] === 0) continue
        unplacedLeft = true
        const d = weight[i] - pi[a]
        if (d < dist[a]) {
          dist[a] = d
          fromPerson[a] = p
          fromActivity[a] = -1
        }
      }
    }
    if (!unplacedLeft) break
    for (let a = 0; a < A; a++) if (dist[a] < Infinity) heap.push(a, dist[a])
    let end = -1
    while (heap.size) {
      const v = heap.pop()
      if (done[v]) continue
      done[v] = 1
      if (v === A) break
      const dv = dist[v]
      // To the sink, if it has room.
      if (members[v].length < places[v]) {
        const d = dv + pi[v] - piT
        if (d < dist[A]) {
          dist[A] = d
          end = v
          heap.push(A, d)
        }
      }
      // Through each member, to their other choices.
      for (const q of members[v]) {
        const out = costOf(q, v)
        for (let i = offsets[q]; i < offsets[q + 1]; i++) {
          const b = target[i]
          if (b === v || done[b] || places[b] === 0) continue
          const d = dv + weight[i] - out + pi[v] - pi[b]
          if (d < dist[b]) {
            dist[b] = d
            fromPerson[b] = q
            fromActivity[b] = v
            heap.push(b, d)
          }
        }
      }
    }
    if (!done[A]) break
    // Potentials, so every edge's cost stays at or above zero; distances past the sink's are cut to the sink's.
    const dT = dist[A]
    for (let a = 0; a < A; a++) pi[a] += Math.min(dist[a], dT)
    piT += dT
    // Along the path, backwards: each person moves into the activity after them.
    for (let b = end; b >= 0; ) {
      const q = fromPerson[b]
      const a = fromActivity[b]
      if (place[q] >= 0) remove(q)
      place[q] = b
      where[q] = members[b].length
      members[b].push(q)
      b = a
    }
    placed++
  }
  if (progress.signal?.aborted) throw new DOMException('Stopped', 'AbortError')
  progress.onProgress?.(placed, couldBe)
  return place

  function remove(q: number) {
    const list = members[place[q]]
    const i = where[q]
    const last = list.pop()!
    if (last !== q) {
      list[i] = last
      where[last] = i
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

/** A binary heap of node numbers by key; a node pushed again simply comes out again (stale ones are skipped). */
class Heap {
  private keys: Float64Array
  private nodes: Int32Array
  size = 0
  constructor(capacity: number) {
    this.keys = new Float64Array(capacity * 4)
    this.nodes = new Int32Array(capacity * 4)
  }
  clear() {
    this.size = 0
  }
  push(node: number, key: number) {
    if (this.size === this.keys.length) {
      const keys = new Float64Array(this.keys.length * 2)
      const nodes = new Int32Array(this.nodes.length * 2)
      keys.set(this.keys)
      nodes.set(this.nodes)
      this.keys = keys
      this.nodes = nodes
    }
    let i = this.size++
    while (i > 0) {
      const up = (i - 1) >> 1
      if (this.keys[up] <= key) break
      this.keys[i] = this.keys[up]
      this.nodes[i] = this.nodes[up]
      i = up
    }
    this.keys[i] = key
    this.nodes[i] = node
  }
  pop(): number {
    const top = this.nodes[0]
    const key = this.keys[--this.size]
    const node = this.nodes[this.size]
    let i = 0
    for (;;) {
      let child = 2 * i + 1
      if (child >= this.size) break
      if (child + 1 < this.size && this.keys[child + 1] < this.keys[child]) child++
      if (this.keys[child] >= key) break
      this.keys[i] = this.keys[child]
      this.nodes[i] = this.nodes[child]
      i = child
    }
    this.keys[i] = key
    this.nodes[i] = node
    return top
  }
}
