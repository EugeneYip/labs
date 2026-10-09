import { useEffect, useState, type FormEvent } from 'react'
import { decodeMatch, draw, EMPTY_EXCHANGE, encodeMatch, LIMITS, parseNames, type Exchange } from './model.ts'

// The organizer's setup and the links they send. Reveal pages never store anything.
const STORAGE_KEY = 'labs:secret-santa'

interface Saved {
  exchange: Exchange
  /** One link token per person, in the order of `exchange.people`, once names are drawn. */
  links: string[] | null
}

interface NamedRule {
  giver: string
  receiver: string
}

const control = 'rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 w-full min-w-0 sm:h-10`
const picker = `${control} h-11 min-w-32 cursor-pointer sm:h-10`
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-lg px-4 text-sm transition-colors sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const outline = `${button} border border-rule hover:bg-ink/5`

/** Experiment #006: a gift-exchange draw where each person's link reveals only their own match. */
export default function SecretSanta() {
  const [token, setToken] = useState(() => location.hash.slice(1))

  useEffect(() => {
    const onHash = () => setToken(location.hash.slice(1))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">{token ? <Reveal token={token} /> : <Organizer />}</div>
    </div>
  )
}

function Reveal({ token }: { token: string }) {
  const match = decodeMatch(token)
  const [shown, setShown] = useState(false)

  if (!match) {
    return (
      <div className="py-10">
        <h2 className="text-2xl font-semibold tracking-tight">This link doesn’t work</h2>
        <p className="mt-3 text-dim">It may have been cut off when it was copied. Ask whoever organized the exchange to send it again.</p>
        <a href={location.pathname} className="mt-6 inline-block text-sm underline underline-offset-4 hover:text-dim">
          Organize your own exchange
        </a>
      </div>
    )
  }

  const details = [match.budget && `Budget: ${match.budget}`, match.date && `Exchange: ${match.date}`].filter(Boolean)
  return (
    <div className="py-6 text-center sm:py-12">
      {match.exchange && (
        <p dir="auto" className="font-mono text-xs tracking-widest text-dim uppercase">
          {match.exchange}
        </p>
      )}
      <h2 dir="auto" className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Hi {match.giver}!
      </h2>
      {!shown ? (
        <>
          <p className="mx-auto mt-4 max-w-sm text-pretty text-dim">
            This link is just for {match.giver}. If you’re someone else, close it without looking.
          </p>
          <button type="button" onClick={() => setShown(true)} className={`${primary} mt-8 h-12 px-6 text-base`}>
            Show who I’m buying for
          </button>
        </>
      ) : (
        <div role="status" className="mt-8">
          <p className="text-dim">You’re buying a gift for</p>
          <p dir="auto" className="mt-2 text-5xl font-semibold tracking-tight break-words text-red-700 sm:text-6xl dark:text-red-400">
            {match.receiver}
          </p>
          {details.length > 0 && <p className="mt-6 text-sm">{details.join(' · ')}</p>}
          {match.note && (
            <p dir="auto" className="mx-auto mt-4 max-w-md text-sm/relaxed whitespace-pre-line text-dim">
              {match.note}
            </p>
          )}
          <p className="mt-8 text-sm text-dim">Keep it secret. You can open this link again anytime.</p>
        </div>
      )}
    </div>
  )
}

function Organizer() {
  const [saved, setSaved] = useState(load)
  const { exchange, links } = saved

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...saved }))
    } catch {
      // Not saved on this device; the links still work wherever they're sent.
    }
  }, [saved])

  return links ? (
    <Links
      exchange={exchange}
      links={links}
      onRedraw={(next) => setSaved({ exchange, links: next })}
      onEdit={() => setSaved({ exchange, links: null })}
      onReset={() => setSaved({ exchange: EMPTY_EXCHANGE, links: null })}
    />
  ) : (
    <Setup exchange={exchange} onChange={(next) => setSaved({ exchange: next, links: null })} onDrawn={(next, made) => setSaved({ exchange: next, links: made })} />
  )
}

function Setup({ exchange, onChange, onDrawn }: { exchange: Exchange; onChange: (e: Exchange) => void; onDrawn: (e: Exchange, links: string[]) => void }) {
  const [peopleText, setPeopleText] = useState(exchange.people.join('\n'))
  const [rules, setRules] = useState<NamedRule[]>(() => exchange.rules.map((r) => ({ giver: exchange.people[r.giver], receiver: exchange.people[r.receiver] })))
  const [ruleGiver, setRuleGiver] = useState('')
  const [ruleReceiver, setRuleReceiver] = useState('')
  const [bothWays, setBothWays] = useState(true)
  const [error, setError] = useState('')
  const people = parseNames(peopleText).slice(0, LIMITS.people)
  const liveRules = rules.filter((r) => people.includes(r.giver) && people.includes(r.receiver))

  const update = (changes: Partial<Exchange>, nextPeople = people, nextRules = liveRules) =>
    onChange({ ...exchange, ...changes, people: nextPeople, rules: nextRules.map((r) => ({ giver: nextPeople.indexOf(r.giver), receiver: nextPeople.indexOf(r.receiver) })) })

  function addRule() {
    if (!ruleGiver || !ruleReceiver || ruleGiver === ruleReceiver) return
    const add = [{ giver: ruleGiver, receiver: ruleReceiver }, ...(bothWays ? [{ giver: ruleReceiver, receiver: ruleGiver }] : [])]
    const next = [...liveRules, ...add.filter((a) => !liveRules.some((r) => r.giver === a.giver && r.receiver === a.receiver))]
    setRules(next)
    update({}, people, next)
    setError('')
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (people.length < 3) return setError('Add at least three people.')
    const indexRules = liveRules.map((r) => ({ giver: people.indexOf(r.giver), receiver: people.indexOf(r.receiver) }))
    const result = draw(people.length, indexRules)
    if (!result) return setError('No draw works with these rules. Remove a rule or add more people.')
    const next = { ...exchange, people, rules: indexRules }
    onDrawn(
      next,
      people.map((giver, i) => encodeMatch({ exchange: next.name.trim(), giver, receiver: people[result[i]], budget: next.budget.trim(), date: next.date.trim(), note: next.note.trim() })),
    )
  }

  return (
    <>
      <p className="text-pretty text-dim">
        Draw names for a gift exchange. Everyone gets a private link that shows only who they’re buying for, so the
        organizer can take part too. No sign-ups and no email addresses.
      </p>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-5">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Name of the exchange</span>
          <input value={exchange.name} onChange={(e) => update({ name: e.target.value })} maxLength={LIMITS.text} placeholder="Family gift exchange 2026" dir="auto" className={field} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">
              Budget <span className="font-normal text-dim">(optional)</span>
            </span>
            <input value={exchange.budget} onChange={(e) => update({ budget: e.target.value })} maxLength={LIMITS.text} placeholder="$30" className={field} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">
              When you’ll swap gifts <span className="font-normal text-dim">(optional)</span>
            </span>
            <input value={exchange.date} onChange={(e) => update({ date: e.target.value })} maxLength={LIMITS.text} placeholder="December 20" className={field} />
          </label>
        </div>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">
            Note for everyone <span className="font-normal text-dim">(optional)</span>
          </span>
          <input value={exchange.note} onChange={(e) => update({ note: e.target.value })} maxLength={LIMITS.text} placeholder="Something handmade counts double." dir="auto" className={field} />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">People</span>
          <textarea
            value={peopleText}
            onChange={(e) => {
              setPeopleText(e.target.value)
              setError('')
              update({}, parseNames(e.target.value).slice(0, LIMITS.people))
            }}
            rows={6}
            placeholder={'One name per line\nAnn\nBen\nChloé'}
            aria-describedby="people-count"
            dir="auto"
            className={`${control} w-full py-2`}
          />
          <span id="people-count" className="text-sm text-dim">
            {people.length === 0 ? 'Separate names with new lines or commas.' : `${people.length} ${people.length === 1 ? 'person' : 'people'}`}
            {people.length === LIMITS.people && `, the most one draw can take`}
            {people.length < LIMITS.people && typedNames(peopleText) > people.length && '. A name typed twice counts once, so add an initial to tell two people apart.'}
          </span>
        </label>

        <fieldset className="grid gap-3">
          <legend className="text-sm font-medium">
            Who can’t draw whom <span className="font-normal text-dim">(optional, for couples or last year’s pairs)</span>
          </legend>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <select value={ruleGiver} onChange={(e) => setRuleGiver(e.target.value)} aria-label="Person" className={picker}>
              <option value="">Person</option>
              {people.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <span className="text-sm text-dim">can’t draw</span>
            <select value={ruleReceiver} onChange={(e) => setRuleReceiver(e.target.value)} aria-label="Person they can’t draw" className={picker}>
              <option value="">Person</option>
              {people.filter((p) => p !== ruleGiver).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={bothWays} onChange={(e) => setBothWays(e.target.checked)} className="size-4 cursor-pointer accent-current" />
              and the other way
            </label>
            <button type="button" onClick={addRule} disabled={!ruleGiver || !ruleReceiver} className={`${quiet} disabled:opacity-40`}>
              Add rule
            </button>
          </div>
          {liveRules.length > 0 && (
            <ul className="divide-y divide-rule rounded-lg border border-rule">
              {liveRules.map((r) => (
                <li key={`${r.giver}>${r.receiver}`} className="flex items-center gap-3 py-1 pr-1 pl-3 text-sm">
                  <span dir="auto" className="min-w-0 flex-1 truncate">
                    {r.giver} can’t draw {r.receiver}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = liveRules.filter((x) => x !== r)
                      setRules(next)
                      update({}, people, next)
                    }}
                    className={quiet}
                    aria-label={`Remove the rule that ${r.giver} can’t draw ${r.receiver}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
        <div>
          <button type="submit" className={primary}>
            Draw names
          </button>
        </div>
      </form>
      <p className="mt-10 text-sm text-dim">The draw happens on this device. Each link carries its own match, so nothing is stored online.</p>
    </>
  )
}

function Links({ exchange, links, onRedraw, onEdit, onReset }: { exchange: Exchange; links: string[]; onRedraw: (links: string[]) => void; onEdit: () => void; onReset: () => void }) {
  const [copied, setCopied] = useState<number | null>(null)
  const [confirming, setConfirming] = useState<'redraw' | 'reset' | null>(null)
  const url = (k: number) => `${location.origin}${location.pathname}#${links[k]}`
  const canShare = typeof navigator.share === 'function'

  async function copy(k: number) {
    try {
      await navigator.clipboard.writeText(url(k))
      setCopied(k)
    } catch {
      window.prompt(`Copy ${exchange.people[k]}’s link`, url(k))
    }
  }

  async function share(k: number) {
    try {
      await navigator.share({ title: exchange.name || 'Secret Santa', text: `${exchange.people[k]}, here’s your Secret Santa link. It shows only who you’re buying for.`, url: url(k) })
    } catch {
      // Closing the share sheet is fine.
    }
  }

  function redraw() {
    const result = draw(exchange.people.length, exchange.rules)
    if (!result) return
    onRedraw(exchange.people.map((giver, i) => encodeMatch({ exchange: exchange.name.trim(), giver, receiver: exchange.people[result[i]], budget: exchange.budget.trim(), date: exchange.date.trim(), note: exchange.note.trim() })))
    setCopied(null)
    setConfirming(null)
  }

  return (
    <>
      <h2 dir="auto" className="text-2xl font-semibold tracking-tight">
        {exchange.name || 'Names are drawn'}
      </h2>
      <p className="mt-3 text-pretty text-dim">
        Send each person their own link. Each one shows only who that person is buying for, so don’t open anyone else’s,
        or you’ll see their match. If you’re taking part, open yours.
      </p>

      <ul className="mt-6 divide-y divide-rule border-y border-rule">
        {exchange.people.map((person, k) => (
          <li key={person} className="flex flex-wrap items-center gap-x-2 gap-y-1 py-2.5">
            <span dir="auto" className="mr-auto min-w-0 truncate font-medium">
              {person}
            </span>
            {copied === k && (
              <span role="status" className="text-sm text-green-800 dark:text-green-300">
                Link copied
              </span>
            )}
            <button type="button" onClick={() => void copy(k)} className={outline} aria-label={`Copy ${person}’s link`}>
              Copy link
            </button>
            {canShare && (
              <button type="button" onClick={() => void share(k)} className={outline} aria-label={`Share ${person}’s link`}>
                Share
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-dim">
        {exchange.people.length} people
        {exchange.rules.length > 0 && ` · ${exchange.rules.length} ${exchange.rules.length === 1 ? 'rule' : 'rules'}`}
        {exchange.budget && ` · ${exchange.budget}`}
        {exchange.date && ` · ${exchange.date}`}
      </p>

      <div className={`mt-8 flex flex-wrap gap-2 ${confirming ? '' : '-ml-4'}`}>
        {confirming === 'redraw' ? (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            Links you’ve already sent would no longer match. Draw again?
            <button type="button" onClick={redraw} className={primary}>
              Draw again
            </button>
            <button type="button" onClick={() => setConfirming(null)} className={quiet}>
              Cancel
            </button>
          </p>
        ) : confirming === 'reset' ? (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            This forgets the people and links on this device. Sent links keep working.
            <button type="button" onClick={onReset} className={primary}>
              Start over
            </button>
            <button type="button" onClick={() => setConfirming(null)} className={quiet}>
              Cancel
            </button>
          </p>
        ) : (
          <>
            <button type="button" onClick={() => setConfirming('redraw')} className={quiet}>
              Draw again
            </button>
            <button type="button" onClick={onEdit} className={quiet}>
              Change people or rules
            </button>
            <button type="button" onClick={() => setConfirming('reset')} className={quiet}>
              New exchange
            </button>
          </>
        )}
      </div>
    </>
  )
}

/** How many names were typed, counting repeats, to spot names that `parseNames` merged. */
function typedNames(text: string): number {
  return text.split(/[,\n;]/).filter((name) => name.trim()).length
}

function load(): Saved {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    const e = data?.exchange
    const text = (v: unknown) => (typeof v === 'string' ? v.slice(0, LIMITS.text) : '')
    if (!e || !Array.isArray(e.people)) return { exchange: EMPTY_EXCHANGE, links: null }
    const people = e.people.filter((p: unknown): p is string => typeof p === 'string').slice(0, LIMITS.people)
    const index = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) < people.length
    const rules = Array.isArray(e.rules) ? e.rules.filter((r: { giver: unknown; receiver: unknown }) => index(r?.giver) && index(r?.receiver)) : []
    const links = Array.isArray(data.links) && data.links.length === people.length && data.links.every((t: unknown) => typeof t === 'string' && decodeMatch(t)) ? (data.links as string[]) : null
    return { exchange: { name: text(e.name), budget: text(e.budget), date: text(e.date), note: text(e.note), people, rules }, links }
  } catch {
    return { exchange: EMPTY_EXCHANGE, links: null }
  }
}
