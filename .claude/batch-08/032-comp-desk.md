# #032 Comp Desk

Dossier. The decision and its evidence are in `CANDIDATES.md` ("Thread results for #032") and `research/k-climbing.md`. Address: `labs.eugeneyip.net/comp-desk/`, homepage category `practice`, code in `src/experiments/comp-desk/`, built on the local branch `wip/032-comp-desk`.

## The job

A volunteer at a climbing wall's scoring desk, during a one-day bouldering competition. Climbers hand in paper scorecards (for each problem: the attempt they reached the zone, the attempt they topped). The desk needs ranked lists for each category, by the comp's own rule and tie-breaks, within minutes of the last climb, and often a leaderboard on a screen during the comp. Today: a spreadsheet built for the occasion, or a free iPhone app if every climber scores on a phone.

## Scope (first version)

- **Set up:** the problems (how many; names and point values where the format uses them), the categories, and the climbers (pasted from a list or a CSV: name, category, optional bib number; or added one by one).
- **Formats,** each stating its rule on the page; every climber's result kept per problem as the attempt of their first zone and the attempt of their top (a top counts as the zone too):
  1. **Tops and zones:** most tops, then most zones, then fewest attempts to tops, then fewest attempts to zones. Shown as "3T 4z 7 9".
  2. **Points less attempts:** a top scores 25 and a zone without a top 10, less 0.1 for each attempt before it (World Climbing's 2025 values; all three can be changed). Counted in tenths, so no rounding; a problem never scores below 0.
  3. **Points by attempt:** a top on the 1st, 2nd, 3rd, or later attempt scores 10, 7, 4, or 2, and the zone without a top scores 1 (the Irish Bouldering League's values; its page doesn't say whether a top also earns the zone's point, so that's a setting, off by default; the list and the zone's points can be changed).
  4. **Problem values, best N:** each problem has a value; a climber's score is the total of their best N tops (5 by default, as USA Climbing's classic redpoint; or all), with an optional bonus for a flash (a percentage, such as UGA's 10%).
  Equal results share a place (1, 2, 2, 4), and the page marks the tie; no format breaks ties by a previous round, because there's one round.
- **Entering cards:** find a climber by bib or name, type their card a problem at a time (keyboard only: Tab, Enter to save), see the card's score before saving; impossible entries (a zone after the top, attempts over the limit) are refused with the reason; every saved card can be changed later.
- **Results:** each category's standings with the score's parts; a leaderboard view for a second screen that updates as cards are saved (same browser, another window); print the podiums (top three per category) or full results (a category a page); CSV of results.
- **Saved:** the comp is saved in this browser (`labs:comp-desk`) after every change, so a reload or a closed tab loses nothing; two tabs don't erase each other (`useOtherTabs`); a backup file downloads and opens again (for another laptop); starting a new comp asks first.
- **Left out:** several rounds and countback to a previous round, multi-week leagues, handicaps, teams, entry on several devices, live standings on climbers' phones, lead and top-rope formats with numbered holds.

## Principal failure modes, and how each is handled and checked

| # | Risk | Handling | Check |
|---|---|---|---|
| 1 | A ranking rule implemented wrongly (tie-break order, best N with equal values, flash bonus, ties sharing places) | Each format's rule in one function, stated on the page; standard competition ranking | A separate Python implementation; hand cases from the rules' own examples (25, 24.9, 9.8; "2T3z"); random comps recounted; property checks (adding a top never lowers a place) |
| 2 | Floating point in 0.1 deductions and percentage bonuses | Integer tenths; bonuses computed in hundredths and shown with their rule | Model cases |
| 3 | A card typed wrongly (a 4 read as 14, a zone after the top) | Refused with the reason; attempt limit if set; the card's score shown before saving; any card can be edited | Model and browser cases |
| 4 | An evening's entries lost (reload, closed tab, full storage, two tabs) | Saved after every change; `useOtherTabs`; `NotSaving` when the browser refuses; backup file | Browser: reload, two tabs, refused and damaged storage |
| 5 | Claiming official rules | "World Climbing's 2025 values" for the numbers only; no claim of following any federation's full rules; ties stated as shared | Wording review |
| 6 | The leaderboard window out of date | Storage events from `useOtherTabs`; the window says when it last updated | Browser: two windows |
| 7 | Keyboard and screen readers on a dense card | Each field labelled with problem and climber; focus moves predictably; saved cards announced | Keyboard pass, axe |
| 8 | Phone and tablet widths; print | The card stacks; standings stack; a category a page in print; podiums on one page | 320, 390 and 1280 px at 200% text; print to PDF |
| 9 | Large comps | Limits stated (climbers, problems, categories); standings recomputed quickly | Timed runs at the limits in both engines |
| 10 | CSV formula injection; hostile backup files | Leading `= + - @` defused (plain numbers kept); backups checked field by field | Model cases |

## Evidence plan

- A separate Python implementation of the four formats recounting random comps written by the tests, plus hand cases from the rules' examples.
- Exhaustive checks of the ranking (every order of small fields) against a brute-force ranking.
- A realistic comp (6 categories, 25 problems each, 150 climbers) entered through the page in both engines, its standings recounted from the page's own CSV.

## Log

- **2026-10-14:** chosen (`CANDIDATES.md`). Risk list written.
