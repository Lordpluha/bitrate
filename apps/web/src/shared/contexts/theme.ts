'use client'

import { themes } from '@shared/constants'
import { createContext, useContext } from 'react'

export type ThemeContextType = {
  theme: themes
  setTheme: (theme: themes) => void
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