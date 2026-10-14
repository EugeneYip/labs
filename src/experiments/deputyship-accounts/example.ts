// Deputyship Accounts: an example report, a year of a care-home resident's current account for a deputy to try the
// page on. Invented people and amounts. The current account comes as two downloads in the Lloyds layout that
// overlap by a week (the overlap is removed), and one payment (a hairdresser's £45.00 on 2 January) is in neither,
// so the running balance shows where the account stops adding up until it's typed in from the paper statement.
// The savings account has balances only: its one movement is the transfer from the current account.

import { readText, type RawRow } from './read.ts'
import { addSource, defaultEnd, type Report } from './model.ts'

const START = '2025-06-10'

interface Line {
  date: string
  description: string
  amount: number
}

function day(start: string, n: number): string {
  const [y, m, d] = start.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** The year's payments, oldest first: what the bank's records hold. */
function ledger(): Line[] {
  const lines: Line[] = []
  const end = defaultEnd(START)
  // Every four weeks: State Pension and Attendance Allowance.
  for (let d = day(START, 3); d <= end; d = day(d, 28)) {
    lines.push({ date: d, description: 'DWP SP NI QQ123456C', amount: 92180 })
    lines.push({ date: d, description: 'DWP AA NI QQ123456C', amount: 44320 })
  }
  // Monthly: the care home's fees, the personal allowance paid to the home, a private pension.
  for (let k = 0; k < 12; k++) {
    const [y, m] = START.split('-').map(Number)
    const first = new Date(Date.UTC(y, m - 1 + k + 1, 1)).toISOString().slice(0, 10)
    if (first > end) break
    lines.push({ date: first, description: 'ROSEWOOD CARE LTD FEES', amount: -125000 })
    lines.push({ date: day(first, 1), description: 'ROSEWOOD CARE RESIDENTS FUND', amount: -6000 })
    lines.push({ date: day(first, 14), description: 'AVIVA PENSION PAYMENT', amount: 21877 })
  }
  lines.push({ date: '2025-06-20', description: 'OFFICE OF THE PUBLIC GUARDIAN', amount: -32000 })
  lines.push({ date: '2025-07-02', description: 'HOWDEN INSURANCE BOND', amount: -15000 })
  lines.push({ date: '2025-08-15', description: 'TFR TO 99887766 SAVINGS', amount: -200000 })
  lines.push({ date: '2025-09-03', description: 'BOOTS UK LTD', amount: -1849 })
  lines.push({ date: '2025-10-11', description: 'AMAZON MARKETPLACE REFUND', amount: 2399 })
  lines.push({ date: '2025-11-06', description: 'CASH LLOYDS BANK HIGH ST', amount: -4000 })
  lines.push({ date: '2025-11-06', description: 'CASH LLOYDS BANK HIGH ST', amount: -4000 })
  lines.push({ date: '2025-12-12', description: 'FPO TO J SMITH BIRTHDAY', amount: -5000 })
  lines.push({ date: '2026-01-02', description: 'SALON 21 HAIR', amount: -4500 })
  lines.push({ date: '2026-02-17', description: 'FPO TO A DEPUTY MILEAGE', amount: -4860 })
  lines.push({ date: '2026-03-31', description: 'INTEREST (GROSS)', amount: 112 })
  lines.push({ date: '2026-05-08', description: 'M&S FOOD HALL', amount: -2675 })
  return lines.filter((l) => l.date <= end).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

const OPENING = 412350

/** Pennies as the bank writes them: debits and credits without a sign, a balance with one if it's overdrawn. */
function money(p: number, signed = false): string {
  const a = Math.abs(p)
  return `${signed && p < 0 ? '-' : ''}${Math.floor(a / 100)}.${String(a % 100).padStart(2, '0')}`
}

function dmy(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** A download in the Lloyds layout, newest first, of the payments from one day to another. */
function download(lines: (Line & { balance: number })[], from: string, to: string): string {
  const head = 'Transaction Date,Transaction Type,Sort Code,Account Number,Transaction Description,Debit Amount,Credit Amount,Balance,'
  const rows = lines
    .filter((l) => l.date >= from && l.date <= to)
    .reverse()
    .map((l) => `${dmy(l.date)},${l.amount < 0 ? 'DEB' : 'BGC'},'30-99-50,12345678,${l.description},${l.amount < 0 ? money(l.amount) : ''},${l.amount > 0 ? money(l.amount) : ''},${money(l.balance, true)},`)
  return [head, ...rows].join('\r\n') + '\r\n'
}

export function exampleReport(): Report {
  const lines = ledger()
  let balance = OPENING
  const withBalance = lines.map((l) => {
    balance += l.amount
    return { ...l, balance }
  })
  const end = defaultEnd(START)
  const missing = withBalance.find((l) => l.description === 'SALON 21 HAIR')!
  // The two downloads: June to 1 January, then 25 December (a week's overlap) to the end, without the 2 January
  // payment, which the bank's export left out (one of the cases the running balance shows).
  const first = readText(download(withBalance, START, '2026-01-01')).rows
  const second = readText(download(withBalance, '2025-12-25', end)).rows.filter((r: RawRow) => !(r.date === missing.date && r.amount === missing.amount))
  let report: Report = {
    client: 'Mum',
    start: START,
    end,
    accounts: [
      { id: 'acur', name: 'Current account', last4: '5678', main: true, opening: OPENING, closing: balance },
      { id: 'asav', name: 'Savings account', last4: '7766', main: false, opening: 1500000, closing: 1700000 },
    ],
    sources: [],
    sorted: {},
    rules: [],
  }
  report = addSource(report, 'acur', 'statement-jun-dec.csv', first).report
  report = addSource(report, 'acur', 'statement-dec-jun.csv', second).report
  // Two payees already sorted by rules, as a deputy might have done for the first months.
  report = {
    ...report,
    rules: [
      { id: 'rx1', text: 'DWP SP', dir: 'in', c: 'state-pension' },
      { id: 'rx2', text: 'ROSEWOOD CARE LTD FEES', dir: 'out', c: 'care-fees' },
    ],
  }
  return report
}
