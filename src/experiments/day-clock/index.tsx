import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS, dueReminders, minutesOf, parseTime, partOf, PARTS, sanitize, spokenText, timeValue, validStarts, type Part, type Reminder, type Settings } from './model.ts'

// The caregiver's settings, kept on this device.
const STORAGE_KEY = 'labs:day-clock'
const HOLD_MS = 1500

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 w-full sm:h-10`
// Safari on iPhones draws a time field wider than its box unless its native look is turned off.
const timeField = 'cursor-pointer appearance-none text-left [&::-webkit-date-and-time-value]:text-left'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

const PART_LABELS: Record<Part, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night' }
const DAY_LETTERS = Array.from({ length: 7 }, (_, d) => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(2026, 0, 4 + d)))

/** Experiment #022: a clear day-and-time display for someone living with dementia. */
export default function DayClock() {
  const [settings, setSettings] = useState(load)
  const [editing, setEditing] = useState(false)
  const now = useNow()
  const awake = useWakeLock(!editing)
  const root = useRef<HTMLDivElement>(null)
  const area = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [full, setFull] = useState(false)
  // Everything is sized from the screen; this shrinks it when messages and reminders would run off the bottom.
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const canFull = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen

  const part = partOf(minutesOf(now), settings.starts)
  const night = settings.nightColors && part === 'night'

  // Saved again as each part of the day begins: a browser can clear the data of a page left untouched for weeks, and this puts it back.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...settings }))
    } catch {
      // Private browsing or full storage: settings just won't be remembered.
    }
  }, [settings, part])
  const locale = navigator.language
  const day = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(now)
  const date = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', ...(settings.showYear ? { year: 'numeric' } : {}) }).format(now)
  const time = new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hour12: settings.hour12 }).format(now)
  const due = dueReminders(settings.reminders, now).filter((r) => r.text.trim())
  // A few pixels of drift each minute, so a screen left on for months doesn't wear in the text.
  const drift = (minutesOf(now) % 5) - 2

  const shown = [day, settings.words[part], settings.showDate && date, settings.showTime && time, settings.message, ...due.map((r) => r.text)].join('|')
  useLayoutEffect(() => {
    const box = area.current
    const inner = content.current
    if (!box || !inner) return
    const fitNow = () => {
      const available = box.clientHeight * 0.92
      const needed = inner.scrollHeight
      setScale((s) => {
        const natural = needed / s
        const next = Math.max(0.35, Math.min(1, available / natural))
        return Math.abs(next - s) > 0.01 ? next : s
      })
    }
    fitNow()
    const observer = new ResizeObserver(fitNow)
    observer.observe(box)
    return () => observer.disconnect()
  }, [shown, scale, full, editing])
  const size = (expr: string) => `calc(${scale.toFixed(3)} * ${expr})`

  if (editing) return <SettingsPanel settings={settings} onChange={setSettings} onDone={() => setEditing(false)} awake={awake} />

  const speak = () => {
    if (!settings.speak || !('speechSynthesis' in window)) return
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(spokenText(now, settings, locale))
    u.lang = locale
    u.rate = 0.9
    speechSynthesis.speak(u)
  }

  return (
    <div ref={root} className={`relative flex flex-none flex-col overflow-hidden ${night ? 'bg-black text-amber-200/80' : 'bg-[#fffdf8] text-stone-950'}`} style={{ height: full ? '100dvh' : 'calc(100dvh - 3rem)' }}>
      <div ref={area} className={`flex flex-1 flex-col items-center justify-center overflow-hidden px-[4vw] pt-[3vh] pb-16 text-center ${settings.speak ? 'cursor-pointer' : ''}`} onClick={speak}>
        <div ref={content} className="flex flex-col items-center" style={{ transform: `translate(${drift}px, ${-drift}px)` }}>
          <p className="leading-none font-semibold tracking-tight" style={{ fontSize: size(fit(day, 17, 24)) }}>
            {day}
          </p>
          <p className="leading-none font-medium" style={{ fontSize: size(fit(settings.words[part], 12, 15)), marginTop: size('1.5vh') }}>
            {settings.words[part]}
          </p>
          {settings.showDate && (
            <p className={`leading-tight ${night ? 'opacity-80' : 'text-stone-700'}`} style={{ fontSize: size(fit(date, 7, 8.5)), marginTop: size('4vh') }}>
              {date}
            </p>
          )}
          {settings.showTime && (
            <p className={`leading-tight tabular-nums ${night ? 'opacity-80' : 'text-stone-700'}`} style={{ fontSize: size(fit(time, 8, 10)), marginTop: size('1.5vh') }}>
              {time}
            </p>
          )}
          {/* Reminders are announced to screen readers as they appear; the time isn't, or it would be read out every minute. */}
          <div className="grid max-w-[90vw]" style={settings.message || due.length > 0 ? { fontSize: `max(1rem, ${size('min(4.6vw, 6vh)')})`, marginTop: size('5vh'), gap: size('1.5vh') } : undefined} aria-live="polite">
            {settings.message && (
              <p className={`rounded-2xl px-[3vw] leading-snug text-pretty ${night ? 'bg-amber-200/10' : 'bg-amber-100'}`} style={{ paddingBlock: size('1.5vh') }} dir="auto">
                {settings.message}
              </p>
            )}
            {due.map((r) => (
              <p key={r.id} className={`rounded-2xl px-[3vw] leading-snug font-medium text-pretty ${night ? 'bg-amber-200/15' : 'bg-sky-100'}`} style={{ paddingBlock: size('1.5vh') }} dir="auto">
                {r.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute right-3 bottom-3 flex gap-2 opacity-40 transition-opacity focus-within:opacity-100 hover:opacity-100">
        {canFull && (
          <button
            type="button"
            onClick={() => void (full ? document.exitFullscreen() : root.current?.requestFullscreen())?.catch(() => {})}
            className={`h-10 cursor-pointer rounded-lg px-3 text-sm ${night ? 'bg-white/10' : 'bg-black/5'}`}
          >
            {full ? 'Exit full screen' : 'Full screen'}
          </button>
        )}
        <HoldButton night={night} onOpen={() => setEditing(true)} />
      </div>
    </div>
  )
}

/** Font size that fits the text across the screen: big, but smaller for long words. */
const fit = (text: string, vw: number, vh: number) => `min(${vw}vw, ${vh}vh, ${Math.round((150 / Math.max(6, [...text].length)) * 10) / 10}vw)`

/** Settings open after holding the button, so a tap by accident does nothing. Keyboard users can just press it. */
function HoldButton({ night, onOpen }: { night: boolean; onOpen: () => void }) {
  const [holding, setHolding] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const keyboard = useRef(false)
  const stop = () => {
    clearTimeout(timer.current)
    setHolding(false)
  }
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault()
        keyboard.current = false
        setHolding(true)
        timer.current = window.setTimeout(() => {
          setHolding(false)
          onOpen()
        }, HOLD_MS)
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') keyboard.current = true
      }}
      onClick={() => {
        if (keyboard.current) onOpen()
      }}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative h-10 cursor-pointer touch-none overflow-hidden rounded-lg px-3 text-sm select-none ${night ? 'bg-white/10' : 'bg-black/5'}`}
      aria-label="Settings (press and hold)"
    >
      <span className={`absolute inset-y-0 left-0 ${night ? 'bg-white/20' : 'bg-black/10'}`} style={{ width: holding ? '100%' : '0%', transition: holding ? `width ${HOLD_MS}ms linear` : 'none' }} aria-hidden="true" />
      <span className="relative">{holding ? 'Keep holding…' : 'Settings'}</span>
    </button>
  )
}

function SettingsPanel({ settings, onChange, onDone, awake }: { settings: Settings; onChange: (s: Settings) => void; onDone: () => void; awake: boolean | null }) {
  const set = (patch: Partial<Settings>) => onChange({ ...settings, ...patch })
  const [startText, setStartText] = useState(() => Object.fromEntries(PARTS.map((p) => [p, timeValue(settings.starts[p])])) as Record<Part, string>)
  const parsed = Object.fromEntries(PARTS.map((p) => [p, parseTime(startText[p])])) as Record<Part, number | null>
  const startsOk = PARTS.every((p) => parsed[p] !== null) && validStarts(parsed as Record<Part, number>)
  const editStart = (p: Part, text: string) => {
    const next = { ...startText, [p]: text }
    setStartText(next)
    const values = Object.fromEntries(PARTS.map((q) => [q, parseTime(next[q])])) as Record<Part, number | null>
    if (PARTS.every((q) => values[q] !== null) && validStarts(values as Record<Part, number>)) set({ starts: values as Record<Part, number> })
  }
  const setReminder = (id: string, patch: Partial<Reminder>) => set({ reminders: settings.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)) })

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Day Clock settings</h2>
          <button type="button" onClick={onDone} className={primary}>
            Show the clock
          </button>
        </div>
        <p className="mt-2 max-w-prose text-sm text-pretty text-dim">
          Day Clock shows the day, the time of day, and the date in large, calm type, for someone who loses track of them. Leave it on an old tablet or phone near their chair or bed. Settings stay on this device, and open from the clock by pressing and holding Settings.
        </p>
        {awake === null ? (
          <p className="mt-3 text-sm text-pretty">This browser can’t keep the screen on by itself, so set the device’s screen lock or sleep to “never” and keep it plugged in.</p>
        ) : (
          <p className="mt-3 text-sm text-dim">The screen stays on while the clock is showing. Keep the device plugged in.</p>
        )}

        <Section title="What to show">
          <Check label="The time" checked={settings.showTime} onChange={(showTime) => set({ showTime })} />
          {settings.showTime && <Check label="12-hour time (2:30 PM)" checked={settings.hour12} onChange={(hour12) => set({ hour12 })} />}
          <Check label="The date" checked={settings.showDate} onChange={(showDate) => set({ showDate })} />
          {settings.showDate && <Check label="The year" checked={settings.showYear} onChange={(showYear) => set({ showYear })} />}
          <Check label="Dark, dim colors at night" checked={settings.nightColors} onChange={(nightColors) => set({ nightColors })} />
          <Check label="Read the day and time aloud when the screen is tapped" checked={settings.speak} onChange={(speak) => set({ speak })} />
        </Section>

        <Section title="Times of day" hint="When each part of the day begins, and the word shown for it. Words can be in any language.">
          <div className="grid gap-3 sm:grid-cols-2">
            {PARTS.map((p) => (
              <div key={p} className="grid grid-cols-[minmax(0,1fr)_7.5rem] items-end gap-2">
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium">{PART_LABELS[p]}</span>
                  <input value={settings.words[p]} maxLength={30} onChange={(e) => set({ words: { ...settings.words, [p]: e.target.value } })} onBlur={(e) => !e.target.value.trim() && set({ words: { ...settings.words, [p]: DEFAULT_SETTINGS.words[p] } })} className={field} dir="auto" />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-sm text-dim">Begins</span>
                  <input type="time" value={startText[p]} onChange={(e) => editStart(p, e.target.value)} aria-invalid={!startsOk || undefined} className={`${field} ${timeField} aria-invalid:border-red-600`} />
                </label>
              </div>
            ))}
          </div>
          {!startsOk && <p className="mt-2 text-sm text-red-700 dark:text-red-400">The times need to run in order through the day, with each part lasting at least an hour.</p>}
        </Section>

        <Section title="Message" hint="Shown under the clock all the time, such as who is visiting or where people are.">
          <textarea value={settings.message} maxLength={200} onChange={(e) => set({ message: e.target.value })} rows={2} placeholder="Sarah is coming for lunch on Sunday." className={`${control} w-full py-2`} dir="auto" />
        </Section>

        <Section title="Reminders" hint="Each one appears at its time and stays for a while, every day or on chosen days. Reminders only show on the screen, with no sound, and nothing records whether they were seen, so don’t rely on them alone for medicines.">
          <ul className="grid gap-3">
            {settings.reminders.map((r) => (
              <li key={r.id} className="grid gap-3 rounded-xl border border-rule p-3">
                <div className="flex flex-wrap items-end gap-2">
                  <label className="grid gap-1.5">
                    <span className="text-sm text-dim">At</span>
                    <input type="time" value={timeValue(r.at)} onChange={(e) => parseTime(e.target.value) !== null && setReminder(r.id, { at: parseTime(e.target.value)! })} className={`${control} ${timeField} h-11 sm:h-10`} />
                  </label>
                  <label className="grid min-w-0 flex-1 basis-48 gap-1.5">
                    <span className="text-sm text-dim">Say</span>
                    <input value={r.text} maxLength={120} onChange={(e) => setReminder(r.id, { text: e.target.value })} placeholder="Time for lunch" className={field} dir="auto" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-sm text-dim">Show for</span>
                    <select value={r.minutes} onChange={(e) => setReminder(r.id, { minutes: Number(e.target.value) })} className={`${control} h-11 cursor-pointer sm:h-10`}>
                      {[15, 30, 60, 120, 180, 360].map((m) => (
                        <option key={m} value={m}>
                          {m < 60 ? `${m} minutes` : m === 60 ? '1 hour' : `${m / 60} hours`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Days">
                  <button type="button" aria-pressed={!r.days.length} onClick={() => setReminder(r.id, { days: [] })} className={`h-9 cursor-pointer rounded-md border px-2.5 text-sm ${!r.days.length ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`}>
                    Every day
                  </button>
                  {DAY_LETTERS.map((label, d) => {
                    const on = r.days.includes(d)
                    return (
                      <button key={d} type="button" aria-pressed={on} onClick={() => setReminder(r.id, { days: on ? r.days.filter((x) => x !== d) : [...r.days, d].sort() })} className={`h-9 min-w-11 cursor-pointer rounded-md border px-2 text-sm ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`}>
                        {label}
                      </button>
                    )
                  })}
                  <button type="button" onClick={() => set({ reminders: settings.reminders.filter((x) => x.id !== r.id) })} className={`${quiet} ml-auto h-9 px-3`}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => set({ reminders: [...settings.reminders, { id: newId(), at: 12 * 60, text: '', minutes: 60, days: [] }] })} disabled={settings.reminders.length >= 30} className={`${outline} mt-3`}>
            Add a reminder
          </button>
        </Section>

        <div className="mt-10 flex flex-wrap gap-2">
          <button type="button" onClick={onDone} className={primary}>
            Show the clock
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(DEFAULT_SETTINGS)
              setStartText(Object.fromEntries(PARTS.map((p) => [p, timeValue(DEFAULT_SETTINGS.starts[p])])) as Record<Part, string>)
            }}
            className={quiet}
          >
            Reset all settings
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="mt-8 border-t border-rule pt-6">
      <h3 className="font-semibold">{title}</h3>
      {hint && <p className="mt-1 text-sm text-pretty text-dim">{hint}</p>}
      <div className="mt-3 grid gap-2.5">{children}</div>
    </section>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 cursor-pointer accent-current" />
      {label}
    </label>
  )
}

/** The current time, updated every second. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

/** Keeps the screen on while `active`, asking again when the page comes back into view. Null where the browser can't. */
function useWakeLock(active: boolean): boolean | null {
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

const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

function load(): Settings {
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null'))
  } catch {
    return DEFAULT_SETTINGS
  }
}
