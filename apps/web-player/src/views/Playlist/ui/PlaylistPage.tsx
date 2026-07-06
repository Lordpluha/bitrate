'use client'

import {
  play,
  selectMusicPlayer,
  setCurrentPlaylistName,
  setPlaylistTracks,
  setShuffleEnabled,
  togglePlay,
} from '@entities/Player'
import {
  LikePlaylistButton,
  useAddTracksToPlaylist,
  useDeletePlaylist,
  useRemoveTrackFromPlaylist,
  useUpdatePlaylist,
} from '@entities/Playlist'
import type { PlaylistServerApi } from '@entities/Playlist/api/server/PlaylistApi.server'
import { type TrackEntity, useTracks } from '@entities/Track'
import { showApiErrorToast, showApiSuccessToast } from '@shared/api/feedback'
import { useAppDispatch, useAppSelector, useAuth } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { getPlaylistCoverUrl, getTrackCoverUrl } from '@shared/utils/mediaUrl'
import {
  Check,
  Download,
  FolderInput,
  List,
  Lock,
  MonitorUp,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Search,
  Share2,
  Shuffle,
  SlidersHorizontal,
  Trash2,
  UserPlus,
  UserRoundPlus,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  type FormEvent,
  type ReactNode,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { TracksList } from '../../../entities/Track/ui/TracksList'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import { PlaylistHeader } from './PlaylistHeader'

interface PlaylistPageProps {
  playlist: Awaited<ReturnType<typeof PlaylistServerApi.getPlaylists>>['data']
}

export const PlaylistPage = ({ playlist }: PlaylistPageProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const musicPlayer = useAppSelector(selectMusicPlayer)
  const { user } = useAuth()
  const updatePlaylist = useUpdatePlaylist()
  const deletePlaylist = useDeletePlaylist()
  const removeTrack = useRemoveTrackFromPlaylist()
  const addTracks = useAddTracksToPlaylist()
  const [isEditing, setIsEditing] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false)
  const [trackViewMode, setTrackViewMode] = useState<'compact' | 'list'>('list')
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null)
  const [title, setTitle] = useState(playlist?.title ?? '')
  const [description, setDescription] = useState(playlist?.description ?? '')
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const viewMenuRef = useRef<HTMLDivElement>(null)

  const tracks = useMemo(
    () => ((playlist?.tracks ?? []) as TrackEntity[]).filter(Boolean),
    [playlist?.tracks],
  )

  useEffect(() => {
    dispatch(setPlaylistTracks(tracks))
    dispatch(setCurrentPlaylistName(playlist?.title || 'Playlist'))
  }, [dispatch, playlist?.title, tracks])

  useEffect(() => {
    setTitle(playlist?.title ?? '')
    setDescription(playlist?.description ?? '')
  }, [playlist?.description, playlist?.title])

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        moreMenuRef.current?.contains(event.target as Node) ||
        viewMenuRef.current?.contains(event.target as Node)
      ) {
        return
      }

      setIsMoreOpen(false)
      setIsViewMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const coverUrl = playlist?.cover
    ? getPlaylistCoverUrl(playlist.cover)
    : tracks[0]?.cover
      ? getTrackCoverUrl(tracks[0].cover)
      : getPlaylistCoverUrl(null)
  const playlistId = playlist?.id
  const isOwner = Boolean(
    playlist?.user?.id && user?.id && playlist.user.id === user.id,
  )
  const existingTrackIds = useMemo(
    () => new Set(tracks.map((track) => track.id)),
    [tracks],
  )
  const playlistTrackIds = useMemo(
    () => new Set(tracks.map((track) => track.id)),
    [tracks],
  )
  const isCurrentPlaylistActive = Boolean(
    musicPlayer.currentTrack &&
      playlistTrackIds.has(musicPlayer.currentTrack.id) &&
      musicPlayer.playlist.some((track) => playlistTrackIds.has(track.id)),
  )
  const isCurrentPlaylistPlaying =
    isCurrentPlaylistActive && musicPlayer.isPlaying

  const handleUpdatePlaylist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!playlistId) return

    try {
      await updatePlaylist.mutateAsync({
        body: {
          description: description.trim() || undefined,
          title: title.trim(),
        },
        playlistId,
      })

      showApiSuccessToast('Playlist updated')
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      showApiErrorToast(error, 'Failed to update playlist')
    }
  }

  const handleDeletePlaylist = async () => {
    if (!playlistId) return
    if (!window.confirm('Delete this playlist?')) return

    try {
      await deletePlaylist.mutateAsync(playlistId)
      showApiSuccessToast('Playlist deleted')
      router.push(ROUTES.main)
    } catch (error) {
      showApiErrorToast(error, 'Failed to delete playlist')
    }
  }

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlistId) return

    try {
      await removeTrack.mutateAsync({
        params: {
          path: {
            id: playlistId,
            trackId,
          },
        },
      })
      showApiSuccessToast('Track removed from playlist')
      router.refresh()
    } catch (error) {
      showApiErrorToast(error, 'Failed to remove track from playlist')
    }
  }

  const handleAddTrack = async (track: TrackEntity) => {
    if (!playlistId || existingTrackIds.has(track.id)) return

    try {
      setAddingTrackId(track.id)
      await addTracks.mutateAsync({
        body: { trackIds: [track.id] },
        params: {
          path: { id: playlistId },
        },
      })
      showApiSuccessToast(`Added to ${playlist?.title || 'playlist'}`)
      router.refresh()
    } catch (error) {
      showApiErrorToast(error, 'Failed to add track to playlist')
    } finally {
      setAddingTrackId(null)
    }
  }

  const startPlaylist = (
    startTrack: TrackEntity,
    nextTracks: TrackEntity[],
  ) => {
    dispatch(setPlaylistTracks(nextTracks))
    dispatch(setCurrentPlaylistName(playlist?.title || 'Playlist'))
    dispatch(play(startTrack))
  }

  const shuffleTracks = (sourceTracks: TrackEntity[]) => {
    const shuffledTracks = [...sourceTracks]

    for (let index = shuffledTracks.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
      const currentTrack = shuffledTracks[index]
      shuffledTracks[index] = shuffledTracks[randomIndex] as TrackEntity
      shuffledTracks[randomIndex] = currentTrack as TrackEntity
    }

    return shuffledTracks
  }

  const handlePlayPlaylist = () => {
    const firstTrack = tracks[0]
    if (!firstTrack) return

    if (isCurrentPlaylistActive) {
      dispatch(togglePlay())
      return
    }

    startPlaylist(firstTrack, tracks)
  }

  const handleShufflePlaylist = () => {
    if (tracks.length === 0) return

    if (isCurrentPlaylistActive && musicPlayer.isShuffled) {
      dispatch(setShuffleEnabled(false))
      dispatch(setPlaylistTracks(tracks))
      return
    }

    const activeTrack = isCurrentPlaylistActive
      ? musicPlayer.currentTrack
      : null
    const shuffledTracks = shuffleTracks(
      tracks.filter((track) => track.id !== activeTrack?.id),
    )
    const nextTracks = activeTrack
      ? [activeTrack, ...shuffledTracks]
      : shuffledTracks
    const startTrack = activeTrack ?? nextTracks[0]
    if (!startTrack) return

    dispatch(setShuffleEnabled(true))
    startPlaylist(startTrack, nextTracks)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showApiSuccessToast('Link copied to clipboard')
      setIsMoreOpen(false)
    } catch (error) {
      showApiErrorToast(error, 'Failed to copy link')
    }
  }

  return (
    <>
      <PlaylistHeader
        author={playlist?.user?.username || 'Unknown'}
        duration={getPlaylistDuration(tracks)}
        imageUrl={coverUrl}
        title={playlist?.title || 'Playlist'}
        tracksCount={tracks.length}
        type="Playlist"
      />
      <div className="flex items-center justify-between bg-gradient-to-b from-black/25 to-background px-6 py-5">
        <div className="flex items-center gap-4 text-text-subdued">
          {tracks.length > 0 && (
            <button
              aria-label={
                isCurrentPlaylistPlaying
                  ? `Pause ${playlist?.title || 'playlist'}`
                  : `Play ${playlist?.title || 'playlist'}`
              }
              className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-black transition-transform hover:scale-105"
              onClick={handlePlayPlaylist}
              type="button"
            >
              {isCurrentPlaylistPlaying ? (
                <Pause fill="currentColor" size={26} />
              ) : (
                <Play fill="currentColor" size={26} />
              )}
            </button>
          )}
          {tracks.length > 0 && (
            <>
              <button
                aria-label="Shuffle playlist"
                className={
                  isCurrentPlaylistActive && musicPlayer.isShuffled
                    ? 'text-green-500 transition-colors hover:text-green-400'
                    : 'transition-colors hover:text-text'
                }
                onClick={handleShufflePlaylist}
                type="button"
              >
                <Shuffle size={30} />
              </button>
              {playlistId && (
                <LikePlaylistButton
                  cover={coverUrl}
                  ownerName={playlist?.user?.username || 'Unknown Artist'}
                  playlistId={playlistId}
                  playlistTitle={playlist?.title || 'playlist'}
                  tracksCount={tracks.length}
                />
              )}
              <button
                aria-label="Download playlist"
                className="transition-colors hover:text-text"
                type="button"
              >
                <Download size={30} />
              </button>
            </>
          )}
          {isOwner && (
            <button
              aria-label="Invite collaborators"
              className="transition-colors hover:text-text"
              type="button"
            >
              <UserPlus size={32} />
            </button>
          )}
          {tracks.length > 0 && (
            <button
              className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-bold text-text transition-colors hover:border-white"
              type="button"
            >
              Mix
            </button>
          )}
          <div className="relative" ref={moreMenuRef}>
            <button
              aria-expanded={isMoreOpen}
              aria-label="More playlist options"
              className="transition-colors hover:text-text"
              onClick={() => setIsMoreOpen((value) => !value)}
              type="button"
            >
              <MoreHorizontal size={30} />
            </button>
            {isMoreOpen && (
              <PlaylistMoreMenu
                canEdit={isOwner}
                onCopyLink={handleCopyLink}
                onDelete={handleDeletePlaylist}
                onEdit={() => {
                  setIsEditing(true)
                  setIsMoreOpen(false)
                }}
              />
            )}
          </div>
        </div>
        <div className="relative" ref={viewMenuRef}>
          <button
            aria-expanded={isViewMenuOpen}
            aria-label="Change track list view"
            className="flex items-center gap-2 text-sm capitalize text-text-subdued transition-colors hover:text-text"
            onClick={() => setIsViewMenuOpen((value) => !value)}
            type="button"
          >
            {trackViewMode}
            <List size={18} />
          </button>
          {isViewMenuOpen && (
            <TrackViewMenu
              onChange={(viewMode) => {
                setTrackViewMode(viewMode)
                setIsViewMenuOpen(false)
              }}
              value={trackViewMode}
            />
          )}
        </div>
      </div>
      {isOwner && isEditing && (
        <div className="border-b border-white/10 px-6 py-4">
          <form
            className="grid max-w-160 gap-3"
            onSubmit={handleUpdatePlaylist}
          >
            <input
              className="h-10 rounded-md bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
            <textarea
              className="min-h-20 rounded-md bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-white/30"
              maxLength={240}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              value={description}
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60"
                disabled={updatePlaylist.isPending || title.trim().length === 0}
                type="submit"
              >
                Save
              </button>
              <button
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-text hover:bg-white/15"
                onClick={() => setIsEditing(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {tracks.length > 0 && (
        <TracksList
          onRemoveTrack={isOwner ? handleRemoveTrack : undefined}
          removable={isOwner}
          tracks={tracks}
          viewMode={trackViewMode}
        />
      )}
      {isOwner && playlistId && (
        <PlaylistTrackFinder
          addingTrackId={addingTrackId}
          existingTrackIds={existingTrackIds}
          onAddTrack={handleAddTrack}
          playlistTitle={playlist?.title || 'playlist'}
        />
      )}
      {!isOwner && tracks.length === 0 && (
        <div className="px-6 py-10 text-text-subdued">
          No tracks in this playlist.
        </div>
      )}
    </>
  )
}

type PlaylistMoreMenuProps = {
  canEdit: boolean
  onCopyLink: () => void
  onDelete: () => void
  onEdit: () => void
}

type TrackViewMenuProps = {
  onChange: (viewMode: 'compact' | 'list') => void
  value: 'compact' | 'list'
}

const TrackViewMenu = ({ onChange, value }: TrackViewMenuProps) => (
  <div className="absolute right-0 top-[calc(100%+10px)] z-40 w-40 rounded-md bg-[#282828] p-1 text-sm text-text shadow-2xl">
    <div className="px-3 py-2 text-xs font-bold text-text-subdued">View as</div>
    <TrackViewMenuItem
      active={value === 'compact'}
      label="Compact"
      onClick={() => onChange('compact')}
    />
    <TrackViewMenuItem
      active={value === 'list'}
      label="List"
      onClick={() => onChange('list')}
    />
  </div>
)

type TrackViewMenuItemProps = {
  active: boolean
  label: string
  onClick: () => void
}

const TrackViewMenuItem = ({
  active,
  label,
  onClick,
}: TrackViewMenuItemProps) => (
  <button
    className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-left transition-colors hover:bg-white/10 ${
      active ? 'text-green-500' : 'text-text'
    }`}
    onClick={onClick}
    type="button"
  >
    <span className="flex items-center gap-3">
      <List size={17} />
      {label}
    </span>
    {active && <Check size={17} />}
  </button>
)

const PlaylistMoreMenu = ({
  canEdit,
  onCopyLink,
  onDelete,
  onEdit,
}: PlaylistMoreMenuProps) => (
  <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-66 rounded-md bg-[#282828] p-1 text-sm text-text shadow-2xl">
    <PlaylistMenuItem disabled icon={<List size={17} />} label="Add to queue" />
    <PlaylistMenuItem
      disabled={!canEdit}
      icon={<UserRoundPlus size={17} />}
      label="Add to profile"
    />
    <PlaylistMenuItem
      disabled={!canEdit}
      icon={<Pencil size={17} />}
      label="Edit details"
      onClick={onEdit}
    />
    <PlaylistMenuItem
      disabled={!canEdit}
      icon={<Trash2 size={17} />}
      label="Delete"
      onClick={onDelete}
    />
    <div className="mx-2 my-1 border-t border-white/10" />
    <PlaylistMenuItem disabled icon={<Lock size={17} />} label="Make private" />
    <PlaylistMenuItem
      disabled={!canEdit}
      icon={<UserPlus size={17} />}
      label="Invite collaborators"
    />
    <PlaylistMenuItem
      disabled
      icon={<SlidersHorizontal size={17} />}
      label="Exclude from your taste profile"
    />
    <PlaylistMenuItem
      disabled
      icon={<FolderInput size={17} />}
      label="Move to folder"
    />
    <PlaylistMenuItem
      icon={<Share2 size={17} />}
      label="Share"
      onClick={onCopyLink}
    />
    <div className="mx-2 my-1 border-t border-white/10" />
    <PlaylistMenuItem
      disabled
      icon={<MonitorUp size={17} />}
      label="Open in Desktop app"
    />
  </div>
)

type PlaylistMenuItemProps = {
  disabled?: boolean
  icon: ReactNode
  label: string
  onClick?: () => void
}

const PlaylistMenuItem = ({
  disabled = false,
  icon,
  label,
  onClick,
}: PlaylistMenuItemProps) => (
  <button
    className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-text-subdued transition-colors hover:bg-white/10 hover:text-text disabled:cursor-not-allowed disabled:opacity-45"
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {icon}
    <span>{label}</span>
  </button>
)

type PlaylistTrackFinderProps = {
  addingTrackId: string | null
  existingTrackIds: Set<string>
  onAddTrack: (track: TrackEntity) => void
  playlistTitle: string
}

const PlaylistTrackFinder = ({
  addingTrackId,
  existingTrackIds,
  onAddTrack,
  playlistTitle,
}: PlaylistTrackFinderProps) => {
  const [query, setQuery] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim()
  const shouldSearch = normalizedQuery.length > 1
  const { data: tracks = [], isFetching } = useTracks(
    { limit: 5, title: normalizedQuery },
    { enabled: shouldSearch },
  )
  const suggestedTracks = useMemo(
    () =>
      (tracks as TrackEntity[]).filter(
        (track) => !existingTrackIds.has(track.id),
      ),
    [existingTrackIds, tracks],
  )

  if (!isVisible) return null

  return (
    <section className="px-6 pb-10 pt-6">
      <div className="border-t border-white/10 pt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-text">
            Let's find something for your playlist
          </h2>
          <button
            aria-label="Hide recommendations"
            className="text-text-subdued transition-colors hover:text-text"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            <X size={30} />
          </button>
        </div>
        <label className="relative block max-w-100">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subdued"
            size={18}
          />
          <input
            className="h-10 w-full rounded bg-surface py-2 pl-10 pr-10 text-sm text-text outline-none transition-colors placeholder:text-text-subdued focus:bg-surface-hover focus:ring-2 focus:ring-white/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for songs or episodes"
            value={query}
          />
          {query.length > 0 && (
            <button
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subdued hover:text-text"
              onClick={() => setQuery('')}
              type="button"
            >
              <X size={18} />
            </button>
          )}
        </label>

        <div className="mt-5 space-y-1">
          {!shouldSearch && (
            <p className="text-sm text-text-subdued">
              Search tracks and add them to {playlistTitle}.
            </p>
          )}
          {shouldSearch && isFetching && (
            <p className="text-sm text-text-subdued">Searching...</p>
          )}
          {shouldSearch && !isFetching && suggestedTracks.length === 0 && (
            <p className="text-sm text-text-subdued">No tracks found.</p>
          )}
          {suggestedTracks.map((track) => (
            <div
              className="grid grid-cols-[44px_minmax(0,1.8fr)_minmax(160px,1fr)_auto] items-center gap-3 rounded px-3 py-2 transition-colors hover:bg-white/10 max-[860px]:grid-cols-[44px_minmax(0,1fr)_auto]"
              key={track.id}
            >
              <Image
                alt={track.title}
                className="h-10 w-10 rounded object-cover"
                height={40}
                src={getTrackCoverUrl(track.cover)}
                unoptimized
                width={40}
              />
              <div className="min-w-0">
                <p className="truncate font-medium text-text">{track.title}</p>
                <p className="truncate text-sm text-text-subdued">
                  {track.artistId}
                </p>
              </div>
              <p className="truncate text-sm text-text-subdued max-[860px]:hidden">
                {track.title}
              </p>
              <button
                className="rounded-full border border-white/50 px-4 py-1.5 text-sm font-bold text-text transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={addingTrackId === track.id}
                onClick={() => onAddTrack(track)}
                type="button"
              >
                {addingTrackId === track.id ? 'Adding' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
