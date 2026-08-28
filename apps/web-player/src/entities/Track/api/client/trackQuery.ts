import {
  trackResponseSchema,
  tracksResponseSchema,
} from '@entities/Track/api/trackResponse.schema'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { queryOptions } from '@shared/api/client'
import { getApiUrl } from '@shared/utils/mediaUrl'

export type UseTracksParams = {
  artistId?: string
  limit?: number
  page?: number
  title?: string
}

export type UseTracksOptions = {
  enabled?: boolean
}

export type UseLikedTracksOptions = {
  enabled?: boolean
  initialData?: TrackEntity[]
  staleTime?: number
}

export const withPlayableUrl = (track: TrackEntity): TrackEntity => ({
  ...track,
  audioUrl: getApiUrl(`/api/v1/tracks/stream/${track.id}`),
})

export const normalizeTrackResponse = (data: unknown) =>
  trackResponseSchema.parse(data)

export const normalizeTracksResponse = (data: unknown) =>
  tracksResponseSchema.parse(data)

export const trackDetailQueryKey = (trackId: string) =>
  queryOptions('get', '/api/v1/tracks/{id}', {
    params: { path: { id: trackId } },
  }).queryKey
