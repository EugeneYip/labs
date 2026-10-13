# Browser matrix

P3 of the autonomous queue, 2026-10-11.

**The rule:** a browser counts as verified only where it was actually run.

## Engines and versions

| Engine | How it was run | Version | Status |
|---|---|---|---|
| Chromium | Brave, through Playwright 1.64 (`executablePath`) | Brave's Chromium | **Tested** |
| WebKit | Playwright's WebKit build | 27.2 | **Tested.** This is the WebKit engine Safari uses, not Safari itself |
| Safari on iOS and iPadOS | Earlier Apple-platform pass (Batch 06): iPhone 17 Pro simulator, iOS 26.5; iPad (A16) simulator, iPadOS 27 | Safari 26.5 / 27 | Tested in Batch 06 for the experiments listed in PORTFOLIO_REVIEW.md, not re-run here |
| Firefox | Playwright's Firefox 1555 | — | **Not tested: BLOCKED — OWNER REQUIRED.** Firefox exits at start-up in this environment ("Could not find profile folder"), whatever profile location it's given. Running it outside the command sandbox was refused, correctly. Firefox can be added once the owner allows it in Claude Code's permission settings, or by running `.claude/qa/browser/smoke.cjs` with `firefox` on a normal shell |
| Windows, Android, real iPhones and iPads | Not available | — | Not tested |

**Tools.** Playwright 1.64 and its browser builds live in a scratch folder and the Playwright cache. Nothing was added to the project's dependencies.

## 1. All 26 public pages (`.claude/qa/browser/smoke.cjs`)

**What it checks:**
- load status from the direct route (each page opened at its own address);
- the right `<h1>`;
- console errors and page errors;
- horizontal overflow;
- dark mode (the computed body background changes);
- at 1280 px light and 390 px dark, in both engines.

| Run | Page loads | Problems |
|---|---|---|
| Production, Chromium and WebKit | 104 | 0 |
| Local build after the load-failure fix, Chromium and WebKit | 104 | 0 |

**Dark mode** works in both: light `rgb(250, 250, 249)`, dark `rgb(12, 10, 9)`.

## 2. Browser-specific features (`.claude/qa/browser/deep.cjs`, production)

| Feature | Experiment check | Chromium | WebKit |
|---|---|---|---|
| File upload, download, canvas re-encode | Photo Scrub: a canary JPEG with every metadata class in, the cleaned copy downloaded | Pass. JPEG, no canary | Pass. JPEG, no canary |
| Download (object URL), clipboard, date input | Custody Calendar: the .ics file, copying the share link, the "Week 1 begins" date field | Pass. VCALENDAR; "Link copied"; anchor set | Pass. Same |
| Time input | Day Clock: settings opened by keyboard; 06:30 typed and saved | Pass | Pass |
| localStorage and CSV download | Fluency Check: CSV from a saved log | Pass | Pass |
| Pointer drag, canvas to PNG | Discussion Map: drag a seat while arranging, save the image | Pass. The seat moved; PNG | Pass. Same |
| Video (H.264) | Form Check: loads a portrait 30 fps MP4 and steps one frame | Pass. Frame 1 → 2 | Pass |
| Video (HEVC) | Form Check: landscape 60 fps MOV | Pass. Plays | Pass. Plays |
| Speech synthesis | Voices available | Pass. 181 voices, all on the device | Pass. 101 voices, all on the device |
| Service worker, offline | Trip Board: the worker controls the page; reload with the network off | Pass. Scope `/`; reloads offline | Pass. Same |
| localStorage persistence, JSON download | Trip Board: an item kept after reload; export parses | Pass | Pass |
| Clipboard write | Clean Paste: copy the cleaned example | Pass. Status "Copied"; 811 characters on the clipboard | Pass. Status "Copied" (headless WebKit can't read the clipboard back) |
| CSV parsing | CSV Checkup: sample file report | Pass | Pass |
| Printing | Tear-Off Flyer: print to PDF | Pass. 1 page | Not run here; WKWebView printing was checked in Batch 06 |
| Microphone, Web Audio | In Tune: start practicing | Pass. Listening, with a simulated microphone playing a sung A3 | No microphone in headless WebKit. It shows "The microphone is blocked for this site. Allow it in your browser's settings, then try again." |
| Microphone, MediaRecorder, IndexedDB | Family Stories: record, stop, reload | Pass. 1 clip stored before reload, 1 after | No microphone in headless WebKit. It shows "The microphone is blocked for this page. Allow it in the browser's site settings, then try again." |

**Test mistakes found and corrected along the way** (none were product defects):
- typing into Trip Board's title field instead of the add field;
- reading Trip Board's items before the experiment had rendered;
- looking for Clean Paste's "Copied" on the button instead of its status line;
- a weak Family Stories check, replaced by counting the stored clips.

## 3. Defect found and fixed: a blank page when code can't load

**Finding.** No error boundary surrounded the lazily loaded experiments, and the page shell had no fallback. If an experiment's code couldn't load or run, React unmounted everything, leaving a completely blank page with no header and no message. Reproduced in both engines by blocking the experiment's file. Causes:
- offline before that experiment was ever opened;
- a deploy replacing files mid-load;
- a browser older than the build target. Fluency Check, Photo Scrub, and (since P4) Clean Paste use regex lookbehind, which Safari supports only from 16.4.

**Fix:**
- `src/App.tsx` gained a `LoadBoundary`. The header stays, and the page says "This experiment couldn't load", with a Reload button and a note about browser age.
- `index.html` gained a tiny inline script. If the site's own main script fails to load or parse, the empty root says "Labs couldn't start in this browser…". Errors from other origins, such as extensions, are ignored.

**Verified** (`.claude/qa/browser/loadfail.cjs`, local build, both engines):

| Case | Result |
|---|---|
| Normal | The experiment renders |
| Experiment code blocked | Header plus the alert |
| Main code blocked | Static message |
| Main code broken (syntax error) | Static message |

The 104-load smoke test shows no false alarms.

## Notes

- **Build target:** Vite's default, which is Chrome and Edge 111, Firefox 114, and Safari 16.4. Older browsers now get a clear message instead of a blank page. Day Clock's setup text names the requirement.
- **Expanding support below Safari 16.4 isn't planned.** Tailwind v4 and the build target assume it.
- **Not covered:**
  - real devices;
  - Windows and Android browsers;
  - Firefox (blocked, as above);
  - Samsung Internet;
  - Fire tablets' Silk browser.
