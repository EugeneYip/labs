/**
 * Clean Paste's text repair: turns text copied from PDFs and emails back into
 * readable paragraphs. Pure functions only, with no React and no storage.
 */

export interface Options {
  /** Rejoin lines that the PDF or email wrapped, keeping real paragraph breaks. */
  joinLines: boolean
  /** Rejoin words split by a hyphen at the end of a line. */
  fixHyphens: boolean
  /** Drop page numbers and headers or footers repeated on every page. */
  dropPageFurniture: boolean
  /** Fix ligatures (ﬁ), odd spaces, invisible characters, and repeated spaces. */
  tidyCharacters: boolean
  /** Remove the ">" marks of quoted email text. */
  stripQuoteMarks: boolean
  /** Turn curly quotes into straight ones. */
  straightQuotes: boolean
  /** What separates paragraphs in the result. */
  paragraphBreak: 'blank' | 'single'
}

export const DEFAULT_OPTIONS: Options = {
  joinLines: true,
  fixHyphens: true,
  dropPageFurniture: true,
  tidyCharacters: true,
  stripQuoteMarks: true,
  straightQuotes: false,
  paragraphBreak: 'blank',
}

export interface Stats {
  joinedLines: number
  fixedHyphens: number
  removedLines: number
  fixedCharacters: number
}

const LIGATURES: Record<string, string> = { 'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'st', 'ﬆ': 'st' }
const ODD_SPACES = /[\u00a0\u1680\u2000-\u200a\u202f\u205f\t]/g
const INVISIBLE = /[\u200b\ufeff]/g
const SOFT_HYPHEN = '\u00ad'
const LIST_ITEM = /^(?:[•◦▪▫‣⁃●○■□►✓✔*]|[-–—](?=\s)|\(?\d{1,3}[.)]|\(?[a-z][.)]|\(?(?:i{1,3}|iv|v|vi{0,3}|ix|x)[.)])\s+/i
const PAGE_NUMBER = /^(?:(?:page|p\.|pg\.?|seite|página|pagina)\s*)?[-–—]?\s*\d{1,4}\s*[-–—]?(?:\s*(?:of|\/|von|de)\s*\d{1,4})?$/i
const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿\u3000-〿＀-￯]/
const SENTENCE_END = /[.!?。！？]["'”’)\]]*$/

export function mend(input: string, options: Options): { text: string; stats: Stats } {
  const stats: Stats = { joinedLines: 0, fixedHyphens: 0, removedLines: 0, fixedCharacters: 0 }
  let lines = input.replace(/\r\n?|[\u2028\u2029\f\v]/g, '\n').split('\n')

  if (options.tidyCharacters) lines = lines.map((line) => tidy(line, stats))
  else lines = lines.map((line) => line.replace(/\s+$/, ''))

  if (options.stripQuoteMarks) lines = stripQuotes(lines)
  if (options.dropPageFurniture) lines = dropFurniture(lines, stats)
  lines = lines.map((line) => line.trim())

  let text = options.joinLines && looksWrapped(lines) ? joinParagraphs(lines, options, stats) : keepLines(lines, options)
  if (options.straightQuotes) text = text.replace(/[“”„‟″]/g, '"').replace(/[‘’‚‛′]/g, "'")
  return { text: text.trim(), stats }
}

function tidy(line: string, stats: Stats): string {
  let fixed = 0
  const out = line
    .replace(/[ﬀﬁﬂﬃﬄﬅﬆ]/g, (c) => {
      fixed++
      return LIGATURES[c]
    })
    .replace(ODD_SPACES, () => {
      fixed++
      return ' '
    })
    .replace(INVISIBLE, () => {
      fixed++
      return ''
    })
    // A soft hyphen inside a line is invisible; at the end of a line it marks a split word.
    .replace(/\u00ad(?!$)/g, () => {
      fixed++
      return ''
    })
    .trim() // Indentation and trailing spaces go without counting as fixes.
    .replace(/ {2,}/g, (spaces) => {
      fixed += spaces.length - 1
      return ' '
    })
  stats.fixedCharacters += fixed
  return out
}

/** Removes ">" quote marks when most lines are quoted, as in a forwarded email. */
function stripQuotes(lines: string[]): string[] {
  const nonEmpty = lines.filter((l) => l.trim())
  const quoted = nonEmpty.filter((l) => /^\s*>/.test(l))
  if (!nonEmpty.length || quoted.length / nonEmpty.length < 0.5) return lines
  return lines.map((l) => l.replace(/^\s*(?:>\s?)+/, ''))
}

/** Drops page-number lines, and short lines repeated far apart, like a title printed on every page. */
function dropFurniture(lines: string[], stats: Stats): string[] {
  const key = (line: string) => line.trim().toLowerCase().replace(/\d+/g, '#')
  const positions = new Map<string, number[]>()
  lines.forEach((line, i) => {
    const k = key(line)
    if (k.length >= 3 && k.length <= 60 && /\p{L}{3}/u.test(k) && !LIST_ITEM.test(line.trim())) {
      positions.set(k, [...(positions.get(k) ?? []), i])
    }
  })
  const repeated = new Set<string>()
  for (const [k, at] of positions) {
    if (at.length >= 3 && (at[at.length - 1] - at[0]) / (at.length - 1) >= 15) repeated.add(k)
  }
  return lines.filter((line) => {
    const drop = PAGE_NUMBER.test(line.trim()) || repeated.has(key(line))
    if (drop) stats.removedLines++
    return !drop
  })
}

/**
 * True when lines look hard-wrapped at a fixed width, rather than written one
 * paragraph (or one poem line) per line. Wrapping shows in lines that run on
 * into more prose: most of those reach close to the full width.
 */
function looksWrapped(lines: string[]): boolean {
  const lengths = lines.filter((l) => l).map((l) => l.length)
  if (lengths.length < 2) return false
  const typical = width(lengths)
  if (typical < 25 || typical > 160) return false
  const runOn = lines.filter((line, i) => line && lines[i + 1] && !LIST_ITEM.test(lines[i + 1]))
  return runOn.length > 0 && runOn.filter((l) => l.length >= typical * 0.6).length / runOn.length >= 0.5
}

/** Roughly the width the text was wrapped at: a high percentile of line lengths. */
function width(lengths: number[]): number {
  const sorted = [...lengths].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9))]
}

interface Block {
  list: boolean
  text: string
  /** Separated from the previous block by a blank line in the original. */
  afterGap: boolean
}

function joinParagraphs(lines: string[], options: Options, stats: Stats): string {
  const typical = width(lines.filter((l) => l).map((l) => l.length))
  const whole = lines.join(' ')
  const blocks: Block[] = []
  let current: Block | null = null
  let last = ''
  let gap = false

  for (const line of lines) {
    if (!line) {
      if (current) blocks.push(current)
      current = null
      gap = true
      continue
    }
    const listItem = LIST_ITEM.test(line)
    if (current && !listItem && shouldJoin(last, line, typical)) {
      const hyphen = /(\p{L}+)-$/u.exec(current.text)
      if (current.text.endsWith(SOFT_HYPHEN)) {
        // A soft hyphen marks where a word was split for layout: always rejoin it.
        current.text = current.text.slice(0, -1) + line
        stats.fixedHyphens++
      } else if (hyphen && /^\p{Ll}/u.test(line)) {
        // "infor-" + "mation" → "information", unless the text writes the pair hyphenated elsewhere ("well-known").
        const next = /^\p{L}+/u.exec(line)![0]
        const compound = !options.fixHyphens || new RegExp(`(^|[^\\p{L}])${escape(hyphen[1])}-${escape(next)}(?![\\p{L}])`, 'iu').test(whole)
        current.text = current.text.slice(0, -1) + (compound ? '-' : '') + line
        if (!compound) stats.fixedHyphens++
      } else {
        // No space after a dash ("anti-" + "American") or between Chinese or Japanese characters.
        const glue = /[-–—]$/.test(current.text) || (CJK.test(current.text.slice(-1)) && CJK.test(line[0])) ? '' : ' '
        current.text += glue + line
      }
      stats.joinedLines++
    } else {
      if (current) blocks.push(current)
      current = { list: listItem, text: line, afterGap: gap }
    }
    gap = false
    last = line
  }
  if (current) blocks.push(current)

  const breakBetween = options.paragraphBreak === 'blank' ? '\n\n' : '\n'
  return blocks.map((b, i) => (i === 0 ? '' : b.list && blocks[i - 1].list && !b.afterGap ? '\n' : breakBetween) + b.text.replaceAll(SOFT_HYPHEN, '')).join('')
}

/**
 * Wrapped lines run close to the full width. A line that stops short, or ends a
 * sentence just before a capital letter, usually ends its paragraph or heading.
 * A next line that starts in lowercase is almost always a continuation.
 */
function shouldJoin(previous: string, line: string, typical: number): boolean {
  if (/^\p{Ll}/u.test(line) || /[-\u00ad]$/.test(previous)) return true
  if (previous.length < typical * 0.6) return false
  if (SENTENCE_END.test(previous) && /^[\p{Lu}\d"“‘(]/u.test(line) && previous.length < typical * 0.9) return false
  return true
}

/** Keeps the original line breaks, with runs of blank lines collapsed. */
function keepLines(lines: string[], options: Options): string {
  const blank = options.paragraphBreak === 'blank' ? '\n\n' : '\n'
  return lines.join('\n').replace(/\n{2,}/g, blank).replaceAll(SOFT_HYPHEN, '')
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
