'use client'

import { RollupIcon } from '@bitrate/ui-react'
import { useArtist } from '@entities/Artist'
import {
  selectCurrentPlaylistName,
  selectCurrentTrack,
  usePlayerStore,
} from '@entities/Player'
import { useTrackLike } from '@entities/Track'
import { showApiErrorToast } from '@shared/api/feedback'
import { ROUTES } from '@shared/routes'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type CurrentPlaylistProps = {
  onCollapse?: () => void
}

export const CurrentPlaylist = ({ onCollapse }: CurrentPlaylistProps) => {
  const currentTrack = usePlayerStore(selectCurrentTrack)
  const playlistName = usePlayerStore(selectCurrentPlaylistName)
  const { data: artist } = useArtist(currentTrack?.artistId)
  const artistName = artist?.username || 'Unknown Artist'
  const { isLiked, isPending, toggleLike } = useTrackLike(currentTrack?.id)

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
            {playlistName ? `Now playing · ${playlistName}` : 'Now playing'}
          </h2>
        </div>
        {onCollapse && (
          <button
            aria-label="Collapse sidebar"
            className="flex size-7 shrink-0 items-center justify-center rounded-[7px] border border-primary bg-secondary text-accent transition-colors hover:bg-surface"
            onClick={onCollapse}
            type="button"
          >
            <RollupIcon height={14} primaryColor="currentColor" width={14} />
          </button>
        )}
      </div>
      <div className="relative aspect-square w-full">
        <Image
          alt={currentTrack.title}
          className="rounded-md object-cover"
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
        <button
          aria-label={
            isLiked
              ? `Remove ${currentTrack.title} from Liked Songs`
              : `Save ${currentTrack.title} to Liked Songs`
          }
          aria-pressed={isLiked}
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          disabled={isPending}
          onClick={() =>
            void toggleLike().catch((error: unknown) =>
              showApiErrorToast(error, 'Unable to update Liked Songs.'),
            )
          }
          type="button"
        >
          <Heart
            aria-hidden="true"
            className={isLiked ? 'fill-accent text-accent' : undefined}
            size={22}
          />
        </button>
      </div>
    </div>
  )
}
