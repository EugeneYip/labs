import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  blurPixels,
  comfortable,
  CSS_PX_PER_M,
  defaultUnits,
  EYESIGHT,
  formatDistance,
  formatHeight,
  fromMeters,
  readable,
  slidePoints,
  toMeters,
  trueWidth,
  type Eyesight,
  type Units,
} from './model.ts'

// Settings only. The picture is read on this device and never stored or sent.
const STORAGE_KEY = 'labs:back-row'

interface Settings {
  kind: 'screen' | 'poster'
  /** Width of the real screen or poster, in meters. */
  width: number
  /** How far away the viewer is, in meters. */
  distance: number
  eyesight: Eyesight
  units: Units
  view: 'closeup' | 'true'
  /** Your distance from this device, in meters, for the true-size view. */
  yourDistance: number
  /** CSS pixels per meter on this screen, after calibration. */
  pxPerM: number
}

interface Picture {
  url: string
  width: number
  height: number
  name: string
}

const SCREENS: [string, number][] = [
  ['TV', 1.4],
  ['Meeting room', 2],
  ['Lecture room', 3.5],
  ['Hall', 6],
]
const POSTERS: [string, number][] = [
  ['Letter or A4', 0.21],
  ['Tabloid or A3', 0.297],
  ['A1 poster', 0.594],
  ['Banner', 2],
]

const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`

/** Experiment #015: a slide, poster, or sign as the back row sees it. */
export default function BackRow() {
  const [settings, setSettings] = useState(load)
  const [picture, setPicture] = useState<Picture | null>(null)
  const [note, setNote] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const change = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...next }))
    } catch {
      // Private browsing or full storage: settings just won't be remembered.
    }
  }

  const open = async (file: File | Blob | undefined, name = 'Picture') => {
    if (!file) return
    setNote('')
    const url = URL.createObjectURL(file)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = url
      })
      setPicture((old) => {
        if (old?.url.startsWith('blob:')) URL.revokeObjectURL(old.url)
        return { url, width: img.naturalWidth, height: img.naturalHeight, name: file instanceof File ? file.name : name }
      })
    } catch {
      URL.revokeObjectURL(url)
      setNote('That file couldn’t be opened as a picture. Try a PNG or JPEG, such as a screenshot of your slide.')
    }
  }

  // Paste a screenshot from anywhere on the page.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const file = [...(event.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'))
      if (file) {
        event.preventDefault()
        void open(file, 'Pasted picture')
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  })

  const u = settings.units
  const presets = settings.kind === 'screen' ? SCREENS : POSTERS

  return (
    <div className="flex-1">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 pt-6 pb-24 sm:px-6 sm:pt-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10 lg:gap-y-6">
        <section aria-labelledby="setup-heading" className="grid min-w-0 gap-6 lg:col-start-1 lg:row-start-1">
          <h2 id="setup-heading" className="sr-only">
            Picture
          </h2>
          <p className="text-pretty text-dim">
            See a slide, poster, or sign as the back row does. Choose a picture, say how big it’s shown and how far away people are,
            and Back Row blurs away the detail they can’t make out. It also says how big your text needs to be.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              void open(e.dataTransfer.files[0])
            }}
            className={`rounded-xl border border-dashed p-4 transition-colors ${dragging ? 'border-ink bg-ink/5' : 'border-rule'}`}
          >
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileInput.current?.click()} className={primary}>
                {picture ? 'Choose another picture' : 'Choose a picture'}
              </button>
              <button type="button" onClick={() => void sampleSlide().then((blob) => open(blob, 'Sample slide'))} className={outline}>
                Try a sample slide
              </button>
            </div>
            <input ref={fileInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void open(e.target.files?.[0]).finally(() => (e.target.value = ''))} />
            <p className="mt-2 text-sm text-dim">Or drop one here, or paste a screenshot. It stays on this device.</p>
            {note && (
              <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">
                {note}
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="result-heading" className="min-w-0 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <h2 id="result-heading" className="text-lg font-semibold tracking-tight">
            From {formatDistance(settings.distance, u)} away
          </h2>
          <Guidance settings={settings} />
          {picture ? (
            <View picture={picture} settings={settings} change={change} />
          ) : (
            <div className="mt-4 flex aspect-video items-center justify-center rounded-xl border border-rule p-6 text-center text-sm text-dim">
              Choose a picture or try the sample slide to see it from here.
            </div>
          )}
        </section>
        <section aria-labelledby="room-heading" className="grid min-w-0 gap-6 lg:col-start-1 lg:row-start-2">
          <h2 id="room-heading" className="sr-only">
            Room and viewer
          </h2>
          <Segmented label="Shown on" value={settings.kind} options={[['screen', 'A screen'], ['poster', 'A poster or sign']]} onChange={(kind) => change({ kind, width: kind === 'screen' ? 3 : 0.594 })} />

          <div className="grid gap-2">
            <Length label={settings.kind === 'screen' ? 'Screen width' : 'Poster width'} meters={settings.width} units={u} small={settings.kind === 'poster'} min={0.05} max={30} onChange={(width) => change({ width })} />
            <div className="flex flex-wrap gap-1.5">
              {presets.map(([label, meters]) => (
                <button key={label} type="button" onClick={() => change({ width: meters })} className="cursor-pointer rounded-full border border-rule px-3 py-1 text-xs text-dim hover:border-dim/60 hover:text-ink">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="distance" className="text-sm font-medium">
              Viewer’s distance: <span className="tabular-nums">{formatDistance(settings.distance, u)}</span>
            </label>
            <input
              id="distance"
              type="range"
              min={0.5}
              max={40}
              step={0.5}
              value={settings.distance}
              onChange={(e) => change({ distance: Number(e.target.value) })}
              className="w-full cursor-pointer accent-current"
            />
            <div className="flex justify-between text-xs text-dim">
              <span>{formatDistance(0.5, u)}</span>
              <span>{formatDistance(40, u)}</span>
            </div>
          </div>

          <Segmented label="Their eyesight" value={settings.eyesight} options={(Object.keys(EYESIGHT) as Eyesight[]).map((e) => [e, EYESIGHT[e].label])} onChange={(eyesight) => change({ eyesight })} />

          <Segmented label="Units" value={u} options={[['metric', 'Meters'], ['imperial', 'Feet']]} onChange={(units) => change({ units })} />
        </section>

      </div>
    </div>
  )
}

function Guidance({ settings }: { settings: Settings }) {
  const { distance, eyesight, width, units } = settings
  const just = readable(distance, eyesight)
  const comfy = comfortable(distance, eyesight)
  return (
    <div className="mt-2 grid gap-2 text-pretty">
      <p className="text-dim">
        For someone with {EYESIGHT[eyesight].phrase}, capital letters <span className="font-medium text-ink">{formatHeight(just, units)}</span> tall can
        just be read, and <span className="font-medium text-ink">{formatHeight(comfy, units)}</span> reads comfortably.
      </p>
      {settings.kind === 'screen' ? (
        <p className="rounded-lg border border-rule bg-ink/[0.03] px-3 py-2">
          On a {formatDistance(width, units)} wide screen, use slide text of at least <span className="font-semibold tabular-nums">{Math.ceil(slidePoints(comfy, width))} pt</span>.
          Below <span className="tabular-nums">{Math.ceil(slidePoints(just, width))} pt</span> it can’t be read at all.
        </p>
      ) : (
        <p className="rounded-lg border border-rule bg-ink/[0.03] px-3 py-2">
          Make the smallest letters on the poster at least <span className="font-semibold">{formatHeight(comfy, units)}</span> tall.
        </p>
      )}
    </div>
  )
}

function View({ picture, settings, change }: { picture: Picture; settings: Settings; change: (patch: Partial<Settings>) => void }) {
  const frame = useRef<HTMLDivElement>(null)
  const [frameWidth, setFrameWidth] = useState(600)
  useEffect(() => {
    const el = frame.current
    if (!el) return
    const observer = new ResizeObserver(() => setFrameWidth(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const sigma = blurPixels(settings.distance, settings.eyesight, settings.width, picture.width)
  const trueSize = settings.view === 'true'
  const shownWidth = trueSize ? trueWidth(settings.width, settings.distance, settings.yourDistance) * settings.pxPerM : frameWidth
  // At true size your own eyes already blur it like 20/20 would, so only weaker eyesight adds more.
  const sigmaShown = trueSize
    ? Math.max(0, sigma - blurPixels(settings.distance, '20/20', settings.width, picture.width)) * (shownWidth / picture.width)
    : sigma * (shownWidth / picture.width)

  return (
    <div className="mt-5">
      <Segmented label="View" value={settings.view} options={[['closeup', 'Close-up'], ['true', 'True size']]} onChange={(view) => change({ view })} />
      <div ref={frame} className="mt-3 overflow-auto rounded-xl border border-rule bg-white">
        {/* At true size, a picture bigger than the frame scrolls rather than being cut off. */}
        <div className={`flex w-max min-w-full items-center justify-center ${trueSize ? 'min-h-48 p-6' : ''}`}>
          <img
            src={picture.url}
            alt={`${picture.name} as seen from ${formatDistance(settings.distance, settings.units)} away`}
            style={{ width: Math.max(1, Math.min(trueSize ? 4000 : frameWidth, shownWidth)), filter: sigmaShown > 0.05 ? `blur(${sigmaShown.toFixed(2)}px)` : undefined }}
            className="block h-auto max-w-none"
          />
        </div>
      </div>
      {trueSize ? (
        <>
          {shownWidth > frameWidth && <p className="mt-2 text-sm text-dim">From this close it looks bigger than this window; scroll to see all of it.</p>}
          <TrueSizeHelp settings={settings} change={change} />
        </>
      ) : (
        <p className="mt-2 text-sm text-dim">
          Shown large so you can look closely; the blur takes away what can’t be made out from there. Anything you can’t read here, they
          can’t read either.
        </p>
      )}
    </div>
  )
}

function TrueSizeHelp({ settings, change }: { settings: Settings; change: (patch: Partial<Settings>) => void }) {
  const cardPx = 0.0856 * settings.pxPerM
  return (
    <div className="mt-3 grid gap-3 text-sm text-dim">
      <p>
        Drawn as big as it looks to them, for you sitting {formatDistance(settings.yourDistance, settings.units)} from this screen. For an accurate size, match the bar to a bank card held against the screen.
      </p>
      <div className="grid gap-1.5">
        <div className="h-6 rounded-md border-2 border-ink/70" style={{ width: cardPx }} aria-hidden="true" />
        <label className="grid gap-1">
          <span>Bank card width</span>
          <input
            type="range"
            min={CSS_PX_PER_M * 0.5}
            max={CSS_PX_PER_M * 1.8}
            step={10}
            value={settings.pxPerM}
            onChange={(e) => change({ pxPerM: Number(e.target.value) })}
            className="w-full max-w-xs cursor-pointer accent-current"
          />
        </label>
      </div>
      <Segmented
        label="You sit"
        value={String(settings.yourDistance)}
        options={[['0.35', 'Phone distance'], ['0.6', 'Desk distance']]}
        onChange={(d) => change({ yourDistance: Number(d) })}
      />
    </div>
  )
}

function Length({ label, meters, units, small, min, max, onChange }: { label: string; meters: number; units: Units; small: boolean; min: number; max: number; onChange: (meters: number) => void }) {
  const unit = units === 'metric' ? (small ? 'cm' : 'm') : small ? 'in' : 'ft'
  const shown = (m: number) => String(Math.round(fromMeters(m, units, small) * 10) / 10)
  const [text, setText] = useState(shown(meters))
  const [last, setLast] = useState({ meters, units, small })
  if (last.meters !== meters || last.units !== units || last.small !== small) {
    setLast({ meters, units, small })
    setText(shown(meters))
  }
  const value = toMeters(Number(text.replace(',', '.')), units, small)
  const invalid = !(value >= min && value <= max)
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <span className="relative w-36">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            const v = toMeters(Number(e.target.value.replace(',', '.')), units, small)
            if (v >= min && v <= max) {
              setLast({ meters: v, units, small })
              onChange(v)
            }
          }}
          onBlur={() => setText(shown(meters))}
          inputMode="decimal"
          aria-invalid={invalid || undefined}
          className="h-11 w-full min-w-0 rounded-lg border border-rule bg-paper px-3 pr-10 text-base text-ink tabular-nums hover:border-dim/60 aria-invalid:border-red-600 sm:h-10 sm:text-sm dark:aria-invalid:border-red-400"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-dim" aria-hidden="true">
          {unit}
        </span>
      </span>
    </label>
  )
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (value: T) => void }): ReactNode {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex w-fit max-w-full flex-wrap rounded-lg border border-rule p-0.5">
        {options.map(([v, text]) => (
          <label key={v} className="cursor-pointer">
            <input type="radio" name={label} checked={value === v} onChange={() => onChange(v)} className="peer sr-only" />
            <span className="inline-flex h-10 items-center rounded-md px-3 text-sm whitespace-nowrap transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:h-9">
              {text}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** A 16:9 slide with lines from 44 down to 10 points, to see which sizes survive the distance. */
async function sampleSlide(): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 900
  const ctx = canvas.getContext('2d')!
  const pt = 900 / 540
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 1600, 900)
  ctx.fillStyle = '#1c1917'
  ctx.textBaseline = 'alphabetic'
  const font = (size: number, weight = 400) => `${weight} ${size * pt}px system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif`
  ctx.font = font(44, 700)
  ctx.fillText('Quarterly results', 90, 140)
  let y = 230
  for (const size of [32, 28, 24, 20, 16, 12, 10]) {
    ctx.font = font(size)
    ctx.fillText(`This line is ${size} pt: sales grew in every region`, 90, y)
    y += size * pt * 1.55
  }
  // A small chart, whose axis labels are a usual casualty.
  const bars = [0.55, 0.7, 0.62, 0.86]
  bars.forEach((h, i) => {
    ctx.fillStyle = '#2a78d6'
    ctx.fillRect(1180 + i * 80, 760 - h * 380, 56, h * 380)
    ctx.fillStyle = '#57534e'
    ctx.font = font(12)
    ctx.fillText(`Q${i + 1}`, 1192 + i * 80, 795)
  })
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
}

function load(): Settings {
  const units = defaultUnits(navigator.language)
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  const fallback: Settings = { kind: 'screen', width: 3, distance: 12, eyesight: '20/20', units, view: 'closeup', yourDistance: coarse ? 0.35 : 0.6, pxPerM: CSS_PX_PER_M }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!data) return fallback
    const n = (v: unknown, min: number, max: number, otherwise: number) => (typeof v === 'number' && v >= min && v <= max ? v : otherwise)
    return {
      kind: data.kind === 'poster' ? 'poster' : 'screen',
      width: n(data.width, 0.05, 30, fallback.width),
      distance: n(data.distance, 0.5, 40, fallback.distance),
      eyesight: data.eyesight in EYESIGHT ? data.eyesight : '20/20',
      units: data.units === 'imperial' ? 'imperial' : data.units === 'metric' ? 'metric' : units,
      view: data.view === 'true' ? 'true' : 'closeup',
      yourDistance: data.yourDistance === 0.35 || data.yourDistance === 0.6 ? data.yourDistance : fallback.yourDistance,
      pxPerM: n(data.pxPerM, CSS_PX_PER_M * 0.5, CSS_PX_PER_M * 1.8, CSS_PX_PER_M),
    }
  } catch {
    return fallback
  }
}
