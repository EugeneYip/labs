# #029 Places by Choice

Dossier for Batch 07's fourth experiment. Research and decision: `CANDIDATES.md` ("Discovery for #029").

## Thesis

- **Audience:** whoever gives out places from ranked choices. First, school staff running enrichment, electives, clubs, and activities weeks; then university project and module leads, conference and training-day organizers, camps, and youth groups.
- **Job:** choices come in from a form (or slips); each activity has its places; give everyone a place as high on their list as the places allow, show that it's fair, and hand out the lists.
- **Alternatives:**
  - Scheduler by Alice Keeler: a Google Sheets add-on (70K+ users), greedy rounds by rank, broad Google permissions, Google Forms only.
  - Moodle's Fair Allocation: inside a Moodle course only.
  - Paid platforms (Clipboard, StatsDirect, event platforms), institutional systems (Southampton, Bath, Harvard).
  - Paper slips, spreadsheet rounds, first come, first served, a draw, or code (Python, R, Go, ASP).
- **Strongest incumbent:** Alice Keeler's Scheduler, for schools on Google Workspace.
- **Differentiation:**
  - It reads any form's responses: Microsoft Forms' ranking question, Google Forms' grid or one question per choice, or typed in.
  - It needs no account and grants no permissions, and nothing leaves the device.
  - The allocation is the best for the whole group by a stated rule, not greedy rounds, and shows what everyone got.
  - It handles minimum sizes (an activity too few chose is dropped, and its people are placed again).
  - Ties are broken by a lottery that can be replayed from its number.
  - Lists to print or download.
- **Strongest falsification argument:**
  - Many schools book activities first come, first served, or run a draw.
  - Google schools have a free incumbent.
  - The page does only the middle of the job.
  - "Best for the group" can be argued.
- **Why BUILD survived:**
  - Broad, recurring evidence of hand work and home-made code in schools, universities, and conferences, and platform users asking for exactly this.
  - Microsoft schools have nothing free.
  - Greedy rounds leave people lower than an allocation for the whole group.
  - The rule is shown, and the result is explained person by person.

## Risk list (before coding)

| Risk | Design answer |
|---|---|
| An allocation that isn't the best, or isn't what the page says it does | One stated rule, solved exactly as a minimum-cost flow: each person's choice number counts, squared (a fourth choice costs 16, two second choices cost 8), and being left without a place costs more than any choice. Checked against brute force on thousands of small random cases, and against greedy rounds on realistic ones |
| A result that changes each time it runs | Ties broken by a lottery from a draw number, shown with the result; the same responses, places, and number give the same allocation |
| A tie-break that changes the outcome's quality | The lottery only orders allocations that score the same: its weights are too small to outweigh one step in anyone's choice |
| Activities too few chose | An optional minimum per activity: below it, the activity with the fewest is dropped, and everyone is placed again; repeated until all that run are at their minimum, each drop said |
| People who can't be placed (all their choices full, or none valid) | Listed with the reason; an option to place them wherever there's room, said person by person |
| More people than places | Said before allocating, with the shortfall |
| Messy form exports | Three shapes recognized (a column per rank, one ranked-list column such as Microsoft Forms' "A;B;C;", a column per activity holding a rank such as Google Forms' grid), with a preview and the column choice shown; activity names matched ignoring case and spacing, and unrecognized ones listed; repeated names flagged, with the later answer kept only if asked |
| Personal data (pupils' names) | Nothing uploaded and nothing stored; a warning before leaving with results not downloaded; downloads get plain names |
| Large groups | Up to 5,000 people and 200 activities in a few seconds (the flow is solved with typed arrays and a heap); limits stated |
| Rounding the problem into something else (sessions over several time slots, keep-together and keep-apart rules) | Out of scope, and said: one place per person, or a set number of different places with no time slots |
| Accessibility and phones | Tables with headers, keyboard throughout, readable at 320 px; lists print one activity per page |

## Implementation

- `model.ts`: `allocate` drops activities fewer chose than their minimum, solves, drops the smallest activity left under its minimum and solves again until none is, fills the rest where there's room if asked, and gives each person left out a reason. `solve` is a minimum-cost flow by successive shortest paths, searched over activities (a person moving from one activity to another is an edge between them), with potentials so no search meets a negative cost; costs are the choice number squared, scaled so the draw's tie-breaks (a hash of the draw, the person, and the activity) can never outweigh one step in anyone's choice. It yields to the page every 40 ms and stops on a signal.
- `responses.ts`: CSV or a pasted table (the separator the first line uses most, RFC 4180 quotes, a byte-order mark), the three shapes forms write (a column per choice, Microsoft Forms' ranked list, Google Forms' grid), the name column, and activity names matched ignoring case and spacing. At most 20,000 rows, and says so if there were more.
- `example.ts`: a made-up school's enrichment choices (96 students, eight activities, three choices each).
- `index.tsx`: the responses (paste, open a CSV, or the example), which columns hold the names and choices (guessed, then changeable, with the first few as read), repeated names, the activities (places, an optional minimum, renaming to merge), give out places (progress and Stop), and the result: the totals by choice, who's left out and why, activities that don't run, the draw (replay or a new one), each activity's list (printable, one per page), everyone (find a name), and two CSV downloads. Nothing stored; a warning before leaving with a result not downloaded.
- Size: 34.4 kB, 11.3 kB gzipped. No dependencies.

## Audit

Before the push, on the built site, in Chromium (Brave) and WebKit 27.2 through Playwright 1.64. Scripts in `.claude/qa/` (git-ignored): `places-by-choice-test.ts`, `pbc-flow.cjs`, `pbc-narrow.cjs`, `pbc-offline.cjs`, and in `.claude/qa/pbc/`: `make.ts` (fictional responses in each form's shape), `independent.py` with `compare.ts`, `fuzz.ts`.

**Correctness by an independent method.**
- Exhaustive search on 4,000 random small cases (up to 7 people, 4 activities): the allocation matches exactly on how many are placed, the total, and the draw's tie-breaks; no activity over its places.
- An independent solver at realistic sizes: the textbook Hungarian method, written separately in Python (each place a column, "not placed" columns costed above any total), reading the files with Python's own csv module. On the example, the Microsoft Forms, Google Forms, and semicolon files, and six random school-sized cases with tight places (49 to 139 people), it agrees with the page on every count and total.
- Hand-worked cases: a person with only one choice isn't left out so others keep theirs (where rounds by rank would); squared costs don't move one person to a third choice to give two others a first.
- 17 model checks (`places-by-choice-test.ts`): the above, a draw replayed, other draws keeping the total, both kinds of drop for a minimum, filling only when asked, each reason for being left out, Stop, the three shapes, quotes and semicolons, and timing.

**Material defects found, all fixed before the push** (eight):

| Found | Effect | Fix |
|---|---|---|
| Opening a second file with fewer columns read it with the first file's column choices for one render | The page crashed ("This experiment couldn’t load") | Column choices belong to the table they were made for; the reader ignores columns a table doesn't have |
| The activities table on a phone | Places cut off ("2(" for 20), the minimum off the side; on a desktop, places boxes stretched across | Two counts in one column, fixed-width number boxes, a compact table |
| A button wider than a phone at 200% text | Sideways scrolling | Buttons that wrap; a shorter label |
| A draw typed and submitted at once could use the number before it, and a draw was blocked while placing | "Use this draw" gave the wrong draw now and then | The field's own value is read; the draw controls stay usable, and a new draw replaces one under way |
| Focus jumped to the heading after every new draw | Keyboard users lost their place (and a key press could be lost) | Focus moves to the result only when places are given out from the activities; a new draw is announced |
| More than 20,000 rows were cut without a word | A silent truncation (the 10,000-person limit kept it from giving wrong places) | Said |
| A merged spelling's places box looked editable but was ignored | Confusing | Disabled, with which activity's places count |
| Literal byte-order marks in the source where escapes were meant (the known `\u` trap) | Worked, but invisible in the code | Written as escapes; the scan is clean |

**Hostile input** (`fuzz.ts`): 3,000 runs of random text and damaged exports (quotes left open, separators mixed, huge cells) through the reader and a full allocation: no crash, the slowest 12 ms. 20,500 rows are read as 20,000, and the page says so.

**Performance:** 1,500 people in 40 activities: 0.23 s. 5,000 people in 200 activities with six choices each: 0.8 to 1.3 s in the browsers (1.8 s in Node), the worst case tried (5,000 people wanting the same few of 50, places short) 2.6 s. The page stays responsive (it yields every 40 ms, with progress) and Stop works.

**Browser checks** (`pbc-flow.cjs`, 64 checks, six clean runs, three in each engine): the example (96 placed, no activity over its places), focus to the result, the download (everyone, plain name), a new draw keeping the total, the first draw replayed giving the same lists, print (the lists only), Microsoft Forms' ranking column and Google Forms' grid found and placed, repeated names and "use only the last", a spelling variant matched, too few places (who's left out and why), a formula-like name defused in the download, filling, merging, Stop on 5,000 people, the leave-page warning, the keyboard path, axe, overflow, storage, requests, console, at 1280 px light and 390 px dark.

**Accessibility:** axe finds 0 violations on the start and on a result; no sideways scroll at 320 px, or at 390 and 1280 px with text at 200%.

**Privacy:** no request at all once the page has loaded; localStorage, sessionStorage, and IndexedDB stay empty; downloads have plain names; a name starting with =, +, -, or @ is written so a spreadsheet won't run it.

**Offline** (`pbc-offline.cjs`, the built site on a real server, then stopped): the page opens, gives out the example's places, and reads a file, in both engines.

**Site-wide:** the 30-page smoke test on the built site: 120 page loads, 0 problems.

**Harness issues, not the page's:** a dialog listener left from one step caught another step's dialog; the leave-page check is made by dispatching the event, not by closing the page.

**Browser coverage:** Chromium and WebKit through Playwright. Not covered: Firefox (parked), real Safari and iOS, Windows, and exports from the forms themselves (the fixtures follow their documented shapes: Microsoft Forms' "A;B;C;" ranking column, Google Forms' "Question [Item]" grid).

**Residual uncertainty:**
- Whether the squared rule is the one organizers want: it's stated and shown, with the totals by choice, but some will want "as many first choices as possible" instead.
- Real exports' quirks (other form tools, other languages' headers); the column choices can be set by hand.
- No sessions at different times, and no keeping people together or apart: said on the page.

## Production verification

2026-10-13, commit a9655d0, deploy run 38462428804 succeeded.
- Production's 69 files are byte-identical to the local build of that commit.
- `pbc-flow.cjs` against production: 64 of 64 in Chromium and in WebKit.
- `pbc-offline-prod.cjs`: with the browser's network cut after one visit, an address never opened fails, while the page reloads, gives out the example's places, and reads a file, in both engines.
- The homepage lists it under "Groups & community".
- The 30-page smoke test on production: 120 page loads, 0 problems. The daily check: 11 of 11.

## Lifecycle recommendation

**MAINTAIN.** Exact and verified (exhaustive search, an independent solver, hostile input), for a recurring school job whose free tools are tied to Google or Moodle. But Google schools have a free add-on with 70K+ users, many schools book clubs first come, first served, and the first requests (sessions in several time slots, priorities, keeping people together or apart) would make it a bigger product. Revisit if schools or organizers use it. Watch Microsoft Forms' and Google Forms' export formats.
