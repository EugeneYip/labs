# Risk and compliance: Day Clock

Comparative Research (2026-10-11). **Not medical or legal advice.** Full evidence: `notes/device-risk-notes.md` (about 90 sources: Apple, Google, Amazon, Samsung, W3C, MDN, WebKit, FDA, MHRA, EU MDR, HHS, FTC, state law) and `notes/market-notes.md` §1.4. Labels: **[V]** read on the source; **[S]** snippet; **[U]** inference.

## Summary

| Area | Current Labs version | Hypothetical standalone |
|---|---|---|
| Medical-device boundary | Low risk if worded neutrally; a free, non-commercial page is probably outside device rules | Real risk if it claims to help a condition, manages medication, or monitors |
| Reliability as an always-on display | The main practical risk: sleep, restarts, power-saving modes, browser support | Same, plus remote failure modes |
| Privacy | Settings stay in the browser; read-aloud may send the spoken text to an online voice provider | Remote updates mean servers, accounts, and health-adjacent data duties |
| Hazards | Always-on charging and burn-in: modest, partly anecdotal | Same |

## 1. Medical or safety device: where the line is

- **US (FDA):** software for medication reminders is a device, but the FDA doesn't enforce for that low-risk category; its January 2026 general-wellness guidance excludes claims that name a disease [V]. A clock that displays time and date for general use isn't a device; disease-specific treatment, alleviation, or monitoring claims push it toward one [V/U].
- **UK (MHRA) and EU (MDR):** both count "compensation for a handicap or disability" as a medical purpose [V]. Wording like "helps people with dementia" could make a commercial product a device there; neutral wording ("easy-to-read calendar clock") is unlikely to [V/U]. The EU rules apply to devices made available "in the course of a commercial activity, whether in return for payment or free of charge" [U, from the regulation's definitions]; a free, non-commercial Labs page is probably outside them, but a spin-out with any revenue wouldn't be.
- **Competitors** mostly market directly to dementia and rarely disclaim; RecallCue says it's not intended to cure dementia; Calendar Clock is filed under Medical in the App Store [V].
- **Current page:** "for someone who loses track of them" on the page; the homepage summary says "for someone living with dementia". Not harmful for a non-commercial page, but neutral wording is safer and should be considered with the owner (no change in this phase).

**Never say:** treats, slows, improves, clinically proven; reduces agitation, sundowning, or anxiety; prevents wandering or falls; keeps them safe; manages medications or "never miss a dose"; designed for Alzheimer's patients; compensates for memory loss; HIPAA compliant; always on; works on any tablet [V/U].

**Say instead:** "A large, simple calendar clock for a spare tablet: day of the week, part of the day, date and time, with optional reminders you type in. Not a medical device. Doesn't replace care or supervision. Don't rely on it for medication timing, alarms, or safety." (The page already says reminders show on the screen with no sound, nothing records whether they were seen, and they shouldn't be relied on alone for medicines.)

## 2. Reliability: the main practical risk

- **Supported devices** [V]: iPads that reach iPadOS 16.4 (iPad 5th gen and newer, iPad Air 3rd gen and newer, iPad mini 5th gen and newer, all iPad Pros). iPad Air 2 and iPad mini 4 stop at iPadOS 15.8 and are outside the build's target. Android needs Chrome 111+, so Android 7 or newer. Fire tablets from 2017 and earlier run Fire OS 5; their Silk versions aren't published, so they need a device test.
- **Keeping the screen on** [V]: Safari keeps the screen awake in a tab from 16.4, but **in Home Screen web apps only from iPadOS 18.4**. iPads stuck on iPadOS 16.7 or 17.7 sleep in Home Screen mode unless Auto-Lock is set to Never. Browsers may refuse a wake lock in power-saving modes; Low Power Mode forces a 30-second Auto-Lock and can switch on if the charger fails. Fire tablets document no "never sleep" option, and their Show Mode can't display a web page.
- **Restarts** [V]: after any restart, including an overnight automatic update, an iPad with a passcode needs the passcode before anything else, so the clock won't come back by itself. Someone has to unlock it and reopen the page.
- **Locking to the clock** [V]: Guided Access (iPad) and app pinning (Android) are moderate effort for a non-technical caregiver; Fire is hardest.
- **A trade-off on older iPads** [U]: Home Screen mode protects stored data from Safari's storage cap (below) but loses the wake lock before iPadOS 18.4; a Safari tab keeps the wake lock but is subject to the cap. On iPadOS 18.4 and later, the Home Screen web app gets both.
- **A wrong or frozen screen is worse than none**: guidance warns that an incorrect clock adds to confusion [V]. A browser that freezes or shows a stale page after sleep is a real risk to test before any wider use.

## 3. Safari storage

Safari's Intelligent Tracking Prevention may remove a site's script-writable storage (localStorage, IndexedDB, and service-worker caches) after seven days of Safari use without the user interacting with the site. Home Screen web apps keep their own count of days of use and, per WebKit, are exempt from the normal first-party seven-day cap [V]. A clock nobody touches is exactly that case. Day Clock re-saves its settings from memory through the day while open, which restores them if they're removed. A removed offline cache could still stop the page reloading without a connection [U].

## 4. Always-on hazards (only what sources say)

- **Charging** [V]: Apple says leaving an iPad connected overnight is fine (it stops at full and resumes below 95%), that time at full charge adds wear, and that charging above 35 °C can shorten battery life; an 80% charge limit exists only on the newest iPads. Samsung offers battery protection at 80%.
- **Swelling**: no official source links 24/7 charging to swelling; caregiver forums report swollen batteries in tablets kept permanently on charge [S]. Don't call always-on charging safe or dangerous; suggest a periodic look for a bulging case or lifting screen.
- **Burn-in** [V]: temporary on LCD panels (most older tablets); possible on OLED (e.g., iPad Pro M4). Day Clock already drifts the display a few pixels each minute and dims at night (PRODUCT_LOG, 2026-10-09).

## 5. Privacy

- **Current version**: settings stay in the tablet's browser; Labs receives nothing. GitHub Pages logs visitors' IP addresses (hosting). **Read-aloud speaks the message and any due reminders**, not just the time; if the browser uses an online voice, that text goes to the voice provider [V, code]. Preferring on-device voices, or saying so, would make the privacy statement fully true in spirit.
- **Reminder content** ("Morning tablets", a visitor's name) is health-adjacent personal information [U]. HIPAA generally doesn't apply to consumer apps not acting for covered entities [V/U].
- **Hypothetical standalone with remote updates**: servers and accounts (forbidden in Labs), plus the FTC Health Breach Notification Rule for health apps and state consumer-health laws such as Washington's My Health My Data Act, depending on scope [V/U].

## 6. Accessibility and readability

NHS, Social Care Wales, and Alzheimer's Association guidance favor large, high-contrast displays, words for the part of day, avoiding glare and reflections, and dark bedrooms at night [V]. No official guidance on 12- versus 24-hour clocks was found; Dementia Australia mentions a 24-hour clock for health settings [V]. Stirling's dementia-design guidance isn't freely available [V].

## 7. What would trigger heavy obligations

Condition-specific treatment, alleviation, or compensation claims in a commercial product (device status in the US, UK, and EU); medication-management features (adherence logs, missed-dose alerts, dose confirmation); monitoring (inactivity, wandering, camera, voice); remote updates, accounts, or sync (breaking Labs' rules and bringing health-data duties) [V/U].
