'use client'

import { fetchClient } from '@shared/api'
import { ROUTES } from '@shared/routes'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

const userQueryKeys = {
  user: ['user'] as const,
}

export const useAuth = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading, isSuccess: isAuthenticated } = useQuery({
    queryKey: userQueryKeys.user,
    queryFn: async () => {
      const { data, response } = await fetchClient.GET('/auth/me')
      if (!response.ok) throw new Error('Not authenticated')
      return data
    },
    retry: false
  })

  const { mutate } = useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userQueryKeys.user
      })
      router.push(ROUTES.landing)
    },
    mutationFn: async () => {
      const { response } = await fetchClient.POST('/auth/logout')
      if (!response.ok) throw new Error('Logout failed')
    }
  })

  return {
    user,
    isAuthenticated,
    isLoading,
    logout: mutate
  }
}
