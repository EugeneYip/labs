# Validation brief: Day Clock

Winner Validation, Comparative Research (2026-10-11). Internal; research only, nobody contacted. Evidence: `notes/market-notes.md` (caregiver guidance, pain, competitors, search, monetization) and `notes/device-risk-notes.md` (old tablets, keeping the screen on, hazards, medical-device boundary, privacy). Labels: **[V]** read on the source; **[S]** snippet or secondary; **[U]** unverified or inference. Claims marked **[V, rechecked]** were confirmed directly during synthesis.

## Decision: STOP FOCUSED VALIDATION

The job is real, and health bodies endorse it. But a browser page doesn't beat what caregivers already have: free tablet apps doing the same thing (one even called "Day Clock"), well-reviewed hardware for about $25–$60, and free apps that already offer the one thing caregivers most often ask for, updating the clock remotely, which Labs' rules rule out. Day Clock stays a good, maintained Labs tool. It shouldn't take the owner's human-validation time.

## Core question

Is a browser-based dementia orientation clock genuinely useful compared with inexpensive hardware clocks and existing tablet apps?

**Answer: not as a broad claim.** What survives is a narrow, unproven niche (caregivers living with or near the person, with a spare tablet, who don't need remote updates), plus one interesting but untested angle (try a day clock free before buying one). The evidence doesn't show that niche is large, or that its members are looking.

## The common analysis

| | Finding |
|---|---|
| **User (narrowest beachhead)** | Caregivers who live with or near the person (often a spouse) and already own a spare tablet. Not adult children living away: their main need is remote updates |
| **Job** | Orientation to weekday, date, and time of day, so the person can see it without asking; secondarily, on-screen reminders and a standing message. Kept separate from any medical or safety function |
| **Current solution** | Dedicated day clocks (plug in, no setup), calendars and whiteboards, smart displays, free or freemium tablet apps; in care homes, orientation boards and staff prompts [V] |
| **Pain** | Repeated "what day is it?" questions and night confusion are real [V]. Results with clocks are mixed: helpful early on for some, ignored, hidden, unplugged, or confusing for others as dementia progresses (forum threads 2015–2026) [V] |
| **Competition** | Hardware: American Lifetime about $60 with about 4.9 stars from about 6,700 Walmart ratings [S]; many US listings $13–$65 [S]; UK charity-shop clocks £24–£56 [V]. Free apps: Technology4Seniors' "Day Clock" for iPad (part of day with editable periods, speaks the time, iPadOS 15+) [V, rechecked], Clarity, Fashmel; Calendar Clock, free forever in its basic version, 20,000+ daily users, with a companion app for remote control [V, rechecked]; RecallCue free basic, Pro $9.99 a month [V] |
| **Wedge** | No install, no account, no data leaving the device, any browser (including Android and Fire), editable words and times, reminders and a message. The one concrete technical edge, running on tablets too old for current apps, is **false for iPads**: Day Clock needs iPadOS 16.4, while the free same-name app runs on iPadOS 15 [V] |
| **Frequency** | Daily use by the person, once set up; the caregiver's job (choosing and setting up a clock) is occasional. Forum questions about which clock to buy recur every year or two [V] |
| **Reachability** | Medium: caregiver forums (Alzheimer's Society Talking Point, AlzConnected, AgingCare), occupational therapists, equipment listings. Professionals recommend from trusted catalogues, not unknown web pages [U] |
| **Trust barrier** | Medium to high: an unknown site, worry about reliability for a vulnerable person, and setup (keep-awake, Guided Access, charging) falling on the caregiver |
| **Expansion pressure** | **Immediate and outside Labs' limits.** Remote updating is the most repeated need [V], and every product offering it runs servers and accounts. Video calls, photos, and weather are the paid features elsewhere |
| **Monetization** | The plain clock is priced at $0 by the market; money is in hardware and remote or video services [V]. Not a constraint for Labs, but it confirms the free core isn't scarce |

## Strongest counter-evidence

1. **The core is already free on tablets**, including a free iPad app with the same name and nearly the same features, which also runs on older iPads than Day Clock does [V, rechecked].
2. **Remote updating, the most repeated caregiver need, is offered free or cheaply by apps** (Calendar Clock's companion app; RecallCue) and is impossible within Labs' rules [V].
3. **Cheap hardware is popular** and needs no setup: plug in and it works, with nothing to close or keep awake [S].
4. **A browser clock is fragile in exactly this use:** on iPads before iPadOS 18.4, keep-awake doesn't work for Home Screen web apps (the mode that protects saved settings from Safari's storage cap); a restart or overnight update leaves the tablet at a passcode screen; Low Power Mode forces a 30-second auto-lock; Fire tablets have no documented "never sleep" [V].
5. **Clocks don't help everyone:** caregivers report them ignored, hidden, or confusing as dementia progresses [V].

## What survives

- No free browser-based day clock appeared for any query, and autocomplete shows people do type "dementia clock online" and "day clock online" [S/V]. Volume is unknown.
- "Try a day clock free before paying £50–£270" is the most distinctive angle found, but nobody was seen asking for it in those words [U].

## Product status

Unchanged; no harmful claim. Notes for later, with the owner's approval:
- The public summary says "for someone living with dementia". For a commercial product in the UK or EU, wording aimed at compensating for a condition can make software a medical device; a free, non-commercial page is probably outside those rules, but neutral wording ("an easy-to-read calendar clock for a spare tablet") is safer (RISK_AND_COMPLIANCE.md).
- Read-aloud speaks the message and due reminders; with an online voice, that text goes to the voice provider. Preferring on-device voices would make "settings stay on this device" fully true in spirit.
- A visible warning when the screen may sleep (Home Screen mode before iPadOS 18.4, or no wake lock), a plain list of supported devices, and a printable setup card would cut the fragility.

## What would reopen this

- Evidence that a meaningful number of caregivers search for a free online day clock and set one up themselves (for example, organic feedback once a no-account feedback channel exists).
- An occupational therapist or dementia adviser wanting a free "try before you buy" tool for families, unprompted.

Even then, remote updating would come up quickly, and it can't be built in Labs.

## Research limits

Retail review text (Walmart, Amazon) and some official pages (Alzheimer's Society main pages, NIA, NICE, HHS) blocked automated reading, so those points rest on snippets. Reddit wasn't read. No controlled studies of home day clocks were reviewed (LibKey unavailable; scholarly items are named only). Day Clock itself wasn't tested on old Safari versions or with wake lock in Home Screen mode in this phase.
