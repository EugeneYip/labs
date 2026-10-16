/**
 * The experiment registry: the list of every experiment Labs has shipped.
 *
 * To add one, append an entry below and create src/experiments/<slug>/index.tsx.
 * The full procedure is in FACTORY_CONSTITUTION.md.
 *
 * vite.config.ts also reads this file at build time, so keep it plain data
 * with no imports.
 */

export type ExperimentStatus = 'live' | 'archived'

/** What an experiment is for, so the homepage can show one kind at a time. */
export type Category = 'home' | 'family' | 'school' | 'groups' | 'practice' | 'files'

export const CATEGORIES: readonly { id: Category; label: string }[] = [
  { id: 'home', label: 'Home & garden' },
  { id: 'family', label: 'Family & care' },
  { id: 'school', label: 'School & work' },
  { id: 'groups', label: 'Groups & community' },
  { id: 'practice', label: 'Practice & play' },
  { id: 'files', label: 'Files & text' },
]

export interface Experiment {
  /** Sequential number: 1, 2, 3… Never reused or changed. Displayed as #001. */
  number: number
  /** Permanent address (/<slug>/) and folder name. Lowercase words joined by hyphens. */
  slug: string
  /** Short display name. */
  title: string
  /** One plain sentence saying what it is. Shown on its card and in link previews. */
  summary: string
  /** Date first shipped, as YYYY-MM-DD. */
  shipped: string
  /** `live`: working and maintained. `archived`: kept online for the record, no longer maintained. */
  status: ExperimentStatus
  /** The one kind it's listed under on the homepage. */
  category: Category
}

export const experiments: readonly Experiment[] = [
  {
    number: 1,
    slug: 'trip-board',
    title: 'Trip Board',
    summary: "A private board for gathering your trip research in one place and marking what you've decided, saved only in your browser.",
    shipped: '2026-10-08',
    status: 'live',
    category: 'home',
  },
  {
    number: 2,
    slug: 'photo-scrub',
    title: 'Photo Scrub',
    summary: 'Shows the hidden location, camera, and date details inside your photos and makes clean copies to share, without uploading them anywhere.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'files',
  },
  {
    number: 3,
    slug: 'fair-share',
    title: 'Fair Share',
    summary: 'Splits shared costs in a group and shows the fewest payments to settle up, with the whole group kept in its link instead of an account.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'groups',
  },
  {
    number: 4,
    slug: 'clean-paste',
    title: 'Clean Paste',
    summary: 'Repairs text copied from PDFs and emails: rejoins broken lines and split words and removes page numbers and repeated headers.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'files',
  },
  {
    number: 5,
    slug: 'csv-checkup',
    title: 'CSV Checkup',
    summary: 'Checks a CSV file on your own device: columns and data types, empty values, repeated rows, common values, and problems spreadsheets tend to cause.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'files',
  },
  {
    number: 6,
    slug: 'secret-santa',
    title: 'Secret Santa',
    summary: "Draws names for a gift exchange and gives each person a private link that shows only who they're buying for, so even the organizer can take part.",
    shipped: '2026-10-09',
    status: 'live',
    category: 'groups',
  },
  {
    number: 7,
    slug: 'numbers-by-ear',
    title: 'Numbers by Ear',
    summary: "Listening practice for numbers in a language you're learning: your device reads out a number, year, or price, and you type what you heard.",
    shipped: '2026-10-09',
    status: 'live',
    category: 'practice',
  },
  {
    number: 8,
    slug: 'serve-time',
    title: 'Serve Time',
    summary: 'Plans a meal backward from when you want to eat, so every dish is ready together, warns about oven clashes, and counts down while you cook.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'home',
  },
  {
    number: 9,
    slug: 'tear-off-flyer',
    title: 'Tear-Off Flyer',
    summary: 'Makes a printable noticeboard flyer with tear-off contact tabs along the bottom, for lost pets, lessons, rooms, or anything else.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'groups',
  },
  {
    number: 10,
    slug: 'gallery-wall',
    title: 'Gallery Wall',
    summary: 'Works out exactly where to put the nails for a row or grid of picture frames, with a to-scale drawing of the wall.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'home',
  },
  {
    number: 11,
    slug: 'line-dry',
    title: 'Line Dry',
    summary: 'Finds the best time this week to dry washing outside, from the forecast for your town, and says when it should be dry.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'home',
  },
  {
    number: 12,
    slug: 'glance',
    title: 'Glance',
    summary: 'A daily game: five fields of dots flash for about a second, and you guess how many you saw. Everyone gets the same five each day.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'practice',
  },
  {
    number: 13,
    slug: 'in-tune',
    title: 'In Tune',
    summary: 'Singing practice: it plays a note, asks for an interval up or down, and shows your pitch live as you sing it, using the microphone on your device.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'practice',
  },
  {
    number: 14,
    slug: 'playing-time',
    title: 'Playing Time',
    summary: 'Plans substitutions for youth sports so every player gets fair minutes, with who goes on and off at each break and a grid to print.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'practice',
  },
  {
    number: 15,
    slug: 'back-row',
    title: 'Back Row',
    summary: 'Shows a slide, poster, or sign as the back of the room sees it, and how big your text needs to be to read from there.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'school',
  },
  {
    number: 16,
    slug: 'fluency-check',
    title: 'Fluency Check',
    summary: 'Times a student reading aloud while you tap the words they miss, then gives words correct per minute and accuracy, with a marked record to print.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'school',
  },
  {
    number: 17,
    slug: 'frost-dates',
    title: 'Frost Dates',
    summary: 'Estimates when the last spring frost and first autumn frost usually come for any place in the world, from 30 years of overnight lows, with a planting calendar of rules of thumb.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'home',
  },
  {
    number: 18,
    slug: 'off-book',
    title: 'Off Book',
    summary: 'Helps actors learn their lines: paste a script, pick your part, and practice from your cues with your lines hidden until you say them.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'practice',
  },
  {
    number: 19,
    slug: 'form-check',
    title: 'Form Check',
    summary: 'Steps through a video of your swing, stride, or lift frame by frame, in slow motion, with lines and angles drawn on it, and compares two side by side.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'practice',
  },
  {
    number: 20,
    slug: 'custody-calendar',
    title: 'Custody Calendar',
    summary: 'Turns a co-parenting schedule like 2-2-5-5 or alternating weeks into a year calendar of who has the children each night, with overnight shares, handovers, and a calendar file.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'family',
  },
  {
    number: 21,
    slug: 'family-stories',
    title: 'Family Stories',
    summary: 'A guided recorder for interviewing grandparents and other relatives: one good question at a time, each answer recorded and kept on your device until you download it.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'family',
  },
  {
    number: 22,
    slug: 'day-clock',
    title: 'Day Clock',
    summary: 'A large, calm display of the day, the time of day, and the date for someone living with dementia, with reminders, for a spare tablet left on by their chair.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'family',
  },
  {
    number: 23,
    slug: 'discussion-map',
    title: 'Discussion Map',
    summary: 'Tap whoever starts speaking in a seminar or meeting to map the discussion: lines between speakers, turns and talk time for each person, and who has not spoken yet.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'school',
  },
  {
    number: 24,
    slug: 'ranked-choice-count',
    title: 'Ranked Choice Count',
    summary: 'Counts a ranked-choice vote for a club or committee, by instant runoff or STV: tap in paper ballots or paste a Google or Microsoft Forms export, and see every round explained.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'groups',
  },
  {
    number: 25,
    slug: 'stall-till',
    title: 'Stall Till',
    summary: 'A simple till for a market stall, bake sale, or craft fair: tap what you sell, see the change to give, and count up the cash box at the end of the day.',
    shipped: '2026-10-09',
    status: 'live',
    category: 'groups',
  },
  {
    number: 26,
    slug: 'exam-timekeeper',
    title: 'Exam Timekeeper',
    summary: "The exam room's clock and board: the actual time and each paper's finish, with each candidate's own finish kept through extra time and rest breaks.",
    shipped: '2026-10-13',
    status: 'live',
    category: 'school',
  },
  {
    number: 27,
    slug: 'transcript-pseudonyms',
    title: 'Transcript Pseudonyms',
    summary: 'Replaces the names and other identifiers you choose in an interview transcript with consistent pseudonyms, with a key to keep apart, on your own device.',
    shipped: '2026-10-13',
    status: 'live',
    category: 'files',
  },
  {
    number: 28,
    slug: 'hidden-data-check',
    title: 'Hidden Data Check',
    summary: 'Lists what’s in an Excel workbook but not on screen, such as hidden sheets, pivot-table caches, and data far from the rest, with what each holds and how to remove it, without uploading the file.',
    shipped: '2026-10-13',
    status: 'live',
    category: 'files',
  },
  {
    number: 29,
    slug: 'places-by-choice',
    title: 'Places by Choice',
    summary: 'Gives out places in activities, projects, or workshops from everyone’s ranked choices, as high on each person’s list as the places allow, without uploading the responses.',
    shipped: '2026-10-13',
    status: 'live',
    category: 'groups',
  },
  {
    number: 30,
    slug: 'show-order',
    title: 'Show Order',
    summary: 'Plans a recital’s or show’s running order so dancers aren’t in back-to-back numbers and have as few quick changes as it can find, around the numbers you pin, without uploading the cast.',
    shipped: '2026-10-13',
    status: 'live',
    category: 'groups',
  },
  {
    number: 31,
    slug: 'new-classes',
    title: 'New Classes',
    summary: 'Mixes a year group into next year’s classes of the sizes you set, spreading what you choose as evenly as it can find, keeping apart the children you name, and giving each child a friend they chose wherever it finds a way, without uploading the children’s data.',
    shipped: '2026-10-14',
    status: 'live',
    category: 'school',
  },
  {
    number: 32,
    slug: 'comp-desk',
    title: 'Comp Desk',
    summary: 'Scores a bouldering competition from paper scorecards at the desk: type each card in, and every category’s standings follow by tops and zones, points, or the best problems, with a leaderboard for a second screen.',
    shipped: '2026-10-14',
    status: 'live',
    category: 'practice',
  },
  {
    number: 33,
    slug: 'captions-up',
    title: 'Captions Up',
    summary: 'Turns a play’s script into open captions of two or three lines with each speaker’s name, for a company to check, correct, and run from a laptop at a performance, with the audience’s captions in a second window, without uploading the script.',
    shipped: '2026-10-14',
    status: 'live',
    category: 'groups',
  },
  {
    number: 34,
    slug: 'deputyship-accounts',
    title: 'Deputyship Accounts',
    summary: 'Prepares the money section of a Court of Protection deputy’s yearly report from the bank’s own downloads: every payment in the report’s types, transfers between accounts paired, and where an account stops balancing, without uploading anything.',
    shipped: '2026-10-14',
    status: 'live',
    category: 'family',
  },
  {
    number: 35,
    slug: 'collection-climate',
    title: 'Collection Climate',
    summary: 'Reads the files temperature and humidity loggers export and reports each place against the Bizot guideline or your own band: the share of readings inside it, when the 24-hour humidity limit was broken, gaps, and each month, with a graph, a page to print, and a spreadsheet.',
    shipped: '2026-10-14',
    status: 'live',
    category: 'school',
  },
  {
    number: 36,
    slug: 'holiday-pay-average',
    title: 'Holiday Pay Average',
    summary: 'Works out a week’s holiday pay in Great Britain when pay or hours vary, by the 52-week rule: which weeks count, back up to 104 weeks, why each other week is skipped, and a record to keep, without uploading anyone’s pay.',
    shipped: '2026-10-15',
    status: 'live',
    category: 'school',
  },
  {
    number: 37,
    slug: 'ballooned-drawing',
    title: 'Ballooned Drawing',
    summary: 'Numbers every characteristic on a customer’s drawing as you click, keeps your results against the limits, and exports the ballooned PDF and a Form 3 table for a first article inspection, without the drawing leaving your computer.',
    shipped: '2026-10-16',
    status: 'live',
    category: 'school',
  },
]

/** Formats an experiment number for display: 1 → "#001". */
export function formatNumber(number: number): string {
  return `#${String(number).padStart(3, '0')}`
}
