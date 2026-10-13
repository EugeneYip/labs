# #027 Transcript Pseudonyms

Dossier for Batch 07's second experiment. Research and decision: `CANDIDATES.md` ("Decisions for #027", and "Documents and privacy").

## Thesis

- **Audience:** qualitative researchers, above all master's and PhD students, preparing interview and focus-group transcripts for supervisors, co-coders, analysis software, theses, and data archives; also UX researchers with interview notes.
- **Job:** a transcript is typed or comes out of a transcription tool. Before it's shared, every name, place, and other identifier the researcher chooses is replaced with the same pseudonym every time ("Alex" and "Ms Rodriguez" both become [P1]), the key is kept apart, and the next transcript in the project uses the same key.
- **Alternatives:** Word's find-and-replace; QualiAnon and IQDA (desktop Java); Textwash and Presidio (Python); the UK Data Service macro (highlights only); QDA packages (manual, proprietary); a 2025 Obsidian plugin; approved AI chat.
- **Strongest incumbent:** find-and-replace in Word, for most; QualiAnon for the committed.
- **Differentiation:** nothing to install, nothing uploaded or stored, suggestions to start from, consistent replacement with variants grouped, a key that carries across transcripts, and a promise that only the chosen text changes.
- **Strongest falsification argument:** find-and-replace is good enough for many, and approved AI can do it in a sentence. Answered by correctness AI can't promise (quotes left exactly as spoken) and by catching what find-and-replace misses (variants, possessives, a name typed in capitals).
- **Why BUILD survived:** a real, recurring, privacy-bound job, guidance that names the failure modes, no tool that fits a locked-down laptop, and a correctness property that can be tested exactly.

## Risk list (before coding)

| Risk | Design answer |
|---|---|
| A name that's also a word (Will, May, Grace, Bill) replaced in "I will" | Matches the identifier's own capitalization (and all capitals) by default, never lowercase unless chosen; the count of lowercase uses left alone is shown |
| Part of a word replaced ("Ann" in "Annual") | Whole words only, by Unicode letter and digit boundaries |
| Overlaps ("New York" and "York") | Longest first, in one pass |
| Possessives and contractions (Alex's, Alex’s) | The apostrophe ends the word, so "[P1]'s" |
| Anything else in the text changed | One deterministic pass that touches only matched spans; tested as a property: removing the replacements gives back the original exactly |
| Accents and Unicode forms (José in two encodings) | An identifier matches both its composed and decomposed forms; the text itself isn't normalized |
| False reassurance | Never says "anonymized"; shows the capitalized words left unchanged for a second look; says to read it through for jobs, places, and events |
| The key next to the transcript | Downloaded as a separate file, with a line on keeping it apart |
| File names carrying a participant's name | Downloads get neutral names, never the original's |
| A .docx's hidden text (comments, tracked deletions, headers) | Only the main text is read, and the page says so; output is plain text, so nothing hidden comes along |
| Hostile files (zip bombs, broken zips, huge text) | Decompression capped, errors shown, text over a limit refused with a message |
| CSV key with formulas or odd quoting | The key's cells are defused as Labs' other CSVs are; import reads quotes, separators, and a BOM |
| Losing work | Nothing is stored (privacy), so leaving with unsaved work asks first |
| Languages without capitals (Chinese, Japanese, Arabic, Hebrew, Thai) | Suggestions can't find names there; typing identifiers in by hand works for any script, and the page says so |
| Performance | Suggestions and replacement are linear; a long transcript (a few MB) stays responsive |

## Implementation

- `model.ts`: `pseudonymize` builds one pattern from every chosen identifier's forms (as typed, capitalized, in capitals, lowercase only if chosen, each in composed and decomposed Unicode; emails, links, and numbers in any case), longest first, between Unicode word boundaries, with any run of spaces or line breaks inside a name; one pass copies everything between matches exactly. `suggest` finds runs of capitalized words (dropping common words at their ends, keeping titles like "Ms"), emails, links, @handles, and phone numbers (not dates or years), each with its context, strong or weak. `lowercaseLeft` counts lowercase uses left alone, in one pass. `keyCsv` and `readKey` write and read the key (defused, quoted, BOM, any of three separators). `docxText` reads word/document.xml from the zip (its own reader; DecompressionStream; capped at 60 MB) and `bodyText` scans it (paragraphs, tabs, breaks; tracked deletions, field codes, moved-away text, and fallback copies left out; comments stripped).
- `index.tsx`: the transcript (paste, open a file, an example), the list of what's replaced (original, pseudonym, lowercase too, count, notes: not found, lowercase uses left, a conflict, an empty pseudonym), add your own, open a key, suggestions (replace or leave, with focus moving on to the next; weaker ones folded away), the result with every change marked (preview up to 100,000 characters), download, copy, the key, and a count of suggestions still open. Nothing stored; a warning before leaving with work not downloaded.
- Size: 27 kB, 10.6 kB gzipped. No dependencies.

## Audit

Before the push, on the dev server and the built site, in Chromium (Brave 155) and WebKit 27.2. Scripts in `.claude/qa/` (git-ignored): `transcript-pseudonyms-test.ts`, `tp-flow.cjs`, `tp-audit.cjs`, `tp-offline.cjs`, `tp-paste.cjs`.

**Correctness.**
- 3,076 model checks. On 3,000 random texts (names that are also words, accents in both Unicode forms, emoji, ß and İ, possessives, hyphens, line breaks, emails and phone numbers): putting each replaced original back rebuilds the input exactly; every replaced span is a whole word; a lowercase use is replaced only when chosen; and no chosen form is left behind in the output. Hand-worked cases: possessives, "Ann" not in "Annual", "Alex" not in "Alexander", longest first, Will the name and will the verb, regex characters, conflicts.
- The Word reader on files made by macOS's own converter (`textutil`): a plain transcript read exactly; a real table read one cell per line.
- In the browser (`tp-flow.cjs`, 40 checks per engine): the example's suggestions, eight replacements, two spellings grouped, the result checked word by word, the downloads (plain names, contents), the key reused on a second transcript opened from a .docx, refused files, the leave-page warning.

**Material defects found, all fixed before the push:**

| Found | Effect | Fix |
|---|---|---|
| "Will" and "May" were on the list of common words | The name Will mid-sentence was never suggested | Taken off; the sentence-start rule handles the verb |
| Words that only start sentences ("Email me…", "Honestly,") were suggested as strongly as names | Noise among the names | Weaker suggestions, folded away; more common sentence-starters listed ("Ask Will" now suggests "Will") |
| The Word reader took text inside XML comments, and a text box's fallback copy added a line | Text that isn't in the document; a doubled text box | Comments stripped; fallback copies skipped; no line breaks from skipped parts |
| A name inside an email that's being replaced too was counted as a lowercase use left | A false warning | Counted in the result instead |
| Every capitalized suggestion defaulted to "[Person N]" | "I trained in [Person 6]" for a city | "[Name N]" |
| Choosing a suggestion by keyboard dropped focus to the top of the page (the list updates a moment later) | Keyboard users lose their place in a long list | Focus waits for the row to go, then moves to the next one |
| The "worth a second look" list repeated suggestions still open above | Duplicates; confusing | A count of open suggestions, linked to them |
| The lowercase check scanned the text once per identifier, and a suggestion's context could scan back to the start of a text without spaces | Slow at the limits (500 identifiers; 1 MB with no spaces) | One pass; a bounded context (5 MB with 500 identifiers: 58 ms; 1 MB without spaces: 185 ms) |
| Literal byte-order-mark characters in the source where an escape was meant | Worked, but invisible in the code (the known `\u` trap) | Written as escapes; the scan is clean |

Added for privacy during the audit: spell check and form restore off in every field holding transcript text.

**Hostile input** (`tp-audit.cjs`, both engines): a paste over 5,000,000 characters says so and does nothing else; a cut-short .docx, a .doc, a fake .docx, a binary file, and a 26 MB file each get their own message; a 600-row key loads 500 and says 100 were left out; a right-to-left name typed in is replaced; zip bombs are refused at 60 MB (model test).

**Accessibility:** axe finds 0 violations at 1280 px light and 320 px dark. 40 Tab presses: every control named and ringed. Choosing by keyboard keeps focus in the list. No sideways scroll at 320 px or with text at 200%.

**Performance:** model: 1 MB with 60 identifiers in 13 ms, 5 MB with 501 in 0.34 s, suggestions on 1 MB in 0.09 s. In the browser, a 1 MB paste to suggestions and result: 2.0 s in Chromium, 0.4 s in WebKit; a real Cmd+V paste of 3 MB in Chromium: 2.9 s (a bare text box alone: 0.5 s). Playwright's `fill()` of millions of characters is itself very slow in Chromium (over two minutes for 5 MB); a real paste isn't, so that's the harness, not the page.

**Privacy:** no requests to any other site; localStorage, sessionStorage, and IndexedDB stay empty after the whole flow; downloads have plain names.

**Offline** (`tp-offline.cjs`, the built site on a real server that was then stopped): the page loads and pseudonymizes, in both engines.

**Site-wide:** the 28-page smoke test on the built site, 112 page loads, 0 problems.

**Browser coverage:** Chromium and WebKit through Playwright. Not covered: Firefox (parked), real Safari, Windows, and Word files written by Microsoft Word itself (macOS's converter stood in; the reader follows the published format).

**Residual uncertainty:**
- Whether researchers would trust a web page with transcripts at all, even one that sends nothing: needs people.
- Real transcripts' quirks (transcription-tool formats, speaker labels, many languages).
- Suggestions are English-leaning (the list of common words), and find nothing in scripts without capitals.

## Production verification

2026-10-13, commit 66df97b, deploy run 38378802716 succeeded.
- Production's 65 files are byte-identical to the local build of that commit.
- `tp-flow.cjs` against production: 40 of 40 in Chromium and in WebKit (the example, eight replacements, grouping, the result checked word by word, both downloads, the key reused on a .docx, refused files, the leave-page warning, nothing stored, axe at 1280 px light and 320 px dark, a 1 MB paste).
- `tp-audit.cjs` against production: every check passes in both engines.
- `tp-offline-prod.cjs`: with the browser's network cut after one visit, an address never saved fails while the page reloads and pseudonymizes, in both engines.
- The 28-page smoke test on production: 112 page loads, 0 problems. The daily check: 11 of 11.

## Lifecycle recommendation

(At closeout.)
