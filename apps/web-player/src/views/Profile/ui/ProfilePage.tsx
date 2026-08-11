'use client'

import { useTopArtists, useTopTracks } from '@/entities/Discovery'
import { usePlayerStore } from '@/entities/Player'
import { useMyPlaylists } from '@/entities/Playlist'
import { getTrackById } from '@/entities/Track'
import { useFollowedUsers } from '@/entities/User'
import { showApiErrorToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'
import { getUserAvatarUrl } from '@/shared/utils/mediaUrl'
import type { ProfileTrack } from '@/views/Profile/model/profile.types'
import { ProfileActions } from '@/views/Profile/ui/ProfileActions'
import { ProfileArtistsSection } from '@/views/Profile/ui/ProfileArtistsSection'
import { ProfileFollowingUsersSection } from '@/views/Profile/ui/ProfileFollowingUsersSection'
import { ProfileFooter } from '@/views/Profile/ui/ProfileFooter'
import { ProfileHeader } from '@/views/Profile/ui/ProfileHeader'
import { ProfilePlaylistsSection } from '@/views/Profile/ui/ProfilePlaylistsSection'
import { ProfileTracksSection } from '@/views/Profile/ui/ProfileTracksSection'

export const ProfilePage = () => {
  const play = usePlayerStore((state) => state.play)
  const { user, isLoading } = useAuth()
  const { data: artistsData, isPending: isArtistsPending } = useTopArtists(
    'medium',
    1,
    5,
  )
  const { data: tracksData, isPending: areTracksPending } = useTopTracks(
    'medium',
    1,
    5,
  )
  const { data: myPlaylistsData, isPending: arePlaylistsPending } =
    useMyPlaylists()
  const { data: followedUsers = [], isPending: areFollowedUsersPending } =
    useFollowedUsers(!!user)

  const artists = artistsData?.data ?? []
  const topTracks: ProfileTrack[] = tracksData?.data ?? []
  const myPlaylists = (myPlaylistsData ?? []).slice(0, 6)

  const playTrack = async (track: ProfileTrack) => {
    try {
      play(await getTrackById(track.id))
    } catch (error) {
      showApiErrorToast(error, 'Unable to play this track.')
    }
  }

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto rounded-lg bg-background-secondary px-6 py-8 text-text-subdued">
        Loading profile...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-full overflow-y-auto rounded-lg bg-background-secondary px-6 py-8">
        <div className="rounded-md bg-surface p-6 text-text-subdued">
          Sign in to view your profile.
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
      <ProfileHeader
        avatarUrl={user.avatar ? getUserAvatarUrl(user.avatar) : null}
        description={user.description}
        username={user.username}
      />

      <section className="bg-gradient-to-b from-black/30 to-background-secondary px-4 py-6 sm:px-6 sm:py-7">
        <ProfileActions />
        <ProfileArtistsSection artists={artists} isPending={isArtistsPending} />
        <ProfileTracksSection
          isPending={areTracksPending}
          onPlayTrack={(track) => void playTrack(track)}
          tracks={topTracks}
        />
        <ProfilePlaylistsSection
          isPending={arePlaylistsPending}
          playlists={myPlaylists}
        />
        <ProfileFollowingUsersSection
          isPending={areFollowedUsersPending}
          users={followedUsers}
        />
        <ProfileFooter />
      </section>
    </div>
  )
}
