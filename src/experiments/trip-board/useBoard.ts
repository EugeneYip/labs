import { useEffect, useState } from 'react'
import { useOtherTabs } from '../../components/useOtherTabs.ts'
import { boardToJson, EMPTY_BOARD, parseBoardJson, type Board } from './model.ts'

// Every Labs experiment shares one site, so storage keys carry the experiment's slug.
const STORAGE_KEY = 'labs:trip-board'

/**
 * The board, saved in this browser's localStorage after every change and kept
 * in step with other open tabs. `saved` is false when the browser refuses to
 * store it (blocked or full storage).
 */
export function useBoard() {
  const [board, setBoard] = useState(load)
  const [saved, setSaved] = useState(true)
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

  return [board, setBoard, saved] as const
}

function load(): Board {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (json === null) return EMPTY_BOARD
    const { board } = parseBoardJson(json)
    if (board) return board
    // Unreadable (perhaps written by a newer version): set it aside instead of overwriting it.
    localStorage.setItem(`${STORAGE_KEY}:unreadable`, json)
  } catch {
    // Storage is blocked. The board still works until the page closes.
  }
  return EMPTY_BOARD
}
