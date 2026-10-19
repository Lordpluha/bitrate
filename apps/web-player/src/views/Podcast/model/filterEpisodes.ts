/** The podcast page's episode filters; Unplayed waits for listening progress. */
export type EpisodeFilter = 'newest' | 'saved'

type FilterableEpisode = {
  description: string | null
  id: string
  releaseDate: string | null
  title: string
}

type FilterEpisodesInput<TEpisode extends FilterableEpisode> = {
  episodes: TEpisode[]
  filter: EpisodeFilter
  query: string
  savedIds: ReadonlySet<string>
}

const releaseTime = ({ releaseDate }: FilterableEpisode) =>
  releaseDate ? new Date(releaseDate).getTime() : Number.MIN_SAFE_INTEGER

/** Newest first (undated last), optionally only the saved ones, matching the search in title or description. */
export const filterEpisodes = <TEpisode extends FilterableEpisode>({
  episodes,
  filter,
  query,
  savedIds,
}: FilterEpisodesInput<TEpisode>): TEpisode[] => {
  const needle = query.trim().toLowerCase()

  return episodes
    .filter((episode) => filter !== 'saved' || savedIds.has(episode.id))
    .filter(
      (episode) =>
        !needle ||
        episode.title.toLowerCase().includes(needle) ||
        (episode.description ?? '').toLowerCase().includes(needle),
    )
    .sort((left, right) => releaseTime(right) - releaseTime(left))
}
