# Labs

A public lab of small static web experiments, live at https://labs.eugeneyip.net. Do the technical work (installing, building, checking in the browser, committing) yourself rather than asking the owner to run terminal commands.

@FACTORY_CONSTITUTION.md

If `.claude/FACTORY_STATE.md` exists, an autonomous batch may be in progress: read it, check `git status`, and continue from its recorded next action before doing anything else.

## Quick reference

- `npm run dev`: local server on port 5173 (the "dev" entry in `.claude/launch.json`).
- `npm run build`: type-check and production build. Must pass before every push.
- Pushing to `main` deploys automatically through GitHub Actions.
- New experiment: `src/experiments/<slug>/index.tsx` plus an entry in `src/experiments/registry.ts` (including the homepage `category` it's listed under), then an entry in `PRODUCT_LOG.md`.
- Offline support: `public/sw.js` keeps the site's own pages and files once opened, so experiments work without a connection. Pages are always fetched fresh when online, and outside services and personal data are never cached. It's registered only in the built site (`src/main.tsx`). To turn it off for everyone, publish a `sw.js` that deletes its caches and unregisters itself on activate.
