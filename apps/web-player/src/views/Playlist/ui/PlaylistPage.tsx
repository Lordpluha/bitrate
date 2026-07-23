'use client'

import { usePlaylist } from '@/entities/Playlist'
import { PlaylistContent } from '@/views/Playlist/ui/PlaylistContent'
import {
  PlaylistLoadError,
  PlaylistLoading,
} from '@/views/Playlist/ui/PlaylistLoadStates'

type PlaylistPageProps = {
  playlistId: string
}

export const PlaylistPage = ({ playlistId }: PlaylistPageProps) => {
  const { data: playlist, error, isPending, refetch } = usePlaylist(playlistId)

  if (isPending) return <PlaylistLoading />

  if (!playlist) {
    return (
      <PlaylistLoadError
        error={error}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  return <PlaylistContent key={playlist.id} playlist={playlist} />
}
