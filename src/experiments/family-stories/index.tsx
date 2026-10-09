import { useCallback, useEffect, useMemo, useState } from 'react'
import { FOLLOW_UPS, questionList, TOPICS } from './questions.ts'
import { useRecorder, useWakeLock } from './recorder.ts'
import { deleteClip, deleteInterview, duration, extension, keepStored, listClips, listInterviews, newId, saveClip, saveInterview, type Clip, type Interview } from './store.ts'
import { makeZip, safeName } from './zip.ts'

const control = 'min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'
const field = `${control} h-11 w-full sm:h-10`
const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const quiet = `${button} text-dim hover:bg-ink/5 hover:text-ink`
const toggle = (on: boolean) => `${button} border ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

/** Experiment #021: a guided recorder for interviewing family about their lives. */
export default function FamilyStories() {
  const [open, setOpen] = useState<string | null>(null)
  const [interviews, setInterviews] = useState<Interview[] | null>(null)
  const [failed, setFailed] = useState(false)

  const refresh = useCallback(() => {
    listInterviews().then(setInterviews, () => setFailed(true))
  }, [])
  useEffect(refresh, [refresh])

  if (failed)
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-10 sm:px-6">
        <p className="font-medium">This browser can’t store recordings here.</p>
        <p className="mt-1 text-sm text-dim">Private or incognito windows often block it. Open the page in a normal window to record.</p>
      </div>
    )
  const current = open && interviews?.find((i) => i.id === open)
  if (current) return <InterviewView interview={current} onChange={(i) => setInterviews((list) => list && list.map((x) => (x.id === i.id ? i : x)))} onClose={() => (setOpen(null), refresh())} />
  return <Home interviews={interviews} onOpen={setOpen} onCreated={(i) => (setInterviews((list) => [i, ...(list ?? [])]), setOpen(i.id))} onDeleted={refresh} />
}

function Home({ interviews, onOpen, onCreated, onDeleted }: { interviews: Interview[] | null; onOpen: (id: string) => void; onCreated: (i: Interview) => void; onDeleted: () => void }) {
  const [name, setName] = useState('')
  const [topics, setTopics] = useState(() => TOPICS.map((t) => t.id))
  const [confirm, setConfirm] = useState<string | null>(null)
  const count = questionList(topics, []).length

  const create = async () => {
    const i: Interview = { id: newId(), name: name.trim(), created: Date.now(), topics, own: [], at: 0 }
    await saveInterview(i)
    onCreated(i)
  }

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
        <p className="max-w-prose text-pretty text-dim">
          Record the stories of the people in your family before they’re lost. Family Stories gives you good questions to ask, one at a time, and records each answer on this device. Nothing is uploaded: download the recordings to keep them, share them, or play them at the next family gathering.
        </p>

        <section aria-labelledby="new-heading" className="mt-8 rounded-2xl border border-rule p-4 sm:p-6">
          <h2 id="new-heading" className="text-lg font-semibold tracking-tight">
            Start an interview
          </h2>
          <label className="mt-4 grid gap-1.5">
            <span className="text-sm font-medium">Who are you talking with?</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Grandma Rose" className={field} dir="auto" autoComplete="off" />
          </label>
          <fieldset className="mt-5">
            <legend className="mb-1.5 text-sm font-medium">Topics</legend>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => {
                const on = topics.includes(t.id)
                return (
                  <button key={t.id} type="button" aria-pressed={on} onClick={() => setTopics(on ? topics.filter((x) => x !== t.id) : TOPICS.map((x) => x.id).filter((id) => id === t.id || topics.includes(id)))} className={toggle(on)}>
                    {t.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-sm text-dim">{count ? `${count} questions. You can skip any, and add your own as you go.` : 'Pick a topic, or start with none and ask your own questions.'}</p>
          </fieldset>
          <button type="button" onClick={() => void create()} className={`${primary} mt-5`}>
            Start
          </button>
        </section>

        {interviews && interviews.length > 0 && (
          <section aria-labelledby="saved-heading" className="mt-10">
            <h2 id="saved-heading" className="text-lg font-semibold tracking-tight">
              Interviews on this device
            </h2>
            <ul className="mt-3 divide-y divide-rule border-y border-rule">
              {interviews.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
                  <button type="button" onClick={() => onOpen(i.id)} className="min-w-0 cursor-pointer text-left">
                    <span className="block truncate font-medium hover:underline" dir="auto">
                      {i.name || 'Unnamed interview'}
                    </span>
                    <span className="text-sm text-dim">Started {dateFormat.format(i.created)}</span>
                  </button>
                  {confirm === i.id ? (
                    <span className="flex flex-wrap items-center gap-2 text-sm">
                      Delete it and all its recordings?
                      <button type="button" onClick={() => void deleteInterview(i.id).then(onDeleted)} className={`${outline} border-red-600 text-red-700 dark:border-red-400 dark:text-red-300`}>
                        Delete
                      </button>
                      <button type="button" onClick={() => setConfirm(null)} className={quiet}>
                        Keep
                      </button>
                    </span>
                  ) : (
                    <span className="flex gap-2">
                      <button type="button" onClick={() => onOpen(i.id)} className={outline}>
                        Open
                      </button>
                      <button type="button" onClick={() => setConfirm(i.id)} className={quiet}>
                        Delete
                      </button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        <p className="mt-10 max-w-prose text-sm text-pretty text-dim">
          Recordings are kept in this browser until you delete them, but browsers can clear stored data, especially on iPhones after weeks without a visit. Download your recordings when you finish an interview.
        </p>
      </div>
    </div>
  )
}

function InterviewView({ interview, onChange, onClose }: { interview: Interview; onChange: (i: Interview) => void; onClose: () => void }) {
  const [clips, setClips] = useState<Clip[]>([])
  const [own, setOwn] = useState('')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [note, setNote] = useState('')
  const rec = useRecorder()
  const recording = rec.state === 'recording'
  useWakeLock(recording)

  useEffect(() => {
    listClips(interview.id).then(setClips, () => setNote('Couldn’t read the recordings stored here.'))
  }, [interview.id])

  const questions = useMemo(() => questionList(interview.topics, interview.own), [interview.topics, interview.own])
  const at = Math.min(interview.at, Math.max(0, questions.length - 1))
  const question = questions[at]
  const update = (patch: Partial<Interview>) => {
    const next = { ...interview, ...patch }
    onChange(next)
    void saveInterview(next)
  }
  const go = (to: number) => !recording && questions.length && update({ at: (to + questions.length) % questions.length })

  const toggleRecord = async () => {
    if (!question) return
    if (!recording) {
      if (await rec.start()) void keepStored()
      return
    }
    const take = await rec.stop()
    if (!take || take.blob.size === 0) return setNote('Nothing was recorded. Check the microphone and try again.')
    const clip: Clip = { id: newId(), interview: interview.id, question: question.text, created: Date.now(), ms: take.ms, type: take.type, blob: take.blob }
    try {
      await saveClip(clip)
      setClips((c) => [...c, clip])
      setNote('')
    } catch {
      setNote('This device is out of storage space, so the last answer couldn’t be saved. Download and delete some recordings, then try again.')
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : document.body
      if (target.closest('input, textarea, select, button, audio, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === ' ') {
        e.preventDefault()
        void toggleRecord()
      } else if (e.key === 'ArrowRight') go(at + 1)
      else if (e.key === 'ArrowLeft') go(at - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const addOwn = () => {
    const text = own.trim()
    if (!text) return
    const nextOwn = [...interview.own, text]
    update({ own: nextOwn, at: questionList(interview.topics, nextOwn).length - 1 })
    setOwn('')
    setAdding(false)
  }

  const total = clips.reduce((n, c) => n + c.ms, 0)
  const order = new Map(questions.map((q, i) => [q.text, i]))
  const sorted = [...clips].sort((a, b) => (order.get(a.question) ?? 1e9) - (order.get(b.question) ?? 1e9) || a.created - b.created)
  const here = clips.filter((c) => c.question === question?.text)

  const downloadAll = async () => {
    setSaving(true)
    try {
      const entries = await Promise.all(
        sorted.map(async (c, i) => ({ name: `${String(i + 1).padStart(2, '0')} ${safeName(c.question)}.${extension(c.type)}`, data: new Uint8Array(await c.blob.arrayBuffer()), date: new Date(c.created) })),
      )
      const who = interview.name || 'Unnamed interview'
      const index = [`Family Stories: ${who}`, `Recorded ${dateFormat.format(sorted[0]?.created ?? Date.now())}${sorted.length > 1 ? ` to ${dateFormat.format(sorted[sorted.length - 1].created)}` : ''}`, '', ...sorted.map((c, i) => `${entries[i].name}\n   ${c.question} (${duration(c.ms)})`)].join('\r\n')
      entries.push({ name: 'Questions.txt', data: new TextEncoder().encode(`${index}\r\n`), date: new Date() })
      save(makeZip(entries), `${safeName(who)} - family stories.zip`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-24 sm:px-6 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={() => (rec.release(), onClose())} disabled={recording} className={`${quiet} -ml-3`}>
            ← All interviews
          </button>
          <button type="button" onClick={() => void downloadAll()} disabled={!clips.length || saving || recording} className={outline}>
            {saving ? 'Preparing…' : `Download all${clips.length ? ` (${clips.length})` : ''}`}
          </button>
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight" dir="auto">
          {interview.name ? `Talking with ${interview.name}` : 'Interview'}
        </h2>
        <p className="mt-1 text-sm text-dim">{clips.length ? `${clips.length} ${clips.length === 1 ? 'answer' : 'answers'}, ${duration(total)} recorded` : 'No answers recorded yet.'}</p>

        <section aria-labelledby="question-heading" className="mt-6 rounded-2xl border border-rule p-5 sm:p-8">
          {question ? (
            <>
              <p className="text-sm text-dim">
                {question.topic} · question {at + 1} of {questions.length}
              </p>
              <h3 id="question-heading" className="mt-3 text-2xl leading-snug font-medium text-pretty sm:text-3xl" dir="auto">
                {question.text}
              </h3>
              <p className="mt-4 text-sm text-dim">To keep it going: {FOLLOW_UPS.slice(at % 3, (at % 3) + 3).join(' · ')}</p>
            </>
          ) : (
            <h3 id="question-heading" className="text-lg font-medium">
              Add a question of your own to begin.
            </h3>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4" aria-live="polite">
            <button
              type="button"
              onClick={() => void toggleRecord()}
              disabled={!question || rec.state === 'starting'}
              className={`inline-flex h-14 cursor-pointer items-center gap-3 rounded-full px-6 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${recording ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-ink text-paper hover:bg-ink/80'}`}
            >
              <span className={`inline-block size-3 rounded-full ${recording ? 'animate-pulse bg-white' : 'bg-red-500'}`} aria-hidden="true" />
              {recording ? 'Stop' : rec.state === 'starting' ? 'Starting…' : here.length ? 'Record another answer' : 'Record the answer'}
            </button>
            {recording && (
              <span className="flex items-center gap-3 text-sm tabular-nums">
                Recording {duration(rec.elapsed)}
                <span className="h-2 w-28 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
                  <span className="block h-full rounded-full bg-red-600 transition-[width] duration-100" style={{ width: `${Math.round(rec.level * 100)}%` }} />
                </span>
              </span>
            )}
          </div>
          {(rec.error || note) && (
            <p className="mt-3 text-sm text-red-700 dark:text-red-400" role="alert">
              {rec.error || note}
            </p>
          )}
          {here.length > 0 && (
            <ul className="mt-5 grid gap-2">
              {here.map((c, i) => (
                <ClipRow key={c.id} clip={c} label={`Answer ${i + 1}`} onDelete={() => void deleteClip(c.id).then(() => setClips((list) => list.filter((x) => x.id !== c.id)))} />
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-rule pt-5">
            <button type="button" onClick={() => go(at - 1)} disabled={recording || questions.length < 2} className={outline}>
              ← Previous
            </button>
            <button type="button" onClick={() => go(at + 1)} disabled={recording || questions.length < 2} className={outline}>
              Next question →
            </button>
            {!adding && (
              <button type="button" onClick={() => setAdding(true)} disabled={recording} className={quiet}>
                Ask your own question
              </button>
            )}
          </div>
          {adding && (
            <form
              className="mt-3 flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                addOwn()
              }}
            >
              <input value={own} onChange={(e) => setOwn(e.target.value)} maxLength={200} placeholder="What was Dad like as a boy?" className={`${field} flex-1 basis-60`} dir="auto" autoFocus />
              <button type="submit" disabled={!own.trim()} className={primary}>
                Add and ask it
              </button>
              <button type="button" onClick={() => setAdding(false)} className={quiet}>
                Cancel
              </button>
            </form>
          )}
        </section>
        <p className="mt-3 hidden text-xs text-dim sm:block">Keys: Space starts and stops recording, ← and → move between questions.</p>

        {sorted.length > 0 && (
          <section aria-labelledby="answers-heading" className="mt-10">
            <h2 id="answers-heading" className="text-lg font-semibold tracking-tight">
              All answers
            </h2>
            <ul className="mt-3 grid gap-3">
              {sorted.map((c) => (
                <ClipRow key={c.id} clip={c} label={c.question} onDelete={() => void deleteClip(c.id).then(() => setClips((list) => list.filter((x) => x.id !== c.id)))} />
              ))}
            </ul>
          </section>
        )}
        <p className="mt-10 max-w-prose text-sm text-pretty text-dim">Recordings stay in this browser until you delete them, and browsers can clear stored data. Download them when you finish.</p>
      </div>
    </div>
  )
}

function ClipRow({ clip, label, onDelete }: { clip: Clip; label: string; onDelete: () => void }) {
  const [url, setUrl] = useState('')
  const [confirm, setConfirm] = useState(false)
  useEffect(() => {
    const u = URL.createObjectURL(clip.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [clip.blob])
  return (
    <li className="rounded-xl border border-rule p-3">
      <p className="text-sm font-medium text-pretty" dir="auto">
        {label} <span className="font-normal text-dim tabular-nums">· {duration(clip.ms)}</span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {url && <audio src={url} controls preload="metadata" className="h-10 min-w-0 flex-1 basis-60" />}
        <button type="button" onClick={() => save(clip.blob, `${safeName(clip.question)}.${extension(clip.type)}`)} className={`${quiet} h-10 px-3`}>
          Download
        </button>
        {confirm ? (
          <>
            <button type="button" onClick={onDelete} className={`${outline} h-10 border-red-600 px-3 text-red-700 dark:border-red-400 dark:text-red-300`}>
              Delete it
            </button>
            <button type="button" onClick={() => setConfirm(false)} className={`${quiet} h-10 px-3`}>
              Keep
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className={`${quiet} h-10 px-3`}>
            Delete
          </button>
        )}
      </div>
    </li>
  )
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
