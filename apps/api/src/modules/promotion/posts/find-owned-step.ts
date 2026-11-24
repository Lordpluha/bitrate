import type { PrismaService } from '@infra/prisma/prisma.service'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { findLatestPlan } from '../plans/find-latest-plan'
import { findOwnedRelease } from '../plans/find-owned-release'
import { PROMOTION_ERRORS } from '../promotion.errors'

/** A step of the caller's release, on the latest plan version; older versions are read-only. */
export async function findOwnedStep(
  prisma: PrismaService,
  artistId: string,
  releaseId: string,
  stepId: string,
) {
  await findOwnedRelease(prisma, artistId, releaseId)
  const step = await prisma.promotionPlanStep.findFirst({
    where: { id: stepId, plan: { releaseId } },
    select: { id: true, planId: true, kind: true, state: true, postsStatus: true },
  })
  if (!step) throw new NotFoundException(PROMOTION_ERRORS.STEP_NOT_FOUND)
  const latest = await findLatestPlan(prisma, releaseId)
  if (latest?.id !== step.planId) throw new ConflictException(PROMOTION_ERRORS.PLAN_NOT_LATEST)
  return step
}
