# Labs

A public lab of small static web experiments, live at https://labs.eugeneyip.net. Do the technical work (installing, building, checking in the browser, committing) yourself rather than asking the owner to run terminal commands.

@FACTORY_CONSTITUTION.md

## Quick reference

- `npm run dev`: local server on port 5173 (the "dev" entry in `.claude/launch.json`).
- `npm run build`: type-check and production build. Must pass before every push.
- Pushing to `main` deploys automatically through GitHub Actions.
- New experiment: `src/experiments/<slug>/index.tsx` plus an entry in `src/experiments/registry.ts`, then an entry in `PRODUCT_LOG.md`.
