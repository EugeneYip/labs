import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type KeyboardEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import { NotSaving } from '../../components/NotSaving.tsx'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { exampleDrawing, exampleWork } from './example.ts'
import { balloonedPdf, radiusFor, warmUpWriter, type Placed } from './exportPdf.ts'
import {
  ATTRIBUTE_RESULTS,
  besideCallout,
  blankBalloon,
  calloutNear,
  checks,
  evaluateWith,
  form3Csv,
  inReadingOrder,
  limitsFor,
  limitText,
  MAX_LENGTH,
  MAX_PIECES,
  MAX_ZONES,
  moveToNumber,
  newWork,
  readWork,
  removeBalloon,
  resultText,
  STATUS_TEXT,
  STORAGE_KEY,
  updateBalloon,
  WORK_FILE_FORMAT,
  zoneAt,
  zonesValid,
  type Balloon,
  type BalloonSize,
  type Corner,
  type Evaluation,
  type Reading,
  type TextBox,
  type Work,
  type Zones,
} from './model.ts'
import { onMissingData, openPdf, pageImage, pdfjs, textBoxes, warmUp } from './pdf.ts'
import { fingerprint, forgetDrawings, fromBase64, keepDrawing, keptDrawing, toBase64 } from './store.ts'
import { Viewer, type ShownBalloon, type ViewerHandle } from './Viewer.tsx'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 sm:h-10`
const button = 'inline-flex min-h-11 max-w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-center text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const small = 'inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-rule px-2.5 text-sm hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50'
const summaryStyle = 'cursor-pointer py-0.5 text-sm font-medium underline-offset-4 hover:underline'
const label = 'grid grid-cols-1 gap-1.5 text-sm'

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`

function stored(): string | null | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return undefined
  }
}

function parsed(text: string | null | undefined): unknown {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function download(content: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}

/** The file name without its extension, for the names of what's exported. */
const baseName = (name: string) => name.replace(/\.[^.]+$/, '').trim() || 'drawing'

const isPdf = (bytes: Uint8Array) => {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 1024))
  return head.includes('%PDF-')
}

/**
 * The numbers of balloons inside one of the drawing's comments, stamps, or form fields (anything a reader draws over
 * the page, apart from links and pop-up notes), which a PDF reader shows on top of them.
 */
async function underAnnotations(doc: PDFDocumentProxy, balloons: readonly Balloon[]): Promise<number[]> {
  const out: number[] = []
  const bySheet = new Map<number, [number, number, number, number][]>()
  for (let i = 0; i < balloons.length; i++) {
    const b = balloons[i]
    let rects = bySheet.get(b.sheet)
    if (!rects) {
      const annotations = await (await doc.getPage(b.sheet)).getAnnotations({ intent: 'print' }).catch(() => [])
      rects = annotations
        .filter((a: { subtype?: string; rect?: number[] }) => a.subtype !== 'Link' && a.subtype !== 'Popup' && Array.isArray(a.rect) && a.rect.length === 4)
        .map((a: { rect: number[] }) => [Math.min(a.rect[0], a.rect[2]), Math.min(a.rect[1], a.rect[3]), Math.max(a.rect[0], a.rect[2]), Math.max(a.rect[1], a.rect[3])] as [number, number, number, number])
      bySheet.set(b.sheet, rects)
    }
    if (rects.some(([x0, y0, x1, y1]) => b.x >= x0 && b.x <= x1 && b.y >= y0 && b.y <= y1)) out.push(i + 1)
  }
  return out
}

/** Lets pdf.js free a document (the shared worker stays). */
const release = (d: PDFDocumentProxy) => {
  void d.loadingTask.destroy().catch(() => {})
}

let counter = 0
const newId = () => `b${Date.now().toString(36)}${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

const CORNERS: { id: Corner; label: string }[] = [
  { id: 'top-left', label: 'Top left (ISO 5457 style)' },
  { id: 'bottom-right', label: 'Bottom right (common in ASME drawings)' },
  { id: 'top-right', label: 'Top right' },
  { id: 'bottom-left', label: 'Bottom left' },
]

const DEFAULT_ZONES: Zones = { left: 0.03, top: 0.04, right: 0.97, bottom: 0.96, columns: 8, rows: 6, start: 'top-left', skipIO: true }

const PLACE_NAMES = ['Whole numbers', '1 decimal place (.X)', '2 decimal places (.XX)', '3 decimal places (.XXX)', '4 decimal places (.XXXX)']

const STATUS_CLASS: Record<Evaluation['status'], string> = {
  pass: 'text-ink',
  fail: 'font-semibold text-red-700 dark:text-red-300',
  open: 'text-dim',
  na: 'text-dim',
  unreadable: 'font-semibold text-red-700 dark:text-red-300',
  'not-measured': 'text-dim',
  'no-limits': 'font-semibold text-amber-800 dark:text-amber-300',
}

interface Sheets {
  /** Each sheet's viewport at scale 1 (as shown, y down), by sheet number. */
  views: Map<number, PageViewport>
}

export default function BalloonedDrawing() {
  const [work, setWorkState] = useState<Work | null>(() => readWork(parsed(stored())).work)
  // The work as last set, read by handlers that may run twice before a render (quick clicks, Enter).
  const workRef = useRef(work)
  const setWork = (next: Work | null) => {
    workRef.current = next
    setWorkState(next)
  }
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const bytes = useRef<Uint8Array | null>(null)
  const [sheets, setSheets] = useState<Sheets>({ views: new Map() })
  const [sheet, setSheet] = useState(1)
  const [zoom, setZoom] = useState<number | 'fit'>('fit')
  const [fitZoom, setFitZoom] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [past, setPast] = useState<Balloon[][]>([])
  const [future, setFuture] = useState<Balloon[][]>([])
  const [phase, setPhase] = useState<'idle' | 'opening' | 'missing' | 'exporting'>(() => (work ? 'opening' : 'idle'))
  const [problem, setProblem] = useState('')
  const [notice, setNotice] = useState('')
  const [saved, setSaved] = useState(true)
  const [drawingKept, setDrawingKept] = useState(true)
  const [said, setSaid] = useState('')
  const [framing, setFraming] = useState<{ first: { fx: number; fy: number } | null } | null>(null)
  const [moving, setMoving] = useState(false)
  const [confirm, setConfirm] = useState<{ kind: 'replace'; file: File; text: string } | { kind: 'example'; text: string } | { kind: 'zones'; text: string; zones: Record<number, Zones> } | { kind: 'clear' } | null>(null)
  /** The control that asked for the confirmation, which has focus again when it closes. */
  const confirmFrom = useRef<HTMLElement | null>(null)
  const [dragging, setDragging] = useState(false)
  /** The sheet being rebuilt from images, while a protected drawing's ballooned copy is written. */
  const [rebuilding, setRebuilding] = useState<{ sheet: number; of: number } | null>(null)
  const viewer = useRef<ViewerHandle>(null)
  const viewerBox = useRef<HTMLDivElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const textReady = useRef(new Map<number, TextBox[]>())
  /** The fingerprint of the drawing open now: balloons are placed and exported only with the work made for it. */
  const openId = useRef<string | null>(null)
  /** Balloons placed before their sheet's text had loaded, to fill in from it when it has. */
  const pending = useRef<{ id: string; sheet: number; x: number; y: number }[]>([])
  const opening = useRef(0)
  const say = (m: string) => setSaid((s) => (s === m ? `${m} ` : m))

  // Where focus goes once the page has drawn, if the control that had it is gone (a deleted balloon's editor, the intro
  // once a drawing opens, the drawing once everything is cleared). It's never taken from where the user has put it.
  const [refocus, setRefocus] = useState<{ to: 'viewer' | 'list' | 'open' | HTMLElement | null } | null>(null)
  useEffect(() => {
    if (!refocus) return
    const active = document.activeElement
    if (active && active !== document.body) return
    const t = refocus.to
    if (t === 'viewer') viewer.current?.focus()
    else if (t === 'list' || t === 'open') document.getElementById(`bd-${t}`)?.focus()
    else if (t?.isConnected) t.focus()
  }, [refocus])
  const ask = (c: NonNullable<typeof confirm>) => {
    const active = document.activeElement
    confirmFrom.current = active instanceof HTMLElement && active !== document.body ? active : null
    setConfirm(c)
  }
  const keep = () => {
    setConfirm(null)
    setRefocus({ to: confirmFrom.current })
  }

  // --- Saving: the work in localStorage (shared with other tabs), the drawing in IndexedDB.
  const save = useOtherTabs(STORAGE_KEY, () => {
    const next = readWork(parsed(stored())).work
    const current = workRef.current
    if (!next) {
      if (current && stored() === null) closeDrawing()
      return
    }
    if (!current || next.docId !== current.docId) {
      // Another drawing: this one is closed first, so its sheets are never shown or exported with the other's
      // balloons. The other opens from the browser's store, or the page asks for it to be opened again.
      closeDrawing(next)
      void loadKept(next)
    } else setWork(next)
  })
  useEffect(() => {
    if (!work) return
    const text = JSON.stringify(work)
    const write = () => {
      try {
        save(text)
        setSaved(true)
      } catch {
        setSaved(false)
      }
    }
    // A long list is written a moment after typing stops, and at once when the page is hidden.
    const t = setTimeout(write, work.balloons.length > 200 ? 400 : 0)
    const hide = () => {
      if (document.visibilityState === 'hidden') write()
    }
    document.addEventListener('visibilitychange', hide)
    window.addEventListener('pagehide', write)
    return () => {
      clearTimeout(t)
      document.removeEventListener('visibilitychange', hide)
      window.removeEventListener('pagehide', write)
    }
  }, [work, save])

  /** Closes the drawing, and its work unless `keep` (another drawing's, about to be opened) takes its place. */
  const closeDrawing = (keep: Work | null = null) => {
    opening.current++
    if (doc) release(doc)
    setDoc(null)
    bytes.current = null
    openId.current = null
    setSheets({ views: new Map() })
    textReady.current = new Map()
    pending.current = []
    setWork(keep)
    setSelected(null)
    setPast([])
    setFuture([])
    setPhase(keep ? 'opening' : 'idle')
  }

  /**
   * Opens drawing bytes as `work` (or as new work); a later open makes an earlier one's late answer count for nothing.
   * `focus`: opened by the user, so the drawing takes focus if the control they used has gone (the intro's).
   */
  const openDrawing = async (data: Uint8Array, name: string, prepared?: Work, focus = false) => {
    const seq = ++opening.current
    setPhase('opening')
    setProblem('')
    let d: PDFDocumentProxy
    try {
      d = await openPdf(data)
    } catch (e) {
      if (seq !== opening.current) return
      const n = e instanceof Error ? e.name : ''
      setProblem(
        n === 'PasswordException'
          ? `${name} needs a password to open. Open it in a PDF reader, save a copy without the password, and open that here.`
          : `${name} couldn’t be opened as a PDF${e instanceof Error && e.message ? ` (${e.message})` : ''}.`,
      )
      setPhase(workRef.current && !bytes.current ? 'missing' : bytes.current ? 'idle' : 'idle')
      return
    }
    const id = await fingerprint(data)
    const views = new Map<number, PageViewport>()
    try {
      for (let i = 1; i <= d.numPages; i++) views.set(i, (await d.getPage(i)).getViewport({ scale: 1 }))
    } catch (e) {
      if (seq !== opening.current) return
      setProblem(`${name} opened, but a sheet couldn’t be read (${e instanceof Error ? e.message : String(e)}).`)
      setPhase('idle')
      release(d)
      return
    }
    if (seq !== opening.current) {
      release(d)
      return
    }
    const current = workRef.current
    const base = prepared ?? (current && current.docId === id ? current : newWork(name, id, d.numPages))
    // The sheets are the drawing's own: balloons and zones on sheets it doesn't have (a damaged work file) are left
    // out, and said so.
    const kept = base.balloons.filter((b) => b.sheet <= d.numPages)
    const next: Work = { ...base, name: prepared ? base.name : name, sheets: d.numPages, balloons: kept, zones: Object.fromEntries(Object.entries(base.zones).filter(([s]) => Number(s) <= d.numPages)) }
    if (kept.length < base.balloons.length) setNotice(`${plural(base.balloons.length - kept.length, 'balloon')} on sheets this drawing doesn’t have ${base.balloons.length - kept.length === 1 ? 'was' : 'were'} left out.`)
    if (doc) release(doc)
    bytes.current = data
    openId.current = id
    textReady.current = new Map()
    pending.current = []
    setSheets({ views })
    setDoc(d)
    setWork(next)
    setSheet(1)
    setZoom('fit')
    setSelected(null)
    setPast([])
    setFuture([])
    setPhase('idle')
    if (focus) setRefocus({ to: 'viewer' })
    if (!warmed.current) {
      warmed.current = true
      warmUp()
      warmUpWriter()
    }
    keepDrawing(id, name, data).then(
      () => setDrawingKept(true),
      () => setDrawingKept(false),
    )
    say(`${name} opened: ${plural(d.numPages, 'sheet')}${next.balloons.length ? `, with ${plural(next.balloons.length, 'balloon')} from before` : ''}.`)
  }

  /** The drawing for saved work, from the browser's store, or the request to open it again. */
  const loadKept = async (w: Work) => {
    try {
      const kept = await keptDrawing(w.docId)
      if (kept && (await fingerprint(kept.bytes)) === w.docId) {
        await openDrawing(kept.bytes, w.name, w)
        return
      }
    } catch {
      // The store can't be read (refused, or private browsing): the drawing has to be opened again.
    }
    setPhase('missing')
  }
  useEffect(() => {
    onMissingData(() => setProblem('Some of this drawing couldn’t be drawn: a file it needs (the character map or font for some of its text) couldn’t be fetched, perhaps because there’s no connection. Its text there is missing from the sheet and isn’t read. Connect, then open the drawing again.'))
    return () => onMissingData(null)
  }, [])
  useEffect(() => {
    if (work) void loadKept(work)
    // The PDF reader and writer are fetched a moment after the page has loaded, even before a drawing is opened, so
    // the site's offline copy has them after one visit.
    const t = setTimeout(() => {
      void pdfjs().catch(() => {})
      warmUpWriter()
    }, 2500)
    return () => clearTimeout(t)
    // Only on arrival: later changes come from this page or another tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const warmed = useRef(false)

  /** The confirmation for replacing the balloons here with what `file` holds. */
  const replacing = (file: File, current: Work, incoming?: Work) =>
    incoming && incoming.docId === current.docId
      ? `Open the work in ${file.name}? Its ${plural(incoming.balloons.length, 'balloon')} take the place of the ${plural(current.balloons.length, 'balloon')} here now, which will be cleared from this browser (save your work as a file first to keep them).`
      : `Open ${file.name} instead? The ${plural(current.balloons.length, 'balloon')} on ${current.name} will be cleared from this browser (save your work as a file first to keep them).`

  const openFile = async (file: File, confirmed = false) => {
    const data = new Uint8Array(await file.arrayBuffer())
    const head = new TextDecoder().decode(data.subarray(0, 200)).trimStart()
    if (head.startsWith('{')) return openWorkFile(data, file, confirmed)
    if (!isPdf(data)) {
      setProblem(`${file.name} isn’t a PDF. Open the drawing as a PDF (a scan or a CAD export).`)
      return
    }
    const current = workRef.current
    if (!confirmed && current && current.balloons.length && (await fingerprint(data)) !== current.docId) {
      ask({ kind: 'replace', file, text: replacing(file, current) })
      return
    }
    await openDrawing(data, file.name, undefined, true)
  }

  const openWorkFile = async (data: Uint8Array, file: File, confirmed: boolean) => {
    const name = file.name
    const value = parsed(new TextDecoder().decode(data)) as { format?: unknown; drawing?: { name?: unknown; base64?: unknown }; work?: unknown } | null
    if (!value || value.format !== WORK_FILE_FORMAT || !value.drawing || typeof value.drawing.base64 !== 'string') {
      setProblem(`${name} isn’t a work file saved by this page.`)
      return
    }
    const pdf = fromBase64(value.drawing.base64)
    const { work: w, dropped } = readWork(value.work)
    if (!pdf || !w || !isPdf(pdf)) {
      setProblem(`${name} is damaged: its drawing or its balloons couldn’t be read.`)
      return
    }
    if ((await fingerprint(pdf)) !== w.docId) {
      setProblem(`${name} is damaged: the drawing in it isn’t the one its balloons were placed on.`)
      return
    }
    // Balloons here that the file's would replace are asked about first, as for a drawing (not when they're the same).
    const current = workRef.current
    if (!confirmed && current && current.balloons.length && JSON.stringify(readWork(parsed(JSON.stringify(current))).work) !== JSON.stringify(w)) {
      ask({ kind: 'replace', file, text: replacing(file, current, w) })
      return
    }
    await openDrawing(pdf, w.name, w, true)
    if (dropped) setNotice(`${plural(dropped, 'balloon')} in ${name} couldn’t be read and ${dropped === 1 ? 'was' : 'were'} left out.`)
  }

  const tryExample = async (confirmed = false) => {
    // Balloons kept for a drawing this browser no longer has would be replaced by the example's: asked first.
    const current = workRef.current
    if (!confirmed && current && current.balloons.length) {
      ask({ kind: 'example', text: `Open the example instead? The ${plural(current.balloons.length, 'balloon')} kept for ${current.name} will be cleared from this browser.` })
      return
    }
    const data = exampleDrawing()
    const id = await fingerprint(data)
    await openDrawing(data, 'spacer-plate-example.pdf', exampleWork(id), true)
    say('The example drawing is open, with three balloons placed and its title block tolerances and zones set. Click beside a dimension to add the next.')
  }

  // --- Changing the balloons. Each change is one step to undo; typing in one field of one balloon is one step until
  // another field or balloon is changed.
  const lastEdit = useRef<string | null>(null)
  const remember = (before: Balloon[]) => {
    setPast((p) => [...p.slice(-199), before])
    setFuture([])
  }
  const change = (next: (list: Balloon[]) => Balloon[]) => {
    const w = workRef.current
    if (!w) return
    const list = next(w.balloons)
    if (list === w.balloons) return
    remember(w.balloons)
    lastEdit.current = null
    setWork({ ...w, balloons: list })
  }
  const edit = (id: string, patch: Partial<Omit<Balloon, 'id'>>) => {
    const w = workRef.current
    if (!w) return
    const what = `${id}:${Object.keys(patch).sort().join(',')}`
    if (lastEdit.current !== what) {
      remember(w.balloons)
      lastEdit.current = what
    }
    setWork({ ...w, balloons: updateBalloon(w.balloons, id, patch) })
  }
  const setSettings = (patch: Partial<Omit<Work, 'balloons'>>) => {
    const w = workRef.current
    if (w) setWork({ ...w, ...patch })
  }
  const undo = () => {
    const w = workRef.current
    if (!w || !past.length) return
    const prev = past[past.length - 1]
    setPast((p) => p.slice(0, -1))
    setFuture((f) => [w.balloons, ...f].slice(0, 200))
    lastEdit.current = null
    setWork({ ...w, balloons: prev })
    if (selected && !prev.some((b) => b.id === selected)) setSelected(null)
    say(`Undone: ${plural(prev.length, 'balloon')}.`)
  }
  const redo = () => {
    const w = workRef.current
    if (!w || !future.length) return
    const next = future[0]
    setFuture((f) => f.slice(1))
    setPast((p) => [...p, w.balloons].slice(-200))
    lastEdit.current = null
    setWork({ ...w, balloons: next })
    if (selected && !next.some((b) => b.id === selected)) setSelected(null)
    say(`Redone: ${plural(next.length, 'balloon')}.`)
  }

  // --- Readings, kept until a balloon's requirement or limits (or the reading settings) change.
  const settings = useMemo(() => ({ comma: work?.comma ?? false, titleBlock: work?.titleBlock ?? { places: ['', '', '', '', ''], angle: '' } }), [work?.comma, work?.titleBlock])
  const readingCache = useMemo(() => new Map<string, Reading>(), [settings])
  const read = useCallback(
    (b: Balloon) => {
      const key = JSON.stringify([b.requirement, b.lower, b.upper])
      let r = readingCache.get(key)
      if (!r) {
        r = limitsFor(b, settings)
        readingCache.set(key, r)
      }
      return r
    },
    [readingCache, settings],
  )
  const evaluations = useMemo(() => {
    const m = new Map<string, Evaluation>()
    if (work) for (const b of work.balloons) m.set(b.id, evaluateWith(read(b), b, settings, work.pieces))
    return m
  }, [work, read, settings])
  const summary = useMemo(
    () =>
      work
        ? checks(work, read, (b) => {
            const v = sheets.views.get(b.sheet)
            if (!v) return false
            const [x, y] = v.convertToViewportPoint(b.x, b.y)
            return !(x >= 0 && y >= 0 && x <= v.width && y <= v.height)
          })
        : null,
    [work, read, sheets],
  )

  /** Where a balloon is on its sheet as shown, as fractions from the top left. */
  const where = useCallback(
    (b: Pick<Balloon, 'sheet' | 'x' | 'y'>) => {
      const v = sheets.views.get(b.sheet)
      if (!v) return { fx: 0, fy: 0 }
      const [x, y] = v.convertToViewportPoint(b.x, b.y)
      return { fx: x / v.width, fy: y / v.height }
    },
    [sheets],
  )
  const zoneOf = useCallback(
    (b: Pick<Balloon, 'sheet' | 'x' | 'y'>) => {
      const z = work?.zones[b.sheet]
      if (!z) return null
      const { fx, fy } = where(b)
      return zoneAt(z, fx, fy)
    },
    [work?.zones, where],
  )
  const location = useCallback(
    (b: Balloon) => {
      const z = work?.zones[b.sheet]
      if (!z) return `Sheet ${b.sheet}`
      return `Sheet ${b.sheet}, ${zoneOf(b) ?? 'outside the zones'}`
    },
    [work?.zones, zoneOf],
  )

  // --- The view.
  useEffect(() => {
    const box = viewerBox.current
    const v = sheets.views.get(sheet)
    if (!box || !v) return
    const measure = () => setFitZoom(Math.max(0.1, (box.clientWidth - 28) / v.width))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    return () => ro.disconnect()
  }, [sheets, sheet, doc])
  const z = zoom === 'fit' ? fitZoom : zoom
  const setZ = (next: number) => setZoom(Math.max(0.1, Math.min(8, Math.round(next * 100) / 100)))

  const onRendered = (page: PDFPageProxy) => {
    const n = page.pageNumber
    if (textReady.current.has(n)) return
    const map = textReady.current
    const done = (boxes: TextBox[]) => {
      if (textReady.current !== map) return
      map.set(n, boxes)
      // A balloon placed while the text was loading gets its requirement now, if it still has none.
      const waiting = pending.current.filter((p) => p.sheet === n)
      pending.current = pending.current.filter((p) => p.sheet !== n)
      for (const p of waiting) {
        const b = workRef.current?.balloons.find((x) => x.id === p.id)
        const found = callout(n, p.x, p.y, p.id)
        if (!b || b.requirement || !found) continue
        // Still where it was clicked (not moved meanwhile): it moves beside its callout too.
        const unmoved = b.x === p.x && b.y === p.y
        edit(p.id, unmoved ? { requirement: found.text, x: found.x, y: found.y } : { requirement: found.text })
      }
    }
    textBoxes(page).then(done, () => done([]))
  }

  /**
   * The callout beside a point on a sheet, and where a balloon there should sit so it hides neither it nor the sheet's
   * other balloons (`except` is the one being placed, if it's in the list already), in the PDF's user space; null when
   * the sheet's text hasn't loaded or there's none near.
   */
  const callout = (sheetNumber: number, x: number, y: number, except?: string) => {
    const v = sheets.views.get(sheetNumber)
    const boxes = textReady.current.get(sheetNumber)
    const w = workRef.current
    if (!v || !boxes || !w) return null
    const [vx, vy] = v.convertToViewportPoint(x, y)
    const c = calloutNear(boxes, vx, vy, Math.max(14, 0.025 * Math.max(v.width, v.height)))
    if (!c) return null
    const others = w.balloons.flatMap((b) => {
      if (b.sheet !== sheetNumber || b.id === except) return []
      const [ox, oy] = v.convertToViewportPoint(b.x, b.y)
      return [{ x: ox, y: oy }]
    })
    const q = besideCallout(c, vx, vy, radiusFor(v.width, v.height, w.size), v.width, v.height, boxes, others)
    const [bx, by] = v.convertToPdfPoint(q.x, q.y)
    return { text: c.text, x: bx, y: by }
  }
  const capture = (sheetNumber: number, x: number, y: number): string => callout(sheetNumber, x, y)?.text ?? ''

  const place = (x: number, y: number) => {
    const w = workRef.current
    if (!w || w.docId !== openId.current) return
    const id = newId()
    // Read the callout there, and sit the balloon just beside it rather than on top of it.
    const found = callout(sheet, x, y)
    const requirement = found?.text ?? ''
    if (!textReady.current.has(sheet)) pending.current.push({ id, sheet, x, y })
    const b = blankBalloon(id, sheet, found?.x ?? x, found?.y ?? y, requirement)
    const n = w.balloons.length + 1
    // At once, not on a later frame: a quick next click or key must see this balloon.
    flushSync(() => {
      change((list) => [...list, b])
      setSelected(id)
    })
    const zone = w.zones[sheet] ? zoneAt(w.zones[sheet], where(b).fx, where(b).fy) : null
    say(`Balloon ${n} placed on sheet ${sheet}${zone ? `, zone ${zone}` : ''}: ${requirement ? `read “${requirement}” from the drawing` : textReady.current.has(sheet) ? 'no text there, so type the requirement' : 'the drawing’s text is still loading'}.`)
  }

  const moveBalloon = (id: string, x: number, y: number) => {
    // To the sheet it's put on, which may not be the one it was on (the sheet can change while moving).
    change((list) => updateBalloon(list, id, { sheet, x, y }))
    setMoving(false)
    const w = workRef.current
    if (w) say(`Balloon ${w.balloons.findIndex((b) => b.id === id) + 1} moved.`)
  }

  const remove = (id: string) => {
    const w = workRef.current
    if (!w) return
    const i = w.balloons.findIndex((b) => b.id === id)
    if (i < 0) return
    const after = w.balloons[i + 1] ?? w.balloons[i - 1] ?? null
    flushSync(() => {
      change((list) => removeBalloon(list, id))
      setSelected(after?.id ?? null)
      setMoving(false)
    })
    // From the editor (whose Delete button goes with it), focus moves to the list; from the list's last balloon, to
    // the drawing.
    setRefocus({ to: after ? 'list' : 'viewer' })
    say(`Balloon ${i + 1} deleted; the ones after it moved down a number. Undo brings it back.`)
  }

  const frameCorner = (fx: number, fy: number) => {
    if (!framing) return
    if (!framing.first) {
      setFraming({ first: { fx, fy } })
      say('First corner set. Now click the opposite corner of the zone frame.')
      return
    }
    const a = framing.first
    const zones: Zones = { ...(workRef.current?.zones[sheet] ?? DEFAULT_ZONES), left: Math.min(a.fx, fx), right: Math.max(a.fx, fx), top: Math.min(a.fy, fy), bottom: Math.max(a.fy, fy) }
    setFraming(null)
    if (zonesValid(zones)) {
      setSettings({ zones: { ...workRef.current!.zones, [sheet]: zones } })
      say('Zone frame set.')
    } else say('That frame is too small; set it again.')
  }

  const viewerKey = (e: KeyboardEvent<HTMLDivElement>): boolean => {
    const mod = e.ctrlKey || e.metaKey
    if (mod && e.key.toLowerCase() === 'z') {
      if (e.shiftKey) redo()
      else undo()
      return true
    }
    if (mod && e.key.toLowerCase() === 'y') {
      redo()
      return true
    }
    if (mod || e.altKey) return false
    if (e.key === 'Enter' && e.shiftKey) {
      say('No balloon is chosen to move: choose one in the list first.')
      return true
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
      remove(selected)
      return true
    }
    if (e.key === 'Escape') {
      if (framing) setFraming(null)
      else if (moving) setMoving(false)
      else setSelected(null)
      return true
    }
    if (e.key === '+' || e.key === '=') setZ(z * 1.25)
    else if (e.key === '-' || e.key === '_') setZ(z / 1.25)
    else if (e.key === '0') setZoom('fit')
    else if (e.key === 'PageDown' && work && sheet < work.sheets) setSheet(sheet + 1)
    else if (e.key === 'PageUp' && sheet > 1) setSheet(sheet - 1)
    else return false
    return true
  }

  // --- Exports.
  const exportPdf = async () => {
    const w = workRef.current
    if (!w || !doc || !bytes.current || w.docId !== openId.current) return
    setPhase('exporting')
    setNotice('')
    setRebuilding(null)
    try {
      const placed: Placed[] = w.balloons.map((b, i) => ({ sheet: b.sheet, x: b.x, y: b.y, number: i + 1 }))
      const result = await balloonedPdf(
        bytes.current,
        w.sheets,
        placed,
        w.size,
        async (n) => pageImage(await doc.getPage(n)),
        (p) => {
          const v = sheets.views.get(p.sheet)!
          const [x, y] = v.convertToViewportPoint(p.x, p.y)
          return { x, y }
        },
        (n) => setRebuilding({ sheet: n, of: w.sheets }),
      )
      download(result.bytes as BlobPart, `${baseName(w.name)}-ballooned.pdf`, 'application/pdf')
      const notes: string[] = []
      if (result.rebuilt) notes.push(`The ballooned PDF is a copy rebuilt from pictures of the sheets (about 200 dots an inch, fewer for the largest), because ${result.rebuilt}; the original file is unchanged. The copy’s text can’t be selected or searched.`)
      // A signed drawing's signature covers the file as it was: the ballooned copy is a new file.
      const fields = await doc.getFieldObjects().catch(() => null)
      if (fields && Object.values(fields).some((list) => (list as { type?: string }[]).some((f) => f.type === 'signature'))) notes.push('The drawing has a digital signature, which doesn’t carry over to the ballooned copy (a new file); the signed original is unchanged.')
      // PDF readers draw a drawing's comments, stamps, and form fields above the page, so a balloon under one is
      // hidden in the PDF (a rebuilt copy has them in its images, under the balloons).
      if (!result.rebuilt) {
        const under = await underAnnotations(doc, w.balloons)
        if (under.length) notes.push(`${under.length === 1 ? 'Balloon' : 'Balloons'} ${under.join(', ')} ${under.length === 1 ? 'is' : 'are'} under a comment, stamp, or form field in the drawing, which PDF readers show on top, so ${under.length === 1 ? 'it' : 'they'} may be hidden in the PDF. Move ${under.length === 1 ? 'it' : 'them'} clear and save it again.`)
      }
      setNotice(notes.join(' '))
      say('The ballooned PDF is ready.')
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      // The PDF writer is loaded when it's first needed: offline, before the site's copy has it, that fails.
      setProblem(
        /dynamically imported module|Importing a module script failed|error loading dynamically/i.test(message)
          ? 'The ballooned PDF needs a connection this once: the part of the page that writes PDFs isn’t in this browser’s offline copy yet. Connect, then try again (it’s kept after that).'
          : `The ballooned PDF couldn’t be written: ${message}`,
      )
    } finally {
      setPhase('idle')
      setRebuilding(null)
    }
  }
  const exportCsv = () => {
    const w = workRef.current
    if (!w) return
    download(form3Csv(w, location, read), `${baseName(w.name)}-form-3.csv`, 'text/csv;charset=utf-8')
  }
  const saveWorkFile = () => {
    const w = workRef.current
    if (!w || !bytes.current) return
    const file = JSON.stringify({ format: WORK_FILE_FORMAT, version: 1, drawing: { name: w.name, base64: toBase64(bytes.current) }, work: w })
    download(file, `${baseName(w.name)}-balloons.json`, 'application/json')
  }
  const clearAll = async () => {
    closeDrawing()
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Nothing was being kept.
    }
    try {
      await forgetDrawings()
    } catch {
      // Nothing was being kept.
    }
    setConfirm(null)
    setRefocus({ to: 'open' })
    say('Everything is cleared from this browser.')
  }

  // --- Dropping a file anywhere on the page.
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void openFile(file)
  }

  const current = work?.balloons.find((b) => b.id === selected) ?? null
  const currentNumber = current && work ? work.balloons.indexOf(current) + 1 : 0
  const shown: ShownBalloon[] = useMemo(
    () => (work ? work.balloons.flatMap((b, i) => (b.sheet === sheet ? [{ id: b.id, number: i + 1, x: b.x, y: b.y, failed: evaluations.get(b.id)?.status === 'fail' }] : [])) : []),
    [work, sheet, evaluations],
  )

  const fileButton = (text: string, cls = primary, id?: string) => (
    <button type="button" id={id} className={cls} onClick={() => fileInput.current?.click()}>
      {text}
    </button>
  )

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col ${dragging ? 'outline-2 -outline-offset-4 outline-dashed outline-ink/40' : ''}`}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('Files')) {
          e.preventDefault()
          setDragging(true)
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={onDrop}
    >
      <style>{`@media print { :root { --color-paper: #fff; --color-ink: #000; --color-dim: #333; --color-rule: #999; } @page { size: landscape; margin: 10mm; } .print-row { break-inside: avoid; } }`}</style>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
      <input
        ref={fileInput}
        type="file"
        accept="application/pdf,.pdf,application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void openFile(file)
        }}
      />

      {!doc && (
        <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-6 px-4 pt-6 pb-24 sm:px-6 sm:pt-10 print:hidden">
          <section aria-labelledby="intro-heading" className="grid grid-cols-1 gap-4">
            <h2 id="intro-heading" className="sr-only">
              About
            </h2>
            <p className="max-w-prose text-pretty text-dim">
              For inspectors and quality leads preparing a first article inspection. Open the customer’s drawing, click beside each characteristic to number it, and the table of
              characteristics (in the order of AS9102 Form 3’s columns) builds as you go: the requirement, read from the drawing’s text where it has any, its limits, your results, and
              pass or fail. Then save the ballooned drawing as a PDF and the table as a spreadsheet file.
            </p>
            <p className="max-w-prose text-pretty text-dim">
              The drawing is opened here, in your browser, and neither it nor anything you type is sent anywhere: the page only downloads its own files from this site (its fonts and
              decoders included), and keeps them. Once you’ve opened a drawing here, the page works with the network turned off, which is one way to check.
            </p>
            {phase === 'missing' && work && (
              <p className="max-w-prose rounded-xl border border-rule p-4 text-sm text-pretty" role="status">
                Your {plural(work.balloons.length, 'balloon')} on {work.name} are kept, but this browser no longer has the drawing itself. Open the same file again to carry on.
              </p>
            )}
            {problem && (
              <p className="max-w-prose rounded-xl border border-red-600 px-4 py-3 text-sm text-pretty text-red-800 dark:border-red-400 dark:text-red-300" role="alert">
                {problem}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {fileButton(phase === 'missing' ? 'Open the drawing again' : 'Open a drawing (PDF)', primary, 'bd-open')}
              <button type="button" className={outline} onClick={() => void tryExample()} disabled={phase === 'opening'}>
                Try the example drawing
              </button>
              {phase === 'missing' && (
                <button type="button" className={quiet} onClick={() => ask({ kind: 'clear' })}>
                  Clear the kept balloons
                </button>
              )}
            </div>
            {phase === 'opening' && (
              <p className="text-sm text-dim" role="status">
                Opening…
              </p>
            )}
            <p className="text-sm text-dim">Or drop a PDF anywhere on this page. A work file saved from this page opens the same way.</p>
            <details className="max-w-prose text-sm text-dim">
              <summary className={summaryStyle}>What it does and doesn’t do, how requirements are read, and privacy</summary>
              <ul className="grid grid-cols-1 list-disc gap-1.5 pt-3 pl-5 text-pretty">
                <li>
                  The table follows the order of AS9102 Form 3’s columns: the characteristic number, its reference location (the sheet, and the zone when you set the sheet’s zones),
                  the designator, the requirement, the results, the tooling, and the nonconformance number, then the limits and pass or fail. Paste it into your own or your customer’s
                  form. Forms 1 and 2 (the part, its materials, and its processes) aren’t here.
                </li>
                <li>
                  It doesn’t read scans or text drawn as lines (there’s no OCR), and it doesn’t place balloons by itself. Where the drawing has no text there, type the requirement.
                </li>
                <li>Check every requirement and limit against the drawing: CAD fonts can turn symbols into letters, and a boxed basic dimension looks like any other number.</li>
                <li>Results are compared with the limits exactly, so a value exactly at a limit passes. Bonus tolerance from material condition modifiers isn’t added.</li>
                <li>
                  What you open and enter is kept in this browser (the drawing and your balloons), so a reload loses nothing, until you clear it. Anyone using this browser can see it.
                  Nothing is uploaded, and nothing on this page claims anything about your customer’s or anyone’s requirements.
                </li>
              </ul>
              <RulesList />
            </details>
          </section>
        </div>
      )}

      {doc && work && (
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row print:hidden">
          <section aria-labelledby="drawing-heading" className="flex min-h-0 flex-col lg:min-w-0 lg:flex-1">
            <h2 id="drawing-heading" className="sr-only">
              The drawing
            </h2>
            <Toolbar>
              <span className="min-w-0 truncate text-sm font-medium" title={work.name}>
                {work.name}
              </span>
              <span className="flex items-center gap-1">
                <button type="button" className={small} onClick={() => setSheet(sheet - 1)} disabled={sheet <= 1} aria-label="Previous sheet">
                  ‹
                </button>
                <label className="flex items-center gap-1 text-sm">
                  <span>Sheet</span>
                  <select className={`${control} h-9`} value={sheet} onChange={(e) => setSheet(Number(e.target.value))}>
                    {Array.from({ length: work.sheets }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1} of {work.sheets}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className={small} onClick={() => setSheet(sheet + 1)} disabled={sheet >= work.sheets} aria-label="Next sheet">
                  ›
                </button>
              </span>
              <span className="flex items-center gap-1">
                <button type="button" className={small} onClick={() => setZ(z / 1.25)} aria-label="Zoom out">
                  −
                </button>
                <button type="button" className={small} onClick={() => setZoom('fit')} aria-label={`Fit the sheet’s width (now ${Math.round(z * 100)}%)`}>
                  {zoom === 'fit' ? 'Fit' : `${Math.round(z * 100)}%`}
                </button>
                <button type="button" className={small} onClick={() => setZ(z * 1.25)} aria-label="Zoom in">
                  +
                </button>
              </span>
              <span className="flex items-center gap-1">
                <button type="button" className={small} onClick={undo} disabled={!past.length}>
                  Undo
                </button>
                <button type="button" className={small} onClick={redo} disabled={!future.length}>
                  Redo
                </button>
              </span>
            </Toolbar>
            {(framing || moving) && (
              <p className="border-b border-rule bg-blue-50 px-4 py-2 text-sm dark:bg-blue-950" role="status">
                {framing ? (framing.first ? 'Now click the opposite corner of the zone frame.' : 'Click one corner of the zone frame (the inside of the border where the zone numbers run).') : 'Click or tap where the balloon should go.'}{' '}
                <button type="button" className="underline underline-offset-4" onClick={() => (framing ? setFraming(null) : setMoving(false))}>
                  Cancel
                </button>
              </p>
            )}
            {/* On a phone the drawing area is as tall as the sheet at its fitted width (up to 58% of the screen), and
                the full 58% once zoomed in; on a wide screen it fills the column. */}
            <div
              ref={viewerBox}
              className="h-[min(58vh,var(--fit-h,58vh))] min-h-48 lg:h-auto lg:min-h-0 lg:flex-1"
              style={zoom === 'fit' && sheets.views.get(sheet) ? ({ '--fit-h': `${Math.ceil(sheets.views.get(sheet)!.height * fitZoom + 28)}px` } as CSSProperties) : undefined}
            >
              <Viewer
                ref={viewer}
                doc={doc}
                sheet={sheet}
                zoom={z}
                balloons={shown}
                selected={selected}
                size={work.size}
                zones={work.zones[sheet] ?? null}
                framing={Boolean(framing)}
                moving={moving}
                label={`Drawing, sheet ${sheet} of ${work.sheets}, ${plural(shown.length, 'balloon')}. Click beside a characteristic to place the next balloon. From the keyboard: the arrow keys move a crosshair (Shift for bigger steps), Enter places a balloon there, Shift and Enter moves the selected one there, Delete deletes it, plus and minus zoom, Page Up and Page Down change sheet.`}
                onPlace={(x, y) => place(x, y)}
                onSelect={setSelected}
                onMove={moveBalloon}
                onFrameCorner={frameCorner}
                onKey={viewerKey}
                onRendered={onRendered}
                onError={setProblem}
              />
            </div>
          </section>

          <aside className="grid min-h-0 grid-cols-1 content-start gap-6 border-rule px-4 pt-4 pb-24 lg:w-[27rem] lg:shrink-0 lg:overflow-y-auto lg:border-l sm:px-6">
            {!saved && <NotSaving>This browser isn’t saving your balloons, so they’ll be gone when the page closes. Save your work as a file (below) to keep it.</NotSaving>}
            {saved && !drawingKept && (
              <p className="rounded-xl border border-rule px-4 py-3 text-sm text-pretty" role="status">
                Your balloons are kept, but this browser wouldn’t keep the drawing itself (it may be too big). Next time, open the same drawing again, or save your work as a file.
              </p>
            )}
            {problem && (
              <p className="rounded-xl border border-red-600 px-4 py-3 text-sm text-pretty text-red-800 dark:border-red-400 dark:text-red-300" role="alert">
                {problem}{' '}
                <button type="button" className="underline underline-offset-4" onClick={() => setProblem('')}>
                  Dismiss
                </button>
              </p>
            )}
            {notice && (
              <p className="rounded-xl border border-rule px-4 py-3 text-sm text-pretty" role="status">
                {notice}
              </p>
            )}

            <section aria-labelledby="list-heading" className="grid grid-cols-1 gap-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="list-heading" className="text-lg font-semibold tracking-tight">
                  Characteristics
                </h2>
                <button
                  type="button"
                  className={quiet}
                  disabled={work.balloons.length < 2}
                  onClick={() => {
                    change((list) => inReadingOrder(list, where))
                    say('Renumbered in reading order: each sheet from the top, a band at a time, left to right. Undo puts the old numbers back.')
                  }}
                >
                  Renumber in reading order
                </button>
              </div>
              {work.balloons.length ? (
                <CharacteristicList
                  balloons={work.balloons}
                  selected={selected}
                  evaluations={evaluations}
                  comma={work.comma}
                  pieces={work.pieces}
                  onSelect={(id) => {
                    setSelected(id)
                    const b = work.balloons.find((x) => x.id === id)
                    if (b && b.sheet !== sheet) setSheet(b.sheet)
                  }}
                  onOpen={() => document.getElementById(current && read(current).kind === 'unread' && !current.requirement.trim() ? 'bd-requirement' : 'bd-result-0')?.focus()}
                  onDelete={remove}
                />
              ) : (
                <p className="text-sm text-pretty text-dim">No balloons yet. Click beside a dimension, tolerance, or note on the drawing to place the first.</p>
              )}
            </section>

            {current && (
              <Editor
                key={current.id}
                balloon={current}
                number={currentNumber}
                count={work.balloons.length}
                reading={read(current)}
                evaluation={evaluations.get(current.id)!}
                pieces={work.pieces}
                comma={work.comma}
                location={location(current)}
                onEdit={(patch) => edit(current.id, patch)}
                onRenumber={(to) => {
                  if (!Number.isInteger(to)) {
                    say(`A number from 1 to ${work.balloons.length}, in figures.`)
                    return
                  }
                  change((list) => moveToNumber(list, current.id, to))
                  say(`Now number ${Math.max(1, Math.min(work.balloons.length, to))}.`)
                }}
                onReread={() => {
                  const text = capture(current.sheet, current.x, current.y)
                  if (text) edit(current.id, { requirement: text })
                  say(text ? `Read “${text}” from the drawing.` : 'No text on the drawing there.')
                }}
                onMove={() => {
                  if (current.sheet !== sheet) setSheet(current.sheet)
                  setMoving(true)
                  viewer.current?.focus()
                }}
                onDelete={() => remove(current.id)}
                onNext={(piece, step) => {
                  const i = work.balloons.indexOf(current) + step
                  const next = work.balloons[i]
                  if (!next) {
                    say(step > 0 ? 'That was the last characteristic.' : 'That was the first characteristic.')
                    return
                  }
                  // The editor for the next one is drawn now, so the next keystroke lands in it.
                  flushSync(() => {
                    setSelected(next.id)
                    if (next.sheet !== sheet) setSheet(next.sheet)
                  })
                  document.getElementById(`bd-result-${piece}`)?.focus()
                  say(`${i + 1} of ${work.balloons.length}: ${next.requirement.trim() || 'no requirement'}.`)
                }}
              />
            )}

            {summary && (
              <ChecksPanel
                checks={summary}
                current={currentNumber}
                onPick={(n) => {
                  const b = work.balloons[n - 1]
                  if (!b) return
                  setSelected(b.id)
                  if (b.sheet !== sheet) setSheet(b.sheet)
                  say(`Characteristic ${n}: ${b.requirement.trim() || 'no requirement'}.`)
                }}
              />
            )}

            <SettingsPanel
              work={work}
              sheet={sheet}
              onChange={setSettings}
              onEverySheet={(all, replaced) => {
                // Other sheets' own grids are replaced only when that's confirmed: a sheet's zones aren't on the undo
                // history.
                if (replaced.length) ask({ kind: 'zones', zones: all, text: `Replace the zones set on ${replaced.length === 1 ? 'sheet' : 'sheets'} ${replaced.join(', ')} with these? Their balloons’ reference locations change with them.` })
                else setSettings({ zones: all })
              }}
              onFrame={() => {
                setFraming({ first: null })
                viewer.current?.focus()
              }}
            />

            <section aria-labelledby="export-heading" className="grid grid-cols-1 gap-3">
              <h2 id="export-heading" className="text-lg font-semibold tracking-tight">
                Export and save
              </h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={primary} onClick={() => void exportPdf()} disabled={phase === 'exporting' || !work.balloons.length}>
                  {phase === 'exporting' ? (rebuilding ? `Rebuilding sheet ${rebuilding.sheet} of ${rebuilding.of}…` : 'Writing the PDF…') : 'Ballooned PDF'}
                </button>
                <button type="button" className={outline} onClick={exportCsv} disabled={!work.balloons.length}>
                  Form 3 table (CSV)
                </button>
                <button type="button" className={outline} onClick={() => window.print()} disabled={!work.balloons.length}>
                  Print the table
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={outline} onClick={saveWorkFile}>
                  Save work as a file
                </button>
                {fileButton('Open another drawing or work file', outline)}
                <button type="button" className={quiet} onClick={() => ask({ kind: 'clear' })}>
                  Clear everything
                </button>
              </div>
              <p className="text-sm text-pretty text-dim">
                The work file holds the drawing and your balloons, to open here again on any computer. Your balloons and the drawing are also kept in this browser until you clear them.
              </p>
            </section>
          </aside>
        </div>
      )}

      {confirm && (
        // Focus starts on keeping what's here, and Escape keeps it too, so a repeated Enter can't clear or replace work.
        <div
          className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-paper px-4 py-4 shadow-lg sm:px-6 print:hidden"
          role="alertdialog"
          aria-labelledby="confirm-text"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              keep()
            }
          }}
        >
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
            <p id="confirm-text" className="min-w-0 flex-1 text-sm text-pretty">
              {confirm.kind === 'clear' ? 'Clear the drawing and every balloon from this browser? This can’t be undone (a saved work file still opens).' : confirm.text}
            </p>
            <button
              type="button"
              className={primary}
              onClick={() => {
                setConfirm(null)
                if (confirm.kind === 'replace') void openFile(confirm.file, true)
                else if (confirm.kind === 'example') void tryExample(true)
                else if (confirm.kind === 'zones') {
                  setSettings({ zones: confirm.zones })
                  setRefocus({ to: confirmFrom.current })
                } else void clearAll()
              }}
            >
              {confirm.kind === 'clear' ? 'Clear everything' : confirm.kind === 'zones' ? 'Replace them' : 'Open it'}
            </button>
            <button type="button" className={outline} onClick={keep} autoFocus>
              Keep what’s here
            </button>
          </div>
        </div>
      )}

      {work && doc && <Form3Print work={work} location={location} read={read} evaluations={evaluations} />}
    </div>
  )
}

function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule px-4 py-2 sm:px-6">{children}</div>
}

function RulesList() {
  return (
    <div className="pt-3">
      <p className="font-medium text-ink">How requirements are read, in this order</p>
      <ul className="grid grid-cols-1 list-disc gap-1 pt-2 pl-5 text-pretty">
        <li>A count first (4X, 4 PLCS) is kept as the count.</li>
        <li>In brackets, or REF: a reference dimension, not measured. Boxed ([25.4]), or BSC or BASIC: a basic dimension, not measured on its own.</li>
        <li>
          A GD&amp;T symbol or word (⌖ or POS, ⏥ or FLAT, ⌓ or PROFILE, ⟂, ∥, ○, ↗, and others) followed by its tolerance: the result is the measured deviation, from 0 to the tolerance.
          After the tolerance only modifiers and datum letters are expected; a second frame, a ±, or anything else is refused (balloon each segment of a composite frame).
        </li>
        <li>Surface finish (Ra 1.6): an upper limit. Threads, and fits without their limits (Ø12 H7): pass or fail.</li>
        <li>MAX or MIN: one limit. Nominal ± tolerance. Nominal with two deviations (+0.10/-0.00). Two limits (12.05/11.95, or 11.95 to 12.05), within a factor of two of each other.</li>
        <li>A lone value: the title block’s tolerance for its number of decimal places (or for angles), once you set it.</li>
        <li>A count (4X) needs a value for each feature before it passes; a gauged attribute takes one pass for all.</li>
        <li>
          Anything else, or anything ambiguous (11.95-12.05, a single deviation, values far apart, an inch fraction, two numbers side by side, a chamfer’s size and angle), isn’t
          guessed: type its limits, or pass or fail it.
        </li>
      </ul>
    </div>
  )
}

interface ListProps {
  balloons: Balloon[]
  selected: string | null
  evaluations: Map<string, Evaluation>
  comma: boolean
  pieces: number
  onSelect: (id: string) => void
  onOpen: () => void
  onDelete: (id: string) => void
}

/** The characteristics as one list: a single Tab stop, with the arrow keys, Home, End, Page Up, and Page Down. */
function CharacteristicList({ balloons, selected, evaluations, comma, pieces, onSelect, onOpen, onDelete }: ListProps) {
  const box = useRef<HTMLUListElement>(null)
  const index = balloons.findIndex((b) => b.id === selected)
  useEffect(() => {
    if (selected) document.getElementById(`bd-opt-${selected}`)?.scrollIntoView({ block: 'nearest' })
  }, [selected])
  const key = (e: KeyboardEvent<HTMLUListElement>) => {
    let next = -1
    if (e.key === 'ArrowDown') next = Math.min(balloons.length - 1, index + 1)
    else if (e.key === 'ArrowUp') next = Math.max(0, index < 0 ? 0 : index - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = balloons.length - 1
    else if (e.key === 'PageDown') next = Math.min(balloons.length - 1, Math.max(0, index) + 10)
    else if (e.key === 'PageUp') next = Math.max(0, index - 10)
    else if (e.key === 'Enter' && selected) {
      e.preventDefault()
      onOpen()
      return
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
      e.preventDefault()
      onDelete(selected)
      return
    } else return
    e.preventDefault()
    if (balloons[next]) onSelect(balloons[next].id)
  }
  return (
    <ul
      ref={box}
      id="bd-list"
      role="listbox"
      tabIndex={0}
      aria-label={`Characteristics, ${plural(balloons.length, 'balloon')}. Up and Down choose one, Enter goes to its results.`}
      aria-activedescendant={selected ? `bd-opt-${selected}` : undefined}
      onKeyDown={key}
      onFocus={() => {
        if (!selected && balloons[0]) onSelect(balloons[0].id)
      }}
      className="max-h-72 overflow-y-auto rounded-xl border border-rule lg:max-h-80"
    >
      {balloons.map((b, i) => (
        <Row key={b.id} b={b} n={i + 1} selected={b.id === selected} evaluation={evaluations.get(b.id)} comma={comma} pieces={pieces} onSelect={onSelect} />
      ))}
    </ul>
  )
}

const Row = memo(function Row({ b, n, selected, evaluation, comma, pieces, onSelect }: { b: Balloon; n: number; selected: boolean; evaluation: Evaluation | undefined; comma: boolean; pieces: number; onSelect: (id: string) => void }) {
  const status = evaluation?.status ?? 'open'
  const results = b.results
    .slice(0, pieces)
    .map((r) => resultText(r, comma))
    .filter((r) => r)
    .join(' | ')
  return (
    <li
      id={`bd-opt-${b.id}`}
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(b.id)}
      className={`grid cursor-pointer grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-2 border-b border-rule px-3 py-2 text-sm last:border-b-0 ${selected ? 'bg-ink/10' : 'hover:bg-ink/5'}`}
    >
      {/* Dimmed text on the chosen row's tint would be too faint, so it's drawn in full there. */}
      <span className={`font-mono text-xs ${selected ? '' : 'text-dim'}`}>{n}</span>
      <span className="min-w-0">
        <span className={`block truncate ${b.requirement.trim() ? '' : `italic ${selected ? '' : 'text-dim'}`}`}>{b.requirement.trim() || 'No requirement'}</span>
        {results && <span className={`block truncate font-mono text-xs ${selected ? '' : 'text-dim'}`}>{results}</span>}
      </span>
      <span className={`text-xs ${selected && STATUS_CLASS[status] === 'text-dim' ? '' : STATUS_CLASS[status]}`}>{STATUS_TEXT[status]}</span>
    </li>
  )
})

interface EditorProps {
  balloon: Balloon
  number: number
  count: number
  reading: Reading
  evaluation: Evaluation
  pieces: number
  comma: boolean
  location: string
  onEdit: (patch: Partial<Omit<Balloon, 'id'>>) => void
  onRenumber: (to: number) => void
  onReread: () => void
  onMove: () => void
  onDelete: () => void
  onNext: (piece: number, step: number) => void
}

function Editor({ balloon: b, number, count, reading, evaluation, pieces, comma, location, onEdit, onRenumber, onReread, onMove, onDelete, onNext }: EditorProps) {
  const [to, setTo] = useState(String(number))
  useEffect(() => setTo(String(number)), [number])
  const attribute = reading.kind === 'attribute' || reading.kind === 'unread'
  const f = (q: Reading['lower']) => (q ? limitText(q, reading, comma) : '')
  const result = (i: number, value: string) => {
    const results = Array.from({ length: Math.max(pieces, b.results.length) }, (_, k) => b.results[k] ?? '')
    results[i] = value
    onEdit({ results })
  }
  return (
    <section aria-labelledby="editor-heading" className="grid grid-cols-1 gap-4 rounded-xl border border-rule p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="editor-heading" className="text-base font-semibold">
          Characteristic {number} <span className="font-normal text-dim">of {count}</span>
        </h3>
        <span className="text-sm text-dim">{location}</span>
      </div>
      <label className={label}>
        <span className="font-medium">Requirement, as drawn</span>
        <span className="flex gap-2">
          <input id="bd-requirement" className={`${field} flex-1 font-mono`} value={b.requirement} maxLength={MAX_LENGTH.requirement} onChange={(e) => onEdit({ requirement: e.target.value })} spellCheck={false} autoComplete="off" />
          <button type="button" className={small} onClick={onReread} title="Read the text beside this balloon again">
            Read again
          </button>
        </span>
      </label>
      <p className={`text-sm text-pretty ${reading.kind === 'unread' && b.requirement.trim() ? 'text-amber-800 dark:text-amber-300' : 'text-dim'}`} role="status">
        {reading.how}
        {reading.note ? ` ${reading.note}` : ''}
        {reading.source === 'title block' ? ' If this dimension is boxed (basic) or in brackets (reference) on the drawing, it has no tolerance of its own: put [ ] or ( ) round it.' : ''}
        {reading.count > 1 ? ` For ${reading.count} features: enter each one’s value in the result.` : ''}
      </p>
      <details className="text-sm" open={Boolean(b.lower || b.upper)}>
        <summary className={summaryStyle}>Type the limits instead</summary>
        <div className="grid grid-cols-2 gap-3 pt-3">
          <label className={label}>
            <span>Lower limit</span>
            <input className={`${field} font-mono`} value={b.lower} maxLength={MAX_LENGTH.limit} onChange={(e) => onEdit({ lower: e.target.value })} inputMode="decimal" autoComplete="off" placeholder={reading.lower ? `read: ${f(reading.lower)}` : ''} />
          </label>
          <label className={label}>
            <span>Upper limit</span>
            <input className={`${field} font-mono`} value={b.upper} maxLength={MAX_LENGTH.limit} onChange={(e) => onEdit({ upper: e.target.value })} inputMode="decimal" autoComplete="off" placeholder={reading.upper ? `read: ${f(reading.upper)}` : ''} />
          </label>
        </div>
      </details>
      <fieldset className="grid grid-cols-1 gap-3">
        <legend className="mb-1.5 text-sm font-medium">
          {pieces > 1 ? 'Results, a piece at a time' : 'Result'}{' '}
          <span className={`font-normal ${STATUS_CLASS[evaluation.status]}`}>({STATUS_TEXT[evaluation.status]})</span>
        </legend>
        {Array.from({ length: pieces }, (_, i) => {
          const p = evaluation.pieces[i]
          return (
            <div key={i} className="grid grid-cols-1 gap-1.5">
              <label className="flex flex-wrap items-center gap-2 text-sm">
                {pieces > 1 && <span className="w-16 shrink-0 text-dim">Piece {i + 1}</span>}
                <input
                  id={`bd-result-${i}`}
                  className={`${field} min-w-40 flex-1 font-mono`}
                  value={b.results[i] ?? ''}
                  maxLength={MAX_LENGTH.result}
                  onChange={(e) => result(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      onNext(i, e.shiftKey ? -1 : 1)
                    }
                  }}
                  inputMode={attribute || reading.count > 1 ? 'text' : 'decimal'}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={pieces > 1 ? `Piece ${i + 1} result` : 'Result'}
                  aria-describedby={`bd-result-hint-${i}`}
                  placeholder={attribute ? 'Pass, Fail, or N/A' : reading.count > 1 ? 'Each value, spaced' : 'The measured value'}
                />
                {attribute && (
                  <span className="flex gap-1">
                    {ATTRIBUTE_RESULTS.map((v) => (
                      <button key={v} type="button" className={small} onClick={() => result(i, v)} aria-pressed={(b.results[i] ?? '').toLowerCase() === v.toLowerCase()}>
                        {v}
                      </button>
                    ))}
                  </span>
                )}
              </label>
              <span id={`bd-result-hint-${i}`} className={`text-xs ${p && (p.status === 'fail' || p.status === 'unreadable') ? 'text-red-700 dark:text-red-300' : 'text-dim'}`}>
                {p?.status === 'unreadable'
                  ? `“${p.bad}” isn’t a value${!comma && /\d,\d/.test(p.bad) ? ' (a decimal comma? Turn on decimal commas in Settings, or put a space after each comma between values)' : ''}.`
                  : p?.status === 'fail'
                    ? 'Outside the limits.'
                    : p?.status === 'pass'
                      ? 'Within the limits.'
                      : p?.status === 'open' && p.values.length
                        ? `${p.values.length} of ${reading.count} values, within the limits so far: one for each feature.`
                        : 'Enter goes to the next characteristic, Shift and Enter to the one before.'}
              </span>
            </div>
          )
        })}
      </fieldset>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={label}>
          <span>Designator (key, critical)</span>
          <input className={field} value={b.designator} maxLength={MAX_LENGTH.designator} onChange={(e) => onEdit({ designator: e.target.value })} list="bd-designators" autoComplete="off" />
          <datalist id="bd-designators">
            <option value="Key" />
            <option value="Critical" />
            <option value="Major" />
            <option value="Minor" />
          </datalist>
        </label>
        <label className={label}>
          <span>Tooling</span>
          <input className={field} value={b.tooling} maxLength={MAX_LENGTH.tooling} onChange={(e) => onEdit({ tooling: e.target.value })} autoComplete="off" />
        </label>
        <label className={label}>
          <span>Nonconformance number</span>
          <input className={field} value={b.nc} maxLength={MAX_LENGTH.nc} onChange={(e) => onEdit({ nc: e.target.value })} autoComplete="off" />
        </label>
        <label className={label}>
          <span>Comments</span>
          <input className={field} value={b.remarks} maxLength={MAX_LENGTH.remarks} onChange={(e) => onEdit({ remarks: e.target.value })} autoComplete="off" />
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className={label}>
          <span>Number</span>
          <span className="flex gap-2">
            <input
              className={`${field} w-24`}
              value={to}
              inputMode="numeric"
              onChange={(e) => setTo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                if (/^\d+$/.test(to.trim()) && Number(to) >= 1) onRenumber(Number(to))
                else onRenumber(NaN)
              }}
              aria-describedby="bd-renumber-hint"
            />
            <button type="button" className={small} onClick={() => onRenumber(Number(to))} disabled={!/^\d+$/.test(to.trim()) || Number(to) === number}>
              Renumber
            </button>
          </span>
        </label>
        <button type="button" className={small} onClick={onMove}>
          Move on the drawing
        </button>
        <button type="button" className={small} onClick={onDelete}>
          Delete
        </button>
      </div>
      <p id="bd-renumber-hint" className="text-xs text-pretty text-dim">
        Renumbering moves this balloon to that number, and the ones between it and there move up or down one.
      </p>
    </section>
  )
}

function ChecksPanel({ checks: c, current, onPick }: { checks: ReturnType<typeof checks>; current: number; onPick: (n: number) => void }) {
  // Each kind of gap is one line and one button (the next one after the characteristic chosen now), however many
  // characteristics it lists, so a long list of gaps doesn't add a Tab stop a number.
  const numbers = (list: number[]) => `${list.slice(0, 24).join(', ')}${list.length > 24 ? `, and ${list.length - 24} more` : ''}`
  const rows: [string, number[]][] = [
    ['No requirement', c.noRequirement],
    ['Limits not read', c.noLimits],
    ['Results to enter', c.open],
    ['Results that aren’t values', c.unreadable],
    ['Failed', c.failed],
    ['Failed, with no nonconformance number', c.failedWithoutNc],
    ['Off their sheet (move them back)', c.outside],
  ]
  const sheets = Object.entries(c.bySheet)
  const clear = rows.every(([, list]) => !list.length)
  return (
    <section aria-labelledby="checks-heading" className="grid grid-cols-1 gap-3">
      <h2 id="checks-heading" className="text-lg font-semibold tracking-tight">
        Checks
      </h2>
      <p className="text-sm text-pretty">
        {plural(c.balloons, 'balloon')}, numbered 1 to {c.balloons || 0} with no gaps{sheets.length > 1 ? ` (${sheets.map(([s, n]) => `sheet ${s}: ${n}`).join(', ')})` : ''}.
      </p>
      {clear && c.balloons > 0 ? (
        <p className="text-sm text-pretty" role="status">
          Every characteristic has a requirement, limits or a pass or fail, and its results; none failed.
        </p>
      ) : (
        <dl className="grid grid-cols-1 gap-3 text-sm">
          {rows
            .filter(([, list]) => list.length)
            .map(([name, list]) => (
              <div key={name} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1">
                <dt className={name.startsWith('Failed') ? 'font-medium text-red-700 dark:text-red-300' : 'font-medium'}>
                  {name}: {list.length}
                </dt>
                <dd className="row-span-2">
                  <button type="button" className={small} onClick={() => onPick(list.find((n) => n > current) ?? list[0])} aria-label={`Go to the next characteristic with: ${name.toLowerCase()}`}>
                    Next
                  </button>
                </dd>
                <dd className="font-mono text-xs text-pretty text-dim">{numbers(list)}</dd>
              </div>
            ))}
        </dl>
      )}
    </section>
  )
}

function SettingsPanel({
  work,
  sheet,
  onChange,
  onEverySheet,
  onFrame,
}: {
  work: Work
  sheet: number
  onChange: (patch: Partial<Omit<Work, 'balloons'>>) => void
  onEverySheet: (zones: Record<number, Zones>, replaced: number[]) => void
  onFrame: () => void
}) {
  const zones = work.zones[sheet] ?? null
  // A sheet's grid as it was when "This sheet has zones" was unticked, so ticking it again brings it back.
  const removed = useRef<Record<number, Zones>>({})
  // Open to begin with when the sheet has zones; it stays as the user leaves it after that.
  const [zonesOpen, setZonesOpen] = useState(Boolean(zones))
  const setZones = (z: Zones | null) => {
    const next = { ...work.zones }
    if (z) next[sheet] = z
    else {
      if (next[sheet]) removed.current[sheet] = next[sheet]
      delete next[sheet]
    }
    onChange({ zones: next })
  }
  const pct = (v: number) => String(Math.round(v * 1000) / 10)
  const fromPct = (text: string, fallback: number) => {
    const v = Number(text)
    // An emptied field keeps the edge where it was (Number('') would be 0).
    return text.trim() && Number.isFinite(v) ? Math.max(0, Math.min(1, v / 100)) : fallback
  }
  return (
    <section aria-labelledby="settings-heading" className="grid grid-cols-1 gap-3">
      <h2 id="settings-heading" className="text-lg font-semibold tracking-tight">
        Settings
      </h2>
      <details className="text-sm">
        <summary className={summaryStyle}>Title block tolerances (for lone values)</summary>
        <div className="grid grid-cols-1 gap-3 pt-3">
          <p className="text-pretty text-dim">The drawing’s general tolerances, as its title block gives them, for values with none of their own. Leave a line empty if the drawing has none.</p>
          {PLACE_NAMES.map((name, p) => (
            <label key={p} className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-2">
              <span>{name} ±</span>
              <input
                className={`${field} font-mono`}
                value={work.titleBlock.places[p] ?? ''}
                maxLength={MAX_LENGTH.titleBlock}
                inputMode="decimal"
                autoComplete="off"
                onChange={(e) => {
                  const places = [...work.titleBlock.places]
                  places[p] = e.target.value
                  onChange({ titleBlock: { ...work.titleBlock, places } })
                }}
              />
            </label>
          ))}
          <label className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-2">
            <span>Angles ± (degrees, or 0°30')</span>
            <input className={`${field} font-mono`} value={work.titleBlock.angle} maxLength={MAX_LENGTH.titleBlock} autoComplete="off" onChange={(e) => onChange({ titleBlock: { ...work.titleBlock, angle: e.target.value } })} />
          </label>
        </div>
      </details>
      <details className="text-sm" open={zonesOpen} onToggle={(e) => setZonesOpen(e.currentTarget.open)}>
        <summary className={summaryStyle}>Zones on sheet {sheet}</summary>
        <div className="grid grid-cols-1 gap-3 pt-3">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0"
              checked={Boolean(zones)}
              onChange={(e) => setZones(e.target.checked ? { ...(removed.current[sheet] ?? Object.values(work.zones)[0] ?? DEFAULT_ZONES) } : null)}
            />
            <span>This sheet has zones (the reference location then gives each balloon’s zone, like C4)</span>
          </label>
          {zones && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <CountField name="Columns (numbers)" value={zones.columns} onChange={(columns) => setZones({ ...zones, columns })} />
                <CountField name="Rows (letters)" value={zones.rows} onChange={(rows) => setZones({ ...zones, rows })} />
              </div>
              <label className={label}>
                <span>Where zone 1 and row A meet</span>
                <select className={field} value={zones.start} onChange={(e) => setZones({ ...zones, start: e.target.value as Corner })}>
                  {CORNERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 size-4 shrink-0" checked={zones.skipIO} onChange={(e) => setZones({ ...zones, skipIO: e.target.checked })} />
                <span>The letters skip I and O</span>
              </label>
              <p className="text-pretty text-dim">The frame: the inside of the border, where the zone numbers and letters run. Set it on the drawing, or as percentages of the sheet as shown.</p>
              <div>
                <button type="button" className={small} onClick={onFrame}>
                  Set the frame on the drawing
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(['left', 'top', 'right', 'bottom'] as const).map((side) => (
                  <label key={side} className={label}>
                    <span className="capitalize">{side} %</span>
                    <input
                      className={`${field} px-2 font-mono`}
                      inputMode="decimal"
                      defaultValue={pct(zones[side])}
                      key={`${side}-${zones[side]}`}
                      onBlur={(e) => {
                        const next = { ...zones, [side]: fromPct(e.target.value, zones[side]) }
                        if (zonesValid(next)) setZones(next)
                        else e.target.value = pct(zones[side])
                      }}
                    />
                  </label>
                ))}
              </div>
              {work.sheets > 1 && (
                <div>
                  <button
                    type="button"
                    className={small}
                    onClick={() => {
                      const all: Record<number, Zones> = {}
                      for (let s = 1; s <= work.sheets; s++) all[s] = { ...zones }
                      const replaced = Object.entries(work.zones)
                        .filter(([s, z]) => Number(s) !== sheet && JSON.stringify(z) !== JSON.stringify(zones))
                        .map(([s]) => Number(s))
                      onEverySheet(all, replaced)
                    }}
                  >
                    Use these zones on every sheet
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </details>
      <details className="text-sm">
        <summary className={summaryStyle}>Pieces, decimal commas, balloon size, and the table’s header</summary>
        <div className="grid grid-cols-1 gap-3 pt-3">
          <label className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-2">
            <span>Pieces measured</span>
            <select className={field} value={work.pieces} onChange={(e) => onChange({ pieces: Number(e.target.value) })}>
              {Array.from({ length: MAX_PIECES }, (_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 size-4 shrink-0" checked={work.comma} onChange={(e) => onChange({ comma: e.target.checked })} />
            <span>Decimal commas (12,05): a comma is then a decimal mark, and values in a result are separated by spaces or semicolons</span>
          </label>
          <label className="grid grid-cols-[minmax(0,1fr)_7rem] items-center gap-2">
            <span>Balloon size</span>
            <select className={field} value={work.size} onChange={(e) => onChange({ size: e.target.value as BalloonSize })}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </label>
          {(
            [
              ['partNumber', 'Part number'],
              ['partName', 'Part name'],
              ['serial', 'Serial number'],
              ['fairId', 'FAIR identifier'],
            ] as const
          ).map(([k, name]) => (
            <label key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] items-center gap-2">
              <span>{name}</span>
              <input className={field} value={work.header[k]} maxLength={MAX_LENGTH.header} autoComplete="off" onChange={(e) => onChange({ header: { ...work.header, [k]: e.target.value } })} />
            </label>
          ))}
        </div>
      </details>
    </section>
  )
}

/**
 * A zone count, kept as typed (so it can be cleared and retyped) and used whenever it's a whole number from 1 to the
 * most there can be; anything else goes back to the count in use when the field is left.
 */
function CountField({ name, value, onChange }: { name: string; value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])
  const valid = (t: string) => /^\d+$/.test(t.trim()) && Number(t) >= 1 && Number(t) <= MAX_ZONES
  return (
    <label className={label}>
      <span>{name}</span>
      <input
        className={field}
        type="number"
        min={1}
        max={MAX_ZONES}
        value={text}
        aria-invalid={!valid(text)}
        onChange={(e) => {
          setText(e.target.value)
          if (valid(e.target.value) && Number(e.target.value) !== value) onChange(Number(e.target.value))
        }}
        onBlur={() => {
          if (!valid(text)) setText(String(value))
        }}
      />
    </label>
  )
}

function Form3Print({ work, location, read, evaluations }: { work: Work; location: (b: Balloon) => string; read: (b: Balloon) => Reading; evaluations: Map<string, Evaluation> }) {
  const h = work.header
  return (
    <div className="hidden text-[9pt] print:block">
      <h2 className="text-base font-semibold">Characteristic accountability (Form 3 columns)</h2>
      <p className="pt-1">
        {[h.partNumber && `Part number ${h.partNumber}`, h.partName && `Part name ${h.partName}`, h.serial && `Serial number ${h.serial}`, h.fairId && `FAIR ${h.fairId}`, `Drawing ${work.name}`]
          .filter(Boolean)
          .join(' · ')}
      </p>
      <table className="mt-2 w-full border-collapse">
        <thead>
          <tr className="border-b border-black text-left align-bottom">
            {['Char. No.', 'Reference location', 'Designator', 'Requirement', 'Results', 'Tooling', 'NC number', 'Comments', 'Limits', 'Pass / fail'].map((t) => (
              <th key={t} className="px-1 py-1 font-semibold">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {work.balloons.map((b, i) => {
            const r = read(b)
            const e = evaluations.get(b.id)
            const each = Array.from({ length: work.pieces }, (_, p) => resultText(b.results[p] ?? '', work.comma))
            const results = work.pieces > 1 ? each.map((t, p) => (t ? `${p + 1}: ${t}` : '')).filter(Boolean).join(' | ') : each[0]
            const f = (q: Reading['lower']) => (q ? limitText(q, r, work.comma) : '')
            return (
              <tr key={b.id} className="print-row border-b border-black/30 align-top">
                <td className="px-1 py-0.5 font-mono">{i + 1}</td>
                <td className="px-1 py-0.5">{location(b)}</td>
                <td className="px-1 py-0.5">{b.designator}</td>
                <td className="px-1 py-0.5 font-mono">{b.requirement}</td>
                <td className="px-1 py-0.5 font-mono">{results}</td>
                <td className="px-1 py-0.5">{b.tooling}</td>
                <td className="px-1 py-0.5">{b.nc}</td>
                <td className="px-1 py-0.5">{[b.remarks, r.note].filter(Boolean).join(' ')}</td>
                <td className="px-1 py-0.5 font-mono">{r.kind === 'measured' ? `${f(r.lower) || '…'} to ${f(r.upper) || '…'}` : ''}</td>
                <td className="px-1 py-0.5">{e ? STATUS_TEXT[e.status] : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
