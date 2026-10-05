import { inject, Injectable } from '@angular/core'
import type { UserFilter } from '@domain/user'
import { ExportRepository } from '@domain/export'
import type { CsvDownload } from '@domain/shared'

@Injectable({ providedIn: 'root' })
export class ExportUsersCsvUseCase {
  private readonly exports = inject(ExportRepository)

  /** The server CSV of every users row matching `filter` — the list's own filter and sort. */
  execute(filter: UserFilter): Promise<CsvDownload> {
    return this.exports.exportUsers(filter)
  }
}
