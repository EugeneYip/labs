/**
 * Numbers by Ear: what to say, how to read what was typed, and which voices to
 * offer. Speaking itself is the browser's speechSynthesis; this file has no DOM
 * access, so it can be tested on its own.
 */

export type Mode = 'small' | 'hundreds' | 'big' | 'years' | 'prices'

export const MODES: { id: Mode; label: string }[] = [
  { id: 'small', label: '0 to 100' },
  { id: 'hundreds', label: 'Up to 1,000' },
  { id: 'big', label: 'Up to a million' },
  { id: 'years', label: 'Years' },
  { id: 'prices', label: 'Prices' },
]

export interface Question {
  mode: Mode
  /** The language the number is spoken in, such as `fr-FR`. */
  lang: string
  /** A whole number; for prices, the amount in the currency's smallest shown unit (cents for 12.99). */
  value: number
  /** Decimal places in `value`: 2 for prices like 12.99, otherwise 0. */
  decimals: number
  /** Currency code for prices, or null when the language has no clear currency. */
  currency: string | null
}

const int = (min: number, max: number, random: () => number) => min + Math.floor(random() * (max - min + 1))

export function makeQuestion(mode: Mode, lang: string, random = Math.random): Question {
  const plain = (value: number): Question => ({ mode, lang, value, decimals: 0, currency: null })
  switch (mode) {
    case 'small':
      return plain(int(0, 100, random))
    case 'hundreds':
      return plain(int(0, 1000, random))
    case 'big': {
      // Even across 4, 5, and 6 digits, and often round, the way real amounts and distances are.
      const digits = int(4, 6, random)
      const value = int(10 ** (digits - 1), 10 ** digits - 1, random)
      if (random() < 0.3) {
        const step = 10 ** (digits - 2)
        return plain(Math.round(value / step) * step)
      }
      return plain(value)
    }
    case 'years': {
      const pick = random()
      return plain(pick < 0.7 ? int(1900, 2035, random) : pick < 0.9 ? int(1500, 1899, random) : int(1000, 1499, random))
    }
    case 'prices':
      return price(lang, random)
  }
}

// Prices in the currency of the language's country, sized like everyday shop prices.

/** Currency and a rough number of units per US dollar, by country. Only the scale matters. */
const CURRENCIES: Record<string, [string, number]> = {
  US: ['USD', 1], GB: ['GBP', 0.8], CA: ['CAD', 1.4], AU: ['AUD', 1.5], NZ: ['NZD', 1.7], IE: ['EUR', 0.9],
  IN: ['INR', 85], ZA: ['ZAR', 18], SG: ['SGD', 1.3], PH: ['PHP', 57], NG: ['NGN', 1500], KE: ['KES', 130],
  HK: ['HKD', 7.8], TW: ['TWD', 32], CN: ['CNY', 7.2], JP: ['JPY', 150], KR: ['KRW', 1400], CH: ['CHF', 0.85],
  MX: ['MXN', 18], AR: ['ARS', 1200], CO: ['COP', 4000], CL: ['CLP', 950], PE: ['PEN', 3.7], BR: ['BRL', 5.5],
  SE: ['SEK', 10.5], NO: ['NOK', 10.8], DK: ['DKK', 6.8], IS: ['ISK', 135], PL: ['PLN', 3.9], CZ: ['CZK', 22],
  HU: ['HUF', 360], RO: ['RON', 4.6], RU: ['RUB', 90], UA: ['UAH', 41], TR: ['TRY', 40], IL: ['ILS', 3.6],
  SA: ['SAR', 3.75], AE: ['AED', 3.67], EG: ['EGP', 50], PK: ['PKR', 280], BD: ['BDT', 120], TH: ['THB', 34],
  VN: ['VND', 25000], ID: ['IDR', 16000], MY: ['MYR', 4.4], KZ: ['KZT', 500], LK: ['LKR', 300], NP: ['NPR', 135],
  RS: ['RSD', 105], GE: ['GEL', 2.7], AM: ['AMD', 390], AZ: ['AZN', 1.7], MA: ['MAD', 10], DZ: ['DZD', 135],
}
for (const country of 'AT BE BG CY DE EE ES FI FR GR HR IT LT LU LV MT NL PT SI SK'.split(' ')) CURRENCIES[country] = ['EUR', 0.9]

export function currencyFor(lang: string): [code: string, perDollar: number] | null {
  try {
    const region = new Intl.Locale(lang).maximize().region
    return (region && CURRENCIES[region]) || null
  } catch {
    return null
  }
}

function price(lang: string, random: () => number): Question {
  const currency = currencyFor(lang)
  const [code, perDollar] = currency ?? ['', 1]
  // Between about 50 cents and 300 dollars, spread evenly on a log scale so small prices are as common as big ones.
  const amount = Math.exp(Math.log(0.5) + random() * (Math.log(300) - Math.log(0.5))) * perDollar
  // Cents only where they're used in everyday prices: not in yen or won, or where a coffee costs dozens of units.
  const cents = perDollar < 20 && (!currency || new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits === 2)
  if (cents && amount < 1000) {
    const endings = amount < 20 ? [99, 49, 95, 50, 0, 29, 75, 89] : amount < 200 ? [99, 0, 50, 95] : [0, 99]
    const value = Math.floor(amount) * 100 + endings[Math.floor(random() * endings.length)]
    return { mode: 'prices', lang, value: Math.max(value, 99), decimals: 2, currency: currency ? code : null }
  }
  // Whole prices: three significant figures below 10,000 and two above, like ¥1,280 or ₫45,000.
  const digits = Math.floor(Math.log10(Math.max(amount, 1))) + 1
  const step = 10 ** Math.max(0, digits - (amount < 10_000 ? 3 : 2))
  return { mode: 'prices', lang, value: Math.max(step, Math.round(amount / step) * step), decimals: 0, currency: currency ? code : null }
}

// What the voice reads and what the learner sees.

/** The language with Western digits, so answers read 0–9 even where another script is usual. */
function locale(lang: string): string {
  try {
    return new Intl.Locale(lang, { numberingSystem: 'latn' }).toString()
  } catch {
    return 'en'
  }
}

/** The text handed to the voice: plain digits, so no voice mistakes grouping for two numbers. */
export function spokenText(q: Question): string {
  if (q.mode !== 'prices') return String(q.value)
  const whole = q.value % 10 ** q.decimals === 0
  return new Intl.NumberFormat(locale(q.lang), {
    ...(q.currency && { style: 'currency', currency: q.currency }),
    useGrouping: false,
    minimumFractionDigits: whole ? 0 : q.decimals,
    maximumFractionDigits: q.decimals,
  }).format(q.value / 10 ** q.decimals)
}

/** The answer as it's written in the language's own style, such as 1 234 or 12,99 €. */
export function shownText(q: Question): string {
  return new Intl.NumberFormat(locale(q.lang), {
    ...(q.mode === 'prices' && q.currency && { style: 'currency', currency: q.currency }),
    useGrouping: q.mode !== 'years',
    minimumFractionDigits: q.decimals,
    maximumFractionDigits: q.decimals,
  }).format(q.value / 10 ** q.decimals)
}

// Reading what was typed.

/** Where 0 sits in each run of decimal digits that NFKC leaves alone: Arabic-Indic, Persian, Devanagari, Bengali, Thai, and so on. */
const ZEROS = [
  0x0660, 0x06f0, 0x07c0, 0x0966, 0x09e6, 0x0a66, 0x0ae6, 0x0b66, 0x0be6, 0x0c66, 0x0ce6, 0x0d66, 0x0de6, 0x0e50, 0x0ed0, 0x0f20, 0x1040,
  0x1090, 0x17e0, 0x1810, 0x1946, 0x19d0, 0x1a80, 0x1a90, 0x1b50, 0x1bb0, 0x1c40, 0x1c50, 0xa620, 0xa8d0, 0xa900, 0xa9d0, 0xa9f0, 0xaa50, 0xabf0,
]

/** Turns digits from any script into 0–9, and full-width and Arabic punctuation into , and . */
function asciiDigits(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/\p{Nd}/gu, (d) => {
      const code = d.codePointAt(0)!
      const zero = ZEROS.find((z) => code >= z && code <= z + 9)
      return zero === undefined ? d : String(code - zero)
    })
    .replace(/٫/g, '.')
    .replace(/٬/g, ',')
}

/**
 * The number in a typed answer, or null if it has no digits. Spaces, currency
 * signs, and grouping marks are ignored. A final "," or "." followed by one or
 * two digits is the decimal mark, so 12,99 and 12.99 both mean twelve point
 * ninety-nine, while 1.234 and 1,234 both mean one thousand two hundred thirty-four.
 */
export function readNumber(typed: string): number | null {
  const text = asciiDigits(typed).replace(/[^\d.,]/g, '')
  if (!/\d/.test(text)) return null
  const decimal = /[.,](\d{1,2})$/.exec(text)
  const whole = (decimal ? text.slice(0, decimal.index) : text).replace(/\D/g, '')
  return Number(whole || '0') + (decimal ? Number(decimal[1]) / 10 ** decimal[1].length : 0)
}

/** The typed answer in the question's units (cents for 12.99), or null if it can't be read. */
export function typedValue(q: Question, typed: string): number | null {
  const number = readNumber(typed)
  return number === null ? null : Math.round(number * 10 ** q.decimals)
}

export function isRight(q: Question, typed: string): boolean {
  return typedValue(q, typed) === q.value
}

/**
 * Splits the shown answer into pieces, marking the digits that differ from
 * what was typed (compared from the last digit backward), so a learner sees
 * that 347 was heard as 357 and not that everything was wrong.
 */
export function markDifferences(q: Question, typed: string): { text: string; wrong: boolean }[] {
  const shown = shownText(q)
  const answer = typedValue(q, typed)
  const target = String(q.value).padStart(q.decimals + 1, '0')
  const heard = answer === null ? '' : String(answer).padStart(q.decimals + 1, '0')
  const pieces: { text: string; wrong: boolean }[] = []
  let fromEnd = [...shown].filter((c) => /\d/.test(c)).length
  for (const char of shown) {
    let wrong = false
    if (/\d/.test(char)) {
      fromEnd--
      wrong = answer !== null && heard[heard.length - 1 - fromEnd] !== target[target.length - 1 - fromEnd]
    }
    const last = pieces[pieces.length - 1]
    if (last && last.wrong === wrong) last.text += char
    else pieces.push({ text: char, wrong })
  }
  return pieces
}

// Voices.

export interface VoiceInfo {
  name: string
  lang: string
  voiceURI: string
  default: boolean
}

export interface Language {
  /** Normalized language tag, such as `fr-FR`. */
  lang: string
  /** English name, such as "French (France)". */
  label: string
  /** Best first. */
  voices: VoiceInfo[]
}

/** The novelty voices that come with Macs and iPhones: fun, but useless for learning numbers. */
const NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox)$/

function rank(voice: VoiceInfo): number {
  if (NOVELTY.test(voice.name)) return 5
  if (/premium|enhanced|natural|neural/i.test(voice.name)) return 0
  if (/google/i.test(voice.name)) return 1
  if (voice.default) return 2
  // Classic single-language voices such as Thomas or Kyoko, before the multi-language set named like "Flo (French (France))".
  return voice.name.includes('(') ? 4 : 3
}

export function normalizeLang(lang: string): string {
  try {
    return Intl.getCanonicalLocales(lang.replace(/_/g, '-'))[0]
  } catch {
    return lang
  }
}

export function groupVoices(voices: VoiceInfo[]): Language[] {
  const names = new Intl.DisplayNames(['en'], { type: 'language', languageDisplay: 'standard' })
  const byLang = new Map<string, VoiceInfo[]>()
  for (const voice of voices) {
    if (!voice.lang) continue
    const lang = normalizeLang(voice.lang)
    byLang.set(lang, [...(byLang.get(lang) ?? []), voice])
  }
  const dialects = new Intl.DisplayNames(['en'], { type: 'language', languageDisplay: 'dialect' })
  const label = (lang: string) => {
    try {
      const name = names.of(lang) ?? lang
      // Some browsers lack names for areas like 001 (world), giving "Arabic (001)"; "Modern Standard Arabic" reads better.
      if (!/\(\d{3}\)/.test(name)) return name
      const dialect = dialects.of(lang)
      return dialect && !/\d{3}/.test(dialect) ? dialect : name.replace(/\s*\(\d{3}\)/, '')
    } catch {
      return lang
    }
  }
  return [...byLang]
    .map(([lang, list]) => ({ lang, label: label(lang), voices: list.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Popular languages to learn, tried in order for a first visit. */
const STARTERS = ['es-ES', 'es-MX', 'es-US', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'pt-BR', 'zh-CN', 'ko-KR']

/** A sensible first language: a popular one that isn't the visitor's own, or else the first available. */
export function defaultLanguage(languages: Language[], ownLanguage: string): string | null {
  const primary = (lang: string) => lang.split('-')[0].toLowerCase()
  const own = primary(ownLanguage)
  const available = new Set(languages.map((l) => l.lang))
  return (
    STARTERS.find((lang) => available.has(lang) && primary(lang) !== own) ??
    languages.find((l) => primary(l.lang) !== own)?.lang ??
    languages[0]?.lang ??
    null
  )
}

/** A voice's name without the language it repeats, so "Flo (French (France))" reads "Flo". */
export function voiceLabel(name: string): string {
  return name.replace(/\s+\([^()]*\([^()]*\)\)$/, '').replace(/\s+-\s+[^-]+\([^()]*\)$/, '') || name
}
