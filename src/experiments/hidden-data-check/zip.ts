// Reading a zip (an .xlsx is one) straight from the file, a part at a time, so a large workbook is never held whole.

export interface Entry {
  name: string
  /** 0 stored, 8 deflated. */
  method: number
  /** Bytes in the file. */
  compressed: number
  /** Bytes once inflated, as the zip says. */
  size: number
  /** Where the part's local header starts. */
  offset: number
  encrypted: boolean
}

/** Why a part can't be read: 'not-zip', 'damaged', 'encrypted', 'unsupported' (compressed some other way),
 * 'too-big' (past the part's own limit), or 'budget' (the whole check has read all it may). */
export class ZipError extends Error {}

/** What the whole check may still inflate, in bytes, shared by every part it reads. */
export interface Meter {
  left: number
}

/** More parts than any real workbook has (one with hundreds of sheets, each with its drawings and charts, has thousands). */
const MAX_ENTRIES = 100_000

/** The parts listed in a zip's central directory, ZIP64 included. */
export async function entries(file: Blob): Promise<Entry[]> {
  // The end record is in the last 22 bytes plus a comment of up to 65,535, and a ZIP64 locator sits just before it.
  const tailStart = Math.max(0, file.size - 65_557 - 20)
  const tail = new Uint8Array(await file.slice(tailStart).arrayBuffer())
  const view = new DataView(tail.buffer)
  let end = -1
  for (let i = tail.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) throw new ZipError('not-zip')
  let count = view.getUint16(end + 10, true)
  let dirSize = view.getUint32(end + 12, true)
  let dirOffset = view.getUint32(end + 16, true)
  if ((count === 0xffff || dirSize === 0xffffffff || dirOffset === 0xffffffff) && end >= 20 && view.getUint32(end - 20, true) === 0x07064b50) {
    const at = Number(view.getBigUint64(end - 20 + 8, true))
    const record = new DataView(await file.slice(at, at + 56).arrayBuffer())
    if (record.byteLength < 56 || record.getUint32(0, true) !== 0x06064b50) throw new ZipError('not-zip')
    count = Number(record.getBigUint64(32, true))
    dirSize = Number(record.getBigUint64(40, true))
    dirOffset = Number(record.getBigUint64(48, true))
  }
  if (dirOffset + dirSize > file.size || dirSize > 100_000_000) throw new ZipError('not-zip')
  const dir = new Uint8Array(await file.slice(dirOffset, dirOffset + dirSize).arrayBuffer())
  const d = new DataView(dir.buffer)
  const decoder = new TextDecoder()
  const out: Entry[] = []
  let p = 0
  for (let n = 0; n < count && p + 46 <= dir.length; n++) {
    if (out.length >= MAX_ENTRIES) throw new ZipError('too-big')
    if (d.getUint32(p, true) !== 0x02014b50) throw new ZipError('not-zip')
    const flags = d.getUint16(p + 8, true)
    const method = d.getUint16(p + 10, true)
    let compressed = d.getUint32(p + 20, true)
    let size = d.getUint32(p + 24, true)
    const nameLength = d.getUint16(p + 28, true)
    const extraLength = d.getUint16(p + 30, true)
    const commentLength = d.getUint16(p + 32, true)
    let offset = d.getUint32(p + 42, true)
    const name = decoder.decode(dir.subarray(p + 46, p + 46 + nameLength))
    // A ZIP64 extra field holds the sizes and offset that didn't fit, in this order, each only if its field above is full.
    let e = p + 46 + nameLength
    const extraEnd = Math.min(dir.length, e + extraLength)
    while (e + 4 <= extraEnd) {
      const id = d.getUint16(e, true)
      const length = d.getUint16(e + 2, true)
      if (id === 0x0001) {
        let q = e + 4
        const stop = Math.min(extraEnd, q + length)
        if (size === 0xffffffff && q + 8 <= stop) (size = Number(d.getBigUint64(q, true))), (q += 8)
        if (compressed === 0xffffffff && q + 8 <= stop) (compressed = Number(d.getBigUint64(q, true))), (q += 8)
        if (offset === 0xffffffff && q + 8 <= stop) offset = Number(d.getBigUint64(q, true))
      }
      e += 4 + length
    }
    out.push({ name, method, compressed, size, offset, encrypted: (flags & 1) === 1 })
    p = extraEnd + commentLength
  }
  return out
}

/** A part's bytes, inflated, as a stream that errors with ZipError('too-big') once it passes `limit` bytes, or with
 * ZipError('budget') once the meter runs out. */
export async function open(file: Blob, entry: Entry, limit: number, meter?: Meter): Promise<ReadableStream<Uint8Array>> {
  if (entry.encrypted) throw new ZipError('encrypted')
  if (entry.method !== 0 && entry.method !== 8) throw new ZipError('unsupported')
  if (meter && meter.left <= 0) throw new ZipError('budget')
  const head = new DataView(await file.slice(entry.offset, entry.offset + 30).arrayBuffer())
  if (head.byteLength < 30 || head.getUint32(0, true) !== 0x04034b50) throw new ZipError('damaged')
  const start = entry.offset + 30 + head.getUint16(26, true) + head.getUint16(28, true)
  // A file cut short would otherwise give a stored part's first bytes as if they were all of it.
  if (start + entry.compressed > file.size) throw new ZipError('damaged')
  let raw: ReadableStream<Uint8Array> = file.slice(start, start + entry.compressed).stream()
  if (entry.method === 8) raw = raw.pipeThrough(new DecompressionStream('deflate-raw') as unknown as ReadableWritablePair<Uint8Array, Uint8Array>)
  let total = 0
  return raw.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        total += chunk.length
        if (meter) meter.left -= chunk.length
        if (total > limit) controller.error(new ZipError('too-big'))
        else if (meter && meter.left < 0) controller.error(new ZipError('budget'))
        else controller.enqueue(chunk)
      },
    }),
  )
}

/** A whole part as bytes, for the small ones (and for a zip inside a zip). */
export async function bytes(file: Blob, entry: Entry, limit: number, meter?: Meter): Promise<Uint8Array> {
  const reader = (await open(file, entry, limit, meter)).getReader()
  const chunks: Uint8Array[] = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return joined(chunks, Infinity)
}

/** A part's first `n` bytes (fewer if it's shorter), reading no further: enough to tell what kind of thing it is. */
export async function head(file: Blob, entry: Entry, n: number): Promise<Uint8Array> {
  const reader = (await open(file, entry, Infinity)).getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  try {
    while (total < n) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      total += value.length
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  return joined(chunks, n)
}

function joined(chunks: Uint8Array[], max: number): Uint8Array {
  const out = new Uint8Array(Math.min(max, chunks.reduce((sum, c) => sum + c.length, 0)))
  let at = 0
  for (const c of chunks) {
    if (at >= out.length) break
    out.set(c.subarray(0, out.length - at), at)
    at += c.length
  }
  return out
}
