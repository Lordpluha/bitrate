'use client'

import { cn } from '@bitrate/ui-react'
import { type TranslationKey, useI18n } from '@/shared/i18n'
import { Skeleton, TrackRowSkeleton } from '@/shared/ui/Skeleton'

/** The shape of the page body the skeleton stands in for. */
export type PageSkeletonBody =
  | 'cards'
  | 'lines'
  | 'list'
  | 'profile'
  | 'sections'
  | 'tiles'
  | 'tracks'

export type PageSkeletonProps = {
  body: PageSkeletonBody
  /** Announced to assistive tech while the page loads, e.g. `queue.loading`. */
  labelKey: TranslationKey
  /** Draws the segmented tabs row under the title. */
  tabs?: boolean
}

const keys = ({ count, prefix }: { count: number; prefix: string }) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${index}`)

const CARD_KEYS = keys({ count: 10, prefix: 'card' })
const LINE_KEYS = keys({ count: 9, prefix: 'line' })
const LIST_KEYS = keys({ count: 6, prefix: 'list' })
const SECTION_KEYS = keys({ count: 3, prefix: 'section' })
const TAB_KEYS = keys({ count: 3, prefix: 'tab' })
const TILE_KEYS = keys({ count: 4, prefix: 'tile' })
const TRACK_KEYS = keys({ count: 8, prefix: 'track' })

/** Lyric lines of uneven width, like the song text they replace. */
const LINE_WIDTHS = ['w-3/5', 'w-2/5', 'w-1/2', 'w-3/4', 'w-2/5', 'w-3/5']

const Body = ({ body }: { body: PageSkeletonBody }) => {
  switch (body) {
    case 'cards':
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5.5">
          {CARD_KEYS.map((key) => (
            <Skeleton className="aspect-[4/5] rounded-[14px]" key={key} />
          ))}
        </div>
      )
    case 'lines':
      return (
        <div className="flex flex-col gap-4">
          {LINE_KEYS.map((key, line) => (
            <Skeleton
              className={cn(
                'h-6 md:h-8',
                LINE_WIDTHS[line % LINE_WIDTHS.length],
              )}
              key={key}
            />
          ))}
        </div>
      )
    case 'list':
      return (
        <div className="flex flex-col gap-2">
          {LIST_KEYS.map((key) => (
            <Skeleton className="h-16 rounded-[10px]" key={key} />
          ))}
        </div>
      )
    case 'profile':
      return (
        <>
          <div className="flex items-end gap-7 md:py-7">
            <Skeleton className="size-22 rounded-full md:size-45" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-1/2 md:h-16" />
            </div>
          </div>
          <Skeleton className="h-64 rounded-[14px]" />
        </>
      )
    case 'sections':
      return (
        <div className="flex max-w-190 flex-col gap-6">
          {SECTION_KEYS.map((key) => (
            <Skeleton className="h-40 rounded-[14px]" key={key} />
          ))}
        </div>
      )
    case 'tiles':
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4 2xl:grid-cols-4">
            {TILE_KEYS.map((key) => (
              <Skeleton className="h-28 rounded-[14px]" key={key} />
            ))}
          </div>
          <Skeleton className="h-96 rounded-[14px]" />
        </div>
      )
    case 'tracks':
      return (
        <div className="flex flex-col gap-1">
          {TRACK_KEYS.map((key) => (
            <TrackRowSkeleton key={key} />
          ))}
        </div>
      )
  }
}

/**
 * The route-level loading frame of a main-panel page: the title, optional tabs and a body
 * shaped like the page, in the standard gutters.
 */
export const PageSkeleton = ({
  body,
  labelKey,
  tabs = false,
}: PageSkeletonProps) => {
  const { t } = useI18n()
  const label = t(labelKey)

  return (
    <div
      aria-label={label}
      className="flex h-full flex-col gap-7 overflow-hidden px-4 pt-2 md:px-8 md:py-6"
      role="status"
    >
      <span className="sr-only">{label}</span>
      {body !== 'profile' && <Skeleton className="h-8 w-40 md:h-10" />}
      {tabs && (
        <div className="flex gap-2">
          {TAB_KEYS.map((key) => (
            <Skeleton className="h-9 w-24 rounded-full" key={key} />
          ))}
        </div>
      )}
      <Body body={body} />
    </div>
  )
}
