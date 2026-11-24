import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Injectable, Logger } from '@nestjs/common'
import { type Job, UnrecoverableError } from 'bullmq'
import { GeneratePlanService } from './plans'
import { PROMOTION_ERRORS } from './promotion.errors'
import { PROMOTION_JOBS, PROMOTION_QUEUE, parseGeneratePlanJob } from './promotion.queue'

/** Runs promotion model jobs; a plan whose job gives up is settled as FAILED. */
@Injectable()
@Processor(PROMOTION_QUEUE)
export class PromotionConsumer extends WorkerHost {
  private readonly logger = new Logger(PromotionConsumer.name)

  constructor(private readonly plans: GeneratePlanService) {
    super()
  }

  async process(job: Job) {
    if (job.name !== PROMOTION_JOBS.GENERATE_PLAN) {
      this.logger.warn(`Ignoring unknown promotion job ${job.name}`)
      return
    }
    const parsed = parseGeneratePlanJob(job.data)
    if (!parsed.success) throw new UnrecoverableError(`Malformed ${job.name} job ${job.id}`)
    await this.plans.generate(parsed.data.planId)
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job | undefined, error: Error) {
    if (job?.name !== PROMOTION_JOBS.GENERATE_PLAN) return
    const finalAttempt = job.attemptsMade >= (job.opts.attempts ?? 1)
    if (!(finalAttempt || error instanceof UnrecoverableError)) return
    const parsed = parseGeneratePlanJob(job.data)
    if (!parsed.success) return
    this.logger.error(`Generating promotion plan ${parsed.data.planId} failed: ${error.message}`)
    await this.plans.fail(parsed.data.planId, PROMOTION_ERRORS.GENERATION_UNAVAILABLE)
  }
}
