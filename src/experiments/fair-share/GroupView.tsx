import { useRef, useState, type FormEvent } from 'react'
import {
  amountToText,
  balances,
  encodeGroup,
  formatMoney,
  isInvolved,
  LIMITS,
  parseAmount,
  randomId,
  removePerson,
  settle,
  shares,
  totalSpent,
  type Entry,
  type Group,
} from './model.ts'
import { field, primary, quiet, sectionHeading } from './styles.ts'

export function GroupView({ group, onChange }: { group: Group; onChange: (group: Group) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [removed, setRemoved] = useState<{ entry: Entry; index: number } | null>(null)
  const [shareNote, setShareNote] = useState('')
  const owed = balances(group)
  const transfers = settle(owed)
  const money = (amount: number, signed = false) => formatMoney(amount, group.currency, signed)
  const name = (person: number) => group.people[person]

  function setEntries(entries: Entry[], keepUndo = false) {
    if (!keepUndo) setRemoved(null)
    onChange({ ...group, entries })
  }

  function removeEntry(entry: Entry) {
    const index = group.entries.indexOf(entry)
    setEntries(group.entries.filter((e) => e !== entry))
    setRemoved({ entry, index })
  }

  async function shareLink() {
    const url = `${location.origin}${location.pathname}#${await encodeGroup(group)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: group.name || 'Fair Share', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShareNote('Link copied.')
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setShareNote('Couldn’t copy automatically. Copy the address from the address bar instead.')
    }
  }

  return (
    <>
      <a href={location.pathname} className="text-sm text-dim underline-offset-4 hover:text-ink hover:underline">
        ← All groups
      </a>
      <header className="mt-4">
        <input
          value={group.name}
          onChange={(e) => onChange({ ...group, name: e.target.value })}
          maxLength={LIMITS.name}
          placeholder="Untitled group"
          aria-label="Group name"
          dir="auto"
          className="-mx-2 w-[calc(100%+1rem)] rounded-lg bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight placeholder:text-dim hover:bg-ink/5 sm:text-3xl"
        />
        <p className="mt-1 text-sm text-dim">
          {group.people.length} people · {money(totalSpent(group))} spent · {group.currency}
        </p>
      </header>

      <section aria-labelledby="add-heading" className="mt-8">
        <h2 id="add-heading" className={sectionHeading}>
          Add an expense
        </h2>
        <ExpenseForm key={group.people.join('\n')} group={group} onSave={(entry) => setEntries([...group.entries, entry])} />
      </section>

      <section aria-labelledby="settle-heading" className="mt-10">
        <h2 id="settle-heading" className={sectionHeading}>
          Settle up
        </h2>
        {transfers.length === 0 ? (
          <p className="py-4 text-dim">{group.entries.length ? 'Everyone is square.' : 'Add an expense to see who owes whom.'}</p>
        ) : (
          <ul className="divide-y divide-rule">
            {transfers.map((t) => (
              <li key={`${t.from}-${t.to}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3">
                <p className="mr-auto">
                  <span className="font-medium">{name(t.from)}</span> pays <span className="font-medium">{name(t.to)}</span>
                </p>
                <p className="font-medium tabular-nums">{money(t.amount)}</p>
                <button
                  type="button"
                  onClick={() => setEntries([...group.entries, { id: randomId(), kind: 'payment', description: '', amount: t.amount, payer: t.from, split: [t.to] }])}
                  className={quiet}
                  aria-label={`Mark that ${name(t.from)} paid ${name(t.to)} ${money(t.amount)}`}
                >
                  Mark paid
                </button>
              </li>
            ))}
          </ul>
        )}
        {group.entries.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {owed.map((balance, person) => (
              <li key={person} className={balance > 0 ? 'text-green-800 dark:text-green-300' : balance < 0 ? 'text-red-800 dark:text-red-300' : 'text-dim'}>
                {name(person)} {balance > 0 ? `gets back ${money(balance)}` : balance < 0 ? `owes ${money(-balance)}` : 'is square'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="entries-heading" className="mt-10">
        <h2 id="entries-heading" className={sectionHeading}>
          Expenses and payments
        </h2>
        <div aria-live="polite">
          {removed && (
            <p className="flex items-center gap-3 py-3 text-sm">
              Removed {removed.entry.kind === 'payment' ? 'a payment' : `“${removed.entry.description}”`}.
              <button
                type="button"
                onClick={() => {
                  const entries = [...group.entries]
                  entries.splice(removed.index, 0, removed.entry)
                  setEntries(entries)
                }}
                className="cursor-pointer font-medium underline underline-offset-4"
              >
                Undo
              </button>
            </p>
          )}
        </div>
        {group.entries.length === 0 ? (
          <p className="py-4 text-dim">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {[...group.entries].reverse().map((entry) =>
              entry.id === editingId ? (
                <li key={entry.id} className="py-3">
                  <ExpenseForm
                    group={group}
                    entry={entry}
                    onSave={(changed) => {
                      setEntries(group.entries.map((e) => (e.id === entry.id ? changed : e)))
                      setEditingId(null)
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li key={entry.id} className="flex flex-wrap items-center gap-x-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p dir="auto" className="break-words">
                      {entry.kind === 'payment' ? `${name(entry.payer)} paid ${name(entry.split[0])}` : entry.description}
                    </p>
                    <p className="text-sm text-dim">{entry.kind === 'payment' ? 'Payment' : `${name(entry.payer)} paid · ${splitText(group, entry)}`}</p>
                  </div>
                  <p className="tabular-nums">{money(entry.amount)}</p>
                  <div className="-mr-3 flex">
                    {entry.kind === 'expense' && (
                      <button type="button" onClick={() => setEditingId(entry.id)} className={quiet} aria-label={`Edit ${entry.description}`}>
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeEntry(entry)}
                      className={quiet}
                      aria-label={entry.kind === 'payment' ? `Remove payment from ${name(entry.payer)} to ${name(entry.split[0])}` : `Remove ${entry.description}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </section>

      <People group={group} onChange={(next) => {
        setRemoved(null)
        onChange(next)
      }} />

      <section aria-labelledby="share-heading" className="mt-10">
        <h2 id="share-heading" className={sectionHeading}>
          Share
        </h2>
        <p className="mt-4 max-w-xl text-sm/relaxed text-dim">
          This page’s address holds the whole group, so bookmark it to come back. Anyone you share it with sees the same
          group and can add to their own copy. Changes don’t sync, so after editing, share the link again.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void shareLink()} className={primary}>
            Share link
          </button>
          <p role="status" className="text-sm text-dim">
            {shareNote}
          </p>
        </div>
      </section>
    </>
  )
}

function ExpenseForm({ group, entry, onSave, onCancel }: { group: Group; entry?: Entry; onSave: (entry: Entry) => void; onCancel?: () => void }) {
  const everyone = group.people.map((_, i) => i)
  const [description, setDescription] = useState(entry?.description ?? '')
  const [amount, setAmount] = useState(entry ? amountToText(entry.amount, group.currency) : '')
  const [payer, setPayer] = useState(entry?.payer ?? 0)
  const [split, setSplit] = useState<number[]>(entry?.split ?? everyone)
  const [error, setError] = useState('')
  const first = useRef<HTMLInputElement>(null)
  const value = parseAmount(amount, group.currency)
  const parts = value && split.length ? shares(value, split.length) : []

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!value) return setError(`Enter an amount, like ${amountToText(1250, group.currency)}.`)
    if (!split.length) return setError('Choose who shares it.')
    onSave({ id: entry?.id ?? randomId(), kind: 'expense', description: description.trim() || 'Expense', amount: value, payer, split: [...split].sort((a, b) => a - b) })
    if (!entry) {
      setDescription('')
      setAmount('')
      setSplit(everyone)
      first.current?.focus()
    }
  }

  const toggle = (person: number) => {
    setError('')
    setSplit((current) => (current.includes(person) ? current.filter((p) => p !== person) : [...current, person]))
  }

  return (
    <form onSubmit={submit} noValidate className="mt-4 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem_10rem]">
        <label className="grid gap-1.5">
          <span className="text-sm text-dim">What for</span>
          <input ref={first} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={LIMITS.description} placeholder="Dinner" dir="auto" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm text-dim">Amount ({group.currency})</span>
          <input
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError('')
            }}
            inputMode="decimal"
            placeholder={amountToText(0, group.currency)}
            aria-invalid={error && !value ? true : undefined}
            className={`${field} tabular-nums`}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm text-dim">Paid by</span>
          <select value={payer} onChange={(e) => setPayer(Number(e.target.value))} className={`${field} cursor-pointer`}>
            {group.people.map((person, i) => (
              <option key={i} value={i}>
                {person}
              </option>
            ))}
          </select>
        </label>
      </div>
      <fieldset>
        <legend className="text-sm text-dim">
          Split equally between
          {parts.length > 0 && (
            <span className="text-ink">
              {' · '}
              {formatMoney(parts[parts.length - 1], group.currency)}
              {parts[0] !== parts[parts.length - 1] ? ` to ${formatMoney(parts[0], group.currency)}` : ''} each
            </span>
          )}
        </legend>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {group.people.map((person, i) => (
            <label key={i}>
              <input type="checkbox" checked={split.includes(i)} onChange={() => toggle(i)} className="peer sr-only" />
              <span className="inline-flex h-9 cursor-pointer items-center rounded-full px-3.5 text-sm ring-1 ring-rule ring-inset peer-checked:bg-ink peer-checked:text-paper peer-checked:ring-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                {person}
              </span>
            </label>
          ))}
          {split.length !== group.people.length && (
            <button type="button" onClick={() => setSplit(everyone)} className="h-9 cursor-pointer rounded-full px-3 text-sm text-dim underline-offset-4 hover:text-ink hover:underline">
              Everyone
            </button>
          )}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className={primary}>
          {entry ? 'Save changes' : 'Add expense'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={quiet}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function People({ group, onChange }: { group: Group; onChange: (group: Group) => void }) {
  const [newName, setNewName] = useState('')
  const [message, setMessage] = useState('')
  const taken = (name: string, except = -1) => group.people.some((p, i) => i !== except && p.toLowerCase() === name.toLowerCase())

  function rename(person: number, raw: string) {
    const name = raw.trim().replace(/\s+/g, ' ').slice(0, LIMITS.person)
    if (!name || taken(name, person)) {
      setMessage(name ? `There’s already someone called ${name}.` : 'Names can’t be empty.')
      return false
    }
    setMessage('')
    if (name !== group.people[person]) onChange({ ...group, people: group.people.map((p, i) => (i === person ? name : p)) })
    return true
  }

  function add(event: FormEvent) {
    event.preventDefault()
    const name = newName.trim().replace(/\s+/g, ' ').slice(0, LIMITS.person)
    if (!name) return
    if (taken(name)) return setMessage(`There’s already someone called ${name}.`)
    if (group.people.length >= LIMITS.people) return setMessage(`A group can have up to ${LIMITS.people} people.`)
    setMessage('')
    setNewName('')
    onChange({ ...group, people: [...group.people, name] })
  }

  return (
    <section aria-labelledby="people-heading" className="mt-10">
      <h2 id="people-heading" className={sectionHeading}>
        People
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {group.people.map((person, i) => (
          <li key={`${i}-${person}`} className="flex gap-2">
            <input
              defaultValue={person}
              onBlur={(e) => {
                if (!rename(i, e.target.value)) e.target.value = person
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
              }}
              maxLength={LIMITS.person}
              aria-label={`Name of person ${i + 1}`}
              dir="auto"
              className={field}
            />
            <button
              type="button"
              onClick={() => onChange(removePerson(group, i))}
              disabled={isInvolved(group, i) || group.people.length <= 2}
              title={isInvolved(group, i) ? 'In an expense or payment, so they can’t be removed' : undefined}
              className={quiet}
              aria-label={`Remove ${person}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-3 flex gap-2 sm:max-w-sm">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Add a person" maxLength={LIMITS.person} aria-label="New person’s name" dir="auto" className={field} />
        <button type="submit" className={quiet}>
          Add
        </button>
      </form>
      <p role="status" className="mt-2 text-sm text-red-700 dark:text-red-400">
        {message}
      </p>
    </section>
  )
}

function splitText(group: Group, entry: Entry): string {
  if (entry.split.length === group.people.length) return group.people.length === 2 ? 'split between both' : 'split between everyone'
  if (entry.split.length === 1) return `for ${group.people[entry.split[0]]}`
  const names = entry.split.map((i) => group.people[i])
  return names.length <= 3 ? `split between ${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : `split ${names.length} ways`
}
