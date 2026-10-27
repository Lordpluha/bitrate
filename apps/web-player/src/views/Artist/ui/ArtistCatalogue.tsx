'use client'

import type { ArtistEntity } from '@entities/Artist'
import type { TrackEntity } from '@entities/Track'
import { StateMessage } from '@shared/ui'
import { MicVocal, TriangleAlert } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import type { ArtistContent } from '../model/artist.types'
import { ArtistAbout } from './ArtistAbout'
import { ArtistActionBar } from './ArtistActionBar'
import { ArtistDiscography } from './ArtistDiscography'
import { ArtistFeaturing } from './ArtistFeaturing'
import { ArtistPopularTracks } from './ArtistPopularTracks'
import { RelatedArtistsSection } from './RelatedArtistsSection'

type ArtistCatalogueProps = {
  artist: ArtistEntity
  content: ArtistContent
  isContextActive: boolean
  isPlaying: boolean
  likedTrackIds: Set<string>
  onPlayPopular: (track: TrackEntity) => void
  onPlayTrack: (track: TrackEntity, index: number) => void
  onShuffle: () => void
  onTogglePlay: () => void
  statsLabel: string
}

export const ArtistCatalogue = ({
  artist,
  content,
  isContextActive,
  isPlaying,
  likedTrackIds,
  onPlayPopular,
  onPlayTrack,
  onShuffle,
  onTogglePlay,
  statsLabel,
}: ArtistCatalogueProps) => {
  const { t } = useI18n()

  return (
    <>
      <ArtistActionBar
        artistId={artist.id}
        artistName={artist.username}
        hasTracks={content.tracks.length > 0}
        isPlaying={isPlaying}
        onShuffle={onShuffle}
        onTogglePlay={onTogglePlay}
      />

      {content.tracks.length === 0 && content.albums.length === 0 ? (
        content.isPending ? (
          <p className="py-10 text-muted-foreground" role="status">
            {t('artist.loadingCatalogue')}
          </p>
        ) : content.isError ? (
          <StateMessage
            className="min-h-80"
            description={t('artist.catalogueFailed')}
            icon={TriangleAlert}
            title={t('artist.musicUnavailable')}
            tone="error"
          />
        ) : (
          <StateMessage
            className="min-h-80"
            description={t('artist.noMusicDescription')}
            icon={MicVocal}
            title={t('artist.noMusic')}
          />
        )
      ) : (
        <>
          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start xl:gap-8">
            <ArtistPopularTracks
              isPlaybackContextActive={isContextActive}
              likedTrackIds={likedTrackIds}
              onPlayTrack={onPlayPopular}
              tracks={content.popularTracks}
            />
            <ArtistDiscography
              albums={content.albums}
              onPlayTrack={onPlayTrack}
              tracks={content.tracks}
            />
          </div>
          <ArtistFeaturing artistId={artist.id} artistName={artist.username} />
        </>
      )}

      <RelatedArtistsSection artistId={artist.id} />
      <ArtistAbout artist={artist} statsLabel={statsLabel} />
    </>
  )
}
