import { useCallback, useEffect, useMemo, useState } from 'react'
import { cueFor, prompt, segments, spoken, spokenWords, type Item, type Script, type Section } from './model.ts'
import { canSpeak, MINE, outline, primary, quiet, speak, stopSpeaking, toggle } from './ui.ts'

export type Mark = 'got' | 'missed'

/**
 * Cue cards: one of your lines at a time. The cue (what comes before it) is
 * shown, your line is hidden until you've said it, and you mark how it went.
 */
export function Cards({ script, section, roles, lines, marks, onMark, speakCues, onSpeakCues }: { script: Script; section: Section; roles: string[]; lines: number[]; marks: Record<number, Mark>; onMark: (index: number, mark: Mark) => void; speakCues: boolean; onSpeakCues: (on: boolean) => void }) {
  const [queue, setQueue] = useState(lines)
  const [pos, setPos] = useState(0)
  const [shown, setShown] = useState(false)
  const [hint, setHint] = useState(0)
  const [pass, setPass] = useState<Record<number, Mark>>({})

  // A new section, part, or script starts a fresh run.
  const linesKey = lines.join(',')
  const [lastKey, setLastKey] = useState(linesKey)
  if (linesKey !== lastKey) {
    setLastKey(linesKey)
    setQueue(lines)
    setPos(0)
    setShown(false)
    setHint(0)
    setPass({})
  }

  const index = queue[pos]
  const item = index === undefined ? undefined : (script.items[index] as Extract<Item, { kind: 'speech' }>)
  const cue = useMemo(() => (index === undefined ? [] : cueFor(script, roles, index, section.from)), [script, roles, index, section.from])
  const cueText = cue
    .map((i) => script.items[i])
    .filter((c): c is Extract<Item, { kind: 'speech' }> => c.kind === 'speech')
    .slice(-1)
    .map((c) => spoken(c.text))
    .join(' ')

  useEffect(() => {
    if (speakCues && cueText && !shown) speak(cueText)
    return stopSpeaking
  }, [speakCues, cueText, shown, index])

  const reveal = useCallback(() => setShown(true), [])
  const more = useCallback(() => setHint((h) => h + 3), [])
  const mark = useCallback(
    (m: Mark) => {
      if (index === undefined) return
      onMark(index, m)
      setPass((p) => ({ ...p, [index]: m }))
      setPos((p) => p + 1)
      setShown(false)
      setHint(0)
    },
    [index, onMark],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey || index === undefined) return
      const key = e.key.toLowerCase()
      if (key === ' ' && !(target instanceof HTMLButtonElement)) {
        e.preventDefault()
        if (!shown) reveal()
      } else if (key === 'p' && !shown) more()
      else if ((key === 'arrowright' || key === 'g') && shown) mark('got')
      else if ((key === 'arrowleft' || key === 'm') && shown) mark('missed')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, shown, reveal, more, mark])

  const restart = (only?: number[]) => {
    setQueue(only ?? lines)
    setPos(0)
    setShown(false)
    setHint(0)
    setPass({})
  }

  if (!lines.length) return <p className="text-sm text-dim">Your character has no lines in this part of the script.</p>

  const solid = lines.filter((i) => marks[i] === 'got').length
  const missedNow = queue.slice(0, pos).filter((i) => pass[i] === 'missed')

  if (!item) {
    const got = queue.filter((i) => pass[i] === 'got').length
    return (
      <section aria-labelledby="done-heading" className="rounded-2xl border border-rule p-5 sm:p-6">
        <h2 id="done-heading" className="text-xl font-semibold tracking-tight">
          {missedNow.length === 0 ? 'Every line, no misses.' : `${got} of ${queue.length} lines without a miss.`}
        </h2>
        <p className="mt-1 text-sm text-dim">
          {solid} of {lines.length} lines in this part are marked solid.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {missedNow.length > 0 && (
            <button type="button" onClick={() => restart(missedNow)} className={primary}>
              Practice the {missedNow.length === 1 ? 'missed line' : `${missedNow.length} missed lines`}
            </button>
          )}
          <button type="button" onClick={() => restart()} className={missedNow.length ? outline : primary}>
            Run it again
          </button>
        </div>
      </section>
    )
  }

  const words = spokenWords(item.text)
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        <p className="text-dim tabular-nums">
          Line {pos + 1} of {queue.length}
          {queue.length !== lines.length && ' missed'} · {solid} of {lines.length} solid
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {canSpeak() && (
            <button type="button" aria-pressed={speakCues} onClick={() => onSpeakCues(!speakCues)} className={`${toggle(speakCues)} h-9 px-3 sm:h-8`}>
              Read cues aloud
            </button>
          )}
          {pos > 0 && (
            <button type="button" onClick={() => restart()} className={`${quiet} h-9 px-3 sm:h-8`}>
              Start over
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        {cue.map((i) => (
          <CueItem key={i} item={script.items[i]} mine={script.items[i].kind === 'speech' && roles.includes((script.items[i] as { speaker: string }).speaker.toLocaleUpperCase())} />
        ))}
        {cue.length === 0 && <p className="text-sm text-dim italic">You speak first.</p>}
      </div>

      <div className={`mt-4 rounded-2xl p-4 sm:p-5 ${MINE}`}>
        <p className="text-xs font-semibold tracking-wide uppercase" dir="auto">
          {item.speaker} <span className="font-normal text-dim normal-case">(you)</span>
        </p>
        <div className="mt-2 min-h-16 text-lg leading-relaxed sm:text-xl" aria-live="polite" dir="auto">
          {shown ? (
            <Speech text={item.text} />
          ) : hint > 0 ? (
            <p>{prompt(item.text, hint)}</p>
          ) : (
            <p className="text-base text-dim">
              Say your line, then check it. <span className="whitespace-nowrap">({words === 1 ? '1 word' : `${words} words`})</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {shown ? (
          <>
            <button type="button" onClick={() => mark('missed')} className={`${outline} flex-1 sm:flex-none`}>
              Missed it
            </button>
            <button type="button" onClick={() => mark('got')} className={`${primary} flex-1 sm:flex-none`}>
              Got it
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={more} disabled={hint >= words} className={`${outline} flex-1 sm:flex-none`}>
              Line?
            </button>
            <button type="button" onClick={reveal} className={`${primary} flex-1 sm:flex-none`}>
              Show my line
            </button>
          </>
        )}
      </div>
      <p className="mt-3 hidden text-xs text-dim sm:block">
        Keys: Space shows your line, P gives the next few words, → got it, ← missed it.
      </p>
    </div>
  )
}

function CueItem({ item, mine }: { item: Item; mine: boolean }) {
  if (item.kind === 'heading') return <p className="text-xs font-semibold tracking-wide text-dim uppercase">{item.text}</p>
  if (item.kind === 'direction')
    return (
      <p className="text-sm text-dim italic" dir="auto">
        {item.text}
      </p>
    )
  return (
    <div className={`rounded-xl border border-rule p-3 sm:p-4 ${mine ? MINE : ''}`} dir="auto">
      <p className="text-xs font-semibold tracking-wide uppercase">
        {item.speaker}
        {mine && <span className="font-normal text-dim normal-case"> (you)</span>}
      </p>
      <div className="mt-1 leading-relaxed">
        <Speech text={item.text} />
      </div>
    </div>
  )
}

/** A speech with its directions dimmed. */
export function Speech({ text }: { text: string }) {
  return (
    <span className="block">
      {segments(text).map((s, i) =>
        s.kind === 'direction' ? (
          <span key={i} className="text-[0.9em] text-dim italic">
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </span>
  )
}
