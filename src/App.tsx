import { Component as ReactComponent, lazy, Suspense, type ComponentType, type ReactNode } from 'react'
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
      <LoadBoundary>
        <Suspense>
          <Component />
        </Suspense>
      </LoadBoundary>
    </ExperimentShell>
  )
}

/**
 * An experiment whose code can't be loaded or run would otherwise leave a blank page:
 * offline before it was ever opened, a deploy replacing its files mid-load, or a browser too old for it.
 */
class LoadBoundary extends ReactComponent<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto w-full max-w-prose px-4 py-12 sm:px-6" role="alert">
        <p className="text-lg font-medium">This experiment couldn’t load.</p>
        <p className="mt-2 text-pretty text-dim">Check the connection and reload the page. If it still doesn’t load, this browser may be too old for it: on an iPhone or iPad it needs iOS or iPadOS 16.4 or later.</p>
        <button type="button" onClick={() => location.reload()} className="mt-5 inline-flex h-11 cursor-pointer items-center rounded-lg bg-ink px-4 text-sm font-medium text-paper hover:bg-ink/80 sm:h-10">
          Reload
        </button>
      </div>
    )
  }
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
