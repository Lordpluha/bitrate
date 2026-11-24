import { PrismaService } from '@infra/prisma/prisma.service'
import { InjectQueue } from '@nestjs/bullmq'
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { Queue } from 'bullmq'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  PROMOTION_JOB_OPTIONS,
  PROMOTION_JOBS,
  PROMOTION_QUEUE,
  type TranslatePostJob,
} from '../promotion.queue'
import { AiQuotaService } from '../usage'
import { findOwnedStep } from './find-owned-step'
import { PostsViewService } from './posts-view.service'
import type { TranslationLanguage } from './translation'

/**
 * Starts a machine translation of a post's English master. Replacing an edited translation is
 * the artist's explicit choice; nothing else overwrites it (spec D-7.1).
 */
@Injectable()
export class RequestTranslationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly quota: AiQuotaService,
    private readonly views: PostsViewService,
    @InjectQueue(PROMOTION_QUEUE) private readonly queue: Queue,
  ) {}

  async request(
    artistId: string,
    releaseId: string,
    stepId: string,
    postId: string,
    language: TranslationLanguage,
  ) {
    await findOwnedStep(this.prisma, artistId, releaseId, stepId)
    const post = await this.prisma.promotionPost.findFirst({
      where: { id: postId, stepId },
      select: { revision: true, translations: { where: { language }, select: { state: true } } },
    })
    if (!post) throw new NotFoundException(PROMOTION_ERRORS.POST_NOT_FOUND)
    if (post.translations[0]?.state === 'TRANSLATING') {
      throw new ConflictException(PROMOTION_ERRORS.TRANSLATION_BUSY)
    }
    await this.quota.assertAvailable(artistId)
    const translation = await this.prisma.promotionPostTranslation.upsert({
      where: { postId_language: { postId, language } },
      create: { postId, language, state: 'TRANSLATING', sourceRevision: post.revision },
      update: { state: 'TRANSLATING', sourceRevision: post.revision },
      select: { id: true },
    })
    const job: TranslatePostJob = { translationId: translation.id }
    await this.queue.add(PROMOTION_JOBS.TRANSLATE_POST, job, PROMOTION_JOB_OPTIONS)
    return this.views.view(artistId, releaseId, stepId)
  }
}
