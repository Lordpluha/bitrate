'use client'

import { albumDetailQuery } from '@entities/Album'
import { usePlayerStore } from '@entities/Player'
import { playlistDetailQuery } from '@entities/Playlist'
import { getTrackById, type TrackEntity } from '@entities/Track'
import { showApiErrorToast } from '@shared/api/feedback'
import { useQueryClient } from '@tanstack/react-query'

/** What a card's play button starts: a whole album or playlist, or a single track. */
type PlayableCollection = {
  id: string
  kind: 'album' | 'playlist' | 'track'
  title: string
}

/** The playback context ids the album and playlist pages use, so their rows light up. */
const playbackIdFor = ({ id, kind }: PlayableCollection) =>
  kind === 'album' ? `album:${id}` : id

/**
 * Starts an album or playlist from its first track (or a single track) without opening it.
 * Tracks come through the same queries the pages use, so a later visit is instant.
 */
export const usePlayCollection = () => {
  const queryClient = useQueryClient()
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const play = usePlayerStore((state) => state.play)

  const loadTracks = async (
    collection: PlayableCollection,
  ): Promise<TrackEntity[]> => {
    if (collection.kind === 'album') {
      const album = await queryClient.fetchQuery(
        albumDetailQuery(collection.id),
      )
      return album.tracks ?? []
    }
    const playlist = await queryClient.fetchQuery(
      playlistDetailQuery(collection.id),
    )
    return playlist.tracks ?? []
  }

  return async (collection: PlayableCollection) => {
    try {
      if (collection.kind === 'track') {
        play(await getTrackById(collection.id))
        return
      }

      const tracks = await loadTracks(collection)
      const [firstTrack] = tracks
      if (!firstTrack) return

      playPlaylist({
        currentPlaylistId: playbackIdFor(collection),
        currentPlaylistName: collection.title,
        startTrack: firstTrack,
        startTrackIndex: 0,
        tracks,
      })
    } catch (error) {
      showApiErrorToast(error, `Unable to play ${collection.title}.`)
    }
  }
}
