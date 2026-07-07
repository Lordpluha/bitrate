'use client'

import { clientFetchClient } from '@shared/api/fetchClient'
import { ROUTES } from '@shared/routes/routes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'

const authQueryKeys = {
  all: ['auth'] as const,
  artist: () => [...authQueryKeys.all, 'artist'] as const,
}

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const isAuthPage =
    pathname?.startsWith('/auth') ||
    pathname === ROUTES.auth.login ||
    pathname === ROUTES.auth.registration
  const shouldFetchAuthUser = Boolean(pathname) && !isAuthPage

  const { data: artist, isLoading } = useQuery({
    queryKey: authQueryKeys.artist(),
    queryFn: async () => {
      const response = await clientFetchClient.GET('/api/v1/artists/auth/me')
      if (response.error) {
        throw new Error('Failed to fetch artist')
      }
      return response.data
    },
    enabled: shouldFetchAuthUser,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await clientFetchClient.POST(
        '/api/v1/artists/auth/logout',
      )
      if (response.error) {
        throw new Error('Logout failed')
      }
      return response.data
    },
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.artist(), null)
      router.push(ROUTES.auth.login)
    },
    onError: (error) => {
      console.error('Logout error:', error)
      router.push(ROUTES.auth.login)
    },
  })

  const logout = () => logoutMutation.mutate()

  return {
    artist,
    isAuthenticated: !!artist,
    isLoading,
    logout,
  }
}
