# Risk and compliance: Custody Calendar

Comparative Research (2026-10-11). **Not legal advice.** Full evidence: `notes/legal-risk-notes.md` (59 sources: state guidelines and statutes, court forms and self-help, bar and FTC materials, NNEDV and WomensLaw, privacy statutes). Labels: **[V]** read on the source; **[S]** snippet; **[U]** inference.

## Summary

| Area | Current Labs version | Hypothetical standalone (accounts, sync, messaging) |
|---|---|---|
| Legal-information line | On the information side: the user picks the pattern; the page counts and draws it [V/U] | Generating plans, support estimates, or recommendations moves toward legal services |
| Reliance on the count | The main legal risk: parents may quote the share as their legal time-share | State-aware counts would need per-jurisdiction rules and upkeep |
| Court context | A planning view, not a record or evidence | Joins the "court records" market: integrity, custodians, subpoenas |
| Safety | Moderate, mostly in the user's hands: links can't be withdrawn; data lingers on shared devices; full names by default | The whole technology-abuse surface: accounts, monitoring, messaging, location |
| Privacy | Nothing typed reaches Labs; links and files leave the device when shared | Security and breach duties, privacy-law thresholds, COPPA for child accounts, subpoena handling |

## 1. Overnights and reliance

Definitions differ: Ohio (court-ordered overnights, 90 threshold), Pennsylvania (40%), Indiana (52, with care required), Virginia (24-hour days, half-day rule), Arizona (blocks of hours, only the parent with less time counted, handoffs including at school), California (percentage of time), Minnesota and Oregon (two-year averages), New Jersey (more than 12 hours), the UK and Australian night bands [V]. Some count ordered time, others time actually used [V]. **The page's figure is a planning count.** The page already prints its counting rule and says courts and formulas count differently, which matches the sources [V]. Consider labeling the figure "share of nights in [year]" and never adding thresholds or support estimates [U].

## 2. The legal-information line

Courts publish sample schedules and calculators themselves, presented as examples or estimates, with the court deciding [V]. No unauthorized-practice action against a custody calendar or schedule tool was found; the cases found (Ohio 2014, Indiana 2018, the FTC's DoNotPay order) turned on preparing filings, individual help, or claims of replacing a lawyer [V]. The negative finding rests on a couple of searches, so a legal-database search would be more conclusive [U].

## 3. Courts and records

Courts order specific apps (Oregon form, Colorado checklist, Missouri order, a Washington contempt case) [V]. Prevalence figures come only from vendors [V]. Under federal evidence rules, a chart explaining evidence is an illustrative aid, not evidence; a printout from this page shows a pattern someone typed in, with no timestamps or integrity checks [V/U]. **Never call it court-ready, admissible, or a record.**

## 4. Safety (domestic violence and high conflict)

- NNEDV's Safety Net (2024) warns that shared schedules, contact details, and children's activities can be misused to stalk, harass, or control; it advises collecting only what's needed, plain notices, user-controlled deletion, and safety planning with advocates [V]. WomensLaw notes parents uncomfortable with an ordered app may ask the judge for a different one [V].
- **What the page exposes** [V/U]: a share link carries both names and a year of nights (future "pattern of life" data), travels through whatever app sends it, can be forwarded, and can't be withdrawn or expire, because no server is involved. The page removes the fragment from the address bar once opened; whether the original link persists in browser history or syncs to other devices hasn't been tested. The saved schedule stays in the browser, visible to anyone using it; there's no "forget" control. The calendar file carries both names. The page asks for no children's names, addresses, handover places, or times, which limits exposure.
- Any third-party script added to the page could read every shared schedule from the link, so the page must stay free of analytics and embeds [V].

## 5. Privacy

A co-parenting schedule with names is personal data but not a listed sensitive category in the laws checked; in practice it's highly sensitive because of safety [V]. "Nothing is sent anywhere" is true of what people type; it's broader than the facts overall (GitHub logs IP addresses for security; links and files leave the device when shared) [V]. Consumer privacy laws (CCPA, Virginia) apply at thresholds far above a personal static page [V]. COPPA doesn't apply to a calendar for parents [V].

## 6. Claims to avoid

Court-approved or court-accepted; legally binding or official; child-support calculator or estimate; accurate overnight percentage for court, court-ready, use in court; admissible, records, evidence, tamper-proof; no lawyer needed; the best or fairest schedule; private, secure, encrypted, or safe for domestic-violence situations; "custody percentage" (custody can mean decision-making) [V]. Safer: "A planning calendar. Your court order or parenting plan is what counts." and "Each parent's share of nights in [year], by this page's count."

## 7. Low-cost risk reducers for later (owner decisions; not done in this phase)

1. A "Forget this schedule on this device" button.
2. A hint that initials or nicknames work; optionally, share without names.
3. A one-line safety note by the share button (a link can't be taken back), possibly linking a domestic-violence technology-safety resource.
4. Never add third-party scripts, analytics, or embeds to this page.
5. Never add child names or ages, addresses, handover places or times, GPS, messaging, an exchange log, support estimates, or state-specific legal counts.
6. A print footer: "Planning view of the pattern entered. Not a court record."
7. Calendar-file advice: import into a calendar of its own; avoid shared calendars.

## 8. What would trigger heavy obligations

Accounts or cloud storage (breaks Labs' rules; security and breach duties; privacy-law thresholds; subpoenas); messaging or records (Stored Communications Act limits, custodian and certification work, integrity expectations, an abuse channel); child accounts (COPPA, amended rule effective 2025, compliance by April 2026); location or exchange check-ins (sensitive data; a known abuse vector); support calculations or state-specific outputs; generating plans or court forms; AI answers to legal questions (the DoNotPay pattern) [V].
