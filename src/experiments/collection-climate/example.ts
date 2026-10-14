// Collection Climate: an example, three summer months from two invented loggers, every 15 minutes: a store room
// that stays steady, and a gallery that warms in the afternoons, swings with its visitors, has a leak's humidity
// spike in July, and loses two days of readings when its logger's battery ran out.

import type { Reading } from './read.ts'

export interface ExamplePlace {
  name: string
  file: string
  readings: Reading[]
}

function series(seed: number, f: (hours: number, noise: () => number) => { temp: number; rh: number } | null): Reading[] {
  let a = seed >>> 0
  const noise = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 - 0.5
  }
  const start = Date.UTC(2026, 5, 1) / 1000
  const end = Date.UTC(2026, 8, 1) / 1000
  const out: Reading[] = []
  for (let t = start; t < end; t += 900) {
    const r = f((t - start) / 3600, noise)
    if (r) out.push({ t, temp: Math.round(r.temp * 10) / 10, rh: Math.round(r.rh * 10) / 10 })
  }
  return out
}

export function exampleData(): ExamplePlace[] {
  const store = series(1, (h, n) => ({
    temp: 17.6 + 0.6 * Math.sin((2 * Math.PI * h) / (24 * 30)) + 0.2 * Math.sin((2 * Math.PI * (h - 14)) / 24) + 0.1 * n(),
    rh: 49 + 2.5 * Math.sin((2 * Math.PI * h) / (24 * 9)) + 0.6 * Math.sin((2 * Math.PI * (h - 4)) / 24) + 0.3 * n(),
  }))
  const leak = Date.UTC(2026, 6, 14, 9) / 1000
  const gone = [Date.UTC(2026, 7, 8) / 1000, Date.UTC(2026, 7, 10, 11) / 1000]
  const start = Date.UTC(2026, 5, 1) / 1000
  const gallery = series(2, (h, n) => {
    const t = start + h * 3600
    if (t >= gone[0] && t < gone[1]) return null
    const day = h % 24
    const open = day >= 10 && day < 17
    let rh = 52 + 7 * Math.sin((2 * Math.PI * h) / (24 * 6)) + (open ? 4 * Math.sin((Math.PI * (day - 10)) / 7) : 0) + 0.6 * n()
    const since = (t - leak) / 3600
    if (since >= 0 && since < 60) rh += 24 * Math.sin((Math.PI * since) / 60)
    const temp = 21 + 2.5 * Math.sin((2 * Math.PI * h) / (24 * 45)) + 1.6 * Math.sin((2 * Math.PI * (day - 9)) / 24) + 0.2 * n()
    return { temp, rh: Math.min(99, rh) }
  })
  return [
    { name: 'Store room', file: 'store-room-summer.csv', readings: store },
    { name: 'Gallery 1', file: 'gallery-1-summer.csv', readings: gallery },
  ]
}
