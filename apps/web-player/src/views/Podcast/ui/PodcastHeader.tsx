'use client'

import { MediaImage } from '@shared/ui/MediaImage'
import { Share2 } from 'lucide-react'
import type { PodcastDetail } from '@/entities/Podcast'
import { showApiErrorToast, showApiSuccessToast } from '@/shared/api/feedback'
import { useI18n } from '@/shared/i18n'
import { getPodcastCoverUrl } from '@/shared/utils/mediaUrl'

type PodcastHeaderProps = {
  podcast: PodcastDetail
}

/** The show's cover, title, publisher and facts, and the share button. */
export const PodcastHeader = ({ podcast }: PodcastHeaderProps) => {
  const { t, tp } = useI18n()
  const { total } = podcast.episodes
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      showApiSuccessToast(t('playlist.linkCopied'))
    } catch (error) {
      showApiErrorToast(error, t('playlist.copyFailed'))
    }
  }

  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3.5 md:flex-row md:items-end md:gap-7">
        <MediaImage
          alt=""
          className="size-55 shrink-0 rounded-xl object-cover shadow-2xl md:size-58"
          fallback="playlist"
          height={232}
          priority
          src={getPodcastCoverUrl(podcast.cover)}
          unoptimized
          width={232}
        />
        <div className="flex w-full min-w-0 flex-col gap-1 md:gap-2">
          <p className="text-xs font-semibold tracking-[1.2px] text-muted-foreground uppercase">
            {t('podcast.label')}
          </p>
          <h1 className="break-words text-2xl leading-[1.15] font-semibold md:text-[54px] md:leading-[1.05] md:font-bold">
            {podcast.title}
          </h1>
          <p className="text-sm font-semibold text-foreground">
            {podcast.publisher}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            <span>{tp({ count: total, key: 'podcast.episodeCount' })}</span>
            {podcast.language ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-foreground uppercase">
                {podcast.language}
              </span>
            ) : null}
            {podcast.explicit ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-foreground">
                {t('podcast.explicit')}
              </span>
            ) : null}
          </div>
          {podcast.description ? (
            <p className="line-clamp-3 max-w-180 text-sm text-muted-foreground">
              {podcast.description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          aria-label={t('podcast.share', { title: podcast.title })}
          className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          onClick={() => void copyLink()}
          type="button"
        >
          <Share2 aria-hidden="true" size={18} />
        </button>
      </div>
    </header>
  )
}
