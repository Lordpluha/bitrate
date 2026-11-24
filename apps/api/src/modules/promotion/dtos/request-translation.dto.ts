import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { TRANSLATION_LANGUAGES } from '../posts/translation/translation-languages'

export const RequestTranslationSchema = z.strictObject({
  language: z.enum(TRANSLATION_LANGUAGES).describe('Target language; English is the master'),
})
export class RequestTranslationDto extends createZodDto(RequestTranslationSchema) {}
export type RequestTranslationInput = z.infer<typeof RequestTranslationSchema>
