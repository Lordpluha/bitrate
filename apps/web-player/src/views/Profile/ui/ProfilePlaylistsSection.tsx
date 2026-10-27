import { MusicCardLg } from '@shared/ui'
import { usePlayCollection } from '@/features/PlayCollection'
import { ROUTES } from '@/shared/routes'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'
import type { ProfilePlaylist } from '@/views/Profile/model/profile.types'
import { ProfileSection } from '@/views/Profile/ui/ProfileSection'

type ProfilePlaylistsSectionProps = {
  isPending: boolean
  playlists: ProfilePlaylist[]
  title?: string
}

export const ProfilePlaylistsSection = ({
  isPending,
  playlists,
  title = 'Your playlists',
}: ProfilePlaylistsSectionProps) => {
  const playCollection = usePlayCollection()

  return (
    <ProfileSection title={title}>
      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading playlists...</p>
      ) : playlists.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No playlists created yet.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
          {playlists.map((playlist) => (
            <li className="min-w-0" key={playlist.id}>
              <MusicCardLg
                description={
                  playlist.isPublic ? 'Public playlist' : 'Private playlist'
                }
                href={ROUTES.playlist(playlist.id)}
                id={playlist.id}
                imageUrl={getPlaylistCoverUrl(playlist.cover)}
                name={playlist.title}
                onPlay={() =>
                  void playCollection({
                    id: playlist.id,
                    kind: 'playlist',
                    title: playlist.title,
                  })
                }
              />
            </li>
          ))}
        </ul>
      )}
    </ProfileSection>
  )
}
