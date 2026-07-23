'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  useAddTracksToPlaylist,
  useDeletePlaylist,
  useRemoveTrackFromPlaylist,
} from '@/entities/Playlist'
import type { TrackEntity } from '@/entities/Track'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { ROUTES } from '@/shared/routes'
import type { PlaylistActions } from '@/views/Playlist/model/playlist.types'

type UsePlaylistActionsOptions = {
  playlistId: string
  playlistTitle: string
  tracks: TrackEntity[]
}

export const usePlaylistActions = ({
  playlistId,
  playlistTitle,
  tracks,
}: UsePlaylistActionsOptions): PlaylistActions => {
  const router = useRouter()
  const deleteMutation = useDeletePlaylist()
  const removeTrackMutation = useRemoveTrackFromPlaylist()
  const addTracksMutation = useAddTracksToPlaylist()
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null)
  const existingTrackIds = useMemo(
    () => new Set(tracks.map((track) => track.id)),
    [tracks],
  )

  const deletePlaylist = async () => {
    if (!window.confirm('Delete this playlist?')) return

    try {
      await deleteMutation.mutateAsync(playlistId)
      showApiSuccessToast('Playlist deleted')
      router.push(ROUTES.main)
    } catch (error) {
      showApiErrorToast(error, 'Failed to delete playlist')
    }
  }

  const removeTrack = async (trackId: string) => {
    try {
      await removeTrackMutation.mutateAsync({
        params: { path: { id: playlistId, trackId } },
      })
      showApiSuccessToast('Track removed from playlist')
    } catch (error) {
      showApiErrorToast(error, 'Failed to remove track from playlist')
    }
  }

  const addTrack = async (track: TrackEntity) => {
    if (existingTrackIds.has(track.id)) return

    try {
      setAddingTrackId(track.id)
      await addTracksMutation.mutateAsync({
        body: { trackIds: [track.id] },
        params: { path: { id: playlistId } },
      })
      showApiSuccessToast(`Added to ${playlistTitle}`)
    } catch (error) {
      showApiErrorToast(error, 'Failed to add track to playlist')
    } finally {
      setAddingTrackId(null)
    }
  }

  return {
    addingTrackId,
    deletePlaylist: () => void deletePlaylist(),
    existingTrackIds,
    addTrack: (track) => void addTrack(track),
    removeTrack: (trackId) => void removeTrack(trackId),
  }
}
