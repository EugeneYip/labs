# Batch 09 closeout

Written 2026-10-14, when Batch 09 (Discovery Cycle 4) closed early with two experiments, #034 and #035. Internal. The evidence is in the dossiers (`034-deputyship-accounts.md`, `035-collection-climate.md`), `CANDIDATES.md`, the research notes in `research/`, and the log in `BATCH_09.md`.

## Outcome

- **Shipped and verified in production:** #034 Deputyship Accounts, #035 Collection Climate.
- **Not assigned:** #036, #037, #038. The authorization's limit is an upper bound, not a quota; the early-close test is at the end ("Why the batch closes at #035").
- **Defects:** the pre-ship audits found and fixed 12 product defects in #034 and 14 in #035; the main session found and fixed 7 more in #035 while its audit ran. No defect has been found in either after shipping.

## The report

### 1. Experiments shipped

| # | Title | Slug | Category | Status | Ship commit | Deploy | Verified |
|---|---|---|---|---|---|---|---|
| 034 | Deputyship Accounts | deputyship-accounts | Family & care | live | 8f0b4a7 | 38572132880 | 2026-10-14 |
| 035 | Collection Climate | collection-climate | School & work | live | 9ca0a22 | 38588208105 | 2026-10-14 |

### 2. Numbers not assigned

#036, #037, #038: no candidate cleared the gate after #035. #039 was never in scope.

### 3. Ideas considered

About 110: round 1 (five threads, A–E, and the main session's direct checks: about 55), round 2 for #035 (five threads, F–J: about 30, and Batch 08's ten HOLDs revisited), and round 3 for #036 with the final broad pass (about 15 in ten new areas, from the main session's screens and threads L, N, O, P, Q, with round 2's horse flu lead read again). Each is in `CANDIDATES.md` or the research notes, with its outcome.

### 4. Researched materially

About 40 with searches and page reads. Five were gated in full (A–H): the deputy report's accounts (BUILD, #034), climate reports from logger files (BUILD, #035), combining judges' scores, the horse flu vaccination checker, and CREW weeding (REJECT). Each deciding claim was checked in the main session, not taken from a thread's summary; the threads' own verdicts (households' tariffs, food labels, route cards, wildlife records) were checked against the pages they read.

### 5. Rejected

Reasons are kept in `CANDIDATES.md`. By kind:
- **Served free already:** Harris matrices (Phaser), league fixtures with shared grounds (Full-Time, Play-Cricket), plate layouts (four free tools), food labels (Food Standards Scotland's MenuCal), households' tariff comparisons (Octoprice, for Octopus customers), route cards (eDofE Mapping, for every DofE participant), wildlife records (iRecord's importer and the BRC's Record Cleaner online), Schengen day counts (the Commission's calculator), consignment auctions (auction.fish), stem checks, ACX checks, cue sheets, swimming times.
- **Rules that move, or legal and safety ground:** the horse flu checker (rules moved both ways in 2026), Construction Act payment dates, HOA reserve disclosures, the residence test, a landlord's compliance dates (the Renters' Rights Act), allergen labels (Batch 07's class).
- **Trivial arithmetic or a short rule:** drivers' hours on GB domestic rules, the 2026 Rent Standard once formula rent is known, junior bowling directives.
- **No evidence of the friction:** drawing issue sheets, the photographers' group registration list, a toy's technical file, costume sizing, CREW weeding (indirect only).
- **Cluster or overfitting:** combining judges' scores (events), a third export-reading report in a row (CREW).
- **Already a feature elsewhere, or weak on demand:** DNA match clusters (AncestryDNA's own Pro Tools since July 2025), other regimes' versions of #034's job (a candidate feature for #034, not a new experiment), a volunteer fire company's service award points.

### 6. On HOLD

None new. Batch 08's HOLDs were revisited (`CANDIDATES.md`, "HOLDs revisited"): running-club championship tables lean REJECT (clubs' rules vary in kind), lifeguard rotations REJECT (a settled simple method), and the rest are unchanged, each needing a person's word, a download, or carrying liability. The nest visit planner stays owner-blocked.

### 7. Strongest incumbents

- **#034:** the OPG's own online report, which enforces the balance but doesn't say where it breaks; DeputyDB, the only purpose-built tool found, an alpha last updated in 2012 (*verified*); law firms' paid support.
- **#035:** the loggers' own software (graphs, no time-in-band or 24-hour figures found); Conserv Essentials (free, in its cloud with a login, files up to 1 MB; preservation figures on a $95-a-month plan, *verified* by the thread); IPI's eClimateNotebook (about $120–180 a year, an account); the V&A's Climate Toolbox (an Excel workbook with macros, up to 8,000 readings, *source claim*).

### 8. Users and jobs

- **#034 Deputyship Accounts:** a lay property and affairs deputy (England and Wales; 64,456 deputyships at the end of 2025–26) preparing the money section of the yearly report to the Office of the Public Guardian from the bank's own downloads: each payment in the report's types, transfers paired, and where an account stops balancing.
- **#035 Collection Climate:** whoever looks after a small museum's, archive's, library's, or historic house's collection and downloads its temperature and humidity loggers: the figures against the Bizot Green Protocol's 2023 guideline or the institution's own band, for trustees, lenders, and decisions to widen the band.

### 9. Defects found before shipping

- **#034** (the audit's 12, and the build's own): unpaired transfer halves counted twice; typed rows and balance-less downloads distorting the balance trail; day-end balances giving false troubles; focus pulled out of the tab list; tables needing sideways scroll on phones; overflow at 200% text; focus lost after removals; Excel, PDF, and HTML files read as nothing; no byte-order mark in the spreadsheet; wrong advice for a balances-only account; payee names not headings; the intro pushing the steps down on phones; example data with dropped minus signs.
- **#035** (the audit's 14, and 7 found by the main session; `035-collection-climate.md`, "Log"):
  - *High:* a long file without known column names overflowed the stack in Chromium, losing other files or the whole page.
  - *Medium:* unknown time-column names put every reading at midnight; closed lists didn't print; the spreadsheet said 0 where nothing was checked and gave no period; a US-dated file of the 1st to the 12th spread over the year; downloads exported differently counted their overlap twice; HOBOware's stated time zone thrown away.
  - *Lower:* the wrong reason for temperature-only loggers; readings checked after a gap with too little behind them; °F edges by floating-point dust; the column order assumed; unit marks and month names in other forms; focus lost after paste and "Every reading"; empty names; slow typing with big files; the example dropping files not yet added; monthly rows incomplete; places printing run together; 99.96% rounded to 100 in the spreadsheet; a flashing warning while typing; an imprecise clock-change note.

### 10. Defects found after shipping

None in either. One harness event is recorded as such: #034's first WebKit offline reload after its deploy timed out once (the WebKit first-visit window seen in P5), and passed on the reruns.

### 11. Correctness evidence

- **#034:** `deputyship-accounts-test.ts`, 130 checks: fixture layouts written by a separate Python generator from the banks' documented layouts and verbatim samples; 1,500 random ledgers cut into overlapping downloads always merging back; transfer offers valid and maximal over 800 random sets; the figures' invariants over 400 random reports; 3,000 damaged saved copies refused or read. `deputyship-accounts-check.py`, 32 independent re-checks in Python.
- **#035:** `climate-test.ts`, 96 checks: the 24-hour figures against brute force over every window on 600 random series (which found the equal-times defect), the reader on ten fixture layouts from a separate Python generator (HOBOware's documented layout; the usual shapes of the others), short files of either date order (200), merges of random overlapping downloads (100), months against brute force (40 series), and every audit case. `climate-check.py`, 13 independent re-checks in Python.

### 12. Browser, offline, and production verification

Both experiments, before and after shipping, in Chromium (Brave) and WebKit, desktop light and phone dark:
- **#034:** `dsa-flow.cjs` 166 checks per engine, on the local build and on the live site; offline and the homepage card 8 of 8 in Chromium, and in WebKit after the one first-visit timeout above.
- **#035:** `cc-flow.cjs` 156 checks per engine, on the local build and on the live site (axe at each step, 200% text, overflow at 390 and 1280 px, keyboard, print, two tabs, refused storage, a year at five-minute intervals, no request but the page's own files); offline and the homepage card 7 of 7 in each engine.
- **The site:** live files byte-identical to a fresh build after each ship (79 files, then 81); the smoke test 140, then 144 page loads with no problems; the daily check 11 of 11.

Firefox stays parked (owner-blocked).

### 13. Lifecycle

Both provisional **MAINTAIN**, neither with a known user:
- **#034:** the batch's strongest, and its first candidate for human validation. Archive if the OPG's online report comes to read statements or show where accounts don't balance.
- **#035:** maintain; its readers for loggers other than HOBOware were written from usual shapes, not real exports. Archive if loggers' software comes to report time in band and the 24-hour limit.

### 14. Against the portfolio

Scored on the Batch 03 framework (out of 65; `PORTFOLIO_REVIEW.md`), critically:

| Experiment | Total | Note |
|---|---|---|
| #016 Fluency Check, #020 Custody Calendar, #022 Day Clock, #028 Hidden Data Check | 52 | The top tier |
| #031 New Classes | 51 | Batch 08's strongest |
| **#034 Deputyship Accounts** | **50** | A rule creates the job; very sensitive data; no live alternative; yearly |
| #033 Captions Up | 49 | |
| #030 Show Order | 47 | |
| **#035 Collection Climate** | **46** | Monthly and yearly; free graphs exist; the figures behind paid or macro tools |
| #032 Comp Desk | 45 | |

Scores (Clar, Use, Rec, Diff, Local, Priv, Tech, Maint†, Corr†, Loss†, Aud, Spread, Prod; † counts as 6 minus the score):

| Experiment | Scores |
|---|---|
| #034 | 5 5 2 5 4 5 4 2 3 3 5 2 3 |
| #035 | 4 4 3 4 4 2 4 2 3 1 4 2 3 |

### 15. Human-validation candidates

Each means contacting people, the owner's call:
1. **#034 Deputyship Accounts:** a lay deputy preparing a first or second report with it from their own downloads. This would show whether the sorting and the balance trail save the hours the forum threads describe.
2. **#035 Collection Climate:** a collections officer running a year of real logger files through it (HOBOware, Tinytag, EasyLog, a phone app), to test the readers on real exports and whether the figures are the ones asked for.

These follow Batch 08's (#031, then #033) and Batch 07's (#028, then #026).

### 16. Maintenance debt

- **The QA harnesses live only on this machine** (`.claude/qa/`, ignored by git by design): 343 scripts and records at its top level, plus test outputs and browser profiles, including every check above. A private copy is the owner's decision.
- **#034's report types** follow the OPG's online report code and the July 2025 paper form; a changed form means updating `types.ts`.
- **#035's Bizot preset** follows the September 2023 refresh; its loggers' layouts other than HOBOware's are from usual shapes. Each real file that fails should become a test.
- **Batch 09 added two storage keys:** `labs:deputyship-accounts` and `labs:collection-climate`.
- **35 experiments**, each self-contained, so helpers are repeated (accepted).

### 17. Lessons

- **Brute force earns its place:** it found #035's equal-times window defect, which the hand-made cases missed.
- **Test past the limits the page states:** #035 allows 600,000 rows, but its tests stopped at about 100,000; the stack overflow came between 120,000 and 130,000 rows in Chromium. Spreading a large array into a function's arguments is a crash class; no list longer than a few thousand should be spread.
- **Read the primary source:** the Bizot guideline read from the Bizot Group's own PDF corrected a quote that secondary sources had elided and gave the page its caveat in the guideline's own words.
- **Real files vary beyond names:** time columns in other languages, a time zone in a header, a later export rounded differently. Find columns by their cells as well as their names, and merge to within rounding.
- **A deferred report changes the harness:** once the report followed typing a moment later, checks that read it at once had to wait for it to settle. A slow WebKit run on a busy machine is rerun on a fresh page before it's called a defect.
- **The tools rewrite `\u` escapes:** the Write and Bash tools turn them into literal characters, so patch scripts need placeholders and every written file a scan.
- **Check the candidates file before launching a thread:** round 3 relaunched CREW weeding, already rejected in round 2; its new evidence was recorded, and the decision stood.
- **Threads should write as they go:** the usage limit cut two threads before they wrote anything; relaunched with notes after every step, they were cut off again but left enough to decide both lanes, which the main session closed rather than relaunch a third time.
- **The Stop hook held:** over the batch it asked 5 times to carry on and let 2 stops through (one because no tool had been used since it asked, one at its limit of 3 asks in 10 minutes); no loop, and each ask came while work remained.

### 18. Owner-blocked

Unchanged from before the batch:
- Fluency Check interviews or a pilot;
- the email to Open-Meteo;
- a no-account feedback address;
- regrouping Custody Calendar, Day Clock, and Frost Dates to Maintain;
- Firefox testing (needs a permission rule);
- human validation of #028, then #026; an automation permission to test #028 with workbooks Excel saves;
- Batch 08: the nest visit planner (two CC0 downloads, and a sourced last-visit rule per species); human validation of #031, then #033;
- a private copy of `.claude/qa/`.

New: human validation of #034, then #035 (item 15).

Also for the owner: the auto-memory note on batch authorization still says no batch is active; an update to it was refused by the permission classifier during the batch, so the repository's records (this file, `FACTORY_STATE.md`) are the authority.

### 19. Repository and production at close

- **Code:** the last code change is 9ca0a22 (#035 Collection Climate), deployed by run 38588208105 and verified in production.
- **Repository:** `main` matches `origin/main`, with this closeout's commit on top (records only). No `wip/` branches; the working tree is clean.
- **Live:** 35 experiments, #001–#035. After the closing records' deploy (run 38654988248): live files byte-identical to a fresh build (81 files, 117 addresses); the daily check failed one of its 11 checks once, which one not captured, and passed 11 of 11 on each of the next three runs (a transient fault, most likely one of its three requests to outside services).
- **Factory:** Autonomy set to `complete` in `FACTORY_STATE.md`; no further batch.

## Why the batch closes at #035

- **A final broad pass:** after #035 shipped, round 3 searched ten new areas outside the batch's earlier rounds and outside its clusters, and read round 2's last lead again: households' smart-meter data, food businesses' labels, libraries' weeding, laboratory plate layouts, minibus drivers' hours, genealogy's DNA matches, a small landlord's compliance dates, counting days abroad, walking expeditions' route cards, and wildlife recorders' records; and the horse flu checker, with the bodies' 2026 rules read. Five bounded threads (L, N, O, P, Q) and the main session's own searches; about 15 leads.
- **HOLDs revisited:** Batch 08's HOLDs were revisited during this batch (item 6): one now leans REJECT, one is REJECT, the rest still need a person's word, a download, or carry liability, and the nest visit planner stays owner-blocked. None can be resolved here.
- **Why the remaining candidates fail:** each on one of the same few grounds: a free or official tool already does the job where its users work (eDofE Mapping, iRecord with Record Cleaner, MenuCal, Octoprice, the Commission's calculator, four plate-layout tools); the rules move or are legal ground (the horse flu checker, a landlord's dates, the residence test); the evidence of pain is indirect and the idea repeats the batch's own pattern (CREW weeding); the cluster the brief asks to leave (judging panels); or the arithmetic is trivial (drivers' hours).
- **Why more search has diminishing value:** the yield fell by round: round 1 (about 55 ideas) gave #034, round 2 (about 30) gave #035, and round 3 with the final pass (about 15 in ten new areas) gave nothing that clears the bar. Labs' fixed limits (static, no accounts, no keyed services) rule out much of what's left, and research threads were cut short three times (the session's search allowance once, the usage limit twice). More search would most likely produce a weaker product to fill a number, which the authorization calls a failure.
- **Against the strongest products:** #034 scores 50 and #035 46 (item 14). The best remaining leads (CREW weeding, judging panels) would rank below both, and below the portfolio's middle.
