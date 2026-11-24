import { resolveMediaUrl } from '@/lib/api/media-url'

import type { FeedCard } from './feed-card'
import type { FeedItem } from './schemas/feed-schema'

/**
 * The feed sends untagged items; the section decides what they are — the same rule as the web
 * player's `mapDiscoveryFeedItem`: `new-releases` holds albums, `popular-playlists` playlists,
 * everything else tracks.
 */
export function mapFeedItem(sectionId: string, item: FeedItem): FeedCard {
  if (sectionId === 'new-releases') {
    return {
      kind: 'album',
      id: item.id,
      title: item.title,
      subtitle: item.artist?.username ?? null,
      imageUrl: resolveMediaUrl(item.cover, 'albums/covers'),
    }
  }

  if (sectionId === 'popular-playlists') {
    return {
      kind: 'playlist',
      id: item.id,
      title: item.title,
      subtitle: item.user?.username ?? item.description ?? null,
      imageUrl: resolveMediaUrl(item.cover, 'playlists/covers'),
    }
  }

  const imageUrl = resolveMediaUrl(item.cover, 'tracks/covers')
  const artistName = item.artist?.username ?? null
  return {
    kind: 'track',
    id: item.id,
    title: item.title,
    subtitle: artistName,
    imageUrl,
    track: {
      id: item.id,
      title: item.title,
      artistName,
      artistId: item.artistId ?? item.artist?.id ?? null,
      coverUrl: imageUrl,
      durationSec: item.duration ?? null,
    },
  }
}
