import { NS, TTL } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import { PUBLIC_TRACK_WHERE } from '@modules/tracks/orm'
import { Injectable } from '@nestjs/common'

/** How big the platform is, as the public landing shows it. */
export type PlatformStats = {
  /** Artist accounts that are not deleted. */
  artists: number
  /** Listener accounts that are not deleted. */
  listeners: number
  /** Tracks a listener can find and play right now. */
  tracks: number
}

/** Public, anonymous platform totals; cached because the landing asks on every visit. */
@Injectable()
export class PlatformStatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  /** Live artist, listener and playable-track counts, recomputed at most every few minutes. */
  getStats(): Promise<PlatformStats> {
    return this.cache.wrap(NS.BROWSE, 'platform-stats', TTL.LONG, async () => {
      const [artists, listeners, tracks] = await Promise.all([
        this.prisma.artist.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.track.count({ where: PUBLIC_TRACK_WHERE }),
      ])
      return { artists, listeners, tracks }
    })
  }
}
