# Thread H: two deciding checks for the pedigree COI and mate-ranking lead (discovery round 2)

## Summary

Budget used: 6 of 6 searches (all in extended mode) and 6 of 6 reads. One read failed: The Goat Spot sends bots to a TollBit pay-per-crawl gate, which wasn't followed. The PMx manual is a PDF the fetch tool couldn't summarise; the tool saved its own copy, which was read locally (text extracted with pypdf). Labels as below; every URL is in the log.

### CHECK 1 (audience): PASSED, narrowly

- **Deciding evidence** (*verified*, R1, Rabbit Talk, "Creating A Pedigree Instantly Using Excel", 2016-2022): a breeder shares an Excel template built on a Name, Sire, Dam table (2016). A breeder who already works COI out by hand asks how to add it to the sheet: "I know how to calculate them, but my excel abilities are too rusty" (2018). Another asks again in 2022: "did u find a solution for adding this formula". Nobody answers either.
- **Why rabbits fit:** ARBA keeps no pedigree database or COI tool for its breeders, so their pedigrees are their own records (*inference*, prior knowledge, not checked here).
- **Supporting, all *source claim*** (S1, S2):
  - more Rabbit Talk threads on Excel and OpenOffice records, and on software with an "inbreeding level" button (KinTraks);
  - goat keepers' COI targets on The Goat Spot ("under 12%", "I usually stay under 10%"; gated, unread);
  - sheep breeders rotating rams to keep inbreeding down;
  - the Livestock Conservancy's heritage swine guide, whose strategies "require good pedigrees be maintained";
  - the Hedgehog Program's own one-off COI page.
- **Weak spots:** the verified evidence is one thread with three posters. Nothing is verified for cavies, pigeons, heritage poultry, or rare-breed sheep and pigs.

### CHECK 2 (incumbents): PASSED

No free tool turned up that takes a breeder's own table and ranks mates without an install or an account, so the kill condition isn't met. Two free tools already do large parts of the job, though, and neither is weakened here:

- **PMx** (*verified*, R3, manual v1.0):
  - free; a Windows .NET desktop program with no Mac build (it "can probably be run" under emulators);
  - reads a text file a breeder can make: unique ID, Dam, and Selected and Alive flags; sire optional; sex coded 0-7; fields separated by tabs or semicolons ("Commas as field delimiters are not permitted");
  - its Pairing tab gives the offspring's F and the MSI "for all possible mates" of a highlighted animal, sortable, with % pedigree known. That is the lead's ranking step, free and offline;
  - not described in the manual: impossible-pedigree checks or a printable pedigree.
- **BreederHQ's COI calculator** (*verified*, R5): free, no signup, runs in the browser, and "Nothing is sent to a server". It handles one pairing at a time, typed into a fixed five-generation form, with no file import and no ranking.
- **Also free, one pairing at a time:** BirdTracks' COI calculator (no signup; how data goes in isn't stated; R6) and the Hedgehog Program's page (S4).
- **Ruled out because they use only their own database** (*source claim*, S5):
  - PawPeds test matings: cats in its database, and a breeder adds one by sending its pedigree to the maintainer;
  - ADGA Genetics' Planning tool: ADGA-registered goats. A free account saves matings; whether the calculation itself needs a login wasn't confirmed.
- **Ruled out because they aren't free:**
  - Breeders Assistant: paid, with a free trial whose limits weren't found (*source claim*, S6);
  - BreedMate: bought outright; Pedigree Explorer is $80 shareware with a trial; its free Pedigree Point has no inbreeding tools (*source claim*, S6);
  - PigeonDB: paid after a trial; gives a pair's COI over 10 generations (*source claim*, S6);
  - Pedigree Database Online: EUR 395 a year; CSV import, 10-generation COI, trial matings (*verified*, R4).
- **Unsettled:** Pigeon Planner (free desktop). Whether it computes a COI or ranks pairings wasn't confirmed either way. As desktop software it can't meet the kill condition.

### Verdict: ADVANCE to the full gate, narrowly

Neither deciding check failed. The wedge is narrower than round 1 said, though, and the gate should weigh it that way:

1. **"Free and nothing uploaded" is no longer a wedge on its own.** BreederHQ already gives a free, private COI for one pairing. What's left is working from the breeder's whole list:
   - every animal's COI over all known generations, with completeness;
   - every possible mate ranked;
   - impossible-pedigree checks;
   - a printed pedigree;
   - no retyping ancestors for each pairing.
2. **Against PMx, the wedge is reach and ease, not capability:** any device including phones, nothing to install, the breeder's own columns as they are, and a plain COI instead of a zoo population index.
3. **The verified audience is rabbit breeders who keep their own pedigrees.** The gate shouldn't claim species its evidence doesn't cover. Round 1's risk stands: for registered animals, the registry's COI over the whole breed is higher and more authoritative than one worked from a breeder's own sheet.

## About this thread

**Purpose:** settle the two checks that round 1's thread B left open (`b-breeding-pedigrees.md`, "Two checks the main session should run first") for one lead: a free browser page that opens a small breeder's own animal list (ID, sire, dam, sex, birth date; spreadsheet or CSV), checks it for impossible pedigrees, computes each animal's Wright COI over all known generations with pedigree completeness, ranks the possible mates for a chosen animal by their offspring's COI, and prints a pedigree, with nothing uploaded.

- **CHECK 1 (audience):** direct, first-hand evidence that breeders outside registries' tools keep their own sire-and-dam lists in spreadsheets and work inbreeding out by hand, or ask for a way to do it.
- **CHECK 2 (incumbents):** PMx, PawPeds test matings, ADGA's genetics tools, the free tiers or trials of Breeders Assistant and BreedMate, Pigeon Planner, and any free web tool that takes a pasted or uploaded pedigree table and ranks mates without an account (if one exists, the lead dies). No incumbent is weakened.

**Budget:** at most 6 web searches and 6 page reads (WebFetch), counted below as S1-S6 and R1-R6.

**Labels:** *verified* (read on an official or primary page; a vendor's, registry's, or forum poster's own page is primary for what it says about itself), *source claim* (a page or a search snippet says so), *inference* (judgment). Short quotes only (under 15 words).

**Advisory only:** the main session decides and re-checks deciding claims.

## Log

### S1 (search 1 of 6, extended): keep pedigrees in Excel spreadsheet sire dam calculate inbreeding coefficient percentage planned breeding (domain filter: thegoatspot.net, backyardchickens.com, rabbittalk.com, backyardherds.com, pigeons.biz, thecavyforum.com, sheep101.info, permies.com and two others)

The filter held this time for the first block (forum threads), and leaked academic PMC pages in the second. Titles and URLs are *verified* as returned; what they say is *source claim* (the search tool's summary of them) until read.
- **Rabbit Talk:** "Creating A Pedigree Instantly Using Excel" https://rabbittalk.com/threads/creating-a-pedigree-instantly-using-excel.30190/ ; "Rabbit pedigree software" https://rabbittalk.com/threads/rabbit-pedigree-software.31099/ ; "Which Software?" https://rabbittalk.com/threads/which-software.34327/ ; "Too closely related to breed?" https://rabbittalk.com/threads/too-closely-related-to-breed.35417/ ; "Creating rabbit records in Open Office" https://rabbittalk.com/threads/creating-rabbit-records-in-open-office.8867/ ; "Breeding Schedule Spreadsheet" https://rabbittalk.com/threads/breeding-schedule-spreadsheet.21906/ ; "Where to get blank pedigrees" https://rabbittalk.com/threads/where-to-get-blank-pedigrees.3740/ .
- **The Goat Spot:** "looking for a Pedigree genertor program," https://www.thegoatspot.net/threads/looking-for-a-pedigree-genertor-program.120548/ . **Backyard Herds:** "Breeding Schedule Spreadsheet" https://www.backyardherds.com/threads/breeding-schedule-spreadsheet.29482/ . **Pigeon Talk:** "Pigeon Genetics Calculator" https://pigeons.biz/forums/f5/pigeon-genetics-calculator-41937.html (by its title probably colour genetics, not COI; *inference*).
- What the summary attributes to them (*source claim*, not yet read): one member built an Excel table named Master with columns Name, Sire, Dam and INDEX/MATCH lookups to print a pedigree; one rabbit breeder shared a workbook where you type a rabbit's name and get its pedigree; one said the most useful function of their software was its "inbreeding level" button; another that KinTraks keeps track of the level of inbreeding; a forum post gives Wright's formula with the (1 + F_A) term.
- *Inference:* rabbit breeders (whose registry, ARBA, keeps no pedigree database for them: prior knowledge, not checked here) visibly keep their own pedigrees, some in Excel or OpenOffice and some in breeder software that shows inbreeding. Whether the spreadsheet keepers work out COI by hand or want a tool is what a read must show (R1).

### R1 (read 1 of 6): Rabbit Talk, "Creating A Pedigree Instantly Using Excel" (started 24 May 2016 by KenoshaRabbits; 11 posts, the last 9 June 2022)

https://rabbittalk.com/threads/creating-a-pedigree-instantly-using-excel.30190/ (practitioners' own posts, read through a summarising fetch; *verified* for what the posters say)
- **The list:** the opening post shares a downloadable Excel template built on a named table with columns Name, Sire, Dam and Breed; the sample also has ear tattoo, date of birth, weight, colour, and sex. A lookup tab prints the pedigree once "you could type in the name of a rabbit, or its ear tattoo" (KenoshaRabbits, 2016).
- **Inbreeding by hand, and a request:** a later poster (Bre, 9 Sep 2018) asks how to add an inbreeding coefficient to the sheet, quotes Wright's formula, and says "I know how to calculate them, but my excel abilities are too rusty"; counting generations to a common ancestor is easy on paper or an online pedigree but "with excel I do not know how to do it."
- **Still unanswered four years later:** another poster (Barbacchielli, 9 Jun 2022) asks "did u find a solution for adding this formula to excell?" (asked twice). No reply on the page answers either request. No software is named in the thread, and nobody asks to compare or rank possible mates.
- *Inference:* this is the first-hand pattern Check 1 asks for, for one species: a breeder-kept Name/Sire/Dam spreadsheet (no registry database behind it), COI worked out by hand from the pedigree, and two separate requests over four years for a way to compute it from the sheet, none answered. Small (three posters), but direct.

### S2 (search 2 of 6, extended): how to calculate inbreeding coefficient COI from my own pedigree records herd flock choosing buck ram boar rooster (domain filter: livestockconservancy.org, thegoatspot.net, backyardherds.com, backyardchickens.com, pigeons.biz, guineahogs.org, largeblackhogassociation.org, scigba.org, navajo-churrosheep.org, homesteadingtoday.com)

Titles and URLs *verified* as returned; content *source claim* (search summary) until read. Academic PMC and arXiv pages leaked again; ignored.
- **The Goat Spot:** "Inbreeding Co-efficient" https://www.thegoatspot.net/threads/inbreeding-co-efficient.232714/ ; "How To Go About Finding A Buck To Breed To Does…" https://www.thegoatspot.net/threads/how-to-go-about-finding-a-buck-to-breed-to-does%E2%80%A6.229386/ ; "How Many Males Do I Need To Keep Genetic Diversity In A Closed Flock?" https://www.thegoatspot.net/threads/how-many-males-do-i-need-to-keep-genetic-diversity-in-a-closed-flock.219195/ ; "Proper breeding to prevent inbreeding" https://www.thegoatspot.net/threads/proper-breeding-to-prevent-inbreeding.199461/ .
- **Homesteading Today** (bots are sent to a TollBit pay gate, per round 1; not to be read): "Breeding Rams to Daughters", "Choosing a Breeding Boar", "Goat inbreeding question". **Backyard Herds:** "When to trade out your Ram?" https://www.backyardherds.com/threads/when-to-trade-out-your-ram.7845/ .
- **The Livestock Conservancy, Heritage Swine Guide:** "Breeding for Productivity and Genetic Conservation" https://livestockconservancy.org/heritage-swine/heritage-swine-guide/pig-breeding/breeding-for-productivity/ and "Selecting Breeding Stock for Heritage Hogs" (same path, `/selecting-breeding-stock-for-heritage-hogs/`). Per the summary its strategies (avoid mating close relatives, bring in other herds' genetics, planned selection) "require good pedigrees be maintained" (*source claim*).
- Practitioners' thresholds and habits, as the summary quotes them (*source claim*, posts not attributed to a thread): a goat breeder aims to be "under 12%"; another, "I usually stay under 10%"; a sheep breeder and a friend keep three rams "from largely unrelated bloodlines" to keep inbreeding manageable; others rotate rams and sell or buy when they have "too many related daughters".
- *Inference:* goat, sheep and pig keepers do talk about COI targets for a mating, which means some number is being computed somewhere (by hand, ADGA's tools for registered dairy goats, or software). R2 reads the goat COI thread to see which.

### R2 (read 2 of 6): The Goat Spot, "Inbreeding Co-efficient" (attempted)

https://www.thegoatspot.net/threads/inbreeding-co-efficient.232714/
- Not read: the forum answers bots with a 307 redirect to tollbit.thegoatspot.net (TollBit, the same pay-per-crawl gateway that blocked Homesteading Today in round 1). Not followed, since it is a paid-access gate. Counted as a read because the call was made. Only the S2 snippets stand (*source claim*). Other Goat Spot and Homesteading Today threads are presumably behind the same gate (*inference*), so later reads go elsewhere.

### S3 (search 3 of 6, extended): PMx software Lacy Ballou Pollak pedigree input text file ID sire dam sex Windows free download mate suitability index ranked pairs

All *source claim* (search summary and snippets) unless read later:
- **PMx** (Lacy, Ballou and Pollak 2012, *Methods in Ecology and Evolution* 3: 433-437) https://besjournals.onlinelibrary.wiley.com/doi/full/10.1111/j.2041-210X.2011.00148.x : free software estimating inbreeding, kinship, founder contributions and more for pedigreed populations ("studbooks"); designed to work with data kept in the SPARKS or PopLink studbook programs; developers' site given as www.vortex10.org/PMx.aspx, now the Species Conservation Toolkit Initiative (scti.tools).
- **Platform:** an aggregator lists a Windows build (Windows 7 to 11), version 1.6.2 https://en.freedownloadmanager.org/Windows-PC/PMx-FREE.html ; another lists "PMx 1.6.2 / PMxLite" https://mybiosoftware.com/pmx-software-pedigree-analysis-management.html . No Mac or web version surfaced.
- **Other formats:** mPed (Stockholm University) converts pedigrees "of any studbook format" to PMx's input https://link.springer.com/article/10.1007/s12686-013-9874-z , which implies PMx's own input is a specific layout (*inference*). The manual has the input specification https://scti.tools/manuals/PMxManual.pdf (R3).
- **Mate ranking:** PMx gives pairwise "mate suitability indices" (MSI) with MateRx's algorithms, a scale from 1 (very beneficial) to 6 (very detrimental), and sorts lists of males and females by genetic value, with automated methods to designate the pairs that maximise gene diversity (*source claim*). Zoo documents use it ("Population Analysis & MateRx", Verreaux's eagle-owl, http://www.raptortag.com/uploads/9/6/8/4/96841132/veossp.pdf ; CPSG "Playing Panda Matchmaker" http://www.cpsg.cbsg.org/blog/201401/playing-panda-matchmaker ).
- *Inference:* PMx does the decision the lead offers (grade every possible mate) and more (mean kinship, gene diversity), free. Its likely limits for a hobby breeder are installation, Windows only, a zoo studbook data model, and MSI being a population-management index rather than a plain offspring COI; R3 checks the input layout and what it shows for one animal.

### R3 (read 3 of 6): PMx User Manual, version 1.0 (for PMx 1.0.20120115; 160 pages)

https://scti.tools/manuals/PMxManual.pdf (the developers' own manual; *verified* for what it says about PMx 1.0). The fetch tool couldn't summarise the PDF and saved its own copy in this session's tool-results folder (not a deliberate download); its text was extracted locally with pypdf and searched. Page numbers are the manual's own. The current release is 1.6.2 (S3, *source claim*); later changes aren't checked here.
- **Platform and cost:** written in C# for the .NET Framework 4 "running on Windows operating systems"; it "can probably be run on Apple Mac OS running Windows emulators", with no Mac, Unix or Linux build (p. 3). "PMx is distributed free of charge", without support (p. 6 area, "Cautions").
- **Who it's for:** conservation breeding of wildlife studbooks, but "it can also be useful for management of domesticated livestock, such as rare breeds" (Introduction).
- **Input a breeder could make:** besides SPARKS and PopLink exports, PMx reads a primary input file "created from an Excel data set or with a text editor" (p. 137; also "from data in an Excel spreadsheet", Getting Started). Mandatory fields are a unique ID, Dam, a Selected flag and an Alive flag; Sire is optional; unknown parents are UNK, NONE or blank; an unrecognised parent ID becomes a founder (pp. 137-141). Conditions: a header line; fields separated by colon, semicolon or tab, because "Commas as field delimiters are not permitted" (p. 138); sex coded 0-7 (0 fertile female, 1 fertile male, and so on); dates as yyyymmdd or similar. So a breeder's ID/sire/dam/sex/birth-date sheet can be fed to it after adding two flag columns, recoding sex, and saving as tab-delimited text (*inference* from the spec).
- **Ranking mates for a chosen animal:** yes. The Pairing tab lists males and females; highlighting one animal fills a column with "the F (of resulting offspring) and MSI score for all possible mates", and "Data can be sorted by clicking on the column header" (p. 87). The Pairwise Info tab gives a male-by-female MSI matrix (1 very beneficial to 6 very detrimental, "-" do not breed, default cut-off F = 0.125), with dGD, MK difference, offspring F and unknown ancestry behind it (pp. 84-85). It also reports % pedigree known, mean kinship, gene diversity, founder genome equivalents and a full kinship matrix (pp. 81, 132).
- **Limits a hobby breeder would meet** (*verified* unless marked): only living animals can be put in the Pairwise Info table; MSI may not suit populations with "few founders, very small N, large amount of unknown pedigree" (p. 85); RAM grows with the square of the population (p. 3). Not described (*inference*): impossible-pedigree checks such as a parent born after its offspring, wrong-sex parents, or loops; a printable pedigree chart.
- *Inference:* PMx is a strong free incumbent for the core decision. It already does, offline and free, what the lead's ranking step promises (offspring F for every possible mate of one animal, sortable, with % known), plus population tools the lead doesn't offer. It is not a web tool and needs Windows with .NET (no phone, no Mac without an emulator), and its input is a zoo studbook layout with flags and coded sexes. The lead's wedge over PMx is therefore only reach and ease (any device, the breeder's own columns as they are, plain offspring COI, pedigree checks and print), not capability.

### S4 (search 4 of 6, extended): free online tool upload pedigree CSV ID sire dam calculate inbreeding coefficient kinship rank best mates offspring COI web app no installation (blocked: the round-1 spam domains, PMC, arXiv)

All *source claim* (search summary and titles) unless read later. The search tool itself reported no tool matching the whole combination (file in, COI and kinship, mates ranked, nothing to install); four partial matches:
- **QuickPed** (Vigeland), R Shiny web app computing inbreeding, kinship and identity coefficients https://d-nb.info/1264485875/34 ; no mate ranking reported (round 1's *inference* stands: built for human family pedigrees, data sent to its server).
- **Pedigree Database Online** https://pedigreedatabaseonline.com/ : a registration-based breeders' database that imports and exports CSV and calculates "(up to) 10 generation inbreeding-coefficients" in real time; mate ranking not seen in the summary. A new incumbent: read as R4.
- **Conduct Science** "Free Coefficient of Relatedness (r) & Inbreeding Calculator — Mouse Pedigrees" https://conductscience.com/tools/coefficient-of-relatedness-calculator : picks a relationship type, takes no pedigree file.
- **Hedgehog Program** "Inbreeding Calculator" https://www.hedgehogprogram.com/wp-content/uploads/2022/COIcalculator/index.html : a free browser page where names are typed into a pedigree form by hand; no file, no ranking (*source claim*). A sign that small-species breeding programmes build their own one-off COI pages (*inference*).
- *Inference:* an absence in results isn't proof, but two extended searches (this and round 1's S1, S4) found no free, no-account web tool that takes a breeder's table and ranks mates.

### R4 (read 4 of 6): Pedigree Database Online, home page (no date shown)

https://pedigreedatabaseonline.com/ (the vendor's own page, read through a summarising fetch; *verified* for what it says about its product)
- **What:** a hosted pedigree database "especially developed for breed clubs and breeders" (dogs first; also cats, hamsters, hedgehogs, cattle, rats), on its own subdomain per club, "No installation needed".
- **Price:** EUR 395 a year plus a EUR 100 setup fee in the first year; EUR 50 a year for public access, EUR 150 a year for a payment module; a free one-month trial. No free tier is stated. Editing needs a login; a database can be private, public, or partly open.
- **Does:** imports and exports animals "in CSV format (Excel compatible)"; computes "real time (up to) 10 generation inbreeding-coefficients" and AVK (ancestor loss); trial matings; 3- and 7-generation pedigree displays. Ranking the possible mates for a chosen animal is not stated.
- *Inference:* a paid club-level service, capped at 10 generations, with accounts and hosted data. It doesn't meet the kill condition (free, no account) and isn't a free alternative for one breeder; it confirms that "CSV in, COI, trial matings" is a product people pay for.

### S5 (search 5 of 6, extended): PawPeds test mating inbreeding coefficient cats in database only; ADGA genetics planned mating inbreeding coefficient registered goats members login

All *source claim* (search summary and snippets) unless read later:
- **PawPeds (cats):** its "User Guide" https://www.pawpeds.com/cms/index.php/en/databases/user-guide says test mating uses a cat already in the database as sire or dam and gives the COI "for the number of generations that the pedigree shows"; an "inbreeding" link goes back as far as the database goes, with the warning that it is only as complete as the database's pedigree. One cattery's page says PawPeds also shows a confidence factor, and that a cat not in the database is added by sending its pedigree to the database's maintainer. Other hits: PawPeds "Genetics" and "Glossary of Terms" articles; the International Siberian Breeders Club "How to make a match" https://siberiancatbreederscentral.com/how-to-make-a-match/ ; a Pet Forums thread "Inbreeding" https://www.petforums.co.uk/threads/inbreeding.538054/ (quoting GCCF guidance against COIs above 6.25%).
- **ADGA Genetics (registered dairy goats):** https://genetics.adga.org/ and ADGA's page https://adga.org/adga-genetics-website/ ; a "Planning" tool gives the planned pedigree, ETAs and COI "based on your choice of Sire and Dam", with the top contributors to the inbreeding (third-party guides: https://thriftyhomesteader.com/adga-genetics/ , https://goathousefarm.com/what-is-adga-genetics/ , https://www.abetterwayfarms.com/Content/GoatCare/GeneticsTool.htm ); a free account saves goats and planned breedings; the database is refreshed monthly. Whether the planning calculation itself needs a login was not confirmed. Other hits: Herd Manager (an app) "Genetic Merit & Pedigree Tools for Dairy Goats" https://herdmanager.app/learn/breeding/adga-genetics-pedigree-suite/ ; IGA "Status of genetic diversity of U.S. dairy goat breeds" https://www.iga-goatworld.com/blog/status-of-genetic-diversity-of-u-s-dairy-goat-breeds ; The Goat Spot "Inbreeding opinions" (TollBit-gated).
- *Inference:* both are registry or community databases. They test one sire with one dam, free, but only for animals already in their database (ADGA: ADGA-registered goats; PawPeds: cats someone has entered), so neither works from a breeder's own list. Neither is described as ranking all possible mates. R5 checks ADGA's own page for who can use the planner.

### S6 (search 6 of 6, extended; search budget spent): Breeders Assistant Tenset free trial limit animals price; BreedMate pedigree software free version inbreeding test mating; Pigeon Planner free inbreeding coefficient pairing

All *source claim* (search summary, listings and snippets) unless read later:
- **Breeders Assistant** (Tenset; editions for rabbits, dogs, cats and others): a free trial; "Starting Price: $125.91 one-time payment" on SourceForge https://sourceforge.net/software/product/Breeders-Assistant/ (the same figure SourceForge gave for ZooEasy in round 1, so the listing price is doubtful; *inference*); "rapid inbreeding calculations", and an extended edition that helps choose matings to reduce inbreeding. Trial limits not found. Also "Breeders Assistant for Rabbits" https://breeders-assistant-for-rabbits.software.informer.com/ .
- **BreedMate** https://www.breedmate.com/ (dogs, cats, horses, cattle, goats): bought outright, "no monthly fees"; inbreeding coefficients, duplicated-ancestor detection, trial matings, a Breeding Planner; Pedigree Explorer listed as $80 shareware with a free trial download https://pedigree-explorer.software.informer.com/6.3/ ; the free piece is Pedigree Point, a pedigree web-publishing tool with no inbreeding testing. No free version of the main program surfaced.
- **Pigeon Planner** https://www.pigeonplanner.com/ : free and complete ("no demo or limited functionality"); pedigrees, relatives, race results. Whether it computes a COI or ranks pairings was **not confirmed either way** by this search.
- **PigeonDB** https://pigeondb.com/ , "Coefficient of Inbreeding, Actual and Hypothetical" https://pigeondb.com/coefficient-of-inbreeding/ : racing-pigeon pedigree software; a pair's hypothetical COI with Wright's formula over up to 10 generations; "Free trial, then paid membership plans". A new paid incumbent for pigeons.
- **Two more free web calculators surfaced:** BreederHQ "Coefficient of Inbreeding (COI) Calculator" https://breederhq.com/tools/coefficient-of-inbreeding-calculator and Birdtracks "Free Bird Breeder Tools — 26 Calculators & Predictors" https://www.birdtracks.io/tools . Either could meet the kill condition if it takes a table and ranks mates without an account; BreederHQ is read as R5.
- Pigeon pairing guidance (practitioner articles): "How to Pair Your Pigeon Breeders" parts 2 and 3 https://pigeonracingpigeons.wordpress.com/2011/03/21/how-to-pair-your-pigeon-breeders%E2%80%94part-2/ , https://www.pigeonracingpigeon.com/whats-new/how-to-pair-your-pigeon-breeders%E2%80%94part-3/ (not read).

### R5 (read 5 of 6): BreederHQ, "Coefficient of Inbreeding (COI) Calculator" (no date shown)

https://breederhq.com/tools/coefficient-of-inbreeding-calculator (the vendor's own page, read through a summarising fetch; *verified* for what it says about its tool)
- **Access:** "Free, no signup, runs in your browser"; "Nothing is sent to a server, nothing is logged." BreederHQ's own platform is invitation-only with a waitlist, and the page promotes it for automatic COI from a full pedigree library (dogs, cats, horses, goats, sheep, rabbits, alpacas, llamas, cattle).
- **Input:** names or registration IDs typed into a fixed five-generation form for the sire's and dam's sides (generations 4 and 5 accept pasted lists of names), with a "Load example"; no CSV or spreadsheet upload is described.
- **Computes:** the planned offspring's COI by Wright's path method, (1/2)^(n1+n2+1) x (1+F) per common ancestor, over at most five generations, unknown ancestors at F = 0.
- **Mates:** no ranking; the page suggests comparing two planned matings of the same animal against different mates by running each pairing separately.
- *Inference:* the closest free incumbent found, and a real one: browser-local, no account, any species, one pairing at a time. It does not meet the kill condition (no table in, no ranking, five generations at most, no checks), but it removes "nothing uploaded" and "free COI for a pairing" as wedges. What remains is working from the breeder's whole list: all known generations, every animal's COI and completeness, every possible mate ranked, impossible-pedigree checks, and the pedigree printed, without retyping ancestors for each pairing.

### R6 (read 6 of 6; read budget spent): BirdTracks, "Free Bird Breeder Tools" (no date shown)

https://www.birdtracks.io/tools (the vendor's own page, read through a summarising fetch; *verified* for what it says about its tools)
- "All free, no signup required." Among them, an **Inbreeding (COI) Calculator** ("Estimate the inbreeding coefficient of any planned pairing"), a **Pedigree Tree Builder** ("Build a 4-generation family tree", downloadable), and colour-genetics predictors. The paid app, with a free 30-day trial, "saves the inputs and outputs against your actual birds".
- How data goes into the COI calculator, whether it runs in the browser, and how many generations it uses are not stated on this page; it is described for one planned pairing, with no ranking of mates.
- *Inference:* another free, no-account, single-pairing calculator from a vendor of paid breeding software, like BreederHQ's. It doesn't meet the kill condition as described; the calculator page itself wasn't read (budget spent), so the main session could open it once if it wants that settled.

### Addendum to R3 (no extra read: the same saved manual)

- A text search of the PMx 1.0 manual for loops, circular, validation, inconsistent, born before or after, pedigree chart, pedigree tree, draw, and print finds no impossible-pedigree checks and no pedigree chart, only printing and export of graphs and tables. Absence from a manual isn't proof (*inference*).
