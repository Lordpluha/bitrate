import Image from 'next/image'
import { getArtistAvatarUrl } from '@/shared/utils/mediaUrl'
import type { ProfileArtist } from '@/views/Profile/model/profile.types'
import { ProfileSection } from '@/views/Profile/ui/ProfileSection'

type ProfileArtistsSectionProps = {
  artists: ProfileArtist[]
  isPending: boolean
}

export const ProfileArtistsSection = ({
  artists,
  isPending,
}: ProfileArtistsSectionProps) => (
  <ProfileSection
    subtitle="Artists currently available in the catalog"
    title="Artists to explore"
  >
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-4 sm:gap-5">
      {isPending ? (
        <p className="text-text-subdued">Loading artists...</p>
      ) : artists.length === 0 ? (
        <p className="text-text-subdued">No artists yet.</p>
      ) : (
        artists.map((artist) => (
          <div
            className="min-w-0 rounded-md p-2 transition-colors hover:bg-white/10"
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
          </div>
        ))
      )}
    </div>
  </ProfileSection>
)
