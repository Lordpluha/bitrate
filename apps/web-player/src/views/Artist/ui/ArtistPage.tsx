'use client'

import { useArtist } from '@entities/Artist'
import { useLikedTracks } from '@entities/Track'
import { useImageColor } from '@shared/hooks/useImageColor'
import { getArtistBackgroundUrl } from '@shared/utils/mediaUrl'
import { type UIEventHandler, useMemo, useRef, useState } from 'react'
import { useArtistContent } from '@/views/Artist/model/useArtistContent'
import { useArtistPlayback } from '@/views/Artist/model/useArtistPlayback'
import { ArtistCatalogue } from '@/views/Artist/ui/ArtistCatalogue'
import { ArtistCompactHeader } from '@/views/Artist/ui/ArtistCompactHeader'
import { ArtistHero } from '@/views/Artist/ui/ArtistHero'
import { ArtistPageState } from '@/views/Artist/ui/ArtistPageState'

export type ArtistPageProps = {
  artistId: string
}

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`

export const ArtistPage = ({ artistId }: ArtistPageProps) => {
  const { data: artist, isError, isPending } = useArtist(artistId)
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
  })

  if (isPending) return <ArtistPageState variant="loading" />
  if (isError || !artist) return <ArtistPageState variant="error" />

  /**
   * Bitrate leads with monthly listeners; the catalogue counts are the
   * fallback for artists the API has no listener figure for yet.
   */
  const statsLabel = content.isPending
    ? 'Loading catalogue…'
    : artist.monthlyListeners
      ? `${artist.monthlyListeners.toLocaleString('en-US')} monthly listeners`
      : [
          pluralize(content.tracks.length, 'song'),
          pluralize(content.albums.length, 'album'),
        ].join(' · ')
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
      className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar"
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

      <div ref={heroRef}>
        <ArtistHero artist={artist} statsLabel={statsLabel} />
      </div>

      <div
        className="relative min-h-[calc(100%-25rem)] bg-background-secondary pb-6"
        style={{
          backgroundImage: `linear-gradient(180deg, rgb(${artistRed} ${artistGreen} ${artistBlue} / 0.78) 0, rgb(18 18 18 / 0.96) 16rem, rgb(18 18 18) 22rem)`,
        }}
      >
        <ArtistCatalogue
          artist={artist}
          content={content}
          heroImageUrl={heroImageUrl}
          isContextActive={playback.isContextActive}
          isPlaying={playback.isPlaying}
          likedTrackIds={likedTrackIds}
          onPlayTrack={playback.handlePlayTrack}
          onShuffle={playback.handleShuffle}
          onTogglePlay={playback.handleTogglePlay}
          statsLabel={statsLabel}
        />
      </div>
    </div>
  )
}
