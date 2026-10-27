'use client'

import type {
  BitratePlayerElement,
  BitratePlayerEndedDetail,
  BitratePlayerErrorDetail,
  BitratePlayerSource,
  BitratePlayerStateDetail,
} from '@bitrate/player/contract'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getPlaybackKey } from '@/entities/Player/model/audioPlayer/audioPlayer.utils'
import { createStreamingTransport } from '@/entities/Player/model/audioPlayer/streamingTransport'
import { useManifestResolver } from '@/entities/Player/model/audioPlayer/useManifestResolver'
import type { PlayableTrack } from '@/entities/Player/model/playableTrack.types'
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
} from '@/entities/Player/model/playerStore'
import { showApiErrorToast } from '@/shared/api/feedback'

type ToSourceInput = {
  track: PlayableTrack
  playlistId: string | null
  playbackSequence: number
}

const toSource = ({
  track,
  playlistId,
  playbackSequence,
}: ToSourceInput): BitratePlayerSource => ({
  key: getPlaybackKey(track.id, playlistId, playbackSequence),
  progressiveUrl: track.audioUrl,
  trackId: track.id,
})

/**
 * Drives the one `<bitrate-player>` web-player plays through (#236). The store still decides
 * what plays and what comes next; this hands the element `source`, `next`, the play intent and
 * the volume, and mirrors what the element reports — play/pause, time, the end of a play,
 * fatal errors — back into the store. Loading, prefetching and switching are the element's.
 */
export const useStreamingPlayer = () => {
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
  const pause = usePlayerStore((state) => state.pause)
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying)
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime)
  const setPlaybackTime = usePlayerStore((state) => state.setPlaybackTime)
  const changeTrack = usePlayerStore((state) => state.changeTrack)
  const advanceOnTrackEnd = usePlayerStore((state) => state.advanceOnTrackEnd)
  const resolveManifest = useManifestResolver()
  const [element, setElement] = useState<BitratePlayerElement | null>(null)

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

  const source = useMemo(
    () =>
      currentTrack
        ? toSource({
            playbackSequence,
            playlistId: currentPlaylistId,
            track: currentTrack,
          })
        : null,
    [currentPlaylistId, currentTrack, playbackSequence],
  )

  const next = useMemo(
    () =>
      nextTransition?.kind === 'track'
        ? toSource({
            playbackSequence: nextTransition.playbackSequence,
            playlistId: currentPlaylistId,
            track: nextTransition.track,
          })
        : null,
    [currentPlaylistId, nextTransition],
  )

  const streaming = useMemo(
    () => createStreamingTransport({ resolveManifest }),
    [resolveManifest],
  )

  useEffect(() => {
    if (element) element.streaming = streaming
  }, [element, streaming])

  /** Source first, then the intent: the element only plays what it has been given. */
  useEffect(() => {
    if (element) element.source = source
  }, [element, source])

  useEffect(() => {
    if (element) element.next = next
  }, [element, next])

  useEffect(() => {
    if (!element || !source) return
    if (isPlaying) void element.play()
    else element.pause()
  }, [element, isPlaying, source])

  useEffect(() => {
    if (element) element.volume = volume
  }, [element, volume])

  useEffect(() => {
    if (!element || !source) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    const handleStateChange = (event: Event) => {
      const state = (event as CustomEvent<BitratePlayerStateDetail>).detail
      if (state.key !== source.key) return
      setPlaybackTime({
        currentTime: state.currentTime,
        duration: state.duration,
      })
    }

    const handleEnded = (event: Event) => {
      const { key } = (event as CustomEvent<BitratePlayerEndedDetail>).detail
      if (key !== source.key) return

      if (nextTransition?.kind === 'restart') {
        advanceOnTrackEnd()
        element.seek(0)
        void element.play()
        return
      }
      if (!nextTransition) {
        pause()
        return
      }
      /** The store moves on; the new `source` is the key the element prefetched as `next`. */
      advanceOnTrackEnd()
    }

    const handleError = (event: Event) => {
      const { message } = (event as CustomEvent<BitratePlayerErrorDetail>)
        .detail
      pause()
      showApiErrorToast(new Error(message))
    }

    element.addEventListener('play', handlePlay)
    element.addEventListener('pause', handlePause)
    element.addEventListener('statechange', handleStateChange)
    element.addEventListener('ended', handleEnded)
    element.addEventListener('error', handleError)
    return () => {
      element.removeEventListener('play', handlePlay)
      element.removeEventListener('pause', handlePause)
      element.removeEventListener('statechange', handleStateChange)
      element.removeEventListener('ended', handleEnded)
      element.removeEventListener('error', handleError)
    }
  }, [
    advanceOnTrackEnd,
    element,
    nextTransition,
    pause,
    setIsPlaying,
    setPlaybackTime,
    source,
  ])

  const togglePlayPause = useCallback(() => {
    if (!element) return
    if (isPlaying) element.pause()
    else void element.play()
  }, [element, isPlaying])

  const onSeek = useCallback(
    (time: number) => {
      if (element && Number.isFinite(time)) element.seek(time)
      setCurrentTime(time)
    },
    [element, setCurrentTime],
  )

  return {
    /** Ref callback for the `<bitrate-player>` the widget renders. */
    bindElement: setElement,
    changeTrack,
    onSeek,
    togglePlayPause,
  }
}
