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
