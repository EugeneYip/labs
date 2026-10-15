// An example to try: a café worker on a zero-hours contract, paid £12.71 an hour, booking a week's leave. Sixty
// weeks back: mostly worked, with weeks of no shifts, a week off sick, and two weeks of
// paid holiday, so the page shows weeks skipped and an earlier week brought in for each. Made up, not anyone's pay.
// The leave starts on the most recent Monday (today, on a Monday), so every week in the example has been paid.
import { emptyWorking, isoOf, periodEndOf, weekdayOf, weekEndsFrom, type Happened, type Working } from './model.ts'

const RATE = 1271 // pence an hour

export function exampleWorking(today: Date): Working {
  const local = Math.round(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86_400_000)
  const monday = local - ((weekdayOf(local) + 6) % 7)
  const w: Working = { ...emptyWorking(), worker: 'Example: café worker', leave: isoOf(monday), method: 'none', inHours: true }
  const ends = weekEndsFrom(periodEndOf(w.leave, 6)!)
  let seed = 7
  const next = () => {
    seed = (seed * 48271) % 2147483647
    return seed / 2147483647
  }
  for (let i = 0; i < 60; i++) {
    let happened: Happened = 'worked'
    if (i === 6 || i === 23 || i === 41) happened = 'nowork'
    else if (i === 15) happened = 'sick'
    else if (i === 9 || i === 33) happened = 'holiday'
    const hours = 8 + Math.round(next() * 22 * 4) / 4
    const pay = happened === 'worked' ? ((hours * RATE) / 100).toFixed(2) : happened === 'holiday' ? '265.40' : ''
    w.weeks[ends[i]] = { happened, pay, hours: happened === 'worked' ? String(hours) : '' }
  }
  return w
}
