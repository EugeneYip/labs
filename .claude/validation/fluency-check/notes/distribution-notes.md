# Fluency Check: search, distribution, pricing, and feedback notes

Prepared 2026-10-10 for the Fluency Check validation study (labs.eugeneyip.net/fluency-check/). This was research only. No accounts were created, nothing was signed into, no groups were joined, no forms were submitted, nothing was posted, and nobody was contacted.

**Evidence labels.** **[V]** VERIFIED: read on the page, or seen directly on 2026-10-10. **[S]** SNIPPET: seen only in search-result text or a secondary summary. **[U]** UNVERIFIED: unconfirmed, or my own inference. Dates are the page's own date where one was shown; otherwise "undated".

## Method and limits

- **Search results pages.** Google (google.com, `hl=en&gl=us`) and Bing (`cc=US&setlang=en-US`) were viewed in a signed-out browser session on 2026-10-10. For each query I recorded the top ~10 organic results, Google's "People also ask" (PAA) and "People also search for" (PASF), and Bing's PAA and "Deep dive into" related searches. Results vary with location, device, personalization, and day, so treat rankings as a snapshot. The research tool's own search engine was also used; for calculator queries it returned mostly spam pages (see 1.2).
- **Autocomplete.** Google's public suggestion endpoint, for 7 seed phrases.
- **No keyword-volume data was available, and no volumes are estimated here.** Relative demand is inferred only from autocomplete, PAA/PASF patterns, and how many tools compete.
- **Blocked or limited.** Our tools are not allowed to fetch or open reddit.com, so subreddit sizes come from GummySearch, a third-party tracker, and subreddit rules come only from search snippets. Facebook groups need a login, so group sizes come only from public articles. These pages returned HTTP 403: a Reading Rockets article, dyslexiaida.org, an LAUSD bulletin, Learning A–Z, and EdInstruments' MAP Reading Fluency page. Opening GitHub in the browser was refused, so a plain HTTP check was used instead (Part 4).
- **Search budget.** The session's shared web-search allowance (200 searches) ran out partway through Part 2, and I did not work around it. Podcast and newsletter audiences, literacy-coach networks, state reading associations, and some subreddit rules are thinner than planned. A follow-up session could fill these gaps.
- **No scholarly journal articles are cited.** The required LibKey connector isn't available.

---

## Part 1: Search opportunity

### 1.1 Demand signals from autocomplete (no volumes)

Google autocomplete, 2026-10-10 [V] (endpoint `suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=…`):

| Seed | Suggestions, in order |
|---|---|
| `wcpm` | wcpm calculator · wcpm · wcpm meaning · wcpm by grade · wcpm reading · wcpm formula · wcpm by grade level · wcpmc · wcpm chart · wcpm music |
| `words correct per minute` | words correct per minute calculator · words correct per minute · …by grade · …formula · …(wcpm) · …chart · …by grade level · what is a good word per minute |
| `oral reading fluency` | oral reading fluency · …assessment · …norms · …is an indicator of · …passages · …assessment pdf free download · …assessment pdf · …chart · …definition · …(orf) |
| `fluency tracker` | fluency tracker · …for students · …pdf free · …accuracy · …app · …chart · …sheet · …free · reading fluency tracker · multiplication fluency tracker |
| `running record` | running records · …assessment · …calculator · …for reading · …examples · …observation · …in early childhood education · …definition · …template · …broken |
| `reading fluency app` | reading fluency app · …for kids · …apps for elementary · …apps for middle school · …app free · map reading fluency app · oral reading fluency app · best reading fluency apps · reading fluency calculator app · nwea reading fluency app |
| `fluency timer` | fluency timer · fluency timer online · reading fluency timer (only 3 suggestions) |

What this suggests (inference [U]): "calculator" is the top completion for both `wcpm` and `words correct per minute`, so calculating WCPM is a recurring need. Norms, by-grade benchmarks, and free PDF passages recur across seeds and PAA boxes. `fluency timer` has only three completions, which suggests thin demand for "timer" wording. `map reading fluency app` and `nwea reading fluency app` show district-licensed platforms in the same search space.

### 1.2 What ranks, query by query (2026-10-10)

All Google and Bing listings below are **[V]** (observed). Google shows the result's breadcrumb rather than a full URL. "Free tool ranks?" means a free web calculator, timer, or tracker in the top 10.

**oral reading fluency calculator**
- Page types: Google returns reading-speed and reading-time calculators plus one intervention blog, under an AI Overview. Bing returns dedicated free WCPM calculators. Free tool ranks: Bing yes (all 10); Google no WCPM tool, only generic speed calculators.
- Google top 5: The Read Time — thereadtime.com · Reading Time Calculator: Words to Minutes | Gorby — gorby.app › tools › reading-time-calculator · Reading Time Calculator - MCPCalc — mcpcalc.com › Education · How to Measure Reading Fluency — smarterintervention.com › blog-highlights · Reading Speed Test: Calculate WPM — scholarwithin.com › reading-speed-test
- Bing top 5: WCPM (Words Correct Per Minute) Calculator — https://www.calculatorultra.com/en/tool/wcpm-calculator.html · WCPM Calculator - 9 Reading Fluency Tools (2026) — https://www.wcpmcalculator.com/ · Oral Reading Fluency (ORF) Score Calculator — https://www.ultimatefinancecalculator.com/calculators/oral-reading-fluency-orf-score-calculator/ · Oral Reading Fluency Calculator – ORF & WCPM Tool | Literacy Arcade — https://literacyarcade.com/orf-fluency-calculator.html · WCPM Calculator - Calculator Academy — https://calculator.academy/wcpm-calculator/
- Google PASF: oral reading fluency calculator app; reading fluency assessment free; reading fluency test online; several "reading time calculator" variants. Bing PAA: How do you calculate oral reading fluency? / How do I score an oral reading fluency check in seconds? / How accurate is the oral reading fluency score calculator? Bing related: reading fluency levels by grade; oral reading fluency norms; hasbrouck and tindal fluency norms.

**WCPM calculator**
- Page types: Google returns generic words-per-minute, reading-time, and speaking-speed calculators (Omni Calculator, MCPCalc, Rows, Teleprompter, TypeQuicker) under an AI Overview. Bing returns WCPM calculators. Free tool ranks: Bing yes; Google not a WCPM-specific one.
- Google top 5: Words per Minute Calculator — omnicalculator.com › everyday-life · Reading Time Calculator - MCPCalc — mcpcalc.com · Reading Time Calculator — rows.com › calculators · Reading Time Calculator - MarkdownTools — markdowntools.io · Free Speaking Speed Calculator & Timer — teleprompter.com › tools
- Bing top 5: https://calculator.academy/wcpm-calculator/ · https://www.wcpmcalculator.com/ · https://www.calculatorultra.com/en/tool/wcpm-calculator.html · https://www.wcpmcalculator.com/tools/ · https://vivaphonics.com/wcpm-calculator/ (further down: calculationmachine.com, calculateany.org, calculator.plus, teachyourkidtoread.org)
- Google PASF: wcpm calculator reading fluency; how to calculate wpm and accuracy; words per minute calculator app; how to calculate words per minute running record. Bing PAA: How is WCPM calculated? / What is the WCPM metric? / How accurate is WCPM?

**words correct per minute calculator**
- Page types: on Bing, an AI answer recommends five free calculators (Calculator Academy, Calculator Ultra, WCPMCalculator.com, Viva Phonics, ReadingFluency.ai), and all 10 results are WCPM calculators. Google returns generic WPM and speech calculators, a YouTube explainer, and one running-record calculator. Free tool ranks: yes on Bing; on Google only goodcalculators' running-record calculator (#8).
- Google top 5: Reading Speed Calculator — 21kschool.com › Calculators · Words Per Minute Calculator — calculator-online.net · WPM Calculator — typequicker.com · Speech calculator — debatrix.com · "Fluency- Words Per Minute Assessment (WCPM)" (YouTube)
- Bing top 5: https://calculator.academy/wcpm-calculator/ · https://www.calculatorultra.com/en/tool/wcpm-calculator.html · https://www.wcpmcalculator.com/ · https://vivaphonics.com/wcpm-calculator/ · https://readingfluency.ai/wcpm-calculator (then ctrlcalculator.com, calculator.plus, yescalculator.com, citationeasy.com, wcpmcalculator.site)
- Google PASF: words correct per minute calculator online / app / wcpm; running record calculator. Bing PAA: How do I determine my student's words correct per minute score? Bing related: free words per minute calculator; words read correctly per minute.

**how to calculate words correct per minute**
- Page types: Google returns an NWEA help article, reading-speed tests, an explainer, a PDF reference card, YouTube, and a Facebook answer page. Bing returns calculators and explainer blogs. Free tool ranks: Bing yes; Google no.
- Google top 5: How are words correct per minute calculated in MAP… — connection.nwea.org · Free Reading Speed Test — outreadapp.com · Words Read Correct Per Minute - An Insight Into Fluency — pld-literacy.org · Fluency Calculator Reference Card — files.readinguniverse.org (PDF) · "Oral Reading Rate Formula" (YouTube)
- Bing top 5: https://calculator.academy/wcpm-calculator/ · How to Calculate Fluency Rate - Informed Literacy — https://informedliteracy.com/calculating-fluency-rate/ · https://www.calculatorultra.com/en/tool/wcpm-calculator.html · https://www.wcpmcalculator.com/ · How to Calculate Words Per Minute Reading — https://countflows.com/blog/how-to-calculate-words-per-minute-reading
- Google PAA: How many WPM should a 7 year old read? Google PASF: WCPM calculator; WCPM by grade-level; words per minute reading test 3rd grade. Bing PAA: Should we count 'words per minute' or 'correct words per minute'?

**reading fluency timer**
- Page types: Bing returns small free web timers (tutoring-company and tool sites), a $15 physical timer, Reading Rockets, and a TpT product. Google returns Reading Rockets, a blog PDF, YouTube, eBay, ReadingFluency.app, Flow Fluency, Reading A–Z, and Acadience. Free tool ranks: Bing yes (#1–4, 7–8); Google no.
- Google top 5: Fluency: In Depth — readingrockets.org › course-modules · Timed Reading for Fluency PDF - Blog — blog.objectiveed.com · Repeated Timed Readings (YouTube) · Timed Reading for Fluency (book) — ebay.com · Reading Fluency Assessment App for Teachers — readingfluency.app
- Bing top 5: Reading Fluency Timer & WCPM Calculator - Elite — https://www.elitehometutoring.com/reading-fluency-timer.html · Oral Reading Fluency Timer — Free Online Tool | ReadLivo — https://readlivo.com/tools/fluency-timer/ · Reading Fluency Timer — WCPM Calculator with Grade Benchmarks — https://lans.cloud/reading-fluency-timer · Reading Fluency Timer — https://www.theonlinereadingtutor.com/reading-fluency-timer · Fluency Timer | Really Great Reading — https://portal.reallygreatreading.com/shop/fluency-timer
- Google PAA: How to progress monitor reading fluency? / What are the best apps for improving reading fluency? Bing PAA: What is a timed repeated reading?

**fluency timer app**
- Page types: app-store listings (an App Store timer for speaking practice, Google Play's ReadFluent), ReadingFluency.app, a blog, and Flow Fluency. A Google result titled "[app request] oral reading fluency timer for educators" (2 comments, 10 years old, apparently a forum thread) is a faint demand signal. Free tool ranks: Bing yes (lans.cloud, Elite); Google mostly apps.
- Google top 5: Classroom Fluency Timer — apps.apple.com · Reading Fluency Timer: WCPM — play.google.com · ReadFluent: Oral Reading Timer — clearstackapps.com › apps › readfluent · readingfluency.app · Use Apps to Help with Reading Fluency — readabilitytutor.com › blog
- Bing top 5: Reading Fluency Timer: WCPM - Apps on Google Play — https://play.google.com/store/apps/details?id=com.clearstackapps.readfluent · Classroom Fluency Timer on the App Store — https://apps.apple.com/us/app/classroom-fluency-timer/id1104853948 · Fluency Apps — http://getfluencyapps.com/ · (App Store, Korean storefront) · https://lans.cloud/reading-fluency-timer
- Google PAA: What is the best app for reading fluency? Bing PAA: How does a 1-minute fluency probe work? / Is AI scoring available in readingfluency app?

**one minute reading fluency test**
- Page types: mixed intent. Adult reading-speed tests (SwiftRead, Scholar Within, The Read Time) sit next to publishers (Reading A–Z, Read Naturally, HMH, Pearson) and Acadience. Free tool ranks: thetimerplace.com (#7 Bing) and readingfluency.ai's free assessment (#4 Bing).
- Google top 5: Fluency Timed Reading Assessments — readinga-z.com · One Minute Reader Placement Guide — readnaturally.com · Reading Speed Test — scholarwithin.com · Oral Reading Fluency Assessment: Optimizing Instruction — hmhco.com › blog · Free Reading Speed Test (1 Minute) — swiftread.com
- Bing top 5: https://swiftread.com/reading-speed-test · https://www.readinga-z.com/assessments/fluency-timed-reading/ · https://scholarwithin.com/reading-speed-test · https://readingfluency.ai/tools/free-assessment · https://www.readnaturally.com/article/one-minute-reader-placement-guide
- Google PASF: one minute reading fluency test pdf / free / online; free one minute reading passages pdf; oral reading fluency assessment PDF free download. Bing related: free printable fluency reading passages; 1 minute fluency passages pdf.

**oral reading fluency progress monitoring**
- Page types: authorities and publishers (Reading Rockets, DIBELS at the University of Oregon, Read Naturally, NWEA, FCRR, Classworks, NCII's tools chart). On Bing, two free trackers rank: a free TpT Excel tracker (#3) and readingcoachkit.com (#4).
- Google top 5: Screening, Diagnosing, and Progress Monitoring for Fluency — readingrockets.org · DIBELS 8th Edition Materials — dibels.uoregon.edu › materials · Reading Fluency Progress Monitor — readnaturally.com · Progress Monitoring — teach.mapnwea.org · What your oral reading fluency assessment data is really… — ignite-reading.com (#8: Academic Progress Monitoring Tools Chart — charts.intensiveintervention.org)
- Bing top 5: https://www.readingrockets.org/topics/fluency/articles/screening-diagnosing-and-progress-monitoring-fluency-details · https://dibels.uoregon.edu/materials/dibels · FREE Oral Reading Fluency Tracker - TPT — https://www.teacherspayteachers.com/Product/FREE-Oral-Reading-Fluency-Tracker-17452836 · Reading Fluency Tracker — Free WCPM Progress Monitoring — https://www.readingcoachkit.com/ · https://teach.mapnwea.org/impl/maphelp/Content/ReadFluency/ProgressMonitoring.htm
- Google PAA: How to progress monitor reading fluency? / Does iReady have a progress monitoring tool? Google PASF: mostly "DIBELS oral reading fluency … PDF free download / passages / grade". Bing related: reading progress monitoring tool; fluency progress chart; reading fluency tracker.

**fluency progress monitoring graph**
- Page types: printable templates (TpT, Pinterest), university resources (Meadows Center, IRIS at Vanderbilt), teacher blogs, NWEA. No interactive tool in the top 10 on either engine.
- Google top 5: Progress-Monitoring Line Graph — meadowscenter.org · Fluency Graph — teacherspayteachers.com › browse › free · Fluency Progress Monitoring Chart — pinterest.com · Page 4: Create a Graph — iris.peabody.vanderbilt.edu · Graphing Student Progress — flowfluency.com › blog
- Bing top 5: My Fluency Progress Monitoring Graph (TPT) — https://www.teacherspayteachers.com/Product/My-Fluency-Progress-Monitoring-Graph-608957 · Fluency Progress Monitoring FREE (TPT) — https://www.teacherspayteachers.com/Product/Fluency-Progress-Monitoring-FREE-1393692 · https://meadowscenter.org/resource/progress-monitoring-line-graph/ · https://somedivineintervention.wordpress.com/2013/03/28/my-fluency-progress-monitoring-graph/ · https://mrsjudyaraujo.com/progress-monitoring-graphs/
- Google PASF: fluency progress monitoring graph template / pdf / example; how to make a progress monitoring graph in Excel; free progress monitoring tools. Bing related: progress monitoring line graph excel; reading fluency graph template.

**ORF norms**
- Page types: authorities and publishers (Reading Rockets, Read Naturally, NCII, the University of Oregon's DIBELS goals, district PDFs) plus newer content sites (flowfluency.com, readflare.com, readingfluency.ai, storytimeaiapp.com). No calculator ranks.
- Google top 5: Fluency Norms Chart (2017 Update) — readingrockets.org · Hasbrouck-Tindal oral reading fluency chart — readnaturally.com · Oral Reading Fluency Norms: Understanding Benchmarks — flowfluency.com · Hasbrouck-Tindal ORF norms: the WCPM benchmarks — storytimeaiapp.com · An Update to Compiled ORF Norms — aimpa.org (PDF)
- Bing top 5: https://www.readingrockets.org/topics/fluency/articles/fluency-norms-chart-2017-update · https://www.readnaturally.com/article/hasbrouck-tindal-oral-reading-fluency-chart · https://dibels.uoregon.edu/sites/default/files/2021-06/DIBELS8thEditionGoals.pdf · https://www.readnaturally.com/userfiles/ckfiles/files/orf-national-norms.pdf · https://intensiveintervention.org/resource/update-compiled-orf-norms
- Google PASF: orf norms chart pdf; oral reading fluency norms 2023 pdf / 2024 pdf / 2025; Hasbrouck and Tindal 2017. Bing PAA: What are ORF norms? Bing related: dibels orf norms; reading fluency levels chart.

**Hasbrouck Tindal norms**
- Page types: the same authorities, a ResearchGate copy of a journal article, state and consultant PDFs, and content sites. Google showed no AI Overview here.
- Google top 5: readnaturally.com (H-T chart) · readingrockets.org (2017 update) · storytimeaiapp.com glossary · flowfluency.com · researchgate.net (journal article copy, not cited here)
- Bing top 5: Reading Rockets 2017 update · Read Naturally table · https://www.readingrockets.org/sites/default/files/2023-08/2017_ORF_NORMS.pdf · Colorado Dept. of Education PDF (cde.state.co.us) · Keys to Literacy PDF (keystoliteracy.com)
- Google PASF: Hasbrouck and Tindal fluency norms PDF; 2017; 2006; reading fluency chart by grade level pdf.

**running record timer**
- Page types: running-record calculators (literacy) mixed with athletic and stopwatch timers. Free tool ranks: yes, as calculators.
- Google top 5: Running Record Calculator — wordcalc.com › runningrecord · goodcalculators.com › running-record-calculator · runningrecordcalculator.com · Run Timer (athletic app, Google Play) · Running Records Calculator — thedailycafe.com
- Bing top 5: https://www.wordcalc.com/runningrecord/ · https://runningrecordcalculator.com/ · https://goodcalculators.com/running-record-calculator/ · gymtimerx.com running timer · visualtimer.com race timer (then speedreadr.com/runningrecord, forcesguide.com)
- Google PASF: running record timer online / free / app; running record accuracy rate.

**running record app**
- Page types: entirely athletic running apps on both engines (Strava, Map My Run, Runkeeper, Nike Run Club, "best running apps" round-ups). No literacy result in the top 10. Out of reach for a literacy tool.

**running record calculator**
- Page types: about a dozen dedicated free calculators plus apps. Free tool ranks: all of the top 10.
- Google top 5: wordcalc.com · goodcalculators.com · runningrecordcalculator.com · Running Record Calculator Pro — apps.apple.com · whataresyllables.com › tool (then wordcounter.ai, myaiotools.com, RunRecord Calc on Google Play, Softonic)
- Bing top 5: https://www.wordcalc.com/runningrecord/ · https://goodcalculators.com/running-record-calculator/ · https://runningrecordcalculator.com/ · https://myaiotools.com/calculators/running-record-calculator/ · https://www.bexteachingresources.com/runningrecord
- Google PAA: What is a good self-correction rate for a running record? Google PASF: running record calculator with timer; running record calculator WPM. Bing related: self correction rate calculator; running record accuracy chart.

**free fluency assessment**
- Page types: readingfluency.ai (an AI-scoring startup) is #1 on both engines, followed by publishers' free diagnostics (Really Great Reading, Lumos, Spencer Learning, Reading A–Z), teacher blogs, and TpT (speech-therapy "fluency", meaning stuttering, also appears).
- Google top 5: Free reading fluency assessment for grades 1–5 — readingfluency.ai › tools › free-assessment · Complimentary Reading Assessments (K-12) — reallygreatreading.com · Grades 1–6 — dbqschools.org · Free Ultimate Phonics Reading Test — spencerlearning.com · Free Online Fluency Predictor — lumoslearning.com
- Bing top 5: https://readingfluency.ai/tools/free-assessment · https://readingfluency.ai/ · https://www.lumoslearning.com/llwp/free-reading-fluency-program.html · https://mrsjudyaraujo.com/free-literacy-assessments/ · TPT Free Fluency and Stuttering Assessments
- Google PAA: What is a free app for reading fluency? Google PASF: free fluency assessment pdf / passages; oral reading fluency assessment PDF free download.

**fluency passages free**
- Page types: passage libraries (RIF, Reading A–Z, Lexia PDFs, state DPI, Lumos, worksheet sites, TpT freebies). readingfluency.ai is #1 on Bing.
- Google top 5: Grade Level Reading Passages — rif.org · Fluency Practice Passages — readinga-z.com · Grades 1–6 — dbqschools.org · Fluency for 2nd Grade — dpi.nc.gov · Reading Fluency Sample Passages - FREEBIE — teacherspayteachers.com
- Bing top 5: https://readingfluency.ai/tools/fluency-passages · https://www.rif.org/literacy-central/collections/leveled-reading-passages · Lexia PowerUp Fluency Passage Pack (PDF) · https://www.readinga-z.com/fluency/fluency-practice-passages/ · https://onemoresheet.com/worksheets/reading-comprehension/fluency-passages/
- Google PASF: grade-specific "fluency passages free pdf" variants. Bing related: free oral reading fluency online.

**Cross-cutting observations**
- labs.eugeneyip.net did not appear in any top-10 list above, on either engine [V].
- Google showed an AI Overview for 15 of the 16 queries (not for "Hasbrouck Tindal norms") [V]. For "oral reading fluency calculator" it gave the formula and the manual steps, which answers the informational need without a click (the effect on clicks is inference [U]). No sponsored results were seen on Google for these queries [V].
- The research tool's own search engine returned spam for the calculator queries: rewritten articles on unrelated or compromised domains (e.g., pop.freespeechforpeople.org, sa.reviveourhearts.com, cvs.pantherdb.org, voip.puri.sm) [S]. Some indexes clearly treat this niche as low-competition spam territory.
- **Count of free tools.** About 35 distinct free web calculators, timers, or trackers appeared across the captured top-10 lists: ~15 WCPM/ORF calculators, 5 fluency timers, ~14 running-record calculators, and 1 standalone tracker (by title and domain [V]; that each one works and is free was checked only for those in 1.3). Several titles carry "(2026)", and multiple exact-match domains exist (wcpmcalculator.com, wcpmcalculator.site, runningrecordcalculator.com). This looks like a recent wave of small SEO tools (inference [U]).

### 1.3 Free or low-cost tools now competing directly (checked 2026-10-10)

| Tool | What it does | Account? | Where data lives | Price | Label |
|---|---|---|---|---|---|
| wcpmcalculator.com | 9 tools incl. a WCPM calculator with a live timer; errors entered as a total; session history; a Progress Tracker with charts | No (says no registration or login is needed) | Session history on the device | Free (says all nine tools are free) | [V] https://www.wcpmcalculator.com/ |
| readingcoachkit.com | Fluency Tracker (WCPM by date vs Hasbrouck–Tindal percentiles, trend line, weekly growth, PDF) and a running-record calculator; no timer or word marking | No (accounts announced as coming later); PDF download asks for a school email | Says student data never leaves the device | Free; Heggerty and Amplify shown as sponsors | [V] https://www.readingcoachkit.com/ |
| lans.cloud fluency timer | 60-second countdown with a beep, or whole passage; tap the last word read; errors entered afterward; WCPM, accuracy, H–T bands | Not stated | Not stated; no saving | Free (optional Ko-fi) | [V] https://lans.cloud/reading-fluency-timer |
| ReadLivo | Paste a passage, 1-minute timer, mark errors afterward, WCPM vs mid-year 50th-percentile norms (grades 1–5) | No (says no signup is needed) | Not stated | Free | [V] https://readlivo.com/tools/fluency-timer/ |
| Elite Home Tutoring timer | Stopwatch, error-count field, WCPM, accuracy, spring ranges by grade | No | Runs in the browser; nothing stored | Free (from a tutoring company in business since 2005) | [V] https://www.elitehometutoring.com/reading-fluency-timer.html |
| Literacy Arcade | Live timer, error count, WCPM, accuracy, H–T rating, printable "recent results" table | Not stated | Not stated | Not stated | [V] https://literacyarcade.com/orf-fluency-calculator.html |
| ReadingFluency.ai | AI scores a 60-second read against H–T norms; teacher can override | Yes (free classroom account) | Not stated; claims FERPA and COPPA alignment | Teachers free, described as permanent; schools by custom quote | [V] https://readingfluency.ai/ |
| ReadingFluency.app | Tap words to mark miscues; optional AI scoring; recording; CSV import and export; live group sessions | Teacher login (implied; students need none for live sessions) | Not stated | Free tier (manual scoring, 150 credits); Teacher Plus $8/mo or $96/yr early-bird (standard $192/yr); schools custom | [V] https://readingfluency.app/ |
| ReadFluent (Android, ClearStack Apps) | Tap anywhere to count each error; WCPM and accuracy; per-child chart; median of three; parent report | No | On the device; sends crash reports and anonymous usage stats | $2.99/mo, $9.99/yr, or $14.99 once; free limit 1 child and 5 readings; Google Play shows 10+ downloads, updated Sep 7, 2026, release notes say first release | [V] https://clearstackapps.com/apps/readfluent · https://play.google.com/store/apps/details?id=com.clearstackapps.readfluent |
| "Easy Reading Fluency Classroom Timer and Data Tracker" (TpT, KJ Dynamic Educators) | Browser app: 60/90-second timer, WCPM, H–T percentile, up to 30 students, trend line, CSV export | No signup | Local-first (says student data stays on the device) | $9.99, single-classroom license | [V] https://www.teacherspayteachers.com/Product/Easy-Reading-Fluency-Classroom-Timer-and-Data-Tracker-16226494 |
| Microsoft Reading Progress | Students record readings; the teacher marks or auto-detects errors (preview); Accuracy rate and Correct words per minute cards | School Microsoft 365 / Teams account | Microsoft cloud | Described as a "free tool built into Microsoft Teams"; Learning Accelerators available with the free Office 365 A1 | [V] https://support.microsoft.com/en-us/topic/7617c11c-d685-4cb7-8b75-3917b297c407 · https://www.microsoft.com/en-us/education/learning-tools/learning-accelerators |
| Google Read Along in Classroom | Reading reports with accuracy, speed, comprehension | Workspace for Education | Google cloud | In all Workspace for Education editions; progress across assignments needs Education Plus or the Teaching and Learning Upgrade | [V] https://support.google.com/edu/classroom/answer/14174515?hl=en |

What still sets Fluency Check apart (from PRODUCT_LOG.md and the app [V]): tapping the specific words misread on the passage during the reading, with self-corrections, a printable marked record, a per-student chart, and CSV export and import, all free, with no account and on the device. Among the tools checked, only ReadingFluency.app (account, freemium) and ReadFluent (paid Android app that counts taps without word positions) clearly mark errors live. The $9.99 TpT app says to count errors while the student reads, without saying how. None of the free, no-account tools checked clearly marks specific words on the passage *during* the reading; ReadLivo has you mark misread words after the timer ends, and its page doesn't say how. Most competitors do show Hasbrouck–Tindal comparisons, which Fluency Check deliberately leaves out (whether they have permission to reproduce the table is unknown [U]).

**Correction to the problem statement.** PRODUCT_LOG.md says the digital options are paid apps, licensed publisher platforms, or spreadsheet add-ons. As of 2026-10-10 that's no longer accurate: several free, no-account browser tools with timers and on-device history exist, and Microsoft's Reading Progress is free in Teams.

### 1.4 Part 1 conclusions

1. **Volume is unknown.** The signals point to steady informational demand around calculating WCPM, norms by grade, and free printable passages and assessments. They point to thin demand for "timer" wording.
2. **The calculator and timer niche is crowded and turning over fast.** On Bing, free WCPM calculators fill most or all of the top 10 for every calculator query, including exact-match domains and 2026-dated tools. Google serves the same queries mostly with generic reading-speed calculators, so it may be underserved by a genuinely useful WCPM page (inference [U]). Either way, a bare calculator is a commodity.
3. **Possibly winnable by a small free tool:** "WCPM calculator", "words correct per minute calculator", "oral reading fluency calculator", and "reading fluency timer", but only against dozens of similar pages, and only a page aimed at the calculator intent would compete. Long-tail phrasings such as WCPM with a timer, tapping words, no login, or longer-than-one-minute readings might be easier, but their volume wasn't checked [U].
4. **Dominated by publishers and authorities:** ORF norms and Hasbrouck–Tindal norms (Reading Rockets, Read Naturally, NCII, the University of Oregon), ORF progress monitoring, the "one minute reading fluency test", and free passages and assessments (readingfluency.ai, Reading A–Z, RIF, Lumos, TpT). Fluency Check has three practice passages and no norms table, so it can't compete for those intents.
5. **Out of reach:** "running record app" (athletic intent). Running-record calculator queries are crowded, and Fluency Check lacks running-record features (error types, self-correction ratio).
6. **For the pilot:** search is not a realistic way to recruit pilot users in the near term. Fluency Check doesn't rank, and the queries it fits best are the most crowded.

---

## Part 2: Communities and professional multipliers (none were joined or posted to)

### 2.1 Reddit

reddit.com couldn't be opened by our tools. The figures are GummySearch's third-party snapshots [V on GummySearch, not on Reddit].

| Subreddit | Members (yearly growth) | GummySearch date | Promotion and survey rules |
|---|---|---|---|
| r/Teachers | 2.4M (+237k, 10.8%) | 2026-10-07 | The sidebar note says posts from brand-new or low-karma accounts are screened and approved by hand [V via GummySearch]. The rules wiki, seen only in a mirror's search snippet, allows surveys only from accredited academic programs or credible media, bars surveys that link to a commercial product or app, and treats accounts that mainly promote as self-promotion [S] (official page reddit.com/r/Teachers/wiki/rules not checked [U]). |
| r/homeschool | 241k (+35k, 17.0%) | 2026-10-07 | Not verified [U] |
| r/teaching | 196k (+27k, 16.3%) | 2026-10-07 | Not verified [U] |
| r/slp (speech-language pathologists) | 73k (+10k, 15.9%) | shown as 2026-10-11 | Not verified [U] |
| r/specialed | 55k (+12k, 26.5%) | 2026-10-01 | Not verified [U] |
| r/Dyslexia | 40k (+5k, 15.1%) | 2026-10-07 | Not verified [U] |
| r/ElementaryTeachers | 26k (+8k, 42.8%) | 2026-10-01 | Not verified [U] |
| r/Tutoring | ~6k (+4k, 160.7%) | 2026-10-01 | Not verified [U] |
| r/scienceofreading | 772 (+25, 3.3%) | 2026-06-23 | Not verified [U] |
| r/SpecialEdTeachers | ~580 | 2026-06-29 | [S] |

Sources: https://gummysearch.com/r/Teachers/ · /r/homeschool/ · /r/teaching/ · /r/slp/ · /r/specialed/ · /r/Dyslexia/ · /r/ElementaryTeachers/ · /r/Tutoring/ · /r/scienceofreading/ · https://gummysearch.com/r/SpecialEdTeachers [S]. Note that the science-of-reading conversation is small on Reddit (772 members) and lives mainly on Facebook (2.2).

### 2.2 Facebook groups (no login, so only public mentions)

- **Science of Reading – What I Should Have Learned in College.** Created Aug 14, 2019, by retired educator Donna Hejtmanek. It reached 50,000 members in October 2020 and was then adding about 1,000 a week [V] (Voyager Sopris blog, updated Jan 20, 2021: https://voyagersopris.com/blog/edview360/how-i-started-the-science-of-reading-what-i-should-have-learned-in-college-facebook-page-and-why-teachers-need-it). About 80,000 members by Feb 2022 [S] (Lexia podcast listing: https://lexialearning.com/resources/podcasts/the-science-of-reading-why-didnt-we-learn-what-we-needed-to-know-in-college). More than 100,000 members [S] (ESEA session page, undated: https://www.eseanetwork.org/sched/E22/session/reinventing-professional-learning-teaching-the-science-of-reading-through-social-media).
- **Spin-off groups** named in the same Voyager Sopris post [V]: an *Equipped for Reading Success* book-study group (5,000+), Teaching Reading Rocket Scientists (for university faculty), Science of Reading for School Administrators, a Science of Reading Kindergarten/First Grade discussion group, Michigan's own version of the group, and Science of Reading Hub for Professional Development.
- **Amplify's groups.** Amplify lists "Science of Reading: The Community" and "Boost Reading & mCLASS" among seven Facebook groups, with no member counts shown [V] (https://amplify.com/community/). A claim of tens of thousands of educators appeared only in a snippet [S].
- **Groups for reading interventionists, literacy coaches, reading specialists, special education teachers, homeschool reading, and tutors:** none could be confirmed with sizes without logging in. Searches limited to facebook.com returned mostly Pages, not Groups. For example, the NASET page shows about 52,913 likes, and a "Special Education Teaching Resources" public group shows 253 members [S]. Group discovery would need a logged-in session, which was out of scope.

### 2.3 Professional associations and networks

| Organization | Size and structure | Relevance to Fluency Check | Label and source |
|---|---|---|---|
| International Literacy Association (ILA) | Its site describes over 300,000 educators in 75 countries in one place and 128 countries in another; founded 1956 (as the International Reading Association); no chapter count shown | Broad literacy audience, journals, and a magazine; state affiliates exist, but no count was found | [V] https://literacyworldwide.org/about-us · https://www.literacyworldwide.org/get-involved/chapters-and-affiliates |
| The Reading League (TRL) | Homepage says 46 state chapters (another section says 40); was 39 states plus DC on Feb 4, 2025; its conference is described as drawing thousands | Science-of-reading center of gravity; state chapters run local events | [V] https://www.thereadingleague.org/ · press release: https://smb.thepostsearchlight.com/article/The-Reading-League-welcomes-new-chapters-in-seven-states-as-evidence-aligned-reading-instruction-expands-in-the-US/67a238010feb870d1b5585c4 |
| International Dyslexia Association (IDA) | About 8,500 to 13,000+ members and 42–48 branches, depending on the page (undated); dyslexiaida.org returned 403 | Branches reach structured-literacy tutors and parents | [S] https://en.wikipedia.org/wiki/International_Dyslexia_Association · https://ia.dyslexiaida.org/about-us/membership/ |
| Council for Exceptional Children (CEC) | About 29,000 members per its ad media kit (© 2025); units in all 50 states and Canada; 18 divisions; student chapters at hundreds of colleges (page updated Feb 3, 2026) | Special education teachers write IEP fluency goals and monitor progress | [V] https://mediakitpublic.multiview.com/CEC · https://exceptionalchildren.org/about-us |
| State reading associations | Not researched in depth (search budget ran out) | ILA affiliates and TRL chapters are the likely routes | [U] |
| National Tutoring Association (NTA) | Membership required for its tutor certification; Wikipedia claims 14,000+ certified tutors, citing a 2017 source | Tutor credentialing body | [S] https://www.ntatutor.com/certification/ · https://en.wikipedia.org/wiki/National_Tutoring_Association |
| Reading Corps (AmeriCorps; Minnesota origin) | 3,000+ tutors a year, nearly 2,000 schools a year, 449,920 students served | Monitors students weekly with FastBridge measures and **its own data system**, so it is unlikely to adopt an outside tool | [V] https://minnesotareadingcorps.org/reading-corps/ · https://proventutoring.org/reading/reading-corps/ (posted Apr 7, 2021) |
| Academy of Orton-Gillingham Practitioners and Educators (AOGPE) | 4,000+ members worldwide; Associate, Certified, and Fellow levels; Fellows run training courses | Structured-literacy practitioners, many working privately (inference [U]) | [S] https://web.cvent.com/event/6068fb55-d595-45a4-8b58-0fe8f1fb7c31/summary |
| Literacy-coach networks | No standalone national coach network identified (search budget). Coaches appear as a target segment in vendor materials (2.5) | Reachable through ILA, TRL, and science-of-reading groups (inference) | [U] |

### 2.4 Teacher marketplaces, creators, and podcasts

- **Teachers Pay Teachers.** A first-visit popup claims that 85% of teachers and millions of parents use TPT [V, TpT's own marketing, seen 2026-10-10]. RAND research summarized by K-12 Dive (Dec 10, 2019) found 55% of ELA teachers use TpT at least weekly [V] (https://www.k12dive.com/news/report-popular-online-teaching-materials-poorly-aligned-with-academic-st/568721/).
- **TpT search counts** [V, 2026-10-10]: "fluency tracker" 4,229 results (includes math facts); "reading fluency tracker" 2,200+; "oral reading fluency progress monitoring" 410+.
- **TpT price points and review counts** [V] (https://www.teacherspayteachers.com/browse?search=reading%20fluency%20tracker and …?search=oral%20reading%20fluency%20progress%20monitoring):
  - Tracker-only products cost $1.00–$4.00 with 2–38 reviews. Examples: Reading Fluency Tracker with Goal Setting, $1.00 (34 reviews); Reading Fluency Tracker, Mrs Jacksons Class, $2.00 (38); Whole Class Digital Reading Fluency Tracker, $2.00 (19); Google Sheets tracker, $3.95 (2); Fluency Gumball Machine, $4.00 (12).
  - Passages bundled with a tracker sell best: MagiCore's grade packs are $10.00 with 162–261 reviews, and its bundle is $19.50 on sale with 315 reviews.
  - ORF progress-monitoring passage sets cost $4–$10 per grade with 6–56 reviews (The Reading Intervention Room $9–$10, up to 56 reviews; Teach Middle $4 per grade; The Simple Teachers $7.70, 43 reviews).
  - A free Excel ORF tracker (The Data Coach) upsells a paid multi-student dashboard [V]. The $9.99 browser timer app is in 1.3.
  - Reading of this (inference [U]): the money on TpT is in **passages and content**. Tracking tools alone sell for a few dollars.
- **Podcasts and newsletters** (audience sizes not found; search budget):
  - Amplify's *Science of Reading: The Podcast* (6+ seasons; an episode features the Facebook group's founder) [S] (https://amplify.com/episode/science-of-reading-the-podcast/season-6/episode-11-what-i-should-have-learned-in-college-with-donna-hetjmanek/).
  - Voyager Sopris's EDVIEW360 podcast [S] (https://www.voyagersopris.com/podcasts/2021/the-science-of-reading-why-didnt-we-learn-what-we-needed-to-know-in-college).
  - Lexia's podcast [S] (link above).
  - Reading Rockets, which ranks across most of the queries in 1.2 [V].
  - Creators popular in this space beyond these (e.g., independent literacy podcasts and newsletters) were not checked [U].

### 2.5 Are multipliers stronger distribution nodes than individual teachers?

| Node | Leverage (evidence) | Constraint (evidence) | Assessment |
|---|---|---|---|
| **Literacy coaches and reading specialists** | Each supports many teachers (inference). Vendors build for them: readingcoachkit.com calls itself a toolkit for coaches and literacy specialists [V]; ReadingFluency.app targets interventionists and coaches and puts team workspaces in its paid tier [V]. Reading Corps tutors review data with coaches [V]. | Screening and official progress monitoring usually run on district-licensed systems (mCLASS, aimswebPlus, MAP Reading Fluency, DIBELS Data System, FastBridge; Part 3) [V]. Decisions rely on graphs built from standardized passages [S] (Reading Rockets summary via search). | **Strong recommenders for informal checks, practice reads, and teacher-chosen passages; weak for official progress monitoring.** Probably the best single node. |
| **Reading and intervention coordinators, MTSS leads** | They control which tools are allowed (inference). | They pick tools against evidence charts; NCII's progress-monitoring tools chart ranks on Google for ORF progress monitoring [V]. Fluency Check has no standardized passages or psychometric evidence [V, by design]. | **Gatekeepers, not early adopters.** Worth knowing about, not recruiting first. |
| **Tutoring-company leads and independent tutors** | Often outside district licenses (inference). Some build their own tools: Elite Home Tutoring's free timer [V]. r/Tutoring is small but grew 160% in a year [V via GummySearch]. | Large programs are locked in: Reading Corps uses FastBridge and its own data system [V]. | **Promising for small and independent tutoring businesses; national programs are poor targets.** |
| **Structured-literacy trainers** (Orton-Gillingham, IDA, TRL chapters) | One trainer's endorsement reaches many practitioners (inference). AOGPE has 4,000+ members [S]; TRL has 46 chapters [V]. | Credibility depends on faithful scoring rules. Fluency Check now follows DIBELS 8 rules more closely [V, PRODUCT_LOG 2026-10-09]. They will expect norms and accuracy. | **High leverage if one endorses it; needs an expert review first.** |
| **Teacher-prep instructors** | Pre-service teachers practice administering ORF (inference [U]). A free tool with no account and no student data in the cloud avoids procurement in coursework (inference). A faculty spin-off group exists ("Teaching Reading Rocket Scientists") [V]. | Use may end when students graduate; course calendars are slow (inference). | **Good low-risk channel for practice use; weak signal of retention.** |
| **Individual classroom teachers** | The largest pool (r/Teachers 2.4M [V via GummySearch]). | Strict survey and promotion rules [S]; mandated district tools [V]; free incumbents such as Reading Progress [V]. | **Hard to reach honestly at scale; better reached through the nodes above.** |

### 2.6 Part 2 conclusions

1. Science-of-reading educators gather mainly on Facebook (groups of 50k–100k+, by older public counts) and through TRL chapters, ILA, IDA, and CEC. Reddit's teacher communities are large but restrict promotion and product-linked surveys, and the science-of-reading subreddit is tiny.
2. Multipliers are likely stronger channels than individual teachers, with caveats. Coordinators and national tutoring programs are locked into licensed, standardized systems. The most realistic early nodes are (a) literacy coaches and reading specialists, for informal and practice checks; (b) independent structured-literacy tutors and small tutoring businesses; and (c) teacher-prep instructors.
3. Evidence about specific Facebook groups for coaches, interventionists, tutors, and homeschool reading, and about podcast audiences, is thin because of the login wall and the search budget. Recruiting there would need a human, logged-in review that respects each group's rules.

---

## Part 3: Pricing expectations

### 3.1 What comparable tools cost

| Product | Price | Model | Label and source |
|---|---|---|---|
| DIBELS 8 materials and DIBELS Data System (paper, manual scoring) | Materials free to download; DDS $1 per student, plus a $200 setup fee [S]; Amplify sells training at $49 per person and printed kits at $42–$76, and accepts purchase orders | Institutional | $1: [V] https://edinstruments.org/node/292 (undated) · $200 setup: [S] Louisiana fiscal note https://legis.la.gov/legis/ViewDocument.aspx?d=1361772 · training, kits, purchase orders: [V] https://dibels.amplify.com/help/pricing |
| mCLASS DIBELS 8 (Amplify, digital) | $8.00 per student for consortium members in 2026–27; $14.00 bundled with intervention and Boost Reading | Institutional | [V] https://horizon.ok.gov/vendor-amplifyeducation |
| aimswebPlus (Pearson) | Reading $4.50, Complete $7.75 per student per year (new customers); Unlimited $4,995 a year for districts of 2,500 students or fewer; $500 minimum first order (Complete). A search snippet showed $4.25 / $7.50 / $300, so prices have moved. | Institutional | [V] https://www.pearsonassessments.com/learningassessments/products/100000519/aimsweb.html |
| easyCBM | Lite free (individual teacher, 200 students, progress-monitoring measures); Deluxe $69.99 a year (was $49.99 from July 2021); District price by quote | Freemium individual plus district | [V] https://easycbm.com/pricing/index.html · [S] https://help.easycbm.com/article/1003-title-july-1-2021-subscription-price-increase |
| Acadience Reading (formerly DIBELS Next) | About $3 per student with manual score entry; $7.45–$9.45 per student digital (California and Kentucky documents) | Institutional | [S] https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5adec2024.docx · https://www.education.ky.gov/curriculum/conpro/engla/Documents/Acadience_Reading.pdf |
| NWEA MAP Reading Fluency | About $6–$7.50 per student; one listing adds $3,000 onboarding | Institutional | [S] Kentucky screener summary https://www.education.ky.gov/curriculum/conpro/engla/Documents/MAP_Reading_Fluency.pdf · onboarding: https://edinstruments.org/instruments/measures-academic-progress-map-reading-fluency (403) |
| Literably | About $10 per student per year plus a 20% implementation fee (screener) | Institutional | [S] https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5gdec2024.docx · https://education.ky.gov/curriculum/conpro/engla/Documents/literably_Screener.pdf (fetched, text unreadable) |
| Amira | $20 per student per year (tutoring cycle); about $4.99 per student for the screener alone (California document, Dec 2024) | Institutional | $20: [V] https://nssa.stanford.edu/organizations/amira-learning (undated) · $4.99: [S] https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5bdec2024.docx |
| Raz-Plus (Learning A–Z) | Per-classroom license: $218–$238 in 2024 promotions against a $248 list price; CDN$300 for 2025–26 in Manitoba | Classroom subscription | [S] https://www.learninga-z.com/user_area/content_media/raw/merlin-learning-a-z-flyer.pdf (learninga-z.com returned 403) |
| Read Naturally Reading Fluency Progress Monitor | $49 per grade level (30 passages, manual graphs; timers sold separately) | One-time purchase (content) | [V] https://www.readnaturally.com/product/reading-fluency-progress-monitor |
| Texthelp Fluency Tutor | Retired Dec 31, 2024, after declining use; an undated review gave $2,245 per school for the first year | Discontinued | [S] https://www.texthelp.com/en-au/products/fluencytutor (now redirects to a 404 page) · https://www.techlearning.com/news/put-to-the-test-texthelp-systems-fluency-tutor |
| Microsoft Reading Progress / Google Read Along | Free with school Microsoft 365 / Google Workspace for Education (Read Along's progress tracking across assignments needs a paid edition) | Free with platform | [V] see 1.3 |
| ReadingFluency.ai / ReadingFluency.app | Free for teachers / free tier, then $8/mo or $96/yr; schools by quote | Free individual, paid school; freemium | [V] see 1.3 |
| App Store and Google Play | Running Record Calculator (Binary Hub) $3.99, rating recently reset; Fluence $3.99, too few ratings to show; Running Record Assistant's US store page returns 404 (earlier listed at $2.99 [S]); Classroom Fluency Timer free, 1 rating [S]; ReadFluent subscription or $14.99 once, 10+ downloads | Paid apps and subscriptions | [V] https://apps.apple.com/us/app/id963571823 · https://apps.apple.com/us/app/id1509310782 · ReadFluent links in 1.3 |
| Really Great Reading physical fluency timer | $15 | Hardware | [S] https://shop.reallygreatreading.com/shop/fluency-timer |
| TpT trackers and passages | $1–$4 for tracker-only products; $4–$10 per grade for passages; a $9.99 browser timer app | One-time purchase | [V] see 2.4 |

### 3.2 Teachers' own spending

- AdoptAClassroom.org's 2025 survey of 3,700 K–12 teachers (spring 2025) found an average of **$895** of their own money spent on supplies in 2024–25, up from $600 in 2015. Purchases were mostly essentials, food, and books; educational subscriptions come up only once, in one teacher's quote [V] (https://www.adoptaclassroom.org/2025/06/09/2025-teacher-survey-spending-stats-classroom-needs/, published Jun 9, 2025).
- 95% of public school teachers had unreimbursed supply spending in 2019–20, averaging $470 (cost-of-living adjusted; the page cites national teacher survey data) [V] (https://learningpolicyinstitute.org/blog/underpaid-and-undersupplied-hidden-costs-teaching-america, Sep 1, 2023).
- **Do teachers buy apps themselves?** Teachers clearly buy content personally: TpT usage is high (2.4). In this niche, though, paid apps show almost no visible demand: ratings were reset or too few to display, ReadFluent has 10+ downloads, and tracker-only TpT products cost a few dollars with few reviews [V]. Personal spending on fluency software looks small (inference [U]).

### 3.3 What school purchasing involves

- **Payment and procurement.** Vendors set up for purchase orders and minimum orders (Amplify accepts purchase orders [V]; aimswebPlus has a $500 minimum first order [V]). Per-student licenses renew yearly (from the California and Kentucky documents [S]).
- **Data privacy agreements.** The Student Data Privacy Consortium's registry held 130,000+ signed agreements linking 12,000+ schools and districts with 6,674 app providers as of Apr 30, 2024 [V] (https://www.wsipc.org/news/version-two-of-sdpcs-national-data-privacy-agreement-is-available). New York alone shows 676 districts and 49,752 agreements [S] (https://sdpc.a4l.org/view_non_alliance.php?state=NY). Signed national agreements last three years [S] (https://www.richlandone.org/departments/information-technology/technology-approval-process/national-data-privacy-agreements).
- **Free versus paid inside a district.** Boulder Valley (Colorado) allows free click-through tools at the classroom level without an agreement, but teachers must check each tool's terms and privacy policy against a checklist and report tools that aren't listed. Paid tools *and free trials* need a software request and review [V] (https://www.bvsd.org/fs/pages/28984, undated). LAUSD limits staff acceptance of app terms to products that meet district standards [S] (BUL-6633.0, Jan 2016; returned 403). Federal model-terms guidance notes that click-wrap terms leave schools no room to negotiate [S] (https://www.huntonprivacyblog.com/2015/03/05/department-education-releases-guidance-schools-regarding-terms-service-offered-providers-online-educational-services/).
- **What this means (inference [U]).** A paid per-teacher tier pulls a free tool into the paid-tool approval path: a software request, a vendor record, often an agreement request even if no data is collected, and reimbursement friction. Institutional licensing needs a legal entity, invoicing, privacy agreements, support, and usually psychometric evidence. Fluency Check's "free, no account, nothing leaves the device" design is the lowest-friction position the category allows. It also fits Labs' hard limits: static, no accounts, free.

### 3.4 Which business models the category supports

| Model | Evidence | Fit for Fluency Check |
|---|---|---|
| Permanently free | Very common. Microsoft and Google bundle fluency tools free; DIBELS materials and easyCBM Lite are free; ~35 free web tools rank in search; ReadingFluency.ai is free for teachers [V] | **Yes.** The only model compatible with Labs' rules, and the category expectation at teacher level. |
| Free individual, paid school | ReadingFluency.ai, ReadingFluency.app, easyCBM [V] | Needs accounts, privacy agreements, and sales; incompatible with Labs. |
| One-time purchase | Low price points: $3.99 apps, a $9.99 TpT web app, $1–$10 TpT trackers, $49 passage sets [V]; little visible demand for tools [V] | Weak. Value sits in content (passages), not tools. |
| Freemium | easyCBM, ReadingFluency.app, ReadFluent [V] | Needs accounts or app-store billing; incompatible. |
| Paid teacher tier | $8/mo (ReadingFluency.app), $69.99/yr (easyCBM Deluxe), $9.99/yr (ReadFluent) [V] | Exists; uptake unknown; triggers district approval paths (3.3). |
| Institutional licensing | Dominant for screening and official progress monitoring at about $1–$20 per student per year [V/S] | Requires standardized passages, norms, evidence, procurement, and privacy agreements. Not this tool. |

### 3.5 Part 3 conclusions

The teacher-level workflow (time, mark, score, chart) is expected to be free. Willingness to pay appears where tools come bundled with standardized passages, norms, automation, or district data systems, and that money comes from districts per student, not from teachers. Teachers do spend their own money, but mainly on supplies and printable content. A pilot should test **use and repeat use**, not willingness to pay, and any paid tier would conflict with Labs' hard limits.

---

## Part 4: No-account feedback options for a static site

### 4.1 What the site does now

Every experiment's header and the homepage link "Feedback" to a pre-filled **new GitHub issue** (`src/components/feedback.ts`), with a body note that feedback is public and should leave out names and personal details [V, repo]. A signed-out request to that URL redirects (HTTP 302) to GitHub's sign-in page, so **a visitor needs a GitHub account to leave feedback** [V, checked with curl 2026-10-10]. Issues on this public repository are public. The share of teachers with GitHub accounts wasn't measured; it is probably small (inference [U]). Discussions are not enabled on the repository (404) [V].

### 4.2 Options compared

| Option | Cost | Privacy | Spam risk | Maintenance | Chance users paste student info | Backend or third-party processor? | Fits the Labs rules? |
|---|---|---|---|---|---|---|---|
| **Email link (`mailto:`) with a pre-filled subject and body** | $0 | Only the visitor's and owner's email providers see the message; nothing is stored by Labs | The address is exposed to harvesting. RFC 6068 warns that mailto links on public pages expose addresses [V]. Mitigation: a dedicated alias that can be filtered or rotated | Low: read email; replace the alias if it gets spammed | Moderate: private, but free text. Mitigation: a body template asking for no student names | No backend; no new processor beyond email | **Yes.** No account, key, or payment for the site to call. |
| Domain email forwarding alias (supports the email link) | $0. Porkbun lists 20 free forwarding addresses with a domain [V] (https://porkbun.com/products/email) | As above | As above | One-time setup in the registrar account, which only the owner can do | — | No | Yes |
| Tally (link out or embed) | Free plan: unlimited forms and submissions, 10 MB per file; Pro $24/mo [V] (https://tally.so/pricing) | Third-party processor; says it is made and hosted in the EU [V] | Pricing page lists no CAPTCHA, only duplicate prevention, passwords, and closing limits [V] | Low | High: free-text fields stored by a third party | Third-party processor; an embed loads its script on the page | **Conflicts with rule 5.** You can start a form without signing up, but managing responses ties it to an owner account [U]. |
| Formspree | Free: 50 submissions a month, 30-day archive, basic spam filtering and reCAPTCHA; paid from $10–$15/mo [V] (https://formspree.io/plans) | Third-party processor; reCAPTCHA adds Google | Low to medium | Low | High | Third-party endpoint tied to an owner account (the page says to create an account, then choose a plan) [V] | **No:** the site would post to an account-bound service. |
| Basin | Free: 1 form, 50 submissions a month, 30-day retention, basic spam protection; paid from $12.50/mo billed yearly [V] (https://usebasin.com/pricing) | Third-party processor | Low to medium | Low | High | Account-bound endpoint (sign-up implied [U]) | **No** |
| Google Forms (link out) | Free with a Google account [U] (the product page didn't state cost) | Google stores responses, encrypted in transit and at rest [V] (https://workspace.google.com/products/forms/). Teachers signed into school Google accounts may have identity attached (inference [U]) | Low | Low | High | Third-party processor; owner Google account | **Conflicts with rule 5** in spirit (owner account); a link out isn't the site "calling" a service, but data lands with Google. |
| GitHub Discussions | $0 | **Public** on a public repository (visibility follows the repository) [V] | Low | Moderation of public threads | High, and public | GitHub | **Fails "no accounts" for visitors:** creating a discussion requires a signed-in GitHub user [V] (https://docs.github.com/en/discussions/quickstart). |
| GitHub Issues (current) | $0 | Public | Low | Low | Public (a warning is shown) | GitHub | Same visitor-account barrier (302 to sign-in) [V]. |
| "Anonymous" form services | — | — | — | — | — | All checked options route through a third-party processor; services like Web3Forms work with an access key (web3forms.com returned 403 [U]) | **No.** Truly anonymous feedback without a processor isn't possible on a static site; an email is pseudonymous at best. |

### 4.3 Recommendation

Use a **plain `mailto:` link to a dedicated alias on the owner's domain**: `feedback@` plus the domain, as a placeholder, forwarded for free through the registrar. Pre-fill the subject (e.g., "Fluency Check feedback") and a short body template, roughly: "What did you try, what worked, what didn't? Please don't include student names or other student details." Show the address as plain text next to the link, because some computers have no mail app set up. Keep the GitHub link as a secondary option for technical visitors.

Why: it costs nothing and adds no backend, no keyed service, and no new data processor. It is the only option that doesn't ask visitors to have or create an account, which is the main problem with the current GitHub-only link for teachers. Its two risks are manageable: address harvesting (use an alias you can rotate) and student details in emails (the body template, and deleting such emails).

Setting up the alias is an account-settings change in the owner's registrar, so the owner has to do it. Changing the site's Feedback link is a public change, so it needs the owner's review and an explicit yes before it's pushed.

---

## What this means for the pilot (summary)

1. **Reaching users.** Search won't bring pilot users soon (Part 1). Realistic paths are a few trusted multipliers: literacy coaches and reading specialists, independent structured-literacy tutors, and teacher-prep instructors. Each would need to be approached by the owner personally and within each community's rules. Nobody was contacted for this research.
2. **What to measure.** Repeat use per student (several checks over several weeks), CSV exports, and teachers' reasons for using it. Ask directly about the free alternatives they already have: Microsoft Reading Progress, DIBELS paper forms, wcpmcalculator.com, and readingcoachkit.com.
3. **Signals that would falsify the opportunity.** Recruits default to mandated systems or paper. They see the free web calculators as good enough. They need norms or standardized passages that Fluency Check deliberately doesn't provide.
4. **Feedback channel.** Add the email alias before the pilot (Part 4).

---

## Source list

All accessed 2026-10-10. [V] verified on the page or observed; [S] snippet or secondary; [U] unverified.

**Search results and autocomplete (Part 1)**
- Google results pages, `https://www.google.com/search?q=<query>&hl=en&gl=us`, 16 queries [V, observed]
- Bing results pages, `https://www.bing.com/search?q=<query>&setlang=en-US&cc=US`, 16 queries [V, observed]
- Google autocomplete, `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=<seed>`, 7 seeds [V]

**Competing tools (1.3, 3.1)**
- https://www.wcpmcalculator.com/ [V] · https://www.readingcoachkit.com/ [V] · https://lans.cloud/reading-fluency-timer [V] · https://readlivo.com/tools/fluency-timer/ [V] · https://www.elitehometutoring.com/reading-fluency-timer.html [V] · https://literacyarcade.com/orf-fluency-calculator.html [V] · https://www.thetimerplace.com/oral-reading-fluency-timer/ [V]
- https://readingfluency.ai/ [V] · https://readingfluency.app/ [V]
- https://clearstackapps.com/apps/readfluent [V] · https://play.google.com/store/apps/details?id=com.clearstackapps.readfluent [V]
- https://www.teacherspayteachers.com/Product/Easy-Reading-Fluency-Classroom-Timer-and-Data-Tracker-16226494 [V] · https://www.teacherspayteachers.com/Product/FREE-Oral-Reading-Fluency-Tracker-17452836 [V]
- https://support.microsoft.com/en-us/topic/7617c11c-d685-4cb7-8b75-3917b297c407 [V] · https://www.microsoft.com/en-us/education/learning-tools/learning-accelerators [V] · https://www.microsoft.com/en-us/education/blog/2021/08/reading-progress-now-available-in-microsoft-teams/ [V, Aug 24, 2021]
- https://support.google.com/edu/classroom/answer/14174515?hl=en [V]
- https://apps.apple.com/us/app/id963571823 [V] · https://apps.apple.com/us/app/id1509310782 [V] · https://apps.apple.com/us/app/running-record-assistant/id507919711 (404) [V] · https://apps.apple.com/us/app/classroom-fluency-timer/id1104853948 [S]
- https://shop.reallygreatreading.com/shop/fluency-timer [S]

**Communities and associations (Part 2)**
- GummySearch: https://gummysearch.com/r/Teachers/ · /r/homeschool/ · /r/teaching/ · /r/slp/ · /r/specialed/ · /r/Dyslexia/ · /r/ElementaryTeachers/ · /r/Tutoring/ · /r/scienceofreading/ [V, third-party data] · https://gummysearch.com/r/SpecialEdTeachers [S]
- r/Teachers rules as seen in a mirror's search snippet (https://r.datuan.dev/r/Teachers/wiki/rules) [S]; official https://www.reddit.com/r/Teachers/wiki/rules not reachable [U]
- https://voyagersopris.com/blog/edview360/how-i-started-the-science-of-reading-what-i-should-have-learned-in-college-facebook-page-and-why-teachers-need-it [V] · https://lexialearning.com/resources/podcasts/the-science-of-reading-why-didnt-we-learn-what-we-needed-to-know-in-college [S] · https://www.eseanetwork.org/sched/E22/session/reinventing-professional-learning-teaching-the-science-of-reading-through-social-media [S] · https://amplify.com/community/ [V]
- https://literacyworldwide.org/about-us [V] · https://www.literacyworldwide.org/get-involved/chapters-and-affiliates [V]
- https://www.thereadingleague.org/ [V] · TRL press release (Feb 4, 2025) via https://smb.thepostsearchlight.com/article/The-Reading-League-welcomes-new-chapters-in-seven-states-as-evidence-aligned-reading-instruction-expands-in-the-US/67a238010feb870d1b5585c4 [V]
- https://en.wikipedia.org/wiki/International_Dyslexia_Association [S] · https://ia.dyslexiaida.org/about-us/membership/ [S] · dyslexiaida.org (403)
- https://exceptionalchildren.org/about-us [V] · https://mediakitpublic.multiview.com/CEC [V]
- https://www.ntatutor.com/certification/ [S] · https://en.wikipedia.org/wiki/National_Tutoring_Association [S]
- https://minnesotareadingcorps.org/reading-corps/ [V] · https://proventutoring.org/reading/reading-corps/ [V]
- https://web.cvent.com/event/6068fb55-d595-45a4-8b58-0fe8f1fb7c31/summary (AOGPE) [S]
- TpT searches: https://www.teacherspayteachers.com/browse?search=fluency%20tracker · …?search=reading%20fluency%20tracker · …?search=oral%20reading%20fluency%20progress%20monitoring [V]
- https://www.k12dive.com/news/report-popular-online-teaching-materials-poorly-aligned-with-academic-st/568721/ [V, Dec 10, 2019]
- Podcasts: https://amplify.com/episode/science-of-reading-the-podcast/season-6/episode-11-what-i-should-have-learned-in-college-with-donna-hetjmanek/ [S] · https://www.voyagersopris.com/podcasts/2021/the-science-of-reading-why-didnt-we-learn-what-we-needed-to-know-in-college [S]

**Pricing and purchasing (Part 3)**
- https://dibels.amplify.com/help/pricing [V] · https://edinstruments.org/node/292 [V] · https://legis.la.gov/legis/ViewDocument.aspx?d=1361772 [S]
- https://horizon.ok.gov/vendor-amplifyeducation [V]
- https://www.pearsonassessments.com/learningassessments/products/100000519/aimsweb.html [V]
- https://easycbm.com/pricing/index.html [V] · https://help.easycbm.com/article/1003-title-july-1-2021-subscription-price-increase [S]
- https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5adec2024.docx (Acadience) [S] · https://www.education.ky.gov/curriculum/conpro/engla/Documents/Acadience_Reading.pdf [S] · https://www.education.ky.gov/curriculum/conpro/engla/Documents/MAP_Reading_Fluency.pdf [S] · https://education.ky.gov/curriculum/conpro/engla/Documents/literably_Screener.pdf (fetched; text unreadable) [S] · https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5bdec2024.docx (Amira) [S]
- https://nssa.stanford.edu/organizations/amira-learning [V]
- https://www.learninga-z.com/user_area/content_media/raw/merlin-learning-a-z-flyer.pdf [S]
- https://www.readnaturally.com/product/reading-fluency-progress-monitor [V]
- https://www.texthelp.com/en-au/products/fluencytutor (redirects to a 404 page; sunset notice seen in snippet) [S] · https://www.techlearning.com/news/put-to-the-test-texthelp-systems-fluency-tutor [S]
- https://www.adoptaclassroom.org/2025/06/09/2025-teacher-survey-spending-stats-classroom-needs/ [V] · https://learningpolicyinstitute.org/blog/underpaid-and-undersupplied-hidden-costs-teaching-america [V]
- https://www.wsipc.org/news/version-two-of-sdpcs-national-data-privacy-agreement-is-available [V] · https://sdpc.a4l.org/view_non_alliance.php?state=NY [S] · https://www.richlandone.org/departments/information-technology/technology-approval-process/national-data-privacy-agreements [S]
- https://www.bvsd.org/fs/pages/28984 [V] · LAUSD BUL-6633.0, https://www.lausd.org/cms/lib/CA01000043/Centricity/Domain/21/BUL-6633%200%20APP%20And%20Website%20User%20Agreements%203.pdf (403) [S] · https://www.huntonprivacyblog.com/2015/03/05/department-education-releases-guidance-schools-regarding-terms-service-offered-providers-online-educational-services/ [S]

**Feedback options (Part 4)**
- Repository: `src/components/feedback.ts`, `src/components/ExperimentShell.tsx`, `src/Home.tsx` [V]
- `curl` checks of https://github.com/EugeneYip/labs/issues/new (302 to sign-in) and https://github.com/EugeneYip/labs/discussions (404) [V]
- https://www.rfc-editor.org/rfc/rfc6068 [V] · https://porkbun.com/products/email [V]
- https://tally.so/pricing [V] · https://formspree.io/plans [V] · https://usebasin.com/pricing [V] · https://workspace.google.com/products/forms/ [V]
- https://docs.github.com/en/discussions/quickstart [V] · https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/creating-an-issue [V]
- https://web3forms.com/ (403) [U]
