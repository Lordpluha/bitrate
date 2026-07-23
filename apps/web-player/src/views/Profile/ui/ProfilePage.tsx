'use client'

import { useListeningHistory } from '@/entities/History'
import { play } from '@/entities/Player'
import { useMyPlaylists } from '@/entities/Playlist'
import { type TrackEntity, useLikedTracks } from '@/entities/Track'
import { useAppDispatch, useAuth } from '@/shared/hooks'
import { useArtists } from '@/shared/hooks/useArtists'
import { getApiUrl, getUserAvatarUrl } from '@/shared/utils/mediaUrl'
import type {
  ProfileArtist,
  ProfileTrack,
} from '@/views/Profile/model/profile.types'
import { getUniqueTracks } from '@/views/Profile/model/profile.utils'
import { ProfileActions } from '@/views/Profile/ui/ProfileActions'
import { ProfileArtistsSection } from '@/views/Profile/ui/ProfileArtistsSection'
import { ProfileFooter } from '@/views/Profile/ui/ProfileFooter'
import { ProfileHeader } from '@/views/Profile/ui/ProfileHeader'
import { ProfilePlaylistsSection } from '@/views/Profile/ui/ProfilePlaylistsSection'
import { ProfileTracksSection } from '@/views/Profile/ui/ProfileTracksSection'

export const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAuth()
  const { data: artistsData, isPending: isArtistsPending } = useArtists(1, 8)
  const { data: historyData } = useListeningHistory({ page: 1, limit: 20 })
  const { data: likedTracks } = useLikedTracks(1, 8)
  const { data: myPlaylistsData, isPending: arePlaylistsPending } =
    useMyPlaylists()

  const artists = Array.isArray(artistsData)
    ? (artistsData as ProfileArtist[]).slice(0, 5)
    : []
  const trackSource: ProfileTrack[] =
    historyData && historyData.length > 0
      ? historyData.map((entry) => entry.track as ProfileTrack)
      : ((likedTracks ?? []) as ProfileTrack[])
  const topTracks = getUniqueTracks(trackSource).slice(0, 5)
  const myPlaylists = (myPlaylistsData ?? []).slice(0, 6)

  const playTrack = (track: TrackEntity) => {
    dispatch(
      play({
        ...track,
        audioUrl: getApiUrl(`/api/v1/tracks/stream/${track.id}`),
      }),
    )
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

      <section className="bg-gradient-to-b from-black/30 to-background-secondary px-6 py-7">
        <ProfileActions />
        <ProfileArtistsSection artists={artists} isPending={isArtistsPending} />
        <ProfileTracksSection onPlayTrack={playTrack} tracks={topTracks} />
        <ProfilePlaylistsSection
          isPending={arePlaylistsPending}
          playlists={myPlaylists}
        />
        <ProfileFooter />
      </section>
    </div>
  )
}
