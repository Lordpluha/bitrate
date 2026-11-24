import { PrismaService } from '@infra/prisma/prisma.service'
import { InjectQueue } from '@nestjs/bullmq'
import { ConflictException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { Queue } from 'bullmq'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  type GeneratePlanJob,
  PROMOTION_JOB_OPTIONS,
  PROMOTION_JOBS,
  PROMOTION_QUEUE,
} from '../promotion.queue'
import { AiQuotaService } from '../usage'
import { findLatestPlan } from './find-latest-plan'
import { findOwnedRelease } from './find-owned-release'
import { PlanViewService } from './plan-view.service'
import { KEPT_STATES } from './step-transitions'

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'

/** Starts a new plan version and queues its generation (spec D-11, D-13). */
@Injectable()
export class RequestPlanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: AiQuotaService,
    private readonly views: PlanViewService,
    @InjectQueue(PROMOTION_QUEUE) private readonly queue: Queue,
  ) {}

  /**
   * The release needs a date, the artist a profile and allowance, and no other version may be
   * generating. Kept steps are copied into the new version before the job runs.
   */
  async request(artistId: string, releaseId: string) {
    const release = await findOwnedRelease(this.prisma, artistId, releaseId)
    if (!release.scheduledAt) throw new ConflictException(PROMOTION_ERRORS.RELEASE_DATE_REQUIRED)
    const profile = await this.prisma.artistPromotionProfile.findUnique({
      where: { artistId },
      select: { artistId: true },
    })
    if (!profile) throw new ConflictException(PROMOTION_ERRORS.PROFILE_REQUIRED)
    const latest = await findLatestPlan(this.prisma, releaseId)
    if (latest?.status === 'GENERATING') {
      throw new ConflictException(PROMOTION_ERRORS.PLAN_GENERATING)
    }
    await this.quota.assertAvailable(artistId)

    const plan = await this.createVersion(releaseId, latest).catch((error: unknown) => {
      // Two requests at once: the unique (releaseId, version) lets only one through.
      if (isUniqueViolation(error)) throw new ConflictException(PROMOTION_ERRORS.PLAN_GENERATING)
      throw error
    })
    const job: GeneratePlanJob = { planId: plan.id }
    await this.queue.add(PROMOTION_JOBS.GENERATE_PLAN, job, {
      ...PROMOTION_JOB_OPTIONS,
      jobId: `plan-${plan.id}`,
    })
    return this.views.view(artistId, releaseId)
  }

  private createVersion(releaseId: string, latest: { id: string; version: number } | null) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.promotionPlan.create({
        data: { releaseId, version: (latest?.version ?? 0) + 1 },
        select: { id: true },
      })
      if (!latest) return created
      const kept = await tx.promotionPlanStep.findMany({
        where: { planId: latest.id, state: { in: KEPT_STATES } },
        orderBy: { position: 'asc' },
      })
      await tx.promotionPlanStep.createMany({
        data: kept.map(({ id: _id, planId: _plan, updatedAt: _at, ...step }, position) => ({
          ...step,
          planId: created.id,
          position,
        })),
      })
      return created
    })
  }
}
