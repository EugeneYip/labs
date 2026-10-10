/**
 * Back Row's optics. Eyesight is a minimum angle of resolution (MAR): 20/20
 * vision resolves details of 1 arcminute, 20/40 of 2. From a distance, that
 * angle covers a stretch of the screen; anything finer blurs away. Letters
 * are just readable at five times the MAR (the Snellen standard) and
 * comfortable at about three times that.
 */

export const ARCMIN = Math.PI / (180 * 60)

export type Eyesight = '20/20' | '20/40' | '20/70'

export const EYESIGHT: Record<Eyesight, { mar: number; label: string; phrase: string }> = {
  '20/20': { mar: 1, label: 'Good (20/20)', phrase: 'good eyesight (20/20)' },
  '20/40': { mar: 2, label: 'Fair (20/40)', phrase: 'fair eyesight (20/40)' },
  '20/70': { mar: 3.5, label: 'Low vision (20/70)', phrase: 'low vision (20/70)' },
}

/** How much bigger than just-readable feels comfortable for reading. */
export const COMFORT = 3

/** The smallest detail the viewer can make out on the screen, in meters. */
export const detail = (distance: number, eyesight: Eyesight) => distance * Math.tan(EYESIGHT[eyesight].mar * ARCMIN)

/** Height of capital letters that can just be read, in meters. */
export const readable = (distance: number, eyesight: Eyesight) => distance * Math.tan(5 * EYESIGHT[eyesight].mar * ARCMIN)

export const comfortable = (distance: number, eyesight: Eyesight) => readable(distance, eyesight) * COMFORT

/**
 * How tall each app's standard 16:9 slide is in points, the unit of its font
 * sizes: PowerPoint's 13.33 × 7.5 in, Google Slides' 10 × 5.625 in, and
 * Keynote's 1920 × 1080. The same text needs a different number in each.
 */
export const SLIDE_POINTS = { powerpoint: 540, google: 405, keynote: 1080 } as const

/**
 * The font size on a 16:9 slide `slideHeight` points tall whose capitals are
 * `capHeight` meters tall on a screen this wide, the slide filling its width.
 * Capitals are about 70% of the font size in common typefaces.
 */
export function slidePoints(capHeight: number, screenWidth: number, slideHeight: number = SLIDE_POINTS.powerpoint): number {
  const screenHeight = (screenWidth * 9) / 16
  return (capHeight / (0.7 * screenHeight)) * slideHeight
}

/**
 * The extra blur to add on top of the blur the observer's own eyes bring.
 * Blurs combine like the sides of a right triangle (their squares add), so
 * the extra is the square root of the difference of squares, not the
 * difference.
 */
export const extraBlur = (wanted: number, already: number) => Math.sqrt(Math.max(0, wanted * wanted - already * already))

/**
 * Blur, as a Gaussian radius in the image's own pixels, that removes the
 * detail this viewer can't resolve. 0.6 of the resolvable size keeps strokes
 * at the limit faintly visible, as they are in an eye test.
 */
export function blurPixels(distance: number, eyesight: Eyesight, screenWidth: number, imageWidth: number): number {
  return 0.6 * detail(distance, eyesight) * (imageWidth / screenWidth)
}

/**
 * The width to draw the image so it looks as big to you, at your distance from
 * this device, as the real screen looks to the viewer: same visual angle.
 */
export const trueWidth = (screenWidth: number, distance: number, yourDistance: number) => (screenWidth * yourDistance) / distance

/** CSS pixels per meter by the CSS standard (96 per inch); real screens vary, which calibration corrects. */
export const CSS_PX_PER_M = 96 / 0.0254

export type Units = 'metric' | 'imperial'

export function defaultUnits(locale: string): Units {
  try {
    const region = new Intl.Locale(locale).maximize().region
    return region && ['US', 'LR', 'MM'].includes(region) ? 'imperial' : 'metric'
  } catch {
    return 'metric'
  }
}

/** A distance in meters as people say it: 12 m or 39 ft. */
export function formatDistance(meters: number, units: Units): string {
  return units === 'metric' ? `${round(meters, meters < 10 ? 1 : 0)} m` : `${Math.round(meters / 0.3048)} ft`
}

/** A letter height in meters: 2.2 cm, or 7/8 in. */
export function formatHeight(meters: number, units: Units): string {
  if (units === 'metric') return meters < 0.01 ? `${round(meters * 1000, 0)} mm` : `${round(meters * 100, meters < 0.1 ? 1 : 0)} cm`
  const inches = meters / 0.0254
  if (inches >= 3) return `${round(inches, 0)} in`
  const eighths = Math.max(1, Math.round(inches * 8))
  const whole = Math.floor(eighths / 8)
  let n = eighths % 8
  let d = 8
  while (n && n % 2 === 0) {
    n /= 2
    d /= 2
  }
  return `${n ? (whole ? `${whole} ${n}/${d}` : `${n}/${d}`) : whole} in`
}

const round = (n: number, places: number) => String(Math.round(n * 10 ** places) / 10 ** places)

/** Sizes typed in either unit system, converted to meters. */
export const toMeters = (value: number, units: Units, small = false) => (units === 'metric' ? value * (small ? 0.01 : 1) : value * (small ? 0.0254 : 0.3048))
export const fromMeters = (meters: number, units: Units, small = false) => (units === 'metric' ? meters / (small ? 0.01 : 1) : meters / (small ? 0.0254 : 0.3048))
