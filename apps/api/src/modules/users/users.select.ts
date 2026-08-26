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
