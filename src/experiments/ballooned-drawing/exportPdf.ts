// The ballooned PDF, written with pdf-lib, which is loaded only when it's asked for.
//
// Balloons go onto the original pages as vector circles with their numbers, so the drawing itself is untouched and
// stays sharp (pdf-lib wraps a page's own content in a saved graphics state before adding to it, so a transform left
// over in the drawing can't move them). A file pdf-lib can't change (a protected file, or one it can't read) gets a
// copy rebuilt from images of its pages instead, and says so.
import type { BalloonSize } from './model.ts'

export interface Placed {
  sheet: number
  /** The balloon's centre in the page's user space. */
  x: number
  y: number
  number: number
}

/** Balloon radius as a share of the sheet's shorter side. */
const RADIUS: Record<BalloonSize, number> = { small: 0.0065, medium: 0.009, large: 0.0125 }

export function radiusFor(width: number, height: number, size: BalloonSize): number {
  return RADIUS[size] * Math.min(width, height)
}

/** The number's type size: smaller for longer numbers, so 1000 still fits inside its circle. */
export function numberSize(radius: number, n: number): number {
  const digits = String(n).length
  return radius * (digits <= 2 ? 1.15 : digits === 3 ? 0.9 : 0.72)
}

export interface Rebuilt {
  bytes: Uint8Array
  /** Rebuilt from page images, and why. */
  rebuilt: string | null
}

type Lib = typeof import('pdf-lib')

/** Fetches the PDF writer in the background, so the site's offline copy has it before the first export. */
export function warmUpWriter(): void {
  void import('pdf-lib').catch(() => {})
}

async function draw(lib: Lib, page: import('pdf-lib').PDFPage, font: import('pdf-lib').PDFFont, items: Placed[], size: BalloonSize, rotation: number, width: number, height: number, toPage: (p: Placed) => { x: number; y: number }) {
  const r = radiusFor(width, height, size)
  const red = lib.rgb(0.78, 0.07, 0.07)
  const theta = (rotation * Math.PI) / 180
  const dir = { x: Math.cos(theta), y: Math.sin(theta) }
  const up = { x: -Math.sin(theta), y: Math.cos(theta) }
  for (const item of items) {
    const c = toPage(item)
    page.drawCircle({ x: c.x, y: c.y, size: r, color: lib.rgb(1, 1, 1), borderColor: red, borderWidth: Math.max(0.5, r * 0.12) })
    const text = String(item.number)
    const s = numberSize(r, item.number)
    const w = font.widthOfTextAtSize(text, s)
    const capHeight = s * 0.7
    // Upright as the sheet is shown: turned with the page's own rotation, and centred on the circle.
    const x = c.x - (w / 2) * dir.x - (capHeight / 2) * up.x
    const y = c.y - (w / 2) * dir.y - (capHeight / 2) * up.y
    page.drawText(text, { x, y, size: s, font, color: red, rotate: lib.degrees(rotation) })
  }
}

/**
 * The drawing with its balloons. `image` draws a sheet as a JPEG with its size as shown (in points), and `shown` gives
 * a balloon's place on its sheet as shown (scale 1, y down), both for a rebuilt copy; `progress` hears of each sheet
 * rebuilt, between which the page is given a moment to answer.
 */
export async function balloonedPdf(
  original: Uint8Array,
  sheets: number,
  items: Placed[],
  size: BalloonSize,
  image: (sheet: number) => Promise<{ jpeg: Uint8Array; width: number; height: number }>,
  shown: (p: Placed) => { x: number; y: number },
  progress: (sheet: number) => void = () => {},
): Promise<Rebuilt> {
  const lib = await import('pdf-lib')
  const bySheet = new Map<number, Placed[]>()
  for (const item of items) bySheet.set(item.sheet, [...(bySheet.get(item.sheet) ?? []), item])

  let reason = ''
  try {
    const doc = await lib.PDFDocument.load(original, { updateMetadata: false })
    if (doc.getPageCount() !== sheets) throw new Error(`pdf-lib found ${doc.getPageCount()} pages where pdf.js found ${sheets}.`)
    const font = await doc.embedFont(lib.StandardFonts.HelveticaBold)
    for (const [sheet, list] of bySheet) {
      const page = doc.getPage(sheet - 1)
      const box = page.getCropBox()
      // As PDF readers (pdf.js among them) take it: a rotation that isn't a multiple of 90 counts as none.
      const angle = page.getRotation().angle
      const rotation = angle % 90 === 0 ? ((angle % 360) + 360) % 360 : 0
      await draw(lib, page, font, list, size, rotation, box.width, box.height, (p) => ({ x: p.x, y: p.y }))
    }
    return { bytes: await doc.save(), rebuilt: null }
  } catch (e) {
    reason = e instanceof Error && /encrypt/i.test(e.message) ? 'the file is protected, so its pages can’t be changed' : 'the file couldn’t be changed as it is'
  }

  const doc = await lib.PDFDocument.create()
  const font = await doc.embedFont(lib.StandardFonts.HelveticaBold)
  for (let sheet = 1; sheet <= sheets; sheet++) {
    progress(sheet)
    await new Promise((resolve) => setTimeout(resolve, 0))
    const { jpeg, width, height } = await image(sheet)
    const page = doc.addPage([width, height])
    const embedded = await doc.embedJpg(jpeg)
    page.drawImage(embedded, { x: 0, y: 0, width, height })
    await draw(lib, page, font, bySheet.get(sheet) ?? [], size, 0, width, height, (p) => {
      const s = shown(p)
      return { x: s.x, y: height - s.y }
    })
  }
  return { bytes: await doc.save(), rebuilt: reason }
}
