'use client'

import { useRelatedArtists } from '@entities/Artist'
import { MusicCardLg } from '@shared/ui/MusicCardLg'

type RelatedArtistsSectionProps = {
  artistId: string
}

export const RelatedArtistsSection = ({
  artistId,
}: RelatedArtistsSectionProps) => {
  const relatedArtistsQuery = useRelatedArtists(artistId)
  const artists = relatedArtistsQuery.data ?? []

  if (relatedArtistsQuery.isPending || artists.length === 0) return null

  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="mb-4 text-2xl font-bold text-text">Fans also like</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,160px),1fr))] gap-2">
        {artists.map((artist) => (
          <MusicCardLg
            description="Artist"
            id={artist.id}
            imageUrl={artist.avatar ?? undefined}
            isArtist
            key={artist.id}
            name={artist.username}
          />
        ))}
      </div>
    </section>
  )
}
