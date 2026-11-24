import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ConflictException } from '@nestjs/common'
import { makeQueueMock, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { Queue } from 'bullmq'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { AiQuotaExceededException, type AiQuotaService } from '../usage'
import { PlanViewService } from './plan-view.service'
import { RequestStepRegenerationService } from './request-step-regeneration.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const RELEASE = 'b0000000-0000-7000-8000-000000000001'
const PLAN = 'c0000000-0000-7000-8000-000000000001'
const STEP = 'd0000000-0000-7000-8000-000000000001'

describe('RequestStepRegenerationService', () => {
  let prisma: PrismaMock
  let queue: ReturnType<typeof makeQueueMock>
  let quota: { assertAvailable: jest.Mock }
  let service: RequestStepRegenerationService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    queue = makeQueueMock()
    quota = { assertAvailable: jest.fn(() => Promise.resolve()) }
    service = new RequestStepRegenerationService(
      prisma,
      quota as unknown as AiQuotaService,
      new PlanViewService(prisma),
      queue as unknown as Queue,
    )
    prisma.release.findFirst.mockResolvedValue({ scheduledAt: new Date() } as never)
    prisma.promotionPlanStep.findFirst.mockResolvedValue({
      id: STEP,
      planId: PLAN,
      state: 'SUGGESTED',
    } as never)
    prisma.promotionPlan.findFirst
      .mockResolvedValueOnce({ id: PLAN, version: 1, status: 'READY' } as never)
      .mockResolvedValue({ id: PLAN, steps: [] } as never)
  })

  it('marks a suggested step as regenerating and queues the job with the hint', async () => {
    prisma.promotionPlanStep.updateMany.mockResolvedValue({ count: 1 })
    await service.request(ARTIST, RELEASE, STEP, 'shorter')
    expect(prisma.promotionPlanStep.updateMany).toHaveBeenCalledWith({
      where: { id: STEP, state: 'SUGGESTED', regenerating: false },
      data: { regenerating: true, regenerationFailure: null },
    })
    expect(queue.add).toHaveBeenCalledWith(
      'regenerate-step',
      { stepId: STEP, hint: 'shorter' },
      expect.objectContaining({ attempts: 2 }),
    )
  })

  it('refuses a step the artist already acted on', async () => {
    prisma.promotionPlanStep.findFirst.mockResolvedValue({
      id: STEP,
      planId: PLAN,
      state: 'APPROVED',
    } as never)
    await expect(service.request(ARTIST, RELEASE, STEP)).rejects.toThrow(
      new ConflictException(PROMOTION_ERRORS.STEP_CHANGED),
    )
    expect(queue.add).not.toHaveBeenCalled()
  })

  it('refuses a second regeneration of the same step', async () => {
    prisma.promotionPlanStep.updateMany.mockResolvedValue({ count: 0 })
    await expect(service.request(ARTIST, RELEASE, STEP)).rejects.toThrow(
      new ConflictException(PROMOTION_ERRORS.STEP_REGENERATING),
    )
    expect(queue.add).not.toHaveBeenCalled()
  })

  it('checks the allowance before touching the step', async () => {
    quota.assertAvailable.mockImplementation(() =>
      Promise.reject(new AiQuotaExceededException(new Date())),
    )
    await expect(service.request(ARTIST, RELEASE, STEP)).rejects.toBeInstanceOf(
      AiQuotaExceededException,
    )
    expect(prisma.promotionPlanStep.updateMany).not.toHaveBeenCalled()
  })
})
