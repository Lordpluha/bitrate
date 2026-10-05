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

/** The CSV export's columns, in header order — no bio, media or security counters. */
export const ADMIN_ARTIST_EXPORT_COLUMNS = [
  'id',
  'username',
  'email',
  'verified',
  'monthlyListeners',
  'country',
  'emailVerifiedAt',
  'twoFactorEnabled',
  'deletedAt',
  'createdAt',
] as const satisfies readonly (keyof typeof ADMIN_ARTIST_SAFE_SELECT)[]

/** Prisma select matching {@link ADMIN_ARTIST_EXPORT_COLUMNS}. */
export const ADMIN_ARTIST_EXPORT_SELECT = {
  id: true,
  username: true,
  email: true,
  verified: true,
  monthlyListeners: true,
  country: true,
  emailVerifiedAt: true,
  twoFactorEnabled: true,
  deletedAt: true,
  createdAt: true,
} as const satisfies Prisma.ArtistSelect
