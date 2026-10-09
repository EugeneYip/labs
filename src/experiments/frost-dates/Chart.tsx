import { useEffect, useRef, useState } from 'react'
import { degrees, offsetDate, toISO, type Analysis, type Season, type Units } from './model.ts'

const DAY = 86_400_000
const monthLetter = new Intl.DateTimeFormat(undefined, { month: 'narrow', timeZone: 'UTC' })
const monthShort = new Intl.DateTimeFormat(undefined, { month: 'short', timeZone: 'UTC' })
const dayMonth = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
export const dateText = (day: number) => dayMonth.format(day * DAY)

/** Every frost night of the last 30 seasons, one row per season, newest at the top. */
export function SeasonChart({ analysis, units }: { analysis: Analysis; units: Units }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(Math.max(260, el.clientWidth)))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const rows: Season[] = [...(analysis.current ? [analysis.current] : []), ...[...analysis.seasons].reverse()]
  const narrow = width < 480
  const label = narrow ? 46 : 60
  const top = 22
  const rowH = narrow ? 9 : 10
  const gap = 3
  const plot = width - label - 4
  const height = top + rows.length * (rowH + gap) + 4
  const x = (offset: number) => label + (offset / 365) * plot
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(2001, analysis.month - 1 + i, 1))
    return { offset: Math.round((date.getTime() - Date.UTC(2001, analysis.month - 1, 1)) / DAY), date }
  })
  const markers = [
    { offset: analysis.firstAutumn.typical, text: 'Typical first' },
    { offset: analysis.lastSpring.typical, text: 'Typical last' },
  ].filter((m): m is { offset: number; text: string } => m.offset !== null)

  return (
    <div ref={ref}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block max-w-full" role="img" aria-label={`Frost nights in each of the last ${analysis.seasons.length} seasons. The table below lists each season's first and last frost.`}>
        {months.map((m, i) => (
          <g key={i}>
            <line x1={x(m.offset)} x2={x(m.offset)} y1={top - 4} y2={height - 2} className="stroke-rule" strokeWidth={1} />
            <text x={x(m.offset) + 3} y={top - 9} className="fill-dim text-[11px]">
              {narrow ? monthLetter.format(m.date) : monthShort.format(m.date)}
            </text>
          </g>
        ))}
        {markers.map((m) => (
          <line key={m.text} x1={x(m.offset + 0.5)} x2={x(m.offset + 0.5)} y1={top - 4} y2={height - 2} className="stroke-ink" strokeWidth={1.5} strokeDasharray="3 3" />
        ))}
        {rows.map((s, i) => {
          const y = top + i * (rowH + gap)
          const current = !s.complete
          return (
            <g key={s.label}>
              <text x={label - 6} y={y + rowH / 2} dy="0.35em" textAnchor="end" className={`text-[10px] tabular-nums ${current ? 'fill-ink font-semibold' : 'fill-dim'}`}>
                {narrow ? s.label.replace(/^\d\d(\d\d)/, '’$1') : s.label}
              </text>
              {current && <rect x={x(0)} y={y} width={x(Math.min(365, analysis.dataEnd - s.start + 1)) - x(0)} height={rowH} rx={2} className="fill-ink/5" />}
              {s.runs.map((r) => (
                <rect key={r.from} x={x(r.from - s.start)} y={y} width={Math.max(1.5, x(r.to - s.start + 1) - x(r.from - s.start))} height={rowH} rx={1} className="fill-sky-700 dark:fill-sky-400">
                  <title>{`${r.from === r.to ? dateText(r.from) : `${dateText(r.from)} to ${dateText(r.to)}`}, ${toISO(r.from).slice(0, 4)}: low ${degrees(r.coldest, units)}`}</title>
                </rect>
              ))}
            </g>
          )
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-dim">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-4 rounded-sm bg-sky-700 dark:bg-sky-400" aria-hidden="true" />
          Frost night
        </span>
        {markers.length > 0 && (
          <span className="flex items-center gap-1.5">
            <svg width="16" height="10" aria-hidden="true">
              <line x1="8" x2="8" y1="0" y2="10" className="stroke-ink" strokeWidth={1.5} strokeDasharray="3 3" />
            </svg>
            Typical first and last frost
          </span>
        )}
        {analysis.current && <span>Top row: this season so far</span>}
      </div>
    </div>
  )
}

/** The same seasons as a table: first and last frost, and the coldest night. */
export function SeasonTable({ analysis, units }: { analysis: Analysis; units: Units }) {
  const rows = [...(analysis.current ? [analysis.current] : []), ...[...analysis.seasons].reverse()]
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-rule text-dim">
          <tr>
            <th scope="col" className="py-2 pr-4 font-normal">
              Season
            </th>
            <th scope="col" className="py-2 pr-4 font-normal">
              First frost
            </th>
            <th scope="col" className="py-2 pr-4 font-normal">
              Last frost
            </th>
            <th scope="col" className="py-2 pr-4 text-right font-normal">
              Frost nights
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              Coldest
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule tabular-nums">
          {rows.map((s) => {
            const nights = s.runs.reduce((n, r) => n + r.to - r.from + 1, 0)
            const coldest = s.runs.length ? Math.min(...s.runs.map((r) => r.coldest)) : null
            return (
              <tr key={s.label}>
                <th scope="row" className="py-1.5 pr-4 font-normal">
                  {s.label}
                  {!s.complete && <span className="text-dim"> so far</span>}
                </th>
                <td className="py-1.5 pr-4">{s.first === null ? '–' : dateText(s.first)}</td>
                <td className="py-1.5 pr-4">{s.last === null ? '–' : dateText(s.last)}</td>
                <td className="py-1.5 pr-4 text-right">{nights}</td>
                <td className="py-1.5 text-right">{coldest === null ? '–' : degrees(coldest, units)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** A season offset as "Apr 7". */
export const offsetText = (month: number, offset: number) => dayMonth.format(offsetDate(month, offset))
