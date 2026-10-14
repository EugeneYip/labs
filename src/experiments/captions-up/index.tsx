import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { EXAMPLE_NAME, EXAMPLE_SCRIPT } from './example.ts'
import { captionsOf, DEFAULTS, layoutProblem, LIMITS, plainText, readPosition, readScript, readShow, refit, tidyCaption, type Caption, type Position, type Show } from './model.ts'

const KEY = 'labs:captions-up'
const AT_KEY = 'labs:captions-up:at'
const PAGE = 50

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 sm:h-10`
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const small = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-rule px-3 text-sm hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-9'
const summaryStyle = 'cursor-pointer text-sm font-medium underline-offset-4 hover:underline'

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`

function read(key: string): string | null | undefined {
  try {
    return localStorage.getItem(key)
  } catch {
    return undefined
  }
}
function savedShow(): Show | null {
  const raw = read(KEY)
  if (!raw) return null
  try {
    const v = JSON.parse(raw)
    return v?.v === 1 ? readShow(v.show) : null
  } catch {
    return null
  }
}
function savedPosition(captions: number): Position {
  try {
    return readPosition(JSON.parse(read(AT_KEY) ?? 'null'), captions)
  } catch {
    return { at: 0, blank: false }
  }
}

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
const fileName = (show: Show) => show.name.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 40) || 'captions'

/** Font size for the audience: the widest line fills about 90% of the screen, never taller than a seventh of it. */
const audienceFont = (width: number, lines: number) => `min(calc(90vw / ${(width * 0.56).toFixed(1)}), ${(70 / Math.max(2, lines + 1)).toFixed(1)}vh)`

/** Experiment #033: open captions for a live show, prepared from the script and run by the company itself. */
export default function CaptionsUp() {
  const [show, setShow] = useState<Show | null>(() => savedShow())
  const [damaged] = useState(() => !!read(KEY) && savedShow() === null)
  const [pos, setPos] = useState<Position>(() => savedPosition(savedShow()?.captions.length ?? 0))
  const [screen, setScreen] = useState(() => window.location.hash === '#screen')
  const [saved, setSaved] = useState(true)
  const [mode, setMode] = useState<'edit' | 'run'>('edit')
  const [preparing, setPreparing] = useState(false)
  const [solo, setSolo] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [said, setSaid] = useState('')
  const [note, setNote] = useState('')
  const say = (m: string) => setSaid((s) => (s === m ? `${m} ` : m))

  // The show and the position are saved apart, so advancing a caption writes only the position.
  const saveShow = useOtherTabs(KEY, () => {
    const next = savedShow()
    setShow(next)
    setPos(savedPosition(next?.captions.length ?? 0))
  })
  const savePos = useOtherTabs(AT_KEY, () => setPos(savedPosition(savedShow()?.captions.length ?? 0)))
  useEffect(() => {
    if (!show || screen) return
    try {
      saveShow(JSON.stringify({ v: 1, show }))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [show, saveShow, screen])
  useEffect(() => {
    if (!show || screen) return
    try {
      savePos(JSON.stringify(pos))
    } catch {
      setSaved(false)
    }
  }, [pos, show, savePos, screen])

  useEffect(() => {
    const onHash = () => setScreen(window.location.hash === '#screen')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!printing) return
    const done = () => setPrinting(false)
    window.addEventListener('afterprint', done, { once: true })
    window.print()
    const t = setTimeout(done, 1500)
    return () => {
      clearTimeout(t)
      window.removeEventListener('afterprint', done)
    }
  }, [printing])

  if (screen) return <Audience show={show} pos={pos} />

  // Each change is made to the latest position and captions, so quick presses (a clicker) or typing never lose one.
  const count = show?.captions.length ?? 0
  const go = (at: number, blank = false) => count && setPos({ at: Math.max(0, Math.min(count - 1, at)), blank })
  const next = () => count && setPos((p) => (p.blank ? { at: p.at, blank: false } : { at: Math.min(count - 1, p.at + 1), blank: false }))
  const previous = () => count && setPos((p) => (p.blank ? { at: p.at, blank: false } : { at: Math.max(0, p.at - 1), blank: false }))
  const toggleBlank = () => count && setPos((p) => ({ ...p, blank: !p.blank }))

  const changeCaptions = (f: (captions: Caption[]) => Caption[], keepAt?: (at: number) => number, patch: Partial<Show> = {}) => {
    let length = 0
    setShow((s) => {
      if (!s) return s
      const captions = f(s.captions)
      length = captions.length
      return { ...s, ...patch, captions }
    })
    setPos((p) => ({ at: Math.max(0, Math.min(Math.max(0, length - 1), keepAt ? keepAt(p.at) : p.at)), blank: p.blank }))
  }

  const openBackup = async (file: File) => {
    if (file.size > 10_000_000) {
      setNote(`${file.name} is larger than any Captions Up backup.`)
      return
    }
    try {
      const v = JSON.parse((await file.text()).replace(/^\uFEFF/, ''))
      const next = v?.v === 1 ? readShow(v.show) : null
      if (!next) throw new Error('not a backup')
      if (show && !window.confirm(`Replace “${show.name || 'this show'}” with the one in ${file.name}?`)) return
      setNote('')
      setShow(next)
      setPos(readPosition(v.position, next.captions.length))
      setPreparing(false)
      setMode('edit')
      say(`${file.name} opened: ${plural(next.captions.length, 'caption')}.`)
    } catch {
      setNote(`${file.name} isn’t a Captions Up backup this page can read.`)
    }
  }

  const startAgain = () => {
    if (show && !window.confirm('Start again? This show’s captions will be removed from this browser. Download a backup first to keep them.')) return
    try {
      localStorage.removeItem(KEY)
      localStorage.removeItem(AT_KEY)
    } catch {
      // Storage that can't be reached has nothing to remove.
    }
    setShow(null)
    setPos({ at: 0, blank: false })
    setPreparing(false)
    setSolo(false)
    say('Started again.')
  }

  return (
    <div className="flex-1">
      {solo && show && <Solo show={show} pos={pos} onNext={next} onPrevious={previous} onBlank={toggleBlank} onClose={() => setSolo(false)} />}
      <div className={`mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-10 ${solo ? 'hidden' : ''}`}>
        <p className="sr-only" aria-live="polite">
          {said}
        </p>
        <section aria-labelledby="intro-heading" className="grid grid-cols-1 gap-4 print:hidden">
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            Open captions for a live show, for d/Deaf and hard-of-hearing audiences: paste the script, get captions of two or three lines with each speaker’s name, correct any by hand, then
            run them on the night from a laptop, with the audience’s captions in a second window on a projector or TV.
          </p>
          <ul className="grid max-w-prose grid-cols-1 list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
            <li>
              The script stays on this device: it’s read here, nothing is uploaded, and the captions are saved in this browser (with the caption on screen, so a reload carries on where it was).
              A browser can clear what it saves (Safari after about a week without a visit): download a backup to keep them. It works offline once opened.
            </li>
            <li>For fringe, amateur, school, and community companies captioning their own performances. Captioning well takes practice: rehearse with the cast, as the Edinburgh Fringe advises.</li>
            <li>The captions are advanced by hand, one at a time. Timing to speech, translations, and captions on audience phones aren’t handled here.</li>
          </ul>
          <details className="max-w-prose text-sm text-dim">
            <summary className={summaryStyle}>How it reads and splits a script</summary>
            <div className="grid grid-cols-1 gap-2 pt-3 text-pretty">
              <p>
                Speakers are found in the usual layouts: <span className="font-mono text-ink">ANA: line</span>, <span className="font-mono text-ink">ANA. line</span>, a name in capitals at
                the start of a line, or a name on a line of its own above the speech. Lines that continue a speech join it.
              </p>
              <p>
                Stage directions in parentheses are left out, and so are page numbers on lines of their own (from a pasted PDF); sounds in square brackets, such as{' '}
                <span className="font-mono text-ink">[Door slams]</span>, become captions of their own. Lines starting Act, Scene, Prologue, Epilogue, or Interval become places to jump to.
              </p>
              <p>
                Each speech is split into captions of at most two lines (or the number you choose) of at most 40 characters (or your number), following the Edinburgh Fringe’s advice of “around
                two or three lines per slide” with the speaker’s name. A caption ends at the end of a sentence where it can, otherwise after a comma or the like, otherwise between words; no
                word is broken. Check every caption before the show: a script’s layout can fool any reader.
              </p>
            </div>
          </details>
          {damaged && !show && (
            <p className="max-w-prose rounded-xl border border-rule px-4 py-3 text-sm text-pretty" role="status">
              Captions saved in this browser couldn’t be read, so the page started empty. They stay saved until you make captions here.
            </p>
          )}
        </section>

        {(!show || preparing) && (
          <Prepare
            hasShow={!!show}
            onCancel={show ? () => setPreparing(false) : undefined}
            onMake={(next) => {
              setShow(next)
              setPos({ at: 0, blank: false })
              setPreparing(false)
              setMode('edit')
              say(`${plural(next.captions.length, 'caption')} made.`)
              requestAnimationFrame(() => document.getElementById('show-heading')?.focus())
            }}
            onOpenBackup={openBackup}
            note={note}
          />
        )}

        {show && !preparing && (
          <>
            <section aria-labelledby="show-heading" className={`grid grid-cols-1 gap-4 ${printing ? 'print:hidden' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="show-heading" tabIndex={-1} className="text-lg font-semibold tracking-tight">
                  {show.name.trim() || 'The show'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={quiet} onClick={() => setPreparing(true)}>
                    Make captions from a script again
                  </button>
                  <button type="button" className={quiet} onClick={startAgain}>
                    Start again
                  </button>
                </div>
              </div>
              {!saved && <NotSaving>This browser isn’t saving the captions, so they’ll be gone when the page closes. Download a backup to keep them.</NotSaving>}
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Mode">
                <button type="button" className={mode === 'edit' ? primary : outline} aria-pressed={mode === 'edit'} onClick={() => setMode('edit')}>
                  Check and edit
                </button>
                <button type="button" className={mode === 'run' ? primary : outline} aria-pressed={mode === 'run'} onClick={() => setMode('run')}>
                  Run the show
                </button>
                <span className="text-sm text-dim">
                  {plural(show.captions.length, 'caption')}
                  {show.scenes.length ? `, ${plural(show.scenes.length, 'scene')}` : ''}; up to {show.lines} {show.lines === 1 ? 'line' : 'lines'} of {show.width} characters
                </span>
              </div>
              {mode === 'edit' ? (
                <Editor show={show} pos={pos} onChange={changeCaptions} onGo={(at) => go(at)} say={say} />
              ) : (
                <Operator show={show} pos={pos} onGo={go} onNext={next} onPrevious={previous} onBlank={toggleBlank} onSolo={() => setSolo(true)} />
              )}
            </section>

            <section aria-labelledby="files-heading" className="grid grid-cols-1 gap-3 print:hidden">
              <h2 id="files-heading" className="text-lg font-semibold tracking-tight">
                Print and files
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={outline} onClick={() => setPrinting(true)}>
                  Print the cue script
                </button>
                <button
                  type="button"
                  className={outline}
                  onClick={() => {
                    download(plainText(show), `${fileName(show)}-captions.txt`, 'text/plain;charset=utf-8')
                    say('The captions were downloaded as text.')
                  }}
                >
                  Download the captions (text)
                </button>
                <button
                  type="button"
                  className={outline}
                  onClick={() => {
                    download(JSON.stringify({ v: 1, show, position: pos }), `${fileName(show)}-backup.json`, 'application/json')
                    say('A backup was downloaded.')
                  }}
                >
                  Download a backup
                </button>
                <FileButton label="Open a backup" accept=".json,application/json" onFile={openBackup} />
              </div>
              {note && <p className="text-sm text-red-800 dark:text-red-300">{note}</p>}
              <p className="max-w-prose text-sm text-pretty text-dim">
                The cue script prints every caption numbered, with the scenes. The text download has a caption per block, for other caption software. The backup opens again here, on this or
                another computer.
              </p>
            </section>

            {printing && <CueScript show={show} />}
          </>
        )}
      </div>
    </div>
  )
}

// --- Preparing captions from a script

function Prepare(props: { hasShow: boolean; onCancel?: () => void; onMake: (show: Show) => void; onOpenBackup: (file: File) => void; note: string }) {
  const { hasShow, onCancel, onMake, onOpenBackup, note } = props
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [width, setWidth] = useState(String(DEFAULTS.width))
  const [lines, setLines] = useState(String(DEFAULTS.lines))
  const [fileNote, setFileNote] = useState('')
  const box = useRef<HTMLTextAreaElement>(null)
  const w = Math.round(Number(width))
  const l = Math.round(Number(lines))
  const widthOk = Number.isInteger(w) && w >= LIMITS.width.min && w <= LIMITS.width.max
  const linesOk = Number.isInteger(l) && l >= LIMITS.lines.min && l <= LIMITS.lines.max
  const tooLong = text.length > LIMITS.characters
  const result = useMemo(() => {
    if (!text.trim() || tooLong || !widthOk || !linesOk) return null
    const script = readScript(text)
    return { script, captions: captionsOf(script, w, l) }
  }, [text, tooLong, w, l, widthOk, linesOk])
  const tooMany = result && result.captions.length > LIMITS.captions

  const make = () => {
    if (!result || tooMany || !result.captions.length) return
    if (hasShow && !window.confirm('Make captions from this script? They replace the show’s captions, and any edits made to them.')) return
    onMake({ name: name.trim().slice(0, 200), width: w, lines: l, scenes: result.script.scenes, captions: result.captions })
  }

  const openFile = async (file: File) => {
    if (file.size > LIMITS.characters * 4) return
    const bytes = new Uint8Array(await file.arrayBuffer())
    if ((bytes[0] === 0x50 && bytes[1] === 0x4b) || bytes.slice(0, 4096).includes(0) || (bytes[0] === 0x25 && bytes[1] === 0x50)) {
      setFileNote(`${file.name} isn’t a text file. Copy the script’s text from your document or PDF and paste it into the box.`)
      return
    }
    setFileNote('')
    let content: string
    try {
      content = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch {
      content = new TextDecoder('windows-1252').decode(bytes)
    }
    setText(content.replace(/^\uFEFF/, ''))
    if (!name) setName(file.name.replace(/\.[^.]+$/, ''))
  }

  return (
    <section aria-labelledby="prepare-heading" className="grid grid-cols-1 gap-4 print:hidden">
      <h2 id="prepare-heading" className="text-lg font-semibold tracking-tight">
        Make captions from a script
      </h2>
      <label className="grid max-w-md grid-cols-1 gap-1.5 text-sm">
        <span className="font-medium">Name of the show (optional)</span>
        <input className={field} value={name} maxLength={200} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="grid grid-cols-1 gap-1.5 text-sm">
        <span className="font-medium">The script</span>
        <span className="text-dim">Copy the text from your script (Word, PDF, or a web page) and paste it here, or open a text file.</span>
        <textarea
          ref={box}
          className={`${control} min-h-56 py-2 font-mono text-sm`}
          value={text}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
          placeholder={'ACT ONE\nScene 1\n\nANA: Who’s there?\n(BEN enters.)\nBEN: Only me.\n[Thunder]'}
        />
      </label>
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid grid-cols-1 gap-1 text-sm">
          <span>Characters on a line</span>
          <input className={`${field} w-24`} type="number" inputMode="numeric" min={LIMITS.width.min} max={LIMITS.width.max} value={width} onChange={(e) => setWidth(e.target.value)} />
        </label>
        <label className="grid grid-cols-1 gap-1 text-sm">
          <span>Lines in a caption</span>
          <select className={`${field} w-24`} value={lines} onChange={(e) => setLines(e.target.value)}>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      {fileNote && <p className="text-sm text-red-800 dark:text-red-300">{fileNote}</p>}
      {!widthOk && <p className="text-sm text-red-800 dark:text-red-300">Characters on a line: a whole number from {LIMITS.width.min} to {LIMITS.width.max}.</p>}
      {tooLong && <p className="text-sm text-red-800 dark:text-red-300">That’s more text than this page reads ({LIMITS.characters.toLocaleString('en')} characters).</p>}
      {result && (
        <div className="grid max-w-prose grid-cols-1 gap-1 text-sm text-pretty" role="status">
          <p>
            {plural(result.captions.length, 'caption')} from {plural(result.script.items.filter((i) => i.kind === 'speech').length, 'speech', 'speeches')} and{' '}
            {plural(result.script.items.filter((i) => i.kind === 'sound').length, 'sound')}
            {result.script.scenes.length ? `, in ${plural(result.script.scenes.length, 'scene')}` : ''}
            {result.script.dropped ? `; ${plural(result.script.dropped, 'stage direction')} left out` : ''}
            {result.script.pages ? `; ${plural(result.script.pages, 'page number')} left out` : ''}.
          </p>
          <p className="text-dim">
            {result.script.speakers.length
              ? `Speakers: ${result.script.speakers.slice(0, 20).join(', ')}${result.script.speakers.length > 20 ? ` and ${result.script.speakers.length - 20} more` : ''}.`
              : 'No speakers were recognised: every caption will be without a name.'}
          </p>
          {tooMany && <p className="text-red-800 dark:text-red-300">That’s more captions than this page keeps ({LIMITS.captions.toLocaleString('en')}).</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={primary} disabled={!result || !!tooMany || !result.captions.length} onClick={make}>
          Make captions
        </button>
        <FileButton label="Open a text file" accept=".txt,.text,.fountain,text/plain" onFile={openFile} />
        {!hasShow && (
          <button
            type="button"
            className={quiet}
            onClick={() => {
              setText(EXAMPLE_SCRIPT)
              setName(EXAMPLE_NAME)
              requestAnimationFrame(() => box.current?.focus())
            }}
          >
            Try an example
          </button>
        )}
        {onCancel && (
          <button type="button" className={quiet} onClick={onCancel}>
            Cancel
          </button>
        )}
        {!hasShow && <FileButton label="Open a backup" accept=".json,application/json" onFile={onOpenBackup} />}
      </div>
      {note && <p className="text-sm text-red-800 dark:text-red-300">{note}</p>}
    </section>
  )
}

// --- Checking and editing

function Editor(props: {
  show: Show
  pos: Position
  onChange: (f: (c: Caption[]) => Caption[], keepAt?: (at: number) => number, patch?: Partial<Show>) => void
  onGo: (at: number) => void
  say: (m: string) => void
}) {
  const { show, pos, onChange, onGo, say } = props
  const [page, setPage] = useState(() => Math.floor(pos.at / PAGE))
  const [goTo, setGoTo] = useState('')
  const [width, setWidth] = useState(String(show.width))
  const [lines, setLines] = useState(String(show.lines))
  const pages = Math.max(1, Math.ceil(show.captions.length / PAGE))
  const from = Math.min(page, pages - 1) * PAGE
  const shown = show.captions.slice(from, from + PAGE)
  const problems = useMemo(() => show.captions.map((c) => (c.kind === 'blank' ? '' : layoutProblem(c.text, show.width, show.lines))), [show])
  const problemCount = problems.filter(Boolean).length
  const focusCaption = useRef<number | null>(null)
  useEffect(() => {
    if (focusCaption.current === null) return
    document.querySelector<HTMLTextAreaElement>(`[data-caption="${focusCaption.current}"]`)?.focus()
    focusCaption.current = null
  })

  const edit = (i: number, text: string) => onChange((cs) => cs.map((c, j) => (j === i ? { ...c, text } : c)))
  const split = (i: number, at: number) => {
    const c = show.captions[i]
    const flat = c.text
    // Split at the cursor, moved back to the start of the word it's in.
    let cut = Math.max(0, Math.min(flat.length, at))
    while (cut > 0 && !/\s/.test(flat[cut - 1])) cut--
    const a = tidyCaption(flat.slice(0, cut))
    const b = tidyCaption(flat.slice(cut))
    if (!a || !b) {
      say('Put the cursor where the caption should split, between two words.')
      return
    }
    onChange(
      (cs) => [...cs.slice(0, i), { ...c, text: a }, { ...c, text: b }, ...cs.slice(i + 1)],
      (at) => (at > i ? at + 1 : at),
    )
    focusCaption.current = i + 1
    say(`Caption ${i + 1} split in two.`)
  }
  const join = (i: number) => {
    const a = show.captions[i]
    const b = show.captions[i + 1]
    if (!b) return
    const text = [a.text, b.text].filter(Boolean).join('\n')
    onChange(
      (cs) => [...cs.slice(0, i), { ...a, text, kind: a.kind === 'blank' ? b.kind : a.kind }, ...cs.slice(i + 2)],
      (at) => (at > i ? at - 1 : at),
    )
    focusCaption.current = i
    say(`Captions ${i + 1} and ${i + 2} joined.`)
  }
  const remove = (i: number) => {
    onChange(
      (cs) => [...cs.slice(0, i), ...cs.slice(i + 1)],
      (at) => (at > i ? at - 1 : at),
    )
    focusCaption.current = Math.min(i, show.captions.length - 2)
    say(`Caption ${i + 1} deleted.`)
  }
  const insert = (i: number, kind: 'speech' | 'blank') => {
    const c: Caption = { text: kind === 'blank' ? '' : 'New caption', kind, scene: show.captions[i]?.scene ?? -1 }
    onChange(
      (cs) => [...cs.slice(0, i + 1), c, ...cs.slice(i + 1)],
      (at) => (at > i ? at + 1 : at),
    )
    focusCaption.current = i + 1
    say(kind === 'blank' ? `A blank added after caption ${i + 1}.` : `A caption added after caption ${i + 1}.`)
  }
  const refitAll = () => {
    const w = Math.round(Number(width))
    const l = Math.round(Number(lines))
    if (!Number.isInteger(w) || w < LIMITS.width.min || w > LIMITS.width.max || !Number.isInteger(l) || l < LIMITS.lines.min || l > LIMITS.lines.max) return
    // The caption on screen stays on screen: it moves to the first of the captions it becomes.
    const starts: number[] = []
    const captions: Caption[] = []
    show.captions.forEach((c) => {
      starts.push(captions.length)
      captions.push(...refit(c, w, l))
    })
    onChange(() => captions, (at) => starts[at] ?? 0, { width: w, lines: l })
    say(`Every caption fitted to ${l} ${l === 1 ? 'line' : 'lines'} of ${w} characters: ${plural(captions.length, 'caption')}.`)
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-rule p-4">
        <p className="max-w-prose text-sm text-pretty">
          Read every caption against the script before the show.{' '}
          {problemCount ? (
            <span className="font-medium">
              {plural(problemCount, 'caption')} {problemCount === 1 ? 'is' : 'are'} longer than the limits (marked below).
            </span>
          ) : (
            'Every caption is within the limits.'
          )}
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid grid-cols-1 gap-1 text-sm">
            <span>Characters on a line</span>
            <input className={`${field} w-24`} type="number" inputMode="numeric" min={LIMITS.width.min} max={LIMITS.width.max} value={width} onChange={(e) => setWidth(e.target.value)} />
          </label>
          <label className="grid grid-cols-1 gap-1 text-sm">
            <span>Lines in a caption</span>
            <select className={`${field} w-24`} value={lines} onChange={(e) => setLines(e.target.value)}>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={small} disabled={String(show.width) === width && String(show.lines) === lines} onClick={refitAll}>
            Fit every caption to these
          </button>
        </div>
      </div>

      <nav aria-label="Captions pages" className="flex flex-wrap items-center gap-2 text-sm">
        <button type="button" className={small} disabled={from === 0} onClick={() => setPage(Math.max(0, page - 1))}>
          Previous {PAGE}
        </button>
        <span className="text-dim tabular-nums">
          Captions {from + 1}–{Math.min(show.captions.length, from + PAGE)} of {show.captions.length.toLocaleString('en')}
        </span>
        <button type="button" className={small} disabled={from + PAGE >= show.captions.length} onClick={() => setPage(page + 1)}>
          Next {PAGE}
        </button>
        {show.scenes.length > 0 && (
          <select
            aria-label="Go to a scene"
            className={`${field} max-w-56`}
            value=""
            onChange={(e) => {
              const k = Number(e.target.value)
              const first = show.captions.findIndex((c) => c.scene === k)
              if (first >= 0) {
                setPage(Math.floor(first / PAGE))
                focusCaption.current = first
              }
            }}
          >
            <option value="">Go to a scene…</option>
            {show.scenes.map((s, k) => (
              <option key={k} value={k}>
                {s}
              </option>
            ))}
          </select>
        )}
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            const n = Math.round(Number(goTo))
            if (n >= 1 && n <= show.captions.length) {
              setPage(Math.floor((n - 1) / PAGE))
              focusCaption.current = n - 1
            }
          }}
        >
          <input aria-label="Caption number" className={`${field} w-20`} inputMode="numeric" value={goTo} onChange={(e) => setGoTo(e.target.value)} />
          <button type="submit" className={small}>
            Go
          </button>
        </form>
      </nav>

      <ol className="grid grid-cols-1 gap-3">
        {shown.map((c, k) => {
          const i = from + k
          const sceneStart = c.scene >= 0 && (i === 0 || show.captions[i - 1].scene !== c.scene)
          return (
            <li key={i} className="grid min-w-0 grid-cols-1 gap-2">
              {sceneStart && <h3 className="pt-2 text-sm font-semibold">{show.scenes[c.scene]}</h3>}
              <div className={`grid min-w-0 grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-[3rem_1fr] ${i === pos.at ? 'border-ink' : 'border-rule'}`}>
                <span className="text-sm text-dim tabular-nums">{i + 1}</span>
                <div className="grid min-w-0 grid-cols-1 gap-2">
                  {c.kind === 'blank' ? (
                    <p className="text-sm text-dim">Blank screen</p>
                  ) : (
                    // As wide as a caption line, and no soft wrapping: what's here is what the audience sees.
                    <textarea
                      data-caption={i}
                      aria-label={`Caption ${i + 1}`}
                      className={`${control} max-w-full py-2 font-mono text-sm ${problems[i] ? 'border-red-600 dark:border-red-400' : ''}`}
                      style={{ width: `${show.width + 4}ch` }}
                      wrap="off"
                      rows={Math.max(show.lines, c.text.split('\n').length)}
                      value={c.text}
                      spellCheck={false}
                      onChange={(e) => edit(i, e.target.value)}
                      onBlur={(e) => {
                        const t = tidyCaption(e.target.value)
                        if (t !== c.text) edit(i, t)
                      }}
                    />
                  )}
                  {problems[i] && <span className="text-xs text-red-800 dark:text-red-300">Longer than the limits: {problems[i]}.</span>}
                  {c.kind === 'sound' && <span className="text-xs text-dim">A sound</span>}
                <div className="flex flex-wrap items-start gap-1">
                  {c.kind !== 'blank' && (
                    <button
                      type="button"
                      className={small}
                      onClick={() => {
                        const area = document.querySelector<HTMLTextAreaElement>(`[data-caption="${i}"]`)
                        split(i, area?.selectionStart ?? Math.floor(c.text.length / 2))
                      }}
                    >
                      Split at the cursor
                    </button>
                  )}
                  <button type="button" className={small} disabled={i === show.captions.length - 1} onClick={() => join(i)}>
                    Join with the next
                  </button>
                  <button type="button" className={small} onClick={() => insert(i, 'blank')}>
                    Blank after
                  </button>
                  <button type="button" className={small} onClick={() => insert(i, 'speech')}>
                    Caption after
                  </button>
                  <button type="button" className={small} disabled={show.captions.length < 2} onClick={() => remove(i)} aria-label={`Delete caption ${i + 1}`}>
                    Delete
                  </button>
                  <button type="button" className={small} onClick={() => onGo(i)} aria-label={`Start the show from caption ${i + 1}`}>
                    Start here
                  </button>
                </div>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// --- Running the show

function CaptionBox({ caption, blank, width, lines, big = false }: { caption: Caption | undefined; blank: boolean; width: number; lines: number; big?: boolean }) {
  const text = !caption || blank || caption.kind === 'blank' ? '' : caption.text
  return (
    <div
      className="flex min-h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-black px-4 py-6 text-center leading-snug font-medium whitespace-pre-line text-white"
      style={big ? { fontSize: audienceFont(width, lines) } : { fontSize: 'clamp(1rem, 2.6vw, 1.75rem)' }}
    >
      {text || <span className="text-sm font-normal text-white/50">{blank ? 'Blank screen' : 'Nothing on screen'}</span>}
    </div>
  )
}

function Operator(props: { show: Show; pos: Position; onGo: (at: number, blank?: boolean) => void; onNext: () => void; onPrevious: () => void; onBlank: () => void; onSolo: () => void }) {
  const { show, pos, onGo, onNext, onPrevious, onBlank, onSolo } = props
  const [goTo, setGoTo] = useState('')
  const latest = useRef({ onNext, onPrevious, onBlank, onGo })
  latest.current = { onNext, onPrevious, onBlank, onGo }

  // Keys work anywhere on the page except in a box: Space, →, and Page Down (most presentation clickers) for the
  // next caption; ←, Page Up, and Backspace for the previous; B for a blank screen; Home for the first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target instanceof Element ? e.target : null
      if (t?.closest('input, textarea, select, [contenteditable=true]') || e.altKey || e.ctrlKey || e.metaKey) return
      const k = e.key
      // A focused button or link does its own thing with Space and Enter (pressing Next with Space advances once).
      if ((k === ' ' || k === 'Enter') && t?.closest('button, a, summary')) return
      if (k === ' ' || k === 'ArrowRight' || k === 'PageDown' || k === 'ArrowDown') latest.current.onNext()
      else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'ArrowUp' || k === 'Backspace') latest.current.onPrevious()
      else if (k === 'b' || k === 'B' || k === '.') latest.current.onBlank()
      else if (k === 'Home') latest.current.onGo(0)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const now = show.captions[pos.at]
  const scene = now && now.scene >= 0 ? show.scenes[now.scene] : ''
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={primary} onClick={() => window.open(`${window.location.pathname}#screen`, 'captions-up-screen')}>
          Open the audience window
        </button>
        <button type="button" className={outline} onClick={onSolo}>
          Single screen
        </button>
      </div>
      <p className="max-w-prose text-sm text-pretty text-dim">
        Drag the audience window to the projector or TV, and press its Full screen button. It follows this page in this browser. Single screen shows the captions alone here, for a tablet
        mirrored to a TV.
      </p>
      <div className="grid grid-cols-1 gap-2">
        <p className="text-sm" role="status">
          <span className="font-medium tabular-nums">
            {pos.blank ? 'Blank screen' : `Caption ${(pos.at + 1).toLocaleString('en')} of ${show.captions.length.toLocaleString('en')}`}
          </span>
          {scene && <span className="text-dim"> · {scene}</span>}
        </p>
        <CaptionBox caption={now} blank={pos.blank} width={show.width} lines={show.lines} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={outline} onClick={onPrevious} disabled={!pos.blank && pos.at === 0}>
          ← Previous
        </button>
        <button type="button" className={primary} onClick={onNext} disabled={!pos.blank && pos.at >= show.captions.length - 1}>
          Next →
        </button>
        <button type="button" className={outline} aria-pressed={pos.blank} onClick={onBlank}>
          {pos.blank ? 'Show the caption' : 'Blank the screen'}
        </button>
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault()
            const n = Math.round(Number(goTo))
            if (n >= 1 && n <= show.captions.length) {
              onGo(n - 1)
              setGoTo('')
            }
          }}
        >
          <input aria-label="Go to caption number" className={`${field} w-20`} inputMode="numeric" value={goTo} onChange={(e) => setGoTo(e.target.value)} />
          <button type="submit" className={small}>
            Go
          </button>
        </form>
        {show.scenes.length > 0 && (
          <select
            aria-label="Go to the start of a scene"
            className={`${field} max-w-56`}
            value=""
            onChange={(e) => {
              const k = Number(e.target.value)
              const first = show.captions.findIndex((c) => c.scene === k)
              if (first >= 0) onGo(first)
            }}
          >
            <option value="">Go to a scene…</option>
            {show.scenes.map((s, k) => (
              <option key={k} value={k}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>
      <p className="text-xs text-pretty text-dim">Keys: Space, →, or Page Down for the next caption (most clickers send these); ←, Page Up, or Backspace for the previous; B to blank the screen; Home for the first.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="grid grid-cols-1 gap-1">
          <span className="text-xs text-dim">Previous</span>
          <p className="min-h-12 rounded-lg border border-rule px-3 py-2 text-sm whitespace-pre-line text-dim">{show.captions[pos.at - 1]?.text || ' '}</p>
        </div>
        <div className="grid grid-cols-1 gap-1">
          <span className="text-xs text-dim">Next</span>
          <p className="min-h-12 rounded-lg border border-rule px-3 py-2 text-sm whitespace-pre-line">{show.captions[pos.at + 1]?.text || (show.captions[pos.at + 1] ? 'Blank screen' : 'The end')}</p>
        </div>
      </div>
    </div>
  )
}

function Solo({ show, pos, onNext, onPrevious, onBlank, onClose }: { show: Show; pos: Position; onNext: () => void; onPrevious: () => void; onBlank: () => void; onClose: () => void }) {
  const captionButton = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    captionButton.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white" role="dialog" aria-label="Captions, single screen">
      <button ref={captionButton} type="button" className="flex flex-1 cursor-pointer items-center justify-center px-[5vw]" onClick={onNext} aria-label="Next caption">
        <span className="text-center leading-snug font-medium whitespace-pre-line" style={{ fontSize: audienceFont(show.width, show.lines) }}>
          {pos.blank || show.captions[pos.at]?.kind === 'blank' ? '' : show.captions[pos.at]?.text}
        </span>
      </button>
      <div className="flex justify-between gap-2 p-2">
        <button type="button" className="min-h-11 rounded-lg px-3 text-sm text-white/70 hover:text-white" onClick={onPrevious}>
          ← Back
        </button>
        <span className="self-center text-xs text-white/70 tabular-nums">
          {pos.at + 1} / {show.captions.length}
        </span>
        <button type="button" className="min-h-11 rounded-lg px-3 text-sm text-white/70 hover:text-white" onClick={onBlank}>
          {pos.blank ? 'Show' : 'Blank'}
        </button>
        <button type="button" className="min-h-11 rounded-lg px-3 text-sm text-white/70 hover:text-white" onClick={onClose}>
          Close (Esc)
        </button>
      </div>
    </div>
  )
}

function Audience({ show, pos }: { show: Show | null; pos: Position }) {
  const [full, setFull] = useState(false)
  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const caption = show?.captions[pos.at]
  const text = !show || pos.blank || !caption || caption.kind === 'blank' ? '' : caption.text
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex flex-1 items-center justify-center px-[5vw]" aria-live="polite">
        {show ? (
          <p className="text-center leading-snug font-medium whitespace-pre-line" style={{ fontSize: audienceFont(show.width, show.lines) }}>
            {text}
          </p>
        ) : (
          <p className="max-w-prose text-center text-lg text-white/70">No captions are ready in this browser yet. Make them on the Captions Up page, and this window will follow it.</p>
        )}
      </div>
      {!full && (
        <div className="flex flex-wrap items-center justify-center gap-3 p-3 text-sm text-white/70">
          <button type="button" className="min-h-11 rounded-lg border border-white/30 px-4 text-white" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}>
            Full screen
          </button>
          <span>The audience window follows the Captions Up page in this browser.</span>
        </div>
      )}
    </div>
  )
}

function CueScript({ show }: { show: Show }) {
  return (
    <section aria-label="Cue script" className="hidden print:block">
      <h2 className="mb-3 text-xl font-semibold">{show.name.trim() || 'Captions'}</h2>
      <ol className="text-sm">
        {show.captions.map((c, i) => (
          <li key={i} className="break-inside-avoid border-b border-rule py-1">
            {c.scene >= 0 && (i === 0 || show.captions[i - 1].scene !== c.scene) && <p className="pt-3 pb-1 font-semibold">{show.scenes[c.scene]}</p>}
            <span className="inline-block w-12 align-top tabular-nums">{i + 1}</span>
            <span className="inline-block align-top whitespace-pre-line">{c.kind === 'blank' ? '(blank)' : c.text}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

function FileButton({ label, accept, onFile }: { label: string; accept: string; onFile: (file: File) => void | Promise<void> }): ReactNode {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={outline} onClick={() => input.current?.click()}>
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void onFile(file)
        }}
      />
    </>
  )
}
