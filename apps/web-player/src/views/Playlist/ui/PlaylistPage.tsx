'use client'

import {
  setPlaylistTracks,
  setCurrentPlaylistName,
} from '@entities/Player'
import { useAppDispatch } from '@shared/hooks'
import { useEffect } from 'react'
import { PlaylistHeader } from './PlaylistHeader'
import { TracksList } from '../../../entities/Track/ui/TracksList'
import { type WithTracks } from '@entities/Playlist/hooks/usePlaylist'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import { fallbackPlaylistCover } from '@shared/constants'
import type { PlaylistEntity } from '@entities/Playlist/models/schemas/Playlist.entity'

interface PlaylistPageProps {
	playlist: WithTracks<PlaylistEntity>
}

export const PlaylistPage = ({ playlist }: PlaylistPageProps) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
		dispatch(setPlaylistTracks(playlist.tracks))
		dispatch(setCurrentPlaylistName(playlist?.title || 'Playlist'))
	}, [dispatch, playlist])

  return (
    <>
      <PlaylistHeader
        title={playlist?.title || 'Playlist'}
        type="Playlist"
        imageUrl={playlist?.cover || fallbackPlaylistCover}
        author={playlist?.user?.username || 'Unknown'}
        tracksCount={playlist?.tracks.length || 0}
        duration={getPlaylistDuration(playlist?.tracks || [])}
      />
      {playlist?.tracks.length === 0 ? (
        <div className="text-white p-8">No tracks in this playlist</div>
      ) : (
        <TracksList tracks={playlist?.tracks || []} />
      )}
    </>
  )
}
