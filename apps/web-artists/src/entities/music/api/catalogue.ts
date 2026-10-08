import { artistMusicKeys } from '@shared/api/artistMusicKeys'
import { clientFetchClient } from '@shared/api/fetchClient'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import {
  type CatalogueSearch,
  musicCountsSchema,
  musicReleasePageSchema,
  musicTrackPageSchema,
  trackStatuses,
  trackVersions,
} from '../model/catalogue'

async function getTracks(search: CatalogueSearch, signal: AbortSignal) {
  const { data, error } = await clientFetchClient.GET(
    '/api/v1/artist-music/tracks',
    {
      params: {
        query: {
          page: search.page ?? 1,
          limit: 6,
          search: search.q,
          sort: search.sort ?? 'updated',
          status: z.enum(trackStatuses).safeParse(search.status).data,
          type: z.enum(trackVersions).safeParse(search.type).data,
        },
      },
      signal,
    },
  )
  const parsed = musicTrackPageSchema.safeParse(data)
  if (error || !parsed.success)
    throw new Error('Could not load your tracks. Please try again.')
  return parsed.data
}

async function getReleases(search: CatalogueSearch, signal: AbortSignal) {
  const { data, error } = await clientFetchClient.GET(
    '/api/v1/artist-music/releases',
    {
      params: {
        query: {
          page: search.page ?? 1,
          limit: 6,
          search: search.q,
          sort: search.sort ?? 'updated',
          status: z
            .enum(['DRAFT', 'READY', 'SUBMITTED', 'RELEASED', 'REJECTED'])
            .safeParse(search.status).data,
          type: z
            .enum(['SINGLE', 'EP', 'ALBUM', 'COMPILATION'])
            .safeParse(search.type).data,
        },
      },
      signal,
    },
  )
  const parsed = musicReleasePageSchema.safeParse(data)
  if (error || !parsed.success)
    throw new Error('Could not load your releases. Please try again.')
  return parsed.data
}

export function useMusicCatalogue(
  artistId: string | undefined,
  tab: 'tracks' | 'releases',
  search: CatalogueSearch,
) {
  return useQuery<
    | z.infer<typeof musicTrackPageSchema>
    | z.infer<typeof musicReleasePageSchema>
  >({
    queryKey: [...artistMusicKeys.artist(artistId), 'catalogue', tab, search],
    queryFn: ({ signal }) =>
      tab === 'tracks'
        ? getTracks(search, signal)
        : getReleases(search, signal),
    enabled: Boolean(artistId),
    staleTime: 30_000,
  })
}

export function useMusicCounts(artistId: string | undefined) {
  return useQuery({
    queryKey: [...artistMusicKeys.artist(artistId), 'counts'],
    queryFn: async ({ signal }) => {
      const { data, error } = await clientFetchClient.GET(
        '/api/v1/artist-music/counts',
        { signal },
      )
      const parsed = musicCountsSchema.safeParse(data)
      if (error || !parsed.success)
        throw new Error('Could not load catalogue counts.')
      return parsed.data
    },
    enabled: Boolean(artistId),
    staleTime: 30_000,
  })
}
