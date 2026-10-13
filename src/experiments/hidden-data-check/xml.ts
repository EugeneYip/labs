// A small streaming scanner for the XML inside an .xlsx. It reports tags and text as they arrive and never builds a
// document, so a sheet of a million rows reads in a fixed amount of memory. It never fetches or expands anything:
// entities other than the five built-in ones and numeric references are left as they are.

export interface Handlers {
  /** An element's start or end tag, by its name without a namespace prefix. `attrs` is the raw attribute text. */
  tag(name: string, close: boolean, self: boolean, attrs: string): void
  /** Text between tags, possibly in pieces, with entities still encoded. Only called while `wantText` is true. */
  text?(text: string): void
}

/** The longest tag, comment, or declaration the scanner waits for; anything longer means the file is damaged. */
const MAX_TAG = 4_000_000

/** XML this scanner can't follow. */
export class XmlError extends Error {}

export class Scanner {
  /** Set by a handler while it wants the text of the element it's in; saves copying all the rest. */
  wantText = false
  /** Set by a handler that has what it needs; the stream stops being read. */
  stop = false
  private rest = ''
  /** For a tag (or comment) held over from the last chunk: how far into it the search for its end has looked, and
   * whether that point was inside a quoted value, so a long one is searched once, not again with every chunk. */
  private seen = 0
  private quote = 0
  private readonly h: Handlers

  constructor(handlers: Handlers) {
    this.h = handlers
  }

  feed(chunk: string): void {
    const s = this.rest ? this.rest + chunk : chunk
    // The held construct, if any, starts at 0; its search resumes where it stopped.
    const seen = this.rest ? this.seen : 0
    const quote = this.quote
    this.rest = ''
    this.seen = this.quote = 0
    const n = s.length
    const h = this.h
    let i = 0
    while (i < n && !this.stop) {
      const lt = s.indexOf('<', i)
      if (lt < 0) {
        if (this.wantText && h.text) h.text(s.slice(i))
        return
      }
      if (lt > i && this.wantText && h.text) h.text(s.slice(i, lt))
      const c = s.charCodeAt(lt + 1)
      if (c !== c) return this.hold(s, lt)
      if (c === 33) {
        // <!-- comments -->, <![CDATA[ text ]]>, and declarations.
        if (n - lt < 9) return this.hold(s, lt)
        const from = lt === 0 ? Math.max(0, seen - 2) : lt
        if (s.startsWith('<!--', lt)) {
          const e = s.indexOf('-->', Math.max(lt + 4, from))
          if (e < 0) return this.hold(s, lt)
          i = e + 3
        } else if (s.startsWith('<![CDATA[', lt)) {
          const e = s.indexOf(']]>', Math.max(lt + 9, from))
          if (e < 0) return this.hold(s, lt)
          if (this.wantText && h.text) h.text(s.slice(lt + 9, e).replace(/&/g, '&amp;').replace(/</g, '&lt;'))
          i = e + 3
        } else {
          const e = s.indexOf('>', Math.max(lt, from))
          if (e < 0) return this.hold(s, lt)
          i = e + 1
        }
        continue
      }
      if (c === 63) {
        const e = s.indexOf('?>', Math.max(lt + 2, lt === 0 ? seen - 1 : 0))
        if (e < 0) return this.hold(s, lt)
        i = e + 2
        continue
      }
      const e = lt === 0 && seen > 1 ? tagEnd(s, seen, quote) : tagEnd(s, lt + 1, 0)
      if (e < 0) return this.hold(s, lt, endQuote)
      const close = c === 47
      const a = close ? lt + 2 : lt + 1
      let b = a
      while (b < e) {
        const ch = s.charCodeAt(b)
        if (ch === 32 || ch === 9 || ch === 10 || ch === 13 || ch === 47) break
        b++
      }
      const qualified = s.slice(a, b)
      const colon = qualified.indexOf(':')
      const self = !close && s.charCodeAt(e - 1) === 47
      h.tag(colon < 0 ? qualified : qualified.slice(colon + 1), close, self, s.slice(b, self ? e - 1 : e))
      i = e + 1
    }
  }

  /** Keeps the start of a tag that hasn't fully arrived, for the next chunk. */
  private hold(s: string, at: number, quote = 0): void {
    if (s.length - at > MAX_TAG) throw new XmlError('damaged')
    this.rest = s.slice(at)
    this.seen = s.length - at
    this.quote = quote
  }
}

/** The quote a tag was inside when tagEnd ran out of text. */
let endQuote = 0

/** Where a tag ends: the first '>' outside a quoted attribute value, or -1 if the rest hasn't arrived yet (with the
 * quote it was in left in endQuote). */
function tagEnd(s: string, from: number, quote: number): number {
  for (let i = from; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (quote) {
      if (c === quote) quote = 0
    } else if (c === 62) return i
    else if (c === 34 || c === 39) quote = c
  }
  endQuote = quote
  return -1
}

/** Reads a stream of bytes through a scanner, yielding to the page now and then so it stays responsive. */
export async function scan(stream: ReadableStream<Uint8Array>, scanner: Scanner, signal?: AbortSignal, onBytes?: (n: number) => void): Promise<void> {
  const reader = stream.getReader()
  let decoder: TextDecoder | null = null
  // The encoding is chosen from the first bytes (UTF-16 has a byte-order mark), so a very short first chunk waits.
  let start: Uint8Array = new Uint8Array(0)
  let last = Date.now()
  try {
    for (;;) {
      if (signal?.aborted) throw new DOMException('Stopped', 'AbortError')
      const { done, value } = await reader.read()
      if (done) break
      onBytes?.(value.length)
      let bytes = value
      if (!decoder) {
        bytes = start.length ? join(start, value) : value
        if (bytes.length < 2) {
          start = bytes
          continue
        }
        decoder = new TextDecoder(encodingOf(bytes))
      }
      scanner.feed(decoder.decode(bytes, { stream: true }))
      if (scanner.stop) break
      if (Date.now() - last > 40) {
        await pause()
        last = Date.now()
      }
    }
    if (!scanner.stop) scanner.feed((decoder ?? new TextDecoder()).decode(decoder ? undefined : start))
  } finally {
    await reader.cancel().catch(() => {})
  }
}

/** UTF-16 if the bytes start with its byte-order mark, otherwise UTF-8 (the two encodings OOXML allows). */
export function encodingOf(b: Uint8Array): string {
  return b[0] === 0xff && b[1] === 0xfe ? 'utf-16le' : b[0] === 0xfe && b[1] === 0xff ? 'utf-16be' : 'utf-8'
}

function join(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length)
  out.set(a)
  out.set(b, a.length)
  return out
}

/** Lets the page paint and respond between chunks. A message, not a timer: browsers slow timers in background tabs
 * to about one a second, which would stall a long check while someone looks at another tab. */
export function pause(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => {
      channel.port1.close()
      resolve()
    }
    channel.port2.postMessage(null)
  })
}

/** Scans text already in memory. */
export function scanText(text: string, handlers: Handlers): void {
  const scanner = new Scanner(handlers)
  scanner.wantText = true
  scanner.feed(text)
}

const patterns = new Map<string, RegExp>()

/** An attribute's value by its exact name (with its prefix, if it has one), entities decoded. */
export function attr(attrs: string, name: string): string | undefined {
  let re = patterns.get(name)
  if (!re) {
    re = new RegExp(`(?:^|\\s)${name.replace(/[.:]/g, '\\$&')}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`)
    patterns.set(name, re)
  }
  const m = re.exec(attrs)
  return m ? decode(m[1] ?? m[2]) : undefined
}

/** A relationship id (r:id under whatever prefix the file uses). */
export function relId(attrs: string): string | undefined {
  const m = /(?:^|\s)[\w.-]+:id\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(attrs)
  return m ? decode(m[1] ?? m[2]) : undefined
}

export function decode(s: string): string {
  if (!s.includes('&')) return s
  return s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (_whole, dec, hex, named) => {
    if (named) return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[named.toLowerCase() as 'amp']
    const code = dec ? Number(dec) : parseInt(hex, 16)
    return code > 0x10ffff || code === 0 ? '�' : String.fromCodePoint(code)
  })
}

/** A cell's or comment's text as Excel shows it: entities decoded, and Excel's own _xHHHH_ escapes for characters
 * XML can't hold (such as _x000D_ for a carriage return) turned back into those characters. */
export function xstring(raw: string): string {
  const s = decode(raw)
  return s.includes('_x') ? s.replace(/_x([0-9A-Fa-f]{4})_/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16))) : s
}

// Cell references.

export const MAX_ROW = 1_048_576
export const MAX_COL = 16_384

/** "AB12" → [12, 28]; null if it isn't a cell reference. Dollar signs are allowed. */
export function parseRef(ref: string): [number, number] | null {
  let i = 0
  let col = 0
  const n = ref.length
  if (ref.charCodeAt(0) === 36) i++
  for (; i < n; i++) {
    const c = ref.charCodeAt(i) | 32
    if (c < 97 || c > 122) break
    col = col * 26 + (c - 96)
  }
  if (ref.charCodeAt(i) === 36) i++
  let row = 0
  const digits = i
  for (; i < n; i++) {
    const c = ref.charCodeAt(i)
    if (c < 48 || c > 57) return null
    row = row * 10 + (c - 48)
  }
  if (i === digits || col < 1 || col > MAX_COL || row < 1 || row > MAX_ROW) return null
  return [row, col]
}

export function colName(col: number): string {
  let s = ''
  for (let c = col; c > 0; c = Math.floor((c - 1) / 26)) s = String.fromCharCode(65 + ((c - 1) % 26)) + s
  return s
}

export const refName = (row: number, col: number) => `${colName(col)}${row}`

export interface Area {
  r1: number
  c1: number
  r2: number
  c2: number
}

/** "A1:K9 M2" → its areas. Whole columns and rows ("A:C", "3:5") are allowed. */
export function parseAreas(sqref: string): Area[] {
  const out: Area[] = []
  for (const part of sqref.trim().split(/\s+/)) {
    const [a, b = a] = part.split(':')
    const one = parseEnd(a)
    const two = parseEnd(b)
    if (!one || !two) continue
    out.push({ r1: Math.min(one[0], two[0]), c1: Math.min(one[1], two[1]), r2: Math.max(one[0], two[0]), c2: Math.max(one[1], two[1]) })
  }
  return out
}

function parseEnd(s: string): [number, number] | null {
  const cell = parseRef(s)
  if (cell) return cell
  const clean = s.replace(/\$/g, '')
  if (/^\d+$/.test(clean)) {
    const row = Number(clean)
    return row >= 1 && row <= MAX_ROW ? [row, 0] : null
  }
  if (/^[a-z]+$/i.test(clean)) {
    const col = parseRef(`${clean}1`)
    return col ? [0, col[1]] : null
  }
  return null
}

/** Whether a cell is inside any of the areas (a 0 bound means the whole row or column). */
export function within(areas: readonly Area[], row: number, col: number): boolean {
  for (const a of areas) {
    const rowsOk = a.r1 === 0 || (row >= a.r1 && row <= a.r2)
    const colsOk = a.c1 === 0 || (col >= a.c1 && col <= a.c2)
    if (rowsOk && colsOk) return true
  }
  return false
}

/** "C, F–G, J" for a set of column numbers. */
export function colRuns(cols: readonly number[]): string {
  return runs(cols).map(([a, b]) => (a === b ? colName(a) : `${colName(a)}–${colName(b)}`)).join(', ')
}

/** "5–16, 40" for a set of row numbers. */
export function rowRuns(rows: readonly number[]): string {
  return runs(rows).map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(', ')
}

function runs(values: readonly number[]): [number, number][] {
  const sorted = [...values].sort((x, y) => x - y)
  const out: [number, number][] = []
  for (const v of sorted) {
    const last = out[out.length - 1]
    if (last && v === last[1] + 1) last[1] = v
    else if (!last || v > last[1]) out.push([v, v])
  }
  return out
}
