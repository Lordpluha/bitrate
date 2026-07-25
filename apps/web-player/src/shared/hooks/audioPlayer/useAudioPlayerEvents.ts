'use client'

import { useCallback, useRef } from 'react'
import {
  changeTrack,
  pause,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  setProgress,
} from '@/entities/Player'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'
import type { SlotIndex } from '@/shared/hooks/audioPlayer/audioPlayer.types'
import {
  getPlaybackKey,
  removePlaybackPosition,
  savePlaybackPosition,
  shouldDelayInitialPlayback,
  shouldPrefetchNextTrack,
} from '@/shared/hooks/audioPlayer/audioPlayer.utils'
import type { useAudioSlots } from '@/shared/hooks/audioPlayer/useAudioSlots'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'

type UseAudioPlayerEventsOptions = {
  currentPlaylistId: string | null
  currentTrack: TrackEntity | null
  isPlaying: boolean
  nextTrack: TrackEntity | null
  slots: ReturnType<typeof useAudioSlots>
}

export const useAudioPlayerEvents = ({
  currentPlaylistId,
  currentTrack,
  isPlaying,
  nextTrack,
  slots,
}: UseAudioPlayerEventsOptions) => {
  const dispatch = useAppDispatch()
  const isSeekingRef = useRef(false)
  const {
    activeSlotRef,
    attachTrack,
    getActiveElement,
    pendingPlayRef,
    pendingPrefetchRef,
    slotsRef,
    switchToSlot,
  } = slots

  const togglePlayPause = useCallback(() => {
    const active = getActiveElement()
    if (!active) return

    if (isPlaying) {
      active.pause()
      return
    }

    void active.play().catch(() => dispatch(setIsPlaying(false)))
  }, [dispatch, getActiveElement, isPlaying])

  const onSeek = useCallback(
    (time: number) => {
      const active = getActiveElement()
      if (active && Number.isFinite(time)) {
        isSeekingRef.current = true
        active.currentTime = time
        if (currentTrack) {
          savePlaybackPosition(
            getPlaybackKey(currentTrack.id, currentPlaylistId),
            time,
          )
        }
      }
      dispatch(setCurrentTime(time))
    },
    [currentPlaylistId, currentTrack, dispatch, getActiveElement],
  )

  const changeTrackHandler = useCallback(
    (direction: 'next' | 'prev') => {
      dispatch(changeTrack(direction))
    },
    [dispatch],
  )

  const handleLoadedMetadata = useCallback(
    (index: SlotIndex) => {
      if (index !== activeSlotRef.current) return
      const element = slotsRef.current[index].element
      if (element) dispatch(setDuration(element.duration))
    },
    [activeSlotRef, dispatch, slotsRef],
  )

  const handleTimeUpdate = useCallback(
    (index: SlotIndex) => {
      if (index !== activeSlotRef.current || isSeekingRef.current) return
      const element = slotsRef.current[index].element
      if (!element) return

      const currentTime = element.currentTime
      const duration = element.duration
      dispatch(setCurrentTime(currentTime))
      if (Number.isFinite(duration) && duration > 0) {
        dispatch(setProgress((currentTime / duration) * 100))
      }
      if (currentTrack) {
        savePlaybackPosition(
          getPlaybackKey(currentTrack.id, currentPlaylistId),
          currentTime,
        )
      }
    },
    [activeSlotRef, currentPlaylistId, currentTrack, dispatch, slotsRef],
  )

  const handleProgress = useCallback(
    (index: SlotIndex) => {
      if (index !== activeSlotRef.current) return

      const pending = pendingPrefetchRef.current
      const element = slotsRef.current[index].element
      if (!element) return

      if (
        isPlaying &&
        pendingPlayRef.current &&
        !shouldDelayInitialPlayback(element)
      ) {
        pendingPlayRef.current = false
        void element.play().catch(() => undefined)
      } else if (isPlaying && element.paused && !pendingPlayRef.current) {
        void element.play().catch(() => undefined)
      }

      if (!pending) return

      if (shouldPrefetchNextTrack(element)) {
        pendingPrefetchRef.current = null
        attachTrack(pending.slot, pending.track, pending.playbackKey, true)
      }
    },
    [
      activeSlotRef,
      attachTrack,
      isPlaying,
      pendingPlayRef,
      pendingPrefetchRef,
      slotsRef,
    ],
  )

  const handleCanPlay = useCallback(
    (index: SlotIndex) => {
      if (index !== activeSlotRef.current) return

      const element = slotsRef.current[index].element
      if (!element || !isPlaying || !pendingPlayRef.current) return
      if (shouldDelayInitialPlayback(element)) return

      pendingPlayRef.current = false
      void element.play().catch(() => undefined)
    },
    [activeSlotRef, isPlaying, pendingPlayRef, slotsRef],
  )

  const handlePlaybackStateChange = useCallback(
    (index: SlotIndex, nextIsPlaying: boolean) => {
      if (index !== activeSlotRef.current) return

      const slot = slotsRef.current[index]
      const currentPlaybackKey = currentTrack
        ? getPlaybackKey(currentTrack.id, currentPlaylistId)
        : null
      if (!currentTrack || slot.playbackKey !== currentPlaybackKey) return

      dispatch(setIsPlaying(nextIsPlaying))
    },
    [activeSlotRef, currentPlaylistId, currentTrack, dispatch, slotsRef],
  )

  const handleEnded = useCallback(
    (index: SlotIndex) => {
      if (index !== activeSlotRef.current) return
      if (!nextTrack) {
        dispatch(pause())
        return
      }

      const standbyIndex = index === 0 ? 1 : 0
      const standby = slotsRef.current[standbyIndex]
      if (
        standby.playbackKey ===
          getPlaybackKey(nextTrack.id, currentPlaylistId) &&
        standby.element
      ) {
        switchToSlot(standbyIndex)
      }
      if (currentTrack) {
        removePlaybackPosition(
          getPlaybackKey(currentTrack.id, currentPlaylistId),
        )
      }
      dispatch(changeTrack('next'))
    },
    [
      activeSlotRef,
      currentPlaylistId,
      currentTrack,
      dispatch,
      nextTrack,
      slotsRef,
      switchToSlot,
    ],
  )

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false
  }, [])

  return {
    changeTrack: changeTrackHandler,
    handleCanPlay,
    handleEnded,
    handleLoadedMetadata,
    handlePlaybackStateChange,
    handleProgress,
    handleSeeked,
    handleTimeUpdate,
    onSeek,
    togglePlayPause,
  }
}
