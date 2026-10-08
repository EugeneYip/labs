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
