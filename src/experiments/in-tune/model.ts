/**
 * In Tune's music and pitch math: notes and frequencies, interval exercises
 * that fit a voice, and pitch detection from microphone samples using the
 * YIN method (de Cheveigné and Kawahara, 2002), which is reliable for voices.
 */

export const NOTES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B']

export const midiToHz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)
export const hzToMidi = (hz: number) => 69 + 12 * Math.log2(hz / 440)
/** Middle C is C4. */
export const noteName = (midi: number) => `${NOTES[((Math.round(midi) % 12) + 12) % 12]}${Math.floor(Math.round(midi) / 12) - 1}`
export const centsOff = (hz: number, targetMidi: number) => (hzToMidi(hz) - targetMidi) * 100

export interface Interval {
  semitones: number
  name: string
}

export const INTERVALS: Interval[] = [
  { semitones: 0, name: 'the same note' },
  { semitones: 1, name: 'a minor second' },
  { semitones: 2, name: 'a major second' },
  { semitones: 3, name: 'a minor third' },
  { semitones: 4, name: 'a major third' },
  { semitones: 5, name: 'a perfect fourth' },
  { semitones: 6, name: 'a tritone' },
  { semitones: 7, name: 'a perfect fifth' },
  { semitones: 8, name: 'a minor sixth' },
  { semitones: 9, name: 'a major sixth' },
  { semitones: 10, name: 'a minor seventh' },
  { semitones: 11, name: 'a major seventh' },
  { semitones: 12, name: 'an octave' },
]

export const SHORT = ['Same', 'm2', 'M2', 'm3', 'M3', 'P4', 'Tritone', 'P5', 'm6', 'M6', 'm7', 'M7', 'Octave']

export type Range = 'low' | 'middle' | 'high'
/** Comfortable notes for each kind of voice, as MIDI numbers: G2–D4, C3–G4, G3–D5. */
export const RANGES: Record<Range, { label: string; notes: [number, number] }> = {
  low: { label: 'Low voice', notes: [43, 62] },
  middle: { label: 'Middle voice', notes: [48, 67] },
  high: { label: 'High voice', notes: [55, 74] },
}

export type Direction = 'up' | 'down' | 'both'

export interface Exercise {
  reference: number
  target: number
  semitones: number
  up: boolean
}

/** A reference and target note, both inside the voice's range. */
export function makeExercise(range: Range, intervals: number[], direction: Direction, rand = Math.random): Exercise {
  const [low, high] = RANGES[range].notes
  const choices = intervals.length ? intervals : [0]
  const semitones = choices[Math.floor(rand() * choices.length)]
  const up = semitones === 0 || direction === 'up' ? true : direction === 'down' ? false : rand() < 0.5
  const step = up ? semitones : -semitones
  // The reference can be any note that keeps the target inside the range too.
  const from = Math.max(low, low - step)
  const to = Math.min(high, high - step)
  const reference = from + Math.floor(rand() * (to - from + 1))
  return { reference, target: reference + step, semitones, up }
}

export function prompt(e: Exercise): string {
  if (e.semitones === 0) return 'Sing the same note'
  return `Sing ${INTERVALS[e.semitones].name} ${e.up ? 'up' : 'down'}`
}

/**
 * The pitch of a stretch of samples, or null for silence, noise, or
 * anything without a clear pitch. `clarity` is near 1 for a clean tone.
 */
export function detectPitch(samples: Float32Array, sampleRate: number, minHz = 70, maxHz = 1100, threshold = 0.15): { hz: number; clarity: number } | null {
  let energy = 0
  for (let i = 0; i < samples.length; i++) energy += samples[i] * samples[i]
  if (Math.sqrt(energy / samples.length) < 0.01) return null

  const tauMin = Math.max(2, Math.floor(sampleRate / maxHz))
  const tauMax = Math.min(Math.ceil(sampleRate / minHz), Math.floor(samples.length / 2))
  const width = samples.length - tauMax

  // Difference function, then its cumulative mean normalized form.
  const d = new Float32Array(tauMax + 1)
  for (let tau = 1; tau <= tauMax; tau++) {
    let sum = 0
    for (let i = 0; i < width; i++) {
      const diff = samples[i] - samples[i + tau]
      sum += diff * diff
    }
    d[tau] = sum
  }
  const cmnd = new Float32Array(tauMax + 1)
  cmnd[0] = 1
  let running = 0
  for (let tau = 1; tau <= tauMax; tau++) {
    running += d[tau]
    cmnd[tau] = running ? (d[tau] * tau) / running : 1
  }

  // The first dip under the threshold, followed to its bottom.
  let tau = -1
  for (let t = tauMin; t <= tauMax; t++) {
    if (cmnd[t] < threshold) {
      while (t + 1 <= tauMax && cmnd[t + 1] < cmnd[t]) t++
      tau = t
      break
    }
  }
  if (tau < 0) return null

  // A parabola through the neighbors places the dip between samples.
  const a = cmnd[tau - 1] ?? cmnd[tau]
  const b = cmnd[tau]
  const c = tau + 1 <= tauMax ? cmnd[tau + 1] : b
  const curve = a + c - 2 * b
  const exact = curve > 0 ? tau + (a - c) / (2 * curve) : tau
  return { hz: sampleRate / exact, clarity: Math.max(0, 1 - b) }
}

/** The middle value, which ignores a stray octave jump among recent readings. */
export function median(values: number[]): number {
  const sorted = [...values].sort((x, y) => x - y)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
