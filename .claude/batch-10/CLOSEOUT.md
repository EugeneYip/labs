# Batch 10 closeout

Written 2026-10-15, when Batch 10 (Discovery Cycle 5) closed early with one experiment, #036. Internal. The evidence is in the dossier (`036-holiday-pay-average.md`), `CANDIDATES.md`, the research notes in `research/`, and the log in `BATCH_10.md`.

## Outcome

- **Shipped and verified in production:** #036 Holiday Pay Average.
- **Not assigned:** #037, #038, #039, #040. The authorization's limit is an upper bound, not a target; the early-close test is at the end ("Why the batch closes at #036").
- **Defects:** 24 product defects found and fixed before the push (4 by the browser flow, 2 by the main session's review, 18 by the independent audit, with its 8 suggestions taken). None found after shipping.
- **Infrastructure:** the daily check now records which check failed, the error or status, and whether a retry recovered (b45a44a; 7 injected faults; GitHub run 38675718363).

## The report

### 1. Experiments shipped

| # | Title | Slug | Category | Status | Ship commit | Deploy | Verified |
|---|---|---|---|---|---|---|---|
| 036 | Holiday Pay Average | holiday-pay-average | School & work | live | 18a27a2 | 38685690990 | 2026-10-15 |

### 2. Numbers not assigned

#037, #038, #039, #040: no candidate cleared the gate after #036. #041 was never in scope.

### 3. Ideas considered

About 200, each in `CANDIDATES.md` or the research notes with its outcome: round 1 (the main session's first screen and five threads, A–E: about 110), round 2 for #037 (threads F and G and the main session: about 35), and the final broad pass (thread H and the main session's screens in four more areas: about 55). Many more were found already settled in Batches 07–09 and skipped after a grep of the records, at no search cost.

### 4. Researched materially

About 40 with searches and page reads. Seven were gated in full (A–H): holiday pay's reference period (BUILD, #036), the felling licence exemption record, the percolation and soakaway test log, the collection shift planner, the Scottish visitor levy worksheet, best and worst lines through error bars, and school food menu checks (each REJECT). Every deciding claim was checked in the main session rather than taken from a thread's summary: for #036, the Working Time Regulations' reg 16 and the new reg 16B on legislation.gov.uk, GOV.UK's two employer guides and their tables, GOV.UK's entitlement calculator, and two free calculators' inputs; for the others, S.I. 1979/792 (read from its scanned images), the Forestry Commission's Booklet 39 and the tariff equations behind it (recomputed against its worked example), the Data Grapher's own page, and the capital gains tools.

### 5. Rejected

Reasons are kept in `CANDIDATES.md`. By kind:
- **Served free already:** language sample analysis (ConductScience), therapy outcome measures (BACP, CORE), stocking surveys (the Woodland Carbon Code's templates), condition assessments (the FC's app, Coreo), cut and fill (Civils.ai, Toolgrit, Vertigraph), gas tightness tests (engineers' apps), a film's Day Out of Days (Filmustage), error-bar lines (the Data Grapher), NO2 diffusion tubes (Defra's tool), capital gains matching (cgtcalculator.com, UKCG), the HFSS score (the University of Leeds), glider recency (club launch systems, a free app), and the first screen's fourteen (pool chemistry, varroa thresholds, brewing water, cut lists, booklet imposition, cave surveys, stereonets, glazes, model railway operations, bell-ringing proofs, stairs, U-values, HSE's noise and vibration calculators, CBT-I diaries).
- **A hard limit:** Making Tax Digital (a keyed API), burial registers, tool libraries, the practical endorsement's record (records shared across people and years), Gift Aid schedules (HMRC's version-locked file, provable only with an HMRC login).
- **Legal, safety, or licensing ground:** hall capacity, PIP points, visa finances, debt advice figures, volunteers' DBS identity checks, fragrance allergen labels.
- **Rules that move:** EUDR geolocation files, packaging EPR, the visitor levies (council by council into 2027), school food standards (replaced from September 2027).
- **The batch's avoided patterns:** classroom CO2 and ventilation (logger files), a parish council's return, pigeon velocities, dividing belongings, FRS 102 leases, the visitor levy worksheet and qualifying care relief (money rules from a list, like #034 and #036).
- **Weak on recurrence, stakes, or evidence:** the felling record, the percolation log, the collection shift, legionella logs, PE main tests, hydrant tests, tariffing a stand, herbivore impact, a gifts record, buying groups' case splits, bar stocktakes, reverberation from a clap, rare-book collation, an orchestra's parts, Access to Work claims, and the first screen's four (canal cruising logs, election returns, retention reviews, homeschool logs).

### 6. On HOLD

None new. Batch 08's and 07's HOLDs were revisited at the start (`CANDIDATES.md`, "HOLDs revisited"): running-club championships and village show results REJECT (competition operations); choir risers, line notes, the Temporary Event Notice planner, subscription matching, Word comments, and small-number suppression not reopened (avoided clusters, no new evidence); EYFS ratios and child performer hours still need a practitioner's word or carry safeguarding liability; the nest visit planner stays owner-blocked. School food menus are a REJECT with a stated condition to revisit (if the government's promised tools turn out not to be a checker), not a HOLD.

### 7. Strongest incumbents

- **#036:** a payroll export and a spreadsheet, Xero's own suggestion after it declined a 52-week holiday-pay report (27 November 2025, 93 votes; *verified* by thread D); paid payroll and HR systems that select the weeks (Moneysoft's 52-week report, Employment Hero, HiBob, Moorepay), or a payroll bureau. The free calculators (leavebalance.com, QX's) take a total and a count of weeks already worked out (*verified* here); GOV.UK's own calculator does entitlement, not pay (*verified*).
- **The rejected leads' incumbents,** for the record: ConductScience's free in-browser MLU counter (language samples), BACP's free outcomes spreadsheet, the Woodland Carbon Code's own survey templates, the FC's Woodland Condition Assessment app, UNDA's percolation calculators, Civils.ai's and Toolgrit's cut-and-fill grids, engineers' gas tightness apps, HMRC's version-locked Gift Aid schedule, licensed bar stocktakers, foodclub.org, Filmustage's free plan, the Data Grapher (error bars and min/max gradients), Defra's NO2 tube tool, cgtcalculator.com and UKCG, the University of Leeds' HFSS calculator.

### 8. Users and jobs

- **#036 Holiday Pay Average:** a UK small employer, bookkeeper, or payroll clerk (or the worker themselves) working out holiday pay for someone whose pay or hours vary, for leave from 1 January 2024 in England, Scotland, or Wales: from week-by-week pay (typed or pasted), the weeks the 52-week rule uses and skips (back to 104 weeks), a week's pay to the penny (with the 1.6 weeks' basic-pay minimum where it applies, and the hour of leave for irregular-hours and part-year workers), and a printed record for the six-year duty that began on 6 April 2026 (WTR reg 16B).

### 9. Defects found before shipping

24 product defects, all fixed before any push (`036-holiday-pay-average.md`, "Log"):
- **Found by the browser flow (4):** after "Clear everything", focus moved to the leave date on the next animation frame, so in a tab briefly in the background the next keystrokes landed in the date field (the Comp Desk class); "Counted" in the signal green failed contrast (3.2:1); dimmed "not needed" rows failed contrast; the holiday-weeks choice claimed counting them "gives a lower figure", true only without extras.
- **Found by the main session (2):** focus fell to the page when "Try an example" and the clear question's buttons went away; the varying-pay method didn't say its figure was the 4 weeks' one.
- **Found by the independent audit (18):** *medium:* the 1.6 weeks offered at basic pay to irregular-hours and part-year workers, whose leave is all under reg 15B (D-01); regular overtime beyond normal hours missing from the varying-pay figure, with a draft sentence claiming the opposite (D-02, now stated, and the method pointed elsewhere); spaced lines with numeric dates losing their figures (D-03); Excel's 10-Oct-26 and "w/e" dates not read, so lines filled the weeks in order (D-04); headed columns read wrongly (basic pay for gross pay, a payment date as pay, holiday hours as hours, D-05); unreadable hours in a hidden column blocking the result (D-09); switching method silently changing what the figures meant (D-10). *Low:* blank cells shifting columns (D-06); unquoted thousands commas read as £1 (D-07); two lines in a week keeping the first (D-08); a doubled announcement (D-11); the sticky result taller than the window at 200% text (D-12); no figure for basic pay with no week of extras (D-13); an unconditional "higher reading" claim (D-14); holiday weeks' hours counted as hours worked (D-15); figures dropped or hidden when the week-end day changed (D-16, D-17); "Off sick" and "Family leave" not saying "any of the week", and pay in a no-pay week skipped silently (D-18).
- **A harness fault, not the product's:** Playwright's `fill` types multi-line text through the editing commands in quadratic time (10,000 lines took 113 s in Brave); a real clipboard paste of 20,000 lines took 0.15 s.

### 10. Defects found after shipping

None.

### 11. Correctness evidence

- **The model** (`holiday-pay-test.ts`, 197 checks): GOV.UK 2020's Table 5 (52 of 59 weeks, £12,040, £231.54, where the page prints £231.34 and overlaps two week ranges) and Table 4 (every weekly figure recomputed from Table 3 to the penny; they add to £14,706.66, not the printed £14,606.66: £282.82, not £280.90); GOV.UK's leaver (£394.62) and its reference-period cases (Amy, Ben, Rachel, Carys); the Insolvency Service's Sam (£250) and Robin (£265.38); Acas's Mo and Corey; the period's end against a walk through the days (1,826 leave dates × 7 week-end days); 6,000 random histories against a direct definition written in the test; every audit case; parsing, pasting, storage (3,000 damaged copies), the spreadsheet.
- **An independent second implementation** (`holiday-pay-check.py`, written from the rules, not the TypeScript): the official examples and all 6,000 random histories agree figure for figure (status, weeks used, the period's end, every week's fate, totals, the week's pay, the hourly rate).
- **The audit's own scratch cases** (model, paste, and browser probes), re-run on the final code: all behave as they should.

### 12. High limits and performance

104 weeks of £1,000,000 and 168 hours each stay exact (BigInt fractions); 2,000 full calculations in under 4 s; pastes of 19,999 dated lines read in under 2 s, the 20,000-line cap refused politely, a 200,000-digit line in 2 ms and 20,000 spaced lines in 97 ms (audit); in the browser, a 10,000-line paste under 3 s and typing with all 104 weeks shown under 1.5 s; Tab stops 203 with the example's 61 weeks and 332 with all 104 (Up, Down, and Enter move between weeks; "Jump to the result" skips the list).

### 13. Browsers, accessibility, offline

Chromium (Brave 155) and WebKit 27.2, desktop light and phone dark, on the build and on the live site: `hpa-flow.cjs` 125 checks per engine (axe at six states, 200% text and overflow, the keyboard, focus after every replaced control, print, the spreadsheet, reload, two tabs, refused and damaged storage, 52 weeks typed at full speed with Enter, no console errors, no requests but the page's own files); the paste announced once and the sticky result within the window at 200% text (`hpa-a11y-extra.cjs`); the printed working black on white from a dark-mode browser, two A4 pages for the example; offline after one visit, 6 of 6 in each engine (`hpa-prod-extra.cjs`). Firefox stays owner-blocked.

### 14. Production verification

Deploy 38685690990 for 18a27a2; live files byte-identical to a fresh build (83 files, 120 addresses); the flow 125 of 125 in both engines on https://labs.eugeneyip.net; offline and the homepage card under School & work 6 of 6 in each; the whole-site smoke test 148 page loads with no problems; the daily check 11 of 11.

### 15. Lifecycle

**#036:** provisional **MAINTAIN**, with no known user; the batch's strongest evidence of friction (a vendor's declined request with users describing spreadsheets, a statutory record duty six months old, and slips in the government's own examples). Archive if mainstream small-business payroll comes to select the 52 weeks itself and show its working.

### 16. Against the portfolio

Scored on the Batch 03 framework (out of 65; `PORTFOLIO_REVIEW.md`), critically:

| Experiment | Total | Note |
|---|---|---|
| #016 Fluency Check, #020 Custody Calendar, #022 Day Clock, #028 Hidden Data Check | 52 | The top tier |
| #031 New Classes | 51 | |
| #034 Deputyship Accounts | 50 | |
| **#036 Holiday Pay Average** | **50** | A rule creates the job and, since April 2026, a record; every holiday; no free tool selects the weeks |
| #033 Captions Up | 49 | |
| #035 Collection Climate | 46 | |

#036's scores (Clar, Use, Rec, Diff, Local, Priv, Tech, Maint†, Corr†, Loss†, Aud, Spread, Prod; † counts as 6 minus the score): 5 5 4 4 3 3 4 2 4 2 5 3 4. The rejected leads would have scored below the portfolio's middle: the felling record and the percolation log about 41–43, the error-bar lines and the visitor levy worksheet lower (free incumbents, or the batch's own pattern again).

### 17. Maintenance debt

- **#036's rules** follow WTR 1998 reg 16 as amended to 1 January 2024 and reg 16B (6 April 2026); the Employment Rights Act 2025 is still being commenced, and a change to holiday pay's calculation would mean updating `model.ts` and its tests. Leave before 1 January 2024 is refused, not worked out under older rules.
- **The QA harnesses live only on this machine** (`.claude/qa/`, ignored by git by design), now including #036's: a private copy is the owner's decision.
- **One more storage key:** `labs:holiday-pay-average`.
- **36 experiments**, each self-contained, so helpers are repeated (accepted).

### 18. Lessons

- **Read the regulation, not only the guidance:** the audit found two rule gaps (reg 15B for part-year workers; reg 16(3ZB) for overtime beyond normal hours) that tests built from GOV.UK's and Acas's pages couldn't, because the guidance doesn't spell them out.
- **Official examples slip:** GOV.UK's Table 4 total is £100 short and Table 5's week ranges overlap; recompute from the tables, never from the stated totals.
- **Claims are computed, not asserted:** "the higher reading" turned out to depend on the data; the page now shows the other reading's figure instead.
- **Delayed focus moves misfire** (the Comp Desk lesson, again): a frame-delayed focus in a background tab took keystrokes into the wrong field; focus moves at once now, with `flushSync` where the target appears only on render.
- **Readers should refuse rather than guess:** a date pattern that swallowed trailing text lost figures; unreadable dates fell back to order; duplicates kept the first; a total row became a week. Each now stops the paste and says why.
- **Know the harness's own limits:** Playwright's `fill` is quadratic for multi-line text; a real clipboard paste measures the product.
- **The daily check now explains itself,** so a transient failure can be traced from its last lines.

### 19. Research and search limits

- **No thread was cut off** by a search allowance or a usage limit; each stayed within its budget and wrote its notes: round 1's five threads 47 searches and 37 reads, round 2's two 16 and 12, the final pass 7 and 5, the audit 2 and about 10; the main session about 20 searches and 35 reads.
- **The account's usage limit was reached once,** during #036's browser testing; the session resumed after the reset with nothing lost (every milestone had been committed to the work branch).
- **Primary sources that needed work to read:** S.I. 1979/792 is a scanned PDF (decoded here from its LZW page images); Booklet 39 has only a text layer from a scan (read with PDFKit); the Woodland Carbon Code's protocol answered 404 at both its addresses; Edinburgh's levy guide and Approved Document H were read from local copies after the web reader couldn't parse them.
- **Lanes not relaunched:** clubs and community (thread B's advice), and the final pass's three areas (thread H's).

### 20. Owner-blocked

Unchanged from before the batch, and kept parked by the owner's instruction (human validation deferred):
- Fluency Check interviews or a pilot; the email to Open-Meteo; a no-account feedback address; regrouping Custody Calendar, Day Clock, and Frost Dates to Maintain; Firefox testing (needs a permission rule); human validation of #028, then #026; an automation permission to test #028 with workbooks Excel saves; the nest visit planner (two CC0 downloads, and a sourced last-visit rule per species); human validation of #031, then #033, and of #034, then #035; a private copy of `.claude/qa/`.
- New, for later: human validation of #036 (an employer or bookkeeper working out a real worker's holiday pay with it).
- Also for the owner: the auto-memory note on batch authorization still says no batch is active; updating it was refused by the permission classifier again (as in Batch 09), so the repository's records are the authority.

### 21. Repository, deployment, and factory at close

- **Code:** the last code change is 18a27a2 (#036 Holiday Pay Average), deployed by run 38685690990 and verified in production. The only other change to the deployed site in this batch is the daily check's reporting (b45a44a, a GitHub script, not a page).
- **Repository:** `main` matches `origin/main`, with this closeout's commits on top (records only). No `wip/` branches; the working tree is clean.
- **Live:** 36 experiments, #001–#036. After the closing records' deploy (run 38689008164): live files byte-identical to a fresh build (83 files, 120 addresses); the daily check 11 of 11, with no request needing another try (GitHub's runs with the new reporting: 38675718363, 11 of 11).
- **Factory:** Autonomy set to `complete` in `FACTORY_STATE.md`; no further batch without the owner; the Stop hook passes its 31 offline cases.

## Why the batch closes at #036

- **A final broad pass, outside the areas already searched:** after round 2 found nothing for #037, thread H searched three areas the batch hadn't touched (transport and mobility for small organisations and individuals; non-clinical care, disability, and accessibility administration; children's and youth organisations outside school), and the main session screened four more (retail and hospitality beyond food labels and tips; personal finance and household tax; language and communication work; faith communities and local life): about 55 ideas, four researched, none surviving. The strongest need it found, checking holiday clubs' and school kitchens' menus against the School Food Standards, is being overtaken by new standards from September 2027 with tools the government says it will provide.
- **HOLDs revisited:** at the start, every Batch 07 and 08 HOLD was read against this batch's clusters and Batch 09's notes (two REJECT, the rest unchanged, parked, or owner-blocked), and round 1's three survivors after #036 were decided with reasons (the felling record, the percolation log, the collection shift: REJECT).
- **Why the remaining candidates fail:** each on one of the same few grounds (item 5): a free or official tool already does the job where its users work (the Data Grapher, Defra's NO2 tool, cgtcalculator.com, the Woodland Carbon Code's templates, UNDA); the rules are still moving (the visitor levies, the school food standards, EUDR, EPR); the batch's own pattern again (money rules worked from a list: the visitor levy worksheet, care relief, FRS 102 leases); weak recurrence or stakes (the felling record, percolation tests, collection shifts, glider recency); or legal and safety ground.
- **Why more search has diminishing value:** the yield fell by round: round 1 (about 110 ideas, five threads) gave #036; round 2 (about 35, two threads and the main session) gave nothing; the final pass (about 55 in seven new areas) gave nothing. The best remaining leads would score in the low 40s on the portfolio framework, below #036's 50 and the portfolio's middle, and the authorization prefers one strong product with extensive negative evidence to several mediocre ones: assigning #037 to any of them would fill a number, which the brief calls a failure.
