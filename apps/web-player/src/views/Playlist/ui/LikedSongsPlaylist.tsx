'use client'

import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { type TrackEntity, TracksList, useLikedTracks } from '@entities/Track'
import { useMemo } from 'react'
import { useI18n } from '@/shared/i18n'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import { PlaylistHeader } from './PlaylistHeader'

export type LikedSongsPlaylistProps = {
  tracks: TrackEntity[]
}

export const LikedSongsPlaylist = ({ tracks }: LikedSongsPlaylistProps) => {
  const { t } = useI18n()
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
        author={t('library.title')}
        duration={getPlaylistDuration(currentTracks)}
        imageUrl="/images/liked-songs.jpg"
        title={t('library.likedSongs')}
        tracksCount={currentTracks?.length || 0}
        type={t('common.playlist')}
      />
      {currentTracks && currentTracks.length > 0 ? (
        <TracksList
          activeTrackId={musicPlayer.currentTrack?.id}
          isPlaybackContextActive={
            musicPlayer.currentPlaylistId === likedSongsPlaybackId
          }
          likedTrackIds={likedTrackIds}
          onPlayTrack={(track, index) =>
            playPlaylist({
              currentPlaylistId: likedSongsPlaybackId,
              currentPlaylistName: t('library.likedSongs'),
              startTrack: track,
              startTrackIndex: index,
              tracks: currentTracks,
            })
          }
          tracks={currentTracks}
        />
      ) : (
        <div className="p-8 text-white">{t('playlist.likedEmpty')}</div>
      )}
    </>
  )
}
