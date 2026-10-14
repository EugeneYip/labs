# Thread A: trades, field work, and small professional offices (Batch 09, round 1, 2026-10-14)

Bounded research thread (at most 18 searches, 10 fetches; both used up). Need first; nothing here is a decision. Labels: *verified* (read on an official or primary page), *source claim* (a page or search snippet says so), *inference* (this thread's judgment).

Prior records were checked first. No trade or small-office ideas had been screened before, apart from invoices, timesheets and quotes, plus the heat-loss, allergen and Martyn's Law rejections. Batch 08's nature thread covered volunteer recording, not consultancy surveys.

## Summary

1. **Lead 1, payment-cycle dates under the Construction Act (subcontractors and the contractors who pay them): the strongest.** The rules are statutory and verified. Missing a deadline by days has decided six-figure sums. Even the agreed schedule of dates (the incumbent) has been wrong in a reported case, and no free tool was found. Against it: date arithmetic with legal stakes (the Batch 07 Awaab's Law precedent).
2. **Lead 2, drawing issue sheet and transmittal from the PDFs being issued (small architecture practices): moderate to weak.** The manual friction is verified, and no free tool builds the register from the files. Excel is the entrenched incumbent.
3. **Lead 3, translator quote counts (words, standard lines, standard pages) done locally: weak.** Desktop shareware exists, it's niche, and it sits in the files cluster.

Everything else is screened out below.

## Running log

- Searches 1-4: GCN HSI, ISO 19650 naming, translator counts, bat survey timing.
- Searches 5-8: bank statements to CSV, CIS statements, the Part O simplified method, Construction Act payment notices.
- Searches 9-12: JCT payment timetable, drawing issue sheets, BS 5837 RPA, fire door checks.
- Searches 13-17: CDM construction phase plans, party wall schedules of condition, NDSS, subcontract payment schedules and late notices, Hedgerows Regulations.
- Search 18: free issue-sheet tools, plus Vectorworks and AutoCAD LT. All 18 searches used.
- Fetches 1-10 (all used):
  - Graphisoft thread: 403, not read.
  - SketchUp forum thread: read.
  - HGCRA 1996 s.116: read.
  - DAC Beachcroft on Vision v Gypcraft: the body wasn't reached.
  - HKLegal on Vision v Gypcraft: read.
  - The Scheme, Part II: read.
  - Bouygues v Febrey judgment: read.
  - Vectorworks Issue Manager help: read.
  - Autodesk forum: 403.
  - HGCRA s.111: 404, not read.

## Leads

### Lead 1. Payment-cycle dates under the Construction Act, for subcontractors and the contractors who pay them

- **Audience:** specialist trade subcontractors (electrical, plumbing and heating, drylining, roofing) who apply monthly for interim payment on commercial jobs. Also the small contractors and commercial staff who must answer each application with notices on time.
  - Contracts with residential occupiers are outside the Act (s.106; *inference*, not read in this thread). So homeowner work is out of scope.
- **The job:**
  - Before: there's a subcontract (JCT DBSub/C, a bespoke order, or silence, in which case the Scheme fills the gaps) and a monthly valuation. For each cycle someone works out the application date, the due date, the payer's payment notice, the pay less notice and the final date for payment. If the payer stays silent, the payee's default notice comes in too.
  - After: the application goes in on time and each notice is checked against its deadline. An adjudication can turn on a single day.
- **Rules (*verified*, legislation.gov.uk, read 2026-10-14):**
  - HGCRA 1996 s.116: a period "after or from a specified date" begins immediately after that date. Christmas Day, Good Friday and bank holidays (England and Wales, or Scotland) are excluded. It extends to England, Wales and Scotland, not Northern Ireland.
  - The Scheme, Part II:
    - periodic payments are due on the later of 7 days after the relevant period or the payee's claim (para 4);
    - the relevant period is 28 days by default (para 12);
    - the final date is 17 days from the due date (para 8(2));
    - the payer's notice is due not later than five days after the due date (para 9(2));
    - the pay less notice is due not later than seven days before the final date (para 10).
  - JCT forms set their own periods, for example a final date 14 days after the due date and a pay less notice 5 days before it (*source claim*, C-Link and commentary). The text of s.110A and s.111 wasn't read: legislation.gov.uk returned 404 for s.111.
- **Frequency / importance:** monthly for the life of each job, and a day's slip decides money.
  - *Vision Construct v Gypcraft* (EWHC 2707 (TCC); the snippet gives [2025]). The form was a JCT DBSub/C 2016 with a bespoke payment schedule.
  - The contractor's payment notice was five days late and there was no separate pay less notice. So the subcontractor's full application became the notified sum, and the court enforced the award. Earlier tolerance of late notices didn't waive the deadline (*source claim*, HKLegal article, read 2026-10-14).
  - DAC Beachcroft's snippet gives the award as £216,947.75 plus interest (*source claim*).
  - Disputes "often arise over whose contract terms apply" (Building, *source claim*).
- **Evidence of friction:** *Bouygues v Febrey* [2016] EWHC 1333 (TCC) (*verified*, judgment on caselaw.nationalarchives.gov.uk, read 2026-10-14).
  - The subcontract's Appendix 10, "Sub-Contract Payment Schedule", listed for each cycle: Application Date, Assessment Date, Due date for payment, Payment notice date, Pay less notice date, Final date for payment.
  - The October 2015 row had a due date of 16 Nov and a payment notice date of 23 Nov, which is more than five days later (contrary to s.110A(1)(a)). The payment notice also fell after the pay less date of 20 Nov.
  - The court found "there is an obvious error in Appendix 10" and read 23 Nov as 20 Nov. A notice served on 23 Nov was therefore ineffective and the claim failed.
  - So the agreed schedule of dates, which is the incumbent, can itself break the Act and decide a case.
  - No first-hand complaint from a subcontractor about working out the dates was found; the searches were spent on incumbents and stakes.
- **Alternatives found:**
  - the subcontract's own appendix of dates (*verified* in Bouygues; *source claim* in Vision);
  - paid platforms: Payapps, C-Link, and Zigaflow's pay less notice workflow (*source claim*);
  - law-firm explainers;
  - spreadsheets and calendars (*inference*).
  - Three searches found no free calculator or schedule generator (*source claim* that none surfaced).
- **Strongest incumbent:** the schedule of dates the main contractor attaches to the subcontract, plus the QS's spreadsheet.
- **Possible Labs wedge:**
  - *Make a schedule.* Enter the contract's periods, or choose "the Scheme applies", plus the first valuation date. The page gives every cycle's dates for the job. It counts the s.116 way, or in plain calendar days for contracts that count that way, using the bank holidays of England and Wales or of Scotland. It outputs a printable schedule, CSV and an .ics file of reminders.
  - *Check a schedule.* Type or paste the appendix table from a subcontract. Each row is checked against the Act's constraints and for internal consistency (the Bouygues row would be flagged):
    - the payment notice is no later than 5 days after the due date;
    - the pay less notice comes after the payment notice and by the prescribed period before the final date;
    - every due date has a final date.
  - *Was it in time?* For one cycle, given the actual dates, which notices were valid.
  - Everything runs offline, with no network use.
- **Labs-fit problems:**
  - Bank holidays must be bundled and refreshed yearly; gov.uk publishes them (*inference*).
  - Northern Ireland has its own Order.
  - Contract clauses vary (JCT's reckoning clause; NEC's calendar days; *inference*), so periods must be inputs, and the page must say plainly that the contract governs.
- **Strongest reason not to build:**
  - It is date arithmetic with legal stakes, the reason Batch 07 rejected Awaab's Law deadlines.
  - The main contractor usually drafts the schedule, and the subcontractor has little power to change it.
  - The people who care most (QSs, commercial managers) already keep spreadsheets.
- **Thread verdict:** lead, the strongest here. The question for the main session is whether "check a schedule against the Act" is distinctive and safe enough to clear the Batch 07 precedent. To verify first: the s.110A(1)(a) and s.111(5) wording, and one more search for a free schedule tool.

### Lead 2. Drawing issue sheet and transmittal from the PDFs being issued (small architecture and engineering practices)

- **Audience:** architects, architectural technologists and small engineering practices, especially those drawing in SketchUp LayOut or AutoCAD LT. Neither has a built-in issue manager (LayOut: *verified* by the forum thread below; LT lacks Sheet Set Manager: *source claim*, Autodesk forum, page 403).
- **The job:**
  - Before: a set of drawings is exported to PDF for an issue (planning, tender, construction). The issue sheet is updated by hand in Excel: one row per drawing, one column per issue date, revision letters in the cells. So is the transmittal (what went to whom, and why).
  - After: the PDFs and the transmittal go out, and the register is the record of what each party received.
- **Frequency / importance:** every issue on every job, dozens a year in a small practice (*inference*). A wrong revision on the register, or a changed drawing issued under an old revision, is a classic document-control error (*inference*).
- **Evidence of friction:**
  - A LayOut user must "laboriously trawl through page by page" for each revision letter, noting "all the potential for transcription errors" (SketchUp forum, "Filing with revisions", 2-3 November 2022, *verified*). The replies offer only workarounds: an Excel sheet linked to revision fields, date-stamped PDFs, cloud version history, one file per drawing.
  - ArchiCAD users keep an Excel issue register by hand, or export issue history as text files into Excel, or buy add-ons (Smart Transmittal; a paid transmittal object) (*source claim*, Graphisoft community threads, page 403).
- **Alternatives found:**
  - Vectorworks' Issue Manager writes the issue number or letter, date and note to each sheet's title block. The help page doesn't mention recipients or an issue sheet or transmittal report (*verified*, Vectorworks 2017 help).
  - Revit revision schedules and add-ins (*inference*).
  - CDEs and paid platforms, such as SiteSupervisor's drawing register (*source claim*).
  - Excel templates, paid (Stella Interiors on Gumroad) or free (InfraLens) (*source claim*).
  - Two searches found no free tool that builds the register from issued PDFs' file names (*source claim*).
  - ISO 19650 naming: no free UK checker surfaced. The UK National Annex update renamed the fields (Functional/Spatial Breakdown, Form, Discipline) and dropped fixed field lengths, so names are checked against a project's own code list (*source claim*, Symetri blog). CDEs enforce naming on large jobs (*inference*).
- **Strongest incumbent:** a practice's own Excel issue sheet, which every office already has.
- **Possible Labs wedge:**
  - Drop in the folder of PDFs being issued. Drawing numbers, titles and revisions are read from the file names, using a pattern set once per practice (ISO 19650 UK names optional).
  - A new issue column is added, with date, purpose or status code, recipients and format.
  - The page flags drawings missing from the set, revisions that went backwards and duplicate numbers. By hashing each file locally, it also catches a drawing whose content changed while its revision didn't.
  - It prints the issue sheet and the transmittal. The register is a file the practice saves in the project folder and reopens next time.
- **Labs-fit problems:**
  - The saved register file is the team's shared copy, so two people editing it at once would conflict.
  - File names must carry the revision.
  - Nothing is uploaded: the hashing is local.
- **Strongest reason not to build:**
  - Excel is good enough for most offices, and BIM users already have issue data in their software.
  - A practice's issue sheet is a branded document in its own format.
  - The pain evidence is a few forum threads, not a chorus.
- **Thread verdict:** lead, moderate to weak. It's distinctive only through the "changed without a new revision" check and through building the register from the actual files.

### Lead 3. Translator quote counts (words, 55-character standard lines, 1,800-character standard pages), done locally

- **Audience:** freelance translators and small agencies quoting from clients' confidential files.
- **The job:**
  - Before: a client sends files (docx, pptx, xlsx, PDF).
  - After: a quote per word, per standard line (Germany: 55 characters with spaces, *source claim*) or per standard page, across several files.
- **Frequency / importance:** every enquiry. Confidentiality agreements argue against online counters, which upload the files (*source claim*, an agency's online counter).
- **Evidence of friction:**
  - Trados users ask how to get a line count rather than a word count (RWS community thread, *source claim*).
  - ProZ thread "Free word count tool for pdf?" (*source claim*).
- **Alternatives found:** PractiCount (shareware), AnyCount, Abracadabra PDF Word Counter (an Acrobat add-in), QuickCount (2006), and Windows "Free PDF Utilities - PDF Word Count" (*source claim*). CAT tools' analyses, including OmegaT, free (*inference*).
- **Strongest incumbent:** the translator's CAT tool, plus PractiCount or AnyCount for line counts.
- **Possible Labs wedge:** a browser counter that reads the files locally and works on Mac and Chromebook. It gives per-file and total counts under several conventions.
- **Labs-fit problems:** none technical. But counting conventions differ (Word versus Trados, numbers, hyphens, CJK).
- **Strongest reason not to build:** niche, served by desktop tools, and in Labs' crowded files cluster.
- **Thread verdict:** weak.

## Screened out

- **Bank statement PDF to CSV with a balance check (bookkeepers): REJECT.** The local niche is already filling up:
  - "Local Bank Statement Converter" claims in-browser WebAssembly processing, offline after the first load (Peerlist/PeerPush, *source claim*);
  - BankConvert Starter claims in-browser processing, at $29 a month (*source claim*);
  - Statemently advertises a balance check, with cloud conversion (*source claim*);
  - ProperSoft PDF2CSV runs on the desktop (*source claim*);
  - Excel's PDF connector covers Windows users (*inference*).

  It's crowded, and squarely in Labs' files-and-privacy cluster.
- **CDM 2015 construction phase plans for small builders: REJECT.** CITB's CDM Wizard is free on iOS, Android and the web, and still listed and maintained (App Store "New CDM", CITB page, *source claim*). HSE's construction phase plan FAQ points small builders to its CIS80 template and the CDM Wizard (*source claim*).
- **Great crested newt pond HSI (ecologists): REJECT.**
  - ARG UK publishes a free HSI calculator with Advice Note 5 (arguk.org, *source claim*).
  - Froglife's 2025 briefing links a free Google Sheet that computes both the original index and the 2024 modified index (Seccombe & Salguero-Gómez) (*source claim*).
  - A QGIS plugin pre-scores SI1-SI6 remotely (*source claim*).
- **CIS payment and deduction statements (small builders): weak.** A statement is needed for every subcontractor paid under deduction, monthly or per payment (HMRC wording via BrightPay docs, *source claim*). BrightPay CIS and FreeAgent generate them (*source claim*), as do the main accounting packages (*inference*). The maths is 20% or 30% of the labour part.
- **Part O simplified method (architects, SAP assessors): weak.** It's real and fiddly: "requires a lot of measuring" (CIBSE event write-up, *source claim*). But the Future Homes Hub publishes a free spreadsheet for the free area, opening angle and 650 mm reach limit (*source claim*, CIBSE Journal). Energy assessors sell Part O assessments, and the result is a compliance claim made to building control (*inference*).
- **BS 5837 root protection areas and tree schedules (arboricultural consultants): weak.** PlanWatch has a free RPA calculator (*source claim*). The schedule's columns are set by the standard (council pages, *source claim*), and paid apps plus Excel cover it (*inference*). The RPA is 12 x stem diameter, capped at 707 m2.
- **Quarterly fire door checks, Fire Safety (England) Regulations 2022 reg. 10: weak.** The duty is real: quarterly checks of communal fire doors and best-endeavours annual checks of flat entrance doors in buildings over 11 m, from 23 January 2023 (GOV.UK fact sheet, *source claim*). But it's a checklist and a dated record:
  - paid apps cover it (Zutec, SwiftCase, *source claim*), as do free-tier form apps (*inference*);
  - a multi-year compliance record in browser storage is fragile, and the rounds are shared between people (*inference*).
- **Photographic schedules of condition (party wall surveyors): weak.**
  - A series of pictures in Word needs manual numbering (Microsoft support, *source claim*).
  - Paid apps target exactly this: GoReport's Photographic Schedule of Condition and Softomate SurveyorPro (*source claim*).
  - It's close to Batch 07's rejected move-in condition report.
- **NDSS schedule of accommodation check: weak.** The rules are threshold lookups on bedroom and dwelling sizes, widths and storage, including 50% counting at 900-1500 mm headroom (gov.uk NDSS and council pages, *source claim*). They apply through local plans and to all permitted-development homes (*source claim*). No free checker surfaced, but the check is trivial with CAD areas and a spreadsheet (*inference*).
- **Hedgerows Regulations 1997 "important hedgerow" test: weak.** It's rule-defined: on average 7 woody species per 30 m section, or 6 plus 3 associated features, and so on (East Suffolk FAQ and NSIP reports, *source claim*), and no calculator surfaced. But removal for a development with planning permission is exempt (*source claim*), so the test mainly serves EIA valuation and farm removal notices (*inference*). It's also close to Batch 08's hedgerow-condition idea.
- **Bat emergence survey timing: weak.** A sunset lookup plus fixed offsets (start about 15 minutes before sunset, run 1.5-2 h; *source claim*) is trivial arithmetic. The real work, scheduling surveyors across a season, is shared team state (*inference*).

Dropped at the scan stage without spending searches (*inference*):
- late-payment interest under the 1998 Act (free calculators exist);
- the MTD for Income Tax eligibility check (gov.uk has one);
- heat pump and EV connection applications (ENA's free Connect Direct);
- MCS 020 heat pump noise (Heatpunk; the heat pump area is settled);
- gas pipe and ventilation sizing, stair geometry, joist spans, lintels (free manufacturer and trade calculators);
- BS EN 806-3 water pipe sizing (copyrighted tables);
- ecologists' target notes with GPS (QField is free and works offline);
- HHSRS scoring (a reform is pending, and the judgement is the inspector's);
- SRA three-way client account reconciliation (practice management software; the accounting family is settled);
- PAS 2035 risk pathways (a lookup);
- rent arrears schedules for possession claims (legal stakes and an eviction context);
- party wall notices (free templates);
- planning location plans (OS licensing);
- waste transfer notes (digital waste tracking is moving to a government service).
