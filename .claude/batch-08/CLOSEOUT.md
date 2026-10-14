# Batch 08 closeout

Written 2026-10-14, when Batch 08 (Discovery Cycle 3) closed early with four experiments, #030–#033. Internal. The evidence is in the dossiers (`030-show-order.md` to `033-captions-up.md`), `CANDIDATES.md`, the research notes in `research/`, and the log in `BATCH_08.md`.

## Outcome

- **Shipped and verified in production:** #030 Show Order, #031 New Classes, #032 Comp Desk, #033 Captions Up.
- **No #034.** The batch closes early under section U of the authorization; the four steps it asks for are below ("Why the batch closes at #033"). The number stays unassigned.
- **Defects:** the audits before each push found and fixed 9 (#030), 11 (#031), 8 (#032), and 6 (#033) product defects. After shipping, production checks found one more in #032 (cells lost when typed faster than the page redraws, three causes) and the closeout found two in #033 (numbered names with a mark, page numbers from pasted PDFs). All are fixed and verified in production.

## The report (section V)

### 1. Autonomous Ops v2.1

All seven parts done and validated (table in `BATCH_08.md`, "Part A"): narrow permissions for the routine lifecycle (no broad shell); writable records; the WIP-branch lifecycle used for every experiment and fix (six local branches made and deleted, none pushed); session start checked after compaction (it printed "Now", the batch's "Now", and git, and work resumed from the recorded next action after compaction and after two usage-limit pauses); the Stop hook redesigned and checked live (its log over the batch: 6 asks to carry on, 4 stops let through because no tool had been used since its last ask; no loop, and it never asked while a stop was legitimate); long-work recovery through the bounded QA runner (every QA run here went through it; one hung harness was cut at its limit and the cause found: a test generator asking a 3-child group for 3 distinct friends); one harmless autonomous cycle (commit e4ec9db, deploy 38487235836, verified).

Where it fell short: four research threads (round 2) were cut off by a usage limit; their partial notes were kept and their lanes parked, as the rules say. One rule was found to bind in practice: downloading a data file needs the owner's yes, which parked the nest visit planner.

### 2. Ideas considered

About 135: round 1's five threads and direct checks (about 45), discovery for #031 (4), round 2's four threads (about 36), discovery for #032 (about 7 beyond round 2), and the final pass's three threads (about 45, many screened by kind in their first step). Every one is in `CANDIDATES.md` or the research notes, with its outcome.

### 3. Researched materially

About 45 were researched with searches and page reads; 12 were gated in full (E1–E8), each deciding claim checked in the main session: show running orders, class formation, nest visit planning, climbing competition scoring, label sheets, live captions, a carer's diary, subscription payment matching, donor giving statements, running-club championships, EYFS ratio planning, child performer hours.

### 4. Rejected

With reasons kept in `CANDIDATES.md`; the main groups:
- **Served free already:** heat-loss estimates, visual schedules, comparing name lists, silent auctions, alcohol duty relief, giving statements, a carer's diary, Easy Read layout, visual stories, pigeon results, pursuit starts, course setting, Pinewood Derby, geocaching, astronomy, model railways, sprinkler audits, archery handicaps, age-group eligibility.
- **Trivial arithmetic or a lookup:** average quantity, kiln schedules, biotic indices, sinking funds, water-meter checks, wheelchair-basketball line-ups, tree age.
- **Legal or safety interpretation:** Martyn's Law, allergen labels (Batch 07), emergency plans.
- **Shared state or a system of record:** scene breakdown, care-home activity records, food-bank stock.
- **Settled families:** label sheets (Batch 07's printing family, with print fragility verified), dragon-boat line-ups and craft-fair plans (arrangement tools).
- **No demand found:** camera-club runner, seat racing, activity carousels.

### 5. On HOLD

Each with the fact that would settle it:
- **EYFS ratio planning:** one human read of the framework and one childminder's word.
- **Child performer hours:** evidence of breaches or demand; liability on a safeguarding "pass".
- **Stage manager line notes:** StagePro checked; demand.
- **Lifeguard rotations:** evidence that building rotations is slow.
- **Temporary Event Notice planner:** legal-adjacent; councils' advice.
- **Village show results:** leaning REJECT.
- **Choir riser planner:** fresh demand evidence; a fourth arrangement tool.
- **Nest visit planner:** the owner's permission to download the CC0 species tables, and a sourced last-visit rule for each species. This is the strongest HOLD, owner-blocked (item 16).
- **Subscription payment matching:** a treasurer's account of the time, and real anonymised exports.
- **Running-club championship tables:** ten clubs' rules fitting four formats, and members picked out of five timing sites' results.

### 6. Numbered experiments

| # | Title | Slug | Status | Shipped | Last change | Deploy |
|---|---|---|---|---|---|---|
| 030 | Show Order | show-order | live, verified | a329ca8 | a329ca8 | 38494521064 |
| 031 | New Classes | new-classes | live, verified | d9b99d8 | d9b99d8 | 38519276907 |
| 032 | Comp Desk | comp-desk | live, verified | b8f8a30 | 52802a5 (fix) | 38524500178 |
| 033 | Captions Up | captions-up | live, verified | 97833cd | d289161 (fix) | 38536194341 |
| 034 | — | — | not assigned (early close) | — | — | — |

### 7. Job and audience

- **#030 Show Order:** dance-studio owners and teachers (then school concerts and variety shows) laying out a recital's running order so no dancer is back to back and quick changes are fewest, around the numbers they pin; today, index cards and a spreadsheet.
- **#031 New Classes:** primary-school leaders and teachers mixing a year group into next year's classes: sizes set, gender, attainment, needs, and current class spread evenly, children kept apart, each with a friend they named; today, cards on a table or a paid tool that uploads children's data.
- **#032 Comp Desk:** the scoring desk at a one-day bouldering competition (university walls, gyms, youth rounds), turning paper scorecards into each category's standings by the comp's rule, with a leaderboard on a screen; today, a spreadsheet built for the night.
- **#033 Captions Up:** whoever captions a fringe, amateur, school, or community company's performance for d/Deaf and hard-of-hearing audiences, building the captions from the script and running them on the night; today, PowerPoint a slide at a time, as the Edinburgh Fringe's guidance describes.

### 8. Strongest incumbent evidence

- **#030:** ShowSort (paid, desktop) optimizes orders; Jackrabbit's module checks conflicts without suggesting an order (*verified*). No free tool checks gaps.
- **#031:** Shibutz Pro ($199 a year; its free plan is one list of 25 students), Class Maker ($199–$299, desktop), Class Composer, and Class Creator (via Wonde, *verified*). No free, no-sign-up balancer found.
- **#032:** Boulder Scoring, free but iPhone-only, built for climbers scoring themselves, with a judge mode (*verified*); and Excel at the paper desk (UGA's handbook, *verified*).
- **#033:** Captitles' free plan "for amateur and community theatres with a single show": an account, an app to download, scripts in its cloud (*verified*). PowerPoint, as the Fringe's own DIY route (*verified*).

### 9. Material defects found

Before ship (all fixed before any push):
- **#030:** the search missed optimal orders for small shows; moving past pinned routines; a CSV read mode that stuck; "Last, First" misread; the finale moved by suggestions; overflow at 200% text; unresponsive at its limits; two overclaims; print gaps.
- **#031:** counting placements hung on tight minimums; a weak last tiebreak; undo leaving a fixed child outside their class; a class-count change losing placements; the formula guard mangling negative numbers; workbooks and Windows-1252 files; repeated names indistinguishable; focus lost after a search (WebKit); a role on a list (axe); MIS headers and semicolon lists misread; an overclaim; print columns.
- **#032:** tied places written as "=1" and defused into "'=1"; a "nothing is rounded" claim false for some values; a chatty live region; Enter picking one of two climbers on a bib; repeated bibs not pointed out; no backup size limit; the leaderboard window able to write; category removal shifting climbers; a grammar slip.
- **#033:** the key handler throwing on non-element targets; Space on a focused button advancing twice; stale updates losing quick presses and re-fit limits; numbered names (1ST WITCH); the caption box misrepresenting lines; single-screen contrast.

After ship:
- **#032:** a card saved with a cell missing in a live-site run. Three causes: stale updates; stale reads at Enter, which could also open the wrong climber from the search; and a delayed focus move.
- **#033 (at closeout):** names with a number mark ("SERVANT #2"); page numbers from pasted PDFs shown as captions.

### 10. Fixes

Each defect above is fixed in the commit that shipped the experiment, or in the fix commits 52802a5 (#032) and d289161 (#033), with a regression check added to the experiment's harness or model tests. The details are in each dossier's log.

### 11. Verification

Every experiment and fix was checked in production, not just in a green Actions run. Each check confirmed:
- the intended commit deployed, with live files byte-identical to a fresh build (`prod-parity.mjs`);
- the full browser flow on the live site, in Chromium and WebKit, desktop light and phone dark: #030 102 checks, #031 131, #032 107, #033 96;
- offline (the service worker keeping the page, the network cut, the core job done) and the homepage card under its category, in both engines;
- the whole-site smoke test (last run 136 page loads, no problems) and the daily check (11 of 11).

Model checks with independent evidence:
- **#030:** brute force, a Python reimplementation, and a real studio's line-up.
- **#031:** every placement compared, the search alone against brute force, and a Python recount.
- **#032:** a Python reimplementation (2,337 standings) and the rules' own examples.
- **#033:** property checks over 3,000 speeches and an independent Python re-check.

Firefox stays parked (owner-blocked).

### 12. Lifecycle recommendations

All four **MAINTAIN** (provisional, since none has a known user):
- **#031 New Classes:** the batch's strongest, and its first candidate for human validation.
- **#033 Captions Up:** the second validation candidate.
- **#030 Show Order** and **#032 Comp Desk:** maintain as they are.

The reasons and the conditions for archiving are in each dossier's "Lifecycle". None is recommended for promotion. Unlike Batch 07's promoted pair, none has a need set by a regulator or a rule, and each job comes round yearly or per event, not weekly.

### 13. Comparative ranking

Scored on the Batch 03 framework (out of 65; `PORTFOLIO_REVIEW.md`), against the strongest existing Labs tools. The scores are deliberately critical; they are evidence, not the decision.

| Experiment | Assessed total | Note |
|---|---|---|
| #016 Fluency Check | 52 | The strongest single product (portfolio resolution) |
| #020 Custody Calendar, #022 Day Clock | 52 | Promoted, then stopped by desk validation |
| #028 Hidden Data Check | 52 | Batch 07, promote candidate |
| #026 Exam Timekeeper, #027 Transcript Pseudonyms | 51 | Batch 07 |
| **#031 New Classes** | **51** | Children's data makes local-only the wedge; every alternative is paid; yearly |
| #002 Photo Scrub, #006 Secret Santa, #014 Playing Time | 50 | |
| **#033 Captions Up** | **49** | The Fringe names the job; free alternatives need an install and an account |
| #024 Ranked Choice Count | 49 | The best-verified logic |
| **#030 Show Order** | **47** | Verified on real data; recitals once or twice a year |
| #029 Places by Choice | 47 | |
| **#032 Comp Desk** | **45** | Exact and fast, but no privacy wedge and a free iPhone rival |

Scores (Clar, Use, Rec, Diff, Local, Priv, Tech, Maint†, Corr†, Loss†, Aud, Spread, Prod):

| Experiment | Scores |
|---|---|
| #031 | 5 5 2 4 4 5 5 1 3 3 5 2 3 |
| #033 | 5 4 2 4 4 3 4 1 2 2 4 3 3 |
| #030 | 4 4 2 4 3 2 5 1 2 2 5 2 3 |
| #032 | 4 4 3 3 3 1 5 1 3 3 5 3 3 |

New Classes joins the top tier on score, behind Batch 07's promoted pair on the decision.

### 14. Future human-validation candidates

Each means contacting people, which is the owner's call:
1. **#031 New Classes:** a primary school runs its summer-term class mixing with it, on its own data, alongside its usual method. This would settle whether the suggestions are trusted and save the afternoon.
2. **#033 Captions Up:** a community company captions one performance with it, to show whether the splitting saves the slide-building and the run holds up in a hall.
3. **#032 Comp Desk:** a university wall's comp desk.
4. **#030 Show Order:** a studio's recital order.

These follow Batch 07's recommendations (#028, then #026) and Fluency Check's prepared interviews.

### 15. Maintenance debt

- The QA harnesses and fixtures live only on this machine (`.claude/qa/` is ignored by git by design: "local QA helpers"). There are 361 files, including every flow check above. If this machine is lost, the checks are lost. Keeping a private copy is an owner decision.
- **#033's parser** is heuristic, and real scripts will vary more than any test set (Off Book's lesson). Each problem found should become a test case.
- **#032's formats and #031's search** are complete for their stated scope. Asks beyond it (rounds with countback, larger year groups) would be new features.
- **Labs now has 33 experiments.** Each is self-contained by the constitution, so helpers (file buttons, downloads, styles) are repeated. This is accepted.
- **Batch 08 added four storage keys:** `labs:show-order`, `labs:comp-desk`, `labs:captions-up`, and `labs:captions-up:at`. New Classes stores nothing.

### 16. Owner-blocked

Unchanged from before the batch:
- Fluency Check interviews or a pilot;
- the email to Open-Meteo;
- a no-account feedback address;
- regrouping Custody Calendar, Day Clock, and Frost Dates to Maintain;
- Firefox testing (needs a permission rule);
- human validation of #028, then #026;
- an automation permission to test #028 with workbooks Excel saves.

New:
- **The nest visit planner:** the owner's permission to download two CC0 data files:
  - Storchová & Hořák 2018 (Dryad, 245,901 bytes);
  - Myhrvold et al. 2015 (Ecological Archives E096-269, the Amniote database CSV).

  A sourced last-visit rule per species is needed too.
- **Human validation of the Batch 08 experiments:** item 14.
- **A private copy of `.claude/qa/`:** item 15.

### 17. Repository and production at close

- **Code:** the last code change is d289161 ("Captions Up: names with a number mark, and page numbers pasted from a PDF kept off the screen"), deployed by run 38536194341 and verified in production: byte-identical (77 files, 111 addresses), flows, offline, smoke, daily check.
- **Repository:** `main` matches `origin/main`, with this closeout's commit on top, which changes records only. There are no `wip/` branches and the working tree is clean.
- **Live:** 33 experiments, #001–#033.

## Why the batch closes at #033 (section U)

- **A final diverse research pass:** done after #032. Three bounded threads covered domains Batch 08 hadn't touched: care and accessibility, outdoors and hobby clubs, and small organisations' admin. About 45 leads were scanned. One cleared the bar narrowly and was checked here; it became #033. The other two domains produced HOLDs only.
- **Credible HOLDs revisited:**
  - **The nest visit planner:** its data question was answered (the open datasets exist), but using them needs a download the owner must approve, and its welfare rule isn't sourced beyond bluebirds.
  - **Round 1's HOLDs:** none has new evidence, and each needs contact with people (a childminder, a stage manager) or carries legal or safeguarding liability.
  - **The new HOLDs:** each needs real users' files or accounts of their time.

  None can be resolved here without the owner.
- **Why more search has diminishing value:**
  - The yield fell from round to round: round 1 gave two BUILDs (#030, #031), round 2 and #032's discovery one (#032), and the final pass one narrow one (#033) from about 45 leads.
  - The leads that remain fail on the same few grounds: a free tool already does the job, the arithmetic is trivial, the job needs shared state or a system of record, or it rests on legal or safety judgement Labs shouldn't automate.
  - Labs' fixed limits (static, no accounts, no keyed services) rule out much of what's left.
  - More search would most likely produce weaker products to use up a number. The authorization calls that failure.
- **Against the strongest products:** New Classes ranks with the top tier on score (51), and Captions Up just below (49). A fifth product from the current leads would rank well below either, and below the portfolio's middle (item 13).
