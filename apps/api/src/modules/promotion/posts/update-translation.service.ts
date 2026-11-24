import { PrismaService } from '@infra/prisma/prisma.service'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { UpdatePromotionTranslationInput } from '../dtos'
import { PROMOTION_ERRORS } from '../promotion.errors'
import { findOwnedStep } from './find-owned-step'
import { PostsViewService } from './posts-view.service'

/**
 * The artist edits or rates a translation (spec D-20). An edit makes it EDITED against the
 * current master; a rating is the quality signal for the translation model.
 */
@Injectable()
export class UpdateTranslationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly views: PostsViewService,
  ) {}

  async update(
    artistId: string,
    releaseId: string,
    stepId: string,
    translationId: string,
    input: UpdatePromotionTranslationInput,
  ) {
    await findOwnedStep(this.prisma, artistId, releaseId, stepId)
    const translation = await this.prisma.promotionPostTranslation.findFirst({
      where: { id: translationId, post: { stepId } },
      select: { state: true, post: { select: { revision: true } } },
    })
    if (!translation) throw new NotFoundException(PROMOTION_ERRORS.TRANSLATION_NOT_FOUND)
    if (translation.state === 'TRANSLATING') {
      throw new ConflictException(PROMOTION_ERRORS.TRANSLATION_BUSY)
    }
    const { count } = await this.prisma.promotionPostTranslation.updateMany({
      where: { id: translationId, state: { not: 'TRANSLATING' } },
      data: {
        ...(input.text !== undefined && {
          text: input.text,
          state: 'EDITED',
          aiGenerated: false,
          sourceRevision: translation.post.revision,
        }),
        ...(input.rating !== undefined && { rating: input.rating }),
      },
    })
    if (count === 0) throw new ConflictException(PROMOTION_ERRORS.TRANSLATION_BUSY)
    return this.views.view(artistId, releaseId, stepId)
  }
}
