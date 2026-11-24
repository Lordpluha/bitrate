import { beforeEach, describe, expect, it } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { findApprovedFollowerMessage } from './find-approved-follower-message'

const ALBUM = 'e0000000-0000-7000-8000-000000000001'
const LIVE = new Date('2026-12-10T18:00:00Z')

describe('findApprovedFollowerMessage', () => {
  let prisma: PrismaMock

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
  })

  it('reads an approved follower-message step of the latest plan, approved before going live', async () => {
    prisma.promotionPlan.findFirst.mockResolvedValue({
      steps: [{ body: 'Thank you for waiting!', aiGenerated: false }],
    } as never)
    await expect(findApprovedFollowerMessage(prisma, ALBUM, LIVE)).resolves.toEqual({
      text: 'Thank you for waiting!',
      aiGenerated: false,
    })
    expect(prisma.promotionPlan.findFirst).toHaveBeenCalledWith({
      where: { release: { albumId: ALBUM } },
      orderBy: { version: 'desc' },
      select: {
        steps: {
          where: {
            kind: 'FOLLOWER_MESSAGE',
            state: { in: ['APPROVED', 'EDITED', 'DONE'] },
            updatedAt: { lte: LIVE },
          },
          orderBy: { position: 'asc' },
          take: 1,
          select: { body: true, aiGenerated: true },
        },
      },
    })
  })

  it.each([
    ['no plan', null],
    ['no approved message', { steps: [] }],
  ])('returns null with %s, so the notification stays unchanged', async (_case, plan) => {
    prisma.promotionPlan.findFirst.mockResolvedValue(plan as never)
    await expect(findApprovedFollowerMessage(prisma, ALBUM, LIVE)).resolves.toBeNull()
  })
})
