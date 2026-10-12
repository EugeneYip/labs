import { useEffect, useState } from 'react'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { boardToJson, EMPTY_BOARD, parseBoardJson, readSavedBoard, type Board } from './model.ts'

// Every Labs experiment shares one site, so storage keys carry the experiment's slug.
const STORAGE_KEY = 'labs:trip-board'
// What was saved, kept aside when some or all of it couldn't be read, so it's never simply overwritten.
const ASIDE_KEY = `${STORAGE_KEY}:unreadable`

/** A saved board that couldn't all be read: the copy kept, and how many items were left out (null: all of them). */
export interface SetAside {
  text: string
  skipped: number | null
}

/**
 * The board, saved in this browser's localStorage after every change and kept
 * in step with other open tabs. `saved` is false when the browser refuses to
 * store it (blocked or full storage). `aside` is a saved board that couldn't
 * all be read, kept until `dismiss` is called.
 */
export function useBoard() {
  const [loaded] = useState(load)
  const [board, setBoard] = useState(loaded.board)
  const [saved, setSaved] = useState(true)
  const [aside, setAside] = useState(loaded.aside)
  // Another tab's board is taken up here; one this version can't read is left alone.
  const save = useOtherTabs(STORAGE_KEY, () => {
    try {
      const json = localStorage.getItem(STORAGE_KEY)
      const next = json === null ? EMPTY_BOARD : parseBoardJson(json).board
      if (next) setBoard(next)
    } catch {
      // Storage is blocked: keep this board.
    }
  })

  useEffect(() => {
    try {
      // Only real changes are written, which also stops two open tabs from echoing each other.
      save(boardToJson(board))
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [board, save])

  const dismiss = () => {
    try {
      localStorage.removeItem(ASIDE_KEY)
    } catch {
      // Nothing to tidy.
    }
    setAside(null)
  }

  return [board, setBoard, saved, aside, dismiss] as const
}

function load(): { board: Board; aside: SetAside | null } {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    const read = json === null ? null : readSavedBoard(json)
    if (json !== null && (!read || read.skipped)) {
      // Not all readable (damaged, or written by a newer version): set it aside instead of overwriting it.
      localStorage.setItem(ASIDE_KEY, json)
      return { board: read?.board ?? EMPTY_BOARD, aside: { text: json, skipped: read ? read.skipped : null } }
    }
    // A copy set aside on an earlier visit stays on offer until it's dismissed.
    const kept = localStorage.getItem(ASIDE_KEY)
    const keptRead = kept === null ? null : readSavedBoard(kept)
    return { board: read?.board ?? EMPTY_BOARD, aside: kept === null ? null : { text: kept, skipped: keptRead ? keptRead.skipped : null } }
  } catch {
    // Storage is blocked. The board still works until the page closes.
    return { board: EMPTY_BOARD, aside: null }
  }
}
