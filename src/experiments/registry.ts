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
]

/** Formats an experiment number for display: 1 → "#001". */
export function formatNumber(number: number): string {
  return `#${String(number).padStart(3, '0')}`
}
