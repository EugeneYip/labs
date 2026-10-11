# Risk and compliance: Fluency Check

Winner Validation Phase 1 (research 2026-10-10 and 11). **Not legal advice.** The aim is practical product implications, with sources in `notes/privacy-notes.md` (68 numbered sources, mostly primary: 34 CFR Part 99, Department of Education privacy guidance, FTC, state statutes, district policies, the Student Data Privacy Consortium, WebKit). The privacy research thread flagged four small precision issues in its own notes about state-law details (New York penalties, Illinois list frequency, one data-agreement label, one overstated "only"), so this file stays general on those points. Labels: **[V]** read on the source; **[S]** snippet or secondary; **[U]** unverified or inference.

## Summary

| Area | Current Labs version (static, local only) | Hypothetical standalone with cloud sync, rosters, or sharing |
|---|---|---|
| Who receives student data | Nobody: names and results stay in the teacher's browser; Labs never receives them [V, code] | The operator, on its servers |
| FERPA | The operator isn't a school official and receives no disclosure. The records are still likely the school's education records once a teacher shares or acts on them, so the school and teacher carry the duties [V/U] | The operator holds education records for schools: contracts under the school-official exception, direct school control, no secondary use, help with parents' access requests [V] |
| COPPA | Not triggered: nothing is collected from anyone, and the user is an adult [V/U] | Triggered if children use it or if anything is collected from them; voice recordings count as personal information [V] |
| State student-privacy laws (e.g., California SOPIPA, New York 2-d, Illinois SOPPA) | Key on data provided to or collected by the operator, so largely not triggered [U, from statute texts] | Apply in full: data agreements, security programs, breach notification within days, deletion duties, no ads or profiling [V] |
| District rules | Vary: some districts need no approval for tools that collect nothing; others require approval before student names go into any tool [V] | A district sales and procurement cycle: data privacy agreements (usually the national model), security frameworks, accessibility reports [V] |
| Data loss | Real: Safari's seven-day cap on script-writable storage (after seven days of Safari use without interaction with the site), ephemeral Chromebook sessions, shared-iPad purges, private browsing [V] | Mostly solved, at the cost of retention and destruction duties |
| Shared and personal devices | The next user of the same browser can see every name and score; some districts forbid student information on personal devices [V] | Credentials on shared devices; remote breach risk |

**The headline:** local-only storage removes most vendor-side obligations, which is a genuine structural advantage, and it keeps the product inside Labs' rules. It does not remove the school's or teacher's obligations, and it introduces data-loss and shared-device risks that a teacher may not notice.

## 1. FERPA

- **Education records** are records directly related to a student and maintained by a school or a party acting for it, in any medium (34 CFR 99.3) [V].
- **Sole-possession notes** are excluded only if kept by their maker alone, used only as a personal memory aid, and shown to nobody but a temporary substitute [V]. The Department reads this narrowly, and notes lose the exclusion once shared or used beyond memory [V].
- **Applied to Fluency Check** [U, inference from the sources]: a dated log of named students' WCPM, accuracy, and missed words, with charts, printouts, and CSV export, exists to be acted on. Once a teacher shows it to a colleague, an intervention or IEP team, or a parent, files a printout, or bases a decision on it, it's an education record. **Product assumption: saved checks are education records.**
- **"Maintained" is unsettled.** The Supreme Court only assumed a teacher's grade book was an education record (*Falvo*), and the Department said in April 2025 that it hasn't adopted a narrower lower-court reading [V]. A record living only in one teacher's browser sits in that contested zone, which argues for caution [U].
- **Who carries the duty:** schools that receive Department of Education funds, not the operator of a page that receives nothing. A private tutor not acting for a school is generally outside FERPA [V/U].

## 2. Does local-only storage reduce obligations?

- **Yes, on the vendor side.** The Department's own guidance says some online services don't involve FERPA-protected information, for example when no personal information from education records is disclosed to or kept by the provider [V]. If nothing reaches Labs, there's no disclosure to it and nothing to which re-disclosure limits could attach [U].
- **No, on the district side.** Federal guidance recommends districts approve tools, including free and click-through ones, whether or not FERPA applies, and the FTC advises that schools, not individual teachers, decide [V]. District practice varies: Jamestown (NY) and Fairfax County (VA) need nothing for tools that collect no student information; Chicago allows unapproved tools when students don't log in; Eastwood (OH) treats a teacher saving student names or scores in any resource as sharing data that needs approval and an agreement [V].
- **What remains for Labs:** keep every privacy statement true (the FTC Act requires it) [V]; note that GitHub, as host, logs visitors' IP addresses [V]; and recognize that whoever controls the page could change its code, so a public commitment to announce any change in data practices would build trust [U]. A Utah study found 52% of school apps with data agreements collected data their agreement didn't permit [V]. A tool that sends nothing can invite exactly that kind of testing.

## 3. COPPA

Not triggered by the current version: the operator collects nothing, and the user is an adult teacher [V/U]. It would be triggered by a standalone that lets children use it or collects anything from them; voice recordings are personal information under COPPA [V].

## 4. Shared devices, personal devices, and data loss

- **Shared browser profile:** anyone using it can open the page and see every saved name, score, and missed word [U].
- **Shared Chromebooks with ephemeral sessions:** the profile, and the log, are deleted at sign-out [V].
- **Shared iPad (Apple School Manager):** private storage per user; whether Safari's website data survives a purge isn't documented, so treat it as at risk [V/U].
- **Personal devices:** some district policies forbid keeping student information on staff personal devices (e.g., Oshkosh, WI) [V]. A teacher could break such a policy even though Fluency Check itself sends nothing [U].
- **Safari's seven-day cap:** WebKit's Intelligent Tracking Prevention may remove a site's script-writable storage (including the localStorage Fluency Check uses) after seven days of Safari use without the user interacting with the site, such as a tap or click. Home Screen web apps are treated differently: they keep their own count of days of use, and WebKit says they're exempt from the normal first-party seven-day cap [V]. It's a possibility, not a schedule: Safari doesn't always delete data after seven days. Fluency Check now says so (since 2026-10-10).
- **Record retention:** FERPA has no general retention rule, but records can't be destroyed while a parent's request to inspect them is pending, and IEPs must state how progress is measured and reported [V]. If a teacher used Fluency Check as the only copy of IEP or intervention progress data, browser deletion could erase what required reports depend on [U]. **Fluency Check must not be anyone's system of record**; results belong in the school's own records (CSV, printouts).

## 5. Pseudonyms and initials

FERPA's personal information includes indirect identifiers; removing names alone isn't de-identification, and first name plus last initial counts as identifying in at least one district's guidance [V]. In a class of 25, initials plus dates will usually identify a child to anyone at the school [U]. Initials or private codes reduce harm if a screen or device is exposed, but don't change the data's legal status, and must never be described as anonymous.

## 6. Claims to avoid, and a check of the current product

| Avoid | Why |
|---|---|
| "FERPA compliant" or "certified", "COPPA compliant" or "certified" | Duties sit with schools; "certified" implies an FTC safe-harbor membership [V] |
| "Secure", "encrypted", "anonymous", "100% private" | The page doesn't encrypt browser storage; initials aren't anonymous; the FTC requires claims to be true [V] |
| "Nothing is ever sent anywhere", as an absolute | GitHub logs visitors' IP addresses when the page loads [V] |
| "Screener", "diagnostic", "validated", "progress-monitoring assessment", "benchmark" (as claims about the tool) | Validated tools document reliability, validity, and equivalent forms; Fluency Check's sample passages aren't leveled or normed [V] |
| DIBELS in a name, title, or marketing, or anything implying University of Oregon endorsement | DIBELS is a registered trademark; the licence grants no trademark rights [V] |
| Shipping DIBELS or Acadience passages, or inviting teachers to paste them in | DIBELS: schools and districts only, internal use, no modification, electronic use only as a static PDF; Amplify is the digital partner [V, rechecked 2026-10-11]. Acadience: internal use, no modification [V] |

**Current product check (2026-10-11):** the page makes none of these claims. It says results stay "on this device only", that saved checks are "only in this browser, and nothing is sent anywhere" (true of what the teacher types), points to "your program's benchmarks" or the published Hasbrouck–Tindal norms rather than reproducing them, says the samples aren't leveled or normed, and states "These rules follow common practice, as in DIBELS 8", a factual comparison the workflow research verified against the DIBELS 8 text. **No serious regression or harmful factual claim was found, so the public product is unchanged in Phase 1.** Wording to review later, with the owner's approval:
- the DIBELS sentence: reword to "common scoring conventions", or add the registered mark and a non-affiliation note;
- the accuracy bands (95% and 90%) come from the reading-inventory tradition, while DIBELS 8 uses 96% and 91% as risk cutoffs from mid-grade 2; saying "from the reading-inventory tradition, not DIBELS 8's cutoffs" would prevent confusion in DIBELS schools;
- a short line that results should also go into the school's own records.

## 7. Measurement and validity risks

- **Non-equivalent passages:** trends from teacher-chosen passages are noisy (text differences can exceed several weeks of growth) [V/U]. The chart can mislead if read like a progress-monitoring graph.
- **No aimline, trend line, or decision rules:** official decision rules need 6–8 or more points and a sloped goal line [V]. Fluency Check's goal is a flat number.
- **Misuse as a screener:** WCPM alone doesn't diagnose (Hasbrouck's "thermometer" comparison) [V]; the page already says one check is a snapshot, not understanding.
- **Scoring agreement:** DIBELS' fidelity standard is within two words of an expert scorer [V via workflow notes]; no study of Fluency Check's agreement exists.

## 8. Other product risks

- **Brand collision** with UFLI's "Fluency Checks" (same audience, same activity) and McGraw Hill's use of the phrase; matters only for a standalone [V].
- **Hosting dependency:** GitHub Pages hosts it free; a change in GitHub's terms would affect all of Labs [U].
- **Accessibility:** the ADA Title II rule requires public schools' web content and apps, including third-party ones, to meet WCAG 2.1 AA, with compliance dates moved to April 2027 (larger entities) and April 2028 (smaller ones) by an April 2026 interim rule [V]. A school adopting a tool formally would ask for an accessibility conformance report [V]. Labs' own standard already requires keyboard use and readable contrast; no formal audit has been done.
- **Teacher trust in automation:** the 2026 backlash against AI voice recording is a tailwind for "nothing recorded" [V], but the affected districts moved to approved tools, not standalone ones [V].

## 9. What would trigger heavy obligations (standalone only)

Any server receiving names or results (sync, backup, share links, roster import, emailed reports); students using it; audio recording; analytics, ads, or tracking; colleague or parent sharing; EU or UK schools as customers (a processor contract under GDPR Article 28) [V]. Each of these brings data agreements, security frameworks, breach deadlines, deletion duties, and procurement. Inside Labs, accounts and servers are forbidden anyway.

## 10. Low-cost measures for later (owner decisions; not done in Phase 1)

All fit Labs' static rules, and none is a feature for its own sake:
1. A short privacy notice: what's stored and where, what's never sent, GitHub's IP logging, how to delete, and a promise to announce any change in data practices first. Common Sense rates products with no privacy policy as failing [V].
2. A one-page summary for district reviewers: data elements, storage location, no transmission, how to verify it by watching network traffic, public source code.
3. Backup safeguards: request persistent storage, suggest adding the page to an iPad's Home Screen, show when the CSV was last downloaded.
4. Shared-screen protection: a "hide names" view and a one-tap "delete everything on this device".
5. Name-field guidance: clearly optional; if initials or codes are suggested, say they're still student information.
6. The wording items in section 6.
