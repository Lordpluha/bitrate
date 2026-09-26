import type { Prisma } from '@prisma/client'

/** Scalar staff fields, plus the role name, that are safe to return from an authenticated route. */
export const STAFF_SAFE_SELECT = {
  id: true,
  email: true,
  username: true,
  roleId: true,
  role: { select: { name: true } },
  permissions: true,
  twoFactorEnabled: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.StaffSelect
