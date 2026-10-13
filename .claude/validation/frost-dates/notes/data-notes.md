# Frost Dates: data sources, Open-Meteo terms, and sustainability

> **Since these notes were written:** the maintenance pass (2026-10-11, commit 291fac5) added an "Estimates, not guarantees" caveat, a planting calendar that waits for warm nights for tender crops, soil-temperature and local-advice wording, and GeoNames credits. P4 (commit 6da220a) added that what's typed in the place search is sent to Open-Meteo. Statements below about the page describe it before those changes.

Research notes for the Frost Dates (#017) winner-validation study, prepared 2026-10-11.
Research only: nothing was signed up for, no keys requested, no forms submitted, nobody contacted, no datasets downloaded. Pages and public source files were read. **Not legal advice.**

Evidence labels used below:

- **VERIFIED**: read on the cited page, source file, or rendered page.
- **SNIPPET**: from a search-result summary only, not read on the page.
- **UNVERIFIED**: recollection or claim not confirmed this pass.
- **ESTIMATE**: my arithmetic, with the working shown.
- **INFERENCE**: my reading of the evidence.

Almost everything here is paraphrased. Wording on the source pages may differ.

---

## Key findings

1. **One lookup costs about 83 API calls, not "hundreds".** Open-Meteo weights each location as max(1, variables/10 × days/14). The page's request is one daily variable over 1995-01-01 to 2026-10-09 (11,605 days), so it costs 0.1 × 11,605/14 = **82.9 calls**. Exactly 30 years costs **78.3**. The earlier "hundreds" figure left out the variables/10 factor. The formula is VERIFIED in the server source and in the pricing-page calculator; the arithmetic is an ESTIMATE.
2. **Free-tier limits are enforced per IP address, not per app.** This is VERIFIED in the server code and in maintainer statements. However, the project README asks any *application* that goes over 10,000 requests a day to get in touch, and the terms' limit of "fewer than 10,000 calls a day" doesn't say per what. At 83 calls per lookup, an app-level reading is reached at about **120 lookups a day across all visitors**.
3. **Labs fits Open-Meteo's own example of non-commercial use**, a free site with no ads or subscriptions. **Ads are explicitly commercial.** **Donations aren't addressed** by Open-Meteo or by the Creative Commons NonCommercial guidance its terms point to.
4. **Paid plans, as displayed in USD on 2026-10-11:**
   - Standard: $29 a month for 1M calls, but **it doesn't include the historical (archive) API**.
   - Professional: $99 a month for 5M calls, including the historical API.
   - Professional 10M: from $185 a month per 10M calls.
   - Enterprise: by contact.

   A paid plan comes with an API key, and a key can't be kept secret in a static page.
5. **The underlying data is open and available in bulk without keys:**
   - Open-Meteo's own copy of ERA5-Land and ERA5 on AWS (CC BY 4.0).
   - NASA POWER (CC BY 4.0).
   - GHCN-Daily (CC0).

   Working out the frost climatology ahead of time and shipping it as static files would remove roughly 98–99% of per-visitor API calls, and most of the dependence on Open-Meteo.
6. **Data quality.** Official ECMWF documentation backs up the caveats the page already gives:
   - Grid values are area averages.
   - 2 m temperature errors grow in low-level inversions.
   - Land points near the coast can cool too fast at night.
   - Big cities come out too cold, because ERA5 has no urban scheme.
   - A fixed lapse-rate height correction can point the wrong way in winter inversions.

   Separately, Open-Meteo's default `best_match` model blends ECMWF IFS (from 2017) with ERA5 and ERA5-Land. Its own docs recommend using only ERA5 or ERA5-Land for work spanning decades.

---

## 0. What the page requests today

Code: `/Volumes/Projects/labs/src/experiments/frost-dates/index.tsx` (VERIFIED).

- **One archive request per place:** `archive-api.open-meteo.com/v1/archive` with `daily=temperature_2m_min`, `start_date=1995-01-01`, `end_date=today−2`, `timezone=auto`, and coordinates rounded to 0.01°. There's no `models` parameter, so the server's default `best_match` is used.
- **Caching:** records are kept in localStorage and fetched again after 3 days (`STALE_DAYS = 3`) or when the place changes. A returning visitor therefore costs another ~83 calls every 3+ days.
- **Place search:** calls the Open-Meteo geocoding API after a 300 ms pause in typing.
- **Attribution already on the page:**
  - Open-Meteo credited, with a link.
  - A link to CC BY 4.0.
  - ERA5, ERA5-Land, and IFS named.
  - A statement that the page contains modified Copernicus Climate Change Service information.
  - A note that the dates are worked out on the page, which indicates changes.

  GeoNames, the place database behind the search, is **not** credited (credited since commit 291fac5). That's a small gap. Labs has no LICENSE file, so the code is public but not formally open source.

---

## 1. Open-Meteo terms in detail

### 1.1 What "non-commercial" covers

From the "Non-Commercial Use" section of the terms (https://open-meteo.com/en/terms, VERIFIED):

- **Conditions for the free API:**
  - Fewer than 10,000 calls a day, 5,000 an hour, and 600 a minute.
  - Non-commercial purposes only.
  - Users accept CC BY 4.0.
  - Open-Meteo may block applications and IP addresses that misuse the service, without notice.
- **Definition:** non-commercial is defined by reference to Creative Commons' explanation, linked to the CC wiki page on NonCommercial interpretation.
- **Examples of non-commercial use:**
  - Private or non-profit websites or apps without subscriptions or advertising.
  - Personal home automation.
  - Public research at public institutions.
  - Educational content.
- **Examples of commercial use:**
  - Sites or apps with subscriptions, or that show ads.
  - Integration into commercial products or promotions.
  - Undisclosed research at commercial companies.
- **Not mentioned:** donations, open-source projects, or individuals as such. The README separately says the APIs are free for open-source developers and non-commercial use (VERIFIED, https://github.com/open-meteo/open-meteo).

The CC NonCommercial interpretation page (VERIFIED, https://wiki.creativecommons.org/wiki/NonCommercial_interpretation) says:

- NonCommercial depends on the *use*, not on who the user is.
- The test is whether the use is mainly aimed at commercial advantage or monetary compensation.
- The page doesn't say how donations, ads, or cost recovery are treated.

The pricing page's meta description says free non-commercial use comes with fair-usage guidelines and attribution (VERIFIED in the page source).

**INFERENCE:**

- Labs is free, run by an individual, and has no ads or subscriptions, so it's non-commercial by Open-Meteo's own example.
- A standalone version with ads is commercial.
- A passive donation link on a free site probably doesn't change its main purpose. If donations unlock features, or read as payment for access, the use leans towards "monetary compensation".
- This should be confirmed in writing with Open-Meteo. That's an action for the owner.

### 1.2 Are limits per IP address or per application?

| Source | What it says (paraphrased) | Label |
|---|---|---|
| Terms page | Fewer than 10,000 a day, 5,000 an hour, and 600 a minute. Doesn't say per IP or per app. May block "applications and IP addresses". | VERIFIED |
| Pricing table | Free tier also listed at 300,000 a month. | VERIFIED |
| README, Terms & Privacy section | Access isn't restricted, but fair use is asked for. Any application above 10,000 requests a day should contact them. | VERIFIED |
| `RateLimiter.swift` | Counts weighted calls per client IP: IPv4 by address, IPv6 hashed. Keeps only per-minute, per-hour, and per-day counters, with **no monthly counter**. Counters reset every minute, at the top of each hour, and at 00:00 UTC. | VERIFIED |
| `ApiKeyManager.swift` | A code comment says limits are per IP, except for Cloudflare Workers, which are limited per user. A single request can't weigh more than the hourly limit (5,000). A failed request still counts as 1 call. Concurrency per IP defaults to 1, with a hard cap of 5. | VERIFIED |
| Maintainer, issue #1129 (2024-11-29) | Limits are applied by IP address, so shared IPs (such as Cloudflare's) share a budget. Clearly non-commercial apps with no subscriptions or ads can email to ask for a free API key. | VERIFIED |
| Maintainer, issues #832 and #1726 (2026-02-19) | Cloudflare Workers are now limited per application, using the CF-Worker header. | VERIFIED |
| Maintainer, issues #1493 (2025-09-03) and #1650 (2026-01-02) | The free API handles one request at a time per IP. Extra requests queue, up to about 6, and beyond that get "too many concurrent requests". Each IP has its own queue. In place since March 2025. Archive requests can take a few seconds. | VERIFIED |
| Maintainer, issue #438 (2023-09-18) | Heavy calls are weighted. He has limited means to enforce fair use, and invites projects to ask for an API key. | VERIFIED |

**Reading:**

- **Enforcement** is per IP address, or per application for Cloudflare Workers. Each visitor's browser therefore has its own budget.
- **Policy** says the free tier is for use below 10,000 calls a day. The README treats 10,000 a day *per application* as the point at which to get in touch.
- The 300,000-a-month figure isn't enforced by the free rate limiter. This is an INFERENCE from the code; the pricing FAQ separately says monthly budgets aren't hard-enforced yet for paid plans.

### 1.3 How calls are counted, with the arithmetic

**Pricing FAQ** (VERIFIED, https://open-meteo.com/en/pricing):

- One HTTP request is normally one call.
- More than 10 variables, or more than 2 weeks for one location, counts as several calls.
- Counts are fractional: 2 weeks with 15 variables is 1.5 calls, and 4 weeks with the same variables is 3.0.

**Server code**, `calculateQueryWeight()` in `ForecastApiResult.swift` (VERIFIED):

- Weight per location = max(1, max(V/10, V/10 × D/14)), added up over all locations.
- V is the number of requested variables times the number of models. Ensemble members count separately.
- D is the number of days in the range.
- `ForecastapiController.swift` confirms that daily variables count the same as hourly ones.
- The pricing page's calculator script uses the same formula (VERIFIED).
- Time zone and output format don't affect the weight.

**History** (VERIFIED, issue #438): in September 2023 the formula changed from max(1, V/10) × max(1, D/7), which made 1940–2022 cost 4,264 calls, to the current form with a 14-day reference. The maintainer quoted about 213 calls for 1940–2022 under the new form.

**Arithmetic** (ESTIMATE; one daily variable, one model, one location):

| Request | Days | Weight (calls) |
|---|---|---|
| 14 days | 14 | 1 (the minimum) |
| 140 days | 140 | 1.0 |
| 180 days (a season so far) | 180 | 1.29 |
| 1 year | 365 | 2.61 |
| **30 years** (1996–2025) | 10,958 | 0.1 × 10,958 / 14 = **78.3** |
| **Frost Dates today** (1995-01-01 to 2026-10-09) | 11,605 | **82.9** |
| 1940–2022 | 30,316 | 216.5 (the maintainer quoted 213) |

Each extra variable or model adds the same amount again. For example, 2 variables over today's range would cost 165.8.

**What the free tier allows per IP** at 82.9 calls a lookup (ESTIMATE):

- 7 lookups a minute (600 / 82.9).
- 60 lookups an hour (5,000 / 82.9).
- 120 lookups a day (10,000 / 82.9), per UTC day.

**Under an app-level reading**, that becomes 120 lookups a day, or about 3,600 a month (300,000 / 82.9), for all visitors combined.

### 1.4 Attribution

- **Licence page** (VERIFIED, https://open-meteo.com/en/licence):
  - API data is CC BY 4.0.
  - Show a link next to the data, for example "Weather data by Open-Meteo.com" linking to open-meteo.com.
  - Researchers are asked to cite Zenodo DOI 10.5281/zenodo.7970649.
  - Sources carry their own licences: Copernicus C3S for the reanalyses, and GeoNames (CC BY 4.0) for place search.
- **README** (VERIFIED): give credit, link the licence, say whether changes were made, and put an attribution link next to the data.
- **Historical API docs** (VERIFIED): asks for citations of ERA5, ERA5-Land, and CERRA, and for the Copernicus acknowledgement ("Generated using Copernicus Climate Change Service information").
- **Climate Data Store (CDS):**
  - ERA5 and ERA5-Land are under the "CC-BY licence (rev. 1)", which points to CC BY 4.0 (VERIFIED).
  - The ERA5 documentation asks users to cite the CDS catalogue entry and to give clear, visible attribution to the Copernicus programme (VERIFIED).
- **Frost Dates already meets these** (see section 0). The one thing to add is a GeoNames credit for the place search.

### 1.5 Paid plans as displayed on 2026-10-11

The pricing page text no longer shows prices; an embedded Stripe pricing table renders them. These were read in a browser from a US location, in USD (VERIFIED from the rendered page).

| Plan | Monthly | Yearly | Calls a month | Historical (archive) API | Notes |
|---|---|---|---|---|---|
| Free / Open-Access | $0 | n/a | 10,000 a day, 5,000 an hour, 600 a minute; 300,000 a month in the table | Yes | Non-commercial only; no uptime guarantee |
| API Standard | $29 | $319 | 1M | **No** | Commercial licence; forecast, air quality, marine, flood, elevation, geocoding |
| API Professional | $99 | $1,099 | 5M | Yes | Adds climate, ensemble, historical forecast, previous runs, seasonal, single runs |
| API Professional (10 million calls) | From $185 per 10M | n/a | 10M × quantity | Yes | Priced per 10 million calls |
| API Enterprise | By contact | n/a | 50M+ | Yes | 3 keys, 3 support hours a month, SLA, priority support |

- **Code confirms the Standard exclusion:** the archive endpoint refuses keys whose monthly limit is under 5M, which rules out Standard (VERIFIED, `ApiKeyManager.swift`).
- **Paid plans also get:** reserved servers and a 99.9% uptime target. Monthly budgets aren't hard-enforced yet; email alerts go out at 80%, 90%, and 100% (VERIFIED).
- **Currency:** Stripe may show local prices. A 2024 user comment refers to a plan at 30 € a month (VERIFIED as a user statement, PR #854). EUR pricing for EU customers is UNVERIFIED.

### 1.6 Self-hosting Open-Meteo

**Licence.** The server is AGPLv3 or later, and the data is CC BY 4.0 (VERIFIED). **INFERENCE, not legal advice:** running it privately to produce static files doesn't trigger the AGPL's network clause for those files. Offering a modified server to the public would mean offering its source code.

**Data.** Open-Meteo publishes its database through AWS Open Data (VERIFIED):

- **Bucket:** `openmeteo` in us-west-2. No AWS account needed. CC BY 4.0. Updated hourly.
- **Historical datasets:**
  - `copernicus_era5`: 0.25°, from 1940.
  - `copernicus_era5_land`: 0.1°, from 1950.
  - `ecmwf_ifs`: 9 km, from 2017.
  - `copernicus_dem90`: a 90 m elevation model used for downscaling.
- **File layout:** historical data is stored as one file per variable per year.

**Volume.**

- The ERA5 tutorial says syncing ERA5-Land `temperature_2m` for 730 days is roughly 8 GB (VERIFIED). That's about 4 GB a year, so about **128 GB for 1995–2026** (ESTIMATE).
- The README notes that reading one location from a roughly 9 GiB ERA5-Land temperature file takes only about 16 KiB, thanks to small chunks (VERIFIED).

**Hardware**, from the getting-started guide (VERIFIED):

- A CPU with SIMD support such as AVX2 (x86-64 or Arm).
- 8 GB RAM at minimum; 16 GB recommended.
- A fast NVMe SSD, with at least 100 GB for small to medium setups.
- Runs in Docker or as an Ubuntu 22.04 package.
- Self-hosted instances are slower than the public API, and small deployments get no commercial support.

**Is it realistic?** (INFERENCE)

- **As an offline tool used once ahead of the build: yes.** A machine with about 150–200 GB free could run the same API locally with `models=era5_land` and query any number of points with no rate limits.
- **As a live service for visitors: no, not within Labs**, because it needs a server.

**Reading the data straight from the browser.** A TypeScript/WebAssembly reader for `.om` files exists (VERIFIED, https://github.com/open-meteo/typescript-omfiles). It lists HTTP and S3 as sources, but it's GPL-2.0 and marked as still under construction. Whether the bucket allows browser (CORS) requests wasn't checked; see the open items.

---

## 2. Is the Labs pattern within the terms? What changes for a standalone?

**Labs today**, where each visitor's browser calls the free API directly with no key:

- **Non-commercial:** yes. It's a free personal site with no ads or subscriptions, matching the terms' example (VERIFIED, plus INFERENCE).
- **Intended use:** the README says the API supports cross-origin (CORS) requests, so calling it straight from a browser is expected (VERIFIED).
- **Technical limits:** enforced per visitor IP, so each visitor gets about 120 lookups a day and 7 a minute. People sharing an IP pool their budget and the one-at-a-time queue: offices, schools, VPNs, and mobile networks that put many users behind one address. The page already shows "busy" when it gets HTTP 429 (INFERENCE from the code).
- **Policy limits** (INFERENCE):
  - Up to about 120 lookups a day across all visitors (about 10,000 weighted calls), the page fits even an app-level reading.
  - Above that, the README asks the app to get in touch. The terms don't forbid it, but don't clearly allow it either.
  - The maintainer's offer of a free non-commercial key doesn't help a static page: the key would be visible to everyone, and Labs forbids keys.
- **Attribution:** compliant. Adding a GeoNames credit would close the remaining gap.

**Standalone variants:**

| Variant | Status under Open-Meteo terms | What changes |
|---|---|---|
| Free, no ads, no donations | Non-commercial | Same as Labs. Contact Open-Meteo once usage regularly passes about 10,000 calls a day (about 120 lookups a day at today's weight). |
| Free, with a donation link | Not addressed | Probably still non-commercial if donations don't buy anything (INFERENCE). Ask Open-Meteo in writing. |
| Ads or subscriptions | Commercial, by explicit example | Needs a paid plan with archive access: Professional at $99 a month at least. Paid access uses the `customer-` endpoint with an API key. The key can't sit in client code, so this needs a server or proxy, or working everything out ahead of time with the key kept out of the browser; either breaks Labs' rules. GitHub Pages bans sites mainly for commercial transactions or commercial SaaS (VERIFIED); whether an ad-supported information site is allowed is a grey area (open item). |
| Any variant built from bulk open data instead of the API | Open-Meteo's service terms don't apply; the data is CC BY 4.0 | Attribution only, with no non-commercial restriction (INFERENCE, not legal advice). |

**A subtle point** (INFERENCE): the non-commercial restriction applies to using the free *service*, while the *data* is CC BY 4.0, which allows commercial reuse. Building a commercial product from data gathered through the free API is murky. Taking the same data from the AWS bucket, or from a paid plan, avoids the question.

---

## 3. Alternative data sources

| Source | Licence | Cost and access | Coverage, resolution, history | Fit for frost statistics |
|---|---|---|---|---|
| **Open-Meteo API** (current) | CC BY 4.0 data (VERIFIED) | Free for non-commercial use, with per-IP limits; paid for commercial use. No key on the free tier; CORS supported. | Global. ERA5-Land 0.1° from 1950, ERA5 0.25° from 1940, IFS 9 km from 2017. About 5 days' delay. Downscaled to a 90 m elevation model (VERIFIED). | Good. The most convenient option: it does point extraction, downscaling, and time zones. |
| **Open-Meteo on AWS** (`openmeteo` bucket) | CC BY 4.0 (VERIFIED) | Free. S3 with no key or account. | The same ERA5, ERA5-Land, and IFS archives, hourly, in `.om` format. About 4 GB a year for ERA5-Land temperature (ESTIMATE). | **The best bulk source for working things out ahead of time.** Sponsored by AWS, with no warranty. |
| **NASA POWER** | CC BY 4.0 and no restrictions, per the AWS registry (VERIFIED); docs ask for citation and notice of reuse | Free. The API mentions no key. There's no fixed rate limit, but staff monitor usage, ask for no more than 5 concurrent requests, and may block repeated requests for the same grid cell. Zarr files on AWS need no key (VERIFIED). | Global, ½° × ⅝° (MERRA-2 and GEOS). Daily from 1981, near real time with about 2–3 days' delay. Daily minimum is the lowest of 24 hourly values, 2 m above the grid box's average height (VERIFIED). | Fair. Too coarse (about 50–60 km) for local frost in hills or on coasts. Good as a fallback and cross-check. |
| **ERA5 via the CDS** | CC BY 4.0, as the CDS "CC-BY licence (rev. 1)" (VERIFIED) | Free, but **needs an account and personal access token**, and each dataset's terms must be accepted (VERIFIED). A no-key copy exists: NSF NCAR on AWS, under UCAR terms, updated monthly with a 3–4 month lag (VERIFIED). | 0.25° (native about 31 km), 1940 to present, hourly, about 5 days' delay (VERIFIED). | Fair to good, but coarser than ERA5-Land. The token conflicts with Labs' rules. |
| **ERA5-Land via the CDS** | CC BY 4.0 (VERIFIED) | Account and token. A daily-statistics product computes the daily minimum on request for one chosen UTC offset, with a 6-day delay (VERIFIED). | 0.1° (native about 9 km), land only, 1950 to present. Temperature is adjusted for height (lapse rate) from ERA5 (VERIFIED). | **The best reanalysis for frost.** Get it without a key through Open-Meteo's AWS copy instead. |
| **NOAA NCEI GHCN-Daily** | CC0 on AWS, usable as desired; NOAA asks for attribution and no implied endorsement (VERIFIED); NCEI metadata gives citation and no-warranty terms | Free. Bulk HTTPS, the `noaa-ghcn-pds` AWS bucket with no key, and the NCEI Access Data Service, which mentions no token (VERIFIED). | Over 100,000 stations in 180 countries; over 25,000 with daily highs and lows; average record over 40 years. Denser in North America and Eurasia, sparse in Africa and South America. Not homogenized (VERIFIED). | Good wherever there's a station; matches NOAA's method. Nothing between stations. |
| **NOAA U.S. Climate Normals 1991–2020** | No licence stated on the page | Free bulk CSV (VERIFIED) | US stations (over 7,300 for temperature). Last-spring and first-autumn freeze dates and season lengths at 16, 20, 24, 28, 32, and 36 °F, at 10–90% probabilities (VERIFIED, normals readme). | The US reference the page was checked against. US only. |
| **Meteostat** | **CC BY 4.0**, per the current licence page, not CC BY-NC as the brief assumed (VERIFIED). Any earlier NC licence is UNVERIFIED. | Bulk Parquet and CSV need no key or sign-up. The JSON API goes through RapidAPI and needs a key, with a free tier of 500 requests a month (VERIFIED). | Station data gathered from national services and NOAA. By default it **mixes observations with model data** (you can opt out). Daily values come from 24 hourly points. Interface is in beta and unversioned (VERIFIED). | A convenient station source. Turn off model-filled data. |
| **UK Met Office** | Crown copyright pages. HadUK-Grid is under OGL v3 (SNIPPET, CEDA catalogue). | Climate averages are web pages only (VERIFIED). HadUK-Grid downloads need a **registered CEDA account** (SNIPPET). | 1991–2020 averages for official stations, including frost-day elements (VERIFIED). HadUK-Grid is 1 km and daily, with daily lows from 1931 per CEDA (SNIPPET) and ground-frost days (VERIFIED). | UK only. The account conflicts with Labs' rules. |
| **Australia BoM** | Frost maps are CC BY 4.0 (VERIFIED). Material without stated terms is for personal use only, and scraping is banned (VERIFIED). | Grid download for the frost maps (VERIFIED). Station data on Climate Data Online. | Average days with a low below 2, 0, −2, and −5 °C, over 1976–2005 (VERIFIED). | A good national cross-check, though the period is old. |
| **Environment and Climate Change Canada** | ECCC data licence allows commercial use with attribution (VERIFIED) | Bulk CSV of normals (VERIFIED). The GeoMet `climate-normals` collection covers 1981–2010 and mentions no key (VERIFIED). | Canadian Climate Normals for 1991–2020 and earlier. Frost-free statistics in the station normals are **UNVERIFIED** this pass. | Canada only. |
| **DWD** (Germany) | CC BY 4.0 for the Climate Data Center, status May 2024 (VERIFIED) | Open-data server with no key | Yearly frost-day grids for Germany from 1951, plus daily station data (VERIFIED). | Germany only. |
| **E-OBS** | **Non-commercial research and education only** (VERIFIED) | Free through the CDS or ECA&D | Europe, 0.1° and 0.25°, daily lows from 1950, updated about every 6 months (VERIFIED). | **Unsuitable for a public tool** because of the licence. |
| **CHIRTS-daily** | CC0 (VERIFIED) | Free over HTTPS or Google Earth Engine | 0.05°, 60°S–70°N, **1983–2016 only**. Daily low is the high minus ERA5's daily range; ERA5's cool bias is noted (VERIFIED). | Out of date, and not aimed at frost. |
| **Daymet** | Openly shared without restriction, per NASA guidance (VERIFIED) | No-key single-pixel web service (VERIFIED) | 1 km, North America plus Hawaii and Puerto Rico. Daily lows from 1980 to the last full calendar year (VERIFIED). | Excellent for North America. Runs only to the last full calendar year, so it has nothing for the current season (INFERENCE). |

---

## 4. Caching and working things out ahead of time

**What could be done ahead of time** (INFERENCE): everything the page shows except "this season so far".

- **Climatology**, for each threshold:
  - Typical and cautious dates for the last spring frost and the first autumn frost.
  - Length of the frost-free season.
  - Frost nights a year.
- **History for each season** (the chart and table), which is much larger.
- **The current season** would stay a short live request: up to 140 days costs 1 call, and 180 days costs 1.29 (ESTIMATE).

**Assumptions** (ESTIMATE):

- **Total grid points:**
  - ERA5 0.25°: 1440 × 721 = 1,038,240.
  - ERA5-Land 0.1°: 3600 × 1801 = 6,483,600.
  - NASA POWER ½° × ⅝°: 361 × 576 = 207,936.
- **Ice-free land** is taken as about 25–30% of points on a latitude-longitude grid. This is my assumption, not from a source: land is about 29% of the Earth's surface, these grids crowd points near the poles, and Antarctica and Greenland are left out.
- **Land points that gives:**
  - ERA5: about 260k–310k.
  - ERA5-Land: about 1.6M–1.9M.
  - POWER: about 52k–62k.

**Calls and time** (ESTIMATE; Open-Meteo at 78.3 calls per point for 30 years):

| Scenario | Open-Meteo calls | Free tier from one IP at 10k a day | Paid Open-Meteo | NASA POWER API | Bulk alternative |
|---|---|---|---|---|---|
| 10,000 places | 783,000 | At least 78 days. Over 2.5 times the 300k monthly figure. Arguably outside "fair use". | Fits in one month of Professional ($99) | Up to 10,000 requests, fewer where places share a cell | About 128 GB of ERA5-Land from the `openmeteo` bucket covers any number of points |
| 50,000 places | 3.9M | About 1.1 years | One month of Professional | Up to 50,000 | Same |
| Global 0.25° land (~260k–310k) | 20M–24M | 5.6–6.7 years | 3 of the "10M" units (from $185 each, tiers unconfirmed), or about 5 months of Professional | Not applicable (POWER is ½°) | ERA5 hourly 2 m temperature from NSF NCAR or Open-Meteo on AWS (size not checked) |
| Global 0.1° ERA5-Land land (~1.6M–1.9M) | 127M–152M | Not feasible (35–42 years) | Enterprise scale | Not applicable | The same ~128 GB of files |
| POWER grid, land only (~52k–62k) | n/a | n/a | n/a | 52k–62k requests. At 5 at a time, a matter of hours (response time isn't documented). | Or Zarr on AWS with no key. Daily lows over 30 years are about 9.1 GB uncompressed (207,936 × 10,958 × 4 bytes). |

Through the CDS daily-statistics route (with an account), 30 years of ERA5-Land daily lows would be about 284 GB uncompressed for all grid points, or about 85 GB for land only (6,483,600 × 10,958 × 4 bytes × 0.3). That's an ESTIMATE before compression. Each request takes one UTC offset, so it would have to be split by longitude band to keep local days (INFERENCE).

**Size of the shipped files** (ESTIMATE):

- **Climatology only:** about 24 values × 2 bytes ≈ 48 bytes a point, uncompressed.

  | Coverage | Size |
  |---|---|
  | 10,000 places | 0.5 MB |
  | 50,000 places | 2.4 MB |
  | POWER land | about 3 MB |
  | 0.25° land | 12–15 MB |
  | 0.1° land | **78–93 MB** |

- **With the per-season history the page shows today:** dates take 30 seasons × 3 thresholds × 2 dates × 2 bytes = 360 bytes, and nightly frost flags take 3 × 11,605 bits ≈ 4.4 KB. That's about 4.5–4.7 KB a point.

  | Coverage | Size |
  |---|---|
  | 10,000 places | about 45 MB |
  | 50,000 places | about 225 MB |
  | 0.25° land | 1.2–1.4 GB, **over GitHub Pages' 1 GB site limit** |
  | 0.1° land | 7–9 GB |

- **GitHub Pages limits** (VERIFIED):
  - Published site up to 1 GB.
  - Repository recommended under 1 GB.
  - Soft bandwidth limit of 100 GB a month.
  - Deployments time out after 10 minutes.
- **Bandwidth** (ESTIMATE): a 1° tile of 0.1° climatology is about 100 cells × 48 bytes ≈ 5 KB. At 100,000 lookups a month and 5–50 KB each, that's 0.5–5 GB a month.

**Hybrid design** (INFERENCE): ship the climatology as static files and fetch only the current season live. That costs 1–1.3 calls a lookup instead of 82.9, about **64–83 times fewer**. If the shipped data comes from a place list run through a local Open-Meteo server with `models=era5_land`, the numbers would match the live API, including its downscaling to the 90 m elevation model.

**Licence terms for sharing derived statistics:**

- **CC BY 4.0** (Open-Meteo API data, Copernicus ERA5 and ERA5-Land, NASA POWER per the AWS registry, Meteostat, DWD, and BoM's CC BY material): sharing is allowed, including commercially. Give credit, link the licence, say what changed, and don't imply endorsement (VERIFIED licence pages, plus INFERENCE).
  - A Copernicus credit is expected in any case.
  - Open-Meteo also asks for credit when its processed files are used.
- **CC0** (GHCN-Daily on AWS, CHIRTS): no conditions. NOAA asks for attribution and that changed data not be presented as NOAA's own (VERIFIED).
- **OGL v3** (HadUK-Grid) and **the ECCC licence**: attribution required; commercial use allowed.
- **E-OBS**: non-commercial research and education only. Don't use it in a public tool.
- **Service terms versus data licence:** the free API's non-commercial condition applies to the service. Building a commercial product by gathering data through the free API is murky; bulk open data avoids the question (INFERENCE).
- **AGPL** (the Open-Meteo server) and **GPL-2.0** (the TypeScript `.om` reader) apply only if that code is distributed, embedded, or served. Static data files are not the program (INFERENCE, not legal advice).
- **Labs rules:** the Labs constitution says not to add build infrastructure. An offline script that generates data may need an owner amendment, as the constitution's section 6 provides for.

---

## 5. Data quality: reanalysis versus stations

**Official documentation:**

- **What a grid value means** (ECMWF knowledge base, VERIFIED):
  - Grid values are averages over the grid box.
  - Detail smaller than the box isn't captured.
  - The effective resolution is coarser than the grid spacing.
- **ERA5** (VERIFIED, ERA5 data documentation): produced with IFS cycle CY41R2, with a native resolution of about 31 km (0.28125°) and a 0.25° grid on the CDS. Known issues that matter for frost:
  - **Great Lakes before 2014:** the yearly cycle of 2 m temperature is too strong, with winters too cold and summers too warm.
  - **Assimilation windows:** some places show a jump in near-surface temperature where one assimilation window ends and the next begins (09–10 and 21–22 UTC).
  - **Forecast temperatures:** ERA5's forecast low-level temperatures are too cold over most of the globe. The guidance is to build daily lows and highs from the hourly *analysed* 2 m temperature instead.
  - **Iberia, 1977–1979:** wrong snow data makes 2 m temperatures several degrees too cold, and ERA5-Land inherits this.
  - **Arctic sea ice:** the surface of the ice can be 5 K or more too warm in winter.
- **ERA5-Land** (VERIFIED: CDS page and ERA5-Land documentation):
  - About 9 km native resolution, 0.1° on the CDS, land only.
  - The temperature it receives from ERA5 is adjusted for the height difference (lapse-rate correction).
  - It inherits ERA5's uncertainty, and uncertainty grows further back in time.
  - There's a small discontinuity on 2020-01-01 in high mountains and at some coastal points.
- **ECMWF's operational forecast model (IFS), known issues** (VERIFIED). These apply to the IFS data that `best_match` blends in from 2017, and by analogy to ERA5's older model version:
  - **Inversions (T1):** 2 m temperature errors are much larger during low-level temperature inversions, which are common in winter at high latitudes.
  - **Coasts (T3):** land points near the coast can cool too fast at night. Errors sometimes exceed 10 °C and are worse with snow, at high latitudes, and on convex coastlines.
  - **Cities (T2):** the urban heat island isn't represented, so big cities often come out too cold. Urban tiles added in 2024 (cycle 49r1) add about 1–2 °C and may still fall short.
  - **Height correction (T4):** a standard 6.5 °C per km lapse-rate correction can go wrong, and even point the wrong way, in winter inversions.
  - **Lakes (T8):** deep lakes make temperatures downwind too persistent.
- **Cities in ERA5** (VERIFIED, plus INFERENCE):
  - In May 2023 ECMWF said its forecast model would take account of urban effects for the first time from 2024. ERA5 is built on the 2016 cycle (CY41R2), so it has no urban scheme, and city locations will look frostier than they really are.
  - This matches Frost Dates' own check (internal, PRODUCT_LOG.md). Four US cities came within 8 days of NOAA-based dates. Downtown Portland came out 19 days later in spring and 12 days earlier in autumn.
- **Open-Meteo specifics** (VERIFIED, Historical Weather API docs):
  - **Grid cell:** by default it picks a land grid cell at a similar elevation, using a 90 m elevation model, and adjusts the values statistically to the point's elevation. The cell used can be a few km away. `elevation=nan` turns the adjustment off.
  - **Elevation field:** the `elevation` in the response is the 90 m elevation model's height, which is used for the adjustment. It is not the grid cell's average height.
  - **Models:** `best_match` blends IFS, ERA5, and ERA5-Land. For climate work over decades, the docs advise using ERA5 or ERA5-Land only, to keep the record consistent.
- **INFERENCE from the above:**
  - **Valleys:** on calm, clear nights, adjusting a grid value down to a lower valley floor with a lapse rate makes it *warmer*, which is the opposite of what happens in a real inversion. ECMWF's T4 note agrees, so frost in hollows is probably undercounted.
  - **Model mix:** the 30-season window mixes ERA5-Land (to 2016) with IFS (2017 on), which can shift the statistics. Testing `models=era5_land` costs the same number of calls.
- **NASA POWER / MERRA-2** (VERIFIED):
  - Values are averages over ½° × ⅝° cells, 2 m above the cell's average height.
  - The daily low is the lowest of 24 hourly values.
  - The pages read mention no bias correction or downscaling. Validation is described only as a method (correlation, bias, RMSE), with no temperature figures on the pages read.
  - No official MERRA-2 statement on daily-low or frost bias was found (open item).
- **Station data** (VERIFIED):
  - GHCN-Daily isn't homogenized and its coverage is uneven; about 0.3% of values carry a quality flag.
  - Meteostat mixes in model data by default.
  - E-OBS notes that providers define the observing day differently (midnight to midnight versus morning to morning).
- **Hourly sampling** (INFERENCE): every reanalysis route takes the daily low from hourly values, so it can miss short dips between hours that a station's minimum thermometer would catch. No official figure for the size of this effect was found.
- **Scholarly:** validation of ERA5-Land 2 m temperature is in the dataset's reference paper (Muñoz-Sabater et al., 2021, *Earth System Science Data*). Scholarly, not resolved via LibKey, and not consulted.

---

## 6. Cost if usage grows

**Assumptions:**

- A "lookup" is one archive fetch: a new place, or a refresh after 3 days.
- Weight today is 82.9 calls a lookup; with the hybrid design it's about 1–1.3.
- Prices are as displayed in USD on 2026-10-11.
- Geocoding calls (a few per search) aren't included.

| Lookups a month | Weighted calls today | Average a day | Free tier, enforced per IP | Free tier, read per app (10k a day, 300k a month) | Commercial (with ads) | Hybrid calls a month |
|---|---|---|---|---|---|---|
| 1,000 | 82,900 | about 2,700 | Fine | Within the limits | Professional, $99 a month (Standard excludes the archive) | 1,000–1,300 |
| 10,000 | 829,000 | about 27,300 | Fine | Over: about 2.7 times both the daily and monthly figures. Contact Open-Meteo. | Professional, $99 a month (5M) | 10,000–13,000 |
| 100,000 | 8,289,000 | about 273,000 | Works, but shared-IP 429s become more likely | Far over | Professional 10M, from $185 a month | 100,000–130,000, within 10k a day even read per app |

**Alternatives:**

- **Static pre-built files on GitHub Pages:** $0 hosting at all three levels, using about 0.5–5 GB of the 100 GB monthly soft limit (ESTIMATE). The computation runs once on a personal machine, the data download is free (AWS Open Data, no key), and it would be re-run about once a year.
- **NASA POWER, called live:** $0, with one request per lookup and no published limit, though it may be throttled. Resolution is coarse, and browser (CORS) support wasn't checked.
- **CDS:** $0, but needs an account and token, so it only suits a one-off bulk download, not per-visitor calls.
- **Meteostat JSON API:** needs a key; the free tier is 500 requests a month. Paid tiers are on RapidAPI (prices not checked).
- **The hybrid design on a paid Open-Meteo plan:** 100k–130k calls a month fits Standard's 1M allowance, but Standard can't use the archive API. The Forecast API's `past_days` (up to 92 days, VERIFIED) might cover part of the current season on Standard at $29 a month (INFERENCE, needs checking).

---

## Sustainability verdict

**Can a standalone, non-commercial version run on Open-Meteo?**

- **At small scale, yes:** up to about 120 lookups a day in total, or about 3,600 a month.
  - It costs nothing and fits the terms clearly.
  - Because limits are enforced per visitor IP, it even keeps working well above that.
- **Past that point, sustainability rests on goodwill rather than on the written terms:**
  - The README asks heavy applications to get in touch.
  - The terms' daily figure is ambiguous.
  - The service has no uptime guarantee and keeps the right to block applications.
  - Requests are handled one at a time per IP and take seconds, so heavy use from shared IPs will produce "busy" errors.
- **The dependence is on Open-Meteo's *service*, not on its data.** The page relies entirely on Open-Meteo for delivery, for picking and adjusting grid cells, and for place search. But the underlying ERA5-Land, ERA5, and GeoNames data is open (CC BY 4.0) and available in bulk without keys.
- **Making money from it breaks the model:**
  - Ads make the use commercial, which means at least $99 a month (Professional), or $185+ a month at 100k lookups.
  - A paid key also needs a server or proxy, which breaks Labs' static-only and no-secrets rules.

**Cheapest robust alternative:**

1. Work out the 30-year frost climatology ahead of time, offline, from bulk open data that needs no key:
   - First choice: ERA5-Land from Open-Meteo's `openmeteo` AWS bucket, about 128 GB for 1995–2026, CC BY 4.0.
   - Lower-resolution fallback: NASA POWER's Zarr files.
   - Optional station layer: GHCN-Daily (CC0) where long records exist.
2. Ship the results as static tiles on GitHub Pages. A global 0.1° climatology is about 78–93 MB (ESTIMATE), well under the 1 GB limit.
3. Optionally keep one cheap live request (weight about 1) for "this season so far".
4. Credit Copernicus and Open-Meteo, and NOAA if its station data is used.

**What this achieves:**

- Cuts per-visitor API use by roughly 98–99%.
- Makes the core feature independent of Open-Meteo's uptime and terms.
- Works for an ad-supported version too, subject to GitHub Pages' rules on commercial use, without paying Open-Meteo.

**Trade-offs:**

- It needs an offline data pipeline, which may require an amendment to the Labs constitution.
- It means a one-off download of about 130 GB plus some processing.
- It loses Open-Meteo's on-the-fly downscaling for the exact point. Running Open-Meteo locally (AGPL, fine for offline use) for a list of places, such as 10k–50k, keeps exact parity with today's numbers.

**For the current Labs experiment as it stands:** keep the browser-direct design. Two changes would cut both cost and risk:

- Consider `models=era5_land`, for consistency, at the same call cost.
- Consider fetching a shorter window or a hybrid design if traffic grows past about 100 lookups a day.

---

## Open items

1. **Ask Open-Meteo (owner action, by email to info@open-meteo.com):**
   - Is a static, browser-only page whose visitors stay within per-IP limits fine once total use passes 10,000 calls a day?
   - Does the README's "10,000 requests a day" mean weighted calls or HTTP requests?
   - Would a donation link affect non-commercial status?
   - (Not contacted in this research.)
2. **Browser support (CORS) is unchecked** for the NASA POWER API and for direct reads from the `openmeteo` S3 bucket. Both matter for any browser-side alternative.
3. **Land-cell counts** for each grid are assumptions (25–30% of grid points). Get real counts from a land mask before sizing any output.
4. **Exact sizes** of the yearly ERA5-Land `temperature_2m` files and of `copernicus_dem90` on AWS. The ~8 GB per 2 years figure comes from the tutorial.
5. **Open-Meteo prices in EUR versus USD,** and how the "10M" units are tiered. Check at checkout before budgeting; don't subscribe.
6. **Canadian 1991–2020 normals:** do they include frost-free statistics? UNVERIFIED.
7. **HadUK-Grid access** through CEDA needing an account is SNIPPET only.
8. **MERRA-2 / NASA POWER:** no official statement on daily-low or frost bias was found.
9. **Product decision:** should `best_match` be replaced by `models=era5_land`? Re-run the five US validation cities to see the effect.
10. **Whether an offline data-generation script counts as "build infrastructure"** under the Labs constitution. This needs an owner decision.
11. **Whether GitHub Pages' terms allow an ad-supported information site,** for a standalone.
12. **Whether the geocoding API has its own rate limits,** separate from the weather APIs.
13. **The size of the bias from taking daily lows from hourly values** isn't quantified in any official source found.

---

## Sources

**Open-Meteo**

- https://open-meteo.com/en/terms: VERIFIED. Non-commercial definition, limits, blocking clause, CC BY 4.0.
- https://open-meteo.com/en/pricing: VERIFIED. Plan table, counting FAQ, calculator script. Prices VERIFIED from the rendered Stripe table in a browser, 2026-10-11, USD.
- https://open-meteo.com/en/licence: VERIFIED. Attribution, data-source licences, GeoNames, AGPL.
- https://open-meteo.com/en/features: VERIFIED. No authentication for non-commercial use.
- https://open-meteo.com/en/docs/historical-weather-api: VERIFIED. Models, `best_match`, the recommendation for decades-long work, 90 m downscaling, Copernicus acknowledgement.
- https://open-meteo.com/en/docs: VERIFIED. `past_days` 0–92.
- https://github.com/open-meteo/open-meteo (README, Terms & Privacy): VERIFIED. Fair use, the 10,000-a-day contact request, CORS, AGPLv3.
- https://github.com/open-meteo/open-meteo/blob/main/Sources/App/Helper/Vapor/RateLimiter.swift: VERIFIED.
- https://github.com/open-meteo/open-meteo/blob/main/Sources/App/Helper/Vapor/ApiKeyManager.swift: VERIFIED.
- https://github.com/open-meteo/open-meteo/blob/main/Sources/App/Helper/Writer/ForecastApiResult.swift: VERIFIED (`calculateQueryWeight`).
- https://github.com/open-meteo/open-meteo/blob/main/Sources/App/Controllers/ForecastapiController.swift: VERIFIED (how variables are counted; archive route).
- https://github.com/open-meteo/open-meteo/issues/438: VERIFIED. Maintainer, 2023-09-18.
- https://github.com/open-meteo/open-meteo/issues/1129: VERIFIED. Maintainer, 2024-11-29.
- https://github.com/open-meteo/open-meteo/issues/832: VERIFIED.
- https://github.com/open-meteo/open-meteo/issues/1726: VERIFIED.
- https://github.com/open-meteo/open-meteo/issues/1493: VERIFIED.
- https://github.com/open-meteo/open-meteo/issues/1650: VERIFIED.
- https://github.com/open-meteo/open-meteo/pull/854: VERIFIED (a user's comment on the price in €).
- https://github.com/open-meteo/open-meteo/blob/main/docs/getting-started.md: VERIFIED.
- https://github.com/open-meteo/open-data (README): VERIFIED.
- https://github.com/open-meteo/open-data/tree/main/tutorial_download_era5: VERIFIED.
- https://registry.opendata.aws/open-meteo/: VERIFIED.
- https://github.com/open-meteo/typescript-omfiles: VERIFIED.
- https://github.com/open-meteo/open-meteo-website/commits/main/src/routes/en/terms/%2Bpage.svelte: VERIFIED. Terms page last changed 2026-07-16, a formatting commit.
- https://wiki.creativecommons.org/wiki/NonCommercial_interpretation: VERIFIED.

**NASA POWER**

- https://power.larc.nasa.gov/docs/services/api/: VERIFIED.
- https://power.larc.nasa.gov/docs/services/api/temporal/daily/: VERIFIED.
- https://power.larc.nasa.gov/docs/tutorials/service-data-request/api/: VERIFIED.
- https://power.larc.nasa.gov/docs/methodology/: VERIFIED.
- https://power.larc.nasa.gov/docs/methodology/meteorology/: VERIFIED.
- https://power.larc.nasa.gov/docs/referencing/: VERIFIED.
- https://registry.opendata.aws/nasa-power/: VERIFIED.
- https://forum.earthdata.nasa.gov/viewtopic.php?p=15146: VERIFIED. No set rate limit, 2023.
- https://github.com/ropensci/nasapower/issues/57: SNIPPET. About 30 requests a minute on the climatology endpoint in 2021; not used for conclusions.

**Copernicus / ECMWF**

- https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land: VERIFIED.
- https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels: VERIFIED.
- https://cds.climate.copernicus.eu/datasets/derived-era5-land-daily-statistics: VERIFIED.
- https://cds.climate.copernicus.eu/licences/cc-by: VERIFIED.
- https://cds.climate.copernicus.eu/how-to-api: VERIFIED.
- https://cds.climate.copernicus.eu/licences/licence-to-use-E-OBS-products: VERIFIED.
- https://cds.climate.copernicus.eu/datasets/insitu-gridded-observations-europe: VERIFIED.
- https://confluence.ecmwf.int/display/CKB/ERA5%3A+data+documentation: VERIFIED.
- https://confluence.ecmwf.int/display/CKB/ERA5-Land%3A+data+documentation: VERIFIED.
- https://confluence.ecmwf.int/display/CKB/Model+grid+box+and+time+step: VERIFIED.
- https://confluence.ecmwf.int/spaces/FCST/pages/662512270/Known+IFS+forecasting+issues: VERIFIED.
- https://www.ecmwf.int/node/28755: VERIFIED. "Developing an urban scheme for the IFS", 2023-05-30.
- https://forum.ecmwf.int/t/era5-era5-land-and-heat-island-effect/1340: VERIFIED (user replies, not staff).
- https://registry.opendata.aws/nsf-ncar-era5/: VERIFIED.
- https://registry.opendata.aws/ecmwf-era5/: VERIFIED (marked deprecated).

**NOAA**

- https://www.ncei.noaa.gov/products/land-based-station/global-historical-climatology-network-daily: VERIFIED.
- https://www.ncei.noaa.gov/access/metadata/landing-page/bin/iso?id=gov.noaa.ncdc:C00861: VERIFIED.
- https://www.ncei.noaa.gov/pub/data/ghcn/daily/readme.txt: VERIFIED (states no use restrictions).
- https://registry.opendata.aws/noaa-ghcn/: VERIFIED.
- https://www.ncei.noaa.gov/support/access-data-service-api-user-documentation: VERIFIED.
- https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals: VERIFIED.
- https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/doc/Readme_By-Variable_By-Station_Normals_Files.txt: VERIFIED.

**Meteostat**

- https://dev.meteostat.net/license: VERIFIED.
- https://dev.meteostat.net/terms: VERIFIED.
- https://dev.meteostat.net/api: VERIFIED.
- https://dev.meteostat.net/data/bulk: VERIFIED.
- https://dev.meteostat.net/data/timeseries: VERIFIED.
- https://dev.meteostat.net/quality: VERIFIED.

**National met services**

- https://www.metoffice.gov.uk/research/climate/maps-and-data/uk-climate-averages: VERIFIED.
- https://www.metoffice.gov.uk/research/climate/maps-and-data/data/haduk-grid/haduk-grid: VERIFIED.
- https://catalogue.ceda.ac.uk/uuid/789b3065d74a4c948ab05d33556c86d0/: SNIPPET (OGL v3; registered CEDA users only).
- https://www.bom.gov.au/climate/maps/averages/frost/: VERIFIED (read in a normal browser; scripted fetch returned 403).
- https://www.bom.gov.au/copyright: VERIFIED (read in a normal browser).
- https://climate.weather.gc.ca/climate_normals/index_e.html: VERIFIED (frost statistics not shown on the portal page).
- https://api.weather.gc.ca/collections/climate-normals: VERIFIED.
- https://eccc-msc.github.io/open-data/licence/readme_en/: VERIFIED.
- https://open.canada.ca/data/en/dataset/746f9469-ab78-5dcc-b165-4b51e8ab8652: SNIPPET.
- https://opendata.dwd.de/climate_environment/CDC/Terms_of_use.txt: VERIFIED.
- https://opendata.dwd.de/climate_environment/CDC/grids_germany/annual/frost_days/: VERIFIED (directory listing).

**Other sources**

- https://www.chc.ucsb.edu/data/chirtsdaily: VERIFIED.
- https://daymet.ornl.gov/web_services: VERIFIED.
- https://www.earthdata.nasa.gov/data/catalog/ornl-cloud-daymet-daily-v4r1-2129-4.1: VERIFIED.
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits: VERIFIED.

**Internal**

- `/Volumes/Projects/labs/src/experiments/frost-dates/index.tsx`: VERIFIED (request parameters, caching, attribution).
- `/Volumes/Projects/labs/PRODUCT_LOG.md`: VERIFIED (the NOAA comparison for five US cities).

**Scholarly**, named only:

- Muñoz-Sabater et al. (2021), ERA5-Land, *Earth System Science Data*. Scholarly, not resolved via LibKey, and not consulted.
