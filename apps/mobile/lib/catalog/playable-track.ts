/**
 * The player's view of a track: just enough to show it and open a play session. Sources differ
 * (feed, history, search, playlists), so each maps into this shape at its own boundary.
 */
export type PlayableTrack = {
  id: string
  title: string
  /** Artist display name when the source carries one (album/playlist tracks do not). */
  artistName: string | null
  artistId: string | null
  coverUrl: string | null
  /** Duration in seconds when known before playback starts. */
  durationSec: number | null
}

/** Where a queue came from, so the UI can label "Playing from …". */
export type QueueSource = {
  kind: 'album' | 'playlist' | 'liked' | 'history' | 'search' | 'feed'
  id?: string
  title?: string
}
