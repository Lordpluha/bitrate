import { ReleaseRightType } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import { FULL_SHARE_BASIS_POINTS } from '../release-readiness'
import { MAX_RELEASE_CONTRIBUTORS } from '../releases.select'

const ShareSchema = z.strictObject({
  contributorId: z.uuid(),
  shareBasisPoints: z
    .number()
    .int()
    .min(1)
    .max(FULL_SHARE_BASIS_POINTS)
    .describe('1–10,000; 10,000 basis points is 100%'),
})

/** A draft may be partially allocated; submission requires exactly 100% per right type. */
export const ReplaceReleaseSplitsSchema = z.strictObject({
  rightType: z.enum(ReleaseRightType),
  shares: z
    .array(ShareSchema)
    .max(MAX_RELEASE_CONTRIBUTORS)
    .refine(
      (shares) => new Set(shares.map((share) => share.contributorId)).size === shares.length,
      'List each contributor once',
    )
    .refine(
      (shares) =>
        shares.reduce((total, share) => total + share.shareBasisPoints, 0) <=
        FULL_SHARE_BASIS_POINTS,
      'Shares cannot exceed 100%',
    ),
  expectedUpdatedAt: z.iso
    .datetime({ offset: true })
    .describe('Release version read before editing'),
})

export class ReplaceReleaseSplitsDto extends createZodDto(ReplaceReleaseSplitsSchema) {}
