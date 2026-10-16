import { inject, Injectable } from '@angular/core'
import {
  type ReleaseQueueFilter,
  ReleaseReviewRepository,
  type ReleaseSubmission,
} from '@domain/release-review'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'

export type ListReleaseSubmissionsInput = {
  page: number
  filter?: ReleaseQueueFilter
}

@Injectable({ providedIn: 'root' })
export class ListReleaseSubmissionsUseCase {
  private readonly releases = inject(ReleaseReviewRepository)

  execute({ page, filter = {} }: ListReleaseSubmissionsInput): Promise<Page<ReleaseSubmission>> {
    return this.releases.list({ page, limit: DEFAULT_PAGE_SIZE, filter })
  }
}
