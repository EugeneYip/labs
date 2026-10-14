# #033 Captions Up

Dossier. The decision and its evidence are in `CANDIDATES.md` ("Discovery for #033") and `research/m-care.md`. Address: `labs.eugeneyip.net/captions-up/`, homepage category `groups`, code in `src/experiments/captions-up/`, built on the local branch `wip/033-captions-up`.

## The job

A fringe, amateur, school, or community company puts on a captioned performance for d/Deaf and hard-of-hearing audiences, with nobody trained in captioning. The Edinburgh Fringe tells such companies to make the captions themselves: slides of "around two or three lines", each line with the speaker's name, song information, and sound effects, advanced by a member of the company during the show, and rehearsed. Today that's PowerPoint, a slide at a time, for a whole script, re-edited when the script changes.

## Scope (first version)

- **Prepare:** paste the script (or open a text file). Speakers are recognised in the common layouts (`NAME: line`, `NAME. line`, a name in capitals at the start of the line, or a name on a line of its own above the speech); stage directions in parentheses are left out; directions in square brackets are kept as sound captions (`[Door slams]`); `ACT` and `SCENE` headings become places to jump to. Each speech is split into captions of up to 2 lines (3 if chosen) of up to about 40 characters (changeable), at sentence ends first, then at commas and the like, then between words, never inside a word; the speaker's name goes before the first caption of each speech. Every caption is shown before the show and can be edited, split, joined, deleted, or added (a blank one for a blackout).
- **Run:** an operator view on the laptop (the caption on screen, the next and the previous; Space or → for the next, ← for the previous, B for a blank screen, jump to a scene or a caption number, find a word) and an audience window for the projector or a TV: white on black, large, the caption alone, a full-screen button. The audience window follows the operator in the same browser. A single-screen mode shows the caption alone with tap or Space to advance, for a tablet mirrored to a TV.
- **Saved:** the show, its captions, and the caption on screen are saved in this browser after every change, so a reload or a crash mid-show comes back at the same caption; two tabs don't erase each other; a backup file downloads and opens again (another laptop); the captions print as a numbered cue script and download as plain text (a caption per block) for other caption software.
- **Left out:** timing captions to audio or speech recognition, translation (surtitles), captions on audience phones, several screens with different text, video or music cues, reading Word or PDF files (paste their text instead).

## Principal failure modes, and how each is handled and checked

| # | Risk | Handling | Check |
|---|---|---|---|
| 1 | Script layouts read wrongly (names, directions, scene headings, songs) | Several layouts recognised; every caption visible and editable before the show; a summary of what was read (speakers, captions, scenes) | Parser cases from varied layouts; the read summary checked |
| 2 | Bad splits (a line too long, a word broken, a name separated from its speech, a caption of one word) | Splitting rules in one function: sentence, clause, word boundaries; never over the length; widow joining | Property checks over random text (lengths, every word kept in order, nothing lost) and hand cases |
| 3 | The show stops mid-performance (a reload, a crash, a closed window) | The position saved at every step; the audience window reconnects; nothing needs the network | Browser: reload mid-show, close and reopen the audience window, offline |
| 4 | The audience window falls behind or shows the wrong caption | Storage events (as #032's leaderboard), with the caption number shown to the operator; the audience window never writes | Browser: two windows, rapid advancing |
| 5 | Accidental keys in the dark (a double tap skipping a caption, typing in a box) | Keys act only on the operator view, not inside boxes; previous always one key away; jump by number | Browser keyboard cases |
| 6 | Captions hard to read (contrast, size, too much text) | White on black, large type, size and lines changeable; length limits shown while editing | Visual review at projector sizes; axe on the operator view |
| 7 | Claiming more than it does | Says it follows the Fringe's stated layout, not any captioning standard; captioning is skilled work and the page says to rehearse | Wording review |
| 8 | The script leaving the device | No network use after load; saved only in this browser | Network log |
| 9 | Phone and tablet widths; print | The editor stacks; single-screen mode for tablets; the cue script prints | 320, 390 and 1280 px at 200% text; print to PDF |
| 10 | Large scripts | A full-length play (2,000+ captions) prepared and run without lag | Timed runs in both engines |

## Evidence plan

- Parser and splitter checks: hand cases from each script layout; property checks over random speeches (every word kept, in order; no line over the limit unless a single word is longer; no empty caption); an independent re-check in Python of the splitting invariants on the cases the tests write.
- A realistic script (an invented two-act play in mixed layouts) prepared and run in both engines, with reloads mid-show and the audience window followed caption by caption.

## Log

- **2026-10-14:** chosen (`CANDIDATES.md`). Risk list written.
- **2026-10-14:** `model.ts` (milestone e8f7d3f): reading scripts, splitting speeches, re-fitting, saved form, position apart from the show. Checks: each layout, directions and sounds, headings, capitals that aren't names, numbered names (1ST WITCH), tabs; 3,000 random speeches (every word kept in order, limits kept, the name first); a 3,000-speech script in 55 ms; an independent Python re-check of 500 speeches (greedy wrap and greedy packing included).
- **2026-10-14:** the page (milestone after e8f7d3f), then the audit. Browser harness `cu-flow.cjs` (Chromium and WebKit, desktop light and phone dark): a script in mixed layouts read (speeches, sounds, scenes, directions, speakers) and its captions checked against the speeches written (every word in order, each name first, limits); split at the cursor, join, blanks, new captions, deletions, re-fitting to 1 line of 30; running by Space, arrows, Page Up and Down, Backspace, B, Home, a caption number, and a scene; the audience window following and blanking, never writing; reload mid-show; single screen; the text file, a backup opened in another browser, a damaged backup refused; the cue script printed alone; a 3,000-speech play (6,000 captions made in 0.12–0.14 s; 20 presses in 13–15 ms); refused and damaged storage; axe on every view; overflow at 320, 390 and 1280 px (200% text at the last two). The audit found and fixed, in the product: the key handler threw on events not aimed at an element; Space on a focused button advanced twice (now the button's own); quick presses or edits could be lost to stale state, and "Fit every caption" lost its new limits to a second update (functional updates now); speaker names starting with a number (1ST WITCH) weren't recognised; the caption box was narrower than a caption line and wrapped it, misrepresenting the caption (now as wide as a line, without soft wrapping); single screen's faint controls failed contrast. Final: model checks 31 of 31, the Python re-check 500 of 500, the browser harness 96 of 96 in each engine, the cue script printed to PDF, the audience window reviewed at 1920 × 1080.
- **2026-10-14: shipped and verified in production.** Commit 97833cd (one squashed commit from `wip/033-captions-up`), deploy 38529994425. Live files byte-identical to a fresh build (77 files, 111 addresses); `cu-flow.cjs` on the live site 96 of 96 in Chromium and in WebKit; offline (the service worker keeps the page; with the network cut, the example made into captions and run, and the audience window following) and the homepage card under Groups & community, 7 of 7 in each engine (`cu-prod-extra.cjs`); the site smoke test 136 loads, no problems; the daily check 11 of 11. `wip/033-captions-up` deleted.

## Lifecycle

Provisional **MAINTAIN**, and the batch's strongest candidate for human validation after New Classes: a company captioning one performance with it would show quickly whether the splitting saves the slide-building and whether the run holds up in a hall. Unvalidated (Labs doesn't contact anyone). Archive if companies keep to PowerPoint or Captitles' free plan, or if captioning moves wholly to phones.
