'use client'

import { cn } from '@bitrate/ui-react'
import { MediaImage } from '@shared/ui/MediaImage'
import { Play } from 'lucide-react'
import Link from 'next/link'
import type { TopResultCard } from '@/features/Search/lib/topResultCard'

type SearchTopResultProps = {
  card: TopResultCard
  onPlay?: () => void
}

/** The design's "Top result" panel: a 96px cover, the title and what kind of result it is. */
export const SearchTopResult = ({ card, onPlay }: SearchTopResultProps) => (
  <section className="flex min-w-0 flex-col gap-3">
    <h2 className="text-[19px] leading-[1.25] font-semibold">Top result</h2>
    <div className="group/top relative flex flex-col gap-4 rounded-[14px] border border-border bg-card p-6 transition-colors hover:bg-secondary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
      <MediaImage
        alt=""
        className={cn(
          'size-24 object-cover shadow-lg',
          card.round ? 'rounded-full' : 'rounded-lg',
        )}
        fallback={card.round ? 'artist' : 'track'}
        height={96}
        src={card.image}
        unoptimized
        width={96}
      />
      <div className="flex min-w-0 flex-col gap-2">
        {card.href ? (
          <Link
            className="truncate font-[family-name:var(--font-landing-display)] text-2xl leading-[1.25] font-semibold outline-none after:absolute after:inset-0 after:rounded-[14px]"
            href={card.href}
          >
            {card.title}
          </Link>
        ) : (
          <p className="truncate font-[family-name:var(--font-landing-display)] text-2xl leading-[1.25] font-semibold">
            {card.title}
          </p>
        )}
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-foreground">
            {card.kind}
          </span>
          {card.subtitle ? (
            <span className="truncate text-[13px] text-muted-foreground">
              {card.subtitle}
            </span>
          ) : null}
        </div>
      </div>
      {onPlay ? (
        <button
          aria-label={`Play ${card.title}`}
          className="absolute right-6 bottom-6 z-10 flex size-12 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition duration-300 group-hover/top:translate-y-0 group-hover/top:opacity-100 hover:scale-105 focus-visible:translate-y-0 focus-visible:opacity-100"
          onClick={onPlay}
          type="button"
        >
          <Play
            aria-hidden="true"
            className="ml-0.5"
            fill="currentColor"
            size={20}
          />
        </button>
      ) : null}
    </div>
  </section>
)
