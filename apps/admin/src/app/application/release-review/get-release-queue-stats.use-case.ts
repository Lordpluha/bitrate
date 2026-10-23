import { inject, Injectable } from '@angular/core'
import { ReleaseReviewRepository } from '@domain/release-review'

/** The figures above the release queue. */
export type ReleaseQueueStats = {
  awaiting: number
  changesRequested: number
  /** When the longest-waiting submission was sent; `null` when nothing awaits review. */
  oldestAwaitingAt: Date | null
}

/**
 * Reads the queue's KPIs from the list endpoint itself — one row per status, using only the
 * page total and, for submissions awaiting review (which the API serves oldest first), that
 * row's submission date. Same permission as the queue; no stats route needed.
 */
@Injectable({ providedIn: 'root' })
export class GetReleaseQueueStatsUseCase {
  private readonly releases = inject(ReleaseReviewRepository)

  async execute(): Promise<ReleaseQueueStats> {
    const [awaiting, changesRequested] = await Promise.all([
      this.releases.list({ page: 1, limit: 1, filter: { status: 'SUBMITTED' } }),
      this.releases.list({ page: 1, limit: 1, filter: { status: 'REJECTED' } }),
    ])
    return {
      awaiting: awaiting.total,
      changesRequested: changesRequested.total,
      oldestAwaitingAt: awaiting.items[0]?.submittedAt ?? null,
    }
  }
}
