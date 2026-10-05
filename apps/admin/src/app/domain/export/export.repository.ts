import type { ArtistFilter } from '../artist/artist'
import type { ModerationFilter } from '../moderation/report'
import type { CsvDownload } from '../shared/csv-download'
import type { TrackFilter } from '../track/track'
import type { UserFilter } from '../user/user'

/**
 * The port for taking operator data out of the panel as CSV. Each call hands the screen's own
 * filter and sort to the server, which streams every matching row — the client never assembles the
 * file, so it can never be a dump of only the page on screen.
 */
export abstract class ExportRepository {
  abstract exportUsers(filter: UserFilter): Promise<CsvDownload>
  abstract exportArtists(filter: ArtistFilter): Promise<CsvDownload>
  abstract exportTracks(filter: TrackFilter): Promise<CsvDownload>
  abstract exportReports(filter: ModerationFilter): Promise<CsvDownload>
}
