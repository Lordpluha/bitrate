import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { noContactDetails } from './no-contact-details'

export const RegenerateStepSchema = z.strictObject({
  hint: noContactDetails(200)
    .optional()
    .describe('How the new suggestion should differ, e.g. "shorter" or "no emoji"'),
})
export class RegenerateStepDto extends createZodDto(RegenerateStepSchema) {}
export type RegenerateStepInput = z.infer<typeof RegenerateStepSchema>
