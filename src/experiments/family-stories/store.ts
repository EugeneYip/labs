/**
 * Interviews and their recordings, kept in this browser's IndexedDB (audio is
 * too big for localStorage). Nothing is uploaded.
 */

export interface Interview {
  id: string
  name: string
  created: number
  topics: string[]
  /** Questions you added yourself. */
  own: string[]
  /** The question being asked, as an index into the interview's list. */
  at: number
}

export interface Clip {
  id: string
  interview: string
  question: string
  created: number
  ms: number
  type: string
  blob: Blob
}

const NAME = 'labs:family-stories'

let opening: Promise<IDBDatabase> | null = null

function db(): Promise<IDBDatabase> {
  opening ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(NAME, 1)
    req.onupgradeneeded = () => {
      const d = req.result
      d.createObjectStore('interviews', { keyPath: 'id' })
      d.createObjectStore('clips', { keyPath: 'id' }).createIndex('interview', 'interview')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => {
      opening = null
      reject(req.error)
    }
  })
  return opening
}

function run<T>(store: 'interviews' | 'clips', mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const tx = d.transaction(store, mode)
        const req = work(tx.objectStore(store))
        tx.oncomplete = () => resolve(req.result)
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      }),
  )
}

export const listInterviews = () => run<Interview[]>('interviews', 'readonly', (s) => s.getAll() as IDBRequest<Interview[]>).then((list) => list.sort((a, b) => b.created - a.created))
export const saveInterview = (i: Interview) => run('interviews', 'readwrite', (s) => s.put(i))
export const listClips = (interview: string) => run<Clip[]>('clips', 'readonly', (s) => s.index('interview').getAll(interview) as IDBRequest<Clip[]>).then((list) => list.sort((a, b) => a.created - b.created))
export const saveClip = (c: Clip) => run('clips', 'readwrite', (s) => s.put(c))
export const deleteClip = (id: string) => run('clips', 'readwrite', (s) => s.delete(id))

export async function deleteInterview(id: string) {
  const clips = await listClips(id)
  const d = await db()
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(['interviews', 'clips'], 'readwrite')
    tx.objectStore('interviews').delete(id)
    for (const c of clips) tx.objectStore('clips').delete(c.id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Asks the browser not to clear these recordings when space runs low, where it allows that. */
export async function keepStored(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}

export const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)

/** A file extension for a recording's type: .webm from Chrome and Firefox, .m4a from Safari. */
export function extension(type: string): string {
  if (type.includes('webm')) return 'webm'
  if (type.includes('mp4') || type.includes('aac')) return 'm4a'
  if (type.includes('ogg')) return 'ogg'
  if (type.includes('wav')) return 'wav'
  return 'audio'
}

/** "3:05", or "1:02:10" past an hour. */
export function duration(ms: number): string {
  const s = Math.round(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}
