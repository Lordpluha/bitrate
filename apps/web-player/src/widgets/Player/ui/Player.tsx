'use client'

import { useState, useEffect } from 'react'
import { TrackInfo } from './TrackInfo'
import { PlayerControls } from './PlayerControls'
import { PlayerActions } from './PlayerActions'
import { NowPlayingView } from './NowPlayingView'
import { useAudioPlayer, useAppSelector, useAppDispatch } from '@shared/hooks'
import {
  selectMusicPlayer,
  selectCurrentPlaylistName,
} from '@entities/Player/store/PlayerSlice'

import { useArtist } from '@shared/hooks/useArtist'
import { MiniPlayer } from './MiniPlayer'

export const Player: React.FC = () => {
  const { currentTrack, isPlaying, volume, currentTime, duration } =
    useAppSelector(selectMusicPlayer)
  const currentPlaylistName = useAppSelector(selectCurrentPlaylistName)
  const dispatch = useAppDispatch()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const artistName = artist?.username || 'Unknown Artist'

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

  if (!currentTrack) {
    return null
  }

  const coverUrl = currentTrack.cover?.startsWith('http')
    ? currentTrack.cover
    : currentTrack.cover
      ? `${process.env.NEXT_PUBLIC_API_URL}${currentTrack.cover}`
      : '/images/drive-cover-big.jpg'

  return (
    <>
      {/* biome-ignore lint/a11y/useMediaCaption: audio-only playback has no caption track */}
      <audio
        autoPlay={isPlaying}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleProgress}
<<<<<<< HEAD
      >
        <track kind="captions" />
      </audio>

      <NowPlayingView
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        title={currentTrack.title || 'Unknown'}
        artist={artistName}
        coverUrl={coverUrl}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlayPause={togglePlayPause}
        onSeek={onSeek}
        onNext={() => changeTrack('next')}
        onPrevious={() => changeTrack('prev')}
        volume={volume}
        onVolumeChange={(vol) => dispatch(setVolume(vol))}
        playlistTitle={currentPlaylistName || 'Playlist'}
=======
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
        preload="none"
        ref={audioRef}
>>>>>>> develop
      />

      {/* Мини-плеер — только на <=1024 */}
      <MiniPlayer
        title={currentTrack.title || 'Unknown'}
        artist={artistName}
        coverUrl={coverUrl}
        isPlaying={isPlaying}
        isVisible={isVisible}
        onPlayPause={togglePlayPause}
        onExpand={() => setIsExpanded(true)}
      />

      {/* Полный плеер — только на >=1025 */}
      <div
<<<<<<< HEAD
        className={`fixed bottom-0 left-0 right-0 h-22.5 bg-background border-t border-border px-4 hidden [@media(min-width:1025px)]:flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
=======
        className={`fixed bottom-0 left-0 right-0 h-22.5 bg-black border-t border-gray-800 px-4 flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
>>>>>>> develop
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-[25%]">
          <TrackInfo
            artist={artistName}
            coverUrl={coverUrl}
            isLiked={false}
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
            onVolumeChange={(vol) => dispatch(setVolume(vol))}
<<<<<<< HEAD
            onExpand={() => setIsExpanded(true)}
=======
            volume={volume}
>>>>>>> develop
          />
        </div>
      </div>
    </>
  )
}
