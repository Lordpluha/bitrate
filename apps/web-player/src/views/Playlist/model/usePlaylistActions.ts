'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  useAddTracksToPlaylist,
  useDeletePlaylist,
  useRemoveTrackFromPlaylist,
} from '@/entities/Playlist'
import type { TrackEntity } from '@/entities/Track'
import { showApiSuccessToast } from '@/shared/api/feedback'
import { useI18n } from '@/shared/i18n'
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
  const { t } = useI18n()
  const router = useRouter()
  const deleteMutation = useDeletePlaylist()
  const removeTrackMutation = useRemoveTrackFromPlaylist()
  const addTracksMutation = useAddTracksToPlaylist()
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null)
  const existingTrackIds = useMemo(
    () => new Set(tracks.map((track) => track.id)),
    [tracks],
  )

  /** Failures are toasted by the query client's mutation cache. */
  const deletePlaylist = () => {
    if (!window.confirm(t('playlist.deleteConfirm'))) return

    deleteMutation.mutate(playlistId, {
      onSuccess: () => {
        showApiSuccessToast(t('playlist.deleted'))
        router.push(ROUTES.main)
      },
    })
  }

  const removeTrack = (trackId: string) =>
    removeTrackMutation.mutate(
      { params: { path: { id: playlistId, trackId } } },
      { onSuccess: () => showApiSuccessToast(t('playlist.trackRemoved')) },
    )

  const addTrack = (track: TrackEntity) => {
    if (existingTrackIds.has(track.id)) return

    setAddingTrackId(track.id)
    addTracksMutation.mutate(
      {
        body: { trackIds: [track.id] },
        params: { path: { id: playlistId } },
      },
      {
        onSettled: () => setAddingTrackId(null),
        onSuccess: () =>
          showApiSuccessToast(t('playlist.addedTo', { title: playlistTitle })),
      },
    )
  }

  return {
    addingTrackId,
    deletePlaylist,
    existingTrackIds,
    addTrack,
    removeTrack,
  }
}
