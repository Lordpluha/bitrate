import type { ApiSchemas } from '@spotify/contracts'

type Track = ApiSchemas['TrackEntity']
type Playlist = ApiSchemas['PlaylistEntity']

// Helper to safely get artist name from track
export const getTrackArtist = (track: Track): string => {
  const artistData = (track as any).artist
  if (typeof artistData === 'string') return artistData
  if (artistData?.name) return artistData.name
  return 'Unknown Artist'
}

// Helper to safely get album name from track
export const getTrackAlbum = (track: Track): string => {
  return (track as any).album || 'Unknown Album'
}

// Helper to safely get duration from track
export const getTrackDuration = (track: Track): number => {
  return (track as any).duration || 0
}

// Helper to format duration as MM:SS
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

// Helper to get playlist owner username
export const getPlaylistOwner = (playlist: Playlist): string => {
  return (playlist as any).user?.username || 'Unknown'
}

// Helper to get playlist tracks count
export const getPlaylistTracksCount = (playlist: Playlist): number => {
  return (playlist as any).tracks?.length || 0
}

// Helper to get user username
export const getUsername = (user: any): string => {
  return user?.username || 'User'
}

// Helper to get playlist name (fallback to title)
export const getPlaylistName = (playlist: Playlist): string => {
  return (playlist as any).name || playlist.title
}

// Helper to get playlist image (fallback to cover)
export const getPlaylistImage = (playlist: Playlist): string => {
  return (playlist as any).imageUrl || playlist.cover || '/images/default-playlist.jpg'
}
