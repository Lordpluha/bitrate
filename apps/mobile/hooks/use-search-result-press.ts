import { usePlayCard } from '@/hooks/use-play-card'
import type { SearchResponse, SearchResult } from '@/lib/catalog/search-query'
import { searchResultToTrack } from '@/lib/catalog/search-result-to-track'
import { usePlayerStore } from '@/lib/player/player-store'

/**
 * What pressing a search hit does: a track queues every track hit from that one, an album or
 * playlist plays from its first track. Artists have no screen in the MVP, so they are inert.
 */
export function useSearchResultPress(response: SearchResponse | undefined) {
  const playCard = usePlayCard()
  const playQueue = usePlayerStore((player) => player.playQueue)

  return (result: SearchResult): (() => void) | undefined => {
    if (result.type === 'artists') return undefined

    if (result.type === 'tracks') {
      return () => {
        const hits = response?.data.tracks ?? [result]
        const startIndex = Math.max(0, hits.findIndex((hit) => hit.id === result.id))
        playQueue({ tracks: hits.map(searchResultToTrack), startIndex, source: { kind: 'search' } })
      }
    }

    const kind = result.type === 'albums' ? 'album' : 'playlist'
    return () =>
      void playCard({ kind, id: result.id, title: result.title, subtitle: result.subtitle, imageUrl: null })
  }
}
