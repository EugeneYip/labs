# Offline and service-worker resilience

P5 of the autonomous queue, 2026-10-12. The service worker (`public/sw.js`, registered only in the built site by `src/main.tsx`) promises that an experiment opened once keeps working without a connection, that pages are fresh when online, and that nothing from outside services or typed by visitors is cached.

## Method

| Check | How |
|---|---|
| Harness | `.claude/qa/p5-offline.cjs`, Playwright 1.64. The built site is served like GitHub Pages by the `pages` entry in `.claude/launch.json` (a folder of static files, one `index.html` per experiment, `404.html` otherwise). A deploy is simulated by swapping the served folder between builds |
| Builds | 702bc7d (production before P4), the P4 build (production now), the P5 build (P4 plus the new worker: only `sw.js` differs), and a copy of the P5 build with every asset renamed and every reference updated, standing in for the next deploy |
| Engines | Brave's Chromium, and Playwright's WebKit 27.2 with a persistent profile per scenario. In Playwright's throwaway WebKit profiles, Cache Storage is emptied whenever the worker updates (even when only a comment changed); with a persistent profile, as Safari has, it isn't. So the throwaway kind can't test updates |
| Focus | Day Clock, Stall Till, Trip Board, Fluency Check, Family Stories, Custody Calendar, then all 26 pages |

**Scenarios:**
- **First visit, then offline:** open an experiment once, wait until its page and every file it loaded are saved, go offline, then load it by reload, without the trailing slash, as `/<slug>/index.html`, with a query, and with a `#` fragment.
- **All pages offline:** the homepage and all 25 experiments opened once, then each loaded offline.
- **Never opened, offline:** an experiment never opened, and the homepage, offline: the worker's own "You're offline" page (HTTP 503), not a browser error.
- **Offline right after the first load:** going offline 0, 1, 2.5, and 4 seconds after the first load of Day Clock, then reloading.
- **Upgrade:** open on the old build; deploy the new one; offline, the old version must still work; online, the new one must arrive; offline again, the new one must work.
- **Old tab across a deploy:** Day Clock and Stall Till left open while a deploy happens: the page keeps working, and the next page opened runs the new build.
- **Trimmed files:** the worker keeps at most 150 files. Day Clock is opened, 150 newer files are added (as many later deploys would), then the next deploy is visited online. Is Day Clock still whole offline?
- **Data across a deploy:** saved state made with the old build (Fluency Check's check in progress, Stall Till's sales, Trip Board's items, Custody Calendar's schedule, Day Clock's message) still shows after the deploy, online and offline.

## Before the fix

The same in Chromium and WebKit, from 702bc7d to the P4 build:

| Scenario | Result |
|---|---|
| First visit, then offline | Each page was saved about 2.1 s after loading, and loaded offline by reload, without the slash, with a query, and with a fragment. **`/<slug>/index.html` failed in all 6** ("You're offline"): the app accepts that address, but the worker's saved copy is keyed `/<slug>/` |
| All pages offline | 26 of 26 |
| Never opened, offline | The offline page, with status 503, for an experiment and for the homepage |
| Offline right after the first load | Not saved after 0 or 1 s; saved after 2.5 and 4 s. The page asks the worker to save its files 2 s after the worker is ready |
| Upgrade | 6 of 6: the old version offline straight after the deploy, the new one online, and the new one offline after that |
| Old tab across a deploy | 2 of 2: the old tab keeps working (nothing forces a reload, so work in progress is safe), and the next page runs the new build |
| Trimmed files | **Day Clock couldn't start offline** ("Labs couldn't start"): the trim dropped the oldest files first, and those were the ones Day Clock's saved page still named. Stall Till, opened last, worked |
| Data across a deploy | 5 of 5 |

**The trim defect in practice.** Every deploy that changes any experiment changes the main script's name, so each visit after a deploy adds files. Once a visitor's saved files pass 150 (roughly 30 to 150 deploys for someone who uses a few experiments, at one to five new files a deploy; Labs has deployed 79 times since 2026-10-08), any experiment they haven't opened online since its files were among the oldest stops loading offline, until they open it online again. Day Clock on a tablet and Stall Till at a market are exactly the uses that rely on offline.

## The fix

`public/sw.js`, in commit 7082b95:
- **Trimming keeps what saved pages need.** Past 150 files, the worker now works out which files its saved pages still use (the scripts and styles each page names, and the files those scripts load in turn, such as an experiment's own `./<name>-<hash>.js`) and drops only the others, oldest first. It does this work only when there are more than 150 files.
- **`/<slug>/index.html` is the same page as `/<slug>/`** for the saved copy.
- `VERSION` is unchanged, so updating to the new worker keeps every saved copy.

## After the fix

The P5 build, from both 702bc7d and the P4 build (the real update for visitors: only `sw.js` changes), in both engines:

| Scenario | Chromium | WebKit |
|---|---|---|
| First visit, then offline (6 experiments × 5 address forms) | 6 of 6, including `/<slug>/index.html` | 6 of 6 |
| All pages offline | 26 of 26 | 26 of 26 |
| Never opened, offline | The offline page, 503 | The same |
| Offline right after the first load | Saved by 2.5 s, not at 0 or 1 s | The same |
| Upgrade, from 702bc7d and from P4 | 6 of 6 each | 6 of 6 each |
| Old tab across a deploy | 2 of 2 | 2 of 2 |
| Trimmed files, new worker on both sides | Day Clock and Stall Till both work offline; the cache trimmed back to 150 | The same |
| Trimmed files, starting from the old worker | Day Clock still fails: the old worker does that trim, during the visit that brings the new one | The same |
| Data across a deploy, from 702bc7d and from P4 | 5 of 5 each | 5 of 5 each |

## On production

After the deploy (commits 7082b95 and 14aaf98, deploy 38298379025 succeeded; production's `sw.js` is the new one):
- **The real upgrade** (`p5-prod-upgrade.cjs`). Before the deploy, profiles in Chromium and WebKit opened Day Clock, Stall Till, and Fluency Check under the old worker, and all three loaded offline. After it, the same profiles came back (opening only Stall Till online) and took the new worker. All three still load offline, and so does `/day-clock/index.html`, which only the new worker can serve. So every saved copy survived the switch.
- **Fresh visitors:** first visit, then offline, 6 of 6 in every address form; all 26 pages offline; the offline page for pages never opened. All in both engines (`out/p5-prod.txt`).
- **The 26-page smoke test:** 104 page loads, 0 problems, light and dark.

## The harness hang, and what it turned up

The first full run hung for 1 h 40 min in WebKit's last scenario. The harness waited on `navigator.serviceWorker.ready` inside `page.evaluate`, which has no timeout of its own, and the worker never activated. Nothing else was holding the process open. The harness now polls the registration instead, puts a limit on every wait in a page, limits each scenario to 8 minutes and a run to 50, closes whatever a scenario leaves open, writes its results after every check, and exits explicitly. Only the unfinished part was rerun.

Why the worker never activated was reproduced on its own (`p5-ready-probe.cjs`, `p5-stuck-probe.cjs`, `p5-stuck-window.cjs`). In Playwright's WebKit, leaving the homepage the instant it has loaded sometimes leaves the worker "installing":
- 2 of 8 tries in one run, and 1 of 6 in another;
- never when leaving 250 ms or 1 s after the load (0 of 6 each);
- it doesn't recover in that session (60 s later, after a reload, on another page), but a browser restart with the same profile heals it;
- the P4 build does it too, so it isn't the new worker; Chromium never does it.

In that state pages still work online; only offline copies aren't made until the browser restarts. Whether Safari itself does this couldn't be checked here.

The first version of "data across a deploy" also failed 3 of 5 in Chromium. It planted the saved data by loading the homepage first, and then read the page before the experiment's code had arrived: a replay shows the data on the page 1.5 s after load in all three. The harness now plants the data before the page's own first load and waits up to 10 s for it to show.

**Not product defects.**

## Residual risks

| Risk | Measured | Why it stays |
|---|---|---|
| **The first moments of a first visit.** A page opened for the first time is saved for offline use about 2.1 s after it loads | Offline at 0 or 1 s: not saved; at 2.5 s: saved | Saving is deliberately left until the page has loaded, and the window is a couple of seconds |
| **A worker left installing in WebKit.** Leaving a page the instant it loads can leave the worker "installing" for the rest of the browser session | Playwright's WebKit: 3 of 14 tries when leaving at once; 0 of 12 at 250 ms or 1 s; healed by a browser restart. Chromium: never | Pages still work online, only offline copies wait for a restart, and no visitor leaves that fast on purpose. Not seen in Safari itself, which couldn't be run here |
| **Files already trimmed before this fix.** A visitor whose saved files passed 150 under the old worker may already have lost files for pages they haven't opened since | A visit that lands while the new worker installs can still be trimmed once by the old one (seen in the test that starts from the old worker) | Nothing offline can bring them back; opening those pages online once mends them |
| **Fresh pages after a deploy.** GitHub Pages sends `cache-control: max-age=600`, and the worker fetches pages through the browser's HTTP cache | For up to 10 minutes after a deploy, a visitor may get the previous version, online as without the worker | GitHub Pages' setting; the next visit after that gets the new version |
| **Browsers clearing storage.** Safari can remove a site's script-writable storage, Cache Storage included, after about seven days without a visit (Home Screen web apps are exempt), and any browser can under storage pressure | Not testable here | Outside the site's control. Fluency Check, Trip Board, and Family Stories already say Safari can clear saved data after about a week |
| **Firefox** | Not run (P3) | **BLOCKED — OWNER REQUIRED**, as in `.claude/BROWSER_MATRIX.md` |

## Files

All in `.claude/qa/` (ignored by git): `p5-offline.cjs` (the harness), `p5-ready-probe.cjs`, `p5-stuck-probe.cjs`, `p5-stuck-window.cjs`, and `p5-prod-upgrade.cjs`. Results: `out/p5-*.json`, `out/p5-run1.txt` (the first run, up to the hang), `out/p5-stuck-*.txt`, and production `out/p5-prod*.txt`. The builds used are rebuilt from git: `git archive 702bc7d` for the oldest, then `npx vite build --outDir <folder>`.
