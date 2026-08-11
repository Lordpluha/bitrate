import type { ListeningHistoryEntry } from '@entities/History'
import { getTrackCoverUrl } from '@shared/utils/mediaUrl'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
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
    <li className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-1 py-1 transition-colors hover:bg-white/10 sm:grid-cols-[64px_minmax(0,1fr)_auto]">
      <button
        aria-label={`Play ${entry.track.title}`}
        className="contents text-left"
        onClick={() => onPlay(entry.track.id)}
        type="button"
      >
        <Image
          alt=""
          className="h-13 w-13 rounded object-cover sm:h-16 sm:w-16"
          height={64}
          src={getTrackCoverUrl(entry.track.cover)}
          unoptimized
          width={64}
        />
        <span className="min-w-0">
          <span className="block truncate text-base text-text">
            {entry.track.title}
          </span>
          <span className="block truncate text-sm text-text-subdued">
            {entry.track.artist?.username ?? entry.track.artistId}
          </span>
        </span>
      </button>
      <button
        aria-label={t('recents.remove', { title: entry.track.title })}
        className="rounded-full p-2 text-text-subdued transition-colors hover:text-text"
        disabled={isRemoving}
        onClick={() => onRemove(entry.track.id)}
        type="button"
      >
        <Trash2 aria-hidden="true" size={18} />
      </button>
    </li>
  )
}
