'use client'

import { ArtistName } from '@entities/Artist'
import { MediaImage } from '@shared/ui/MediaImage'
import type { SearchTrackResult } from '@/features/Search'
import { useI18n } from '@/shared/i18n'
import { getTrackCoverUrl } from '@/shared/utils/mediaUrl'

type PlaylistTrackSearchResultProps = {
  addingTrackId: string | null
  onAddTrack: (track: Pick<SearchTrackResult, 'id'>) => void
  track: SearchTrackResult
}

export const PlaylistTrackSearchResult = ({
  addingTrackId,
  onAddTrack,
  track,
}: PlaylistTrackSearchResultProps) => {
  const { t } = useI18n()

  return (
    <li className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-2 rounded px-2 py-2 transition-colors hover:bg-surface sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:gap-3 sm:px-3">
      <MediaImage
        alt=""
        className="h-10 w-10 rounded object-cover"
        fallback="track"
        height={40}
        src={getTrackCoverUrl(track.cover)}
        unoptimized
        width={40}
      />
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{track.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {track.artistName ?? <ArtistName artistId={track.artistId} />}
        </p>
      </div>
      <button
        aria-label={`${t('playlist.add')} ${track.title}`}
        className="rounded-full border border-border px-3 py-1.5 text-sm font-bold text-foreground transition-colors hover:border-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        disabled={addingTrackId === track.id}
        onClick={() => onAddTrack(track)}
        type="button"
      >
        {addingTrackId === track.id ? t('playlist.adding') : t('playlist.add')}
      </button>
    </li>
  )
}
