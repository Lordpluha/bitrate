import type { Prisma } from '@prisma/client'

export const PROFILE_SELECT = {
  id: true,
  username: true,
  email: true,
  bio: true,
  country: true,
  socials: true,
  avatar: true,
  backgroundImage: true,
  verified: true,
  twoFactorEnabled: true,
  emailVerifiedAt: true,
  locale: true,
  updatedAt: true,
} as const satisfies Prisma.ArtistSelect
