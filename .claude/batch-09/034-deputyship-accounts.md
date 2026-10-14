# #034 Deputyship Accounts

Dossier. The decision and its evidence are in `CANDIDATES.md` ("Decision for #034") and `research/b-household.md`. Address: `labs.eugeneyip.net/deputyship-accounts/`, homepage category `family`, code in `src/experiments/deputyship-accounts/`, built on the local branch `wip/034-deputyship-accounts`.

## The job

A lay deputy (usually an adult child, spouse, or parent) runs the money of someone who lacks capacity, under a Court of Protection order, and reports to the Office of the Public Guardian every year. The report's money section asks, for the client's accounts, what came in and went out during the reporting period under set types, with gifts and the deputy's expenses apart, transfers between the client's accounts shown separately, and the balance checked: opening balances plus money in, less money out, against the closing balances on the statements. When it doesn't agree, the deputy must find out why or explain it. Deputies describe spending a day, or 20 hours, and still not finding it: payments entered twice from overlapping downloads, interest entered twice, wrong opening balances, missed bank charges.

## Scope (first version)

- **The report:** the reporting period (from the court order's date; the end defaults to a year later, less a day, and can be changed to the dates on the OPG's letter); the client's accounts in the report, each with a name, its last four digits, and the opening and closing balances on the statements (the page can read them from a download's running balance, for the deputy to confirm); the client's other accounts, for transfers.
- **Bringing in each account's transactions:** one or more CSV files downloaded from online banking (overlapping downloads allowed), rows pasted from a spreadsheet, or rows typed in from a paper statement. Dates day-first (UK), amounts in one signed column or paid in and paid out, a running balance if the download has one. A read summary: rows, dates covered, money in and out, overlaps removed, rows outside the period.
- **Sorting:** each row in the period gets one of the online report's types (money in or money out, in its groups), or "Gift", "Deputy expense", or a transfer to or from another of the client's accounts. The deputy chooses; "use for every payment like this" makes a rule from a payee's description, shown with how many rows it matches. Suggestions, where the description says so plainly, are only hints. Transfers between two imported accounts are offered as pairs to accept. Nothing counts as sorted until the deputy has chosen.
- **The results:** the figures for the online report (each type's total, with the payments behind it; gifts; deputy expenses; transfers between the client's accounts; the balance as the report works it out) and for the paper form OPG102 (each main account's rows on pages 7 and 9, the "more detail" lists, and boxes 1 to 6). For each account that doesn't agree: the difference, and where the download's running balance stops adding up (a missing or doubled payment, with its date), rows outside the period, and rows not yet sorted.
- **Kept and sent:** saved in this browser after every change; a spreadsheet (CSV) of every payment and its type, to keep or send with the report, as the OPG invites; a backup file to open again on another computer or to start next year's report; both summaries print.
- **Left out:** the rest of the report (decisions, contacts, assets, debts); the short form OPG103; Scotland's and Northern Ireland's regimes; professional deputies' many clients; reading PDF statements; open banking; budgets; sending anything anywhere.

## Principal failure modes, and how each is handled and checked

| # | Risk | Handling | Check |
|---|---|---|---|
| 1 | Bank CSV layouts read wrongly (preamble lines, column names, paid in and out columns, signs, CR and DR, £ and commas, dates, Windows-1252 £) | A forgiving reader: header found below any preamble, roles guessed from names and cells, a column preview the deputy can correct, a read summary with totals to compare with the statement | Reader cases for each layout found in banks' and accounting tools' published descriptions (not only files this page writes); property checks over generated tables |
| 2 | Overlapping downloads counted twice (the forum's commonest cause) | Within an account, rows from different files that agree on date, amount, description, and running balance are one payment: the merge keeps the larger count of each such row, never the sum; repeats inside one file are kept (two real £10 withdrawals) and listed to check | A year's ledger cut into random overlapping downloads, with and without balances, always merges back to the same payments (brute force) |
| 3 | Money arithmetic off by a penny | Whole pennies throughout; amounts with more than two decimal places refused | Each type's total adds up to the account's movement; an independent Python re-check (Decimal) of the totals and boxes |
| 4 | Dates and the period (day-first versus month-first; the first and last day; 29 February) | Day-first unless the file proves otherwise, and the summary says which; the period inclusive at both ends; rows outside it kept but not counted, and listed | Boundary cases; a leap-year period; an ambiguous file |
| 5 | Transfers paired wrongly (two equal amounts) | Pairs are offered, not made: same amount, opposite directions, within 7 days, the closest first; ambiguous ones say so | Brute force on small random sets |
| 6 | Wrong or missing types | The deputy chooses every type; rules are visible with their counts and can be removed; unsorted rows are counted in the results and block nothing but are always shown | Rule and summary tests; browser checks |
| 7 | The report's types change | The types are data with their source and date (the online report's source code, read 2026-10-14; the paper form OPG102, July 2025); the page says to follow the report if it differs | Wording review |
| 8 | Claiming more than it does | It adds up what the deputy has sorted and checks it against the statements' balances, as the report does; never "correct", "accepted", "approved", or "compliant"; not connected with the OPG | Wording review |
| 9 | A vulnerable person's bank data leaving the device | No network use after loading; saved only in this browser and the files the deputy downloads; "Clear from this device"; a note on shared computers | Network log in both engines |
| 10 | A year's work lost | Saved after every change through `useOtherTabs` and `NotSaving`; the backup file offered; damaged saved data shown, not thrown away | Reload, two tabs, refused and damaged storage |
| 11 | A busy account (thousands of rows, several accounts, many files) | Sorting by payee groups, not row by row; long lists shown a page at a time | Timed runs at 10,000 rows in both engines |
| 12 | Fast typing outrunning the page (Comp Desk's lesson) | Functional updates; reads at Enter from the latest state; no delayed focus moves | Browser checks that type quickly |
| 13 | Keyboard, screen readers, 200% text, phone widths | Semantic tables and selects; sorted counts announced; cards at phone width | Keyboard pass, axe, 320/390/1280 px at 200% |
| 14 | Print | Print styles for both summaries on A4 | Print to PDF |

## Evidence plan

- Model checks: reader cases per published layout; the merge against brute force over random overlapping downloads; transfer pairing against brute force; totals, boxes, and trails as invariants; the period's boundaries.
- An independent re-check in Python (standard library, `csv` and `decimal`): the same files read separately, totals per type and the boxes compared with the page's model.
- Browser flows in Chromium and WebKit (desktop light, phone dark): import, sort, rules, pairs, results, print, the backup round trip, offline, the network log.
- The report's own types come from the online service's public source and the paper form itself, read on 2026-10-14.

## Log

- **2026-10-14:** chosen (`CANDIDATES.md`). Risk list written.
