/*
 * Labs offline support. Keeps copies of the site's own pages and files once
 * they've been opened, so an experiment you've used before still loads
 * without a connection.
 *
 * - Pages: fresh from the network when online (so updates arrive on the next
 *   visit), the saved copy when offline or when the network is very slow.
 * - Built files in /assets/ have content hashes in their names, so a saved
 *   copy never goes stale; other files are refreshed in the background.
 * - Only this site's own files are kept. Requests to outside services (such
 *   as weather data) pass straight through and are never stored, and nothing
 *   people type is ever part of a request, so no personal data is cached.
 *
 * To switch this off for everyone, replace this file with one that deletes
 * the caches and calls self.registration.unregister() in its activate event.
 */

const VERSION = 1
const PAGES = `labs-pages-${VERSION}`
const FILES = `labs-files-${VERSION}`
/** Old built files pile up across deploys; this keeps the newest ones. */
const MAX_FILES = 150
/** How long to wait for a page on a bad connection before using the saved copy. */
const PATIENCE_MS = 4000

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) if (name.startsWith('labs-') && name !== PAGES && name !== FILES) await caches.delete(name)
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname === '/sw.js') return
  if (request.mode === 'navigate') event.respondWith(page(event))
  else event.respondWith(file(event, url.pathname.startsWith('/assets/')))
})

// A page opened before this worker was running sends its address and files here, so it works offline from the first visit.
self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || data.type !== 'keep') return
  event.waitUntil(
    (async () => {
      if (typeof data.page === 'string') {
        const key = pageKey(new URL(data.page, self.location.origin).href)
        const pages = await caches.open(PAGES)
        if (!(await pages.match(key))) await store(pages, key, fetch(key))
      }
      const files = await caches.open(FILES)
      for (const href of Array.isArray(data.files) ? data.files.slice(0, 60) : []) {
        if (typeof href !== 'string' || new URL(href, self.location.origin).origin !== self.location.origin) continue
        if (!(await files.match(href))) await store(files, href, fetch(href))
      }
      await trim(files)
    })().catch(() => {}),
  )
})

/** One saved copy per page: the query and fragment don't matter, and /x matches /x/. */
function pageKey(href) {
  const url = new URL(href)
  url.search = ''
  url.hash = ''
  if (!url.pathname.endsWith('/') && !url.pathname.split('/').pop().includes('.')) url.pathname += '/'
  return url.href
}

/** Saves a response if it's a complete, successful one from this site, and passes it on. */
async function store(cache, key, pending) {
  const response = await pending
  if (response.ok && response.type === 'basic') await cache.put(key, response.clone())
  return response
}

async function page(event) {
  const pages = await caches.open(PAGES)
  const key = pageKey(event.request.url)
  const network = store(pages, key, fetch(event.request))
  event.waitUntil(network.catch(() => {}))
  const saved = await pages.match(key)
  if (!saved) return network.catch(() => offline())
  return Promise.race([network, new Promise((resolve) => setTimeout(() => resolve(saved), PATIENCE_MS))]).catch(() => saved)
}

async function file(event, hashed) {
  const files = await caches.open(FILES)
  const saved = await files.match(event.request)
  if (saved && hashed) return saved
  const network = store(files, event.request, fetch(event.request)).then(async (response) => {
    await trim(files)
    return response
  })
  if (saved) {
    event.waitUntil(network.catch(() => {}))
    return saved
  }
  return network
}

async function trim(cache) {
  const keys = await cache.keys()
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_FILES))) await cache.delete(key)
}

function offline() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline · Labs</title><link rel="icon" href="data:,">
<style>body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:15vh 1.5rem;background:#fafaf9;color:#1c1917}@media (prefers-color-scheme:dark){body{background:#0c0a09;color:#f5f5f4}}main{max-width:32rem;margin:auto}p{color:#78716c}</style></head>
<body><main><h1>You're offline</h1><p>This page hasn't been opened on this device before, so there's no saved copy. Experiments you've already used still work without a connection.</p></main></body></html>`
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
