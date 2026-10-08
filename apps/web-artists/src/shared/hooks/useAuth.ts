'use client'

import { clientFetchClient } from '@shared/api/fetchClient'
import { artistSessionCheck } from '@shared/auth/artistSessionCheck'
import { ROUTES } from '@shared/routes/routes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useMatch, useRouter } from '@tanstack/react-router'

const authQueryKeys = {
  all: ['auth'] as const,
  artist: () => [...authQueryKeys.all, 'artist'] as const,
}

export function useAuth() {
  const router = useRouter()
  const pathname = useLocation({ select: (location) => location.pathname })
  const queryClient = useQueryClient()
  const dashboardMatch = useMatch({ from: '/dashboard', shouldThrow: false })

  const isAuthPage =
    pathname?.startsWith('/auth') ||
    pathname === ROUTES.auth.login ||
    pathname === ROUTES.auth.registration ||
    pathname === ROUTES.auth.verifyEmail
  const isDashboard =
    pathname === ROUTES.dashboard.home ||
    pathname.startsWith(`${ROUTES.dashboard.home}/`)
  const shouldFetchAuthUser = Boolean(pathname) && !isAuthPage && !isDashboard

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
    onSuccess: async () => {
      artistSessionCheck.clear()
      await queryClient.cancelQueries()
      await router.navigate({ to: ROUTES.auth.login, replace: true })
      // Clear after the workspace unmounts so its observers cannot restart private requests.
      queryClient.clear()
      router.clearCache()
      await router.invalidate()
    },
    onError: (error) => {
      console.error('Logout error:', error)
    },
  })

  const logout = () => logoutMutation.mutate()

  return {
    artist: dashboardMatch?.context.artist ?? artist,
    isAuthenticated: Boolean(dashboardMatch?.context.artist ?? artist),
    isLoading: shouldFetchAuthUser && isLoading,
    logout,
    isLoggingOut: logoutMutation.isPending,
    logoutError: logoutMutation.isError
      ? 'Could not sign out. Please try again.'
      : null,
  }
}
