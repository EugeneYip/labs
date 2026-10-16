# #037 Ballooned Drawing: adversarial audit

Auditor: a sub-agent of the main session, 2026-10-15, on `wip/037-ballooned-drawing` (69d040e) and the built `dist/`.
Probes: `.claude/qa/bd-audit-*` (model probes `.ts`, browser probes `.cjs` through `qa.sh --route dist`, fixtures `.py`).
Only what was reproduced is listed as a finding; worries and design ideas are under "Suggestions (not verified defects)".

## Findings

(Written as they're found; IDs in order of finding, not severity.)

### A-01 (high) Requirement rules: a minus written as an en or em dash, or with a space after it, is read as two limits

**Area:** `normalize` and the two-limits rule in `readRequirement` (model.ts lines 178 and 415).
**What is wrong:** `normalize` turns a digit, an en or em dash, and a digit into " to " (meant for "11.95–12.05"), and the two-limits rule takes `\s-\s` as a range. A one-sided tolerance whose minus comes out of the PDF as an en dash (WinAnsi fonts have no U+2212, and many producers use the en dash glyph for minus) or as a separate run (so a space follows the sign) is read as "Limits 0.05 to 12.00", source "drawing". This is false reassurance: an out-of-tolerance 11.90 passes. The same requirement with a plain hyphen ("12.00 -0.05") is correctly refused as a single deviation, so the refusal depends on which dash glyph the font used.
**Reproduction:** `sh .claude/scripts/qa.sh 120 bd-audit-model.ts` ("dashes and signs"):
`"12.00 –0.05"` (U+2013) -> measured 0.05 .. 12.00, "Limits 0.05 to 12.00." Same for `"12.00 —0.05"` (U+2014), `"12.00 - 0.05"`, and `"12 – 0.5"` (-> 0.5 .. 12.0). `evaluate` then passes 11.90 against it.
**Suggested fix:** Treat a dash or a spaced minus before a number that follows a complete nominal as a sign, not a range: only read "a – b" or "a - b" as two limits when neither side is signed and the two values are of comparable size (for example the smaller at least half the larger), and refuse otherwise ("a single deviation, or a range?"). Add `12.00 –0.05`, `12.00 - 0.05`, `Ø6 – 0.1` to the refusal table.

### A-02 (high) Requirement rules: inch fractions are read as two limits

**Area:** the two-limits rule (`/` as a separator) in `readRequirement`.
**What is wrong:** A fractional inch dimension is read as a pair of limits from its numerator and denominator. "3/8" becomes "Limits 3 to 8", "Ø3/8 THRU" the same, "4X Ø1/4 THRU" 1 to 4, "R1/16" 1 to 16, "1/2 DEEP" 1 to 2, and "1 1/2" (a mixed number) becomes "Limits 2 to 11" (the space inside "1 1" is removed, see A-03). Fractions are routine on inch drawings (ASME Y14.5 permits them; older and smaller-shop prints use them widely), and the rules list doesn't mention them, so an inspector has no reason to expect it.
**Reproduction:** `bd-audit-model.ts`, group "fractions (inch)": `"1/2"` -> measured 1 .. 2; `"Ø3/8 THRU"` -> 3 .. 8; `"1 1/2"` -> 2 .. 11. (Threads such as "3/8-16 UNC-2B" are correctly attributes.)
**Suggested fix:** Refuse a slash between two whole numbers with no decimal point ("a fraction of an inch: type its limits"), or parse simple and mixed fractions as values (the arithmetic is already exact) and apply the title block's fractional tolerance if one is added. Either way, two limits should need decimal values on both sides.

### A-03 (high) Requirement rules: spaces inside a value are dropped, so separate numbers merge into one

**Area:** `written()` (model.ts line 260: `text.replace(/\s+/g, '')`), used for nominals, tolerances, deviations, both limits, MAX/MIN, and lone values; and `calloutNear`, which joins runs within one text height on the same baseline.
**What is wrong:** Any space inside a part is removed before parsing, so two neighbouring numbers are read as one. A flag-note number just after a dimension (common on aerospace prints: the triangle is drawn as lines, the digit is text) changes the value and its decimal places: "12.50" with a flag "3" is read off the drawing as "12.50 3" and then as 12.503 with the title block's 3-place tolerance. Other cases: "12.00 ±0.05 5" -> tolerance 0.055 (11.945 to 12.055); "R5 2" -> 52 (51.5 to 52.5); "2 12.00 ±0.05" -> 211.95 to 212.05; "12.05/11.95 2" -> 11.952 to 12.050; "0.5 1 MAX" -> up to 0.51. All are plausible-looking wrong limits with source "drawing" or "title block".
**Reproduction:** `sh .claude/scripts/qa.sh 280 bd-audit-callouts.ts`, "whitespace inside numbers" and "callouts": `calloutNear([box('12.50',100,100,30,10), box('3',134,100,6,10)], 110, 96, 20)` -> "12.50 3" -> measured 12.498..12.508, "from the title block (for 3 places, ±0.005)".
**Suggested fix:** In `written`, allow at most a space between a sign or a prefix and the digits (or between degrees, minutes, and seconds), and refuse a space between two digit groups. Add the cases above to the refusal table.

### A-04 (high) Reading the drawing: two plain values stacked within 1.7 text heights are read as limit dimensioning

**Area:** `calloutNear`, the "limit dimensioning" branch (model.ts lines 918-931).
**What is wrong:** Any other plain number of similar size directly above or below the clicked one, 0.8 to 1.7 text heights away and overlapping across, is joined as "upper/lower". That is also what ordinate dimensions on close features, hole and coordinate tables, and parallel dimension lines on a crowded drawing look like, so clicking one value of such a column gives limits spanning the two different dimensions: "10.00" over "15.00" is read as "10.00/15.00", "Limits 10.00 to 15.00", and any value from 10 to 15 passes. ASME's 6 mm spacing with 3.5 mm text is 1.71 heights, just outside the reach; 3 mm text on 5 mm spacing (1.67) or ordinate values 5 mm apart (1.43) are inside it.
**Reproduction:** `bd-audit-callouts.ts`, "callouts": three runs "10.00", "15.00", "20.00" 14 apart with height 10: a click on either of the first two -> "10.00/15.00" -> measured 10.00..15.00. Two dimensions 16 apart (1.6 heights) -> "25.00/40.00".
**Suggested fix:** Join a stacked pair only when it really looks like limit dimensioning: the two values within a few percent of each other (for example the difference no more than 5% of the larger, and having the same number of decimal places), and say "two stacked values read as limits: check them" in the reading. Otherwise read the clicked value alone.

### A-05 (medium) Reading the drawing: clicking stacked deviations reads them as limits ("0/-0.05" -> -0.05 to 0.00)

**Area:** `calloutNear` (limit-dimensioning branch, `PLAIN_NUMBER` allows a sign) and the two-limits rule (a "0" isn't "signed", so the "signed values with no nominal" refusal misses it).
**What is wrong:** For "Ø12" with deviations "0" over "-0.05", a click on the deviations (where they stick out to the right) reads "0/-0.05" and the rule gives "Limits -0.05 to 0.00". "+0.05/-0.00" is refused correctly, so it depends on whether one deviation is written as a bare 0. The limits are wrong (every real measurement then fails), and the requirement column says "0/-0.05".
**Reproduction:** `bd-audit-callouts.ts`: `[box('Ø12',100,100,18,10), box('0',120,95,4,6.5), box('-0.05',120,104,16,6.5)]`, click at 130,104 or 122,93 -> "0/-0.05" -> measured -0.05..0.00. Also `readRequirement('0/-0.05')` directly.
**Suggested fix:** When the clicked run is itself a deviation (signed, or "0" next to a larger value), look for the nominal before it on the line and read the whole callout; in the rules, refuse "0/-x" and "+x/0" with no nominal as the signed pairs are.

### A-06 (medium) Reading the drawing: a click at the end of a feature control frame reads only its datum letters, as a pass/fail note

**Area:** `calloutNear` (the seed is the nearest run; cells are joined forwards from it, and backwards only over a GD&T symbol) and the attribute rule ("no value: passed or failed").
**What is wrong:** Balloons usually go at the right-hand end of a frame. Clicking there in the example drawing reads "C", or "B C", and the reading is "A note or requirement without a value: passed or failed", so a position tolerance becomes a pass/fail attribute with no limits, and the checks don't list it under "Limits not read". This happens whether or not the frame's symbol is in the text layer.
**Reproduction:** `sh .claude/scripts/qa.sh 600 --route dist bd-audit-ui.cjs https://labs.local chromium`, step 4 (example drawing, frame from 525 to 645): click at 650,574 or 637,571 -> requirement "C"; at 612,571 or 593,571 -> "B C"; all "A note or requirement without a value: passed or failed." Model: `calloutNear(frame, 612, 597, 20)` -> "B C" (also with ⌖ in front).
**Suggested fix:** When the seed is a single capital letter or modifier that `cell()` accepts, walk back along the line over frame cells (up to the six-height gap) to the tolerance and the symbol before reading; and in `readRequirement`, refuse one to three lone capital letters ("datum letters only: read the whole frame") instead of calling them an attribute.

### A-07 (medium) Placement: two balloons for one callout land on exactly the same spot, and the first is hidden in the ballooned PDF

**Area:** `besideCallout` (model.ts line 943) and `place` (index.tsx line 499).
**What is wrong:** A balloon clicked onto a callout is moved to the nearest of eight fixed places around the callout, chosen clear of the sheet's text but not of other balloons. A callout with more than one characteristic (a hole callout with its depth, a 4X callout with a position, a composite frame) gets its second balloon at the very same point when clicked at the same spot, and overlapping when clicked a little apart. The exported PDF draws the later balloon's white disc over the earlier one, so its number is gone from the print while its row stays in Form 3.
**Reproduction:** `bd-audit-ui.cjs` step 3: on the example, "4X Ø8.5 THRU" clicked twice at 680,556 -> balloons 4 and 5 both at 680.0,541.4 (0.00 apart); a third click 20 to the right -> 20 apart. Rendered with macOS's renderer (`bd-audit-render.py out/bd-audit/chromium-dup-ballooned.pdf 690 545 out/bd-audit/dup-crop.png 45`): only "5" and "6" are visible; "4" is under "5". Model: `besideCallout` gives the same point for both clicks.
**Suggested fix:** Pass the sheet's existing balloons to `besideCallout` and treat them like text (no place within two radii of another balloon); if every place is taken, step further out. Separately, the checks could flag balloons that overlap each other.

### A-08 (high) Saving: opening a work file replaces the current balloons without asking, and they can't be undone or recovered

**Area:** `openFile` -> `openWorkFile` (index.tsx lines 299-333): the "Open X instead? The N balloons ... will be cleared" confirmation is only asked for a PDF.
**What is wrong:** Opening (or dropping) a work file replaces the work kept in this browser at once, whether it's an older save of the same drawing or another drawing's file. The undo history is cleared too, so typed results and balloons placed since that file was saved are lost for good. For a PDF the page asks first.
**Reproduction:** `sh .claude/scripts/qa.sh 300 --route dist bd-audit-workfile.cjs https://labs.local chromium`: no-text.pdf with 1 balloon, saved as a work file; 2 more balloons placed and a result and requirement typed; the work file opened -> "confirm shown: false; balloons now 1; undo enabled: false". Then 3 balloons on no-text.pdf and the example's work file opened -> "confirm shown: false; now 3 balloons on spacer-plate-example.pdf" (the no-text.pdf work is gone). A PDF of another drawing over the same work -> "confirm shown: true".
**Suggested fix:** Ask with the same confirmation bar before replacing work that has balloons, for a work file too, and say which is newer when it's the same drawing ("This file was saved with 1 balloon; there are 3 here now").

### A-09 (medium) Accessibility: focus is dropped to the page whenever the focused control is removed

**Area:** index.tsx: the editor's Delete button (the editor is re-keyed to the next balloon), the confirm bar's buttons, clearing, opening a drawing from the intro, deleting the last balloon from the list.
**What is wrong:** In each case the focused element unmounts and nothing receives focus, so a keyboard or screen-reader user is sent back to the top of the page (the next Tab goes to the site header). The brief's own failure mode 12 and the Comp Desk lesson call for focus to move at once.
**Reproduction:** `bd-audit-ui.cjs` step 2, Brave and WebKit alike: editor Delete pressed with Enter -> focus on `body`; confirm bar "Keep what’s here" -> `body`; "Clear everything" confirmed -> `body` (intro shown); a drawing opened from "Open a drawing (PDF)" -> `body`; the only balloon deleted with Delete in the list -> `body`.
**Suggested fix:** After Delete in the editor, focus the new selection's first field (or the list); after the confirm bar closes, return focus to the button that opened it; after clearing, focus "Open a drawing (PDF)"; after a drawing opens, focus the drawing (or its heading); after the last balloon goes, focus the drawing.

### A-10 (medium) Results: a "4X" characteristic passes with one value, and the checks don't ask for the rest

**Area:** `evaluateWith` and `checks` (model.ts lines 512-555, 738-755).
**What is wrong:** The reading keeps the count ("For 4 features: enter each one’s value in the result") but nothing uses it: one value for four holes is judged Pass, the characteristic isn't listed under "Results to enter", and with everything else filled the checks say "Every characteristic has a requirement, limits or a pass or fail, and its results; none failed." That reassures an inspector that the table is complete when three holes were never measured.
**Reproduction:** `bd-audit-ui.cjs` step 7 (both engines): on the example, "4X Ø8.5 THRU" (title block ±0.1) with result "8.5" -> row "4 | 4X Ø8.5 THRU | 8.5 | Pass"; "Results to enter" doesn't list 4. Model: `evaluate(ball('4X Ø6.0 ±0.1', ['6.0']), S, 1)` -> pass.
**Suggested fix:** When the count is more than 1 and a piece has fewer values than the count, make that piece "open" (or a distinct "incomplete" status) and list it under "Results to enter" ("1 of 4 values"); allow one value only when the inspector says it covers all (or N/A).

### A-11 (medium) Display: with decimal commas on, the list shows a result as two values ("200,04" as "200, 04")

**Area:** `Row` in index.tsx (line 1114: `resultText(r, false)`, the comma setting not passed).
**What is wrong:** The characteristic list always formats results as if commas separate values, so "200,04" is shown as "200, 04", which reads as two values (200 and 4) on the screen an inspector checks entries against. The CSV and print use the setting and are right.
**Reproduction:** `bd-audit-ui.cjs` step 5 (both engines): decimal commas on, requirement "200,0 ±0,1", result "200,04" -> list row "1 | 200,0 ±0,1 | 200, 04 | Pass".
**Suggested fix:** Pass `work.comma` through `CharacteristicList` to `Row` and call `resultText(r, comma)` (and show only the first `pieces` results there, as the CSV does).

### A-12 (low) Settings: the zone count fields can't be cleared to type a new number (8 becomes 16)

**Area:** SettingsPanel, "Columns (numbers)" and "Rows (letters)" (index.tsx lines 1411, 1415).
**What is wrong:** An empty field is turned into 1 at once, so Backspace then a digit gives "1" followed by the digit: changing 8 columns to 6 that way gives 16, which is accepted and silently changes every balloon's zone on that sheet.
**Reproduction:** `bd-audit-ui.cjs` step 6 (both engines): columns 8, End, Backspace, type "6" -> field "16", saved columns 16.
**Suggested fix:** Keep the field's text in local state and apply it on blur or Enter (as the frame percentages already do), refusing out-of-range values with a message.

### A-13 (low) Accessibility: the confirm bar ignores Escape and puts focus on the destructive button

**Area:** the `role="alertdialog"` bar (index.tsx lines 1001-1028).
**What is wrong:** Escape doesn't dismiss it, and `autoFocus` is on "Clear everything" / "Open it", so Enter pressed twice (for example a key repeat on the button that opened it) clears everything or replaces the work without a chance to read the warning that it can't be undone.
**Reproduction:** `bd-audit-ui.cjs` step 2c: Escape on the bar -> "bar still shown: true". Step 2e shows two Enter presses (open the bar, confirm) clear everything.
**Suggested fix:** Handle Escape as "Keep what’s here", focus "Keep what’s here" by default for the clear and replace cases, and return focus afterwards (see A-09).

### A-14 (medium) Requirement rules: only the first segment of a composite or stacked frame is read, and nothing says the rest was dropped

**Area:** the GD&T rule in `readRequirement` (the first number after the symbol is the tolerance; everything after it is ignored apart from the modifier test).
**What is wrong:** A composite position frame typed or read on one line, "⌖ Ø0.5 Ⓜ A B C ⌖ Ø0.1 Ⓜ A", is read as "Position: a deviation of up to 0.5" with only the bonus note, so a pattern that fails its 0.1 refinement passes. Two frames on one line, "⏥ 0.05 ⌓ 0.1", read as flatness 0.05 alone. A per-unit tolerance, "⏤ 0.05/25" or "⏥ 0.1/25X25", is read as 0 to 0.05 with no mention of the unit length. None of these is refused or flagged, so the reading looks complete.
**Reproduction:** `sh .claude/scripts/qa.sh 120 bd-audit-model.ts`, group "gdt": the four strings above -> measured 0..0.5, 0..0.05, 0..0.05, 0..0.1, notes empty except the modifier note.
**Suggested fix:** After the tolerance, refuse (or add a note and a "check this" status to) a second GD&T symbol, a second tolerance value, or a "/<length>" right after the tolerance: "a composite or per-unit frame: balloon each segment and type its limits".

### A-15 (low) Requirement rules: a surface finish with µm or µin is refused

**Area:** the surface-finish pattern in `readRequirement`, run on `original.toUpperCase()`.
**What is wrong:** Upper-casing turns µ (U+00B5) and μ (U+03BC) into Greek capital Mu (U+039C), which the pattern's `µM|µIN` doesn't match, so the most common way of writing a finish with its unit is refused: "Ra 1.6 µm", "Ra 1.6µm", "Ra 1.6 μm", "Rz 6.3 µm", and "Ra 63 µin" all give "Couldn't tell the limits from this". (Safe, but every such finish has to be typed by hand.) "Ra 1.6 UM" and "Ra 1.6 MICRONS" are read.
**Reproduction:** `bd-audit-model.ts`, group "finish".
**Suggested fix:** Map µ and μ to "U" (or match U+039C) in `normalize` before upper-casing, and add those strings to the cases.

### A-16 (low) Requirement rules: counts are handled differently by case and by what follows

**Area:** `count()` (accepts only a capital X in the text the fit rule sees) and the chamfer test (runs before the count).
**What is wrong:** (1) "4X Ø12 H7" is a fit (an attribute) but "4x Ø12 H7" is "Couldn't tell the limits": the fit rule calls `count(original)` on the text before upper-casing, whose pattern only knows a capital X. (2) "4X 90°" and "2X 45°" are refused as "A chamfer (a size and an angle), or a count with an angle", so four 90° angles can't take the title block's angle tolerance, while "90° TYP" and "30° 4 PLCS" can. (3) "4X12" and "1.5X2" are read as "A fit (X12)" and "A fit (X2)", attributes checked with gauges.
**Reproduction:** `bd-audit-model.ts`, group "counts": "4x Ø12 H7" -> unread, "4X Ø12 H7" -> attribute; "4X 90°" with the title block's angle set -> unread (chamfer message); "4X12" -> attribute "A fit (X12)".
**Suggested fix:** Upper-case before the fit rule's count; read "<n>X <angle>" as a count when there is no size before the X (a chamfer has a size and an angle on either side of the X); don't accept X (or any letter right after a count-like "<n>X") as a fit letter.

### A-17 (low) Requirement rules: refusals that name the wrong thing

**Area:** the GD&T word list (matched at the start of any requirement) and the single-deviation message.
**What is wrong:** Notes that start with a GD&T word are refused with a message calling them a GD&T callout: "ROUND ALL EDGES R0.5" -> "Read as circularity, but no tolerance value follows it"; "FLAT WITHIN 0.1" -> flatness; "PARALLEL TO A 0.05" -> parallelism; "STRAIGHT KNURL 0.8 PITCH" -> straightness. "POS 1 HOLE" is read as "Position: a deviation of up to 1". A finish range "Ra 1.6 - 3.2" is refused with "Only one deviation: write both (12.00 +0/-0.05)". An inspector reading these is told something about the drawing that isn't so.
**Reproduction:** `bd-audit-model.ts`, groups "gdt" and "finish".
**Suggested fix:** Require a number (after an optional Ø) straight after a GD&T word for it to count as GD&T, and otherwise fall through to the other rules; give the single-deviation message only when the text before the sign is a single value.

### A-18 (low) Requirement rules: two "limits" of very different size are accepted, as in dual dimensioning

**Area:** the two-limits rule.
**What is wrong:** Any two unsigned values joined by "/", "TO", or a spaced hyphen are taken as limits, however far apart: dual dimensioning written with a slash ("25.40/1.000", millimetres over inches) is read as "Limits 1.000 to 25.400", and anything between passes. (A-01, A-02, and A-04 are other routes into the same rule; this one is a requirement written that way, not a misread of the text layer.)
**Reproduction:** `bd-audit-model.ts`, group "dual and stacked": `"25.40/1.000"` -> measured 1.000 .. 25.400. `"10.00/15.00"` -> 10.00 .. 15.00.
**Suggested fix:** The size check suggested in A-04 (two limits must be close to each other relative to their size, and written to the same decimal places) also covers this; refuse with "two values that don't look like limits of one dimension".

### A-19 (medium) Ballooned PDF: a balloon placed over one of the drawing's annotations shows on the page but is hidden in the export

**Area:** `balloonedPdf` (exportPdf.ts): balloons are appended to the page's content stream, and every PDF viewer draws annotations (comments, stamps, form fields) above the content.
**What is wrong:** Customer drawings often carry review annotations: stamps, comment boxes, filled title-block fields. pdf.js draws them into the page's canvas, and the page draws its balloons above that, so a balloon placed over a white-filled comment or stamp looks fine while ballooning; in the ballooned PDF the annotation covers it and its number disappears from the print, while its row stays in Form 3. (A rebuilt copy is unaffected: there the annotations are flattened into the image under the balloons.)
**Reproduction:** `bd-audit-fixtures.py` writes `out/bd-audit-fixtures/annots.pdf` (a Square annotation with a white interior over an empty area, a FreeText comment, a filled text field). `sh .claude/scripts/qa.sh 900 --route dist bd-audit-export.cjs https://labs.local chromium annots.pdf` places a balloon in the square at 800,555 (stored at 800.00,555.01; visible in the page) and exports. pypdf: both balloons are circles at their points, the 3 annotations and the field kept. Drawn by pdf.js (`bd-audit-pixels.cjs ... chromium-annots-ballooned.pdf 1191 842 308,388.4 800,555.01`): the balloon beside the text has red pixels (10.9%), the one in the square 0 of 64.
**Suggested fix:** Draw the balloons as the top layer: add them as a Stamp or FreeText annotation with an appearance stream appended after the page's existing annotations (and flagged as printable), or flatten annotations into the page before adding balloons. At the least, warn when a balloon falls inside an annotation's rectangle.

### A-20 (medium) Ballooned PDF: a rebuilt copy of a many-sheet protected drawing freezes the page for many seconds

**Area:** the rebuilt-copy path of `balloonedPdf` (one PNG of about 3300 x 2300 pixels per sheet, embedded and compressed by pdf-lib on the main thread).
**What is wrong:** With a protected drawing at the stated limit of 100 sheets, the export takes 36 s and the page stops responding for up to 16.5 s at a stretch (60 sheets: 22 s, up to 9.4 s frozen in Brave and 6.8 s in WebKit), with no progress shown ("Writing the PDF…" only). The brief's failure mode 7 says the page never locks up; the 100-sheet check in bd-files.cjs used an unprotected file, which takes the fast vector path. The renderer's memory rose from 195 MB to 563 MB, which is a risk on a phone.
**Reproduction:** `sh .claude/scripts/qa.sh 300 bd-audit-fixtures2.py` (writes `locked-100.pdf`, owner password only), then `sh .claude/scripts/qa.sh 900 --route dist bd-audit-memory.cjs https://labs.local locked-100.pdf` -> "export done in 36212 ms (3.8 MB); crashed: false; renderer RSS 195 MB before, 563 MB at peak; the page answered within 16483 ms at worst". `bd-audit-big.cjs` gives the 60-sheet figures in both engines.
**Suggested fix:** Show progress sheet by sheet and yield between sheets; embed each sheet as a JPEG (`embedJpg`, which pdf-lib passes through without re-compressing) or pre-compressed data rather than a PNG that pdf-lib decodes and deflates again at save; consider building the rebuilt copy in a worker.

### A-21 (medium) Offline: a drawing with Chinese, Japanese, or Korean fonts opened for the first time offline is drawn with that text missing, and nothing says so

**Area:** pdf.ts (`warmUp` leaves the 168 character maps to be fetched on demand) and the page's claim "Once you’ve opened a drawing here, the page works with the network turned off".
**What is wrong:** After the example has been opened online (the decoders and standard fonts are then kept), a CJK drawing opened offline for the first time fails to load its character map; pdf.js leaves out every run in that font. The page shows the sheet without those dimensions, reads no text there, and gives no message, so an inspector could balloon a drawing with characteristics silently missing. Same in Brave and WebKit.
**Reproduction:** with the built site served (`sh .claude/scripts/qa.sh 1500 bd-audit-serve.cjs ../../dist 4176 1480` in the background), `sh .claude/scripts/qa.sh 600 bd-audit-offline.cjs chromium` (and `webkit`), case B: `out/bd-fixtures/cjk.pdf` offline -> ink 57 (48 in WebKit), text beside "寸法 12.00 ±0.05" read "", failed request `/assets/UniJIS-UCS2-H-2DbZ0MaQ.bcmap`; screenshot `out/bd-audit-chromium-offline-cjk.png` shows only "45.0 MAX" (the Helvetica run). ICC-colour and CMYK images opened the same way are fine.
**Suggested fix:** Fetch the commonly used character maps (the Adobe-Japan1, GB1, CNS1, and Korea1 UCS2 and Identity ones) in `warmUp`, or all 168 (they are small) at low priority; and when pdf.js reports a font or character map it couldn't load, say on the page that some of the drawing's text couldn't be drawn. Narrow the offline claim if not all of them are kept.

### A-22 (low) Ballooned PDF: a page whose /Rotate isn't a multiple of 90 gets its numbers drawn tilted

**Area:** `balloonedPdf` uses pdf-lib's raw `getRotation().angle`; pdf.js (and other readers) treat such a value as 0.
**What is wrong:** For a malformed /Rotate 45 the page is shown unrotated, but each balloon's number is drawn turned 45°.
**Reproduction:** `bd-audit-fixtures.py` -> `rotate-45.pdf`; `bd-audit-export.cjs` then `sh .claude/scripts/qa.sh 300 bd-audit-verify.py chromium`: "number turned 45° (page /Rotate 45, effective 45, pdf.js uses 0)". Inherited /Rotate (on /Pages) and /Rotate -90 are handled correctly.
**Suggested fix:** Use the rotation pdf.js reports for the page (`page.rotate`), or normalise the same way (not a multiple of 90 -> 0).

### A-23 (high) Two tabs: when another tab opens a drawing this browser can't keep, this tab shows the old drawing with the new drawing's balloons, saves new balloons into the wrong work, and exports a mixed-up PDF

**Area:** the `useOtherTabs` adopt callback (index.tsx lines 162-173) and `loadKept` (lines 276-287): on another tab's change of drawing, `setWork(next)` happens at once, and if the new drawing isn't in IndexedDB, `loadKept` only sets the phase to 'missing', which is shown only when no drawing is open. `doc`, `bytes`, and `sheets` stay the old drawing's.
**What is wrong:** Tab 1 has drawing A; tab 2 opens drawing B, and this browser won't keep B (IndexedDB full or refused, the case the page itself warns about with "it may be too big"). Tab 1 then shows A's sheet with B's name, sheet count, and (empty) balloon list; a balloon clicked on A's sheet is saved into B's work; and "Ballooned PDF" downloads "B-ballooned.pdf" made from A's pages (rebuilt from images because the page counts differ) with B's balloons. Nothing on the page says anything is wrong.
**Reproduction:** `sh .claude/scripts/qa.sh 600 --route dist bd-audit-storage.cjs https://labs.local chromium` (and `webkit`), case 3: tab 1 opens the example; tab 2 (whose `IDBObjectStore.put` throws QuotaExceededError) opens `no-text.pdf` and confirms. Tab 1: "work is now no-text.pdf (0 balloons, 1 sheet), its toolbar says "no-text.pdf", its canvas" still the example (screenshot `out/bd-audit-webkit-two-tabs.png`: the spacer plate under the name no-text.pdf); a click on it is "saved into no-text.pdf's work (1 balloons)"; the export "no-text-ballooned.pdf" is one page holding an image of the example's sheet 1.
**Suggested fix:** In the adopt callback, when the other tab's work is for another drawing, close this tab's drawing first (`closeDrawing`-like, keeping the new work) and only then try `loadKept`, so 'missing' shows the "Open the drawing again" screen; never let `work.docId` differ from the open document's fingerprint (check it in `place`, the exports, and the save).

### A-24 (high) Saving: with the drawing missing, "Try the example drawing" replaces the kept balloons without asking

**Area:** the intro when `phase === 'missing'` (index.tsx lines 707-727) and `tryExample` (line 335), which calls `openDrawing` with the example's prepared work.
**What is wrong:** When the browser has the balloons but not the drawing (IndexedDB evicted or refused, or a drawing too big to keep), the intro says "Your N balloons on X are kept ... Open the same file again" and offers "Try the example drawing" beside "Open the drawing again". One click on the example replaces the kept balloons, typed results included, with the example's three, with no confirmation and no undo.
**Reproduction:** `bd-audit-storage.cjs` case 2b (both engines): IndexedDB refused, the example opened and reloaded (drawing missing), a fourth balloon with "MY OWN WORK 1.00 ±0.01" written to the saved work from the homepage, the page reopened, "Try the example drawing" clicked -> "confirm shown: false; balloons now 3, "MY OWN WORK" kept: false".
**Suggested fix:** Use the same confirmation as for another PDF ("The N balloons on X will be cleared from this browser; save your work as a file first") whenever kept work has balloons, or hide the example button in the 'missing' state.

### A-25 (medium) CSV: with decimal commas on, the limit columns are written with decimal points

**Area:** `form3Csv` (model.ts line 788: `formatQ`/`formatAngle` always use a point) and `resultText` (values within a piece joined with "; ").
**What is wrong:** A user who turns on decimal commas gets requirements and results with commas but "Lower limit" and "Upper limit" with points ("200,0 ±0,1" beside 199.9 and 200.1; "45° ±0,5°" beside 44.5° and 45.5°). A spreadsheet set to decimal commas reads those cells as text, or turns some into dates (12.05 is 12 May in a German locale), so the limits column can't be compared or sorted. The Results cell is also ambiguous there, because pieces and values are both separated by "; ": "1: 200,04; 2: 200,06; 200,08".
**Reproduction:** `sh .claude/scripts/qa.sh 600 --route dist bd-audit-csv.cjs https://labs.local chromium`: decimal commas on, 2 pieces; row 1 is `1,"Sheet 1, E4",,"200,0 ±0,1","1: 200,04; 2: 200,06; 200,08",,,,199.9,200.1,Pass,"200,04","200,06; 200,08"`; row 3 `...,"45° ±0,5°","1: 45,2",,,,44.5°,45.5°,Open,...`.
**Suggested fix:** Format limits with the work's decimal mark (and the editor's and printed limits too, for consistency); separate pieces in the Results cell with something that can't occur inside a value list (" | " or a line break), or leave per-piece detail to the Piece columns.

### A-26 (low) Work files: a file whose sheet count disagrees with its drawing opens with sheets that don't exist, and the export then fails

**Area:** `openDrawing(pdf, w.name, w)` with prepared work (index.tsx line 249: `prepared ?? ...` keeps the file's `sheets` instead of `d.numPages`); `readWork` accepts balloons up to the file's own count.
**What is wrong:** A hand-edited or damaged work file that says 5 sheets for a 2-sheet drawing opens with "1 of 5 ... 5 of 5" in the sheet menu and a balloon on sheet 5; the ballooned PDF then fails with "The ballooned PDF couldn’t be written: Invalid page request." The fingerprint check passes because the drawing itself is right.
**Reproduction:** `bd-audit-csv.cjs`, "sheets.json": sheet menu "1 of 5, 2 of 5, 3 of 5, 4 of 5, 5 of 5"; export -> "Invalid page request".
**Suggested fix:** Take the sheet count from the opened document, and drop (and count, as `dropped` does) balloons and zones on sheets it doesn't have.

### A-27 (low) Saving: text longer than the saved-work limits is cut off silently on reload

**Area:** `readWork`/`readBalloon` cap each field (`str(v, max)`: comments 2,000 characters, tooling 500, nonconformance number and designator 200, typed limits 100, header fields 200, title block tolerances 50) but the inputs have no `maxLength`, so more can be typed and is saved in full, then cut when read back.
**What is wrong:** A long comment (2,600 characters) comes back as 2,000 after a reload, with no message; with two tabs open the other tab reads the cut version at once. The intro promises "a reload loses nothing". (A typed limit is cut at 100 characters, which changes its value, but no real limit is that long.)
**Reproduction:** `sh .claude/scripts/qa.sh 300 --route dist bd-audit-caps.cjs https://labs.local chromium`: saved lengths `{"remarks":2600,"nc":260,"tooling":620,"designator":230,"lower":124,"part":240}`; after a reload `{"remarks":2000,"nc":200,"tooling":500,"designator":200,"lower":100,"part":200}`.
**Suggested fix:** Give each input the same `maxLength` as `readWork` uses (or raise the caps well above anything typed, keeping them only as a guard against damaged data).

### A-28 (low) Offline: after a first visit that opened no drawing, the ballooned PDF fails offline with a technical message

**Area:** index.tsx line 292 fetches pdf.js 2.5 s after the page loads "so the site's offline copy has it after one visit", but `warmUpWriter` (pdf-lib) runs only once a drawing has been opened.
**What is wrong:** A visit that only looks at the page leaves pdf.js but not pdf-lib in the offline copy. Offline, a drawing then opens and can be ballooned, but "Ballooned PDF" says "The ballooned PDF couldn’t be written: Failed to fetch dynamically imported module: http://localhost:4176/assets/es-DawnZXYc.js" (WebKit: "Importing a module script failed."). The CSV still works. The page's claim is only for "once you’ve opened a drawing here", so this is about the half-ready state and the message.
**Reproduction:** with `bd-audit-serve.cjs` running, `sh .claude/scripts/qa.sh 300 bd-audit-offline2.cjs chromium` (and `webkit`).
**Suggested fix:** Warm pdf-lib at the same moment as pdf.js; when a dynamic import fails offline, say "This needs a connection once: open the page online to keep the PDF writer for offline use".

### A-29 (low) Wording: "nothing you open or type on this page goes over the network" is stronger than what happens

**Area:** the intro's privacy paragraph (index.tsx lines 703-706).
**What is wrong:** The drawing itself is never sent, and that checks out (see "Checked and found sound"). But the page requests its own data files according to what the drawing contains: a drawing with Japanese text makes the page request `/assets/UniJIS-UCS2-H-2DbZ0MaQ.bcmap` from the site, so the site's host can see which character set a drawing uses. That's not the drawing, but "nothing you open ... goes over the network" is literally untrue, and an export-control reader takes such sentences literally.
**Reproduction:** `bd-audit-offline.cjs` case B (`cjk.pdf`): "failed requests: /assets/UniJIS-UCS2-H-2DbZ0MaQ.bcmap" (attempted because of the drawing's font; online it is fetched from the site).
**Suggested fix:** Say what's true: "The drawing and what you type are never sent anywhere. The page may download its own font and decoder files from this site when a drawing needs them, and keeps them for offline use." Fetching all character maps ahead (A-21) would also make the requests independent of the drawing.

### A-30 (medium) Placement: a balloon moved after changing sheet keeps its old sheet but takes the new sheet's coordinates, landing off the sheet

**Area:** `moveBalloon` (index.tsx line 518) updates only `x` and `y`; the Viewer converts the click with the sheet now shown. The "Click or tap where the balloon should go" bar stays up when the sheet changes, and Shift+Enter from the keyboard takes the same path.
**What is wrong:** Select balloon 1 (sheet 1), press "Move on the drawing", go to sheet 2, click: balloon 1 stays on sheet 1 with sheet 2's user-space point (168,1012 on a sheet 842 high), so it's drawn outside sheet 1, invisible in the page and in the ballooned PDF, while its row stays in the table with a reference location computed from that point.
**Reproduction:** `sh .claude/scripts/qa.sh 300 --route dist bd-audit-move.cjs https://labs.local chromium` (and `webkit`): "a click on sheet 2 -> balloon 1 now on sheet 1 at 168,1012 (sheet 1 is 1191 x 842)"; "on sheet 1 the balloon is drawn outside the sheet".
**Suggested fix:** Move it to the sheet where it's put (`updateBalloon(list, id, { sheet, x, y })`), or end the move mode on a sheet change; and refuse saved or moved points outside the sheet's box.

### A-31 (low) Settings: zone edits that can't be undone, an emptied frame field read as 0%, and a checkbox that hides itself

**Area:** SettingsPanel's zones section (index.tsx lines 1399-1474) and undo, which covers only the balloons.
**What is wrong:** (1) "Use these zones on every sheet" overwrites every other sheet's grid, and unchecking "This sheet has zones" discards the sheet's frame, with Undo disabled, so a misclick loses a carefully set frame on every sheet and silently changes every balloon's reference location there. (2) Emptying a frame percentage and leaving the field sets that edge to 0 (`Number("")` is 0) instead of keeping the old value. (3) The section's `open` follows whether the sheet has zones, so unchecking the box closes the section around it: the checkbox the user just pressed disappears (keyboard focus is left on a hidden control) and the section has to be reopened to check it again.
**Reproduction:** `sh .claude/scripts/qa.sh 300 --route dist bd-audit-zones.cjs https://labs.local chromium`: "left % emptied and left: saved left 0 (was 0.0336)"; "sheet 2 had 8 columns; "Use these zones on every sheet" -> sheet 2 now 12 columns; Undo enabled: false"; after unchecking, `getByLabel(/This sheet has zones/)` -> "element is not visible".
**Suggested fix:** Put zone changes on the undo history (or confirm "Use these zones on every sheet" when other sheets have their own); treat an empty or unreadable percentage as "keep the old value"; open the section by default when zones exist but don't close it when they're removed.

### A-32 (low) Requirement rules: East Asian spellings: a full-width dimension is called a note, and φ isn't a diameter sign

**Area:** `normalize` (NFC, not NFKC; φ/Φ not mapped; directional marks not removed) and the last rule (`/\d/` matches only ASCII digits).
**What is wrong:** A dimension in full-width characters is read as a note: "Ｒ５" -> "A note or requirement without a value: passed or failed" (an attribute, so it drops out of "Limits not read"). Japanese and Chinese drawings commonly write the diameter as φ: "φ12 ±0.05" and "Φ12 H7" are refused where "Ø12 ±0.05" and "Ø12 H7" are read. A left-to-right mark after a value (from text extracted near right-to-left labels) makes "12.00 ±0.05" unreadable. The refusals are safe; the attribute isn't.
**Reproduction:** `sh .claude/scripts/qa.sh 60 bd-audit-unicode.ts`: "Ｒ５" -> attribute; "φ12 ±0.05" -> unread; "１２.００ ±０.０５" -> unread; "12.00 ±0.05‎" -> unread.
**Suggested fix:** Normalise with NFKC (full-width digits, letters, and signs become ASCII), map φ/Φ to Ø, strip U+200E/U+200F and the bidi controls with the other zero-width characters, and test for any digit (`\p{Nd}` with the u flag) before calling a requirement a note without a value.

## Suggestions (not verified defects)

- **S-1 Phone keyboards for results.** Result fields use `inputmode="decimal"` even for a "4X" characteristic (placeholder "Each value, spaced") and for measured ones that may need N/A; the limit fields too. On an iPhone the decimal pad has digits and a decimal mark only (no space, minus, or letters), so several values, a negative limit, or "N/A" can't be typed. That's Apple's documented keypad; not checked on a device. Consider `inputmode="text"` when the count is above 1, and an N/A button for measured characteristics.
- **S-2 CSV for decimal-comma spreadsheets.** The file is always comma-separated; a spreadsheet in a decimal-comma locale (list separator ";") is likely to open it in one column. Not checked in Excel. Consider ";" when decimal commas are on.
- **S-3 Signed drawings.** pdf-lib rewrites the whole file, so a digitally signed drawing's signature will show as broken in the ballooned copy (no signed fixture was made). Worth a sentence in the export notice, or an incremental save.
- **S-4 Rebuilt copies of large sheets.** The 16-million-pixel cap meant for phones also applies on desktops: an A0 copy is rebuilt at 102 dpi (verified: 4755 x 3364 pixels; 5 pt text still legible), an A1 at about 145. "It looks the same" overstates that; a desktop browser could take more pixels.
- **S-5 A fit's limits read alone.** "(12.000/12.018)" on its own is a reference by the brackets rule, so if a fit and its bracketed limits are separate runs farther apart than the join gap, the click reads "not measured".
- **S-6 Reading order.** Bands of a fortieth of the height order two balloons a hair apart by band rather than left to right (model: a at 0.101, b at 0.124, c at 0.126 of the height give b, a, c). Clustering by vertical overlap, or numbering by zone, may match what customers expect.
- **S-7 Two tabs and the delayed save.** Above 200 balloons the save waits 400 ms after the last change; a change taken up from another tab in that window replaces this tab's unsaved typing (from reading `useOtherTabs` and the save effect; not reproduced).
- **S-8 Keyboard edge cases.** Shift+Enter with no balloon selected places a new balloon (verified), though the drawing's label says it moves the selected one. Deleting the selected balloon while "Move on the drawing" is active leaves the move on for the next balloon (from reading; not reproduced).
- **S-9 Renumber input.** Enter with letters, a minus, or a decimal does nothing and says nothing.
- **S-10 Read limits shown as placeholders.** In "Type the limits instead" the read limits are placeholders, which in dark mode look much like typed values.
- **S-11 Target size.** The collapsible sections' summaries are 20 px tall (WCAG 2.5.8's 24 px minimum; the spacing exception probably applies).
- **S-12 Service-worker trim cost.** Past 150 cached files, every network fetch runs `neededFiles`, which re-reads every cached page and script (pdf.js's worker is 1.3 MB) to protect the 185 data files the Ballooned Drawing chunk names. Worth timing on a phone with a full cache.
- **S-13 Protected files.** A file whose owner forbids changes gets a changed copy rebuilt from images. That is what an inspector needs, but the notice could say plainly that the original is untouched and the copy is made from pictures of a protected file.
- **S-14 An overlap and off-sheet check.** A check for balloons that overlap each other or lie outside their sheet would catch A-07, A-30, and damaged work files in one place.

## Checked and found sound

- **Requirement rules (model probes `bd-audit-model.ts`, `bd-audit-callouts.ts`, `bd-audit-unicode.ts`):** ⌀ Ø ø ∅, º ˚, primes, non-breaking and thin spaces, zero-width spaces; inch marks versus arc-seconds; degrees, minutes, and seconds; title block tolerances by decimal places (trailing zeros, leading dots, whole numbers, 4 places; 5 refused); counts before and after (4X, 4 PLCS, (2X), 4 HOLES); chamfers refused; MAX and MIN with prefixes and trailing words; the GD&T symbols and words, with modifiers noted; finishes without µ; metric, unified, NPT, and BSPP threads; fits with and without their limits; reference and basic forms; two limits by "/", "TO", a spaced hyphen, or an en dash between unsigned values; an unspaced hyphen refused; signed pairs with no nominal refused; decimal commas, with thousands separators refused; typed limits (either or both, reversed refused, angles).
- **Pass and fail:** values exactly at a limit pass, just outside fail; several values and pieces; N/A; attributes (any letter case); unreadable values ("12.00.", "1e1", "Ø12.01", "12,01" without decimal commas) flagged; negative GD&T deviations fail; angles in minutes at the limit.
- **No regex pathologies:** 200,000-character requirements in 16 adversarial shapes each read in under 70 ms.
- **CSV:** byte order mark, CRLF, quoting of commas, quotes, and line breaks; formula defusal of =, +, -, @ and tab-led formulas in every free-text column; plain negative numbers kept as numbers.
- **Work files:** bad JSON, another format, a mismatched drawing, and a truncated drawing are each refused with a message and the current work untouched; a 48 MB work file (36 MB drawing) is saved in about 1 s and reopened in about 0.3 s in both engines.
- **A 36 MB drawing:** opens in under 1 s, is kept in IndexedDB and comes back after a reload, exports in under 0.4 s (both engines).
- **The ballooned PDF with unusual files (both engines, read back with pypdf):** /Rotate inherited from the page tree and /Rotate -90 (numbers turned right); UserUnit 2 (clicks land exactly; /UserUnit kept); an incremental update (the latest revision, the right page count); a cross-reference table with every offset wrong; object streams with a cross-reference stream; ICC-based and CMYK images; annotations and form fields kept. Rebuilt copies: every sheet one image, each balloon exactly at its point as shown, annotations flattened under the balloons.
- **Offline:** after one visit with a drawing opened, the offline copy holds pdf.js, its worker, pdf-lib, both scan decoders, and the 14 standard fonts; ICC-based and CMYK images open offline with no requests; nothing is ever requested outside the site.
- **Storage refused:** localStorage that throws on access (NotSaving shown, no errors); IndexedDB refused (message shown; after a reload the "Open the drawing again" screen).
- **Security:** a PDF with an OpenAction script, a JavaScript link, a `javascript:` URI, an XFA packet, and text such as `<img src=x onerror=alert(1)>` and `</textarea><script>`, opened under the file name `"><img src=x onerror=alert(5)>.pdf`: no dialogs, no requests, no markup created (the text appears literally in the list, editor, live region, printed table, and CSV). The source has no `innerHTML`, `eval`, or `new Function`; pdf.js 6.4.299 has no `isEvalSupported` path; a PDF can only choose data files from the built-in map.
- **Phone and touch at 375 and 320 px, light and dark, both engines:** no sideways overflow, nothing cut off or overlapping, axe clean; a finger dragged over the zoomed drawing pans and places nothing; a tap places; a finger drag on a balloon doesn't move it (by design: "Move on the drawing").
- **Dark and light mode:** axe clean with every row status, a selected failed row, the moving bar, the confirm bar, the drawing-not-kept notice, and the 'missing' intro (both engines); the printed table is black on white in dark mode.
- **Speed with 2,000 balloons (both engines):** typing a title block tolerance (every reading redone) 209 to 283 ms for 4 keys; decimal commas on or off under 100 ms; renumbering in reading order, undo, and delete under 450 ms, never more than about 0.4 s unresponsive.

## Summary

32 findings: 7 high (A-01, A-02, A-03, A-04, A-08, A-23, A-24), 12 medium (A-05, A-06, A-07, A-09, A-10, A-11, A-14, A-19, A-20, A-21, A-25, A-30), 13 low (A-12, A-13, A-15, A-16, A-17, A-18, A-22, A-26, A-27, A-28, A-29, A-31, A-32); 14 suggestions. Probes: `.claude/qa/bd-audit-*` (fixtures in `.claude/qa/out/bd-audit-fixtures/`, outputs in `.claude/qa/out/bd-audit*/`).

## Verification and fixes (main session, 2026-10-16)

Each finding was reproduced by its own probe against the unchanged build (69d040e), fixed, and then checked again by the same probe against the fixed build, and by a regression check added to the factory's own harnesses (the model test `ballooned-drawing-test.ts` with the independent generator `ballooned-drawing-check.py`, the browser flow `bd-flow.cjs`, the fixtures `bd-files.cjs`, `bd-annots.cjs`, and the offline check `bd-offline.cjs`). None was rejected as not a defect. Where the fix differs from the suggestion, the reason is given.

| Finding | Fix | Checked by |
|---|---|---|
| A-01 dashes and spaced minus signs | A dash with a space before it and none after is a minus; two values whose smaller is under half the larger aren't limits, in either order ("12.00 - 0.05", "12 – 0.5" refused) | model and generator cases |
| A-02 inch fractions | Refused with their own message ("3/8", "1 1/2", "R1/16", "4X Ø1/4 THRU"); fractions as values would need a fractions tolerance in the title block, left out | model and generator cases |
| A-03 spaces inside a value | A space between two digit groups is refused ("12.50 3", "R5 2", "0.5 1 MAX"); after a sign, and between degrees, minutes, and seconds, still allowed | model and generator cases; callout probe |
| A-04 stacked values as limits | Joined only when exactly two, the larger on top, the same decimal places, within a quarter of each other, and no third value stacked the same way | model cases (columns, far apart, smaller on top, different places) |
| A-05 deviations clicked | A click on stacked deviations reads the whole callout from its nominal; "0/-0.05" and "-0.05/0" alone refused; a lone signed value or 0 refused | model cases; callout probe |
| A-06 datum letters clicked | A click at the datum letters walks back over the frame's cells to its tolerance (and symbol); datum letters alone refused; a symbol is joined only before what reads as a frame's cells | model cases; UI probe |
| A-07 repeat balloons on one callout | Placement treats the sheet's other balloons as obstacles (2.2 radii) and steps out in rings | model (ten on one callout, none overlapping); flow; render |
| A-08 work file over work | Asks first, with the counts ("Its 1 balloon takes the place of the 3 here now"), unless the work is the same | flow; work-file probe |
| A-09 focus dropped | Focus goes to the list after a delete from the editor, to the drawing after the last balloon goes or a drawing opens from the intro, to "Open a drawing" after clearing, and back to the opener when the confirm bar closes; never taken from where the user put it | flow (both engines) |
| A-10 4X with one value | Open until each feature has a value (fewer values than the count), listed under "Results to enter", with "1 of 4 values" under the field; a gauged attribute takes one Pass | model and generator; flow |
| A-11 commas in the list | The list uses the work's decimal mark and shows only the pieces measured | flow |
| A-12 zone counts | Kept as typed, applied when a whole number 1 to 60, restored on leaving otherwise | flow |
| A-13 confirm bar | Focus starts on "Keep what’s here"; Escape keeps | flow |
| A-14 composite and per-unit frames | A second symbol, word, or ± after the tolerance is refused; what follows a tolerance must read as modifiers and datum letters; a per-unit tolerance (/25) is read with a note saying so | model and generator cases |
| A-15 µm and µin | µ and μ read as u before capitals | generator cases |
| A-16 counts by case | Counts in either case; X isn't a fit letter ("4X12" refused); "2X 45°" stays refused (a 2 mm by 45° chamfer reads the same) | probe |
| A-17 refusals naming the wrong thing | A GD&T word counts only with its tolerance straight after it, and is refused with only datum letters after it ("POS A B C"); ROUND alone isn't circularity; the single-deviation message only for one value and a sign | generator cases |
| A-18 dual dimensioning | Covered by A-01's rule: "25.40/1.000" and "1.000/25.40" refused | generator cases |
| A-19 balloons under annotations | Not moved into an annotation layer (a reader printing "document only" would leave them out); instead the export names any balloon inside one of the drawing's comments, stamps, or form fields, and says to move it | `bd-annots.cjs` |
| A-20 rebuilt copies freeze the page | Sheets are pictured as JPEG (pdf-lib embeds it as it is), the page is given a moment between sheets, and the button counts the sheets: 100 protected sheets in 6.4 s (was 36), the page answering within 0.65 s (was 16.5), 318 MB at peak (was 563) | memory probe |
| A-21 CJK offline | The warm-up fetches the 168 character maps after the fonts; a data file that can't be fetched is said on the page | `bd-offline.cjs` |
| A-22 /Rotate 45 | A rotation that isn't a multiple of 90 counts as none, as readers take it | export probe and pypdf |
| A-23 two tabs, a drawing not kept | Another tab's work for another drawing closes this tab's drawing first; balloons are placed and exported only with the work made for the open drawing | flow (both engines) |
| A-24 the example over kept balloons | Asked first | flow; storage probe |
| A-25 limits with decimal commas | Limits (in the spreadsheet, the printed table, the editor, and the readings) use the work's decimal mark; pieces in the Results cell are set apart by " \| "; with decimal commas the spreadsheet is separated by semicolons (S-2) | model; CSV probe |
| A-26 a work file's sheet count | The sheets are the drawing's own; balloons and zones on sheets it doesn't have are left out and counted | CSV probe |
| A-27 text cut on reload | Each input stops at the length saved work is read back to | caps probe |
| A-28 offline after a visit with no drawing | The PDF writer is fetched with the reader 2.5 s after the page loads; a failed load offline says what to do | `bd-offline.cjs` |
| A-29 the privacy wording | Now says the page downloads its own files from this site (fonts and decoders included) and keeps them | read |
| A-30 a move across sheets | The balloon goes to the sheet it's put on; a delete ends a move | flow (both engines) |
| A-31 zone settings | "Use these zones on every sheet" asks before replacing another sheet's own grid; an emptied frame field keeps its edge; unticking zones keeps the section open, and ticking again brings the sheet's grid back | flow |
| A-32 East Asian spellings | Full-width forms read as plain ones, φ and Φ as Ø, direction marks removed, any digit counted before calling a requirement a note | generator cases |

Suggestions taken up: S-1 (results for several features use a keyboard with a space), S-2 (semicolons with decimal commas), S-3 (a signed drawing's export says the signature doesn't carry over), S-4 and S-13 (the rebuilt-copy notice says the resolution and that the original is unchanged), S-8 (Shift and Enter with nothing chosen says so instead of placing; a delete ends a move), S-9 (an impossible renumber says so), S-10 (read limits shown as "read: …"), S-11 (summaries 24 px tall), S-12 (the service worker tidies its files after answering, not before, and keeps up to 400 before tidying), S-14 (the checks list balloons off their sheet). Left: S-5, S-6, and S-7 (design choices or not reproduced; noted for a later look).
