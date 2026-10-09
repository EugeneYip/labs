import { useEffect, useRef, useState, type FormEvent } from 'react'
import { GroupView } from './GroupView.tsx'
import { CURRENCIES, decodeGroup, encodeGroup, formatMoney, newGroup, parsePeople, totalSpent, type Group } from './model.ts'
import { field, primary, quiet, sectionHeading } from './styles.ts'

// The group itself lives in the page address; this only remembers recent groups on this device.
const STORAGE_KEY = 'labs:fair-share'

interface Recent {
  id: string
  name: string
  hash: string
  people: number
  total: string
  updatedAt: number
}

/** Experiment #003: split shared costs, with the whole group carried in its link. */
export default function FairShare() {
  const [group, setGroup] = useState<Group | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid'>('loading')
  const [recent, setRecent] = useState(loadRecent)
  const latest = useRef(0)

  // Open whatever group the address holds, now and whenever it changes (a pasted link, Back).
  useEffect(() => {
    async function open() {
      const hash = location.hash.slice(1)
      if (!hash) {
        setGroup(null)
        setStatus('ready')
        return
      }
      const decoded = await decodeGroup(hash)
      setGroup(decoded)
      setStatus(decoded ? 'ready' : 'invalid')
    }
    void open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [])

  // After each change, write the group back into the address and the recent list.
  function update(next: Group) {
    setGroup(next)
    const run = ++latest.current
    void encodeGroup(next).then((hash) => {
      if (run !== latest.current) return
      history.replaceState(null, '', `#${hash}`)
      setRecent(rememberRecent({ id: next.id, name: next.name || 'Untitled group', hash, people: next.people.length, total: formatMoney(totalSpent(next), next.currency), updatedAt: Date.now() }))
    })
  }

  function forget(id: string) {
    setRecent(saveRecent(loadRecent().filter((r) => r.id !== id)))
  }

  if (status === 'loading') return <div className="flex-1" />

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        {group ? (
          <GroupView group={group} onChange={update} />
        ) : (
          <Start invalid={status === 'invalid'} recent={recent} onStart={update} onForget={forget} />
        )}
      </div>
    </div>
  )
}

function Start({ invalid, recent, onStart, onForget }: { invalid: boolean; recent: Recent[]; onStart: (group: Group) => void; onForget: (id: string) => void }) {
  const [name, setName] = useState('')
  const [people, setPeople] = useState('')
  const [currency, setCurrency] = useState(defaultCurrency)
  const [error, setError] = useState('')

  function start(event: FormEvent) {
    event.preventDefault()
    const names = parsePeople(people)
    if (names.length < 2) return setError('Add at least two people, separated by commas.')
    onStart(newGroup(name.trim(), names, currency))
  }

  return (
    <>
      {invalid && (
        <p role="alert" className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          This link doesn’t contain a readable group. It may have been cut off when it was copied. Ask for the link again.
        </p>
      )}
      <p className="max-w-xl text-pretty text-dim">
        Split shared costs for a dinner, a trip, or a shared house. Add who paid for what, and see the fewest payments that
        settle everyone up. No accounts: the whole group lives in its link.
      </p>

      <form onSubmit={start} className="mt-8 grid max-w-xl gap-4" noValidate>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Group name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Lisbon weekend" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">People</span>
          <input
            value={people}
            onChange={(e) => {
              setPeople(e.target.value)
              setError('')
            }}
            placeholder="Alex, Sam, Priya"
            aria-describedby="people-hint"
            aria-invalid={error ? true : undefined}
            className={field}
          />
          <span id="people-hint" className={`text-sm ${error ? 'text-red-700 dark:text-red-400' : 'text-dim'}`}>
            {error || 'Separate names with commas. You can add more later.'}
          </span>
        </label>
        <label className="grid gap-1.5 sm:w-48">
          <span className="text-sm font-medium">Currency</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${field} cursor-pointer`}>
            {[...new Set([defaultCurrency(), ...CURRENCIES])].map((code) => (
              <option key={code} value={code}>
                {code} · {currencyName(code)}
              </option>
            ))}
          </select>
        </label>
        <div>
          <button type="submit" className={primary}>
            Start splitting
          </button>
        </div>
      </form>

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="mt-14">
          <h2 id="recent-heading" className={sectionHeading}>
            Recent on this device
          </h2>
          <ul className="divide-y divide-rule">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <a href={`#${r.hash}`} className="min-w-0 flex-1 hover:underline">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="block text-sm text-dim">
                    {r.people} people · {r.total} spent · {new Date(r.updatedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </a>
                <button type="button" onClick={() => onForget(r.id)} className={quiet} aria-label={`Forget ${r.name} on this device`}>
                  Forget
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function defaultCurrency(): string {
  const region = new Intl.Locale(navigator.language).maximize().region
  const byRegion: Record<string, string> = { US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD', JP: 'JPY', CN: 'CNY', HK: 'HKD', TW: 'TWD', KR: 'KRW', SG: 'SGD', IN: 'INR', TH: 'THB', MX: 'MXN', BR: 'BRL', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', ZA: 'ZAR', AE: 'AED', IL: 'ILS', TR: 'TRY' }
  const euro = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK']
  return (region && (byRegion[region] ?? (euro.includes(region) ? 'EUR' : undefined))) || 'USD'
}

function currencyName(code: string): string {
  try {
    return new Intl.DisplayNames(undefined, { type: 'currency' }).of(code) ?? code
  } catch {
    return code
  }
}

function loadRecent(): Recent[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    const list: unknown = data?.groups
    if (!Array.isArray(list)) return []
    return list.filter(
      (r): r is Recent =>
        typeof r?.id === 'string' && typeof r.name === 'string' && typeof r.hash === 'string' && r.hash.startsWith('v1.') && typeof r.updatedAt === 'number',
    )
  } catch {
    return []
  }
}

function saveRecent(list: Recent[]): Recent[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, groups: list }))
  } catch {
    // Storage is blocked or full. Groups still live in their links.
  }
  return list
}

function rememberRecent(entry: Recent): Recent[] {
  return saveRecent([entry, ...loadRecent().filter((r) => r.id !== entry.id)].slice(0, 20))
}
