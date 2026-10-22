/** The podcast page's episode filters; Unplayed waits for listening progress. */
export type EpisodeFilter = 'newest' | 'saved'

type FilterableEpisode = {
  description: string | null
  id: string
  podcastId: string
  releaseDate: string | null
  title: string
}

type FilterSavedEpisodesInput<TEpisode extends FilterableEpisode> = {
  episodes: TEpisode[]
  podcastId: string
  query: string
}

const releaseTime = ({ releaseDate }: FilterableEpisode) =>
  releaseDate ? new Date(releaseDate).getTime() : Number.MIN_SAFE_INTEGER

/**
 * The Saved filter: this show's episodes from the listener's whole saved library, newest first
 * (undated last), matching the search in title or description like the server does for Newest.
 */
export const filterSavedEpisodes = <TEpisode extends FilterableEpisode>({
  episodes,
  podcastId,
  query,
}: FilterSavedEpisodesInput<TEpisode>): TEpisode[] => {
  const needle = query.trim().toLowerCase()

  return episodes
    .filter((episode) => episode.podcastId === podcastId)
    .filter(
      (episode) =>
        !needle ||
        episode.title.toLowerCase().includes(needle) ||
        (episode.description ?? '').toLowerCase().includes(needle),
    )
    .sort((left, right) => releaseTime(right) - releaseTime(left))
}
