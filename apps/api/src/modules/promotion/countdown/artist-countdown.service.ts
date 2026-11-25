import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import type { PromotionStepState } from '@prisma/client'
import { stepDate } from '../plans/generation'

/** States in which the artist has approved a step. */
const APPROVED_STATES: PromotionStepState[] = ['APPROVED', 'EDITED', 'DONE']

/** What the player's countdown tile may show: never tracks, only the title, cover and date. */
export interface ArtistCountdown {
  releaseId: string
  title: string
  cover: string | null
  releaseAt: Date
}

/**
 * The countdown tile of an artist page (spec "Bitrate-internal channels", AC-11): the soonest
 * unpublished release whose latest plan has an approved COUNTDOWN step that has started. It
 * disappears once the release goes live, and only for artists with promotion enabled.
 */
@Injectable()
export class ArtistCountdownService {
  constructor(private readonly prisma: PrismaService) {}

  async countdown(
    artistId: string,
    now = new Date(),
  ): Promise<{ countdown: ArtistCountdown | null }> {
    const releases = await this.prisma.release.findMany({
      where: {
        ownerArtistId: artistId,
        deletedAt: null,
        publishedAt: null,
        scheduledAt: { gt: now },
        owner: { deletedAt: null, promotionEnabled: true },
      },
      orderBy: { scheduledAt: 'asc' },
      select: {
        id: true,
        title: true,
        cover: true,
        scheduledAt: true,
        promotionPlans: {
          orderBy: { version: 'desc' },
          take: 1,
          select: {
            steps: {
              where: { kind: 'COUNTDOWN', state: { in: APPROVED_STATES } },
              select: { offsetDays: true },
            },
          },
        },
      },
    })
    for (const release of releases) {
      const { scheduledAt } = release
      if (!scheduledAt) continue
      const steps = release.promotionPlans[0]?.steps ?? []
      const started = steps.some((step) => stepDate(scheduledAt, step.offsetDays) <= now)
      if (started) {
        return {
          countdown: {
            releaseId: release.id,
            title: release.title,
            cover: release.cover,
            releaseAt: scheduledAt,
          },
        }
      }
    }
    return { countdown: null }
  }
}
