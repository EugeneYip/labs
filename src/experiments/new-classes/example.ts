// An invented year group for "Try an example": 60 children in two classes now, with the columns a school's
// spreadsheet usually has. Friendships cluster the way nominations do (mostly within a class and among girls or among
// boys), a few names are written short ("Ava S", "Theo"), one isn't on the list, and three pairs are kept apart.
import { randomFrom } from './model.ts'

const GIRLS = ['Ava', 'Mia', 'Isla', 'Grace', 'Freya', 'Lily', 'Ella', 'Sophie', 'Ruby', 'Evie', 'Amelia', 'Poppy', 'Chloe', 'Zara', 'Maya', 'Aisha', 'Hannah', 'Layla', 'Rosie', 'Daisy', 'Erin', 'Holly', 'Ivy', 'Megan', 'Nina', 'Orla', 'Priya', 'Sara', 'Tilly', 'Yasmin', 'Leah']
const BOYS = ['Leo', 'Noah', 'Oliver', 'Jack', 'Harry', 'George', 'Oscar', 'Charlie', 'Arthur', 'Theo', 'Finley', 'Ethan', 'Max', 'Adam', 'Ali', 'Ben', 'Dylan', 'Felix', 'Isaac', 'Jacob', 'Kai', 'Luca', 'Mason', 'Omar', 'Reuben', 'Samuel', 'Toby', 'Zain', 'Hugo']
const SURNAMES = ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Patel', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke', 'Khan', 'Hughes', 'Edwards', 'Turner', 'Hill', 'Moore', 'Cooper', 'Ward', 'Murphy', 'Ahmed', 'Begum', 'Kowalski', 'Nowak', 'Okafor', 'Mensah', 'Silva', 'Costa']

export function exampleText(): string {
  const rand = randomFrom(2031)
  const band = () => {
    const r = rand()
    return r < 0.25 ? 'WTS' : r < 0.8 ? 'EXS' : 'GDS'
  }
  const kids = [...GIRLS.map((first) => ({ first, gender: 'F' })), ...BOYS.map((first) => ({ first, gender: 'M' }))].map((k, i) => ({
    ...k,
    last: SURNAMES[(i * 7) % SURNAMES.length],
    now: i % 2 === 0 ? '3A' : '3B',
    reading: band(),
    maths: band(),
    sen: rand() < 0.12 ? 'Y' : '',
    eal: rand() < 0.15 ? 'Y' : '',
  }))
  // Register order: by surname, then first name.
  kids.sort((a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first))
  const n = kids.length
  const full = (i: number) => `${kids[i].first} ${kids[i].last}`
  const friends = kids.map((k, i) => {
    if (i === 17 || i === 42) return [] // away on the day
    const out = new Set<number>()
    let guard = 0
    while (out.size < 3 && guard++ < 1000) {
      const j = Math.floor(rand() * n)
      if (j === i || out.has(j)) continue
      const weight = (kids[j].gender === k.gender ? 4 : 1) * (kids[j].now === k.now ? 3 : 1)
      if (rand() * 12 < weight) out.add(j)
    }
    return [...out].map((j) => {
      const r = rand()
      return r < 0.1 ? `${kids[j].first} ${kids[j].last[0]}` : r < 0.15 ? kids[j].first : full(j)
    })
  })
  friends[5][2] = 'Bobby' // not on the list
  const apart = new Map<number, string>([
    [3, full(28)],
    [11, full(50)],
    [36, full(44)],
  ])
  const header = 'Name,Gender,Reading,Maths,SEN,EAL,Current class,Friend 1,Friend 2,Friend 3,Not with'
  const rows = kids.map((k, i) => [full(i), k.gender, k.reading, k.maths, k.sen, k.eal, k.now, friends[i][0] ?? '', friends[i][1] ?? '', friends[i][2] ?? '', apart.get(i) ?? ''].join(','))
  return [header, ...rows].join('\n')
}
