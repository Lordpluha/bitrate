import type { ReleaseKind, ReviewedReleaseStatus } from '@domain/release-review'

export const RELEASE_KIND_LABELS = {
  ALBUM: 'Album',
  SINGLE: 'Single',
  EP: 'EP',
  COMPILATION: 'Compilation',
} as const satisfies Record<ReleaseKind, string>

export const RELEASE_STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Awaiting review',
  READY: 'Approved',
  REJECTED: 'Changes requested',
  RELEASED: 'Released',
} as const satisfies Record<ReviewedReleaseStatus, string>

export type StatusBadgeVariant = 'default' | 'outline' | 'destructive' | 'secondary'

export const RELEASE_STATUS_BADGES = {
  DRAFT: 'outline',
  SUBMITTED: 'secondary',
  READY: 'default',
  REJECTED: 'destructive',
  RELEASED: 'default',
} as const satisfies Record<ReviewedReleaseStatus, StatusBadgeVariant>
