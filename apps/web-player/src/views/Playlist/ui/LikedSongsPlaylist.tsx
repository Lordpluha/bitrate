'use client'

import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { type TrackEntity, TracksList, useLikedTracks } from '@entities/Track'
import { ROUTES } from '@shared/routes'
import { StateMessage } from '@shared/ui'
import { Heart, Pause, Play } from 'lucide-react'
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
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const isLikedContext = musicPlayer.currentPlaylistId === likedSongsPlaybackId
  const isLikedPlaying = isLikedContext && musicPlayer.isPlaying
  const playFrom = (track: TrackEntity, index: number) =>
    playPlaylist({
      currentPlaylistId: likedSongsPlaybackId,
      currentPlaylistName: t('library.likedSongs'),
      startTrack: track,
      startTrackIndex: index,
      tracks: currentTracks,
    })
  const handlePlay = () => {
    if (isLikedContext) {
      togglePlay()
      return
    }
    const [firstTrack] = currentTracks
    if (firstTrack) playFrom(firstTrack, 0)
  }

  return (
    <>
      <PlaylistHeader
        author={t('library.title')}
        duration={getPlaylistDuration(currentTracks)}
        imageUrl="/images/liked-songs.svg"
        title={t('library.likedSongs')}
        tracksCount={currentTracks?.length || 0}
        type={t('common.playlist')}
      />
      {currentTracks.length > 0 ? (
        <button
          aria-label={`${isLikedPlaying ? 'Pause' : 'Play'} ${t('library.likedSongs')}`}
          className="flex size-10 shrink-0 items-center justify-center self-end rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 md:size-14 md:self-start"
          onClick={handlePlay}
          type="button"
        >
          {isLikedPlaying ? (
            <Pause
              aria-hidden="true"
              className="size-4.5 md:size-6"
              fill="currentColor"
            />
          ) : (
            <Play
              aria-hidden="true"
              className="size-4.5 md:size-6"
              fill="currentColor"
            />
          )}
        </button>
      ) : null}
      {currentTracks.length > 0 ? (
        <TracksList
          activeTrackId={musicPlayer.currentTrack?.id}
          isPlaybackContextActive={isLikedContext}
          likedTrackIds={likedTrackIds}
          onPlayTrack={playFrom}
          tracks={currentTracks}
        />
      ) : (
        <StateMessage
          className="min-h-80"
          description="You haven't liked any songs yet. Start exploring and like your favorite tracks!"
          icon={Heart}
          primary={{ href: ROUTES.search(), label: 'Find something to play' }}
          title={t('playlist.likedEmpty')}
        />
      )}
    </>
  )
}
