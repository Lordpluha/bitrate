import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { findOwnedRelease } from './find-owned-release'
import { stepDate } from './generation'

const STEP_SELECT = {
  id: true,
  position: true,
  offsetDays: true,
  phase: true,
  kind: true,
  channels: true,
  title: true,
  body: true,
  state: true,
  aiGenerated: true,
} as const

/** Reads a release's latest plan version with every step dated from the current release date. */
@Injectable()
export class PlanViewService {
  constructor(private readonly prisma: PrismaService) {}

  async view(artistId: string, releaseId: string) {
    const { scheduledAt } = await findOwnedRelease(this.prisma, artistId, releaseId)
    const plan = await this.prisma.promotionPlan.findFirst({
      where: { releaseId },
      orderBy: { version: 'desc' },
      select: {
        id: true,
        version: true,
        status: true,
        failure: true,
        createdAt: true,
        steps: { orderBy: { position: 'asc' }, select: STEP_SELECT },
      },
    })
    if (!plan) throw new NotFoundException(PROMOTION_ERRORS.PLAN_NOT_FOUND)
    return {
      ...plan,
      releaseDate: scheduledAt,
      steps: plan.steps.map((step) => ({
        ...step,
        dueAt: scheduledAt ? stepDate(scheduledAt, step.offsetDays) : null,
      })),
    }
  }
}
