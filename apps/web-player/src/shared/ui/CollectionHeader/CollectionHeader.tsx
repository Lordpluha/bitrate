'use client'

import { useImageColor } from '@shared/hooks/useImageColor'
import { MediaImage } from '@shared/ui/MediaImage'
import type { CSSProperties, ReactNode } from 'react'

type CollectionHeaderProps = {
  /** Leave out for a header without artwork (a genre page). */
  coverUrl?: string
  description?: string | null
  /** "Liked Songs", an album title, a playlist title. */
  title: string
  /** The kind shown above the title: "Playlist", "Album", "Single". */
  type: string
  /** The owner or artist, already linked where it should be. */
  owner?: ReactNode
  /** The wash's starting colour when there is no cover to take it from (a genre's colour). */
  washColor?: string
  /** Facts after the owner, joined as "· 24 songs, 1 h 32 min". */
  meta: string[]
}

/** How much of the cover colour the wash starts from; the design's #4C1D95 over a violet cover. */
const WASH_STRENGTH = 0.75
const dim = (value: number) => Math.round(value * WASH_STRENGTH)

/**
 * The design system's Collection Header (playlist, album, Liked Songs): a 200px cover beside the
 * type, an Unbounded title and the owner line, on a rounded wash running from the cover's colour
 * into the card surface. Phones stack a 220px cover over the title, without the wash. It has no
 * Back button: the design has none on desktop, and phones show it in the mobile header.
 */
export const CollectionHeader = ({
  coverUrl,
  description,
  meta,
  owner,
  title,
  type,
  washColor,
}: CollectionHeaderProps) => {
  const [r, g, b] = useImageColor(coverUrl)
  const washStart = washColor ?? `rgb(${dim(r)}, ${dim(g)}, ${dim(b)})`
  const wash = {
    '--collection-wash': `linear-gradient(180deg, ${washStart} 0%, var(--color-card) 100%)`,
  } as CSSProperties

  return (
    <section
      className="flex flex-col gap-5 md:h-65 md:flex-row md:items-end md:gap-6 md:rounded-2xl md:bg-(image:--collection-wash) md:p-7 md:text-white"
      style={wash}
    >
      {coverUrl ? (
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
      ) : null}

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
          {owner ? (
            <span className="md:text-sm md:font-semibold md:text-white">
              {owner}
            </span>
          ) : null}
          {meta.length > 0 ? (
            <span>
              {owner ? '· ' : null}
              {meta.join(', ')}
            </span>
          ) : null}
        </p>
      </div>
    </section>
  )
}
