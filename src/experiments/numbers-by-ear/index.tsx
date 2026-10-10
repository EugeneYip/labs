import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import {
  defaultLanguage,
  groupVoices,
  isRight,
  makeQuestion,
  markDifferences,
  MODES,
  shownText,
  spokenText,
  voiceLabel,
  type Language,
  type Mode,
  type Question,
} from './model.ts'

// Settings and best streaks. Nothing about individual answers is kept.
const STORAGE_KEY = 'labs:numbers-by-ear'

interface Settings {
  lang: string | null
  voice: string | null
  mode: Mode
  slow: boolean
  /** Longest run of right answers, by `${lang}|${mode}`. */
  best: Record<string, number>
}

const field = 'h-11 w-full min-w-0 cursor-pointer rounded-lg border border-rule bg-paper px-3 text-base text-ink hover:border-dim/60 sm:h-10 sm:text-sm'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** Buttons beside the answer box keep it focused, so a phone's keyboard stays open between numbers. */
const keepFocus = (event: PointerEvent) => event.preventDefault()

/** Experiment #007: listening practice for numbers, years, and prices in another language. */
export default function NumbersByEar() {
  const voices = useVoices()
  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="text-pretty text-dim">
          Train your ear for numbers in a language you’re learning. Your device reads a number out loud, and you type what
          you heard. Prices, years, and big numbers are where most listeners slip.
        </p>
        {voices === 'unsupported' ? (
          <Notice title="This browser can’t read aloud">Try a recent version of Chrome, Safari, Edge, or Firefox.</Notice>
        ) : voices === null ? (
          <p className="mt-8 text-sm text-dim">Looking for voices…</p>
        ) : voices.length === 0 ? (
          <Notice title="No voices found">
            This browser has no voices to read with. Phones, Macs, and Windows and ChromeOS computers come with them; on Linux, a
            speech engine such as eSpeak NG needs to be installed.
          </Notice>
        ) : (
          <Practice languages={groupVoices(voices)} />
        )}
      </div>
    </div>
  )
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="status" className="mt-8 rounded-lg border border-rule p-5">
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 text-sm text-dim">{children}</p>
    </div>
  )
}

/** The browser's voices: null while they load, 'unsupported' without speech at all. */
function useVoices(): SpeechSynthesisVoice[] | 'unsupported' | null {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [voices, setVoices] = useState<SpeechSynthesisVoice[] | null>(() => {
    const list = supported ? speechSynthesis.getVoices() : []
    return list.length ? list : null
  })
  useEffect(() => {
    if (!supported) return
    const update = () => {
      const list = speechSynthesis.getVoices()
      if (list.length) setVoices(list)
    }
    // Older Safari has no events here, and some browsers fill the list without announcing it, so also look again a few times.
    const events = typeof speechSynthesis.addEventListener === 'function'
    if (events) speechSynthesis.addEventListener('voiceschanged', update)
    const timers = [200, 800, 1600, 2500].map((ms) => window.setTimeout(update, ms))
    const giveUp = window.setTimeout(() => setVoices((list) => list ?? []), 3000)
    return () => {
      if (events) speechSynthesis.removeEventListener('voiceschanged', update)
      timers.forEach(clearTimeout)
      clearTimeout(giveUp)
      speechSynthesis.cancel()
    }
  }, [supported])
  return supported ? voices : 'unsupported'
}

type Phase = 'idle' | 'asking' | 'right' | 'wrong'

const MODE_HINTS: Record<Mode, string> = {
  small: 'numbers from 0 to 100',
  hundreds: 'numbers up to 1,000',
  big: 'numbers from 1,000 to a million',
  years: 'years, mostly since 1900',
  prices: 'shop prices in the local currency',
}

function Practice({ languages }: { languages: Language[] }) {
  const [settings, setSettings] = useState(load)
  const [question, setQuestion] = useState<Question | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [typed, setTyped] = useState('')
  const [answered, setAnswered] = useState('')
  const [stats, setStats] = useState({ right: 0, total: 0, streak: 0 })
  const [review, setReview] = useState<Question[]>([])
  const [speaking, setSpeaking] = useState(false)
  // The last number wasn't heard: the voice failed, as a voice that needs the internet does offline.
  const [silent, setSilent] = useState(false)
  const sinceReview = useRef(0)
  const advance = useRef(0)
  const utterance = useRef<SpeechSynthesisUtterance | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const language = useMemo(() => {
    const fallback = defaultLanguage(languages, navigator.language)
    return languages.find((l) => l.lang === settings.lang) ?? languages.find((l) => l.lang === fallback) ?? languages[0]
  }, [languages, settings.lang])
  const voice = language.voices.find((v) => v.voiceURI === settings.voice) ?? language.voices[0]
  const bestKey = `${language.lang}|${settings.mode}`
  const best = settings.best[bestKey] ?? 0

  const change = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...next }))
    } catch {
      // Private browsing or full storage: settings just won't be remembered.
    }
  }

  const speak = (q: Question, slower = false) => {
    const chosen = speechSynthesis.getVoices().find((v) => v.voiceURI === voice.voiceURI)
    const u = new SpeechSynthesisUtterance(spokenText(q))
    if (chosen) u.voice = chosen
    u.lang = chosen?.lang ?? q.lang
    u.rate = slower ? 0.6 : settings.slow ? 0.75 : 1
    u.onstart = () => {
      setSpeaking(true)
      setSilent(false)
    }
    u.onend = () => {
      if (utterance.current === u) setSpeaking(false)
    }
    u.onerror = (event) => {
      if (utterance.current !== u) return
      setSpeaking(false)
      // Cutting one number short to say the next is normal; anything else means nothing was heard.
      if (event.error !== 'interrupted' && event.error !== 'canceled') setSilent(true)
    }
    // Keep a reference: some browsers drop events for utterances that get garbage-collected.
    utterance.current = u
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel()
    speechSynthesis.resume()
    speechSynthesis.speak(u)
  }

  const pick = (): Question => {
    if (review.length && sinceReview.current >= 3) {
      sinceReview.current = 0
      return review[0]
    }
    sinceReview.current++
    let q = makeQuestion(settings.mode, language.lang)
    for (let tries = 0; tries < 5 && question && q.value === question.value; tries++) q = makeQuestion(settings.mode, language.lang)
    return q
  }

  const ask = () => {
    clearTimeout(advance.current)
    const q = pick()
    // Render the answer box now, so it can take focus while this still counts as a tap (phones only open the keyboard then).
    flushSync(() => {
      setQuestion(q)
      setTyped('')
      setAnswered('')
      setPhase('asking')
    })
    speak(q)
    input.current?.focus()
  }
  // The timer after a right answer needs the latest state, not the state from when it was set.
  const askRef = useRef(ask)
  askRef.current = ask

  const score = (right: boolean) => {
    const streak = right ? stats.streak + 1 : 0
    setStats({ right: stats.right + (right ? 1 : 0), total: stats.total + 1, streak })
    if (streak > best) change({ best: { ...settings.best, [bestKey]: streak } })
  }

  const check = () => {
    if (!question) return
    // Enter with nothing typed plays the number again.
    if (!typed.trim()) return speak(question)
    const right = isRight(question, typed)
    score(right)
    setAnswered(typed)
    setPhase(right ? 'right' : 'wrong')
    setReview((list) => (right ? list.filter((q) => q !== question) : [...list.filter((q) => q !== question), question].slice(-20)))
    if (right) advance.current = window.setTimeout(() => askRef.current(), 1200)
  }

  const reveal = () => {
    if (!question) return
    score(false)
    setAnswered('')
    setPhase('wrong')
    setReview((list) => [...list.filter((q) => q !== question), question].slice(-20))
  }

  const reset = () => {
    clearTimeout(advance.current)
    speechSynthesis.cancel()
    setQuestion(null)
    setPhase('idle')
    setTyped('')
    setAnswered('')
    setStats({ right: 0, total: 0, streak: 0 })
    setReview([])
    sinceReview.current = 0
  }

  useEffect(() => () => clearTimeout(advance.current), [])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (phase === 'asking') check()
    else ask()
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Language</span>
          <select
            value={language.lang}
            onChange={(e) => {
              change({ lang: e.target.value, voice: null })
              setSilent(false)
              reset()
            }}
            className={field}
          >
            {languages.map((l) => (
              <option key={l.lang} value={l.lang}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Voice</span>
          <select
            value={voice.voiceURI}
            onChange={(e) => {
              change({ voice: e.target.value })
              setSilent(false)
            }}
            disabled={language.voices.length < 2}
            className={`${field} disabled:cursor-default disabled:opacity-60`}
          >
            {language.voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {voiceLabel(v.name)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Practice</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Choice
              key={m.id}
              name="mode"
              checked={settings.mode === m.id}
              onChange={() => {
                change({ mode: m.id })
                reset()
              }}
            >
              {m.label}
            </Choice>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Speed</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <Choice name="speed" checked={!settings.slow} onChange={() => change({ slow: false })}>
            Normal
          </Choice>
          <Choice name="speed" checked={settings.slow} onChange={() => change({ slow: true })}>
            Slow
          </Choice>
        </div>
      </fieldset>

      <section aria-label="Practice" className="mt-8 rounded-2xl border border-rule px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex justify-center">
          <button
            type="button"
            onPointerDown={phase === 'idle' ? undefined : keepFocus}
            onClick={() => (phase === 'idle' || !question ? ask() : speak(question))}
            aria-busy={speaking}
            className={`${primary} h-14 rounded-full px-7 text-base sm:h-14 ${speaking ? 'animate-pulse' : ''}`}
          >
            <SpeakerIcon />
            {phase === 'idle' ? 'Start' : 'Hear it again'}
          </button>
        </div>

        {phase === 'idle' ? (
          <p className="mt-4 text-center text-sm text-pretty text-dim">
            In {language.label}: {MODE_HINTS[settings.mode]}.
          </p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-6 flex max-w-sm gap-2">
            <label htmlFor="answer" className="sr-only">
              The number you heard
            </label>
            <input
              id="answer"
              ref={input}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              inputMode={settings.mode === 'prices' ? 'decimal' : 'numeric'}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
              maxLength={24}
              placeholder="Type what you heard"
              className="h-12 w-full min-w-0 flex-1 rounded-lg border border-rule bg-paper px-3 text-center text-xl text-ink tabular-nums placeholder:text-base placeholder:text-dim hover:border-dim/60"
            />
            <button type="submit" onPointerDown={keepFocus} className={`${primary} h-12 sm:h-12`}>
              {phase === 'asking' ? 'Check' : 'Next'}
            </button>
          </form>
        )}

        <div aria-live="polite" className={phase === 'idle' ? '' : 'mt-5 min-h-16 text-center'}>
          {question && phase === 'right' && (
            <p className="text-lg text-green-800 dark:text-green-300">
              <span className="font-medium">Right:</span> <span className="tabular-nums">{shownText(question)}</span>
            </p>
          )}
          {question && phase === 'wrong' && (
            <>
              <p className="text-dim">
                It was{' '}
                <span className="text-2xl font-semibold text-ink tabular-nums">
                  {markDifferences(question, answered).map((piece, i) =>
                    piece.wrong ? (
                      <span key={i} className="text-red-700 underline decoration-2 underline-offset-4 dark:text-red-400">
                        {piece.text}
                      </span>
                    ) : (
                      piece.text
                    ),
                  )}
                </span>
              </p>
              <p className="mt-1 text-sm text-dim">{answered ? `You typed ${answered.trim()}` : 'It will come back in a few numbers.'}</p>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-1">
          {question && phase === 'asking' && (
            <>
              <button type="button" onPointerDown={keepFocus} onClick={() => speak(question, true)} className={quiet}>
                Slower
              </button>
              <button type="button" onPointerDown={keepFocus} onClick={reveal} className={quiet}>
                Show answer
              </button>
            </>
          )}
          {question && phase === 'wrong' && (
            <button type="button" onPointerDown={keepFocus} onClick={() => speak(question, true)} className={quiet}>
              Hear it slowly
            </button>
          )}
        </div>
        {silent && (
          <p role="status" className="mt-4 text-center text-sm text-pretty text-red-700 dark:text-red-400">
            The voice didn’t speak. Try again, or choose another voice: some voices need an internet connection.
          </p>
        )}
      </section>

      <p className="mt-4 text-center text-sm text-dim tabular-nums">
        {stats.total > 0 ? `${stats.right} of ${stats.total} right · streak ${stats.streak}` : phase === 'idle' ? '' : 'Press Enter with the box empty to hear the number again.'}
        {best > 0 && (stats.total > 0 ? ` · best ${best}` : phase === 'idle' ? `Best streak so far: ${best}` : ` Best streak so far: ${best}.`)}
      </p>
      {review.length > 0 && (
        <p className="mt-1 text-center text-sm text-dim">
          {review.length === 1 ? 'One missed number comes' : `${review.length} missed numbers come`} back for another try.
        </p>
      )}

      <p className="mt-10 text-sm text-pretty text-dim">
        The voices come with your device or browser, so the languages on offer and how natural they sound depend on it. A voice
        can still misread a price or a year; the written answer after each number is always right. More voices can usually be
        added in the system’s speech or accessibility settings. No sound? Check the volume, and on an iPhone, that silent mode is
        off.
      </p>
    </>
  )
}

function Choice({ name, checked, onChange, children }: { name: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="inline-flex h-11 items-center rounded-full border border-rule px-4 text-sm transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink hover:border-dim/60 sm:h-10">
        {children}
      </span>
    </label>
  )
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

function load(): Settings {
  const fallback: Settings = { lang: null, voice: null, mode: 'small', slow: false, best: {} }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data || typeof data !== 'object') return fallback
    const text = (v: unknown) => (typeof v === 'string' && v.length < 300 ? v : null)
    const best: Record<string, number> = {}
    if (data.best && typeof data.best === 'object')
      for (const [key, n] of Object.entries(data.best)) if (typeof n === 'number' && Number.isInteger(n) && n > 0 && key.length < 100) best[key] = n
    return {
      lang: text(data.lang),
      voice: text(data.voice),
      mode: MODES.some((m) => m.id === data.mode) ? data.mode : 'small',
      slow: data.slow === true,
      best,
    }
  } catch {
    return fallback
  }
}
