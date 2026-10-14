// Deputyship Accounts: the money types of a property and affairs deputy's yearly report to the Office of the Public
// Guardian (England and Wales).
//
// The online report's types and groups are its own, read from the service's public source code on 14 October 2026
// (github.com/ministryofjustice/opg-digideps: `MoneyTransaction::$categories` and `report-money-transaction.en.yml`),
// leaving out the one type only professional deputies see. Gifts and deputy expenses are sections of their own in the
// online report, and so are transfers between the client's accounts. The paper form's rows are those of OPG102
// Property and financial decisions (07.25), pages 7 and 9; each online type is counted in the paper row that names it,
// and in the form's own "not listed above" row when none does.

export type Direction = 'in' | 'out'

export interface Group {
  key: string
  label: string
  dir: Direction
}

export interface MoneyType {
  /** The online report's key for the type. */
  key: string
  label: string
  group: string
  dir: Direction
  /** The online report asks for more detail (a description) with this type. */
  details: boolean
  /** The paper form's row (OPG102 07.25) the type is counted in. */
  paper: string
}

export const GROUPS: readonly Group[] = [
  { key: 'salary-or-wages', label: 'Salary or wages', dir: 'in' },
  { key: 'income-and-earnings', label: 'Income from interest, investments, or property', dir: 'in' },
  { key: 'pensions', label: 'Pension', dir: 'in' },
  { key: 'state-benefits', label: 'State benefit', dir: 'in' },
  { key: 'compensation-or-damages-award', label: 'Compensation or damages award', dir: 'in' },
  { key: 'one-off', label: 'One-off, such as inheritance, sale of asset, or a refund', dir: 'in' },
  { key: 'moneyin-other', label: 'Other', dir: 'in' },
  { key: 'care-and-medical', label: 'Care or medical bill', dir: 'out' },
  { key: 'household-bills', label: 'Household bills and expenses', dir: 'out' },
  { key: 'accommodation', label: 'Accommodation costs, such as mortgage or rent', dir: 'out' },
  { key: 'client-expenses', label: "%client%'s personal expenses", dir: 'out' },
  { key: 'fees', label: 'OPG and other professional fees', dir: 'out' },
  { key: 'major-purchases', label: 'Major purchase, such as property or investment', dir: 'out' },
  { key: 'debt-and-charges', label: 'Tax or charge', dir: 'out' },
  { key: 'moving-money', label: 'Moving money', dir: 'out' },
  { key: 'moneyout-other', label: 'Other', dir: 'out' },
]

const T = (key: string, label: string, group: string, dir: Direction, paper: string, details = false): MoneyType => ({
  key,
  label,
  group,
  dir,
  details,
  paper,
})

export const TYPES: readonly MoneyType[] = [
  T('salary-or-wages', 'Salary or wages', 'salary-or-wages', 'in', 'salary'),
  T('account-interest', 'Interest on savings and other accounts', 'income-and-earnings', 'in', 'interest'),
  T('dividends', 'Dividends', 'income-and-earnings', 'in', 'investment-income'),
  T('income-from-property-rental', 'Income from property rental', 'income-and-earnings', 'in', 'investment-income'),
  T('personal-pension', 'Private pension', 'pensions', 'in', 'personal-pensions'),
  T('state-pension', 'State pension', 'pensions', 'in', 'state-pension'),
  T('attendance-allowance', 'Attendance Allowance', 'state-benefits', 'in', 'aa'),
  T('disability-living-allowance', 'Disability Living Allowance', 'state-benefits', 'in', 'dla-pip'),
  T('employment-support-allowance', 'Employment Support Allowance', 'state-benefits', 'in', 'esa-ib'),
  T('housing-benefit', 'Housing Benefit', 'state-benefits', 'in', 'hb'),
  T('incapacity-benefit', 'Incapacity Benefit', 'state-benefits', 'in', 'esa-ib'),
  T('income-support', 'Income Support', 'state-benefits', 'in', 'is-pc'),
  T('pension-credit', 'Pension Credit', 'state-benefits', 'in', 'is-pc'),
  T('personal-independence-payment', 'Personal Independence Payment', 'state-benefits', 'in', 'dla-pip'),
  T('severe-disablement-allowance', 'Severe Disablement Allowance', 'state-benefits', 'in', 'sda'),
  T('universal-credit', 'Universal Credit', 'state-benefits', 'in', 'uc'),
  T('winter-fuel-cold-weather-payment', 'Winter Fuel/Cold Weather Payment', 'state-benefits', 'in', 'other-benefits'),
  T('other-benefits', 'Other benefits', 'state-benefits', 'in', 'other-benefits', true),
  T('compensation-or-damages-award', 'Compensation or damages award', 'compensation-or-damages-award', 'in', 'compensation', true),
  T('bequest-or-inheritance', 'Bequest or inheritance', 'one-off', 'in', 'bequests'),
  T('cash-gift-received', 'Cash gift received', 'one-off', 'in', 'bequests'),
  T('refunds', 'Refund', 'one-off', 'in', 'refunds'),
  T('sale-of-asset', 'Sale of asset', 'one-off', 'in', 'sales', true),
  T('sale-of-investment', 'Sale of investment', 'one-off', 'in', 'sales', true),
  T('sale-of-property', 'Sale of property', 'one-off', 'in', 'sales', true),
  T('anything-else', 'Anything else', 'moneyin-other', 'in', 'other-in', true),

  T('care-fees', 'Care fees', 'care-and-medical', 'out', 'care-fees'),
  T('local-authority-charges-for-care', 'Local authority charges for care', 'care-and-medical', 'out', 'care-fees'),
  T('medical-expenses', 'Medical expenses', 'care-and-medical', 'out', 'other-out'),
  T('medical-insurance', 'Medical insurance', 'care-and-medical', 'out', 'insurance'),
  T('broadband', 'Broadband', 'household-bills', 'out', 'household'),
  T('council-tax', 'Council tax', 'household-bills', 'out', 'household'),
  T('telephone-and-broadband', 'Combined telephone and broadband', 'household-bills', 'out', 'household'),
  T('dual-fuel', 'Dual fuel (Combined electricity & gas)', 'household-bills', 'out', 'household'),
  T('electricity', 'Electricity', 'household-bills', 'out', 'household'),
  T('food', 'Food', 'household-bills', 'out', 'other-out'),
  T('gas', 'Gas', 'household-bills', 'out', 'household'),
  T('insurance-eg-life-home-contents', 'Insurance (for example, life, home and contents)', 'household-bills', 'out', 'insurance'),
  T('property-maintenance-improvement', 'Property maintenance/improvement', 'household-bills', 'out', 'maintenance', true),
  T('telephone', 'Phone', 'household-bills', 'out', 'household'),
  T('tv-services', 'TV services', 'household-bills', 'out', 'household'),
  T('water', 'Water', 'household-bills', 'out', 'household'),
  T('accommodation-service-charge', 'Accommodation service charge', 'accommodation', 'out', 'accommodation'),
  T('mortgage', 'Mortgage', 'accommodation', 'out', 'accommodation'),
  T('rent', 'Rent', 'accommodation', 'out', 'accommodation'),
  T('client-transport-bus-train-taxi-fares', 'Transport (for example, bus, train, taxi fares)', 'client-expenses', 'out', 'travel'),
  T('clothes', 'Clothes', 'client-expenses', 'out', 'other-out'),
  T('day-trips', 'Day trips', 'client-expenses', 'out', 'holidays'),
  T('holidays', 'Holidays', 'client-expenses', 'out', 'holidays'),
  T('personal-allowance-pocket-money', 'Personal allowance or pocket money', 'client-expenses', 'out', 'allowance'),
  T('toiletries', 'Toiletries', 'client-expenses', 'out', 'other-out'),
  T('deputy-security-bond', 'Deputy security bond', 'fees', 'out', 'bond'),
  T('opg-fees', "OPG's fees", 'fees', 'out', 'opg-fees'),
  T('professional-fees-eg-solicitor-accountant', 'Fees charged by a solicitor, accountant or other professional', 'fees', 'out', 'professional', true),
  T('investment-bonds-purchased', 'Investment bond', 'major-purchases', 'out', 'investments', true),
  T('investment-account-purchased', 'Investment fund account', 'major-purchases', 'out', 'investments', true),
  T('stocks-and-shares-purchased', 'Stocks and shares', 'major-purchases', 'out', 'investments', true),
  T('purchase-over-1000', 'Other purchase over £1,000', 'major-purchases', 'out', 'major', true),
  T('bank-charges', 'Bank charge', 'debt-and-charges', 'out', 'other-out'),
  T('credit-cards-charges', 'Credit card charge', 'debt-and-charges', 'out', 'debt'),
  T('loans', 'Loan repayment', 'debt-and-charges', 'out', 'debt'),
  T('tax-payments-to-hmrc', 'Tax payment to HMRC', 'debt-and-charges', 'out', 'tax'),
  T('unpaid-care-fees', 'Unpaid care fee', 'debt-and-charges', 'out', 'debt'),
  T('cash-withdrawn', "Cash withdrawn from %client%'s account", 'moving-money', 'out', 'cash', true),
  T('transfers-out-to-other-accounts', "Payments from %client%'s account to other accounts", 'moving-money', 'out', 'transfers-out', true),
  T('anything-else-paid-out', 'Anything else paid out', 'moneyout-other', 'out', 'other-out', true),
]

/** The kinds a payment can be sorted into besides the money types: sections of their own in the online report. */
export const GIFT = 'gift'
export const DEPUTY_EXPENSE = 'deputy-expense'
export const TRANSFER = 'transfer'

export interface PaperRow {
  key: string
  label: string
  dir: Direction
  /** Marked on the form: its payments are listed one by one in "More detail". */
  details: boolean
}

/** OPG102 (07.25) section 5, in the form's order: money paid in (page 7), then money paid out (page 9). */
export const PAPER_ROWS: readonly PaperRow[] = [
  { key: 'aa', label: 'Attendance Allowance', dir: 'in', details: false },
  { key: 'dla-pip', label: 'Disability Living Allowance or Personal Independence Payment', dir: 'in', details: false },
  { key: 'esa-ib', label: 'Employment Support Allowance or Incapacity Benefit', dir: 'in', details: false },
  { key: 'hb', label: 'Housing Benefit', dir: 'in', details: false },
  { key: 'is-pc', label: 'Income Support or Pension Credit', dir: 'in', details: false },
  { key: 'sda', label: 'Severe Disablement Allowance', dir: 'in', details: false },
  { key: 'uc', label: 'Universal Credit', dir: 'in', details: false },
  { key: 'interest', label: 'Account interest', dir: 'in', details: false },
  { key: 'bequests', label: 'Bequests, eg, inheritance, gifts received', dir: 'in', details: false },
  { key: 'investment-income', label: 'Income from investments, dividends or property rental', dir: 'in', details: false },
  { key: 'personal-pensions', label: 'Personal pensions (total)', dir: 'in', details: false },
  { key: 'refunds', label: 'Refunds', dir: 'in', details: false },
  { key: 'salary', label: 'Salary or wages (after tax)', dir: 'in', details: false },
  { key: 'state-pension', label: 'State Pension', dir: 'in', details: false },
  { key: 'compensation', label: 'Compensation or damages awards', dir: 'in', details: true },
  { key: 'sales', label: 'Sale of investments, property or assets (total)', dir: 'in', details: true },
  { key: 'transfers-in', label: 'Transfers in from client’s other accounts', dir: 'in', details: true },
  { key: 'other-in', label: 'Other money paid in and not listed above (total)', dir: 'in', details: true },
  { key: 'other-benefits', label: 'Other benefits, eg, Winter Fuel or Cold Weather Payments (total)', dir: 'in', details: false },

  { key: 'accommodation', label: 'Accommodation costs, eg, rent, mortgage, service charges', dir: 'out', details: false },
  { key: 'care-fees', label: 'Care fees or local authority charges for care', dir: 'out', details: false },
  { key: 'debt', label: 'Debt payments, eg, loans, cards, care fee arrears', dir: 'out', details: false },
  { key: 'bond', label: 'Deputy’s security bond', dir: 'out', details: false },
  { key: 'holidays', label: 'Holidays or day trips', dir: 'out', details: false },
  { key: 'household', label: 'Household bills, eg, water, gas, electricity, phone, council tax', dir: 'out', details: false },
  { key: 'insurance', label: 'Insurance, eg, life, home and contents, pet', dir: 'out', details: false },
  { key: 'opg-fees', label: 'Office of the Public Guardian fees', dir: 'out', details: false },
  { key: 'tax', label: 'Tax payable to HMRC, eg, tax on income from letting a property', dir: 'out', details: false },
  { key: 'travel', label: 'Travel costs for client, eg, bus, train, taxi fares', dir: 'out', details: false },
  { key: 'allowance', label: 'Client’s personal allowance', dir: 'out', details: false },
  { key: 'cash', label: 'Cash you have withdrawn', dir: 'out', details: true },
  { key: 'professional', label: 'Professional fees, eg, solicitor or accountant fees', dir: 'out', details: true },
  { key: 'deputy-expenses', label: 'Deputy’s expenses', dir: 'out', details: true },
  { key: 'gifts', label: 'Gifts', dir: 'out', details: true },
  { key: 'transfers-out', label: 'Transfers out to client’s other accounts', dir: 'out', details: true },
  { key: 'major', label: 'Major purchases, eg, property, vehicles', dir: 'out', details: true },
  { key: 'maintenance', label: 'Property maintenance or improvement', dir: 'out', details: true },
  { key: 'investments', label: 'New investments, eg, buying shares, new bonds', dir: 'out', details: true },
  { key: 'other-out', label: 'Other money paid out and not listed above (total)', dir: 'out', details: true },
]

export const TYPE_BY_KEY: ReadonlyMap<string, MoneyType> = new Map(TYPES.map((t) => [t.key, t]))
export const GROUP_BY_KEY: ReadonlyMap<string, Group> = new Map(GROUPS.map((g) => [g.key, g]))
export const PAPER_BY_KEY: ReadonlyMap<string, PaperRow> = new Map(PAPER_ROWS.map((r) => [r.key, r]))

/** A label with the client's name (or "the client") in place of the report's placeholder. */
export function named(label: string, client: string): string {
  const who = client.trim()
  if (!label.includes('%client%')) return label
  if (!who) return label.replace(/^%client%'s/, 'The client’s').replace(/%client%'s/g, 'the client’s')
  return label.replace(/%client%'s/g, `${who}’s`).replace(/%client%/g, who)
}

/**
 * Hints for a payment's type from words its description says plainly (DWP's benefit codes, "COUNCIL TAX", "INTEREST",
 * and the like). Only ever shown as a suggestion for the deputy to accept.
 */
const HINTS: readonly [RegExp, string, Direction][] = [
  [/\bSTATE PENSION\b|\bDWP SP\b/, 'state-pension', 'in'],
  [/\bPENSION CREDIT\b|\bDWP PC\b/, 'pension-credit', 'in'],
  [/\bATTENDANCE ALLOWANCE\b|\bDWP AA\b/, 'attendance-allowance', 'in'],
  [/\bPERSONAL INDEPENDENCE\b|\bDWP PIP\b/, 'personal-independence-payment', 'in'],
  [/\bDISABILITY LIVING\b|\bDWP DLA\b/, 'disability-living-allowance', 'in'],
  [/\bDWP ESA\b|\bEMPLOYMENT SUPPORT\b/, 'employment-support-allowance', 'in'],
  [/\bUNIVERSAL CREDIT\b|\bDWP UC\b/, 'universal-credit', 'in'],
  [/\bHOUSING BENEFIT\b/, 'housing-benefit', 'in'],
  [/\bWINTER FUEL\b|\bCOLD WEATHER\b|\bDWP WFP\b/, 'winter-fuel-cold-weather-payment', 'in'],
  [/\bINTEREST\b|\bGROSS INT\b|\bNET INT\b/, 'account-interest', 'in'],
  [/\bDIVIDEND/, 'dividends', 'in'],
  [/\bREFUND\b/, 'refunds', 'in'],
  [/\bCOUNCIL TAX\b|\bC\.?TAX\b/, 'council-tax', 'out'],
  [/\bWATER\b/, 'water', 'out'],
  [/\bTV LICEN[CS]E\b/, 'tv-services', 'out'],
  [/\bPUBLIC GUARDIAN\b|\bOPG\b/, 'opg-fees', 'out'],
  [/\bHMRC\b/, 'tax-payments-to-hmrc', 'out'],
  [/\bCASH\b|\bATM\b|\bCASHPOINT\b|\bLINK\b/, 'cash-withdrawn', 'out'],
  [/\bINSURANCE\b/, 'insurance-eg-life-home-contents', 'out'],
  [/\bCARE HOME\b|\bNURSING HOME\b|\bCARE FEES?\b/, 'care-fees', 'out'],
  [/\bRENT\b/, 'rent', 'out'],
  [/\bBANK CHARGE|\bACCOUNT FEE\b|\bOVERDRAFT FEE\b/, 'bank-charges', 'out'],
]

/** The type a description plainly names, if one does, for payments in or out. */
export function hintFor(description: string, dir: Direction): string | null {
  const d = description.toUpperCase()
  for (const [re, key, hintDir] of HINTS) if (hintDir === dir && re.test(d)) return key
  return null
}
