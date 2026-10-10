# Factory State

The checkpoint for autonomous Labs batches. A new session must read `CLAUDE.md`, `FACTORY_CONSTITUTION.md`, and this file, then check `git status` and `git log`, before acting. Never redo completed work. Update this file after every milestone (idea chosen, built, tested, shipped, dropped).

## Batch

- **Batch:** 04, Tier B Hardening, in progress (started 2026-10-10). Batches 01, 02, and 03 are complete, with reports given. Batch 03's notes stay below for reference.
- **Goal:** no new experiments. Deeply audit and harden the seven tier B experiments (#002 Photo Scrub, #017 Frost Dates, #024 Ranked Choice Count, #003 Fair Share, #018 Off Book, #005 CSV Checkup, #023 Discussion Map), plus targeted risk audits of #021 Family Stories (irreplaceable recordings) and #019 Form Check (real-world video compatibility). Fix genuine defects, verify production, keep this file and `.claude/PORTFOLIO_REVIEW.md` current, then stop and report (format at the end of this file).
- **Authority:** inspect, research, test, fix genuine defects, commit, push to `main`, deploy, and verify production, without routine approval. Don't ask the owner to test, find users, or answer questions that research or conservative judgment can settle. Don't publish a new experiment or archive one.
- **Limits:** find real defects and misleading assumptions, not speculative features. "No change required" is fine with evidence. No redesigns or new functionality. Shared code changes only for a real defect affecting several experiments; the service worker, category filter, and feedback link are established. After each audit, append Batch 04 findings to `.claude/PORTFOLIO_REVIEW.md` without erasing the Batch 03 scores (post-audit assessments go in separately).
- **If interrupted:** read this file, check `git status` and `git log`, and continue from "Next action" without waiting for the owner.

## Batch 04 checklist

- [x] GitHub Issues checked (2026-10-10): no issues or pull requests, open or closed, so no real feedback yet. Continued without waiting.
- [x] #002 Photo Scrub: deep audit done (2026-10-10). Fixed: PNG orientation lost, dated file names leaking into clean names, AVIF wording, and what is kept is now stated. Details in Batch 04 findings.
- [x] #017 Frost Dates: deep audit done (2026-10-10). Fixed: leap-year offsets, no request timeout, and a failed search shown as "No places found". The method checks out against NOAA's framing.
- [x] #024 Ranked Choice Count: deep audit done (2026-10-10). Fixed: simultaneous quota election (a material correctness fix), the equal-surplus order, semicolon CSVs, numbered names, and the plurality tie claim. The exact variant is now stated.
- [x] #003 Fair Share: deep audit done (2026-10-10). Fixed: "fewest payments" is now exact (zero-sum circles), and a different saved copy no longer gets silently replaced.
- [ ] #018 Off Book: deep audit (messy scripts; fail understandably rather than misassign lines).
- [ ] #005 CSV Checkup: deep audit (delimiters, BOM, quoting, encodings, ragged rows, big files, types, formula text in any output).
- [ ] #023 Discussion Map: deep audit (timing and state integrity, reload, backgrounding, undo, export arithmetic, midnight, what it measures).
- [ ] #021 Family Stories: targeted risk audit (IndexedDB persistence, download and ZIP integrity, interruption, refusal, quota, long recordings, iOS storage, understanding that downloads are essential).
- [ ] #019 Form Check: targeted risk audit (orientation, variable frame rate, large and long clips, seeking, containers and codecs, unsupported files, two videos, memory, marked-frame export).
- [ ] Production verified after all changes; this file and the portfolio review current; report given.

## Batch 04 findings

- **#002 Photo Scrub (done).** Independent check (scripts kept in `.claude/qa/photo-canary/`; run `python3 make.py in`, then `node --experimental-strip-types run.ts in out`, then `python3 verify.py in out`): `make.py` builds JPEG (baseline and progressive), PNG, and WebP (lossy and lossless) files with a canary string in every metadata field. `run.ts` cleans them with `metadata.ts`, and `verify.py` (Pillow) checks that no canary survives, pixels are identical, and only orientation is left in EXIF. All passed. A browser probe (plan photo-orient) showed Chromium turns PNG by eXIf orientation but ignores it in WebP, so PNG clean copies now get a minimal eXIf (orientation only) right after IHDR, with a valid CRC (test). `dateInName` (YMD with or without a consistent separator, or DD-MM-YYYY) adds a "File name" finding, and the clean copy is named photo-clean.<ext>. 21 model tests; plan photo-2 (four files including 6000×4000, 360 px dark). A 28 MB JPEG takes 345 ms and a 76 MB PNG 41 ms.
- **#017 Frost Dates (done).** `calendarOffset(start, day)` puts season offsets on a 365-day calendar (Feb 29 = Feb 28) for the quantiles. frostFree still uses real days. A new test makes every season's frosts Apr 10 and Oct 20 (the old code gave Apr 11 for the cautious date). Interior gaps are skipped (test). Archive fetch has `AbortSignal.timeout(45 s)` (guarded for old Safari) and geocoding 15 s; a geocoding failure now shows its own message. Plan frost-4 stubs a stalled archive with a shortened timeout (an error, then Try again works), a failed geocoder, and Canberra at 360 px dark. 13 model tests. CROPS checked against common extension guidance: fine.
- **#024 Ranked Choice Count (done).** Rule text: legislation.gov.uk/ssi/2007/42/schedule/1/made (rules 46–52; quoted via fetch). `.claude/qa/rcc-reference/reference.py` is an independent count from the rules, and `diff.ts` generates 4,000 random elections (seeded), compares winners and every round's totals, and checks seat-count invariants. Run it with `node --experimental-strip-types diff.ts <dir with reference.py>`. Result: 0 mismatches in 2,801 (1,199 need a lot and are skipped). count.ts restructured: the IRV branch is unchanged in behavior. In STV, everyone ≥ quota is elected at once, zero surpluses are dropped, rule 52 is applied before transfers, and pending surpluses move largest first with `breakTie(most)`. parse.ts picks `\t`, `,`, or `;` from the first line, ignoring quoted fields, and an entered candidate name beats a count prefix. 20 model tests; plan rcc-4 (euro CSV, simultaneous quota, equal surplus).
- **#003 Fair Share (done).** `settle` = `zeroSumGroups` (subset DP: most[m] = max over members of most[m − member] + [sum(m) = 0], walked back into an order and cut at zero running sums) for ≤ 16 open balances, then greedy within each circle, sorted by amount. Test: brute force over all set partitions for 1,500 random groups, plus timing for 30 and 16 people. index.tsx: `other` = a recent entry with the same group id and a different hash, shown as a status notice with "Open that copy" (it stays for the session, even after edits). 44 model tests; plan fair-2 (notice, open that copy, broken link at 320, dark).

## Batch 03 (complete)

- **Batch:** 03, Portfolio Hardening, complete (2026-10-09). Batch 01 (#002–#015) and Batch 02 (#016–#025) are complete, with reports given.
- **Goal:** not a run of new experiments. Score all 25 experiments in `.claude/PORTFOLIO_REVIEW.md`, pick about five of the strongest by that evidence, audit them deeply, and fix real defects. Evaluate offline support (a service worker) and ship it only if safe. Review homepage discovery, explore a feedback mechanism that fits the Constitution, and build at most three new experiments (#026–#028), only if clearly worth more than hardening. Verify production, then stop and give the owner the Batch 03 report (format at the end of this file).
- **Authority:** the owner authorized inspecting and testing experiments, researching competitors and authoritative references, fixing genuine defects, improving accessibility and compatibility, making high-value shared infrastructure improvements, committing, pushing, deploying, and verifying, without routine approval, as long as the Constitution holds. Don't ask the owner to test ordinary features.
- **Limits:** no redesigns for visual consistency, no refactoring of working code for neatness, no rewrites. Fix what matters. Sensitive tools (custody, dementia care, student assessment, ranked voting, climate estimates, recordings, cash) must not imply legal, medical, educational, electoral, or professional authority they don't have, and limitations stay short rather than becoming walls of disclaimers. Never cache sensitive user content globally, and don't break GitHub Pages. Don't publish a personal email address unless one already exists in the project and is clearly meant for public contact.
- **If interrupted:** a fresh session reads this file, checks `git status` and `git log`, and continues from "Next action" without waiting for the owner.

## Batch 03 checklist

- [x] Phase 0: production smoke test of all 25 experiments: all load at 1280 px and 390 px, no overflow, no console errors (2026-10-09).
- [x] Phase 1: `.claude/PORTFOLIO_REVIEW.md` scores all 25 on the 13 criteria (risk criteria inverted, maximum 65), in tiers A to D.
- [x] Phase 2: five candidates selected (see Batch 03 selection below).
- [x] Phase 3: deep audit of each candidate (correctness, edge cases, data integrity, privacy, accessibility, compatibility, mobile, performance, misunderstanding, claims, export/import, print, API failure, refresh recovery), with domain rules checked against authoritative sources and fixes shipped.
- [x] Offline: `public/sw.js` shipped (commit 821134e). Tested locally by stopping and restarting the server: saved pages load offline, an unvisited page gets an offline notice, a URL without its trailing slash maps to the saved page, and a changed page arrives as soon as the server returns. In production, pages are controlled and saved, the no-slash redirect works, and no outside-service responses or hash/query URLs are cached.
- [x] Discovery: a category filter row on the homepage (six kinds plus All, newest first, `?for=` in the address); no Featured list, since nothing has real use yet. Each registry entry now has a `category`.
- [x] Feedback: GitHub Issues is on, Discussions off, and the project has no public email. Added a "Feedback" link (`src/components/feedback.ts`) to every experiment header and the homepage footer. It opens a new issue with the experiment in the title and a body that says feedback is public, so leave out personal details. It needs a GitHub account (accepted; revisit if the owner adds a public email or form). Also fixed overflow at 320 px in Custody Calendar and Ranked Choice Count, found by checking all 26 pages at 320 px.
- [x] New experiments (optional, at most three): decided none. Every one of the five deep audits found real defects (lost work, misleading summaries, broken links), and a 320 px sweep found two more, so another hour on the existing 25 is worth more than a #026. New experiments would also add upkeep to a portfolio that has no user signal yet. Revisit once feedback or real use arrives.
- [x] Production verified (2026-10-09, deploy of bddf947): every Batch 03 change checked live. That covers filters, Fluency Check reload recovery and CSV loading, the broken-link notice, the Day Clock live region and hint, the Secret Santa confirmation, the Playing Time messages, the bylaws note, Stall Till's advice, feedback links, and the service worker caches (no outside responses). A sweep of all 26 pages at 320 px and at 1280 px in dark mode found no overflow and no console errors. This file is updated, and the Batch 03 report has been given.

## Batch 03 selection

The five highest totals in the portfolio review, all tier A: **#016 Fluency Check (52), #020 Custody Calendar (52), #022 Day Clock (52), #006 Secret Santa (50), #014 Playing Time (50).** These scored highest on clear audiences with recurring needs, privacy or local-first advantage, and spread potential, with moderate risks. Secret Santa's differentiation was marked down after finding several free, no-email, link-based draws. The next three (Photo Scrub, Frost Dates, Ranked Choice Count, 48 each) were not added by default. Frost Dates and Ranked Choice Count still get the sensitive-wording pass, as do Family Stories and Stall Till.

## Position

- **Current:** Batch 04, Tier B Hardening (started 2026-10-10). Order: issues check, then the seven tier B audits in the listed order, then Family Stories and Form Check, then the production check and report. Batch 03 was complete on 2026-10-09; its order was Order: (1) offline service worker, since it helps Day Clock, Playing Time, Stall Till, and the other local tools, (2) deep audits of the five, (3) the sensitive-wording pass, (4) homepage discovery, (5) feedback, (6) decide on new experiments (default: none), (7) final production check and report.
- **Next action:** #018 Off Book deep audit: read `src/experiments/off-book/` (script parser), stress it with messy scripts (NAME:, NAME., standalone names, stage directions, multiline speeches, punctuation and accented names, CJK, scene headings, PDF artifacts, very long scripts), and make sure ambiguous parses fail understandably instead of misassigning lines.

## Batch 03 audits

- **#016 Fluency Check (done).** Checked against Amplify's mCLASS DIBELS 8 scoring summary (ORF table). Fixed: the guide now lists mispronunciations, words read out of order, and sounded-out-not-blended words as errors, skipped lines as one error per word, and dialect, accent, and articulation as not errors. Accuracy bands are now "a common guideline", with one line saying a check is a snapshot, not comprehension. A reload mid-check lost the run, and a re-read inflates the score, so the run is now kept in `labs:fluency-check:run`. A quick reload (15 s or less) carries the clock on. A longer gap pauses at the last moment the page was visible, or goes to "Time!" if the minute ran out. A saved, finished run is dropped after an hour. Sound unlocks again on the next tap. The CSV couldn't restore the log, and Safari's seven-day storage cap makes that real for school holidays, so "Load a CSV" now reads the app's own export back (columns by name, `;` and tab separators, decimal commas, AM/PM times, de-duplicated to the minute, with undo). It also appears as one line when the log is empty. Tests: 15 model tests, plus a browser plan (`.claude/qa/plan-fluency-5.json`) covering the reload cases and CSV loading at desktop, phone, and dark.
- **#020 Custody Calendar (done).** Presets checked against common definitions (2-2-3, 2-2-5-5, 3-4-4-3, alternating weeks, every other weekend with or without Wednesdays): all correct, in both week starts. Fixed: an unreadable share link (cut short, or junk) silently showed the saved schedule; it now says so. Swaps past the link limit of 1,000 made `decode` reject the saved schedule, which reset it on reload, so new swaps now stop at the limit, with a message. Calendar files cut a stay at Jan 1, with a wrong night count and two pieces across years; `wholeStays` widens the range to whole stays. UIDs could collide between two families on the same pattern, so they now include a hash of the names (case and spacing ignored). "Usually counted" became "a common way to count". Link and calendar copies are snapshots, now said once after each action (role=status). `aria-current="date"` for today. Google Calendar's help says imports happen on a computer (support.google.com/calendar/answer/37118: "You can import with ICS and CSV files on a computer"), so the note says to import there. Tests: 11 model tests, plus plans custody-2 and custody-3 (share, download, broken links, full swaps, print, phone dark).
- **#022 Day Clock (done).** Fixed: `aria-live` sat on the whole clock, so screen readers announced the time every minute; it's now only on the message and reminders block, which is always rendered and takes no space when empty. The reminders hint now says they're on-screen only, with no sound or confirmation, so not for medicines alone. Settings are re-saved at each part-of-day change, which self-heals Safari's seven-day cap on untouched sites (tested by clearing storage at 11:59:56 with a fake clock and seeing it restored at noon). The defaults were checked against commercial dementia clocks: Essential Aids and Rompa use 7/12/5pm/10pm, Day Connect (Alzheimer's Society shop) 4am/12/6pm/10pm, and Friendly Clock 5am/12/6pm/9pm. There's no standard, so the defaults stay. Tests: 6 model tests, plus plan dayclock-3.
- **#006 Secret Santa (done).** The draw is rejection sampling over uniform shuffles (so uniform over valid draws), with randomized backtracking only after 3,000 misses; impossible rules give null within a step budget. Fixed: "Change people or rules" discarded the drawn links with no confirmation; it now asks, like Draw again. `decodeMatch` capped tokens at 2,000 characters, but every field at its limit in three-byte scripts makes about 3,600 (or more with escapes), so the cap is now 8,000. A new test fails on the old code. Wording is honest: the scramble is described as a courtesy, and the reveal page asks others to close the link. Tests: 10 model tests, plus plan santa-2 (long CJK link round trip, confirm and cancel, reload).
- **#014 Playing Time (done).** A probe of 17,820 plans (1 to 30 players, 2 to 15 on the field, 9 formats, keeper on or off, 3 seeds) found outfield minutes within one shift in every case, correct lineup sizes, and correct totals. Fixed: with fewer places over the game than players (for example 5 players, 2 on, two 30-minute halves changed every 30), someone gets 0 minutes and the summary said "Everyone plays 0–30"; it now says how many don't get on and to change more often. Duplicate names were merged silently, dropping a child from the plan, so there's now the same hint Secret Santa uses. Tails of exactly a third of a shift made 1-minute shifts (10/3 gave 3,3,3,1), so the fold is now `<=` (3,3,4). Known and accepted: with uneven shifts, the longest bench run can exceed an even rotation by about two shifts. Tests: 8 model tests (one new case), plus plan playing-2 (messages, phone, print).
- **Sensitive-wording pass (done).** Frost Dates: no change. Odds, not promises; thresholds 36/32/28 °F match NOAA's frost and freeze tables; the 10 km grid and local exceptions are explained. Ranked Choice Count: added one line under the rounds (bylaws differ; not for public elections), hidden in print. Family Stories: no change; the data-loss warning is already prominent. Stall Till: its "reopening needs a connection" advice was outdated by offline support, so it now says to open it once with a connection.

## Batch 02 research notes

Checked 2026-10-09. Keep these so later picks don't repeat the research.

- **Fluency check (chosen for #016):** no free browser tool combines a timer, tap-to-mark errors, and automatic WCPM. Reader Meter is a $4 iPad app, Readingfluency.app is paid beyond a free tier, publisher tools need a school license, and the free Sheets add-on only does the arithmetic. Teachers still use a stopwatch and a paper copy.
- **Ranked-choice vote counter (medium):** RankedVote's free tier needs an account and allows one contest and 100 voters. Its CSV importer runs locally but needs its template. OpenTally is free and local but wants BLT files, pyrcv.org reads Google Forms CSVs, and OpaVote's free count is capped at 25 voters. Differentiate only with tap-to-enter paper ballots and forgiving CSV import, or skip it.
- **Line rehearsal for actors (chosen for #018):** the options are iPhone and iPad apps, mostly freemium (HitCue, MyLines, Cue-to-Cue, Acting Pal, Linus, Scene Partner), plus two small web tools: Line Memorizer, a new Product Hunt launch with unknown pricing and no spoken cues, and Go Off-Book, for audition snippets only.
- **Worldwide frost dates (chosen for #017):** every lookup found covers only the US and Canada. A 30-year daily request to Open-Meteo's archive takes under a second (about 195 KB). Checked against NOAA-based dates (30% risk, 32°F, 1991–2020) for Boston, Denver, Minneapolis, Atlanta, and Portland, the reanalysis at 0°C lands within 0–8 days, except downtown Portland: 19 days later in spring and 12 earlier in autumn, the cautious direction. ERA5-Land and the default model gave the same dates.
- **Video technique analysis (chosen for #019):** Coach's Eye shut down. Kinovea is Windows-only. Motion Marker, VideFlow, KineVision, OnForm, and CoachNow are apps, often paid for angles. No free browser tool that steps frames and draws angles without uploading was found.
- **Market stall till (chosen for #025):** the offline options are iPhone apps. free-cash-register.net, the one web register found, needs registration, caps the free plan at 500 entries, and puts ads on receipts. Without a service worker (which would break the experiment's self-contained folder), it works offline only while the page stays open.
- **Custody calendar (strong, later):** no free, no-account tool found that turns a co-parenting pattern (2-2-3, 2-2-5-5, alternating weeks, every other weekend) into a calendar with overnight percentages and an .ics file. MyKidsCal uploads custody documents to AI, and OurFamilyWizard, qustody, and Custody X Change need accounts or payment.
- **Day clock for dementia care (strong, later):** the free options are iPad apps (Day Clock, Clarity, DayDateClock, RecallCue, Calendar Clock), and the hardware clocks cost $40–190. A web page would run full-screen on any old tablet, Android or Fire included, with a wake lock.
- **Event seating with keep-apart rules (rejected):** crowded. TableTact, kissmyskills, planning.wedding, Seatbee, and The Table Plan offer free or no-account planners, several with automatic rules.
- **Stage plot maker for bands (rejected):** crowded. Stage Plot Designer, Hive Mind Stageplot, StageOn, and Tecrider are browser tools, and LiveTechPack and PatchBoy are apps.
- **Swiss tournament pairings (rejected):** crowded. swiss-chess, Chess Caddy, and ChessPairings.org are free browser tools with no account.
- **Fair rotation of meeting times across time zones (rejected):** TimeDate (free, no account, tracks a "fairness debt") and itime.day (fair scores) cover it.
- **Family story recorder (chosen for #021):** StoryCorps' free app uploads to its archive, Remento and Storyworth are paid, and the rest are phone apps. Nothing found records locally in a browser with question prompts.
- **Discussion map / speaking time (strong, later):** no free web tool combines tap-to-log speakers, talk time, and a discussion map. Equity Maps and Speaker Tracker are paid or Apple-only, and the Zoom and Google add-ons are trials that work only in online meetings.
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
| 018 | Off Book | off-book | Theater / performing arts | Paste a script, then self-tested cue cards and a read-through with your lines masked | Actors in school, community, and professional shows | 2026-10-09 |
| 019 | Form Check | form-check | Sports technique / video | Local video with frame stepping, slow motion, drawn lines and angles, and a linked side-by-side | Athletes, coaches, hobbyists (golf, running, lifting) | 2026-10-09 |
| 020 | Custody Calendar | custody-calendar | Family / co-parenting | Pattern to year calendar, tap to swap nights, .ics export, share link, print | Separated parents sharing custody | 2026-10-09 |
| 021 | Family Stories | family-stories | Family history / oral history | Guided question cards with per-question audio recording, stored in IndexedDB, ZIP download | Families interviewing elders | 2026-10-09 |
| 022 | Day Clock | day-clock | Elder care / dementia | Ambient full-screen display with fitted type, night colors, wake lock, timed reminders, press-and-hold settings | Families and carers of people with dementia | 2026-10-09 |
| 023 | Discussion Map | discussion-map | Facilitation / meetings and seminars | Tap-to-log speakers on a seating map, lines between consecutive speakers, talk-time stats, drag seats | Teachers (Harkness, Socratic seminars), facilitators | 2026-10-09 |
| 024 | Ranked Choice Count | ranked-choice-count | Civic / organizations (voting) | Tap-entered paper ballots or forgiving export import, then IRV/STV rounds with bars and plain-language transfers | Clubs, unions, councils, award committees | 2026-10-09 |
| 025 | Stall Till | stall-till | Small business / market stalls | Tap-grid register with change due, day summary, cash-up by denomination with a float suggestion | Market and craft-fair sellers, bake sales, garage sales | 2026-10-09 |

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

## Batch 02 outcomes

- **Dropped after building:** none. Every experiment started in Batch 02 shipped.
- **Rejected at the idea stage (crowded or weak):** rotating shift calendars (ToolGrit, Teambridge), event and wedding seating with keep-apart rules (TableTact, kissmyskills, Seatbee and others), stage plots for bands (Stage Plot Designer, Hive Mind, StageOn), Swiss tournament pairings (swiss-chess, Chess Caddy, ChessPairings.org), and fair rotation of meeting times across time zones (TimeDate, itime.day). Also considered and set aside without a full search, as crowded or trivial: tally counters, pace bands, plate calculators, cousin calculators, recipe scalers, and cut-list optimizers.
- **Domains added in Batch 02:** education (reading assessment), gardening and climate, theater, sports technique video, co-parenting, family history, elder care, meeting facilitation, organizational voting, small business.

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
- **Video in tests (from #019):** `.claude/qa/form-video.js` is an `initScript` that adds `__makeVideo()` (a canvas animation recorded with MediaRecorder as WebM), `__open(...files)` (puts files into the page's file input with a DataTransfer), and `__tap(svg, fx, fy)` (pointer events). Recorded WebM has no stated duration (the player seeks to the end to find it) and irregular frame timing.
- **Recording in tests (from #021):** a stand-in microphone built from an oscillator through `createMediaStreamDestination()` records only silence unless Brave starts with `browserArgs: ["--autoplay-policy=no-user-gesture-required"]`, because scripted clicks don't count as a user gesture and the AudioContext stays suspended. Don't `await ctx.resume()` in the stub; it never settles. Key lists in plans can now include numbers, which are pauses in milliseconds.
- **Offline tests (Batch 03):** `.claude/qa/shot.mjs` plans take `exec` (a shell command run before a shot) and `offline` (CDP network emulation for the page only; a service worker's own fetches still reach the network, so real offline tests stop the server instead). The scratchpad `serve.sh start|stop` served a copy of `dist/` on port 4175 for this.
- **zsh gotcha:** never name a shell loop variable `path`; zsh ties it to `PATH`, so commands like curl stop being found.
- Storage keys must be `labs:<slug>` (Constitution, amended 2026-10-09 with owner authorization).

## Batch report formats

- **Batch 04 (Tier B Hardening):** 1. GitHub feedback found, if any; 2. each audited experiment and its most important finding; 3. defects fixed; 4. experiments with no material defect; 5. ranking or confidence changes after audit; 6. remaining high-risk products; 7. whether any tier B product now deserves tier A consideration; 8. the three experiments across the portfolio strongest for eventual standalone promotion; 9. a recommendation for Batch 05. Don't start Batch 05 without authorization.

- **Batch 03 (Portfolio Hardening):** 1. portfolio ranking or tiers; 2. the five strongest and why; 3. the weakest and why; 4. defects found and repaired; 5. shared infrastructure improvements; 6. the offline-support outcome; 7. any new experiments; 8. which experiments justify becoming standalone products; 9. a recommendation for Batch 04.

- **Batch 01 (given 2026-10-09):** experiments shipped; experiments dropped; categories explored; most promising; weakest; infrastructure improvements; recurring product patterns; any experiment worth promoting outside Labs; recommendation on a second batch.
- **Batch 02 (after #025):** a concise report covering #016–#025; rejected ideas; category coverage; strongest experiments; weakest experiments; recurring opportunities; any products now worth promoting; what the first 25 Labs experiments collectively suggest; recommendation for Batch 03.
