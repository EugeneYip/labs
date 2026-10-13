# #026 Exam Timekeeper

Dossier for Batch 07's first experiment. Research and decision: `CANDIDATES.md` ("Decisions after the gate").

## Thesis

- **Audience:** exams officers and invigilators in UK schools and colleges (JCQ centres), above all the access-arrangements room where extra time and supervised rest breaks mix; teachers running mocks and timed tests, where rest breaks have to be trialled first; university and professional-exam invigilators who run "stop the clock" rest breaks.
- **Job:** before the exam, the SENCo's list of arrangements and the papers are in hand. During it, project the actual time and the board (centre, papers, start and finish times, extra-time finishes), and when a candidate takes a supervised rest break, stop their time and keep their revised finish right. Afterwards, a record of what happened for the exam file.
- **Alternatives:** paper slips and whiteboards; The Exams Office's tool (membership and login; whole-room pause only); ExamClock (account; individual pause is $89 a year); free countdowns that JCQ rooms can't use; a £5 HTML timer with fixed 5-minute breaks.
- **Strongest incumbent:** The Exams Office's Exam Room Clock Tool, for the board; paper slips, for rest breaks.
- **Differentiation:** free, no account, the actual time as JCQ requires, each candidate's own finish kept through any number of breaks, a printable record, nothing leaving the exam-room laptop, and offline after one visit.
- **Strongest falsification argument:** paper works, exams officers are cautious, and a wrong finish time is maladministration. Answered by keeping the arithmetic small, tested independently, shown in full, and only ever rounded in the candidate's favor.
- **Why BUILD survived:** a rule-backed wedge (no countdowns), a recurring and growing job (every session of every series, plus mocks), disability-linked data that shouldn't go to a server, and a single-device shape that fits Labs exactly.

## Risk list (before coding)

| Risk | Design answer |
|---|---|
| A wrong finish time: extra time, several breaks, a room pause during someone's break, late starts, a break still open | One pure function from timestamps: pauses (the candidate's breaks and room pauses) are merged, so overlaps count once, and only pauses before the finish count. Exact to the second; shown finishes rounded up to the minute. Tested against an independent brute-force simulation |
| The device clock is wrong, or jumps | It shows the device's own time, large, so a wrong clock is visible; setup says to check it against the room's other clocks (JCQ: all clocks must agree). Durations use wall-clock timestamps, so a jump mid-break would distort that break: noted, not hidden |
| Reload, crash, or a closed tab mid-exam | Everything is saved as timestamps on every change and resumes exactly; two windows (controls and board) stay in step through storage events |
| The browser won't save | A red notice: don't reload or close this page |
| The screen sleeps | Screen wake lock while an exam runs, where the browser has it; a note otherwise |
| Background throttling | Times are recomputed from the clock on every tick, never counted up, so a slow tick only delays the display |
| Revealing who has arrangements | The board shows paper-level finish times (standard and each extra-time group); individual finishes, by candidate number, appear on the board only if switched on. A hint asks for candidate numbers or initials, not names |
| Claims | No "compliant" or "approved" claim; it says it shows the actual time as JCQ's instructions require, that it isn't connected with JCQ, and that the SENCo's and centre's instructions decide every arrangement |
| Hostile or odd input | Durations, percentages, and times are bounded and validated; long and Unicode text fits; duplicate candidate labels are flagged; damaged saved data starts a fresh exam without breaking the page |
| Two tabs | `useOtherTabs`; the board window only reads |
| The projector | Very large figures fitted to the screen, dark board by default, no blinking, no sound |
| Offline | The site's service worker; checked with the server stopped |
| Printing | One clean record table; checked as a PDF |
| Accessibility | Every control by keyboard with a name; status changes announced politely in the control view; nothing announced every second |

## Implementation

- `model.ts`: every time comes from timestamps. `timing(start, allowed, pauses, now)` merges the candidate's breaks and the room's stops (overlaps count once; stops before the start or after the finish don't count) and gives the exact finish, time stopped, and time left. `shownFinish` rounds up to the minute; `allowed` is exact (25% of 90 minutes is 22 min 30 s). `sanitizeExam` reads saved data leniently and bounded (12 papers, 200 candidates, 100 stops each, one open stop at most).
- `index.tsx`: the controls. Papers (subject, length, extra-time groups for the board, start now or at a time, "Count from 09:00:00" for a start part way through a minute); everyone's time (stop and start, for an evacuation); candidates (number or initials, paper, extra time, note; Rest break and Back; a Change panel for a late start, extra time, label, and note); board settings (centre, room, 12/24-hour, seconds, dark, candidates on the board); the record, printed on its own; a new exam. A status bar keeps the time to the second, a stopped room, and who's on a break in sight. A break or stop ended within 3 s is a mis-tap and is dropped.
- `Board.tsx`: the actual time, date, centre, and each paper's start, finish, and extra-time finishes; candidates' own finishes by number only if switched on. It fits itself to the screen, shrinking only for each content and screen size; four or more papers use two columns; only at its smallest does it scroll, so nothing is ever cut off.
- `ui.ts`: formatters made once and reused; a clock that ticks just after each second; the screen wake lock.
- Storage: `labs:exam-timekeeper`, version 1 (`{ exam, settings }`), through `useOtherTabs`; `NotSaving` when saves fail; a notice for unreadable saved data and for an exam from another day. The board opens in its own window (`#board`) and follows the controls through storage events.
- Size: 41 kB, 11.8 kB gzipped.

## Audit

Before the push, on the dev server and then the built site, in Chromium (Brave 155) and WebKit 27.2. Scripts in `.claude/qa/` (git-ignored): `exam-timekeeper-test.ts`, `et-flow.cjs`, `et-audit.cjs`, `et-offline.cjs`.

**Correctness.**
- Model: 10,875 checks. 4,000 random exams against an independent second-by-second simulation (working time grows only in seconds no stop covers): 0 mismatches in finish, time stopped, time left, or open stops. Hand-worked cases: extra time to the second, overlapping stops counted once, stops before a late start or after a finish ignored, rounding.
- Browser flow (`et-flow.cjs`, 46 checks per engine, on a fake clock): two papers, three candidates, a late start, rest breaks, room stops overlapping a break, a reload during a stop, extra time changed mid-exam, the board here and in a second window, print, and a new exam, with every finish checked against hand-worked answers.

**Material defects found, all fixed before the push:**

| Found | Effect | Fix |
|---|---|---|
| A new date formatter for every time shown | With the largest exam (200 candidates, 10 breaks each) and the CPU slowed 4×, each one-second tick froze the controls for 7.1 s | Formatters made once (0.53 s), then candidate rows and the record redrawn once a minute unless something in them is live (0.10 s) |
| Fit-to-screen swinging between two sizes when text wrapped differently | "Maximum update depth exceeded": the board fell to "This experiment couldn't load" with 6 papers and 30 candidates | Shrinks only, starting again at full size when the content or screen changes; settles before it's drawn |
| The largest exam ran off the board | Its last lines were hidden | Two columns for four or more papers; scrolls only at its smallest |
| Start pressed a moment after 09:00 | A 90-minute paper read "Finish 10:31": safe, but looks wrong on a projector | "Count from 09:00:00", offered, never silent |
| A break started and ended at once | Moved a finish on by a minute | Under 3 s it's a mis-tap: dropped, and said so |
| Each paper's title field and the candidate form's paper menu were all named "Paper" | Ambiguous for screen readers | Papers grouped as "Paper 1", "Paper 2"; the field is "Subject and paper"; length fields "Hours" and "Minutes" |
| The record scrolls sideways at 390 px but couldn't be reached by keyboard | axe: scrollable-region-focusable | A named, focusable region |
| Time fields showed no focus ring | Inside a time field, focus doesn't count as `:focus-visible` | Their own ring on `:focus` (Chromium's own clock-picker icon keeps its native ring) |
| "In UK exam rooms" | JCQ's rules don't cover Scotland's exams | "For exams under JCQ's rules, such as GCSEs and A levels" |

Added for the core job during the audit: the status bar, and the Change panel (a wrong extra time could otherwise only be fixed by removing the candidate and their breaks).

**Hostile input and persistence** (`et-audit.cjs`, both engines): unreadable saved data gives a notice and a working page; saved data of the wrong shapes (`__proto__` ids and labels, HTML, right-to-left text, times at a date's limits) loads as plain text with no prototype pollution; an exam from another day says so; storage that refuses gives the not-saving notice; two windows stay in step.

**Accessibility:** axe finds 0 violations on the controls (1280 px light, 390 px dark) and the board. By keyboard: a paper started with Enter, a candidate added with Enter, a break started with Space and ended with Enter, with focus staying on the button that changed; 60 Tab presses, every control named and ringed. Text at 200%: no sideways scroll. Changes are announced politely; the board's clock isn't announced.

**Performance:** a busy hall (6 papers, 3 groups each, 30 candidates) fits the board without scrolling at 1280×720 and 1024×768 (smallest text 12 px); the largest allowed exam hides nothing; the longest task per tick is 0.10 s with the CPU slowed 4×.

**Privacy:** no requests to any other site, in either engine; the exam stays in this browser.

**Offline** (`et-offline.cjs`, both engines, the built site on a real server that was then stopped): the page, the saved exam, a rest break, and the board in a new window all work.

**Site-wide:** the 27-page smoke test on the built site, 108 page loads, 0 problems; the model tests and the build pass.

**Browser coverage:** Chromium and WebKit through Playwright. Not covered: Firefox (parked), real Safari on an iPad, Windows browsers, real projectors and second screens, and the wake lock (headless browsers can't show it).

**Residual uncertainty:**
- Whether exams officers would use a web page in a JCQ room at all: approval of tools, locked-down school laptops, kiosk setups. Needs people.
- The device's clock is trusted as it is.
- One device: two invigilators can't share live state, by design.

## Production verification

2026-10-13, commit 731ed53, deploy run 38374652232 succeeded.
- Production's 63 files are byte-identical to the local build of that commit; `/exam-timekeeper/` answers 200 with its own title and canonical address.
- `et-flow.cjs` against production: 46 of 46 in Chromium and in WebKit (the whole exam flow on a fake clock, the board here and in a second window, print, phone width in dark mode, console clean).
- `et-audit.cjs` against production: every check passes in both engines.
- `et-offline-prod.cjs`: with the browser's network cut after one visit, an address never saved fails while the page, the saved exam, and the board in a new window all load, in both engines.
- The 27-page smoke test on production: 108 page loads, 0 problems. The daily check: 11 of 11 (it reads the sitemap, so it now covers 27 pages).
- The homepage lists it first under School & work ("4 of 26").

## Lifecycle recommendation

(At closeout.)
