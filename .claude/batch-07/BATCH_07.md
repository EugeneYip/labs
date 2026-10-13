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

- **Step:** #026 Exam Timekeeper shipped and verified in production (2026-10-13). Discovery for #027.
- **Next action:** the anonymize-transcripts candidate's last check (search for browser tools that pseudonymize transcripts; QualiAnon's current state), then BUILD or REJECT; if rejected, the part-writing checker's final check (`CANDIDATES.md`, "Decisions after the gate").

## Numbered experiments

| # | Title | Slug | Status | Dossier |
|---|---|---|---|---|
| 026 | Exam Timekeeper | exam-timekeeper | shipped 2026-10-13, verified in production | `026-exam-timekeeper.md` |

## Log

- **2026-10-13:** reconciled. `main` = `origin/main` = 3d08ca5, clean. Production's 61 files are byte-identical to a fresh build of 3d08ca5; the daily check passes 11 of 11 against production (run locally; GitHub's first scheduled run is at 11:17 UTC today); every recent deploy succeeded. Batch 07 recorded; candidate pool written.
- **2026-10-13:** discovery. About 125 ideas considered: about 100 screened out in a first pass (51 rows in `CANDIDATES.md`), and 23 taken through the gate by six read-only research threads, with each decision's deciding claims checked again here: 14 rejected, 6 on hold, 3 survivors. #026 assigned to Exam Timekeeper after the JCQ clock rule and its competitors were verified directly.
- **2026-10-13:** #026 Exam Timekeeper shipped (commit 731ed53, deploy 38374652232) and verified in production. The audit before the push found nine defects, all fixed: a 7.1 s freeze per tick with the largest exam (formatters rebuilt for every time shown), a fit-to-screen loop that crashed the board, a cut-off board, a confusing "Finish 10:31" for a start just after 09:00, mis-tap breaks, ambiguous field names, an unreachable scroll region, missing focus rings on time fields, and "UK" where JCQ's rules cover less. Production: files byte-identical, 46/46 flow checks and all audit checks in both engines, offline, smoke 108/0, daily check 11/11.
