# Fluency Check: competitive map

Research notes for the Phase 1 validation of #016 Fluency Check (labs.eugeneyip.net/fluency-check/). Compiled 2026-10-10. Internal; not for the website.

**Evidence tags.** Every claim carries a tag and a source ID. The IDs map to the source list in section 11, which gives each URL and its date.

- **[V A3]**: VERIFIED. Read on that page or document on 2026-10-10.
- **[S A2]**: SNIPPET. Seen only in a search-result summary, not confirmed on the page.
- **[U]**: UNVERIFIED. An inference, or not checked.
- **[repo]**: from Fluency Check's own code and notes in this repository.

**Coverage limits.**

- The web-search budget shared by the parallel research threads ran out partway through this pass. After that, only direct page fetches were used.
- As a result, some areas are thin: Android apps, sites with a WCPM calculator, Lexia and a few smaller AI tools, and review sentiment for the big platforms. Section 10 lists the gaps.
- Scholarly articles were not reviewed, because the required LibKey connector isn't available.
- Prices are list prices from the cited documents. Districts often negotiate.

---

## 0. Fluency Check, for reference [repo]

- **What it is:** a free, static web page with no account. The teacher pastes any passage, then runs a live one-minute or whole-passage timing.
  - A tap marks an error, a second tap marks a self-correction, and a third tap clears the mark. The teacher then taps the last word read.
  - Results are words correct per minute (WCPM) and accuracy.
  - It produces a printable marked record and a student copy.
  - It keeps a progress chart for each student, with an optional goal.
  - Checks can be exported to and imported from CSV.
  - It works offline once the page has been opened.
- **Data:** kept only in that browser, and nothing is sent anywhere.
  - The page itself warns that browsers can clear saved data.
  - It adds that Safari on iPads, iPhones and Macs can do so after about a week without a visit, and asks teachers to download a CSV after each session (`Log.tsx`).
- **Not included:**
  - No passage library and no leveled or equivalent forms.
  - No norms or benchmarks. The built-in samples are explicitly not leveled or normed (`samples.ts`).
  - No audio recording, and no error types beyond error and self-correction.
  - No rosters, sharing, sync, or school-level reports.

## Key findings

1. **The core interaction is not new.** McGraw Hill's Oral Reading Fluency Application, inside Wonders, Open Court and related kits, runs essentially the same check [V A25, A26]:
   - a 60-second timer;
   - tap misread words, then tap the last word read;
   - words per minute against a goal and an error limit;
   - saved attempt history and a line graph.

   mCLASS, Acadience ALO, i-Ready Literacy Tasks and FastBridge also offer live digital scoring by the teacher, on their own normed passages [V A1, A10, A22, A15].
2. **The closest direct competitor is ReadingFluency.app**, whose privacy policy took effect in December 2025.
   - It is web-based, with tap-marking by the teacher, any pasted or imported passage, rosters, progress tracking and CSV export.
   - Manual scoring is free on every plan.
   - It adds optional recording and AI scoring, paid for with credits.
   - It requires a teacher account and stores data, including audio, in its cloud [V C1, C2, C3].
   - It has no reviews on G2 or GetApp [S C4].
3. **Being free is common.**
   - Microsoft Reading Progress is included in Microsoft 365 Education [V B2].
   - Google Read Along in Classroom has been free to every Workspace for Education edition since 2026-06-25 [V B5].
   - easyCBM Lite is free for individual teachers [V A17].
   - ReadingFluency.app has a free tier [V C2].
   - DIBELS, Acadience and UFLI materials are free to download [V A8, A12, D6].
   - Teachers Pay Teachers (TPT) has free trackers and graphs [V E1, E2].
4. **Using any passage is also common outside district platforms.**
   - Reading Progress accepts uploaded Word or PDF files and AI-generated passages [V B1, B2].
   - ReadingFluency.app accepts pasted or imported text [V C1].
   - Reader Meter captures text with the camera [V C6].
   - Fountas & Pinnell's BAS app has a "Universal" module that works without BAS texts [V C15].
   - Read Along added teacher uploads in April 2025, at the time only in Education Plus and the Teaching and Learning add-on [V B6].
5. **AI voice-recording tools faced open backlash in 2026.**
   - New Mexico let districts drop Amira's voice recording, use a paper test, or use their own program after early opt-outs (Aug 2026) [V B11].
   - By early September, 18 districts and charters had dropped it [V B10].
   - Albuquerque will delete Amira recordings within 48 hours [V B12].
   - In San Francisco, parents and teachers raised consent, accuracy with accents and speech differences, and lag [V B10].
   - Learning A-Z removed speech recognition from Foundations A-Z in February 2026. It replaced it with print-based WCPM fluency assessments, citing setup trouble, headsets and calibration [V B21].
   - This supports a position of "a teacher listens, and nothing is recorded or uploaded."
   - However, the districts that left Amira moved to other district-approved routes (DIBELS or mCLASS, i-Ready, a paper test), not to standalone apps [V B10, B11; S on Santa Fe's DIBELS request].
6. **What survives is a combination, not a single feature.** The combination is:
   - no account;
   - nothing leaves the device;
   - any passage;
   - live scoring by the teacher;
   - a printable marked record;
   - usable today by one tutor or interventionist.

   No other tool found has all of these, although someone shares each one individually.
7. **The name collides with existing reading products.**
   - "Fluency Check" is the name of the University of Florida Literacy Institute's one-minute WCPM passages for UFLI Foundations (grades 1–2, May 2024 pilot) [V D6].
   - McGraw Hill's tool calls its attempts "fluency checks" [V A25].
   - No FLUENCY CHECK trademark appeared in third-party trademark listings [S F2–F4].
   - The USPTO database itself was not checked [U].
8. **Passage licensing matters for a tool where teachers bring their own passages.**
   - DIBELS 8 materials are licensed only to schools, districts and multi-district agencies, for internal educational use [V A8]. The terms grant no right to modify them and allow electronic use only as a static PDF [V A8].
   - UFLI Fluency Checks are free to use, adapt and share with attribution, for non-commercial educational purposes [V D6].

---

## 1. Publisher and district platforms with oral reading fluency (ORF)

### 1.1 Amplify mCLASS with DIBELS 8th Edition

- **Target user:** K–6 schools and districts. It is the digital DIBELS 8 platform, the "Gold" tier in Amplify's comparison [V A1].
- **Workflow:**
  - Teacher-administered, one-on-one, on a computer or tablet.
  - Scored automatically, with no manual data entry. Amplify's own comparison table lists speech recognition as "No" [V A1].
  - DIBELS measures take about 3–5 minutes per student [V A3].
- **Pricing:**
  - One-year license: $9 per student. Multi-year license: $7. Lectura add-on: $5 [V A3, A4].
  - An $8,900 professional-development package covers first-year licenses for one site of up to 30 participants [V A3, A4]. These figures come from California Department of Education documents dated December 2024 and January 2025.
  - Oklahoma consortium pages show a $16 bundle for 2025–26 and an $8 DIBELS-only license for members in 2026–27 [S A5].
  - Sales go through Amplify ("contact a program expert"). No checkout for an individual teacher was seen [V A1].
- **Account:** required, through a shared portal with individual credentials [V A3].
- **Devices:** computer or tablet, with internet [V A3].
- **Teacher-chosen passages:** no. It delivers the DIBELS 8 assessment (inferred from the product's scope) [U].
- **Progress history, roster, export:**
  - Progress monitoring with automatic recommendations, item-level reports, grouping, short lessons, and placement into Amplify Reading at extra cost [V A1].
  - Rostering and export were not checked [U].
- **Privacy:**
  - Hosted web service. The CDE overview has no privacy section [V A3].
  - Data privacy agreement (DPA) terms were not checked [U].
- **Strengths:**
  - DIBELS 8 norms and automatic scoring.
  - Item-level data tied to instruction [V A1].
  - Appears on Ohio's 2025–26 list of approved assessments [S A27].
- **Complaints:** not gathered in this pass [U].
- **How Fluency Check differs:**
  - It needs no license or account, accepts any text, and stores nothing off the device.
  - It lacks DIBELS norms, benchmark goals, dyslexia measures, item-level analysis, rosters and reports.
  - In a district that has mCLASS, teachers already have a digital ORF workflow for benchmarking and progress monitoring.

### 1.2 DIBELS Data System (DDS) and the free DIBELS 8 materials

- **Target user:** schools and districts using DIBELS on paper, grades K–8 [V A1].
- **Workflow:**
  - Paper and pencil, teacher-administered.
  - Scoring and data entry are manual, and teachers print their own scoring materials [V A1].
- **Pricing:**
  - $1 per student per year [V A6].
  - Plus a one-time $200 setup fee. This comes from Amplify's former pricing page and a Louisiana fiscal note [S A2, A7].
  - The pricing URL now redirects to a comparison page that shows no per-student price [V A1].
  - Training costs $49 per person, and printed kits cost $42–$76 [V A1].
- **Materials:** DIBELS 8 materials are free to download [V A8]. The terms of use [V A8]:
  - Only schools, school districts and multi-district agencies may use them, solely for internal educational use.
  - The materials may not be sold.
  - No right to modify them is granted.
  - The PDF is for paper use, or as a static PDF on electronic devices.
  - DIBELS is a registered trademark of the University of Oregon [V A9].
- **Account:** a DDS account is required [V A1].
- **Teacher-chosen passages:** no; it uses DIBELS forms [U].
- **Progress history:** benchmark and progress-monitoring reports on total scores [V A1].
- **Strengths:** the cheapest normed option, and a very familiar instrument [V A6; U on familiarity].
- **Complaints:** not gathered [U].
- **How Fluency Check differs:**
  - It replaces the paper's timing, counting and arithmetic with a digital check.
  - It is not a sanctioned way to give DIBELS. Retyping a DIBELS passage into a digital tool looks like the modification or electronic use that the terms don't grant [U: our reading of V A8].
  - Tutors working outside schools are not among the users the DIBELS terms name [V A8].

### 1.3 Acadience Reading K–6 and Acadience Learning Online (ALO)

- **Target user:** K–6 schools. Spanish (Español) and French (Français) versions exist [V A10].
- **Workflow:**
  - One-on-one, either on paper or digitally on a tablet through ALO, a web app that can be installed [V A10]. Students don't use the device.
  - Scoring by hand takes about 1 to 1.5 minutes per task [V A10].
  - ALO supports digital ORF administration as well as manual score entry [V A11].
- **Pricing** (California overview, December 2024) [V A10]:
  - Paper only: a grade-level classroom kit costs $156–$158, and extra manuals cost $29.
  - ALO with manual entry: $3 per student. ALO with digital administration: $7.45 per student.
  - Each license is used up once a student is assessed in a given year. There is no bulk pricing.
  - A 12-hour Essential workshop is recommended for every assessor ($129 for the self-paced version).
  - In the US and Canada, orders go through Voyager Sopris [S A13].
- **Materials:** free to download from the Acadience Research Hub [V A12]. The terms of use were not checked [U].
- **Account:** a licensed ALO account [V A10].
- **Devices:** a tablet with internet for digital administration [V A10].
- **Passages:** Acadience forms only [U].
- **History and reports:** reports at district, school, class and student level, printable or saved as PDF, plus parent reports in English and Spanish [V A10].
- **Strengths:** normed, with a choice of paper or digital administration, and parent reports [V A10].
- **Complaints:** the training burden (the 12-hour workshop) [V A10]. User reviews were not gathered [U].
- **How Fluency Check differs:** it needs no license or training and accepts any text. It has no norms or parent reports, and it can't replace a mandated Acadience benchmark.

### 1.4 aimswebPlus (Pearson)

- **Target user:** K–12 districts [V A14].
- **Workflow:** ORF uses digital record forms in grades 1–12. Scoring is in the browser, by manual score entry, or both [V A14].
- **Pricing** (Pearson's page, which is current: it lists webinars in October–November 2026) [V A14]:
  - Reading: $4.50 per student per year. Complete: $7.75.
  - Unlimited: $4,995 a year, for districts of up to 2,500 students.
  - A $500 minimum initial order, and qualification level A.
- **Purchase by one teacher:** possible only with the $500 minimum [V A14].
- **Passages:** aimsweb forms [U].
- **Complaints:** not gathered [U].
- **How Fluency Check differs:** no minimum order and no account, but also no norms.

### 1.5 FastBridge CBMreading (Renaissance; formerly Illuminate)

- **Workflow:**
  - The teacher listens while the student reads for 1 minute [V A16].
  - Grades 1–8 in English and 1–6 in Spanish [V A16].
  - Screening uses three passages, three times a year, and progress monitoring is weekly or every two weeks [V A16].
  - Across the suite, the test administrator scores online in real time, or scoring is automatic [V A15].
- **Pricing** (California, December 2024): $7.50 per student. This bundles earlyReading, CBMreading, AUTOreading, aReading and a professional-development package, with discounts that depend on enrollment [V A15].
- **Devices:** a computer or tablet with internet, and headphones [V A15].
- **Purchase:** through "Contact Sales" [V A16].
- **Note:** the product page is still branded Illuminate [V A16]. The California document names it "Renaissance FastBridge" [V A15].

### 1.6 easyCBM (Riverside Insights): a free teacher edition exists

- **Target user:** individual teachers (Lite and Deluxe editions) and districts [V A17].
- **Pricing:**
  - Lite is free. Deluxe costs $69.99 a year, plus one free month. District pricing comes from Riverside [V A17, A18].
  - New accounts start with a one-month Deluxe trial, then drop to Lite. No credit card is needed [V A17].
- **What Lite includes** [V A17, A18]:
  - Progress-monitoring measures and a progress graph for each student.
  - Up to 200 students, entered by hand.
  - No benchmarks, import or export, or roster integration.
- **Grade-range caveat:**
  - The pricing table lists Passage Reading Fluency as 9 measures for grades K–1 in Lite, and 20 measures for grades K–2 in Deluxe and District [V A17].
  - An older Lite manual implies a wider grade range [S A19], so the current range needs confirming in an account [U].
- **Account:** required [V A17].
- **Passages:** easyCBM's alternate forms [U].
- **Strengths:** for a teacher acting alone, this is the most credible free option for a real curriculum-based measure (CBM), with normed, equal-difficulty forms and graphs [V A17, A18; S A19].
- **Complaints:** not gathered [U].
- **How Fluency Check differs:** no account, and any text at any grade. However, easyCBM gives normed forms and graphs for free.

### 1.7 Star CBM Reading (Renaissance)

- **What it is:** K–6 curriculum-based measures, including passage oral reading. It is part of the Star suite [V A21].
- **Pricing:**
  - California price: $7.50 per student for the Star bundle (Star Early Literacy, Star Reading, Star CBM and Lectura, plus professional learning) [V A20].
  - Otherwise, pricing is by request [V A21].
- **Administration:** digital or paper, in groups or one-on-one. Star CBM Reading takes about 5 minutes, plus optional tasks [V A20].

### 1.8 i-Ready Literacy Tasks (Curriculum Associates)

- **What it is:** ten foundational tasks, including Passage Reading Fluency. Grades K–6, in English and Spanish [V A22].
- **Administration:**
  - Digital or paper. Digital administration includes marking errors in real time, and scores are calculated automatically [V A22].
  - One-on-one with the teacher, about a minute per task (Oklahoma guidance, August 2025) [V A23].
- **Pricing:** not public [V A22].
- **Voice features:** Curriculum Associates has owned SoapBox Labs, which makes child speech recognition, since late 2023 [V B19]. Its voice-enabled Literacy Tasks are described as a vision for the future [S B23].

### 1.9 NWEA MAP Reading Fluency

- **What it is:** an AI-scored ORF assessment that can be given to a group [V A24]:
  - Digital, for a whole class, a small group or one student.
  - Needs a computer or tablet, with a boom-microphone headset recommended. Takes about 20 minutes in K–1.
  - Scored automatically, with some oral reading tasks scored within 24 hours.
  - The progress-monitoring form can be given as often as needed.
- **Pricing:** $7 per student in California, with no bulk pricing. Training costs extra [V A24].
- **Data handling:** students' oral reading is processed by the vendor (implied by automatic scoring of oral reading) [U on storage details].

### 1.10 McGraw Hill Oral Reading Fluency Application (Wonders, Maravillas, Open Court, foundational-skills kits)

- **Workflow** [V A25, A26]:
  - The teacher picks a student and a passage, then starts a 60-second timer.
  - Misread words are tapped (shown red). The teacher stops the timer and clicks the last word read (shown blue).
  - The results show words per minute, errors, the WPM goal and the error limit.
  - Attempts are saved. A Fluency Performance Report shows them as a data grid or a line graph, with a class average and a list of students below goal.
- **Dates:** both support pages carry 2026-03-24 metadata.
- **Passages:** chosen from the program's drop-down [V A25]. Self-corrections are not mentioned [V A25].
- **Access:** presumably part of McGraw Hill program subscriptions [U].
- **Why it matters:** the exact Fluency Check interaction already ships inside a major core reading program. Teachers in those schools have no reason to switch for the interaction itself.

---

## 2. AI and speech-recognition tools

### 2.1 Microsoft Reading Progress, and Reading Coach

- **Target user:** classes using Microsoft Teams for Education [V B1].
- **Workflow:**
  - The teacher creates a Reading Progress assignment in Teams [V B1].
  - Passages come from three sources: the teacher's own uploaded Word or PDF files (from Class Notebook, Teams or OneDrive), which the teacher can edit; a ReadWorks library, which can't be edited; or AI-generated passages, where the teacher sets topic, age, length and language [V B1, B2].
  - Students record themselves reading on video, or audio only. They may re-record if allowed [V B1].
  - The teacher plays the recording and marks errors as omission, insertion, mispronunciation, repetition or self-correction.
  - An optional "Auto-detect" (a preview feature) estimates errors, which the teacher can adjust. Accuracy and correct words per minute update as errors are marked [V B1].
  - Returned work flows into Insights [V B1], which includes a words-per-minute trend graph [S B4].
- **Pricing:** included in Microsoft 365 Education [V B2].
- **Account:** students submit through their class team in a school's Microsoft tenant [V B1].
- **Devices:** desktop, web and the Teams mobile app. Some mobile devices allow audio only [V B1].
- **Any passage:** yes [V B1].
- **Roster:** Teams classes [V B1]. Export was not checked [U].
- **Privacy:**
  - Recordings of children are submitted to the teacher through Microsoft's cloud [V B1].
  - The sources reviewed don't state where recordings are stored or how long they are kept [U].
- **Reading Coach:**
  - A free practice app for students, not a teacher's assessment tool. It works with a school account (if IT enables it) or a personal Microsoft account [V B2, B3].
  - Voice is processed only on the user's device and is not stored or shared with Microsoft afterwards [V B3].
  - Its FAQ doesn't describe a view for educators [V B3].
- **Strengths:** free inside a platform schools already have, any passage, AI-assisted marking, trends [V B1, B2].
- **Complaints:** not gathered [U].
- **How Fluency Check differs:**
  - Reading Progress is asynchronous: each student needs a device, a Teams account and a microphone, and the teacher reviews a recording afterwards.
  - Fluency Check is a live check run by the teacher, with no student device, no account, no recording and no Microsoft tenant.
  - Microsoft's advantage is replay for verifying errors, AI help, and data the school can see.

### 2.2 Google Read Along in Classroom

- **Target user:** classes using Google Workspace for Education [V B5, B7].
- **Workflow:**
  - Students read aloud to an AI helper that gives feedback in the moment [V B5, B7].
  - Teachers assign from a library of hundreds of books in eight languages, including Heggerty decodables and ReadWorks [V B5].
  - Gemini can generate differentiated activities [V B5].
  - Teachers "can add existing class content" [V B5].
  - Uploading the teacher's own content launched on 2025-04-09, then only for Education Plus and the Teaching and Learning add-on, in English, Spanish and Brazilian Portuguese [V B6].
- **Metrics:**
  - Accuracy, speed, comprehension and phonics, for each student and for the class [V B5, B7].
  - Data appears only after the student has read 100 words or half the text [V B7].
  - Progress over time or across assignments requires Education Plus or the Teaching and Learning add-on [V B5, B7].
  - WCPM is not named as such [V B7].
- **Pricing:** free to every Workspace for Education edition since 2026-06-25, with rollout completing by 2026-07-03 [V B5].
- **Account:** school Workspace accounts for teachers and students [V B7]. Admins must turn it on for customers who joined before 2024-07-07 [V B5].
- **Privacy:**
  - Voice is processed on the device for most languages.
  - Indonesian, Malay and Thai temporarily send voice to Google servers [V B7].
  - Whether recordings are stored is not stated [V B7].
- **Export:** BigQuery extraction is available only on paid editions [V B5].
- **Other:** a separate consumer Read Along app has existed since 2020 [S B8].
- **How Fluency Check differs:** Read Along is student practice with an AI tutor. Fluency Check is a timed check that a teacher administers and scores. Read Along is now a free default in Google schools, which weakens the "free" argument for Fluency Check there.

### 2.3 Amira (merged with Istation in 2024), and the 2026 privacy backlash

- **Target user:** districts and states. Amira's ISIP Assess is New Mexico's required K–2 assessment [V B11; S B15].
- **Workflow:**
  - Digital, given to groups. Median time is 16–18 minutes in K–2, and scoring is by computer [V B9].
  - Includes a tutor and progress monitoring in the "Suite" [V B9].
- **Pricing** (California, December 2024) [V B9]:
  - Screener: $4.99 per student.
  - Screener free if the district buys $20 per student of live professional development.
  - Suite: $20 per student.
  - HMH bundle: $9.
  - North Dakota testimony also cites $20 per student [S B14].
- **Scale examples:**
  - San Francisco Unified (SFUSD) pays nearly $400,000 a year for 23,000 K–5 subscriptions [V B10].
  - New Mexico spends about $2.7 million a year, including $1.4 million for the statewide assessment [V B11].
- **Account:** yes, with reports at student, class and district level and data extracts [V B9].
- **Privacy:**
  - Amira records children reading aloud and uploads the audio to the company's servers [V B10].
  - New Mexico's state memo says recordings are deleted monthly, and districts can ask for daily, weekly or end-of-year deletion [V B11].
  - The company's privacy wording changed between July and August 2026 on whether recordings are used to improve its AI [V B10].
- **Backlash:**
  - By 2026-08-11, Santa Fe, Los Alamos, Farmington, Roswell, Clayton and Turquoise Trail Charter had opted out [V B11].
  - New Mexico then allowed Amira without voice recording, a paper test, or a district's own program [V B11].
  - By early September, 18 districts and charters had dropped the state's Amira assessment [V B10].
  - Albuquerque will delete Amira recordings within 48 hours [V B12].
- **Complaints** (SFUSD, September 2026) [V B10]:
  - It doesn't understand children with accents or speech differences.
  - Parents describe it as laggy and "creepy," and say they weren't asked for consent.
  - Use has been weak.
- **How Fluency Check differs:**
  - There is no audio and no cloud. The teacher listens and decides.
  - It doesn't offer Amira's dyslexia screening, automatic scoring, tutoring or reports.
  - The 2026 backlash is a real tailwind for "nothing recorded, nothing uploaded." However, the districts leaving Amira used district-approved alternatives [V B11].

### 2.4 Literably (owned by Heggerty since July 2024)

- **What it is:** speech AI for children, assessing seven literacy areas including ORF. More than 500,000 students have been assessed [V B16].
- **Plans:** Literably stays a stand-alone brand that is integrated with myHeggerty [V B16].
- **Recordings:** the length of recording that gets graded depends on the plan [S B18].
- **Status:** literably.com could not be reached on 2026-10-10 [V B17 observation]. Its current status is unclear [U].
- **Pricing:** not public [S].

### 2.5 SoapBox Labs and similar engines

- **Ownership:** Curriculum Associates acquired SoapBox Labs, which makes speech recognition for children, in late November 2023 [V B19].
- **Effect on other products:** reporting says it would honor existing third-party contracts but not sign new ones [S B20]. Tools that once licensed SoapBox may therefore change [U].

### 2.6 Market signals: speech recognition pulled back, and Fluency Tutor retired

- **Learning A-Z:** on 2026-02-16 it announced that the Speech Recognition Tool is being removed from Foundations A-Z [V B21].
  - It is being replaced with existing question types and new print-based Fluency Assessments that measure WCPM.
  - The stated reasons are less technical setup and troubleshooting, and no headsets, microphones or speech calibration.
  - This is evidence that one-minute WCPM checks given by the teacher remain the format the market actually uses [U: our interpretation].
- **Texthelp Fluency Tutor:** announced as sunsetting in December 2024 [S B22]. Its product URL now redirects to Read&Write [V B22 observation].

---

## 3. Dedicated fluency apps and web tools

### 3.1 ReadingFluency.app: the closest direct competitor

- **Target user:** classroom teachers, interventionists, literacy coaches, and MTSS/RTI teams [V C1].
- **Workflow** [V C1]:
  - The teacher taps to mark miscues, one-on-one or for a whole class.
  - Optionally, audio is recorded for playback.
  - Group "rooms" let students join with a code, with no student accounts.
  - Optional AI marks miscues after submission, and the teacher can edit or override.
- **Passages:** paste text, import PDF or CSV benchmark packets, or generate passages by grade, language, topic and length. Languages are English, Spanish, French and Mandarin [V C1, C2].
- **Results:** WPM and accuracy with word-level miscues. A tracker stores WCPM, accuracy and benchmark history. Reports include trend graphs, goal gaps, rate of improvement and percentile bands [V C1].
- **Roster and export:** rosters and groups; CSV export [V C1].
- **Pricing** [V C2]:
  - Teacher Essentials: free, with 150 starter credits.
  - Teacher Plus: $8 a month, or $96 a year at an early-bird price ($192 a year standard).
  - Schools and districts: custom pricing.
  - A recording costs 1 credit, and AI analysis costs 2 credits.
  - The FAQ says passage generation, imports, rosters, manual tap-marking and progress tracking are free and unlimited on every plan.
  - "Progress monitoring charts" are listed under Teacher Plus, which conflicts with the FAQ.
- **Account:** teachers must sign in. Students need none for group sessions [V C1].
- **Devices:** browsers on Chromebooks and iPads [V C1].
- **Privacy** (policy effective 2025-12-18) [V C3]:
  - It collects student names, grades, audio recordings, scores and notes.
  - It says data is encrypted in transit and at rest.
  - It names no cloud provider, AI provider or retention period, and no company entity or location.
  - It says it is designed for FERPA and COPPA where they apply.
  - It offers a privacy compliance review to districts [V C2].
- **Traction:** zero reviews on G2 and GetApp [S C4]. A directory lists it as founded in 2019 in the US [S C5].
- **Complaints:** none found, because there are no reviews [S C4].
- **How Fluency Check differs:**
  - No account, nothing stored on someone else's server, no credits.
  - Offline, with a printable marked record and student copy.
  - ReadingFluency.app offers more: rosters, team sharing, audio replay, AI, generated passages, percentile bands, and sync across devices.
  - For a teacher who accepts an account and a cloud, ReadingFluency.app is the stronger tool. Fluency Check's edge is privacy and zero setup.

### 3.2 Reader Meter (iPhone and iPad)

- **Workflow:** the teacher photographs any text, edits it, then marks errors while the student reads. Accuracy and fluency are calculated automatically [V C6].
- **Price:** $4 [V C6].
- **Releases:** version 1.0 came out on 2025-05-09. Version 2.0.0 ("Apr 9", year not shown) adds Google or email sign-in and cloud sync of results [V C6].
- **Privacy label:** "Data Not Collected," which is self-reported and conflicts with the 2.0 cloud sync [V C6].
- **Reviews:** too few to summarize. The rating was recently reset [V C6].
- **Devices:** iOS and iPadOS only [V C6].
- **How Fluency Check differs:** it runs on any device's browser, is free, and has CSV export, a printable record and progress charts. Whether Reader Meter keeps history was not stated [U]. Reader Meter's camera capture is a convenience Fluency Check lacks.

### 3.3 Calculator and running-record apps (small, mostly dormant)

- **Teacher Tools Grader & Running Record Calculator** (free, iPad) [V C7]:
  - Calculates WPM, accuracy, and error and self-correction rates. A stopwatch can feed the calculator.
  - Last version dated 2019-09-15. Rated 4.2 from 13 ratings. No privacy details provided.
- **Running Record Assistant** ($2.99) [S C8]:
  - Flag buttons for errors and self-corrections, a stopwatch, replay of the recording, and emailed reports.
  - Its US App Store page returned 404 on 2026-10-10.
- **RunRecord Calc** (free) [S C9] and **Running Recs** ($1.99, iPhone, rated 2.0) [S C10]: calculators where the counts are entered by hand.
- **Fluence** ($3.99, French) [V C11]:
  - Uses MCLM, the French equivalent of WCPM, on texts the teacher supplies.
  - PDF and CSV export. Privacy label: "Data Not Collected."
  - Version 1.1 dated 2024-11-03.
- **TeeRead for Students** (free) [V C12]:
  - Claims automated WCPM, accuracy and miscue reports.
  - Collects audio and name data linked to the user.
- **Reading Fluency – KidsRead** (free with in-app purchases, grades 1–3, aimed at parents) [S C13].
- **Takeaway:**
  - Tools that need no account and keep data on the device do exist, but they are mostly calculators where counts are typed in, or dormant iPad apps.
  - None found combines live marking of a pasted passage with history and export across devices.
  - Android coverage wasn't possible in this pass [U].

### 3.4 Fountas & Pinnell Reading Record app (iPad)

- **What it is:** a free "shell" app, with content bought per system through iTunes or institutional licenses [V C15].
  - It times the conference and calculates reading and accuracy rates, self-correction ratios, and fluency and comprehension scores.
  - It saves records as PDFs and syncs to the Online Data Management System (ODMS), which requires a subscription for most content [V C15].
- **Content prices:** about $6.60–$21.85 per set in Heinemann listings [S C16].
- **Any passage:** the BAS app's Universal module offers the same functions without the BAS texts [V C15].
- **How Fluency Check differs:** it runs on any browser and needs no subscription. Fluency Check lacks running-record miscue analysis and F&P's comprehension and leveling system.

### 3.5 Raz-Plus and Kids A-Z running records (Learning A-Z)

- **Workflow** (help page dated 2026-06-30) [V C17]:
  - Students self-record a reading and a retelling in Kids A-Z, then answer a quiz.
  - Recordings go to the teacher's In Basket to be scored.
  - The passages are Raz-Plus books, and "Read-Retell-Respond Assessments" replace the earlier Benchmark Passages.
- **Pricing:** Raz-Plus has a "Buy It" checkout for individuals, but no price is shown on the overview page [V C18]. The price was not found [U].
- **How Fluency Check differs:** live checks by the teacher with no subscription and any text. Raz-Plus has leveled books and a library for whole-class assignments.

### 3.6 Read Naturally (print progress monitor, Read Live, timers)

- **Reading Fluency Progress Monitor** [V C19]:
  - Print reproducibles: 30 student and 30 teacher passages per level, with word counts for each line, plus graphs and record sheets with normative data.
  - $49 per level, with eight levels. Timers are listed as required.
- **Words-Per-Minute Timer/Calculator:** a $16 hardware device, backordered until the end of October 2026 [V C20].
- **Read Live** [V C21]:
  - A web-based fluency intervention, at $32 per seat per year for 6–29 seats, with a 6-seat minimum.
  - Recorded timings, and WCPM calculated automatically.
- A product called "Reading Fluency Benchmark Assessor" was not found on the current site [U].
- **How Fluency Check differs:** it could be the free digital scorer for print passage sets like these. Read Naturally sells the passages and norms that Fluency Check lacks.

### 3.7 Defunct or retired

- **FluencyFinder:** an older iOS ORF app, $6.99 in an undated review [S C14]. fluencyfinder.com now redirects to a page offering the domain for sale [V C14 observation].
- **Texthelp Fluency Tutor:** sunset at the end of 2024 [S B22]. Its URL redirects [V B22].

---

## 4. Free web tools

### 4.1 Intervention Central

- **Reading Fluency Passage Generator:**
  - Its page loads, with the form present: title, passage box, readability formulas, and Download or Email PDF buttons [V D1]. Output was not tested, because that would mean submitting the form.
  - A banner still promises a "new, streamlined" site in December 2023 and warns that saved login documents will be erased [V D1]. The site appears unmaintained [U].
- **ChartDog Graph Maker:** the page and chart controls load [V D2]. It was not tested.

### 4.2 NCII Excel progress-monitoring tool

- **What it is:** a free Excel workbook to store progress-monitoring data for multiple students and measures, graph progress, and set goals. Its citation date is August 2016 [V D3].

### 4.3 AbleSpace (IEP goal data tracking)

- **What it is:** a free Basic plan for individual providers with "Unlimited Students," covering IEP goal data, reports and graphs. Schools and districts get custom pricing. A signup is required [V D4].
- **Relevance:** it is not ORF-specific, but special-education teachers and interventionists may already log WCPM there [U].

### 4.4 WCPM calculators

- **Generic tools:** calculators for words per minute or reading speed (for example, Omni's) don't handle errors or words correct [V D5].
- **WCPM-specific pages:** none found, because the search budget was exhausted before this could be done properly [U].

### 4.5 Free passages that pair with a tool where teachers bring their own passages

- **UFLI Foundations Fluency Checks** [V D6]:
  - One decodable passage per unit for grades 1–2, as a May 2024 pilot.
  - One-minute timing, administered individually.
  - The paper procedure is to slash each error, bracket the last word, and count words correct.
  - Teachers are pointed to the Hasbrouck and Tindal (2017) norms.
  - License: free to use, adapt and share with attribution, not for sale, and for educational, non-commercial use only.
  - This is a natural, legal passage source for Fluency Check users, and also a name collision (section 9).
- **DIBELS 8:** free, but limited to schools and districts, with no modification and static-PDF use only on devices [V A8].
- **Acadience:** free to download [V A12]. Its terms were not checked [U].

---

## 5. Spreadsheets, templates and Teachers Pay Teachers

- **Digital trackers** (TPT search, "digital fluency tracker," 2026-10-10) [V E1]:
  - Single items cost free to $3.90. Grade-level bundles cost $7.20–$19.20.
  - Formats are mostly Google Sheets or Excel.
  - Rating counts are small, from 1 to 31.
  - A free "Digital Student Fluency Tracker" has 31 ratings (4.9) [V E1].
  - A DIBELS-specific Excel tracker costs $12 [V E1].
- **Progress-monitoring graphs** (TPT search, "reading fluency progress monitoring graph") [V E2]:
  - Mostly printable or spreadsheet graphs, at free to $7.99.
  - The most-rated listing is a $3 graph set with 75 ratings (4.88). Free graphs have 8–14 ratings.
- **Free Google Sheets templates outside TPT:** not checked [U].
- **Takeaway:**
  - Teachers do pay $2–$5 to save time on tracking, but demand per item looks modest, judging by the low rating counts [U: inference].
  - These tools record and graph scores. They don't time or score the reading itself.

## 6. A timer, a calculator and paper (the incumbent default)

- **Procedure:** a 1-minute timer, a slash through each error, a bracket after the last word read, and a count of words read correctly (UFLI directions) [V D6]. Read Naturally's print kit lists timers as required [V C19].
- **Cost:** about free. Dedicated hardware exists, such as a $16 WPM timer/calculator [V C20].
- **Time overhead:** Acadience estimates about 1 to 1.5 minutes per task for scoring by hand, before any data entry [V A10]. By contrast, mCLASS says no extra scoring time is needed [V A3].
- **Strengths:**
  - No device, no account, and no data risk.
  - Rich annotation (miscue types, prosody notes).
  - Familiar, and it is the format DIBELS's terms permit [V A8].
- **Weaknesses:** counting and arithmetic, graphing, data entry, storage, and errors in calculation [U: general].
- **How Fluency Check differs:**
  - It automates counting, arithmetic, marked-record printing and graphing, which are the real time sinks of paper.
  - The teacher must still prepare the passage (paste it, and print or show the student copy), and the teacher needs a device in hand.
  - No timing comparison against paper exists yet [U].

---

## 7. Comparison of the top 12 (plus Fluency Check for reference)

Abbreviations: "Teacher-run" means the teacher listens and scores live. "Student-recorded" means students read into a device for review or AI scoring.

| Alternative | For whom | How a check runs | Price; can one teacher buy? | Account | Any passage? | History and export | Data handling | Evidence date |
|---|---|---|---|---|---|---|---|---|
| **Fluency Check** [repo] | teachers, tutors, interventionists | teacher-run on any device; 1 minute or whole passage | free; yes | none | yes (paste) | progress chart and goal per student; CSV in/out; printed record | stays in that browser; no audio | 2026-10 |
| mCLASS DIBELS 8 [V A1, A3] | K–6 districts | teacher-run on a tablet or computer; auto-scored; no speech recognition | $9 per student (1 year), $7 (multi-year); through sales | district | no | progress monitoring and item-level reports | vendor cloud | Jan 2025; 2026 |
| DDS and free DIBELS paper [V A1, A6, A8] | schools and districts | paper; scored and entered by hand | $1 per student [V], plus $200 setup [S]; materials free for schools and districts only | DDS account | no (no modification) | benchmark and progress-monitoring reports | vendor cloud | 2026 page |
| Acadience and ALO [V A10] | K–6 schools | teacher-run on paper or a tablet | $3 (manual entry) or $7.45 (digital) per student; kit $156–158 | ALO | no | reports from district to student; PDF; parent reports | vendor cloud | Dec 2024 |
| easyCBM [V A17, A18] | single teachers and districts | teacher-administered; scores entered | Lite free (200 students); Deluxe $69.99 a year | yes | no | progress graphs; export in Deluxe | vendor cloud | Apr 2026 |
| MAP Reading Fluency [V A24] | K–3 districts | student-recorded on headsets; AI-scored | $7 per student (California) | yes | no | reports | vendor cloud, with audio | Dec 2024 |
| Microsoft Reading Progress [V B1, B2] | schools on Teams | student-recorded; teacher review; AI auto-detect | included in Microsoft 365 Education | school tenant | yes (Word/PDF, AI) | Insights trends | Microsoft cloud; recordings (retention not documented) | Aug 2024; 2026 |
| Google Read Along in Classroom [V B5–B7] | schools on Workspace | student reads to an AI tutor | free to all editions since Jun 2026; trends need Plus | school accounts | partly (uploads in Plus/T&L since Apr 2025) | last 5 assignments; longer trends need Plus | voice on-device for most languages | Jun 2026 |
| Amira [V B9–B12] | districts and states | student-recorded; AI-scored; groups | $4.99 (screener) or $20 (Suite) per student | yes | no | reports; data extracts | cloud audio; 2026 backlash | Dec 2024; Sep 2026 |
| ReadingFluency.app [V C1–C3] | teachers and interventionists | teacher-run tap-marking, or student-recorded with optional AI | free tier; Plus $8 a month ($96–192 a year); yes | teacher account | yes (paste, import, generate) | tracker, trends, CSV | its cloud; audio stored; providers not named | Dec 2025; Sep 2026 |
| McGraw Hill ORF Application [V A25, A26] | schools using Wonders or Open Court | teacher-run: 60 seconds, tap errors, tap last word | part of the program [U] | yes | no (program passages) | attempt history; line graph; print | vendor cloud [U] | Mar 2026 |
| Reader Meter [V C6] | single teachers (iOS) | teacher-run on a camera-captured text | $4; yes | sign-in added in v2 for sync | yes (camera) | not stated | label says none collected; v2 adds cloud sync | 2025–26 |
| Timer and paper (with UFLI or Read Naturally passages) [V D6, C19, C20] | everyone | stopwatch; slash errors; count by hand | about $0 (passages free to $49 per level) | none | yes | by hand | paper | n/a |

---

## 8. Wedge hypotheses: verdicts

| Hypothesis | Verdict | Why |
|---|---|---|
| Works with any passage | **FAILS** as a unique wedge | Several free or cheap tools already accept any text: Reading Progress takes Word and PDF files and AI-generated passages [V B1, B2]; ReadingFluency.app takes pasted or imported text for free [V C1, C2]; Reader Meter uses the camera [V C6]; F&P's Universal module works without BAS texts [V C15]; Read Along has uploads in paid tiers [V B6]. It is true against district platforms (mCLASS, Acadience, aimsweb, FastBridge, easyCBM, Star, i-Ready, MAP, McGraw Hill), which use their own normed forms. It is also a liability: there are no norms or equivalent forms, and DIBELS terms bar modifying passages or using them electronically beyond a static PDF [V A8]. |
| No account | **HOLDS** (as fact; its value is unproven) | Every full-featured alternative found needs an account or a school tenant: mCLASS, DDS, ALO, aimsweb, easyCBM, MAP, Reading Progress, Read Along, Amira, ReadingFluency.app, McGraw Hill [V, sections 1–3]. Only bare calculators and dormant single-device apps skip accounts [V C7, C11; S C9, C10]. Teachers already have Google or Microsoft accounts, so friction may matter less than it seems [U]. The cost is no backup or sync, and Safari can clear data after about a week [repo]. |
| No student data leaves the device | **HOLDS** (timely; not shown to drive choice) | No other full-featured ORF tool found keeps everything local. The 2026 backlash over recordings of children's voices is real: New Mexico opt-outs, 18 districts by September, Albuquerque's 48-hour deletion, SFUSD complaints [V B10–B12]. Teacher-run district tools also avoid audio, but they store scores in a vendor cloud under district agreements [V A1, A10]. The districts that left Amira went to district-approved tools, not standalone apps [V B11]. A tool that keeps everything local can still conflict with district record-keeping, and a lost or shared device still holds student names [U]. |
| Faster than paper | **WEAK** (plausible, unmeasured, not unique) | It automates counting, arithmetic, the marked record and graphing. Scoring by hand takes about 1 to 1.5 minutes per task [V A10], while mCLASS claims no extra scoring time [V A3]. However, every digital competitor shares this advantage. Setup (pasting and printing or showing the passage) eats the gain for a one-off check, and no timing study of Fluency Check exists [U]. |
| Simpler than district platforms | **HOLDS** (narrowly) | District platforms involve licenses, rosters and training: a 12-hour Acadience workshop [V A10], an $8,900 mCLASS professional-development package [V A3], $49 DIBELS training [V A1], a $500 minimum order for aimsweb [V A14]. Fluency Check is one page. This matters only for informal checks between mandated benchmarks. Teachers don't choose between Fluency Check and a mandated screener. Simplicity is also matched by ReadingFluency.app, Reader Meter and McGraw Hill's tool [V C1, C6, A25]. |
| Usable before a school adopts anything | **WEAK** (true, but shared) | It holds against district platforms and against tools that need a school tenant: Reading Progress needs Teams for Education [V B1], Read Along needs school accounts and sometimes an admin to enable it [V B5, B7], and Reading Coach needs IT to enable it for school accounts [V B3]. Several options also work for one teacher without adoption: paper, easyCBM Lite [V A17], ReadingFluency.app's free tier [V C2], Reader Meter [V C6] and TPT sheets [V E1]. It is distinctive only when combined with no account and nothing leaving the device. |
| Useful for tutors and interventionists outside district systems | **HOLDS** (best candidate; conditional) | District tools are sold to institutions: DIBELS materials are licensed only to schools, districts and multi-district agencies [V A8]; aimsweb has a $500 minimum [V A14]; Read Live has a 6-seat minimum [V C21]; Microsoft and Google need school tenants [V B1, B5]. Options for an individual are thinner: easyCBM Lite (account; its pricing table lists Passage Reading Fluency for K–1 only) [V A17], ReadingFluency.app (account and cloud) [V C2, C3], print kits [V C19], a $4 iOS app [V C6]. The conditions: Fluency Check supplies no passages or norms, and tutors need a legal passage source (UFLI Fluency Checks fit [V D6]). No evidence of demand was gathered in this pass. |

**Where that leaves the differentiation.**

- What survives is the combination: no account, nothing leaving the device, no audio, any passage, live scoring by the teacher, a printable record, any device, and offline use.
- It is aimed at privacy-cautious individuals (tutors, interventionists, special-education and private-school teachers) doing informal checks.
- The main threats:
  - Teachers with mandated platforms already have the workflow.
  - Paper is free and familiar.
  - ReadingFluency.app is close, more capable, and free for manual use.

---

## 9. Brand-collision check: "Fluency Check"

- **UFLI Foundations "Fluency Check" (high risk of confusion; same audience)** [V D6]:
  - The University of Florida Literacy Institute's unit assessments are titled "Fluency Checks."
  - The materials say "UFLI Foundations Fluency Check" on each passage (May 2024 pilot).
  - They are one-minute WCPM checks for grades 1–2, the same activity as our tool.
  - Searches for "fluency check" return UFLI PDFs (as observed in this pass) [S].
- **McGraw Hill (medium):** the ORF Application calls each attempt a "fluency check," and its steps are titled "Conduct Fluency Check" [V A25, A26].
- **Trademark:**
  - No FLUENCY CHECK mark appeared in third-party trademark listings [S F2–F4].
  - Nearby marks:
    - FLUENCY MATTERS (Wayside Publishing; Reg. 3926211; classes 9 and 41, education software and services) [V F1].
    - FLUENCY (pending; Use Fluency, Inc.; AI business software) [S F2].
    - FLUENCY FORGE and FLUENCY CORP (language education) [S F3, F4].
  - The USPTO database was not queried, so this is not cleared [U F5].
- **Assessment:**
  - "Fluency Check" describes the activity itself, so it would be hard to protect and is unlikely to draw an infringement claim.
  - But it is not distinctive and is hard to find in search.
  - Teachers may assume it is UFLI's tool, or affiliated with UFLI.
- **Suggestions:**
  - Keep the permanent slug.
  - If the tool is ever positioned for UFLI users, avoid implying endorsement.
  - Don't use "DIBELS" (a registered trademark of the University of Oregon [V A9]) in naming or marketing beyond a plain factual reference.
  - Consider a more distinctive product name if it is spun out.
  - Have the owner run a USPTO search before any rename.

## 10. Gaps and suggested follow-ups

These were not covered, or only partly, mainly because the search budget ran out:

- Android apps.
- Sites dedicated to WCPM calculation.
- Lexia, EarlyBird, Moby.Read, Readlee, and other ORF tools powered by SoapBox.
- Raz-Plus pricing.
- Storage and retention of Microsoft Reading Progress recordings.
- User reviews of mCLASS, Acadience, aimsweb, FastBridge and easyCBM (G2, Capterra, Reddit, teacher forums).
- Current status of Literably under Heggerty.
- Whether Read Along's free tier allows teacher uploads.
- easyCBM's current grade range for Passage Reading Fluency in Lite.
- A direct USPTO search for FLUENCY CHECK.

Research questions for the pilot itself:

- How long does a Fluency Check take compared with paper, from the start of setup to a recorded score?
- Do tutors and interventionists outside district systems actually lack a tool, or are they satisfied with paper or easyCBM Lite?

## 11. Sources

All were read or seen on 2026-10-10. "Date" is the source's own date where shown.

**A. Publisher and district platforms**

- **A1** Amplify, "Platform Options: DIBELS 8th Edition" (DDS compared with mCLASS). https://dibels.amplify.com/help/options (the old /help/pricing URL redirects here). © 2026. VERIFIED (read in a browser).
- **A2** Amplify, "DDS Pricing Information": a search snippet of the former page showing $1 per student per year and a $200 setup fee. https://dibels.amplify.com/help/pricing. Undated. SNIPPET.
- **A3** California Department of Education, mCLASS information overview. https://www.cde.ca.gov/ci/cl/mclassinfooverview.asp. Last reviewed 2025-01-16. VERIFIED.
- **A4** CDE, RDRSSP draft screener overview: mCLASS with DIBELS 8 and Lectura. https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5cdec2024.docx. December 2024. VERIFIED (text extracted).
- **A5** Oklahoma Horizon consortium, Amplify vendor and pricing pages. https://horizon.ok.gov/vendor-amplifyeducation and https://horizon.ok.gov/?p=12292. Covers 2025–26 and 2026–27. SNIPPET.
- **A6** EdInstruments, DIBELS 8th Edition entry. https://edinstruments.org/node/292. Undated (cites a 2022 brief). VERIFIED.
- **A7** Louisiana Legislature, fiscal document. https://legis.la.gov/legis/ViewDocument.aspx?d=1361772. SNIPPET.
- **A8** University of Oregon CTL, DIBELS Testing Materials and terms. https://dibels.uoregon.edu/materials. VERIFIED (terms read in the page source).
- **A9** University of Oregon CTL, DIBELS home page. https://dibels.uoregon.edu/. Posts dated 2024-08-22 to 2026-08-07. VERIFIED.
- **A10** CDE, RDRSSP draft screener overview: Acadience Reading K–6. https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5adec2024.docx. December 2024. VERIFIED (text extracted).
- **A11** Acadience Learning, ALO help center. https://www.acadiencelearning.org/help/acadience-learning-online-alo/. Undated. VERIFIED.
- **A12** Acadience Learning, Acadience Reading K–Grade 6. https://acadiencelearning.org/acadience-reading/k-grade6/. Undated. VERIFIED.
- **A13** Acadience FAQ (Voyager Sopris as the US and Canada distributor). https://acadiencelearning.org/?p=13124. SNIPPET.
- **A14** Pearson, aimswebPlus product and pricing page. https://pearsonassessments.com/learningassessments/products/100000519/aimsweb.html. Current (lists webinars in October–November 2026). VERIFIED.
- **A15** CDE, RDRSSP draft screener overview: Renaissance FastBridge. https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5jdec2024.docx. December 2024. VERIFIED (text extracted).
- **A16** Illuminate Education, FastBridge CBMreading. https://www.illuminateed.com/products/fastbridge/reading-assessment/cbm-reading/. © 2026. VERIFIED.
- **A17** easyCBM pricing. https://easycbm.com/pricing/index.html. © 2026. VERIFIED (also read in a browser).
- **A18** easyCBM Help, "Lite Edition vs Deluxe Edition." https://help.easycbm.com/article/1288-lite-edition-vs-deluxe-edition. Updated 2026-04-30. VERIFIED.
- **A19** easyCBM Lite Teacher's Manual (file name dated 2021). https://brtprojects.org/wp-content/uploads/2022/08/EasyCBM_Lite_Teachers_Manual_081821.pdf. SNIPPET.
- **A20** CDE, RDRSSP draft screener overview: Renaissance Star. https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5kdec2024.docx. December 2024. VERIFIED (text extracted).
- **A21** Ohio Department of Education and Workforce, Star CBM Assessment Information Form 2025–26. https://education.ohio.gov/getattachment/Topics/List-of-Approved-Assessments/StarCBMAIF25-26.pdf.aspx?lang=en-US. January 2025. VERIFIED.
- **A22** Curriculum Associates, i-Ready Literacy Tasks. https://www.curriculumassociates.com/programs/i-ready-assessment/literacytasks. © 2026. VERIFIED.
- **A23** Oklahoma State Department of Education, i-Ready Diagnostic screening guidance. https://www.oklahoma.gov/content/dam/ok/en/osde/strong-readers-files/i-Ready25-26Final.pdf. August 2025. VERIFIED.
- **A24** CDE, RDRSSP draft screener overview: NWEA MAP Reading Fluency. https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5hdec2024.docx. December 2024. VERIFIED (text extracted).
- **A25** McGraw Hill support, Wonders/Maravillas Oral Reading Fluency tool. https://www.mheducation.com/prek-12/support/knowledge/oral-fluency-tool-for-wonders.html. 2026-03-24. VERIFIED.
- **A26** McGraw Hill support, Open Court Foundational Skills kits ORF tool. https://www.mheducation.com/prek-12/support/knowledge/ocr-foundational-skills-word-analysis-kits-oral-reading-fluency.html. 2026-03-24. VERIFIED.
- **A27** Ohio approved-assessment form, mCLASS DIBELS 8, 2025–26. https://education.ohio.gov/getattachment/Topics/List-of-Approved-Assessments/mCLASSDIBELS8AIF25-26.pdf.aspx?lang=en-US. SNIPPET (the listing exists).

**B. AI and speech recognition**

- **B1** Microsoft Support, "Getting started with Reading Progress in Teams." https://support.microsoft.com/en-us/education/getting-started-with-reading-progress-in-teams. © 2026 (screenshots from 2021). VERIFIED.
- **B2** Microsoft Education Blog, "Explore new AI features in Learning Accelerators." https://www.microsoft.com/en-us/education/blog/2024/08/explore-new-ai-features-in-learning-accelerators/. 2024-08-14. VERIFIED.
- **B3** Microsoft Support, Reading Coach FAQ. https://support.microsoft.com/en-US/education/reading-coach-faq. © 2026, undated. VERIFIED.
- **B4** Microsoft Support, "View Reading Progress data in Insights." https://support.microsoft.com/en-us/education/insights/view-reading-progress-data-in-insights. SNIPPET.
- **B5** Google Workspace Updates, Read Along in Classroom available to all education users. https://workspaceupdates.googleblog.com/2026/06/read-along-in-google-classroom-is-now-available-to-all-education-users-to-support-foundational-literacy.html. 2026-06-25. VERIFIED.
- **B6** Google Workspace Updates, uploading content to Read Along in Classroom. https://workspaceupdates.googleblog.com/2025/04/upload-content-to-read-along-google-classroom.html. 2025-04-09. VERIFIED.
- **B7** Google Classroom Help, "Read Along in Google Classroom." https://support.google.com/edu/classroom/answer/14174515?hl=en. © 2026. VERIFIED.
- **B8** TechCrunch, Google launches Read Along (2020). https://techcrunch.com/?p=1985326. SNIPPET.
- **B9** CDE, RDRSSP draft screener overview: Amira. https://www.cde.ca.gov/be/cc/rd/documents/rdrsspitem5bdec2024.docx. December 2024. VERIFIED (text extracted).
- **B10** San Francisco Standard, on frustration with SFUSD's AI reading tutor. https://sfstandard.com/pacific-standard-time/2026/09/25/pst-sf-amira-ai-in-schools/. 2026-09-25. VERIFIED.
- **B11** GovTech, "New Mexico allows schools to opt out of controversial AI tool." https://www.govtech.com/education/k-12/new-mexico-allows-schools-to-opt-out-of-controversial-ai-tool. 2026-08-11. VERIFIED.
- **B12** AI Understanding, a summary of City Desk ABQ reporting on Albuquerque deleting recordings within 48 hours. https://aiunderstanding.org/news/albuquerque-schools-will-delete-ai-reading-assessment-recordings-within-48-hours. 2026-08-28. VERIFIED (secondary source).
- **B13** Amira privacy pages. https://www.amiralearning.com/amira-privacy and https://amiralearning.com/privacy-and-security. SNIPPET.
- **B14** North Dakota legislative testimony (Amira at $20 per student). https://ndlegis.gov/assembly/69-2025/testimony/HAPPEDU-1013-20250124-31340-F-SEIDLECKI_JOE.pdf. 2025-01-24. SNIPPET.
- **B15** Istation, Amira and Istation merger page. https://info.istation.com/amira-istation-merger. 2024. SNIPPET.
- **B16** L Squared Capital, Heggerty acquires Literably. https://www.lsquaredcap.com/l-squared-continues-early-education-focus-expanding-heggertys-impact-with-the-acquisition-of-literably/. 2024-07-18. VERIFIED.
- **B17** Literably. https://literably.com/. The connection failed on 2026-10-10 (refused, a TLS error, and a failed browser navigation). VERIFIED (observation).
- **B18** Literably product types (Notion page). https://literably.notion.site/Literably-Product-Types-c370c0d355864ea5a98999f8f1deed99. SNIPPET.
- **B19** GovTech, "Curriculum Associates acquires SoapBox Labs." https://govtech.com/education/k-12/curriculum-associates-acquires-soapbox-labs. 2023-12-04. VERIFIED.
- **B20** EdWeek Market Brief, Curriculum Associates acquires SoapBox Labs. https://marketbrief.edweek.org/marketplace-k-12/k-12-dealmaking-curriculum-associates-scoops-soapbox-labs-parentsquare-acquires-remind/. 2023. SNIPPET.
- **B21** Learning A-Z Help, "Speech Recognition Tool Retirement." https://help.learninga-z.com/en/articles/13747102-speech-recognition-tool-retirement. 2026-02-16. VERIFIED (read in a browser).
- **B22** Texthelp, "We're sunsetting Fluency Tutor in December 2024." https://www.texthelp.com/en-au/products/fluencytutor. SNIPPET. Also, https://www.texthelp.com/products/fluency-tutor/ now redirects to https://www.everway.com/products/read-and-write-education/. VERIFIED (observation).
- **B23** SoapBox Labs, "About voice-enabled literacy tasks." https://www.soapboxlabs.com/about-voice-enabled-literacy-tasks. SNIPPET.

**C. Dedicated apps and web tools**

- **C1** ReadingFluency.app home page. https://readingfluency.app/. © 2026, with product updates dated June and September 2026. VERIFIED.
- **C2** ReadingFluency.app pricing. https://readingfluency.app/pricing. VERIFIED.
- **C3** ReadingFluency.app privacy policy. https://readingfluency.app/privacy. Effective 2025-12-18. VERIFIED.
- **C4** G2 and GetApp listings for ReadingFluency.app. https://www.g2.com/sellers/readingfluency-app and https://www.getapp.com/all-software/a/readingfluency-app/. GetApp refreshed April 2026. SNIPPET.
- **C5** EdTech Impact listing for ReadingFluency.app. https://edtechimpact.com/products/readingfluencyapp. SNIPPET.
- **C6** App Store, Reader Meter. https://apps.apple.com/us/app/reader-meter/id6745434060. Version 1.0 on 2025-05-09; version 2.0.0 on "Apr 9." VERIFIED.
- **C7** App Store, Teacher Tools Grader & Running Record Calculator. https://apps.apple.com/us/app/teacher-tools-grader/id1029621399. Last version 2019-09-15. VERIFIED.
- **C8** App Store (Turks and Caicos storefront), Running Record Assistant. https://apps.apple.com/tc/app/running-record-assistant/id507919711. SNIPPET (the US and Turks and Caicos pages both returned 404 on fetch).
- **C9** App Store, RunRecord Calc. https://apps.apple.com/app/id6475273898. SNIPPET.
- **C10** App Store, Running Recs. https://apps.apple.com/app/id308411058. SNIPPET.
- **C11** App Store, Fluence. https://apps.apple.com/us/app/id1509310782. Version 1.1 on 2024-11-03. VERIFIED.
- **C12** App Store, TeeRead for Students. https://apps.apple.com/us/app/teeread-for-students/id1532436060. Updates in 2025–2026. VERIFIED.
- **C13** App Store, Reading Fluency – KidsRead. https://apps.apple.com/app/id6770613013. SNIPPET.
- **C14** Tech & Learning review of FluencyFinder (undated). https://www.techlearning.com/tl-advisor-blog/5112. SNIPPET. Also, https://fluencyfinder.com/ now redirects to a domain-sale page at atom.com. VERIFIED (observation).
- **C15** Fountas & Pinnell, Apps. https://fountasandpinnell.com/apps/. Undated. VERIFIED.
- **C16** Heinemann product listings for Reading Record app content. https://heinemann.com/products/e10984.aspx and related listings. SNIPPET.
- **C17** Learning A-Z Help, "Students Taking a Running Record on Raz-Plus." https://help.learninga-z.com/en/articles/15706918-students-taking-a-running-record-on-raz-plus. 2026-06-30. VERIFIED (read in a browser).
- **C18** Learning A-Z, Raz-Plus overview. https://www.learninga-z.com/site/products/raz-plus/overview. VERIFIED (read in a browser).
- **C19** Read Naturally, Reading Fluency Progress Monitor. https://www.readnaturally.com/product/reading-fluency-progress-monitor. © 2026. VERIFIED.
- **C20** Read Naturally, Words-Per-Minute Timer/Calculator. https://www.readnaturally.com/product/words-per-minute-timercalculator. Backordered until the end of October 2026. VERIFIED.
- **C21** Read Naturally, Read Live. https://www.readnaturally.com/product/read-live. Reviews from January to April 2026. VERIFIED.

**D. Free web tools and free passages**

- **D1** Intervention Central, Reading Fluency Passage Generator. https://www.interventioncentral.org/teacher-resources/oral-reading-fluency-passages-generator. VERIFIED (page and form present; not run).
- **D2** Intervention Central, ChartDog Graph Maker. https://www.interventioncentral.org/teacher-resources/graph-maker-free-online. VERIFIED (page loads; not run).
- **D3** NCII, Student Progress Monitoring Tool for Data Collection and Graphing (Excel). https://intensiveintervention.org/resource/student-progress-monitoring-tool-data-collection-and-graphing-excel. 2016. VERIFIED.
- **D4** AbleSpace pricing. https://www.ablespace.io/pricing/. Undated. VERIFIED.
- **D5** Omni Calculator, words per minute. https://www.omnicalculator.com/everyday-life/words-per-minute. Undated. VERIFIED.
- **D6** UFLI, "Fluency Checks: All First Grade" (pilot). https://ufli.education.ufl.edu/wp-content/uploads/2024/05/UFLI-Fluency-Check-1st-Grade-Bundled.pdf. May 2024. VERIFIED (text extracted).

**E. Teachers Pay Teachers**

- **E1** TPT search results, "digital fluency tracker." https://www.teacherspayteachers.com/browse?search=digital%20fluency%20tracker. 2026-10-10. VERIFIED.
- **E2** TPT search results, "reading fluency progress monitoring graph." https://www.teacherspayteachers.com/browse?search=reading%20fluency%20progress%20monitoring%20graph. 2026-10-10. VERIFIED.

**F. Trademarks**

- **F1** trademarkregistration.app, FLUENCY MATTERS (Reg. 3926211). https://trademarkregistration.app/Trademark/Details/77675276. VERIFIED.
- **F2** Trademark Elite, FLUENCY (serial 99856520; under review as of 2026-09-21). https://www.trademarkelite.com/trademark/trademark-detail/99856520/FLUENCY. SNIPPET (403 on fetch).
- **F3** Trademark Elite, FLUENCY FORGE (serial 97643840). https://www.trademarkelite.com/trademark/trademark-detail/97643840/FLUENCY-FORGE. SNIPPET.
- **F4** Justia, FLUENCY CORP (serial 87940390). https://trademarks.justia.com/879/40/fluency-87940390.html. SNIPPET.
- **F5** USPTO Trademark Search. https://tmsearch.uspto.gov/. UNVERIFIED: a query passed in the URL returned nothing even for a known registered mark, so it wasn't a valid test, and using the search form was out of scope.

**Repository**

- **repo** `src/experiments/fluency-check/` (`model.ts`, `Check.tsx`, `Log.tsx`, `samples.ts`, `index.tsx`), read 2026-10-10.
