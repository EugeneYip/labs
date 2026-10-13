import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { candidateTiming, minutesText, paperTiming, percentText, roomPaused, shownFinish, shownStart, type Exam, type Settings } from './model.ts'
import { boardClockText, clockText, dateText } from './ui.ts'

/** The most the board shrinks to fit. */
const SMALLEST = 0.25

/**
 * What the room sees: the actual time (never a countdown, which JCQ's instructions don't allow in exam rooms), the
 * date and centre, and each paper's start and finish times, with a finish for each extra-time group.
 */
export function Board({ exam, settings, now, onControls }: { exam: Exam; settings: Settings; now: number; onControls: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const area = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const [full, setFull] = useState(false)
  // The room the board has: its outer size, which a scrollbar appearing inside doesn't change.
  const [room, setRoom] = useState('')

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    const box = area.current
    const observer = new ResizeObserver(() => box && setRoom(`${box.offsetWidth}x${box.offsetHeight}`))
    if (box) observer.observe(box)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      observer.disconnect()
    }
  }, [])
  const canFull = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen

  const stopped = roomPaused(exam)
  const listed = settings.showCandidates ? exam.candidates.filter((c) => c.label.trim()) : []
  const lines = exam.papers.map((paper) => {
    const groups = [0, ...paper.extra].map((extra) => {
      const t = paperTiming(exam, paper, extra, now)
      return { extra, finish: t?.finish ?? null }
    })
    return { paper, groups }
  })
  const own = listed.map((c) => {
    const t = candidateTiming(exam, c, now)
    const status = !t ? 'not started' : t.finish === null ? (c.breaks.some((b) => b.to === null) ? 'on a break' : 'time stopped') : clockText(shownFinish(t.finish), settings)
    return { id: c.id, label: c.label, status }
  })

  // Sized from the screen, and shrunk when many papers would run off the bottom. For each thing shown in each size of
  // room it starts at full size and only ever shrinks, so it settles in a few steps before the screen is drawn; text
  // wrapping differently at each size can't make it swing back and forth.
  const shown = JSON.stringify([lines.map((l) => [l.paper.title, l.paper.start, l.groups.map((g) => g.finish)]), own, stopped, settings, exam.centre, exam.room, full, room])
  const [fit, setFit] = useState({ for: shown, scale: 1 })
  const scale = fit.for === shown ? fit.scale : 1
  useLayoutEffect(() => {
    const box = area.current
    const inner = content.current
    if (!box || !inner) return
    const available = box.clientHeight * 0.94
    const needed = inner.scrollHeight
    if (needed > available && scale > SMALLEST) setFit({ for: shown, scale: Math.max(SMALLEST, scale * Math.min(0.97, available / needed)) })
    else if (fit.for !== shown) setFit({ for: shown, scale })
  }, [shown, scale, fit.for])
  const size = (expr: string) => `calc(${scale.toFixed(3)} * ${expr})`

  const dark = settings.dark
  const soft = dark ? 'text-white/75' : 'text-stone-600'
  const rule = dark ? 'border-white/20' : 'border-stone-300'

  return (
    <div ref={root} className={`relative flex flex-none flex-col overflow-hidden ${dark ? 'bg-black text-white' : 'bg-white text-stone-950'}`} style={{ height: full ? '100dvh' : 'calc(100dvh - 3rem)' }}>
      {/* Centered while it fits. A board too full to fit even at its smallest scrolls rather than hide its end; only
          then, as a scrollbar appearing would otherwise narrow it, shrink it, and take the scrollbar away again. */}
      <div ref={area} className={`flex flex-1 flex-col px-[4vw] pt-[2vh] pb-16 ${scale <= SMALLEST + 0.001 ? 'overflow-y-auto' : 'overflow-hidden'}`}>
        <div ref={content} className="my-auto grid w-full" style={{ gap: size('2.2vh') }}>
          <div className={`flex flex-wrap items-baseline justify-between gap-x-[3vw] ${soft}`} style={{ fontSize: size('max(1rem, min(3vw, 4.4vh))') }}>
            <p>{exam.centre.trim() ? `Centre ${exam.centre.trim()}` : exam.room.trim()}</p>
            <p>{dateText(now)}</p>
          </div>
          <p className="text-center leading-none font-semibold tabular-nums" style={{ fontSize: size(settings.seconds ? 'min(17vw, 30vh)' : 'min(24vw, 34vh)') }}>
            {boardClockText(now, settings)}
          </p>
          {stopped && (
            <p className={`text-center font-medium ${dark ? 'text-amber-300' : 'text-amber-800'}`} style={{ fontSize: size('min(4vw, 6vh)') }}>
              Time stopped
            </p>
          )}
          {lines.length > 0 && (
            <div className={`grid gap-x-[4vw] border-t ${rule} ${lines.length >= 4 ? 'min-[900px]:grid-cols-2' : ''}`} style={{ rowGap: size('1.6vh'), paddingTop: size('2.2vh') }}>
              {lines.map(({ paper, groups }) => (
                <div key={paper.id} className="grid" style={{ gap: size('0.6vh') }}>
                  <p className="leading-tight font-semibold text-balance" style={{ fontSize: size('max(1.25rem, min(4.2vw, 6vh))') }} dir="auto">
                    {paper.title.trim() || 'Untitled paper'}
                  </p>
                  <p className="flex flex-wrap gap-x-[3vw] gap-y-[0.5vh] leading-tight tabular-nums" style={{ fontSize: size('max(1.1rem, min(3.6vw, 5.2vh))') }}>
                    {paper.start === null ? (
                      <span className={soft}>Not started · {minutesText(paper.minutes)}</span>
                    ) : (
                      <>
                        <span>
                          <span className={soft}>Start </span>
                          {clockText(shownStart(paper.start), settings)}
                        </span>
                        {groups.map(({ extra, finish }) => (
                          <span key={extra}>
                            <span className={soft}>{extra === 0 ? 'Finish ' : `${percentText(extra)} extra time `}</span>
                            {finish === null ? <span className={soft}>stopped</span> : clockText(shownFinish(finish), settings)}
                          </span>
                        ))}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
          {own.length > 0 && (
            <div className={`border-t ${rule}`} style={{ paddingTop: size('1.6vh') }}>
              <p className="flex flex-wrap gap-x-[3vw] gap-y-[0.5vh] leading-tight tabular-nums" style={{ fontSize: size('max(1rem, min(3vw, 4.4vh))') }}>
                {own.map((o) => (
                  <span key={o.id} dir="auto">
                    <span className={soft}>{o.label} </span>
                    {o.status}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quiet, so they don't draw candidates' eyes, but readable for the invigilator. */}
      <div className="absolute right-3 bottom-3 flex gap-2 opacity-70 transition-opacity focus-within:opacity-100 hover:opacity-100 print:hidden">
        {canFull && (
          <button
            type="button"
            onClick={() => void (full ? document.exitFullscreen() : root.current?.requestFullscreen())?.catch(() => {})}
            className={`h-10 cursor-pointer rounded-lg px-3 text-sm ${dark ? 'bg-white/10' : 'bg-black/5'}`}
          >
            {full ? 'Exit full screen' : 'Full screen'}
          </button>
        )}
        <button type="button" onClick={onControls} className={`h-10 cursor-pointer rounded-lg px-3 text-sm ${dark ? 'bg-white/10' : 'bg-black/5'}`}>
          Controls
        </button>
      </div>
    </div>
  )
}
