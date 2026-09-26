import type { AuditEntry, AuditSortField } from '@domain/audit'
import type { AuditEntryDto, WireAuditSortField } from './audit.dto'

/** See `artist.mapper.ts`'s `TO_WIRE_SORT` — a single-member union today, still exhaustive. */
const TO_WIRE_SORT = {
  createdAt: 'createdAt',
} as const satisfies Record<AuditSortField, NonNullable<WireAuditSortField>>

export function toWireAuditSort(field: AuditSortField): NonNullable<WireAuditSortField> {
  return TO_WIRE_SORT[field]
}

export function toAuditEntry(dto: AuditEntryDto): AuditEntry {
  return {
    id: dto.id,
    action: dto.action,
    entityType: dto.entityType,
    entityId: dto.entityId,
    actorUsername: dto.actorUsername,
    ipAddress: dto.ipAddress,
    createdAt: new Date(dto.createdAt),
  }
}
