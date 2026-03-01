'use client'

import { clientFetchClient } from '@shared/api/client'
import { ROUTES } from '@shared/routes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, usePathname } from 'next/navigation'

const userQueryKeys = {
  user: ['user'] as const,
}

export const useAuth = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const pathname = usePathname()

  // Не запрашиваем данные пользователя на страницах авторизации
  const isAuthPage = pathname?.startsWith('/auth/')

  const {
    data: user,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: userQueryKeys.user,
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET('/api/v1/auth/me')

      // Если ответ не OK и это не 401 (401 обрабатывается middleware)
      if (!response.ok && response.status !== 401) {
        throw new Error('Failed to fetch user')
      }

      return data
    },
    enabled: !isAuthPage, // Отключаем запрос на страницах авторизации
    retry: false, // Не делаем retry - middleware сам обработает 401
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
        queryKey: userQueryKeys.user,
      })
      router.push(ROUTES.landing)
    },
    mutationFn: async () => {
      const { response } = await clientFetchClient.POST('/api/v1/auth/logout')
      if (!response.ok) throw new Error('Logout failed')
    },
  })

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isPending,
    logout: mutate,
  }
}
