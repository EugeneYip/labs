# Validation brief: Custody Calendar

Comparative Research (2026-10-11). Internal; research only, nobody contacted; not legal advice. Evidence: `notes/market-notes.md` (workflows, pain, competitors, search, beachheads, monetization) and `notes/legal-risk-notes.md` (overnight definitions, legal-information line, courts, safety, privacy, claims). Labels: **[V]** read on the source; **[S]** snippet; **[U]** inference; **[V, rechecked]** confirmed directly during synthesis.

## Decision: STOP FOCUSED VALIDATION

The job is real and has money attached (overnights feed child-support formulas), but a free, no-account schedule visualizer doesn't have a defensible place in it. Professionals already get the same job free (OurFamilyWizard's Custody Schedule Builder), parents have free apps and general calendars, the most conflicted families are ordered onto specific platforms, and after an agreement the real job is live coordination and records, which a static page can't do. The one surviving niche, comparing schedules before an agreement, is episodic (about once per family), and competing there would mean adding legally sensitive features. Custody Calendar stays a useful, maintained Labs tool.

## Core question

Is there a meaningful underserved job before or outside paid co-parenting platforms where a free, no-account schedule visualizer is valuable enough to become a standalone product?

**Answer: the evidence leans toward no.** There is a gap in *form* (no free, no-account web page was found that takes any pattern and shows a dated year with overnight shares, a calendar file, and a share link), but not evidence of *demand* for that form.

## The common analysis

| | Finding |
|---|---|
| **User (narrowest beachhead)** | Parents comparing candidate schedules before an agreement or a modification, often self-represented, and the mediators helping them. Not post-agreement planners or parenting coordinators |
| **Job** | Choose and agree on a pattern, see what it means across a year (overnights, handovers, holidays), and put it into calendars. Before agreement: comparison. After: coordination and records |
| **Current solution** | Court model plans and holiday tables (1–2-week grids, even/odd-year columns) [V]; mediators' tools (OurFamilyWizard's free builder, Custody X Change) [V, rechecked]; Google Calendar, recommended in a county court-services handout [V]; co-parenting platforms, often court-ordered [V]; law-firm calculators and Texas-only generators [V]; free apps (Blended, SplitDay) [V]; Indiana's own official year calendar [V] |
| **Pain** | Platform calendars are widely disliked (39 of OurFamilyWizard's 250 most recent App Store reviews mention the calendar, 48 cost) [V]; AppClose moved from free to $7.99–$8.99 a month in 2026 [V, rechecked] and leaving users named Google or iPhone calendars as replacements [V]; setting up 2-2-5-5 in Google Calendar needs several repeating series, a one-time chore [S/U]; holiday rotations by even/odd year are where every source says the difficulty lies [V] |
| **Competition** | Platforms OurFamilyWizard ($110–$300 a year per parent), TalkingParents ($7–$32 a month), AppClose ($7.99–$8.99 a month), 2houses ($170 a year per family), Custody X Change [V]; OurFamilyWizard's builder free for professionals, with templates, live overnight counts and percentages, and print-ready PDFs [V, rechecked]; free apps; at least 10 custody-calendar apps launched 2025–26 with 0–3 ratings each, and about 32 GitHub projects with no stars [V] |
| **Wedge** | Free, no account, no server, any pattern, dated year view, overnight shares, calendar file, share link, print. Distinctive as a combination on the web; not distinctive feature by feature |
| **Frequency** | Episodic before agreement (once per separation, plus modifications); recurring after agreement, but that job belongs to calendars and platforms |
| **Reachability** | Hard at the moment of need: search for pattern terms is held by co-parenting vendors and law firms [S]; mediators reachable through associations, but they have free incumbent tools; court self-help centers and legal aid are a channel, slow and accuracy-sensitive [U] |
| **Trust barrier** | High: legal stakes, emotional conflict, and an unknown site; professionals need state-correct counts and court-ready output |
| **Expansion pressure** | **Immediate and outside Labs' limits.** After agreement, users ask for live sync between two households and records; documentation is what people pay for [V]. That means accounts, servers, records custody, subpoenas, and safety design |
| **Monetization** | Nobody charges for visualization alone; it's a lead magnet for records, messaging, and legal services [V]. Free for professionals at the market leader |

## Strongest counter-evidence

1. **The market leader gives professionals the same job free**: templates such as 2-2-5-5, live overnight counts and percentages, and print-ready PDFs for mediation or court (free professional account) [V, rechecked]. Custody X Change's professional edition is free for judges and court staff [V].
2. **Parents leaving paid platforms go to general calendars**, not to specialist tools [V].
3. **Courts order specific platforms** for the most conflicted families: an Oregon court form lists eight apps by name; a Missouri form orders exclusive OurFamilyWizard use, including its calendar, until the youngest child turns 18; a Washington appeals court upheld contempt for not using an app's calendar [V].
4. **A nights-only count is weakest where it matters**: Arizona counts blocks of hours (a Thursday-night-to-Monday-school stay is 3.5 days there, 4 nights on the page), Virginia counts 24-hour days, New Jersey defines an overnight as more than 12 hours, Minnesota and Oregon average over two years, and thresholds at 52, 90, 20%, or 40% make one or two nights consequential [V].
5. **Commoditization:** building a custody calendar is easy; getting it used is not [V].

## Product status

Unchanged; no harmful claim. The page's counting rule and its warning that courts and child-support formulas count differently match the sources [V]. Notes for later, with the owner's approval (RISK_AND_COMPLIANCE.md):
- add a "forget this schedule on this device" control (there's none today);
- suggest initials, or allow sharing without names;
- a one-line safety note by the share button (a link can't be taken back);
- "Not legal advice; your court order or parenting plan is what counts";
- narrow "Nothing is sent anywhere" to "Nothing you enter is sent anywhere unless you share a link or calendar file".

## What would reopen this

Mediators or court self-help staff saying, unprompted, that they want a no-login, no-client-data comparison tool they can use in a session or link to, because the incumbents' accounts or data handling get in the way; or organic use by parents in negotiation. Even then, competing would need side-by-side comparison, even/odd-year holiday rules, and careful state context, which raise legal and accuracy stakes.

## Research limits

No search-volume data; the research tool's results for generic queries were mostly spam and don't reflect Google rankings. No Reddit or forum evidence; app reviews skew negative and toward platform users. Indiana's tool and OurFamilyWizard's builder weren't used (accounts and script apps). Some statutes (Illinois, Colorado, North Carolina, South Carolina, Utah) weren't verified; Arizona's 2022 PDF and California's code site blocked access (reputable copies used). No scholarly sources (LibKey unavailable).
