import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'
import { getArtistAvatarUrl } from '@/shared/utils/mediaUrl'
import type { ProfileArtist } from '@/views/Profile/model/profile.types'
import { ProfileSection } from '@/views/Profile/ui/ProfileSection'

type ProfileArtistsSectionProps = {
  artists: ProfileArtist[]
  emptyMessage?: string
  isPending: boolean
  subtitle?: string
  title?: string
}

export const ProfileArtistsSection = ({
  artists,
  emptyMessage = 'No artists yet.',
  isPending,
  subtitle = 'Only visible to you',
  title = 'Top artists this month',
}: ProfileArtistsSectionProps) => (
  <ProfileSection subtitle={subtitle} title={title}>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] gap-4 sm:gap-5">
      {isPending ? (
        <p className="text-text-subdued">Loading artists...</p>
      ) : artists.length === 0 ? (
        <p className="text-text-subdued">{emptyMessage}</p>
      ) : (
        artists.map((artist) => (
          <Link
            className="block min-w-0 rounded-md p-2 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            href={ROUTES.artist(artist.id)}
            key={artist.id}
          >
            <Image
              alt={artist.username}
              className="aspect-square w-full rounded-full object-cover shadow-xl"
              height={180}
              src={getArtistAvatarUrl(artist.avatar)}
              unoptimized
              width={180}
            />
            <h3 className="mt-4 truncate text-base text-text">
              {artist.username}
            </h3>
            <p className="text-sm text-text-subdued">Artist</p>
          </Link>
        ))
      )}
    </div>
  </ProfileSection>
)
