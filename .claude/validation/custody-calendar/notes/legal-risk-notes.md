# Custody Calendar: legal, safety and privacy risk notes

> **Since these notes were written:** P1 of the autonomous queue (2026-10-11, commit 75c8844) narrowed "Nothing is sent anywhere" to "Nothing you enter is sent anywhere unless you share a link or a calendar file", added a hint that first names, initials, or nicknames are enough, a note by the share button that anyone with the link can see the schedule and a link can't be taken back, "this is a planning calendar; your court order or parenting plan is what counts", and a "Clear it from this device" control (with confirmation). Statements below about the page describe it before those changes.

Written 2026-10-11 for the Custody Calendar (#020) validation study. This is research for product decisions, not legal advice. Sources were read on 2026-10-11.

**Labels.** Each claim cites a source tag such as [S4]. The Sources list at the end gives each tag's URL and its label: **VERIFIED** (read on the page), **SNIPPET** (seen only in search results) or **UNVERIFIED** (not confirmed). Where a claim rests on a SNIPPET source, the text says so. **ANALYSIS** marks my own inference from cited facts. **REPO** marks facts read in this repository.

Search budget: 10 of the 25 allowed web searches were used. Everything else came from fetching known URLs directly.

---

## Product facts this analysis relies on (REPO)

- The intro paragraph ends with "Nothing is sent anywhere." It's hidden when printing (`src/experiments/custody-calendar/index.tsx`, line 108).
- The note under the calendar says each day counts toward whoever has the children that night, calls this a common way to count custody time, says courts and child-support formulas can count differently, and says a share link holds the names and a copy of the schedule that anyone with it can see. This note does print (index.tsx, lines 285-287).
- The count covers the calendar year on screen: 1 January to 31 December, so 365 or 366 nights, including swapped nights (`model.ts`, `totals`, lines 90-96).
- Storage: `localStorage` key `labs:custody-calendar` (index.tsx, lines 5 and 47-53). The page has no control for clearing it: the file contains no `removeItem` call.
- Share link: the whole schedule (names, pattern, start date, swaps) goes after `#` (index.tsx, lines 85-99). When a link is opened, the page saves the schedule locally and removes the fragment from the address bar with `history.replaceState` (lines 42-45).
- Calendar file: the .ics puts both names in the calendar's name, and "With <name>" in each event's title and description (`model.ts`, lines 138-151).
- The page asks for no children's names, ages, addresses, handover places or handover times (ANALYSIS, from the form fields in index.tsx).
- The Labs constitution rules out backends, accounts and databases (`FACTORY_CONSTITUTION.md`, section 2). So a "standalone with accounts, sync or messaging" couldn't be a Labs experiment.
- The sitewide Feedback link opens a public GitHub issue. Its form says feedback is public and asks people to leave out names (`PRODUCT_LOG.md`, entry around line 153).

## Bottom line

1. **Overnights really do matter legally, but there is no single legal "overnight".** Several US guidelines, and the UK and Australian schemes, adjust support by annual overnights, with cut-off points: Ohio 90, Pennsylvania 40%, Indiana 52, Virginia more than 90 days, UK bands at 52, 104, 156 and 175 nights, Australian bands at 52, 128, 176, 190, 238 and 314 nights. The units differ, though: Arizona counts blocks of hours, Virginia counts 24-hour days, Minnesota adds "overnight equivalents" and California uses a percentage of time. Some places count the time a court ordered and others the time a parent actually used. The page's number is a planning count, not a legal time-share. [S1]-[S12]
2. **The current static version is on the legal-information side of the line.** The user picks the pattern and the page counts and draws it. It gives no advice, makes no documents for filing and predicts no outcomes. Courts publish sample schedules and calculators themselves, presented as examples only or as an estimate, with the court deciding. No unauthorized-practice action against a custody calendar or schedule tool turned up. [S14] [S22] [S23] [S24]
3. **The main legal risk is in the claims, not the feature.** Avoid "court-approved", "legally binding", "child support calculator", "court-ready" or "admissible", and "no lawyer needed". The FTC's DoNotPay order and Ohio's Hernick consent decree both turned on what a service told customers. [S19] [S21]
4. **Courts do order specific apps,** including their calendars: an official Oregon form lists eight apps by name, a Colorado court checklist names two, and a Washington court upheld a contempt finding for not using an app's calendar. But the only "how common" figures come from vendor marketing. The page records a plan, not what actually happened, so it shouldn't be positioned as a record-keeping or evidence tool. [S27] [S28] [S29] [S32] [S35]
5. **Safety is the most real-world risk.** A schedule shows where children will be, and when, in the future. NNEDV warns that shared schedules can be misused to stalk or harass. A share link can't be withdrawn, the saved schedule stays on a shared or monitored device, and calendar files carry the names. Mitigations are cheap: suggest initials, offer sharing without names, add a "forget on this device" button and a short safety note, and never put third-party scripts on the page. [S25] [S26] [S43] [S48b]
6. **Privacy copy should be narrower.** "Nothing is sent anywhere" is true of what people type in. It is broader than the facts overall: GitHub logs visitors' IP addresses, and links and files leave the device whenever someone shares them. [S45]
7. **A standalone with accounts, sync or messaging is a different kind of product.** It would break the Labs constitution and bring duties for security and breach notice, privacy-law thresholds, COPPA if children use it, handling of subpoenas and the Stored Communications Act, abuse vectors, and expectations of court records. [S33] [S49]-[S56]

---

## 1. How overnights matter legally

### What official sources say

| Jurisdiction | What is counted | Threshold or effect | Source |
|---|---|---|---|
| Ohio | Overnights a year under a **court-ordered** parenting time order | 90 or more: the annual support obligation is cut by 10%. The court may remove the cut if the paying parent, without just cause, doesn't use that time. In effect since 2019-03-28. | [S1] |
| Pennsylvania | The paying parent's annual overnights | 40% or more creates a rebuttable presumption of a reduction. The worksheet divides overnights by 365, multiplies by 100, subtracts 30 percentage points, and applies the result to the paying parent's share. | [S2] |
| Minnesota | The percentage of the calendar year a court order schedules the child with each parent, **averaged over two years**. Measured in overnights, or in "overnight equivalents" (significant daytime periods without an overnight). | A parenting-expense formula using each parent's cubed annual overnights. Equal time plus equal incomes means no basic support, unless expenses aren't shared equally. | [S3] |
| Virginia | "Days" of **24 hours**. If the parent with fewer overnights has the child overnight for less than 24 hours, each parent is presumed to get half a day. | The shared-custody formula applies when each parent has **more than 90 days** a year. Exactly 90 doesn't qualify. | [S4] |
| Indiana | Annual overnights. An overnight needn't be 24 hours, but should include feeding, transport and schoolwork, not just a bed. | The credit starts at 52 overnights. The court may allow it below 52 for infants or toddlers, or where the parents live far apart. Equal time means 181 to 183 overnights. The credit is earned by keeping to the schedule, and can be cut if time isn't used. Guidelines updated with effect from 2024-05-14. | [S5] |
| Arizona | "Parenting time days" built from **blocks of hours**. Each 24 hours is one day. Of the remainder, 12 or more hours is a day, 6-11 hours half a day, 3-5 hours a quarter day, and under 3 hours can be a quarter day if the parent pays for things like meals. Only the time of the parent with less time is counted. A block starts and ends at the handoff, including at school. | A table of adjustments. In the 2022 table it's zero below 20 days and the top band is 164 days or more. The 2018 table started at 4 days and ended at 173-182. | [S6] [S7] [S8] |
| California | "H%": the approximate percentage of time the higher earner has primary physical responsibility. The statute doesn't say nights or hours. | Feeds the K factor in the guideline formula. | [S9] (official site returned 403; FindLaw copy) |
| United Kingdom (Child Maintenance Service) | Nights a year the child stays overnight with the paying parent, as set by a court order or by agreement | 52-103 nights: a 14.29% (one-seventh) cut. 104-155: 28.57%. 156-174: 42.86%. 175 or more: 50% plus a further £7 a week. If parents agree on 52 or more nights but not the exact number, the CMS uses 52. Payments can't fall below £7 a week. | [S10] |
| Australia | Nights in the care period, usually 12 months from a change in care. Other periods can be used, such as 24 months where Christmas alternates. The Registrar can use hours instead where a nights count misrepresents care, for example a night-shift worker's daytime care (SNIPPET only). | Care bands: 52-127 nights is regular care (14% to under 35%). 128-237 is shared care, with 176-189 nights (48-52%) as a flat 50% band. 238-313 is primary care, 314 and over above primary. Percentages below 50% round down and those above 50% round up. | [S11] [S12] [S13] (SNIPPET) |

**A worked contrast.** In Arizona's 2018 guidelines, time from Thursday 9 p.m. to the Monday 8 a.m. school drop-off counts as **3½ days** [S6]. A nights counter like this page shows **4 nights**: Thursday, Friday, Saturday and Sunday (ANALYSIS). The 2022 Arizona text keeps the same hour blocks [S8].

### Why a simple nights counter is risky

1. **Unit of time.** Hour blocks (Arizona), 24-hour days with a half-day rule (Virginia), a percentage of time (California), "overnight equivalents" for daytime care (Minnesota), and hours instead of nights (Australia, SNIPPET). [S3] [S4] [S6] [S9] [S13]
2. **Whose time counts, and what's left out.** Arizona counts only the parent with less time and starts and stops the clock at handoffs, including at school. [S6]
3. **Period.** Minnesota averages over two years and Australia generally uses 12 months from a change in care [S3] [S11]. The page uses a single calendar year (REPO). Holidays that alternate by year can move the share from one year to the next (ANALYSIS).
4. **Ordered or actual time.** Ohio uses the time a court ordered, but can drop the cut if it isn't used. Indiana's credit is earned by keeping to the schedule. Arizona uses the order or plan, or the parents' expectation or past practice. The UK uses a court order or agreement. [S1] [S5] [S6] [S10]
5. **Cut-off points and rounding.** Ohio 90, Virginia more than 90, Pennsylvania 40%, Indiana 52 and 181-183, the UK and Australian bands, and Australia's rounding rule [S1] [S2] [S4] [S5] [S10] [S11]. A difference of one or two nights from the legal count can cross a cut-off and change the result (ANALYSIS).
6. **What an overnight is.** In Indiana it needn't last 24 hours but should carry the costs of care. Virginia splits a short overnight into two half days. [S4] [S5]

### Current static version
- The page's rule ("each day counts toward whoever has the children that night"), its "a common way" wording, and its warning that courts and formulas count differently all fit the sources (ANALYSIS; REPO).
- **The remaining risk is reliance.** Parents may quote the share figure as their legal time-share in negotiations or filings, which matters most near a cut-off (ANALYSIS).
- **Keep:** the counting rule printed with the calendar (it already prints; REPO). **Consider:** labeling the figure "share of nights in [year]" and keeping the word "custody" out of the figure itself. **Don't add:** state thresholds or support estimates (ANALYSIS).

### Hypothetical standalone
- A state-aware "legal time-share" or support estimate would need rules for each jurisdiction: units, ordered versus actual time, averaging periods, rounding. It would also need updates as guidelines change; Arizona's page, for example, records a review cycle that was set to begin in January 2024 [S7]. Official calculators already exist, with their own disclaimers [S22]. It would mean heavy upkeep and invite exactly the reliance described above (ANALYSIS).

---

## 2. Unauthorized practice of law and the legal-information line

### What reputable sources say
- **Information or advice.** The National Center for State Courts says court staff can give legal information (court rules, options, steps, which forms to use) but not legal advice, meaning strategy for the best outcome, which only a lawyer can give [S14]. California's court self-help pages draw the same line (SNIPPET) [S15].
- **Courts publish schedules and calculators themselves, with careful framing.** Arizona's parenting-time guide offers numbered sample schedules, among them alternating weeks, a split week, and a plan with exchanges at school or daycare. It gives a blank calendar for parents to design their own and calls the plans examples only, mere ideas that may or may not suit a child [S23]. Arizona's official child support calculator is labeled informational and educational, not legal advice. It calls its result an estimate the court may not follow and says the court decides the amount [S22].
- **How legislatures have treated legal software.**
  - **Texas** (H.B. 1507, 1999) took software, websites, books and forms out of the "practice of law" on condition that the products clearly and conspicuously state they are "not a substitute for the advice of an attorney" [S16]. The amendment followed a federal judgment that had stopped sales of Quicken Family Lawyer in Texas. The Fifth Circuit vacated that judgment in June 1999 because of the amendment [S17].
  - **North Carolina** (N.C. Gen. Stat. 84-2.2, enacted 2016) gives websites that generate legal documents from consumers' answers a safe harbor, on conditions. Consumers must be able to see the blank template, a North Carolina lawyer must review the templates, and the site must say its forms are no substitute for a lawyer. It may not disclaim warranties or remedies, may not require disputes to be resolved outside North Carolina, must run a complaints process, and must register with the State Bar each year (initial fee capped at $100, renewal at $50) [S18]. This applies to document generators, not to calendars (ANALYSIS).
- **Enforcement involving family law.**
  - **Ohio, 2014:** an online divorce service prepared a divorce complaint, told the customer she didn't need legal advice, and left out the custody and support she'd asked for. The respondents admitted unauthorized practice. A consent decree ordered a $539 refund and a $1,000 penalty [S19].
  - **Indiana, 2018:** a non-lawyer's "child support consulting" business, which among other things dealt with a prosecutor's child support division about clients' cases, was permanently enjoined from the unauthorized practice of law [S20].
  - **FTC, 2024-2025:** DoNotPay sold itself as a "robot lawyer". The final order (complaint and proposed order September 2024, final order January 2025, announced February 2025) bans claims that the service can replace any professional service without evidence. It also requires $193,000 and notices to past subscribers [S21].
- **Cases about custody calendars or parenting-time tools specifically:** none found in two targeted searches. The nearest matches involved divorce-form sites, estate plans and general document sites [S24]. Absence from a limited search isn't proof that none exist (UNVERIFIED negative).

### Typical disclaimers and framing
Informational, not legal advice; the result is only an estimate and the court decides [S22]; the schedules are examples only [S23]; not a substitute for a lawyer's advice [S16] [S18]; not a substitute for legal advice, with a link to finding help [S31].

### Current static version
- **Low risk** (ANALYSIS). The parent supplies the pattern from their own order or agreement, and the page counts and draws it. It doesn't recommend schedules, tailor anything to the facts, prepare filings or predict outcomes. That is closer to the sample calendars and calculators courts publish themselves [S22] [S23] than to the conduct in [S19] and [S20].
- **Cheap improvement:** one plain line, for example: "Not legal advice. If this differs from your court order or parenting plan, the order is what counts." This mirrors the Texas approach [S16] and the court-calculator framing [S22] (ANALYSIS).

### Hypothetical standalone
Risk climbs with each of these (ANALYSIS):
- Recommending a schedule based on a child's age or a family's facts. That is individual strategy, the advice side of [S14].
- Generating parenting plans, agreements or court forms. That brings in North Carolina-style registration and conditions [S18], and the facts in [S19].
- State-by-state support estimates.
- An AI chat answering legal questions, which is what [S21] was about.
- Marketing that suggests a lawyer isn't needed [S19] [S21].

---

## 3. Court and professional context

### Do courts order specific co-parenting apps?
- **Yes, at the court's discretion.** NNEDV's Safety Net project tells judges that courts may order co-parenting apps, especially where there has been abuse, and that some apps let a court monitor all messages [S25].
- **Official forms and checklists name apps.**
  - An Oregon circuit court's standard parenting plan (SLR 8.075, form FRM 1000, version V050124) has a "Parenting App" checkbox. It lists OurFamilyWizard, TalkingParents, Custody X Change, WeParent, 2Houses, AppClose, CoParenter and Fayr, and tells parents to look into the options because they change [S27].
  - A Colorado Judicial Branch checklist for mediated agreements lists OurFamilyWizard or TalkingParents as options where appropriate, and also shared calendars or apps such as Google or third-party software. It flags any history of domestic violence when decision-making is allocated [S28].
- **Court-ordered calendar use has been enforced.** In *Bell v. DiLorenzo* (Wash. Ct. App., Aug. 18, 2020, unpublished), the parenting plan required all co-parenting communication through OurFamilyWizard and required children's appointments to go on its calendar. The appeals court upheld a contempt finding for failing to use the calendar [S29]. Unreported Maryland opinions describe orders sending parents' communication through OurFamilyWizard (SNIPPET) [S30]. In the UK, a University of East Anglia family-courts page says some local judges order these apps [S31].
- **How common is it?** No official or independent prevalence data turned up (open item).
  - OurFamilyWizard says it's accepted by courts in all 50 states, calls itself the top court-recommended co-parenting app, claims over a million parents and professionals, and offers sample order wording and fee waivers [S32] [S34].
  - TalkingParents says it's court approved in all 50 states and claims 870k+ families [S35].
  - AppClose's App Store listing reportedly says, based on user-supplied data, that courts order it in every US county (SNIPPET) [S36].
  - All of these are vendor marketing, not data.

### Do courts accept calendars or schedule exhibits from tools?
- Under the **federal** rules, which many state rules resemble (UNVERIFIED generalization: state family courts apply their own rules):
  - A chart or calendar used to explain evidence is an illustrative aid. It isn't evidence, and generally doesn't go to the jury room unless the parties agree or the court allows it (FRE 107, added in 2024) [S37].
  - A summary or chart of voluminous records can be admitted as evidence if the underlying records are made available to the other side (FRE 1006, amended with effect from 2024-12-01) [S38].
  - Business records and records from electronic systems can be authenticated by a custodian's certification, with notice to the other side (FRE 902(11), (13) and (14)) [S39].
- **For this page** (ANALYSIS): a printout shows the pattern a parent typed in, plus their swaps. At most it's the parent's own illustration of the order. It records nothing about what actually happened, carries no timestamps and has no tamper evidence.

### Record-keeping expectations
- California's court self-help advises keeping a log of violations, such as the dates and times of repeated late exchanges, and saving texts and emails [S40]. Michigan's investigator manual asks whether a parent has actually used the time a court ordered (SNIPPET) [S42].
- Vendors sell "unalterable" time-stamped records. OurFamilyWizard publishes a subpoena policy (a valid subpoena required; a $20 search fee, $20 certification fee and $0.18 a page) and offers business-records affidavits [S32] [S33]. TalkingParents says nothing can be edited or deleted [S35].

### Current static version
It's a planning view. It isn't a log, a records system or evidence (ANALYSIS). Don't call it court-ready, and don't add "record exchanges" features without understanding the evidence and safety implications above.

### Hypothetical standalone
A product with messages and records joins the "court records" market. That market expects message integrity (no edits, audit trails), a records custodian who answers subpoenas and signs certifications, and order language courts can adopt [S32] [S33] [S34] [S39]. That is a heavy, ongoing operational load (ANALYSIS).

---

## 4. Safety: domestic violence, high conflict and technology-facilitated abuse

### What domestic violence organizations and courts say
- **NNEDV Safety Net** (2024, for judges and supervised-visitation providers) [S25]:
  - Schedules, contact details and children's activities shared through these tools can be misused to stalk, harass or control.
  - Constant location sharing conflicts with standard safety advice.
  - Monitoring software on a survivor's phone can expose app activity.
  - Web portals should have multi-factor authentication.
  - Photos carry metadata.
  - Collect only the data needed, give plain privacy notices that cover retention and deletion, and plan for safety with local DV programs.
- **WomensLaw** (an NNEDV project, updated 2025-04-12) [S26]:
  - Benefits: a record of messages, and less direct contact.
  - Risks: more personal information than people want to share, location services that must stay on, data shared with other companies, insecure portals, phone-only apps when the phone may be monitored, and metadata in files.
  - A parent uncomfortable with an ordered app may be able to ask the judge for a different one.
- **Courts.**
  - Arizona's parenting-time guide covers protective orders, domestic violence, safety and high conflict as special issues. It presents a schedule with exchanges at school or daycare as suiting high-conflict parents because the parents don't meet [S23].
  - California's self-help notes that special laws apply where there's a history of domestic violence [S41].
  - Colorado's checklist asks about domestic violence when decision-making is allocated [S28].

### What a share link carrying names and a schedule actually exposes
- **The mechanics:**
  - Browsers don't send the fragment to the server [S43], and leave it out of the Referer header [S44].
  - Any script running on the page can read it through `location.hash` [S48b]. The page has no third-party scripts today, but any analytics or embed added later could read every shared schedule (ANALYSIS).
  - The link travels in full through whatever the parent uses to send it, such as email, SMS or a chat app, and stays in those histories and backups (ANALYSIS).
  - It can be forwarded. It can't be withdrawn or made to expire, because no server is involved (ANALYSIS).
  - The page removes the fragment from the address bar once the link is opened (REPO). Whether the original link stays in browser history, or syncs to other devices, hasn't been tested (open item).
- **What the content reveals** (ANALYSIS): which household the children will be in, night by night, for the whole year, and therefore the handover days. That is future "pattern of life" data. With full names it identifies people. The page has no addresses, handover places or handover times (REPO), which limits the exposure.
- **Other places the data lives** (ANALYSIS):
  - **`localStorage`:** anyone using the same browser can open the page and see the schedule. There's no "forget" control (REPO).
  - **The .ics file:** it carries both names (REPO). Imported into a shared family or work calendar, it's visible to everyone with access, and cloud calendars keep a copy.

### Standard mitigations, and what fits this page
- **The standard ones in the sources** [S25] [S26]:
  - collect as little as possible
  - no location tracking that must stay on
  - plain notices about what is shared and kept, and for how long
  - users control deletion
  - avoid metadata
  - plan for safety with advocates
- **What fits a static page** (ANALYSIS):
  - a field hint that initials or nicknames work fine
  - a "share without names" option (A and B)
  - a "Forget this schedule on this device" button
  - a short safety line by the share button: if safety is a concern, think before sharing, because a link can't be taken back. It could link to a DV technology-safety resource.
  - never add child names, locations, handover times or GPS
  - keep the page free of third-party scripts
  - keep the current advice to import calendar files into a calendar of their own, and add a caution about shared calendars

### Current static version
The risk is moderate and mostly in the user's hands. Data stays local and in links the user chooses to send. The biggest gaps are that links can't be withdrawn, data lingers on shared devices, and full names are used by default (ANALYSIS).

### Hypothetical standalone
Accounts, sync and messaging bring the whole NNEDV list into play: account takeover, monitoring, location features, harassment through messages, retention, and data that can't be deleted. An app can become an abuser's channel of contact even under a court order (SNIPPET news report) [S59]. Building for this responsibly needs DV-informed design and support (ANALYSIS).

---

## 5. Privacy

### Is a co-parenting schedule with names sensitive personal data?
- **Legally:** it's personal data, but not a listed sensitive category in the laws checked.
  - UK GDPR special categories don't include family or custody information [S53].
  - Virginia's consumer data law counts data collected from a known child (under 13) and precise geolocation (within about 1,750 feet) as sensitive data. A custody schedule as such isn't in the list [S51].
- **In practice:** it's highly sensitive because of the safety risks above [S25].
- **What the page collects:** two parents' names (free text) and the pattern of nights, with no child data (REPO).

### Current static version
- **No copy on our side.** What people enter lives in their browser and in the links and files they make (REPO). GitHub, which hosts Labs, logs and keeps visitors' IP addresses for security [S45]. The fragment never reaches GitHub [S43].
- **Truthfulness of privacy claims.**
  - The FTC acts against companies that break privacy promises or mislead about data security, mostly under Section 5 of the FTC Act [S46]. Section 5 reaches unfair or deceptive practices "in or affecting commerce" [S47]. Whether that covers a free, non-commercial personal page is unclear (open item), but accuracy is the right standard either way (ANALYSIS).
  - "Nothing is sent anywhere" is accurate for what people type in. It overstates the case slightly, because loading the page sends a normal request to GitHub, and links and files leave the device whenever the user shares them.
  - A tighter version: "Nothing you enter is sent anywhere; it stays on this device unless you share a link or calendar file." A sitewide privacy note could mention GitHub's IP logging (ANALYSIS).
- **State consumer privacy laws.**
  - The CCPA covers for-profit businesses with gross revenue over $25 million, or that buy, sell or share the data of 100,000 or more California consumers or households, or that make half their revenue from selling it. It generally doesn't apply to nonprofits [S50]. The AG's page shows $25M; later inflation adjustments weren't checked (UNVERIFIED).
  - Virginia's law applies at 100,000 consumers, or 25,000 consumers plus more than half of revenue from selling data, and exempts nonprofits [S52].
  - A personal static page that collects nothing on a server is far from these thresholds (ANALYSIS).
- **COPPA** applies to services directed to children under 13, or to operators who know they're collecting from children under 13 [S48]. A calendar for parents isn't directed to children. A "kids' view" could change that (ANALYSIS).
- **Minor:** feedback goes to public GitHub issues. The form already asks people to leave out names (REPO). For this experiment, it's worth repeating that warning near the feedback link (ANALYSIS).

### Hypothetical cloud version
- **Security and breach duties.** California requires reasonable security for "personal information", which includes a username or email address combined with a password [S55]. Its breach-notification law uses the same account-credential element [S56]. Accounts alone bring these duties (ANALYSIS).
- **Privacy laws** once thresholds are met [S50] [S52]. **Sensitive data** if the product holds children's data or precise location, for example check-ins at exchanges [S51].
- **COPPA** if there are child accounts, or the operator knows under-13s use it. The amended rule took effect on 2025-06-23, with compliance generally due by 2026-04-22 [S48] [S49].
- **FTC scrutiny** of privacy and security promises [S46].
- **Legal process.**
  - Vendors such as OurFamilyWizard publish subpoena procedures: a subpoena compliant with Rule 45, fees, and certification [S33].
  - The Stored Communications Act generally bars public service providers from voluntarily disclosing the contents of communications. The exceptions include the consent of the sender or recipient. Records that aren't content may go to non-government parties [S54].
  - A messaging product would need a playbook for legal requests (ANALYSIS).
- **GDPR and UK GDPR** if offered to people in the EU or UK: not researched (open item).
- **It would also break Labs' hard limits:** static only, no accounts, no database (REPO).

---

## 6. Claims to avoid, and safer wording

| Avoid | Why | Safer wording |
|---|---|---|
| "Court-approved", "court-accepted", "accepted by courts nationwide" | No court approves tools like this. Rivals' versions of these claims are unsourced marketing [S32] [S35]. The FTC acts on deceptive claims [S46], and the DoNotPay order needed evidence behind claims of replacing professionals [S21]. | "A planning calendar. Your court order or parenting plan is what counts." |
| "Legally binding", "official schedule" | The order or signed agreement controls. The page draws whatever was typed in (ANALYSIS). | "Shows the schedule you enter. It doesn't change or replace a court order or parenting plan." |
| "Child support calculator", "estimate your support" | Formulas use different time units, periods and income inputs [S1]-[S12]. Official calculators exist, with their own caveats [S22]. | "Counts nights. Some child-support formulas use overnights, and each counts them its own way." |
| "Accurate overnight percentage for court", "court-ready", "use this in court" | Definitions differ (section 1). A court may treat a printout as no more than an illustration [S37] [S38]. | "Each parent's share of nights in [year], by this page's count: each night goes to whoever has the children that night." |
| "Court-admissible", "records", "evidence", "tamper-proof" | No timestamps or integrity checks. Authentication rules apply [S39]. | Say nothing. If needed: "For planning, not for keeping records." |
| "No lawyer needed", "replaces a mediator or lawyer" | Ohio's Hernick case [S19]; the FTC's DoNotPay order [S21]. | "Not legal advice. For questions about your order or support, ask a family-law professional or your court's self-help center." |
| "The best or fairest schedule for your child", recommending patterns | Individual advice [S14]. Courts present sample schedules as examples only [S23]. | "Pick the pattern in your order or agreement." |
| "Private", "secure", "encrypted", "safe for DV situations" | A share link is readable by anyone who has it [S43]. GitHub logs IP addresses [S45]. NNEDV's caution [S25]. | "What you enter stays on this device unless you share a link or calendar file. Anyone with a link can see the names and schedule, and a link can't be taken back." |
| "Custody percentage" | "Custody" can mean legal decision-making or time. Statutes use several terms [S2] [S4] [S6]. | "Share of overnights" or "nights with each parent". |

---

## Practical product implications

### What to say
- Keep the counting rule and the warning that "courts and child-support formulas can count differently". Both match the sources, and the note prints with the calendar (REPO; [S1]-[S12]).
- Add one line: "Not legal advice. If this differs from your court order or parenting plan, the order is what counts." [S16] [S22]
- Narrow the privacy line to "Nothing you enter is sent anywhere…", and mention GitHub's IP logging in a sitewide note [S45].
- By the share button, add that a link can't be taken back and that initials work fine [S25].

### What not to say
Everything in the "Avoid" column of section 6, especially court approval, binding force, "child support" outputs, and evidence or record claims.

### What reduces risk (cheapest first)
1. A **"Forget this schedule on this device"** button that clears `labs:custody-calendar`. It protects people on shared or monitored devices [S25] [S26] (ANALYSIS).
2. **Encourage initials or nicknames.** Optionally, let people share without names.
3. A **one-line safety note** by the share button, possibly linking to a DV technology-safety resource (wording to be decided).
4. **No third-party scripts, analytics or embeds on this page, ever**, because they could read shared schedules [S48b].
5. **Never add** child names or ages, addresses, handover places or times, GPS, messaging, an exchange log, support estimates or state-specific "legal" counts.
6. **A print footer:** "Planning view of the pattern entered. Not a court record." This helps when printouts end up in a court file [S37].
7. **Calendar-file wording:** keep the advice to use a calendar of its own, and add "avoid shared calendars" (REPO; ANALYSIS).

### What would trigger heavy obligations
- **Accounts, sync or cloud storage:** breaks the Labs constitution, and brings duties for reasonable security and breach notice, privacy-law thresholds and subpoenas [S33] [S50] [S52] [S55] [S56].
- **Messaging or records:** content-disclosure limits under the Stored Communications Act, subpoena and certification work, expectations of integrity, retention and deletion, an abuse channel, and moderation [S25] [S33] [S39] [S54].
- **Child accounts or children's data:** COPPA, plus sensitive-data rules [S48] [S49] [S51].
- **Location or check-ins at exchanges:** precise geolocation is sensitive data, and location features are a known DV risk [S25] [S51].
- **Support calculations or state-specific legal outputs:** accuracy and upkeep, reliance, risk of deceptive claims [S21] [S22].
- **Generating parenting plans or court forms, or recommending schedules:** unauthorized-practice exposure and document-software rules such as North Carolina's registration [S14] [S16] [S18] [S19].
- **An AI that answers legal questions:** the DoNotPay pattern [S21].

---

## Open items

1. **Australia's hours-based care percentage** is confirmed only by a search snippet; the official DSS Child Support Guide returned 403 [S13].
2. **Arizona's official 2022 guidelines PDF** sits on SharePoint and returned 403. The 2022 details come from WomensLaw's copy [S8], and the worked example from the official 2018 text [S6].
3. **California's official legislative site** returned 403; FindLaw's copy was used [S9].
4. **No independent data on how often courts order apps.** Only vendor claims, official forms and individual cases were found.
5. **Browser behavior to test:** whether the original share link (with names) stays in browser history or syncs to other devices after the page clears the address bar, and what link previews in common chat apps store.
6. **Whether the FTC Act reaches a free, non-commercial personal page.** Not resolved.
7. **Not researched:** Massachusetts guidelines (if the owner's state matters), UPL rules for software in states other than Texas and North Carolina, California's legal document assistant rules for any future document feature, and GDPR or UK GDPR scope for a cloud version.
8. **Product decisions:** whether to link a DV resource from the page, and which one.
9. **The negative UPL finding** rests on two searches. A bar-association or legal-database search would be more conclusive.

---

## Sources

Read on 2026-10-11 unless noted. Dates are as shown on each page.

**Child support and time-counting rules**
- [S1] Ohio Rev. Code 3119.051, effective 2019-03-28. VERIFIED. https://codes.ohio.gov/ohio-revised-code/section-3119.051
- [S2] Pa. R.C.P. 1910.16-4. VERIFIED. https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/chapter1910/s1910.16-4.html
- [S3] Minn. Stat. 518A.36. VERIFIED. https://www.revisor.mn.gov/statutes/cite/518A.36
- [S4] Va. Code 20-108.2(G)(3). VERIFIED. https://law.lis.virginia.gov/vacode/title20/chapter6.1/section20-108.2/
- [S5] Indiana Child Support Guideline 6 and commentary. VERIFIED. https://rules.incourts.gov/Content/child-support/guideline6/current.htm (index showing "Updated, Effective May 14, 2024": https://rules.incourts.gov/Content/child-support/default.htm)
- [S6] Arizona Child Support Guidelines 2018, official PDF, effective 2018-04-01 and since superseded. VERIFIED (text extracted, section 11). https://www.azcourts.gov/Portals/0/34/Forms/FamilyLaw/AOCDRS10H2018.pdf
- [S7] Arizona Judicial Branch guidelines page, listing the 2022 guidelines (effective 2022-01-01, revised 2022-09-21) and the next review. VERIFIED. https://www.azcourts.gov/familylaw/Child-Support-Family-Law-Information/Arizona-Child-Support-Guidelines
- [S8] WomensLaw (NNEDV) reproduction of the Arizona guidelines for actions filed from 2022-01-01. VERIFIED (unofficial copy; page updated 2026-07-31). https://nocache.womenslaw.org/laws/az/statutes/ss-25-320-child-support-guidelines
- [S9] Cal. Fam. Code 4055. VERIFIED (FindLaw copy; official leginfo returned 403). https://codes.findlaw.com/ca/family-code/fam-sect-4055/
- [S10] GOV.UK, "How child maintenance is worked out: shared care". VERIFIED (undated). https://www.gov.uk/how-child-maintenance-is-worked-out/shared-care
- [S11] Services Australia Operational Blueprint 277-03040010, care percentage and care periods. VERIFIED (undated; examples to October 2025). https://operational.servicesaustralia.gov.au/public/Pages/separated-parents/277-03040010-05.html
- [S12] Services Australia Operational Blueprint 277-03160000, basic values (2026 care bands). VERIFIED. https://operational.servicesaustralia.gov.au/public/Pages/separated-parents/277-03160000-03.html
- [S13] DSS Child Support Guide 4.1.4, "Care other than in nights". SNIPPET (403 on fetch). https://guides.dss.gov.au/child-support-guide/4/1/4

**Legal information and unauthorized practice**
- [S14] National Center for State Courts, "Legal advice vs. legal information". VERIFIED (undated). https://www.ncsc.org/resources-courts/legal-advice-vs-legal-information
- [S15] California Courts, court-based self-help services. SNIPPET. https://selfhelp.courts.ca.gov/court-based-self-help-services
- [S16] Texas H.B. 1507 (76th Legislature, 1999), enrolled text adding Gov't Code 81.101(c). VERIFIED (current codified text not separately confirmed). https://capitol.texas.gov/tlodocs/76R/billtext/html/HB01507F.htm
- [S17] *Unauthorized Practice of Law Committee v. Parsons Technology*, 179 F.3d 956 (5th Cir. 1999), decided 1999-06-29. VERIFIED. https://law.resource.org/pub/us/case/reporter/F3/179/179.F3d.956.99-10388.html
- [S18] N.C. Gen. Stat. 84-2.2 (S.L. 2016-60; amended 2025). VERIFIED. https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_84/GS_84-2.2.html
- [S19] *Cleveland Metro. Bar Assn. v. Hernick*, 138 Ohio St.3d 210, 2014-Ohio-521, decided 2014-02-18. VERIFIED. https://supremecourt.ohio.gov/rod/docs/pdf/0/2014/2014-ohio-521.pdf
- [S20] The Indiana Lawyer, 2018-04-26, on the injunction against Dawn Baker of Child Support Consulting of Indiana. VERIFIED (news report). https://theindianalawyer.com/?p=135130
- [S21] FTC case page, *DoNotPay*: complaint 2024-09-25, order 2025-01-17, announced 2025-02-11. VERIFIED. https://www.ftc.gov/legal-library/browse/cases-proceedings/donotpay
- [S22] Arizona Judicial Branch, "About the Child Support Calculator". VERIFIED. https://www.azcourts.gov/familylaw/Child-Support-Family-Law-Information/About-the-Child-Support-Calculator
- [S23] Arizona Judicial Branch, *Planning for Parenting Time* (sample schedules, "examples only" framing, high-conflict and DV sections). VERIFIED by partial text extraction; title from search results; edition date not confirmed. https://www.azcourts.gov/portals/0/31/parentingTime/PPWguidelines.pdf
- [S24] Search note (2026-10-11): two searches found no UPL actions against custody calendars or parenting-time tools. Results were about divorce forms, LegalZoom, DoNotPay and estate plans. Negative finding, UNVERIFIED. No URL.

**Courts, apps and evidence**
- [S25] NNEDV Safety Net, "Co-Parenting Apps: Considerations for Judges and Supervised Visitation Providers" (© 2024; checklist dated 2024-12-16). VERIFIED. https://www.techsafety.org/coparenting-apps
- [S26] WomensLaw (NNEDV), co-parenting technology tools (updated 2025-04-12). VERIFIED. https://nocache.womenslaw.org/about-abuse/abuse-using-technology/ways-courts-use-technology/co-parenting-technology-tools
- [S27] Oregon circuit court (Benton County file), Standard Parenting Plan, SLR 8.075, FRM 1000 V050124, section 2.4. VERIFIED (text extracted). https://www.courts.oregon.gov/forms/Documents/BEN-StandardParentingPlan.pdf
- [S28] Colorado Judicial Branch, Memorandum of Understanding Issues Checklist (file dated 2023-10). VERIFIED (text extracted). https://www.coloradojudicial.gov/sites/default/files/2023-10/Memoranda-of-Understanding-checklist_ARP_TIMS_SAS-edits.pdf
- [S29] *Bell v. DiLorenzo*, No. 37359-2-III (Wash. Ct. App. Div. III, filed 2020-08-18, unpublished). VERIFIED (text extracted). https://www.courts.wa.gov/opinions/pdf/373592_unp.pdf
- [S30] Maryland unreported opinions describing OurFamilyWizard communication orders, for example. SNIPPET. https://www.mdcourts.gov/sites/default/files/unreported-opinions/2275s25.pdf
- [S31] University of East Anglia, family courts, "Co-parenting apps". VERIFIED (undated). https://www.uea.ac.uk/groups-and-centres/family-courts/co-parenting-apps
- [S32] OurFamilyWizard home page (vendor claims; © 2000-2026). VERIFIED. https://www.ourfamilywizard.com/
- [S33] OurFamilyWizard subpoena policy. VERIFIED. https://www.ourfamilywizard.com/legal/subpoenas
- [S34] OurFamilyWizard model order language page. VERIFIED. https://www.ourfamilywizard.com/practitioners/model-order-language
- [S35] TalkingParents home page (vendor claims; © 2012-2026). VERIFIED. https://talkingparents.com/
- [S36] AppClose App Store listing (claims as summarized in search results). SNIPPET. https://apps.apple.com/us/app/-/id1019290876
- [S37] Federal Rule of Evidence 107 (2024 committee note). VERIFIED. https://www.law.cornell.edu/rules/fre/rule_107
- [S38] Federal Rule of Evidence 1006 (amended effective 2024-12-01). VERIFIED. https://www.law.cornell.edu/rules/fre/rule_1006
- [S39] Federal Rule of Evidence 902(11), (13) and (14). VERIFIED. https://www.law.cornell.edu/rules/fre/rule_902
- [S40] California Courts self-help, "Enforce a custody order". VERIFIED. https://selfhelp.courts.ca.gov/child-custody/enforce
- [S41] California Courts self-help, "Resources to develop a parenting plan". VERIFIED. https://selfhelp.courts.ca.gov/resources-develop-parenting-plan
- [S42] Michigan Custody and Parenting Time Investigation Manual (2024). SNIPPET. https://www.courts.michigan.gov/4932e6/siteassets/publications/manuals/foc/cp_investigationmnl.pdf

**Web mechanics and hosting**
- [S43] MDN, URI fragment (not sent to the server). VERIFIED. https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment
- [S44] MDN, Referer header (never includes fragments). VERIFIED. https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referer
- [S48b] MDN, `Location.hash` (page scripts can read the fragment). VERIFIED. https://developer.mozilla.org/en-US/docs/Web/API/Location/hash
- [S45] GitHub Docs, "About GitHub Pages", data collection (visitor IPs logged for security). VERIFIED. https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages

**Privacy law**
- [S46] FTC, privacy and security enforcement. VERIFIED. https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement
- [S47] 15 U.S.C. 45 (FTC Act section 5). VERIFIED. https://www.law.cornell.edu/uscode/text/15/45
- [S48] FTC, COPPA Rule page (scope). VERIFIED. https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa
- [S49] Federal Register, 2025-04-22, COPPA amendments (effective 2025-06-23; compliance by 2026-04-22), via GovInfo. VERIFIED. https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm
- [S50] California Attorney General, CCPA page (updated 2026-08-28). VERIFIED. https://oag.ca.gov/privacy/ccpa
- [S51] Va. Code 59.1-575 (definitions, including sensitive data and child). VERIFIED. https://law.lis.virginia.gov/vacode/title59.1/chapter53/section59.1-575/
- [S52] Va. Code 59.1-576 (scope and exemptions). VERIFIED. https://law.lis.virginia.gov/vacode/title59.1/chapter53/section59.1-576/
- [S53] UK ICO, "What is special category data?". VERIFIED. https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/
- [S54] 18 U.S.C. 2702 (Stored Communications Act, voluntary disclosure). VERIFIED. https://www.law.cornell.edu/uscode/text/18/2702
- [S55] Cal. Civ. Code 1798.81.5 (reasonable security). VERIFIED (FindLaw copy). https://codes.findlaw.com/ca/civil-code/civ-sect-1798-81-5/
- [S56] Cal. Civ. Code 1798.82 (breach notification). VERIFIED (FindLaw copy). https://codes.findlaw.com/ca/civil-code/civ-sect-1798-82/

**Supporting search leads, not relied on for key claims**
- [S57] Legal Services of New Jersey, co-parenting applications (last reviewed 2026-01-05; body not retrievable). SNIPPET. https://lsnjlaw.org/legal-topics/family-relationships/custody-visitation/general-information/pages/co-parenting-applications
- [S58] WSLS (Roanoke), 2024-04-23, benefits and dangers of co-parenting apps. SNIPPET. https://www.wsls.com/news/local/2024/04/23/benefits-and-dangers-of-using-co-parenting-apps
- [S59] KPRC Click2Houston, 2025-06-30, co-parenting apps used for abuse. SNIPPET. https://www.click2houston.com/news/local/2025/06/30/what-to-do-when-co-parenting-apps-become-a-tool-for-abuse

[S1]: https://codes.ohio.gov/ohio-revised-code/section-3119.051
[S2]: https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/231/chapter1910/s1910.16-4.html
[S3]: https://www.revisor.mn.gov/statutes/cite/518A.36
[S4]: https://law.lis.virginia.gov/vacode/title20/chapter6.1/section20-108.2/
[S5]: https://rules.incourts.gov/Content/child-support/guideline6/current.htm
[S6]: https://www.azcourts.gov/Portals/0/34/Forms/FamilyLaw/AOCDRS10H2018.pdf
[S7]: https://www.azcourts.gov/familylaw/Child-Support-Family-Law-Information/Arizona-Child-Support-Guidelines
[S8]: https://nocache.womenslaw.org/laws/az/statutes/ss-25-320-child-support-guidelines
[S9]: https://codes.findlaw.com/ca/family-code/fam-sect-4055/
[S10]: https://www.gov.uk/how-child-maintenance-is-worked-out/shared-care
[S11]: https://operational.servicesaustralia.gov.au/public/Pages/separated-parents/277-03040010-05.html
[S12]: https://operational.servicesaustralia.gov.au/public/Pages/separated-parents/277-03160000-03.html
[S13]: https://guides.dss.gov.au/child-support-guide/4/1/4
[S14]: https://www.ncsc.org/resources-courts/legal-advice-vs-legal-information
[S15]: https://selfhelp.courts.ca.gov/court-based-self-help-services
[S16]: https://capitol.texas.gov/tlodocs/76R/billtext/html/HB01507F.htm
[S17]: https://law.resource.org/pub/us/case/reporter/F3/179/179.F3d.956.99-10388.html
[S18]: https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_84/GS_84-2.2.html
[S19]: https://supremecourt.ohio.gov/rod/docs/pdf/0/2014/2014-ohio-521.pdf
[S20]: https://theindianalawyer.com/?p=135130
[S21]: https://www.ftc.gov/legal-library/browse/cases-proceedings/donotpay
[S22]: https://www.azcourts.gov/familylaw/Child-Support-Family-Law-Information/About-the-Child-Support-Calculator
[S23]: https://www.azcourts.gov/portals/0/31/parentingTime/PPWguidelines.pdf
[S25]: https://www.techsafety.org/coparenting-apps
[S26]: https://nocache.womenslaw.org/about-abuse/abuse-using-technology/ways-courts-use-technology/co-parenting-technology-tools
[S27]: https://www.courts.oregon.gov/forms/Documents/BEN-StandardParentingPlan.pdf
[S28]: https://www.coloradojudicial.gov/sites/default/files/2023-10/Memoranda-of-Understanding-checklist_ARP_TIMS_SAS-edits.pdf
[S29]: https://www.courts.wa.gov/opinions/pdf/373592_unp.pdf
[S30]: https://www.mdcourts.gov/sites/default/files/unreported-opinions/2275s25.pdf
[S31]: https://www.uea.ac.uk/groups-and-centres/family-courts/co-parenting-apps
[S32]: https://www.ourfamilywizard.com/
[S33]: https://www.ourfamilywizard.com/legal/subpoenas
[S34]: https://www.ourfamilywizard.com/practitioners/model-order-language
[S35]: https://talkingparents.com/
[S36]: https://apps.apple.com/us/app/-/id1019290876
[S37]: https://www.law.cornell.edu/rules/fre/rule_107
[S38]: https://www.law.cornell.edu/rules/fre/rule_1006
[S39]: https://www.law.cornell.edu/rules/fre/rule_902
[S40]: https://selfhelp.courts.ca.gov/child-custody/enforce
[S41]: https://selfhelp.courts.ca.gov/resources-develop-parenting-plan
[S42]: https://www.courts.michigan.gov/4932e6/siteassets/publications/manuals/foc/cp_investigationmnl.pdf
[S43]: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment
[S44]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referer
[S45]: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
[S46]: https://www.ftc.gov/news-events/topics/protecting-consumer-privacy-security/privacy-security-enforcement
[S47]: https://www.law.cornell.edu/uscode/text/15/45
[S48]: https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa
[S48b]: https://developer.mozilla.org/en-US/docs/Web/API/Location/hash
[S49]: https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm
[S50]: https://oag.ca.gov/privacy/ccpa
[S51]: https://law.lis.virginia.gov/vacode/title59.1/chapter53/section59.1-575/
[S52]: https://law.lis.virginia.gov/vacode/title59.1/chapter53/section59.1-576/
[S53]: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/
[S54]: https://www.law.cornell.edu/uscode/text/18/2702
[S55]: https://codes.findlaw.com/ca/civil-code/civ-sect-1798-81-5/
[S56]: https://codes.findlaw.com/ca/civil-code/civ-sect-1798-82/
[S57]: https://lsnjlaw.org/legal-topics/family-relationships/custody-visitation/general-information/pages/co-parenting-applications
[S58]: https://www.wsls.com/news/local/2024/04/23/benefits-and-dangers-of-using-co-parenting-apps
[S59]: https://www.click2houston.com/news/local/2025/06/30/what-to-do-when-co-parenting-apps-become-a-tool-for-abuse
