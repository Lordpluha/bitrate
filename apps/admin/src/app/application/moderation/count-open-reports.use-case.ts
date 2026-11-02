import { inject, Injectable } from '@angular/core'
import { type ModerationEntityType, ModerationReportRepository } from '@domain/moderation'

/**
 * How many open reports name one kind of content — the "Reported" figure on the Albums
 * and Playlists screens. Callers show it only to operators with `reports:read`, the
 * permission the moderation list itself needs.
 */
@Injectable({ providedIn: 'root' })
export class CountOpenReportsUseCase {
  private readonly reports = inject(ModerationReportRepository)

  async execute(entityType: ModerationEntityType): Promise<number> {
    const page = await this.reports.list({
      page: 1,
      limit: 1,
      filter: { status: 'OPEN', entityType },
    })
    return page.total
  }
}
