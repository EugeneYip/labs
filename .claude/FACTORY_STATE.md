# Factory State

The checkpoint for autonomous Labs batches. A new session must read `CLAUDE.md`, `FACTORY_CONSTITUTION.md`, and this file, then check `git status` and `git log`, before acting. Never redo completed work. Update this file after every milestone (idea chosen, built, tested, shipped, dropped).

## Batch

- **Batch:** 02 (Batch 01, #002–#015, finished 2026-10-09; its report was given to the owner).
- **Goal:** ship experiments #016 through #025, one at a time, each verified in production. Then stop and give the owner one Batch 02 report (format at the end of this file). Do not start #026 without a new batch authorization.
- **Authority:** the owner authorized researching, choosing, building, testing, committing, pushing to `main`, deploying, and verifying #016–#025 without routine approval, as long as each experiment meets the Constitution. Lack of analytics or user feedback on earlier experiments is not a blocker: don't pause for it and don't ask the owner to test anything. Reject ideas that would need credentials, payment, a rule exception, or new infrastructure.
- **Earlier experiments (#001–#015):** shipped products. Don't redesign them, add speculative features, or rewrite them. Fix one only if current work exposes a real regression or serious defect.
- **Started:** 2026-10-09
- **If interrupted:** a fresh session reads this file, checks `git status` and `git log`, and continues from "Next action" without waiting for the owner. Unfinished experiment files are either finished or deleted, never pushed half-done.

## Batch 02 selection standard

More selective than Batch 01. For each experiment: generate several candidates, check briefly whether strong free alternatives already solve the problem, reject crowded, trivial, repetitive, or poorly differentiated ideas, and pick the strongest. Prefer problems where a static, local-first browser tool has a real advantage (privacy, no account, works offline, browser-native processing, direct manipulation, replacing an awkward manual workflow) for a narrow audience with a concrete recurring problem. Explore new problem spaces: don't repeat the core concept of any of #001–#015. A similar audience is fine only when the problem and the interaction model are clearly different. No two consecutive experiments solve the same type of problem. Don't polish past what users would notice: ship the next strong experiment instead.

## Position

- **Last shipped:** #016 Fluency Check (`fluency-check`), 2026-10-09, verified in production (commit 96a9048): 200 with the right title, check, save, and log work live, console clean, homepage shows 16 shipped.
- **Current experiment:** #017 Frost Dates (`frost-dates`), gardening: last spring and first autumn frost odds for any place in the world, from 30 years of daily lows in Open-Meteo's historical archive (free, no key, CC BY 4.0). Shows typical (1 in 2) and cautious (1 in 10) dates, the frost-free season, a 30-year chart of every frost night, and a planting calendar for common crops.
- **Stage:** built and tested; committing and pushing.
- **Next action:** push, watch the Actions run, verify https://labs.eugeneyip.net/frost-dates/ in production with one live archive request (each 30-year request counts as roughly 800 of the free tier's 10,000 daily calls per connection, so keep live tests few). Then pick #018: not weather or climate, and not place search.

## Batch 02 research notes

Checked 2026-10-09. Keep these so later picks don't repeat the research.

- **Fluency check (chosen for #016):** no free browser tool combines a timer, tap-to-mark errors, and automatic WCPM. Reader Meter is a $4 iPad app, Readingfluency.app is paid beyond a free tier, publisher tools need a school license, and the free Sheets add-on only does the arithmetic. Teachers still use a stopwatch and a paper copy.
- **Ranked-choice vote counter (medium):** RankedVote's free tier needs an account and allows one contest and 100 voters. Its CSV importer runs locally but needs its template. OpenTally is free and local but wants BLT files, pyrcv.org reads Google Forms CSVs, and OpaVote's free count is capped at 25 voters. Differentiate only with tap-to-enter paper ballots and forgiving CSV import, or skip it.
- **Line rehearsal for actors (strong, later):** the options are iPhone and iPad apps, mostly freemium (HitCue, MyLines, Cue-to-Cue, Acting Pal). The one web tool found handles only audition snippets.
- **Worldwide frost dates (chosen for #017):** every lookup found covers only the US and Canada. A 30-year daily request to Open-Meteo's archive takes under a second (about 195 KB). Checked against NOAA-based dates (30% risk, 32°F, 1991–2020) for Boston, Denver, Minneapolis, Atlanta, and Portland, the reanalysis at 0°C lands within 0–8 days, except downtown Portland: 19 days later in spring and 12 earlier in autumn, the cautious direction. ERA5-Land and the default model gave the same dates.
- **Video technique analysis (candidate):** Coach's Eye shut down. Kinovea is Windows-only. The rest are apps, often golf-only or paid.
- **Market stall till (candidate):** the offline options are iPhone apps. Web registers exist but don't promise offline use or no account.
- **Rotating shift calendar (rejected):** ToolGrit and Teambridge already offer free, no-account pattern calendars, and ToolGrit exports .ics.

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
| 016 | Fluency Check | fluency-check | Education / reading assessment | Live tap-to-mark while listening, on a timer; print and on-device log | Teachers, tutors, reading specialists | 2026-10-09 |
| 017 | Frost Dates | frost-dates | Gardening / climate | Place to 30-year climate odds, a season-by-season chart, and a planting calendar | Gardeners worldwide, especially outside North America | 2026-10-09 |

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

None dropped after building: every experiment started was shipped. A dropped idea does not use up a number.

Rejected at the idea stage (no code written), mostly because a good free tool already exists: passport photos (UK rules forbid cropped or edited photos; free in-browser makers exist), weighted decision matrix, timeline maker, camera exposure simulator, classroom seating chart, unit-price comparer, printable paper, pickleball round robin, tape-measure calculator, hike turnaround time, caffeine cutoff, tempo-ramp metronome.

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
- **Lesson from #016:** typing a `\u` escape (like `\u00AD`) in a tool call's text writes the literal invisible character into the file. Write such escapes from Python with `chr(92)` and always run the invisible-character scan over `src/` before committing.
- **Fixtures added in #017:** `frost-boston.json`, `frost-canberra.json`, `frost-seville.json` (1995-01-01 to 2026-10-07 daily lows), plus 1991–2020 copies for Boston, Denver, and Portland. Seed settings before page scripts with an `initScript` guarded by a sessionStorage flag: the helper's `storage` option races a lazily loaded experiment that saves its defaults on mount.
- **zsh gotcha:** never name a shell loop variable `path`; zsh ties it to `PATH`, so commands like curl stop being found.
- Storage keys must be `labs:<slug>` (Constitution, amended 2026-10-09 with owner authorization).

## Batch report formats

- **Batch 01 (given 2026-10-09):** experiments shipped; experiments dropped; categories explored; most promising; weakest; infrastructure improvements; recurring product patterns; any experiment worth promoting outside Labs; recommendation on a second batch.
- **Batch 02 (after #025):** a concise report covering #016–#025; rejected ideas; category coverage; strongest experiments; weakest experiments; recurring opportunities; any products now worth promoting; what the first 25 Labs experiments collectively suggest; recommendation for Batch 03.
