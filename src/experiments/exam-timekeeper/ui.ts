import { useEffect, useState } from 'react'
import type { Settings } from './model.ts'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 aria-invalid:border-red-600 sm:text-sm dark:aria-invalid:border-red-400'
export const field = `${control} h-11 w-full sm:h-10`
// Safari on iPhones draws a time field wider than its box unless its native look is turned off. Focus inside a
// time field's hour or minute doesn't count as :focus-visible, so it gets its own ring.
export const timeField = `${control} h-11 cursor-pointer appearance-none text-left focus:outline-2 focus:outline-offset-2 focus:outline-ink sm:h-10 [&::-webkit-date-and-time-value]:text-left`
export const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
export const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
export const outline = `${button} border border-rule hover:bg-ink/5`
export const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
/** For a candidate on a rest break: it stands out in a long list. */
export const onBreak = `${button} border border-amber-600 bg-amber-100 font-medium text-amber-950 hover:bg-amber-200 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900`

/** Whether this device writes times on a 24-hour clock. */
const device24 = ['h23', 'h24'].includes(new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions().hourCycle ?? '')

// Making a formatter is slow next to using one, and a long list of candidates shows hundreds of times each second.
const formats = new Map<string, Intl.DateTimeFormat>()

function format(settings: Settings, seconds: boolean): Intl.DateTimeFormat {
  // A 24-hour time is written 09:05, as exam boards do, though some browsers would write 9:05.
  const hour12 = settings.hour12 ?? !device24
  const key = `${hour12}-${seconds}`
  let f = formats.get(key)
  if (!f) {
    const hours: Intl.DateTimeFormatOptions = hour12 ? { hour: 'numeric', hour12: true } : { hour: '2-digit', hourCycle: 'h23' }
    f = new Intl.DateTimeFormat(undefined, { ...hours, minute: '2-digit', ...(seconds ? { second: '2-digit' } : {}) })
    formats.set(key, f)
  }
  return f
}

/** "10:53" or "10:53 AM", as the board's settings say. */
export const clockText = (t: number, settings: Settings) => format(settings, false).format(t)

/** "10:52:30": the exact moment, for the invigilator and the record. */
export const exactText = (t: number, settings: Settings) => format(settings, true).format(t)

/** The board's clock: with seconds if chosen. */
export const boardClockText = (t: number, settings: Settings) => format(settings, settings.seconds).format(t)

const dates = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const dateText = (t: number) => dates.format(t)

/** "09:05", the value a time field takes. */
export function fieldTime(t: number): string {
  const d = new Date(t)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** The time now, updated just after each second turns, and at once when the page is shown again. */
export function useNow(): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    let id = 0
    const tick = () => {
      setNow(Date.now())
      id = window.setTimeout(tick, 1020 - (Date.now() % 1000))
    }
    id = window.setTimeout(tick, 1020 - (Date.now() % 1000))
    const onShow = () => setNow(Date.now())
    document.addEventListener('visibilitychange', onShow)
    return () => {
      clearTimeout(id)
      document.removeEventListener('visibilitychange', onShow)
    }
  }, [])
  return now
}

/** Keeps the screen on while `active`, asking again when the page comes back into view. Null where the browser can't. */
export function useWakeLock(active: boolean): boolean | null {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [awake, setAwake] = useState(false)
  useEffect(() => {
    if (!active || !supported) return
    let lock: WakeLockSentinel | null = null
    let closed = false
    const request = async () => {
      if (document.visibilityState !== 'visible' || (lock && !lock.released)) return
      try {
        lock = await navigator.wakeLock.request('screen')
        if (closed) return void lock.release()
        setAwake(true)
        lock.addEventListener('release', () => setAwake(false))
      } catch {
        setAwake(false)
      }
    }
    void request()
    document.addEventListener('visibilitychange', request)
    return () => {
      closed = true
      document.removeEventListener('visibilitychange', request)
      void lock?.release()
    }
  }, [active, supported])
  return supported ? awake : null
}
