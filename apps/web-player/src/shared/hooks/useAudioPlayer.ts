'use client'

import {
  changeTrack,
  pause,
  selectCurrentTrack,
  selectIsPlaying,
  selectPlaylist,
  selectVolume,
  setCurrentTime,
  setDuration,
  setProgress,
  togglePlay,
} from '@entities/Player'
import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'
import Hls from 'hls.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from './index'

const ACTIVE_BUFFER_SECONDS = 10
const PREFETCH_BUFFER_SECONDS = 10
const PREFETCH_AFTER_BUFFER_SECONDS = 8
const PREFETCH_REMAINING_SECONDS = 45
const SLOW_NETWORK_START_BUFFER_SECONDS = 3
const SLOW_NETWORK_PREFETCH_BUFFER_SECONDS = 8
const SLOW_NETWORK_PREFETCH_REMAINING_SECONDS = 30
const POSITION_STORAGE_PREFIX = 'spotify-player-position:'

type PlayerSlot = {
  element: HTMLAudioElement | null
  hls: Hls | null
  trackId: string | null
}

type NetworkConnection = {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  saveData?: boolean
}

const getNetworkConnection = () => {
  if (typeof navigator === 'undefined') return null
  return (
    (navigator as Navigator & { connection?: NetworkConnection }).connection ??
    null
  )
}

const isSlowNetwork = () => {
  const connection = getNetworkConnection()
  return (
    connection?.saveData === true ||
    connection?.effectiveType === 'slow-2g' ||
    connection?.effectiveType === '2g' ||
    connection?.effectiveType === '3g'
  )
}

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/'
  return apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`
}

const getHlsUrl = (trackId: string) =>
  `${getApiUrl()}api/v1/tracks/stream/${trackId}/hls/master.m3u8`

const getBufferedAhead = (element: HTMLAudioElement) => {
  const { buffered, currentTime } = element

  for (let index = 0; index < buffered.length; index += 1) {
    if (buffered.start(index) <= currentTime && buffered.end(index) >= currentTime) {
      return buffered.end(index) - currentTime
    }
  }

  return 0
}

const shouldDelayInitialPlayback = (element: HTMLAudioElement) =>
  isSlowNetwork() &&
  element.currentTime < 1 &&
  getBufferedAhead(element) < SLOW_NETWORK_START_BUFFER_SECONDS

const shouldPrefetchNextTrack = (element: HTMLAudioElement) => {
  const bufferedAhead = getBufferedAhead(element)
  const duration = element.duration
  const remaining = duration - element.currentTime

  if (!Number.isFinite(duration)) return false

  if (!isSlowNetwork()) {
    return (
      remaining <= PREFETCH_REMAINING_SECONDS &&
      (bufferedAhead >= PREFETCH_AFTER_BUFFER_SECONDS || element.paused)
    )
  }

  return (
    remaining <= SLOW_NETWORK_PREFETCH_REMAINING_SECONDS &&
    bufferedAhead >= SLOW_NETWORK_PREFETCH_BUFFER_SECONDS
  )
}

const getNextTrack = (
  currentTrack: TrackEntity | null,
  playlist: TrackEntity[],
) => {
  if (!currentTrack || playlist.length < 2) return null
  const currentIndex = playlist.findIndex(
    (track) => track.id === currentTrack.id,
  )
  if (currentIndex === -1) return null
  return playlist[(currentIndex + 1) % playlist.length] ?? null
}

export const useAudioPlayer = () => {
  const dispatch = useAppDispatch()
  const currentTrack = useAppSelector(selectCurrentTrack)
  const playlist = useAppSelector(selectPlaylist)
  const isPlaying = useAppSelector(selectIsPlaying)
  const volume = useAppSelector(selectVolume)
  const nextTrack = getNextTrack(currentTrack, playlist)

  const slotsRef = useRef<[PlayerSlot, PlayerSlot]>([
    { element: null, hls: null, trackId: null },
    { element: null, hls: null, trackId: null },
  ])
  const activeSlotRef = useRef<0 | 1>(0)
  const isSeekingRef = useRef(false)
  const pendingPlayRef = useRef(false)
  const pendingPrefetchRef = useRef<{ slot: 0 | 1; track: TrackEntity } | null>(null)
  const recoveryAttemptsRef = useRef<Record<string, number>>({})
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0)

  const getActiveElement = useCallback(
    () => slotsRef.current[activeSlotRef.current].element,
    [],
  )

  const destroySlot = useCallback((index: 0 | 1) => {
    const slot = slotsRef.current[index]
    slot.hls?.destroy()
    slot.hls = null
    slot.trackId = null
    if (slot.element) {
      slot.element.pause()
      slot.element.removeAttribute('src')
      slot.element.load()
    }
  }, [])

  const restorePosition = useCallback(
    (element: HTMLAudioElement, trackId: string) => {
      const savedPosition = Number(
        sessionStorage.getItem(`${POSITION_STORAGE_PREFIX}${trackId}`),
      )
      if (
        Number.isFinite(savedPosition) &&
        savedPosition > 0 &&
        savedPosition < element.duration
      ) {
        element.currentTime = savedPosition
      }
    },
    [],
  )

  const attachTrack = useCallback(
    (index: 0 | 1, track: TrackEntity, isPrefetch: boolean) => {
      const slot = slotsRef.current[index]
      const element = slot.element
      if (!element || slot.trackId === track.id) return

      destroySlot(index)
      slot.trackId = track.id
      element.preload = 'auto'
      element.crossOrigin = 'use-credentials'
      element.volume = volume
      const url = getHlsUrl(track.id)

      const stopHlsPlayback = () => {
        slot.hls?.destroy()
        slot.hls = null
        pendingPlayRef.current = false
        element.pause()
        element.removeAttribute('src')
        element.load()

        if (!isPrefetch) {
          dispatch(pause())
        }
      }

      if (Hls.isSupported()) {
        const hls = new Hls({
          autoStartLoad: true,
          backBufferLength: ACTIVE_BUFFER_SECONDS,
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: isPrefetch
            ? PREFETCH_BUFFER_SECONDS
            : ACTIVE_BUFFER_SECONDS,
          maxMaxBufferLength: isPrefetch
            ? PREFETCH_BUFFER_SECONDS
            : ACTIVE_BUFFER_SECONDS,
          startFragPrefetch: false,
          xhrSetup: (xhr) => {
            xhr.withCredentials = true
          },
        })
        slot.hls = hls
        hls.attachMedia(element)
        hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(url))
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          recoveryAttemptsRef.current[track.id] = 0
        })
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal || slot.hls !== hls) return

          if (
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT ||
            data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR ||
            data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
            data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT
          ) {
            sessionStorage.setItem(
              `${POSITION_STORAGE_PREFIX}${track.id}`,
              String(element.currentTime),
            )
            stopHlsPlayback()
            return
          }

          const attempts = recoveryAttemptsRef.current[track.id] ?? 0
          recoveryAttemptsRef.current[track.id] = attempts + 1

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && attempts < 3) {
            hls.startLoad(element.currentTime)
            return
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && attempts < 3) {
            hls.recoverMediaError()
            return
          }

          sessionStorage.setItem(
            `${POSITION_STORAGE_PREFIX}${track.id}`,
            String(element.currentTime),
          )
          stopHlsPlayback()
        })
      } else if (element.canPlayType('application/vnd.apple.mpegurl')) {
        element.src = url
        element.addEventListener('error', stopHlsPlayback, {
          once: true,
        })
        element.load()
      } else {
        stopHlsPlayback()
      }

      if (!isPrefetch) {
        element.addEventListener(
          'loadedmetadata',
          () => restorePosition(element, track.id),
          { once: true },
        )
      }
    },
    [destroySlot, dispatch, restorePosition, volume],
  )

  const bindAudioElement = useCallback(
    (index: 0 | 1, element: HTMLAudioElement | null) => {
      slotsRef.current[index].element = element
    },
    [],
  )

  const switchToSlot = useCallback(
    (index: 0 | 1) => {
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
    (index: 0 | 1, track: TrackEntity) => {
      const standby = slotsRef.current[index]
      if (standby.trackId === track.id) {
        pendingPrefetchRef.current = null
        return
      }

      const activeElement = getActiveElement()
      if (!activeElement) {
        pendingPrefetchRef.current = { slot: index, track }
        return
      }

      if (shouldPrefetchNextTrack(activeElement)) {
        pendingPrefetchRef.current = null
        attachTrack(index, track, true)
        return
      }

      pendingPrefetchRef.current = { slot: index, track }
    },
    [attachTrack, getActiveElement],
  )

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

    if (standby.trackId === currentTrack.id) {
      switchToSlot(standbyIndex)
      if (nextTrack && nextTrack.id !== currentTrack.id) {
        prefetchTrackWhenBuffered(activeIndex, nextTrack)
      } else {
        destroySlot(activeIndex)
      }
      return
    }

    if (active.trackId !== currentTrack.id) {
      attachTrack(activeIndex, currentTrack, false)
    }

    if (nextTrack && nextTrack.id !== currentTrack.id) {
      prefetchTrackWhenBuffered(standbyIndex, nextTrack)
    } else {
      destroySlot(standbyIndex)
    }
  }, [
    attachTrack,
    currentTrack,
    destroySlot,
    nextTrack,
    prefetchTrackWhenBuffered,
    switchToSlot,
  ])

  useEffect(() => {
    for (const slot of slotsRef.current) {
      if (slot.element) slot.element.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const active = getActiveElement()
    if (!active || !currentTrack) return
    if (slotsRef.current[activeSlot].trackId !== currentTrack.id) return

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
  }, [activeSlot, currentTrack, getActiveElement, isPlaying])

  useEffect(
    () => () => {
      destroySlot(0)
      destroySlot(1)
    },
    [destroySlot],
  )

  const togglePlayPause = useCallback(() => {
    const active = getActiveElement()
    if (!active) return

    if (isPlaying) active.pause()
    else void active.play()
    dispatch(togglePlay())
  }, [dispatch, getActiveElement, isPlaying])

  const onSeek = useCallback(
    (time: number) => {
      const active = getActiveElement()
      if (active && Number.isFinite(time)) {
        isSeekingRef.current = true
        active.currentTime = time
        if (currentTrack) {
          sessionStorage.setItem(
            `${POSITION_STORAGE_PREFIX}${currentTrack.id}`,
            String(time),
          )
        }
      }
      dispatch(setCurrentTime(time))
    },
    [currentTrack, dispatch, getActiveElement],
  )

  const changeTrackHandler = useCallback(
    (direction: 'next' | 'prev') => {
      dispatch(changeTrack(direction))
    },
    [dispatch],
  )

  const handleLoadedMetadata = useCallback(
    (index: 0 | 1) => {
      if (index !== activeSlotRef.current) return
      const element = slotsRef.current[index].element
      if (element) dispatch(setDuration(element.duration))
    },
    [dispatch],
  )

  const handleTimeUpdate = useCallback(
    (index: 0 | 1) => {
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
        sessionStorage.setItem(
          `${POSITION_STORAGE_PREFIX}${currentTrack.id}`,
          String(currentTime),
        )
      }
    },
    [currentTrack, dispatch],
  )

  const handleProgress = useCallback(
    (index: 0 | 1) => {
      if (index !== activeSlotRef.current) return

      const pending = pendingPrefetchRef.current
      const element = slotsRef.current[index].element
      if (!element) return

      if (isPlaying && pendingPlayRef.current && !shouldDelayInitialPlayback(element)) {
        pendingPlayRef.current = false
        void element.play().catch(() => undefined)
      } else if (isPlaying && element.paused && !pendingPlayRef.current) {
        void element.play().catch(() => undefined)
      }

      if (!pending) return

      if (shouldPrefetchNextTrack(element)) {
        pendingPrefetchRef.current = null
        attachTrack(pending.slot, pending.track, true)
      }
    },
    [attachTrack, isPlaying],
  )

  const handleCanPlay = useCallback(
    (index: 0 | 1) => {
      if (index !== activeSlotRef.current) return

      const element = slotsRef.current[index].element
      if (!element || !isPlaying || !pendingPlayRef.current) return
      if (shouldDelayInitialPlayback(element)) return

      pendingPlayRef.current = false
      void element.play().catch(() => undefined)
    },
    [isPlaying],
  )

  const handleEnded = useCallback(
    (index: 0 | 1) => {
      if (index !== activeSlotRef.current) return
      if (!nextTrack) {
        dispatch(pause())
        return
      }

      const standbyIndex = index === 0 ? 1 : 0
      const standby = slotsRef.current[standbyIndex]
      if (standby.trackId === nextTrack.id && standby.element) {
        switchToSlot(standbyIndex)
      }
      if (currentTrack) {
        sessionStorage.removeItem(
          `${POSITION_STORAGE_PREFIX}${currentTrack.id}`,
        )
      }
      dispatch(changeTrack('next'))
    },
    [currentTrack, dispatch, nextTrack, switchToSlot],
  )

  const handleSeeked = useCallback(() => {
    isSeekingRef.current = false
  }, [])

  return {
    activeSlot,
    bindAudioElement,
    togglePlayPause,
    onSeek,
    changeTrack: changeTrackHandler,
    handleLoadedMetadata,
    handleTimeUpdate,
    handleProgress,
    handleCanPlay,
    handleEnded,
    handleSeeked,
  }
}
