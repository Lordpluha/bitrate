import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal as signal } from '@shared/api/writeTimeout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

const setupSchema = z.object({
  qrCodeDataUrl: z.string().startsWith('data:image/'),
  manualCode: z.string().min(16),
})

/** Starts enrolment; the secret only becomes active once a code confirms it. */
export function useTwoFactorSetup() {
  return useMutation({
    retry: false,
    mutationFn: async () => {
      const result = await clientFetchClient
        .POST('/api/v1/artists/auth/2fa/setup', { signal: signal() })
        .catch(() => undefined)
      const parsed = setupSchema.safeParse(result?.data)
      if (!result?.response.ok || !parsed.success)
        throw new Error('Could not start two-factor setup. Please try again.')
      return parsed.data
    },
  })
}

/** Enables or disables two-factor sign-in with a code from the authenticator app. */
export function useTwoFactorToggle(artistId: string, enable: boolean) {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (code: string) => {
      const body = { code }
      const result = await (enable
        ? clientFetchClient.POST('/api/v1/artists/auth/2fa/enable', {
            body,
            signal: signal(),
          })
        : clientFetchClient.DELETE('/api/v1/artists/auth/2fa/disable', {
            body,
            signal: signal(),
          })
      ).catch(() => undefined)
      if (!result)
        throw new Error(
          'Could not confirm the change. Reload before trying again.',
        )
      if (result.response.status === 400 || result.response.status === 401)
        throw new Error(
          'That code did not match. Enter the current 6-digit code.',
        )
      if (!result.response.ok)
        throw new Error(
          'Could not change two-factor sign-in. Please try again.',
        )
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: artistMusicKeys.artist(artistId),
      }),
  })
}

/** Sends the standard reset link to the account email; the response never reveals more. */
export function usePasswordResetEmail() {
  return useMutation({
    retry: false,
    mutationFn: async (email: string) => {
      const result = await clientFetchClient
        .POST('/api/v1/artists/auth/forgot-password', {
          body: { email },
          signal: signal(),
        })
        .catch(() => undefined)
      if (!result?.response.ok)
        throw new Error('Could not send the reset email. Please try again.')
    },
  })
}

/** Requests account deletion; the session ends and the artist returns to sign-in. */
export function useDeleteAccount(artistId: string) {
  return useMutation({
    retry: false,
    mutationFn: async () => {
      const result = await clientFetchClient
        .DELETE('/api/v1/artists/{id}', {
          params: { path: { id: artistId } },
          signal: signal(),
        })
        .catch(() => undefined)
      if (!result?.response.ok)
        throw new Error('Could not delete the account. Please try again.')
    },
  })
}
