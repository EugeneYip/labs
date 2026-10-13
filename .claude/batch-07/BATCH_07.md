# Batch 07: Discovery Cycle 2

Authorized by the owner on 2026-10-13. This file is the batch's checkpoint; `.claude/FACTORY_STATE.md` points here. A fresh session reads `CLAUDE.md`, the constitution, the factory state, and this file, checks `git status` and `git log`, then continues from **Now** below.

## Authorization, in short

- **Goal:** discover, build, audit, deploy, and resolve up to five genuinely strong new experiments, #026–#030. Never #031. Strong evidence matters more than the count: shipping five mediocre products is a failure.
- **Allowed without routine approval:** research, rejecting ideas, numbering survivors, implementing, tests, browser checks, registry entries, Product Log and internal records, commit, push, deploy, production checks, fixing defects found in audits, moving on to the next candidate.
- **Not allowed:** contacting anyone (users, organizations, companies, schools, communities), posting or recruiting, spending money, accounts or backends, keyed services, analytics or collecting data, weakening the constitution, permission workarounds (Firefox stays parked), the parked owner lanes (Fluency Check interviews or pilot, the Open-Meteo email, a feedback email), #031.
- **Pattern:** research before build; falsify before numbering; one experiment at a time; an adversarial audit before the public push.

## Per-candidate gate (before a number)

A. who has the problem; B. the exact job (before and after); C. recurrence or stakes; D. what people use today (current, searched by the job's own words); E. the Labs wedge; F. fits Labs; G. the strongest reason not to build, searched for. Outcome: **REJECT** (one-line reason kept), **HOLD** (one unresolvable question; never blocks the batch), or **BUILD**. Numbers are assigned only on BUILD and never reused.

## Per-experiment sequence

research → number → risk list → implement → tests → adversarial audit (correctness by an independent method, hostile input, persistence, performance, accessibility, Chromium and WebKit, privacy claims) → shipping gate → push → production check → dossier → next discovery. At most two focused repair passes for a material defect in the core design, then reconsider (DROP keeps the number and history).

**Shipping gate:** core job works; no known material correctness or data-loss defect; accurate privacy wording; invalid input fails safely; model/property tests pass; `npm run build`; Chromium and WebKit; phone and desktop; light and dark; keyboard; console; direct route; offline where it applies; registry, Product Log, decision record, attribution.

**Production check:** the intended commit deployed; the experiment opened directly; its core flow exercised; console; phone width; a desktop state; any file, share, or storage behavior; the smoke test and daily check still hold.

**Diversity:** no more than two of the five mainly in the same domain; vary audience, interaction, browser capability, and output, without forcing a weak category.

## Now

- **Step:** #029 Places by Choice (`places-by-choice`) is built, audited, squash-merged to `main`, and pushed (dossier: Implementation and Audit). Production check next.
- **Next action:** verify #029 in production: the deploy, production's files against a local build, `.claude/qa/pbc-flow.cjs` against https://labs.eugeneyip.net in both engines, offline after one visit (`pbc-offline.cjs`'s checks on production, with the network cut), the homepage card, the smoke test, the daily check. Record it in the dossier, here, and in `.claude/FACTORY_STATE.md`, delete the local branch, then start discovery for #030 (the last the batch allows; never #031).
- **Parked leads** for later discovery: exporting Word comments to a table; small-number suppression (both files and privacy, so only if clearly the strongest, given #027 and #028).
- **Research threads:** give each a bounded brief and write its findings to a file as it goes; if one stops, keep its partial leads, check them here, and carry on.
## Numbered experiments

| # | Title | Slug | Status | Dossier |
|---|---|---|---|---|
| 026 | Exam Timekeeper | exam-timekeeper | shipped 2026-10-13, verified in production | `026-exam-timekeeper.md` |
| 027 | Transcript Pseudonyms | transcript-pseudonyms | shipped 2026-10-13, verified in production | `027-transcript-pseudonyms.md` |
| 028 | Hidden Data Check | hidden-data-check | shipped 2026-10-13, verified in production | `028-hidden-data-check.md` |
| 029 | Places by Choice | places-by-choice | shipped 2026-10-13; production check next | `029-places-by-choice.md` |

## Log

- **2026-10-13:** reconciled. `main` = `origin/main` = 3d08ca5, clean. Production's 61 files are byte-identical to a fresh build of 3d08ca5; the daily check passes 11 of 11 against production (run locally; GitHub's first scheduled run is at 11:17 UTC today); every recent deploy succeeded. Batch 07 recorded; candidate pool written.
- **2026-10-13:** discovery. About 125 ideas considered: about 100 screened out in a first pass (51 rows in `CANDIDATES.md`), and 23 taken through the gate by six read-only research threads, with each decision's deciding claims checked again here: 14 rejected, 6 on hold, 3 survivors. #026 assigned to Exam Timekeeper after the JCQ clock rule and its competitors were verified directly.
- **2026-10-13:** #026 Exam Timekeeper shipped (commit 731ed53, deploy 38374652232) and verified in production. The audit before the push found nine defects, all fixed: a 7.1 s freeze per tick with the largest exam (formatters rebuilt for every time shown), a fit-to-screen loop that crashed the board, a cut-off board, a confusing "Finish 10:31" for a start just after 09:00, mis-tap breaks, ambiguous field names, an unreachable scroll region, missing focus rings on time fields, and "UK" where JCQ's rules cover less. Production: files byte-identical, 46/46 flow checks and all audit checks in both engines, offline, smoke 108/0, daily check 11/11.
- **2026-10-13:** #027 Transcript Pseudonyms shipped (commit 66df97b, deploy 38378802716) and verified in production. The audit before the push found nine defects, all fixed: Will and May on the common-words list, sentence-starting words suggested as names, text from XML comments and fallback copies in Word files, a false lowercase warning, "[Person N]" for places, keyboard focus lost after a choice, a duplicated second-look list, two scans that grew with the identifiers or a text without spaces, and literal byte-order marks in the source. Production: files byte-identical, 40/40 flow checks and all audit checks in both engines, offline, smoke 112/0, daily check 11/11.
- **2026-10-13:** discovery for #028. The part-writing checker and one HOLD (tournament schedules) were rejected, along with three new rule-driven ideas, each already built free. Of the three need-first research threads, all stopped on the account's session limit (ae19ac5c8c849e92f with nothing, a9043a6c8a1158a4e and a0ec439020103807f with partial leads); the leads were checked here directly. #028 assigned to Hidden Data Check: the ICO's July 2025 guidance lists the hidden places in spreadsheets, mySociety's analyser stopped about 2% of spreadsheets sent through WhatDoTheyKnow in 2024 as breaches, and no free tool found checks that list without an upload.
- **2026-10-13:** Autonomous Ops v2 (commit a26109e): the operating contract in CLAUDE.md, "Now" at the top of the factory state, project settings with a narrow allowlist and refusals, and hooks that print the state at the start of a session and after compaction and ask once to carry on while autonomy is active. #028's unfinished code was found untracked and mid-refactor, and kept on a local branch.
- **2026-10-13:** #028 Hidden Data Check built and audited. The first draft's nine defects were each fixed at their cause; the audit found nine more, all fixed (an .xlsb or .docx given an empty report, a budget stop said twice, threaded comments without authors, hundreds of hidden rows listed one by one, scroll areas as landmarks, sideways scrolling with text at 200%, two overclaims, comments' removal steps, small wording). Checked against openpyxl, 18,000 damaged files, 62 model checks, and 72 browser checks per engine; offline; the 29-page smoke test, 116 loads, 0 problems.
- **2026-10-13:** #028 Hidden Data Check shipped (commit 02dc91e, deploy 38455167140) and verified in production: files byte-identical (67), 72 of 72 flow checks in both engines, offline, the homepage card, smoke 116/0, daily check 11/11. Discovery for #029 next.
- **2026-10-13:** discovery for #029. The diversity rule set aside the files-and-privacy leads; allocation by ranked choices went through the gate with nine searches. Free options need Google (Alice Keeler's Scheduler: greedy rounds, broad permissions) or Moodle; the rest are paid, institutional, or code people write themselves; teachers sort paper slips by hand. #029 assigned to Places by Choice.
- **2026-10-13:** #029 Places by Choice built and audited. The audit found eight defects, all fixed (a crash on a second file with fewer columns, the activities table on phones, a button wider than a phone at 200% text, a draw read from before it was typed, focus jumping on each new draw, rows cut without a word, a merged spelling's places box, literal byte-order marks in the source). Checked by exhaustive search (4,000 cases), an independent Hungarian solver (10 cases), 3,000 hostile inputs, 17 model checks, and 64 browser checks per engine; offline; the 30-page smoke test, 120 loads, 0 problems.
