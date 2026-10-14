Thread Q: wildlife records into the national recording systems (UK) — 2026-10-14 — budget 10 web searches, 6 page reads

Read-only: nobody contacted, nothing posted or downloaded, no sign-up. Tags: *verified* (I read the page), *source claim* (search snippet or secondary source), *inference*.

## Notes (written as the thread goes)

- Prior attempt at this thread (round 3, "Thread Q") was cut off by the session's usage limit before writing anything (`m-round3-main.md`, line 12). This file is the relaunch.

### S1 (search): iRecord's import rules
- iRecord's importer takes Excel (.xls/.xlsx) or CSV; only the first worksheet; one row per record; column headings in row 1 with nothing above them; one solid block with no empty rows or columns; heading wording doesn't matter because columns are matched to iRecord's fields during import (irecord.org.uk/node/9709 "Upload records from a spreadsheet", irecord.org.uk/node/158 "Import Records"; *source claim*, search summary).
- Recommended minimum columns: species name, location name, grid reference, date, recorder, determiner (only if not the recorder); extra columns (count, life stage) allowed. In the casual-records template, grid ref (British National Grid) and date are mandatory. Optional: external record ID, sensitivity precision in metres (*source claim*, iRecord help pages via search).
- Dates in UK form dd/mm/yyyy. Species names, scientific or English, must match iRecord's names, which come from the UK Species Inventory (UKSI); scientific names advised as they match most consistently; a Taxon Version Key column is also accepted; "UK Master List" is the list to pick for standard records (*source claim*).
- After an import iRecord reports how many rows failed and lets you download the problem rows to fix (*source claim*).
- A new importer went live on 8 August 2024, so older guides don't match the screens (*source claim*, iRecord help). Imports of 10,000+ records must be arranged in advance (*source claim*).
- Don't import records already sent to a recording scheme: verifiers must check them again and duplicates result (*source claim*, iRecord guidance).
- Butterfly Conservation's county recorder toolkit (butterfly-conservation.org .../county-recorder-toolkit/validation-process-and-tools) warns that Excel can transpose UK dates into US dates and tells county recorders to check the locale of spreadsheets their recorders send (*source claim*, search snippet quote).
- A user reported a batch with a single 2024 date stored as 1905 after upload and said iRecord should have rejected it at upload (*source claim*; source page not identified from the snippet — probably the NBN forum thread forums.nbn.org.uk/viewtopic.php?id=7462 or an iRecord forum post). *Inference:* that is the classic Excel serial-number bug: a cell holding the number 2024 read as a date serial is 16 July 1905.
- Other recording schemes publish their own spreadsheet guides for getting records into iRecord: British Arachnological Society "Bulk Upload Spreadsheet and iRecord Guidance" (PDF dated 2026-02 in its URL); British Lichen Society "Spreadsheet surgery" handout (advises a leading apostrophe so Excel keeps year-only or month-year dates as text) (*source claim*). *Inference:* the friction is real enough that schemes write handouts about it, and recent ones (2026).

### S2 (search): friction on forums (iRecord forum, NBN forums)
- The search found no 2025 threads; what it found is older (dates not given in snippets) (*source claim*):
  - NBN forum, "Species names in Recorder 6 dictionary vs. iRecord" (forums.nbn.org.uk/viewtopic.php?pid=29266): a Sussex recorder found records are matched on the Taxon Version Keys in a download rather than the names; four taxa in one download had no match in an up-to-date dictionary and weren't in the UKSI or NBN Atlas either.
  - NBN forum (viewtopic.php?id=3461 / id=4290): a file whose taxon name wouldn't import until the name was changed to one from the helper's own list.
  - A user importing a CSV of decimal latitude/longitude got "The spatial reference is not recognised" until they set the spatial reference system to "Latitude and Longitude (WGS84)" on the first page of the importer and mapped the column to "Sample > Grid ref or other spatial ref".
  - iRecord forum: a grid reference rejected as invalid on the entry form although the previous record had the same one; a user asking whether a spreadsheet file must now be named a particular way after an importer change ("How do I...? and other questions", irecord.org.uk/forum/how-do-i?page=18).
  - Records arriving from BTO BirdTrack with odd grid references (mammals offshore), explained by how BirdTrack calculates grid refs (irecord.org.uk/node/8963); iNaturalist records with huge precision radii given a precise hectad.
  - iRecord takes iNaturalist records only if research grade, the name matches the UKSI, and the licence is a suitable Creative Commons one (brc.ac.uk/irecord/linking-inaturalist).
- *Inference:* the failure types are the expected ones (names not in UKSI, grid refs in the wrong system or form, dates), and help is given in forums one case at a time. No evidence yet of how long it takes or how common it is.

### S3 (search): Record Cleaner, the free checker
- **Record Cleaner online** (UKCEH Biological Records Centre, redeveloped 2024–25 from the NBN's desktop Record Cleaner; www.brc.ac.uk/record_cleaner; announced at brc.ac.uk/article/new-record-cleaner) (*source claim*, search summary):
  - takes Excel (.xlsx) or CSV with a header row; each row needs a taxon name or Taxon Version Key, a date, and a spatial reference (UK, Irish or Channel Islands grid ref, or latitude/longitude);
  - stage 1 "validation" checks format against built-in rules: bad dates (e.g. 31 February), bad spatial references (e.g. "TL123"), species names not matching the UKSI;
  - stage 2 "verification" checks plausibility against recording schemes' rules: outside known range, wrong time of year. Some rulesets are old; BRC and NBN are updating them with the schemes.
  - The old standalone NBN desktop version "has not been updated recently and may not function well using modern operating systems"; the online version replaces it.
- Old desktop Record Cleaner matched taxon names exactly, so "sp." and similar needed manual matching (NBN forum, 2012) (*source claim*).
- *Inference:* this is the incumbent for "check my spreadsheet before I send it": free, made by the body that runs iRecord, with the schemes' own rules, which a Labs page could never match. Still to verify: whether it needs an account, whether files go to BRC's server, and whether it converts (fixes) rather than only reports.

### F1 (page read): BRC, "Record Cleaner online" (brc.ac.uk/article/new-record-cleaner)
- *verified:* article dated 24 September 2025; the web-based version was developed in 2024–25; you "upload a set of records from a csv file" and "download reports"; it checks formatting ("dates or grid references") and flags records in "unexpected locations or at unusual times of year" for "many species groups"; there is an API for other recording systems; some rules "have not been updated for a number of years"; the standalone desktop software is "no longer being maintained"; tools for editing rules are still being developed. Tool: https://www.brc.ac.uk/record_cleaner.
- *verified (by absence):* the article says nothing about an account or login, and nothing about converting or producing an iRecord-ready file: it reports problems; it doesn't fix them.
- *Inference:* files go to BRC's server (a web upload with server-side rules and an API), so it is not on-device, but it is free and official, and recorders who would use a checker are pointed to it by the body running iRecord.

### S4 (search): the UK Species Inventory as a download
- NHM Data Portal has two UKSI datasets (*source claim*, search summary):
  - "UK Species Inventory simplified copy" (data.nhm.ac.uk/dataset/uk-species-inventory-simplified-copy): all names and all taxonomic concepts in 2 tables, from which NBN Taxon Version Keys can be derived; Excel resource, latest "UKSI 20250703a Simplified Copy.xlsx" updated 4 July 2025 (another locale's listing showed 20241114a); cited Chris Raper (2014), DOI 10.5519/0070624; the search listing showed its licence as "License not specified".
  - "Master copy": the full UKSI with all tables, needs Microsoft Access or similar; listed as Creative Commons Attribution (CC-BY) in the portal listing.
- *Inference:* a names list is downloadable, but the simple copy's licence may be unstated, which matters for republishing it inside a public repo. To verify on the dataset page (licence, file size).

### F2 (page read, failed): NHM Data Portal dataset page
- data.nhm.ac.uk/dataset/uk-species-inventory-simplified-copy returned HTTP 403 Forbidden to the fetcher (a site block, not a general fetch failure). Counted as page read 2 of 6. Licence and size remain *source claim* / unverified.

### S5 (search): what county moth recorders ask for
- Wharfedale Naturalists (wharfedale-nats.org.uk/moths): taxon (ideally scientific name), site (not the recorder's home address), six-figure grid reference, vice-county number, recorder, determiner if different; and the claim that **MapMate "closed for business in December 2024"** (*source claim*, search summary; to verify).
- Essex Field Club, "Providing Moth Records" (essexfieldclub.org.uk/portal.php/p/Providing+Moth+Records): minimum taxon name, site, grid reference, date, recorder, determiner; preferred extras habitat, quantity, voucher kept, identification confirmed; preferred format a MapMate sync file, then their Excel template (*source claim*).
- Gelechiid recording scheme, "Submitting Records" (gelechiid.co.uk/node/328) (or a similar scheme in the same results): scientific name, a site name (not "My Garden"), grid reference of 6 or 8 figures (not 10), vice-county number, full date, quantity, life stage, method (e.g. light trap), comments; for bred moths the date the larva or pupa was found, not the emergence date (*source claim*; the summary called it "Gloucestershire-style" — attribution uncertain).
- Berkshire Moth Group (sites.google.com/site/berksmoths, "Sending in records"): the quickest way is iRecord or the National Moth Recording Scheme's online system; spreadsheets by email also accepted (*source claim*).
- Shropshire Ornithological Society has a page "Reporting Your Records Using a Spreadsheet" (shropshirebirds.com) (*source claim*; not read). East Midlands Butterflies has a recording page (*source claim*).
- Butterfly Conservation's county-recorder toolkit again: Excel can turn 01/06/2023 into 06/01/2023; use a template with the format set (*source claim*).
- *Inference:* every county and scheme states its own column list, and they differ in small ways (6 vs 8 figure grid refs, vice-county number required or not, site name rules, determiner column), so a "convert to my recorder's format" tool would need per-recipient templates; the common core is what / where (grid ref + site name + vice-county) / when / who (recorder, determiner) / how many / stage / method.

## Closed by the main session (2026-10-14)

The thread was cut off by the session's usage limit for the second time after 5 searches and 2 page reads (one refused, 403); its notes stand as written. The main session closes the lane on them rather than relaunching a third time.

- **The job (before → after):** before, records kept in a notebook or a spreadsheet, sent to iRecord or to each county or scheme recorder in their own columns (what, where as a grid reference with a site name and often a vice-county, when, who, how many, stage, method), with dates that Excel turns round, names that don't match the UK Species Inventory, and grid references in the wrong form; after, a file each recipient accepts first time.
- **Alternatives found:** iRecord's own importer (free, an account; any headings mapped to its fields; failed rows reported and downloadable to fix; a new importer since August 2024; *source claim*); the Biological Records Centre's **Record Cleaner online** (free, official, 2024–25, upload a CSV, reports on dates, grid references, and names against the UKSI, then plausibility against the recording schemes' own rules; *verified*, BRC's article of 24 September 2025; it reports problems, it doesn't convert, and files go to its server); schemes' and counties' own spreadsheet handouts and templates (*source claim*); Living Record, Recorder 6, and, until it reportedly closed in December 2024, MapMate (*source claim*, unverified).
- **Strongest incumbent:** iRecord's importer with BRC's Record Cleaner beside it, both free and run by the bodies the records go to, with the schemes' own rules, which a Labs page couldn't match.
- **Labs-fit problems:** species names need the UK Species Inventory, whose simplified copy's licence is listed as "not specified" (*source claim*; the dataset page refused the fetcher) and which changes with each release; every recipient's column list differs a little, so conversion means a template per county or scheme.
- **Strongest reason not to build:** the official free tools already check and import; what's left is per-recipient formatting with no measure of how much time it costs, and help is given case by case in forums.
- **Verdict: REJECT.**
