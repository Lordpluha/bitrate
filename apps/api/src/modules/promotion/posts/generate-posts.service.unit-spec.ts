import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { mockTransaction, type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { type PromotionGenerator, PromotionModelUnavailableError } from '../ai/generator'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { GeneratePostsService } from './generate-posts.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const STEP = 'd0000000-0000-7000-8000-000000000001'
const POST = 'e0000000-0000-7000-8000-000000000001'

describe('GeneratePostsService', () => {
  let prisma: PrismaMock
  let generator: { generate: jest.Mock }
  let service: GeneratePostsService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    mockTransaction(prisma)
    generator = { generate: jest.fn() }
    service = new GeneratePostsService(prisma, generator as unknown as PromotionGenerator)
    prisma.promotionPlanStep.findUnique.mockResolvedValue({
      postsStatus: 'GENERATING',
      title: 'Announce the date',
      body: 'Tell followers.',
      channels: ['INSTAGRAM'],
      plan: {
        release: {
          title: 'Afterglow',
          scheduledAt: new Date('2026-09-26T18:00:00Z'),
          trackDrafts: [{ title: 'Afterglow' }],
          owner: {
            id: ARTIST,
            username: 'demo',
            bio: null,
            promotionProfile: { voiceWords: ['calm'], voiceExamples: [] },
          },
        },
      },
    } as never)
  })

  it('saves one master per requested channel and makes old translations STALE', async () => {
    generator.generate.mockImplementation(() =>
      Promise.resolve({
        model: 'anthropic:claude-sonnet-5-5',
        output: {
          posts: [
            { channel: 'INSTAGRAM', text: 'Afterglow arrives Sep 26.', hashtags: ['#afterglow'] },
            { channel: 'TIKTOK', text: 'Not requested.', hashtags: [] },
          ],
        },
      }),
    )
    prisma.promotionPost.upsert.mockResolvedValue({ id: POST } as never)
    await service.generate(STEP)
    expect(generator.generate).toHaveBeenCalledWith(
      expect.objectContaining({ artistId: ARTIST, task: 'copy' }),
    )
    expect(prisma.promotionPost.upsert).toHaveBeenCalledTimes(1)
    expect(prisma.promotionPost.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stepId_channel: { stepId: STEP, channel: 'INSTAGRAM' } },
        update: expect.objectContaining({ revision: { increment: 1 }, aiGenerated: true }),
      }),
    )
    expect(prisma.promotionPostTranslation.updateMany).toHaveBeenCalledWith({
      where: { postId: POST, state: { in: ['MACHINE', 'EDITED'] } },
      data: { state: 'STALE' },
    })
    expect(prisma.promotionPlanStep.update).toHaveBeenCalledWith({
      where: { id: STEP },
      data: { postsStatus: 'READY' },
    })
  })

  it('settles the drafts as FAILED when no model can write them', async () => {
    generator.generate.mockImplementation(() =>
      Promise.reject(new PromotionModelUnavailableError('copy')),
    )
    await service.generate(STEP)
    expect(prisma.promotionPlanStep.updateMany).toHaveBeenCalledWith({
      where: { id: STEP, postsStatus: 'GENERATING' },
      data: { postsStatus: 'FAILED', postsFailure: PROMOTION_ERRORS.GENERATION_UNAVAILABLE },
    })
    expect(prisma.promotionPost.upsert).not.toHaveBeenCalled()
  })
})
