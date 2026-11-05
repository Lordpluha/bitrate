import type { Prisma } from '@prisma/client'

/** Scalar artist fields that are safe to expose outside authentication internals. */
export const PUBLIC_ARTIST_SELECT = {
  id: true,
  username: true,
  bio: true,
  avatar: true,
  backgroundImage: true,
  verified: true,
  monthlyListeners: true,
  country: true,
  socials: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ArtistSelect
