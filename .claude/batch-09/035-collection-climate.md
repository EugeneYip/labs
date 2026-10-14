# #035 Collection Climate

Dossier. The decision and its evidence are in `CANDIDATES.md` ("Decision for #035") and `research/h-heritage.md`. Address: `labs.eugeneyip.net/collection-climate/`, homepage category `school` (School & work), code in `src/experiments/collection-climate/`, built on the local branch `wip/035-collection-climate`.

## The job

Someone looking after a small museum's, historic house's, archive's, or library's collection downloads its temperature and humidity loggers, often every month, and has to say what conditions the collection actually had: how much of the time it was inside the band the institution follows (most often the Bizot Green Protocol's 2023 guideline: RH 40–60% and 16–25 °C, with fluctuations of no more than ±10% RH per 24 hours), when the humidity swung too far, and how each month went, for trustees, a lender, a borrower's facilities report, or a decision to widen the band and save energy. The loggers' own software draws graphs; the figures are made by hand in Excel, or by paid services.

## Scope (first version)

- **Bring in the loggers:** one or more files exported from the loggers' software (CSV, tab- or semicolon-separated text, in UTF-8, Windows-1252, or UTF-16), or rows pasted from a spreadsheet; each is a place (a room, a case, a store), named from the file. Lines above the column names are skipped; the date and time (one column, or two), temperature (°C or °F, from the column's name or its values), and relative humidity are found by name, with a preview and a column chooser when a file is unusual. Event rows with no readings are left out. A read summary: readings, first and last, the usual interval, gaps in the record, the lowest and highest values.
- **The guideline:** Bizot 2023 (RH 40–60%, 16–25 °C, ±10% RH in 24 hours), Bizot 2015 (RH 45–55% with ±5% drift), or the institution's own band; and how the 24-hour limit is read, stated on the report: either no reading further than the limit from the average of the 24 hours before it, or no more than the limit between the highest and lowest readings of any 24 hours.
- **The report, for each place and the period chosen:** the share of readings inside the RH band, the temperature band, and both; the readings above and below; each time the 24-hour limit was broken, gathered into spells with their worst value; time above 65% and 70% RH (where mould becomes a concern, stated as a fact, not a judgment); a monthly table (lowest, highest, average, share in band, days with a swing breach); a graph of temperature and humidity with the band shaded and the breaches marked; gaps in the record listed and left out of the shares.
- **Side by side:** a table of every place's figures; the report prints (a page per place and the summary), and the tables download as CSV.
- **Kept:** nothing but the settings (the guideline and its numbers) is saved; the files stay on the device, and leaving with files open asks first.
- **Left out:** preservation indices (IPI's TWPI and others), mould-risk models, light doses, alarms, live loggers, XLSX workbooks (save as CSV), reading a logger's own binary files.

## Principal failure modes, and how each is handled and checked

| # | Risk | Handling | Check |
|---|---|---|---|
| 1 | Logger layouts read wrongly (title lines, "#" columns, units inside names or values, two-column dates, AM/PM, event rows, decimal commas, UTF-16) | A forgiving reader; a preview and a column chooser; a read summary to compare with the logger's own view | Cases for HOBOware's documented layout (im-hobo's docstrings) and for common shapes, written separately from the page's code; property checks over generated files |
| 2 | Day and month swapped | Day first unless the file proves month first (a value over 12), said in the summary; a switch | Ambiguous and decided cases |
| 3 | °F taken for °C | Units from the column name or the values; a switch; converted for the checks | Cases |
| 4 | Clock changes and gaps | Readings taken as the clock times written; a gap longer than twice the usual interval is listed, and the shares count only the readings there are | DST and gap cases |
| 5 | The 24-hour limit read one way only | Both readings offered, the one chosen printed on the report | Brute force over every window on random series |
| 6 | Misleading claims | Figures against the band chosen; never "safe", "compliant", or "meets Bizot"; the NMDC's own line that a conservator's evaluation is essential | Wording review |
| 7 | Large files (a year at 5-minute intervals, several loggers) | One pass to read; windows in one pass (running sums and monotone queues); the graph drawn from each pixel's lowest and highest | Timed runs; brute-force agreement |
| 8 | Charts that only some can read | The figures are in tables; the graph has a text summary and isn't colour-only | axe, keyboard, screen-reader structure |
| 9 | Print | A page per place | Print to PDF |
| 10 | Work lost by leaving | Files aren't saved, so leaving with files open asks first; the settings are saved | Browser checks |

## Evidence plan

- Model checks with independent evidence: brute-force computation of every share and window on random series; the readers against layouts written separately; an independent Python re-check of the figures on generated logger files.
- Browser flows in Chromium and WebKit (desktop light, phone dark), print, a large file, axe, keyboard, offline, the network log.
- Not available here: real files exported by Tinytag Explorer, EasyLog, or Hanwell's software (no sample found published; downloading one would need the owner's yes). Their fixtures follow the common shapes of such exports and are said to be that; HOBOware's follow its documented layout.

## Log

- **2026-10-14:** chosen (`CANDIDATES.md`). Risk list written.
