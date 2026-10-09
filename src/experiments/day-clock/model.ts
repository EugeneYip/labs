/**
 * Day Clock's logic: which part of the day it is, which reminders are
 * showing, and the words the display uses. Times are minutes after midnight
 * on the device's own clock.
 */

export type Part = 'morning' | 'afternoon' | 'evening' | 'night'
export const PARTS: Part[] = ['morning', 'afternoon', 'evening', 'night']

export interface Settings {
  /** When each part of the day begins, in minutes after midnight. */
  starts: Record<Part, number>
  /** The words shown for each part, so they can be in any language. */
  words: Record<Part, string>
  showTime: boolean
  showDate: boolean
  showYear: boolean
  hour12: boolean
  nightColors: boolean
  speak: boolean
  message: string
  reminders: Reminder[]
}

export interface Reminder {
  id: string
  /** Minutes after midnight. */
  at: number
  text: string
  /** How long it stays on screen, in minutes. */
  minutes: number
  /** Days it applies, 0 for Sunday to 6 for Saturday; empty means every day. */
  days: number[]
}

export const DEFAULT_SETTINGS: Settings = {
  starts: { morning: 5 * 60, afternoon: 12 * 60, evening: 17 * 60, night: 21 * 60 },
  words: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' },
  showTime: true,
  showDate: true,
  showYear: true,
  hour12: true,
  nightColors: true,
  speak: false,
  message: '',
  reminders: [],
}

export const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes()

/** The part of the day for a time. Parts run in order around the clock, so night can cross midnight. */
export function partOf(minutes: number, starts: Record<Part, number>): Part {
  const ordered = [...PARTS].sort((a, b) => starts[a] - starts[b])
  let current = ordered[ordered.length - 1]
  for (const p of ordered) if (minutes >= starts[p]) current = p
  return current
}

/** Part-of-day starts that make sense: in order through the day, each at least an hour long. */
export function validStarts(starts: Record<Part, number>): boolean {
  const m = PARTS.map((p) => starts[p])
  if (m.some((v) => !Number.isInteger(v) || v < 0 || v >= 1440)) return false
  return m[0] < m[1] && m[1] < m[2] && m[2] < m[3] && m.every((v, i) => (i ? v - m[i - 1] >= 60 : true)) && 1440 - m[3] + m[0] >= 60
}

/** Reminders on screen now: started within their showing time, on one of their days. Earliest first. */
export function dueReminders(reminders: readonly Reminder[], now: Date): Reminder[] {
  const minutes = minutesOf(now)
  const today = now.getDay()
  const yesterday = (today + 6) % 7
  return reminders
    .filter((r) => {
      const sinceToday = minutes - r.at
      if (sinceToday >= 0 && sinceToday < r.minutes && (!r.days.length || r.days.includes(today))) return true
      // One set late in the evening can still be showing just after midnight.
      const sinceYesterday = minutes + 1440 - r.at
      return sinceYesterday < r.minutes && (!r.days.length || r.days.includes(yesterday))
    })
    .sort((a, b) => a.at - b.at)
}

/** "14:30" to 870, or null. */
export function parseTime(text: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(text.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  return h < 24 && min < 60 ? h * 60 + min : null
}

export const timeValue = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** What a tap reads aloud: "It's Thursday morning, October 9th." in the device's language for the day and date. */
export function spokenText(now: Date, settings: Settings, locale: string): string {
  const day = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now)
  const date = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', ...(settings.showYear ? { year: 'numeric' } : {}) }).format(now)
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: settings.hour12 }).format(now)
  const part = settings.words[partOf(minutesOf(now), settings.starts)]
  const due = dueReminders(settings.reminders, now).map((r) => r.text)
  return [`${day}, ${part.toLocaleLowerCase(locale)}.`, settings.showDate ? `${date}.` : '', settings.showTime ? `${time}.` : '', settings.message, ...due].filter(Boolean).join(' ')
}

/** Settings read back from storage, with anything missing or broken replaced by the defaults. */
export function sanitize(data: unknown): Settings {
  const d = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  const s = { ...DEFAULT_SETTINGS }
  const starts = d.starts as Record<Part, number> | undefined
  if (starts && PARTS.every((p) => typeof starts[p] === 'number') && validStarts(starts)) s.starts = { ...starts }
  const words = d.words as Record<Part, string> | undefined
  if (words && PARTS.every((p) => typeof words[p] === 'string')) s.words = Object.fromEntries(PARTS.map((p) => [p, words[p].slice(0, 30) || DEFAULT_SETTINGS.words[p]])) as Record<Part, string>
  for (const key of ['showTime', 'showDate', 'showYear', 'hour12', 'nightColors', 'speak'] as const) if (typeof d[key] === 'boolean') s[key] = d[key] as boolean
  if (typeof d.message === 'string') s.message = d.message.slice(0, 200)
  if (Array.isArray(d.reminders))
    s.reminders = d.reminders
      .filter((r): r is Reminder => !!r && typeof r === 'object' && typeof r.id === 'string' && Number.isInteger(r.at) && r.at >= 0 && r.at < 1440 && typeof r.text === 'string' && Number.isInteger(r.minutes) && r.minutes >= 5 && r.minutes <= 720 && Array.isArray(r.days) && r.days.every((x: unknown) => Number.isInteger(x) && (x as number) >= 0 && (x as number) <= 6))
      .slice(0, 30)
      .map((r) => ({ ...r, text: r.text.slice(0, 120) }))
  return s
}
