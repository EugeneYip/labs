// Everything in an .xlsx that isn't on screen, found by reading its parts directly. Nothing is run and nothing is sent.

import { compoundNames } from './cfb.ts'
import { bytes as partBytes, entries, head as partHead, open, ZipError, type Entry, type Meter } from './zip.ts'
import { attr, colName, colRuns, decode, encodingOf, parseAreas, refName, relId, rowRuns, scan, Scanner, scanText, xstring, XmlError, type Area, type Handlers } from './xml.ts'
import { FAR_COLS, FAR_ROWS, readStyles, scanSheet, SheetMemory, themeColours, type Cell, type CellStyle, type SheetContext, type SheetScan } from './sheet.ts'

export type Tier = 'data' | 'people' | 'note'

export interface Grid {
  head: string[]
  rows: string[][]
}

export interface Picture {
  name: string
  type: string
  bytes: Uint8Array
}

export interface Finding {
  tier: Tier
  title: string
  detail: string
  /** A sample of what's there. */
  grid?: Grid
  list?: string[]
  pictures?: Picture[]
  /** How to remove it in Excel. */
  fix?: string
  /** An embedded workbook, which can be checked on its own. */
  embedded?: { name: string; bytes: Uint8Array }
}

export interface SheetSummary {
  name: string
  state: 'visible' | 'hidden' | 'veryHidden'
  kind: 'worksheet' | 'chart' | 'dialog' | 'macro'
  cells: number
  range: string
  /** Whether its part was read to the end, only in part (it stopped partway), or not at all. */
  read: 'all' | 'part' | 'none'
}

/** What a part of the file is to this check: read for what it holds, shown (pictures), ordinary structure with
 * nothing to check, or something this page doesn't look inside. */
export type Role = 'read' | 'shown' | 'structure' | 'not-read'

export interface Part {
  name: string
  size: number
  role: Role
  what: string
}

export interface Report {
  name: string
  size: number
  format: string
  sheets: SheetSummary[]
  findings: Finding[]
  /** What couldn't be read, or was read only in part, and what that leaves unchecked. */
  incomplete: string[]
  /** What's in the file that this page doesn't look inside. */
  notRead: string[]
  /** Every part of the file. */
  parts: Part[]
}

/** A file this page can't check; the message says why and what to do. */
export class NotChecked extends Error {}

export type Progress = (label: string, fraction: number) => void

export const MAX_FILE = 500_000_000
/** The most one check inflates, across all of a file's parts, before it stops and says what it didn't reach. */
export const BUDGET = 6_000_000_000
/** A part read whole (settings, styles, Power Query), and one read as a stream (a sheet), in inflated bytes. */
const WHOLE = 64_000_000
const STREAMED = 4_000_000_000
/** Pictures shown, and the bytes kept for them and for embedded workbooks that can be checked on their own. */
const PICTURES = 24
const PICTURE_BYTES = 40_000_000
const EMBEDDED = 60_000_000
const EMBEDDED_BYTES = 100_000_000
/** Items listed in a finding, values kept per pivot-table field, and characters kept of one piece of text. */
const SAMPLE = 12
const FIELD_ITEMS = 5000
const TEXT = 2000
/** Shared-text entries tracked; a cell pointing past this points at nothing. */
const SHARED_MAX = 1 << 25
const CLIP = 80

/** Parts read as streams; their size in the file is how progress is measured. */
const STREAMED_PARTS = /^xl\/(worksheets|macrosheets|dialogsheets|pivotcache|externallinks|revisions)\/|^xl\/sharedstrings\.xml$/i

interface Rel {
  id: string
  type: string
  target: string
  external: boolean
}

interface Context {
  file: Blob
  byName: Map<string, Entry>
  parts: Map<string, { role: Role; what: string }>
  incomplete: string[]
  /** What the budget ran out before. */
  unreached: string[]
  budget: number
  meter: Meter
  signal?: AbortSignal
  progress: Tracker
}

class Tracker {
  private done = 0
  private weight = 0
  private size = 1
  private read = 0
  private label = ''
  private last = 0
  private readonly total: number
  private readonly report?: Progress
  constructor(total: number, report?: Progress) {
    this.total = Math.max(1, total)
    this.report = report
  }
  /** A new stage: what it's called, and the part it reads, whose size in the file is its share of the whole. */
  begin(label: string, entry?: Entry): void {
    this.done += this.current()
    this.label = label
    this.weight = entry && STREAMED_PARTS.test(entry.name) ? entry.compressed : 0
    this.size = entry ? Math.max(1, entry.size) : 1
    this.read = 0
    this.emit(true)
  }
  readonly bytes = (n: number): void => {
    this.read += n
    this.emit(false)
  }
  private current(): number {
    return Math.min(this.weight, (this.read / this.size) * this.weight)
  }
  private emit(force: boolean): void {
    const now = Date.now()
    if (!force && now - this.last < 100) return
    this.last = now
    this.report?.(this.label, Math.min(1, (this.done + this.current()) / this.total))
  }
}

/** Checks a workbook. Throws NotChecked for files it can't read, and an AbortError if stopped. */
export async function inspect(file: Blob, name: string, options: { signal?: AbortSignal; progress?: Progress; budget?: number } = {}): Promise<Report> {
  if (file.size === 0) throw new NotChecked('That file is empty.')
  if (file.size > MAX_FILE) throw new NotChecked(`That file is ${size(file.size)}, more than this page reads (${size(MAX_FILE)}). Check it in Excel, or copy the sheets you mean to send into a new workbook and check that.`)
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  if (head[0] === 0xd0 && head[1] === 0xcf && head[2] === 0x11 && head[3] === 0xe0) throw new NotChecked(compoundMessage(await compoundNames(file).catch(() => null)))
  if (head[0] !== 0x50 || head[1] !== 0x4b) throw new NotChecked(otherMessage(head, name))
  let list: Entry[]
  try {
    list = await entries(file)
  } catch (e) {
    throw new NotChecked(e instanceof ZipError && e.message === 'too-big' ? 'This file has more parts than any workbook, so this page doesn’t read it.' : 'This file seems damaged: it can’t be read as an Excel workbook.')
  }
  const byName = new Map<string, Entry>()
  let twins = 0
  for (const e of list) {
    if (e.name.endsWith('/')) continue
    const key = e.name.toLowerCase()
    if (byName.has(key)) twins++
    else byName.set(key, e)
  }
  const budget = options.budget ?? BUDGET
  const ctx: Context = { file, byName, parts: new Map(), incomplete: [], unreached: [], budget, meter: { left: budget }, signal: options.signal, progress: new Tracker(0) }
  if (twins)
    ctx.incomplete.push(`${plural(twins, 'part')} of the file ${twins === 1 ? 'has' : 'have'} the same name as another, which a sound workbook never has. Only the first of each was read, and another program may show the other.`)
  const rootRels = await rels(ctx, '')
  const main = rootRels.find((r) => r.type.endsWith('/officeDocument'))?.target ?? (byName.has('xl/workbook.xml') ? 'xl/workbook.xml' : '')
  // The main part must be a workbook's XML (an .xlsb's is binary, and a Word or PowerPoint file's is something else).
  if (!main || !byName.has(main.toLowerCase()) || !/\.xml$/i.test(main) || /^(word|ppt)\//i.test(main)) throw new NotChecked(packageMessage(byName, main))
  ctx.progress = new Tracker(
    [...byName.values()].filter((e) => STREAMED_PARTS.test(e.name)).reduce((n, e) => n + e.compressed, 0),
    options.progress,
  )
  return checkWorkbook(ctx, main, name)
}

function compoundMessage(names: string[] | null): string {
  const has = (n: string) => names?.some((x) => x.toLowerCase() === n.toLowerCase()) ?? false
  if (has('EncryptedPackage'))
    return 'This file is protected with a password to open, so this page can’t look inside it. Anyone with the password can see everything hidden in it. Check it in Excel before it goes, or remove the password to open, check that copy here, and add the password back.'
  if (has('Workbook') || has('Book'))
    return 'This is an older Excel file (.xls), which this page can’t read. In Excel, choose File > Save As, pick Excel Workbook (.xlsx), and check the copy: hidden sheets, rows, and pivot tables are kept when it’s saved that way.'
  if (has('WordDocument')) return 'This is a Word document (.doc), not an Excel workbook. This page checks Excel workbooks (.xlsx and .xlsm).'
  if (has('PowerPoint Document')) return 'This is a PowerPoint presentation (.ppt), not an Excel workbook. This page checks Excel workbooks (.xlsx and .xlsm).'
  if (names?.some((x) => x.startsWith('__substg1.0_'))) return 'This is an Outlook message (.msg). Save its attachments, and check any workbook among them here.'
  return names ? 'This is an older Office or Windows file, not an Excel workbook this page can read (.xlsx or .xlsm).' : 'This looks like an older Office file, but it seems damaged, so this page can’t tell what it is.'
}

function otherMessage(head: Uint8Array, name: string): string {
  if (/\.(csv|tsv|txt)$/i.test(name))
    return 'A CSV or text file can’t hide anything the way a workbook can: everything in it is the text itself. Open it in a text editor to see all of it, including any columns a spreadsheet app doesn’t show.'
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return 'This is a PDF, not an Excel workbook. This page checks Excel workbooks (.xlsx and .xlsm).'
  return 'This doesn’t look like an Excel workbook (.xlsx or .xlsm).'
}

function packageMessage(byName: Map<string, Entry>, main: string): string {
  if (byName.has('xl/workbook.bin') || /\.bin$/i.test(main))
    return 'This is an Excel binary workbook (.xlsb), which this page can’t read. In Excel, choose File > Save As, pick Excel Workbook (.xlsx), and check the copy.'
  if (byName.has('word/document.xml')) return 'This is a Word document. This page checks Excel workbooks (.xlsx and .xlsm).'
  if (byName.has('ppt/presentation.xml')) return 'This is a PowerPoint file. This page checks Excel workbooks (.xlsx and .xlsm).'
  if (byName.has('mimetype') || byName.has('content.xml'))
    return 'This is an OpenDocument spreadsheet (.ods), which this page can’t read. Save it as Excel Workbook (.xlsx) and check the copy.'
  if ([...byName.keys()].some((k) => k.startsWith('index/') || k.endsWith('.iwa')))
    return 'This is a Numbers file. In Numbers, choose File > Export To > Excel, and check the .xlsx it makes.'
  return 'This doesn’t look like an Excel workbook (.xlsx or .xlsm).'
}

type SheetEntry = { name: string; state: SheetSummary['state']; id: string }
type Scanned = { sheet: SheetEntry; part: string; kind: SheetSummary['kind']; scan: SheetScan | null; rels: Rel[] }
type Name = { name: string; hidden: boolean; local?: number; formula: string }

async function checkWorkbook(ctx: Context, main: string, fileName: string): Promise<Report> {
  const findings: Finding[] = []
  const people: Finding[] = []
  const notes: Finding[] = []
  const wbRels = await rels(ctx, main)
  const wbXml = await text(ctx, main, 'the workbook’s list of sheets')
  if (wbXml === null) throw new NotChecked('This file seems damaged: the part that lists its sheets can’t be read.')
  if (!/<(?:\w+:)?workbook[\s>]/.test(wbXml.slice(0, 4000))) throw new NotChecked(packageMessage(ctx.byName, main))
  const contentTypes = (await text(ctx, '[Content_Types].xml', 'the list of the file’s parts', 'structure')) ?? ''

  // The workbook part: its sheets, names, caches, links, and settings.
  const sheets: SheetEntry[] = []
  const names: Name[] = []
  const caches: { id: string; rel: string }[] = []
  const externalRels: string[] = []
  let date1904 = false
  let lockStructure = false
  let sharingUser = ''
  let hiddenWindow = false
  let tabsOff = false
  let savedFrom = ''
  {
    let current: Name | null = null
    scanText(wbXml, {
      tag(n, close, self, a) {
        if (close) {
          if (n === 'definedName' && current) {
            names.push({ ...current, formula: decode(current.formula) })
            current = null
          }
          return
        }
        if (n === 'sheet') sheets.push({ name: attr(a, 'name') ?? '', state: sheetState(attr(a, 'state')), id: relId(a) ?? '' })
        else if (n === 'definedName') {
          const local = attr(a, 'localSheetId')
          current = { name: attr(a, 'name') ?? '', hidden: truthy(attr(a, 'hidden')), local: local !== undefined ? Number(local) : undefined, formula: '' }
          if (self) {
            names.push(current)
            current = null
          }
        } else if (n === 'pivotCache') caches.push({ id: attr(a, 'cacheId') ?? '', rel: relId(a) ?? '' })
        else if (n === 'externalReference') externalRels.push(relId(a) ?? '')
        else if (n === 'workbookPr') date1904 = truthy(attr(a, 'date1904'))
        else if (n === 'workbookProtection') lockStructure = truthy(attr(a, 'lockStructure'))
        else if (n === 'fileSharing') sharingUser = attr(a, 'userName') ?? ''
        else if (n === 'workbookView') {
          const v = attr(a, 'visibility')
          if (v === 'hidden' || v === 'veryHidden') hiddenWindow = true
          if (attr(a, 'showSheetTabs') === '0' || attr(a, 'showSheetTabs') === 'false') tabsOff = true
        } else if (n === 'absPath') savedFrom = attr(a, 'url') ?? ''
      },
      text(t) {
        if (current && current.formula.length < TEXT * 5) current.formula += t
      },
    })
  }
  const relById = new Map(wbRels.map((r) => [r.id, r]))
  const sheetByName = new Map(sheets.map((s) => [s.name.toLowerCase(), s]))

  // Styles and theme, so formats and colours that hide values can be recognized.
  const themePart = wbRels.find((r) => r.type.endsWith('/theme'))?.target
  const theme = themeColours((themePart && (await text(ctx, themePart, 'the workbook’s colours'))) || '')
  const stylesPart = wbRels.find((r) => r.type.endsWith('/styles'))?.target
  const stylesXml = stylesPart ? await text(ctx, stylesPart, 'the workbook’s formats') : null
  const styles: CellStyle[] = stylesXml ? readStyles(stylesXml, theme) : []
  if (stylesPart && stylesXml === null) ctx.incomplete.push('Without the workbook’s formats, values hidden by a format or by their colour weren’t looked for.')

  // Shared text: which entries the cells use, so text no cell uses can be found.
  let used = new Uint8Array(1024)
  const useShared = (i: number) => {
    if (i >= SHARED_MAX) return
    if (i >= used.length) {
      const bigger = new Uint8Array(Math.min(SHARED_MAX, Math.max(i + 1, used.length * 2)))
      bigger.set(used)
      used = bigger
    }
    used[i] = 1
  }
  const memory = new SheetMemory()
  const base = { styles, useShared, date1904, memory }

  // Each sheet the workbook lists.
  const summaries: SheetSummary[] = []
  const scans: Scanned[] = []
  const tableNames = new Set<string>()
  const listed = new Set<string>()
  let index = 0
  for (const sheet of sheets) {
    index++
    const rel = relById.get(sheet.id)
    const part = rel?.target ?? ''
    const kind = sheetKind(rel?.type)
    const entry = part ? find(ctx, part) : undefined
    if (!entry) {
      ctx.incomplete.push(`The sheet “${sheet.name}” isn’t in the file where the workbook says it is, so it wasn’t checked.`)
      summaries.push({ name: sheet.name, state: sheet.state, kind, cells: 0, range: '', read: 'none' })
      scans.push({ sheet, part, kind, scan: null, rels: [] })
      continue
    }
    listed.add(entry.name.toLowerCase())
    const sheetRels = await rels(ctx, entry.name)
    if (kind === 'chart') {
      mark(ctx, entry.name, 'read', `the chart sheet “${sheet.name}”`)
      summaries.push({ name: sheet.name, state: sheet.state, kind, cells: 0, range: '', read: 'all' })
      scans.push({ sheet, part: entry.name, kind, scan: null, rels: sheetRels })
      continue
    }
    // Tables, whose styles colour cells in ways the cell's own format doesn't say, and whose filters hide rows.
    const styledAreas: Area[] = []
    let tableFilter = false
    for (const t of sheetRels.filter((r) => r.type.endsWith('/table'))) {
      await readXml(
        ctx,
        t.target,
        {
          tag(n, close, _self, a) {
            if (close) return
            if (n === 'table') {
              const ref = attr(a, 'ref')
              if (ref) styledAreas.push(...parseAreas(ref))
              for (const k of ['name', 'displayName']) {
                const v = attr(a, k)
                if (v) tableNames.add(v.toLowerCase())
              }
            } else if (n === 'filterColumn') tableFilter = true
          },
        },
        `a table on “${sheet.name}”`,
      )
    }
    ctx.progress.begin(`Reading “${sheet.name}” (sheet ${index} of ${sheets.length})`, entry)
    const s = await readSheet(ctx, entry, { ...base, styledAreas }, sheet.state !== 'visible', `the sheet “${sheet.name}”`)
    if (tableFilter) s.filter = true
    if (!s.complete) {
      const why = reason(s.error)
      if (isBudget(s.error)) ctx.unreached.push(s.cells || s.lastRow ? `the sheet “${sheet.name}” after row ${s.lastRow.toLocaleString()}` : `the sheet “${sheet.name}”`)
      else if (s.cells || s.lastRow) ctx.incomplete.push(`The sheet “${sheet.name}” was read only as far as row ${s.lastRow.toLocaleString()} (${why}): anything after that on it wasn’t checked.`)
      else ctx.incomplete.push(`The sheet “${sheet.name}” couldn’t be read (${why}), so nothing on it was checked.`)
    }
    summaries.push({ name: sheet.name, state: sheet.state, kind, cells: s.cells, range: s.bounds ? areaName(s.bounds) : '', read: readState(s) })
    scans.push({ sheet, part: entry.name, kind, scan: s, rels: sheetRels })
  }

  // Sheet parts the workbook doesn't list: Excel doesn't show them, but anyone reading the file another way can.
  const orphans: { entry: Entry; scan: SheetScan; rels: Rel[] }[] = []
  for (const e of ctx.byName.values()) {
    if (!/^xl\/(worksheets|macrosheets|dialogsheets)\/[^/]+\.xml$/i.test(e.name) || listed.has(e.name.toLowerCase())) continue
    ctx.progress.begin('Reading a sheet the workbook doesn’t list', e)
    const s = await readSheet(ctx, e, { ...base, styledAreas: [] }, true, 'a sheet the workbook doesn’t list')
    if (isBudget(s.error)) ctx.unreached.push(`${e.name}, a sheet the workbook doesn’t list`)
    orphans.push({ entry: e, scan: s, rels: await rels(ctx, e.name) })
  }
  const allScans = [...scans.flatMap((x) => (x.scan ? [x.scan] : [])), ...orphans.map((o) => o.scan)]
  const sheetsIncomplete = summaries.some((s) => s.kind !== 'chart' && s.read !== 'all') || orphans.some((o) => !o.scan.complete)

  // The shared text itself: the samples' text, and any text no cell uses.
  const samples: Cell[] = []
  for (const s of allScans) samples.push(...s.sample, ...s.hiddenRows.sample, ...s.hiddenCols.sample, ...s.unseen.sample, ...s.far.sample)
  const needed = new Set(samples.flatMap((c) => (c.shared !== undefined ? [c.shared] : [])))
  const strings = new Map<number, string>()
  const unused: string[] = []
  let unusedCount = 0
  let sharedRead = true
  const sstPart = wbRels.find((r) => r.type.endsWith('/sharedStrings'))?.target
  const sstEntry = sstPart ? find(ctx, sstPart) : undefined
  if (sstEntry) {
    let i = 0
    let inSi = false
    let inPhonetic = false
    let current = ''
    const finish = () => {
      const value = xstring(current)
      if (needed.has(i)) strings.set(i, value)
      if (!(i < used.length && used[i]) && value.trim() !== '') {
        unusedCount++
        if (unused.length < SAMPLE) unused.push(clip(value))
      }
      i++
      current = ''
    }
    const sc: Scanner = new Scanner({
      tag(n, close, self) {
        if (n === 'si') {
          if (close) {
            inSi = false
            finish()
          } else if (self) finish()
          else inSi = true
        } else if (n === 'rPh') inPhonetic = !close && !self
        else if (n === 't' && inSi && !inPhonetic) sc.wantText = !close && !self
      },
      text(t) {
        if (current.length < TEXT) current += t
      },
    })
    sharedRead = await streamPart(ctx, sstEntry, sc, 'the workbook’s shared text', 'Reading the workbook’s text')
    if (!sharedRead) ctx.incomplete.push('Without all of the shared text, some samples are missing their text, and text no cell uses wasn’t looked for.')
  }
  for (const c of samples) if (c.shared !== undefined) c.value = strings.get(c.shared) ?? (sharedRead ? '(no such text in the file)' : '(text not read)')

  // Drawings (shapes, pictures, charts) and the charts' copies of their data.
  const { drawings, charts } = await drawingsAndCharts(ctx, scans, orphans)

  // What each sheet hides.
  for (const { sheet, kind, scan: s } of scans) {
    const where = `“${sheet.name}”`
    const summary = summaries.find((x) => x.name === sheet.name)
    if (sheet.state !== 'visible') {
      const very = sheet.state === 'veryHidden'
      const kindWord = kind === 'chart' ? 'chart sheet' : kind === 'macro' ? 'macro sheet' : kind === 'dialog' ? 'dialog sheet' : 'sheet'
      const chartHere = charts.filter((c) => c.sheet === sheet.name)
      const content =
        kind === 'chart'
          ? `It holds a chart${chartHere.some((c) => c.points) ? ` with a copy of ${plural(chartHere.reduce((n, c) => n + c.points, 0), 'value')}` : ''}.`
          : summary?.read === 'none'
            ? `It couldn’t be read here (${reason(s?.error)}), so what it holds is unknown. Unhide it in Excel to look.`
            : summary?.read === 'part'
              ? `It holds at least ${plural(s?.cells ?? 0, 'cell')} with data; the rest of it couldn’t be read here (${reason(s?.error)}).`
              : s && s.cells
                ? `It holds ${plural(s.cells, 'cell')} with data${s.bounds ? `, in ${areaName(s.bounds)}` : ''}.`
                : 'It’s empty.'
      const empty = kind !== 'chart' && summary?.read === 'all' && !s?.cells
      findings.push({
        tier: empty ? 'note' : 'data',
        title: `${very ? 'Very hidden' : 'Hidden'} ${kindWord} ${where}`,
        detail: very ? `${content} It doesn’t appear in Excel’s Unhide list, but it’s in the file for anyone to read.` : `${content} Anyone can unhide it: right-click a sheet tab and choose Unhide.`,
        grid: s && s.sample.length ? grid(s.sample) : undefined,
        list: kind === 'chart' && chartHere.length ? chartHere.flatMap((c) => c.values).slice(0, SAMPLE) : undefined,
        fix: very
          ? 'Copy the sheets you mean to send into a new workbook (right-click each tab, Move or Copy, Create a copy, To book: new book) and send that. To unhide it instead, open the Visual Basic editor (Developer > Visual Basic, or Tools > Macro on a Mac), select the sheet, and set Visible to -1 - xlSheetVisible.'
          : 'Right-click a sheet tab, choose Unhide, then delete the sheet if it shouldn’t go (right-click its tab, Delete).',
      })
    }
    if (!s || sheet.state !== 'visible') continue
    if (s.hiddenRows.count) {
      const { text: listed, shown } = firstRuns(s.hiddenRows.rows, rowRuns)
      const extra = s.hiddenRows.count - shown
      findings.push({
        tier: 'data',
        title: `Hidden rows on ${where}`,
        detail: `${s.hiddenRows.count === 1 ? 'Row' : 'Rows'} ${listed}${extra > 0 ? ` and ${extra.toLocaleString()} more` : ''} ${s.hiddenRows.count === 1 ? 'is hidden and holds' : 'are hidden and hold'} ${plural(s.hiddenRows.cells, 'cell')} with data.${s.filter ? ' A filter is on, which hides rows too.' : ''}`,
        grid: grid(s.hiddenRows.sample),
        fix: 'Select the whole sheet (the corner above row 1), right-click a row number, and choose Unhide. Then delete the rows that shouldn’t go. If a filter is on, choose Data > Clear first.',
      })
    }
    if (s.hiddenCols.cols.length) {
      const { text: listed, shown } = firstRuns(s.hiddenCols.cols, colRuns)
      const extra = s.hiddenCols.cols.length - shown
      findings.push({
        tier: 'data',
        title: `Hidden columns on ${where}`,
        detail: `${s.hiddenCols.cols.length === 1 ? 'Column' : 'Columns'} ${listed}${extra > 0 ? ` and ${extra.toLocaleString()} more` : ''} ${s.hiddenCols.cols.length === 1 ? 'is hidden (or too narrow to see) and holds' : 'are hidden (or too narrow to see) and hold'} ${plural(s.hiddenCols.cells, 'cell')} with data.`,
        grid: grid(s.hiddenCols.sample),
        fix: 'Select the whole sheet (the corner above row 1), right-click a column letter, and choose Unhide. Then delete the columns that shouldn’t go.',
      })
    }
    if (s.far.cells) {
      const parts: string[] = []
      if (s.far.rows) parts.push(s.far.rows.after ? `below row ${s.far.rows.after}, after ${plural(s.far.rows.gap, 'empty row')}` : `from row ${s.far.rows.start}, with ${plural(s.far.rows.gap, 'empty row')} above it`)
      if (s.far.cols) parts.push(s.far.cols.after ? `right of column ${colName(s.far.cols.after)}, after ${plural(s.far.cols.gap, 'empty column')}` : `from column ${colName(s.far.cols.start)}, with ${plural(s.far.cols.gap, 'empty column')} before it`)
      findings.push({
        tier: 'data',
        title: `Data far from the rest on ${where}`,
        detail: `${plural(s.far.cells, 'cell')} with data ${s.far.cells === 1 ? 'sits' : 'sit'} ${parts.join(' and ')}, easy to miss when scrolling. (This page counts data as far away after at least ${FAR_ROWS} empty rows or ${FAR_COLS} empty columns.) Document Inspector doesn’t look for data placed far away like this.`,
        grid: grid(s.far.sample),
        fix: 'Press Ctrl+End (on a Mac, Fn+Control+→ or Control+End) to jump to the last cell with data, look at what’s there, and delete what shouldn’t go.',
      })
    }
    if (isBudget(s.far.error)) ctx.unreached.push(`data far from the rest on ${where}`)
    else if (s.far.error) ctx.incomplete.push(`Data far from the rest on ${where} was found but couldn’t be counted (${reason(s.far.error)}).`)
    if (s.unseen.cells) {
      const how = [s.unseen.byFormat ? `${plural(s.unseen.byFormat, 'cell')} with a number format such as ;;; that shows nothing` : '', s.unseen.byColour ? `${plural(s.unseen.byColour, 'cell')} with text coloured like its background` : '']
        .filter(Boolean)
        .join(', and ')
      findings.push({
        tier: 'data',
        title: `Values that can’t be seen on ${where}`,
        detail: `${how[0].toUpperCase()}${how.slice(1)}. The values are in the file, and show in the formula bar.`,
        list: s.unseen.sample.map((c) => `${refName(c.row, c.col)}: ${clip(c.value)}`),
        fix: 'Select the cells, then choose Home > Clear > Clear Formats (or set the number format to General and the font colour to Automatic). Delete what shouldn’t go.',
      })
    }
    if (s.lists.length) {
      const values = s.lists.flatMap((l) => l.values)
      findings.push({
        tier: 'data',
        title: `Drop-down lists on ${where}`,
        detail: `${s.lists.length === 1 ? 'A drop-down list' : `${s.lists.length} drop-down lists`} (${s.lists.map((l) => l.where || 'no range given').join('; ')}) ${s.lists.length === 1 ? 'offers' : 'offer'} ${plural(values.length, 'choice')} that show only when it’s opened.`,
        list: values.slice(0, SAMPLE).map((v) => clip(v)),
        fix: 'Select the cells, choose Data > Data Validation, and click Clear All.',
      })
    }
    if (s.headers.length)
      people.push({
        tier: 'people',
        title: `Header and footer text on ${where}`,
        detail: 'Printed at the top or bottom of each page, and not shown in the normal view.',
        list: s.headers.map((h) => clip(h)),
        fix: 'Choose Page Layout > Page Setup (or File > Print > Page Setup), open Header/Footer, and set both to (none).',
      })
    if (s.scenarioUsers.length)
      people.push({
        tier: 'people',
        title: `Scenarios on ${where}`,
        detail: `Saved what-if scenarios name who made them: ${s.scenarioUsers.join(', ')}.`,
        fix: 'Choose Data > What-If Analysis > Scenario Manager and delete them.',
      })
    if (s.cubeFormulas)
      notes.push({
        tier: 'note',
        title: `Cube formulas on ${where}`,
        detail: `${plural(s.cubeFormulas, 'cell')} ${s.cubeFormulas === 1 ? 'uses' : 'use'} a cube function (such as CUBEVALUE), which fetches values from a data model or a data connection. Where those are in the file, they’re listed here too.`,
      })
    if (s.protectedSheet)
      notes.push({ tier: 'note', title: `${where} is protected`, detail: 'Sheet protection only stops editing. It doesn’t stop anyone reading what’s hidden on the sheet.' })
    if (s.filter && !s.hiddenRows.count) notes.push({ tier: 'note', title: `A filter is on, on ${where}`, detail: 'It isn’t hiding any rows with data right now, but it can when it’s changed.' })
  }
  for (const { entry, scan: s } of orphans) {
    if (s.complete && !s.cells) continue
    findings.push({
      tier: 'data',
      title: 'A sheet the workbook doesn’t list',
      detail: `${entry.name} is a sheet that isn’t in the workbook’s list, so Excel doesn’t show it, but anyone reading the file another way can. ${s.complete ? `It holds ${plural(s.cells, 'cell')} with data${s.bounds ? `, in ${areaName(s.bounds)}` : ''}.` : `It couldn’t be read in full here (${reason(s.error)}); at least ${plural(s.cells, 'cell')} with data.`}`,
      grid: s.sample.length ? grid(s.sample) : undefined,
      fix: 'Copy the sheets you mean to send into a new workbook (right-click each tab, Move or Copy, Create a copy, To book: new book), or paste their values into one, and send that: a new workbook doesn’t carry the stray part.',
    })
  }

  // Charts keep a copy of the values they plot, which can outlive the cells they came from.
  for (const c of charts) {
    const sources = c.sheets.map((n) => ({ name: n, sheet: sheetByName.get(n.toLowerCase()) }))
    const gone = sources.filter((x) => !x.sheet).map((x) => x.name)
    const hidden = sources.filter((x) => x.sheet && x.sheet.state !== 'visible').map((x) => x.name)
    const onWhat = c.sheet ? `on “${c.sheet}”` : c.orphan ? 'in a part no sheet uses' : ''
    const kept = `It keeps a copy of ${plural(c.points, 'value')}`
    if (c.unread) ctx.incomplete.push(`A chart ${onWhat} couldn’t be read in full, so its copy of its data may be missing here.`)
    // A chart that keeps no values has nothing to give away, whatever it points at.
    if (!c.points) continue
    if (c.external)
      findings.push({ tier: 'data', title: 'A chart’s copy of another file’s data', detail: `A chart ${onWhat} plots data from another workbook. ${kept} from it, readable without the other file.`, list: c.values.slice(0, SAMPLE), fix: 'Select the chart and press Delete, or copy it and paste it as a picture.' })
    else if (gone.length)
      findings.push({
        tier: 'data',
        title: 'A chart’s copy of a deleted sheet’s data',
        detail: `A chart ${onWhat} plots data from ${list(gone.map((g) => `“${g}”`))}, which ${gone.length === 1 ? 'is' : 'are'} no longer in the workbook. ${kept}, still in the file.`,
        list: c.values.slice(0, SAMPLE),
        fix: 'Select the chart and press Delete, or copy it and paste it as a picture.',
      })
    else if (hidden.length)
      findings.push({
        tier: 'data',
        title: 'A chart’s copy of a hidden sheet’s data',
        detail: `A chart ${onWhat} plots data from the hidden ${hidden.length === 1 ? 'sheet' : 'sheets'} ${list(hidden.map((h) => `“${h}”`))}. ${kept}.`,
        list: c.values.slice(0, SAMPLE),
        fix: 'If the hidden sheet shouldn’t go, delete it and the chart, or paste the chart as a picture.',
      })
    else if (c.literal)
      notes.push({ tier: 'note', title: 'Values typed into a chart', detail: `A chart ${onWhat} has values typed into the chart itself rather than taken from cells: ${plural(c.points, 'value')}.`, list: c.values.slice(0, SAMPLE) })
  }

  // Pivot caches: a copy of the source data kept with a pivot table, even after its source sheet is deleted.
  const cacheParts = new Set<string>()
  for (const c of caches) {
    const target = relById.get(c.rel)?.target
    if (target) cacheParts.add(target.toLowerCase())
  }
  for (const k of ctx.byName.keys()) if (/^xl\/pivotcache\/pivotcachedefinition[^/]*\.xml$/.test(k)) cacheParts.add(k)
  const usedBy = new Map<string, string[]>()
  for (const { sheet, rels: sr } of scans) {
    for (const pt of sr.filter((r) => r.type.endsWith('/pivotTable'))) {
      mark(ctx, pt.target, 'structure', 'a pivot table’s layout (its data is in its cache)')
      const cache = (await rels(ctx, pt.target)).find((r) => r.type.endsWith('/pivotCacheDefinition'))?.target.toLowerCase()
      if (cache) usedBy.set(cache, [...(usedBy.get(cache) ?? []), sheet.name])
    }
  }
  for (const part of cacheParts) {
    const f = await pivotCache(ctx, part, sheetByName, tableNames, names, usedBy.get(part) ?? [])
    if (f) findings.push(f)
  }
  const slicers = await slicerCaches(ctx)
  if (slicers.length)
    findings.push({
      tier: 'data',
      title: 'A slicer’s list of values',
      detail: `${plural(slicers.length, 'slicer')} on data from a data model or a connection ${slicers.length === 1 ? 'keeps' : 'keep'} a list of ${plural(slicers.reduce((n, s) => n + s.count, 0), 'value')} to choose from.`,
      list: slicers.flatMap((s) => s.values).slice(0, SAMPLE),
      fix: 'Select the slicer and press Delete.',
    })

  // Cached copies of other workbooks.
  const externalPaths: string[] = []
  const linkParts = new Set<string>()
  for (const id of externalRels) {
    const target = relById.get(id)?.target
    if (target) linkParts.add(target.toLowerCase())
  }
  for (const k of ctx.byName.keys()) if (/^xl\/externallinks\/externallink[^/]*\.xml$/.test(k)) linkParts.add(k)
  for (const part of linkParts) {
    const f = await externalLink(ctx, part)
    if (!f) continue
    externalPaths.push(f.path)
    findings.push(f.finding)
  }

  // Names: ones that hold values themselves, hidden ones, and ones pointing to other files.
  const ownNames = names.filter((n) => !/^_xl(nm|fn|pm|eta|ws)\./i.test(n.name))
  const constantNames = ownNames.filter((n) => /^=?\s*("|\{)/.test(n.formula))
  if (constantNames.length)
    findings.push({
      tier: 'data',
      title: 'Names that hold values',
      detail: `${plural(constantNames.length, 'defined name')} ${constantNames.length === 1 ? 'holds' : 'hold'} text or a list of values, seen only in the Name Manager.`,
      list: constantNames.slice(0, SAMPLE).map((n) => `${n.name}: ${clip(n.formula)}`),
      fix: 'Choose Formulas > Name Manager, select them, and click Delete.',
    })
  const hiddenNames = ownNames.filter((n) => n.hidden)
  if (hiddenNames.length)
    notes.push({
      tier: 'note',
      title: 'Hidden names',
      detail: `${plural(hiddenNames.length, 'defined name')} ${hiddenNames.length === 1 ? 'is' : 'are'} hidden from the Name Manager. Add-ins such as Solver keep settings this way; others may point at data.`,
      list: hiddenNames.slice(0, SAMPLE).map((n) => `${n.name}: ${clip(n.formula)}`),
    })
  const linkedNames = ownNames.filter((n) => /\[\d+\]|\[[^\]]*\.xl\w*\]/i.test(n.formula))
  if (linkedNames.length)
    people.push({
      tier: 'people',
      title: 'Names that point to other files',
      detail: `${plural(linkedNames.length, 'defined name')} ${linkedNames.length === 1 ? 'refers' : 'refer'} to another workbook, which names where it was kept.`,
      list: linkedNames.slice(0, SAMPLE).map((n) => `${n.name}: ${clip(n.formula.replace(/\[(\d+)\]/g, (_m, k) => `[${externalPaths[Number(k) - 1] || k}]`))}`),
      fix: 'Choose Formulas > Name Manager and delete them, or Data > Edit Links (Workbook Links) > Break Link.',
    })

  // Comments and notes, and the people named in them.
  const commentAuthors = new Set<string>()
  const commentList: string[] = []
  let commentCount = 0
  const commentParts = new Set<string>()
  const persons = await personList(ctx, wbRels)
  const personNames = new Map(persons.map((p) => [p.id, p.name]))
  const threadAuthors = new Set<string>()
  const addComments = (got: Comments, label: string) => {
    for (const id of got.personIds ?? []) threadAuthors.add(id)
    commentCount += got.count
    for (const a of got.authors) commentAuthors.add(a)
    for (const item of got.items) if (commentList.length < SAMPLE) commentList.push(`${label} ${item}`)
  }
  for (const { sheet, rels: sr } of scans) {
    const legacy = sr.filter((r) => r.type.endsWith('/comments'))
    for (const c of legacy) {
      commentParts.add(c.target.toLowerCase())
      addComments(await comments(ctx, c.target), `“${sheet.name}”`)
    }
    for (const c of sr.filter((r) => /\/threadedComment$/i.test(r.type))) {
      commentParts.add(c.target.toLowerCase())
      // Excel keeps a plain copy of each threaded comment with the notes; read the threads only when it doesn't.
      if (legacy.length) mark(ctx, c.target, 'structure', 'threaded comments (their text is read from the notes’ copy)')
      else addComments(await threadedComments(ctx, c.target), `“${sheet.name}”`)
    }
    for (const v of sr.filter((r) => r.type.endsWith('/vmlDrawing'))) mark(ctx, v.target, 'structure', 'shapes for notes and form controls')
  }
  for (const [k, e] of ctx.byName) {
    if (commentParts.has(k)) continue
    if (/^xl\/comments[^/]*\.xml$/.test(k)) addComments(await comments(ctx, e.name), '(not on any sheet)')
    else if (/^xl\/threadedcomments\/[^/]+\.xml$/.test(k)) addComments(await threadedComments(ctx, e.name), '(not on any sheet)')
  }
  for (const id of threadAuthors) {
    const who = personNames.get(id)
    if (who) commentAuthors.add(who)
  }
  if (commentCount)
    people.push({
      tier: 'people',
      title: 'Comments and notes',
      detail: `${plural(commentCount, 'comment or note', 'comments and notes')}${commentAuthors.size ? `, by ${list([...commentAuthors].slice(0, 20))}` : ''}. They show when the pointer rests on a cell, and their authors’ names go with the file.`,
      list: commentList,
      fix: 'On each sheet, select the whole sheet (the corner above row 1), then choose Home > Clear > Clear Comments and Notes.',
    })
  if (persons.length)
    people.push({
      tier: 'people',
      title: 'People listed for comments',
      detail: 'The file keeps a list of the people who wrote threaded comments, with their account names.',
      list: persons.slice(0, SAMPLE).map((p) => p.label),
      fix: 'Delete the comments (Review > Delete); the list goes with them when the file is saved.',
    })

  // Drawings: hidden objects, text in shapes, and pictures.
  const hiddenObjects: string[] = []
  const shapeTexts: string[] = []
  const pictureSheets = new Map<string, Set<string>>()
  for (const d of drawings) {
    for (const t of d.hidden) hiddenObjects.push(`${d.label}: ${t}`)
    for (const t of d.texts) shapeTexts.push(`${d.label}: ${t}`)
    for (const img of d.images) if (d.sheet) pictureSheets.set(img, (pictureSheets.get(img) ?? new Set()).add(d.sheet))
  }
  if (hiddenObjects.length)
    findings.push({
      tier: 'data',
      title: 'Hidden shapes, pictures, and charts',
      detail: `${plural(hiddenObjects.length, 'object')} ${hiddenObjects.length === 1 ? 'is' : 'are'} hidden from view.`,
      list: hiddenObjects.slice(0, SAMPLE),
      fix: 'Choose Home > Find & Select > Selection Pane, click Show All, then select and delete what shouldn’t go.',
    })
  if (shapeTexts.length)
    notes.push({ tier: 'note', title: 'Text in shapes', detail: `${plural(shapeTexts.length, 'shape')} or text box with text, which a search of the cells won’t find.`, list: shapeTexts.slice(0, SAMPLE) })
  const media = [...ctx.byName.values()].filter((e) => /^xl\/media\//i.test(e.name))
  if (media.length) {
    const pictures: Picture[] = []
    let kept = 0
    for (const m of media) {
      mark(ctx, m.name, 'shown', 'a picture')
      const type = imageType(m.name)
      if (!type || pictures.length >= PICTURES || kept + m.size > PICTURE_BYTES) continue
      try {
        const b = await partBytes(ctx.file, m, PICTURE_BYTES, ctx.meter)
        kept += b.length
        pictures.push({ name: m.name.split('/').pop() ?? m.name, type, bytes: b })
      } catch (e) {
        rethrowAbort(e)
        failed(ctx, `A picture (${m.name})`, e)
      }
    }
    const where = [...new Set([...pictureSheets.values()].flatMap((s) => [...s]))]
    notes.push({
      tier: 'note',
      title: media.length === 1 ? 'A picture' : `${media.length} pictures`,
      detail: `${where.length ? `On ${list(where.map((w) => `“${w}”`))}. ` : ''}A picture can show data (a screenshot of a system, say), and this page can’t read what’s in one. Look at each.${pictures.length < media.length ? ` ${pictures.length ? `The first ${pictures.length} are shown here.` : 'They’re too big to show here.'}` : ''}`,
      pictures,
      fix: 'Click a picture and press Delete. Home > Find & Select > Selection Pane lists them all.',
    })
  }

  // Other places data hides.
  const modelEntry = ctx.byName.get('xl/model/item.data')
  if (modelEntry) {
    mark(ctx, modelEntry.name, 'not-read', 'the data model')
    findings.push({
      tier: 'data',
      title: 'A data model',
      detail: `The workbook stores a data model of ${size(modelEntry.size)}, which can hold whole tables of the data it was built from. This page can’t read inside it.`,
      fix: 'Choose Data > Manage Data Model (Power Pivot) to see and delete its tables, or copy the cells you mean to send into a new workbook as values.',
    })
  }
  const connections = await connectionList(ctx, wbRels)
  if (connections.length)
    people.push({
      tier: 'people',
      title: 'Data connections',
      detail: 'Connections name the files, servers, or sites the data was drawn from.',
      list: connections.slice(0, SAMPLE),
      fix: 'Choose Data > Queries & Connections, right-click each, and choose Delete.',
    })
  const query = await queries(ctx)
  if (query.sources.length || query.names.length)
    people.push({
      tier: 'people',
      title: 'Power Query queries',
      detail: `${plural(query.names.length || query.sources.length, 'query', 'queries')}${query.names.length ? ` (${list(query.names.slice(0, 6).map((n) => `“${clip(n)}”`))}${query.names.length > 6 ? ' and more' : ''})` : ''}${query.sources.length ? ' name where their data comes from' : ' are kept in the file'}.`,
      list: query.sources.slice(0, SAMPLE),
      fix: 'Choose Data > Queries & Connections, right-click each query, and choose Delete.',
    })
  if (query.tables.length)
    findings.push({
      tier: 'data',
      title: 'Data typed into a query',
      detail: `${plural(query.tables.length, 'Power Query table')} ${query.tables.length === 1 ? 'was' : 'were'} typed into Power Query itself (Enter Data), with ${plural(query.tables.reduce((n, t) => n + t.rows, 0), 'row')}, kept in the file whether or not it’s on a sheet.`,
      grid: query.tables[0].grid,
      fix: 'Choose Data > Queries & Connections, right-click the query, and choose Delete.',
    })
  const revision = await revisions(ctx)
  if (revision)
    findings.push({
      tier: 'data',
      title: 'Change history',
      detail: revision.detail,
      list: revision.sample,
      fix: 'Turn off sharing (Review > Share Workbook (Legacy), or Track Changes (Legacy) > Highlight Changes), then save a copy; or copy the sheets you mean to send into a new workbook.',
    })
  findings.push(...(await embeddings(ctx)))
  if (unusedCount) {
    if (revision) ctx.incomplete.push('Text no cell uses wasn’t looked for, because the change history may use it.')
    else if (sheetsIncomplete) ctx.incomplete.push('Text no cell uses wasn’t looked for, because not every sheet could be read in full: text a cell there uses could look unused.')
    else if (sharedRead)
      findings.push({
        tier: 'data',
        title: 'Text no cell uses',
        detail: `The file’s list of shared text holds ${plural(unusedCount, 'entry', 'entries')} that no cell uses, perhaps left from data that was deleted or changed. Excel doesn’t show them anywhere.`,
        list: unused,
        fix: 'Copy the cells you mean to send into a new workbook (Paste Special > Values) and send that.',
      })
  }

  // About the people and systems behind the file.
  const props = await properties(ctx)
  if (props.list.length)
    people.push({
      tier: 'people',
      title: 'Document properties',
      detail: 'Names and other details saved with the file, shown in File > Info or Properties.',
      list: props.list,
      fix: 'In Excel for Windows: File > Info > Check for Issues > Inspect Document, then Remove All next to Document Properties and Personal Information. In Excel for Mac: File > Properties, and clear each field.',
    })
  if (props.labels.length) people.push({ tier: 'people', title: 'Sensitivity label', detail: `The file carries a sensitivity label: ${props.labels.join(', ')}. Check it suits where the file is going.` })
  if (savedFrom)
    people.push({
      tier: 'people',
      title: 'The folder it was saved in',
      detail: `Excel records the folder the file was last saved in: ${clipTo(savedFrom, 200)}`,
      fix: 'Document Inspector’s Document Properties and Personal Information removes it; or save a copy from a folder whose name doesn’t matter.',
    })
  if (sharingUser) people.push({ tier: 'people', title: 'A name in the file’s sharing settings', detail: `The file’s read-only setting was saved by ${clipTo(sharingUser, 120)}.` })
  const hyperlinks: string[] = []
  for (const { rels: sr } of [...scans, ...orphans]) for (const h of sr.filter((r) => r.type.endsWith('/hyperlink') && r.external)) if (!hyperlinks.includes(h.target)) hyperlinks.push(h.target)
  const internalLinks = hyperlinks.filter((h) => /^(file:|\\\\|[a-z]:\\|mailto:)/i.test(h))
  if (internalLinks.length)
    people.push({
      tier: 'people',
      title: 'Links to files and email addresses',
      detail: `${plural(internalLinks.length, 'link')} ${internalLinks.length === 1 ? 'points' : 'point'} to a file, a shared drive, or an email address.`,
      list: internalLinks.slice(0, SAMPLE).map((h) => clip(h)),
      fix: 'Right-click a link and choose Remove Hyperlink (select the cells first to remove several).',
    })
  const printers = await printerNames(ctx)
  if (printers.length)
    people.push({ tier: 'people', title: 'Printer names', detail: 'Print settings saved with the sheets name the printer they were set up for.', list: printers.slice(0, SAMPLE), fix: 'Document Inspector’s Document Properties and Personal Information removes the printer path.' })
  const users = await userNames(ctx)
  if (users.length) people.push({ tier: 'people', title: 'People who opened the shared workbook', detail: 'A shared workbook keeps the names of people who had it open.', list: users.slice(0, SAMPLE) })
  const custom = await customXml(ctx)
  if (custom.length)
    notes.push({ tier: 'note', title: 'Custom data', detail: 'Data stored by SharePoint, an add-in, or another program, which Excel doesn’t show.', list: custom.slice(0, SAMPLE), fix: 'Document Inspector’s Custom XML Data removes it (Excel for Windows).' })
  const thumbnail = [...ctx.byName.values()].find((e) => /^docprops\/thumbnail\./i.test(e.name))
  if (thumbnail) {
    mark(ctx, thumbnail.name, 'shown', 'a preview picture')
    const type = imageType(thumbnail.name)
    let b: Uint8Array | null = null
    if (type && thumbnail.size < 8_000_000)
      b = await partBytes(ctx.file, thumbnail, 8_000_000, ctx.meter).catch((e) => {
        rethrowAbort(e)
        return null
      })
    notes.push({
      tier: 'note',
      title: 'A preview picture',
      detail: `A small picture of the first sheet, saved for file browsers. It shows the sheet as it was when saved.${type ? '' : ' It’s in a format this page can’t show.'}`,
      pictures: b && type ? [{ name: 'Preview', type, bytes: b }] : undefined,
      fix: 'In Excel for Windows, File > Info > Properties > Advanced Properties, untick Save Thumbnails, and save again; on a Mac, untick Save preview picture in File > Properties.',
    })
  }

  // Notes about the file as a whole.
  if (ctx.byName.has('xl/vbaproject.bin'))
    notes.push({ tier: 'note', title: 'Macros', detail: 'The workbook has macros (VBA). Their code isn’t read here, and it can hold text and data of its own.', fix: 'Save a copy as Excel Workbook (.xlsx), which leaves the macros out.' })
  if (lockStructure)
    notes.push({ tier: 'note', title: 'The workbook’s structure is protected', detail: 'That stops sheets being unhidden from Excel’s menus, but not anyone reading them: the protection doesn’t hide what’s in the file.' })
  if (tabsOff) notes.push({ tier: 'note', title: 'Sheet tabs are turned off', detail: 'Other sheets are easy to miss when the tabs don’t show.', fix: 'Choose File > Options > Advanced (Excel > Preferences > View on a Mac) and turn on Show sheet tabs.' })
  if (hiddenWindow) notes.push({ tier: 'note', title: 'The workbook’s window is hidden', detail: 'Excel opens the file without showing it.', fix: 'Choose View > Unhide.' })

  // Every part of the file, and what this page doesn't look inside.
  const parts: Part[] = []
  const notReadKinds = new Map<string, number>()
  const unknown: Entry[] = []
  for (const e of ctx.byName.values()) {
    const key = e.name.toLowerCase()
    let p = ctx.parts.get(key)
    if (!p) {
      const s = STRUCTURE.find(([re]) => re.test(key))
      const n = s ? undefined : NOT_READ.find(([re]) => re.test(key))
      p = s ? { role: 'structure', what: s[1] } : n ? { role: 'not-read', what: n[1] } : { role: 'not-read', what: 'a part this page doesn’t recognize' }
      if (n) notReadKinds.set(n[2], (notReadKinds.get(n[2]) ?? 0) + 1)
      else if (!s) unknown.push(e)
    }
    parts.push({ name: e.name, size: e.size, ...p })
  }
  parts.sort((a, b) => a.name.localeCompare(b.name))
  const notRead: string[] = [...notReadKinds.keys()]
  if (media.length) notRead.push('What’s in the pictures: look at each one.')
  if (unknown.length)
    notRead.push(`${plural(unknown.length, 'part')} this page doesn’t recognize, listed with the file’s parts: ${unknown.slice(0, 6).map((e) => `${e.name} (${size(e.size)})`).join(', ')}${unknown.length > 6 ? ', and more' : ''}.`)
  if (ctx.unreached.length)
    ctx.incomplete.push(`The check stopped after reading ${size(ctx.budget)}, the most it reads from one file, so these weren’t checked: ${list(ctx.unreached.slice(0, 6))}${ctx.unreached.length > 6 ? `, and ${ctx.unreached.length - 6} more` : ''}.`)

  return {
    name: fileName,
    size: ctx.file.size,
    format: formatName(contentTypes, main),
    sheets: summaries,
    findings: [...findings, ...people, ...notes],
    incomplete: ctx.incomplete,
    notRead,
    parts,
  }
}

// Parts, by kind.

async function pivotCache(ctx: Context, part: string, sheetByName: Map<string, SheetEntry>, tableNames: Set<string>, names: Name[], usedBy: string[]): Promise<Finding | null> {
  const entry = find(ctx, part)
  if (!entry) return null
  const fields: { name: string; items: string[]; count: number; inRecords: boolean }[] = []
  let recordsRel = ''
  let refreshedBy = ''
  let saveData = true
  let source = ''
  let sourceSheet = ''
  let sourceName = ''
  let sourceExternal = ''
  let sourceType = ''
  let inShared = false
  let inGroup = false
  let field: (typeof fields)[number] | null = null
  const sc = new Scanner({
    tag(n, close, self, a) {
      if (n === 'pivotCacheDefinition' && !close) {
        recordsRel = relId(a) ?? ''
        refreshedBy = attr(a, 'refreshedBy') ?? ''
        saveData = !['0', 'false'].includes(attr(a, 'saveData') ?? '')
      } else if (n === 'cacheSource' && !close) sourceType = attr(a, 'type') ?? ''
      else if (n === 'worksheetSource' && !close) {
        sourceSheet = attr(a, 'sheet') ?? ''
        sourceName = attr(a, 'name') ?? ''
        source = attr(a, 'ref') ?? ''
        sourceExternal = relId(a) ?? ''
      } else if (n === 'cacheField') {
        if (close) field = null
        else {
          field = { name: attr(a, 'name') ?? '', items: [], count: 0, inRecords: attr(a, 'databaseField') !== '0' && attr(a, 'formula') === undefined }
          fields.push(field)
          if (self) field = null
        }
      } else if (n === 'sharedItems') inShared = !close && !self
      else if (n === 'fieldGroup') inGroup = !close && !self
      else if (field && inShared && !inGroup && !close && n.length === 1 && 'sndbem'.includes(n)) {
        field.count++
        if (field.items.length < FIELD_ITEMS) field.items.push(itemValue(n, attr(a, 'v') ?? ''))
      }
    },
  })
  if (!(await streamPart(ctx, entry, sc, 'a pivot table’s cache', 'Reading a pivot table’s cache'))) return null
  const partRels = await rels(ctx, entry.name)
  // The records: the source rows themselves.
  const recordFields = fields.filter((f) => f.inRecords)
  let records = 0
  const sample: string[][] = []
  const recordsPart = partRels.find((r) => r.id === recordsRel)?.target ?? partRels.find((r) => r.type.endsWith('/pivotCacheRecords'))?.target
  const recordsEntry = recordsPart ? find(ctx, recordsPart) : undefined
  if (recordsEntry) {
    let row: string[] | null = null
    const rec = new Scanner({
      tag(n, close, self, a) {
        if (n === 'r') {
          if (close) {
            records++
            if (row && sample.length < 6) sample.push(row)
            row = null
          } else if (self) records++
          else row = records < 6 ? [] : null
        } else if (row && !close && n.length === 1 && 'xsndbem'.includes(n)) {
          const v = attr(a, 'v') ?? ''
          const f = recordFields[row.length]
          row.push(n === 'x' ? (f?.items[Number(v)] ?? `(item ${v})`) : itemValue(n, v))
        }
      },
    })
    await streamPart(ctx, recordsEntry, rec, 'a pivot table’s copy of its data', 'Reading a pivot table’s copy of its data')
  }
  const external = sourceExternal ? partRels.find((r) => r.id === sourceExternal)?.target : undefined
  const src = sourceSheet ? sheetByName.get(sourceSheet.toLowerCase()) : undefined
  const ghost = !external && (sourceSheet ? !src : sourceName ? !tableNames.has(sourceName.toLowerCase()) && !names.some((x) => x.name.toLowerCase() === sourceName.toLowerCase()) : false)
  const from = external
    ? `another file (${clipTo(safeDecode(external), 120)})`
    : sourceSheet
      ? `${src && src.state !== 'visible' ? 'the hidden sheet ' : ''}“${sourceSheet}”${source ? ` ${source}` : ''}`
      : sourceName
        ? `“${sourceName}”`
        : sourceType === 'external'
          ? 'a data connection'
          : 'its source'
  const columns = fields.map((f) => f.name).filter(Boolean)
  const distinct = fields.filter((f) => f.count > 0)
  if (!records && !distinct.length) return null
  const rowsText = records
    ? `It keeps ${plural(records, 'row')} copied from ${from}, with the columns ${list(columns.slice(0, 8))}${columns.length > 8 ? ` and ${columns.length - 8} more` : ''}.`
    : `Its rows from ${from} aren’t saved${saveData ? '' : ' (Save source data with file is off)'}, but each column’s different values are: ${list(distinct.slice(0, 4).map((f) => `${f.count.toLocaleString()} in ${f.name}`))}.`
  const shown: Grid | undefined = sample.length
    ? { head: recordFields.slice(0, 8).map((f) => f.name), rows: sample.map((r) => r.slice(0, 8).map((v) => clip(v))) }
    : { head: distinct.slice(0, 8).map((f) => f.name), rows: Array.from({ length: Math.min(6, Math.max(...distinct.map((f) => f.items.length))) }, (_, i) => distinct.slice(0, 8).map((f) => clip(f.items[i] ?? ''))) }
  return {
    tier: 'data',
    title: `A pivot table’s copy of ${from}`,
    detail: [
      rowsText,
      ghost ? 'The sheet it came from is no longer in the workbook, but this copy is.' : '',
      usedBy.length ? `Used by a pivot table on ${list([...new Set(usedBy)].map((s) => `“${s}”`))}; double-clicking a total there shows the rows behind it.` : 'No pivot table uses it any more, but it’s still in the file.',
      refreshedBy ? `Last refreshed by ${clipTo(refreshedBy, 80)}.` : '',
    ]
      .filter(Boolean)
      .join(' '),
    grid: shown,
    fix: usedBy.length
      ? 'Click the pivot table, choose PivotTable Analyze > Options > Data, untick Save source data with file (and Enable show details), and set Number of items to retain per field to None; then refresh it. Or copy the pivot table and paste it as values into a new workbook.'
      : 'Copy the sheets you mean to send into a new workbook, as values (Paste Special > Values).',
  }
}

function itemValue(kind: string, v: string): string {
  if (kind === 'd') return v.replace(/T00:00:00(\.0+)?Z?$/, '').replace('T', ' ')
  if (kind === 'b') return v === '1' || v === 'true' ? 'TRUE' : 'FALSE'
  if (kind === 'm') return ''
  return v
}

/** Slicers on a data model or connection keep the values they offer; others take them from a pivot cache or a table. */
async function slicerCaches(ctx: Context): Promise<{ count: number; values: string[] }[]> {
  const out: { count: number; values: string[] }[] = []
  for (const e of [...ctx.byName.values()].filter((x) => /^xl\/slicercaches\/[^/]+\.xml$/i.test(x.name))) {
    let olap = false
    const got = { count: 0, values: [] as string[] }
    await readXml(
      ctx,
      e.name,
      {
        tag(n, close, _self, a) {
          if (n === 'olap') olap = !close
          else if (olap && n === 'i' && !close) {
            got.count++
            const v = attr(a, 'c') ?? attr(a, 'n')
            if (v && got.values.length < SAMPLE) got.values.push(clip(v))
          }
        },
      },
      'a slicer’s list of values',
    )
    if (got.count) out.push(got)
    else mark(ctx, e.name, 'structure', 'a slicer’s settings (its choices come from a pivot cache or a table)')
  }
  return out
}

async function externalLink(ctx: Context, part: string): Promise<{ path: string; finding: Finding } | null> {
  const entry = find(ctx, part)
  if (!entry) return null
  const partRels = await rels(ctx, entry.name)
  const sheetNames: string[] = []
  const cached: string[] = []
  let cells = 0
  let bookRel = ''
  let sheetName = ''
  let row = 0
  let ref = ''
  let value = ''
  let inValue = false
  let dde = ''
  const sc: Scanner = new Scanner({
    tag(n, close, self, a) {
      if (n === 'externalBook' && !close) bookRel = relId(a) ?? ''
      else if (n === 'sheetName' && !close) sheetNames.push(attr(a, 'val') ?? '')
      else if (n === 'sheetData' && !close) sheetName = sheetNames[Number(attr(a, 'sheetId'))] ?? ''
      else if (n === 'row' && !close) row = Number(attr(a, 'r')) || row + 1
      else if (n === 'cell') {
        if (close || self) {
          if (value !== '') {
            cells++
            if (cached.length < SAMPLE) cached.push(`${sheetName ? `${sheetName}!` : ''}${ref || `row ${row}`}: ${clip(xstring(value))}`)
          }
          value = ''
          if (self) ref = attr(a, 'r') ?? ''
        } else {
          ref = attr(a, 'r') ?? ''
          value = ''
        }
      } else if (n === 'v') {
        inValue = !close && !self
        sc.wantText = inValue
      } else if (n === 'ddeLink' && !close) dde = `${attr(a, 'ddeService') ?? ''}|${attr(a, 'ddeTopic') ?? ''}`
      else if (n === 'oleLink' && !close) dde = attr(a, 'progId') ?? 'an OLE link'
    },
    text(t) {
      if (inValue && value.length < TEXT) value += t
    },
  })
  await streamPart(ctx, entry, sc, 'a link to another file', 'Reading a linked file’s cached copy')
  const target = partRels.find((r) => r.id === bookRel)?.target ?? partRels.find((r) => r.external)?.target ?? ''
  const path = target ? safeDecode(target.replace(/^file:\/\/\/?/i, '')) : dde
  return {
    path,
    finding: {
      tier: cells ? 'data' : 'people',
      title: cells ? 'A cached copy of a linked file' : 'A link to another file',
      detail: `${path ? `Formulas link to ${clipTo(path, 200)}. ` : ''}${cells ? `The workbook keeps a copy of ${plural(cells, 'value')} from it${sheetNames.length ? `, from ${list(sheetNames.slice(0, 4).map((s) => `“${s}”`))}` : ''}, readable without the other file.` : 'The link names the file and where it was kept.'}`,
      list: cached,
      fix: 'Choose Data > Edit Links (Workbook Links in newer Excel) and click Break Link (Break All).',
    },
  }
}

interface Comments {
  count: number
  authors: string[]
  items: string[]
  /** For threaded comments: who wrote them, by their id in the list of people. */
  personIds?: string[]
}

async function comments(ctx: Context, part: string): Promise<Comments> {
  const authors: string[] = []
  const items: string[] = []
  let count = 0
  let inAuthor = false
  let author = ''
  let inText = false
  let inPhonetic = false
  let current: { ref: string; author: number; text: string } | null = null
  await readXml(
    ctx,
    part,
    {
      tag(n, close, self, a) {
        if (n === 'author') {
          if (close) {
            authors.push(xstring(author))
            inAuthor = false
          } else if (self) authors.push('')
          else {
            inAuthor = true
            author = ''
          }
        } else if (n === 'comment') {
          if (close && current) {
            count++
            const by = authors[current.author] ?? ''
            // A threaded comment's plain copy: its own text is a placeholder followed by the comment.
            const body = xstring(current.text).replace(/^\[Threaded comment\][\s\S]*?Comment:\s*/i, '')
            if (items.length < SAMPLE) items.push(`${current.ref}${by && !by.startsWith('tc=') ? ` (${clipTo(by, 60)})` : ''}: ${clip(body)}`)
            current = null
          } else if (!close) current = { ref: attr(a, 'ref') ?? '', author: Number(attr(a, 'authorId') ?? 0), text: '' }
        } else if (n === 'text') inText = !close && !self
        else if (n === 'rPh') inPhonetic = !close && !self
      },
      text(t) {
        if (inAuthor && author.length < TEXT) author += t
        else if (inText && current && !inPhonetic && current.text.length < TEXT) current.text += t
      },
    },
    'comments and notes',
  )
  return { count, authors: authors.filter((a) => a && !a.startsWith('tc=')), items }
}

async function threadedComments(ctx: Context, part: string): Promise<Comments> {
  const items: string[] = []
  const personIds = new Set<string>()
  let count = 0
  let current: { ref: string; text: string } | null = null
  let inText = false
  await readXml(
    ctx,
    part,
    {
      tag(n, close, self, a) {
        if (n === 'threadedComment') {
          if (close && current) {
            count++
            if (items.length < SAMPLE) items.push(`${current.ref}: ${clip(xstring(current.text))}`)
            current = null
          } else if (!close) {
            current = { ref: attr(a, 'ref') ?? '', text: '' }
            const person = attr(a, 'personId')
            if (person && personIds.size < 1000) personIds.add(person.toLowerCase())
            if (self) {
              count++
              current = null
            }
          }
        } else if (n === 'text') inText = !close && !self
      },
      text(t) {
        if (inText && current && current.text.length < TEXT) current.text += t
      },
    },
    'threaded comments',
  )
  return { count, authors: [], items, personIds: [...personIds] }
}

async function personList(ctx: Context, wbRels: Rel[]): Promise<{ id: string; name: string; label: string }[]> {
  const part = wbRels.find((r) => /\/person$/i.test(r.type))?.target ?? (ctx.byName.has('xl/persons/person.xml') ? 'xl/persons/person.xml' : '')
  const out: { id: string; name: string; label: string }[] = []
  if (!part) return out
  await readXml(
    ctx,
    part,
    {
      tag(n, close, _self, a) {
        if (n !== 'person' || close || out.length >= 1000) return
        const name = clipTo(attr(a, 'displayName') ?? '', 80)
        const user = attr(a, 'userId') ?? ''
        if (name || user) out.push({ id: (attr(a, 'id') ?? '').toLowerCase(), name, label: clipTo(user && user !== name ? `${name} (${user})` : name, 120) })
      },
    },
    'the people who wrote threaded comments',
  )
  return out
}

interface Drawing {
  label: string
  sheet: string | null
  hidden: string[]
  texts: string[]
  images: string[]
}

interface ChartInfo {
  sheet: string | null
  /** In a part no sheet's drawing uses. */
  orphan: boolean
  /** The sheets its formulas take data from. */
  sheets: string[]
  external: boolean
  /** Values typed into the chart rather than taken from cells. */
  literal: boolean
  points: number
  values: string[]
  unread: boolean
}

const ANCHORS = new Set(['twoCellAnchor', 'oneCellAnchor', 'absoluteAnchor'])
const OBJECT_KINDS: Record<string, string> = { sp: 'a shape', pic: 'a picture', graphicFrame: 'a chart or graphic', grpSp: 'a group of shapes', cxnSp: 'a line', contentPart: 'ink' }

/** Every drawing (on sheets, on chart sheets, and in parts no sheet uses) and every chart, each read once. */
async function drawingsAndCharts(ctx: Context, scans: Scanned[], orphans: { rels: Rel[] }[]): Promise<{ drawings: Drawing[]; charts: ChartInfo[] }> {
  const drawings: Drawing[] = []
  const charts: ChartInfo[] = []
  const seenDrawings = new Set<string>()
  const seenCharts = new Set<string>()
  const readChart = async (target: string, sheet: string | null, orphan: boolean) => {
    const key = target.toLowerCase()
    if (seenCharts.has(key)) return
    seenCharts.add(key)
    const c = await chart(ctx, target, sheet, orphan)
    if (c) charts.push(c)
  }
  const readDrawing = async (target: string, sheet: string | null, label: string) => {
    const key = target.toLowerCase()
    if (seenDrawings.has(key) || !find(ctx, target)) return
    seenDrawings.add(key)
    const d = await drawing(ctx, target, sheet, label)
    drawings.push(d.drawing)
    for (const c of d.charts) await readChart(c, sheet, false)
  }
  for (const { sheet, rels: sr } of scans) {
    for (const d of sr.filter((r) => r.type.endsWith('/drawing'))) await readDrawing(d.target, sheet.name, `“${sheet.name}”`)
    // A sheet's background picture.
    const images = sr.filter((r) => r.type.endsWith('/image')).map((r) => r.target.toLowerCase())
    if (images.length) drawings.push({ label: `“${sheet.name}”`, sheet: sheet.name, hidden: [], texts: [], images })
  }
  for (const o of orphans) for (const d of o.rels.filter((r) => r.type.endsWith('/drawing'))) await readDrawing(d.target, null, 'a sheet the workbook doesn’t list')
  for (const [k, e] of ctx.byName) if (/^xl\/drawings\/drawing[^/]*\.xml$/.test(k) && !seenDrawings.has(k)) await readDrawing(e.name, null, 'a drawing no sheet uses')
  for (const [k, e] of ctx.byName) if (/^xl\/charts\/chart(ex)?[^/]*\.xml$/.test(k) && !seenCharts.has(k)) await readChart(e.name, null, true)
  return { drawings, charts }
}

async function drawing(ctx: Context, part: string, sheet: string | null, label: string): Promise<{ drawing: Drawing; charts: string[] }> {
  const out: Drawing = { label, sheet, hidden: [], texts: [], images: [] }
  const charts: string[] = []
  const partRels = await rels(ctx, part)
  for (const r of partRels) {
    if (r.type.endsWith('/image')) out.images.push(r.target.toLowerCase())
    else if (/\/chart(Ex)?$/i.test(r.type)) charts.push(r.target)
  }
  let fallback = 0
  let anchor: { kind: string; hidden: boolean; name: string; descr: string; text: string } | null = null
  let inText = false
  await readXml(
    ctx,
    part,
    {
      tag(n, close, self, a) {
        // Office writes some objects twice, a new form and a fallback for older programs; the fallback is skipped.
        if (n === 'Fallback') {
          if (!self) fallback += close ? -1 : 1
          return
        }
        if (fallback > 0) return
        if (ANCHORS.has(n)) {
          if (!close && !self) anchor = { kind: '', hidden: false, name: '', descr: '', text: '' }
          else if (close && anchor) {
            const t = clipTo(anchor.text.replace(/\s+/g, ' ').trim(), 160)
            if (anchor.hidden) {
              const about = t || clipTo(anchor.descr, 160)
              out.hidden.push(`${OBJECT_KINDS[anchor.kind] ?? 'an object'}${anchor.name ? ` (${clipTo(anchor.name, 60)})` : ''}${about ? `: ${about}` : ''}`)
            } else if (t) out.texts.push(t)
            anchor = null
          }
          return
        }
        if (!anchor) return
        if (close) {
          if (n === 't') inText = false
          else if (n === 'p') anchor.text += ' '
          return
        }
        if (!anchor.kind && OBJECT_KINDS[n]) anchor.kind = n
        if (n === 'cNvPr') {
          if (truthy(attr(a, 'hidden'))) anchor.hidden = true
          if (!anchor.name) anchor.name = attr(a, 'name') ?? ''
          if (!anchor.descr) anchor.descr = attr(a, 'descr') ?? ''
        } else if (n === 't') inText = !self
      },
      text(t) {
        if (inText && anchor && anchor.text.length < TEXT) anchor.text += t
      },
    },
    `the drawing on ${label}`,
  )
  return { drawing: out, charts }
}

/** A chart's formulas (where its data comes from) and its cached points (a copy of that data). */
async function chart(ctx: Context, part: string, sheet: string | null, orphan: boolean): Promise<ChartInfo | null> {
  const entry = find(ctx, part)
  if (!entry) return null
  const info: ChartInfo = { sheet, orphan, sheets: [], external: false, literal: false, points: 0, values: [], unread: false }
  const refs: string[] = []
  let inF = false
  let f = ''
  let inPt = false
  let pt = ''
  const ok = await readXml(
    ctx,
    entry.name,
    {
      tag(n, close, self) {
        if (n === 'f') {
          if (close && inF) refs.push(f)
          inF = !close && !self
          f = ''
        } else if (n === 'pt') {
          if (close && inPt) {
            const v = xstring(pt).trim()
            if (v) {
              info.points++
              if (info.values.length < SAMPLE * 2 && !info.values.includes(clip(v))) info.values.push(clip(v))
            }
          }
          inPt = !close && !self
          pt = ''
        } else if ((n === 'strLit' || n === 'numLit') && !close) info.literal = true
      },
      text(t) {
        if (inF) {
          if (f.length < 1000) f += t
        } else if (inPt && pt.length < TEXT) pt += t
      },
    },
    sheet ? `a chart on “${sheet}”` : 'a chart',
  )
  info.unread = !ok
  for (const r of refs) {
    for (const m of xstring(r).matchAll(/(?:'((?:[^']|'')+)'|([^\s'!(),=+\-*/^&;{}]+))!/g)) {
      const name = (m[1] ?? m[2]).replace(/''/g, "'")
      if (/\[[^\]]*\]/.test(name)) info.external = true
      else if (!info.sheets.includes(name)) info.sheets.push(name)
    }
  }
  return info
}

async function connectionList(ctx: Context, wbRels: Rel[]): Promise<string[]> {
  const part = wbRels.find((r) => r.type.endsWith('/connections'))?.target
  const out: string[] = []
  if (!part) return out
  let name = ''
  const add = (source: string) => {
    if (out.length >= 200) return
    const s = source.replace(/((?:password|pwd)\s*=\s*)("[^"]*"|[^;]*)/gi, '$1•••')
    out.push(`${name ? `${clipTo(name, 60)}: ` : ''}${clipTo(s, 160)}`)
  }
  await readXml(
    ctx,
    part,
    {
      tag(n, close, _self, a) {
        if (close) return
        if (n === 'connection') {
          name = attr(a, 'name') ?? ''
          const odc = attr(a, 'odcFile') ?? attr(a, 'sourceFile')
          if (odc) add(odc)
        } else if (n === 'dbPr') {
          const c = attr(a, 'connection')
          if (c) add(c)
          const command = attr(a, 'command')
          if (command && /\s/.test(command)) add(command)
        } else if (n === 'webPr' || n === 'dataFeedPr') {
          const u = attr(a, 'url')
          if (u) add(u)
        } else if (n === 'textPr') {
          const f = attr(a, 'sourceFile')
          if (f) add(f)
        }
      },
    },
    'the workbook’s data connections',
  )
  return [...new Set(out)]
}

/** Power Query: the queries' names, the files and sites they read, and tables typed into them. */
async function queries(ctx: Context): Promise<{ names: string[]; sources: string[]; tables: { rows: number; grid: Grid }[] }> {
  const out = { names: [] as string[], sources: [] as string[], tables: [] as { rows: number; grid: Grid }[] }
  for (const [k, e] of ctx.byName) {
    if (!/^customxml\/item\d*\.xml$/.test(k)) continue
    // Excel writes this part in UTF-16; its first bytes say whether it's Power Query's.
    let start: Uint8Array
    try {
      start = await partHead(ctx.file, e, 1024)
    } catch (err) {
      rethrowAbort(err)
      mark(ctx, e.name, 'not-read', 'custom data')
      failed(ctx, 'A part of custom data', err)
      continue
    }
    if (!/DataMashup/.test(new TextDecoder(encodingOf(start)).decode(start))) continue
    const xml = await text(ctx, e.name, 'Power Query’s queries')
    if (xml === null) continue
    try {
      const b64 = xml.replace(/^[\s\S]*?<(?:\w+:)?DataMashup\b[^>]*>/, '').replace(/<\/(?:\w+:)?DataMashup>[\s\S]*$/, '').replace(/\s+/g, '')
      const raw = fromBase64(b64)
      // Its layout (MS-QDEFF): a version, then the length of a zip of the queries' files, then that zip.
      const length = new DataView(raw.buffer, raw.byteOffset, raw.byteLength).getUint32(4, true)
      const pkg = new Blob([raw.subarray(8, 8 + length) as BlobPart])
      const section = (await entries(pkg)).find((x) => /^formulas\/section1\.m$/i.test(x.name))
      if (!section) throw new Error('no queries')
      const m = new TextDecoder().decode(await partBytes(pkg, section, WHOLE, ctx.meter))
      for (const q of m.matchAll(/shared\s+(#"(?:[^"]|"")*"|[A-Za-z_][\w.]*)\s*=/g)) if (out.names.length < 200) out.names.push(q[1].replace(/^#"|"$/g, '').replace(/""/g, '"'))
      const fn =
        /\b(File\.Contents|Folder\.(?:Files|Contents)|Web\.(?:Contents|Page)|Sql\.Databases?|SharePoint\.(?:Files|Contents|Tables)|OData\.Feed|Odbc\.(?:DataSource|Query)|Oracle\.Database|PostgreSQL\.Database|MySQL\.Database|Access\.Database|AccessDatabase|Excel\.Workbook\(File\.Contents)\s*\(\s*"((?:[^"]|"")*)"(?:\s*,\s*"((?:[^"]|"")*)")?/g
      for (const s of m.matchAll(fn)) if (out.sources.length < 200) out.sources.push(clipTo(`${s[2]}${s[3] ? ` (${s[3]})` : ''}`.replace(/""/g, '"'), 160))
      for (const t of m.matchAll(/Binary\.FromText\("([A-Za-z0-9+/=]+)"/g)) {
        const table = await typedTable(t[1], ctx.meter)
        if (table) out.tables.push(table)
      }
    } catch (err) {
      rethrowAbort(err)
      ctx.incomplete.push('Power Query’s queries are in the file, but they couldn’t be read (that part is damaged).')
    }
  }
  out.sources = [...new Set(out.sources)]
  return out
}

/** A table typed into Power Query: JSON rows, deflated, in base64. */
async function typedTable(b64: string, meter: Meter): Promise<{ rows: number; grid: Grid } | null> {
  try {
    const rows = JSON.parse(await inflateText(fromBase64(b64), 20_000_000, meter)) as unknown
    if (!Array.isArray(rows) || !rows.every(Array.isArray)) return null
    const width = Math.min(8, Math.max(0, ...rows.slice(0, 1000).map((r: unknown[]) => r.length)))
    return { rows: rows.length, grid: { head: Array.from({ length: width }, (_, i) => `Column ${i + 1}`), rows: rows.slice(0, 6).map((r: unknown[]) => r.slice(0, 8).map((v) => clip(v === null ? '' : String(v)))) } }
  } catch {
    return null
  }
}

async function revisions(ctx: Context): Promise<{ detail: string; sample: string[] } | null> {
  const headers = await text(ctx, 'xl/revisions/revisionHeaders.xml', 'the change history’s list of saves')
  if (headers === null) return null
  const users = new Set<string>()
  let saves = 0
  const dates: string[] = []
  scanText(headers, {
    tag(n, close, _self, a) {
      if (n !== 'header' || close) return
      saves++
      const u = attr(a, 'userName')
      if (u && users.size < 50) users.add(clipTo(u, 60))
      const d = attr(a, 'dateTime')
      if (d) dates.push(d.slice(0, 10))
    },
  })
  let old = 0
  let deleted = 0
  const sample: string[] = []
  for (const [k, e] of ctx.byName) {
    if (!/^xl\/revisions\/revisionlog[^/]*\.xml$/.test(k)) continue
    let inOld = false
    let inValue = false
    let ref = ''
    let value = ''
    const sc: Scanner = new Scanner({
      tag(n, close, self, a) {
        if (n === 'oc') {
          if (close) {
            old++
            if (value && sample.length < SAMPLE) sample.push(`${ref}: ${clip(xstring(value))}`)
            inOld = false
          } else if (!self) {
            inOld = true
            ref = attr(a, 'r') ?? ''
            value = ''
          }
        } else if (n === 'rrc' && !close && /^delete/i.test(attr(a, 'action') ?? '')) deleted++
        else if (inOld && (n === 'v' || n === 't')) {
          inValue = !close && !self
          sc.wantText = inValue
        }
      },
      text(t) {
        if (inValue && value.length < TEXT) value += t
      },
    })
    await streamPart(ctx, e, sc, 'part of the change history', 'Reading the change history')
  }
  dates.sort()
  return {
    detail: `The workbook keeps a history of ${plural(saves, 'saved change')}${users.size ? ` by ${list([...users])}` : ''}${dates.length ? `, from ${dates[0]} to ${dates[dates.length - 1]}` : ''}, with ${plural(old, 'earlier value')}${deleted ? ` and ${plural(deleted, 'deleted row or column', 'deleted rows and columns')}` : ''}.`,
    sample,
  }
}

async function embeddings(ctx: Context): Promise<Finding[]> {
  const out: Finding[] = []
  let kept = 0
  for (const [k, e] of ctx.byName) {
    if (!/^xl\/embeddings\//.test(k)) continue
    const name = e.name.split('/').pop() ?? e.name
    let kind = 'A file'
    let embedded: Finding['embedded']
    try {
      const start = await partHead(ctx.file, e, 8)
      const zipped = start[0] === 0x50 && start[1] === 0x4b
      const compound = start[0] === 0xd0 && start[1] === 0xcf && start[2] === 0x11 && start[3] === 0xe0
      if (start[0] === 0x25 && start[1] === 0x50 && start[2] === 0x44 && start[3] === 0x46) kind = 'A PDF'
      else if ((zipped || compound) && e.size <= EMBEDDED) {
        const b = await partBytes(ctx.file, e, EMBEDDED, ctx.meter)
        const blob = new Blob([b as BlobPart])
        if (zipped) {
          const inner = (await entries(blob)).map((x) => x.name.toLowerCase())
          if (inner.includes('xl/workbook.xml')) {
            kind = 'An Excel workbook'
            if (kept + b.length <= EMBEDDED_BYTES) {
              embedded = { name, bytes: b }
              kept += b.length
            }
          } else if (inner.includes('word/document.xml')) kind = 'A Word document'
          else if (inner.includes('ppt/presentation.xml')) kind = 'A PowerPoint presentation'
          else kind = 'A zip of files'
        } else {
          const names = (await compoundNames(blob)) ?? []
          const has = (n: string) => names.some((x) => x.toLowerCase() === n.toLowerCase())
          kind = has('EncryptedPackage')
            ? 'A password-protected Office file'
            : has('WordDocument')
              ? 'An older Word document (.doc)'
              : has('Workbook') || has('Book')
                ? 'An older Excel workbook (.xls)'
                : has('PowerPoint Document')
                  ? 'An older PowerPoint presentation (.ppt)'
                  : names.some((x) => /Ole10Native$/.test(x))
                    ? 'A packaged file (it can be a file of any kind)'
                    : 'An embedded object'
        }
      } else if (zipped || compound) kind = 'An Office file or object'
    } catch (err) {
      rethrowAbort(err)
      failed(ctx, `An embedded file (${name})`, err)
    }
    mark(ctx, e.name, embedded ? 'read' : 'not-read', 'an embedded file')
    out.push({
      tier: 'data',
      title: 'An embedded file',
      detail: `${kind} of ${size(e.size)} (${name}) is inside the workbook, with whatever it holds.${embedded ? ' It can be checked on its own here.' : ' This page doesn’t look inside it.'}`,
      fix: 'Find the object on its sheet (Home > Find & Select > Selection Pane lists them), select it, and press Delete.',
      embedded,
    })
  }
  return out
}

async function properties(ctx: Context): Promise<{ list: string[]; labels: string[] }> {
  const items: string[] = []
  const labels: string[] = []
  const labelled: Record<string, string> = {
    creator: 'Author',
    lastModifiedBy: 'Last saved by',
    created: 'Created',
    modified: 'Last saved',
    lastPrinted: 'Last printed',
    title: 'Title',
    subject: 'Subject',
    description: 'Comments',
    keywords: 'Keywords',
    category: 'Category',
    contentStatus: 'Status',
    Company: 'Company',
    Manager: 'Manager',
    HyperlinkBase: 'Hyperlink base',
    Template: 'Template',
  }
  for (const part of ['docProps/core.xml', 'docProps/app.xml']) {
    const xml = await text(ctx, part, 'the document’s properties')
    if (!xml) continue
    let current = ''
    let value = ''
    scanText(xml, {
      tag(n, close) {
        if (!labelled[n]) return
        if (close) {
          const v = xstring(value).trim()
          if (v && current === n) items.push(`${labelled[n]}: ${n === 'created' || n === 'modified' || n === 'lastPrinted' ? when(v) : clip(v)}`)
          current = ''
        } else {
          current = n
          value = ''
        }
      },
      text(t) {
        if (current && value.length < TEXT) value += t
      },
    })
  }
  const custom = await text(ctx, 'docProps/custom.xml', 'the document’s custom properties')
  if (custom) {
    let prop = ''
    let value = ''
    let inValue = false
    scanText(custom, {
      tag(n, close, self, a) {
        if (n === 'property') {
          if (close) {
            const v = xstring(value).trim()
            if (/^MSIP_Label_.*_Name$/i.test(prop)) labels.push(clip(v))
            else if (!/^MSIP_Label_/i.test(prop) && !/^(ContentTypeId|_dlc_DocId\w*|MediaServiceImageTags|TaxCatchAll|lcf76f155ced4ddcb4097134ff3c332f)$/i.test(prop) && v && items.length < 100)
              items.push(`${clipTo(prop, 60)}: ${clip(v)}`)
            prop = ''
            inValue = false
          } else if (!self) {
            prop = attr(a, 'name') ?? ''
            value = ''
          }
        } else if (prop && !close && !self) inValue = true
        else if (prop && close) inValue = false
      },
      text(t) {
        if (inValue && value.length < TEXT) value += t
      },
    })
  }
  if (ctx.byName.has('docmetadata/labelinfo.xml')) {
    mark(ctx, 'docmetadata/labelinfo.xml', 'read', 'the sensitivity label’s settings')
    if (!labels.length) labels.push('one set in Microsoft 365 (its name isn’t stored in the file)')
  }
  return { list: items, labels }
}

async function printerNames(ctx: Context): Promise<string[]> {
  const out: string[] = []
  for (const [k, e] of ctx.byName) {
    if (!/^xl\/printersettings\//.test(k)) continue
    try {
      const b = await partBytes(ctx.file, e, 1_000_000, ctx.meter)
      mark(ctx, e.name, 'read', 'print settings')
      // Windows keeps the printer's name in the first 32 two-byte characters.
      const name = new TextDecoder('utf-16le').decode(b.subarray(0, 64)).replace(/\u0000[\s\S]*$/, '')
      if (name && /^[\x20-\x7e\u00a0-\uffff]+$/.test(name) && !out.includes(name)) out.push(name)
    } catch (err) {
      rethrowAbort(err)
      mark(ctx, e.name, 'not-read', 'print settings')
      failed(ctx, 'Print settings', err)
    }
  }
  return out
}

async function userNames(ctx: Context): Promise<string[]> {
  const out: string[] = []
  if (!ctx.byName.has('xl/usernames.xml')) return out
  await readXml(
    ctx,
    'xl/usernames.xml',
    {
      tag(n, close, _self, a) {
        if (n !== 'userInfo' || close) return
        const name = attr(a, 'name')
        if (name && out.length < 200 && !out.includes(name)) out.push(clipTo(name, 80))
      },
    },
    'the people who had the shared workbook open',
  )
  return out
}

async function customXml(ctx: Context): Promise<string[]> {
  const out: string[] = []
  for (const [k, e] of ctx.byName) {
    if (!/^customxml\/item\d*\.xml$/.test(k) || ctx.parts.has(k)) continue
    const values: string[] = []
    await readXml(
      ctx,
      e.name,
      {
        tag() {},
        text(t) {
          const v = xstring(t).trim()
          if (v && values.length < 6 && !/^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i.test(v)) values.push(clipTo(v, 60))
        },
      },
      'custom data',
    )
    if (values.length) out.push(clipTo(values.join(' · '), 160))
  }
  return out
}

// Reading parts.

/** A part by its name in the package (case doesn't matter), or by a relationship's percent-encoded spelling of it. */
function find(ctx: Context, part: string): Entry | undefined {
  return ctx.byName.get(part.toLowerCase()) ?? ctx.byName.get(safeDecode(part).toLowerCase())
}

function mark(ctx: Context, name: string, role: Role, what: string): void {
  ctx.parts.set(name.toLowerCase(), { role, what })
}

/** A part read whole, as text; null if it isn't there or can't be read (which is recorded). */
async function text(ctx: Context, part: string, what: string, role: Role = 'read'): Promise<string | null> {
  const entry = find(ctx, part)
  if (!entry) return null
  try {
    const b = await partBytes(ctx.file, entry, WHOLE, ctx.meter)
    mark(ctx, entry.name, role, what)
    return new TextDecoder(encodingOf(b)).decode(b)
  } catch (e) {
    rethrowAbort(e)
    mark(ctx, entry.name, 'not-read', what)
    failed(ctx, capital(what), e)
    return null
  }
}

/** A part streamed through handlers that get all of its text; false if it couldn't be read in full (recorded). */
async function readXml(ctx: Context, part: string, handlers: Handlers, what: string): Promise<boolean> {
  const entry = find(ctx, part)
  if (!entry) return false
  const sc = new Scanner(handlers)
  sc.wantText = true
  return streamPart(ctx, entry, sc, what)
}

/** A part streamed through a scanner, with progress if there's a label; false if it couldn't be read in full. What
 * came before a failure has been seen by the scanner, so findings from it stand. */
async function streamPart(ctx: Context, entry: Entry, sc: Scanner, what: string, label?: string): Promise<boolean> {
  mark(ctx, entry.name, 'read', what)
  try {
    if (label) ctx.progress.begin(label, entry)
    await scan(await open(ctx.file, entry, STREAMED, ctx.meter), sc, ctx.signal, label ? ctx.progress.bytes : undefined)
    return true
  } catch (e) {
    rethrowAbort(e)
    mark(ctx, entry.name, 'not-read', what)
    failed(ctx, capital(what), e)
    return false
  }
}

async function readSheet(ctx: Context, entry: Entry, base: Omit<SheetContext, 'signal' | 'onBytes'>, hidden: boolean, what: string): Promise<SheetScan> {
  mark(ctx, entry.name, 'read', what)
  const s = await scanSheet(() => open(ctx.file, entry, STREAMED, ctx.meter), { ...base, signal: ctx.signal, onBytes: ctx.progress.bytes }, hidden)
  if (!s.complete) mark(ctx, entry.name, 'not-read', `${what} (read in part)`)
  return s
}

async function rels(ctx: Context, part: string): Promise<Rel[]> {
  const slash = part.lastIndexOf('/')
  const path = `${part.slice(0, slash + 1)}_rels/${part.slice(slash + 1)}.rels`
  const xml = await text(ctx, path, 'links between the file’s parts', 'structure')
  if (!xml) return []
  const out: Rel[] = []
  scanText(xml, {
    tag(n, close, _self, a) {
      if (n !== 'Relationship' || close) return
      const external = attr(a, 'TargetMode') === 'External'
      const target = attr(a, 'Target') ?? ''
      out.push({ id: attr(a, 'Id') ?? '', type: attr(a, 'Type') ?? '', target: external ? target : resolve(part, target), external })
    },
  })
  return out
}

function resolve(base: string, target: string): string {
  const path = target.startsWith('/') ? target.slice(1) : `${base.slice(0, base.lastIndexOf('/') + 1)}${target}`
  const out: string[] = []
  for (const seg of path.split('/')) {
    if (seg === '..') out.pop()
    else if (seg && seg !== '.') out.push(seg)
  }
  return out.join('/')
}

/** Text inflated from raw deflate, refused past `limit` bytes or once the check's budget is spent. */
async function inflateText(raw: Uint8Array, limit: number, meter: Meter): Promise<string> {
  const reader = new Blob([raw as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>)
    .getReader()
  const decoder = new TextDecoder()
  let out = ''
  let total = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.length
      meter.left -= value.length
      if (total > limit) throw new ZipError('too-big')
      if (meter.left < 0) throw new ZipError('budget')
      out += decoder.decode(value, { stream: true })
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  return out + decoder.decode()
}

function fromBase64(b64: string): Uint8Array {
  const s = atob(b64)
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}

// What a part is, for parts this check doesn't otherwise read.

/** Ordinary structure, with nothing in it to check. */
const STRUCTURE: [RegExp, string][] = [
  [/^\[content_types\]\.xml$/, 'the list of the file’s parts'],
  [/(^|\/)_rels\/[^/]*\.rels$/, 'links between the file’s parts'],
  [/^xl\/calcchain\.xml$/, 'the order formulas are calculated in'],
  [/^xl\/metadata\.xml$/, 'formula settings (such as dynamic arrays)'],
  [/^xl\/volatiledependencies\.xml$/, 'formula settings'],
  [/^xl\/charts\/(style|colors)[^/]*\.xml$/, 'a chart’s style'],
  [/^xl\/theme\//, 'colours and fonts'],
  [/^xl\/ctrlprops\//, 'a form control’s settings'],
  [/^xl\/featurepropertybag\//, 'feature settings'],
  [/^xl\/namedsheetviews\//, 'a sheet view’s settings'],
  [/^xl\/pivottables\//, 'a pivot table’s layout (its data is in its cache)'],
  [/^xl\/querytables\//, 'a query table’s settings (its connection is listed)'],
  [/^xl\/slicers\//, 'a slicer’s layout'],
  [/^xl\/timelines\//, 'a timeline’s layout'],
  [/^xl\/timelinecaches\//, 'a timeline’s date range'],
  [/^xl\/drawings\/vmldrawing[^/]*\.vml$/, 'shapes for notes and form controls'],
  [/^xl\/diagrams\/(layout|quickstyle|colors)[^/]*\.xml$/, 'a SmartArt graphic’s style'],
  [/^customxml\/itemprops[^/]*\.xml$/, 'custom data’s settings'],
  [/^xl\/webextensions\/taskpanes\.xml$/, 'add-in panes'],
  [/^(xl\/)?customui\//, 'ribbon settings'],
  [/^xl\/xmlmaps\.xml$/, 'XML map settings'],
  [/^xl\/attachedtoolbars\.bin$/, 'toolbar settings'],
  [/^xl\/cellimages\.xml$/, 'pictures in cells (the pictures are listed)'],
  [/^xl\/vbaprojectsignature[^/]*\.bin$/, 'the macros’ digital signature'],
  [/^_xmlsignatures\//, 'a digital signature'],
]

/** Parts this page doesn't look inside: what each is, and the line for the list of what wasn't read. */
const NOT_READ: [RegExp, string, string][] = [
  [/^xl\/vbaproject\.bin$/, 'macros (VBA)', 'The macros’ code (VBA).'],
  [/^xl\/model\//, 'the data model', 'What’s inside the data model (in Excel, Power Pivot shows it).'],
  [/^xl\/embeddings\//, 'an embedded file', 'What’s inside embedded files that aren’t workbooks.'],
  [/^xl\/activex\//, 'an ActiveX control', 'ActiveX controls’ saved contents.'],
  [/^xl\/customproperty[^/]*\.bin$/, 'a custom property saved by a macro or an add-in', 'Custom properties saved by macros or add-ins.'],
  [/^xl\/richdata\//, 'rich values (data types, pictures in cells)', 'Rich values: linked data types, and pictures in cells.'],
  [/^xl\/webextensions\//, 'an add-in’s saved settings', 'Add-ins’ saved settings.'],
  [/^xl\/diagrams\//, 'a SmartArt graphic’s text', 'The text of SmartArt graphics.'],
  [/^xl\/pivotcache\//, 'a pivot table’s copy of data that no cache uses', 'A pivot table’s copy of data that no cache uses.'],
]

// Small helpers.

/** The first dozen runs of row or column numbers, as text ("5–16, 40"), and how many numbers they cover. */
function firstRuns(values: number[], format: (values: readonly number[]) => string): { text: string; shown: number } {
  const sorted = [...values].sort((a, b) => a - b)
  let runs = 0
  let shown = 0
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0 || sorted[i] !== sorted[i - 1] + 1) runs++
    if (runs > 12) break
    shown++
  }
  return { text: format(sorted.slice(0, shown)), shown }
}

function formatName(contentTypes: string, main: string): string {
  const name = main.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const type = new RegExp(`PartName="/${name}"\\s+ContentType="([^"]+)"|ContentType="([^"]+)"\\s+PartName="/${name}"`, 'i').exec(contentTypes)
  const t = (type?.[1] ?? type?.[2] ?? '').toLowerCase()
  if (t.includes('addin')) return 'Excel add-in (.xlam)'
  if (t.includes('template.macroenabled')) return 'Excel template with macros (.xltm)'
  if (t.includes('template')) return 'Excel template (.xltx)'
  if (t.includes('macroenabled')) return 'Excel workbook with macros (.xlsm)'
  return 'Excel workbook (.xlsx)'
}

function sheetState(v: string | undefined): SheetSummary['state'] {
  return v === 'hidden' ? 'hidden' : v === 'veryHidden' ? 'veryHidden' : 'visible'
}

function sheetKind(type: string | undefined): SheetSummary['kind'] {
  if (!type) return 'worksheet'
  if (type.endsWith('/chartsheet')) return 'chart'
  if (type.endsWith('/dialogsheet')) return 'dialog'
  if (/macrosheet$/i.test(type)) return 'macro'
  return 'worksheet'
}

function readState(s: SheetScan): SheetSummary['read'] {
  return s.complete ? 'all' : s.cells || s.lastRow ? 'part' : 'none'
}

function truthy(v: string | undefined): boolean {
  return v === '1' || v === 'true'
}

function grid(cells: Cell[]): Grid {
  const cols = [...new Set(cells.map((c) => c.col))].sort((a, b) => a - b).slice(0, 8)
  const rows = [...new Set(cells.map((c) => c.row))].sort((a, b) => a - b)
  const at = new Map(cells.map((c) => [`${c.row}:${c.col}`, c.value]))
  return { head: ['', ...cols.map(colName)], rows: rows.map((r) => [String(r), ...cols.map((c) => clip(at.get(`${r}:${c}`) ?? ''))]) }
}

export function areaName(a: Area): string {
  const one = refName(a.r1, a.c1)
  return a.r1 === a.r2 && a.c1 === a.c2 ? one : `${one}:${refName(a.r2, a.c2)}`
}

/** Text cut to a readable length. It takes one argument, so handing it to map() can't pass an index as a length. */
export function clip(s: string): string {
  return clipTo(s, CLIP)
}

export function clipTo(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  // Never cut a character in two (an emoji, say, is two code units).
  const end = /[\ud800-\udbff]/.test(t[max - 2] ?? '') ? max - 2 : max - 1
  return `${t.slice(0, end)}…`
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function size(bytes: number): string {
  if (bytes < 1000) return `${bytes} bytes`
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`
  if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`
}

/** A saved time (W3CDTF, in UTC when it ends in Z) as "2026-10-13 18:32 UTC". */
function when(v: string): string {
  const m = /^(\d{4}-\d\d-\d\d)(?:T(\d\d:\d\d)(?::\d\d(?:\.\d+)?)?(Z|[+-]\d\d:\d\d)?)?$/.exec(v)
  if (!m) return clip(v)
  return [m[1], m[2], m[3] === 'Z' ? 'UTC' : m[3] ? `UTC${m[3]}` : ''].filter(Boolean).join(' ')
}

function capital(s: string): string {
  return s ? `${s[0].toUpperCase()}${s.slice(1)}` : s
}

function imageType(name: string): string | null {
  const ext = name.toLowerCase().split('.').pop() ?? ''
  return ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp', svg: 'image/svg+xml', tif: 'image/tiff', tiff: 'image/tiff' } as Record<string, string>)[ext] ?? null
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

const isBudget = (e: unknown) => e instanceof ZipError && e.message === 'budget'

function failed(ctx: Context, what: string, e: unknown): void {
  if (isBudget(e)) ctx.unreached.push(what.charAt(0).toLowerCase() + what.slice(1))
  else ctx.incomplete.push(`${what} couldn’t be read (${reason(e)}).`)
}

function reason(e: unknown): string {
  if (e instanceof ZipError)
    return e.message === 'too-big'
      ? 'it’s larger than this page reads'
      : e.message === 'encrypted'
        ? 'it’s encrypted'
        : e.message === 'unsupported'
          ? 'it’s compressed in a way this page can’t read'
          : e.message === 'budget'
            ? 'the check had already read as much as it reads from one file'
            : 'the file is damaged there'
  if (e instanceof XmlError) return 'its XML is damaged'
  return 'the file is damaged there'
}

function rethrowAbort(e: unknown) {
  if (e instanceof DOMException && e.name === 'AbortError') throw e
}
