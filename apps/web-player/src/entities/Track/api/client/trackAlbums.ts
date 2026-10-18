'use client'

import { clientFetchClient } from '@shared/api/client'
import { ensureOkResponse } from '@shared/api/errors'
import { apiQueryKeys } from '@shared/api/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

/** `GET /albums/by-tracks` accepts at most this many ids per request. */
export const TRACK_ALBUMS_BATCH = 100

const trackAlbumsSchema = z.object({
  data: z.array(
    z.object({
      album: z.object({ id: z.string(), title: z.string() }).nullable(),
      trackId: z.string(),
    }),
  ),
})

export type TrackAlbum = { id: string; title: string }

/** Unique ids in list order, in batches the API accepts. */
export const chunkTrackIds = (trackIds: string[]) => {
  const unique = [...new Set(trackIds)]
  return Array.from(
    { length: Math.ceil(unique.length / TRACK_ALBUMS_BATCH) },
    (_, index) =>
      unique.slice(
        index * TRACK_ALBUMS_BATCH,
        (index + 1) * TRACK_ALBUMS_BATCH,
      ),
  )
}

const fetchTrackAlbums = async (trackIds: string[]) => {
  const pages = await Promise.all(
    chunkTrackIds(trackIds).map(async (batch) => {
      const { data, response } = await clientFetchClient.GET(
        '/api/v1/albums/by-tracks',
        { params: { query: { trackIds: batch.join(',') } } },
      )
      ensureOkResponse(response, 'Failed to load the tracks’ albums')
      return trackAlbumsSchema.parse(data).data
    }),
  )
  return new Map(
    pages.flat().map(({ album, trackId }) => [trackId, album] as const),
  )
}

/**
 * The album of each track in a list, one request per 100 tracks; a track without an album maps
 * to null.
 */
export const useTrackAlbums = (trackIds: string[]) =>
  useQuery({
    enabled: trackIds.length > 0,
    queryFn: () => fetchTrackAlbums(trackIds),
    queryKey: apiQueryKeys.tracks.albums(trackIds),
    staleTime: 5 * 60_000,
  })
