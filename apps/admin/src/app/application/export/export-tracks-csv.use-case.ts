import { inject, Injectable } from '@angular/core'
import type { TrackFilter } from '@domain/track'
import { ExportRepository } from '@domain/export'
import type { CsvDownload } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class ExportTracksCsvUseCase {
  private readonly exports = inject(ExportRepository)

  /** The server CSV of every tracks row matching `filter` — the list's own filter and sort. */
  execute(filter: TrackFilter): Promise<CsvDownload> {
    return this.exports.exportTracks(filter)
  }
}
