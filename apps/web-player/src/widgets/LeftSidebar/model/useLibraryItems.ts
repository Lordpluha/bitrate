'use client'

import { useMemo } from 'react'
import { useFollowedArtists } from '@/entities/Artist'
import { usePlaylistLibraryItems } from '@/entities/Playlist'
import { useSavedEpisodes } from '@/entities/Podcast'
import { useAuth } from '@/shared/hooks'
import {
  getArtistAvatarUrl,
  getPlaylistCoverUrl,
} from '@/shared/utils/mediaUrl'
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
  const { data: episodes, isLoading: areEpisodesLoading } = useSavedEpisodes(
    1,
    20,
    !!user,
  )

  const items = useMemo(() => {
    const artistItems: LibraryMusicItem[] = artists.map((artist) => ({
      cover: getArtistAvatarUrl(artist.avatar),
      id: artist.id,
      title: artist.username,
      tracksCount: 0,
      type: 'artist',
      username: 'Artist',
    }))

    const episodeItems: LibraryMusicItem[] = (episodes?.data ?? []).map(
      (episode) => ({
        cover: getPlaylistCoverUrl(episode.cover),
        id: episode.id,
        title: episode.title,
        tracksCount: 0,
        type: 'podcast',
        username: episode.podcast.title,
      }),
    )

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
