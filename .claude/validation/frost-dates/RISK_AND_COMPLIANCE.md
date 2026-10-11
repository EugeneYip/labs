# Risk and compliance: Frost Dates

Comparative Research (2026-10-11). Internal. **Not legal advice.**

**Evidence.** Full evidence is in `notes/data-notes.md`, which covers:
- Open-Meteo's terms, server source, pricing and maintainer statements;
- alternative sources, working figures out ahead of time, data quality and cost.

**Labels.**
- **[V]**: read on the source, or in the server's source code.
- **[S]**: snippet only.
- **[E]**: my arithmetic, with the working shown in the notes.
- **[U]**: inference.
- **[V, rechecked]**: confirmed directly during synthesis.

Nothing was signed up for, requested or downloaded, and nobody was contacted.

## Summary

| Area | Labs version today | Hypothetical standalone |
|---|---|---|
| Open-Meteo terms | Matches the terms' own example of non-commercial use: a free site with no ads or subscriptions [V] | Ads or subscriptions are commercial by explicit example. That needs a paid plan that includes the archive: Professional, $99 a month at least [V]. A paid key can't be hidden in a static page [U] |
| Rate limits | Enforced per visitor IP address, so each visitor gets about 120 lookups a day [V/E] | The README asks any *application* above 10,000 calls a day to get in touch. That's about 120 lookups a day across all visitors [V/E] |
| Availability | No uptime guarantee. Open-Meteo may block applications or IP addresses that misuse the service, without notice [V] | The same, unless on a paid plan (99.9% target) [V] |
| Attribution | Open-Meteo, CC BY 4.0, ERA5, ERA5-Land, IFS and Copernicus are all credited [V, rechecked]. **GeoNames, behind the place search, is not** [V, rechecked] | The same, plus whatever any new data source needs |
| Data quality and reliance | The page's caveats (2 m air, grid squares, hollows, cities) match ECMWF's documentation [V]. **But at Canberra, the cautious date is about 5 weeks too early against two station records**, and the planting calendar advises tender crops 1.5–2.5 months early in maritime climates (`notes/accuracy-check.md`) [V, own check] | Stakes rise if it's sold to growers |
| Privacy | The chosen place, rounded to about 1 km, goes to Open-Meteo, and so does the search text. Settings and the last place's records stay in the browser [V, rechecked] | Ads or analytics would add third-party tracking |

## 1. What Open-Meteo's terms permit today

**The free API's conditions** [V]:
- Fewer than 10,000 calls a day, 5,000 an hour and 600 a minute.
- Non-commercial use only.
- Data under CC BY 4.0.
- Open-Meteo may block applications and IP addresses that misuse the service.

**What counts as non-commercial.** The terms point to Creative Commons' interpretation [V].
- They list "private or non-profit websites or apps without subscriptions or advertising" as non-commercial.
- They list sites or apps with subscriptions or ads, and integration into commercial products, as commercial.

**How Labs fits.** Labs is a free site run by an individual, with no ads, so it fits [V/U]. The README says browser (CORS) requests are supported, so calling the API straight from a page is expected use [V].

**Donations aren't addressed**, by Open-Meteo or by the Creative Commons guidance [V]. A passive donation link probably doesn't change a site's main purpose. One that unlocks features leans toward "monetary compensation" [U]. Confirm in writing before relying on either reading.

## 2. Limits: per IP, per application, and what they mean

**How calls are counted.** Each location weighs max(1, variables/10 × days/14) calls. This is verified in the server's `calculateQueryWeight()` and the pricing calculator [V].

**What Frost Dates costs.** The page asks for one daily variable from 1995-01-01 to two days ago (11,605 days), which is **about 83 calls per lookup** [E].

**Correction.** An earlier internal estimate of about 830 calls (about 12 lookups a day) left out the variables/10 factor. `.claude/PORTFOLIO_RESOLUTION.md` was corrected on 2026-10-11.

**How limits are enforced.** Counting is per client IP address [V]:
- IPv4 addresses are counted as they are; IPv6 addresses are hashed.
- There are counters per minute, per hour and per UTC day. **There's no monthly counter** [V].
- Each IP is served one request at a time, and extra requests queue (since March 2025) [V].
- Archive requests can take a few seconds [V].

**What that allows** [E]:

| | Lookups |
|---|---|
| Per minute, per IP | 7 |
| Per hour, per IP | 60 |
| Per day, per IP | 120 |

**People who share an IP address share one budget and one queue** [U]: offices, schools, VPNs, and mobile networks that put many users behind one address. The page already shows a "busy" message when it gets an HTTP 429 response [V, rechecked].

**The policy reading is looser than the enforcement.** The README asks any application above 10,000 requests a day to get in touch [V]. The terms' "fewer than 10,000 calls a day" doesn't say per what [V]. Read per application, that's about **120 lookups a day across all visitors**, or about 3,600 a month at the pricing table's 300,000 a month [E].

**The page is well inside this today** [U]: there's no evidence of meaningful traffic, and Labs has no analytics.

**Re-checks are expensive.** A visitor who comes back after 3 or more days costs another 83 calls, because the whole record is fetched again [V, rechecked]. Switching between two places also fetches each place's full record again, because only the last place is kept [V, rechecked].

## 3. Is a standalone non-commercial version sustainable?

**At small scale, yes.** It costs nothing, and up to about 120 lookups a day it fits even the strictest reading [U].

**Above that, it rests on goodwill, not on the written terms** [U]:
- The README asks heavy applications to get in touch.
- The daily figure is ambiguous.
- There's no uptime guarantee.
- Open-Meteo keeps the right to block.

**A free key wouldn't help.** The maintainer offers free API keys to clearly non-commercial apps [V], but a key would be visible to everyone in a static page, and Labs forbids keys.

**The dependence is on Open-Meteo's service, not on its data** [V/U]. The underlying data is open and available in bulk without keys:
- ERA5-Land and ERA5: CC BY 4.0 [V].
- GeoNames: CC BY 4.0, per Open-Meteo's licence page [V].

**Making money from it changes the model** [V/U]:
- Ads make the use commercial: Professional at $99 a month, or about $185 a month at around 100,000 lookups a month.
- A paid key needs a server or proxy, which breaks Labs' static-only and no-secrets rules.
- Data gathered through the free service shouldn't be repackaged commercially. Bulk open data avoids that question.

## 4. Cost if usage grows (USD prices shown on 2026-10-11)

| Lookups a month | Weighted calls | Free tier (per IP) | Free tier (per application) | If commercial |
|---|---|---|---|---|
| 1,000 | about 83,000 | Fine | Within the figures | Professional, $99 a month (Standard, $29, excludes the archive [V]) |
| 10,000 | about 829,000 | Fine | About 2.7 times over. Contact Open-Meteo | Professional, $99 a month |
| 100,000 | about 8.3M | Works, but busy errors on shared IPs become more likely | Far over | From $185 a month (the 10M tier) |

Geocoding calls aren't included [E/V]. Whether geocoding has its own limits is unknown.

## 5. Alternatives (data notes §3)

| Source | Key or account? | Fit |
|---|---|---|
| **Open-Meteo's copy of ERA5-Land and ERA5 on AWS** (`openmeteo` bucket) | No. CC BY 4.0 [V] | **The best bulk source for working things out ahead of time.** The bucket allows browser (CORS) requests [V, rechecked 2026-10-11: `Access-Control-Allow-Origin: *`, GET and HEAD] |
| **NASA POWER** | No key. Staff ask for no more than 5 requests at a time [V] | Fair: about 50–60 km squares, daily from 1981. Allows browser requests [V, rechecked 2026-10-11: `Access-Control-Allow-Origin: *` on a daily point request]. A plausible live fallback, but too coarse for hills and coasts |
| **GHCN-Daily** (NOAA) | No. CC0 on AWS [V] | Good wherever there's a station; nothing between stations |
| **NOAA 1991–2020 normals** | No [V] | The US reference; US only |
| **Meteostat** | No for bulk files. Yes (RapidAPI) for its JSON API [V] | CC BY 4.0 now [V]. Mixes in model data by default |
| **ERA5 or ERA5-Land through the Copernicus Climate Data Store** | **Account and token** [V] | Conflicts with Labs' rules, except as a one-off download |
| **Met Office HadUK-Grid** | CEDA account [S] | UK only |
| **BoM, ECCC, DWD** | Open licences [V] | National cross-checks only |
| **E-OBS** | Free, but **non-commercial research and education only** [V] | Unsuitable for a public tool |
| **Daymet** | No [V] | North America only, and stops at the last full year |

## 6. Caching and working things out ahead of time

**Within the current rules, with no infrastructure** [U]. This is a code change only, and an owner decision:
- Keep the 30-year record in the browser.
- Fetch only the days since the last visit; anything up to 140 days costs 1 call.
- That cuts a return visit from about 83 calls to about 1.
- First visits still cost about 83.

**Hybrid** [E/U]:
- Ship the 30-year frost statistics as static files.
- Fetch only "this season so far" live.
- That's about 1–1.3 calls a lookup instead of about 83: 64–83 times fewer.

**Fully static** [E]:
- A climatology-only grid for the world's land at 0.1° is about **78–93 MB**.
- At 0.25° it's 12–15 MB.
- Both are under GitHub Pages' 1 GB site limit [V].
- Keeping per-season history for every grid square would exceed that limit at 0.25° and finer.

**What either design would need** [V/U]:
- A one-off download of about 128 GB (ERA5-Land, 1995–2026).
- An offline script.
- A re-run about once a year.

**Labs' constitution says "don't add build infrastructure"**, so an offline data pipeline needs an **owner amendment** first (constitution §6) [U].

**Running Open-Meteo locally keeps today's numbers.** Running its server (AGPL) offline over a list of places, with `models=era5_land`, would keep its downscaling to the exact point [V/U]. Using the AGPL server privately to produce data files doesn't trigger its network clause (inference, not legal advice).

**Effect.** This would remove 98–99% of per-visitor calls, and most of the dependence on Open-Meteo's availability and terms [E/U]. Static files from CC BY 4.0 bulk data would also work for an ad-supported version, subject to GitHub Pages' own rules on commercial use [U].

## 7. Data quality and reliance

**What ECMWF's own documentation says** [V]:
- Grid values are averages over each square.
- 2 m temperature errors grow in low-level inversions.
- Land near coasts can cool too fast at night.
- ERA5 has no urban scheme, so cities come out too cold.
- A fixed height correction can point the wrong way in winter inversions, so frost in hollows is likely undercounted [U].

**Labs' own check** (PRODUCT_LOG.md) [V]:
- Four US cities came within 8 days of NOAA-based dates.
- Downtown Portland was 19 days late in spring and 12 days early in autumn.

**Mixed models.** The page uses Open-Meteo's default `best_match`, which blends IFS (from 2017) with ERA5 and ERA5-Land. Open-Meteo's own docs recommend ERA5 or ERA5-Land alone for work spanning decades [V].
- Tested on 2026-10-11 (`notes/accuracy-check.md` §3): before 2017 the two are identical. From 2017 the blend shifts Canberra's daily lows by −0.45 °C and London's by +0.03 °C, and moves dates by a day to a week.
- Switching to `models=era5_land` would add consistency but **wouldn't fix accuracy**; at Canberra it would be marginally worse. Nothing was changed in this phase.

**Station check at the beachhead** (`notes/accuracy-check.md` §1) [V, own check]:
- Frost Dates' code was run on the page's own Open-Meteo records and compared with NOAA GHCN-Daily records for Canberra Airport (1995–2010) and Tuggeranong (1996–2026).
- At 0 °C, Frost Dates' last spring frost comes a median 26–28 days earlier than at the stations, season by season.
- Its cautious date is about 5 weeks early: Oct 4 against Nov 11 at the airport, and Oct 1 against Nov 3 at Tuggeranong.
- It shows about half the stations' frost nights.
- Part of the gap is screen height (1.2 m against 2 m), but most of it matches the documented inversion problem.

**Planting calendar in maritime climates** (`notes/accuracy-check.md` §2) [V, own check]:

| Place | Tomatoes out (typical) | Tomatoes out (cautious) |
|---|---|---|
| Dublin | Mar 12–19 | Apr 14–21 |
| London | Apr 11–18 | Apr 26–May 3 |
| Christchurch | Sep 14–21 | Oct 13–20 |

Local guidance says late May or June in the UK and Ireland, and late October or November in Canterbury.

**Stakes are modest, but real** [U]:
- A wrong date means lost seedlings and replanting.
- For orchard or market growers, a wrong date can mean a lost crop.

**The page's wording partly fits this** [V, rechecked]:
- It reports odds ("in 9 springs out of 10").
- It names 2 m air and grid squares.
- It warns that hollows, valleys and open country get frost earlier and later.
- It tells people seed packets have the final word.

**What the wording doesn't convey:**
- That the odds are the grid's, not a garden's.
- That at frost-prone inland sites they can be a month too optimistic.
- That the calendar doesn't suit mild climates.

This was judged a material accuracy issue for an owner decision, not a "genuinely harmful factual claim": no safety or legal stakes, a general caveat already present, and seedlings at stake. No public change was made in this phase.

## 8. Privacy and storage

**What leaves the device** [V, rechecked]:
- The chosen place's coordinates, rounded to 0.01° (about 1 km), go to Open-Meteo.
- Typed search text goes to Open-Meteo's place search.

**What the page says about it** [V, rechecked]:
- The page says "the place you pick is sent to Open-Meteo, rounded to about a kilometer".
- Search text isn't mentioned. That's a small omission, not a harmful claim.

**What stays in the browser** [V, rechecked]:
- Settings and the last place's records, under `labs:frost-dates` and `labs:frost-dates:data`.
- Safari's tracking prevention may remove them after seven days of Safari use without a visit. Home Screen web apps are exempt from that cap, according to WebKit.
- The only cost is fetching the records again.

## 9. Claims to avoid

**Avoid** [U]:
- "Safe to plant after…", "frost-free guaranteed" or "accurate for your garden".
- "Forecast". These are climate odds, not a prediction for this year.
- "Official" or "NOAA dates".
- Precise-sounding single dates without odds.

**The current wording avoids all of these** [V, rechecked].

**Two places overreach** [V/U]:
- The summary promises frost dates "for any place in the world … with a planting calendar to match". The calendar doesn't match maritime climates.
- "In 9 springs out of 10" reads as a garden-level probability.

Wording to consider:
- "Odds from a weather archive; frost-prone valleys can see frost weeks later".
- "In mild climates, wait for warm nights as well".

## 10. Owner actions and decisions (none taken in this phase)

1. **Add a one-line GeoNames credit** to Frost Dates' place search, for example "Place search by Open-Meteo, using GeoNames data (CC BY 4.0)". **Line Dry has the same gap.**
   - This is a licence-attribution gap, not a harmful claim, so it was left unchanged under this phase's rules.
2. **Ask Open-Meteo in writing** (owner action; not done):
   - Is a static page whose visitors stay within per-IP limits acceptable once total use passes 10,000 calls a day?
   - Does the README's figure mean weighted calls or HTTP requests?
   - Would a donation link affect non-commercial status?
3. **Accuracy and calendar wording** (§7, §9; `notes/accuracy-check.md`), the most important item here:
   - a stronger caveat for frost-prone valleys and inland basins;
   - suggest the Light frost threshold or the cautious date for tender crops;
   - qualify or hide the planting calendar where frost ends long before warm nights.
4. **Later product changes, if wanted:**
   - Incremental refresh (§6).
   - Mention that search text goes to Open-Meteo (§8).
   - `models=era5_land` only for consistency: it doesn't improve accuracy (§7).
5. **Constitution:** working data out ahead of time needs an amendment allowing an offline data script (§6).
