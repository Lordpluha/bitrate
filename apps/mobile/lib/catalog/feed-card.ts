import type { PlayableTrack } from './playable-track'

/** One tile of a home feed row. */
export type FeedCard =
  | { kind: 'track'; id: string; title: string; subtitle: string | null; imageUrl: string | null; track: PlayableTrack }
  | { kind: 'album' | 'playlist'; id: string; title: string; subtitle: string | null; imageUrl: string | null }

export type FeedRow = {
  id: string
  title: string
  cards: FeedCard[]
}
