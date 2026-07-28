'use client'

import { useEffect } from 'react'
import {
  selectCurrentPlaylistId,
  selectCurrentTrack,
  selectCurrentTrackIndex,
  selectIsPlaying,
  selectPlaylist,
  selectVolume,
  usePlayerStore,
} from '@/entities/Player'
import {
  getNextTrack,
  getPlaybackKey,
  shouldDelayInitialPlayback,
} from '@/shared/hooks/audioPlayer/audioPlayer.utils'
import { useAudioPlayerEvents } from '@/shared/hooks/audioPlayer/useAudioPlayerEvents'
import { useAudioSlots } from '@/shared/hooks/audioPlayer/useAudioSlots'

export const useAudioPlayer = () => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const currentTrackIndex = usePlayerStore(selectCurrentTrackIndex)
  const currentPlaylistId = usePlayerStore(selectCurrentPlaylistId)
  const playlist = usePlayerStore(selectPlaylist)
  const isPlaying = usePlayerStore(selectIsPlaying)
  const volume = usePlayerStore(selectVolume)
  const nextTrack = getNextTrack(currentTrack, currentTrackIndex, playlist)
  const slots = useAudioSlots({ volume })
  const {
    activeSlot,
    activeSlotRef,
    attachTrack,
    bindAudioElement,
    destroySlot,
    getActiveElement,
    pendingPlayRef,
    pendingPrefetchRef,
    prefetchTrackWhenBuffered,
    slotsRef,
    switchToSlot,
  } = slots

  useEffect(() => {
    if (!currentTrack) {
      pendingPlayRef.current = false
      pendingPrefetchRef.current = null
      destroySlot(0)
      destroySlot(1)
      return
    }

    pendingPrefetchRef.current = null
    const activeIndex = activeSlotRef.current
    const standbyIndex = activeIndex === 0 ? 1 : 0
    const active = slotsRef.current[activeIndex]
    const standby = slotsRef.current[standbyIndex]
    const currentPlaybackKey = getPlaybackKey(
      currentTrack.id,
      currentPlaylistId,
    )

    if (standby.playbackKey === currentPlaybackKey) {
      switchToSlot(standbyIndex)
      if (nextTrack && nextTrack.id !== currentTrack.id) {
        prefetchTrackWhenBuffered(
          activeIndex,
          nextTrack,
          getPlaybackKey(nextTrack.id, currentPlaylistId),
        )
      } else {
        destroySlot(activeIndex)
      }
      return
    }

    if (active.playbackKey !== currentPlaybackKey) {
      attachTrack(activeIndex, currentTrack, currentPlaybackKey, false)
    }
    if (nextTrack && nextTrack.id !== currentTrack.id) {
      prefetchTrackWhenBuffered(
        standbyIndex,
        nextTrack,
        getPlaybackKey(nextTrack.id, currentPlaylistId),
      )
    } else {
      destroySlot(standbyIndex)
    }
  }, [
    activeSlotRef,
    attachTrack,
    currentPlaylistId,
    currentTrack,
    destroySlot,
    nextTrack,
    pendingPlayRef,
    pendingPrefetchRef,
    prefetchTrackWhenBuffered,
    slotsRef,
    switchToSlot,
  ])

  useEffect(() => {
    const active = getActiveElement()
    if (!active || !currentTrack) return
    const currentPlaybackKey = getPlaybackKey(
      currentTrack.id,
      currentPlaylistId,
    )
    if (slotsRef.current[activeSlot].playbackKey !== currentPlaybackKey) return

    if (isPlaying) {
      if (shouldDelayInitialPlayback(active)) {
        pendingPlayRef.current = true
        return
      }
      pendingPlayRef.current = false
      void active.play().catch(() => undefined)
    } else {
      pendingPlayRef.current = false
      active.pause()
    }
  }, [
    activeSlot,
    currentPlaylistId,
    currentTrack,
    getActiveElement,
    isPlaying,
    pendingPlayRef,
    slotsRef,
  ])

  const events = useAudioPlayerEvents({
    currentPlaylistId,
    currentTrack,
    isPlaying,
    nextTrack,
    slots,
  })

  return {
    activeSlot,
    bindAudioElement,
    ...events,
  }
}
