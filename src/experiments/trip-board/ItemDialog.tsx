import { useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  LIMITS,
  normalizeUrl,
  STATUS_LABELS,
  STATUS_TONES,
  STATUSES,
  type Item,
} from './model.ts'
import { Button, fieldStyles, Modal } from './ui.tsx'

export type ItemChanges = Pick<Item, 'title' | 'url' | 'category' | 'status' | 'note'>

/** Edits every field of an item. Enter in a single-line field saves; Ctrl/⌘+Enter saves from the note. */
export function ItemDialog({
  item,
  onSave,
  onDelete,
  onClose,
}: {
  item: Item
  onSave: (changes: ItemChanges) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(item.title)
  const [link, setLink] = useState(item.url)
  const [category, setCategory] = useState(item.category)
  const [status, setStatus] = useState(item.status)
  const [note, setNote] = useState(item.note)
  const [errors, setErrors] = useState<{ title?: string; link?: string }>({})

  function save(event: FormEvent<HTMLFormElement>) {
    const url = link.trim() === '' ? '' : normalizeUrl(link)
    const problems = {
      title: title.trim() === '' ? 'Add a title.' : undefined,
      link: url === null ? "That doesn't look like a web address. Check it, or leave it empty." : undefined,
    }
    if (problems.title || problems.link) {
      event.preventDefault() // Keeps the dialog open.
      setErrors(problems)
      return
    }
    onSave({ title: title.trim(), url: url ?? '', category, status, note: note.trim() })
  }

  function close(event: MouseEvent<HTMLButtonElement>) {
    event.currentTarget.closest('dialog')?.close()
  }

  return (
    <Modal labelledBy="item-dialog-title" onClose={onClose}>
      {/* Save is the form's only submit button, so pressing Enter can never delete. */}
      <form
        method="dialog"
        noValidate
        onSubmit={save}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) event.currentTarget.requestSubmit()
        }}
      >
        <h2 id="item-dialog-title" className="text-lg font-semibold tracking-tight">
          Edit item
        </h2>

        <Field label="Title" error={errors.title}>
          {(props) => (
            <input
              {...props}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              dir="auto"
              maxLength={LIMITS.title}
              autoComplete="off"
              className={`${fieldStyles} h-11 sm:h-10`}
            />
          )}
        </Field>

        <Field label="Link" error={errors.link}>
          {(props) => (
            <input
              {...props}
              value={link}
              onChange={(event) => setLink(event.target.value)}
              maxLength={LIMITS.url}
              placeholder="Optional"
              inputMode="url"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className={`${fieldStyles} h-11 sm:h-10`}
            />
          )}
        </Field>

        <Choices label="Category">
          {CATEGORIES.map((value) => (
            <Choice
              key={value}
              name="category"
              value={value}
              label={CATEGORY_LABELS[value]}
              checked={category === value}
              onChange={() => setCategory(value)}
              tone="bg-ink text-paper ring-ink"
            />
          ))}
        </Choices>

        <Choices label="Status">
          {STATUSES.map((value) => (
            <Choice
              key={value}
              name="status"
              value={value}
              label={STATUS_LABELS[value]}
              checked={status === value}
              onChange={() => setStatus(value)}
              tone={`${STATUS_TONES[value]} ring-2 ring-current`}
            />
          ))}
        </Choices>

        <Field label="Note">
          {(props) => (
            <textarea
              {...props}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              dir="auto"
              maxLength={LIMITS.note}
              rows={4}
              placeholder="Optional: prices, times, who recommended it…"
              className={`${fieldStyles} block resize-y py-2`}
            />
          )}
        </Field>

        <p className="mt-3 text-xs text-dim">
          Added {formatDate(item.createdAt)}
          {item.updatedAt !== item.createdAt && ` · Edited ${formatDate(item.updatedAt)}`}
        </p>

        <div className="mt-6 flex items-center gap-2">
          <Button
            variant="danger"
            onClick={(event) => {
              onDelete()
              close(event)
            }}
            className="-ml-3"
          >
            Delete
          </Button>
          <Button onClick={close} className="ml-auto">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: (props: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode
}) {
  const id = `field-${label.toLowerCase()}`
  return (
    <div className="mt-4">
      <label htmlFor={id} className="text-xs font-medium text-dim">
        {label}
      </label>
      <div className="mt-1.5">
        {children({ id, ...(error && { 'aria-invalid': true, 'aria-describedby': `${id}-error` }) })}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

function Choices({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="mt-4">
      <legend className="text-xs font-medium text-dim">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  )
}

/** A radio button drawn as a chip. Arrow keys move between chips in the same group. */
function Choice({
  name,
  value,
  label,
  checked,
  onChange,
  tone,
}: {
  name: string
  value: string
  label: string
  checked: boolean
  onChange: () => void
  /** Classes for the chosen chip. */
  tone: string
}) {
  return (
    <label>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`inline-flex h-9 cursor-pointer items-center rounded-full px-3.5 text-sm ring-inset peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${checked ? `font-medium ${tone}` : 'ring-1 ring-rule hover:bg-ink/5'}`}
      >
        {label}
      </span>
    </label>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' })
}
