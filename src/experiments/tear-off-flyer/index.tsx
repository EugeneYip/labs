import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { BLANK, defaultPaper, EXAMPLE, largestFit, LIMITS, MARGIN, PAPERS, sanitize, type Flyer } from './model.ts'

// The flyer's text and settings, and a downscaled copy of its photo, kept on this device.
const STORAGE_KEY = 'labs:tear-off-flyer'
const PHOTO_KEY = 'labs:tear-off-flyer:photo'

const field = 'w-full min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** Experiment #009: a printable noticeboard flyer with tear-off contact tabs. */
export default function TearOffFlyer() {
  const [flyer, setFlyer] = useState(load)
  const [photo, setPhoto] = useState<string | null>(() => read(PHOTO_KEY))
  const [photoNote, setPhotoNote] = useState('')
  const [overflow, setOverflow] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...flyer }))
    } catch {
      // Private browsing or full storage: the flyer just won't be remembered.
    }
  }, [flyer])

  const change = (patch: Partial<Flyer>) => setFlyer((f) => ({ ...f, ...patch }))

  const choosePhoto = async (file: File | undefined) => {
    if (!file) return
    setPhotoNote('')
    try {
      const url = await downscale(file)
      setPhoto(url)
      try {
        localStorage.setItem(PHOTO_KEY, url)
      } catch {
        setPhotoNote('The photo is too big to remember here, so it will be gone if you leave the page.')
      }
    } catch {
      setPhotoNote('That photo couldn’t be opened here. Try a JPEG or PNG.')
    }
  }
  const removePhoto = () => {
    setPhoto(null)
    setPhotoNote('')
    try {
      localStorage.removeItem(PHOTO_KEY)
    } catch {
      // Nothing was stored.
    }
  }

  const empty = !flyer.headline && !flyer.details && !flyer.tab && !photo

  return (
    <div className="flex-1">
      <style>{printStyles(flyer)}</style>
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-5" aria-label="Flyer">
          <p className="text-pretty text-dim">
            Make a flyer for a noticeboard or lamppost with tear-off tabs along the bottom, so people can take your number with
            them. The text sizes itself to fill the page. Print it, or save it as a PDF from the print dialog.
          </p>

          <Field label="Headline">
            <input value={flyer.headline} onChange={(e) => change({ headline: e.target.value })} maxLength={LIMITS.headline} placeholder="Lost cat, Guitar lessons, Room for rent…" dir="auto" className={`${field} h-11 sm:h-10`} />
          </Field>
          <Field label="Under the headline" optional>
            <input value={flyer.subhead} onChange={(e) => change({ subhead: e.target.value })} maxLength={LIMITS.subhead} placeholder="One line with the key fact" dir="auto" className={`${field} h-11 sm:h-10`} />
          </Field>

          <div className="grid gap-1.5">
            <span className="text-sm font-medium">
              Photo <span className="font-normal text-dim">(optional)</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <label className={`${outline} cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink`}>
                {photo ? 'Change photo' : 'Add a photo'}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => void choosePhoto(e.target.files?.[0]).finally(() => (e.target.value = ''))} />
              </label>
              {photo && (
                <>
                  <Segmented label="Photo fit" value={flyer.photoFit} options={[['cover', 'Fill'], ['contain', 'Whole photo']]} onChange={(photoFit) => change({ photoFit })} />
                  <button type="button" onClick={removePhoto} className={quiet}>
                    Remove
                  </button>
                </>
              )}
            </div>
            {photoNote && <p className="text-sm text-dim">{photoNote}</p>}
            <p className="text-sm text-dim">The photo stays on this device.</p>
          </div>

          <Field label="Details">
            <textarea value={flyer.details} onChange={(e) => change({ details: e.target.value })} maxLength={LIMITS.details} rows={5} placeholder="Where, when, what it costs, anything people should know" dir="auto" className={`${field} py-2`} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="On each tab">
              <input value={flyer.tab} onChange={(e) => change({ tab: e.target.value })} maxLength={LIMITS.tab} placeholder="Dana 555-0134" dir="auto" className={`${field} h-11 sm:h-10`} />
            </Field>
            <Field label="Second line on tabs" optional>
              <input value={flyer.tabNote} onChange={(e) => change({ tabNote: e.target.value })} maxLength={LIMITS.tabNote} placeholder="Lost cat" dir="auto" className={`${field} h-11 sm:h-10`} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <Field label="Tabs">
              <select value={flyer.tabs} onChange={(e) => change({ tabs: Number(e.target.value) })} className={`${field} h-11 w-auto cursor-pointer sm:h-10`}>
                {Array.from({ length: LIMITS.maxTabs - LIMITS.minTabs + 1 }, (_, i) => LIMITS.minTabs + i).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Segmented label="Paper" value={flyer.paper} options={[['letter', 'Letter'], ['a4', 'A4']]} onChange={(paper) => change({ paper })} />
            <Segmented label="Style" value={flyer.look} options={[['plain', 'Plain'], ['bold', 'Bold']]} onChange={(look) => change({ look })} />
            <Segmented label="Type" value={flyer.font} options={[['sans', 'Sans'], ['serif', 'Serif']]} onChange={(font) => change({ font })} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => window.print()} disabled={empty} className={`${primary} disabled:cursor-default disabled:opacity-40`}>
              Print
            </button>
            {empty ? (
              <button type="button" onClick={() => change(EXAMPLE)} className={outline}>
                Show an example
              </button>
            ) : clearing ? (
              <span className="flex flex-wrap items-center gap-2 text-sm">
                Clear the whole flyer?
                <button
                  type="button"
                  onClick={() => {
                    setFlyer({ ...BLANK, paper: flyer.paper })
                    removePhoto()
                    setClearing(false)
                  }}
                  className={outline}
                >
                  Clear
                </button>
                <button type="button" onClick={() => setClearing(false)} className={quiet}>
                  Keep it
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setClearing(true)} className={quiet}>
                Start over
              </button>
            )}
          </div>
          {overflow && (
            <p role="status" className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:border-amber-400/40 dark:text-amber-100">
              There’s more text than fits, even at the smallest size. Shorten the details or the headline, or remove the photo.
            </p>
          )}
          <p className="text-sm text-dim">Printing tip: in the print dialog, keep the scale at 100% and turn off headers and footers.</p>
        </form>

        <div className="mt-10 lg:sticky lg:top-6 lg:mt-0">
          <p className="mb-2 text-sm text-dim">
            Preview · {PAPERS[flyer.paper].label}, {flyer.tabs} tabs
          </p>
          <Preview flyer={flyer} photo={photo} onOverflow={setOverflow} />
        </div>
      </div>
    </div>
  )
}

const PX_PER_INCH = 96

/** The page at true size, scaled down to fit the column. The same element is what prints. */
function Preview({ flyer, photo, onOverflow }: { flyer: Flyer; photo: string | null; onOverflow: (overflow: boolean) => void }) {
  const paper = PAPERS[flyer.paper]
  const frame = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  const headline = useRef<HTMLHeadingElement>(null)
  const subhead = useRef<HTMLParagraphElement>(null)
  const details = useRef<HTMLDivElement>(null)
  const detailsBox = useRef<HTMLDivElement>(null)
  const tab = useRef<HTMLDivElement>(null)
  const [sizes, setSizes] = useState({ headline: 72, subhead: 24, details: 18, tab: 11 })

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const observer = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / (paper.width * PX_PER_INCH))))
    observer.observe(el)
    return () => observer.disconnect()
  }, [paper.width])

  // Each block takes the largest size that fits, in order, since the details get whatever space is left.
  useLayoutEffect(() => {
    const sizeTo = (el: HTMLElement | null, min: number, max: number, fits: (el: HTMLElement) => boolean) => {
      if (!el) return { size: min, fits: true }
      const result = largestFit(min, max, (size) => {
        el.style.fontSize = `${size}pt`
        return fits(el)
      })
      el.style.fontSize = `${result.size}pt`
      return result
    }
    const noSideways = (el: HTMLElement) => el.scrollWidth <= el.clientWidth + 1
    const h = sizeTo(headline.current, 28, 110, (el) => noSideways(el) && el.scrollHeight <= 2.6 * PX_PER_INCH)
    const s = sizeTo(subhead.current, 14, 30, (el) => noSideways(el) && el.scrollHeight <= 1.0 * PX_PER_INCH)
    const box = detailsBox.current
    const d = sizeTo(details.current, 10, 40, (el) => noSideways(el) && (!box || el.scrollHeight <= box.clientHeight + 1))
    const t = sizeTo(tab.current, 7, 16, (el) => el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1)
    setSizes({ headline: h.size, subhead: s.size, details: d.size, tab: t.size })
    onOverflow(!h.fits || !s.fits || !d.fits)
  }, [flyer, photo, onOverflow])

  const width = paper.width - 2 * MARGIN
  const height = paper.height - 2 * MARGIN
  const font = flyer.font === 'serif' ? 'ui-serif, Georgia, Cambria, "Times New Roman", serif' : 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
  const bold = flyer.look === 'bold'
  const tabs = Array.from({ length: flyer.tabs }, (_, i) => i)

  return (
    <div ref={frame} aria-hidden="true" style={{ height: paper.height * PX_PER_INCH * scale }}>
      <div
        id="flyer-paper"
        className="origin-top-left bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
        style={{ width: `${paper.width}in`, height: `${paper.height}in`, padding: `${MARGIN}in`, transform: `scale(${scale})` }}
      >
        <div id="flyer-sheet" className="flex flex-col overflow-hidden text-center text-black [print-color-adjust:exact]" style={{ width: `${width}in`, height: `${height}in`, fontFamily: font }}>
          <div className={bold ? 'rounded-[0.12in] bg-black px-[0.3in] py-[0.22in] text-white' : 'px-[0.1in] pt-[0.05in]'}>
            <h2 ref={headline} dir="auto" className="leading-[1.02] font-extrabold tracking-tight" style={{ fontSize: `${sizes.headline}pt` }}>
              {flyer.headline || 'Headline'}
            </h2>
            {flyer.subhead && (
              <p ref={subhead} dir="auto" className={`mt-[0.08in] leading-tight font-medium break-words ${bold ? 'text-white/85' : 'text-black/75'}`} style={{ fontSize: `${sizes.subhead}pt` }}>
                {flyer.subhead}
              </p>
            )}
          </div>

          {photo && (
            <div className="mt-[0.2in] shrink-0" style={{ height: `${flyer.paper === 'a4' ? 3.6 : 3.2}in` }}>
              <img src={photo} alt="" className="size-full rounded-[0.06in]" style={{ objectFit: flyer.photoFit }} />
            </div>
          )}

          <div ref={detailsBox} className="mt-[0.2in] min-h-0 flex-1 overflow-hidden">
            <div ref={details} dir="auto" className="px-[0.1in] leading-snug break-words whitespace-pre-line" style={{ fontSize: `${sizes.details}pt` }}>
              {flyer.details || (flyer.headline ? '' : 'Details go here.')}
            </div>
          </div>

          <div className="mt-[0.15in] flex h-[2.3in] shrink-0 border-t-2 border-dashed border-black/60">
            {tabs.map((i) => (
              <div key={i} className={`flex min-w-0 flex-1 items-center justify-center py-[0.12in] ${i > 0 ? 'border-l border-dashed border-black/60' : ''}`}>
                <div
                  ref={i === 0 ? tab : undefined}
                  dir="auto"
                  className="flex h-full max-w-full rotate-180 flex-col items-start justify-center overflow-hidden text-left leading-tight [writing-mode:vertical-rl]"
                  style={{ fontSize: `${sizes.tab}pt` }}
                >
                  <span className="font-bold whitespace-nowrap">{flyer.tab || 'Your name and number'}</span>
                  {flyer.tabNote && <span className="whitespace-nowrap">{flyer.tabNote}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">
        {label} {optional && <span className="font-normal text-dim">(optional)</span>}
      </span>
      {children}
    </label>
  )
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (value: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex rounded-lg border border-rule p-0.5">
        {options.map(([v, text]) => (
          <label key={v} className="cursor-pointer">
            <input type="radio" name={label} checked={value === v} onChange={() => onChange(v)} className="peer sr-only" />
            <span className="inline-flex h-10 items-center justify-center rounded-md px-3 text-sm whitespace-nowrap transition-colors peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink sm:h-9">
              {text}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/**
 * When printing, only the flyer shows, at true size, on a page of the chosen
 * paper. Everything else on the page, including its frame, is hidden.
 */
function printStyles(flyer: Flyer): string {
  const paper = PAPERS[flyer.paper]
  return `@media print {
  @page { size: ${paper.width}in ${paper.height}in; margin: ${MARGIN}in; }
  html, body { background: white !important; }
  body *:not(:has(#flyer-sheet)):not(#flyer-sheet):not(#flyer-sheet *) { display: none !important; }
  body *:has(#flyer-sheet) { display: block !important; margin: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; max-width: none !important; width: auto !important; height: auto !important; min-height: 0 !important; transform: none !important; position: static !important; background: none !important; }
  #flyer-sheet { display: flex !important; break-inside: avoid; }
}`
}

function load(): Flyer {
  const fallback = { ...BLANK, paper: defaultPaper(navigator.language) }
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return data ? sanitize(data, fallback.paper) : fallback
  } catch {
    return fallback
  }
}

function read(key: string): string | null {
  try {
    const value = localStorage.getItem(key)
    return value?.startsWith('data:image/') ? value : null
  } catch {
    return null
  }
}

/** A JPEG no larger than 1600 pixels on its long side: plenty for print, small enough to keep. */
async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    // onload rather than decode(), which can wait indefinitely while the page is in the background.
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = url
    })
    const ratio = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No canvas')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}
