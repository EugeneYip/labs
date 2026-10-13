# Fluency Check: student-privacy research notes

> **Since these notes were written:** P1 of the autonomous queue (2026-10-11, commit 75c8844) reworded the DIBELS sentence (DIBELS® 8th Edition, a registered trademark of the University of Oregon, which isn't connected with the page), attributed the accuracy bands to the running-record guideline, and asked school or practice users to keep official results in their own records. Later priorities added a notice when the browser isn't saving (P4, P9), dropped the log's 2,000-check cap (P4), and show the newest 500 with "Show all" (P6). Statements below about the page describe it before those changes.

Research for product validation, not legal advice. Checked 2026-10-10. Each question is split into the **current static version** (labs.eugeneyip.net/fluency-check/, data only in the teacher's browser) and a **hypothetical standalone** with cloud sync, rosters, or colleague sharing.

## How to read the evidence

- Every claim cites a numbered source. The source list at the end gives each URL and its status: **VERIFIED** (read on the page or in the document itself), **SNIPPET** (seen only in a search-result excerpt) or **UNVERIFIED**.
- Claims resting on a SNIPPET or UNVERIFIED source say so inline.
- **(Inference)** marks reasoning from the cited sources, not something a source states.
- Where an official site blocked automated reading, the text was read on a reputable mirror (Cornell LII, california.public.law, colorado.public.law). The source list says which.
- The session's web-search budget ran out partway through. Later checks used direct reads of known primary pages. Anything not closed is listed under "Open items".

## What the current product actually does [P]

- A teacher pastes a passage, optionally types a student name and a goal, times the reading, and taps errors. The tool gives words correct per minute, accuracy, errors, self-corrections and the missed words.
- Saved checks hold a timestamp, the student field, a short passage name, the counts, WCPM, accuracy, goal and missed words (not the marked passage). They live in `localStorage` under `labs:fluency-check`, and a check in progress under `labs:fluency-check:run`. There is a per-student progress chart, CSV download and re-import, a printable marked record, a copy-summary button, and per-check delete with undo.
- No audio recording, no accounts, no analytics, and no network request carries anything the teacher types. The log says checks stay only in this browser and nothing is sent anywhere.
- The site is hosted on GitHub Pages. GitHub logs every visitor's IP address for security [63].
- The scoring guide says its rules follow common practice "as in DIBELS 8", and it links to published Hasbrouck & Tindal norms instead of reproducing them.
- Labs' own hard limits rule out a backend and accounts, so a cloud version could not be built inside Labs [P].

## Bottom line

1. **Current version:** the operator never receives student information. That keeps most vendor-side duties from being triggered: the FERPA school-official machinery, the state vendor statutes (all of them key on data provided to or collected by the operator) and COPPA (Inference, from [1][5][20][21][27][29][32][35]).
2. **But the records still matter.** In the teacher's hands, a log of named students' scores is very likely an education record once it is shared or used beyond a private memory aid. The school and teacher then carry the duties: security on the device, parents' right to inspect, and no destruction while a request is pending [1][2][9][10].
3. **The real risks today are practical.** Safari's 7-day deletion, ephemeral Chromebook sessions and Shared iPad purges can wipe records [56][59][62]. Shared devices can expose names and scores. Many districts require approval before any tool is used with student names, wherever the data is stored [5][39][40]. Wording ("FERPA compliant", "screener", DIBELS) can mislead [26][64].
4. **Cheap fixes:** a short privacy notice (Common Sense's ratings give an automatic Fail to products with no privacy policy [48]), a one-page summary for district reviewers, backup nudges plus `navigator.storage.persist()`, a hide-names option for shared screens, a one-tap "delete everything on this device", and rewording the DIBELS reference.
5. **A cloud version triggers the full stack.** School-official contracts or DPAs, state laws (NY 2-d, IL SOPPA, CT, CA SOPIPA and AB 1584, CO), breach clocks (72 hours under the standard NDPA, 30 days in IL and CT), security programs, deletion duties, no ads or profiling, accessibility conformance, COPPA if students use it, and GDPR processor terms abroad [3][22][28][29][33][35][46][51][67].
6. **Pseudonyms or initials** reduce the harm of exposure, but within a school they do not make the data non-identifiable [1][15][40].

---

## 1. FERPA: education records, sole possession, and when notes become records

### Current static version

- **Definition.** Education records are records directly related to a student and maintained by an educational agency or institution, or by a party acting for it [1]. "Record" means information recorded in any way, including computer media [1].
- **The sole-possession exclusion** covers records that meet three tests: kept in the sole possession of the maker, used only as a personal memory aid, and not accessible or revealed to anyone except a temporary substitute [1][8].
- **It is read narrowly.** The Department construes it as "memory-jogger" notes, generally kept without others knowing. Where or how a record is kept, and why it was made, do not change its status [10]. PTAC's example of a qualifying note is a reminder to talk to a student's parents about grades. Notes recording what a student told staff generally do not qualify [11].
- **When a note loses that status.** Once its contents are disclosed to anyone other than a temporary substitute, it becomes an education record [9][10]. SPPO also says sole-possession records can lose their status through the way they are used [9].
- **Applying this to Fluency Check (Inference).** A Fluency Check log is a dated, structured record of named students' WCPM, accuracy and missed words, built for tracking over time, with charts, printouts and CSV export. A teacher keeping it purely as private reminders could arguably claim sole possession. It stops qualifying as soon as the teacher:
  - shows it to a colleague, an MTSS/RTI or IEP team, a parent or the student;
  - puts a printout or CSV into a file or school system; or
  - uses it as the basis for documented decisions.

  Most fluency logs exist precisely to be acted on, so the safe product assumption is that saved checks are education records.
- **"Maintained" is unsettled.** The Department's 2006 Letter to Husk position, quoted by SPPO in 2025, is that notes and emails by district staff that identify a student and are maintained by the district or its service providers are education records [9][12].
  - The Supreme Court in *Falvo* read "maintained" as suggesting a central file or permanent secure database, and only assumed without deciding that a teacher's grade book is an education record [13].
  - A district court (*Tulare*) took a narrower view for emails. In April 2025 SPPO said it has not adopted *Tulare* and hopes to issue guidance [9].
  - (Inference) A record that lives only in one teacher's browser sits in exactly this contested zone. That uncertainty argues for caution, not for relying on the narrow reading.
- **Who carries the duty.** FERPA applies to agencies and institutions that receive Department of Education funds [4], and the Department looks to schools and districts to comply [5, p.10]. The operator of a local-only page is neither. (Inference) A private tutor not acting for a school is generally outside FERPA [4].
- **What follows for the teacher and school if these are education records.**
  - Parents (or eligible students) may inspect them within 45 days.
  - Records may not be destroyed while an inspection request is pending [2].
  - Sharing with colleagues without consent generally relies on the school-official exception: staff the school has determined, under its annual notice, to have a legitimate educational interest [5, glossary p.14].

### Hypothetical standalone (cloud sync, rosters, colleague sharing)

- Records kept by a party acting for the school are education records [1][7]. A synced log would be the school's education records held by the vendor.
- **Disclosure needs consent or an exception.** In practice that is the school-official exception. The vendor must:
  - perform a service the school would otherwise use employees for;
  - meet the criteria in the school's annual notice;
  - be under the school's direct control over use and maintenance; and
  - use the data only for authorized purposes, with no redisclosure [3][5, p.4].

  Direct control is usually set by a contract, sometimes by terms of service [5, p.4].
- **Parent access.** The vendor must help the school answer access requests within 45 days. PTAC recommends routing these through the school [5, pp.5, 9][6, #11].
- **No other uses.** No marketing, targeted ads or other secondary use of the records [5, p.5][6, #3, #7].
- **PTAC's model terms list what schools look for:**
  - data broadly defined, including metadata;
  - collection limited to what is needed;
  - no terms changes without consent;
  - subcontractors bound;
  - deletion or return when no longer needed;
  - school ownership;
  - school access on request;
  - security controls with an incident-response plan [6].
- **Colleague sharing (Inference).** Sharing among a school's own officials can fit FERPA. Sharing across schools or districts, or with parents through the tool, needs consent or another exception, and the school, not the vendor, must control it.

---

## 2. Does fully local storage reduce the vendor's obligations?

### Current static version

- **ED's own framing.** PTAC says some online services do not involve FERPA-protected information. Its example is a tool used without student log-ins, where no PII from education records is disclosed to or maintained by the provider [5, p.2]. FERPA governs PII from education records that is disclosed to providers [7, p.2]. "Disclosure" means releasing or transferring PII to a party other than the one that created or provided the record [1].
  - (Inference) If nothing reaches the operator, the school makes no disclosure to it. The operator does not need school-official status and receives nothing to which redisclosure limits could attach.
  - Caveat: PTAC's 2014 document is scoped to tools students or parents use, and excludes teacher-only administrative tools [5, p.2]. It is still ED's clearest statement on tools that receive no PII.
- **This does not end the matter for districts.** PTAC recommends these practices whether or not FERPA or PPRA applies [5, pp.7–10]:
  - inventory the tools in use;
  - have policies to evaluate and approve tools, including free and click-wrap ones;
  - teachers should not bypass approval;
  - use written agreements even when FERPA is not implicated;
  - set policies on when individual teachers may accept click-wrap terms.

  The FTC likewise advises that the school or district, not individual teachers, decide which sites are appropriate [21, N.3].
- **How districts actually treat tools that collect nothing:**
  - Jamestown (NY) leaves tools that collect no student information, and need no DPA, off its approved list [39].
  - Fairfax County (VA) says tools that collect no PII need no FERPA parental consent [42].
  - Chicago lets staff use unapproved apps for instruction as long as students don't log in [41].
  - Eastwood (OH) counts a teacher saving student PII or scores in any resource as sharing student data, which requires approval and a DPA [40].
  - (Inference) The answer a teacher gets depends on whether the reviewer understands that "local only" means the data never leaves the device.
- **What is left on the operator's side:**
  - Keep privacy and security promises true. The FTC says the FTC Act requires companies to live up to their privacy claims [26].
  - Publish a privacy policy. Common Sense rates any product without one as Fail [48].
  - Disclose that GitHub logs visitor IP addresses [63].
  - The code-trust question (Inference): the operator can change the page's code at any time, and new code could read stored data. Districts value advance notice before data practices change [6, #4][7, p.4]. The public repository and the public product log help, and a written commitment not to add data collection without notice would help more.
- **Local-only is checkable.** A Utah State Board of Education study with BYU and Internet Safety Labs tested what 100 school apps actually transmitted:
  - 44 of 85 apps with SDPC-based DPAs (52%) collected at least one data element their agreement didn't permit;
  - 61% shared data with third parties;
  - 36% shared data with advertisers [54, p.30].

  (Inference) A tool that sends nothing can invite exactly this kind of testing.

### Hypothetical standalone

- Once the operator receives names and results, every vendor-side duty in sections 1, 3, 4 and 5 applies: school-official status, contracts or DPAs, state statutes, breach notice, security programs, deletion, and possibly COPPA.

---

## 3. COPPA

### Current static version

- **COPPA's definitions turn on collection.** An "operator" is a commercial site or service that collects or maintains personal information from or about its users, or has it collected on its behalf. "Collection" means gathering personal information from a child by any means, including asking a child to submit it online, and passive tracking [20].
- **Device-only data is not collected.** In FAQ F.5, the FTC says working with personal information stored on a device and never transmitted from it is not collection [21].
- **Coverage.** COPPA covers services directed to children, and general-audience services with actual knowledge that they collect from a child [21, A.12, H.1]. Adult-focused subjects are generally outside it unless they target children [21, D.3]. Adults such as teachers uploading information about children to a general-audience site do not trigger it [21, F.4].
- (Inference) A teacher-facing page that collects nothing does not trigger COPPA.
- **Hosting logs.** Persistent identifiers such as IP addresses count as personal information [20]. But GitHub logs them for its own security [63], the page is not child-directed, and security falls under the rule's "support for internal operations" [20]. (Inference) This is low risk.
- **School consent** only matters where an operator collects from students (see below).

### Hypothetical standalone, or students using the tool

- **If students under 13 used a cloud version, the operator collects their personal information.** It then needs verifiable parental consent, or school authorization under the FTC FAQs, which is limited to the school's educational use with no other commercial purpose [21, N.1–N.2]:
  - give the school the same direct notice a parent would get;
  - the school or district, not a teacher, should decide [21, N.3];
  - schools should ask what is collected, whether it is used commercially (if so, the school cannot consent), whether the school can review and delete data, the security measures, and the retention rules [21, N.5];
  - terms of service must not shift COPPA responsibility onto the school [21, N.1][24].
- **The 2025 amended rule** (FR Doc. 2025-05904) took effect June 23, 2025, with compliance due April 22, 2026 [22]. The FTC did not codify the proposed school-authorization exception, citing possible FERPA changes, and keeps enforcing its existing guidance [22][23]. New or tightened duties [20][22][23]:
  - separate parental consent for disclosures to third parties, such as for targeted advertising;
  - a written information security program, with a named coordinator, annual risk assessments, proportionate safeguards, regular testing, an annual review, and written assurances from vendors (§312.8);
  - a written retention policy, published in the online notice, with indefinite retention banned (§312.10);
  - personal information now expressly includes biometric identifiers (such as voiceprints) and government-issued IDs.
- **The FTC's 2022 edtech policy statement** [24]:
  - students can't be required to give more data than an activity reasonably needs;
  - data collected under school authorization may be used only for the requested service, never commercially;
  - no keeping data for speculative future uses;
  - reasonable security is required even if there is no breach;
  - compliance responsibility rests on the business, not on schools or parents.
- **Students using a local-only version (Inference).** FAQ F.5 suggests there is still no collection. But a student-facing mode makes the page arguably child-directed in part, so any later sync, analytics or audio upload would become collection from children.
- **Audio is the biggest trigger.** An audio file with a child's voice is personal information under COPPA [20]. Illinois and Connecticut list voice recordings as protected student information [32][35], and the standard NDPA data schedule has a "voice recordings" line [46]. The product log lists "a recording to listen back to" as a likely request [P].
- **"COPPA certified"** can only mean membership in an FTC-approved safe-harbor program: CARU, ESRB, iKeepSafe, kidSAFE, PRIVO or TRUSTe [25].

---

## 4. State student-privacy laws

Most of these statutes reach operators only through data provided to or gathered by the operator. A local-only tool mostly falls outside them, though districts' own duties still apply.

| Law | What triggers it | Current static version (Inference unless cited) | What a cloud version would need |
|---|---|---|---|
| **California SOPIPA** (B&P §22584) [27] | "Operator" = actual knowledge the service is used primarily for K-12 and was designed and marketed for it (no collection element). Duties attach to "covered information" provided to, or gathered by, the operator. | Likely an "operator" by design, but holds no covered information, so security and deletion duties have nothing to attach to. The targeted-ad ban also covers persistent unique identifiers the operator acquires through the service [27], so keep the page free of ad tech and analytics. | Reasonable security suited to the data's sensitivity. Delete on school request (and, for some data, on request from parents or former students 18+ after unenrollment). No targeted ads, no profiling outside K-12 purposes, no sale. Disclosure only for listed purposes. Service providers bound by contract [27]. |
| **California Ed Code §49073.1** (AB 1584) [28] | District contracts for digital storage of pupil records, or software that lets the provider access, store or use pupil records | Not engaged: the provider has no access. | Contract terms: district owns and controls records; no other use; parent review and correction; security with designated, trained staff; breach notice to families; no retention after the contract; a description of FERPA compliance; no targeted ads. A noncompliant contract becomes void if not cured after notice [28]. |
| **New York Ed Law 2-d + Part 121** [29][30][31] | "Third-party contractor" = receives student data from an educational agency under a contract or written agreement. Click-wrap counts [30]. | Not a third-party contractor (receives nothing). NYSED notes that 2-d does not limit employees' administrative use of student data in their jobs [30]. Districts must still run privacy programs on the NIST Cybersecurity Framework [30]. | Contract with the Parents Bill of Rights and supplemental information; a data security and privacy plan; staff training; encryption in transit and at rest; no sale or marketing use; breach notice to the agency, with reimbursement of notification costs. Civil penalties escalate to $10,000 for repeat violations; for breach-notice failures they are the greater of $5,000 or $10 per affected person, subject to a cap. The state's chief privacy officer can also bar a contractor from data for up to five years [29]. Part 121 sets a 7-calendar-day limit to notify the agency (**SNIPPET** [31]). |
| **Illinois SOPPA** (105 ILCS 85) [32][33][34] | Operator (actual knowledge, K-12 design and marketing). "Covered information" = created by or provided to the operator, or gathered by it [32]. | No covered information, so the written-agreement duty (owed by an operator that "seeks to receive" covered information from a school) is not triggered. But every school must have a policy on which employees may enter agreements with operators, and agreements made in violation of the Act are void [34]. | Written agreement before any transfer (click-wrap allowed) listing data categories, a FERPA school-official statement, breach-cost allocation and a deletion timeline. Security meeting industry standards; breach notice to the school within 30 days; deletion on request; published privacy terms; a list of third parties receiving the data, updated twice a year [33]. Schools post agreements within 10 business days and notify parents within 30 days of a breach [34]. |
| **Connecticut** §§10-234aa–gg [35] | "Operator" must collect, maintain or use student information. Boards must sign a contract whenever they share or give access to student information. | Arguably not an "operator" at all; no contract duty. | Contract with ten required terms (data not the contractor's property; deletion process; use limits; parent review and correction; security; breach procedure; no retention after the contract; FERPA; Connecticut law; severability). Security in line with federal HHS breach guidance and HIPAA technical safeguards. Breach notice within 30 days for student information, 60 days for directory information, records or content. The board tells parents within 2 business days and posts contracts within 5 business days [35]. |
| **Colorado** (C.R.S. 22-16) [36][37][38] | "School service" must be designed for K-12, used at a teacher's direction, and collect, maintain or use student PII. An "on-demand provider" works on standard, non-negotiable terms [36]. | Gray area: the operator does not collect or maintain data, though the page's code processes PII on the teacher's device. Districts must post, where practicable, the on-demand providers their staff use [37]. | On-demand provider duties: no sale, no targeted ads, no profiling beyond authorized purposes, and a comprehensive information security program. Districts may stop using a non-compliant provider, publish its name and notify CDE [37][38]. Contract providers must also destroy data on request and at the end of the contract [38]. |

(Inference) Pattern for a cloud version: a signed agreement before any data flows, published contracts, security programs measured against industry standards, breach clocks from about a week to 60 days, deletion on request, and bans on ads, profiling and sale.

---

## 5. District practice: independent tools, vetting and formal adoption

### Current static version

- **ED and the FTC both recommend district-level approval,** including for free and click-wrap tools [5, pp.7–10][21, N.3]. PTAC's example: a teacher signs up students for an unvetted app, and the district blocks it and negotiates deletion [5, p.11].
- **District examples:**
  - Jamestown (NY): staff may not share student names or other information with any provider missing from the approved list. Tools that collect no student information are not on that list [39].
  - Eastwood (OH): every tool that shares student data, including a teacher saving names or scores in a resource, must be district-approved with a DPA. A "yellow" category marks usage-limited tools, usually teacher-only [40].
  - Chicago: apps are approved, in process, or unapproved. Unapproved apps are allowed for instruction if students don't log in [41].
  - Fairfax County (VA): central review under Regulation 3008; parental consent for non-contracted tools that collect student information; none needed for tools that collect no PII [42].
  - Oshkosh (WI), personal devices: student PII may not be kept on staff personal devices (see section 6) [43].
  - More examples seen only in search snippets: TTSD (OR) requires a DPA for resources with student log-ins; Groton requires approval for every resource; River Falls (WI) and San Francisco USD run formal review processes (**SNIPPET** [44]).
- **State law can bind individual teachers.** Illinois limits who may enter agreements with operators, and unauthorized agreements are void [34]. New York treats click-wrap acceptance as an agreement subject to 2-d [30].
- (Inference) For a tool that collects nothing, the likely outcome ranges from "fine, no DPA needed" (Jamestown, Fairfax, Chicago) to "submit a request first" (Eastwood-style rules). A one-page reviewer summary makes the first outcome more likely. If a district insists on paper, the standard NDPA's data schedule (Exhibit B) has a "None" row for providers that collect no student data [46].
- **Vetting ecosystems:**
  - The SDPC registry shows 233,924 active DPAs covering 15,900 apps, with 35 state alliances [45].
  - Common Sense rates products Pass, Warning or Fail. Pass requires no sale of data, no third-party tracking or marketing, no profiling and no targeted ads; Fail means no privacy policy [48].
  - 1EdTech's TrustEd Apps vets products against a privacy rubric (11,000+ products) and offers self-assessment rubrics for data privacy, security, generative-AI data and accessibility, plus a directory. Its management suite is a member benefit [49].
  - The Utah study shows districts beginning to test what apps actually send [54].

### Hypothetical standalone: what formal adoption usually requires

- **A DPA, often the SDPC NDPA (v2.2)** [46]:
  - the vendor acts as a school official under the district's direct control;
  - student data belongs to the district;
  - help with parent access within 30 days;
  - no sale or disclosure, and advertising limits;
  - an annual security audit, with a copy available to the district;
  - a recognized cybersecurity framework from Exhibit F (GESS, NIST CSF, NIST 800-53 or 800-171, ISO 27000, CIS Controls, CMMC);
  - breach notice within 72 hours, and a written breach-response plan;
  - disposal within 60 days of a request or of termination;
  - state add-ons in Exhibit G.
- **GESS** is SDPC's crosswalk of security controls for education technology, with a self-assessment tool [47].
- **SOC 2.** An AICPA attestation by CPAs covering security, availability, processing integrity, confidentiality and privacy [52]. It is not on the NDPA's framework list [46]. How often districts require it: **UNVERIFIED**.
- **HECVAT.** EDUCAUSE's higher-education security questionnaire. Its current version, whether a "Lite" edition still exists, and how much K-12 uses it: **UNVERIFIED** (the site blocked automated reading) [53].
- **Accessibility.** An Accessibility Conformance Report on ITI's VPAT 2.5Rev (April 2025) [50]. The ADA Title II rule requires WCAG 2.1 AA for content and apps that public schools provide, including through third-party arrangements. An interim final rule of April 20, 2026 moved compliance dates to April 26, 2027 (populations of 50,000+) and April 26, 2028 (smaller entities) [51].
- (Inference) A cloud version means a district sales and procurement cycle. Teacher-led, bottom-up adoption collides with approval policies [5][39][40], Illinois' void-agreement rule [34] and New York's click-wrap rule [30].

---

## 6. Shared devices and personal devices

### Current static version

- **Where the data lives (Inference).** Saved checks sit in one browser profile on one device. Anyone using that same profile can open the page and see every name, score and missed word. Chrome sync's list of synced data (bookmarks, passwords, history and so on) does not include site data [60].
- **Shared Chromebooks.** With ephemeral mode on (`DeviceEphemeralUsersEnabled`), the session profile is deleted after sign-out, and unsynced changes are lost [59]. (Inference) On those devices the log disappears at sign-out. On a shared signed-in session, it is visible to the next user.
- **Shared iPad (Apple School Manager).**
  - Each user gets a private, credential-protected storage volume.
  - When space runs short, the system deletes an earlier user's local data only after that data has synced to iCloud.
  - Temporary (guest) sessions don't sync, and their data is deleted at sign-out [61][62].
  - Whether Safari website data, which is where `localStorage` lives, is part of what syncs is not documented: **UNVERIFIED**. Treat it as at risk.
- **Personal devices.** Some district policies forbid keeping student PII on staff personal devices, require encryption of other confidential data, and say staff messages containing student PII can be education records (Oshkosh Policy 7530.02) [43]. PTAC recommends encrypting mobile devices that hold sensitive data, under a strict device-use policy [16]. (Inference) A teacher using Fluency Check on a personal phone may break such a policy even though the tool itself sends nothing.
- **Private browsing.** Data is usually deleted when the private session ends [58].
- **Printouts.** Printed marked records carry the same data and need physical security [16].

### Hypothetical standalone

- (Inference) Cloud sync fixes device-loss data loss but adds new risks: account credentials on shared devices, session timeouts, and remote compromise. DPAs put the duty to protect credentials on the district [46, §3.3], so the product would need short sessions and easy sign-out.

---

## 7. Browser storage clearing and record retention

### Current static version

- **Safari's 7-day rule.** WebKit deletes all script-writable storage, including `localStorage` and IndexedDB, after seven days of Safari use without user interaction (a click or tap) on the site [56][58].
  - Home Screen web apps keep their own count of days of use, and WebKit does not expect their first-party data to be deleted [56].
  - (Inference) Merely opening the page may not reset the clock; a tap does.
- **Eviction under storage pressure.** Browsers delete whole sites' data, least recently used first, unless the site has persistent storage [57][58]. `navigator.storage.persist()` is granted by browser heuristics, such as being opened as a Home Screen web app, and persistent mode can exempt a site from eviction [57]. Whether it also overrides the 7-day rule is not stated [57].
- **Retention rules.**
  - FERPA imposes no general retention duty, except no destruction while a request to inspect is pending [14][2].
  - State schedules govern. For example, the Wisconsin schedule followed by the Middleton district requires keeping emails seven years [9].
  - IDEA requires IEPs to say how progress toward goals will be measured and when progress reports go to parents [18]. Agencies must destroy IEP-related PII on parents' request once it is no longer needed, though a basic permanent record may be kept [19].
- **Implications (Inference).** If teachers use Fluency Check for MTSS or IEP progress monitoring, browser deletion could erase the only copy of data behind required progress reports. A wiped log during a pending parent request could look like destruction. Fluency Check should not be the system of record: the product should push results into the district's own systems (CSV import, printout in the file) and say so plainly.

### Hypothetical standalone

- Durability improves, but the vendor takes on retention and destruction duties: a written retention policy if children's data is involved [22]; disposal within 60 days and help with parent access under the NDPA [46]; deletion on request under SOPIPA, SOPPA and Connecticut law [27][33][35]; and no retention after the contract under AB 1584 [28].

---

## 8. Do optional pseudonyms or initials materially reduce risk?

### Current static version

- **FERPA's PII is broad.** It covers indirect identifiers and any information linked or linkable to a student that would let a reasonable person in the school community identify the student [1][11]. PTAC states that simply removing direct identifiers "DOES NOT constitute adequate de-identification" [15]. Indirect identifiers, metadata, and even aggregate information can be PII [7]. Eastwood's staff guidance lists first name plus last initial as PII [40].
- (Inference) In a class of about 25, initials plus the teacher and dates will often identify a student to anyone in the school. A private code list known only to the teacher reduces exposure to outsiders (a lost device, someone glancing at the screen), but the records stay PII within the school. Never call them "anonymous".
- COPPA's list of personal information uses first and last name [20], but COPPA isn't triggered here anyway.
- **Net effect:** a real reduction in harm if the data is exposed, especially on shared screens, but no change to the data's legal status. The cost is extra work for the teacher (keeping the key, matching CSVs to rosters).

### Hypothetical standalone

- Pseudonymous data in the cloud would still be covered. Illinois' covered information includes material "linked to" PII [32], and the NDPA's student data includes IDs and any metadata not stripped of identifiers [46]. Coded de-identified records are allowed under FERPA only for research, under strict conditions [3][15]. Pseudonyms would not avoid DPAs; they would only reduce breach severity.

---

## 9. Claims to avoid, and DIBELS and Acadience

| Avoid | Why | Say instead |
|---|---|---|
| "FERPA compliant" or "FERPA certified" | FERPA duties sit with schools [5, p.10][7]. No federal FERPA certification program was found (**UNVERIFIED**; search budget ran out). | "Student names and results are saved only on your device. We never receive them, so using Fluency Check doesn't disclose records to us." |
| "COPPA compliant" or "COPPA certified" | "Certified" implies membership in an FTC-approved safe harbor [25]. "Compliant" implies collection that doesn't happen. | "Fluency Check collects no personal information from anyone, including children." |
| "Secure", "encrypted", "anonymous", "100% private" | The FTC Act requires living up to privacy and security claims [26]. The page does not encrypt `localStorage` [P], and initials aren't anonymous [15]. | "Saved checks are as safe as the device and browser they're on." |
| "Nothing is ever sent anywhere" (as an absolute) | GitHub logs visitor IP addresses when the page loads [63]. | "What you type is never sent to us or anyone else. Like any website host, GitHub keeps visitor IP addresses for security." |
| "Diagnostic", "screener", "dyslexia screener", "validated", "benchmark", "progress-monitoring assessment" | Research-backed tools document reliability and validity; DIBELS describes subtests used for dyslexia screening [64]. NCII rates progress-monitoring tools on reliability, validity, bias, growth sensitivity, alternate-form equivalence and decision rules [55]. Fluency Check's practice passages aren't leveled or normed [P]. State-approved screener lists: **UNVERIFIED**. | "A timer and scoring aid for oral reading checks. Use your school's passages and norms." |
| DIBELS in the product name, page title, metadata or marketing, or anything implying UO endorsement | DIBELS® is a registered trademark of the University of Oregon. UO's Educational Use Agreement grants no trademark rights without advance written agreement [64]. | If a reference stays: plain text with ® and "Fluency Check is not affiliated with or endorsed by the University of Oregon". Better: "common oral reading scoring conventions". |
| Shipping DIBELS or Acadience passages, or suggesting teachers paste them in | DIBELS terms: internal educational use only, no sale, no modification without written agreement, and the PDF is for paper or static-PDF use; UO's digital partner is Amplify (mCLASS, DIBELS Data System) [64]. Acadience® is a registered trademark; its Educational Use Agreement requires registration and allows internal educational use only, with no modification and no sale or licensing without written consent. It doesn't address electronic use [65]. | "Use passages your school is licensed to use this way." Keep the built-in practice passages original. |

(Inference) The current guide line "as in DIBELS 8" is factual and low-risk, but it is the only place the page leans on a trademark. Rewording it, or adding attribution and non-affiliation, removes the question. Linking to published norms rather than reproducing them (current practice) is right.

FTC enforcement examples often cited for edtech claims (Edmodo 2023, Chegg 2022): **UNVERIFIED**; URLs not confirmed.

---

## 10. Outside the US: GDPR and UK GDPR

### Current static version

- **Roles.** The controller decides why and how personal data is processed. A processor processes personal data on the controller's behalf. Two conditions must both hold: it is a separate entity, and it processes on the controller's behalf [66][67, para 76].
- (Inference) The operator processes none of the records, so it is not a processor. The school, with the teacher acting for it, is the controller. Independent tutors are their own controllers.
- **Supporting example.** The EDPB treats an IT contractor whose access to personal data is purely incidental as neither processor nor controller [67, para 83].
- **Device storage (UK).** PECR requires consent to store information on a user's device unless it is strictly necessary for a service the user asked for. The ICO's examples include remembering basket items and recording selections a user makes [68]. (Inference) Saving checks the teacher chooses to save fits that exception, so no consent banner is needed. Any analytics would need consent.
- The EU ePrivacy equivalent (EDPB Guidelines 2/2023) was not read: **UNVERIFIED**.

### Hypothetical standalone

- A cloud operator becomes a processor and needs an Article 28(3) contract. The EDPB's school example: a municipality using a standardized cloud service for schools must still ensure an Article 28(3) agreement, and that its instructions on storage periods and deletion are followed [67, para 84].
- Rules on transfers outside the UK and EU (GDPR Chapter V): **UNVERIFIED**, not researched.

---

## Practical product implications

### What to say (plain wording to test)

- "Your checks are saved only in this browser on this device. Fluency Check has no accounts and no server, and we never receive student names or results."
- "The page is hosted on GitHub Pages. Like any web host, GitHub records visitors' IP addresses for security. Nothing you type is part of that." [63]
- "Follow your school's rules for student information. Many districts ask that tools used with student names be approved first." [5][39][40]
- "Safari can delete saved data after a week without use. Download a CSV after each session and keep it where your school keeps student records." [56]
- "Fluency Check times and scores readings. It is not a screener, a diagnostic test, or a norm-referenced assessment." [55][64]

### What not to say

- FERPA or COPPA "compliant" or "certified"; "secure", "encrypted", "anonymous"; "screener", "diagnostic", "validated"; DIBELS-branded descriptions; "approved by districts" unless true and specific. See section 9.

### What reduces risk in the current version (all fit Labs' static limits)

1. **Publish a short privacy notice.** Cover what is stored and where, what is never sent, the GitHub IP logging, how to delete, and a promise to announce any change to data practices first [6, #4][48][63].
2. **Write a one-page summary for district reviewers.** List the data elements, where they are stored, the fact that nothing is transmitted, the hosting, how to verify it (watch network traffic while using the page) and the public source code. Offer an NDPA with Exhibit B "None" if a district asks [46][54].
3. **Back up and persist.** Request `navigator.storage.persist()` [57]; on iPad, suggest adding the page to the Home Screen [56]; show a "last downloaded" date and prompt after each session.
4. **Protect shared screens.** Add a "hide names" view and a one-tap "delete everything on this device". If a lock is added, only call it protection if the data is actually encrypted.
5. **Name field guidance.** Make the field clearly optional. If initials or codes are suggested, say they are still student information [1][15].
6. **Keep the page free of third-party scripts, analytics and fonts.** This preserves the claims above and avoids SOPIPA's persistent-identifier issue [27][48].
7. **Reword the DIBELS line, or add attribution and non-affiliation.** Never bundle, or invite pasting of, licensed passages [64][65].
8. **Accessibility.** Meet WCAG 2.1 AA and be ready to write a short ACR [50][51].

### What would trigger heavy obligations (hypothetical)

- **Any server receipt of names or results** (sync, backup, share links, roster import, emailed reports). This brings FERPA school-official contracts [3][5], state statutes [27]–[38], NDPA terms (72-hour breach notice, annual audit, a security framework, 60-day disposal) [46], and Utah-style traffic testing [54].
- **Students using it,** especially under 13 with any collection: COPPA consent or school authorization, a written security program and a written retention policy [21][22][24].
- **Audio recording:** voice recordings are personal information under COPPA and protected student data in IL, CT and the NDPA [20][32][35][46].
- **Analytics, ads or tracking pixels:** SOPIPA's ban on persistent identifiers for targeted ads, Common Sense's Pass criteria, and district network tests [27][48][54].
- **Colleague or parent sharing:** FERPA disclosure rules, with the school controlling who sees what [1][5].
- **EU or UK schools:** processor duties and an Article 28 contract [67].
- **Inside Labs:** accounts and a backend break the constitution's hard limits [P].

---

## Open items (not verified)

- **New York:** the exact Part 121 §121.10 seven-day contractor notice (SNIPPET only; NYSED and Justia pages blocked automated reading) [31].
- **FERPA certification:** whether any federal program certifies FERPA compliance (none found before the search budget ran out).
- **Shared iPad:** whether Safari website data is included in iCloud sync, and so survives a purge.
- **Screeners:** state lists of approved dyslexia and universal screeners.
- **HECVAT:** current version, and whether a "Lite" edition still exists [53].
- **SOC 2:** how often K-12 districts require a SOC 2 report from cloud vendors.
- **FTC cases:** Edmodo (2023) and Chegg (2022) enforcement details.
- **EU ePrivacy:** EDPB Guidelines 2/2023 on Art. 5(3), and GDPR international-transfer rules.

---

## Sources

Status after each entry. All pages checked 2026-10-10.

**Federal: FERPA and ED guidance**

1. 34 CFR §99.3 (definitions), Cornell LII mirror. https://www.law.cornell.edu/cfr/text/34/99.3. VERIFIED (official eCFR, https://www.ecfr.gov/current/title-34/subtitle-A/part-99/subpart-A/section-99.3, blocked automated access).
2. 34 CFR §99.10 (45-day access; no destruction while a request is pending). https://www.law.cornell.edu/cfr/text/34/99.10. VERIFIED.
3. 34 CFR §99.31 (school-official exception; de-identified data; research record codes). https://www.law.cornell.edu/cfr/text/34/99.31. VERIFIED.
4. 34 CFR §99.1 (which institutions FERPA covers). https://www.law.cornell.edu/cfr/text/34/99.1. VERIFIED.
5. PTAC, *Protecting Student Privacy While Using Online Educational Services: Requirements and Best Practices* (PTAC-FAQ-3, Feb 2014). https://studentprivacy.ed.gov/resources/protecting-student-privacy-while-using-online-educational-services-requirements-and-best. PDF: https://studentprivacy.ed.gov/sites/default/files/resource_document/file/Student%20Privacy%20and%20Online%20Educational%20Services%20%28February%202014%29_0.pdf. VERIFIED (full PDF read; page numbers cited).
6. PTAC, *Model Terms of Service* (PTAC-FAQ 4, Jan 2015, rev. Mar 2016). https://studentprivacy.ed.gov/resources/protecting-student-privacy-while-using-online-educational-services-model-terms-service. PDF: https://studentprivacy.ed.gov/sites/default/files/resource_document/file/TOS_Guidance_Mar2016.pdf. VERIFIED.
7. PTAC, *Responsibilities of Third-Party Service Providers under FERPA* (PTAC-FAQ-5, Aug 2015). https://studentprivacy.ed.gov/sites/default/files/resource_document/file/Vendor%20FAQ.pdf. VERIFIED.
8. SPPO FAQ, "What records are exempted from FERPA?" https://studentprivacy.ed.gov/faq/what-records-are-exempted-ferpa. VERIFIED.
9. SPPO, Letter of Finding to Middleton Cross Plains Area School District (Apr 15, 2025). https://studentprivacy.ed.gov/sites/default/files/resource_document/file/Letter%20of%20Finding%20Middleton%20Cross%20Plains%20April%202025_508_0.pdf. VERIFIED.
10. FPCO letter to Eastern Virginia Medical School on sole-possession records (Mar 17, 1999), SPPO-reformatted copy hosted by Everett Public Schools. https://docushare.everett.k12.wa.us/docushare/dsweb/Get/Document-142942/Volume%2004%2c%20Issue%2003%20-%20SPPO%20Letter%20-%20Sole%20Possession%20Exception.pdf. VERIFIED (copy; the original studentprivacy.ed.gov URL was not located).
11. PTAC, FERPA 101 transcript (PTAC-TRAN-1, Dec 2011). https://studentprivacy.ed.gov/sites/default/files/training/supporting_materials/FERPA%20101%20Transcript_0.pdf. VERIFIED.
12. SPPO, Letter to Husk (Dec 29, 2006), summary page. https://studentprivacy.ed.gov/resources/letter-husk. VERIFIED (summary page; the substantive quote was read in source 9).
13. *Owasso Indep. Sch. Dist. v. Falvo*, 534 U.S. 426 (2002), opinion of the Court. https://www.law.cornell.edu/supct/html/00-1073.ZO.html. VERIFIED.
14. SPPO FAQ on discretion to create and keep records. https://studentprivacy.ed.gov/faq/does-educational-agency-or-institution-have-discretion-over-what-education-records-it-decides. VERIFIED.
15. PTAC, *Data De-identification: An Overview of Basic Terms* (Oct 2012, updated May 2013). https://studentprivacy.ed.gov/sites/default/files/resource_document/file/data_deidentification_terms_0.pdf. VERIFIED.
16. PTAC, *Data Security: Top Threats to Data Protection* (PTAC-IB-1, Dec 2011, rev. June 2015). https://studentprivacy.ed.gov/sites/default/files/resource_document/file/Issue%20Brief%20Data%20Security%20Top%20Threats%20to%20Data%20Protection_0.pdf. VERIFIED.
17. studentprivacy.ed.gov home page. https://studentprivacy.ed.gov/. VERIFIED (lists the Aug 2026 annual notices and an Aug 10, 2026 "Inspect and Review" resource; no new FERPA rule shown).

**Federal: IDEA**

18. 34 CFR §300.320 (IEP content: progress measurement and reporting). https://www.law.cornell.edu/cfr/text/34/300.320. VERIFIED.
19. 34 CFR §300.624 (destruction of information). https://www.law.cornell.edu/cfr/text/34/300.624. VERIFIED.

**Federal: COPPA and FTC**

20. 16 CFR §312.2 (COPPA definitions, including the 2025 amendments), Cornell LII. https://www.law.cornell.edu/cfr/text/16/312.2. VERIFIED.
21. FTC, *Complying with COPPA: Frequently Asked Questions* (A.12, D.3, F.4, F.5, H.1, N.1–N.5). https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions. VERIFIED (page dated July 2020, with a Jan 2025 edit note; it notes the Rule was amended Apr 22, 2025).
22. FTC final rule amending COPPA, Federal Register, Apr 22, 2025 (FR Doc. 2025-05904). https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm. VERIFIED (dates; school authorization not finalized; §312.8 and §312.10 text).
23. FTC press release, Jan 16, 2025. https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data. VERIFIED.
24. FTC, *Policy Statement on Education Technology and COPPA* (May 19, 2022). https://www.ftc.gov/legal-library/browse/policy-statement-federal-trade-commission-education-technology-childrens-online-privacy-protection. PDF: https://www.ftc.gov/system/files/ftc_gov/pdf/Policy%20Statement%20of%20the%20Federal%20Trade%20Commission%20on%20Education%20Technology.pdf. VERIFIED.
25. FTC, COPPA Safe Harbor Program (list of approved programs). https://www.ftc.gov/enforcement/coppa-safe-harbor-program. VERIFIED.
26. FTC, Privacy and Security business guidance. https://www.ftc.gov/business-guidance/privacy-security. VERIFIED.

**State laws**

27. Cal. Bus. & Prof. Code §22584 (SOPIPA), california.public.law mirror (marked updated Jan 1, 2025). https://california.public.law/codes/business_and_professions_code_section_22584. VERIFIED (official leginfo, https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=BPC&sectionNum=22584, returned 403).
28. Cal. Educ. Code §49073.1 (AB 1584), california.public.law mirror. https://california.public.law/codes/education_code_section_49073.1. VERIFIED (mirror).
29. N.Y. Educ. Law §2-d. https://www.nysenate.gov/legislation/laws/EDN/2-D. VERIFIED.
30. NYSED, Frequently Asked Questions for DPOs. https://www.nysed.gov/data-privacy-security/frequently-asked-questions-dpos. VERIFIED (read via direct download).
31. 8 NYCRR §121.10, Justia copy. https://regulations.justia.com/states/new-york/title-8/chapter-ii/subchapter-e/part-121/section-121-10/. SNIPPET (page blocked; the 7-calendar-day contractor notice was seen only in a search excerpt).
32. 105 ILCS 85/5 (SOPPA definitions). https://www.ilga.gov/Documents/legislation/ilcs/documents/010500850K5.htm. VERIFIED.
33. 105 ILCS 85/15 (operator duties). https://www.ilga.gov/Documents/legislation/ilcs/documents/010500850K15.htm. VERIFIED.
34. 105 ILCS 85/26 and 85/27 (school prohibitions and duties). https://www.ilga.gov/Documents/legislation/ilcs/documents/010500850K26.htm and https://www.ilga.gov/Documents/legislation/ilcs/documents/010500850K27.htm. VERIFIED.
35. Conn. Gen. Stat. §§10-234aa to 10-234gg (chapter 170). https://www.cga.ct.gov/current/pub/chap_170.htm. VERIFIED.
36. C.R.S. §22-16-103 (definitions), colorado.public.law mirror. https://colorado.public.law/statutes/crs_22-16-103. VERIFIED (mirror).
37. C.R.S. §22-16-107 (district duties; on-demand providers), colorado.public.law mirror. https://colorado.public.law/statutes/crs_22-16-107. VERIFIED (mirror).
38. C.R.S. §22-16-109 and §22-16-110, colorado.public.law mirror. https://colorado.public.law/statutes/crs_22-16-109 and https://colorado.public.law/statutes/crs_22-16-110. VERIFIED (mirror).

**District practice and vetting**

39. Jamestown Public Schools (NY), Approved Digital Resources. https://www.jpsny.org/departments/information-services/student-data-privacy/approved-digital-resources. VERIFIED.
40. Eastwood Local Schools (OH), staff Digital Resources & Data Privacy. https://www.eastwoodschools.org/staff/data-privacy. VERIFIED.
41. Chicago Public Schools, allowable apps notice (Oct 23, 2023). https://www.cps.edu/media/community-updates/allowable-apps/. VERIFIED.
42. Fairfax County Public Schools, Digital Resources. https://fcps.edu/resources/technology/digital-resources. VERIFIED.
43. Oshkosh Area School District (WI), Policy 7530.02, Staff Use of Personal Communication Devices (NEOLA). https://files.neola.com/oshkosh-wi/search/policies/po7530.02.htm. VERIFIED.
44. Other district examples seen only in search excerpts: TTSD (OR), https://ticket.ttsd.k12.or.us/support/solutions/articles/19000001224; Groton, https://www.grotonschools.org/fs/pages/1456; River Falls (WI), https://www.rfsd.k12.wi.us/departments/technology.cfm; San Francisco USD, https://www.sfusd.edu/es/node/7482. SNIPPET.
45. Student Data Privacy Consortium (A4L), home page. https://privacy.a4l.org/. VERIFIED (figures as displayed on 2026-10-10).
46. SDPC, National Data Privacy Agreement, Standard v2.2 (web version, marked "for information, not for use"). https://files.a4l.org/privacy/NDPA/NDPA_v2-2_STANDARD_WEB.pdf. VERIFIED.
47. SDPC, Global Education Security Standard (GESS). https://sdpc.a4l.org/gess/. VERIFIED.
48. Common Sense Media, privacy ratings explainer (updated July 17, 2025), https://www.commonsensemedia.org/kids-action/articles/protecting-kids-digital-privacy-is-now-easier-than-ever, and Common Sense Privacy Program, https://privacy.commonsense.org/. VERIFIED.
49. 1EdTech, TrustEd Apps. https://www.1edtech.org/program/trustedapps. VERIFIED.
50. ITI, Voluntary Product Accessibility Template (VPAT). https://www.itic.org/policy/accessibility/vpat. VERIFIED.
51. U.S. DOJ, ADA Title II web and mobile accessibility rule fact sheet (includes the Apr 20, 2026 interim final rule). https://www.ada.gov/resources/2024-03-08-web-rule/. VERIFIED.
52. AICPA & CIMA, SOC 2. https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2. VERIFIED.
53. EDUCAUSE, HECVAT. https://www.educause.edu/hecvat. UNVERIFIED (403 on every attempt).
54. Utah State Board of Education, BYU and Internet Safety Labs, *Utah EdTech App Data Collection and Sharing, 2023–25 Investigation*, p.30. https://schools.utah.gov/studentdataprivacy/files/Utah%20EdTech%20App%20Data%20Collection%20and%20Sharing%20-%202023-25%20Investigation.pdf. VERIFIED. Coverage: Malwarebytes, Aug 26, 2026, https://www.malwarebytes.com/blog/privacy/2026/08/popular-school-apps-may-be-sharing-student-data-with-advertisers. VERIFIED.
55. National Center on Intensive Intervention, Academic Progress Monitoring Tools Chart (updated Nov 2024). https://charts.intensiveintervention.org/aprogressmonitoring. VERIFIED.

**Browsers and devices**

56. WebKit, "Full Third-Party Cookie Blocking and More" (Mar 24, 2020). https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/. VERIFIED.
57. WebKit, "Updates to Storage Policy" (Aug 10, 2023). https://webkit.org/blog/14403/updates-to-storage-policy/. VERIFIED.
58. MDN, Storage quotas and eviction criteria. https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria. VERIFIED.
59. Google Chrome Enterprise Help, Ephemeral mode. https://support.google.com/chrome/a/answer/3538894?hl=en. VERIFIED.
60. Google Chrome Help, Sign in and sync in Chrome. https://support.google.com/chrome/answer/165139?hl=en. VERIFIED (site data is absent from the list of synced data).
61. Apple Platform Deployment, Shared iPad overview. https://support.apple.com/guide/deployment/dep9a34c2ba2/web. VERIFIED.
62. Apple Platform Security, Shared iPad. https://support.apple.com/guide/security/secd99f373ef/web. VERIFIED.
63. GitHub Docs, "What is GitHub Pages?", Data collection section. https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages. VERIFIED.

**Assessments and trademarks**

64. University of Oregon DIBELS site: home page (trademark notice), https://dibels.uoregon.edu/; About DIBELS, https://dibels.uoregon.edu/about-dibels; Testing Materials and Educational Use Agreement, https://dibels.uoregon.edu/materials. VERIFIED.
65. Acadience Learning: Acadience Reading page, https://acadiencelearning.org/acadience-reading; Policies (trademark notice), https://acadiencelearning.org/policies; Resource Hub with the Acadience Educational Use Agreement, https://acadiencelearning.org/resource-hub/?category=product&product=acadience-reading. VERIFIED.

**International**

66. ICO, "What are controllers and processors?" https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/controllers-and-processors/controllers-and-processors/what-are-controllers-and-processors/. VERIFIED.
67. EDPB, Guidelines 07/2020 on the concepts of controller and processor (v2.0, adopted July 7, 2021), paras 76 and 82–84. https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-072020-concepts-controller-and-processor-gdpr_en. PDF: https://www.edpb.europa.eu/system/files/documents/2023-10/EDPB_guidelines_202007_controllerprocessor_final_en.pdf. VERIFIED.
68. ICO, guidance on storage and access technologies, "What are the exceptions?" (updated Apr 29, 2026), https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/; main page, https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/. VERIFIED.

**Internal**

P. Labs repository, read locally: `src/experiments/fluency-check/` (`index.tsx`, `Log.tsx`, `model.ts`, `samples.ts`), `PRODUCT_LOG.md` (2026-10-09 and 2026-10-10 Fluency Check entries), and `FACTORY_CONSTITUTION.md` §2 hard limits. VERIFIED.
