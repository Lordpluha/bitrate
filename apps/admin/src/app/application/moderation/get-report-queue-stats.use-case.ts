import { inject, Injectable } from '@angular/core'
import { ModerationReportRepository } from '@domain/moderation'

/** The figures above the moderation queue. */
export type ReportQueueStats = {
  open: number
  reviewing: number
  /** When the longest-waiting open report was filed; `null` when nothing is open. */
  oldestOpenAt: Date | null
}

/**
 * Reads the queue's KPIs from the list endpoint itself — one row per status, using only the
 * page total (and, for the open queue sorted oldest first, that row's date). The API has no
 * dedicated stats route for operators without `overview:read`, and this keeps the strip on the
 * same permission as the queue.
 */
@Injectable({ providedIn: 'root' })
export class GetReportQueueStatsUseCase {
  private readonly reports = inject(ModerationReportRepository)

  async execute(): Promise<ReportQueueStats> {
    const [open, reviewing] = await Promise.all([
      this.reports.list({
        page: 1,
        limit: 1,
        filter: { status: 'OPEN', sort: { field: 'createdAt', direction: 'asc' } },
      }),
      this.reports.list({ page: 1, limit: 1, filter: { status: 'REVIEWING' } }),
    ])
    return {
      open: open.total,
      reviewing: reviewing.total,
      oldestOpenAt: open.items[0]?.createdAt ?? null,
    }
  }
}
