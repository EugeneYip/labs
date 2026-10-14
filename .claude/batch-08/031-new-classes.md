# #031 New Classes

Dossier. The decision and its evidence are in `CANDIDATES.md` ("Discovery for #031"). Address: `labs.eugeneyip.net/new-classes/`, homepage category `school`, code in `src/experiments/new-classes/`, built on the local branch `wip/031-new-classes`.

## The job

A primary-school leader or teacher mixes a year group into next year's classes. They have a spreadsheet (or placement cards): each child's name, and whatever matters (gender, attainment band, needs, first language, current class), the friends each child named, and children who must be kept apart. They need classes of the right sizes, each with an even spread, every child with at least one friend they named where it can be done, nobody with a child they're kept from, and lists to print and send on. Today: cards on a table, a spreadsheet, or a paid tool that takes the data to its servers.

## Scope (first version)

- **In:** one row per child, as a CSV file or cells pasted from a spreadsheet: a name (or first and last names), friends (in one cell or several columns), keep-apart (the same), keep-with (optional), and any columns to balance. The page guesses each column's role from its header and lets every guess be changed. A "New class" column, as the page's own download writes, starts from that placement (to carry on later).
- **Settings:** how many classes, their names, their sizes (as even as possible unless set), which columns to balance. A number column (a score) is balanced in thirds (lower, middle, higher), and the page says so.
- **The rule,** each step only when the ones before are level:
  1. the hard rules: children kept apart never together, children kept with each other together, children fixed to a class stay there, sizes within their limits (if they can't all hold, the page says which and why);
  2. the fewest children without at least one friend they named (among children who named friends who were found);
  3. each balanced column as even as possible across the classes (for each column, the squared difference between each class's count of each value and its fair share, divided by how many children that column has, summed over columns);
  4. the most named friendships together.
- **Suggest:** exact (every placement compared) when the number of placements is small enough; otherwise a search that never returns a worse placement than its start, can be stopped, and replays from its number.
- **By hand:** move a child to another class, fix a child to their class, with every class's numbers updating.
- **Out:** each class's list with its spread (size, each balanced column's counts, friends met) and each child's friends in the class; children without a named friend flagged; print (a class a page); CSV with the original columns and "New class" (which opens again here).
- **Nothing saved:** the roster holds children's data, so nothing is stored in the browser; leaving with an unsaved result asks first; the download is how to keep it.
- **Left out:** mixed-age classes across year groups, teacher assignment, sets for subjects, room capacities, more than one round of nominations.

## Principal failure modes, and how each is handled and checked

| # | Risk | Handling | Check |
|---|---|---|---|
| 1 | Columns read wrongly (names split across columns, friends in several columns, gender written many ways, flags as Y, yes, ✓, 1) | Role guessed from the header and cells, every role editable; values tidied for display but compared as written (case and spaces ignored) | Reader cases from MIS-style and hand-made exports |
| 2 | Friends named differently from the roster ("Ava S", "Ava" alone, nicknames, typos) | Full name, then first name when only one child has it, then first name and surname initial; unmatched names listed, with what they might be | Reader cases |
| 3 | Two children with the same name | Flagged; nominations naming them counted as unmatched | Reader cases |
| 4 | Impossible rules (a keep-with group bigger than a class, more children all kept apart than classes, fixed children overfilling a class) | Checked before the search; each problem named | Model cases |
| 5 | The search is wrong or worse than its start | The objective recounted independently; the best kept from the start; hard rules counted as the first step | Brute force over every placement for small year groups; a separate Python implementation; property checks |
| 6 | Claiming too much ("balanced", "fair", "best") | Numbers shown, never adjectives; "best possible" only when every placement was compared | Wording review |
| 7 | Children's data leaving the device or lingering | No network use after load; nothing saved; a warning before leaving with an unsaved result | Network log; storage inspected after a flow |
| 8 | Large year groups freeze the page | Limits stated; time-sliced search with progress and Stop | Timed runs at the limits in both engines |
| 9 | Moving children by keyboard and screen reader | A "Move to" control per child, focus kept, changes announced | Keyboard pass, axe |
| 10 | Phone width and print | Classes stacked on phones; a class a page in print | 320 px, 390 and 1280 px at 200% text; print to PDF |
| 11 | CSV formula injection | Leading `= + - @` defused | Model case |

## Evidence plan

- Brute force over every placement for year groups of up to about 10–12 children in 2–3 classes, against the search, including the hard rules.
- A separate Python implementation of the rule recounting results.
- A realistic year group (60–90 children, 3 classes, friends and keep-apart from a generator shaped like real nomination data), timed, with the page's numbers recounted from what it shows.

## Log

- **2026-10-13:** chosen (`CANDIDATES.md`). Risk list written.
- **2026-10-14:** `model.ts` and `roster.ts` (milestone eda7c63). The first full check run exposed two faults, both in the product: counting placements pruned only on class maximums, so with tight minimums it walked an astronomically large tree (the 300-child check never finished); and three long annealing runs often ended in a basin that was right on the first three steps of the rule but short on the fourth (friendships together), and occasionally on spread. Fixed: counting and the every-placement walk prune on what the remaining children can fill, with a work budget (past it, the search is used); the every-placement walk runs a node at a time, so it is time-sliced like the search; the search became four annealing runs (half the proposals aimed at the class of someone the child named), a polish after each (every move and swap, kept when the rule says it's better), then kicks (three swaps of children alike in every column, a polish, kept when no worse), with as much work as the annealing. A harness fault too: the random generator could ask a 3-child group for 3 distinct friends and loop forever. Results: 600 small year groups against every placement (all the best; exhaustive); the search alone (every-placement comparison off) against every placement for 9-16 children, 240 of 240, and 720 of 720 over three seeds in the sweep; 22 children in 2 classes of 11 (705,432 placements), 12 of 12; on nomination-shaped year groups (60 in 2 classes, 90 in 3, 150 in 5, 300 in 10), the default matched a six-times-longer reference in 29 of 33 runs, the rest within a few friendships on the fourth step; the Python recount, 300 of 300 recounted, keeping the rules, and the best of every placement; limits lowered to 600 children (12 classes, 12 columns), 14 s in Node at the limits; 90 children 1.0 s, 300 children 5.6 s.
- **2026-10-14:** the page (milestone 5584238), then the audit. Browser harness `nc-flow.cjs` (Chromium and WebKit, desktop light and phone dark): the example's reading matched an independent reading (172 friendships, 3 pairs apart); the shown numbers recounted independently from the class lists before and after suggestions; moves, fixes, undo, class count, sizes and their problems, renaming, the CSV round trip, names matched by hand, MIS-style and "Last, First" spreadsheets, impossible rules, the leave warning, nothing stored (localStorage, sessionStorage, IndexedDB), no requests after load, print, 600 children in 12 classes (4.0–4.7 s, 120 frames in the first 2 s, a move 27–41 ms), Stop, limits, axe, overflow at 320, 390 and 1280 px (200% text at the last two). The audit found and fixed, all in the product: undo after a move by hand could leave a fixed child outside their class (moves and fixes now end the undo, and fixed children are put in their classes before a search); changing the number of classes lost hand placements without a way back (now undoable); the CSV's formula guard turned negative numbers into text (plain numbers kept); workbooks were read as text (refused with a note) and Windows-1252 CSVs lost their accents (decoded); repeated names couldn't be told apart (shown with their row); focus fell to the page when a search ended, seen in WebKit at phone width (an effect after the button returns); a problems list put `role=status` on a `ul` (axe); MIS headers "Legal Surname"/"Legal Forename" and friends written "Park, Leo; Chen, Mia" were misread (header patterns, splitting at semicolons before commas); the claim "where it can be done" (now "wherever it finds a way"); print lists in one column and a trailing page break. Also: surname order in class lists. Final: model checks 53 of 53, the Python recount 300 of 300, the browser harness 131 of 131 in each engine, print to PDF a class a page (3 pages for 3 classes), the site smoke test on the build 128 loads with no problems.
