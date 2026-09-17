import type { ModerationReport, ModerationSortField, ModerationStatus } from '@domain/moderation'
import type { ReportDto, WireModerationSortField, WireModerationStatus } from './report.dto'

/** See `track.mapper.ts` — a status the API grows later is a compile error at this record. */
const TO_DOMAIN_STATUS = {
  OPEN: 'OPEN',
  REVIEWING: 'REVIEWING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const satisfies Record<WireModerationStatus, ModerationStatus>

const TO_WIRE_STATUS = {
  OPEN: 'OPEN',
  REVIEWING: 'REVIEWING',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
} as const satisfies Record<ModerationStatus, WireModerationStatus>

export function toWireModerationStatus(status: ModerationStatus): WireModerationStatus {
  return TO_WIRE_STATUS[status]
}

/** Same join as `TO_WIRE_STATUS`, for the queue's `sort` query parameter. */
const TO_WIRE_SORT = {
  createdAt: 'createdAt',
  status: 'status',
} as const satisfies Record<ModerationSortField, NonNullable<WireModerationSortField>>

export function toWireModerationSort(
  field: ModerationSortField,
): NonNullable<WireModerationSortField> {
  return TO_WIRE_SORT[field]
}

export function toModerationReport(dto: ReportDto): ModerationReport {
  return {
    id: dto.id,
    reporterId: dto.reporterId,
    entityType: dto.entityType,
    entityId: dto.entityId,
    reason: dto.reason,
    details: dto.details,
    status: TO_DOMAIN_STATUS[dto.status],
    resolvedAt: dto.resolvedAt === null ? null : new Date(dto.resolvedAt),
    createdAt: new Date(dto.createdAt),
  }
}
