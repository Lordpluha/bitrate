import type { PrismaService } from '@infra/prisma/prisma.service'
import type { PromotionStepState } from '@prisma/client'

/** States in which the artist has approved a step's text. */
const APPROVED_STATES: PromotionStepState[] = ['APPROVED', 'EDITED', 'DONE']

/** The artist's message for followers, and whether AI wrote it (the "Created with AI" marker). */
export interface FollowerMessage {
  text: string
  aiGenerated: boolean
}

/**
 * The follower message of the release that went live as `albumId` (spec "Bitrate-internal
 * channels", AC-10): the first FOLLOWER_MESSAGE step of its latest plan, approved or edited no
 * later than `liveAt`. Null means the release notification goes out unchanged.
 */
export async function findApprovedFollowerMessage(
  prisma: PrismaService,
  albumId: string,
  liveAt: Date,
): Promise<FollowerMessage | null> {
  const plan = await prisma.promotionPlan.findFirst({
    where: { release: { albumId } },
    orderBy: { version: 'desc' },
    select: {
      steps: {
        where: {
          kind: 'FOLLOWER_MESSAGE',
          state: { in: APPROVED_STATES },
          updatedAt: { lte: liveAt },
        },
        orderBy: { position: 'asc' },
        take: 1,
        select: { body: true, aiGenerated: true },
      },
    },
  })
  const step = plan?.steps[0]
  return step ? { text: step.body, aiGenerated: step.aiGenerated } : null
}
