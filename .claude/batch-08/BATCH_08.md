# Batch 08: Discovery Cycle 3

Authorized by the owner on 2026-10-13. This file is the batch's checkpoint; `.claude/FACTORY_STATE.md` points here. A fresh session reads `CLAUDE.md`, the constitution, the factory state's "Now", and this file's "Now", checks `git status` and `git branch`, then continues from the next action.

## Authorization, in short

- **Goal:** discover, build, audit, deploy, and resolve up to five new experiments, #030–#034. Never #035, and no further batch. An upper limit, not a quota: strong negative evidence is useful output, and shipping weak products to use up numbers is failure. The target is expected long-term value per experiment.
- **Part A first:** Autonomous Ops v2.1 (permissions, writable checkpoints, the WIP-branch lifecycle, session start, the Stop hook, long-work recovery, one harmless autonomous cycle), recorded below, then discovery without stopping.
- **Allowed without routine approval:** research, rejecting ideas, numbering survivors, WIP branches, implementation, tests, browser checks, registry and Product Log entries, records and dossiers, commits, ordinary pushes, deploys, production checks, fixing defects found before or after ship, and moving on to the next candidate.
- **Not allowed:** contacting anyone (users, testers, communities, regulators, vendors), posting, recruiting, interviews, spending money, accounts or backends, keyed services, analytics, weakening the constitution, permission workarounds (Firefox stays parked), desktop-app automation that needs a new owner permission, the parked owner lanes, #035, another batch.
- **Pattern:** need first, then research the alternatives, then try to falsify, and only then BUILD. Seek diversity of audience, workflow, interaction, domain, browser capability, and output; don't make Batch 08 five more privacy or file tools (Batch 07 already has #027 and #028). Quality outranks diversity.

## Per-candidate gate (before a number)

E1 audience (a named role or situation); E2 the exact job (what happens just before, and the result needed after); E3 evidence of friction; E4 current alternatives, searched by the job's own words (products, browser and free tools, apps, desktop software, templates, add-ons, OS features, manual work); E5 the strongest incumbent, never hidden; E6 the Labs wedge ("cleaner UI" alone isn't one); E7 Labs fit; E8 falsification, the strongest reason not to build, searched for. Outcome: **REJECT** (an evidence-backed reason kept), **HOLD** (sparingly: one missing fact that would change the decision and can't be settled here; never blocks discovery), or **BUILD** (then the next number).

## Per-experiment sequence

research → gate → number → `wip/<number>-<slug>` branch → principal failure modes (only the relevant ones) → implement → tests with independent evidence (brute force, exhaustive small cases, invariants, a second implementation, files written by the real program, official examples) → audit (performance at the realistic upper end, resilience, accessibility, Chromium and WebKit, privacy and claims) → fix → shipping gate → one squashed commit on `main` → push → deploy → production verification → lifecycle record → next discovery. One numbered experiment at a time; the next doesn't start while the current one has an unresolved material defect.

**Shipping gate.** Product: the core job works; no known material correctness defect or silent data-loss path; invalid input fails safely; privacy and network wording matches behavior; material limitations visible. QA: logic tests; `npm run build`; Chromium and WebKit; phone and desktop; light and dark; keyboard; console; direct route; offline where relevant. Records: registry, Product Log, dossier, this checkpoint.

**Production verification** (a green Actions run isn't enough): the intended commit; live files byte-identical to a fresh build (`node .claude/qa/prod-parity.mjs dist`); the direct route opened and the core workflow exercised; console; phone and desktop; file, storage, and share behavior where they apply; offline where it applies; the whole-site smoke test; the daily check. Only then "verified in production".

**Claims:** no "fully private", "nothing leaves the device", "anonymous", "safe", "optimal", "guaranteed", "compliant", "complete", or "works everywhere" unless evidence supports the exact claim.

## Now

- **Step:** Part A done except the Stop hook's live check, which is the next stop; discovery for #030 begins.
- **Next action:** need-first discovery for #030: broad research lanes for jobs, failure modes, rules, and repeated manual work outside files and privacy; every serious candidate through the gate in `CANDIDATES.md`.
- **Numbered so far:** none. #030 is the next number.

## Part A: Autonomous Ops v2.1

| Item | Result |
|---|---|
| A1 permissions | **Done.** Reviewed against Batch 07's operations. Added, each narrow: the WIP-branch lifecycle for `wip/*` only (`git switch main`, `git switch wip/*`, `git switch -c wip/*`, `git merge --squash wip/*`, `git branch -D wip/*`), `git push origin main` (not a bare `git push`), QA scripts in `.claude/qa/` (node, sh, `python3 -I`), the bounded runner, the hook's offline test, WebSearch and WebFetch. New confirmations: `git switch` with `--discard-changes`, `--force`, or `-f`; `git rebase`; `git filter-*`; edits to `.claude/scripts/`. New refusals: pushing any `wip/` branch, deleting a remote branch by refspec (`git push * :*`), `gh auth` login, logout, refresh, switch, and setup-git, `gh variable`, `gh ssh-key`, `gh gpg-key`, `gh repo edit`, rename, and archive. Kept: sudo, su, force pushes, mirror, remote deletes, tokens, secrets, keychains, credentials files, ssh. Not allowed broadly: the generic `perl … exec @ARGV` wrapper would run any command, so QA runs go through `.claude/scripts/qa.sh` instead; other `gh api` calls, `rm`, package installs, and edits to settings, hooks, scripts, `CLAUDE.md`, and the constitution still need the normal check. 62 allow, 15 ask, 40 deny rules. |
| A2 checkpoints writable | **Done.** `Edit(/.claude/*.md)` covers the factory state, the queue, the portfolio and audit records; `Edit(/.claude/batch-*/**)` covers this batch's checkpoint, candidates, and dossiers; the Product Log, registry, and source were already allowed. |
| A3 WIP-branch lifecycle | **Done.** The policy is `CLAUDE.md`'s (unchanged); the permissions above cover it end to end; "How to resume" now says the session-start output's WIP line counts, and where milestones and "Now" updates go while an experiment is being built. No branch is made for unnumbered candidates. |
| A4 session start | **Done.** Run as after compaction: 3,181 characters, with Autonomy `active`, the batch and its limits, the discovery state, the exact next action, the owner-blocked lanes, git, and any WIP branch (the hook lists `refs/heads/wip/` from any branch). Unchanged: it was already concise. |
| A5 Stop hook | **Offline done; live check next.** Defect fixed: the loop guard relied only on `stop_hook_active`, which may stay true for the rest of a turn once a Stop hook has blocked, so in a long run from one owner message the hook might ask only once. Now it lets a stop through when (1) it already asked 3 times in 10 minutes, (2) the transcript shows no tool used since its last ask, or (3) no earlier ask is visible (or the transcript is unreadable) and `stop_hook_active` is true. Asks are found by a marker in the reason, in entries that aren't Claude's own messages or tool results. Each run logs one line to `.claude/hooks/stop-hook.log` (ignored by git). `.claude/scripts/stop-hook-test.sh`: 29 of 29 cases (no state file; complete, paused, blocked; the fallbacks; three possible transcript shapes for an ask; the marker in Claude's own edits and in tool results; a half-written line; the rate limit; a tight loop stopping on the 4th try; odd input; quotes, backslashes, and tabs in the next action; 1,500 entries in under 5 s). |
| A6 long-work recovery | **Done.** `.claude/scripts/qa.sh <seconds> <script>` runs a QA script with a limit and stops its whole process group (checked: a hung script with a child process was stopped at its limit, exit 124, no orphan left). `CLAUDE.md` "Long jobs": one bounded purpose per research thread or sub-agent, never wait on one indefinitely, keep partial results, the main session owns continuation. |
| A7 one autonomous cycle | **Done.** Checkpoint, the v2.1 change itself (no page changed), the hook cases and the build, commit e4ec9db, `git push origin main`, deploy 38487235836 succeeded for e4ec9db, production byte-identical to a fresh build (69 files, 99 addresses), daily check 11 of 11, next action set; no owner step. |

## Numbered experiments

| # | Title | Slug | Status | Dossier |
|---|---|---|---|---|

## Log

- **2026-10-13:** reconciled. Batch 07 is complete (closed at four, #026–#029, all live). `main` = `origin/main` = c157fe5, clean, no WIP branch, no Batch 08 work begun. Production's 69 files are byte-identical to a fresh build (99 addresses, `.claude/qa/prod-parity.mjs`, new); the daily check passes 11 of 11 against production, and GitHub's last scheduled run (38446088538) passed; every recent deploy succeeded. Batch 08 records created.
- **2026-10-13:** Autonomous Ops v2.1 committed (e4ec9db) and deployed (run 38487235836): permissions for the routine lifecycle, writable records, the bounded QA runner, the Stop hook's loop guard (29 offline cases), session start checked. Production byte-identical; daily check 11 of 11.
