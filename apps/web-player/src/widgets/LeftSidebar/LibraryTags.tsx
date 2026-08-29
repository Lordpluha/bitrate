'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  cn,
} from '@spotify/ui-react'
import type { LibraryItemType } from '@/widgets/LeftSidebar/model/library.types'

type LibraryTag = {
  label: string
  type: LibraryItemType
}

/**
 * Only kinds the library can actually list appear here. An "Albums" chip used
 * to sit alongside these, but the API exposes no per-user saved-album list, so
 * it could only ever have filtered down to nothing.
 */
const tags: LibraryTag[] = [
  { label: 'Playlists', type: 'playlist' },
  { label: 'Artists', type: 'artist' },
  { label: 'Podcasts', type: 'podcast' },
]

type LibraryTagsProps = {
  onToggle: (type: LibraryItemType) => void
  selectedTypes: LibraryItemType[]
}

export const LibraryTags = ({ onToggle, selectedTypes }: LibraryTagsProps) => (
  <div className="mt-4">
    <Carousel
      className="w-full"
      opts={{
        dragFree: true,
        containScroll: 'trimSnaps',
        align: 'start',
      }}
      showNavigation={true}
    >
      <CarouselContent className="gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTypes.includes(tag.type)

          return (
            <CarouselItem className="px-1 basis-auto" key={tag.type}>
              <button
                aria-pressed={isSelected}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  isSelected
                    ? 'bg-text text-background'
                    : 'bg-surface text-text hover:bg-surface-hover',
                )}
                onClick={() => onToggle(tag.type)}
                type="button"
              >
                {tag.label}
              </button>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 border-none hover:bg-surface-hover rounded-full" />
    </Carousel>
  </div>
)
