import { ApiProperty } from '@nestjs/swagger'
import z from 'zod'

/** The legal acceptance schema value. */
export const LegalAcceptanceSchema = z.object({
  acceptLegal: z.literal(true, {
    message: 'You must accept the Terms of Use and Community Guidelines',
  }),
})

/** Represents the legal acceptance dto. */
export class LegalAcceptanceDto implements z.infer<typeof LegalAcceptanceSchema> {
  /** Confirms the user accepted the current Terms of Use and Community Guidelines and read the Privacy Policy. */
  @ApiProperty({
    description:
      'Accepts the current Terms of Use and Community Guidelines and acknowledges the Privacy Policy; must be true',
    example: true,
    enum: [true],
  })
  acceptLegal: true
}
