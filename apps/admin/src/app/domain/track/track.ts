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
  processingStatus: TrackProcessingStatus
  processingError: string | null
  processingAttempts: number
  processingStartedAt: Date | null
  processingFinishedAt: Date | null
  createdAt: Date
}

/** What an operator can narrow the catalog by. */
export type TrackFilter = {
  query?: string
  processingStatus?: TrackProcessingStatus
  sort?: Sort<TrackSortField>
}

/**
 * How long a track may sit in PROCESSING before it is worth an operator's attention.
 *
 * Not a server rule — the pipeline has no timeout — so it is this panel's judgement, stated once
 * here rather than buried in a template expression where nobody would find it.
 */
export const STUCK_AFTER_MS = 30 * 60 * 1000

type TrackAtInput = {
  track: Track
  /** Injectable so the rule is testable without freezing the clock. */
  now?: Date
}

/** A track still PROCESSING long past when it should have finished. */
export function isTrackStuck({ track, now = new Date() }: TrackAtInput): boolean {
  if (track.processingStatus !== 'PROCESSING' || track.processingStartedAt === null) return false

  return now.getTime() - track.processingStartedAt.getTime() > STUCK_AFTER_MS
}

/** The two ways a track earns a place on an operator's to-do list. */
export function trackNeedsAttention(input: TrackAtInput): boolean {
  return input.track.processingStatus === 'FAILED' || isTrackStuck(input)
}

/** A finished track has nothing to re-run; anything else can be pushed through again. */
export function canReprocess(track: Track): boolean {
  return track.processingStatus !== 'READY'
}
