# Portfolio review

Internal assessment of all 25 Labs experiments, written for Batch 03 (Portfolio Hardening) on 2026-10-09. Operational material, not marketing: scores are deliberately critical, and nothing here is validated by real users. None of the 25 has had real-world use that Labs knows of.

Before scoring, every experiment was loaded in production at desktop (1280 px) and phone (390 px) widths. All 25 load, none overflow, and no console errors appeared.

## Framework

Each criterion is scored 1 to 5. For the ten positive criteria, 5 is best. For the three risk criteria (marked †), 5 is the most risk or burden, and they count as 6 minus the score in the total. The maximum total is 65.

| Criterion | 1 means | 5 means |
|---|---|---|
| Problem clarity | Vague or invented problem | A problem people name in their own words |
| Usefulness | Nice to have | Saves real time, money, or stress when it's needed |
| Recurring need | Once in a few years | Daily or weekly |
| Differentiation | Good free tools already do it | No comparable free tool found |
| Static/local-first advantage | Works against it (needs sync, or server data) | Local processing is the core advantage |
| Privacy advantage | Data isn't sensitive | Sensitive data that competitors upload or collect |
| Technical confidence | Untested in realistic conditions | Logic tested thoroughly, behavior verified broadly |
| Maintenance burden † | Static logic that won't rot | Depends on fast-changing browser APIs, codecs, or outside services |
| Correctness risk † | Mistakes are harmless or obvious | A wrong answer would be trusted and costly |
| User-data-loss risk † | Nothing worth losing is stored | Irreplaceable data lives only in one browser |
| Audience clarity | "Anyone" | A named group with a specific job |
| Potential to spread organically | Private, solitary use | Use itself shows the tool to others (links, results) |
| Potential as a standalone product | A feature, not a product | Could be its own site or app with a reason to exist |

## Scores

Clar = problem clarity, Use = usefulness, Rec = recurring need, Diff = differentiation, Local = static/local-first advantage, Priv = privacy advantage, Tech = technical confidence, Maint† = maintenance burden, Corr† = correctness risk, Loss† = user-data-loss risk, Aud = audience clarity, Spread = organic spread, Prod = standalone potential.

| # | Experiment | Clar | Use | Rec | Diff | Local | Priv | Tech | Maint† | Corr† | Loss† | Aud | Spread | Prod | Total | Tier |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 016 | Fluency Check | 5 | 4 | 5 | 4 | 4 | 5 | 4 | 2 | 3 | 3 | 5 | 3 | 3 | **52** | A |
| 020 | Custody Calendar | 5 | 4 | 4 | 4 | 4 | 5 | 4 | 2 | 3 | 3 | 5 | 3 | 4 | **52** | A |
| 022 | Day Clock | 5 | 4 | 5 | 4 | 5 | 2 | 4 | 2 | 2 | 2 | 5 | 3 | 3 | **52** | A |
| 006 | Secret Santa | 5 | 4 | 2 | 2 | 4 | 4 | 4 | 2 | 2 | 2 | 5 | 5 | 3 | **50** | A |
| 014 | Playing Time | 5 | 4 | 5 | 3 | 4 | 3 | 4 | 2 | 3 | 2 | 5 | 3 | 3 | **50** | A |
| 002 | Photo Scrub | 5 | 3 | 2 | 3 | 5 | 5 | 4 | 2 | 3 | 1 | 3 | 3 | 3 | **48** | B |
| 017 | Frost Dates | 5 | 4 | 3 | 5 | 2 | 2 | 4 | 3 | 3 | 1 | 4 | 4 | 4 | **48** | B |
| 024 | Ranked Choice Count | 5 | 4 | 2 | 4 | 4 | 4 | 4 | 2 | 4 | 2 | 4 | 3 | 4 | **48** | B |
| 003 | Fair Share | 5 | 4 | 3 | 3 | 3 | 3 | 4 | 2 | 2 | 3 | 4 | 4 | 3 | **47** | B |
| 018 | Off Book | 5 | 4 | 4 | 3 | 4 | 3 | 3 | 2 | 3 | 2 | 4 | 3 | 3 | **47** | B |
| 005 | CSV Checkup | 4 | 3 | 3 | 3 | 5 | 4 | 4 | 2 | 2 | 1 | 3 | 2 | 2 | **46** | B |
| 023 | Discussion Map | 4 | 3 | 4 | 4 | 4 | 3 | 4 | 1 | 2 | 3 | 3 | 3 | 2 | **46** | B |
| 004 | Clean Paste | 4 | 4 | 4 | 3 | 4 | 3 | 3 | 2 | 3 | 1 | 3 | 2 | 2 | **44** | C |
| 008 | Serve Time | 4 | 4 | 2 | 4 | 4 | 1 | 4 | 2 | 3 | 2 | 4 | 3 | 3 | **44** | C |
| 012 | Glance | 4 | 2 | 4 | 3 | 3 | 1 | 4 | 1 | 1 | 2 | 3 | 4 | 2 | **44** | C |
| 019 | Form Check | 4 | 3 | 3 | 3 | 5 | 4 | 2 | 3 | 3 | 1 | 3 | 2 | 3 | **43** | C |
| 021 | Family Stories | 5 | 4 | 2 | 3 | 4 | 4 | 3 | 3 | 2 | 5 | 4 | 3 | 3 | **43** | C |
| 010 | Gallery Wall | 5 | 4 | 1 | 4 | 3 | 1 | 4 | 1 | 3 | 2 | 4 | 2 | 2 | **42** | C |
| 015 | Back Row | 4 | 3 | 2 | 4 | 4 | 3 | 3 | 2 | 3 | 1 | 3 | 2 | 2 | **42** | C |
| 025 | Stall Till | 5 | 3 | 4 | 3 | 4 | 2 | 4 | 2 | 3 | 4 | 4 | 2 | 2 | **42** | C |
| 013 | In Tune | 4 | 3 | 4 | 3 | 4 | 3 | 2 | 3 | 3 | 1 | 3 | 2 | 2 | **41** | C |
| 009 | Tear-Off Flyer | 5 | 3 | 2 | 3 | 3 | 2 | 4 | 2 | 2 | 2 | 3 | 2 | 1 | **40** | C |
| 007 | Numbers by Ear | 4 | 3 | 3 | 3 | 3 | 2 | 2 | 3 | 3 | 1 | 3 | 2 | 2 | **38** | D |
| 011 | Line Dry | 4 | 3 | 4 | 3 | 2 | 2 | 3 | 3 | 4 | 1 | 3 | 2 | 2 | **38** | D |
| 001 | Trip Board | 3 | 2 | 2 | 1 | 2 | 2 | 4 | 1 | 1 | 4 | 3 | 1 | 1 | **33** | D |

Tiers: **A** 50 and up, **B** 45 to 49, **C** 40 to 44, **D** below 40.

## Notes

### Tier A

- **#016 Fluency Check.** A weekly, named task (progress monitoring) done today with paper and a stopwatch; student data makes local-only a real advantage. Risks: teachers may read a single score as a diagnosis, and the log lives in one browser (a CSV export exists). Scoring rules should be checked against published ORF administration guidance.
- **#020 Custody Calendar.** A clear, recurring need in a sensitive domain, where paid platforms and account-based apps dominate. Risks: overnight counts may be taken as legally meaningful, and two parents' copies can drift apart (links are snapshots). Holiday swaps one night at a time are tedious.
- **#022 Day Clock.** A daily, always-on need for caregivers, simple enough to be robust; the free alternatives are iPad apps. The biggest practical weakness: if the tablet reloads the page without a connection, it fails. This is exactly what offline support would fix. Low data risk.
- **#006 Secret Santa.** Strongest organic spread in Labs (every participant opens a link) and a very clear audience, but the market is crowded: several free no-email, link-based draws exist now. Annual use. Correctness of the draw matters socially; scrambled links are not secure, and that's stated.
- **#014 Playing Time.** Weekly use by a clear, underserved audience (volunteer coaches); competitors are mostly phone apps with paid tiers. Risks: fairness edge cases with keepers and small rosters, and it plans rather than tracks the live game.

### Tier B

- **#002 Photo Scrub.** Local processing is the whole point, but phones and big platforms increasingly strip location on share, which shrinks the need. Correctness risk is real: a missed metadata block would give false reassurance (the read-back check mitigates).
- **#017 Frost Dates.** Unique worldwide coverage, good organic and search potential, and a plausible standalone site. Depends on an outside service with a heavy per-lookup quota cost; reanalysis biases in valleys and cities.
- **#024 Ranked Choice Count.** Well differentiated, but a wrong or misunderstood count is consequential, and rules differ between organizations; usage is occasional.
- **#003 Fair Share.** Link sharing spreads it naturally, but edits on two phones diverge, which is a structural weakness against free apps like Tricount.
- **#018 Off Book.** A real recurring need, but script parsing depends on messy pasted text, and the strongest competitors are polished phone apps.
- **#005 CSV Checkup.** Solid and private, but the audience is technical and well served by spreadsheets and free tools such as Datasette Lite.
- **#023 Discussion Map.** Niche but clear, with a paid-only competitor. Only one discussion is kept at a time.

### Tier C

- **#004 Clean Paste.** A common annoyance, but chat assistants now do this well. Heuristics can merge the wrong lines.
- **#008 Serve Time.** Good holiday use and clash detection; occasional need. Timing advice is only as good as the steps entered.
- **#012 Glance.** Shareable daily game, but entertainment with low usefulness, in a crowded genre.
- **#019 Form Check.** Strong privacy and local story, but tested only with generated video; codec and frame-rate variation across phones is the main unknown.
- **#021 Family Stories.** Highest data-loss risk in Labs: irreplaceable recordings live in browser storage that Safari may clear. StoryCorps is a strong free alternative.
- **#010 Gallery Wall.** Accurate and clear, but needed once in a long while.
- **#015 Back Row.** Novel, but occasional, and its acuity model is a simplification.
- **#025 Stall Till.** Useful, but only works offline while the page stays open, and a day's sales live in one browser. Offline support would raise it.
- **#013 In Tune.** Never tried with a real voice; mic and audio behavior vary by device.
- **#009 Tear-Off Flyer.** Works, but undistinctive and occasional.

### Tier D

- **#007 Numbers by Ear.** Depends entirely on device voices nobody has listened to; some platforms have none.
- **#011 Line Dry.** Estimates from rules of thumb with no calibration against real loads; depends on an outside service; most useful in places where line drying is common.
- **#001 Trip Board.** The weakest: a generic list with no sync, in a crowded space, with all data in one browser. A candidate for archiving if it stays unused.

## Selection for deep audits

The five highest totals, all in tier A: **Fluency Check, Custody Calendar, Day Clock, Secret Santa, and Playing Time.** The next three (Photo Scrub, Frost Dates, Ranked Choice Count, all 48) were not chosen by default. Frost Dates and Ranked Choice Count still get the batch-wide sensitive-wording pass, along with Family Stories and Stall Till, because they make climate, electoral, recording, and cash claims.

## After the Batch 03 audits

The scores above are the evidence the selection was made on, so they stay as they were. What the audits changed:

- **#016 Fluency Check:** data-loss risk is lower. A check in progress survives a reload, and the log can be loaded back from its CSV. The scoring guide now follows DIBELS 8.
- **#020 Custody Calendar:** correctness risk is lower. Broken links say so, calendar files keep stays whole across New Year, event IDs no longer collide, and link and calendar copies are explained as snapshots.
- **#022 Day Clock:** screen readers no longer hear the time every minute, the limits of reminders are stated, and settings self-heal after a browser clears an untouched site's data.
- **#006 Secret Santa:** one tap can no longer discard drawn links, and full-length links in any script now work.
- **#014 Playing Time:** a child can no longer drop out of the plan silently (repeated names, or too few places), and 1-minute shifts are gone.
- Every one of the five had real defects, which suggests the untested tiers B to D have similar ones. That is the case for Batch 04 being more hardening, not more breadth.

## Batch 04 findings

Audits of the tier B experiments, plus targeted risk audits of Family Stories and Form Check (2026-10-10). The scores above stay as the record. Where an audit materially changes confidence or risk, a post-audit assessment is given separately.

- **#002 Photo Scrub.** The core claim holds. Test photos carried a unique marker in every claimed metadata class: EXIF (GPS, serials, maker notes, owner, comments), XMP, IPTC, JPEG comments, MPF with an image appended after the end, PNG tEXt, zTXt, iTXt, eXIf, and tIME, data after IEND, and WebP EXIF and XMP. Checked with Pillow, independently of the page's reader, no marker survived in any JPEG, PNG, or WebP, and decoded pixels were identical. Defects fixed: a turned PNG's clean copy displayed sideways in Chromium, because browsers honor PNG eXIf orientation and the cleaner dropped it. Dates in file names (IMG_20261009_143210, Screenshot 2026-10-09 at 14.32.10) carried into the clean copy's name, so the "none of these" check missed them. Wording: what clean copies keep (image, color profile, orientation) is now stated. Accepted: ICC profiles are kept, and WebP orientation is dropped (Chromium ignores it). Post-audit assessment: technical confidence 4 → 5 (independent verification); correctness risk 3 → 2.
- **#017 Frost Dates.** The method holds against NOAA/NCEI's frost-freeze framing (36/32/28 °F; spring and autumn separated at midsummer; 10/50/90% probabilities). Typical = the median of the last 30 whole seasons. The cautious dates are counted, not fitted: the 27th of 30 last frosts and the 3rd of 30 first frosts. The card wording ("half of springs have a later frost", "by X in 9 springs out of 10") describes exactly that. Seasons split at the warmest point, so the southern hemisphere works (Canberra: last frost Sep 13, first May 19). Frost-free years count as frost before or after any date. Defects fixed: leap seasons counted dates after Feb 29 a day later, shifting quantiles by up to a day (Boston's 9-in-10 spring date moved from Apr 16 to Apr 15). The archive request had no timeout, so a stalled connection meant "Reading…" forever. A failed place search showed "No places found." Accepted: reanalysis bias for valleys, cities, and coasts, already explained with the grid elevation shown. No change to scores: correctness risk was already moderate, and the fixes are a day and a failure mode.
- **#024 Ranked Choice Count.** Material correctness defect found and fixed. Multi-seat counts elected one candidate per round, so a candidate who reached the quota alongside another could receive part of the first one's surplus. Scottish rule 47(1) deems both elected at that stage, and continuing candidates exclude elected ones. A reference written from the rule text (`.claude/qa/rcc-reference/`) disagreed with the old code in 828 of 2,801 random elections and changed the winners in 57 of 2,606 multi-seat ones; IRV was unaffected. Also fixed: equal surpluses ordered by input order instead of rule 49(2); semicolon CSVs (European Excel, which the page's own Microsoft Forms instructions lead to) misread into timestamp candidates; names starting with digits read as ballot counts; a false "on first choices alone" claim when first choices tie. The page now states the exact variant. During the fix, a shared logic error (over-electing once seats were filled) appeared in both the new code and the reference. A hand trace and an independent seat-count invariant caught it, so the differential test alone wasn't trusted. Post-audit assessment: technical confidence 4 → 5 now that it's verified against the rule text; correctness risk stays at 4 (a wrong count is consequential, and bylaws vary).
- **#003 Fair Share.** Money is in integer minor units, with 0, 2, and 3 decimals covered by tests (JPY, BHD, INR lakh grouping). Links are deflate-raw plus base64url with every field validated, a 1 MB decompression cap, and a clear message for damaged links; the share section already says copies don't sync. Defects fixed: "the fewest payments" was false for balances with cancelling subsets. The greedy pass used extra payments in 304 of 1,500 random groups with round amounts, though in 0 of 2,000 simulated cent-level trips. The exact zero-sum-circle search now matches brute force in every case, up to 16 open balances. Opening a link for a group with a different saved copy on this device silently replaced that copy on the first edit, which can lose expenses added only on this phone; there's now a notice with a link to the other copy. Accepted: leftover cents always go to the first people in a split (deterministic, at most a cent each per expense). Post-audit assessment: user-data-loss risk 3 → 2; the structural divergence of copies remains, by design.
- **#018 Off Book.** Stress-tested with messy fragments. Most layouts parse correctly (NAME:, NAME., own-line names, MRS. MALAPROP., O'BRIEN, JEAN-LUC, (V.O.), accented names, bracketed and parenthesized directions, and the Earnest sample unchanged). Defects fixed: numbered names (SERVANT #2, GUARD 2, Boy 1) failed the colon-layout name test, so their lines merged into the previous speaker's, a silent misassignment. Caseless scripts (CJK and others) found no characters. "Scene: …" lines were appended to the previous speech. Bare page numbers and running headers ended up inside speeches. CJK word counts were 1 per speech. The hint now says how to recover from a wrong count. Accepted: a mixed-case "Name:" that occurs only once still rejoins the speech above, guarding against "Well: I suppose so" (caseless names are exempt), and the period and own-line layouts need names in capitals. Post-audit assessment: correctness risk 3 → 2 for common scripts; technical confidence stays 3 (real PDFs vary more than any test set).
- **#005 CSV Checkup.** The reader is sound against the hard cases (delimiters, BOM, CR, LF, and CRLF, quoted delimiters and newlines, escaped quotes, ragged rows, duplicate and empty headers, leading zeros, decimal commas, 12 MB in about 1.5 s). Defects fixed: UTF-16 (Excel "Unicode Text", accepted as .txt) fell back to Windows-1252 and produced garbage. Slash dates were read month-first per value unless the day was over 12, so day-first columns could show a backwards range, and mixed orders went unflagged. Excel-mangled long IDs (1.23457E+15) passed as ordinary decimals. Formula-injection text (=, +, -, @) was never flagged, in a tool whose users then open files in spreadsheets. The only output (Markdown report) carries no injection risk. Accepted: "NA" and "None" count as missing (the pandas convention). Decimal commas are assumed only for semicolon files, so European TSVs show "1,5" as text. Post-audit assessment: technical confidence 4 → 5; correctness risk stays 2.
- **#023 Discussion Map.** Timing integrity holds: wall-clock offsets, so backgrounding, screen lock, reload, midnight, and DST don't drift. Same-speaker taps are ignored, Undo restores the previous speaker, and talk plus pauses equals the elapsed time (new test). Defects fixed: editing a name (a typo fix mid-discussion) made a new person and orphaned their turns; same-line renames now keep identity, while a removal plus an addition doesn't transfer turns. Repeated names were merged silently (the hint now matches Playing Time and Secret Santa). Turns beyond 5,000 were dropped on reload (the cap is now 50,000). Wording now says talk time is tap-to-tap, credits silence to the last speaker unless Pause is tapped, and isn't a measure of what was said. Accepted: no wake lock (frequent taps keep the screen awake), and Pause records silence without stopping the clock. No score change.
- **#021 Family Stories (targeted).** Highest data-loss risk in Labs, confirmed and reduced. An answer existed only in memory until Stop, so a reload, closed tab, background discard, or crash mid-answer lost all of it. Now each one-second MediaRecorder chunk is written to IndexedDB (v2 adds `drafts` and `parts`, keyed by [draft, n]). Unfinished drafts are reassembled into clips on the next load (tested: a reload after 3.6 s recovered 2.9 s of decodable audio), skipping any draft written in the last 5 s, which may be live in another tab, and rechecking after 6 s. Recovery runs one pass at a time, so it can't duplicate. A full device at Stop used to lose the take; it now offers a direct download. An old tab blocking the upgrade gets its own message. Download all, ZIP (UTF-8 names, checked by other tools), refusal and quota messages, and download-now wording were already sound. The v1 to v2 upgrade keeps existing data (tested). Untested: Safari's fragmented-MP4 chunks, though concatenation is the documented behavior. Post-audit assessment: user-data-loss risk 5 → 4; browser eviction of stored audio remains the dominant risk, mitigated only by downloads.
- **#019 Form Check (targeted).** No material defect found where testable. An MP4 recorded in-browser, with its tkhd matrix set to a 90° rotation as phones write it, reports rotated dimensions (180×320). It displays portrait, and "Save frame" draws it rotated: the corner marker lands where expected, so drawings, kept in rotated video pixels, stay aligned. Frame steps land mid-frame ((frame + 0.5)/fps), so rounding can't skip a frame, and steps accumulate across long variable-rate frames. WebM files with no stated duration are measured by seeking to the end. An unreadable file shows a clear message suggesting Safari, Chrome, or H.264 MP4. Two videos fit at 360 px. Untested: Safari's drawImage with rotated video, real HEVC .mov files from iPhones, and 4K memory on phones. Post-audit assessment: technical confidence 2 → 3 (rotation verified), no other change.

## Post-audit assessment (Batch 04)

The Batch 03 scores above stay as they were. This table re-scores only the criteria the Batch 04 audits changed, with the reason, giving post-audit totals (maximum 65).

| # | Experiment | Changed | Batch 03 total | Post-audit total | Why |
|---|---|---|---|---|---|
| 002 | Photo Scrub | Tech 4 → 5, Corr† 3 → 2 | 48 | **50** | Independent canary check of every metadata class; PNG orientation and file-name dates fixed |
| 024 | Ranked Choice Count | Tech 4 → 5 | 48 | **49** | Verified against a rule-text reference over 4,000 elections; simultaneous-quota defect fixed. Correctness risk stays high by nature |
| 003 | Fair Share | Loss† 3 → 2 | 47 | **48** | Overwriting a different saved copy now warns; settle-up proven minimal |
| 018 | Off Book | Corr† 3 → 2 | 47 | **48** | Silent misassignment of numbered characters fixed; caseless scripts work |
| 005 | CSV Checkup | Tech 4 → 5 | 46 | **47** | Hard-case sweep, UTF-16 and date order fixed |
| 017 | Frost Dates | none | 48 | 48 | Method matched NOAA's framing; fixes were a day and two failure modes |
| 023 | Discussion Map | none | 46 | 46 | Timing integrity held; fixes were identity and wording |
| 021 | Family Stories | Loss† 5 → 4 | 43 | **44** | Interrupted answers are recovered; browser eviction remains |
| 019 | Form Check | Tech 2 → 3 | 43 | **44** | Rotation path verified in Chromium; Safari unverified |

Photo Scrub reaches the tier A threshold (50) on this assessment. Its usefulness and recurring need are unchanged, though, and phones increasingly strip location when sharing, so it deserves tier A consideration rather than automatic promotion. Ranked Choice Count (49) is close, held back by inherent correctness risk and occasional use.

## Batch 05 findings

Audits of the eight remaining tier C experiments (2026-10-10). Earlier tables stay as they were. Where evidence changes a criterion, the post-Batch-05 assessment at the end records it separately.

- **#025 Stall Till.** Arithmetic verified independently. A browser script rang up 30 random sales (cash, exact and quick tenders, card, other, delete plus undo, delete) and kept its own ledger. Takings, method totals, expected cash, per-item counts, and CSV rows all matched. `floatToKeep` matched a brute-force search (largest sum under the target, then the most pieces) in 3,000 of 3,000 random boxes. Defects fixed:
  - `parseMoney` silently misread input (yen "12,5" → ¥125, "3.50" → ¥350, "1,234.567" USD → $1,234,567, "1.2.3" → 12.30 €). It now refuses more decimals than the currency has, and resolves the ambiguous "3.505" by the device's decimal mark.
  - Switching between currencies with different decimals reinterpreted every stored amount 100-fold (300 typed as dollars became ¥30,000). Amounts now keep the typed numbers, exactly, or with a confirmation when cents would round.
  - The storage-failure warning promised in a code comment didn't exist; now it does.
  - A sale with unreadable lines was dropped from the day; it's now kept by its total. Wholly unreadable data was overwritten by the fresh state; it's now backed up under `labs:stall-till:unreadable` and offered as a download.
  - The CSV had no dates (ambiguous after midnight) and a UTC file name; both are local now. Defusing came after quoting, so quoted formulas went through. In Stall Till the Items cell always starts with a digit, so it wasn't exploitable there; in Ranked Choice Count a candidate name starts the cell, so it was. Both are fixed.

  Post-audit assessment: technical confidence 4 → 5, user-data-loss risk 4 → 3 (silent loss paths closed; one browser still holds the day).
- **#008 Serve Time.** Scheduling verified by properties, not by re-implementing it. On 3,000 random plans (1–5 dishes, 0- to 2,880-minute steps, any month, delays partway through), every dish ends at serving time, durations are preserved, steps are contiguous, and a delay moves exactly the steps starting after it plus serving time. Defect fixed: oven clashes grouped temperatures by gaps between neighbors, so 180/190/200 °C (or longer chains) counted as one oven; `ovensNeeded` now counts from the lowest, so each oven spans the tolerance (brute-force partitions agree in 4,000/4,000 cases). Wording: USDA FSIS says thermometers, not time or color, show doneness, and advises cooking stuffing separately. So the example no longer stuffs the bird, one line says times aren't doneness, and the chime note says "on screen" (backgrounded mobile pages are suspended). Accepted: 15-minute preheat default, a temperature tolerance rather than oven capacity, and up to one minute of timer throttling in desktop background tabs. Post-audit assessment: correctness risk 3 → 2.
- **#015 Back Row.** Reference cases recomputed by hand from eye-chart geometry, not from the code: a 20/20 capital subtends 5′, so 8.87 mm at 20 ft and 8.73 mm at 6 m; a 3 m screen at 12 m needs 52.4 mm comfortable capitals, which is 24 pt on PowerPoint's 540 pt-tall slide. The browser matched at 12, 15, and 20 m, for 20/20 and 20/40, in meters and feet, and the true-size width and blur matched by hand (566.9 px, 0.69 px). Defects fixed:
  - Slide points had no stated basis. A font's point size is relative to the slide: PowerPoint is 13.33 × 7.5 in (540 pt tall), Google Slides 10 × 5.625 in (405 pt), Keynote 1920 × 1080 (1080 pt). The single number suited PowerPoint; in Keynote it was half what's needed. All three are now named.
  - The true-size view took away the observer's own 20/20 blur by subtraction, but Gaussian blurs add in quadrature. At 20/40 it added 1σ instead of √3σ, about 42% too little.
  - The card calibration bar used the card's long side (85.6 mm), wider than any phone held upright: the page scrolled sideways at 320 px (340 px of content), and the card couldn't be matched. It now uses the short side (53.98 mm). Verified at 320 and 375 px, including a phone calibration.
  - Wording: "Anything you can't read here, they can't read either" was false by default. On a desktop the close-up is drawn at about true size (582 vs 567 px), so the observer's own eyes add blur and near-limit text looks worse than the viewer sees it. The 10 pt sample line looks unreadable at 12 m, where the model's limit is 8 pt. The note now says so and points to the sizes. A sharpness-only limitation now names contrast, glare, dim rooms, and thin fonts. "It can't be read at all" is now "too small to read from there".

  Accepted: 0.7 cap height (Calibri is about 0.644, so about 8% under), 0.6σ blur calibration (a modeling choice, not a fitted psychophysical one), the 4,000 px true-size cap near the front (blur scale off by under a pixel), and "0.35 m" shown as "0.4 m". Post-audit assessment: technical confidence 3 → 4, correctness risk 3 → 2.
- **#004 Clean Paste.** Verified on real PDFs, not only hand-made strings. A three-page article (justified, CSS auto-hyphenation, a running header and page numbers through Chromium's print templates) was read back by pypdf and by macOS PDFKit, which is Preview's engine. Against the article's own paragraphs, the cleaned text has 0 word differences from both, with 13 split words rejoined and 6 furniture lines removed. A hostile stress set (26 cases, each expectation written from the input text) and the 18 earlier tests pass; 4,000-line pathological inputs take under 100 ms. Defects fixed:
  - Silent deletion. Any bare 1–4 digit line was deleted as a page number: an email's door code, "room 204", a table copied cell by cell, a "1984" title. Any short line repeated 3+ times at least 15 lines apart was deleted as a header: email signatures, transcript speaker labels, "Key points" in every chapter, a far-apart chorus. Removal now needs evidence of a page break: a page-only form ("Page 3 of 10", "- 4 -"), a sentence running across the line, the next page's number 15+ lines away, a repeated line beside page numbers on 2+ pages, other furniture beside it, or a PDF copy (10+ lines, no blank lines) with no other number within 5 lines. The summary now names removed lines and reports ">" removal.
  - PDFKit extracts typeset hyphens as U+2010, which wasn't recognized, so Preview copies kept 11 of 13 split words broken ("pa‐ per"). U+2010 now counts as a hyphen everywhere hyphens are checked.
  - Wrap detection used only line lengths, so evenly measured verse (a sonnet, Dickinson) and table rows merged into paragraphs. It now also requires prose's lowercase run-ons: under 25% lowercase starts among 3+ cased next lines means verse, a table, or a list. Lines in capitals throughout don't count, so licences still join.
  - Hyphens inside URLs and email addresses were deleted (coastal-studies became coastalstudies). Spaced dashes lost their space ("century –which"). Long title-case headings merged into the next paragraph. Indentation was stripped even with every option off.

  Accepted: in PDF copies, a paragraph whose last line runs the full width joins the next one (only about 1 in 5 such lines ends a paragraph, so joining is the better bet, and no words are lost). A compound split at its own hyphen (self-esteem) needs the hyphenated form elsewhere in the text. Short code joins when rejoining is on. Tabs become spaces under "Fix odd characters and spaces". Post-audit assessment: technical confidence 3 → 4, correctness risk 3 → 2.
- **#010 Gallery Wall.** Geometry recomputed independently. Four layouts were worked out by hand: a row on a wall; two-hook and one-hook frames top-aligned on a mark; a 2 × 2 grid in centimeters; three frames over one. 5,000 random plans were checked against requirements, not the algorithm: the box hugs the frames; centered and at the height asked; nails at the drop and spread; rows a gap apart and lined up as chosen; full-row columns as wide as their widest frame; a short last row a gap apart and centered. Defect fixed: column widths included the short last row's frames, so a wide frame there widened its column for the rows above. With three 10 in frames over a 50 in one, the top row sat 10 in off center with a 23 in gap (frames 2 and 3 at 115 and 128 in, not 95 and 108), and the group's stated width was 76 in, not 50. 752 of the 5,000 random plans failed before the fix, none after. Columns now come from full rows, and the group is as wide as its widest row. Wording: "exactly where each nail goes" is gone. The result now says a mark is where the wire or hook rests (with a picture hook, the hook's bottom goes on the mark, not its nail) and that marks are only as good as the measurements. Printed (cm, six frames): two Letter pages with the drawing and every nail, matching the hand arithmetic. Accepted: sixteenth-inch and millimeter display (tape-measure resolution); unit switches round the height to whole units (all nails move together); "16-1/2" isn't read (it shows as invalid). Post-audit assessment: technical confidence 4 → 5, correctness risk 3 → 2.
- **#013 In Tune.** Pitch detection was verified with generated signals against their own frequencies (not another detector), at 48 and 44.1 kHz:
  - Sines and voice-like harmonic tones from G2 to D5 read within 0.3 cents (p95).
  - Sung-vowel models through 100–300 Hz high-pass "microphones", and with the fundamental 60 dB down, gave no octave errors; the odd harmonics keep the period.
  - Noise gives nothing (0 of 500). At an SNR of 10 dB readings stay within 16 cents; at 5 dB it gives nothing rather than a wrong note.

  End to end in the page (a Web Audio stand-in microphone through the real Engine, median, and hold), steady notes match in about 2.6 s (1.55 s of reference plus the 1 s hold). Vibrato up to ±75 cents matches on Normal, and ±50 on Strict. Defects fixed:
  - A suspended AudioContext keeps returning its analyser's last frame, so after a pause mid-note (iOS interrupts audio for calls) the stale note was scored: "In tune" 1 s after the singer stopped. Readings now stop unless the context is running, with a "Resume listening" button.
  - A microphone track ending (unplugged, taken, revoked) left "Sing when you're ready…" forever; now there's an alert.
  - Every getUserMedia failure said to allow the microphone in settings. NotFound and NotReadable now get their own messages.
  - Notes above maxHz (1,100) read an octave or more low: 1,250 Hz as 625 Hz in 200 of 200 trials, a 2 kHz whistle as 1 kHz. An octave above a D5 target therefore scored in tune. A dip bottoming out below tauMin now gives nothing, and 70–1,100 Hz still reads correctly.

  Accepted: a sound dominated by even harmonics (odd harmonics under about 7% of the power) can still read an octave high at the 0.15 threshold. Untested: real voices, phone microphones, and a real call interrupting iOS Safari; generated audio is not singing. No vocal-health or clinical claims were found. Post-audit assessment: technical confidence 2 → 3; correctness risk stays 3 until real voices are tested.
- **#009 Tear-Off Flyer.** Real PDFs, inspected independently rather than by screenshot. Five flyers went through Chromium's printToPDF with background graphics off (the dialog default): Letter with a photo in the bold style; A4 serif with 900 characters of details; A4 Chinese with 12 tabs; Letter Arabic; Letter with a 52-character tab. pypdf: every file is exactly 1 page, Letter 612 × 792 pt and A4 594.96 × 841.92 pt (210 × 297 mm to Chromium's rounding), with all text present. macOS PDFKit renders (a second engine): the bold box and photo print with backgrounds off, the margins hold, and the tab count is right. Defects fixed:
  - The tabs' fit (sized from 16 down to 7 pt) wasn't part of the overflow warning. Tab text longer than about 42 characters printed cut off with no warning: "…call or text 555-0134-2287" became "…call or text 5" on all 12 tabs. A tab-specific warning now shows.
  - Vertical tabs are turned 180° for Latin text, but CJK glyphs stay upright in vertical-rl, so Chinese names printed upside down beside sideways digits. `text-orientation: sideways` makes every script run the same way.

  Accepted: Arabic tabs read top to bottom (the RTL inline direction under the turn), which is readable but opposite to Latin. Untested: Safari's and Firefox's print, and printers whose paper differs from the flyer's. Post-audit assessment: technical confidence 4 → 5; correctness risk stays 2.
- **#012 Glance.** Daily integrity was checked against ordinary use, without anti-cheat machinery. The rounds depend only on the local date string and were identical in all 9 zones tested: New York, Santiago and Asunción (midnight DST changes), Beirut, London, Lord Howe, Chatham, Kolkata, and UTC. streak() and today() were checked for every day of 2026–2027 in each. Saves are synchronous, so an answer survives an immediate close or reload, and a double submit writes one guess. Defects fixed:
  - Two tabs: each saved the history it had loaded, so an older tab erased a newer one's answers, including whole days (a finished 2026-10-03 vanished in the test), and accepted a second answer for a round already answered. Saves now merge with storage, a round counts once, and the storage event moves a stale tab on.
  - A reload, or a mobile page discard, after the dots were shown restarted the round with "Show the dots", giving a second look at the same field. A `seen` marker now opens that round at the guess, with a note.
  - The field's aria-label read "A field of 13 shapes" during the flash, which was the answer, for screen-reader users and anyone inspecting the page. It no longer has a count.

  Accepted: the puzzle changes at each visitor's local midnight; a tab left open past midnight keeps its day until reloaded; clearing storage resets everything; the game is visual by nature. Post-audit assessment: user-data-loss risk 2 → 1.

