'use client'

import { fetchClient } from '@shared/api'
import { ROUTES } from '@shared/routes'
import { ApiSchemas } from '@spotify/contracts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

export const useAuth = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user, isLoading, isSuccess: isAuthenticated } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data, response } = await fetchClient.GET('/auth/me')
      if (!response.ok) throw new Error('Not authenticated')
      return data as ApiSchemas['UserEntity']
    },
    retry: false
  })

  const { mutate } = useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user']
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
