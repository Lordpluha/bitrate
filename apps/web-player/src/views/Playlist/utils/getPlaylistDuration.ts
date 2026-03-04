import type { TrackEntity } from '@entities/Track/models/schema/Track.entity'

export const getPlaylistDuration = (tracks?: TrackEntity[]) => {
  const totalDuration =
    tracks?.reduce((acc, track) => acc + (track.duration || 0), 0) || 0
  return totalDuration
}
