# #030 Show Order

Dossier. The decision and its evidence are in `CANDIDATES.md` ("Decision for #030"). Address: `labs.eugeneyip.net/show-order/`, homepage category `groups`, code in `src/experiments/show-order/`, built on the local branch `wip/030-show-order`.

## The job

A dance-studio owner (or whoever runs a showcase, school concert, or variety show) has the routines and who is in each. They need a running order where nobody is in back-to-back numbers and quick changes are as few as possible, then each dancer's numbers for the dressing room and a printed order. Today: index cards or a spreadsheet, gaps checked by eye; or a paid tool.

## Scope (first version)

- **In:** routines pasted as lines ("Routine: name, name, …") or opened or pasted as a table (CSV, or copied from a spreadsheet) in the three shapes rosters come in: a routine per row with its dancers in one cell, one dancer per row with the routine beside it (what studio software exports), or a grid of dancers against routines with marks. Optional duration per routine.
- **The rule:** a change is quick when a dancer has fewer than N numbers between two of their routines (default 3, Dance Teacher's threshold; 1 to 5). Back to back (none between) is always worst. A change across an intermission is never quick.
- **Suggest an order:** the fewest back-to-backs first, then the fewest changes with one number between, then two, and so on (each level before the next), and among orders as good as that, the one closest to the planner's own order. Routines can be pinned (opener, finale, anything) and kept before or after an intermission. The search is replayable from its number and can be stopped; it never returns an order worse than the one it started from.
- **By hand:** move routines (drag, or buttons and keyboard), with quick changes shown live; undo the last suggestion.
- **Out:** each dancer's numbers and gaps; the quick changes for backstage, in show order; print (running order, dancer list, quick changes); CSV download of the order and of the dancers' schedules.
- **Saving:** the plan in this browser (`labs:show-order`, through `useOtherTabs`, `NotSaving` when refused) and a file to download and open again.
- **Left out:** splitting a recital into several shows (keeping families together), minutes-based rules (durations only shown: start times and total length), costumes, music cues, live backstage use.

## Principal failure modes, and how each is handled and checked

| # | Risk | Handling | Check |
|---|---|---|---|
| 1 | Names split wrongly (a list's separators, "Last, First" in one cell, "and"/"&") | Commas, semicolons, and line breaks inside a cell separate names; a table with first- and last-name columns joins them; the parsed dancers are shown before planning | Parser cases from real line-ups and studio-export shapes |
| 2 | One dancer written two ways ("Emma  Leck", "emma leck"; "Emilia (Emmy) Hunt" and "Emmy Hunt") | Case, spacing, and accents ignored when matching; likely duplicates listed (same surname and first initial, or a bracketed nickname) with a merge | Model cases; the real line-up |
| 3 | Same routine name twice, a dancer twice in one routine, routines with no dancers | Kept apart by position and flagged; duplicate dancer dropped with a note; empty routines allowed (they space others out) | Model cases |
| 4 | The search is wrong or worse than the start | Exact cost recounted independently; the best order kept from the start; pins and intermission sides enforced by construction | Brute force over every order for small shows; a separate Python counter on random and real shows; property checks (pins, sides, never worse) |
| 5 | Claiming too much | "The fewest found" unless a per-dancer lower bound proves it can't be beaten; then "the fewest possible", with which dancers make quick changes unavoidable and why | Bound checked against brute force |
| 6 | Large shows freeze the page | Limits (routines, dancers, appearances) stated; the search yields with a MessageChannel, shows progress, has Stop, and has a time limit | Timed runs at the limits in both engines |
| 7 | Data loss | Saved through `useOtherTabs`; `NotSaving` if refused; download and open a plan file; damaged saved data never breaks the page | Two tabs, refused storage, damaged-storage cases |
| 8 | Drag is unusable by keyboard or touch | Up and down buttons, "move to number", keyboard shortcuts; moves and counts announced; focus kept on the moved routine | Keyboard pass, axe, phone width |
| 9 | Long lists and names on a phone; print across pages | Wrapping, no sideways scroll; print styles per list | 320 px and 200% text; real print to PDF |
| 10 | CSV formula injection | Leading `= + - @` defused as elsewhere in Labs | Model case |
| 11 | Privacy wording | "Nothing you paste is uploaded"; what's kept in this browser and how to clear it | Network log during a full flow |
| 12 | Offline | The service worker keeps the page after a visit | Offline check in both engines |

## Evidence plan (independent of the code under test)

- A studio's real published 2026 line-up (27 routines, 92 dancers; names replaced with consistent pseudonyms for the test files): its own order has 40 changes with two numbers between and none back to back; a plain local search found orders with none under three.
- Brute force over every order for shows of up to 8 or 9 routines, against the page's search and its lower bound.
- A separate Python counter of gaps and quick changes on random and real shows.

## Log

- **2026-10-13:** chosen (`CANDIDATES.md`). Risk list written.
- **2026-10-13, model milestone** (`model.ts`, `roster.ts`): the rule, the gap count, the per-dancer floor, settling kept routines into their parts, the search, and the reader for lines and the three table shapes.
  - **The tests caught a weak search:** with a reduced budget the annealing missed the best order on 2 of about 1,500 small shows. Fixed by comparing every allowed order when 8 or fewer routines can move (at most 40,320; then the page can say "best possible") and by ending each run with a swap-by-swap polish under the exact rule; the search also stops early once the floor proves the result and the distance has stopped improving.
  - **Checks** (`.claude/qa/show-order-test.ts`, 60 of 60; `.claude/qa/show-order-check.py`): every small show matches a brute force written separately (levels on all, the closest order on at least 97%); the annealing alone matches brute force on 30 of 30 shows of 9 routines; a Python reimplementation recounts 397 results and finds each one is the best order by the rule, distance included; the floor equals the true fewest for one dancer in 3,000 cases and never exceeds the true fewest total; pins and parts hold; the same number replays the same order; never worse than the start.
  - **The real line-up** (pseudonymized, `.claude/qa/show-order/real-2026.txt`): the studio's order counts 0 back to back and 40 with two between; the search, keeping the opener, removes all of them while moving 4 routines (proved: the floor is 0); with four between, 0 against the studio's 74.
  - **Time** (node): 80 routines and 250 dancers in 0.8 s; 400 routines with 11,000 appearances in 10 s.
- **2026-10-13, page milestone** (`index.tsx`, `example.ts`, registry entry): reading with a live summary, the running order in parts, quick changes marked on each routine, moves by buttons, keyboard, "move to number", and drag, pins, keeping routines before or after an intermission, suggest with progress, Stop, and Undo, the quick-change and dancer lists, print by section, CSV, and saving through `useOtherTabs`.
  - **Found and fixed on the way:**
    - a manual move shifted pinned routines (now only free routines shift round them, and a move onto a pinned place goes past it);
    - stale parts after editing or changing an intermission (now settled again);
    - the shape picker showing a choice it hadn't made;
    - the read mode from a CSV file sticking after other text was pasted;
    - a "Last, First" name column read as two-name lists;
    - a suggestion moving the finale (openers and finales are now pinned by name, with a note naming them);
    - wording ("12 1 between");
    - grouped quick changes running together for screen readers;
    - about 90 Tab stops before the rest of the page (a skip link);
    - controls and dancer rows wider than a phone at 200% text.
  - **Browser checks** (`.claude/qa/so-flow.cjs`, against the built site): 102 of 102 in Chromium and 102 of 102 in WebKit, at desktop light and phone dark. They cover: the example's counts against an independent count from the page's own text; a suggestion (28 quick changes to 2, pins kept, recounted from what the page shows); undo; moves with focus and announcements; moving past pins; move to number; intermissions; the rule from 1 to 5; reload; another tab's move taken up; editing with pins carried over; the CSV round trip; dancer-per-row and grid tables; merging a likely duplicate; print by section; a 150-routine show in about 2.3 s; Stop within 3 s; refused and damaged storage; 320 px, and 390 px and 1280 px with text at 200%, every fold open; axe at three points; no request during the flow, and only the site's own files after a reload; console clean.
- **2026-10-13, audit** (`.claude/qa/so-audit.cjs`, `so-offline.cjs`, `so-shots.cjs`):
  - **At the limits the page froze:** 400 routines with 19,478 places took 12.5 s to search with 16 timer ticks where 125 were due. Three causes, all fixed:
    - work was cut by steps, not time (now 12 ms slices; the steps, and so the replay, are unchanged);
    - every progress update redrew the whole list (now the bar updates on its own);
    - the end-of-run polish compared 80,000 pairs in one go (now resumable, a few pairs at a time).
    Now 103 of about 107 ticks in Chromium and 111 of 128 in WebKit; the search takes 10.7 s and 12.8 s.
  - **Moves allocated per candidate:** each "move" step rebuilt 5,000 lists; it now counts without allocating and rebuilds only when a move is kept.
  - **Two overclaims narrowed:** "nobody dances in back-to-back routines and quick changes are as few as possible" (neither is always possible, and the page proves it only sometimes) became "as few quick changes as the page can find"; "saved until you start again" now says a browser can clear it (Safari after about a week without a visit).
  - **Print:** the running order prints each routine's dancers, without the screen's notes ("moved from", "pinned"); each section prints alone (checked from the PDFs' text).
  - **Checks:**
    - the real line-up pasted in: 27 routines, 92 dancers, 40 with two between, then 0 with the opener pinned;
    - focus to the order after planning; headings h1, h2 sections, h3 parts;
    - the skip link; 140 Tab presses, every stop visible;
    - offline in Chromium and WebKit (the server stopped: plan, suggest, read a file);
    - a visual review at phone and desktop, light and dark;
    - after every fix: model 67 of 67, Python 397 of 397, the flow 102 of 102 in each engine, the audit 15 of 15 (Chromium) and 12 of 12 (WebKit).
- **2026-10-13, shipped and verified in production.**
  - **Ship:** commit a329ca8 (one squashed commit on `main`), deploy 38494521064 succeeded.
  - **Production:**
    - all 71 files byte-identical to a fresh build (102 addresses);
    - the flow 102 of 102 in Chromium and in WebKit on the live site;
    - the audit 15 of 15 and 12 of 12 (the real line-up, 400 routines searched in about 11 s with the page responsive, keyboard, print);
    - offline with the network cut, in both engines (plan, suggest, read a file), the homepage card under Groups & community;
    - the whole-site smoke test, 124 page loads, 0 problems; the daily check 11 of 11.
  - `wip/030-show-order` deleted (nothing on it that `main` lacks).

## Lifecycle (provisional, for the closeout)

MAINTAIN, with promotion if studios use it. For: a named professional (the studio owner) with a recurring, error-prone job; no free tool found that suggests an order; a real line-up where a careful hand order left 40 quick changes that the search removed; verifiable correctness. Against: once or twice a year per studio; studio suites already check conflicts by hand; nobody has used it yet. Human validation that would settle it: a studio owner plans a real recital with it.
