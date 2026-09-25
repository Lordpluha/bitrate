import type { Prisma } from '@prisma/client'

/** Scalar artist fields safe to return to an operator — never password or 2FA secret. */
export const ADMIN_ARTIST_SAFE_SELECT = {
  id: true,
  username: true,
  email: true,
  bio: true,
  avatar: true,
  backgroundImage: true,
  verified: true,
  monthlyListeners: true,
  country: true,
  twoFactorEnabled: true,
  emailVerifiedAt: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ArtistSelect
