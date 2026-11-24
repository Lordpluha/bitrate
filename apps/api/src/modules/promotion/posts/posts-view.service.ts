import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { findOwnedStep } from './find-owned-step'
import { CHANNEL_FORMATS } from './generation'

/** A POST step's drafts: one English master per channel with its translations. */
@Injectable()
export class PostsViewService {
  constructor(private readonly prisma: PrismaService) {}

  async view(artistId: string, releaseId: string, stepId: string) {
    await findOwnedStep(this.prisma, artistId, releaseId, stepId)
    const step = await this.prisma.promotionPlanStep.findUniqueOrThrow({
      where: { id: stepId },
      select: {
        postsStatus: true,
        postsFailure: true,
        posts: {
          orderBy: { channel: 'asc' },
          select: {
            id: true,
            channel: true,
            text: true,
            hashtags: true,
            aiGenerated: true,
            revision: true,
            translations: {
              orderBy: { language: 'asc' },
              select: {
                id: true,
                language: true,
                text: true,
                state: true,
                aiGenerated: true,
                rating: true,
              },
            },
          },
        },
      },
    })
    return {
      stepId,
      status: step.postsStatus,
      failure: step.postsFailure,
      posts: step.posts.map((post) => ({
        ...post,
        maxLength: CHANNEL_FORMATS[post.channel].maxLength,
      })),
    }
  }
}
