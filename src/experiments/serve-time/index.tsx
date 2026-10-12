import { useEffect, useState } from 'react'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { Cook } from './Cook.tsx'
import { defaultServeAt, defaultUnit, freshServeAt, LIMITS, type Delay, type Dish, type Plan } from './model.ts'
import { Planner } from './Planner.tsx'
import { unlockSound } from './ui.ts'

// The plan, and whether cooking mode is open, so a reload mid-cooking comes back to it.
const STORAGE_KEY = 'labs:serve-time'

interface Saved {
  plan: Plan
  cooking: boolean
}

/** Experiment #008: plan a meal backward from serving time, then cook along with a countdown. */
export default function ServeTime() {
  const [saved, setSaved] = useState(load)
  const [notSaving, setNotSaving] = useState(false)
  // A plan changed in another open tab is taken up here, so this tab can't save an older one over it. The views
  // start again from it, as some fields hold their own copies.
  const [synced, setSynced] = useState(0)
  const save = useOtherTabs(STORAGE_KEY, () => {
    setSaved(load())
    setSynced((n) => n + 1)
  })

  useEffect(() => {
    try {
      save(JSON.stringify({ version: 1, ...saved.plan, cooking: saved.cooking }))
      setNotSaving(false)
    } catch {
      // Full or blocked storage: the plan won't survive a reload, so the page says so.
      setNotSaving(true)
    }
  }, [saved, save])

  const setPlan = (plan: Plan) => setSaved((s) => ({ ...s, plan }))
  const setCooking = (cooking: boolean) => {
    setSaved((s) => ({ ...s, cooking }))
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="flex-1">
      {notSaving && (
        <div className={`mx-auto w-full px-4 pt-6 sm:px-6 sm:pt-10 ${saved.cooking ? 'max-w-2xl' : 'max-w-6xl'}`}>
          <NotSaving>This browser isn’t saving the plan (its storage is full or blocked), so it will be gone if the page reloads or closes. Print it, or keep the page open while you cook.</NotSaving>
        </div>
      )}
      {saved.cooking ? (
        <Cook key={synced} plan={saved.plan} onChange={setPlan} onExit={() => setCooking(false)} />
      ) : (
        <Planner
          key={synced}
          plan={saved.plan}
          onChange={setPlan}
          onCook={() => {
            // Browsers only allow sound after a tap, and this is the tap.
            unlockSound()
            setCooking(true)
          }}
        />
      )}
    </div>
  )
}

function load(): Saved {
  const now = Date.now()
  const fresh: Saved = { plan: { serveAt: defaultServeAt(now), unit: defaultUnit(navigator.language), ovens: 1, dishes: [], delays: [] }, cooking: false }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data || typeof data !== 'object' || !Array.isArray(data.dishes)) return fresh
    const text = (v: unknown) => (typeof v === 'string' ? v.slice(0, LIMITS.text) : '')
    const id = (v: unknown) => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : crypto.randomUUID().slice(0, 8))
    const unit = data.unit === 'F' ? 'F' : 'C'
    const dishes: Dish[] = data.dishes.slice(0, LIMITS.dishes).map((d: Record<string, unknown>) => ({
      id: id(d?.id),
      name: text(d?.name),
      steps: (Array.isArray(d?.steps) ? d.steps : []).slice(0, LIMITS.steps).map((s: Record<string, unknown>) => ({
        id: id(s?.id),
        what: text(s?.what),
        minutes: Number.isInteger(s?.minutes) && (s.minutes as number) >= 0 && (s.minutes as number) <= LIMITS.minutes ? (s.minutes as number) : 0,
        oven: typeof s?.oven === 'number' && Number.isFinite(s.oven) ? Math.round(s.oven) : null,
      })),
    }))
    const delays: Delay[] = (Array.isArray(data.delays) ? data.delays : [])
      .filter((d: Record<string, unknown>) => Number.isFinite(d?.at) && Number.isInteger(d?.minutes) && (d.minutes as number) > 0 && (d.minutes as number) <= 600)
      .slice(0, 50)
    // A date can show about 275,000 years either way. A serving time at or past that edge would stop the page once a delay moves it on, so it gets the usual default instead.
    const serveAt = typeof data.serveAt === 'number' && Math.abs(data.serveAt) <= 8.6e15 ? freshServeAt(data.serveAt, now) : fresh.plan.serveAt
    // An old plan moved to its next serving day starts that day fresh, without old delays or an open cooking mode.
    const moved = serveAt !== data.serveAt
    return {
      plan: { serveAt, unit, ovens: data.ovens === 2 ? 2 : 1, dishes, delays: moved ? [] : delays },
      cooking: data.cooking === true && !moved,
    }
  } catch {
    return fresh
  }
}
