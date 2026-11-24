import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import {
  PromotionGenerator,
  PromotionModelUnavailableError,
  PromotionOutputRejectedError,
} from '../ai/generator'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  buildPlanRequest,
  normaliseSteps,
  PLAN_SYSTEM_PROMPT,
  PlanOutputSchema,
  planText,
} from './generation'

/** Everything a plan generation reads, in one query. */
const PLAN_SOURCE_SELECT = {
  status: true,
  steps: { select: { offsetDays: true, kind: true, title: true }, orderBy: { position: 'asc' } },
  release: {
    select: {
      title: true,
      type: true,
      scheduledAt: true,
      deletedAt: true,
      territories: { select: { countryCode: true } },
      trackDrafts: {
        where: { deletedAt: null },
        orderBy: { position: 'asc' },
        select: { title: true, genres: { select: { genre: { select: { name: true } } } } },
      },
      owner: { select: { id: true, username: true, bio: true, promotionProfile: true } },
    },
  },
} as const

/** Job body: fills a GENERATING plan version from the model and settles it READY or FAILED. */
@Injectable()
export class GeneratePlanService {
  private readonly logger = new Logger(GeneratePlanService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: PromotionGenerator,
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
    const drafts = release.trackDrafts
    const { prompt, facts } = buildPlanRequest(
      {
        title: release.title,
        type: release.type,
        scheduledAt: release.scheduledAt,
        trackTitles: drafts.map((draft) => draft.title),
        genres: [...new Set(drafts.flatMap((d) => d.genres.map((g) => g.genre.name)))],
        territories: release.territories.map((t) => t.countryCode),
        artistName: release.owner.username,
        bio: release.owner.bio,
      },
      profile,
      plan.steps,
    )
    try {
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
