// Keeping the open drawing in this browser (IndexedDB, under `labs:ballooned-drawing`), so a reload reopens it with
// its balloons; the balloons themselves are kept in localStorage with the rest of the work (model.ts). Only the
// current drawing is kept: opening another replaces it.

const DB = 'labs:ballooned-drawing'
const STORE = 'drawings'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest
    try {
      request = indexedDB.open(DB, 1)
    } catch (e) {
      reject(e)
      return
    }
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    request.onblocked = () => reject(new Error('The browser’s storage is busy in another tab.'))
  })
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error ?? new Error('The browser didn’t save the drawing.'))
  })
}

export interface Kept {
  name: string
  bytes: Uint8Array
}

/** Keeps a drawing under its id and lets go of any other. Rejects when the browser won't keep it (full, refused). */
export async function keepDrawing(id: string, name: string, bytes: Uint8Array): Promise<void> {
  const db = await open()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    store.clear()
    store.put({ name, bytes: bytes.slice().buffer }, id)
    await done(tx)
  } finally {
    db.close()
  }
}

export async function keptDrawing(id: string): Promise<Kept | null> {
  const db = await open()
  try {
    const tx = db.transaction(STORE, 'readonly')
    const request = tx.objectStore(STORE).get(id)
    const value = await new Promise<unknown>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    if (!value || typeof value !== 'object') return null
    const v = value as { name?: unknown; bytes?: unknown }
    if (typeof v.name !== 'string' || !(v.bytes instanceof ArrayBuffer)) return null
    return { name: v.name, bytes: new Uint8Array(v.bytes) }
  } finally {
    db.close()
  }
}

export async function forgetDrawings(): Promise<void> {
  const db = await open()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    await done(tx)
  } finally {
    db.close()
  }
}

/** The drawing's SHA-256 as hex, or (where the browser offers no hashing, outside a secure context) a 32-bit FNV-1a with the length. */
export async function fingerprint(bytes: Uint8Array): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', bytes.slice().buffer)
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
  }
  let h = 0x811c9dc5
  for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 0x01000193)
  return `fnv-${(h >>> 0).toString(16)}-${bytes.length}`
}

/** Base64 in chunks of 8,192 bytes, so a big drawing never spreads too many arguments into one call. */
export function toBase64(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 8192) out += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(out)
}

export function fromBase64(text: string): Uint8Array | null {
  try {
    const raw = atob(text)
    const out = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
    return out
  } catch {
    return null
  }
}
