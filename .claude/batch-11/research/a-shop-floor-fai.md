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

