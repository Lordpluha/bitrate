import type { ProfileTrack } from '@/views/Profile/model/profile.types'

export const getTrackArtistName = (track: ProfileTrack) =>
  track.artist?.username ?? track.artistId

export const getUniqueTracks = (tracks: ProfileTrack[]) => {
  const seen = new Set<string>()

  return tracks.filter((track) => {
    if (seen.has(track.id)) return false
    seen.add(track.id)
    return true
  })
}
