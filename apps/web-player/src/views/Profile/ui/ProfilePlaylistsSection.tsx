import Image from 'next/image'
import Link from 'next/link'
import { ROUTES } from '@/shared/routes'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'
import type { ProfilePlaylist } from '@/views/Profile/model/profile.types'
import { ProfileSection } from '@/views/Profile/ui/ProfileSection'

type ProfilePlaylistsSectionProps = {
  isPending: boolean
  playlists: ProfilePlaylist[]
}

export const ProfilePlaylistsSection = ({
  isPending,
  playlists,
}: ProfilePlaylistsSectionProps) => (
  <ProfileSection className="mt-14" title="Your playlists">
    {isPending ? (
      <p className="text-text-subdued">Loading playlists...</p>
    ) : playlists.length === 0 ? (
      <p className="text-text-subdued">No playlists created yet.</p>
    ) : (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,140px),1fr))] gap-4 sm:gap-5">
        {playlists.map((playlist) => (
          <Link
            className="min-w-0 rounded-md p-2 transition-colors hover:bg-white/10"
            href={ROUTES.playlist(playlist.id)}
            key={playlist.id}
          >
            <Image
              alt={playlist.title}
              className="aspect-square w-full rounded object-cover shadow-xl"
              height={180}
              src={getPlaylistCoverUrl(playlist.cover)}
              unoptimized
              width={180}
            />
            <h3 className="mt-4 truncate text-base text-text">
              {playlist.title}
            </h3>
            <p className="truncate text-sm text-text-subdued">
              {playlist.isPublic ? 'Public playlist' : 'Private playlist'}
            </p>
          </Link>
        ))}
      </div>
    )}
  </ProfileSection>
)
