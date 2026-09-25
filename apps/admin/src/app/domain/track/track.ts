import type { PolicyDecision } from '../shared/policy-decision'
import { POLICY_ALLOWED } from '../shared/policy-decision'
import type { ResourceStatus } from '../shared/resource-status'
import type { Sort } from '../shared/sort'

/**
 * Declared here rather than imported from `@bitrate/contracts`, so this layer depends on nothing
 * generated. The binding is not lost: `infrastructure/catalog` maps the contract's union onto
 * this one through an exhaustive record, so a status the API grows later is a compile error in
 * the mapper instead of an empty screen in front of an operator.
 */
export type TrackProcessingStatus = 'PROCESSING' | 'READY' | 'FAILED'

/**
 * The columns the catalog can be ordered by. See `ArtistSortField` for the same binding, done
 * here in `infrastructure/catalog/track.mapper.ts`.
 *
 * Choosing any sort replaces the attention-first default below — the API documents this, and
 * `catalog.html` says so plainly whenever `sort` is unset.
 */
export type TrackSortField = 'createdAt' | 'title' | 'processingStatus'

/** A track and the state of its upload pipeline. */
export type Track = {
  id: string
  title: string
  artistUsername: string
  /** Absolute URL to the track's cover image, joined from the stored filename. `null` with none. */
  coverUrl: string | null
  processingStatus: TrackProcessingStatus
  processingError: string | null
  processingAttempts: number
  processingStartedAt: Date | null
  processingFinishedAt: Date | null
  /** When the row was last written. `isTrackStuck` falls back to this when processing never started. */
  updatedAt: Date
  /** Set when an operator took the track down. Named for what the panel does — see `User.deactivatedAt`. */
  takenDownAt: Date | null
  createdAt: Date
}

/** One stored audio rendition of a track. */
export type TrackAudioFile = {
  id: string
  format: string
  bitrate: number
  codec: string | null
  size: number | null
}

/** One artist credited on a track. */
type TrackArtistCredit = {
  artistId: string
  username: string
  isPrimary: boolean
  position: number
}

/** A genre attached to a track. */
type TrackGenre = {
  id: string
  name: string
  slug: string
}

/** An album a track appears on. */
type TrackAlbum = {
  id: string
  title: string
  trackNumber: number
  discNumber: number
}

/** A track's full detail view — the catalog row plus its renditions, credits, and reports. */
export type TrackDetail = Track & {
  artistId: string
  audioFiles: TrackAudioFile[]
  artists: TrackArtistCredit[]
  genres: TrackGenre[]
  albums: TrackAlbum[]
  openReportCount: number
}

/** A playable URL for one rendition, returned once `probeAudio` confirms the session and file. */
export type TrackAudioSource = {
  url: string
  bitrate: number
}

/**
 * The single format this panel plays: fMP4/AAC with the index up front plays natively through
 * `<audio src>` in Chrome, Firefox and Safari, while Ogg/Opus fails in Safari and HLS needs hls.js.
 */
const LISTENABLE_FORMAT = 'cmaf'

/**
 * Whether an operator can play a track from the detail page. Taken-down tracks are allowed —
 * an operator reviewing a report must be able to hear the content — so this checks
 * `processingStatus` and the presence of a CMAF rendition only, never `takenDownAt`.
 */
export function canListen(track: TrackDetail): PolicyDecision {
  if (track.processingStatus !== 'READY') {
    return { allowed: false, reason: `"${track.title}" has not finished processing.` }
  }

  if (!track.audioFiles.some((file) => file.format === LISTENABLE_FORMAT)) {
    return { allowed: false, reason: `"${track.title}" has no playable rendition.` }
  }

  return POLICY_ALLOWED
}

/** The track's CMAF renditions, highest bitrate first — what the quality selector offers. */
export function listenableRenditions(track: TrackDetail): TrackAudioFile[] {
  return track.audioFiles
    .filter((file) => file.format === LISTENABLE_FORMAT)
    .sort((a, b) => b.bitrate - a.bitrate)
}

/** What an operator can narrow the catalog by. */
export type TrackFilter = {
  query?: string
  processingStatus?: TrackProcessingStatus
  status?: ResourceStatus
  sort?: Sort<TrackSortField>
}

/**
 * How long a track may sit in PROCESSING before it is worth an operator's attention.
 *
 * Not a server rule — the pipeline has no timeout — so it is this panel's judgement, stated once
 * here rather than buried in a template expression where nobody would find it. Kept only for
 * `isTrackStuck`'s catalog-list badge; `GET /admin/overview` mirrors this same value server-side
 * and returns it as `tracks.stuckAfterMs`, which is the one the dashboard tile reads — see
 * `domain/overview/overview.ts`. Two copies of one literal, not two sources of truth: change this
 * one and `apps/api`'s `AdminOverviewService.STUCK_AFTER_MS` together.
 */
export const STUCK_AFTER_MS = 30 * 60 * 1000

type TrackAtInput = {
  track: Track
  /** Injectable so the rule is testable without freezing the clock. */
  now?: Date
}

/**
 * A track still PROCESSING long past when it should have finished.
 *
 * Mirrors the API's own rule exactly: `processingStartedAt` when the pipeline recorded one,
 * `updatedAt` otherwise — a track that never got as far as being claimed still ages off
 * `updatedAt` rather than reading as fresh forever.
 */
export function isTrackStuck({ track, now = new Date() }: TrackAtInput): boolean {
  if (track.processingStatus !== 'PROCESSING') return false

  const reference = track.processingStartedAt ?? track.updatedAt
  return now.getTime() - reference.getTime() > STUCK_AFTER_MS
}

/** The two ways a track earns a place on an operator's to-do list. */
export function trackNeedsAttention(input: TrackAtInput): boolean {
  return input.track.processingStatus === 'FAILED' || isTrackStuck(input)
}

/** A finished or taken-down track has nothing to re-run; anything else can be pushed through again. */
export function canReprocess(track: Track): boolean {
  return track.processingStatus !== 'READY' && track.takenDownAt === null
}

/** Only what the client can know locally — the API is still the enforcement point on a 409. */
export function canTakeDownTrack(track: Track): PolicyDecision {
  if (track.takenDownAt !== null) {
    return { allowed: false, reason: `"${track.title}" is already taken down.` }
  }

  return POLICY_ALLOWED
}

export function canRestoreTrack(track: Track): PolicyDecision {
  if (track.takenDownAt === null) {
    return { allowed: false, reason: `"${track.title}" is not taken down.` }
  }

  return POLICY_ALLOWED
}
