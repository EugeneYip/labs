# Validation plan: Day Clock

Comparative Research (2026-10-11). The decision is **STOP FOCUSED VALIDATION** (VALIDATION_BRIEF.md): no human discovery is recommended. This file records what a minimal test would look like if the owner ever reopens it, so the reasoning isn't lost. Nothing here starts without the owner's explicit authorization.

## Hypotheses (for the record)

| # | Hypothesis | Status after desk research | What would confirm | What would disconfirm |
|---|---|---|---|---|
| H1 | Caregivers need a display of the weekday and part of day | Survives, with stage caveats | Guidance endorses it [V] | Clocks ignored or confusing as dementia progresses [V] |
| H2 | A browser page beats cheap hardware | Mostly falsified | Caregivers with idle tablets choosing it over a $25–$60 clock | They buy hardware for simplicity |
| H3 | A browser page beats existing tablet apps | Falsified on features | Caregivers preferring "no install, no account" enough to switch | They're content with free apps, several of which add remote updates |
| H4 | Remote updates aren't essential | Falsified for caregivers living away | On-site caregivers never ask for it | Most ask for it |
| H5 | "Try a day clock free before buying" resonates | Untested | Families or occupational therapists saying they'd use it that way, unprompted | Nobody frames the decision that way |

## Cheap non-human checks (owner's approval needed; not done in this phase)

These are technical tests, not user research, and would cut fragility whatever the decision:
1. Run Day Clock for several days on the oldest supported iPad (iPad 5th or 6th gen, iPadOS 16.7) in both a Safari tab and Home Screen mode: wake lock, recovery after sleep, restart behavior, storage after a week without a tap.
2. Check it on a Fire tablet and an Android 7–9 tablet.

## If reopened: the smallest human test

- **Who:** 3–5 caregivers who live with or near a person with memory loss and own a spare tablet; recruited personally (RECRUITMENT_CHANNELS.md).
- **Format:** 20-minute problem interviews; Day Clock shown only at the end.
- **Questions:** what they use now for day and time; what happened with it; who sets things up and changes them; whether anyone needs to change it from elsewhere; whether they'd set up a tablet themselves (keep-awake, locking, charging); whether trying a clock free before buying one would matter.
- **Stop** if most say remote updating is essential, already use a free app or hardware happily, or wouldn't set up a tablet themselves.
- **Continue to a two-week home trial** only if at least 3 of 5 would set it up themselves, don't need remote changes, and lack a satisfactory option. Trial success: still running and looked at by the person after two weeks, with fewer repeated questions reported, and recovery after a power cut. Collect no personal or health information about the person.

## Stages

Stage B (validated experiment) would require a successful home trial; Stage C (standalone) would require sustained use beyond the owner's network. Stage D (remote updates) can't happen in Labs and would bring servers, accounts, and health-adjacent data duties (RISK_AND_COMPLIANCE.md). Given the competition, none of these is expected.
