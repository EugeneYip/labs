# Validation plan: Fluency Check

Winner Validation Phase 1 (2026-10-11). Nothing in this plan starts without the owner's explicit authorization: no interviews, no recruiting, no pilot. The phase decision is **HOLD** (see VALIDATION_BRIEF.md): the next step is a short round of problem interviews (Stage 0 below), and the usage pilot runs only if those interviews meet their bar.

**Beachhead for everything below:** independent reading tutors (in private practice or small tutoring businesses), especially those trained in structured-literacy methods, who check oral reading fluency regularly. The reasons are in VALIDATION_BRIEF.md.

## 1. Hypotheses

Each must be confirmable and falsifiable. "Cheap test" says what would settle it with the least effort.

| # | Hypothesis | Confirming evidence | Disconfirming evidence | Cheap test |
|---|---|---|---|---|
| P1 Problem frequency | Independent reading tutors check fluency often enough (at least every two weeks, for several students) that a better tool would be used repeatedly | In interviews, most report checks at least every two weeks for 3+ students, with dates they can point to | Checks are monthly or rarer, or only at intake and discharge | Stage 0 interviews: "Walk me through the last three fluency checks you did" |
| P2 Problem friction | The tutor's current method (paper, timer, arithmetic, spreadsheet, reports to parents) causes friction in the parts Fluency Check removes | They describe specific annoyances in scoring, counting, recording, charting, or reporting, unprompted | They say it takes seconds, or the only burden is the reading itself or finding passages | Stage 0, before the product is mentioned |
| R1 Product: speed and load | A tutor completes a check with less effort than their current method, from opening to a recorded score | Participants say it's easier, and keep using it unprompted; where measured, setup plus check plus recording takes no longer than paper | Setup (pasting text, showing the student a copy, especially online) eats the gain; they revert | Pilot week 1–3: participants time one paper check and one Fluency Check once, and say which they'd rather do |
| R2 Product: comprehension | A tutor understands the tool without help | First real check completed and saved with no help request | Help requests about basic flow; wrong marks; abandoned first attempt | Pilot activation data |
| T1 Retention | Tutors who try it during real monitoring keep using it | Repeated use across 3+ weeks and use after the pilot ends | Use stops after week 1–2 | Pilot weekly counts and the unprompted week-8 question |
| V1 Privacy | No account and nothing recorded or uploaded influences adoption | Tutors raise it unprompted as a reason to use it, or a family's privacy concern made them prefer it | Nobody mentions it unless asked, or they already use cloud tools happily | Stage 0 and exit interview: ask "why did you use it?" before mentioning privacy |
| D1 Differentiation | Any passage with no account is meaningfully better than their alternatives (paper with UFLI or Newsela copies, spreadsheets, easyCBM Lite, ReadingFluency.app) | They choose it over a free alternative they know, and can say why | They prefer an alternative, or see no difference | Stage 0 (what they know of) and exit interview (what they'd use if it vanished) |
| X1 Expansion | Repeated users eventually need history across devices, rosters, or sharing | Retained users raise the same need independently (see FEATURE_REQUEST_HYPOTHESES.md) | No one asks; one device and CSV are enough | Pilot feedback, counted, never prompted |

## 2. Stage 0: problem interviews (the HOLD step)

- **Who:** 6–8 independent reading tutors, reached personally through the owner's network or one introducer (a structured-literacy trainer or tutoring-business owner). No posting, no surveys in communities.
- **Format:** 20 minutes, by phone or video, or written answers by email if they prefer. The product is not shown or named until the last five minutes, so it can't shape the answers.
- **Questions** (ask in order; don't lead):
  1. How do you check a student's reading fluency today? Walk me through the last time.
  2. How often do you do it, and for how many students? When were the last three? Do you tutor in person, online, or both, and if online, how does the student see the passage?
  3. What do you use: passages, timer, paper, apps, spreadsheets? Where do the results go afterwards (parents, schools, your own records)?
  4. What, if anything, is annoying or slow about it? (Then silence; let them fill it.)
  5. Have you tried any app or website for this? What happened?
  6. Do families or schools ever ask how you store information about their child?
  7. (Last five minutes) Show the page. Would you try this with a student this week? Why or why not?
- **Record:** role, students, frequency, method, frictions named unprompted, tools tried, and their answer to 7. Never student information.
- **Resolution:**
  - **Proceed to the pilot** if at least 4 tutors check fluency at least every two weeks for 3+ students, at least 3 describe unprompted friction in scoring, recording, charting, or reporting, and no more than 2 already use a digital tool they're happy with.
  - **Stop** if 2 or fewer meet the frequency bar, or most say their current method is fine, or interest centers on passages (content) rather than scoring.
  - Otherwise, decide with the owner whether a second interview round with school-based interventionists doing supplemental checks is worth it.
  - If most qualifying tutors work online, the pilot's guide must show how the student sees a clean copy (the printable student copy, saved as a PDF and shared on screen while the tutor marks on another device or window). If tutors find that unworkable, record it as a blocker before any pilot.

## 3. The pilot (only after Stage 0 says proceed, and with owner authorization)

### Participants

- 6–8 independent reading tutors, ideally including Stage 0 interviewees who met the bar. All must currently check fluency at least every two weeks for 3+ students, use paper, a timer, or a spreadsheet now, have a phone, tablet, or laptop during sessions, and be free to choose their own tools.
- Record each participant's relationship to the owner (friend, acquaintance, introduced). Prefer introductions over friends, who overstate value.
- One segment only. If tutors can't be found, don't mix in classroom teachers; consider a separate small round with interventionists later.

### Duration

Six weeks of use, then a single unprompted question at week 8. Six weeks lets a tutor checking three students every two weeks reach about nine checks without changing their routine.

### Onboarding (about 15 minutes, mostly self-serve)

- A one-page guide: running a check, saving it, downloading the CSV after each session, adding the page to an iPad's Home Screen (Home Screen web apps are exempt from Safari's seven-day cap on storage for sites not interacted with), using initials or a private code if a family prefers, and which passages to use: their own licensed passages or UFLI's openly licensed Fluency Checks, **not DIBELS passages** (their licence covers only schools and districts).
- An optional 10-minute call.
- A practice check on an adult before using it with a student.
- The instruction is only: "Use it for the fluency checks you'd do anyway, whenever it suits you."

### What not to tell participants (to avoid bias)

- That Labs ranked it first, or that anyone hopes it succeeds.
- Privacy or "no account" as selling points. Describe it neutrally ("it runs in your browser and saves checks on your device"), then see whether privacy comes up on its own.
- Possible future features (rosters, sync, passage libraries). See what they ask for.
- Any target number of checks or the thresholds below.

### What to observe (behavior first)

- Date of the first real check (activation).
- Weekly: number of checks and number of distinct students, read by the participant from the "Saved checks" list. Numbers only.
- Whether Fluency Check replaced their old method for those checks or ran alongside it.
- Which parts they used: printed record, chart, CSV, goal.
- Help requests, and what they were about.
- Any disagreement between Fluency Check's scores and their own judgment.
- Last-use date and the reason, for anyone who stops.
- Unprompted referrals (someone they told who then tries it).

### Feedback schedule

| When | Question | Effort |
|---|---|---|
| Day 3–7, after the first real check | What did you use it for? Anything confusing? Did the score match what you'd have counted? | 2 minutes, email |
| Weekly (weeks 1–6) | How many checks this week, with how many students (count from the Saved checks list)? Anything that got in the way? | 1 minute, email reply |
| Week 3 | Time one check your old way and one with Fluency Check, from start to recorded score. Which would you rather do, and why? | 10 minutes, email or call |
| Week 6 (exit) | When did you choose it, and when didn't you? What would make you stop? If it disappeared tomorrow, what would you use? How would you feel: very, somewhat, or not disappointed? Have you told anyone about it? What did you wish it did? | 20 minutes, call or written |
| Week 8 (unprompted) | Did you use it in the last two weeks? How many checks? | 1 minute, email |

### Data the pilot must never collect

Student names, initials, codes, ages, grades, or schools tied to a child; scores, missed words, or notes about a child; CSV files; screenshots or photos of the saved checks or printed records; recordings. The pilot collects only: the participant's role, the grade bands they serve, their usual method, counts (checks, distinct students), dates, timings, and comments without student information.

### Protecting student information

- Participants follow any rules their families or partner schools set; if unsure, they use initials or private codes, which are still student information and are treated as such.
- Use a personal or work device the participant controls, not a shared one; delete the saved checks at the end if they stop.
- Every feedback message template says: "Please don't include student names or other details about students." Any message that does is deleted after its counts are noted.
- Fluency Check itself sends nothing anywhere, so the pilot creates no new copy of student data. That claim stays true only if nothing is added to the page.

### Behavior over opinion

Fluency Check stores nothing outside the participant's browser and Labs has no analytics, so behavior is self-reported counts, not observed logs. The thresholds below therefore rely on repeated, dated counts across weeks and on behavior that's hard to fake: still using it after the pilot ends, and telling a colleague who then tries it. Five enthusiastic comments are not validation.

## 4. Metrics and thresholds

### Per participant

| Metric | Definition |
|---|---|
| Activated | Saved at least one check with a real student within 7 days of onboarding |
| First-use success | First real check completed without asking for help, and the participant agrees the score matches what they'd have counted |
| Repeated user | At least 6 real checks, on at least 4 different days, spread over at least 3 different weeks, in weeks 1–6 |
| Retained | At least one real check in week 5 or 6, and reports at least one in weeks 7–8 when asked once, without other prompting |
| Substituted | For the checks done in Fluency Check, it replaced their old method rather than running alongside it |
| Recommender | Told at least one other tutor or teacher who then tried it (reported by either), or recommended it unprompted in writing |

### For the cohort (6–8 enrolled; counts use everyone enrolled, including people who never start)

| Outcome | All of these |
|---|---|
| **GO** (enter Stage B) | At least 75% activated; at least half are repeated users; at least 3 retained, and most retained users substituted; at least 2 recommenders; at least 40% "very disappointed" at the exit; no unresolved scoring disagreement; no data loss that the CSV couldn't recover |
| **CONTINUE** (one more cohort of 6, after any fix the owner approves) | At least half activated, but only 2 repeated users; or GO met except for one blocker that's cheap to remove (for example, online sessions or iPad data clearing); or results concentrated in one sub-group worth narrowing to |
| **STOP** (stays an unchanged Labs experiment) | Under half activated; or at most 1 repeated user; or most who activated returned to their old method within two weeks saying it wasn't faster or duplicated work; or interest was in passages, not scoring |

A STOP is a successful outcome of the phase: it saves the owner from investing in something people don't need.

## 5. No-account feedback channel

The current Feedback link opens a public GitHub issue, which needs a GitHub account (it redirects to sign-in) [V, `notes/distribution-notes.md` Part 4]. For a tutor, teacher, or parent, that's a wall, and for anyone discussing a child, public is wrong.

| Option | Cost | Privacy | Spam | Maintenance | Student details sent by mistake | Backend or third-party processor | Fits Labs' rules |
|---|---|---|---|---|---|---|---|
| **Email link (mailto) to a dedicated alias on the owner's domain** | $0 (registrar forwarding is free) | Only the two email providers see it; Labs stores nothing | The address can be harvested; an alias can be filtered or replaced | Read email | Possible, private; mitigated by the template | None new | **Yes** |
| Tally, Formspree, Basin, Google Forms | Free tiers | A third party stores every message | Varies | Low | Likely, and stored by a third party | Yes, tied to an owner account | No: an account-bound service |
| GitHub Issues or Discussions | $0 | Public | Low | Moderation | Public | GitHub | Fails "no account" for visitors |

**Recommendation:** an email link to a dedicated forwarding alias on the owner's domain, with a pre-filled subject ("Fluency Check feedback") and body ("What did you try? What worked, and what didn't? Please don't include student names or other details about students."), with the address also shown as text for computers without a mail app. Keep the GitHub link for technical visitors. Before this exists, pilot participants simply reply to the owner's emails. Setting up the alias is the owner's job (a registrar setting), and changing the site's link is a public change that needs the owner's review and an explicit yes.

## 6. Stages: what must happen before Fluency Check leaves Labs

| Transition | Evidence required (all of it) |
|---|---|
| **A → B: Labs experiment to validated experiment** | Stage 0 meets its bar, then the pilot meets GO |
| **B → C: validated experiment to standalone product** (its own name, domain, repository) | Within about three months after GO: at least 15 active users who meet the repeated-use definition, at least half of them not recruited personally by the owner (they came through referrals, an introducer, or word of mouth); at least 40% of them still using it 8 weeks after starting; a concrete reason a separate identity helps (users confusing it with UFLI's "Fluency Checks", or introducers needing a stable named home); a distinctive name that has passed a trademark search; and the owner's commitment to support it. A standalone can stay static, free, and local: Stage C doesn't require infrastructure |
| **C → D: infrastructure expansion** | Only for a need that repeated use proves, one need at a time: roster management, history across devices, backup, or colleague sharing. For each: at least 30% of active users over two months hit it, or at least 3 organizations (tutoring businesses, private schools) ask for it and accept a data agreement; local-only answers (backup files, import and export) have been tried and fall short; and the owner accepts the obligations a server holding student data brings (data agreements, a security program, breach procedures, accessibility reports; see RISK_AND_COMPLIANCE.md). Convenience alone is never a reason |

## 7. Owner involvement

- **Stage 0:** send 6–8 personal invitations, hold the conversations (or collect written answers), about 3–4 hours in total. The interview guide is above.
- **Pilot:** recruit, send the one-page guide, forward weekly replies (or read them), and run or send the exit questions, about 1–2 hours a week for six weeks.
- Everything else (summaries, counts against thresholds, the decision memo) can be prepared from what participants send, with student information never included.
