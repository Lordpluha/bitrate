'use client'

import { LogIn } from 'lucide-react'
import { useFollowedArtists } from '@/entities/Artist'
import { useTopArtists, useTopTracks } from '@/entities/Discovery'
import { usePlayerStore } from '@/entities/Player'
import { useMyPlaylists } from '@/entities/Playlist'
import { getTrackById } from '@/entities/Track'
import { useFollowedUsers } from '@/entities/User'
import { showApiErrorToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { ErrorState, LegalFooter, Skeleton, StateMessage } from '@/shared/ui'
import { getUserAvatarUrl } from '@/shared/utils/mediaUrl'
import type { ProfileTrack } from '@/views/Profile/model/profile.types'
import { ProfileActions } from '@/views/Profile/ui/ProfileActions'
import { ProfileArtistsSection } from '@/views/Profile/ui/ProfileArtistsSection'
import { ProfileFollowingUsersSection } from '@/views/Profile/ui/ProfileFollowingUsersSection'
import { ProfileHeader } from '@/views/Profile/ui/ProfileHeader'
import { ProfilePlaylistsSection } from '@/views/Profile/ui/ProfilePlaylistsSection'
import { ProfileTracksSection } from '@/views/Profile/ui/ProfileTracksSection'

export const ProfilePage = () => {
  const { t } = useI18n()
  const play = usePlayerStore((state) => state.play)
  const { user, isLoading } = useAuth()
  const topArtistsQuery = useTopArtists('medium', 1, 5)
  const topTracksQuery = useTopTracks('medium', 1, 5)
  const myPlaylistsQuery = useMyPlaylists()
  const { data: artistsData, isPending: isArtistsPending } = topArtistsQuery
  const { data: tracksData, isPending: areTracksPending } = topTracksQuery
  const { data: myPlaylistsData, isPending: arePlaylistsPending } =
    myPlaylistsQuery
  /** The design's error frame: the profile's own lists all failed, so nothing is worth showing. */
  const isProfileError =
    topArtistsQuery.isError &&
    topTracksQuery.isError &&
    myPlaylistsQuery.isError
  const { data: followedUsers = [], isPending: areFollowedUsersPending } =
    useFollowedUsers(!!user)
  const { data: followedArtists = [], isPending: areFollowedArtistsPending } =
    useFollowedArtists(!!user)

  const artists = artistsData?.data ?? []
  const topTracks: ProfileTrack[] = tracksData?.data ?? []
  const myPlaylists = (myPlaylistsData ?? []).slice(0, 6)

  const playTrack = async (track: ProfileTrack) => {
    try {
      play(await getTrackById(track.id))
    } catch (error) {
      showApiErrorToast(error, t('profile.playFailed'))
    }
  }

  if (isLoading) {
    return (
      <div
        aria-label={t('profile.loading')}
        className="flex h-full flex-1 flex-col gap-7 px-4 pt-2 md:px-8 md:py-6"
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

  if (!user) {
    return (
      <div className="flex h-full flex-1 flex-col px-4 md:px-8">
        <StateMessage
          description={t('profile.signInDescription')}
          icon={LogIn}
          primary={{ href: ROUTES.auth.login, label: t('profile.logIn') }}
          title={t('profile.signInTitle')}
        />
      </div>
    )
  }

  if (isProfileError) {
    return (
      <div className="flex h-full flex-1 flex-col px-4 md:px-8">
        <ErrorState
          description={t('error.tryAgainShort')}
          onRetry={() => {
            void topArtistsQuery.refetch()
            void topTracksQuery.refetch()
            void myPlaylistsQuery.refetch()
          }}
          title={t('profile.loadFailed')}
        />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-y-auto custom-scrollbar">
      <div className="flex flex-1 flex-col gap-5 px-4 pt-2 pb-3 md:px-8 md:py-6">
        <ProfileHeader
          action={<ProfileActions />}
          avatarUrl={user.avatar ? getUserAvatarUrl(user.avatar) : null}
          description={user.description}
          username={user.username}
        />

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ProfileArtistsSection
              artists={artists}
              isPending={isArtistsPending}
            />
            <ProfileTracksSection
              isPending={areTracksPending}
              onPlayTrack={(track) => void playTrack(track)}
              tracks={topTracks}
            />
            <ProfilePlaylistsSection
              isPending={arePlaylistsPending}
              playlists={myPlaylists}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <ProfileArtistsSection
              artists={followedArtists}
              emptyMessage={t('profile.notFollowingArtists')}
              isPending={areFollowedArtistsPending}
              subtitle={t('profile.artistsYouFollow')}
              title={t('profile.followingArtists')}
              variant="list"
            />
            <ProfileFollowingUsersSection
              isPending={areFollowedUsersPending}
              users={followedUsers}
            />
          </div>
        </div>
        <LegalFooter className="mt-10" />
      </div>
    </div>
  )
}
