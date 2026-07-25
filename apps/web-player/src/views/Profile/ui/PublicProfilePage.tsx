'use client'

import { usePlaylists } from '@entities/Playlist'
import { useUserById } from '@entities/User'
import { ROUTES } from '@shared/routes'
import { getPlaylistCoverUrl, getUserAvatarUrl } from '@shared/utils/mediaUrl'
import { UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type PublicProfilePageProps = {
  userId: string
}

export const PublicProfilePage = ({ userId }: PublicProfilePageProps) => {
  const userQuery = useUserById(userId)
  const playlistsQuery = usePlaylists(1, 100)
  const playlists = (playlistsQuery.data ?? []).filter(
    (playlist) => playlist.userId === userId && playlist.isPublic,
  )

  if (userQuery.isPending) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-background-secondary text-text-subdued">
        Loading profile...
      </div>
    )
  }

  if (userQuery.isError || !userQuery.data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg bg-background-secondary px-6 text-center">
        <h1 className="text-3xl font-bold text-text">User not found</h1>
        <p className="text-sm text-text-subdued">
          This profile is unavailable or no longer exists.
        </p>
      </div>
    )
  }

  const user = userQuery.data

  return (
    <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
      <section className="bg-gradient-to-b from-surface-hover via-surface to-background-tinted px-8 pb-8 pt-12">
        <div className="flex items-end gap-6 max-[700px]:items-center">
          <div className="flex size-52 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface shadow-2xl max-[700px]:size-32">
            {user.avatar ? (
              <Image
                alt={user.username}
                className="size-full object-cover"
                height={208}
                src={getUserAvatarUrl(user.avatar)}
                unoptimized
                width={208}
              />
            ) : (
              <UserRound className="text-text-subdued" size={76} />
            )}
          </div>
          <div className="min-w-0 pb-3">
            <p className="text-sm text-text-subdued">Profile</p>
            <h1 className="truncate text-6xl font-black text-text max-[900px]:text-4xl">
              {user.username}
            </h1>
            {user.description && (
              <p className="mt-4 max-w-150 text-sm text-text-subdued">
                {user.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-8 py-10">
        <h2 className="mb-5 text-2xl font-bold text-text">Public playlists</h2>
        {playlistsQuery.isPending ? (
          <p className="text-text-subdued">Loading playlists...</p>
        ) : playlistsQuery.isError ? (
          <p className="text-negative">
            Playlists could not be loaded. Try again later.
          </p>
        ) : playlists.length === 0 ? (
          <p className="text-text-subdued">No public playlists yet.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">
            {playlists.map((playlist) => (
              <Link
                className="min-w-0 rounded-md p-3 transition-colors hover:bg-surface"
                href={ROUTES.playlist(playlist.id)}
                key={playlist.id}
              >
                <Image
                  alt={playlist.title}
                  className="aspect-square w-full rounded object-cover shadow-lg"
                  height={180}
                  src={getPlaylistCoverUrl(playlist.cover)}
                  unoptimized
                  width={180}
                />
                <h3 className="mt-3 truncate font-semibold text-text">
                  {playlist.title}
                </h3>
                <p className="truncate text-sm text-text-subdued">
                  {playlist.description || 'Playlist'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
