# Day Clock: device, reliability, regulatory and privacy risk notes

Research date: 2026-10-11. Scope: questions 1 to 7 of the Day Clock validation brief (labs.eugeneyip.net/day-clock/).
This is research only. Nothing here is medical or legal advice. Where a section reaches a legal-sounding conclusion, it is labelled *Analysis* and should go to counsel before it is relied on.

**Evidence tags.** Each claim cites a source ID. The ID links to the URL, and the full list is at the end.
- **VERIFIED**: read on the page itself (web page, or text extracted from the official PDF).
- **SNIPPET**: seen only in search results, or in a secondary source quoting the primary one.
- **UNVERIFIED**: not confirmed. Either the page was blocked or wouldn't render, or the claim comes from general knowledge.
- *Analysis*: our own reasoning from the cited facts. It is not a sourced claim.

Journal literature (for example, clinical evidence on orientation clocks) was not reviewed: the organization's required scholarly connector (LibKey) isn't available. Search budget used: 18 of 25.

---

## 1. Old-tablet reality

### 1a. iPads: which reach iPadOS 16.4 (Safari 16.4) and which stop earlier

Apple's security bulletins list each update's "Available for" devices, so they show where each iPad stops. Launch years are from general knowledge and were not re-checked.

| iPad models | Newest iPadOS available (Oct 2026) | Meets the 16.4 target? | Source |
|---|---|---|---|
| iPad Pro 12.9" (4th gen) and later, iPad Pro 11" (2nd gen) and later, iPad Air (4th gen) and later, iPad (9th gen) and later, iPad mini (6th gen) and later | iPadOS 27 (released Sept 14, 2026) | Yes | [A3], VERIFIED |
| Also: iPad Pro 12.9" (3rd gen), iPad Pro 11" (1st gen), iPad Air (3rd gen), iPad (8th gen), iPad mini (5th gen) | iPadOS 26.7.1 (Sept 28, 2026) | Yes | [A4], VERIFIED |
| iPad (7th gen) | iPadOS 18.7.10 (Aug 17, 2026) | Yes | [A5], VERIFIED |
| iPad Pro 12.9" (2nd gen), iPad Pro 10.5", iPad (6th gen) | iPadOS 17.7.11 (May 11, 2026) | Yes, but see the wake-lock note in §2 | [A6], VERIFIED |
| iPad (5th gen, ~2017), iPad Pro 9.7", iPad Pro 12.9" (1st gen) | iPadOS 16.7.16 (May 11, 2026) | Yes, but see the wake-lock note in §2 | [A7], VERIFIED |
| **iPad Air 2, iPad mini 4** | **iPadOS 15.8.8** (May 11, 2026) | **No** (stuck on 15.x) | [A8], VERIFIED |
| iPad Air (1st gen), iPad mini 2, iPad mini 3 | iOS 12.5.7 (Jan 23, 2023) | No | [A9], VERIFIED |
| iPad 2, 3, 4 and iPad mini (1st gen) | iOS 9 or 10 | No | UNVERIFIED (not checked on Apple pages this pass) |

- In short, these iPads can run 16.4 or later: iPad (5th gen) and newer, iPad Air (3rd gen) and newer, iPad mini (5th gen) and newer, and every iPad Pro. *Analysis*, from the table above.
- Apple was still shipping security fixes to iPadOS 15.8 (iPad Air 2, iPad mini 4) in May 2026 [A8, VERIFIED]. Owners of those iPads may reasonably think the device is "still supported" and expect Day Clock to work, but it is outside the build target. *Analysis*.

**How many older iPads are in use?**
- Apple's App Store figures, measured from devices that transacted on June 7, 2026, put 68% of all iPads on iPadOS 26. Among iPads introduced in the last four years, the figure is 79% [A1, VERIFIED]. So roughly a third of active iPads ran iPadOS 18 or older on that date. The page doesn't split that remainder into "can't update" and "hasn't updated", and the data predates iPadOS 27.
- No credible public estimate was found of how many iPad Air 2, iPad mini 4 or older units are still in use. Apple publishes only an all-products active-device count (reported as over 2.5 billion at the end of 2025), with no iPad breakdown [S1, SNIPPET].
- Third-party web-traffic shares (for example, StatCounter) measure browsing, not devices, and weren't used here.

### 1b. Android tablets (Chrome)

| Android version | Last Chrome it can get | Meets Chrome 111? | Source |
|---|---|---|---|
| Android 10 and later | Current Chrome. Google lists "Android 10 or later" as the requirement | Yes | [G1], VERIFIED |
| Android 8.0 and 9 | Chrome 138. Chrome 139 (Aug 2025) needs Android 10 | Yes, but frozen with no further updates | [G2], VERIFIED (Google's own post [G3] is SNIPPET only) |
| Android 7.x | Chrome 119. Chrome 120 needs Android 8 | Yes, but frozen | [G4], VERIFIED |
| Android 6.0 (and 5.x) | Chrome 106. Chrome 107 made Android 7 the minimum | **No** | [G5], VERIFIED (secondary source; no Google primary cited) |

- So Chrome 111 or later is available only on Android 7.0+ tablets. Budget tablets that never got past Android 5 or 6 are outside the target. Tablets on Android 7, 8 or 9 meet it but receive no further Chrome updates. *Analysis*.
- Tablets without Google Play (Fire tablets, some budget brands) don't get Chrome through the normal route. Fire tablets ship with Silk preinstalled [F4, VERIFIED]. That other budget brands lack Play is UNVERIFIED.

### 1c. Amazon Fire tablets (Fire OS and Silk)

- **Fire OS 5 (Android 5.1, API 22):** Fire (2015), Fire 7 (2017), Fire HD 6/7 (2014), Fire HD 8 (2015, 2016, 2017), Fire HD 10 (2015, 2017). All are still on Fire OS 5 [F1][F2], VERIFIED.
- **Fire OS 7 (Android 9, API 28):** Fire 7 (2019), Fire HD 8 (2018, 2020), Fire HD 10 (2019, 2021) [F1][F2], VERIFIED.
- **Fire OS 8 (Android 11, API 30):** Fire 7 (2022), Fire HD 8 (2022, 2024), Fire HD 10 (2023), Fire Max 11 (2023) [F1][F2][F3], VERIFIED.
- **Silk:** Amazon says Silk is built on Chromium, is regularly updated, and comes preinstalled on Fire tablets [F4, VERIFIED]. Amazon's public developer guide gives no table mapping Silk's Chromium version to Fire OS versions. Its user-agent examples are very old (Silk 44 / Chrome 44) [F5, VERIFIED].
- Silk updates come from Amazon, not Google's Chrome Android cut-offs, so Android-based rules don't settle the question. **Whether Fire OS 5 tablets still get a Silk at Chromium 111 or later is UNVERIFIED** and needs a device test (read "like Chrome/NNN" in Silk's user agent). See Open items.

---

## 2. Keeping the screen on

### 2a. Screen Wake Lock API support

| Browser | Support | Source |
|---|---|---|
| Chrome (desktop and Android), Edge, Opera, Samsung Internet, Android WebView | Chrome 84+; the others follow Chrome | [W1], VERIFIED |
| Firefox (desktop and Android) | 126+ | [W1], VERIFIED |
| Safari on macOS | 16.4+ | [W1], VERIFIED |
| Safari on iPhone and iPad | **16.4+ in Safari tabs. In standalone Home Screen web apps only from 18.4** (before that it didn't work there; WebKit bug 254545) | [W1], VERIFIED |
| Amazon Silk | No compatibility data | UNVERIFIED, needs a test |

**Behaviour that matters for an always-on clock** (VERIFIED: [W2][W3][W4][W5]):
- Only a visible page can hold a wake lock. It is released when the tab is hidden, the app is switched, or the window is minimized, and the page has to request it again on `visibilitychange`. Day Clock's `useWakeLock` already re-requests on `visibilitychange` and reports "not supported" as `null` (`src/experiments/day-clock/index.tsx`, VERIFIED in the repo).
- The browser may refuse or drop a lock when the battery is low or a power-saving mode is on. The W3C draft explicitly allows this, and MDN gives power-save settings and low battery as examples. If the user turns the screen off by hand, the lock doesn't apply until the screen is back on [W4].
- The API works only on HTTPS, and only for the page's own origin by default [W2].
- Element fullscreen on Safari iOS works **on iPad only, not iPhone**, and shows an overlay button that can't be disabled [W6, VERIFIED]. Day Clock already hides its fullscreen button where `requestFullscreen` is missing (repo, VERIFIED).

*Analysis, iPad-specific:* iPads that stop at iPadOS 16.7 or 17.7 (iPad 5th and 6th gen, iPad Pro 9.7", 10.5", 12.9" 1st and 2nd gen) keep the screen on only in a **Safari tab**. Opened as a Home Screen web app, they'll sleep on Auto-Lock unless Auto-Lock is set to Never. iPadOS 18.4+ (iPad 7th gen and newer) works in both.

### 2b. iPad: Auto-Lock, Low Power Mode, Guided Access

- **Auto-Lock:** Apple's iPad User Guide has a page titled "Keep the iPad display on longer" [P3]. The title is VERIFIED, but its steps wouldn't render in our fetch. The Settings > Display & Brightness > Auto-Lock path appears in Apple's iPhone display article [D2, VERIFIED for iPhone] and in third-party iPad guides (SNIPPET).
- **Low Power Mode** (iPhone and iPad): sets Auto-Lock to 30 seconds and dims the display. It turns off automatically once the battery charges to 80% or higher. Where Adaptive Power is supported and on, it turns on below 20% [P1, VERIFIED, published Sept 21, 2026].
  - *Analysis:* on a tablet that stays plugged in, Low Power Mode should normally be off. If the charger or cable fails and the battery drains, it can turn on and the screen may start sleeping after 30 seconds. Whether Safari's wake lock overrides Low Power Mode is UNVERIFIED (test).
- **Guided Access** [P2, VERIFIED, July 24, 2026]:
  - Setup: Settings > Accessibility > Guided Access, then set a passcode and optionally Face ID or Touch ID. There is a separate **Display Auto-Lock** setting for sessions.
  - To start, open the app and triple-click the top button. To end, triple-click and authenticate (double-click on iPadOS 18 and earlier).
  - During a session you can block touch areas and the top or volume buttons, and set time limits.
  - Apple's page doesn't say what happens after a restart (UNVERIFIED). A search snippet suggests Display Auto-Lock can be set to Never (SNIPPET).
- **After any restart**, a passcode-protected device needs the passcode before Face ID or Touch ID will work [P4, VERIFIED]. *Analysis:* after an overnight update or a crash, the clock will not reopen by itself. Someone has to unlock the iPad, reopen Safari, and re-enter fullscreen or Guided Access.

### 2c. Android

- **App pinning** [P5, VERIFIED]:
  - Turn it on under Settings > Security (or Security & location) > Advanced > App pinning, then pin from the Overview screen.
  - To unpin, use a button or gesture combination. The device can ask for the PIN, pattern or password when unpinning.
  - Google notes that the steps vary by manufacturer and Android version.
- **"Stay awake" developer option:** keeps the screen on while the device is plugged in. Developer options have to be unlocked first by tapping Build number seven times [P6, VERIFIED, updated 2026-10-01].
- **Battery saver vs wake lock in Chrome:** no Google statement found. The spec allows the browser to refuse a lock in power-saving mode [W4]. UNVERIFIED for Chrome (test).

### 2d. Fire tablets

- **Screen timeout:** Settings > Display (or Display & Sounds) > Display Sleep (or Sleep), then pick seconds or minutes. Amazon's page doesn't mention a "Never" option [P7, VERIFIED]. Press coverage says Fire tablets go dark within 15 seconds to 30 minutes even when plugged in, and suggests a developer-options workaround [P11, SNIPPET].
- **Show Mode** [P8, VERIFIED]:
  - Supported on Fire HD 8 (7th, 8th, 10th gen) and Fire HD 10 (7th, 9th, 11th gen).
  - Not supported on Fire 7 (any gen), Fire HD 8 (12th gen), Fire Max 11, or Fire HD 10 (13th gen).
  - *Analysis:* Show Mode turns the tablet into an Echo Show-style Alexa screen, so it isn't a way to keep a Silk page on screen. The description comes from press coverage (SNIPPET).
- **Screen pinning on Fire OS:** only third-party guides were found (Settings > Security > Screen pinning) [P10, SNIPPET].
- **Power saving:** Amazon's tips include Battery Saver / Low Power Mode (8th gen and newer) and "Smart Suspend", which disconnects from the network when idle [P9, VERIFIED]. *Analysis:* Smart Suspend matters little because Day Clock works offline.

### 2e. How hard is this for a non-technical caregiver? (*Analysis*)

| Method | Effort | Main failure mode |
|---|---|---|
| iPad: Auto-Lock to Never + Safari tab | Low (one setting) | A tap leaves fullscreen or the page; screen stays lit at night; it all resets after an update or restart |
| iPad: Guided Access | Moderate (about 6 to 8 steps, plus a separate passcode and triple-click gestures) | Caregiver forgets the passcode or how to exit; after a restart someone has to re-enter it (UNVERIFIED) |
| Android app pinning | Moderate (menu location varies by maker) | Unpin gesture triggered by accident; steps differ per device |
| Android "Stay awake" | High (hidden developer menu) | Caregivers unlikely to find it; changes other settings nearby |
| Fire tablets | High / uncertain (no documented "never sleep", Show Mode not usable, pinning steps only from third parties) | Screen sleeps despite the wake lock if Silk lacks support |

---

## 3. Always-on hazards and reliability (only what sources say)

### 3a. Battery, heat, charge limits

- **Apple, "About charging and maintaining your iPad battery"** [B1, VERIFIED, Jan 27, 2026]:
  - The iPad stops charging when full and resumes below 95%, so leaving it connected overnight is fine.
  - Time spent fully charged adds wear, so Apple suggests unplugging after a full charge when possible.
  - The **80% Limit** is offered only on iPad Pro (M4) and later, iPad Air (M2) and later, iPad mini (A17 Pro) and iPad (A16), under Settings > Battery > Battery Health. The iPad still tops up to 100% occasionally to calibrate.
  - Ideal room temperature is 16 to 22 °C. Using or charging above 35 °C ambient can permanently shorten battery life, and software may hold charging above 80% when the battery is too warm.
  - Batteries are designed to keep 80% of their capacity at 1,000 full cycles.
  - The page doesn't mention "Optimized Battery Charging" for iPad. Older iPads, which are the likely spare tablets, have no charge-limit setting under this article.
- **Samsung:** Battery protection limits charging to 80% or a set level to protect long-term battery health. It's under Settings > Battery > Battery protection, and with Sleep time protection it pauses at 80% overnight [B2, VERIFIED].
- **Amazon:** no guidance on charging or always-on use was found on the Amazon help pages that loaded. Amazon's power tips cover timeout, dimming and Battery Saver [P9, VERIFIED]. The main amazon.com help site blocked automated access, so it couldn't be checked (UNVERIFIED).
- **Battery University** (Cadex-sponsored reference; updated Oct 11, 2023) [B3, VERIFIED]:
  - A full charge combined with heat is the worst case for lithium-ion wear.
  - Leaving a device plugged in is generally acceptable because the charger stops at full.
  - Charging to a lower peak (about 80%) roughly doubles cycle life.
- **Swelling:** no Apple, Samsung or Amazon tablet guidance found in this pass ties always-on charging to swelling. Press and community sources advise stopping use of, and not charging, a visibly swollen device [B4, SNIPPET].
  - *Analysis:* don't say that 24/7 charging is either "safe" or "dangerous". Repeat Apple's temperature advice and suggest a periodic look for a bulging case or a lifting screen.

### 3b. Screen burn-in

- **LCD/IPS panels** (most older iPads and many Android and Fire tablets): Apple describes image persistence on IPS displays as temporary, fading with time. It can be prevented with display sleep or a screen saver [D1, VERIFIED; archived page, Aug 4, 2023].
- **OLED panels:** Apple says OLED can show temporary image persistence and, in extreme cases, burn-in. This is linked to showing the same high-contrast image at high brightness for long periods, and auto-brightness reduces the effect [D2, VERIFIED, iPhone article, June 1, 2026].
  - iPad Pro (M4, May 2024) uses tandem OLED [D3, VERIFIED].
  - Samsung's OLED monitor page describes static images becoming a permanent fixture, and lists pixel shift and pixel refresh as counter-measures [D4, VERIFIED; it covers monitors, not tablets]. Which Galaxy Tab models use OLED is UNVERIFIED.
- *Analysis:* a clock is the textbook static, high-contrast image. Day Clock's dim night colours help. A slow pixel shift of a few pixels per hour, plus avoiding maximum brightness, would reduce OLED risk further.

### 3c. Updates, restarts, reloads, storage

- **Automatic iPadOS updates:**
  - With Automatically Install on, updates download and install overnight while the device is charging and on Wi-Fi. The user is notified first [U1, VERIFIED, Sept 15, 2026].
  - Users can turn off automatic install of version updates while keeping System Files updates automatic [U1].
  - That installing an update restarts the device is standard behaviour, but the page doesn't state it (UNVERIFIED).
  - After a restart the passcode is required [P4, VERIFIED], so the clock stays down until someone unlocks the iPad.
- **Safari reloading or killing the page under memory pressure:** no official Apple statement was found. Developer reports exist, but none were verified (UNVERIFIED). Test multi-day runs on the oldest supported iPads.
- **Safari's 7-day storage cap** [U2, VERIFIED, WebKit, Mar 24, 2020]:
  - After seven days of Safari use with no user interaction on the site, Safari deletes the site's localStorage, IndexedDB, service worker registrations and cache.
  - Home Screen web apps have their own counter and aren't expected to lose first-party data.
  - *Analysis:* Day Clock re-saving settings while open protects the settings. A deleted service-worker cache could still stop an offline reload. On iPadOS 18.4+ the Home Screen web app is the better mode, since it gets both the wake lock and the storage exemption. On older iPads it's a trade-off.
- **Wi-Fi drops:** Day Clock works offline after the first visit, and time comes from the device clock. *Analysis:* Wi-Fi outages are low risk.
- **Android/Chrome:** whether Play Store auto-updates of Chrome or WebView interrupt a foreground tab is UNVERIFIED (test).

---

## 4. Medical-device boundary

### 4a. United States (FDA)

- **What counts as a device:** something intended for diagnosis of disease, or for the cure, mitigation, treatment or prevention of disease, or intended to affect the structure or function of the body. Software functions excluded under §520(o) are not devices [R1, VERIFIED].
- **Intended use is judged from what the seller says and does.** Under 21 CFR 801.4 it is the seller's "objective intent", shown by labeling claims, advertising, oral or written statements, product design, and the circumstances of distribution [R2, VERIFIED]. *Analysis:* a disclaimer does not override marketing claims.
- **General Wellness guidance (final, issued Jan 6, 2026)** [R3][R4, VERIFIED]:
  - The 21st Century Cures Act excludes from the device definition software meant to maintain or encourage a healthy lifestyle that is unrelated to diagnosing or treating disease (PDF p. 4).
  - Category 1 covers claims with no disease reference, such as mental acuity, relaxation, sleep management and learning capacity.
  - Category 2 covers healthy-lifestyle choices that "may help living well with" chronic conditions where that link is well accepted (PDF pp. 6–8).
  - A claim "to restore a structure or function impaired due to a disease or condition" is outside category 1 and "might be regulated" (PDF p. 7, footnote 6).
  - In the section on physiologic-sensing products, the guidance says a product is not general wellness if its labeling or user interface refers to specific diseases, gives alerts recommending clinical action, or targets management of a disease (PDF p. 9).
  - *Analysis:* a clock marketed "for people with dementia" doesn't fit neatly under general wellness. It is not automatically a device either. That depends on whether the claims amount to treating, mitigating or compensating for the disease.
- **Device Software Functions policy (Sept 2022)** [R5][R6][R7, VERIFIED]:
  - FDA *does* treat "medication reminders" (product code NXQ: alerts for pre-set dosing schedules) as devices, under 21 CFR 890.5050, "Daily activity assist device". It says it intends **not to enforce** requirements for them (PDF p. 18, footnote 45). The enforcement-discretion examples are on PDF pp. 28–29.
  - Its enforcement-discretion examples include software that tracks medications and gives "user-configured reminders for improved medication adherence" (example 11), and reminders for specific patient groups (example 2).
  - Appointment reminders, note-taking and "brain age" games appear among functions that are **not** devices [R8, VERIFIED].
  - 21 CFR 890.5050 is Class I, exempt from premarket notification, and (if not sterile) exempt from good-manufacturing-practice requirements except records and complaint files [R9, VERIFIED].
- **Clinical Decision Support guidance (final, Jan 2026)** [R10, VERIFIED]: covers decision support. FDA's digital-health policies still apply to device software meant for patients or caregivers. *Analysis:* Day Clock makes no clinical recommendations, so this guidance doesn't apply.
- **FTC (advertising, which applies whatever FDA's status):** health-benefit claims for any health product, apps included, need "competent and reliable scientific evidence", generally randomized controlled trials. Disclaimers don't cure misleading claims [R11, VERIFIED; the fetched text showed no issue date].

### 4b. United Kingdom (MHRA)

The MHRA's "stand-alone software including apps" guidance (v1.10g; GOV.UK page last updated 1 July 2023) [M1][M2, VERIFIED] says:
- **Compensation for a handicap** is a medical purpose (PDF p. 23). It covers software that the *manufacturer claims* compensates for a handicap, but not general-use products that people happen to use that way.
  - Example: a text magnifier marketed for people with visual impairment "may be" a device, while the same magnifier with no mention of visual impairment is "unlikely" to be one.
  - Indicative words include "Helps" and "Corrects". The guidance says there "needs to be a link to a specific injury or handicap".
- **Alleviation** (PDF p. 22):
  - Apps "intended to remind users that medicines are taken" are *unlikely* to be devices.
  - Apps intended to treat neurodegenerative conditions *may* be devices.
  - Indicative phrases include "Can benefit those who suffer from…" and "Help/help with…".
- Purely administrative functions, such as booking appointments, are unlikely to be devices (PDF p. 10).

*Analysis:* by MHRA's own logic, "a clock that helps people with memory loss or dementia stay oriented" names a specific condition and uses "helps". That reads close to the compensation examples that "may be devices". A neutral "large, easy-to-read calendar clock" would be on the "unlikely" side. Get regulatory advice before using condition-specific claims for UK users.

### 4c. European Union (MDR)

- The MDR definition includes "diagnosis, monitoring, treatment, alleviation of, or compensation for, an injury or disability" [E2, VERIFIED, MDCG 2019-11 rev.1, June 2025, PDF p. 6].
- Software meant only for non-medical purposes ("wellness or fitness apps" among them) doesn't qualify as medical device software (PDF p. 10).
- The intended purpose must be clearly defined. Medical claims must be backed by clinical evidence, or the product can't carry CE marking or make those claims (PDF p. 8).
- *Analysis:* same conclusion as the UK. Condition-specific "compensation" wording is the risk.

### 4d. Claims that push toward "medical device" (*Analysis*, built on 4a–4c)

| Claim or feature | Why it's risky |
|---|---|
| "Treats", "slows", "improves" dementia or memory; "clinically proven" | Disease treatment or mitigation (FDA 201(h)); FTC substantiation |
| "Reduces agitation, sundowning, anxiety or confusion" | Alleviation of disease symptoms (MHRA, MDR); FTC substantiation |
| "Prevents wandering or falls", "keeps them safe" | Prevention or monitoring of disease or injury; implies safety reliance |
| "Manages medications", adherence tracking, escalating alerts, dose confirmation | FDA product code NXQ is a device (currently under enforcement discretion); "medication management" as a safety function invites reliance and liability |
| "Designed for Alzheimer's patients / compensates for memory loss" | Compensation for a handicap or disability (MHRA, MDR); outside general wellness (FDA) |

### 4e. What dedicated dementia-clock makers claim and disclaim (VERIFIED unless marked)

- **American Lifetime "Day Clock"** (US, $59.95–$189.95) [C1]:
  - Its slogan pitches the clock's clarity at people whose memory is fading.
  - The product URL mentions dementia, yet the page says its products and packaging don't talk about aging, memory loss or dementia (a dignity-focused positioning).
  - No medical disclaimer found.
- **Alzheimer's Society shop** (UK charity, about 28 clocks, many eligible for VAT relief) [C2]:
  - Day Connect is described as made to help people living with dementia keep track of the time and date. Its auto-dimming can't be turned off [C3].
  - The dual-display clock says it is designed to reduce confusion [C4].
  - No medical-device statements or disclaimers.
- **Idem smart reminder clock** (£268.88) [C5]: the shop says its products are tested and reviewed by people living with dementia and their carers. No medical-device statement.
- **RecallCue** (iPad clock plus caregiver iPhone app) [C6]: the disclaimer says it is "not intended to cure dementia or mild cognitive impairment (MCI)".
- **Another iPad app is called "Day Clock"** (Technology4Seniors) [C7, SNIPPET; the listing was rate-limited]. Note this name clash.
- *Pattern:* condition-targeted marketing is common, and explicit regulatory disclaimers are rare. A "not a cure" line doesn't override condition-specific claims (see 4a, 21 CFR 801.4 and FTC).

---

## 5. Accessibility and readability

- **NHS** (reviewed Jan 23, 2025) [H1, VERIFIED]:
  - Recommends clocks with large LCD displays showing day, date and time.
  - Lighting should be bright and even, and glare, shadows and reflections reduced.
  - The bedroom should be darkenable at night to help sleep.
- **Social Care Wales** (updated Feb 6, 2025) [H2, VERIFIED]:
  - Dementia-friendly clocks clearly show day or night, the day of the week and the month. A large analogue face with clear numbers may help, and apps with time, day and date reminders exist.
  - Avoid reflections from windows and overhead lights.
  - Older eyes may need up to 60% more light. Use strong contrasting colours; red is the colour older eyes see most clearly.
  - Lighting changes may ease sundowning, and a bathroom light left on at night helps.
- **Alzheimer's Association** (sundowning) [H3, VERIFIED]:
  - Keep the home well lit in the evening, since low light makes shadows that confuse.
  - Gently remind the person of the time.
  - Cut evening stimulation, such as TV.
- **W3C WAI and WCAG** [H4][H5, VERIFIED]:
  - Older users often have reduced contrast sensitivity and colour perception, and short-term memory or distraction problems (updated Nov 20, 2025).
  - WCAG ties the 4.5:1 contrast ratio to roughly 20/40 vision, typical at about age 80. The 7:1 (AAA) ratio compensates for vision loss equivalent to roughly 20/80.
- **What products actually do** [C3][C4][C6, VERIFIED]:
  - Part-of-day words, with boundaries the user can adjust. One clock moves "morning" to start at 5 or 8 am.
  - A simplified sentence mode, e.g. "Now it's Sunday afternoon".
  - 12- or 24-hour time and day/month order options.
  - Automatic dimming, white-on-black display, automatic daylight-saving changes, a backup battery, and agenda views.
- **University of Stirling DSDC:** the free web pages fetched had no clock-specific guidance. Its design guidance appears to sit in publications and audit services [H6, VERIFIED for what was observed]. See Open items.
- **12- vs 24-hour:** no official guidance found. Products offer both. *Analysis:* default to the locale's convention and let caregivers change it.
- **Anecdotal** (Alzheimer's Society forum, SNIPPET [H7]): benefits can fade as dementia progresses, a clock that shows the wrong time loses trust and gets discarded, and some carers doubt sun and moon icons help.
- *Analysis, night mode:* guidance pulls two ways. The NHS wants a dark bedroom, while the Alzheimer's Association and Social Care Wales want evenings well lit. Day Clock's dim amber night palette fits. Advise caregivers to place the tablet outside the bedroom, or set brightness very low, and to keep the words "Night" visible.

---

## 6. Remote updates

### 6a. Competitors (VERIFIED unless marked)

| Product | Remote update mechanism | Cost | Account and privacy |
|---|---|---|---|
| Amazon Echo Show / **Alexa Together** | "Remote Assist", if the older person enabled it, let a caregiver set reminders and contacts; also activity alerts | $19.99/month or $199/year; **an update dated May 21, 2025 says Alexa Together is no longer available** [X1] | Amazon accounts; activity feed visible to the care circle |
| **Alexa Emergency Assist** (Amazon's pointer after Alexa Together) | Emergency calling and alerts to up to 25 contacts; remote reminders not mentioned | Subscription; price not on the page [X2] | Amazon profile per household member; location sharing for responders; profile can hold health conditions and medications |
| Remote reminders on someone else's Echo today | n/a | n/a | UNVERIFIED (amazon.com help blocked automated access) |
| **Skylight** Frame / Calendar | Photos sent by email or app; Plus adds remote settings and albums | Frame Plus $39/year; Calendar Plus $79/year [X3][X4][X5] | Family members create an account and link to the device [X5] |
| **GrandPad** | Closed "family circle" via companion app; the app is only for current GrandPad members | Tiers reportedly about $25–$65/month plus a device of about $349–$399 [X7, SNIPPET; official page didn't render] | App lists contact info, identifiers, usage and diagnostics as linked to the user [X6] |
| **RecallCue** | Caregiver iPhone sends reminders, messages, photos and video check-ins to the iPad clock | Pro $9.99/month or $99.99/year [C6] | Name and email linked to the user [C6] |
| **Idem** reminder clock | Free app; family manage reminders, messages and photos remotely | £268.88 device; no subscription for reminders; video calling subscription new in 2026 [C5] | Wi-Fi or cellular; the app can tell family if a reminder wasn't seen |

### 6b. What remote updates would require (*Analysis*, with cited mechanics)

- **Technically**, the caregiver's phone and the clock need a meeting point, which means a server or a third-party relay plus some identity scheme (accounts, pairing codes or secret links).
  - Web Push needs an application server that holds each subscription's endpoint, and that endpoint must be kept secret [X8, VERIFIED].
  - This conflicts with every relevant hard limit in the Factory Constitution: static only, no backend, no accounts, no secrets, no keyed services. The constitution says to change the idea in that case.
- **On privacy**, the operator would hold health-adjacent data about an older adult: medication names and times, visitors' names, photos, routines. That brings breach-notification exposure (§7), consumer-health-data obligations (consent, a privacy-policy link, deletion), security and retention duties, and decisions about which family members can see or edit what.
- **Options that fit within the limits** (not truly "remote"):
  - Editing on the tablet itself (current).
  - Exporting settings as a file or link. A URL fragment (`#…`) is never sent to the server [X9, VERIFIED], but the link becomes a copy of the data inside whatever messaging app carries it.
  - A printed setup sheet.

---

## 7. Privacy

- **Is the content sensitive?** *Analysis:* yes, it's health-adjacent.
  - Washington's My Health My Data Act defines consumer health data broadly. It includes data identifying physical or mental health status, use or purchase of prescribed medication, and inferences drawn from non-health data [Y3, VERIFIED].
  - The FTC treats medication information as identifiable health data in its breach examples [Y2, VERIFIED].
  - A reminder like "Take Aricept 8am", or a list of visitors' names, is personal and can reveal health status.
- **HIPAA:** the FTC tool (built with HHS OCR, ONC and FDA) says HIPAA covers health plans, most providers and clearinghouses, and their business associates. It "likely wouldn't apply" to an app not offered by such an entity [Y1, VERIFIED, Nov 2024]. HHS's own health-app pages returned 403 to automated fetches [Y5][Y6, UNVERIFIED this pass]. *Analysis:* Day Clock, a free consumer tool not offered for any provider, is outside HIPAA. Never call it "HIPAA compliant".
- **FTC Health Breach Notification Rule** (business guidance, July 2024, edited Jan 2025) [Y2, VERIFIED]:
  - It covers vendors of personal health records (PHRs) and related entities that HIPAA doesn't cover.
  - A PHR is an electronic record of identifiable health information that can technically draw from multiple sources and is managed by or primarily for the individual.
  - Unauthorized *disclosure* counts as a breach, not only hacking. Penalties run up to $53,088 per violation.
- **Washington MHMDA** [Y3][Y4, VERIFIED]:
  - It applies to entities that do business in Washington or target Washington consumers and decide the purpose and means of collecting, processing, sharing or selling consumer health data.
  - "Collect" is broad (access, retain, receive, infer, process "in any manner").
  - Compliance dates: Mar 31, 2024, and Jun 30, 2024 for small businesses.
  - Obligations include a consumer-health-data privacy policy linked from the homepage, consent, and deletion rights.
  - Violations are per se violations of the state Consumer Protection Act, with a private right of action.
  - Other states' consumer-health-data laws (e.g., Nevada, Connecticut) weren't checked (UNVERIFIED).
- **The current no-server Day Clock:**
  - Settings live in the tablet's localStorage, the repo has no analytics or third-party scripts, and the service worker caches only the site's own files (repo check, VERIFIED).
  - *Analysis:* with no PHR held by a vendor and nothing transmitted, there is little or no HBNR or MHMDA exposure. Whether running code in the visitor's browser counts as "processing" under the MHMDA is a legal question; the Washington AG page doesn't address it.
  - Residual exposures:
    - GitHub Pages logs every visitor's IP address for security, though not their settings [Y8, VERIFIED].
    - **Read-aloud may leave the device.** Some speech voices are remote services (`localService === false`) [Y7, VERIFIED]. Day Clock speaks due reminder text using the browser's default voice with no local-voice check (repo, VERIFIED). Whether the default voice is remote depends on the platform (UNVERIFIED).
    - Anyone near the tablet can read the reminders (by design).
  - Any "nothing leaves this tablet" claim must be accurate (FTC Act §5 [Y1]).
- **A hypothetical cloud version** (*Analysis*):
  - Likely within the MHMDA if it serves Washington users, and possibly the HBNR (for example, caregiver input plus calendar sync could make it a PHR).
  - It would need a privacy policy, consent flows, deletion, a security programme and a breach plan. It would also break the constitution's hard limits.

---

## Practical product implications

### What to say (lower risk)
- Describe the function: "A large, simple calendar clock for a spare tablet: day of the week, part of the day, date and time, with optional reminders you type in." (Grounded in the MHRA, MDR and FDA "general use" logic in §4.)
- Describe the audience neutrally: "for anyone who wants an easy-to-read day clock, including older relatives." Keep condition names out of headlines and claims, especially for UK and EU audiences.
- Set expectations plainly: "Not a medical device. Doesn't replace care or supervision. Don't rely on it for medication timing, alarms or safety." This helps but can't fix claims made elsewhere (FTC, 21 CFR 801.4).
- State privacy accurately: "Your settings stay in this tablet's browser. We don't receive them." Make it fully true by preferring local voices, or caveat read-aloud.
- Give device setup guidance: keep it plugged in; lower brightness at night; place it away from windows (glare); on iPad, use Auto-Lock Never or Guided Access; after an update or restart, unlock and reopen the page; check it each morning.

### What not to say
- "Treats", "slows", "improves", "clinically proven"; "reduces agitation, sundowning or anxiety"; "prevents wandering or falls"; "keeps them safe".
- "Manages medications" or "never miss a dose".
- "Designed for Alzheimer's patients" or "compensates for memory loss", especially for the UK and EU.
- "HIPAA compliant"; "always on"; "works on any tablet".

### What reduces risk (product and engineering)
- **Make wake-lock status visible.** The hook already returns `null` when unsupported. If standalone mode is detected on iPadOS earlier than 18.4, or on Silk without wake lock, show "The screen may turn off. Set Auto-Lock to Never or use a Safari tab."
- **State the supported devices plainly:** iPad 5th gen, Air 3rd gen, mini 5th gen or newer, or any iPad Pro; Android 7+ with current Chrome or Samsung Internet; Fire tablets untested.
- **Prefer local voices** (`voice.localService === true`), and fall back to silence rather than a remote voice.
- **Reduce burn-in:** a slow pixel shift and night dimming; no maximum brightness by default.
- **Keep reminders "display only":** no adherence tracking, confirmations or escalation. Encourage short wording ("Morning tablets") over drug names and diagnoses.
- **Provide a one-page printable setup card** per platform (iPad, Android, Fire), covering what to do after a restart.

### What would trigger heavy obligations
- Condition-specific treatment, alleviation or compensation claims would bring FDA device status (perhaps under enforcement discretion, but still a device), UKCA/CE medical device duties under the UK MDR and EU MDR (quality system, clinical evidence, vigilance), and FTC substantiation.
- Medication-management safety features (adherence logs, missed-dose alerts to family, dose confirmation, dosing logic) would put the product in device territory (NXQ) and invite reliance and liability.
- Remote updates, cloud sync, accounts, push messages or caregiver apps would break the constitution's hard limits and bring HBNR, MHMDA and (in the EU) special-category data duties, plus security and breach response.
- Monitoring features (inactivity alerts, wandering detection, camera or voice) would be device-like ("monitoring" in the EU definition) and highly privacy-sensitive.

---

## Open items

1. **Device tests:**
   - iPad 5th or 6th gen (iPadOS 16.7/17.7): wake lock in a Safari tab vs a Home Screen web app.
   - iPadOS 18.4+: Home Screen web app.
   - Wake lock with Low Power Mode on.
   - Chrome Android with Battery Saver; Samsung Internet.
   - Fire OS 5, 7 and 8 Silk: does `navigator.wakeLock` exist, and which Chromium version shows in the user agent?
2. Does Guided Access persist after a restart? Rehearse recovery after an overnight iPadOS auto-update.
3. Multi-day stability (memory pressure reloads, sleep and wake) on the oldest supported iPad.
4. Safari 7-day cap: does a tap on the clock count as interaction? Does service-worker eviction break an offline reload?
5. Echo Show: can family set reminders remotely on another person's Echo now that Alexa Together has ended? (Amazon help blocked automated fetches.)
6. GrandPad official pricing (official site didn't render; retailer blocked).
7. University of Stirling DSDC clock and calendar guidance (publications, likely paid); any official 12- vs 24-hour guidance.
8. Apple guidance for continuously powered iPads (a "charge management" feature mentioned in community answers wasn't found on Apple's site); official tablet battery-swelling guidance.
9. Fire OS screen-pinning steps from Amazon (only third-party guides found); the Fire tablet maximum screen timeout.
10. Which Samsung Galaxy Tab models use OLED panels.
11. Name clash: "Day Clock" is used by American Lifetime and an App Store app; trademark status not researched.
12. Counsel review: condition-specific wording in the US, UK and EU; whether local-only processing falls under the MHMDA; wording of the privacy statement.
13. Clinical evidence on orientation clocks wasn't reviewed (needs the LibKey connector under organization policy).

---

## Sources

Fetched 2026-10-11 unless noted. Dates are those shown on each page.

**Q1: devices**
- [A1] Apple Developer, App Store usage (iPadOS shares, measured June 7, 2026). VERIFIED. https://developer.apple.com/support/app-store/
- [A2] Apple security releases list. VERIFIED. https://support.apple.com/en-us/100100
- [A3] About the security content of iOS 27 and iPadOS 27 (Sept 14, 2026). VERIFIED. https://support.apple.com/en-us/149034
- [A4] iOS/iPadOS 26.7.1 (Sept 28, 2026). VERIFIED. https://support.apple.com/en-us/149226
- [A5] iOS/iPadOS 18.7.10 (Aug 17, 2026). VERIFIED. https://support.apple.com/en-us/148287
- [A6] iPadOS 17.7.11 (May 11, 2026). VERIFIED. https://support.apple.com/en-us/127112
- [A7] iOS/iPadOS 16.7.16 (May 11, 2026). VERIFIED. https://support.apple.com/en-us/127113
- [A8] iOS/iPadOS 15.8.8 (May 11, 2026). VERIFIED. https://support.apple.com/en-us/127114
- [A9] iOS 12.5.7 (Jan 23, 2023). VERIFIED. https://support.apple.com/en-us/103015
- [S1] Asymco, Apple active-device count (search result only). SNIPPET. https://asymco.com/2026/02/02/1-7-billion-customers/
- [G1] Google, Chrome Enterprise system requirements ("Android 10 or later"). VERIFIED. https://support.google.com/chrome/a/answer/7100626
- [G2] 9to5Google, Chrome 138 last for Android 8/9 (June 26, 2025). VERIFIED. https://9to5google.com/2025/06/26/google-chrome-android-versions-no-longer-supported-2025/
- [G3] Google Chrome Community, "Sunsetting Chrome support for Android 8.0 and 9.0" (didn't render). SNIPPET. https://support.google.com/chrome/thread/352616098/sunsetting-chrome-support-for-android-8-0-oreo-and-android-9-0-pie?hl=en
- [G4] 9to5Google, Chrome 119 last for Android 7 (Nov 27, 2023; cites Google's Chrome Enterprise release notes). VERIFIED. https://9to5google.com/2023/11/27/google-chrome-calendar-older-android-version-support/
- [G5] TuttoAndroid, Chrome 106 last for Android 6; 107 needs Android 7 (Oct 27, 2022). VERIFIED (secondary). https://www.tuttoandroid.net/news/2022/10/27/google-chrome-fine-supporto-android-6-marshmallow-967448/
- [F1] Amazon Developer, Fire tablet specs: Fire models. VERIFIED. https://developer.amazon.com/docs/device-specs/ft-device-specifications-fire-models.html
- [F2] Amazon Developer, Fire tablet specs: Fire HD models. VERIFIED. https://developer.amazon.com/docs/device-specs/ft-device-specifications-firehd-models.html
- [F3] Amazon Developer, Fire OS 8. VERIFIED. https://developer.amazon.com/docs/fire-tablets/fire-os-8.html
- [F4] AWS docs, What is Amazon Silk? VERIFIED. https://docs.aws.amazon.com/silk/latest/developerguide/what-is-silk.html
- [F5] AWS docs, Silk user agent strings. VERIFIED. https://docs.aws.amazon.com/silk/latest/developerguide/user-agent.html

**Q2: keeping the screen on**
- [W1] MDN browser-compat-data, WakeLock (incl. Safari iOS Home Screen note, WebKit bug 254545). VERIFIED. https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/WakeLock.json
- [W2] MDN, Screen Wake Lock API. VERIFIED. https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
- [W3] MDN, WakeLock.request(). VERIFIED. https://developer.mozilla.org/en-US/docs/Web/API/WakeLock/request
- [W4] W3C, Screen Wake Lock API (TR draft). VERIFIED. https://www.w3.org/TR/screen-wake-lock/
- [W5] Chrome for Developers, Screen Wake Lock. VERIFIED. https://developer.chrome.com/docs/capabilities/web-apis/wake-lock
- [W6] caniuse data, Fullscreen API (note 5: iPad only). VERIFIED. https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/fullscreen.json
- [P1] Apple, Use Low Power Mode on iPhone or iPad (Sept 21, 2026). VERIFIED. https://support.apple.com/en-us/101604
- [P2] Apple, Use Guided Access on iPhone or iPad (July 24, 2026). VERIFIED. https://support.apple.com/en-us/111795
- [P3] Apple iPad User Guide, Keep the iPad display on longer (title only; steps didn't render). UNVERIFIED for steps. https://support.apple.com/guide/ipad/keep-the-ipad-display-on-longer-ipad11dbabaf/ipados
- [P4] Apple, About Face ID advanced technology (passcode after restart; Sept 18, 2026). VERIFIED. https://support.apple.com/en-us/102381
- [P5] Google Android Help, Pin & unpin screens. VERIFIED. https://support.google.com/android/answer/9455138
- [P6] Android Developers, Configure on-device developer options ("Stay awake"; updated 2026-10-01). VERIFIED. https://developer.android.com/studio/debug/dev-options
- [P7] Amazon Help, Adjust the timeout of your Fire tablet screen. VERIFIED. https://digprjsurvey.amazon.com/csad/help/node/GVQ97S4F8BHZR7P2
- [P8] Amazon Help, Switch to Show Mode on your Fire tablet. VERIFIED. https://digprjsurvey.amazon.com/csad/help/node/G3JEMFDNH3FPB4XS
- [P9] Amazon Help, Conserve power in your Fire tablet. VERIFIED. https://digprjsurvey.amazon.com/csad/help/node/GKSPTVVFSR25BQMP
- [P10] DevicesFAQ, Fire HD 10 (2021) screen pinning (third party). SNIPPET. https://www.devicesfaq.com/en/pin-screen/amazon-fire-hd-10-2021
- [P11] Arkansas Democrat-Gazette (Apr 1, 2023), Fire tablet vs Echo Show. SNIPPET. https://www.arkansasonline.com/news/2023/apr/01/playing-with-fire-leads-to-speaker-smart-speaker/

**Q3: hazards and reliability**
- [B1] Apple, About charging and maintaining your iPad battery (Jan 27, 2026). VERIFIED. https://support.apple.com/en-us/118418
- [B2] Samsung US, Battery not charging past 80% or 85% (Battery protection). VERIFIED. https://www.samsung.com/us/support/troubleshoot/TSG10013504/
- [B3] Battery University (Cadex), BU-808 How to Prolong Lithium-based Batteries (updated Oct 11, 2023). VERIFIED. https://batteryuniversity.com/article/bu-808-how-to-prolong-lithium-based-batteries
- [B4] SamMobile, What causes phone batteries to swell. SNIPPET. https://www.sammobile.com/news/what-causes-phone-batteries-to-swell-or-expand/
- [D1] Apple, Avoiding image persistence on Apple displays (archived; Aug 4, 2023). VERIFIED. https://support.apple.com/en-us/HT202580
- [D2] Apple, About the Super Retina and Super Retina XDR display on your iPhone (June 1, 2026). VERIFIED. https://support.apple.com/en-us/HT208191
- [D3] Apple Newsroom, new iPad Pro with tandem OLED (May 7, 2024). VERIFIED. https://www.apple.com/newsroom/2024/05/apple-unveils-stunning-new-ipad-pro-with-m4-chip-and-apple-pencil-pro/
- [D4] Samsung US, Prevent burn-in on Samsung OLED monitor. VERIFIED. https://www.samsung.com/us/support/troubleshoot/TSG10003240/
- [U1] Apple, Update your iPhone or iPad (Sept 15, 2026). VERIFIED. https://support.apple.com/en-us/118575
- [U2] WebKit blog, Full Third-Party Cookie Blocking and More (7-day cap; Mar 24, 2020). VERIFIED. https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/

**Q4: medical-device boundary and makers**
- [R1] FDA, How to Determine if Your Product is a Medical Device (09/29/2022). VERIFIED. https://www.fda.gov/medical-devices/classify-your-medical-device/how-determine-if-your-product-medical-device
- [R2] 21 CFR 801.4, Meaning of intended uses (Cornell LII). VERIFIED. https://www.law.cornell.edu/cfr/text/21/801.4
- [R3] FDA, General Wellness: Policy for Low Risk Devices, guidance page (final, Jan 2026). VERIFIED. https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
- [R4] FDA, General Wellness guidance PDF (issued Jan 6, 2026). VERIFIED. https://www.fda.gov/media/90652/download
- [R5] FDA, Policy for Device Software Functions and Mobile Medical Applications, page (Sept 2022). VERIFIED. https://www.fda.gov/regulatory-information/search-fda-guidance-documents/policy-device-software-functions-and-mobile-medical-applications
- [R6] FDA, Policy for Device Software Functions PDF (footnote 45 on NXQ; Appendix B examples). VERIFIED. https://www.fda.gov/media/80958/download
- [R7] FDA, Examples of software functions for which FDA will exercise enforcement discretion. VERIFIED. https://www.fda.gov/medical-devices/device-software-functions-including-mobile-medical-applications/examples-software-functions-which-fda-will-exercise-enforcement-discretion
- [R8] FDA, Examples of software functions that are not medical devices. VERIFIED. https://www.fda.gov/medical-devices/device-software-functions-including-mobile-medical-applications/examples-software-functions-are-not-medical-devices
- [R9] 21 CFR 890.5050, Daily activity assist device (Cornell LII). VERIFIED. https://www.law.cornell.edu/cfr/text/21/890.5050
- [R10] FDA, Clinical Decision Support Software guidance page (final, Jan 2026). VERIFIED. https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- [R11] FTC, Health Products Compliance Guidance. VERIFIED (no issue date in fetched text). https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
- [M1] MHRA, Medical devices: software applications (apps) (updated 1 July 2023). VERIFIED. https://www.gov.uk/government/publications/medical-devices-software-applications-apps
- [M2] MHRA, Medical device stand-alone software including apps (v1.10g PDF). VERIFIED. https://assets.publishing.service.gov.uk/media/6abf6c8c943e890cb55e5e52/Medical_device_stand-alone_software_including_apps__including_IVDMDs.pdf
- [E1] European Commission, MDCG 2019-11 rev.1 update notice (17 June 2025). VERIFIED. https://health.ec.europa.eu/latest-updates/update-mdcg-2019-11-rev1-qualification-and-classification-software-regulation-eu-2017745-and-2025-06-17_en
- [E2] MDCG 2019-11 rev.1 PDF (June 2025). VERIFIED. https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en?filename=mdcg_2019_11_en.pdf
- [C1] American Lifetime, Day Clock. VERIFIED. https://www.americanlifetime.com/
- [C2] Alzheimer's Society shop, Clocks. VERIFIED. https://shop.alzheimers.org.uk/collections/clocks
- [C3] Alzheimer's Society shop, Day Connect day clock. VERIFIED. https://shop.alzheimers.org.uk/products/day-connect-day-clock
- [C4] Alzheimer's Society shop, Dual-display dementia day clock. VERIFIED. https://shop.alzheimers.org.uk/products/dual-display-dementia-day-clock
- [C5] Alzheimer's Society shop, Idem smart reminder clock. VERIFIED. https://shop.alzheimers.org.uk/products/idem-smart-reminder-clock
- [C6] App Store, RecallCue. VERIFIED. https://apps.apple.com/us/app/recallcue/id1224175629
- [C7] App Store, Day Clock (Technology4Seniors) (fetch rate-limited). SNIPPET. https://apps.apple.com/us/app/day-clock/id6448065413

**Q5: readability**
- [H1] NHS, Making your home dementia friendly (reviewed Jan 23, 2025). VERIFIED. https://www.nhs.uk/conditions/dementia/living-with-dementia/home-environment/
- [H2] Social Care Wales, Dementia-friendly design (updated Feb 6, 2025). VERIFIED. https://socialcare.wales/service-improvement/dementia-friendly-design
- [H3] Alzheimer's Association, Sleep issues and sundowning. VERIFIED. https://www.alz.org/help-support/caregiving/stages-behaviors/sleep-issues-sundowning
- [H4] W3C WAI, Older users and web accessibility (updated Nov 20, 2025). VERIFIED. https://www.w3.org/WAI/older-users/
- [H5] W3C, Understanding WCAG 2.2 SC 1.4.6 Contrast (Enhanced). VERIFIED. https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html
- [H6] University of Stirling DSDC, home and Dementia-friendly House pages (no clock guidance found). VERIFIED. https://www.dementia.stir.ac.uk/ and https://www.dementia.stir.ac.uk/dementia-friendly-house
- [H7] Alzheimer's Society forum threads on dementia clocks (anecdotal). SNIPPET. https://forum.alzheimers.org.uk/threads/dementia-clocks.129038/
- [H8] NIA, Tips for coping with sundowning (blocked, HTTP 405). UNVERIFIED. https://www.nia.nih.gov/health/alzheimers-changes-behavior-and-communication/tips-coping-sundowning

**Q6: remote updates**
- [X1] About Amazon, Alexa Together article (update note May 21, 2025). VERIFIED. https://www.aboutamazon.com/news/devices/alexa-together-is-helping-bridge-the-miles-between-families
- [X2] About Amazon, Alexa Emergency Assist. VERIFIED. https://www.aboutamazon.com/news/devices/alexa-emergency-assist
- [X3] Skylight, home. VERIFIED. https://myskylight.com/
- [X4] Skylight, Calendar Plus ($79/yr). VERIFIED. https://myskylight.com/products/calendar-skylight-plus
- [X5] Skylight, Frame Plus ($39/yr). VERIFIED. https://myskylight.com/products/skylight-plus
- [X6] App Store, GrandPad companion app. VERIFIED. https://apps.apple.com/us/app/id904069946
- [X7] GrandPad pricing: Walmart listing (blocked) and secondary reviews. SNIPPET. https://www.walmart.com/ip/416284183 and https://www.seniorliving.org/cell-phone/consumer-cellular/grandpad/
- [X8] MDN, Push API. VERIFIED. https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- [X9] MDN, What is a URL? (fragment never sent to server). VERIFIED. https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL

**Q7: privacy**
- [Y1] FTC, Mobile Health Apps Interactive Tool (Nov 2024). VERIFIED. https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool
- [Y2] FTC, Complying with FTC's Health Breach Notification Rule (July 2024; edited Jan 2025). VERIFIED. https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
- [Y3] RCW 19.373.010, My Health My Data Act definitions. VERIFIED. https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010
- [Y4] Washington AG, Protecting Washingtonians' personal health data and privacy. VERIFIED. https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy
- [Y5] HHS OCR, Health apps (HTTP 403). UNVERIFIED. https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html
- [Y6] HHS OCR, Health App Use Scenarios & HIPAA, Feb 2016 (HTTP 403). UNVERIFIED. https://www.hhs.gov/sites/default/files/ocr-health-app-developer-scenarios-2-2016.pdf
- [Y7] MDN, SpeechSynthesisVoice.localService. VERIFIED. https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
- [Y8] GitHub Docs, About GitHub Pages (visitor IP logged). VERIFIED. https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
- Repo: `src/experiments/day-clock/index.tsx` (wake-lock hook, fullscreen check, speech code); `public/sw.js` (same-origin caching only). VERIFIED (local).

[A1]: https://developer.apple.com/support/app-store/
[A2]: https://support.apple.com/en-us/100100
[A3]: https://support.apple.com/en-us/149034
[A4]: https://support.apple.com/en-us/149226
[A5]: https://support.apple.com/en-us/148287
[A6]: https://support.apple.com/en-us/127112
[A7]: https://support.apple.com/en-us/127113
[A8]: https://support.apple.com/en-us/127114
[A9]: https://support.apple.com/en-us/103015
[S1]: https://asymco.com/2026/02/02/1-7-billion-customers/
[G1]: https://support.google.com/chrome/a/answer/7100626
[G2]: https://9to5google.com/2025/06/26/google-chrome-android-versions-no-longer-supported-2025/
[G3]: https://support.google.com/chrome/thread/352616098/sunsetting-chrome-support-for-android-8-0-oreo-and-android-9-0-pie?hl=en
[G4]: https://9to5google.com/2023/11/27/google-chrome-calendar-older-android-version-support/
[G5]: https://www.tuttoandroid.net/news/2022/10/27/google-chrome-fine-supporto-android-6-marshmallow-967448/
[F1]: https://developer.amazon.com/docs/device-specs/ft-device-specifications-fire-models.html
[F2]: https://developer.amazon.com/docs/device-specs/ft-device-specifications-firehd-models.html
[F3]: https://developer.amazon.com/docs/fire-tablets/fire-os-8.html
[F4]: https://docs.aws.amazon.com/silk/latest/developerguide/what-is-silk.html
[F5]: https://docs.aws.amazon.com/silk/latest/developerguide/user-agent.html
[W1]: https://raw.githubusercontent.com/mdn/browser-compat-data/main/api/WakeLock.json
[W2]: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
[W3]: https://developer.mozilla.org/en-US/docs/Web/API/WakeLock/request
[W4]: https://www.w3.org/TR/screen-wake-lock/
[W5]: https://developer.chrome.com/docs/capabilities/web-apis/wake-lock
[W6]: https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/fullscreen.json
[P1]: https://support.apple.com/en-us/101604
[P2]: https://support.apple.com/en-us/111795
[P3]: https://support.apple.com/guide/ipad/keep-the-ipad-display-on-longer-ipad11dbabaf/ipados
[P4]: https://support.apple.com/en-us/102381
[P5]: https://support.google.com/android/answer/9455138
[P6]: https://developer.android.com/studio/debug/dev-options
[P7]: https://digprjsurvey.amazon.com/csad/help/node/GVQ97S4F8BHZR7P2
[P8]: https://digprjsurvey.amazon.com/csad/help/node/G3JEMFDNH3FPB4XS
[P9]: https://digprjsurvey.amazon.com/csad/help/node/GKSPTVVFSR25BQMP
[P10]: https://www.devicesfaq.com/en/pin-screen/amazon-fire-hd-10-2021
[P11]: https://www.arkansasonline.com/news/2023/apr/01/playing-with-fire-leads-to-speaker-smart-speaker/
[B1]: https://support.apple.com/en-us/118418
[B2]: https://www.samsung.com/us/support/troubleshoot/TSG10013504/
[B3]: https://batteryuniversity.com/article/bu-808-how-to-prolong-lithium-based-batteries
[B4]: https://www.sammobile.com/news/what-causes-phone-batteries-to-swell-or-expand/
[D1]: https://support.apple.com/en-us/HT202580
[D2]: https://support.apple.com/en-us/HT208191
[D3]: https://www.apple.com/newsroom/2024/05/apple-unveils-stunning-new-ipad-pro-with-m4-chip-and-apple-pencil-pro/
[D4]: https://www.samsung.com/us/support/troubleshoot/TSG10003240/
[U1]: https://support.apple.com/en-us/118575
[U2]: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
[R1]: https://www.fda.gov/medical-devices/classify-your-medical-device/how-determine-if-your-product-medical-device
[R2]: https://www.law.cornell.edu/cfr/text/21/801.4
[R3]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
[R4]: https://www.fda.gov/media/90652/download
[R5]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/policy-device-software-functions-and-mobile-medical-applications
[R6]: https://www.fda.gov/media/80958/download
[R7]: https://www.fda.gov/medical-devices/device-software-functions-including-mobile-medical-applications/examples-software-functions-which-fda-will-exercise-enforcement-discretion
[R8]: https://www.fda.gov/medical-devices/device-software-functions-including-mobile-medical-applications/examples-software-functions-are-not-medical-devices
[R9]: https://www.law.cornell.edu/cfr/text/21/890.5050
[R10]: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
[R11]: https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance
[M1]: https://www.gov.uk/government/publications/medical-devices-software-applications-apps
[M2]: https://assets.publishing.service.gov.uk/media/6abf6c8c943e890cb55e5e52/Medical_device_stand-alone_software_including_apps__including_IVDMDs.pdf
[E1]: https://health.ec.europa.eu/latest-updates/update-mdcg-2019-11-rev1-qualification-and-classification-software-regulation-eu-2017745-and-2025-06-17_en
[E2]: https://health.ec.europa.eu/document/download/b45335c5-1679-4c71-a91c-fc7a4d37f12b_en?filename=mdcg_2019_11_en.pdf
[C1]: https://www.americanlifetime.com/
[C2]: https://shop.alzheimers.org.uk/collections/clocks
[C3]: https://shop.alzheimers.org.uk/products/day-connect-day-clock
[C4]: https://shop.alzheimers.org.uk/products/dual-display-dementia-day-clock
[C5]: https://shop.alzheimers.org.uk/products/idem-smart-reminder-clock
[C6]: https://apps.apple.com/us/app/recallcue/id1224175629
[C7]: https://apps.apple.com/us/app/day-clock/id6448065413
[H1]: https://www.nhs.uk/conditions/dementia/living-with-dementia/home-environment/
[H2]: https://socialcare.wales/service-improvement/dementia-friendly-design
[H3]: https://www.alz.org/help-support/caregiving/stages-behaviors/sleep-issues-sundowning
[H4]: https://www.w3.org/WAI/older-users/
[H5]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html
[H6]: https://www.dementia.stir.ac.uk/dementia-friendly-house
[H7]: https://forum.alzheimers.org.uk/threads/dementia-clocks.129038/
[H8]: https://www.nia.nih.gov/health/alzheimers-changes-behavior-and-communication/tips-coping-sundowning
[X1]: https://www.aboutamazon.com/news/devices/alexa-together-is-helping-bridge-the-miles-between-families
[X2]: https://www.aboutamazon.com/news/devices/alexa-emergency-assist
[X3]: https://myskylight.com/
[X4]: https://myskylight.com/products/calendar-skylight-plus
[X5]: https://myskylight.com/products/skylight-plus
[X6]: https://apps.apple.com/us/app/id904069946
[X7]: https://www.seniorliving.org/cell-phone/consumer-cellular/grandpad/
[X8]: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
[X9]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL
[Y1]: https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool
[Y2]: https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
[Y3]: https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.010
[Y4]: https://www.atg.wa.gov/protecting-washingtonians-personal-health-data-and-privacy
[Y5]: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html
[Y6]: https://www.hhs.gov/sites/default/files/ocr-health-app-developer-scenarios-2-2016.pdf
[Y7]: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
[Y8]: https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
