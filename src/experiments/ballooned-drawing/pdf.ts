// Opening, drawing, and reading a PDF with pdf.js, which is loaded only when this page needs it.
//
// The worker's code comes bundled with the page as a module of its own and is started from a blob URL, so the site's
// offline copy keeps it with the page's other files. The decoders for scanned images (CCITT fax, JBIG2, and JPEG
// 2000, as WebAssembly), the character maps for some Asian fonts, and the standard fonts are built into the site with
// the page and fetched only when a drawing needs one, by this page rather than the worker, so the offline copy serves
// them too. (A CMYK colour profile isn't: pdf.js loads it by a fixed name, and its plain CMYK conversion does for
// drawings.) pdf.js 6 runs no code from a PDF (its font loader no longer evaluates any), and its messages
// are limited to errors.
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist'
import type { TextBox } from './model.ts'

type PdfJs = typeof import('pdfjs-dist')

/** The data files pdf.js asks for by name, each built into the site under a hashed name. */
const DATA: Record<string, Record<string, string>> = {
  cMapUrl: names(import.meta.glob('/node_modules/pdfjs-dist/cmaps/*.bcmap', { query: '?url&no-inline', import: 'default', eager: true })),
  standardFontDataUrl: names(import.meta.glob(['/node_modules/pdfjs-dist/standard_fonts/*.pfb', '/node_modules/pdfjs-dist/standard_fonts/*.ttf'], { query: '?url&no-inline', import: 'default', eager: true })),
  wasmUrl: names(import.meta.glob('/node_modules/pdfjs-dist/wasm/{jbig2,openjpeg,qcms_bg}.wasm', { query: '?url&no-inline', import: 'default', eager: true })),
}

function names(found: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [path, url] of Object.entries(found)) out[path.slice(path.lastIndexOf('/') + 1)] = String(url)
  return out
}

let missing: ((kind: string, filename: string) => void) | null = null

/**
 * Tells the page when a data file a drawing needs couldn't be fetched (no connection before the offline copy had it),
 * since pdf.js then leaves out what needed it (text in that font) without saying so.
 */
export function onMissingData(listener: ((kind: string, filename: string) => void) | null): void {
  missing = listener
}

/** Fetches a data file pdf.js asks for (by kind and file name) from its built address. */
class DataFiles {
  async fetch({ kind, filename }: { kind: string; filename: string }): Promise<Uint8Array> {
    try {
      const url = DATA[kind]?.[filename]
      if (!url) throw new Error(`pdf.js asked for ${kind} ${filename}, which isn’t built in.`)
      const response = await fetch(url)
      if (!response.ok) throw new Error(`${filename} couldn’t be loaded (${response.status}).`)
      return new Uint8Array(await response.arrayBuffer())
    } catch (e) {
      missing?.(kind, filename)
      throw e
    }
  }
}

let loading: Promise<PdfJs> | null = null

export function pdfjs(): Promise<PdfJs> {
  if (!loading) {
    loading = (async () => {
      const [lib, worker] = await Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?raw')])
      const url = URL.createObjectURL(new Blob([worker.default], { type: 'text/javascript' }))
      lib.GlobalWorkerOptions.workerPort = new Worker(url, { type: 'module' })
      return lib
    })()
    loading.catch(() => {
      loading = null
    })
  }
  return loading
}

/**
 * Fetches, in the background, the decoders for scanned images, the standard fonts, and then the character maps for
 * Chinese, Japanese, and Korean fonts (168 small files, 1.6 MB in all), so the site's offline copy has them before a
 * drawing that needs one is opened without a connection.
 */
export function warmUp(): void {
  // Without a connection there's nothing to fetch: it waits for one.
  if (!navigator.onLine) {
    window.addEventListener('online', warmUp, { once: true })
    return
  }
  inTurn([DATA.wasmUrl['jbig2.wasm'], DATA.wasmUrl['openjpeg.wasm'], ...Object.values(DATA.standardFontDataUrl), ...Object.values(DATA.cMapUrl)].filter(Boolean), true)
}

/**
 * Fetches files one at a time, so a drawing being opened isn't kept waiting. Any that fail (a dropped connection, or a
 * background tab whose loads the browser cancels) are tried once more when the page is next shown and online.
 */
function inTurn(urls: string[], retry: boolean): void {
  const failed: string[] = []
  let i = 0
  const next = (): void => {
    const url = urls[i++]
    if (url) {
      fetch(url).then(
        (r) => (r.ok ? undefined : failed.push(url)),
        () => failed.push(url),
      ).then(next)
      return
    }
    if (!failed.length || !retry) return
    const again = () => {
      if (document.visibilityState !== 'visible' || !navigator.onLine) return false
      document.removeEventListener('visibilitychange', again)
      window.removeEventListener('online', again)
      setTimeout(() => inTurn(failed, false), 1000)
      return true
    }
    if (!again()) {
      document.addEventListener('visibilitychange', again)
      window.addEventListener('online', again)
    }
  }
  next()
}

/** Opens a PDF from its bytes (a copy is handed to the worker, so the caller's bytes stay usable). */
export async function openPdf(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const lib = await pdfjs()
  return lib.getDocument({
    data: bytes.slice(),
    enableXfa: false,
    verbosity: lib.VerbosityLevel.ERRORS,
    // The page fetches the data files itself (see DataFiles); the addresses here only tell pdf.js that they exist.
    // Fonts a drawing doesn't embed are drawn with pdf.js's own standard fonts rather than the computer's, so a
    // drawing looks the same everywhere (and pdf.js asks for nothing by address).
    useSystemFonts: false,
    useWorkerFetch: false,
    BinaryDataFactory: DataFiles,
    cMapUrl: '/built-in/',
    cMapPacked: true,
    standardFontDataUrl: '/built-in/',
    wasmUrl: '/built-in/',
  }).promise
}

/**
 * The most pixels one sheet is drawn with. Phones' browsers refuse canvases over about 16.7 million pixels (and draw
 * nothing), so a big sheet at a high zoom is drawn with fewer pixels and stretched instead.
 */
export const MAX_PIXELS = 16_000_000
export const MAX_SIDE = 8192

/** The scale a sheet is drawn at for a zoom: the zoom times the screen's pixel ratio, within the limits above. */
export function drawScale(width: number, height: number, zoom: number, ratio: number): number {
  const wanted = zoom * ratio
  const byArea = Math.sqrt(MAX_PIXELS / (width * height))
  const bySide = MAX_SIDE / Math.max(width, height)
  return Math.max(0.05, Math.min(wanted, byArea, bySide))
}

/**
 * Draws a page onto a canvas at a scale. Returns the render task, so a newer draw can cancel it; its promise rejects
 * with a RenderingCancelledException when cancelled.
 */
export function drawPage(page: PDFPageProxy, canvas: HTMLCanvasElement, scale: number): RenderTask {
  const viewport = page.getViewport({ scale })
  canvas.width = Math.max(1, Math.floor(viewport.width))
  canvas.height = Math.max(1, Math.floor(viewport.height))
  const context = canvas.getContext('2d', { alpha: false })!
  context.fillStyle = '#fff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  return page.render({ canvas, canvasContext: context, viewport })
}

/** The page's text as runs on the sheet as shown (scale 1, y down), for reading the callout nearest a click. */
export async function textBoxes(page: PDFPageProxy): Promise<TextBox[]> {
  const lib = await pdfjs()
  const viewport = page.getViewport({ scale: 1 })
  const content = await page.getTextContent()
  const out: TextBox[] = []
  for (const item of content.items) {
    if (!('str' in item) || !item.str.trim()) continue
    const m = lib.Util.transform(viewport.transform, item.transform)
    const along = Math.hypot(m[0], m[1])
    const h = Math.hypot(m[2], m[3])
    const own = Math.hypot(item.transform[0], item.transform[1])
    if (!along || !h || !own) continue
    out.push({ str: item.str, x: m[4], y: m[5], ux: m[0] / along, uy: m[1] / along, w: item.width * (along / own), h })
  }
  return out
}

/**
 * A page drawn as a JPEG for a copy rebuilt from images: about 200 dots an inch, within the pixel limits. A JPEG goes
 * into the PDF as it is, where a PNG would be decoded and compressed again on the page's own thread (seconds a sheet).
 */
export async function pageImage(page: PDFPageProxy): Promise<{ jpeg: Uint8Array; width: number; height: number }> {
  const base = page.getViewport({ scale: 1 })
  const scale = drawScale(base.width, base.height, 200 / 72, 1)
  const canvas = document.createElement('canvas')
  await drawPage(page, canvas, scale).promise
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
  canvas.width = 0
  canvas.height = 0
  if (!blob) throw new Error('The browser could not make an image of the page.')
  return { jpeg: new Uint8Array(await blob.arrayBuffer()), width: base.width, height: base.height }
}
