# Factory State

The checkpoint for autonomous Labs batches. A new session must read `CLAUDE.md`, `FACTORY_CONSTITUTION.md`, and this file, then check `git status` and `git log`, before acting. Never redo completed work. Update this file after every milestone (idea chosen, built, tested, shipped, dropped).

## Batch

- **Batch:** 01
- **Goal:** ship experiments #002 through #015, one at a time, each verified in production. Then stop and give the owner one batch report (format below). Do not start #016 without explicit owner authorization.
- **Authority:** the owner authorized committing, pushing to `main`, deploying, and verifying #002–#015 without asking, as long as each experiment meets the Constitution and the QA checklist below. Don't ask the owner to choose, approve, or test anything. Escalate only if the whole batch is blocked. Reject ideas that would need credentials, payment, a rule exception, or new infrastructure.
- **Started:** 2026-10-09

## Position

- **Last shipped:** #014 Playing Time (`playing-time`), 2026-10-09, verified in production (commit a0e57d7)
- **Current experiment:** #015 Back Row (`back-row`), the last of the batch: see a slide, poster, or sign as the back row would. Image from a file, paste, drop, or a generated sample slide; screen or poster width; viewing distance; eyesight (20/20, 20/40, 20/70). It blurs the image by the detail the viewer can resolve (minimum angle of resolution times distance, mapped into image pixels), can show it at its true apparent size, and gives readable and comfortable letter heights plus the matching slide font size in points. Settings only in localStorage `labs:back-row`; the image is never stored or sent.
- **Why this one:** new domain (accessibility and presenting), audience (presenters, teachers, sign makers), and interaction (perceptual simulation of an image). Research: no general web simulator; the closest is Eclipse ACTF's ODF-only desktop preview, plus a screen maker's physical eye-test chart. Rejected this round: hike turnaround, caffeine cutoff, tempo-ramp metronome (all have free web tools).
- **Stage:** built and tested (model 5/5 against eye-chart and slide-size references; pane flows: bad file, paste, eyesight, units, distance, saving; screenshots phone/desktop, light/dark, poster and true size); shipping
- **Next action:** commit "Add Experiment #015: Back Row", push, watch the Actions run, smoke-test production, mark verified, then write the batch report and stop (no #016 without the owner).

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
| 009 | Tear-Off Flyer | tear-off-flyer | Community / print | Form to live print layout (paper output) | Neighbors, tutors, people posting notices | 2026-10-09 |
| 010 | Gallery Wall | gallery-wall | Home / decorating (counts with Cooking / home: 2) | Physical layout calculator with a to-scale drawing | Renters and homeowners hanging art | 2026-10-09 |
| 011 | Line Dry | line-dry | Weather / household (home-ish: 3 of 3) | Live keyless API to a recommendation with an hourly chart | Households drying washing outside | 2026-10-09 |
| 012 | Glance | glance | Games / daily puzzle | Flash, then guess; shareable daily score | Daily puzzle players | 2026-10-09 |
| 013 | In Tune | in-tune | Music | Real-time microphone pitch feedback | Choir singers, voice students | 2026-10-09 |
| 014 | Playing Time | playing-time | Sports / coaching | Roster to a generated fair schedule with sideline calls; print | Volunteer youth coaches | 2026-10-09 |
| 015 | Back Row | back-row | Accessibility / presenting | Perceptual simulation of an image, with sizing advice | Presenters, teachers, sign makers | 2026-10-09 |

## Category distribution

Limits across #001–#015: at most 3 per product category, at most 2 primarily travel, no two consecutive experiments solving the same type of problem. By #010, at least 6 distinct problem domains.

- Travel / information organization: 1 (travel cap 2)
- Privacy / browser file tools: 1
- Group money: 1
- Language / text: 1
- Data tools: 1
- Social / events: 1
- Language learning: 1 (shares the language family with #004, which counts as 2 if grouped)
- Cooking / home: 1, plus Home / decorating: 1 (2 if grouped as "home"; cap 3)
- Community / print: 1
- Weather / household: 1 (counted toward "home" too, which is now at its cap of 3)
- Games: 1
- Music: 1
- Sports / coaching: 1
- Accessibility / presenting: 1

## Dropped ideas

None yet. A dropped idea does not use up a number.

## Candidate pool

Ideas only, not commitments. Pick each experiment based on what has shipped. Remove used or rejected ideas.

- Teleprompter with script timing (creators, speakers)
- Round-robin doubles scheduler for clubs: everyone partners with someone new (sports)
- Tent cards / desk name plates from a pasted list of names (events, classrooms, print)
- Camera exposure simulator for beginners: aperture, shutter, ISO on a drawn scene (education, photography)
- Analog clock reading practice for kids, drag the hands (kids education)
- Caffeine-at-bedtime estimator with an adjustable half-life (wellness)
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
- **Helper option added in #009:** `pdf: true` saves a real print (`Page.printToPDF`, CSS page size, no background graphics) next to the screenshot; the Read tool can open the PDF to check pages and layout.
- **Fixtures:** `.claude/qa/fixtures/` holds saved real API answers (London, Madrid forecasts, London place search) for stable screenshots; stub `fetch` and `Date.now` in an `initScript`.
- **Microphone in tests:** headless Brave's `getUserMedia` hangs even with fake-device flags and granted permission. Instead, replace `navigator.mediaDevices.getUserMedia` in an `initScript` with a stream from an oscillator through `createMediaStreamDestination()`; everything after the stream is the real code.
- **Lesson from #012:** `requestAnimationFrame` stops entirely in background tabs (the in-app pane counts as one), so anything that must end on time uses a timer.
- **Lesson from #009:** `img.decode()` can wait forever while a tab is in the background (seen in the in-app pane). Use `onload`/`onerror` for images the user picks.
- **Helper options added in #008:** `print: true` emulates print media; `preScript` sets up state before `keys`. For time-dependent pages, an `initScript` that replaces `Date.now` with a fixed clock (and writes localStorage) gives stable screenshots.
- **In-app pane quirk:** `Math.random` appears seeded the same on each load there (the first number repeated across reloads). Not a product bug; headless Brave varies normally.
- **Pure-logic tests:** write a throwaway script in `.claude/qa/` and run it with `node --experimental-strip-types --no-warnings <file>.ts` (imports `src/.../model.ts` directly; no test dependencies).
- **Dev server:** `preview_start` with the `dev` config (port 5173). Production check: `npm run build`, then the `pages` config (port 4174).
- **GitHub:** `gh` is logged in as EugeneYip. Pages deploys from Actions; the custom domain is in the Pages settings.
- Storage keys must be `labs:<slug>` (Constitution, amended 2026-10-09 with owner authorization).

## Batch report format (after #015)

Experiments shipped; experiments dropped; categories explored; most promising; weakest; infrastructure improvements; recurring product patterns; any experiment worth promoting outside Labs; recommendation on a second batch.
