import { formatNumber, type Experiment } from '../experiments/registry.ts'

/** One experiment in the homepage index. The whole card links to the experiment. */
export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const { number, slug, title, summary, shipped, status } = experiment

  return (
    <a
      href={`/${slug}/`}
      className="group flex h-full flex-col p-6 transition-colors hover:bg-ink/3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink"
    >
      <div className="flex items-center justify-between font-mono text-xs text-dim">
        <span>{formatNumber(number)}</span>
        {status === 'live' ? (
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
            Live
          </span>
        ) : (
          <span>Archived</span>
        )}
      </div>

      <h3 className="mt-12 text-lg font-medium tracking-tight text-balance">{title}</h3>
      <p className="mt-2 text-sm/relaxed text-pretty text-dim">{summary}</p>

      <div className="mt-auto flex items-center justify-between pt-8 font-mono text-xs text-dim">
        <time dateTime={shipped}>{shipped}</time>
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 group-hover:text-ink">
          →
        </span>
      </div>
    </a>
  )
}
