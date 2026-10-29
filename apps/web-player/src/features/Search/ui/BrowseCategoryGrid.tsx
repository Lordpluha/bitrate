'use client'

import { Skeleton } from '@shared/ui'
import { useRouter } from 'next/navigation'
import { useBrowseCategories } from '@/entities/Discovery'
import { useI18n } from '@/shared/i18n'
import { ROUTES } from '@/shared/routes'
import { ErrorState } from '@/shared/ui/ErrorState'

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
        className="flex flex-col gap-7"
        role="status"
      >
        <Skeleton className="h-8 w-40 md:h-10" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {BROWSE_CATEGORY_SKELETON_IDS.map((skeletonId) => (
            <Skeleton className="h-24 rounded-xl sm:h-30" key={skeletonId} />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        description="Something went wrong while searching. Try again in a moment."
        onRetry={() => void refetch()}
        title="Search is unavailable"
      />
    )
  }

  const categories = data.data

  return (
    <>
      <h1 className="mb-7 text-2xl font-bold text-foreground md:text-[32px] md:leading-[1.1]">
        {t('search.browseAll')}
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category) => (
          <button
            className="group relative flex h-24 items-start overflow-hidden rounded-xl p-4 text-left font-[family-name:var(--font-landing-display)] text-lg font-bold text-white transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-30 sm:text-xl"
            key={category.id}
            onClick={() => router.push(ROUTES.searchCategory(category.slug))}
            style={{
              backgroundColor: category.color ?? 'var(--color-surface)',
            }}
            type="button"
          >
            <span className="relative z-10 block max-w-[72%] leading-tight">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
