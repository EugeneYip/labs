# Performance audit

P6 of the autonomous queue, 2026-10-12, covering all 25 experiments and the homepage.

**Phone-like settings.** Where a test says "slow phone", Chromium is throttled as Lighthouse does for mobile: 150 ms round trip, 1.6 Mbps down, 750 kbps up, and the CPU slowed 4×. Pages were measured on production, each in a fresh profile with the HTTP cache off and the service worker blocked, so everything came over the network.

## What a page downloads

| File | Raw | Gzipped (as GitHub Pages serves it) |
|---|---|---|
| Main script (React, the page frame, the homepage, the registry) | 237 kB | 74 kB |
| Styles (all of Tailwind's used classes) | 65 kB | 12 kB |
| One experiment's own code | 12 to 44 kB | 5 to 15 kB (Fluency Check is the largest) |
| A page's HTML | 2.5 kB | 1 kB |

A cold visit to an experiment is 4 to 5 requests and 90 to 105 kB. React DOM is most of the main script. Each experiment's code loads only on its own page, as a separate file. GitHub Pages serves gzip, not Brotli, and gives every file, even the content-hashed ones, `cache-control: max-age=600`. The service worker makes up for that: it serves hashed files from its saved copies.

## Cold start (`.claude/qa/p6-coldstart.cjs`)

| Profile | Experiment content shown | Largest paint (LCP) |
|---|---|---|
| Slow phone, Chromium | median 1.18 s, slowest 1.27 s | median 1.23 s, slowest 1.87 s (Numbers by Ear) |
| Unthrottled, Chromium | median 0.50 s, slowest 0.59 s | median 0.53 s, slowest 0.94 s |
| Unthrottled, WebKit | median 0.46 s, slowest 0.79 s | median 0.49 s, slowest 0.82 s |

Every page is well inside the 2.5 s that counts as a good LCP, even on the slow phone. An experiment's own code is requested only once the main script runs, which costs about one more round trip (0.2 to 0.3 s on the slow phone; the homepage, which has no such file, shows its content at 0.97 s). A `modulepreload` hint in each experiment's HTML would overlap the two. It isn't a defect, so it wasn't added.

## Large saved data (`p6-largedata.cjs`, slow phone CPU)

| Saved data | Ready | Longest main-thread task | Elements |
|---|---|---|---|
| Fluency Check, 2,000 / 5,000 / 10,000 checks, **before** | 1.0 / 1.5 / 3.3 s | 72 / 214 / 449 ms | 18,124 / 45,124 / 90,124 |
| Fluency Check, the same, **after** the fix | 0.57 s each | none over 50 ms | 4,626 |
| Stall Till, 1,000 / 5,000 sales | 0.67 / 1.53 s | 107 / 428 ms | 6,131 / 30,131 |
| Trip Board, 500 / 2,000 items | 0.84 / 1.65 s | 0 / 143 ms | 8,048 / 31,848 |
| Ranked Choice Count, 10,000 / 100,000 ballots | 0.70 / 0.75 s | 60 / 287 ms | 281 |
| Discussion Map, 1,000 / 10,000 turns | 0.64 / 0.74 s | 0 / 0 ms | 185 |

**Fixed: Fluency Check's log (commit 3dad21c).** P4 removed the log's 2,000-check cap so no check is dropped without a word, and the table drew every check. The table now starts with the newest 500, under "Showing the newest 500 of N checks. Show all". Downloading a CSV, the student filter, the progress chart, and "Delete all" still use every check. Checked in Chromium and WebKit with 1,200 checks (`p6-fluency-log.cjs`): 500 rows, then all 1,200 by click and by keyboard, the CSV with all 1,200, "Delete all 1,200 checks?", and one student's 400; no overflow at 320 px in dark mode.

The others are fine at any size a visitor will reach: 5,000 sales is far beyond a market day, and 2,000 items far beyond a trip.

**CSV Checkup** (`p6-csv-big.cjs`) reads a 50 MB file of 537,244 rows in 3.5 s in Chromium (71 MB of memory) and 2.1 s in WebKit, unthrottled, because it reads the file as a stream. Clean Paste, Ranked Choice Count, and Photo Scrub at their limits are measured in `.claude/SECURITY_PRIVACY_AUDIT.md`.

## Pages left running (`p6-longrun.cjs`)

The clock was fast-forwarded with Playwright's clock control, so every timer fired as it would; the heap was measured after forced garbage collection.

| Page | Run | Heap | Elements | Event listeners |
|---|---|---|---|---|
| Day Clock | 24 hours | 2.6 → 2.7 MB | 43 → 43 | 153 → 153 |
| Discussion Map, a session in progress | 3 hours | 2.7 → 2.7 MB | 74 → 74 | 158 → 158 |
| Serve Time, cooking | 4 hours | 2.6 → 2.8 MB | 76 → 45 (the meal finished) | 155 → 153 |

No growth: nothing leaks over a day on a tablet.

## Object URLs (`p6-objecturls.cjs`)

`URL.createObjectURL` and `revokeObjectURL` were wrapped to count the live ones during real flows, in Chromium and WebKit:
- **Downloads:** every download or export button on the 21 experiments that save (Ranked Choice Count's CSV, Stall Till's CSV, Discussion Map's image and CSV, Custody Calendar's calendar file, Trip Board's export) leaves no live URL afterwards. Most revoke after 1 to 10 s; Trip Board after 30 s.
- **Photo Scrub:** one live URL per clean copy while it's listed (8 for 8 photos), released by Clear; the zip's after 60 s.
- **Form Check:** at most two, for the two videos it shows side by side; closing them releases both.

Every `createObjectURL` in the code has a matching `revokeObjectURL`.

## Not covered

- Real phones: the slow-phone numbers are throttled emulation in Chromium, not a measured device.
- WebKit throttling: Playwright can't throttle WebKit, so its numbers are unthrottled.
- Firefox (blocked, as in `.claude/BROWSER_MATRIX.md`).

## Files

All in `.claude/qa/` (ignored by git): `p6-coldstart.cjs`, `p6-largedata.cjs`, `p6-fluency-log.cjs`, `p6-longrun.cjs`, `p6-objecturls.cjs`, `p6-csv-big.cjs`; results in `out/p6-*.txt` and `out/p6-*.json`.
