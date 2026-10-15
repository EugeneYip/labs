# Thread A: field work, trades, maintenance and facilities (Batch 10, round 1, 2026-10-14)

Bounded research thread (at most 10 searches, 8 page reads). Need first; nothing here is a decision. Labels: *verified* (read on an official or primary page), *source claim* (a page or search snippet says so), *inference* (this thread's judgment).

## Summary

Budget: all 10 searches and 8 reads used. Two reads failed: a filed percolation record redirected and then returned 404. One fetched PDF (Approved Document H) was read through local text extraction, with no extra download. Leads ranked:

1. **A field log for percolation and soakaway tests (Approved Document H2 / BS 6297 Vp test; H3 / BRE Digest 365 infiltration test): lead, moderate, the only survivor.**
   - *For:* the rules are *verified* in ADH 2015: the 300 mm hole and overnight pre-soak, timing the fall from 75% to 25%, at least 3 runs in at least 2 holes, average Vp 12 to 100, At = p x Vp x 0.25, and 10 mm in 5 minutes for soakaways up to 25 m2. Hastings' required record is *verified*: readings, a graph of level against time, the calculations, the half-emptying time. The incumbent's gap is *verified*: UNDA's free calculators need the crossing times or a Vp already worked out, and keep no field readings, draw no graph and give no half-emptying time. No app turned up, and forums show unit slips and the two tests being mixed up.
   - *Against:* the arithmetic is already free (UNDA), professionals have their own software, DIY users do this once, and soakaway design over 25 m2 needs rainfall data a static site can't supply.
2. **Hydrant flow and fire pump tests (NFPA 291 and 25): weak.** The calculation is two formulas. The valuable artifacts are made in paid sprinkler software or kept in shared asset records.
3. **Legionella logs (HSG274 Part 2): REJECT.** A dated log with fixed thresholds, kept for 5 years and shared between staff. Paid apps with Bluetooth probes and free templates already cover it.
4. **Cut and fill from a spot-level grid: REJECT.** Free browser tools already exist (Civils.ai; Toolgrit's 20 x 20 grid with swell factors; Vertigraph), plus an iPhone app.
5. **Gas tightness tests (IGEM/UP/1B Ed 4, UP/1A): REJECT.** Edition 4 has been mandatory since 1 October 2026, and apps already handle its installation-volume method. The users are registered engineers, and the standards are paid.
6. **PE water main pressure tests (WIS 4-01-03): REJECT.** The analysis is done from data loggers, so a tool would mean parsing logger files. The testers are accredited contractors, and the water company decides acceptance.

Before giving lead 1 a number, the main session should check four things: the ADH 3.28 and 3.29 equations (images in the PDF), BRE 365's procedure and half-emptying rule from a primary source, whether consultants' calculation libraries already log field readings, and one filed report.

## Prior records checked (no search budget)

Grepped batch-07 to batch-10 for: legionella, HSG274, sentinel, TMV, flushing, cut and fill, earthwork, spot level, gas tightness, IGEM, tightness, percolation, soakaway, BRE 365, infiltration, septic, drainage field, commissioning, anemometer, air flow, illuminance, lux, pressure test, PE pipe, HAVS, vibration, noise exposure, chlorination, disinfection, floor flatness, air tightness, radon, emergency lighting, EICR, loop impedance, LOLER, scaffold, and more.

- None of the three seed leads (Legionella, cut and fill, gas tightness) appears in earlier records.
- Settled before, so not reopened here: Batch 09 thread A screened BS 5837 RPAs (weak), quarterly fire door checks (weak: "a checklist and a dated record", multi-year records in browser storage are fragile), party wall schedules of condition, NDSS, Part O, CDM plans, newt HSI, bat timing, hedgerows; and dropped "gas pipe and ventilation sizing, stair geometry, joist spans, lintels" and BS EN 806-3 pipe sizing at the scan stage. Batch 08 rejected room-by-room heat loss and listed the sprinkler catch-can audit.
- Not in earlier records: percolation tests (BS 6297 / Approved Document H2), soakaway infiltration tests (BRE 365), hydrant flow tests, PE water main pressure tests, ventilation commissioning measurements, illuminance surveys. These are candidates for this thread's own leads.

## Running log

### Search 1 (Legionella logs, HSG274 Part 2)

Query: legionella log book app, sentinel outlet monthly temperature checks, flushing records, small business.

- The checks are thresholds, not calculations: cold water under 20°C after running two minutes; hot water at least 50°C within one minute; calorifier outgoing at least 60°C, return at least 50°C; sentinel outlets monthly, representative outlets on rotation; TMV supplies also 50°C within a minute (HSE "Hot and cold water systems - things to consider", https://www.hse.gov.uk/Legionnaires/things-to-consider.htm, and an older HSE table, https://www.hse.gov.uk/foi/internalops/sims/pub_serv/07-12-07/appendix3.htm, *source claim* via search summary; not read).
- Retention: monitoring and inspection records kept at least five years (*source claim*, search summary of HSE material).
- Incumbents, paid: LD-Control (LegionellaDossier), a digital logbook with a Bluetooth thermometer that ticks tasks off automatically, reminders (https://legionelladossier.com/wp-content/uploads/2021/09/LegionellaDossier_UK_Flyer_LD-Control_Preview_03.pdf, *source claim*); LegionellaSafe (Legionella Control International, https://legionellacontrol.com/legionella/legionella-log-book-managing-risks-legionella-bacteria/, *source claim*); ZetaSafe via Hydro-X (https://hydro-x.co.uk/?p=738, *source claim*).
- Incumbents, free: SafetyCulture library templates "Legionella monthly tap temperature checks", "Water outlet and temperature register", "Monthly water checks register" (https://safetyculture.com/library/health-care/legionella-monthly-taptemperature-checks, *source claim*); Lumiform log book template (https://lumiformapp.com/templates/legionella-log-book-template); a council's sample water services log book (Redditch, https://moderngovwebpublic.redditchbc.gov.uk/documents/s3679/Water services log book Sample - Appendix 2.pdf). In small premises the risk assessor usually leaves a log book (*inference*).
- **Verdict: REJECT.** The real work is a dated log with fixed thresholds, not a calculation; it must be kept five years and is shared by whoever does the rounds (caretaker, cover staff), which browser storage on one device serves badly. Same shape as Batch 09's fire door checks. Paid apps with Bluetooth probes and free templates cover it. No further budget spent.

### Search 2 (cut and fill from a grid of spot levels)

Query: free cut and fill volume calculator from a grid of existing and proposed spot levels.

- Civils.ai "Advanced Cut and Fill": grid spacing plus N x N blocks of existing and proposed levels; cut, fill and net per cell; processes the spreadsheet in the browser (https://civils.ai/free-construction-estimating-software/advanced-cut-and-fill, *source claim*).
- Toolgrit "Cut & Fill Earthwork Calculator": up to a 20 x 20 grid of survey points, swell and shrink factors by soil type, truck loads, a cut/fill zone map (https://www.toolgrit.com/tools/cut-fill-calc, *source claim*).
- Vertigraph: average-depth and grid methods, metric or imperial; points users to its paid SiteWorx for bids (https://www.vertigraph.com/tools/cut-and-fill-calculator, *source claim*).
- An iPhone app, "CutFill Grid", four-corner averaging, 2 x 2 to 6 x 6 points (https://www.iphoneaddict.fr/apps/utilitaires/cutfill-grid-147.html, *source claim*).
- **Verdict: REJECT.** The grid method is already free in the browser, with the extras a small contractor wants (swell factors, loads, a zone map). Anything better needs triangulated surfaces from survey files (paid takeoff software, and the file-parsing cluster). Killed on one search.

### Search 3 (gas tightness tests, IGEM/UP/1A and UP/1B)

Query: IGEM/UP/1A tightness test duration calculator app, installation volume, permitted pressure drop.

- Timely but already served. IGEM/UP/1B Edition 4 is mandatory from 1 October 2026 and replaces meter-size-based permissible drops with Installation Volume (IV); purge volume becomes 1.5 x IV (Joblogic, https://www.joblogic.com/blog/what-igem/up/1b-edition-4-means-for-gas-engineers-from-1-october-2026; Gas Engineer Software, https://gasengineersoftware.co.uk/blog/igem-up-1b-edition-4-changes-calculating-installation-volume/; both *source claim*). IGEM's FAQ gives, for natural gas with IV above 0.015 and up to 0.035 m3, a maximum permissible loss of 1 mbar (https://www.igem.org.uk/technical/buy-technical-standards/utilisation/faq-igem-up-1b.html, *source claim* via search summary).
- Incumbents: the iOS app "GB Gas Tightness Testing" advertises an automatic IV calculator and the 2026 permissible-loss calculations (https://apps.apple.com/app/id428846431, *source claim*); an interactive "IGEM UP 1B Ed 4 Tightness Test Calculator" that says it mirrors an Excel workbook's logic (pipe length x factor, IV summed, drop from a threshold table) (https://crm-files.monday.com/eu-central-1/15467507/received/ce58008b-b37d-4932-a17a-62c3be928b0f/IGEM_UP_1B_Ed_4___Tightness_Test_Calculator.html, *source claim*); trade software vendors publishing the method (Gas Engineer Software, Joblogic, Trade2base). Gas Safe engineers record the test on certificates made in paid trade apps (*inference*). UP/1A (commercial, up to 1 m3 and 40 mbar) is a paid IGEM standard; the figures aren't public (https://www.igem.org.uk/resource/ige-up-1a-edition-2-a-2005-strength-tightness-testing-purging-of-small-low-pressure-industrial-commercial-installations.html).
- **Verdict: REJECT.** Registered engineers only, a crowded trade-app market that moved to Edition 4 within weeks, and the tables sit in paid standards (copyright and liability). Killed on one search.

### Search 4 (own lead: percolation tests for drainage fields, BS 6297 / Approved Document H2)

Query: percolation test calculator, Vp seconds per mm, drainage field area, septic tank, treatment plant, H2.

- The method (council guidance, *source claim* via search summary): a 300 mm square test hole; time the fall from 75% to 25% full (150 mm) and divide by 150 to get Vp in seconds per mm; at least three runs in each of at least two holes, then average; avoid heavy rain, severe frost or drought. Dover (https://www.dover.gov.uk/Planning/Building-Control/Apply/Percolation-Tests-And-Calculations.pdf), Copeland (https://www.copeland.gov.uk/sites/default/files/attachments/percolation_foul_0.pdf and percolation_test_treatment.pdf), Eden (https://eden.gov.uk/planning-and-building/building-control/building-control-guidance-notes/percolation-test), Stratford (https://www.stratford.gov.uk/planning-regeneration/technical-section--percolation-test.cfm).
- The rules differ by council: Copeland and Eden accept a drainage field for average Vp of 12 to 100; Dover says above 140 the soil is unsuitable (*source claim*). Area At = P x Vp x 0.25 (septic tank) or 0.2 (treatment plant), P the people served; trench length = At / width (Dover, Eden, *source claim*). Each council publishes its own form with the arithmetic laid out for hand calculation (*source claim*).
- Councils also publish separate soakaway (surface water) test guidance: Reading's "Percolation Test Guidance (Soakaways)" (https://images.reading.gov.uk/2025/06/Soakaway-Guidance.docx) and West Devon's infiltration testing page with a simplified route for impermeable areas under 25 m2 (https://westdevon.gov.uk/planning/flood-risk-and-surface-water-management/sustainable-drainage-advice/infiltration-testing-2) (*source claim*).
- No ready-made online calculator came up in this search; the incumbents are council paper forms, a stopwatch, and spreadsheets (*source claim* for the forms; *inference* for the rest). JDP has a sizing explainer (https://www.jdpipes.co.uk/knowledge/sewage-treatment/sizing-septic-drainage-field.html).
- Thread view so far (*inference*): the foul-drainage arithmetic alone is small (divide, average, multiply) and would be a "nice little utility". What's harder is the field logistics (several holes, three runs each, hours per run when Vp is high, a pre-soak the night before) and the record. The surface-water test (BRE 365) has a bigger calculation. Next: check BRE 365 alternatives and look for practitioner friction.

### Search 5 (own lead: soakaway infiltration tests, BRE Digest 365)

Query: BRE 365 soakaway infiltration test calculator from trial pit readings, free spreadsheet or app.

- **The strongest incumbent for the arithmetic:** UNDA's free "BRE 365 Infiltration Rate Calculator": pit dimensions plus the 75%-to-25% fall time for up to three tests; returns the design rate in m/s and mm/h; takes the lowest of the tests (the Digest's worst case); downloadable PDF report; "no data stored"; results indicative, to be checked by an engineer (https://www.unda.co.uk/bre-365-infiltration-rate-calculator/, *source claim* via search summary; read next).
- Others: civils.ai's free soakaway/SuDS sizing calculator starts from an infiltration rate, it doesn't reduce trial pit readings (https://civils.ai/free-soakaway-suds-calculator, *source claim*); Excelcalcs has a "Soakaway Design to BRE Digest 365 2016" calc (https://www.excelcalcs.com/calcs/repository/Fluids/Rainfall/Soakaway-Design-to-BRE-Digest-365-2016/, not opened); BRE sells the Digest (https://bregroup.com/store/bookshop/soakaway-design-dg-365-2016-download); form-filler sites list unattributed "BRE 365" sheets.
- West Devon: ground below about 1e-6 m/s is generally unsuitable for infiltration; a separate route for impermeable areas over 25 m2 (https://westdevon.gov.uk/planning/flood-risk-and-surface-water-management/sustainable-drainage-advice/infiltration-testing-3, *source claim*).
- Real reports are filed with planning applications, for example Ribble Valley's "25_0844_Percolation_Report.pdf" (https://webportal.ribblevalley.gov.uk/planx_downloads/25_0844_Percolation_Report.pdf, not opened) and an EA permit appendix "Infiltration Assessment Report" (https://consult.environment-agency.gov.uk/psc/gl15-4ej-lydney-skip-hire-ltd/supporting_documents/9d%20Application%20Bespoke%20Appendix%20I%20Infiltration%20Assessment%20Report%20180621.pdf).
- Thread view (*inference*): UNDA already turns three fall times into a design rate and a PDF, so a plain calculator adds nothing. A remaining wedge would be upstream of it, in the field: logging depth readings over time in several pits at once (often with no signal), finding the 75% and 25% crossing times from readings that straddle them, the pre-soak and repeat rules, and one record holding both the foul (H2, Vp) and surface water (H3, f) tests. Whether that is material is the open question.

### Read 1 (UNDA's BRE 365 calculator, the strongest incumbent for Lead 1)

https://www.unda.co.uk/bre-365-infiltration-rate-calculator/ (read 2026-10-14, *verified* as to what the page says):
- Inputs: pit length, width, excavated depth, fill level (effective depth = depth minus fill level), "Groundwater encountered?" and resting level; optional report fields (project, site, pit reference, tested by, date, strata); for up to three tests, the time to the 75% level and the time to the 25% level in minutes ("Enter at least one test").
- No series of depth/time readings: the user must already know the two crossing times. Nothing on tests that never reach 25%.
- Output: the "Design soil infiltration rate (lowest f)" in m/s and mm/h, a results table to copy, a PDF report. "guides, not pass/fail thresholds".
- Not covered: BS 6297 / H2 percolation ("not interchangeable" with BRE 365), and soakaway sizing (the rate is "an input, not the finished design").
- Free, "for general information only", "nothing you type is stored"; a cookie banner; no sign-up.
- So the free arithmetic and a PDF exist for BRE 365. What's missing is the field side (readings over time, several pits, offline), the foul-drainage test, and pass/fail against a stated rule. *Inference:* the gap is real but narrow; the calculation the gap covers is interpolation, which is not hard.

### Search 6 (own lead: hydrant flow tests and fire pump tests, NFPA 291 / NFPA 25)

Query: hydrant flow test calculator, NFPA 291, N^1.85 graph, free app, fire pump annual test, pitot readings.

- The arithmetic is two formulas: outlet flow Q = 29.83 c d^2 sqrt(p) (c 0.9 / 0.8 / 0.7 by outlet shape) and the flow available at 20 psi residual, Qr = Qf ((Ps - 20)/(Ps - Pr))^0.54 (open-exam-prep NICET study guide, https://open-exam-prep.com/study-guides/nicet-itwbs/water-supply-systems-private-mains/flow-testing-pitot-calculations; Temecula Fire worked examples, https://www.temeculaca.gov/DocumentCenter/View/164/Temecula-Fire-FlowCalculations-With-Examples-PDF; CSE Magazine, https://www.csemag.com/how-to-conduct-fire-hydrant-flow-testing/; all *source claim*). NFPA 291 advises pitot readings between 10 and 30 psi where possible (MWUA, https://www.mwua.org/nfpa-291-hydrant-flow-testing/, *source claim*). One blog gets the exponent wrong (0.5 instead of 0.54) (https://industrialmonitordirect.com/blogs/knowledgebase/fire-hydrant-flow-calculation-for-nfpa-291-compliance), a small sign that people do this by hand.
- No calculator app surfaced in this search, but the people who use the result (sprinkler designers) work in hydraulic calculation software that takes static, residual and flow and draws the supply curve, and utilities' hydrant programmes run in asset or GIS systems with shared records (*inference*, not searched further).
- **Verdict: weak.** A US professional field (NICET technicians, utilities) where the field calculation is small, the downstream artifact is made by paid design software, and a municipal testing programme needs shared asset records. Not pursued (budget kept for the stronger lead). The NFPA 25 annual fire pump test (several flow points, speed correction, comparison with the certified curve) is a bigger calculation, but contractors record it in inspection software (*inference*); not searched.

### Search 7 (own lead: PE water main pressure tests, the UK "Type 2" test)

Query: PE water main pressure test calculation, n1 n2 log decay, Type 2 test, spreadsheet, self-lay, IGN 4-01-03 certificate.

- The standard moved: WIS 4-01-03 Issue 1 (March 2024) is current; IGN 4-01-03 Issue 2 (2015) is archived; an amendment was out for comment in October 2024 (Water UK Standards Board, https://standards-board.water.org.uk/wp-content/uploads/2022/11/Briefing-Note-WIS-4-01-03-Draft-for-public-comment-231122.pdf; old IGN https://www.water.org.uk/sites/default/files/wp/2018/11/IGN-4-01-03-31-Nov-2015.pdf; *source claim*).
- Uisce Éireann's self-lay toolbox talk: STP = 1.5 x MDP at the lowest point, surge at least 2 bar where unknown; pressurise and leave at least an hour; "a data logger records" creep and pressure drop; the readings "will be fed into a mathematical equation" for pass or fail; pre-pressurisation fails the test (https://water.ie/sites/default/files/2024-10/TT5-IW-Pressure-Main-Testing.pdf, *source claim*). United Utilities publishes a guidance leaflet with an example certificate (https://www.unitedutilities.com/globalassets/documents/builders--developers-docs/advice-for-builders/hydrostatic-pressure-testing-guidance-leaflet.pdf); vesting checklists require the test record (Northumbrian Water, https://www.nwl.co.uk/globalassets/customer-pdfs/developer-pdfs/self-lay-2023/nwl/form-nw---sln-f110---self-lay-vesting-certificate-checklist-25.5.2023.pdf). Australian utilities publish manual test sheets (Gippsland Water 5-hour PE sheet, https://www.gippswater.com.au/sites/default/files/2026-07/Water%20Pipeline%20Pressure%20Test%20Sheet%20-%205hr%20PE.PDF).
- **Verdict: REJECT.** The UK test runs on a data logger whose software does the analysis (*source claim* that a logger is used; *inference* about its software), so a browser tool becomes logger-file parsing (an avoided cluster). The audience is accredited self-lay and utility contractors, the water company decides acceptance, and the formula's current form sits in a standard that has just been revised. Not pursued.

### Search 8 (Lead 1: practitioner friction on percolation and soakaway tests; forums only)

Query: percolation test results, Vp, building control, soakaway test pit, how to calculate (BuildHub, DIYnot, Screwfix, eBuild, boards.ie, selfbuild.ie).

- Threads found: DIYnot "Soakaway to BRE digest 365?" (https://www.diynot.com/diy/threads/soakaway-to-bre-digest-365.408104/), "Soakaway - How big do I have to build it?" (https://www.diynot.com/diy/threads/soakaway-how-big-do-i-have-to-build-it.222438/); BuildHub "Rainwater Soakaway Design???" (https://forum.buildhub.org.uk/topic/15761-rainwater-soakaway-design/), "Soakaway size" (https://forum.buildhub.org.uk/topic/14493-soakaway-size/), "Suds calculator" (https://forum.buildhub.org.uk/topic/28542-suds-calculator/), "Warranty site inspection report and percolation test" (https://forum.buildhub.org.uk/topic/38514-warranty-site-inspection-report-and-percolation-test/); Screwfix "Soakaway - How big does it need to be ?" (https://community.screwfix.com/threads/soakaway-how-big-does-it-need-to-be.14513/).
- Friction in the snippets (*source claim*, search summary of the threads; one is read next):
  - a worked example divided 60 minutes by 150 instead of 3600 seconds (0.40 instead of a Vp of 24), caught by another poster;
  - posters apply the foul-drainage percolation test (BS 6297, Vp) to soakaway sizing and convert with "f = (1/Vp)/1000", and disagree about the conversion. *Inference:* that conversion ignores the pit's geometry, and UNDA's page says the two tests are "not interchangeable" (Read 1);
  - "soakaway designs vary from county to county and authority to authority"; rules of thumb such as roof area / 40 m3; disagreement on when a test is needed at all (one says over 100 m2).
- So the people doing these tests themselves (self-builders, small builders) mix up the two tests and slip on units, and the councils' own rules differ. That is error evidence, but from forums, not from building control.

### Read 2 (DIYnot "Soakaway to BRE digest 365?", July 2014)

https://www.diynot.com/diy/threads/soakaway-to-bre-digest-365.408104/ (read 2026-10-14; *source claim*, a practitioner forum; old):
- A homeowner in Sussex adding an orangery: about 34 m2 of new roof to one soakaway. Building control required calculations for roofs over 25 m2 and "insisted" on BRE Digest 365 or BS EN 752-4; the owner meant to do the test themselves.
- Stuck on the maths: a downloaded UKSuDS spreadsheet didn't produce a results page. Advice split: a 1 m3 hole is usually fine unless clay; ask building control to accept an LABC note; hire a structural engineer (one poster said a full test with a bowser and an engineer on site would be overkill for the job's size); a worked example with a percolation value of 18 and a 1.1 m cube. Posters disagreed on BRE 365 versus Approved Document H; the roof area was misquoted (34 vs 43 m2).
- *Inference:* the friction is real for one-off extension builders, but much of it sits in the design step (rainfall, storage), not only in the test arithmetic; BRE 365's design needs location rainfall statistics (M5-60 and r from the Digest's maps, or FEH data, which is licensed), which a static tool can't supply freely. The field-test step alone is the part a Labs tool could own outright.

### Search 9 (Lead 1 falsification: is there already an app or tool for the field log?)

Query: percolation test app or soakaway test app, iPhone/Android, record trial pit water level readings, timer, BRE 365, BS 6297, report.

- No dedicated phone app or web tool for logging BRE 365 or BS 6297 field readings surfaced (*source claim*, absence in one search; not proof). Nearest: UNDA's web calculator (needs the two crossing times already worked out; Read 1); Landcare Research's free ring-infiltrometer app (NZ; a different test, https://www.landcareresearch.co.nz/publications/soil-horizons/soil-horizons-articles/infiltrometer-network); an academic paper turning the DIN 19682-7 infiltration test into a mobile app with cloud storage (https://journal.binus.ac.id/index.php/comtech/article/view/13000); civils.ai sizing from a given rate.
- How the field work is recorded today (*source claim*, search summary): one report dips "every 5 minutes for the first hour and every hour until the pit is one quarter full"; Hastings says fill the pit three times in quick succession; Southwest Environmental's technical note says "modern BRE 365 calculation software" needs perhaps 5 to 10 readings, and the test should run until 50% has soaked away (https://southwest-environmental.co.uk/further%20info/drainage/bre_365_soakaway_tests.html). So consultants have software of their own (*inference*: not named).
- **What a council asks for:** Hastings' soakaway advice note lists trial pit logs, water level measurement records, a graph of water level against time, a timestamped photo of the pit, the infiltration rate calculations, and the soakaway's half-emptying time (https://www.hastings.gov.uk/planning/advice/soakaway-advice-note, *source claim*; read next).
- UNDA's BS 6297 article says the two tests are assessed against separate criteria and that submitting the wrong one is a common reason applications are returned (https://www.unda.co.uk/news/what-is-bs-6297-infiltration-testing-for-foul-drainage-fields/, *source claim* by a vendor that sells testing).
- Real filed records exist to compare against: Copeland "plot 2 arlecdon road - percolation results" (https://www.copeland.gov.uk/sites/default/files/planning-applications/plot_2_arlecdon_road_-_percolation_results_.pdf), Ribble Valley 23_0549 and 25_0844 percolation reports, Copeland Hensingham infiltration testing letter (https://www.copeland.gov.uk/sites/default/files/planning-applications/2328_l001_hensingham_housing_development_infiltration_testing_17.07.2023_0.pdf).

### Read 3 (Hastings Borough Council soakaway advice note)

https://www.hastings.gov.uk/planning/advice/soakaway-advice-note (read 2026-10-14; *verified* as the council's own page):
- A soakaway test report must support a planning application (no area threshold given). The test is for a "suitably qualified engineer/ consultant" or an experienced company; homeowners aren't mentioned.
- Pit 0.3-1 m wide, 1-3 m long, to the depth of the full-size soakaway below the drain invert; the same dimensions for every pit; mark the 75% and 25% effective depths, or use a perforated observation tube and dip tape if the pit is filled with gravel; fill three times in quick succession; record the times to 75% and 25%; compare the three to find the minimum rate. Nothing on a pit that won't drain.
- The report must contain: trial pit log records; water level measurement records; a graph of water level against time; a timestamped photograph of the pit; the infiltration rate calculations; the half-empty time. BRE 365 for the detail.
- *Inference:* this is a concrete, council-specified artifact that a field log could produce whole (readings table, graph, calculation, half-emptying time for a proposed soakaway), apart from the photo, which a phone takes anyway. But Hastings expects professionals to do it, which narrows the audience to small consultancies and groundworkers, who have their own software or sheets ("modern BRE 365 calculation software", Search 9).

### Reads 4-5 (Approved Document H, 2015 edition: the primary rules for Lead 1)

gov.uk publication page (https://www.gov.uk/government/publications/drainage-and-waste-disposal-approved-document-h) links the PDF https://assets.publishing.service.gov.uk/media/5a80cf9ded915d74e33fc8ae/BR_PDF_AD_H_2015.pdf. WebFetch couldn't parse it but saved the file it had fetched; its text was extracted locally with macOS PDFKit (64 pages; no further download). *Verified* (text of the official document):
- **H2 percolation test, paras 1.34-1.37:** a hole 300 mm square, dug to 300 mm below the proposed invert of the distribution pipe (a 300 mm auger for deep cases); fill to at least 300 mm and let it seep away overnight; next day refill to at least 300 mm and time the fall "from 75% full to 25% full level (i.e. a depth of 150mm)"; divide by 150 to get Vp in seconds per mm; "at least three times with at least two trial holes. The average figure from the tests should be taken"; not in heavy rain, severe frost or drought. A trial hole of at least 1 m2 and 2 m deep (or 1.5 m below the invert) comes first, for the groundwater check (para 1.33, partly read).
- **Para 1.38:** a drainage field only when average Vp is "between 12 and 100" and the preliminary assessment and trial holes are favourable; outside that, secondary treatment and then a soakaway may still be possible. (So ADH says 12-100; Dover's 140 is that council's own figure.)
- **Paras 1.42-1.44:** trenches 300-900 mm wide, 2 m of undisturbed ground between parallel trenches, pipes at least 500 mm deep, a continuous loop from an inspection chamber; floor area At = p x Vp x 0.25 (p = persons served). ADH gives only the 0.25 septic tank factor; the 0.2 for treatment plant effluent is in councils' guidance (Dover, Search 4) and, per those councils, BS 6297 (*source claim*).
- **H3 soakaways, paras 3.25-3.30:** not within 5 m of a building or road; designed to a 1-in-10-year return period, trying storms of different durations for the largest storage; "For small soakaways serving 25m² or less a design rainfall of 10mm in 5 minutes may be assumed"; percolation tests per H2 1.34-1.38, with f related to Vp "by the equation" (the equation is an image the extraction didn't capture; *inference* from memory, not verified: f = 10^-3 / (2 Vp) m/s); storage = inflow minus outflow, outflow from a_s50, f and the storm duration (equation also an image); larger areas to BS EN 752-4 or BRE Digest 365.
- *Inference:* so England's own guidance links the two tests for small soakaways (one reason posters convert Vp to f), but for anything over 25 m2 the design needs rainfall statistics for the storm durations (BRE 365's M5-60 and r maps, or licensed FEH data), which a static tool can't provide for free. The test reduction (Vp, f, half-emptying time, drainage field area and trench length) needs nothing external.

### Search 10 (Lead 1: what consultants and designers use for the design step)

Query: BRE 365 soakaway design software engineers use, Tedds, UKSuDS, free tool, infiltration test calculation spreadsheet.

- UNDA has a whole free UK drainage calculator suite, soakaway sizing included, each showing its working against the standard, pitched as "a fast, defensible first pass", not a submission-ready design (https://www.unda.co.uk/drainage-calculators/, *source claim*; read next).
- BRE Digest 365 (2016, Stephen Garvin) is a paid download; the 2016 edition added Environment Agency climate change allowances and a 100-year return period (https://bregroup.com/store/bookshop/soakaway-design-dg-365-2016-download; designingbuildings wiki, https://designingbuildings.co.uk/wiki/BRE Digest 365 Soakaway design; *source claim*).
- UKSuDS offers a greenfield runoff tool, not BRE 365 test reduction; the BGS infiltration SuDS map is a licensed screening dataset (https://www.bgs.ac.uk/?p=4685) (*source claim*). No Tedds module surfaced in this search (not proof; Tekla Tedds is the usual UK engineers' calc library, *inference*).
- Councils publish their own forms: Kingston's drainage assessment form template (https://www.kingston.gov.uk/sites/default/files/downloads/RBK_Drainage_Assessment_Form_template_v3.pdf), Staffordshire's SuDS Handbook Appendix C (https://www.staffordshire.gov.uk/sites/default/files/2025-11/SuDS-Handbook-Appendix-C-v2.docx), Eden's BRE 365 guidance note (https://eden.gov.uk/planning-and-building/building-control/building-control-guidance-notes/soakaway-design-bre-digest-365) (*source claim*).
- All 10 searches used.

### Read 6 (UNDA's drainage calculator suite)

https://www.unda.co.uk/drainage-calculators/ (read 2026-10-14; *verified* as to what the page lists):
- 22 free calculators that "runs in your browser" and "needs no sign-up or download", including Septic Tank Size, Cesspool Size & Emptying, **Drainage Field Size (from a Vp result, citing BS 6297)**, Land Drain, Gutter & Downpipe, Drainage Fall, rainwater harvesting, SuDS water quality, climate change allowances, plus the BRE 365 Infiltration Rate Calculator (Read 1).
- None takes water level readings over time, plots level against time, works out Vp from the runs themselves, or gives a soakaway's half-emptying time (as far as the page says). Nothing about offline use.
- *Inference:* the arithmetic on both sides (Vp to drainage field; crossing times to f) is now free in the browser from one drainage firm. What's left for Labs is the field work before it and the record after it.

### Reads 7-8 (a filed percolation record, to see today's artifact): not read

- Copeland's "plot 2 arlecdon road - percolation results" PDF redirects (301) to cumberland.gov.uk (Copeland merged into Cumberland Council), where the same path returns 404. Both attempts counted against the budget. All 8 reads used; the Ribble Valley reports (23_0549, 25_0844) and Copeland's Hensingham letter remain unread for the main session if needed.

## Leads

### Lead 1. A field log for percolation and soakaway tests (Approved Document H2 / BS 6297 percolation test; H3 / BRE Digest 365 infiltration test): lead, moderate

- **A. Audience:**
  - Small groundworkers and drainage installers: septic tank replacements and new treatment plants with a drainage field, and soakaways for extensions and new houses. (*Inference:* England's General Binding Rules for small sewage discharges, from 2020, push septic tank replacements; not checked in this thread.)
  - Self-builders and homeowners whose building control officer asks for a test: the DIYnot orangery case, 34 m2 of roof, where building control "insisted" on BRE 365 (Read 2, *source claim*).
  - Small site-investigation and drainage consultancies doing BRE 365 tests for planning (Hastings expects a "suitably qualified engineer/ consultant", Read 3, *verified*). Building control surveyors read the results.
- **B. The job:**
  - Before: the holes are dug (H2: 300 mm square, 300 mm below the invert; BRE 365: a 0.3-1 m x 1-3 m pit at the soakaway's depth), water is on site, and the H2 hole was soaked the night before. They fill, wait and dip, again and again: H2 at least three runs in each of at least two holes; BRE 365 three fills in quick succession per pit, reading the level at intervals (Reads 3-5, *verified*).
  - It takes hours. At Vp 100 a single 150 mm fall takes 15,000 s, about 4 h 10 min; at Vp 12 it takes 30 min (*inference*, arithmetic).
  - After: a record for building control or planning: the readings, Vp (average) or f (the lowest of three); pass or fail against the rule (ADH: average Vp 12 to 100); the drainage field area At = p x Vp x 0.25 (0.2 for treatment plant effluent per councils) and trench length (300-900 mm wide trenches, 2 m apart); for a soakaway, the level-against-time graph and the half-emptying time (Hastings' list).
- **C. Why it matters:**
  - Rule-made and checked: ADH paras 1.34-1.38, 1.44 and 3.27-3.30 (*verified*); council forms and validation lists (Dover, Copeland, Eden, Stratford, Kingston, Hastings).
  - Error-prone. Forum posts: minutes divided by 150 as if they were seconds; Vp from the foul test turned into a soakaway f with disputed conversions (Search 8, *source claim*). UNDA says the two tests are "not interchangeable" (Read 1, *verified*), and that sending the wrong one is a common reason applications come back (vendor claim).
  - The decision is consequential: whether a drainage field is possible at all, and how big it or the soakaway must be.
  - Long sessions on rural sites, often with no signal (*inference*).
- **D. Current alternatives:**
  - council paper forms with the arithmetic laid out;
  - UNDA's free browser calculators: BRE 365 infiltration rate from the two crossing times (up to 3 tests, lowest f, PDF report, nothing stored), and Drainage Field Size from a Vp (Reads 1 and 6, *verified*);
  - civils.ai soakaway sizing from a given f; an Excelcalcs BRE 365 sheet; unattributed spreadsheets;
  - consultants' "modern BRE 365 calculation software" and their own sheets (Search 9, *source claim*; the products aren't named);
  - a watch and a notebook; hiring a consultancy.
- **E. Strongest incumbent:** UNDA's free suite (BRE 365 Infiltration Rate Calculator plus Drainage Field Size), in the browser with no sign-up and a PDF, alongside the council's own form. Named, not weakened: it does the final arithmetic well.
- **F. Labs wedge (what none of the above does, as far as found):**
  - the field part, offline, on a phone, several holes at once: a reading's clock time is captured when the depth is typed;
  - each test's own procedure (the H2 pre-soak, the 300 mm fill and the 225 mm and 75 mm marks; BRE 365's effective depth and three quick fills);
  - the 75% and 25% crossing times found by interpolating between the readings either side; a run that never reached 25% flagged, not silently extrapolated;
  - Vp worked out from the runs themselves (per run, per hole, the average), not just taken in;
  - the two tests kept apart;
  - the record a council lists: the readings table, the level-against-time graph, the calculations, the half-emptying time for a proposed soakaway, the drainage field area and trench length.

  That is several manual steps combined into a better artifact, plus offline use. A "cleaner UI" over UNDA would not be a wedge.
- **G. Technical fit:**
  - Good for the test record: static, nothing external needed, small local state (`useOtherTabs`), offline via the site's service worker, print to PDF.
  - Background timers on phones are unreliable, so design around timestamps taken when a reading is entered, not alarms (*inference*).
  - Out of scope: the full BRE 365 design over 25 m2, which needs location rainfall statistics (the Digest's M5-60 and r maps, or licensed FEH data; ADH 3.27 allows 10 mm in 5 minutes only up to 25 m2). At most the user types the values in.
- **H. Strongest reasons not to build (searched):**
  1. The arithmetic is already free (UNDA), and council forms walk people through it, so the remaining value is interpolation and record-keeping. This is the "nice little utility" risk.
  2. Professionals, whom Hastings expects to do the test, already have software or spreadsheets; DIY users do it once.
  3. The step the DIYnot homeowner was stuck on is the soakaway design, and for roofs over 25 m2 it needs rainfall data a static tool can't supply.
  4. The rules vary: ADH 12-100 against Dover's 140, 0.25 against 0.2, each council's own report list. Wales, Scotland and Northern Ireland differ, and Ireland's EPA code uses other tests (none checked here). So pass/fail statements risk being wrong locally.
  5. No filed record was read: both attempts failed, a redirect and then a 404. So how people actually present results today is unverified.
- **Verdict: lead (moderate), the only survivor of this thread.**
  - For: verified rules, a verified council artifact list, a verified incumbent gap (no field log, no Vp from runs, no graph, no half-emptying time), no app found, and forum error evidence.
  - Against: a strong free incumbent for the arithmetic, and a thin, one-off DIY audience.
  - Open for the main session before any number:
    1. The ADH 3.28 and 3.29 equations (images in the PDF; *inference* from memory: f = 10^-3/(2 Vp));
    2. BRE 365's procedure and half-emptying rule from a primary source (*inference*: half-empty within 24 h);
    3. whether a consultants' calc library (Tekla Tedds and the like) already does the field log;
    4. one or two filed reports (Ribble Valley 23_0549 or 25_0844), to see the artifact people submit today.

### Lead 2. Hydrant flow tests and fire pump tests (NFPA 291, NFPA 25): weak

- A: US fire sprinkler technicians (NICET), water utility crews, fire marshals. B: open hydrants, read static, residual and pitot pressures; the result is the flow available at 20 psi (a supply curve) for sprinkler design, or a hydrant's colour class. C: rule-made, recurring, and the sprinkler design depends on it. D/E: two formulas (Search 6); designers' hydraulic calculation software takes the three numbers and draws the curve; utilities' programmes run in asset/GIS systems (*inference*). No free app surfaced in one search. F: an offline N^1.85 graph and a test sheet are the only wedge. H: the calculation is small, and the valuable versions (programme records, design) are shared or paid. **Not pursued.**

### Lead 3. Legionella control in small premises (HSG274 Part 2): REJECT

A dated log with fixed thresholds, kept five years and shared by whoever does the rounds; paid apps with Bluetooth probes and free templates (Search 1). The same shape as Batch 09's fire door checks.

### Lead 4. Cut and fill from a grid of spot levels: REJECT

Free browser tools already do the grid method with swell factors, truck loads and zone maps, and there's an iPhone app (Search 2).

### Lead 5. Gas tightness test durations and permitted drops (IGEM/UP/1B Ed 4, UP/1A): REJECT

Edition 4 has been mandatory since 1 October 2026, and an app and calculators already handle the new installation-volume method. It's for registered engineers on trade apps, and the standards are paid (Search 3).

### Lead 6. PE water main pressure tests (WIS 4-01-03 "Type 2"): REJECT

Done with a data logger that does the analysis, so a tool would mean parsing logger files. The audience is accredited contractors, the water company decides, and the standard has just been revised (Search 7).

### Dropped at the scan stage (no search spent; *inference*)

- Ventilation commissioning under Approved Document F: threshold lookups per room; flow hoods read l/s directly; electricians' certificate apps.
- Workplace illuminance surveys: weak rule pressure; lighting software.
- Hand-arm vibration and noise exposure: HSE's own free calculators.
- Water tank chlorination dosing: free dosing calculators, done by contractors.
- F-gas leak-check intervals: free calculators.
- LEV thorough examination (COSHH): competent examiners' report templates.
- Drain air and water tests: pass/fail thresholds only.
- Radiator balancing: manufacturer apps, and the heat pump area is settled.
- Sprayer calibration: free manufacturer apps.
- Slurry storage: AHDB's free tools.
- Not checked, but the same shape as Lead 1: Ireland's EPA Code of Practice (2021) site characterisation T-test and P-test for one-off rural houses.

