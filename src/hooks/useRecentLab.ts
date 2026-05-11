import { useEffect, useState } from 'react'

const KEY = 'workbook:recent-lab'
const EVENT = 'workbook-recent-lab'

export interface RecentLab {
  id: string
  visitedAt: number
}

/** Persist `labId` as the most recently visited lab. Call from `LabPage`. */
export function rememberRecentLab(labId: string) {
  try {
    const entry: RecentLab = { id: labId, visitedAt: Date.now() }
    window.localStorage.setItem(KEY, JSON.stringify(entry))
    window.dispatchEvent(new CustomEvent(EVENT))
  } catch {
    // localStorage may be unavailable; ignore.
  }
}

/**
 * Reactive read of the most recently visited lab. Updates whenever
 * `rememberRecentLab` fires (same tab) or another tab writes to storage.
 */
export function useRecentLab(): RecentLab | null {
  const read = (): RecentLab | null => {
    try {
      const raw = window.localStorage.getItem(KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as RecentLab
      if (parsed && typeof parsed.id === 'string') return parsed
      return null
    } catch {
      return null
    }
  }

  const [recent, setRecent] = useState<RecentLab | null>(read)

  useEffect(() => {
    setRecent(read())
    const handler = () => setRecent(read())
    window.addEventListener(EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return recent
}
