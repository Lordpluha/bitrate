'use client'

import { setCurrentPlaylistName, setPlaylistTracks } from '@entities/Player'
import {
  useDeletePlaylist,
  useRemoveTrackFromPlaylist,
  useUpdatePlaylist,
} from '@entities/Playlist'
import type { PlaylistServerApi } from '@entities/Playlist/api/server/PlaylistApi.server'
import { showApiSuccessToast } from '@shared/api/feedback'
import { useAppDispatch, useAuth } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { getPlaylistCoverUrl } from '@shared/utils/mediaUrl'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { TracksList } from '../../../entities/Track/ui/TracksList'
import { getPlaylistDuration } from '../utils/getPlaylistDuration'
import { PlaylistHeader } from './PlaylistHeader'

interface PlaylistPageProps {
  playlist: Awaited<ReturnType<typeof PlaylistServerApi.getPlaylists>>['data']
}

export const PlaylistPage = ({ playlist }: PlaylistPageProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const updatePlaylist = useUpdatePlaylist()
  const deletePlaylist = useDeletePlaylist()
  const removeTrack = useRemoveTrackFromPlaylist()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(playlist?.title ?? '')
  const [description, setDescription] = useState(playlist?.description ?? '')

  useEffect(() => {
    dispatch(setPlaylistTracks(playlist?.tracks || []))
    dispatch(setCurrentPlaylistName(playlist?.title || 'Playlist'))
  }, [dispatch, playlist])

  useEffect(() => {
    setTitle(playlist?.title ?? '')
    setDescription(playlist?.description ?? '')
  }, [playlist?.description, playlist?.title])

  const coverUrl = getPlaylistCoverUrl(playlist?.cover)
  const playlistId = playlist?.id
  const isOwner = Boolean(
    playlist?.user?.id && user?.id && playlist.user.id === user.id,
  )

  const handleUpdatePlaylist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!playlistId) return

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
  }

  const handleDeletePlaylist = async () => {
    if (!playlistId) return
    if (!window.confirm('Delete this playlist?')) return

    await deletePlaylist.mutateAsync(playlistId)
    showApiSuccessToast('Playlist deleted')
    router.push(ROUTES.library)
  }

  const handleRemoveTrack = async (trackId: string) => {
    if (!playlistId) return

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
  }

  return (
    <>
      <PlaylistHeader
        author={playlist?.user?.username || 'Unknown'}
        duration={getPlaylistDuration(playlist?.tracks || [])}
        imageUrl={coverUrl}
        title={playlist?.title || 'Playlist'}
        tracksCount={playlist?.tracks?.length || 0}
        type="Playlist"
      />
      {isOwner && (
        <div className="border-b border-white/10 px-6 py-4">
          {isEditing ? (
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
                  disabled={
                    updatePlaylist.isPending || title.trim().length === 0
                  }
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
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-text hover:bg-white/15"
                onClick={() => setIsEditing(true)}
                type="button"
              >
                Edit details
              </button>
              <button
                className="rounded-full bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/25 disabled:opacity-60"
                disabled={deletePlaylist.isPending}
                onClick={handleDeletePlaylist}
                type="button"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
      {playlist?.tracks?.length === 0 ? (
        <div className="text-white p-8">No tracks in this playlist</div>
      ) : (
        <TracksList
          onRemoveTrack={isOwner ? handleRemoveTrack : undefined}
          removable={isOwner}
          tracks={playlist?.tracks || []}
        />
      )}
    </>
  )
}
