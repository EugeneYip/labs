# Validation brief: Frost Dates

Comparative Research (2026-10-11). Internal; research only. Nobody was contacted and no infrastructure was changed.

**Evidence:**
- `notes/market-notes.md`: workflows by country, pain, competitors, search, beachheads, monetization.
- `notes/data-notes.md`: Open-Meteo's terms and server code, alternatives, working data out ahead of time, data quality, cost.
- `notes/accuracy-check.md`: Frost Dates' own code run against station records and across climates.

**Labels:**
- **[V]**: read on the source.
- **[S]**: snippet.
- **[SERP]**: observed in the research tool's US-only result lists.
- **[E]**: my arithmetic (working in the data notes).
- **[U]**: inference.
- **[V, rechecked]**: confirmed directly during synthesis.
- **[V, own check]**: from the accuracy check.

## Decision: STOP FOCUSED VALIDATION

Frost dates are a real gardening job that comes back every year. But the evidence falsifies Frost Dates as a candidate for focused validation:

- **Where the job is strongest** (North America and continental climates), free incumbents own it and own search.
- **In the UK**, a free tool built on the Met Office's 1 km grid already exists.
- **In maritime climates**, warmth decides planting, not frost. There Frost Dates' calendar advised planting tender crops 1.5–2.5 months early, until the maintenance pass below (commit 291fac5).
- **In the one beachhead with a real gap** (cool-climate south-eastern Australia, Canberra first), Frost Dates' cautious dates run about five weeks earlier than two station records, which is worse than the local folk rule.
- The need comes twice a year, and the page has no per-place addresses that search could find.

Frost Dates stays a useful Labs tool in continental climates. Its accuracy wording was fixed in the owner-authorized maintenance pass below (commit 291fac5).

## Core question

Is worldwide frost-date lookup underserved, searchable, and useful enough to justify focused validation toward a standalone service?

**Answer: no.**
- **Underserved** only where Frost Dates' data currently fails (Canberra) or where demand is unmeasured (Australia, New Zealand, South Africa, non-English Europe).
- **Not searchable** as built.
- **Not frequent.**

## The common analysis

| | Finding |
|---|---|
| **User (narrowest beachhead)** | Home gardeners in cool-climate south-eastern Australia (Canberra, the southern tablelands, Ballarat, Tasmania), with inland and southern New Zealand as a sibling. This was the best fit the market research found [V/U]. It **fails the station test** [V, own check] |
| **Job** | Plan seed-starting and planting out around spring frost risk, and season extension around autumn frost, with odds (a cautious date) for the gardener's own place |
| **Current solution** | **North America:** the Almanac's ZIP calculator, garden.org, PlantMaps, NOAA normals, extension offices, regional climate centres [V/S]. **UK:** lastfrostdate.co.uk (Met Office HadUK-Grid, 1 km, 1960–2023; air, light and hard frost) [V, rechecked], GardenFocused, JustGardenCentres, My Cozy Plant [V]. **Australia, NZ, Germany:** folk rules (Melbourne Cup Day, Labour Weekend, the Eisheiligen) and content tables that contradict each other [V]. **Everywhere:** planners that bundle frost dates (GrowVeg, Seedtime, Planter) [V]; forecasts and frost-alert apps for the night-by-night decision [S/V] |
| **Pain** | ZIP tools use a station that isn't where the garden is [V]. Sources conflict by weeks to months: London 6–8 weeks, Canberra about 7 weeks [V]. "90%" is used in opposite senses [S]. False springs cost plants [V]. Moderate, low-stakes pain: replanting |
| **Competition** | Strong in the US and UK. Partial worldwide coverage: WeatherSpark's 32 °F growing season for cities worldwide (data 1980–2016) [V; not rechecked, blocked to scripts]; PlantMaps (claims Europe and Asia; Ireland confirmed) [S]; paid planners [V]. Free frost information is a lead magnet everywhere [V] |
| **Wedge** | Any coordinate worldwide, three thresholds, median and 9-in-10 dates, the last 30 seasons, southern-hemisphere seasons, a planting calendar, no account. Distinctive as a combination [U], but undermined by accuracy at frost-prone sites and by the calendar in maritime climates [V, own check] |
| **Frequency** | Twice a year (spring planting and autumn), looked up once per place. Return visits are mainly for "this season so far" [U] |
| **Reachability** | Gardeners are easy to find: the UK's National Allotment Society has about 130,000 members [S]; there are clubs, community gardens and local columns. Specific Australian and NZ channels weren't verified [U]. **Search:** US and UK queries are taken; Australian, NZ and German place queries show no tool, but volume is unknown, and the page has no per-place URLs [SERP; repo] |
| **Trust barrier** | Low in general (free, no data collected). High at the beachhead: the Bureau of Meteorology and NIWA are the authorities and folk rules are entrenched, so a figure must match local stations. At Canberra it doesn't [V, own check] |
| **Expansion pressure** | Moderate, and outside Labs' current rules [U]. Per-place pages and precomputed data need an offline data script (a constitution amendment). Growth needs precomputation or contact with Open-Meteo. Fixing accuracy needs correction against stations, which is a different product |
| **Monetization** (research only) | Frost dates are given away to attract customers. People pay for planners ($25–$85 a year) and for nightly frost alerts (about £20 a year) [V]. Ads would make Open-Meteo use commercial: Professional, $99 a month at least [V] |

## Open-Meteo dependency (RISK_AND_COMPLIANCE.md §1–6)

1. **What the terms permit.**
   - Free use for non-commercial purposes, under 10,000 calls a day, 5,000 an hour and 600 a minute.
   - Labs matches the terms' own example: a free site without ads or subscriptions.
   - Ads are commercial. Donations aren't addressed [V].
2. **Can a standalone non-commercial version last?**
   - Yes at small scale: about 120 lookups a day in total under the strictest reading.
   - Above that it runs on goodwill. The README asks applications above 10,000 calls a day to get in touch, there's no uptime guarantee, and Open-Meteo can block.
   - Limits are enforced per IP address, which is verified in the server code [V]. In this research, the ninth lookup within a minute was refused [V, own check].
3. **Alternatives.**
   - **Keyless and open, and readable straight from a page** (CORS checked 2026-10-11):
     - Open-Meteo's own copy of ERA5-Land and ERA5 on AWS;
     - NASA POWER, which is coarse.
   - GHCN-Daily station data (CC0).
   - The Copernicus Climate Data Store needs an account.
   - E-OBS is non-commercial only [V].
4. **Cost if usage grows.**
   - At 1,000 lookups a month, the free tier is fine.
   - At 10,000, it's about 2.7 times the per-application figure, so contact Open-Meteo.
   - Commercial use costs $99 a month (Standard excludes the archive), or from $185 a month at about 100,000 lookups [V/E].
5. **Caching and precomputation.**
   - An incremental refresh, a code change only, cuts a return visit from about 83 calls to about 1.
   - Static 30-year statistics with only "this season" fetched live cut each lookup 64–83 times.
   - A worldwide 0.1° climatology is about 78–93 MB [E].
   - Precomputing needs an offline script, so an owner amendment comes first.

**Correction.** One lookup costs about 83 weighted calls, not about 830 as I said in an earlier conversation.

## Strongest counter-evidence

1. **The data fails at the narrowest beachhead** [V, own check]:
   - At Canberra Airport (1995–2010) and Tuggeranong (1996–2026), Frost Dates' last spring frost at 0 °C comes a median 26–28 days earlier than the station's, season by season.
   - Its cautious "9 in 10" date is about 5 weeks early: Oct 4 against Nov 11, and Oct 1 against Nov 3.
   - It shows about half the stations' frost nights.
   - The folk rule (Melbourne Cup Day, early November) agrees with the stations.
2. **In maritime climates, warmth decides, not frost:**
   - The RHS times tomatoes by month and by temperatures reliably above 16 °C [V].
   - Frost Dates' calendar on default settings put tomatoes outside in Dublin on Mar 12–19, in London on Apr 11–18, and in Christchurch on Sep 14–21 [V, own check], before commit 291fac5. London and Dublin now wait for warm nights; Christchurch wasn't rechecked.
3. **The UK already has a free tool on better data:** lastfrostdate.co.uk uses the Met Office's 1 km HadUK-Grid (1960–2023), offers air, light and hard frost, and has a last-30-years toggle [V, rechecked].
4. **Search is captured where demand is visible:**
   - The Almanac owns ZIP queries, and UK tools rank for UK queries [SERP].
   - Frost Dates has no per-place URLs, so it can't rank for "[city] last frost date" [repo].
5. **Low frequency, and treated as a commodity:** decisions come twice a year, the information is given away free to attract customers, and planners bundle it [V/U].

## What survives

- **No free tool offers the full combination:** worldwide, thresholds, odds, and the recent 30 seasons [U].
- **Gaps outside North America and the UK.** In Australia, New Zealand, South Africa and non-English Europe, nobody offers a town-level lookup by odds. The answers there are folk rules or contradictory tables [V].
- **Continental climates work.** Frost Dates was within 8 days of NOAA in 4 of 5 US cities (PRODUCT_LOG), and its calendar is sensible from the cautious date there [V, own check].

## Product status

**Updated 2026-10-11 in an owner-authorized maintenance pass** (commit 291fac5; PRODUCT_LOG.md):
- **Caveat:** a visible "Estimates, not guarantees" note under the frost dates. Valleys, hollows and inland basins can get frost weeks later or earlier; compare with a long-running station or experienced local growers.
- **Tender crops:** they show "Once nights are warm" instead of a date where the record's average low reaches 10°C more than three weeks after the frost date (London, Dublin, Canberra; Minneapolis from the typical date).
- **Wording:** the intro and summary are softened.
- **Credits:** GeoNames is now credited in Frost Dates and Line Dry.
- **Unchanged:** the frost dates themselves, and the decision (STOP FOCUSED VALIDATION). The Open-Meteo email remains open.

**As found during the research.** Nothing counted as a "genuinely harmful factual claim":
- the stakes are seedlings, not safety;
- the page already warns that hollows, valleys and open country get frost earlier and later.

**The material issues found for the owner** (RISK_AND_COMPLIANCE.md §10). Since then, the maintenance pass above did items 2 and 3 and most of item 1; item 4 is open:
1. **Accuracy wording:**
   - The odds are the grid's, and frost-prone inland sites can see frost weeks later.
   - Suggest the Light frost threshold or the cautious date for tender crops.
2. **The planting calendar in mild climates:** qualify it ("wait for warm nights as well") or hide it where frost ends long before nights warm.
3. **A one-line GeoNames credit** for the place search, in Frost Dates and in Line Dry. This is a licence gap.
4. **Ask Open-Meteo in writing** about the 10,000-a-day figure and donations, before any growth.

## What would reopen this

1. A data method that matches station records within about two weeks at frost-prone sites, for example by correcting against GHCN stations.
2. Evidence of real search demand for Australian, NZ or German place queries.
3. Per-place pages, which need the owner's amendment allowing an offline data script.

Only then would an hour with Canberra or inland NZ gardeners be worth spending (VALIDATION_PLAN.md).

## Research limits

**Search:**
- No search-volume data.
- The research search tool uses a US-only index.

**Sources:**
- Several key sites blocked automated reading: garden.org, Dave's Garden, PlantMaps, BoM, Thompson & Morgan.
- Reddit couldn't be read.
- WeatherSpark blocked a scripted recheck.

**Accuracy check:**
- It covers two stations in one city, plus the earlier five US cities.
- Screen height (1.2 m against 2 m) explains part of the gap.

**Scholarly:** evaluations of reanalysis temperature were seen only in search results (LibKey unavailable).
