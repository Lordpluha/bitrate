'use client'

import { useRef, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from './index'
import { togglePlay, setCurrentTime, setProgress, setDuration, changeTrack, pause } from '@entities/Player'

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const isSeekingRef = useRef(false)
  const dispatch = useAppDispatch()
  const { isPlaying, volume } = useAppSelector((state) => state.musicPlayer)

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
    if (audioRef.current) {
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
  }
}
