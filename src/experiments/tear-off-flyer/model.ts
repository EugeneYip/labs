/** Tear-Off Flyer's settings: what's on the flyer and how it's laid out on the page. */

export type Paper = 'letter' | 'a4'
export type Look = 'plain' | 'bold'
export type Font = 'sans' | 'serif'
export type PhotoFit = 'cover' | 'contain'

export interface Flyer {
  headline: string
  subhead: string
  details: string
  /** What every tab says, usually a name and a phone number. */
  tab: string
  /** An optional second, smaller line on each tab. */
  tabNote: string
  tabs: number
  paper: Paper
  look: Look
  font: Font
  photoFit: PhotoFit
}

/** Sheet sizes in inches (A4 is 210 × 297 mm) and the margin printers can reliably reach. */
export const PAPERS: Record<Paper, { label: string; width: number; height: number }> = {
  letter: { label: 'US Letter', width: 8.5, height: 11 },
  a4: { label: 'A4', width: 210 / 25.4, height: 297 / 25.4 },
}
export const MARGIN = 0.4

export const LIMITS = { headline: 60, subhead: 120, details: 900, tab: 60, tabNote: 60, minTabs: 6, maxTabs: 12 }

export const BLANK: Flyer = {
  headline: '',
  subhead: '',
  details: '',
  tab: '',
  tabNote: '',
  tabs: 10,
  paper: 'letter',
  look: 'plain',
  font: 'sans',
  photoFit: 'cover',
}

export const EXAMPLE: Omit<Flyer, 'paper'> = {
  headline: 'Lost cat',
  subhead: 'Pumpkin: orange tabby with white paws',
  details: 'Last seen Sunday evening near Elm Street and 3rd Avenue. She’s friendly but shy, and wears a blue collar.\n\nPlease check garages and sheds. Reward for any news!',
  tab: 'Pumpkin · Dana 555-0134',
  tabNote: 'Lost cat',
  tabs: 10,
  look: 'bold',
  font: 'sans',
  photoFit: 'cover',
}

/** Letter in the Americas and the Philippines, where it's the usual paper; A4 elsewhere. */
export function defaultPaper(locale: string): Paper {
  try {
    const region = new Intl.Locale(locale).maximize().region
    return region && ['US', 'CA', 'MX', 'PH', 'CL', 'CO', 'VE', 'CR', 'GT', 'NI', 'PA', 'PR', 'SV', 'DO', 'BZ', 'BO', 'HN'].includes(region) ? 'letter' : 'a4'
  } catch {
    return 'a4'
  }
}

/** Reads saved settings, keeping only what's valid. */
export function sanitize(data: unknown, fallbackPaper: Paper): Flyer {
  const d = data && typeof data === 'object' ? (data as Record<string, unknown>) : {}
  const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
  const pick = <T extends string>(v: unknown, options: readonly T[], fallback: T): T => (options.includes(v as T) ? (v as T) : fallback)
  const tabs = Number.isInteger(d.tabs) ? Math.min(LIMITS.maxTabs, Math.max(LIMITS.minTabs, d.tabs as number)) : BLANK.tabs
  return {
    headline: text(d.headline, LIMITS.headline),
    subhead: text(d.subhead, LIMITS.subhead),
    details: text(d.details, LIMITS.details),
    tab: text(d.tab, LIMITS.tab),
    tabNote: text(d.tabNote, LIMITS.tabNote),
    tabs,
    paper: pick(d.paper, ['letter', 'a4'] as const, fallbackPaper),
    look: pick(d.look, ['plain', 'bold'] as const, BLANK.look),
    font: pick(d.font, ['sans', 'serif'] as const, BLANK.font),
    photoFit: pick(d.photoFit, ['cover', 'contain'] as const, BLANK.photoFit),
  }
}

/**
 * The largest font size, in whole points between min and max, for which
 * `fits` is true, assuming bigger text never fits better. Returns min when
 * nothing fits, so the caller can warn.
 */
export function largestFit(min: number, max: number, fits: (size: number) => boolean): { size: number; fits: boolean } {
  if (!fits(min)) return { size: min, fits: false }
  let lo = min
  let hi = max
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2)
    if (fits(mid)) lo = mid
    else hi = mid - 1
  }
  return { size: lo, fits: true }
}
