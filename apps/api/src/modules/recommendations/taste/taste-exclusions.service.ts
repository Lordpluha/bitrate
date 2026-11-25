import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { TasteExclusionType } from '@prisma/client'
import { RECOMMENDATION_ERRORS } from '../errors'
import { TASTE_ITEM_SELECT, TASTE_NEWEST_FIRST, type TastePage } from './taste-page'

/**
 * "Don't use for my taste": plays of this track, or plays started from this playlist or album,
 * do not shape the listener's recommendations. An idempotent toggle, applied when signals are
 * read, so it also covers past plays and can be undone.
 */
@Injectable()
export class TasteExclusionsService {
  constructor(private readonly prisma: PrismaService) {}

  async exclude(userId: string, entityType: TasteExclusionType, entityId: string) {
    if (!(await this.canExclude(userId, entityType, entityId))) {
      throw new NotFoundException(RECOMMENDATION_ERRORS.ENTITY_NOT_FOUND)
    }
    const key = { userId, entityType, entityId }
    await this.prisma.tasteExclusion.upsert({
      where: { userId_entityType_entityId: key },
      create: key,
      update: {},
    })
  }

  async include(userId: string, entityType: TasteExclusionType, entityId: string) {
    await this.prisma.tasteExclusion.deleteMany({ where: { userId, entityType, entityId } })
  }

  async list(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<TastePage<TasteExclusionType>> {
    const pagination = normalizePagination(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.tasteExclusion.findMany({
        where: { userId },
        orderBy: [...TASTE_NEWEST_FIRST],
        skip: pagination.skip,
        take: pagination.limit,
        select: TASTE_ITEM_SELECT,
      }),
      this.prisma.tasteExclusion.count({ where: { userId } }),
    ])
    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  /** A deleted item, or someone else's private playlist, reads as missing. */
  private canExclude(
    userId: string,
    entityType: TasteExclusionType,
    entityId: string,
  ): Promise<{ id: string } | null> {
    const byId = { where: { id: entityId, deletedAt: null }, select: { id: true } } as const
    switch (entityType) {
      case 'PLAYLIST':
        return this.prisma.playlist.findFirst({
          where: { id: entityId, deletedAt: null, OR: [{ isPublic: true }, { userId }] },
          select: { id: true },
        })
      case 'ALBUM':
        return this.prisma.album.findFirst(byId)
      case 'TRACK':
        return this.prisma.track.findFirst(byId)
    }
  }
}
