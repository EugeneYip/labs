# Durability audit

P9 of the autonomous queue, 2026-10-12. It covers:
- what each experiment stores;
- export and import round trips;
- schema versions and the shared storage quota;
- more than one open tab;
- what a page says when saving fails.

Checked in Chromium and WebKit, on the built site served to Playwright (`route-preload.cjs`).

## What's stored

21 experiments keep what they remember in the site's one localStorage, under `labs:<slug>`, and Family Stories uses IndexedDB. CSV Checkup, Form Check, and Photo Scrub keep nothing. "After P9" is the state after the fixes below.

| Experiment | Kept | Bounded by | When saving fails (after P9) | Another open tab (after P9) |
|---|---|---|---|---|
| Ranked Choice Count | candidates, ballots, seats | 40 candidates, 100,000 ballots | says so | takes it up |
| Fluency Check | passage, settings, every check; a check under way (`:run`) | no cap on checks | says so | takes it up (the log only, during a check) |
| Stall Till | items, sales, cash count; an unreadable copy (`:unreadable`) | 40 items, 20,000 sales | says so | takes it up |
| Custody Calendar | the schedule | 1,000 swaps | says so | takes it up, and a clear |
| Discussion Map | people, seats, turns | 50,000 turns | says so | takes it up |
| Secret Santa | the organizer's setup and links | 100 people | says so | takes it up |
| Playing Time | roster, absences, format | 30 players | says so | takes it up |
| Serve Time | the plan, cooking mode | 20 dishes of 15 steps | says so | takes it up |
| Gallery Wall | frames, layout | 24 frames | says so | takes it up |
| Tear-Off Flyer | text and settings; a photo (`:photo`) | photo downscaled to 1,600 px | says so (photo and text) | takes up the text |
| Off Book | script, part, line marks | 500,000 characters | says so | takes it up |
| Day Clock | the caregiver's settings | a 200-character message, 30 reminders | says so, in Settings | takes it up |
| Trip Board | the board; an unreadable copy (`:unreadable`) | 5,000 items | says so | takes it up (it already did on the storage event) |
| Family Stories | interviews and recordings (IndexedDB) | the device's space | says so | recordings are kept one by one; see below |
| Glance | each day's guesses | one entry a day | silent (a game) | merges (it already did) |
| Fair Share | recent groups (the group lives in its link) | 20 groups | silent (the link is the copy) | re-reads before each write |
| Frost Dates | place and settings; the last place's records (`:data`) | one place | silent (settings) | last change wins |
| Line Dry, In Tune, Numbers by Ear, Back Row, Clean Paste | settings | small | silent (settings) | last change wins |

## Found and fixed

### 1. Two open tabs erased each other's work

**Data loss.** Every experiment saves its whole state on every change. Only Trip Board and Glance listened for another tab's saves. So a tab left open with older state wrote it back the next time anything changed there, erasing what a newer tab had saved.

The real case is a phone. A page opened again from a bookmark or the home screen often opens a second tab, while the first stays in the background.

**Evidence** (`p9-tabs-stall.cjs`):
- Stall Till, opened, one sale made.
- A second tab opened, two more sales made: 3 saved.
- Back in the first tab, the Today tab clicked: 1 saved. The two sales were gone, in both engines.

`p9-tabs.cjs` then checked 13 experiments, 9 checks each. Before the fix it found 50 failures: 12 experiments never took up another tab's save, and Trip Board missed saves made while its tab was in the background, as its own sync used only the storage event.

**Fix** (shared, `src/components/useOtherTabs.ts`). When another tab saves, the page loads what was saved and carries on from there. It notices in two ways:
- the browser's storage event;
- a fresh read whenever the page is shown again, for a background tab or a page restored by the Back button, which can miss the event.

Four details:
- **Missing values.** A value found missing on return is ignored, not taken as "cleared". The browser may have removed old site data itself (Safari can, after weeks without a visit), and Day Clock deliberately saves again to put it back. A removal announced by another tab is followed, such as Custody Calendar's "Clear it from this device".
- **No echo, little cost.** A changed value is written straight away. An unchanged one is written only if what's stored differs (the browser cleared it). So two tabs don't keep re-saving each other's saves, and a large value isn't read back on every change.
- **A gap at load.** The stored value is noted while the page loads and read again once it starts listening, so a save in between isn't missed.
- **Fluency Check during a check.** It takes up only the log, so the passage being read can't change under the reader. What it takes up isn't saved back unless something changes here. And a tab with no check under way clears a leftover check record only once, when it opens: taking up another tab's save used to clear that tab's finished check from the record, so a reload there lost it from the screen (the check stayed in the log).

Pages whose fields hold their own copy of the text start those fields again from what was taken up: Secret Santa, Serve Time, Gallery Wall, Day Clock, and Ranked Choice Count's candidates. Thirteen experiments use the hook, Trip Board's own sync included.

**After the fix:**
- `p9-tabs.cjs`: all 117 checks pass in each engine. The four cases are another tab's save announced, a save missed then seen on return, a removal missed (the tab keeps its own), and a removal announced (the tab follows).
- `p9-tabs-stall.cjs`: 3 sales of 3.
- `p9-tabs-fluency.cjs`: during a check, the passage stays, the other tab's save isn't overwritten, and after saving the log has both tabs' checks. 6 of 6 in each engine.
- `p9-echo.cjs`: one change, then 1 or 2 writes, then storage stays still, for every experiment.
- `p9-fluency-run.cjs`: a check under way still comes back after a reload, "Next reader" still clears it, and another tab's finished check stays on record while an idle tab takes up its save (that last part failed in a build without the guard).
- `p9-dayclock-restore.cjs`: with the settings cleared without an event and a fake clock run past noon, Day Clock saves them again as the afternoon begins.
- **Cost** (`p9-typing-profile.cjs`): with 10,000 checks saved and the CPU slowed 4x, typing six letters into Fluency Check takes the same CPU time, within noise, before the tab sync and after (394 to 585 ms across runs).
- **Offline** (`p5-offline.cjs`, the scenarios that don't deploy): the hook and the notice are two small shared files now (853 and 296 bytes), preloaded with each experiment. The six focus experiments still load offline after a first visit, and so do all 26 pages, in both engines.

### 2. Nine pages holding typed-in work saved silently when storage failed

From P4: when the browser refused to save, 15 experiments stayed silent. The ones holding work now say so with a shared notice (`src/components/NotSaving.tsx`), in the same style as Stall Till's and Fluency Check's:
- Ranked Choice Count, Discussion Map, Secret Santa (both before and after the draw), and Custody Calendar;
- Playing Time, Serve Time, and Gallery Wall;
- Tear-Off Flyer's text (its photo already had one);
- Day Clock, in Settings only, so the clock face stays calm.

Each notice says how to keep the work: print it, copy a share link, download it, send the links, or keep the page open.

**Checked** (`p9-notsaving.cjs`): with every Labs save refused, all 13 notices show, in both engines, at 390 px with no sideways scrolling. Text contrast is 8.0:1 in light mode and 10.3:1 in dark (`p9-notsaving-look.cjs`).

A page whose saved data is already exactly what it would write saves nothing until something changes. So with stored data and full storage, the notice comes with the first change, which is the first thing that could be lost.

### 3. "A private window" wasn't why saves failed

The notices said saving failed because of "a private window, or storage is full". In current browsers, private windows do keep localStorage until the window closes (every throwaway Playwright profile here does), so a refused save means the storage is full or blocked. Stall Till's and Fluency Check's notices now say "its storage is full or blocked", like the new ones.

Family Stories still names private windows, which is accurate there: WebKit's private mode won't keep a recording in IndexedDB (P8).

### 4. One damaged Trip Board item hid the whole board

From P4: the saved board was read with the import check, which refuses a whole file for one bad item. The board was set aside under `labs:trip-board:unreadable`, and an empty board showed with no message.

**Fix:** `readSavedBoard` keeps every item it can read. When anything is left out, or the board can't be read at all (such as one from a newer version), a copy of what was saved is kept, and a notice offers:
- the count left out, or that the board started empty;
- **Download the copy**;
- **Dismiss**, which deletes the copy.

Importing a file still refuses a damaged file whole, with the reason.

**Checked** (`p9-tripboard-aside.cjs`, both engines; `trip-board-test.ts`, 10 tests):
- the readable items show;
- the copy downloads byte for byte, and is still offered after a reload;
- Dismiss clears it for good;
- a newer-version board starts empty, with its notice.

## Held up

- **Export and import round trips through the pages** (`p9-roundtrip.cjs`, both engines), with quotes, commas, line breaks, emoji, right-to-left text, and formula-looking text:
  - Trip Board: a board exported and imported into a fresh browser is identical, 6 of 6 items;
  - Fluency Check: 6 checks downloaded as CSV and loaded into a fresh browser come back the same, to the minute;
  - Custody Calendar: a share link opened in a fresh browser saves the same schedule.

  The unit tests cover the same round trips, plus Fair Share's link. Stall Till's and Discussion Map's CSVs, Family Stories' ZIP, and the printouts are one-way by design.
- **Damaged saved data** (`p4-storage.cjs`): the P4 storage fuzz plants damaged values in every field of every experiment's saved data, 4,863 cases. Rerun on the tab-sync build: 0 failed and 0 flaky in Chromium, and the same in WebKit. Fluency Check and Trip Board changed after that build, so their 929 cases ran again on the final build: 0 failed and 0 flaky in each engine. The faster save, also later, changes only when an unchanged value is written, which none of these cases depends on.
- **Unit tests:** all 25 files pass.

## Residual risks, and a rule for the next format change

- **One storage budget for the whole site:** 5,242,880 characters, in both engines (P4). The largest possible users:
  - Ranked Choice Count: about 32 characters a ballot, so 100,000 ballots is about 3.2 million;
  - Stall Till: about 120 a sale, so 20,000 sales is about 2.4 million;
  - Fluency Check: about 200 a check, with no cap, so 10,000 checks is about 2 million;
  - a Tear-Off Flyer photo: up to about 1.5 million;
  - an Off Book script: up to 500,000.

  When the budget is full, every page holding work now says it isn't saving, but not which experiment holds the space.
- **Settings-only pages** (Back Row, Clean Paste, Frost Dates, Line Dry, In Tune, Numbers by Ear) save silently, and across tabs the last change wins. They hold settings only.
- **Family Stories** keeps each recording as its own record, so tabs can't erase each other's recordings. The interview record (topics, your own questions, the question reached) is written whole, so across tabs its last change wins.
- **Limits of the tab sync:**
  - two tabs edited at the same moment: the later save wins;
  - half-typed text in a field is replaced when another tab's save is taken up;
  - a removal noticed only on return is ignored.
- **Private windows** keep everything until the window closes, and a page can't tell. Trip Board, Fluency Check, and Family Stories mention that browsers can clear saved data; the others don't.
- **Schema versions.** Everything is saved as version 1, with no migrations. The loaders read leniently and mostly ignore the version; Trip Board refuses other versions, and so does Fluency Check's check under way.

  An older page will meet newer data: a tab left open across a deploy, or an offline copy. It reads the data with its old loader and drops whatever it doesn't know. Since P9 it also takes up other tabs' saves, and then saves its own reading back at once. So adding fields isn't enough. **Rule for the next format change:** save the new format under a new key (such as `labs:<slug>:v2`), and copy the old key's data across once, leaving the old key as the old code expects. Old pages then keep to the old key, and neither version can overwrite the other.

## Files

All in `.claude/qa/` (ignored by git), with results in `out/p9-*.txt`:
- tabs: `p9-tabs.cjs`, `p9-tabs-stall.cjs`, `p9-tabs-fluency.cjs`, `p9-fluency-run.cjs`, `p9-echo.cjs`, `p9-dayclock-restore.cjs`, `p9-tabs-debug.cjs`;
- cost and offline: `p9-typing-cost.cjs`, `p9-typing-profile.cjs`, `p5-offline.cjs`;
- notices: `p9-notsaving.cjs`, `p9-notsaving-look.cjs`;
- round trips: `p9-roundtrip.cjs`;
- Trip Board: `p9-tripboard-aside.cjs`, `trip-board-test.ts`;
- the fuzz: `p4-storage.cjs` with `p4-storage-seeds.cjs`.
