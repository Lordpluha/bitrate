'use client'

import { useAlbums } from '@entities/Album'
import { ROUTES } from '@shared/routes'
import { getAlbumCoverUrl } from '@shared/utils/mediaUrl'
import Image from 'next/image'
import Link from 'next/link'

export const NewAlbums = () => {
  const { data: albums, isPending } = useAlbums({ page: 1, limit: 6 })

  if (isPending) return null

  return (
    <section className="relative mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text">New albums</h2>
      </div>
      {albums?.length === 0 ? (
        <div className="p-4 text-gray-400">No albums found</div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] gap-4">
          {albums?.map((album) => (
            <Link
              className="rounded-lg p-3 transition-colors hover:bg-gray-700/50"
              href={ROUTES.album(album.id)}
              key={album.id}
            >
              <Image
                alt={album.title}
                className="aspect-square w-full rounded-md object-cover"
                height={180}
                src={getAlbumCoverUrl(album.cover)}
                unoptimized
                width={180}
              />
              <h3 className="mt-3 truncate text-sm font-medium text-text">
                {album.title}
              </h3>
              <p className="truncate text-xs text-text-subdued">Album</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
