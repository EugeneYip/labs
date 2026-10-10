import { useEffect, useRef, useState, type DragEvent } from 'react'
import { dateInName, formatSize, MIME_TYPES, scrub, ScrubError, type Finding, type Format, type Report } from './metadata.ts'
import { zip } from './zip.ts'

interface Entry {
  id: string
  name: string
  size: number
  status: 'working' | 'done' | 'error'
  error?: string
  before?: Report
  after?: Report
  clean?: { name: string; blob: Blob; url: string }
}

const button =
  'inline-flex h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40'
const primary = `${button} bg-ink text-paper hover:bg-ink/80`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`

/** Experiment #002: shows the hidden details in photos and makes clean copies, all on this device. */
export default function PhotoScrub() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [dragging, setDragging] = useState(false)
  const [notice, setNotice] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const dragDepth = useRef(0)
  const urls = useRef(new Set<string>())
  const canShare = canShareFiles()

  useEffect(() => {
    const created = urls.current
    return () => created.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  const done = entries.filter((e) => e.status === 'done')
  const located = done.filter((e) => e.before?.location).length

  async function addFiles(files: FileList | File[] | null) {
    const list = [...(files ?? [])]
    if (list.length === 0) return
    const added = list.map((file) => ({ id: crypto.randomUUID(), name: file.name || 'photo', size: file.size, status: 'working' as const }))
    setEntries((current) => [...current, ...added])
    let cleaned = 0
    let withLocation = 0
    for (const [k, file] of list.entries()) {
      let update: Partial<Entry>
      try {
        const { before: report, after, clean } = scrub(new Uint8Array(await file.arrayBuffer()))
        // Phones and screenshot tools put the date in the file name, so the clean copy gets a plain one.
        const dated = dateInName(file.name)
        const before = dated ? { ...report, findings: [...report.findings, { kind: 'time' as const, label: 'File name', value: `Includes the date (${dated}), so the clean copy has a plain name` }] } : report
        const blob = new Blob([clean], { type: MIME_TYPES[before.format] })
        const url = URL.createObjectURL(blob)
        urls.current.add(url)
        update = { status: 'done', before, after, clean: { name: cleanName(dated ? 'photo' : file.name, before.format), blob, url } }
        cleaned++
        if (before.location) withLocation++
      } catch (error) {
        update = { status: 'error', error: error instanceof ScrubError ? error.message : 'Something went wrong reading this file, so it was left alone.' }
      }
      setEntries((current) => current.map((e) => (e.id === added[k].id ? { ...e, ...update } : e)))
    }
    setNotice(
      `Checked ${list.length} ${list.length === 1 ? 'file' : 'files'}. ${cleaned} clean ${cleaned === 1 ? 'copy' : 'copies'} ready` +
        (withLocation ? `; ${withLocation} showed where ${withLocation === 1 ? 'it was' : 'they were'} taken.` : '.'),
    )
  }

  function clear() {
    for (const entry of entries) if (entry.clean) {
      URL.revokeObjectURL(entry.clean.url)
      urls.current.delete(entry.clean.url)
    }
    setEntries([])
    setNotice('')
  }

  async function downloadAll() {
    if (done.length === 1) return save(done[0].clean!.url, done[0].clean!.name)
    const names = uniqueNames(done.map((e) => e.clean!.name))
    const files = await Promise.all(done.map(async (e, k) => ({ name: names[k], data: new Uint8Array(await e.clean!.blob.arrayBuffer()) })))
    const url = URL.createObjectURL(new Blob([zip(files)], { type: 'application/zip' }))
    save(url, 'clean-photos.zip')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  async function share(list: Entry[]) {
    const names = uniqueNames(list.map((e) => e.clean!.name))
    const files = list.map((e, k) => new File([e.clean!.blob], names[k], { type: e.clean!.blob.type }))
    try {
      await navigator.share({ files })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setNotice('Sharing didn’t work here. Download the clean copies instead.')
    }
  }

  function onDrag(event: DragEvent, kind: 'enter' | 'leave' | 'over' | 'drop') {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    if (kind === 'enter') dragDepth.current++
    if (kind === 'leave') dragDepth.current--
    if (kind === 'drop') {
      dragDepth.current = 0
      void addFiles(event.dataTransfer.files)
    }
    setDragging(dragDepth.current > 0)
  }

  return (
    <div
      className="flex-1"
      onDragEnter={(e) => onDrag(e, 'enter')}
      onDragLeave={(e) => onDrag(e, 'leave')}
      onDragOver={(e) => onDrag(e, 'over')}
      onDrop={(e) => onDrag(e, 'drop')}
    >
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="max-w-xl text-pretty text-dim">
          Photos can carry hidden details: the exact place they were taken, the phone or camera, and the date and time. See
          what yours reveal, and get clean copies to share.
        </p>

        <div
          className={`mt-6 flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 text-center transition-colors ${entries.length ? 'py-6' : 'py-10 sm:py-14'} ${dragging ? 'border-ink bg-ink/5' : 'border-rule'}`}
        >
          <p className="text-lg font-medium">{entries.length ? 'Drop more photos here' : 'Drop photos here'}</p>
          <button type="button" onClick={() => input.current?.click()} className={primary}>
            Choose photos
          </button>
          <p className="text-sm text-dim">JPEG, PNG, or WebP. Several at once is fine.</p>
          <input
            ref={input}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              void addFiles(event.target.files)
              event.target.value = ''
            }}
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
          />
        </div>
        <p className="mt-3 text-sm text-pretty text-dim">Your photos never leave this device. Everything happens in this page, and nothing is uploaded. Clean copies keep only what shows the picture as it was: the image itself, its color profile, and which way up it goes.</p>

        <p role="status" className="sr-only">
          {notice}
        </p>

        {entries.length > 0 && (
          <section aria-labelledby="results-heading" className="mt-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-rule pb-3">
              <h2 id="results-heading" className="mr-auto text-sm text-dim">
                <span className="font-medium text-ink">
                  {entries.length} {entries.some((e) => e.status === 'error') ? 'file' : 'photo'}
                  {entries.length === 1 ? '' : 's'}
                </span>
                {located > 0 && <span className="text-red-700 dark:text-red-400"> · {located} showed where {located === 1 ? 'it was' : 'they were'} taken</span>}
              </h2>
              <div className="-mr-2 flex flex-wrap gap-1">
                {done.length > 0 && (
                  <button type="button" onClick={() => void downloadAll()} className={primary}>
                    {done.length === 1 ? 'Download clean copy' : `Download all (${done.length})`}
                  </button>
                )}
                {canShare && done.length > 0 && (
                  <button type="button" onClick={() => void share(done)} className={quiet}>
                    Share
                  </button>
                )}
                <button type="button" onClick={clear} className={quiet}>
                  Clear
                </button>
              </div>
            </div>
            <ul className="divide-y divide-rule">
              {entries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} canShare={canShare} onShare={() => void share([entry])} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}

function EntryRow({ entry, canShare, onShare }: { entry: Entry; canShare: boolean; onShare: () => void }) {
  const { before, after, clean } = entry
  const findings = before?.findings ?? []
  const leftovers = after?.findings ?? []

  return (
    <li className="py-5">
      <div className="flex gap-4">
        {clean ? (
          <img src={clean.url} alt="" className="size-16 shrink-0 rounded-md bg-ink/5 object-cover sm:size-20" />
        ) : (
          <div aria-hidden="true" className="size-16 shrink-0 rounded-md bg-ink/5 sm:size-20" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <p className="min-w-0 truncate font-medium">{entry.name}</p>
            <p className="text-xs text-dim">{formatSize(entry.size)}</p>
          </div>
          {entry.status === 'working' && <p className="mt-1 text-sm text-dim">Checking…</p>}
          {entry.status === 'error' && <p className="mt-1 text-sm text-dim">{entry.error}</p>}
          {entry.status === 'done' && <Verdict before={before!} />}
        </div>
      </div>

      {/* Details span the full width on phones and line up under the name on wider screens. */}
      {entry.status === 'done' && (
        <div className="sm:pl-24">
          {findings.length > 0 && (
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              {findings.map((finding, k) => (
                <FindingRow key={k} finding={finding} location={finding.label === 'GPS position' ? before!.location : undefined} />
              ))}
            </dl>
          )}
          <p className={`mt-3 text-sm ${leftovers.length ? 'text-red-700 dark:text-red-400' : 'text-green-800 dark:text-green-300'}`}>
            {leftovers.length
              ? `Some details couldn’t be removed: ${leftovers.map((f) => f.label).join(', ')}.`
              : findings.length
                ? '✓ The clean copy has none of these.'
                : '✓ The copy is clean too.'}
          </p>
          <div className="mt-2 -ml-4 flex flex-wrap">
            <a href={clean!.url} download={clean!.name} className={quiet} aria-label={`Download ${clean!.name}`}>
              Download
            </a>
            {canShare && (
              <button type="button" onClick={onShare} className={quiet} aria-label={`Share ${clean!.name}`}>
                Share
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

function Verdict({ before }: { before: Report }) {
  const [tone, text] = before.location
    ? ['bg-red-500/10 text-red-800 dark:text-red-300', 'Shows where it was taken']
    : before.findings.length
      ? ['bg-amber-500/15 text-amber-800 dark:text-amber-300', `${before.findings.length} hidden ${before.findings.length === 1 ? 'detail' : 'details'}`]
      : ['bg-green-500/15 text-green-800 dark:text-green-300', 'No hidden details found']
  return <p className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}>{text}</p>
}

function FindingRow({ finding, location }: { finding: Finding; location?: Report['location'] }) {
  const alert = finding.kind === 'location'
  return (
    <>
      <dt className={alert ? 'text-red-700 dark:text-red-400' : 'text-dim'}>{finding.label}</dt>
      <dd dir="auto" className={`min-w-0 break-words ${alert ? 'text-red-800 dark:text-red-300' : ''}`}>
        {finding.value}
        {location && (
          <>
            {' '}
            <a
              href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap underline underline-offset-2 hover:no-underline"
            >
              View on map<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </>
        )}
      </dd>
    </>
  )
}

function canShareFiles(): boolean {
  try {
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([''], 'photo.jpg', { type: 'image/jpeg' })] })
  } catch {
    return false
  }
}

const EXTENSIONS: Record<Format, string[]> = { jpeg: ['jpg', 'jpeg'], png: ['png'], webp: ['webp'] }

/** IMG_1234.JPG → IMG_1234-clean.jpg, with an extension that matches the real format. */
function cleanName(name: string, format: Format): string {
  const dot = name.lastIndexOf('.')
  const base = dot > 0 ? name.slice(0, dot) : name || 'photo'
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
  return `${base}-clean.${EXTENSIONS[format].includes(ext) ? ext : EXTENSIONS[format][0]}`
}

/** Two photos called IMG_1.jpg become IMG_1.jpg and IMG_1 (2).jpg. */
function uniqueNames(names: string[]): string[] {
  const used = new Map<string, number>()
  return names.map((name) => {
    const count = (used.get(name) ?? 0) + 1
    used.set(name, count)
    if (count === 1) return name
    const dot = name.lastIndexOf('.')
    return `${name.slice(0, dot)} (${count})${name.slice(dot)}`
  })
}

function save(url: string, name: string) {
  const link = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.append(link)
  link.click()
  link.remove()
}
