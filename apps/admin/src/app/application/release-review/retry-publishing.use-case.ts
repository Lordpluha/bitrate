import { inject, Injectable } from '@angular/core'
import {
  canRetryPublishing,
  canTakeDownRelease,
  ReleaseReviewRepository,
  type ReleaseSubmission,
} from '@domain/release-review'
import { ActionNotAllowedError } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class RetryPublishingUseCase {
  private readonly releases = inject(ReleaseReviewRepository)

  /** @throws {ActionNotAllowedError} When the release's publishing has not failed. */
  execute(release: ReleaseSubmission): Promise<void> {
    const decision = canRetryPublishing(release)
    if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)
    return this.releases.retryPublishing(release.id)
  }
}

@Injectable({ providedIn: 'root' })
export class TakeDownReleaseUseCase {
  private readonly releases = inject(ReleaseReviewRepository)

  /** @throws {ActionNotAllowedError} When the release is not live on Bitrate. */
  execute(release: ReleaseSubmission): Promise<void> {
    const decision = canTakeDownRelease(release)
    if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)
    return this.releases.takeDown(release.id)
  }
}
