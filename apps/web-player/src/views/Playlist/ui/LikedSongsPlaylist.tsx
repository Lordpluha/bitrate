'use client'

import { setPlaylistTracks, setCurrentPlaylistName } from '@entities/Player'
import { useAppDispatch } from '@shared/hooks'
import { useEffect } from 'react'
import { PlaylistHeader } from './PlaylistHeader'
import { TracksList } from '../../../entities/Track/ui/TracksList'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'

export type LikedSongsPlaylistProps = {
  tracks: TrackEntity[]
}

export const LikedSongsPlaylist = ({ tracks }: LikedSongsPlaylistProps) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setPlaylistTracks(tracks))
    dispatch(setCurrentPlaylistName('Liked Songs'))
  }, [dispatch, tracks])

  return (
    <>
      <PlaylistHeader
        title="Liked Songs"
        type="Playlist"
        imageUrl="/images/liked-songs.jpg"
        author="Your Library"
        tracksCount={tracks?.length || 0}
        duration={getPlaylistDuration(tracks)}
      />
      {tracks && tracks.length > 0 ? (
        <TracksList tracks={tracks} />
      ) : (
        <div className="text-white p-8">No liked tracks yet</div>
      )}
    </>
  )
}
