import { resolveMediaUrl } from '@/lib/api/media-url'

import type { PlayableTrack } from './playable-track'
import type { SearchResult } from './search-query'

/** A `tracks` search hit as a playable track; its subtitle is the artist name. */
export function searchResultToTrack(result: SearchResult): PlayableTrack {
  return {
    id: result.id,
    title: result.title,
    artistName: result.subtitle,
    artistId: result.artistId,
    coverUrl: resolveMediaUrl(result.image, 'tracks/covers'),
    durationSec: null,
  }
}
