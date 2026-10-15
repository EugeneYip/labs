// The daily check of the live site and the outside services it needs (.github/workflows/daily-check.yml). It reads
// public pages and asks Open-Meteo what Frost Dates and Line Dry ask, a handful of requests a day. No keys, and
// nothing about visitors. Prints a line per check and fails if any check does. The last lines repeat each failure
// with its group and error, and every request that needed another try, with whether a later try recovered, so the
// tail of the output alone says what went wrong.
// Run: node --experimental-strip-types .github/scripts/daily-check.ts
import { appendFileSync } from 'node:fs'
import { connect } from 'node:tls'
import { readArchive } from '../../src/experiments/frost-dates/model.ts'
import { HOURLY, readForecast } from '../../src/experiments/line-dry/model.ts'

const HOST = 'labs.eugeneyip.net'
const SITE = `https://${HOST}`
const results: { ok: boolean; group: string; what: string }[] = []
let group = ''
const check = (ok: boolean, what: string) => results.push({ ok, group, what })
/** Requests that failed at least once, with each failed try's reason and whether a later try got an answer. */
const retried: { request: string; tries: string[]; recovered: boolean }[] = []

/** An error as a short reason. Node's fetch says only "fetch failed"; the network's own code is in its cause. */
function describe(error: unknown): string {
  if (!(error instanceof Error)) return String(error)
  if (error.name === 'TimeoutError') return 'no answer within 30 s'
  const cause = error.cause as { code?: unknown; message?: unknown } | undefined
  const detail = [cause?.code, cause?.message].filter((part) => typeof part === 'string' && part).join(': ')
  return detail ? `${error.message} (${detail})` : error.message
}

/** A GET, tried again after a pause when the network fails or the server is busy, so a blip isn't an alarm. */
async function get(url: string, init: RequestInit = {}): Promise<Response> {
  const { host, pathname } = new URL(url)
  const tries: string[] = []
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(30_000), headers: { 'user-agent': 'labs-daily-check (github.com/EugeneYip/labs)' } })
      if (response.status !== 429 && response.status < 500) {
        if (tries.length) retried.push({ request: `${host}${pathname}`, tries, recovered: true })
        return response
      }
      await response.arrayBuffer().catch(() => {})
      tries.push(`HTTP ${response.status}`)
    } catch (error) {
      tries.push(describe(error))
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 15_000 * (attempt + 1)))
  }
  retried.push({ request: `${host}${pathname}`, tries, recovered: false })
  throw new Error(`${host}${pathname} didn't answer after 3 tries (${tries.map((reason, i) => `try ${i + 1}: ${reason}`).join('; ')})`)
}

/** An outside service's JSON. An error answer says so, with its status and the service's reason, rather than reading as no data. */
async function getJson(url: string): Promise<any> {
  const response = await get(url)
  const text = await response.text()
  let body: any = null
  try {
    body = JSON.parse(text)
  } catch {
    // Not JSON: reported below if the status is an error, and read as no data otherwise.
  }
  if (!response.ok) {
    const { host, pathname } = new URL(url)
    const reason = typeof body?.reason === 'string' ? body.reason : text.slice(0, 120)
    throw new Error(`${host}${pathname} answered HTTP ${response.status}${reason ? `: ${reason}` : ''}`)
  }
  return body
}

/** Runs one group of checks; anything it throws is a failed check, not a crash. */
async function step(name: string, run: () => Promise<void>) {
  group = name
  try {
    await run()
  } catch (error) {
    check(false, `${name}: ${describe(error)}`)
  }
}

// Every page in the sitemap answers with its own address and a title.
const assets = new Set<string>()
await step('pages', async () => {
  const sitemap = await (await get(`${SITE}/sitemap.xml`)).text()
  const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  check(pages.length >= 26, `sitemap.xml lists ${pages.length} pages`)
  const wrong: string[] = []
  for (const url of pages) {
    try {
      const response = await get(url)
      const html = await response.text()
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
      if (response.status !== 200 || canonical !== url || !/<title>[^<]+<\/title>/.test(html)) wrong.push(`${new URL(url).pathname} (${response.status})`)
      for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) assets.add(m[1])
    } catch (error) {
      wrong.push(`${new URL(url).pathname} (${describe(error)})`)
    }
  }
  check(!wrong.length, `${pages.length - wrong.length} of ${pages.length} pages answer with their own address${wrong.length ? `; wrong: ${wrong.join(', ')}` : ''}`)
})

// Every script and style file loads: those the pages name, the experiments' own code that the main script loads
// ("./slug-hash.js", beside it in /assets/), and the shared files those load in turn.
await step('files', async () => {
  const queue = [...assets].filter((a) => a.endsWith('.js'))
  const missing: string[] = []
  for (let i = 0; i < queue.length; i++) {
    let code = ''
    try {
      code = await (await get(`${SITE}${queue[i]}`)).text()
    } catch (error) {
      missing.push(`${queue[i]} (${describe(error)})`)
    }
    for (const m of code.matchAll(/["'`](?:\.\/|\/?assets\/)([\w.-]+\.(?:js|css))["'`]/g)) {
      const path = `/assets/${m[1]}`
      if (assets.has(path)) continue
      assets.add(path)
      if (path.endsWith('.js')) queue.push(path)
    }
  }
  for (const path of assets) {
    if (missing.some((m) => m.startsWith(`${path} (`))) continue
    try {
      const response = await get(`${SITE}${path}`)
      await response.arrayBuffer()
      if (response.status !== 200) missing.push(`${path} (${response.status})`)
    } catch (error) {
      missing.push(`${path} (${describe(error)})`)
    }
  }
  check(assets.size > 2 && !missing.length, `${assets.size - missing.length} of ${assets.size} script and style files load${missing.length ? `; missing: ${missing.join(', ')}` : ''}`)
})

await step('other addresses', async () => {
  for (const [path, want] of [['/robots.txt', 200], ['/sw.js', 200], ['/no-such-page/', 404]] as const) {
    try {
      const response = await get(`${SITE}${path}`)
      await response.arrayBuffer()
      check(response.status === want, `${path} answers ${response.status}${response.status === want ? '' : `, not ${want}`}`)
    } catch (error) {
      check(false, `${path}: ${describe(error)}`)
    }
  }
  try {
    const plain = await get(`http://${HOST}/`, { redirect: 'manual' })
    check(plain.status >= 300 && plain.status < 400 && plain.headers.get('location')?.startsWith(SITE) === true, `plain http redirects to https (${plain.status}${plain.headers.get('location') ? ` to ${plain.headers.get('location')}` : ''})`)
  } catch (error) {
    check(false, `plain http: ${describe(error)}`)
  }
})

// GitHub Pages renews the site's certificate; one close to expiring means a renewal failed. One try: a failure here
// is reported as it is, with the connection's error.
await step('certificate', async () => {
  const validTo = await new Promise<string>((resolve, reject) => {
    const socket = connect({ host: HOST, port: 443, servername: HOST }, () => {
      resolve(socket.getPeerCertificate().valid_to)
      socket.end()
    })
    socket.setTimeout(30_000, () => socket.destroy(new Error('the connection timed out')))
    socket.on('error', reject)
  })
  const days = Math.floor((Date.parse(validTo) - Date.now()) / 86_400_000)
  check(days >= 14, `the HTTPS certificate is good for ${days} more days (until ${validTo})`)
})

// Open-Meteo, asked as Frost Dates and Line Dry ask it, and read with their own code. Three groups, so one failing
// request doesn't hide whether the others work.
let latitude = '42.36'
let longitude = '-71.06'
await step('Open-Meteo place search', async () => {
  const search = await getJson(`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: 'Boston', count: '6', language: 'en', format: 'json' })}`)
  const place = search?.results?.[0]
  check(typeof place?.latitude === 'number' && typeof place?.longitude === 'number' && typeof place?.name === 'string', `the place search for Boston finds ${place?.name ?? 'nothing'}`)
  if (typeof place?.latitude === 'number' && typeof place?.longitude === 'number') {
    latitude = place.latitude.toFixed(2)
    longitude = place.longitude.toFixed(2)
  }
})

await step('Open-Meteo forecast', async () => {
  const forecast = await getJson(`https://api.open-meteo.com/v1/forecast?${new URLSearchParams({ latitude, longitude, hourly: HOURLY, daily: 'sunrise,sunset', timezone: 'auto', forecast_days: '7' })}`)
  // Line Dry reads a missing number as 0, so each field it uses must really be there.
  const missing = HOURLY.split(',').filter((field) => !Array.isArray(forecast?.hourly?.[field]) || !forecast.hourly[field].some((v: unknown) => typeof v === 'number'))
  const days = readForecast(forecast)?.days.length ?? 0
  check(!missing.length && days >= 6, `the forecast for Line Dry: ${days} days, ${missing.length ? `missing ${missing.join(', ')}` : 'with every field it uses'}`)
})

await step('Open-Meteo archive', async () => {
  const date = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10)
  const archive = await getJson(`https://archive-api.open-meteo.com/v1/archive?${new URLSearchParams({ latitude, longitude, start_date: date(12), end_date: date(3), daily: 'temperature_2m_min', timezone: 'auto' })}`)
  const lows = readArchive(archive)?.values.filter((v) => v !== null).length ?? 0
  check(lows >= 5, `the archive for Frost Dates: daily lows for ${lows} of the last 10 days`)
})

const failed = results.filter((r) => !r.ok)
const recovered = retried.filter((r) => r.recovered).length
/** A failure with its group in front, once: a group that threw already starts its message with its name. */
const named = (r: (typeof results)[number]) => `[${r.group}] ${r.what.startsWith(`${r.group}: `) ? r.what.slice(r.group.length + 2) : r.what}`
const retryLine = (r: (typeof retried)[number]) => `${r.request}: ${r.recovered ? `recovered on try ${r.tries.length + 1}` : `failed all ${r.tries.length} tries`} (${r.tries.map((reason, i) => `try ${i + 1}: ${reason}`).join('; ')})`
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.what}`)
console.log(`${results.length - failed.length} passed, ${failed.length} failed; ${retried.length ? `${retried.length} request${retried.length === 1 ? '' : 's'} needed another try, ${recovered} recovered` : 'no request needed another try'}`)
for (const r of failed) console.log(`failed ${named(r)}`)
for (const r of retried) console.log(`retried ${retryLine(r)}`)
if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = results.map((r) => `- ${r.ok ? `✅ ${r.what}` : `❌ ${named(r)}`}`)
  const retries = retried.length ? `\n\n### Requests tried again\n\n${retried.map((r) => `- ${r.recovered ? '↻' : '❌'} ${retryLine(r)}`).join('\n')}` : ''
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## ${failed.length ? `${failed.length} failed` : 'All passed'}\n\n${lines.join('\n')}${retries}\n`)
}
process.exitCode = failed.length ? 1 : 0
