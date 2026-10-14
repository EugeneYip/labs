// Captions Up: open captions for a live show, prepared from the script.
//
// A script is read as speeches (a speaker and what they say), sounds ([Door slams]), and scene headings; stage
// directions in parentheses are left out. Each speech is then split into captions of at most `lines` lines of at
// most `width` characters: a caption ends at the end of a sentence where it can, otherwise after a comma or the like,
// otherwise between words; a word is never broken, and a word longer than a line has a line of its own. The
// speaker's name goes before the first caption of each of their speeches.

export type Kind = 'speech' | 'sound' | 'blank'

export interface Caption {
  /** As shown: its lines joined by "\n". Empty for a blank. */
  text: string
  kind: Kind
  /** The scene it's in (an index into the show's scenes), or -1 before the first heading. */
  scene: number
}

export interface Show {
  name: string
  /** Most characters on a line, and most lines in a caption. */
  width: number
  lines: number
  scenes: string[]
  captions: Caption[]
}

/** Where the show is: saved apart from the show, so advancing a caption writes only this. */
export interface Position {
  /** The caption on screen. */
  at: number
  /** The screen is blank (between scenes, a blackout). */
  blank: boolean
}

export const LIMITS = { characters: 2_000_000, captions: 20_000, width: { min: 20, max: 80 }, lines: { min: 1, max: 3 } }
export const DEFAULTS = { width: 40, lines: 2 }

export interface Speech {
  kind: 'speech' | 'sound'
  speaker: string
  text: string
  scene: number
}

export interface Script {
  scenes: string[]
  items: Speech[]
  /** Stage directions left out. */
  dropped: number
  /** Speakers found, in order of first appearance. */
  speakers: string[]
}

const tidy = (s: string) => s.replace(/\s+/g, ' ').trim()

/** A name as scripts write it: one to four words, starting with a letter. */
const NAME = "[\\p{Lu}\\p{N}][\\p{L}\\p{N}'’.\\-]*(?: [\\p{L}\\p{N}'’.\\-]+){0,3}"
const HEADING = /^(act|scene|prologue|epilogue|interval|intermission)\b[\s\w.:,–—-]*$/i
const COLON = new RegExp(`^(${NAME})\\s*:\\s*(.*)$`, 'u')
// Names in capitals, perhaps with a number first (1ST WITCH, 2ND OFFICER).
const CAPS = "(?:\\p{N}+\\p{Lu}{0,2} )?\\p{Lu}[\\p{Lu}'’\\-]+(?: [\\p{Lu}'’\\-]+){0,3}"
const CAPS_DOT = new RegExp(`^(${CAPS})\\s*\\.\\s+(.+)$`, 'u')
const CAPS_SPACE = new RegExp(`^(${CAPS})\\s+(?=.*\\p{Ll})(.+)$`, 'u')
const CAPS_ALONE = new RegExp(`^(${CAPS.replace("'’\\-]+(?:", "'’.\\-]+(?:")})(?:\\s*\\([^)]*\\))?\\s*:?$`, 'u')

/** Words in capitals that start sentences or shout, rather than name a speaker. */
const NOT_NAMES = new Set(['I', 'A', 'OK', 'NO', 'YES', 'OH', 'AH', 'THE', 'AND', 'BUT', 'WHAT', 'WHY', 'HOW', 'STOP', 'HELP', 'END', 'CURTAIN', 'BLACKOUT', 'LIGHTS', 'INTERVAL', 'INTERMISSION'])

/** Reads a pasted script into speeches, sounds, and scenes. */
export function readScript(text: string): Script {
  const lines = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')
  const scenes: string[] = []
  const items: Speech[] = []
  const speakers: string[] = []
  let dropped = 0
  let scene = -1
  let current: Speech | null = null
  let inDirection = false
  const close = () => {
    if (current && tidy(current.text)) items.push({ ...current, text: tidy(current.text) })
    current = null
  }
  const speak = (speaker: string, said: string) => {
    close()
    const name = tidy(speaker)
    if (name && !speakers.includes(name)) speakers.push(name)
    current = { kind: 'speech', speaker: name, text: said, scene }
  }
  for (const raw of lines) {
    let line = raw.trim()
    if (inDirection) {
      if (line.includes(')')) {
        inDirection = false
        line = line.slice(line.indexOf(')') + 1).trim()
        if (!line) continue
      } else continue
    }
    if (!line) {
      close()
      continue
    }
    if (HEADING.test(line) && line.length <= 60) {
      close()
      scenes.push(tidy(line))
      scene = scenes.length - 1
      continue
    }
    // A sound kept: [Door slams]. A direction left out: (She goes.) — possibly over several lines.
    if (/^\[[^\]]*\]$/.test(line)) {
      close()
      items.push({ kind: 'sound', speaker: '', text: tidy(line), scene })
      continue
    }
    if (line.startsWith('(')) {
      if (!line.includes(')')) {
        inDirection = true
        dropped++
        continue
      }
      if (line.endsWith(')')) {
        dropped++
        continue
      }
    }
    // Directions inside a speech are left out too; sounds inside it are kept as their own captions.
    const cleaned = line.replace(/\([^)]*\)/g, () => (dropped++, ' ')).trim()
    if (!cleaned) continue
    let m: RegExpExecArray | null
    if ((m = COLON.exec(cleaned)) && !NOT_NAMES.has(m[1].toUpperCase()) && m[1].split(' ').length <= 4 && !/[.!?]$/.test(m[1])) speak(m[1], m[2])
    else if ((m = CAPS_DOT.exec(cleaned)) && !NOT_NAMES.has(m[1])) speak(m[1], m[2])
    else if ((m = CAPS_ALONE.exec(cleaned)) && !NOT_NAMES.has(m[1].replace(/:$/, ''))) speak(m[1].replace(/[.:]$/, ''), '')
    else if ((m = CAPS_SPACE.exec(cleaned)) && !NOT_NAMES.has(m[1]) && m[1].length >= 2 && (speakers.includes(m[1]) || m[1].split(' ').length <= 2)) speak(m[1], m[2])
    else if (current) (current as Speech).text += ` ${cleaned}`
    else current = { kind: 'speech', speaker: '', text: cleaned, scene }
  }
  close()
  return { scenes, items, dropped, speakers }
}

/** Breaks text into lines of at most `width` characters, between words (a longer word has a line of its own). */
export function wrap(text: string, width: number): string[] {
  const words = tidy(text).split(' ').filter(Boolean)
  const out: string[] = []
  let line = ''
  for (const w of words) {
    if (!line) line = w
    else if (line.length + 1 + w.length <= width) line += ` ${w}`
    else {
      out.push(line)
      line = w
    }
  }
  if (line) out.push(line)
  return out
}

/** Pieces of a speech that should end a caption if they can: sentences, then clauses. */
function sentences(text: string): string[] {
  const out: string[] = []
  const re = /[^.!?…]+(?:[.!?…]+["'’”)\]]*|$)\s*/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const s = m[0].trim()
    if (s) out.push(s)
    if (m.index === re.lastIndex) re.lastIndex++
  }
  return out.length ? out : [text]
}

function clauses(sentence: string): string[] {
  const out: string[] = []
  const re = /[^,;:—–]+(?:[,;:—–]+|$)\s*/g
  let m: RegExpExecArray | null
  while ((m = re.exec(sentence))) {
    const s = m[0].trim()
    if (s) out.push(s)
    if (m.index === re.lastIndex) re.lastIndex++
  }
  return out.length ? out : [sentence]
}

/** Whether text fits one caption: at most `lines` lines of at most `width` characters. */
export function fits(text: string, width: number, lines: number): boolean {
  return wrap(text, width).length <= lines
}

/**
 * A speech split into captions (each its lines joined by "\n"), the speaker's name before the first. Sentences are
 * packed into a caption while they fit; a sentence too long for one caption is split at clauses, then between words.
 */
export function splitSpeech(text: string, width: number, lines: number, speaker = ''): string[] {
  const prefix = speaker ? `${speaker}: ` : ''
  const pieces: string[] = []
  for (const s of sentences(tidy(text))) {
    if (fits(s, width, lines)) pieces.push(s)
    else
      for (const c of clauses(s)) {
        if (fits(c, width, lines)) pieces.push(c)
        else pieces.push(...wordsInto(c, width, lines))
      }
  }
  const out: string[] = []
  let caption = prefix
  for (const p of pieces) {
    const tryText = caption && caption !== prefix ? `${caption} ${p}` : `${caption}${p}`
    if (fits(tryText, width, lines)) caption = tryText
    else {
      if (caption && caption !== prefix) out.push(caption)
      else if (caption === prefix && prefix) {
        // The name and the first piece don't fit together: the piece is split so the name keeps company.
        const first = wordsInto(`${prefix}${p}`, width, lines)
        out.push(...first.slice(0, -1))
        caption = first.at(-1)!
        continue
      }
      caption = p
    }
  }
  if (caption && caption !== prefix) out.push(caption)
  return out.map((c) => wrap(c, width).join('\n'))
}

/** Text split between words into caption-sized pieces. */
function wordsInto(text: string, width: number, lines: number): string[] {
  const all = wrap(text, width)
  const out: string[] = []
  for (let i = 0; i < all.length; i += lines) out.push(all.slice(i, i + lines).join(' '))
  return out
}

/** Every caption of a script. */
export function captionsOf(script: Script, width: number, lines: number): Caption[] {
  const out: Caption[] = []
  for (const it of script.items) {
    if (it.kind === 'sound') out.push({ text: wrap(it.text, width).join('\n'), kind: 'sound', scene: it.scene })
    else for (const text of splitSpeech(it.text, width, lines, it.speaker)) out.push({ text, kind: 'speech', scene: it.scene })
  }
  return out
}

/** A caption typed by hand, tidied: spaces collapsed within lines, empty lines removed. */
export function tidyCaption(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(tidy)
    .filter(Boolean)
    .join('\n')
}

/** What's wrong with a caption's layout, or ''. */
export function layoutProblem(text: string, width: number, lines: number): string {
  const ls = text.split('\n').filter(Boolean)
  if (ls.length > lines) return `${ls.length} lines (more than ${lines})`
  const long = ls.find((l) => l.length > width && l.includes(' '))
  if (long) return `a line of ${long.length} characters (more than ${width})`
  return ''
}

/** The captions as plain text, a caption per block, for other caption software or a cue script. */
export function plainText(show: Show): string {
  return `${show.captions.map((c) => (c.kind === 'blank' ? '' : c.text)).join('\n\n')}\n`
}

/** A show from saved data or a backup, checked field by field; null if anything is wrong. */
export function readShow(raw: unknown): Show | null {
  try {
    const v = raw as Record<string, unknown>
    if (!v || typeof v !== 'object') return null
    const { name, width, lines, scenes, captions } = v
    if (typeof name !== 'string' || name.length > 200) return null
    if (!Number.isInteger(width) || (width as number) < LIMITS.width.min || (width as number) > LIMITS.width.max) return null
    if (!Number.isInteger(lines) || (lines as number) < LIMITS.lines.min || (lines as number) > LIMITS.lines.max) return null
    if (!Array.isArray(scenes) || scenes.length > 500 || !scenes.every((s) => typeof s === 'string' && s.length <= 200)) return null
    if (!Array.isArray(captions) || captions.length > LIMITS.captions) return null
    const cs: Caption[] = []
    for (const c of captions) {
      if (!c || typeof c.text !== 'string' || c.text.length > 2_000) return null
      if (c.kind !== 'speech' && c.kind !== 'sound' && c.kind !== 'blank') return null
      if (!Number.isInteger(c.scene) || c.scene < -1 || c.scene >= scenes.length) return null
      cs.push({ text: c.kind === 'blank' ? '' : c.text, kind: c.kind, scene: c.scene })
    }
    return { name, width: width as number, lines: lines as number, scenes: [...scenes], captions: cs }
  } catch {
    return null
  }
}

/** A saved position, checked against the show's length; the start when it's missing or wrong. */
export function readPosition(raw: unknown, captions: number): Position {
  const v = raw as Record<string, unknown> | null
  const at = v && Number.isInteger(v.at) && (v.at as number) >= 0 && (v.at as number) < Math.max(1, captions) ? (v.at as number) : 0
  return { at, blank: !!v && v.blank === true }
}

/**
 * A caption re-fitted to new limits: its lines joined and wrapped again, and split into several when it no longer
 * fits (a name at its start stays with its first piece).
 */
export function refit(c: Caption, width: number, lines: number): Caption[] {
  if (c.kind === 'blank') return [c]
  const flat = c.text.replace(/\n/g, ' ')
  if (c.kind === 'sound') return [{ ...c, text: wrap(flat, width).join('\n') }]
  // A name before the words ("ANA: ...") keeps company with the first piece.
  const named = new RegExp(`^(${NAME}):\\s+(.+)$`, 'u').exec(flat)
  const pieces = named ? splitSpeech(named[2], width, lines, named[1]) : splitSpeech(flat, width, lines)
  return pieces.map((text) => ({ ...c, text }))
}
