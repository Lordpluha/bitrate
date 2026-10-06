import type { Prisma } from '@prisma/client'

/** The CSV export's columns, in header order — `updatedAt` and the reporter's profile stay out. */
export const ADMIN_REPORT_EXPORT_COLUMNS = [
  'id',
  'status',
  'entityType',
  'entityId',
  'reason',
  'details',
  'reporterId',
  'resolvedAt',
  'createdAt',
] as const satisfies readonly (keyof Prisma.ModerationReportSelect)[]

/** Prisma select matching {@link ADMIN_REPORT_EXPORT_COLUMNS}. */
export const ADMIN_REPORT_EXPORT_SELECT = {
  id: true,
  status: true,
  entityType: true,
  entityId: true,
  reason: true,
  details: true,
  reporterId: true,
  resolvedAt: true,
  createdAt: true,
} as const satisfies Prisma.ModerationReportSelect
