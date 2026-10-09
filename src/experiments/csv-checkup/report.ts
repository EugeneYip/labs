import { DELIMITER_NAMES } from './csv.ts'
import type { Checkup } from './check.ts'
import { formatCount, KIND_NAMES, percent, type Column } from './profile.ts'

/** A short summary of a column's values: its range, or its most common value. */
export function columnSummary(c: Column): string {
  if (c.type === 'empty') return 'No values'
  if (c.min !== undefined && c.max !== undefined) return `${formatNumber(c.min)} to ${formatNumber(c.max)}`
  if (c.earliest && c.latest && c.type === 'date') return c.earliest === c.latest ? c.earliest : `${c.earliest} to ${c.latest}`
  if (c.distinct === c.filled && c.filled > 1) return 'Every value is different'
  const top = c.top[0]
  return top ? `Most common: ${quote(top.value)} (${formatCount(top.count)})` : ''
}

export function distinctText(c: Column): string {
  return c.distinctCapped ? `${formatCount(c.distinct)}+` : formatCount(c.distinct)
}

export function formatNumber(n: number): string {
  return Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1e-4) ? n.toExponential(3) : n.toLocaleString('en-US', { maximumFractionDigits: 4 })
}

export function quote(value: string): string {
  return `“${value.length > 40 ? `${value.slice(0, 40)}…` : value}”`
}

/** The whole checkup as Markdown, for pasting into a ticket, a doc, or a message. */
export function toMarkdown(name: string, size: string, checkup: Checkup): string {
  const { profile: p } = checkup
  const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
  const lines = [
    `# CSV Checkup: ${name}`,
    '',
    `${formatCount(p.rows)} rows × ${p.columns.length} columns · ${size} · ${DELIMITER_NAMES[checkup.delimiter]}-separated · ${checkup.encoding}${p.hasHeader ? '' : ' · no header row'}`,
    '',
    '## Issues',
    '',
    ...(p.issues.length ? p.issues.map((issue) => `- ${issue}`) : ['No problems found.']),
    '',
    '## Columns',
    '',
    '| Column | Type | Filled | Distinct | Values |',
    '| --- | --- | --- | --- | --- |',
    ...p.columns.map((c) => `| ${cell(c.name || '(no name)')} | ${KIND_NAMES[c.type]} | ${percent(c.filled, p.rows)} | ${distinctText(c)} | ${cell(columnSummary(c))} |`),
    '',
  ]
  return lines.join('\n')
}
