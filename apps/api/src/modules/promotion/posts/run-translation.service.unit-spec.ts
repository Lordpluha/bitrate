import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { type PrismaMock, prismaMock, resetPrismaMock } from '@test/mocks'
import { PromotionOutputRejectedError } from '../ai/generator'
import { RunTranslationService } from './run-translation.service'
import type { Translator } from './translation'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'
const TRANSLATION = 'f0000000-0000-7000-8000-000000000001'

describe('RunTranslationService', () => {
  let prisma: PrismaMock
  let translator: { translate: jest.Mock }
  let service: RunTranslationService

  beforeEach(() => {
    resetPrismaMock()
    prisma = prismaMock
    translator = { translate: jest.fn() }
    service = new RunTranslationService(prisma, translator as unknown as Translator)
    prisma.promotionPostTranslation.findUnique.mockResolvedValue({
      state: 'TRANSLATING',
      language: 'uk',
      sourceRevision: 2,
      post: {
        text: 'Afterglow by demo is out on Bitrate.',
        hashtags: ['#afterglow'],
        step: {
          plan: {
            release: {
              title: 'Afterglow',
              trackDrafts: [{ title: 'Afterglow' }],
              owner: { id: ARTIST, username: 'demo' },
            },
          },
        },
      },
    } as never)
  })

  it('protects names and hashtags and stores a MACHINE translation', async () => {
    translator.translate.mockImplementation(() =>
      Promise.resolve({ text: 'Afterglow від demo вже на Bitrate.\n\n#afterglow', model: 'm' }),
    )
    prisma.promotionPost.findFirst.mockResolvedValue({ revision: 2 } as never)
    await service.run(TRANSLATION)
    expect(translator.translate).toHaveBeenCalledWith({
      artistId: ARTIST,
      source: 'Afterglow by demo is out on Bitrate.\n\n#afterglow',
      language: 'uk',
      terms: ['Afterglow', 'demo', 'Bitrate', '#afterglow'],
    })
    expect(prisma.promotionPostTranslation.updateMany).toHaveBeenCalledWith({
      where: { id: TRANSLATION, state: 'TRANSLATING' },
      data: expect.objectContaining({ state: 'MACHINE', aiGenerated: true }),
    })
  })

  it('stores the result as STALE when the master changed meanwhile', async () => {
    translator.translate.mockImplementation(() => Promise.resolve({ text: 'Текст', model: 'm' }))
    prisma.promotionPost.findFirst.mockResolvedValue({ revision: 3 } as never)
    await service.run(TRANSLATION)
    expect(prisma.promotionPostTranslation.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ state: 'STALE' }) }),
    )
  })

  it('marks the translation FAILED when it fails its checks twice', async () => {
    translator.translate.mockImplementation(() =>
      Promise.reject(new PromotionOutputRejectedError('translate', [])),
    )
    await service.run(TRANSLATION)
    expect(prisma.promotionPostTranslation.updateMany).toHaveBeenCalledWith({
      where: { id: TRANSLATION, state: 'TRANSLATING' },
      data: { state: 'FAILED' },
    })
  })
})
