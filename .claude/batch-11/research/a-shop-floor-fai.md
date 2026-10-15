# Thread A: ballooning a customer drawing and producing a first article inspection (FAI) report

**Purpose (one, bounded):** gather the evidence for a Stage B opportunity check of one lead: a free browser page that opens a customer drawing (PDF) locally, places numbered balloons on every characteristic, builds the characteristic table (requirement, tolerance, zone, results, pass/fail) as the inspector goes, and exports a ballooned PDF plus an AS9102 Form 3 style table, with the drawing never leaving the computer. Audience: small machine shops and fabricators (aerospace AS9102, automotive PPAP dimensional results, medical device FAI).

**Budget:** at most 10 web searches and 8 page reads (WebFetch). Counted below as S1..S10 and R1..R8.

**Labels:** *verified* (read on an official or primary page; a vendor's own page is primary for what the vendor says about its product), *source claim* (a page or a search snippet says so), *inference* (this thread's judgment). Short quotes only (under 15 words).

**Records check (before research):** `kw.py` for balloon, first article, AS9102, PPAP, machine shop, machinist, GD&T, dimensional, CMM, fabricat, Werk24, InspectionXpert, Net-Inspect, ITAR, Bluebeam, annotat, stamp: nothing settled on FAI or ballooning. Nearest settled analogues: Batch 08 "A numbered key for a group photo: REJECT" (free no-sign-up annotators already number markers; Annotely, *source claim*); Batch 09 `research/a-trades-offices.md` (drawing issue registers kept in Excel by hand). Neither covers this job.

## Summary (filled in at the end)

(pending)

## Running notes

### S1 (search 1 of 10): AS9102 Rev C Form 3 fields

Query: `AS9102 Rev C Form 3 characteristic accountability fields "char no" "reference location" "characteristic designator" requirement results`

- Form 3 field order in a blank template on iaqg.org (the IAQG's own site, so close to primary for the layout): 5 Char. No., 6 Reference Location, 7 Characteristic Designator, 8 Requirement, 9 Results, then Designed/Qualified Tooling, Nonconformance Number, Additional Data/Comments (*source claim*, search snippet of https://iaqg.org/wp-content/uploads/2020/02/9102_form_3.doc; the template says it is derived from SAE 9102, copyright SAE). The .doc wasn't opened (a download).
- A real completed partial AS9102 package (Brookhaven indico attachment, EPIC detector tower) uses the same labels, with "COMPLY" entries in Results (*source claim*, https://indico.bnl.gov/event/23118/contributions/90620/attachments/54410/93118/PARTIAL_AS9102_EPIC8MTOWER1.pdf). Evidence that FAIs reach non-aerospace buyers too.
- Vendor guidance (GroundControl, https://gndctl.com/insights-library/how-to-fill-out-as9102-forms; Ideagen, https://www.ideagen.com/resources/whitepapers/as9102-tempalte-and-guide): balloon numbers become characteristic numbers, one row each; Reference Location is the drawing zone or sheet; the designator flags key/critical characteristics; copy nominal and tolerance exactly as drawn; enter measured values, not "OK"; check that the highest characteristic number equals the balloon count (*source claim*, vendor pages via search summary).
- SafetyCulture's public library has an "AS9102 Form 3" checklist template (*source claim*, https://public-library.safetyculture.io/products/first-article-inspection-as9102-form-3): a generic free-template route exists (account app).
- *Inference:* the reconciliation rule (max char no. = balloon count; every balloon has a row) is exactly the kind of invariant a local tool can enforce mechanically.

### S2 (search 2 of 10): practitioners' manual method

Query: `first article inspection ballooning drawings small shop Excel Acrobat stamps how long practicalmachinist OR elsmar OR eng-tips`

- Elsmar Cove, "Would this be acceptable to ISO/AS auditors?" (https://elsmar.com/elsmarqualityforum/threads/would-this-be-acceptable-to-iso-as-auditors.47312/): a poster marks the drawing by hand with a hexagon template, numbers each hexagon freehand, works clockwise round each view, and fills the inspection form to match (*source claim*, search summary). A reply: under AS9102 the characteristic numbers must match the ballooned drawing; AS9100 doesn't dictate how first-piece approvals are documented (*source claim*).
- Elsmar Cove, "The Layout of Dimensional Results and What to Provide the Customer" (https://elsmar.com/elsmarqualityforum/threads/the-layout-of-dimensional-results-and-what-to-provide-the-customer.38416/page-2): PPAP dimensional layout thread (not read).
- Vendor time claims only: SolidWorks Inspection says manual Excel plus handwritten notes "can take hours", up to 90% saved; an MMS/AutomaTech webinar promises 70-90% less FAI creation time (*source claim*, vendor marketing). No Practical Machinist or Eng-Tips hit.
- New incumbent lead: Werkflow, "inspection-report network", https://studio.werk24.io/ (to read).
- 1factory has an auto-ballooning page: https://www.1factory.com/drawing-auto-ballooning-first-article.html (to price).

### S3 (search 3 of 10): free or open-source ballooning tools

Query: `free ballooning software for engineering drawings first article inspection open source OR github OR "free version" PDF auto number balloons`

- **Balloonist.io** (supplier listing, https://www.additivemanufacturing.media/suppliers/balloonist-io): a browser-based app; exports the ballooned drawing as PDF and the feature table as CSV or AS9102 format; drawings "stay in the browser" (*source claim*, search summary of a trade-directory listing). Free tier not stated. **This is the closest thing to the Labs idea found so far and must be read on its own site (R1).**
- **BalloonPlot** (https://www.stork.ai/ru/balloonplot): another named ballooning product, details unknown (*source claim*, a listing title only).
- Ideagen Quality Control (InspectionXpert), https://inspectionxpert.com/: 14-day free trial, no card (*source claim*, search summary); "Balloon, collect and report in one workflow" (OnDemand page title).
- DISCUS Desktop balloons PDF or TIFF drawings, with OCR (*source claim*, https://www.todaysmedicaldevelopments.com/product/software-engineering-drawings-ocr-discus; https://discussoftware.com/?p=3530). TIFF support implies scanned drawings are common enough to support (*inference*).
- High QA "Auto-Ballooning 2D" with OCR filling the Bill of Characteristics (*source claim*, https://www.highqa.com/?p=19902).
- SolidWorks Inspection autoballoons PDF files (2023 What's New, https://help.solidworks.com/2023/English/WhatsNew/c_wn2023_inspection_autoballoons_pdf_files.htm); needs a SolidWorks Inspection licence (*source claim*).
- 1factory: proprietary OCR auto-ballooning of PDF drawings, dimensions, tolerances and GD&T extracted (*source claim*).
- Zeiss quality forum, "program for bubbling/ballooning drawing" (https://qualityforum.zeiss.com/topic/14636-program-for-bubblingbalooning-drawing/): a user building their own "click, click and click" program (*source claim*); evidence that people hand-roll this.
- No GitHub or open-source project surfaced in this search (*source claim*, absence in results; not proof of absence).

### R1 (read 1 of 8): https://balloonist.io/ (the vendor's own page)

- **Paid, browser-based, local.** "Starts at $30/user/month"; annual $360/year per user, monthly $39/user; Team pricing custom; "All plans include a free 7 day trial", no card for the trial (*verified*, vendor page, read 2026-10-15).
- Local claim: "Your drawings remain in your browser and are never uploaded" (*verified*, vendor's claim); the app is "Hosted on AWS GovCloud (US)" (*verified*); no ITAR claim on the page.
- Features on the page: draw a selection box to balloon callouts, auto-ballooning of several callouts at once, detects "common GD&T symbols", editable tolerance type, a feature table, AS9102 **Form 3 (Rev C)** export, Excel/CSV export, custom templates, PDF rotation, inch/mm conversion (*verified*). Not stated: measured-result entry, pass/fail, Forms 1 and 2, ballooned-PDF export (the trade listing in S3 says it exports one, *source claim*), multi-sheet, zones, offline, phones.
- Account: not stated; the trial runs at app.balloonist.io, so an account is very likely (*inference*). Vendor not named; testimonials from Leeper MFG and Glass Scale Metrology.
- **Consequence for the wedge** (*inference*): "the drawing never leaves the computer" is not unique; a paid browser tool already sells exactly that. What it doesn't offer is free, accountless use (its cheapest is $360 a year per user).

### R2 (read 2 of 8): https://studio.werk24.io/ (Werk24's Werkflow Studio, the vendor's own page)

- **Free, and it does the whole job, in the cloud.** Studio is free to start, and "Paid Studio subscriptions are not currently offered"; no numeric limits beyond "Upload abuse limits apply" (*verified*, vendor page, read 2026-10-15).
- Account: "Your first report needs no account"; after that, sign-up; OEMs need a workspace account (*verified*).
- Features (*verified*, vendor's claims): automatic ballooning ("Studio balloons it"), "Click to stamp every characteristic" for misses, an "Editable characteristic table with confidence per item", measured results keyed in with pass/fail computed as you type, Form 3 shown (Forms 1 and 2 not mentioned), PPAP and Excel and PDF export, "Send a certified report to any customer" who verifies without logging in.
- Network: OEMs request reports from their supplier base; a supplier can also use it alone, uploading its own drawings (*verified*).
- Data: server-side analysis implied by the workflow (*inference*, the page doesn't say "upload" in so many words); "EU residency, US on request"; "zero retention optional"; "Encrypted in transit and at rest"; nothing on ITAR/EAR, CUI, or AI training (*verified*, by absence on this page).
- **Consequence** (*inference*): for an unrestricted commercial drawing, a free, no-account-for-the-first-report, AI-ballooning tool already exists and is far ahead of anything a static page would do (OCR, pass/fail, certified sharing). The Labs wedge narrows to drawings that must not be uploaded (export-controlled, CUI, or customer NDAs forbidding third-party processing) and to shops that won't create an account; Werkflow's free status is also new and may change ("not currently offered").

### S4 (search 4 of 10): incumbents' prices

Query: `InspectionXpert OR "Ideagen Quality Control" OR DISCUS OR "High QA" ballooning software price per year license cost`

- Ideagen Quality Control: no public price; G2 says pricing not provided, contact the vendor (*source claim*, https://www.g2.com/products/q-pulse-product-management-qpm/pricing, search summary). A Capterra reviewer uses it for balloon drawings, inspection records, full FAIRs and PPAPs (*source claim*, https://www.capterra.co.uk/software/210181/Ideagen-Quality-Control).
- No public prices surfaced for DISCUS or High QA (*source claim*, absence in results); quote-based (*inference*).
- *Inference:* the paid tools are quote-based, per-seat, and aimed at shops with a quality department; the price point that matters for the smallest shop is the cheapest published one, Balloonist at $360 per user per year (R1), versus Werkflow at free (R2).

### S5 (search 5 of 10): ITAR, EAR, CUI and cloud tools

Query: `ITAR controlled drawings first article inspection software cloud upload not allowed on-premise ballooning CUI CMMC`

- Vendors market ITAR handling as a feature, which confirms buyers ask about it: Ideagen Quality Control lists ITAR registration, role-based access, encryption in transit and at rest, per-part access to restricted drawings (*source claim*, https://inspectionxpert.com/ via search summary); GroundControl says it supports ITAR and CUI data in GovCloud and publishes "Top 4 ITAR compliant AS9102 FAI software 2026" (*source claim*, https://gndctl.com/resources/top-4-itar-compliant-as9102-first-article-inspection-fai-software-2026); Balloonist is hosted on AWS GovCloud (R1, *verified*).
- GroundControl's own guide argues ITAR compliance is about US data residency, access by nationality, support personnel and export paths, and "the system you operate" is what must comply (*source claim*, vendor guide, search summary).
- DISCUS is the on-premises example in a competitor's comparison (https://gndctl.com/groundcontrol-vs-discus); on-prem was seen as more secure but needs IT (*source claim*).
- Net-Inspect (web-based) advertises export-control jurisdiction and classification banners (*source claim*, https://ukweb.net-inspect.com/solutions/first-article-inspection-software/); hosting location not found.
- Nothing CMMC-specific surfaced. *Inference, from general knowledge, not read here:* CUI in a cloud service needs FedRAMP Moderate or equivalent under DFARS 252.204-7012, and ITAR technical data on servers abroad or open to foreign-person support staff risks an unauthorised export. Werkflow's default EU residency (R2) is therefore exactly the configuration an ITAR shop must avoid; a page that processes the drawing only in the visitor's browser sidesteps the hosting question, though the shop's own computer and policies still have to be compliant.

### S6 (search 6 of 10): customer-mandated platforms (Boeing and Net-Inspect)

Query: `Boeing suppliers required to submit AS9102 first article inspection in Net-Inspect "Net-Inspect" Boeing FAI requirement D6-51991`

- Boeing's supplier site lists AS9100, AS9102 and D6-51991 as the FAI requirements suppliers must meet (*source claim*, https://www.boeingsuppliers.com/become/quality/fai, search summary; read next as R3).
- Boeing clause Q072S (2015): the seller may use the AS9102 forms "or equivalent forms" containing all required information, and furnishes the report as the buyer directs (*source claim*, https://www.boeingsuppliers.com/clauses/docs/Q072S_05042015.pdf, search summary). Q074: Boeing FAI (BFAI) needs notice to Boeing's supplier quality representative before production (*source claim*, https://www.boeingsuppliers.com/clauses/docs/q074_20130211.pdf).
- Net-Inspect says it can e-sign AS9102 Forms 1-3 and submit the FAIR to the customer (*source claim*, https://net-inspect.com/solutions/firstarticleinspection). The search didn't show a Boeing mandate naming Net-Inspect; to check on Boeing's own page.

### R3 (read 3 of 8): https://www.boeingsuppliers.com/become/quality/fai (Boeing's own supplier page)

- "Boeing has adopted AS9102 as its supplier requirement for applicable purchased hardware FAI" (*verified*, read 2026-10-15). Fourteen QMS elements for FAI planning under AS9100, AS9102 and D6-51991 (inspection methods, verifying design characteristics, objective evidence).
- **No platform named:** the page doesn't mention Net-Inspect or any submission system; the Boeing Supplier Portal appears only for AS9102 training (course SQ000058) (*verified*, by absence on this page). Together with clause Q072S's "or equivalent forms" (S6, *source claim*), there's no evidence here that Boeing mandates a platform; individual purchase documents may still direct submission (*inference*).
- Re-inspection: suppliers must evaluate a full or partial FAI when changes "invalidate the original results" (engineering, production process, tooling; citing AS9102 section 4.6), and document the decision and who authorised it (*verified*). No lapse period on this page.
- **Model-based definition:** suppliers must extract design characteristics not fully defined in 2D drawings "when utilizing Model Based Definition engineering" (*verified*). *Inference:* at the top of the supply chain some definitions are 3D models with PMI, not PDFs, and a PDF ballooning page can't serve those.
- Links: FAI Planning Requirements PDF (Rev A) on boeing.com; AS9102 forms and guidance at sae.org/iaqg; AS9115 for software FAI (*verified*, links listed).

### S7 (search 7 of 10): PDF editors and stamps; time and errors

Query: `ballooning drawings Bluebeam OR "PDF-XChange" OR Acrobat numbered stamps first article inspection forum machinist quality "takes" hours`

- Adobe Community, "blue print bubble balloon" (January 2022; https://community.adobe.com/t5/acrobat-discussions/blue-print-bubble-balloon/m-p/12711278/highlight/true): a manufacturing quality technician asks how to bubble a print in Acrobat; a custom stamp wouldn't take the number inside the oval; the answer was a dynamic stamp or a set of custom numbered stamps (*source claim*, search summary). A practitioner's own words that the general PDF tools are a workaround, not a fit (*inference*).
- Net-Inspect's blog: for a complex aerospace part with 250 to 500 dimensions, manual ballooning "routinely" takes 2 to 8 hours before measurement begins (*source claim*, vendor marketing, https://www.net-inspect.com/blog/how-automated-ballooning-accelerates-first-article-inspection/). Another vendor: hundreds of characteristics on one complex drawing, each numbered, captured and reconciled by hand (*source claim*).
- MachinistGuides, "Ballooning/Numbering A Blueprint" (https://www.machinistguides.com/ballooning-numbering-a-blueprint/): balloon numbers match report lines (*source claim*). Bubble 47 is line 47 on Form 3 (*source claim*, a vendor page).
- New vendors seen: bananaz.ai ("redline FAI and autoballooning in seconds"), getleo.ai (AI FAI) (*source claim*, titles): the field is crowded with AI auto-ballooning start-ups (*inference*).
- No Bluebeam or PDF-XChange forum thread surfaced.

### S8 (search 8 of 10): open-source ballooning tools (github.com, sourceforge.net, gitlab.com only)

Query: `github ballooning drawing first article inspection AS9102 open source tool PDF balloon characteristics`

**This search changes the picture: several free, open-source, local ballooning tools exist** (all *source claim*, search summaries of the repositories; the two closest are read next):
- **InPoint-Automation/The-Bubbler** (https://github.com/InPoint-Automation/The-Bubbler): "Balloon a PDF print, classify callouts, and fill inspection sheets. Free, open source, fully offline." Click callouts to place balloons; fills number, nominal, tolerance and fits (ISO 2768, ISO 286); flags out-of-tolerance results; exports a ballooned PDF and an .xlsx inspection sheet. **This is the Labs idea almost feature for feature.**
- **matheusconceicao7/balloon** (https://github.com/matheusconceicao7/balloon): turns a drawing PDF into a numbered inspection sheet; parses callouts (ISO 286 fits, GD&T, threads), solves balloon placement, writes AS9102 Form 3 as XLSX with Results left empty; the PDF is parsed in the browser and never leaves the machine; its own limitations list leader lines ending at the text box and fit values about 1 µm off published tables.
- **PeramSuneel/ballooningdrawing** (https://github.com/PeramSuneel/ballooningdrawing): "A free web-based tool for adding balloon numbers, callouts, and reference markers to engineering drawing PDF files"; no AS9102 forms apparently.
- **tlsmith198/FAI-STUDIO** (https://github.com/tlsmith198/FAI-STUDIO): Python PySide6 desktop app for AS9102 Forms 1-3, PostgreSQL storage, built-in OCR for scanned drawings, auto-ballooning, results workflow, audit trail.
- **Bamstep/industrial-ai-suite** (MIT, FastAPI, Forms 1-3 workbooks, DMIS export, needs a server); **Yogeshwar312205/DimBalooning** (PyMuPDF vector text extraction, FAIR/PPAP Excel, PASS/CHECK/FAIL highlighting); **rakeshnulekar/auto_balloning_system** (OCR auto-placement, no AS9102 output).
- Inside larger systems: **crbnos/carbon** (open-source ERP/MES/QMS) has AS9102 Rev C FAI and certificates of conformance (pull request #1733); **saturnis-io/cassini** (open-source SPC) keeps FAI in its Enterprise tier only. A CoteCote-Software profile also sells automatic ballooning and AS9102 reports.
- **datumstake/what-pdfs-do-to-you**: a defect log from building AS9102 extraction tools (Reference Location needs sheet and zone; merged sheets can silently point to the wrong place). Useful as a risk list if the lead went ahead.
- **pzfreo/draftwright** issue #2164 proposes a ballooned PDF plus characteristics CSV (a feature request).

### R4 (read 4 of 8): https://github.com/InPoint-Automation/The-Bubbler (repository page and README)

- **A desktop app, not a web page:** "Download the binary for your OS from Releases" (Windows, Linux, macOS; PySide6, compiled with Nuitka); no hosted version or demo link (*verified*, read 2026-10-15). The macOS build is "unsigned, right-click then Open"; Linux may need libfuse2.
- GPL-3.0 ("GPLv3+"). Maker: InPoint Automation Sp. z o.o. (a Polish company), inpointautomation.com (*verified*).
- Does: "Click a callout to balloon it", filling number, nominal, tolerance and fits; ISO 2768 and ISO 286 auto-fill; dimensions, threads, GD&T, fits, surface finish, holes; custom-trained region and symbol detectors plus an optional vision-language model; measurements entered in the program (expressions for differential measurements); out-of-tolerance flagging; exports an .xlsx inspection sheet and a ballooned PDF; optional STEP preview (*verified*).
- Not mentioned: AS9102 forms, multiple sheets, zone references, templates (*verified*, by absence).
- Offline: "Works fully offline", except the optional VLM, which downloads a model from Hugging Face (*verified*). Scanned drawings: not stated; PyMuPDF for text and word boxes plus several OCR engines suggests some raster handling (*inference*).
- Maturity: 4 stars, 2 forks, 19 commits, 1 open issue; no release date shown on the page read (*verified*, as displayed). Young and small (*inference*).
- **Consequence** (*inference*): a free, offline, click-to-balloon tool that exports a ballooned PDF and an inspection sheet already exists. Its gaps for this audience are installation (an unsigned desktop binary is a hard sell on a locked-down shop PC), no AS9102 form layout, and no zones or sheets. A Labs page would differ mainly by "no install" and by Form 3 layout, not by kind.

### R5 (read 5 of 8): https://github.com/matheusconceicao7/balloon (repository page and README; a fork of dhwanikher/balloon)

- **Runs locally, built from source:** a Go binary serving a vanilla-JavaScript page on localhost ("./bin/balloon serve", then open localhost:8080); "no npm, no build step and no network access at runtime"; a Windows launcher you build yourself; no hosted URL (*verified*, read 2026-10-15). MIT; vendored pdf.js (Apache-2.0).
- Does: reads callouts from the PDF text layer, numbers them in reading order "consecutively from 1 across all sheets", places balloons with a scoring solver (unplaceable ones tinted amber for review); add a missed one by dragging a rectangle; drag, edit, delete, undo; callout grammar for symbols, tolerances, threads, ISO fits (H, h, js, g, f, e, d computed), GD&T; exports AS9102 Form 3 XLSX with columns Char., Ref., Desig., Requirement, Acceptance Limits, Results (Results blank); "a ballooned PDF of all sheets" (*verified*). Not mentioned: zones (Ref. shows "Sheet 1"), Forms 1 and 2, results entry, pass/fail.
- Privacy: "The PDF never leaves the machine"; stateless server, no database (*verified*).
- **Technical evidence on drawings:** "A drawing with no text layer produces nothing"; "Scanned prints and vector-only exports need OCR, which isn't here" (*verified*). So text-layer prefill fails on both scans and on CAD exports that turn text into outlines; such drawings need manual entry or OCR (*inference*, consistent with DISCUS supporting TIFF in S3).
- Limitations it lists: fit values computed, about 1 µm off tables; leader lines end at the text box centre; a vocabulary allowlist for prose (*verified*). Maturity: 0 stars, 14 commits (*verified*).

