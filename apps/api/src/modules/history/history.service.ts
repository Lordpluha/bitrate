import { PrismaService } from '@infra/prisma/prisma.service'
import type { UserEntity } from '@modules/users'
import { Injectable } from '@nestjs/common'

/** The track select value. */
const TRACK_SELECT = {
  id: true,
  title: true,
  cover: true,
  duration: true,
  artistId: true,
  artist: { select: { id: true, username: true, avatar: true } },
} as const

/** Represents the history service. */
@Injectable()
export class HistoryService {
  /** Creates a new instance. */
  constructor(private readonly prisma: PrismaService) {}

  /** Runs the record operation. */
  async record(userId: UserEntity['id'], trackId: string) {
    return await this.prisma.listeningHistory.create({
      data: { userId, trackId },
      select: { id: true, listenedAt: true },
    })
  }

  /** Runs the get history operation. */
  async getHistory(userId: UserEntity['id'], page = 1, limit = 20) {
    const skip = (page - 1) * limit

    // One entry per unique track — most recent listen wins
    const rows = await this.prisma.listeningHistory.findMany({
      where: { userId },
      orderBy: { listenedAt: 'desc' },
      select: {
        id: true,
        listenedAt: true,
        track: { select: TRACK_SELECT },
      },
      skip,
      take: limit,
    })

    // Deduplicate: keep first occurrence of each trackId (most recent)
    const seen = new Set<string>()
    return rows.filter(({ track }) => {
      if (seen.has(track.id)) return false
      seen.add(track.id)
      return true
    })
  }

  /** Runs the clear all operation. */
  async clearAll(userId: UserEntity['id']) {
    await this.prisma.listeningHistory.deleteMany({ where: { userId } })
  }

  /** Runs the remove track operation. */
  async removeTrack(userId: UserEntity['id'], trackId: string) {
    await this.prisma.listeningHistory.deleteMany({ where: { userId, trackId } })
  }
}
