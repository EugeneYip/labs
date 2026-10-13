// One worksheet, read as a stream: what's in it, and what of that can't be seen on screen.

import { attr, MAX_COL, MAX_ROW, parseAreas, parseRef, scan, Scanner, within, xstring, type Area } from './xml.ts'

/** Content after this many empty rows (or columns), or starting this far from A1, counts as far away. */
export const FAR_ROWS = 50
export const FAR_COLS = 20
/** How many cells a sample keeps. */
const SAMPLE_ROWS = 6
const SAMPLE_COLS = 8
const SAMPLE_CELLS = 12
/** How much of a cell's text is kept as it streams past; samples show far less. */
const KEEP = 1000
/** Cells kept to judge by colour once conditional formats are known; past this many they're counted, not kept. */
const COLOUR_CANDIDATES = 20_000
/** Rows listed by number in a finding, and drop-down lists and choices kept per sheet. */
const LISTED_ROWS = 400
const LISTS = 200
const CHOICES = 500
/** Names of scenario authors kept per sheet, and how much of a formula is kept to recognize cube functions. */
const SCENARIO_USERS = 50
const FORMULA_HEAD = 200

/** Keeps the first few rows' cells as they stream past. */
class Sampler {
  readonly cells: Cell[] = []
  private rows = 0
  private row = -1
  private inRow = 0
  private readonly maxRows: number
  private readonly perRow: number
  private readonly max: number
  constructor(maxRows = SAMPLE_ROWS, perRow = SAMPLE_COLS, max = SAMPLE_ROWS * SAMPLE_COLS) {
    this.maxRows = maxRows
    this.perRow = perRow
    this.max = max
  }
  /** Whether a cell in this row would be kept; asked before the cell is made. */
  wants(row: number): boolean {
    if (this.cells.length >= this.max) return false
    return row === this.row ? this.inRow < this.perRow : this.rows < this.maxRows
  }
  add(cell: Cell): void {
    if (cell.row !== this.row) {
      this.row = cell.row
      this.rows++
      this.inRow = 0
    }
    this.inRow++
    this.cells.push(cell)
  }
}

export interface Cell {
  row: number
  col: number
  /** The text, or for a shared string its index until the strings are read. */
  value: string
  shared?: number
}

/** How something is kept from view: by a format that shows nothing (such as ;;;), by a colour like its fill, or not. */
export type Hiding = '' | 'format' | 'colour'

export interface CellStyle {
  numbers: Hiding
  text: Hiding
  /** TRUE, FALSE, and errors ignore number formats, so only the font's colour can hide them. */
  other: Hiding
  date: boolean
}

export interface SheetScan {
  /** False if the sheet's part stopped partway (damaged, or past a limit): everything below is what came before. */
  complete: boolean
  error?: unknown
  /** The last row reached, for a sheet read only in part. */
  lastRow: number
  cells: number
  /** The filled cells' bounds. */
  bounds: Area | null
  hiddenRows: { count: number; rows: number[]; cells: number; sample: Cell[] }
  hiddenCols: { cols: number[]; cells: number; sample: Cell[] }
  /** Cells whose format or colour hides them. */
  unseen: { cells: number; byFormat: number; byColour: number; sample: Cell[] }
  /** Content far from the rest of what shows: where it starts, the gap before it, and the last row or column before
   * the gap (0 if it starts far from A1). Hidden rows and columns don't count, either as content or as gap. */
  far: {
    cells: number
    sample: Cell[]
    rows: { start: number; gap: number; after: number } | null
    cols: { start: number; gap: number; after: number } | null
    /** Set if the second read, which finds the far cells, failed; everything else about the sheet stands. */
    error?: unknown
  }
  /** The first rows with data, for a hidden sheet. */
  sample: Cell[]
  filter: boolean
  protectedSheet: boolean
  lists: { where: string; values: string[] }[]
  headers: string[]
  scenarioUsers: string[]
  /** Cells whose formula uses a cube function (CUBEVALUE and the like), which read from a data model or a connection. */
  cubeFormulas: number
}

export interface SheetContext {
  styles: CellStyle[]
  /** Table areas, where colours come from the table's style and can't be judged from the cell. */
  styledAreas: Area[]
  /** Marks each shared string a cell uses. */
  useShared(index: number): void
  date1904: boolean
  memory: SheetMemory
  signal?: AbortSignal
  onBytes?: (n: number) => void
}

/** Working memory for one check: a byte per row and per column, for the cells that show and for what's hidden.
 * Cleared before each sheet, so nothing from one sheet (including one that failed halfway) can colour the next. */
export class SheetMemory {
  readonly filledRows = new Uint8Array(MAX_ROW + 1)
  readonly hiddenRows = new Uint8Array(MAX_ROW + 1)
  readonly filledCols = new Uint8Array(MAX_COL + 1)
  readonly hiddenCols = new Uint8Array(MAX_COL + 1)
  /** The highest row and column marked since the last clear, so a clear touches only what was used. */
  private rowsUsed = 0
  private colsUsed = 0
  clear(): void {
    this.filledRows.fill(0, 0, this.rowsUsed + 1)
    this.hiddenRows.fill(0, 0, this.rowsUsed + 1)
    this.filledCols.fill(0, 0, this.colsUsed + 1)
    this.hiddenCols.fill(0, 0, this.colsUsed + 1)
    this.rowsUsed = this.colsUsed = 0
  }
  usedRow(r: number): void {
    if (r > this.rowsUsed) this.rowsUsed = r
  }
  usedCol(c: number): void {
    if (c > this.colsUsed) this.colsUsed = c
  }
}

/** A cell as it streams past: its place, its raw value (for t="s", a shared string's index), type, and style. */
interface RawCell {
  row: number
  col: number
  value: string
  type: string
  style: number
  formula: boolean
  /** The formula's first characters, if it has its own (cells sharing another's formula have none). */
  formulaText: string
}

/**
 * A scanner for a worksheet's cells. `onCell` gets each cell that has a value or a formula; tags outside <sheetData>,
 * and <row> tags (before their cells), go to `onTag`; text that isn't a cell's goes to `onText` while a handler has
 * set `wantText`.
 */
function cellScanner(onCell: (cell: RawCell) => void, onTag?: (name: string, close: boolean, self: boolean, attrs: string, sc: Scanner) => void, onText?: (text: string) => void): Scanner {
  let inData = false
  let row = 0
  let col = 0
  let cell: RawCell | null = null
  let inValue = false
  let inInline = false
  let inPhonetic = false
  let inFormula = false
  const end = () => {
    inValue = inInline = inPhonetic = inFormula = false
    sc.wantText = false
    const c = cell
    cell = null
    if (c && (c.formula || c.value !== '')) onCell(c)
  }
  const sc: Scanner = new Scanner({
    tag(name, close, self, attrs) {
      if (name === 'sheetData') {
        inData = !close && !self
        return
      }
      if (!inData) return onTag?.(name, close, self, attrs, sc)
      switch (name) {
        case 'row':
          if (!close) {
            const r = Number(attr(attrs, 'r'))
            row = r >= 1 && r <= MAX_ROW ? r : Math.min(MAX_ROW, row + 1)
            col = 0
          }
          return onTag?.(name, close, self, attrs, sc)
        case 'c': {
          if (close) return end()
          const ref = attr(attrs, 'r')
          const at = ref ? parseRef(ref) : null
          // A cell's own reference wins over the row's count, if a file disagrees with itself.
          if (at) row = at[0]
          col = at ? at[1] : Math.min(MAX_COL, col + 1)
          cell = { row, col, value: '', type: attr(attrs, 't') ?? 'n', style: Number(attr(attrs, 's') ?? 0) || 0, formula: false, formulaText: '' }
          if (self) end()
          return
        }
        case 'v':
          inValue = !close && !self && cell !== null
          sc.wantText = inValue
          return
        case 'f':
          if (!close && cell) cell.formula = true
          inFormula = !close && !self && cell !== null
          sc.wantText = inFormula
          return
        case 'is':
          inInline = !close && !self && cell !== null
          return
        case 'rPh':
          // Phonetic guides (furigana) aren't part of the cell's text.
          inPhonetic = !close && !self
          if (inInline) sc.wantText = false
          return
        case 't':
          if (inInline && !inPhonetic) sc.wantText = !close && !self
          return
      }
    },
    text(t) {
      if (cell && (inValue || (inInline && !inPhonetic))) {
        if (cell.value.length < KEEP) cell.value += t
      } else if (cell && inFormula) {
        if (cell.formulaText.length < FORMULA_HEAD) cell.formulaText += t
      } else onText?.(t)
    },
  })
  return sc
}

/** Reads a worksheet: once for everything, and again only if some of it is far from the rest. */
export async function scanSheet(open: () => Promise<ReadableStream<Uint8Array>>, ctx: SheetContext, hidden: boolean): Promise<SheetScan> {
  const m = ctx.memory
  m.clear()
  const out: SheetScan = {
    complete: true,
    lastRow: 0,
    cells: 0,
    bounds: null,
    hiddenRows: { count: 0, rows: [], cells: 0, sample: [] },
    hiddenCols: { cols: [], cells: 0, sample: [] },
    unseen: { cells: 0, byFormat: 0, byColour: 0, sample: [] },
    far: { cells: 0, sample: [], rows: null, cols: null },
    sample: [],
    filter: false,
    protectedSheet: false,
    lists: [],
    headers: [],
    scenarioUsers: [],
    cubeFormulas: 0,
  }
  // The bounds of every cell with data, and of the cells that show (not in a hidden row or column).
  const shown = { minRow: MAX_ROW + 1, maxRow: 0, minCol: MAX_COL + 1, maxCol: 0 }
  let minRow = MAX_ROW + 1
  let maxRow = 0
  let minCol = MAX_COL + 1
  let maxCol = 0
  const hiddenColsWithData = new Set<number>()
  const sheetSample = new Sampler()
  const rowSample = new Sampler()
  const colSample = new Sampler()
  const unseenSample = new Sampler(SAMPLE_CELLS, SAMPLE_CELLS, SAMPLE_CELLS)
  // Colour can only be judged outside conditional formats, which come after the cells.
  const colourCandidates: Cell[] = []
  let colourOverflow = 0
  const cfAreas: Area[] = []

  let rowHidden = false
  let rowHasData = false
  let validation: { where: string; type: string; text: string } | null = null
  let inFormula1 = false
  let inConditional = false
  let header: string | null = null
  let sqref: string | null = null

  const onCell = (cell: RawCell) => {
    const { row: r, col: c, value, type, style: s } = cell
    out.cells++
    if (type === 's') {
      const index = Number(value)
      if (Number.isInteger(index) && index >= 0) ctx.useShared(index)
    }
    if (cell.formulaText && /\bCUBE[A-Z]*\s*\(/i.test(cell.formulaText)) out.cubeFormulas++
    if (!hidden && !rowHidden && !m.hiddenCols[c]) {
      m.filledRows[r] = 1
      m.filledCols[c] = 1
      m.usedRow(r)
      m.usedCol(c)
      if (r < shown.minRow) shown.minRow = r
      if (r > shown.maxRow) shown.maxRow = r
      if (c < shown.minCol) shown.minCol = c
      if (c > shown.maxCol) shown.maxCol = c
    }
    if (r < minRow) minRow = r
    if (r > maxRow) maxRow = r
    if (c < minCol) minCol = c
    if (c > maxCol) maxCol = c
    if (hidden) {
      // A hidden sheet: keep its first rows as a sample.
      if (sheetSample.wants(r)) sheetSample.add(makeCell(cell, ctx))
      return
    }
    if (rowHidden) {
      rowHasData = true
      out.hiddenRows.cells++
      if (rowSample.wants(r)) rowSample.add(makeCell(cell, ctx))
      return
    }
    if (m.hiddenCols[c]) {
      hiddenColsWithData.add(c)
      out.hiddenCols.cells++
      if (colSample.wants(r)) colSample.add(makeCell(cell, ctx))
      return
    }
    const style = ctx.styles[s]
    if (!style) return
    const how = type === 's' || type === 'str' || type === 'inlineStr' ? style.text : type === 'b' || type === 'e' ? style.other : style.numbers
    if (how === 'format') {
      out.unseen.cells++
      out.unseen.byFormat++
      if (unseenSample.wants(r)) unseenSample.add(makeCell(cell, ctx))
    } else if (how === 'colour' && !within(ctx.styledAreas, r, c)) {
      if (colourCandidates.length < COLOUR_CANDIDATES) colourCandidates.push(makeCell(cell, ctx))
      else colourOverflow++
    }
  }

  const sc = cellScanner(
    onCell,
    (name, close, self, attrs, sc) => {
      switch (name) {
        case 'row':
          if (close) {
            if (rowHidden && rowHasData) noteHiddenRow(lastRow)
            break
          }
          lastRow = rowNumber(attrs, lastRow)
          rowHidden = truthy(attr(attrs, 'hidden')) || tooSmall(attr(attrs, 'ht'), 2)
          rowHasData = false
          if (rowHidden) {
            m.hiddenRows[lastRow] = 1
            m.usedRow(lastRow)
          }
          break
        case 'col': {
          if (close) break
          const min = Number(attr(attrs, 'min'))
          const max = Math.min(MAX_COL, Number(attr(attrs, 'max')))
          if ((truthy(attr(attrs, 'hidden')) || tooSmall(attr(attrs, 'width'), 0.5)) && min >= 1 && max >= min) {
            m.hiddenCols.fill(1, min, max + 1)
            m.usedCol(max)
          }
          break
        }
        case 'filterColumn':
          if (!close) out.filter = true
          break
        case 'sheetProtection':
          if (!close && truthy(attr(attrs, 'sheet'))) out.protectedSheet = true
          break
        case 'dataValidation':
          if (close || self) {
            const v = close ? validation : { where: attr(attrs, 'sqref') ?? '', type: attr(attrs, 'type') ?? '', text: '' }
            if (v && v.type === 'list' && out.lists.length < LISTS) {
              const values = listValues(xstring(v.text))
              if (values.length) out.lists.push({ where: v.where.trim().replace(/\s+/g, ', '), values })
            }
            validation = null
          } else validation = { where: attr(attrs, 'sqref') ?? '', type: attr(attrs, 'type') ?? '', text: '' }
          break
        case 'formula1':
          inFormula1 = validation !== null && !close && !self
          sc.wantText = inFormula1
          break
        case 'conditionalFormatting': {
          inConditional = !close && !self
          const ref = close ? undefined : attr(attrs, 'sqref')
          if (ref) for (const a of parseAreas(ref)) cfAreas.push(a)
          break
        }
        case 'sqref':
          // The newer (x14) drop-downs and conditional formats keep their ranges in an element of their own.
          if (close && sqref !== null) {
            if (validation) validation.where = sqref
            else if (inConditional) for (const a of parseAreas(sqref)) cfAreas.push(a)
          }
          sqref = !close && !self ? '' : null
          sc.wantText = sqref !== null
          break
        case 'oddHeader':
        case 'oddFooter':
        case 'evenHeader':
        case 'evenFooter':
        case 'firstHeader':
        case 'firstFooter':
          if (close) {
            if (header !== null) {
              const text = headerText(xstring(header))
              if (text && !out.headers.includes(text)) out.headers.push(text)
            }
            header = null
            sc.wantText = false
          } else if (!self) {
            header = ''
            sc.wantText = true
          }
          break
        case 'scenario': {
          const user = close ? undefined : attr(attrs, 'user')
          if (user && out.scenarioUsers.length < SCENARIO_USERS && !out.scenarioUsers.includes(user)) out.scenarioUsers.push(user)
          break
        }
      }
    },
    (t) => {
      if (inFormula1 && validation) {
        if (validation.text.length < KEEP * 20) validation.text += t
      } else if (header !== null) {
        if (header.length < KEEP) header += t
      } else if (sqref !== null && sqref.length < KEEP * 100) sqref += t
    },
  )
  let lastRow = 0

  function noteHiddenRow(r: number) {
    out.hiddenRows.count++
    if (out.hiddenRows.rows.length < LISTED_ROWS) out.hiddenRows.rows.push(r)
  }

  try {
    await scan(await open(), sc, ctx.signal, ctx.onBytes)
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e
    out.complete = false
    out.error = e
  }
  out.lastRow = lastRow

  // Colour-hidden cells, now that conditional formats are known.
  for (const cell of colourCandidates) {
    if (within(cfAreas, cell.row, cell.col)) continue
    out.unseen.cells++
    out.unseen.byColour++
    if (unseenSample.wants(cell.row)) unseenSample.add(cell)
  }
  out.unseen.cells += colourOverflow
  out.unseen.byColour += colourOverflow
  out.sample = sheetSample.cells
  out.hiddenRows.sample = rowSample.cells
  out.hiddenCols.sample = colSample.cells
  out.unseen.sample = unseenSample.cells
  out.hiddenCols.cols = [...hiddenColsWithData].sort((a, b) => a - b)
  if (maxRow) out.bounds = { r1: minRow, c1: minCol, r2: maxRow, c2: maxCol }

  // Far away: content that shows, after a long run of empty rows or columns, or starting far from A1. A hidden sheet
  // is hidden already, and hidden rows and columns are reported as such.
  if (!hidden && shown.maxRow) {
    const rows = farFrom(m.filledRows, m.hiddenRows, shown.minRow, shown.maxRow, FAR_ROWS)
    const cols = farFrom(m.filledCols, m.hiddenCols, shown.minCol, shown.maxCol, FAR_COLS)
    if (rows || cols) {
      out.far.rows = rows
      out.far.cols = cols
      try {
        await countFar(open, ctx, out, rows?.start ?? Infinity, cols?.start ?? Infinity)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') throw e
        // A part that failed the first time fails again at the same place: the far cells before it are counted.
        if (out.complete) out.far.error = e
      }
    }
  }
  return out
}

/** The row number a <row> tag gives, or the one after the last if it gives none. */
function rowNumber(attrs: string, last: number): number {
  const r = Number(attr(attrs, 'r'))
  return r >= 1 && r <= MAX_ROW ? r : Math.min(MAX_ROW, last + 1)
}

/** The first filled row (or column) after `gap` or more empty ones, counting only those that show (a hidden row in
 * the gap takes no space on screen), with the gap and the last filled one before it; null if there's none. */
function farFrom(filled: Uint8Array, hidden: Uint8Array, first: number, last: number, gap: number): { start: number; gap: number; after: number } | null {
  let empty = 0
  for (let i = 1; i < first; i++) if (!hidden[i]) empty++
  if (empty >= gap) return { start: first, gap: empty, after: 0 }
  let previous = first
  empty = 0
  for (let i = first + 1; i <= last; i++) {
    if (filled[i]) {
      if (empty >= gap) return { start: i, gap: empty, after: previous }
      previous = i
      empty = 0
    } else if (!hidden[i]) empty++
  }
  return null
}

/** The second read: counts and samples the cells from the far rows or columns on, leaving out hidden ones. */
async function countFar(open: () => Promise<ReadableStream<Uint8Array>>, ctx: SheetContext, out: SheetScan, fromRow: number, fromCol: number) {
  const m = ctx.memory
  const sample = new Sampler()
  const sc = cellScanner((cell) => {
    if (m.hiddenRows[cell.row] || m.hiddenCols[cell.col]) return
    if (cell.row < fromRow && cell.col < fromCol) return
    out.far.cells++
    if (sample.wants(cell.row)) sample.add(makeCell(cell, ctx))
  })
  try {
    await scan(await open(), sc, ctx.signal, ctx.onBytes)
  } finally {
    out.far.sample = sample.cells
  }
}

function makeCell({ row, col, value, type, style }: RawCell, ctx: SheetContext): Cell {
  if (type === 's') {
    const index = Number(value)
    return Number.isInteger(index) && index >= 0 ? { row, col, value: '', shared: index } : { row, col, value }
  }
  if (type === 'b') return { row, col, value: value === '1' ? 'TRUE' : 'FALSE' }
  if (type === 'n' && value !== '' && ctx.styles[style]?.date) return { row, col, value: serialDate(Number(value), ctx.date1904) }
  return { row, col, value: value === '' ? '(a formula with no saved result)' : xstring(value) }
}

/** A date stored as Excel's day number, as YYYY-MM-DD (with the time if there is one). */
export function serialDate(serial: number, date1904: boolean): string {
  if (!Number.isFinite(serial) || serial < 0 || serial > 2_958_465) return String(serial)
  // The 1900 system counts a 29 February 1900 that never was, so days after it are one off.
  const base = date1904 ? Date.UTC(1904, 0, 1) : serial < 60 ? Date.UTC(1899, 11, 31) : Date.UTC(1899, 11, 30)
  if (!date1904 && Math.floor(serial) === 60) return '1900-02-29'
  const ms = base + Math.round(serial * 86_400_000)
  const iso = new Date(ms).toISOString()
  const time = iso.slice(11, 16)
  return time === '00:00' ? iso.slice(0, 10) : `${iso.slice(0, 10)} ${time}`
}

function truthy(v: string | undefined): boolean {
  return v === '1' || v === 'true'
}

/** Whether a height or width is set, and too small to see. */
function tooSmall(v: string | undefined, min: number): boolean {
  return v !== undefined && v.trim() !== '' && Number(v) < min
}

/** A drop-down's own list ("Ann,Bob" in quotes); a list taken from cells isn't the sheet's hidden data. */
function listValues(formula: string): string[] {
  const text = formula.trim()
  if (!text.startsWith('"') || !text.endsWith('"') || text.length < 2) return []
  return text
    .slice(1, -1)
    .replace(/""/g, '"')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, CHOICES)
}

/**
 * A header or footer's own words, without Excel's codes (&L, &P, &"Font,Bold", &12, &K00FF00). Page numbers, dates,
 * the sheet's and file's names, and words like "Page" and "of" are printed by Excel from codes or presets, so a header
 * with nothing else gives "".
 */
export function headerText(raw: string): string {
  const s = raw
    .replace(/&&/g, '\u0000')
    .replace(/&"[^"]*"/g, ' ')
    .replace(/&K[0-9A-Fa-f]{6}|&K\d{2}[+-]\d{3}/g, '')
    .replace(/&\d+/g, '')
    .replace(/&[LCRPNDTFAZGSUXYEBIOH]/gi, ' ')
    .replace(/\u0000/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
  const words = s.replace(/\b(page|pages|of|sheet|confidential|draft)\b/gi, '').replace(/[^\p{L}]/gu, '')
  return words ? s : ''
}

// Styles: which formats show nothing, which colours vanish into their fill, and which formats are dates.

const DEFAULT_INDEXED = [
  '000000', 'FFFFFF', 'FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF', '000000', 'FFFFFF', 'FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF',
  '800000', '008000', '000080', '808000', '800080', '008080', 'C0C0C0', '808080', '9999FF', '993366', 'FFFFCC', 'CCFFFF', '660066', 'FF8080', '0066CC', 'CCCCFF',
  '000080', 'FF00FF', 'FFFF00', '00FFFF', '800080', '800000', '008080', '0000FF', '00CCFF', 'CCFFFF', 'CCFFCC', 'FFFF99', '99CCFF', 'FF99CC', 'CC99FF', 'FFCC99',
  '3366FF', '33CCCC', '99CC00', 'FFCC00', 'FF9900', 'FF6600', '666699', '969696', '003366', '339966', '003300', '333300', '993300', '993366', '333399', '333333',
]

const BUILT_IN_DATES = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 45, 46, 47, 50, 51, 52, 53, 54, 55, 56, 57, 58])

/** The colours a number format can name, as Excel shows them. */
const FORMAT_COLOURS: Record<string, string> = { black: '000000', white: 'FFFFFF', red: 'FF0000', green: '00FF00', blue: '0000FF', yellow: 'FFFF00', magenta: 'FF00FF', cyan: '00FFFF' }

type Colour = { rgb?: string; theme?: number; tint?: number; indexed?: number; auto?: boolean }

/** The theme's twelve colours in the order cells refer to them (light 1 and dark 1 swapped, as Excel does). */
export function themeColours(xml: string): string[] {
  const named = new Map<string, string>()
  let current = ''
  const scheme = /<(?:\w+:)?(dk1|lt1|dk2|lt2|accent[1-6]|hlink|folHlink)\b[^>]*>|<(?:\w+:)?(srgbClr|sysClr)\b([^>]*)>/g
  for (const m of xml.matchAll(scheme)) {
    if (m[1]) current = m[1]
    else if (current && !named.has(current)) {
      const v = m[2] === 'sysClr' ? (attr(m[3], 'lastClr') ?? (attr(m[3], 'val') === 'window' ? 'FFFFFF' : '000000')) : attr(m[3], 'val')
      if (v && /^[0-9a-f]{6}$/i.test(v)) named.set(current, v.toUpperCase())
    }
  }
  const order = ['lt1', 'dk1', 'lt2', 'dk2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink']
  const fallback = ['FFFFFF', '000000', 'E7E6E6', '44546A', '4472C4', 'ED7D31', 'A5A5A5', 'FFC000', '5B9BD5', '70AD47', '0563C1', '954F72']
  return order.map((k, i) => named.get(k) ?? fallback[i])
}

export function readStyles(xml: string, theme: string[]): CellStyle[] {
  const formats = new Map<number, string>()
  const fonts: Colour[] = []
  const fills: { pattern: string; fg?: Colour }[] = []
  const xfs: { numFmt: number; font: number; fill: number }[] = []
  let indexed = DEFAULT_INDEXED
  const custom: string[] = []
  let section = ''
  let depth = 0
  let inFont = false
  let fill: { pattern: string; fg?: Colour } | null = null
  const colour = (attrs: string): Colour => {
    const rgb = attr(attrs, 'rgb')
    const th = attr(attrs, 'theme')
    const ix = attr(attrs, 'indexed')
    return {
      rgb: rgb && /^[0-9a-f]{6,8}$/i.test(rgb) ? rgb.slice(-6).toUpperCase() : undefined,
      theme: th !== undefined ? Number(th) : undefined,
      tint: Number(attr(attrs, 'tint') ?? 0) || 0,
      indexed: ix !== undefined ? Number(ix) : undefined,
      auto: truthy(attr(attrs, 'auto')),
    }
  }
  const sc = new Scanner({
    tag(name, close, self, attrs) {
      // Only the top-level lists count: the same elements inside dxfs (conditional formats) describe something else.
      if (depth === 1 && !close && ['numFmts', 'fonts', 'fills', 'cellXfs', 'colors', 'dxfs', 'cellStyleXfs'].includes(name)) section = name
      if (!close && !self) depth++
      if (close) {
        depth--
        if (depth === 1) section = ''
      }
      if (section === 'numFmts' && name === 'numFmt' && !close) {
        const id = Number(attr(attrs, 'numFmtId'))
        const code = attr(attrs, 'formatCode')
        if (code !== undefined) formats.set(id, code)
      } else if (section === 'fonts') {
        if (name === 'font') {
          if (!close) {
            inFont = true
            fonts.push({ auto: true })
            if (self) inFont = false
          } else inFont = false
        } else if (name === 'color' && inFont && !close) fonts[fonts.length - 1] = colour(attrs)
      } else if (section === 'fills') {
        if (name === 'fill') {
          if (!close) {
            fill = { pattern: 'none' }
            fills.push(fill)
          } else fill = null
        } else if (name === 'patternFill' && fill && !close) fill.pattern = attr(attrs, 'patternType') ?? 'none'
        else if (name === 'gradientFill' && fill && !close) fill.pattern = 'gradient'
        else if (name === 'fgColor' && fill && !close) fill.fg = colour(attrs)
      } else if (section === 'cellXfs' && name === 'xf' && !close) {
        xfs.push({ numFmt: Number(attr(attrs, 'numFmtId') ?? 0), font: Number(attr(attrs, 'fontId') ?? 0), fill: Number(attr(attrs, 'fillId') ?? 0) })
      } else if (section === 'colors' && name === 'rgbColor' && !close) {
        const rgb = attr(attrs, 'rgb')
        if (rgb) custom.push(rgb.slice(-6).toUpperCase())
      }
    },
  })
  sc.feed(xml)
  if (custom.length) indexed = custom
  const resolve = (c: Colour | undefined, auto: string): string => {
    if (!c) return auto
    if (c.rgb) return applyTint(c.rgb, c.tint ?? 0)
    if (c.theme !== undefined && theme[c.theme]) return applyTint(theme[c.theme], c.tint ?? 0)
    if (c.indexed !== undefined) return c.indexed === 64 ? '000000' : c.indexed === 65 ? 'FFFFFF' : applyTint(indexed[c.indexed] ?? auto, c.tint ?? 0)
    return auto
  }
  const named = (section: string): string | null => {
    const m = /\[(black|white|red|green|blue|yellow|magenta|cyan|colou?r\s*(\d+))\]/i.exec(section)
    if (!m) return null
    // [Color1] to [Color56] are the palette's colours, which start at index 8.
    return m[2] ? (indexed[Number(m[2]) + 7] ?? null) : FORMAT_COLOURS[m[1].toLowerCase()]
  }
  return xfs.map((xf) => {
    const code = formats.get(xf.numFmt)
    const parts = code === undefined ? null : sections(code)
    const font = resolve(fonts[xf.font], '000000')
    const f = fills[xf.fill]
    // No fill shows the sheet's white; patterns and gradients can't be judged, so they never count as hiding.
    const background = !f || f.pattern === 'none' ? 'FFFFFF' : f.pattern === 'solid' ? resolve(f.fg, '000000') : null
    const gone = (c: string) => background !== null && vanishes(c, background)
    const hides = (sections: string[]): Hiding =>
      sections.every(showsNothing) ? 'format' : sections.every((s) => showsNothing(s) || gone(named(s) ?? font)) ? 'colour' : ''
    // A format of one section with @ is for text; otherwise the first three are for numbers and the fourth for text.
    const textOnly = parts !== null && parts.length === 1 && hasAt(parts[0])
    const numberParts = parts && !textOnly ? parts.slice(0, 3) : ['General']
    const textPart = parts && parts.length >= 4 ? parts[3] : textOnly && parts ? parts[0] : null
    return {
      numbers: hides(numberParts),
      text: textPart !== null ? hides([textPart]) : gone(font) ? 'colour' : '',
      other: gone(font) ? 'colour' : '',
      date: BUILT_IN_DATES.has(xf.numFmt) || (code !== undefined && isDateFormat(code)),
    }
  })
}

/** A number format's sections, split on the semicolons that aren't quoted or escaped. */
export function sections(code: string): string[] {
  const out: string[] = []
  let current = ''
  let quoted = false
  for (let i = 0; i < code.length; i++) {
    const ch = code[i]
    if (quoted) {
      current += ch
      if (ch === '"') quoted = false
    } else if (ch === '"') {
      quoted = true
      current += ch
    } else if (ch === '\\' || ch === '_' || ch === '*') {
      current += ch + (code[i + 1] ?? '')
      i++
    } else if (ch === ';') {
      out.push(current)
      current = ''
    } else current += ch
  }
  out.push(current)
  return out
}

/** Whether a format section displays nothing: only colours, conditions, padding (_x), space fill (* ), and empty or
 * blank quotes. */
export function showsNothing(section: string): boolean {
  const s = section
    .replace(/\[[^\]]*\]/g, '')
    .replace(/_./g, '')
    .replace(/\* /g, '')
    .replace(/"(\s*)"/g, '')
    .replace(/\\\s/g, '')
    .trim()
  return s === ''
}

function hasAt(section: string): boolean {
  return section.replace(/"[^"]*"/g, '').replace(/\\./g, '').includes('@')
}

export function isDateFormat(code: string): boolean {
  const s = code
    .replace(/"[^"]*"/g, '')
    .replace(/\\./g, '')
    .replace(/_.|\*./g, '')
    .replace(/\[(?![hms]+\])[^\]]*\]/gi, '')
  if (/^general$/i.test(s.trim())) return false
  return /[dmyhs]|AM\/PM|A\/P/i.test(s.replace(/\[[hms]+\]/gi, 'h'))
}

function applyTint(hex: string, tint: number): string {
  if (!tint) return hex
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let l = (max + min) / 2
  const d = max - min
  let h = 0
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d) {
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h /= 6
    if (h < 0) h += 1
  }
  l = tint < 0 ? l * (1 + tint) : l * (1 - tint) + tint
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = l - c / 2
  const [r1, g1, b1] = h < 1 / 6 ? [c, x, 0] : h < 2 / 6 ? [x, c, 0] : h < 3 / 6 ? [0, c, x] : h < 4 / 6 ? [0, x, c] : h < 5 / 6 ? [x, 0, c] : [c, 0, x]
  const to = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v + m)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `${to(r1)}${to(g1)}${to(b1)}`.toUpperCase()
}

/** WCAG contrast ratio between two colours: 1 means the same. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [0, 2, 4].map((i) => {
      const v = parseInt(hex.slice(i, i + 2), 16) / 255
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

/** Whether text in one colour vanishes into a background: almost no contrast, and no colour channel far apart, so
 * white on white and pale grey on white vanish while yellow on white (as bright, but a different colour) doesn't. */
export function vanishes(text: string, background: string): boolean {
  if (contrast(text, background) >= 1.2) return false
  for (const i of [0, 2, 4]) if (Math.abs(parseInt(text.slice(i, i + 2), 16) - parseInt(background.slice(i, i + 2), 16)) > 64) return false
  return true
}
