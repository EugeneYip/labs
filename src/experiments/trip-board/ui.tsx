import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'

const BUTTON_STYLES = {
  primary: 'bg-ink px-4 font-medium text-paper hover:bg-ink/80',
  quiet: 'px-3 text-dim hover:bg-ink/5 hover:text-ink',
  danger: 'px-3 text-red-700 hover:bg-red-500/10 dark:text-red-400',
  destructive: 'bg-red-600 px-4 font-medium text-white hover:bg-red-700',
}

export function Button({
  variant = 'quiet',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BUTTON_STYLES }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 sm:h-9 ${BUTTON_STYLES[variant]} ${className}`}
    />
  )
}

/** Shared look for text inputs, selects, and text areas. iOS zooms into text smaller than 16px, so phones get 16px. */
export const fieldStyles =
  'w-full min-w-0 rounded-lg border border-rule bg-paper px-3 text-base text-ink placeholder:text-dim hover:border-dim/60 sm:text-sm'

/** A native select (so phones show their own picker) with a consistent arrow. Layout classes go on the wrapper. */
export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={`relative block ${className}`}>
      <select {...props} className={`${fieldStyles} h-11 cursor-pointer appearance-none pr-8 sm:h-10`} />
      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[0.55rem] text-dim">
        ▼
      </span>
    </span>
  )
}

/**
 * A modal dialog, open as soon as it appears. Escape or a button in a
 * `method="dialog"` form closes it, and `onClose` receives the return value.
 */
export function Modal({
  labelledBy,
  onClose,
  children,
}: {
  labelledBy: string
  onClose: (returnValue: string) => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onClose={(event) => onClose(event.currentTarget.returnValue)}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-rule bg-paper p-5 text-ink shadow-2xl backdrop:bg-black/50 sm:p-6"
    >
      {children}
    </dialog>
  )
}

export interface Confirmation {
  title: string
  message: string
  confirmLabel: string
  /** Leave out for a notice that only needs acknowledging. */
  onConfirm?: () => void
}

/** Asks before something destructive, or reports a problem. Cancel comes first, so it has the initial focus. */
export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onDone }: Confirmation & { onDone: () => void }) {
  return (
    <Modal
      labelledBy="confirm-title"
      onClose={(returnValue) => {
        if (returnValue === 'confirm') onConfirm?.()
        onDone()
      }}
    >
      <form method="dialog">
        <h2 id="confirm-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm/relaxed text-dim">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          {onConfirm && (
            <Button type="submit" value="cancel">
              Cancel
            </Button>
          )}
          <Button type="submit" value="confirm" variant={onConfirm ? 'destructive' : 'primary'}>
            {confirmLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
