import type { PolicyDecision } from '../shared/policy-decision'
import { POLICY_ALLOWED } from '../shared/policy-decision'
import type { ResourceStatus } from '../shared/resource-status'
import type { Sort } from '../shared/sort'
import type { TrackProcessingStatus } from '../track/track'

/**
 * Declared here rather than imported from `@bitrate/contracts`; `infrastructure/albums` maps the
 * contract's union onto this one through an exhaustive record, so a release type the API grows
 * later is a compile error in the mapper instead of an empty screen.
 */
export type AlbumType = 'ALBUM' | 'SINGLE' | 'EP' | 'COMPILATION'

/** The columns the album list can be ordered by; bound to the contract in `album.mapper.ts`. */
export type AlbumSortField = 'createdAt' | 'title' | 'releaseDate'

/** An album as one row of the operator list. */
export type Album = {
  id: string
  title: string
  artistId: string
  artistUsername: string
  /** Absolute URL to the cover, joined from the stored filename. `null` with none. */
  coverUrl: string | null
  type: AlbumType
  totalTracks: number
  releaseDate: Date | null
  /** Set when an operator took the album down. Its tracks are not affected. */
  takenDownAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** One track on an album, as seen from the album detail page. */
export type AlbumTrack = {
  id: string
  title: string
  trackNumber: number
  discNumber: number
  processingStatus: TrackProcessingStatus
  /** The track's own take-down, independent of the album's. */
  takenDownAt: Date | null
}

/** An album's full detail view: the row, its metadata and its tracks in disc/track order. */
export type AlbumDetail = Album & {
  description: string | null
  label: string | null
  copyright: string | null
  tracks: AlbumTrack[]
}

/** What an operator can narrow the album list by. */
export type AlbumFilter = {
  query?: string
  status?: ResourceStatus
  artistId?: string
  sort?: Sort<AlbumSortField>
}

/** Only what the client can know locally; the API stays the enforcement point on a 409. */
export function canTakeDownAlbum(album: Album): PolicyDecision {
  if (album.takenDownAt !== null) {
    return { allowed: false, reason: `"${album.title}" is already taken down.` }
  }

  return POLICY_ALLOWED
}

export function canRestoreAlbum(album: Album): PolicyDecision {
  if (album.takenDownAt === null) {
    return { allowed: false, reason: `"${album.title}" is not taken down.` }
  }

  return POLICY_ALLOWED
}
