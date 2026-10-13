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

(After building.)
