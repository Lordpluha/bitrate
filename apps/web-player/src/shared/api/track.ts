import type { ApiSchemas } from '@bitrate/contracts'

/**
 * A track as web-player reads it from the API. `audioUrl` is the master's storage key, which the
 * API is removing from public responses (ADR-0071, #522); playback never used it, so the client
 * does not require it.
 */
export type ApiTrack = Omit<ApiSchemas['TrackEntity'], 'audioUrl'>
