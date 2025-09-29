import React, { useEffect, useState } from 'react'

import { fetchClient } from '@shared/api'
import { CustomNextIcon, CustomPrevIcon } from '@shared/ui'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@spotify/ui'

import { MusicCardLg } from './MusicCardLg'

interface MusicItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

export const PopularArtists: React.FC = () => {
  const [artists, setArtists] = useState<MusicItem[]>([])
  const [loadingArtists, setLoadingArtists] = useState(true)

  const fetchArtists = async () => {
    try {
      setLoadingArtists(true)
      const { data } = await fetchClient.GET('/artists', {
        params: { query: { limit: 20 } }
      })
      if (Array.isArray(data)) {
        const formattedArtists = data.map((artist: any) => ({
          id: artist.id,
          name:
            artist.name || artist.username || artist.title || 'Unknown Artist',
          description: 'Artist',
          imageUrl: artist.imageUrl || artist.avatar || artist.cover
        }))
        setArtists(formattedArtists)
      }
    } catch (error) {
      console.error('Error fetching artists:', error)
    } finally {
      setLoadingArtists(false)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [])

  return (
    <div className='relative mt-8'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-text text-2xl font-bold'>Popular artists</h2>
        <button className='text-gray-400 hover:text-white text-sm font-medium'>
          Show all
        </button>
      </div>
      <div className='relative group'>
        <Carousel
          slidesToShow={5}
          className='w-full'
        >
          <CarouselPrevious
            icon={<CustomPrevIcon />}
            className='absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-gray-600/30 hover:bg-gray-600/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200'
          />
          <CarouselNext
            icon={<CustomNextIcon />}
            className='absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-gray-600/30 hover:bg-gray-600/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200'
          />
          <CarouselContent className='flex'>
            {loadingArtists ? (
              <div className='text-gray-400 p-4'>Loading...</div>
            ) : artists.length === 0 ? (
              <div className='text-gray-400 p-4'>No artists found</div>
            ) : (
              artists.map(artist => (
                <CarouselItem
                  key={artist.id}
                  className='basis-auto max-w-[200px]'
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
