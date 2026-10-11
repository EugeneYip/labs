# Custody Calendar: market notes

Research notes for the Phase 1 validation of #020 Custody Calendar (labs.eugeneyip.net/custody-calendar/). Compiled 2026-10-11. Internal; not for the website. Research only, not legal advice.

**Core question.** Before or outside the paid co-parenting platforms, is there an underserved job where a free, no-account schedule visualizer is valuable enough to become a standalone product? This pass tried to *falsify* that.

**Evidence tags.** Every claim carries a tag and a source ID. The IDs map to the source list at the end, which gives each URL and its date.

- **[V A3]**: VERIFIED. Read on that page, document or data feed on 2026-10-11.
- **[S F6]**: SNIPPET. Seen only in a search-result summary, not confirmed on the page.
- **[U]**: UNVERIFIED. An inference, general knowledge, or not checked.
- **[repo]**: from this repository's code and notes.

Each section separates three kinds of evidence:

- **(O)**: official or published facts, such as statutes, court forms, court guides and government data.
- **(P)**: common practice as described by vendors, professionals and professional publications.
- **(A)**: individual anecdotes, mostly app-store reviews. These are anecdotal, not authority, and skew toward complaints.

**Coverage limits.**

- **Searches.** 22 of the 30 allowed web searches were used. Most evidence came from direct fetches: official pages, vendor pages, Apple's public app search and review feeds, Google Play listings, and GitHub's public search API.
- **Forums.** No Reddit or forum threads surfaced in search, and none were fetched. Nothing tried to get around a block. Anecdotes come from App Store reviews instead.
- **Blocked sites.** Several sites refused automated reading, so the related claims are SNIPPET or UNVERIFIED:
  - the Illinois General Assembly (an explicit automated-access block);
  - the Minnesota courts' handout PDF;
  - OurFamilyWizard's feature and help pages;
  - TalkingParents' help center;
  - Utah's code site (certificate error).
- **Search quality.** The search tool's index is unknown. For generic queries it was dominated by spam pages on hijacked domains. It is not a stand-in for Google rankings, and no search-volume data was available (section 5).
- **Scholarly work.** Not reviewed, because the required LibKey connector isn't available.
- **Sibling notes.** A separate thread's `legal-risk-notes.md` in this folder covers legal, safety and privacy risk in depth. These notes touch legal issues only as market evidence.

---

## 0. Product, for reference [repo]

- **What it does:**
  - Repeating night patterns: alternating weeks, 2-2-3, 2-2-5-5, 3-4-4-3, every other weekend, every other weekend plus Wednesdays, or a custom 1- to 4-week grid.
  - A whole calendar year colored by who has the children each night, with each parent's overnights and share.
  - The next handovers.
  - Tap a night to swap it, with undo.
  - Download an .ics file of every stay.
  - A share link that carries the whole schedule after `#`, so it never reaches the server. The link is a snapshot.
  - The year prints on one page.
- **Counting:** each day counts toward whoever has the children that night. The page says courts and child-support formulas can count differently (`index.tsx`).
- **Not included** (relevant to the findings below):
  - no holiday rules, such as even/odd-year alternation or "holiday beats regular schedule" (holidays are manual taps only);
  - no partial days or hours;
  - no state-specific counting;
  - no side-by-side comparison of candidate schedules;
  - no live sync;
  - no record of time actually exercised (`model.ts`, `index.tsx`).

## Key findings

1. **Official guidance stops at templates, not dated calendars.**
   - Court guides and forms give 1–2-week sample grids and holiday tables with even/odd-year columns [V A1, A12].
   - Mapping those onto real dates is left to parents, apps, or a state tool.
   - One state, Indiana, saw enough need to build its own online year calendar on the court's public portal [V A2, A3, A4]. Its cost isn't stated, but it is presumably free [U].
2. **Overnight counts carry money, with thresholds.** Examples [V A5–A8]:
   - Indiana: credit from 52 overnights;
   - Ohio: 10% off at 90 overnights;
   - Florida: 20% of overnights;
   - Pennsylvania: 40% of overnights.

   But "overnight" is not defined the same way everywhere:
   - New Jersey: more than 12 hours of a 24-hour day [V A11];
   - Virginia: 24-hour days, with a half-day presumption [V A9];
   - Oregon: two-year averages, with hour-block rules [V A10].

   A nights-only count is weakest exactly where it matters most, near a threshold.
3. **The paid platforms' calendars are widely disliked, but courts lock parents in anyway.**
   - Of the 250 most recent US App Store reviews of OurFamilyWizard (OFW), 39 mention the calendar or schedule and 48 mention cost [V C2].
   - A Missouri circuit-court form orders exclusive OFW use, including its Calendar, and annual renewal until the youngest child turns 18 [V A13].
4. **AppClose's 2026 move from free to paid ($7.99–$8.99 a month) displaced a free-calendar user base** [V B9, C2].
   - Reviewers who left said they went to Google Calendar or the iPhone calendar [V C2].
   - That is demand for "free" being met by *general calendars*, not by a new tool.
5. **Free custody-calendar options are already plentiful, just not as no-account web pages:**
   - Google Calendar, recommended in a county family-court handout [V A14];
   - free apps such as Blended (free, no ads), SplitDay (free tier with year view and day/night tallies), Fayr, and KidsFirst [V C1, B19];
   - law-firm calculators and Texas Standard Possession Order (SPO) calendars [V D1, D4];
   - a free 2-2-5-5 spreadsheet from OFW [V B5];
   - Indiana's state tool, on a public court portal (cost not stated) [V A3; U].
6. **For professionals, OFW now gives away the exact job.**
   - The Custody Schedule Builder is free with a professional account.
   - Counts and percentages update live, from templates such as 2-2-3 and week-on/week-off.
   - It exports a print-ready PDF for client meetings or court filings [V B3].
   - Custody X Change's pro edition does similar, free for judges and court staff [V B13].
7. **The niche is crowded with low-traction clones.**
   - At least 10 custody-calendar iOS apps launched in 2025–2026 have 0–3 ratings each [V C1].
   - GitHub has about 32 public "custody calendar" repositories, nearly all with 0 stars, many updated in Aug–Oct 2026 [V D11].
   - Building one is easy; getting used is not.
8. **The money is in documentation and communication, not visualization.**
   - That means court records, messaging and expense logs: OFW, TalkingParents, AppClose, Kidtime premium, Alimentor [V B1, B6, B9, C1].
   - A private, local-only, no-record tool is deliberately outside the willingness-to-pay job.
9. **No free, no-account *web* page was found that combines an arbitrary pattern, a dated year view and overnight shares.** The closest are:
   - OFW's builder (professionals only, account) [V B3];
   - Indiana's tool (Indiana Guidelines only) [V A4];
   - SplitDay and Blended (installed apps) [V C1];
   - paid spreadsheets at $6.50–$7 [V D8, D9].

   That is a gap in *form*, not proof of demand.

---

## 1. Real workflows

### 1.1 Where schedules come from

**(O) Court model plans and statutory defaults.**

- **Arizona.** The Arizona Supreme Court's guide, *Planning for Parenting Time: Arizona's Guide for Parents Living Apart* (form code AOC DRD1H-030217; the code suggests a 2017 revision [U]), sets out 14 numbered plans by child age group [V A1].
  - Each plan has a Sunday-to-Saturday sample grid covering one or two weeks.
  - Plan 13 is called "a 5-2-2-5 schedule".
  - The equal-time plan with no more than two days apart is flagged as only for parents who can agree.
  - It has a "Which Plan Should We Choose?" section, and it says it is not legal advice.
- **Indiana.** Statewide Parenting Time Guidelines; the preamble page shows an effective date of March 1, 2013 [V A2].
  - A law-firm post describes amendments taking effect in 2022 [S F19].
  - The preamble's commentary points to an official online calendar "to assist parents in creating a parenting time schedule", at public.courts.in.gov/PTC [V A2].
  - When announced in January 2018, it produced a 12-month color-coded calendar with holidays, birthdays, statewide school calendars and the Guidelines' minimum parenting time. It was built by the Domestic Relations Committee with the Department of Child Services, and the Department of Education supplied school calendars [V A4].
  - Its index page loaded on 2026-10-11, showing the state's Parenting Time HelpLine and a school-calendar notice [V A3]. The interactive tool itself is a script app that wasn't inspected [U].
- **Texas.** The Standard Possession Order is the default [S F2]:
  - 1st, 3rd and 5th weekends;
  - an optional Thursday;
  - alternating holidays;
  - a summer block.

  Private law firms publish free SPO calendars [S D3]. One, Versus Texas, is an interactive generator: choose the distance between homes, add the school schedule and the child's birthday, then download a PDF, print, or export to iCal. It was published 2024-03-27 and updated 2025-12-28 [V D1].
- **California.** Judicial Council form FL-341(C), Children's Holiday Schedule Attachment (Rev. July 1, 2016), is a table [V A12]:
  - each holiday or school break gets a row;
  - the columns are "every year", "even-numbered years" and "odd-numbered years";
  - there is a times column;
  - it notes that the holiday order has priority over regular parenting time unless ordered otherwise.
- **Self-help and legal-aid builders** (these produce forms, not visual calendars, as far as seen):
  - Oregon's Guide & File parenting plan interview (free accounts; launched 2017 per a 2018 presentation) [S A21];
  - Illinois Legal Aid Online's parenting plan interview, which produces completed court forms [S A19];
  - Maryland's Parenting Plan Tool form, CC-DR-109 [S A20].

**(P) Templates and content from vendors, law firms and marketers.**

- OFW's 2-2-5-5 article offers a free downloadable spreadsheet template for mapping obligations and trying different exchange days. It was published 2018-09-24 and updated 2025-03-11 [V B5].
- Custody X Change's pattern pages show sample calendar images and send readers to its paid builder [V B12].
- BACtrack, an alcohol-monitoring company, publishes an attorney-bylined 2-2-5-5 article with a free sample-clause template, used as a lead magnet for court-admissible breath testing; updated 2025-11-30 [V D7].
- Law firms publish pattern explainers, for example Bryan Fagan (Texas), Farzad Law, Kuffer Law and Hodgson Law [S F6, F7, F13].

**(P) Professionals.**

- A 2014 mediation-blog post (Ireland/England) describes moving from flip-chart calculations to Custody X Change. The software shows color-coded calendars, handover times and drafts, and saves to PDF, email, print or phone calendars [V E2].
- OFW's Custody Schedule Builder (2026) is pitched for showing schedules to co-parents in mediation and in court [V B3].

**(A) Parents.** One Our Days reviewer credits the app with making the custody-schedule negotiation in their divorce easy (5★, 2026-03-14) [V C3]. That is pre-agreement use.

### 1.2 How holidays are handled

**(O) Published rules.**

- **Holidays override the regular rotation.** The Arizona guide says the holiday, vacation and school-break schedule takes priority over regular parenting time [V A1]. California's FL-341(C) says the same unless ordered otherwise [V A12].
- **Alternation by year parity.**
  - California's form uses even/odd-year columns [V A12].
  - The Arizona guide lists typical holidays and suggests dividing some and alternating others; it notes Mother's/Father's Day often go to the matching parent every year.
  - For vacation choice, it gives an even/odd-year "first pick" example with April deadlines [V A1].
- **Generated holidays.** Indiana's tool generates Guidelines holidays onto the calendar [V A4].

**(P) Tools.**

- Kidtime premium carries holidays and traditions that alternate by year forward automatically [V C1].
- Custody X Change has premade holiday schedules [V B11]. OFW's article mentions a holiday scheduler [V B5].
- With general calendars, holidays are typically added as manual one-off events [S F11].
- A 2026 developer blog post's title says every co-parenting app fails at the holiday rotation problem [S E3]. Only the title was seen; the page returned 404.

**(A) Holiday overrides are fiddly.** A Blended reviewer couldn't save a holiday override because a button was off screen (3★, 2026-01-23) [V C3].

**Implication [U].** The product's manual tap-to-swap covers trips but not the rules that official holiday tables are written in. Even/odd-year holiday rules are where every source says the difficulty lies.

### 1.3 How overnights are counted, and why

**Why (O).** Many child-support guidelines adjust support by the share of parenting time, often keyed to annual overnights with thresholds. That turns a count of nights into money, and into conflict.

| Jurisdiction | Rule (paraphrased) | Source |
|---|---|---|
| Indiana | The Parenting Time Credit table begins at 52 overnights a year (roughly alternate weekends). An overnight needn't be 24 hours but must include care such as feeding, transport and schoolwork. Providing only a place to sleep, to get the credit, is prohibited. Guideline 6, effective 2024-01-01. | [V A5] |
| Ohio | When ordered parenting time is 90 or more overnights a year, the obligor's support is cut by 10%. The cut can be removed if time isn't exercised without just cause. ORC 3119.051, effective 2019-03-28. | [V A6] |
| Pennsylvania | A rebuttable presumption of reduction when the child spends 40% or more of annual overnights with the obligor (146 nights is my arithmetic [U]). The worksheet divides overnights by 365. Pa.R.C.P. 1910.16-4(c), amended 2025-08-11, effective 2026-01-01. | [V A7] |
| Florida | "Substantial" time-sharing means at least 20% of the year's overnights (about 73 [U]). Support is grossed up ×1.5 and cross-multiplied by each parent's overnight percentage. Fla. Stat. 61.30(11)(b) (2025). | [V A8] |
| Virginia | The shared-custody formula applies above 90 days a year. A "day" is 24 hours, with a half-day presumption when the parent with fewer overnights has an overnight shorter than 24 hours. Va. Code 20-108.2(G)(3). | [V A9] |
| Oregon | The parenting-time credit is computed from overnights/365 by formula, averaged over two consecutive years. Schedules without overnights can count 12 continuous hours as a day and 4–12 hours as a half day. OAR 137-050-0730 (read on an unofficial reproduction). | [V A10] |
| New Jersey | The Guidelines define an overnight as the majority of a 24-hour day (more than 12 hours), not where the child sleeps. A trial judge who counted where the child slept was reversed as an abuse of discretion. *Collette v. Welsh*, App. Div. 2019-03-28, unpublished and non-precedential. | [V A11] |

Others were seen only in snippets or are unverified:

- Illinois: 146 overnights for shared physical care. The official site blocked automated access [U A18].
- Colorado: more than 92 overnights [S F13].
- North Carolina: 123 [S F13].
- South Carolina: more than 109 [S F13].
- Maryland: 128 overnights or 35%, per a calculator site [S D5].
- Wisconsin: 25% shared-placement presumption, as described by a law-firm calculator page [V D4].

**Practice (P).**

- The Minnesota courts' self-help centers publish a handout on calculating the number of overnights. Per the snippet, it counts the regular schedule over two years (730 nights) after first removing special overnights [S A15]. Self-help staff evidently field this question.
- Law-firm calculators compute overnight totals and check state thresholds [V D4].

**Implication [U].** "Nights with whoever has the children that night" matches some definitions but not New Jersey's (more than 12 hours), Virginia's (24-hour days, half-day presumption) or Oregon's (two-year average, hour blocks). The cases where the count matters (60/40 to 50/50 disputes, schedules near 52, 90, 92, 146) are where a simple count is least safe. The page's existing caveat is necessary but may not be sufficient for professional use. `legal-risk-notes.md` covers more.

### 1.4 How schedules are shared and communicated

**(O) Orders and forms describe schedules in words and tables, not calendars.**

- California FL-341(C) is a table [V A12]. Arizona's guide has 1–2-week grids [V A1].
- A Missouri circuit court's standard "Order Regarding Parent Communications" makes OFW the channel [V A13]:
  - each parent must enroll within 48 hours;
  - all communication must go through OFW, not email, text or phone;
  - the Message Board is used only when the Calendar, Expense Log and other features can't carry the information;
  - parents must check in at least every 24 hours;
  - subscriptions must be renewed until the youngest child turns 18;
  - OFW records are received into evidence without further foundation absent objection.

**(P) Professionals exchange PDFs and printouts.**

- OFW's builder offers one-click print-ready PDFs for client meetings or court filings [V B3].
- Custody X Change produces "court-ready" reports and printouts [V B13].
- LEAP's Parenting Calendar+ (Australia, for law firms) exports PDF calendars and shares to Outlook/iCal [V B20].
- The 2014 mediator post describes PDFs, email, print and phone-calendar export [V E2].

**(P) Parents use platform calendars or general calendars.**

- A Multnomah County (Oregon) Family Resolution Services handout lists co-parenting apps alongside Google Calendar. It describes Google Calendar as a simple way to coordinate (share a calendar with edit rights; repeating events; reminders) and makes no recommendation [V A14].
- A 2018 ABA *Family Advocate* article calls OFW and Google Calendar the two most-cited programs for parenting schedules. OFW cost about $99 a year per parent then [V E1].

**(A) Parents fall back on plain tools.** Reviewers describe reverting to text messages and calendar invites, switching to the iPhone calendar, or planning to share a Google Calendar (OFW 2★ 2026-01-24; AppClose 1★ 2026-06-20 and 2026-01-14) [V C2].

### 1.5 Mediators, parenting coordinators, attorneys and paralegals

**OurFamilyWizard Custody Schedule Builder.**

- Free for family-law professionals with a free professional account [V B3].
- Starts from templates (2-2-3, week-on/week-off, alternating weeks).
- Updates overnight counts and parenting-time percentages live, with a day-by-day preview.
- Exports a print-ready PDF.
- The help center names attorneys, mediators, parenting coordinators and guardians ad litem as users, and says the tool is in beta [S B4, F12].

**Custody X Change pro.**

- "Thousands" of lawyers, mediators and judges have used it [V B13]. Pros make multiple drafts for client review.
- It calculates scheduled time including holidays and one-time changes, and can skip school time.
- It has over 140 plan provisions.
- Pricing:
  - 50% off for additional subscribers in an office and for legal-aid workers;
  - free for judges and court staff;
  - a free one-year subscription for clients.

**Other professional tools.**

- LEAP Parenting Calendar+ is included in the LEAP practice-management subscription in Australia [V B20]. Its page does not mention night counts.
- Victoria AI for divorce mediators includes timeshare templates and holiday scheduling. Per the snippet it costs $297 a month with a 7-day trial; the page returned 410 when fetched [S B21, F9].

**Parenting coordinators** appear in the Missouri order's "Professional Access" list, alongside the judge, guardian ad litem and therapist [V A13]. How often they handle calendar disputes was not researched [gap].

**Paralegals and attorney exhibit workflows:** no direct evidence found [gap]. California support software such as DissoMaster was not checked [U].

### 1.6 Parents already on formal co-parenting apps

- The platform calendar becomes the official record when a court order requires it [V A13].
- Platforms implement custody patterns differently:
  - TalkingParents: repeating events, help guides for 50/50, 60/40 and 70/30, and Google sync via "Personal Calendar Connect" [V B7];
  - AppClose: 15 pre-built templates or custom, plus a separate schedule per child [V B9].
- Per a support-article snippet, TalkingParents users build 2-2-5-5 from four recurring series [S B8].

---

## 2. Pain

### 2.1 Review sample: the three big platforms (US App Store, 250 most recent each) [V C2]

| App | Review window | 1–2★ share | Calendar or schedule | Court order or mandate | Cost | Mentions external calendars or sync* |
|---|---|---|---|---|---|---|
| OurFamilyWizard | 2025-11-30 to 2026-10-09 | 56% | 39 | 23 | 48 | 29 (8 explicitly about sync or integration) |
| TalkingParents | 2024-01-29 to 2026-10-09 | 80% | 14 | 29 | 83 | 14 |
| AppClose | 2025-08-12 to 2026-10-09 | 84% | 22 | 48 | 79 | 20 |

\*A broad keyword count; not every mention is a complaint.

Notes on the sample:

- Recent reviews are far more negative than the apps' lifetime averages (4.38–4.74★ [V C1]). Read these as a complaint inventory, not prevalence.
- How fast 250 reviews accumulated is a rough activity proxy: about 10 months for OFW, about 14 for AppClose, about 32 for TalkingParents [U].

**Calendar complaints (A).**

- OFW's calendar is described as hard to navigate, buggy (entries not saving or showing, a date offset), and not built for non-traditional schedules.
- One reviewer said its clunkiness led to suspicion of malicious intent between co-parents (1★, 2026-01-30).
- TalkingParents' calendar is called outdated or "terrible"; one long-time user cited it when refusing a price increase (2★, 2026-06-05).
- AppClose's calendar reportedly breaks on schedules that don't fit its boxes (1★, 2026-02-27) [V C2].

**Cost and lock-in (A).**

- "Court-ordered" is a recurring theme: people pay because they must.
- Complaints about annual-only billing, refusals to refund, both parents having to pay, and parents being unable to respond to entries without paying [V C2].

**Account friction (A).** OFW wouldn't let a parent explore the app without first inviting the co-parent (3★, 2026-02-11) [V C2].

### 2.2 AppClose's paywall (2026)

- AppClose now sells one plan at $7.99 a month on the web or $8.99 in the app, with a 60-day trial [V B9].
- It says it has issued over 26,450 free accounts (fee waivers) since 2026-01-01 [V B9].
- Reviews from January 2026 on describe the switch from free to paid [V C2]. Themes:
  - "zero free features left," even the calendar;
  - "bait and switch," since courts mandated it because it was free;
  - leaving for Google Calendar or the iPhone calendar.
- Taken together, a sizeable free user base for "calendar plus messaging" lost its free option this year [U]. This is the strongest *supporting* signal for a free alternative. But the stated exits are general calendars [V C2].

### 2.3 Setting up recurring custody events in general calendars

- Google Calendar's help documents repeating events and a limit of 730 occurrences per series [V B16].
- Common two-week patterns can be expressed with custom "every 2 weeks" series, but need several series per parent:
  - per the support-article snippet, TalkingParents' guide builds 2-2-5-5 from four series [S B8];
  - by my arithmetic a 2-2-3 needs six [U].
- Holidays must then be layered on as one-offs [S F11].
- This is real friction, but a one-time setup. After that, a shared Google Calendar meets most "who has them on date X" needs [U].

### 2.4 Computing overnight percentages

- Arithmetic quirks:
  - a 14-day rotation can't divide 365 evenly, so 50/50 yields 183/182 [U arithmetic, also S F8];
  - holidays shift the split.
- (A) A Kidtime reviewer says the app gave inaccurate percentages and changed colors so the ex appeared to have more time (2★, 2026-01-01) [V C3].
- (A) Alimentor reviewers value percentages and totals for court (5★, 2024–2026) [V C3].
- (P) A mediator warns that exact percentages can shift attention from quality to quantity and push rigid equal-time goals [V E2].
- (O) Counting definitions differ by state (section 1.3).

### 2.5 Holiday rotations

See section 1.2. Official orders use even/odd-year tables [V A12]. Apps either automate them as a paid feature [V C1] or leave them manual [S F11].

### 2.6 Keeping two households' calendars in sync

- (A) The most specific OFW request is automatic push to iCal, Outlook or Google, and two-way integration with native calendars (2★ 2026-03-05; 3★ 2026-02-18; 3★ 2026-01-02) [V C2].
- (A) A Kidtime reviewer paid to see future months, but the co-parent couldn't see them (2★, 2026-05-21) [V C3].
- (P) Newer apps lead with real-time sync for both parents: Blended, Child Custody Calendar, SplitDay, Our Days [V C1].
- **Implication [U].** After agreement, the job users describe is *ongoing shared state*. A static snapshot link plus a one-time .ics import does not do that. The product page itself says later changes don't reach a shared link [repo].

### 2.7 Conflict

- Documentation-first products are built around the "your word against theirs" problem: Kidtime, Alimentor, CustodyLog [V C1].
- (A) Court-ordered communication via a platform is valued by some parents as protection from harassment (OFW 5★, 2025-12-03) [V C2].
- Conflict creates willingness to pay for *records*, which a private local page explicitly doesn't produce [U].

---

## 3. Competitors and alternatives

### 3.1 Paid co-parenting platforms

| Product | Price (as listed 2026-10-11) | Per | Account | Calendar notes | Adoption signals |
|---|---|---|---|---|---|
| OurFamilyWizard | Four annual tiers [V B1]:<br>• basic $110/yr (from $9.17/mo)<br>• Essentials $149.99/yr<br>• Premium $216/yr<br>• Max $299.88/yr<br>Two-year options; 30-day refund (platform rules vary); fee waivers, military discount; free professional access. | Each parent has their own subscription (one can pay for the other) | Yes; one parent couldn't enter without inviting the co-parent [V C2] | Shared schedule, change requests, holiday scheduler [V B5]; Event Import in Premium [V B1]. Sync to personal calendars is a frequent complaint [V C2]. | iOS 55,476 ratings, 4.59★ [V C1]; Play 500K+ downloads [V C4]; "hundreds" of judges in all 50 states ordering it [V B2]; Missouri order form [V A13] |
| TalkingParents | Essentials $7/mo, Enhanced $16/mo, Ultimate $32/mo; annual saves 8%. A paid subscription is required to use the app; fee waivers for hardship or domestic-violence survivors. [V B6] | Parents can be on different plans | Yes | Shared calendar on all plans; repeating events; Google sync [V B7] | iOS 28,750 ratings, 4.38★ [V C1]; Play 100K+, 2.2★ [V C4] |
| AppClose | One plan: $7.99/mo web, $8.99/mo in app; 60-day trial; fee waivers. Formerly free. [V B9] | Per parent (reviews say third parties must pay too [V C2]) | Yes | 15 templates or custom; per-child schedules; swap requests; record exports [V B9] | Claims 2M+ parents and professionals and 3.1M downloads since 2016, and court orders in every US county "per user-supplied data" [V B9]; iOS 39,375 ratings, 4.74★ [V C1]; Play 1M+ [V C4] |
| 2houses | $169.99/yr or $14.17/mo; 14-day trial [V B10] | Per family (one subscription covers both parents and mediators) | Yes | Shared schedule with sync; no detail on the page [V B10] | iOS 144 ratings, 3.98★ [V C1]; Play 100K+ [V C4] |
| Custody X Change | "From $6/month (billed annually)" [V B11]. Third-party listings conflict, e.g. $99–$199 a year, or pro tiers $19.97–$39.97 a month [S B14]. | Parent plans; pro edition | Implied | Pattern builder, parenting-time calculations, premade holidays, parenting-plan template, Google sync [V B11, B13] | "Thousands" of professionals [V B13]; no iOS app found in Apple search [V C1]; one 2026 reviewer says it had no app [V C3] |

### 3.2 General calendars

- **Google Calendar:**
  - free;
  - repeating events, sharing with edit rights, 730-occurrence limit [V B16];
  - recommended in a county family-court services handout [V A14];
  - named in 2018 by an ABA article as one of the two most-cited co-parenting scheduling tools [V E1].

  It needs a Google account [V A14].
- **Apple Calendar:** recurrence was not checked [U].
- **Cozi:**
  - free, ad-supported (implied);
  - Gold for $39, with the period not stated on the page [V B15];
  - iOS 400,745 ratings [V C1];
  - no custody features described [V B15].
- **TimeTree** (92,491 iOS ratings) and **FamilyWall** (24,136) [V C1].

These are the default substitute. Parents who leave paid apps name them [V C2].

### 3.3 Custody-specific apps (iOS data 2026-10-11 [V C1]; reviews [V C3])

| App | Price model | What's relevant | Ratings |
|---|---|---|---|
| Blended: Co-Parent Calendar | Free, no ads, no subscription | All common patterns (week-on/off, 2-2-3, 5-2-2-5, 3-4-4-3, every other weekend…); an AI parser builds the year from pasted plan text; real-time sync. Reviews report layout bugs (missing Saturdays, off-screen buttons) and one couldn't make 2-5-2-5. | 23 (3.30★); launched 2025-08 |
| SplitDay | Free plus Pro | Day, week, month and year views; "scoreboard" days per parent, counting day and night custody separately; printable calendars; free CSV export; Pro adds cloud backup and expense PDFs | 1; launched 2026-03 |
| Kidtime | Free shows the current month only; premium | Premium adds the full calendar, overnight analytics (scheduled vs actual), holidays alternating by year, and court-ready PDFs | iOS 446 (4.29★); Play 5K+, 2.2★ [V C4] |
| Our Days | Free trial, then subscription (per reviews) | Patterns, swaps, Google Calendar integration, web access; reviewers mention a yearly subscription | iOS 157 (4.64★); Play 10K+ [V C4] |
| Fayr | Free | Custody calendar, parenting-time tracking "to the minute", iCal sync, reports | 284 (3.99★) |
| Alimentor 2 | $6.99 one-time | Totals of parenting hours, overnights and timeshare %; plan vs actual; court reports; publishes to external calendars; single-parent use | 1,318 (4.85★) |
| CoNest ("Custody Calendar: Co-Parenting") | Weekly or annual subscription, or lifetime | No account and no own server (iCloud sync); one purchase covers both parents | 0; launched 2026-07 |
| Child Custody Calendar | $0.99 | Patterns, auto-generated calendar, real-time sync, trades | 2 |
| CustodyLog | $9.99/mo or $79.99/yr | Documentation of violations | 29 |
| KidsFirst (Australia) | Free, not-for-profit | Messaging with an AI conflict filter, calendar, expenses [V B19] | not checked |
| Qustody (web) | Free sign-up; pricing page not read | Hour-based care tracking, reports up to a full year; account required [V B18] | n/a |

Other 2025–2026 entrants have 0–3 ratings each: SharedKid, Parendar, Custody Calendar Co Parent App, CustodySync, Duet, Kopare, Custody Hero, Hando, SoloFamily, SafeTalk [V C1].

### 3.4 Free web tools, templates and law-firm tools

**Calendars and calculators:**

- **Versus Texas SPO calendar:** free and interactive, for Texas SPO only; PDF, print, iCal [V D1]. Also standardpossession.com, "2026 Standard Possession Calendar for Texas" (title only seen) [V D2], and Bryan Fagan's free 2025–2026 calendars [S D3].
- **O'Flaherty Law Wisconsin calculator:** free, no contact details required. Inputs are a start and end date, typical weekly overnights per parent, plus holiday, vacation and extra nights. Outputs are overnight totals and a ≥25% shared-placement check. No calendar visualization [V D4].
- **EveryCalculators Maryland custody calculator:** per the snippet, overnight counts, percentages and support effects [S D5].
- **223custody.net:** "2-2-3 Calendar — Do I Have My Kids That Day?" (title only seen) [V D10].

**Templates:**

- OFW's free 2-2-5-5 spreadsheet [V B5].
- BACtrack's sample clauses [V D7].
- Templacity:
  - free cost tracker;
  - $22 "Co-Parent Tracker" with a custody overnight tracker;
  - a 50/50 schedule template (price not shown); updated 2026-10-07 [V D6].
- Payhip spreadsheets by TikTak Templates, with no reviews or sales shown:
  - $6.50 "Co-Parenting Calendar Spreadsheet": monthly or full-year view, day shares per parent, patterns including 2-2-5-5 [V D9];
  - $7.00 "Custody Rotation Schedule Spreadsheet": 12-month grid, monthly totals and percentages [V D8].
- Etsy and Pinterest were not checked; results were spam [S F21].

### 3.5 Court-provided tools

- **Indiana Parenting Time Calendar:** official, on the court's public portal; a 12-month calendar under the Indiana Guidelines [V A2, A3, A4]. Cost isn't stated; presumably free [U]. The closest public-sector analogue to this product.
- **Interview-style plan builders:** Oregon Guide & File [S A21], Illinois Legal Aid Online [S A19], Maryland's CC-DR-109 [S A20]. These produce forms, not year calendars, as far as seen.
- **Child-support guidelines and worksheets:** these take overnights as an *input* (for example, Pennsylvania's worksheet line 25a divides overnights by 365) [V A7]. Official guides stop at sample grids [V A1].

### 3.6 Tools professionals use

- OFW Custody Schedule Builder (free for professionals) [V B3].
- Custody X Change pro [V B13].
- LEAP Parenting Calendar+ (Australia; bundled) [V B20].
- Victoria AI ($297 a month, per the snippet) [S B21].

Professionals already have free or bundled tools that do the visualization and percentage job and produce PDFs.

### 3.7 Is there a free tool that already visualizes a year and computes overnight shares?

- **Yes, gated:** OFW's builder, free but for professionals only, with an account. It does live counts and percentages and exports PDFs. A year view isn't stated on the visible page [V B3].
- **Yes, as installed apps:**
  - SplitDay: free tier, year view, day and night tallies [V C1];
  - Kidtime: analytics are paid [V C1];
  - Blended: free year generation; percentages not mentioned [V C1].
- **Yes, for one state:** Indiana's official calendar. Whether it shows percentages is unknown [V A4; U].
- **Not found:** a free, no-account *web page* that takes an arbitrary pattern and shows a dated year with overnight shares, a calendar file and a share link. The nearest are paid spreadsheets [V D8, D9] and Texas-only generators [V D1].

### 3.8 Commoditization signals

- **GitHub** (public search API, 2026-10-11) [V D11]:
  - "custody calendar": 32 repositories;
  - "co-parenting calendar": 14;
  - nearly all have 0 stars, and many were updated Aug–Oct 2026;
  - examples include a "parenting-plan-builder" with live calendar, overnight math and holidays, and a "private local-first co-parenting" toolkit.
- **App Store:** at least 10 single-purpose custody-calendar apps launched 2025–2026 with 0–3 ratings [V C1].
- **Interpretation [U].** Building the visualizer is cheap and increasingly common. Traction is the scarce part.

---

## 4. Counter-evidence (searched as hard as support)

1. **Free tools already solve most of the job.**
   - Google Calendar, recommended by court services [V A14; E1].
   - Free apps: Blended, SplitDay's free tier, Fayr, KidsFirst [V C1, B19].
   - A state-run year calendar in Indiana [V A3].
   - Texas SPO generators [V D1] and law-firm calculators [V D4].
   - Vendors' free templates [V B5].
   - Professionals: OFW's free builder [V B3].
2. **General calendars are sufficient for many.** Parents leaving AppClose and OFW name Google or iPhone calendars as the replacement, not a specialized tool [V C2]. Setup friction is one-time [U].
3. **Professionals have their own bundled or free tools.** OFW's builder, Custody X Change pro (free for judges and court staff), LEAP in Australia [V B3, B13, B20]. They also have reasons to steer clients into the platform, since OFW gives professionals free access [V B1].
4. **Users need live sync, which a static page can't provide.**
   - Sync and native-calendar integration are the most specific feature requests in OFW reviews [V C2].
   - New apps lead with real-time sync [V C1].
   - Labs' hard limits rule out the accounts or servers live sync would need [repo].
5. **Legal-accuracy risk.** Overnight definitions differ: New Jersey more than 12 hours, Virginia 24-hour days with half days, Oregon two-year averages and hour blocks, Indiana requiring actual care [V A11, A9, A10, A5]. A mediator cautions against percentage focus [V E2]. Official guides carry strong disclaimers [V A1].
6. **Courts order specific platforms, so parents use them regardless of price.**
   - The Missouri form mandates OFW including its calendar, renewal until 18, and evidentiary use [V A13].
   - OFW claims judges order it in all 50 states [V B2]. AppClose claims court orders in every county (user-reported) [V B9].
   - "Court-ordered" recurs in reviews [V C2].
7. **Low job frequency for the pre-agreement use.** It happens once per separation, plus occasional modifications [U]. Reviews show ongoing use is about coordination and records, not visualization [V C2, C3].
8. **The money is elsewhere.** Paid products monetize records, communication and expenses [V B1, B6, B9, C1]. Free visualization is used as a lead magnet by vendors, law firms and even an alcohol-monitoring company [V B5, D1, D4, D7].
9. **The market is crowded and traction is low.** Dozens of near-identical custody calendar projects and apps have negligible adoption [V C1, D11].

**What survived falsification (supporting evidence).**

- Paid calendars are widely criticized and the AppClose paywall displaced users [V C2, B9].
- Official guidance gives templates and tables, not dated calendars [V A1, A12].
- Indiana's investment shows a public-sector view that parents need a year calendar [V A4].
- Thresholds make counts consequential [V A5–A8].
- Privacy and "no account" are used as selling points by CoNest and Blended [V C1].
- One parent wanted a private tracker without sharing with the co-parent (Kidtime 1★, 2026-01-01) [V C3].
- Generic-query search results are low quality, which may leave room for a good free tool to rank [S F3, F5, F20; U].

---

## 5. Search demand signals (no paid tools)

The search tool's index is unknown. These observations show who appears, not volumes or Google rank.

| Query | Who appeared | Free tool in results? |
|---|---|---|
| "custody calendar maker free" | 9/9 spam or scraped pages on hijacked domains (cTrader, Loughborough, DHIS2, Randstad, etc.); the summary named OFW, Custody X Change, Qustody and Timtab [S F3] | No |
| "custody calendar" | 9/9 spam or scraped pages (Alpine Linux, Mozilla-lookalike, London Councils subdomains, etc.) [S F20] | No |
| "custody schedule template" | Spam on university and corporate subdomains (Manchester museum, Wharton, Valparaiso test, Cornell dev) [S F5] | No |
| "2-2-5-5 custody schedule" | OFW blog (two URLs), BACtrack (two URLs), 2houses, Bryan Fagan (Texas law firm), Custody X Change [S F6] | Templates only (OFW, BACtrack) |
| "50/50 custody schedule calendar" | Bryan Fagan (two 2026 articles), 2houses, Farzad Law, Templacity, plus spam [S F7] | Paid or free templates only |
| "overnight percentage custody calculator" | O'Flaherty Law (Wisconsin calculator), EveryCalculators (Maryland), plus spam [S F4] | Yes: law-firm and calculator sites, no year view |
| Long-tail "free … calculator … 2-2-3 2-2-5-5" | Law firms, OFW, Custody X Change, BACtrack PDFs; Minnesota courts' overnight handout; Oregon rule [S F8] | Official handout (manual method) |
| "Texas … standard possession order calendar 2026" | Bryan Fagan, Versus Texas, gbfamilylaw, Texas AG sticker calendar PDF [S F2] | Yes: Texas SPO generators |

Reading [U]:

- Pattern-specific queries are served by co-parenting vendors' content and law-firm lead-generation, which suggests these queries have commercial value to them.
- Generic "maker/template/calendar" queries are flooded with spam in this index.
- No free, no-account, any-pattern web visualizer surfaced in any query.
- Volume is unknown (Google Trends and keyword tools were unavailable).

---

## 6. Beachhead candidates: evidence by segment

| Segment | Frequency of the job | Reachability | Trust barriers | Competition for this job | Fit with a free, no-account visualizer |
|---|---|---|---|---|---|
| **Pre-agreement or modification comparers** (parents choosing between 2-2-3, 2-2-5-5, every other weekend + midweek; often self-represented) | Episodic: once per separation, plus modifications [U]. The population is large: about 1 in 4 children under 21 lived with one parent with the other outside the home in 2022 [V A16]. | Search, but results are dominated by vendors and law firms [S F6, F7]; also court self-help and legal-aid pages [V A14] | Accuracy of counts against state rules [V A5–A11]; disclaimers [V A1] | Custody X Change (paid) [V B11]; apps [V C1]; law-firm calculators [V D4]; OFW builder via their mediator [V B3] | **Best match of the parent segments.** Parents aren't cooperating yet, so privacy and no account matter, and no court has ordered a platform yet. But the product lacks comparison, holiday rules and threshold context. |
| **Post-agreement planners** (living with an agreed schedule) | Recurring (holidays, next handover) [U] | Hard; they are already inside Google Calendar or a platform [V C2] | Low | Google Calendar (free), platform calendars (often court-ordered), many free apps [V A14, A13, C1] | **Weak.** The job users describe is live shared state and records [V C2]; a snapshot link and .ics don't meet it [repo]. |
| **Mediators** | High per professional (several families a week) [U] | Moderate: professional associations and court rosters [U] | Professional liability; state-specific counting; need PDFs and multiple scenarios [V B3, B13] | OFW builder (free) [V B3], Custody X Change pro [V B13], practice software [S B21] | **Plausible but contested.** An in-session, no-login demo that stores no client data is a differentiator [U], against a free incumbent tool. |
| **Parenting coordinators** | High-conflict cases only [U] | Narrow | They need records and audit trails | Platforms named in orders [V A13] | **Poor.** Records matter more than visualization. |
| **Family-law attorneys and paralegals** | Moderate | Moderate | Court-ready output, case storage | Custody X Change pro [V B13], OFW builder [V B3], LEAP (Australia) [V B20] | **Poor.** Bundled tools exist. |
| **Court self-help centers and legal aid** | High (repeated questions) [S A15] | Institutional, slow; they publish handouts and links [V A14] | Endorsement rules ("make no recommendations" [V A14]); accuracy | Their own guides and tools (Indiana built one) [V A2, A4] | **Interesting channel, not a user base.** A free, non-commercial, no-data tool is easier to link to [U], but they need state-correct counting. |

---

## 7. Monetization norms (research only)

- **Per-parent subscriptions dominate the platforms:**
  - OFW $110–$299.88 a year per parent [V B1];
  - TalkingParents $7–$32 a month [V B6];
  - AppClose $7.99–$8.99 a month [V B9].
- **Per-family pricing:** 2houses, $169.99 a year [V B10].
- **Ads plus premium:** Cozi Gold, $39 [V B15].
- **One-time purchases:** Alimentor 2 ($6.99), Child Custody Calendar ($0.99), CoNest's lifetime option [V C1].
- **Freemium with the analytics or history paywalled:** Kidtime (overnight analytics, future months, holiday rotation and court PDFs are premium) [V C1].
- **Documentation subscriptions:** CustodyLog, $9.99 a month or $79.99 a year [V C1].
- **Professional channel:**
  - OFW professional accounts free [V B1, B3];
  - Custody X Change free for judges and court staff, 50% off for legal aid, clients get a free year [V B13];
  - mediator practice software about $297 a month [S B21];
  - bundled into practice management (LEAP, Australia) [V B20].
- **Fee waivers are standard:** OFW, TalkingParents, AppClose (26,450+ free accounts since 2026-01-01) [V B1, B6, B9].
- **Templates:** Templacity $22, Payhip $6.50–$7 [V D6, D8, D9]. Free templates serve as lead magnets for OFW and BACtrack [V B5, D7].
- **Law-firm lead generation:** free calculators and calendars with consultation calls to action [V D1, D4].
- **Court orders as recurring revenue:** the Missouri form requires annual OFW renewal until the youngest child turns 18 [V A13].
- **Not-for-profit or credits-funded free apps exist:** KidsFirst (AWS startup program) [V B19].
- **Takeaway [U].** Nobody visible charges for visualization alone. It is given away to acquire users for records, communication or legal services.

---

## Falsification summary (strongest reasons the opportunity may not exist)

1. **The job is already served free, in the forms people actually use.**
   - Google Calendar, recommended by court services [V A14].
   - Free apps with patterns and year views: Blended, SplitDay [V C1].
   - Professionals get OFW's free builder with live percentages and PDFs [V B3].
   - Indiana runs its own official year calendar [V A3, A4].
   - Being free and having no account is not a differentiator users ask for; displaced AppClose users went to general calendars [V C2].
2. **After agreement, the real job is live coordination plus records, which needs accounts and servers.** Sync and integration are the most specific requests [V C2]. Documentation is what people pay for [V B1, B6, C1]. A static snapshot page is structurally outside that job [repo].
3. **Courts route conflicted families into specific platforms,** including their calendars, for years [V A13, B2, B9]. That removes the population with the most pain from a free tool's reach.
4. **The before-agreement job is episodic and contested.** It happens about once per family [U]. Mediators, often the people running the comparison, have free incumbent tools [V B3, B13]. Search visibility is held by vendors and law firms [S F6, F7].
5. **A nights-only count is risky exactly where people care.** State definitions diverge (New Jersey, Virginia, Oregon, Indiana) [V A5, A9–A11], and thresholds (52, 90, 20%, 40%) make small errors consequential [V A5–A8].
6. **Commoditization.** Dozens of similar apps and repositories launched in 2025–2026 with negligible traction [V C1, D11]. Building is not the bottleneck; distribution and trust are.

## Beachhead assessment

- **No segment shows strong evidence** of an underserved, frequent job that a free, no-account visualizer wins on its own.
- **Least falsified: pre-agreement and modification comparison.** That is a parent (often self-represented) or a mediator choosing among two or three candidate schedules before any platform is ordered.
  - *For:* the parents aren't cooperating yet, so privacy and no account matter. No court has mandated a platform. Official materials stop at 2-week grids and holiday tables [V A1, A12]. Overnight thresholds give the comparison financial stakes [V A5–A8].
  - *Against:* it is episodic [U]. The professionals in the room have OFW's free builder [V B3]. Accuracy depends on state counting rules [V A9–A11].
  - *What it would need to beat incumbents* [U]:
    - side-by-side comparison of candidate schedules on real dates;
    - holiday tables with even/odd years and precedence;
    - a state-threshold note;
    - a clean printable exhibit.

  Without these it is one more free calendar among many.
- **Second, as a channel rather than a user base: court self-help centers and legal aid.** They field the counting question [S A15], publish handouts [V A14], and one state built its own tool [V A4]. A non-commercial, no-data page is easier for them to link to [U]. But adoption would be slow and would need state-correct counting.
- **Post-agreement planners and parenting coordinators look like poor beachheads.** Their job is live sync and records [V C2, A13].
- **Bottom line for the core question:** the evidence leans toward *falsified* as a standalone product. It is consistent with a useful free utility for the pre-agreement moment, which would need interviews (mediators, self-help staff, parents in negotiation) to confirm frequency.

## Gaps

- **No search-volume data** (no keyword tools; Google Trends not accessible). The search tool's results don't represent Google rankings.
- **No forum evidence** (no Reddit or forum threads surfaced). App-store reviews skew negative and toward platform users, not pre-agreement parents.
- **No interviews** with mediators, parenting coordinators, self-help staff, paralegals or parents. Frequency estimates per segment are unverified.
- **Not inspected on the live site:**
  - Indiana's tool, including whether it shows percentages or supports 50/50 patterns [U];
  - OFW builder details beyond the landing page (holidays, year view, beta status are SNIPPET) [S B4].
- **Custody X Change plan prices** are unverified; third-party figures conflict [S B14].
- **Statutes not verified:** Illinois (146 overnights), Colorado (92 or more), North Carolina, South Carolina, Utah's statutory schedules, California's mandatory mediation statute (blocked or not fetched).
- **Not researched:** the parenting coordinators' role in calendar disputes; attorney and paralegal exhibit workflows; Apple Calendar recurrence; Etsy and Pinterest template volumes.
- **Census figures:** only "about 1 in 4 children" was verified [V A16]. No 2022 custodial-parent total was extracted. A 2026 fact sheet's "4.0 million parents received cash support in 2023" is SNIPPET [S F15].
- **Scholarly literature** on shared-custody prevalence and co-parenting apps was not reviewed (LibKey unavailable).

---

## Sources

All accessed 2026-10-11 unless noted. Tag after each entry: V = VERIFIED, S = SNIPPET, U = UNVERIFIED.

**A. Official, court, government**

- A1. Arizona Supreme Court, *Planning for Parenting Time: Arizona's Guide for Parents Living Apart*, AOC DRD1H-030217 (PDF; text extracted locally). https://azcourthelp.org/all-documents/child-custody/31-planned-parenting-time/file — V
- A2. Indiana Parenting Time Guidelines, Preamble (effective date shown: 2013-03-01). https://rules.incourts.gov/Content/parenting/preamble/current.htm — V
- A3. Indiana Parenting Time Calendar (index page; HelpLine; school-calendar notice). https://public.courts.in.gov/PTC/ — V (page loads; tool not inspected)
- A4. Indiana Court Times, "Indiana Parenting Time Calendar," 2018-01-24. https://times.courts.in.gov/2018/01/24/indiana-parenting-time-calendar — V
- A5. Indiana Child Support Guideline 6, Parenting Time Credit (effective 2024-01-01). https://rules.incourts.gov/Content/child-support/guideline6/current.htm — V
- A6. Ohio Rev. Code 3119.051 (effective 2019-03-28). https://codes.ohio.gov/ohio-revised-code/section-3119.051 — V
- A7. Pa.R.C.P. 1910.16-4 (amended 2025-08-11, effective 2026-01-01). https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/chapter1910/s1910.16-4.html — V
- A8. Florida Statutes 61.30 (2025). https://www.flsenate.gov/Laws/Statutes/2025/61.30 — V
- A9. Code of Virginia 20-108.2. https://law.lis.virginia.gov/vacode/title20/chapter6.1/section20-108.2/ — V
- A10. OAR 137-050-0730 (Oregon), unofficial reproduction (page dated 2025-05-26). https://oregon.public.law/rules/oar_137-050-0730 — V (unofficial source)
- A11. *Collette v. Welsh*, N.J. Super. Ct. App. Div., A-4576-17T1, decided 2019-03-28 (not for publication; non-precedential). https://www.njcourts.gov/system/files/court-opinions/2019/a4576-17.pdf — V
- A12. Judicial Council of California, FL-341(C) Children's Holiday Schedule Attachment (Rev. 2016-07-01). https://www.courts.ca.gov/documents/fl341c.pdf — V
- A13. Circuit Court of the 23rd Judicial Circuit, Jefferson County, Missouri, "Order Regarding Parent Communications" (form, undated .docx). https://www.jeffcomo.gov/DocumentCenter/View/20654/FORM_Parenting-App-Order — V
- A14. Multnomah County (Oregon), Family Resolution Services, co-parenting apps handout ("2024" in file name; undated). https://multco.us/file/co-parenting_apps_%282024%29/download — V
- A15. Minnesota Judicial Branch self-help, "Handout: Calculating the Number of Overnights." https://mncourts.gov/mncourtsgov/media/scao_library/SelfHelpCenters/documents/Handout-Calculating-the-Number-of-Overnights_.pdf — S (403 on fetch)
- A16. U.S. Census Bureau, P60-285, *Custodial Parents and Their Child Support: 2022* (Aug 2025; page revised 2025-07-28). https://www.census.gov/library/publications/2025/demo/p60-285.html — V
- A17. Texas Attorney General, parenting time overview. https://www.texasattorneygeneral.gov/child-support/families-and-parenting/parenting-time-overview — S
- A18. 750 ILCS 5/505 (Illinois). https://www.ilga.gov/legislation/ilcs/fulltext.asp?DocName=075000050K505 — U (automated access blocked)
- A19. Illinois Legal Aid Online, parenting plan tool. https://www.illinoislegalaid.org/legal-information/parenting-plan — S
- A20. Maryland Courts, Parenting Plan Tool (CC-DR-109) video page. https://mdcourts.gov/video/selfhelp/parenting-plan-series-how-do-i-create-parenting-plan — S
- A21. NCCSD 2018 presentation on Oregon's Guide & File parenting plan. https://nccsd.net/wp-content/plugins/dms/repository/original/Session%208%20Castoff%20to%201115%20and%20Beyond!%20-%20NCCSD%202018.pdf — S
- A22. LSNJLAW (Legal Services of New Jersey), "Co-Parenting Applications" (last reviewed 2026-01-05). https://www.lsnjlaw.org/legal-topics/family-relationships/custody-visitation/general-information/pages/co-parenting-applications — V for the date; content S (F10)

**B. Vendors and products**

- B1. OurFamilyWizard pricing (© 2000–2026). https://www.ourfamilywizard.com/pricing — V
- B2. OurFamilyWizard courts page. https://www.ourfamilywizard.com/courts — V
- B3. OurFamilyWizard Custody Schedule Builder landing page. https://landing.ourfamilywizard.com/custody-schedule-builder — V
- B4. OurFamilyWizard help, "How do I use Custody Schedule Builder." https://support.ourfamilywizard.com/hc/en-us/articles/46395338847885-How-do-I-use-Custody-Schedule-Builder — S (403)
- B5. OurFamilyWizard blog, 2-2-5-5 schedule (published 2018-09-24; updated 2025-03-11). https://www.ourfamilywizard.com/blog/what-2-2-5-5-custody-schedule — V
- B6. TalkingParents pricing (© 2012–2026). https://talkingparents.com/pricing — V
- B7. TalkingParents Shared Calendar feature page. https://talkingparents.com/features/shared-calendar — V
- B8. TalkingParents help, "How to add the 2-2-5-5 Schedule to the Shared Calendar." https://support.talkingparents.com/hc/en-us/articles/26161022341015-How-to-add-the-2-2-5-5-Schedule-to-the-Shared-Calendar — S (403)
- B9. AppClose home (statistics through Q3 2026). https://appclose.com/ — V
- B10. 2houses pricing (© 2026). https://www.2houses.com/en/pricing — V
- B11. Custody X Change home and pricing pages. https://www.custodyxchange.com/pricing.php ; https://www.custodyxchange.com/pricing — V (only "from $6/month billed annually")
- B12. Custody X Change, 2-2-5-5 page. https://www.custodyxchange.com/topics/schedules/50-50/2-2-5-5.php — V
- B13. Custody X Change, professionals page. https://www.custodyxchange.com/topics/software/cxc/professionals.php — V
- B14. Third-party Custody X Change pricing: SoftwareFinder (Apr 2025), ITQlick (Jun 2026), divorce.law Quebec guide (2026). https://softwarefinder.com/legal/custody-x-change ; https://www.itqlick.com/custody-x-change/pricing ; https://divorce.law/guides/co-parenting-apps-tools/quebec/ — S
- B15. Cozi Gold. https://www.cozi.com/cozi-gold/ — V
- B16. Google Calendar Help, create a recurring event. https://support.google.com/calendar/answer/37115?hl=en — V
- B17. Our Days. https://ourdayscalendar.com/ — V
- B18. Qustody (© 2026). http://qustody.com/ — V
- B19. KidsFirst (competitor prices checked 2026-09-04 per page). https://kidsfirst.app/ — V
- B20. LEAP Legal Software (Australia), Parenting Calendar+. https://www.leaplegalsoftware.com/au/features/parenting-calendar-plus — V
- B21. Victoria AI for mediators. https://divorce.law/for-mediators — S (410 on fetch; details from F9)
- B22. Timtab (articles only; no generator seen). https://timtab.com/ — V

**C. App-store data**

- C1. Apple iTunes Search and Lookup API, US store (ratings, prices, release dates, descriptions). Examples: https://itunes.apple.com/search?term=custody%20calendar&entity=software&country=us ; https://itunes.apple.com/lookup?id=1524196903,6471020127,1428802675,6757625632,6758915123,6748956413,6780970832,6761027175,1170670072&country=us — V
- C2. Apple customer-review RSS, US, 250 most recent each. OFW (id497405393), TalkingParents (id1092220726), AppClose (id1019290876). Pattern: https://itunes.apple.com/us/rss/customerreviews/page=1/id=497405393/sortby=mostrecent/json — V (anecdotal content)
- C3. Same feed for Blended (id6748956413), Kidtime (id6471020127), Our Days (id1524196903), Alimentor 2 (id1428802675). https://itunes.apple.com/us/rss/customerreviews/page=1/id=6748956413/sortby=mostrecent/json — V (anecdotal)
- C4. Google Play listings, US: com.ourfamilywizard, com.appclose.androidapp, com.talkingparents.tpandroid, com.ourdayscalendar.android.app, com.vmgmsoftware.kidtime, com.twohouses.app. Pattern: https://play.google.com/store/apps/details?id=com.ourfamilywizard&hl=en_US&gl=US — V
- C5. Google Play search, "co-parenting custody calendar." https://play.google.com/store/search?q=co-parenting%20custody%20calendar&c=apps&hl=en_US&gl=US — V

**D. Free tools, templates, law firms, marketers**

- D1. Versus Texas, Texas Standard Possession calendar (published 2024-03-27; updated 2025-12-28). https://versustexas.com/family-law/texas-standard-possession-calendar — V
- D2. standardpossession.com (title only). https://standardpossession.com/ — V (title)
- D3. Bryan Fagan, SPO calendars. https://www.bryanfagan.com/resources/spo-calendars/ — S (403)
- D4. O'Flaherty Law, Wisconsin Parenting & Custody Calculator (© 2026). https://www.oflaherty-law.com/calculators/wisconsin-parenting-and-custody-calculator — V
- D5. EveryCalculators, Maryland custody calculator. https://everycalculators.com/custody-calculator-overnights-maryland.html — S (403)
- D6. Templacity, 50/50 custody schedule (updated 2026-10-07). https://templacity.com/co-parenting/50-50-custody-schedule/ — V
- D7. BACtrack, 2-2-5-5 article (updated 2025-11-30). https://monitoring.bactrack.com/blogs/ontrack/2-2-5-5-custody-schedule — V
- D8. Payhip, Custody Rotation Schedule Spreadsheet ($7.00). https://payhip.com/b/IyeY2 — V
- D9. Payhip, Co-Parenting Calendar Spreadsheet ($6.50). https://payhip.com/b/ArJap — V
- D10. 223custody.net (title only). https://223custody.net/ — V (title)
- D11. GitHub repository search API. https://api.github.com/search/repositories?q=custody+calendar&sort=updated ; also q=custody+schedule, q=co-parenting+calendar, q=coparenting+calendar — V

**E. Articles and professional publications**

- E1. Douglas J. Sanderson, "Tools of the Trade," *Family Advocate* 40(3), Winter 2018, American Bar Association (copy hosted by a law firm, uploaded 2024-04). https://mccandlaw.com/wp-content/uploads/2024/04/Parenting-Software-ABA-Published-D.-Sanderson.pdf — V (dated)
- E2. Sabine Walsh, "There's an app for that!," Kluwer Mediation Blog, 2014-10-08. https://legalblogs.wolterskluwer.com/mediation-blog/theres-an-app-for-that-the-use-of-technology-in-developing-parenting-plans/ — V (dated)
- E3. DEV Community, "Why every co-parenting app fails at the holiday rotation problem." https://dev.to/call_flow_ai/why-every-co-parenting-app-fails-at-the-holiday-rotation-problem-46il — S (title only; 404 on fetch)

**F. Search queries run on 2026-10-11 (SNIPPET evidence; key result URLs)**

- F1. "Planning for Parenting Time" Arizona guide → azcourthelp.org listings.
- F2. Texas AG SPO calendar 2026 printable → bryanfagan.com/resources/spo-calendars/ ; versustexas.com/family-law/texas-standard-possession-calendar ; gbfamilylaw.com/blogs/texas-standard-possession-schedule ; texasattorneygeneral.gov sticker-calendar PDF.
- F3. "custody calendar maker free" → ctradersite.ctrader.com, lbas.lboro.ac.uk, chw.dhis2.org, ataglance.randstad.com (spam).
- F4. "overnight percentage custody calculator" → oflaherty-law.com, everycalculators.com, plus spam.
- F5. "custody schedule template" → live.museum.manchester.ac.uk, wrdsclassroom.wharton.upenn.edu, my-test.valpo.edu, sf-dev.integrations.cornell.edu (spam).
- F6. "2-2-5-5 custody schedule" → ourfamilywizard.com/node/12233 ; ourfamilywizard.com/blog/what-2-2-5-5-custody-schedule ; monitoring.bactrack.com ; 2houses.com/en/blog/a-divorced-parents-guide-to-the-2-2-5-5-schedule ; bryanfagan.com (2024-08) ; custodyxchange.com/examples/schedules/50-50/2-2-5-5.php.
- F7. "50/50 custody schedule calendar" → bryanfagan.com/2026/01/… (two) ; 2houses.com ; farzadlaw.com/50-50-custody-schedule ; templacity.com.
- F8. Long-tail free calculator queries → hodgsonlawoffices.com ; custodyxchange.com showcase ; monitoringcdn.bactrack.com PDFs ; kufferlaw.com ; mncourts.gov handout (A15) ; oregon.public.law (A10).
- F9. Mediator software → legalblogs.wolterskluwer.com (E2) ; divorce.law/for-mediators (B21) ; mccandlaw.com PDF (E1).
- F10. Court forms naming apps → jeffcomo.gov form (A13) ; multco.us handout (A14) ; lsnjlaw.org (A22) ; divorce.law state guides.
- F11. Google Calendar custody setup → support.talkingparents.com (B8) ; dev.to (E3).
- F12. OFW Custody Schedule Builder → landing.ourfamilywizard.com (B3) ; support.ourfamilywizard.com (B4) ; ourfamilywizard.com/practitioners/product-features ; requests.gravislaw.com training page.
- F13. "reddit 2-2-5-5 vs 2-2-3 … child support" → no Reddit results. Child-support snippets: piercelaw.com (North Carolina, 123 overnights), colorado-family-law.com/node/352 (Colorado, 93), divorce.law South Carolina guide (more than 109), njcourts.gov opinion (A11).
- F14. Court self-help plan builders → illinoislegalaid.org (A19) ; mdcourts.gov (A20) ; nccsd.net (A21) ; times.courts.in.gov (A4) ; leaplegalsoftware.com (B20).
- F15. Census custodial parents → census.gov P60-285 (A16) ; census.gov fact sheet p70fs-214 (2026; 4.0 million parents received cash support in 2023).
- F16. Custody spreadsheet templates → payhip.com (D8, D9).
- F17. "custody schedule" generator → spam ; Qustody ; Timtab.
- F18. Custody X Change pricing → B14 sources.
- F19. Indiana Parenting Time Calendar → times.courts.in.gov (A4) ; rules.incourts.gov (A2) ; banksbrower.com (2021-12-14, describes 2022 amendments).
- F20. "custody calendar" → 9/9 spam (usa8-dev1.alpinelinux.org, blog.mozilla.com.tw, iris.londoncouncils.gov.uk, etc.).
- F21. Etsy custody calendar printables → spam only.
- F22. GitHub custody calendar → no GitHub results; replaced by D11.

**Repo**

- `src/experiments/custody-calendar/index.tsx`, `src/experiments/custody-calendar/model.ts`, `PRODUCT_LOG.md` (#020 entries), `FACTORY_CONSTITUTION.md` section 2.
