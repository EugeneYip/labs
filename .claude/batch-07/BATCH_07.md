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

- **Step:** #026 Exam Timekeeper (`exam-timekeeper`): BUILD decided 2026-10-13; the risk list is in `026-exam-timekeeper.md`. Implementing.
- **Next action:** build `src/experiments/exam-timekeeper/` (a pure `model.ts` for the times, then the page), test the model against an independent simulation, then the adversarial audit and the shipping gate in this file.
- **After #026:** the anonymize-transcripts candidate's last check, then the part-writing checker's (`CANDIDATES.md`, "Decisions after the gate").

## Numbered experiments

| # | Title | Slug | Status | Dossier |
|---|---|---|---|---|
| 026 | Exam Timekeeper | exam-timekeeper | building | `026-exam-timekeeper.md` |

## Log

- **2026-10-13:** reconciled. `main` = `origin/main` = 3d08ca5, clean. Production's 61 files are byte-identical to a fresh build of 3d08ca5; the daily check passes 11 of 11 against production (run locally; GitHub's first scheduled run is at 11:17 UTC today); every recent deploy succeeded. Batch 07 recorded; candidate pool written.
- **2026-10-13:** discovery. About 130 ideas considered: about 100 screened out without research, 26 taken through the gate by six read-only research threads (each decision's deciding claims checked again here). 16 rejected, 6 on hold, 3 survivors. #026 assigned to Exam Timekeeper after the JCQ clock rule and its competitors were verified directly.
