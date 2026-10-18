'use client'

import { useRelatedArtists } from '@entities/Artist'
import { MusicCardLg } from '@shared/ui/MusicCardLg'
import { getArtistAvatarUrl } from '@shared/utils/mediaUrl'

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
    <section className="flex flex-col gap-3">
      <h2 className="text-[19px] leading-[1.25] font-semibold">
        Fans also like
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-5.5">
        {artists.map((artist) => (
          <MusicCardLg
            description="Artist"
            id={artist.id}
            imageUrl={getArtistAvatarUrl(artist.avatar)}
            isArtist
            key={artist.id}
            name={artist.username}
          />
        ))}
      </div>
    </section>
  )
}
