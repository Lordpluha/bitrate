import React from 'react'

import { useQuery } from '@shared/api'
import { CustomNextIcon, CustomPrevIcon } from '@spotify/ui-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@spotify/ui-react'

import { MusicCardLg } from './MusicCardLg'

interface MusicItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

export const PopularPlaylists: React.FC = () => {
  const { data, isPending: loadingPlaylists, error } = useQuery('get', '/playlists', {
    params: {
      query: {
        page: 1,
        limit: 3
      }
    }
  } as any)

  const playlists: MusicItem[] = Array.isArray(data) 
    ? data.map((playlist) => ({
        id: playlist.id,
        name: playlist.title,
        description:
          playlist.description ||
          `Playlist • ${playlist.user?.username || 'Unknown'}`,
        imageUrl: playlist.cover
      }))
    : []

  return (
    <div className='relative mt-8'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-text text-2xl font-bold'>Popular playlists</h2>
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
            {loadingPlaylists ? (
              <div className='text-gray-400 p-4'>Loading...</div>
            ) : playlists.length === 0 ? (
              <div className='text-gray-400 p-4'>No playlists found</div>
            ) : (
              playlists.map(playlist => (
                <CarouselItem
                  key={playlist.id}
                  className='basis-auto max-w-[200px]'
                >
                  <MusicCardLg
                    id={playlist.id}
                    name={playlist.name}
                    description={playlist.description}
                    imageUrl={playlist.imageUrl}
                    isArtist={false}
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
