/**
 * Off Book's script reading. A pasted script becomes a list of items:
 * speeches (who says what), stage directions, and headings (acts, scenes,
 * screenplay sluglines). It understands the common plain-text layouts:
 *
 *   HAMLET: To be, or not to be       (name, colon, speech)
 *   HAMLET. To be, or not to be       (capitalized name, period, speech)
 *   HAMLET                            (capitalized name on its own line,
 *   To be, or not to be                the speech on the lines below)
 *
 * Text in [brackets] or (parentheses) is a direction, never a line to learn.
 * Scripts without capital letters (Chinese, Japanese, Korean, Arabic, Hebrew,
 * and others) are read in the colon layout, the usual one for them.
 */

export type Item = { kind: 'speech'; speaker: string; text: string } | { kind: 'direction'; text: string } | { kind: 'heading'; text: string }

export interface Character {
  /** The name as first written, without its trailing period or colon. */
  name: string
  /** Upper-case form, used to match speeches to the character. */
  key: string
  speeches: number
  words: number
}

export interface Script {
  items: Item[]
  characters: Character[]
}

const INVISIBLE = new RegExp('[\\u00AD\\u200B-\\u200D\\u2060\\uFEFF]', 'g')
const SPACES = new RegExp('[\\u00A0\\u2000-\\u200A\\u202F\\u205F\\u3000\\t]', 'g')

const HEADING = /^(?:(?:act|scene)\b|(?:first|second|third|fourth|fifth) act\b|(?:prologue|epilogue|intermission|interval)\b|(?:int|ext|int\/ext|i\/e)[.\s]|fade (?:in|out)\b)/i
/** Words that look like a speaker but aren't. */
const NOT_SPEAKERS = new Set(['NOTE', 'NOTES', 'SETTING', 'TIME', 'PLACE', 'CHARACTERS', 'CAST', 'THE END', 'END', 'CURTAIN', 'BLACKOUT', 'LIGHTS', 'LIGHTS UP', 'LIGHTS DOWN', 'CUT TO', 'SOUND', 'MUSIC', 'SFX', 'TITLE', 'SUPER', 'BACK TO', 'LATER', 'CONTINUOUS', 'MORNING', 'NIGHT', 'DAY', 'THE', 'A', 'AN', 'I', 'OK', 'OH', 'NO', 'YES'])

const upper = (s: string) => s.toLocaleUpperCase()
const isCaps = (s: string) => /\p{Lu}/u.test(s) && !/\p{Ll}/u.test(s)
/** Written in a script without capital letters, like 哈姆雷特 or 햄릿. */
const caseless = (s: string) => /\p{Lo}/u.test(s) && !/\p{Lu}|\p{Ll}/u.test(s)
/** A page number from a PDF: "12", "Page 12", "12 of 80", "- 12 -". */
const PAGE_NUMBER = /^(?:page\s*)?\d{1,4}(?:\s*(?:of|\/)\s*\d{1,4})?$|^[-–—]\s*\d{1,4}\s*[-–—]$/i
/** "Scene: A park" and "Act 2: The trial" describe the play; nobody is called Scene. */
const ACT_OR_SCENE = /^(?:act|scene)\b/i
const words = (s: string) => s.split(/\s+/).filter(Boolean)

/** A speaker name: one to five words, mostly letters, no sentence punctuation inside. */
function nameLike(name: string, capsOnly: boolean): boolean {
  const n = name.trim()
  if (!n || n.length > 40 || !/^\p{L}/u.test(n)) return false
  if (/[!?,;"“”]/.test(n)) return false
  const w = words(n)
  if (w.length > 5) return false
  if (NOT_SPEAKERS.has(upper(n)) || ACT_OR_SCENE.test(n)) return false
  if (capsOnly) return isCaps(n)
  // With a colon, every word starts with a capital, a number (GUARD 2, SERVANT #2), or a letter from a script
  // without capitals, or is a small joining word.
  return w.every((word) => /^(?:\p{Lu}|\p{Lo}|#?\d)/u.test(word) || /^(?:of|the|de|la|von|van|and)$/.test(word))
}

/** Strips a screenplay extension like (V.O.) or (CONT'D) and trailing punctuation. */
const cleanName = (name: string) => name.replace(/\s*\([^)]*\)\s*$/, '').replace(/[.:]+$/, '').trim()

/** "HAMLET: line", "Hamlet: line", or "HAMLET. line". */
function inlineSpeech(line: string): { speaker: string; text: string } | null {
  const colon = line.match(/^([^:]{1,48}?)\s*(\([^)]*\))?\s*[:：]\s*(.*)$/)
  if (colon && nameLike(cleanName(colon[1]), false) && !/^\d/.test(colon[3])) return { speaker: cleanName(colon[1]), text: colon[3].trim() }
  // With a period the name must be in capitals, and the speech mustn't start with another capitalized word (MRS. MALAPROP. Text).
  for (let i = line.indexOf('. '); i > 0 && i < 48; i = line.indexOf('. ', i + 1)) {
    const name = line.slice(0, i)
    const text = line.slice(i + 2).trim()
    const firstWord = words(text)[0] ?? ''
    if (nameLike(name, true) && !(isCaps(firstWord.replace(/[^\p{L}]/gu, '')) && firstWord.replace(/[^\p{L}]/gu, '').length > 1)) return { speaker: cleanName(name), text }
  }
  return null
}

/** A capitalized name alone on its line: "HAMLET", "HAMLET.", "JACK (V.O.)". */
function nameLine(line: string): string | null {
  const m = line.match(/^(.+?)\s*(\([^)]*\))?\s*[.:]?$/)
  if (!m) return null
  const name = m[1].trim()
  return nameLike(name, true) ? cleanName(name) : null
}

const isDirection = (line: string) => /^[[(].*[\])]$/.test(line)

/** Cleans pasted text: line endings, invisible characters, odd spaces, and _underscored_ italics. */
export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE, '')
    .replace(SPACES, ' ')
    .replace(/(^|[\s[(])_(\S(?:[^_\n]*\S)?)_(?=[\s.,;:!?\])]|$)/gm, '$1$2')
}

export function parseScript(input: string): Script {
  // Page numbers pasted from a PDF aren't part of anyone's line.
  const lines = normalize(input)
    .split('\n')
    .map((l) => l.trim())
    .map((l) => (PAGE_NUMBER.test(l) ? '' : l))
  const items: Item[] = []
  // Whether names sit on their own lines (then a blank line ends a speech) or start the speech line.
  const ownLine = lines.filter((l, i) => nameLine(l) && lines[i + 1] && !nameLine(lines[i + 1]) && !HEADING.test(l)).length
  const inline = lines.filter((l) => inlineSpeech(l)).length
  const namesOnOwnLines = ownLine > inline
  // With names on the speech lines, a line in capitals on its own that comes back on page after page is
  // a running header (the play's title), not part of a speech.
  const repeats = new Map<string, number>()
  // A shouted line ("HELP!") has punctuation a header doesn't.
  const header = (l: string) => isCaps(l) && !/[!?]/.test(l) && (l.match(/\p{L}/gu)?.length ?? 0) >= 4 && !inlineSpeech(l) && !HEADING.test(l)
  for (const l of lines) if (l && header(l)) repeats.set(l, (repeats.get(l) ?? 0) + 1)
  if (!namesOnOwnLines) for (let i = 0; i < lines.length; i++) if ((repeats.get(lines[i]) ?? 0) >= 3) lines[i] = ''

  let current: Extract<Item, { kind: 'speech' }> | null = null
  let blankSince = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line) {
      blankSince = true
      continue
    }
    const wasBlank = blankSince
    blankSince = false
    if (HEADING.test(line) && line.length < 80 && !inlineSpeech(line)) {
      items.push({ kind: 'heading', text: line })
      current = null
      continue
    }
    if (namesOnOwnLines) {
      const name = nameLine(line)
      const next = lines[i + 1] ?? ''
      if (name && next && !nameLine(next)) {
        current = { kind: 'speech', speaker: name, text: '' }
        items.push(current)
        continue
      }
    } else {
      const speech = inlineSpeech(line)
      if (speech) {
        current = { kind: 'speech', ...speech }
        items.push(current)
        continue
      }
    }
    // Anything else continues the speech above it, unless a blank line or a direction on its own line separates them.
    const separate = !current || (wasBlank && (namesOnOwnLines || isDirection(line))) || (isDirection(line) && wasBlank)
    if (separate) {
      const last = items[items.length - 1]
      if (last?.kind === 'direction' && !wasBlank) last.text += ` ${line}`
      else items.push({ kind: 'direction', text: line })
      current = null
    } else {
      current!.text = current!.text ? `${current!.text} ${line}` : line
    }
  }

  // Speeches with nothing in them (a name with no line under it) are dropped. A mixed-case "Name:" that
  // occurs only once is more likely a sentence like "Well: I suppose so", so it rejoins the speech above.
  const counts = new Map<string, number>()
  for (const item of items) if (item.kind === 'speech') counts.set(upper(item.speaker), (counts.get(upper(item.speaker)) ?? 0) + 1)
  const kept: Item[] = []
  for (const item of items) {
    if (item.kind === 'speech' && !item.text.trim()) continue
    if (item.kind === 'speech' && !isCaps(item.speaker) && !caseless(item.speaker) && counts.get(upper(item.speaker)) === 1) {
      const line = `${item.speaker}: ${item.text}`
      const last = kept[kept.length - 1]
      if (last?.kind === 'speech') last.text += ` ${line}`
      else kept.push({ kind: 'direction', text: line })
      continue
    }
    kept.push(item)
  }
  const characters = new Map<string, Character>()
  for (const item of kept) {
    if (item.kind !== 'speech') continue
    const key = upper(item.speaker)
    const c = characters.get(key) ?? { name: item.speaker, key, speeches: 0, words: 0 }
    c.speeches++
    c.words += spokenWords(item.text)
    characters.set(key, c)
  }
  return { items: kept, characters: [...characters.values()].sort((a, b) => b.speeches - a.speeches || a.name.localeCompare(b.name)) }
}

export type Segment = { kind: 'spoken' | 'direction'; text: string }

/** Splits a speech into what's said and the directions in [brackets] or (parentheses) inside it. */
export function segments(text: string): Segment[] {
  const out: Segment[] = []
  const re = /\[[^\]]*\]|\([^)]*\)/g
  let at = 0
  for (const m of text.matchAll(re)) {
    if (m.index! > at) out.push({ kind: 'spoken', text: text.slice(at, m.index) })
    out.push({ kind: 'direction', text: m[0] })
    at = m.index! + m[0].length
  }
  if (at < text.length) out.push({ kind: 'spoken', text: text.slice(at) })
  return out.map((s) => ({ ...s, text: s.text.replace(/\s+/g, ' ') })).filter((s) => s.text.trim())
}

export const spoken = (text: string) =>
  segments(text)
    .filter((s) => s.kind === 'spoken')
    .map((s) => s.text.trim())
    .join(' ')

/** Chinese and Japanese aren't written with spaces, so each of their characters counts as a word, as word processors count them. */
const CJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/gu

export const spokenWords = (text: string) => words(spoken(text)).reduce((n, w) => n + (w.match(CJK)?.length || (/[\p{L}\p{N}]/u.test(w) ? 1 : 0)), 0)

/** "To be, or not to be" becomes "T b, o n t b": the first letter of each word, punctuation kept. */
export function firstLetters(text: string): string {
  return text.replace(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu, (word) => word[0])
}

/** The first `n` spoken words of a speech, for a prompt. */
export function prompt(text: string, n: number): string {
  const w = words(spoken(text))
  return w.slice(0, n).join(' ') + (n < w.length ? ' …' : '')
}

/** Sections to practice: the whole script, or from one heading to the next. */
export interface Section {
  label: string
  from: number
  to: number
}

export function sections(script: Script): Section[] {
  const heads = script.items.map((item, i) => (item.kind === 'heading' ? i : -1)).filter((i) => i >= 0)
  const all = { label: 'Whole script', from: 0, to: script.items.length }
  if (!heads.length) return [all]
  const list = heads.map((from, k) => ({ label: (script.items[from] as { text: string }).text, from, to: heads[k + 1] ?? script.items.length }))
  // An act heading followed straight by a scene heading would make an empty section; merge it into the label.
  const merged: Section[] = []
  for (const s of list) {
    const prev = merged[merged.length - 1]
    if (prev && prev.to - prev.from === 1) merged[merged.length - 1] = { label: `${prev.label}, ${s.label}`, from: prev.from, to: s.to }
    else merged.push(s)
  }
  if (heads[0] > 0) merged.unshift({ label: 'Opening', from: 0, to: heads[0] })
  return [all, ...merged.filter((s) => s.to - s.from > 1 || s.from === 0)]
}

/** Indexes of the chosen characters' speeches in a section. */
export function myLines(script: Script, roles: readonly string[], section: Section): number[] {
  const keys = new Set(roles.map(upper))
  const out: number[] = []
  for (let i = section.from; i < section.to; i++) {
    const item = script.items[i]
    if (item.kind === 'speech' && keys.has(upper(item.speaker))) out.push(i)
  }
  return out
}

/**
 * What comes before one of your lines: back to the last speech by someone
 * else, with any directions after it, and no more than three items.
 */
export function cueFor(script: Script, roles: readonly string[], index: number, from = 0): number[] {
  const keys = new Set(roles.map(upper))
  const out: number[] = []
  for (let i = index - 1; i >= from && out.length < 3; i--) {
    const item = script.items[i]
    out.unshift(i)
    if (item.kind === 'speech' && !keys.has(upper(item.speaker))) break
    if (item.kind === 'heading') break
  }
  return out
}

/** A short fingerprint of the script, so progress is kept only for the same text. */
export function fingerprint(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}
