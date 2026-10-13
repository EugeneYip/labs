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

(Filled in as it's built.)

## Audit

(Filled in before the push.)

## Production verification

(Filled in after the deploy.)

## Lifecycle recommendation

(At closeout.)
