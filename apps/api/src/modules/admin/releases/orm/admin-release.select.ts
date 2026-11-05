import type { Prisma } from '@prisma/client'

/** The columns a review-queue row is built from. */
export const ROW_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  cover: true,
  submittedAt: true,
  updatedAt: true,
  owner: { select: { id: true, username: true } },
  _count: { select: { trackDrafts: { where: { deletedAt: null } } } },
} as const satisfies Prisma.ReleaseSelect

/** One stored review decision, with the reviewer's handle. */
export const REVIEW_SELECT = {
  id: true,
  decision: true,
  message: true,
  createdAt: true,
  staff: { select: { username: true } },
} as const satisfies Prisma.ReleaseReviewSelect

/** Everything the reviewer's detail page shows: the row plus rights, tracks and history. */
export const DETAIL_SELECT = {
  ...ROW_SELECT,
  upc: true,
  scheduledAt: true,
  masterOwnerType: true,
  masterOwnerName: true,
  writersConfirmedAt: true,
  accuracyConfirmedAt: true,
  trackDrafts: {
    where: { deletedAt: null },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      title: true,
      duration: true,
      isrc: true,
      audioKey: true,
      audioFileName: true,
    },
  },
  contributors: {
    orderBy: [{ displayName: 'asc' }, { id: 'asc' }],
    select: { id: true, displayName: true, roles: true },
  },
  splits: { select: { contributorId: true, rightType: true, shareBasisPoints: true } },
  territories: { select: { countryCode: true }, orderBy: { countryCode: 'asc' } },
  destinations: { select: { destination: true } },
  reviews: { orderBy: { createdAt: 'desc' }, take: 20, select: REVIEW_SELECT },
} satisfies Prisma.ReleaseSelect

/** The release columns a decision returns. */
export const DECIDED_SELECT = {
  id: true,
  status: true,
  updatedAt: true,
} as const satisfies Prisma.ReleaseSelect

export type RowRecord = Prisma.ReleaseGetPayload<{ select: typeof ROW_SELECT }>
export type ReviewRecord = Prisma.ReleaseReviewGetPayload<{ select: typeof REVIEW_SELECT }>
export type DetailRecord = Prisma.ReleaseGetPayload<{ select: typeof DETAIL_SELECT }>
export type DecidedRelease = Prisma.ReleaseGetPayload<{ select: typeof DECIDED_SELECT }>
