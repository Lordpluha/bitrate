'use client'

import { useAlbums } from '@entities/Album'
import { useListeningHistory } from '@entities/History'
import { play } from '@entities/Player'
import { useCreatePlaylist, useMyPlaylists } from '@entities/Playlist'
import type { TrackEntity } from '@entities/Track'
import { useLikedTracks } from '@entities/Track'
import { showApiSuccessToast } from '@shared/api/feedback'
import { useAppDispatch } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import {
  getAlbumCoverUrl,
  getApiUrl,
  getPlaylistCoverUrl,
  getTrackCoverUrl,
} from '@shared/utils/mediaUrl'
import { cn } from '@spotify/ui-react'
import { SearchIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'

type LibrarySection = 'playlists' | 'liked' | 'albums' | 'history'
type SortMode = 'recent' | 'title'

type LibraryPlaylist = {
  id: string
  title: string
  cover?: string | null
  description?: string | null
  createdAt?: string | null
  tracks?: unknown[]
}

type LibraryAlbum = {
  id: string
  title: string
  cover?: string | null
  releaseDate?: string | null
  createdAt?: string | null
}

const libraryTabs: Array<{ id: LibrarySection; label: string }> = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'liked', label: 'Liked Songs' },
  { id: 'albums', label: 'Albums' },
  { id: 'history', label: 'Recently Played' },
]

const getTimestamp = (value?: string | null) =>
  value ? new Date(value).getTime() || 0 : 0

const includesQuery = (value: string | undefined, query: string) =>
  value?.toLowerCase().includes(query.toLowerCase()) ?? false

export const LibraryPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const [activeSection, setActiveSection] =
    useState<LibrarySection>('playlists')
  const [query, setQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [playlistTitle, setPlaylistTitle] = useState('')
  const [playlistDescription, setPlaylistDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const { data: myPlaylists, isPending: isPlaylistsPending } = useMyPlaylists()
  const createPlaylist = useCreatePlaylist()
  const { data: likedTracks, isPending: isLikedPending } = useLikedTracks()
  const { data: albums, isPending: isAlbumsPending } = useAlbums({
    page: 1,
    limit: 50,
  })
  const { data: history, isPending: isHistoryPending } = useListeningHistory({
    page: 1,
    limit: 50,
  })

  useEffect(() => {
    if (searchParams.get('create') !== 'playlist') return

    setActiveSection('playlists')
    setIsCreateOpen(true)
  }, [searchParams])

  const playlists = useMemo(() => {
    const items = Array.isArray(myPlaylists)
      ? (myPlaylists as LibraryPlaylist[])
      : []

    return items
      .filter((playlist) => includesQuery(playlist.title, query))
      .sort((first, second) =>
        sortMode === 'title'
          ? first.title.localeCompare(second.title)
          : getTimestamp(second.createdAt) - getTimestamp(first.createdAt),
      )
  }, [myPlaylists, query, sortMode])

  const tracks = useMemo(() => {
    const items = likedTracks ?? []

    return items
      .filter((track) => includesQuery(track.title, query))
      .sort((first, second) =>
        sortMode === 'title'
          ? first.title.localeCompare(second.title)
          : getTimestamp(second.createdAt) - getTimestamp(first.createdAt),
      )
  }, [likedTracks, query, sortMode])

  const albumItems = useMemo(() => {
    const items = Array.isArray(albums) ? (albums as LibraryAlbum[]) : []

    return items
      .filter((album) => includesQuery(album.title, query))
      .sort((first, second) =>
        sortMode === 'title'
          ? first.title.localeCompare(second.title)
          : getTimestamp(second.releaseDate ?? second.createdAt) -
            getTimestamp(first.releaseDate ?? first.createdAt),
      )
  }, [albums, query, sortMode])

  const historyItems = useMemo(() => {
    const items = history ?? []

    return items
      .filter((entry) => includesQuery(entry.track.title, query))
      .sort((first, second) =>
        sortMode === 'title'
          ? first.track.title.localeCompare(second.track.title)
          : getTimestamp(second.listenedAt) - getTimestamp(first.listenedAt),
      )
  }, [history, query, sortMode])

  const isPending =
    (activeSection === 'playlists' && isPlaylistsPending) ||
    (activeSection === 'liked' && isLikedPending) ||
    (activeSection === 'albums' && isAlbumsPending) ||
    (activeSection === 'history' && isHistoryPending)

  const handleCreatePlaylist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = playlistTitle.trim()
    if (!title) return

    const playlist = await createPlaylist.mutateAsync({
      description: playlistDescription.trim() || undefined,
      isPublic,
      title,
    })

    showApiSuccessToast('Playlist created')
    setPlaylistTitle('')
    setPlaylistDescription('')
    setIsPublic(true)
    setIsCreateOpen(false)
    router.push(ROUTES.playlist(playlist.id))
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar px-6 py-5">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-text-subdued">Your Library</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-4xl font-bold text-text">Library</h1>
            <button
              className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400"
              onClick={() => setIsCreateOpen((value) => !value)}
              type="button"
            >
              Create playlist
            </button>
          </div>
        </div>

        {isCreateOpen && (
          <form
            className="grid gap-3 rounded-lg bg-surface p-4"
            onSubmit={handleCreatePlaylist}
          >
            <input
              className="h-10 rounded-md bg-background px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
              maxLength={80}
              onChange={(event) => setPlaylistTitle(event.target.value)}
              placeholder="Playlist title"
              required
              value={playlistTitle}
            />
            <textarea
              className="min-h-20 rounded-md bg-background px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
              maxLength={240}
              onChange={(event) => setPlaylistDescription(event.target.value)}
              placeholder="Description"
              value={playlistDescription}
            />
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                checked={isPublic}
                onChange={(event) => setIsPublic(event.target.checked)}
                type="checkbox"
              />
              Public playlist
            </label>
            <div className="flex gap-2">
              <button
                className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60"
                disabled={createPlaylist.isPending}
                type="submit"
              >
                Create
              </button>
              <button
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-text hover:bg-white/15"
                onClick={() => setIsCreateOpen(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {libraryTabs.map((tab) => (
            <button
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                activeSection === tab.id
                  ? 'bg-text text-background'
                  : 'bg-surface text-text hover:bg-surface-hover',
              )}
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="relative min-w-64 flex-1 max-w-100">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subdued"
              size={18}
            />
            <input
              className="h-10 w-full rounded-md bg-surface pl-10 pr-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter your library"
              value={query}
            />
          </label>

          <select
            className="h-10 rounded-md bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            value={sortMode}
          >
            <option value="recent">Recent</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        {isPending ? (
          <div className="text-text-subdued">Loading library...</div>
        ) : activeSection === 'playlists' ? (
          <LibraryGridEmptyAware isEmpty={playlists.length === 0}>
            {playlists.map((playlist) => (
              <Link
                className="rounded-lg p-3 transition-colors hover:bg-surface"
                href={ROUTES.playlist(playlist.id)}
                key={playlist.id}
              >
                <Image
                  alt={playlist.title}
                  className="aspect-square w-full rounded-md object-cover"
                  height={180}
                  src={getPlaylistCoverUrl(playlist.cover)}
                  unoptimized
                  width={180}
                />
                <h2 className="mt-3 truncate text-sm font-medium text-text">
                  {playlist.title}
                </h2>
                <p className="truncate text-xs text-text-subdued">
                  {playlist.tracks?.length ?? 0} tracks
                </p>
              </Link>
            ))}
          </LibraryGridEmptyAware>
        ) : activeSection === 'liked' ? (
          <LibraryListEmptyAware isEmpty={tracks.length === 0}>
            {tracks.map((track) => (
              <button
                className="grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface"
                key={track.id}
                onClick={() => dispatch(play(track))}
                type="button"
              >
                <Image
                  alt={track.title}
                  className="rounded object-cover"
                  height={48}
                  src={getTrackCoverUrl(track.cover)}
                  unoptimized
                  width={48}
                />
                <div className="min-w-0">
                  <div className="truncate font-medium text-text">
                    {track.title}
                  </div>
                  <div className="truncate text-sm text-text-subdued">
                    {track.artistId}
                  </div>
                </div>
              </button>
            ))}
          </LibraryListEmptyAware>
        ) : activeSection === 'albums' ? (
          <LibraryGridEmptyAware isEmpty={albumItems.length === 0}>
            {albumItems.map((album) => (
              <Link
                className="rounded-lg p-3 transition-colors hover:bg-surface"
                href={ROUTES.album(album.id)}
                key={album.id}
              >
                <Image
                  alt={album.title}
                  className="aspect-square w-full rounded-md object-cover"
                  height={180}
                  src={getAlbumCoverUrl(album.cover)}
                  unoptimized
                  width={180}
                />
                <h2 className="mt-3 truncate text-sm font-medium text-text">
                  {album.title}
                </h2>
                <p className="truncate text-xs text-text-subdued">Album</p>
              </Link>
            ))}
          </LibraryGridEmptyAware>
        ) : (
          <LibraryListEmptyAware isEmpty={historyItems.length === 0}>
            {historyItems.map((entry) => (
              <button
                className="grid w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-surface"
                key={entry.id}
                onClick={() =>
                  dispatch(
                    play({
                      ...entry.track,
                      audioUrl: getApiUrl(
                        `/api/v1/tracks/stream/${entry.track.id}`,
                      ),
                    } as unknown as TrackEntity),
                  )
                }
                type="button"
              >
                <Image
                  alt={entry.track.title}
                  className="rounded object-cover"
                  height={48}
                  src={getTrackCoverUrl(entry.track.cover)}
                  unoptimized
                  width={48}
                />
                <div className="min-w-0">
                  <div className="truncate font-medium text-text">
                    {entry.track.title}
                  </div>
                  <div className="truncate text-sm text-text-subdued">
                    {entry.track.artist?.username ?? entry.track.artistId}
                  </div>
                </div>
              </button>
            ))}
          </LibraryListEmptyAware>
        )}
      </div>
    </div>
  )
}

const LibraryGridEmptyAware = ({
  children,
  isEmpty,
}: {
  children: ReactNode
  isEmpty: boolean
}) => {
  if (isEmpty) return <LibraryEmptyState />

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
      {children}
    </div>
  )
}

const LibraryListEmptyAware = ({
  children,
  isEmpty,
}: {
  children: ReactNode
  isEmpty: boolean
}) => {
  if (isEmpty) return <LibraryEmptyState />

  return <div className="space-y-1">{children}</div>
}

const LibraryEmptyState = () => (
  <div className="rounded-lg bg-surface p-6 text-text-subdued">
    Nothing here yet.
  </div>
)
