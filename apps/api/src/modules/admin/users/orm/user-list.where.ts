import { type AdminResourceStatus, statusWhere } from '@modules/admin/shared'
import type { Prisma } from '@prisma/client'

/** Filters the operator user list narrows by. */
export type UserListFilters = { status?: AdminResourceStatus; q?: string }

/** The user list's `where` clause, shared by listing and counting. */
export const userListWhere = ({ status, q }: UserListFilters) =>
  ({
    ...statusWhere(status),
    ...(q && {
      OR: [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    }),
  }) satisfies Prisma.UserWhereInput
