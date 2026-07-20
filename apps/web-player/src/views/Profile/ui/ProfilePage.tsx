'use client'

import { useListeningHistory } from '@entities/History'
import { play } from '@entities/Player'
import { useMyPlaylists } from '@entities/Playlist'
import { type TrackEntity, useLikedTracks } from '@entities/Track'
import { useAppDispatch, useAuth } from '@shared/hooks'
import { useArtists } from '@shared/hooks/useArtists'
import { ROUTES } from '@shared/routes'
import { formatDuration } from '@shared/utils/apiHelpers'
import {
  getApiUrl,
  getArtistAvatarUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
  getUserAvatarUrl,
} from '@shared/utils/mediaUrl'
import { cn } from '@spotify/ui-react'
import { MoreHorizontal, Settings, UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type ProfileTrack = TrackEntity & {
  artist?: {
    username?: string | null
  }
}

const getTrackArtistName = (track: ProfileTrack) =>
  track.artist?.username ?? track.artistId

const getUniqueTracks = (tracks: ProfileTrack[]) => {
  const seen = new Set<string>()

  return tracks.filter((track) => {
    if (seen.has(track.id)) return false
    seen.add(track.id)
    return true
  })
}

export const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const { user, isLoading } = useAuth()
  const { data: artistsData, isPending: isArtistsPending } = useArtists(1, 8)
  const { data: historyData } = useListeningHistory({ page: 1, limit: 20 })
  const { data: likedTracks } = useLikedTracks(1, 8)
  const { data: myPlaylistsData, isPending: arePlaylistsPending } =
    useMyPlaylists()

  const artists = Array.isArray(artistsData) ? artistsData.slice(0, 5) : []
  const topTracksSource: ProfileTrack[] =
    historyData && historyData.length > 0
      ? historyData.map((entry) => entry.track as ProfileTrack)
      : ((likedTracks ?? []) as ProfileTrack[])
  const topTracks = getUniqueTracks(topTracksSource).slice(0, 5)
  const myPlaylists = (myPlaylistsData ?? []).slice(0, 6)
  const avatarUrl = user?.avatar ? getUserAvatarUrl(user.avatar) : null

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
      <section className="bg-gradient-to-b from-surface-hover via-surface to-background-tinted px-6 pb-7 pt-10">
        <div className="flex min-w-0 items-end gap-6">
          <div className="flex h-58 w-58 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface shadow-2xl max-[900px]:h-36 max-[900px]:w-36">
            {avatarUrl ? (
              <Image
                alt={user.username}
                className="h-full w-full object-cover"
                height={232}
                src={avatarUrl}
                unoptimized
                width={232}
              />
            ) : (
              <UserRound className="text-text-subdued" size={86} />
            )}
          </div>

          <div className="min-w-0 pb-3">
            <p className="text-sm text-text">Profile</p>
            <h1 className="truncate text-7xl font-black tracking-normal text-text max-[1100px]:text-5xl">
              {user.username}
            </h1>
            {user.description && (
              <p className="mt-5 max-w-150 text-sm text-text-subdued">
                {user.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-black/30 to-background-secondary px-6 py-7">
        <div className="mb-10 flex items-center gap-6 text-text-subdued">
          <Link
            aria-label="Open settings"
            className="transition-colors hover:text-text"
            href={ROUTES.settings}
          >
            <Settings size={28} />
          </Link>
          <button
            aria-label="More profile options"
            className="transition-colors hover:text-text"
            type="button"
          >
            <MoreHorizontal size={30} />
          </button>
        </div>

        <ProfileSection
          subtitle="Artists currently available in the catalog"
          title="Artists to explore"
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
            {isArtistsPending ? (
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

        <ProfileSection
          className="mt-12"
          showAllHref={ROUTES.recents}
          subtitle="Only visible to you"
          title="Recently played"
        >
          <div className="space-y-1">
            {topTracks.length === 0 ? (
              <p className="text-text-subdued">No tracks yet.</p>
            ) : (
              topTracks.slice(0, 4).map((track, index) => (
                <button
                  className="grid w-full grid-cols-[36px_44px_minmax(0,1.3fr)_minmax(160px,1fr)_56px] items-center gap-3 rounded px-3 py-2 text-left transition-colors hover:bg-white/10 max-[900px]:grid-cols-[28px_44px_minmax(0,1fr)_48px]"
                  key={track.id}
                  onClick={() => playTrack(track)}
                  type="button"
                >
                  <span className="text-right text-sm text-text-subdued">
                    {index + 1}
                  </span>
                  <Image
                    alt={track.title}
                    className="h-11 w-11 rounded object-cover"
                    height={44}
                    src={getTrackCoverUrl(track.cover)}
                    unoptimized
                    width={44}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-text">
                      {track.title}
                    </span>
                    <span className="block truncate text-sm text-text-subdued">
                      {getTrackArtistName(track)}
                    </span>
                  </span>
                  <span className="truncate text-sm text-text-subdued max-[900px]:hidden">
                    {track.title}
                  </span>
                  <span className="text-right text-sm text-text-subdued">
                    {formatDuration(track.duration ?? 0)}
                  </span>
                </button>
              ))
            )}
          </div>
        </ProfileSection>

        <ProfileSection className="mt-14" title="Your playlists">
          {arePlaylistsPending ? (
            <p className="text-text-subdued">Loading playlists...</p>
          ) : myPlaylists.length === 0 ? (
            <p className="text-text-subdued">No playlists created yet.</p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
              {myPlaylists.map((playlist) => (
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

        <footer className="mt-28 border-t border-white/10 pb-8 pt-12">
          <div className="grid grid-cols-4 gap-8 max-[900px]:grid-cols-2">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-3 text-sm font-bold text-text">
                  {column.title}
                </h3>
                <div className="grid gap-2">
                  {column.links.map((link) => (
                    <Link
                      className="text-sm text-text-subdued hover:text-text"
                      href="#"
                      key={link}
                    >
                      {link}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-text-subdued">
            <div className="flex flex-wrap gap-5">
              {bottomLinks.map((link) => (
                <Link className="hover:text-text" href="#" key={link}>
                  {link}
                </Link>
              ))}
            </div>
            <span>© 2026 Spotify AB</span>
          </div>
        </footer>
      </section>
    </div>
  )
}

type ProfileSectionProps = {
  children: React.ReactNode
  className?: string
  showAllHref?: string
  subtitle?: string
  title: string
}

const ProfileSection = ({
  children,
  className,
  showAllHref,
  subtitle,
  title,
}: ProfileSectionProps) => (
  <section className={cn(className)}>
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-text">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-text-subdued">{subtitle}</p>
        )}
      </div>
      {showAllHref && (
        <Link
          className="text-sm font-bold text-text-subdued hover:text-text"
          href={showAllHref}
        >
          Show all
        </Link>
      )}
    </div>
    {children}
  </section>
)

const footerColumns = [
  {
    title: 'Company',
    links: ['About', 'Jobs', 'For the Record'],
  },
  {
    title: 'Communities',
    links: ['For Artists', 'Developers', 'Advertising', 'Investors', 'Vendors'],
  },
  {
    title: 'Useful links',
    links: [
      'Support',
      'Free Mobile App',
      'Popular by Country',
      'Import your music',
    ],
  },
  {
    title: 'Spotify Plans',
    links: [
      'Premium Individual',
      'Premium Duo',
      'Premium Family',
      'Premium Student',
      'Spotify Free',
    ],
  },
]

const bottomLinks = [
  'Legal',
  'Safety & Privacy Center',
  'Privacy Policy',
  'Cookies',
  'About Ads',
  'Accessibility',
]
