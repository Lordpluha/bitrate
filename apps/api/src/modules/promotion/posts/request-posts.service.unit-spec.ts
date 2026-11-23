import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ConflictException, NotFoundException } from '@nestjs/common'
import { makeQueueMock, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import type { Queue } from 'bullmq'
import { PROMOTION_ERRORS } from '../promotion.errors'
import type { AiQuotaService } from '../usage'
import { PostsViewService } from './posts-view.service'
import { RequestPostsService } from './request-posts.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const RELEASE = 'b0000000-0000-7000-8000-000000000001'
const PLAN = 'c0000000-0000-7000-8000-000000000001'
const STEP = 'd0000000-0000-7000-8000-000000000001'

describe('RequestPostsService', () => {
  let prisma: PrismaMock
  let queue: ReturnType<typeof makeQueueMock>
  let quota: { assertAvailable: jest.Mock }
  let service: RequestPostsService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    queue = makeQueueMock()
    quota = { assertAvailable: jest.fn(() => Promise.resolve()) }
    service = new RequestPostsService(
      prisma,
      quota as unknown as AiQuotaService,
      new PostsViewService(prisma),
      queue as unknown as Queue,
    )
    prisma.release.findFirst.mockResolvedValue({ scheduledAt: new Date() } as never)
    prisma.promotionPlan.findFirst.mockResolvedValue({
      id: PLAN,
      version: 1,
      status: 'READY',
    } as never)
  })

  const step = (over: Record<string, unknown> = {}) =>
    prisma.promotionPlanStep.findFirst.mockResolvedValue({
      id: STEP,
      planId: PLAN,
      kind: 'POST',
      state: 'APPROVED',
      postsStatus: null,
      ...over,
    } as never)

  it('hides a step of another release', async () => {
    prisma.promotionPlanStep.findFirst.mockResolvedValue(null)
    await expect(service.request(ARTIST, RELEASE, STEP)).rejects.toBeInstanceOf(NotFoundException)
  })

  it.each([
    [{ kind: 'ACTION' }, PROMOTION_ERRORS.STEP_NOT_POST],
    [{ state: 'REJECTED' }, PROMOTION_ERRORS.STEP_CLOSED],
    [{ postsStatus: 'GENERATING' }, PROMOTION_ERRORS.POSTS_GENERATING],
  ])('refuses %j', async (over, key) => {
    step(over)
    await expect(service.request(ARTIST, RELEASE, STEP)).rejects.toThrow(new ConflictException(key))
    expect(queue.add).not.toHaveBeenCalled()
  })

  it('marks the drafts GENERATING once and queues one job', async () => {
    step()
    prisma.promotionPlanStep.updateMany.mockResolvedValue({ count: 1 })
    prisma.promotionPlanStep.findUniqueOrThrow.mockResolvedValue({
      postsStatus: 'GENERATING',
      postsFailure: null,
      posts: [],
    } as never)
    const view = await service.request(ARTIST, RELEASE, STEP)
    expect(quota.assertAvailable).toHaveBeenCalledWith(ARTIST)
    expect(prisma.promotionPlanStep.updateMany).toHaveBeenCalledWith({
      where: { id: STEP, OR: [{ postsStatus: null }, { postsStatus: { not: 'GENERATING' } }] },
      data: { postsStatus: 'GENERATING', postsFailure: null },
    })
    expect(queue.add).toHaveBeenCalledWith('generate-posts', { stepId: STEP }, expect.anything())
    expect(view.status).toBe('GENERATING')
  })

  it('loses a race to a concurrent request without queueing twice', async () => {
    step()
    prisma.promotionPlanStep.updateMany.mockResolvedValue({ count: 0 })
    await expect(service.request(ARTIST, RELEASE, STEP)).rejects.toThrow(
      new ConflictException(PROMOTION_ERRORS.POSTS_GENERATING),
    )
    expect(queue.add).not.toHaveBeenCalled()
  })
})
