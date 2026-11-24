import { PrismaService } from '@infra/prisma/prisma.service'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import type { UpdatePromotionStepInput } from '../dtos'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { findLatestPlan } from './find-latest-plan'
import { findOwnedRelease } from './find-owned-release'
import { PlanViewService } from './plan-view.service'
import { ALLOWED_FROM, TARGET_STATE } from './step-transitions'

const changesFor = (
  input: UpdatePromotionStepInput,
): Prisma.PromotionPlanStepUpdateManyMutationInput =>
  input.action === 'edit'
    ? {
        state: 'EDITED',
        aiGenerated: false,
        ...(input.title !== undefined && { title: input.title }),
        ...(input.body !== undefined && { body: input.body }),
      }
    : { state: TARGET_STATE[input.action] }

/** Approve, edit, reject or finish a step of a release's latest plan version (spec D-21). */
@Injectable()
export class UpdateStepService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly views: PlanViewService,
  ) {}

  async update(
    artistId: string,
    releaseId: string,
    stepId: string,
    input: UpdatePromotionStepInput,
  ) {
    await findOwnedRelease(this.prisma, artistId, releaseId)
    const step = await this.prisma.promotionPlanStep.findFirst({
      where: { id: stepId, plan: { releaseId } },
      select: { planId: true },
    })
    if (!step) throw new NotFoundException(PROMOTION_ERRORS.STEP_NOT_FOUND)
    const latest = await findLatestPlan(this.prisma, releaseId)
    if (latest?.id !== step.planId) throw new ConflictException(PROMOTION_ERRORS.PLAN_NOT_LATEST)

    // The state guard makes the change atomic: two tabs cannot both approve and reject a step.
    const { count } = await this.prisma.promotionPlanStep.updateMany({
      where: { id: stepId, state: { in: ALLOWED_FROM[input.action] } },
      data: changesFor(input),
    })
    if (count === 0) throw new ConflictException(PROMOTION_ERRORS.STEP_CHANGED)
    return this.views.view(artistId, releaseId)
  }
}
