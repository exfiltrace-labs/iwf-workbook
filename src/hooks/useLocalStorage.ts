import { useCallback, useRef, useState } from 'react'

/**
 * `useState`-shaped hook that mirrors its value to `localStorage`.
 *
 * Pass `null` for `key` to opt out of persistence and run in memory-only
 * mode (used by `<Question>` when the author omits an `id`). The hook
 * shape stays the same so callers don't need a separate code path.
 */
export function useLocalStorage<T>(
  key: string | null,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    if (key == null) return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  // Track the latest value in a ref so the setter can compute and persist
  // the next value synchronously, without waiting for React to flush a
  // pending state update. This matters for any code running on the same
  // tick as `setValue` (e.g. an `emitLabProgress()` call immediately after
  // submit): listeners that re-read localStorage will see the new value,
  // not the previous one.
  const latest = useRef<T>(stored)
  latest.current = stored

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const next =
        typeof value === 'function'
          ? (value as (p: T) => T)(latest.current)
          : value
      latest.current = next
      if (key != null) {
        try {
          window.localStorage.setItem(key, JSON.stringify(next))
        } catch {
          // localStorage may be unavailable (private mode, quota); fail silently
        }
      }
      setStored(next)
    },
    [key],
  )

  return [stored, setValue]
}
