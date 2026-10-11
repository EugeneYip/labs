# Validation plan: Frost Dates

Comparative Research (2026-10-11). The decision is **STOP FOCUSED VALIDATION** (VALIDATION_BRIEF.md). No human discovery is recommended.

This document records the hypotheses and what would have to be true before a human test is worth an hour. Nothing starts without explicit authorization.

## Hypotheses (for the record)

| # | Hypothesis | Status after desk research | Evidence |
|---|---|---|---|
| H1 | Worldwide frost-date lookup is underserved | **Weakened** | False for the UK and Ireland; partly covered worldwide. True for Australia, NZ, South Africa and non-English Europe at town level |
| H2 | Gardeners plan around a last-frost date | **Supported in North America and continental climates; weakened elsewhere** | Months and warmth in the UK, Labour Weekend and soil warmth in NZ, the Eisheiligen in Germany |
| H3 | The need is searchable and winnable | **Unresolved, leaning no** | The US and UK are taken. No tool ranks in Australia, NZ or Germany, but volume is unknown and there are no per-place URLs |
| H4 | A 10 km reanalysis is trustworthy enough for gardens | **Mixed** | US cities within about 8 days. **Canberra about 5 weeks optimistic** (`notes/accuracy-check.md`) |
| H5 | Frequency justifies a standalone service | **Likely falsified** | Decisions twice a year, a lookup once per place |
| H6 | A frost-anchored planting calendar works worldwide | **Falsified for maritime climates** | 1.5–2.5 months early for tomatoes in Dublin, London and Christchurch |

## Prerequisites before any human test

1. **Accuracy at frost-prone sites.** Cautious dates within about two weeks of station records at Canberra Airport, Tuggeranong, and one or two other inland stations.
   - This would take correction against stations (for example, GHCN-Daily, CC0), or a different data method.
   - That's product work, and possibly an offline data script that needs a constitution amendment.
2. **A warmth-aware or qualified calendar** for mild climates.
3. **Evidence of demand** for Australian, NZ or German place queries. Labs has no analytics, and adding any would be an owner decision outside this phase.
4. **Per-place pages** if search is to be the channel. That means pre-building pages, which again is an owner decision.

## If reopened: the smallest human test

**Who:** 4–6 home gardeners in Canberra or inland NZ, reached through a community garden or club by personal introduction. Never by posting.

**Format:** 15-minute conversations. The page is shown only after they describe their current rule.

**Questions:**
1. How do you decide when to plant out tomatoes?
2. Where does that rule come from?
3. When did frost last catch you out?
4. Would a date with odds for your suburb change anything?
5. After seeing the page: does it confirm, refine or contradict your rule, and would you trust it over your rule?

**Proceed** only if a majority:
- say the page refines their rule in a way they'd act on;
- and judge its dates plausible against their experience.

**Stop** if most find the dates too early, or say their folk rule or the forecast is enough.

## Stages

- **B (validated):** gardeners in one region using it for a season.
- **C (standalone):** search traffic from place pages and use beyond the owner's network.
- **D (infrastructure: precomputed data, a paid data plan, accounts for alerts):** an offline pipeline needs an amendment. Paid keys or alerts break Labs' rules.

None of these is expected on current evidence.
