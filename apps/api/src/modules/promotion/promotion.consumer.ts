import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { type Job, UnrecoverableError } from 'bullmq'
import { GeneratePlanService, RegenerateStepService } from './plans'
import { GeneratePostsService, RunTranslationService } from './posts'
import { PROMOTION_ERRORS } from './promotion.errors'
import {
  PROMOTION_JOBS,
  PROMOTION_QUEUE,
  parseGeneratePlanJob,
  parseGeneratePostsJob,
  parseRegenerateStepJob,
  parseTranslatePostJob,
} from './promotion.queue'

/** Runs promotion model jobs; whatever a job was filling is settled as FAILED if it gives up. */
@Injectable()
@Processor(PROMOTION_QUEUE)
export class PromotionConsumer extends WorkerHost {
  private readonly logger = new Logger(PromotionConsumer.name)

  constructor(
    private readonly plans: GeneratePlanService,
    private readonly posts: GeneratePostsService,
    private readonly translations: RunTranslationService,
    private readonly steps: RegenerateStepService,
  ) {
    super()
  }

  async process(job: Job) {
    switch (job.name) {
      case PROMOTION_JOBS.GENERATE_PLAN:
        await this.plans.generate(this.parse(job, parseGeneratePlanJob).planId)
        return
      case PROMOTION_JOBS.GENERATE_POSTS:
        await this.posts.generate(this.parse(job, parseGeneratePostsJob).stepId)
        return
      case PROMOTION_JOBS.TRANSLATE_POST:
        await this.translations.run(this.parse(job, parseTranslatePostJob).translationId)
        return
      case PROMOTION_JOBS.REGENERATE_STEP: {
        const { stepId, hint } = this.parse(job, parseRegenerateStepJob)
        await this.steps.regenerate(stepId, hint)
        return
      }
      default:
        this.logger.warn(`Ignoring unknown promotion job ${job.name}`)
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, error: Error) {
    if (!job) return
    const finalAttempt = job.attemptsMade >= (job.opts.attempts ?? 1)
    if (!(finalAttempt || error instanceof UnrecoverableError)) return
    this.logger.error(`Promotion job ${job.name} ${job.id} failed: ${error.message}`)
    const failure = PROMOTION_ERRORS.GENERATION_UNAVAILABLE
    if (job.name === PROMOTION_JOBS.GENERATE_PLAN) {
      const parsed = parseGeneratePlanJob(job.data)
      if (parsed.success) await this.plans.fail(parsed.data.planId, failure)
    } else if (job.name === PROMOTION_JOBS.GENERATE_POSTS) {
      const parsed = parseGeneratePostsJob(job.data)
      if (parsed.success) await this.posts.fail(parsed.data.stepId, failure)
    } else if (job.name === PROMOTION_JOBS.TRANSLATE_POST) {
      const parsed = parseTranslatePostJob(job.data)
      if (parsed.success) await this.translations.fail(parsed.data.translationId)
    } else if (job.name === PROMOTION_JOBS.REGENERATE_STEP) {
      const parsed = parseRegenerateStepJob(job.data)
      if (parsed.success) await this.steps.fail(parsed.data.stepId, failure)
    }
  }

  private parse<T>(
    job: Job,
    parser: (data: unknown) => { success: true; data: T } | { success: false },
  ): T {
    const parsed = parser(job.data)
    if (!parsed.success) throw new UnrecoverableError(`Malformed ${job.name} job ${job.id}`)
    return parsed.data
  }
}
