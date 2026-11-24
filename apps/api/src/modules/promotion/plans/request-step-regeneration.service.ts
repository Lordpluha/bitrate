import { PrismaService } from '@infra/prisma/prisma.service'
import { InjectQueue } from '@nestjs/bullmq'
import { ConflictException, Injectable } from '@nestjs/common'
import type { Queue } from 'bullmq'
import { findOwnedStep } from '../posts/find-owned-step'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  PROMOTION_JOB_OPTIONS,
  PROMOTION_JOBS,
  PROMOTION_QUEUE,
  type RegenerateStepJob,
} from '../promotion.queue'
import { AiQuotaService } from '../usage'
import { PlanViewService } from './plan-view.service'

/**
 * Queues a new suggestion for one step, optionally steered by the artist's hint (spec D-13).
 * Only a step the artist has not acted on yet can be regenerated.
 */
@Injectable()
export class RequestStepRegenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: AiQuotaService,
    private readonly views: PlanViewService,
    @InjectQueue(PROMOTION_QUEUE) private readonly queue: Queue,
  ) {}

  async request(artistId: string, releaseId: string, stepId: string, hint?: string) {
    const step = await findOwnedStep(this.prisma, artistId, releaseId, stepId)
    if (step.state !== 'SUGGESTED') throw new ConflictException(PROMOTION_ERRORS.STEP_CHANGED)
    await this.quota.assertAvailable(artistId)
    // The guard lets only one regeneration of a step run at a time.
    const { count } = await this.prisma.promotionPlanStep.updateMany({
      where: { id: stepId, state: 'SUGGESTED', regenerating: false },
      data: { regenerating: true, regenerationFailure: null },
    })
    if (count === 0) throw new ConflictException(PROMOTION_ERRORS.STEP_REGENERATING)
    const job: RegenerateStepJob = { stepId, ...(hint && { hint }) }
    await this.queue.add(PROMOTION_JOBS.REGENERATE_STEP, job, PROMOTION_JOB_OPTIONS)
    return this.views.view(artistId, releaseId)
  }
}
