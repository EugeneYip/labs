# Frost Dates: market notes

Research notes for the Phase 1 validation of #017 Frost Dates (labs.eugeneyip.net/frost-dates/). Compiled 2026-10-11. Internal; not for the website.

The question being tested: is worldwide frost-date lookup underserved, searchable, and useful enough to justify a standalone service? These notes try to falsify that.

**Evidence tags.** Every claim carries a tag and a source ID. The IDs map to the source list at the end, which gives each URL, its date where known, and how it was read.

- **[V S10]**: VERIFIED. Read on that page on 2026-10-11.
- **[S S44]**: SNIPPET. Seen only in a search-result summary. The page was not read, often because it blocked automated reading.
- **[SERP]**: Seen in the result list of the research search tool on 2026-10-11. That tool searches a US-only index and is not Google, so ranking notes are indicative only.
- **[K4]**: A scholarly source, seen only in search results. Scholarly, not resolved via LibKey: the required connector isn't available, and the papers were not read.
- **[U]**: UNVERIFIED. An inference, or a claim not checked against a source.
- **[repo]**: From Frost Dates' own code or `PRODUCT_LOG.md` in this repository.

**Coverage limits.**

- All 30 allowed web searches were used, plus about 50 direct page reads.
- Several key sites refused automated reading (HTTP 403 or a bot check). They are cited only from search snippets, and no workaround was attempted: garden.org, davesgarden.com, plantmaps.com, bom.gov.au, marlborough.govt.nz, growfruitandveg.co.uk, forum.kitchengarden.co.uk, thompson-morgan.com and catalogue.data.govt.nz.
- Reddit could not be fetched at all, so no Reddit evidence appears here.
- There are no search-volume figures (no paid keyword tools, and Google Trends wasn't readable). Search-demand conclusions rest on who ranks, not on how many people search.
- Forum quotes are anecdotal. Several are old (2012, 2019) and are used only to illustrate a problem, not to size it.

---

## 0. Frost Dates, for reference [repo]

- **What it does:** you search for a town anywhere, or use the device's location. It reads 30 years of daily lows from Open-Meteo's historical archive, built from ERA5, ERA5-Land and ECMWF's forecast model on a grid about 10 km across.
- **Results:**
  - Last spring frost and first autumn frost, each as a typical (median) date and a cautious 9-in-10 date.
  - The frost-free season, frost nights per year, and this season so far.
  - A chart of every frost night since 1996, and a table of each season's first and last frost.
- **Thresholds:** 36, 32 or 28 °F (2, 0 or −2 °C), shown in °C or °F. Southern-hemisphere seasons run from one summer to the next.
- **Planting calendar:** 13 crops, counted in weeks from the last frost.
  - Tomatoes are started 8 to 6 weeks before and planted out 1 to 2 weeks after (`model.ts`).
  - The page calls these rules of thumb and defers to seed packets. It says nothing about soil temperature or warm nights (`index.tsx`).
- **Accuracy check:** compared with NOAA-based dates for Boston, Denver, Minneapolis, Atlanta and Portland (Oregon), results were within 8 days. The exception was downtown Portland, 19 days later in spring and 12 days earlier in autumn (PRODUCT_LOG 2026-10-09). A later audit found the method matches NOAA's 36/32/28 °F and 10/50/90% conventions (PRODUCT_LOG 2026-10-10).
- **Structure that matters for search:**
  - It is a single client-side page, and a searched place is not reflected in the URL. There are no per-place pages a search engine could index or a person could share (`index.tsx`).
  - Place search asks the geocoder for English names (`index.tsx`).

---

## Key findings

1. **"No tools outside the US" is partly false.**
   - The UK already has at least three free, dedicated last-frost tools, plus a frost app. The best of them, lastfrostdate.co.uk, runs on the Met Office's 1 km HadUK-Grid. That is a finer and more station-based grid than Frost Dates' 10 km reanalysis [V S20, S21, S22, S23, S24].
   - PlantMaps claims frost-date maps across North America, Europe and Asia, and has Ireland maps [S S08, S09].
   - WeatherSpark gives a 32 °F frost-free "growing season" for cities worldwide, including the southern hemisphere [V S10, S11].
   - GrowVeg's paid planner uses 5,000+ weather stations worldwide [V S13].
2. **The genuine gaps are narrower.**
   - Australia, New Zealand, South Africa and non-English Europe have no town-level lookup, by threshold and by odds, built on recent years.
   - The answers people find there are folk rules (Melbourne Cup Day, Labour Weekend, the Eisheiligen) or low-quality tables that contradict each other by 1–2 months [V S26, S27, S71, S73, S76; V S54].
3. **Outside continental climates, frost is often not what decides planting.**
   - The RHS times tomatoes by month and by temperatures reliably above 16 °C, with no frost date [V S43].
   - NZ guidance aims for soil at 18 °C [V S76]. German practice is a fixed folk date, 15 May [V S54].
   - US extension and forum voices say soil temperature, the forecast and an experienced neighbour beat an average date [V S62, S64; S S81, S82].
   - A frost-anchored planting calendar could steer UK gardeners too early [U, see 4.7].
4. **Search is captured or invisible.**
   - US queries belong to almanac.com and programmatic ZIP pages; the UK results include dedicated tools [SERP].
   - AU, NZ and German queries show papers, news SEO clusters (Stuttgarter Zeitung), Airtasker content pages and the Fryd app, but no tool [SERP]. That may be an opening, or it may mean little demand.
   - Frost Dates has no per-place URLs, so as built it can't rank for "[city] last frost date" [repo].
5. **The data is roughly right but contested locally.**
   - Reanalysis minimum-temperature errors of about 2 °C or more are reported in some regions [K7].
   - ERA5 lacks urban physics [K6] and flattens daily temperature swings [K4].
   - Gardens feel ground frost, which is more common than air frost [V S40].
   - Open-Meteo itself advises against mixing models in multi-decade series, and Frost Dates' "best match" record mixes ERA5 with the IFS forecast model from 2017 [V S55; repo].
6. **Frequency is low.** The decision comes twice a year, and a lookup is needed once per location [U]. The market already treats frost dates as a free lead magnet: Airtasker, Precip, My Cozy Plant, Fryd and seed companies all give them away. People pay for planners (GrowVeg $35 a year, Seedtime $7–14 a month, Planter $24.99 a year) or for nightly frost alerts [V S14, S15, S17, S25, S30].
7. **The design choices match what people say they want:**
   - a cautious date, not just the average [V S22, S24, S65];
   - several thresholds [V S21, S31];
   - recent years rather than old normals. Frost seasons in south-eastern Australia have lengthened, and UK last frosts are coming earlier [K2; V S40].

---

## 1. Real jobs and workflows, by country

### 1.1 The core job

- The North American seed-packet convention gives sowing as weeks before or after "last frost". Gardeners find the local date and count back [S S86, S88].
- Johnny's widely used seed-starting calculator needs the user to type in their frost-free date; it does not look one up [V S18].
- Planners do the lookup and the counting together:
  - Seedtime says it pulls local frost dates automatically and builds the calendar from them [V S15].
  - GrowVeg drives its planting calendar and email reminders from local climate data [V S13].
- The cautious date is a recognised need:
  - US guides separate a 50% "last frost date" from a later ~10% "frost-free date" [V S65].
  - Mother Earth News lets readers pick a 50/50 or a 10% date [S, via search summary of S06/S65 cluster].
  - In the UK, GardenFocused targets dates that hold six years in seven [V S22], and My Cozy Plant shows a 10%-risk "safe planting window" [V S24].
- The autumn job is about fall crops and season extension. Midwestern growers use the MRCC freeze tool, with thresholds below 28 °F, for high tunnels and fall crops [V S31].

### 1.2 United States and Canada

- **Where people get dates:**
  - The Almanac's ZIP and postal-code calculator covers the US and Canada, using the nearest station at a 30% probability and 32 °F [V S01; S S02].
  - The National Gardening Association's garden.org calculator takes a ZIP or city and shows freeze probabilities from NOAA NCEI data [V S06; S S05].
  - PlantMaps state maps [S S08], Dave's Garden [V S16 refers to it], and Precip's per-ZIP pages [V S30].
  - Extension offices, for example NC State Extension's Buncombe County page with Asheville's average of April 20 [V S64].
- **Official data:**
  - NOAA's 1991–2020 normals cover 7,300+ temperature stations, with growing-season lengths at several thresholds and percentiles or probabilities [V S45].
  - Regional climate centres publish station freeze-probability graphs; WRCC is the one used in S60 [V S60]. MRCC has a county freeze-date tool for 25 states, with data from 1950 to 2021 [V S31].
- **Canada:**
  - The Almanac covers Canadian postal codes [V S01].
  - The AAFC climate-normals atlas maps average last spring frost at 0, −2 and −4 °C on a 10 km grid [S S46].
  - ClimateData.ca maps the last spring frost at 0 °C, for 1961–1990 and as projections [V S47].
  - Manitoba publishes 50%, 1-in-4 and 1-in-10 risk maps [S S48].
- **Workflow signal:** planting decisions are layered.
  - The frost date sets the baseline. Soil temperature decides whether seeds will grow. The short-range forecast decides when to cover plants [V S62, S64; S S81].
  - Purdue's specialist puts it as history for planning, current conditions for daily decisions [V S31].

### 1.3 United Kingdom and Ireland

- **Official framing:**
  - The Met Office describes a north–south pattern. Southern and coastal areas see their last air frost earlier. Further north and on high ground it runs into May, and in a few places June [V S40].
  - Its station climate averages (1991–2020) count frost days, but give no first or last frost dates, and it offers no frost-date lookup [V S41, S40].
  - The RHS tomato guide sows by month and plants out in early summer once temperatures are reliably above 16 °C. It has no frost-date framing [V S43].
  - A 2017 Met Office release put the outdoor window for courgettes and sweetcorn in the south at about mid-May to late September [S S42].
- **What gardeners use:**
  - Free tools: lastfrostdate.co.uk (town, postcode or map; air, light and hard frost) [V S20, S21], GardenFocused's town list [V S22], JustGardenCentres' town calculator [V S23], and My Cozy Plant's regional table and app [V S24, S25].
  - Content tables, such as Airtasker's city table [V S70].
  - Folk timing. One West Sussex grower plants out at the late-May school half-term [S S69]. A grower in NW Herefordshire plants out in the second week of June [S S66]. Another waits for nights of at least 8–10 °C [S S67].
  - In Edinburgh, local vegetable growers often wait until June [S S100].
- **Ireland:**
  - No current Met Éireann last-frost table was found. The nearest official item is a 1975 memorandum on first and last ground frosts [S S57].
  - PlantMaps has Irish last- and first-frost maps, putting Dublin and Kilkenny in early May and Rosslare in early March [S S09].
  - GardenFocused lists Irish towns [V S22].

### 1.4 Germany and central Europe

- **The Eisheiligen (11–15 May) is the working rule.**
  - A Stuttgarter Zeitung piece from 29 April 2026 uses DWD data for 1990–2020. It gives the latest last-frost dates in that 30-year window for state capitals, for ground frost below −2 °C and below 0 °C.
  - Over most of Germany those latest dates fall between 26 April and 16 May (−2 °C) and between 13 May and 4 June (0 °C). Examples: München 7/16 May, Berlin 22 April/25 May, Hamburg 3/15 May, Stuttgart 25 April/6 May.
  - The article calls the Eisheiligen a good rule of thumb and advises planting tender plants after 15 May [V S54].
- **No postcode-level tool was found** [SERP].
  - The closest is rechner-portal.de's sowing calculator. It uses the Bundesland as a stand-in for the frost date, shows ads, and its example dates contradict each other [V S32].
  - Retail calendars (toom, Plantura) are organised by month and the Eisheiligen [SERP].
- **Other European countries:** a UK allotment forum thread points to interactive frost maps for the UK, France, Spain, Slovakia "etc." These are probably PlantMaps [S S68, S08].

### 1.5 Australia

- **No official last-frost date was found.**
  - The Bureau of Meteorology publishes maps of annual and monthly "potential frost days" for 1976–2005, not dates [S S44].
  - Older ABS Year Books describe the frost season: roughly April to October inland, with long frost seasons in the highlands and Tasmania [S S103].
- **Folk rules dominate in cool climates:**
  - Canberra folklore puts the first frost around Anzac Day (25 April) and the last around Melbourne Cup Day, the first Tuesday in November [S S101].
  - Canberra's Region Media columnist describes the Melbourne Cup planting rule. She expects the autumn killing frost by Anzac Day and light frosts possible into November [V S73].
  - A veteran Canberra grower waits until after the Cup. Canberra Airport once recorded −2.6 °C in October [S S80].
  - Ballarat traditionally treats frost risk as over on Melbourne Cup Day [V S74].
- **Planting guides are organised by climate zone and month, not frost date:**
  - Gardenate offers 5 Australian zones [V S29].
  - The Fryd app has city guides with zone-derived frost dates [V S26].
- **Shifting baseline:** research on south-eastern Australia reports a longer frost season, and mean last-frost dates moving later, roughly a month since the 1960s [K2; K1]. Old tables and folklore may be stale in either direction.

### 1.6 New Zealand

- **Labour Weekend is the folk date for summer planting.**
  - Yates NZ says it is based on an average last-frost date and moves by up to a week between years. It suggests planting up to December and aiming for soil at about 18 °C [V S76].
  - Awapuni Nurseries publishes tomato windows by region, from early to mid-September in Whangārei to mid-November to early December in Southland. It adds 1–3 weeks for inland, elevated or frost-pocket gardens [V S77].
- **Official data exists but isn't a lookup:**
  - A council hosts probability-based NIWA frost maps for Marlborough [S S50].
  - A government dataset holds 30 stations with yearly first- and last-frost fields, as air frost at 1.2 m [S S51].
  - Figure.nz charts ground-frost days. Christchurch averages about 5.6 in October and 2.6 in November, and about 85 a year against about 46 for Hamilton [S S52, S53].

### 1.7 South Africa

- No South African Weather Service frost-date table was found [SERP].
- Gardeners get dates from:
  - app guides (Fryd's Johannesburg guide says mid-August) [S S28];
  - lawn-care sites (frost ends in August) [S S79];
  - seed suppliers. Living Seeds uses the same "6–8 weeks before last frost" framing [S S78].
- An agricultural weather report warned that interior frost risk can last into early October, especially in El Niño years [S S87].
- Evidence here is thin [Gaps].

### 1.8 Market gardeners

- Growers need more than three thresholds, and more than dates. The MRCC tool added choices below 28 °F because high-tunnel and row-cover decisions happen at 25 °F and 20 °F [V S31].
- Johnny's, the market-grower seed house, gives a free calculator but expects the grower to know their own date [V S18].
- No evidence was found of growers outside the US using worldwide frost-date tools [Gaps].

### 1.9 How people handle microclimates

- **Expert advice:**
  - Frost pockets and aspect matter. North Carolina extension says a hard frost can come at least 10 days either side of the average [V S64].
  - The Met Office notes that valleys collect draining cold air [V S40]. The DWD-based German article flags low-lying areas, valleys and higher ground [V S54].
  - NZ nurseries add 1–3 weeks for frost pockets [V S77].
  - The University of Washington's horticulture library advises adding at least a week and watching your own site [S S83].
- **What gardeners do:**
  - Use the experienced neighbour [V S62].
  - Find a closer station: a regional climate centre's map [V S60], Weather Underground neighbours [S, via search summary], or volunteering as a reporting station [V S61].
  - Pad by two weeks [S S72].
  - Experiment and protect plants with fleece, cloches and row covers [V S74, S64].
- **Ground frost matters for seedlings.**
  - The Met Office says ground frost is more common than air frost in May [V S40].
  - NIWA's frost-day series is air frost at 1.2 m [S S51].
  - My Cozy Plant's developer claims ground-level air can be 3–5 °C colder on still, clear nights [S, app-listing summary; developer claim].

### 1.10 What official and extension services provide

| Country | Service | What it gives | Frost dates by place? | Tag |
|---|---|---|---|---|
| US | NOAA NCEI 1991–2020 normals | Station normals incl. growing-season length at thresholds, probabilities | Yes (station data, used by most tools) | [V S45] |
| US | Regional climate centres (MRCC, WRCC) | County freeze-date tool; station freeze-probability graphs | Yes | [V S31, S60] |
| US | Cooperative extension | Local averages and planting advice | Some (state or county averages) | [V S64] |
| Canada | AAFC atlas; ClimateData.ca; provinces (e.g., Manitoba) | Average last/first frost at 0/−2/−4 °C, 10 km grid; risk maps | Yes (maps) | [S S46; V S47; S S48] |
| UK | Met Office | Station averages (frost-day counts), blogs | No dates, no lookup | [V S40, S41] |
| UK | RHS | Month and temperature guidance | No | [V S43] |
| Ireland | Met Éireann | Old ground-frost memo (1975); climate averages | None current found | [S S57] |
| Germany | DWD | Station data; press uses it for latest-frost tables | Not as a lookup (found) | [V S54] |
| Australia | BoM | Potential frost days maps (1976–2005) | No | [S S44] |
| New Zealand | NIWA / Stats NZ / councils | Frost days; regional probability maps; 30-site first/last frost data | Partial (maps, datasets) | [S S50, S51] |
| South Africa | SAWS | Nothing found | No (found) | [SERP] |

---

## 2. Pain

**2.1 The station isn't where the garden is.**

- ZIP tools take the nearest station. In one Smart Gardener case, a ZIP code spanning sea level to 2,500 ft drew its spring date from Santa Cruz, nearly a month earlier than the reader's garden. The fix was finding the Ben Lomond station on a regional climate centre map [V S60].
- A Colorado gardener found charts for her area ranging from May 9 to June 1. She noted that a station only half a mile from another sat 13 m lower [V S61].
- A UK forum poster found online tools about a month early for Hemel Hempstead [S S66].

**2.2 Sources conflict, often by a month or more.** A new tool adds one more number to this list.

| Place | One source | Another source | Gap | Tags |
|---|---|---|---|---|
| London, UK | Airtasker: last frost 11–21 Mar; My Cozy Plant: 15 Mar (50%) | Garden Ninja: late Apr–mid May zone | ~6–8 weeks | [V S70, S24; S S72] |
| Glasgow | Airtasker: 1–10 Apr | Garden Ninja: most of Scotland into late May | ~7 weeks | [V S70; S S72] |
| Canberra | Fryd: last frost mid-Sep | Airtasker: early Oct; folklore: Melbourne Cup (early Nov) | ~7 weeks | [V S26, S71; S S101] |
| Christchurch | Fryd: last frost mid-Aug | ~5.6 ground-frost days in Oct; tomatoes late Oct–early Nov | ~10 weeks | [V S27; S S53; V S77] |
| Ballarat | Lawn.com.au: late Sep/early Oct | Melbourne Cup tradition | ~1 month | [S S75; V S74] |
| Cornish Flat, NH | May 15 | June 11–20 | ~4–5 weeks | [V S62] |
| Michigan (author's area) | Farmer's Almanac: May 7 | MSU Extension: May 28 | 3 weeks | [V S63] |
| Minneapolis | Home for the Harvest: Apr 30 | chartlocal SEO page: ~May 15 | 2 weeks | [S S38, S92] |

Causes, as far as the sources say:

- different definitions: average, 30%, 10%, or latest ever [V S01, S22, S54];
- air frost versus ground frost [V S40];
- city stations versus gardens [V S70 note on urban areas];
- zone-derived guesses rather than local data [V S26, S27].

**2.3 The odds are confusing.** Popular guides use "90%" in opposite senses. HGTV applies it to a date when frost is still likely, while Epic Gardening and Gardening Know How apply it to a date when frost is mostly over [S S84, S85, S06]. Tools sit at 30% (the Almanac), 50% (most averages), or roughly 14% (GardenFocused's six in seven) [V S01, S22]. A median plus a 9-in-10 date, explained in plain words as Frost Dates does, addresses this [repo].

**2.4 Planning backwards.** Calculators assume you already know your date (Johnny's) [V S18]. Seedtime's own help told overseas users to look dates up elsewhere (Dave's Garden, PlantMaps), pick a nearby station and use a 30% probability. Where hard-frost averages can't be found, it suggested setting them 4–6 weeks inside the regular dates [V S16, June 2025]. Its 2026 landing page now says it fetches local frost dates automatically [V S15].

**2.5 Late frosts and false springs.**

- A Michigan blogger lost tomatoes to an early planting during a false spring [V S63].
- A UK May frost cost neighbours their beans and potatoes [S S69].
- Canberra's record October cold [S S80].
- The Met Office says May frosts are usually short-lived and localised, but they do happen [V S40].
- The usual answer is protection (fleece, row covers) plus watching the forecast [V S64, S76].

**2.6 "No tools outside the US."** This is real for Australia, NZ, South Africa and non-English Europe at town level [SERP]. It is no longer true for the UK [V S20–S24] or Ireland [S S09]. Partial worldwide answers exist (WeatherSpark, PlantMaps, GrowVeg) [V S10, S11, S13; S S08].

---

## 3. Competitors

| Tool | Coverage | Method / data | Price / model | Adoption signals | Tags |
|---|---|---|---|---|---|
| Old Farmer's Almanac frost calculator | US + Canada (ZIP/postal code) | Nearest station, 30% probability, 32 °F; NOAA normals per snippet. 2026 map adds the Almanac's long-range forecast to historical averages | Free; sells print almanac, store, newsletter, "Advertise with Us" | Dominates ZIP queries (7+ state pages in one result list) | [V S01, S03, S04; S S02; SERP] |
| garden.org (National Gardening Association) | US; Ontario and Israel lookups return not found | NOAA NCEI stations; freeze probabilities by ZIP/city | Free (site blocked automated reading) | Recommended by Epic Gardening | [S S05; V S06] |
| Dave's Garden frost lookup | US | Station-based, user picks station (per Seedtime help) | Unknown | Recommended by Seedtime help | [V S16; blocked] |
| PlantMaps | Most US states and Canadian provinces; claims Europe and Asia; Ireland confirmed; southern hemisphere not confirmed | Average dates in 10-day windows by town; US pages use NOAA 1991–2020 (per a reseller's credit) | Free (ads unknown) | Hub "Updated September 2026" | [S S08, S09, S39] |
| WeatherSpark | Cities worldwide incl. southern hemisphere (Melbourne checked) | "Growing season" = longest run ≥ 32 °F; daily probability of being frost-free. Temperatures from nearby stations (distance-weighted) adjusted with MERRA-2; data 1980–2016. Page notes MERRA-2's 50 km grid misses microclimates | Free pages; login or premium for detailed reports (price not seen) | Not measured | [V S10, S11, S12] |
| GrowVeg Garden Planner | "All major regions globally"; manual entry elsewhere | 5,000+ weather stations; calendar, reminders | $35/yr auto-renew; $50 1-yr; $85 2-yr (currency not stated); 7-day trial | 869,812 gardeners made plans; 4.0M visitors/yr; since 2007 | [V S13, S14] |
| Seedtime | Claims anywhere in the world; users in 30+ countries | Pulls frost dates automatically (source unnamed); June 2025 help said to look them up yourself | Free tier; $7 or $14/mo billed yearly | 571,000+ gardeners; 2,160+ five-star Trustpilot reviews | [V S15, S16] |
| Planter | "Available everywhere" (frost source not stated) | Calendar of seed start, transplant, harvest | Free; Premium $24.99/yr; Lifetime $99.99 | Not stated | [V S17] |
| Johnny's seed-starting calculator | Any (user enters date) | Weeks before or after the frost-free date | Free (marketing) | Many AI-spun copies on other sites suggest search popularity | [V S18; SERP] |
| Grow Organic seed planting calculator | Any (user enters date) | Frost-date driven | Free (marketing) | Ranks first for "seed starting calculator" | [S S19; SERP] |
| Precip per-ZIP pages | US | "Long-term climate normals"; median last frost | Free; funnels to Precip app | Programmatic pages | [V S30] |
| MRCC freeze-date tool | Counties in 25 Midwest/Northeast states | 1950–2021; any threshold incl. below 28 °F; by decade | Free (public) | Promoted by Purdue Extension | [V S31] |
| lastfrostdate.co.uk | UK | Met Office HadUK-Grid, 1 km, 1960–2023 (toggle: last 30 yrs); air < 2 °C, light < 0 °C, hard < −2 °C; average dates only | Free; no ads seen | Ranks for UK queries | [V S20, S21; SERP] |
| GardenFocused | England, Scotland, Wales, Ireland, France and others, by town | Dates "correct" 6 years in 7; source unnamed | Free (content site) | Since 2010 | [V S22] |
| JustGardenCentres calculator | UK towns | Predicted last frost; source unnamed; sets site-wide calendar | Free | © 2025–2026 | [V S23] |
| My Cozy Plant | UK (app also US, Canada) | 8 UK regions, 50% and 10% dates; app does postcode frost alerts | App Pro £2.99/mo or £19.99/yr | App: 6 ratings | [V S24, S25] |
| Fryd | City guides for AU, NZ, ZA and more; DE/UK/INT versions | Frost dates tied to hardiness zone ("Zone 9b"), no local data stated | Free planner; "Super Fryd" upsell | Ranks for Canberra, Christchurch and Johannesburg queries | [V S26, S27; S S28; SERP] |
| Gardenate | AU, NZ, ZA, UK, US, Canada | Climate zone + month; no frost dates | Free site; app (price not shown) | Since 2007; app 4.7 stars | [V S29] |
| Airtasker frost-date guides | UK and AU city tables | "Historical averages"; no method given; some odd values | Content marketing | Ranks for UK and AU frost queries | [V S70, S71; SERP] |
| rechner-portal.de | Germany by Bundesland | State-level frost approximation | Ads | Ranks for German sowing calculator queries | [V S32; SERP] |
| Frost alert apps (Frost Alert, Frost Watch, FrostGuard, My Cozy Plant) | Mostly US/UK | Forecast-based nightly risk | Free to ~£3/mo | Mostly new (2025–2026), few ratings | [S S33, S34, S36; V S25] |
| National met services | See 1.10 | Station or grid statistics, rarely dates | Free | Most trusted | [V S40, S41, S45; S S44] |

Notes:

- **Closest functional match.** No free tool found offers all of Frost Dates' combination [U, after searches in 5]:
  - any coordinate worldwide;
  - choice of threshold;
  - median plus 9-in-10 dates;
  - the last 30 seasons;
  - a planting calendar.
- **WeatherSpark comes closest for worldwide coverage**, but:
  - it works by city page only;
  - it has a single 32 °F threshold;
  - its data stops in 2016;
  - it isn't framed for gardeners [V S10, S11].
- **For the UK, lastfrostdate.co.uk is probably better local data:** a 1 km grid built from stations, versus 10 km reanalysis. It lacks odds and an autumn date [V S21; U].
- **No Open-Meteo-based worldwide frost-date tool turned up** [SERP].

---

## 4. Counter-evidence

### 4.1 Worldwide tools already exist

- They exist, but they are partial: WeatherSpark (worldwide cities, 32 °F, 1980–2016) [V S10, S11]; PlantMaps (claims Europe and Asia; Ireland confirmed) [S S08, S09]; GrowVeg (paid; 5,000+ stations) [V S13]; Fryd (zone-derived city frost dates) [V S26, S27]; Seedtime (claims worldwide automatic dates) [V S15].
- Fryd and Airtasker give confident but dubious southern-hemisphere numbers, such as Christchurch's last frost in mid-August or Tasmania's in late December [V S27, S71]. That suggests a quality gap rather than an availability gap [U].

### 4.2 Forecasts and weather apps handle the actual decision

- Extension and forum voices call soil temperature a sturdier guide than dates [S S81]. They say forecasts beat average frost dates [S S82], and they weigh the frost date, soil temperature and the forecast together [V S62].
- Purdue's specialist uses history for planning and current conditions for daily decisions [V S31].
- When a hobbyist pitched a frost-forecast app, a respondent said US users already get National Weather Service frost warnings days ahead. No testers replied [V S35, 2019].
- Many forecast-based frost apps launched in 2025–2026. Builders are going after the nightly decision, not the climatology [S S33, S34, S36; V S25].
- Counterpoint: a forecast covers about 10 days, so it can't plan seed-starting 6–8 weeks ahead. That is the job frost dates do [U; V S18].

### 4.3 Local communities and folk rules

- Folk rules give a single, memorable, culturally shared date. Each was described as rooted in average frost timing:
  - the Eisheiligen, endorsed as a good rule of thumb by the DWD-based article [V S54];
  - Labour Weekend [V S76];
  - Melbourne Cup Day, with Anzac Day for the first frost [S S101; V S73, S74];
  - UK half-term [S S69].
- Gardeners lean on neighbours and nurseries [V S62, S77].
- A tool's figure has to beat or confirm the folk rule to be trusted [U].

### 4.4 Reanalysis may be too coarse locally

- **Scale.** ERA5-Land runs at about 9 km (0.1° through CDS). It assimilates no observations itself; observations reach it only through the ERA5 forcing [V S56].
  - Open-Meteo says it statistically downscales with a 90 m elevation model, and the grid cell can be a few km from the requested point [V S55].
  - The ERA5-Land documentation mentions no urban tile [V S56].
- **Mixing models.** Open-Meteo advises using only ERA5 or only ERA5-Land for multi-decade climate work, to avoid jumps from model upgrades [V S55].
  - Frost Dates' record combines ERA5/ERA5-Land with ECMWF's IFS forecast model, which Open-Meteo has from 2017 [repo; V S55].
  - Whether that creates a step in frost counts around 2017 is untested [U].
- **Published evaluations** [K4–K11, scholarly, not resolved via LibKey; snippets only]:
  - The sign of the error varies by site. Elevation mismatch between station and grid dominates in mountains [K5].
  - Some national evaluations find minima colder than stations, with mean absolute errors around 2.3–2.6 °C [K7]. Others report too-narrow daily ranges at about 80% of global stations, which could undercount frost [K4].
  - Urban heat islands are missing from ERA5 [K6]. ERA5-Land reads about 0.9 °C low against a dense city network, and matches worse in cities [cited in K5].
  - Valley cold pools defeat models generally [K8], and complex terrain worsens errors [K11].
  - One mountain study rated ERA5-Land's frost-day index favourably [K5].
- **Frost Dates' own check** agrees with the city problem: downtown Portland came out 19 days later in spring than NOAA [repo].
- **Ground versus air.** Garden damage often comes from ground frost, which is more common than air frost in May [V S40]. German newspaper tables use ground-frost dates [V S54]. Any 2 m air-temperature product will look optimistic against gardeners' experience in still, clear conditions [U].

### 4.5 The need comes too seldom

- Last-frost planning happens in late winter and spring, and first-frost checks in late summer and autumn. A lookup needs repeating only after moving house or changing threshold [U].
- No usage-frequency data was found [Gaps].
- Paid products bundle frost dates inside planners or nightly alerts rather than selling them alone [V S13, S15, S17, S25].

### 4.6 Large publishers capture search

- US: almanac.com (ZIP and state pages), the Farmers' Almanac, HGTV, Gardening Know How, Epic Gardening and seed-company content, plus SEO spam [SERP].
- UK and AU: Airtasker content pages; Germany: a Stuttgarter Zeitung SEO cluster with 10+ near-identical URLs [SERP].
- The opening, if any, is long-tail place queries in AU, NZ and DE, which needs per-place pages Frost Dates lacks [repo; U].

### 4.7 In mild climates, warmth decides planting, not the last frost

- WeatherSpark gives London a frost-free season of about 297 days, starting around 22 February and rarely after 27 March [V S10]. Yet the RHS plants tomatoes out in early summer, at more than 16 °C [V S43], and UK growers plant out in late May or June [S S66, S67, S69].
- NZ aims for soil at about 18 °C [V S76]. Melbourne doesn't get freezing temperatures every winter [V S11], yet tomatoes wait for Melbourne Cup Day [V S74].
- Frost Dates plants tomatoes out 1–2 weeks after the last frost [repo]. If its London last frost lands in March, the calendar would suggest late March or April, months before UK guidance [U; to test].
- This is a product risk for any UK, Irish, NZ-coastal or Melbourne beachhead.

---

## 5. Search demand (who ranks; no volumes)

| Query (as searched) | Who ranked | Tool like ours? | Winnable by a small free tool? |
|---|---|---|---|
| last frost date | Home for the Harvest, Gardening Know How, HGTV, Epic Gardening, UW hort library, Elm Dirt, UBC forum, two SEO-spam pages | No | No: big publishers [SERP] |
| frost dates by zip code | almanac.com (calculator + many state pages), a spam-like "library" page | No | No: Almanac owns it [SERP] |
| first frost date | Farmers' Almanac 2026, Axios, Family Handyman, Fast Growing Trees, K-State, Cornell NRCC, American Meadows, Audacy | No | No [SERP] |
| seed starting calculator | Grow Organic; several AI-spun copies about Johnny's calculator | No (calculators need your date) | Unlikely; seed companies plus spam [SERP] |
| frost dates UK (by region) | Garden Ninja, Airtasker UK, lastfrostdate.co.uk, RBGE blog, GardenFocused, My Cozy Plant, JustGardenCentres | Yes: several UK tools | Hard: UK tools with Met Office data already rank [SERP] |
| last frost date London | Almanac (London, Ontario), garden.org (New London, CT), Airtasker UK, lastfrostdate.co.uk, Home for the Harvest, calendar-uk, My Cozy Plant | UK tools | Hard; the place name is ambiguous in this US index [SERP] |
| frost dates Australia | Airtasker AU, two CSIRO/BioOne papers, University of Melbourne and UOW records, BoM potential-frost map, garden.org (Melbourne, Florida), ABS Year Books | No | Possibly: no tool ranks, but demand is unknown [SERP] |
| last frost date Canberra (+ tomatoes) | Fryd Canberra, Region Media, Canberra Times, HortiDaily, CityNews, Airtasker AU, Elders/Weatherzone | No (Fryd's zone guess) | Possibly, with a Canberra page [SERP] |
| frost dates New Zealand (Christchurch, Hamilton) | Figure.nz charts, Papers Past, RNZ, weatherforum.nz, Fryd Christchurch | No | Possibly; small market [SERP] |
| letzter Frost München / Eisheiligen DWD (German) | Stuttgarter Zeitung (6+ variants), Munich statistics PDFs, Ventusky, DWD alert text | No | Only with German UI and per-city pages [SERP] |
| letzter Frost Postleitzahl … (German) | Stuttgarter Zeitung (10 variants), rechner-portal, toom, Plantura, t-online, Öko-Test | No (Bundesland-level calculator) | As above [SERP] |
| frost date calculator worldwide | Almanac, a dead Swedish-hosted page, Harvest to Table, Gardenary (US ZIP), Home for the Harvest, Seedtime help, Epic Gardening | No worldwide tool | Maybe: a generic "any country" query, but its volume is unknown [SERP] |
| last frost date Ireland | PlantMaps Ireland (last and first frost maps), Met Éireann 1975 memo, GardenFocused | PlantMaps maps | Hard-ish [SERP] |

Takeaways:

- US and UK queries are taken.
- AU, NZ and DE place queries show no dedicated tool. That is the only plausible search opening, and it needs:
  - static per-place pages, which a static site can pre-build;
  - for Germany, a German interface.

  Frost Dates has neither [repo; U].
- The research tool is US-only. A UK-, AU- or DE-localised Google may rank differently. For example, BoM, RHS or local councils may rank higher locally [U].

---

## 6. Narrowest plausible beachhead: evidence by candidate

| Candidate | Frequency of need | Reachability | Competition / substitutes | Trust barriers | Fit |
|---|---|---|---|---|---|
| **Cool-climate Australian home gardeners** (ACT/Canberra, southern tablelands, Ballarat and the Victorian highlands, Tasmania) | Frost shapes spring planting; late frosts into November [V S73; S S80]. Season lengthening [K2] | Local media columns [V S73], community gardens and clubs [U: names not verified], ABC Gardening Australia [U] | No lookup tool; folklore; Fryd and Airtasker give conflicting numbers [V S26, S71] | BoM is the authority; strong folklore; valleys and frost hollows vs a 10 km grid [U] | Best fit found |
| **Inland and southern NZ gardeners** (Canterbury, Otago, Southland, Waikato frost pockets) | Ground frost common in Oct–Nov in Christchurch [S S53]; Labour Weekend early for the south [V S77] | Yates NZ community content [V S76], nurseries [V S77], weatherforum.nz frost threads [SERP] | No lookup; NIWA data not packaged [S S50, S51] | NIWA trusted; small population [U] | Good sibling to AU |
| **UK and Ireland allotment holders** | Real but often warmth-bound, not frost-bound [V S43] | High: NAS ~130,000 members [S S95]; ~109,000 on council waiting lists in 2025 [S S96]; busy forums [SERP] | Crowded: lastfrostdate.co.uk (1 km Met Office), GardenFocused, JustGardenCentres, My Cozy Plant, PlantMaps Ireland | Met Office and RHS authority; our grid is coarser than a free rival | Weak |
| **German, Austrian and Swiss gardeners** | Eisheiligen covers most needs [V S54] | Large Kleingarten networks [U: numbers not gathered] | Folk rule; news tables; Bundesland calculator [V S32] | Language (English-only UI and geocoding) [repo]; ground- vs air-frost mismatch | Weak without localisation |
| **US gardeners poorly served by ZIP tools** (mountain, rural, large ZIPs) | Strong pain [V S60, S61, S62] | Huge but noisy | Almanac, garden.org, PlantMaps, regional climate centres, extension | Grid errors are largest exactly in mountains [K5, K8] | Mixed: pain is real, but data advantage unproven |
| **Seed-starters anywhere** | Once a year, ahead of the season | Broad | Planners do lookup plus calendar (GrowVeg, Seedtime, Planter) [V S13, S15, S17] | n/a | Feature, not a product |
| **Market gardeners** | High, but need sub-28 °F thresholds and daily forecasts [V S31] | Grower networks [U] | MRCC tool (US), forecasts | High stakes | Poor fit for current thresholds |

---

## 7. Monetization norms (research only)

- **Free frost information as a lead magnet.**
  - The Almanac sells its print almanac and runs a store and advertising [V S01].
  - Airtasker uses gardening guides as content marketing for its task marketplace [V S70, S71; U on intent].
  - Precip's per-ZIP pages funnel to its app [V S30]. My Cozy Plant's UK frost page funnels to a £2.99/month app [V S24, S25]. Fryd's city guides funnel to its planner [V S26].
  - Elm Dirt's guide sells Plant Juice [V S65]. The German sowing calculator shows ads [V S32].
- **Seed companies' free calculators and charts as marketing:** Johnny's [V S18], Grow Organic [S S19], American Meadows [S S89], Park Seed [S S88] and Fast Growing Trees [S S94].
- **What people pay for:** planners and alerts.
  - GrowVeg: $35 a year auto-renewing, $50 for one year, $85 for two [V S14].
  - Seedtime: free tier, or $7 or $14 a month billed yearly [V S15].
  - Planter: $24.99 a year or $99.99 for life [V S17].
  - My Cozy Plant Pro: £2.99 a month or £19.99 a year, discounted to £15.99 [V S25].
  - WeatherSpark gates detailed reports behind an account or premium plan [V S12].
- **Implication for Labs (free, no accounts, no monetization):** frost dates are a commodity people expect free. Their value is as a trusted, explained number, not a business [U].

---

## Falsification summary

| Hypothesis | Verdict | Key evidence |
|---|---|---|
| H1. Worldwide frost-date lookup is underserved | **Weakened.** False for the UK and Ireland, partly false worldwide (WeatherSpark, PlantMaps, GrowVeg). True for AU, NZ, ZA and non-English Europe at town level, and true for the full combination: thresholds, median plus 9-in-10, recent 30 seasons, any coordinate | [V S10, S11, S13, S20–S24; S S08, S09; SERP] |
| H2. Gardeners plan around a last-frost date | **Supported in North America and continental climates; weakened elsewhere.** UK guidance uses months and warmth; NZ uses Labour Weekend and soil warmth; AU uses climate zones and Melbourne Cup; DE uses the Eisheiligen. Experts treat frost dates as a baseline beside soil temperature and forecasts | [V S43, S76, S29, S54, S62, S64] |
| H3. The need is searchable and winnable | **Unresolved, leaning no.** US and UK are taken. AU, NZ and DE show no tools, but volume is unknown and Frost Dates has no per-place URLs or German interface | [SERP; repo] |
| H4. 10 km reanalysis is trustworthy enough for gardens | **Mixed.** Within ~8 days of NOAA in 4 of 5 US cities. City, valley and ground-frost cases diverge. The literature shows ~2 °C-scale minimum-temperature errors in places and no urban physics. A UK rival has 1 km station-based data | [repo; K4–K8; V S21, S40, S55, S56] |
| H5. Frequency justifies a standalone service | **Likely falsified.** Twice-yearly decisions, a once-per-location lookup; incumbents bundle frost dates into planners or alerts, or give them away | [U; V S13, S15, S17, S25, S30] |
| H6. A planting calendar counted from the last frost transfers worldwide | **At risk.** In maritime climates frost ends months before warmth suits tender crops, so the calendar may advise planting too early | [V S10, S43, S76; repo; U] |

**Overall.** As a standalone service, the core claim looks falsified. Frost dates are partly available, low-frequency, often not the deciding factor, and captured in search wherever demand is visible. A narrower claim survives and is worth testing: a free, explained page for continental-climate gardeners outside North America, especially cool-climate Australia and inland New Zealand. Today those gardeners rely on folklore and on contradictory numbers that are often zone-derived. The page must show it agrees with local station records.

---

## Beachhead assessment

**Narrowest plausible beachhead:** home gardeners in cool-climate south-eastern Australia (Canberra/ACT, the southern tablelands, Ballarat and the Victorian highlands, Tasmania), with inland and southern New Zealand as a sibling.

Why this group:

- **Real, recurring frost risk at planting time.**
  - Light frosts are possible into November in the ACT [V S73]. Canberra has recorded October cold [S S80].
  - Mean last frosts in south-eastern Australia have moved later since the 1960s [K2]. Christchurch averages about 5.6 ground-frost days in October [S S53].
- **No official date and no lookup tool.** BoM publishes potential-frost-day maps, not dates [S S44]. The NZ data isn't packaged as a lookup [S S50, S51].
- **The current answers are folklore or contradictory.**
  - Canberra's figures span mid-September to early November, from Fryd, Airtasker and folklore [V S26, S71; S S101].
  - Christchurch runs from mid-August (Fryd) to late October in nursery advice [V S27, S77].
- **Frost Dates' design fits:**
  - southern-hemisphere seasons;
  - a cautious 9-in-10 date;
  - a light-frost 2 °C threshold, which matches the UK rival's "air frost" category [V S21];
  - recent 30 seasons, which matters while the baseline shifts [repo; K2].

Barriers and unknowns:

- **Trust.** BoM and NIWA are the authorities, and folk rules are entrenched. A 10 km grid may miss frost hollows in valley suburbs and towns [U]. Dates must be shown to match station records, for example Canberra Airport [Gaps].
- **Demand.** Search volume is unknown, and the market is small: Australian cool-climate regions plus NZ [U].
- **Reach.** Community gardens and organic-grower clubs, local columns (Region Media) and nurseries are plausible channels, but specific organisations and audience sizes were not verified [U].
- **Search.** Frost Dates would need pre-built per-place pages (Canberra, Ballarat, Hobart, Christchurch and so on) to show up for place queries [repo; U].

Ranked lower, and why:

- **UK and Ireland allotments:** reachable, but crowded with free tools on better local data, and warmth, not frost, decides tomato timing.
- **Germany:** the Eisheiligen is good enough for most people, and the page would need translation.
- **US mountain gardeners:** strong pain, but incumbents are strong, and reanalysis errors peak in mountains.
- **Seed-starters and market gardeners:** a feature for planners, or a need for colder thresholds and forecasts.

**Tests that would change this assessment** [U]:

1. Compare Frost Dates against BoM station records for Canberra, Ballarat and Hobart, and NIWA for Christchurch. If the cautious dates miss by more than about 2 weeks, the beachhead fails on trust.
2. Check Frost Dates' London, Dublin and Melbourne output. If the planting calendar puts tomatoes outdoors in March or April, add a warmth caveat or drop the calendar for mild climates.
3. Measure whether a southern-hemisphere visitor finds a figure that confirms or refines the local folk rule. The likely value is "Melbourne Cup is about right for you, but 1 in 10 years frost comes later".
4. Check for a step in frost counts around 2017, where the record changes source model [V S55].

---

## Gaps

- **Search volume:** no keyword volumes or Google Trends seasonality, and no localised (UK, AU, DE) result lists. The search tool is US-only.
- **Blocked sources:** garden.org, Dave's Garden, PlantMaps, BoM, the Marlborough council frost maps, growfruitandveg, the Kitchen Garden forum, Thompson & Morgan and data.govt.nz. Their details are snippets only.
- **Reddit:** not accessible; no Aussie forum threads on frost dates found. Southern-hemisphere pain comes mostly from columns, blogs and nursery pages.
- **PlantMaps coverage:** southern-hemisphere and continental-Europe country lists are unconfirmed. Only Ireland is confirmed, and only by snippet.
- **WeatherSpark:** price and city count not seen. Behaviour for frost-rare cities is checked only for Melbourne.
- **South Africa:** thin evidence; no SAWS frost statistics found.
- **Market gardeners outside the US:** no evidence gathered.
- **Seed-packet conventions outside the US:** UK, AU and DE packets are likely month- or zone-based, but this is unverified (T&M blocked; the Yates AU page returned 404).
- **Reach numbers:** Australian and NZ club sizes and German Kleingarten counts were not gathered. UK NAS figures are snippets and vary by document (125,000–132,000).
- **Accuracy:** no direct validation of ERA5 or Open-Meteo frost dates against stations outside the US. The scholarly evaluations were not read (no LibKey).
- **Users:** no interviews or usage data. Frequency and willingness to switch from folk rules are inferred.

---

## Sources

Read on 2026-10-11 unless noted. V = read on the page; S = search snippet only; SERP = result-list observation; K = scholarly, not resolved via LibKey.

**Competitors and tools**

- S01 V: https://www.almanac.com/gardening/frostdates (© 2026; "2026" calculator)
- S02 S: https://cdn.almanac.com/weather/frost-dates (and state pages, e.g. https://www.almanac.com/gardening/frostdates/NJ)
- S03 V: https://www.almanac.com/Frost-2026 (2026-09-08)
- S04 V: https://www.smallfarmcanada.ca/news/2026-last-frost-map-offers-better-planting-guidance/ (2026-03-11)
- S05 S: https://garden.org/apps/frost-dates/ (403); lookups https://garden.org/apps/frost-dates/?q=Ontario and https://garden.org/apps/frost-dates/?q=israel (snippet: not found)
- S06 V: https://www.epicgardening.com/last-frost-date/ (updated 2024-01-11)
- S07 blocked: https://davesgarden.com/guides/freeze-frost-dates/ (403)
- S08 S: https://www.plantmaps.com/climate-maps-and-data/frost ("Updated September 2026")
- S09 S: https://plantmaps.com/interactive-ireland-last-frost-date-map.php ; https://plantmaps.com/interactive-ireland-first-frost-date-map.php
- S10 V: https://weatherspark.com/y/45062/Average-Weather-in-London-United-Kingdom-Year-Round (data 1980–2016)
- S11 V: https://weatherspark.com/y/144227/Average-Weather-in-Melbourne-Victoria-Australia-Year-Round
- S12 V: https://weatherspark.com/premium
- S13 V: https://www.growveg.com/garden-planner-intro.aspx (© 2007–2025)
- S14 V: https://www.growveg.com/subscribeinfo.aspx
- S15 V: https://seedtime.us/
- S16 V: https://help.seedtime.us/en/articles/5643651-setting-your-frost-date (2025-06-12)
- S17 V: https://planter.garden/
- S18 V: https://www.johnnyseeds.com/growers-library/seed-planting-schedule-calculator.html
- S19 S: https://www.groworganic.com/blogs/articles/how-to-use-the-seed-starting-calculator
- S20 V: https://lastfrostdate.co.uk/
- S21 V: https://www.lastfrostdate.co.uk/map/
- S22 V: https://gardenfocused.co.uk/adjust-dates-uk (© 2010–2024)
- S23 V: https://www.justgardencentres.com/aagcal/index.php (© 2025–2026)
- S24 V: https://www.mycozyplant.com/uk-frost-date/ (updated for 2026)
- S25 V: https://apps.apple.com/gb/app/my-cozy-plant-uk-frost-alert/id6757018818
- S26 V: https://fryd.app/en/garden-guide/canberra
- S27 V: https://fryd.app/en/garden-guide/christchurch
- S28 S: https://fryd.app/en/garden-guide/johannesburg
- S29 V: https://www.gardenate.com/ (© 2007–2026)
- S30 V: https://www.precip.ai/last-frost-date/zipcode/52064
- S31 V: https://www.extension.purdue.edu/news/county/whitley/2022/10/freeze-date-tool-offers-historical-reference-to-growers.html (2022-10-21)
- S32 V: https://rechner-portal.de/garten-natur/obst-gemuese-anbauen/aussaat-kalender-rechner
- S33 S: https://mwm.ai/apps/frost-alert/6787781453 (v1.0, 2026-07-27)
- S34 S: https://mwm.ai/de/apps/frost-watch/6761346646
- S35 V: https://growingfruit.org/t/ive-built-a-frost-prediction-app-and-am-looking-for-testers-anyone-interested/21702 (2019-04)
- S36 S: https://marlvel.ai/api/llm/apps/weather/com-aidangibbons-frostguard (first released Oct 2025)
- S37 S: https://www.gardenary.com/frost-date-calculator
- S38 S: https://homefortheharvest.com/gardening-reference/last-frost-date/
- S39 S: https://www.izelplants.com/new-york-frost-maps (credits PlantMaps; NOAA 1991–2020)

**Official, met-service and data sources**

- S40 V: https://www.metoffice.gov.uk/blog/2026/why-frost-can-still-occur-in-late-spring (2026-05-11)
- S41 V: https://www.metoffice.gov.uk/research/climate/maps-and-data/location-specific-long-term-averages
- S42 S: https://www.metoffice.gov.uk/about-us/news-and-media/media-centre/weather-and-climate-news/2017/warmer-springs-but-easter-frost (2017)
- S43 V: https://www.rhs.org.uk/vegetables/tomatoes/grow-your-own
- S44 S: https://www.bom.gov.au/climate/maps/averages/frost/ (403 to automated reading; 1976–2005)
- S45 V: https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals
- S46 S: https://agriculture.canada.ca/atlas/climate-normals-interactive-maps (catalogue update 2026-04-17)
- S47 V: https://climatedata.ca/map-of-the-month-last-spring-frost/ (2025-03-27)
- S48 S: https://gov.mb.ca/agriculture/weather/agricultural-climate-of-mb.html ; https://residents.manitoba.ca/agriculture/weather/pubs/last-spring-frost-risk-25-percent.pdf
- S49 V: https://climate.weather.gc.ca/climate_normals/results_1981_2010_e.html?stnID=4333 (no frost values on the page)
- S50 S: https://www.marlborough.govt.nz/repository/libraries/id:2ifzri1o01cxbymxkvwz/hierarchy/documents/environment/climate/frost-maps-area-4-list/area4_LF80_sm.pdf (403 on the parent page)
- S51 S: https://catalogue.data.govt.nz/dataset/frost-days-state1972-2022 (bot check)
- S52 S: https://figure.nz/chart/Hra3vx0XfcsJEf5H
- S53 S: https://figure.nz/chart/xhIApPqblK6MAEwe-YNVUfb2NYfuxLwbn
- S54 V: https://www.stuttgarter-zeitung.de/wissen/wann-kommt-der-letzte-frost-2026-prognose-aktuell-mhsd-78826904.html (2026-04-29)
- S55 V: https://open-meteo.com/en/docs/historical-weather-api
- S56 V: https://confluence.ecmwf.int/display/CKB/ERA5-Land%3A+data+documentation
- S57 S: https://edepositireland.ie/handle/2262/71183 (1975 memorandum)

**Pain, forums, blogs and folk rules**

- S60 V: https://blog.smartgardener.com/?p=3676 (2019-04-04)
- S61 V: https://www.gardenstew.com/posts/224971 (2012-02)
- S62 V: https://www.chestertelegraph.org/?p=218282 (2021-04-04)
- S63 V: https://thesuburbfarm.substack.com/p/last-frost-date (2023-05-25)
- S64 V: https://buncombe.ces.ncsu.edu/2025/03/last-frost-in-the-garden (2025-03-24)
- S65 V: https://www.elmdirt.com/blogs/news/last-frost-date-guide (2026-02-07, updated 2026-03-03)
- S66 S: https://forum.kitchengarden.co.uk/viewtopic.php?p=90609 (403)
- S67 S: https://growfruitandveg.co.uk/grapevine/forum/on-the-plot/vegging-out/2556073-your-spring-frost-date (403)
- S68 S: https://www.growfruitandveg.co.uk/grapevine/allotment-advice/first-last-frost-dates-uk-france-spain-slovakia-etc_84153.html (403)
- S69 S: https://www.mumsnet.com/talk/gardening/5313320-too-early
- S70 V: https://www.airtasker.com/uk/guides/first-last-frost-dates/ (updated 2025-07-29)
- S71 V: https://www.airtasker.com/au/guides/first-last-frost-dates/ (updated 2025-03-06)
- S72 S: https://www.gardenninja.co.uk/?p=27561
- S73 V: https://region.com.au/?p=327609 (2019-10-06)
- S74 V: https://urbanfoodgarden.org/2022/09/12/ballarat-district-frost-sensitive-vegetable-planting-risk-guide/ (2022-09-12)
- S75 S: https://lawn.com.au/?p=16558
- S76 V: https://www.yates.co.nz/spring-vegie-growing-challenge/this-year/2021/friday-top-tips-planting-out-day (2021-10-22)
- S77 V: https://awapuni.co.nz/tomatoplantingseasonnz (undated)
- S78 S: https://www.livingseeds.co.za/highveld-storm.html
- S79 S: https://lawnbyseason.com/za/gauteng/johannesburg
- S80 S: https://www.hortidaily.com/article/6004277/australia-early-canberra-tomato-growers-battle-morning-frost/
- S81 S: https://ask2.extension.org/kb/faq.php?id=245213 (page did not resolve)
- S82 S: https://garden.org/thread/go/69753/ (2017 forum post)
- S83 S: https://depts.washington.edu/hortlib/pal/last-frost-dates
- S84 S: https://hgtv.com/outdoors/gardens/planting-and-maintenance/what-you-should-know-about-last-frost-dates
- S85 S: https://gardeningknowhow.com/garden-how-to/info/how-to-determine-last-frost-date.htm
- S86 S: https://forums.botanicalgarden.ubc.ca/threads/curious-how-do-they-know-when-the-last-frost-will-be.12447/
- S87 S: https://www.foodbusinessmea.com/south-africa-braces-for-unusual-september-weather-with-regular-cold-fronts-frost-and-fires/
- S88 S: https://www.parkseed.com/blogs/park-seed-blog/when-to-start-seeds-indoors
- S89 S: https://www.americanmeadows.com/first-frost-date-chart
- S90 S: https://www.farmersalmanac.com/first-frost-dates-2026
- S91 S: https://library.peoplespharmacy.com/frost-zones-zip-code
- S92 S: https://seo-service.chartlocal.com/?p=14877
- S93 S: https://www.portal-consultores.aegro.com.br/?p=21177 (example of AI-spun copies about Johnny's calculator)
- S94 S: https://fast-growing-trees.com/pages/first-and-last-frost-dates-by-zone

**Reach (UK allotments)**

- S95 S: https://thenas.org.uk/uploads/Members%20Area%20Leaflets/NAS%20Media%20Information%202025.pdf (~130,000 members)
- S96 S: https://www.dino.co.uk/uks-growing-allotment-waiting-lists/ (108,958 waiting; May 2025)
- S97 S: https://apse.org.uk/index.cfm/apse/members-area/briefings/2025/25-21-apse-state-of-the-market-on-allotments/
- S98 S: https://www.yorkshireeveningpost.co.uk/your-world/national-allotment-society-launches-first-nationwide-audit-of-uk-plots-in-30-years-8505228 (May 2026; 132,000+ members; 1996 survey 296,923 plots)

**Other**

- S99 S: https://www.calendar-uk.co.uk/frequently-asked-questions/when-was-the-last-frost-in-the-uk
- S100 S: https://stories.rbge.org.uk/archives/tag/harden-off
- S101 S: https://www.canberratimes.com.au/story/6150947/gurus-green-thumb/
- S102 S: https://iceds.anu.edu.au/news-events/news/climate-change-affecting-vegetable-crops-canberra-region-backyard-gardeners-farmers (2019; page returned 404 when fetched)
- S103 S: https://www.abs.gov.au/Ausstats/abs@.nsf/94713ad445ff1425ca25682000192af2/A8CFB8D3A9AF859ECA256CAD00818DAA (Year Book Australia 2003)

**Scholarly (not resolved via LibKey; seen in search results only)**

- K1: Crimp et al. (2016), Crop and Pasture Science 67(8), southern Australian frost changes. https://doi.org/10.1071/CP16056
- K2: Recent seasonal and long-term changes in southern Australian frost occurrence. University of Wollongong record: https://ro.uow.edu.au/eispapers/6043
- K3: Dittus et al. (2014), unexpected frost-day increases in southern Australia. https://findanexpert.unimelb.edu.au/scholarlywork/998995-an-investigation-of-some-unexpected-frost-day-increases-in-southern-australia
- K4: WeatherReal benchmark (preprint). https://arxiv.org/pdf/2409.09371
- K5: ERA5-Land temperature extremes vs Qilian Mountains stations, Frontiers in Ecology and Evolution (2023). https://www.frontiersin.org/articles/10.3389/fevo.2023.1135895/full
- K6: Paris urban heat island in ERA5 and SURFEX-TEB, GMD 15, 5949 (2022). https://gmd.copernicus.org/articles/15/5949/2022/
- K7: ERA5-Land vs 143 Iranian stations (1991–2020). https://jesphys.ut.ac.ir/article_100091_1feaefceb79ad6752934bd846391f11d.pdf
- K8: DOE ASR research highlight on model temperature errors in mountains (SAIL). https://asr.science.energy.gov/science/highlights/1234 (fetch failed)
- K9: Muñoz-Sabater et al. (2021), ERA5-Land, ESSD 13, 4349. https://essd.copernicus.org/articles/13/4349/2021/
- K10: ERA5-Land frost days and frost-free periods in China, Remote Sensing 14(10), 2400 (2022). https://www.mdpi.com/2072-4292/14/10/2400/html
- K11: EGU26-15265 abstract (complex terrain and reanalysis temperature errors). https://meetingorganizer.copernicus.org/EGU26/EGU26-15265.html
- Not read (login redirect): https://link.springer.com/article/10.1007/s00704-026-06338-0
