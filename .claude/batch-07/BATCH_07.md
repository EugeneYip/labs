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

- **Step:** #028 Hidden Data Check (`hidden-data-check`): building, on the local branch `wip/028-hidden-data-check` (never pushed). Research, number, and risk list are done (`028-hidden-data-check.md`).
- **The code so far** (saved in commit 2601ad1 on that branch): `xml.ts`, `zip.ts`, and `sheet.ts` are reworked after a first review; `inspect.ts` is still the first draft and doesn't type-check against them (`SheetContext.memory` missing, the old `far` fields). There's no `index.tsx` yet. The first draft as it was is kept in `.claude/qa/hdc/draft-original/`, and the defect cases are in `.claude/qa/hdc/` (`cases.ts`, `zipwrite.ts`, `probe-one.ts`, `probe-draft.ts`); all of `.claude/qa/` is local only.
- **The first draft's defects** (each shown by a case in `cases.ts`; fix the cause, not the case): workbook parts silently skipped (Power Query); an unreadable hidden sheet called empty; a failed sheet's leftovers hiding the next sheet's far-away data; "text no cell uses" claimed when a sheet couldn't be read in full; a damaged file taking minutes (an unterminated quote); `list.map(clip)` passing the index as the length, so list items came out cut short; ordinary chart, metadata, and macro parts listed as unread; visible formatting (yellow on white, page-number headers) reported as hidden; a Word `.doc` called an old Excel file.
- **Next action:** reconcile `inspect.ts` with `sheet.ts` (pass a `SheetMemory`, use `far.rows`/`far.cols` and `far.error`, drop leftovers from the draft), then run every case and fix what fails; then fictional fixtures checked by an independent reader, the page, the audit, the shipping gate, the squash-merge to `main`, the push, and the production check.
- **Then:** discovery for #029 (gate rules above). Parked leads for later discovery: allocating people to activities by ranked choices; exporting Word comments to a table; small-number suppression.
- **The need-first round's three research threads** all stopped on the session limit; their partial leads were checked here (`CANDIDATES.md`, "Need-first round").
## Numbered experiments

| # | Title | Slug | Status | Dossier |
|---|---|---|---|---|
| 026 | Exam Timekeeper | exam-timekeeper | shipped 2026-10-13, verified in production | `026-exam-timekeeper.md` |
| 027 | Transcript Pseudonyms | transcript-pseudonyms | shipped 2026-10-13, verified in production | `027-transcript-pseudonyms.md` |
| 028 | Hidden Data Check | hidden-data-check | building | `028-hidden-data-check.md` |

## Log

- **2026-10-13:** reconciled. `main` = `origin/main` = 3d08ca5, clean. Production's 61 files are byte-identical to a fresh build of 3d08ca5; the daily check passes 11 of 11 against production (run locally; GitHub's first scheduled run is at 11:17 UTC today); every recent deploy succeeded. Batch 07 recorded; candidate pool written.
- **2026-10-13:** discovery. About 125 ideas considered: about 100 screened out in a first pass (51 rows in `CANDIDATES.md`), and 23 taken through the gate by six read-only research threads, with each decision's deciding claims checked again here: 14 rejected, 6 on hold, 3 survivors. #026 assigned to Exam Timekeeper after the JCQ clock rule and its competitors were verified directly.
- **2026-10-13:** #026 Exam Timekeeper shipped (commit 731ed53, deploy 38374652232) and verified in production. The audit before the push found nine defects, all fixed: a 7.1 s freeze per tick with the largest exam (formatters rebuilt for every time shown), a fit-to-screen loop that crashed the board, a cut-off board, a confusing "Finish 10:31" for a start just after 09:00, mis-tap breaks, ambiguous field names, an unreachable scroll region, missing focus rings on time fields, and "UK" where JCQ's rules cover less. Production: files byte-identical, 46/46 flow checks and all audit checks in both engines, offline, smoke 108/0, daily check 11/11.
- **2026-10-13:** #027 Transcript Pseudonyms shipped (commit 66df97b, deploy 38378802716) and verified in production. The audit before the push found nine defects, all fixed: Will and May on the common-words list, sentence-starting words suggested as names, text from XML comments and fallback copies in Word files, a false lowercase warning, "[Person N]" for places, keyboard focus lost after a choice, a duplicated second-look list, two scans that grew with the identifiers or a text without spaces, and literal byte-order marks in the source. Production: files byte-identical, 40/40 flow checks and all audit checks in both engines, offline, smoke 112/0, daily check 11/11.
- **2026-10-13:** discovery for #028. The part-writing checker and one HOLD (tournament schedules) were rejected, along with three new rule-driven ideas, each already built free. Of the three need-first research threads, all stopped on the account's session limit (ae19ac5c8c849e92f with nothing, a9043a6c8a1158a4e and a0ec439020103807f with partial leads); the leads were checked here directly. #028 assigned to Hidden Data Check: the ICO's July 2025 guidance lists the hidden places in spreadsheets, mySociety's analyser stopped about 2% of spreadsheets sent through WhatDoTheyKnow in 2024 as breaches, and no free tool found checks that list without an upload.
