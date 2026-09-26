import type { AuditLog } from '@prisma/client'

/** Builds an audit log record for tests. */
export const buildAuditLog = (overrides: Partial<AuditLog> = {}): AuditLog => ({
  id: 'audit-1',
  userId: null,
  staffId: 'staff-1',
  action: 'admin-artists.updateVerification',
  entityType: 'admin-artists',
  entityId: 'artist-1',
  metadata: null,
  ipAddress: '127.0.0.1',
  createdAt: new Date(),
  ...overrides,
})
