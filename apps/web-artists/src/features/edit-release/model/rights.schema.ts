import {
  isValidUpc,
  normalizeIsrc,
  percentToBasisPoints,
} from '@entities/release'
import { messageKey, type TranslationKey } from '@shared/i18n'
import { z } from 'zod'

export const rightsFormSchema = z
  .object({
    ownerType: z.enum(['ARTIST', 'OTHER'], {
      message: messageKey('editRelease.ownerTypeRequired'),
    }),
    ownerName: z
      .string()
      .trim()
      .max(255, messageKey('release.error.nameTooLong')),
    writersConfirmed: z.boolean(),
  })
  .refine((value) => value.ownerType !== 'OTHER' || value.ownerName !== '', {
    path: ['ownerName'],
    message: messageKey('editRelease.ownerNameRequired'),
  })

export type RightsFormValues = z.input<typeof rightsFormSchema>

/** Identifiers are optional; returns the problem (a catalog key) with a filled code, if any. */
export function upcError(value: string): TranslationKey | null {
  const code = value.trim()
  return code === '' || isValidUpc(code) ? null : 'editRelease.upcInvalid'
}

export function isrcError(value: string): TranslationKey | null {
  const code = value.trim()
  return code === '' || normalizeIsrc(code) !== null
    ? null
    : 'release.error.isrcInvalid'
}

/** Empty fields mean "no share"; filled ones must be 0.01–100 with up to two decimals. */
export function parseShares(values: Record<string, string>) {
  const shares: { contributorId: string; shareBasisPoints: number }[] = []
  for (const [contributorId, percent] of Object.entries(values)) {
    if (percent.trim() === '') continue
    const shareBasisPoints = percentToBasisPoints(percent)
    if (shareBasisPoints === null) return null
    shares.push({ contributorId, shareBasisPoints })
  }
  return shares
}
