import { formatDuration, type Cue, type Plan } from './model.ts'

const control = 'h-11 min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 aria-invalid:border-red-600 sm:h-10 sm:text-sm dark:aria-invalid:border-red-400'
export const field = `${control} w-full`
/** For controls that size to their content, like the serving time. */
export const inline = `${control} cursor-pointer`
export const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
export const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
export const outline = `${button} border border-rule hover:bg-ink/5`
export const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** Bar colors for the timeline, checked for color-blind separation and contrast in both modes. */
export const OVEN = '#ea580c'
export const OTHER = '#78716c'

const clock = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const dayKey = (t: number) => new Date(t).toDateString()

/** 4:30 PM, with the weekday in front when it isn't the day of the meal. */
export function timeLabel(t: number, serveAt: number): string {
  return dayKey(t) === dayKey(serveAt) ? clock.format(t) : `${weekday.format(t)} ${clock.format(t)}`
}

export const clockLabel = (t: number) => clock.format(t)

/** A moment relative to now: "6:20 PM", "6:20 AM tomorrow", or "Sat 6:20 AM". */
export function whenLabel(t: number, now: number): string {
  const days = Math.round((new Date(new Date(t).toDateString()).getTime() - new Date(new Date(now).toDateString()).getTime()) / 86_400_000)
  return days === 0 ? clock.format(t) : days === 1 ? `${clock.format(t)} tomorrow` : `${weekday.format(t)} ${clock.format(t)}`
}

/** "in 12 min", "in 1 h 5 min", or "now". */
export function fromNow(t: number, now: number): string {
  const minutes = Math.ceil((t - now) / 60_000)
  return minutes <= 0 ? 'now' : `in ${formatDuration(minutes)}`
}

export function degrees(temp: number, plan: Plan): string {
  return `${temp}°${plan.unit}`
}

/** What a cue tells the cook, such as "Roast potatoes: Roast at 220°C". */
export function cueText(cue: Cue, plan: Plan): string {
  if (cue.kind === 'serve') return 'Serve'
  if (cue.kind === 'preheat') return `Heat the oven to ${degrees(cue.temp!, plan)}`
  const { dish, step, stepIndex } = cue.slot!
  const what = step.what.trim() || `Step ${stepIndex + 1}`
  return `${dish.name.trim() || 'Untitled dish'}: ${what}${step.oven !== null ? ` at ${degrees(step.oven, plan)}` : ''}`
}

// Sound: a short chime made on the spot, so there's no audio file to load.

let audio: AudioContext | null = null

/** Browsers only allow sound after a tap, so this runs from one. */
export function unlockSound(): boolean {
  try {
    audio ??= new AudioContext()
    void audio.resume()
    return true
  } catch {
    return false
  }
}

/** Whether sound was turned on during this visit; after a reload it needs another tap. */
export const soundUnlocked = () => audio !== null

export function chime() {
  if (!audio || audio.state !== 'running') return
  const t0 = audio.currentTime + 0.05
  for (let i = 0; i < 3; i++) {
    const start = t0 + i * 0.32
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = i === 2 ? 1175 : 880
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28)
    osc.connect(gain).connect(audio.destination)
    osc.start(start)
    osc.stop(start + 0.3)
  }
}
