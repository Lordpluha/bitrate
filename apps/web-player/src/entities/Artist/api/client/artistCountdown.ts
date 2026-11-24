'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

/** An upcoming release the artist counts down to: only its title, cover and release time. */
export const artistCountdownSchema = z.object({
  countdown: z
    .object({
      releaseId: z.string(),
      title: z.string(),
      cover: z.string().nullable(),
      releaseAt: z.string(),
    })
    .nullable(),
})

export type ArtistCountdown = NonNullable<
  z.infer<typeof artistCountdownSchema>['countdown']
>

/** The server caches it for a minute; the tile does not need to be fresher than that. */
const COUNTDOWN_STALE_TIME = 60_000

type UseArtistCountdownInput = {
  artistId: string
}

/** The artist's countdown tile (AI promotion, AC-11), or null when there is none. */
export const useArtistCountdown = ({ artistId }: UseArtistCountdownInput) =>
  useQuery({
    queryKey: apiQueryKeys.artists.countdown(artistId),
    queryFn: async () => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/artists/{id}/countdown',
        { params: { path: { id: artistId } } },
      )
      ensureOkResponse(response, 'Failed to fetch artist countdown')
      return artistCountdownSchema.parse(data).countdown
    },
    enabled: artistId.length > 0,
    staleTime: COUNTDOWN_STALE_TIME,
  })
