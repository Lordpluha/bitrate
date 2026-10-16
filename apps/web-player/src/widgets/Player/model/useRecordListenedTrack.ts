'use client'

import { useRecordListeningHistory } from '@entities/History'
import { ApiRequestError } from '@shared/api/errors'
import { useEffect, useRef } from 'react'

/**
 * Seconds of playback after which a track counts as listened.
 *
 * Skipping through a queue should not fill the history with tracks nobody
 * actually heard, so a play is only recorded once the listener stays past this.
 */
const LISTEN_THRESHOLD_SECONDS = 15

/** Pause after a failed attempt; playback ticks several times a second and must not retry each time. */
export const RECORD_RETRY_DELAY_MS = 30_000

/** Attempts per track before the play is left unrecorded. */
const MAX_RECORD_ATTEMPTS = 3

/** A 4xx other than a timeout or a rate limit will fail the same way again. */
const isPermanentFailure = (error: unknown) =>
  error instanceof ApiRequestError &&
  error.status >= 400 &&
  error.status < 500 &&
  error.status !== 408 &&
  error.status !== 429

type AttemptState = {
  attempts: number
  nextAttemptAt: number
}

type UseRecordListenedTrackInput = {
  currentTime: number
  trackId: string | undefined
}

/**
 * Records the current track in the listening history once it has been played
 * long enough, at most once per track.
 *
 * Without this the history table stays empty, which in turn leaves "Top artists
 * this month", "Top tracks this month" and Recents permanently blank. A failed
 * request is retried after a pause, a few times at most, so a rate limit or an
 * outage is not answered with a request on every playback tick.
 */
export const useRecordListenedTrack = ({
  currentTime,
  trackId,
}: UseRecordListenedTrackInput) => {
  const { mutateAsync } = useRecordListeningHistory()
  const pendingTrackIdsRef = useRef(new Set<string>())
  /** Recorded, or given up on: nothing more to send for this track. */
  const settledTrackIdsRef = useRef(new Set<string>())
  const attemptsRef = useRef(new Map<string, AttemptState>())

  useEffect(() => {
    if (!trackId || settledTrackIdsRef.current.has(trackId)) return
    if (pendingTrackIdsRef.current.has(trackId)) return
    if (currentTime < LISTEN_THRESHOLD_SECONDS) return

    const previous = attemptsRef.current.get(trackId)
    if (previous && Date.now() < previous.nextAttemptAt) return

    pendingTrackIdsRef.current.add(trackId)
    void mutateAsync(trackId)
      .then(() => {
        settledTrackIdsRef.current.add(trackId)
        attemptsRef.current.delete(trackId)
      })
      .catch((error: unknown) => {
        const attempts = (previous?.attempts ?? 0) + 1
        if (isPermanentFailure(error) || attempts >= MAX_RECORD_ATTEMPTS) {
          settledTrackIdsRef.current.add(trackId)
          attemptsRef.current.delete(trackId)
          return
        }
        attemptsRef.current.set(trackId, {
          attempts,
          nextAttemptAt: Date.now() + RECORD_RETRY_DELAY_MS,
        })
      })
      .finally(() => pendingTrackIdsRef.current.delete(trackId))
  }, [currentTime, mutateAsync, trackId])
}
