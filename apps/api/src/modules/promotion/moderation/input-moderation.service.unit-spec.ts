import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { PromotionGenerator } from '../ai/generator'
import { InputModerationService } from './input-moderation.service'

const ARTIST = 'a0000000-0000-7000-8000-000000000001'

describe('InputModerationService', () => {
  let generator: { generate: jest.Mock }
  let service: InputModerationService

  beforeEach(() => {
    generator = { generate: jest.fn() }
    service = new InputModerationService(generator as unknown as PromotionGenerator)
  })

  const answer = (allowed: boolean) =>
    generator.generate.mockImplementation(() =>
      Promise.resolve({
        model: 'anthropic:claude-haiku-5-5',
        output: { allowed, category: allowed ? 'none' : 'abuse' },
      }),
    )

  it('makes no model call when the artist wrote nothing', async () => {
    await expect(service.isAllowed(ARTIST, [null, '', '  '])).resolves.toBe(true)
    expect(generator.generate).not.toHaveBeenCalled()
  })

  it('asks the check task about every artist-written text at once', async () => {
    answer(true)
    await expect(service.isAllowed(ARTIST, ['Shorter', null, 'No emoji'])).resolves.toBe(true)
    expect(generator.generate).toHaveBeenCalledTimes(1)
    expect(generator.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        artistId: ARTIST,
        task: 'check',
        prompt: expect.stringContaining('Text 2: No emoji'),
        facts: [],
      }),
    )
  })

  it('refuses when the model flags the text', async () => {
    answer(false)
    await expect(service.isAllowed(ARTIST, ['something hateful'])).resolves.toBe(false)
  })
})
