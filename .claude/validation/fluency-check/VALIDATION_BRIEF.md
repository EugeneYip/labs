# Validation brief: Fluency Check

Winner Validation Phase 1 for #016 Fluency Check, research and decision completed 2026-10-11. Internal. This brief summarizes the other documents in this folder and records the decision.

## Decision: HOLD

An opportunity may exist, but only in a narrow group (independent reading tutors), and the one question that decides it, whether those tutors check fluency often enough and find their current method frustrating enough to switch, can be answered more cheaply and with less bias by 6–8 short problem interviews than by asking people to use the tool for six weeks. The broad opportunity Labs assumed ("teachers") did not survive the research.

- **Proceed to the pilot** if the interviews meet the bar in VALIDATION_PLAN.md §2: at least 4 tutors check at least every two weeks for 3+ students, at least 3 name friction in the parts Fluency Check removes, and no more than 2 already use a digital tool they're happy with.
- **Stop** if 2 or fewer meet the frequency bar, most say their current method is fine, or their interest is in passages rather than scoring. Fluency Check then stays an unchanged, maintained Labs experiment.
- Nothing starts without the owner's authorization. The public product was unchanged in this phase (see "Product status" for what changed later).

## The question

Is Fluency Check solving a painful, recurring, underserved problem for a reachable audience, enough to deserve a focused real-world validation trial? The research set out to falsify that.

## What falsified the broad opportunity

Evidence and sources: WORKFLOW_RESEARCH.md, COMPETITIVE_LANDSCAPE.md, and `notes/`.

1. **Official checks belong to districts and states.** US public schools screen K–3 students on state-approved or district-chosen tools (counts range from 7 to 42 states with approved lists, depending on definitions and date), and progress monitoring is often tied to the same system. Teachers don't choose between those tools and Fluency Check.
2. **The incumbents already score on a device,** and McGraw Hill's tool inside the Wonders curriculum does Fluency Check's core interaction: tap misread words, tap the last word, get words per minute and a graph (checked on McGraw Hill's support page, 2026-10-11).
3. **The pain isn't in the part Fluency Check automates.** Practitioners' consistent complaint is one-on-one time multiplied by caseload and frequency; scoring with an examiner copy that prints running word counts takes seconds, and teachers call paper passage sets quick and easy.
4. **Free alternatives cover most of the value:** paper with free passages, easyCBM Lite, NCII's graphing workbook, Microsoft Reading Progress (any passage, free with Microsoft 365), Google Read Along, ReadingFluency.app's free manual scoring, and about 35 free web calculators and trackers, several keeping data on the device.
5. **Tools like this don't get traction.** Teacher-built apps doing this exact workflow (Reader Meter, Running Record Calculator Pro, ReadFluent) show a handful of downloads or reviews, and digital WCPM trackers on Teachers Pay Teachers mostly have 0–2 ratings, while paper passage sets have thousands.
6. **Teachers expect it to be free,** and a 2025 research preprint found they rarely choose apps for privacy.

## What keeps a narrow opportunity alive

1. **Independent tutors are structurally underserved.** DIBELS materials are licensed only to schools and districts; Microsoft's and Google's tools need a school account; district platforms are sold per student to institutions; easyCBM's free edition covers passage-reading fluency only for kindergarten and first grade (checked 2026-10-11); ReadingFluency.app requires an account and keeps data, including audio, in its cloud.
2. **"Nothing recorded, nothing uploaded" is newly relevant.** In 2026 New Mexico let districts opt out of Amira's voice recording ("a child's voice is effectively biometric data"), 18 districts and charters dropped it, and Learning A–Z retired its speech recognition in favor of print-based WCPM checks. Families who hire tutors may care.
3. **The product is sound for informal checks.** Its error rules match DIBELS 8, it works on any device and offline, and informal checks with careful passage use are legitimate practice.
4. **But the evidence about tutors is thin:** one tutor praising an automatic WCPM calculator, and guidance pages that tell tutors to time readings and chart WCPM. Reddit and the main teacher forums couldn't be read, so the most candid voices are missing. That gap is why the decision is HOLD rather than PROCEED.

## Recommended beachhead

Scores are 1–5, where 5 is best for a first audience. "Fit" doubles frequency and pain, because a pilot needs repeated use within weeks and a reason to switch. "Later needs" is shown separately: high means more future product potential, but also more pressure toward infrastructure Labs can't provide.

| Candidate | Frequency | Pain in what Fluency Check removes | Free to choose a tool | Privacy sensitivity | Ease of reach | Tries free tools | Would recommend | Fit (of 45) | Later needs |
|---|---|---|---|---|---|---|---|---|---|
| Special-education teachers | 5 | 4 | 2 | 3 | 3 | 3 | 3 | 32 | 5 |
| Reading interventionists | 5 | 3 | 2 | 2 | 3 | 3 | 4 | 30 | 5 |
| **Independent reading tutors** | 3 | 2 | 5 | 4 | 3 | 4 | 4 | 30 | 3 |
| Reading specialists | 4 | 3 | 3 | 2 | 3 | 3 | 4 | 29 | 4 |
| Homeschool parents | 2 | 1 | 5 | 3 | 4 | 5 | 3 | 26 | 2 |
| Literacy coaches | 2 | 2 | 3 | 2 | 3 | 4 | 5 | 25 | 3 |
| K–3 classroom teachers | 3 | 2 | 1 | 2 | 2 | 3 | 3 | 21 | 4 |

**Recommendation: independent reading tutors**, especially those trained in structured literacy, in private practice or small tutoring businesses. Special-education teachers and interventionists score higher on frequency and pain, but their official data must go into district systems, so a local-only tool duplicates work. Browser storage that can be wiped is also unsafe as the only copy of IEP or intervention data. Relieving their pain would take rosters, sync, and reports: a different product, and Stage D territory. Tutors are free to choose, sit outside the licences and systems that serve schools, may serve privacy-conscious families, and fit the product as it is. Their weakness is the least direct evidence of frequency and pain, which is exactly what Stage 0 tests. Literacy coaches and structured-literacy trainers are the channels to them, not the users.

## The five things the owner needs to know

1. **Strongest evidence of real pain:** one-on-one testing time multiplied by caseload, consistent from 2010 to 2026. Examples: a 2026 educator calling IEP data collection "a constant juggling act"; most of about 190 Iowa special-education teachers tracking 20+ IEP goals, with over 60% often or always overwhelmed; mCLASS outages during the fall 2025 testing window; teachers buying a $20 progress-monitoring passage set with 4,150 ratings. Fluency Check relieves only the edges of this.
2. **Strongest evidence against:** the same tap-and-score workflow already exists inside Wonders and the district platforms, free in Microsoft 365, and free with an account in ReadingFluency.app. Paper with running word counts is quick. Teacher-built apps doing exactly this have almost no users.
3. **Most important competitors:** paper with free passages (the real incumbent); district platforms (mCLASS, Acadience, aimswebPlus, FastBridge, easyCBM); McGraw Hill's built-in tool; Microsoft Reading Progress; ReadingFluency.app (the closest direct competitor); free web calculators such as wcpmcalculator.com.
4. **Actual differentiation:** a combination, not a feature. It's the only tool found that lets one person, on any device, with no account and nothing recorded or uploaded, score a live reading word by word on any passage, keeping a printable marked record and a per-student history. Real but narrow, and resting on values (privacy, zero setup) not yet shown to drive adoption.
5. **Privacy and compliance:** local-only storage means Labs never receives student data, so most vendor-side obligations aren't triggered (FERPA school-official contracts, COPPA, state vendor laws). The school's and teacher's obligations remain: saved checks are very likely education records once used. Some districts want tools approved before student names go in, shared devices expose names, and Safari's tracking prevention may remove the saved checks after seven days of Safari use without interaction with the page (Home Screen web apps are exempt from that cap, per WebKit). A cloud version would bring the full stack of data agreements, security programs, and breach duties. The current page makes no misleading claims. See RISK_AND_COMPLIANCE.md.

## If the pilot happens (VALIDATION_PLAN.md)

- **Who and how long:** 6–8 independent reading tutors who check at least every two weeks for 3+ students, recruited personally; six weeks of use plus one unprompted question at week 8.
- **What is counted:** behavior first. Self-reported counts of checks and students (never student information), substitution of their old method, use after the pilot ends, and referrals that lead to someone else trying it.
- **GO:** at least 75% activate, half become repeated users (6+ checks on 4+ days over 3+ weeks), 3+ retained after the pilot, 2+ referrals that lead to trial, and 40%+ "very disappointed" at the thought of losing it.
- **CONTINUE:** partial results, or one cheap blocker, then one more cohort.
- **STOP:** under half activate, at most one repeated user, or most return to their old method within two weeks.

## Spin-out threshold

Fluency Check leaves Labs only after the pilot reaches GO. After that, within about three months it needs: 15+ active repeated users, half of them not recruited by the owner; 40%+ still using it at 8 weeks; a concrete need for its own identity; a distinctive name that passes a trademark search ("Fluency Check" collides with UFLI's widely used "Fluency Checks"); and the owner's commitment to support it. Servers, accounts, or sync come later still, and only for a need repeated use proves (30%+ of active users, or 3+ organizations willing to sign data agreements), after local-only answers have fallen short.

## Pricing

Teachers expect this workflow to be free. The money in this market is districts paying $1–$20 per student per year for standardized, normed systems, plus teachers buying printable passages. A paid tier would pull the tool into district procurement and break Labs' rules. The pilot should test repeated use, not willingness to pay. If revenue were ever needed, the evidence points to content (equivalent passage sets), which would be a different product.

## Product status

Unchanged in Phase 1. No serious regression or harmful factual claim was found. Since then: P1 of the autonomous queue made the three wording changes below; P4 added a notice when the browser isn't saving and dropped the log's 2,000-check cap; P6 shows the newest 500 checks with "Show all"; P9 takes up checks saved in another open tab. Wording to review later, with the owner's approval (done in P1): the DIBELS sentence (reword, or add the registered mark and a non-affiliation note), a note that the 95/90 accuracy bands come from the reading-inventory tradition rather than DIBELS 8's 96/91 cutoffs, and a line asking teachers to keep results in their school's own records (RISK_AND_COMPLIANCE.md §6, §10).

## Research limits

- Reddit and the main teacher forums couldn't be read by any available tool, so candid practitioner voices, especially tutors' and homeschool parents', are missing.
- The research threads' shared web-search allowance ran out partway, leaving gaps in app reviews, Android apps, and community sizes.
- Scholarly sources (two surveys, a thesis, the Hasbrouck–Tindal norms report) are cited as not resolved through LibKey, which this session doesn't have.
- No practitioner was contacted, by design.

## Documents in this folder

- WORKFLOW_RESEARCH.md: how fluency checks are really done, pain evidence, abandonment triggers, roles.
- COMPETITIVE_LANDSCAPE.md: the map, wedge verdicts, differentiation, pricing, brand collision.
- RISK_AND_COMPLIANCE.md: privacy, FERPA and COPPA, district rules, devices, claims, licensing, validity.
- VALIDATION_PLAN.md: hypotheses, Stage 0 interviews, the pilot, metrics and thresholds, the feedback channel, stages A–D.
- RECRUITMENT_CHANNELS.md: search, communities, multipliers, and how to recruit.
- FEATURE_REQUEST_HYPOTHESES.md: ideas recorded, none to be built.
- `notes/`: the five research threads' full notes with sources.
