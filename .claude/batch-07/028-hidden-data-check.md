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

(After building.)
