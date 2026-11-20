import { normalizePagination } from '@common/pagination'
import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { NotInterestedType, TasteExclusionType } from '@prisma/client'
import { RECOMMENDATION_ERRORS } from './errors'

const ITEM_SELECT = { entityType: true, entityId: true, createdAt: true } as const
const NEWEST_FIRST = [{ createdAt: 'desc' }, { entityId: 'asc' }] as const

/** The ids a recommendation surface leaves out for one listener. */
export type HiddenIds = {
  trackIds: string[]
  artistIds: string[]
}

/** One page of a listener's taste feedback. */
export type TastePage<Type extends string> = {
  data: Array<{ entityType: Type; entityId: string; createdAt: Date }>
  total: number
  page: number
  limit: number
}

/**
 * The listener's explicit taste feedback: "Not interested" (never recommend this track or
 * artist) and "Don't use for my taste" (plays of this track, or from this playlist or album, do
 * not shape recommendations). Both are idempotent toggles.
 */
@Injectable()
export class TasteService {
  constructor(private readonly prisma: PrismaService) {}

  async markNotInterested(userId: string, entityType: NotInterestedType, entityId: string) {
    const exists =
      entityType === 'TRACK'
        ? await this.prisma.track.findFirst({
            where: { id: entityId, deletedAt: null },
            select: { id: true },
          })
        : await this.prisma.artist.findFirst({
            where: { id: entityId, deletedAt: null },
            select: { id: true },
          })
    if (!exists) throw new NotFoundException(RECOMMENDATION_ERRORS.ENTITY_NOT_FOUND)

    const key = { userId, entityType, entityId }
    await this.prisma.notInterested.upsert({
      where: { userId_entityType_entityId: key },
      create: key,
      update: {},
    })
  }

  async unmarkNotInterested(userId: string, entityType: NotInterestedType, entityId: string) {
    await this.prisma.notInterested.deleteMany({ where: { userId, entityType, entityId } })
  }

  async listNotInterested(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<TastePage<NotInterestedType>> {
    const pagination = normalizePagination(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.notInterested.findMany({
        where: { userId },
        orderBy: [...NEWEST_FIRST],
        skip: pagination.skip,
        take: pagination.limit,
        select: ITEM_SELECT,
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

  async listExclusions(
    userId: string,
    page?: number,
    limit?: number,
  ): Promise<TastePage<TasteExclusionType>> {
    const pagination = normalizePagination(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.tasteExclusion.findMany({
        where: { userId },
        orderBy: [...NEWEST_FIRST],
        skip: pagination.skip,
        take: pagination.limit,
        select: ITEM_SELECT,
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
