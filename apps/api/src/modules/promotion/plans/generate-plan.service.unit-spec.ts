import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import {
  type PromotionGenerator,
  PromotionModelUnavailableError,
  PromotionOutputRejectedError,
} from '../ai/generator'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { GeneratePlanService } from './generate-plan.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const PLAN = 'c0000000-0000-7000-8000-000000000001'
const DATE = new Date('2026-09-26T18:00:00Z')
const post = (offsetDays: number, title: string) => ({
  offsetDays,
  kind: 'POST',
  channels: ['INSTAGRAM'],
  title,
  body: 'Text.',
})

describe('GeneratePlanService', () => {
  let prisma: PrismaMock
  let generator: { generate: jest.Mock }
  let service: GeneratePlanService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    generator = { generate: jest.fn() }
    service = new GeneratePlanService(prisma, generator as unknown as PromotionGenerator)
  })

  const generatingPlan = (status = 'GENERATING') =>
    prisma.promotionPlan.findUnique.mockResolvedValue({
      status,
      steps: [],
      release: {
        title: 'Afterglow',
        type: 'SINGLE',
        scheduledAt: DATE,
        deletedAt: null,
        territories: [{ countryCode: 'UA' }],
        trackDrafts: [{ title: 'Afterglow', genres: [{ genre: { name: 'indie' } }] }],
        owner: {
          id: ARTIST,
          username: 'demo',
          bio: null,
          promotionProfile: {
            goal: 'BUZZ',
            channels: ['INSTAGRAM'],
            weeklyHours: 3,
            countries: ['UA'],
            audience: null,
            voiceWords: [],
            voiceExamples: [],
          },
        },
      },
    } as never)

  it('writes the suggested steps in date order and marks the plan READY', async () => {
    generatingPlan()
    generator.generate.mockImplementation(() =>
      Promise.resolve({
        model: 'anthropic:claude-sonnet-5-5',
        output: {
          steps: [
            post(2, 'Thank listeners'),
            post(-7, 'Share a hook'),
            { ...post(0, 'Tell friends'), kind: 'ACTION', channels: [] },
          ],
        },
      }),
    )
    await service.generate(PLAN)
    expect(generator.generate).toHaveBeenCalledWith(
      expect.objectContaining({ artistId: ARTIST, task: 'plan' }),
    )
    expect(prisma.promotionPlanStep.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ planId: PLAN, position: 0, offsetDays: -7, phase: 'PRE' }),
        expect.objectContaining({ position: 1, offsetDays: 0, phase: 'LAUNCH' }),
        expect.objectContaining({ position: 2, offsetDays: 2, phase: 'POST' }),
      ],
    })
    expect(prisma.promotionPlan.update).toHaveBeenCalledWith({
      where: { id: PLAN },
      data: { status: 'READY', model: 'anthropic:claude-sonnet-5-5' },
    })
  })

  it.each([
    [new PromotionModelUnavailableError('plan'), PROMOTION_ERRORS.GENERATION_UNAVAILABLE],
    [new PromotionOutputRejectedError('plan', []), PROMOTION_ERRORS.GENERATION_REJECTED],
  ])('settles the plan as FAILED when generation fails (%s)', async (error, failure) => {
    generatingPlan()
    generator.generate.mockImplementation(() => Promise.reject(error))
    await service.generate(PLAN)
    expect(prisma.promotionPlan.updateMany).toHaveBeenCalledWith({
      where: { id: PLAN, status: 'GENERATING' },
      data: { status: 'FAILED', failure },
    })
    expect(prisma.promotionPlanStep.createMany).not.toHaveBeenCalled()
  })

  it('does nothing for a plan that is no longer generating', async () => {
    generatingPlan('READY')
    await service.generate(PLAN)
    expect(generator.generate).not.toHaveBeenCalled()
  })
})
