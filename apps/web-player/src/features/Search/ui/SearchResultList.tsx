'use client'

import { cn } from '@bitrate/ui-react'
import { MediaImage } from '@shared/ui/MediaImage'
import Link from 'next/link'
import { ArtistLink } from '@/entities/Artist'
import type { SearchResultRow } from '@/features/Search/model/types'

type SearchResultListProps = {
  items: SearchResultRow[]
  /** Plays a song row; other rows open their page. */
  onPlayRow?: (row: SearchResultRow) => void
}

const rowClassName =
  'group grid h-16 w-full grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-surface'

const RowContent = ({ item }: { item: SearchResultRow }) => (
  <>
    <MediaImage
      alt=""
      className={cn(
        'size-12 object-cover',
        item.circularImage ? 'rounded-full' : 'rounded-md',
      )}
      fallback={item.circularImage ? 'artist' : 'track'}
      height={48}
      src={item.image}
      unoptimized
      width={48}
    />
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm font-semibold text-foreground">
        {item.title}
      </span>
      <span className="truncate text-[13px] text-muted-foreground">
        {item.artistId ? (
          <ArtistLink artistId={item.artistId} />
        ) : (
          item.subtitle
        )}
      </span>
    </span>
    <span className="justify-self-end rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
      {item.kind}
    </span>
  </>
)

/** Search results as list rows: a 48px cover, title and subtitle, and the kind of result. */
export const SearchResultList = ({
  items,
  onPlayRow,
}: SearchResultListProps) => (
  <ul className="flex flex-col">
    {items.map((item) => (
      <li key={`${item.kind}-${item.id}`}>
        {item.playKind && onPlayRow ? (
          <button
            aria-label={`Play ${item.title}`}
            className={rowClassName}
            onClick={() => onPlayRow(item)}
            type="button"
          >
            <RowContent item={item} />
          </button>
        ) : item.href ? (
          <Link className={rowClassName} href={item.href}>
            <RowContent item={item} />
          </Link>
        ) : (
          <div className={rowClassName}>
            <RowContent item={item} />
          </div>
        )}
      </li>
    ))}
  </ul>
)
