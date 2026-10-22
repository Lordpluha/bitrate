import type { SortInput } from '@common/sort'
import type { AdminResourceStatus } from '@modules/admin/shared'
import type { Prisma, TrackProcessingStatus } from '@prisma/client'
import type { ADMIN_TRACKS_SORT_FIELDS } from './dtos'
import type {
  AdminTrackAlbumEntity,
  AdminTrackArtistCreditEntity,
  AdminTrackFileEntity,
  AdminTrackGenreEntity,
} from './entities'

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

/** The columns an {@link AdminTrackRow} is built from — not every `Track` column. */
export const TRACK_ROW_SELECT = {
  id: true,
  title: true,
  artistId: true,
  artist: { select: { username: true } },
  cover: true,
  processingStatus: true,
  processingError: true,
  processingAttempts: true,
  processingStartedAt: true,
  processingFinishedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.TrackSelect

/** Prisma's include shape for hydrating an {@link AdminTrackDetail}. */
export const DETAIL_INCLUDE = {
  artist: { select: { username: true } },
  audioFiles: { select: { id: true, format: true, bitrate: true, codec: true, size: true } },
  artists: { include: { artist: { select: { username: true } } } },
  genres: { include: { genre: { select: { id: true, name: true, slug: true } } } },
  albums: { include: { album: { select: { id: true, title: true } } } },
} satisfies Prisma.TrackInclude

/** What the state pre-checks read. */
export const DELETED_AT_SELECT = { deletedAt: true } as const satisfies Prisma.TrackSelect

export type TrackRowRecord = Prisma.TrackGetPayload<{ select: typeof TRACK_ROW_SELECT }>
export type TrackWithDetail = Prisma.TrackGetPayload<{ include: typeof DETAIL_INCLUDE }>

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
