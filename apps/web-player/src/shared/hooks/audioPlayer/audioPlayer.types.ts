import type Hls from 'hls.js'
import type { TrackEntity } from '@/entities/Track/models/schema/Track.entity'

export type SlotIndex = 0 | 1

export type PlayerSlot = {
  element: HTMLAudioElement | null
  hls: Hls | null
  playbackKey: string | null
  trackId: string | null
}

export type PendingPrefetch = {
  playbackKey: string
  slot: SlotIndex
  track: TrackEntity
}
