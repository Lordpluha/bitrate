import type { PlaybackOrigin } from '@/entities/PlaybackEvent/model/playbackEvent.types'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** The store's `currentPlaylistId` for the liked-songs collection. */
const LIKED_SONGS = 'liked-songs'

type PlaybackOriginInput = {
  /** The player store's `currentPlaylistId`. */
  currentPlaylistId: string | null
}

/**
 * Reads where a play came from out of the player store's `currentPlaylistId`, whose values the
 * views set: `album:<id>`, `artist:<id>`, `liked-songs`, or a bare playlist id. A single track
 * started from search, home or charts carries no context yet and reports `OTHER`.
 */
export const playbackOriginOf = ({
  currentPlaylistId,
}: PlaybackOriginInput): PlaybackOrigin => {
  if (!currentPlaylistId) return { source: 'OTHER' }
  if (currentPlaylistId === LIKED_SONGS) return { source: 'LIBRARY' }

  const [prefix, id] = currentPlaylistId.split(':', 2)
  if (prefix === 'album' && id && UUID.test(id))
    return { source: 'ALBUM', sourceId: id }
  if (prefix === 'artist' && id && UUID.test(id))
    return { source: 'ARTIST', sourceId: id }
  if (UUID.test(currentPlaylistId))
    return { source: 'PLAYLIST', sourceId: currentPlaylistId }
  return { source: 'OTHER' }
}
