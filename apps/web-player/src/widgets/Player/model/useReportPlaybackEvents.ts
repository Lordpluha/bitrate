'use client'

import {
  endReasonOnChange,
  finishPlay,
  type PlaybackEventBody,
  playbackOriginOf,
  postPlaybackEvent,
  samplePlay,
  startPlay,
  type TrackedPlay,
} from '@entities/PlaybackEvent'
import { useEffect, useRef } from 'react'

type ReportInput = {
  play: TrackedPlay
  endReason: PlaybackEventBody['endReason']
  keepalive: boolean
}

/** Sends one finished play, best effort: a lost report only costs one signal. */
const report = ({ play, endReason, keepalive }: ReportInput) => {
  const body = finishPlay({ play, endReason, now: new Date() })
  if (!body) return
  void postPlaybackEvent({ body, keepalive }).catch(() => undefined)
}

type UseReportPlaybackEventsInput = {
  trackId: string | undefined
  /** Changes on every transition, so a repeated track is a new play. */
  playbackSequence: number
  currentPlaylistId: string | null
  currentTime: number
  duration: number
  isPlaying: boolean
}

/**
 * Reports every finished play to the recommendation system: how long it was actually heard, how
 * it ended and where it came from. A play ends when the next one starts (completed or skipped) or
 * when the page goes away (stopped). Listening history is recorded separately, as before.
 */
export const useReportPlaybackEvents = ({
  trackId,
  playbackSequence,
  currentPlaylistId,
  currentTime,
  duration,
  isPlaying,
}: UseReportPlaybackEventsInput) => {
  const playRef = useRef<TrackedPlay | null>(null)
  const identityRef = useRef<string | null>(null)

  useEffect(() => {
    const identity = trackId ? `${playbackSequence}:${trackId}` : null
    const sample = { currentTime, duration, isPlaying }
    const current = playRef.current

    if (identity === identityRef.current) {
      if (current) playRef.current = samplePlay({ play: current, sample })
      return
    }

    if (current)
      report({
        play: current,
        endReason: endReasonOnChange({ play: current }),
        keepalive: false,
      })
    identityRef.current = identity
    playRef.current = trackId
      ? startPlay({
          trackId,
          sample,
          now: new Date(),
          clientPlayId: crypto.randomUUID(),
          ...playbackOriginOf({ currentPlaylistId }),
        })
      : null
  }, [
    trackId,
    playbackSequence,
    currentPlaylistId,
    currentTime,
    duration,
    isPlaying,
  ])

  useEffect(() => {
    const stop = () => {
      const current = playRef.current
      if (!current) return
      report({ play: current, endReason: 'STOPPED', keepalive: true })
      playRef.current = null
      identityRef.current = null
    }
    window.addEventListener('pagehide', stop)
    return () => {
      window.removeEventListener('pagehide', stop)
      stop()
    }
  }, [])
}
