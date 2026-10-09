import { useCallback, useEffect, useRef, useState } from 'react'
import { Player, type Command, type Tool } from './Player.tsx'

const button = 'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors sm:h-10'
const primary = `${button} bg-ink font-medium text-paper hover:bg-ink/80`
const outline = `${button} border border-rule hover:bg-ink/5`
const toggle = (on: boolean) => `${button} border ${on ? 'border-ink bg-ink text-paper' : 'border-rule hover:bg-ink/5'}`

const TOOLS: { tool: Tool; label: string; hint: string }[] = [
  { tool: 'move', label: 'Adjust', hint: 'Drag a dot to move a drawing.' },
  { tool: 'line', label: 'Line', hint: 'Tap two points, or drag. The line shows how far it leans from level or vertical.' },
  { tool: 'angle', label: 'Angle', hint: 'Tap three points: one end, the joint, then the other end.' },
]

interface Clip {
  id: number
  file: File
}

let nextClip = 1

/** Experiment #019: look at technique frame by frame, with lines and angles drawn on the video. */
export default function FormCheck() {
  const [clips, setClips] = useState<Clip[]>([])
  const [tool, setTool] = useState<Tool>('angle')
  const [linked, setLinked] = useState(true)
  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [note, setNote] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const [maxHeight, setMaxHeight] = useState(() => Math.round(window.innerHeight * 0.62))

  useEffect(() => {
    const onResize = () => setMaxHeight(Math.round(window.innerHeight * (clips.length > 1 && window.innerWidth >= 1024 ? 0.7 : 0.62)))
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clips.length])

  // Each player listens for commands; linked players all hear each other's.
  const listeners = useRef(new Map<number, (c: Command) => void>())
  const listenFor = useCallback(
    (id: number) => (handler: (c: Command) => void) => {
      listeners.current.set(id, handler)
      return () => {
        listeners.current.delete(id)
      }
    },
    [],
  )
  const sendFrom = useCallback(
    (id: number) => (c: Command) => {
      if (linked) for (const handler of listeners.current.values()) handler(c)
      else listeners.current.get(id)?.(c)
    },
    [linked],
  )

  const add = (files: FileList | File[] | null | undefined) => {
    const videos = [...(files ?? [])].filter((f) => f.type.startsWith('video/') || /\.(mp4|mov|m4v|webm|mkv|avi|3gp)$/i.test(f.name))
    if (!videos.length) return setNote(files && [...files].length ? 'That isn’t a video file.' : '')
    setNote('')
    setClips((cs) => {
      const next = [...cs, ...videos.map((file) => ({ id: nextClip++, file }))].slice(-2)
      setActive(next.length - 1)
      return next
    })
  }

  const hint = TOOLS.find((t) => t.tool === tool)!.hint

  return (
    <div
      className="flex-1"
      onDragOver={(e) => {
        if (![...e.dataTransfer.items].some((i) => i.kind === 'file')) return
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        add(e.dataTransfer.files)
      }}
    >
      <input ref={input} type="file" accept="video/*" multiple className="hidden" onChange={(e) => {
        add(e.target.files)
        e.target.value = ''
      }} />
      <div className={`mx-auto w-full px-4 pt-6 pb-24 sm:px-6 sm:pt-8 ${clips.length > 1 ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {clips.length === 0 ? (
          <div className="max-w-prose">
            <p className="text-pretty text-dim">
              Check your technique frame by frame. Open a video of a swing, a stride, a lift, or a jump, step through it or play it in slow motion, and draw lines and angles on it: knee bend, back angle, club shaft. Open two videos to compare them side by side. Videos are opened right here on your device and never uploaded.
            </p>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className={`mt-8 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${dragging ? 'border-ink bg-ink/5' : 'border-rule hover:border-dim/60 hover:bg-ink/5'}`}
            >
              <span className="text-lg font-medium">Open a video</span>
              <span className="text-sm text-dim">or drop one here. Two at once to compare.</span>
            </button>
            {note && (
              <p className="mt-3 text-sm text-red-700 dark:text-red-400" role="alert">
                {note}
              </p>
            )}
            <p className="mt-6 text-sm text-dim">Tip: film from the side for knees, hips, and back, and from behind or in front for alignment, with the camera still and level.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Drawing">
              {TOOLS.map((t) => (
                <button key={t.tool} type="button" aria-pressed={tool === t.tool} onClick={() => setTool(t.tool)} className={toggle(tool === t.tool)}>
                  {t.label}
                </button>
              ))}
              <span className="mx-1 hidden h-6 w-px bg-rule sm:block" aria-hidden="true" />
              {clips.length < 2 ? (
                <button type="button" onClick={() => input.current?.click()} className={outline}>
                  Compare with another video
                </button>
              ) : (
                <button type="button" aria-pressed={linked} onClick={() => setLinked(!linked)} className={toggle(linked)}>
                  {linked ? 'Moving together' : 'Moving separately'}
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-dim">
              {hint}
              {clips.length > 1 && (linked ? ' Play, steps, and speed apply to both videos: line them up first with “Moving separately”.' : ' Each video moves on its own; switch back to move them together.')}
            </p>
            {note && (
              <p className="mt-2 text-sm text-red-700 dark:text-red-400" role="alert">
                {note}
              </p>
            )}
            <div className={`mt-5 grid gap-8 ${clips.length > 1 ? 'lg:grid-cols-2' : ''}`}>
              {clips.map((clip, i) => (
                <Player
                  key={clip.id}
                  file={clip.file}
                  tool={tool}
                  send={sendFrom(clip.id)}
                  listen={listenFor(clip.id)}
                  active={active === i}
                  onActivate={() => setActive(i)}
                  onRemove={() => {
                    setClips((cs) => cs.filter((c) => c.id !== clip.id))
                    setActive(0)
                  }}
                  maxHeight={maxHeight}
                />
              ))}
            </div>
            <p className="mt-8 text-sm text-dim">
              Keys: Space plays and pauses, ← and → step one frame (with Shift, ten), Esc cancels a drawing. {clips.length > 1 && 'Keys go to the video you last touched, or both when they move together.'}
            </p>
            <button type="button" onClick={() => input.current?.click()} className={`${primary} mt-4`}>
              Open {clips.length > 1 ? 'other videos' : 'another video'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
