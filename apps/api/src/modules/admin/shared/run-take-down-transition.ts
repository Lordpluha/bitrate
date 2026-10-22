import type { PrismaService } from '@infra/prisma/prisma.service'
import type { Prisma } from '@prisma/client'
import type { AuditContextValue } from './decorators/audit-context.decorator'
import { isoOrNull } from './serialize-date'
import { writeTakeDownAudit } from './write-take-down-audit'

/** Which way a {@link runTakeDownTransition} moves `deletedAt`. */
export type TakeDownDirection = 'take-down' | 'restore'

/** The `deletedAt` state a guarded write must still find — the opposite of its target. */
type DeletedAtGuard = { deletedAt: null | { not: null } }

/** Who performed a take-down or restore, and why. */
export type TakeDownActor = { staffId: string; reason?: string } & AuditContextValue

/** The detailed audit row's identity fields; the action is `<entityType>.delete|restore`. */
type TakeDownAuditInput = { entityType: string; entityId: string } & TakeDownActor

/** Input for {@link runTakeDownTransition}. */
type TakeDownTransitionInput<Row extends { deletedAt: Date | null }> = {
  prisma: PrismaService
  direction: TakeDownDirection
  /** The row's current `deletedAt` in the caller's scope, or `null` when there is no such row. */
  current: () => Promise<{ deletedAt: Date | null } | null>
  /** The guarded write: `updateMany` with `guard` merged into the caller's `where`. */
  mark: (
    tx: Prisma.TransactionClient,
    guard: DeletedAtGuard,
    data: { deletedAt: Date | null },
  ) => Promise<{ count: number }>
  /** Reads the response row back after the write. */
  load: (tx: Prisma.TransactionClient) => Promise<Row>
  /** Further same-transaction work (e.g. revoking sessions); its result joins the audit `after`. */
  extra?: (tx: Prisma.TransactionClient) => Promise<Prisma.InputJsonObject>
  notFound: () => Error
  /** The 409 for a row already in the target state, including one a concurrent request moved. */
  conflict: () => Error
  audit: TakeDownAuditInput
}

/**
 * Soft-deletes or restores one row and writes its detailed audit row in the same transaction.
 *
 * The write is a guarded `updateMany`, never a plain `update`: of two concurrent requests only
 * one matches, and the other gets the 409 an already-transitioned row gets instead of silently
 * re-stamping `deletedAt` and re-auditing an action that already happened.
 *
 * A take-down writes first and reads only when nothing matched, to tell 404 from 409. A restore
 * reads first, because its audit `before` records the `deletedAt` it clears.
 */
export async function runTakeDownTransition<Row extends { deletedAt: Date | null }>({
  prisma,
  direction,
  current,
  mark,
  load,
  extra,
  notFound,
  conflict,
  audit,
}: TakeDownTransitionInput<Row>): Promise<Row> {
  const takeDown = direction === 'take-down'
  let before: Prisma.InputJsonObject = { deletedAt: null }
  if (!takeDown) {
    const existing = await current()
    if (!existing) throw notFound()
    if (!existing.deletedAt) throw conflict()
    before = { deletedAt: isoOrNull(existing.deletedAt) }
  }

  return await prisma.$transaction(async (tx) => {
    const { count } = await mark(
      tx,
      { deletedAt: takeDown ? null : { not: null } },
      { deletedAt: takeDown ? new Date() : null },
    )
    if (count === 0) {
      if (takeDown && !(await current())) throw notFound()
      throw conflict()
    }

    const extraAfter = extra ? await extra(tx) : {}
    const row = await load(tx)
    const { entityType, entityId, ...actor } = audit
    await writeTakeDownAudit({
      tx,
      entityType,
      entityId,
      action: `${entityType}.${takeDown ? 'delete' : 'restore'}`,
      before,
      after: { deletedAt: isoOrNull(row.deletedAt), ...extraAfter },
      ...actor,
    })
    return row
  })
}
