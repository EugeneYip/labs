import { clock, percent, type Marks, type Mode, type Passage, type Result } from './model.ts'
import { whenText } from './ui.ts'

/** Shown only when printing: everything else on the page, including its frame, is hidden. */
export const PRINT_ID = 'fluency-print'

export const printStyles = `@media print {
  @page { margin: 0.6in; }
  html, body { background: white !important; color: black !important; }
  body *:not(:has(#${PRINT_ID})):not(#${PRINT_ID}):not(#${PRINT_ID} *) { display: none !important; }
  body *:has(#${PRINT_ID}) { display: block !important; margin: 0 !important; padding: 0 !important; border: 0 !important; max-width: none !important; min-height: 0 !important; position: static !important; background: none !important; }
  #${PRINT_ID} { display: block !important; }
}`

/** A record of one check: the numbers, and the passage marked the way it would be on paper. */
export function PrintRecord({ passage, marks, last, result, student, passageTitle, mode, goal, at }: { passage: Passage; marks: Marks; last: number; result: Result; student: string; passageTitle: string; mode: Mode; goal: number | null; at: number }) {
  let i = 0
  return (
    <div id={PRINT_ID} className="hidden text-black">
      <p style={{ fontSize: '9pt' }}>Fluency check · {whenText(at)}</p>
      <h2 style={{ fontSize: '16pt', fontWeight: 600, marginTop: '4pt' }} dir="auto">
        {student.trim() || 'Reader'}: {passageTitle}
      </h2>
      <table style={{ marginTop: '10pt', fontSize: '10.5pt', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['Words correct per minute', String(result.wcpm) + (goal !== null ? ` (goal ${goal})` : '')],
            ['Accuracy', result.accuracy === null ? '–' : `${percent(result.accuracy)}% (${result.correct} of ${result.read} words correct)`],
            ['Errors', String(result.errors)],
            ['Self-corrections', String(result.selfCorrections)],
            ['Time', `${clock(result.ms)}${mode === 'minute' ? ' (one-minute check)' : ' (whole passage)'}`],
          ].map(([label, value]) => (
            <tr key={label}>
              <th style={{ textAlign: 'left', fontWeight: 400, paddingRight: '16pt', paddingBlock: '1.5pt' }}>{label}</th>
              <td style={{ fontWeight: 600 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '14pt', fontSize: '12pt', lineHeight: 1.75 }} dir="auto">
        {passage.starts.map((start, p) => (
          <p key={p} style={{ marginTop: p ? '8pt' : 0 }}>
            {passage.words.slice(start, passage.starts[p + 1] ?? passage.words.length).map((word) => {
              const index = i++
              const counted = index <= last
              const mark = counted ? marks[index] : undefined
              return (
                <span key={index}>
                  <span style={{ color: counted ? 'black' : '#777', textDecorationLine: mark === 'error' ? 'line-through' : 'none', textDecorationThickness: '1.5pt', fontWeight: mark ? 700 : undefined }}>{word}</span>
                  {mark === 'sc' && <sup style={{ fontSize: '7pt', fontWeight: 700 }}>SC</sup>}
                  {index === last && <strong> ]</strong>}{' '}
                </span>
              )
            })}
          </p>
        ))}
      </div>
      {result.missed.length > 0 && (
        <p style={{ marginTop: '12pt', fontSize: '10.5pt' }} dir="auto">
          <strong>Missed:</strong> {result.missed.join(', ')}
        </p>
      )}
      <p style={{ marginTop: '12pt', fontSize: '8.5pt', color: '#444' }}>Key: struck-through word = error · SC = self-corrected · ] = last word read. Words after the mark weren't read in time.</p>
    </div>
  )
}

/** The passage alone in large type, for the student to read from. */
export function StudentCopy({ passage, title }: { passage: Passage; title: string }) {
  return (
    <div id={PRINT_ID} className="hidden text-black" dir="auto">
      {title.trim() && <h2 style={{ fontSize: '20pt', fontWeight: 600, marginBottom: '14pt' }}>{title}</h2>}
      {passage.starts.map((start, p) => (
        <p key={p} style={{ fontSize: '17pt', lineHeight: 1.8, marginTop: p ? '12pt' : 0 }}>
          {passage.words.slice(start, passage.starts[p + 1] ?? passage.words.length).join(' ')}
        </p>
      ))}
    </div>
  )
}
