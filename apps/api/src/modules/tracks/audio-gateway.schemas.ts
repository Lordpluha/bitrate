import { z } from 'zod'

/** Bitrates outside this range cannot correspond to a stored rendition. */
const bitrate = z.number().int().min(1).max(1000).optional()

/** Format labels are short identifiers such as `opus`. */
const format = z.string().min(1).max(16).default('opus')

/** The position report every playback event carries. */
export const trackPayloadSchema = z.object({
  trackId: z.uuidv7(),
  currentTime: z.number().min(0),
})

/** `playTrack` starts playback and opens an audio stream in one call. */
export const playPayloadSchema = trackPayloadSchema.extend({ bitrate, format })

/** `updateStreaming` reports a play/pause transition. */
export const updatePayloadSchema = trackPayloadSchema.extend({ isPlaying: z.boolean() })

/** `streamTrack` only opens an audio stream, without touching playback state. */
export const streamPayloadSchema = z.object({ trackId: z.uuidv7(), bitrate, format })
