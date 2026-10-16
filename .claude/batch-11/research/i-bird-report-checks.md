# Thread I: deciding checks for the county bird report tables lead (discovery round 2)

**Purpose (one, bounded):** run the deciding checks on one lead, thread G's L5 (`g-tool-chains.md`, Summary item 1 and Stage B): a county bird report's per-species tables, built from the year's merged record exports. About a hundred volunteer county bird recorders in Britain and Ireland, with their report editors, merge BirdTrack, eBird, iRecord, and spreadsheet records each year, then build per-species tables (records, sites, first and last dates, monthly and site maxima, peak counts with place and date). The wedge a static, local, free page could offer: read this year's exports in their own shapes; match species names and sites; convert latitude and longitude to grid references locally; flag duplicates across routes; hold back unaccepted rarities and sensitive sites; produce the tables and a clean merged CSV, with nothing uploaded. This thread doesn't build and doesn't decide; the main session does.

**The checks, in priority order:**
1. **Incumbents for the tables.** Do MapMate, Recorder 6, Indicia/iRecord, or BTO's BirdTrack already give county recorders per-species summary reports (first and last dates, monthly maxima, peak counts by site)? What do recorders actually use? A built-in report most counties already use is a REJECT.
2. **The export shapes.** BirdTrack's, eBird's, and iRecord's download columns (species name, date, count including "X", location as grid reference or latitude and longitude, breeding codes, sensitive-record flags). Is the merge realistic without per-county configuration?
3. **First-hand evidence of the time taken or the pain.** Count reports' introductions, recorders' blogs, newsletters; re-find thread G's Norfolk figure of 1.3 million records.
4. **Terms.** BirdTrack's data terms for county recorders; the licence of any species-name list a page would ship (BOU British List, IOC, eBird/Clements). Can a static page include a species list?

**Settled already (not re-researched):** Batch 09 rejected "wildlife records into iRecord and county recorders' formats" (iRecord's importer and BRC's Record Cleaner online, free; `../../batch-09/research/q-wildlife-records.md`, closed 2026-10-14).

**Budget:** at most 6 web searches and 6 page reads (WebFetch, or the web-fetch agent), counted below as S1..S6 and R1..R6. Read-only: no sign-ups, log-ins, posts, forms, or deliberate downloads of files.

**Labels:** *verified* (read on an official or primary page; a vendor's own page is primary for what it says of its product), *source claim* (a page or search snippet says so), *inference* (this thread's judgement). Quotes under 15 words. Findings are advisory.

## Verdict (filled in at the end)

**Budget used:** 6 of 6 searches (all extended) and 6 of 6 reads, written up one by one below. No read failed outright. The fetch tool couldn't summarise R2's PDF, so its own saved copy was read locally with pypdf. R4 found nothing on its question (Norfolk's figure).

### Check 1, incumbents for the tables: PASSED (nothing found that already makes them; evidence of absence)
- **BirdTrack** (*verified*, R1): the recorder's tools are for verification:
  - a "Species summary" of the records that need checking or have been queried;
  - an observer summary;
  - list and map views;
  - a "club records download".

  None gives first or last dates, monthly maxima, or peaks by site. BTO's per-county derived metrics are still in development, and they're effort and reporting-rate products, not report tables (thread G, R4, *verified* there).
- **MapMate** (*source claim*, S2): retired on 30 November 2024. It's no longer sold, its sync server is off, and support was promised only to the end of 2025. No ready report for these tables is documented, though recorders can write their own queries in it. The vendor's page itself wasn't read.
- **Recorder 6:** not checked within the budget (unknown).
- **iRecord** (*verified*, R3): downloads in two fixed formats. No report tables turned up, though none were searched for directly. For birds, BirdTrack is the main route.
- **What recorders actually use:**
  - Northants: Excel templates and an Excel master file (*verified*, R5).
  - Elsewhere (thread G, *source claim*): a bespoke Access database (Gloucestershire), Berkshire's own Excel program, MapMate (Greater Manchester), and an unnamed county database (Shropshire).
  - No count of which software recorders use exists in what was read. R2 reports one question from a poll of 28 recorders and editors, and it isn't about software.
- **Caveats:**
  - Features behind BirdTrack's login beyond the verification guide weren't seen.
  - A recorder's own MapMate or Access queries are that county's incumbent.

### Check 2, the export shapes: PARTLY PASSED
A page could recognise each source's files from their headings, but the merge itself needs each county's own lists. BirdTrack's download for recorders, the biggest source, has no public column list.
- **iRecord** (*verified*, R3): two fixed sets of headings.
  - Standard: the scientific name and taxon version key, latitude and longitude as well as grid references, and date ranges with a date type.
  - Simple: a "present" count arrives as Quantity 0, with the text in NonNumericQuantity.
  - Neither has a breeding-evidence or sensitive-record column.
- **BirdTrack** (*source claim*, S3):
  - An observer's export is an .xlsx with a species summary sheet and record sheets, and the exporter chooses which fields go in.
  - BTO's upload guides use these headings: Species, Date, Place, Grid Reference or Latitude and Longitude, breeding evidence, count type, remarkable, and sensitive ("Y" or "1").
  - The recorder's "club records download" (R1) has no public column list. So Labs would write the parser for the biggest source without seeing a real file, because getting one would need an account (*inference*).
- **eBird:** not read (budget). From memory, unverified (*inference*):
  - an observer's own download is a fixed CSV: common and scientific names, a count with "X" for present, location name, latitude and longitude, date, breeding code;
  - county-wide data comes from the eBird Basic Dataset, on request, under terms that forbid passing it on (S6, *source claim*).
- **Per-county setup that no export format removes:**
  - a site list, to turn coordinates into the report's "recognisable" sites (R5's manual step);
  - the county's description species;
  - its sensitive species and sites (the RBBP rates each species by season and the coarsest map resolution allowed, R2; counties add their own);
  - each club's own spreadsheet template (Northants's, R5).

  Thread G's wedge already assumed these as lists the recorder keeps, remembered per county. That makes them a one-time setup rather than a blocker, but the page can only be as good as the recorder's lists (*inference*).

### Check 3, first-hand evidence of the time and pain: PASSED (one current county verified, plus the BTO)
- **Northants** (*verified*, R5):
  - more than 95,000 records from 580 observers in 2020;
  - "the next couple of months" spent collating (2022);
  - "falling behind" in early 2025 as the workload grew, so a second volunteer took over the BirdTrack and eBird records;
  - 2024 and 2025 combined into one report, aimed for before the end of 2026;
  - app records without a recognisable site name mean looking up each grid reference by hand, which he calls very time-consuming.
- **BTO** (*verified*, R2, a 2011 draft): the volume of records presents "significant challenges", and some recorders "still struggle to find the additional time required".
- **Supporting** (*source claim*): a recorder on BirdForum calls the role very time-consuming since online recording began (S5). Berkshire's reports came out three to four years late (thread G).
- **Not re-found:** Norfolk's "1.3 million records in 2024" (S4, R4). Don't use it.
- **Limits:**
  - Only one county's account is verified.
  - The pain it describes is in merging and cleaning (sites, names, sheer volume), not in building tables.
  - No hours are measured.

### Check 4, terms: PASSED for the species list; UNKNOWN for BirdTrack's terms (none found)
- **Species lists:**
  - The British List follows AviList from the BOURC's 58th Report, January 2026 (*verified*, R6).
  - AviList v2025b is CC BY 4.0 (*source claim*, S6). The main session should read the licence line on avilist.org before anything ships.
  - IOC 15.2 is CC BY 3.0, and it's the IOC's last update (*source claim*, S6).
  - The BOU's own files carry no licence (*verified*, R6), so a page shouldn't redistribute them. A recorder can load their own copy.
- **What a page could ship** (*inference*): AviList's scientific names and order, with attribution.
  - The gap is British vernacular names ("Robin") against AviList's international names. Matching on the scientific name avoids it wherever the export has one: iRecord's Standard format does (R3), eBird's does from memory, and BirdTrack's export is unconfirmed (S3).
- **BirdTrack and eBird data terms:**
  - BirdTrack records reach the recorder only with the observer's permission (S6, *source claim*).
  - No published limit on what a recorder may do with the download was found (S6). R1's guide has no data-use terms (*verified*).
  - eBird's data terms forbid passing the data on (S6, *source claim*).
  - A page that never receives the data stays inside both (*inference*).

### Does the lead survive to the full gate? Yes, narrowly, re-scoped (advisory)
No check failed, but the evidence moves the job.
- **What the evidence shows:** the pain verified first hand is in merging the app records into the county's master file: precise coordinates turned into recognisable sites, names sorted out, sensitive records protected, all at a growing volume. The tables are a by-product of the merged set.
- **The re-scoped lead:** this year's app and spreadsheet exports into the county's master file, matched to sites and screened, with the report's per-species tables as an output.
- **Batch 09's REJECT:** that lead was observers submitting records in their recipients' formats; this one is the recorder's receiving side. Whether that's distinct enough is the main session's call.

**The strongest reason not to build:** the audience is about a hundred volunteers, each with their own master file and conventions.
- The useful work depends on each county's own lists and judgement: matching sites, deciding which duplicates are the same birds, handling rarities and sensitive records. So the page is only as good as a setup each recorder must do.
- BirdTrack's recorder download, the biggest source, has no public format, so the main parser would be built blind.
- Once the records are merged, the tables are pivot tables in the master file the recorder already keeps.
- BTO may extend its own per-county outputs.

**What's left of the wedge** (*inference*): one local page, nothing uploaded, that:
1. recognises iRecord's two formats, eBird's download, and BirdTrack's exports by their headings, with each club template mapped once;
2. converts latitude and longitude to OS and Irish grid references, and matches each record to the nearest site on the recorder's own site list, or flags it. This is the step the Northants recorder does by hand.
3. matches names by scientific name against AviList, flagging aggregates and names it can't match;
4. flags likely duplicates across routes for the recorder to decide;
5. holds back description species until accepted, and leaves out sensitive species and sites, using the recorder's lists;
6. writes the merged rows in the master file's layout, plus the per-species tables: records, sites, first and last dates, monthly maxima, and peaks with place and date.

**For the main session to re-check before the gate:**
- AviList's licence line on avilist.org;
- eBird's download columns, from eBird's own help;
- whether any public guide shows the columns of BirdTrack's county download;
- Recorder 6's reports (not checked here);
- MapMate's status on the vendor's own page (seen only through a search summary).

## Records check (kw.py, no budget)

Run 2026-10-16 from /Volumes/Projects/labs: `W=80 python3 -I .claude/qa/kw.py "Record Cleaner" "county recorder" BirdTrack MapMate "Recorder 6"`.
- **Record Cleaner, county recorder:** Batch 09's thread (`q-wildlife-records.md`) and its REJECT: iRecord's importer maps any headings and reports failed rows; BRC's Record Cleaner online (free, *verified* there, 24 September 2025) checks dates, grid references and names against the UKSI, reports but doesn't convert, and files go to its server. That thread was about *submitting* records in recipients' formats, not compiling a report from what recorders receive.
- **BirdTrack:** only thread G (S6-S8, R4-R8) and Batch 11 `CANDIDATES.md`; Batch 09 noted odd grid references in records arriving from BirdTrack in iRecord. (Thread F's and H's "Birdtrack" hits are unrelated: a press and a pedigree site.)
- **MapMate:** Batch 09 has the *source claim*, unverified, that MapMate "closed for business in December 2024"; thread G calls it common and paid, from a Greater Manchester guide.
- **Recorder 6:** Batch 09 (a Sussex user on Recorder 6's dictionary against iRecord's names); thread G lists it as free desktop, not checked.

## Running notes

### S1 (search 1 of 6): BirdTrack's tools for county recorders (check 1)
Query (extended): `BirdTrack county recorder access download records for recording area verification tools summary help`.
- **Recorder tools inside BirdTrack** (*source claim*, the search's summary of a BTO verification guide): recorders log in, open "Management" under "Your Options", see the region they have access to, and choose "Check and validate records" (by default from 1 January to yesterday); an "observer summary" shows as a graph or a table; queries go back to the observer through BirdTrack's notifications; bulk updates skip unticked records. BirdTrack prompts for a description where a species is rare in that recording area, and flags unexpected and high counts (https://www.bto.org/our-science/projects/birdtrack/taking-part/verification).
- **Downloads** (*source claim*): the recorder downloads the county's records directly (BTO Surrey: "download all of the results for the County", https://www.btosurrey.co.uk/surveys/bird-track/); observers' records reach the recorder only if they ticked the permission box. A "Table" output gives "a quick summary of species, number of records, places, and first date and place seen that year" (the summary's words; which output, an observer's or a recorder's, isn't clear from the snippet).
- **Duplicates** (*source claim*, Manchester Birding Forum, https://www.manchesterbirding.activeboard.com/mobile.spark?p=topic&topic=52904425): a recorder says filtering out observers who also submit directly to the group is "relatively simple".
- Also returned, not read: BTO's county bird recorders page under BirdTrack (https://www.bto.org/our-science/projects/birdtrack/bird-recording/county-bird-recorders), Birds in Clyde's recording FAQ (https://www.birdsinclyde.scot/recording-and-reporting-faq.html), GIGL on recording apps (2024).
- *Inference:* BirdTrack gives recorders validation and download, and a first-date summary; nothing in the snippets says it gives last dates, monthly maxima or peak counts by site. The official verification guide is the page to read.

### R1 (read 1 of 6): BTO, BirdTrack "Verification" guide for recorders (https://www.bto.org/our-science/projects/birdtrack/taking-part/verification, read 2026-10-16; no date shown)
- *Verified, the recorder's tools:* log in, "Management" under "Your Options", a regions selector showing the areas the recorder can see; "Check and validate records" over a chosen period, through a **"Species summary"** (table or graph of records per species that need checking or have been queried) or an "Observer summary"; records as a list or on a map (satellite, street or OS background), site boundaries (10 km, 1 km or polygon); notifications to observers, private notes; categories queried, checked, requires checking, assumed correct. Map pins mark high counts, local rarities, national rarities, and species "Sensitive during certain times of the year".
- *Verified, downloads:* only a "club records download" is mentioned, which gives the user name for each record; no format or columns.
- *Verified, absent:* no first or last dates, monthly maxima, maximum counts with site and date, or sites per species; nothing on description species, records committee decisions, or data-use terms (the page only asks recorders to leave neighbouring areas' records alone).
- *Inference:* BirdTrack's recorder side is for **verification** (what needs checking, by species and observer), not for compiling the report. Its species summary counts records by verification state, not the report's tables. Combined with R4 of thread G (derived metrics still "in development" with selected recorders), the BTO side doesn't yet give recorders the report tables; that's consistent, but behind the login there could be more than this guide shows.

### S2 (search 2 of 6): MapMate's status, and MapMate's or Recorder 6's per-species reports (check 1)
Query (extended): `MapMate recording software closed December 2024 county recorders what next; MapMate or "Recorder 6" report first and last dates maximum count per species bird report`.
- **MapMate is retired, not switched off** (*source claim*, the search's summary of the vendor's site and BSBI): the developer announced retirement and a wind-down in late October 2024 (BSBI, "Update on MapMate, 29 October 2024", https://bsbi.org/mapmate-update); the vendor's site says it was retired on 30 November 2024, is no longer for sale, and its sync file server is off (https://www.mapmate.co.uk/); support and updates were promised to the end of 2025; installed copies keep working, with sync files swapped by email; a user site says it runs on current Windows (https://www.mapmate.info/); stability beyond 2025 unknown; BSBI suggests considering alternatives for new projects. This corrects Batch 09's "closed for business in December 2024".
- **No documented MapMate or Recorder 6 report** giving first and last dates with maximum counts per species turned up (*source claim*, the summary). The GMLRC MapMate manual calls MapMate's reporting "almost unlimited" (https://gmlrc.org/resources/downloads/mapmate_manual.pdf), so a recorder could build such a query, but no ready report is named.
- **What reports print** (*source claim*): Gloucestershire's recorder asks observers to give first and last dates, and monthly maxima for common residents (https://theglosterbirder.co.uk/bird-recording/); Berkshire's reports give monthly maxima and peak counts by site with dates (2015 and 2016 reports, https://berksoc.org.uk/wp-content/uploads/2020/01/BOC-2015-web.pdf).
- **A lead on what recorders use:** NBN, "Enhancing data quality of bird records for the National Biodiversity Network" (2011, https://nbn.org.uk/wp-content/uploads/2016/02/Enhancing-data-quality-of-bird-records-for-NBN_120711.pdf). Read next.
- *Inference:* MapMate, the package thread G called common, is now unsupported, sold to nobody new, and without its sync service; counties on it face a move. That weakens MapMate as an incumbent and adds a migration moment, but a page that compiles tables doesn't replace a county's database.

### R2 (read 2 of 6): BTO for the NBN, "Enhancing data quality of bird records for the National Biodiversity Network" (Nick Moran and Andy Musgrove, DRAFT, March 2011; https://nbn.org.uk/wp-content/uploads/2016/02/Enhancing-data-quality-of-bird-records-for-NBN_120711.pdf, read 2026-10-16)
The fetch tool couldn't summarise the PDF; it saved its own copy, which was copied to an empty scratchpad folder and its text extracted locally with pypdf (22 pages). Not a deliberate download.
- *Verified, the pain, from the BTO itself (2011):* "The volume of records reaching county recorders and bird clubs can present significant challenges" to the volunteers; filterable downloads help, but some recorders and clubs "still struggle to find the additional time required" for such numbers, "particularly when many of these relate to the more common species", of "lesser interest" for county reports (p. 20). The main difficulty named is the regional volunteers' need to verify records and to select "the relevant information for use in local bird reports" (§6.3).
- *Verified, a poll of recorders and report editors:* 28 responded to a recent poll; 9 of them (32%) would add bird-news records lacking an observer to the county database or report (§2.2.4). That's the only poll question the report quotes, and **no count of which software recorders use** appears anywhere in it.
- *Verified, matching names:* the report recommends a unique species identifier, such as the BTO's numerical species code, and notes that bird club databases routinely hold genus-only records ("Unidentified diver") and aggregates ("Marsh/Willow Tit"), with subspecies grouped under parent species (§2.2.3); dates commonly dd/mm/yyyy; an OS grid reference is the preferred location.
- *Verified, sensitive records:* BirdTrack withholds observer-flagged sensitive records "from any BirdTrack outputs" but they stay available to local recorders, the RBBP and others (§5.2.2); RBBP ratings give each sensitive species the coarsest resolution it may be mapped at (10 km, 100 km, or not at all, by breeding and winter season), "err on the side of caution" (§5.3); local recording networks asked for more species to be marked locally sensitive (Barn Owl, Kingfisher).
- *Inference:* this is the BTO describing the job's pain in 2011, before eBird's growth; it confirms the *selection* step (from all records to what a report needs) as the volunteers' bottleneck, and that sensitivity rules are per species, per season and per resolution, which a page could apply from a list. It's 15 years old and a draft, so it supports the pain but doesn't measure it today.

### S3 (search 3 of 6): BirdTrack's and iRecord's export columns (check 2)
Query (extended): `BirdTrack export records Excel spreadsheet columns species scientific name grid reference count breeding evidence sensitive; iRecord download records CSV columns grid ref verification status`.
- **BirdTrack, an observer's export** (*source claim*, third-party guides): "Explore my records", set the filters, choose "Table - View/download records", then a window asks which fields to export ("select 'Yes' on all of these fields", Birda's guide, https://support.birda.org/en/articles/6300470-exporting-from-birdtrack); the download is an .xlsx whose first worksheet summarises the species and whose records sit in sheets named like "Records#1" (Bird Journal, https://support.birdjournal.com/article/import). So **the columns present depend on which fields the exporter ticked**, though their headings are BirdTrack's own.
- **BirdTrack's column headings, from its upload side** (*source claim*, the summary of BTO's own guides, https://www.bto.org/sites/default/files/guide_to_column_headers.pdf and https://www.bto.org/sites/default/files/guide_to_the_birdtrack_upload_records_tool_v2_aug2017.pdf): required Species, Date, Place, and Grid Reference or Latitude and Longitude; optional breeding evidence (as text), count type, "remarkable", and sensitive ("Y" or "1"); scientific names are recognised on upload. Whether the export carries a scientific-name column wasn't confirmed.
- **BirdTrack, the recorder's download:** no public page found giving its columns (R1 names only a "club records download").
- **iRecord's download** (*source claim*, the summary of iRecord's help, https://irecord.org.uk/help/using-new-download-page): CSV from "download this report"; a newer "simple" format with fewer columns; headings named in the snippet include RecordKey, Common name, Source, NonNumericQuantity, Comment, Input on date, Last edited on date, "Verification status 1" (Accepted, Rejected or Unconfirmed) and "Verification status 2" (Correct, Considered correct, Unable to verify, Incorrect, Not reviewed, Plausible), and Query. A GitHub issue proposes download columns for sensitive records (a flag, a sensitive location, an output grid reference, a vice-county; https://github.com/BiologicalRecordsCentre/iRecord/issues/1714); whether it shipped isn't known.
- *Inference:* each route's headings are its own and stable, so a page could recognise a file by its headings without a per-county mapping, except that BirdTrack's exporter chooses the fields and observers' own spreadsheets follow each club's template. Read iRecord's help page next, as the official one of the three.

### R3 (read 3 of 6): iRecord, "Using the Download page" (https://irecord.org.uk/help/using-new-download-page, read 2026-10-16; the page says the new download page was added on 22 January 2021)
- *Verified, who and how:* a user downloads their own records, plus records from Activities they joined or records they hold a verification or other role for; each download is a .zip holding a .csv; the new page "does away with the previous limitations" on records per download (no new limit given).
- *Verified, two fixed formats:*
  - **Simple:** Taxon, Site, Gridref, VC, Recorder, Determiner, Date, Quantity, Method, Sex, Stage, Status, Comment (the first 13 columns "match MapMate"), then RecordKey, Common name, Source, NonNumericQuantity, Input on date, Last edited on date, Verification status 1, Verification status 2, Query, Licence, Verified by, Rank. Quantity holds integers only; a non-numeric count is stored as zero, its text kept in NonNumericQuantity. Gridref may hold a latitude and longitude for records far offshore.
  - **Standard:** ID, RecordKey, External key, Source, Rank, Species (the scientific name), Common name, Taxon group, Kingdom, Order, Family, TaxonVersionKey; Site name, Original map ref, Latitude, Longitude, Projection (input), Precision, Output map ref, Projection (output), Biotope; VC number, Vice County, Date interpreted, Date from, Date to, Date type, Sample method; Recorder, Determiner, Recorder certainty, Sex, Stage, Count of sex or stage (a number or text), Zero abundance, Comment, Sample comment, Images; Input on date, Last edited on date, Verification status 1, Verification status 2, Query, Verifier, Verified on, Licence, Automated checks.
- *Verified, absent:* no sensitive or confidential flag, no breeding-evidence column, and nothing on how sensitive records are blurred or withheld.
- *Inference:* iRecord's export is fixed and self-describing (two known heading sets, a scientific name and a taxon version key, date ranges with a date type), so a page could recognise it without configuration. Two traps for a merge: a "present" record arrives as Quantity 0 with text beside it, and records may be date ranges ("Date from", "Date to"), which first and last dates must handle. No breeding codes, so iRecord adds little to breeding tables; and for birds BirdTrack, not iRecord, is the main route (thread G, S7).

### S4 (search 4 of 6): re-finding Norfolk's 1.3 million records (check 3)
Query (extended): `Norfolk bird recorder 2024 "1.3 million" records BirdTrack eBird combining sorting data Norfolk Bird and Mammal Report`.
- **Not re-found.** No result carries the 1.3 million figure or the phrase about combining and sorting (*source claim*, the summary: an absence, not proof).
- Returned (*source claim*): the Norfolk and Norwich Naturalists' Society's pages for the Bird and Mammal Report (https://norfolknaturalists.org.uk/wp/publications/bird-and-mammal-report/), "Recording" (https://norfolknaturalists.org.uk/wp/recording/) and "Norfolk County Recorders" (https://norfolknaturalists.org.uk/wp/recording/county-recorders/); the Norfolk Records Committee's site, which says each year's sightings are published in the report (https://norfolkbirds.weebly.com/); a bookseller's listing of the Norfolk Bird and Mammal Report 2024 at 236 pages (https://www.wildsounds.com/products/7851-Norfolk-Bird-and-Mammal-Report-2024.shtml); the Norfolk Biodiversity Information Service holding "over 1 million" records for all groups, a different figure; British Birds' list of county recorders (June 2024 PDF); a 2025 patch report, "The Birds of Whitlingham and Thorpe 2025" (https://www.honeyguide.co.uk/documents/WhitlinghamBirdReport2025.pdf); a 2025 "Review: BirdTrack" on ResearchGate.
- *Inference:* the society's county recorders page is the likeliest home of a description of the bird recorder's job; read it next. Until then the 1.3 million stays unsourced and shouldn't be used.

### R4 (read 4 of 6): Norfolk and Norwich Naturalists' Society, "Norfolk County Recorders" (https://norfolknaturalists.org.uk/wp/recording/county-recorders/, read 2026-10-16; no date shown)
- *Verified:* the page names the birds recorder with a contact form and says the society "encourages records to be submitted" to the Norfolk Biodiversity Information Service (all groups). Nothing on the bird recorder's work, routes, software, sensitive records, or any number of records.
- *Inference:* thread G's "1.3 million records in 2024" and "mostly involves combining then sorting the data" are **still unsourced** after a targeted search and a read of the likeliest page. The main session shouldn't use the figure. Its probable home is the printed Norfolk Bird and Mammal Report's introduction, which isn't online free.

### S5 (search 5 of 6): first-hand accounts of the recorders' workload (check 3)
Query (extended): `county bird report editor recorder introduction "records" received year BirdTrack eBird increase workload compiling systematic list volunteers time report delayed`.
- **Northamptonshire's recorder, first hand** (*source claim*, the summary of his blog's front page, https://joncookbirding.wordpress.com/): with "the increasing workload and number of records submitted" he was "falling behind" in early 2025 and asked for help; a colleague took on the records arriving through BirdTrack and eBird; the committee decided on a combined report for two years, aimed for before the end of 2026. The apps are his preferred route because they bring the most records, but for the annual report he must give "a recognisable location", so app records without one are looked up by hand. Read next.
- **BirdForum** (*source claim*, a snippet of the thread that thread G couldn't read, https://www.birdforum.net/threads/how-does-the-system-of-county-bird-recorders-work.299514/): a county recorder calls the role very time-consuming, especially since BirdTrack and other online schemes "divert the flow of records"; another says BirdTrack records are most of what one county receives.
- Also returned: Shropshire's page (read in thread G), BTO's county recorders page (read in thread G), eBird's review process help (https://support.ebird.org/en/support/solutions/articles/48000795278-the-ebird-review-process), and US counterparts (New Hampshire Bird Records, Audubon's CBC compiler resources), not read.
- *Inference:* the first verifiable first-hand account of the cost: a current recorder falling behind as app records grow, needing a second volunteer for the app routes, and a report merged across two years. The named manual step is turning precise app locations into the report's recognisable sites, which is the site-matching part of the wedge.

### R5 (read 5 of 6): Jon Cook, Northamptonshire county bird recorder, blog front page (https://joncookbirding.wordpress.com/, read 2026-10-16; posts dated November 2021 to 28 January 2026)
- *Verified, the cost in his own words:*
  - "Northants Birds – 2024 / 2025 Records" (28 January 2026): the "increasing workload and number of records submitted"; he "was falling behind" in early 2025; a colleague took over the BirdTrack and eBird records; the committee will "produce a combined report for both years", aimed to be "ready before the end of 2026".
  - "Autumn Update – November 2021" (6 November 2021): 2020 brought "more than 95,000 records" from 580 observers, a record year.
  - "Northants Birds – 2022 Records" (24 December 2022): he expected to spend "the next couple of months" collating records.
- *Verified, routes:* BirdTrack, eBird and iRecord are "my preferred method of capturing records", since they reach "the largest possible number of records"; he has "management access", so app users need do nothing more. Excel spreadsheets are the other main route, processed "in one batch" at year end, in "the same Excel format" as his master file; email for ad hoc records; post accepted. Records are asked for by 31 January; app data downloaded in early February (2024 records).
- *Verified, the manual step named:* app records carry a "very detailed location" but the report needs a "recognisable location"; without a site name he is left "having to manually look up a grid reference", which he calls very time-consuming (2022 post); he asks app users to give "recognisable place names" to their own locations (2023 and 2024 posts).
- *Verified, other reconcile steps:* name problems (White Wagtail records that "referred to Pied Wagtail", Common and Lesser Redpoll confusion); description species reviewed by the county records committee, some going to BBRC; he will "take steps to protect records of sensitive species and locations", and RBBP records are "treated in confidence" (sixteen species, due by end of November).
- *Verified, absent:* duplicates aren't mentioned; no software beyond Excel templates and the master file.
- *Inference:* this is the strongest evidence in either thread: a current recorder of a mid-sized county (95,000+ records a year) whose app-sourced records outgrew one volunteer, so a second volunteer was needed and two years' reports were merged. The pain sits in the merge and clean-up (locations to recognisable sites, names, sensitive records), before any table is built, and the tables come off an Excel master file. That points the wedge at the merge, not at the tables.

### S6 (search 6 of 6; search budget spent): species-list licences and BirdTrack's terms for recorders (check 4)
Query (extended): `IOC World Bird List licence Creative Commons; AviList checklist licence download; eBird Clements checklist download terms of use; BOU British List download; BirdTrack terms data passed to county recorders use`.
- **IOC World Bird List** (*source claim*, the summary of the IOC site, https://www.worldbirdnames.org/new/ioc-lists/): v15.2 under Creative Commons Attribution 3.0 Unported (a GBIF copy lists CC BY 4.0, older Zenodo copies CC BY 1.0); **15.2 is the IOC's last update**, its editors now working on AviList.
- **AviList** (*source claim*, the summary of https://www.avilist.org/checklist/v2025b/): free to download, v2025b "licensed under CC BY 4.0", as Extended and Short .xlsx (the short about 5.1 MB) and .csv (BirdLife, https://www.birdlife.org/news/2025/06/11/avilist-unites-the-worlds-bird-species/).
- **eBird/Clements** (*source claim*): Clements downloads come as Excel or CSV and include the eBird taxonomy (https://www.birds.cornell.edu/clementschecklist/december-2023/2023b-citation-and-downloads); no licence statement for the taxonomy files was found. eBird's **observation data** terms are restrictive: free for non-commercial research and education, and a downloader can't pass the data on or redistribute it in its original format (https://support.ebird.org/en/support/solutions/articles/48001078113-ebird-data-privacy-and-data-use). eBird published a "2025 eBird Taxonomy Update" (https://ebird.org/about/2025-ebird-taxonomy-update) and news of AviList's release; whether eBird now follows AviList wasn't shown.
- **BOU British List** (*source claim*, https://bou.org.uk/british-list/): free downloads as a simple list and an Excel workbook (Categories D and F included), a recommended citation, and **no licence statement found**; a December 2025 PDF is titled "BOU_British_List_10th-and-58th_AviList_2025_Cat-F", which suggests the British List now follows AviList's taxonomy. Read next.
- **BirdTrack to recorders** (*source claim*, BTO's county recorders page under BirdTrack, https://www.bto.org/our-science/projects/birdtrack/bird-recording/county-bird-recorders): records go to the area's recorder only "provided you have given us permission"; notes travel with them; rarities go to the recorder directly and on to BBRC. A club page says the records are also available to BTO, RSPB, RBBP, SOC, WOS and BirdWatch Ireland (Bedfordshire Bird Club, https://bedsbirdclub.org.uk/records/using-the-birdtrack-app/). **No published terms limiting what a recorder does with the download** turned up.
- *Inference:* a page could ship a CC BY list (AviList, or IOC 15.2) with attribution; the BOU's own list is free to download but not licensed for redistribution as far as found. eBird's terms bind the recorder, not a page that never receives the data; a page that keeps everything on the recorder's machine is the arrangement those terms favour.

### R6 (read 6 of 6; read budget spent): BOU, "The British List" (https://bou.org.uk/british-list/, read 2026-10-16; the page says "updated 11 December 2025", posted 3 February 2026)
- *Verified, taxonomy:* "From the 58th Report (January 2026) the British List follows AviList" (version 2025). The current full checklist is the 10th edition (June 2022); the list stood at 636 species on 31 December 2025.
- *Verified, downloads:* a simple list (PDF) and an Excel workbook, both updated 11 December 2025; the workbook holds the simple list, the full taxon list format, Categories D and F, and aggregate species and subspecies. No CSV; the fields in each file aren't described.
- *Verified, terms:* no licence, terms of use or redistribution statement for the list or its files (only a site-wide footer copyright line and a privacy and terms link); the recommended citation is the 10th edition in *Ibis* 164: 860-910 (2022).
- *Verified, absent:* nothing on British vernacular names ("Wren") against international ones ("Eurasian Wren"); a "Bird names" page exists, not read.
- *Inference:* since January 2026 the list British recorders follow uses AviList's taxonomy, and AviList is CC BY 4.0 (S6, *source claim*). So a page can ship AviList (with attribution) as its name backbone, and match exports by scientific name, without redistributing the BOU's own files, which carry no licence. Two gaps for a build: British vernacular names (BirdTrack's and county reports' "Robin") are probably not in AviList, which gives international English names (from memory, not checked), and eBird's taxonomy may still differ from AviList in places (not checked).
