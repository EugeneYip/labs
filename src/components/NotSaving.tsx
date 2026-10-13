import type { ReactNode } from 'react'

/**
 * Says the browser isn't saving an experiment's work, so it will be gone when the page reloads or closes, and how to
 * keep it. For while saves fail: storage that's full, or blocked in the browser's settings.
 */
export function NotSaving({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`rounded-xl border border-red-600 px-4 py-3 text-sm text-pretty text-red-800 dark:border-red-400 dark:text-red-300 print:hidden ${className}`} role="alert">
      {children}
    </p>
  )
}
