import { z } from 'zod'

export type SavedPlaylistLibraryItem = {
  cover?: string
  id: string
  title: string
  tracksCount?: number
  username: string
}

const savedPlaylistsStoragePrefix = 'bitrate:web-player:saved-playlists'

export const savedPlaylistsChangedEvent =
  'bitrate:web-player:saved-playlists-changed'

export const getSavedPlaylistsStorageKey = (userId: string | undefined) =>
  `${savedPlaylistsStoragePrefix}:${userId ?? 'anonymous'}`

const savedPlaylistLibraryItemSchema = z.object({
  cover: z.string().optional(),
  id: z.string(),
  title: z.string(),
  tracksCount: z.number().optional(),
  username: z.string(),
})

const savedPlaylistsSchema = z.array(savedPlaylistLibraryItemSchema)

export const getSavedPlaylists = (storageKey: string) => {
  const rawValue = window.localStorage.getItem(storageKey)
  if (!rawValue) return []

  try {
    const result = savedPlaylistsSchema.safeParse(JSON.parse(rawValue))
    return result.success ? result.data : []
  } catch {
    return []
  }
}

export const savePlaylistToLibrary = (
  storageKey: string,
  playlist: SavedPlaylistLibraryItem,
) => {
  const currentPlaylists = getSavedPlaylists(storageKey)
  const nextPlaylists = [
    playlist,
    ...currentPlaylists.filter((item) => item.id !== playlist.id),
  ]

  window.localStorage.setItem(storageKey, JSON.stringify(nextPlaylists))
  window.dispatchEvent(new Event(savedPlaylistsChangedEvent))
}

export const removeSavedPlaylistFromLibrary = (
  storageKey: string,
  playlistId: string,
) => {
  const nextPlaylists = getSavedPlaylists(storageKey).filter(
    (playlist) => playlist.id !== playlistId,
  )

  window.localStorage.setItem(storageKey, JSON.stringify(nextPlaylists))
  window.dispatchEvent(new Event(savedPlaylistsChangedEvent))
}
