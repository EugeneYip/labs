// Shared Tailwind classes. Form controls are 16px on phones so iOS doesn't zoom in on focus.
export const field =
  'h-11 w-full min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:h-10 sm:text-sm'
export const primary =
  'inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-ink px-5 text-sm font-medium text-paper transition-colors hover:bg-ink/80 sm:h-10'
export const quiet =
  'inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg px-3 text-sm text-dim transition-colors hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-40'
export const sectionHeading = 'border-b border-rule pb-2 font-mono text-xs tracking-widest text-dim uppercase'
