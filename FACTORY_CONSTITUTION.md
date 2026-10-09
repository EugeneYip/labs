# Factory Constitution

The operating rules for Labs. Every working session, human or AI, follows them. Only the owner changes them, by editing this file.

## 1. Purpose

Labs is a public software laboratory at https://labs.eugeneyip.net. It builds and ships small web experiments, generally one at a time. The homepage is the index of everything that has shipped.

## 2. Hard limits

These apply to the site and to every experiment, without exception.

1. **Static only.** Everything is built ahead of time and served by GitHub Pages. No backend, no servers or serverless functions, no database.
2. **No accounts.** No authentication or sign-in of any kind.
3. **Free.** No paid services, plans, or tools.
4. **No secrets.** No API keys, tokens, or passwords anywhere. The repository is public, so anything committed is published.
5. **No keyed services.** An experiment may only call outside services that need no account, key, or payment.
6. **Desktop and mobile.** Everything works on a phone and on a desktop.

If an idea doesn't fit these limits, change the idea, not the limits.

## 3. Experiments

- **One at a time.** Ship or drop the current experiment before starting the next.
- **Small.** One idea, built quickly. Cut scope rather than delay.
- **Numbered.** #001, #002, and so on, in the order they ship. A number is never reused or changed.
- **Permanent addresses.** Each experiment lives at `labs.eugeneyip.net/<slug>/`. Once shipped, its slug never changes.
- **Self-contained.** An experiment's code lives in `src/experiments/<slug>/`. It may use the shared components in `src/components/` but never imports from another experiment.
- **Honest.** The index lists only real, working experiments: no placeholders, mock-ups, or "coming soon" entries. A summary says plainly what the experiment does.
- **Archived, not deleted.** When an experiment is no longer maintained, set its status to `archived`. It stays online, so links keep working.
- **Data stays with the visitor.** If an experiment needs to remember anything, it stores it in the visitor's own browser, for example in `localStorage`.
- **Namespaced storage.** All experiments share labs.eugeneyip.net, so any browser storage an experiment uses (localStorage keys, IndexedDB databases, and the like) is named after its permanent slug: `labs:<slug>`, or `labs:<slug>:<name>` for more than one.

## 4. Shipping an experiment

1. **Number:** the highest number in `src/experiments/registry.ts`, plus one.
2. **Slug:** short, lowercase, words joined by hyphens, such as `color-mixer`. `assets` is reserved.
3. **Code:** create `src/experiments/<slug>/index.tsx` with a default-exported React component. Keep all of the experiment's files in that folder.
4. **Register:** add an entry to `src/experiments/registry.ts`.
5. **Check:** run `npm run dev`, open `http://localhost:5173/<slug>/`, and try it at phone and desktop widths, in light and dark mode.
6. **Build:** run `npm run build`. It must pass. It also catches registry mistakes, such as a duplicate number or a missing folder.
7. **Log:** add an entry to `PRODUCT_LOG.md`.
8. **Ship:** commit and push to `main`. GitHub Actions publishes the site within a few minutes.

The page frame is automatic. `ExperimentShell` adds a slim header with the experiment's number and title, which is the page's `<h1>`, so the experiment's own headings start at `<h2>`. Everything below the header belongs to the experiment, including its padding and layout. Give the experiment's root element `flex-1` to fill the rest of the screen.

## 5. Engineering

- **Stack:** Vite, React, TypeScript, and Tailwind CSS. Don't add frameworks, servers, or build infrastructure.
- **Few dependencies.** Prefer browser features and plain code. Add a package only when it saves real work, and only free, open-source ones.
- **Shared look.** Use the Labs colors (`paper`, `ink`, `dim`, `rule`, `signal`) and system fonts, unless an experiment needs a look of its own.
- **Accessible.** Semantic HTML, usable with a keyboard, readable contrast.
- **`main` is always deployable.** Never push a failing build.

## 6. Changing these rules

The owner amends this document. If a rule gets in the way of good work, propose an amendment instead of quietly breaking it.
