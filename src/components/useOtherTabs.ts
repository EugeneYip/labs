import { useCallback, useEffect, useRef } from 'react'

/**
 * For an experiment that saves its whole state under one localStorage key on every change. When another open tab
 * saves under the same key, `adopt` is called, so this tab can load what was saved and carry on from there. Without
 * it, a tab left open with older state erases the newer tab's work the next time it saves anything.
 *
 * Browsers announce another tab's save with a storage event, but a phone's background tab or a page brought back by
 * the Back button can miss it, so the key is also read again whenever the page is shown.
 *
 * Save through the returned function: it writes only a changed value (or one the browser has lost), and remembers
 * what this tab wrote, so its own saves aren't taken for another tab's. Like `localStorage.setItem`, it throws when the
 * browser won't save.
 *
 * A new saved format needs a new key. An older version of the page still open (a tab left across a deploy, an offline
 * copy) would take up the new format, drop what it doesn't know, and save that back at once.
 */
export function useOtherTabs(key: string, adopt: () => void): (value: string) => void {
  // What this tab last read or wrote. It's first read as the page loads its saved state (call this hook just after
  // that), so a save another tab makes before this one is listening still counts as a change.
  const last = useRef<{ value: string | null | undefined } | null>(null)
  if (!last.current) last.current = { value: read(key) }
  const latest = useRef(adopt)
  useEffect(() => {
    latest.current = adopt
  })

  useEffect(() => {
    const seen = last.current!
    const check = (announced: boolean) => {
      const now = read(key)
      // Storage that can't be read at all leaves the page as it is.
      if (now === undefined || now === seen.value) return
      // A value found missing when the page is shown again may have been removed by the browser, which can clear a
      // site's data after about a week without a visit, not by another tab: this tab keeps its own, and its next save puts it back.
      if (now === null && !announced) return
      seen.value = now
      latest.current()
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) check(true)
    }
    const onShow = () => {
      if (document.visibilityState === 'visible') check(false)
    }
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onShow)
    window.addEventListener('pageshow', onShow)
    // Anything saved between loading and listening wasn't announced here.
    check(false)
    return () => {
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onShow)
      window.removeEventListener('pageshow', onShow)
    }
  }, [key])

  return useCallback(
    (value: string) => {
      // A changed value is written straight away. An unchanged one is written only if what's stored differs, as when
      // the browser has cleared it: reading a large value back costs time, so it's read only then.
      if (value !== last.current!.value || read(key) !== value) localStorage.setItem(key, value)
      last.current!.value = value
    },
    [key],
  )
}

/** The stored value, null when there's none, or undefined when storage can't be read. */
function read(key: string): string | null | undefined {
  try {
    return localStorage.getItem(key)
  } catch {
    return undefined
  }
}
