'use client'

import { useMemo } from 'react'
import { useFollowedArtists } from '@/entities/Artist'
import { usePlaylistLibraryItems } from '@/entities/Playlist'
import { useAllSavedEpisodes } from '@/entities/Podcast'
import { useAuth } from '@/shared/hooks'
import { getArtistAvatarUrl } from '@/shared/utils/mediaUrl'
import { buildSavedPodcastLibraryItems } from '@/widgets/LeftSidebar/model/buildSavedPodcastLibraryItems'
import type {
  LibraryItemType,
  LibraryMusicItem,
} from '@/widgets/LeftSidebar/model/library.types'

type UseLibraryItemsInput = {
  /** Empty means "no filter applied", matching how the chips start out. */
  selectedTypes: LibraryItemType[]
}

/**
 * Merges everything the listener has collected into one filterable list.
 *
 * Followed artists and saved episodes live in their own entities, so the merge
 * happens here in the widget: an entity may not reach across to another entity.
 */
export const useLibraryItems = ({ selectedTypes }: UseLibraryItemsInput) => {
  const { user } = useAuth()
  const playlists = usePlaylistLibraryItems()
  const { data: artists = [], isLoading: areArtistsLoading } =
    useFollowedArtists(!!user)
  const { data: episodes = [], isLoading: areEpisodesLoading } =
    useAllSavedEpisodes(!!user)

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
      ...playlists.items,
      ...artistItems,
      ...episodeItems,
    ]

    if (selectedTypes.length === 0) return all

    return all.filter((item) => selectedTypes.includes(item.type))
  }, [artists, episodes, playlists.items, selectedTypes])

  return {
    isLoading: playlists.isLoading || areArtistsLoading || areEpisodesLoading,
    items,
  }
}
