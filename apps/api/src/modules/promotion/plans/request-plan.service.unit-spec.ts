import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ConflictException, NotFoundException } from '@nestjs/common'
import {
  makeQueueMock,
  mockTransaction,
  type PrismaMock,
  prismaMock,
  resetPrismaMock,
} from '@test/mocks'
import type { Queue } from 'bullmq'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { AiQuotaExceededException, type AiQuotaService } from '../usage'
import { PlanViewService } from './plan-view.service'
import { RequestPlanService } from './request-plan.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const RELEASE = 'b0000000-0000-7000-8000-000000000001'
const PLAN = 'c0000000-0000-7000-8000-000000000001'
const NEXT = 'c0000000-0000-7000-8000-000000000002'
const DATE = new Date('2026-09-26T18:00:00Z')

describe('RequestPlanService', () => {
  let prisma: PrismaMock
  let queue: ReturnType<typeof makeQueueMock>
  let quota: { assertAvailable: jest.Mock }
  let service: RequestPlanService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    mockTransaction(prisma)
    queue = makeQueueMock()
    quota = { assertAvailable: jest.fn(() => Promise.resolve()) }
    service = new RequestPlanService(
      prisma,
      quota as unknown as AiQuotaService,
      new PlanViewService(prisma),
      queue as unknown as Queue,
    )
    prisma.artistPromotionProfile.findUnique.mockResolvedValue({ artistId: ARTIST } as never)
  })

  const release = (scheduledAt: Date | null = DATE) =>
    prisma.release.findFirst.mockResolvedValue({ scheduledAt } as never)
  const latest = (plan: { id: string; version: number; status: string } | null) =>
    prisma.promotionPlan.findFirst.mockResolvedValue(plan as never)

  it("hides another artist's release", async () => {
    prisma.release.findFirst.mockResolvedValue(null)
    await expect(service.request(ARTIST, RELEASE)).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.release.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: RELEASE, ownerArtistId: ARTIST, deletedAt: null } }),
    )
  })

  it.each([
    ['a release date', () => release(null), PROMOTION_ERRORS.RELEASE_DATE_REQUIRED],
    [
      'a promotion profile',
      () => {
        release()
        prisma.artistPromotionProfile.findUnique.mockResolvedValue(null)
      },
      PROMOTION_ERRORS.PROFILE_REQUIRED,
    ],
    [
      'no version generating',
      () => {
        release()
        latest({ id: PLAN, version: 1, status: 'GENERATING' })
      },
      PROMOTION_ERRORS.PLAN_GENERATING,
    ],
  ])('needs %s', async (_name, arrange, key) => {
    arrange()
    await expect(service.request(ARTIST, RELEASE)).rejects.toThrow(new ConflictException(key))
    expect(queue.add).not.toHaveBeenCalled()
  })

  it('stops at the monthly allowance before creating anything', async () => {
    release()
    latest(null)
    quota.assertAvailable.mockImplementation(() =>
      Promise.reject(new AiQuotaExceededException(new Date('2026-10-01T00:00:00Z'))),
    )
    await expect(service.request(ARTIST, RELEASE)).rejects.toBeInstanceOf(AiQuotaExceededException)
    expect(prisma.promotionPlan.create).not.toHaveBeenCalled()
  })

  it('creates the next version, keeps acted-on steps and queues the generation', async () => {
    release()
    prisma.promotionPlan.findFirst
      .mockResolvedValueOnce({ id: PLAN, version: 2, status: 'READY' } as never)
      .mockResolvedValueOnce({
        id: NEXT,
        version: 3,
        status: 'GENERATING',
        failure: null,
        createdAt: DATE,
        steps: [],
      } as never)
    prisma.promotionPlan.create.mockResolvedValue({ id: NEXT } as never)
    prisma.promotionPlanStep.findMany.mockResolvedValue([
      {
        id: 'd0000000-0000-7000-8000-000000000001',
        planId: PLAN,
        position: 4,
        offsetDays: -21,
        phase: 'PRE',
        kind: 'POST',
        channels: ['INSTAGRAM'],
        title: 'Announce',
        body: 'Out Sep 26',
        state: 'EDITED',
        aiGenerated: false,
        updatedAt: DATE,
      },
    ] as never)

    const view = await service.request(ARTIST, RELEASE)

    expect(prisma.promotionPlan.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { releaseId: RELEASE, version: 3 } }),
    )
    expect(prisma.promotionPlanStep.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { planId: PLAN, state: { in: ['APPROVED', 'EDITED', 'DONE'] } },
      }),
    )
    expect(prisma.promotionPlanStep.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ planId: NEXT, position: 0, state: 'EDITED' })],
    })
    expect(queue.add).toHaveBeenCalledWith(
      'generate-plan',
      { planId: NEXT },
      expect.objectContaining({ jobId: `plan-${NEXT}` }),
    )
    expect(view.status).toBe('GENERATING')
  })
})
