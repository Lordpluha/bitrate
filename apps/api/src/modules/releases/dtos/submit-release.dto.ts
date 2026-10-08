import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const expectedUpdatedAt = z.iso
  .datetime({ offset: true })
  .describe('Release version read before submitting')

/** Submission creates a Bitrate review request only; it never starts external delivery. */
export const SubmitReleaseSchema = z.strictObject({
  reviewed: z.literal(true).describe('The artist reviewed the information in this draft'),
  expectedUpdatedAt,
})

export const WithdrawReleaseSchema = z.strictObject({ expectedUpdatedAt })

export class SubmitReleaseDto extends createZodDto(SubmitReleaseSchema) {}
export class WithdrawReleaseDto extends createZodDto(WithdrawReleaseSchema) {}
