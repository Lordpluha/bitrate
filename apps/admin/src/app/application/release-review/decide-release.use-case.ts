import { inject, Injectable } from '@angular/core'
import {
  type ApproveSubmissionInput,
  canDecideOnRelease,
  ReleaseReviewRepository,
  type RequestSubmissionChangesInput,
  type SubmissionReview,
} from '@domain/release-review'
import { ActionNotAllowedError } from '@domain/shared'

function optionalText(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

@Injectable({ providedIn: 'root' })
export class DecideReleaseUseCase {
  private readonly releases = inject(ReleaseReviewRepository)

  /** @throws {ActionNotAllowedError} When the release is not awaiting review. */
  approve({ release, message }: ApproveSubmissionInput): Promise<SubmissionReview> {
    const decision = canDecideOnRelease(release)
    if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)

    return this.releases.approve({
      id: release.id,
      expectedUpdatedAt: release.updatedAt,
      message: optionalText(message),
    })
  }

  /**
   * @throws {ActionNotAllowedError} When the release is not awaiting review or the feedback is
   * empty.
   */
  requestChanges({ release, message }: RequestSubmissionChangesInput): Promise<SubmissionReview> {
    const decision = canDecideOnRelease(release)
    if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)
    const feedback = optionalText(message)
    if (!feedback) {
      throw new ActionNotAllowedError('Tell the artist what to change.')
    }

    return this.releases.requestChanges({
      id: release.id,
      expectedUpdatedAt: release.updatedAt,
      message: feedback,
    })
  }
}
