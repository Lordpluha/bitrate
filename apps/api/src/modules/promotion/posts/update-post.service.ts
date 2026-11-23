import { PrismaService } from '@infra/prisma/prisma.service'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { UpdatePromotionPostInput } from '../dtos'
import { PROMOTION_ERRORS, PROMOTION_VALIDATION } from '../promotion.errors'
import { findOwnedStep } from './find-owned-step'
import { CHANNEL_FORMATS } from './generation'
import { PostsViewService } from './posts-view.service'

/**
 * The artist edits an English master. Its translations become STALE, but an edited
 * translation keeps its text: only the artist replaces it (spec D-7.1).
 */
@Injectable()
export class UpdatePostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly views: PostsViewService,
  ) {}

  async update(
    artistId: string,
    releaseId: string,
    stepId: string,
    postId: string,
    input: UpdatePromotionPostInput,
  ) {
    await findOwnedStep(this.prisma, artistId, releaseId, stepId)
    const post = await this.prisma.promotionPost.findFirst({
      where: { id: postId, stepId },
      select: { channel: true },
    })
    if (!post) throw new NotFoundException(PROMOTION_ERRORS.POST_NOT_FOUND)
    if (input.text !== undefined && input.text.length > CHANNEL_FORMATS[post.channel].maxLength) {
      throw new BadRequestException(PROMOTION_VALIDATION.POST_TOO_LONG)
    }
    await this.prisma.$transaction([
      this.prisma.promotionPost.update({
        where: { id: postId },
        data: {
          ...(input.text !== undefined && { text: input.text }),
          ...(input.hashtags !== undefined && { hashtags: input.hashtags }),
          aiGenerated: false,
          revision: { increment: 1 },
        },
      }),
      this.prisma.promotionPostTranslation.updateMany({
        where: { postId, state: { in: ['MACHINE', 'EDITED'] } },
        data: { state: 'STALE' },
      }),
    ])
    return this.views.view(artistId, releaseId, stepId)
  }
}
