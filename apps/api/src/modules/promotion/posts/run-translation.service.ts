import { PrismaService } from '@infra/prisma/prisma.service'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { PromotionModelUnavailableError, PromotionOutputRejectedError } from '../ai/generator'
import {
  glossaryTerms,
  TRANSLATION_LANGUAGES,
  TRANSLATOR,
  type TranslationLanguage,
  type Translator,
} from './translation'

const isLanguage = (value: string): value is TranslationLanguage =>
  (TRANSLATION_LANGUAGES as readonly string[]).includes(value)

/** Job body: fills a TRANSLATING translation, or marks it FAILED. */
@Injectable()
export class RunTranslationService {
  private readonly logger = new Logger(RunTranslationService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(TRANSLATOR) private readonly translator: Translator,
  ) {}

  async run(translationId: string): Promise<void> {
    const translation = await this.prisma.promotionPostTranslation.findUnique({
      where: { id: translationId },
      select: {
        state: true,
        language: true,
        sourceRevision: true,
        post: {
          select: {
            text: true,
            hashtags: true,
            step: {
              select: {
                plan: {
                  select: {
                    release: {
                      select: {
                        title: true,
                        trackDrafts: { where: { deletedAt: null }, select: { title: true } },
                        owner: { select: { id: true, username: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })
    if (translation?.state !== 'TRANSLATING' || !isLanguage(translation.language)) return
    const { post } = translation
    const { release } = post.step.plan
    const source = [post.text, post.hashtags.join(' ')].filter(Boolean).join('\n\n')
    const names = [
      release.title,
      release.owner.username,
      ...release.trackDrafts.map((d) => d.title),
    ]
    try {
      const result = await this.translator.translate({
        artistId: release.owner.id,
        source,
        language: translation.language,
        terms: glossaryTerms(source, names),
      })
      // If the master changed while translating, the result is already out of date.
      const current = await this.prisma.promotionPost.findFirst({
        where: { translations: { some: { id: translationId } } },
        select: { revision: true },
      })
      const stale = current?.revision !== translation.sourceRevision
      await this.prisma.promotionPostTranslation.updateMany({
        where: { id: translationId, state: 'TRANSLATING' },
        data: {
          text: result.text,
          state: stale ? 'STALE' : 'MACHINE',
          aiGenerated: true,
          rating: null,
        },
      })
    } catch (error: unknown) {
      if (
        error instanceof PromotionModelUnavailableError ||
        error instanceof PromotionOutputRejectedError
      ) {
        await this.fail(translationId)
      } else {
        throw error
      }
    }
  }

  /** Marks a translation FAILED; also used when a job gives up after its retries. */
  async fail(translationId: string) {
    this.logger.warn(`Promotion translation ${translationId} failed`)
    await this.prisma.promotionPostTranslation.updateMany({
      where: { id: translationId, state: 'TRANSLATING' },
      data: { state: 'FAILED' },
    })
  }
}
