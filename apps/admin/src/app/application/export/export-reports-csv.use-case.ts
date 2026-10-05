import { inject, Injectable } from '@angular/core'
import type { ModerationFilter } from '@domain/moderation'
import { ExportRepository } from '@domain/export'
import type { CsvDownload } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class ExportReportsCsvUseCase {
  private readonly exports = inject(ExportRepository)

  /** The server CSV of every reports row matching `filter` — the list's own filter and sort. */
  execute(filter: ModerationFilter): Promise<CsvDownload> {
    return this.exports.exportReports(filter)
  }
}
