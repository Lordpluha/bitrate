'use client'

import { cn } from '@bitrate/ui-react'
import { MediaImage } from '@shared/ui/MediaImage'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import type { Episode } from '@/entities/Podcast'
import { getEpisodeCoverUrl } from '@/shared/utils/mediaUrl'

type EpisodeRowProps = {
  episode: Episode
  isSaved: boolean
  /** Absent for signed-out listeners, who cannot save. */
  onToggleSaved?: () => void
}

const formatMinutes = (duration: number | null) =>
  duration ? `${Math.max(1, Math.round(duration / 60))} min` : null

/** The design's Episode Row: a 72px cover, the title, date and length, the description and save. */
export const EpisodeRow = ({
  episode,
  isSaved,
  onToggleSaved,
}: EpisodeRowProps) => {
  const meta = [
    episode.releaseDate
      ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
          new Date(episode.releaseDate),
        )
      : null,
    formatMinutes(episode.duration),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="flex items-start gap-4 border-b border-border py-4 last:border-0">
      <MediaImage
        alt=""
        className="size-18 shrink-0 rounded-md object-cover"
        fallback="playlist"
        height={72}
        src={getEpisodeCoverUrl(episode.cover)}
        unoptimized
        width={72}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-[family-name:var(--font-landing-body)] text-[15px] font-semibold text-foreground">
          {episode.title}
        </h3>
        {meta ? (
          <p className="text-[13px] text-muted-foreground">{meta}</p>
        ) : null}
        {episode.description ? (
          <p className="line-clamp-2 text-[13px] text-muted-foreground">
            {episode.description}
          </p>
        ) : null}
      </div>
      {onToggleSaved ? (
        <button
          aria-label={`${isSaved ? 'Remove' : 'Save'} ${episode.title}`}
          aria-pressed={isSaved}
          className={cn(
            'mt-1 shrink-0 rounded-full p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isSaved
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={onToggleSaved}
          type="button"
        >
          {isSaved ? (
            <BookmarkCheck aria-hidden="true" size={20} />
          ) : (
            <Bookmark aria-hidden="true" size={20} />
          )}
        </button>
      ) : null}
    </article>
  )
}
