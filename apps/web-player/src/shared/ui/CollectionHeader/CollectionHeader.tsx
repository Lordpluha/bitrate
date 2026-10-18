'use client'

import { useImageColor } from '@shared/hooks/useImageColor'
import { BackButton } from '@shared/ui/BackButton'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { Fragment, type ReactNode } from 'react'

type CollectionHeaderProps = {
  coverUrl: string
  description?: string | null
  /** "Liked Songs", an album title, a playlist title. */
  title: string
  /** The kind shown above the title: "Playlist", "Album", "Single". */
  type: string
  /** The owner or artist, already linked where it should be. */
  owner: ReactNode
  /** Distinct facts after the owner, each preceded by "·": "24 songs", "1 h 32 min". */
  meta: string[]
}

const brighten = (value: number, amount: number, cap = 255) =>
  Math.min(Math.round(value * amount), cap)
const dim = (value: number, amount: number) => Math.round(value * amount)

/**
 * The design system's Collection Header (playlist, album, Liked Songs): a 200px cover beside the
 * type, an Unbounded title and the owner line, on a wash taken from the cover. Phones stack a
 * 220px cover over the title.
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
  const top = `rgb(${brighten(r, 1.6)}, ${brighten(g, 1.6)}, ${brighten(b, 1.6)})`
  const deep = `rgb(${dim(r, 0.45)}, ${dim(g, 0.45)}, ${dim(b, 0.45)})`

  return (
    <section
      className="relative flex flex-col gap-4 px-4 pt-4 pb-6 text-white md:h-65 md:flex-row md:items-end md:gap-6 md:p-7"
      style={{ background: `linear-gradient(180deg, ${top} 0%, ${deep} 100%)` }}
    >
      <BackButton className="absolute top-4 left-4 flex size-8 items-center justify-center rounded-full bg-black/40 transition-colors hover:bg-black/60 md:top-7 md:left-7">
        <ArrowLeft aria-hidden="true" className="text-white" size={20} />
      </BackButton>

      <div className="flex justify-center pt-8 md:pt-0">
        <Image
          alt=""
          className="size-55 shrink-0 rounded-xl object-cover shadow-2xl md:size-50"
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
        <h1 className="break-words font-[family-name:var(--font-landing-display)] text-2xl leading-tight font-semibold tracking-[-0.4px] md:line-clamp-2 md:text-[64px] md:leading-[1.05] md:font-bold md:tracking-[-0.6px]">
          {title}
        </h1>
        {description ? (
          <p className="line-clamp-2 max-w-180 text-[13px] text-white/70">
            {description}
          </p>
        ) : null}
        <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
          <span className="text-sm font-semibold text-white">{owner}</span>
          {meta.map((item) => (
            <Fragment key={item}>
              <span aria-hidden="true">·</span>
              <span>{item}</span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  )
}
