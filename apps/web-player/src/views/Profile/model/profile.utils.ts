import type { ProfileTrack } from '@/views/Profile/model/profile.types'

export const getTrackArtistName = (track: ProfileTrack) =>
  track.artist?.username ?? track.artistId
