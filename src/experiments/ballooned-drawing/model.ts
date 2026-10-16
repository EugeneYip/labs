// Ballooned Drawing: the characteristics of a first article inspection, numbered on the drawing and checked.
//
// Every characteristic on a customer's drawing (a dimension, a tolerance, a GD&T callout, a note) gets a balloon with a
// number, and one row with that number: where it is (the sheet, and the zone when the sheet has a grid), the
// requirement as drawn, the limits read from it, and the results measured. AS9102 calls the table Form 3; its columns
// are, in order, the characteristic number, the reference location, the characteristic designator, the requirement,
// the results, the designed or qualified tooling, the nonconformance number, and additional data or comments.
//
// Limits are read from the requirement by the rules in `readRequirement`, from the title block's general tolerances
// for a lone value, or typed in. Anything that doesn't fit a rule is "limits not read", never a guess. All arithmetic
// is exact (fractions of BigInts), so 12.00 + 0.05 is 12.05 and a result exactly at a limit passes.
//
// Balloon positions are points in the PDF's own user space, so they stay put at any zoom and on rotated pages; the
// page converts them through pdf.js's viewport. Zones and reading order use the sheet as shown, given as fractions of
// its width and height from the top left.

// --- Exact numbers.

/** A fraction in lowest terms, with a positive denominator. */
export interface Q {
  readonly n: bigint
  readonly d: bigint
}

function gcd(a: bigint, b: bigint): bigint {
  if (a < 0n) a = -a
  if (b < 0n) b = -b
  while (b !== 0n) [a, b] = [b, a % b]
  return a
}

export function frac(n: bigint, d: bigint = 1n): Q {
  if (d === 0n) throw new RangeError('A fraction needs a denominator other than 0.')
  if (d < 0n) {
    n = -n
    d = -d
  }
  const g = gcd(n, d)
  return g > 1n ? { n: n / g, d: d / g } : { n, d }
}

export const ZERO = frac(0n)
export const add = (a: Q, b: Q): Q => frac(a.n * b.d + b.n * a.d, a.d * b.d)
export const sub = (a: Q, b: Q): Q => frac(a.n * b.d - b.n * a.d, a.d * b.d)
export const neg = (a: Q): Q => frac(-a.n, a.d)
export function cmp(a: Q, b: Q): number {
  const x = a.n * b.d - b.n * a.d
  return x < 0n ? -1 : x > 0n ? 1 : 0
}
const minQ = (a: Q, b: Q) => (cmp(a, b) <= 0 ? a : b)
const maxQ = (a: Q, b: Q) => (cmp(a, b) >= 0 ? a : b)

/** A number as written, and how many decimal places it was written with. */
export interface Written {
  value: Q
  places: number
  /** An angle written in degrees, minutes, and seconds, so it's shown that way again. */
  dms: boolean
}

/** No dimension has this many digits; longer runs are refused rather than worked with. */
const MAX_DIGITS = 30

/** A decimal: digits with at most one decimal mark (a point, or also a comma when `comma`), and an optional sign. */
export function parseDecimal(text: string, comma: boolean): Written | null {
  const m = /^([+-]?)(\d*)(?:([.,])(\d*))?$/.exec(text)
  if (!m) return null
  const [, sign, whole, mark, part = ''] = m
  if (!whole && !part) return null
  if (mark === ',' && !comma) return null
  const digits = (whole || '0') + part
  if (digits.length > MAX_DIGITS) return null
  const n = BigInt(digits) * (sign === '-' ? -1n : 1n)
  return { value: frac(n, 10n ** BigInt(part.length)), places: part.length, dms: false }
}

/**
 * An angle in degrees: 45°, 45.5°, 30°15', 30°15'20", 0°30', 30' (minutes alone), 20" (seconds alone). With `bare`, a
 * plain number counts as degrees (a tolerance after an angle, as in 45° ±0.5).
 */
export function parseAngle(text: string, comma: boolean, bare = false): Written | null {
  const plain = bare ? parseDecimal(text, comma) : null
  if (plain) return plain
  const m = /^([+-]?)(?:([\d.,]+)°)?(?:([\d.,]+)')?(?:([\d.,]+)")?$/.exec(text)
  if (!m || (!m[2] && !m[3] && !m[4])) return null
  const parts = [m[2], m[3], m[4]].map((p) => (p === undefined ? null : parseDecimal(p, comma)))
  if (parts.some((p, i) => [m[2], m[3], m[4]][i] !== undefined && (!p || p.value.n < 0n))) return null
  let value = ZERO
  const scale = [1n, 60n, 3600n]
  parts.forEach((p, i) => {
    if (p) value = add(value, frac(p.value.n, p.value.d * scale[i]))
  })
  if (m[1] === '-') value = neg(value)
  const dms = m[3] !== undefined || m[4] !== undefined
  return { value, places: dms ? Math.max(parts[2]?.places ?? 0, 0) : parts[0]?.places ?? 0, dms }
}

/** A decimal with at least `places` decimal places, and more if the value needs them (up to 12). */
export function formatQ(q: Q, places: number): string {
  for (let p = Math.max(0, places); p <= 12; p++) {
    const scaled = q.n * 10n ** BigInt(p)
    if (scaled % q.d === 0n) {
      const v = scaled / q.d
      const negative = v < 0n
      const digits = (negative ? -v : v).toString().padStart(p + 1, '0')
      const text = p ? `${digits.slice(0, -p)}.${digits.slice(-p)}` : digits
      return negative ? `-${text}` : text
    }
  }
  return `${q.n}/${q.d}`
}

/** An angle in degrees as written: decimal degrees, or degrees, minutes, and seconds. */
export function formatAngle(q: Q, dms: boolean, places: number): string {
  if (!dms) return `${formatQ(q, places)}°`
  const negative = q.n < 0n
  const a = negative ? neg(q) : q
  const whole = a.n / a.d
  const restMin = sub(a, frac(whole))
  const minutes = (restMin.n * 60n) / restMin.d
  const seconds = sub(frac(restMin.n * 60n, restMin.d), frac(minutes))
  const s = frac(seconds.n * 60n, seconds.d)
  let text = `${whole}°${minutes}'`
  if (s.n !== 0n) text += `${formatQ(s, places)}"`
  return negative ? `-${text}` : text
}

// --- Reading a requirement.

export type Kind = 'measured' | 'attribute' | 'reference' | 'basic' | 'unread'

export interface Reading {
  kind: Kind
  /** How many features the requirement covers ("4X", "4 PLCS"), 1 when it doesn't say. */
  count: number
  lower: Q | null
  upper: Q | null
  /** Limits in degrees (the requirement is an angle). */
  angle: boolean
  /** How to show the limits: the requirement's own precision, and degrees, minutes, and seconds if it used them. */
  places: number
  dms: boolean
  /** One plain line: the limits and how they were read, or why there are none. */
  how: string
  source: 'drawing' | 'title block' | 'typed' | null
  /** Something to know about the reading (a bonus tolerance not added), or ''. */
  note: string
}

/** The drawing's general tolerances, as typed: by decimal places (0 to 4) and for angles. */
export interface TitleBlock {
  places: string[]
  angle: string
}

export interface ReadingSettings {
  /** Decimal commas: a comma may be the decimal mark (and doesn't separate results). */
  comma: boolean
  titleBlock: TitleBlock
}

const NOT_READ = (how: string, count = 1): Reading => ({ kind: 'unread', count, lower: null, upper: null, angle: false, places: 0, dms: false, how, source: null, note: '' })
const plain = (kind: Kind, how: string, count: number, note = ''): Reading => ({ kind, count, lower: null, upper: null, angle: false, places: 0, dms: false, how, source: null, note })

/** Zero-width characters, and the marks that set text's direction (text near right-to-left labels comes with them). */
const ZERO_WIDTH = /[\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\u061c\ufeff]/g

/** One spelling for the signs drawings and fonts spell several ways. */
export function normalize(text: string): string {
  return text
    .normalize('NFC')
    .replace(ZERO_WIDTH, '')
    // Full-width letters, digits, and signs (East Asian drawings) as their plain forms; φ is a diameter there.
    .replace(/[\uff01-\uff5e]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, ' ')
    .replace(/[⌀Øø∅φΦϕ]/g, 'Ø')
    .replace(/[º˚]/g, '°')
    .replace(/[µμ]/g, 'u')
    .replace(/[′‘’]/g, "'")
    .replace(/[″“”]/g, '"')
    .replace(/[−‐‑]/g, '-')
    // A dash between numbers is a range ("11.95–12.05", or spaced on both sides), but one with a space before it and
    // none after is a minus ("12.00 –0.05": fonts without a minus sign draw an en dash).
    .replace(/(\d)(?:[–—]\s*|\s+[–—]\s+)(?=[\d.,])/g, '$1 to ')
    .replace(/[–—]/g, '-')
    .replace(/\+\s*\/\s*-|\+\s*-(?=\s*[\d.,])|-\s*\/\s*\+/g, '±')
    .replace(/(\d)\s*(?:DEG|deg)\b\.?/g, '$1°')
    .trim()
}

const GDT_SYMBOLS: Record<string, string> = {
  '⌖': 'position',
  '⏥': 'flatness',
  '⌓': 'profile of a surface',
  '⌒': 'profile of a line',
  '⟂': 'perpendicularity',
  '⊥': 'perpendicularity',
  '∥': 'parallelism',
  '//': 'parallelism',
  '∠': 'angularity',
  '○': 'circularity',
  '◯': 'circularity',
  '⌭': 'cylindricity',
  '↗': 'runout',
  '⌰': 'total runout',
  '◎': 'concentricity',
  '⌯': 'symmetry',
  '⏤': 'straightness',
}

const GDT_WORDS: [RegExp, string][] = [
  [/^POS(?:ITION)?\b/, 'position'],
  [/^FLAT(?:NESS)?\b/, 'flatness'],
  [/^PROF(?:ILE)? OF (?:A )?LINE\b/, 'profile of a line'],
  [/^(?:SURF(?:ACE)? )?PROF(?:ILE)?(?: OF (?:A )?SURF(?:ACE)?)?\b/, 'profile of a surface'],
  [/^PERP(?:ENDICULARITY)?\b/, 'perpendicularity'],
  [/^PAR(?:ALLEL(?:ISM)?)?\b/, 'parallelism'],
  [/^ANG(?:ULARITY)?\b/, 'angularity'],
  [/^(?:CIRC(?:ULARITY)?|ROUNDNESS)\b/, 'circularity'],
  [/^CYL(?:INDRICITY)?\b/, 'cylindricity'],
  [/^(?:TOTAL RUNOUT|TOT(?:AL)? RUN ?OUT)\b/, 'total runout'],
  [/^(?:RUN ?OUT|CIRC(?:ULAR)? RUNOUT|TIR)\b/, 'runout'],
  [/^CONC(?:ENTRICITY)?\b/, 'concentricity'],
  [/^SYM(?:METRY)?\b/, 'symmetry'],
  [/^STRAIGHT(?:NESS)?\b/, 'straightness'],
]

/**
 * What may follow a frame's tolerance: modifiers (with a projected zone's height or an unequal profile's offset after
 * Ⓟ or Ⓤ), datum letters, MAX, and a unit length or area straight after the tolerance (/25, /25X25). Null for
 * anything else, such as a word or a stray number, so a misread frame isn't taken at its first value.
 */
function frameTail(after: string): { unit: string } | null {
  let unit = ''
  const head = /^\/\d+(?:[.,]\d+)?(?:\s?X\s?\d+(?:[.,]\d+)?)?/.exec(after)
  let rest = after
  if (head) {
    unit = head[0].replace(/\s/g, '')
    rest = after.slice(head[0].length)
  }
  // Datum letters may be run together (ABC) but are never I, O, or Q; a number may follow only Ⓟ or Ⓤ.
  const word = /^(?:[ⓂⓁⓈⓉⒻ]|\([MLSFT]\)|[A-HJ-NPR-Z]{1,3}|[A-HJ-NPR-Z]-[A-HJ-NPR-Z]|MMC|LMC|RFS|MAX|TIR)$/
  let numberAllowed = false
  for (const token of rest.split(/[\s|]+/).filter((t) => t)) {
    for (const part of token.match(/[ⓂⓁⓈⓅⓉⓊⒻ]|\([MLSFPTU]\)|\d+(?:[.,]\d+)?|[A-Z]+(?:-[A-Z])?|./g) ?? []) {
      if (/^[ⓅⓊ]$|^\([PU]\)$/.test(part)) numberAllowed = true
      else if (/^\d/.test(part) ? numberAllowed : word.test(part)) numberAllowed = false
      else return null
    }
  }
  return { unit }
}

/** Material condition and other modifiers in a feature control frame, as symbols or as letters in brackets. */
const BONUS = /[ⓂⓁ]|\((?:M|L)\)|\b(?:MMC|LMC)\b/
/** Size and form prefixes that don't change the limits. */
const PREFIX = /^(?:SØ|SR|CR|Ø|R|□|DIA\.?|RAD\.?)\s?/
/** Trailing words that don't change the limits. */
const TRAILING = /\s+(?:THRU|THROUGH|DEEP|TYP\.?|TYPICAL|EQ\.? ?SP\.?|EQUALLY SPACED|MM|IN\.?|INCH(?:ES)?|ALL OVER|BOTH SIDES)$/

function count(s: string): { rest: string; count: number } {
  let rest = s
  let n = 1
  const before = /^(\d+)\s?(?:X|×)\s+/i.exec(rest) ?? /^(\d+)\s?(?:PLCS?\.?|PLACES|HOLES)\s+/i.exec(rest)
  if (before) {
    n = Number(before[1])
    rest = rest.slice(before[0].length)
  }
  const after = /\s+\(?(\d+)\s?(?:X|×|PLCS?\.?|PLACES|HOLES)\)?$/i.exec(rest)
  if (after) {
    n = Number(after[1])
    rest = rest.slice(0, after.index)
  }
  return { rest: rest.trim(), count: n > 0 && n <= 100_000 ? n : 1 }
}

function stripTrailing(s: string): string {
  let t = s
  for (let i = 0; i < 4; i++) {
    const next = t.replace(TRAILING, '')
    if (next === t) break
    t = next
  }
  return t.trim()
}

/** A value with its size prefix taken off ("Ø12.00" → "12.00"), or the text unchanged. */
function unprefixed(s: string): string {
  return s.replace(PREFIX, '')
}

function written(text: string, comma: boolean, angle: boolean, bare = false): Written | null {
  // A space may follow a sign, or part degrees from minutes, but never sits inside a number: two numbers side by side
  // ("12.50 3", a flag note's number after a dimension) are refused, not run together into one.
  if (/[\d.,]\s+[\d.,]/.test(text)) return null
  const t = text.replace(/\s+/g, '')
  return angle ? parseAngle(t, comma, bare) : parseDecimal(t, comma)
}

/** An angle has a degree sign; a " after a number elsewhere is an inch mark, not seconds. */
const isAngle = (text: string) => /°/.test(text)

function measured(lower: Q | null, upper: Q | null, angle: boolean, places: number, dms: boolean, how: string, n: number, source: Reading['source'], note = ''): Reading {
  return { kind: 'measured', count: n, lower, upper, angle, places, dms, how, source, note }
}

/** A limit as shown: in the requirement's own form, with a decimal comma when the work uses them. */
export function limitText(q: Q, r: Pick<Reading, 'angle' | 'places' | 'dms'>, comma: boolean): string {
  const t = r.angle ? formatAngle(q, r.dms, r.places) : formatQ(q, r.places)
  return comma ? t.replace('.', ',') : t
}

/** A reading's words with decimal commas, for work that uses them. */
const withCommas = (r: Reading, comma: boolean): Reading => (comma ? { ...r, how: r.how.replace(/(\d)\.(\d)/g, '$1,$2'), note: r.note.replace(/(\d)\.(\d)/g, '$1,$2') } : r)

/** The limits shown in words, in the requirement's own form. */
export function limitsText(r: Pick<Reading, 'lower' | 'upper' | 'angle' | 'places' | 'dms'>): string {
  const f = (q: Q) => (r.angle ? formatAngle(q, r.dms, r.places) : formatQ(q, r.places))
  if (r.lower && r.upper) return cmp(r.lower, r.upper) === 0 ? `exactly ${f(r.lower)}` : `${f(r.lower)} to ${f(r.upper)}`
  if (r.upper) return `up to ${f(r.upper)}`
  if (r.lower) return `at least ${f(r.lower)}`
  return 'no limits'
}

/**
 * The limits a requirement states, by these rules in order (the page lists them too):
 *   a count first ("4X", "4 PLCS") is kept as the count;
 *   the whole value in brackets, or REF: a reference dimension, not measured;
 *   boxed ([25.4]), or BSC or BASIC: a basic dimension, not measured on its own;
 *   a GD&T symbol or word (position, flatness, profile, ...): the first number is the tolerance, and the result is the
 *     measured deviation, 0 to the tolerance; a material condition modifier is noted, its bonus not added;
 *   surface finish (Ra 1.6, 1.6 Ra, Rz 6.3): an upper limit;
 *   a thread, or a fit without stated limits (Ø12 H7): an attribute; a fit with its limits (Ø12 H7 (12.000/12.018))
 *     uses them;
 *   MAX or MIN: one limit;
 *   nominal ± tolerance; nominal with two deviations (+0.10/-0.00, +0.1 -0, -0.02/-0.05);
 *   two limits (12.05/11.95, 11.95 / 12.05, 11.95 to 12.05, 11.95 - 12.05): the smaller to the larger, though a hyphen
 *     with no spaces is ambiguous and refused;
 *   a lone value: the title block's tolerance for its decimal places (or for angles), if set.
 * Anything else is "limits not read".
 */
export function readRequirement(text: string, settings: ReadingSettings): Reading {
  return withCommas(readRules(text, settings), settings.comma)
}

function readRules(text: string, settings: ReadingSettings): Reading {
  const original = normalize(text)
  if (!original) return NOT_READ('No requirement yet.')
  const upperCase = original.toUpperCase()
  if (/^[\d.,]+\s?[X×]\s?[\d.,]+°$|^[\d.,]+°\s?[X×]\s?[\d.,]+$/.test(upperCase)) {
    return NOT_READ('A chamfer (a size and an angle), or a count with an angle: two values in one, so type the limits of the one this balloon is for.')
  }
  const { rest: counted, count: n } = count(upperCase)
  // Feature control frames often come out of the drawing's text with their dividers.
  const rest = counted.replace(/^[|\s]+/, '').replace(/[|\s]+$/, '')
  const comma = settings.comma
  if (!rest) return NOT_READ('No requirement yet.', n)
  // Datum letters (or a modifier) alone: what a click at the end of a feature control frame reads, not a note.
  if (/^(?:[ⓂⓁⓈⓅⓉⓊⒻ]|[A-Z](?:\s?-\s?[A-Z])?(?:\s?[ⓂⓁⓈ]|\s?\([MLS]\))?(?:[\s|]+[A-Z](?:\s?-\s?[A-Z])?(?:\s?[ⓂⓁⓈ]|\s?\([MLS]\))?){0,2})$/.test(rest)) {
    return NOT_READ('Datum letters only: the rest of the feature control frame is before them. Click its tolerance, or type the whole frame (⌖ Ø0.25 A B C).', n)
  }

  if (/^\(.*\)$/.test(rest) || /\bREF\.?$|^REF\b/.test(rest)) return plain('reference', 'A reference dimension: not measured.', n)
  if (/^\[.*\]$/.test(rest) || /\b(?:BSC|BASIC)\.?$/.test(rest)) return plain('basic', 'A basic dimension: not measured on its own; its tolerance is in the feature control frames that use it.', n)

  // GD&T: the tolerance is the first number after the symbol (and any Ø).
  let gdt: string | null = null
  let afterGdt = ''
  for (const [symbol, name] of Object.entries(GDT_SYMBOLS)) {
    if (rest.startsWith(symbol)) {
      gdt = name
      afterGdt = rest.slice(symbol.length)
      break
    }
  }
  if (!gdt) {
    for (const [pattern, name] of GDT_WORDS) {
      const m = pattern.exec(rest)
      if (!m) continue
      // A word counts as GD&T with its tolerance straight after it, and is refused with only a frame's datum letters
      // after it ("POS A B C"); with other words after it, it's a note ("FLAT WITHIN 0.1", "ROUND ALL EDGES").
      const after = rest.slice(m[0].length)
      if (/^[\s|]*(?:S\s?Ø|Ø)?\s?[+-]?(?:\d|[.,]\d)/.test(after)) {
        gdt = name
        afterGdt = after
        break
      }
      if (frameTail(after)) return NOT_READ(`Read as ${name}, but no tolerance value follows it.`, n)
    }
  }
  if (gdt) {
    const m = /^[\s|]*(Ø|S\s?Ø)?\s?([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))/.exec(afterGdt)
    if (!m) return NOT_READ(`Read as ${gdt}, but no tolerance value follows it.`, n)
    const tol = parseDecimal(m[2], comma)
    if (!tol || tol.value.n < 0n) return NOT_READ(`Read as ${gdt}, but its tolerance "${m[2]}" isn't a number.`, n)
    const after = afterGdt.slice(m[0].length)
    if (/±/.test(after) || Object.keys(GDT_SYMBOLS).some((symbol) => after.includes(symbol)) || GDT_WORDS.some(([pattern]) => new RegExp(`\\s${pattern.source.slice(1)}`).test(after))) {
      return NOT_READ(`Read as ${gdt}, but more follows its tolerance (a second frame, or a ±): balloon each frame, or type the limits.`, n)
    }
    const tail = frameTail(after)
    if (tail === null) return NOT_READ(`Read as ${gdt}, but what follows its tolerance isn’t a frame’s modifiers and datum letters: check it, or type the limits.`, n)
    const notes = [BONUS.test(afterGdt) ? 'A material condition modifier: any bonus tolerance is not added.' : '', tail.unit ? `A tolerance per unit (${tail.unit}): the result is the deviation over any ${tail.unit.slice(1)} of the feature.` : '']
    const note = notes.filter((t) => t).join(' ')
    return measured(ZERO, tol.value, false, tol.places, false, `${gdt[0].toUpperCase()}${gdt.slice(1)}: a deviation of up to ${formatQ(tol.value, tol.places)}.`, n, 'drawing', note)
  }

  // Surface finish.
  const finish = /^(?:√\s?)?(R[AZQ]|RMAX|RT)\s?([\d.,]+)(?:\s?(?:µM|UM|MICRONS?|µIN|UIN|MICROINCH(?:ES)?))?(?:\s?MAX\.?)?$/.exec(rest) ?? /^([\d.,]+)\s?(R[AZQ])$/.exec(rest)
  if (finish) {
    const [label, value] = /^R/.test(finish[1]) ? [finish[1], finish[2]] : [finish[2], finish[1]]
    const v = parseDecimal(value, comma)
    if (v) return measured(null, v.value, false, v.places, false, `Surface finish ${label.slice(0, 1)}${label.slice(1).toLowerCase()}: up to ${formatQ(v.value, v.places)}.`, n, 'drawing')
  }

  // Threads and fits are checked with gauges, unless a fit states its limits.
  if (/^M\d+(?:[.,]\d+)?(?:\s?[X×]\s?\d+(?:[.,]\d+)?)?(?:\s?-\s?\d[A-Z]{1,2}(?:\d[A-Z])?)?\b/.test(rest)) {
    return plain('attribute', 'A thread: checked with gauges, so passed or failed.', n)
  }
  if (/^(?:\d+\/\d+|#?\d+|\d*[.,]\d+)\s?-\s?\d+\s?(?:UNC|UNF|UNEF|UNS|UN|NPT|NPTF|NPS)\b/.test(rest) || /\b(?:UNC|UNF|UNEF|NPT|NPTF|BSPP?|BSPT)\b/.test(rest)) {
    return plain('attribute', 'A thread: checked with gauges, so passed or failed.', n)
  }
  const fitHere = /^(?:Ø\s?)?(\d+(?:[.,]\d+)?)\s?([A-Za-z]{1,2})(\d{1,2})\b(.*)$/.exec(count(original).rest)
  // X is left out of the letters: "4X12" is a count or a size far more often than an X fit.
  if (fitHere && /^(?:[A-HJ-NP-WYZ]|JS|ZA|ZB|ZC|[a-hj-np-wyz]|js|za|zb|zc)$/.test(fitHere[2])) {
    const limits = /^\s?\(([^()]+)\)$/.exec(fitHere[4])
    if (limits) {
      const inner = readRequirement(limits[1], settings)
      if (inner.kind === 'measured' && inner.lower && inner.upper) return { ...inner, count: n, how: `A fit (${fitHere[2]}${fitHere[3]}) with its limits: ${limitsText(inner)}.` }
    }
    if (!fitHere[4].trim()) return plain('attribute', `A fit (${fitHere[2]}${fitHere[3]}): checked with gauges, or type its limits.`, n)
  }

  const angle = isAngle(rest)
  const core = stripTrailing(angle ? rest : rest.replace(/(\d)"/g, '$1')).replace(/^(SØ|SR|CR|Ø|R|□)\s+(?=[\d.,])/, '$1')

  // MAX or MIN.
  const maxMin = /^(.*?)\s?\b(MAX|MIN)\.?$/.exec(core) ?? /^(MAX|MIN)\.?\s?(.*)$/.exec(core)
  if (maxMin) {
    const [word, valueText] = maxMin[1] === 'MAX' || maxMin[1] === 'MIN' ? [maxMin[1], maxMin[2]] : [maxMin[2], maxMin[1]]
    const v = written(unprefixed(valueText.trim()), comma, angle)
    if (!v) return NOT_READ(`"${word}" was found, but "${valueText.trim()}" isn't a single value.`, n)
    const shown = angle ? formatAngle(v.value, v.dms, v.places) : formatQ(v.value, v.places)
    return word === 'MAX'
      ? measured(null, v.value, angle, v.places, v.dms, `A maximum: up to ${shown}.`, n, 'drawing')
      : measured(v.value, null, angle, v.places, v.dms, `A minimum: at least ${shown}.`, n, 'drawing')
  }

  // Nominal ± tolerance.
  const pm = /^(.+?)\s?±\s?(.+)$/.exec(core)
  if (pm) {
    const nominal = written(unprefixed(pm[1].trim()), comma, angle)
    const tol = written(pm[2].trim(), comma, angle, true)
    if (!nominal || !tol || tol.value.n < 0n) return NOT_READ(`"±" was found, but "${pm[1].trim()}" and "${pm[2].trim()}" aren't a value and a tolerance.`, n)
    const places = Math.max(nominal.places, tol.places)
    const dms = nominal.dms || tol.dms
    const lower = sub(nominal.value, tol.value)
    const upper = add(nominal.value, tol.value)
    return measured(lower, upper, angle, places, dms, `${limitsText({ lower, upper, angle, places, dms })}.`, n, 'drawing')
  }

  // Nominal with two deviations: +0.10/-0.00, +0.1 -0, -0.02/-0.05, +0.05/+0.02, +0.1/0, 0/-0.05. Each deviation is a
  // signed number, or a 0 set apart by a space or a slash, so no digit of the nominal is ever taken for one.
  const D = `[+-]\\s?[\\d.,°'"]+`
  const dev =
    new RegExp(`^(\\S+?)\\s*(${D})\\s*\\/?\\s*(${D})$`).exec(core) ??
    new RegExp(`^(\\S+?)\\s*(${D})(?:\\s*\\/\\s*|\\s+)(0)$`).exec(core) ??
    new RegExp(`^(\\S+?)\\s+(0)(?:\\s*\\/\\s*|\\s+)(${D})$`).exec(core)
  if (dev) {
    const nominal = written(unprefixed(dev[1]), comma, angle)
    const a = written(dev[2], comma, angle, true)
    const b = written(dev[3], comma, angle, true)
    if (!nominal || !a || !b) return NOT_READ(`Read as a value with two deviations, but "${dev[1]}", "${dev[2]}", and "${dev[3]}" aren't all numbers.`, n)
    const places = Math.max(nominal.places, a.places, b.places)
    const dms = nominal.dms || a.dms || b.dms
    const lower = add(nominal.value, minQ(a.value, b.value))
    const upper = add(nominal.value, maxQ(a.value, b.value))
    return measured(lower, upper, angle, places, dms, `${limitsText({ lower, upper, angle, places, dms })}.`, n, 'drawing')
  }

  // An inch fraction (3/8, 1 1/2) isn't two limits, and its tolerance (the title block's for fractions) isn't one this
  // page reads.
  if (/^\d+(?:\s\d+)?\/\d+$/.test(unprefixed(core))) {
    return NOT_READ('An inch fraction: type its limits, or write it as a decimal with its tolerance (0.375 ±0.010).', n)
  }

  // Two limits.
  const two = /^(.+?)\s?(?:\/|\bTO\b|\s-\s)\s?(.+)$/.exec(core)
  const signed = (t: string) => /^[+-]/.test(t.trim())
  const zero = (t: string) => /^0(?:[.,]0*)?$/.test(t.trim())
  // A signed value paired with another, or with a 0 ("0/-0.05"), is a pair of deviations whose nominal is missing.
  if (two && (/^\+/.test(two[1].trim()) || /^\+/.test(two[2].trim()) || (signed(two[1]) && (signed(two[2]) || zero(two[2]))) || (zero(two[1]) && signed(two[2])))) {
    return NOT_READ('Signed values with no nominal: deviations need the nominal before them (12.00 +0.10/-0.00), and limits are written unsigned.', n)
  }
  if (two) {
    const a = written(unprefixed(two[1].trim()), comma, angle)
    const b = written(unprefixed(two[2].trim()), comma, angle)
    // The smaller under half the larger isn't one dimension's limits: more likely a value and its deviation (a minus
    // spaced off, "12.00 - 0.05", or drawn as a dash), or dual dimensioning (25.40/1.000).
    if (a && b && cmp(add(minQ(a.value, b.value), minQ(a.value, b.value)), maxQ(a.value, b.value)) < 0) {
      return NOT_READ('Two values too far apart to be one dimension’s limits (a value and its deviation, or millimetres and inches?): type the limits.', n)
    }
    if (a && b) {
      const places = Math.max(a.places, b.places)
      const dms = a.dms || b.dms
      const lower = minQ(a.value, b.value)
      const upper = maxQ(a.value, b.value)
      return measured(lower, upper, angle, places, dms, `Limits ${limitsText({ lower, upper, angle, places, dms })}.`, n, 'drawing')
    }
  }
  if (/^\S+\s[+-]\s?[\d.,]+°?$/.test(core) && !/±/.test(core)) {
    return NOT_READ('Only one deviation: write both (12.00 +0/-0.05), or type the limits.', n)
  }
  if (/^Ø?[\d.,]+-[\d.,]+$/.test(core.replace(/\s/g, ''))) {
    return NOT_READ('A hyphen between two numbers could be a range or a minus: write the limits as 11.95/12.05, 11.95 to 12.05, or 12.00 ±0.05.', n)
  }

  // A value followed by datum letters is a feature control frame whose symbol didn't come through (CAD often draws the
  // symbols as lines, or in a font whose letters stand for them): it must not be read as a size.
  if (/^(?:S?Ø)?[\d.,]+(?:\s?[ⓂⓁⓈⓅⓉⓊⒻ]|\s?\([MLSFPTU]\))?(?:[\s|]+[A-Z](?:\s?-\s?[A-Z])?(?:\s?[ⓂⓁⓈ]|\s?\([MLS]\))?){1,3}$/.test(core)) {
    return NOT_READ('This looks like a feature control frame whose symbol is missing from the drawing\'s text: type the symbol in front (⌖ or POS, ⏥ or FLAT, ⌓ or PROFILE, ...).', n)
  }

  // A lone value takes the title block's tolerance; a signed one, or 0, is a deviation without its nominal.
  if (/^[+-]|^0(?:[.,]0*)?°?$/.test(unprefixed(core))) {
    return NOT_READ('A deviation on its own: its nominal is missing. Read the whole callout, or type the limits.', n)
  }
  const lone = written(unprefixed(core), comma, angle)
  if (lone) {
    const tolText = angle ? settings.titleBlock.angle : settings.titleBlock.places[lone.dms ? -1 : lone.places] ?? ''
    if (!tolText.trim()) {
      return NOT_READ(angle ? 'A lone angle: set the title block\'s tolerance for angles, or type its limits.' : `A lone value with ${lone.places} decimal place${lone.places === 1 ? '' : 's'}: set the title block's tolerance for ${lone.places} place${lone.places === 1 ? '' : 's'}, or type its limits.`, n)
    }
    const tol = written(normalize(tolText).replace(/^±/, '').trim(), comma, angle, true)
    if (!tol || tol.value.n < 0n) return NOT_READ(`The title block's tolerance "${tolText}" isn't a number.`, n)
    const places = Math.max(lone.places, tol.places)
    const dms = lone.dms || tol.dms
    const lower = sub(lone.value, tol.value)
    const upper = add(lone.value, tol.value)
    const which = angle ? 'for angles' : `for ${lone.places} place${lone.places === 1 ? '' : 's'}`
    return measured(lower, upper, angle, places, dms, `${limitsText({ lower, upper, angle, places, dms })}, from the title block (${which}, ±${tolText.replace(/^±/, '').trim()}).`, n, 'title block')
  }

  if (/\p{Nd}/u.test(core)) return NOT_READ('Couldn\'t tell the limits from this: type them below, or edit the requirement.', n)
  return plain('attribute', 'A note or requirement without a value: passed or failed.', n)
}

/** The limits for a balloon: typed ones win (either or both), otherwise the requirement's. */
export function limitsFor(b: Pick<Balloon, 'requirement' | 'lower' | 'upper'>, settings: ReadingSettings): Reading {
  const reading = readRequirement(b.requirement, settings)
  if (!b.lower.trim() && !b.upper.trim()) return reading
  const angle = reading.angle || isAngle(normalize(b.requirement)) || isAngle(b.lower + b.upper)
  const lower = b.lower.trim() ? written(normalize(b.lower), settings.comma, angle, true) : null
  const upper = b.upper.trim() ? written(normalize(b.upper), settings.comma, angle, true) : null
  if ((b.lower.trim() && !lower) || (b.upper.trim() && !upper)) return { ...NOT_READ('A typed limit isn\'t a number.', reading.count), angle }
  if (lower && upper && cmp(lower.value, upper.value) > 0) return { ...NOT_READ('The typed lower limit is above the upper one.', reading.count), angle }
  const places = Math.max(lower?.places ?? 0, upper?.places ?? 0)
  const dms = Boolean(lower?.dms || upper?.dms)
  const r = { lower: lower?.value ?? null, upper: upper?.value ?? null, angle, places, dms }
  return withCommas(measured(r.lower, r.upper, angle, places, dms, `${limitsText(r)}, typed in.`, reading.count, 'typed', reading.note), settings.comma)
}

// --- Results.

export type PieceStatus = 'pass' | 'fail' | 'open' | 'na' | 'unreadable' | 'recorded'
export type Status = 'pass' | 'fail' | 'open' | 'na' | 'unreadable' | 'not-measured' | 'no-limits'

export interface PieceResult {
  status: PieceStatus
  /** The values read, in order. */
  values: Q[]
  /** For 'unreadable': the part that couldn't be read. */
  bad: string
}

export interface Evaluation {
  status: Status
  pieces: PieceResult[]
}

export const ATTRIBUTE_RESULTS = ['Pass', 'Fail', 'N/A'] as const

/** The values in one piece's result: separated by spaces or semicolons, and by commas too unless they're decimal marks. */
export function splitValues(text: string, comma: boolean): string[] {
  return normalize(text)
    .split(comma ? /[\s;]+/ : /[\s;,]+/)
    .filter((t) => t)
}

export function evaluate(b: Balloon, settings: ReadingSettings, pieces: number): Evaluation {
  return evaluateWith(limitsFor(b, settings), b, settings, pieces)
}

/** The same, with the balloon's limits already read (the page keeps them, so typing doesn't re-read every one). */
export function evaluateWith(r: Reading, b: Balloon, settings: ReadingSettings, pieces: number): Evaluation {
  const out: PieceResult[] = []
  for (let i = 0; i < pieces; i++) {
    const text = normalize(b.results[i] ?? '')
    if (!text) out.push({ status: 'open', values: [], bad: '' })
    else if (/^N\/?A$/i.test(text)) out.push({ status: 'na', values: [], bad: '' })
    else if (r.kind === 'attribute' || (r.kind === 'unread' && /^(?:pass|fail)$/i.test(text))) {
      // Pass or fail on a requirement whose limits weren't read is the inspector's call, so it's taken as one.
      const t = text.toLowerCase()
      out.push(t === 'pass' ? { status: 'pass', values: [], bad: '' } : t === 'fail' ? { status: 'fail', values: [], bad: '' } : { status: 'unreadable', values: [], bad: text })
    } else {
      const values: Q[] = []
      let bad = settings.comma ? '' : (/\d,\d/.exec(text) ? (/\S*\d,\d\S*/.exec(text)?.[0] ?? text) : '')
      for (const token of bad ? [] : splitValues(text, settings.comma)) {
        const v = written(token, settings.comma, r.angle, true)
        if (!v) {
          bad = token
          break
        }
        values.push(v.value)
      }
      if (bad) out.push({ status: 'unreadable', values, bad })
      else if (r.kind !== 'measured') out.push({ status: 'recorded', values, bad: '' })
      else {
        const inside = values.every((v) => (!r.lower || cmp(v, r.lower) >= 0) && (!r.upper || cmp(v, r.upper) <= 0))
        // A requirement for several features ("4X") needs a value for each: with fewer, the piece is still open.
        out.push({ status: !inside ? 'fail' : values.length < r.count ? 'open' : 'pass', values, bad: '' })
      }
    }
  }
  const has = (s: PieceStatus) => out.some((p) => p.status === s)
  // An unread requirement judged by pass or fail on every piece entered is an attribute, not a missing limit.
  const judged = r.kind === 'unread' && out.some((p) => p.status === 'pass' || p.status === 'fail') && !has('recorded')
  let status: Status
  if (r.kind === 'reference' || r.kind === 'basic') status = has('unreadable') ? 'unreadable' : 'not-measured'
  else if (has('fail')) status = 'fail'
  else if (has('unreadable')) status = 'unreadable'
  else if (r.kind === 'unread' && !judged) status = 'no-limits'
  else if (has('open')) status = 'open'
  else if (out.length && out.every((p) => p.status === 'na')) status = 'na'
  else if (has('recorded')) status = 'no-limits'
  else status = 'pass'
  return { status, pieces: out }
}

export const STATUS_TEXT: Record<Status, string> = {
  pass: 'Pass',
  fail: 'Fail',
  open: 'Open',
  na: 'N/A',
  unreadable: 'Unreadable',
  'not-measured': 'Not measured',
  'no-limits': 'No limits',
}

// --- Zones.

export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/** A sheet's zone grid: its frame as fractions of the sheet as shown, the counts, and where 1 and A start. */
export interface Zones {
  left: number
  top: number
  right: number
  bottom: number
  columns: number
  rows: number
  start: Corner
  skipIO: boolean
}

export const MAX_ZONES = 60

export function zonesValid(z: Zones): boolean {
  const inUnit = (v: number) => Number.isFinite(v) && v >= 0 && v <= 1
  return (
    inUnit(z.left) && inUnit(z.top) && inUnit(z.right) && inUnit(z.bottom) &&
    z.right - z.left > 0.01 && z.bottom - z.top > 0.01 &&
    Number.isInteger(z.columns) && Number.isInteger(z.rows) &&
    z.columns >= 1 && z.rows >= 1 && z.columns <= MAX_ZONES && z.rows <= MAX_ZONES &&
    ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(z.start)
  )
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LETTERS_NO_IO = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

/** The letter for row `index` (from 0): A, B, ... then AA, AB, ... past Z. */
export function rowLetter(index: number, skipIO: boolean): string {
  const a = skipIO ? LETTERS_NO_IO : LETTERS
  return index < a.length ? a[index] : rowLetter(Math.floor(index / a.length) - 1, skipIO) + a[index % a.length]
}

/**
 * The zone a point on the sheet is in, as letter and number ("C4"), or null outside the frame. Each zone runs from its
 * edge nearer the start corner up to, but not including, the next one; the frame's far edges belong to the last zones.
 */
export function zoneAt(z: Zones, fx: number, fy: number): string | null {
  if (!zonesValid(z) || !(fx >= z.left && fx <= z.right && fy >= z.top && fy <= z.bottom)) return null
  const across = z.start.endsWith('left') ? (fx - z.left) / (z.right - z.left) : (z.right - fx) / (z.right - z.left)
  const down = z.start.startsWith('top') ? (fy - z.top) / (z.bottom - z.top) : (z.bottom - fy) / (z.bottom - z.top)
  const column = Math.min(z.columns - 1, Math.floor(across * z.columns))
  const row = Math.min(z.rows - 1, Math.floor(down * z.rows))
  return `${rowLetter(row, z.skipIO)}${column + 1}`
}

// --- Balloons and the work.

export interface Balloon {
  id: string
  /** The sheet (page) it's on, from 1. */
  sheet: number
  /** Its centre in the PDF's user space for that page. */
  x: number
  y: number
  requirement: string
  designator: string
  /** Typed limits ('' for none), which take the place of the requirement's. */
  lower: string
  upper: string
  /** Each piece's result as typed: values, or Pass, Fail, or N/A. */
  results: string[]
  tooling: string
  nc: string
  remarks: string
}

export type BalloonSize = 'small' | 'medium' | 'large'

export interface Header {
  partNumber: string
  partName: string
  serial: string
  fairId: string
}

export interface Work {
  /** The drawing's file name, and its SHA-256 (hex), which finds it in the browser's store. */
  name: string
  docId: string
  sheets: number
  balloons: Balloon[]
  /** Zone grids by sheet number. */
  zones: Record<number, Zones>
  pieces: number
  comma: boolean
  titleBlock: TitleBlock
  header: Header
  size: BalloonSize
}

export const MAX_PIECES = 5
export const PLACES = [0, 1, 2, 3, 4]

export function newWork(name: string, docId: string, sheets: number): Work {
  return {
    name,
    docId,
    sheets,
    balloons: [],
    zones: {},
    pieces: 1,
    comma: false,
    titleBlock: { places: ['', '', '', '', ''], angle: '' },
    header: { partNumber: '', partName: '', serial: '', fairId: '' },
    size: 'medium',
  }
}

export function blankBalloon(id: string, sheet: number, x: number, y: number, requirement = ''): Balloon {
  return { id, sheet, x, y, requirement, designator: '', lower: '', upper: '', results: [], tooling: '', nc: '', remarks: '' }
}

/** A balloon's number is its place in the list, from 1, so numbers always run 1 to N with no gaps or repeats. */
export function numberOf(list: readonly Balloon[], id: string): number {
  return list.findIndex((b) => b.id === id) + 1
}

/** The list with `b` given number `at` (1 to N + 1): the balloons from that number on move up one. */
export function insertAt(list: readonly Balloon[], b: Balloon, at: number): Balloon[] {
  const i = Math.max(0, Math.min(list.length, Math.floor(at) - 1))
  return [...list.slice(0, i), b, ...list.slice(i)]
}

export function removeBalloon(list: readonly Balloon[], id: string): Balloon[] {
  return list.filter((b) => b.id !== id)
}

export function updateBalloon(list: readonly Balloon[], id: string, change: Partial<Omit<Balloon, 'id'>>): Balloon[] {
  return list.map((b) => (b.id === id ? { ...b, ...change } : b))
}

/** The list with `id` moved to number `to` (1 to N). */
export function moveToNumber(list: readonly Balloon[], id: string, to: number): Balloon[] {
  const b = list.find((x) => x.id === id)
  if (!b) return [...list]
  return insertAt(removeBalloon(list, id), b, to)
}

/**
 * Renumbered in reading order: by sheet, then in bands down the sheet (each a fortieth of its height), then across.
 * `where` gives a balloon's place on its sheet as shown, as fractions from the top left.
 */
export function inReadingOrder(list: readonly Balloon[], where: (b: Balloon) => { fx: number; fy: number }): Balloon[] {
  const keyed = list.map((b, i) => {
    const { fx, fy } = where(b)
    return { b, i, band: Math.floor(Math.max(0, Math.min(0.999999, fy)) * 40), fx }
  })
  keyed.sort((p, q) => p.b.sheet - q.b.sheet || p.band - q.band || p.fx - q.fx || p.i - q.i)
  return keyed.map((k) => k.b)
}

// --- Checks.

export interface Checks {
  balloons: number
  /** Balloons on each sheet, by sheet number. */
  bySheet: Record<number, number>
  /** Characteristic numbers, for each kind of gap. */
  noRequirement: number[]
  noLimits: number[]
  open: number[]
  unreadable: number[]
  failed: number[]
  failedWithoutNc: number[]
  /** Balloons whose point is off their sheet, so they can't be seen there or in the ballooned PDF. */
  outside: number[]
}

export function checks(work: Work, read?: (b: Balloon) => Reading, outside?: (b: Balloon) => boolean): Checks {
  const settings = { comma: work.comma, titleBlock: work.titleBlock }
  const c: Checks = { balloons: work.balloons.length, bySheet: {}, noRequirement: [], noLimits: [], open: [], unreadable: [], failed: [], failedWithoutNc: [], outside: [] }
  work.balloons.forEach((b, i) => {
    const n = i + 1
    c.bySheet[b.sheet] = (c.bySheet[b.sheet] ?? 0) + 1
    if (outside?.(b)) c.outside.push(n)
    if (!b.requirement.trim()) c.noRequirement.push(n)
    const e = read ? evaluateWith(read(b), b, settings, work.pieces) : evaluate(b, settings, work.pieces)
    if (e.status === 'no-limits') c.noLimits.push(n)
    if (e.pieces.some((p) => p.status === 'open') && e.status !== 'not-measured') c.open.push(n)
    if (e.status === 'unreadable') c.unreadable.push(n)
    if (e.status === 'fail') {
      c.failed.push(n)
      if (!b.nc.trim()) c.failedWithoutNc.push(n)
    }
  })
  return c
}

// --- The Form 3 table as a spreadsheet file.

/**
 * A cell safe to open in a spreadsheet: quoted when needed (when it holds a quote, a line break, or the separator), and
 * never read as a formula (a plain number stays).
 */
export function csvCell(value: string, separator = ','): string {
  const v = /^[=+\-@\t\r]/.test(value) && !/^[+-]?\d+([.,]\d+)?$/.test(value) ? `'${value}` : value
  return /["\n\r]/.test(v) || v.includes(separator) ? `"${v.replace(/"/g, '""')}"` : v
}

/** One piece's result as it goes in the table: the values as typed, tidied, or Pass, Fail, N/A. */
export function resultText(text: string, comma: boolean): string {
  const t = normalize(text)
  if (!t) return ''
  if (/^N\/?A$/i.test(t)) return 'N/A'
  if (/^(?:pass|fail)$/i.test(t)) return t[0].toUpperCase() + t.slice(1).toLowerCase()
  return splitValues(t, comma).join(comma ? '; ' : ', ')
}

/**
 * The characteristic accountability table in Form 3's column order, with the limits, the pass or fail, and each
 * piece's result after it. `location` gives a balloon's reference location (its sheet, and zone if there is one).
 * With decimal commas, cells are separated by semicolons, as spreadsheets that use decimal commas expect.
 */
export function form3Csv(work: Work, location: (b: Balloon) => string, read?: (b: Balloon) => Reading): string {
  const sep = work.comma ? ';' : ','
  const cell = (v: string) => csvCell(v, sep)
  const settings = { comma: work.comma, titleBlock: work.titleBlock }
  const pieces = Array.from({ length: work.pieces }, (_, i) => `Piece ${i + 1}`)
  const head = ['Char. No.', 'Reference Location', 'Characteristic Designator', 'Requirement', 'Results', 'Designed / Qualified Tooling', 'Nonconformance Number', 'Additional Data / Comments', 'Lower limit', 'Upper limit', 'Pass / fail', ...(work.pieces > 1 ? pieces : [])]
  const lines = [head.map(cell).join(sep)]
  work.balloons.forEach((b, i) => {
    const r = read ? read(b) : limitsFor(b, settings)
    const e = evaluateWith(r, b, settings, work.pieces)
    const each = Array.from({ length: work.pieces }, (_, p) => resultText(b.results[p] ?? '', work.comma))
    // Pieces are set apart by " | ", since a piece's own values are separated by ";" (or ",").
    const results = work.pieces > 1 ? each.map((t, p) => (t ? `${p + 1}: ${t}` : '')).filter((t) => t).join(' | ') : each[0]
    const f = (q: Q | null) => (q ? limitText(q, r, work.comma) : '')
    const remarks = [b.remarks.trim(), r.note].filter((t) => t).join(' ')
    const row = [String(i + 1), location(b), b.designator.trim(), normalize(b.requirement), results, b.tooling.trim(), b.nc.trim(), remarks, r.kind === 'measured' ? f(r.lower) : '', r.kind === 'measured' ? f(r.upper) : '', STATUS_TEXT[e.status], ...(work.pieces > 1 ? each : [])]
    lines.push(row.map(cell).join(sep))
  })
  return String.fromCharCode(0xfeff) + lines.join('\r\n') + '\r\n'
}

// --- Reading text off the drawing.

/**
 * A run of text on the sheet as shown (scale 1, y down): where its baseline starts, the unit direction it runs in, its
 * length along that direction, and its font size.
 */
export interface TextBox {
  str: string
  x: number
  y: number
  ux: number
  uy: number
  w: number
  h: number
}

const PLAIN_NUMBER = /^(?:Ø\s?)?[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/
const DEVIATION = /^(?:[+±-]\s?(?:\d+(?:[.,]\d*)?|[.,]\d+)|0)$/
const SYMBOL = /^[⌖⏥⌓⌒⟂⊥∥∠○◯⌭↗⌰◎⌯⏤]$/
/** A feature control frame's cells other than its tolerance: datum letters, modifiers, and symbols. */
const CELL = /^(?:[A-Z](?:\s?-\s?[A-Z])?|[ⓂⓁⓈⓅⓉⓊⒻ]|[⌖⏥⌓⌒⟂⊥∥∠○◯⌭↗⌰◎⌯⏤])$/
/** A frame's tolerance cell: a number, perhaps with a diameter sign before it and modifiers after it. */
const TOLERANCE_CELL = /^(?:S?Ø\s?)?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:\s?[ⓂⓁⓈⓅⓉⓊⒻ]|\s?\([MLSFPTU]\))*$/
/** A frame's cells after its symbol: the tolerance, then any datum letters with their modifiers. */
const FRAME_BODY = /^[|\s]*(?:S?Ø\s?)?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:\s?[ⓂⓁⓈⓅⓉⓊⒻ]|\s?\([MLSFPTU]\))*(?:[\s|]+(?:[A-Z](?:\s?-\s?[A-Z])?|[ⓂⓁⓈ]|\([MLS]\)))*[|\s]*$/

/** A point in a text box's own frame: along its baseline from its start, and up from the baseline. */
function local(t: TextBox, px: number, py: number): { u: number; v: number } {
  const dx = px - t.x
  const dy = py - t.y
  return { u: dx * t.ux + dy * t.uy, v: -(dx * -t.uy + dy * t.ux) }
}

function distance(t: TextBox, px: number, py: number): number {
  const { u, v } = local(t, px, py)
  const du = u < 0 ? -u : u > t.w ? u - t.w : 0
  const lo = -0.25 * t.h
  const dv = v < lo ? lo - v : v > t.h ? v - t.h : 0
  return Math.hypot(du, dv)
}

/** A callout read off the drawing: its text, and the rectangle it covers in its own frame (see `Callout`). */
export interface Callout {
  text: string
  /** The first run's baseline start, and the direction the text runs in, on the sheet as shown (scale 1, y down). */
  x: number
  y: number
  ux: number
  uy: number
  /** Its extent along the text from (x, y), and up from the baseline (stacked lines included). */
  u0: number
  u1: number
  v0: number
  v1: number
}

/**
 * The callout nearest a point, as one line of text: the nearest run within `reach`, joined with the runs on the same
 * line that follow on from it, then (for a value on its own) a smaller stacked pair of deviations just after it
 * ("+0.05" over "-0.02"), or a second value stacked above or below it (limit dimensioning, "12.05" over "11.95").
 * Null when nothing is close enough.
 */
export function calloutAt(boxes: readonly TextBox[], px: number, py: number, reach: number): string | null {
  return calloutNear(boxes, px, py, reach)?.text ?? null
}

export function calloutNear(boxes: readonly TextBox[], px: number, py: number, reach: number, fromNominal = false): Callout | null {
  const live = boxes.filter((t) => t.str.trim() && t.h > 0 && Number.isFinite(t.x + t.y + t.ux + t.uy + t.w + t.h))
  let seed: TextBox | null = null
  let best = Infinity
  for (const t of live) {
    const d = distance(t, px, py)
    if (d < best) {
      best = d
      seed = t
    }
  }
  if (!seed || best > reach) return null
  const s = seed
  const sameWay = (t: TextBox) => t.ux * s.ux + t.uy * s.uy > 0.999
  const rel = (t: TextBox) => local(s, t.x, t.y)
  const value = (t: TextBox) => normalize(t.str).replace(/\s/g, '')

  // A click on stacked deviations ("+0.05" over "-0.02", "0" over "-0.05") is read from their nominal, the larger
  // value just before them, so the whole callout is read and not the deviations as limits of their own.
  if (!fromNominal && DEVIATION.test(value(s))) {
    const nominal = live
      .filter((t) => t !== s && sameWay(t) && t.h > 1.05 * s.h && t.h <= 3 * s.h && PLAIN_NUMBER.test(value(t)) && !DEVIATION.test(value(t)))
      .map((t) => ({ t, at: local(t, s.x, s.y) }))
      .filter(({ t, at }) => at.u >= t.w - 0.3 * t.h && at.u <= t.w + 1.5 * t.h && at.v >= -1.0 * t.h && at.v <= 1.2 * t.h)
      .sort((a, b) => Math.abs(a.at.u - a.t.w) - Math.abs(b.at.u - b.t.w))[0]
    if (nominal) {
      const t = nominal.t
      return calloutNear(boxes, t.x + (t.w / 2) * t.ux + (t.h / 2) * t.uy, t.y + (t.w / 2) * t.uy - (t.h / 2) * t.ux, reach, true)
    }
  }

  // The line: runs on the seed's baseline (within a third of its height), of similar size, chained by small gaps.
  const line = live
    .filter((t) => sameWay(t) && Math.abs(rel(t).v) <= 0.35 * s.h && t.h > 0.6 * s.h && t.h < 1.6 * s.h)
    .map((t) => ({ t, u: rel(t).u }))
    .sort((a, b) => a.u - b.u)
  const gapBefore = (i: number) => line[i].u - (line[i - 1].u + line[i - 1].t.w)
  const at = line.findIndex((x) => x.t === s)
  let first = at
  let last = at
  while (first > 0 && gapBefore(first) <= 1.0 * s.h) first--
  while (last < line.length - 1 && gapBefore(last + 1) <= 1.0 * s.h) last++
  // A feature control frame's cells sit further apart than words: datum letters, modifiers, and symbols up to six
  // heights away along the line are part of it.
  const cell = (t: TextBox) => CELL.test(normalize(t.str))
  const symbolAt = (i: number) => SYMBOL.test(normalize(line[i].t.str))
  while (last < line.length - 1 && gapBefore(last + 1) <= 6 * s.h && (cell(line[last + 1].t) || (symbolAt(last) && TOLERANCE_CELL.test(normalize(line[last + 1].t.str))))) last++
  // Clicked at the frame's datum letters (where balloons usually go): the frame starts further back, at its tolerance.
  let cellsOnly = true
  for (let i = first; i <= last; i++) cellsOnly &&= cell(line[i].t) && !symbolAt(i)
  if (cellsOnly) {
    let i = first
    while (i > 0 && gapBefore(i) <= 6 * s.h && cell(line[i - 1].t) && !symbolAt(i - 1)) i--
    if (i > 0 && gapBefore(i) <= 6 * s.h && TOLERANCE_CELL.test(normalize(line[i - 1].t.str))) {
      i--
      while (i > 0 && gapBefore(i) <= 1.0 * s.h) i--
      first = i
    }
  }
  // The frame's symbol before its tolerance, but only before what reads as a frame's cells (a tolerance and datum
  // letters), so a symbol nearby on the line isn't put in front of a dimension.
  const cells = normalize(line.slice(first, last + 1).map((x) => x.t.str).join(' '))
  if (FRAME_BODY.test(cells)) while (first > 0 && symbolAt(first - 1) && gapBefore(first) <= 6 * s.h) first--
  let text = ''
  for (let i = first; i <= last; i++) text += (i > first && gapBefore(i) > 0.15 * s.h ? ' ' : '') + line[i].t.str.trim()
  const end = line[last].u + line[last].t.w
  const start = line[first].u
  const joined = normalize(text)
  const box = { u0: start, u1: end, v0: -0.25 * s.h, v1: s.h }
  const result = (t: string): Callout => ({ text: t, x: s.x, y: s.y, ux: s.ux, uy: s.uy, ...box })

  if (PLAIN_NUMBER.test(joined.replace(/\s/g, ''))) {
    // Stacked deviations: smaller runs just after the line's end, one above the baseline's middle and one below.
    const small = live
      .filter((t) => sameWay(t) && t.h >= 0.35 * s.h && t.h <= 0.95 * s.h && DEVIATION.test(normalize(t.str).replace(/\s/g, '')))
      .map((t) => ({ t, ...rel(t) }))
      .filter((x) => x.u >= end - 0.3 * s.h && x.u <= end + 1.5 * s.h && x.v >= -1.0 * s.h && x.v <= 1.2 * s.h)
    const above = small.filter((x) => x.v > 0.25 * s.h).sort((a, b) => a.u - b.u)[0]
    const below = small.filter((x) => x.v <= 0.25 * s.h).sort((a, b) => a.u - b.u)[0]
    if (above && below) {
      box.u1 = Math.max(end, above.u + above.t.w, below.u + below.t.w)
      box.v0 = Math.min(box.v0, below.v - 0.25 * below.t.h)
      box.v1 = Math.max(box.v1, above.v + above.t.h)
      return result(`${joined} ${normalize(above.t.str).replace(/\s/g, '')}/${normalize(below.t.str).replace(/\s/g, '')}`)
    }

    // Limit dimensioning: another unsigned value of similar size stacked directly above or below, overlapping across,
    // with the same number of decimal places, the larger on top (as the standards draw it), and within a quarter of
    // it. Not when a third value is stacked the same way: that's a column of values (a table, or ordinate dimensions),
    // each its own; then only the value clicked is read.
    const own = line.slice(first, last + 1).map((x) => x.t)
    const near = live
      .filter((t) => !own.includes(t) && sameWay(t) && t.h > 0.7 * s.h && t.h < 1.4 * s.h && PLAIN_NUMBER.test(value(t)) && !/^(?:Ø\s?)?[+-]/.test(value(t)))
      .map((t) => ({ t, ...rel(t) }))
    const overlaps = (a0: number, a1: number, b0: number, b1: number) => Math.min(a1, b1) - Math.max(a0, b0) > 0.5 * Math.min(a1 - a0, b1 - b0)
    const stackedOn = (v: number, u0: number, u1: number, except?: TextBox) =>
      near.filter((x) => x.t !== except && Math.abs(x.v - v) >= 0.8 * s.h && Math.abs(x.v - v) <= 1.7 * s.h && overlaps(u0, u1, x.u, x.u + x.t.w))
    const stacked = stackedOn(0, start, end).sort((a, b) => Math.abs(a.v) - Math.abs(b.v))[0]
    if (stacked) {
      const other = value(stacked.t)
      const mine = joined.replace(/\s/g, '')
      const column = stackedOn(0, start, end, stacked.t).length > 0 || stackedOn(stacked.v, stacked.u, stacked.u + stacked.t.w, stacked.t).some((x) => Math.sign(x.v - stacked.v) === Math.sign(stacked.v))
      const [top, bottom] = (stacked.v > 0 ? [other, mine] : [mine, other]).map((t) => parseDecimal(t.replace(/^Ø/, ''), true))
      const limits = top && bottom && top.places === bottom.places && cmp(top.value, bottom.value) > 0 && cmp(sub(top.value, bottom.value), frac(top.value.n, top.value.d * 4n)) <= 0
      if (limits && !column) {
        box.u0 = Math.min(box.u0, stacked.u)
        box.u1 = Math.max(box.u1, stacked.u + stacked.t.w)
        if (stacked.v > 0) box.v1 = Math.max(box.v1, stacked.v + stacked.t.h)
        else box.v0 = Math.min(box.v0, stacked.v - 0.25 * stacked.t.h)
        return result(stacked.v > 0 ? `${other}/${mine}` : `${mine}/${other}`)
      }
    }
  }
  return joined ? result(joined) : null
}

/**
 * Where a balloon of radius `r` goes so it doesn't hide the callout it numbers: where it was put, if its circle is clear
 * of the callout (by a fifth of its radius); otherwise just outside the callout (to either side, above, below, or at a
 * corner, or further out in steps of a balloon's width), the nearest such place that covers none of the sheet's other
 * text (`others`) and no other balloon (`balloons`, their centres), staying on the sheet (width by height, as shown).
 * With no place clear of everything, the nearest clear of the other balloons, then of the text. Points are on the
 * sheet as shown, y down.
 */
export function besideCallout(c: Callout, px: number, py: number, r: number, width: number, height: number, others: readonly TextBox[] = [], balloons: readonly { x: number; y: number }[] = []): { x: number; y: number } {
  const nx = c.uy
  const ny = -c.ux
  const toLocal = (x: number, y: number) => ({ u: (x - c.x) * c.ux + (y - c.y) * c.uy, v: (x - c.x) * nx + (y - c.y) * ny })
  const toSheet = (u: number, v: number) => ({ x: c.x + u * c.ux + v * nx, y: c.y + u * c.uy + v * ny })
  const p = toLocal(px, py)
  const gap = r * 1.2
  const du = p.u < c.u0 ? c.u0 - p.u : p.u > c.u1 ? p.u - c.u1 : 0
  const dv = p.v < c.v0 ? c.v0 - p.v : p.v > c.v1 ? p.v - c.v1 : 0
  if (Math.hypot(du, dv) >= gap) return { x: px, y: py }
  const mid = (c.v0 + c.v1) / 2
  const along = Math.max(c.u0, Math.min(c.u1, p.u))
  const options: { x: number; y: number }[] = []
  // Each ring a balloon's width further out than the last, for a callout whose nearer places are taken (one with
  // several characteristics, each its own balloon).
  for (let ring = 0; ring < 4; ring++) {
    const g = gap + ring * 2.2 * r
    const d = g * Math.SQRT1_2
    options.push(
      toSheet(c.u0 - g, mid),
      toSheet(c.u1 + g, mid),
      toSheet(along, c.v1 + g),
      toSheet(along, c.v0 - g),
      toSheet(c.u0 - d, c.v1 + d),
      toSheet(c.u1 + d, c.v1 + d),
      toSheet(c.u0 - d, c.v0 - d),
      toSheet(c.u1 + d, c.v0 - d),
    )
  }
  const onSheet = options.filter((q) => q.x >= r && q.y >= r && q.x <= width - r && q.y <= height - r)
  if (!onSheet.length) return { x: px, y: py }
  const near = (q: { x: number; y: number }) => Math.hypot(q.x - px, q.y - py)
  onSheet.sort((a, b) => near(a) - near(b))
  const live = others.filter((t) => t.str.trim() && t.h > 0)
  const clearOfText = (q: { x: number; y: number }) => live.every((t) => distance(t, q.x, q.y) >= r * 1.1)
  const clearOfBalloons = (q: { x: number; y: number }) => balloons.every((b) => Math.hypot(b.x - q.x, b.y - q.y) >= r * 2.2)
  return onSheet.find((q) => clearOfBalloons(q) && clearOfText(q)) ?? onSheet.find(clearOfBalloons) ?? onSheet[0]
}

// --- Saving and reopening.

export const STORAGE_KEY = 'labs:ballooned-drawing'
export const WORK_FILE_FORMAT = 'labs:ballooned-drawing work'

/** The longest each field may be: the page's inputs stop there, and saved work is read back to the same lengths. */
export const MAX_LENGTH = { requirement: 2000, designator: 200, limit: 100, result: 2000, tooling: 500, nc: 200, remarks: 2000, header: 200, titleBlock: 50 } as const

const str = (v: unknown, max = 2000): string => (typeof v === 'string' ? v.slice(0, max) : '')
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

/** A balloon from saved data, or null if it can't be one. */
function readBalloon(v: unknown, sheets: number): Balloon | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const sheet = num(o.sheet)
  const x = num(o.x)
  const y = num(o.y)
  const id = str(o.id, 100)
  // Points far beyond any sheet (PDF pages are at most a few hundred thousand units across) can't be written into a PDF.
  const onAPage = (v: number | null): v is number => v !== null && Math.abs(v) <= 1e6
  if (!id || sheet === null || !Number.isInteger(sheet) || sheet < 1 || sheet > sheets || !onAPage(x) || !onAPage(y)) return null
  const L = MAX_LENGTH
  const results = Array.isArray(o.results) ? o.results.slice(0, MAX_PIECES).map((r) => str(r, L.result)) : []
  return { id, sheet, x, y, requirement: str(o.requirement, L.requirement), designator: str(o.designator, L.designator), lower: str(o.lower, L.limit), upper: str(o.upper, L.limit), results, tooling: str(o.tooling, L.tooling), nc: str(o.nc, L.nc), remarks: str(o.remarks, L.remarks) }
}

/** Saved work, read defensively: what can't be read is left out and counted, never allowed to break the page. */
export function readWork(value: unknown): { work: Work | null; dropped: number } {
  if (!value || typeof value !== 'object') return { work: null, dropped: 0 }
  const o = value as Record<string, unknown>
  const sheets = num(o.sheets)
  const docId = str(o.docId, 200)
  if (!docId || sheets === null || !Number.isInteger(sheets) || sheets < 1 || sheets > 100_000) return { work: null, dropped: 0 }
  const work = newWork(str(o.name, 500) || 'drawing.pdf', docId, sheets)
  const list = Array.isArray(o.balloons) ? o.balloons : []
  const seen = new Set<string>()
  for (const item of list) {
    const b = readBalloon(item, sheets)
    if (b && !seen.has(b.id)) {
      seen.add(b.id)
      work.balloons.push(b)
    }
  }
  const dropped = list.length - work.balloons.length
  if (o.zones && typeof o.zones === 'object') {
    for (const [k, z] of Object.entries(o.zones as Record<string, unknown>)) {
      const sheet = Number(k)
      if (!Number.isInteger(sheet) || sheet < 1 || sheet > sheets || !z || typeof z !== 'object') continue
      const g = z as Record<string, unknown>
      const zones: Zones = {
        left: num(g.left) ?? -1,
        top: num(g.top) ?? -1,
        right: num(g.right) ?? -1,
        bottom: num(g.bottom) ?? -1,
        columns: num(g.columns) ?? 0,
        rows: num(g.rows) ?? 0,
        start: (['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(g.start as string) ? g.start : 'top-left') as Corner,
        skipIO: g.skipIO !== false,
      }
      if (zonesValid(zones)) work.zones[sheet] = zones
    }
  }
  const pieces = num(o.pieces)
  if (pieces !== null && Number.isInteger(pieces) && pieces >= 1 && pieces <= MAX_PIECES) work.pieces = pieces
  work.comma = o.comma === true
  if (o.titleBlock && typeof o.titleBlock === 'object') {
    const t = o.titleBlock as Record<string, unknown>
    if (Array.isArray(t.places)) work.titleBlock.places = PLACES.map((p) => str((t.places as unknown[])[p], MAX_LENGTH.titleBlock))
    work.titleBlock.angle = str(t.angle, MAX_LENGTH.titleBlock)
  }
  if (o.header && typeof o.header === 'object') {
    const h = o.header as Record<string, unknown>
    const n = MAX_LENGTH.header
    work.header = { partNumber: str(h.partNumber, n), partName: str(h.partName, n), serial: str(h.serial, n), fairId: str(h.fairId, n) }
  }
  if (o.size === 'small' || o.size === 'medium' || o.size === 'large') work.size = o.size
  return { work, dropped }
}
