'use client'

import Image from 'next/image'
import type { TrackEntity } from '@/entities/Track'
import { useI18n } from '@/shared/i18n'
import { getTrackCoverUrl } from '@/shared/utils/mediaUrl'

type PlaylistTrackSearchResultProps = {
  addingTrackId: string | null
  onAddTrack: (track: TrackEntity) => void
  track: TrackEntity
}

export const PlaylistTrackSearchResult = ({
  addingTrackId,
  onAddTrack,
  track,
}: PlaylistTrackSearchResultProps) => {
  const { t } = useI18n()

  return (
    <li className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-2 rounded px-2 py-2 transition-colors hover:bg-white/10 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:gap-3 sm:px-3 min-[861px]:grid-cols-[44px_minmax(0,1.8fr)_minmax(160px,1fr)_auto]">
      <Image
        alt=""
        className="h-10 w-10 rounded object-cover"
        height={40}
        src={getTrackCoverUrl(track.cover)}
        unoptimized
        width={40}
      />
      <div className="min-w-0">
        <p className="truncate font-medium text-text">{track.title}</p>
        <p className="truncate text-sm text-text-subdued">{track.artistId}</p>
      </div>
      <p className="truncate text-sm text-text-subdued max-[860px]:hidden">
        {track.title}
      </p>
      <button
        aria-label={`${t('playlist.add')} ${track.title}`}
        className="rounded-full border border-white/50 px-3 py-1.5 text-sm font-bold text-text transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        disabled={addingTrackId === track.id}
        onClick={() => onAddTrack(track)}
        type="button"
      >
        {addingTrackId === track.id ? t('playlist.adding') : t('playlist.add')}
      </button>
    </li>
  )
}
