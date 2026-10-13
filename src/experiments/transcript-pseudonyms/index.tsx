import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { docxText, keyCsv, LIMITS, lowercaseLeft, matcher, nextPseudonym, pieces, pseudonymize, readKey, suggest, type Identifier, type Kind, type Suggestion } from './model.ts'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 aria-invalid:border-red-600 sm:text-sm dark:aria-invalid:border-red-400'
const field = `${control} h-11 w-full sm:h-10`
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** How much of the result is shown with each change marked; the download always has all of it. */
const PREVIEW = 100_000
const SHOWN = 30

const KIND_LABELS: Record<Kind, string> = { name: 'Name', email: 'Email', phone: 'Phone', link: 'Link', handle: 'Handle' }

// Made up, with a drama phone number and a reserved email domain, to show how the page works.
const EXAMPLE = `Interviewer: Thanks for making time, Priya. How long have you worked at Riverside Clinic?
Priya: About six years. Before that I trained in Leeds with Dr Okafor, who still calls me most weeks.
Interviewer: And how did you come to the clinic?
Priya: Tom Ashby, my manager, asked me to apply. Tom will tell you I said no twice. You can reach me at priya.shah@example.org or on 0113 496 0123.
Interviewer: Thank you. Will you be at the team day in May?
Priya: Yes, with Tom and Dr Okafor.`

const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

/** Experiment #027: replace identifiers in a transcript with consistent pseudonyms, with the key kept apart. Nothing is stored. */
export default function TranscriptPseudonyms() {
  const [text, setText] = useState('')
  const [identifiers, setIdentifiers] = useState<Identifier[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())
  const [fileNote, setFileNote] = useState('')
  const [keyNote, setKeyNote] = useState('')
  const [said, setSaid] = useState('')
  const [weak, setWeak] = useState(false)
  const [more, setMore] = useState(false)
  const [saved, setSaved] = useState(true)
  const [copyNote, setCopyNote] = useState('')

  // Typing and choosing stay quick on a long transcript; the result follows a moment later.
  const deferredText = useDeferredValue(text)
  const deferredIds = useDeferredValue(identifiers)
  const result = useMemo(() => pseudonymize(deferredText, deferredIds), [deferredText, deferredIds])
  const conflicts = useMemo(() => matcher(deferredIds).conflicts, [deferredIds])
  // Counted in the result, so a name inside an email that's being replaced too isn't counted.
  const lower = useMemo(() => lowercaseLeft(result.output, deferredIds), [result.output, deferredIds])
  const suggestions = useMemo(() => suggest(deferredText, deferredIds).filter((s) => !dismissed.has(s.text)), [deferredText, deferredIds, dismissed])
  // Nothing is saved, so leaving with work not downloaded asks first.
  useEffect(() => {
    if (saved || !text || !identifiers.length) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [saved, text, identifiers.length])

  const change = (ids: Identifier[]) => {
    setIdentifiers(ids)
    setSaved(false)
  }
  const choose = (s: Suggestion) => {
    if (identifiers.length >= LIMITS.identifiers) return
    const pseudonym = nextPseudonym(s.kind, identifiers)
    change([...identifiers, { id: newId(), text: s.text, pseudonym, lowercase: false }])
    setSaid(`${s.text} will become ${pseudonym}.`)
  }
  const dismiss = (s: Suggestion) => {
    setDismissed(new Set([...dismissed, s.text]))
    setSaid(`${s.text} is left as it is.`)
  }

  const strong = suggestions.filter((s) => s.strong)
  const weakOnes = suggestions.filter((s) => !s.strong)
  const total = result.replacements.length
  const tooLong = text.length > LIMITS.text

  return (
    <div className="flex-1">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <section aria-labelledby="intro-heading" className="grid gap-4">
          <h2 id="intro-heading" className="sr-only">
            About
          </h2>
          <p className="max-w-prose text-pretty text-dim">
            Replace the names and other identifiers in an interview transcript with pseudonyms, the same one every time, and keep the key apart. Nothing else in the text changes, and you
            choose every replacement.
          </p>
          <ul className="grid max-w-prose list-disc gap-1.5 pl-5 text-sm text-pretty text-dim">
            <li>The transcript stays on this device: nothing is uploaded, and the page saves nothing in this browser. Leaving the page loses the work, so download the transcript and the key first.</li>
            <li>With a key, a transcript is pseudonymized, not anonymous: keep the key apart from it.</li>
            <li>Names aren’t the only identifiers. Read the result through for jobs, places, events, and anything else that could identify someone.</li>
          </ul>
        </section>

        <section aria-labelledby="transcript-heading" className="grid gap-3">
          <h2 id="transcript-heading" className="text-lg font-semibold tracking-tight">
            Transcript
          </h2>
          <label className="grid gap-1.5">
            <span className="sr-only">Transcript text</span>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setSaved(false)
                setFileNote('')
              }}
              rows={10}
              placeholder="Paste a transcript, or open a file below"
              dir="auto"
              // Some browsers' enhanced spell check sends what's typed to a server; and form restore would keep it.
              spellCheck={false}
              autoComplete="off"
              aria-invalid={tooLong || undefined}
              className={`${control} w-full py-2 font-mono text-sm leading-relaxed`}
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <FileButton
              label="Open a file"
              accept=".txt,.text,.md,.docx,.vtt,.srt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onFile={async (file) => {
                const read = await readTranscript(file)
                if ('error' in read) {
                  setFileNote(read.error)
                  return
                }
                setText(read.text)
                setSaved(false)
                setFileNote(read.note)
                setSaid(`Opened a transcript of ${read.text.length.toLocaleString()} characters.`)
              }}
            />
            {!text && (
              <button type="button" className={quiet} onClick={() => setText(EXAMPLE)}>
                Try an example
              </button>
            )}
            {text && (
              <button
                type="button"
                className={quiet}
                onClick={() => {
                  if (identifiers.length && !saved && !window.confirm('Clear the transcript? The pseudonyms you chose stay, for the next transcript.')) return
                  setText('')
                  setFileNote('')
                }}
              >
                Clear the transcript
              </button>
            )}
            {text && <span className="text-sm text-dim tabular-nums">{text.length.toLocaleString()} characters</span>}
          </div>
          {fileNote && <p className="max-w-prose text-sm text-pretty text-dim">{fileNote}</p>}
          {tooLong && <p className="text-sm text-red-700 dark:text-red-400">That’s over {LIMITS.text.toLocaleString()} characters, more than this page reads. Split the transcript into parts.</p>}
        </section>

        <section aria-labelledby="replace-heading" className="grid gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="replace-heading" className="text-lg font-semibold tracking-tight">
              Replace
            </h2>
            <FileButton
              label="Open a key"
              quietStyle
              accept=".csv,.txt,text/csv,text/plain"
              onFile={async (file) => {
                const read = readKey(await file.text(), newId)
                const have = new Set(identifiers.map((i) => i.text.trim()))
                const fresh = read.identifiers.filter((i) => !have.has(i.text.trim())).slice(0, LIMITS.identifiers - identifiers.length)
                change([...identifiers, ...fresh])
                const skipped = read.skipped + (read.identifiers.length - fresh.length)
                setKeyNote(`Loaded ${fresh.length} ${fresh.length === 1 ? 'pseudonym' : 'pseudonyms'} from the key${skipped ? `; ${skipped} ${skipped === 1 ? 'row was' : 'rows were'} left out (blank, already listed, or past the limit)` : ''}.`)
              }}
            />
          </div>
          <p className="max-w-prose text-sm text-pretty text-dim">
            Continuing a project? Open its key, so this transcript gets the same pseudonyms. Give two spellings the same pseudonym to group them, such as “Alex” and “Ms Rodriguez”.
          </p>
          {keyNote && <p className="text-sm text-dim">{keyNote}</p>}
          {identifiers.length > 0 && (
            <ul className="grid gap-2">
              {identifiers.map((ident) => (
                <IdentifierRow
                  key={ident.id}
                  identifier={ident}
                  count={text ? (result.counts.get(ident.id) ?? 0) : null}
                  lowercaseLeft={lower.get(ident.id) ?? 0}
                  conflict={conflicts.includes(ident.text.trim().split(/\s+/).join(' '))}
                  onChange={(next) => change(identifiers.map((i) => (i.id === ident.id ? next : i)))}
                  onRemove={() => {
                    change(identifiers.filter((i) => i.id !== ident.id))
                    setSaid(`${ident.text} removed from the list.`)
                  }}
                />
              ))}
            </ul>
          )}
          <AddOwn identifiers={identifiers} onAdd={(ident) => change([...identifiers, ident])} say={setSaid} />
        </section>

        {text && !tooLong && (
          <section aria-labelledby="suggest-heading" className="grid gap-3">
            <h2 id="suggest-heading" className="text-lg font-semibold tracking-tight">
              Suggestions
            </h2>
            <p className="max-w-prose text-sm text-pretty text-dim">
              Capitalized names, emails, phone numbers, links, and @handles found in the transcript. They’re a start, not a check: they miss names written without capitals, in languages
              without capital letters, and words that only start sentences. Type those in yourself.
            </p>
            {strong.length === 0 && weakOnes.length === 0 && <p className="text-sm text-dim">No more suggestions.</p>}
            {strong.length > 0 && <SuggestionList items={more ? strong : strong.slice(0, SHOWN)} onChoose={choose} onDismiss={dismiss} />}
            {strong.length > SHOWN && !more && (
              <div>
                <button type="button" className={quiet} onClick={() => setMore(true)}>
                  Show all {strong.length}
                </button>
              </div>
            )}
            {weakOnes.length > 0 && (
              <div className="grid gap-2">
                <button type="button" className={`${quiet} -ml-2 justify-self-start`} onClick={() => setWeak(!weak)} aria-expanded={weak}>
                  {weak ? 'Hide' : 'Show'} {weakOnes.length} capitalized only at the start of a sentence
                </button>
                {weak && <SuggestionList items={weakOnes.slice(0, 200)} onChoose={choose} onDismiss={dismiss} />}
              </div>
            )}
          </section>
        )}

        {text && !tooLong && (
          <section aria-labelledby="result-heading" className="grid gap-3">
            <h2 id="result-heading" className="text-lg font-semibold tracking-tight">
              Result
            </h2>
            <p className="text-sm" aria-live="polite">
              {identifiers.length === 0 ? 'Choose what to replace, and the result shows here.' : `${total.toLocaleString()} ${total === 1 ? 'change' : 'changes'}, from ${identifiers.length} ${identifiers.length === 1 ? 'identifier' : 'identifiers'}. Nothing else is changed.`}
            </p>
            <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-rule p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap" tabIndex={0} role="region" aria-label="The result, with each change marked" dir="auto">
              {pieces(deferredText, result, PREVIEW).map((p, i) =>
                p.identifier ? (
                  <mark key={i} className="rounded bg-amber-100 px-0.5 text-amber-950 dark:bg-amber-900 dark:text-amber-50">
                    {p.text}
                  </mark>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
              {result.output.length > PREVIEW && <span className="block pt-3 text-dim">The preview ends here; the download has all {result.output.length.toLocaleString()} characters.</span>}
            </div>
            {identifiers.length > 0 && strong.length > 0 && (
              <p className="text-sm text-pretty text-amber-800 dark:text-amber-300">
                {strong.length} {strong.length === 1 ? 'suggestion is' : 'suggestions are'} still waiting for a decision.{' '}
                <a href="#suggest-heading" className="underline underline-offset-4">
                  Go to the suggestions
                </a>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={primary}
                disabled={!identifiers.length}
                onClick={() => {
                  download(result.output, 'transcript-pseudonymized.txt', 'text/plain;charset=utf-8')
                  setSaved(true)
                  setSaid('The transcript was downloaded.')
                }}
              >
                Download the transcript
              </button>
              <button
                type="button"
                className={outline}
                disabled={!identifiers.length}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(result.output)
                    setCopyNote('Copied.')
                  } catch {
                    setCopyNote('This browser didn’t allow copying. Download it instead.')
                  }
                }}
              >
                Copy
              </button>
              <button
                type="button"
                className={outline}
                disabled={!identifiers.length}
                onClick={() => {
                  download(keyCsv(identifiers), 'pseudonym-key.csv', 'text/csv;charset=utf-8')
                  setSaid('The key was downloaded. Keep it apart from the transcript.')
                }}
              >
                Download the key
              </button>
              <span role="status" className="text-sm text-dim">
                {copyNote}
              </span>
            </div>
            <p className="max-w-prose text-sm text-pretty text-dim">
              The files get plain names, as a transcript’s own file name can carry a participant’s name. The key lists every original, so keep it somewhere the transcript isn’t.
            </p>
          </section>
        )}
        <p role="status" className="sr-only">
          {said}
        </p>
      </div>
    </div>
  )
}

function IdentifierRow({ identifier, count, lowercaseLeft, conflict, onChange, onRemove }: { identifier: Identifier; count: number | null; lowercaseLeft: number; conflict: boolean; onChange: (next: Identifier) => void; onRemove: () => void }) {
  const notes = [
    count === 0 && 'not found in this transcript',
    lowercaseLeft > 0 && `also written in lowercase ${lowercaseLeft} ${lowercaseLeft === 1 ? 'time' : 'times'}, left as it is`,
    conflict && 'listed again with another pseudonym: the first is used',
    !identifier.pseudonym.trim() && 'no pseudonym, so it will be removed',
  ].filter(Boolean)
  return (
    <li className="grid gap-2 rounded-xl border border-rule p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
      <label className="grid gap-1">
        <span className="text-xs text-dim">Original</span>
        <input value={identifier.text} maxLength={LIMITS.identifier} onChange={(e) => onChange({ ...identifier, text: e.target.value })} className={field} dir="auto" spellCheck={false} autoComplete="off" aria-invalid={!identifier.text.trim() || undefined} />
      </label>
      <label className="grid gap-1">
        <span className="text-xs text-dim">Becomes</span>
        <input value={identifier.pseudonym} maxLength={LIMITS.pseudonym} onChange={(e) => onChange({ ...identifier, pseudonym: e.target.value })} className={field} dir="auto" spellCheck={false} autoComplete="off" />
      </label>
      <div className="flex items-center gap-1 sm:pb-0.5">
        <span className="min-w-14 text-right text-sm text-dim tabular-nums">{count === null ? '' : `${count}×`}</span>
        <button type="button" className={quiet} onClick={onRemove} aria-label={`Remove ${identifier.text || 'this row'}`}>
          Remove
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:col-span-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={identifier.lowercase} onChange={(e) => onChange({ ...identifier, lowercase: e.target.checked })} className="size-4 cursor-pointer accent-current" />
          Also when written in lowercase
        </label>
        {notes.length > 0 && <p className="text-sm text-amber-800 dark:text-amber-300">{notes.join('; ')}</p>}
      </div>
    </li>
  )
}

function AddOwn({ identifiers, onAdd, say }: { identifiers: Identifier[]; onAdd: (identifier: Identifier) => void; say: (message: string) => void }) {
  const [text, setText] = useState('')
  const [pseudonym, setPseudonym] = useState('')
  const full = identifiers.length >= LIMITS.identifiers
  const placeholder = nextPseudonym('name', identifiers)
  return (
    <form
      className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault()
        if (!text.trim() || full) return
        const p = pseudonym.trim() || placeholder
        onAdd({ id: newId(), text: text.trim(), pseudonym: p, lowercase: false })
        say(`${text.trim()} will become ${p}.`)
        setText('')
        setPseudonym('')
      }}
    >
      <label className="grid gap-1">
        <span className="text-sm font-medium">Add a name or anything else</span>
        <input value={text} maxLength={LIMITS.identifier} onChange={(e) => setText(e.target.value)} placeholder="Such as a street, a school, or a job title" className={field} dir="auto" spellCheck={false} autoComplete="off" />
      </label>
      <label className="grid gap-1">
        <span className="text-sm font-medium">Becomes</span>
        <input value={pseudonym} maxLength={LIMITS.pseudonym} onChange={(e) => setPseudonym(e.target.value)} placeholder={placeholder} className={field} dir="auto" spellCheck={false} autoComplete="off" />
      </label>
      <button type="submit" className={outline} disabled={!text.trim() || full}>
        Add
      </button>
      {full && <p className="text-sm text-dim sm:col-span-3">That’s the most this page lists ({LIMITS.identifiers}).</p>}
    </form>
  )
}

const keyOf = (s: Suggestion) => `${s.kind}:${s.text}`

function SuggestionList({ items, onChoose, onDismiss }: { items: Suggestion[]; onChoose: (s: Suggestion) => void; onDismiss: (s: Suggestion) => void }) {
  const list = useRef<HTMLUListElement>(null)
  // A chosen or dismissed suggestion leaves the list (a moment later, on a long transcript), so once it has, keyboard
  // focus moves on to the one that takes its place.
  const refocus = useRef<{ at: number; key: string } | null>(null)
  useEffect(() => {
    const pending = refocus.current
    if (!pending || items.some((s) => keyOf(s) === pending.key)) return
    refocus.current = null
    const rows = list.current?.querySelectorAll('li')
    if (!rows?.length) return
    rows[Math.min(pending.at, rows.length - 1)].querySelector('button')?.focus()
  }, [items])
  const act = (i: number, s: Suggestion, f: () => void) => {
    refocus.current = { at: i, key: keyOf(s) }
    f()
  }
  return (
    <ul ref={list} className="grid gap-2">
      {items.map((s, i) => (
        <li key={keyOf(s)} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-rule px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium break-words" dir="auto">
                {s.text}
              </span>
              <span className="text-xs text-dim">
                {KIND_LABELS[s.kind]} · {s.count}×
              </span>
            </p>
            <p className="truncate text-sm text-dim" dir="auto">
              {s.context}
            </p>
          </div>
          <div className="flex gap-1">
            <button type="button" className={outline} onClick={() => act(i, s, () => onChoose(s))} aria-label={`Replace ${s.text}`}>
              Replace
            </button>
            <button type="button" className={quiet} onClick={() => act(i, s, () => onDismiss(s))} aria-label={`Leave ${s.text} as it is`}>
              Leave it
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function FileButton({ label, accept, onFile, quietStyle = false }: { label: string; accept: string; onFile: (file: File) => void | Promise<void>; quietStyle?: boolean }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={quietStyle ? quiet : outline} onClick={() => input.current?.click()}>
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

/** A transcript file's text: Word's main text, or a text file's (UTF-8, or UTF-16 with its mark). */
async function readTranscript(file: File): Promise<{ text: string; note: string } | { error: string }> {
  if (file.size > 25_000_000) return { error: 'That file is too big to read here.' }
  const bytes = new Uint8Array(await file.arrayBuffer())
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b
  if (/\.docx$/i.test(file.name) || isZip) {
    try {
      const text = await docxText(bytes)
      return { text, note: 'Read the main text of the Word file. Comments, tracked deletions, headers, footers, and footnotes aren’t included, and the result is plain text.' }
    } catch (e) {
      const why = (e as Error).message
      return { error: why === 'too-big' ? 'That Word file is too big to read here.' : 'This doesn’t look like a Word (.docx) file. Older .doc files and password-protected ones can’t be read here: save it as .docx or plain text first.' }
    }
  }
  if (/\.(doc|pdf|rtf|odt|pages)$/i.test(file.name)) return { error: 'This page reads plain text and Word (.docx) files. Save it as one of those, or copy the text and paste it in.' }
  let text: string
  if (bytes[0] === 0xff && bytes[1] === 0xfe) text = new TextDecoder('utf-16le').decode(bytes.subarray(2))
  else if (bytes[0] === 0xfe && bytes[1] === 0xff) text = new TextDecoder('utf-16be').decode(bytes.subarray(2))
  else text = new TextDecoder('utf-8').decode(bytes).replace(/^\uFEFF/, '')
  if (text.includes('\u0000')) return { error: 'This doesn’t look like a text file. Save it as plain text or .docx first.' }
  return { text, note: '' }
}

function download(content: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
