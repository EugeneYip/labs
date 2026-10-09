import { useDeferredValue, useEffect, useState } from 'react'
import { DEFAULT_OPTIONS, mend, type Options, type Stats } from './model.ts'

// Only the options are remembered. Pasted text never leaves the page and isn't stored.
const STORAGE_KEY = 'labs:clean-paste'

const TOGGLES: [keyof Omit<Options, 'paragraphBreak'>, string][] = [
  ['joinLines', 'Rejoin broken lines'],
  ['fixHyphens', 'Rejoin split words'],
  ['dropPageFurniture', 'Remove page numbers and headers'],
  ['tidyCharacters', 'Fix odd characters and spaces'],
  ['stripQuoteMarks', 'Remove email “>” marks'],
  ['straightQuotes', 'Straighten quotes'],
]

const EXAMPLE = `Journal of Coastal Studies
The Quiet Economics of Lighthouses

For most of the nineteenth century, lighthouses were
financed by fees collected from ships in port, an ar-
rangement that economists have long used as an exam-
ple of a public good provided privately. This paper re-
visits that example using harbour records from 1820
to 1880.

The well-known argument holds that no ship would pay
for a light it could see for free. Yet the records show
that the largest and most well-known shipping lines
paid their fees without dispute, and that the ports
competed to keep them low. The ques-
12
tion is who paid, and why. The evidence comes in
three forms:
• Fees varied by tonnage and by the route a ship took
  between ports along the coast.
• Some ports offered annual passes for regular
  traders.
• Exemptions were rare.`

const button =
  'inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg px-3 text-sm transition-colors disabled:pointer-events-none disabled:opacity-40'

/** Experiment #004: repairs text copied from PDFs and emails. */
export default function CleanPaste() {
  const [input, setInput] = useState('')
  const [options, setOptions] = useState(loadOptions)
  const [copied, setCopied] = useState(false)
  const deferred = useDeferredValue(input)
  const { text, stats } = mend(deferred, options)
  const canPaste = typeof navigator.clipboard?.readText === 'function'

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options))
    } catch {
      // Not saved; the options still apply to this visit.
    }
  }, [options])

  useEffect(() => setCopied(false), [text])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      const output = document.getElementById('clean-output') as HTMLTextAreaElement | null
      output?.select()
    }
  }

  async function pasteFromClipboard() {
    try {
      setInput(await navigator.clipboard.readText())
    } catch {
      document.getElementById('messy-input')?.focus()
    }
  }

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10">
        <p className="max-w-2xl text-pretty text-dim">
          Paste text copied from a PDF or an email. Clean Paste rejoins lines broken in the middle of sentences and words
          split by hyphens, and removes page numbers and repeated headers, so it reads as ordinary paragraphs again.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="input-heading" className="flex min-w-0 flex-col">
            <div className="flex min-h-10 flex-wrap items-center gap-x-1">
              <h2 id="input-heading" className="mr-auto font-medium">
                Messy text
              </h2>
              {canPaste && (
                <button type="button" onClick={() => void pasteFromClipboard()} className={`${button} text-dim hover:bg-ink/5 hover:text-ink`}>
                  Paste
                </button>
              )}
              <button type="button" onClick={() => setInput(EXAMPLE)} className={`${button} text-dim hover:bg-ink/5 hover:text-ink`}>
                Try an example
              </button>
              <button type="button" onClick={() => setInput('')} disabled={!input} className={`${button} text-dim hover:bg-ink/5 hover:text-ink`}>
                Clear
              </button>
            </div>
            <textarea
              id="messy-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste text here"
              aria-labelledby="input-heading"
              spellCheck={false}
              dir="auto"
              className="mt-2 h-64 w-full resize-y rounded-xl border border-rule bg-paper p-4 font-mono text-base/relaxed text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm/relaxed lg:h-[28rem]"
            />
          </section>

          <section aria-labelledby="output-heading" className="flex min-w-0 flex-col">
            <div className="flex min-h-10 flex-wrap items-center gap-x-1">
              <h2 id="output-heading" className="mr-auto font-medium">
                Clean text
              </h2>
              <p role="status" className="px-3 text-sm text-green-800 dark:text-green-300">
                {copied ? 'Copied' : ''}
              </p>
              <button type="button" onClick={() => void copy()} disabled={!text} className={`${button} bg-ink px-4 font-medium text-paper hover:bg-ink/80`}>
                Copy
              </button>
            </div>
            <textarea
              id="clean-output"
              value={text}
              readOnly
              placeholder="The clean version appears here"
              aria-labelledby="output-heading"
              aria-describedby="changes"
              dir="auto"
              className="mt-2 h-64 w-full resize-y rounded-xl border border-rule bg-ink/[0.03] p-4 text-base/relaxed text-ink placeholder:text-dim sm:text-sm/relaxed lg:h-[28rem]"
            />
            <p id="changes" className="mt-2 text-sm text-dim">
              {input ? summary(stats) : ' '}
            </p>
          </section>
        </div>

        <fieldset className="mt-8">
          <legend className="font-mono text-xs tracking-widest text-dim uppercase">Options</legend>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3">
            {TOGGLES.map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                  className="size-4 cursor-pointer accent-current"
                />
                {label}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              Between paragraphs
              <select
                value={options.paragraphBreak}
                onChange={(e) => setOptions({ ...options, paragraphBreak: e.target.value as Options['paragraphBreak'] })}
                className="h-9 cursor-pointer rounded-lg border border-rule bg-paper px-2 text-base text-ink sm:text-sm"
              >
                <option value="blank">a blank line</option>
                <option value="single">a line break</option>
              </select>
            </label>
          </div>
        </fieldset>
        <p className="mt-8 text-sm text-dim">Your text stays on this device. Nothing is uploaded or saved.</p>
      </div>
    </div>
  )
}

function summary(stats: Stats): string {
  const parts = [
    stats.joinedLines && `rejoined ${stats.joinedLines} broken ${stats.joinedLines === 1 ? 'line' : 'lines'}`,
    stats.fixedHyphens && `${stats.fixedHyphens} split ${stats.fixedHyphens === 1 ? 'word' : 'words'}`,
    stats.removedLines && `removed ${stats.removedLines} page ${stats.removedLines === 1 ? 'number or header' : 'numbers and headers'}`,
    stats.fixedCharacters && `fixed ${stats.fixedCharacters} odd ${stats.fixedCharacters === 1 ? 'character' : 'characters'}`,
  ].filter(Boolean)
  if (!parts.length) return 'Nothing needed fixing.'
  const sentence = parts.join(', ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

function loadOptions(): Options {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!saved || typeof saved !== 'object') return DEFAULT_OPTIONS
    const options = { ...DEFAULT_OPTIONS }
    for (const [key] of TOGGLES) if (typeof saved[key] === 'boolean') options[key] = saved[key]
    if (saved.paragraphBreak === 'blank' || saved.paragraphBreak === 'single') options.paragraphBreak = saved.paragraphBreak
    return options
  } catch {
    return DEFAULT_OPTIONS
  }
}
