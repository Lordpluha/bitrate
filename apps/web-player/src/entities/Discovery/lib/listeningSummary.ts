import type { I18n } from '@shared/i18n'
import { formatNumber } from '@shared/utils/formatNumber'
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
  /** The tiles' labels and numbers follow the app locale. */
  i18n: I18n
  tracks: TopTracks
}

/**
 * The stat tiles the API can back: how many tracks and artists were played in the window
 * (the top lists' totals) and the most played of each. `null` before the first play.
 */
export const summarizeListening = ({
  artists,
  i18n: { locale, t, tp },
  tracks,
}: SummarizeListeningInput): ListeningStat[] | null => {
  const [topArtist] = artists.data
  const [topTrack] = tracks.data
  if (!topArtist || !topTrack) return null

  const formatPlays = (count: number) => tp({ count, key: 'stats.plays' })

  return [
    {
      label: t('stats.tracks'),
      sub: t('stats.tracksPlayed'),
      value: formatNumber({ locale, value: tracks.total }),
    },
    {
      label: t('stats.artists'),
      sub: t('stats.artistsPlayed'),
      value: formatNumber({ locale, value: artists.total }),
    },
    {
      label: t('stats.topArtist'),
      sub: formatPlays(topArtist.plays),
      value: topArtist.username,
    },
    {
      label: t('stats.topTrack'),
      sub: topTrack.artist
        ? t('stats.playsBy', {
            artist: topTrack.artist.username,
            plays: formatPlays(topTrack.plays),
          })
        : formatPlays(topTrack.plays),
      value: topTrack.title,
    },
  ]
}
