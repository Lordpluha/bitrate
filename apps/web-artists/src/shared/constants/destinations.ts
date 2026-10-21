import type { ApiSchemas } from '@bitrate/contracts'

/** Stores a release can be delivered to, in display order. */
export const deliveryDestinations = [
  'SPOTIFY',
  'APPLE_MUSIC',
  'YOUTUBE_MUSIC',
  'AMAZON_MUSIC',
  'DEEZER',
  'TIDAL',
] as const satisfies readonly ApiSchemas['DeliveryDestination'][]

export type DeliveryDestination = (typeof deliveryDestinations)[number]

export const destinationLabels = {
  SPOTIFY: 'Spotify',
  APPLE_MUSIC: 'Apple Music',
  YOUTUBE_MUSIC: 'YouTube Music',
  AMAZON_MUSIC: 'Amazon Music',
  DEEZER: 'Deezer',
  TIDAL: 'TIDAL',
} satisfies Record<DeliveryDestination, string>
