'use client'

import {
  selectCurrentPlaylistName,
  selectMusicPlayer,
  usePlayerStore,
} from '@entities/Player'
import { useLikeTrack, useUnlikeTrack } from '@entities/Track/api/client'
import { showApiSuccessToast } from '@shared/api/feedback'
import { useAudioPlayer } from '@shared/hooks'
import { useArtist } from '@shared/hooks/useArtist'
import { useLikedTracks } from '@shared/hooks/useLikedTracks'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { type FC, useCallback, useEffect, useMemo, useState } from 'react'
import { usePlayerSessionPersistence } from '@/widgets/Player/model/usePlayerSessionPersistence'
import { usePlaylistShuffle } from '@/widgets/Player/model/usePlaylistShuffle'
import { FloatingPlayerWindow } from './FloatingPlayerWindow'
import { MiniPlayer } from './MiniPlayer'
import { NowPlayingView } from './NowPlayingView'
import { PlayerActions } from './PlayerActions'
import { PlayerControls } from './PlayerControls'
import { TrackInfo } from './TrackInfo'

interface PlayerProps {
  isExpanded: boolean
  onExpandedChange: (isExpanded: boolean) => void
}

export const Player: FC<PlayerProps> = ({ isExpanded, onExpandedChange }) => {
  const player = usePlayerStore(selectMusicPlayer)
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isShuffled,
    playlist,
  } = player
  const currentPlaylistName = usePlayerStore(selectCurrentPlaylistName)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const [floatingWindow, setFloatingWindow] = useState<Window | null>(null)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const { data: likedTracks } = useLikedTracks()
  const likeTrack = useLikeTrack()
  const unlikeTrack = useUnlikeTrack()
  const artistName = artist?.username || 'Unknown Artist'
  const likedTrackIds = useMemo(
    () => new Set(likedTracks?.map((track) => track.id) ?? []),
    [likedTracks],
  )
  const isCurrentTrackLiked = currentTrack
    ? likedTrackIds.has(currentTrack.id)
    : false
  const isLikePending = likeTrack.isPending || unlikeTrack.isPending

  const {
    activeSlot,
    bindAudioElement,
    togglePlayPause,
    onSeek,
    changeTrack,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleProgress,
    handleCanPlay,
    handlePlaybackStateChange,
    handleEnded,
    handleSeeked,
  } = useAudioPlayer()

  usePlayerSessionPersistence(player, currentPlaylistName)
  const handleShuffleToggle = usePlaylistShuffle({
    currentTrack,
    isShuffled,
    playlist,
  })
  const isVisible = Boolean(currentTrack)

  useEffect(() => {
    if (!currentTrack) {
      onExpandedChange(false)
    }
  }, [currentTrack, onExpandedChange])

  const coverUrl = getTrackCoverUrl(currentTrack?.cover)

  const handleLikeToggle = useCallback(async () => {
    if (!currentTrack || isLikePending) return

    if (isCurrentTrackLiked) {
      await unlikeTrack.mutateAsync({
        params: {
          path: {
            id: currentTrack.id,
          },
        },
      })
      showApiSuccessToast('Removed from Liked Songs')
      return
    }

    await likeTrack.mutateAsync({
      params: {
        path: {
          id: currentTrack.id,
        },
      },
    })
    showApiSuccessToast('Added to Liked Songs')
  }, [currentTrack, isCurrentTrackLiked, isLikePending, likeTrack, unlikeTrack])

  const closeFloatingPlayer = useCallback(() => {
    if (floatingWindow && !floatingWindow.closed) {
      floatingWindow.close()
    }
    setFloatingWindow(null)
  }, [floatingWindow])

  const openFloatingPlayer = useCallback(async () => {
    if (!currentTrack) return

    if (floatingWindow && !floatingWindow.closed) {
      floatingWindow.focus()
      return
    }

    type DocumentPictureInPictureWindow = Window & {
      documentPictureInPicture?: {
        requestWindow: (options?: {
          width?: number
          height?: number
        }) => Promise<Window>
      }
    }

    const currentWindow = window as DocumentPictureInPictureWindow
    const nextWindow = currentWindow.documentPictureInPicture
      ? await currentWindow.documentPictureInPicture.requestWindow({
          height: 140,
          width: 380,
        })
      : window.open('', 'spotify-floating-player', 'popup,width=380,height=140')

    if (!nextWindow) return

    nextWindow.document.title = `${currentTrack.title} - Spotify`
    nextWindow.addEventListener('pagehide', () => setFloatingWindow(null), {
      once: true,
    })
    setFloatingWindow(nextWindow)
  }, [currentTrack, floatingWindow])

  if (!currentTrack) {
    return null
  }

  return (
    <>
      {([0, 1] as const).map((slot) => (
        // biome-ignore lint/a11y/useMediaCaption: this element plays audio-only music
        <audio
          data-active={activeSlot === slot}
          key={slot}
          onCanPlay={() => handleCanPlay(slot)}
          onEnded={() => handleEnded(slot)}
          onLoadedMetadata={() => handleLoadedMetadata(slot)}
          onPause={() => handlePlaybackStateChange(slot, false)}
          onPlay={() => handlePlaybackStateChange(slot, true)}
          onProgress={() => handleProgress(slot)}
          onSeeked={handleSeeked}
          onTimeUpdate={() => handleTimeUpdate(slot)}
          preload="auto"
          ref={(element) => bindAudioElement(slot, element)}
        />
      ))}

      <FloatingPlayerWindow
        artist={artistName}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onClose={closeFloatingPlayer}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
        onPrevious={() => changeTrack('prev')}
        onSeek={onSeek}
        targetWindow={floatingWindow}
        title={currentTrack.title || 'Unknown'}
      />

      <NowPlayingView
        artist={artistName}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isLiked={isCurrentTrackLiked}
        isOpen={isExpanded}
        isPlaying={isPlaying}
        onClose={() => onExpandedChange(false)}
        onLikeToggle={() => void handleLikeToggle()}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
        onPrevious={() => changeTrack('prev')}
        onSeek={onSeek}
        onVolumeChange={setVolume}
        playlistTitle={currentPlaylistName || 'Playlist'}
        title={currentTrack.title || 'Unknown'}
        volume={volume}
      />

      <MiniPlayer
        artist={artistName}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isLiked={isCurrentTrackLiked}
        isPlaying={isPlaying}
        isVisible={isVisible && !isExpanded}
        onExpand={() => onExpandedChange(true)}
        onLikeToggle={() => void handleLikeToggle()}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
        title={currentTrack.title || 'Unknown'}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 h-22.5 bg-background border-t border-border px-4 hidden xl:flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-[25%]">
          <TrackInfo
            artist={artistName}
            coverUrl={coverUrl}
            isLiked={isCurrentTrackLiked}
            onLikeToggle={() => void handleLikeToggle()}
            onPictureInPicture={openFloatingPlayer}
            title={currentTrack.title || 'Unknown'}
          />
        </div>

        <div className="w-[40%] flex justify-center">
          <PlayerControls
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            isShuffled={isShuffled}
            onNext={() => changeTrack('next')}
            onPlayPause={togglePlayPause}
            onPrevious={() => changeTrack('prev')}
            onSeek={onSeek}
            onShuffleToggle={handleShuffleToggle}
          />
        </div>

        <div className="w-[35%] flex justify-end">
          <PlayerActions
            onExpand={() => onExpandedChange(true)}
            onVolumeChange={setVolume}
            volume={volume}
          />
        </div>
      </div>
    </>
  )
}
