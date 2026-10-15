# Main session's checks (Batch 11)

Deciding facts and feasibility checks done by the main session itself. Labels as in `../CANDIDATES.md`.

## First article inspection ballooning: can a static page open a drawing? (2026-10-15)

- **The libraries** (*verified*, `npm view`, 2026-10-15): pdfjs-dist 6.4.299 (Apache-2.0, published 2026-10-03; `pdf.min.mjs` 452 KB and `pdf.worker.min.mjs` 1.2 MB before compression) renders and reads PDFs; pdf-lib 1.17.1 (MIT, last published 2022-05) writes them. Labs has no runtime package beyond React today (`package.json`), so this would be the first, loaded only by this experiment's own page.
- **The spike** (scratchpad, not the repository): a synthetic A3 drawing made with pdf-lib (a border with zone labels, an outline, five dimension strings, a title block), opened by pdf.js from bytes in the page, rendered to a canvas at 1.5×, and its text read with positions, through Playwright's routing (a local server isn't reachable from the browsers here; the established `route-preload.cjs` approach).
  - **Brave (Chromium):** rendered (19,991 dark pixels), 29 text items with page coordinates ("120.00 +/-0.05" at 450, 510; "M8x1.25-6H THRU" at 540, 440; the title block), 155 ms.
  - **WebKit 27.2:** the same 29 items at the same coordinates, 195 ms.
- **What this doesn't settle:** real drawings. CAD exports often draw text as outlines (AutoCAD's SHX fonts, some SolidWorks settings) or arrive as scans, so a page can't rely on reading the requirement from the drawing; typing it in has to be the normal path, with the text read only when it's there.
