import { beforeEach, describe, expect, it } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { PromotionEventsService } from '../events'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { RecordPostActionService } from './record-post-action.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const RELEASE = 'b0000000-0000-7000-8000-000000000001'
const PLAN = 'c0000000-0000-7000-8000-000000000001'
const STEP = 'd0000000-0000-7000-8000-000000000001'
const POST = 'e0000000-0000-7000-8000-000000000001'

describe('RecordPostActionService', () => {
  let prisma: PrismaMock
  let service: RecordPostActionService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    service = new RecordPostActionService(prisma, new PromotionEventsService(prisma))
    prisma.release.findFirst.mockResolvedValue({ scheduledAt: new Date() } as never)
    prisma.promotionPlanStep.findFirst.mockResolvedValue({ id: STEP, planId: PLAN } as never)
    prisma.promotionPlan.findFirst.mockResolvedValue({ id: PLAN, version: 1 } as never)
  })

  it.each([
    ['copied', 'promotion.post.copied'],
    ['exported', 'promotion.post.exported'],
  ] as const)('records a %s post as %s with its channel', async (action, name) => {
    prisma.promotionPost.findFirst.mockResolvedValue({ channel: 'TIKTOK' } as never)
    await service.record(ARTIST, RELEASE, STEP, POST, action)
    expect(prisma.promotionPost.findFirst).toHaveBeenCalledWith({
      where: { id: POST, stepId: STEP },
      select: { channel: true },
    })
    expect(prisma.promotionEvent.create).toHaveBeenCalledWith({
      data: {
        artistId: ARTIST,
        name,
        schemaVersion: 1,
        subjectId: POST,
        data: { channel: 'TIKTOK' },
      },
    })
  })

  it('hides a post of another step', async () => {
    prisma.promotionPost.findFirst.mockResolvedValue(null)
    await expect(service.record(ARTIST, RELEASE, STEP, POST, 'copied')).rejects.toThrow(
      new NotFoundException(PROMOTION_ERRORS.POST_NOT_FOUND),
    )
    expect(prisma.promotionEvent.create).not.toHaveBeenCalled()
  })
})
