import { PrismaService } from '@infra/prisma/prisma.service'
import { InjectQueue } from '@nestjs/bullmq'
import { ConflictException, Injectable } from '@nestjs/common'
import type { Queue } from 'bullmq'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  type GeneratePostsJob,
  PROMOTION_JOB_OPTIONS,
  PROMOTION_JOBS,
  PROMOTION_QUEUE,
} from '../promotion.queue'
import { AiQuotaService } from '../usage'
import { findOwnedStep } from './find-owned-step'
import { PostsViewService } from './posts-view.service'

/** Starts writing (or rewriting) the English drafts of a POST step in the background. */
@Injectable()
export class RequestPostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: AiQuotaService,
    private readonly views: PostsViewService,
    @InjectQueue(PROMOTION_QUEUE) private readonly queue: Queue,
  ) {}

  async request(artistId: string, releaseId: string, stepId: string) {
    const step = await findOwnedStep(this.prisma, artistId, releaseId, stepId)
    if (step.kind !== 'POST') throw new ConflictException(PROMOTION_ERRORS.STEP_NOT_POST)
    if (step.state === 'REJECTED') throw new ConflictException(PROMOTION_ERRORS.STEP_CLOSED)
    if (step.postsStatus === 'GENERATING') {
      throw new ConflictException(PROMOTION_ERRORS.POSTS_GENERATING)
    }
    await this.quota.assertAvailable(artistId)
    // Guarded on the status so two requests at once start one job.
    const { count } = await this.prisma.promotionPlanStep.updateMany({
      where: { id: stepId, OR: [{ postsStatus: null }, { postsStatus: { not: 'GENERATING' } }] },
      data: { postsStatus: 'GENERATING', postsFailure: null },
    })
    if (count === 0) throw new ConflictException(PROMOTION_ERRORS.POSTS_GENERATING)
    const job: GeneratePostsJob = { stepId }
    await this.queue.add(PROMOTION_JOBS.GENERATE_POSTS, job, PROMOTION_JOB_OPTIONS)
    return this.views.view(artistId, releaseId, stepId)
  }
}
