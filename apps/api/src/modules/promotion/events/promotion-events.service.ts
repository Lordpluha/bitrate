import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { PROMOTION_EVENT_VERSIONS, type PromotionEventName } from './promotion-events'

/** Writes promotion product events with their schema version (spec AC-15). */
@Injectable()
export class PromotionEventsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Records that `subjectId` (a plan, step, post or translation) went through `name`. */
  async record(
    artistId: string,
    name: PromotionEventName,
    subjectId: string,
    data?: Prisma.InputJsonObject,
  ): Promise<void> {
    await this.prisma.promotionEvent.create({
      data: {
        artistId,
        name,
        schemaVersion: PROMOTION_EVENT_VERSIONS[name],
        subjectId,
        ...(data && { data }),
      },
    })
  }
}
