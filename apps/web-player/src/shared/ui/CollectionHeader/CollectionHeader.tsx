'use client'

import { useImageColor } from '@shared/hooks/useImageColor'
import { BackButton } from '@shared/ui/BackButton'
import { MediaImage } from '@shared/ui/MediaImage'
import { ArrowLeft } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

type CollectionHeaderProps = {
  coverUrl: string
  description?: string | null
  /** "Liked Songs", an album title, a playlist title. */
  title: string
  /** The kind shown above the title: "Playlist", "Album", "Single". */
  type: string
  /** The owner or artist, already linked where it should be. */
  owner: ReactNode
  /** Facts after the owner, joined as "· 24 songs, 1 h 32 min". */
  meta: string[]
}

/** How much of the cover colour the wash starts from; the design's #4C1D95 over a violet cover. */
const WASH_STRENGTH = 0.75
const dim = (value: number) => Math.round(value * WASH_STRENGTH)

/**
 * The design system's Collection Header (playlist, album, Liked Songs): a 200px cover beside the
 * type, an Unbounded title and the owner line, on a rounded wash running from the cover's colour
 * into the card surface. Phones stack a 220px cover over the title, without the wash.
 */
export const CollectionHeader = ({
  coverUrl,
  description,
  meta,
  owner,
  title,
  type,
}: CollectionHeaderProps) => {
  const [r, g, b] = useImageColor(coverUrl)
  const wash = {
    '--collection-wash': `linear-gradient(180deg, rgb(${dim(r)}, ${dim(g)}, ${dim(b)}) 0%, var(--color-card) 100%)`,
  } as CSSProperties

  return (
    <section
      className="relative flex flex-col gap-5 md:h-65 md:flex-row md:items-end md:gap-6 md:rounded-2xl md:bg-(image:--collection-wash) md:p-7 md:text-white"
      style={wash}
    >
      <BackButton className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full bg-black/40 transition-colors hover:bg-black/60 md:top-7 md:left-7">
        <ArrowLeft aria-hidden="true" className="text-white" size={20} />
      </BackButton>

      <div className="flex justify-center">
        <MediaImage
          alt=""
          className="size-55 shrink-0 rounded-xl object-cover shadow-2xl md:size-50"
          fallback="playlist"
          height={220}
          priority
          src={coverUrl}
          unoptimized
          width={220}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-1 md:gap-2.5">
        <span className="hidden text-[13px] font-semibold md:block">
          {type}
        </span>
        <h1 className="break-words font-[family-name:var(--font-landing-display)] text-2xl leading-[1.25] font-semibold md:line-clamp-2 md:text-[64px] md:leading-[1.05] md:font-bold md:tracking-[-0.6px]">
          {title}
        </h1>
        {description ? (
          <p className="line-clamp-2 max-w-180 text-[13px] text-muted-foreground md:text-white/70">
            {description}
          </p>
        ) : null}
        <p className="flex flex-wrap items-center gap-1 text-[13px] text-muted-foreground md:gap-2">
          <span className="md:text-sm md:font-semibold md:text-white">
            {owner}
          </span>
          {meta.length > 0 ? <span>· {meta.join(', ')}</span> : null}
        </p>
      </div>
    </section>
  )
}
