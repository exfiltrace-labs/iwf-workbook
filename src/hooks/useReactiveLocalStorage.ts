import { useEffect, useRef, useState, type DependencyList } from 'react'

/**
 * Custom event name dispatched whenever a `<Question>` locks or resets.
 * Lives in this file so the listener wiring below has no circular import
 * with `useLabProgress`. `useLabProgress` re-exports it for callers.
 */
export const LAB_PROGRESS_EVENT = 'lab-progress'

/** Fire the cross-component progress signal. */
export function emitLabProgress() {
  window.dispatchEvent(new CustomEvent(LAB_PROGRESS_EVENT))
}

/**
 * Run `compute` once on mount and re-run it whenever:
 *   - any entry in `deps` changes
 *   - some component in this tab fires `LAB_PROGRESS_EVENT`
 *   - another tab writes to localStorage
 *
 * Used by every progress hook so each one only has to declare *what* to
 * read, not the listener wiring. The compute callback is held in a ref
 * so we can call its latest version inside the listeners without re-
 * subscribing on every render.
 */
export function useReactiveLocalStorage<T>(compute: () => T, deps: DependencyList): T {
  const computeRef = useRef(compute)
  computeRef.current = compute

  const [value, setValue] = useState<T>(compute)

  // Recompute when deps change.
  useEffect(() => {
    setValue(computeRef.current())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // Subscribe once to the cross-component / cross-tab signals.
  useEffect(() => {
    const run = () => setValue(computeRef.current())
    window.addEventListener(LAB_PROGRESS_EVENT, run)
    window.addEventListener('storage', run)
    return () => {
      window.removeEventListener(LAB_PROGRESS_EVENT, run)
      window.removeEventListener('storage', run)
    }
  }, [])

  return value
}
