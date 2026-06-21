/** The redis client value. */
export const REDIS_CLIENT = 'REDIS_CLIENT'

/** The ttl value. */
export const TTL = {
  SHORT: 60,
  MEDIUM: 120,
  LONG: 300,
} as const

/** The ns value. */
export const NS = {
  TRACKS: 'tracks',
  ARTISTS: 'artists',
  ALBUMS: 'albums',
  SEARCH: 'search',
} as const
