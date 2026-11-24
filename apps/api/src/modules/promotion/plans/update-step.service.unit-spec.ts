import { beforeEach, describe, expect, it } from '@jest/globals'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { PlanViewService } from './plan-view.service'
import { UpdateStepService } from './update-step.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const RELEASE = 'b0000000-0000-7000-8000-000000000001'
const PLAN = 'c0000000-0000-7000-8000-000000000001'
const STEP = 'd0000000-0000-7000-8000-000000000001'
const DATE = new Date('2026-09-26T18:00:00Z')

describe('UpdateStepService', () => {
  let prisma: PrismaMock
  let service: UpdateStepService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new UpdateStepService(prisma, new PlanViewService(prisma))
    prisma.release.findFirst.mockResolvedValue({ scheduledAt: DATE } as never)
    prisma.promotionPlanStep.findFirst.mockResolvedValue({ planId: PLAN } as never)
  })

  const latest = (id: string) =>
    prisma.promotionPlan.findFirst.mockResolvedValueOnce({
      id,
      version: 2,
      status: 'READY',
    } as never)

  it('hides a step of another release', async () => {
    prisma.promotionPlanStep.findFirst.mockResolvedValue(null)
    await expect(service.update(ARTIST, RELEASE, STEP, { action: 'reject' })).rejects.toThrow(
      new NotFoundException(PROMOTION_ERRORS.STEP_NOT_FOUND),
    )
  })

  it('rejects a step of a replaced version', async () => {
    latest('c0000000-0000-7000-8000-000000000009')
    await expect(service.update(ARTIST, RELEASE, STEP, { action: 'approve' })).rejects.toThrow(
      new ConflictException(PROMOTION_ERRORS.PLAN_NOT_LATEST),
    )
  })

  it('approves only a suggested step', async () => {
    latest(PLAN)
    prisma.promotionPlanStep.updateMany.mockResolvedValue({ count: 0 })
    await expect(service.update(ARTIST, RELEASE, STEP, { action: 'approve' })).rejects.toThrow(
      new ConflictException(PROMOTION_ERRORS.STEP_CHANGED),
    )
    expect(prisma.promotionPlanStep.updateMany).toHaveBeenCalledWith({
      where: { id: STEP, state: { in: ['SUGGESTED'] } },
      data: { state: 'APPROVED' },
    })
  })

  it('marks an edited step as written by the artist and dates it from the release', async () => {
    latest(PLAN)
    prisma.promotionPlanStep.updateMany.mockResolvedValue({ count: 1 })
    prisma.promotionPlan.findFirst.mockResolvedValueOnce({
      id: PLAN,
      version: 2,
      status: 'READY',
      failure: null,
      createdAt: DATE,
      steps: [{ id: STEP, offsetDays: -21, state: 'EDITED' }],
    } as never)
    const view = await service.update(ARTIST, RELEASE, STEP, {
      action: 'edit',
      body: 'Out on Sep 26.',
    })
    expect(prisma.promotionPlanStep.updateMany).toHaveBeenCalledWith({
      where: { id: STEP, state: { in: ['SUGGESTED', 'APPROVED', 'EDITED'] } },
      data: { state: 'EDITED', aiGenerated: false, body: 'Out on Sep 26.' },
    })
    expect(view.steps[0]?.dueAt?.toISOString()).toBe('2026-09-05T18:00:00.000Z')
  })
})
