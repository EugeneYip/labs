# Day Clock: market notes

Research notes for the comparative validation of #022 Day Clock (labs.eugeneyip.net/day-clock/). Compiled 2026-10-11. Internal; not for the website. Nothing here is medical advice.

**The question being tested.** Is a free, browser-based dementia orientation clock genuinely useful compared with cheap hardware day clocks and existing tablet apps? These notes try to falsify that. They keep three uses apart: **orientation aid**, **reminder display**, and **medical or safety device**. Day Clock must never imply the third.

**Evidence tags.** Every claim carries a tag and a source ID. The IDs map to URLs and dates in the source list (section 12).

- **[V G4]**: VERIFIED. Read on that page or document on 2026-10-11.
- **[S F7]**: SNIPPET. Seen only in a search-result summary, not confirmed on the page.
- **[U]**: UNVERIFIED. An inference, or not checked.
- **[repo]**: from Day Clock's own code in this repository.

**Coverage limits.**

- All 30 allowed web searches were used. After that, only direct page fetches.
- Some sites refused automated reading, and no bot check was bypassed:
  - the main Alzheimer's Society site (HTTP 403; its shop, forum and factsheet PDF could be read);
  - NIA (HTTP 405); NICE (HTTP 403);
  - Walmart (a "press and hold" human check), so no retail review text;
  - Amazon and camelcamelcamel were not readable either.
- Reddit was not read. Forum posts are anecdotes, not evidence of how common something is.
- Scholarly sources were not reviewed (LibKey isn't available). Where one matters, it is named and marked.
- The search tool is US-only. "What ranks" in section 7 reflects that one engine on one day.
- App ratings, download bands and prices are as shown on 2026-10-11.

---

## 0. Day Clock, for reference [repo]

- **What it shows:** full screen, large type: the weekday, the part of the day, the date and the time.
  - Default part-of-day starts: morning 05:00, afternoon 12:00, evening 17:00, night 21:00. Both the words and the start times can be edited (`model.ts`).
- **Options:**
  - night colours (amber on black);
  - one standing message (up to 200 characters);
  - reminders at set times on chosen weekdays, each shown for 5 to 720 minutes. They are visual only, with no sound;
  - tap to hear the day and time read aloud (`speechSynthesis`);
  - settings behind a press-and-hold;
  - keep-awake (wake lock) and full screen where the browser supports them.
- **Data:** settings are saved in that browser only, under `labs:day-clock`. It works offline after the first visit.
- **Not included:** no remote updating, no account, no sync, no audible alarms, no photos, no calls, no calendar feed.

---

## Key findings

1. **The job is real and endorsed.** Every official source that could be read recommends clocks showing the day and date as everyday orientation aids. Some also recommend clocks that show morning or evening. [V G4, G10, G11, G12, G13, G1]
   - The same sources attach consistent caveats: fit the individual, introduce early, involve the person, and keep every clock accurate. [V G5, G13]
2. **Caregivers report mixed results.** Forum threads from 2015 to 2026 split the same way: helpful early on for some people; ignored, hidden, unplugged, misread or confusing for others, and fading as dementia progresses. [V F1, F5, F10, F12, F13, F14, F16]
3. **The core display already costs $0 on tablets.** At least five free or freemium apps do what Day Clock does at its core. [V C1, C2, C4, C6, C7, C10]
   - One of them is a free iPad app also called **"Day Clock"**, with nearly the same features: the part of the day with editable periods, and a button that speaks the time. [V C7]
4. **Cheap hardware is popular and highly rated.** American Lifetime sells at about $60, with about 4.9 stars from about 6,700 Walmart ratings [S C18]. UK charity-shop day clocks cost £24 to £56 [V C15]. They plug in, with no tablet to set up.
5. **Remote updating is the most repeated unmet need among caregivers who live away.** [V F3, F5, F6, F13; S G7]
   - The products that meet it all need a server and an account: Calendar Clock, RecallCue, MyHomeHelper, Idem. Labs' hard limits rule those out. [V C3, C4, C22, C14]
6. **"Reuse an old tablet" is real, but it is not unique.** Caregivers do it [V C2, C6, C11]. RecallCue and Memory Care Clock already market exactly that idea [V C4, C8].
   - Reported problems: the screen turning off [V C2]; keeping the person in one app [V F3]; passcode lockouts [S F9]; unplugging and charging [V F3]; and swollen batteries in tablets kept on charge all the time [S F19].
7. **No free web-based day clock turned up for any query tried.** [S R1–R6] Results were retailers, app listings and keyword-spam pages.
   - Autocomplete suggests people do type "dementia clock online" and "day clock online" [V M5]. How often is unknown.
8. **Competitors blur reminders and safety.** Many market medication reminders, help buttons or emergency services [S C35; V C29]. That is exactly the territory Day Clock must stay out of.

**This thread's read (for the main validation, not a decision):** the job survives, but differentiation doesn't. The one thing caregivers most often ask for, remote updates, is outside the hard limits. See the falsification summary (section 9) and the beachhead assessment (section 10).

---

## 1. The real job, today's workflow, and official guidance

### 1.1 What authoritative guidance says

| Source | What it says about clocks and orientation | Cautions | Date | Tag |
|---|---|---|---|---|
| NHS, Staying independent with dementia | Clocks showing the day and date as well as the time are useful daily-living aids. Phones and tablets with alarms and reminders help many people. Voice assistants can give reminders. | — | reviewed 9 Jan 2025 | [V G10] |
| NHS, Making your home dementia friendly | Lists clocks with large LCD displays of the day, date and time. Also: make the bedroom dark at night; close curtains so window reflections don't confuse. | — | reviewed 23 Jan 2025 | [V G11] |
| Alzheimer's Society, Factsheet 437, Using technology to help with everyday life | Automatic calendar clocks show the day and date. Some show morning or evening, which helps when it is light in the evening or dark in the morning. Clock and calendar apps for tablets and phones exist and can be customised. Trusted people can add reminders remotely on many devices. If the person already uses a tablet or phone, try adapting it with an app. | Introduce technology as early as possible. Technology should never replace all face-to-face contact. Consider renting or buying second-hand, since needs change. | last reviewed Apr 2019 (next review was due Apr 2022) | [V G4] |
| Alzheimer's Society shop, Choosing the right product | Choose for the individual; fit the product to existing routines. Ask an OT, GP or social services before buying. | Involve the person, and no one should be forced to use a product. Stages overlap. A product may replace human contact or limit movement, and its presence may remind the person of their memory problems and cause distress. A reminder device may help one person and confuse another. | undated | [V G5] |
| Alzheimer's Society, What memory aids and tools could help | Put a calendar where it is seen often. Whiteboards, notebooks, phone calendars and voice assistants. | — | — | [S G6] (page refused automated reading) |
| Alzheimer's Association, Repetition | When questions repeat, give the answer, and write it down if the person can read. Use memory aids such as notes, clocks, calendars or photos, as long as they still mean something to the person. | Don't argue or reason. Look for the need behind the question. | undated | [V G1] |
| Alzheimer's Association, Sleep issues and sundowning | Keep the home well lit in the evening. Keep a regular routine. Gently remind an upset, wakeful person of the time. | Low light makes shadows that can be misread. | undated | [V G2] |
| Alzheimer's Association, Memory loss and confusion | Go along with the person's sense of time when they are living in an earlier period. Keep corrections brief. | A sudden change in behaviour warrants a medical evaluation. | undated | [V G3] |
| Dementia Australia, Tools and aids to help at home | Suggests clocks with the time, day and date; day/night clocks; reminders on a phone or tablet; whiteboards or planners. | Choose what helps most within your budget. | updated 28 Nov 2025 | [V G12] |
| Dementia Australia, Tips for health workers | A 24-hour clock or calendar by the bed or in clear view aids orientation and independence. Lighting of at least 300 lux. | Check that every clock and calendar is correct, because wrong times add to confusion. | updated 18 Mar 2026 | [V G13] |
| Dementia Australia, Going to hospital | Pack a clock or calendar from home. | — | — | [S G14] |
| NIA, Tips for living alone with early-stage dementia | A clock that shows the day and date; calendars; reminder apps and alarms. | Aimed at people living alone in the early stage. | — | [S G16] (NIA refused automated reading) |
| NIA, sundowning pages | A steady daily schedule and daily daylight. | — | — | [S G17] |
| NICE CG103 (delirium, hospital) | A clock and calendar should be easily visible; consider a 24-hour clock in critical care; reorient the person. | A hospital delirium guideline, not home dementia care. | 2010 text | [S G18] |
| Home Instead UK (care provider) | Simple, high-contrast digital clocks. People with dementia often struggle with analogue faces. | Clocks help most in early dementia. Later, the person may need a caregiver nearby rather than a display. | © 2026 | [V G20] |

**OT bodies:** no Royal College of Occupational Therapists or AOTA guidance on clocks was found within the budget (gap). Indirect signals:

- Alzheimer's Society material sends families to an OT before buying [V G4, G5].
- One caregiver reported in 2019 that her mother's OT recommended a "memory clock" showing the day, morning or afternoon, time and date [V C31].
- Living Made Easy (the impartial UK equipment-information site, AskSARA) lists day-clock apps and devices, such as Clockaid and MemRabel 2 [V G21].
- A small UK qualitative study of calendar use (six dyads, analysed with an occupational-therapy lens) is in the Brunel repository [S K3]. Scholarly, not resolved via LibKey.

**Scholarly background (named, not reviewed):** the Cochrane review of reality orientation (Spector et al., 2000; current status not checked) and the Cochrane review of cognitive stimulation for dementia (Woods et al., 2012, updated 2023). Both are scholarly, not resolved via LibKey. They concern structured group therapy, not a clock left in a room. [U K1, K2]

### 1.2 Cautions, consolidated

- **Stage dependence.**
  - Guidance and care providers place clocks mostly in the early-to-moderate stages [V G20, C17].
  - Caregivers describe clocks losing meaning over time. One reported about four years of use, then no understanding of what a clock is for [S F17]. Others saw a clock stop being looked at [V F16].
  - One spouse said that being told to look at the clock made her husband search the room and become more confused [V F1].
- **Distress and dignity.**
  - A memory aid's presence can itself remind someone of their memory loss and upset them [V G5].
  - One buyer valued packaging that never used the word "dementia" [S R7].
- **Accuracy.** A wrong clock adds to confusion [V G13]. For a browser clock, this makes a frozen or stale screen a real risk (section 4.7) [U].
- **Reality orientation versus going along.**
  - Guidance for confused moments favours going along with the person's sense of time and keeping corrections brief [V G3].
  - Some caregivers advise removing watches and clocks when time becomes a fixation [V F16].
- **Reminders and anxiety.**
  - Telling someone about events far ahead can cause anxiety: a husband anxious about outings got in the car hours early. Caregivers suggest giving short notice instead [V F11, F14].
  - Long-range schedules confused one person, so the family planned only a week at a time [V F13].
- **Human prompts often beat devices.** Staff reminders worked better than personal aids in assisted living [V F13]. Reminders alone did not get one woman to her appointments [V F5].

### 1.3 How orientation is supported today (the toolkit)

- **Dedicated day clocks:** plug-in digital screens of 7 to 15 inches. They show the weekday, date and time, often the part of the day and auto-dimming, and sometimes alarms or reminders. Analogue weekday-only clocks and day/night faces also sell. [V C15, C16, C17, C20]
- **Paper and boards:** wall calendars crossed off daily; tear-off daily pages; whiteboards updated each morning; the daily newspaper. [V F10, F11, F13, F14]
- **Talking clocks and watches:** press a button to hear the time and date. Some people forget to press it. [V F1, F10]
- **Smart speakers and displays:** voice answers to "what time is it", and reminders. Echo Show Drop In for video. [V G10; S R8] Section 3.2.
- **Tablets with an app:** often an old iPad or a cheap Fire or Android tablet left plugged in, sometimes updated remotely. [V C2, C6, F2, F3]
- **Care homes and hospitals:** communal orientation boards (time, day, date, weather, season, events) [S M4]; a clock or calendar by the bed [V G13]; digital signage with menus and events [S M4]; and, above all, staff prompts [V F13].
- **People:** answering the question again, phone calls at set times, and telling the person about plans shortly before they happen. [V G1, F11, F14]

### 1.4 The three uses, kept apart

- **Orientation aid.** This is what the guidance supports (section 1.1). Day Clock's core display fits here.
- **Reminder display.** Guidance supports reminders in general [V G4, G10, G12], with individual-fit caveats [V G5].
  - Caregiver evidence is mixed: alarms can confuse; tools get turned off; staff prompts are more reliable [V F13].
  - Day Clock's reminders are silent and visual, so they depend on the person looking at the screen [repo].
- **Medical or safety device.** Day Clock is not this, and must not be presented this way.
  - Retail listings pitch "medicine reminders" and even a "push for help button" on day clocks [S C35, R2].
  - Amazon's caregiver service is now an emergency-response subscription [V C28, C29].
  - Calendar Clock is filed under "Medical" in the App Store [V C1].
  - RecallCue explicitly says it is not intended to cure dementia or MCI [V C4, C5].
  - Sudden new confusion about day and night can signal an infection or another medical problem needing a doctor [V F14, G3]. A clock should never be framed as monitoring or as a substitute for clinical attention.
  - [U] Silent, visual-only reminders cannot be relied on for medication-critical prompts, and the page should keep saying so plainly.

---

## 2. Pain

### 2.1 Repeated "what day is it?" questions

- Guidance treats repeated questions as common and often driven by anxiety. The response is a calm answer, written down, with memory aids if they still mean something to the person [V G1].
- Caregiver accounts split:
  - **Helped:** one mother largely stopped asking once a large-font date-and-day clock was in place [S F15]. A husband with moderate dementia could not manage without his clocks [V F1]. A part-of-day clock was "very useful" [V F1].
  - **Didn't:** clocks hidden by a wife convinced it was always afternoon [V F1]; ignored [V F5]; looked at but not understood [V F1, F10]; a dementia clock that prompted "how does it work?" questions [V F14].
- A recurring theme: the clock helped the *family* stay oriented more than the person with dementia [V F10, F1].

### 2.2 Night confusion, day versus night, AM and PM

- Mixing up day and night is a recurring complaint: up at 6 a.m. for a 1 p.m. pickup; a 3 a.m. call about an appointment [V F14]. A husband had no sense of morning or evening after a nap, regardless of daylight [S F17].
- AM/PM labels stopped working for one mother, so the family switched to a clock showing "morning" or "night" [V F13].
- Factsheet 437 singles out morning/evening display for light evenings and dark mornings [V G4].
- What didn't help: a digital clock with AM/PM, the time on a computer, or suggesting she look outside for darkness [V F14]. A ceiling-projection clock was "somewhat helpful" [V F14].
- A daily whiteboard reduced daytime confusion, but not night-time confusion [V F14].
- **Implication for Day Clock [U]:** part-of-day words fit this pain directly. The evidence says the words help some people and not others, and that night-time confusion can persist whatever the display shows.

### 2.3 Reminders

- Families do want reminders: medication, meals, visitors, appointments, bin day.
  - A RecallCue reviewer (June 2026) said its reminders cut repeated calls to a parent [V C5].
  - MyHomeHelper users reported fewer repeat calls about appointments and bin day [V F4].
- Counter-signals:
  - anticipatory anxiety when told too early [V F11];
  - reminders failing to get someone out of the door [V F5];
  - alarms confusing or turned off [V F13];
  - one parent might ignore messages or forget where the screen is [S R9].

### 2.4 Families wanting to update remotely

This is the most consistent request in the caregiver threads:

- **2021:** wanted a bedside clock that could take remote messages plus weekday wake-up alarms. The app found had messaging but no alarms [V F6].
- **2019:** a daughter 500 miles away set up reminders and prompts [V F13].
- **2024–25:** a carer in London with a mother in Prague wanted a remotely programmable clock. She preferred a dedicated device because a tablet might not be charged or switched on [V F3].
- **2025:** wanted a large display linked to Google Calendar, to update from afar [V F5].
- **Alzheimer's Society panel (Day Hub review):** a family member wished one-off tasks could be added remotely through an app; another found reprogramming on the device impractical as needs changed [S G7].
- **Reviews:** Calendar Clock reviewers update on-screen messages from a phone [V C1, C2]. Fashmel's clock is configured remotely through a shared calendar [V C6].
- **[U]** Day Clock cannot do this. Its settings live in the tablet's browser. Someone has to be at the tablet, or the caregiver has to keep the person's device signed into something, which the hard limits forbid Labs from providing.

### 2.5 Setup and maintenance burden

- **Hardware:**
  - small, confusing setup switches; some models lack battery backup and need resetting after a power cut; manual daylight-saving changes [V C32];
  - autocomplete includes "dementia clock instructions", "dementia clock not working" and "how do you change the time on a dementia clock" [V M5];
  - a dedicated clock went blank and came back with the wrong time [S R9];
  - remotes get lost [S C21].
- **Tablets:**
  - stopping the tablet from turning off is harder than expected (Calendar Clock review, May 2026) [V C2];
  - keeping the person from closing the app (question unanswered, May 2025) [V F3];
  - a mother locked an iPad with a passcode she then forgot [S F9];
  - unplugging, and carers unplugging (stickers asking them not to) [V F3];
  - Auto-Lock not holding after OS updates (older Apple Community reports) [S F20];
  - an always-on app drains the battery, so keep it on mains power [V C6];
  - the full checklist one developer recommends: Auto-Lock Never, Night Shift, auto-brightness, all-day Do Not Disturb, Guided Access, automatic updates off, and a Shortcut to relaunch the app after charging resumes [V C32].
- **The person's own behaviour:** clocks unplugged, moved, hidden in drawers [V F12]; mains clocks switched off, solved with a cap over the switch [V F1]; a whiteboard wiped clean [V F11].
- **Echo Show:** clock settings can't be changed from the Alexa app and must be set on the device [V C30]. Setup needs a smartphone, which a dementia-tech commentator criticised [S R8].

---

## 3. Competitors

### 3.1 Dedicated day clocks (hardware)

| Product | Price | What it does | Adoption signal | Tag |
|---|---|---|---|---|
| American Lifetime Day Clock (8") | from $59.95 | Weekday, date, time, part of day; 5 alarms; auto-dimming | about 4.9 stars, about 6,713 ratings on Walmart (variants appear to share reviews) | [V C17]; [S C18] |
| Robin Day Clock (8"; also 12" and 15") | $64.95–$69.95 (Walmart); "Premium" $79.95; AU 12"/15" $399/$449 | Talking time and day at a button press; custom alarms with messages; no internet | 2021 review | [S C19]; [V C17] |
| Relish Day Connect / Day Hub | $119.99 / $199.99 (US); £99.99 / £179.99 (UK) | Day Connect: time of day. Day Hub: up to 10 task alerts with sound and light | 5.0 / 4.7 stars (no counts shown); the 1500+ reviews figure is site-wide | [V C16, C15, C17] |
| Idem smart reminder clock (10.1") | £268.88 UK; $249–$275 US | Part of day; spoken reminders; free caregiver app for reminders, messages, photos; video calling subscription (new in 2026) | 4.5 stars at Relish; UK availability unclear | [V C14, C16, C17] |
| Alzheimer's Society shop range | £16.49–£189.99 | Day/date wall clocks £24.99; Day and Night £33.49; radio-controlled day clock £44.99; dual-display £55.99 (one screen phrases it like "Now it's Monday Morning" [S]); Rosebud reminder clock £102; large square calendar clock £189.99 | Charity shop; products tested by people affected by dementia [S] | [V C15]; [S G6] |
| DayClox (UK) | main clock price not shown | Day, date, time; up to 15 languages | Seller says NHS staff buy them; 2013 award claim; featured reviews from 2017 | [V C20] |
| MemRabel 2 | £96–£155 | Photo-frame clock: four part-of-day modes; 9 or 20 alarms (sources conflict); photo, audio and video reminders; set up by remote control or USB | Listed on Living Made Easy; named on Talking Point | [V G21, F1] |
| Rosie 2.0 / "Tablet Clock for Seniors" | $149.99 / $49 | Recorded-voice reminders / 20 alarms and 12 display modes | Sold by The Alzheimer's Store | [V C17] |
| Dazzed Corner 7" (Best Buy) | — | Day, date, time; 12 reminders | No reviews yet | [S C35] |
| Memwake (Walmart) | — | 7-inch day clock with a remote; a Wi-Fi variant exists, purpose unclear | memwake.com and memwake.co.uk did not resolve on 2026-10-11 | [S C21]; [V C21 fetch errors] |
| Marque | — | Not found within the budget | — | gap |

**Pattern:** the hardware is cheap enough ($50–$80) to be an easy purchase, sells at volume (one listing has about 6,700 ratings), and needs no tablet. The pricier tier ($120–$275) adds reminders and, in Idem's case, remote updates.

### 3.2 Smart displays

- **Amazon Echo Show:**
  - Alexa Together, the caregiver subscription with remote reminders, an activity feed and alerts, was withdrawn on 21 May 2025. Amazon points caregivers to Alexa Emergency Assist instead [V C28].
  - Emergency Assist costs $7.99 a month or $79 a year per one Nov 2025 source; older coverage said $5.99/$59 [V C29; S R8]. Up to 25 contacts; circle members can add reminders and Drop In [V C29].
  - It can be set up as a near-full-time clock with the date and weather, but has no part-of-day display, and the settings must be made on the device [V C30].
  - On the Show 8, 10 and 15, most voice commands kick it out of the minimal clock view [V C30].
  - A 2019 caregiver comment: her mother's OT wanted a "memory clock", and Amazon doesn't make one [V C31].
  - A forum user added her mother's Echo Show to her own Amazon household so she can Drop In without her mother touching anything [S R8].
  - An AgingCare member's mother liked an "Alexa Show" with family-set reminders, finding it less busy than a monthly calendar [V F11].
- **Google Nest Hub:** not researched (gap). A Talking Point member's husband asks Google Nest the time, but the answer means nothing to him [V F1].

### 3.3 Displays the family updates remotely

| Product | Price | Relevance | Adoption signal | Tag |
|---|---|---|---|---|
| MyHomeHelper (UK) | packages from £199.99 ex VAT including the tablet; users report £9.99 a month | A tablet the person never touches: diary, reminders, photos, auto-answer video calls. Family manage it from a web panel | Several warm Talking Point reports ("godsend"); a council trial was offered to one family | [V C22, F3, F4] |
| Komp (No Isolation) | 7,995 NOK plus 249 NOK a month | One-button screen; family send photos and messages; calls auto-answer after 10 s. Names dementia among target users. The page doesn't say it shows the day or time | 14,000+ families (self-reported) | [V C23] |
| ViewClix | not shown | Senior photo frame with sticky notes, family-managed settings, web and app portal. A day clock is mentioned in search summaries only | hundreds of thousands of users (self-reported) | [V C27]; [S C27] |
| Skylight (Calendar, Frame) | device prices not read; Frame Plus $39 a year | Family calendar and photo frame, not dementia-specific | over 1 million families (self-reported) | [V C24] |
| Hearth Display | not shown | Family organiser aimed at parents and children; no mention of older adults | 4.7 stars from 786 reviews; 40,000+ families (self-reported) | [V C25] |
| GrandPad | not read | Senior tablet | — | gap [U C26] |
| "Loving Frame" | — | No product of that name found. Nearest: Frameo-based frames (Relish £79.99, Alzheimer's Society shop) | — | [S R10] |
| Idem, RecallCue, Calendar Clock | see 3.1 and 3.4 | Remote day clocks | — | — |

**Pattern:** every remote-update product runs a server and needs an account, an ID and password, or a subscription. Several bundle video calls. The money is in that layer (section 8).

### 3.4 Tablet apps (searched "dementia clock" in both stores)

| App | Platform | Price | Ratings | Installs | Last update | Remote updates? | Account? | Tag |
|---|---|---|---|---|---|---|---|---|
| **Calendar Clock** (Jelter, NL) | iOS, Android, more | Free; Premium and Premium Plus monthly (price shown only in-app): video calls, weather, photos | iOS 4.4 (107); Android 4.3 (550) | Android 100K+ | Android 4 Oct 2026; iOS v2.26.3 about 6 Oct 2026 | **Yes:** the separate Administrator app posts messages, tasks and alarms. These appear to be in the free Basic tier; Premium adds video, weather and photos [U on the tier split] | No account mentioned; ID and password pairing | [V C1, C2, C3, C13] |
| **RecallCue** (US) | iPad, Android tablet; phone app for family | Basic free (single clock); Pro $9.99 a month (from $8.25 on annual; £7.99 in the UK) | Android 4.0 (52) | 5K+ | 1 Oct 2026 | Yes (Pro): messages, reminders, photos, video, Google Calendar | Yes | [V C4, C5, F2] |
| **Dementia Diary/Clock** (Fashmel, UK) | Android | Free, no ads | 3.6 (178) | 10K+ | 29 Apr 2024 | Yes, through a shared calendar on the device | Google calendar | [V C6] |
| **Day Clock (Dementia Clock)** (Technology4Seniors, US) | iPad only | Free | 4.7 (6) | — | Sep 18 (year not shown) | No | No (coarse location for weather) | [V C7] |
| **Clarity: Dementia & Alzheimers** | iPhone, iPad | Free, no in-app purchases | 1.0 (1) | — | v1.0.3 Sep 2; first version Jul 13 (2026 per a third-party listing [S]) | No | No; "no data collected" | [V C10] |
| **Memory Care Clock** (Innodroid) | iPhone, iPad (iOS 17.5+) | $3.99 a month or $39.99 a year | 5.0 (2) | — | v2.1, Jun 13 | No | No | [V C8] |
| **Maziance Dementia Clock** | iPad (iOS 16.6+) | $9.99 a month (subscription needed) | none | — | 25 Nov 2025 | Not mentioned | — | [V C9] |
| **ShowTime Simple Clock Display** | iPad, iPhone | $2.99 | 5.0 (5) | — | 15 Jul 2025 | No | No | [V C11] |
| Others seen in search | iOS | — | Carm's Clock, Time Leaf Clock (1 rating) | — | — | — | — | [V C12] |
| Clockaid (NL) | Android, iOS | three versions with paid features; price on application | — | — | — | Reminders and messages | — | [V G21] |
| MemoClock | app on two devices | — | 2019 award nominee | — | status unknown | Yes | — | [S R11] |

**Pattern:**

- On Android, Calendar Clock has real adoption (100K+ downloads, 550 reviews) and appears to give remote messaging away free. On iOS, every dementia clock app seen except Calendar Clock has fewer than 10 ratings.
- The free core clock is crowded: T4S Day Clock, Clarity, Fashmel, Calendar Clock basic, RecallCue basic.
- Several apps state minimum versions: iOS or iPadOS 15.0 (Calendar Clock, T4S Day Clock), 15.6 (ShowTime), 16.4 (Clarity), 16.6 (Maziance), 17.5 (Memory Care Clock) [V C1, C7, C10, C9, C8, C11]. Older iPads stuck below those versions can't install them; see section 5.

### 3.5 Free web-based day clocks

- **None found.** Three targeted searches turned up no free, browser-based dementia or day clock [S R4, R12, R13]. Results were apps, hardware and spam.
- Nearest alternatives:
  - **generic web clocks** such as onlineclock.net (12/24-hour, alarm; no part of day) [S C37];
  - **DIY dashboards:** Home Assistant [S F18] or DAKboard (about £5 a month, unverified) [V F5]. A commenter noted a self-hosted dashboard goes dark when the server reboots [S F18];
  - **Friendly Clock**, a Windows app that writes the time as a sentence with morning/afternoon/evening/night [S C38].
- Calendar Clock's site lists only the App Store and Google Play; no web version [V C3, C33].
- **[U]** Day Clock may be the only free, no-install, no-account, browser-based day clock in these results. That is a real gap. Whether anyone wants a browser version, rather than an app, is unproven (section 7).

### 3.6 Feature comparison (what Day Clock lacks or adds)

| | Day Clock | T4S Day Clock | Clarity | Calendar Clock (free) | RecallCue Basic | American Lifetime |
|---|---|---|---|---|---|---|
| Weekday, part of day, date, time | yes | yes | yes | day, date, time (part of day not confirmed) [U] | yes (time of day) | yes |
| Editable part-of-day words and times | yes | periods yes | no [U] | no [U] | no [U] | no [U] |
| Reads aloud on tap | yes | yes | no [U] | chimes | no [U] | no [U] |
| Message, reminders | yes (visual) | not listed [U] | yes (with gentle alarm) | yes (alarms, tasks) | no (Pro) | 5 alarms |
| Remote updates | **no** | no | no | **yes** (appears free) [U] | Pro | no |
| Install, account | **none** | install | install | install; ID pairing | install, account | none |
| Platforms | any modern browser | iPad | iPhone, iPad | iOS, Android, more | iPad, Android | dedicated device |
| Data collected | none (local) [repo] | coarse location | none (self-declared) | user ID | account | — |
| Cost | free | free | free | free | free | about $60 |

Sources: [repo], [V C7, C10, C1, C2, C3, C4, C5, C17]. "No [U]" means the feature wasn't seen on the listing; it is not confirmed absent.

---

## 4. Counter-evidence (searched as hard as support)

### 4.1 Dedicated hardware is already cheap and well reviewed

- American Lifetime: about $60, about 4.9 stars from about 6,700 Walmart ratings [S C18; V C17]. The Robin is about $65–$80 [S C19].
- UK charity-shop day clocks cost £24.99–£55.99, some with automatic clock-change setting [V C15].
- No tablet setup, no screen-sleep problem, no app to close. A grandparent can't wander into Settings.
- A web page saves $50–$80 only when a spare tablet already exists, and then costs caregiver setup time (section 5).

### 4.2 Free tablet apps already cover the core

- The free T4S **"Day Clock (Dementia Clock)"** iPad app duplicates Day Clock's distinctive features: part of day with customisable periods, and tap or button to speak [V C7].
  - Its developer published a detailed setup guide for repurposing iPads [V C32].
  - It shares the same name, so searching "Day Clock" surfaces it, and it appears for "day clock online" [S R6]. [U] This collision is a discoverability and trust problem for Labs' Day Clock.
- **Clarity** (free, no data collected, offline, editable message, reminders) duplicates the privacy story [V C10].
- **Fashmel** (free, no ads, no data collected) offers deep customisation and remote updates through a calendar [V C6].
- **Calendar Clock** is free, with free remote administration, and has 100K+ Android downloads [V C2, C3].
- [U] Day Clock's no-install, no-account angle is the only clear difference. App installation is a one-time cost that many caregivers have clearly already paid.

### 4.3 Families need remote updates now, and competitors offer them

- See section 2.4 for the demand.
- Who offers it:
  - Calendar Clock: the Administrator app, a free download; remote messages appear to be in the free tier [V C1, C3; U on the tier];
  - RecallCue: Pro, $9.99 a month [V C4];
  - Fashmel: shared calendar, free [V C6];
  - Idem: free app, £268.88 device [V C14];
  - MyHomeHelper: web panel [V C22];
  - Komp, ViewClix: frames and screens [V C23, C27];
  - Echo Show: Emergency Assist circle members can add reminders [V C29].
- The products caregivers praise most warmly in the threads are remote ones: MyHomeHelper ("godsend"), RecallCue and Calendar Clock [V F3, F4, C2, C5].
- [U] Day Clock can't add this without a backend and accounts, which hard limits 1, 2 and 5 rule out. For caregivers who live away, the browser clock is a dead end.

### 4.4 Caregivers don't want another device or another tech job

- One wife let her husband keep using his phone for the date rather than add a clock [V F1].
- A 2025 thread converged on "don't spend much, keep it basic": pen, paper, a whiteboard [V F5].
- A daughter living away preferred a dedicated plug-in device over a tablet that might go uncharged or switched off [V F3].
- Several caregivers ended up using the clock themselves [V F1].
- An Alzheimer's Society factsheet suggests adapting technology the person already uses [V G4]. That supports reuse, but the "person" is often not the one with a spare tablet.

### 4.5 Orientation clocks don't help, or confuse, some people

- Being told to look at the clock led to searching and more confusion [V F1]. A dementia clock confused a mother, who kept asking how it worked [V F14].
- Hidden or unplugged [V F1, F12]; ignored [V F5, F16]; "a waste of money" [V F1]; returned [V F1].
- An AgingCare expert: reading clocks and calendars needs abilities the disease removes; familiarity and calm matter more [V F10].
- Some advise removing clocks when time becomes a fixation [V F16].
- No controlled evidence on home day clocks was found (gap; scholarly not reviewed).

### 4.6 Readability and accessibility

- One developer's criticisms of other clock apps: every item the same size, so the time doesn't stand out; leading zeros ("02:40"); slashed zeros; no speech, or a hard-to-find speech button [V C32]. [U] Day Clock should be checked against these.
- Analogue may be easier to read for some people: one husband read analogue dials better than digital ones [V F1]. Home Instead notes many people with dementia struggle with analogue faces [V G20]. Preferences vary.
- Abbreviations confuse; spell out weekday names. Words like morning and evening may beat AM/PM [S C34].
- An e-ink tablet was used successfully with Fashmel [V C6]. [U] A browser clock on e-ink would need a non-animated, high-contrast layout.

### 4.7 Fragility specific to a browser page [U, inferred; not tested in this thread]

- **Stale or frozen screen.** If the tab is suspended, the browser restarts, or the device sleeps and wakes, a page can show the wrong time until it refreshes. Dementia Australia stresses that wrong clocks add to confusion [V G13].
- **Keep-awake.** Wake-lock support varies by browser and version, so the iPad's Auto-Lock usually still needs setting to Never [V C32 for the iPad steps].
- **Saved settings in Safari.** WebKit's tracking prevention may remove script-writable website storage after seven days of Safari use without user interaction with the site. Home Screen web apps are treated differently and, per WebKit, exempt from the normal first-party seven-day cap.
  - A clock left open and never tapped could plausibly lose its settings, such as custom words, message and reminders, unless it is added to the Home Screen or tapped now and then (wording from the validation brief, not re-verified here).
- **No relaunch after a power cut.** Apps can be relaunched with a Shortcut when charging starts [V C32]. A Safari tab may need a person to reopen it. [U] Not tested.
- **Distractions.** Notifications, update prompts and browser chrome. Apps handle these with Guided Access and Do Not Disturb [V C32]; the same applies to a browser, but the browser adds its own interface.

---

## 5. Is "reuse an old tablet" a genuine advantage?

**What caregivers actually do (all anecdotal):**

- An old iPad hung on a wall running Calendar Clock, messages typed from a phone (2022) [V C2]. An old Samsung tablet on the wall [S R12].
- Fashmel's clock on an old Hudl 2 and another redundant tablet; another on an e-ink tablet [V C6].
- RecallCue on a cheap Amazon Fire kept plugged in [V F3]. RecallCue on an older iPad without a front camera, which limited motion features [V F2].
- ShowTime on an iPad that no longer receives iPadOS updates, with Guided Access, stable for over a year [V C11].
- A homemade tablet display combining part of day, pictures and a day's diary, useful for about two years [S F7].
- Talking Point (2026): RecallCue was recommended as a cheaper alternative to costly dementia clocks, with an old tablet as the display [V F2].
- Factsheet 437 encourages adapting a tablet or phone the person already uses [V G4].

**Why some prefer a tablet to a dedicated clock:** a battery that survives power cuts; automatic daylight-saving changes; setup on screen rather than with small switches [V C32]; and a free or low price versus £100–£270 [V F2, F12, C15].

**Problems reported:**

- **Screen sleep:** working out how to stop the tablet turning off was not easy [V C2]. Auto-Lock quirks after OS updates [S F20].
- **Locking to one app:** an unanswered question about locking an app so the person can't close it [V F3]. Guided Access exists on iPad [V C7, C32].
- **Passcodes:** a mother set a passcode, forgot it, and a two-hour Apple Support call failed [S F9].
- **Charging and unplugging:** tablets forgotten or unplugged; stickers telling carers not to unplug [V F3]. An always-on app drains the battery [V C6].
- **Being moved or picked up:** dedicated clocks get moved and hidden [V F12]. [U] A tablet is more tempting to pick up, and no tablet-specific reports were found.
- **Notifications and pop-ups:** one developer's setup schedules Do Not Disturb all day and turns off automatic updates [V C32]. No caregiver complaint about notifications was found (gap).
- **Battery swelling:** forum reports of tablets kept on charge all the time developing swollen batteries, including a 2011 iPad used as a 24/7 wall clock, Fire tablets and a Lenovo [S F19]. Anecdotal and of unknown frequency, but a real hazard for "leave it plugged in forever". Some tablets now offer charge limits (80% on some iPads, Huawei, Acer) [S F19].
- **App support on old hardware:** current apps need iOS 15 to 17.5 [V C1, C7, C8, C9, C10, C11].
  - [U] A web page *could* run on iPads too old for these apps. That is the most concrete technical edge a browser clock might have.
  - It is **untested and possibly false for Day Clock**, which uses modern CSS such as `100dvh` and modern JavaScript [repo]. It would need checking on old Safari versions.

**Verdict:** genuine, but narrow and contested.

- Repurposing is common enough that three commercial apps are built around it [V C4, C8, C1].
- The cost saving is real when a tablet is idle, but the setup and upkeep fall on the caregiver.
- The strongest version of the advantage (free, no account, runs on old devices) belongs to Day Clock only if old-Safari compatibility is real, and only for caregivers who don't need remote updates.

---

## 6. Who is the narrowest plausible beachhead?

Evidence on each candidate (assessed in section 10):

- **US scale:** 7.4 million people aged 65+ with Alzheimer's in 2026, and nearly 13 million unpaid dementia caregivers [V M1]. 63 million US family caregivers in 2025 [V M2]. About 11% of caregivers lived an hour or more away in AARP's 2020 study [S M3].
- **Family caregivers living with or near the person, with a spare tablet:**
  - **Frequency:** "what dementia clock?" threads recur on Talking Point every year or two (2021, 2024, 2025, 2026) [V F1–F6]. AgingCare threads date from 2015 to 2023 [V F10–F14].
  - **Signs they'd use a tablet:** repurposing reviews [V C2, C6, C11], a member who built a tablet display [S F7], and the RecallCue thread [V F2].
- **Adult children living away:**
  - The need is strong and recurring [V F3, F5, F6, F13], and the target user of RecallCue, Calendar Clock, MyHomeHelper and Idem [V C4, C1, C22, C14; S C34].
  - Day Clock can't serve their main need.
- **OTs, memory clinics, dementia advisers as multipliers:**
  - Guidance routes families to an OT before buying [V G4, G5]. An OT recommending a memory clock is anecdotal [V C31].
  - Equipment-information listings (Living Made Easy) include apps [V G21].
  - Alzheimer Scotland's ADAM technology-matching service was suggested on Talking Point [V F6].
  - Trust barrier [U]: professionals recommend from catalogues and trusted listings, and a free web page from an unknown lab has no listing, support line or accreditation.
- **Care homes and assisted living:**
  - They use communal orientation boards, per-room clocks and staff prompts [S M4; V G13, F13]. Digital signage vendors sell to memory care [S M4].
  - [U] Per-room tablets mean staff time, infection control, theft, Wi-Fi and procurement. Low fit.

---

## 7. Search demand signals (no paid keyword tools)

**What ranked (US-only search tool, 2026-10-11) [S]:**

| Query | What ranked | Free web tool? | Tag |
|---|---|---|---|
| dementia clock | Retail and buying guides (Better Care Market AU, AgeSpace shop, Manage at Home UK, Kisa AU, Complete Care Shop UK, Relish US) plus keyword-spam pages on unrelated domains | No | [S R1] |
| day clock for elderly | Mostly spam pages (hijacked subdomains of unrelated firms and universities), Desertcart, Walmart (Robin) | No | [S R2] |
| dementia clock app | App Store (Maziance, Calendar Clock), Alzheimer's Society shop (Idem), Kisa AU, spam | No | [S R3] |
| free dementia clock online | App Store only (Calendar Clock, Memory Care Clock, Maziance, T4S Day Clock), plus spam | **No** | [S R4] |
| calendar clock for seniors | Spam pages and one Best Buy listing | No | [S R5] |
| day clock online | Complete Care Shop, onlineclock.net (generic), Argos, T4S Day Clock (App Store), Alzheimer's Society shop, AskJAN, dayclocks.com | Generic clock only | [S R6] |

- **Spam as a signal [U]:** near-identical "Dementia Calendar Clock" and "Calendar Clock For Seniors" pages on hijacked subdomains of unrelated organisations (universities, a trading platform, an office-furniture maker) suggest these phrases are worth spamming for affiliate or advertising value. In other words, there is commercial search traffic. Volume is unknown.
- **Google autocomplete (fetched 2026-10-11) [V M5]:**
  - "dementia clock": for seniors, amazon, with reminders, near me, battery operated. Also test, drawing, test results: the clinical clock-drawing test shares the phrase, so intent is ambiguous.
  - "dementia clock app": for ipad, android, free dementia clock app, best dementia clock app, dementia calendar clock app, dementia clock with appointments.
  - "day clock": for seniors, amazon, **online**, instructions, for dementia.
  - "free dementia clock": app, uk, ireland, for seniors, calendar clock.
  - "dementia clock online" and "dementia clock for ipad" exist as suggestions. So do "dementia clock instructions", "dementia clock not working" and "how do you change the time on a dementia clock" (setup pain).
  - "old ipad as": home assistant dashboard, digital photo frame, picture frame, **digital calendar** (no dementia clock).
- **Reading [U]:**
  - Shopping intent dominates ("amazon", "near me", "for seniors").
  - App intent is explicit ("app for ipad", "android", "free ... app").
  - A small "online" intent exists that nothing free serves. A web page could plausibly rank for "dementia clock online" or "free day clock online", but nothing here measures volume.

---

## 8. Monetization norms (research only)

- **Hardware, one-off:**
  - $50–$80 for mainstream day clocks [S C18, C19; V C17];
  - $120–$275 for reminder or connected clocks [V C16, C17, C14];
  - UK: £16–£190, with VAT relief available for eligible disabled buyers [V C15, C14].
- **Connected services:**
  - MyHomeHelper: from £199.99 ex VAT for the device, with about £9.99 a month reported by users [V C22, F3];
  - Komp: 7,995 NOK plus 249 NOK a month [V C23];
  - Idem: video calling subscription [V C14];
  - Alexa Emergency Assist: $7.99 a month or $79 a year [V C29];
  - Skylight Frame Plus: $39 a year [V C24].
- **Apps:**
  - freemium is the norm: a free core clock, with payment for remote features, photos, video and weather. RecallCue $9.99 a month (£7.99 UK) [V C4, F2]; Calendar Clock Premium, monthly, price in-app [V C3]; Maziance $9.99 a month [V C9]; Memory Care Clock $3.99 a month or $39.99 a year [V C8];
  - one-off: ShowTime $2.99 [V C11];
  - entirely free: T4S Day Clock, Clarity, Fashmel [V C7, C10, C6].
- **What it means [U]:** the plain clock earns nothing; the market has priced it at $0. Revenue sits in remote management and video, which need servers and accounts. Labs' limits forbid both, and Labs is free anyway. So monetization isn't a constraint for Labs, but it confirms the free core alone is not scarce.

---

## 9. Falsification summary

| # | Hypothesis | Verdict | Strongest evidence against | Strongest evidence for |
|---|---|---|---|---|
| H1 | Caregivers need a display of the weekday and part of day | **Survives, with stage caveats** | Clocks ignored, hidden, confusing, or useful only early [V F1, F5, F14, F16] | Every official source checked recommends them [V G4, G10–G13, G1] |
| H2 | A browser page beats cheap hardware | **Mostly falsified** | About $60 clocks with about 6,700 ratings, no setup, nothing to close [S C18]; families want a dedicated device [V F3] | Free if a tablet is idle; editable words and times; avoids hardware's daylight-saving and power-cut problems only if the tablet stays on mains [V C32] |
| H3 | A browser page beats existing tablet apps | **Falsified on features; survives only on "no install, no account"** | A free iPad app with the same name and near-identical features [V C7]; Clarity, Fashmel, and Calendar Clock with free remote admin [V C10, C6, C1–C3] | No install, any browser, no data [repo]; possibly older devices [U, untested] |
| H4 | Remote updating isn't essential | **Falsified for caregivers who live away; survives for those living with or near the person** | Repeated threads asking for it [V F3, F5, F6; S G7] | Many households have someone on site; Talking Point users of on-device clocks and apps [V F1, C6] |
| H5 | "Reuse an old tablet" is a genuine advantage | **Partly survives** | Competitors already own it [V C4, C8]; screen sleep, locking, charging, battery swelling [V C2, F3; S F19] | Caregivers really do it [V C2, C6, C11]; Factsheet 437 endorses adapting existing devices [V G4] |
| H6 | Orientation clocks measurably help | **Unresolved** | No controlled evidence reviewed; strong anecdotal failure rate | Guidance endorses them; individual successes [V F1, S F15] |
| H7 | Day Clock can stay clear of medical or safety claims | **Survives if worded carefully** | The category routinely sells "medicine reminders", help buttons and emergency services [S C35; V C29] | Day Clock has no audible alarms or monitoring; it can say so [repo] |

**Overall:** the core proposition, that a browser dementia clock is genuinely more useful than cheap hardware and existing apps, **did not survive** as a broad claim.

- What remains is a narrow, unproven niche: free, no install, no account, no data, possibly running on hardware too old for current apps.
- It suits caregivers who live with or near the person and don't need remote updates.
- The evidence does not show that this niche is large or that its members are looking.

---

## 10. Beachhead assessment

| Segment | Job frequency | Reachability | Trust barriers | Fit with Day Clock's limits | Verdict |
|---|---|---|---|---|---|
| **Caregivers living with or near the person (often a spouse) who already own a spare tablet** | Moderate. Recurring forum questions; repurposing reviews [V F1–F6, C2, C6] | Medium. Talking Point moderators engaged with an app recommendation [V F2]; AgingCare, AlzConnected | Medium. Unknown site; worry about stability; spouses may lack the confidence to set up Guided Access [U] | **Good.** No remote need; local settings fine | **Narrowest plausible.** Still unproven |
| **"Try before you buy": families or OTs testing whether a day clock helps before paying £50–£270** | Inferred from how often clocks are ignored or returned [V F1, F5, F12] | Medium. The same forums; OTs; equipment-information sites [V G21] | Low to medium. A free trial is low-risk [U] | **Good.** A temporary use suits local-only settings | **Most distinctive angle found.** Untested; no one was seen asking for it in these words |
| **Adult children living away** | High. The most repeated need [V F3, F5, F6] | High. Forums, app stores | Low for apps they already trust | **Poor.** Needs remote updates | Not a beachhead for Day Clock |
| **OTs, memory clinics, dementia advisers** | Unknown frequency; anecdotal OT recommendation [V C31] | Low to medium. Through catalogues and listings [V G4, G5, G21] | **High.** No listing, support or accreditation; liability caution [U] | Medium (as a "try it" tool) | Multiplier only after proof with families |
| **Care homes, assisted living** | Orientation boards and staff prompts already exist [S M4; V F13] | Low | High. Procurement, infection control, devices per room [U] | Poor | Not a beachhead |

**Suggested next human step (if the main thread keeps Day Clock open):** at most 3–5 problem interviews with caregivers living with or near the person who have a spare tablet. Test two things:

- whether they would set up a browser clock themselves, keep-awake and locking included;
- whether "try a day clock free before buying one" resonates.

Stop if remote updating comes up as essential in most of them. [U] No contact was made in this research.

---

## 11. Gaps

- **Retail reviews:** Walmart and Amazon review text couldn't be read (bot checks), so there are no complaint themes for American Lifetime or Robin beyond seller copy and snippets.
- **Official pages:**
  - Alzheimer's Society pages refused automated reading; its product-panel articles are snippet-only [S G6, G7, G8, G9];
  - NIA and NICE pages were snippet-only or unread; NICE NG97 (dementia) was not read at all;
  - Factsheet 437 was last reviewed in April 2019 and may have been replaced.
- **OT bodies:** no RCOT or AOTA guidance on clocks found.
- **Communities:** Reddit not read. Dementia Australia's forums and the AlzConnected threads were not searched beyond one query.
- **Not researched:** Google Nest Hub; GrandPad pricing; Skylight Calendar and Hearth prices; Lenovo devices; "Loving Frame" (not found); Marque (not found); Memwake's identity (a Walmart brand now; its old domains don't resolve).
- **Search data:** no search volumes. Rankings come from one US-only engine on one day.
- **Untested here:** Day Clock on old iPads and old Safari versions (`dvh`, modern JavaScript); wake lock on iPad, in Safari and as a Home Screen app; how the page recovers after sleep, a power cut, or the browser being killed; the seven-day storage behaviour with an untouched clock.
- **Evidence quality:** no controlled studies on home day clocks were reviewed (LibKey unavailable). Forum evidence is self-selected and skews to people who had problems.
- **Tablet distractions:** no caregiver reports on notifications or Fire tablet lock-screen ads interrupting a clock app were found.
- **Naming:** the name collision with the T4S "Day Clock (Dementia Clock)" iPad app was not assessed for trademark or confusion risk.

---

## 12. Sources

Accessed 2026-10-11 unless stated. V = read on the page; S = search-result summary only; U = not checked.

### Guidance and care organisations (G)

- **G1** Alzheimer's Association, Repetition. https://www.alz.org/help-support/caregiving/stages-behaviors/repetition (V; undated)
- **G2** Alzheimer's Association, Sleep issues and sundowning. https://www.alz.org/help-support/caregiving/stages-behaviors/sleep-issues-sundowning (V; undated)
- **G3** Alzheimer's Association, Memory loss and confusion. https://www.alz.org/help-support/caregiving/stages-behaviors/memory-loss-confusion (V; undated)
- **G4** Alzheimer's Society, Factsheet 437, Using technology to help with everyday life (last reviewed April 2019). https://www.alzheimers.org.uk/sites/default/files/2019-05/437LP-Using-technology-to-help-with-everyday-life-190520.pdf (V; PDF text read)
- **G5** Alzheimer's Society shop, Choosing the right product. https://shop.alzheimers.org.uk/pages/choosing-the-right-product (V; undated)
- **G6** Alzheimer's Society, What memory aids and tools could help a person who has dementia? https://www.alzheimers.org.uk/get-support/publications-and-factsheets/dementia-together/what-memory-aids-tools-help-dementia (S; HTTP 403)
- **G7** Alzheimer's Society, People with dementia try out a clock with everyday reminders. https://www.alzheimers.org.uk/get-support/publications-and-factsheets/dementia-together/people-dementia-try-clock-everyday-reminders (S; HTTP 403)
- **G8** Alzheimer's Society blog, Supporting people with dementia when the clocks change. https://www.alzheimers.org.uk/blog/supporting-people-with-dementia-when-the-clocks-change (S; HTTP 403)
- **G9** Alzheimer's Society, Clocks and watches (Dementia Together, Apr/May 2017). https://www.alzheimers.org.uk/dementia-together-magazine/april-may-2017/clocks-and-watches (S)
- **G10** NHS, Staying independent with dementia (reviewed 9 Jan 2025). https://www.nhs.uk/conditions/dementia/living-with-dementia/staying-independent/ (V)
- **G11** NHS, How to make your home dementia friendly (reviewed 23 Jan 2025). https://www.nhs.uk/conditions/dementia/living-with-dementia/home-environment/ (V)
- **G12** Dementia Australia, Tools and aids to help at home (updated 28 Nov 2025). https://www.dementia.org.au/living-dementia/home-life/tools-and-aids-help-home (V)
- **G13** Dementia Australia, Dementia-friendly tips for health workers (updated 18 Mar 2026). https://www.dementia.org.au/professionals/clinical-tools-and-resources/dementia-friendly-tips-health-workers (V)
- **G14** Dementia Australia, Going to hospital. https://www.dementia.org.au/living-dementia/staying-healthy/going-hospital (S)
- **G15** Dementia Australia, Dementia-friendly environments: Adapting your home (PDF, reviewed May 2022). https://www.dementia.org.au/sites/default/files/2024-03/Adapting-Your-Home.pdf (S)
- **G16** NIA, Tips for living alone with early-stage dementia. https://www.nia.nih.gov/health/alzheimers-and-dementia/tips-living-alone-early-stage-dementia (S; NIA returned HTTP 405 to fetches)
- **G17** NIA, Coping with agitation, aggression, and sundowning. https://nia.nih.gov/health/alzheimers-changes-behavior-and-communication/coping-agitation-aggression-and-sundowning (S). Also not readable: https://www.nia.nih.gov/health/alzheimers-changes-behavior-and-communication/tips-coping-sundowning (HTTP 405)
- **G18** NICE CG103, Delirium: prevention, diagnosis and management (2010 text, clock and calendar item). https://www.nice.org.uk/guidance/cg103/chapter/1-Guidance (S; HTTP 403). Secondary: https://pmc.ncbi.nlm.nih.gov/articles/PMC3766659/table/T3 (S)
- **G19** NICE NG97, Dementia. https://www.nice.org.uk/guidance/ng97/chapter/Recommendations (not read; HTTP 403; no claims made)
- **G20** Home Instead UK, Best clocks for dementia (© 2026). https://www.homeinstead.co.uk/care/specialist/dementia/best-clocks/ (V)
- **G21** Living Made Easy (impartial UK equipment information): Clockaid https://livingmadeeasy.org.uk/product/clockaid-dementia-clock (V); MemRabel 2 https://livingmadeeasy.org.uk/product/memrabel2-dementia-clock (V)

### Scholarly (named, not reviewed; scholarly, not resolved via LibKey) (K)

- **K1** Cochrane review, Reality orientation for dementia (Spector et al., 2000). Current status not checked. (U)
- **K2** Cochrane review, Cognitive stimulation to improve cognitive functioning in people with dementia (Woods et al., 2012; updated 2023). (U)
- **K3** Brunel University repository: qualitative study of calendar use by people with dementia and carers (six dyads, occupational-therapy framing). https://bura.brunel.ac.uk/bitstream/2438/16639/3/FullText.pdf (S)

### Competitors and products (C)

- **C1** Calendar Clock (Jelter B.V.), App Store. https://apps.apple.com/us/app/-/id1582133775 (V)
- **C2** Calendar Clock Dementia Clock, Google Play. https://play.google.com/store/apps/details?id=net.jelter.calendarclock (V; updated Oct 4, 2026; reviews dated Oct 2022, Jun 2024, May 2026)
- **C3** Calendar Clock website. https://calendarclock.app/ (V)
- **C4** RecallCue website. https://www.recallcue.com/ (V)
- **C5** RecallCue: Dementia Clock, Google Play. https://play.google.com/store/apps/details?id=com.recallcue.care (V; updated Oct 1, 2026; reviews dated 2024–2026)
- **C6** Dementia/Digital Diary/Clock (Fashmel), Google Play. https://play.google.com/store/apps/details?id=com.fashmel.alzclock (V; updated Apr 29, 2024; reviews 2019–2025)
- **C7** Day Clock (Dementia Clock), Technology4Seniors LLC, App Store. https://apps.apple.com/app/day-clock/id6448065413 (V)
- **C8** Memory Care Clock (Innodroid), App Store. https://apps.apple.com/app/id6745558944 (V)
- **C9** Maziance Dementia Clock, App Store. https://apps.apple.com/app/id6469570354 (V)
- **C10** Clarity: Dementia & Alzheimers, App Store. https://apps.apple.com/app/id6788494955 (V). Release year from https://appshunter.io/ios/app/clarity-dementia-alzheimers/id6788494955 (S)
- **C11** ShowTime Simple Clock Display, App Store. https://apps.apple.com/app/id1582359577 (V)
- **C12** App Store search, "dementia clock". https://apps.apple.com/us/iphone/search?term=dementia%20clock (V)
- **C13** Google Play search, "dementia clock". https://play.google.com/store/search?q=dementia%20clock&c=apps (V)
- **C14** Idem smart reminder clock, Alzheimer's Society shop. https://shop.alzheimers.org.uk/products/idem-smart-reminder-clock (V)
- **C15** Alzheimer's Society shop, Clocks and watches. https://shop.alzheimers.org.uk/collections/clocks-and-watches (V)
- **C16** Relish, Dementia clocks (US). https://relish-life.com/us/dementia-clocks (V)
- **C17** Relish blog, The best dementia day and calendar clocks for seniors (11 Jul 2026; Relish is a seller). https://relish-life.com/en-us/blogs/articles/best-calendar-clocks-for-dementia (V)
- **C18** American Lifetime on Walmart. https://www.walmart.com/ip/659531232 and https://www.walmart.com/ip/340277873 (S; the page showed a human-verification screen)
- **C19** Robin day clock: Walmart https://www.walmart.com/ip/230084261 (S); EFTM review (Jul 2021) https://eftm.com/2021/07/robin-day-clock-review-simple-time-and-a-difficult-time-dementia-clock-214140 (S)
- **C20** DayClox (UK). https://www.dayclox.com/ (V)
- **C21** Memwake on Walmart. https://www.walmart.com/ip/12/17326551183 (S). memwake.com and memwake.co.uk: DNS lookup failed on 2026-10-11 (V)
- **C22** MyHomeHelper. https://www.myhomehelper.co.uk/ (V)
- **C23** Komp (No Isolation). https://komp.family/ (V)
- **C24** Skylight: https://myskylight.com/ (V); Plus https://myskylight.com/plus/ (V)
- **C25** Hearth Display. https://hearthdisplay.com/ (V)
- **C26** GrandPad. https://www.grandpad.net/ (page content not readable; no claims made)
- **C27** ViewClix. https://viewclix.com/ (V); day-clock mention from search summary of https://viewclix.com/llms.txt (S)
- **C28** Amazon, Alexa Together is helping bridge the miles between families (update dated 21 May 2025 says it is no longer available). https://www.aboutamazon.com/news/devices/alexa-together-is-helping-bridge-the-miles-between-families (V)
- **C29** The Senior List, Alexa for seniors (15 Nov 2025). https://www.theseniorlist.com/caregiving/alexa-together (V)
- **C30** Frank's Easy Tech Corner #10, Echo Show as an always-on clock (30 Oct 2023). https://frankseasytechcorner.substack.com/p/how-to-make-an-amazon-echo-show-act (V)
- **C31** AFTVnews, Echo Spot clock faces (article 4 Mar 2018; reader comment 5 Mar 2019). https://www.aftvnews.com/?p=27954 (V)
- **C32** Tech Enhanced Life, Needed a large clock due to vision loss (Frank Engelman, developer of the T4S Day Clock app; 1 May 2023, updated 25 Sep 2023). https://www.techenhancedlife.com/articles/needed-a-large-clock-due-to-vision-loss (V)
- **C33** It's All Widgets, Calendar Clock. https://itsallwidgets.com/calendar-clock (V)
- **C34** Kisa, Best dementia clocks Australia. https://kisa.com.au/news/best-dementia-clocks-australia (S)
- **C35** Best Buy, Dazzed Corner 7" digital calendar. https://www.bestbuy.com/product/dazzed-corner-digital-clocks-7-digital-calendar-for-seniors-large-display-black/JXTV5VW463/sku/11827692 (S). Listing text with a help button seen in search summaries (S)
- **C36** Complete Care Shop, Day clock. https://completecareshop.co.uk/products/day-clock (S)
- **C37** onlineclock.net. https://onlineclock.net/about/ (S)
- **C38** Friendly Clock, Microsoft Store. https://apps.microsoft.com/detail/9nblggh402rc (S)

### Forums and anecdotes (F)

- **F1** Talking Point, What dementia clocks are best? (from 15 Oct 2024). https://forum.alzheimers.org.uk/threads/what-dementia-clocks-are-best.154493/ (V)
- **F2** Talking Point, Excellent dementia "clock" app (28 Jan–1 Apr 2026). https://forum.alzheimers.org.uk/threads/excellent-dementia-clock-app.170219/ (V)
- **F3** Talking Point, Best digital dementia clock / reminder for distance (14 Mar 2024–20 May 2025). https://forum.alzheimers.org.uk/threads/best-digital-dementia-clock-reminder-for-distance.147010/ (V)
- **F4** Talking Point, Online screen system (24 Jun–2 Jul 2024). https://forum.alzheimers.org.uk/threads/online-screen-system.150528/ (V)
- **F5** Talking Point, Tabletop electronic calendar (5–6 Jul 2025). https://forum.alzheimers.org.uk/threads/tabletop-electronic-calendar.163937/ (V)
- **F6** Talking Point, Clock with remote messaging facility (4 Jun 2021). https://forum.alzheimers.org.uk/threads/clock-with-remote-messaging-facility.127617/ (V)
- **F7** Talking Point, Telling the time / clock readability, making a device (older thread). https://forum.alzheimers.org.uk/threads/telling-the-time-clock-readiability-making-a-device-need-advice-please.99542/ (S)
- **F8** Talking Point, Day & night clock needed (zeezap; older thread). https://forum.alzheimers.org.uk/threads/day-night-clock-needed-any-product-suggestions.56674/ (S)
- **F9** Talking Point post on iPad settings and a forgotten passcode. https://forum.alzheimers.org.uk/goto/post?id=2061988 (S)
- **F10** AgingCare, Anyone's dementia patient get confused looking at a clock or calendar? (Nov 2015). https://www.agingcare.com/questions/dementia-patient-get-confused-looking-at-clock-or-calendar-190884.htm (V)
- **F11** AgingCare, Calendar issues: have others taken the calendar away? (Dec 2022–Jan 2023). https://www.agingcare.com/questions/calendar-issues-have-others-taken-the-calendar-away-to-ease-the-confusion-478771.htm (V)
- **F12** AgingCare, Is there a device that shows what day it is and the date? (Apr 2015). https://www.agingcare.com/questions/device-that-shows-what-day-it-is-and-date-179712.htm (V)
- **F13** AgingCare, Tools for organizing schedules and routines in dementia? (Jul 2019). https://www.agingcare.com/questions/tools-for-organizing-schedules-and-routines-in-dementia-450845.htm (V)
- **F14** AgingCare, Confused about time? (Dec 2015). https://www.agingcare.com/questions/confused-about-time-192967.htm (V)
- **F15** AgingCare, How do I help mom remember what day of the week it is? https://www.agingcare.com/questions/how-do-i-help-mom-remember-what-day-of-the-week-it-is-191854.htm (S)
- **F16** AlzConnected, Explaining the concept of time (first post May 30; year not shown). https://alzconnected.org/discussion/76179/explaining-the-concept-of-time (V)
- **F17** AlzConnected, Dementia needs; My saddest day. https://alzconnected.org/discussion/75239/dementia-needs and https://alzconnected.org/discussion/75488/my-saddest-day (S)
- **F18** Lemmy self-hosting thread on a remotely updated dementia clock and an old iPad. https://lemmy.klein.ruhr/post/4557 (host didn't resolve); mirror https://scribe.disroot.org/post/45423 (S)
- **F19** Battery swelling in tablets kept on charge: https://community.openhab.org/t/bloated-battery-in-tablet-fire-hazard/145821 ; https://community.smartthings.com/t/fire-tablet-kiosk-charging-24-7-okay/182227 ; https://techenclave.com/t/need-tablet-display-on-24x7-should-i-continuously-charge-or-have-charge-and-discharge-cycles/256337 (S)
- **F20** Apple Community, Auto-Lock problems: https://discussions.apple.com/thread/8433367?page=3 ; https://discussions.apple.com/thread/254469183 (S)

### Market size and settings (M)

- **M1** Alzheimer's Association, 2026 Alzheimer's Disease Facts and Figures. https://www.alz.org/alzheimers-dementia/facts-figures (V)
- **M2** AARP press release, 63 million family caregivers (24 Jul 2025). https://www.aarp.org/press/releases/2025-07-24-new-report-reveals-crisis-point-for-americas-63-million-family-caregivers.html (V)
- **M3** AARP long-distance caregiving: https://www.aarp.org/caregiving/basics/info-2019/long-distance-care.html (S); https://employerportal.aarp.org/resource/tips-for-being-a-long-distance-caregiver/ (S)
- **M4** Care-home orientation and signage:
  - Living Made Easy, communal orientation board: https://livingmadeeasy.org.uk/product/communal-orientation-board (S)
  - Crossroads Hospice blog (2017): https://crossroadshospice.com/hospice-palliative-care-blog/2017/august/16/orientation-board-activities-for-dementia-patients (S)
  - XOGO digital signage blog (2022): https://www.xogo.io/digitalsignageblog/2022/1/25/digital-signage-for-memory-care (S)
- **M5** Google autocomplete, raw suggestions fetched 2026-10-11, for example https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=dementia%20clock (V; seeds: dementia clock, dementia clock app, day clock, day clock for, calendar clock for, free dementia clock, dementia clock for ipad, dementia clock online, old ipad as)

### Search-result pages used for section 7 and for snippets (R)

All are search-tool summaries (S), 2026-10-11.

- **R1** "dementia clock". Notable results: https://www.bettercaremarket.com.au/blogs/post/the-best-clock-for-people-with-dementia.html ; https://shop.agespace.org/?p=2046 ; https://manageathome.co.uk/around-the-home/hearing-vision/dementia-clocks ; https://www.completecareshop.co.uk/living-aids/hearing-vision-aids/clocks-watches/dementia-care-day-and-night-clock ; https://relish-life.com/us/dementia-clocks
- **R2** "day clock for elderly". Spam subdomains plus https://www.walmart.com/ip/230084261 ; https://www.desertcart.nz/products/33660639
- **R3** "dementia clock app". App Store listings, https://shop.alzheimers.org.uk/products/idem-smart-reminder-clock , https://kisa.com.au/news/best-dementia-clocks-australia
- **R4** "free dementia clock online". App Store listings only, plus spam
- **R5** "calendar clock for seniors". Spam plus the Best Buy listing (C35)
- **R6** "day clock online". https://completecareshop.co.uk/products/day-clock ; https://onlineclock.net/about/ ; https://www.argos.co.uk/sd/day-clock/ ; https://askjan.org/products/DayClock.cfm ; https://www.dayclocks.com
- **R7** Packaging without the word "dementia" (buyer review quoted in a search summary; source page not identified). (S)
- **R8** Echo Show and caregiver searches: Talking Point Drop In post https://forum.alzheimers.org.uk/goto/post?id=1718294 ; Emergency Assist pricing coverage https://www.tomsguide.com/news/alexa-emergency-assist-what-it-is-how-much-it-costs-and-how-it-could-save-your-life ; dementia-tech commentary on setup needing a smartphone (S)
- **R9** Talking Point tablet and app threads, search summary (a clock that went blank with the wrong time; a relative likely to ignore messages). (S)
- **R10** "Loving Frame" search: https://relish-life.com/products/digital-photo-frame ; https://shop.alzheimers.org.uk/products/digital-photo-frame (S)
- **R11** MemoClock, 2019 INDEX award nominee. https://theindexproject.org/award/nominees/3222 (S)
- **R12** "dementia clock online free website" searches (no browser tool found; an old Samsung tablet review quoted in a summary). (S)
- **R13** GitHub / web-app search for an open-source day clock: none dementia-specific found. (S)
