# L-LABELS research notes: address labels onto standard label sheets (Batch 08, read-only thread)

Status: complete 2026-10-14, budget spent. Budget used: 16/16 searches, 10/10 fetches (the 10th, avery.co.uk/blog/tips/dpo-tips, returned HTTP 403).
Question: should Labs build a page that prints a pasted name/address list onto Avery-style sheets (5160/8160, L7160, L7163, J8160; Letter and A4), with preview, alignment nudge, start label and exact-size print, nothing uploaded? Labels: (verified) official or primary page read; (source claim) a page or snippet says so; (inference) my judgment.
Prior notes: g-home.md L1 (Christmas-card list) saw the same MSE thread and the yearly Word/Excel holiday-card posts (Hanselman, Casey Liss, MrExcel) at snippet level.

## E1 Audience and season

- Households sending Christmas cards are the clearest group. MSE "Address labels for Xmas cards", 19 Nov 2024: an adult child setting up about 75 labels because their dad can no longer comfortably write envelopes but still sends cards (verified: forums.moneysavingexpert.com/discussion/6568921). Apple Communities, 14 Oct 2023: a Mac user wanting 12 different A4 labels per sheet from a Numbers list (verified: discussions.apple.com/thread/255202896).
- Avery runs Christmas label content in each market: "10 Easy Tips for Making the Best Christmas Address Labels" (avery.com/blog/christmas-address-label-tips), "Holiday address labels made easy" (avery.ca/en/blog/holiday-address-labels-made-easy), "Mail Merge: Save Time This Christmas" (avery.co.uk/tips/christmas-mail-merge) (source claim, search results). A UK council publishes an "A4 Christmas address labels" PDF (west-dunbarton.gov.uk/media/4311280/a4_christmas-address-labels.pdf) (source claim, not opened).
- Season: October to mid-December for cards (inference from the dated threads and Avery's seasonal content). Wedding invitations, clubs, churches and school offices: plausible all year, but no direct evidence gathered here (inference; one wedding mail-merge guide seen by title only, arhfoundation.org/mail-merge-wedding-excel-canva).
- No search-volume data: Google Trends was not reachable and a targeted search returned only vendor marketing. Seasonality rests on dated threads and vendor content.

## E2 The exact job and the result needed

- Before: a list already exists, usually a spreadsheet kept from year to year, or contacts (Google Contacts exports to one), one person per row (verified, MSE advice; source claim: mrexcel.com/tech-tv/addressing-holiday-cards-with-excel, which also warns of lost leading zeros in ZIP codes).
- Job: one address per label, in order, on the exact sheet bought, which buyers name by code ("L7160", 21 per A4 sheet, 7 x 3, in the MSE thread: verified), with the text landing inside each label; sometimes using up a part-used sheet (inference: not seen in a thread here); sometimes matching "from" labels (verified, MSE: one reply prints "to" and "from" labels).
- After: correctly placed labels without wasting label sheets. The standard advice is a plain-paper test print held against the sheet, marking the paper to learn the feed direction (verified, MSE).

## E3 Friction

- Word for the web can't do it: "Creating mail merge labels isn't currently possible in Word for the web" (verified: support.microsoft.com/en-au/office/create-mail-merge-labels-bda347b3-b80b-4237-a0ae-3c05d794e68e). Desktop route: Mailings > Start Mail Merge > Labels > vendor and product number, after setting up the merge in a separate article (verified), then recipients, Address Block, Update Labels, Finish & Merge (source claim, Microsoft video page). The MSE poster had Word only on a work laptop (verified).
- Pages for Mac now has mail merge (Apple Pages guide tanff6015832, source claim), but merging into an Avery label table failed: each field became its own record. The only answer was to use Avery's online tool instead; unresolved, 3 "me too" (verified, Apple thread above). OnlyOffice has the same gap: "Making Labels using mail merge - No ability to advance to next record on the same document" (source claim, title only, community.onlyoffice.com/t/.../16522).
- Google Docs: no built-in label merge found. A 2019 Docs community thread was answered with add-ons (one paid) or Avery's online tool, and a later poster couldn't find the add-ons (source claim: support.google.com/docs/thread/13721573). Avery's own free Docs add-on ("Avery Label Merge" / "Easy Merge") was discontinued (source claim, Foxy Labels listing).
- Avery's online tool "can seem a little daunting" (verified, MSE).
- Alignment: drift that grows row by row down the sheet means scaling; the fixes are 100% scale, never "fit to printable area", paper size matching the sheet, a nudge after a test print, one sheet at a time (source claim, low-quality SEO pages repeating Avery's advice). A label-software forum found Chrome's "Fit to page" shifted labels and turning it off fixed it (source claim: forum.stimulsoft.com/viewtopic.php?p=74458).
- macOS Contacts: the list has to be in Contacts; to fill a sheet with one address you copy the card into a list many times (verified, Apple guide below).

## E4 Alternatives (searched as "print address labels online free", mailing labels in Google Docs/Sheets, Contacts, Word, Pages, Canva)

- Avery Design & Print Online (DPO): free. No account needed via avery.com/dpo; guests save projects to their own computer, and an account is only for saving online (verified: avery.com/help/article/dont-want-to-create-an-account-to-use-design-and-print-online-accessing-design-and-print-without-an-account). Merge from a file on your computer, an Avery account or Google Drive (source claim: averyproducts.com.au/software/how-to/import-and-merge-data). The list is transmitted, but Avery says it won't keep imported data unless you save it to an account (source claim: avery.com/help/article/spreadsheets-covered-by-privacy-policy, avery.com/help/article/does-avery-collect-my-imported-data); its terms say you transmit at your own risk (source claim, avery.com/terms). Avery codes only (inference). An "adjust print alignment" nudge after a test print (source claim). Start on a part-used sheet: NOT CHECKED (403).
- Avery templates for Word and Google Docs: free downloads, which still need a merge (source claim).
- Word desktop mail merge: part of Microsoft 365 or a bought Office (inference); label vendor and product lists built in (verified). Not in Word for the web (verified).
- macOS Contacts > File > Print > Style: Mailing Labels: free, built in, offline. Page types "Avery Standard" or "A4", or Define Custom; sort by name or postal code; company, country, image, font and colour; "Only contact cards with addresses are printed" (verified: support.apple.com/guide/contacts/adrbab40ca1d/mac, Sonoma 14 guide). The guide mentions no start position and no alignment nudge (verified: absent). Mac only.
- Pages: merge exists, one record per page; label sheets fail (verified, thread).
- LibreOffice: free and offline; recommended on MSE when Word is missing (verified, MSE). Its label steps not checked here.
- Google Docs/Sheets add-ons: Labelmaker (Create & Print Labels) is a 7-day free trial, then paid (source claim, marketplace listing 585829216542; labelsmerge.com/pricing not read). Foxy Labels: paid, price unclear (source claim). Peelstack: free up to 30 labels per run, then $29 a year or $59 once (source claim). Also Avery Label Creator by HomeDrop, PrintPerfect Labels (which tells users to set margins to "none"), Perfect Labels (source claim). Permissions requested: not checked.
- Canva: a Label Sheets app covering 90 brands in Letter and A4 (source claim: hlabels.com/how-to-print-my-own-labels-canva). Merging a list needs Bulk Create, a paid feature (Pro and up) (source claim: sparxno.com, moclaw.ai; Canva's pricing checkmarks unreadable).
- Cleverence Label: a free label maker that "runs entirely in your browser", loads CSV, Excel or Google Sheets, with an Avery 5160 address template (source claim: cleverence.com/label/templates/gallery-avery-5160-address). Account, A4 codes and start position: NOT CHECKED. The closest thing to a free local equivalent found.
- The search "print address labels online free", page 1: SEO template spam on hijacked domains (alpinelinux.org mirrors, a Brazilian government domain, a university test site), plus Avery, Canva's label maker and Avery WePrint (paid printing) (source claim). (inference: honest small tools are hard to find, and a new one would be hard to find too.)

## E5 The strongest incumbent

- Avery Design & Print Online: free, no account, made by the sheet maker, covers every Avery code, imports Excel, Numbers, CSV or Google Drive, has an alignment nudge, and forum answerers send people to it (verified in the Apple and MSE threads; source claim in the Docs thread). For Mac users whose addresses are already in Contacts, Contacts' Mailing Labels is free, offline and built in (verified).

## E8 The strongest reason not to build

- Avery DPO already does the job free, without an account, and says it doesn't keep imported lists (source claim). Against it the wedge is narrow: nothing transmitted at all, paste instead of a file import, a part-used-sheet start (not checked whether Avery has one), a measured scale and offset calibration, offline use, one plain page instead of a design editor. "Cleaner UI" alone isn't a wedge, so the case stands on start position, calibration and zero transmission (inference).
- Exact physical alignment can't be guaranteed, and the factory can't test it: it can measure print-to-PDF geometry in Chromium and WebKit, not a real printer's feed offset or scaling (inference). A misprint wastes a label sheet (inference). Avery and Word carry the same physical risk and answer it with test prints and nudges (source claim), so it is a risk to manage, not a blocker (inference).
- Labs has already hit this: #009 Tear-Off Flyer prints at 90% because, drawn to fill the page exactly, it "spilled its bottom edge ... onto a second page in Safari whenever the printer added margins of its own" (verified: src/experiments/tear-off-flyer/index.tsx:325-331). Labels can't be shrunk to 90%.

## Technical feasibility: exact-size printing from a browser

- @page size: Chrome 15+, Firefox 95+, Safari 18.2+ (iOS 18.2+). The @page rule itself only arrived in Safari 18.2; page-margin boxes are Chrome 131+ only (verified: MDN browser-compat-data css/at-rules/page.json; MDN @page/size, "Baseline 2024", since December 2024). Older Safari (Macs stuck on Monterey have Safari 17) ignores @page, so paper size and margins come from the print dialog (inference).
- Safari scale: WebKit bug 164201, "CSS millimeters don't correspond to printed millimeters": a 100 mm box printed at 107.2 mm in Safari 10, exact in Chrome; status NEW, unassigned, last activity 2020-05-04 (verified: bugs.webkit.org/show_bug.cgi?id=164201). Current Safari untested.
- Headers and footers: Chrome drops its own when @page margin is 0 (source claim, quoted in bugzilla.mozilla.org/show_bug.cgi?id=1209265). Safari and Firefox not checked.
- Scaling: every source says print at 100%, turn off "fit to page" or "shrink to fit", margins none. A page can't set these for the visitor (source claim, several; inference that a page can't).
- Printer hardware margins: a page can't learn the printer's unprintable area. CSSWG issue #11395, "Expose unprintable areas via CSS", is open; Chromium's engineer says Chrome's and Firefox's "minimum" margins are buggy unless the insets match on all four sides, and he doesn't want to expose them to the web (verified: lists.w3.org/Archives/Public/public-css-archive/2025Jul/0403.html, 2025-07-16).
- Feasible with mitigations (inference): lay out only the label grid (no full-page box), in mm from the sheet edge; a calibration print with a 100 mm ruler and corner marks, where the visitor types the measured length and offset (this corrects Safari or driver scaling as well as feed offset), remembered per printer under a `labs:<slug>` key; per-browser "100%, no fit, margins none" steps; a plain-paper test first, said plainly. Sheet geometry must come from the makers' published specs (not checked here). Phone printing (iOS/Android print dialogs' scale options) not checked.

## Not checked (budget)

- Whether Avery DPO can start on a part-used sheet; whether Cleverence Label needs an account, covers A4 codes or has a start position; Google add-on permissions; phone printing; Google Trends.

## Verdict

**HOLD, one fact, then BUILD or REJECT.** Need, season (Oct to Dec) and friction are verified: Word for the web can't merge labels, Pages' merge fails on label sheets, Docs needs paid add-ons, Contacts needs the list in Contacts and offers no start position, Avery's tool is "daunting" and sends the list away. But Avery DPO is a strong free incumbent with no account, and exact alignment is a risk Labs has already hit (#009 in Safari). The deciding fact: does a free, no-account, in-browser tool already print a pasted or CSV list onto named Letter and A4 sheets with a start position (leads: Cleverence Label; Avery DPO's print options)? If one does, REJECT as with compare-two-lists. If none does, BUILD before late November, with the wedge: nothing transmitted, a part-used-sheet start, and a measured scale and offset calibration.
