import type { AuditEntry } from '@domain/audit'
import type { AuditEntryDto } from './audit.dto'

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
