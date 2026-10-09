import { CsvParser, detectDelimiter } from './csv.ts'
import { classify, Profiler, type Profile } from './profile.ts'

export interface Checkup {
  profile: Profile
  delimiter: string
  encoding: 'UTF-8' | 'Windows-1252'
  /** Whether the first row was read as column names. */
  hasHeader: boolean
  unclosedQuote: boolean
}

/**
 * Reads a whole CSV file in a stream and profiles it. Tries UTF-8 first and
 * falls back to Windows-1252, the usual encoding of older spreadsheet exports.
 * `hasHeader` overrides the guess about the first row.
 */
export async function checkFile(file: Blob, onProgress: (fraction: number) => void, hasHeader?: boolean): Promise<Checkup> {
  try {
    return await read(file, 'UTF-8', onProgress, hasHeader)
  } catch (error) {
    if (!(error instanceof TypeError)) throw error // TextDecoder reports bad UTF-8 as a TypeError.
    return read(file, 'Windows-1252', onProgress, hasHeader)
  }
}

async function read(file: Blob, encoding: Checkup['encoding'], onProgress: (fraction: number) => void, headerOverride?: boolean): Promise<Checkup> {
  const label = encoding === 'UTF-8' ? 'utf-8' : 'windows-1252'
  const sample = new TextDecoder(label, { fatal: encoding === 'UTF-8' }).decode(await file.slice(0, 65536).arrayBuffer(), { stream: true })
  const delimiter = detectDelimiter(sample)
  const hasHeader = headerOverride ?? looksLikeHeader(sample, delimiter)
  const profiler = new Profiler(hasHeader, delimiter === ';')
  const parser = new CsvParser(delimiter, (row) => profiler.add(row))

  let read = 0
  let first = true
  let lastYield = performance.now()
  const counted = file.stream().pipeThrough(
    new TransformStream<Uint8Array<ArrayBuffer>, BufferSource>({
      transform(chunk, controller) {
        read += chunk.length
        controller.enqueue(chunk)
      },
    }),
  )
  const reader = counted.pipeThrough(new TextDecoderStream(label, { fatal: encoding === 'UTF-8' })).getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    parser.push(first ? value.replace(/^\uFEFF/, '') : value)
    first = false
    if (performance.now() - lastYield > 40) {
      onProgress(file.size ? read / file.size : 1)
      await new Promise((resolve) => setTimeout(resolve, 0)) // let the page paint and stay responsive
      lastYield = performance.now()
    }
  }
  parser.end()
  onProgress(1)
  return { profile: profiler.result(), delimiter, encoding, hasHeader, unclosedQuote: parser.unclosedQuote }
}

/** The first row is probably column names when its values are all filled in, all different, and all plain text. */
export function looksLikeHeader(sample: string, delimiter: string): boolean {
  let head: string[] | undefined
  const parser = new CsvParser(delimiter, (row) => (head ??= row))
  parser.push(sample.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/)[0])
  parser.end()
  if (!head) return true
  const names = head.map((v) => v.trim())
  if (names.some((n) => !n) || new Set(names.map((n) => n.toLowerCase())).size !== names.length) return false
  return names.every((n) => classify(n).kind === 'text')
}
