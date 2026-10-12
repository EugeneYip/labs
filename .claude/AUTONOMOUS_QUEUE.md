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

- **Current:** P4, the security and privacy audit.
- **Next:** P5, offline and service-worker resilience.

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

- `[ ]` Hostile fixtures and fuzzing for pasted and imported content, share links, storage, and URLs. Record in `.claude/SECURITY_PRIVACY_AUDIT.md`.

### P5: Offline and service-worker resilience

- `[ ]` System-level offline tests: first visit then offline, direct routes, upgrades, stale caches, old tabs, user data during updates. Especially Day Clock, Stall Till, Trip Board, Fluency Check, Family Stories, and Custody Calendar.

### P6: Performance and cold start

- `[ ]` Bundle sizes, lazy loading, large data, memory and object-URL cleanup. Record in `.claude/PERFORMANCE_AUDIT.md`.

### P7: Discoverability metadata

- `[ ]` Titles, descriptions, canonical URLs, Open Graph, robots.txt, sitemap.xml, per-route HTML, link text.

### P8: Experimental candidates

- `[ ]` Numbers by Ear, Line Dry, In Tune, Form Check, Family Stories: reduce whatever uncertainty doesn't need people.

### P9: Import, export, and durability

- `[ ]` Portfolio-wide review of what's stored, export and import round trips, schema versions, quota, multiple tabs, and warnings.

### P10: Production observability without analytics

- `[ ]` A scheduled GitHub Actions smoke test of routes and dependencies, if free and safe. It monitors the product, not users.

### P11: Dependencies and maintenance

- `[ ]` Vulnerabilities, unnecessary packages, warnings, and reproducibility from a clean checkout.

### P12: Documentation and handoff

- `[ ]` Remove contradictions across CLAUDE.md, the constitution, the factory state, the portfolio files, the validation folders, the Product Log, and this queue.

### P13: Evidence-based passive improvements

- `[ ]` Only fixes backed by the audits above.

## Log

- **2026-10-11:** P3 done. The load-failure fix was verified locally in both engines. Production verification follows the deploy.

- **2026-10-11:** P2 done and verified in production (commit 6f13d1c, deploy succeeded): the keyboard flows, announcements, Day Clock read-aloud and night contrast, and an axe re-scan of 32 runs with 0 violations.

- **2026-10-11:** queue created, and P1 done and verified.
  - **Local browser checks** (`.claude/qa/plan-p1.json`, `plan-p1b.json`):
    - every new sentence present;
    - the Custody Calendar clear button empties the saved names, and the share note appears;
    - Day Clock picks "Device David (en-US)" over an online default, and "Device Hazel (en-GB)" for en-GB;
    - no overflow, no console errors.
  - **Tests:** Fluency Check 15, Custody Calendar 11, Day Clock 6 pass.
  - **Production** (commit 75c8844, deploy succeeded): the same checks pass on labs.eugeneyip.net (`plan-p1-prod.json`, `plan-p1b-prod.json`).
