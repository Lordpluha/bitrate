import { PrismaService } from '@infra/prisma/prisma.service'
import type { UserEntity } from '@modules/users'
import { Injectable } from '@nestjs/common'

const TRACK_SELECT = {
  id: true,
  title: true,
  cover: true,
  duration: true,
  artistId: true,
  artist: { select: { id: true, username: true, avatar: true } },
} as const

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async record(userId: UserEntity['id'], trackId: string) {
    return await this.prisma.listeningHistory.create({
      data: { userId, trackId },
      select: { id: true, listenedAt: true },
    })
  }

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

  async clearAll(userId: UserEntity['id']) {
    await this.prisma.listeningHistory.deleteMany({ where: { userId } })
  }

  async removeTrack(userId: UserEntity['id'], trackId: string) {
    await this.prisma.listeningHistory.deleteMany({ where: { userId, trackId } })
  }
}
