import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { NotInterestedType } from '@prisma/client'
import { RECOMMENDATION_ERRORS } from '../errors'
import { TASTE_ITEM_SELECT, TASTE_NEWEST_FIRST, type TastePage } from './taste-page'

/** The ids a recommendation surface leaves out for one listener. */
export type HiddenIds = {
  trackIds: string[]
  artistIds: string[]
}

/**
 * "Not interested": the listener never gets this track or artist recommended. An idempotent
 * toggle; every recommendation surface reads {@link NotInterestedService.hiddenIds}.
 */
@Injectable()
export class NotInterestedService {
  constructor(private readonly prisma: PrismaService) {}

  async mark(userId: string, entityType: NotInterestedType, entityId: string) {
    const byId = { where: { id: entityId, deletedAt: null }, select: { id: true } } as const
    const exists =
      entityType === 'TRACK'
        ? await this.prisma.track.findFirst(byId)
        : await this.prisma.artist.findFirst(byId)
    if (!exists) throw new NotFoundException(RECOMMENDATION_ERRORS.ENTITY_NOT_FOUND)

    const key = { userId, entityType, entityId }
    await this.prisma.notInterested.upsert({
      where: { userId_entityType_entityId: key },
      create: key,
      update: {},
    })
  }

  async unmark(userId: string, entityType: NotInterestedType, entityId: string) {
    await this.prisma.notInterested.deleteMany({ where: { userId, entityType, entityId } })
  }

  async list(userId: string, page?: number, limit?: number): Promise<TastePage<NotInterestedType>> {
    const pagination = normalizePagination(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.notInterested.findMany({
        where: { userId },
        orderBy: [...TASTE_NEWEST_FIRST],
        skip: pagination.skip,
        take: pagination.limit,
        select: TASTE_ITEM_SELECT,
      }),
      this.prisma.notInterested.count({ where: { userId } }),
    ])
    return { data, total, page: pagination.page, limit: pagination.limit }
  }

  /** Every track and artist the listener marked "Not interested", for filtering a surface. */
  async hiddenIds(userId: string): Promise<HiddenIds> {
    const rows = await this.prisma.notInterested.findMany({
      where: { userId },
      select: { entityType: true, entityId: true },
    })
    return {
      trackIds: rows.filter((row) => row.entityType === 'TRACK').map((row) => row.entityId),
      artistIds: rows.filter((row) => row.entityType === 'ARTIST').map((row) => row.entityId),
    }
  }
}
