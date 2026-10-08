import type { ApiSchemas } from '@bitrate/contracts'
import { z } from 'zod'

type RightType = ApiSchemas['ReleaseRightType']

/** 10,000 basis points is 100%; the API stores integer basis points. */
export const FULL_SHARE_BASIS_POINTS = 10_000

export const rightTypeLabels = {
  RECORDING: 'Master',
  COMPOSITION: 'Publishing',
} satisfies Record<RightType, string>

export const rightTypes = [
  'RECORDING',
  'COMPOSITION',
] as const satisfies readonly RightType[]

export const masterOwnerTypes = [
  'ARTIST',
  'OTHER',
] as const satisfies readonly ApiSchemas['ReleaseMasterOwner'][]

export const releaseBlockerSchema = z.discriminatedUnion('code', [
  z.object({ code: z.literal('NO_TRACKS') }),
  z.object({ code: z.literal('MASTER_OWNER_MISSING') }),
  z.object({ code: z.literal('WRITERS_NOT_CONFIRMED') }),
  z.object({ code: z.literal('ACCURACY_NOT_CONFIRMED') }),
  z.object({
    code: z.literal('CONTRIBUTOR_ROLES_MISSING'),
    contributorId: z.uuid(),
  }),
  z.object({
    code: z.literal('SPLITS_INCOMPLETE'),
    rightType: z.enum(rightTypes),
    totalBasisPoints: z.number().int().nonnegative(),
  }),
])
export const releaseNoticeSchema = z.discriminatedUnion('code', [
  z.object({ code: z.literal('UPC_MISSING') }),
  z.object({ code: z.literal('ISRC_MISSING'), trackId: z.uuid() }),
])
type ReleaseBlocker = z.infer<typeof releaseBlockerSchema>
export type ReleaseNotice = z.infer<typeof releaseNoticeSchema>

const PERCENT_PATTERN = /^\d{1,3}(\.\d{1,2})?$/

/** Parses a percentage with up to two decimals; null when it is not a valid share. */
export function percentToBasisPoints(percent: string): number | null {
  const value = percent.trim()
  if (!PERCENT_PATTERN.test(value)) return null
  const points = Math.round(Number(value) * 100)
  return points >= 1 && points <= FULL_SHARE_BASIS_POINTS ? points : null
}

export function basisPointsToPercent(points: number): string {
  return String(points / 100)
}

const UPC_PATTERN = /^\d{12,13}$/
const ISRC_PATTERN = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/
const DISPLAY_ISRC_PATTERN = /^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/

/** Mirrors the API's GTIN check so artists see typos before saving. */
export function isValidUpc(value: string): boolean {
  if (!UPC_PATTERN.test(value)) return false
  const digits = [...value].map(Number)
  const check = digits.pop()
  const sum = digits
    .reverse()
    .reduce(
      (total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1),
      0,
    )
  return (10 - (sum % 10)) % 10 === check
}

export function normalizeIsrc(value: string): string | null {
  const upper = value.trim().toUpperCase()
  const compact = DISPLAY_ISRC_PATTERN.test(upper)
    ? upper.replaceAll('-', '')
    : upper
  return ISRC_PATTERN.test(compact) ? compact : null
}

/** Shows a stored ISRC in its readable hyphenated form. */
export function formatIsrc(isrc: string): string {
  return `${isrc.slice(0, 2)}-${isrc.slice(2, 5)}-${isrc.slice(5, 7)}-${isrc.slice(7)}`
}

interface BlockerNames {
  contributors: Record<string, string>
}

export function describeBlocker(
  blocker: ReleaseBlocker,
  names: BlockerNames,
): string {
  switch (blocker.code) {
    case 'NO_TRACKS':
      return 'Add at least one track'
    case 'MASTER_OWNER_MISSING':
      return 'Choose the master owner'
    case 'WRITERS_NOT_CONFIRMED':
      return 'Confirm all writers are listed'
    case 'ACCURACY_NOT_CONFIRMED':
      return 'Confirm the information is accurate'
    case 'CONTRIBUTOR_ROLES_MISSING':
      return `${names.contributors[blocker.contributorId] ?? 'A contributor'} needs a role`
    case 'SPLITS_INCOMPLETE':
      return `${rightTypeLabels[blocker.rightType]} splits total ${basisPointsToPercent(blocker.totalBasisPoints)}% of 100%`
  }
}
