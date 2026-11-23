import type { Audience } from '../domain.js'

export function isAudience(value: string): value is Audience {
  return value === 'listener' || value === 'artist'
}
