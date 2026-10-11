# Frost Dates: accuracy and calendar check

A desk check run on 2026-10-11 for the comparative research. It tests three things the market notes flagged as decisive (market-notes.md, "Tests that would change this assessment"):

1. Does Frost Dates agree with local station records at the beachhead (Canberra)?
2. Does the planting calendar suit maritime climates?
3. Does the 2017 change of source model shift the numbers?

Research only:
- No product code was changed, nobody was contacted, and nothing was signed up for.
- 10 Open-Meteo archive requests were made, about 830 weighted calls, all non-commercial research for a non-commercial site.
- 4 requests went to NOAA's public Access Data Service.

## Method

**Frost Dates' figures.** I ran the page's own code (`src/experiments/frost-dates/model.ts`: `readArchive`, `analyze`, `CROPS`) on Open-Meteo archive records. They were fetched with the page's exact parameters:
- `daily=temperature_2m_min`
- 1995-01-01 to 2026-10-09
- `timezone=auto`
- coordinates rounded to 0.01°
- default `best_match`

Two extra requests used `models=era5_land`.

**Thresholds.** 0 °C is the page's default "Frost". 2.2 °C (36 °F) is its "Light frost".

**Station records.** NOAA GHCN-Daily daily lows, read through NCEI's Access Data Service (`dataset=daily-summaries`, `dataTypes=TMIN`, metric):

| Station | GHCN ID | Location | Coverage |
|---|---|---|---|
| Canberra Airport Comparison | ASN00070014 | 149.2014, −35.3049 | 1995-01-01 to 2010-11-30: 5,808 of 5,813 days |
| Tuggeranong (Isabella Plains) | ASN00070339 | 149.0937, −35.4184 | 1996-06-01 to 2026-10-02: 11,001 of 11,081 days |

- Canberra Airport's current station (070351) wasn't found in GHCN-Daily through this service.
- **Same rules for both.** Station series were analysed with the same `analyze` function, so seasons, odds and thresholds are computed identically. Grid records were clipped to the station's period.
- **Which seasons were compared.** Per-season comparisons use only seasons where the station is at least 97% complete.

**Caveats:**
- Australian stations measure air temperature in a screen at about 1.2 m. The archive's value is for 2 m. On calm, clear nights, air nearer the ground is colder, so part of any gap is height, not error.
- The comparison covers two stations in one city.
- The scripts and full output are kept locally in `.claude/qa/frost-accuracy/` (not committed): `fetch.mjs`, `analyze.mjs` and `results-2026-10-11.txt`.

## 1. Canberra: Frost Dates against station records

**Typical and cautious dates, 0 °C** (spring dates are the last frost, autumn dates the first):

| Comparison | Last frost, typical | Last frost, cautious (9 in 10) | First frost, typical | Frost nights a season |
|---|---|---|---|---|
| Airport station, 1995–2010 | Oct 12 | Nov 11 | Apr 24 | 53.4 |
| Frost Dates at the airport, same years | Sep 10 | Oct 4 | May 20 | 26.0 |
| Tuggeranong station, 1996–2026 | Oct 10 | Nov 3 | Apr 28 | 62.5 |
| Frost Dates at Tuggeranong, same years | Sep 19 | Oct 1 | May 19 | 34.2 |

**Season by season, 0 °C** (Frost Dates minus station, in days):

| Station | Last spring frost | First autumn frost |
|---|---|---|
| Airport | Median 28 days early; mean 31; range 82 days early to 0 (n = 15) | Median 25 days late; mean 27 (n = 15) |
| Tuggeranong | Median 26 days early; mean 20; range 47 days early to 0 (n = 27) | Median 25 days late; mean 24 (n = 27) |

**Other observations:**
- At the airport, Frost Dates had about half the station's frost nights in June to August in every year from 1995 to 2010. For example, 1996 had 40 at the station and 19 in Frost Dates.
- Frost Dates' last frost came earlier than the station's in 13 of 16 springs and never later.
- **At 2.2 °C, the gap narrows.** Frost Dates' "Light frost" dates for Canberra (typical Oct 12–14; cautious Nov 11) land close to the *stations'* 0 °C dates. Per season, the 2.2 °C last-frost gap is a median of 15 days early. In effect, Frost Dates' 2 m daily lows run roughly 2 °C warmer than Canberra's screens on frost nights. This matches the size of reanalysis minimum-temperature errors reported in the literature (market notes K7) and ECMWF's known inversion problem (data notes §5).

**What a Canberra gardener would see.** Searching "Canberra" on the default settings gives:
- a typical last frost of Sep 13;
- "By Sep 30 in 9 springs out of 10";
- tomatoes planted out Sep 20–27, or Oct 7–14 counted from the cautious date.

**What the station records say:**
- The last frost comes after Oct 10 in about half of springs, and as late as Nov 3–11 one year in ten.
- The local folk rule, plant tender crops after Melbourne Cup Day (the first Tuesday of November), agrees with the stations, not with Frost Dates.

**Verdict on the beachhead's trust test.** The market notes set the bar at cautious dates within about two weeks of station records. Frost Dates misses by about 5 weeks at both stations, so **the test fails**.
- The page does warn that "hollows, valleys, and open country often get frost earlier and later than this".
- Canberra's frost-prone sites are exactly that.
- But the warning doesn't convey a month-long error across a whole city.

## 2. The planting calendar in maritime and mild climates

Frost Dates' tomato plant-out window is 1–2 weeks after the last frost, at 0 °C on default settings (`CROPS`):

| Place | Last frost, typical / cautious | Tomatoes out (typical) | Tomatoes out (cautious) | Local guidance for outdoor tomatoes |
|---|---|---|---|---|
| Dublin | Mar 5 / Apr 7 | **Mar 12–19** | Apr 14–21 | Late May or June, and mostly under cover (general knowledge, not checked against a source) |
| London | Apr 4 / Apr 19 | **Apr 11–18** | Apr 26–May 3 | RHS: early summer, once temperatures are reliably above 16 °C (market notes S43); growers plant out in late May or June (S66, S67, S69) |
| Christchurch | Sep 7 / Oct 6 | **Sep 14–21** | Oct 13–20 | Late October to November, aiming for soil at about 18 °C (S76, S77) |
| Melbourne | Too rare at 0 °C: calendar hidden. At 2.2 °C: Aug 20 / Sep 14 | At 2.2 °C: **Aug 27–Sep 3** | At 2.2 °C: Sep 21–28 | Melbourne Cup Day, early November (S74) |
| Minneapolis (continental control) | Apr 21 / May 7 | Apr 28–May 5 | May 14–21 | Commonly mid to late May (general knowledge, not checked against a source). The cautious anchor matches |

**Verdict.** In continental climates the calendar is reasonable, especially from the cautious date. In maritime and mild climates, frost ends months before it's warm enough for tender crops. There the calendar advises planting tomatoes **about 1.5 to 2.5 months earlier than local guidance**.

**The page's hedges.** It says "Rules of thumb … counted in weeks from the last spring frost. Seed packets for your varieties have the final word." But in the UK and Ireland, seed packets and the RHS time tender crops by month and warmth, not by frost.

**Classification.** This is wrong advice for those climates, though the stakes are seedlings, not safety. No change was made in this phase. It's flagged for the owner.

## 3. The 2017 change of source model

Open-Meteo's default `best_match` blends in ECMWF's IFS from 2017. I compared the page's records with `models=era5_land`:

| Place | Daily low: best_match minus ERA5-Land, before 2017 | Daily low: best_match minus ERA5-Land, from 2017 | Frost nights a season, 0 °C, best_match | Frost nights a season, 0 °C, ERA5-Land |
|---|---|---|---|---|
| London | 0.00 °C | +0.03 °C | 37.9 before, 27.7 from | 37.7 before, 29.2 from |
| Canberra Airport | 0.00 °C | −0.45 °C | 26.2 before, 28.4 from | 26.2 before, 24.6 from |

**Reading:**
- Before 2017 the two are identical, so `best_match` *is* ERA5-Land then.
- From 2017 the blend makes Canberra slightly colder: about 4 more frost nights a season, which happens to be nearer the stations.
- The dates barely move. The 0 °C dates are within a day or two. The 2.2 °C cautious last frost is Nov 1 with `best_match` against Nov 7 with ERA5-Land.
- **Conclusion:** the model mix is real but small next to the station gap. Switching to `models=era5_land`, as the data notes suggested for consistency, would not fix accuracy, and at Canberra would make it marginally worse.

## 4. Rate limit, observed

- Eight archive lookups sent about 1.5 seconds apart were all answered.
- The ninth was refused: HTTP 429, "Minutely API request limit exceeded".
- After a minute's wait it succeeded.
- **Interpretation:** this is consistent with the per-IP limit of 600 weighted calls a minute and about 83 calls per lookup (data notes §1.3). It's direct evidence that limits are enforced per connection, with request weights.

## What this changes

- **The narrowest beachhead fails on trust.** Canberra and similar frost-prone inland valleys get dates about 4–5 weeks too optimistic. Gardeners there already have a folk rule that the stations support.
- **The "any place in the world, with a planting calendar to match" summary overreaches** in two ways:
  - Accuracy degrades badly at frost-prone inland sites. The scale outside Canberra is unknown; four US cities were within 8 days in the earlier check.
  - The calendar is unsuitable for maritime and mild climates.
- **Fixes for an owner decision** (not done in this phase):
  - A plainer, stronger caveat: "On clear, still nights, frost-prone valleys and inland basins can get frost weeks later than this. Check a local weather station or long-time local growers."
  - Suggesting the Light frost threshold, or the cautious date, for tender crops.
  - Hiding or qualifying the planting calendar where frost ends long before warmth arrives. For example, show it only when the typical last frost falls within about 4–6 weeks of the month nights warm past about 10 °C, or add "in mild climates, wait for warm nights as well".
  - A longer-term fix would be correcting the grid against stations, which is a different product.
