import type { Prisma } from '@prisma/client'

export const RELEASE_SUMMARY_SELECT = {
  id: true,
  title: true,
  type: true,
  status: true,
  upc: true,
  scheduledAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ReleaseSelect

export const RELEASE_CONTRIBUTOR_SELECT = {
  id: true,
  displayName: true,
  roles: true,
} as const satisfies Prisma.ReleaseContributorSelect
