import { clientFetchClient } from '@shared/api'
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { LoginFormData } from '../validation'

const authQueryKeys = {
  all: ['auth'] as const,
  artist: () => [...authQueryKeys.all, 'artist'] as const,
}

export const useLogin = (
  options?: UseMutationOptions<unknown, Error, LoginFormData>,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await clientFetchClient.POST(
        '/api/v1/artists/auth/login',
        {
          body: data,
        },
      )

      if (response.error) {
        const errorData = response.error as { message?: string | string[] }

        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message[0]
          : errorData.message

        throw new Error(errorMessage || 'Login failed')
      }

      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.artist() })
      options?.onSuccess?.(
        data,
        variables,
        undefined as never,
        undefined as never,
      )
    },
    onError: (error, variables) => {
      options?.onError?.(
        error,
        variables,
        undefined as never,
        undefined as never,
      )
    },
  })
}
