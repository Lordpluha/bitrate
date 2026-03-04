'use client'

import { setCurrentPlaylistName, setPlaylistTracks } from '@entities/Player'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useAppDispatch } from '@shared/hooks'
import { useEffect } from 'react'
import { TracksList } from '../../../entities/Track/ui/TracksList'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import { PlaylistHeader } from './PlaylistHeader'

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
        author="Your Library"
        duration={getPlaylistDuration(tracks)}
        imageUrl="/images/liked-songs.jpg"
        title="Liked Songs"
        tracksCount={tracks?.length || 0}
        type="Playlist"
      />
      {tracks && tracks.length > 0 ? (
        <TracksList tracks={tracks} />
      ) : (
        <div className="text-white p-8">No liked tracks yet</div>
      )}
    </>
  )
}
