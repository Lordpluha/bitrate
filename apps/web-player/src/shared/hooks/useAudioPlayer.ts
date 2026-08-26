'use client'

import { useEffect, useMemo } from 'react'
import {
  type PlaybackTransition,
  resolvePlaybackTransition,
  selectCurrentPlaylistId,
  selectCurrentQueueId,
  selectCurrentTrack,
  selectCurrentTrackIndex,
  selectIsPlaying,
  selectPlaybackSequence,
  selectPlaylist,
  selectQueue,
  selectRepeatMode,
  selectVolume,
  usePlayerStore,
} from '@/entities/Player'
import {
  getPlaybackKey,
  shouldDelayInitialPlayback,
} from '@/shared/hooks/audioPlayer/audioPlayer.utils'
import { useAudioPlayerEvents } from '@/shared/hooks/audioPlayer/useAudioPlayerEvents'
import { useAudioSlots } from '@/shared/hooks/audioPlayer/useAudioSlots'
import { useManifestResolver } from '@/shared/hooks/audioPlayer/useManifestResolver'

export const useAudioPlayer = () => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const currentTrackIndex = usePlayerStore(selectCurrentTrackIndex)
  const currentPlaylistId = usePlayerStore(selectCurrentPlaylistId)
  const currentQueueId = usePlayerStore(selectCurrentQueueId)
  const playlist = usePlayerStore(selectPlaylist)
  const queue = usePlayerStore(selectQueue)
  const repeatMode = usePlayerStore(selectRepeatMode)
  const playbackSequence = usePlayerStore(selectPlaybackSequence)
  const isPlaying = usePlayerStore(selectIsPlaying)
  const volume = usePlayerStore(selectVolume)
  const nextTransition = useMemo<PlaybackTransition | null>(
    () =>
      resolvePlaybackTransition(
        {
          currentTrack,
          currentTrackIndex,
          currentQueueId,
          playbackSequence,
          playlist,
          queue,
          repeatMode,
        },
        'next',
        'ended',
      ),
    [
      currentTrack,
      currentTrackIndex,
      currentQueueId,
      playbackSequence,
      playlist,
      queue,
      repeatMode,
    ],
  )
  const nextTrack =
    nextTransition?.kind === 'track' ? nextTransition.track : null
  const nextPlaybackKey =
    nextTransition?.kind === 'track'
      ? getPlaybackKey(
          nextTransition.track.id,
          currentPlaylistId,
          nextTransition.playbackSequence,
        )
      : null
  const resolveManifest = useManifestResolver()
  const slots = useAudioSlots({ resolveManifest, volume })
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
      playbackSequence,
    )

    if (standby.playbackKey === currentPlaybackKey) {
      switchToSlot(standbyIndex)
      if (
        nextTrack &&
        nextPlaybackKey &&
        nextPlaybackKey !== currentPlaybackKey
      ) {
        prefetchTrackWhenBuffered(activeIndex, nextTrack, nextPlaybackKey)
      } else {
        destroySlot(activeIndex)
      }
      return
    }

    if (active.playbackKey !== currentPlaybackKey) {
      attachTrack(activeIndex, currentTrack, currentPlaybackKey, false)
    }
    if (
      nextTrack &&
      nextPlaybackKey &&
      nextPlaybackKey !== currentPlaybackKey
    ) {
      prefetchTrackWhenBuffered(standbyIndex, nextTrack, nextPlaybackKey)
    } else {
      destroySlot(standbyIndex)
    }
  }, [
    activeSlotRef,
    attachTrack,
    currentPlaylistId,
    currentTrack,
    destroySlot,
    nextPlaybackKey,
    nextTrack,
    playbackSequence,
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
      playbackSequence,
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
    playbackSequence,
    pendingPlayRef,
    slotsRef,
  ])

  const events = useAudioPlayerEvents({
    currentPlaylistId,
    currentTrack,
    isPlaying,
    nextTransition,
    playbackSequence,
    slots,
  })

  return {
    activeSlot,
    bindAudioElement,
    ...events,
  }
}
