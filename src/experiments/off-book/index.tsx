import { useEffect, useMemo, useRef, useState } from 'react'
import { Cards, type Mark } from './Cards.tsx'
import { fingerprint, myLines, parseScript, sections } from './model.ts'
import { ReadThrough, type Show } from './Read.tsx'
import { SAMPLE, SAMPLE_TITLE } from './sample.ts'
import { area, outline, primary, quiet, select, toggle } from './ui.ts'

// The script, your part, and how each line went, kept on this device only.
const STORAGE_KEY = 'labs:off-book'
const MAX_CHARS = 500_000

interface Saved {
  text: string
  roles: string[]
  section: number
  mode: 'cards' | 'read'
  show: Show
  speak: boolean
  /** Marks for the script with this fingerprint; a different script starts fresh. */
  progress: { print: string; marks: Record<number, Mark> }
}

/** Experiment #018: learn your lines from a pasted script. */
export default function OffBook() {
  const [saved, setSaved] = useState(load)
  const script = useMemo(() => parseScript(saved.text), [saved.text])
  const print = useMemo(() => fingerprint(saved.text), [saved.text])
  const parts = useMemo(() => sections(script), [script])
  const [editing, setEditing] = useState(() => !saved.text.trim())
  const [note, setNote] = useState('')
  const file = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      setNote('This browser couldn’t save the script, so it will be gone after a reload.')
    }
  }, [saved])

  const change = (patch: Partial<Saved>) => setSaved((s) => ({ ...s, ...patch }))
  const setText = (text: string) => {
    if (text.length > MAX_CHARS) return setNote(`That script is too long. Paste up to ${MAX_CHARS.toLocaleString()} characters, such as one act at a time.`)
    setNote('')
    change({ text, section: 0 })
  }

  const known = new Set(script.characters.map((c) => c.key))
  const roles = saved.roles.filter((r) => known.has(r))
  const section = parts[Math.min(saved.section, parts.length - 1)]
  const lines = useMemo(() => (roles.length ? myLines(script, roles, section) : []), [script, roles.join('|'), section])
  const marks = saved.progress.print === print ? saved.progress.marks : {}
  const onMark = (index: number, mark: Mark) => setSaved((s) => ({ ...s, progress: { print, marks: { ...(s.progress.print === print ? s.progress.marks : {}), [index]: mark } } }))
  const toggleRole = (key: string) => change({ roles: roles.includes(key) ? roles.filter((r) => r !== key) : [...roles, key] })

  const openFile = async (f: File | undefined) => {
    if (!f) return
    if (f.size > MAX_CHARS * 4) return setNote('That file is too big to be a script. Open a plain-text file of the script.')
    const text = await f.text()
    if (text.slice(0, 2000).includes(String.fromCharCode(0))) return setNote('That doesn’t look like a text file. Copy the script from your PDF or document and paste it instead.')
    setText(text)
    setEditing(false)
  }

  const words = script.characters.reduce((n, c) => n + c.words, 0)

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="max-w-prose text-pretty text-dim">
          Learn your lines from your script. Paste it in, pick your part, and practice from your cues: Off Book hides your line until you’ve said it, gives you a word or two when you call for a line, and keeps track of the ones that need work. Everything stays on this device.
        </p>

        <section aria-labelledby="script-heading" className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="script-heading" className="text-lg font-semibold tracking-tight">
              Script
            </h2>
            {!editing && (
              <button type="button" onClick={() => setEditing(true)} className={`${quiet} -mr-3`}>
                Change the script
              </button>
            )}
          </div>
          {editing ? (
            <div className="mt-3 grid gap-3">
              <textarea
                value={saved.text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className={area}
                dir="auto"
                placeholder={'Paste your script. Each speech should start with the character’s name, like\n\nHAMLET: To be, or not to be…\n\nor have the name on its own line above it.'}
                aria-label="Script text"
              />
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setEditing(false)} disabled={!script.characters.length} className={primary}>
                  Done
                </button>
                <button type="button" onClick={() => file.current?.click()} className={outline}>
                  Open a text file
                </button>
                <input ref={file} type="file" accept=".txt,.fountain,.md,text/plain" className="hidden" onChange={(e) => void openFile(e.target.files?.[0])} />
                <button
                  type="button"
                  onClick={() => {
                    setNote('')
                    change({ text: SAMPLE, section: 0, roles: ['JACK'] })
                    setEditing(false)
                  }}
                  className={quiet}
                >
                  Try a sample scene
                </button>
              </div>
              <p className="text-sm text-pretty text-dim">
                {saved.text.trim() && !script.characters.length
                  ? 'No character names found yet. Start each speech with the name and a colon (MAYA: Hello), or put the name in capitals on its own line above the speech.'
                  : 'From a PDF or Word file, select the text, copy it, and paste it here. Directions in [brackets] or (parentheses) are never counted as lines.'}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm text-dim">
              {saved.text === SAMPLE ? `${SAMPLE_TITLE}. ` : ''}
              {script.characters.length} {script.characters.length === 1 ? 'character' : 'characters'}, {script.items.filter((i) => i.kind === 'speech').length} speeches, about {words.toLocaleString()} words.
            </p>
          )}
          {note && (
            <p className="mt-2 text-sm text-red-700 dark:text-red-400" role="alert">
              {note}
            </p>
          )}
        </section>

        {script.characters.length > 0 && (
          <section aria-labelledby="part-heading" className="mt-8">
            <h2 id="part-heading" className="text-lg font-semibold tracking-tight">
              Your part
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {script.characters.map((c) => (
                <button key={c.key} type="button" aria-pressed={roles.includes(c.key)} onClick={() => toggleRole(c.key)} className={toggle(roles.includes(c.key))} dir="auto">
                  {c.name}
                  <span className={`text-xs tabular-nums ${roles.includes(c.key) ? 'opacity-75' : 'text-dim'}`}>{c.speeches}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-dim">{roles.length ? (roles.length > 1 ? 'You’re playing more than one part.' : 'Pick another as well if you’re doubling roles.') : 'Pick the character you’re playing. The numbers are how many speeches each has: if someone is missing or a number looks wrong, start each speech with the name and a colon, then check again.'}</p>

            {roles.length > 0 && (
              <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4">
                {parts.length > 1 && (
                  <label className="grid min-w-0 gap-1.5">
                    <span className="text-sm font-medium">Practice</span>
                    <select value={Math.min(saved.section, parts.length - 1)} onChange={(e) => change({ section: Number(e.target.value) })} className={`${select} max-w-full`}>
                      {parts.map((p, i) => (
                        <option key={i} value={i}>
                          {p.label} ({myLines(script, roles, p).length})
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="flex gap-2" role="group" aria-label="Way to practice">
                  <button type="button" aria-pressed={saved.mode === 'cards'} onClick={() => change({ mode: 'cards' })} className={toggle(saved.mode === 'cards')}>
                    Cue cards
                  </button>
                  <button type="button" aria-pressed={saved.mode === 'read'} onClick={() => change({ mode: 'read' })} className={toggle(saved.mode === 'read')}>
                    Read through
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {roles.length > 0 && (
          <section aria-label="Practice" className="mt-8 border-t border-rule pt-6">
            {saved.mode === 'cards' ? (
              <Cards script={script} section={section} roles={roles} lines={lines} marks={marks} onMark={onMark} speakCues={saved.speak} onSpeakCues={(speak) => change({ speak })} />
            ) : (
              <ReadThrough script={script} section={section} roles={roles} show={saved.show} onShow={(show) => change({ show })} />
            )}
          </section>
        )}
      </div>
    </div>
  )
}

function load(): Saved {
  const fallback: Saved = { text: '', roles: [], section: 0, mode: 'cards', show: 'letters', speak: false, progress: { print: '', marks: {} } }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data || typeof data !== 'object') return fallback
    const marks: Record<number, Mark> = {}
    const raw = data.progress?.marks
    if (raw && typeof raw === 'object') for (const [k, v] of Object.entries(raw)) if (/^\d+$/.test(k) && (v === 'got' || v === 'missed')) marks[Number(k)] = v
    return {
      text: typeof data.text === 'string' ? data.text.slice(0, MAX_CHARS) : '',
      roles: Array.isArray(data.roles) ? data.roles.filter((r: unknown) => typeof r === 'string').slice(0, 20) : [],
      section: Number.isInteger(data.section) && data.section >= 0 ? data.section : 0,
      mode: data.mode === 'read' ? 'read' : 'cards',
      show: data.show === 'full' || data.show === 'hidden' ? data.show : 'letters',
      speak: data.speak === true,
      progress: { print: typeof data.progress?.print === 'string' ? data.progress.print : '', marks },
    }
  } catch {
    return fallback
  }
}
