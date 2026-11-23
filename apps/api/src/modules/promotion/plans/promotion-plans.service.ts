import { PrismaService } from '@infra/prisma/prisma.service'
import { RELEASE_ERRORS } from '@modules/releases/errors'
import { InjectQueue } from '@nestjs/bullmq'
import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Prisma, type PromotionStepState } from '@prisma/client'
import type { Queue } from 'bullmq'
import {
  PromotionGenerator,
  PromotionModelUnavailableError,
  PromotionOutputRejectedError,
} from '../ai/promotion-generator'
import type { UpdatePromotionStepInput } from '../dtos/promotion.dto'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  type GeneratePlanJob,
  PROMOTION_JOB_OPTIONS,
  PROMOTION_JOBS,
  PROMOTION_QUEUE,
} from '../promotion.queue'
import { AiQuotaService } from '../usage/ai-quota.service'
import {
  buildPlanRequest,
  normaliseSteps,
  PLAN_SYSTEM_PROMPT,
  PlanOutputSchema,
  planText,
  stepDate,
} from './plan-generation'

/** Steps the artist acted on; a regeneration carries them into the next version unchanged. */
const KEPT_STATES: PromotionStepState[] = ['APPROVED', 'EDITED', 'DONE']

/** Which states each action may start from (spec D-13, D-21). */
const TRANSITIONS: Record<UpdatePromotionStepInput['action'], PromotionStepState[]> = {
  approve: ['SUGGESTED'],
  edit: ['SUGGESTED', 'APPROVED', 'EDITED'],
  reject: ['SUGGESTED', 'APPROVED', 'EDITED'],
  done: ['APPROVED', 'EDITED'],
}

/** The state each non-edit action leads to. */
const TARGET_STATE: Record<
  Exclude<UpdatePromotionStepInput['action'], 'edit'>,
  PromotionStepState
> = { approve: 'APPROVED', reject: 'REJECTED', done: 'DONE' }

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

/** Per-release promotion plans: request a version, fill it from the model, act on its steps. */
@Injectable()
export class PromotionPlansService {
  private readonly logger = new Logger(PromotionPlansService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: AiQuotaService,
    private readonly generator: PromotionGenerator,
    @InjectQueue(PROMOTION_QUEUE) private readonly queue: Queue,
  ) {}

  /**
   * Starts a new plan version: the release needs a date, the artist a profile and allowance,
   * and no other version may be generating. Kept steps are copied before the job runs.
   */
  async request(artistId: string, releaseId: string) {
    const release = await this.ownedRelease(artistId, releaseId)
    if (!release.scheduledAt) throw new ConflictException(PROMOTION_ERRORS.RELEASE_DATE_REQUIRED)
    const profile = await this.prisma.artistPromotionProfile.findUnique({
      where: { artistId },
      select: { artistId: true },
    })
    if (!profile) throw new ConflictException(PROMOTION_ERRORS.PROFILE_REQUIRED)
    const latest = await this.latestPlan(releaseId)
    if (latest?.status === 'GENERATING') {
      throw new ConflictException(PROMOTION_ERRORS.PLAN_GENERATING)
    }
    await this.quota.assertAvailable(artistId)

    const plan = await this.prisma
      .$transaction(async (tx) => {
        const created = await tx.promotionPlan.create({
          data: { releaseId, version: (latest?.version ?? 0) + 1 },
          select: { id: true },
        })
        if (latest) {
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
        }
        return created
      })
      .catch((error: unknown) => {
        // Two requests at once: the unique (releaseId, version) lets only one through.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictException(PROMOTION_ERRORS.PLAN_GENERATING)
        }
        throw error
      })
    const job: GeneratePlanJob = { planId: plan.id }
    await this.queue.add(PROMOTION_JOBS.GENERATE_PLAN, job, {
      ...PROMOTION_JOB_OPTIONS,
      jobId: `plan-${plan.id}`,
    })
    return this.view(artistId, releaseId)
  }

  /** Job body: asks the model for suggested steps and settles the plan as READY or FAILED. */
  async generate(planId: string): Promise<void> {
    const plan = await this.prisma.promotionPlan.findUnique({
      where: { id: planId },
      select: {
        status: true,
        steps: {
          select: { offsetDays: true, kind: true, title: true },
          orderBy: { position: 'asc' },
        },
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
            owner: {
              select: { id: true, username: true, bio: true, promotionProfile: true },
            },
          },
        },
      },
    })
    if (plan?.status !== 'GENERATING') return // settled already, or deleted
    const { release } = plan
    const profile = release.owner.promotionProfile
    if (release.deletedAt || !release.scheduledAt || !profile) {
      await this.fail(planId, PROMOTION_ERRORS.GENERATION_UNAVAILABLE)
      return
    }
    const { prompt, facts } = buildPlanRequest(
      {
        title: release.title,
        type: release.type,
        scheduledAt: release.scheduledAt,
        trackTitles: release.trackDrafts.map((draft) => draft.title),
        genres: [...new Set(release.trackDrafts.flatMap((d) => d.genres.map((g) => g.genre.name)))],
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
        this.prisma.promotionPlanStep.createMany({
          data: rows.map((row) => ({ ...row, planId })),
        }),
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

  /** The latest plan version with every step dated from the release's current date. */
  async view(artistId: string, releaseId: string) {
    const release = await this.ownedRelease(artistId, releaseId)
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
    const { scheduledAt } = release
    return {
      ...plan,
      releaseDate: scheduledAt,
      steps: plan.steps.map((step) => ({
        ...step,
        dueAt: scheduledAt ? stepDate(scheduledAt, step.offsetDays) : null,
      })),
    }
  }

  /** Approve, edit, reject or finish a step of the latest plan version. */
  async updateStep(
    artistId: string,
    releaseId: string,
    stepId: string,
    input: UpdatePromotionStepInput,
  ) {
    await this.ownedRelease(artistId, releaseId)
    const step = await this.prisma.promotionPlanStep.findFirst({
      where: { id: stepId, plan: { releaseId } },
      select: { planId: true },
    })
    if (!step) throw new NotFoundException(PROMOTION_ERRORS.STEP_NOT_FOUND)
    const latest = await this.latestPlan(releaseId)
    if (latest?.id !== step.planId) throw new ConflictException(PROMOTION_ERRORS.PLAN_NOT_LATEST)

    const data: Prisma.PromotionPlanStepUpdateManyMutationInput =
      input.action === 'edit'
        ? {
            state: 'EDITED',
            aiGenerated: false,
            ...(input.title !== undefined && { title: input.title }),
            ...(input.body !== undefined && { body: input.body }),
          }
        : { state: TARGET_STATE[input.action] }
    const { count } = await this.prisma.promotionPlanStep.updateMany({
      where: { id: stepId, state: { in: TRANSITIONS[input.action] } },
      data,
    })
    if (count === 0) throw new ConflictException(PROMOTION_ERRORS.STEP_CHANGED)
    return this.view(artistId, releaseId)
  }

  private async ownedRelease(artistId: string, releaseId: string) {
    const release = await this.prisma.release.findFirst({
      where: { id: releaseId, ownerArtistId: artistId, deletedAt: null },
      select: { scheduledAt: true },
    })
    if (!release) throw new NotFoundException(RELEASE_ERRORS.NOT_FOUND)
    return release
  }

  private latestPlan(releaseId: string) {
    return this.prisma.promotionPlan.findFirst({
      where: { releaseId },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, status: true },
    })
  }
}
