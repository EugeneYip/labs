// An invented comp for "Try an example": 30 climbers in three categories, 15 problems getting harder, and 24 cards
// already entered (six still to come), scored by tops and zones.
import { PRESETS, type Comp, type Result } from './model.ts'

const FIRST = ['Ava', 'Leo', 'Mia', 'Noah', 'Isla', 'Theo', 'Zara', 'Kai', 'Ruby', 'Omar', 'Erin', 'Luca', 'Maya', 'Finn', 'Ivy', 'Sami', 'Nina', 'Hugo', 'Priya', 'Jonas', 'Tess', 'Ali', 'Grace', 'Ben', 'Lena', 'Max', 'Ines', 'Rory', 'Yuki', 'Dev']
const LAST = ['Okafor', 'Silva', 'Nowak', 'Hart', 'Brennan', 'Costa', 'Lindqvist', 'Mensah', 'Doyle', 'Haddad', 'Kowalski', 'Reyes', 'Patel', 'Byrne', 'Moreau', 'Tanaka', 'Walsh', 'Fischer', 'Quinn', 'Adeyemi']

export function exampleComp(): Comp {
  let a = 31
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const problems = Array.from({ length: 15 }, (_, i) => ({ name: '', value: (i + 1) * 100 }))
  const climbers = FIRST.map((first, i) => {
    const category = i < 14 ? 0 : i < 23 ? 1 : 2
    const ability = 0.25 + rand() * 0.6
    const card: (Result | null)[] = problems.map((_, p) => {
      const hard = (p + 1) / problems.length
      if (rand() > 0.9) return null // not tried
      let zone: number | null = null
      for (let attempt = 1; attempt <= 6; attempt++) {
        if (zone === null && rand() < ability + 0.35 - hard * 0.7) zone = attempt
        if (zone !== null && rand() < ability - hard * 0.65) return { zone, top: attempt }
      }
      return zone === null ? null : { zone, top: null }
    })
    return { name: `${first} ${LAST[(i * 7) % LAST.length]}`, bib: String(101 + i), category, card: i % 5 === 4 ? null : card }
  })
  return { name: 'Example boulder comp', rule: PRESETS.topsZones, problems, categories: ['Open', 'Youth', 'Masters'], climbers, maxAttempts: 0 }
}
