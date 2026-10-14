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
