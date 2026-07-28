'use client'

import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { type TrackEntity, TracksList, useLikedTracks } from '@entities/Track'
import { useMemo } from 'react'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import { PlaylistHeader } from './PlaylistHeader'

export type LikedSongsPlaylistProps = {
  tracks: TrackEntity[]
}

export const LikedSongsPlaylist = ({ tracks }: LikedSongsPlaylistProps) => {
  const musicPlayer = usePlayerStore(selectMusicPlayer)
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const { data: likedTracks } = useLikedTracks(1, 100, undefined, {
    initialData: tracks,
  })
  const currentTracks = likedTracks ?? tracks
  const likedSongsPlaybackId = 'liked-songs'
  const likedTrackIds = useMemo(
    () => currentTracks.map((track) => track.id),
    [currentTracks],
  )

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
        <TracksList
          activeTrackIndex={musicPlayer.currentTrackIndex}
          isPlaybackContextActive={
            musicPlayer.currentPlaylistId === likedSongsPlaybackId
          }
          likedTrackIds={likedTrackIds}
          onPlayTrack={(track, index) =>
            playPlaylist({
              currentPlaylistId: likedSongsPlaybackId,
              currentPlaylistName: 'Liked Songs',
              startTrack: track,
              startTrackIndex: index,
              tracks: currentTracks,
            })
          }
          tracks={currentTracks}
        />
      ) : (
        <div className="text-white p-8">No liked tracks yet</div>
      )}
    </>
  )
}
