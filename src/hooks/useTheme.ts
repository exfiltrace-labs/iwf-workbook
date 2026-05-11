import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'lab-theme'

/**
 * Theme state hook. The initial value is read from `<html>`'s `dark` class
 * (set synchronously by the bootstrap script in `index.html`) so the React
 * tree starts in agreement with the DOM and there's no flash on hydration.
 *
 * Calling `setTheme` flips the `dark` class on `<html>`, persists the new
 * value to `localStorage`, and notifies any other `useTheme` consumers in
 * the same tab via a custom event.
 */
export function useTheme(): {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
} {
  const [theme, setThemeState] = useState<Theme>(() => readCurrentTheme())

  useEffect(() => {
    const onChange = () => setThemeState(readCurrentTheme())
    // Cross-component sync within a single tab.
    window.addEventListener('lab-theme-change', onChange)
    // Cross-tab sync (storage event only fires in *other* tabs).
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) onChange()
    })
    return () => {
      window.removeEventListener('lab-theme-change', onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* localStorage unavailable; in-memory only */
    }
    window.dispatchEvent(new Event('lab-theme-change'))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(readCurrentTheme() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  return { theme, setTheme, toggleTheme }
}

function readCurrentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}
