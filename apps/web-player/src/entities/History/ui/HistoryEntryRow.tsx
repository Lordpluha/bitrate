import type { ListeningHistoryEntry } from '@entities/History'
import { MediaImage } from '@shared/ui/MediaImage'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { Trash2 } from 'lucide-react'
import { useI18n } from '@/shared/i18n'

type HistoryEntryRowProps = {
  entry: ListeningHistoryEntry
  isRemoving: boolean
  onPlay: (trackId: string) => void
  onRemove: (trackId: string) => void
}

export const HistoryEntryRow = ({
  entry,
  isRemoving,
  onPlay,
  onRemove,
}: HistoryEntryRowProps) => {
  const { t } = useI18n()

  return (
    <li className="group grid min-h-16 grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface">
      <button
        aria-label={t('common.playName', { name: entry.track.title })}
        className="contents text-left"
        onClick={() => onPlay(entry.track.id)}
        type="button"
      >
        <MediaImage
          alt=""
          className="size-11.5 rounded-md object-cover"
          fallback="track"
          height={46}
          src={getTrackCoverUrl(entry.track.cover)}
          unoptimized
          width={46}
        />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-foreground">
            {entry.track.title}
          </span>
          <span className="truncate text-[13px] text-muted-foreground">
            {entry.track.artist?.username ?? entry.track.artistId}
          </span>
        </span>
      </button>
      <button
        aria-label={t('recents.remove', { title: entry.track.title })}
        className="rounded-full p-2 text-muted-foreground opacity-0 transition hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
        disabled={isRemoving}
        onClick={() => onRemove(entry.track.id)}
        type="button"
      >
        <Trash2 aria-hidden="true" size={16} />
      </button>
    </li>
  )
}
