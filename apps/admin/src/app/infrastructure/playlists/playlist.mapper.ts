import type { Playlist, PlaylistDetail, PlaylistSortField } from '@domain/playlist'
import type { ResourceStatus } from '@domain/shared'
import type {
  PlaylistDetailDto,
  PlaylistDto,
  WirePlaylistSortField,
  WirePlaylistStatus,
} from './playlist.dto'

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null
}

/** See `track.mapper.ts`'s `TO_WIRE_SORT`. */
const TO_WIRE_SORT = {
  createdAt: 'createdAt',
  title: 'title',
} as const satisfies Record<PlaylistSortField, NonNullable<WirePlaylistSortField>>

export function toWirePlaylistSort(field: PlaylistSortField): NonNullable<WirePlaylistSortField> {
  return TO_WIRE_SORT[field]
}

/** See `artist.mapper.ts`'s `TO_WIRE_STATUS` — spelled out so a dropped member fails to compile. */
const TO_WIRE_STATUS = {
  active: 'active',
  deactivated: 'deactivated',
  all: 'all',
} as const satisfies Record<ResourceStatus, NonNullable<WirePlaylistStatus>>

export function toWirePlaylistStatus(status: ResourceStatus): NonNullable<WirePlaylistStatus> {
  return TO_WIRE_STATUS[status]
}

export function toPlaylist(dto: PlaylistDto): Playlist {
  return {
    id: dto.id,
    title: dto.title,
    ownerId: dto.ownerId,
    ownerUsername: dto.ownerUsername,
    isPublic: dto.isPublic,
    followersCount: dto.followersCount,
    trackCount: dto.trackCount,
    takenDownAt: toDate(dto.deletedAt),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  }
}

export function toPlaylistDetail(dto: PlaylistDetailDto): PlaylistDetail {
  return {
    ...toPlaylist(dto),
    description: dto.description ?? null,
    collaborative: dto.collaborative,
    tracks: dto.tracks.map((track) => ({
      id: track.id,
      title: track.title,
      position: track.position,
    })),
  }
}
