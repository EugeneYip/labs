/**
 * Exam times, worked out from timestamps. Nothing is counted down: every finish time is calculated afresh from when
 * the time started, how long it is, and when it was stopped, so a reload, a closed lid, or a slow screen can't change it.
 */

export interface Pause {
  /** When the time stopped (ms since 1970). */
  from: number
  /** When it started again, or null while still stopped. */
  to: number | null
}

export interface Paper {
  id: string
  title: string
  /** The published length of the paper, in minutes. */
  minutes: number
  /** Extra-time groups shown on the board, as percentages, such as 25. */
  extra: number[]
  /** When it actually started, or null before it has. */
  start: number | null
}

export interface Candidate {
  id: string
  /** A candidate number or initials. */
  label: string
  paperId: string
  /** Extra time as a percentage of the paper's length. */
  extra: number
  /** The candidate's own start, for a late start; null to start with the paper. */
  start: number | null
  /** Supervised rest breaks: the candidate's time stops for each. */
  breaks: Pause[]
  /** The SENCo's instructions, as a reminder for the invigilator. */
  note: string
}

export interface Exam {
  centre: string
  room: string
  papers: Paper[]
  candidates: Candidate[]
  /** Times the whole room stopped, such as an evacuation: everyone's time stops. */
  roomPauses: Pause[]
}

export interface Settings {
  /** Show seconds on the board's clock. */
  seconds: boolean
  /** 12-hour times, or 24-hour; null follows the device. */
  hour12: boolean | null
  /** Show each listed candidate's own finish time on the board, by candidate number. */
  showCandidates: boolean
  /** Light text on black, which glares less on a projector. */
  dark: boolean
}

export const LIMITS = { papers: 12, candidates: 200, title: 80, label: 20, note: 120, centre: 20, room: 40, minutes: 600, extra: 200, pauses: 100 }

export const DEFAULT_SETTINGS: Settings = { seconds: false, hour12: null, showCandidates: false, dark: true }

export const EMPTY_EXAM: Exam = { centre: '', room: '', papers: [], candidates: [], roomPauses: [] }

const MINUTE = 60_000

/** Working time allowed for a paper's length and an extra-time percentage, in ms. Exact: 25% of 90 minutes is 22 minutes 30 seconds. */
export function allowed(minutes: number, extra: number): number {
  return Math.round(minutes * MINUTE * (1 + extra / 100))
}

export interface Timing {
  /** When this time started. */
  start: number
  /** Working time allowed, in ms. */
  allowed: number
  /** Time stopped before the finish (or so far, while stopped), in ms. */
  stopped: number
  /** When the time runs out, to the millisecond; null while it's stopped. */
  finish: number | null
  /** Working time left at `now`, in ms. */
  remaining: number
  /** While stopped: since when. */
  stoppedSince: number | null
}

/**
 * When time that started at `start`, with `allowed` ms of working time, runs out, given every moment it was stopped.
 * Stops may overlap (a candidate's rest break during a room evacuation) and count once; stops before the start, or
 * after the time has already run out, don't count at all.
 */
export function timing(start: number, allowedMs: number, pauses: readonly Pause[], now: number): Timing {
  const spans = merge(
    pauses
      .map((p) => ({ from: Math.max(p.from, start), to: p.to ?? Infinity }))
      .filter((p) => p.to > p.from),
  )
  let t = start
  let left = allowedMs
  let stopped = 0
  for (const span of spans) {
    if (span.from >= t + left) break
    left -= span.from - t
    if (span.to === Infinity) {
      stopped += Math.max(0, now - span.from)
      return { start, allowed: allowedMs, stopped, finish: null, remaining: left, stoppedSince: span.from }
    }
    stopped += span.to - span.from
    t = span.to
  }
  const finish = t + left
  // Stops are recorded as they happen, so none lies ahead of `now`; what's left is the time until the finish.
  return { start, allowed: allowedMs, stopped, finish, remaining: Math.max(0, Math.min(left, finish - now)), stoppedSince: null }
}

/** Overlapping or touching spans joined into one, in order. */
function merge(spans: { from: number; to: number }[]): { from: number; to: number }[] {
  const sorted = [...spans].sort((a, b) => a.from - b.from)
  const out: { from: number; to: number }[] = []
  for (const s of sorted) {
    const last = out[out.length - 1]
    if (last && s.from <= last.to) last.to = Math.max(last.to, s.to)
    else out.push({ ...s })
  }
  return out
}

/** A paper's time for an extra-time group (0 for everyone else): its start, and only the room's pauses. */
export function paperTiming(exam: Exam, paper: Paper, extra: number, now: number): Timing | null {
  if (paper.start === null) return null
  return timing(paper.start, allowed(paper.minutes, extra), exam.roomPauses, now)
}

/** A listed candidate's own time: their start, their extra time, their breaks, and the room's pauses. */
export function candidateTiming(exam: Exam, candidate: Candidate, now: number): Timing | null {
  const paper = exam.papers.find((p) => p.id === candidate.paperId)
  if (!paper) return null
  const start = candidate.start ?? paper.start
  if (start === null) return null
  return timing(start, allowed(paper.minutes, candidate.extra), [...candidate.breaks, ...exam.roomPauses], now)
}

/** The time to show for a finish: rounded up to the whole minute, so nobody is ever told to stop early. */
export function shownFinish(finish: number): number {
  return Math.ceil(finish / MINUTE) * MINUTE
}

/** The time to show for a start: the minute it happened in. */
export function shownStart(start: number): number {
  return Math.floor(start / MINUTE) * MINUTE
}

/** Whether the room is stopped right now. */
export function roomPaused(exam: Exam): boolean {
  return exam.roomPauses.some((p) => p.to === null)
}

/** "1 h 52 min 30 s", "22 min 30 s", "45 s", "0 s": a length of time, to the second. */
export function lengthText(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts = [h > 0 && `${h} h`, m > 0 && `${m} min`, (s > 0 || total === 0) && `${s} s`].filter(Boolean)
  return parts.join(' ')
}

/** "1 h 30 min": a paper's length in minutes. */
export function minutesText(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return [h > 0 && `${h} h`, (m > 0 || h === 0) && `${m} min`].filter(Boolean).join(' ')
}

/** "25%", "12.5%". */
export const percentText = (extra: number) => `${Number(extra.toFixed(2))}%`

/** A paper's length from its hours and minutes fields; null unless whole numbers making 1 minute up to the limit. */
export function lengthFrom(hours: string, minutes: string): number | null {
  const h = hours.trim() === '' ? 0 : Number(hours)
  const m = minutes.trim() === '' ? 0 : Number(minutes)
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || m < 0 || m > 59) return null
  const total = h * 60 + m
  return total >= 1 && total <= LIMITS.minutes ? total : null
}

/** An extra-time percentage as typed ("25", "25%", "12.5"); null unless above 0 and up to the limit. */
export function parseExtra(text: string): number | null {
  const m = text.trim().match(/^(\d{1,3}(?:[.,]\d{1,2})?)\s*%?$/)
  if (!m) return null
  const value = Number(m[1].replace(',', '.'))
  return value > 0 && value <= LIMITS.extra ? value : null
}

/**
 * A clock time on the same day as `day`, from "HH:MM" (as a time field gives it): the start of that minute. Null if
 * it isn't a time.
 */
export function atClock(hhmm: string, day: number): number | null {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  const d = new Date(day)
  d.setHours(h, min, 0, 0)
  return d.getTime()
}

/** Candidate labels used more than once, compared without case or spaces. */
export function repeatedLabels(candidates: readonly Candidate[]): Set<string> {
  const seen = new Map<string, number>()
  for (const c of candidates) {
    const key = labelKey(c.label)
    if (key) seen.set(key, (seen.get(key) ?? 0) + 1)
  }
  return new Set([...seen].filter(([, n]) => n > 1).map(([key]) => key))
}

export const labelKey = (label: string) => label.replace(/\s+/g, '').toLowerCase()

// Saved data is read leniently: anything unreadable is dropped or replaced, so one damaged entry can't stop the page.

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
/** A date can show about 275,000 years either way; anything near that edge is treated as missing. */
const time = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 8.6e15 ? v : null)
const id = (v: unknown, fallback: () => string) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : fallback())

function pauses(v: unknown): Pause[] {
  if (!Array.isArray(v)) return []
  const out: Pause[] = []
  for (const p of v.slice(0, LIMITS.pauses)) {
    const from = time(p?.from)
    if (from === null) continue
    const to = p?.to === null ? null : time(p?.to)
    if (to === null && p?.to !== null) continue
    if (to !== null && to < from) continue
    out.push({ from, to })
  }
  // At most one can still be open: the latest.
  const open = out.filter((p) => p.to === null)
  return open.length <= 1 ? out : out.filter((p) => p.to !== null || p === open[open.length - 1])
}

function extraValue(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= LIMITS.extra ? Math.round(v * 100) / 100 : null
}

export function sanitizeExam(data: unknown, newId: () => string): Exam {
  if (!data || typeof data !== 'object') return EMPTY_EXAM
  const d = data as Record<string, unknown>
  const papers: Paper[] = []
  for (const p of (Array.isArray(d.papers) ? d.papers : []).slice(0, LIMITS.papers)) {
    const minutes = p?.minutes
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > LIMITS.minutes) continue
    const values: number[] = (Array.isArray(p?.extra) ? (p.extra as unknown[]) : []).map(extraValue).filter((x): x is number => x !== null)
    const extra = [...new Set(values)].sort((a, b) => a - b).slice(0, 6)
    let paperId = id(p?.id, newId)
    if (papers.some((q) => q.id === paperId)) paperId = newId()
    papers.push({ id: paperId, title: text(p?.title, LIMITS.title), minutes, extra, start: time(p?.start) })
  }
  const candidates: Candidate[] = []
  for (const c of (Array.isArray(d.candidates) ? d.candidates : []).slice(0, LIMITS.candidates)) {
    const paperId = typeof c?.paperId === 'string' ? c.paperId : ''
    if (!papers.some((p) => p.id === paperId)) continue
    let candidateId = id(c?.id, newId)
    if (candidates.some((q) => q.id === candidateId)) candidateId = newId()
    candidates.push({
      id: candidateId,
      label: text(c?.label, LIMITS.label),
      paperId,
      extra: c?.extra === 0 ? 0 : (extraValue(c?.extra) ?? 0),
      start: time(c?.start),
      breaks: pauses(c?.breaks),
      note: text(c?.note, LIMITS.note),
    })
  }
  return { centre: text(d.centre, LIMITS.centre), room: text(d.room, LIMITS.room), papers, candidates, roomPauses: pauses(d.roomPauses) }
}

export function sanitizeSettings(data: unknown): Settings {
  if (!data || typeof data !== 'object') return DEFAULT_SETTINGS
  const d = data as Record<string, unknown>
  return {
    seconds: d.seconds === true,
    hour12: d.hour12 === true ? true : d.hour12 === false ? false : null,
    showCandidates: d.showCandidates === true,
    dark: d.dark !== false,
  }
}
