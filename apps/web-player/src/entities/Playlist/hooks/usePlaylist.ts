'use client'

import type { TrackEntity } from '@entities/Track'
import { useQuery } from '@shared/api/client'
import type { PlaylistEntity } from '../models/schemas/Playlist.entity'
import { useEffect } from 'react'

export type WithTracks<T> = T & { tracks: TrackEntity[] }

export const usePlaylist = (
  playlistId: string,
  onSuccess?: (playlist: WithTracks<PlaylistEntity>) => void,
) => {
  const query = useQuery(
    'get',
    '/api/v1/playlists/{id}',
    {
      params: {
        path: {
          id: playlistId,
        },
      },
    },
    {
      enabled: !!playlistId,
      select: (data) => {
        const tracks = (data as WithTracks<typeof data>).tracks.map(
          (track) => ({
            ...track,
            audioUrl: `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${track.id}`,
          }),
        )
        return {
          ...data,
          tracks,
        }
      },
    },
  )

  useEffect(() => {
    if (query.data) onSuccess?.(query.data)
  }, [onSuccess, query.data])

  return query
}
