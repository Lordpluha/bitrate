import type { Track, TrackProcessingStatus } from '@domain/track'
import type { TrackDto, WireProcessingStatus } from './track.dto'

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
    createdAt: new Date(dto.createdAt),
  }
}
