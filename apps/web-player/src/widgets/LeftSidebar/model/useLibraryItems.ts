'use client'

import { useMemo } from 'react'
import { useFollowedArtists } from '@/entities/Artist'
import { LIKED_SONGS_ID, usePlaylistLibraryItems } from '@/entities/Playlist'
import { useAllSavedEpisodes } from '@/entities/Podcast'
import { useLikedTracksCount } from '@/entities/Track'
import { useAuth } from '@/shared/hooks'
import { getArtistAvatarUrl } from '@/shared/utils/mediaUrl'
import { buildSavedPodcastLibraryItems } from '@/widgets/LeftSidebar/model/buildSavedPodcastLibraryItems'
import type {
  LibraryItemType,
  LibraryMusicItem,
} from '@/widgets/LeftSidebar/model/library.types'
import {
  type LibrarySort,
  sortLibraryItems,
} from '@/widgets/LeftSidebar/model/sortLibraryItems'

type UseLibraryItemsInput = {
  /** Empty means "no filter applied", matching how the chips start out. */
  selectedTypes: LibraryItemType[]
  sort: LibrarySort
}

/**
 * Merges everything the listener has collected into one filterable list.
 *
 * Followed artists and saved episodes live in their own entities, so the merge
 * happens here in the widget: an entity may not reach across to another entity.
 */
export const useLibraryItems = ({
  selectedTypes,
  sort,
}: UseLibraryItemsInput) => {
  const { user } = useAuth()
  const playlists = usePlaylistLibraryItems()
  const { data: artists = [], isLoading: areArtistsLoading } =
    useFollowedArtists(!!user)
  const { data: episodes = [], isLoading: areEpisodesLoading } =
    useAllSavedEpisodes(!!user)
  const { data: likedTracksCount = 0 } = useLikedTracksCount(!!user)

  const items = useMemo(() => {
    const artistItems: LibraryMusicItem[] = artists.map((artist) => ({
      cover: getArtistAvatarUrl(artist.avatar),
      id: artist.id,
      title: artist.username,
      tracksCount: 0,
      type: 'artist',
      username: 'Artist',
    }))

    const episodeItems = buildSavedPodcastLibraryItems(episodes)

    const all: LibraryMusicItem[] = [
      ...playlists.items.map((item) =>
        item.id === LIKED_SONGS_ID
          ? { ...item, tracksCount: likedTracksCount }
          : item,
      ),
      ...artistItems,
      ...episodeItems,
    ]

    const visible =
      selectedTypes.length === 0
        ? all
        : all.filter((item) => selectedTypes.includes(item.type))
    return sortLibraryItems({ items: visible, sort })
  }, [
    artists,
    episodes,
    likedTracksCount,
    playlists.items,
    selectedTypes,
    sort,
  ])

  return {
    isLoading: playlists.isLoading || areArtistsLoading || areEpisodesLoading,
    items,
  }
}
