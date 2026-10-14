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
