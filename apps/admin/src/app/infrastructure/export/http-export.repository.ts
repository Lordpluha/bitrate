import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import type { ArtistFilter } from '@domain/artist'
import { ExportRepository } from '@domain/export'
import type { ModerationFilter } from '@domain/moderation'
import type { CsvDownload } from '@domain/shared'
import type { TrackFilter } from '@domain/track'
import type { UserFilter } from '@domain/user'
import { toArtistListFilters } from '../artists/artist.mapper'
import { toTrackListFilters } from '../catalog/track.mapper'
import { ADMIN_API } from '../http/api.config'
import { fetchCsv } from '../http/csv-download'
import { toReportListFilters } from '../moderation/report.mapper'
import { toUserListFilters } from '../users/user.mapper'

/**
 * Downloads the server-generated CSVs. Each route takes the same filter and sort as the matching
 * list, built by that list's own mapper function, so the file matches the rows on screen.
 */
@Injectable()
export class HttpExportRepository extends ExportRepository {
  private readonly http = inject(HttpClient)

  override exportUsers(filter: UserFilter): Promise<CsvDownload> {
    return fetchCsv({
      http: this.http,
      url: `${ADMIN_API}/users/export.csv`,
      filters: toUserListFilters(filter),
      fallbackFilename: 'users.csv',
    })
  }

  override exportArtists(filter: ArtistFilter): Promise<CsvDownload> {
    return fetchCsv({
      http: this.http,
      url: `${ADMIN_API}/artists/export.csv`,
      filters: toArtistListFilters(filter),
      fallbackFilename: 'artists.csv',
    })
  }

  override exportTracks(filter: TrackFilter): Promise<CsvDownload> {
    return fetchCsv({
      http: this.http,
      url: `${ADMIN_API}/tracks/export.csv`,
      filters: toTrackListFilters(filter),
      fallbackFilename: 'tracks.csv',
    })
  }

  override exportReports(filter: ModerationFilter): Promise<CsvDownload> {
    return fetchCsv({
      http: this.http,
      url: `${ADMIN_API}/moderation/reports/export.csv`,
      filters: toReportListFilters(filter),
      fallbackFilename: 'reports.csv',
    })
  }
}
