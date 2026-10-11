# Feature request hypotheses: Fluency Check

Ideas recorded during Winner Validation Phase 1 (2026-10-10 and 11). **None is to be built.** A feature request becomes evidence only when a real user needs it: they ask unprompted, or stop using the tool because it's missing. Competitors having a feature, and market signals, are context, not demand.

**Status key.** *Hypothetical*: our idea, or seen in competitors only. *Indirect*: practitioners or the market show the underlying need in public sources (see WORKFLOW_RESEARCH.md, COMPETITIVE_LANDSCAPE.md, and `notes/`), but no user of Fluency Check has asked. *Direct*: a pilot participant asked, or abandoned the tool over it. Every item below is hypothetical or indirect today: no interviews or pilot have run.

**Labs fit.** *Yes*: possible as a static, local-only feature under the Constitution. *No*: needs a server, accounts, or a keyed service, so only a standalone product could do it (Stage D in VALIDATION_PLAN.md).

**What would make it real.** Unless stated otherwise: at least 3 pilot participants raise it independently, or at least 2 stop using the tool and name it as the reason. One enthusiastic request is not enough.

## Ideas

| # | Idea | Who might need it | Status and signal | Labs fit | Main cost or risk |
|---|---|---|---|---|---|
| 1 | Student roster (a list to pick from, groups) | Interventionists and special-education staff with caseloads | Indirect: caseloads of 20+ are common; district platforms sync rosters | Yes, locally | More stored student data on the device; shared-device exposure. For the tutor beachhead (a few students), typed names may suffice |
| 2 | History across devices (sync, or backup to the user's own storage) | Anyone using more than one device, or losing Safari data | Indirect: one-browser limit; Safari's seven-day rule | Sync: No. File backup: partly exists (CSV) | A server holding student data triggers student-privacy law, district agreements, and security duties (RISK_AND_COMPLIANCE.md) |
| 3 | Passage sets (graded, equivalent passages for progress monitoring) | Tutors and teachers without a licensed passage set | **Indirect, strong market signal:** teachers pay for passages (a $20 set has 4,150 ratings; curriculum-aligned decodable sets sell), while trackers barely sell; valid progress monitoring needs equivalent forms | Yes, if passages are original or openly licensed | Writing and equating passages is real work, and would make this a content product; publishers' passages are copyrighted. A cheaper first step is #24 |
| 4 | Teacher accounts | Anyone wanting sync or sharing | Hypothetical | No | Contradicts the no-account wedge; brings data obligations |
| 5 | Benchmark tables beside each score | Teachers interpreting a score | Indirect: norms widely used; most free calculators show Hasbrouck–Tindal bands | Yes | Norms apply to standardized passages; showing them beside scores from any passage invites misreading. The page links the norms today |
| 6 | District dashboards and reports | Administrators | Hypothetical | No | A different customer and sale |
| 7 | Google Classroom or other LMS integration | Teachers in Google or Microsoft schools | Hypothetical | No (OAuth, keyed APIs) | Accounts, keys, review processes |
| 8 | PDF passage import | Teachers whose passages are PDFs | Hypothetical | Yes (in the browser) | Text extraction varies; copy and paste works |
| 9 | Audio recording of the read, for review | Teachers checking their marking; coaches | Hypothetical; Microsoft and ReadingFluency.app offer replay | Yes locally | Children's voice recordings are exactly what the 2026 backlash was about; removing "nothing recorded" would remove a wedge |
| 10 | Speech recognition to score automatically | Busy teachers | Hypothetical | No (cloud speech needs keys) | Competes with Microsoft and Google on their ground; distrust for young readers |
| 11 | Error types and miscue notes | Reading specialists, running-record users | Hypothetical | Yes | More taps while timing |
| 12 | Prosody rubric | Teachers following fluency guidance beyond rate | Hypothetical; WCPM-only skepticism exists (Shanahan) | Yes | Subjective; adds steps |
| 13 | Retell or comprehension questions | Users of systems with retell | Hypothetical | Yes | Scope creep toward a full assessment |
| 14 | Goal line, trend line, rate of improvement, decision rules | Interventionists and special-education staff | Indirect: NCII decision rules need 6–8 points and a sloped goal line; ReadingFluency.app shows rate of improvement | Yes | Decision rules imply validity that teacher-chosen passages lack |
| 15 | Median of three passages | Anyone using non-standard passages | Indirect: Hasbrouck advises averaging two or three readings of non-standard passages; ReadFluent offers it | Yes | Triples the reading time per check |
| 16 | Printable progress graph or parent report | Tutors reporting to families | Indirect: tutors report to parents; ReadFluent has a parent report | Yes | Low |
| 17 | IEP progress report export | Special-education staff | Hypothetical | Yes | Formats vary by district |
| 18 | Spanish and other languages | Bilingual programs | Hypothetical; ReadingFluency.app supports four languages | Yes | Scoring rules and norms differ by language |
| 19 | Initials or pseudonym guidance | Privacy-conscious schools and families | Indirect: reduces shared-screen exposure | Yes (typing initials already works) | Must say initials are still student information |
| 20 | Add-to-Home-Screen guidance | iPad users | Indirect: Safari's seven-day rule | Yes | Instructions only |
| 21 | Colleague sharing | Teams sharing intervention groups | Hypothetical | Partly (CSV files today) | Sharing makes the records education records with handling rules |
| 22 | Other timings (30 seconds, 2 minutes) | Early or older readers | Hypothetical | Yes | Low |
| 23 | Online-session support (showing the student a clean copy during video tutoring) | Tutors who work online | Hypothetical: online tutoring is common (Outschool's guidance), and the student must see the passage while the tutor marks privately | Yes | Test in Stage 0: if most beachhead tutors work online and this is awkward, it's a blocker, not a feature |
| 24 | Pointer to openly licensed passages (UFLI Fluency Checks) | Tutors without a legal passage source | Indirect: DIBELS excludes tutors; UFLI's are free for non-commercial use with attribution | Yes (a link and a sentence) | Implying endorsement by UFLI; name confusion with UFLI's "Fluency Checks" |
| 25 | Camera capture of a passage | Teachers with printed books | Hypothetical; Reader Meter does it | Yes, in principle | Text recognition quality; scope |
| 26 | "Hide names" view and "delete everything on this device" | Teachers on shared screens or devices | Indirect: privacy research's low-cost measures | Yes | Low |
| 27 | Request persistent storage, show the last CSV download date | Anyone relying on saved history | Indirect: browser clearing | Yes | Low; browsers decide whether to grant persistence |
| 28 | Short privacy notice and a one-page summary for district reviewers | Teachers whose districts vet tools | Indirect: Common Sense fails products with no privacy policy; some districts require review before student names go into a tool | Yes (documents) | Must stay strictly true |

## Rules for this file

- Add new ideas here, with their source (a participant code, never a name, and a date).
- Move an idea to *Direct* only with the evidence above, and record how many participants raised it.
- Building anything requires a separate owner decision. Anything marked "No" for Labs fit waits for the Stage D threshold in VALIDATION_PLAN.md.
