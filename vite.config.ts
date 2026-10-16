import { existsSync, readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { experiments } from './src/experiments/registry.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), experimentPages()],
  // The largest file is the PDF reader's worker (1.3 MB), which only Ballooned Drawing loads, and only when a drawing
  // is opened; every page's own code stays small.
  build: { chunkSizeWarningLimit: 1400 },
})

/**
 * GitHub Pages only serves files that exist, so for each registered experiment
 * this writes <slug>/index.html: a copy of the built index.html carrying that
 * experiment's title, summary, and address. Direct links then load, link
 * previews show the right text, and search engines know /<slug>/ is the page's
 * one address (it's also reachable as /<slug>/index.html). It also writes
 * 404.html so unknown addresses show the app's "not found" page, and
 * sitemap.xml and robots.txt listing every page. Before building, it checks
 * the registry for mistakes.
 */
function experimentPages(): Plugin {
  // The site's address comes from the custom domain GitHub Pages serves it on.
  const site = `https://${readFileSync('public/CNAME', 'utf8').trim()}`
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
      const template = index.source
      for (const { slug, title, summary } of experiments) {
        this.emitFile({
          type: 'asset',
          fileName: `${slug}/index.html`,
          source: withAddress(withPageMeta(template, `${title} · Labs`, summary), `${site}/${slug}/`),
        })
      }
      index.source = withAddress(template, `${site}/`)
      // A page that isn't there has no address of its own.
      this.emitFile({ type: 'asset', fileName: '404.html', source: template })
      const pages = [`${site}/`, ...experiments.map(({ slug }) => `${site}/${slug}/`)]
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`,
      })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n` })
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

/**
 * Adds the page's canonical address and its link-preview address. They're added here, not written in
 * index.html, because Vite would try to bundle a <link href> there as a file.
 */
function withAddress(html: string, url: string): string {
  const at = html.indexOf('</title>')
  if (at < 0) throw new Error('index.html needs a <title>')
  const tags = `\n    <link rel="canonical" href="${escapeHtml(url)}" />\n    <meta property="og:url" content="${escapeHtml(url)}" />`
  return html.slice(0, at + '</title>'.length) + tags + html.slice(at + '</title>'.length)
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
