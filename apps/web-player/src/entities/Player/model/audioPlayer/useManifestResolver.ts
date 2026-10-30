'use client'

import { useCallback } from 'react'
import { openPlaySession } from '@/entities/Player/api/client'
import type { TrackManifest } from '@/entities/Player/model/manifest.types'

/**
 * Resolves a track's manifest by opening a playback session for this play (ADR-0067): the
 * session's token, remembered per track, authorises every rendition request that follows.
 * Not cached — a session is one play, not immutable track data.
 *
 * Returns null — rather than throwing — when the track cannot play yet or the session cannot
 * be opened; the element then reports the track as unplayable.
 */
export const useManifestResolver = () =>
  useCallback(async (trackId: string): Promise<TrackManifest | null> => {
    try {
      return (await openPlaySession({ trackId }))?.manifest ?? null
    } catch {
      return null
    }
  }, [])
