import { ExperimentCard } from './components/ExperimentCard.tsx'
import { experiments } from './experiments/registry.ts'

export function Home() {
  const newestFirst = [...experiments].sort((a, b) => b.number - a.number)

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 sm:px-8">
      <header className="pt-24 pb-20 sm:pt-36 sm:pb-28">
        <h1 className="text-6xl font-semibold tracking-tighter sm:text-8xl">Labs</h1>
        <p className="mt-5 max-w-sm text-lg text-balance text-dim sm:text-xl">
          Small software experiments, built and shipped rapidly.
        </p>
      </header>

      <main className="flex-1">
        <section aria-labelledby="experiments-heading">
          <div className="flex items-baseline justify-between border-b border-rule pb-3 font-mono text-xs tracking-widest text-dim uppercase">
            <h2 id="experiments-heading">Experiments</h2>
            <p>{newestFirst.length} shipped</p>
          </div>

          {newestFirst.length === 0 ? (
            <p className="py-12 text-dim">There are currently no experiments.</p>
          ) : (
            <ul className="grid border-l border-rule sm:grid-cols-2 lg:grid-cols-3">
              {newestFirst.map((experiment) => (
                <li key={experiment.slug} className="border-r border-b border-rule">
                  <ExperimentCard experiment={experiment} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="mt-24 flex items-center justify-between border-t border-rule py-6 font-mono text-xs text-dim">
        <p>labs.eugeneyip.net</p>
        <a href="https://github.com/EugeneYip/labs" className="hover:text-ink">
          Source ↗
        </a>
      </footer>
    </div>
  )
}
