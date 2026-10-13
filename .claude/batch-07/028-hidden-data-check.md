# #028 Hidden Data Check

Dossier for Batch 07's third experiment. Research and decision: `CANDIDATES.md` ("Need-first round" and "Decisions for #028").

## Thesis

- **Audience:** people who send or publish spreadsheets made from personal data. First, FOI and information-governance staff in councils, NHS trusts, police forces, universities, and schools. Then anyone sending a workbook outside their organisation (HR, finance, charities reporting to funders).
- **Job:** before a spreadsheet goes out, find everything in it that isn't on screen, see what it holds, and know how to remove it. The places are hidden sheets, rows, and columns; far-away cells; filters; pivot caches; cached copies of linked files; data models; comments; names and properties.
- **Alternatives:**
  - Excel's Document Inspector: Windows desktop only. It reports caches and links without showing or removing them, and misses remote rows and columns.
  - Unhiding everything by hand.
  - Converting to CSV, or pasting values into a new workbook.
  - Free in-browser tools that each cover a slice (ExcelErrorFinder, ExcelToolkit Pro, MetaClean).
  - mySociety's analyser, only after a file is sent through WhatDoTheyKnow.
  - Python scripts.
- **Strongest incumbent:** Document Inspector, for people with Windows Excel who think to run it.
- **Differentiation:**
  - It covers every place the ICO lists.
  - It shows what each place holds.
  - It finds what Document Inspector can't: remote cells, text coloured or formatted to vanish, and caches whose source sheet is gone.
  - It gives the Excel steps to remove each.
  - It runs anywhere, sends nothing, and works offline.
- **Strongest falsification argument:**
  - The fix is procedural (CSV, or paste values), and no tool makes anyone check.
  - A checker that misses something reassures falsely.
- **Why BUILD survived:**
  - The checks keep failing despite a decade of guidance (about 2% of spreadsheets sent through WhatDoTheyKnow in 2024; a 2025 reprimand over 6,528 people's data).
  - Showing the contents is what makes the risk concrete.
  - Uploading a file to check it would itself disclose it, so only a local page can do this.

## Risk list (before coding)

| Risk | Design answer |
|---|---|
| A false "nothing found" | Never says "safe" or "clean". The result names the places checked and the ones it can't check (what's inside pictures, embedded files, macros, and a data model), and repeats the ICO's advice: send CSV, or paste values into a new workbook |
| A hidden place the check doesn't know | The ICO's list plus everything Document Inspector reports, each tested with files made two ways (by hand to the spec, and by openpyxl), with prefixed and Strict namespaces. Package parts it doesn't recognize are listed with their sizes |
| Very large files (a million-row sheet, a cache as big as its source) | Each part is streamed (inflated and scanned in chunks, never held whole). Counts are kept rather than cells, and previews are capped. Progress is shown; a cap on the total read ends with a message, never a hang |
| Zip bombs, broken or hostile files | Inflation capped per part and in total; malformed zips and XML get a message. Nothing is executed: no macros run, and no browser XML parser fetches entities (a small scanner of its own) |
| Personal data shown on screen | Previews are folded until opened; the printable record leaves them out unless asked |
| False alarms that teach people to ignore it | "Far away" is a stated rule: content after a gap of at least 50 empty rows or 20 empty columns, or starting that far from A1. Colour-hidden means the resolved text colour equals the resolved fill. Hidden but empty rows and columns sit in a lower tier |
| Wrong cell references or values | References come from the file's own `r` attributes, or from the position when they're absent. Columns past Z, AA, and XFD and rows up to 1,048,576 are tested, along with rich text, inline strings, and shared strings |
| Pivot caches decoded wrongly | Shared items, numbers, dates, booleans, errors, and missing values decoded per the spec and checked against openpyxl. A cache's unique values count even when its records aren't saved |
| Protection mistaken for safety | Workbook and sheet protection noted, with the ICO's point that it doesn't stop anyone reading hidden data |
| Other formats | .xls, .xlsb, .ods, .numbers, .csv, and password-encrypted files recognized by their bytes, each with a message and a way forward |
| Privacy claims | No network requests once the page is loaded (checked in the audit); nothing stored; works offline after a first visit |
| Phones | A file picker on any device; the report readable at 360 px |

## Implementation

- `zip.ts`: reads the zip's central directory (ZIP64 too) and opens each part as a stream (DecompressionStream), refused past a per-part limit (4 GB inflated) and a check-wide budget (6 GB), with `head` for a part's first bytes. Over 100,000 parts is refused.
- `xml.ts`: a streaming scanner of its own: tags and text as they arrive, never a document, and no entities fetched or expanded. A tag held over a chunk boundary is searched from where the search stopped, and one over 4 million characters means a damaged file. Cell references, areas, and the `_xHHHH_` escapes.
- `sheet.ts`: one pass over a sheet for cells (value or formula), hidden rows and columns (hidden, or too small to see), values a format or a colour hides, drop-down lists (x14 ones too), header and footer text (Excel's codes and page numbers aren't text), scenarios, protection, filters, and cube formulas; a second pass only when data that shows sits far from the rest. Its working memory is cleared before each sheet, and a sheet that stops partway keeps what came before.
- `cfb.ts`: names in a compound file's directory, to tell an old .xls from a .doc, a .ppt, an Outlook message, and a password-protected file.
- `inspect.ts`: the workbook part, then each sheet, sheets the workbook doesn't list, the shared text (and text no cell uses), charts' cached values, pivot caches and their records, slicers on a data model, linked files' caches, names, comments (threaded too), drawings (hidden objects, text in shapes), pictures, the data model, connections, Power Query (names, sources, typed tables), change history, embedded files, properties, labels, printers, and custom data. Every part of the file ends up read, shown, ordinary structure, or not read, and the report says what couldn't be read and why.
- `example.ts`: a made-up library's workbook built in the browser (a stored zip with its own CRC), for "Try an example".
- `index.tsx`: choose, drop, or try an example; progress with Stop; the result: a headline count, then data that isn't on screen, people and where the file has been, worth knowing, what the check couldn't do, the sheets, and every part. Each finding has what it holds (folded until opened) and the Excel steps to remove it. Print a record (what each holds only if asked), check an embedded workbook and come back. Nothing stored.
- Size: 103.6 kB, 35.8 kB gzipped. No dependencies.

## Audit

Before the push, on the built site, in Chromium (Brave) and WebKit 27.2 through Playwright 1.64. Scripts in `.claude/qa/` (git-ignored): `hidden-data-check-test.ts`, `hdc-flow.cjs`, `hdc-perf.cjs`, `hdc-offline.cjs`, `hdc-narrow.cjs`, `hdc-frames.cjs`, and in `.claude/qa/hdc/`: `cases.ts` (cases written to ECMA-376, MS-QDEFF, and MS-CFB), `make_fixtures.py` (openpyxl), `independent.py`, `fuzz.ts`, `zipvariants.ts`, `write-large.ts`, `write-long.ts`.

**Correctness by an independent method.**
- `independent.py` works the facts out with openpyxl (its own reader) and a separate implementation of the stated rules, then compares them with the page's report: sheets, states, and cell counts; hidden rows and columns with their cells; far-away data (start, gap, count); values hidden by format and by colour; drop-down choices; header text; comments and authors; names; properties. Four workbooks, including one with 800,000 hidden cells: every fact agrees.
- Pivot caches: openpyxl's pivot reader agrees with the page on the hand-written cache (5 records, the fields, the first record, who refreshed it, the source sheet).
- Fixtures were made two ways: by openpyxl, and by hand to the published formats (with every part's content type and a complete stylesheet, so openpyxl loads them too), with Strict and prefixed namespaces, ZIP64, data descriptors, stored parts, and a long zip comment.
- 62 model checks (`hidden-data-check-test.ts`): every first-draft defect, each hidden place, the example, and the rules (formats, colours, header codes, both date systems, references to XFD1048576, clipping).

**The first draft's defects, all fixed at their cause** (each shown by a case in `cases.ts`):

| Found | Effect | Fix |
|---|---|---|
| Power Query's part read whole with a 4 KB limit, and its UTF-16 read as UTF-8 | Queries and typed tables silently skipped; the base64 dumped as "Custom data" | A part's first bytes read for its kind, decoded by its byte-order mark |
| An unreadable hidden sheet | Called "empty" | Read in part keeps what came before; "couldn’t be read" otherwise; always a data finding |
| Row and column memory shared between sheets | A failed sheet's leftovers hid the next sheet's far-away data | One memory, cleared before each sheet |
| Text no cell uses, counted when a sheet was read only in part | A false finding | Not looked for unless every sheet was read in full, and said so |
| A tag search that started again for each new chunk | An unterminated quote in a 60,000-row sheet took over 5 minutes | Linear search, resumed where it stopped; 0.14 s |
| `list.map(clip)` passed each item's index as the length | List items cut to nothing | `clip` takes one argument |
| Chart styles, colours, and metadata unknown | Ordinary parts listed as unread | Each part classified; only unrecognized ones listed |
| Yellow on white counted as hidden; page numbers counted as header text | False findings | A colour must have almost no contrast and no channel far off; header codes stripped |
| Any compound file called an old .xls | A Word .doc mislabelled | The compound file's directory read: .xls, .doc, .ppt, .msg, password-protected |

**Material defects found in this audit, all fixed before the push:**

| Found | Effect | Fix |
|---|---|---|
| A binary workbook (.xlsb) or a Word .docx got an empty report | Looked like a file with nothing hidden | The main part must be a workbook's XML, or the file's kind is named |
| A sheet stopped by the read budget was reported twice | Repeated, confusing | Said once, in the list of what the budget didn't reach |
| Threaded comments didn't name their authors | "2 comments", by nobody | Authors taken from the workbook's list of people |
| Hundreds of scattered hidden rows listed one by one | An unreadable sentence | The first dozen runs, then "and N more" |
| Scrollable samples were landmarks named like their sections (axe: landmark-unique) | Noise for screen readers | Groups, not landmarks |
| With text at 200% on a phone, wide samples and long emails pushed the page sideways (grid items sized to their content) | Sideways scrolling | Every grid one column that can shrink; long text breaks |
| "Lists everything … that isn’t on screen", and CSV "can’t hold any of these" | Claims the page can't make (it can't see into pictures or a data model; a CSV can hold far-away rows) | "What’s in it that isn’t on screen"; CSV "keeps only the cells’ values: no hidden sheets, caches, or comments", with the ICO's page linked |
| Comments' removal steps named menus that don't delete notes everywhere | Steps that may not work | Home > Clear > Clear Comments and Notes |
| "hold" for one row or column; saved times without a time zone | Small errors | Singular forms; times say UTC |

Checked against sources: the ICO's spreadsheet guidance (31 July 2025: the list of hidden places, the CSV advice, that tools "may be able to detect some, but not all"), and Microsoft's shortcut for the last cell on a Mac (Control+End; Control+Fn+Right arrow on a MacBook).

**Hostile input:** 18,000 damaged copies of 18 fixtures (bytes flipped, cut short, spans zeroed or copied over, the central directory changed): every one gave a report or a message, none crashed or hung, the slowest took 0.12 s. An encrypted part and an unknown compression method are each reported as not read. A part that understates its size is read in full. A 300 MB inflation stops at a 100 MB budget with one message. A shared-text index of two billion neither allocates nor misleads.

**Performance:** 4.2 million cells and a 300,000-row pivot cache (21 MB) in 2.5 s in Chromium and in WebKit, 8.9 s with Chromium's CPU slowed four times; the longest the page went without responding was 91 ms; memory peaked at about 60 MB. The page paints about 20 frames a second during a check. Stop takes effect within 30 ms. A file packed 1,000 to 1 (2.5 GB of spaces in 2.4 MB) makes WebKit paint few frames while it inflates, though Stop still works: a decompression-bomb shape, not a real workbook's.

**Browser checks** (`hdc-flow.cjs`, 72 checks, three clean runs in each engine): the example (focus moves to the result, every sample folded at first, opening one), a realistic FOI response (8 places, yellow text left alone), refusals (.doc, password-protected), an embedded workbook and back, a damaged hidden sheet read in part and said so, Stop, the keyboard (Tab, or Option-Tab as Safari users do, and Enter to the file chooser and a sample), drag and drop, print (samples left out unless asked; buttons hidden), axe with no violations on the start and on a result, at 1280 px light and 390 px dark.

**Accessibility:** axe finds 0 violations; no sideways scroll at 320 px, or at 390 and 1280 px with text at 200% and every fold open, or with a 208-character file name.

**Privacy:** no request at all once the page has loaded; localStorage, sessionStorage, and IndexedDB stay empty; pictures are shown from object URLs released when they close.

**Offline** (`hdc-offline.cjs`, the built site on a real server, then stopped): the page opens, and the example and a real file are checked, in both engines.

**Site-wide:** the 29-page smoke test on the built site: 116 page loads, 0 problems.

**Harness issues, not the page's:** heading names matched as substrings ("Checking x.xlsx" matched "x.xlsx"); file-chooser interception switched on too late lost a race now and then; Safari moves to buttons with Option-Tab; a reload's own files counted as later requests; Playwright's wait for a steady button needs painted frames (see the 1,000-to-1 file). Each was fixed in the harness and noted where it's done.

**Browser coverage:** Chromium and WebKit through Playwright. Not covered: Firefox (parked), real Safari and iOS, Windows, and files saved by Excel itself (the fixtures were made by openpyxl and by hand to the formats; Excel for Mac is on this machine, but driving it would need an automation permission).

**Residual uncertainty:**
- Whether FOI and information-governance staff would use a web page for this, even one that sends nothing: needs people.
- Files from real systems: Excel's own quirks, and exports from other programs.
- Colour hiding is judged by a rule from the stored colours (with tints); cells under conditional formats and table styles aren't judged.
- Not detected: shapes covering others, and objects in hidden rows or columns. Found, but not read inside: pictures, a data model, macros, and embedded files that aren't workbooks.

## Production verification

2026-10-13, commit 02dc91e, deploy run 38455167140 succeeded.
- Production's 67 files are byte-identical to the local build of that commit.
- `hdc-flow.cjs` against production: 72 of 72 in Chromium and in WebKit (the example, the FOI response, refusals, an embedded workbook and back, a damaged sheet, Stop, the keyboard, drag and drop, print, axe at 1280 px light and 390 px dark, no requests after load, nothing stored).
- `hdc-offline-prod.cjs`: with the browser's network cut after one visit, an address never opened fails, while the page reloads and checks the example and a file, in both engines.
- The homepage lists it under "Files & text".
- The 29-page smoke test on production: 116 page loads, 0 problems. The daily check: 11 of 11.

## After the push

2026-10-13, at the batch's close: the page on a workbook Excel itself wrote, the Solver add-in that comes with Excel for Mac. Until then the fixtures had come from openpyxl or been written by hand to the published formats. One material defect, fixed:

| Found | Effect | Fix |
|---|---|---|
| Excel writes `[0]` for the workbook itself: names for its own macros (`[0]!Help1_Click`) and a chart's named ranges (`[0]!Name`). The page counted any bracketed number as a link to another workbook, and table columns such as `Sales[2024]` too | A false "Names that point to other files" on Solver. Every chart on a named range would have been called "another file's data" | Only `[1]`, `[2]`… or a file name counts as another workbook, read in one pass that skips quoted text and table references. A chart's named ranges are followed through the workbook's names, so a chart drawing on a hidden or deleted sheet through a name is still found, and a name pointing at deleted cells (`#REF!`) gets a finding of its own: "A chart's copy of data no longer in the workbook" |

**Checks:**
- **Speed.** The fix's first version used regular expressions that took 6.5 s on a hostile 100,000-character name. The one-pass scan takes 2 ms, and a model check now holds it to that.
- **Model checks:** 73 (10 new).
- **Old against new.** The reports of the page before and after the fix are identical on all 21 fixtures; on Solver, the only change is that the false link is gone.
- **Hostile input** (seed 31): 5,700 damaged copies of 19 fixtures, Solver included, gave 0 crashes, with the slowest at 336 ms.
- **Browser:** 72 of 72 checks in Chromium and in WebKit.

**In production** (commit 5c883ad, deploy run 38469054081): the 69 files are byte-identical to a fresh build. On the live site, in Chromium and WebKit, its 72 browser checks pass, and `closeout-prod.cjs` checks the fix directly. The 30-page smoke test gave 120 page loads with 0 problems, and the daily check passed 11 of 11.

## Lifecycle recommendation

**PROMOTE candidate**, the strongest of Batch 07:
- A regulator names the job and the failure: the ICO's guidance of July 2025, and the fines and reprimands over hidden sheets and pivot caches.
- Uploading a file to check it would itself be a disclosure, so working only on the device is the wedge.
- Every spreadsheet that goes out is an occasion.
- Document Inspector is Windows-only and shows nothing of what it finds.

What would test it:
1. **Technical, needing only a permission:** workbooks saved by Excel itself. Excel for Mac is on this machine, but driving it needs an automation permission.
2. **Human:** a few FOI or information-governance officers run it on files they're about to send. Does it find what they'd have missed, and does anyone read "nothing found" as "safe"?

Both are the owner's call. What would move it to Maintain: officers who won't use a page their IT hasn't approved, or findings they already catch with Document Inspector. Watch new Excel features (each adds parts) and the ICO's guidance.
