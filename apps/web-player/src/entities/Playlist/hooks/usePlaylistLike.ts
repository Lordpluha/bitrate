'use client'

import {
  useLikedPlaylists,
  useLikePlaylist,
  useUnlikePlaylist,
} from '@/entities/Playlist/api/client'
import { showApiSuccessToast } from '@/shared/api/feedback'
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

  /** Failures are toasted by the query client's mutation cache. */
  const toggleLike = () => {
    if (isPending) return

    const variables = { params: { path: { id: playlist.id } } }
    if (isLiked) {
      unlikePlaylist.mutate(variables, {
        onSuccess: () => showApiSuccessToast('Removed from Your Library'),
      })
      return
    }

    likePlaylist.mutate(variables, {
      onSuccess: () => showApiSuccessToast('Added to Your Library'),
    })
  }

  return {
    isLiked,
    isPending,
    toggleLike,
  }
}
