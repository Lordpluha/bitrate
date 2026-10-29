import type { PolicyDecision } from '../shared/policy-decision'
import { POLICY_ALLOWED } from '../shared/policy-decision'

/** Declared here; `infrastructure/release-review` binds each union to the contract's. */
export type ReleaseKind = 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'

/** The lifecycle states a release can be in once an artist has submitted it at least once. */
export type ReviewedReleaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'READY'
  | 'REJECTED'
  | 'SCHEDULED'
  | 'PUBLISHING'
  | 'PUBLISH_FAILED'
  | 'RELEASED'
  | 'UNPUBLISHED'

/** What the queue can be narrowed to; `ALL` is every reviewed status. */
export type ReleaseQueueStatus =
  'SUBMITTED' | 'READY' | 'REJECTED' | 'PUBLISHING' | 'PUBLISH_FAILED' | 'RELEASED' | 'ALL'

export type ReleaseReviewDecision = 'APPROVED' | 'CHANGES_REQUESTED'

/** Mirrors the API's limits on a review, so the form refuses what the API would. */
export const REVIEW_LIMITS = {
  itemMaxLength: 500,
  messageMaxLength: 2000,
  maxItems: 20,
} as const

/** A submission as one row of the review queue. */
export type ReleaseSubmission = {
  id: string
  title: string
  kind: ReleaseKind
  status: ReviewedReleaseStatus
  coverUrl: string | null
  submittedAt: Date | null
  /** The version the reviewer read; a decision only lands on this exact version. */
  updatedAt: Date
  artistId: string
  artistUsername: string
  trackCount: number
}

type SubmissionTrack = {
  id: string
  title: string
  durationSeconds: number | null
  isrc: string | null
  audioFileName: string | null
  hasAudio: boolean
}

type SubmissionContributor = {
  id: string
  displayName: string
  roles: string[]
}

type SubmissionSplit = {
  contributorId: string
  rightType: string
  /** 10 000 basis points make the whole of one right. */
  shareBasisPoints: number
}

export type SubmissionReview = {
  id: string
  decision: ReleaseReviewDecision
  message: string | null
  requiredChanges: string[]
  recommendations: string[]
  createdAt: Date
  /** `null` once the reviewing operator's account is gone. */
  reviewerUsername: string | null
}

/** Everything a reviewer needs to decide on one submission. */
export type ReleaseSubmissionDetail = ReleaseSubmission & {
  upc: string | null
  scheduledAt: Date | null
  masterOwnerType: string | null
  masterOwnerName: string | null
  writersConfirmedAt: Date | null
  accuracyConfirmedAt: Date | null
  tracks: SubmissionTrack[]
  contributors: SubmissionContributor[]
  splits: SubmissionSplit[]
  /** Empty means worldwide. */
  territories: string[]
  destinations: string[]
  /** Readiness codes the API still reports; a clean submission has none. */
  blockerCodes: string[]
  noticeCodes: string[]
  /** Newest first. */
  reviews: SubmissionReview[]
}

export type ReleaseQueueFilter = {
  status?: ReleaseQueueStatus
  query?: string
}

export type ApproveSubmissionInput = {
  release: ReleaseSubmission
  message?: string
}

export type RequestSubmissionChangesInput = {
  release: ReleaseSubmission
  requiredChanges: string[]
  recommendations: string[]
  message?: string
}

/** Only SUBMITTED releases can be decided; the API re-checks the version on write. */
export function canDecideOnRelease(release: ReleaseSubmission): PolicyDecision {
  if (release.status !== 'SUBMITTED') {
    return { allowed: false, reason: `"${release.title}" is not awaiting review.` }
  }
  return POLICY_ALLOWED
}

/** Only a release whose publishing failed can be retried; the API re-checks the status. */
export function canRetryPublishing(release: ReleaseSubmission): PolicyDecision {
  if (release.status !== 'PUBLISH_FAILED') {
    return { allowed: false, reason: `Publishing "${release.title}" has not failed.` }
  }
  return POLICY_ALLOWED
}

/** Bitrate can take down a release that went live, including one the artist hid. */
export function canTakeDownRelease(release: ReleaseSubmission): PolicyDecision {
  if (release.status !== 'RELEASED' && release.status !== 'UNPUBLISHED') {
    return { allowed: false, reason: `"${release.title}" is not live on Bitrate.` }
  }
  return POLICY_ALLOWED
}

/**
 * Trims, drops blanks and duplicates, keeping the reviewer's order — the API rejects duplicates,
 * and a list the reviewer typed with an accidental repeat should not fail for it.
 */
export function normalizeReviewItems(items: readonly string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const raw of items) {
    const item = raw.trim()
    if (!item || seen.has(item)) continue
    seen.add(item)
    result.push(item)
  }
  return result
}
