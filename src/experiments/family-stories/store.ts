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

/** An answer being recorded: saved a second at a time, so a reload, a closed tab, or a crash doesn't lose it. */
export interface Draft {
  id: string
  interview: string
  question: string
  created: number
  type: string
}

interface Part {
  draft: string
  n: number
  at: number
  blob: Blob
}

const NAME = 'labs:family-stories'

let opening: Promise<IDBDatabase> | null = null

function db(): Promise<IDBDatabase> {
  opening ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(NAME, 2)
    req.onupgradeneeded = (event) => {
      const d = req.result
      if (event.oldVersion < 1) {
        d.createObjectStore('interviews', { keyPath: 'id' })
        d.createObjectStore('clips', { keyPath: 'id' }).createIndex('interview', 'interview')
      }
      if (event.oldVersion < 2) {
        d.createObjectStore('drafts', { keyPath: 'id' })
        d.createObjectStore('parts', { keyPath: ['draft', 'n'] })
      }
    }
    req.onsuccess = () => {
      const d = req.result
      // A newer version of this page, opened in another tab, needs this one to let go of the database.
      d.onversionchange = () => {
        d.close()
        opening = null
      }
      resolve(d)
    }
    req.onblocked = () => {
      opening = null
      reject(new Error('blocked'))
    }
    req.onerror = () => {
      opening = null
      reject(req.error)
    }
  })
  return opening
}

function run<T>(store: 'interviews' | 'clips' | 'drafts' | 'parts', mode: IDBTransactionMode, work: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
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

export const startDraft = (d: Draft) => run('drafts', 'readwrite', (s) => s.put(d))
export const savePart = (draft: string, n: number, blob: Blob) => run('parts', 'readwrite', (s) => s.put({ draft, n, at: Date.now(), blob } satisfies Part))

const partsOf = (draft: string) => IDBKeyRange.bound([draft, 0], [draft, Infinity])

/** Forgets a draft once its answer is saved as a clip. */
export async function endDraft(id: string) {
  const d = await db()
  await new Promise<void>((resolve, reject) => {
    const tx = d.transaction(['drafts', 'parts'], 'readwrite')
    tx.objectStore('drafts').delete(id)
    tx.objectStore('parts').delete(partsOf(id))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Saves answers whose recording was cut off (the page reloaded, closed, or
 * crashed before Stop) from the seconds that reached storage. A draft that got
 * a second within the last few seconds may still be recording in another tab,
 * so it's left for later; the result says whether any were.
 */
let recovering: Promise<{ recovered: Clip[]; waiting: boolean }> | null = null

export function recoverDrafts(): Promise<{ recovered: Clip[]; waiting: boolean }> {
  // One pass at a time, so two callers can't both save the same answer.
  recovering ??= recoverOnce().finally(() => (recovering = null))
  return recovering
}

async function recoverOnce(): Promise<{ recovered: Clip[]; waiting: boolean }> {
  const drafts = await run<Draft[]>('drafts', 'readonly', (s) => s.getAll() as IDBRequest<Draft[]>)
  const interviews = new Set((await listInterviews()).map((i) => i.id))
  const recovered: Clip[] = []
  let waiting = false
  for (const draft of drafts) {
    const parts = (await run<Part[]>('parts', 'readonly', (s) => s.getAll(partsOf(draft.id)) as IDBRequest<Part[]>)).sort((a, b) => a.n - b.n)
    const last = parts[parts.length - 1]?.at ?? draft.created
    if (Date.now() - last < 5000) {
      waiting = true
      continue
    }
    const blob = new Blob(parts.map((p) => p.blob), { type: draft.type })
    if (blob.size && interviews.has(draft.interview)) {
      const clip: Clip = { id: draft.id, interview: draft.interview, question: draft.question, created: draft.created, ms: Math.max(0, last - draft.created), type: draft.type, blob }
      await saveClip(clip)
      recovered.push(clip)
    }
    await endDraft(draft.id)
  }
  return { recovered, waiting }
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
