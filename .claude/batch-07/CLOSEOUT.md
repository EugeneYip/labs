# Batch 07 closeout

Written 2026-10-13, when Batch 07 (Discovery Cycle 2) closed with four experiments. Internal. The evidence is in the dossiers (`026-exam-timekeeper.md` to `029-places-by-choice.md`), `CANDIDATES.md`, and the log in `BATCH_07.md`.

## Outcome

- **Shipped and verified in production:** #026 Exam Timekeeper, #027 Transcript Pseudonyms, #028 Hidden Data Check, #029 Places by Choice.
- **No #030.** Nothing left passed the gate ("Discovery for #030" in `CANDIDATES.md`), so the number stays unassigned. The brief allowed this: strong evidence matters more than the count.
- **Ideas:** about 150 considered. About 35 were researched with searches. 4 were numbered, 2 are on hold (comparing two lists of names; scene breakdown), and 2 are parked (Word comments to a table; small-number suppression), both files and privacy. Every other idea was rejected, with its reason kept.
- **After the last push**, the files that Microsoft's own apps write found one more defect each in #027 and #028. Both are fixed ("Found at closeout" below).

## Comparative review

The four are compared with the strongest earlier Labs experiments:
- Fluency Check: the primary candidate for human discovery.
- Custody Calendar, Day Clock, and Frost Dates: promoted, then stopped by desk validation.
- Ranked Choice Count: the closest to promotion.
- Photo Scrub: the best-verified privacy claim.

The Batch 03 framework (`PORTFOLIO_REVIEW.md`, out of 65) is used so the numbers compare. The scores are deliberately critical and are evidence, not the decision. None of the four has a known user.

| # | Experiment | Assessed total | Lifecycle | Deciding reason |
|---|---|---|---|---|
| 028 | Hidden Data Check | 52 | **PROMOTE candidate** | A regulator names the job and the failure; uploading would itself disclose, so local-only is the wedge; every outgoing spreadsheet is an occasion |
| 026 | Exam Timekeeper | 51 | **PROMOTE candidate** | A rule sets the need (actual time only, no countdowns), no free tool pauses individual candidates, and it's used at every exam session |
| 027 | Transcript Pseudonyms | 51 | Maintain | Exact and private, but used per project, and find-and-replace or approved AI is enough for many |
| 029 | Places by Choice | 47 | Maintain | Exact and recurring, but Google schools have a free add-on, and its first requests would make it a bigger product |

Scores (Clar, Use, Rec, Diff, Local, Priv, Tech, Maint†, Corr†, Loss†, Aud, Spread, Prod):
- #028: 5 4 4 4 5 5 4 3 4 1 5 2 4.
- #026: 5 4 4 4 5 5 4 2 4 2 5 2 3.
- #027: 5 4 3 3 5 5 4 2 3 1 5 2 3.
- #029: 5 4 4 3 3 3 4 2 3 1 4 2 3.

#027 ties #026 on the framework, which rewards privacy and local processing, and #027 has both in full. The decision puts more weight on recurrence and on the gap, as Batch 06 did for Photo Scrub (50, Maintain).

**Does any new product belong among the strongest Labs experiments?** Yes, two: Hidden Data Check and Exam Timekeeper, alongside Fluency Check. They have what the earlier promotions turned out to lack:
- a need stated by a regulator or a rule (the ICO's July 2025 guidance and its fines; JCQ's §11.7), checked before building rather than after;
- a named professional who meets the job every time it comes round;
- a gap that local processing creates, not one it merely allows.

Transcript Pseudonyms and Places by Choice are sound tools in Ranked Choice Count's mold: well verified, worth keeping, and promoted only if people adopt them.

**Did any thesis weaken substantially during audit?** No. Four claims narrowed, and each page says so:
- #028 claims less than its gate did. It can't see inside pictures, a data model, or macros. Colour hiding is judged by a rule from the stored colours, and conditional formats aren't judged.
- #029's rule changed before coding, from rank-maximal to the lowest total of squared choice numbers, so nobody is pushed far down their list to give others a first choice. The gate record now notes this.
- #027's suggestions lean toward English.
- #026's "UK" became JCQ centres.

**Which deserve future human validation?** In order:
1. #028: a few FOI or information-governance officers run it on files they're about to send. Does it find what they'd have missed, and does anyone read "nothing found" as "safe"?
2. #026: an exams officer uses it through a mock series.

Fluency Check's interview kit is already prepared, so it's the cheaper start. Each lane is the owner's call, and nobody has been contacted. One cheap technical check needs only a permission, not people: #028 with workbooks saved by Excel itself (Excel for Mac is on this machine, but driving it needs an automation permission).

**New reusable engineering lessons:**
- **Test with files the real program wrote, as early as possible.** Microsoft's own Solver add-in and Word's templates found two defects that every hand-made and library-made fixture missed.
- **Check with a second implementation in another language.** openpyxl for #028, a Python Hungarian solver and exhaustive search for #029, and a separate Python reader for #027's Word text were the batch's strongest checks.
- **Scan hostile text in one pass.** The first version of the `[0]` fix used regular expressions that took 6.5 s on a 100,000-character name; the one-pass scan takes 2 ms.
- **Long work in a page yields with a MessageChannel,** with progress and Stop (#028, #029).
- **Derived state belongs to its source.** #029 crashed when a second file had fewer columns than the first.
- **The `\u` escape trap recurred** (#027, #029). The invisible-character scan before each commit is what caught it.

**Maintenance debt:**
- **Four zip readers or writers.** Photo Scrub, Family Stories, Transcript Pseudonyms, and Hidden Data Check each have their own, as the constitution's self-contained rule asks. One shared reader in `src/components/` would be one thing to maintain, but moving shipped code carries its own risk. Do it only when a fix would apply to all four.
- **Outside rules that change:** JCQ's Instructions every September (#026); the ICO's guidance and new Excel features, each of which adds parts (#028); Forms' export formats (#029).
- **QA kept only on this machine.** The scripts and fixtures are in `.claude/qa/`, which git ignores. The dossiers say what they check.
- **Autonomous Ops v2's hooks** run only in a new session and haven't been seen live yet. They rely on the exact wording of the "Autonomy" and "Next action" lines in the factory state.

## Found at closeout

Both were found by reading files that Microsoft's own apps wrote. Both were fixed and checked in Chromium and WebKit, then pushed.

| Experiment | Found | Effect | Fix |
|---|---|---|---|
| #028 Hidden Data Check | Excel writes `[0]` for the workbook itself: names for its own macros (`[0]!Help1_Click` in Solver) and a chart's named ranges (`[0]!Name`). The page counted any bracketed number as a link to another file, and table columns such as `Sales[2024]` too | A false "Names that point to other files" on Excel's Solver add-in. Every chart built on a named range would have been called "another file's data" | Only `[1]`, `[2]`… or a file name counts as another workbook, read in one pass that skips quoted text and table references. A chart's named ranges are traced through the workbook's names, so a chart drawing on a hidden or deleted sheet's data is still found, and a name pointing at deleted cells (`#REF!`) is a finding of its own |
| #027 Transcript Pseudonyms | Word writes an empty paragraph as `<w:p …/>`, and the page ended a line only at `</w:p>` | Blank lines vanished from text read from Word files, such as the blank line between turns | An empty paragraph is a line too |

The checks behind each fix are in the two dossiers' "After the push" sections.

## Repository and production at close

- **The last change visitors see:** commit 5c883ad, the two fixes, deployed by run 38469054081.
- **Production at close:**
  - its 69 files are byte-identical to a fresh build;
  - in Chromium and WebKit, Transcript Pseudonyms passes 40 of 40 browser checks and Hidden Data Check 72 of 72;
  - the two fixes pass on the live site (`closeout-prod.cjs`);
  - the 30-page smoke test gives 120 page loads with 0 problems, and the daily check passes 11 of 11.
- **The records** (this file, the dossiers' lifecycle sections, `CANDIDATES.md`, the portfolio, the factory state) follow in the next commit, which changes no page.
- **Afterwards:** `main` matches `origin/main`, with no work-in-progress branch. The registry lists 29 experiments, all `live`.
- **Nothing is authorized now:** no new experiment (#030 is the next number), batch, or owner lane until the owner says so.
