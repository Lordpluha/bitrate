'use client'

import { RollupIcon } from '@bitrate/ui-react'
import { useArtist } from '@entities/Artist'
import {
  selectCurrentPlaylistName,
  selectCurrentTrack,
  usePlayerStore,
} from '@entities/Player'
import { LikeTrackButton } from '@entities/Track'
import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import { MediaImage } from '@shared/ui/MediaImage'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import Link from 'next/link'

type CurrentPlaylistProps = {
  onCollapse?: () => void
}

export const CurrentPlaylist = ({ onCollapse }: CurrentPlaylistProps) => {
  const { t } = useI18n()
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const playlistName = usePlayerStore(selectCurrentPlaylistName)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const artistName = artist?.username || t('common.unknownArtist')

  if (!currentTrack) {
    return null
  }

  const coverUrl = getTrackCoverUrl(currentTrack.cover)

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex h-7 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-accent"
          />
          <h2 className="truncate text-[10px] font-medium tracking-wide text-foreground/90 uppercase">
            {playlistName
              ? t('sidebar.nowPlayingFrom', { name: playlistName })
              : t('queue.nowPlaying')}
          </h2>
        </div>
        {onCollapse && (
          <button
            aria-label={t('sidebar.collapse')}
            className="flex size-7 shrink-0 items-center justify-center rounded-[7px] border border-primary bg-secondary text-accent transition-colors hover:bg-surface"
            onClick={onCollapse}
            type="button"
          >
            <RollupIcon height={14} primaryColor="currentColor" width={14} />
          </button>
        )}
      </div>
      <div className="relative aspect-square w-full">
        <MediaImage
          alt={currentTrack.title}
          className="rounded-md object-cover"
          fallback="track"
          fill
          priority
          sizes="320px"
          src={coverUrl}
          unoptimized
        />
      </div>
      <div className="flex items-center gap-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="truncate text-[25px] leading-[1.3] font-semibold text-foreground">
            {currentTrack.title}
          </p>
          <Link
            className="truncate text-[13px] text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={ROUTES.artist(currentTrack.artistId)}
          >
            {artistName}
          </Link>
        </div>
        <LikeTrackButton
          size={22}
          trackId={currentTrack.id}
          trackTitle={currentTrack.title}
        />
      </div>
    </div>
  )
}
