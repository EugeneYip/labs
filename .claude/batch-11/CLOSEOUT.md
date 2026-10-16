# Batch 11 closeout

Written 2026-10-16, when Batch 11 (Discovery Cycle 6) closed early with one experiment, #037. This file is internal. The evidence is in the dossier (`037-ballooned-drawing.md`), the audit (`037-audit.md`), `CANDIDATES.md`, the research notes in `research/`, and the log in `BATCH_11.md`.

## Outcome

- **Shipped and verified in production:** #037 Ballooned Drawing.
- **Not assigned:** #038, #039, #040, #041. The authorization's limit is an upper bound, not a target; the early-close test is at the end ("Why the batch closes at #037"). Never #042.
- **Defects:**
  - before the push: 32 found by the independent audit (7 high), plus those the page's own checks found while it was built;
  - after shipping: 2, found by production verification and fixed the same day.
- **Infrastructure:** the service worker tidies its saved files after answering a request rather than before, keeps up to 400 before tidying, and counts data files a script names by address as needed. The daily check no longer takes a quoted object key for a script file.

## The report

### 1. Experiments shipped

| # | Title | Slug | Category | Status | Ship commit | Fix | Deploys | Verified |
|---|---|---|---|---|---|---|---|---|
| 037 | Ballooned Drawing | ballooned-drawing | School & work | live | 0cd5262 | 119ff63 | 38854558526, 38855446108 | 2026-10-16 |

### 2. Numbers not assigned

#038, #039, #040, #041: no candidate cleared the gate after #037.

### 3. Ideas considered

About 170, each in `CANDIDATES.md` or the research notes with its outcome:
- round 1: about 75, from the main session's first screen and threads A–E;
- round 2: about 45, from threads F and G, including the ideas they screened by judgement;
- the final broad pass: about 50, from thread J's four searched leads and about 45 screened by judgement.

Many more were found already settled in Batches 07–10 by a grep of the records (`kw.py`) before any search was spent.

### 4. Researched materially

About 30 with searches and page reads, at Stage B or beyond:
- first article inspection ballooning;
- breeders' pedigrees;
- the VAT margin-scheme stock book;
- Square multi-vendor payouts;
- reports per form submission;
- trades' retentions;
- coin die comparison;
- test-pit finds;
- £sd accounts;
- museum pest traps;
- lot tracing with a quantity balance;
- FSC chain-of-custody summaries;
- condition surveys;
- landed cost;
- collating reviewers' PDF corrections;
- Word comments to a table;
- county bird report tables (twice: thread G, then thread I's deciding checks);
- volunteer geophysics composites;
- bat detector activity tables;
- ultrasonic thickness surveys;
- as-built positions;
- laytime statements;
- seafarers' hours of rest;
- walk sheets from the electoral register;
- community radio music returns.

### 5. Fully gated

Two, gated in full (A–J):
- **ballooning a drawing for a first article inspection:** BUILD, #037;
- **inbreeding and mate choice from a breeder's own records:** REJECT.

Every deciding claim was re-checked in the main session rather than taken from a thread's summary. For #037 that meant the vendors' and repositories' own pages, and the text of 22 CFR 120 and DFARS 252.204-7012. For pedigrees: MiniInbred's record, by a search (its page sits behind a firewall check, which wasn't bypassed), PMx's manual through thread H, and two searches for a free whole-list tool.

### 6. Rejected

Reasons are kept in `CANDIDATES.md`. By kind:
- **Served free already:**
  - audit sampling (JASP for Audit);
  - collating PDF review comments (pdfannotations.com);
  - Word comments to a table (pdfannotations.com, which closes Batch 07's HOLD);
  - reports per form submission (Epicollect5 prints its own);
  - as-built positions (GradeLog's free checker);
  - thickness surveys (free templates);
  - inbreeding and mate ranking (PMx, MiniInbred, and registries' tools);
  - bat activity tables (Ecobat, and the classifiers' own reports);
  - geophysics (Snuffler);
  - seafarers' hours of rest (ISF Watchkeeper and four others).
- **Formula depth, or a sum after grouping:** Square vendor payouts; landed cost; £sd accounts; FSC transfer tallies; condition surveys; community radio returns.
- **A covered cluster or the batch's avoided patterns:**
  - the VAT margin-scheme stock book (a third UK money-rules tool);
  - museum pest traps (next to #035);
  - reports per submission (mail merge);
  - test-pit finds and census linking (archaeology and genealogy);
  - planned-maintenance levelling and asset registers (the storage objection).
- **A decisive check not possible autonomously:** the county bird recorder's merge. Its largest source's export (BirdTrack's county download) can be seen only with an account, so real-format verification can't be met; it is kept as owner-blocked (item 23).
- **Weak on first-hand evidence, or the hard part not the page's:**
  - laytime statements (the legal reading of the charter decides);
  - walk sheets (parties' systems; every four years or so);
  - lot tracing (records in every shape);
  - coin die comparison (a small expert audience; free editors overlay).

### 7. On HOLD

- **Revisited at the start:** Batch 07's, 08's, and 10's HOLDs (`CANDIDATES.md`, "HOLDs revisited"); none was reopened.
- **Revisited after round 2:** "Word comments to a table" (Batch 07) is now REJECT, its incumbent read on its own page.
- **New HOLD:** none. The bird recorder's merge is owner-blocked rather than on HOLD.

### 8. Strongest incumbents

- **#037:**
  - Werk24's Werkflow Studio: free, with AI ballooning, Form 3, and Excel export, processed in the cloud with EU residency, for drawings that may be uploaded.
  - Balloonist: browser-local, $360 a user a year.
  - The Bubbler: a free GPLv3 desktop program.
  - `balloon`: an MIT Go program built from source.
  - The paid suites: Ideagen Quality Control, DISCUS, High QA, 1factory, Net-Inspect, and others.

  Each was read on its own page in the main session.
- **The rejected leads' incumbents,** for the record:
  - pdfannotations.com (PDF and Word comments);
  - PMx, MiniInbred, optiSel, and the Kennel Club's, ADGA's, and PawPeds' tools (pedigrees);
  - BirdTrack's recorder tools (bird records);
  - BV Laytime's statement comparison and Heisenberg's browser calculator (laytime);
  - ISF Watchkeeper (hours of rest);
  - GradeLog (as-built positions);
  - Snuffler (geophysics);
  - Ecobat (bats);
  - Zoho Inventory's own allocation (landed cost);
  - Square for Retail Plus, VendNex, and Consignor Connect (vendor payouts).

### 9. Users and jobs

- **#037 Ballooned Drawing:** the inspector or quality lead at a small machine shop, fabricator, or contract manufacturer preparing a first article inspection (AS9102, PPAP dimensional results, or a customer's request for a ballooned print with measurements). The job:
  - number every characteristic on the customer's drawing;
  - read each requirement's limits;
  - record one to five pieces' results, passed or failed exactly;
  - give each balloon its reference location (sheet and zone);
  - export the ballooned PDF and a table in AS9102 Form 3's column order.

  All of it without the drawing leaving the computer, which export-controlled and covered defence drawings require.

### 10. Defects found before shipping

- **Found by the page's own checks while it was built** (`037-ballooned-drawing.md`, "Log"):
  - requirement-rule slips the model test and the independent generator caught (a character-class range, inch marks read as seconds, chamfers read as counts, a deviation regex taking the nominal's last digit, and others);
  - a white balloon hiding the callout it numbered in the ballooned print (found by macOS's renderer);
  - undo restoring stale snapshots, so typed results could be lost;
  - the PDF reader's decoders, fonts, and writer missing from the offline copy;
  - contrast on the selected row;
  - 206 Tab stops in the checks with 2,001 balloons (now 50);
  - a frame without its symbol being read as a size;
  - the phone viewer's height.
- **Found by the independent audit (32):** 7 high, 12 medium, 13 low, with 14 suggestions (`037-audit.md`). The high findings:
  - dashes and spaced minus signs read as ranges;
  - inch fractions read as limits;
  - numbers side by side run together;
  - two stacked values of a table read as limit dimensioning;
  - opening a work file replacing work without asking;
  - another tab's drawing that this browser won't keep shown under this tab's sheets;
  - "Try the example drawing" replacing balloons kept without their drawing.

  Every finding was reproduced by its own probe, fixed, and rechecked by that probe and by a regression check in the factory's harnesses. Ten suggestions were taken (the table at the end of the audit file).
- **Found by the main session after the audit:** a WebKit warm-up that kept fetching while offline (it now waits for a connection).
- **Harness faults, not the product's:**
  - a fixture run racing the page's first save;
  - WebKit's cancelled loads at navigation;
  - an off-screen click after the page scrolled;
  - a test point on the fixture's form field;
  - the character maps' count (168, not 169).

### 11. Defects found after shipping

Two, both found by production verification on the day of shipping and fixed in 119ff63:
- WebKit cancels a background tab's loads, so the first tab's warm-up missed character maps when a second tab came to the front. The warm-up now tries once more for any file that failed, when the page is next shown and online.
- The daily check read pdf.js's `"./qcms_bg.js"` import key as a script file and reported it missing. Quoted names used as object keys are now skipped.

### 12. Correctness evidence

- **The model** (`ballooned-drawing-test.ts`, 287 checks): the requirement rules and their refusals, exact pass and fail at the limits, typed limits, counts, zones, numbering through every operation, reading callouts off text runs (columns, stacked values and deviations, frames), placement clear of text and of other balloons, the Form 3 CSV, and damaged saved work.
- **An independent generator** (`ballooned-drawing-check.py`, written from the rules, not the TypeScript):
  - 1,598 requirements written from known limits in many notations, including the audit's cases, each read back exactly;
  - 1,600 results judged with Python's fractions;
  - 3,000 zone points by brute force over every zone's rectangle;
  - the spreadsheet read back by Python's `csv` module.
- **The exports, read by programs other than the page's:**
  - pypdf checks every balloon's circle and number at its point, on its sheet, with the rotation, the sheets unchanged, the drawing's content kept, and rebuilt copies one image a sheet (`bd-verify.py`; 97 of 97 on the flow's exports in each engine, and every fixture's);
  - macOS's own renderer draws the PDFs, with each balloon found in the picture and no stray red (`bd-render.py`; 23 of 23 in each).
- **The audit's own probes,** rerun on the fixed build, each showing the fixed behaviour.

### 13. Primary sources

- **#037:**
  - the legal reason to stay local, read in its text: 22 CFR 120.50, 120.54, and 120.56 (ITAR's encryption carve-out fails when a third party holds the means of decryption) and DFARS 252.204-7012 (FedRAMP Moderate-equivalent clouds, flowed down to subcontractors, engineering drawings named as covered information);
  - the job's trigger and record: GKN's FAI guidance and Boeing's page (thread A);
  - the Form 3 columns, from the IAQG's form as GKN describes it;
  - zone conventions (ISO 5457's top-left start, letters skipping I and O; secondary sources, so the page asks for the start corner).
- **Other leads:** 26 CFR 1.471-3 (landed cost), 7 CFR 205.403 and SALSA's trace test (lot tracing), HMRC's margin-scheme guide (VAT), SI 2018/58 (hours of rest), the Shipowners' Club's laytime guidance, and AviList's licence (bird records).

### 14. High limits and performance

Measured in Brave and WebKit unless noted:

| Case | Result |
|---|---|
| 2,000 balloons: load | about 1 s |
| 2,000 balloons: typing | about 32 ms a key |
| 2,000 balloons: placing the 2,001st | 0.36 s |
| 2,000 balloons: the CSV | 76–90 ms |
| 2,000 balloons: the ballooned PDF | 0.31 s |
| 2,000 balloons: Tab stops | 50 |
| 100 sheets: opening | about 0.1 s |
| A0 at 400% | within the canvas limits (16 million pixels, 8,192 a side) |
| A 36 MB drawing (audit) | opens in under 1 s, kept in IndexedDB, exports in under 0.4 s |
| A 48 MB work file (audit) | saved in about 1 s, reopened in 0.3 s |
| A protected 100-sheet drawing's rebuilt copy | 6.4 s (was 36 s); the page answering within 0.65 s (was 16.5); 318 MB at peak (was 563) |
| 200,000-character requirements, 16 adversarial shapes (audit) | each read in under 70 ms |

### 15. Browsers, accessibility, offline

Chromium (Brave) and WebKit, desktop light and phone dark, on the build and on the live site:
- **The flow** (`bd-flow.cjs`, 130 checks per engine):
  - axe at the intro and with every section open;
  - 200% text with no sideways overflow;
  - the keyboard crosshair;
  - the list as one Tab stop;
  - focus after every removed control;
  - the confirm bar's Escape and its focus;
  - print;
  - reload, two tabs, refused and damaged storage, the example over kept balloons;
  - quick clicks and Enter at full speed;
  - moves across sheets, zones on every sheet, decimal commas;
  - no console errors, and no request but the site's own files.
- **The fixtures** (`bd-files.cjs`, 100 per engine): rotated, cropped, offset, a transform left over in the content, CCITT G4 and JPEG 2000 scans, owner- and user-locked files, truncated files and non-PDFs, CJK and TrueType fonts, 100 sheets, A0, and 2,000 balloons.
- **The annotation notice** (`bd-annots.cjs`, 3 per engine).
- **Offline with the real service worker** (`bd-offline.cjs`, 14 per engine): after one visit, the example, a G4 scan, and a Japanese-font drawing open; a balloon is placed; both exports are written. After a visit that opened no drawing, the example's PDF is still written offline.
- **Site-wide** (`p5-offline.cjs`, 30 scenarios with the new service worker deployed over main's): 30 of 30 in WebKit; 29, then 30 of 30, in Chromium (the one failure didn't recur in six isolated reruns).
- **The whole-site smoke test:** 152 page loads with no problems.

### 16. Production verification

Deploy 38854558526 for 0cd5262, and 38855446108 for the fix 119ff63:
- live files byte-identical to a fresh build (274 files, 312 addresses);
- the flow 130 of 130 in both engines on https://labs.eugeneyip.net;
- offline 14 of 14 in each;
- the annotation notice 3 of 3 in each;
- the whole-site smoke test 152 page loads with no problems;
- the daily check 11 of 11, with no request needing another try.

### 17. Lifecycle

**#037:** provisional **MAINTAIN**, with no known user. It's the batch's strongest thesis: an official, recurring, consequential job, whose strongest free incumbent can't lawfully take a large class of drawings, and where nothing free is install-free, account-free, and upload-free at once. Archive if a free tool appears that is all three, or if keeping pdf.js current becomes more than the page is worth.

### 18. Against the portfolio

Scored on the Batch 03 framework (out of 65; `PORTFOLIO_REVIEW.md`), critically:

| Experiment | Total | Note |
|---|---|---|
| #016 Fluency Check, #020 Custody Calendar, #022 Day Clock, #028 Hidden Data Check | 52 | The top tier |
| #031 New Classes | 51 | |
| **#037 Ballooned Drawing** | **51** | A rule creates the job and the legal reason to stay local; every new part or revision; no free tool is install-free, account-free, and upload-free |
| #034 Deputyship Accounts, #036 Holiday Pay Average | 50 | |
| #033 Captions Up | 49 | |
| #035 Collection Climate | 46 | |

The scores (Clar, Use, Rec, Diff, Local, Priv, Tech, Maint†, Corr†, Loss†, Aud, Spread, Prod; † counts as 6 minus the score) are 5 5 4 4 5 5 4 3 4 3 5 2 4.

The rejected leads would score below the portfolio's middle: pedigrees about 39, the bird recorder's merge about 40, and laytime statements about 38.

### 19. Maintenance debt

- **pdf.js 6.4.299** reads untrusted files, so its releases should be followed for security fixes. pdf-lib 1.17.1 has had no release since 2021; it works, and the page needs only drawing onto pages. The two are the site's first runtime packages beyond React, about 2.2 MB, loaded only by this page.
- **The offline copy** keeps about 200 more files for this page (the PDF reader's fonts, decoders, and 168 character maps); the service worker now keeps up to 400 before tidying.
- **Storage:** `labs:ballooned-drawing` in localStorage (the work) and IndexedDB (the drawing).
- **The QA harnesses live only on this machine** (`.claude/qa/`, ignored by git by design), now including #037's (`bd-*.cjs`, `bd-*.py`, `ballooned-drawing-*`) and the audit's probes (`bd-audit-*`). A private copy is the owner's decision.
- **WebKit's first-visit offline failures** in `p5-offline.cjs` were intermittent on main's build too (seen while #037 was built), so they aren't this batch's.
- **37 experiments**, each self-contained (accepted).

### 20. Lessons

- **pdf.js offline:**
  - Serve its data files (fonts, decoders, character maps) through a custom `BinaryDataFactory` with `useWorkerFetch: false`, from Vite's `?url&no-inline` hashed assets, so the site's offline copy can keep them.
  - `useSystemFonts: false` stops it asking for system fonts by name.
- **A PDF's own annotations are drawn above anything added to its pages' content:** say so when a balloon is under one, rather than moving balloons into an annotation layer that a "document only" print would drop.
- **Rebuilt copies:** pdf-lib decodes and recompresses a PNG on the page's thread, while a JPEG goes in as it is (36 s became 6.4 s for 100 sheets).
- **Read text layers defensively:** refuse what could be two readings (a dash, a space inside a number, a fraction, stacked values that could be a table) rather than pick one; the audit's highest findings were all guesses.
- **When the rules change, change the independent check with them,** and add the audit's cases to it, so it stays independent rather than out of date.
- **WebKit reports every load it cancels** (a reload, a tab sent to the background) as an error "due to access control checks". Harnesses should tell those from the page's own errors, and a warm-up should try again later.
- **A service worker's housekeeping must not sit between a request and its response.**
- **A sub-agent cut off by a usage limit can be resumed from its own transcript** with a message, keeping what it found, rather than started again.
- **The test environment:**
  - Playwright's browsers can't reach a server started inside the Bash sandbox; use the app's preview servers or route interception.
  - macOS's `sips` draws a page shifted by its box's origin, in pixels.
  - zsh doesn't split an unquoted variable (`${=var}`).

### 21. Research and search limits

- **Threads and their budgets:**
  - Round 1's five threads used 42 searches and 38 reads.
  - Round 2's five (F, G, H, I, J) used 36 searches and 36 reads.
  - The audit worked mostly with local probes.
  - The main session used about 10 searches and 12 reads.
- **The account's usage limit was reached three times:**
  1. 2026-10-15: thread D was cut off after 6 of 9 searches. Its notes were kept, not relaunched.
  2. 2026-10-15 to 16: the audit and threads F and G stopped mid-work. All three resumed from their transcripts after the reset and finished.
  3. 2026-10-16: the main session's re-check of the Word comments tool was cut off and rerun after the reset.

  Nothing was lost: every milestone had been committed to the work branch or `main`.
- **Pages that refused the reader:** Affinity's forum (403); AgriWebb's portal (script-built); BirdForum (403); the Sussex Archaeological Society (TLS); Nautilus (404); Homesteading Today (a pay gate for bots, not read); the University of Minnesota's repository (a firewall check, not bypassed).
- **Lanes not relaunched:** thread D's remainder, and thread J's twelve domains (its own advice).

### 22. Human validation, for later (parked)

#037 with two or three shops' inspectors on real, non-controlled drawings:
- the time to balloon a drawing and fill the table, against their current method;
- whether their customers accept the ballooned PDF and the table;
- what the text layer misses on their CAD exports.

### 23. Owner-blocked

- **Unchanged from before the batch,** kept parked by the owner's instruction:
  - Fluency Check interviews or a pilot;
  - the email to Open-Meteo;
  - a no-account feedback address;
  - regrouping Custody Calendar, Day Clock, and Frost Dates to Maintain;
  - Firefox testing (needs a permission rule);
  - human validation of #028, then #026;
  - an automation permission to test #028 with workbooks Excel saves;
  - the nest visit planner (two CC0 downloads, and a sourced last-visit rule per species);
  - human validation of #031, then #033; of #034, then #035; and of #036;
  - a private copy of `.claude/qa/`.
- **New:**
  - human validation of #037 (item 22);
  - the county bird recorder's merge, which needs a real BirdTrack county download (an account) before it could be built and checked against real files.

### 24. Repository, deployment, and factory at close

- **Code:** the last code changes are 0cd5262 (#037 Ballooned Drawing, with the service worker's change) and 119ff63 (the warm-up's retry and the daily check's fix). They were deployed by runs 38854558526 and 38855446108 and verified in production.
- **Repository:** `main` matches `origin/main`, with this closeout's commits on top (55b7497 and the one recording this line; records only). The `wip/037-ballooned-drawing` branch was deleted after the squash. No `wip/` branches; the working tree is clean. The Stop hook passes its 31 offline cases.
- **Live:** 37 experiments, #001–#037. After the closing records' deploy (run 38873930936, for 55b7497): live files byte-identical to a fresh build (274 files, 312 addresses); the daily check 11 of 11, with no request needing another try.
- **Factory:** Autonomy set to `complete` in `FACTORY_STATE.md`. No Batch 12 and no #042 without the owner.

## Why the batch closes at #037

- **A final broad pass, materially different from anything shipped or searched in the batch:** after round 2 found nothing for #038, thread J covered twelve new domains: marine operations, elections and civic administration, non-clinical care, courts, transport, hospitality, performing arts, sports clubs, religious and community organisations, research administration, journalism, and small landlords' admin. It searched three and screened the rest from the records and by judgement, and found one narrow survivor (laytime statements, with no first-hand evidence).
- **HOLDs revisited:** every earlier HOLD was revisited at the start, and Batch 07's "Word comments to a table" again after round 2 (REJECT, its incumbent read on its own page).
- **Why the remaining candidates fail:** each on one of a few grounds (item 6):
  - a free or official tool already does the job where its users work (pedigrees, PDF and Word comments, geophysics, bats, hours of rest);
  - its decisive check can't be done autonomously (the bird recorder's merge needs an account to see real exports);
  - it rests on vendors' claims, or its hard part is a judgement the page can't make (laytime);
  - it repeats a covered pattern (the VAT stock book, museum pest traps).

  The one gated in full (pedigrees) fails for want of what made #037: a reason its users can't use the free tools.
- **Why more search has diminishing value:**
  - Round 1 (about 75 ideas, five threads) gave #037.
  - Round 2 (about 45, threads F and G, with H and I's deciding checks) gave nothing that survived its gate.
  - The final pass (about 50 in twelve new domains) gave one narrow lead.
  - The best remaining leads would score about 38 to 40 on the portfolio framework, far below #037's 51 and the portfolio's middle.

  The authorization prefers one strong product with extensive negative evidence to several mediocre ones, so assigning #038 to any of them would ship a weaker experiment than the bar allows.
