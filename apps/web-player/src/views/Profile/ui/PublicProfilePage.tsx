'use client'

import { useUserPlaylists } from '@entities/Playlist'
import { FollowUserButton, useUserById } from '@entities/User'
import { getApiErrorStatus } from '@shared/api/errors'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import {
  ErrorState,
  MusicCardLg,
  SectionHeader,
  Skeleton,
  StateMessage,
} from '@shared/ui'
import { getPlaylistCoverUrl, getUserAvatarUrl } from '@shared/utils/mediaUrl'
import { ListMusic, UserRound } from 'lucide-react'
import { usePlayCollection } from '@/features/PlayCollection'
import { ProfileFollowsSection } from '@/views/Profile/ui/ProfileFollowsSection'
import { ProfileHeader } from '@/views/Profile/ui/ProfileHeader'

type PublicProfilePageProps = {
  userId: string
}

/** The design's grid skeleton while a profile's playlists load. */
const PLAYLIST_SKELETON_KEYS = Array.from(
  { length: 5 },
  (_, card) => `playlist-card-${card}`,
)

export const PublicProfilePage = ({ userId }: PublicProfilePageProps) => {
  const { t } = useI18n()
  const userQuery = useUserById(userId)
  const playlistsQuery = useUserPlaylists(userId)
  const playCollection = usePlayCollection()
  const playlists = playlistsQuery.data ?? []

  if (userQuery.isPending) {
    return (
      <div
        aria-label={t('profile.loading')}
        className="flex h-full flex-col gap-7 px-4 pt-2 md:px-8 md:py-6"
        role="status"
      >
        <div className="flex items-end gap-7 md:py-7">
          <Skeleton className="size-22 rounded-full md:size-45" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-1/2 md:h-16" />
          </div>
        </div>
        <Skeleton className="h-64 rounded-[14px]" />
      </div>
    )
  }

  /* a missing user is not found; any other failure can be retried */
  if (userQuery.isError && getApiErrorStatus(userQuery.error) !== 404) {
    return (
      <div className="flex h-full flex-col px-4 md:px-8">
        <ErrorState
          description={t('error.tryAgainShort')}
          onRetry={() => void userQuery.refetch()}
          title={t('profile.loadFailed')}
        />
      </div>
    )
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="flex h-full flex-col px-4 md:px-8">
        <StateMessage
          description={t('profile.notFoundDescription')}
          icon={UserRound}
          primary={{ href: ROUTES.main, label: t('common.backToHome') }}
          title={t('profile.notFound')}
        />
      </div>
    )
  }

  const user = userQuery.data

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-5 px-4 pt-2 pb-3 md:gap-7 md:px-8 md:py-6">
        <ProfileHeader
          action={
            <FollowUserButton userId={user.id} username={user.username} />
          }
          avatarUrl={user.avatar ? getUserAvatarUrl(user.avatar) : null}
          description={user.description}
          username={user.username}
        />

        <section className="flex flex-col gap-4">
          <SectionHeader title={t('profile.publicPlaylists')} />
          {playlistsQuery.isPending ? (
            <div
              aria-label={t('profile.loadingPlaylistsShort')}
              className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-5.5"
              role="status"
            >
              {PLAYLIST_SKELETON_KEYS.map((key) => (
                <Skeleton className="aspect-[4/5] rounded-[14px]" key={key} />
              ))}
            </div>
          ) : playlistsQuery.isError ? (
            <ErrorState
              className="min-h-60"
              description={t('error.ourSide')}
              onRetry={() => void playlistsQuery.refetch()}
              title={t('profile.playlistsFailed')}
            />
          ) : playlists.length === 0 ? (
            <StateMessage
              className="min-h-60"
              icon={ListMusic}
              title={t('profile.noPublicPlaylists')}
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-5.5">
              {playlists.map((playlist) => (
                <li className="min-w-0" key={playlist.id}>
                  <MusicCardLg
                    description={
                      playlist.description || t('profile.publicPlaylist')
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
        </section>

        <ProfileFollowsSection
          kind="followers"
          title={t('profile.followers')}
          userId={user.id}
        />
        <ProfileFollowsSection
          kind="following"
          title={t('profile.following')}
          userId={user.id}
        />
      </div>
    </div>
  )
}
