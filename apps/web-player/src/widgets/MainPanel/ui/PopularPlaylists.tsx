'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CustomNextIcon,
  CustomPrevIcon,
} from '@spotify/ui-react'

import { MusicCardLg } from '@shared/ui'
import { usePlaylists } from '@entities/Playlist'

export const PopularPlaylists = () => {
  const { data: playlists, isPending } = usePlaylists(1, 3)

  if (isPending) {
    return null
  }

  return (
    <div className="relative mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-text text-2xl font-bold">Popular playlists</h2>
        <button
          type="button"
          className="text-gray-400 hover:text-white text-sm font-medium"
        >
          Show all
        </button>
      </div>
      <div className="relative group">
        <Carousel slidesToShow={5} className="w-full">
          <CarouselPrevious
            icon={<CustomPrevIcon />}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background-secondary"
          />
          <CarouselNext
            icon={<CustomNextIcon />}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background-secondary"
          />
          <CarouselContent className="flex">
            {isPending ? (
              <div className="text-gray-400 p-4">Loading...</div>
            ) : playlists?.length === 0 ? (
              <div className="text-gray-400 p-4">No playlists found</div>
            ) : (
              playlists?.map((playlist) => (
                <CarouselItem key={playlist.id} className="basis-auto max-w-50">
                  <MusicCardLg
                    id={playlist.id}
                    name={playlist.title}
                    description={playlist.description || undefined}
                    imageUrl={playlist.cover}
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
