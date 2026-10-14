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
