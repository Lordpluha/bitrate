import type { ReleaseKind, ReviewedReleaseStatus } from '@domain/release-review'

export const RELEASE_KIND_LABELS = {
  ALBUM: 'Album',
  SINGLE: 'Single',
  EP: 'EP',
  COMPILATION: 'Compilation',
} as const satisfies Record<ReleaseKind, string>

export const RELEASE_STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Awaiting review',
  READY: 'Approved',
  REJECTED: 'Changes requested',
  RELEASED: 'Released',
} as const satisfies Record<ReviewedReleaseStatus, string>

export type StatusBadgeVariant = 'default' | 'outline' | 'destructive' | 'secondary'

export const RELEASE_STATUS_BADGES = {
  DRAFT: 'outline',
  SUBMITTED: 'secondary',
  READY: 'default',
  REJECTED: 'destructive',
  RELEASED: 'default',
} as const satisfies Record<ReviewedReleaseStatus, StatusBadgeVariant>

/** Readiness blockers by API code; the template shows an unknown code verbatim. */
export const RELEASE_BLOCKER_LABELS: Record<string, string> = {
  NO_TRACKS: 'No recordings',
  COVER_MISSING: 'No artwork',
  TRACK_AUDIO_MISSING: 'A recording has no audio',
  MASTER_OWNER_MISSING: 'Master owner not set',
  WRITERS_NOT_CONFIRMED: 'Writers not confirmed',
  ACCURACY_NOT_CONFIRMED: 'Accuracy not confirmed',
  CONTRIBUTOR_ROLES_MISSING: 'A contributor has no role',
  SPLITS_INCOMPLETE: 'Splits do not add up to 100%',
}

/** Non-blocking readiness notices by API code. */
export const RELEASE_NOTICE_LABELS: Record<string, string> = {
  UPC_MISSING: 'No UPC yet',
  ISRC_MISSING: 'A recording has no ISRC yet',
}

export const RELEASE_DESTINATION_LABELS: Record<string, string> = {
  SPOTIFY: 'Spotify',
  APPLE_MUSIC: 'Apple Music',
  YOUTUBE_MUSIC: 'YouTube Music',
  AMAZON_MUSIC: 'Amazon Music',
  DEEZER: 'Deezer',
  TIDAL: 'TIDAL',
}

export const RELEASE_RIGHT_LABELS: Record<string, string> = {
  RECORDING: 'Recording (master)',
  COMPOSITION: 'Composition (publishing)',
}
