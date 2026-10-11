# How oral reading fluency (ORF) monitoring is actually done: workflow notes

Prepared 2026-10-10 for the Fluency Check pilot decision. The aim was to falsify the opportunity, so evidence against it is recorded with the same care as evidence for it.

## How to read these notes

- **Level tags.** (a) published assessment procedure or official guidance; (b) common classroom practice (several practitioners, or guidance written for practitioners); (c) a single school's or person's account; (ctx) context such as product facts, prices, or policy and market counts.
- **Evidence tags.** VERIFIED means read on the page or document itself. SNIPPET means seen only in search-result text. UNVERIFIED means background knowledge not confirmed in this pass.
- **Scholarly items** are named and marked "scholarly, not resolved via LibKey". No journal bibliography was built.
- **Method and limits.** Several official PDFs couldn't be parsed by the fetch tool, so their text was extracted locally from the official URL and read. Those items count as VERIFIED. Some sources couldn't be reached: old.reddit.com was blocked to automated fetching, Reading Rockets and Raz-Plus returned 403, and the California DOE mCLASS page sat behind bot protection, which was not bypassed. The session's shared web-search budget also ran out partway through. The gaps this leaves are listed near the end.

## Bottom line

1. **The core routine is standard, and Fluency Check (FC) matches it.** Every major system uses the same steps: a one-minute timed reading, a slash on each error, a bracket on the last word, and WCPM = words attempted − errors. The error rules converge too: a 3-second hesitation means the examiner supplies the word and it counts as an error; self-corrections within 3 seconds count as correct; insertions and repetitions are ignored; omissions and skipped lines are errors. FC's rules match the DIBELS 8 text (VERIFIED).
2. **In US public K–3, the official checks belong to the district or state.** Benchmark screening, and often progress monitoring too, runs on publisher passages inside systems the state or district picks. A vendor's 2026 tally puts 42 states on approved-list mandates; ExcelinEd's 2024 FAQ named only 7, because definitions and dates differ. Iowa's 2026–27 rules require approved tools for progress monitoring as well, with the data entered into the state's system. DIBELS treats any modified administration as invalid, not to be entered into a data system or compared with benchmarks. Scores from passages a teacher chooses can't be compared with benchmarks or norms.
3. **The incumbents already digitize the session, and free substitutes exist.**
   - Several district systems score on a device: mCLASS (automatic scoring with speech recognition), aimswebPlus (digital record forms), easyCBM (click-to-score online), and Acadience Learning Online.
   - In a 2025 survey of 251 educators, 75% reported digital screening formats (scholarly, not resolved via LibKey).
   - Free substitutes cover most of what FC offers:
     - Passages: DIBELS 8, Acadience, and UFLI publish passages, and UFLI's teacher forms (and likely the others') print running word counts at the end of each line.
     - easyCBM Lite: free standardized progress-monitoring passages, with graphs.
     - NCII: a free Excel graphing tool.
     - Microsoft Reading Progress: included in Microsoft 365 Education; scores any passage automatically.
4. **FC could fit where checks are informal or fall outside mandates.**
   - Curriculum-embedded checks, such as UFLI's per-unit "Fluency Checks" on decodable passages, interpreted against Hasbrouck & Tindal norms.
   - Paper-based DIBELS users.
   - Homeschool families: BJU Press tells them to print DIBELS 8 materials.
   - Tutors: Outschool tells them to time readings and chart WCPM.
   - Hasbrouck's practitioner guidance allows non-standardized passages if two or three are averaged.
5. **Design and validity gaps compared with official progress-monitoring practice.**
   - The chart has no aimline, trend line, or decision rules. NCII's rules need 6–8 data points and a sloped goal line.
   - There's no median-of-three or passage equivalence.
   - FC's 95/90 accuracy bands are not the DIBELS 8 risk cutoffs, which are 96% or higher for core support from mid-grade 2.
   - The name collides with UFLI's "Fluency Checks".
   - The DIBELS licence limits use to schools and districts and forbids modification, which complicates pasting DIBELS passages into FC.

---

## 1. Published ORF/CBM-R procedures in the main systems

### Summary

| System | Benchmark | Progress monitoring (PM) | Error rules | Scores | Mode and data | Evidence |
|---|---|---|---|---|---|---|
| DIBELS 8 (UO) | 1 passage, 60 s, beginning/middle/end of year | 20 PM forms per grade; every 2–4 weeks | 3-s hesitation = error; self-correction within 3 s = correct; insertions and repetitions ignored; skipped row = errors; stop if no words correct in line 1 | Words correct; accuracy = correct ÷ attempted | Paper + DIBELS Data System (manual entry), or mCLASS on a device | (a) VERIFIED |
| Acadience Reading K–6 | 3 passages, median; retell | Remaining passages; regular (strategic) or frequent (intensive), no numbers | Same core rules; stop rules for passage 1 | Median WCPM, errors, retell | Paper, Acadience Learning Online, mCLASS | (a) VERIFIED, PM detail SNIPPET |
| aimswebPlus (Pearson) | 2 passages averaged (SNIPPET) | 1 passage (SNIPPET) | Not verified for aimswebPlus | WRC | Digital record forms; $4.50/student/yr (reading) | (ctx) VERIFIED, procedure SNIPPET |
| FastBridge CBMreading (Renaissance) | 3 passages, median, ~5 min | Weekly recommended; 9–12 points | 3-s rule; self-correction ok (SNIPPET) | WRC, accuracy | Online platform | Mixed |
| easyCBM PRF | Fall/winter/spring at grade level | Equivalent forms; Lite is free | 3-s rule; self-correction ok; insertions not counted | Words read, errors, correct | Paper or click online | (a) VERIFIED |
| Star CBM Reading | Teacher 1:1, about 1 min | At regular intervals, no schedule given | Not verified | Correct per minute | Digital, print, or mixed | (ctx) VERIFIED |

### DIBELS 8th Edition (University of Oregon)

All points in this subsection come from the *DIBELS 8th Edition Administration and Scoring Guide, 2026 Edition*, unless noted. Level (a), VERIFIED, page numbers given.

- **Timing and materials.**
  - The reading lasts 60 seconds.
  - Materials: scoring book, student form, pen or pencil, clipboard, timer.
  - The clipboard and timer are held so the student can't see the marks.
  - The timer starts on the first word of the passage; the title doesn't count.
  - If the student doesn't say the first word within 3 s, the examiner says it, marks it wrong, and starts the timer. (p. 73)
- **What counts as an error.**
  - The examiner slashes each incorrect word.
  - The only allowed prompt is for hesitation: after 3 s the examiner gives the word and scores it incorrect.
  - Also errors: words mispronounced in context, words read out of order, omissions, and words sounded out but not blended.
  - A skipped row is crossed out and its words marked incorrect. (pp. 74–77)
- **What doesn't count as an error.**
  - Self-corrections made within 3 s count as correct; the examiner writes "SC".
  - Inserted words are ignored and earn no credit.
  - Repeated words are ignored.
  - Consistent dialect, accent, or articulation differences aren't penalized. (pp. 45, 75)
- **Discontinue rule.** If the student reads no words correctly in the first line, the examiner stops and records 0. (p. 74)
- **Scores.** The score is words read correctly in 60 s. Accuracy = words correct ÷ total words attempted × 100. (pp. 74, 88)
- **Passages.**
  - One passage per benchmark period. This is new in DIBELS 8; UO says three passages added little reliability for the extra time. (p. 19)
  - Each grade from 1 to 8 has 3 benchmark forms and 20 progress-monitoring forms. (p. 11)
- **Benchmark timing.** Benchmarks happen at the beginning, middle, and end of the year (up to three times a year). The guide sets no calendar windows; those are set locally. (pp. 6, 12)
- **Administration time.** These figures are for the whole individual benchmark battery, not ORF alone (p. 9):
  - Kindergarten: 4–6 min
  - Grade 1: 5–7 min
  - Grades 2–3: 4 min
  - Grades 4–8: 2 min, plus a 5-minute group Maze
- **Training and fidelity.**
  - Examiners must be trained. Inter-rater reliability must be established locally and rechecked at least once a year. (pp. 36, 90–91)
  - On the fidelity checklist, an examiner passes ORF scoring if their score is within 2 points of an expert's. (p. 127)
- **Standardization.** Any modification (for example, extra time or changed directions or prompts) is marked "M" on the booklet. Such scores are invalid and shouldn't be entered in a data system or compared with benchmarks or norms. (p. 48)
- **Form effects.**
  - Even DIBELS' own equated ORF forms differ in difficulty, so a 20-WCPM gain may partly reflect an easier passage.
  - Growth norms ("Zones of Growth") are available only through the DIBELS Data System or mCLASS. (p. 89)
- **Progress-monitoring frequency.** At-risk students in K–3: every 2 weeks; some-risk: every 4 weeks. Grades 4–8 ORF: every 2–3 weeks (at risk) or 4–5 weeks (some risk). The guide says monitoring more than once a week is rarely advisable. (pp. 93–94)
- **Decision rule.**
  - An aimline runs from the benchmark score that triggered intervention to an end-of-year goal (by default, the end-of-year benchmark).
  - Three consecutive ORF points below the aimline (four for other subtests) mean the intervention should change, or off-grade monitoring should be considered.
  - Benchmarking always uses on-grade forms. (pp. 94–96)
- **ORF accuracy benchmarks for core support** (pp. 133–134):
  - Grade 1: 67% or higher at the beginning of the year, 87% mid-year, 91% at the end.
  - Grade 2: 92% at the beginning of the year.
  - Grade 2 mid-year through grade 8: 96% or higher is core, 91–95% strategic, 90% or lower intensive.
- **Materials licence.** The materials are free to download.
  - Use is limited to schools, districts, and multi-district agencies, for internal educational use.
  - Modification needs written permission.
  - The materials may not be used for student practice or coaching, or to grade students.
  - Printed kits are sold through Amplify.
  - Source: https://dibels.uoregon.edu/materials. (a)/(ctx) VERIFIED, page undated.
- **Platforms.** Source: https://dibels.amplify.com/help/options. (ctx) VERIFIED, © 2026.
  - DIBELS Data System: paper administration, manual scoring, and manual data entry. Kits cost $42–76; training costs $49 per person.
  - mCLASS: teacher-administered on a digital device, with automatic scoring using speech recognition and no manual data entry.

### Acadience Reading K–6 (formerly DIBELS Next)

- **Format.** Source: https://acadiencelearning.org/learning-materials/oral-reading-fluency/. (a) VERIFIED, page undated, 2026 site.
  - At benchmark the student reads three different grade-level passages for 1 minute each. Scores are medians: WCPM, errors, retell words, and retell quality.
  - A retell follows each passage if the student read 40 or more words correctly; below that, the examiner decides.
  - Used from mid-grade 1 to grade 6.
- **Errors** (same page, (a) VERIFIED):
  - Errors: substitutions; omissions (a skipped row counts all its words as errors); hesitation over 3 s (the examiner says the word and marks it wrong).
  - Not errors: self-corrections within 3 s, insertions, repetitions or rereading.
  - Words must be read in order, and each repeated misreading of a word counts.
- **Discontinue rules** (same page, (a) VERIFIED):
  - No words correct in the first line: score 0, and no retell.
  - Fewer than 10 correct on passage 1: skip the retell and passages 2–3.
- **Accuracy.**
  - Accuracy is computed from the median correct and median errors; for example, 45 correct and 5 errors gives 90%.
  - End-of-year accuracy goals are cited as 90% for grade 1 and 97% for grades 2–3.
  - Source: Scholastic's *Reading Assessment Done Right*, https://www.scholastic.com/content/dam/PostPurchase/Downloads/RADR2.pdf. SNIPPET.
- **Progress monitoring.**
  - Official pages call for regular monitoring of Below Benchmark (strategic) students and frequent monitoring of Well Below (intensive) students, with no numbers. Source: https://acadiencelearning.org/help-center/acadience-reading-k-6-benchmarks-and-cut-points-for-risk/. (a) VERIFIED.
  - A 2012 Acadience progress-monitoring guide, cited in Utah's 2020 K–3 report, reportedly recommended every 7–10 days for Well Below and every 10–12 days for Below. SNIPPET.
  - Progress-monitoring passages are those left out of the benchmark sets of three. SNIPPET (Technical Adequacy Supplement).
- **Materials and online administration.** Materials are free to download from Acadience's Resource Hub. Acadience Learning Online (ALO) lets assessors give the measures online, with a results dashboard. Pricing isn't published; buyers are asked to contact Acadience. Sources: https://acadiencelearning.org/acadience-reading/k-grade6/ and https://acadiencelearning.org/acadience-learning-online/. (ctx) VERIFIED.
- **Timing.** Iowa's 2026–27 approved list puts Acadience ORF at about 5 minutes per student for screening, and its progress-monitoring subtests at 1–2 minutes. (a) VERIFIED.

### aimswebPlus (Pearson)

- **Product and pricing.** Source: https://www.pearsonassessments.com/professional-assessments/digital-solutions/aimsweb/features.html. (ctx) VERIFIED, © 2026.
  - Digital record forms for ORF, grades 1–12.
  - Pearson says the platform manages the full fall, winter, and spring cycle, uses equivalent forms, and supports browser-based and/or manual score entry.
  - Price per student per year: Reading $4.50; Complete $7.75 (minimum $500); unlimited plan $4,995 for districts of up to 2,500 students.
- **Benchmark and progress-monitoring format.** Benchmark ORF uses two 1-minute passages, averaged; progress monitoring uses one passage. Source: Pearson's grades 2–8 guide (2017) as hosted by a Wisconsin district (the fetch failed). SNIPPET.
- **Oklahoma guidance** (August 2026), https://oklahoma.gov/content/dam/ok/en/osde/strong-readers-files/UDATED%2026-27ScreeningTechnicalGuidanceaimswebPlus.pdf. (a) VERIFIED.
  - Grades 2–3: about 2 minutes per student for individual ORF, plus 19–32 minutes of group testing (comprehension and vocabulary).
  - Grade 4 and up: ORF is optional (recommended), while group silent reading fluency is required.
- **Error rules.** Not verified for aimswebPlus specifically. Older AIMSweb R-CBM guidance counted pauses over 3 s as errors. SNIPPET.

### FastBridge CBMreading (now Renaissance)

- **Ownership.** Illuminate Education, FastBridge's owner, was acquired by Renaissance in August 2022. https://thejournal.com/articles/2022/08/24/renaissance-acquires-illuminate-education.aspx. SNIPPET.
- **Screening.**
  - One district's page: grades 2–3 are screened three times a year, one-to-one with a staff member, reading three passages in about 5 minutes. https://www.wayzataschools.org/fs/pages/7744. (b/c) VERIFIED, undated.
  - The score is the median of the three screening passages. SNIPPET (FastBridge data-download key).
- **Error rules.** Pauses over 3 s are errors; a self-correction within 3 s is not an error; the probe stops if the first 10 words are all wrong; WCPM is adjusted automatically if the reading is shorter than a minute. Source: a FAST CBM reading administration review (2014, revised 2017) hosted by Central Rivers AEA. SNIPPET.
- **Progress monitoring.** Source: FastBridge progress-monitoring primer, November 2017, https://www.illuminateed.com/?p=12529. (a) VERIFIED.
  - Weekly monitoring is recommended for academics.
  - Three data points aren't enough for a reliable read; 9–12 points are suggested before changing an intervention.
  - Default weekly growth goal is about 1.5 WCPM for grades 1–2.
  - Teachers set the number of administrations per week when creating a group.
- **Timing.** Iowa's 2026–27 list: CBMreading screening 3–5 minutes, progress monitoring 1–2 minutes. Computer-administered AUTOreading: 4–6 minutes. (a) VERIFIED.
- **Norms caveat.** Hasbrouck & Tindal excluded CBMreading data from their 2017 compiled norms. Its scores differed significantly from the other assessments, possibly because of how its passages were constructed. VERIFIED (scholarly technical report, not resolved via LibKey).

### easyCBM Passage Reading Fluency (UO Behavioral Research and Teaching; distributed by Riverside Insights)

- **Administration.** Source: https://onlinehelp.riversideinsights.com/Help/easyCBM/TeachAssess/Passage_Reading_Fluency_1-8.htm. (a) VERIFIED.
  - The reading lasts 60 seconds, using an Assessor Copy (with directions) and a Student Copy.
  - Proper nouns are identified before starting. A cover sheet showing one row at a time is recommended on paper.
  - Errors are slashed on paper or clicked online, and the last word is bracketed.
- **Error rules** (same page, (a) VERIFIED):
  - After a 3-s hesitation the examiner supplies the word, scored incorrect. Misread and omitted words are also errors.
  - Self-corrections within 3 s count as correct. Insertions are not counted.
  - The page states the discontinue rule two ways: no words read in the first line, or none in the first three rows.
- **Benchmarks.**
  - Benchmarks run in fall, winter, and spring at grade level (PRF covers grades 1–8). https://district-help.easycbm.com/what-is-a-benchmark/. (a) VERIFIED, August 2021.
  - Grade 1 is benchmarked in winter and spring only, grades 2 and up get one benchmark per season, and windows last 2–3 weeks. SNIPPET.
- **Paper administration.** Scores can be entered word by word for both benchmarks and progress monitoring, but total-only entry is allowed for benchmarks only. https://help.easycbm.com/article/1591-assess-students-manually-paper-and-pencil. (a) VERIFIED, February 2026.
- **Free Lite edition.** Sources: https://help.easycbm.com/article/1288-lite-edition-vs-deluxe-edition (April 2026) and https://easycbm.com/pricing/index.html. (ctx) VERIFIED.
  - Single-teacher account, up to 200 students, students added by hand.
  - Includes progress-monitoring measures and individual progress graphs, but no benchmarks.
  - Deluxe costs $69.99 a year.
  - The comparison table lists 9 PRF forms in Lite, labelled "Grades K–1". That label looks inconsistent with PRF's grade 1–8 range, so verify before relying on it.
- **Timing.** Iowa's list puts PRF at 3 minutes. (a) VERIFIED.

### Star CBM Reading (Renaissance)

- **Format.** Source: https://www.renaissance.com/products/star-cbm/. (ctx) VERIFIED, © 2026.
  - The teacher gives it one-to-one, in digital, print, or mixed form, and each measure takes about a minute.
  - Renaissance recommends giving it at regular intervals through the year, and positions it alongside Star Reading on one platform.
- **Timing and cut scores.** Iowa's list puts Star CBM ORF at 1–2 minutes (VERIFIED). Oklahoma's 2026–27 guidance describes fixed, percentile-based cut categories (SNIPPET).

### Also on state and NCII lists

- **i-Ready Literacy Tasks Passage Reading Fluency** appears on the NCII tools chart (grades 1–4) and on Iowa's progress-monitoring list (grades 1–6). (ctx) VERIFIED.
- **Computer-administered automated reading assessments** also appear on Iowa's 2026–27 screening list: FastBridge AUTOreading (4–6 min), Amira's Benchmark ISIP Assess (20 min), Literably (25–40 min), EPS Reading Assistant (10–18 min), and NWEA MAP Reading Fluency (30 min). https://educate.iowa.gov/media/11096/download. (ctx) VERIFIED.

### Cross-system takeaways

- **Where the rules converge** (a):
  - 60-second timing.
  - A 3-second hesitation means the examiner supplies the word and it counts as an error.
  - Self-corrections within 3 s count as correct.
  - Insertions and repetitions are ignored.
  - Omissions and skipped lines are errors.
  - Dialect isn't penalized.
- **How FC compares.** FC's error rules match the DIBELS 8 text (VERIFIED). Minor differences:
  - FC doesn't state the 3-second window for self-corrections.
  - It has no first-line discontinue rule.
  - It counts every word in the passage box. FC has a separate title field that isn't counted, so this only matters if a teacher pastes the title into the passage; DIBELS excludes the title.
  - Its whole-passage mode scales to a minute, whereas the official measures use a fixed 60 s. FastBridge reportedly adjusts automatically for readings under a minute (SNIPPET).
- **Where the systems diverge:**
  - Number of benchmark passages: 1 (DIBELS 8), 2 averaged (aimswebPlus), or 3 with the median (Acadience, FastBridge).
  - Acadience adds a retell.
  - Discontinue rules differ.
  - DIBELS 8 and Acadience treat accuracy as a risk indicator, with grade-specific cutoffs.
- **What every system assumes.** Benchmark and norm interpretations assume the publisher's own passages and procedures: the DIBELS modification rule, DIBELS' own form effects, and CBMreading's divergent scores all point the same way.

---

## 2. Progress-monitoring guidance

### Official guidance (a)

- **MTSS Center at the American Institutes for Research, 2025.** VERIFIED. https://mtss4success.org/sites/default/files/2025-08/progress-monitoring-features.pdf
  - Tier 2: at least every two weeks. Tier 3: at least weekly.
  - Tools should be brief, reliable, valid, sensitive to growth, and built for repeated measurement, with typical growth rates and end-of-year benchmarks.
  - Goal methods: benchmark, average growth rates, or intra-individual (the student's own prior growth).
  - Growth is judged with a trend line or the four-point rule.
- **IES / What Works Clearinghouse practice guide (February 2009).** VERIFIED. https://ies.ed.gov/ncee/wwc/practiceguide/3
  - Screen all students at the beginning and middle of the year (moderate evidence).
  - Monitor Tier 2 students at least once a month (minimal evidence).
  - Tier 3 means daily intensive instruction; no monitoring interval is given.
  - The National Center on Improving Literacy restates the at-least-monthly guidance for Tier 2 (2020). VERIFIED. https://improvingliteracy.org/resource/evidence-based-reading-support-in-the-primary-grades-rti-and-mtss-essentials/
- **National Center on Intensive Intervention (NCII) decision rules (December 2024).** VERIFIED. https://intensiveintervention.org/sites/default/files/2024-12/apm-decision-rules.pdf
  - **Four-point rule:** use after at least 3 weeks and 6 data points, looking at the 4 most recent. All above the goal line: raise the goal. All below: adapt the intervention. Mixed: keep collecting data.
  - **Trend line:** use after at least 4 weeks and 8 points.
  - **Median of the last three points:** use after at least 4 weeks and 8 points.
  - NCII recommends trend-line analysis when software calculates the trend line for you.
  - Inference: 6 points in 3 weeks implies about two probes a week in intensive settings.
- **NCII goal-setting overview (December 2022) and IEP goals guide (January 2023).** VERIFIED. https://intensiveintervention.org/resource/overview-academic-goal-setting and https://intensiveintervention.org/sites/default/files/NCII-SetAcademicIEPGoals508.pdf
  - The baseline must come from the same tool used for progress monitoring: either the screening score, or the median or mean of 3 probes.
  - The goal can come from a benchmark, from a national rate of improvement (weekly growth × weeks remaining + baseline), or from the student's own growth, which needs 6–9 data points.
  - Sample goals are written in WCPM on a standardized grade-level probe (for example, 99 words correct in 1 minute by spring benchmarking).
- **DIBELS 8.** Every 2 weeks for at-risk K–3 students, every 4 weeks for some-risk; three ORF points below the aimline triggers a change. VERIFIED (see section 1).
- **FastBridge.** Weekly monitoring; 9–12 points before decisions. VERIFIED.
- **Ohio ReadOhio assessment tip sheet** (file dated October 2025). VERIFIED.
  - Best practice is weekly progress monitoring once small-group structured literacy instruction starts.
  - Ohio's dyslexia law requires checking each at-risk student at least in weeks 2, 4, and 6.
  - URL: https://education.ohio.gov/getattachment/Topics/Learning-in-Ohio/Literacy/ReadOhio-Tip-Sheets/Assessment-Tip-Sheet.pdf.aspx?lang=en-US
- **Iowa 2026–27.** Progress-monitoring tools must be usable weekly, quick, reliable, and sensitive to change. Developers must document how they made forms similar and how many forms exist. VERIFIED.
- **Special education (IDEA).** An IEP must include measurable annual goals, a description of how progress will be measured, and when periodic progress reports will be given (for example, quarterly, alongside report cards). VERIFIED. 34 CFR 300.320, via https://www.law.cornell.edu/cfr/text/34/300.320

### Practice (b) and (c)

- **One school's 2024–25 schedule, shared via Edutopia (February 2025):** DIBELS progress monitoring every 2 weeks and Star every 4 weeks, with benchmark windows and data-meeting dates. (c) VERIFIED. https://wpvip.edutopia.org/wp-content/uploads/2025/02/VES-PM-Schedule.pdf
- **Montgomery County (Maryland) mCLASS guidance:** every 1–2 weeks for the highest-risk students and every 2–4 weeks for moderate risk. (b) SNIPPET; the page returned 404 when fetched.
- **Kentucky decision-rules protocol:** Tier 2 every 2 weeks (monthly at minimum), Tier 3 weekly, and 6–8 points for a dependable read. (a) SNIPPET. https://education.ky.gov/curriculum/standards/teachtools/Documents/Decision_Rules_Protocol.pdf
- **One kindergarten teacher** runs DIBELS checks weekly during intervention, partly so students get used to the subtests. (c) SNIPPET. https://busybeekindergarten.substack.com/p/daily-interventions/comments

### Why standardized, equivalent passages matter

- **DIBELS' own forms still vary.** Even equated DIBELS forms produce form effects, and modified administrations are invalid (see section 1). (a) VERIFIED.
- **NCII's chart criteria.** The NCII Academic Progress Monitoring Tools Chart rates growth standards (one of its three tabs): reliability and validity of the slope, alternate forms, decision rules, and rates of improvement with benchmarks. Listed ORF tools include Acadience ORF, aimswebPlus ORF, easyCBM PRF, FAST CBMreading, and i-Ready Passage Reading Fluency. Last updated November 2024. (a) VERIFIED. https://charts.intensiveintervention.org/aprogressmonitoring
- **Iowa's review criteria** require documentation of how forms were made similar. (a) VERIFIED.
- **Hasbrouck & Tindal (2017), Technical Report 1702.** Scholarly, not resolved via LibKey; read at https://www.brtprojects.org/wp-content/uploads/2019/05/TechRpt_1702ORFNorms.pdf.
  - The 2017 compiled norms come from standardized commercial sets: DIBELS 6, DIBELS Next, and easyCBM.
  - CBMreading data were excluded as divergent.
  - Original CBM practice built local norms from unpracticed passages in students' own textbooks, so curriculum passages have a historical basis.
  - The authors note that educators also use compiled norms to interpret ORF scores outside any one assessment product. This partly supports a passage-agnostic tool, with care.
  - Progress monitoring must be frequent (weekly or every other week), graphed, and tied to a goal.
- **Hasbrouck's practitioner article** (Colorín Colorado, c. 2006): with passages picked at random from a book, average two or three readings to account for differences between texts; with a standardized passage, one reading may be enough. (b) VERIFIED. https://www.colorincolorado.org/node/56523
- **Readability formulas don't equate passages.** In a University of Georgia master's thesis (scholarly, not resolved via LibKey), six passages leveled by readability formulas produced mean scores ranging from 67.9 to 93.9 WCPM among 134 second graders, and equating the forms removed the effect. SNIPPET. https://openscholar.uga.edu/record/19710/files/blevins_leslie_a_201505_ma.pdf
- **Inference.**
  - Expected growth is about 1–2 WCPM a week (FastBridge's default is 1.5).
  - A swing of 10–25 WCPM between teacher-chosen texts can hide several weeks of real growth.
  - So a trend from mixed passages is hard to interpret, and can't be judged against published rates of improvement or benchmarks.
  - Used informally, this tool needs either a fixed passage set or repeated passages per occasion (median of three).

---

## 3. Universal screening mandates and who controls the tools

### Counts (definitions differ; treat as a range)

- **McGraw Hill investor webinar deck (September 2, 2026).** It cites the National Center on Improving Literacy's *State of Dyslexia* annual report 2026 and ExcelinEd's comprehensive early literacy policy analysis. Its claims:
  - All 50 states require early literacy risk screening.
  - In 42 states, districts must choose from a state-approved list.
  - In 7, districts may use any screener that meets state requirements.
  - 1 state offers a recommended list.
  - Maine and New York require K–12 screening; all others K–3.

  VERIFIED that the deck says this; (ctx), from a vendor, underlying data not independently verified. https://s205.q4cdn.com/964897494/files/content_files/MH_Stifel-Investor-Webinar-9-2-26-_vF.pdf
- **ExcelinEd universal screening FAQ (February 2024).** VERIFIED. https://excelined.org/2024_universal-screening-faq-one-pager_final/
  - Recommends K–3 screening at the beginning, middle, and end of the year.
  - Lists only 7 states with approved screener lists (AZ, CT, MS, MO, NC, OK, TN).
  - Parents should be notified within 15 days of each screener, and at each quarterly report if the child has a reading deficiency.
  - This conflicts with the 42 figure. Massachusetts already had an approved list in 2023 (VERIFIED below), so the 2024 list was narrow or incomplete, and lists grew between 2024 and 2026.
- **Education Commission of the States (June 2023):** 39 states plus DC require K–3 assessments beyond the federal grade 3 tests. SNIPPET. https://www.ecs.org/50-state-comparison-state-k-3-policies-2023/
- **A 2025 NCME event listing:** at least 29 states plus DC have legislated early-grade screening. SNIPPET. https://ncme.org/event/comparing-and-evaluating-universal-early-reading-screeners-and-their-uses-in-the-u-s-educational-system/
- **Education Week tracker (updated August 4, 2026):** 43 states plus DC have passed science-of-reading laws or policies. VERIFIED. https://www.edweek.org/teaching-learning/which-states-have-passed-science-of-reading-laws-whats-in-them/2022/07

### State examples

- **Massachusetts** (June 2023 guidance; page updated October 2024). (a) VERIFIED. https://www.doe.mass.edu/instruction/screening-guide.pdf and https://doe.mass.edu/instruction/screening-assessments
  - Every K–3 student must be screened at least twice a year with a state-approved instrument, under a regulation effective July 1, 2023.
  - Approved tools: DIBELS 8, mCLASS, EarlyBird (kindergarten), Acadience, FastBridge, i-Ready, MAP Reading Fluency, and Star.
  - The state recommends using the same screener for most students so data can be compared over time.
  - All approved tools include family reports, and the guidance supplies sample family letters.
- **Iowa** (2026–27). (a) VERIFIED. https://educate.iowa.gov/media/11096/download
  - All students in grades K–6 are screened three times a year.
  - The document is the list of approved assessments schools must choose from for screening and progress monitoring.
  - Vendors without a link to the state's MTSS data system (Panorama) mean districts must send screening files to the state, and progress-monitoring data must be typed into the system by hand.
- **Ohio.** There is an approved list, and one assessment can satisfy both the Third Grade Reading Guarantee and the dyslexia laws. (a) VERIFIED (tip sheet). The 2026–27 approved list was announced April 29, 2026. SNIPPET.
- **North Carolina.** (a)/(ctx) VERIFIED. https://www.ednc.org/2021-07-20-mclass-reading-assessment-tool-nc-amplify-science-literacy-learn-classroom-north-carolina/
  - The state education department chose Amplify mCLASS (DIBELS 8) as the single statewide K–3 tool, on a three-year, $14.5 million contract (2021).
  - Students are benchmarked at the beginning, middle, and end of the year, and teachers give it one-on-one.
  - ExcelinEd's 2024 FAQ confirms the single vendor. VERIFIED.
- **Oklahoma.** The Strong Readers Act requires universal screening three times a year for K–3, with plans for students below target. The state publishes vendor-specific guidance. (a) VERIFIED, August 2026.
- **Utah.** Acadience has been the statewide tool since 2013, with grades 1–3 benchmarked three times a year and progress monitoring tied to the benchmark tool's recommendations. SNIPPET. https://le.utah.gov/xcode/Title53E/Chapter4/C53E-4-S307_2024050120240501.pdf
- **Other states, all SNIPPET:**
  - Michigan: districts must move to an approved list by August 1, 2027.
  - California: mandatory K–2 screening from 2025–26, from an approved list.
  - Georgia: an approved list capped at five screeners, one of them free.
  - Connecticut and Wyoming also keep lists.

### What this means for control

- Choosing the screening tool is a state or district decision. Inference: classroom teachers rarely choose it.
- Progress monitoring is often tied to the same system. Iowa says so explicitly, and NCII says the baseline and progress monitoring must use the same tool.
- Results are expected to flow into district or state platforms: the DIBELS Data System, mCLASS, or Iowa's Panorama.
- So an independent tool's realistic role in public schools is informal, supplemental checking. Its stronger fit is outside the mandates: homeschool, tutoring, private schools, and possibly grades beyond the mandated span.

---

## 4. The real session

### Time per student

- **Per measure** (a, VERIFIED):
  - DIBELS 8 ORF: 60 seconds of reading; full benchmark battery 2–7 minutes depending on grade.
  - Acadience ORF: about 5 minutes (three passages plus retell).
  - FastBridge CBMreading: 3–5 minutes (Iowa); about 5 minutes (Wayzata district page).
  - easyCBM PRF: 3 minutes.
  - aimswebPlus, grades 2–3: about 2 minutes per student individually.
  - mCLASS: 5–7 minutes in grades 2–3 (North Carolina, 2021); 4–7 minutes for the composite (Iowa).
  - Progress-monitoring probes: 1–2 minutes (Iowa).
- **Survey of 251 K–3 educators in 39 states.** Ozernov-Palchik et al. (2025), *Annals of Dyslexia*. Scholarly, not resolved via LibKey; open access at https://pmc.ncbi.nlm.nih.gov/articles/PMC12662888/.
  - Screening took under 15 minutes per student for 34% of respondents, 15–30 minutes for 33%, and over an hour for 12%.
  - Preparation, administration, and scoring were the most time-consuming parts.
  - Respondents described split sessions, substitute coverage, and disrupted intervention time.
  - The authors suggest dedicated screening ("SWAT") teams.

### Materials

- **DIBELS 8:** scoring book (the examiner's copy), student form, pen, clipboard, and timer. (a) VERIFIED.
- **easyCBM:** assessor copy and student copy, with an optional cover sheet. (a) VERIFIED.
- **UFLI Foundations Fluency Checks:** the teacher form prints running word counts at the end of each line (11, 27, 39, …), so the teacher adds words up to the bracket and subtracts errors. (a/b) VERIFIED, May 2024 pilot version. https://ufli.education.ufl.edu/wp-content/uploads/2024/05/UFLI-Fluency-Check-1st-Grade-Bundled.pdf
- Inference: DIBELS and Acadience scoring booklets very likely use the same per-line counts. The booklets weren't opened in this pass.

### Paper or device while timing

- **Survey:** 75% of respondents used digital screening formats and 15% paper; 92% administered in person. These figures cover screening overall, including computer-adaptive tests. Scholarly.
- **By system:**
  - mCLASS: the teacher scores on a device while the student reads printed materials. (ctx) VERIFIED. https://amplify.com/wp-content/uploads/2023/09/mCLASS-Kit-Components.pdf
  - easyCBM: the teacher clicks words online, with an on-screen stopwatch, or scores on paper.
  - aimswebPlus: digital record forms.
  - DIBELS Data System: paper, then manual data entry.
  - Star CBM: digital, print, or mixed.

### Who does the checks

- **Survey: who administers screening.** Scholarly.
  - Literacy specialists or coaches: 36%
  - Classroom teachers: 25%
  - Special education teachers: 16%
  - Other roles, including interventionists: 15%
  - Administrators: 4%
  - Speech-language pathologists: 2%
  - Paraprofessionals were not reported separately.
- **Other accounts:**
  - North Carolina: classroom teachers, one-on-one. (b) VERIFIED, 2021.
  - Wayzata: a staff member, one-to-one. (c) VERIFIED.
  - Reading Corps: AmeriCorps tutors (non-teachers trained by the program) track student progress and review data with coaches. (b) VERIFIED, minimal detail. https://readingandmath.org/reading-corps/
  - One school's testing document assigns named testers per homeroom, with tutor help. (c) SNIPPET.
- **Training and fidelity in practice (survey, scholarly):**
  - 75% of DIBELS administrators had under 3 hours of training, and 44% had under an hour or none. Publishers recommend 4–8 hours.
  - 46% had no chance to practice before their first administration.
  - Only 12% said they strictly follow standardized protocols.
  - About half had retested students because of accuracy concerns.

### Afterwards

- **Data entry:**
  - DIBELS Data System: manual entry. mCLASS: no manual entry.
  - easyCBM progress monitoring: word-by-word entry required.
  - Iowa: manual entry into the state system for vendors without an integration.
  - All VERIFIED.
- **Graphs and decisions:**
  - Platforms draw the graphs.
  - NCII offers a free Excel tool for data entry, graphing, and goals (2016). VERIFIED. https://intensiveintervention.org/resource/student-progress-monitoring-tool-data-collection-and-graphing-excel
  - Data meetings appear on the Edutopia-shared school schedule (c).
- **Grouping.** Massachusetts guidance tells schools to use screener reports to set up groups with a specific instructional focus. VERIFIED. A DIBELS 8 grouping worksheet exists. SNIPPET.
- **IEP progress reports.** IDEA requires periodic reports, and NCII gives WCPM goal examples. VERIFIED.
- **Parents:**
  - Massachusetts: family reports and sample letters. VERIFIED.
  - ExcelinEd: notify within 15 days and at quarterly reports. VERIFIED.
  - Wayzata: scores are shared through the district's parent portal (Skyward Family Access). VERIFIED.
  - Utah: results go to parents after each round. SNIPPET.

---

## 5. Are longitudinal history and rosters essential?

- **Decisions depend on series, not single scores.** All VERIFIED, (a):
  - NCII: 6–8 or more points over 3–4 weeks.
  - DIBELS 8: an aimline plus 3 points below it.
  - FastBridge: 9–12 points.
  - NCII's intra-individual goals: 6–9 points.
- **Goals and baselines are tied to one tool and expressed in WCPM.** The NCII IEP guide's sample baseline refers to a standardized grade-level passage read at winter benchmarking, and its sample goal is in words correct per minute. IDEA requires periodic progress reports. VERIFIED.
- **Growth norms and reporting live in platforms.** DIBELS "Zones of Growth" exist only in the DIBELS Data System or mCLASS. aimswebPlus reports at the student, class, grade, school, and district levels. Iowa requires progress-monitoring data in the state system. VERIFIED.
- **Rosters.** easyCBM Lite: students entered by hand (200-student cap); Deluxe adds roster upload. District platforms sync rosters (Iowa: Panorama integrations). VERIFIED.
- **Inference for FC:**
  - FC's per-student history and CSV export cover an individual's informal series.
  - FC is not a system of record: it has no roster import, no sync, and no sloped aimline or trend line.
  - It offers no way back into district systems except retyping, which duplicates entry.
  - FC's horizontal goal line isn't the aimline that DIBELS and NCII describe.

---

## 6. Running records compared with ORF/CBM, and the "science of reading" shift

- **What a running record is.**
  - Developed by Marie Clay, within the Reading Recovery approach. The teacher follows a copy of the text while the child reads.
  - The teacher computes the percentage of words read correctly and the self-correction rate, and does a miscue analysis to judge whether the text is too easy or too hard.
  - Wikipedia describes it as based on the three-cueing model. VERIFIED, but a weak secondary source. https://en.wikipedia.org/wiki/Running_record
- **How the purposes and conventions differ.**
  - CBM-ORF is timed and standardized, and is used for risk screening and growth.
  - Running records and leveled-text inventories are usually untimed and used to place students in text levels and analyze miscues. UNVERIFIED as a general statement.
  - Clay's conventions reportedly count insertions as errors. The DIBELS, Acadience, and easyCBM rules ignore them (VERIFIED).
  - Microsoft Reading Progress counts insertions against accuracy (VERIFIED, section 7). So "accuracy" differs by tradition and tool.
- **FC's accuracy bands come from the instructional-level tradition.**
  - FC labels 95% and above comfortable, 90–94% challenging, and below 90% too hard. These match the commonly cited running-record and informal reading inventory bands. UNVERIFIED attribution.
  - The heuristic is also used in tutoring: Outschool calls more than about one error per ten words too hard for fluency practice. (b) VERIFIED, May 2026.
  - DIBELS 8 uses accuracy differently, as a risk indicator: 96% or higher is core from mid-grade 2 (VERIFIED). A teacher in a DIBELS district could see 95% as "comfortable" in FC but "strategic support" in DIBELS.
- **The shift in practice.**
  - Education Week counts 43 states plus DC with science-of-reading laws or policies as of August 2026. VERIFIED.
  - In 2021 North Carolina dropped the mCLASS Text Reading Comprehension component, which produced book levels and included cueing exercises, keeping only DIBELS 8 to align with the science of reading. Amplify estimated the change saved 10–15 minutes per student.
  - A state literacy official said: "It's unfair to assess them differently from what you're teaching." Source: EdNC, July 2021, VERIFIED.
  - Massachusetts' and Iowa's approved lists contain CBM and computer-adaptive tools, with no running-record or leveled benchmark kits. VERIFIED for those two lists.
  - The 2025 survey still found some schools using Clay's Observation Survey as a screener. Scholarly.
  - Fountas & Pinnell's benchmark assessment page describes text levels A–Z and comprehension rubrics, and doesn't mention screening or the science of reading. VERIFIED (absence). https://www.fountasandpinnell.com/bas/
- **Not verified in this pass:** how many states ban three-cueing; changes at the Teachers College Reading and Writing Project; the *Sold a Story* podcast's effects.

---

## 7. Device realities

- **How district tools use devices.** All VERIFIED, (ctx):
  - mCLASS: teacher-administered on a digital device with speech-recognition scoring; students read printed materials; the group Maze test runs on each student's computer or iPad, with a paper option.
  - aimswebPlus: browser-based digital record forms, plus TestNav for group tests.
  - easyCBM: online click-scoring with a stopwatch.
  - Acadience Learning Online: online administration.
  - Star CBM: digital, print, or mixed.
- **Survey (scholarly).** 75% digital formats. Concerns included young children's mouse skills, screen size, audio pickup, and connectivity. Technical difficulties affected about 60% of sessions in lower-income schools versus about 40% in higher-income schools.
- **Automated oral reading is mainstream on approved lists.** Iowa's list includes FastBridge AUTOreading, Amira, Literably, EPS Reading Assistant, and MAP Reading Fluency. VERIFIED.
- **Microsoft Reading Progress** (included in Microsoft 365 Education as a "Learning Accelerator"; page updated September 2026). VERIFIED. https://learn.microsoft.com/en-us/training/educator-center/product-guides/learning-accelerators and https://learn.microsoft.com/en-us/training/modules/support-reading-fluency-practice-with-reading-progress/
  - Teachers assign any passage: from OneNote, a local file, or the ReadWorks library.
  - Students record themselves reading.
  - It detects mispronunciations, omissions, and insertions for an accuracy rate. Self-corrections and repetitions are logged but not counted.
  - It shows words per minute and accuracy, teachers can override any word, and an Insights dashboard tracks results over time.
  - It requires Teams and student accounts with devices that can record.
- **Not verified:** iPad versus Chromebook share in elementary classrooms, how common shared carts are, and teacher laptop or phone use during testing.
  - UNVERIFIED background: Chromebooks are widely reported to dominate US K–12 student devices, with iPads common in K–2.
  - Amplify's remote-assessment guidance reportedly calls for a touch-enabled scoring device plus a separate display device. SNIPPET.
- **Inference for FC.** A phone-friendly page that works offline suits teacher-side scoring. But in districts the teacher-side device workflow is already covered by mCLASS, aimswebPlus, easyCBM, and similar systems. Student-recording tools also reduce the need to tap-score live.

---

## 8. Homeschool parents and private tutors

- **BJU Press homeschool guidance** (undated; cites the December 2024 DIBELS guide). (b) VERIFIED. https://www.bjupresshomeschool.com/pdfs/homeschool/dibels-information.pdf
  - Parents are told to print DIBELS 8 materials: benchmark booklets for K–3 and progress-monitoring booklets for grades 4–8.
  - They're told to use a clipboard and timer, mark with slashes, brackets, and "SC", and track raw scores over time.
  - It tells parents to prompt the child to keep going after a pause over 3 s, rather than supplying the word, which differs from the DIBELS rule.
  - The DIBELS terms limit use to schools and districts (VERIFIED). Inference: homeschool use sits outside the licence.
- **Outschool's tutor- and parent-facing guide (May 21, 2026).** (b) VERIFIED. https://outschool.com/how-to-teach/how-to-teach-reading-fluency
  - Any educator can run a fluency check with a passage and a timer.
  - It points to DIBELS for free benchmarks, suggests recording readings with Voice Memos or similar apps, and recommends charting WCPM after repeated readings.
  - It treats more than about one error in ten words as too hard.
- **UFLI Foundations Fluency Checks** (May 2024 pilot). (a/b) VERIFIED.
  - Free for anyone to use, adapt, and share for non-commercial purposes.
  - One decodable passage per unit in grades 1–2, given at least a week after the unit; a one-minute timing yields WCPM.
  - UFLI recommends interpreting scores with the Hasbrouck & Tindal 2017 norms, and gives no benchmarks because the checks shouldn't be used as grades.
  - **Name collision:** "Fluency Check(s)" is already a UFLI product term, and UFLI is widely used in schools and homeschools (usage claim UNVERIFIED).
- **easyCBM Lite** is free for individual teacher accounts. Tutors and parents aren't mentioned. (ctx) VERIFIED.
- **Hasbrouck's article** gives a do-it-yourself procedure for any passage, averaging two or three readings. (b) VERIFIED.
- **Read Naturally** has a video page on assessing WCPM (VERIFIED, minimal). Raz-Plus sells timed-reading fluency passages (SNIPPET; the page returned 403).
- **One teacher on an online-school training forum** sets a baseline with DIBELS, then runs follow-up checks of correct words, expression, and retell to pace small-group work. (c) SNIPPET. https://training.asuprepdigital.org/?p=3838
- **Gap.** No systematic evidence was found on how often homeschoolers or tutors check fluency, and Reddit threads couldn't be retrieved. Inference from the guidance above: checks are informal, tied to a curriculum unit or a few times a year, on paper with a phone timer, sometimes recorded.

---

## Implications for Fluency Check (for and against)

### Against

1. **Wrong owner for the official checks.** In US public K–3, benchmark and usually progress-monitoring tools are chosen by the state or district: 42 of 50 states on approved lists per a 2026 vendor tally; Iowa also mandates progress-monitoring tools and data entry. FC scores on teacher-pasted passages can't stand in for them.
2. **Duplicate work.** Many teachers already score on a device inside the official system (75% digital in the survey; mCLASS with no manual entry). FC would add a second record, and moving data back means retyping.
3. **Free substitutes cover most of the value.**
   - Paper and a stopwatch with free standardized passages that carry running word counts: DIBELS 8, Acadience, UFLI.
   - easyCBM Lite: free progress-monitoring passages and graphs.
   - NCII's free Excel tool for graphs and goals.
   - Microsoft Reading Progress: automated WCPM and accuracy on any passage, included for Microsoft 365 schools.
4. **Validity.**
   - Teacher-chosen passages vary in difficulty, so trends are noisy.
   - FC has no median-of-three or equivalence guidance, and no aimline, trend line, or decision rules.
   - The 95/90 accuracy bands differ from DIBELS 8's 96/91 cutoffs and could confuse teachers in DIBELS districts.
5. **Licensing friction.** DIBELS materials are for schools and districts only, may not be modified, and may not be used for practice. Typing DIBELS passages into FC, or homeschool use of them, sits uneasily with those terms.
6. **Small time savings.** The reading lasts a minute, and scoring a sheet with running counts takes seconds. The real burdens are scheduling, training, data entry, and acting on the data (survey), and FC doesn't address them.
7. **Name collision** with UFLI's "Fluency Checks".

### For

1. **Rules teachers already know.** FC's rules match the published consensus (VERIFIED against DIBELS 8, Acadience, easyCBM, and Hasbrouck), so trained teachers can use it immediately.
2. **Informal and curriculum-embedded checks are real and recommended.** UFLI's unit fluency checks use curriculum passages and Hasbrouck & Tindal norms. Hasbrouck allows non-standardized text if two or three passages are averaged. CBM began with local curriculum passages, and compiled norms are used outside specific products.
3. **Paper workflows persist.** DIBELS 8 was the most common screener in the survey at 29%, ahead of mCLASS at 19%, which suggests many paper or DIBELS Data System users (inference). 15% of respondents used paper formats. easyCBM supports paper. Homeschoolers print DIBELS. Tap-to-mark scoring, automatic math, a printable marked record, and a per-student chart could replace clipboard arithmetic in these settings.
4. **Users outside the mandates.** Homeschool families, tutors (Outschool, Reading Corps-style programs), private schools, and readers beyond the screened grades. No account and no data leaving the device suit privacy-sensitive families and tutors without district systems.
5. **Speech-recognition tools have friction.** They need student accounts, devices, and connectivity, and raise accuracy concerns; technical difficulties were more common in lower-income schools. A teacher-tapped, offline phone tool avoids these.

### What a pilot should test

- Target homeschool and tutor users first.
- Test with UFLI-style curriculum passages.
- Check scoring agreement against the DIBELS fidelity standard: within 2 words of an expert scorer.
- Measure whether users repeat checks often enough to form a series (6 or more points).
- Ask whether users want a median-of-three option, an aimline from baseline to goal, and clearer labelling of the accuracy bands.
- Reconsider the name.

## Gaps and suggested follow-ups

- **iPad vs Chromebook share** and teacher devices during testing: no verified data.
- **Homeschool and tutor practice:** frequency and methods have no systematic data, and Reddit couldn't be fetched.
- **aimswebPlus details:** the exact error rules and two-passage benchmark weren't confirmed in an official document.
- **Acadience numbers:** current numeric progress-monitoring frequency and accuracy goals weren't confirmed.
- **Running records and policy:** Clay's coding conventions and state three-cueing bans weren't verified.
- **Unopened booklets:** DIBELS and Acadience scoring booklets weren't opened to confirm the per-line word counts.

## Sources

Scholarly items are marked. All others are official, publisher, government, or practitioner pages. Dates are as shown on the source.

### Publisher manuals and product pages

- https://dibels.uoregon.edu/sites/default/files/2026-07/dibels8_admin_scoring_guide.pdf — DIBELS 8 Administration and Scoring Guide, 2026 edition (UO). VERIFIED.
- https://dibels.uoregon.edu/materials — DIBELS 8 materials download page and licence terms; undated. VERIFIED.
- https://dibels.amplify.com/help/options — Amplify comparison of the DIBELS Data System (paper) and mCLASS (device, speech recognition), with kit and training prices; © 2026. VERIFIED.
- https://amplify.com/wp-content/uploads/2023/09/mCLASS-Kit-Components.pdf — mCLASS kits: printed student materials; Maze on student computers or iPads; 2023. VERIFIED.
- https://acadiencelearning.org/learning-materials/oral-reading-fluency/ — Acadience ORF and retell rules; undated (2026 site). VERIFIED.
- https://acadiencelearning.org/help-center/acadience-reading-k-6-benchmarks-and-cut-points-for-risk/ — Acadience benchmark statuses and monitoring language; undated. VERIFIED.
- https://acadiencelearning.org/acadience-reading/k-grade6/ — Acadience K–6: free materials via the Resource Hub; undated. VERIFIED.
- https://acadiencelearning.org/acadience-learning-online/ — Acadience Learning Online, digital administration; undated. VERIFIED.
- https://www.scholastic.com/content/dam/PostPurchase/Downloads/RADR2.pdf — Scholastic *Reading Assessment Done Right* (Acadience accuracy example and goals). SNIPPET.
- https://acadiencelearning.org/wp-content/uploads/2020/01/TechAdequacySupplement_ORF-1.pdf — Acadience ORF technical supplement (progress-monitoring passages). SNIPPET.
- https://www.pearsonassessments.com/professional-assessments/digital-solutions/aimsweb/features.html — aimswebPlus features and per-student pricing; © 2026. VERIFIED.
- https://www.marshfieldschools.org/cms/lib/WI01919828/Centricity/Domain/82/Rdg%20Grades%202-8%20Administration%20and%20Scoring%20Guide.pdf — aimswebPlus grades 2–8 administration guide (2017), hosted by a district. SNIPPET.
- https://www.illuminateed.com/?p=12529 — FastBridge progress-monitoring primer; November 2017. VERIFIED.
- https://fastbridge.illuminateed.com/hc/en-us/article_attachments/13498025368987 — FastBridge data-download key (median of three). SNIPPET.
- https://prevmain.centralriversaea.org/wp-content/uploads/2017/03/D2_CBM-Reading-Administration-and-Scoring-Review-Revised-5.11.17.pdf — FAST CBM reading administration review (2014, revised 2017). SNIPPET.
- https://thejournal.com/articles/2022/08/24/renaissance-acquires-illuminate-education.aspx — Renaissance acquires Illuminate; August 2022. SNIPPET.
- https://onlinehelp.riversideinsights.com/Help/easyCBM/TeachAssess/Passage_Reading_Fluency_1-8.htm — easyCBM PRF administration and scoring rules; undated. VERIFIED.
- https://district-help.easycbm.com/what-is-a-benchmark/ — easyCBM benchmark seasons; August 2021. VERIFIED.
- https://help.easycbm.com/article/1591-assess-students-manually-paper-and-pencil — easyCBM paper administration and data entry; February 2026. VERIFIED.
- https://help.easycbm.com/article/1288-lite-edition-vs-deluxe-edition — easyCBM Lite (free) vs Deluxe; April 2026. VERIFIED.
- https://easycbm.com/pricing/index.html — easyCBM pricing and measures table; undated. VERIFIED.
- https://www.renaissance.com/products/star-cbm/ — Star CBM Reading overview; © 2026. VERIFIED.
- https://www.fountasandpinnell.com/bas/ — Fountas & Pinnell Benchmark Assessment System overview; undated. VERIFIED.

### Federal and research-center guidance

- https://intensiveintervention.org/sites/default/files/2024-12/apm-decision-rules.pdf — NCII decision rules (four-point, trend line, median of three); December 2024. VERIFIED.
- https://intensiveintervention.org/resource/overview-academic-goal-setting — NCII goal-setting strategies; December 2022. VERIFIED.
- https://intensiveintervention.org/sites/default/files/NCII-SetAcademicIEPGoals508.pdf — NCII high-quality academic IEP goals (WCPM examples); January 2023. VERIFIED.
- https://intensiveintervention.org/resource/student-progress-monitoring-tool-data-collection-and-graphing-excel — NCII free Excel graphing tool; 2016. VERIFIED.
- https://charts.intensiveintervention.org/aprogressmonitoring — NCII Academic Progress Monitoring Tools Chart; November 2024. VERIFIED.
- https://mtss4success.org/sites/default/files/2025-08/progress-monitoring-features.pdf — MTSS Center (AIR): key features of progress monitoring; 2025. VERIFIED.
- https://ies.ed.gov/ncee/wwc/practiceguide/3 — IES/WWC practice guide on RtI in the primary grades; February 2009. VERIFIED.
- https://improvingliteracy.org/resource/evidence-based-reading-support-in-the-primary-grades-rti-and-mtss-essentials/ — National Center on Improving Literacy summary of RtI essentials; 2020. VERIFIED.
- https://www.law.cornell.edu/cfr/text/34/300.320 — IDEA regulation on IEP goals and progress reporting; current. VERIFIED.

### State policy and guidance

- https://educate.iowa.gov/media/11096/download — Iowa 2026–27 approved early literacy assessments (screening and progress monitoring, administration times, data entry). VERIFIED.
- https://www.doe.mass.edu/instruction/screening-guide.pdf — Massachusetts early literacy screening guidance; June 2023. VERIFIED.
- https://doe.mass.edu/instruction/screening-assessments — Massachusetts screening page; updated October 2024. VERIFIED.
- https://education.ohio.gov/getattachment/Topics/Learning-in-Ohio/Literacy/ReadOhio-Tip-Sheets/Assessment-Tip-Sheet.pdf.aspx?lang=en-US — Ohio ReadOhio assessment tip sheet; 2025. VERIFIED.
- https://education.ohio.gov/Topics/Testing/News/List-of-Approved-Assessments-for-2026-2027-Announc — Ohio 2026–27 approved assessments announcement. SNIPPET.
- https://oklahoma.gov/content/dam/ok/en/osde/strong-readers-files/UDATED%2026-27ScreeningTechnicalGuidanceaimswebPlus.pdf — Oklahoma aimswebPlus screening guidance; August 2026. VERIFIED.
- https://le.utah.gov/xcode/Title53E/Chapter4/C53E-4-S307_2024050120240501.pdf — Utah Code 53E-4-307 (benchmark reading assessment). SNIPPET.
- https://www.schools.utah.gov/datastatistics/_datastatisticsfiles_/_reports_/_assessments_/K3EarlyLiteracy2020.pdf — Utah K–3 literacy report citing 2012 Acadience monitoring intervals. SNIPPET.
- https://education.ky.gov/curriculum/standards/teachtools/Documents/Decision_Rules_Protocol.pdf — Kentucky decision-rules protocol. SNIPPET.
- https://www.montgomeryschoolsmd.org/departments/techtraining/instructional/mclassreading3d/progressmonitoring — Montgomery County (MD) mCLASS progress-monitoring guidance. SNIPPET (404 when fetched).
- https://www.ecs.org/50-state-comparison-state-k-3-policies-2023/ — Education Commission of the States K–3 policies comparison; June 2023. SNIPPET.

### Policy and market counts

- https://excelined.org/2024_universal-screening-faq-one-pager_final/ — ExcelinEd universal screening FAQ; February 2024. VERIFIED.
- https://s205.q4cdn.com/964897494/files/content_files/MH_Stifel-Investor-Webinar-9-2-26-_vF.pdf — McGraw Hill investor deck (state screening counts); September 2, 2026. VERIFIED as vendor claim.
- https://www.edweek.org/teaching-learning/which-states-have-passed-science-of-reading-laws-whats-in-them/2022/07 — Education Week science-of-reading law tracker; updated August 4, 2026. VERIFIED.
- https://ncme.org/event/comparing-and-evaluating-universal-early-reading-screeners-and-their-uses-in-the-u-s-educational-system/ — NCME event listing with state count; 2025. SNIPPET.

### Journalism and practitioner accounts

- https://www.ednc.org/2021-07-20-mclass-reading-assessment-tool-nc-amplify-science-literacy-learn-classroom-north-carolina/ — EdNC on North Carolina's statewide mCLASS (time, Text Reading Comprehension removal); July 2021. VERIFIED.
- https://www.wayzataschools.org/fs/pages/7744 — Wayzata Public Schools FastBridge CBMreading page; undated. VERIFIED.
- https://wpvip.edutopia.org/wp-content/uploads/2025/02/VES-PM-Schedule.pdf — One school's progress-monitoring schedule (via Edutopia); February 2025. VERIFIED.
- https://busybeekindergarten.substack.com/p/daily-interventions/comments — Kindergarten teacher's comment on weekly DIBELS checks. SNIPPET.
- https://training.asuprepdigital.org/?p=3838 — Online-school teacher forum post on DIBELS baseline and follow-up checks. SNIPPET.
- https://www.colorincolorado.org/node/56523 — Hasbrouck, "Understanding and Assessing Fluency" (practitioner article); c. 2006. VERIFIED.
- https://ufli.education.ufl.edu/wp-content/uploads/2024/05/UFLI-Fluency-Check-1st-Grade-Bundled.pdf — UFLI Foundations Fluency Checks, grade 1 (pilot); May 2024. VERIFIED.
- https://www.bjupresshomeschool.com/pdfs/homeschool/dibels-information.pdf — BJU Press homeschool guidance on using DIBELS; undated (after December 2024). VERIFIED.
- https://outschool.com/how-to-teach/how-to-teach-reading-fluency — Outschool guide to teaching and checking fluency; May 21, 2026. VERIFIED.
- https://www.readnaturally.com/knowledgebase/how-to/24/398 — Read Naturally WCPM how-to video page; undated. VERIFIED (minimal).
- https://readingandmath.org/reading-corps/ — Reading Corps tutors tracking progress; © 2026. VERIFIED (minimal).
- https://www.raz-plus.com/fluency/fluency-timed-reading/ — Raz-Plus timed-reading fluency passages. SNIPPET (403).
- https://en.wikipedia.org/wiki/Running_record — Running record overview (secondary source). VERIFIED.

### Other tools

- https://learn.microsoft.com/en-us/training/educator-center/product-guides/learning-accelerators — Microsoft Learning Accelerators (Reading Progress included in Microsoft 365 Education); updated September 2026. VERIFIED.
- https://learn.microsoft.com/en-us/training/modules/support-reading-fluency-practice-with-reading-progress/ — Reading Progress training module: assignment creation and educator review (accuracy rules, override); 2023–2024. VERIFIED.

### Scholarly (not resolved via LibKey)

- https://www.brtprojects.org/wp-content/uploads/2019/05/TechRpt_1702ORFNorms.pdf — Hasbrouck & Tindal (2017), *An Update to Compiled ORF Norms*, Technical Report 1702, Behavioral Research and Teaching, University of Oregon. Read.
- https://pmc.ncbi.nlm.nih.gov/articles/PMC12662888/ — Ozernov-Palchik et al. (2025), "(Not so) universal literacy screening", *Annals of Dyslexia* 75(3). Read.
- https://openscholar.uga.edu/record/19710/files/blevins_leslie_a_201505_ma.pdf — University of Georgia master's thesis on passage equivalence (2015). SNIPPET.
