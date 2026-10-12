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

- **Current:** P7, discoverability metadata.
- **Next:** P8, experimental candidates.

## Parked lanes (human-blocked)

- `[B]` **Fluency Check Stage 0 interviews.** The kit is ready in `.claude/validation/fluency-check/interviews/`. The owner sends OUTREACH.md message A when there's time. Keep Fluency Check on HOLD; no pilot.
- `[B]` **Open-Meteo written questions:** the 10,000-a-day figure, weighted calls versus HTTP requests, and donations. An email to Open-Meteo is owner outreach.
- `[B]` **Regrouping Custody Calendar, Day Clock, and Frost Dates to Maintain** in PORTFOLIO_RESOLUTION.md. This is an owner review of the comparative decisions.
- `[B]` **Firefox testing:** needs a Claude Code permission rule, or the owner running the script (see P3).
- `[B]` **A no-account feedback channel** (an email alias on the owner's domain). It needs a registrar setting and publishes an address.

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

- `[ ]` Titles, descriptions, canonical URLs, Open Graph, robots.txt, sitemap.xml, per-route HTML, link text.

### P8: Experimental candidates

- `[ ]` Numbers by Ear, Line Dry, In Tune, Form Check, Family Stories: reduce whatever uncertainty doesn't need people.

### P9: Import, export, and durability

- `[ ]` Portfolio-wide review of what's stored, export and import round trips, schema versions, quota, multiple tabs, and warnings. **Inputs from P4:**
  - 15 of the 21 experiments that save do it silently when storage fails. The riskiest hold typed-in work: Ranked Choice Count, Discussion Map, Secret Santa, Custody Calendar;
  - one damaged Trip Board item sets the whole board aside (kept under `labs:trip-board:unreadable`) and shows an empty board with no message;
  - the whole site shares 5,242,880 characters of localStorage; a Tear-Off Flyer photo takes up to about 1.5 million of them (29%).

### P10: Production observability without analytics

- `[ ]` A scheduled GitHub Actions smoke test of routes and dependencies, if free and safe. It monitors the product, not users.

### P11: Dependencies and maintenance

- `[ ]` Vulnerabilities, unnecessary packages, warnings, and reproducibility from a clean checkout. **Input from P4:** the deploy log warns that `ubuntu-latest` moves to Ubuntu 26 from 2026-10-19.

### P12: Documentation and handoff

- `[ ]` Remove contradictions across CLAUDE.md, the constitution, the factory state, the portfolio files, the validation folders, the Product Log, and this queue.

### P13: Evidence-based passive improvements

- `[ ]` Only fixes backed by the audits above.

## Log

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
