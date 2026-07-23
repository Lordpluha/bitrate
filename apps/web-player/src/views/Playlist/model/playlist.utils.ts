import type { TrackEntity } from '@/entities/Track'
import { getPlaylistCoverUrl, getTrackCoverUrl } from '@/shared/utils/mediaUrl'

export const getPlaylistCover = (
  cover: string | null | undefined,
  tracks: TrackEntity[],
) => {
  if (cover) return getPlaylistCoverUrl(cover)
  if (tracks[0]?.cover) return getTrackCoverUrl(tracks[0].cover)

  return getPlaylistCoverUrl(null)
}

export const shuffleTracks = (sourceTracks: TrackEntity[]) => {
  const shuffledTracks = [...sourceTracks]

  for (let index = shuffledTracks.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentTrack = shuffledTracks[index]
    shuffledTracks[index] = shuffledTracks[randomIndex] as TrackEntity
    shuffledTracks[randomIndex] = currentTrack as TrackEntity
  }

  return shuffledTracks
}
