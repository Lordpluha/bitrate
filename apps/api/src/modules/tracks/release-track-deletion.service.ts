import { NS } from '@infra/cache/cache.constants'
import { CacheService } from '@infra/cache/cache.service'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'

/** Catalogue removal stays in the track domain; the release owns the transaction. */
@Injectable()
export class ReleaseTrackDeletionService {
  constructor(private readonly cache: CacheService) {}

  async remove(tx: Prisma.TransactionClient, trackIds: string[], deletedAt: Date) {
    await tx.track.updateMany({
      where: {
        id: { in: trackIds },
        releases: { none: { release: { deletedAt: null, status: 'RELEASED' } } },
      },
      data: { publishedAt: null },
    })
    await tx.track.updateMany({
      where: { id: { in: trackIds }, releases: { none: { release: { deletedAt: null } } } },
      data: { deletedAt, publishedAt: null, isrc: null },
    })
  }

  async invalidateCaches() {
    await Promise.all([this.cache.invalidate(NS.TRACKS), this.cache.invalidate(NS.SEARCH)])
  }
}
