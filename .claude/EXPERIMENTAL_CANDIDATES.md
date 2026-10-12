# Experimental candidates

P8 of the autonomous queue, 2026-10-12. The five experimental experiments each have an open question that, in `.claude/PORTFOLIO_RESOLUTION.md`, only real use can settle. This pass narrowed each one as far as possible without people, other devices, or downloads (recordings or tools from the internet would need the owner's yes). Everything here was made on this Mac: synthesized voices, clips from Apple's encoders, and a generated tone standing in for a microphone.

## #013 In Tune: does it hear a real singer?

**Method.** A source-filter singing voice with exact ground truth (`.claude/qa/voice-synth.ts`):
- Rosenberg glottal pulses with jitter (0.7%), shimmer (4%), and breath noise (−25 dB);
- through the vowel formants Peterson and Barney (1952) measured for men, women, and children ("ah", "ee", "oo");
- then three microphones: clean, a phone (a 150 Hz bass loss, room noise at 25 dB), and a cheap phone (250 Hz, 15 dB).

The page's own loop was replayed (`p8-intune-voice.ts`): every 33 ms the latest 2,048 samples, the 0.75 clarity gate, the median of five, and 1 s within ±30 cents to match. That was 900 sung notes across In Tune's three ranges, steady, with ±30 and ±60 cents of vibrato, 60 cents sharp, and a semitone flat. Then end to end: the synthesized singer as Chromium's microphone, against the real page (`p8-intune-browser.cjs`).

**Found.** When a vowel's first formant lifts the second harmonic above all the rest, the detector read an octave high. The cases: "ah" high in a man's range (G4 read as G5), "ah" at A4 for a woman, "oo" at G3, and "ee" at C3 through a cheap phone. At D5 "ah" it gave nothing at all. YIN's first dip was at half the true period. The singer could never match those notes. (An earlier version of this check made low notes look much worse; that was a bug in the synthesizer, whose breath noise didn't scale with the voice, and it was fixed before these numbers.)

**Fixed (commit d9753e4).** When the first dip is shallow and the dip at twice the lag is less than half as deep, twice the lag is the period. A truly periodic sound dips as deep at every multiple, so clean tones keep their reading; depths are compared between samples.

| Measure, 900 sung notes | Before | After |
|---|---|---|
| In-tune notes matched within 2.5 s (steady, ±30 cents) | 51–56 of 60 per microphone | 59–60 of 60 |
| The same with ±60 cents of vibrato | 47–53 of 60 | 55–57 of 60 |
| Readings more than 100 cents off | 4–12% | 0–3% |
| Out-of-tune notes matched (60 cents sharp, a semitone flat) | 0 | 0 |
| Median error | 7–11 cents | 7–11 cents |
| End to end, a man's G4 "ah" | "G5: about 12 semitones too high", never matched | matched in 3.1 s |

The generated-signal checks (`in-tune-signals.ts`) give byte-identical results, and the earlier octave checks still have 0 errors.

**Left as it is.** A child's "ah" at C5 and C♯5, where the first formant sits right on the second harmonic, still reads an octave high, nearly every time on all three microphones. B4 and D5 are right (`p8-intune-child-ah.ts`). There the first dip is too deep for the rule to trust: its depth is 0.012–0.027, under the rule's 0.03 floor. Looser rules were tried (`p8-intune-criteria.ts`). They fixed about two thirds of a child's octave-high readings, but they also read buzzy tones an octave low (a sawtooth at 806 Hz, `p8-intune-buzzy.ts`), and some men's and women's notes too. A buzzy tone's first dip between samples looks just like the child's "ah", so the floor stays.

**Still open:**
- a child's D4 "ee" reads about 1.5 semitones sharp in 3 or 4 readings in 10, before the fix and after;
- a child's D5 "ah" through the cheap phone is often below the clarity gate;
- nothing here is a real singer (scoops, consonants, breath), a real phone's sound processing (iOS may still smooth the voice), or a call interrupting Safari.

## #019 Form Check: does it handle real phone footage?

**Method.** Clips written by Apple's encoders as phones write them (`.claude/qa/video/make-phone.swift`), each with a frame number on every frame:
- 4K60 portrait HEVC;
- 1080p HEVC at 240 fps (slow motion as recorded);
- 10-bit HEVC tagged HLG (iPhone's HDR video);
- Android-like H.264, stored sideways and shown portrait, with a frame rate that varies.

Each was loaded in Chromium and WebKit (`p8-formcheck-phone.cjs`): its shown size and length, whether its first frame shows, the frame rate learned, and how far one "Forward one frame" step moves.

**Found.** The 240 fps clip was stepped 4 real frames at a time in WebKit and 8 in Chromium. Form Check learned the rate from the frames shown while playing, and a screen shows about 60 a second; Chromium learned nothing and kept its 30 fps guess.

**Fixed (commit 07cf644).** The rate is read from the file: the video track's sample table, as the mean of the middle 80% of frame durations. A file it can't read falls back to learning as before. The reader is bounded: 2,000 damaged files never make it throw, and a sample table claiming four billion entries is read at once (`p8-formcheck-damaged.ts`). After the fix, all four clips, in both engines, show the right size and length, show their first frame, and step exactly one real frame. They report 60, 240, and 30 fps, and 29.97 for the clip whose frame rate varies around 30.

**Still open:** real phones' files (Android encoders and containers, how iOS hands a slow-motion video to a web page, Dolby Vision metadata), and memory with long 4K clips.

## #021 Family Stories: does recording work in Safari?

**Method.** `getUserMedia` replaced by a generated, wobbling tone (`p8-familystories-record.cjs`), so MediaRecorder runs as it does with a microphone. In WebKit with a persistent profile (as Safari outside private browsing): recording with WebM (which this WebKit picks) and with MP4 forced (as older Safari records), playback, a reload, the download, and an answer cut off by a reload mid-recording. Then a throwaway profile, which WebKit treats like a private window. Chromium too.

**Found.** In the private-like profile, IndexedDB won't store a recording (a blob), so every answer failed to save. The page then said "This device is out of storage space ... download and delete some recordings before recording more", which can't help in a private window.

**Fixed (commit 402370f).** After Stop: "This browser couldn't keep the last answer. It may be a private window, which keeps no recordings, or the device may be out of space. Download it now so it isn't lost." While recording, when saving the answer a second at a time fails, the page now says so at once.

**Results** (`out/p8-familystories.txt`, on the committed build):
- In WebKit, with WebM and with MP4: recording, playback, a reload, the download (`.webm` or `.m4a`), and recovering a cut-off answer all work. After a reload a saved answer knows its length within 0.1 s, plays, and seeks (`p8-familystories-webm.cjs`, 6 trials of each).
- Chromium: the same.
- The private-like profile: the warning shows during the answer, and the answer downloads after Stop.

Two things an earlier version of the check reported were not the page:
- "No length after a reload" was the check reading the length the moment the metadata arrived. WebKit works a WebM's length out a few milliseconds later.
- Once, a recovered answer wouldn't load in WebKit (media error 4, both of its players). That was 1 run in 19 with WebM, and it didn't happen again in 18 more, the last 8 with diagnostics ready.

**Residual.** In Chromium, a WebM straight from MediaRecorder has no stored length (its `duration` is Infinity). The player can't show a total or seek until it has played through once, and other players may not know the length either; the page's own label gives the length. Writing the length into the file means rewriting irreplaceable recordings, so it's left as a careful P13 candidate.

**Still open:** a real iPhone (audio interruptions, a page suspended in the background), and whether people download their recordings, which needs people.

## #007 Numbers by Ear: other platforms' voices

**Checked** (`p8-numbers-voices.ts`): with voice lists like Edge on Windows 11, Chrome on Windows 11, and Chrome on Android:
- each language starts with a sensible voice: Edge's "Natural" voices, Google's in Chrome, the system's on Android;
- Android's `en_US`-style tags are read correctly;
- no voices gives the "No voices found" notice.

**Still open:** what those voices actually say for prices and years. That needs those devices, as the Apple voices were measured by rendering their own speech. **BLOCKED — OWNER REQUIRED** (Windows, Android, or ChromeOS devices).

## #011 Line Dry: real washing

Nothing new is possible without hanging real loads. The model was already compared with MetService's Penman–Monteith drying maps and tenki.jp's categories (Batch 06). **BLOCKED — OWNER REQUIRED** (a physical test: standard loads on a few days in two climates).

## For the lifecycle decisions

In Tune and Form Check each lost a named failure mode, and Family Stories' recording is now verified in WebKit, so their technical confidence rises. All five stay **experimental**: each question still ends in real use.

## Files

All in `.claude/qa/` (ignored by git), with results in `out/p8-*.txt`:
- In Tune: `voice-synth.ts`, `p8-intune-voice.ts`, `p8-intune-wav.ts`, `p8-intune-browser.cjs`, `in-tune-model-before.ts`, `p8-intune-probe.ts`, `p8-intune-child-ah.ts`, `p8-intune-depths.ts`, `p8-intune-criteria.ts`, `p8-intune-buzzy.ts`;
- Form Check: `video/make-phone.swift` and its clips, `video/inspect.swift`, `p8-formcheck-phone.cjs`, `p8-formcheck-damaged.ts`;
- Family Stories: `p8-familystories-record.cjs` (`MODE=normal`, `mp4`, or `private`), `p8-familystories-webm.cjs`;
- Numbers by Ear: `p8-numbers-voices.ts`.
