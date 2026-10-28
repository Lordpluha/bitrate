'use client'

import { LikeAlbumButton } from '@entities/Album'
import { selectMusicPlayer, usePlayerStore } from '@entities/Player'
import { type TrackEntity, TracksList } from '@entities/Track'
import { useI18n } from '@shared/i18n'
import { StateMessage } from '@shared/ui'
import { Disc3, Pause, Play } from 'lucide-react'

type AlbumTrackSectionProps = {
  albumId: string
  albumTitle: string
  tracks: TrackEntity[]
}

export const AlbumTrackSection = ({
  albumId,
  albumTitle,
  tracks,
}: AlbumTrackSectionProps) => {
  const { t } = useI18n()
  const musicPlayer = usePlayerStore(selectMusicPlayer)
  const playPlaylist = usePlayerStore((state) => state.playPlaylist)
  const playbackId = `album:${albumId}`
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const isAlbumContext = musicPlayer.currentPlaylistId === playbackId
  const isAlbumPlaying = isAlbumContext && musicPlayer.isPlaying
  const playFrom = (track: TrackEntity, index: number) =>
    playPlaylist({
      currentPlaylistId: playbackId,
      currentPlaylistName: albumTitle,
      startTrack: track,
      startTrackIndex: index,
      tracks,
    })
  const handlePlayAlbum = () => {
    if (isAlbumContext) {
      togglePlay()
      return
    }
    const [firstTrack] = tracks
    if (firstTrack) playFrom(firstTrack, 0)
  }

  return (
    <>
      <section
        aria-label={t('album.actions', { title: albumTitle })}
        className="flex items-center gap-4.5"
        hidden={tracks.length === 0}
      >
        {tracks.length > 0 ? (
          <button
            aria-label={t(
              isAlbumPlaying ? 'common.pauseName' : 'common.playName',
              {
                name: albumTitle,
              },
            )}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 max-md:order-last max-md:ml-auto md:size-14"
            onClick={handlePlayAlbum}
            type="button"
          >
            {isAlbumPlaying ? (
              <Pause
                aria-hidden="true"
                className="size-4.5 md:size-6"
                fill="currentColor"
              />
            ) : (
              <Play
                aria-hidden="true"
                className="size-4.5 md:size-6"
                fill="currentColor"
              />
            )}
          </button>
        ) : null}
        <LikeAlbumButton albumId={albumId} albumTitle={albumTitle} />
      </section>

      {tracks.length === 0 ? (
        <StateMessage
          description={t('album.noTracksDescription')}
          icon={Disc3}
          title={t('album.noTracks')}
        />
      ) : (
        <TracksList
          activeTrackId={musicPlayer.currentTrack?.id}
          isPlaybackContextActive={isAlbumContext}
          onPlayTrack={playFrom}
          showDateAdded={false}
          tracks={tracks}
        />
      )}
    </>
  )
}
