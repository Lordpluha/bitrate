'use client'

import { useFollowedArtists } from '@entities/Artist/api/client'
import { useMemo } from 'react'

export type UseIsFollowingArtistInput = {
  artistId?: string
  enabled?: boolean
}

/** Resolves follow state for one artist from the signed-in user's following list. */
export const useIsFollowingArtist = ({
  artistId,
  enabled = true,
}: UseIsFollowingArtistInput) => {
  const { data, isPending } = useFollowedArtists(enabled && !!artistId)

  const isFollowing = useMemo(
    () => (data ?? []).some((artist) => artist.id === artistId),
    [data, artistId],
  )

  return { isFollowing, isPending }
}
