'use client'

import { selectMusicPlayer, usePlayerStore } from '@/entities/Player'
import { type TrackEntity, TracksList } from '@/entities/Track'
import { useI18n } from '@/shared/i18n'
import { LibraryEmptyState } from '@/views/Library/ui/LibraryEmptyAware'

/** The playback context the Liked Songs page uses, so both light up the same rows. */
const LIKED_SONGS_PLAYBACK_ID = 'liked-songs'

type LikedTracksLibrarySectionProps = {
  tracks: TrackEntity[]
}

/** Liked tracks in the design's track table, played as the Liked Songs context. */
export const LikedTracksLibrarySection = ({
  tracks,
}: LikedTracksLibrarySectionProps) => {
  const { t } = useI18n()
  const musicPlayer = usePlayerStore(selectMusicPlayer)
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)

  if (tracks.length === 0) return <LibraryEmptyState />

  return (
    <TracksList
      activeTrackId={musicPlayer.currentTrack?.id}
      isPlaybackContextActive={
        musicPlayer.currentPlaylistId === LIKED_SONGS_PLAYBACK_ID
      }
      likedTrackIds={tracks.map((track) => track.id)}
      onPlayTrack={(track, index) =>
        playPlaylist({
          currentPlaylistId: LIKED_SONGS_PLAYBACK_ID,
          currentPlaylistName: t('library.likedSongs'),
          startTrack: track,
          startTrackIndex: index,
          tracks,
        })
      }
      tracks={tracks}
    />
  )
}
