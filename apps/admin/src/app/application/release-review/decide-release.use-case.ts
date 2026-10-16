import { inject, Injectable } from '@angular/core'
import {
  type ApproveSubmissionInput,
  canDecideOnRelease,
  normalizeReviewItems,
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
   * @throws {ActionNotAllowedError} When the release is not awaiting review or no required
   * change was given.
   */
  requestChanges({
    release,
    requiredChanges,
    recommendations,
    message,
  }: RequestSubmissionChangesInput): Promise<SubmissionReview> {
    const decision = canDecideOnRelease(release)
    if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)
    const required = normalizeReviewItems(requiredChanges)
    if (required.length === 0) {
      throw new ActionNotAllowedError('List at least one change the artist must make.')
    }

    return this.releases.requestChanges({
      id: release.id,
      expectedUpdatedAt: release.updatedAt,
      requiredChanges: required,
      recommendations: normalizeReviewItems(recommendations),
      message: optionalText(message),
    })
  }
}
