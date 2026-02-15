'use client'

import type { Theme } from '@shared/constants'
import { usePersistedState } from '@shared/hooks'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
} from 'react'

export type ThemeContextType = {
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
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme, hydrated])

  if (!hydrated) return null

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
