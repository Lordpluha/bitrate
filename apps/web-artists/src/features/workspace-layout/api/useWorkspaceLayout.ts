import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { writeSignal } from '@shared/api/writeTimeout'
import { messageKey } from '@shared/i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type LayoutPage,
  type LayoutTile,
  storedLayoutSchema,
} from '../model/layout'

const layoutKey = (artistId: string, page: LayoutPage) =>
  [...artistMusicKeys.artist(artistId), 'layout', page] as const

/** The artist's stored arrangement of `page`; empty when they keep the default. */
export function useWorkspaceLayout(artistId: string, page: LayoutPage) {
  return useQuery({
    queryKey: layoutKey(artistId, page),
    queryFn: async ({ signal }) => {
      const result = await clientFetchClient.GET(
        '/api/v1/artist-workspace/layouts/{page}',
        { params: { path: { page } }, signal },
      )
      const parsed = storedLayoutSchema.safeParse(result.data)
      if (!result.response.ok || !parsed.success)
        throw new Error(messageKey('layout.error.load'))
      return parsed.data.tiles
    },
    staleTime: Number.POSITIVE_INFINITY,
  })
}

/** Saves the whole arrangement; `null` returns the page to its default. */
export function useSaveWorkspaceLayout(artistId: string, page: LayoutPage) {
  const queryClient = useQueryClient()
  return useMutation({
    retry: false,
    mutationFn: async (tiles: LayoutTile[] | null) => {
      const options = {
        params: { path: { page } },
        signal: writeSignal(),
      }
      const result = await (tiles
        ? clientFetchClient.PUT('/api/v1/artist-workspace/layouts/{page}', {
            ...options,
            body: { tiles },
          })
        : clientFetchClient.DELETE(
            '/api/v1/artist-workspace/layouts/{page}',
            options,
          )
      ).catch(() => undefined)
      if (!result?.response.ok) throw new Error(messageKey('layout.error.save'))
      return tiles ?? []
    },
    onSuccess: (tiles) =>
      queryClient.setQueryData(layoutKey(artistId, page), tiles),
  })
}
