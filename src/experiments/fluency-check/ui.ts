import { useEffect, useState } from 'react'

export const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 aria-invalid:border-red-600 sm:text-sm dark:aria-invalid:border-red-400'
export const field = `${control} h-11 w-full sm:h-10`
export const area = `${control} w-full py-2 leading-relaxed`
export const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
export const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80 disabled:hover:bg-ink`
export const outline = `${button} border border-rule hover:bg-ink/5`
export const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** Updates every `ms` while `active`, for clocks. */
export function useNow(active: boolean, ms = 200): number {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [active, ms])
  return now
}

/** Keeps the screen on while `active`, where the browser allows it, so a phone doesn't lock mid-check. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let closed = false
    const request = async () => {
      if (document.visibilityState !== 'visible' || (lock && !lock.released)) return
      try {
        lock = await navigator.wakeLock.request('screen')
        if (closed) void lock.release()
      } catch {
        // Refused (low battery, or not allowed here): the check still works.
      }
    }
    void request()
    document.addEventListener('visibilitychange', request)
    return () => {
      closed = true
      document.removeEventListener('visibilitychange', request)
      void lock?.release()
    }
  }, [active])
}

// Sound: a short tone made on the spot when the minute is up.

let audio: AudioContext | null = null

/** Browsers only allow sound after a tap, so this runs from the Start button. */
export function unlockSound() {
  try {
    audio ??= new AudioContext()
    void audio.resume()
  } catch {
    // No Web Audio: the screen still says when time is up.
  }
}

export function beep() {
  if (!audio || audio.state !== 'running') return
  const start = audio.currentTime + 0.02
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45)
  osc.connect(gain).connect(audio.destination)
  osc.start(start)
  osc.stop(start + 0.5)
}

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const fullDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const dayMonth = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
export const whenText = (at: number) => dateTime.format(at)
export const dateText = (at: number) => fullDate.format(at)
/** Sep 22, with the year only when it isn't this year. */
export const shortDate = (at: number) => (new Date(at).getFullYear() === new Date().getFullYear() ? dayMonth : fullDate).format(at)
