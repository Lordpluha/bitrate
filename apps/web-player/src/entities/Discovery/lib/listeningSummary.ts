import type { z } from 'zod'
import type {
  topArtistsSchema,
  topTracksSchema,
} from '@/entities/Discovery/api/client/discovery.schemas'

type TopArtists = z.infer<typeof topArtistsSchema>
type TopTracks = z.infer<typeof topTracksSchema>

/** One of the design's Stat Tiles: a label over a big value, with a muted line under it. */
export type ListeningStat = {
  label: string
  sub: string
  value: string
}

type SummarizeListeningInput = {
  artists: TopArtists
  tracks: TopTracks
}

const formatPlays = (plays: number) =>
  `${plays.toLocaleString('en-US')} ${plays === 1 ? 'play' : 'plays'}`

/**
 * The stat tiles the API can back: how many tracks and artists were played in the window
 * (the top lists' totals) and the most played of each. `null` before the first play.
 */
export const summarizeListening = ({
  artists,
  tracks,
}: SummarizeListeningInput): ListeningStat[] | null => {
  const [topArtist] = artists.data
  const [topTrack] = tracks.data
  if (!topArtist || !topTrack) return null

  return [
    {
      label: 'Tracks',
      sub: 'tracks played',
      value: tracks.total.toLocaleString('en-US'),
    },
    {
      label: 'Artists',
      sub: 'artists played',
      value: artists.total.toLocaleString('en-US'),
    },
    {
      label: 'Top artist',
      sub: formatPlays(topArtist.plays),
      value: topArtist.username,
    },
    {
      label: 'Top track',
      sub: topTrack.artist
        ? `${formatPlays(topTrack.plays)} · ${topTrack.artist.username}`
        : formatPlays(topTrack.plays),
      value: topTrack.title,
    },
  ]
}
