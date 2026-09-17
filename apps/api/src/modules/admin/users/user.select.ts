import type { Prisma } from '@prisma/client'

/** Scalar user fields safe to return to an operator — never password or 2FA secret. */
export const ADMIN_USER_SAFE_SELECT = {
  id: true,
  username: true,
  email: true,
  avatar: true,
  description: true,
  twoFactorEnabled: true,
  emailVerifiedAt: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect
