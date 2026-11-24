import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import {
  PromotionGenerator,
  PromotionModelUnavailableError,
  PromotionOutputRejectedError,
} from '../ai/generator'
import { PromotionEventsService } from '../events'
import { InputModerationService } from '../moderation'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  buildPlanRequest,
  normaliseSteps,
  PLAN_SYSTEM_PROMPT,
  PlanOutputSchema,
  planText,
  RELEASE_CONTEXT_SELECT,
  toReleaseFacts,
} from './generation'

/** Everything a plan generation reads, in one query. */
const PLAN_SOURCE_SELECT = {
  status: true,
  steps: { select: { offsetDays: true, kind: true, title: true }, orderBy: { position: 'asc' } },
  release: { select: RELEASE_CONTEXT_SELECT },
} as const

/** Job body: fills a GENERATING plan version from the model and settles it READY or FAILED. */
@Injectable()
export class GeneratePlanService {
  private readonly logger = new Logger(GeneratePlanService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: PromotionGenerator,
    private readonly moderation: InputModerationService,
    private readonly events: PromotionEventsService,
  ) {}

  async generate(planId: string): Promise<void> {
    const plan = await this.prisma.promotionPlan.findUnique({
      where: { id: planId },
      select: PLAN_SOURCE_SELECT,
    })
    if (plan?.status !== 'GENERATING') return // settled already, or deleted
    const { release } = plan
    const profile = release.owner.promotionProfile
    if (release.deletedAt || !release.scheduledAt || !profile) {
      await this.fail(planId, PROMOTION_ERRORS.GENERATION_UNAVAILABLE)
      return
    }
    const { prompt, facts } = buildPlanRequest(
      toReleaseFacts(release, release.scheduledAt),
      profile,
      plan.steps,
    )
    try {
      const artistWrote = [profile.audience, ...profile.voiceExamples]
      if (!(await this.moderation.isAllowed(release.owner.id, artistWrote))) {
        await this.fail(planId, PROMOTION_ERRORS.INPUT_REJECTED)
        return
      }
      const result = await this.generator.generate({
        artistId: release.owner.id,
        task: 'plan',
        schema: PlanOutputSchema,
        system: PLAN_SYSTEM_PROMPT,
        prompt,
        facts,
        textOf: planText,
      })
      const rows = normaliseSteps(result.output, profile.channels, plan.steps.length)
      await this.prisma.$transaction([
        this.prisma.promotionPlanStep.createMany({ data: rows.map((row) => ({ ...row, planId })) }),
        this.prisma.promotionPlan.update({
          where: { id: planId },
          data: { status: 'READY', model: result.model },
        }),
      ])
      await this.events.record(release.owner.id, 'promotion.plan.generated', planId, {
        steps: rows.length,
      })
    } catch (error: unknown) {
      if (error instanceof PromotionModelUnavailableError) {
        await this.fail(planId, PROMOTION_ERRORS.GENERATION_UNAVAILABLE)
      } else if (error instanceof PromotionOutputRejectedError) {
        await this.fail(planId, PROMOTION_ERRORS.GENERATION_REJECTED)
      } else {
        throw error
      }
    }
  }

  /** Marks a plan FAILED; also used when a job gives up after its retries. */
  async fail(planId: string, failure: string) {
    this.logger.warn(`Promotion plan ${planId} failed: ${failure}`)
    await this.prisma.promotionPlan.updateMany({
      where: { id: planId, status: 'GENERATING' },
      data: { status: 'FAILED', failure },
    })
  }
}
