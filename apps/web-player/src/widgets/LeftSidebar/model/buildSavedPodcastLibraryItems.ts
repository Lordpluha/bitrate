import type { SavedEpisode } from '@/entities/Podcast'
import { getPodcastCoverUrl } from '@/shared/utils/mediaUrl'
import type { LibraryMusicItem } from '@/widgets/LeftSidebar/model/library.types'

/** One sidebar destination per podcast, even when several episodes are saved. */
export const buildSavedPodcastLibraryItems = (
  episodes: SavedEpisode[],
): LibraryMusicItem[] => {
  const podcasts = new Map<string, LibraryMusicItem>()

  for (const episode of episodes) {
    if (podcasts.has(episode.podcastId)) continue

    podcasts.set(episode.podcastId, {
      cover: getPodcastCoverUrl(episode.podcast.cover),
      id: episode.podcastId,
      title: episode.podcast.title,
      tracksCount: 0,
      type: 'podcast',
      username: episode.podcast.publisher,
    })
  }

  return Array.from(podcasts.values())
}
