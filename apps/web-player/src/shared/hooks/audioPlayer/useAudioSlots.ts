'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '@/entities/Player'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'
import { showApiErrorToast } from '@/shared/api/feedback'
import { attachHlsSource } from '@/shared/hooks/audioPlayer/attachHlsSource'
import type {
  PendingPrefetch,
  PlayerSlot,
  SlotIndex,
} from '@/shared/hooks/audioPlayer/audioPlayer.types'
import {
  restorePlaybackPosition,
  shouldPrefetchNextTrack,
} from '@/shared/hooks/audioPlayer/audioPlayer.utils'

type UseAudioSlotsOptions = {
  volume: number
}

const emptySlot = (): PlayerSlot => ({
  element: null,
  hls: null,
  playbackKey: null,
  trackId: null,
})

export const useAudioSlots = ({ volume }: UseAudioSlotsOptions) => {
  const pause = usePlayerStore((state) => state.pause)
  const slotsRef = useRef<[PlayerSlot, PlayerSlot]>([emptySlot(), emptySlot()])
  const activeSlotRef = useRef<SlotIndex>(0)
  const pendingPlayRef = useRef(false)
  const pendingPrefetchRef = useRef<PendingPrefetch | null>(null)
  const recoveryAttemptsRef = useRef<Record<string, number>>({})
  const [activeSlot, setActiveSlot] = useState<SlotIndex>(0)

  const getActiveElement = useCallback(
    () => slotsRef.current[activeSlotRef.current].element,
    [],
  )

  const destroySlot = useCallback((index: SlotIndex) => {
    const slot = slotsRef.current[index]
    slot.hls?.destroy()
    slot.hls = null
    slot.playbackKey = null
    slot.trackId = null

    if (slot.element) {
      slot.element.pause()
      slot.element.removeAttribute('src')
      slot.element.load()
    }
  }, [])

  const attachTrack = useCallback(
    (
      index: SlotIndex,
      track: TrackEntity,
      playbackKey: string,
      isPrefetch: boolean,
    ) => {
      const slot = slotsRef.current[index]
      const element = slot.element
      if (!element || slot.playbackKey === playbackKey) return

      destroySlot(index)
      slot.playbackKey = playbackKey
      slot.trackId = track.id
      element.preload = 'auto'
      element.crossOrigin = 'use-credentials'
      element.volume = volume

      const stopPlayback = () => {
        slot.hls?.destroy()
        slot.hls = null
        pendingPlayRef.current = false
        element.pause()
        element.removeAttribute('src')
        element.load()

        if (!isPrefetch) {
          pause()
          showApiErrorToast(
            new Error('Unable to play this track. Please try again.'),
          )
        }
      }

      attachHlsSource({
        element,
        isPrefetch,
        onFatalError: stopPlayback,
        playbackKey,
        progressiveUrl: track.audioUrl,
        recoveryAttempts: recoveryAttemptsRef.current,
        slot,
        trackId: track.id,
      })

      if (!isPrefetch) {
        element.addEventListener(
          'loadedmetadata',
          () => {
            if (slot.playbackKey === playbackKey) {
              restorePlaybackPosition(element, playbackKey)
            }
          },
          { once: true },
        )
      }
    },
    [destroySlot, pause, volume],
  )

  const bindAudioElement = useCallback(
    (index: SlotIndex, element: HTMLAudioElement | null) => {
      slotsRef.current[index].element = element
    },
    [],
  )

  const switchToSlot = useCallback(
    (index: SlotIndex) => {
      const previousIndex = activeSlotRef.current
      if (previousIndex === index) return

      const previousElement = slotsRef.current[previousIndex].element
      const nextElement = slotsRef.current[index].element
      if (!nextElement) return

      activeSlotRef.current = index
      setActiveSlot(index)
      nextElement.volume = volume
      nextElement.currentTime = 0
      void nextElement.play().catch(() => undefined)
      previousElement?.pause()
    },
    [volume],
  )

  const prefetchTrackWhenBuffered = useCallback(
    (index: SlotIndex, track: TrackEntity, playbackKey: string) => {
      const standby = slotsRef.current[index]
      if (standby.playbackKey === playbackKey) {
        pendingPrefetchRef.current = null
        return
      }

      const activeElement = getActiveElement()
      if (!activeElement) {
        pendingPrefetchRef.current = { playbackKey, slot: index, track }
        return
      }

      if (shouldPrefetchNextTrack(activeElement)) {
        pendingPrefetchRef.current = null
        attachTrack(index, track, playbackKey, true)
        return
      }

      pendingPrefetchRef.current = { playbackKey, slot: index, track }
    },
    [attachTrack, getActiveElement],
  )

  useEffect(() => {
    for (const slot of slotsRef.current) {
      if (slot.element) slot.element.volume = volume
    }
  }, [volume])

  useEffect(
    () => () => {
      destroySlot(0)
      destroySlot(1)
    },
    [destroySlot],
  )

  return {
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
  }
}
