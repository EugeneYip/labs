# Labs

Small software experiments, built and shipped rapidly.

**Live:** https://labs.eugeneyip.net

Labs is a public software laboratory. Each experiment is a small, self-contained web app, and the homepage is the index of everything that has shipped. The rules for building and shipping experiments are in [FACTORY_CONSTITUTION.md](FACTORY_CONSTITUTION.md), and the history is in [PRODUCT_LOG.md](PRODUCT_LOG.md).

## How it works

- A static site built with Vite, React, TypeScript, and Tailwind CSS. No backend, accounts, database, or paid services.
- Every push to `main` builds the site and publishes it to GitHub Pages ([deploy.yml](.github/workflows/deploy.yml)).
- Once a day, a check reads the live site and the weather service two experiments use, and fails loudly if a page, a file, the HTTPS certificate, or the service has broken ([daily-check.yml](.github/workflows/daily-check.yml)). It reads public pages only; nothing about visitors is collected.
- The build gives every experiment its own page at `/<slug>/`, so direct links work and link previews show the experiment's own title and summary.
- Pages already opened keep working offline, through a small service worker ([public/sw.js](public/sw.js)).
- Feedback and ideas are welcome as [issues](https://github.com/EugeneYip/labs/issues). They're public, so please leave out personal details.

## Project layout

```
src/
  experiments/
    registry.ts          The typed list of experiments. Add new ones here.
    <slug>/index.tsx     One folder per experiment.
  components/
    ExperimentCard.tsx   An experiment's card in the homepage index.
    ExperimentShell.tsx  The frame around every experiment page.
    useOtherTabs.ts      Saving, so two open tabs don't erase each other's work.
    NotSaving.tsx        The notice shown when the browser won't save.
    feedback.ts          The feedback link to a new GitHub issue.
  Home.tsx               The homepage.
  App.tsx                Picks the page to show from the address.
  main.tsx               Starts the app, and the service worker in the built site.
  index.css              Tailwind and the Labs colors.
public/
  CNAME                  The custom domain.
  sw.js                  The service worker that keeps opened pages working offline.
.github/
  workflows/             deploy.yml publishes the site; daily-check.yml checks it each day.
  scripts/daily-check.ts The daily check itself.
vite.config.ts           Build setup: the per-experiment pages, sitemap.xml, and robots.txt.
```

## Adding an experiment

Follow [section 4 of the constitution](FACTORY_CONSTITUTION.md#4-shipping-an-experiment). In short: create `src/experiments/<slug>/index.tsx`, add an entry to `src/experiments/registry.ts`, run `npm run build`, log it in `PRODUCT_LOG.md`, and push to `main`.

## Working locally

Requires Node.js 20.19+ or 22.12+.

```bash
npm install       # once, to install dependencies
npm run dev       # local server at http://localhost:5173
npm run build     # type-check and build into dist/
npm run preview   # serve the built site locally
```

## Deployment and domain

GitHub Pages deploys from GitHub Actions. The custom domain, `labs.eugeneyip.net`, is saved in the repository's Pages settings, which deployments never change, so it persists across deploys. `public/CNAME` records it in the code too. In DNS, `labs.eugeneyip.net` is a CNAME record pointing to `eugeneyip.github.io`.
