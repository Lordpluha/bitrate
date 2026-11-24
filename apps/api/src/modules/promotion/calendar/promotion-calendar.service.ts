import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { stepDate } from '../plans/generation'

const STEP_SELECT = {
  id: true,
  offsetDays: true,
  phase: true,
  kind: true,
  channels: true,
  title: true,
  state: true,
  aiGenerated: true,
} as const

/**
 * The Promotion page calendar (spec D-9): dated steps of the latest plan of every release with
 * a date, across all of the artist's releases. Rejected steps are left out.
 */
@Injectable()
export class PromotionCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  /** Steps due in `[from, to)`, soonest first. */
  async calendar(artistId: string, from: Date, to: Date) {
    const releases = await this.prisma.release.findMany({
      where: { ownerArtistId: artistId, deletedAt: null, scheduledAt: { not: null } },
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
              where: { state: { not: 'REJECTED' } },
              orderBy: { position: 'asc' },
              select: STEP_SELECT,
            },
          },
        },
      },
    })
    return releases
      .flatMap((release) => {
        const { scheduledAt } = release
        if (!scheduledAt) return []
        return (release.promotionPlans[0]?.steps ?? []).map(({ id, ...step }) => ({
          ...step,
          stepId: id,
          releaseId: release.id,
          releaseTitle: release.title,
          cover: release.cover,
          dueAt: stepDate(scheduledAt, step.offsetDays),
        }))
      })
      .filter((entry) => entry.dueAt >= from && entry.dueAt < to)
      .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime())
  }
}
