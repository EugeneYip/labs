import { useRef, useState, type ClipboardEvent, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  guessCategory,
  LIMITS,
  linkKey,
  normalizeUrl,
  readPaste,
  STATUS_LABELS,
  titleFromUrl,
  type Category,
  type Item,
  type PastedLink,
} from './model.ts'
import { Button, fieldStyles, Select } from './ui.tsx'

export type NewItem = Pick<Item, 'title' | 'url' | 'category'>

/**
 * The add bar. Type a title, or paste a link: the link is attached, a title is
 * suggested from its address, and well-known sites choose their own category.
 * Pasting several links offers to add them all.
 */
export function QuickAdd({ items, onAdd }: { items: Item[]; onAdd: (items: NewItem[]) => void }) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [chosen, setChosen] = useState<Category>('other') // the category last picked by hand
  const [picked, setPicked] = useState(false) // picked by hand for the current item
  const [batch, setBatch] = useState<PastedLink[] | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const categoryFor = (link: string) => (!picked && link && guessCategory(link)) || chosen
  const saved = url ? findSaved(items, url) : undefined
  const fresh = batch ? newLinks(batch, items) : []

  function reset() {
    setTitle('')
    setUrl('')
    setPicked(false)
    setBatch(null)
    input.current?.focus()
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const { links, heading } = readPaste(event.clipboardData.getData('text'))
    if (links.length === 0) return // Plain text pastes as usual.
    event.preventDefault()
    if (links.length > 1) return setBatch(links)
    const [link] = links
    if (title.trim() !== '') return setUrl(link.url) // Keep the title already typed.
    flushSync(() => {
      setUrl(link.url)
      setTitle((link.label || heading || titleFromUrl(link.url)).slice(0, LIMITS.title))
    })
    input.current?.select() // So typing replaces the suggestion.
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    let text = title.trim()
    let link = url
    // A link typed out in full rather than pasted.
    const typed = link ? null : /^(https?:\/\/|www\.)\S+$/i.test(text) && normalizeUrl(text)
    if (typed) {
      link = typed
      text = titleFromUrl(typed)
    }
    if (!text && link) text = titleFromUrl(link)
    if (!text) return input.current?.focus()
    onAdd([{ title: text.slice(0, LIMITS.title), url: link, category: categoryFor(link) }])
    reset()
  }

  function addBatch() {
    onAdd(fresh.map((link) => ({ title: (link.label || titleFromUrl(link.url)).slice(0, LIMITS.title), url: link.url, category: guessCategory(link.url) ?? chosen })))
    reset()
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        {url && (
          <p className="flex basis-full items-center gap-2 rounded-lg bg-ink/5 py-1 pr-1 pl-3 text-xs">
            <span className="text-dim">Link</span>
            <span className="min-w-0 flex-1 truncate">{url}</span>
            <button
              type="button"
              onClick={() => setUrl('')}
              aria-label="Remove link"
              className="cursor-pointer rounded-md px-2 py-1 text-dim hover:bg-ink/5 hover:text-ink"
            >
              ✕
            </button>
          </p>
        )}
        <input
          ref={input}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onPaste={handlePaste}
          dir="auto"
          maxLength={LIMITS.title}
          placeholder="Paste a link or type a title"
          aria-label="Title or link"
          autoComplete="off"
          enterKeyHint="done"
          className={`${fieldStyles} h-11 basis-full sm:h-10 sm:basis-0 sm:flex-1`}
        />
        <Select
          value={categoryFor(url)}
          onChange={(event) => {
            setChosen(event.target.value as Category)
            setPicked(true)
          }}
          aria-label="Category"
          className="flex-1 sm:w-36 sm:flex-none"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="primary" className="h-11 w-24 sm:h-10 sm:w-auto">
          Add
        </Button>
      </form>

      <div aria-live="polite">
        {saved && (
          <p className="mt-2 text-xs text-dim">
            Already on this board: “{saved.title}”, {CATEGORY_LABELS[saved.category]}, {STATUS_LABELS[saved.status]}.
          </p>
        )}
      </div>

      {batch && (
        <div role="group" aria-labelledby="batch-summary" className="mt-3 rounded-lg border border-rule p-4">
          <p id="batch-summary" className="text-sm">
            {fresh.length === 0
              ? 'All of those links are already on this board.'
              : `Add ${fresh.length} ${fresh.length === 1 ? 'link' : 'links'} as separate items?`}
            {fresh.length > 0 && batch.length > fresh.length && (
              <span className="text-dim"> {batch.length - fresh.length} already on the board will be left out.</span>
            )}
          </p>
          {fresh.length > 0 && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-dim">
              {fresh.map((link) => (
                <li key={link.url} dir="auto" className="truncate">
                  {link.label || titleFromUrl(link.url)}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            {fresh.length > 0 && (
              <Button variant="primary" onClick={addBatch} autoFocus>
                Add {fresh.length}
              </Button>
            )}
            <Button onClick={reset} autoFocus={fresh.length === 0}>
              {fresh.length > 0 ? 'Cancel' : 'OK'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function findSaved(items: Item[], url: string): Item | undefined {
  const key = linkKey(url)
  return items.find((item) => item.url !== '' && linkKey(item.url) === key)
}

/** Pasted links not already on the board, each once. */
function newLinks(batch: PastedLink[], items: Item[]): PastedLink[] {
  const seen = new Set(items.filter((item) => item.url !== '').map((item) => linkKey(item.url)))
  return batch.filter((link) => {
    const key = linkKey(link.url)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
