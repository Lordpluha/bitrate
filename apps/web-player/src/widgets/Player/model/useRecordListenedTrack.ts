'use client'

import { useRecordListeningHistory } from '@entities/History'
import { useEffect, useRef } from 'react'

/**
 * Seconds of playback after which a track counts as listened.
 *
 * Skipping through a queue should not fill the history with tracks nobody
 * actually heard, so a play is only recorded once the listener stays past this.
 */
const LISTEN_THRESHOLD_SECONDS = 15

type UseRecordListenedTrackInput = {
  currentTime: number
  trackId: string | undefined
}

/**
 * Records the current track in the listening history once it has been played
 * long enough, at most once per track.
 *
 * Without this the history table stays empty, which in turn leaves "Top artists
 * this month", "Top tracks this month" and Recents permanently blank.
 */
export const useRecordListenedTrack = ({
  currentTime,
  trackId,
}: UseRecordListenedTrackInput) => {
  const { mutateAsync } = useRecordListeningHistory()
  const pendingTrackIdsRef = useRef(new Set<string>())
  const recordedTrackIdsRef = useRef(new Set<string>())

  useEffect(() => {
    if (!trackId || recordedTrackIdsRef.current.has(trackId)) return
    if (pendingTrackIdsRef.current.has(trackId)) return
    if (currentTime < LISTEN_THRESHOLD_SECONDS) return

    pendingTrackIdsRef.current.add(trackId)
    void mutateAsync(trackId)
      .then(() => recordedTrackIdsRef.current.add(trackId))
      .catch(() => undefined)
      .finally(() => pendingTrackIdsRef.current.delete(trackId))
  }, [currentTime, mutateAsync, trackId])
}
