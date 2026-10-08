import { memo } from 'react'
import { linkLabel, STATUS_LABELS, STATUS_TONES, STATUSES, type Item, type Status } from './model.ts'
import { Button } from './ui.tsx'

/**
 * One item: its title (a link when it has one), where the link goes, its note,
 * and its status. Memoized, so a change to one item doesn't re-render the rest.
 */
export const ItemRow = memo(function ItemRow({
  item,
  flash,
  onStatus,
  onEdit,
}: {
  item: Item
  /** Briefly highlighted after it is added or changed. */
  flash: boolean
  onStatus: (id: string, status: Status) => void
  onEdit: (id: string) => void
}) {
  const skipped = item.status === 'skip'
  const site = item.url ? linkLabel(item.url) : ''

  return (
    <li
      id={`item-${item.id}`}
      className={`grid scroll-my-24 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 px-2 py-3 transition-colors duration-1000 sm:grid-cols-[1fr_auto_auto] sm:items-start ${flash ? 'bg-amber-500/10 duration-0' : ''}`}
    >
      <div className="col-span-2 min-w-0 sm:col-span-1">
        <p dir="auto" className={`text-[15px]/snug font-medium break-words ${skipped ? 'text-dim line-through' : ''}`}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              {item.title}
              <span aria-hidden="true" className="text-dim">
                {' ↗'}
              </span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            item.title
          )}
        </p>
        {site && site !== item.title && <p className="mt-0.5 truncate text-xs text-dim">{site}</p>}
        {item.note && <p dir="auto" className="mt-1.5 text-sm/relaxed break-words whitespace-pre-wrap text-dim">{item.note}</p>}
      </div>

      <StatusSelect status={item.status} label={`Status of ${item.title}`} onChange={(status) => onStatus(item.id, status)} />
      <Button onClick={() => onEdit(item.id)} aria-label={`Edit ${item.title}`} className="justify-self-end sm:-mt-1">
        Edit
      </Button>
    </li>
  )
})

/** A status pill that is really a native select, so phones show their own picker. */
function StatusSelect({ status, label, onChange }: { status: Status; label: string; onChange: (status: Status) => void }) {
  return (
    <span className={`relative inline-flex w-fit items-center rounded-full sm:w-34 ${STATUS_TONES[status]}`}>
      <span aria-hidden="true" className="pointer-events-none absolute left-3 size-1.5 rounded-full bg-current" />
      <select
        value={status}
        onChange={(event) => onChange(event.target.value as Status)}
        aria-label={label}
        className="h-9 w-full cursor-pointer appearance-none rounded-full bg-transparent pr-7 pl-6.5 text-base font-medium sm:h-7 sm:text-xs"
      >
        {STATUSES.map((option) => (
          <option key={option} value={option} className="bg-paper text-ink">
            {STATUS_LABELS[option]}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-3 text-[0.5rem]">
        ▼
      </span>
    </span>
  )
}
