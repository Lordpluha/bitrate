import type { ResourceStatus } from '@domain/shared'
import type { Artist, ArtistDetail, ArtistSortField } from '@domain/artist'
import type {
  ArtistDetailDto,
  ArtistDto,
  WireArtistSortField,
  WireArtistStatus,
} from './artist.dto'

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

const TO_WIRE_STATUS = {
  active: 'active',
  deactivated: 'deactivated',
  all: 'all',
} as const satisfies Record<ResourceStatus, NonNullable<WireArtistStatus>>

export function toWireArtistStatus(status: ResourceStatus): NonNullable<WireArtistStatus> {
  return TO_WIRE_STATUS[status]
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

export function toArtistDetail(dto: ArtistDetailDto): ArtistDetail {
  return {
    ...toArtist(dto),
    counts: dto.counts,
  }
}
