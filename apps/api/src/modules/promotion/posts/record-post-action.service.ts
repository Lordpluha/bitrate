import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, NotFoundException } from '@nestjs/common'
import type { PostAction } from '../dtos'
import { type PromotionEventName, PromotionEventsService } from '../events'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { findOwnedStep } from './find-owned-step'

const EVENT_FOR: Record<PostAction, PromotionEventName> = {
  copied: 'promotion.post.copied',
  exported: 'promotion.post.exported',
}

/**
 * Copy and download happen in the browser; the UI reports them here so the promotion events
 * show which drafts artists actually took (spec "Events").
 */
@Injectable()
export class RecordPostActionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: PromotionEventsService,
  ) {}

  async record(
    artistId: string,
    releaseId: string,
    stepId: string,
    postId: string,
    action: PostAction,
  ): Promise<void> {
    await findOwnedStep(this.prisma, artistId, releaseId, stepId)
    const post = await this.prisma.promotionPost.findFirst({
      where: { id: postId, stepId },
      select: { channel: true },
    })
    if (!post) throw new NotFoundException(PROMOTION_ERRORS.POST_NOT_FOUND)
    await this.events.record(artistId, EVENT_FOR[action], postId, { channel: post.channel })
  }
}
