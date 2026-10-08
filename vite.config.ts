import { existsSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { experiments } from './src/experiments/registry.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), experimentPages()],
})

/**
 * GitHub Pages only serves files that exist, so for each registered experiment
 * this writes <slug>/index.html: a copy of the built index.html carrying that
 * experiment's title and summary. Direct links then load, and link previews
 * show the right text. It also writes 404.html so unknown addresses show the
 * app's "not found" page. Before building, it checks the registry for mistakes.
 */
function experimentPages(): Plugin {
  return {
    name: 'labs:experiment-pages',
    apply: 'build',
    enforce: 'post',

    buildStart() {
      const numbers = new Set<number>()
      const slugs = new Set<string>()
      for (const { number, slug, shipped } of experiments) {
        const problem =
          !Number.isInteger(number) || number < 1 ? 'number must be a whole number of 1 or more'
          : numbers.has(number) ? 'number is already used'
          : !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ? 'slug must be lowercase words joined by hyphens'
          : slug === 'assets' ? 'slug "assets" is reserved for build files'
          : slugs.has(slug) ? 'slug is already used'
          : !/^\d{4}-\d{2}-\d{2}$/.test(shipped) ? 'shipped must be a date like 2026-01-31'
          : !existsSync(`src/experiments/${slug}/index.tsx`) ? `src/experiments/${slug}/index.tsx does not exist`
          : null
        if (problem) this.error(`Experiment registry: ${slug || number}: ${problem}.`)
        numbers.add(number)
        slugs.add(slug)
      }
    },

    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (index?.type !== 'asset' || typeof index.source !== 'string') {
        return this.error('index.html is missing from the build output.')
      }
      for (const { slug, title, summary } of experiments) {
        this.emitFile({
          type: 'asset',
          fileName: `${slug}/index.html`,
          source: withPageMeta(index.source, `${title} · Labs`, summary),
        })
      }
      this.emitFile({ type: 'asset', fileName: '404.html', source: index.source })
    },
  }
}

/** Replaces the title and description tags in index.html with an experiment's own. */
function withPageMeta(html: string, title: string, description: string): string {
  const tags: [RegExp, string][] = [
    [/(<title>)[^<]*(<\/title>)/, title],
    [/(<meta property="og:title" content=")[^"]*(")/, title],
    [/(<meta name="description" content=")[^"]*(")/, description],
    [/(<meta property="og:description" content=")[^"]*(")/, description],
  ]
  for (const [pattern, value] of tags) {
    if (!pattern.test(html)) throw new Error(`index.html needs a tag matching ${pattern}`)
    html = html.replace(pattern, (_match, start: string, end: string) => start + escapeHtml(value) + end)
  }
  return html
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
