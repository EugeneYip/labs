import { useState } from 'react'
import { Speech } from './Cards.tsx'
import { firstLetters, segments, type Script, type Section } from './model.ts'
import { MINE, toggle } from './ui.ts'

export type Show = 'full' | 'letters' | 'hidden'

/**
 * The scene as written, with your lines tinted. They can show in full, as the
 * first letter of each word, or be hidden; tap one to see it in full.
 */
export function ReadThrough({ script, section, roles, show, onShow }: { script: Script; section: Section; roles: string[]; show: Show; onShow: (show: Show) => void }) {
  const [open, setOpen] = useState<Set<number>>(new Set())
  const flip = (i: number) =>
    setOpen((o) => {
      const next = new Set(o)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  const items = script.items.slice(section.from, section.to)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Your lines">
        <span className="mr-1 text-sm font-medium">Your lines:</span>
        {(
          [
            ['full', 'In full'],
            ['letters', 'First letters'],
            ['hidden', 'Hidden'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={show === value}
            onClick={() => {
              onShow(value)
              setOpen(new Set())
            }}
            className={`${toggle(show === value)} h-9 px-3 sm:h-8`}
          >
            {label}
          </button>
        ))}
      </div>
      {show !== 'full' && <p className="mt-2 text-sm text-dim">Tap one of your lines to see it in full.</p>}

      <div className="mt-6 grid gap-3">
        {items.map((item, k) => {
          const i = section.from + k
          if (item.kind === 'heading')
            return (
              <h3 key={i} className="mt-3 text-sm font-semibold tracking-wide uppercase">
                {item.text}
              </h3>
            )
          if (item.kind === 'direction')
            return (
              <p key={i} className="text-sm text-dim italic" dir="auto">
                {item.text}
              </p>
            )
          const mine = roles.includes(item.speaker.toLocaleUpperCase())
          if (!mine)
            return (
              <div key={i} dir="auto">
                <p className="text-xs font-semibold tracking-wide uppercase">{item.speaker}</p>
                <div className="leading-relaxed">
                  <Speech text={item.text} />
                </div>
              </div>
            )
          const full = show === 'full' || open.has(i)
          return (
            <div key={i} className={`-mx-3 rounded-xl px-3 py-2 ${MINE}`} dir="auto">
              <p className="text-xs font-semibold tracking-wide uppercase">{item.speaker}</p>
              {show === 'full' ? (
                <div className="leading-relaxed">
                  <Speech text={item.text} />
                </div>
              ) : (
                <button type="button" onClick={() => flip(i)} aria-expanded={full} className="block w-full cursor-pointer text-left leading-relaxed">
                  {full ? <Speech text={item.text} /> : show === 'letters' ? <Letters text={item.text} /> : <span className="text-dim">Your line: tap to show it</span>}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Letters({ text }: { text: string }) {
  return (
    <span className="font-mono text-[0.95em] tracking-wide">
      {segments(text).map((s, i) =>
        s.kind === 'direction' ? (
          <span key={i} className="font-sans text-[0.9em] tracking-normal text-dim italic">
            {s.text}
          </span>
        ) : (
          <span key={i}>{firstLetters(s.text)}</span>
        ),
      )}
      <span className="sr-only"> (first letters only; activate to show the full line)</span>
    </span>
  )
}
