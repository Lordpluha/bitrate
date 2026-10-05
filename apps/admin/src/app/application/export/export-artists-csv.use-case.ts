import { inject, Injectable } from '@angular/core'
import type { ArtistFilter } from '@domain/artist'
import { ExportRepository } from '@domain/export'
import type { CsvDownload } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class ExportArtistsCsvUseCase {
  private readonly exports = inject(ExportRepository)

  /** The server CSV of every artists row matching `filter` — the list's own filter and sort. */
  execute(filter: ArtistFilter): Promise<CsvDownload> {
    return this.exports.exportArtists(filter)
  }
}
