# Thread A: ballooning a customer drawing and producing a first article inspection (FAI) report

**Purpose (one, bounded):** gather the evidence for a Stage B opportunity check of one lead: a free browser page that opens a customer drawing (PDF) locally, places numbered balloons on every characteristic, builds the characteristic table (requirement, tolerance, zone, results, pass/fail) as the inspector goes, and exports a ballooned PDF plus an AS9102 Form 3 style table, with the drawing never leaving the computer. Audience: small machine shops and fabricators (aerospace AS9102, automotive PPAP dimensional results, medical device FAI).

**Budget:** at most 10 web searches and 8 page reads (WebFetch). Counted below as S1..S10 and R1..R8.

**Labels:** *verified* (read on an official or primary page; a vendor's own page is primary for what the vendor says about its product), *source claim* (a page or a search snippet says so), *inference* (this thread's judgment). Short quotes only (under 15 words).

**Records check (before research):** `kw.py` for balloon, first article, AS9102, PPAP, machine shop, machinist, GD&T, dimensional, CMM, fabricat, Werk24, InspectionXpert, Net-Inspect, ITAR, Bluebeam, annotat, stamp: nothing settled on FAI or ballooning. Nearest settled analogues: Batch 08 "A numbered key for a group photo: REJECT" (free no-sign-up annotators already number markers; Annotely, *source claim*); Batch 09 `research/a-trades-offices.md` (drawing issue registers kept in Excel by hand). Neither covers this job.

## Summary

**Status:** finished 2026-10-15. Budget: 10 of 10 searches, 8 of 8 reads (one, GKN's PDF, read from the copy WebFetch saved, through macOS PDFKit). Read-only throughout: nobody contacted, no sign-up, no form, nothing downloaded on purpose.

**Verdict: advance to the full gate, narrowly.** The job clears most of the bar: an identifiable role (the inspector or quality lead at a small AS9100 or automotive job shop); an official process creating the work (AS9102, customers' flow-downs); recurrence and stakes; an important artifact (the FAIR and its ballooned print); a manual alternative (Acrobat stamps plus an Excel or IAQG Form 3 template); and workflow depth (open → balloon → record → decide → export). The searches found no tool that is at once free, needs no install, needs no account, and never uploads the drawing. But the area is crowded: each free tool lacks just one of those, and Werkflow does the whole job better for anyone allowed to upload. **The full gate must settle J first; if check 1 fails, REJECT.**

**Checks the full gate must settle (in order):**
1. Do export-control (ITAR/EAR), CUI or customer NDA terms actually stop a material share of small shops from uploading drawings to a service like Werkflow (customer flow-down wording; ITAR's encryption carve-out conditions; DFARS 252.204-7012's FedRAMP condition for clouds holding CUI)? If uploads are broadly fine, Werkflow wins outright → REJECT.
2. Does a free, hosted, browser-local ballooning page already exist? The gap rests on two searches (S3, S8) in a field where new repositories and AI start-ups keep appearing in 2026.
3. Feasibility spikes: pdf.js's size in the experiment's own chunk; pdf-lib drawing onto owner-password-restricted customer PDFs (pdf-lib can't rewrite encrypted files, so a raster fallback may be needed, *inference*); text-layer prefill on real CAD exports; a zone grid set per sheet; results entry on a phone.
4. PPAP and ISO 13485 specifics, which this thread didn't verify (no source surfaced; the AIAG manual is paid). Read a public OEM supplier manual for the ballooned "marked print" requirement.

**Stage B fields**

- **Actual workflow.** From the PO, its quality clauses and the drawing (or a model-based data set), the inspector numbers every characteristic. That means dimensions, GD&T, and notes too: "All Drawing Notes and characteristics must be addressed", with notes that don't apply marked N/A and allowed in groups (GKN, *verified*). This runs across sheets and views. Form 3 then gets one row per balloon: Char. No.; Reference Location (sheet and zone); Characteristic Designator (key or critical); Requirement copied as drawn; Results as measured values, not "OK"; Designed/Qualified Tooling; Nonconformance Number; Remarks. That's the field order of the IAQG template (*source claim*; vendor guidance, *source claim*). For position, CMM data alone isn't acceptable: the actual positional value must be shown (GKN, *verified*). The inspector measures the first piece or pieces; one customer wants 100% of characteristics bubbled and at least 3 pieces fully inspected (Century Fasteners, *source claim*). Form 1 covers the part and its revisions, full or partial with the reason, and signatures. Form 2 covers materials, special processes and certificates, including original mill certs. The package goes in with "Ballooned Print(s) or Model Snapshots with the noted corresponding Characteristic Numbers", plus CMM reports marked with characteristic numbers (GKN, *verified*). Format: Boeing adopts AS9102 (*verified*), clause Q072S accepts "equivalent forms" (*source claim*), and Boeing's FAI page names no submission platform (*verified*). Net-Inspect e-signs and submits Forms 1–3 for customers who use it (*source claim*). PPAP dimensional results and ISO 13485 FAIs weren't verified here. *Inference, from general knowledge:* PPAP wants results for every design-record characteristic, keyed to a marked print. ISO 13485 prescribes no FAI form, so medical OEMs set one in their supplier agreements, often AS9102-style.
- **Recurrence and stakes.** A full FAI, or a partial one for the affected characteristics, follows a new part, a design change affecting fit, form or function, a change of source, process, inspection method, location, tooling or materials, an NC program change, corrective action, or a "Lapse in production of two years" (GKN, *verified*; Boeing requires re-evaluation when changes "invalidate the original results", *verified*). Customers may vary the lapse: Lockheed Martin Q2A, GD-OTS SQAR (*source claim*). Size: "sometimes 300" characteristics on a sheet, or 250–500 on a complex aerospace part (vendors, *source claim*); simple machined parts likely have far fewer (*inference*). Time to balloon by hand: 2–8 hours, or "four to eight hours per print" (vendors, *source claim*). Stakes: GKN wrote its guide so "first time acceptance can be achieved and schedule delays are reduced" (*verified*). A characteristic with no balloon has no row, so the FAIR is incomplete (*source claim*).
- **Strongest incumbent, free ones included.**
  - **Werk24's Werkflow Studio is free and does the job well**, if the drawing may be uploaded. "Paid Studio subscriptions are not currently offered", and "Your first report needs no account". It has AI ballooning, click-to-stamp for anything missed, an editable table, measured results with pass/fail as you type, Form 3, PPAP, Excel and PDF export, and certified sharing with customers. Processing is server-side (*inference* from the workflow), with "EU residency, US on request" and no ITAR statement (*verified*, vendor page). A static page can't match its automation.
  - **The Bubbler is free and offline** (GPL-3.0, "Works fully offline"). Click a callout to balloon it; nominal, tolerance and ISO 2768/286 fits are filled in; measurements are entered and out-of-tolerance ones flagged; it exports a ballooned PDF and an .xlsx. But it's a desktop binary (unsigned on macOS), it's young (19 commits, 4 stars), and it has no AS9102 layout, zones or sheets (*verified*).
  - **matheusconceicao7/balloon** (MIT) works locally. It auto-balloons from the PDF text layer across sheets, writes Form 3 XLSX, and exports a ballooned PDF. You build it from source (Go), and it has no OCR and no results entry (*verified*).
  - **Balloonist sells the browser-local version**: "Your drawings remain in your browser and are never uploaded", hosted on AWS GovCloud. It has selection-box auto-ballooning, GD&T detection, Form 3 (Rev C), and Excel/CSV export. Price: $30 a user a month billed yearly ($360 a year), $39 monthly, with a 7-day trial (*verified*).
  - Paid, quote-based: Ideagen Quality Control (InspectionXpert; 14-day trial; claims ITAR registration), DISCUS (desktop or on-premises; OCR on PDF or TIFF), High QA, 1factory, Net-Inspect, SolidWorks Inspection, GroundControl (GovCloud), plus AI start-ups (*source claim*; no public prices found).
- **Current manual alternative.** Acrobat custom or dynamic numbered stamps: a quality technician on Adobe Community (2022) couldn't get the number inside the oval with a custom stamp. Others use a hexagon template, numbered freehand and clockwise round each view (Elsmar Cove), or a click-by-click program they built themselves (Zeiss forum). Then the IAQG Form 3 template or a shop spreadsheet, every requirement typed again, and a check that the highest number equals the balloon count (all *source claim*).
- **The Labs wedge.** The only option found that is at once free, install-free, account-free and upload-free, and it can be shown to be local (it works with the network off after one visit). It would: place numbered balloons by clicking, across sheets; take zones from a grid the user sets; copy the requirement from the text layer where there is one; build Form 3 as the inspector goes, with results as values and pass/fail; check that every balloon has a row, nothing is skipped, and every note is accounted for; and export a ballooned PDF and a Form 3 table. It matters for export-controlled, CUI or NDA drawings on locked-down shop PCs (*inference*). It's weak where uploading is acceptable (Werkflow) or the shop will pay $360 a year (Balloonist).
- **Technical feasibility.** Feasible, but larger than most Labs experiments. pdf.js (Apache-2.0) renders the drawing and exposes the text layer; it would be the site's first large runtime dependency. pdf-lib (MIT) could draw the balloons onto the original pages as vector shapes, with a raster fallback (*inference*). For XLSX, a small zip writer, or CSV plus a printable Form 3. **The drawings:** CAD exports are mostly vector (Bluebeam support, *source claim*), but "A drawing with no text layer produces nothing": scans and text turned to outlines need OCR (balloon README, *verified*). So prefill must fall back to typed entry, and placing balloons works on any page. Vendors still sell OCR for TIFFs and old scanned prints; no source gave the share of scans. Model-based definitions (Boeing, GKN mention them, *verified*) are out of scope. Ballooning a large sheet is desktop work; entering results on a tablet or phone is plausible (*inference*). The PDF would sit in IndexedDB under a `labs:<slug>` name.
- **The strongest reason not to build.** Free tools already exist on both sides. Werkflow gives the whole job away with AI ballooning and live pass/fail, in the cloud. Free offline tools (The Bubbler, balloon) already do click-to-balloon with callout parsing and export a ballooned PDF and a spreadsheet. The browser-local version sells for $360 a user a year (Balloonist), a trivial sum for a business. A Labs page would be a manual, less capable relative of these, set apart only by needing no install and no account. The field moves fast, and the top of the supply chain is moving to model-based definition.

**Side leads (Stage A only):** weld maps for fabricators, the same engine for a different audience, not in the records, worth one search for a free incumbent; mapping CMM reports onto Form 3 numbers, weak (proprietary formats, already imported by the paid platforms). Details at the end of the notes.

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
- **InPoint-Automation/The-Bubbler** (https://github.com/InPoint-Automation/The-Bubbler): its tagline: balloon a PDF print, classify callouts, fill inspection sheets; "Free, open source, fully offline." Click callouts to place balloons; fills number, nominal, tolerance and fits (ISO 2768, ISO 286); flags out-of-tolerance results; exports a ballooned PDF and an .xlsx inspection sheet. **This is the Labs idea almost feature for feature.**
- **matheusconceicao7/balloon** (https://github.com/matheusconceicao7/balloon): turns a drawing PDF into a numbered inspection sheet; parses callouts (ISO 286 fits, GD&T, threads), solves balloon placement, writes AS9102 Form 3 as XLSX with Results left empty; the PDF is parsed in the browser and never leaves the machine; its own limitations list leader lines ending at the text box and fit values about 1 µm off published tables.
- **PeramSuneel/ballooningdrawing** (https://github.com/PeramSuneel/ballooningdrawing): "A free web-based tool for adding balloon numbers" (its tagline, shortened); no AS9102 forms apparently.
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

### R6 (read 6 of 8): https://github.com/PeramSuneel/ballooningdrawing

- Two commits, a single index.html, no licence, no hosted URL, no README detail beyond "A free web-based tool for adding balloon numbers, callouts" (*verified*, read 2026-10-15). Not a usable incumbent; evidence only that people keep starting this tool (*inference*).

### S9 (search 9 of 10): when an FAI is required; "every characteristic"

Query: `AS9102 when is FAI required "two years" lapse in production partial FAI design change manufacturing location; PPAP ballooned drawing dimensional results every characteristic`

- AS9102's re-FAI triggers as quoted in customers' procedures (Sonaca FAI STD-001, https://www.sonaca.com/wp-content/uploads/2024/08/FAI_STD-001.pdf): a full FAI, or a partial FAI of the affected characteristics, after a design change affecting fit, form or function; a change of manufacturing source, process, inspection method, location, tooling or materials that can potentially affect them; a change of NC program or its translation to another medium; a natural or man-made event affecting the process; corrective action needed to complete a previous FAI (*source claim*, search summary of a customer document quoting the standard).
- **Lapse:** two years from the last production operation to the restart, for characteristics the inactivity may affect (*source claim*); customers vary it: General Dynamics OTS SQAR "2 years (Unless Specified In PO)" (https://www.gd-ots.com/wp-content/uploads/2023/09/SQAR-18-Anniston.pdf), Lockheed Martin clause Q2A "two years or as specified by the Customer" (https://www.lockheedmartin.com/content/dam/lockheed-martin/aero/documents/scm/Quality-Requirements/Clauses/q2a_rev11.pdf) (*source claim*, search summaries). GD-OTS also lists a change in location as a standalone trigger.
- **Every characteristic:** Moog's FAIR guidance says every design characteristic is verified and its result recorded (https://www.moog.com/content/dam/moog/literature/Corporate/Suppliers/sdg/FAIR_Information.pdf); a Century Fasteners clause requires a bubbled drawing with 100% of characteristics bubbled and at least 3 pieces fully inspected on all dimensions and notes (https://www.centuryfasteners.com/wp-content/uploads/2023/12/Aerospace-First-Article-Inspection-Requirement-AS9102-Rev_1.pdf); for a partial FAI, Moog wants the previous part number and revision and the reason (*source claim*, search summaries).
- More customer flow-downs found (not read): Sensata/Kavlico AF229 supplier FAIR standard; GD-OTS QCSD-012; GKN Aerospace "AS9102 first article inspection report common mistakes" (https://www.gknaerospace.com/media/mpibej0a/as9102-first-article-inspection-report-common-mistakes.pdf, read next as R7).
- PPAP-specific material didn't surface in this search.

### R7 (read 7 of 8): GKN Aerospace, "AS9102 First Article Inspection Report (FAIR) Common Mistakes", Revision A 03/21/2022

URL: https://www.gknaerospace.com/media/mpibej0a/as9102-first-article-inspection-report-common-mistakes.pdf (2 pages). WebFetch couldn't parse the PDF; it saved the fetched copy in the session's tool-results folder, and the text was read from a scratchpad copy with macOS PDFKit (no second fetch, nothing saved in the repo). *Verified* (a prime's own supplier guidance):
- Written "so that first time acceptance can be achieved and schedule delays are reduced": rejected FAIRs are a recurring problem with schedule cost (stakes).
- **Form 3:** "All Drawing Notes and characteristics must be addressed on the FAIR"; notes that don't apply are marked N/A in Remarks, and may be grouped ("notes 5-9 N/A"). For positional tolerances, CMM data alone isn't acceptable; the actual positional value must be shown. Column 10 takes the designed tool's ID or the type of qualified tooling.
- **Support data for Form 3:** "Ballooned Print(s) or Model Snapshots with the noted corresponding Characteristic Numbers from Form 3", plus CMM or laser-tracker reports marked with characteristic numbers. So the ballooned drawing travels with the FAIR, and balloon numbers must match Form 3 rows.
- **Form 1:** part and drawing revision; for model-based parts "the full DPD data set number" (MBD number and parts list); full or partial, with a detailed reason for a partial; lower-level part numbers for assemblies; complete or not complete; signature. **Form 2:** approved special-process and material sources, traceable certificate numbers, original mill certifications, process, heat-treatment and NDT certifications with specification revisions, consumables.
- **Re-FAI triggers:** design changes affecting fit, form or function; change of manufacturing source, process, inspection method, location, tooling or materials; change of NC program; corrective action to complete an earlier FAI; "Lapse in production of two years as defined in AS9102".
- *Inference:* Forms 1 and 2 are mostly typed records of certificates and sources that a shop's existing Excel template already holds; the part that needs the drawing is Form 3 plus the ballooned print. "Model Snapshots" again shows that some customers define parts by 3D model, not a PDF drawing.

### S10 (search 10 of 10, the last): are customer drawings vector PDFs or scans?

Query: `ballooning scanned customer drawings no text layer raster PDF TIFF versus vector CAD PDF OCR first article inspection "scanned drawings"`

- Bluebeam's support article: "Most PDFs created from CAD" are vector; a scan is a bitmap with no lines or text a computer can recognise; mixed files are common (logos, vicinity maps), and scans may carry an OCR text layer (*source claim*, https://support.bluebeam.com/articles/raster-vector-and-text-whats-really-in-my-pdf/, search summary).
- Ballooning vendors sell OCR for scans and "older drawings" (SolidWorks Inspection; DISCUS reads PDF or TIFF) (*source claim*, https://www.solidsolutions.co.uk/solidworks-inspection/, https://www.todaysmedicaldevelopments.com/product/software-engineering-drawings-ocr-discus). GroundControl's buyer's guide says OCR tools handle clean digital PDFs well and degrade on poor scans (*source claim*, https://gndctl.com/resources/automated-ballooning-software-fai-buyers-guide-2026).
- No source gave the share of customer drawings that are scans. *Inference:* current work from CAD-using customers arrives mostly as vector PDFs (often with a text layer, sometimes with text turned to outlines, which R5 says defeats text extraction); legacy and military parts often come as scans or TIFFs. A page that relies on the text layer for prefill must fall back to typed entry; placing balloons and building the table work on any page image.

### R8 (read 8 of 8, the last): https://gndctl.com/resources/automated-ballooning-software-fai-buyers-guide-2026 (GroundControl, a vendor's buyer's guide, published 14 August 2026)

- Names GroundControl, Ideagen Quality Control (InspectionXpert), 1Factory, Net-Inspect, DISCUS and High QA; **no prices, tiers or deployment types for any of them**, no free tool named; the call to action is a demo (*verified* that the page says this; the claims themselves are *source claim*, vendor marketing).
- Manual ballooning takes a quality engineer "four to eight hours per print"; a sheet can carry "sometimes 300" characteristics; reported automation savings "cluster in the 50–70% range" (*source claim*).
- OCR and pattern tools work "well on clean, digitally-generated prints" and degrade "on low-DPI scans"; CAD-linked extraction "does not work with just PDFs or scanned drawings"; automated ballooning "fails silently" (*source claim*). *Inference:* a missed auto-balloon is a missing Form 3 row, so even AI users need a page-by-page completeness check, which a manual tool forces by design.
- Export-control posture is "a hard filter for defense work"; buyers should ask where data sits and what support staff can see (*source claim*).
- Prices for DISCUS, High QA, 1factory, Net-Inspect and InspectionXpert stay unfound in this thread (quote-based, *inference*).

### Side leads met on the way (Stage A only, no budget spent)

- **Weld maps for fabricators** (number every weld on a drawing; record the WPS, welder, and visual or NDT result per weld, for AWS D1.1, ASME IX or EN 1090 traceability). The same engine as ballooning (numbered markers on a PDF plus a table, exported together) for a different audience. Not in the records (`kw.py "weld"`: no match). Incumbents not checked (*inference*: paid weld-management apps and Excel plus marked-up PDFs). Stage A: worth one search for a free incumbent before going further.
- **Mapping a CMM report onto Form 3 numbers** (GKN wants CMM reports marked with characteristic numbers, R7). *Inference:* proprietary report formats (PC-DMIS, Calypso) and the paid FAI platforms already import them. Stage A: weak.

