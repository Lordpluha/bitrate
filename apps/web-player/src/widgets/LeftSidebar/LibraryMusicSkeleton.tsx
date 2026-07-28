import { cn } from '@spotify/ui-react'
import type { ReactNode } from 'react'

const loadingItemKeys = Array.from(
  { length: 10 },
  (_, index) => `loading-${index + 1}`,
)

type LibraryMusicSkeletonProps = {
  isCollapsed: boolean
  isExpanded: boolean
}

export const LibraryMusicSkeleton = ({
  isCollapsed,
  isExpanded,
}: LibraryMusicSkeletonProps) => (
  <LibraryMusicContainer isCollapsed={isCollapsed} isExpanded={isExpanded}>
    {loadingItemKeys.map((key) => (
      <div
        className={cn(
          isExpanded && 'rounded-lg p-3',
          isCollapsed && 'h-14 w-14 rounded-md',
          !isExpanded &&
            !isCollapsed &&
            'flex items-center gap-3 rounded-md p-2',
        )}
        key={key}
      >
        <div
          className={cn(
            'animate-pulse rounded-md bg-gray-600',
            isExpanded && 'aspect-square w-full',
            isCollapsed && 'h-14 w-14',
            !isExpanded && !isCollapsed && 'h-12 w-12',
          )}
        />
        <div className={isExpanded ? 'mt-3' : 'flex-1'}>
          <div className="mb-1 h-4 animate-pulse rounded bg-gray-600" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
    ))}
  </LibraryMusicContainer>
)

type LibraryMusicContainerProps = LibraryMusicSkeletonProps & {
  children: ReactNode
}

export const LibraryMusicContainer = ({
  children,
  isCollapsed,
  isExpanded,
}: LibraryMusicContainerProps) => (
  <div className="mt-4 flex-1 overflow-hidden">
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <div
        className={cn(
          isExpanded &&
            'grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 pb-4',
          isCollapsed && 'flex flex-col items-center gap-3 pb-4',
          !isExpanded && !isCollapsed && 'space-y-0.5 pb-4',
        )}
      >
        {children}
      </div>
    </div>
  </div>
)
