import type { ApiSchemas } from '@bitrate/contracts'
import type { StreamingQuality } from '../model/settings.types'

type ServerStreamingQuality = NonNullable<
  ApiSchemas['UpdateSettingsDto']['streamingQuality']
>

const TO_SERVER = {
  Automatic: 'automatic',
  High: 'high',
  Low: 'low',
  Normal: 'normal',
} as const satisfies Record<StreamingQuality, ServerStreamingQuality>

const FROM_SERVER = {
  automatic: 'Automatic',
  high: 'High',
  low: 'Low',
  normal: 'Normal',
  'very-high': 'High',
} as const satisfies Record<ServerStreamingQuality, StreamingQuality>

/**
 * Highest rendition (kbps) per choice, against the 128/192/320 transcoding ladder; null lets
 * the player follow the connection.
 */
const MAX_BITRATE = {
  Automatic: null,
  High: null,
  Low: 128,
  Normal: 192,
} as const satisfies Record<StreamingQuality, number | null>

export const toServerStreamingQuality = (quality: StreamingQuality) =>
  TO_SERVER[quality]

export const fromServerStreamingQuality = (quality: ServerStreamingQuality) =>
  FROM_SERVER[quality]

export const maxBitrateForQuality = (quality: StreamingQuality) =>
  MAX_BITRATE[quality]
