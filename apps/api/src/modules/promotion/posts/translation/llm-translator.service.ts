import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import { PromotionGenerator } from '../../ai/generator'
import { buildTranslationRequest, TRANSLATION_SYSTEM_PROMPT } from './build-translation-request'
import { findMissingTerms } from './find-missing-terms'
import type { TranslationRequest, Translator } from './translator'

const TranslationOutputSchema = z.object({ text: z.string().min(1) })

/** The default `Translator`: the `translate` task, with glossary terms checked after it. */
@Injectable()
export class LlmTranslator implements Translator {
  constructor(private readonly generator: PromotionGenerator) {}

  async translate(request: TranslationRequest) {
    const { prompt, facts } = buildTranslationRequest(
      request.source,
      request.language,
      request.terms,
    )
    const result = await this.generator.generate({
      artistId: request.artistId,
      task: 'translate',
      schema: TranslationOutputSchema,
      system: TRANSLATION_SYSTEM_PROMPT,
      prompt,
      facts,
      textOf: (output) => output.text,
      check: (output) => findMissingTerms(output.text, request.terms),
    })
    return { text: result.output.text, model: result.model }
  }
}
