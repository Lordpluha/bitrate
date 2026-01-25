'use client'

import { useRef, useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './index'
import { 
  togglePlay, 
  setCurrentTime, 
  setProgress, 
  setDuration, 
  changeTrack, 
  pause,
  selectIsPlaying,
  selectVolume,
  selectCurrentTrack
} from '@entities/Player'

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const isSeekingRef = useRef(false)
  const dispatch = useAppDispatch()
  const isPlaying = useAppSelector(selectIsPlaying)
  const volume = useAppSelector(selectVolume)
  const currentTrack = useAppSelector(selectCurrentTrack)

  // Get track URL
  const trackUrl = currentTrack?.audioUrl 
    ? (currentTrack.audioUrl.startsWith('http') 
        ? currentTrack.audioUrl 
        : `${process.env.NEXT_PUBLIC_API_URL}api/v1/tracks/stream/${currentTrack.id}`)
    : null

  // Progressive streaming setup
  const setupProgressiveStreaming = useCallback(async (trackUrl: string) => {
    if (!audioRef.current) return

    try {
      console.log('Setting up progressive streaming for:', trackUrl)

      // Simple approach: preload=none forces browser to use Range requests
      audioRef.current.preload = 'none'
      audioRef.current.src = trackUrl
      audioRef.current.load()
      
      console.log('Progressive streaming enabled')
    } catch (error) {
      console.error('Error setting up progressive streaming:', error)
    }
  }, [])

  // Update audio source when track changes
  useEffect(() => {
    if (trackUrl && audioRef.current) {
      setupProgressiveStreaming(trackUrl)
    }
  }, [trackUrl, setupProgressiveStreaming])

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      dispatch(togglePlay())
    }
  }, [isPlaying, dispatch])

  const onSeek = useCallback((time: number) => {
    if (audioRef.current && !isNaN(time) && isFinite(time)) {
      isSeekingRef.current = true
      audioRef.current.currentTime = time
    }
    dispatch(setCurrentTime(time))
  }, [dispatch])

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false
  }, [])

  const changeTrackHandler = useCallback((direction: 'next' | 'prev') => {
    dispatch(changeTrack(direction))
  }, [dispatch])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      dispatch(setDuration(audioRef.current.duration))
    }
  }, [dispatch])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && !isSeekingRef.current) {
      const currentTime = audioRef.current.currentTime
      const duration = audioRef.current.duration
      dispatch(setCurrentTime(currentTime))
      dispatch(setProgress((currentTime / duration) * 100))
    }
  }, [dispatch])

  const handleEnded = useCallback(() => {
    dispatch(pause())
    dispatch(changeTrack('next'))
  }, [dispatch])

  const handleVolumeChange = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleProgress = useCallback(() => {
    if (audioRef.current) {
      const buffered = audioRef.current.buffered
      if (buffered.length > 0) {
        const bufferedEnd = buffered.end(buffered.length - 1)
        const duration = audioRef.current.duration
        const bufferedPercent = (bufferedEnd / duration) * 100
        console.log(`Buffered: ${bufferedEnd.toFixed(2)}s / ${duration.toFixed(2)}s (${bufferedPercent.toFixed(1)}%)`)
      }
    }
  }, [])

  return {
    audioRef,
    togglePlayPause,
    onSeek,
    changeTrack: changeTrackHandler,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleEnded,
    handleVolumeChange,
    handleSeeked,
    handleProgress,
  }
}
