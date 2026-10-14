# Batch 08 research, thread B: small producers' rule-driven checks (B1 average-quantity checks, B2 other)

Status: COMPLETE, 2026-10-13. Read-only desk research (WebSearch and WebFetch only; nobody contacted).
Budget used: 18 of 18 searches, 12 of 12 fetches. Four fetches were unproductive: an IFSQN thread (connection reset), the EUR-Lex summary (page came back empty), an Argyll and Bute small-bakers PDF (unreadable; the fetch tool auto-saved it into the session's tool-results folder, I did not open it), and a SafetyCulture template page (redirected, no budget left to follow).
Labels: (verified) = read on an official or primary page; (source claim) = a page or search summary says so, not read in full; (inference) = my judgment.

## Outcomes at a glance
- B1 average-quantity checks: HOLD. The general "average-system checker for small producers" is REJECT. The only form that survives the gate is a narrow small-bakers loaf-weight check, and even that has no evidence of demand beyond one old forum thread.
- B2 other checks: nothing passes. Alcohol duty was taken through a light gate and REJECTED (HMRC's own free calculators; yearly data changes). Six other ideas are listed with one-line reasons.
- Strongest candidate overall: B1's bakers' variant, on HOLD, not BUILD.

---

## B1. Average-quantity checks for prepacked goods

### Reference block (rules as read; a builder must re-check constants first)
Source: Weights and Measures (Packaged Goods) Regulations 2006, SI 2006/659, https://www.legislation.gov.uk/uksi/2006/659/made (verified). I read the original 2006 text "as made", NOT the revised text (amended since Brexit), so re-check the revised version before coding any constant.
- Scope (reg 2, 3): a "package" is goods placed in a container without the purchaser present, in a constant nominal quantity chosen by the packer, 5 g/ml to 25 kg/l. Applies to food and non-food.
- Three packers' rules (reg 4(1)): (a) average contents not below nominal; (b) the proportion of packages below nominal by more than the tolerable negative error (TNE) must be small enough to pass the Schedule 2 reference test (CTSI Business Companion says generally no more than 2.5%, about 1 in 40); (c) no package below nominal by more than 2 x TNE.
- TNE table (Sch 3; where TNE is a percentage it is rounded UP to 0.1 g/ml): 5-50 g/ml = 9%; over 50-100 = 4.5 g; over 100-200 = 4.5%; over 200-300 = 9 g; over 300-500 = 3%; over 500-1000 = 15 g; over 1000-10000 = 1.5%; over 10000-15000 = 150 g; over 15000 = 1%.
- Reference test (Sch 2; what inspectors use): non-destructive single sampling: batch 100-500 sample 50, accept up to 3 defective; batch 501-3200 sample 80, accept up to 5; batch 3201+ sample 125, accept up to 7 (double-sampling and destructive plans also exist). Batches UNDER 100 are tested 100%. Average test uses a 0.995-confidence factor with n-1 degrees of freedom; factors seen in my read: 0.503 (n=30), 0.379 (n=50), 0.640 (n=20); the formulas were images, so they were not captured (inference: these equal t/sqrt(n), so the n=80 and n=125 factors can be derived, but verify). Measurement error must be no more than one-fifth of the TNE.
- Reg 9: a packer must either measure every package or run sufficiently rigorous sampling checks, with suitable equipment, and keep records showing corrections and adjustments found necessary. Records are kept until the earlier of the pack's consume-by date or one year after it leaves the packer.
- Reg 8 quantity-marking minimum character heights (apply to every packer, minimum system included): by weight up to 50 g 2 mm; over 50-200 g 3 mm; over 200 g-1 kg 4 mm; over 1 kg 6 mm; by volume up to 5 cl 2 mm; over 5-20 cl 3 mm; over 20 cl-1 l 4 mm; over 1 l 6 mm.
- Penalties/defences: level 5 fine on summary conviction; defences include all reasonable precautions and due diligence (reg 19(4)) and shortfall due entirely to desiccation after packing (reg 19(3), relevant to soap, candles, bread).
- The Regulations themselves never use the term "minimum system" (verified); the gov.uk guidance below does.

Official guidance (all verified unless stated):
- gov.uk, Weights and measures: the law, Equipment and records, https://www.gov.uk/weights-measures-and-packaging-the-law/equipment-and-records : if you measure every package, or pack using the minimum system, no records are needed; the average system needs recorded sample-batch results showing the three rules are met. Domestic scales may not be used to weigh goods you intend to sell. (Its wording on retention, "at least one year", is looser than reg 9(5).)
- OPSS, https://www.gov.uk/guidance/packaged-goods-weights-and-measures-regulations (updated 20 Sep 2024): no small-business concession; the e-mark is voluntary and means the packer declares the average system is met; links no calculators or templates.
- CTSI Business Companion, https://www.businesscompanion.info/en/quick-guides/weights-and-measures/packaged-goods-average-quantity (reviewed July 2026): records = product, batch number, date, packs in batch, number checked, results, corrections; equipment accuracy about 0.2 x TNE; under 50 checked means add a sampling allowance to the target fill; process variability above half the TNE means the target fill must exceed the declared quantity; gives NO sample sizes or frequencies; mentions NO free calculators, spreadsheets or software; goods sold loose or made to order in front of the customer are outside the Regulations; e-mark needs 5 g/ml to 10 kg/l and at least 3 mm height.
- Small-bakers guidance (Trading Standards, hosted by Pembrokeshire, reviewed June 2024), https://cms.pembrokeshire.gov.uk/trading-standards-information/small-bakers-and-average-weight : loaves over 300 g in constant pre-set quantities are covered; a check on baked loaves before sale is a legal requirement; sample 3 loaves for batches of 1-49, 5 for 50-99, 7 for 100-199, 11 for 200 or more; a failed sample means weighing the whole batch; hot weighing needs the baker's own measured bake-loss allowance (example: a 400 g loaf loses about 30 g, so hot target 430 g average and none below 406 g; 800 g loaf, 840 g and 810 g); 400 g loaf minimum acceptable 388 g and floor 376 g; 800 g loaf 785 g and 770 g; records legally required only for wrapped bread but recommended as due-diligence evidence; scales must read to 2 g or better and be UKCA/CE with M mark or crown-stamped; the guidance offers no forms, spreadsheets or templates; it names making every loaf at least the stated weight as the simplest route. I did not capture the exact sample-level pass criteria; read them on the page before building anything.

### Gate
E1 Audience.
- Packers of fixed-quantity goods by weight/volume made up away from the customer who choose the average system: filler-line producers with batches of 100+ (honey, jam, coffee, chocolate, soap/candles sold by weight) and, most specifically, small bakers selling loaves over 300 g at fixed weights (verified scope).
- Not the audience: anyone who weighs every pack or fills to at least the stated amount (no records needed, verified); anyone packing in front of the customer, selling loose, or making to order in their presence (outside the Regulations, verified in reg 2 and Business Companion); variable-weight (catchweight) packs (outside the average system, source claim).

E2 Exact job.
- Before: a batch has just been filled or baked. Job: pick a random sample, weigh on suitable scales, compute average and the count below nominal minus TNE and below nominal minus 2 x TNE, decide pass or fail, adjust the filler or dough piece weight, write a record.
- After: a verdict plus a dated batch record (product, batch, date, packs in batch, number checked, results, corrections) held about 12 months for Trading Standards; for bakers, hot-weight targets that already include bake loss.

E3 Evidence of friction.
- Governed by rule and offence-bearing (verified): reg 4, 9, 13, 18.
- Official guidance is thin: the Business Companion gives no sample sizes or frequencies (verified); the old Code of Practical Guidance for Packers and Importers was not found online, and a forum post says only an out-of-print HMSO copy exists (source claim).
- Practitioner confusion (verified, thread read): IFSQN thread "Minimum weight checks before packaging", opened Dec 2011, a small bakery with no checkweigher asking the legal minimum number of checks; replies cite UK, EU, US, Canadian and Russian schemes, no agreed answer; the one shared Excel tool (Italian) had a dead link by Feb 2024; same questions were still being asked in 2024. https://ifsqn.com/forum/index.php/topic/17631-minimum-weight-checks-before-packaging/?ampmode=1
- Enforcement (source claim from search summaries, not read on primary pages): NI plant bakeries fined for light bread and for having no weight checks or records (Sunray/Home Bakeries GBP 525 on 21 charges; Irwin's GBP 1,500, 38 of 51 600 g loaves light, blamed on bake loss) https://bakeryinfo.co.uk/news/fine-for-light-loaves/611364.article ; retail monitoring found about 3-4% of roughly 10,000 packs short weight (Scotland, 2022 and 2024) https://www.tradingstandards.uk/news-policy-campaigns/news-room/2024/scottish-trading-standards-puts-spotlight-on-pricing-and-short-weight-issues-affecting-consumers/ ; a Gateshead report found 27 of 181 product lines non-compliant, mostly on the average rule. None of this is shown to involve artisan or micro producers (inference).
- Audit pull (source claim): SALSA-type audit checklists ask for quantity-control procedures and calibrated scales; I could not read SALSA's own clause. This suggests small suppliers to retailers must show a documented system.
- Searches of beekeeping/honey and coffee forums found nothing about weight checks (only jar sizes and why honey is sold by weight). No UK Business Forums thread surfaced. (inference: not a visible pain point there; search was limited.)

E4 Alternatives (searched by job words: average weight check, packers' rules, TNE calculator, weight check record, loaf weight check, bake loss).
- Paper diary or notebook, which the bakers' guidance itself suggests (verified).
- Official guidance pages and leaflets: gov.uk, OPSS, CTSI Business Companion, council pages (Pembrokeshire, Argyll and Bute, Bromley) (verified or source claim).
- Weighing-equipment vendors: Avery Weigh-Tronix quick guide, SG Systems average/minimum weight SPC pages, a FoodProcessing article on automating the packers' rules; checkweigher makers bundle SPC software; prices not found (source claim).
- SafetyCulture public template library lists an average-weights QA record form (title and URL only, page not read; likely needs their app and an account) (source claim).
- IFSQN member spreadsheets: one, in Italian, now dead (verified).
- Free browser TNE calculator, free app, or Trading Standards spreadsheet: none found in four targeted searches (inference; absence from search is not proof).
- Free bread bake-loss scaling calculators exist (Calculover; the rule is dough weight = target baked weight / (1 - loss rate)) (source claim).
- Built-in alternative: weigh every pack or fill to at least the stated weight (verified).
- US: NIST Handbook 133 is free and includes sample plans and Appendix C report forms; no free calculator found (source claim).

E5 Strongest incumbent. For the smallest producers, the minimum route: weigh every pack on a good scale and fill to at least the stated weight; it needs no records and no statistics (verified). For bakers, the council guidance plus a diary and a sticky note of hot-weight targets. For filler lines, a checkweigher with its own SPC software. No free tool that gives a three-rule verdict and a record was found, but nothing shows anyone is missing one.

E6 Labs wedge. A local page could (1) give TNE, minimum and floor weights for any nominal quantity, (2) take a pasted list of sample weights and return the three-rule verdict, (3) compute hot-weight targets from measured bake loss, (4) keep and print or export the batch record, on a phone at the oven with no account. Real but modest (inference): it replaces a calculator and a notebook. A cleaner UI is not the justification.

E7 Labs fit. Passes the hard limits: all inputs are public tables, static, no account, data stays local (inference). Cautions: a pass verdict reads as legal assurance; records must be kept about a year while browser storage can be cleared, so export or print would be essential; constants and the Schedule 2 average-test factors must be re-read from the revised legislation.

E8 Falsification (strongest reasons not to build).
1. The minimum route needs no records or statistics (verified), and the reference test needs 100% weighing for batches under 100 and samples of 50-125 above that (verified). So at micro scale the average system gives almost nothing, and at filler-line scale producers usually have checkweigher software. The tool serves a narrow middle band.
2. There is no official sampling plan for general packers (Business Companion gives none), so a tool would have to pick a plan and imply it counts as sufficiently rigorous.
3. Demand evidence is thin: one unresolved forum thread, plant-bakery fines, retail monitoring of manufactured goods. No small-producer forum complaints found.
4. The bakers' check is weigh 3-11 loaves, compare to two printed numbers; a laminated card does it. The only fiddly part is one subtraction for bake loss.

### Answers to the brief's specific questions
- Packed in front of the customer, sold loose, made to order: not covered by these Regulations (verified, reg 2 definition and Business Companion). Other weights and measures law applies; I did not research the Weights and Measures Act 1985 (inference that it does).
- Is the minimum system an easier alternative? Yes (verified on gov.uk): no sampling and no records, at the cost of overfill. Bread guidance says making every loaf at least the stated weight satisfies all three rules (verified).
- Does that make the average-system tool pointless for the smallest producers? Largely yes (inference on verified facts): they weigh each pack anyway, and Schedule 2 demands full testing under 100 packs. The overfill saved by averaging is small next to the sampling effort at micro scale.
- Check also: EU. Directive 76/211/EEC is consolidated on EUR-Lex (amended by 2007/45/EC and Regulation 2019/1243) (source claim); the page could not be read by the fetch tool, so the EU ℮-mark specifics and any difference in the TNE table are NOT verified here.
- US: NIST Handbook 133 sets an average test plus a maximum allowable variation for individual packs, applied by inspectors; no free calculator found; not useful for the Labs decision (source claim and inference).

Recommended outcome: HOLD (general average-system tool: REJECT; only a narrow small-bakers loaf-weight check could ever be built, and only after some sign of demand).
Deciding facts:
1. Official guidance says no records are needed for the minimum route or weighing every pack. https://www.gov.uk/weights-measures-and-packaging-the-law/equipment-and-records
2. The reference test needs 100% testing under 100 packs and samples of 50-125 above; the average system only pays off at filler-line scale. https://www.legislation.gov.uk/uksi/2006/659/made
3. Bakers have an official small-batch plan (3/5/7/11) and fiddly bake-loss arithmetic, yet the guidance offers no forms or templates, the one clear gap I found. https://cms.pembrokeshire.gov.uk/trading-standards-information/small-bakers-and-average-weight
4. Demand evidence is one forum thread unresolved since 2011 and plant-bakery fines; no sign of artisan-producer complaints. https://ifsqn.com/forum/index.php/topic/17631-minimum-weight-checks-before-packaging/?ampmode=1

If ever built: re-read the revised SI 2006/659, capture Schedule 2 para 4 formulas, read the bakers' sample pass criteria on the Pembrokeshire page, and ask Trading Standards (a human step, not done here) whether a tool-made record is acceptable.

---

## B2. Other rule-driven recurring checks for small food or craft producers

None has real evidence of unmet friction. Alcohol duty was the only one taken through a gate (lightly).

### Alcohol duty / Small Producer Relief for small brewers and cideries: REJECT
- E1/E2: producers under 4,500 hl of pure alcohol working out their duty rate and relief before monthly returns (verified scope).
- E3: governed by rule, recurring (annual recalculation, monthly returns), fiddly (band lookup: threshold, marginal discount, cumulative discount) (verified).
- E4/E5: HMRC's own guidance (updated 1 Feb 2026) links an SPR calculator and an Alcohol Duty rates calculator and also gives the manual method (verified); paid brewery software such as Breww automates duty rates (source claim). https://www.gov.uk/guidance/how-to-work-out-your-alcohol-duty-rates-if-youre-eligible-for-small-producer-relief
- E6/E7/E8: no wedge over HMRC's free tools; discount tables changed on 1 Feb 2025 and 1 Feb 2026 and the rate in force at production applies, so a static page needs yearly, versioned data and a stale table could cause under-payment; the return itself needs HMRC's login service (verified). Fails on incumbent and on upkeep.

### One-line reasons for the rest
- Traffic-light front-of-pack thresholds: REJECT. The scheme is voluntary, micro producers selling directly or locally are exempt from a nutrition declaration (under 10 staff, small turnover; Business Companion and Food Standards Scotland decision tree, source claim), and the thresholds are a four-row lookup (food per 100 g: fat 3 / 17.5 g, saturates 1.5 / 5 g, sugars 5 / 22.5 g, salt 0.3 / 1.5 g; drinks per 100 ml lower), so a cleaner UI is the only gain. https://www.foodstandards.gov.scot/downloads/Nutrition_declaration_decision_tree.pdf
- Jam and marmalade declarations (fruit g per 100 g finished product, total sugar by refractometer at 20 C, tolerance 3 degrees): REJECT. One division (fruit used, net of water added to extracts, over finished weight) plus a refractometer reading, done per recipe rather than per batch; no friction evidence found. (source claim: https://www.legislation.gov.uk/nisr/2003/519/regulation/5/made ; FSAI jams guidance)
- Batch/lot records and date coding: REJECT (inference). There is no calculation to automate, retention duties clash with browser-only storage that can be cleared, paper diaries and spreadsheets already serve, and it overlaps the settled temperature-log decision.
- Ingredient order and quantitative ingredient percentages from a recipe: REJECT (inference). The output is the label, whose riskiest field is allergen emphasis, which is already settled as off-limits.
- Net-quantity label check (character height by quantity, units, e-mark 3 mm): REJECT (inference). Reg 8 is a two-column lookup (verified) done once per label design; a cleaner UI only.
- Handmade cosmetics, soap, candle formula or fragrance-limit checks: REJECT (inference, not searched). They need large public ingredient datasets, a legally required qualified safety assessor stays necessary, and a pass would be false assurance, the same risk class as allergens.
- Honey moisture (refractometer to percent against the 20% limit) and hallmark weight exemptions for jewellers: not researched; single-threshold or table lookups that trade bodies and assay offices already publish (inference); no evidence gathered, so no recommendation beyond REJECT as unevidenced.
