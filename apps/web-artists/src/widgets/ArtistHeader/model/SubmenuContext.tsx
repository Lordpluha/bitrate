'use client'

import { createContext, useContext, type ReactNode } from 'react'

interface SubmenuContextType {
  activeSubmenu: string | null
  isClosing: boolean
}

const SubmenuContext = createContext<SubmenuContextType | undefined>(undefined)

export const useSubmenuContext = () => {
  const context = useContext(SubmenuContext)
  if (!context) {
    throw new Error('useSubmenuContext must be used within SubmenuProvider')
  }
  return context
}

interface SubmenuProviderProps {
  children: ReactNode
  activeSubmenu: string | null
  isClosing: boolean
}

export const SubmenuProvider = ({
  children,
  activeSubmenu,
  isClosing,
}: SubmenuProviderProps) => {
  return (
    <SubmenuContext.Provider value={{ activeSubmenu, isClosing }}>
      {children}
    </SubmenuContext.Provider>
  )
}
