# Portfolio resolution

The closing decision for the 25-experiment Labs discovery cycle (Batches 01 to 06), written on 2026-10-10 at the end of Batch 06. Internal and operational. The evidence behind it is in `.claude/PORTFOLIO_REVIEW.md` (scores, every audit's findings, post-audit assessments) and `PRODUCT_LOG.md`. This file records the decisions and the reasons for them.

**What the evidence is, and isn't.** Every experiment has been loaded, audited, and fixed where it was wrong. The strongest were verified independently, and the API-heavy ones were also checked in Safari on Apple's iPhone and iPad simulators. None has known real users: GitHub shows no issues, pull requests, stars, forks, or watchers, and Labs has no analytics by design. So "promote" means "the best place for the next effort", not "proven". The scores informed these decisions without making them: two of the previous top five aren't promoted, and an experiment scoring 48 is.

**Public behavior doesn't change.** Every experiment stays live at its address, with status `live` in the registry. Archive candidates are an internal recommendation; public archival waits for the owner's decision.

## The four groups

- **Promote (4).** The best candidates to grow beyond Labs if real-world evidence arrives. The next round of effort goes here first: validation, then distribution. No spin-out now.
- **Maintain (14).** Sound, verified, and worth keeping as they are. Fix defects when found; no new features.
- **Experimental (5).** Live, with an open question that only real-world use can settle: a real voice, a real microphone, real footage, real washing. No further investment until it's answered, one way or the other.
- **Archive candidate (2).** Recommended for public archival, which is the owner's call. Until then they stay live and unchanged, and get fixes only for something harmful.

## All 25

"Assessed total" is the latest assessment out of 65: the Batch 03 scores plus each later post-audit change recorded in the portfolio review. It's evidence for the decision, not the decision.

| # | Experiment | Group | Assessed total | Deciding reason |
|---|---|---|---|---|
| 001 | Trip Board | Archive candidate | 34 | Sound code (no defect in an independent audit), in a market where trips need sync and collaboration. Nothing distinctive to grow |
| 002 | Photo Scrub | Maintain | 50 | The best-verified privacy claim in Labs, but an occasional, preventive need that phones and platforms increasingly cover |
| 003 | Fair Share | Maintain | 48 | Correct, and shared by link, but copies diverge across phones, where free apps sync |
| 004 | Clean Paste | Maintain | 46 | Word-perfect on real PDFs and often useful, but a solitary utility with little to set it apart from assistants and line-break sites |
| 005 | CSV Checkup | Maintain | 47 | Solid and private, for a technical audience that spreadsheets already serve |
| 006 | Secret Santa | Maintain | 50 | The best built-in spread in Labs, but used once a year in a crowded niche |
| 007 | Numbers by Ear | Experimental | 39 | Right on Apple's voices after the fixes; Windows, Android, and Chrome voices are unknown |
| 008 | Serve Time | Maintain | 45 | A verified planner for an occasional job |
| 009 | Tear-Off Flyer | Archive candidate | 41 | Prints correctly now, but undistinctive and occasional, and print layout breaks silently between browsers (Safari's did, this week) |
| 010 | Gallery Wall | Maintain | 44 | Accurate geometry for a once-in-a-while job |
| 011 | Line Dry | Experimental | 39 | Honest since the audit, but its drying estimates have never been checked against real washing |
| 012 | Glance | Maintain | 45 | A sound daily game with a share loop that costs almost nothing to keep; entertainment, so no investment |
| 013 | In Tune | Experimental | 42 | The detector is verified with generated signals; it has never heard a real voice through a phone microphone |
| 014 | Playing Time | Maintain | 50 | Sound and weekly in season, but many free coaching apps compete, and a standalone would be a different product (live game tracking) |
| 015 | Back Row | Maintain | 44 | Correct and unusual, for an occasional job |
| 016 | Fluency Check | **Promote** | 52 | Weekly professional use, a large and reachable audience, and nothing about students leaves the device |
| 017 | Frost Dates | **Promote** | 48 | The only frost-date tool found that covers anywhere in the world, for a search people make every spring; depends on Open-Meteo |
| 018 | Off Book | Maintain | 48 | Useful line practice; real script PDFs vary more than the tests, and polished apps compete |
| 019 | Form Check | Experimental | 45 | Works in Safari now with Apple-encoded video; real phone footage (4K, slow motion) is untested |
| 020 | Custody Calendar | **Promote** | 52 | A high-stakes, recurring planning job dominated by paid, account-based platforms; the share link carries the schedule |
| 021 | Family Stories | Experimental | 44 | Irreplaceable recordings live in browser storage, and recording is untested in Safari |
| 022 | Day Clock | **Promote** | 52 | Daily, always-on use for people with memory loss: a free alternative to dedicated clocks, on a tablet the family already has |
| 023 | Discussion Map | Maintain | 46 | Verified timing for a niche classroom job |
| 024 | Ranked Choice Count | Maintain | 49 | The best-verified logic in Labs, but occasional and consequential, and organizations' rules vary. Closest to promotion |
| 025 | Stall Till | Maintain | 44 | Verified arithmetic, and works offline on iPhones, but a day's sales still live in one browser |

Counts: 4 promote, 14 maintain, 5 experimental, 2 archive candidates.

## The five the brief asked to reconsider

- **#006 Secret Santa: maintain, not promoted.** It has the strongest spread mechanics in Labs (every participant opens a link), a clear audience, and a sound draw since Batch 03; it worked end to end in Safari (draw, copy link, reveal in a fresh browser). But several free draws already work without sign-up, it's used once a year, and a seasonal standalone would compete in a niche saturated with search-optimized sites. Spread doesn't fix weak differentiation. Keep it working for December; no investment.
- **#024 Ranked Choice Count: maintain, the closest to promotion.** Its logic is the best verified in Labs: after the Batch 04 fix, a reference counter written from the Scottish STV rule text agreed with it, round by round, in all 2,801 of 4,000 random elections that didn't need lots drawn. Small organizations do need a free, private count that explains every round. But each organization counts rarely, a wrong or misunderstood count is costly, organizations' bylaws use different rules (it implements one STV variant, plus instant runoff), and free alternatives exist, from certified open-source desktop tabulators to freemium web services. Promote it if organizations start using it.
- **#002 Photo Scrub: maintain, not promoted.** The highest technical confidence in Labs: a marker in every claimed metadata class, none surviving, identical pixels, and in Batch 06 the same result through Safari's photo picker on iPhone, read back from the downloaded file. The picker hands websites the photo's location by default, so the need is real. But it's occasional and preventive, phones increasingly offer to leave location out when sharing, big platforms strip it, and a visitor has to come here first. A good tool, not a product.
- **#017 Frost Dates: promoted.** It answers a question gardeners search every spring, for any place on Earth, with a method that matches NOAA's frost-freeze framing and was counted rather than fitted. US tools generally look up a nearby station's normals by ZIP code, and few tools cover anywhere else. The risks (an outside data service with non-commercial terms and heavy quota cost, a coarse grid, seasonal use) are real and are in its dossier.
- **#004 Clean Paste: maintain, not promoted.** Real-PDF testing made it trustworthy: word-perfect against two PDF engines, nothing removed without evidence, and its Paste and Copy work in Safari on iPhone. The need is frequent. But it's used alone (nothing in it spreads), "remove line breaks" sites are everywhere, and general assistants now do the job for many people. Quality alone doesn't make a product here.

## Standalone potential: Fluency Check, Custody Calendar, Day Clock, Playing Time

| | Fluency Check | Custody Calendar | Day Clock | Playing Time |
|---|---|---|---|---|
| Job | Time oral reading checks, score them, keep progress | Choose and agree a two-home schedule, see the year, put it in calendars | Show a person with memory loss the day and part of the day | Give every child fair minutes, with a sideline plan |
| How often | Weekly or every two weeks, per student, all school year | Intense at setup and before holidays; daily use moves into the family's own calendars | All day, every day (configured once) | Weekly in season |
| Status quo | Paper, a stopwatch, and a calculator, or paid assessment platforms | Paid or account-based co-parenting platforms; general calendars that struggle with 2-2-5-5 | Dedicated calendar clocks bought as hardware; assorted apps | Many small coaching apps (free and paid), spreadsheets |
| Fit with Labs' limits | Good, except history lives in one browser | Good: the share link and calendar file carry the schedule | Very good: static, offline, no data worth losing | Good |
| What a standalone would need | History across devices, rosters (student-data obligations) | A live shared calendar feed (a server) | Remote updates by family (a server), device setup guides | Live game tracking: a different product |
| Reachable through | Literacy coaches, teacher communities, search | Search at the moment of need, mediators and family lawyers | Caregiver organizations, occupational therapists, search | Leagues, coaching communities |
| Verdict | **Promote** | **Promote** | **Promote** | Maintain |

Playing Time is sound and genuinely useful, but its competition is crowded and cheap, and the request a standalone would face first (adjust the plan during the game) is a different product. The other three have a clearer gap between what people use now and what Labs offers.

## The strongest single product

**#016 Fluency Check**, on the evidence available, with Custody Calendar close behind. It has the most recurring professional use of anything in Labs (every student, every week or two, all year), an audience that is large, reachable, and actively looking for free classroom tools, and a real wedge: nothing about students leaves the device, which removes the usual privacy objection to classroom software. Its status quo is paper or paid platforms. Its main weakness (history in one browser) has a working safety net in CSV export and import, and the page now says plainly how Safari treats saved data. Custody Calendar has the sharper search demand and built-in spread to the other parent, but once it's set up, daily use moves into the family's own calendars. Neither has a single real user yet, so this is a judgment, not a finding.

## Promotion dossiers

Planning only. Nothing below has been built, posted, or sent, and none of it should be until the owner decides. Every promoted experiment stays in Labs, under Labs' rules, until it meets its spin-out threshold.

### #016 Fluency Check

- **Product.** A browser tool for timed oral reading checks. Paste a passage, start a one-minute timer (or time the whole passage), tap each word read incorrectly (tap again for a self-correction), mark where the reader stopped, and get words correct per minute and accuracy, with a marked record to print. Checks are saved in the browser, with a per-student chart and CSV export and import.
- **User.** Reading teachers in the early and middle grades, interventionists, reading specialists, and tutors who monitor fluency; homeschooling parents second.
- **Job.** Regular progress monitoring of oral reading fluency, now done with photocopies, a stopwatch, and a calculator, or inside a paid platform bundled with a district's assessment program.
- **Why this.** It takes away the arithmetic and paperwork at the moment of testing, works with any passage, and keeps student data on the device (no account, nothing sent). Scoring follows DIBELS 8's rules (checked in Batch 03).
- **Evidence.** Batch 03 audit: a check in progress survives a reload, the log loads back from its CSV, and the scoring guide matches DIBELS 8. Batch 06: a full check ran in Safari on iPhone (timer, error and self-correction taps, results, and a save that survived a Safari relaunch); no text field zooms the page on phones; the log's storage note names Safari's seven-day rule. Joint highest score (52). No user evidence.
- **Risks.**
  - History lives in one browser. Safari on iPads, which many schools use, deletes it after about a week without a visit unless the page was added to the Home Screen, and shared or managed devices may wipe it. CSV export is the only safety net.
  - A single score can be taken as a diagnosis, and scores from passages a teacher chooses aren't comparable with published benchmarks.
  - Districts that vet every classroom tool may block it wherever the data lives.
  - On iPads, text fields are 14 px, which may make Safari zoom in when one is tapped (untested).
- **Validation.** Five to ten teachers use it for one grading period (six to nine weeks), recruited by the owner through people they know, not by posting. Signs it works: most keep using it after week three, they download CSVs, at least one recommends it unprompted, and their scores agree with their paper method. The first requests show the spin-out need: rosters, more than one device, or a year's history.
- **Spin-out threshold.** A dedicated repository, its own name and domain, and branding become worth it when (1) the pilot shows sustained weekly use by most participants, (2) the top request needs what Labs forbids (history across devices, rosters, sharing with a colleague), and (3) the owner is ready to take on student-data obligations. The infrastructure it would need: storage beyond one browser (optional backup to the teacher's own drive, or encrypted sync, where a server holding student data brings student-privacy law and district data agreements), passage sets used with permission, and an accessibility review for school purchasing.
- **Distribution.** Teachers adopt what colleagues vouch for. The strongest channel is literacy coaches and reading specialists, who train many teachers each; then teacher communities on Facebook, Reddit, Instagram, and Pinterest, and teacher-resource marketplaces' free listings. Search terms are concrete ("words correct per minute calculator", "reading fluency timer", "running record app"). One-line message: "Time a reading and tap the misread words: words correct per minute and a marked record, and nothing leaves your device." Assets to prepare first: a one-page printable how-to and a short screen recording. The bottleneck is trust, not awareness.

### #020 Custody Calendar

- **Product.** Choose a repeating pattern of nights (alternating weeks, 2-2-3, 2-2-5-5, 3-4-4-3, every other weekend with or without Wednesdays, or custom), see the whole year by who has the children each night, each parent's share of overnights, and the next handovers. Swap nights for holidays, export the year as a calendar file, and share a link that carries the whole schedule.
- **User.** Separated or separating parents, and the professionals who help them: mediators, family lawyers, parenting coordinators.
- **Job.** Choose and agree on a schedule, see what it means across a year (overnights, handovers, holidays), and get it into the family's calendars.
- **Why this.** Instant, free, and without accounts, where co-parenting platforms need both parents to sign up. It's useful before any agreement exists, while parents compare patterns. It counts overnights the way many custody and child-support calculations do, with a caveat that courts differ. The other parent sees the same schedule from a link, with no app.
- **Evidence.** Batch 03 audit: a broken link says so, calendar files keep stays whole across New Year, event IDs no longer collide, and link and calendar copies are explained as snapshots. Batch 06: the year view and date fields fit an iPhone in Safari. Joint highest score (52). No user evidence.
- **Risks.**
  - Legal reliance on overnight counts; the page says courts and formulas count differently.
  - Copies drift: each change needs a new link or calendar file.
  - Holiday swaps are made one night at a time, which is tedious for long breaks; the year view starts in January, so in the autumn the current month is far down on a phone.
  - High emotional stakes: one wrong night on a shared calendar causes conflict.
- **Validation.** A mediator or parenting coordinator uses it with a few families, introduced by the owner. Signs it works: it's used in sessions to compare patterns, families export the calendar file, and nobody finds a wrong night. The likely first requests (live shared updates, alternating-year holidays, children on different schedules) show the spin-out need.
- **Spin-out threshold.** A repository, domain, and branding of its own become worth it when (1) professionals use it in their work, and (2) the top request is a live shared calendar that both parents' calendars follow, which needs a server. The infrastructure it would need: a calendar feed service, holiday rules that alternate by year, privacy design for sensitive family data, and careful positioning as a planning tool, not legal advice.
- **Distribution.** The clearest search demand among the four: people search the pattern names ("2-2-5-5 schedule", "50/50 custody calendar") and "custody calendar maker". Professionals hand parents resources: mediators, family law practices, parenting coordinators, court self-help centers. Co-parenting communities online. Built-in spread: every use sends a link to the other parent. One-line message: "See any custody schedule for the whole year, with each parent's overnights, and share it with the other parent: no accounts." Plain explanations of each pattern would serve search, but adding them is a later decision. The bottleneck is being found at the moment of need, and professional trust.

### #017 Frost Dates

- **Product.** Pick any place on Earth and get the last spring frost and first autumn frost (the typical date and a cautious 9-in-10 date), every frost night of the last 30 seasons, and a planting calendar counted from the last frost, at three thresholds (light frost 36 °F, frost 32 °F, hard freeze 28 °F).
- **User.** Home gardeners and allotment holders, especially outside the US, where frost-date tools are scarce; new gardeners and people who've moved.
- **Job.** Decide when to plant out tender crops, and when to expect the first autumn frost, from local history rather than a regional rule of thumb.
- **Why this.** Worldwide coverage from 30 years of reanalysis at the chosen place; the method follows NOAA's frost-freeze framing and is counted, not fitted. US tools generally use a nearby station's normals by ZIP code, and few tools cover anywhere else.
- **Evidence.** Batch 04 audit: the method matches NOAA's framing, the southern hemisphere works, and leap seasons, stalled requests, and failed searches were fixed. Batch 06: search, the 30-year archive, the chart, and the calendar all work in Safari on iPhone (Montreal: last frost typically April 27, and by May 9 in 9 springs out of 10). Score 48. No user evidence.
- **Risks.**
  - Data dependency. Open-Meteo's free API is for non-commercial use only, with under 10,000 calls a day (and 5,000 an hour), and a request covering more than two weeks counts as several calls. A 30-year lookup is therefore heavy: a visitor can make only a handful a day, assuming the limit applies per visitor, which Open-Meteo doesn't state. An outage means no answers. The data is CC BY 4.0, attributed on the page.
  - The reanalysis grid (about 10 km) misses frost pockets in valleys and warmth in cities; the page explains this.
  - Seasonal use: two windows a year.
  - Planting rules of thumb vary by variety (stated on the page).
- **Validation.** Gardeners in a few climates compare its dates with their own records or local extension advice. Signs it works: agreement within about a week for open sites, return visits next spring, and links shared in gardening forums.
- **Spin-out threshold.** A repository, domain, and branding of its own become worth it when (1) gardeners beyond a test group use and link to it, and (2) growth would exceed the free tier, or the site would carry ads, either of which needs a paid Open-Meteo plan. The infrastructure it would need: its own data pipeline (ERA5 itself is free to use with attribution, but needs a Copernicus account and heavy processing) or a paid plan, cached results per place, possibly pages generated ahead of time for common places (static, and good for search), and planting calendars in local languages.
- **Distribution.** The strongest search case in Labs: "last frost date" plus a place name is a perennial spring search, and few results cover places outside the US. Gardening clubs, allotment associations, extension services, gardening forums and communities, and national gardening press. Built-in spread is low: the place isn't in the page address, so results can't be shared by link, and adding that is a later decision. One-line message: "Frost dates for anywhere in the world, from 30 years of nightly lows." The bottlenecks are search visibility (which per-place pages would need) and timing: it has to be found before spring.

### #022 Day Clock

- **Product.** A full-screen clock showing the day of the week, the part of the day (morning, afternoon, evening, night), the date, and the time in large, calm type. Dim colors at night, optional reminders and a standing message, the day and time read aloud on tap, settings behind a press-and-hold, keep-awake and full screen where the browser allows, and offline after the first visit.
- **User.** Family caregivers and care staff of people with dementia or memory loss.
- **Job.** Let the person see what day it is and what part of the day without asking, using a spare tablet.
- **Why this.** Dedicated calendar clocks are bought as hardware, and apps vary. Day Clock is free, needs no install or account, runs on a tablet the family already has, and keeps its settings on the device.
- **Evidence.** Batch 03 audit: screen readers aren't flooded every minute, the limits of reminders are stated, and settings restore themselves after a browser clears them. Batch 06: it opens offline from the service worker in iOS Safari after a relaunch; the settings fit an iPhone in Safari (fixed); on iPad, Wake Lock and full screen are available, and the clock fills the screen in portrait. Joint highest score (52). No user evidence.
- **Risks.**
  - Device age. The site is built for Safari 16.4 and later (Vite's default target), which on iPads means iPadOS 16.4 or later: the 5th-generation iPad (2017) onward. The iPad Air 2, the iPad mini 4, and older models stop at iPadOS 15, outside the target and untested. "An old tablet" needs that caveat.
  - Unattended running: power cuts, system updates, Safari reloading the page, and kiosk setup (Guided Access) are left to the caregiver.
  - Reminders are only on screen and aren't recorded (the page says not to rely on them alone for medicines).
  - Settings can only be changed at the device, so family living elsewhere can't update the message.
- **Validation.** A few caregivers run it for someone with memory loss for two weeks, introduced through the owner's network. Signs it works: it's still running at two weeks, caregivers report fewer "what day is it?" questions, setup needs no help, and it recovers after a power cut. Separately, try it on an iPad stuck at iPadOS 15 to settle the device question.
- **Spin-out threshold.** A repository, domain, and branding of its own become worth it when (1) caregivers keep it running for weeks and recommend it, and (2) the top request is remote updates (change the message or reminders from a phone), which needs a server and device pairing. The infrastructure it would need: remote configuration with privacy and safety design, setup guides for each kind of device, and perhaps a packaged app for tablets too old for the web version.
- **Distribution.** Caregiver support organizations (helplines, support groups, dementia-friendly community programs), occupational therapists and memory-care staff, caregiver communities online, and search ("dementia clock", "day of the week clock for elderly"). One-line message: "Turn a spare tablet into a clock that shows the day and the part of the day: free, no account." The first asset: a printed one-page setup guide (keep the screen on, add to the Home Screen, Guided Access). The bottlenecks are setup on the device and reaching caregivers through organizations they trust.

## Maintain: what it means for each

Keep live and correct. Fix defects when found, including after browser changes; no new features. What to watch:

- **#002 Photo Scrub:** new image formats and metadata blocks.
- **#003 Fair Share:** link decoding as browsers change; the copies-diverge notice.
- **#004 Clean Paste:** PDF engines' text extraction (the U+2010 hyphen lesson).
- **#005 CSV Checkup:** large-file performance on phones.
- **#006 Secret Santa:** a check every November.
- **#008 Serve Time:** background-timer behavior in mobile browsers.
- **#010 Gallery Wall:** print layout across browsers.
- **#012 Glance:** nothing scheduled; daily puzzles are generated from the date.
- **#014 Playing Time:** print layout across browsers.
- **#015 Back Row:** presentation apps' slide sizes, if they change.
- **#018 Off Book:** real script PDFs, if feedback brings examples.
- **#023 Discussion Map:** nothing scheduled.
- **#024 Ranked Choice Count:** the closest to promotion; reconsider if organizations adopt it or ask for other STV rules.
- **#025 Stall Till:** the one-browser day; offline behavior.

## Experimental: the open questions

Each stays live as it is. What would settle it, either way:

- **#007 Numbers by Ear.** Do Windows, Android, and Chrome's online voices read prices and years correctly? Measure them the same way Apple's voices were measured. Good results: maintain. Widespread misreading: archive, or limit the languages offered.
- **#011 Line Dry.** Do its drying windows match real washing? Hang standard loads (shirts, towels) on a few days in two climates and compare. A good match: maintain. A poor one: simplify to a day ranking, or archive.
- **#013 In Tune.** Does it work with real singers on real phones? Test a few voices on an iPhone and an Android phone, including a call interrupting Safari. If it holds: maintain. If not: archive.
- **#019 Form Check.** Does it handle real phone footage (4K, high frame rates, slow motion, Android video)? Try clips from several phones. If it holds: maintain.
- **#021 Family Stories.** Does recording work on real iPhones (Safari's MP4 chunks), and do people actually download their recordings? Test on a real iPhone. The data-loss risk is inherent to a browser-only recorder, so if downloads don't happen in practice, archive it.

## Archive candidates

Not deleted, not changed, and still live, with status `live` in the registry. If the owner authorizes public archival, the only change is the registry status: the homepage card and the experiment's header then say "Archived", and the page keeps working at the same address.

- **#001 Trip Board.** The first experiment, and historically important. An independent audit found no material defect: hostile imports are refused whole, links are matched behind tracking tags, and 5,000 items stay fast. But trip planning is done with other people, and free tools (Wanderlog, TripIt, Google's saved places, Notes, Trello and Notion templates) offer sync, collaboration, and maps; keeping research private, Trip Board's advantage, matters little here. Its data also lives in one browser, which Safari clears after a week without a visit. Technically sound, strategically weak.
- **#009 Tear-Off Flyer.** It works, and prints on one page in Safari since this week's fix. But it's undistinctive (word-processor and design-tool templates do the same), occasional, and a feature rather than a product, and print layout is the most fragile thing in Labs: it broke silently in Safari while Chrome was fine. Archiving says honestly that it won't be watched.

## Labs structure review (2026-10-10)

Checked against production after the decisions above. No change was needed.

- **Homepage:** lists 25 experiments, "25 shipped", newest first; every card links to its own address.
- **Category filters:** each shows the right count (Home & garden 5, Family & care 3, School & work 3, Groups & community 5, Practice & play 6, Files & text 3) and updates the address, and a shared filtered address (`/?for=school`) opens filtered.
- **Direct links:** all 25 addresses load their experiment with the right number and title in the header.
- **Unknown addresses:** show "There is nothing at this address." with a link back to Labs.
- **Offline:** the service worker is active for the whole site in production, and in Batch 06 it served three experiments in iOS Safari with the server stopped.
- **Feedback links:** every experiment's header links to a new GitHub issue titled with its number and name; the homepage footer has the general one. The channel's limit (a GitHub account, and public) is under "What would change these decisions".
- **Archive candidates:** the registry still lists all 25 as `live` (the file hasn't changed this batch), and no page shows "Archived". Public behavior is unchanged.
- **Final sweep:** all 26 pages at 320 px and at 1280 px in dark mode loaded with the right heading, no sideways scrolling, and no console errors.
- **Outside feedback:** at the end of the batch GitHub still shows no issues, pull requests, stars, forks, or watchers.

## What would change these decisions

- **Real feedback.** The only feedback channel today is a public GitHub issue, which needs a GitHub account. Teachers, caregivers, co-parents, and gardeners rarely have one, and co-parents and caregivers shouldn't describe their situations in public. So zero feedback says little about interest. A channel that needs no account (an email link, say) is the owner's decision, since it would publish an address.
- **The pilots.** Any promoted experiment whose validation fails moves to maintain; any maintained one that finds real users moves up (Ranked Choice Count first).
- **Outside changes.** Open-Meteo's terms or limits (Frost Dates, Line Dry), WebKit's storage policy (every local-first experiment), and print engines (Tear-Off Flyer, Gallery Wall, Playing Time, Stall Till).

## Recommended next phase

No new experiments. A validation phase for the four promoted experiments: decide on a feedback channel that needs no account, prepare the one-page guides, and run the small pilots described in the dossiers, recruited through the owner's own contacts. Expect weeks, not days, because classrooms, families, gardens, and caregiving move at their own pace. Spin out only what crosses its threshold. The experiments in the other groups need nothing beyond fixes in the meantime.
