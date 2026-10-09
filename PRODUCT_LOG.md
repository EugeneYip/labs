# Product Log

What Labs has shipped, newest first. Add an entry whenever something visitors can see changes: a new experiment, a notable update, or an archive.

<!--
Entry format for an experiment:

## YYYY-MM-DD · #NNN Title

- **What:** what shipped, in a sentence or two.
- **Problem it tests:** the user problem or question behind it.
- **Scope decisions:** what was deliberately included or left out, and why.
- **Limitations:** what a visitor should know it can't do.
- **Revisit if:** what would justify improving it, promoting it, or archiving it.

Infrastructure entries can use just What, Why, and Notes.
-->

## 2026-10-09 · #006 Secret Santa

- **What:** [labs.eugeneyip.net/secret-santa](https://labs.eugeneyip.net/secret-santa/). The organizer enters the names, an optional budget, swap date, and note, and any "can't draw" rules (couples, last year's pairs, one way or both). "Draw names" then gives everyone a private link to copy or share. Opening a link greets the person by name and shows who they're buying for only after they tap "Show who I'm buying for", so a link opened by the wrong person can still be closed in time. The organizer's list stays on their device so they can come back to resend a link, draw again, or change the people.
- **Problem it tests:** Every office and family exchange needs a draw, and the popular sites ask for everyone's email address, show ads, or make the organizer the one person who knows every match. Can a draw that lives entirely in links, with no emails or accounts, let the organizer take part like anyone else?
- **Scope decisions:** Each link carries only its own match, scrambled so the name can't be read from the link text. The draw picks evenly among all valid outcomes, falling back to a search when the rules are tight, and says plainly when the rules make a draw impossible. No wish lists, reminders, or messaging between people. Up to 100 people.
- **Limitations:** The scrambling stops accidental peeking, not a determined person decoding the link, and the organizer can still open any link. Drawing again makes all earlier links stale, and there's no way to tell whether someone opened theirs. Names must be different from one another; two people both called "Sam" need distinguishing names such as "Sam K." and "Sam L.".
- **Revisit if:** it gets used for a real exchange this season. Likely asks are wish lists in the link, a printable set of slips for groups without phones, and a way to see who has opened their link, which a static site can't do.

## 2026-10-09 · #005 CSV Checkup

- **What:** [labs.eugeneyip.net/csv-checkup](https://labs.eugeneyip.net/csv-checkup/). Drop in a CSV, TSV, or other delimited export to get a health report. It works out the separator, encoding, and header row, then shows row and column counts and the share of empty values. Each column gets its kind of data (numbers, dates, emails, yes/no, text), how full it is, distinct values, range or most common values, and its longest value. A plain-language issue list covers repeated rows, rows with the wrong number of fields, blank lines, duplicate or missing column names, stray text in number or date columns, codes with leading zeros that spreadsheets drop, mixed date formats, and stray spaces. There's also a preview of the first 50 rows and a report to copy as Markdown. Files are streamed in pieces, about 12 MB in half a second, and are never uploaded or stored.
- **Problem it tests:** People receive exports from stores, CRMs, surveys, and data portals, and either open them in a spreadsheet that silently mangles them (leading zeros, dates) or upload customer data to random websites to check them. Is a private, instant "what's in this file and what's wrong with it" check something people return to?
- **Scope decisions:** Read-only, so it doesn't edit, clean, or convert. No Excel files: you're asked to save as CSV. Counts are exact except for columns with more than 20,000 different values (marked "+") and duplicate checks past 2 million rows. Columns of zero-padded codes like ZIPs aren't summarized as numbers. One data color, validated for both light and dark backgrounds.
- **Limitations:** Type detection is pattern-based, and dates like 03/04/2026 are assumed month-first unless the first number can't be a month. Encodings other than UTF-8 and Windows-1252 aren't detected. Very wide files (hundreds of columns) work but make a long page. Nothing is charted beyond the top-value bars.
- **Revisit if:** people use it before imports or migrations. The natural next steps are fixing what it finds (trimming spaces, removing repeats, exporting a cleaned CSV) and comparing two versions of the same export.

## 2026-10-09 · #004 Clean Paste

- **What:** [labs.eugeneyip.net/clean-paste](https://labs.eugeneyip.net/clean-paste/). Paste text copied from a PDF or an email and get readable paragraphs back, live as you type, with a copy button. It rejoins lines broken mid-sentence and words split by hyphens, keeping real compounds like "well-known" when the text writes them that way elsewhere. It also removes page numbers and headers repeated on every page, keeps bulleted and numbered lists, strips email ">" marks, and fixes ligatures (ﬁ), odd spaces, and invisible characters. Chinese and Japanese lines are joined without inserting spaces. A summary says what it changed, and the options are remembered; the text isn't.
- **Problem it tests:** Copying from PDFs is a daily annoyance for students, researchers, and office workers, and typical "remove line breaks" sites flatten everything into one block. Does a version that understands paragraphs, lists, and page clutter earn a spot in someone's routine?
- **Scope decisions:** Rule-based and instant, with no AI and no dictionary. Lines are only rejoined when the text looks hard-wrapped at a fixed width, so text with one paragraph per line, and poems, pass through untouched. Headers are only dropped when they repeat far apart, so a song's repeated chorus survives. No file upload or PDF reading, just pasting.
- **Limitations:** These are heuristics, so a paragraph whose last line happens to be nearly full width can be merged with the next one, and a hyphenated compound that appears only at a line break loses its hyphen. Columns, tables, and footnotes copied from PDFs often arrive scrambled and aren't untangled. Thai and other languages written without spaces are only partly handled.
- **Revisit if:** people paste real documents and keep coming back. The next step would be a "differences" view that highlights what changed, or reading a PDF file directly.

## 2026-10-09 · #003 Fair Share

- **What:** [labs.eugeneyip.net/fair-share](https://labs.eugeneyip.net/fair-share/). Start a group with names and a currency, add who paid for what, split equally among any of the people, and see each person's balance and the fewest payments that settle everyone up. "Mark paid" records a payment. Amounts are kept in whole cents, so shares always add up exactly, and both "12,50" and "12.50" are understood. The whole group is compressed into the page address after "#", which browsers never send to the server. Bookmarking or sharing that address is how you save and share it, and a short list of recent groups is remembered on the device.
- **Problem it tests:** Splitting costs among friends or roommates is common and fiddly. The best-known tool needs everyone to have an account, and its free plan is limited. Is a no-account version that lives entirely in a link good enough for a weekend trip or a shared dinner?
- **Scope decisions:** Equal splits among chosen people only, with no custom shares, percentages, or itemized receipts. One currency per group, with no exchange rates. There's no sync: whoever edits gets an updated link to pass on. Links are strictly validated, and decompression is capped so a crafted link can't freeze the page.
- **Limitations:** Edits on different phones don't merge, so two people adding expenses separately end up with two versions. Links grow with the number of expenses, though a realistic weekend stays under about 300 characters. The currency can't change after the group is created, and anyone with the link can see every name and amount.
- **Revisit if:** groups get passed around by link, or people ask for uneven splits or a way to merge two versions of a group. Uneven splits would be a small change, and merging would be the real test of the link-only model.

## 2026-10-09 · #002 Photo Scrub

- **What:** [labs.eugeneyip.net/photo-scrub](https://labs.eugeneyip.net/photo-scrub/). Drop in or choose JPEG, PNG, or WebP photos to see the hidden details they carry: GPS position (with a map link), place names, camera and serial numbers, dates, author and copyright, software, edit history, embedded thumbnails, and extra embedded images. It then gives you clean copies, one at a time, as a ZIP, or through the phone's share sheet. Cleaning copies the image data byte for byte and keeps only the orientation and color profile, so quality doesn't change, and each clean copy is read back to confirm nothing is left. Nothing is uploaded or stored.
- **Problem it tests:** Phone photos record exactly where they were taken, and people share them on marketplaces, forums, and by email without knowing it. Most web tools that remove this data upload the photo first. Will people use a local tool that shows the leak and fixes it in one step?
- **Scope decisions:** Everything except orientation and color profile is removed, with no "keep the date" options. No re-encoding, resizing, or editing, and no storage at all. HEIC isn't processed: iPhones convert photos to JPEG when they're chosen in a browser, and desktop HEIC files get an explanation instead.
- **Limitations:** No HEIC, AVIF, GIF, TIFF, or RAW files. It can't hide what's visible in the picture itself, such as faces, street signs, or screens. Tested with real browser-made images carrying metadata modeled on real cameras, not a library of files straight from cameras. The share button appears only where the browser supports sharing files, mostly on phones.
- **Revisit if:** people use it for marketplace listings or ask for HEIC support, resizing to fit upload limits, or an option to keep dates. Or if searches like "remove location from photo" bring steady traffic.

## 2026-10-08 · #001 Trip Board

- **What:** A private board for trip research at [labs.eugeneyip.net/trip-board](https://labs.eugeneyip.net/trip-board/). Paste links or type ideas, sort them into seven categories (Flight, Stay, Transport, Activity, Food, Research, Other), and mark each one Researching, Considering, Decided, Booked, or Skip. It has search and filters, undo for deleting, importing, and starting over, and export and import of a versioned file (`labs.trip-board`, version 1). Everything stays in the visitor's browser.
- **Problem it tests:** People who plan their own trips end up with research scattered across tabs, map links, booking pages, articles, Reddit threads, and messages. The question is whether one quiet, local list, with a decision status on every item, is enough to replace that scatter without an itinerary builder or AI. It hasn't been tried by anyone beyond its builder yet, so nothing here is validated.
- **Scope decisions:** One board per browser; export a file to keep a finished trip. Items are grouped by category with settled ones first, so each group reads from booked down to skipped. Pasted links get a title suggested from their own address and a category guess for well-known travel sites. Nothing is fetched from other sites, so there is no scraping and no cross-site requests. Pasting several links at once offers to add them all, leaving out ones already on the board. Left out on purpose: accounts, sync, sharing, maps, prices, dates, itineraries, and AI.
- **Limitations:** The board lives in one browser on one device. Clearing the browser's site data deletes it, and moving to another device means exporting and importing a file. Duplicate warnings catch only identical links, so the same hotel with different dates in the address isn't flagged. Suggested titles can be clumsy, because pages aren't fetched. Tested in desktop Chromium and in emulated phone sizes, not yet on a physical iPhone or Android phone.
- **Revisit if:** it gets used for a real trip from first idea to booking, or people ask for the same things: more than one board, a read-only copy to share with a travel companion, or a plain-text export. Archive it if a month of real trip planning passes without it being opened.

## 2026-10-08 · Labs v0

- **What:** The Labs site itself: the homepage and experiment index, the typed experiment registry, the shared `ExperimentCard` and `ExperimentShell` components, and automatic deployment to labs.eugeneyip.net through GitHub Pages.
- **Why:** A permanent home for many small experiments, so each new one needs only its own code.
- **Notes:** No experiments yet. The next one is #001.
