'use client'

import { useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  ArrowRight,
  cn,
} from '@spotify/ui-react'

const tags = ['Playlists', 'Artists', 'Albums', 'Podcasts']

export const LibraryTags = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  return (
    <div className="mt-4">
      <Carousel
        opts={{
          dragFree: true,
          containScroll: 'trimSnaps',
          align: 'start',
        }}
        showNavigation={true}
        className="w-full"
      >
        <CarouselContent className="gap-2">
          {tags.map((tag) => (
            <CarouselItem key={tag} className="px-1 basis-auto">
              <button
                onClick={() => toggleTag(tag)}
                type="button"
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  selectedTags.includes(tag)
                    ? 'bg-white text-black'
                    : 'bg-gray-900/85 text-white hover:bg-opacity-80',
                )}
              >
                {tag}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext
          icon={<ArrowRight />}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 border-none hover:bg-zinc-700 rounded-full"
        />
      </Carousel>
    </div>
  )
}
