import { PrismaService } from '@infra/prisma/prisma.service'
import { Injectable, Logger } from '@nestjs/common'
import {
  PromotionGenerator,
  PromotionModelUnavailableError,
  PromotionOutputRejectedError,
} from '../ai/generator'
import { PROMOTION_ERRORS } from '../promotion.errors'
import {
  buildPostsRequest,
  POSTS_SYSTEM_PROMPT,
  type PostsOutput,
  PostsOutputSchema,
} from './generation'

const STEP_SOURCE_SELECT = {
  postsStatus: true,
  title: true,
  body: true,
  channels: true,
  plan: {
    select: {
      release: {
        select: {
          title: true,
          scheduledAt: true,
          trackDrafts: { where: { deletedAt: null }, select: { title: true } },
          owner: {
            select: {
              id: true,
              username: true,
              bio: true,
              promotionProfile: { select: { voiceWords: true, voiceExamples: true } },
            },
          },
        },
      },
    },
  },
} as const

const postsText = (output: PostsOutput) =>
  output.posts.map((post) => `${post.text}\n${post.hashtags.join(' ')}`).join('\n')

/** Job body: writes one English master per channel and settles the step's drafts. */
@Injectable()
export class GeneratePostsService {
  private readonly logger = new Logger(GeneratePostsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: PromotionGenerator,
  ) {}

  async generate(stepId: string): Promise<void> {
    const step = await this.prisma.promotionPlanStep.findUnique({
      where: { id: stepId },
      select: STEP_SOURCE_SELECT,
    })
    if (step?.postsStatus !== 'GENERATING') return
    const { release } = step.plan
    if (!release.scheduledAt) return this.fail(stepId, PROMOTION_ERRORS.GENERATION_UNAVAILABLE)
    const profile = release.owner.promotionProfile
    const { prompt, facts } = buildPostsRequest({
      step: { title: step.title, body: step.body, channels: step.channels },
      release: {
        title: release.title,
        scheduledAt: release.scheduledAt,
        trackTitles: release.trackDrafts.map((draft) => draft.title),
      },
      artist: { name: release.owner.username, bio: release.owner.bio },
      voice: { words: profile?.voiceWords ?? [], examples: profile?.voiceExamples ?? [] },
    })
    try {
      const { output } = await this.generator.generate({
        artistId: release.owner.id,
        task: 'copy',
        schema: PostsOutputSchema,
        system: POSTS_SYSTEM_PROMPT,
        prompt,
        facts,
        textOf: postsText,
      })
      await this.save(stepId, step.channels, output)
    } catch (error: unknown) {
      if (error instanceof PromotionModelUnavailableError) {
        await this.fail(stepId, PROMOTION_ERRORS.GENERATION_UNAVAILABLE)
      } else if (error instanceof PromotionOutputRejectedError) {
        await this.fail(stepId, PROMOTION_ERRORS.GENERATION_REJECTED)
      } else {
        throw error
      }
    }
  }

  /** Marks the step's drafts FAILED; also used when a job gives up after its retries. */
  async fail(stepId: string, failure: string) {
    this.logger.warn(`Promotion posts for step ${stepId} failed: ${failure}`)
    await this.prisma.promotionPlanStep.updateMany({
      where: { id: stepId, postsStatus: 'GENERATING' },
      data: { postsStatus: 'FAILED', postsFailure: failure },
    })
  }

  /** A rewritten master bumps its revision, so every translation of it becomes STALE. */
  private async save(stepId: string, channels: readonly string[], output: PostsOutput) {
    const posts = output.posts.filter((post) => channels.includes(post.channel))
    await this.prisma.$transaction(async (tx) => {
      for (const post of posts) {
        const saved = await tx.promotionPost.upsert({
          where: { stepId_channel: { stepId, channel: post.channel } },
          create: { stepId, channel: post.channel, text: post.text, hashtags: post.hashtags },
          update: {
            text: post.text,
            hashtags: post.hashtags,
            aiGenerated: true,
            revision: { increment: 1 },
          },
          select: { id: true },
        })
        await tx.promotionPostTranslation.updateMany({
          where: { postId: saved.id, state: { in: ['MACHINE', 'EDITED'] } },
          data: { state: 'STALE' },
        })
      }
      await tx.promotionPlanStep.update({ where: { id: stepId }, data: { postsStatus: 'READY' } })
    })
  }
}
