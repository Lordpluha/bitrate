'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useBrowseCategories } from '@/entities/Discovery'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { ErrorState } from '@/shared/ui/ErrorState'
import { getPlaylistCoverUrl } from '@/shared/utils/mediaUrl'

const BROWSE_CATEGORY_SKELETON_IDS = [
  'browse-category-skeleton-1',
  'browse-category-skeleton-2',
  'browse-category-skeleton-3',
  'browse-category-skeleton-4',
  'browse-category-skeleton-5',
  'browse-category-skeleton-6',
  'browse-category-skeleton-7',
  'browse-category-skeleton-8',
] as const

export const BrowseCategoryGrid = () => {
  const { t } = useI18n()
  const router = useRouter()
  const { data, isPending, isError, refetch } = useBrowseCategories()

  if (isPending) {
    return (
      <div
        aria-label="Loading browse categories"
        className="space-y-5"
        role="status"
      >
        <div className="h-8 w-40 animate-pulse rounded bg-surface" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] sm:gap-5">
          {BROWSE_CATEGORY_SKELETON_IDS.map((skeletonId) => (
            <div
              className="h-36 animate-pulse rounded-lg bg-surface sm:h-40"
              key={skeletonId}
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        description="Browse categories could not be loaded from the server."
        onRetry={() => void refetch()}
        title="Browse is unavailable"
      />
    )
  }

  const categories = data.data

  return (
    <>
      <h1 className="mb-5 text-2xl font-bold text-text">
        {t('search.browseAll')}
      </h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,160px),1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] sm:gap-5">
        {categories.map((category) => (
          <button
            className="group relative h-36 overflow-hidden rounded-lg p-4 text-left text-xl font-bold text-white transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-40 sm:text-2xl"
            key={category.id}
            onClick={() => router.push(ROUTES.searchCategory(category.slug))}
            style={{
              backgroundColor: category.color ?? 'var(--color-surface)',
            }}
            type="button"
          >
            <span className="absolute left-4 top-4 z-10 block max-w-[72%] leading-tight">
              {category.name}
            </span>
            <Image
              alt=""
              className="absolute -right-4 bottom-0 size-28 rotate-[25deg] overflow-hidden rounded-lg object-cover shadow-xl transition-transform group-hover:scale-105 sm:-right-6 sm:size-30"
              height={96}
              src={getPlaylistCoverUrl(category.cover)}
              unoptimized
              width={96}
            />
          </button>
        ))}
      </div>
    </>
  )
}
