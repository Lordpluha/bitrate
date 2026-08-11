'use client'

import { LikeAlbumButton } from '@entities/Album'
import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { type TrackEntity, TracksList } from '@entities/Track'

type AlbumTrackSectionProps = {
  albumId: string
  albumTitle: string
  likedTrackIds: Set<string>
  tracks: TrackEntity[]
}

export const AlbumTrackSection = ({
  albumId,
  albumTitle,
  likedTrackIds,
  tracks,
}: AlbumTrackSectionProps) => {
  const musicPlayer = usePlayerStore(selectMusicPlayer)
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const playbackId = `album:${albumId}`

  return (
    <>
      <section className="border-b border-white/10 px-4 py-4 sm:px-6">
        <LikeAlbumButton albumId={albumId} albumTitle={albumTitle} />
      </section>

      {tracks.length === 0 ? (
        <p className="p-4 text-text-subdued sm:p-8" role="status">
          No tracks in this album
        </p>
      ) : (
        <TracksList
          activeTrackId={musicPlayer.currentTrack?.id}
          isPlaybackContextActive={musicPlayer.currentPlaylistId === playbackId}
          likedTrackIds={likedTrackIds}
          onPlayTrack={(track, index) =>
            playPlaylist({
              currentPlaylistId: playbackId,
              currentPlaylistName: albumTitle,
              startTrack: track,
              startTrackIndex: index,
              tracks,
            })
          }
          tracks={tracks}
        />
      )}
    </>
  )
}
