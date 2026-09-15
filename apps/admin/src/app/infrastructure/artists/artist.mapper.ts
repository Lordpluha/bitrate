import type { Artist } from '@domain/artist'
import type { ArtistDto } from './artist.dto'

/**
 * Transport shape to domain shape. Two things happen here and nowhere else: ISO strings become
 * `Date`s, and the API's `deletedAt` becomes the panel's `deactivatedAt`.
 */
export function toArtist(dto: ArtistDto): Artist {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    verified: dto.verified,
    monthlyListeners: dto.monthlyListeners,
    country: dto.country,
    createdAt: new Date(dto.createdAt),
    deactivatedAt: dto.deletedAt === null ? null : new Date(dto.deletedAt),
  }
}
