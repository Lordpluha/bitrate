import type { AdminFixturesPrismaClient, AdminFixturesSummary } from './types'

/**
 * Enough `AuditLog` rows attributed to the fixture moderator for a "recent operator actions"
 * list to have something real to show. Skipped once 40 fixture rows already exist, so a re-run
 * neither grows this table nor rewrites history.
 */
export async function seedAuditLogs(
  prisma: AdminFixturesPrismaClient,
  summary: AdminFixturesSummary,
  staffId: string,
): Promise<void> {
  const target = 40
  const existingCount = await prisma.auditLog.count({
    where: { staffId, action: { startsWith: 'fixture.' } },
  })
  if (existingCount >= target) return

  const entityTypes = ['admin-tracks', 'admin-users', 'admin-artists', 'admin-moderation']
  const actions = ['findAll', 'findById', 'reprocess', 'advanceStatus', 'delete']

  const rows = Array.from({ length: target - existingCount }, (_, offset) => {
    const seq = existingCount + offset
    const entityType = entityTypes[seq % entityTypes.length] as string
    const action = actions[seq % actions.length] as string
    return {
      staffId,
      action: `fixture.${entityType}.${action}`,
      entityType,
      metadata: { fixture: true, seq },
      createdAt: new Date(Date.now() - seq * 60 * 60 * 1_000),
    }
  })

  await prisma.auditLog.createMany({ data: rows })
  summary.auditLogs += rows.length
}
