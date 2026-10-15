// Holiday Pay Average: "a week's pay" for holiday, for a worker whose pay or hours vary, in Great Britain.
//
// The Working Time Regulations 1998, reg 16, apply the Employment Rights Act 1996, ss.221–224, to holiday pay: the
// calculation date is the first day of the leave; a week ends on Saturday, unless the worker is paid weekly by weeks
// ending on another day; the reference period is the 52 weeks ending with the week that ends on the calculation date
// if it is a week's last day, otherwise with the last complete week before it; weeks that don't count are skipped and
// earlier weeks brought in, but nothing before the 104 weeks ending with that same week; fewer weeks if the worker
// hasn't been employed for 52 complete weeks. Three ways of working out a week's pay:
//   'none'    no normal working hours (s.224): the average weekly pay of the weeks used; paid holiday weeks count.
//   'varies'  normal hours, but pay varies with the work (ss.221(3), 222, 223): the average hourly rate of the weeks
//             used (pay for work over hours worked; holiday weeks left out) times the normal weekly hours, or for
//             hours that vary by rota, times the average weekly hours of the weeks used.
//   'basic'   normal hours and set basic pay, with extras (s.221(2) and reg 16(3ZA)–(3ZG)): the basic weekly pay plus
//             the average weekly extras of the weeks used. For the 4 weeks of reg 13; basic pay is the minimum for the
//             1.6 weeks of reg 13A.
// Weeks left out under any method: no work and no pay; off sick for any of the week; statutory family leave (ERA
// Parts 8 and 8B: maternity, paternity, adoption, shared parental, parental bereavement, neonatal care, unpaid
// parental, carer's); unpaid leave; before the worker was employed. GOV.UK's and Acas's guidance is followed where it's
// specific; where the regulations leave a choice, the page says which reading it took (paying more than the minimum is
// lawful; less is a deduction from wages).
// Money is whole pence, hours whole seconds; every sum is exact, and only the result is rounded (to the penny, half up).

export type Method = 'none' | 'varies' | 'basic'
export type Happened = 'worked' | 'holiday' | 'nowork' | 'sick' | 'family' | 'unpaid' | 'before'

export const HAPPENED: readonly { id: Happened; label: string }[] = [
  { id: 'worked', label: 'Worked' },
  { id: 'holiday', label: 'Paid holiday' },
  { id: 'nowork', label: 'No work, no pay' },
  { id: 'sick', label: 'Off sick (any of the week)' },
  { id: 'family', label: 'Family leave (any of the week)' },
  { id: 'unpaid', label: 'Unpaid leave' },
  { id: 'before', label: 'Not employed yet' },
]

/** What the worker did in one week, and the figures for it as typed. Kept under the week's last day. */
export interface WeekEntry {
  happened: Happened
  /** Gross pay for the week (for 'basic', the extras only), as typed. */
  pay: string
  /** Hours worked in the week, as typed. */
  hours: string
}

export interface Working {
  /** A name or reference for the worker, if wanted; only printed. */
  worker: string
  /** The first day of the leave, YYYY-MM-DD. */
  leave: string
  /** The day a week ends on, 0 Sunday to 6 Saturday. */
  weekEnd: number
  method: Method
  /** 'varies': the normal weekly hours, as typed; ignored when `rota`. */
  normalHours: string
  /** 'varies': normal hours differ from week to week (a rota), so their average is used. */
  rota: boolean
  /** 'basic': the basic weekly pay, as typed. */
  basic: string
  /** 'basic': count paid holiday weeks in the extras' average (the lower reading). */
  countHoliday: boolean
  /** An irregular-hours or part-year worker (reg 15F), whose leave is all under reg 15B: one week's pay for all of
   * it (no 1.6 weeks at basic pay), and the rate for an hour of leave of reg 16(1A). */
  inHours: boolean
  /** The first day of employment, YYYY-MM-DD, or ''. Weeks before the first complete week are 'before'. */
  employedFrom: string
  weeks: Record<string, WeekEntry>
}

export const WEEKS_BACK = 104
export const WEEKS_USED = 52
/** Leave before this date fell under older rules (reg 16(3ZA)–(3ZG) and reg 15B came in from 2024). */
export const EARLIEST_LEAVE = '2024-01-01'
export const STORAGE_KEY = 'labs:holiday-pay-average'

export function emptyWorking(): Working {
  return { worker: '', leave: '', weekEnd: 6, method: 'none', normalHours: '', rota: false, basic: '', countHoliday: false, inHours: false, employedFrom: '', weeks: {} }
}

// --- Dates: calendar days counted from 1 January 1970, in UTC, so clock changes never move a week.

const DAY_MS = 86_400_000
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

/** The day number of a YYYY-MM-DD date, or null if it isn't a real date. */
export function dayOf(iso: string): number | null {
  const m = ISO.exec(iso)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const t = Date.UTC(y, mo - 1, d)
  const back = new Date(t)
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d || y < 1900 || y > 2200) return null
  return Math.round(t / DAY_MS)
}

export function isoOf(day: number): string {
  return new Date(day * DAY_MS).toISOString().slice(0, 10)
}

/** 0 Sunday to 6 Saturday. 1 January 1970 was a Thursday. */
export function weekdayOf(day: number): number {
  return (((day + 4) % 7) + 7) % 7
}

/** The last day of the reference period's newest week: the leave's first day if it ends a week, otherwise the last
 * day of the last complete week before it. */
export function periodEndOf(leave: string, weekEnd: number): string | null {
  const d = dayOf(leave)
  if (d === null) return null
  const back = (weekdayOf(d) - weekEnd + 7) % 7
  return isoOf(back === 0 ? d : d - back)
}

/** The last days of the 104 weeks counted back from the newest week's last day. */
export function weekEndsFrom(end: string): string[] {
  const e = dayOf(end)
  if (e === null) return []
  return Array.from({ length: WEEKS_BACK }, (_, i) => isoOf(e - 7 * i))
}

const MONTH_FULL = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
/** A clock time after a date, as spreadsheets export one: "00:00", "12:30:00", "9:00 am". Nothing else may follow. */
const TIME = String.raw`(?:[ t]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?: ?[ap]m)?)?`
const ISO_DATE = new RegExp(String.raw`^(\d{4})-(\d{1,2})-(\d{1,2})${TIME}$`)
const NUMERIC_DATE = new RegExp(String.raw`^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})${TIME}$`)

/** A month's number from its name or abbreviation ("oct", "sept", "october"), or 0. */
function monthOf(word: string): number {
  const w = word.replace(/\.$/, '')
  if (w.length < 3) return 0
  const i = MONTH_FULL.findIndex((m) => m.startsWith(w))
  return i + 1
}

/** A date as people type or export it in the UK: 2020-10-24, 24/10/2020, 24/10/20, 24.10.2020, 24-10-2020,
 * 24-Oct-20, 24 Oct 2020, Saturday 24 October 2020, 24th October 2020, Oct 24, 2020, "w/e 24/10/2020", with a clock
 * time after it at most. Day before month when both are numbers. Anything else after the date makes it not a date. */
export function parseDate(text: string): string | null {
  let t = text.trim().toLowerCase().replace(/,/g, ' ').replace(/\s+/g, ' ')
  t = t.replace(/^(w\/e|w\.e\.|week ending|wk ending|we)\s*:?\s+/, '').replace(/^(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s+/, '')
  if (!t) return null
  let y: number, mo: number, d: number
  let m: RegExpExecArray | null
  if ((m = ISO_DATE.exec(t))) {
    ;[y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  } else if ((m = NUMERIC_DATE.exec(t))) {
    ;[d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])]
    if (m[3].length === 2) y += 2000
  } else if ((m = /^(\d{1,2})(?:st|nd|rd|th)?[ -]([a-z]{3,9}\.?)[ -](\d{2}|\d{4})$/.exec(t)) && monthOf(m[2])) {
    ;[d, mo, y] = [Number(m[1]), monthOf(m[2]), Number(m[3])]
    if (m[3].length === 2) y += 2000
  } else if ((m = /^([a-z]{3,9}\.?) (\d{1,2})(?:st|nd|rd|th)? (\d{4})$/.exec(t)) && monthOf(m[1])) {
    ;[mo, d, y] = [monthOf(m[1]), Number(m[2]), Number(m[3])]
  } else return null
  const iso = `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return dayOf(iso) === null ? null : iso
}

// --- Figures as typed.

export type Parsed = { ok: true; value: number } | { ok: false; error: string } | null

const MAX_PENCE = 100_000_000 // £1,000,000 in a week
const MAX_SECONDS = 168 * 3600 // every hour of a week

/** Pounds and pence: 300, 300.5, 1,234.56, £1 234.56. Null when blank. */
export function parseMoney(text: string): Parsed {
  const t = text.trim()
  if (!t) return null
  const s = t.replace(/^£\s*/, '').replace(/(\d)[ ,](?=\d{3}(\D|$))/g, '$1').replace(/^£/, '')
  if (/^[-−–]/.test(s) || /^\(.*\)$/.test(s)) return { ok: false, error: 'can’t be less than nothing' }
  const m = /^(\d+)(?:\.(\d{0,2}))?$/.exec(s)
  if (!m) return { ok: false, error: /^\d+\.\d{3,}$/.test(s) ? 'has more than two decimal places' : 'isn’t an amount of money' }
  const pence = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'))
  if (!Number.isSafeInteger(pence) || pence > MAX_PENCE) return { ok: false, error: 'is more than £1,000,000' }
  return { ok: true, value: pence }
}

/** Hours: 37.5, 37.25, 37:30, 37:30:00, 37h, 37 hrs, 37.5 hours, 37h30, 37h 30m. Kept in seconds. Null when blank. */
export function parseHours(text: string): Parsed {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/\s*(hours?|hrs?|h)$/, '')
    .replace(/^(\d+:\d{1,2}):00$/, '$1')
  if (!t) return null
  if (/^[-−–]/.test(t)) return { ok: false, error: 'can’t be less than nothing' }
  let seconds: number
  let m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(t)
  if (m) {
    seconds = Number(m[1]) * 3600 + Number((m[2] ?? '').padEnd(2, '0')) * 36
  } else if ((m = /^(\d+)(?::|h\s*)(\d{1,2})\s*(?:m(?:ins?)?)?$/.exec(t)) && Number(m[2]) < 60) {
    seconds = Number(m[1]) * 3600 + Number(m[2]) * 60
  } else {
    return { ok: false, error: /^\d+\.\d{3,}$/.test(t) ? 'has more than two decimal places' : 'isn’t a number of hours' }
  }
  if (seconds > MAX_SECONDS) return { ok: false, error: 'is more than the 168 hours in a week' }
  return { ok: true, value: seconds }
}

// --- Exact fractions, for averages that are only rounded at the end.

export interface Fraction {
  num: bigint
  den: bigint
}

export function frac(num: number | bigint, den: number | bigint): Fraction {
  return { num: BigInt(num), den: BigInt(den) }
}

/** Rounded to a whole number, halves up (the figures here are never negative). */
export function roundHalfUp(f: Fraction): number {
  return Number((2n * f.num + f.den) / (2n * f.den))
}

/** A fraction of pence as pounds, to the penny (rounded half up), with thousands separated. */
export function pounds(pence: number): string {
  const p = Math.round(pence)
  const whole = Math.floor(p / 100)
  return `£${whole.toLocaleString('en-GB')}.${String(p % 100).padStart(2, '0')}`
}

/** The unrounded figure in pounds to four decimal places (the fourth rounded half up): £231.5385. */
export function poundsExact(f: Fraction): string {
  const q = (2n * f.num * 100n + f.den) / (2n * f.den) // hundredths of a penny
  const whole = q / 10_000n
  const rest = (q % 10_000n).toString().padStart(4, '0')
  return `£${Number(whole).toLocaleString('en-GB')}.${rest}`
}

/** Hours as entered: 37.5 or 37.25 when they're whole hundredths of an hour, otherwise 37:20 (or 37:20:30). */
export function hoursText(seconds: number): string {
  if (seconds % 36 === 0) {
    const h = seconds / 3600
    return Number.isInteger(h) ? String(h) : h.toFixed(2).replace(/0$/, '')
  }
  const hh = Math.floor(seconds / 3600)
  const mm = Math.floor((seconds % 3600) / 60)
  const ss = seconds % 60
  return `${hh}:${String(mm).padStart(2, '0')}${ss ? `:${String(ss).padStart(2, '0')}` : ''}`
}

// --- The calculation.

export type Fate = 'used' | 'skipped' | 'waiting' | 'unused' | 'before'

export interface Row {
  /** 1 for the newest week. */
  n: number
  start: string
  end: string
  happened: Happened
  pay: Parsed
  hours: Parsed
  fate: Fate
  /** Why a week was skipped, or what's missing. */
  reason: string
}

export interface Result {
  /** 'final': a figure; 'waiting': a figure that a week needed is missing; 'none': no week to use; 'invalid': fix the settings first. */
  status: 'final' | 'waiting' | 'none' | 'invalid'
  problems: string[]
  /** The reference period's newest week's last day, and the 104th week's first day. */
  end: string
  limit: string
  rows: Row[]
  waitingFor: Row | null
  used: number
  /** Pay (or extras) and hours worked, summed over the weeks used. */
  totalPay: number
  totalHours: number
  /** Hours of the weeks used are all known (needed for any hourly figure). */
  hoursKnown: boolean
  /** A week's pay for the 4 weeks of reg 13 (and all leave for 'none' and 'varies'), exact and rounded. */
  weekPay: Fraction | null
  weekPayPence: number | null
  /** 'basic': the basic weekly pay, the minimum for the 1.6 weeks of reg 13A; and the extras' weekly average. */
  basicPence: number | null
  extras: Fraction | null
  /** 'varies': the average hourly rate (pence per hour), and the hours a week it's multiplied by. */
  averageRate: Fraction | null
  weeklyHours: Fraction | null
  /** reg 16(1A): the week's pay over the average weekly hours worked in the weeks used (pence per hour). */
  hourlyRate: Fraction | null
  /** The oldest and newest days of the weeks used. */
  from: string | null
  to: string | null
  /** Things to say beside the figure (fewer weeks, the readings chosen, and so on). */
  notes: string[]
}

const SKIP: Record<Exclude<Happened, 'worked' | 'holiday' | 'before'>, string> = {
  nowork: 'no work and no pay',
  sick: 'off sick',
  family: 'family leave',
  unpaid: 'unpaid leave',
}

function entryFor(w: Working, end: string): WeekEntry {
  const e = w.weeks[end]
  return e ?? { happened: 'worked', pay: '', hours: '' }
}

/** The working for a week's pay. `earliest` is the first leave date the rules here are for (tests pass an earlier one
 * to run GOV.UK's 2020 and 2021 examples, which the rules since 2024 work out the same way). */
export function calculate(w: Working, earliest = EARLIEST_LEAVE): Result {
  const problems: string[] = []
  const leaveDay = dayOf(w.leave)
  const empty: Result = { status: 'invalid', problems, end: '', limit: '', rows: [], waitingFor: null, used: 0, totalPay: 0, totalHours: 0, hoursKnown: false, weekPay: null, weekPayPence: null, basicPence: null, extras: null, averageRate: null, weeklyHours: null, hourlyRate: null, from: null, to: null, notes: [] }
  if (leaveDay === null) {
    problems.push(w.leave ? 'The first day of the leave isn’t a real date.' : 'Enter the first day of the leave.')
    return empty
  }
  if (w.leave < earliest) problems.push('This page uses the rules for leave from 1 January 2024. Earlier leave was worked out under older rules (the 52 weeks came in on 6 April 2020; the regular payments rule on 1 January 2024).')
  const employed = w.employedFrom ? dayOf(w.employedFrom) : null
  if (w.employedFrom && employed === null) problems.push('The first day of employment isn’t a real date.')
  if (employed !== null && employed > leaveDay) problems.push('The first day of employment is after the leave starts.')
  const normal = w.method === 'varies' && !w.rota ? parseHours(w.normalHours) : null
  if (w.method === 'varies' && !w.rota) {
    if (!normal) problems.push('Enter their normal weekly hours (or say their hours change from week to week).')
    else if (!normal.ok) problems.push(`Their normal weekly hours ${normal.error}.`)
    else if (normal.value === 0) problems.push('Their normal weekly hours can’t be 0.')
  }
  const basic = w.method === 'basic' ? parseMoney(w.basic) : null
  if (w.method === 'basic') {
    if (!basic) problems.push('Enter their basic weekly pay.')
    else if (!basic.ok) problems.push(`Their basic weekly pay ${basic.error}.`)
  }

  // Hours matter only where a figure uses them: the hourly rate of 'varies', and the hour of leave.
  const hoursUsed = w.method === 'varies' || w.inHours
  const end = periodEndOf(w.leave, w.weekEnd)!
  const ends = weekEndsFrom(end)
  const limit = isoOf(dayOf(ends[ends.length - 1])! - 6)
  const rows: Row[] = []
  let used = 0
  let totalPay = 0
  let totalHours = 0
  let hoursKnown = true
  let waitingFor: Row | null = null
  let stopped = false
  let reachedBefore = false
  let oldestUsed: string | null = null
  let newestUsed: string | null = null

  for (let i = 0; i < ends.length; i++) {
    const weekEndDay = dayOf(ends[i])!
    const start = isoOf(weekEndDay - 6)
    const e = entryFor(w, ends[i])
    const notEmployed = reachedBefore || e.happened === 'before' || (employed !== null && weekEndDay - 6 < employed)
    const row: Row = { n: i + 1, start, end: ends[i], happened: notEmployed ? 'before' : e.happened, pay: parseMoney(e.pay), hours: parseHours(e.hours), fate: 'unused', reason: '' }
    rows.push(row)
    if (notEmployed) {
      reachedBefore = true
      row.fate = 'before'
      row.reason = 'not employed for the whole week'
      continue
    }
    if (stopped) {
      row.reason = used >= WEEKS_USED ? 'not needed: 52 weeks found' : 'not reached'
      continue
    }
    const h = row.happened
    if (h === 'nowork' || h === 'sick' || h === 'family' || h === 'unpaid') {
      row.fate = 'skipped'
      row.reason = SKIP[h]
      // Pay typed in a week marked as without pay is a contradiction to check, not a figure to use.
      if ((h === 'nowork' || h === 'unpaid') && row.pay?.ok && row.pay.value > 0) row.reason += `, though ${pounds(row.pay.value)} is entered: check it`
      continue
    }
    // 'worked' or 'holiday'
    if (w.method === 'varies' && h === 'holiday') {
      row.fate = 'skipped'
      row.reason = 'holiday: no hours worked'
      continue
    }
    if (w.method === 'basic' && h === 'holiday' && !w.countHoliday) {
      row.fate = 'skipped'
      row.reason = 'holiday: left out of the extras’ average'
      continue
    }
    const pay = row.pay
    const label = w.method === 'basic' ? 'extras' : 'pay'
    if (pay && !pay.ok) {
      row.fate = 'waiting'
      row.reason = `the ${label} ${pay.error}`
    } else if (!pay) {
      row.fate = 'waiting'
      row.reason = w.method === 'basic' ? 'no extras entered (enter 0 if there were none)' : 'no pay entered'
    } else if (hoursUsed && h === 'worked' && row.hours && !row.hours.ok) {
      row.fate = 'waiting'
      row.reason = `the hours ${row.hours.error}`
    } else if (w.method === 'varies' && !row.hours) {
      row.fate = 'waiting'
      row.reason = 'no hours entered'
    }
    if (row.fate === 'waiting') {
      waitingFor = row
      stopped = true
      continue
    }
    const pence = (pay as { ok: true; value: number }).value
    // A week of paid holiday has no hours worked, whatever is typed in its hours.
    const secs = h === 'holiday' ? 0 : row.hours && row.hours.ok ? row.hours.value : null
    if (w.method !== 'basic' && pence === 0) {
      row.fate = 'skipped'
      row.reason = 'no pay'
      continue
    }
    if (w.method === 'varies' && secs === 0) {
      row.fate = 'skipped'
      row.reason = 'no hours worked'
      continue
    }
    row.fate = 'used'
    used++
    totalPay += pence
    if (secs !== null) totalHours += secs
    else if (h === 'worked') hoursKnown = false
    oldestUsed = start
    if (newestUsed === null) newestUsed = ends[i]
    if (used >= WEEKS_USED) stopped = true
  }

  const result: Result = { ...empty, problems, end, limit, rows, waitingFor, used, totalPay, totalHours, hoursKnown, from: oldestUsed, to: newestUsed }
  if (problems.length) {
    result.status = 'invalid'
    return result
  }
  if (waitingFor) {
    result.status = 'waiting'
    return result
  }
  if (used === 0 && w.method === 'basic') {
    // A week's pay under s.221(2) is the basic pay, which needs no weeks; only the extras' average does.
    const b = (basic as { ok: true; value: number }).value
    result.status = 'final'
    result.basicPence = b
    result.extras = frac(0, 1)
    result.weekPay = frac(b, 1)
    result.weekPayPence = b
    result.notes.push('There’s no week with extras to average yet, so the week’s pay is the basic pay. If they regularly earn extras, the regulations ask for an amount that fairly represents them (reg 16(3A)), for example from comparable workers.')
    return result
  }
  if (used === 0) {
    result.status = 'none'
    result.notes.push('There’s no week to work from. The regulations then ask for an amount that fairly represents a week’s pay, considering what the worker is paid for the job and what comparable workers get (reg 16(3A)).')
    return result
  }
  result.status = 'final'
  const N = BigInt(used)
  if (w.method === 'none') {
    result.weekPay = frac(totalPay, N)
  } else if (w.method === 'varies') {
    result.averageRate = frac(BigInt(totalPay) * 3600n, totalHours)
    result.weeklyHours = w.rota ? frac(totalHours, N * 3600n) : frac((normal as { ok: true; value: number }).value, 3600)
    result.weekPay = w.rota ? frac(totalPay, N) : frac(BigInt(totalPay) * BigInt((normal as { ok: true; value: number }).value), totalHours)
  } else {
    const b = (basic as { ok: true; value: number }).value
    result.basicPence = b
    result.extras = frac(totalPay, N)
    result.weekPay = frac(BigInt(b) * N + BigInt(totalPay), N)
  }
  result.weekPayPence = roundHalfUp(result.weekPay)
  if (w.inHours) {
    if (hoursKnown && totalHours > 0) {
      // A ÷ B, with A the week's pay and B the average weekly hours worked in the weeks used: A × 3600N ÷ S.
      result.hourlyRate = { num: result.weekPay.num * 3600n * N, den: result.weekPay.den * BigInt(totalHours) }
    }
  }
  if (used < WEEKS_USED) {
    if (reachedBefore) result.notes.push(`They haven’t been employed for 52 complete weeks with pay that counts, so the ${used} week${used === 1 ? '' : 's'} there ${used === 1 ? 'is' : 'are'} used.`)
    else result.notes.push(`Only ${used} week${used === 1 ? '' : 's'} in the last 104 count${used === 1 ? 's' : ''}, so ${used === 1 ? 'it is' : 'those are'} used.`)
  }
  return result
}

/** Divides a fraction for display: pence per hour → £ per hour, rounded to the penny. */
export function ratePence(f: Fraction): number {
  return roundHalfUp(f)
}

// --- Pasting a column or two from a spreadsheet.

export interface PasteResult {
  /** Figures for each week's last day. Empty when anything in the paste couldn't be read: nothing is filled then. */
  weeks: Map<string, { pay: string; hours: string }>
  /** Why nothing was filled in. */
  problems: string[]
  /** Lines with a date outside the 104 weeks, or beyond the 104th line without dates. */
  outside: number
  /** Lines placed in a week but with no figure in them. */
  empty: number
  lines: number
  /** Which columns of a heading row were read, said in the message: "pay from “Gross pay”". */
  columns: string
}

const MAX_PASTE_LINES = 20_000
/** An amount with thousands separated by commas, which shouldn't be split as if the commas separated columns. */
const GROUPED = /^£?\d{1,3}(,\d{3})+(\.\d{1,2})?$/

function csvSplit(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"'
        i++
      } else quoted = !quoted
    } else if (c === ',' && !quoted) {
      out.push(cur.trim())
      cur = ''
    } else cur += c
  }
  out.push(cur.trim())
  return out
}

/** One pasted line's cells, and whether their positions mean columns (tab-, semicolon-, or comma-separated) or not
 * (typed with spaces, where a date at the start may itself have spaces: "24 Oct 2020 300 25"). Null when commas
 * look like thousands separators outside quotes ("1,000,20"), which can't be read safely. */
function cells(line: string): { cells: string[]; columns: boolean } | null {
  const t = line.trim()
  if (t.includes('\t')) return { cells: t.split('\t').map((c) => c.trim()), columns: true }
  if (t.includes(';')) return { cells: t.split(';').map((c) => c.trim()), columns: true }
  if (t.includes(',')) {
    if (GROUPED.test(t)) return { cells: [t], columns: true }
    const out = csvSplit(t)
    for (let i = 1; i < out.length; i++) if (/^£?\d{1,3}$/.test(out[i - 1]) && /^\d{3}(\.\d{1,2})?$/.test(out[i]) && !/"/.test(t)) return null
    if (out.length > 1) return { cells: out, columns: true }
  }
  const tokens = t.replace(/£\s+/g, '£').split(/\s+/)
  for (let k = Math.min(5, tokens.length); k >= 1; k--) {
    const head = tokens.slice(0, k).join(' ')
    if (parseDate(head) !== null) return { cells: [head, ...tokens.slice(k)], columns: false }
  }
  return { cells: tokens, columns: false }
}

const isFigure = (c: string) => {
  const money = parseMoney(c)
  const hours = parseHours(c)
  return (money !== null && money.ok) || (hours !== null && hours.ok)
}

/** The column a heading row names for a figure: the best-scoring heading, or -1; -2 when two score equally. */
function pick(headings: string[], score: (h: string) => number): number {
  let best = -1
  let top = 0
  let tie = false
  headings.forEach((h, i) => {
    const v = score(h.toLowerCase())
    if (v > top) {
      top = v
      best = i
      tie = false
    } else if (v === top && v > 0) tie = true
  })
  return tie ? -2 : best
}

/**
 * Reads pasted lines of "date, pay, hours", "pay, hours", or "pay". With a date on every line, each line goes to the
 * week that contains its date; without dates, lines fill the weeks in order, newest first or oldest first. A first
 * line of words is a heading row: its date, pay (or, for `want` 'extras', the extras) and hours columns are found by
 * their names, and the message says which were read. Anything that can't be read safely fills in nothing and says
 * why: a cell that is neither a date nor a figure, two lines in one week, an amount split by an unquoted comma, a
 * heading with two columns that could be the pay.
 */
export function readPaste(text: string, ends: string[], order: 'newest' | 'oldest', want: 'pay' | 'extras' = 'pay'): PasteResult {
  const none = (problems: string[], lines: number): PasteResult => ({ weeks: new Map(), problems, outside: 0, empty: 0, lines, columns: '' })
  const numbered = text.split(/\r\n|\r|\n/).map((l, i) => ({ text: l, line: i + 1 })).filter((l) => l.text.trim() !== '')
  if (numbered.length > MAX_PASTE_LINES) return none([`That’s ${numbered.length.toLocaleString('en-GB')} lines; up to ${MAX_PASTE_LINES.toLocaleString('en-GB')} can be read at once.`], numbered.length)
  const rows: { line: number; cells: string[]; columns: boolean }[] = []
  for (const l of numbered) {
    const c = cells(l.text)
    if (!c) return none([`Line ${l.line} has an amount with a comma in it that isn’t in quotes (“${l.text.trim().slice(0, 40)}”), so its columns can’t be told apart. Remove the thousands commas, or copy the cells from the spreadsheet again.`], numbered.length)
    rows.push({ line: l.line, ...c })
  }

  // A heading row: words, and nothing that reads as a date or a figure.
  let dateColumn = -1
  let payColumn = -1
  let hoursColumn = -1
  let columns = ''
  const heading = rows.length > 0 && rows[0].cells.some((c) => /[a-z]/i.test(c)) && !rows[0].cells.some((c) => parseDate(c) !== null || /\d/.test(c))
  if (heading) {
    const h = rows[0].cells
    dateColumn = pick(h, (x) => (/\b(date|week|w\/e|period|ending)\b/.test(x) && !/\b(pay|gross|hours?|hrs)\b/.test(x.replace(/\bpay (date|period)\b/, '')) ? 2 : 0))
    hoursColumn = pick(h, (x) => (/\b(hours?|hrs)\b/.test(x) && !/(holiday|sick|overtime|leave|rate)/.test(x) ? (/worked/.test(x) ? 3 : 2) : 0))
    payColumn =
      want === 'extras'
        ? pick(h, (x) => (/(extra|overtime|commission|bonus|premium)/.test(x) && !/\b(hours?|hrs|rate)\b/.test(x) ? 2 : 0))
        : pick(h, (x) => (/\b(hours?|hrs|date|period|rate)\b/.test(x) ? 0 : /(gross|total)/.test(x) ? 3 : /\b(pay|amount|earnings?|wages?|£)\b|£/.test(x) && !/(basic|holiday|sick|overtime|commission|bonus|net)/.test(x) ? 2 : 0))
    if (payColumn === -2) return none([`The heading row has more than one column that could be the ${want === 'extras' ? 'extras' : 'pay'} (${h.filter((x) => x).join(', ')}). Copy the week’s date and just the one column to use${want === 'extras' ? ', with the week’s extras added together' : ' (the gross pay for the week)'}.`], numbered.length)
    if (hoursColumn === -2) hoursColumn = -1
    if (payColumn === -1 && want === 'extras' && h.length > 1) return none([`The heading row has no column of extras (overtime, commission, bonus): ${h.filter((x) => x).join(', ')}.`], numbered.length)
    const said = [payColumn >= 0 ? `${want === 'extras' ? 'extras' : 'pay'} from “${h[payColumn]}”` : '', hoursColumn >= 0 ? `hours from “${h[hoursColumn]}”` : ''].filter(Boolean)
    columns = said.join(', ')
    rows.shift()
  }
  if (!rows.length) return none(numbered.length ? ['There’s nothing to read below the heading.'] : [], numbered.length)

  const parsed: { line: number; date: string | null; pay: string; hours: string }[] = []
  for (const r of rows) {
    const dateCell = dateColumn >= 0 && parseDate(r.cells[dateColumn] ?? '') !== null ? dateColumn : r.cells.findIndex((c) => parseDate(c) !== null)
    const date = dateCell >= 0 ? parseDate(r.cells[dateCell]) : null
    // A heading's date column must hold dates: one that doesn't read stops the paste rather than leaving the lines to
    // fill the weeks in order.
    if (dateColumn >= 0 && (r.cells[dateColumn] ?? '') !== '' && dateCell !== dateColumn)
      return none([`Line ${r.line}: “${(r.cells[dateColumn] ?? '').slice(0, 40)}” in the date column isn’t a date that can be read. Dates like 10/10/2026, 10-Oct-26, or 10 Oct 2026 are read.`], numbered.length)
    // Every other cell must be a figure, or blank, or a column the heading row didn't ask for.
    const asked = new Set([payColumn, hoursColumn].filter((i) => i >= 0))
    for (let i = 0; i < r.cells.length; i++) {
      const c = r.cells[i]
      if (i === dateCell || c === '' || (heading && !asked.has(i))) continue
      if (!isFigure(c)) return none([`Line ${r.line}: “${c.slice(0, 40)}” is neither a date nor an amount. Dates like 10/10/2026 or 10 Oct 2026 are read, and amounts like 300 or £1,234.56.`], numbered.length)
    }
    let pay = ''
    let hours = ''
    if (heading && (payColumn >= 0 || hoursColumn >= 0)) {
      pay = payColumn >= 0 ? (r.cells[payColumn] ?? '') : (r.cells.find((c, i) => i !== hoursColumn && i !== dateCell && c !== '') ?? '')
      hours = hoursColumn >= 0 ? (r.cells[hoursColumn] ?? '') : ''
    } else if (r.columns) {
      // Positions count: a blank pay cell stays blank rather than letting the hours slide into its place.
      const rest = r.cells.filter((_, i) => i !== dateCell)
      pay = rest[0] ?? ''
      hours = rest[1] ?? ''
    } else {
      const rest = r.cells.filter((c, i) => i !== dateCell && c !== '')
      pay = rest[0] ?? ''
      hours = rest[1] ?? ''
    }
    parsed.push({ line: r.line, date, pay, hours })
  }

  const withDates = parsed.filter((p) => p.date !== null).length
  // An undated column that ends (or starts) with its own total would put the total into a week.
  if (withDates === 0 && parsed.length >= 3) {
    const pence = parsed.map((p) => parseMoney(p.pay))
    if (pence.every((x) => x !== null && x.ok)) {
      const v = pence.map((x) => (x as { ok: true; value: number }).value)
      const sum = v.reduce((a, b) => a + b, 0)
      for (const i of [v.length - 1, 0]) {
        // The total of the others, and well above any of them (a real week can equal two others added up).
        const others = v.filter((_, j) => j !== i)
        let biggest = 0
        for (const x of others) if (x > biggest) biggest = x
        if (Math.abs(sum - 2 * v[i]) <= 1 && v[i] > 0 && v[i] >= 3 * biggest)
          return none([`Line ${parsed[i].line} (${pounds(v[i])}) is the total of the other lines. Nothing was filled in: copy the weeks without the total and paste again.`], numbered.length)
      }
    }
  }
  if (withDates > 0 && withDates < parsed.length) {
    const first = parsed.find((p) => p.date === null)!
    return none([`${withDates} of the ${parsed.length} lines have a date and the others don’t (line ${first.line} doesn’t); give every line a date, or none.`], numbered.length)
  }
  const weeks = new Map<string, { pay: string; hours: string }>()
  let outside = 0
  let empty = 0
  if (withDates === parsed.length) {
    const firstDay = dayOf(ends[ends.length - 1])! - 6
    const lastDay = dayOf(ends[0])!
    const lineOf = new Map<string, number>()
    for (const p of parsed) {
      const d = dayOf(p.date!)!
      if (d < firstDay || d > lastDay) {
        outside++
        continue
      }
      const end = ends[Math.floor((lastDay - d) / 7)]
      if (lineOf.has(end)) return none([`Lines ${lineOf.get(end)} and ${p.line} both fall in the week ending ${longDate(end)}. Nothing was filled in: add them together into one line and paste again.`], numbered.length)
      lineOf.set(end, p.line)
      if (!p.pay && !p.hours) empty++
      else weeks.set(end, { pay: p.pay, hours: p.hours })
    }
  } else {
    const list = order === 'newest' ? parsed : [...parsed].reverse()
    list.forEach((p, i) => {
      if (i >= ends.length) outside++
      else if (!p.pay && !p.hours) empty++
      else weeks.set(ends[i], { pay: p.pay, hours: p.hours })
    })
  }
  return { weeks, problems: [], outside, empty, lines: numbered.length, columns }
}

// --- Words and dates for the page.

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function dayName(n: number): string {
  return DAY_NAMES[n]
}

/** 24 Oct 2020 */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`
}

/** Saturday 24 October 2020 */
export function longDate(iso: string): string {
  const day = dayOf(iso)
  if (day === null) return iso
  const [y, m, d] = iso.split('-').map(Number)
  return `${DAY_NAMES[weekdayOf(day)]} ${d} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${y}`
}

// --- Saving one working in this browser.

const HAPPENED_IDS = new Set<string>(HAPPENED.map((h) => h.id))

export function saveWorking(w: Working): string {
  return JSON.stringify({ v: 1, ...w })
}

/** Reads a saved working back, or null if there's none or it can't be trusted. Weeks with damaged entries are dropped
 * one by one rather than losing them all. */
export function restoreWorking(text: string | null | undefined): Working | null {
  if (!text) return null
  let x: unknown
  try {
    x = JSON.parse(text)
  } catch {
    return null
  }
  if (!x || typeof x !== 'object' || (x as { v?: unknown }).v !== 1) return null
  const o = x as Record<string, unknown>
  const str = (k: string, max = 200) => (typeof o[k] === 'string' ? (o[k] as string).slice(0, max) : '')
  const w = emptyWorking()
  w.worker = str('worker')
  w.leave = dayOf(str('leave', 10)) !== null ? str('leave', 10) : ''
  w.weekEnd = Number.isInteger(o.weekEnd) && (o.weekEnd as number) >= 0 && (o.weekEnd as number) <= 6 ? (o.weekEnd as number) : 6
  w.method = o.method === 'varies' || o.method === 'basic' ? o.method : 'none'
  w.normalHours = str('normalHours', 40)
  w.rota = o.rota === true
  w.basic = str('basic', 40)
  w.countHoliday = o.countHoliday === true
  w.inHours = o.inHours === true
  w.employedFrom = dayOf(str('employedFrom', 10)) !== null ? str('employedFrom', 10) : ''
  const weeks = o.weeks
  if (weeks && typeof weeks === 'object' && !Array.isArray(weeks)) {
    let count = 0
    for (const [k, v] of Object.entries(weeks as Record<string, unknown>)) {
      if (count >= 400) break
      if (dayOf(k) === null || !v || typeof v !== 'object') continue
      const e = v as Record<string, unknown>
      if (typeof e.happened !== 'string' || !HAPPENED_IDS.has(e.happened)) continue
      w.weeks[k] = { happened: e.happened as Happened, pay: typeof e.pay === 'string' ? e.pay.slice(0, 40) : '', hours: typeof e.hours === 'string' ? e.hours.slice(0, 40) : '' }
      count++
    }
  }
  return w
}

/** Keeps only weeks near the reference period (within 156 weeks of its newest week), so moving the leave date about
 * doesn't lose figures but storage doesn't grow without end. */
export function pruned(w: Working): Working {
  const end = periodEndOf(w.leave, w.weekEnd)
  if (!end) return w
  const e = dayOf(end)!
  const weeks: Record<string, WeekEntry> = {}
  for (const [k, v] of Object.entries(w.weeks)) {
    const d = dayOf(k)
    if (d !== null && d <= e + 7 * 52 && d > e - 7 * 156 && (v.pay !== '' || v.hours !== '' || v.happened !== 'worked')) weeks[k] = v
  }
  return { ...w, weeks }
}

/** The weeks' figures moved to a new week-end day, in order, when the day a week ends changes: every week (newer and
 * older than the reference period alike) moves by the same number of days, so each keeps its place. With a leave date,
 * that's the step from the old newest week to the new one; without one, the nearest day of the new kind. */
export function realign(w: Working, weekEnd: number): Working {
  const keys = Object.keys(w.weeks).filter((k) => dayOf(k) !== null)
  if (!keys.length) return { ...w, weekEnd }
  const shift =
    dayOf(w.leave) !== null ? dayOf(periodEndOf(w.leave, weekEnd)!)! - dayOf(periodEndOf(w.leave, w.weekEnd)!)! : ((((weekEnd - w.weekEnd + 3) % 7) + 7) % 7) - 3
  const weeks: Record<string, WeekEntry> = {}
  for (const k of keys) weeks[isoOf(dayOf(k)! + shift)] = w.weeks[k]
  return { ...w, weekEnd, weeks }
}

// --- The spreadsheet of the working.

function csvCell(s: string): string {
  const t = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
}

export function toCsv(w: Working, r: Result): string {
  const label = w.method === 'basic' ? 'Extras (£)' : 'Pay (£)'
  const lines = [['Week', 'From', 'To', 'What happened', label, 'Hours worked', 'Counted', 'Why not'].join(',')]
  for (const row of r.rows) {
    const happened = HAPPENED.find((h) => h.id === row.happened)?.label ?? row.happened
    const pay = row.pay?.ok ? (row.pay.value / 100).toFixed(2) : ''
    // A week of paid holiday has no hours worked, so none are written for it.
    const hours = row.hours?.ok && row.happened !== 'holiday' ? hoursText(row.hours.value) : ''
    const counted = row.fate === 'used' ? 'yes' : 'no'
    lines.push([String(row.n), row.start, row.end, happened, pay, hours, counted, row.fate === 'used' ? '' : row.reason].map(csvCell).join(','))
  }
  return String.fromCharCode(0xfeff) + lines.join('\r\n') + '\r\n'
}
