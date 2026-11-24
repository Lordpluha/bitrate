import { useQueryClient } from '@tanstack/react-query'

import { collectionTracksQuery } from '@/lib/catalog/collection-tracks-query'
import type { FeedCard } from '@/lib/catalog/feed-card'
import { usePlayerStore } from '@/lib/player/player-store'

/**
 * Starts whatever a feed card stands for: a track plays alone, an album or playlist is fetched
 * (through the cache) and queued from its first track. Returns false if there was nothing to play.
 */
export function usePlayCard(): (card: FeedCard) => Promise<boolean> {
  const queryClient = useQueryClient()
  const playQueue = usePlayerStore((player) => player.playQueue)

  return async (card) => {
    if (card.kind === 'track') {
      playQueue({ tracks: [card.track], startIndex: 0, source: { kind: 'feed' } })
      return true
    }

    let tracks
    try {
      tracks = await queryClient.fetchQuery(collectionTracksQuery({ kind: card.kind, id: card.id }))
    } catch {
      return false
    }
    if (tracks.length === 0) return false
    playQueue({ tracks, startIndex: 0, source: { kind: card.kind, id: card.id, title: card.title } })
    return true
  }
}
