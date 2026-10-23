import type { PrismaService } from '@infra/prisma/prisma.service'
import type { Prisma } from '@prisma/client'
import type { AdminRevokeSessionsResultEntity } from './entities/admin-revoke-sessions-result.entity'
import type { TakeDownActor } from './run-take-down-transition'
import { writeTakeDownAudit } from './write-take-down-audit'

/** Input for {@link revokeAccountSessions}. */
type RevokeAccountSessionsInput = {
  prisma: PrismaService
  /** Whether the account exists — deactivated ones included. */
  exists: () => Promise<boolean>
  notFound: () => Error
  /** Deletes every session the account holds. */
  revoke: (tx: Prisma.TransactionClient) => Promise<{ count: number }>
  /** The audit row's entity type; the action is `<entityType>.revoke-sessions`. */
  entityType: string
  entityId: string
  actor: TakeDownActor
}

/**
 * Revokes every session of a user or artist account and audits it in the same transaction,
 * signing the account out on its next request — an already-open WebSocket connection is
 * unaffected until it disconnects.
 */
export async function revokeAccountSessions({
  prisma,
  exists,
  notFound,
  revoke,
  entityType,
  entityId,
  actor,
}: RevokeAccountSessionsInput): Promise<AdminRevokeSessionsResultEntity> {
  if (!(await exists())) throw notFound()

  return await prisma.$transaction(async (tx) => {
    const { count } = await revoke(tx)
    await writeTakeDownAudit({
      tx,
      entityType,
      entityId,
      action: `${entityType}.revoke-sessions`,
      before: {},
      after: { sessionsRevoked: count },
      ...actor,
    })
    return { revoked: count }
  })
}
