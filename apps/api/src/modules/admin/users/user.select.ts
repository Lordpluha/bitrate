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

/** The CSV export's columns, in header order — personal data leaves the panel, so no more. */
export const ADMIN_USER_EXPORT_COLUMNS = [
  'id',
  'username',
  'email',
  'emailVerifiedAt',
  'twoFactorEnabled',
  'lockedUntil',
  'deletedAt',
  'createdAt',
] as const satisfies readonly (keyof typeof ADMIN_USER_SAFE_SELECT)[]

/** Prisma select matching {@link ADMIN_USER_EXPORT_COLUMNS}. */
export const ADMIN_USER_EXPORT_SELECT = {
  id: true,
  username: true,
  email: true,
  emailVerifiedAt: true,
  twoFactorEnabled: true,
  lockedUntil: true,
  deletedAt: true,
  createdAt: true,
} as const satisfies Prisma.UserSelect
