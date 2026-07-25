'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { browseCategories } from '@/features/Search/model/search.constants'
import { ROUTES } from '@/shared/routes'

export const BrowseCategoryGrid = () => {
  const router = useRouter()

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold text-text">Browse all</h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-5">
        {browseCategories.map((category) => (
          <button
            className="group relative h-[160px] overflow-hidden rounded-lg p-4 text-left text-2xl font-bold text-white transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            key={category.title}
            onClick={() => router.push(ROUTES.searchCategory(category.title))}
            style={{ backgroundColor: category.color }}
            type="button"
          >
            <span className="absolute left-4 top-4 z-10 block max-w-[72%] leading-tight">
              {category.title}
            </span>
            <Image
              alt=""
              className="absolute -right-6 bottom-0 size-30 rotate-[25deg] overflow-hidden rounded-lg object-cover shadow-xl transition-transform group-hover:scale-105"
              height={96}
              src={category.image}
              unoptimized
              width={96}
            />
          </button>
        ))}
      </div>
    </>
  )
}
