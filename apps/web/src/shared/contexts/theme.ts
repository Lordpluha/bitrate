'use client'

import { createContext, useContext } from 'react'

import { theme } from '@shared/constants'

export type ThemeContextType = {
  theme: theme
  setTheme: (theme: theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {
    throw new Error('setTheme function is not implemented')
  }
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider')
  }
  return context
}

export const ThemeProvider = ThemeContext.Provider
