# #026 Exam Timekeeper

Dossier for Batch 07's first experiment. Research and decision: `CANDIDATES.md` ("Decisions after the gate").

## Thesis

- **Audience:** exams officers and invigilators in UK schools and colleges (JCQ centres), above all the access-arrangements room where extra time and supervised rest breaks mix; teachers running mocks and timed tests, where rest breaks have to be trialled first; university and professional-exam invigilators who run "stop the clock" rest breaks.
- **Job:** before the exam, the SENCo's list of arrangements and the papers are in hand. During it, project the actual time and the board (centre, papers, start and finish times, extra-time finishes), and when a candidate takes a supervised rest break, stop their time and keep their revised finish right. Afterwards, a record of what happened for the exam file.
- **Alternatives:** paper slips and whiteboards; The Exams Office's tool (membership and login; whole-room pause only); ExamClock (account; individual pause is $89 a year); free countdowns that JCQ rooms can't use; a £5 HTML timer with fixed 5-minute breaks.
- **Strongest incumbent:** The Exams Office's Exam Room Clock Tool, for the board; paper slips, for rest breaks.
- **Differentiation:** free, no account, the actual time as JCQ requires, each candidate's own finish kept through any number of breaks, a printable record, nothing leaving the exam-room laptop, and offline after one visit.
- **Strongest falsification argument:** paper works, exams officers are cautious, and a wrong finish time is maladministration. Answered by keeping the arithmetic small, tested independently, shown in full, and only ever rounded in the candidate's favor.
- **Why BUILD survived:** a rule-backed wedge (no countdowns), a recurring and growing job (every session of every series, plus mocks), disability-linked data that shouldn't go to a server, and a single-device shape that fits Labs exactly.

## Risk list (before coding)

| Risk | Design answer |
|---|---|
| A wrong finish time: extra time, several breaks, a room pause during someone's break, late starts, a break still open | One pure function from timestamps: pauses (the candidate's breaks and room pauses) are merged, so overlaps count once, and only pauses before the finish count. Exact to the second; shown finishes rounded up to the minute. Tested against an independent brute-force simulation |
| The device clock is wrong, or jumps | It shows the device's own time, large, so a wrong clock is visible; setup says to check it against the room's other clocks (JCQ: all clocks must agree). Durations use wall-clock timestamps, so a jump mid-break would distort that break: noted, not hidden |
| Reload, crash, or a closed tab mid-exam | Everything is saved as timestamps on every change and resumes exactly; two windows (controls and board) stay in step through storage events |
| The browser won't save | A red notice: don't reload or close this page |
| The screen sleeps | Screen wake lock while an exam runs, where the browser has it; a note otherwise |
| Background throttling | Times are recomputed from the clock on every tick, never counted up, so a slow tick only delays the display |
| Revealing who has arrangements | The board shows paper-level finish times (standard and each extra-time group); individual finishes, by candidate number, appear on the board only if switched on. A hint asks for candidate numbers or initials, not names |
| Claims | No "compliant" or "approved" claim; it says it shows the actual time as JCQ's instructions require, that it isn't connected with JCQ, and that the SENCo's and centre's instructions decide every arrangement |
| Hostile or odd input | Durations, percentages, and times are bounded and validated; long and Unicode text fits; duplicate candidate labels are flagged; damaged saved data starts a fresh exam without breaking the page |
| Two tabs | `useOtherTabs`; the board window only reads |
| The projector | Very large figures fitted to the screen, dark board by default, no blinking, no sound |
| Offline | The site's service worker; checked with the server stopped |
| Printing | One clean record table; checked as a PDF |
| Accessibility | Every control by keyboard with a name; status changes announced politely in the control view; nothing announced every second |

## Implementation

(Filled in as it's built.)

## Audit

(Filled in before the push.)

## Production verification

(Filled in after the deploy.)

## Lifecycle recommendation

(At closeout.)
