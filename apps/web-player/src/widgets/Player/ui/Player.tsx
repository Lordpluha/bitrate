'use client'

import {
  selectCurrentPlaylistName,
  selectMusicPlayer,
  setVolume,
} from '@entities/Player/store/PlayerSlice'
import { useAppDispatch, useAppSelector, useAudioPlayer } from '@shared/hooks'
import { useArtist } from '@shared/hooks/useArtist'
import { useLikedTracks } from '@shared/hooks/useLikedTracks'
import { getStaticMediaUrl } from '@shared/utils/mediaUrl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FloatingPlayerWindow } from './FloatingPlayerWindow'
import { MiniPlayer } from './MiniPlayer'
import { NowPlayingView } from './NowPlayingView'
import { PlayerActions } from './PlayerActions'
import { PlayerControls } from './PlayerControls'
import { TrackInfo } from './TrackInfo'

export const Player: React.FC = () => {
  const { currentTrack, isPlaying, volume, currentTime, duration } =
    useAppSelector(selectMusicPlayer)
  const currentPlaylistName = useAppSelector(selectCurrentPlaylistName)
  const dispatch = useAppDispatch()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [floatingWindow, setFloatingWindow] = useState<Window | null>(null)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const { data: likedTracks } = useLikedTracks()
  const artistName = artist?.username || 'Unknown Artist'
  const likedTrackIds = useMemo(
    () => new Set(likedTracks?.map((track) => track.id) ?? []),
    [likedTracks],
  )
  const isCurrentTrackLiked = currentTrack
    ? likedTrackIds.has(currentTrack.id)
    : false

  const {
    audioRef,
    togglePlayPause,
    onSeek,
    changeTrack,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    handleVolumeChange,
    handleSeeked,
    handleProgress,
  } = useAudioPlayer()

  useEffect(() => {
    if (currentTrack) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
      setIsExpanded(false)
    }
  }, [currentTrack])

  useEffect(() => {
    handleVolumeChange()
  }, [handleVolumeChange])

  const coverUrl = getStaticMediaUrl(
    currentTrack?.cover,
    'tracks/covers',
    '/images/drive-cover-big.jpg',
  )

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
    nextWindow.document.body.style.margin = '0'
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
      <audio
        autoPlay={isPlaying}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
        preload="none"
        ref={audioRef}
      >
        <track kind="captions" />
      </audio>

      <FloatingPlayerWindow
        artist={artistName}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onClose={closeFloatingPlayer}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
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
        onClose={() => setIsExpanded(false)}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
        onPrevious={() => changeTrack('prev')}
        onSeek={onSeek}
        onVolumeChange={(vol) => dispatch(setVolume(vol))}
        playlistTitle={currentPlaylistName || 'Playlist'}
        title={currentTrack.title || 'Unknown'}
        volume={volume}
      />

      {/* Мини-плеер — только на <=1024 */}
      <MiniPlayer
        artist={artistName}
        coverUrl={coverUrl}
        currentTime={currentTime}
        duration={duration}
        isLiked={isCurrentTrackLiked}
        isPlaying={isPlaying}
        isVisible={isVisible}
        onExpand={() => setIsExpanded(true)}
        onNext={() => changeTrack('next')}
        onPlayPause={togglePlayPause}
        title={currentTrack.title || 'Unknown'}
      />

      {/* Полный плеер — только на >=1025 */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-22.5 bg-background border-t border-border px-4 hidden [@media(min-width:1025px)]:flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-[25%]">
          <TrackInfo
            artist={artistName}
            coverUrl={coverUrl}
            isLiked={isCurrentTrackLiked}
            onPictureInPicture={openFloatingPlayer}
            title={currentTrack.title || 'Unknown'}
          />
        </div>

        <div className="w-[40%] flex justify-center">
          <PlayerControls
            currentTime={currentTime}
            duration={duration}
            isPlaying={isPlaying}
            onNext={() => changeTrack('next')}
            onPlayPause={togglePlayPause}
            onPrevious={() => changeTrack('prev')}
            onSeek={onSeek}
          />
        </div>

        <div className="w-[35%] flex justify-end">
          <PlayerActions
            onExpand={() => setIsExpanded(true)}
            onVolumeChange={(vol) => dispatch(setVolume(vol))}
            volume={volume}
          />
        </div>
      </div>
    </>
  )
}
