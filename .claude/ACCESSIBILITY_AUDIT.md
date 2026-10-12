# Accessibility audit

P2 of the autonomous queue, 2026-10-11, covering all 25 experiments and the homepage.

**Target.** WCAG 2.2 AA, plus axe best practices for landmarks and headings.

**Caveats:**
- Automated results are a floor, not proof. Hand checks covered keyboard use, focus, announcements, and the accessibility tree.
- **No real screen-reader session** (VoiceOver or NVDA) was run. Names, roles, and live regions were checked through axe, focus logs, and the browser's accessibility tree.

## Method

| Check | How | Scope |
|---|---|---|
| Automated rules | axe-core 4.14.0 (MPL-2.0), installed in a scratch folder, not the project. Injected with `.claude/qa/a11y-plan.mjs`; tags wcag2a/aa, wcag21a/aa, wcag22aa, best-practice | 26 pages × 1280 and 390 px × light and dark (104 runs) |
| Interactive states | `.claude/qa/a11y-states.mjs`: scripted flows, with axe at each state | Fluency Check (running, choosing the last word, results, saved); Custody Calendar (after a swap, a broken share link); Day Clock (settings, and night colors with a fake 23:15 clock); Photo Scrub (a photo added); Ranked Choice Count (four ballots, results); Clean Paste (the example cleaned). Each at 1280 light and 390 dark |
| Keyboard | Real key events through CDP: 30 Tab presses per page. A focus-in log records each element's name, `:focus-visible`, and outline | 26 pages |
| Keyboard flows | Real Arrow, Enter, and Space keys | A Fluency Check check, Day Clock read-aloud, arranging Discussion Map seats |
| Text resize | Root font size at 200%, 1280 px wide: overflow and clipped text containers | 26 pages |
| Reflow | 320 px width is covered by earlier sweeps (no sideways scroll on 26 pages) | — |
| Accessibility tree | The built-in browser's tree | Fluency Check during a check |
| Code review | Click handlers on non-interactive elements, pointer-only handlers, drag zones, dialogs, motion, removed outlines | All of `src/` |

## Results after fixes

- **axe:** 0 violations on all 104 page runs and all 20 state runs, including night colors and target size (2.5.8).
- **Keyboard:** no traps; every focused control has a name; every one shows a focus ring. The site-wide `:focus-visible` outline is never removed: no `outline-none` anywhere.
- **Text at 200%:** no overflow and no clipped text on any page.
- **Dialogs:** the only one, Trip Board's confirm, is a native `<dialog>` opened with `showModal()`. That gives focus trapping, Escape to close, an inert background, and focus returned on close.
- **Drag and drop:** every drop zone has a button that opens the file picker (Photo Scrub, CSV Checkup, Back Row, Form Check).
- **Color alone:** Custody Calendar's second parent has stripes as well as a color, with borders for handovers and dashes for swaps. Fluency Check errors are struck through, not just red. Frost Dates' chart has a table version.

## Material findings fixed

| Experiment | Finding | WCAG | Fix |
|---|---|---|---|
| Back Row | Grey note text on a 3% tint: 4.32:1 in light mode | 1.4.3 | The tint was removed, keeping the border |
| Day Clock | Corner controls (Full screen, Settings) at 40% opacity: 2.58:1 | 1.4.3 | 70% opacity. Still quiet; passes in day and night colors |
| Day Clock | Read-aloud worked only by tapping the clock face, a `div` with `onClick` | 2.1.1 | A "Read aloud" button in the corner controls, shown when read-aloud is on |
| Fluency Check | Pressing Start removed the focused button, so focus fell to the top of the page while the clock ran | 2.4.3 / 2.1.1 (usability) | Focus moves to the first word when a check starts (verified by keyboard: Arrow, Enter, and Space mark words) |
| Fluency Check | The score wasn't announced when the check ended; the live region only said "Tap a word to fix its mark" | 4.1.3 | The live region now starts "Done: N words correct per minute, N% accuracy" |
| Fluency Check | The timer's context was an `aria-label` on a `<p>`, which screen readers ignore | 4.1.2 | Visually hidden " left" or " so far" after the time; the tree shows "1:00 left" |
| Discussion Map | Arranging seats was drag-only | 2.1.1, 2.5.7 | Arrow keys move a selected seat while arranging (Shift for bigger steps). The label and hint say so |
| Numbers by Ear, Family Stories | Pulsing animations ignored reduced motion | 2.3.3 (AAA), and the brief's reduced-motion check | `motion-safe:animate-pulse` |
| Stall Till | Smooth scrolling ignored reduced motion | Same | `auto` when reduced motion is set |

## Findings recorded, not fixed

| Experiment | Finding | Why not now |
|---|---|---|
| Custody Calendar | The year view puts 365 day buttons in the tab order (about 400 tab stops). Everything is reachable; the share and print buttons come before the calendar | Efficiency, not a WCAG failure. **P13 candidate:** arrow keys within each month (one tab stop per month), as in Fluency Check's passage |
| Form Check | Drawing on the video is pointer-only | Path-dependent input is an allowed exception to 2.1.1. Playback, stepping, the slider, and everything else work by keyboard |
| Fluency Check | The assertive live region repeats "N errors" after each tap, alongside the word's own ", error" | It confirms the mark. Polite would interrupt less; minor |
| Gallery Wall, Playing Time | Results update as fields change, with no live summary | The results sit right after the fields in reading order; minor |
| Fluency Check | Word names repeat punctuation ("rain, , error") | Screen readers usually skip punctuation; negligible |

## Not covered

- Real screen readers: VoiceOver, NVDA, TalkBack.
- Windows High Contrast or forced colors.
- Switch access.
- Real-device zoom on iOS.
- Microphone and camera flows with assistive technology: In Tune, Family Stories, Form Check capture.

## Files

- **Plans:** `.claude/qa/a11y-plan.mjs`, `a11y-states.mjs`, `plan-keyboard.json`, `plan-text200.json`, `plan-fc-keyboard.json`, `plan-p2-fixes.json`, `plan-dayclock-night.json`.
- **Outputs:** `.claude/qa/out/a11y/`.
