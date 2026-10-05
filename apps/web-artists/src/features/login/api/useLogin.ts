import type { ApiSchemas } from '@bitrate/contracts'
import { clientFetchClient } from '@shared/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import type { LoginFormData } from '../validation'

const authQueryKeys = {
  all: ['auth'] as const,
  artist: () => [...authQueryKeys.all, 'artist'] as const,
}

type LoginResult =
  | Pick<ApiSchemas['TwoFactorRequiredEntity'], 'requires2fa'>
  | undefined

const twoFactorChallengeSchema = z.object({ requires2fa: z.literal(true) })

interface LoginOptions {
  onSuccess?: (data: LoginResult) => void | Promise<void>
  onError?: (error: Error) => void | Promise<void>
}

const apiErrorSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]).optional(),
})

export const useLogin = (options?: LoginOptions) => {
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
        const errorData = apiErrorSchema.safeParse(response.error)
        const message = errorData.success ? errorData.data.message : undefined
        const errorMessage = Array.isArray(message) ? message[0] : message
        throw new Error(errorMessage || 'Login failed')
      }

      if (response.data === undefined) return undefined
      const challenge = twoFactorChallengeSchema.safeParse(response.data)
      if (!challenge.success) throw new Error('Unexpected sign-in response')
      return challenge.data
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.artist() })
      await options?.onSuccess?.(data)
    },
    onError: async (error) => {
      await options?.onError?.(error)
    },
  })
}
