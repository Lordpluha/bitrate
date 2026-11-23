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
import {
  type PromotionGenerator,
  PromotionModelUnavailableError,
  PromotionOutputRejectedError,
} from '../ai/promotion-generator'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { AiQuotaExceededException, type AiQuotaService } from '../usage/ai-quota.service'
import { PromotionPlansService } from './promotion-plans.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const RELEASE = 'b0000000-0000-7000-8000-000000000001'
const PLAN = 'c0000000-0000-7000-8000-000000000001'
const STEP = 'd0000000-0000-7000-8000-000000000001'
const DATE = new Date('2026-09-26T18:00:00Z')

const profile = {
  artistId: ARTIST,
  goal: 'BUZZ',
  channels: ['INSTAGRAM'],
  weeklyHours: 3,
  countries: ['UA'],
  audience: null,
  voiceWords: ['calm'],
  voiceExamples: [],
  updatedAt: DATE,
}

describe('PromotionPlansService', () => {
  let prisma: PrismaMock
  let queue: ReturnType<typeof makeQueueMock>
  let quota: { assertAvailable: jest.Mock }
  let generator: { generate: jest.Mock }
  let service: PromotionPlansService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    mockTransaction(prisma)
    queue = makeQueueMock()
    quota = { assertAvailable: jest.fn(() => Promise.resolve()) }
    generator = { generate: jest.fn() }
    service = new PromotionPlansService(
      prisma,
      quota as unknown as AiQuotaService,
      generator as unknown as PromotionGenerator,
      queue as unknown as Queue,
    )
  })

  const release = (scheduledAt: Date | null = DATE) =>
    prisma.release.findFirst.mockResolvedValue({ scheduledAt } as never)
  const latest = (plan: { id: string; version: number; status: string } | null) =>
    prisma.promotionPlan.findFirst.mockResolvedValue(plan as never)

  describe('request', () => {
    beforeEach(() => {
      prisma.artistPromotionProfile.findUnique.mockResolvedValue({ artistId: ARTIST } as never)
    })

    it("hides another artist's release", async () => {
      prisma.release.findFirst.mockResolvedValue(null)
      await expect(service.request(ARTIST, RELEASE)).rejects.toBeInstanceOf(NotFoundException)
      expect(prisma.release.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: RELEASE, ownerArtistId: ARTIST, deletedAt: null },
        }),
      )
    })

    it('needs a release date', async () => {
      release(null)
      await expect(service.request(ARTIST, RELEASE)).rejects.toThrow(
        new ConflictException(PROMOTION_ERRORS.RELEASE_DATE_REQUIRED),
      )
    })

    it('needs a promotion profile', async () => {
      release()
      prisma.artistPromotionProfile.findUnique.mockResolvedValue(null)
      await expect(service.request(ARTIST, RELEASE)).rejects.toThrow(
        new ConflictException(PROMOTION_ERRORS.PROFILE_REQUIRED),
      )
    })

    it('refuses while another version is generating', async () => {
      release()
      latest({ id: PLAN, version: 1, status: 'GENERATING' })
      await expect(service.request(ARTIST, RELEASE)).rejects.toThrow(
        new ConflictException(PROMOTION_ERRORS.PLAN_GENERATING),
      )
      expect(queue.add).not.toHaveBeenCalled()
    })

    it('stops at the monthly allowance before creating anything', async () => {
      release()
      latest(null)
      quota.assertAvailable.mockImplementation(() =>
        Promise.reject(new AiQuotaExceededException(new Date('2026-10-01T00:00:00Z'))),
      )
      await expect(service.request(ARTIST, RELEASE)).rejects.toBeInstanceOf(
        AiQuotaExceededException,
      )
      expect(prisma.promotionPlan.create).not.toHaveBeenCalled()
    })

    it('creates the next version, keeps acted-on steps and queues the generation', async () => {
      release()
      latest({ id: PLAN, version: 2, status: 'READY' })
      const NEXT = 'c0000000-0000-7000-8000-000000000002'
      prisma.promotionPlan.create.mockResolvedValue({ id: NEXT } as never)
      prisma.promotionPlanStep.findMany.mockResolvedValue([
        {
          id: STEP,
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
      // view() after queueing reads the latest version again
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
        data: [
          expect.objectContaining({
            planId: NEXT,
            position: 0,
            state: 'EDITED',
            title: 'Announce',
          }),
        ],
      })
      expect(queue.add).toHaveBeenCalledWith(
        'generate-plan',
        { planId: NEXT },
        expect.objectContaining({ jobId: `plan-${NEXT}` }),
      )
      expect(view.status).toBe('GENERATING')
    })
  })

  describe('generate', () => {
    const generatingPlan = (over: Record<string, unknown> = {}) =>
      prisma.promotionPlan.findUnique.mockResolvedValue({
        status: 'GENERATING',
        steps: [],
        release: {
          title: 'Afterglow',
          type: 'SINGLE',
          scheduledAt: DATE,
          deletedAt: null,
          territories: [{ countryCode: 'UA' }],
          trackDrafts: [{ title: 'Afterglow', genres: [{ genre: { name: 'indie' } }] }],
          owner: { id: ARTIST, username: 'demo', bio: null, promotionProfile: profile },
        },
        ...over,
      } as never)

    it('writes the suggested steps and marks the plan READY', async () => {
      generatingPlan()
      generator.generate.mockImplementation(() =>
        Promise.resolve({
          model: 'anthropic:claude-sonnet-5-5',
          output: {
            steps: [
              {
                offsetDays: 2,
                kind: 'POST',
                channels: ['INSTAGRAM'],
                title: 'Thank listeners',
                body: 'Thanks.',
              },
              {
                offsetDays: -7,
                kind: 'POST',
                channels: ['INSTAGRAM'],
                title: 'Share a hook',
                body: 'A hook.',
              },
              {
                offsetDays: 0,
                kind: 'ACTION',
                channels: [],
                title: 'Tell friends',
                body: 'Text them.',
              },
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
      generatingPlan({ status: 'READY' })
      await service.generate(PLAN)
      expect(generator.generate).not.toHaveBeenCalled()
    })
  })

  describe('updateStep', () => {
    beforeEach(() => {
      release()
      prisma.promotionPlanStep.findFirst.mockResolvedValue({ planId: PLAN } as never)
    })

    it('rejects a step of a replaced version', async () => {
      latest({ id: 'c0000000-0000-7000-8000-000000000009', version: 3, status: 'READY' })
      await expect(
        service.updateStep(ARTIST, RELEASE, STEP, { action: 'approve' }),
      ).rejects.toThrow(new ConflictException(PROMOTION_ERRORS.PLAN_NOT_LATEST))
    })

    it('approves only a suggested step', async () => {
      latest({ id: PLAN, version: 2, status: 'READY' })
      prisma.promotionPlanStep.updateMany.mockResolvedValue({ count: 0 })
      await expect(
        service.updateStep(ARTIST, RELEASE, STEP, { action: 'approve' }),
      ).rejects.toThrow(new ConflictException(PROMOTION_ERRORS.STEP_CHANGED))
      expect(prisma.promotionPlanStep.updateMany).toHaveBeenCalledWith({
        where: { id: STEP, state: { in: ['SUGGESTED'] } },
        data: { state: 'APPROVED' },
      })
    })

    it('marks an edited step as written by the artist', async () => {
      latest({ id: PLAN, version: 2, status: 'READY' })
      prisma.promotionPlanStep.updateMany.mockResolvedValue({ count: 1 })
      prisma.promotionPlan.findFirst
        .mockResolvedValueOnce({ id: PLAN, version: 2, status: 'READY' } as never)
        .mockResolvedValueOnce({
          id: PLAN,
          version: 2,
          status: 'READY',
          failure: null,
          createdAt: DATE,
          steps: [{ id: STEP, offsetDays: -21, state: 'EDITED' }],
        } as never)
      const view = await service.updateStep(ARTIST, RELEASE, STEP, {
        action: 'edit',
        body: 'Out on Sep 26.',
      })
      expect(prisma.promotionPlanStep.updateMany).toHaveBeenCalledWith({
        where: { id: STEP, state: { in: ['SUGGESTED', 'APPROVED', 'EDITED'] } },
        data: { state: 'EDITED', aiGenerated: false, body: 'Out on Sep 26.' },
      })
      expect(view.steps[0]?.dueAt?.toISOString()).toBe('2026-09-05T18:00:00.000Z')
    })

    it('hides a step of another release', async () => {
      prisma.promotionPlanStep.findFirst.mockResolvedValue(null)
      await expect(service.updateStep(ARTIST, RELEASE, STEP, { action: 'reject' })).rejects.toThrow(
        new NotFoundException(PROMOTION_ERRORS.STEP_NOT_FOUND),
      )
    })
  })
})
