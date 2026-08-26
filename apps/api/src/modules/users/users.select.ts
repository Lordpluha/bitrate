import type { Prisma } from '@prisma/client'

/** Scalar user fields that are safe to expose on public profile endpoints. */
export const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  createdAt: true,
  description: true,
  avatar: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect

/**
 * Fields a signed-in account may see about itself.
 *
 * Wider than the public projection — settings need the address to verify and
 * the two-factor state — but still an allowlist, so credentials and lockout
 * bookkeeping never leave the server.
 */
export const SELF_USER_SELECT = {
  ...PUBLIC_USER_SELECT,
  email: true,
  emailVerifiedAt: true,
  twoFactorEnabled: true,
} as const satisfies Prisma.UserSelect
