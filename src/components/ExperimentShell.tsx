import type { ReactNode } from 'react'
import { formatNumber, type Experiment } from '../experiments/registry.ts'
import { feedbackUrl } from './feedback.ts'

/**
 * The frame around every experiment page: a slim header that links back to
 * Labs and holds the page's <h1>. The experiment owns all the space below it,
 * including its own padding; `flex-1` on its root fills the remaining height.
 */
export function ExperimentShell({ experiment, children }: { experiment: Experiment; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-rule px-4 text-sm sm:px-6">
        <a href="/" className="font-semibold tracking-tight hover:text-dim">
          Labs
        </a>
        <span aria-hidden="true" className="text-dim">
          /
        </span>
        <span className="font-mono text-xs text-dim">{formatNumber(experiment.number)}</span>
        <h1 className="min-w-0 truncate font-medium">{experiment.title}</h1>
        {experiment.status === 'archived' && (
          <span className="ml-auto shrink-0 font-mono text-xs text-dim">Archived</span>
        )}
        <a href={feedbackUrl(experiment)} target="_blank" rel="noreferrer" className={`${experiment.status === 'archived' ? '' : 'ml-auto'} shrink-0 font-mono text-xs text-dim hover:text-ink print:hidden`}>
          Feedback
        </a>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
