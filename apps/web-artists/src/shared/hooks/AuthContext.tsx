'use client'

import type { ApiSchemas } from '@bitrate/contracts'
import { createContext, type ReactNode, useContext } from 'react'
import { useAuth } from './useAuth'

type Artist = ApiSchemas['SafeUserEntity']

interface AuthContextType {
  artist: Artist | undefined
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
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
