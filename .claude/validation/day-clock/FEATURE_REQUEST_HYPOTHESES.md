# Feature request hypotheses: Day Clock

Recorded during Comparative Research (2026-10-11). **None is to be built.** A feature request becomes evidence only when a real user needs it. Competitors' features and forum requests are context, not demand from Day Clock's users. Status: *Hypothetical* (our idea or competitors only), *Indirect* (caregivers show the need in public sources), *Direct* (a Day Clock user asked; none yet). Labs fit: *Yes* (static, local) or *No* (needs servers, accounts, or keys).

| # | Idea | Status and signal | Labs fit | Main cost or risk |
|---|---|---|---|---|
| 1 | Remote updates (change messages and reminders from a phone) | **Indirect, strongest signal**: the most repeated caregiver request; offered by Calendar Clock, RecallCue, Memory Care Clock, MyHomeHelper [V] | **No** | Servers, accounts, health-adjacent data duties; the reason the product can't compete for caregivers living away |
| 2 | Photos and video calls | Indirect: the paid features elsewhere [V] | No (calls); photos locally Yes | Scope; privacy |
| 3 | Weather and temperature | Hypothetical: the free same-name app and Calendar Clock Premium offer it [V] | Partly (needs a keyless weather source) | Adds a network dependency to an offline clock |
| 4 | Audible alarms | Hypothetical; caregivers report alarms confusing people [V] | Yes | Pushes toward "medication reminder" territory; deliberately absent |
| 5 | Medication confirmations or adherence logs | Hypothetical | Yes technically | **Never**: medical-device and safety territory (RISK_AND_COMPLIANCE.md) |
| 6 | Wake-lock status warning ("the screen may turn off") | Indirect: screen sleep is the top tablet complaint [V] | Yes | Low |
| 7 | Prefer on-device voices for read-aloud | Indirect: privacy research | Yes | Some devices have no local voice |
| 8 | Supported-devices list and a printable setup card per platform | Indirect: setup burden [V] | Yes (documents) | Low |
| 9 | Calendar sync (show a family's shared calendar) | Indirect: one caregiver wanted a display linked to Google Calendar [V] | No (OAuth, keys) | Accounts |
| 10 | Older-browser support (iPadOS 15) | Indirect: the free same-name app runs there [V] | Yes, with a build change | Build infrastructure change; testing burden |
| 11 | Neutral wording (no condition names in headlines) | Indirect: device-rule research | Yes | Low |
| 12 | Language packs for day parts | Hypothetical: words are already editable | Yes | Low |

Building anything requires a separate owner decision.
