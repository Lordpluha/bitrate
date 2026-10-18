'use client'

import { useUserPlaylists } from '@entities/Playlist'
import { FollowUserButton, useUserById } from '@entities/User'
import { ROUTES } from '@shared/routes'
import { MusicCardLg, SectionHeader, Skeleton, StateMessage } from '@shared/ui'
import { getPlaylistCoverUrl, getUserAvatarUrl } from '@shared/utils/mediaUrl'
import { ListMusic, UserRound } from 'lucide-react'
import { ProfileFollowsSection } from '@/views/Profile/ui/ProfileFollowsSection'
import { ProfileHeader } from '@/views/Profile/ui/ProfileHeader'

type PublicProfilePageProps = {
  userId: string
}

export const PublicProfilePage = ({ userId }: PublicProfilePageProps) => {
  const userQuery = useUserById(userId)
  const playlistsQuery = useUserPlaylists(userId)
  const playlists = playlistsQuery.data ?? []

  if (userQuery.isPending) {
    return (
      <div
        aria-label="Loading profile"
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

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="flex h-full flex-col px-4 md:px-8">
        <StateMessage
          description="This profile is unavailable or no longer exists."
          icon={UserRound}
          primary={{ href: ROUTES.main, label: 'Back to home' }}
          title="User not found"
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
          <SectionHeader title="Public playlists" />
          {playlistsQuery.isPending ? (
            <p className="text-sm text-muted-foreground">
              Loading playlists...
            </p>
          ) : playlistsQuery.isError ? (
            <p className="text-sm text-muted-foreground">
              Playlists could not be loaded. Try again later.
            </p>
          ) : playlists.length === 0 ? (
            <StateMessage
              className="min-h-60"
              icon={ListMusic}
              title="No public playlists yet."
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 xl:gap-5.5">
              {playlists.map((playlist) => (
                <li className="min-w-0" key={playlist.id}>
                  <MusicCardLg
                    description={playlist.description || 'Public playlist'}
                    href={ROUTES.playlist(playlist.id)}
                    id={playlist.id}
                    imageUrl={getPlaylistCoverUrl(playlist.cover)}
                    name={playlist.title}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <ProfileFollowsSection
          kind="followers"
          title="Followers"
          userId={user.id}
        />
        <ProfileFollowsSection
          kind="following"
          title="Following"
          userId={user.id}
        />
      </div>
    </div>
  )
}
