# Thread B: inbreeding coefficients and mate choice from a breeder's own pedigree records

**Purpose:** gather the evidence for a Stage B opportunity check of one lead: a free browser page that opens a small breeder's own animal list (ID, sire, dam, sex, birth date; spreadsheet or CSV), checks it for impossible pedigrees, works out each animal's coefficient of inbreeding (COI) and the relationship between any two, ranks the possible mates for a chosen animal by their offspring's COI, and prints a pedigree, with nothing uploaded. Audience under test: small breeders of livestock and fancy animals outside the big registries' tools (rare-breed goats, sheep, pigs, cattle; rabbits, cavies, poultry, pigeons; cats; dogs outside a kennel club's database; conservation breeding).

**Prior record:** Batch 09 screened "pedigree inbreeding coefficients for small breed societies" out by inference only ("free online calculators and the Kennel Club's Mate Select for dogs exist", not searched): `.claude/batch-09/research/j-animals-land.md` line 132. Nothing else in Batches 07-10 covers it (`kw.py` on inbreeding, pedigree, breeder, herd, kinship, stud book, flock, litter).

**Budget:** at most 8 web searches and 8 page reads (WebFetch). Counted below as S1-S8 and R1-R8.

**Labels:** *verified* (read on an official or primary page; a vendor's or registry's own page is primary for what it says about its product), *source claim* (a page or a search snippet says so), *inference* (judgment). Short quotes only (under 15 words).

**Advisory only:** the main session decides and re-checks deciding claims.

## Summary

(written at the end)

## Log

### S1 (search 1 of 8): free inbreeding coefficient calculator import pedigree spreadsheet CSV breeders goats sheep rabbits

- The first page of "free COI calculator" hits are spam or SEO pages on unrelated domains (sa.reviveourhearts.com, klaviyobos18.klaviyo.com and the like): no real tool behind them (*source claim*, titles only; *inference* that they are spam).
- Free pedigree-analysis programs that take a pedigree file (*source claim*, search snippets; none read yet):
  - **ENDOG** (Gutiérrez and Goyache, Universidad Complutense de Madrid): free, Windows (Visual Basic); individual inbreeding and average relatedness for livestock populations. https://ucm.es/juanpablogutierrez , https://eprints.ucm.es/5704/
  - **EVA** (NordGen): free for Windows, Linux and Mac; monitors inbreeding and gives breeding recommendations for small farm-animal populations; needs consistent pedigree data. https://www.nordgen.org/our-work/farm-animals/the-eva-tool
  - **Retriever and Pointer**: free downloads, devised for dogs, used for any captive population including livestock (snippet; no URL captured beyond the search).
  - **PyPedal** (Python library: error checking, inbreeding, reports; plain-text input) and the PyPI package `inbreeding-calculator` (takes a nested dictionary, not a spreadsheet). https://pypi.org/project/inbreeding-calculator/
- *Inference:* the free tools that read a whole pedigree file are scientists' desktop programs or code libraries (installable software, file formats to learn), not a page a hobby breeder opens. Whether any of them is breeder-friendly is still to check (EVA and Retriever/Pointer especially).

### S2 (search 2 of 8): rabbit cavy goat pedigree software inbreeding coefficient COI Evans KinTraks Everbreed price

Paid or subscription breeder software that already computes COI (all *source claim*, search snippets and listings, none read):
- **Everbreed** (rabbits, also other livestock; app and web; subscription): choose a buck and a doe and it gives a "Relatedness Score" (its COI for the pair); support article "How to use the line breeding feature" https://support.everbreed.com/en/article/how-to-use-the-line-breeding-feature-wwxj6q/ ; App Store https://apps.apple.com/app/id1506912544 . A FarmKeep comparison page lists $9.99 and $29.99 tiers without saying which is which https://www.farmkeep.com/resources/farmkeep-vs-everbreed .
- **Evans Software Services** (rabbit and cavy pedigree and show records): Windows only; Mac users need virtualization (IAGARB page, https://iagarb.com/?p=241 area); a Reddit commenter calls it "one fee for life". No official price seen.
- **ZooEasy** (rabbit and goat editions among others): "percentage of inbreeding in each litter"; a listing gives $125.91 one-time (may be stale) https://sourceforge.net/software/product/ZooEasy/alternatives
- **Breeder Cloud Pro** (dog, cat, horse, goat, rabbit, sheep): from $6.99 a month, 30-day free trial https://www.softwareadvice.com/kennel/breeder-cloud-pro-profile/
- **Pigree** (cavy app): suggests compatible pairs with low COI https://mwm.ai/apps/pigree/6771519663 ; **Omniburrow** (a rabbitry app whose test docs site has a "lines and coi" page) https://docs.omniburrow-test.duckdns.org/docs/analytics/lines-and-coi ; a rabbit farm app listed for sale on Flippa earning about $360 a month https://flippa.com/11253533 .
- KinTraks: no result.
- A practitioner thread surfaced: r/MeatRabbitry "metrics and data collecting" (May 2024, via a mirror) https://lr.vern.cc/r/MeatRabbitry/comments/1cukfa8/metrics_and_data_collecting/ (not read).
- Academic/free code: CoeFR (Tohoku University; manual PDF) https://www.agri.tohoku.ac.jp/animalbreeding/program/CoeFR/CoeFR_English_Manual.pdf ; Schaeffer's Guelph notes on inbreeding and relationships https://animalbiosciences.uoguelph.ca/~bszk/inbreed.htm ; PyPedal paper https://aipl.arsusda.gov/publish/other/2007/PyPedal.pdf .
- *Inference:* for rabbits and cavies, the market is crowded with paid record-keeping apps that already put a COI on a planned pairing (Everbreed, Evans, ZooEasy, Pigree, Omniburrow, Breeder Cloud Pro). These are herd-management suites (litters, weights, sales, pedigrees), so the COI is one feature inside an account-based record. The gap Labs could fill is "free, no account, from the spreadsheet I already keep", not "a COI nobody offers".

### S3 (search 3 of 8): Grassroots Systems online herd book inbreeding coefficient planned mating breed society members rare breeds

- **Grassroots Systems** runs the online flock, herd and stud books of many UK breed societies (Southdown, Shropshire and Charollais sheep, St Croix sheep in the US, Exmoor and Highland ponies, Blue Texel and others); access by web browser is free to members, with a 'Guest' login where a society allows public access; RBST shares data with it; Defra asked it in 2026 to build a national inventory of native breeds' cryopreserved material (*source claim*, snippets of society pages: https://www.shropshire-sheep.co.uk/?p=1062 , https://exmoorponysociety.org.uk/announcement-from-the-exmoor-pony-society/ , https://www.highlandponysociety.com/2026/07/13/ , https://www.charollaissheep.com/wp-content/uploads/2024/11/grassroots-online-step-by-step-user-guide.pdf ).
- **Check Mate** (Grassroots, member-facing): pick a male and one of your own females; it shows a four-generation pedigree of the prospective offspring with common ancestors highlighted by generation; "free to use", under 'Manage my Animals' (*source claim*, snippet of the Southdown Sheep Society's news item, 17 March 2023: https://www.southdownsheepsociety.co.uk/news/2023/3/17/breeding-advice-available-to-all-members ). The snippet does not say Check Mate gives a COI number or ranks mates.
- **Full kinship analysis** is run by the breed society office through Grassroots, compared with the mean inbreeding of the live population; the Society notes it is skewed when pedigrees are incomplete or of different lengths, and that there is no absolute safe threshold (*source claim*, same page).
- A Hungarian study of the Gyimesi Racka sheep used Pedigree Viewer (free) on the full herd book (n = 16,947; mean COI 1.99%) (*source claim*, https://journal.uni-mate.hu/index.php/aweth/article/view/6351 ).
- *Inference:* for UK pedigree livestock registered with a society on Grassroots, the member already has the society's whole pedigree database plus a free common-ancestor check, and the office can run kinship reports. The idea's audience is therefore mainly animals outside such a registry (unregistered or grade herds, fancy animals, societies on paper or spreadsheets, cross-registry checks), or members who want ranked mates with a number rather than a four-generation picture.

### R1 (read 1 of 8): Southdown Sheep Society, "Breeding advice available to all members" (17 March 2023, Gail Sprake)

https://www.southdownsheepsociety.co.uk/news/2023/3/17/breeding-advice-available-to-all-members
- *Verified* (the society's own page, read through a summarising fetch): **Check Mate** in Grassroots online lets a member choose "any male and one of your own females" and shows a four-generation pedigree of the prospective offspring with common ancestors coloured by generation (orange first or second, yellow third, green fourth). The page gives no COI figure and no ranking of possible mates; it is "accessible to all members".
- *Verified:* a **full kinship analysis** is run by the breed society office through Grassroots, a "probability calculation" compared with the mean COI of the current live population; skewed when pedigrees are incomplete or of different lengths, or when breeders don't record deaths; "no absolute number" that is safe.
- *Inference:* even inside a Grassroots society, the member-side tool is a picture of shared ancestors in four generations, one pairing at a time; the number (and any comparison across several candidate rams) comes from the office on request. That is a real, narrow gap: a ranked list of mates with offspring COI over all known generations, done by the breeder at any time, is not what Check Mate gives. It is still a gap only for members willing to export or retype their animals, because the database itself sits with the society.

### S4 (search 4 of 8): free online COI calculator enter pedigree generations test mating breeders dogs cats goats "coefficient of inbreeding"

- Again, the top "free COI calculator" hits are near-duplicate spam pages with no tool (*inference*, titles).
- **pawlineR (cats):** a free, non-commercial tool written in R that runs in a web browser (an R app run locally through R/RStudio or hosted on a server); pedigree entry, checks parent-offspring relationships, Wright's COI, and "virtual breeding" of hypothetical matings; on GitHub; described in Frontiers in Veterinary Science, 2026 (*source claim*, snippets: https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2026.1749164/full ; a CPD provider's news item "Free-to-use cat inbreeding coefficient tool created in Germany" https://improveinternational.com/uk/news/free-to-use-cat-inbreeding-coefficient-tool-created-in-germany ). This is the closest free incumbent to the idea so far; whether it opens a spreadsheet, whether a public hosted copy exists, and whether it ranks mates are still to check (R2).
- **The Kennel Club's inbreeding calculators (dogs):** use "all our pedigree records" for a dog's COI or for the puppies of two potential mates, with the breed average for comparison; a COI lookup page (*source claim*, snippets: https://www.thekennelclub.org.uk/health-and-dog-care/health/health-testing-and-screening/inbreeding-calculators , https://thekennelclub.org.uk/search/inbreeding-co-efficient ). The KC's examples: 12.5% equals a grandfather-granddaughter or half-sibling mating, 25% a father-daughter or full-sibling mating (*source claim*).
- A cat source puts biologically meaningful inbreeding depression at F above 0.10 (*source claim*, via the Frontiers snippet).
- A practitioner thread surfaced: Wolfdog.org forum, Breeding https://wolfdog.org/forum/showthread.php?p=282868 (not read).

### R2 (read 2 of 8): Talbot, Weegh, Heider and Bleich, pawlineR, Frontiers in Veterinary Science 13 (2026), published 20 February 2026

https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2026.1749164/full (Hannover Medical School; read through a summarising fetch; *verified* for what the authors say about their own tool)
- **Input:** pedigrees "entered by users either manually or via spreadsheet import", with a template table and export and re-import; minimum fields an ID and sex; parents optional.
- **Checks:** duplicates, the same animal as sire and dam, sex mismatches, circular parentage ("structural validation"); no birth-date consistency check is described; it "cannot verify biological parentage".
- **COI:** Wright's coefficient through the R packages pedtools and ribd, using all available generations ("no ... artificial limit on generation depth"); unknown parents become founders with F = 0.
- **Not included:** mean kinship, ancestor loss, effective population size ("not included in this initial version"); no user-facing pairwise kinship table described; no ranking of possible mates. "Virtual breeding" is one sire and dam at a time.
- **Access:** no public hosted copy; run from GitHub in R/RStudio (installing R and packages) or on a private Shiny server; licence FUNCSA v1.0, non-commercial share-alike; tested on cats only, "can be extended to other species".
- **Bands it displays:** F < 0.0625 low, 0.0625-0.125 moderate, 0.125-0.25 high, 0.25 and above very high; cites depression "biologically significant above F = 0.10".
- **Need statement:** "many breeders struggle to implement efficient inbreeding-monitoring strategies"; "inconsistent systems for data storage and manual entry".
- *Inference:* this is the strongest free incumbent found so far and it confirms the design (spreadsheet in, structural checks, all-generation Wright COI, test matings). Its weak points for a hobby breeder are exactly Labs' wedge: it needs R installed (or someone's server), it is for cats, it ranks no mates, it has no date checks or kinship table. A peer-reviewed group building this in 2026 is also evidence the need is real and unmet by registries for at least one species. It is equally a warning that a well-resourced group judged an R app sufficient, so the audience may be small.

### S5 (search 5 of 8): thegoatspot OR backyardherds OR rabbittalk calculate inbreeding coefficient COI pedigree spreadsheet by hand

- Wasted on practitioner words: the search tool dropped the site names and returned spam pages plus academic items. Kept: a Japanese Poultry Science paper proposing a tabular method as safer than the path method "even when ... calculated by hand" on complicated pedigrees https://www.jstage.jst.go.jp/article/jpsa1964/8/4/8_4_245/_article ; the CRAN package FnR (`resume_inbreed`) https://search.r-project.org/CRAN/refmans/FnR/html/resume_inbreed.html (*source claim*, snippets).
- Hand method as commonly taught (*inference*, standard genetics, matches the snippets): F = sum over paths through each common ancestor A of (1/2)^(n1 + n2 + 1) x (1 + F_A); a shallow pedigree misses common ancestors and underestimates F; full-sibling offspring of unrelated parents give 25%.
- Next: retry with the search tool's domain filter on breeders' forums.

### S6 (search 6 of 8): inbreeding coefficient COI pedigree calculate spreadsheet software (domain filter: thegoatspot.net, backyardherds.com, rabbittalk.com, homesteadingtoday.com, backyardchickens.com, thecavyforum.com, pigeons.biz, tica.org, smallholders.org)

- The filter leaked academic pages (PMC) but kept one forum hit: Homesteading Today, "Inbreeding Coefficients" https://www.homesteadingtoday.com/threads/inbreeding-coefficients.324183/ (a rabbit thread pointing to a web calculator where you type the generations and names; dated; *source claim*, snippet; read as R3).
- **QuickPed** (Vigeland, 2022): "an online tool for drawing pedigrees and analysing relatedness"; computes inbreeding, kinship and identity coefficients; aimed at non-specialists https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9175388/ (*source claim*, snippet). *Inference* (from prior knowledge, not read here): it is an R Shiny app on a public server, built for human family pedigrees drawn on screen, so the data goes to the server and a herd of hundreds is outside its design; it ranks no mates.
- **FnR** (R package, inbreeding and numerator relationships; can resume for new animals) https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11256478/ ; **PURGd** (purged inbreeding) https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5100858/ (*source claim*). Scientists' software.

### R3 (read 3 of 8): Homesteading Today, "Inbreeding Coefficients" (attempted)

https://www.homesteadingtoday.com/threads/inbreeding-coefficients.324183/
- Not read: the forum answers bots with a 307 redirect to tollbit.homesteadingtoday.com (TollBit, a pay-per-crawl gateway for automated readers). Not followed, since it is a paid-access gate. Counted as a read because the call was made. Only the S6 snippet stands (*source claim*: a rabbit thread pointing to a web calculator where you type in generations and names).

### R4 (read 4 of 8): NordGen, "The EVA tool" (no date shown)

https://www.nordgen.org/our-work/farm-animals/the-eva-tool (*verified* for what NordGen says about EVA, read through a summarising fetch)
- For "small populations of farm animals", used in "commercial and threatened populations" in the Nordic and Baltic countries; free download for Windows, Linux and Mac; a quick-start PDF manual (v3.0) is the only training listed; needs "reliable and consistent pedigree information".
- Does: individual COI, pedigree completeness, average inbreeding and kinship per generation, founder and ancestor contributions, optimal contribution selection (breeding value against average relationship), and matings that minimise offspring inbreeding given optimal contributions. No ranked mate list for a chosen animal and no stand-alone pedigree checks are described; no web version; the file layout isn't given on the page.
- *Inference* (prior knowledge, not read here): EVA is a programme manager's optimisation program (parameter and data files, a manual), the kind a breed society's geneticist runs on the whole herd book, not a hobby breeder's page. It is a strong free incumbent for the population-level job and a weak one for "which of these four bucks should I put to this doe".

### S7 (search 7 of 8): Rare Breeds Survival Trust inbreeding coefficient advice breeders mating choice kinship breed society guidance

All *source claim* (search snippets) unless read later:
- **RBST:** no RBST page with COI thresholds or mating advice for members surfaced. Its Watchlist ranks breeds by effective population size (both sexes) and says the degree of inbreeding should be acknowledged; its gene bank is used to limit inbreeding and drift https://www.rbst.org.uk/blog/watchlist-review , https://www.rbst.org.uk/gene-bank .
- **Roslin Institute (2025):** "Lack of genetic diversity monitoring threatens rare breeds": census-based estimates overstate the real gene pool when a few males sire most offspring https://vet.ed.ac.uk/roslin/news-events/2025/lack-of-genetic-diversity-monitoring-threatens-rare-livestock .
- **British Kunekune Pig Society:** a traffic-light system for pairings; red pairings not recommended and the online system "automatically" blocks birth notifications from them unless the registrar agrees beforehand; pages "Coefficient Of Inbreeding" and "Tools to Help Plan Your Breeding" https://www.britishkunekunesociety.org.uk/coefficient-of-inbreeding/ , https://www.britishkunekunesociety.org.uk/tools-to-help-plan-your-breeding/ (read as R5).
- **Highland Pony Society** (Feb 2021, "Use of Kinship Analysis when Considering Breeding"): not advisable to choose a match with kinship above the breed mean of about 4% https://www.highlandponysociety.com/?p=3653 . **Cotswold Sheep Society**, "Zootech and Kinship" https://www.cotswoldsheepsociety.co.uk/zootech-and-kinship/ . **Shire Horse Society** adopted SPARKS for mean kinship and foals' predicted inbreeding https://shire-horse.org.uk/sparks-international . **Large Black Hog Association** (US), "Why Does Inbreeding Matter?" https://largeblackhogassociation.org/inbreeding/ .
- **Dogs:** the Kennel Club recommends Mate Select before pairing; registers puppies above the breed average but advises another pairing; won't register parent-offspring or full-sibling matings save rare exceptions https://www.thekennelclub.org.uk/health-and-dog-care/health/health-testing-and-screening/inbreeding-calculators . **BSAVA:** no bitch intentionally mated where the puppies' COI exceeds the breed average, or 12.5% if none exists, "measured from at least five generations" https://www.bsava.com/?p=2837 . Breed clubs explain COI (Vizsla Club https://www.vizsla.org.uk/inbreeding/ ; EBKC https://ebkc.org/inbreeding-explained/ ).
- **FAO** secondary guidelines for small populations at risk https://www.fao.org/3/X6526E/X6526E09.htm (not read; *inference* from prior knowledge that FAO's rule of thumb is a rise in inbreeding of at most about 1% per generation, i.e. an effective population size of 50).
- *Inference:* the UK rare-breed societies on Grassroots now run kinship and COI centrally (Southdown, Highland Pony, Cotswold, Kunekune, Shire through SPARKS), compare against the breed mean, and in one case enforce it at registration. For a member of those societies, the society's system is the authoritative tool and a separate page adds little. The thresholds are breed-relative (breed mean) more often than absolute.

### R5 (read 5 of 8): British Kunekune Society, "Tools to Help Plan Your Breeding" (no page date; threshold tables dated Nov 2022, Jan 2024, Jan 2025 "TBA")

https://www.britishkunekunesociety.org.uk/tools-to-help-plan-your-breeding/ (*verified* for what the society says, read through a summarising fetch)
- Members have two tools in the **Cloud Lines** herd book (metrics tab): **Kinship**, which gives a COI figure for a pairing, and **Stud Adviser**, a traffic light showing "the best match for a dam" (so a ranked or graded list of boars for a chosen sow). The page also mentions the traditional way, comparing pedigree certificates for common ancestors. Membership links point at breeds.grassroots.co.uk/KUNEK as well.
- Kinship goes back "right back to the start" of the society's records, replacing an old system that looked at only 3-5 generations; it can take up to 30 minutes.
- Thresholds are absolute: green 0-15%, amber 15-20%, red over 20% (Nov 2022 and Jan 2024 tables); green and amber offspring are registered; keep future pairings green where possible; thresholds "monitored by the committee". (The S7 snippet's claim that red pairings are blocked at birth notification is on the society's other COI page, not this one; still *source claim*.)
- Stud Adviser's suggestions can be unusable when boars are sold or dead; members are asked to mark animals sold or deceased.
- *Inference:* a rare-breed society can already give its members exactly the idea's core (all-generation COI for a pairing plus a ranked best-match list for a female) inside its herd book, built on the whole breed's pedigree, which a breeder's own spreadsheet can never match. Where such a herd book exists, a Labs page is strictly worse on data. **Cloud Lines** is a new incumbent to check (who can use it and at what price), since it may offer the same to individual breeders of any species.
