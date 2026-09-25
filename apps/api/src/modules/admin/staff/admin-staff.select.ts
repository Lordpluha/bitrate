import type { Prisma } from '@prisma/client'

/**
 * Scalar staff fields safe to return to an operator, plus the role's own `id`/`name`/
 * `permissions` — the panel needs the role's current template to compute per-row divergence
 * without an extra request per operator. Never `password` or `twoFactorSecret`.
 */
export const ADMIN_STAFF_SAFE_SELECT = {
  id: true,
  email: true,
  username: true,
  role: { select: { id: true, name: true, permissions: true } },
  permissions: true,
  twoFactorEnabled: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.StaffSelect
