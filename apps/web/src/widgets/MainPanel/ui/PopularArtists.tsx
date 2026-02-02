'use client'

import React from 'react'

import { useQuery } from '@shared/api'
import { CustomNextIcon, CustomPrevIcon } from '@spotify/ui-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@spotify/ui-react'

import { MusicCardLg } from './MusicCardLg'

interface MusicItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

// типизировать дату

export const PopularArtists: React.FC = () => {
  const {
    data,
    isPending: loadingArtists,
    error,
  } = useQuery('get', '/api/v1/artists', {
    params: {
      query: {
        limit: 20
      }
    }
  } as any) // пока оставляем

  const artists: MusicItem[] = Array.isArray(data)
    ? data.map((artist) => ({
        id: artist.id,
        name:
          artist.name || artist.username || artist.title || 'Unknown Artist',
        description: 'Artist',
        imageUrl: artist.imageUrl || artist.avatar || artist.cover,
      }))
    : []

  return (
    <div className="relative mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text text-2xl font-bold">Popular artists</h2>
        <button
          type="button"
          className="text-gray-400 hover:text-white text-sm font-medium"
        >
          Show all
        </button>
      </div>
      <div className="relative group">
        {/* Carousel with navigation */}
        <Carousel slidesToShow={5} className="w-full">
          <CarouselPrevious
            icon={<CustomPrevIcon />}
            className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-bg-secondary'
          />
          <CarouselNext
            icon={<CustomNextIcon />}
            className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-bg-secondary'
          />
          <CarouselContent className="flex">
            {loadingArtists ? (
              <div className="text-gray-400 p-4">Loading...</div>
            ) : artists.length === 0 ? (
              <div className="text-gray-400 p-4">No artists found</div>
            ) : (
              artists.map((artist) => (
                <CarouselItem
                  key={artist.id}
                  className="basis-auto max-w-[200px]"
                >
                  <MusicCardLg
                    id={artist.id}
                    name={artist.name}
                    description={artist.description}
                    imageUrl={artist.imageUrl}
                    isArtist={true}
                  />
                </CarouselItem>
              ))
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}
