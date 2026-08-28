'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '@/entities/Player/model/playerStore'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'
import type { PlayableTrack } from '@/entities/Player/model/playableTrack.types'
import { showApiErrorToast } from '@/shared/api/feedback'
import {
  ACTIVE_BUFFER_SECONDS,
  attachCmafSource,
} from '@/entities/Player/model/audioPlayer/attachCmafSource'
import { attachHlsSource } from '@/entities/Player/model/audioPlayer/attachHlsSource'
import type {
  PendingPrefetch,
  PlayerSlot,
  SlotIndex,
} from '@/entities/Player/model/audioPlayer/audioPlayer.types'
import {
  restorePlaybackPosition,
  savePlaybackPosition,
  shouldPrefetchNextTrack,
} from '@/entities/Player/model/audioPlayer/audioPlayer.utils'

type UseAudioSlotsOptions = {
  volume: number
  /**
   * Resolves the byte-range manifest for a track, or null when the track has
   * none. A track without a manifest keeps using the HLS/progressive path.
   */
  resolveManifest?: (trackId: string) => Promise<TrackManifest | null>
}

const emptySlot = (): PlayerSlot => ({
  element: null,
  hls: null,
  loader: null,
  currentBitrate: null,
  playbackKey: null,
  trackId: null,
})

export const useAudioSlots = ({
  volume,
  resolveManifest,
}: UseAudioSlotsOptions) => {
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
    slot.loader?.destroy()
    slot.loader = null
    slot.currentBitrate = null
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
      track: PlayableTrack,
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
        if (slot.playbackKey !== playbackKey) return

        slot.hls?.destroy()
        slot.hls = null
        slot.loader?.destroy()
        slot.loader = null
        slot.currentBitrate = null
        pendingPlayRef.current = false
        element.pause()
        element.removeAttribute('src')
        element.load()

        /**
         * `isPrefetch` reflects who attached this slot, not who it is now — a
         * prefetched slot promoted to active by `switchToSlot` keeps the same
         * closure. Checking `activeSlotRef` live is what makes a failure on the
         * track the user is actually hearing surface a pause and a toast,
         * instead of failing silently because it was "just a prefetch" once.
         */
        if (activeSlotRef.current === index) {
          pause()
          showApiErrorToast(
            new Error('Unable to play this track. Please try again.'),
          )
        }
      }

      const attachLegacySource = () =>
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

      const safelyAttachLegacySource = () => {
        if (slot.playbackKey !== playbackKey) return

        try {
          attachLegacySource()
        } catch {
          stopPlayback()
        }
      }

      let didFallbackFromCmaf = false
      const fallbackFromCmaf = () => {
        if (didFallbackFromCmaf || slot.playbackKey !== playbackKey) return
        didFallbackFromCmaf = true

        savePlaybackPosition(playbackKey, element.currentTime)
        slot.loader?.destroy()
        slot.loader = null
        slot.currentBitrate = null
        if (!isPrefetch && activeSlotRef.current === index) {
          pendingPlayRef.current = true
        }
        element.addEventListener(
          'loadedmetadata',
          () => {
            if (slot.playbackKey === playbackKey) {
              restorePlaybackPosition(element, playbackKey)
            }
          },
          { once: true },
        )
        safelyAttachLegacySource()
      }

      if (resolveManifest) {
        void resolveManifest(track.id)
          .then((manifest) => {
            /** A newer track claimed this slot while the manifest was loading. */
            if (slot.playbackKey !== playbackKey) return

            const attached =
              manifest !== null &&
              attachCmafSource({
                element,
                isPrefetch,
                manifest,
                onFatalError: fallbackFromCmaf,
                playbackKey,
                slot,
                trackId: track.id,
              })

            if (!attached) safelyAttachLegacySource()
          })
          .catch(safelyAttachLegacySource)
      } else {
        safelyAttachLegacySource()
      }

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
    [destroySlot, pause, resolveManifest, volume],
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

      /**
       * A slot filled by prefetch carries a deliberately small buffer target
       * and a "prefetch" label. Now that it is the track being listened to,
       * promote both — otherwise the buffer stays shallow, the bitrate never
       * climbs, and console tracing keeps calling the active track "prefetch".
       */
      slotsRef.current[index].loader?.promoteToActive(ACTIVE_BUFFER_SECONDS)
      nextElement.volume = volume
      nextElement.currentTime = 0
      void nextElement.play().catch(() => undefined)
      previousElement?.pause()
    },
    [volume],
  )

  const prefetchTrackWhenBuffered = useCallback(
    (index: SlotIndex, track: PlayableTrack, playbackKey: string) => {
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
