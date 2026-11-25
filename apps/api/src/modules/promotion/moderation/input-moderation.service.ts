import { Injectable } from '@nestjs/common'
import { PromotionGenerator } from '../ai/generator'
import { MODERATION_SYSTEM_PROMPT, ModerationOutputSchema } from './moderation-output.schema'

/**
 * The cheap moderation check on artist-written text (voice examples, audience, hints) before
 * it reaches a generation prompt (spec "Grounding and safety", D-16). Contact details are
 * refused earlier, by the request validation.
 */
@Injectable()
export class InputModerationService {
  constructor(private readonly generator: PromotionGenerator) {}

  /**
   * True when every text may be used. Blank input needs no model call. Provider failures
   * propagate as the generator's errors, so callers settle them like any other generation.
   */
  async isAllowed(artistId: string, texts: readonly (string | null)[]): Promise<boolean> {
    const written = texts.filter((text): text is string => Boolean(text?.trim()))
    if (written.length === 0) return true
    const { output } = await this.generator.generate({
      artistId,
      task: 'check',
      schema: ModerationOutputSchema,
      system: MODERATION_SYSTEM_PROMPT,
      prompt: written.map((text, index) => `Text ${index + 1}: ${text}`).join('\n'),
      facts: [],
      textOf: () => '',
    })
    return output.allowed
  }
}
