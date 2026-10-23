import type { ReleaseKind, ReviewedReleaseStatus } from '@domain/release-review'

/** Transloco keys of the release vocabulary the queue and the review page share. */
export const RELEASE_KIND_KEYS: Record<ReleaseKind, string> = {
  ALBUM: 'release.kind.ALBUM',
  SINGLE: 'release.kind.SINGLE',
  EP: 'release.kind.EP',
  COMPILATION: 'release.kind.COMPILATION',
}

export const RELEASE_STATUS_KEYS: Record<ReviewedReleaseStatus, string> = {
  DRAFT: 'release.status.DRAFT',
  SUBMITTED: 'release.status.SUBMITTED',
  READY: 'release.status.READY',
  REJECTED: 'release.status.REJECTED',
  RELEASED: 'release.status.RELEASED',
}

export type StatusBadgeVariant = 'success' | 'warning' | 'info' | 'destructive' | 'secondary'

export const RELEASE_STATUS_BADGES = {
  DRAFT: 'secondary',
  SUBMITTED: 'warning',
  READY: 'success',
  REJECTED: 'destructive',
  RELEASED: 'success',
} as const satisfies Record<ReviewedReleaseStatus, StatusBadgeVariant>

/** Readiness blockers by API code; the template shows an unknown code verbatim. */
export const RELEASE_BLOCKER_KEYS: Record<string, string> = {
  NO_TRACKS: 'release.blocker.NO_TRACKS',
  COVER_MISSING: 'release.blocker.COVER_MISSING',
  TRACK_AUDIO_MISSING: 'release.blocker.TRACK_AUDIO_MISSING',
  MASTER_OWNER_MISSING: 'release.blocker.MASTER_OWNER_MISSING',
  WRITERS_NOT_CONFIRMED: 'release.blocker.WRITERS_NOT_CONFIRMED',
  ACCURACY_NOT_CONFIRMED: 'release.blocker.ACCURACY_NOT_CONFIRMED',
  CONTRIBUTOR_ROLES_MISSING: 'release.blocker.CONTRIBUTOR_ROLES_MISSING',
  SPLITS_INCOMPLETE: 'release.blocker.SPLITS_INCOMPLETE',
}

/** Non-blocking readiness notices by API code. */
export const RELEASE_NOTICE_KEYS: Record<string, string> = {
  UPC_MISSING: 'release.notice.UPC_MISSING',
  ISRC_MISSING: 'release.notice.ISRC_MISSING',
}

export const RELEASE_RIGHT_KEYS: Record<string, string> = {
  RECORDING: 'release.right.RECORDING',
  COMPOSITION: 'release.right.COMPOSITION',
}

/** Contributor credit roles by API code; an unknown code is shown verbatim. */
export const RELEASE_ROLE_KEYS: Record<string, string> = {
  PERFORMER: 'release.role.PERFORMER',
  PRODUCER: 'release.role.PRODUCER',
  COMPOSER: 'release.role.COMPOSER',
  LYRICIST: 'release.role.LYRICIST',
  OTHER: 'release.role.OTHER',
}

/** Store names are brands — the same in every language. */
export const RELEASE_DESTINATION_LABELS: Record<string, string> = {
  SPOTIFY: 'Spotify',
  APPLE_MUSIC: 'Apple Music',
  YOUTUBE_MUSIC: 'YouTube Music',
  AMAZON_MUSIC: 'Amazon Music',
  DEEZER: 'Deezer',
  TIDAL: 'TIDAL',
}
