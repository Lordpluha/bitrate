'use client'

import React, { useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext } from '@spotify/ui-react'
// import { ArrowRightIcon } from '@shared/ui'


const tags = ['Playlists', 'Artists', 'Albums', 'Podcasts']

export const LibraryTags = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className='mt-4'>
      <Carousel
        opts={{
          dragFree: true,
          containScroll: 'trimSnaps',
          align: 'start'
        }}
        showNavigation={true}
        className='w-full'
      >
        <CarouselContent className='gap-2'>
          {tags.map((tag) => (
            <CarouselItem key={tag} className='px-1 basis-auto'>
              <button
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedTags.includes(tag)
                    ? 'bg-white text-black'
                    : 'bg-surface text-white hover:bg-opacity-80'
                }`}
              >
                {tag}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext
          // icon={<ArrowRightIcon />}
          className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-bgSecondary border-none hover:bg-zinc-700 rounded-full'
        />
      </Carousel>
    </div>
  )
}
