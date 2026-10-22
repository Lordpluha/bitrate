'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { SlotIndex } from '@/entities/Player/model/audioPlayer/audioPlayer.types'
import {
  getPlaybackKey,
  removePlaybackPosition,
  savePlaybackPosition,
  shouldDelayInitialPlayback,
  shouldPrefetchNextTrack,
} from '@/entities/Player/model/audioPlayer/audioPlayer.utils'
import type { useAudioSlots } from '@/entities/Player/model/audioPlayer/useAudioSlots'
import {
  type PlaybackTransition,
  usePlayerStore,
} from '@/entities/Player/model/playerStore'

type UseAudioPlayerEventsOptions = {
  /** `getPlaybackKey` of the current track; null when nothing is loaded. */
  currentPlaybackKey: string | null
  currentPlaylistId: string | null
  isPlaying: boolean
  nextTransition: PlaybackTransition | null
  slots: ReturnType<typeof useAudioSlots>
}

/** `timeupdate` fires ~4×/s; the resume position only needs about one write a second. */
const POSITION_SAVE_INTERVAL_MS = 1000

export const useAudioPlayerEvents = ({
  currentPlaybackKey,
  currentPlaylistId,
  isPlaying,
  nextTransition,
  slots,
}: UseAudioPlayerEventsOptions) => {
  const pause = usePlayerStore((state) => state.pause)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime)
  const setDuration = usePlayerStore((state) => state.setDuration)
  const setPlaybackTime = usePlayerStore((state) => state.setPlaybackTime)
  const changeTrack = usePlayerStore((state) => state.changeTrack)
  const advanceOnTrackEnd = usePlayerStore((state) => state.advanceOnTrackEnd)
  const isSeekingRef = useRef(false)
  const lastPositionSaveRef = useRef(0)
  const previousPlaybackKeyRef = useRef<string | null>(null)
  const {
    activeSlotRef,
    attachTrack,
    getActiveElement,
    pendingPlayRef,
    pendingPrefetchRef,
    slotsRef,
    switchToSlot,
  } = slots

  /** Saves where the active element is, so a reload resumes from there. */
  const saveActivePosition = useCallback(() => {
    const active = getActiveElement()
    if (!active || !currentPlaybackKey) return
    if (
      slotsRef.current[activeSlotRef.current].playbackKey !== currentPlaybackKey
    )
      return

    lastPositionSaveRef.current = Date.now()
    savePlaybackPosition(currentPlaybackKey, active.currentTime)
  }, [activeSlotRef, currentPlaybackKey, getActiveElement, slotsRef])

  /**
   * Every transition gets a fresh key (the sequence grows), so a skipped track's saved
   * position can never be restored again; drop it instead of leaving it in storage.
   */
  useEffect(() => {
    const previousKey = previousPlaybackKeyRef.current
    if (previousKey && previousKey !== currentPlaybackKey) {
      removePlaybackPosition(previousKey)
    }
    previousPlaybackKeyRef.current = currentPlaybackKey
  }, [currentPlaybackKey])

  useEffect(() => {
    window.addEventListener('pagehide', saveActivePosition)
    return () => window.removeEventListener('pagehide', saveActivePosition)
  }, [saveActivePosition])

  const togglePlayPause = useCallback(() => {
    const active = getActiveElement()
    if (!active) return

    if (isPlaying) {
      active.pause()
      return
    }

    void active.play().catch(() => setIsPlaying(false))
  }, [getActiveElement, isPlaying, setIsPlaying])

  const onSeek = useCallback(
    (time: number) => {
      const active = getActiveElement()
      if (active && Number.isFinite(time)) {
        isSeekingRef.current = true
        active.currentTime = time
        if (currentPlaybackKey) savePlaybackPosition(currentPlaybackKey, time)
      }
      setCurrentTime(time)
    },
    [currentPlaybackKey, getActiveElement, setCurrentTime],
  )

  const handleLoadedMetadata = useCallback(
    (index: SlotIndex) => {
      if (index !== activeSlotRef.current) return
      const element = slotsRef.current[index].element
      if (element) setDuration(element.duration)
    },
    [activeSlotRef, setDuration, slotsRef],
  )

  const handleTimeUpdate = useCallback(
    (index: SlotIndex) => {
      if (index !== activeSlotRef.current || isSeekingRef.current) return
      const element = slotsRef.current[index].element
      if (!element) return

      const { currentTime, duration } = element
      setPlaybackTime({ currentTime, duration })
      if (
        currentPlaybackKey &&
        Date.now() - lastPositionSaveRef.current >= POSITION_SAVE_INTERVAL_MS
      ) {
        lastPositionSaveRef.current = Date.now()
        savePlaybackPosition(currentPlaybackKey, currentTime)
      }
    },
    [activeSlotRef, currentPlaybackKey, setPlaybackTime, slotsRef],
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
      if (!currentPlaybackKey || slot.playbackKey !== currentPlaybackKey) return

      if (!nextIsPlaying) saveActivePosition()
      setIsPlaying(nextIsPlaying)
    },
    [
      activeSlotRef,
      currentPlaybackKey,
      saveActivePosition,
      setIsPlaying,
      slotsRef,
    ],
  )

  const handleEnded = useCallback(
    (index: SlotIndex) => {
      if (index !== activeSlotRef.current) return

      if (nextTransition?.kind === 'restart') {
        if (currentPlaybackKey) removePlaybackPosition(currentPlaybackKey)
        advanceOnTrackEnd()
        const active = getActiveElement()
        if (active) {
          active.currentTime = 0
          void active.play().catch(() => setIsPlaying(false))
        }
        return
      }

      if (!nextTransition) {
        pause()
        return
      }

      if (currentPlaybackKey) removePlaybackPosition(currentPlaybackKey)

      /** Commit first, then promote only the slot prepared for that transition. */
      advanceOnTrackEnd()
      if (nextTransition.kind === 'stop') return

      const standbyIndex = index === 0 ? 1 : 0
      const standby = slotsRef.current[standbyIndex]
      const nextPlaybackKey = getPlaybackKey(
        nextTransition.track.id,
        currentPlaylistId,
        nextTransition.playbackSequence,
      )
      const committed = usePlayerStore.getState()
      if (
        committed.currentTrack?.id !== nextTransition.track.id ||
        committed.playbackSequence !== nextTransition.playbackSequence
      ) {
        return
      }
      if (standby.playbackKey === nextPlaybackKey && standby.element) {
        switchToSlot(standbyIndex)
      }
    },
    [
      activeSlotRef,
      advanceOnTrackEnd,
      currentPlaybackKey,
      currentPlaylistId,
      getActiveElement,
      nextTransition,
      pause,
      setIsPlaying,
      slotsRef,
      switchToSlot,
    ],
  )

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false
  }, [])

  return {
    changeTrack,
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
