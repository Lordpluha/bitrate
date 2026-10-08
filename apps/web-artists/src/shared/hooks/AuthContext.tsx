'use client'

import type { ArtistIdentity } from '@shared/auth/artistSession.types'
import { createContext, type ReactNode, useContext } from 'react'
import { useAuth } from './useAuth'

interface AuthContextType {
  artist: ArtistIdentity | undefined
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
  isLoggingOut: boolean
  logoutError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
