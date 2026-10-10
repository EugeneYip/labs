import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ItemDialog, type ItemChanges } from './ItemDialog.tsx'
import { ItemRow } from './ItemRow.tsx'
import {
  boardToJson,
  bySettledThenNewest,
  CATEGORIES,
  CATEGORY_LABELS,
  createItem,
  EMPTY_BOARD,
  exportFileName,
  matchesSearch,
  parseBoardJson,
  STATUS_LABELS,
  STATUSES,
  type Board,
  type Category,
  type Item,
  type ParsedBoard,
  type Status,
} from './model.ts'
import { QuickAdd, type NewItem } from './QuickAdd.tsx'
import { Button, ConfirmDialog, fieldStyles, Select, type Confirmation } from './ui.tsx'
import { useBoard } from './useBoard.ts'

interface Notice {
  message: string
  /** The board as it was before the change, when the change can be undone. */
  undo?: Board
}

interface Filters {
  search: string
  category: Category | 'all'
  status: Status | 'all'
}

const NO_FILTERS: Filters = { search: '', category: 'all', status: 'all' }

/** Experiment #001: one private board for collecting and deciding on trip research. */
export default function TripBoard() {
  const [board, setBoard, saved] = useBoard()
  const [filters, setFilters] = useState(NO_FILTERS)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [flashIds, setFlashIds] = useState<string[]>([])
  const fileInput = useRef<HTMLInputElement>(null)

  const { items } = board
  const isEmpty = items.length === 0 && board.name === ''
  const editing = items.find((item) => item.id === editingId)
  const passes = (item: Item) =>
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.status === 'all' || item.status === filters.status) &&
    matchesSearch(item, filters.search)
  const visible = items.filter(passes)
  const groups = CATEGORIES.map((category) => ({
    category,
    items: visible.filter((item) => item.category === category).sort(bySettledThenNewest),
  })).filter((group) => group.items.length > 0)
  const filtered = filters.search.trim() !== '' || filters.category !== 'all' || filters.status !== 'all'

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), notice.undo ? 8000 : 4000)
    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    if (flashIds.length === 0) return
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(`item-${flashIds[0]}`)?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
    const timer = setTimeout(() => setFlashIds([]), 1200)
    return () => clearTimeout(timer)
  }, [flashIds])

  /** Every change to the board goes through here. Any change clears the previous notice, so an old Undo can't undo newer work. */
  function change(next: Board, message?: string, undoable = false) {
    setNotice(message ? { message, undo: undoable ? board : undefined } : null)
    setBoard(next)
  }

  function addItems(drafts: NewItem[]) {
    const now = new Date()
    const added = drafts.map((draft) => createItem(draft, now))
    change({ ...board, items: [...items, ...added] }, added.length > 1 ? `Added ${added.length} items.` : undefined)
    if (!added.every(passes)) setFilters(NO_FILTERS) // Never add something out of sight.
    setFlashIds(added.map((item) => item.id))
  }

  function updateItem(id: string, changes: ItemChanges) {
    const updatedAt = new Date().toISOString()
    change({ ...board, items: items.map((item) => (item.id === id ? { ...item, ...changes, updatedAt } : item)) })
    setFlashIds([id])
  }

  // Stable, so unchanged rows can skip re-rendering. A status change needs no undo: it's one click to change back.
  const setStatus = useCallback(
    (id: string, status: Status) => {
      const updatedAt = new Date().toISOString()
      setNotice(null)
      setBoard((current) => ({ ...current, items: current.items.map((item) => (item.id === id ? { ...item, status, updatedAt } : item)) }))
      setFlashIds([id])
    },
    [setBoard],
  )

  function deleteItem(item: Item) {
    setEditingId(null)
    change({ ...board, items: items.filter((other) => other.id !== item.id) }, `Deleted “${item.title}”.`, true)
  }

  function exportBoard() {
    const now = new Date()
    const fileName = exportFileName(board, now)
    const href = URL.createObjectURL(new Blob([boardToJson(board, now)], { type: 'application/json' }))
    const link = Object.assign(document.createElement('a'), { href, download: fileName })
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(href), 30_000)
    setNotice({ message: `Exported ${fileName}` })
  }

  async function importBoard(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // So choosing the same file again still works.
    if (!file) return
    let result: ParsedBoard
    try {
      result = file.size > 5_000_000 ? { error: "This file is too large to be a Trip Board file." } : parseBoardJson(await file.text())
    } catch {
      result = { error: "This file couldn't be read." }
    }
    const imported = result.board
    if (!imported) {
      setConfirmation({ title: "Couldn't import that file", message: `${result.error} Your board hasn't changed.`, confirmLabel: 'OK' })
      return
    }
    const replace = () => {
      change(imported, `Imported “${boardName(imported)}”, ${countItems(imported.items.length)}.`, !isEmpty)
      setFilters(NO_FILTERS)
    }
    if (isEmpty) return replace()
    setConfirmation({
      title: 'Replace this board?',
      message: `“${boardName(board)}” (${countItems(items.length)}) will be replaced by “${boardName(imported)}” (${countItems(imported.items.length)}) from the file. To keep the current board, export it first.`,
      confirmLabel: 'Replace board',
      onConfirm: replace,
    })
  }

  function startOver() {
    setConfirmation({
      title: 'Start over?',
      message: `This deletes “${boardName(board)}”${items.length > 0 ? ` and its ${countItems(items.length)}` : ''} from this browser. Export it first if you might want it back.`,
      confirmLabel: 'Delete board',
      onConfirm: () => {
        change(EMPTY_BOARD, 'Board deleted.', true)
        setFilters(NO_FILTERS)
      },
    })
  }

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-4 pt-6 pb-28 sm:px-6 sm:pt-10">
        {!saved && (
          <p role="alert" className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-300">
            This browser isn't saving your board, perhaps because storage is blocked or full. Export a file to keep your work.
          </p>
        )}

        <header>
          <input
            value={board.name}
            onChange={(event) => change({ ...board, name: event.target.value })}
            dir="auto"
            maxLength={200}
            placeholder="Name this trip"
            aria-label="Trip name"
            autoComplete="off"
            className="-mx-2 w-[calc(100%+1rem)] rounded-lg bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight placeholder:text-dim hover:bg-ink/5 sm:text-3xl"
          />
          {items.length > 0 && <p className="mt-1 text-sm text-dim">{summarize(items)}</p>}
        </header>

        <div className="mt-6">
          <QuickAdd items={items} onAdd={addItems} />
        </div>

        {items.length === 0 ? (
          <div className="mt-10 max-w-xl text-sm/relaxed text-dim">
            <p>
              Gather everything you're weighing for this trip: flights, places to stay, restaurants, things to do,
              articles, and Reddit threads. Paste a link above or type an idea, then mark each one as you decide.
            </p>
            <p className="mt-3">
              Have a board file from another device?{' '}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="cursor-pointer text-ink underline underline-offset-4 hover:text-dim"
              >
                Import it
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <div role="search" className="mt-8 flex flex-col gap-2 sm:flex-row">
              <input
                type="search"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder="Search titles, notes, and links"
                aria-label="Search"
                enterKeyHint="search"
                className={`${fieldStyles} h-11 sm:h-10 sm:flex-1`}
              />
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Select
                  value={filters.category}
                  onChange={(event) => setFilters({ ...filters, category: event.target.value as Filters['category'] })}
                  aria-label="Show category"
                  className="sm:w-44"
                >
                  <option value="all">All categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]} ({items.filter((item) => item.category === category).length})
                    </option>
                  ))}
                </Select>
                <Select
                  value={filters.status}
                  onChange={(event) => setFilters({ ...filters, status: event.target.value as Filters['status'] })}
                  aria-label="Show status"
                  className="sm:w-44"
                >
                  <option value="all">All statuses</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]} ({items.filter((item) => item.status === status).length})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {filtered && (
              <p className="mt-3 text-sm text-dim">
                Showing {visible.length} of {countItems(items.length)}.{' '}
                <button
                  type="button"
                  onClick={() => setFilters(NO_FILTERS)}
                  className="cursor-pointer text-ink underline underline-offset-4 hover:text-dim"
                >
                  Clear filters
                </button>
              </p>
            )}

            {groups.map(({ category, items: groupItems }) => (
              <section key={category} aria-labelledby={`group-${category}`} className="mt-8">
                <h2
                  id={`group-${category}`}
                  className="flex items-baseline gap-2 border-b border-rule px-2 pb-2 font-mono text-xs tracking-widest text-dim uppercase"
                >
                  {CATEGORY_LABELS[category]}
                  <span className="tracking-normal">
                    {groupItems.length}
                    <span className="sr-only"> {groupItems.length === 1 ? 'item' : 'items'}</span>
                  </span>
                </h2>
                <ul className="divide-y divide-rule">
                  {groupItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      flash={flashIds.includes(item.id)}
                      onStatus={setStatus}
                      onEdit={setEditingId}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}

        <footer className="mt-14 flex flex-col gap-3 border-t border-rule pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-dim">
            Saved only in this browser. Nothing is uploaded. Browsers can clear saved data, and Safari on iPhones, iPads, and Macs can do it after about a week without a visit, so export a file to back up your board or move it to another device.
          </p>
          <div className="-ml-3 flex shrink-0 sm:ml-0">
            <Button onClick={exportBoard} disabled={isEmpty}>
              Export
            </Button>
            <Button onClick={() => fileInput.current?.click()}>Import</Button>
            <Button variant="danger" onClick={startOver} disabled={isEmpty}>
              Start over
            </Button>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            onChange={importBoard}
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />
        </footer>
      </div>

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-10 flex justify-center px-4">
        {notice && (
          <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-lg bg-ink py-2 pr-2 pl-4 text-sm text-paper shadow-lg">
            <span className="min-w-0 truncate">{notice.message}</span>
            {notice.undo && (
              <button
                type="button"
                onClick={() => {
                  setBoard(notice.undo!)
                  setNotice(null)
                }}
                className="shrink-0 cursor-pointer rounded-md px-2.5 py-1 font-medium hover:bg-paper/15 focus-visible:outline-paper"
              >
                Undo
              </button>
            )}
          </div>
        )}
      </div>

      {editing && (
        <ItemDialog
          key={editing.id}
          item={editing}
          onSave={(changes) => updateItem(editing.id, changes)}
          onDelete={() => deleteItem(editing)}
          onClose={() => setEditingId(null)}
        />
      )}
      {confirmation && <ConfirmDialog {...confirmation} onDone={() => setConfirmation(null)} />}
    </div>
  )
}

function boardName(board: Board): string {
  return board.name.trim() || 'Untitled trip'
}

function countItems(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}

function summarize(items: Item[]): string {
  const booked = items.filter((item) => item.status === 'booked').length
  const decided = items.filter((item) => item.status === 'decided').length
  return [countItems(items.length), booked > 0 && `${booked} booked`, decided > 0 && `${decided} decided`].filter(Boolean).join(' · ')
}
