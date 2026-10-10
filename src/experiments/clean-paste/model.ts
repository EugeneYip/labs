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
  /** The lines removed as page numbers and headers, so the summary can name them. */
  removed: string[]
  /** Lines whose email ">" marks were removed. */
  quoteMarks: number
  fixedCharacters: number
}

const LIGATURES: Record<string, string> = { 'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'st', 'ﬆ': 'st' }
const ODD_SPACES = /[\u00a0\u1680\u2000-\u200a\u202f\u205f\t]/g
const INVISIBLE = /[\u200b\ufeff]/g
const SOFT_HYPHEN = '\u00ad'
/** A hyphen ending a line: ASCII, or U+2010, as Preview and Safari copy a typeset one. */
const HYPHEN = '[-\u2010]'
const LIST_ITEM = /^(?:[•◦▪▫‣⁃●○■□►✓✔*]|[-–—](?=\s)|\(?\d{1,3}[.)]|\(?[a-z][.)]|\(?(?:i{1,3}|iv|v|vi{0,3}|ix|x)[.)])\s+/i
const PAGE_NUMBER = /^(?:(?:page|p\.|pg\.?|seite|página|pagina)\s*)?[-–—]?\s*\d{1,4}\s*[-–—]?(?:\s*(?:of|\/|von|de)\s*\d{1,4})?$/i
/** Forms only a page number takes: a page word, dashes on both sides, or a page count ("3 of 10"). */
const PAGE_ONLY = /^(?:page|p\.|pg\.?|seite|página|pagina)\s*\S|^[-–—]\s*\d+\s*[-–—]$|\d\s*(?:of|\/|von|de)\s*\d/i
const CLAUSE_END = /[.!?:;。！？]["'”’)\]]*$/
const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿\u3000-〿＀-￯]/
const SENTENCE_END = /[.!?。！？]["'”’)\]]*$/

export function mend(input: string, options: Options): { text: string; stats: Stats } {
  const stats: Stats = { joinedLines: 0, fixedHyphens: 0, removedLines: 0, removed: [], quoteMarks: 0, fixedCharacters: 0 }
  let lines = input.replace(/\r\n?|[\u2028\u2029\f\v]/g, '\n').split('\n')

  if (options.tidyCharacters) lines = lines.map((line) => tidy(line, stats))
  else lines = lines.map((line) => line.replace(/\s+$/, ''))

  if (options.stripQuoteMarks) lines = stripQuotes(lines, stats)
  if (options.dropPageFurniture) lines = dropFurniture(lines, stats)
  const trimmed = lines.map((line) => line.trim())

  // Lines that stay lines keep their indentation, as verse and code need.
  let text = options.joinLines && looksWrapped(trimmed) ? joinParagraphs(trimmed, options, stats) : keepLines(lines, options)
  if (options.straightQuotes) text = text.replace(/[“”„‟″]/g, '"').replace(/[‘’‚‛′]/g, "'")
  return { text: text.replace(/^\n+/, '').trimEnd(), stats }
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
    .trimEnd() // Trailing spaces go without counting as fixes.
    // A soft hyphen inside a line is invisible; at the end of a line it marks a split word.
    .replace(/\u00ad(?!$)/g, () => {
      fixed++
      return ''
    })
  // Indentation stays; repeated spaces after it become one.
  const indent = /^ */.exec(out)![0]
  const rest = out.slice(indent.length).replace(/ {2,}/g, (spaces) => {
    fixed += spaces.length - 1
    return ' '
  })
  stats.fixedCharacters += fixed
  return rest ? indent + rest : ''
}

/** Removes ">" quote marks when most lines are quoted, as in a forwarded email. */
function stripQuotes(lines: string[], stats: Stats): string[] {
  const nonEmpty = lines.filter((l) => l.trim())
  const quoted = nonEmpty.filter((l) => /^\s*>/.test(l))
  if (!nonEmpty.length || quoted.length / nonEmpty.length < 0.5) return lines
  stats.quoteMarks += quoted.length
  return lines.map((l) => l.replace(/^\s*(?:>\s?)+/, ''))
}

/**
 * Drops page furniture: page numbers, and short lines repeated a page or more
 * apart, like a journal's title printed on every page. A line that only looks
 * like furniture (a code or a quantity on its own line, a signature, a
 * speaker's name, a heading) stays unless something shows it sits at a page
 * break: a form only page numbers take ("Page 3 of 10", "- 4 -"), a sentence
 * that runs on across it, the next page's number further on, or furniture
 * right beside it.
 */
function dropFurniture(lines: string[], stats: Stats): string[] {
  const t = lines.map((line) => line.trim())
  const typical = width(t.filter(Boolean).map((l) => l.length))
  const page = t.map((l) => PAGE_NUMBER.test(l))
  const key = (line: string) => line.toLowerCase().replace(/\d+/g, '#')
  const positions = new Map<string, number[]>()
  t.forEach((line, i) => {
    const k = key(line)
    if (!page[i] && k.length >= 3 && k.length <= 60 && /\p{L}{3}/u.test(k) && !LIST_ITEM.test(line)) {
      positions.set(k, [...(positions.get(k) ?? []), i])
    }
  })
  const repeated = [...positions.values()].filter((at) => at.length >= 3 && (at[at.length - 1] - at[0]) / (at.length - 1) >= 15)
  const candidate = page.slice()
  for (const at of repeated) for (const i of at) candidate[i] = true

  /** The nearest line in that direction that isn't blank, and isn't furniture too if `text`. */
  const near = (i: number, step: number, text = false) => {
    let j = i + step
    while (j >= 0 && j < t.length && (!t[j] || (text && candidate[j]))) j += step
    return j >= 0 && j < t.length ? j : -1
  }
  /** Lines of text in the paragraph from line i onward, in that direction. */
  const extent = (i: number, step: number) => {
    let n = 0
    for (let j = i; j >= 0 && j < t.length && t[j]; j += step) if (!candidate[j]) n++
    return n
  }
  /** A sentence runs on across line i: a word split before it, or a full line and lowercase after it, in mid-paragraph. */
  const runsAcross = (i: number) => {
    const a = near(i, -1, true)
    const b = near(i, 1, true)
    if (a < 0 || b < 0 || !/^\p{Ll}/u.test(t[b])) return false
    if (/\p{L}[-\u00ad\u2010]$/u.test(t[a])) return true
    return t[a].length >= typical * 0.6 && !CLAUSE_END.test(t[a]) && extent(a, -1) >= 2 && extent(b, 1) >= 2
  }

  // Text copied from a PDF has no blank lines at all, unlike an email or a web page, so there a number alone on a
  // line is a page number, unless other numbers stand within a few lines of it, as in a table.
  const body = t.slice(t.findIndex(Boolean), t.findLastIndex(Boolean) + 1)
  const fromPdf = body.length >= 10 && !body.includes('') && looksWrapped(t)
  const alone = (i: number) => {
    for (let j = Math.max(0, i - 5); j <= Math.min(t.length - 1, i + 5); j++) if (j !== i && page[j]) return false
    return true
  }

  const drop = new Array<boolean>(t.length).fill(false)
  const anchor = new Array<boolean>(t.length).fill(false)
  page.forEach((p, i) => {
    if (p && (PAGE_ONLY.test(t[i]) || runsAcross(i) || (fromPdf && alone(i)))) drop[i] = anchor[i] = true
  })
  // A line repeated page after page right beside a page number is a running header or footer, and those numbers are page numbers.
  for (const at of repeated) {
    const numbers = at.map((i) => [near(i, -1), near(i, 1)].find((j) => j >= 0 && page[j]) ?? -1).filter((j) => j >= 0)
    if (numbers.length >= 2) for (const j of numbers) drop[j] = anchor[j] = true
  }
  // The next page's number, a page or more away: 12 … 13 … 14.
  const value = (i: number) => Number(/\d+/.exec(t[i])![0])
  const byValue = new Map<number, number[]>()
  page.forEach((p, i) => p && byValue.set(value(i), [...(byValue.get(value(i)) ?? []), i]))
  const queue = drop.flatMap((d, i) => (d ? [i] : []))
  while (queue.length) {
    const j = queue.pop()!
    for (const i of [...(byValue.get(value(j) - 1) ?? []), ...(byValue.get(value(j) + 1) ?? [])]) {
      if (!drop[i] && Math.abs(i - j) >= 15) {
        drop[i] = anchor[i] = true
        queue.push(i)
      }
    }
  }
  // A repeated line goes, everywhere it appears, if one copy sits beside a page number or inside a running sentence.
  const besideAnchor = (i: number) => [near(i, -1), near(i, 1)].some((j) => j >= 0 && anchor[j])
  for (const at of repeated) {
    if (at.some((i) => besideAnchor(i) || runsAcross(i))) for (const i of at) drop[i] = true
  }
  for (const at of repeated) if (at.some((i) => drop[i])) for (const i of at) anchor[i] = true
  // A bare number right beside other furniture is part of it.
  page.forEach((p, i) => {
    if (p && !drop[i] && besideAnchor(i)) drop[i] = true
  })

  return lines.filter((_, i) => {
    if (drop[i]) {
      stats.removedLines++
      stats.removed.push(t[i])
    }
    return !drop[i]
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
  const runOn = lines.flatMap((line, i) => (line && lines[i + 1] && !LIST_ITEM.test(lines[i + 1]) ? [i] : []))
  if (!runOn.length || runOn.filter((i) => lines[i].length >= typical * 0.6).length / runOn.length < 0.5) return false
  // Verse, tables, and lists start nearly every line with a capital or a digit; wrapped prose mostly runs on in lowercase.
  // Lines in capitals throughout, and scripts without capitals, say nothing either way.
  const starts = runOn.map((i) => lines[i + 1]).filter((l) => /\p{Ll}/u.test(l) && /^[\p{Lu}\p{Ll}\p{N}]/u.test(l))
  return starts.length < 3 || starts.filter((l) => /^\p{Ll}/u.test(l)).length / starts.length >= 0.25
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
      const hyphen = new RegExp(`(\\p{L}+)${HYPHEN}$`, 'u').exec(current.text)
      if (current.text.endsWith(SOFT_HYPHEN)) {
        // A soft hyphen marks where a word was split for layout: always rejoin it.
        current.text = current.text.slice(0, -1) + line
        stats.fixedHyphens++
      } else if (hyphen && /^\p{Ll}/u.test(line)) {
        // "infor-" + "mation" → "information", unless the text writes the pair hyphenated elsewhere ("well-known").
        const next = /^\p{L}+/u.exec(line)![0]
        // Typesetters don't hyphenate web and email addresses, so a hyphen inside one is part of it.
        const address = /\/\/|www\.|@/i.test(/\S*$/.exec(current.text)![0] + /^\S*/.exec(line)![0])
        const compound = !options.fixHyphens || address || new RegExp(`(^|[^\\p{L}])${escape(hyphen[1])}${HYPHEN}${escape(next)}(?![\\p{L}])`, 'iu').test(whole)
        current.text = current.text.slice(0, -1) + (compound ? '-' : '') + line
        if (!compound) stats.fixedHyphens++
      } else {
        // No space after a dash on a word ("anti-" + "American") or between Chinese or Japanese characters; a spaced dash keeps its space.
        const glue = /\S[-\u2010–—]$/.test(current.text) || (CJK.test(current.text.slice(-1)) && CJK.test(line[0])) ? '' : ' '
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
  if (/^\p{Ll}/u.test(line) || /[-\u00ad\u2010]$/.test(previous)) return true
  if (previous.length < typical * 0.6) return false
  if (/^[\p{Lu}\d"“‘(]/u.test(line) && titled(previous)) return false
  if (SENTENCE_END.test(previous) && /^[\p{Lu}\d"“‘(]/u.test(line) && previous.length < typical * 0.9) return false
  return true
}

/** A heading in title case ("The Quiet Economics of Lighthouses"): every longer word capitalized, but not all in capitals, and no end punctuation. */
function titled(line: string): boolean {
  const words = line.replace(LIST_ITEM, '').match(/\p{L}{4,}/gu) ?? []
  return words.length >= 2 && words.every((w) => /^\p{Lu}/u.test(w)) && /\p{Ll}/u.test(line) && !/[.,;:!?]$/.test(line)
}

/** Keeps the original line breaks, with runs of blank lines collapsed. */
function keepLines(lines: string[], options: Options): string {
  const blank = options.paragraphBreak === 'blank' ? '\n\n' : '\n'
  return lines.join('\n').replace(/\n{2,}/g, blank).replaceAll(SOFT_HYPHEN, '')
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
