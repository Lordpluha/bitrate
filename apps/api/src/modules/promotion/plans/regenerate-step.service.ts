import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import {
  PromotionGenerator,
  PromotionModelUnavailableError,
  PromotionOutputRejectedError,
} from '../ai/generator'
import { InputModerationService } from '../moderation'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  buildStepRequest,
  RELEASE_CONTEXT_SELECT,
  STEP_SYSTEM_PROMPT,
  StepOutputSchema,
  stepText,
  toReleaseFacts,
} from './generation'

const STEP_SOURCE_SELECT = {
  regenerating: true,
  offsetDays: true,
  kind: true,
  channels: true,
  title: true,
  body: true,
  plan: { select: { release: { select: RELEASE_CONTEXT_SELECT } } },
} as const

/** Job body: rewrites one SUGGESTED step; on failure the old text stays and the reason is kept. */
@Injectable()
export class RegenerateStepService {
  private readonly logger = new Logger(RegenerateStepService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: PromotionGenerator,
    private readonly moderation: InputModerationService,
  ) {}

  async regenerate(stepId: string, hint?: string): Promise<void> {
    const step = await this.prisma.promotionPlanStep.findUnique({
      where: { id: stepId },
      select: STEP_SOURCE_SELECT,
    })
    if (!step?.regenerating) return // settled already, or deleted
    const { release } = step.plan
    const profile = release.owner.promotionProfile
    if (release.deletedAt || !release.scheduledAt || !profile) {
      await this.fail(stepId, PROMOTION_ERRORS.GENERATION_UNAVAILABLE)
      return
    }
    const artistId = release.owner.id
    try {
      const artistWrote = [hint ?? null, profile.audience, ...profile.voiceExamples]
      if (!(await this.moderation.isAllowed(artistId, artistWrote))) {
        await this.fail(stepId, PROMOTION_ERRORS.INPUT_REJECTED)
        return
      }
      const facts = toReleaseFacts(release, release.scheduledAt)
      const request = buildStepRequest(facts, profile, step, hint)
      const { output } = await this.generator.generate({
        artistId,
        task: 'plan',
        schema: StepOutputSchema,
        system: STEP_SYSTEM_PROMPT,
        ...request,
        textOf: stepText,
      })
      // The artist may not act on a regenerating step, so it is still SUGGESTED here.
      await this.prisma.promotionPlanStep.updateMany({
        where: { id: stepId, state: 'SUGGESTED', regenerating: true },
        data: { title: output.title, body: output.body, regenerating: false },
      })
    } catch (error: unknown) {
      if (error instanceof PromotionModelUnavailableError) {
        await this.fail(stepId, PROMOTION_ERRORS.GENERATION_UNAVAILABLE)
      } else if (error instanceof PromotionOutputRejectedError) {
        await this.fail(stepId, PROMOTION_ERRORS.GENERATION_REJECTED)
      } else {
        throw error
      }
    }
  }

  /** Clears the running flag and keeps why; also used when the job gives up after retries. */
  async fail(stepId: string, failure: string) {
    this.logger.warn(`Promotion step ${stepId} regeneration failed: ${failure}`)
    await this.prisma.promotionPlanStep.updateMany({
      where: { id: stepId, regenerating: true },
      data: { regenerating: false, regenerationFailure: failure },
    })
  }
}
