import { beforeEach, describe, expect, it } from '@jest/globals'
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { PROMOTION_ERRORS, PROMOTION_VALIDATION } from '../promotion.errors'
import { PostsViewService } from './posts-view.service'
import { UpdatePostService } from './update-post.service'
import { UpdateTranslationService } from './update-translation.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const RELEASE = 'b0000000-0000-7000-8000-000000000001'
const PLAN = 'c0000000-0000-7000-8000-000000000001'
const STEP = 'd0000000-0000-7000-8000-000000000001'
const POST = 'e0000000-0000-7000-8000-000000000001'
const TRANSLATION = 'f0000000-0000-7000-8000-000000000001'

describe('post and translation edits', () => {
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    prisma.release.findFirst.mockResolvedValue({ scheduledAt: new Date() } as never)
    prisma.promotionPlan.findFirst.mockResolvedValue({
      id: PLAN,
      version: 1,
      status: 'READY',
    } as never)
    prisma.promotionPlanStep.findFirst.mockResolvedValue({ id: STEP, planId: PLAN } as never)
    prisma.promotionPlanStep.findUniqueOrThrow.mockResolvedValue({
      postsStatus: 'READY',
      postsFailure: null,
      posts: [],
    } as never)
    prisma.$transaction.mockResolvedValue([] as never)
  })

  describe('UpdatePostService', () => {
    const service = () => new UpdatePostService(prisma, new PostsViewService(prisma))

    it('refuses a master over its channel limit', async () => {
      prisma.promotionPost.findFirst.mockResolvedValue({ channel: 'TIKTOK' } as never)
      await expect(
        service().update(ARTIST, RELEASE, STEP, POST, { text: 'x'.repeat(601) }),
      ).rejects.toThrow(new BadRequestException(PROMOTION_VALIDATION.POST_TOO_LONG))
    })

    it('bumps the revision and makes machine and edited translations STALE', async () => {
      prisma.promotionPost.findFirst.mockResolvedValue({ channel: 'INSTAGRAM' } as never)
      await service().update(ARTIST, RELEASE, STEP, POST, { text: 'New master' })
      expect(prisma.promotionPost.update).toHaveBeenCalledWith({
        where: { id: POST },
        data: { text: 'New master', aiGenerated: false, revision: { increment: 1 } },
      })
      expect(prisma.promotionPostTranslation.updateMany).toHaveBeenCalledWith({
        where: { postId: POST, state: { in: ['MACHINE', 'EDITED'] } },
        data: { state: 'STALE' },
      })
    })

    it('hides a post of another step', async () => {
      prisma.promotionPost.findFirst.mockResolvedValue(null)
      await expect(service().update(ARTIST, RELEASE, STEP, POST, { text: 'x' })).rejects.toThrow(
        new NotFoundException(PROMOTION_ERRORS.POST_NOT_FOUND),
      )
    })
  })

  describe('UpdateTranslationService', () => {
    const service = () => new UpdateTranslationService(prisma, new PostsViewService(prisma))

    it('makes an edit EDITED against the current master revision', async () => {
      prisma.promotionPostTranslation.findFirst.mockResolvedValue({
        state: 'STALE',
        post: { revision: 4 },
      } as never)
      prisma.promotionPostTranslation.updateMany.mockResolvedValue({ count: 1 })
      await service().update(ARTIST, RELEASE, STEP, TRANSLATION, { text: 'Новий текст' })
      expect(prisma.promotionPostTranslation.updateMany).toHaveBeenCalledWith({
        where: { id: TRANSLATION, state: { not: 'TRANSLATING' } },
        data: { text: 'Новий текст', state: 'EDITED', aiGenerated: false, sourceRevision: 4 },
      })
    })

    it('refuses to change a translation still being made', async () => {
      prisma.promotionPostTranslation.findFirst.mockResolvedValue({
        state: 'TRANSLATING',
        post: { revision: 1 },
      } as never)
      await expect(
        service().update(ARTIST, RELEASE, STEP, TRANSLATION, { rating: 1 }),
      ).rejects.toThrow(new ConflictException(PROMOTION_ERRORS.TRANSLATION_BUSY))
    })
  })
})
