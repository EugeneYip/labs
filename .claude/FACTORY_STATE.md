# Factory State

The checkpoint for autonomous Labs batches. A new session must read `CLAUDE.md`, `FACTORY_CONSTITUTION.md`, and this file, then check `git status` and `git log`, before acting. Never redo completed work. Update this file after every milestone (idea chosen, built, tested, shipped, dropped).

## Batch

- **Batch:** 01
- **Goal:** ship experiments #002 through #015, one at a time, each verified in production. Then stop and give the owner one batch report (format below). Do not start #016 without explicit owner authorization.
- **Authority:** the owner authorized committing, pushing to `main`, deploying, and verifying #002–#015 without asking, as long as each experiment meets the Constitution and the QA checklist below. Don't ask the owner to choose, approve, or test anything. Escalate only if the whole batch is blocked. Reject ideas that would need credentials, payment, a rule exception, or new infrastructure.
- **Started:** 2026-10-09

## Position

- **Last shipped:** #007 Numbers by Ear (`numbers-by-ear`), 2026-10-09, verified in production (commit b33e724)
- **Current experiment:** #008 Serve Time (`serve-time`): plan a meal backward from serving time. Dishes have ordered steps (what, duration, optional oven temperature); it computes when to start each step, adds preheat cues, warns when the oven is needed at different temperatures at once (1 or 2 ovens), and has a cook mode with a live now/next countdown, beeps, screen wake lock, and "push dinner back" that only moves steps not yet started. Printable schedule. Plan kept in localStorage `labs:serve-time`.
- **Why this one:** new domain (cooking/home), audience (home cooks hosting), and interaction model (plan backward from a deadline, then a live countdown). Research: backward multi-dish planners are mostly iPad/iPhone apps (Chef's Multi-Dish Timer, Cooking Time Planner with paid Pro), a Paperform template, and one new web tool (Mise, Sept 2026, recipe parsing); oven capacity is the noted gap. Rejected: printable paper (Gridzzly is excellent and free), pickleball round-robin generators (many free ones), tape-measure calculator (common).
- **Stage:** built and tested (model 10/10; planner edits, clash, units, undo in the pane; cook mode with a simulated clock: cues, push back, waiting, serve; screenshots phone/desktop, light/dark, print; keyboard via real keys); shipping
- **Next action:** commit "Add Experiment #008: Serve Time", push, watch the Actions run, smoke-test production, then mark verified and choose #009.

## Shipped

| # | Name | Slug | Category | Interaction model | Audience | Shipped |
|---|------|------|----------|-------------------|----------|---------|
| 001 | Trip Board | trip-board | Travel / information organization | Saved list, paste-to-add | Self-planning travelers | 2026-10-08 |
| 002 | Photo Scrub | photo-scrub | Privacy / browser file tool | Drop files in, clean files out | Anyone sharing photos (marketplaces, forums) | 2026-10-09 |
| 003 | Fair Share | fair-share | Group money / expense splitting | Ledger form; the link is the document | Friend groups, roommates | 2026-10-09 |
| 004 | Clean Paste | clean-paste | Language / text repair | Paste in, live clean text out | Students, researchers, office workers | 2026-10-09 |
| 005 | CSV Checkup | csv-checkup | Data tools | Drop a file, read a report | Analysts, ops and small-business staff | 2026-10-09 |
| 006 | Secret Santa | secret-santa | Social / events (gift exchange) | Private per-person links, tap to reveal | Families, offices, friend groups | 2026-10-09 |
| 007 | Numbers by Ear | numbers-by-ear | Language learning | Listen, type, check loop (speech synthesis) | Language learners, travelers, expats | 2026-10-09 |
| 008 | Serve Time | serve-time | Cooking / home | Plan backward from a deadline, then a live countdown | Home cooks hosting meals | 2026-10-09 |

## Category distribution

Limits across #001–#015: at most 3 per product category, at most 2 primarily travel, no two consecutive experiments solving the same type of problem. By #010, at least 6 distinct problem domains.

- Travel / information organization: 1 (travel cap 2)
- Privacy / browser file tools: 1
- Group money: 1
- Language / text: 1
- Data tools: 1
- Social / events: 1
- Language learning: 1 (shares the language family with #004, which counts as 2 if grouped)
- Cooking / home: 1

## Dropped ideas

None yet. A dropped idea does not use up a number.

## Candidate pool

Ideas only, not commitments. Pick each experiment based on what has shipped. Remove used or rejected ideas.

- Teleprompter with script timing (creators, speakers)
- Round-robin doubles scheduler for clubs: everyone partners with someone new (sports)
- Tape-measure calculator: feet, inches, and fractions (DIY)
- Wedding/event seating planner with constraints (events, drag and drop)
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

- **Screenshots:** `node .claude/qa/shot.mjs plan.json` drives headless Brave with a throwaway profile (gitignored helper; see its header for the plan format). The in-app browser pane can be tiny, so use this for visual checks. First launch can take about a minute. Plans can stub browser APIs before page scripts run (`initScript`) and send real key presses (`keys`) for keyboard and focus checks. Tab presses in the in-app pane don't reliably move focus, so test keyboard use with `keys`.
- **Helper options added in #008:** `print: true` emulates print media; `preScript` sets up state before `keys`. For time-dependent pages, an `initScript` that replaces `Date.now` with a fixed clock (and writes localStorage) gives stable screenshots.
- **In-app pane quirk:** `Math.random` appears seeded the same on each load there (the first number repeated across reloads). Not a product bug; headless Brave varies normally.
- **Pure-logic tests:** write a throwaway script in `.claude/qa/` and run it with `node --experimental-strip-types --no-warnings <file>.ts` (imports `src/.../model.ts` directly; no test dependencies).
- **Dev server:** `preview_start` with the `dev` config (port 5173). Production check: `npm run build`, then the `pages` config (port 4174).
- **GitHub:** `gh` is logged in as EugeneYip. Pages deploys from Actions; the custom domain is in the Pages settings.
- Storage keys must be `labs:<slug>` (Constitution, amended 2026-10-09 with owner authorization).

## Batch report format (after #015)

Experiments shipped; experiments dropped; categories explored; most promising; weakest; infrastructure improvements; recurring product patterns; any experiment worth promoting outside Labs; recommendation on a second batch.
