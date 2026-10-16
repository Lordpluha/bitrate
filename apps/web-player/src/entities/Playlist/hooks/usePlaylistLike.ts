'use client'

import {
  useLikedPlaylists,
  useLikePlaylist,
  useUnlikePlaylist,
} from '@/entities/Playlist/api/client'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'

export type LikeablePlaylist = {
  id: string
  title?: string
}

type UsePlaylistLikeOptions = {
  playlist: LikeablePlaylist
}

/** Like state from the server's liked list (`GET /playlists/liked`), so it follows the account. */
export const usePlaylistLike = ({ playlist }: UsePlaylistLikeOptions) => {
  const { user } = useAuth()
  const { data: likedPlaylists } = useLikedPlaylists(Boolean(user))
  const likePlaylist = useLikePlaylist()
  const unlikePlaylist = useUnlikePlaylist()
  const isLiked =
    likedPlaylists?.some((liked) => liked.id === playlist.id) ?? false
  const isPending = likePlaylist.isPending || unlikePlaylist.isPending

  const toggleLike = async () => {
    if (isPending) return

    try {
      if (isLiked) {
        await unlikePlaylist.mutateAsync({
          params: { path: { id: playlist.id } },
        })
        showApiSuccessToast('Removed from Your Library')
        return
      }

      await likePlaylist.mutateAsync({
        params: { path: { id: playlist.id } },
      })
      showApiSuccessToast('Added to Your Library')
    } catch (error) {
      showApiErrorToast(
        error,
        `Failed to update ${playlist.title ?? 'playlist'}`,
      )
    }
  }

  return {
    isLiked,
    isPending,
    toggleLike,
  }
}
