import type { Page, PageRequest, TakeDownInput } from '../shared'
import type { EpisodeTakeDownInput, Podcast, PodcastDetail, PodcastFilter } from './podcast'

export type ListPodcastsQuery = PageRequest & {
  filter: PodcastFilter
}

/** The port the podcast screens talk to. See `ArtistRepository` for why this is a class. */
export abstract class PodcastRepository {
  abstract list(query: ListPodcastsQuery): Promise<Page<Podcast>>
  /** A taken-down podcast and its taken-down episodes stay reachable for review. */
  abstract getById(id: string): Promise<PodcastDetail>
  /** Soft-deletes the podcast only; its episodes keep their own state. */
  abstract takeDown(input: TakeDownInput): Promise<void>
  abstract restore(input: TakeDownInput): Promise<void>
  /** Soft-deletes one episode only; the podcast and its other episodes are unchanged. */
  abstract takeDownEpisode(input: EpisodeTakeDownInput): Promise<void>
  abstract restoreEpisode(input: EpisodeTakeDownInput): Promise<void>
}
