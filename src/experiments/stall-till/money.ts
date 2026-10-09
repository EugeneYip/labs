/**
 * Stall Till's money: amounts are whole minor units (cents, pence; yen have
 * none), so totals and change are exact. Each currency has the notes and
 * coins people actually handle, for counting the cash box.
 */

export interface Currency {
  code: string
  /** Notes and coins in minor units, largest first. */
  pieces: number[]
}

// Notes and coins in common use. Currencies not listed still work; cash-up then takes a single counted total.
const PIECES: Record<string, number[]> = {
  USD: [10000, 5000, 2000, 1000, 500, 100, 25, 10, 5, 1],
  EUR: [20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  GBP: [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  CAD: [10000, 5000, 2000, 1000, 500, 200, 100, 25, 10, 5],
  AUD: [10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5],
  NZD: [10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10],
  JPY: [10000, 5000, 1000, 500, 100, 50, 10, 5, 1],
  INR: [50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100],
  CHF: [100000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5],
  SEK: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100],
  NOK: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 100],
  DKK: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50],
  PLN: [50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
  MXN: [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50],
  BRL: [20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 25, 10, 5],
  ZAR: [20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10],
  SGD: [10000, 5000, 1000, 500, 200, 100, 50, 20, 10, 5],
  HKD: [100000, 50000, 10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10],
}

export const CURRENCIES = Object.keys(PIECES)

export const currency = (code: string): Currency => ({ code, pieces: PIECES[code] ?? [] })

/** How many decimal places a currency uses: 2 for dollars, 0 for yen. */
export function decimals(code: string): number {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency: code }).resolvedOptions().maximumFractionDigits ?? 2
  } catch {
    return 2
  }
}

/** The local currency for a locale, when it's one of the listed ones. */
export function localCurrency(locale: string): string {
  const byRegion: Record<string, string> = { US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD', JP: 'JPY', IN: 'INR', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', MX: 'MXN', BR: 'BRL', ZA: 'ZAR', SG: 'SGD', HK: 'HKD' }
  const euro = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK', 'BG']
  try {
    const region = new Intl.Locale(locale).maximize().region ?? ''
    return byRegion[region] ?? (euro.includes(region) ? 'EUR' : 'USD')
  } catch {
    return 'USD'
  }
}

/** Formats minor units as money in the device's style: $12.50, 12,50 €, ¥1,200. */
export function money(minor: number, code: string, locale?: string): string {
  const d = decimals(code)
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code, minimumFractionDigits: minor % 10 ** d === 0 && d > 0 ? 0 : d, maximumFractionDigits: d }).format(minor / 10 ** d)
  } catch {
    return (minor / 10 ** d).toFixed(d)
  }
}

/** The same, always with the decimals, for totals and change. */
export function moneyExact(minor: number, code: string, locale?: string): string {
  const d = decimals(code)
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code, minimumFractionDigits: d, maximumFractionDigits: d }).format(minor / 10 ** d)
  } catch {
    return (minor / 10 ** d).toFixed(d)
  }
}

/** Reads a typed price: "3", "3.50", "3,50", "€3.50", "1,234.50". Null when it isn't a price. */
export function parseMoney(text: string, code: string): number | null {
  const d = decimals(code)
  let t = text.replace(/[^\d.,-]/g, '')
  if (!t || /-/.test(t.slice(1))) return null
  // The last separator followed by one or two digits is the decimal mark; others group thousands.
  const m = /^(.*?)[.,](\d{1,2})$/.exec(t)
  if (m && d > 0) t = `${m[1].replace(/[.,]/g, '')}.${m[2]}`
  else t = t.replace(/[.,]/g, '')
  const v = Number(t)
  if (!Number.isFinite(v) || v < 0 || v > 1e7) return null
  return Math.round(v * 10 ** d)
}

/**
 * Amounts a customer is likely to hand over for a total: the exact amount,
 * then the next round amounts made of one note or a few, up to the largest note.
 */
export function quickTenders(total: number, code: string): number[] {
  // Only amounts people round up to: whole units and notes, not small coins (so no $4.80 for $4.75).
  const unit = Math.max(10 ** decimals(code), 100)
  const pieces = currency(code).pieces.filter((p) => p >= unit)
  const notes = pieces.length ? pieces : [1, 5, 10, 20, 50, 100].map((n) => n * unit)
  const out = new Set<number>()
  for (const n of [...notes].reverse()) {
    const next = Math.ceil(total / n) * n
    if (next > total) out.add(next)
  }
  return [...out].sort((a, b) => a - b).slice(0, 4)
}

/**
 * Which counted pieces to leave in the box as the float: exactly `target` if
 * possible, otherwise as close below it as possible. It keeps as many pieces
 * as it can, so coins and small notes stay for making change and large notes
 * go to the bank.
 */
export function floatToKeep(counts: Record<number, number>, target: number): { keep: Record<number, number>; total: number } {
  const pieces = Object.keys(counts).map(Number).filter((p) => counts[p] > 0).sort((a, b) => a - b)
  const cap = Math.max(0, target)
  // best[s] = most pieces that sum to exactly s; choice[s] remembers how.
  const best = new Int32Array(cap + 1).fill(-1)
  best[0] = 0
  const layers: Int32Array[] = []
  for (const p of pieces) {
    const before = Int32Array.from(best)
    layers.push(before)
    for (let s = cap; s >= 0; s--) {
      let bestHere = best[s]
      for (let n = 1; n <= counts[p] && n * p <= s; n++) {
        const prev = before[s - n * p]
        if (prev >= 0 && prev + n > bestHere) bestHere = prev + n
      }
      best[s] = bestHere
    }
  }
  let total = cap
  while (total > 0 && best[total] < 0) total--
  // Walk back through the pieces, largest last, to find the counts used.
  const keep: Record<number, number> = {}
  let s = total
  for (let i = pieces.length - 1; i >= 0 && s > 0; i--) {
    const p = pieces[i]
    const before = layers[i]
    const want = i === pieces.length - 1 ? best[s] : bestAfter(i, s)
    for (let n = 0; n <= counts[p] && n * p <= s; n++) {
      if (before[s - n * p] >= 0 && before[s - n * p] + n === want) {
        if (n) keep[p] = n
        s -= n * p
        break
      }
    }
  }
  return { keep, total }

  // The best count for sum `s` using pieces[0..i].
  function bestAfter(i: number, s: number): number {
    return i + 1 < layers.length ? layers[i + 1][s] : best[s]
  }
}
