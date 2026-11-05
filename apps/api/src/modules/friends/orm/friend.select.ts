import { PUBLIC_USER_SELECT } from '@modules/users/orm'
import type { Prisma } from '@prisma/client'

/** A friend plus the player data their presence is derived from. */
export const FRIEND_SELECT = {
  ...PUBLIC_USER_SELECT,
  devices: { orderBy: { lastSeenAt: 'desc' }, take: 1, select: { lastSeenAt: true } },
  playerState: {
    select: {
      isPlaying: true,
      updatedAt: true,
      currentTrack: {
        select: {
          id: true,
          title: true,
          cover: true,
          deletedAt: true,
          processingStatus: true,
          publishedAt: true,
          artist: { select: { id: true, username: true } },
        },
      },
    },
  },
  settings: { select: { privateSession: true, showListeningActivity: true } },
} as const satisfies Prisma.UserSelect
