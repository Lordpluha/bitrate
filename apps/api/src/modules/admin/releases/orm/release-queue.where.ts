import type { Prisma } from '@prisma/client'
import { ADMIN_REVIEWED_STATUSES, type ListAdminReleasesQueryDto } from '../dtos/release-review.dto'

/** The queue filter: not deleted, the chosen status (or every reviewed one), title/handle search. */
export function releaseQueueWhere(query: ListAdminReleasesQueryDto): Prisma.ReleaseWhereInput {
  return {
    deletedAt: null,
    status: query.status === 'ALL' ? { in: [...ADMIN_REVIEWED_STATUSES] } : query.status,
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q, mode: 'insensitive' } },
            { owner: { username: { contains: query.q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }
}
