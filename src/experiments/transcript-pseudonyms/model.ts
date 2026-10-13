/**
 * Replaces chosen identifiers in a transcript with pseudonyms. One pass over the text changes only the matched words;
 * everything else, spacing and punctuation included, comes out exactly as it went in.
 */

export interface Identifier {
  id: string
  /** What to find, as typed: "Alex", "Alex Rodriguez", "alex@example.com". */
  text: string
  /** What it becomes: "[Person 1]", "Sam", "[Town A]". */
  pseudonym: string
  /** Also replace it written all in lowercase, as in "alex". Off by default, so the name Will leaves "I will" alone. */
  lowercase: boolean
}

export type Kind = 'name' | 'email' | 'phone' | 'link' | 'handle'

export interface Suggestion {
  text: string
  kind: Kind
  count: number
  /** A few words around the first use, to help decide. */
  context: string
  /** Capitalized somewhere other than the start of a sentence, or as a speaker's name: more likely a name. */
  strong: boolean
}

export const LIMITS = { text: 5_000_000, identifiers: 500, identifier: 120, pseudonym: 60, suggestions: 400 }

const LETTER = String.raw`\p{L}\p{M}\p{N}_`
/** Never part of an identifier's word: so "Ann" doesn't match inside "Annual", nor "Alex" inside "Alexander". */
const BEFORE = String.raw`(?<![${LETTER}])`
const AFTER = String.raw`(?![${LETTER}])`

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** An identifier's words, joined by any run of spaces or line breaks. */
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean)

/** Emails, links, phone numbers, and handles are matched whatever their case. */
function caseless(text: string): boolean {
  return /[@\d]/.test(text) || /^(?:https?:\/\/|www\.)/i.test(text)
}

const capitalized = (w: string) => (w ? w[0].toLocaleUpperCase() + w.slice(1) : w)

/** The ways one identifier may be written: as typed, with each word capitalized, in capitals, and lowercase if chosen, each in both Unicode forms. */
export function forms(identifier: Identifier): string[] {
  const parts = words(identifier.text)
  if (!parts.length) return []
  const variants = new Set<string>()
  const add = (ws: string[]) => {
    const joined = ws.join(' ')
    variants.add(joined.normalize('NFC'))
    variants.add(joined.normalize('NFD'))
  }
  add(parts)
  add(parts.map(capitalized))
  add(parts.map((w) => w.toLocaleUpperCase()))
  if (identifier.lowercase) add(parts.map((w) => w.toLocaleLowerCase()))
  return [...variants]
}

/** How a matched piece of text is looked up: its words joined by single spaces, in composed form. */
const keyOf = (s: string, ignoreCase: boolean) => {
  const k = words(s).join(' ').normalize('NFC')
  return ignoreCase ? k.toLocaleLowerCase() : k
}

export interface Matcher {
  pattern: RegExp | null
  /** Exact forms to their identifier; caseless ones are looked up in lowercase. */
  exact: Map<string, Identifier>
  caseless: Map<string, Identifier>
  /** The same text given two different pseudonyms: the first one listed is used. */
  conflicts: string[]
}

export function matcher(identifiers: readonly Identifier[]): Matcher {
  const exact = new Map<string, Identifier>()
  const loose = new Map<string, Identifier>()
  const conflicts = new Set<string>()
  const alternatives: string[] = []
  for (const identifier of identifiers) {
    const text = identifier.text.trim()
    if (!text) continue
    const ignoreCase = caseless(text)
    const list = ignoreCase ? [text] : forms(identifier)
    for (const form of list) {
      const key = keyOf(form, ignoreCase)
      const map = ignoreCase ? loose : exact
      const seen = map.get(key)
      if (seen && seen.pseudonym !== identifier.pseudonym) conflicts.add(words(text).join(' '))
      if (!seen) map.set(key, identifier)
      // Spaces between words match any run of spaces or line breaks; letters match as written (or any case, for emails and links).
      const body = words(form).map((w) => (ignoreCase ? [...w].map((ch) => (ch.toLowerCase() !== ch.toUpperCase() ? `[${escape(ch.toLowerCase())}${escape(ch.toUpperCase())}]` : escape(ch))).join('') : escape(w))).join(String.raw`[\s ]+`)
      alternatives.push(body)
    }
  }
  // Longest first, so "Alex Rodriguez" is taken whole before "Alex" alone could match.
  const unique = [...new Set(alternatives)].sort((a, b) => b.length - a.length)
  const pattern = unique.length ? new RegExp(`${BEFORE}(?:${unique.join('|')})${AFTER}`, 'gu') : null
  return { pattern, exact, caseless: loose, conflicts: [...conflicts] }
}

export interface Replacement {
  /** Where the original text was, in the input. */
  start: number
  end: number
  identifier: Identifier
}

export interface Result {
  output: string
  replacements: Replacement[]
  /** Replacements per identifier id. */
  counts: Map<string, number>
}

/** Replaces every match in one pass. Text between matches is copied exactly. */
export function pseudonymize(text: string, identifiers: readonly Identifier[]): Result {
  const m = matcher(identifiers)
  const replacements: Replacement[] = []
  const counts = new Map<string, number>()
  if (!m.pattern) return { output: text, replacements, counts }
  let out = ''
  let last = 0
  for (const match of text.matchAll(m.pattern)) {
    const found = match[0]
    const start = match.index
    const identifier = m.exact.get(keyOf(found, false)) ?? m.caseless.get(keyOf(found, true))
    // Every alternative came from an identifier, so this always finds one; if not, the text stays as it was.
    if (!identifier) continue
    out += text.slice(last, start) + identifier.pseudonym
    last = start + found.length
    replacements.push({ start, end: last, identifier })
    counts.set(identifier.id, (counts.get(identifier.id) ?? 0) + 1)
  }
  out += text.slice(last)
  return { output: out, replacements, counts }
}

/** The output in pieces: unchanged text, and each pseudonym with the identifier it replaced. Up to `limit` characters. */
export function pieces(text: string, result: Result, limit = Infinity): { text: string; identifier?: Identifier }[] {
  const out: { text: string; identifier?: Identifier }[] = []
  let at = 0
  let length = 0
  const push = (piece: { text: string; identifier?: Identifier }) => {
    if (!piece.text || length >= limit) return
    const room = limit - length
    out.push(piece.text.length > room ? { ...piece, text: piece.text.slice(0, room) } : piece)
    length += Math.min(piece.text.length, room)
  }
  for (const r of result.replacements) {
    push({ text: text.slice(at, r.start) })
    push({ text: r.identifier.pseudonym, identifier: r.identifier })
    at = r.end
    if (length >= limit) return out
  }
  push({ text: text.slice(at) })
  return out
}

/** Uses of a name identifier written in lowercase and left alone, per identifier id (only where lowercase is off). One pass over the text. */
export function lowercaseLeft(text: string, identifiers: readonly Identifier[]): Map<string, number> {
  const owners = new Map<string, string>()
  const alternatives: string[] = []
  for (const identifier of identifiers) {
    const t = identifier.text.trim()
    if (!t || identifier.lowercase || caseless(t)) continue
    const lower = words(t).map((w) => w.toLocaleLowerCase())
    if (lower.join(' ') === words(t).join(' ')) continue
    const key = lower.join(' ').normalize('NFC')
    if (owners.has(key)) continue
    owners.set(key, identifier.id)
    alternatives.push(lower.map(escape).join(String.raw`[\s\u00a0]+`))
  }
  const left = new Map<string, number>()
  if (!alternatives.length) return left
  const pattern = new RegExp(`${BEFORE}(?:${alternatives.sort((a, b) => b.length - a.length).join('|')})${AFTER}`, 'gu')
  for (const m of text.matchAll(pattern)) {
    const owner = owners.get(words(m[0]).join(' ').normalize('NFC'))
    if (owner) left.set(owner, (left.get(owner) ?? 0) + 1)
  }
  return left
}

// Suggestions. Names: capitalized words that aren't just starting a sentence, and runs of them ("Alex Rodriguez",
// "St Mary's Hospital"). Also emails, links, phone numbers, and @handles. They're a starting point to review, not a
// finding: the page says what they can't catch.

/** Common words that start sentences or label speakers, and days and months, which are capitalized without naming anyone. */
const COMMON = new Set(
  (
    'I Im Ive Id Ill A An And As At But By For From Hmm If In Into Is It Its Mm Mhm My No Not Now Of Oh Ok Okay On Or Our ' +
    'So Some Than That The Their Then There These They This Those To Uh Um Up Us We Well What When Where Which Who Why ' +
    'With Yeah Yes You Your He She Him Her His Hers Me Mine Was Were Be Been Being Do Does Did Done Have Has Had Can Could ' +
    'Would Should Shall Might Must Just Like Right Sure Really Actually Also Because Maybe Very All Any Each Every ' +
    'One Two Three First Second Last Next Other Another Here How Interviewer Interviewee Respondent Participant Speaker ' +
    'Moderator Facilitator Researcher Q A R P S Inaudible Laughs Laughter Pause Crosstalk Unclear ' +
    'Ask Tell Call Let Lets Look Listen Come Go Get Give Take Make Put Say See Think Try Wait Keep Bring Remember Imagine ' +
    'Please Thanks Thank Sorry Hello Hi Hey Dear Bye Goodbye Basically Honestly Anyway Obviously Definitely Absolutely ' +
    'Exactly Probably Perhaps Sometimes Usually Often Never Always Still Even Only Again Once Later Soon Today Tomorrow ' +
    'Yesterday Tonight Everyone Everybody Someone Somebody Nobody Nothing Something Everything Anything Most Many Much ' +
    'More Less Few Both Either Neither After Before During Since Until While Although Though However Therefore Otherwise ' +
    'Besides Meanwhile Instead Plus Too Nor Yet Whether Unless About Above Across Against Along Among Around Behind ' +
    'Below Beside Between Beyond Down Inside Near Off Out Outside Over Past Through Toward Towards Under Upon Within ' +
    'Without Good Great Fine Nice Cool Alright Thing Things People Lots Kind Sort Bit Little Big Final Finally Firstly ' +
    'Secondly Lastly Overall Generally Personally Unfortunately Luckily Hopefully Apparently Clearly Certainly Surely ' +
    'Literally Seriously Totally Completely Mostly Partly Quite Rather Pretty Almost Already Enough Ever Such Same Own ' +
    'Whatever Whenever Wherever Whoever Huh Ah Aha Wow Ooh Er Erm Email ' +
    'Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April June July August September ' +
    'October November December'
  ).split(' '),
)

const TITLES = /^(?:Mr|Mrs|Ms|Miss|Mx|Dr|Prof|Professor|Sir|Dame|Rev|Father|Sister|Uncle|Aunt|Auntie|Grandma|Grandpa|Nana|Mum|Mom|Dad)\.?$/

/** A capitalized word: a capital, then letters, with Mc/O'/hyphenated joins inside ("O'Brien", "Jean-Luc"). */
const WORD = /\p{Lu}[\p{L}\p{M}]*(?:[’'-]\p{Lu}[\p{L}\p{M}]*)*/gu

export function suggest(text: string, already: readonly Identifier[] = []): Suggestion[] {
  const found = new Map<string, Suggestion>()
  const covered = matcher(already)
  const isCovered = (s: string) => covered.exact.has(keyOf(s, false)) || covered.caseless.has(keyOf(s, true))
  const add = (t: string, kind: Kind, at: number, strong = true) => {
    const key = kind === 'name' ? t : t.toLowerCase()
    if (isCovered(t)) return
    const s = found.get(key)
    if (s) {
      s.count++
      if (strong && !s.strong) {
        s.strong = true
        s.context = contextAt(text, at, t.length)
      }
    } else if (found.size < LIMITS.suggestions * 4) found.set(key, { text: t, kind, count: 1, context: contextAt(text, at, t.length), strong })
  }

  // Lowercase words used anywhere: a capitalized word that's also used in lowercase is probably just starting a sentence.
  const lower = new Set<string>()
  for (const m of text.matchAll(/(?<![\p{L}\p{M}])\p{Ll}[\p{L}\p{M}]*/gu)) lower.add(m[0])

  // Runs of capitalized words, with the position where each run starts.
  const tokens = [...text.matchAll(WORD)].filter((m) => !/[\p{L}\p{M}\p{N}]/u.test(text[m.index - 1] ?? ''))
  let i = 0
  while (i < tokens.length) {
    const run = [tokens[i]]
    while (i + run.length < tokens.length) {
      const prev = run[run.length - 1]
      const next = tokens[i + run.length]
      const gap = text.slice(prev.index + prev[0].length, next.index)
      if (!/^ $/.test(gap)) break
      run.push(next)
    }
    // Drop common words from the ends ("So Alex" is "Alex"), but keep titles with a name after them ("Ms Rodriguez").
    let a = 0
    let b = run.length
    while (a < b && COMMON.has(clean(run[a][0])) && !TITLES.test(run[a][0])) a++
    while (b > a && COMMON.has(clean(run[b - 1][0]))) b--
    if (b > a) {
      const first = run[a]
      const lastToken = run[b - 1]
      const phrase = text.slice(first.index, lastToken.index + lastToken[0].length)
      const single = b - a === 1
      const word = first[0]
      const startsSentence = isSentenceStart(text, first.index)
      const titleOnly = single && TITLES.test(word)
      // At the start of a sentence a capital proves nothing: a lone word there that's also used in lowercase is left
      // out, and one that isn't is kept as a weaker suggestion. A speaker's name before a colon counts as strong.
      const ordinary = single && (lower.has(word.toLocaleLowerCase()) || lower.has(word.toLowerCase())) && startsSentence
      const speaker = /^[ \t]*:/.test(text.slice(lastToken.index + lastToken[0].length, lastToken.index + lastToken[0].length + 3)) && isLineStart(text, first.index)
      if (!titleOnly && !ordinary && word.length > 1) add(phrase, 'name', first.index, !startsSentence || speaker || !single)
    }
    i += run.length
  }

  for (const m of text.matchAll(/(?<![\p{L}\p{N}._%+-])[\p{L}\p{N}._%+-]+@[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+/gu)) add(m[0], 'email', m.index)
  for (const m of text.matchAll(/(?<![\p{L}\p{N}])(?:https?:\/\/|www\.)[^\s<>"]+[^\s<>".,;:!?)\]']/giu)) add(m[0], 'link', m.index)
  for (const m of text.matchAll(/(?<![\p{L}\p{N}@])@[\p{L}\p{N}_]{2,30}/gu)) add(m[0], 'handle', m.index)
  // Phone numbers: 7 to 15 digits, with spaces, dashes, dots, or brackets between, and maybe a + in front.
  for (const m of text.matchAll(/(?<![\p{N}\p{L}+])\+?\(?\d[\d ().-]{5,20}\d(?![\p{N}\p{L}])/gu)) {
    const digits = m[0].replace(/\D/g, '').length
    const t = m[0].trim()
    const dateLike = /^\d{1,4}[./-]\d{1,2}[./-]\d{1,4}$/.test(t) || /^(?:(?:19|20)\d{2}[\s,–-]*)+$/.test(t)
    if (digits >= 7 && digits <= 15 && !dateLike) add(t, 'phone', m.index)
  }

  return [...found.values()].sort((x, y) => Number(y.strong) - Number(x.strong) || y.count - x.count || x.text.localeCompare(y.text)).slice(0, LIMITS.suggestions)
}

/** Whether position `at` begins a line, after any spaces. */
function isLineStart(text: string, at: number): boolean {
  let j = at - 1
  while (j >= 0 && (text[j] === ' ' || text[j] === '\t')) j--
  return j < 0 || text[j] === '\n' || text[j] === '\r'
}

const clean = (w: string) => w.replace(/[’']/g, '')

/** Whether position `at` starts a sentence, a line, or a speaker's turn ("Alex: Yes, I…"). */
function isSentenceStart(text: string, at: number): boolean {
  let j = at - 1
  while (j >= 0 && /[ \t"“‘(\[]/.test(text[j])) j--
  return j < 0 || /[.!?…:\n\r]/.test(text[j])
}

/** About 40 characters either side, widened to the nearest space within 20 more, so a text without spaces costs no more. */
function contextAt(text: string, at: number, length: number): string {
  let from = Math.max(0, at - 40)
  const space = text.lastIndexOf(' ', from)
  if (space >= 0 && from - space <= 20) from = space + 1
  let to = Math.min(text.length, at + length + 40)
  const next = text.indexOf(' ', to)
  if (next >= 0 && next - to <= 20) to = next
  return `${from > 0 ? '…' : ''}${text.slice(from, to).replace(/\s+/g, ' ').trim()}${to < text.length ? '…' : ''}`
}

/** The next free numbered pseudonym of a kind, such as "[Name 3]". */
export function nextPseudonym(kind: Kind, identifiers: readonly Identifier[]): string {
  // "Name", not "Person": a capitalized suggestion may be a place or an organization, and "trained in [Person 6]" would mislead.
  const base = kind === 'name' ? 'Name' : kind === 'email' ? 'Email' : kind === 'phone' ? 'Phone' : kind === 'link' ? 'Link' : 'Handle'
  const used = new Set(identifiers.map((i) => i.pseudonym))
  for (let n = 1; ; n++) if (!used.has(`[${base} ${n}]`)) return `[${base} ${n}]`
}

// The key: a CSV of each identifier and its pseudonym, for the next transcript in a project.

/** Text a spreadsheet would run as a formula gets an apostrophe in front, as in Labs' other CSVs; then quotes if needed. */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[",\r\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function keyCsv(identifiers: readonly Identifier[]): string {
  const rows = [['Original', 'Pseudonym', 'Lowercase too'], ...identifiers.filter((i) => i.text.trim()).map((i) => [i.text.trim(), i.pseudonym, i.lowercase ? 'yes' : 'no'])]
  return '\uFEFF' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n'
}

/** Reads a key back: this page's own, or any two columns of original and pseudonym, separated by commas, semicolons, or tabs. */
export function readKey(csv: string, newId: () => string): { identifiers: Identifier[]; skipped: number } {
  const text = csv.replace(/^\uFEFF/, '')
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const sep = [',', ';', '\t'].map((s) => [s, splitRow(firstLine, s).length] as const).sort((a, b) => b[1] - a[1])[0][0]
  const rows = rowsOf(text, sep)
  const identifiers: Identifier[] = []
  let skipped = 0
  const undefuse = (v: string) => (/^'[=+\-@\t\r]/.test(v) ? v.slice(1) : v)
  for (const [n, row] of rows.entries()) {
    if (n === 0 && /^original$/i.test(row[0]?.trim() ?? '')) continue
    const original = undefuse(row[0] ?? '').trim().slice(0, LIMITS.identifier)
    const pseudonym = undefuse(row[1] ?? '').trim().slice(0, LIMITS.pseudonym)
    if (!original && !pseudonym) continue
    if (!original || !pseudonym || identifiers.length >= LIMITS.identifiers) {
      skipped++
      continue
    }
    identifiers.push({ id: newId(), text: original, pseudonym, lowercase: /^(yes|true|1)$/i.test((row[2] ?? '').trim()) })
  }
  return { identifiers, skipped }
}

function splitRow(line: string, sep: string): string[] {
  return rowsOf(line, sep)[0] ?? []
}

/** CSV rows, with quoted fields that may hold separators, quotes, and line breaks. */
function rowsOf(text: string, sep: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"' && field === '') quoted = true
    else if (ch === sep) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''))
}

// Word files: the main text of word/document.xml, read from the .docx (a zip) without any library.

const MAX_XML = 60_000_000

/** The text of a .docx's body: paragraphs on their own lines, tabs and line breaks kept, deleted (tracked) text left out. */
export async function docxText(bytes: Uint8Array): Promise<string> {
  const xml = await zipEntry(bytes, 'word/document.xml')
  if (xml === null) throw new Error('not-docx')
  return bodyText(new TextDecoder('utf-8').decode(xml))
}

/** The text in WordprocessingML, by scanning its tags in one pass. */
export function bodyText(xml: string): string {
  const out: string[] = []
  let skip = 0
  let inText = false
  const tag = /<(\/?)([\w:]+)([^>]*?)(\/?)>|([^<]+)/g
  for (const m of xml.replace(/<!--[\s\S]*?-->/g, '').matchAll(tag)) {
    if (m[5] !== undefined) {
      if (inText && !skip) out.push(decodeXml(m[5]))
      continue
    }
    const closing = m[1] === '/'
    const name = m[2]
    const selfClosing = m[4] === '/'
    // Tracked deletions, field codes, moved-away text, and the copy a text box keeps for older versions of Word never
    // appear in the document as read.
    if (name === 'w:del' || name === 'w:delText' || name === 'w:instrText' || name === 'w:moveFrom' || name === 'mc:Fallback') {
      if (!selfClosing) skip += closing ? -1 : 1
      if (skip < 0) skip = 0
      continue
    }
    if (name === 'w:t') inText = !closing && !selfClosing
    else if (!closing && (name === 'w:tab' || name === 'w:ptab')) skip || out.push('\t')
    else if (!closing && (name === 'w:br' || name === 'w:cr')) skip || out.push('\n')
    else if (!closing && name === 'w:noBreakHyphen') skip || out.push('-')
    else if (closing && name === 'w:p') skip || out.push('\n')
  }
  return out.join('').replace(/\n+$/, '\n')
}

function decodeXml(s: string): string {
  return s.replace(/&(?:#(\d+)|#x([0-9a-f]+)|(amp|lt|gt|quot|apos));/gi, (_whole, dec, hex, named) => {
    if (named) return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[named.toLowerCase() as 'amp']
    const code = dec ? Number(dec) : parseInt(hex, 16)
    return code > 0x10ffff ? '�' : String.fromCodePoint(code)
  })
}

/** One file from a zip, or null if it isn't there. Stored and deflated entries; decompression stops past a size limit. */
export async function zipEntry(bytes: Uint8Array, name: string): Promise<Uint8Array | null> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  // The end of the central directory is in the last 64 KB plus 22 bytes.
  let end = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) throw new Error('not-zip')
  const count = view.getUint16(end + 10, true)
  let p = view.getUint32(end + 16, true)
  for (let n = 0; n < count && p + 46 <= bytes.length; n++) {
    if (view.getUint32(p, true) !== 0x02014b50) throw new Error('not-zip')
    const method = view.getUint16(p + 10, true)
    const size = view.getUint32(p + 20, true)
    const nameLength = view.getUint16(p + 28, true)
    const extraLength = view.getUint16(p + 30, true)
    const commentLength = view.getUint16(p + 32, true)
    const local = view.getUint32(p + 42, true)
    const entryName = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLength))
    p += 46 + nameLength + extraLength + commentLength
    if (entryName !== name) continue
    if (local + 30 > bytes.length || view.getUint32(local, true) !== 0x04034b50) throw new Error('not-zip')
    const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true)
    const data = bytes.subarray(start, Math.min(bytes.length, start + size))
    if (method === 0) return data
    if (method !== 8) throw new Error('unsupported')
    return inflate(data)
  }
  return null
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.length
    if (total > MAX_XML) {
      await reader.cancel()
      throw new Error('too-big')
    }
    chunks.push(value)
  }
  const out = new Uint8Array(total)
  let at = 0
  for (const c of chunks) {
    out.set(c, at)
    at += c.length
  }
  return out
}
