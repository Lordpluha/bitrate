import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const expectedUpdatedAt = z.iso
  .datetime({ offset: true })
  .describe('Release version read before submitting')

/** Submission creates a Bitrate review request only; it never starts external delivery. */
export const SubmitReleaseSchema = z.strictObject({
  reviewed: z
    .literal(true)
    .describe('The artist confirms the information in this draft is accurate'),
  expectedUpdatedAt,
})

export const WithdrawReleaseSchema = z.strictObject({ expectedUpdatedAt })

/** Reopens a release Bitrate sent back with requested changes. */
export const ReviseReleaseSchema = z.strictObject({ expectedUpdatedAt })

export class SubmitReleaseDto extends createZodDto(SubmitReleaseSchema) {}
export class WithdrawReleaseDto extends createZodDto(WithdrawReleaseSchema) {}
export class ReviseReleaseDto extends createZodDto(ReviseReleaseSchema) {}
