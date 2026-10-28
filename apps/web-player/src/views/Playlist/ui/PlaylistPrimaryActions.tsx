import { Pause, Play, Shuffle } from 'lucide-react'
import { LikePlaylistButton } from '@/entities/Playlist'
import { useI18n } from '@/shared/i18n'
import type { PlaylistPlayback } from '@/views/Playlist/model/playlist.types'

export type PlaylistActionDetails = {
  id: string
  isOwner: boolean
  title: string
  tracksCount: number
}

type PlaylistPrimaryActionsProps = {
  details: PlaylistActionDetails
  playback: PlaylistPlayback
}

export const PlaylistPrimaryActions = ({
  details,
  playback,
}: PlaylistPrimaryActionsProps) => {
  const { t } = useI18n()

  return (
    <>
      {details.tracksCount > 0 && (
        <>
          <button
            aria-label={t(
              playback.isPlaying ? 'common.pauseName' : 'common.playName',
              { name: details.title },
            )}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 max-md:order-last max-md:ml-auto md:size-14"
            onClick={playback.handlePlayPlaylist}
            type="button"
          >
            {playback.isPlaying ? (
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
          <button
            aria-label={
              playback.isShuffled
                ? t('playlist.disableShuffle')
                : t('playlist.shuffle')
            }
            aria-pressed={playback.isShuffled}
            className={
              playback.isShuffled
                ? 'text-primary transition-colors hover:text-primary-hover'
                : 'transition-colors hover:text-foreground'
            }
            onClick={playback.handleShufflePlaylist}
            type="button"
          >
            <Shuffle aria-hidden="true" className="size-5 md:size-6.5" />
          </button>
          <LikePlaylistButton
            playlist={{ id: details.id, title: details.title }}
          />
        </>
      )}
    </>
  )
}
