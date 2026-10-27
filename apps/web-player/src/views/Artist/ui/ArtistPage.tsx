'use client'

import { useArtist } from '@entities/Artist'
import { useLikedTracks } from '@entities/Track'
import { useImageColor } from '@shared/hooks/useImageColor'
import { getArtistBackgroundUrl } from '@shared/utils/mediaUrl'
import { type UIEventHandler, useMemo, useRef, useState } from 'react'
import { useI18n } from '@/shared/i18n'
import { useArtistContent } from '@/views/Artist/model/useArtistContent'
import { useArtistPlayback } from '@/views/Artist/model/useArtistPlayback'
import { ArtistCatalogue } from '@/views/Artist/ui/ArtistCatalogue'
import { ArtistCompactHeader } from '@/views/Artist/ui/ArtistCompactHeader'
import { ArtistHero } from '@/views/Artist/ui/ArtistHero'
import { ArtistPageState } from '@/views/Artist/ui/ArtistPageState'

export type ArtistPageProps = {
  artistId: string
}

export const ArtistPage = ({ artistId }: ArtistPageProps) => {
  const { t, tp } = useI18n()
  const {
    data: artist,
    error,
    isError,
    isPending,
    refetch,
  } = useArtist(artistId)
  const content = useArtistContent({ artistId })
  const heroRef = useRef<HTMLDivElement>(null)
  const [isCompactHeaderVisible, setIsCompactHeaderVisible] = useState(false)
  const { data: likedTracks } = useLikedTracks(1, 1000, undefined, {
    staleTime: 5 * 60_000,
  })
  const heroImageUrl = getArtistBackgroundUrl(
    artist?.backgroundImage,
    artist?.avatar,
  )
  const [artistRed, artistGreen, artistBlue] = useImageColor(heroImageUrl)

  const likedTrackIds = useMemo(
    () => new Set((likedTracks ?? []).map((track) => track.id)),
    [likedTracks],
  )

  const playback = useArtistPlayback({
    artistId,
    artistName: artist?.username ?? '',
    tracks: content.tracks,
    popularTracks: content.popularTracks,
  })

  if (isPending) return <ArtistPageState variant="loading" />
  if (isError || !artist) {
    return (
      <ArtistPageState
        error={error}
        onRetry={() => void refetch()}
        variant="error"
      />
    )
  }

  /**
   * Bitrate leads with monthly listeners; the catalogue counts are the
   * fallback for artists the API has no listener figure for yet.
   */
  const statsLabel = content.isPending
    ? t('artist.loadingCatalogue')
    : artist.monthlyListeners
      ? tp({ count: artist.monthlyListeners, key: 'artist.monthlyListeners' })
      : t('artist.statsSeparator', {
          albums: tp({
            count: content.albums.length,
            key: 'artist.albumCount',
          }),
          songs: tp({ count: content.tracks.length, key: 'common.songs' }),
        })
  const compactHeaderColor = `rgb(${artistRed} ${artistGreen} ${artistBlue})`
  const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
    const heroHeight = heroRef.current?.offsetHeight ?? 360
    const shouldShowHeader = event.currentTarget.scrollTop >= heroHeight - 80

    setIsCompactHeaderVisible((current) =>
      current === shouldShowHeader ? current : shouldShowHeader,
    )
  }

  return (
    <div
      className="h-full overflow-y-auto custom-scrollbar"
      onScroll={handleScroll}
    >
      <ArtistCompactHeader
        artistName={artist.username}
        backgroundColor={compactHeaderColor}
        hasTracks={content.tracks.length > 0}
        isPlaying={playback.isPlaying}
        isVisible={isCompactHeaderVisible}
        onTogglePlay={playback.handleTogglePlay}
      />

      <div className="flex flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
        <div ref={heroRef}>
          <ArtistHero artist={artist} statsLabel={statsLabel} />
        </div>

        <ArtistCatalogue
          artist={artist}
          content={content}
          isContextActive={playback.isContextActive}
          isPlaying={playback.isPlaying}
          likedTrackIds={likedTrackIds}
          onPlayPopular={playback.handlePlayPopular}
          onPlayTrack={playback.handlePlayTrack}
          onShuffle={playback.handleShuffle}
          onTogglePlay={playback.handleTogglePlay}
          statsLabel={statsLabel}
        />
      </div>
    </div>
  )
}
