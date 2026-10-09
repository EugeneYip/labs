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
}

export const experiments: readonly Experiment[] = [
  {
    number: 1,
    slug: 'trip-board',
    title: 'Trip Board',
    summary: "A private board for gathering your trip research in one place and marking what you've decided, saved only in your browser.",
    shipped: '2026-10-08',
    status: 'live',
  },
  {
    number: 2,
    slug: 'photo-scrub',
    title: 'Photo Scrub',
    summary: 'Shows the hidden location, camera, and date details inside your photos and makes clean copies to share, without uploading them anywhere.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 3,
    slug: 'fair-share',
    title: 'Fair Share',
    summary: 'Splits shared costs in a group and shows the fewest payments to settle up, with the whole group kept in its link instead of an account.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 4,
    slug: 'clean-paste',
    title: 'Clean Paste',
    summary: 'Repairs text copied from PDFs and emails: rejoins broken lines and split words and removes page numbers and repeated headers.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 5,
    slug: 'csv-checkup',
    title: 'CSV Checkup',
    summary: 'Checks a CSV file on your own device: columns and data types, empty values, repeated rows, common values, and problems spreadsheets tend to cause.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 6,
    slug: 'secret-santa',
    title: 'Secret Santa',
    summary: "Draws names for a gift exchange and gives each person a private link that shows only who they're buying for, so even the organizer can take part.",
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 7,
    slug: 'numbers-by-ear',
    title: 'Numbers by Ear',
    summary: "Listening practice for numbers in a language you're learning: your device reads out a number, year, or price, and you type what you heard.",
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 8,
    slug: 'serve-time',
    title: 'Serve Time',
    summary: 'Plans a meal backward from when you want to eat, so every dish is ready together, warns about oven clashes, and counts down while you cook.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 9,
    slug: 'tear-off-flyer',
    title: 'Tear-Off Flyer',
    summary: 'Makes a printable noticeboard flyer with tear-off contact tabs along the bottom, for lost pets, lessons, rooms, or anything else.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 10,
    slug: 'gallery-wall',
    title: 'Gallery Wall',
    summary: 'Works out exactly where to put the nails for a row or grid of picture frames, with a to-scale drawing of the wall.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 11,
    slug: 'line-dry',
    title: 'Line Dry',
    summary: 'Finds the best time this week to dry washing outside, from the forecast for your town, and says when it should be dry.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 12,
    slug: 'glance',
    title: 'Glance',
    summary: 'A daily game: five fields of dots flash for about a second, and you guess how many you saw. Everyone gets the same five each day.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 13,
    slug: 'in-tune',
    title: 'In Tune',
    summary: 'Singing practice: it plays a note, asks for an interval up or down, and shows your pitch live as you sing it, using the microphone on your device.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 14,
    slug: 'playing-time',
    title: 'Playing Time',
    summary: 'Plans substitutions for youth sports so every player gets fair minutes, with who goes on and off at each break and a grid to print.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 15,
    slug: 'back-row',
    title: 'Back Row',
    summary: 'Shows a slide, poster, or sign as the back of the room sees it, and how big your text needs to be to read from there.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 16,
    slug: 'fluency-check',
    title: 'Fluency Check',
    summary: 'Times a student reading aloud while you tap the words they miss, then gives words correct per minute and accuracy, with a marked record to print.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 17,
    slug: 'frost-dates',
    title: 'Frost Dates',
    summary: 'Shows when the last spring frost and first autumn frost usually come for any place in the world, from 30 years of overnight lows, with a planting calendar to match.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 18,
    slug: 'off-book',
    title: 'Off Book',
    summary: 'Helps actors learn their lines: paste a script, pick your part, and practice from your cues with your lines hidden until you say them.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 19,
    slug: 'form-check',
    title: 'Form Check',
    summary: 'Steps through a video of your swing, stride, or lift frame by frame, in slow motion, with lines and angles drawn on it, and compares two side by side.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 20,
    slug: 'custody-calendar',
    title: 'Custody Calendar',
    summary: 'Turns a co-parenting schedule like 2-2-5-5 or alternating weeks into a year calendar of who has the children each night, with overnight shares, handovers, and a calendar file.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 21,
    slug: 'family-stories',
    title: 'Family Stories',
    summary: 'A guided recorder for interviewing grandparents and other relatives: one good question at a time, each answer recorded and kept on your device until you download it.',
    shipped: '2026-10-09',
    status: 'live',
  },
  {
    number: 22,
    slug: 'day-clock',
    title: 'Day Clock',
    summary: 'A large, calm display of the day, the time of day, and the date for someone living with dementia, with reminders, for an old tablet left on by their chair.',
    shipped: '2026-10-09',
    status: 'live',
  },
]

/** Formats an experiment number for display: 1 → "#001". */
export function formatNumber(number: number): string {
  return `#${String(number).padStart(3, '0')}`
}
