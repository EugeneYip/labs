import { useEffect, useState } from 'react'
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

  useEffect(() => {
    try {
      const json = boardToJson(board)
      // Writing only real changes also stops two open tabs from echoing each other.
      if (localStorage.getItem(STORAGE_KEY) !== json) localStorage.setItem(STORAGE_KEY, json)
      setSaved(true)
    } catch {
      setSaved(false)
    }
  }, [board])

  useEffect(() => {
    function syncFromOtherTab(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return
      const next = event.newValue === null ? EMPTY_BOARD : parseBoardJson(event.newValue).board
      if (next) setBoard(next)
    }
    window.addEventListener('storage', syncFromOtherTab)
    return () => window.removeEventListener('storage', syncFromOtherTab)
  }, [])

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
