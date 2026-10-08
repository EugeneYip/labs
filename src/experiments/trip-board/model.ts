/**
 * Trip Board's data: what a board and an item are, the versioned file format
 * used both for browser storage and for exported files, and helpers for links.
 * Plain functions only, with no React and no storage access.
 */

export const CATEGORIES = ['flight', 'stay', 'transport', 'activity', 'food', 'research', 'other'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABELS: Record<Category, string> = {
  flight: 'Flight',
  stay: 'Stay',
  transport: 'Transport',
  activity: 'Activity',
  food: 'Food',
  research: 'Research',
  other: 'Other',
}

/** In the order a decision usually moves. */
export const STATUSES = ['researching', 'considering', 'decided', 'booked', 'skip'] as const
export type Status = (typeof STATUSES)[number]

export const STATUS_LABELS: Record<Status, string> = {
  researching: 'Researching',
  considering: 'Considering',
  decided: 'Decided',
  booked: 'Booked',
  skip: 'Skip',
}

/** Each status's color, as Tailwind classes for light and dark mode. */
export const STATUS_TONES: Record<Status, string> = {
  researching: 'bg-ink/5 text-ink/70',
  considering: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  decided: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
  booked: 'bg-green-500/15 text-green-800 dark:text-green-300',
  skip: 'text-dim ring-1 ring-rule ring-inset',
}

export interface Item {
  id: string
  title: string
  /** A web address, or '' for none. */
  url: string
  category: Category
  status: Status
  /** Free text, or ''. */
  note: string
  /** ISO 8601 times. */
  createdAt: string
  updatedAt: string
}

export interface Board {
  name: string
  items: Item[]
}

export const EMPTY_BOARD: Board = { name: '', items: [] }

/** Upper limits, so one board can't fill the browser's storage. */
export const LIMITS = { name: 200, title: 300, url: 2048, note: 10_000, items: 5_000 }

export function createItem(fields: Pick<Item, 'title' | 'url' | 'category'>, now = new Date()): Item {
  const time = now.toISOString()
  return { id: newId(), ...fields, status: 'researching', note: '', createdAt: time, updatedAt: time }
}

function newId(): string {
  // randomUUID exists on secure (https) pages, which Labs always is; the fallback covers local testing.
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const SETTLED: Record<Status, number> = { booked: 0, decided: 1, considering: 2, researching: 3, skip: 4 }

/** Sort order within a category: booked, decided, considering, researching, then skipped; newest first within each. */
export function bySettledThenNewest(a: Item, b: Item): number {
  return SETTLED[a.status] - SETTLED[b.status] || b.createdAt.localeCompare(a.createdAt)
}

/** Lowercase, without accents or full-width forms, so "cafe" finds "Café" and "ｔｏｋｙｏ" finds "Tokyo". */
function fold(text: string): string {
  return text.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** True when every word of the search appears in the item's title, note, or link. */
export function matchesSearch(item: Item, search: string): boolean {
  const text = fold(`${item.title} ${item.note} ${item.url}`)
  return fold(search).split(/\s+/).every((word) => text.includes(word))
}

// Links

/** True for an absolute http(s) address on a dotted host name, such as https://booking.com/… */
export function isWebUrl(text: string): boolean {
  try {
    const url = new URL(text)
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.includes('.') && !url.username && !url.password
  } catch {
    return false
  }
}

/** Turns a typed link into a web address, adding https:// when it's missing. Null if it isn't one. */
export function normalizeUrl(input: string): string | null {
  const text = input.trim()
  if (text.length > LIMITS.url || /\s/.test(text)) return null
  const url = /^https?:\/\//i.test(text) ? text : `https://${text}`
  return isWebUrl(url) ? url : null
}

/** A short, recognizable name for where a link goes: "booking.com", "Google Maps". */
export function linkLabel(href: string): string {
  const { hostname, pathname } = new URL(href)
  const host = hostname.replace(/^www\./, '')
  const google = host === 'goo.gl' || /^google\.[a-z.]+$/.test(host)
  if (host === 'maps.app.goo.gl' || host.startsWith('maps.google.') || (google && pathname.startsWith('/maps'))) return 'Google Maps'
  if (google && pathname.startsWith('/travel/flights')) return 'Google Flights'
  if (google && pathname.startsWith('/travel/hotels')) return 'Google Hotels'
  if (host === 'maps.apple.com') return 'Apple Maps'
  return host
}

const TRACKING_PARAM = /^(utm_|fbclid$|gclid$|igshid$|mc_eid$)/

/** Links with the same key lead to the same page, ignoring www, trailing slashes, #anchors, and tracking tags. */
export function linkKey(href: string): string {
  const url = new URL(href)
  for (const name of [...url.searchParams.keys()]) {
    if (TRACKING_PARAM.test(name)) url.searchParams.delete(name)
  }
  return url.hostname.replace(/^www\./, '') + url.pathname.replace(/\/+$/, '') + url.search
}

/** Well-known travel sites and the category they almost always mean, matched against "host/path". */
const CATEGORY_HINTS: [Category, RegExp][] = [
  ['flight', /^(google\.[a-z.]+\/travel\/flights|kayak\.[a-z.]+\/flights|(skyscanner|momondo)\.[a-z.]+\/|flights\.booking\.com\/|(united|delta|aa|southwest|jetblue|alaskaair|aircanada|britishairways|virginatlantic|lufthansa|airfrance|klm|emirates|qatarairways|turkishairlines|singaporeair|cathaypacific|jal|ana|koreanair|evaair|qantas|ryanair|easyjet)\.(com|co\.[a-z]{2}|[a-z]{2})\/)/],
  ['stay', /^(booking\.com\/hotel|airbnb\.[a-z.]+\/rooms|(hotels|agoda|vrbo|hostelworld|marriott|hilton|hyatt|ihg)\.com\/|all\.accor\.com\/|jalan\.net\/|travel\.rakuten\.|kayak\.[a-z.]+\/hotels|tripadvisor\.[a-z.]+\/hotel_review)/],
  ['food', /^((tabelog|resy|exploretock|tablecheck)\.com\/|(opentable|thefork|yelp)\.[a-z.]+\/|guide\.michelin\.com\/|omakase\.in\/|tripadvisor\.[a-z.]+\/restaurant_review)/],
  ['activity', /^((getyourguide|eventbrite|ticketmaster)\.[a-z.]+\/|(viator|klook|tiqets|headout)\.com\/|airbnb\.[a-z.]+\/experiences|tripadvisor\.[a-z.]+\/attraction)/],
  ['transport', /^((rome2rio|seat61|amtrak|jrpass|eurail|rentalcars|uber|citymapper)\.com\/|japanrailpass\.net\/|((the)?trainline|omio|flixbus)\.[a-z.]+\/|12go\.asia\/|kayak\.[a-z.]+\/cars)/],
  ['research', /^(([a-z]+\.)*(reddit\.com|wikipedia\.org|wikivoyage\.org)\/|youtube\.com\/|youtu\.be\/|(lonelyplanet|japan-guide|timeout|cntraveler)\.com\/|tripadvisor\.[a-z.]+\/showtopic)/],
]

/** The likely category for a link from a well-known site, or null when it's anyone's guess. */
export function guessCategory(href: string): Category | null {
  const { hostname, pathname } = new URL(href)
  const target = `${hostname.replace(/^(www|m)\./, '')}${pathname}`.toLowerCase()
  return CATEGORY_HINTS.find(([, pattern]) => pattern.test(target))?.[0] ?? null
}

/** A readable title from a link's address alone, without fetching the page. Falls back to the site's name. */
export function titleFromUrl(href: string): string {
  for (const segment of new URL(href).pathname.split('/').reverse()) {
    const title = wordsIn(segment)
    if (title) return title
  }
  return linkLabel(href)
}

function wordsIn(segment: string): string | null {
  let text = segment
  try {
    text = decodeURIComponent(segment)
  } catch {
    // Not valid percent-encoding: use it as is.
  }
  const words = text
    .replace(/^.*-Reviews-([^-]+).*$/, '$1') // Tripadvisor: …-Reviews-Place_Name-City.html
    .replace(/(\.[a-z]{2}(-[a-z]{2,4})?)?\.(html?|php|aspx?)$/i, '')
    .split(/[\s_+-]+/)
    .filter((word) => word !== '' && !/\d/.test(word)) // Words with digits are usually ids.
  // Several words, like "best-ramen-in-shinjuku", or one non-Latin name, like 新宿御苑.
  if (words.length < 2 && !(words.length === 1 && /[^\u0000-ɏ]/.test(words[0]))) return null
  const title = words.join(' ')
  return title.charAt(0).toUpperCase() + title.slice(1)
}

export interface PastedLink {
  url: string
  /** Other words on the same line, such as a page title, or ''. */
  label: string
}

/**
 * Finds the web addresses in pasted text. `heading` is the first line with no
 * address in it, which share sheets often fill with a place's name.
 */
export function readPaste(text: string): { links: PastedLink[]; heading: string } {
  const links: PastedLink[] = []
  let heading = ''
  for (const line of text.split(/\r?\n/)) {
    const found = line.match(/https?:\/\/[^\s<>"']+/gi) ?? []
    for (const raw of found) {
      const url = trimTrailing(raw)
      if (isWebUrl(url)) links.push({ url, label: found.length === 1 ? cleanLabel(line.replace(raw, ' ')) : '' })
    }
    if (found.length === 0 && !heading) heading = cleanLabel(line)
  }
  return { links, heading }
}

/** Drops punctuation that ends the sentence rather than the address, and unmatched closing brackets. */
function trimTrailing(url: string): string {
  let result = url.replace(/[.,;:!?]+$/, '')
  while (result.endsWith(')') && result.split('(').length < result.split(')').length) {
    result = result.slice(0, -1).replace(/[.,;:!?]+$/, '')
  }
  return result
}

function cleanLabel(text: string): string {
  const label = text.replace(/\s+/g, ' ').replace(/^[\s|•·:–—-]+|[\s|•·:–—-]+$/g, '')
  return label.length <= 150 ? label : ''
}

// Files

export const FILE_FORMAT = 'labs.trip-board'
export const FILE_VERSION = 1

/**
 * A board as versioned JSON, the same format for browser storage and exported
 * files. Only exports carry `exportedAt`, so saving an unchanged board always
 * produces identical text.
 */
export function boardToJson(board: Board, exportedAt?: Date): string {
  const file = {
    format: FILE_FORMAT,
    version: FILE_VERSION,
    ...(exportedAt && { exportedAt: exportedAt.toISOString() }),
    board,
  }
  return JSON.stringify(file, null, 2)
}

export type ParsedBoard = { board: Board; error?: undefined } | { board?: undefined; error: string }

/** Reads and checks board JSON. Never throws, and never returns a partly read board. */
export function parseBoardJson(text: string): ParsedBoard {
  let file: unknown
  try {
    file = JSON.parse(text)
  } catch {
    return { error: "This isn't a Trip Board file: it can't be read as JSON." }
  }
  if (!isRecord(file) || file.format !== FILE_FORMAT) return { error: "This isn't a Trip Board file." }
  if (file.version !== FILE_VERSION) {
    const newer = typeof file.version === 'number' && file.version > FILE_VERSION
    return { error: newer ? 'This file comes from a newer version of Trip Board.' : "This file's version isn't supported." }
  }
  const board = file.board
  if (!isRecord(board) || typeof board.name !== 'string' || board.name.length > LIMITS.name || !Array.isArray(board.items)) {
    return { error: 'The board in this file is incomplete or damaged.' }
  }
  if (board.items.length > LIMITS.items) return { error: `This board has more than ${LIMITS.items} items.` }

  const ids = new Set<string>()
  const items: Item[] = []
  for (const [index, value] of board.items.entries()) {
    const item = readItem(value, ids)
    if (typeof item === 'string') return { error: `Item ${index + 1} in this file ${item}` }
    items.push(item)
  }
  return { board: { name: board.name, items } }
}

/** One item from a file, or what's wrong with it. Only known fields are kept. */
function readItem(value: unknown, ids: Set<string>): Item | string {
  if (!isRecord(value)) return "can't be read."
  const { id, title, url = '', category, status, note = '' } = value
  if (typeof id !== 'string' || id === '' || id.length > 100 || ids.has(id)) return 'is missing a unique id.'
  if (typeof title !== 'string' || title.trim() === '' || title.length > LIMITS.title) return 'has a missing or overlong title.'
  if (typeof url !== 'string' || (url !== '' && (url.length > LIMITS.url || !isWebUrl(url)))) return "has a link that isn't a web address."
  if (!isOneOf(CATEGORIES, category)) return 'has an unknown category.'
  if (!isOneOf(STATUSES, status)) return 'has an unknown status.'
  if (typeof note !== 'string' || note.length > LIMITS.note) return 'has a note that is too long.'
  const createdAt = readTime(value.createdAt)
  const updatedAt = readTime(value.updatedAt)
  if (!createdAt || !updatedAt) return 'has a missing or invalid date.'
  ids.add(id)
  return { id, title, url, category, status, note, createdAt, updatedAt }
}

function readTime(value: unknown): string | null {
  const time = typeof value === 'string' ? Date.parse(value) : NaN
  return Number.isNaN(time) ? null : new Date(time).toISOString()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOneOf<T extends string>(options: readonly T[], value: unknown): value is T {
  return (options as readonly unknown[]).includes(value)
}

/** A file name such as trip-board-tokyo-dec-9-14-2026-10-08.json, in the board's own script. */
export function exportFileName(board: Board, now = new Date()): string {
  const name = board.name
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  const day = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, '0')).join('-')
  return `trip-board-${name ? `${name}-` : ''}${day}.json`
}
