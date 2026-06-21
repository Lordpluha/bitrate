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

    const latestTracks = await this.prisma.listeningHistory.groupBy({
      by: ['trackId'],
      where: { userId },
      _max: { listenedAt: true },
      orderBy: { _max: { listenedAt: 'desc' } },
      skip,
      take: limit,
    })

    return await Promise.all(
      latestTracks.map(({ trackId }) =>
        this.prisma.listeningHistory.findFirstOrThrow({
          where: { userId, trackId },
          orderBy: { listenedAt: 'desc' },
          select: {
            id: true,
            listenedAt: true,
            track: { select: TRACK_SELECT },
          },
        }),
      ),
    )
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
