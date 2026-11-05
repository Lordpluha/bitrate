import type { SortInput } from '@common/sort'
import type { AdminResourceStatus } from '@modules/admin/shared'
import type { TrackProcessingStatus } from '@prisma/client'
import type { ADMIN_TRACKS_SORT_FIELDS } from './dtos'
import type {
  AdminTrackAlbumEntity,
  AdminTrackArtistCreditEntity,
  AdminTrackFileEntity,
  AdminTrackGenreEntity,
} from './entities'
import type { TrackRowRecord } from './orm'

/** One of the track pipeline's allowed sort fields. */
export type AdminTracksSortField = (typeof ADMIN_TRACKS_SORT_FIELDS)[number]

/** Input for listing operator-facing tracks. */
export type ListTracksInput = {
  page?: number
  limit?: number
  processingStatus?: TrackProcessingStatus
  status?: AdminResourceStatus
  q?: string
} & SortInput<AdminTracksSortField>

/** The list filters without paging — what the CSV export and the `where` builders take. */
export type TrackListFilters = Omit<ListTracksInput, 'page' | 'limit'>

/** A row of the operator track list, with its primary artist's name resolved. */
export type AdminTrackRow = {
  id: string
  title: string
  artistId: string
  artistUsername: string
  cover: string | null
  processingStatus: TrackProcessingStatus
  processingError: string | null
  processingAttempts: number
  processingStartedAt: Date | null
  processingFinishedAt: Date | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** The extended detail shape shown on the track detail page. */
export type AdminTrackDetail = AdminTrackRow & {
  audioFiles: AdminTrackFileEntity[]
  artists: AdminTrackArtistCreditEntity[]
  genres: AdminTrackGenreEntity[]
  albums: AdminTrackAlbumEntity[]
  openReportCount: number
}

/** Flattens a track (with its artist joined) into the operator row shape — explicitly, so a
 * detail record passed in never leaks its extra columns into the row. */
export const toAdminTrackRow = (track: TrackRowRecord): AdminTrackRow => ({
  id: track.id,
  title: track.title,
  artistId: track.artistId,
  artistUsername: track.artist.username,
  cover: track.cover,
  processingStatus: track.processingStatus,
  processingError: track.processingError,
  processingAttempts: track.processingAttempts,
  processingStartedAt: track.processingStartedAt,
  processingFinishedAt: track.processingFinishedAt,
  deletedAt: track.deletedAt,
  createdAt: track.createdAt,
  updatedAt: track.updatedAt,
})
