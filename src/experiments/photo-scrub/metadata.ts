/**
 * Photo Scrub's core: reads the hidden metadata in JPEG, PNG, and WebP files
 * and makes clean copies without it. It works on the file's bytes and copies
 * the image data unchanged, so cleaning never recompresses or alters the
 * picture. Nothing here touches the network, storage, or the page.
 */

export type Format = 'jpeg' | 'png' | 'webp'

export type FindingKind = 'location' | 'device' | 'time' | 'person' | 'software' | 'other'

export interface Finding {
  kind: FindingKind
  label: string
  value: string
}

export interface Report {
  format: Format
  findings: Finding[]
  /** Where the photo was taken, in decimal degrees, when it says. */
  location?: { latitude: number; longitude: number }
  /** EXIF orientation, 1–8. Clean copies keep it so photos stay upright. */
  orientation: number
}

export interface ScrubResult {
  before: Report
  clean: Uint8Array<ArrayBuffer>
  /** The clean copy, read back to confirm nothing is left. */
  after: Report
}

/** A file that can't be cleaned, with a reason written for people. */
export class ScrubError extends Error {}

export const MIME_TYPES: Record<Format, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

export function scrub(bytes: Uint8Array): ScrubResult {
  const format = detectFormat(bytes)
  if (format === 'heic') {
    throw new ScrubError('HEIC photos aren’t supported. On iPhone, choose photos from this page (they arrive as JPEG), or export them as JPEG first.')
  }
  if (!format) throw new ScrubError('This isn’t a JPEG, PNG, or WebP image.')
  const before = readReport(bytes, format)
  const clean = format === 'jpeg' ? cleanJpeg(bytes, before.orientation) : format === 'png' ? cleanPng(bytes) : cleanWebp(bytes)
  return { before, clean, after: readReport(clean, format) }
}

export function detectFormat(b: Uint8Array): Format | 'heic' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg'
  if (ascii(b, 0, 8) === '\x89PNG\r\n\x1a\n') return 'png'
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') return 'webp'
  if (ascii(b, 4, 4) === 'ftyp' && /^(hei[cxms]|hev[cxms]|mif1|msf1|avif|avis)$/.test(ascii(b, 8, 4))) return 'heic'
  return null
}

export function readReport(b: Uint8Array, format: Format): Report {
  const report: Report = { format, findings: [], orientation: 1 }
  if (format === 'jpeg') readJpeg(b, report)
  else if (format === 'png') readPng(b, report)
  else readWebp(b, report)
  // EXIF and XMP often repeat each other.
  const seen = new Set<string>()
  report.findings = report.findings.filter((f) => !seen.has(f.label + f.value) && seen.add(f.label + f.value))
  return report
}

// Bytes

function ascii(b: Uint8Array, start: number, length: number): string {
  let text = ''
  for (let i = start; i < start + length && i < b.length; i++) text += String.fromCharCode(b[i])
  return text
}

const u16be = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1]
const u32be = (b: Uint8Array, i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0
const u32le = (b: Uint8Array, i: number) => (b[i] | (b[i + 1] << 8) | (b[i + 2] << 16) | (b[i + 3] << 24)) >>> 0

function concat(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
  let offset = 0
  for (const part of parts) {
    out.set(part, offset)
    offset += part.length
  }
  return out
}

const utf8 = new TextDecoder('utf-8')
const latin1 = new TextDecoder('latin1')

/** Readable text: no control characters, trimmed, and not too long to show. */
function tidy(text: string): string {
  const clean = text.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > 300 ? `${clean.slice(0, 300)}…` : clean
}

function add(report: Report, kind: FindingKind, label: string, value: string) {
  const text = tidy(value)
  if (text) report.findings.push({ kind, label, value: text })
}

const damaged = () => new ScrubError('This file looks damaged, so it was left alone.')

// JPEG

interface Segment {
  marker: number
  /** First byte of the marker, including any fill bytes. */
  start: number
  /** First byte after the 2-byte length. */
  data: number
  end: number
}

/** The file's segments up to the first end-of-image marker. Image data stays inside its scan segment. */
function jpegSegments(b: Uint8Array): { segments: Segment[]; end: number } {
  const segments: Segment[] = []
  let i = 2
  while (i < b.length) {
    if (b[i] !== 0xff) throw damaged()
    const start = i
    while (i < b.length && b[i] === 0xff) i++
    const marker = b[i++]
    if (marker === 0xd9) return { segments, end: i }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue // Standalone markers carry nothing.
    if (i + 2 > b.length) throw damaged()
    const length = u16be(b, i)
    let end = i + length
    if (length < 2 || end > b.length) throw damaged()
    if (marker === 0xda) end = scanEnd(b, end)
    segments.push({ marker, start, data: i + 2, end })
    i = end
  }
  return { segments, end: b.length } // Cut short, with no end marker; still cleanable.
}

/** Where compressed image data ends: the next marker that isn't an escaped 0xFF or a restart marker. */
function scanEnd(b: Uint8Array, i: number): number {
  while (i < b.length - 1) {
    if (b[i] !== 0xff) i++
    else if (b[i + 1] === 0x00 || (b[i + 1] >= 0xd0 && b[i + 1] <= 0xd7)) i += 2
    else if (b[i + 1] === 0xff) i++
    else return i
  }
  return b.length
}

const APP0 = 0xe0
const APP1 = 0xe1
const APP2 = 0xe2
const APP13 = 0xed
const APP14 = 0xee
const COM = 0xfe

function readJpeg(b: Uint8Array, report: Report) {
  const { segments, end } = jpegSegments(b)
  for (const s of segments) {
    const data = b.subarray(s.data, s.end)
    if (s.marker === APP1 && ascii(data, 0, 6) === 'Exif\0\0') readExif(data.subarray(6), report)
    else if (s.marker === APP1 && ascii(data, 0, 29) === 'http://ns.adobe.com/xap/1.0/\0') readXmp(utf8.decode(data.subarray(29)), report)
    else if (s.marker === APP1 && ascii(data, 0, 4) === 'http') add(report, 'other', 'Extended XMP data', 'Editing and description details')
    else if (s.marker === APP13) add(report, 'other', 'IPTC data', 'Captions, credits, or keywords')
    else if (s.marker === COM) add(report, 'other', 'Comment', latin1.decode(data))
    else if (s.marker === APP2 && ascii(data, 0, 4) === 'MPF\0') add(report, 'other', 'Extra embedded images', 'Such as depth or HDR maps')
    else if (s.marker === APP0 && ascii(data, 0, 5) === 'JFXX\0') add(report, 'other', 'Embedded thumbnail', 'A small copy of the photo')
    else if (s.marker === APP0 && ascii(data, 0, 5) === 'JFIF\0' && (data[12] || data[13])) add(report, 'other', 'Embedded thumbnail', 'A small copy of the photo')
    else if (s.marker >= APP0 && s.marker <= 0xef && !keepJpegSegment(b, s) && s.marker !== APP0 && s.marker !== APP1) {
      add(report, 'other', 'Other app data', `Data added by ${ascii(data, 0, 12).replace(/[^\x20-\x7e]/g, '').trim() || 'an app'}`)
    }
  }
  if (b.subarray(end).some((byte) => byte !== 0)) {
    add(report, 'other', 'Extra data after the image', `${formatSize(b.length - end)}, often more embedded images`)
  }
}

/** Kept: everything needed to show the image, including its color profile. Dropped: all other app data and comments. */
function keepJpegSegment(b: Uint8Array, s: Segment): boolean {
  if (s.marker === APP2) return ascii(b, s.data, 12) === 'ICC_PROFILE\0'
  if (s.marker === APP14) return ascii(b, s.data, 5) === 'Adobe'
  if (s.marker >= APP0 && s.marker <= 0xef) return false
  return s.marker !== COM
}

function cleanJpeg(b: Uint8Array, orientation: number): Uint8Array<ArrayBuffer> {
  const { segments } = jpegSegments(b)
  const parts: Uint8Array[] = [new Uint8Array([0xff, 0xd8])]
  const jfif = segments.find((s) => s.marker === APP0 && ascii(b, s.data, 5) === 'JFIF\0' && s.end - s.data >= 14)
  // JFIF header with its density settings, minus any thumbnail.
  if (jfif) parts.push(jpegSegment(APP0, [...b.subarray(jfif.data, jfif.data + 12), 0, 0]))
  if (orientation > 1) parts.push(orientationExif(orientation))
  for (const s of segments) if (keepJpegSegment(b, s)) parts.push(b.subarray(s.start, s.end))
  parts.push(new Uint8Array([0xff, 0xd9])) // Anything after the image is dropped.
  return concat(parts)
}

function jpegSegment(marker: number, payload: number[]): Uint8Array {
  const length = payload.length + 2
  return new Uint8Array([0xff, marker, length >> 8, length & 0xff, ...payload])
}

/** A minimal EXIF block holding only the orientation, so viewers still turn the photo upright. */
function orientationExif(orientation: number): Uint8Array {
  const exif = [...'Exif\0\0'].map((c) => c.charCodeAt(0))
  const tiff = [0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, orientation, 0, 0, 0, 0, 0, 0]
  return jpegSegment(APP1, [...exif, ...tiff])
}

// EXIF (a small TIFF structure inside JPEG, PNG, and WebP files)

const TYPE_SIZES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8, 13: 4 }

type Value = string | number | number[] | Uint8Array

function readExif(t: Uint8Array, report: Report) {
  const before = report.findings.length
  let values: Map<string, Value>
  let hasThumbnail: boolean
  try {
    ;({ values, hasThumbnail } = readTiff(t))
  } catch {
    add(report, 'device', 'Camera data (EXIF)', 'Present, but it couldn’t be read in full')
    return
  }
  const text = (key: string) => {
    const value = values.get(key)
    if (typeof value === 'string') return value
    if (value instanceof Uint8Array) return utf8.decode(value).replace(/\0+$/, '')
    return ''
  }
  const number = (key: string) => {
    const value = values.get(key)
    if (typeof value === 'number') return value
    return (Array.isArray(value) || value instanceof Uint8Array) && value.length === 1 ? value[0] : undefined
  }

  const orientation = number('ifd0:274')
  if (orientation && orientation >= 1 && orientation <= 8) report.orientation = orientation

  const latitude = gpsDegrees(values.get('gps:2'), text('gps:1'), 'S')
  const longitude = gpsDegrees(values.get('gps:4'), text('gps:3'), 'W')
  if (latitude !== undefined && longitude !== undefined && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 && (latitude || longitude)) {
    report.location ??= { latitude, longitude }
    add(report, 'location', 'GPS position', formatPosition(latitude, longitude))
  } else if ([...values.keys()].some((key) => key.startsWith('gps:'))) {
    add(report, 'location', 'GPS data', 'Present, without a usable position')
  }
  const altitude = rational(values.get('gps:6'))
  if (altitude !== undefined && latitude !== undefined) add(report, 'location', 'Altitude', `${Math.round(number('gps:5') === 1 ? -altitude : altitude)} m`)
  const gpsDate = text('gps:29')
  if (gpsDate) add(report, 'time', 'GPS date', exifDate(gpsDate))

  const make = text('ifd0:271')
  const model = text('ifd0:272')
  add(report, 'device', 'Camera', model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`)
  const lens = text('exif:42036')
  const lensMake = text('exif:42035')
  add(report, 'device', 'Lens', lens && lensMake && !lens.toLowerCase().startsWith(lensMake.toLowerCase()) ? `${lensMake} ${lens}` : lens)
  add(report, 'device', 'Camera serial number', text('exif:42033'))
  add(report, 'device', 'Lens serial number', text('exif:42037'))
  if (values.has('exif:37500')) add(report, 'device', 'Camera maker data', 'Hidden settings, sometimes serial numbers')
  add(report, 'device', 'Photo ID', text('exif:42016'))

  const taken = text('exif:36867') || text('ifd0:306') || text('exif:36868')
  add(report, 'time', 'Taken', taken && `${exifDate(taken)} ${text('exif:36881')}`)

  add(report, 'person', 'Owner', text('exif:42032'))
  add(report, 'person', 'Artist', text('ifd0:315') || windowsText(values.get('ifd0:40093')))
  add(report, 'person', 'Copyright', text('ifd0:33432'))
  add(report, 'software', 'Software', text('ifd0:305'))
  add(report, 'software', 'Computer', text('ifd0:316'))
  add(report, 'other', 'Description', text('ifd0:270') || windowsText(values.get('ifd0:40095')))
  add(report, 'other', 'Title', windowsText(values.get('ifd0:40091')))
  add(report, 'other', 'Keywords', windowsText(values.get('ifd0:40094')))
  add(report, 'other', 'Comment', userComment(values.get('exif:37510')) || windowsText(values.get('ifd0:40092')))
  if (hasThumbnail) add(report, 'other', 'Embedded thumbnail', 'A small copy that can show an older or uncropped version')
  // Orientation alone isn't personal: clean copies keep it on purpose.
  if (report.findings.length === before && [...values.keys()].some((key) => key !== 'ifd0:274')) {
    add(report, 'other', 'Camera data (EXIF)', 'Technical settings such as exposure')
  }
}

/** All entries of the main, EXIF, and GPS directories, keyed like "gps:2". */
function readTiff(t: Uint8Array): { values: Map<string, Value>; hasThumbnail: boolean } {
  const little = t[0] === 0x49 && t[1] === 0x49
  if (t.length < 8 || (!little && !(t[0] === 0x4d && t[1] === 0x4d))) throw damaged()
  const view = new DataView(t.buffer, t.byteOffset, t.byteLength)
  const u16 = (at: number) => view.getUint16(at, little)
  const u32 = (at: number) => view.getUint32(at, little)
  if (u16(2) !== 42) throw damaged()
  const values = new Map<string, Value>()

  const readValue = (type: number, at: number, count: number): Value => {
    if (type === 2) return utf8.decode(t.subarray(at, at + count)).replace(/\0[\s\S]*$/, '')
    if (type === 1 || type === 6 || type === 7) return t.slice(at, at + count)
    const list: number[] = []
    for (let k = 0; k < Math.min(count, 64); k++) {
      const p = at + k * TYPE_SIZES[type]
      if (type === 3) list.push(u16(p))
      else if (type === 4 || type === 13) list.push(u32(p))
      else if (type === 9) list.push(view.getInt32(p, little))
      else if (type === 5) list.push(u32(p + 4) ? u32(p) / u32(p + 4) : NaN)
      else if (type === 10) list.push(view.getInt32(p + 4, little) ? view.getInt32(p, little) / view.getInt32(p + 4, little) : NaN)
      else if (type === 8) list.push(view.getInt16(p, little))
      else if (type === 11) list.push(view.getFloat32(p, little))
      else if (type === 12) list.push(view.getFloat64(p, little))
    }
    return count === 1 ? list[0] : list
  }

  const visited = new Set<number>()
  const readDirectory = (offset: number, name: string): number => {
    if (offset < 8 || offset + 2 > t.length || visited.has(offset)) return 0
    visited.add(offset)
    const count = u16(offset)
    for (let k = 0; k < count; k++) {
      const entry = offset + 2 + k * 12
      if (entry + 12 > t.length) break
      const type = u16(entry + 2)
      const size = TYPE_SIZES[type] * u32(entry + 4)
      if (!size) continue
      const at = size <= 4 ? entry + 8 : u32(entry + 8)
      if (at + size <= t.length) values.set(`${name}:${u16(entry)}`, readValue(type, at, u32(entry + 4)))
    }
    const next = offset + 2 + count * 12
    return next + 4 <= t.length ? u32(next) : 0
  }

  const thumbnail = readDirectory(u32(4), 'ifd0')
  const pointer = (key: string) => {
    const value = values.get(key)
    return typeof value === 'number' ? value : 0
  }
  readDirectory(pointer('ifd0:34665'), 'exif')
  readDirectory(pointer('ifd0:34853'), 'gps')
  return { values, hasThumbnail: thumbnail > 0 && thumbnail < t.length }
}

function rational(value: Value | undefined): number | undefined {
  const number = typeof value === 'number' ? value : Array.isArray(value) ? value[0] : undefined
  return number !== undefined && Number.isFinite(number) ? number : undefined
}

function gpsDegrees(value: Value | undefined, ref: string, negative: string): number | undefined {
  if (!Array.isArray(value) || value.length < 3 || !value.every(Number.isFinite)) return undefined
  const degrees = value[0] + value[1] / 60 + value[2] / 3600
  return ref.trim().toUpperCase() === negative ? -degrees : degrees
}

/** Windows' own title, comment, author, and keyword fields, stored as UTF-16 bytes. */
function windowsText(value: Value | undefined): string {
  if (!(value instanceof Uint8Array) && !Array.isArray(value)) return ''
  const bytes = Uint8Array.from(value as ArrayLike<number>)
  return new TextDecoder('utf-16le').decode(bytes).replace(/\0+$/, '')
}

/** EXIF user comments start with an 8-byte character set code. */
function userComment(value: Value | undefined): string {
  if (!(value instanceof Uint8Array) || value.length <= 8) return typeof value === 'string' ? value : ''
  const code = ascii(value, 0, 8)
  const body = value.subarray(8)
  const text = code.startsWith('UNICODE') ? new TextDecoder(body[0] === 0 ? 'utf-16be' : 'utf-16le').decode(body) : utf8.decode(body)
  return text.replace(/\0+$/, '').trim()
}

/** "2026:10:01 14:32:10" → "2026-10-01 14:32" */
function exifDate(value: string): string {
  const match = /^(\d{4}):(\d{2}):(\d{2})(?: (\d{2}):(\d{2}))?/.exec(value.trim())
  return match ? `${match[1]}-${match[2]}-${match[3]}${match[4] ? ` ${match[4]}:${match[5]}` : ''}` : value
}

export function formatPosition(latitude: number, longitude: number): string {
  return `${Math.abs(latitude).toFixed(5)}° ${latitude < 0 ? 'S' : 'N'}, ${Math.abs(longitude).toFixed(5)}° ${longitude < 0 ? 'W' : 'E'}`
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// XMP (an XML description some apps add)

function readXmp(xml: string, report: Report) {
  const get = (name: string) => {
    const attribute = new RegExp(`${name}="([^"]*)"`).exec(xml)
    const element = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml)
    const raw = attribute?.[1] ?? element?.[1] ?? ''
    return decodeEntities(raw.replace(/<[^>]+>/g, ' '))
  }
  const before = report.findings.length
  const latitude = xmpDegrees(get('exif:GPSLatitude'))
  const longitude = xmpDegrees(get('exif:GPSLongitude'))
  if (latitude !== undefined && longitude !== undefined) {
    report.location ??= { latitude, longitude }
    add(report, 'location', 'GPS position', formatPosition(latitude, longitude))
  }
  const place = ['Iptc4xmpCore:Location', 'photoshop:City', 'photoshop:State', 'photoshop:Country'].map(get).filter(Boolean)
  add(report, 'location', 'Place', place.join(', '))
  add(report, 'device', 'Camera', [get('tiff:Make'), get('tiff:Model')].filter(Boolean).join(' '))
  add(report, 'time', 'Taken', exifDate(get('exif:DateTimeOriginal') || get('photoshop:DateCreated') || get('xmp:CreateDate')).replace('T', ' ').slice(0, 16))
  add(report, 'person', 'Creator', get('dc:creator'))
  add(report, 'person', 'Copyright', get('dc:rights'))
  add(report, 'software', 'Software', get('xmp:CreatorTool'))
  add(report, 'other', 'Title', get('dc:title'))
  add(report, 'other', 'Description', get('dc:description'))
  if (/xmpMM:History/.test(xml)) add(report, 'other', 'Editing history', 'A record of edits and the apps used')
  if (report.findings.length === before) add(report, 'other', 'XMP data', 'Editing and description details')
}

/** XMP writes positions like "40,42.768N" or "40,42,46.08N". */
function xmpDegrees(value: string): number | undefined {
  const match = /^(\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?))?(?:,(\d+(?:\.\d+)?))?([NSEW])$/i.exec(value.trim())
  if (!match) return undefined
  const degrees = Number(match[1]) + Number(match[2] ?? 0) / 60 + Number(match[3] ?? 0) / 3600
  return /[SW]/i.test(match[4]) ? -degrees : degrees
}

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

// PNG

interface Chunk {
  type: string
  start: number
  data: number
  length: number
  end: number
}

function pngChunks(b: Uint8Array): Chunk[] {
  const chunks: Chunk[] = []
  let i = 8
  while (i + 12 <= b.length) {
    const length = u32be(b, i)
    const type = ascii(b, i + 4, 4)
    const end = i + 12 + length
    if (end > b.length || !/^[A-Za-z]{4}$/.test(type)) throw damaged()
    chunks.push({ type, start: i, data: i + 8, length, end })
    if (type === 'IEND') return chunks
    i = end
  }
  if (!chunks.some((c) => c.type === 'IDAT')) throw damaged()
  return chunks
}

/** Chunks needed to show the image: pixels, palette, transparency, color, size, and animation. */
const PNG_KEEP = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'cHRM', 'gAMA', 'iCCP', 'sBIT', 'sRGB', 'cICP', 'mDCV', 'cLLI', 'pHYs', 'bKGD', 'hIST', 'acTL', 'fcTL', 'fdAT'])

const PNG_TEXT_KINDS: Record<string, FindingKind> = {
  author: 'person',
  copyright: 'person',
  software: 'software',
  'creation time': 'time',
  source: 'device',
}

function readPng(b: Uint8Array, report: Report) {
  for (const chunk of pngChunks(b)) {
    const data = b.subarray(chunk.data, chunk.data + chunk.length)
    if (chunk.type === 'eXIf') readExif(data, report)
    else if (chunk.type === 'tIME' && data.length >= 7) {
      const pad = (n: number) => String(n).padStart(2, '0')
      add(report, 'time', 'Last saved', `${u16be(data, 0)}-${pad(data[2])}-${pad(data[3])} ${pad(data[4])}:${pad(data[5])}`)
    } else if (chunk.type === 'tEXt' || chunk.type === 'zTXt' || chunk.type === 'iTXt') {
      const zero = data.indexOf(0)
      const keyword = latin1.decode(data.subarray(0, zero < 0 ? data.length : zero))
      let text = 'Compressed text'
      if (chunk.type === 'tEXt') text = latin1.decode(data.subarray(zero + 1))
      if (chunk.type === 'iTXt' && data[zero + 1] === 0) {
        let at = zero + 3
        for (let skip = 0; skip < 2 && at > 0; skip++) at = data.indexOf(0, at) + 1 // language tag, translated keyword
        text = at > 0 ? utf8.decode(data.subarray(at)) : ''
      }
      if (keyword === 'XML:com.adobe.xmp') readXmp(text, report)
      else if (/^Raw profile type (exif|app1)$/i.test(keyword)) add(report, 'device', 'Camera data (EXIF)', 'Stored as text by an editing app')
      else add(report, PNG_TEXT_KINDS[keyword.toLowerCase()] ?? 'other', keyword || 'Text', text)
    } else if (!PNG_KEEP.has(chunk.type) && /^[a-z]/.test(chunk.type)) {
      add(report, 'other', 'Other app data', `A “${chunk.type}” block added by an app`)
    }
  }
}

function cleanPng(b: Uint8Array): Uint8Array<ArrayBuffer> {
  // Unknown critical chunks (capitalized) are kept, because the image may not show without them.
  const kept = pngChunks(b).filter((c) => PNG_KEEP.has(c.type) || /^[A-Z]/.test(c.type))
  return concat([b.subarray(0, 8), ...kept.map((c) => b.subarray(c.start, c.end))])
}

// WebP

function webpChunks(b: Uint8Array): Chunk[] {
  const chunks: Chunk[] = []
  const riffEnd = Math.min(8 + u32le(b, 4), b.length)
  let i = 12
  while (i + 8 <= riffEnd) {
    const type = ascii(b, i, 4)
    const length = u32le(b, i + 4)
    if (i + 8 + length > riffEnd) throw damaged()
    const end = Math.min(i + 8 + length + (length & 1), riffEnd)
    chunks.push({ type, start: i, data: i + 8, length, end })
    i = end
  }
  if (!chunks.some((c) => c.type === 'VP8 ' || c.type === 'VP8L' || c.type === 'ANMF')) throw damaged()
  return chunks
}

const WEBP_KEEP = new Set(['VP8 ', 'VP8L', 'VP8X', 'ALPH', 'ANIM', 'ANMF', 'ICCP'])

function readWebp(b: Uint8Array, report: Report) {
  for (const chunk of webpChunks(b)) {
    const data = b.subarray(chunk.data, chunk.data + chunk.length)
    if (chunk.type === 'EXIF') readExif(ascii(data, 0, 6) === 'Exif\0\0' ? data.subarray(6) : data, report)
    else if (chunk.type === 'XMP ') readXmp(utf8.decode(data), report)
    else if (!WEBP_KEEP.has(chunk.type)) add(report, 'other', 'Other app data', `A “${chunk.type.trim()}” block added by an app`)
  }
}

function cleanWebp(b: Uint8Array): Uint8Array<ArrayBuffer> {
  const parts = webpChunks(b)
    .filter((c) => WEBP_KEEP.has(c.type))
    .map((c) => {
      const copy = b.slice(c.start, c.end)
      if (c.type === 'VP8X') copy[8] &= ~0x0c // Clear the "has EXIF" and "has XMP" flags.
      return copy
    })
  const body = concat(parts)
  const header = new Uint8Array(12)
  header.set([0x52, 0x49, 0x46, 0x46], 0)
  new DataView(header.buffer).setUint32(4, body.length + 4, true)
  header.set([0x57, 0x45, 0x42, 0x50], 8)
  return concat([header, body])
}
