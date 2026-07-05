'use client'

import { setCurrentPlaylistName, setPlaylistTracks } from '@entities/Player'
import { useLikedTracks } from '@entities/Track/api/client'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import { useAppDispatch } from '@shared/hooks'
import { useEffect, useMemo } from 'react'
import { TracksList } from '../../../entities/Track/ui/TracksList'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import { PlaylistHeader } from './PlaylistHeader'

export type LikedSongsPlaylistProps = {
  tracks: TrackEntity[]
}

export const LikedSongsPlaylist = ({ tracks }: LikedSongsPlaylistProps) => {
  const dispatch = useAppDispatch()
  const { data: likedTracks } = useLikedTracks(1, 100, undefined, {
    initialData: tracks,
  })
  const currentTracks = likedTracks ?? tracks
  const likedTrackIds = useMemo(
    () => currentTracks.map((track) => track.id),
    [currentTracks],
  )

  useEffect(() => {
    dispatch(setPlaylistTracks(currentTracks))
    dispatch(setCurrentPlaylistName('Liked Songs'))
  }, [currentTracks, dispatch])

  return (
    <>
      <PlaylistHeader
        author="Your Library"
        duration={getPlaylistDuration(currentTracks)}
        imageUrl="/images/liked-songs.jpg"
        title="Liked Songs"
        tracksCount={currentTracks?.length || 0}
        type="Playlist"
      />
      {currentTracks && currentTracks.length > 0 ? (
        <TracksList likedTrackIds={likedTrackIds} tracks={currentTracks} />
      ) : (
        <div className="text-white p-8">No liked tracks yet</div>
      )}
    </>
  )
}
