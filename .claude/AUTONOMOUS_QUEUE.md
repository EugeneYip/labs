# Autonomous queue

Labs Autonomous Continuation Mode, authorized by the owner on 2026-10-11.

**Purpose.** Owner-independent work continues while human-dependent lanes are parked. After each item:
1. verify it;
2. record the result here;
3. update `.claude/FACTORY_STATE.md`;
4. take the next unblocked item.

**When an item is blocked.** Anything needing owner outreach, interviews, money, new credentials, a physical action, a legal or business commitment, a domain, or paid infrastructure is marked **BLOCKED — OWNER REQUIRED**, and the queue moves on.

**Fixes may ship without asking** (commit, push, verify in production) only when backed by one of:
- a verified correctness defect;
- an accessibility failure;
- a browser incompatibility;
- a data-loss risk;
- a privacy or safety issue;
- misleading wording;
- a clear performance regression;
- broken discoverability metadata.

**Not allowed:** speculative features, redesigns for taste, #026, a Fluency Check pilot, contacting anyone.

**Status key:**
- `[ ]` queued
- `[~]` in progress
- `[x]` done (verified)
- `[B]` BLOCKED — OWNER REQUIRED

## Now

- **Current:** none. Batch 11 (Discovery Cycle 6), authorized by the owner on 2026-10-15 for up to five new experiments (#037–#041), is complete: it closed early at #037 on 2026-10-16 (`.claude/batch-11/CLOSEOUT.md`); #037 Ballooned Drawing is live and verified. No Batch 12, no #042, without the owner.
- **Parked lanes** (below) stay parked until the owner chooses one; they never hold up other work.
- **When something new needs the owner** (in any batch): add it under "Parked lanes" as BLOCKED — OWNER REQUIRED, with what's ready and what the owner would do, mention it in "Now" in `.claude/FACTORY_STATE.md`, and carry on with the rest.

## Parked lanes (human-blocked)

- `[B]` **Fluency Check Stage 0 interviews.** The kit is ready in `.claude/validation/fluency-check/interviews/`. The owner sends OUTREACH.md message A when there's time. Keep Fluency Check on HOLD; no pilot.
- `[B]` **Open-Meteo written questions:** the 10,000-a-day figure, weighted calls versus HTTP requests, and donations. An email to Open-Meteo is owner outreach.
- `[B]` **Regrouping Custody Calendar, Day Clock, and Frost Dates to Maintain** in PORTFOLIO_RESOLUTION.md. This is an owner review of the comparative decisions.
- `[B]` **Firefox testing:** needs a Claude Code permission rule, or the owner running the script (see P3).
- `[B]` **A no-account feedback channel** (an email alias on the owner's domain). It needs a registrar setting and publishes an address.
- `[B]` **Human validation of #028 Hidden Data Check, then #026 Exam Timekeeper.** This is the Batch 07 closeout's recommendation; the dossiers say what each test would settle.
  - **#028:** a few FOI or information-governance officers run it on files they're about to send.
  - **#026:** an exams officer uses it through a mock series.
  - Either one means contacting people, so it's the owner's call. Fluency Check's prepared interviews are the cheaper start.
- `[B]` **Hidden Data Check with workbooks Excel itself saves.** Excel for Mac is on this machine, but having Claude drive it needs a macOS automation permission. The owner could instead open a few workbooks in Excel, save them, and leave them in `.claude/qa/hdc/`. So far the only Excel-written file tested is the Solver add-in.
- `[B]` **The nest visit planner (Batch 08 HOLD).** Needs the owner's permission to download two CC0 data files (Storchová & Hořák 2018 from Dryad, 245,901 bytes; Myhrvold et al. 2015, Ecological Archives E096-269, the Amniote database CSV), and a sourced last-visit rule for each species. The research is in `.claude/batch-08/research/j-nest.md` and `CANDIDATES.md`.
- `[B]` **Human validation of Batch 08's experiments:** #031 New Classes first (a primary school's summer-term class mixing), then #033 Captions Up (a community company's captioned performance). Contacting people is the owner's call; the closeout says what each would settle.
- `[B]` **Human validation of #036 Holiday Pay Average** (Batch 10; deferred by the owner): an employer or bookkeeper working out a real worker's holiday pay with it, to see whether the week selection and the printed working save the spreadsheet hours that Xero's users describe.
- `[B]` **Human validation of #037 Ballooned Drawing** (Batch 11; parked by the owner for the batch): two or three shops' inspectors on real, non-controlled drawings, timing the ballooning and the table against their current method, and asking whether their customers accept the outputs.
- `[B]` **The county bird recorder's merge** (Batch 11 lead): it needs a real BirdTrack county download, which only an account gives, before it could be built and checked against real files; the evidence is in `.claude/batch-11/research/i-bird-report-checks.md`.
- `[B]` **A private copy of `.claude/qa/`.** The QA harnesses and fixtures (361 files, every flow check) are ignored by git by design and live only on this machine.

## Queue

### P1: Known correctness and trust cleanup

- `[x]` **Fluency Check** (2026-10-11):
  - the accuracy bands are attributed to the running-record guideline, noting that DIBELS uses its own cutoffs;
  - the DIBELS sentence now carries the ® mark, the University of Oregon as owner, and a note that the University isn't connected with the page;
  - a line asks school or practice users to keep official results in their own records.
- `[x]` **Custody Calendar** (2026-10-11):
  - "Nothing is sent anywhere" became "Nothing you enter is sent anywhere unless you share a link or a calendar file";
  - a hint that first names, initials, or nicknames are enough;
  - the share note says anyone with the link can see the names and schedule, and a link can't be taken back;
  - "This is a planning calendar; your court order or parenting plan is what counts";
  - a note that anyone using the device can see the saved schedule, with a "Clear it from this device" control (with confirmation).
- `[x]` **Day Clock** (2026-10-11):
  - "old tablet" became "spare tablet", with the browser it needs (Safari on iPadOS 16.4 or later, or Chrome 111 or later);
  - the keep-awake promise became an honest caveat: iPads before 18.4 sleep as a Home Screen app, and power-saving modes may turn the screen off;
  - read-aloud prefers an on-device voice, so the message and reminders aren't sent to an online speech service, with a note saying so.
  - The dementia-specific summary was kept: it describes the audience and claims no treatment or monitoring.

### P2: Accessibility audit (all 25)

- `[x]` Done (2026-10-11); see `.claude/ACCESSIBILITY_AUDIT.md`. **Fixed:**
  - Back Row contrast;
  - Day Clock corner controls (contrast, plus a keyboard "Read aloud" button);
  - Fluency Check (focus to the first word on start, the score announced, timer context);
  - Discussion Map (arrow keys move seats);
  - reduced motion in Numbers by Ear, Family Stories, and Stall Till.

  **Results:** axe finds 0 violations on 104 page runs and 20 state runs; the keyboard pass on 26 pages is clean; text at 200% is clean.
- `[ ]` **P13 candidate:** Custody Calendar's year view has about 400 tab stops. Use arrow keys within each month.

### P3: Cross-browser matrix

- `[x]` Chromium (Brave) and WebKit 27.2 on all 26 pages: 104 production loads, 0 problems. Deeper checks of 15 features pass in both engines, or fail gracefully where there's no microphone. See `.claude/BROWSER_MATRIX.md`.
- `[x]` **Fixed:** a blank page when code can't load. `LoadBoundary` in App.tsx, plus a static start-failure message in index.html. Verified in both engines. This also covers the "too old browser" item from P1.
- `[B]` **Firefox:** it exits at start-up inside the command sandbox, and launching it outside the sandbox was refused. Needs the owner to allow it in Claude Code's permissions, or to run `.claude/qa/browser/smoke.cjs firefox` themselves.

### P4: Security and privacy audit

- `[x]` Done (2026-10-12); see `.claude/SECURITY_PRIVACY_AUDIT.md`. **Fixed:**
  - Ranked Choice Count: a candidate named `__proto__` broke the count on every visit; 300 pasted lines could build 30 million ballots; "2024 > Ava" became 2,024 ballots for Ava; spreadsheet row numbers read as counts now get a hint;
  - Fluency Check, Stall Till, Fair Share, Serve Time: damaged saved data broke the page on every visit (13 fuzz cases, plus 2 edge cases in Serve Time);
  - Fluency Check: an alert and an honest button when the browser isn't saving; no silent cap on the log;
  - Custody Calendar: bare carriage returns and control characters from a crafted share link reached the `.ics` file;
  - Clean Paste: quadratic time (a 250 KB PDF copy froze the page for 6.9 s, 1 MB for 1.7 minutes); now linear, with identical output;
  - Photo Scrub: an out-of-range character reference in a photo's XMP stopped it being cleaned at all, and 40,000 unclosed tags froze the page for 14 to 22 s; now cleaned in about 0.1 s, with identical reports on 5,003 generated packets;
  - Off Book: read-aloud could send the script to an online voice, despite "Everything stays on this device";
  - Frost Dates, Line Dry: the place search is sent to Open-Meteo too, and the pages now say so.

  **Results:** the storage fuzz (4,863 cases) has none of the 13 earlier failures and no failure caused by saved data in Chromium (local-server connection resets aside, all rerun clean), and 0 failures in WebKit; share links (174 per engine), Trip Board's link checks, and CSV formula defusal held up unchanged; 25 unit-test files pass. **Left for later:** Off Book on one enormous line (P13 candidate); a CSP or HSTS would be owner decisions.

### P5: Offline and service-worker resilience

- `[x]` Done (2026-10-12); see `.claude/OFFLINE_RESILIENCE.md`. **Fixed** (`public/sw.js`, commit 7082b95):
  - once more than 150 files had piled up, the worker dropped the oldest first, which were the files saved pages still needed: Day Clock, opened earlier and not since, couldn't start offline. It now drops only files no saved page uses;
  - `/<slug>/index.html` now finds the saved copy offline.

  **Held up:** first visits (saved about 2 s after loading), every form of address, all 26 pages, pages never opened (the offline page), upgrades, tabs left open through a deploy, and saved data across a deploy, in Chromium and WebKit. **Found on the way:** in Playwright's WebKit, leaving a page the instant it loads can leave the worker installing until the browser restarts (3 of 14 tries; not at 250 ms or later); not the new worker, not checked in Safari; recorded as a residual risk.

### P6: Performance and cold start

- `[x]` Done (2026-10-12); see `.claude/PERFORMANCE_AUDIT.md`. **Fixed** (commit 3dad21c): Fluency Check's log drew every check, so after P4 removed its cap a 10,000-check log took 3.3 s to open on a slow phone CPU. The table now starts with the newest 500, with "Show all"; it opens in about 0.6 s at any size.

  **Held up:** 90 to 105 kB per cold page; on Lighthouse's mobile throttling every page shows its content by 1.27 s (LCP median 1.23 s, slowest 1.87 s); other large data (100,000 ballots, 10,000 turns, a 50 MB CSV); no memory growth over 24 hours of Day Clock; every object URL released after real flows. **Option, not a defect:** a `modulepreload` hint for each experiment's code would save about one round trip.

### P7: Discoverability metadata

- `[x]` Done (2026-10-12). **Fixed** (commit ad9eed8):
  - `robots.txt` and `sitemap.xml` answered 404; the build now writes both from the registry (26 addresses);
  - pages were also served at `/<slug>/index.html` with no canonical address; every page now has `<link rel="canonical">` and `og:url` with its own address, from `public/CNAME`; 404.html claims none.

  **Already in place:** a title, description, and Open Graph title and description per page; a page file per experiment; descriptive link text. **Option for the owner:** a preview image (link previews are text-only). **Cosmetic, left alone:** 5 summaries are over 160 characters, so search results shorten them.

### P8: Experimental candidates

- `[x]` Done (2026-10-12). Findings in `.claude/EXPERIMENTAL_CANDIDATES.md`. **Fixed:**
  - In Tune read some sung notes an octave high when the vowel boosts the second harmonic (commit d9753e4). In-tune notes matched within 2.5 s: 51–56 of 60 before, 59–60 after, on 900 synthesized notes;
  - Form Check stepped 240 fps slow motion 4 or 8 frames at a time; the rate now comes from the file (07cf644, comment 5029b4a);
  - Family Stories told a private window it was out of space; it now says it can't keep the answer, while recording too (402370f).

  **Left:** a child's "ah" at C5 and C♯5 still reads an octave high (a looser rule halves buzzy tones). Chromium's WebM recordings have no stored length (P13 made the page's player find it; downloaded files still carry none). **BLOCKED — OWNER REQUIRED:** Numbers by Ear's voices on Windows, Android, and ChromeOS devices; Line Dry against real washing; real singers, phones, and iPhones for the rest.

### P9: Import, export, and durability

- `[x]` Done (2026-10-12). Findings in `.claude/DURABILITY_AUDIT.md`. **Fixed:**
  - two open tabs erased each other's work: in Stall Till, switching tabs in the older one erased the newer one's sales. A shared hook (`src/components/useOtherTabs.ts`) now takes up another tab's save, also when a background tab is shown again, in 13 experiments (commits 2a1e12c, 6f847f6);
  - nine pages holding typed-in work saved silently when storage failed; they now say so, with a shared notice (`src/components/NotSaving.tsx`). Stall Till's and Fluency Check's notices no longer blame private windows (2a1e12c);
  - one damaged Trip Board item hid the whole board; the readable items now show, with a notice and a download of what was saved (efd862d).

  **Held up:** export and import round trips (Trip Board files, Fluency Check CSVs, Custody Calendar links) and the damaged-storage fuzz (4,863 cases, 0 failures in each engine). **Left:** one storage budget for the whole site, with no notice of which experiment fills it; settings-only pages save silently; a rule for the next saved-format change (a new key).

### P10: Production observability without analytics

- `[x]` Done (2026-10-12, commit 8d3fe38). `.github/workflows/daily-check.yml` runs `.github/scripts/daily-check.ts` once a day (11:17 UTC) and on demand. Free for a public repository; read-only permissions; no keys; public pages only. It checks:
  - every sitemap page answers with its own address and a title;
  - every script and style file loads, including each experiment's own code and the shared files;
  - robots.txt, sw.js, a 404, and http redirecting to https;
  - the HTTPS certificate has 14 days left (GitHub Pages renews it);
  - Open-Meteo's place search, forecast, and archive, read with Frost Dates' and Line Dry's own code, with every forecast field Line Dry uses really there.

  A busy or failed request is tried twice more. GitHub emails a failed run to whoever last changed the schedule (the owner's notification settings decide). **Limit:** GitHub turns scheduled runs off after 60 days without a commit; the Actions tab turns them back on.

### P11: Dependencies and maintenance

- `[x]` Done (2026-10-12). Details in `.claude/MAINTENANCE.md`.
  - No vulnerabilities; all 10 direct packages used; every GitHub action on its latest major version.
  - Two packages behind, neither needed: a patch to `@types/node`, and TypeScript 7.
  - The deploy log's only warnings come from GitHub's own action and from git.
  - A clean checkout builds the same: the deployed site's 61 files are byte-identical to a local build.
  - **Changed:** both workflows name `ubuntu-26.04` instead of `ubuntu-latest` (commit b7f82f7). The deploy and the daily check both passed there, and the output is unchanged.

### P12: Documentation and handoff

- `[x]` Done (2026-10-12). Three reviews, two by sub-agents, read every document against the code and the later priorities; each finding was checked before it was fixed. 37 files changed:
  - **The factory state:** older sections' "Next action" lines said to wait for the owner and to review every push, which contradicted the current mode. They're now marked superseded, and the old "Position" points to the top. Firefox joined the parked list. A tooling note says where Playwright lives, how `route-preload.cjs` and the smoke test run, and how to bound waits.
  - **The validation research** (23 files) described the products before P1 and the Frost Dates maintenance pass: "no clear control", "no on-device voice", the planting calendar "1.5–2.5 months early", GeoNames "not credited", and "unchanged" status lines. The notes got a dated header; briefs, risks, plans, and hypotheses got inline notes with the commit.
  - **The portfolio and audits:** forward pointers where a later priority fixed a residual risk; corrected counts (16 silent savers, not 15; 42 packages, not 30; Line Dry's risk change 4 → 3, which matches its total); "Safari" became "WebKit" where only Playwright's WebKit was used.
  - **CLAUDE.md, the README, memory:** CLAUDE.md's "pages are always fetched fresh" now describes the worker as it is (network first, the saved copy after 4 seconds, and the browser's 10-minute cache). The README's layout lists the shared files, the worker, and the workflows. Memory notes that the autonomous authorization covers its fixes. Two code comments no longer blame private windows or say "weeks".
  - **The constitution:** no contradiction. One thing for the owner: "Don't add ... build infrastructure" (§5) doesn't mention monitoring. The daily check (P10) is outside the build, but an amendment could say scheduled checks of the live site are allowed.

### P13: Evidence-based passive improvements

- `[x]` Done (2026-10-12), each fix backed by an earlier audit:
  - **Custody Calendar** (P2; commit 5fcb4b4): the year view had about 400 Tab stops. Now there's one per month, with the arrow keys, Home, and End between days. 47 stops on the page; axe finds no violations.
  - **Off Book** (P4; 36bb51e): a 500 KB script pasted as one line, with unclosed brackets, took 4 to 16 s to read, on every visit. Two patterns are now linear. It reads in 30 ms, with identical results on 71,000 random scripts.
  - **Fluency Check** (P12; c9e029c): the samples now say "practice passage (not leveled)".
  - **Family Stories** (P8; af90546): in Chromium the player now finds a WebM answer's length itself, so it shows it and scrubs from the start. The recording isn't changed (downloads are byte-identical).
  - **Not done:** a `modulepreload` hint per experiment (P6). It's an option rather than a defect, saving about one round trip on a cold visit.

## Log

- **2026-10-12:** P13 done and verified in production (commits 36bb51e, 5fcb4b4, c9e029c, and af90546; deploys 38333838468 and 38334354658 succeeded; production's files are byte-identical to the local build).
  - **Custody Calendar's keyboard checks:** 8 of 8 in Chromium and WebKit.
  - **Off Book:** with the 500 KB one-line script saved, the page opens in 0.6 s on a 4x-slowed CPU.
  - **Family Stories:** Chromium's player shows a 6 s answer as 5.9 s at 0 s, and the 7 Chromium recording checks pass.
  - **Fluency Check:** the wording shows at 320 px with no overflow in both engines.
  - **Smoke test:** 104 page loads, 0 problems. **Daily check:** 11 of 11.

- **2026-10-12:** P12 done. 37 documents and comments corrected (details under P12). The build is unchanged, byte for byte.

- **2026-10-12:** P11 done and verified. Deploy 38325368394 ran on Ubuntu 26.04.1 and succeeded, and production's 61 files are byte-identical to the local build. The daily check passed on 26.04 (run 38325487870, 11 of 11).

- **2026-10-12:** P10 done and verified (commit 8d3fe38).
  - **On GitHub** (run 38325081794, started by hand): 11 of 11 checks pass, and the schedule is active.
  - **Locally:** 11 of 11 pass in 7 seconds. With fetch wrapped to break one thing at a time, it fails on a missing file, a page with the wrong address, a missing forecast field, and Open-Meteo not answering, naming each, and rides out one "too many requests".

- **2026-10-12:** P9 done and verified in production (commits 2a1e12c, efd862d, 6f847f6, and e8e6066; deploy 38323719203 succeeded; production serves `index--w1y5gDG.js`).
  - **On production, in Chromium and WebKit:** the two-tab checks (13 experiments x 9 cases), no echo between tabs, all 13 notices at 390 px, Stall Till's 3 sales of 3, Fluency Check during a check and its reload recovery, Trip Board's damaged board, the three round trips, and Day Clock saving its settings again after they're cleared: all pass.
  - **Before the push:** the damaged-storage fuzz, 4,863 cases in each engine with 0 failures, and 929 more for the two experiments that changed last; offline copies still load (6 focus experiments and all 26 pages, both engines); typing with 10,000 checks saved costs the same CPU time as before.
  - **Smoke test:** 104 page loads, 0 problems.

- **2026-10-12:** P8 done and verified in production (commits d9753e4, 07cf644, 402370f, 5029b4a, and 8e542ca; deploy 38311285906 succeeded; production serves `index-WyDuM49i.js`).
  - **In Tune on production** (`p8-intune-browser.cjs`, a synthesized man's voice as Chromium's microphone): G4 "ah" matched in 2.8 s, where it had read "G5: about 12 semitones too high" and never matched; D4 "ah" matched in 2.8 s.
  - **Form Check on production** (`p8-formcheck-phone.cjs`): the four phone-like clips in Chromium and WebKit all show the right size and length, report 60, 240, 30, and 29.97 fps, and step exactly one frame.
  - **Family Stories on production** (`p8-familystories-record.cjs`): WebKit with WebM and with MP4, a private-like WebKit profile, and Chromium all pass.
  - **Smoke test:** 104 page loads, 0 problems.

- **2026-10-12:** P7 done and verified in production (commit ad9eed8, deploy 38304012548 succeeded). `.claude/qa/p7-meta-prod.cjs`: `robots.txt` and `sitemap.xml` answer 200, with 26 addresses; each page answers 200 with its own canonical and og:url; `/stall-till/index.html` names `/stall-till/`; an unknown address answers 404 with none. The smoke test: 104 page loads, 0 problems.

- **2026-10-12:** P6 done and verified in production (commit 3dad21c with the audit in 383533a, deploy 38303281596 succeeded; production serves `index-BIylSpZc.js`).
  - **Fluency Check on production, in Chromium and WebKit** (`p6-fluency-log.cjs`): 500 rows at first, "Show all" by click and keyboard, the CSV with all 1,200, "Delete all 1,200 checks?", one student's 400.
  - **Large logs on production** (slowed CPU): 2,000 to 10,000 checks open in 0.63 to 0.65 s.
  - **Smoke test:** 104 page loads, 0 problems.

- **2026-10-12:** P5 done and verified in production (commits 7082b95 and 14aaf98, deploy 38298379025 succeeded; production's worker is the new one).
  - **The real upgrade on production:** profiles that opened Day Clock, Stall Till, and Fluency Check under the old worker came back after the deploy and took the new one. All three still load offline, and `/day-clock/index.html` too, in Chromium and WebKit.
  - **Fresh visitors on production:** first visits offline in every address form (6 of 6), all 26 pages, and pages never opened; the smoke test, 104 page loads, 0 problems.
  - **The harness hang:** the first full run hung 1 h 40 min on an unbounded `navigator.serviceWorker.ready`. The harness now bounds every wait, scenario, and run, and only the unfinished part was rerun.

- **2026-10-12:** P4 done and verified in production (commits dc6eaa2 to 0a5c65a, deploy 38282159275 succeeded; production serves the new build, `index-CEBx8cji.js`, on every page checked).
  - **Production checks in Chromium and WebKit** (`.claude/qa/out/p4-prod.txt`): Ranked Choice Count (`__proto__` by instant runoff and STV, the 30-million-ballot paste refused, the row-number hint), Fluency Check with writes failing, Fair Share's damaged recent group, Off Book's device voice, both crafted photos cleaned in under 0.1 s, the Open-Meteo wording at 320 and 1280 px, 62 edge times, Clean Paste's 1 MB paste, and 174 hostile share links: all pass.
  - **Smoke test:** the 26-page smoke test, 104 page loads, 0 problems.

- **2026-10-11:** P3 done and verified in production (commit 702bc7d, deploy succeeded): the four load cases behave correctly in both engines, and the 26-page smoke test re-run on production is clean.

- **2026-10-11:** P2 done and verified in production (commit 6f13d1c, deploy succeeded): the keyboard flows, announcements, Day Clock read-aloud and night contrast, and an axe re-scan of 32 runs with 0 violations.

- **2026-10-11:** queue created, and P1 done and verified.
  - **Local browser checks** (`.claude/qa/plan-p1.json`, `plan-p1b.json`):
    - every new sentence present;
    - the Custody Calendar clear button empties the saved names, and the share note appears;
    - Day Clock picks "Device David (en-US)" over an online default, and "Device Hazel (en-GB)" for en-GB;
    - no overflow, no console errors.
  - **Tests:** Fluency Check 15, Custody Calendar 11, Day Clock 6 pass.
  - **Production** (commit 75c8844, deploy succeeded): the same checks pass on labs.eugeneyip.net (`plan-p1-prod.json`, `plan-p1b-prod.json`).
