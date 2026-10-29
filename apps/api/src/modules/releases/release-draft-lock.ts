import { ConflictException, NotFoundException } from '@nestjs/common'
import { type Prisma, ReleaseStatus } from '@prisma/client'
import { RELEASE_ERRORS } from './errors'
import { RELEASE_SUMMARY_SELECT } from './releases.select'

/**
 * Bumps the version of an owned draft together with `data`; rollback covers dependent writes.
 *
 * Ownership, lifecycle and version are one predicate, so a write that loses a race leaves
 * nothing behind. A miss is a 404 when the release is not visible to the artist, else a 409.
 * `statuses` widens the lifecycle for writes allowed past the draft, such as the delivery plan.
 */
export async function lockOwnedDraft(
  tx: Prisma.TransactionClient,
  ownerArtistId: string,
  id: string,
  expectedUpdatedAt: string,
  data: Prisma.ReleaseUpdateManyMutationInput = {},
  statuses: readonly ReleaseStatus[] = [ReleaseStatus.DRAFT],
) {
  const expected = new Date(expectedUpdatedAt)
  const [release] = await tx.release.updateManyAndReturn({
    where: {
      id,
      ownerArtistId,
      deletedAt: null,
      status: statuses.length === 1 ? statuses[0] : { in: [...statuses] },
      updatedAt: expected,
    },
    data: { ...data, updatedAt: new Date(Math.max(Date.now(), expected.getTime() + 1)) },
    select: RELEASE_SUMMARY_SELECT,
  })
  if (!release) {
    const visible = await tx.release.findFirst({
      where: { id, ownerArtistId, deletedAt: null },
      select: { id: true },
    })
    if (!visible) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    throw new ConflictException(RELEASE_ERRORS.CHANGED_OR_NOT_DRAFT)
  }
  return release
}
