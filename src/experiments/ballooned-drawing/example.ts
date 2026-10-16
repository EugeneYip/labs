// The example: a two-sheet A3 drawing of a made-up spacer plate, written here as a PDF (Helvetica, which every PDF
// reader has), so trying the page needs no file. It has what real drawings have: a zone border and a title block with
// general tolerances; a callout split into two runs of text; stacked deviations; stacked limits; vertical text; a
// feature control frame whose symbol is drawn as lines, as CAD often draws it; notes; and a second sheet stored on its
// side and turned upright by the page's /Rotate, as landscape sheets often are.
import { blankBalloon, newWork, type Work, type Zones } from './model.ts'

const W = 1191
const H = 842

function esc(text: string): string {
  return text.replace(/[\\()]/g, (c) => `\\${c}`)
}

class Content {
  out: string[] = []
  line(x1: number, y1: number, x2: number, y2: number, width = 0.6) {
    this.out.push(`${width} w ${x1} ${y1} m ${x2} ${y2} l S`)
  }
  rect(x: number, y: number, w: number, h: number, width = 0.6) {
    this.out.push(`${width} w ${x} ${y} ${w} ${h} re S`)
  }
  circle(cx: number, cy: number, r: number, width = 0.8) {
    const k = 0.5523 * r
    this.out.push(
      `${width} w ${cx + r} ${cy} m ${cx + r} ${cy + k} ${cx + k} ${cy + r} ${cx} ${cy + r} c ${cx - k} ${cy + r} ${cx - r} ${cy + k} ${cx - r} ${cy} c ` +
        `${cx - r} ${cy - k} ${cx - k} ${cy - r} ${cx} ${cy - r} c ${cx + k} ${cy - r} ${cx + r} ${cy - k} ${cx + r} ${cy} c S`,
    )
  }
  text(x: number, y: number, size: number, text: string, bold = false, vertical = false) {
    const m = vertical ? `0 1 -1 0 ${x} ${y}` : `1 0 0 1 ${x} ${y}`
    this.out.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${m} Tm (${esc(text)}) Tj ET`)
  }
  arrow(x: number, y: number, dx: number, dy: number) {
    const len = Math.hypot(dx, dy)
    const ux = dx / len
    const uy = dy / len
    const a = 7
    const b = 2.2
    this.out.push(`${x} ${y} m ${x - ux * a - uy * b} ${y - uy * a + ux * b} l ${x - ux * a + uy * b} ${y - uy * a - ux * b} l f`)
  }
  dashed(on: boolean) {
    this.out.push(on ? '[12 3 2 3] 0 d' : '[] 0 d')
  }
}

/** The border with its zones (8 across, numbered from the left; 6 down, lettered from the top) and the title block. */
function frame(c: Content, sheet: number) {
  c.rect(20, 20, W - 40, H - 40, 1.5)
  c.rect(40, 40, W - 80, H - 80, 1)
  const cw = (W - 80) / 8
  const rh = (H - 80) / 6
  for (let i = 0; i < 8; i++) {
    if (i) {
      c.line(40 + i * cw, H - 40, 40 + i * cw, H - 20, 0.5)
      c.line(40 + i * cw, 20, 40 + i * cw, 40, 0.5)
    }
    c.text(40 + (i + 0.5) * cw - 3, H - 34, 10, String(i + 1))
    c.text(40 + (i + 0.5) * cw - 3, 26, 10, String(i + 1))
  }
  for (let i = 0; i < 6; i++) {
    if (i) {
      c.line(20, 40 + i * rh, 40, 40 + i * rh, 0.5)
      c.line(W - 40, 40 + i * rh, W - 20, 40 + i * rh, 0.5)
    }
    const letter = 'ABCDEF'[i]
    c.text(27, H - 40 - (i + 0.5) * rh - 3, 10, letter)
    c.text(W - 33, H - 40 - (i + 0.5) * rh - 3, 10, letter)
  }
  c.rect(771, 40, 380, 160, 1)
  c.line(771, 80, 1151, 80)
  c.line(771, 120, 1151, 120)
  c.line(771, 160, 1151, 160)
  c.line(961, 40, 961, 200)
  c.text(781, 176, 12, 'SPACER PLATE', true)
  c.text(971, 177, 8, 'LABS EXAMPLE, NOT A REAL PART')
  c.text(781, 136, 10, 'PART NO. 12345-01')
  c.text(971, 136, 10, 'REV C')
  c.text(781, 96, 9, 'DIMENSIONS IN MM')
  c.text(971, 96, 9, 'SCALE 2:1')
  c.text(781, 62, 7.5, 'TOLERANCES: .X ±0.1   .XX ±0.05   ANGLES ±0.5°')
  c.text(971, 62, 9, `SHEET ${sheet} OF 2`)
}

function sheetOne(): string {
  const c = new Content()
  frame(c, 1)
  // The plate, its bore, and four holes, at 2:1.
  c.rect(240, 300, 400, 240, 1.4)
  c.circle(440, 420, 40, 1.2)
  for (const [x, y] of [[280, 340], [600, 340], [280, 500], [600, 500]]) c.circle(x, y, 8.5, 1)
  c.dashed(true)
  c.line(380, 420, 500, 420, 0.4)
  c.line(440, 360, 440, 480, 0.4)
  c.dashed(false)
  // The slot on the right edge, and the chamfer at the top right.
  c.line(640, 395, 610, 395, 1.4)
  c.line(610, 395, 610, 445, 1.4)
  c.line(610, 445, 640, 445, 1.4)
  c.line(626, 540, 640, 532, 1.4)
  // Width: 200.0 (the title block's .X tolerance).
  c.line(240, 296, 240, 258, 0.4)
  c.line(640, 296, 640, 258, 0.4)
  c.line(240, 266, 640, 266, 0.4)
  c.arrow(240, 266, -1, 0)
  c.arrow(640, 266, 1, 0)
  c.text(426, 270, 10, '200.0')
  // Height: 120.00 ±0.05, written up the dimension line, in two runs.
  c.line(236, 300, 198, 300, 0.4)
  c.line(236, 540, 198, 540, 0.4)
  c.line(206, 300, 206, 540, 0.4)
  c.arrow(206, 300, 0, -1)
  c.arrow(206, 540, 0, 1)
  c.text(202, 380, 10, '120.00', false, true)
  c.text(202, 416, 10, '±0.05', false, true)
  // The bore: Ø40.00 with stacked deviations, and its position in a frame whose symbol is drawn as lines.
  c.line(468, 448, 522, 596, 0.4)
  c.text(525, 594, 10, 'Ø40.00')
  c.text(561, 599, 6.5, '+0.05')
  c.text(561, 590, 6.5, '-0.00')
  c.rect(525, 566, 120, 17, 0.6)
  for (const x of [543, 583, 603, 623]) c.line(x, 566, x, 583, 0.6)
  c.circle(534, 574.5, 4.5, 0.6)
  c.line(528, 574.5, 540, 574.5, 0.6)
  c.line(534, 568.5, 534, 580.5, 0.6)
  c.text(547, 571, 9, 'Ø0.25')
  c.text(590, 571, 9, 'A')
  c.text(610, 571, 9, 'B')
  c.text(631, 571, 9, 'C')
  // The holes, the slot's limits, the corner radius, and the chamfer's angle.
  c.line(606, 506, 660, 556, 0.4)
  c.text(663, 553, 10, '4X Ø8.5 THRU')
  c.line(640, 420, 656, 420, 0.4)
  c.text(660, 426, 10, '25.05')
  c.text(660, 413, 10, '24.95')
  c.text(222, 548, 10, 'R5')
  c.text(648, 534, 10, '30°')
  // Datum A on the bottom edge.
  c.rect(430, 280, 14, 14, 0.6)
  c.text(433, 284, 10, 'A')
  c.text(60, 760, 10, 'NOTES:', true)
  c.text(60, 744, 9, '1. BREAK ALL SHARP EDGES 0.2 MAX.')
  c.text(60, 730, 9, '2. FINISH: CLEAR ANODIZE.')
  c.text(60, 716, 9, '3. INTERPRET PER ASME Y14.5-2018.')
  return c.out.join('\n')
}

function sheetTwo(): string {
  // Drawn as a landscape sheet, then turned onto a portrait page that /Rotate 90 shows upright again.
  const c = new Content()
  c.out.push(`q 0 1 -1 0 ${H} 0 cm`)
  frame(c, 2)
  c.text(380, 700, 12, 'SECTION A-A', true)
  c.rect(240, 330, 400, 50, 1.4)
  c.line(420, 330, 420, 380, 1)
  c.line(460, 330, 460, 380, 1)
  c.line(440, 400, 452, 382, 0.4)
  c.text(400, 404, 10, 'M8x1.25-6H THRU')
  c.text(430, 300, 10, '(25.0)')
  c.line(640, 330, 690, 330, 0.4)
  c.line(640, 380, 690, 380, 0.4)
  c.text(696, 352, 10, '0.8 MIN')
  c.text(290, 392, 9, 'Ra 1.6')
  c.text(520, 404, 10, '90° ±1°')
  c.text(60, 760, 10, 'NOTES:', true)
  c.text(60, 744, 9, '1. NO BURRS IN THREADS.')
  c.out.push('Q')
  return c.out.join('\n')
}

/** The example drawing's bytes. Its few non-ASCII signs (Ø, ±, °) are the same codes in WinAnsi as in Latin-1. */
export function exampleDrawing(): Uint8Array {
  const contents = [sheetOne(), sheetTwo()]
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [5 0 R 7 0 R] /Count 2 >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>`,
    `<< /Length ${contents[0].length} >>\nstream\n${contents[0]}\nendstream`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${H} ${W}] /Rotate 90 /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 8 0 R >>`,
    `<< /Length ${contents[1].length} >>\nstream\n${contents[1]}\nendstream`,
    '<< /Title (Spacer plate, a Labs example) /Producer (Labs Ballooned Drawing) >>',
  ]
  let body = '%PDF-1.7\n%âãÏÓ\n'
  const offsets: number[] = []
  objects.forEach((o, i) => {
    offsets.push(body.length)
    body += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = body.length
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  const bytes = new Uint8Array(body.length)
  for (let i = 0; i < body.length; i++) bytes[i] = body.charCodeAt(i) & 0xff
  return bytes
}

/** The zones of both sheets: the border's inner frame, 8 across and 6 down, from the top left. */
const ZONES: Zones = { left: 40 / W, top: 40 / H, right: (W - 40) / W, bottom: (H - 40) / H, columns: 8, rows: 6, start: 'top-left', skipIO: true }

/** The example's work: its title block's tolerances and zones set, and the first few balloons placed. */
export function exampleWork(docId: string): Work {
  const work = newWork('spacer-plate-example.pdf', docId, 2)
  work.titleBlock = { places: ['', '0.1', '0.05', '', ''], angle: '0.5' }
  work.zones = { 1: { ...ZONES }, 2: { ...ZONES } }
  work.header = { partNumber: '12345-01', partName: 'Spacer plate', serial: '', fairId: '' }
  work.balloons = [
    { ...blankBalloon('example-1', 1, 470, 290, '200.0'), results: ['200.04'] },
    { ...blankBalloon('example-2', 1, 186, 400, '120.00 ±0.05'), results: ['120.02'] },
    { ...blankBalloon('example-3', 1, 610, 612, 'Ø40.00 +0.05/-0.00'), results: ['40.06'], nc: '' },
  ]
  return work
}
