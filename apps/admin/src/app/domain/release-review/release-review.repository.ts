import type { Page, PageRequest } from '../shared'
import type {
  ReleaseQueueFilter,
  ReleaseSubmission,
  ReleaseSubmissionDetail,
  SubmissionReview,
} from './release-review'

export type ListReleaseSubmissionsQuery = PageRequest & {
  filter: ReleaseQueueFilter
}

export type ReleaseDecisionRequest = {
  id: string
  expectedUpdatedAt: Date
  message?: string
}

export type ReleaseChangesRequest = ReleaseDecisionRequest & {
  message: string
}

/** Why the API refused a decision; read from the status code in the adapter only. */
export type ReleaseReviewFailureReason = 'not-found' | 'stale' | 'invalid' | 'unknown'

export class ReleaseReviewError extends Error {
  constructor(readonly reason: ReleaseReviewFailureReason) {
    super(`Release review refused: ${reason}`)
    this.name = 'ReleaseReviewError'
  }
}

/** The port the review screens talk to. See `ArtistRepository` for why this is a class. */
export abstract class ReleaseReviewRepository {
  abstract list(query: ListReleaseSubmissionsQuery): Promise<Page<ReleaseSubmission>>
  abstract getById(id: string): Promise<ReleaseSubmissionDetail>
  /** Where the browser streams a submitted master from; the session cookie authorizes it. */
  abstract audioUrl(releaseId: string, trackId: string): string
  /** @throws {ReleaseReviewError} */
  abstract approve(input: ReleaseDecisionRequest): Promise<SubmissionReview>
  /** @throws {ReleaseReviewError} */
  abstract requestChanges(input: ReleaseChangesRequest): Promise<SubmissionReview>
  /** Restarts a failed publication; converted tracks are kept. @throws {ReleaseReviewError} */
  abstract retryPublishing(id: string): Promise<void>
  /** Takes a release offline; the artist cannot publish it again. @throws {ReleaseReviewError} */
  abstract takeDown(id: string): Promise<void>
}
