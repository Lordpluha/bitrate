export type SavedPlaylistLibraryItem = {
  cover?: string
  id: string
  title: string
  tracksCount?: number
  username: string
}

const savedPlaylistsStoragePrefix = 'spotify:web-player:saved-playlists'

export const savedPlaylistsChangedEvent =
  'spotify:web-player:saved-playlists-changed'

export const getSavedPlaylistsStorageKey = (userId: string | undefined) =>
  `${savedPlaylistsStoragePrefix}:${userId ?? 'anonymous'}`

const getSavedPlaylists = (storageKey: string) => {
  const rawValue = window.localStorage.getItem(storageKey)
  if (!rawValue) return []

  try {
    const parsedValue = JSON.parse(rawValue)

    return Array.isArray(parsedValue)
      ? (parsedValue as SavedPlaylistLibraryItem[])
      : []
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
