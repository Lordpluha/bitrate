'use client'

import { usePlaylists } from '@entities/Playlist'

import { MusicCardLg } from '@shared/ui'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CustomNextIcon,
  CustomPrevIcon,
} from '@spotify/ui-react'

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
          className="text-gray-400 hover:text-white text-sm font-medium"
          type="button"
        >
          Show all
        </button>
      </div>
      <div className="relative group">
        <Carousel className="w-full" slidesToShow={5}>
          <CarouselPrevious
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background-secondary"
            icon={<CustomPrevIcon />}
          />
          <CarouselNext
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-background-secondary"
            icon={<CustomNextIcon />}
          />
          <CarouselContent className="flex">
            {isPending ? (
              <div className="text-gray-400 p-4">Loading...</div>
            ) : playlists?.length === 0 ? (
              <div className="text-gray-400 p-4">No playlists found</div>
            ) : (
              playlists?.map((playlist) => (
                <CarouselItem className="basis-auto max-w-50" key={playlist.id}>
                  <MusicCardLg
                    description={playlist.description || undefined}
                    id={playlist.id}
                    imageUrl={playlist.cover}
                    isArtist={false}
                    name={playlist.title}
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
