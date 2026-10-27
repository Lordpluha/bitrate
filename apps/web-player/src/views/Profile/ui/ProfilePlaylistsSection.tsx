import { MusicCardLg } from '@shared/ui'
import { usePlayCollection } from '@/features/PlayCollection'
import { useI18n } from '@/shared/i18n'
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
  title,
}: ProfilePlaylistsSectionProps) => {
  const { t } = useI18n()
  const playCollection = usePlayCollection()

  return (
    <ProfileSection title={title ?? t('profile.yourPlaylists')}>
      {isPending ? (
        <p className="text-sm text-muted-foreground">
          {t('profile.loadingPlaylists')}
        </p>
      ) : playlists.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('profile.noPlaylists')}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
          {playlists.map((playlist) => (
            <li className="min-w-0" key={playlist.id}>
              <MusicCardLg
                description={
                  playlist.isPublic
                    ? t('profile.publicPlaylist')
                    : t('profile.privatePlaylist')
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
