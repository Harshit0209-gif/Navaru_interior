import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'navaru-admin-theme'
const THEME_EVENT = 'navaru-admin-theme-change'

export type AdminTheme = 'light' | 'dark'

function readTheme(): AdminTheme {
  try {
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

// Backed by localStorage (same convention as "Remember Me") so it persists
// per-browser without needing a database round trip. A custom event keeps
// every mounted instance (Navbar's toggle, Profile's preference control) in
// sync when either one changes it.
export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>(readTheme)

  useEffect(() => {
    function handleChange() {
      setThemeState(readTheme())
    }
    window.addEventListener(THEME_EVENT, handleChange)
    return () => window.removeEventListener(THEME_EVENT, handleChange)
  }, [])

  const setTheme = useCallback((next: AdminTheme) => {
    try {
      window.localStorage.setItem(THEME_KEY, next)
    } catch {
      // ignore — preference just won't persist
    }
    setThemeState(next)
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  return { theme, setTheme }
}
