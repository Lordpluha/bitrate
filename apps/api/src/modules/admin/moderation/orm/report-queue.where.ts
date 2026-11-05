import type { ModerationStatus, Prisma } from '@prisma/client'

/** Filters the moderation report queue narrows by. */
export type ReportQueueFilters = { status?: ModerationStatus; entityType?: string }

/** The queue's `where` clause, shared by the list and its export. */
export function reportQueueWhere({
  status,
  entityType,
}: ReportQueueFilters): Prisma.ModerationReportWhereInput {
  return { ...(status && { status }), ...(entityType && { entityType }) }
}
