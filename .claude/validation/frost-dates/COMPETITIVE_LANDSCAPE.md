# Competitive landscape: Frost Dates

Comparative Research (2026-10-11). Internal. Full evidence: `notes/market-notes.md` §3–7.

**Labels:**
- **[V]**: read on the source.
- **[S]**: snippet.
- **[SERP]**: result-list observation (US-only index; ranking is indicative only).
- **[U]**: inference.
- **[V, rechecked]**: confirmed directly during synthesis.

## Verdict

**Free frost dates are a commodity** wherever demand is visible:
- given away to attract customers by almanacs, seed companies and app makers;
- bundled into paid planners;
- built on station data in the US and on the Met Office's own grid in the UK.

**What's distinctive about Frost Dates:**
- any coordinate worldwide;
- three thresholds;
- median and 9-in-10 dates;
- the recent 30 seasons;
- southern-hemisphere seasons.

That combination wasn't found free elsewhere [U]. But in the places where it's most needed, the data's accuracy, not competition, is the binding problem (`notes/accuracy-check.md`).

## Tools

| Tool | Coverage | Data | Price or model | Signals |
|---|---|---|---|---|
| **Old Farmer's Almanac** frost calculator | US and Canada by ZIP or postal code | Nearest station, 30% probability, 32 °F [V] | Free; sells the almanac, a store and ads [V] | Dominates ZIP queries [SERP] |
| **garden.org** (National Gardening Association) | US; Ontario and Israel lookups return nothing [S] | NOAA stations, freeze probabilities [S] | Free | Recommended by Epic Gardening [V] |
| **Dave's Garden** | US | Stations; the user picks one [V via Seedtime help] | Unknown (blocked) | Recommended by Seedtime help [V] |
| **PlantMaps** | US states and Canadian provinces; claims Europe and Asia; Ireland confirmed [S] | Average dates in 10-day windows by town [S] | Free | Hub "updated September 2026" [S] |
| **WeatherSpark** | Cities worldwide, including the southern hemisphere | "Growing season" = the longest run at or above 32 °F, from stations adjusted with MERRA-2, 1980–2016 [V] | Free pages; premium reports [V] | Not measured. A scripted recheck was blocked |
| **GrowVeg Garden Planner** | "All major regions" | 5,000+ weather stations; calendar and reminders [V] | $35 a year (auto-renew), $50 for one year, $85 for two [V] | 869,812 gardeners have made plans; since 2007 [V] |
| **Seedtime** | Claims anywhere in the world | Fetches frost dates automatically (source not named). Its June 2025 help told users to look dates up themselves [V] | Free tier; $7 or $14 a month [V] | 571,000+ gardeners [V] |
| **Planter** | "Available everywhere" | Calendar [V] | Free; $24.99 a year; $99.99 for life [V] | Not stated |
| **Johnny's** and **Grow Organic** calculators | Any place; you enter the date | Weeks from frost [V/S] | Free, as marketing | Top results for "seed starting calculator" [SERP] |
| **lastfrostdate.co.uk** | UK | Met Office HadUK-Grid, 1 km, 1960–2023, with a last-30-years toggle; air below 2 °C, light below 0 °C, hard below −2 °C; average dates [V, rechecked] | Free; no ads seen [V] | Ranks for UK queries [SERP] |
| **GardenFocused**, **JustGardenCentres** | UK, Ireland, France and others, by town | Dates that hold six years in seven; source not named [V] | Free | Since 2010 [V] |
| **My Cozy Plant** | UK regions; the app also covers the US and Canada | 50% and 10% dates; postcode frost alerts [V] | £2.99 a month or £19.99 a year [V] | 6 ratings [V] |
| **Fryd** | City guides for Australia, NZ, South Africa and more | Frost dates tied to hardiness zone, with no local data stated [V] | Free planner with an upsell [V] | Ranks for Canberra, Christchurch and Johannesburg [SERP] |
| **Gardenate** | Australia, NZ, South Africa, UK, US, Canada | Climate zone and month; no frost dates [V] | Free site; app | Since 2007 [V] |
| **Airtasker** guides | UK and Australian city tables | "Historical averages", with no method; some odd values [V] | Content marketing | Ranks for UK and Australian queries [SERP] |
| **MRCC freeze-date tool** | Counties in 25 US states | 1950–2021, any threshold [V] | Free (public) | Promoted by Purdue Extension [V] |
| **Frost-alert apps** | Mostly US and UK | Forecast-based nightly risk [S/V] | Free to about £3 a month | Mostly new (2025–26), few ratings [S/V] |
| **National met services** | National | Station or grid statistics, rarely dates [V/S] | Free | Most trusted |

**No worldwide frost-date tool built on Open-Meteo turned up** [SERP].

## Closest matches

- **WeatherSpark** comes closest for worldwide coverage [V]. But:
  - it works only through city pages;
  - it has a single 32 °F threshold;
  - its data stops in 2016;
  - it isn't framed for gardeners.
- **lastfrostdate.co.uk** is likely better local data for the UK than a 10 km reanalysis [V, rechecked/U]. It has no odds or cautious date [V].
- **Planners** (GrowVeg, Seedtime) already do the lookup plus the calendar, for a fee [V].

## Search

| Query | Who ranks | Opening? |
|---|---|---|
| last frost date; frost dates by zip code; first frost date | Large publishers and the Almanac [SERP] | No |
| UK frost dates; last frost date London | UK tools with Met Office data, Airtasker [SERP] | Hard |
| Australian, NZ and German place queries (Canberra, Christchurch, "letzter Frost München") | Newspapers, content pages, Fryd's zone guesses; no tool [SERP] | Possibly. It would need per-place pages and, for Germany, a German interface. Volume unknown |
| frost date calculator worldwide | US tools and dead pages [SERP] | Unknown volume |

Frost Dates has neither per-place URLs nor localisation, so as built it can't rank for place queries [repo].

## Wedge hypotheses, tested

| Hypothesis | Verdict | Why |
|---|---|---|
| Free | **Fails** | Free everywhere demand is visible [V] |
| Worldwide coverage | **Weakened** | Partly covered by WeatherSpark, PlantMaps and paid planners. Gaps remain in Australia, NZ, South Africa and non-English Europe [V/S] |
| Odds (a cautious date) | **Holds as a design strength** | Wanted, inconsistently offered [V] |
| Recent 30 seasons | **Holds** | Frost seasons are shifting in south-eastern Australia; UK last frosts are coming earlier [V/S] |
| Accurate enough where the gap is | **Fails at Canberra** | Cautious date about 5 weeks early against two stations [V, own check] |
| A planting calendar that works worldwide | **Failed in maritime climates** before commit 291fac5 | 1.5–2.5 months early for tomatoes in Dublin, London and Christchurch [V, own check]; tender crops now wait for warm nights |

## Monetization norms (research only)

**Frost information is given away to attract customers:**
- the Almanac's store and ads;
- Airtasker's content marketing;
- funnels into apps from Precip, My Cozy Plant and Fryd;
- seed companies' calculators [V].

**What people pay for:**
- planners: GrowVeg $35–$85, Seedtime $7–$14 a month, Planter $24.99 a year [V];
- nightly alerts: My Cozy Plant £19.99 a year [V].

**Nobody charges for frost dates alone** [V/U].
