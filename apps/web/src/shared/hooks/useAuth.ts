'use client'

import { fetchClient } from '@shared/api'
import { ROUTES } from '@shared/routes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
  email: string
  avatar: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

const userQueryKeys = {
  user: ['user'] as const,
}

export const useAuth = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading, isSuccess, error, isPending } = useQuery<User>({
    queryKey: userQueryKeys.user,
    queryFn: async () => {
      const { data, response } = await fetchClient.GET('/api/v1/auth/me')

      if (!response.ok) {
        throw new Error('Not authenticated')
      }

      return data as User
    },
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
    staleTime: Infinity, // Data never becomes stale - only refetch manually
    gcTime: Infinity, // Keep in cache forever until manual invalidation
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on every mount - use cache
    refetchOnReconnect: false, // Don't refetch on reconnect
  })

  // User is authenticated if we have user data (even if it's from cache)
  // Only consider unauthenticated if explicitly got 401/403 error
  const isAuthenticated = !!user

  const { mutate } = useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userQueryKeys.user
      })
      router.push(ROUTES.landing)
    },
    mutationFn: async () => {
      const { response } = await fetchClient.POST('/api/v1/auth/logout')
      if (!response.ok) throw new Error('Logout failed')
    }
  })

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isPending,
    logout: mutate
  }
}
