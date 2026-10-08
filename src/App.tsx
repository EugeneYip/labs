import { lazy, Suspense, type ComponentType } from 'react'
import { ExperimentShell } from './components/ExperimentShell.tsx'
import { experiments } from './experiments/registry.ts'
import { Home } from './Home.tsx'

// Each experiment's code is loaded only when someone opens that experiment.
const modules = import.meta.glob<{ default: ComponentType }>('./experiments/*/index.tsx')

const pages = new Map(
  experiments.map((experiment) => [
    experiment.slug,
    { experiment, Component: lazy(modules[`./experiments/${experiment.slug}/index.tsx`]) },
  ]),
)

/** Every page is a full page load, so the address is all the routing needed. */
export function App({ path }: { path: string }) {
  const slug = path.replace(/index\.html$/, '').replace(/^\/+|\/+$/g, '')
  if (slug === '') return <Home />

  const page = pages.get(slug)
  if (!page) return <NotFound />

  const { experiment, Component } = page
  return (
    <ExperimentShell experiment={experiment}>
      <Suspense>
        <Component />
      </Suspense>
    </ExperimentShell>
  )
}

function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-5 sm:px-8">
      <p className="font-mono text-xs tracking-widest text-dim uppercase">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">There is nothing at this address.</h1>
      <a href="/" className="mt-6 self-start text-dim underline underline-offset-4 hover:text-ink">
        Back to Labs
      </a>
    </main>
  )
}
