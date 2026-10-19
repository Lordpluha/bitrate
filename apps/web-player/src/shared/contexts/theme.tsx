'use client'

import { type Theme, Themes } from '@shared/constants'
import { usePersistedState } from '@shared/hooks'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
} from 'react'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {
    throw new Error('setTheme function is not implemented')
  },
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider')
  }
  return context
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme, , hydrated] = usePersistedState<Theme>(
    'theme',
    'dark',
  )

  useEffect(() => {
    if (!hydrated) return
    document.documentElement.classList.remove(...Themes)
    document.documentElement.classList.add(theme)
  }, [theme, hydrated])

  /* Children render on the server too: ThemeScript has already put the stored theme class on
     <html> before paint, so waiting for hydration only hid the page from crawlers and first paint. */
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
