# Thread E: jobs hobbyists and specialist volunteers say they do by hand (forums, newsletters, Q&A, mailing lists, blogs)

**Purpose (one, bounded):** a discovery method, not a domain. Find recurring jobs that practitioners describe doing by hand, in their own words ("spent hours in Excel", "I do this by hand every month", "is there a tool that", "I wrote a script to", "we keep it on paper and then", "reconcile", "collate", "cross-check"), in documentation-heavy hobbies and specialist volunteer work Labs hasn't shipped in: specialist collecting, model engineering, horology, amateur radio beyond contest logs, amateur astronomy and meteorology, amateur science, local history and one-place studies, memorial surveys, community archives, archaeology societies, heritage railways and canals, makers' guilds, textile guilds, small museums, conservation volunteering. Evidence outranks domain: follow the strongest workflow found.

**Budget:** at most 9 web searches and 8 page reads (WebFetch). Counted below as S1..S9 and R1..R8. Read-only: no sign-ups, log-ins, posts, forms, or deliberate downloads.

**Labels:** *verified* (read on the page itself), *source claim* (a search snippet or a secondary page says so), *inference* (this thread's judgment). Short quotes only (under 15 words). Findings are advisory; the main session decides and re-checks deciding claims.

**Records check (before research, no budget):** `kw.py` over Batches 07-11.
- Settled or screened already, so not researched here: model-engineering boiler registers, timegrapher apps, lathe change gears, stamp album pages, philatelic exchange packets, IPMS contest registration, club consignment auctions (Batch 09 `research/c-makers-hobbies.md`); graveyard / monumental-inscription survey recorder (weak) and FreeREG file check (weak) (Batch 09 `research/h-heritage.md`); pest-trap counts and light-exposure budgets (Batch 10 `research/e-heritage-makers.md`, screened by judgment as #035's neighbour); NO2 diffusion tubes (Batch 10, Defra's free tool); occultation timing, sunspot numbers, double stars, transit photometry (Batch 10 `research/g-science-practicals.md`, free desktop tools); ham radio logs and beekeeping records (Batch 07, generic records); heritage-railway volunteer fatigue (Batch 10, HSE's FRI); volunteer time as match funding (Batch 09 and Batch 11, REJECT by inference); canal cruising logs (Batch 10).
- No prior hits (open): reconstitution, one-place study, parish register (beyond FreeREG), land tax, manorial, churchwardens', overseers', shillings / £sd, pottery, sherd, fieldwalking, metal detecting, Portable Antiquities, letterpress, font scheme, blacksmith, stained glass, woodturning, mineral, Numista, marque registers, chassis, church recorders, NADFAS, herbarium, POTA, DXCC, LoTW, Custodian, Gramps, linkage.

## Summary (filled in at the end)

(pending)

## Running notes

### S1 (1 of 9): one-place studies, census household linking
Query: `"one-place study" spreadsheet census households linking people across censuses by hand`.
- Returned academic record-linkage work, not practitioners: a William & Mary course guide where students hand-link people census to census in a spreadsheet and grade match quality (https://jmparman.people.wm.edu/400-lecture-slides/data-project-guidelines-400-s18.pdf, *source claim*); ANU's household-then-group linking papers (https://researchportalplus.anu.edu.au/en/publications/automatic-record-linkage-of-individuals-and-households-in-histori/, *source claim*); a Yale abstract that human linkers link more but with more false positives (https://economics.yale.edu/publications/author/James%20Feigenbaum, *source claim*).
- No one-place-study practitioner voice surfaced. The job (link households across censuses) is real in research, but the evidence here is academic, and academics have their own linkage software (*inference*). Lead parked unless a later search turns up practitioners.

### S2 (2 of 9): local history, accounts in pounds, shillings and pence
Query: `local history transcribing accounts "pounds, shillings and pence" spreadsheet Excel add up totals by hand churchwardens OR overseers OR probate inventories`.
- Practitioner project: Milton Abbas History Group transcribed Dorset churchwardens' accounts 1729-1781, about 8,400 records into a spreadsheet, and "begun analysing them" (https://miltonabbashistorygroup.com/churchwardens-accounts/, *source claim*, snippet; to read).
- Practitioners asking how to do £sd in Excel: excelforum.com "pre-decimal currency calculations in Excel" (https://excelforum.com/excel-general/550314-pre-decimal-currency-calculations-in-excel.html, *source claim*); a 1990s Humanist list post giving the three-column method with INT and MOD carries (https://dhhumanist.org/archives/Virginia/v06/0346.html, *source claim*); a Royal Society transcription spreadsheet that kept £sd for reading and old pence for graphing (figshare 10.6084/m9.figshare.21235719, *source claim*).
- Transcription rules that a tool would have to honour: Warwickshire CRO guidance keeps money as given, drops hyphens and stops, keeps ½ and ¼, renders "ob" and "qd" as fractions (https://api.warwickshire.gov.uk/documents/WCCC-372917633-2739, *source claim*); ScotlandSpeople on L, s, d forms and "sch"/"sh" (https://www.scotlandspeople.gov.uk/scottish-handwriting/coaching/numbers/money, *source claim*).
- Incumbent for programmers: debkeepr, an R package "to make the transcription of account books easier to analyse" (https://www.stats.bris.ac.uk/R/web/packages/debkeepr/vignettes/ledger.html, *source claim*). Comparison data: Warwick's My Parish churchwardens' accounts database lists surviving years and yearly totals (https://warwick.ac.uk/fac/cross_fac/myparish/projects/cwa, *source claim*).
- Lead L1 opened: **checking and summarising a transcribed £sd account book** (inference: the clerk's own page and year totals act as checksums on the transcription; spreadsheets don't do £sd natively).

### R1 (1 of 8): Milton Abbas History Group, churchwardens' accounts
https://miltonabbashistorygroup.com/churchwardens-accounts/ (*verified*, read 2026-10-15)
- Source: churchwardens' books at the Dorset History Centre, 1729-1963. One volunteer ("supertranscriber") did 1729-1781, another 1836-1880; volunteer transcribers "around the world" share page images through Google Docs, OneDrive or Dropbox; 1820-1836 still to photograph.
- Output so far: "8400 records into a spreadsheet"; analysis "begun". Findings named: ratepayer numbers fall sharply after 1780 while totals raised for church and poor stay similar (with the Overseers of the Poor books, 1771-1800); vermin payments stop about 1777.
- Other tabular projects listed: Land Tax Assessments 1780-1832, Protestation Returns, tenants 1770, settlement examinations, wills (no details given).
- No complaint about arithmetic, £sd, the clerk's totals or tools. The job is real (*verified*); the friction is not shown (*inference*).

### S3 (3 of 9): community archaeology, finds by period per test pit or fieldwalking square
Query: `community archaeology test pits OR fieldwalking finds by period per pit spreadsheet distribution maps volunteers "by hand" OR "Excel" society report`.
- A recurring artifact surfaced (all *source claim*, search summaries of society PDFs): Shillington History Society's yearly test-pit reports (2020; 2021-2) organised period by period, each with pottery distribution maps and appendices of pottery types, amounts and weights per test pit (https://shillington-history.org.uk/wp-content/uploads/sites/5/2023/03/2020-Shillington-report.pdf ; .../2021-2-Shillington-report.pdf); the same society's Pegsdon report with pottery weight and averages by pit and period (.../2020-Pegsdon-report.pdf); Cambridgeshire Archaeological Field Group reports with per-period pottery distribution figures (Clopton fieldwalking), fieldwalking pottery by 100 m² areas and 24 test pits (Haslingfield 2014), tables by period (Wimpole) (https://www.cafg.net/docs/reports/); volunteer fieldwalking at Covington (Oxford Archaeology East, grid map of pottery and tile), Whirlow Hall (finds georeferenced), Rendlesham (Suffolk HER ESF30138); method page at Bingham Heritage (https://www.binghamheritage.org.uk/archaeology/field_walking/method.php).
- How the tables and maps are made (spreadsheet, GIS, drawn by hand) did not show in the summaries.
- Lead L2 opened: **finds-by-period tables and distribution maps for a society's test pits or fieldwalking grid** (*inference*: a seasonal job, count and weight per pit or square and per period, mapped once per period).

