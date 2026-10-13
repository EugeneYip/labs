// A made-up school's enrichment choices, for "Try an example": 96 students, eight activities, three choices each,
// as a form with one question per choice would export them. The names are invented.

const FIRST = ['Aoife', 'Tomasz', 'Kwame', 'Lena', 'Rahul', 'Mei', 'Owen', 'Sara', 'Ifeoma', 'Mateo', 'Hana', 'Callum', 'Zainab', 'Pavel', 'Niamh', 'Yusuf']
const LAST = ['Brennan', 'Nowak', 'Mensah', 'Fischer', 'Iyer', 'Tanaka']

export const EXAMPLE_PLACES: Record<string, number> = { 'Chess club': 12, 'Climbing wall': 10, Coding: 16, Choir: 20, Drama: 14, Football: 20, Gardening: 8, Photography: 10 }

/** The example's responses, as CSV. */
export function exampleCsv(): string {
  const activities = Object.keys(EXAMPLE_PLACES)
  // Some activities are far more popular than others, as they are.
  const weight = [3, 9, 7, 3, 4, 8, 1, 2]
  let seed = 28
  const rand = () => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296)
  const pick = (taken: string[]) => {
    const open = activities.map((a, i) => ({ a, w: taken.includes(a) ? 0 : weight[i] }))
    let r = rand() * open.reduce((n, x) => n + x.w, 0)
    for (const x of open) if ((r -= x.w) < 0) return x.a
    return open.find((x) => x.w > 0)!.a
  }
  const lines = ['Timestamp,Name,First choice,Second choice,Third choice']
  for (let i = 0; i < 96; i++) {
    const name = `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]}`
    const choices: string[] = []
    for (let k = 0; k < 3; k++) choices.push(pick(choices))
    lines.push(`2026-09-${String(1 + (i % 28)).padStart(2, '0')} 08:${String(i % 60).padStart(2, '0')},${name},${choices.join(',')}`)
  }
  return lines.join('\n')
}
