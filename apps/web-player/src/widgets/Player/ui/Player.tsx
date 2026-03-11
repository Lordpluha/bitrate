'use client'

import { useState, useEffect } from 'react'
import { TrackInfo } from './TrackInfo'
import { PlayerControls } from './PlayerControls'
import { PlayerActions } from './PlayerActions'
import { NowPlayingView } from './NowPlayingView'
import { useAudioPlayer, useAppSelector, useAppDispatch, useMediaQuery } from '@shared/hooks'
import {
  setVolume,
  selectMusicPlayer,
} from '@entities/Player/store/PlayerSlice'
import { useArtist } from '@shared/hooks/useArtist'
import { MiniPlayer } from './MiniPlayer'

export const Player: React.FC = () => {
  const { currentTrack, isPlaying, volume, currentTime, duration } =
    useAppSelector(selectMusicPlayer)
  const dispatch = useAppDispatch()
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const artistName = artist?.username || 'Unknown Artist'
  const isDesktop = useMediaQuery('(min-width: 1280px)')

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
      <audio
        ref={audioRef}
        preload="none"
        autoPlay={isPlaying}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onSeeked={handleSeeked}
        onProgress={handleProgress}
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
      />

      {/* Мини-плеер — только на < xl */}
      <MiniPlayer
        title={currentTrack.title || 'Unknown'}
        artist={artistName}
        coverUrl={coverUrl}
        isPlaying={isPlaying}
        isVisible={isVisible && !isDesktop}
        onPlayPause={togglePlayPause}
        onExpand={() => setIsExpanded(true)}
      />

      {/* Полный плеер — только на xl+ */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-22.5 bg-background border-t border-border px-4 hidden xl:flex items-center justify-between gap-4 z-50 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-[25%]">
          <TrackInfo
            title={currentTrack.title || 'Unknown'}
            artist={artistName}
            coverUrl={coverUrl}
            isLiked={false}
          />
        </div>

        <div className="w-[40%] flex justify-center">
          <PlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={togglePlayPause}
            onSeek={onSeek}
            onNext={() => changeTrack('next')}
            onPrevious={() => changeTrack('prev')}
          />
        </div>

        <div className="w-[35%] flex justify-end">
          <PlayerActions
            volume={volume}
            onVolumeChange={(vol) => dispatch(setVolume(vol))}
            onExpand={() => setIsExpanded(true)}
          />
        </div>
      </div>
    </>
  )
}
