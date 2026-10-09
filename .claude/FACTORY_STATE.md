# Factory State

The checkpoint for autonomous Labs batches. A new session must read `CLAUDE.md`, `FACTORY_CONSTITUTION.md`, and this file, then check `git status` and `git log`, before acting. Never redo completed work. Update this file after every milestone (idea chosen, built, tested, shipped, dropped).

## Batch

- **Batch:** 01
- **Goal:** ship experiments #002 through #015, one at a time, each verified in production. Then stop and give the owner one batch report (format below). Do not start #016 without explicit owner authorization.
- **Authority:** the owner authorized committing, pushing to `main`, deploying, and verifying #002–#015 without asking, as long as each experiment meets the Constitution and the QA checklist below. Don't ask the owner to choose, approve, or test anything. Escalate only if the whole batch is blocked. Reject ideas that would need credentials, payment, a rule exception, or new infrastructure.
- **Started:** 2026-10-09

## Position

- **Last shipped:** #005 CSV Checkup (`csv-checkup`), 2026-10-09 (pushing now; verify production if a session resumes here)
- **Current experiment:** none (choose #006)
- **Stage:** #005 committed and pushed; production check pending
- **Next action:** confirm the Actions run for #005 succeeded and labs.eugeneyip.net/csv-checkup/ works, then choose #006. Avoid files and analysis right after #005; consider a creator/speaker tool, education/print, a playful useful idea, events or social, or shopping on phones.

## Shipped

| # | Name | Slug | Category | Interaction model | Audience | Shipped |
|---|------|------|----------|-------------------|----------|---------|
| 001 | Trip Board | trip-board | Travel / information organization | Saved list, paste-to-add | Self-planning travelers | 2026-10-08 |
| 002 | Photo Scrub | photo-scrub | Privacy / browser file tool | Drop files in, clean files out | Anyone sharing photos (marketplaces, forums) | 2026-10-09 |
| 003 | Fair Share | fair-share | Group money / expense splitting | Ledger form; the link is the document | Friend groups, roommates | 2026-10-09 |
| 004 | Clean Paste | clean-paste | Language / text repair | Paste in, live clean text out | Students, researchers, office workers | 2026-10-09 |
| 005 | CSV Checkup | csv-checkup | Data tools | Drop a file, read a report | Analysts, ops and small-business staff | 2026-10-09 |

## Category distribution

Limits across #001–#015: at most 3 per product category, at most 2 primarily travel, no two consecutive experiments solving the same type of problem. By #010, at least 6 distinct problem domains.

- Travel / information organization: 1 (travel cap 2)
- Privacy / browser file tools: 1
- Group money: 1
- Language / text: 1
- Data tools: 1

## Dropped ideas

None yet. A dropped idea does not use up a number.

## Candidate pool

Ideas only, not commitments. Pick each experiment based on what has shipped. Remove used or rejected ideas.

- Teleprompter with script timing (creators, speakers)
- Wedding/event seating planner with constraints (events, drag and drop)
- Secret Santa draw with a private link per person (social, seasonal)
- Grocery unit-price comparer for phones (shopping)
- Printable paper generator: dot grid, isometric, music staff (print, education)
- Golden hour / sun times for photographers (outdoors, visualization)
- Subtitle (SRT/VTT) timing fixer (video creators, files)
- Weighted decision matrix with sensitivity check (decisions)
- Chord-sheet transposer (music)
- Tournament bracket / round-robin scheduler (events, sports)
- Timeline maker from a pasted list of dates (visualization)

Rejected on sight (avoid list): todo lists, habit trackers, Pomodoro timers, QR generators, URL shorteners, quote apps, aimless dashboards, clones of excellent free tools, "AI for X".

## Unresolved issues

None.

## Procedure per experiment

1. Review what has shipped and the category limits above.
2. Generate several candidates, reject weak, repetitive, or infrastructure-heavy ones, and pick the strongest. Record the choice here.
3. Build the smallest complete product in `src/experiments/<slug>/`. Pure logic goes in `model.ts`.
4. Test proportionally (checklist below). Fix meaningful defects. After two failed repair passes, drop the idea, record why, and delete its unfinished files.
5. `npm run build` must pass.
6. Registry entry (shipped date = deploy day) and PRODUCT_LOG entry (What, Problem it tests, Scope decisions, Limitations, Revisit if).
7. Commit and push to `main`. Watch the Actions run (`gh run watch <id> --repo EugeneYip/labs --exit-status`).
8. Verify production: the direct URL returns 200 with the right title, the app works, the console is clean, and the homepage lists the experiment.
9. Update this file, then move on.

## QA checklist

Where applicable: core flow; persistence or file handling; several edge cases; invalid input; phone and desktop layouts; light and dark mode; keyboard use and visible focus; console clean; production build; GitHub Pages-style direct URL (`pages` launch config serves `dist/` without a fallback page); production smoke test. Go deeper only where the experiment's behavior warrants it.

## Tools and environment notes

- **Screenshots:** `node .claude/qa/shot.mjs plan.json` drives headless Brave with a throwaway profile (gitignored helper; see its header for the plan format). The in-app browser pane can be tiny, so use this for visual checks. First launch can take about a minute.
- **Pure-logic tests:** write a throwaway script in `.claude/qa/` and run it with `node --experimental-strip-types --no-warnings <file>.ts` (imports `src/.../model.ts` directly; no test dependencies).
- **Dev server:** `preview_start` with the `dev` config (port 5173). Production check: `npm run build`, then the `pages` config (port 4174).
- **GitHub:** `gh` is logged in as EugeneYip. Pages deploys from Actions; the custom domain is in the Pages settings.
- Storage keys must be `labs:<slug>` (Constitution, amended 2026-10-09 with owner authorization).

## Batch report format (after #015)

Experiments shipped; experiments dropped; categories explored; most promising; weakest; infrastructure improvements; recurring product patterns; any experiment worth promoting outside Labs; recommendation on a second batch.
