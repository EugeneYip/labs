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

