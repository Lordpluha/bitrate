'use client'

import { clientFetchClient } from '@shared/api/client'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { ROUTES } from '@shared/routes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'

export const useAuth = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const pathname = usePathname()

  /** Auth screens must not fetch the current user. */
  const isAuthPage = pathname?.startsWith('/auth/')

  /**
   * Never queries on auth pages, never retries a 401 (the middleware owns
   * that), and otherwise relies entirely on the cache until an explicit
   * invalidation.
   */
  const {
    data: user,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: apiQueryKeys.auth.me,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET('/api/v1/auth/me')

      /** Non-401 failures are real errors; 401 is handled by the middleware. */
      if (!response.ok && response.status !== 401) {
        throw new Error('Failed to fetch user')
      }

      return data
    },
    enabled: !isAuthPage,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  /** Cached user data still counts as authenticated; only an explicit 401/403 signs the user out. */
  const isAuthenticated = !!user

  const { mutate, isPending: isLogoutPending } = useMutation({
    onSuccess: async () => {
      queryClient.clear()
      router.replace(ROUTES.landing)
      router.refresh()
    },
    mutationFn: async () => {
      const { response } = await clientFetchClient.POST('/api/v1/auth/logout')

      if (response.status === 401 || response.status === 403) return
      if (!response.ok) throw new Error('Logout failed')
    },
  })

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isPending,
    isLogoutPending,
    logout: mutate,
  }
}
