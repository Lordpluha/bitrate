import type { ResourceStatus } from '@domain/shared'
import type { Track, TrackDetail, TrackProcessingStatus, TrackSortField } from '@domain/track'
import type {
  TrackDetailDto,
  TrackDto,
  WireProcessingStatus,
  WireTrackSortField,
  WireTrackStatus,
} from './track.dto'

/**
 * The seam that lets the domain declare its own status union without losing the contract
 * binding: a member the API grows later has no entry here, and `satisfies` turns that into a
 * compile error at this line rather than an empty screen in front of an operator.
 */
const TO_DOMAIN_STATUS = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const satisfies Record<WireProcessingStatus, TrackProcessingStatus>

/**
 * The same join in the other direction, for turning a filter back into a query parameter. Spelled
 * out rather than returned as-is: the two unions are identical today, and a plain `return status`
 * would keep compiling on the day one of them changes.
 */
const TO_WIRE_STATUS = {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const satisfies Record<TrackProcessingStatus, WireProcessingStatus>

export function toWireProcessingStatus(status: TrackProcessingStatus): WireProcessingStatus {
  return TO_WIRE_STATUS[status]
}

/** Same join as `TO_WIRE_STATUS`, for the catalog's `sort` query parameter. */
const TO_WIRE_SORT = {
  createdAt: 'createdAt',
  title: 'title',
  processingStatus: 'processingStatus',
} as const satisfies Record<TrackSortField, NonNullable<WireTrackSortField>>

export function toWireTrackSort(field: TrackSortField): NonNullable<WireTrackSortField> {
  return TO_WIRE_SORT[field]
}

/** See `artist.mapper.ts`'s `TO_WIRE_STATUS` — spelled out so a dropped member fails to compile. */
const TO_WIRE_TAKE_DOWN_STATUS = {
  active: 'active',
  deactivated: 'deactivated',
  all: 'all',
} as const satisfies Record<ResourceStatus, NonNullable<WireTrackStatus>>

export function toWireTrackStatus(status: ResourceStatus): NonNullable<WireTrackStatus> {
  return TO_WIRE_TAKE_DOWN_STATUS[status]
}

export function toTrack(dto: TrackDto): Track {
  return {
    id: dto.id,
    title: dto.title,
    artistUsername: dto.artistUsername,
    processingStatus: TO_DOMAIN_STATUS[dto.processingStatus],
    processingError: dto.processingError,
    processingAttempts: dto.processingAttempts,
    processingStartedAt:
      dto.processingStartedAt === null ? null : new Date(dto.processingStartedAt),
    processingFinishedAt:
      dto.processingFinishedAt === null ? null : new Date(dto.processingFinishedAt),
    updatedAt: new Date(dto.updatedAt),
    takenDownAt: dto.deletedAt === null ? null : new Date(dto.deletedAt),
    createdAt: new Date(dto.createdAt),
  }
}

export function toTrackDetail(dto: TrackDetailDto): TrackDetail {
  return {
    ...toTrack(dto),
    artistId: dto.artistId,
    audioFiles: dto.audioFiles,
    artists: dto.artists,
    genres: dto.genres,
    albums: dto.albums,
    openReportCount: dto.openReportCount,
  }
}
