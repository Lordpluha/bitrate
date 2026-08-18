import type Hls from 'hls.js'
import type { StreamLoader } from '@/entities/Player/lib'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'

export type SlotIndex = 0 | 1

export type PlayerSlot = {
  element: HTMLAudioElement | null
  hls: Hls | null
  /** Set instead of `hls` when the slot plays the CMAF path (ADR-0020). */
  loader: StreamLoader | null
  /** Bitrate the CMAF loader is currently downloading, for UI and tracing. */
  currentBitrate: number | null
  playbackKey: string | null
  trackId: string | null
}

export type PendingPrefetch = {
  playbackKey: string
  slot: SlotIndex
  track: TrackEntity
}
