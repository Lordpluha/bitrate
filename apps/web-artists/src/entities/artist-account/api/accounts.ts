import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { notifyArtistSessionChange } from '@shared/auth/accountSelection'
import { messageKey } from '@shared/i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

const savedAccountsSchema = z.object({
  accounts: z
    .array(
      z.object({
        id: z.uuid(),
        username: z.string(),
        avatar: z.string().nullable(),
        current: z.boolean(),
      }),
    )
    .max(6),
  limit: z.number().int().positive().max(10),
})
const key = (artistId: string) =>
  ['artist-account', artistId, 'saved-accounts'] as const
export function useSavedArtistAccounts(artistId: string) {
  return useQuery({
    queryKey: key(artistId),
    retry: false,
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artists/auth/accounts',
        { signal },
      )
      const parsed = savedAccountsSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error(messageKey('account.switcher.loadFailed'))
      return parsed.data
    },
  })
}
export function useManageArtistAccounts(artistId: string) {
  const query = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (
      action: { kind: 'add' } | { kind: 'switch' | 'remove'; id: string },
    ) => {
      if (action.kind === 'add') {
        const result = await clientFetchClient.POST(
          '/api/v1/artists/auth/accounts/current',
          { signal: writeSignal() },
        )
        if (!result.response.ok)
          throw new Error(messageKey('account.switcher.failed'))
        window.location.assign('/login?addAccount=1&next=%2Fdashboard')
        return
      }
      if (action.kind === 'switch') {
        const result = await clientFetchClient.POST(
          '/api/v1/artists/auth/accounts/{artistId}/switch',
          { params: { path: { artistId: action.id } }, signal: writeSignal() },
        )
        if (result.response.status !== 204)
          throw new Error(messageKey('account.switcher.unavailable'))
        notifyArtistSessionChange('changed')
        window.location.replace('/dashboard')
        return
      }
      const result = await clientFetchClient.DELETE(
        '/api/v1/artists/auth/accounts/{artistId}',
        { params: { path: { artistId: action.id } }, signal: writeSignal() },
      )
      if (result.response.status !== 204)
        throw new Error(messageKey('account.switcher.failed'))
      await query.invalidateQueries({ queryKey: key(artistId) })
    },
  })
}
