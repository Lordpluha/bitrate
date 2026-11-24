import { resolveMediaUrl } from '@/lib/api/media-url'

import type { PlayableTrack } from './playable-track'
import type { TrackSummary } from './schemas/track-list-schema'

type ToPlayableTrackInput = {
  track: TrackSummary
  /** A cover to fall back to when the track has none (an album's own artwork). */
  fallbackCover?: string | null
}

/** Maps any validated track payload into the player's `PlayableTrack`. */
export function toPlayableTrack({ track, fallbackCover = null }: ToPlayableTrackInput): PlayableTrack {
  return {
    id: track.id,
    title: track.title,
    artistName: track.artist?.username ?? null,
    artistId: track.artistId ?? null,
    coverUrl: resolveMediaUrl(track.cover, 'tracks/covers') ?? resolveMediaUrl(fallbackCover, 'albums/covers'),
    durationSec: track.duration ?? null,
  }
}
