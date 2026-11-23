import type { PolicyDecision } from '../shared/policy-decision'
import { POLICY_ALLOWED } from '../shared/policy-decision'
import type { ReviewedReleaseStatus } from './release-review'

/** What a change replaces on a published release. */
export type ReleaseChangeField = 'RELEASE_TITLE' | 'RELEASE_COVER' | 'RECORDING_TITLE'

export type ReleaseChangeStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED'

/** Open requests still have pending changes; closed ones were fully decided or withdrawn. */
export type ReleaseChangeQueueStatus = 'OPEN' | 'CLOSED'

/** One change request as a queue row. */
export type ReleaseChangeRequestRow = {
  id: string
  releaseId: string
  releaseTitle: string
  releaseCoverUrl: string | null
  artistUsername: string
  changeCount: number
  pendingCount: number
  createdAt: Date
  closedAt: Date | null
}

/** One proposed value with its before and after. */
export type ReleaseChange = {
  id: string
  field: ReleaseChangeField
  /** The renamed recording, for RECORDING_TITLE. */
  recordingId: string | null
  /** A title, or a cover image URL for RELEASE_COVER. */
  previousValue: string | null
  /** A title, or a cover image URL; `null` once a rejected cover's file is gone. */
  proposedValue: string | null
  status: ReleaseChangeStatus
  /** Why it was rejected, in Markdown. */
  reason: string | null
  decidedAt: Date | null
  /** `null` while pending, or once the deciding operator's account is gone. */
  reviewerUsername: string | null
}

export type ReleaseChangeRequestDetail = {
  id: string
  message: string | null
  createdAt: Date
  closedAt: Date | null
  release: {
    id: string
    title: string
    coverUrl: string | null
    status: ReviewedReleaseStatus
    artistId: string
    artistUsername: string
  }
  changes: ReleaseChange[]
}

/** A reviewer's outcome for one change; a rejection tells the artist why. */
export type ReleaseChangeDecision =
  | { changeId: string; decision: 'APPROVE' }
  | { changeId: string; decision: 'REJECT'; reason: string }

export type ReleaseChangeDecisionInput = {
  request: ReleaseChangeRequestDetail
  decisions: ReleaseChangeDecision[]
  message?: string
}

/** Only a pending change can be decided; the API re-checks it on write. */
export function canDecideChange(change: ReleaseChange): PolicyDecision {
  if (change.status !== 'PENDING') {
    return { allowed: false, reason: 'This change is no longer awaiting review.' }
  }
  return POLICY_ALLOWED
}
