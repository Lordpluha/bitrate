import {
  isValidUpc,
  normalizeIsrc,
  percentToBasisPoints,
} from '@entities/release'
import { z } from 'zod'

export const rightsFormSchema = z
  .object({
    ownerType: z.enum(['ARTIST', 'OTHER'], {
      message: 'Choose who controls the master recording.',
    }),
    ownerName: z.string().trim().max(255, 'Use 255 characters or fewer'),
    writersConfirmed: z.boolean(),
    accuracyConfirmed: z.boolean(),
  })
  .refine((value) => value.ownerType !== 'OTHER' || value.ownerName !== '', {
    path: ['ownerName'],
    message: 'Enter the master owner’s name.',
  })

export type RightsFormValues = z.input<typeof rightsFormSchema>

/** Identifiers are optional; returns the problem with a filled code, if any. */
export function upcError(value: string): string | null {
  const code = value.trim()
  return code === '' || isValidUpc(code)
    ? null
    : 'Enter 12 or 13 digits with a valid check digit.'
}

export function isrcError(value: string): string | null {
  const code = value.trim()
  return code === '' || normalizeIsrc(code) !== null
    ? null
    : 'Enter an ISRC such as US-RC1-76-07839.'
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
