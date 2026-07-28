import { apiBaseUrl, clientFetchClient } from '@shared/api'
import {
  type UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import type { RegistrationFormData } from '../validation'

const authQueryKeys = {
  all: ['auth'] as const,
  artist: () => [...authQueryKeys.all, 'artist'] as const,
}

type EmailAvailabilityResponse = {
  available: boolean
}

export async function checkArtistEmailAvailability(email: string) {
  const response = await fetch(
    `${apiBaseUrl}/api/v1/artists/auth/email-availability?email=${encodeURIComponent(email)}`,
    {
      credentials: 'include',
    },
  )

  if (!response.ok) {
    throw new Error('Unable to verify this email right now')
  }

  const data = (await response.json()) as EmailAvailabilityResponse
  return data.available
}

export const useRegistration = (
  options?: UseMutationOptions<unknown, Error, RegistrationFormData>,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const generatedUsername = data.email.split('@')[0]

      const response = await clientFetchClient.POST(
        '/api/v1/artists/auth/registration',
        {
          body: {
            email: data.email,
            password: data.password,
            username: generatedUsername,
          },
        },
      )

      if (response.error) {
        const errorData = response.error as { message?: string | string[] }

        const errorMessage = Array.isArray(errorData.message)
          ? errorData.message[0]
          : errorData.message

        throw new Error(errorMessage || 'Registration failed')
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
