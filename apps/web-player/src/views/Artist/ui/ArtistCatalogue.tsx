'use client'

import type { ArtistEntity } from '@entities/Artist'
import type { TrackEntity } from '@entities/Track'
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
  const firstTrack = content.popularTracks[0] ?? content.tracks[0]

  return (
    <>
      <ArtistActionBar
        artistId={artist.id}
        artistName={artist.username}
        featuredCover={firstTrack?.cover}
        hasTracks={content.tracks.length > 0}
        isPlaying={isPlaying}
        onShuffle={onShuffle}
        onTogglePlay={onTogglePlay}
      />

      {content.tracks.length === 0 && content.albums.length === 0 ? (
        <p
          className="px-5 py-10 text-text-subdued sm:px-6 lg:px-8"
          role="status"
        >
          {content.isPending
            ? 'Loading catalogue…'
            : content.isError
              ? 'The catalogue could not be loaded right now.'
              : 'This artist has no published music yet.'}
        </p>
      ) : (
        <>
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
          <ArtistFeaturing artistId={artist.id} artistName={artist.username} />
        </>
      )}

      <ArtistAbout artist={artist} statsLabel={statsLabel} />
      <RelatedArtistsSection artistId={artist.id} />
    </>
  )
}
