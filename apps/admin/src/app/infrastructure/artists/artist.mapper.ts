import type { Artist, ArtistSortField } from '@domain/artist'
import type { ArtistDto, WireArtistSortField } from './artist.dto'

/**
 * See `track.mapper.ts`'s `TO_WIRE_STATUS` — spelled out rather than returned as-is, so a sort
 * field the API drops later is a compile error here instead of a 400 an operator's click
 * triggers.
 */
const TO_WIRE_SORT = {
  username: 'username',
  email: 'email',
  createdAt: 'createdAt',
  monthlyListeners: 'monthlyListeners',
} as const satisfies Record<ArtistSortField, NonNullable<WireArtistSortField>>

export function toWireArtistSort(field: ArtistSortField): NonNullable<WireArtistSortField> {
  return TO_WIRE_SORT[field]
}

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
