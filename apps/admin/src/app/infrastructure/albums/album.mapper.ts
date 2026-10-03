import type { Album, AlbumDetail, AlbumSortField, AlbumTrack, AlbumType } from '@domain/album'
import type { ResourceStatus } from '@domain/shared'
import type { TrackProcessingStatus } from '@domain/track'
import { API_BASE_URL } from '../http/api.config'
import type {
  AlbumDetailDto,
  AlbumDto,
  WireAlbumSortField,
  WireAlbumStatus,
  WireAlbumTrackStatus,
  WireAlbumType,
} from './album.dto'

/** Albums are stored under their own bucket, apart from track covers. */
function toCoverUrl(cover: string | null | undefined): string | null {
  if (!cover) return null
  return `${API_BASE_URL}/static/albums/covers/${encodeURIComponent(cover)}`
}

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null
}

/**
 * The seam that lets the domain declare its own unions without losing the contract binding: a
 * member the API grows later has no entry here, and `satisfies` makes that a compile error.
 */
const TO_DOMAIN_TYPE = {
  ALBUM: 'ALBUM',
  SINGLE: 'SINGLE',
  EP: 'EP',
  COMPILATION: 'COMPILATION',
} as const satisfies Record<WireAlbumType, AlbumType>

const TO_DOMAIN_TRACK_STATUS = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const satisfies Record<WireAlbumTrackStatus, TrackProcessingStatus>

/** See `track.mapper.ts`'s `TO_WIRE_SORT`. */
const TO_WIRE_SORT = {
  createdAt: 'createdAt',
  title: 'title',
  releaseDate: 'releaseDate',
} as const satisfies Record<AlbumSortField, NonNullable<WireAlbumSortField>>

export function toWireAlbumSort(field: AlbumSortField): NonNullable<WireAlbumSortField> {
  return TO_WIRE_SORT[field]
}

/** See `artist.mapper.ts`'s `TO_WIRE_STATUS` — spelled out so a dropped member fails to compile. */
const TO_WIRE_STATUS = {
  active: 'active',
  deactivated: 'deactivated',
  all: 'all',
} as const satisfies Record<ResourceStatus, NonNullable<WireAlbumStatus>>

export function toWireAlbumStatus(status: ResourceStatus): NonNullable<WireAlbumStatus> {
  return TO_WIRE_STATUS[status]
}

export function toAlbum(dto: AlbumDto): Album {
  return {
    id: dto.id,
    title: dto.title,
    artistId: dto.artistId,
    artistUsername: dto.artistUsername,
    coverUrl: toCoverUrl(dto.cover),
    type: TO_DOMAIN_TYPE[dto.type],
    totalTracks: dto.totalTracks,
    releaseDate: toDate(dto.releaseDate),
    takenDownAt: toDate(dto.deletedAt),
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  }
}

export function toAlbumDetail(dto: AlbumDetailDto): AlbumDetail {
  const tracks: AlbumTrack[] = dto.tracks.map((track) => ({
    id: track.id,
    title: track.title,
    trackNumber: track.trackNumber,
    discNumber: track.discNumber,
    processingStatus: TO_DOMAIN_TRACK_STATUS[track.processingStatus],
    takenDownAt: toDate(track.deletedAt),
  }))

  return {
    ...toAlbum(dto),
    description: dto.description ?? null,
    label: dto.label ?? null,
    copyright: dto.copyright ?? null,
    tracks,
  }
}
