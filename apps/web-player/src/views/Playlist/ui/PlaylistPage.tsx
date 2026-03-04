'use client'

import { setCurrentPlaylistName, setPlaylistTracks } from '@entities/Player'
import type { PlaylistServerApi } from '@entities/Playlist/api/server/PlaylistApi.server'
import { fallbackPlaylistCover } from '@shared/constants'
import { useAppDispatch } from '@shared/hooks'
import { useEffect } from 'react'
import { TracksList } from '../../../entities/Track/ui/TracksList'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import { PlaylistHeader } from './PlaylistHeader'

interface PlaylistPageProps {
  playlist: Awaited<ReturnType<typeof PlaylistServerApi.getPlaylists>>['data']
}

export const PlaylistPage = ({ playlist }: PlaylistPageProps) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPlaylistTracks(playlist?.tracks || []))
    dispatch(setCurrentPlaylistName(playlist?.title || 'Playlist'))
  }, [dispatch, playlist])

  return (
    <>
      <PlaylistHeader
        author={playlist?.user?.username || 'Unknown'}
        duration={getPlaylistDuration(playlist?.tracks || [])}
        imageUrl={playlist?.cover || fallbackPlaylistCover}
        title={playlist?.title || 'Playlist'}
        tracksCount={playlist?.tracks?.length || 0}
        type="Playlist"
      />
      {playlist?.tracks?.length === 0 ? (
        <div className="text-white p-8">No tracks in this playlist</div>
      ) : (
        <TracksList tracks={playlist?.tracks || []} />
      )}
    </>
  )
}
