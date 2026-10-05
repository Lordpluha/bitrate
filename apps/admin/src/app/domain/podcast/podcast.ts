import type { PolicyDecision } from '../shared/policy-decision'
import { POLICY_ALLOWED } from '../shared/policy-decision'
import type { ResourceStatus } from '../shared/resource-status'
import type { Sort } from '../shared/sort'

/** The columns the podcast list can be ordered by; bound to the contract in `podcast.mapper.ts`. */
export type PodcastSortField = 'createdAt' | 'title'

/** A podcast as one row of the operator list. */
export type Podcast = {
  id: string
  title: string
  publisher: string
  /** Absolute URL to the cover. `null` with none. */
  coverUrl: string | null
  language: string | null
  explicit: boolean
  /** Every episode the podcast has, taken-down ones included. */
  episodeCount: number
  /** Set when an operator took the podcast down. Its episodes keep their own state. */
  takenDownAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** One episode of a podcast, as seen from the podcast detail page. */
export type PodcastEpisode = {
  id: string
  podcastId: string
  title: string
  durationSeconds: number | null
  releaseDate: Date | null
  explicit: boolean
  /** The episode's own take-down, independent of the podcast's. */
  takenDownAt: Date | null
}

/** A podcast's full detail view: the row, its description and every episode. */
export type PodcastDetail = Podcast & {
  description: string | null
  episodes: PodcastEpisode[]
}

/** What an operator can narrow the podcast list by. */
export type PodcastFilter = {
  query?: string
  status?: ResourceStatus
  sort?: Sort<PodcastSortField>
}

/** What an episode take-down or restore sends; the episode is addressed through its podcast. */
export type EpisodeTakeDownInput = {
  podcastId: string
  episodeId: string
  reason?: string
}

/** Only what the client can know locally; the API stays the enforcement point on a 409. */
export function canTakeDownPodcast(podcast: Podcast): PolicyDecision {
  if (podcast.takenDownAt !== null) {
    return { allowed: false, reason: `"${podcast.title}" is already taken down.` }
  }

  return POLICY_ALLOWED
}

export function canRestorePodcast(podcast: Podcast): PolicyDecision {
  if (podcast.takenDownAt === null) {
    return { allowed: false, reason: `"${podcast.title}" is not taken down.` }
  }

  return POLICY_ALLOWED
}

export function canTakeDownEpisode(episode: PodcastEpisode): PolicyDecision {
  if (episode.takenDownAt !== null) {
    return { allowed: false, reason: `"${episode.title}" is already taken down.` }
  }

  return POLICY_ALLOWED
}

export function canRestoreEpisode(episode: PodcastEpisode): PolicyDecision {
  if (episode.takenDownAt === null) {
    return { allowed: false, reason: `"${episode.title}" is not taken down.` }
  }

  return POLICY_ALLOWED
}
