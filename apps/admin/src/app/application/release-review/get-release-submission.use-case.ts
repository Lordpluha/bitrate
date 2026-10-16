import { inject, Injectable } from '@angular/core'
import { ReleaseReviewRepository, type ReleaseSubmissionDetail } from '@domain/release-review'

@Injectable({ providedIn: 'root' })
export class GetReleaseSubmissionUseCase {
  private readonly releases = inject(ReleaseReviewRepository)

  execute(id: string): Promise<ReleaseSubmissionDetail> {
    return this.releases.getById(id)
  }

  audioUrl(releaseId: string, trackId: string): string {
    return this.releases.audioUrl(releaseId, trackId)
  }
}
